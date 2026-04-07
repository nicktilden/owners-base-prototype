import React, { useMemo, useState } from "react";
import {
  Button,
  Dropdown,
  Pill,
  SplitViewCard,
  Table,
  Tabs,
} from "@procore/core-react";
import {
  ChevronDown,
  ChevronRight,
  Clear,
  ClipboardCheck as ActionPlansIcon,
  Filter,
  Plus,
  Search as SearchIcon,
} from "@procore/core-icons";
import styled from "styled-components";
import { actionPlans } from "@/data/seed/action_plans";
import { actionPlanTypes, actionPlanTemplates } from "@/data/seed/action_plan_types";
import { projects } from "@/data/seed/projects";
import type { ActionPlan, ActionPlanItem, ActionPlanStatus, ActionPlanItemStatus } from "@/types/action_plans";
import ToolPageLayout from "@/components/tools/ToolPageLayout";
import { PINNED_BODY_CELL_STYLE, PINNED_HEADER_CELL_STYLE, StandardRowActions } from "@/components/table/TableActions";
import { formatDateMMDDYYYY } from "@/utils/date";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: Date | null): string {
  return formatDateMMDDYYYY(d);
}

/**
 * Map numeric URL project IDs (1–20) to seed project string IDs (proj-001 to proj-020).
 * Pass-through for IDs already in proj-XXX format.
 */
function resolveSeedProjectId(urlId: string): string {
  const num = parseInt(urlId, 10);
  if (!isNaN(num) && num >= 1 && num <= 20) {
    return `proj-${String(num).padStart(3, "0")}`;
  }
  return urlId;
}

const TYPE_MAP = new Map(actionPlanTypes.map((t) => [t.id, t.name]));

const STATUS_COLORS: Record<ActionPlanStatus, "green" | "yellow" | "red" | "gray" | "blue"> = {
  draft: "gray",
  in_progress: "blue",
  complete: "green",
};

const STATUS_LABELS: Record<ActionPlanStatus, string> = {
  draft: "Draft",
  in_progress: "In Progress",
  complete: "Complete",
};

const ITEM_STATUS_COLORS: Record<ActionPlanItemStatus, string> = {
  open: "#6a767c",
  in_progress: "#1565c0",
  delayed: "#c62828",
  closed: "#2e7d32",
};

const ITEM_STATUS_LABELS: Record<ActionPlanItemStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  delayed: "Delayed",
  closed: "Closed",
};

function planProgress(plan: ActionPlan): { closed: number; total: number; percent: number } {
  const allItems = plan.sections.flatMap((s) => s.items);
  const total = allItems.length;
  const closed = allItems.filter((i) => i.status === "closed").length;
  return { closed, total, percent: total === 0 ? 0 : Math.round((closed / total) * 100) };
}

function sectionProgress(items: ActionPlanItem[]): { closed: number; total: number } {
  return { closed: items.filter((i) => i.status === "closed").length, total: items.length };
}

function progressBarColor(percent: number, hasOverdue: boolean): string {
  if (percent >= 100) return "#2e7d32";
  if (hasOverdue) return "#c62828";
  if (percent > 0) return "#1565c0";
  return "#9e9e9e";
}

function planHasOverdue(plan: ActionPlan): boolean {
  const now = new Date();
  return plan.sections.flatMap((s) => s.items).some(
    (i) => i.status !== "closed" && i.dueDate && i.dueDate < now
  );
}

// ─── Styled components ────────────────────────────────────────────────────────

const SearchInputWrap = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #c4cbcf;
  border-radius: 4px;
  padding: 0 8px;
  height: 36px;
  gap: 6px;
  min-width: 220px;
  background: #fff;
  &:focus-within {
    border-color: #1d5cc9;
    box-shadow: 0 0 0 2px rgba(29, 92, 201, 0.2);
  }
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  flex: 1;
  font-size: 14px;
  background: transparent;
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  gap: 8px;
`;

const ToolbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FilterChipEl = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  background: #e8f0fe;
  color: #1d5cc9;
  border: 1px solid #1d5cc9;
  border-radius: 4px;
  padding: 0 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: default;
  white-space: nowrap;
`;

const FilterChipRemove = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #1d5cc9;
  padding: 0;
  line-height: 1;
  font-size: 18px;
  display: flex;
  align-items: center;
  &:hover { color: #0f3a8a; }
`;

const QuickFilterBar = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding: 4px 0 8px 0;
`;

const TableLayout = styled.div`
  display: flex;
  flex-direction: row;
  min-height: 0;
  overflow: hidden;
`;

const TableArea = styled.div`
  flex: 1;
  min-width: 0;
  overflow: auto;
`;

// ─── Detail panel ─────────────────────────────────────────────────────────────

const DetailPanel = styled.div`
  width: 420px;
  flex-shrink: 0;
  border: 1px solid #e0e4e7;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-left: 16px;
`;

const DetailHeader = styled.div`
  padding: 16px 20px 14px;
  border-bottom: 1px solid #d6dadc;
  flex-shrink: 0;
`;

const DetailBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
`;

const DetailMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
  font-size: 13px;
`;

const MetaRow = styled.div`
  display: flex;
  gap: 12px;
`;

const MetaLabel = styled.span`
  color: #6a767c;
  min-width: 120px;
  flex-shrink: 0;
`;

const MetaValue = styled.span`
  color: #232729;
  font-weight: 500;
`;

// ─── Section accordion ────────────────────────────────────────────────────────

function SectionAccordion({ section, defaultOpen }: {
  section: ActionPlan["sections"][number];
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const { closed, total } = sectionProgress(section.items);
  const allClosed = closed === total && total > 0;

  return (
    <div style={{ border: "1px solid #d6dadc", borderRadius: 6, marginBottom: 10, overflow: "hidden" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 14px", background: "#f5f6f7", border: "none", cursor: "pointer",
          fontWeight: 600, fontSize: 13, color: "#232729", textAlign: "left", fontFamily: "inherit",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {open ? <ChevronDown size="sm" /> : <ChevronRight size="sm" />}
          {section.title}
        </span>
        <span style={{ fontSize: 12, color: allClosed ? "#2e7d32" : "#6a767c", fontWeight: allClosed ? 600 : 400, flexShrink: 0, marginLeft: 8 }}>
          {closed}/{total} closed
        </span>
      </button>
      {open && (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "7px 14px", borderBottom: "1px solid #eef0f1", fontWeight: 600, color: "#6a767c", fontSize: 12 }}>Item</th>
              <th style={{ textAlign: "left", padding: "7px 10px", borderBottom: "1px solid #eef0f1", fontWeight: 600, color: "#6a767c", fontSize: 12, whiteSpace: "nowrap" }}>Due</th>
              <th style={{ textAlign: "left", padding: "7px 10px", borderBottom: "1px solid #eef0f1", fontWeight: 600, color: "#6a767c", fontSize: 12 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {section.items.map((item) => (
              <tr key={item.id} style={{ borderTop: "1px solid #eef0f1" }}>
                <td style={{ padding: "9px 14px", verticalAlign: "top" }}>
                  <div style={{ color: "#232729", fontWeight: 500, lineHeight: 1.4 }}>{item.title}</div>
                  {item.acceptanceCriteria && (
                    <div style={{ marginTop: 3, fontSize: 12, color: "#6a767c", lineHeight: 1.4 }}>
                      {item.acceptanceCriteria}
                    </div>
                  )}
                </td>
                <td style={{
                  padding: "9px 10px", verticalAlign: "top", whiteSpace: "nowrap", fontSize: 12,
                  color: item.status === "delayed" ? "#c62828" : "#232729",
                }}>
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

// ─── Plan detail panel ────────────────────────────────────────────────────────

function PlanDetailPanel({ plan, onClose }: { plan: ActionPlan; onClose: () => void }) {
  const { closed, total, percent } = planProgress(plan);
  const overdue = planHasOverdue(plan);
  const barColor = progressBarColor(percent, overdue);
  const typeName = TYPE_MAP.get(plan.typeId) ?? plan.typeId;

  return (
    <DetailPanel>
      <DetailHeader>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: "#6a767c", marginBottom: 4, fontWeight: 500 }}>#{plan.number} · {typeName}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#232729", lineHeight: 1.3, marginBottom: 8 }}>{plan.title}</div>
            <Pill color={STATUS_COLORS[plan.status]}>{STATUS_LABELS[plan.status]}</Pill>
          </div>
          <Button
            variant="tertiary"
            icon={<Clear size="sm" />}
            onClick={onClose}
            aria-label="Close detail panel"
          />
        </div>
        {total > 0 && (
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, height: 8, borderRadius: 4, background: "#eceff1", overflow: "hidden" }}>
              <div style={{ width: `${percent}%`, height: "100%", borderRadius: 4, background: barColor, transition: "width 0.2s ease" }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: barColor, whiteSpace: "nowrap" }}>
              {closed}/{total} closed
            </span>
          </div>
        )}
      </DetailHeader>
      <DetailBody>
        {plan.description && (
          <div style={{ fontSize: 13, color: "#6a767c", marginBottom: 16, lineHeight: 1.5, fontStyle: "italic" }}>
            {plan.description}
          </div>
        )}
        <DetailMeta>
          <MetaRow>
            <MetaLabel>Plan Manager</MetaLabel>
            <MetaValue>{plan.planManager ?? "—"}</MetaValue>
          </MetaRow>
          <MetaRow>
            <MetaLabel>Approvers</MetaLabel>
            <MetaValue>{plan.approvers.length > 0 ? `${plan.approvers.length} assigned` : "—"}</MetaValue>
          </MetaRow>
          <MetaRow>
            <MetaLabel>Created</MetaLabel>
            <MetaValue>{formatDate(plan.createdAt)}</MetaValue>
          </MetaRow>
          <MetaRow>
            <MetaLabel>Last Updated</MetaLabel>
            <MetaValue>{formatDate(plan.updatedAt)}</MetaValue>
          </MetaRow>
        </DetailMeta>

        <div style={{ fontSize: 13, fontWeight: 600, color: "#232729", marginBottom: 10 }}>
          Sections ({plan.sections.length})
        </div>
        {plan.sections.map((section, i) => (
          <SectionAccordion key={section.id} section={section} defaultOpen={i === 0} />
        ))}
      </DetailBody>
    </DetailPanel>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

type TabKey = "list" | "templates";
const STATUS_OPTIONS: ActionPlanStatus[] = ["draft", "in_progress", "complete"];

interface ActionPlansContentProps {
  projectId: string;
}

export default function ActionPlansContent({ projectId }: ActionPlansContentProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ActionPlanStatus[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ActionPlan | null>(null);

  const seedProjectId = useMemo(() => resolveSeedProjectId(projectId), [projectId]);

  const project = useMemo(() => projects.find((p) => p.id === seedProjectId), [seedProjectId]);
  const projectLabel = project ? `${project.number} ${project.name}` : projectId;

  const allProjectPlans = useMemo<ActionPlan[]>(() => {
    return actionPlans.filter((ap) => ap.projectId === seedProjectId);
  }, [seedProjectId]);

  const filteredPlans = useMemo(() => {
    let base = allProjectPlans;
    if (search.trim()) {
      const q = search.toLowerCase();
      base = base.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (TYPE_MAP.get(p.typeId) ?? "").toLowerCase().includes(q)
      );
    }
    if (statusFilter.length > 0) {
      base = base.filter((p) => statusFilter.includes(p.status));
    }
    return base;
  }, [allProjectPlans, search, statusFilter]);

  const breadcrumbs = [
    { label: "Portfolio", href: "/portfolio" },
    ...(projectId ? [{ label: projectLabel, href: `/project/${projectId}` }] : []),
  ];

  const actions = (
    <>
      <Dropdown label="Export" variant="secondary">
        <Dropdown.Item item="csv">CSV</Dropdown.Item>
        <Dropdown.Item item="excel">Excel</Dropdown.Item>
      </Dropdown>
      <Button variant="primary" icon={<Plus />}>Create Action Plan</Button>
    </>
  );

  const tabs = (
    <Tabs>
      <Tabs.Tab selected={activeTab === "list"} onPress={() => setActiveTab("list")} role="button">
        <Tabs.Link>Action Plans</Tabs.Link>
      </Tabs.Tab>
      <Tabs.Tab selected={activeTab === "templates"} onPress={() => setActiveTab("templates")} role="button">
        <Tabs.Link>Templates</Tabs.Link>
      </Tabs.Tab>
    </Tabs>
  );

  function toggleStatus(s: ActionPlanStatus) {
    setStatusFilter((prev) =>
      prev.includes(s) ? prev.filter((v) => v !== s) : [...prev, s]
    );
  }

  function removeStatusChip(s: ActionPlanStatus) {
    setStatusFilter((prev) => prev.filter((v) => v !== s));
  }

  const hasFilters = statusFilter.length > 0;

  return (
    <ToolPageLayout
      title="Action Plans"
      icon={<ActionPlansIcon size="md" />}
      breadcrumbs={breadcrumbs}
      actions={actions}
      tabs={tabs}
    >
      {activeTab === "list" && (
        <SplitViewCard>
          <SplitViewCard.Main>
            <SplitViewCard.Section heading="Action Plans">

              {/* Toolbar */}
              <Toolbar>
                <ToolbarLeft>
                  <SearchInputWrap>
                    <SearchIcon size="sm" style={{ color: "#6a767c", flexShrink: 0 }} />
                    <SearchInput
                      placeholder="Search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </SearchInputWrap>
                  <Button
                    variant={filterOpen || hasFilters ? "primary" : "secondary"}
                    size="md"
                    icon={<Filter />}
                    onClick={() => setFilterOpen((v) => !v)}
                  >
                    Filter{hasFilters ? ` (${statusFilter.length})` : ""}
                  </Button>
                </ToolbarLeft>
              </Toolbar>

              {/* Status filter inline dropdown */}
              {filterOpen && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
                  background: "#f5f6f7", border: "1px solid #d6dadc", borderRadius: 4,
                  marginBottom: 8, flexWrap: "wrap",
                }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#6a767c", marginRight: 4 }}>Status:</span>
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleStatus(s)}
                      style={{
                        padding: "4px 12px", fontSize: 13, borderRadius: 4, cursor: "pointer",
                        border: `1px solid ${statusFilter.includes(s) ? "#1d5cc9" : "#d6dadc"}`,
                        background: statusFilter.includes(s) ? "#e8f0fe" : "#fff",
                        color: statusFilter.includes(s) ? "#1d5cc9" : "#232729",
                        fontWeight: statusFilter.includes(s) ? 600 : 400,
                        fontFamily: "inherit",
                      }}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                  {hasFilters && (
                    <Button variant="tertiary" size="sm" onClick={() => setStatusFilter([])}>
                      Clear
                    </Button>
                  )}
                </div>
              )}

              {/* Active filter chips */}
              {statusFilter.length > 0 && !filterOpen && (
                <QuickFilterBar>
                  {statusFilter.map((s) => (
                    <FilterChipEl key={s}>
                      Status: {STATUS_LABELS[s]}
                      <FilterChipRemove onClick={() => removeStatusChip(s)} aria-label={`Remove status filter: ${STATUS_LABELS[s]}`}>
                        <Clear size="sm" />
                      </FilterChipRemove>
                    </FilterChipEl>
                  ))}
                </QuickFilterBar>
              )}

              <TableLayout>
                <TableArea>
                  <Table.Container>
                    <Table>
                      <Table.Header>
                        <Table.HeaderRow>
                          <Table.HeaderCell>#</Table.HeaderCell>
                          <Table.HeaderCell>Title</Table.HeaderCell>
                          <Table.HeaderCell>Type</Table.HeaderCell>
                          <Table.HeaderCell>Status</Table.HeaderCell>
                          <Table.HeaderCell>Progress</Table.HeaderCell>
                          <Table.HeaderCell>Updated</Table.HeaderCell>
                          <Table.HeaderCell style={PINNED_HEADER_CELL_STYLE}>Actions</Table.HeaderCell>
                        </Table.HeaderRow>
                      </Table.Header>
                      <Table.Body>
                        {filteredPlans.length === 0 ? (
                          <Table.BodyRow>
                            <Table.BodyCell colSpan={7}>
                              <Table.TextCell>
                                {search || hasFilters
                                  ? "No action plans match your search or filters."
                                  : "No action plans have been created for this project."}
                              </Table.TextCell>
                            </Table.BodyCell>
                          </Table.BodyRow>
                        ) : (
                          filteredPlans.map((plan) => {
                            const { closed, total, percent } = planProgress(plan);
                            const overdue = planHasOverdue(plan);
                            const barColor = progressBarColor(percent, overdue);
                            const isSelected = selectedPlan?.id === plan.id;
                            return (
                              <Table.BodyRow
                                key={plan.id}
                                style={{ background: isSelected ? "#f0f4ff" : undefined }}
                              >
                                <Table.BodyCell>
                                  <Table.TextCell>
                                    <span style={{ color: "#6a767c", fontSize: 13 }}>#{plan.number}</span>
                                  </Table.TextCell>
                                </Table.BodyCell>
                                <Table.BodyCell>
                                  <Table.TextCell>
                                    <button
                                      type="button"
                                      onClick={() => setSelectedPlan(isSelected ? null : plan)}
                                      style={{
                                        background: "none", border: "none", padding: 0,
                                        fontWeight: 600, color: "#1d5cc9", cursor: "pointer",
                                        fontSize: 14, textAlign: "left", fontFamily: "inherit",
                                      }}
                                    >
                                      {plan.title}
                                    </button>
                                  </Table.TextCell>
                                </Table.BodyCell>
                                <Table.BodyCell>
                                  <Table.TextCell>{TYPE_MAP.get(plan.typeId) ?? plan.typeId}</Table.TextCell>
                                </Table.BodyCell>
                                <Table.BodyCell>
                                  <Pill color={STATUS_COLORS[plan.status]}>{STATUS_LABELS[plan.status]}</Pill>
                                </Table.BodyCell>
                                <Table.BodyCell>
                                  {total === 0 ? (
                                    <Table.TextCell>
                                      <span style={{ color: "#6a767c", fontSize: 12 }}>No items</span>
                                    </Table.TextCell>
                                  ) : (
                                    <div style={{ minWidth: 120 }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <div style={{ flex: 1, height: 6, borderRadius: 3, background: "#eceff1", overflow: "hidden" }}>
                                          <div style={{ width: `${percent}%`, height: "100%", borderRadius: 3, background: barColor }} />
                                        </div>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: barColor, minWidth: 36 }}>{percent}%</span>
                                      </div>
                                      <div style={{ fontSize: 11, color: "#6a767c", marginTop: 2 }}>
                                        {closed}/{total} items closed{overdue && <span style={{ color: "#c62828", fontWeight: 600 }}> · overdue</span>}
                                      </div>
                                    </div>
                                  )}
                                </Table.BodyCell>
                                <Table.BodyCell>
                                  <Table.TextCell>{formatDate(plan.updatedAt)}</Table.TextCell>
                                </Table.BodyCell>
                                <Table.BodyCell style={PINNED_BODY_CELL_STYLE}>
                                  <StandardRowActions />
                                </Table.BodyCell>
                              </Table.BodyRow>
                            );
                          })
                        )}
                      </Table.Body>
                    </Table>
                  </Table.Container>
                </TableArea>

                {/* Detail panel */}
                {selectedPlan && (
                  <PlanDetailPanel
                    plan={selectedPlan}
                    onClose={() => setSelectedPlan(null)}
                  />
                )}
              </TableLayout>

            </SplitViewCard.Section>
          </SplitViewCard.Main>
        </SplitViewCard>
      )}

      {activeTab === "templates" && (
        <SplitViewCard>
          <SplitViewCard.Main>
            <SplitViewCard.Section heading="Account Templates">
              <Table.Container>
                <Table>
                  <Table.Header>
                    <Table.HeaderRow>
                      <Table.HeaderCell>Name</Table.HeaderCell>
                      <Table.HeaderCell>Type</Table.HeaderCell>
                      <Table.HeaderCell>Sections</Table.HeaderCell>
                      <Table.HeaderCell>Items</Table.HeaderCell>
                      <Table.HeaderCell>Description</Table.HeaderCell>
                      <Table.HeaderCell style={PINNED_HEADER_CELL_STYLE}>Actions</Table.HeaderCell>
                    </Table.HeaderRow>
                  </Table.Header>
                  <Table.Body>
                    {actionPlanTemplates.map((tpl) => {
                      const itemCount = tpl.sections.reduce((sum, s) => sum + s.items.length, 0);
                      return (
                        <Table.BodyRow key={tpl.id}>
                          <Table.BodyCell>
                            <Table.TextCell>
                              <span style={{ fontWeight: 600, color: "#1d5cc9", cursor: "pointer" }}>
                                {tpl.name}
                              </span>
                            </Table.TextCell>
                          </Table.BodyCell>
                          <Table.BodyCell>
                            <Table.TextCell>{TYPE_MAP.get(tpl.typeId) ?? tpl.typeId}</Table.TextCell>
                          </Table.BodyCell>
                          <Table.BodyCell>
                            <Table.TextCell>{tpl.sections.length}</Table.TextCell>
                          </Table.BodyCell>
                          <Table.BodyCell>
                            <Table.TextCell>{itemCount}</Table.TextCell>
                          </Table.BodyCell>
                          <Table.BodyCell>
                            <Table.TextCell>
                              <span style={{ color: "#6a767c", fontSize: 13 }}>{tpl.description ?? "—"}</span>
                            </Table.TextCell>
                          </Table.BodyCell>
                          <Table.BodyCell style={PINNED_BODY_CELL_STYLE}>
                            <StandardRowActions />
                          </Table.BodyCell>
                        </Table.BodyRow>
                      );
                    })}
                  </Table.Body>
                </Table>
              </Table.Container>
            </SplitViewCard.Section>
          </SplitViewCard.Main>
        </SplitViewCard>
      )}
    </ToolPageLayout>
  );
}
