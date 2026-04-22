import React, { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/router";
import {
  Button,
  Dropdown,
  ErrorBanner,
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
  CurrencyUSA as CapitalPlanningIcon,
  EllipsisVertical,
  Filter,
  Fullscreen,
  FullscreenExit,
  Gantt,
  Plus,
  Sliders,
  ViewGrid,
} from "@procore/core-icons";
import styled from "styled-components";
import ToolPageLayout from "@/components/tools/ToolPageLayout";
import { useResetScrollOnTabChange } from "@/hooks/useResetScrollOnTabChange";
import { ChangeHistoryDataTable } from "@/components/tools/capitalPlanning/ChangeHistoryDataTable";
import {
  cloneCriteriaBuilderRows,
  CriteriaBuilderDataTable,
  type CriteriaBuilderDataTableHandle,
  type CriteriaBuilderRow,
  OWNER_OPERATOR_CRITERIA_BUILDER_SEED,
} from "@/components/tools/capitalPlanning/CriteriaBuilderDataTable";
import { CapitalPlanningPrioritizationTab } from "@/components/tools/capitalPlanning/CapitalPlanningPrioritizationTab";
import { CapitalPlanningRequestIntakeFormTab } from "@/components/tools/capitalPlanning/CapitalPlanningRequestIntakeFormTab";
import { CreateSnapshotModal } from "@/components/tools/capitalPlanning/CreateSnapshotModal";
import { CapitalPlanningSmartGrid } from "@/components/tools/capitalPlanning/CapitalPlanningSmartGrid";
import { criteriaBuilderRowsToGridColumns } from "@/components/tools/capitalPlanning/capitalPlanningCriteriaGridColumns";
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
  STATUS_PILL_COLOR,
  initialCurves,
  initialPlannedAmountSources,
  initialPriorities,
  initialRowDates,
  withConceptBudgetColumnsCleared,
  withZeroPlannedAmountDatesCleared,
} from "@/components/tools/capitalPlanning/capitalPlanningData";
import { buildInitialPrioritizationCriteriaValues } from "@/components/tools/capitalPlanning/capitalPlanningPrioritizationSeed";
import {
  clampProjectIsoDatesToProgramHorizon,
  type ForecastGranularity,
} from "@/components/tools/capitalPlanning/capitalPlanningForecast";
import {
  CAPITAL_PLANNING_TABLE_SETTINGS_COLUMNS,
  capitalPlanningProgramTableDefaultVisibility,
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
  border: 1px solid var(--color-border-separator);
  background: var(--color-surface-primary);
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
  border-bottom: 1px solid var(--color-border-separator);
`;

const FilterPanelTitle = styled.span`
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
  color: var(--color-text-primary);
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
  color: var(--color-text-primary);
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
  color: var(--color-text-primary);
`;

const ShowAllLink = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
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
  background: var(--color-surface-secondary);
  margin-bottom: 6px;
  &:last-of-type {
    margin-bottom: 0;
  }
`;

const ColumnToggleLabel = styled.span`
  font-size: 14px;
  color: var(--color-text-primary);
  flex: 1;
  min-width: 0;
`;

/** Criteria Builder tab: card content + fixed viewport footer (outside SplitViewCard). */
const CriteriaBuilderTabRoot = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  flex: 1;
  min-height: 0;
  /* Space for fixed footer so the table is not covered */
  padding-bottom: calc(72px + env(safe-area-inset-bottom, 0px));
`;

const CriteriaBuilderPageFooter = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-shrink: 0;
  padding: 12px 16px;
  padding-bottom: max(12px, env(safe-area-inset-bottom, 0px));
  border-top: 1px solid var(--color-border-separator);
  background: var(--color-surface-primary);
  box-shadow: 0 -4px 12px hsla(200, 10%, 15%, 0.06);
  box-sizing: border-box;
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
const CAPITAL_PLANNING_VIEW_BY_LABEL_ID = "capital-planning-view-by-label";

const VIEW_BY_OPTIONS = [
  { value: "month" as const, label: "Month" },
  { value: "quarter" as const, label: "Quarter" },
  { value: "year" as const, label: "Year" },
] as const;

type CapitalPlanningHeaderTab =
  | "capital_plan"
  | "change_history"
  | "criteria_builder"
  | "prioritization"
  | "request_intake_form";

type CapitalPlanningPlanView = "grid" | "gantt";

/** Default / Next (`-next`) / Future (`-future`) portfolio Capital Planning routes. */
export type CapitalPlanningPageVariant = "default" | "next" | "future";

export interface CapitalPlanningContentProps {
  pageVariant?: CapitalPlanningPageVariant;
}

const PORTFOLIO_CAPITAL_PLANNING_PATH = "/portfolio/capital-planning";
const PORTFOLIO_CAPITAL_PLANNING_NEXT_PATH = "/portfolio/capital-planning-next";
const PORTFOLIO_CAPITAL_PLANNING_FUTURE_PATH = "/portfolio/capital-planning-future";

export default function CapitalPlanningContent({ pageVariant = "default" }: CapitalPlanningContentProps) {
  const router = useRouter();
  const [headerTab, setHeaderTab] = useState<CapitalPlanningHeaderTab>("capital_plan");
  useResetScrollOnTabChange(headerTab);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  /** Multi-select filters — same interaction model as Procore Data Table filter panels (Projects / Cost Management tables). */
  const [filterStatus, setFilterStatus] = useState<ProjectStatus[]>([]);
  const [filterPriority, setFilterPriority] = useState<ProjectPriority[]>([]);
  const [filterRegions, setFilterRegions] = useState<CapitalPlanningRegion[]>([]);
  /** `null` shows placeholder; grid defaults to region grouping until the user picks a dimension. */
  const [groupBy, setGroupBy] = useState<CapitalPlanningGroupBy | null>(null);
  const [planView, setPlanView] = useState<CapitalPlanningPlanView>("grid");
  /** Gantt is only offered on the Future route; Now/Next always behave as grid for the program table. */
  const capitalPlanTablePlanView: CapitalPlanningPlanView =
    pageVariant === "future" ? planView : "grid";
  /** Forecast column period size — View by select (month / quarter / year). */
  const [viewByGranularity, setViewByGranularity] = useState<ForecastGranularity>("month");
  const [configureOpen, setConfigureOpen] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<CapitalPlanningColumnVisibility>(() =>
    withCapitalPlanningColumnLocks(capitalPlanningProgramTableDefaultVisibility(pageVariant))
  );
  const [tableRowHeight, setTableRowHeight] = useState<TableRowHeight>("sm");
  const [tableFullscreen, setTableFullscreen] = useState(false);
  const criteriaBuilderTableRef = useRef<CriteriaBuilderDataTableHandle>(null);
  const [criteriaBuilderSaveError, setCriteriaBuilderSaveError] = useState<string | null>(null);
  const [criteriaBuilderRows, setCriteriaBuilderRows] = useState<CriteriaBuilderRow[]>(() =>
    cloneCriteriaBuilderRows(OWNER_OPERATOR_CRITERIA_BUILDER_SEED)
  );
  const [prioritizationCriteriaValues, setPrioritizationCriteriaValues] = useState<
    Record<string, Record<string, string>>
  >(() => buildInitialPrioritizationCriteriaValues());
  const [snapshotModalOpen, setSnapshotModalOpen] = useState(false);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<SnapshotSelectId | null>(null);
  /** Filters snapshot menu options while the Select search field is used (Figma 4611-94196). */
  const [snapshotSelectSearchQuery, setSnapshotSelectSearchQuery] = useState("");
  const [rowDatesById, setRowDatesById] = useState<Record<string, { startDate: string; endDate: string }>>(() => {
    const raw = initialRowDates();
    return Object.fromEntries(
      Object.entries(raw).map(([id, d]) => [
        id,
        clampProjectIsoDatesToProgramHorizon(d.startDate, d.endDate, id),
      ])
    );
  });
  const [curvesByRowId, setCurvesByRowId] = useState<Record<string, ProjectCurve>>(initialCurves);
  const [prioritiesByRowId, setPrioritiesByRowId] = useState<Record<string, ProjectPriority>>(initialPriorities);
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

  const onCriteriaBuilderCancel = useCallback(() => {
    setHeaderTab("capital_plan");
  }, []);

  const clearCriteriaBuilderSaveError = useCallback(() => {
    setCriteriaBuilderSaveError(null);
  }, []);

  const onPrioritizationCriteriaValueChange = useCallback(
    (projectId: string, criterionId: string, value: string) => {
      setPrioritizationCriteriaValues((prev) => ({
        ...prev,
        [projectId]: { ...(prev[projectId] ?? {}), [criterionId]: value },
      }));
    },
    []
  );

  const capitalPlanGridCriteriaColumns = useMemo(
    () => criteriaBuilderRowsToGridColumns(criteriaBuilderRows),
    [criteriaBuilderRows]
  );

  const onCriteriaBuilderSave = useCallback(() => {
    const validation = criteriaBuilderTableRef.current?.validateForSave();
    if (validation && !validation.ok) {
      setCriteriaBuilderSaveError(validation.message);
      return;
    }
    setCriteriaBuilderSaveError(null);
    // Prototype: persist criteria when an API exists
  }, []);

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

  useEffect(() => {
    if (
      pageVariant !== "future" &&
      (headerTab === "criteria_builder" ||
        headerTab === "prioritization" ||
        headerTab === "request_intake_form")
    ) {
      setHeaderTab("capital_plan");
    }
  }, [pageVariant, headerTab]);

  useEffect(() => {
    if (headerTab !== "criteria_builder") {
      setCriteriaBuilderSaveError(null);
    }
  }, [headerTab]);

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
      const mergedStart = dates?.startDate ?? r.startDate;
      const mergedEnd = dates?.endDate ?? r.endDate;
      const { startDate, endDate } = clampProjectIsoDatesToProgramHorizon(mergedStart, mergedEnd, r.id);
      return withZeroPlannedAmountDatesCleared(
        withConceptBudgetColumnsCleared({
          ...r,
          startDate,
          endDate,
          curve: curvesByRowId[r.id] ?? r.curve,
          priority: prioritiesByRowId[r.id] ?? r.priority,
          plannedAmount,
        })
      );
    });
  }, [
    rowDatesById,
    curvesByRowId,
    prioritiesByRowId,
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
    setColumnVisibility(withCapitalPlanningColumnLocks(capitalPlanningProgramTableDefaultVisibility(pageVariant)));
    setTableRowHeight("sm");
  }, [pageVariant]);

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


  const breadcrumbs = [
    { label: "Portfolio", href: "/portfolio" },
  ];

  const actions = (
    <>
      {headerTab === "capital_plan" ? (
        <Button variant="secondary" className="b_secondary" icon={<Plus />} onClick={() => setSnapshotModalOpen(true)}>
          Create Snapshot
        </Button>
      ) : null}
      <Dropdown label="Export" className="b_secondary" variant="secondary">
        <Dropdown.Item item="csv">CSV</Dropdown.Item>
        <Dropdown.Item item="excel">Excel</Dropdown.Item>
      </Dropdown>
      <Dropdown
        variant="tertiary"
        size="md"
        icon={<EllipsisVertical />}
        aria-label="Time horizon menu"
        placement="bottom-right"
        onSelect={(selection) => {
          if (selection.action !== "selected") return;
          const item = String(selection.item);
          if (item === "next") {
            void router.push(PORTFOLIO_CAPITAL_PLANNING_NEXT_PATH);
            return;
          }
          if (item === "future") {
            void router.push(PORTFOLIO_CAPITAL_PLANNING_FUTURE_PATH);
            return;
          }
          if (item === "now") {
            void router.push(PORTFOLIO_CAPITAL_PLANNING_PATH);
          }
        }}
      >
        <Dropdown.Item item="now">Now</Dropdown.Item>
        <Dropdown.Item item="next">Next</Dropdown.Item>
        <Dropdown.Item item="future">Future</Dropdown.Item>
      </Dropdown>
    </>
  );

  const headerTabs = (
    <Tabs>
      {pageVariant === "future" ? (
        <Tabs.Tab
          selected={headerTab === "prioritization"}
          onPress={() => setHeaderTab("prioritization")}
          role="button"
        >
          <Tabs.Link>Prioritization</Tabs.Link>
        </Tabs.Tab>
      ) : null}
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
      {pageVariant === "future" ? (
        <Tabs.Tab
          selected={headerTab === "criteria_builder"}
          onPress={() => setHeaderTab("criteria_builder")}
          role="button"
        >
          <Tabs.Link>Criteria Builder</Tabs.Link>
        </Tabs.Tab>
      ) : null}
      {pageVariant === "future" ? (
        <Tabs.Tab
          selected={headerTab === "request_intake_form"}
          onPress={() => setHeaderTab("request_intake_form")}
          role="button"
        >
          <Tabs.Link>Intake Form Builder</Tabs.Link>
        </Tabs.Tab>
      ) : null}
    </Tabs>
  );

  return (
    <>
    <ToolPageLayout
      title="Capital Planning"
      titleAddon={
        <Pill color={pageVariant === "future" ? "green" : "magenta"} style={{ flexShrink: 0 }}>
          {pageVariant === "next" ? "Open Beta" : pageVariant === "future" ? "GA" : "Beta"}
        </Pill>
      }
      icon={<CapitalPlanningIcon size="md" />}
      breadcrumbs={breadcrumbs}
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
      ) : headerTab === "criteria_builder" ? (
        <CriteriaBuilderTabRoot>
          <SplitViewCard>
            <SplitViewCard.Main>
              <SplitViewCard.Section heading="Criteria Builder">
                <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
                  <Typography intent="small" style={{ margin: 0, maxWidth: 720, color: "var(--color-text-secondary)" }}>
                    Add custom scoring criteria to accurately score projects when capital planning.
                  </Typography>
                  {criteriaBuilderSaveError ? (
                    <ErrorBanner role="alert">
                      <Typography intent="body">{criteriaBuilderSaveError}</Typography>
                    </ErrorBanner>
                  ) : null}
                  <CriteriaBuilderDataTable
                    ref={criteriaBuilderTableRef}
                    onRowsChange={clearCriteriaBuilderSaveError}
                    rows={pageVariant === "future" ? criteriaBuilderRows : undefined}
                    onRowsCommit={pageVariant === "future" ? setCriteriaBuilderRows : undefined}
                  />
                </div>
              </SplitViewCard.Section>
            </SplitViewCard.Main>
          </SplitViewCard>
          <CriteriaBuilderPageFooter>
            <Button type="button" variant="tertiary" className="b_tertiary" onClick={onCriteriaBuilderCancel}>
              Cancel
            </Button>
            <Button type="button" variant="primary" onClick={onCriteriaBuilderSave}>
              Save
            </Button>
          </CriteriaBuilderPageFooter>
        </CriteriaBuilderTabRoot>
      ) : headerTab === "prioritization" ? (
        <SplitViewCard>
          <SplitViewCard.Main>
            <SplitViewCard.Section heading="Prioritization">
              <CapitalPlanningPrioritizationTab
                criteriaRows={criteriaBuilderRows}
                criteriaValuesByProjectId={prioritizationCriteriaValues}
                onCriteriaValueChange={onPrioritizationCriteriaValueChange}
              />
            </SplitViewCard.Section>
          </SplitViewCard.Main>
        </SplitViewCard>
      ) : headerTab === "request_intake_form" ? (
        <SplitViewCard>
          <SplitViewCard.Main>
            <SplitViewCard.Section heading="Intake form builder">
              <CapitalPlanningRequestIntakeFormTab />
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
                      background: "var(--color-surface-primary)",
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
                  className="b_tertiary"
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
                  {filterStatus.includes("Concept") ? (
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 2,
                        flexShrink: 0,
                      }}
                    >
                      <Pill color={STATUS_PILL_COLOR.Concept} style={{ flexShrink: 0 }}>
                        Concept projects
                      </Pill>
                      <Button
                        type="button"
                        variant="tertiary"
                        className="b_tertiary"
                        size="sm"
                        icon={<Clear />}
                        aria-label="Remove Concept from status filter"
                        onClick={() =>
                          setFilterStatus((prev) => prev.filter((s) => s !== "Concept"))
                        }
                      />
                    </div>
                  ) : null}
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
                  {capitalPlanTablePlanView === "gantt" ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexShrink: 0,
                        minWidth: 0,
                        maxWidth: "100%",
                      }}
                    >
                      <Typography
                        id={CAPITAL_PLANNING_VIEW_BY_LABEL_ID}
                        intent="small"
                        weight="semibold"
                        as="span"
                        style={{ flexShrink: 0 }}
                      >
                        View by
                      </Typography>
                      <div
                        className="capital-planning-view-by-select-wrap"
                        style={{
                          boxSizing: "border-box",
                          minWidth: 100,
                          maxWidth: "100%",
                          width: 160,
                          flex: "0 0 auto",
                        }}
                      >
                        <Select
                          aria-labelledby={CAPITAL_PLANNING_VIEW_BY_LABEL_ID}
                          className="capital-planning-view-by-select"
                          block
                          placeholder="View by"
                          label={VIEW_BY_OPTIONS.find((o) => o.value === viewByGranularity)?.label}
                          onSelect={(s) => {
                            if (s.action !== "selected") return;
                            const opt = s.item as (typeof VIEW_BY_OPTIONS)[number];
                            setViewByGranularity(opt.value);
                          }}
                        >
                          {VIEW_BY_OPTIONS.map((o) => (
                            <Select.Option key={o.value} value={o} selected={viewByGranularity === o.value}>
                              {o.label}
                            </Select.Option>
                          ))}
                        </Select>
                      </div>
                    </div>
                  ) : null}
                  {pageVariant === "future" ? (
                    <SegmentedController className="b_radiogroup" style={{ flexShrink: 0 }}>
                      <SegmentedController.Segment
                        selected={capitalPlanTablePlanView === "grid"}
                        onClick={() => setPlanView("grid")}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <ViewGrid size="sm" aria-hidden />
                          Grid
                        </span>
                      </SegmentedController.Segment>
                      <SegmentedController.Segment
                        selected={planView === "gantt"}
                        onClick={() => setPlanView("gantt")}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <Gantt size="sm" aria-hidden />
                          Gantt
                        </span>
                      </SegmentedController.Segment>
                    </SegmentedController>
                  ) : null}
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
                      <Button variant="tertiary" className="b_tertiary" size="md" onClick={clearFilterPanel}>
                        Clear All
                      </Button>
                    ) : null}
                    <Button
                      variant="tertiary"
                      className="b_tertiary"
                      icon={<Clear />}
                      onClick={() => setFilterOpen(false)}
                      aria-label="Close filters"
                    />
                  </FilterPanelHeaderActions>
                </FilterPanelHeader>
                <FilterPanelBody>
                  <FilterFieldSection>
                    <FilterFieldLabel htmlFor="capital-planning-filter-status">Stage</FilterFieldLabel>
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
              data-tab-scroll-root
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
              setRowDatesById={setRowDatesById}
              setCurvesByRowId={setCurvesByRowId}
              setPrioritiesByRowId={setPrioritiesByRowId}
              forecastGranularity={
                capitalPlanTablePlanView === "grid" ? "quarter" : viewByGranularity
              }
              planView={capitalPlanTablePlanView}
              onSaveHighLevelBudgetPlannedAmount={onSaveHighLevelBudgetPlannedAmount}
              groupBy={groupBy}
              criteriaColumns={capitalPlanGridCriteriaColumns}
              criteriaValuesByProjectId={prioritizationCriteriaValues}
              onCriteriaValueChange={onPrioritizationCriteriaValueChange}
              showPrioritizationScoreColumn={false}
              renderCriteriaColumnsInGrid={false}
            />
            </div>
            {configureOpen && (
              <CapitalPlanningSidePanel className="capital-planning-configure-panel">
                <FilterPanelHeader>
                  <FilterPanelTitle>Table Settings</FilterPanelTitle>
                  <FilterPanelHeaderActions>
                    <Button variant="tertiary" className="b_tertiary" size="md" onClick={resetTableSettings}>
                      Reset
                    </Button>
                    <Button
                      variant="tertiary"
                      className="b_tertiary"
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
                      style={{ display: "block", marginBottom: 8, color: "var(--color-text-primary)" }}
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
                      borderTop: "1px solid var(--color-border-separator)",
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
                            withCapitalPlanningColumnLocks(
                              capitalPlanningProgramTableDefaultVisibility(pageVariant)
                            )
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
