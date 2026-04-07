import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Modal, Pill, Tearsheet, Typography } from "@procore/core-react";
import { ChevronDown, ChevronRight, EllipsisVertical, Cog, EyeOff, Grip } from "@procore/core-icons";
import { createGlobalStyle } from "styled-components";
import HubCardFrame from "@/components/hubs/HubCardFrame";
import { projects as seedProjects } from "@/data/seed/projects";
import { actionPlans } from "@/data/seed/action_plans";
import { actionPlanTemplates } from "@/data/seed/action_plan_types";
import type { Project } from "@/types/project";
import type { ActionPlan } from "@/types/action_plans";

const TearsheetWide = createGlobalStyle`
  .sc-ljrxoq-1 {
    flex: 0 0 80vw !important;
    max-width: 960px !important;
  }
`;

// ─── Template column names (from account-level templates) ───────────────────

const AP_TEMPLATE_COLUMNS = actionPlanTemplates.map((t) => t.name);

// ─── Cell computation from real seed data ───────────────────────────────────

type CellKind = "empty" | "progress";

interface MatrixCell {
  kind: CellKind;
  percent: number;
  overdue: boolean;
  plan: ActionPlan | null;
}

function computeCell(projectId: string, templateName: string): MatrixCell {
  const template = actionPlanTemplates.find((t) => t.name === templateName);
  if (!template) return { kind: "empty", percent: 0, overdue: false, plan: null };

  const plan = actionPlans.find(
    (p) => p.projectId === projectId && p.typeId === template.typeId
  );
  if (!plan) return { kind: "empty", percent: 0, overdue: false, plan: null };

  const allItems = plan.sections.flatMap((s) => s.items);
  const total = allItems.length;
  if (total === 0) return { kind: "progress", percent: 0, overdue: false, plan };

  const closed = allItems.filter((i) => i.status === "closed").length;
  const percent = Math.round((closed / total) * 100);
  const now = new Date();
  const overdue = allItems.some(
    (i) => i.status !== "closed" && i.dueDate && i.dueDate < now
  );

  return { kind: "progress", percent, overdue, plan };
}

function barColor(cell: MatrixCell): string {
  if (cell.kind === "empty") return "#eceff1";
  if (cell.percent >= 100) return "#2e7d32";
  if (cell.overdue) return "#c62828";
  if (cell.percent > 0) return "#1565c0";
  return "#9e9e9e";
}

type StagePillColor = "blue" | "green" | "red" | "yellow" | "gray" | "magenta" | "cyan";
function stagePillColor(stage: string): StagePillColor {
  if (stage === "closeout" || stage === "maintenance") return "gray";
  if (stage === "course_of_construction") return "blue";
  if (stage === "post_construction" || stage === "handover") return "green";
  if (stage === "permitting" || stage === "bidding") return "yellow";
  if (stage === "conceptual" || stage === "feasibility") return "magenta";
  return "cyan";
}

function stageLabel(stage: string): string {
  const labels: Record<string, string> = {
    conceptual: "Conceptual",
    feasibility: "Feasibility",
    final_design: "Final Design",
    permitting: "Permitting",
    bidding: "Bidding",
    pre_construction: "Pre-Construction",
    course_of_construction: "Course of Construction",
    post_construction: "Post-Construction",
    handover: "Handover",
    closeout: "Closeout",
    maintenance: "Maintenance",
  };
  return labels[stage] ?? stage;
}

// ─── Seed projects with action plans ──────────────────────────────────────────

function useActionPlanProjects(): Project[] {
  return useMemo(() => {
    const idsWithPlans = new Set(actionPlans.map((ap) => ap.projectId));
    return seedProjects.filter((p) => idsWithPlans.has(p.id));
  }, []);
}

// ─── ProgressMiniBar ─────────────────────────────────────────────────────────

function ProgressMiniBar({ cell }: { cell: MatrixCell }) {
  if (cell.kind === "empty") {
    return (
      <Typography intent="small" style={{ color: "#6a767c", fontSize: 11, lineHeight: 1.3 }}>
        No Action Plan created.
      </Typography>
    );
  }
  return (
    <div style={{ width: "100%", minWidth: 72 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: barColor(cell), marginBottom: 3 }}>
        {cell.percent}%
      </div>
      <div style={{ height: 8, borderRadius: 4, background: "#eceff1", overflow: "hidden" }}>
        <div
          style={{
            width: `${cell.percent}%`,
            height: "100%",
            background: barColor(cell),
            transition: "width 0.2s ease",
          }}
        />
      </div>
    </div>
  );
}

// ─── Detail tearsheet ────────────────────────────────────────────────────────

interface ActionPlanDetailTearsheetProps {
  open: boolean;
  onClose: () => void;
  project: Project | null;
  templateName: string;
  cell: MatrixCell | null;
}

function ActionPlanDetailTearsheet({ open, onClose, project, templateName, cell }: ActionPlanDetailTearsheetProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const plan = cell?.plan ?? null;

  // Open first section by default when plan changes
  useEffect(() => {
    if (plan) {
      const init: Record<string, boolean> = {};
      plan.sections.forEach((s, i) => { init[s.id] = i === 0; });
      setOpenSections(init);
    }
  }, [plan]);

  const toggle = (id: string) => setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));

  if (!project || !cell || cell.kind === "empty" || !plan) return null;

  const statusColor = (s: string) =>
    s === "closed" ? "#2e7d32" : s === "delayed" ? "#c62828" : s === "in_progress" ? "#1565c0" : "#6a767c";

  const statusLabel = (s: string) =>
    s === "closed" ? "Closed" : s === "delayed" ? "Delayed" : s === "in_progress" ? "In Progress" : "Open";

  return (
    <>
      <TearsheetWide />
      <Tearsheet open={open} onClose={onClose} aria-label="Action plan detail" placement="right" block>
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ padding: "16px 20px 14px", borderBottom: "1px solid #d6dadc", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Typography intent="small" style={{ color: "#6a767c", fontWeight: 500 }}>{project.number}</Typography>
              <span style={{ color: "#d6dadc" }}>·</span>
              <Pill color={stagePillColor(project.stage)}>{stageLabel(project.stage)}</Pill>
            </div>
            <Typography intent="h2" style={{ fontWeight: 700, color: "#232729", display: "block" }}>
              {templateName}
            </Typography>
            <Typography intent="small" style={{ color: "#6a767c", display: "block", marginTop: 4 }}>
              {project.name}
            </Typography>
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, maxWidth: 320, height: 8, borderRadius: 4, background: "#eceff1", overflow: "hidden" }}>
                <div style={{ width: `${cell.percent}%`, height: "100%", borderRadius: 4, background: barColor(cell), transition: "width 0.2s ease" }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: barColor(cell) }}>{cell.percent}% complete</span>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
            {plan.sections.map((section) => (
              <div key={section.id} style={{ border: "1px solid #d6dadc", borderRadius: 8, marginBottom: 10, overflow: "hidden" }}>
                <button
                  type="button"
                  onClick={() => toggle(section.id)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 14px", background: "#f5f6f7", border: "none", cursor: "pointer",
                    fontWeight: 600, fontSize: 13, color: "#232729", textAlign: "left", fontFamily: "inherit",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {openSections[section.id] ? <ChevronDown size="sm" /> : <ChevronRight size="sm" />}
                    {section.title}
                  </span>
                  <span style={{ fontSize: 12, color: "#6a767c", fontWeight: 400 }}>{section.items.length} items</span>
                </button>
                {openSections[section.id] && (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <tbody>
                      {section.items.map((item) => (
                        <tr key={item.id} style={{ borderTop: "1px solid #eef0f1" }}>
                          <td style={{ padding: "9px 14px", color: "#232729" }}>{item.title}</td>
                          <td style={{ padding: "9px 14px", textAlign: "right", whiteSpace: "nowrap" }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: statusColor(item.status) }}>
                              {statusLabel(item.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </div>
        </div>
      </Tearsheet>
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Card 1: Portfolio Action Plans Matrix
// ═════════════════════════════════════════════════════════════════════════════

export function ActionPlansPortfolioMatrixHubCard() {
  const allSeedProjects = useActionPlanProjects();
  const matrixProjects = allSeedProjects.slice(0, 7);
  const [detail, setDetail] = useState<{ project: Project; template: string; cell: MatrixCell } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
          btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") { setMenuOpen(false); btnRef.current?.focus(); }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  const [activeTemplates, setActiveTemplates] = useState(AP_TEMPLATE_COLUMNS.slice());
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  function handleDragStart(idx: number) { dragItem.current = idx; }
  function handleDragEnter(idx: number) { dragOverItem.current = idx; }
  function handleDragEnd() {
    if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) {
      dragItem.current = null; dragOverItem.current = null; return;
    }
    setActiveTemplates((prev) => {
      const next = [...prev];
      const [removed] = next.splice(dragItem.current!, 1);
      next.splice(dragOverItem.current!, 0, removed);
      return next;
    });
    dragItem.current = null; dragOverItem.current = null;
  }

  const matrix = useMemo(() => {
    return matrixProjects.map((p) => ({
      project: p,
      cells: activeTemplates.map((t) => computeCell(p.id, t)),
    }));
  }, [matrixProjects, activeTemplates]);

  if (hidden) return null;

  return (
    <>
      <HubCardFrame
        title="Action Plans — portfolio matrix"
        infoTooltip="Rows = Hub-scoped projects; columns = account-level Action Plan templates; cells show % of items closed. Green = complete, red = overdue, blue = in progress, gray = not started."
        actions={
          <div style={{ position: "relative" }}>
            <Button
              ref={btnRef as React.RefObject<HTMLButtonElement>}
              variant="tertiary"
              size="sm"
              icon={<EllipsisVertical size="sm" />}
              aria-label="Card actions"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((prev) => !prev)}
            />
            {menuOpen && (
              <div
                ref={menuRef}
                role="menu"
                style={{
                  position: "absolute", top: "100%", right: 0, marginTop: 4,
                  minWidth: 180, background: "#fff", border: "1px solid #d6dadc",
                  borderRadius: 6, boxShadow: "0 4px 16px -2px rgba(0,0,0,0.15)", zIndex: 10, overflow: "hidden",
                }}
              >
                <button type="button" role="menuitem"
                  onClick={() => { setMenuOpen(false); setConfigOpen(true); }}
                  style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#232729", fontFamily: "inherit", textAlign: "left" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f6f7")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                >
                  <Cog size="sm" />
                  Configure
                </button>
                <div style={{ height: 1, background: "#eef0f1" }} />
                <button type="button" role="menuitem"
                  onClick={() => { setMenuOpen(false); setHidden(true); }}
                  style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#232729", fontFamily: "inherit", textAlign: "left" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f6f7")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                >
                  <EyeOff size="sm" />
                  Hide Card
                </button>
              </div>
            )}
          </div>
        }
      >
        <div style={{ overflowX: "auto", margin: "-4px 0 0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 520 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid #d6dadc", color: "#6a767c", whiteSpace: "nowrap" }}>Project</th>
                <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid #d6dadc", color: "#6a767c", whiteSpace: "nowrap" }}>Stage</th>
                {activeTemplates.map((t) => (
                  <th key={t} style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid #d6dadc", color: "#6a767c", minWidth: 120 }}>{t}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map(({ project, cells }, rowIdx) => (
                <tr key={project.id} style={{ background: rowIdx % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={{ padding: "7px 8px", borderBottom: "1px solid #eef0f1", fontWeight: 600, color: "#232729" }}>{project.number}</td>
                  <td style={{ padding: "7px 8px", borderBottom: "1px solid #eef0f1", whiteSpace: "nowrap" }}>
                    <Pill color={stagePillColor(project.stage)}>{stageLabel(project.stage)}</Pill>
                  </td>
                  {cells.map((cell, ci) => (
                    <td key={activeTemplates[ci]} style={{ padding: "7px 8px", borderBottom: "1px solid #eef0f1", verticalAlign: "middle" }}>
                      {cell.kind === "progress" ? (
                        <button
                          type="button"
                          onClick={() => setDetail({ project, template: activeTemplates[ci], cell })}
                          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", width: "100%", textAlign: "left" }}
                          aria-label={`Open ${activeTemplates[ci]} for ${project.name}`}
                        >
                          <ProgressMiniBar cell={cell} />
                        </button>
                      ) : (
                        <ProgressMiniBar cell={cell} />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </HubCardFrame>

      <ActionPlanDetailTearsheet
        open={detail !== null}
        onClose={() => setDetail(null)}
        project={detail?.project ?? null}
        templateName={detail?.template ?? ""}
        cell={detail?.cell ?? null}
      />

      <Modal open={configOpen} onClose={() => setConfigOpen(false)} aria-label="Configure Action Plan columns" howToClose={["x", "scrim"]} role="dialog">
        <Modal.Header>Configure Action Plan columns</Modal.Header>
        <Modal.Body>
          <Typography intent="small" style={{ color: "#6a767c", marginBottom: 16, lineHeight: 1.45, display: "block" }}>
            Select which Action Plan templates appear as columns and set the order to match your gate sequence.
          </Typography>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {activeTemplates.map((label, i) => (
              <div
                key={label}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragEnter={() => handleDragEnter(i)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", border: "1px solid #d6dadc", borderRadius: 6, background: "#fff", cursor: "grab" }}
              >
                <span style={{ color: "#9ea7ac", display: "flex", alignItems: "center" }}><Grip size="sm" /></span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#6a767c", width: 22 }}>{i + 1}</span>
                <Pill color="gray">{label}</Pill>
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="secondary" onClick={() => setConfigOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setConfigOpen(false)}>Save</Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Card 2: Template Adoption Overview
// ═════════════════════════════════════════════════════════════════════════════

export function ActionPlansTemplateAdoptionHubCard() {
  const allSeedProjects = useActionPlanProjects();

  const templateStats = useMemo(() => {
    return AP_TEMPLATE_COLUMNS.map((templateName) => {
      let adopted = 0;
      let totalPercent = 0;
      let overdueCount = 0;
      let completeCount = 0;

      allSeedProjects.forEach((p) => {
        const cell = computeCell(p.id, templateName);
        if (cell.kind === "progress") {
          adopted++;
          totalPercent += cell.percent;
          if (cell.overdue) overdueCount++;
          if (cell.percent >= 100) completeCount++;
        }
      });

      const adoptionRate = allSeedProjects.length > 0
        ? Math.round((adopted / allSeedProjects.length) * 100)
        : 0;
      const avgCompletion = adopted > 0 ? Math.round(totalPercent / adopted) : 0;

      return { name: templateName, adopted, adoptionRate, avgCompletion, overdueCount, completeCount };
    });
  }, [allSeedProjects]);

  const totalProjects = allSeedProjects.length;

  return (
    <HubCardFrame
      title="Template adoption"
      infoTooltip="How widely each Action Plan template is used across the portfolio. Adoption = projects with at least one plan for that template."
      actions={
        <Button variant="tertiary" size="sm" icon={<EllipsisVertical size="sm" />} aria-label="Card actions" />
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {templateStats.map((t) => (
          <div key={t.name}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#232729" }}>{t.name}</span>
              <span style={{ fontSize: 12, color: "#6a767c" }}>{t.adopted}/{totalProjects} projects</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, height: 10, borderRadius: 5, background: "#eceff1", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${t.adoptionRate}%`, height: "100%", borderRadius: 5,
                    background: t.adoptionRate >= 80 ? "#2e7d32" : t.adoptionRate >= 50 ? "#1565c0" : "#f6a623",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#232729", minWidth: 36, textAlign: "right" }}>{t.adoptionRate}%</span>
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
              <span style={{ fontSize: 11, color: "#6a767c" }}>
                Avg completion: <strong style={{ color: "#232729" }}>{t.avgCompletion}%</strong>
              </span>
              <span style={{ fontSize: 11, color: "#6a767c" }}>
                Complete: <strong style={{ color: "#2e7d32" }}>{t.completeCount}</strong>
              </span>
              {t.overdueCount > 0 && (
                <span style={{ fontSize: 11, color: "#c62828", fontWeight: 600 }}>{t.overdueCount} overdue</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </HubCardFrame>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Card 3: Overdue Action Items
// ═════════════════════════════════════════════════════════════════════════════

interface OverdueItem {
  id: string;
  project: Project;
  templateName: string;
  itemTitle: string;
  dueDate: Date;
  assignees: string[];
  daysOverdue: number;
}

export function ActionPlansOverdueItemsHubCard() {
  const [detailItem, setDetailItem] = useState<OverdueItem | null>(null);
  const allSeedProjects = useActionPlanProjects();
  const now = new Date();

  const overdueItems = useMemo(() => {
    const items: OverdueItem[] = [];
    allSeedProjects.forEach((project) => {
      AP_TEMPLATE_COLUMNS.forEach((templateName) => {
        const template = actionPlanTemplates.find((t) => t.name === templateName);
        if (!template) return;
        const plan = actionPlans.find((p) => p.projectId === project.id && p.typeId === template.typeId);
        if (!plan) return;
        plan.sections.forEach((section) => {
          section.items.forEach((item) => {
            if (item.status !== "closed" && item.dueDate && item.dueDate < now) {
              const daysOverdue = Math.floor((now.getTime() - item.dueDate.getTime()) / (1000 * 60 * 60 * 24));
              items.push({
                id: item.id,
                project,
                templateName,
                itemTitle: item.title,
                dueDate: item.dueDate,
                assignees: item.assignees,
                daysOverdue,
              });
            }
          });
        });
      });
    });
    return items.sort((a, b) => b.daysOverdue - a.daysOverdue).slice(0, 9);
  }, [allSeedProjects, now]);

  return (
    <>
      <HubCardFrame
        title="Overdue action items"
        infoTooltip="Cross-project view of the most urgent overdue Action Plan items. Surfaces blockers before gate reviews so portfolio leads can intervene without opening each project."
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Button variant="secondary" size="sm">View all</Button>
            <Button variant="tertiary" size="sm" icon={<EllipsisVertical size="sm" />} aria-label="Card actions" />
          </div>
        }
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid #d6dadc", color: "#6a767c" }}>Project</th>
              <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid #d6dadc", color: "#6a767c" }}>Template</th>
              <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid #d6dadc", color: "#6a767c" }}>Item</th>
              <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid #d6dadc", color: "#6a767c" }}>Assignees</th>
              <th style={{ textAlign: "right", padding: "6px 8px", borderBottom: "1px solid #d6dadc", color: "#6a767c", whiteSpace: "nowrap" }}>Days overdue</th>
            </tr>
          </thead>
          <tbody>
            {overdueItems.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "16px 8px", textAlign: "center", color: "#6a767c", fontSize: 13 }}>
                  No overdue items.
                </td>
              </tr>
            ) : overdueItems.map((item, i) => (
              <tr key={item.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                <td style={{ padding: "7px 8px", borderBottom: "1px solid #eef0f1", whiteSpace: "nowrap" }}>
                  <button
                    type="button"
                    onClick={() => setDetailItem(item)}
                    style={{ background: "none", border: "none", padding: 0, fontWeight: 600, color: "#1d5cc9", cursor: "pointer", fontSize: 13, textAlign: "left", fontFamily: "inherit" }}
                  >
                    {item.project.number}
                  </button>
                </td>
                <td style={{ padding: "7px 8px", borderBottom: "1px solid #eef0f1", color: "#232729" }}>{item.templateName}</td>
                <td style={{ padding: "7px 8px", borderBottom: "1px solid #eef0f1", color: "#232729" }}>{item.itemTitle}</td>
                <td style={{ padding: "7px 8px", borderBottom: "1px solid #eef0f1", color: "#6a767c", whiteSpace: "nowrap" }}>
                  {item.assignees.length} assignee{item.assignees.length !== 1 ? "s" : ""}
                </td>
                <td style={{ padding: "7px 8px", borderBottom: "1px solid #eef0f1", textAlign: "right" }}>
                  <span style={{
                    display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 12, fontWeight: 600,
                    background: item.daysOverdue >= 14 ? "#fbe9e7" : "#fff3e0",
                    color: item.daysOverdue >= 14 ? "#c62828" : "#e65100",
                  }}>
                    +{item.daysOverdue}d
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </HubCardFrame>

      <TearsheetWide />
      <Tearsheet
        open={detailItem !== null}
        onClose={() => setDetailItem(null)}
        aria-label="Overdue item detail"
        placement="right"
        block
      >
        {detailItem && (
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ padding: "16px 20px 14px", borderBottom: "1px solid #d6dadc", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <Typography intent="small" style={{ color: "#6a767c", fontWeight: 500 }}>{detailItem.project.number}</Typography>
                <span style={{ color: "#d6dadc" }}>·</span>
                <Pill color={stagePillColor(detailItem.project.stage)}>{stageLabel(detailItem.project.stage)}</Pill>
              </div>
              <Typography intent="h2" style={{ fontWeight: 700, color: "#232729", display: "block" }}>
                {detailItem.itemTitle}
              </Typography>
              <Typography intent="small" style={{ color: "#6a767c", display: "block", marginTop: 6 }}>
                {detailItem.project.name} · {detailItem.templateName}
              </Typography>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div style={{ border: "1px solid #d6dadc", borderRadius: 8, padding: "12px 14px" }}>
                  <Typography intent="small" style={{ color: "#6a767c", display: "block", marginBottom: 4 }}>Assignees</Typography>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#232729" }}>{detailItem.assignees.length} assigned</span>
                </div>
                <div style={{ border: "1px solid #d6dadc", borderRadius: 8, padding: "12px 14px" }}>
                  <Typography intent="small" style={{ color: "#6a767c", display: "block", marginBottom: 4 }}>Days overdue</Typography>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#c62828" }}>+{detailItem.daysOverdue} days</span>
                </div>
              </div>
              <div style={{ border: "1px solid #d6dadc", borderRadius: 8, padding: "12px 14px", marginBottom: 16 }}>
                <Typography intent="small" style={{ color: "#6a767c", display: "block", marginBottom: 8 }}>Action Plan template</Typography>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#232729" }}>{detailItem.templateName}</span>
              </div>
            </div>
          </div>
        )}
      </Tearsheet>
    </>
  );
}
