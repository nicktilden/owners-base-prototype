import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Button,
  Dropdown,
  Pill,
  Search,
  SplitViewCard,
  Tabs,
} from "@procore/core-react";
import {
  ChevronDown,
  ChevronRight,
  Clear,
  ClipboardCheck as ActionPlansIcon,
  Plus,
} from "@procore/core-icons";
import type { ColDef, GridApi, ICellRendererParams, RowClickedEvent } from "ag-grid-community";
import styled from "styled-components";
import { SmartGridWrapper } from "@/components/SmartGrid";
import CostActionsCellRenderer from "@/components/SmartGrid/CostActionsCellRenderer";
import { actionPlans } from "@/data/seed/action_plans";
import { actionPlanTypes, actionPlanTemplates } from "@/data/seed/action_plan_types";
import type { ActionPlan, ActionPlanItem, ActionPlanStatus, ActionPlanItemStatus } from "@/types/action_plans";
import ToolPageLayout from "@/components/tools/ToolPageLayout";
import { formatDateMMDDYYYY } from "@/utils/date";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: Date | null): string {
  return formatDateMMDDYYYY(d);
}

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
  if (percent >= 100) return "var(--color-icon-success)";
  if (hasOverdue) return "var(--color-text-error)";
  if (percent > 0) return "var(--color-text-link)";
  return "var(--color-text-disabled)";
}

function planHasOverdue(plan: ActionPlan): boolean {
  const now = new Date();
  return plan.sections.flatMap((s) => s.items).some(
    (i) => i.status !== "closed" && i.dueDate && i.dueDate < now
  );
}

// ─── Styled components ────────────────────────────────────────────────────────

const ToolbarRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 8px;
  gap: 8px;
  background: var(--color-surface-primary);
`;

const ToolbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const GridArea = styled.div`
  display: flex;
  height: 640px;
  border: 1px solid var(--color-border-default);
  overflow: hidden;
`;

// ─── Detail panel ─────────────────────────────────────────────────────────────

const DetailPanel = styled.div`
  width: 420px;
  flex-shrink: 0;
  border-left: 1px solid var(--color-border-default);
  background: var(--color-surface-primary);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const DetailHeader = styled.div`
  padding: 16px 20px 14px;
  border-bottom: 1px solid var(--color-border-separator);
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
  color: var(--color-text-secondary);
  min-width: 120px;
  flex-shrink: 0;
`;

const MetaValue = styled.span`
  color: var(--color-text-primary);
  font-weight: 500;
`;

// ─── Cell renderers ───────────────────────────────────────────────────────────

function StatusPillRenderer(params: ICellRendererParams) {
  const status = params.value as ActionPlanStatus | undefined;
  if (!status) return null;
  return <Pill color={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Pill>;
}

function ProgressRenderer(params: ICellRendererParams<ActionPlan>) {
  if (!params.data) return null;
  const { closed, total, percent } = planProgress(params.data);
  const overdue = planHasOverdue(params.data);
  const barColor = progressBarColor(percent, overdue);

  if (total === 0) {
    return <span style={{ color: "var(--color-text-secondary)", fontSize: 12 }}>No items</span>;
  }
  return (
    <div style={{ minWidth: 120 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1, height: 6, borderRadius: 3, background: "var(--color-surface-tertiary)", overflow: "hidden" }}>
          <div style={{ width: `${percent}%`, height: "100%", borderRadius: 3, background: barColor }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: barColor, minWidth: 36 }}>{percent}%</span>
      </div>
      <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>
        {closed}/{total} items closed{overdue && <span style={{ color: "var(--color-text-error)", fontWeight: 600 }}> · overdue</span>}
      </div>
    </div>
  );
}

// ─── Section accordion ────────────────────────────────────────────────────────

function SectionAccordion({ section, defaultOpen }: {
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
                    <div style={{ marginTop: 3, fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.4 }}>
                      {item.acceptanceCriteria}
                    </div>
                  )}
                </td>
                <td style={{
                  padding: "9px 10px", verticalAlign: "top", whiteSpace: "nowrap", fontSize: 12,
                  color: item.status === "delayed" ? "var(--color-text-error)" : "var(--color-text-primary)",
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
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4, fontWeight: 500 }}>#{plan.number} · {typeName}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1.3, marginBottom: 8 }}>{plan.title}</div>
            <Pill color={STATUS_COLORS[plan.status]}>{STATUS_LABELS[plan.status]}</Pill>
          </div>
          <Button
            variant="tertiary"
            className="b_tertiary"
            icon={<Clear size="sm" />}
            onClick={onClose}
            aria-label="Close detail panel"
          />
        </div>
        {total > 0 && (
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, height: 8, borderRadius: 4, background: "var(--color-surface-tertiary)", overflow: "hidden" }}>
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
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 16, lineHeight: 1.5, fontStyle: "italic" }}>
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

        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 10 }}>
          Sections ({plan.sections.length})
        </div>
        {plan.sections.map((section, i) => (
          <SectionAccordion key={section.id} section={section} defaultOpen={i === 0} />
        ))}
      </DetailBody>
    </DetailPanel>
  );
}

// ─── Column defs ──────────────────────────────────────────────────────────────

const planColumnDefs: ColDef<ActionPlan>[] = [
  {
    field: "number",
    headerName: "#",
    width: 80,
    filter: "agNumberColumnFilter",
    valueFormatter: (params) => params.value != null ? `#${params.value}` : "",
  },
  {
    field: "title",
    headerName: "Title",
    minWidth: 220,
    filter: "agTextColumnFilter",
    cellStyle: { fontWeight: 600, color: "var(--color-text-link)", cursor: "pointer" },
  },
  {
    colId: "type",
    headerName: "Type",
    filter: "agSetColumnFilter",
    valueGetter: (params) => params.data ? (TYPE_MAP.get(params.data.typeId) ?? params.data.typeId) : "",
  },
  {
    field: "status",
    headerName: "Status",
    filter: "agSetColumnFilter",
    cellRenderer: StatusPillRenderer,
  },
  {
    colId: "progress",
    headerName: "Progress",
    minWidth: 160,
    sortable: false,
    filter: false,
    cellRenderer: ProgressRenderer,
  },
  {
    field: "updatedAt",
    headerName: "Updated",
    filter: "agDateColumnFilter",
    valueFormatter: (params) => formatDateMMDDYYYY(params.value),
  },
  {
    colId: "actions",
    headerName: "Actions",
    width: 90,
    minWidth: 90,
    maxWidth: 90,
    resizable: false,
    sortable: false,
    filter: false,
    suppressMovable: true,
    suppressHeaderMenuButton: true,
    pinned: "right",
    cellRenderer: CostActionsCellRenderer,
    lockPosition: true,
  },
];

const templateColumnDefs: ColDef[] = [
  {
    field: "name",
    headerName: "Name",
    minWidth: 200,
    filter: "agTextColumnFilter",
    cellStyle: { fontWeight: 600, color: "var(--color-text-link)", cursor: "pointer" },
  },
  {
    colId: "type",
    headerName: "Type",
    filter: "agSetColumnFilter",
    valueGetter: (params) => params.data ? (TYPE_MAP.get(params.data.typeId) ?? params.data.typeId) : "",
  },
  {
    colId: "sections",
    headerName: "Sections",
    width: 110,
    filter: "agNumberColumnFilter",
    valueGetter: (params) => params.data?.sections?.length ?? 0,
  },
  {
    colId: "items",
    headerName: "Items",
    width: 100,
    filter: "agNumberColumnFilter",
    valueGetter: (params) =>
      params.data?.sections?.reduce((sum: number, s: { items: unknown[] }) => sum + s.items.length, 0) ?? 0,
  },
  {
    field: "description",
    headerName: "Description",
    minWidth: 200,
    filter: "agTextColumnFilter",
    valueFormatter: (params) => params.value ?? "—",
    cellStyle: { color: "var(--color-text-secondary)", fontSize: "13px" },
  },
  {
    colId: "actions",
    headerName: "Actions",
    width: 90,
    minWidth: 90,
    maxWidth: 90,
    resizable: false,
    sortable: false,
    filter: false,
    suppressMovable: true,
    suppressHeaderMenuButton: true,
    pinned: "right",
    cellRenderer: CostActionsCellRenderer,
    lockPosition: true,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

type TabKey = "list" | "templates";
const STATUS_OPTIONS: ActionPlanStatus[] = ["draft", "in_progress", "complete"];

interface ActionPlansContentProps {
  projectId: string;
}

export default function ActionPlansContent({ projectId }: ActionPlansContentProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("list");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<ActionPlanStatus[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ActionPlan | null>(null);
  const gridApiRef = useRef<GridApi<ActionPlan> | null>(null);
  const templateGridApiRef = useRef<GridApi | null>(null);

  const seedProjectId = useMemo(() => resolveSeedProjectId(projectId), [projectId]);

  const allProjectPlans = useMemo<ActionPlan[]>(() => {
    return actionPlans.filter((ap) => ap.projectId === seedProjectId);
  }, [seedProjectId]);

  const rowData = useMemo(() => [...allProjectPlans], [allProjectPlans]);

  const getRowId = useCallback(
    (params: { data: ActionPlan }) => params.data.id,
    []
  );

  const getTemplateRowId = useCallback(
    (params: { data: { id: string } }) => params.data.id,
    []
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchText(value);
      gridApiRef.current?.setGridOption("quickFilterText", value);
    },
    []
  );

  const handleSearchClear = useCallback(() => {
    setSearchText("");
    gridApiRef.current?.setGridOption("quickFilterText", "");
  }, []);

  const handleRowClicked = useCallback(
    (event: RowClickedEvent<ActionPlan>) => {
      if (!event.data) return;
      setSelectedPlan((prev) => (prev?.id === event.data!.id ? null : event.data!));
    },
    []
  );

  function toggleStatus(s: ActionPlanStatus) {
    const next = statusFilter.includes(s)
      ? statusFilter.filter((v) => v !== s)
      : [...statusFilter, s];
    setStatusFilter(next);
    applyStatusFilter(next);
  }

  function applyStatusFilter(statuses: ActionPlanStatus[]) {
    const api = gridApiRef.current;
    if (!api) return;
    api.setColumnFilterModel(
      "status",
      statuses.length > 0 ? { values: statuses } : null
    );
    api.onFilterChanged();
  }

  function clearStatusFilter() {
    setStatusFilter([]);
    applyStatusFilter([]);
  }

  const hasFilters = statusFilter.length > 0;


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

  return (
    <ToolPageLayout
      title="Action Plans"
      icon={<ActionPlansIcon size="md" />}
      actions={actions}
      tabs={tabs}
    >
      {activeTab === "list" && (
        <SplitViewCard>
          <SplitViewCard.Main>
            <SplitViewCard.Section heading="Action Plans">
              <ToolbarRow>
                <ToolbarLeft>
                  <div style={{ maxWidth: 260 }}>
                    <Search
                      placeholder="Search"
                      value={searchText}
                      onChange={handleSearchChange}
                      onClear={handleSearchClear}
                    />
                  </div>
                  <Button
                    variant={filterOpen || hasFilters ? "primary" : "secondary"}
                    size="md"
                    onClick={() => setFilterOpen((v) => !v)}
                  >
                    Filter{hasFilters ? ` (${statusFilter.length})` : ""}
                  </Button>
                </ToolbarLeft>
              </ToolbarRow>

              {filterOpen && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
                  background: "var(--color-surface-secondary)", border: "1px solid var(--color-border-separator)", borderRadius: 4,
                  marginBottom: 8, flexWrap: "wrap",
                }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)", marginRight: 4 }}>Status:</span>
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleStatus(s)}
                      style={{
                        padding: "4px 12px", fontSize: 13, borderRadius: 4, cursor: "pointer",
                        border: `1px solid ${statusFilter.includes(s) ? "var(--color-text-link)" : "var(--color-border-separator)"}`,
                        background: statusFilter.includes(s) ? "var(--color-surface-active)" : "var(--color-surface-primary)",
                        color: statusFilter.includes(s) ? "var(--color-text-link)" : "var(--color-text-primary)",
                        fontWeight: statusFilter.includes(s) ? 600 : 400,
                        fontFamily: "inherit",
                      }}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                  {hasFilters && (
                    <Button variant="tertiary" className="b_tertiary" size="sm" onClick={clearStatusFilter}>
                      Clear
                    </Button>
                  )}
                </div>
              )}

              <GridArea>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <SmartGridWrapper<ActionPlan>
                    id="action-plans-grid"
                    localStorageKey="owner-prototype-action-plans-grid"
                    height="100%"
                    rowData={rowData}
                    columnDefs={planColumnDefs}
                    getRowId={getRowId}
                    sideBar={false}
                    onGridReady={(event) => {
                      gridApiRef.current = event.api;
                    }}
                    onRowClicked={handleRowClicked}
                    statusBar={{
                      statusPanels: [
                        { statusPanel: "agTotalAndFilteredRowCountComponent", align: "left" },
                        { statusPanel: "agSelectedRowCountComponent", align: "left" },
                      ],
                    }}
                  />
                </div>
                {selectedPlan && (
                  <PlanDetailPanel
                    plan={selectedPlan}
                    onClose={() => setSelectedPlan(null)}
                  />
                )}
              </GridArea>
            </SplitViewCard.Section>
          </SplitViewCard.Main>
        </SplitViewCard>
      )}

      {activeTab === "templates" && (
        <SplitViewCard>
          <SplitViewCard.Main>
            <SplitViewCard.Section heading="Account Templates">
              <GridArea>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <SmartGridWrapper
                    id="action-plan-templates-grid"
                    localStorageKey="owner-prototype-action-plan-templates-grid"
                    height="100%"
                    rowData={actionPlanTemplates}
                    columnDefs={templateColumnDefs}
                    getRowId={getTemplateRowId}
                    sideBar={false}
                    onGridReady={(event) => {
                      templateGridApiRef.current = event.api;
                    }}
                    statusBar={{
                      statusPanels: [
                        { statusPanel: "agTotalAndFilteredRowCountComponent", align: "left" },
                      ],
                    }}
                  />
                </div>
              </GridArea>
            </SplitViewCard.Section>
          </SplitViewCard.Main>
        </SplitViewCard>
      )}
    </ToolPageLayout>
  );
}
