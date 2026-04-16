import React, { useCallback, useEffect, useMemo, useState, type ChangeEvent } from "react";
import {
  Button,
  Dropdown,
  Pill,
  Search,
  SegmentedController,
  Select,
  SplitViewCard,
  Switch,
  Tabs,
  ToggleButton,
  Typography,
} from "@procore/core-react";
import {
  Clear,
  Cog,
  Filter,
  Fullscreen,
  FullscreenExit,
  Plus,
  Sliders,
} from "@procore/core-icons";
import styled from "styled-components";
import ToolPageLayout from "@/components/tools/ToolPageLayout";
import { ChangeHistoryDataTable } from "@/components/tools/capitalPlanning/ChangeHistoryDataTable";
import { CreateSnapshotModal } from "@/components/tools/capitalPlanning/CreateSnapshotModal";
import { CapitalPlanningSmartGrid } from "@/components/tools/capitalPlanning/CapitalPlanningSmartGrid";
import type {
  CapitalPlanningRegion,
  CapitalPlanningSampleRow,
  ProjectCurve,
  ProjectPriority,
  ProjectStatus,
} from "@/components/tools/capitalPlanning/capitalPlanningData";
import {
  assignedCapitalPlanningRegion,
  CAPITAL_PLANNING_REGIONS,
  HIGH_LEVEL_BUDGET_ITEMS_SOURCE,
  isLumpSumPlannedAmountSource,
  PROJECT_BUDGET_ORIGINAL_SOURCE,
  PROJECT_BUDGET_REVISED_SOURCE,
  PROJECT_STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  CURVE_SELECT_PLACEHOLDER_LABEL,
  SAMPLE_PROJECT_ROWS,
  initialCurves,
  initialPlannedAmountSources,
  initialPriorities,
  initialRowDates,
  withConceptBudgetColumnsCleared,
  withZeroPlannedAmountDatesCleared,
} from "@/components/tools/capitalPlanning/capitalPlanningData";
import type { ForecastGranularity } from "@/components/tools/capitalPlanning/capitalPlanningForecast";
import {
  CAPITAL_PLANNING_TABLE_SETTINGS_COLUMNS,
  DEFAULT_CAPITAL_PLANNING_COLUMN_VISIBILITY,
  type CapitalPlanningColumnVisibility,
} from "@/components/tools/capitalPlanning/capitalPlanningColumnGroups";
import {
  CAPITAL_PLANNING_GROUP_BY_OPTIONS,
  type CapitalPlanningGroupBy,
} from "@/components/tools/capitalPlanning/capitalPlanningRowGrouping";
import { formatDateMMDDYYYY } from "@/utils/date";

/**
 * Procore Data Table side panels (filters left, configuration right) — same chrome as {@link ProjectsTableCard}
 * · [Filters](https://www.figma.com/design/wbjpyOCTw2MQaOzx4ibk6r/Capital-Planning?node-id=1142-67112)
 * · [Configuration](https://www.figma.com/design/wbjpyOCTw2MQaOzx4ibk6r/Capital-Planning?node-id=933-153382)
 */
const CapitalPlanningSidePanel = styled.aside`
  width: 340px;
  flex: 0 0 340px;
  flex-shrink: 0;
  border: 1px solid #e0e4e7;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
`;

const FilterPanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e4e7;
`;

const FilterPanelTitle = styled.span`
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
  color: #1a2226;
`;

const FilterPanelHeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FilterPanelBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
`;

const FilterFieldSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FilterFieldLabel = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #1a2226;
`;

const ConfigSectionHeading = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const ConfigSectionTitle = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #1a2226;
`;

const ShowAllLink = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: #1a2226;
  padding: 0;
  &:hover {
    text-decoration: underline;
  }
`;

const ColumnToggleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  border-radius: 4px;
  background: #f0f2f3;
  margin-bottom: 6px;
  &:last-of-type {
    margin-bottom: 0;
  }
`;

const ColumnToggleLabel = styled.span`
  font-size: 14px;
  color: #1a2226;
  flex: 1;
  min-width: 0;
`;

type TableRowHeight = "sm" | "md" | "lg";

/**
 * Columns not exposed in Table Settings stay visible (planned amount + schedule/forecast block).
 */
function withCapitalPlanningColumnLocks(v: CapitalPlanningColumnVisibility): CapitalPlanningColumnVisibility {
  return {
    ...v,
    plannedAmount: true,
    startDate: true,
    endDate: true,
    curve: true,
    remaining: true,
    forecast: true,
  };
}

function toggleIncluded<T extends string>(current: readonly T[], value: T): T[] {
  return current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
}

/** Prototype snapshot list — replace with API when snapshots ship. Figma: Capital Planning Explorations node 5167-579189. */
const SNAPSHOT_SELECT_OPTIONS = [
  { id: "live", label: "Current plan (live)" },
  { id: "baseline-jan-2026", label: "Baseline — Jan 15, 2026" },
  { id: "board-dec-2025", label: "Board review — Dec 1, 2025" },
] as const;

type SnapshotSelectId = (typeof SNAPSHOT_SELECT_OPTIONS)[number]["id"];

const CAPITAL_PLANNING_SNAPSHOT_SELECT_LABEL_ID = "capital-planning-snapshot-select-label";

type CapitalPlanningHeaderTab = "capital_plan" | "change_history";

export default function CapitalPlanningContent() {
  const [headerTab, setHeaderTab] = useState<CapitalPlanningHeaderTab>("capital_plan");
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  /** Multi-select filters — same interaction model as Procore Data Table filter panels (Projects / Cost Management tables). */
  const [filterStatus, setFilterStatus] = useState<ProjectStatus[]>([]);
  const [filterPriority, setFilterPriority] = useState<ProjectPriority[]>([]);
  const [filterRegions, setFilterRegions] = useState<CapitalPlanningRegion[]>([]);
  /** `null` shows placeholder; grid defaults to region grouping until the user picks a dimension. */
  const [groupBy, setGroupBy] = useState<CapitalPlanningGroupBy | null>(null);
  const [configureOpen, setConfigureOpen] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<CapitalPlanningColumnVisibility>(() =>
    withCapitalPlanningColumnLocks({ ...DEFAULT_CAPITAL_PLANNING_COLUMN_VISIBILITY })
  );
  const [tableRowHeight, setTableRowHeight] = useState<TableRowHeight>("sm");
  const [tableFullscreen, setTableFullscreen] = useState(false);
  const [snapshotModalOpen, setSnapshotModalOpen] = useState(false);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<SnapshotSelectId | null>(null);
  /** Filters snapshot menu options while the Select search field is used (Figma 4611-94196). */
  const [snapshotSelectSearchQuery, setSnapshotSelectSearchQuery] = useState("");
  const [prioritiesByRowId, setPrioritiesByRowId] = useState<Record<string, ProjectPriority>>(initialPriorities);
  const [rowDatesById, setRowDatesById] = useState<Record<string, { startDate: string; endDate: string }>>(
    initialRowDates
  );
  const [curvesByRowId, setCurvesByRowId] = useState<Record<string, ProjectCurve>>(initialCurves);
  const [plannedAmountSourceByRowId, setPlannedAmountSourceByRowId] = useState<Record<string, string>>(
    () => initialPlannedAmountSources()
  );
  const [plannedAmountManualByRowId, setPlannedAmountManualByRowId] = useState<Record<string, number>>({});
  /** Sum of High Level Budget Items lines when source is High Level Budget Items (saved from tearsheet). */
  const [plannedAmountHighLevelBudgetByRowId, setPlannedAmountHighLevelBudgetByRowId] = useState<
    Record<string, number>
  >({});

  const onSaveHighLevelBudgetPlannedAmount = useCallback((rowId: string, plannedAmount: number) => {
    setPlannedAmountHighLevelBudgetByRowId((prev) => ({ ...prev, [rowId]: plannedAmount }));
  }, []);
  /** Forecast period columns in the grid (toolbar removed; wire to product control when needed). */
  const forecastGranularity: ForecastGranularity = "quarter";

  useEffect(() => {
    if (!tableFullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setTableFullscreen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [tableFullscreen]);

  const projectRows = useMemo((): CapitalPlanningSampleRow[] => {
    return SAMPLE_PROJECT_ROWS.map((r) => {
      const dates = rowDatesById[r.id];
      const source = plannedAmountSourceByRowId[r.id];
      const lumpSum = isLumpSumPlannedAmountSource(source);
      const manual = plannedAmountManualByRowId[r.id];
      let plannedAmount = r.plannedAmount;
      if (lumpSum && manual !== undefined) {
        plannedAmount = manual;
      } else if (source === HIGH_LEVEL_BUDGET_ITEMS_SOURCE) {
        plannedAmount = plannedAmountHighLevelBudgetByRowId[r.id] ?? r.plannedAmount;
      } else if (source === PROJECT_BUDGET_ORIGINAL_SOURCE) {
        plannedAmount = r.originalBudget ?? r.plannedAmount;
      } else if (source === PROJECT_BUDGET_REVISED_SOURCE) {
        plannedAmount = r.revisedBudget ?? r.plannedAmount;
      }
      return withZeroPlannedAmountDatesCleared(
        withConceptBudgetColumnsCleared({
          ...r,
          priority: prioritiesByRowId[r.id] ?? r.priority,
          startDate: dates?.startDate ?? r.startDate,
          endDate: dates?.endDate ?? r.endDate,
          curve: curvesByRowId[r.id] ?? r.curve,
          plannedAmount,
        })
      );
    });
  }, [
    prioritiesByRowId,
    rowDatesById,
    curvesByRowId,
    plannedAmountSourceByRowId,
    plannedAmountManualByRowId,
    plannedAmountHighLevelBudgetByRowId,
  ]);

  const filteredSnapshotOptions = useMemo(() => {
    const q = snapshotSelectSearchQuery.trim().toLowerCase();
    if (!q) return [...SNAPSHOT_SELECT_OPTIONS];
    return SNAPSHOT_SELECT_OPTIONS.filter((o) => o.label.toLowerCase().includes(q));
  }, [snapshotSelectSearchQuery]);

  const filterPanelHasActiveSelections =
    filterStatus.length > 0 || filterPriority.length > 0 || filterRegions.length > 0;

  const clearFilterPanel = useCallback(() => {
    setFilterStatus([]);
    setFilterPriority([]);
    setFilterRegions([]);
  }, []);

  const resetTableSettings = useCallback(() => {
    setColumnVisibility(withCapitalPlanningColumnLocks({ ...DEFAULT_CAPITAL_PLANNING_COLUMN_VISIBILITY }));
    setTableRowHeight("sm");
  }, []);

  const filteredProjectRows = useMemo((): CapitalPlanningSampleRow[] => {
    const q = search.trim().toLowerCase();
    let rows = projectRows;
    if (q) {
      rows = rows.filter(
        (r) =>
          r.project.toLowerCase().includes(q) ||
          r.status.toLowerCase().includes(q) ||
          r.priority.toLowerCase().includes(q) ||
          (r.curve === "" ? CURVE_SELECT_PLACEHOLDER_LABEL : r.curve).toLowerCase().includes(q) ||
          formatDateMMDDYYYY(r.startDate).toLowerCase().includes(q) ||
          formatDateMMDDYYYY(r.endDate).toLowerCase().includes(q) ||
          String(r.remaining).includes(q)
      );
    }
    if (filterStatus.length > 0) {
      rows = rows.filter((r) => filterStatus.includes(r.status));
    }
    if (filterPriority.length > 0) {
      rows = rows.filter((r) => filterPriority.includes(r.priority));
    }
    if (filterRegions.length > 0) {
      rows = rows.filter((r) => filterRegions.includes(assignedCapitalPlanningRegion(r.id)));
    }
    return rows;
  }, [projectRows, search, filterStatus, filterPriority, filterRegions]);


  const actions = (
    <>
      {headerTab === "capital_plan" ? (
        <Button variant="secondary" icon={<Plus />} onClick={() => setSnapshotModalOpen(true)}>
          Create Snapshot
        </Button>
      ) : null}
      <Dropdown label="Export" variant="secondary">
        <Dropdown.Item item="csv">CSV</Dropdown.Item>
        <Dropdown.Item item="excel">Excel</Dropdown.Item>
      </Dropdown>
    </>
  );

  const headerTabs = (
    <Tabs>
      <Tabs.Tab
        selected={headerTab === "capital_plan"}
        onPress={() => setHeaderTab("capital_plan")}
        role="button"
      >
        <Tabs.Link>Capital Plan</Tabs.Link>
      </Tabs.Tab>
      <Tabs.Tab
        selected={headerTab === "change_history"}
        onPress={() => setHeaderTab("change_history")}
        role="button"
      >
        <Tabs.Link>Change History</Tabs.Link>
      </Tabs.Tab>
    </Tabs>
  );

  return (
    <>
    <ToolPageLayout
      title="Capital Planning"
      titleAddon={
        <Pill color="magenta" style={{ flexShrink: 0 }}>
          Beta
        </Pill>
      }
      icon={
        <Button
          type="button"
          variant="secondary"
          size="md"
          icon={<Cog />}
          aria-label="Table settings"
          onClick={() => {
            setHeaderTab("capital_plan");
            setConfigureOpen((open) => !open);
            setFilterOpen(false);
          }}
        />
      }
      actions={actions}
      tabs={headerTabs}
    >
      {headerTab === "change_history" ? (
        <SplitViewCard>
          <SplitViewCard.Main>
            <SplitViewCard.Section heading="Change History">
              <ChangeHistoryDataTable />
            </SplitViewCard.Section>
          </SplitViewCard.Main>
        </SplitViewCard>
      ) : (
      <SplitViewCard>
        <SplitViewCard.Main>
          <SplitViewCard.Section>
            <div
              className="capital-planning-tool-section"
              style={{
                minWidth: 0,
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box",
                ...(tableFullscreen
                  ? {
                      position: "fixed",
                      inset: 0,
                      zIndex: 1300,
                      background: "#ffffff",
                      padding: 16,
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                    }
                  : {}),
              }}
            >
            <div
              className="capital-planning-toolbar-stack"
              style={tableFullscreen ? { flexShrink: 0 } : undefined}
            >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                width: "100%",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                  width: "100%",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flex: "0 1 auto",
                    minWidth: 0,
                    maxWidth: "100%",
                  }}
                >
                  <Typography
                    id={CAPITAL_PLANNING_SNAPSHOT_SELECT_LABEL_ID}
                    intent="small"
                    weight="semibold"
                    as="span"
                    style={{ flexShrink: 0 }}
                  >
                    Snapshot
                  </Typography>
                  <div
                    className="capital-planning-snapshot-select-wrap"
                    style={{ minWidth: 200, maxWidth: "100%", flex: "1 1 auto", width: 320 }}
                  >
                    <Select
                      aria-labelledby={CAPITAL_PLANNING_SNAPSHOT_SELECT_LABEL_ID}
                      className="capital-planning-snapshot-select"
                      block
                      placeholder="Select snapshot"
                      label={
                        selectedSnapshotId
                          ? SNAPSHOT_SELECT_OPTIONS.find((o) => o.id === selectedSnapshotId)?.label
                          : undefined
                      }
                      onClear={selectedSnapshotId ? () => setSelectedSnapshotId(null) : undefined}
                      onSearch={(e: ChangeEvent<HTMLInputElement>) =>
                        setSnapshotSelectSearchQuery(e.target.value)
                      }
                      afterHide={() => setSnapshotSelectSearchQuery("")}
                      emptyMessage="No snapshots match your search."
                      onSelect={(selection) => {
                        if (selection.action !== "selected") return;
                        const opt = selection.item as (typeof SNAPSHOT_SELECT_OPTIONS)[number];
                        setSelectedSnapshotId(opt.id);
                      }}
                    >
                      {filteredSnapshotOptions.map((opt) => (
                        <Select.Option key={opt.id} value={opt} selected={selectedSnapshotId === opt.id}>
                          {opt.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                </div>
                <Button
                  variant="tertiary"
                  icon={tableFullscreen ? <FullscreenExit /> : <Fullscreen />}
                  onClick={() => setTableFullscreen((v) => !v)}
                  style={{ flexShrink: 0 }}
                >
                  {tableFullscreen ? "Exit Full Screen" : "Full Screen"}
                </Button>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                  minWidth: 0,
                  width: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                    minWidth: 0,
                    flex: "1 1 auto",
                  }}
                >
                  <div style={{ width: 280, maxWidth: "100%", minWidth: 0 }}>
                    <Search
                      placeholder="Search Projects"
                      value={search}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                    />
                  </div>
                  <ToggleButton
                    selected={filterOpen}
                    icon={<Filter />}
                    onClick={() => {
                      setFilterOpen((v) => !v);
                      if (configureOpen) setConfigureOpen(false);
                    }}
                  >
                    Filter
                  </ToggleButton>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                    flexShrink: 0,
                    justifyContent: "flex-end",
                    minWidth: 0,
                  }}
                >
                  <div style={{ width: 240, maxWidth: "100%", minWidth: 0 }}>
                    <Select
                      className="capital-planning-group-by-select"
                      block
                      placeholder="Select Group By"
                      label={
                        groupBy
                          ? CAPITAL_PLANNING_GROUP_BY_OPTIONS.find((o) => o.value === groupBy)?.label
                          : undefined
                      }
                      onClear={() => setGroupBy(null)}
                      onSelect={(s) => {
                        if (s.action !== "selected") return;
                        setGroupBy(s.item as CapitalPlanningGroupBy);
                      }}
                    >
                      {CAPITAL_PLANNING_GROUP_BY_OPTIONS.map((o) => (
                        <Select.Option key={o.value} value={o.value} selected={groupBy === o.value}>
                          {o.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                  <ToggleButton
                    selected={configureOpen}
                    icon={<Sliders />}
                    onClick={() => {
                      setConfigureOpen((v) => !v);
                      if (filterOpen) setFilterOpen(false);
                    }}
                  >
                    Configure
                  </ToggleButton>
                </div>
              </div>
            </div>
            </div>
            <div
              className={[
                "capital-planning-main-with-filter",
                tableFullscreen ? "capital-planning-main-with-filter--fullscreen" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "stretch",
                gap: 16,
                minWidth: 0,
                width: "100%",
                ...(tableFullscreen ? { flex: 1, minHeight: 0 } : {}),
              }}
            >
            {filterOpen && (
              <CapitalPlanningSidePanel className="capital-planning-filter-panel">
                <FilterPanelHeader>
                  <FilterPanelTitle>Filters</FilterPanelTitle>
                  <FilterPanelHeaderActions>
                    {filterPanelHasActiveSelections ? (
                      <Button variant="tertiary" size="md" onClick={clearFilterPanel}>
                        Clear All
                      </Button>
                    ) : null}
                    <Button
                      variant="tertiary"
                      icon={<Clear />}
                      onClick={() => setFilterOpen(false)}
                      aria-label="Close filters"
                    />
                  </FilterPanelHeaderActions>
                </FilterPanelHeader>
                <FilterPanelBody>
                  <FilterFieldSection>
                    <FilterFieldLabel htmlFor="capital-planning-filter-status">Status</FilterFieldLabel>
                    <Select
                      id="capital-planning-filter-status"
                      placeholder="Select values"
                      label={filterStatus.length ? `${filterStatus.length} selected` : undefined}
                      onSelect={(s) => {
                        if (s.action !== "selected") return;
                        setFilterStatus((prev) => toggleIncluded(prev, s.item as ProjectStatus));
                      }}
                      onClear={() => setFilterStatus([])}
                      block
                    >
                      {PROJECT_STATUS_OPTIONS.map((v) => (
                        <Select.Option key={v} value={v} selected={filterStatus.includes(v)}>
                          {v}
                        </Select.Option>
                      ))}
                    </Select>
                  </FilterFieldSection>
                  <FilterFieldSection>
                    <FilterFieldLabel htmlFor="capital-planning-filter-priority">Priority</FilterFieldLabel>
                    <Select
                      id="capital-planning-filter-priority"
                      placeholder="Select values"
                      label={filterPriority.length ? `${filterPriority.length} selected` : undefined}
                      onSelect={(s) => {
                        if (s.action !== "selected") return;
                        setFilterPriority((prev) => toggleIncluded(prev, s.item as ProjectPriority));
                      }}
                      onClear={() => setFilterPriority([])}
                      block
                    >
                      {PRIORITY_OPTIONS.map((v) => (
                        <Select.Option key={v} value={v} selected={filterPriority.includes(v)}>
                          {v}
                        </Select.Option>
                      ))}
                    </Select>
                  </FilterFieldSection>
                  <FilterFieldSection>
                    <FilterFieldLabel htmlFor="capital-planning-filter-region">Region</FilterFieldLabel>
                    <Select
                      id="capital-planning-filter-region"
                      placeholder="Select values"
                      label={filterRegions.length ? `${filterRegions.length} selected` : undefined}
                      onSelect={(s) => {
                        if (s.action !== "selected") return;
                        setFilterRegions((prev) =>
                          toggleIncluded(prev, s.item as CapitalPlanningRegion)
                        );
                      }}
                      onClear={() => setFilterRegions([])}
                      block
                    >
                      {CAPITAL_PLANNING_REGIONS.map((v) => (
                        <Select.Option key={v} value={v} selected={filterRegions.includes(v)}>
                          {v}
                        </Select.Option>
                      ))}
                    </Select>
                  </FilterFieldSection>
                </FilterPanelBody>
              </CapitalPlanningSidePanel>
            )}
            {/* Horizontal (and fullscreen vertical) scroll only inside this region — side panels stay fixed. */}
            <div
              className={[
                "capital-planning-table-scroll-region",
                tableFullscreen ? "capital-planning-table-scroll-region--fullscreen" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{
                minWidth: 0,
                flex: "1 1 auto",
                width: "100%",
                maxWidth: "100%",
                ...(tableFullscreen
                  ? { minHeight: 0, overflow: "auto" }
                  : {}),
              }}
            >
            <CapitalPlanningSmartGrid
              columnVisibility={columnVisibility}
              rowHeight={tableRowHeight}
              configShowEmpty={true}
              search={search}
              filteredProjectRows={filteredProjectRows}
              plannedAmountSourceByRowId={plannedAmountSourceByRowId}
              setPlannedAmountSourceByRowId={setPlannedAmountSourceByRowId}
              plannedAmountManualByRowId={plannedAmountManualByRowId}
              setPlannedAmountManualByRowId={setPlannedAmountManualByRowId}
              setPrioritiesByRowId={setPrioritiesByRowId}
              setRowDatesById={setRowDatesById}
              setCurvesByRowId={setCurvesByRowId}
              forecastGranularity={forecastGranularity}
              onSaveHighLevelBudgetPlannedAmount={onSaveHighLevelBudgetPlannedAmount}
              groupBy={groupBy}
            />
            </div>
            {configureOpen && (
              <CapitalPlanningSidePanel className="capital-planning-configure-panel">
                <FilterPanelHeader>
                  <FilterPanelTitle>Table Settings</FilterPanelTitle>
                  <FilterPanelHeaderActions>
                    <Button variant="tertiary" size="md" onClick={resetTableSettings}>
                      Reset
                    </Button>
                    <Button
                      variant="tertiary"
                      icon={<Clear />}
                      onClick={() => setConfigureOpen(false)}
                      aria-label="Close table settings"
                    />
                  </FilterPanelHeaderActions>
                </FilterPanelHeader>
                <FilterPanelBody>
                  <div>
                    <Typography
                      intent="small"
                      weight="semibold"
                      style={{ display: "block", marginBottom: 8, color: "#1a2226" }}
                    >
                      Row height
                    </Typography>
                    <SegmentedController>
                      <SegmentedController.Segment
                        selected={tableRowHeight === "sm"}
                        onClick={() => setTableRowHeight("sm")}
                      >
                        Small
                      </SegmentedController.Segment>
                      <SegmentedController.Segment
                        selected={tableRowHeight === "md"}
                        onClick={() => setTableRowHeight("md")}
                      >
                        Medium
                      </SegmentedController.Segment>
                      <SegmentedController.Segment
                        selected={tableRowHeight === "lg"}
                        onClick={() => setTableRowHeight("lg")}
                      >
                        Large
                      </SegmentedController.Segment>
                    </SegmentedController>
                  </div>
                  <hr
                    style={{
                      border: 0,
                      borderTop: "1px solid #e0e4e7",
                      margin: "4px 0 12px",
                    }}
                  />
                  <div>
                    <ConfigSectionHeading>
                      <ConfigSectionTitle>Configure columns</ConfigSectionTitle>
                      <ShowAllLink
                        type="button"
                        onClick={() =>
                          setColumnVisibility(
                            withCapitalPlanningColumnLocks({ ...DEFAULT_CAPITAL_PLANNING_COLUMN_VISIBILITY })
                          )
                        }
                      >
                        Show All
                      </ShowAllLink>
                    </ConfigSectionHeading>
                    <ColumnToggleRow>
                      <Switch checked disabled aria-label="Project name always shown" />
                      <ColumnToggleLabel>Project name</ColumnToggleLabel>
                    </ColumnToggleRow>
                    <ColumnToggleRow>
                      <Switch checked disabled aria-label="Planned amount always shown" />
                      <ColumnToggleLabel>Planned Amount</ColumnToggleLabel>
                    </ColumnToggleRow>
                    {CAPITAL_PLANNING_TABLE_SETTINGS_COLUMNS.map((col) => (
                      <ColumnToggleRow key={col.key}>
                        <Switch
                          checked={columnVisibility[col.key]}
                          onChange={() =>
                            setColumnVisibility((prev) =>
                              withCapitalPlanningColumnLocks({
                                ...prev,
                                [col.key]: !prev[col.key],
                              })
                            )
                          }
                          aria-label={`Show ${col.label} column`}
                        />
                        <ColumnToggleLabel>{col.label}</ColumnToggleLabel>
                      </ColumnToggleRow>
                    ))}
                  </div>
                </FilterPanelBody>
              </CapitalPlanningSidePanel>
            )}
            </div>
            </div>
          </SplitViewCard.Section>
        </SplitViewCard.Main>
      </SplitViewCard>
      )}
    </ToolPageLayout>
    <CreateSnapshotModal open={snapshotModalOpen} onClose={() => setSnapshotModalOpen(false)} />
    </>
  );
}
