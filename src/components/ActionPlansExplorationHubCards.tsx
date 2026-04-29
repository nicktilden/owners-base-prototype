import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Button, DetailPage, Modal, Pill, Search, Select, Switch, Tearsheet, Title, ToggleButton, Tooltip, Typography } from "@procore/core-react";
import { ChevronDown, ChevronRight, Clear, Cog, EllipsisVertical, Filter, Sliders } from "@procore/core-icons";
import type { CellClickedEvent, ColDef, GridApi, ICellRendererParams, ValueGetterParams } from "ag-grid-community";
import { SmartGridWrapper } from "@/components/SmartGrid";
import PortfolioFiltersPanel, { type PortfolioFilterValues } from "@/components/SmartGrid/PortfolioFiltersPanel";
import ConfigureColumnsPanel, { type ConfigureColumnSection } from "@/components/SmartGrid/ConfigureColumnsPanel";
import { createGlobalStyle } from "styled-components";
import styled from "styled-components";
import HubCardFrame from "@/components/hubs/HubCardFrame";
import { useHubFilters } from "@/context/HubFilterContext";
import { actionPlans } from "@/data/seed/action_plans";
import { actionPlanTypes, actionPlanTemplates } from "@/data/seed/action_plan_types";
import type { Project } from "@/types/project";
import type { ActionPlan, ActionPlanStatus, ActionPlanItem, ActionPlanItemStatus } from "@/types/action_plans";
import { completionBg, adoptionBg, overdueAgeBg, overdueAgeFg } from "@/utils/heatmapColors";
import { projects } from "@/data/seed/projects";
import { formatDateMMDDYYYY } from "@/utils/date";

const APToolbarRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 8px;
  gap: 8px;
  background: var(--color-surface-primary);
`;

const APToolbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const APToolbarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

const APGridArea = styled.div`
  display: flex;
  height: 580px;
  border: 1px solid var(--color-border-default);
  overflow: hidden;
`;

const TearsheetWide = createGlobalStyle`
  [class*="StyledTearsheetBody"]:has(> .action-plans-tearsheet-wide-root) {
    flex: 0 0 50vw !important;
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
  return completionBg(cell.percent, cell.overdue);
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

// ─── Filtered seed projects with action plans ────────────────────────────────

function useActionPlanProjects(): Project[] {
  const { filteredSeedProjects } = useHubFilters();
  return useMemo(() => {
    const idsWithPlans = new Set(actionPlans.map((ap) => ap.projectId));
    return filteredSeedProjects.filter((p) => idsWithPlans.has(p.id));
  }, [filteredSeedProjects]);
}

// ─── ProgressMiniBar ─────────────────────────────────────────────────────────

function ProgressMiniBar({ cell }: { cell: MatrixCell }) {
  if (cell.kind === "empty") {
    return (
      <Typography intent="small" style={{ color: "var(--color-text-secondary)", fontSize: 11, lineHeight: 1.3 }}>
        No Action Plan created.
      </Typography>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", minWidth: 80 }}>
      <div style={{ flex: 1, height: 8, borderRadius: 4, background: "var(--color-surface-active)", overflow: "hidden" }}>
        <div
          style={{
            width: `${cell.percent}%`,
            height: "100%",
            borderRadius: 4,
            background: barColor(cell),
            transition: "width 0.2s ease",
          }}
        />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: barColor(cell), whiteSpace: "nowrap" }}>
        {cell.percent}%
      </span>
    </div>
  );
}

// ─── Detail tearsheet ────────────────────────────────────────────────────────

// Helper: get all plans for a project + typeId (multi-instance support)
function getPlansForCell(projectId: string, templateName: string): ActionPlan[] {
  const template = actionPlanTemplates.find((t) => t.name === templateName);
  if (!template) return [];
  return actionPlans.filter((p) => p.projectId === projectId && p.typeId === template.typeId);
}

// ─── Single-plan section accordion ───────────────────────────────────────────

function PlanSectionAccordion({
  section,
  defaultOpen,
}: {
  section: ActionPlan["sections"][number];
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const statusColor = (s: string) =>
    s === "closed" ? completionBg(100, false) :
    s === "delayed" ? completionBg(0, true) :
    s === "in_progress" ? completionBg(50, false) :
    "var(--color-text-secondary)";
  const statusLabel = (s: string) =>
    s === "closed" ? "Closed" : s === "delayed" ? "Delayed" : s === "in_progress" ? "In Progress" : "Open";
  return (
    <div style={{ border: "1px solid var(--color-border-separator)", borderRadius: 6, marginBottom: 10, overflow: "hidden" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 14px", background: "var(--color-surface-secondary)", border: "none", cursor: "pointer",
          fontWeight: 600, fontSize: 13, color: "var(--color-text-primary)", textAlign: "left", fontFamily: "inherit",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {open ? <ChevronDown size="sm" /> : <ChevronRight size="sm" />}
          {section.title}
        </span>
        <span style={{ fontSize: 12, color: "var(--color-text-secondary)", fontWeight: 400 }}>{section.items.length} items</span>
      </button>
      {open && (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "var(--color-surface-primary)" }}>
              <th style={{ textAlign: "left", padding: "7px 14px", borderBottom: "1px solid var(--color-border-separator)", fontWeight: 600, color: "var(--color-text-secondary)", fontSize: 12 }}>Item</th>
              <th style={{ textAlign: "left", padding: "7px 10px", borderBottom: "1px solid var(--color-border-separator)", fontWeight: 600, color: "var(--color-text-secondary)", fontSize: 12, whiteSpace: "nowrap" }}>Due</th>
              <th style={{ textAlign: "left", padding: "7px 10px", borderBottom: "1px solid var(--color-border-separator)", fontWeight: 600, color: "var(--color-text-secondary)", fontSize: 12 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {section.items.map((item) => (
              <tr key={item.id} style={{ borderTop: "1px solid var(--color-border-separator)" }}>
                <td style={{ padding: "9px 14px", verticalAlign: "top" }}>
                  <div style={{ color: "var(--color-text-primary)", fontWeight: 500, lineHeight: 1.4 }}>{item.title}</div>
                  {item.acceptanceCriteria && (
                    <div style={{ marginTop: 3, fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.4 }}>{item.acceptanceCriteria}</div>
                  )}
                </td>
                <td style={{ padding: "9px 10px", verticalAlign: "top", whiteSpace: "nowrap", fontSize: 12, color: item.status === "delayed" ? "var(--color-text-error)" : "var(--color-text-secondary)" }}>
                  {item.dueDate ? item.dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                </td>
                <td style={{ padding: "9px 10px", verticalAlign: "top", whiteSpace: "nowrap" }}>
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
  );
}

// ─── Single plan detail (used inside tearsheet) ───────────────────────────────

function SinglePlanDetail({ plan }: { plan: ActionPlan }) {
  const allItems = plan.sections.flatMap((s) => s.items);
  const total = allItems.length;
  const closed = allItems.filter((i) => i.status === "closed").length;
  const percent = total === 0 ? 0 : Math.round((closed / total) * 100);
  const overdue = allItems.some((i) => i.status !== "closed" && i.dueDate && i.dueDate < new Date());
  const fillColor = completionBg(percent, overdue);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1, maxWidth: 320, height: 8, borderRadius: 4, background: "var(--color-surface-active)", overflow: "hidden" }}>
          <div style={{ width: `${percent}%`, height: "100%", borderRadius: 4, background: fillColor }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: fillColor, whiteSpace: "nowrap" }}>
          {closed}/{total} items closed
        </span>
      </div>
      {plan.sections.map((section, i) => (
        <PlanSectionAccordion key={section.id} section={section} defaultOpen={i === 0} />
      ))}
    </div>
  );
}

// ─── Project × Template tearsheet (AG Grid cell click) ───────────────────────

interface ProjectTemplateTearsheetProps {
  open: boolean;
  onClose: () => void;
  project: Project | null;
  templateName: string;
}

function ProjectTemplateTearsheet({ open, onClose, project, templateName }: ProjectTemplateTearsheetProps) {
  const [activeInstance, setActiveInstance] = useState(0);

  // Reset to first instance when project/template changes
  useEffect(() => { setActiveInstance(0); }, [project?.id, templateName]);

  if (!project) return null;

  const plans = getPlansForCell(project.id, templateName);
  const hasMultiple = plans.length > 1;
  const activePlan = plans[activeInstance] ?? null;

  return (
    <>
      <TearsheetWide />
      <Tearsheet open={open} onClose={onClose} aria-label="Action plan detail" placement="right">
        <div className="action-plans-tearsheet-wide-root" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Header */}
          <div style={{ padding: "16px 20px 14px", borderBottom: "1px solid var(--color-border-separator)", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Typography intent="small" style={{ color: "var(--color-text-secondary)", fontWeight: 500 }}>{project.number}</Typography>
              <span style={{ color: "var(--color-border-separator)" }}>·</span>
              <Pill color={stagePillColor(project.stage)}>{stageLabel(project.stage)}</Pill>
            </div>
            <Typography intent="h2" style={{ fontWeight: 700, color: "var(--color-text-primary)", display: "block" }}>
              {templateName}
            </Typography>
            <Typography intent="small" style={{ color: "var(--color-text-secondary)", display: "block", marginTop: 4 }}>
              {project.name}
            </Typography>
          </div>

          {/* Instance tabs when multiple plans exist for same template */}
          {hasMultiple && (
            <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--color-border-separator)", flexShrink: 0 }}>
              {plans.map((plan, idx) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setActiveInstance(idx)}
                  style={{
                    padding: "8px 16px", background: "none", border: "none", borderBottom: activeInstance === idx ? "2px solid var(--color-action-primary)" : "2px solid transparent",
                    color: activeInstance === idx ? "var(--color-action-primary)" : "var(--color-text-secondary)",
                    fontWeight: activeInstance === idx ? 600 : 400, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                    marginBottom: -1,
                  }}
                >
                  #{plan.number} — Instance {idx + 1}
                </button>
              ))}
            </div>
          )}

          {/* Body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
            {plans.length === 0 ? (
              <Typography intent="small" style={{ color: "var(--color-text-secondary)" }}>
                No action plan exists for this template on this project.
              </Typography>
            ) : activePlan ? (
              <SinglePlanDetail plan={activePlan} />
            ) : null}
          </div>
        </div>
      </Tearsheet>
    </>
  );
}

// ─── Portfolio Summary tearsheet (View All) ───────────────────────────────────

type ViewLayout = "table" | "tiles";

interface APPortfolioSummaryTearsheetProps {
  open: boolean;
  onClose: () => void;
  allProjects: Project[];
  visibleTemplateNames: string[];
}

function APPortfolioSummaryTearsheet({ open, onClose, allProjects, visibleTemplateNames }: APPortfolioSummaryTearsheetProps) {
  const [activeTemplate, setActiveTemplate] = useState(visibleTemplateNames[0] ?? "");
  const [layout, setLayout] = useState<ViewLayout>("table");
  const [searchQuery, setSearchQuery] = useState("");

  // Reset to first template when visible templates change
  useEffect(() => {
    setActiveTemplate(visibleTemplateNames[0] ?? "");
  }, [visibleTemplateNames]);

  const templateRows = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return allProjects
      .map((project) => {
        const plans = getPlansForCell(project.id, activeTemplate);
        if (plans.length === 0) return { project, plans: [], cell: { kind: "empty" as CellKind, percent: 0, overdue: false, plan: null } };
        // Primary plan for cell computation
        const cell = computeCell(project.id, activeTemplate);
        return { project, plans, cell };
      })
      .filter(({ project }) =>
        !q || project.name.toLowerCase().includes(q) || project.number.toLowerCase().includes(q)
      )
      // Sort: plans with activity first, then by percent descending, then no-plan at end
      .sort((a, b) => {
        if (a.cell.kind === "empty" && b.cell.kind !== "empty") return 1;
        if (a.cell.kind !== "empty" && b.cell.kind === "empty") return -1;
        return b.cell.percent - a.cell.percent;
      });
  }, [allProjects, activeTemplate, searchQuery]);

  return (
    <>
      <TearsheetWide />
      <Tearsheet open={open} onClose={onClose} aria-label="Action Plans — Portfolio Overview" placement="right">
        <div className="action-plans-tearsheet-wide-root" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Tearsheet header */}
          <div style={{ padding: "16px 20px 0", borderBottom: "1px solid var(--color-border-separator)", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <Typography intent="h2" style={{ fontWeight: 700, color: "var(--color-text-primary)" }}>
                Action Plans — Portfolio Overview
              </Typography>
              <div style={{ display: "flex", gap: 6 }}>
                <Button
                  variant={layout === "table" ? "secondary" : "tertiary"}
                  className={layout === "table" ? "b_secondary" : "b_tertiary"}
                  size="sm"
                  onClick={() => setLayout("table")}
                  aria-label="Table layout"
                >
                  Table
                </Button>
                <Button
                  variant={layout === "tiles" ? "secondary" : "tertiary"}
                  className={layout === "tiles" ? "b_secondary" : "b_tertiary"}
                  size="sm"
                  onClick={() => setLayout("tiles")}
                  aria-label="Tiles layout"
                >
                  Tiles
                </Button>
              </div>
            </div>
            {/* Template tab strip */}
            <div style={{ display: "flex", overflowX: "auto", gap: 0, marginBottom: -1 }}>
              {visibleTemplateNames.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setActiveTemplate(name)}
                  style={{
                    padding: "8px 14px", background: "none", border: "none", whiteSpace: "nowrap",
                    borderBottom: activeTemplate === name ? "2px solid var(--color-action-primary)" : "2px solid transparent",
                    color: activeTemplate === name ? "var(--color-action-primary)" : "var(--color-text-secondary)",
                    fontWeight: activeTemplate === name ? 600 : 400, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                    flexShrink: 0,
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div style={{ padding: "10px 20px", borderBottom: "1px solid var(--color-border-separator)", flexShrink: 0 }}>
            <Search
              placeholder="Search projects"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery("")}
            />
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
            {layout === "table" ? (
              <div style={{ border: "1px solid var(--color-border-separator)", borderRadius: 8, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "var(--color-surface-secondary)" }}>
                      <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--color-border-separator)", fontWeight: 600, color: "var(--color-text-secondary)" }}>#</th>
                      <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--color-border-separator)", fontWeight: 600, color: "var(--color-text-secondary)" }}>Project</th>
                      <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--color-border-separator)", fontWeight: 600, color: "var(--color-text-secondary)" }}>Stage</th>
                      <th style={{ padding: "10px 12px", borderBottom: "1px solid var(--color-border-separator)", fontWeight: 600, color: "var(--color-text-secondary)" }}>Progress</th>
                      <th style={{ textAlign: "center", padding: "10px 12px", borderBottom: "1px solid var(--color-border-separator)", fontWeight: 600, color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>Plans</th>
                    </tr>
                  </thead>
                  <tbody>
                    {templateRows.map(({ project, plans, cell }, i) => (
                      <tr key={project.id} style={{ background: i % 2 === 0 ? "var(--color-surface-primary)" : "var(--color-surface-secondary)" }}>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--color-border-separator)", color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>{project.number}</td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--color-border-separator)", fontWeight: 600, color: "var(--color-text-primary)" }}>{project.name}</td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--color-border-separator)" }}>
                          <Pill color={stagePillColor(project.stage)}>{stageLabel(project.stage)}</Pill>
                        </td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--color-border-separator)" }}>
                          {cell.kind === "empty" ? (
                            <span style={{ fontSize: 12, color: "var(--color-text-disabled)", fontStyle: "italic" }}>No plan</span>
                          ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ flex: 1, minWidth: 80, height: 6, borderRadius: 3, background: "var(--color-surface-active)", overflow: "hidden" }}>
                                <div style={{ width: `${cell.percent}%`, height: "100%", borderRadius: 3, background: completionBg(cell.percent, cell.overdue) }} />
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 600, color: completionBg(cell.percent, cell.overdue), minWidth: 32, textAlign: "right", whiteSpace: "nowrap" }}>
                                {cell.percent}%
                              </span>
                              {cell.overdue && (
                                <span style={{ fontSize: 11, fontWeight: 600, color: completionBg(0, true), whiteSpace: "nowrap" }}>overdue</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--color-border-separator)", textAlign: "center", color: "var(--color-text-secondary)", fontSize: 12 }}>
                          {plans.length === 0 ? "—" : plans.length > 1 ? (
                            <span style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{plans.length} instances</span>
                          ) : "1"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Tile layout */
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
                {templateRows.map(({ project, plans, cell }) => {
                  const fillColor = cell.kind === "empty" ? "var(--color-surface-active)" : completionBg(cell.percent, cell.overdue);
                  return (
                    <div
                      key={project.id}
                      style={{
                        border: "1px solid var(--color-border-separator)", borderRadius: 8, padding: "12px 14px",
                        background: "var(--color-surface-primary)", display: "flex", flexDirection: "column", gap: 8,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", lineHeight: 1.3 }}>{project.name}</div>
                        <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>{project.number}</div>
                      </div>
                      <Pill color={stagePillColor(project.stage)}>{stageLabel(project.stage)}</Pill>
                      {cell.kind === "empty" ? (
                        <span style={{ fontSize: 12, color: "var(--color-text-disabled)", fontStyle: "italic" }}>No plan created</span>
                      ) : (
                        <>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ flex: 1, height: 6, borderRadius: 3, background: "var(--color-surface-active)", overflow: "hidden" }}>
                              <div style={{ width: `${cell.percent}%`, height: "100%", borderRadius: 3, background: fillColor }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: fillColor, minWidth: 32, textAlign: "right" }}>{cell.percent}%</span>
                          </div>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {cell.overdue && (
                              <span style={{ fontSize: 11, fontWeight: 600, color: completionBg(0, true) }}>overdue</span>
                            )}
                            {cell.percent >= 100 && (
                              <span style={{ fontSize: 11, fontWeight: 600, color: completionBg(100, false) }}>complete</span>
                            )}
                            {plans.length > 1 && (
                              <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{plans.length} instances</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Tearsheet>
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Card 1: Portfolio Action Plans Matrix (native table)
// ═════════════════════════════════════════════════════════════════════════════

const TYPE_MAP = new Map(actionPlanTypes.map((t) => [t.id, t.name]));

const AP_STATUS_COLORS: Record<ActionPlanStatus, "green" | "yellow" | "red" | "gray" | "blue"> = {
  draft: "gray",
  in_progress: "blue",
  complete: "green",
};

const AP_STATUS_LABELS: Record<ActionPlanStatus, string> = {
  draft: "Draft",
  in_progress: "In Progress",
  complete: "Complete",
};

const ITEM_STATUS_COLORS: Record<ActionPlanItemStatus, string> = {
  open: "var(--color-text-secondary)",
  in_progress: "var(--color-text-link)",
  delayed: "var(--color-text-error)",
  closed: "var(--color-icon-success)",
};

const ITEM_STATUS_LABELS: Record<ActionPlanItemStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  delayed: "Delayed",
  closed: "Closed",
};

// project lookup map
const PROJECT_MAP = new Map(projects.map((p) => [p.id, p]));


function planProgress(plan: ActionPlan): { closed: number; total: number; percent: number } {
  const allItems = plan.sections.flatMap((s) => s.items);
  const total = allItems.length;
  const closed = allItems.filter((i) => i.status === "closed").length;
  return { closed, total, percent: total === 0 ? 0 : Math.round((closed / total) * 100) };
}

function planHasOverdue(plan: ActionPlan): boolean {
  const now = new Date();
  return plan.sections.flatMap((s) => s.items).some(
    (i) => i.status !== "closed" && i.dueDate && i.dueDate < now
  );
}

function progressBarColor(percent: number, hasOverdue: boolean): string {
  if (percent >= 100) return "var(--color-icon-success)";
  if (hasOverdue) return "var(--color-text-error)";
  if (percent > 0) return "var(--color-text-link)";
  return "var(--color-text-disabled)";
}

function sectionProgress(items: ActionPlanItem[]): { closed: number; total: number } {
  return { closed: items.filter((i) => i.status === "closed").length, total: items.length };
}

// ─── Section accordion (for detail panel) ────────────────────────────────────

function APSectionAccordion({ section, defaultOpen }: {
  section: ActionPlan["sections"][number];
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const { closed, total } = sectionProgress(section.items);
  const allClosed = closed === total && total > 0;

  return (
    <div style={{ border: "1px solid var(--color-border-separator)", borderRadius: 6, marginBottom: 10, overflow: "hidden" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 14px", background: "var(--color-surface-secondary)", border: "none", cursor: "pointer",
          fontWeight: 600, fontSize: 13, color: "var(--color-text-primary)", textAlign: "left", fontFamily: "inherit",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {open ? <ChevronDown size="sm" /> : <ChevronRight size="sm" />}
          {section.title}
        </span>
        <span style={{ fontSize: 12, color: allClosed ? "var(--color-icon-success)" : "var(--color-text-secondary)", fontWeight: allClosed ? 600 : 400, flexShrink: 0, marginLeft: 8 }}>
          {closed}/{total} closed
        </span>
      </button>
      {open && (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "7px 14px", borderBottom: "1px solid var(--color-surface-tertiary)", fontWeight: 600, color: "var(--color-text-secondary)", fontSize: 12 }}>Item</th>
              <th style={{ textAlign: "left", padding: "7px 10px", borderBottom: "1px solid var(--color-surface-tertiary)", fontWeight: 600, color: "var(--color-text-secondary)", fontSize: 12, whiteSpace: "nowrap" }}>Due</th>
              <th style={{ textAlign: "left", padding: "7px 10px", borderBottom: "1px solid var(--color-surface-tertiary)", fontWeight: 600, color: "var(--color-text-secondary)", fontSize: 12 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {section.items.map((item) => (
              <tr key={item.id} style={{ borderTop: "1px solid var(--color-surface-tertiary)" }}>
                <td style={{ padding: "9px 14px", verticalAlign: "top" }}>
                  <div style={{ color: "var(--color-text-primary)", fontWeight: 500, lineHeight: 1.4 }}>{item.title}</div>
                  {item.acceptanceCriteria && (
                    <div style={{ marginTop: 3, fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.4 }}>{item.acceptanceCriteria}</div>
                  )}
                </td>
                <td style={{ padding: "9px 10px", verticalAlign: "top", whiteSpace: "nowrap", fontSize: 12, color: item.status === "delayed" ? "var(--color-text-error)" : "var(--color-text-primary)" }}>
                  {item.dueDate ? item.dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                </td>
                <td style={{ padding: "9px 10px", verticalAlign: "top", whiteSpace: "nowrap" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: ITEM_STATUS_COLORS[item.status] }}>
                    {ITEM_STATUS_LABELS[item.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── Detail panel ─────────────────────────────────────────────────────────────

const APDetailPanel = styled.div`
  width: 420px;
  flex-shrink: 0;
  border-left: 1px solid var(--color-border-default);
  background: var(--color-surface-primary);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const APDetailHeader = styled.div`
  padding: 16px 20px 14px;
  border-bottom: 1px solid var(--color-border-separator);
  flex-shrink: 0;
`;

const APDetailBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
`;

function APPlanDetailPanel({ plan, onClose }: { plan: ActionPlan; onClose: () => void }) {
  const { closed, total, percent } = planProgress(plan);
  const overdue = planHasOverdue(plan);
  const barColor = progressBarColor(percent, overdue);
  const typeName = TYPE_MAP.get(plan.typeId) ?? plan.typeId;
  const project = PROJECT_MAP.get(plan.projectId);

  return (
    <APDetailPanel>
      <APDetailHeader>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4, fontWeight: 500 }}>
              #{plan.number} · {typeName}
              {project && <span> · {project.number}</span>}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1.3, marginBottom: 8 }}>{plan.title}</div>
            <Pill color={AP_STATUS_COLORS[plan.status]}>{AP_STATUS_LABELS[plan.status]}</Pill>
          </div>
          <Button variant="tertiary" className="b_tertiary" icon={<Clear size="sm" />} onClick={onClose} aria-label="Close detail panel" />
        </div>
        {total > 0 && (
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, height: 8, borderRadius: 4, background: "var(--color-surface-tertiary)", overflow: "hidden" }}>
              <div style={{ width: `${percent}%`, height: "100%", borderRadius: 4, background: barColor, transition: "width 0.2s ease" }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: barColor, whiteSpace: "nowrap" }}>{closed}/{total} closed</span>
          </div>
        )}
      </APDetailHeader>
      <APDetailBody>
        {project && (
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 12 }}>
            <span style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>{project.name}</span>
          </div>
        )}
        {plan.description && (
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 16, lineHeight: 1.5, fontStyle: "italic" }}>
            {plan.description}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16, fontSize: 13 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <span style={{ color: "var(--color-text-secondary)", minWidth: 120, flexShrink: 0 }}>Plan Manager</span>
            <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>{plan.planManager ?? "—"}</span>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <span style={{ color: "var(--color-text-secondary)", minWidth: 120, flexShrink: 0 }}>Approvers</span>
            <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>{plan.approvers.length > 0 ? `${plan.approvers.length} assigned` : "—"}</span>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <span style={{ color: "var(--color-text-secondary)", minWidth: 120, flexShrink: 0 }}>Created</span>
            <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>{formatDateMMDDYYYY(plan.createdAt)}</span>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <span style={{ color: "var(--color-text-secondary)", minWidth: 120, flexShrink: 0 }}>Last Updated</span>
            <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>{formatDateMMDDYYYY(plan.updatedAt)}</span>
          </div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 10 }}>
          Sections ({plan.sections.length})
        </div>
        {plan.sections.map((section, i) => (
          <APSectionAccordion key={section.id} section={section} defaultOpen={i === 0} />
        ))}
      </APDetailBody>
    </APDetailPanel>
  );
}

// ─── AG Grid cell renderers for matrix columns ───────────────────────────────

function APProjectNameCellRenderer({ data }: ICellRendererParams<Project>) {
  const router = useRouter();
  if (!data) return null;
  return (
    <button
      type="button"
      onClick={() => router.push(`/project/${data.id}/action_plans`)}
      style={{
        background: "none", border: "none", padding: 0, fontWeight: 600,
        color: "var(--color-text-link)", cursor: "pointer", fontSize: 13,
        textAlign: "left", fontFamily: "inherit", textDecoration: "underline",
        width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}
      title={data.name}
    >
      {data.name}
    </button>
  );
}

function APStagePillRenderer({ value }: ICellRendererParams<Project>) {
  if (!value) return null;
  return <Pill color={stagePillColor(value as string)}>{stageLabel(value as string)}</Pill>;
}

function makeTemplateCellRenderer(templateName: string) {
  return function TemplateCellRenderer({ data }: ICellRendererParams<Project>) {
    if (!data) return null;
    const cell = computeCell(data.id, templateName);
    if (cell.kind === "empty") {
      return (
        <span style={{ fontSize: 12, color: "var(--color-text-disabled)", fontStyle: "italic" }}>
          No Action Plan created.
        </span>
      );
    }
    const fillColor = completionBg(cell.percent, cell.overdue);
    const allItems = cell.plan?.sections.flatMap((s) => s.items) ?? [];
    const closed = allItems.filter((i) => i.status === "closed").length;
    const total = allItems.length;
    const tooltipContent = (
      <div style={{ fontSize: 12, lineHeight: 1.5 }}>
        <div style={{ fontWeight: 600, marginBottom: 2 }}>{templateName}</div>
        <div>{cell.percent}% complete</div>
        <div>{closed}/{total} completed</div>
      </div>
    );
    return (
      <Tooltip trigger="hover" placement="top" overlay={<Tooltip.Content>{tooltipContent}</Tooltip.Content>}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", minWidth: 0, cursor: "default", padding: "0 4px" }}>
          <div style={{ flex: 1, minWidth: 0, height: 10, borderRadius: 5, background: "#e0e0e0", overflow: "hidden" }}>
            <div
              style={{
                width: `${cell.percent}%`,
                height: "100%",
                borderRadius: 5,
                background: fillColor,
                transition: "width 0.3s ease",
              }}
            />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: fillColor, minWidth: 36, flexShrink: 0, textAlign: "right", whiteSpace: "nowrap" }}>
            {cell.percent}%
          </span>
        </div>
      </Tooltip>
    );
  };
}

function buildAPMatrixColumnDefs(): ColDef<Project>[] {
  const projectCols: ColDef<Project>[] = [
    {
      field: "name",
      headerName: "Project Name",
      pinned: "left",
      minWidth: 200,
      filter: "agTextColumnFilter",
      cellRenderer: APProjectNameCellRenderer,
      cellStyle: { display: "flex", alignItems: "center", paddingTop: 0, paddingBottom: 0 },
    },
    {
      field: "number",
      headerName: "Number",
      width: 110,
      filter: "agTextColumnFilter",
    },
    {
      field: "stage",
      headerName: "Stage",
      minWidth: 170,
      filter: "agSetColumnFilter",
      cellRenderer: APStagePillRenderer,
      enableRowGroup: true,
    },
    {
      field: "program",
      headerName: "Program",
      filter: "agSetColumnFilter",
      enableRowGroup: true,
      hide: true,
    },
    {
      field: "priority",
      headerName: "Priority",
      filter: "agSetColumnFilter",
      enableRowGroup: true,
      hide: true,
    },
    {
      field: "region",
      headerName: "Region",
      filter: "agSetColumnFilter",
      enableRowGroup: true,
      hide: true,
    },
    {
      field: "city",
      headerName: "City",
      filter: "agSetColumnFilter",
      enableRowGroup: true,
      hide: true,
    },
    {
      field: "state",
      headerName: "State",
      filter: "agSetColumnFilter",
      enableRowGroup: true,
      hide: true,
    },
    {
      colId: "projectManager",
      headerName: "Project Manager",
      filter: "agSetColumnFilter",
      enableRowGroup: true,
      hide: true,
      valueGetter: (params: ValueGetterParams<Project>) =>
        params.data ? (params.data as Project & { projectManager?: string }).projectManager ?? "" : "",
    },
  ];

  const templateCols: ColDef<Project>[] = actionPlanTemplates.map((t) => ({
    colId: t.id,
    headerName: t.name,
    minWidth: 200,
    sortable: true,
    filter: "agNumberColumnFilter",
    valueGetter: (params: ValueGetterParams<Project>) => {
      if (!params.data) return -1;
      const cell = computeCell(params.data.id, t.name);
      return cell.kind === "empty" ? -1 : cell.percent;
    },
    cellRenderer: makeTemplateCellRenderer(t.name),
    cellStyle: { display: "flex", alignItems: "center", paddingTop: 0, paddingBottom: 0 },
  }));

  return [...projectCols, ...templateCols];
}

// Build once at module level so cell renderer references are stable
const apMatrixColumnDefs = buildAPMatrixColumnDefs();

// Configure column sections for the AP matrix panel
const AP_CONFIGURE_SECTIONS: ConfigureColumnSection[] = [
  {
    label: "Project",
    colIds: ["name", "number", "stage", "program", "priority", "region", "city", "state", "projectManager"],
  },
  {
    label: "Action Plan Templates",
    colIds: actionPlanTemplates.map((t) => t.id),
  },
];

interface APGroupByOption {
  id: "stage" | "program" | "priority" | "region" | "city" | "state" | "projectManager";
  label: string;
}

const AP_GROUP_BY_OPTIONS: APGroupByOption[] = [
  { id: "stage",          label: "Stage" },
  { id: "program",        label: "Program" },
  { id: "priority",       label: "Priority" },
  { id: "region",         label: "Region" },
  { id: "projectManager", label: "Project Manager" },
  { id: "city",           label: "City" },
  { id: "state",          label: "State" },
];

export function ActionPlansPortfolioMatrixHubCard() {
  const allProjects = useActionPlanProjects();
  const [searchText, setSearchText] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [groupBys, setGroupBys] = useState<APGroupByOption[]>([]);
  const gridApiRef = useRef<GridApi<Project> | null>(null);
  const [gridApi, setGridApi] = useState<GridApi<Project> | null>(null);

  // Tearsheet state
  const [cellDetail, setCellDetail] = useState<{ project: Project; templateName: string } | null>(null);
  const [viewAllOpen, setViewAllOpen] = useState(false);

  const rowData = useMemo(() => [...allProjects], [allProjects]);

  const cityOptions = useMemo(
    () => [...new Set(allProjects.map((p) => p.city).filter(Boolean))].sort() as string[],
    [allProjects]
  );
  const stateOptions = useMemo(
    () => [...new Set(allProjects.map((p) => p.state).filter(Boolean))].sort() as string[],
    [allProjects]
  );
  const regionOptions = useMemo(
    () => [...new Set(allProjects.map((p) => p.region).filter(Boolean))].sort() as string[],
    [allProjects]
  );
  const projectManagerOptions = useMemo(
    () => [...new Set(allProjects.map((p) => (p as Project & { projectManager?: string }).projectManager).filter(Boolean))].sort() as string[],
    [allProjects]
  );

  const getRowId = useCallback((params: { data: Project }) => params.data.id, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    gridApiRef.current?.setGridOption("quickFilterText", value);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchText("");
    gridApiRef.current?.setGridOption("quickFilterText", "");
  }, []);

  const handleFiltersToggle = useCallback(() => {
    setFiltersOpen((prev) => { if (!prev) setConfigOpen(false); return !prev; });
  }, []);

  const handleFilterApply = useCallback(async (filterValues: PortfolioFilterValues) => {
    const api = gridApiRef.current;
    if (!api) return;

    const setFilter = async (colId: string, values: string[]) =>
      api.setColumnFilterModel(colId, values.length > 0 ? { values } : null);

    await setFilter("program",        filterValues.programs);
    await setFilter("stage",          filterValues.stages);
    await setFilter("priority",       filterValues.priorities);
    await setFilter("region",         filterValues.regions);
    await setFilter("projectManager", filterValues.projectManagers);
    await setFilter("city",           filterValues.cities);
    await setFilter("state",          filterValues.states);

    const applyDateFilter = async (colId: string, from: string, to: string) => {
      if (!from && !to) { await api.setColumnFilterModel(colId, null); return; }
      const model: Record<string, unknown> = { filterType: "date" };
      if (from && to) { model.type = "inRange"; model.dateFrom = from; model.dateTo = to; }
      else if (from) { model.type = "greaterThan"; model.dateFrom = from; }
      else { model.type = "lessThan"; model.dateFrom = to; }
      await api.setColumnFilterModel(colId, model);
    };

    await applyDateFilter("startDate", filterValues.startDateFrom, filterValues.startDateTo);
    await applyDateFilter("endDate",   filterValues.endDateFrom,   filterValues.endDateTo);

    api.onFilterChanged();
  }, []);

  const handleFilterClear = useCallback(async () => {
    const api = gridApiRef.current;
    if (!api) return;
    await api.setFilterModel(null);
    api.onFilterChanged();
  }, []);

  const handleConfigToggle = useCallback(() => {
    setConfigOpen((prev) => { if (!prev) setFiltersOpen(false); return !prev; });
  }, []);

  const applyGroupsToGrid = useCallback((next: APGroupByOption[], prev: APGroupByOption[]) => {
    const api = gridApiRef.current;
    if (!api) return;
    const nextIds = new Set(next.map((g) => g.id));
    api.applyColumnState({
      state: [
        ...next.map((g, i) => ({ colId: g.id, rowGroup: true, rowGroupIndex: i, hide: true })),
        ...prev.filter((g) => !nextIds.has(g.id)).map((g) => ({ colId: g.id, rowGroup: false, rowGroupIndex: null, hide: false })),
      ],
      defaultState: { rowGroup: false, rowGroupIndex: null },
    });
  }, []);

  const handleGroupBySelect = useCallback((selection: { item: unknown }) => {
    const opt = selection.item as APGroupByOption;
    const alreadySelected = groupBys.some((g) => g.id === opt.id);
    const next = alreadySelected ? groupBys.filter((g) => g.id !== opt.id) : [...groupBys, opt];
    setGroupBys(next);
    applyGroupsToGrid(next, groupBys);
  }, [groupBys, applyGroupsToGrid]);

  const handleGroupByClear = useCallback(() => {
    const prev = groupBys;
    setGroupBys([]);
    applyGroupsToGrid([], prev);
  }, [groupBys, applyGroupsToGrid]);

  // Template column cell click → open project × template tearsheet
  const handleCellClicked = useCallback((event: CellClickedEvent<Project>) => {
    if (!event.data) return;
    // Only fire for template columns (colId starts with "tpl-")
    const colId = event.column.getColId();
    if (!colId.startsWith("tpl-")) return;
    const template = actionPlanTemplates.find((t) => t.id === colId);
    if (!template) return;
    const cell = computeCell(event.data.id, template.name);
    if (cell.kind === "empty") return; // no plan — don't open
    setCellDetail({ project: event.data, templateName: template.name });
  }, []);

  return (
    <>
      <DetailPage.Card navigationLabel="Action Plans">
        <DetailPage.Section heading="Action Plans Usage">
          <APToolbarRow>
            <APToolbarLeft>
              <div style={{ maxWidth: 260 }}>
                <Search
                  placeholder="Search projects"
                  value={searchText}
                  onChange={handleSearchChange}
                  onClear={handleSearchClear}
                />
              </div>
              <ToggleButton
                selected={filtersOpen}
                className="b_toggle"
                icon={<Filter />}
                onClick={handleFiltersToggle}
              >
                Filters
              </ToggleButton>
            </APToolbarLeft>
            <APToolbarRight>
              <Button
                variant="secondary"
                className="b_secondary"
                size="sm"
                onClick={() => setViewAllOpen(true)}
              >
                View All
              </Button>
              <div style={{ width: 200 }}>
                <Select
                  placeholder="Group by"
                  label={groupBys.length > 0 ? `Group by: ${groupBys.map((g) => g.label).join(", ")}` : undefined}
                  onSelect={handleGroupBySelect}
                  onClear={groupBys.length > 0 ? handleGroupByClear : undefined}
                  block
                >
                  {AP_GROUP_BY_OPTIONS.map((opt) => (
                    <Select.Option
                      key={opt.id}
                      value={opt}
                      selected={groupBys.some((g) => g.id === opt.id)}
                    >
                      {opt.label}
                    </Select.Option>
                  ))}
                </Select>
              </div>
              <ToggleButton
                selected={configOpen}
                className="b_toggle"
                icon={<Sliders />}
                onClick={handleConfigToggle}
              >
                Configure
              </ToggleButton>
            </APToolbarRight>
          </APToolbarRow>

          <APGridArea>
            <PortfolioFiltersPanel
              open={filtersOpen}
              cityOptions={cityOptions}
              stateOptions={stateOptions}
              regionOptions={regionOptions}
              projectManagerOptions={projectManagerOptions}
              onApply={handleFilterApply}
              onClear={handleFilterClear}
            />
            <div style={{ flex: 1, minWidth: 0, transition: "flex 0.25s ease" }}>
              <SmartGridWrapper<Project>
                id="ap-matrix-grid"
                localStorageKey="owner-prototype-ap-matrix-grid"
                height="100%"
                rowData={rowData}
                columnDefs={apMatrixColumnDefs}
                getRowId={getRowId}
                groupDisplayType="groupRows"
                autoGroupColumnDef={{ headerName: "Project", minWidth: 200 }}
                sideBar={false}
                onGridReady={(event) => {
                  gridApiRef.current = event.api;
                  setGridApi(event.api);
                }}
                onCellClicked={handleCellClicked}
                statusBar={{
                  statusPanels: [
                    { statusPanel: "agTotalAndFilteredRowCountComponent", align: "left" },
                    { statusPanel: "agSelectedRowCountComponent", align: "left" },
                  ],
                }}
              />
            </div>
            <ConfigureColumnsPanel
              open={configOpen}
              gridApi={gridApi}
              onClose={() => setConfigOpen(false)}
              sections={AP_CONFIGURE_SECTIONS}
            />
          </APGridArea>
        </DetailPage.Section>
      </DetailPage.Card>

      {/* Project × Template tearsheet */}
      <ProjectTemplateTearsheet
        open={cellDetail !== null}
        onClose={() => setCellDetail(null)}
        project={cellDetail?.project ?? null}
        templateName={cellDetail?.templateName ?? ""}
      />

      {/* Portfolio Summary / View All tearsheet */}
      <APPortfolioSummaryTearsheet
        open={viewAllOpen}
        onClose={() => setViewAllOpen(false)}
        allProjects={allProjects}
        visibleTemplateNames={AP_TEMPLATE_COLUMNS}
      />
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Card 2: Template Adoption Overview
// ═════════════════════════════════════════════════════════════════════════════

const MAX_VISIBLE_TEMPLATES = 6;

export function ActionPlansTemplateAdoptionHubCard() {
  const allSeedProjects = useActionPlanProjects();
  const [configOpen, setConfigOpen] = useState(false);
  const [viewAllOpen, setViewAllOpen] = useState(false);
  // Track which templates are visible; default = first MAX_VISIBLE_TEMPLATES
  const [visibleTemplates, setVisibleTemplates] = useState<Set<string>>(
    () => new Set(AP_TEMPLATE_COLUMNS.slice(0, MAX_VISIBLE_TEMPLATES))
  );
  // pending state for the configure modal
  const [pendingVisible, setPendingVisible] = useState<Set<string>>(new Set());

  const openConfigure = () => {
    setPendingVisible(new Set(visibleTemplates));
    setConfigOpen(true);
  };

  const handleConfigToggle = (name: string) => {
    setPendingVisible((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else if (next.size < MAX_VISIBLE_TEMPLATES) {
        next.add(name);
      }
      return next;
    });
  };

  const handleConfigSave = () => {
    setVisibleTemplates(new Set(pendingVisible));
    setConfigOpen(false);
  };

  const allTemplateStats = useMemo(() => {
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

  // Only show templates that are in visibleTemplates, in original order
  const templateStats = useMemo(
    () => allTemplateStats.filter((t) => visibleTemplates.has(t.name)),
    [allTemplateStats, visibleTemplates]
  );

  const totalProjects = allSeedProjects.length;

  return (
    <>
      <HubCardFrame
        title="Action Plans Adoption"
        infoTooltip="How widely each Action Plan template is used across the portfolio. Adoption = projects with at least one plan for that template."
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Button variant="secondary" className="b_secondary" size="sm" onClick={() => setViewAllOpen(true)}>
              View All
            </Button>
            <Button
              className="b_tertiary"
              variant="tertiary"
              size="sm"
              icon={<Cog size="sm" />}
              aria-label="Configure visible templates"
              onClick={openConfigure}
            />
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {templateStats.map((t) => (
            <div key={t.name}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>{t.name}</span>
                <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{t.adopted}/{totalProjects} projects</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, height: 10, borderRadius: 5, background: "var(--color-surface-active)", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${t.adoptionRate}%`, height: "100%", borderRadius: 5,
                      background: adoptionBg(t.adoptionRate),
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-primary)", minWidth: 36, textAlign: "right" }}>{t.adoptionRate}%</span>
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
                <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
                  Avg completion: <strong style={{ color: "var(--color-text-primary)" }}>{t.avgCompletion}%</strong>
                </span>
                <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
                  Complete: <strong style={{ color: completionBg(100, false) }}>{t.completeCount}</strong>
                </span>
                {t.overdueCount > 0 && (
                  <span style={{ fontSize: 11, color: completionBg(0, true), fontWeight: 600 }}>{t.overdueCount} overdue</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </HubCardFrame>

      {/* ── Configure Templates modal ── */}
      <Modal
        open={configOpen}
        onClose={(_e, _how) => setConfigOpen(false)}
        aria-labelledby="configure-templates-heading"
        howToClose={["x", "scrim"]}
        role="dialog"
        width="sm"
      >
        <Modal.Header>
          <Title>
            <Title.Text>
              <Modal.Heading id="configure-templates-heading">Configure Visible Templates</Modal.Heading>
            </Title.Text>
          </Title>
        </Modal.Header>
        <Modal.Body>
          <Typography intent="small" style={{ color: "var(--color-text-secondary)", display: "block", marginBottom: 4, lineHeight: 1.5 }}>
            Select up to {MAX_VISIBLE_TEMPLATES} templates to show in the card.
          </Typography>
          <Typography intent="small" style={{ color: pendingVisible.size >= MAX_VISIBLE_TEMPLATES ? completionBg(0, true) : "var(--color-text-secondary)", display: "block", marginBottom: 16, fontWeight: 600 }}>
            {pendingVisible.size}/{MAX_VISIBLE_TEMPLATES} selected
          </Typography>
          <div style={{ display: "flex", flexDirection: "column", border: "1px solid var(--color-border-separator)", borderRadius: 8, overflow: "hidden" }}>
            {AP_TEMPLATE_COLUMNS.map((name, idx) => {
              const isOn = pendingVisible.has(name);
              const atMax = pendingVisible.size >= MAX_VISIBLE_TEMPLATES;
              return (
                <div
                  key={name}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 16px",
                    borderTop: idx > 0 ? "1px solid var(--color-border-separator)" : "none",
                    background: "var(--color-surface-primary)",
                    opacity: !isOn && atMax ? 0.5 : 1,
                  }}
                >
                  <span style={{ fontSize: 14, color: "var(--color-text-primary)", fontWeight: isOn ? 500 : 400 }}>{name}</span>
                  <Switch
                    checked={isOn}
                    onChange={() => handleConfigToggle(name)}
                    aria-label={`${isOn ? "Hide" : "Show"} ${name}`}
                    disabled={!isOn && atMax}
                  />
                </div>
              );
            })}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Modal.FooterButtons>
            <Button variant="tertiary" className="b_tertiary" onClick={() => setConfigOpen(false)}>Cancel</Button>
            <Button variant="primary" className="b_primary" onClick={handleConfigSave}>Save</Button>
          </Modal.FooterButtons>
        </Modal.Footer>
      </Modal>

      {/* ── View All tearsheet ── */}
      <TearsheetWide />
      <Tearsheet
        open={viewAllOpen}
        onClose={() => setViewAllOpen(false)}
        aria-label="All Action Plan Templates — Adoption"
        placement="right"
      >
        <div className="action-plans-tearsheet-wide-root" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--color-border-separator)", flexShrink: 0 }}>
            <Typography intent="h2" style={{ fontWeight: 700, color: "var(--color-text-primary)" }}>
              Action Plans Adoption
            </Typography>
            <Typography intent="small" style={{ color: "var(--color-text-secondary)", display: "block", marginTop: 2 }}>
              {AP_TEMPLATE_COLUMNS.length} templates · {totalProjects} projects
            </Typography>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
            <div style={{ border: "1px solid var(--color-border-separator)", borderRadius: 8, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--color-surface-secondary)" }}>
                    <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--color-border-separator)", fontWeight: 600, color: "var(--color-text-secondary)" }}>Template</th>
                    <th style={{ textAlign: "center", padding: "10px 12px", borderBottom: "1px solid var(--color-border-separator)", fontWeight: 600, color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>Projects</th>
                    <th style={{ padding: "10px 12px", borderBottom: "1px solid var(--color-border-separator)", fontWeight: 600, color: "var(--color-text-secondary)" }}>Adoption</th>
                    <th style={{ textAlign: "center", padding: "10px 12px", borderBottom: "1px solid var(--color-border-separator)", fontWeight: 600, color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>Avg Completion</th>
                    <th style={{ textAlign: "center", padding: "10px 12px", borderBottom: "1px solid var(--color-border-separator)", fontWeight: 600, color: "var(--color-text-secondary)" }}>Complete</th>
                    <th style={{ textAlign: "center", padding: "10px 12px", borderBottom: "1px solid var(--color-border-separator)", fontWeight: 600, color: "var(--color-text-secondary)" }}>Overdue</th>
                  </tr>
                </thead>
                <tbody>
                  {allTemplateStats.map((t, i) => (
                    <tr key={t.name} style={{ background: i % 2 === 0 ? "var(--color-surface-primary)" : "var(--color-surface-secondary)" }}>
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--color-border-separator)", fontWeight: 600, color: "var(--color-text-primary)" }}>{t.name}</td>
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--color-border-separator)", textAlign: "center", color: "var(--color-text-secondary)" }}>{t.adopted}/{totalProjects}</td>
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--color-border-separator)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ flex: 1, height: 8, borderRadius: 4, background: "var(--color-surface-active)", overflow: "hidden" }}>
                            <div style={{ width: `${t.adoptionRate}%`, height: "100%", borderRadius: 4, background: adoptionBg(t.adoptionRate) }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-primary)", minWidth: 36, textAlign: "right" }}>{t.adoptionRate}%</span>
                        </div>
                      </td>
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--color-border-separator)", textAlign: "center", fontWeight: 600, color: "var(--color-text-primary)" }}>{t.avgCompletion}%</td>
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--color-border-separator)", textAlign: "center", fontWeight: 600, color: completionBg(100, false) }}>{t.completeCount}</td>
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--color-border-separator)", textAlign: "center", fontWeight: t.overdueCount > 0 ? 600 : 400, color: t.overdueCount > 0 ? completionBg(0, true) : "var(--color-text-secondary)" }}>
                        {t.overdueCount > 0 ? t.overdueCount : "—"}
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
            <Button variant="secondary" className="b_secondary" data-variant="secondary" size="sm">View all</Button>
            <Button className="b_tertiary" variant="tertiary" size="sm" icon={<EllipsisVertical size="sm" />} aria-label="Card actions" />
          </div>
        }
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid var(--color-border-separator)", color: "var(--color-text-secondary)" }}>Project</th>
              <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid var(--color-border-separator)", color: "var(--color-text-secondary)" }}>Template</th>
              <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid var(--color-border-separator)", color: "var(--color-text-secondary)" }}>Item</th>
              <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid var(--color-border-separator)", color: "var(--color-text-secondary)" }}>Assignees</th>
              <th style={{ textAlign: "right", padding: "6px 8px", borderBottom: "1px solid var(--color-border-separator)", color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>Days overdue</th>
            </tr>
          </thead>
          <tbody>
            {overdueItems.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "16px 8px", textAlign: "center", color: "var(--color-text-secondary)", fontSize: 13 }}>
                  No overdue items.
                </td>
              </tr>
            ) : overdueItems.map((item, i) => (
              <tr key={item.id} style={{ background: i % 2 === 0 ? "var(--color-surface-primary)" : "var(--color-surface-secondary)" }}>
                <td style={{ padding: "7px 8px", borderBottom: "1px solid var(--color-border-separator)", whiteSpace: "nowrap" }}>
                  <button
                    type="button"
                    onClick={() => setDetailItem(item)}
                    style={{ background: "none", border: "none", padding: 0, fontWeight: 600, color: "var(--color-text-link)", cursor: "pointer", fontSize: 13, textAlign: "left", fontFamily: "inherit" }}
                  >
                    {item.project.number}
                  </button>
                </td>
                <td style={{ padding: "7px 8px", borderBottom: "1px solid var(--color-border-separator)", color: "var(--color-text-primary)" }}>{item.templateName}</td>
                <td style={{ padding: "7px 8px", borderBottom: "1px solid var(--color-border-separator)", color: "var(--color-text-primary)" }}>{item.itemTitle}</td>
                <td style={{ padding: "7px 8px", borderBottom: "1px solid var(--color-border-separator)", color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>
                  {item.assignees.length} assignee{item.assignees.length !== 1 ? "s" : ""}
                </td>
                <td style={{ padding: "7px 8px", borderBottom: "1px solid var(--color-border-separator)", textAlign: "right" }}>
                  <span style={{
                    display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 12, fontWeight: 600,
                    background: overdueAgeBg(item.daysOverdue),
                    color: overdueAgeFg(item.daysOverdue),
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
      >
        {detailItem && (
          <div className="action-plans-tearsheet-wide-root" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ padding: "16px 20px 14px", borderBottom: "1px solid var(--color-border-separator)", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <Typography intent="small" style={{ color: "var(--color-text-secondary)", fontWeight: 500 }}>{detailItem.project.number}</Typography>
                <span style={{ color: "var(--color-border-separator)" }}>·</span>
                <Pill color={stagePillColor(detailItem.project.stage)} data-pill-color={stagePillColor(detailItem.project.stage)}>{stageLabel(detailItem.project.stage)}</Pill>
              </div>
              <Typography intent="h2" style={{ fontWeight: 700, color: "var(--color-text-primary)", display: "block" }}>
                {detailItem.itemTitle}
              </Typography>
              <Typography intent="small" style={{ color: "var(--color-text-secondary)", display: "block", marginTop: 6 }}>
                {detailItem.project.name} · {detailItem.templateName}
              </Typography>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div style={{ border: "1px solid var(--color-border-separator)", borderRadius: 8, padding: "12px 14px" }}>
                  <Typography intent="small" style={{ color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Assignees</Typography>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}>{detailItem.assignees.length} assigned</span>
                </div>
                <div style={{ border: "1px solid var(--color-border-separator)", borderRadius: 8, padding: "12px 14px" }}>
                  <Typography intent="small" style={{ color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Days overdue</Typography>
                  <span style={{ fontSize: 14, fontWeight: 700, color: overdueAgeBg(detailItem.daysOverdue) }}>+{detailItem.daysOverdue} days</span>
                </div>
              </div>
              <div style={{ border: "1px solid var(--color-border-separator)", borderRadius: 8, padding: "12px 14px", marginBottom: 16 }}>
                <Typography intent="small" style={{ color: "var(--color-text-secondary)", display: "block", marginBottom: 8 }}>Action Plan template</Typography>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}>{detailItem.templateName}</span>
              </div>
            </div>
          </div>
        )}
      </Tearsheet>
    </>
  );
}
