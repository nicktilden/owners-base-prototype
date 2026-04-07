import React, { useMemo, useState } from "react";
import { Button, Modal, Pill, Search as SearchInput, Tearsheet, Typography } from "@procore/core-react";
import { ChevronDown, ChevronRight, EllipsisVertical } from "@procore/core-icons";
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

// ─── Stage helpers ────────────────────────────────────────────────────────────

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

// ─── Cell computation from real seed data ─────────────────────────────────────

type CellKind = "empty" | "progress";

interface MatrixCell {
  kind: CellKind;
  percent: number;
  overdue: boolean;
  plan: ActionPlan | null;
}

const TEMPLATE_NAMES = actionPlanTemplates.map((t) => t.name);

function computeCell(projectId: string, templateName: string): MatrixCell {
  const template = actionPlanTemplates.find((t) => t.name === templateName);
  if (!template) return { kind: "empty", percent: 0, overdue: false, plan: null };

  const plan = actionPlans.find((p) => p.projectId === projectId && p.typeId === template.typeId);
  if (!plan) return { kind: "empty", percent: 0, overdue: false, plan: null };

  const allItems = plan.sections.flatMap((s) => s.items);
  const total = allItems.length;
  if (total === 0) return { kind: "progress", percent: 0, overdue: false, plan };

  const closed = allItems.filter((i) => i.status === "closed").length;
  const percent = Math.round((closed / total) * 100);
  const now = new Date();
  const overdue = allItems.some((i) => i.status !== "closed" && i.dueDate && i.dueDate < now);

  return { kind: "progress", percent, overdue, plan };
}

function cellBarColor(cell: MatrixCell): string {
  if (cell.kind === "empty") return "#eceff1";
  if (cell.percent >= 100) return "#2e7d32";
  if (cell.overdue) return "#c62828";
  if (cell.percent > 0) return "#1565c0";
  return "#9e9e9e";
}

function cellStatusLabel(cell: MatrixCell): string {
  if (cell.kind === "empty") return "";
  if (cell.percent >= 100) return "100% complete";
  if (cell.overdue) return `${cell.percent}% complete · overdue`;
  return `${cell.percent}% complete`;
}

// ─── Seed projects with action plans ──────────────────────────────────────────

function useActionPlanProjects(): Project[] {
  return useMemo(() => {
    const idsWithPlans = new Set(actionPlans.map((ap) => ap.projectId));
    return seedProjects.filter((p) => idsWithPlans.has(p.id));
  }, []);
}

// ─── Rich tearsheet ───────────────────────────────────────────────────────────

interface RichTearsheetProps {
  open: boolean;
  onClose: () => void;
  project: Project | null;
  templateName: string;
  cell: MatrixCell | null;
}

function RichActionPlanTearsheet({ open, onClose, project, templateName, cell }: RichTearsheetProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");

  const plan = cell?.plan ?? null;

  React.useEffect(() => {
    if (plan) {
      const init: Record<string, boolean> = {};
      plan.sections.forEach((s, i) => { init[s.id] = i === 0; });
      setOpenSections(init);
    }
  }, [plan]);

  const toggle = (id: string) => setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));

  if (!project || !cell || cell.kind === "empty" || !plan) return null;

  const filteredSections = plan.sections.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) => !searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter((s) => s.items.length > 0);

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
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
              <Typography intent="small" style={{ color: "#6a767c", fontWeight: 500 }}>{project.number}</Typography>
              <span style={{ color: "#d6dadc" }}>·</span>
              <Pill color={stagePillColor(project.stage)}>{stageLabel(project.stage)}</Pill>
            </div>
            <Typography intent="h2" style={{ fontWeight: 700, color: "#232729", display: "block", marginTop: 4 }}>
              {templateName}
            </Typography>
            <Typography intent="small" style={{ color: "#6a767c", display: "block", marginTop: 6 }}>
              {project.name}
            </Typography>
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, maxWidth: 320, height: 8, borderRadius: 4, background: "#eceff1", overflow: "hidden" }}>
                <div style={{ width: `${cell.percent}%`, height: "100%", borderRadius: 4, background: cellBarColor(cell), transition: "width 0.2s ease" }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: cellBarColor(cell) }}>{cellStatusLabel(cell)}</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderBottom: "1px solid #d6dadc", flexShrink: 0 }}>
            <div style={{ flex: 1 }}>
              <input
                type="search"
                placeholder="Search sections and items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search sections and items"
                style={{
                  width: "100%", padding: "7px 12px", border: "1px solid #d6dadc", borderRadius: 4,
                  fontSize: 13, fontFamily: "inherit", outline: "none",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#1565c0")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#d6dadc")}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
            {filteredSections.map((section) => (
              <div key={section.id} style={{ border: "1px solid #d6dadc", borderRadius: 4, marginBottom: 12, overflow: "hidden" }}>
                <button
                  type="button"
                  onClick={() => toggle(section.id)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 16px", background: "#f8f9f9", border: "none", cursor: "pointer",
                    fontWeight: 600, fontSize: 13, color: "#232729", textAlign: "left", fontFamily: "inherit",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {openSections[section.id] ? <ChevronDown size="sm" /> : <ChevronRight size="sm" />}
                    {section.title}
                  </span>
                  <span style={{ fontSize: 12, color: "#6a767c", fontWeight: 400 }}>{section.items.length} items</span>
                </button>
                {openSections[section.id] && (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left", padding: "8px 16px", borderBottom: "1px solid #eef0f1", fontWeight: 600, color: "#6a767c", fontSize: 12 }}>Item</th>
                        <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #eef0f1", fontWeight: 600, color: "#6a767c", fontSize: 12 }}>Due</th>
                        <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #eef0f1", fontWeight: 600, color: "#6a767c", fontSize: 12 }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.items.map((item) => (
                        <tr key={item.id} style={{ borderTop: "1px solid #eef0f1" }}>
                          <td style={{ padding: "10px 16px", verticalAlign: "top" }}>
                            <div style={{ color: "#232729", fontWeight: 500 }}>{item.title}</div>
                            {item.acceptanceCriteria && (
                              <div style={{ marginTop: 4, fontSize: 12, color: "#6a767c" }}>{item.acceptanceCriteria}</div>
                            )}
                          </td>
                          <td style={{ padding: "10px 12px", verticalAlign: "top", whiteSpace: "nowrap", color: item.status === "delayed" ? "#c62828" : "#232729" }}>
                            {item.dueDate ? item.dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                          </td>
                          <td style={{ padding: "10px 12px", verticalAlign: "top" }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: statusColor(item.status) }}>
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
// Card A: Portfolio Action Plans — Full Matrix
// ═════════════════════════════════════════════════════════════════════════════

export function APv2FullMatrixHubCard() {
  const [detail, setDetail] = useState<{ project: Project; template: string; cell: MatrixCell } | null>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTemplates, setActiveTemplates] = useState<string[]>(TEMPLATE_NAMES.slice());
  const allSeedProjects = useActionPlanProjects();

  const displayProjects = useMemo(() => {
    const base = allSeedProjects.slice(0, 7);
    if (!searchQuery) return base;
    const q = searchQuery.toLowerCase();
    return base.filter((p) => p.name.toLowerCase().includes(q) || p.number.toLowerCase().includes(q));
  }, [allSeedProjects, searchQuery]);

  const matrix = useMemo(() => {
    return displayProjects.map((p) => ({
      project: p,
      cells: activeTemplates.map((t) => computeCell(p.id, t)),
    }));
  }, [displayProjects, activeTemplates]);

  return (
    <>
      <HubCardFrame
        title="Portfolio Action Plans"
        infoTooltip="Projects × Action Plan template columns. Cells show % of items closed, derived from real seed data. Green = complete, red = overdue, blue = in progress."
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Button variant="secondary" size="sm" onClick={() => setConfigOpen(true)}>
              Configure columns
            </Button>
            <Button variant="tertiary" size="sm" icon={<EllipsisVertical size="sm" />} aria-label="Card actions" />
          </div>
        }
        controls={
          <div style={{ maxWidth: 200 }}>
            <SearchInput
              placeholder="Search projects"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            />
          </div>
        }
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 600 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid #d6dadc", color: "#6a767c", whiteSpace: "nowrap", maxWidth: 180 }}>Project</th>
                <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid #d6dadc", color: "#6a767c", whiteSpace: "nowrap", minWidth: 140 }}>Stage</th>
                {activeTemplates.map((t) => (
                  <th key={t} style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid #d6dadc", color: "#6a767c", minWidth: 140 }}>{t}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map(({ project, cells }, rowIdx) => (
                <tr key={project.id} style={{ background: rowIdx % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={{ padding: "7px 8px", borderBottom: "1px solid #eef0f1", fontWeight: 600, color: "#232729", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={project.name}>{project.name}</td>
                  <td style={{ padding: "7px 8px", borderBottom: "1px solid #eef0f1" }}>
                    <Pill color={stagePillColor(project.stage)}>{stageLabel(project.stage)}</Pill>
                  </td>
                  {cells.map((cell, ci) => (
                    <td key={activeTemplates[ci]} style={{ padding: "7px 8px", borderBottom: "1px solid #eef0f1", verticalAlign: "middle" }}>
                      {cell.kind === "empty" ? (
                        <span style={{ fontSize: 12, color: "#6a767c", fontStyle: "italic" }}>No Action Plan created.</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDetail({ project, template: activeTemplates[ci], cell })}
                          style={{
                            display: "block", width: "100%", minWidth: 120, background: "transparent", border: "none",
                            padding: 8, margin: -8, borderRadius: 4, cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                          }}
                          aria-label={`${activeTemplates[ci]}, ${cellStatusLabel(cell)}, open details`}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f1f2")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <span style={{ fontSize: 12, fontWeight: 600, color: cellBarColor(cell) }}>{cellStatusLabel(cell)}</span>
                          <div style={{ height: 8, borderRadius: 2, background: "#eceff1", overflow: "hidden", marginTop: 4 }}>
                            <div style={{ width: `${cell.percent}%`, height: "100%", borderRadius: 2, background: cellBarColor(cell), transition: "width 0.2s ease" }} />
                          </div>
                        </button>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </HubCardFrame>

      <RichActionPlanTearsheet
        open={detail !== null}
        onClose={() => setDetail(null)}
        project={detail?.project ?? null}
        templateName={detail?.template ?? ""}
        cell={detail?.cell ?? null}
      />

      <Modal open={configOpen} onClose={() => setConfigOpen(false)} aria-label="Configure Action Plan columns" howToClose={["x", "scrim"]} role="dialog">
        <Modal.Header>Configure Action Plan columns</Modal.Header>
        <Modal.Body>
          <Typography intent="small" style={{ color: "#6a767c", marginBottom: 16, display: "block", lineHeight: 1.5 }}>
            Select templates to show as columns and reorder to match your gate sequence.
          </Typography>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {TEMPLATE_NAMES.map((t) => {
              const isActive = activeTemplates.includes(t);
              return (
                <div
                  key={t}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", border: "1px solid #d6dadc", borderRadius: 4 }}
                >
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", flex: 1, fontSize: 13 }}>
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => {
                        setActiveTemplates((prev) =>
                          isActive ? prev.filter((x) => x !== t) : [...prev, t]
                        );
                      }}
                    />
                    {t}
                  </label>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTemplates((prev) => {
                          const idx = prev.indexOf(t);
                          if (idx <= 0) return prev;
                          const next = [...prev];
                          [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                          return next;
                        });
                      }}
                      style={{ padding: "2px 8px", fontSize: 12, background: "#fff", border: "1px solid #d6dadc", borderRadius: 4, cursor: "pointer", fontFamily: "inherit" }}
                      aria-label={`Move ${t} up`}
                    >↑</button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTemplates((prev) => {
                          const idx = prev.indexOf(t);
                          if (idx < 0 || idx >= prev.length - 1) return prev;
                          const next = [...prev];
                          [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
                          return next;
                        });
                      }}
                      style={{ padding: "2px 8px", fontSize: 12, background: "#fff", border: "1px solid #d6dadc", borderRadius: 4, cursor: "pointer", fontFamily: "inherit" }}
                      aria-label={`Move ${t} down`}
                    >↓</button>
                  </div>
                </div>
              );
            })}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfigOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => setConfigOpen(false)}>Save</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Card B: Portfolio Action Plans — KPI Dashboard
// ═════════════════════════════════════════════════════════════════════════════

function CompletionRing({ percent, size = 48, color }: { percent: number; size?: number; color: string }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eceff1" strokeWidth={5} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.4s ease" }}
      />
    </svg>
  );
}

export function APv2KpiDashboardHubCard() {
  const [drillTemplate, setDrillTemplate] = useState<string | null>(null);
  const allSeedProjects = useActionPlanProjects();

  const allCells = useMemo(() => {
    return allSeedProjects.slice(0, 10).map((p) => ({
      project: p,
      cells: TEMPLATE_NAMES.map((t) => computeCell(p.id, t)),
    }));
  }, [allSeedProjects]);

  const aggStats = useMemo(() => {
    let totalPlans = 0, completedPlans = 0, overduePlans = 0, totalPercent = 0, progressCount = 0;
    allCells.forEach(({ cells }) => {
      cells.forEach((c) => {
        if (c.kind === "empty") return;
        totalPlans++;
        if (c.percent >= 100) completedPlans++;
        if (c.overdue) overduePlans++;
        totalPercent += c.percent;
        progressCount++;
      });
    });
    const avgCompletion = progressCount > 0 ? Math.round(totalPercent / progressCount) : 0;
    return { totalPlans, completedPlans, overduePlans, avgCompletion };
  }, [allCells]);

  const perTemplate = useMemo(() => {
    return TEMPLATE_NAMES.map((name, colIdx) => {
      let adopted = 0, totalPct = 0, overdueCount = 0, completeCount = 0;
      allCells.forEach(({ cells }) => {
        const c = cells[colIdx];
        if (c.kind === "progress") {
          adopted++;
          totalPct += c.percent;
          if (c.overdue) overdueCount++;
          if (c.percent >= 100) completeCount++;
        }
      });
      const avgPct = adopted > 0 ? Math.round(totalPct / adopted) : 0;
      return { name, adopted, avgPct, overdueCount, completeCount };
    });
  }, [allCells]);

  const drillProjects = useMemo(() => {
    if (!drillTemplate) return [];
    const colIdx = TEMPLATE_NAMES.indexOf(drillTemplate);
    if (colIdx < 0) return [];
    return allCells
      .map(({ project, cells }) => ({ project, cell: cells[colIdx] }))
      .filter(({ cell }) => cell.kind === "progress")
      .sort((a, b) => a.cell.percent - b.cell.percent);
  }, [drillTemplate, allCells]);

  const kpiItems = [
    { label: "Total Plans", value: String(aggStats.totalPlans), color: "#232729" },
    { label: "Avg Completion", value: `${aggStats.avgCompletion}%`, color: aggStats.avgCompletion >= 70 ? "#2e7d32" : "#1565c0" },
    { label: "Completed", value: String(aggStats.completedPlans), color: "#2e7d32" },
    { label: "Overdue", value: String(aggStats.overduePlans), color: aggStats.overduePlans > 0 ? "#c62828" : "#6a767c" },
  ];

  return (
    <>
      <HubCardFrame
        title="Action Plans — KPI dashboard"
        infoTooltip="Aggregate KPIs across all Action Plan templates, plus per-template completion rings derived from real seed data. Click a template to see project-level breakdown."
        actions={
          <Button variant="tertiary" size="sm" icon={<EllipsisVertical size="sm" />} aria-label="Card actions" />
        }
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, border: "1px solid #d6dadc", borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>
          {kpiItems.map((k, i) => (
            <div key={k.label} style={{ padding: "12px 16px", borderRight: i < 3 ? "1px solid #d6dadc" : "none" }}>
              <div style={{ fontSize: 13, color: "#6a767c", marginBottom: 2 }}>{k.label}</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: k.color, lineHeight: "28px" }}>{k.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {perTemplate.map((t) => {
            const ringColor = t.avgPct >= 100 ? "#2e7d32" : t.overdueCount > 0 ? "#c62828" : "#1565c0";
            return (
              <button
                key={t.name}
                type="button"
                onClick={() => setDrillTemplate(t.name)}
                style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "10px 12px",
                  border: "1px solid #d6dadc", borderRadius: 8, background: "#fff", cursor: "pointer",
                  textAlign: "left", fontFamily: "inherit", transition: "background 0.1s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f8f9f9")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
              >
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <CompletionRing percent={t.avgPct} color={ringColor} />
                  <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#232729" }}>
                    {t.avgPct}%
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#232729" }}>{t.name}</div>
                  <div style={{ display: "flex", gap: 12, marginTop: 2, fontSize: 12, color: "#6a767c" }}>
                    <span>{t.adopted}/{allCells.length} adopted</span>
                    <span style={{ color: "#2e7d32" }}>{t.completeCount} complete</span>
                    {t.overdueCount > 0 && <span style={{ color: "#c62828", fontWeight: 600 }}>{t.overdueCount} overdue</span>}
                  </div>
                </div>
                <ChevronRight size="sm" style={{ color: "#6a767c", flexShrink: 0 } as React.CSSProperties} />
              </button>
            );
          })}
        </div>
      </HubCardFrame>

      <TearsheetWide />
      <Tearsheet
        open={drillTemplate !== null}
        onClose={() => setDrillTemplate(null)}
        aria-label={`Projects using ${drillTemplate}`}
        placement="right"
        block
      >
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #d6dadc", flexShrink: 0 }}>
            <Typography intent="h2" style={{ fontWeight: 700, color: "#232729" }}>{drillTemplate}</Typography>
            <Typography intent="small" style={{ color: "#6a767c", display: "block", marginTop: 2 }}>
              {drillProjects.length} project{drillProjects.length !== 1 ? "s" : ""} with this template
            </Typography>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
            <div style={{ border: "1px solid #d6dadc", borderRadius: 8, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f5f6f7" }}>
                    <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid #d6dadc", fontWeight: 600, color: "#6a767c" }}>#</th>
                    <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid #d6dadc", fontWeight: 600, color: "#6a767c" }}>Project</th>
                    <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid #d6dadc", fontWeight: 600, color: "#6a767c" }}>Stage</th>
                    <th style={{ textAlign: "center", padding: "10px 12px", borderBottom: "1px solid #d6dadc", fontWeight: 600, color: "#6a767c" }}>Progress</th>
                    <th style={{ textAlign: "center", padding: "10px 12px", borderBottom: "1px solid #d6dadc", fontWeight: 600, color: "#6a767c" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {drillProjects.map(({ project, cell }, i) => (
                    <tr key={project.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid #eef0f1", color: "#6a767c" }}>{project.number}</td>
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid #eef0f1", fontWeight: 600, color: "#232729" }}>{project.name}</td>
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid #eef0f1" }}>
                        <Pill color={stagePillColor(project.stage)}>{stageLabel(project.stage)}</Pill>
                      </td>
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid #eef0f1", textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                          <div style={{ width: 60, height: 6, borderRadius: 3, background: "#eceff1", overflow: "hidden" }}>
                            <div style={{ width: `${cell.percent}%`, height: "100%", borderRadius: 3, background: cellBarColor(cell) }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: cellBarColor(cell) }}>{cell.percent}%</span>
                        </div>
                      </td>
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid #eef0f1", textAlign: "center" }}>
                        {cell.overdue ? (
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#c62828", background: "#fbe9e7", padding: "2px 8px", borderRadius: 4 }}>Overdue</span>
                        ) : cell.percent >= 100 ? (
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#2e7d32", background: "#e8f5e9", padding: "2px 8px", borderRadius: 4 }}>Complete</span>
                        ) : (
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#1565c0", background: "#e3f2fd", padding: "2px 8px", borderRadius: 4 }}>In Progress</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Tearsheet>
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Card C: Portfolio Action Plans — Project Cards
// ═════════════════════════════════════════════════════════════════════════════

export function APv2ProjectCardsHubCard() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const allSeedProjects = useActionPlanProjects();

  const projectCards = useMemo(() => {
    return allSeedProjects.slice(0, 8).map((p) => {
      const cells = TEMPLATE_NAMES.map((t) => computeCell(p.id, t));
      const activeCells = cells.filter((c) => c.kind === "progress");
      const avgPct = activeCells.length > 0
        ? Math.round(activeCells.reduce((s, c) => s + c.percent, 0) / activeCells.length)
        : 0;
      const hasOverdue = cells.some((c) => c.overdue);
      return { project: p, cells, avgPct, hasOverdue, totalActive: activeCells.length };
    });
  }, [allSeedProjects]);

  const selectedCells = useMemo(() => {
    if (!selectedProject) return [];
    return TEMPLATE_NAMES.map((name) => ({
      template: name,
      cell: computeCell(selectedProject.id, name),
    }));
  }, [selectedProject]);

  return (
    <>
      <HubCardFrame
        title="Action Plans — project cards"
        infoTooltip="Each project as a visual card with compact progress dots per template, derived from real seed data. Click a card for template breakdown."
        actions={
          <Button variant="tertiary" size="sm" icon={<EllipsisVertical size="sm" />} aria-label="Card actions" />
        }
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
          {projectCards.map(({ project, cells, avgPct, hasOverdue }) => (
            <button
              key={project.id}
              type="button"
              onClick={() => setSelectedProject(project)}
              style={{
                display: "flex", flexDirection: "column", gap: 8, padding: 14,
                border: "1px solid #d6dadc", borderRadius: 8, background: "#fff",
                cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#1565c0"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#d6dadc"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#232729", lineHeight: 1.3 }}>{project.name}</div>
                  <div style={{ fontSize: 11, color: "#6a767c", marginTop: 2 }}>{project.number}</div>
                </div>
                {hasOverdue && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", background: "#c62828", borderRadius: 8, padding: "1px 6px", lineHeight: "16px", flexShrink: 0 }}>!</span>
                )}
              </div>
              <Pill color={stagePillColor(project.stage)}>{stageLabel(project.stage)}</Pill>

              <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
                {cells.map((cell, ci) => (
                  <div
                    key={TEMPLATE_NAMES[ci]}
                    title={`${TEMPLATE_NAMES[ci]}: ${cell.kind === "empty" ? "No plan" : cellStatusLabel(cell)}`}
                    style={{
                      width: 12, height: 12, borderRadius: "50%",
                      background: cell.kind === "empty" ? "#eceff1" : cellBarColor(cell),
                      border: `2px solid ${cell.kind === "empty" ? "#d6dadc" : cellBarColor(cell)}`,
                    }}
                  />
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                <div style={{ flex: 1, height: 4, borderRadius: 2, background: "#eceff1", overflow: "hidden" }}>
                  <div style={{ width: `${avgPct}%`, height: "100%", borderRadius: 2, background: hasOverdue ? "#c62828" : avgPct >= 100 ? "#2e7d32" : "#1565c0" }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#232729" }}>{avgPct}%</span>
              </div>
            </button>
          ))}
        </div>
      </HubCardFrame>

      <TearsheetWide />
      <Tearsheet
        open={selectedProject !== null}
        onClose={() => setSelectedProject(null)}
        aria-label={`Action Plans for ${selectedProject?.name}`}
        placement="right"
        block
      >
        {selectedProject && (
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #d6dadc", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <Typography intent="small" style={{ color: "#6a767c", fontWeight: 500 }}>{selectedProject.number}</Typography>
                <span style={{ color: "#d6dadc" }}>·</span>
                <Pill color={stagePillColor(selectedProject.stage)}>{stageLabel(selectedProject.stage)}</Pill>
              </div>
              <Typography intent="h2" style={{ fontWeight: 700, color: "#232729", display: "block", marginTop: 4 }}>
                {selectedProject.name}
              </Typography>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
              <Typography intent="small" style={{ color: "#6a767c", display: "block", marginBottom: 16 }}>
                Action Plan templates for this project
              </Typography>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {selectedCells.map(({ template, cell }) => (
                  <div key={template} style={{ border: "1px solid #d6dadc", borderRadius: 8, padding: "14px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#232729" }}>{template}</span>
                      {cell.kind === "empty" ? (
                        <span style={{ fontSize: 12, color: "#6a767c", fontStyle: "italic" }}>No plan</span>
                      ) : cell.overdue ? (
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#c62828", background: "#fbe9e7", padding: "2px 8px", borderRadius: 4 }}>Overdue</span>
                      ) : cell.percent >= 100 ? (
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#2e7d32", background: "#e8f5e9", padding: "2px 8px", borderRadius: 4 }}>Complete</span>
                      ) : (
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#1565c0", background: "#e3f2fd", padding: "2px 8px", borderRadius: 4 }}>In Progress</span>
                      )}
                    </div>
                    {cell.kind === "progress" && (
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ flex: 1, height: 8, borderRadius: 4, background: "#eceff1", overflow: "hidden" }}>
                          <div style={{ width: `${cell.percent}%`, height: "100%", borderRadius: 4, background: cellBarColor(cell), transition: "width 0.3s ease" }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: cellBarColor(cell), minWidth: 42 }}>{cell.percent}%</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Tearsheet>
    </>
  );
}
