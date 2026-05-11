import React, { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/router";
import {
  Button,
  Dropdown,
  InfoBanner,
  Modal,
  MultiSelect,
  Pill,
  Search,
  Select,
  SplitViewCard,
  Switch,
  Tabs,
  Toast,
  ToggleButton,
  Token,
  Typography,
} from "@procore/core-react";
import {
  Clear,
  Cog,
  EllipsisVertical,
  ExternalLink,
  Filter,
  Fullscreen,
  FullscreenExit,
  Gantt,
  Pencil,
  Plus,
  Sliders,
  Trash,
  ViewGrid,
  Warning,
} from "@procore/core-icons";
import styled from "styled-components";
import SegmentedControl from "@/components/SegmentedControl";
import ToolPageLayout from "@/components/tools/ToolPageLayout";
import { useResetScrollOnTabChange } from "@/hooks/useResetScrollOnTabChange";
import { useHubFiltersOrNull } from "@/context/HubFilterContext";
import {
  CAPITAL_PLANNING_CRITERIA_BUILDER_CHANGED_EVENT,
  readPersistedCriteriaBuilderRows,
} from "@/utils/capitalPlanningCriteriaBuilderPersistence";
import { projects as healthSeedProjects } from "@/data/seed/projects";
import type { Project } from "@/types/project";
import {
  ChangeHistoryDataTable,
  CHANGE_HISTORY_INITIAL_MOCK_ROWS,
  type ChangeHistoryRow,
} from "@/components/tools/capitalPlanning/ChangeHistoryDataTable";
import {
  formatChangeHistoryTimestamp,
  type CapitalPlanningChangeLogPayload,
} from "@/components/tools/capitalPlanning/capitalPlanningChangeHistory";
import type { CriteriaBuilderRow } from "@/components/tools/capitalPlanning/CriteriaBuilderDataTable";
import { CapitalPlanningPrioritizationTab } from "@/components/tools/capitalPlanning/CapitalPlanningPrioritizationTab";
import { CreateSnapshotModal } from "@/components/tools/capitalPlanning/CreateSnapshotModal";
import {
  computeCapitalPlanningProgramSummaryMetrics,
  type CapitalPlanningProgramSummaryMetrics,
} from "@/components/tools/capitalPlanning/capitalPlanningProgramSummaryMetrics";
import { CapitalPlanningSmartGrid } from "@/components/tools/capitalPlanning/CapitalPlanningSmartGrid";
import { buildPrototypeTargetBudgetForecastOverrides } from "@/components/tools/capitalPlanning/capitalPlanningPrototypeTargetBudgetSeeds";
import { TargetBudgetHierarchyForecastTable } from "@/components/tools/capitalPlanning/TargetBudgetHierarchyForecastTable";
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
  prototypeProjectDescriptionFromName,
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
  assignedHierarchyBuilding,
  assignedHierarchyCampus,
  CAPITAL_PLANNING_GROUP_BY_OPTIONS,
  HIERARCHY_BUILDING_LABELS,
  HIERARCHY_CAMPUS_LABELS,
  type CapitalPlanningGroupBy,
} from "@/components/tools/capitalPlanning/capitalPlanningRowGrouping";

type GroupByMultiOption = { id: CapitalPlanningGroupBy; label: string };

const GROUP_BY_MULTI_OPTIONS: GroupByMultiOption[] = CAPITAL_PLANNING_GROUP_BY_OPTIONS.map((o) => ({
  id: o.value,
  label: o.label,
}));
import { formatDateMMDDYYYY } from "@/utils/date";
import {
  CAPITAL_PLANNING_FISCAL_SETTINGS_CHANGED_EVENT,
  readCapitalPlanningFiscalYearStartMonth,
} from "@/utils/capitalPlanningFiscalSettings";

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

const SNAPSHOT_CURRENT_OPTION = { id: "live", label: "Current" } as const;

type SnapshotHistoryOption = {
  id: string;
  label: string;
  description: string;
  createdBy: string;
  dateLabel: string;
};

type SnapshotSelectId = typeof SNAPSHOT_CURRENT_OPTION.id | string;
type HistoricalSnapshotId = Exclude<SnapshotSelectId, "live">;

const SNAPSHOT_HISTORY_SEED: SnapshotHistoryOption[] = [
  {
    id: "snapshot-q1-board",
    label: "Q1 Board Package",
    description: "Projects and curves frozen for Q1 readout.",
    createdBy: "Priya Shah",
    dateLabel: "03/04/24",
  },
  {
    id: "snapshot-cap-committee",
    label: "Capital Committee — Feb",
    description: "Subset weighted toward campus renewal.",
    createdBy: "Alex Rivera",
    dateLabel: "02/18/24",
  },
  {
    id: "snapshot-fall-baseline",
    label: "Fall Baseline",
    description: "Baseline prior to winter weather assumptions.",
    createdBy: "Jordan Kim",
    dateLabel: "11/02/23",
  },
  {
    id: "snapshot-year-end-close",
    label: "Year-End Close",
    description: "Locked view after fiscal close adjustments.",
    createdBy: "Sam Ortiz",
    dateLabel: "12/20/23",
  },
];

const PROJECT_CURVE_ROTATION_ORDER = [
  "Front-Loaded",
  "Back-Loaded",
  "Bell",
  "Linear",
  "Manual",
] as const;

function formatSnapshotDateLabelShort(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}

/** Delete modal “on [date] at [time] MDT” line from stored snapshot date label (M/D/YY + prototype time). */
function formatDeleteSnapshotWhen(dateLabel: string): string {
  const t = dateLabel.trim();
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/.exec(t);
  if (!m) {
    return `${t} at 07:11 PM MDT`;
  }
  const month = parseInt(m[1], 10);
  const day = parseInt(m[2], 10);
  const y = m[3].length >= 4 ? m[3].slice(-2) : m[3];
  return `${month}/${day}/${y} at 07:11 PM MDT`;
}

function shiftIsoDateByDays(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return iso;
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function roundDollars(n: number): number {
  return Math.round(n * 100) / 100;
}

function rotateCurve(curve: ProjectCurve, steps: number): ProjectCurve {
  if (curve === "") return curve;
  const idx = PROJECT_CURVE_ROTATION_ORDER.indexOf(
    curve as (typeof PROJECT_CURVE_ROTATION_ORDER)[number]
  );
  if (idx < 0) return curve;
  const n = PROJECT_CURVE_ROTATION_ORDER.length;
  const next = (idx + steps + n * 8) % n;
  return PROJECT_CURVE_ROTATION_ORDER[next] as ProjectCurve;
}

type SnapshotTransformPreset = {
  dateShiftDays: number;
  plannedAmountMultiplier: number;
  curveRotationSteps: number;
};

const SNAPSHOT_HISTORY_PRESETS: Record<string, SnapshotTransformPreset> = {
  "snapshot-q1-board": { dateShiftDays: -45, plannedAmountMultiplier: 0.94, curveRotationSteps: 2 },
  "snapshot-cap-committee": { dateShiftDays: -60, plannedAmountMultiplier: 0.92, curveRotationSteps: 1 },
  "snapshot-fall-baseline": { dateShiftDays: -120, plannedAmountMultiplier: 0.88, curveRotationSteps: 3 },
  "snapshot-year-end-close": { dateShiftDays: -200, plannedAmountMultiplier: 0.85, curveRotationSteps: 2 },
};

function presetForHistoricalSnapshot(snapshotId: string): SnapshotTransformPreset | undefined {
  return SNAPSHOT_HISTORY_PRESETS[snapshotId];
}

function rowsForHistoricalSnapshot(
  rows: CapitalPlanningSampleRow[],
  snapshotId: HistoricalSnapshotId
): CapitalPlanningSampleRow[] {
  const preset = presetForHistoricalSnapshot(snapshotId);
  if (!preset) {
    return rows.map((r, i) => {
      const stagger = i % 5;
      const { startDate, endDate } = clampProjectIsoDatesToProgramHorizon(
        shiftIsoDateByDays(r.startDate, -14 - stagger),
        shiftIsoDateByDays(r.endDate, -14 - stagger),
        r.id
      );
      return withZeroPlannedAmountDatesCleared(
        withConceptBudgetColumnsCleared({
          ...r,
          startDate,
          endDate,
          plannedAmount: roundDollars(r.plannedAmount * 0.95),
          remaining: roundDollars(r.remaining * 0.95),
          curve: rotateCurve(r.curve, 1),
        })
      );
    });
  }
  return rows.map((r, i) => {
    const stagger = i % 5;
    const { startDate, endDate } = clampProjectIsoDatesToProgramHorizon(
      shiftIsoDateByDays(r.startDate, preset.dateShiftDays - stagger),
      shiftIsoDateByDays(r.endDate, preset.dateShiftDays - stagger),
      r.id
    );
    return withZeroPlannedAmountDatesCleared(
      withConceptBudgetColumnsCleared({
        ...r,
        startDate,
        endDate,
        plannedAmount: roundDollars(r.plannedAmount * preset.plannedAmountMultiplier),
        remaining: roundDollars(r.remaining * preset.plannedAmountMultiplier),
        curve: rotateCurve(r.curve, preset.curveRotationSteps + (i % 2)),
      })
    );
  });
}

const CAPITAL_PLANNING_SNAPSHOT_SELECT_LABEL_ID = "capital-planning-snapshot-select-label";
const CAPITAL_PLANNING_COMPARISON_SNAPSHOT_SELECT_LABEL_ID =
  "capital-planning-comparison-snapshot-select-label";
const CAPITAL_PLANNING_VIEW_BY_LABEL_ID = "capital-planning-view-by-label";

const VIEW_BY_OPTIONS = [
  { value: "month" as const, label: "Month" },
  { value: "quarter" as const, label: "Quarter" },
  { value: "year" as const, label: "Year" },
] as const;

type CapitalPlanningHeaderTab = "capital_plan" | "target_budget" | "change_history" | "prioritization";

type CapitalPlanningPlanView = "grid" | "gantt";

/** Default / Next / Target Budget / Future portfolio Capital Planning routes. */
export type CapitalPlanningPageVariant =
  | "default"
  | "mvp"
  | "next"
  | "target_budget"
  | "target_budget_2_0"
  | "future";

export interface CapitalPlanningContentProps {
  pageVariant?: CapitalPlanningPageVariant;
  /**
   * When true, render without {@link ToolPageLayout} (no duplicate global header) — for embedding
   * under the Home hub tab.
   */
  embeddedInHub?: boolean;
  /**
   * Home hub: parent renders {@link CapitalPlanSummaryHubCard} in its own row; omit the in-panel summary
   * and receive metrics whenever the visible plan rows change.
   */
  hubEmbedReportSummaryMetrics?: (metrics: CapitalPlanningProgramSummaryMetrics) => void;
}

const PORTFOLIO_CAPITAL_PLANNING_PATH = "/portfolio/capital-planning";
const PORTFOLIO_CAPITAL_PLANNING_MVP_PATH = "/portfolio/capital-planning-mvp";
const PORTFOLIO_CAPITAL_PLANNING_NEXT_PATH = "/portfolio/capital-planning-next";
const PORTFOLIO_CAPITAL_PLANNING_TARGET_BUDGET_PATH = "/portfolio/capital-planning-target-budget";
const PORTFOLIO_CAPITAL_PLANNING_TARGET_BUDGET_2_PATH = "/portfolio/capital-planning-target-budget-2-0";
const PORTFOLIO_CAPITAL_PLANNING_FUTURE_PATH = "/portfolio/capital-planning-future";
const CAPITAL_PLANNING_ADD_TARGET_BUDGET_CTA_EVENT = "capital-planning:add-target-budget-cta";
export default function CapitalPlanningContent({
  pageVariant = "default",
  embeddedInHub = false,
  hubEmbedReportSummaryMetrics,
}: CapitalPlanningContentProps) {
  const router = useRouter();
  const capitalPlanningSettingsPath =
    pageVariant === "next"
      ? "/portfolio/capital-planning-next-settings"
      : pageVariant === "target_budget"
        ? "/portfolio/capital-planning-target-budget-settings"
        : pageVariant === "target_budget_2_0"
        ? "/portfolio/capital-planning-target-budget-settings"
        : pageVariant === "future"
          ? "/portfolio/capital-planning-future-settings"
          : "/portfolio/capital-planning-settings";
  const [fiscalYearStartMonth, setFiscalYearStartMonth] = useState(readCapitalPlanningFiscalYearStartMonth);
  useEffect(() => {
    const sync = () => setFiscalYearStartMonth(readCapitalPlanningFiscalYearStartMonth());
    window.addEventListener(CAPITAL_PLANNING_FISCAL_SETTINGS_CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CAPITAL_PLANNING_FISCAL_SETTINGS_CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const [headerTab, setHeaderTab] = useState<CapitalPlanningHeaderTab>("capital_plan");
  useResetScrollOnTabChange(headerTab);
  useEffect(() => {
    if (embeddedInHub) {
      setHeaderTab("capital_plan");
      setFilterOpen(false);
      setConfigureOpen(false);
      setSearch("");
    }
  }, [embeddedInHub]);
  /** Program table row selection — lifted for the bulk selection banner (same state as the grid checkboxes). */
  const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(() => new Set());
  useEffect(() => {
    if (headerTab !== "capital_plan") {
      setSelectedProjectIds(new Set());
    }
  }, [headerTab]);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  /** Multi-select filters — same interaction model as Procore Data Table filter panels (Projects / Cost Management tables). */
  const [filterStatus, setFilterStatus] = useState<ProjectStatus[]>([]);
  const [filterPriority, setFilterPriority] = useState<ProjectPriority[]>([]);
  const [filterRegions, setFilterRegions] = useState<CapitalPlanningRegion[]>([]);
  /** Target Budget tab only — matches {@link assignedHierarchyCampus} / location hierarchy. */
  const [filterCampusLabels, setFilterCampusLabels] = useState<string[]>([]);
  /** Target Budget tab only — matches {@link assignedHierarchyBuilding} / location hierarchy. */
  const [filterBuildingLabels, setFilterBuildingLabels] = useState<string[]>([]);
  /** Ordered group-by dimensions (toolbar). Empty: grid defaults to region until user picks tiers. Two+ builds nested hierarchy. */
  const [groupBySelection, setGroupBySelection] = useState<GroupByMultiOption[]>(() =>
    pageVariant === "mvp" ? GROUP_BY_MULTI_OPTIONS.filter((option) => option.id === "region") : []
  );
  const groupByDimensions = useMemo(() => groupBySelection.map((o) => o.id), [groupBySelection]);

  const handleGroupBySelectionChange = useCallback((selected: GroupByMultiOption[]) => {
    const selectedIds = new Set(selected.map((g) => g.id));
    const kept = groupBySelection.filter((g) => selectedIds.has(g.id));
    const keptIds = new Set(kept.map((g) => g.id));
    const added = selected.filter((g) => !keptIds.has(g.id));
    setGroupBySelection([...kept, ...added]);
  }, [groupBySelection]);
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
  /** Target Budget tab: survives switching to Capital Plan / Change History (child table unmounts). */
  const [targetBudgetForecastOverrides, setTargetBudgetForecastOverrides] = useState<Record<string, number>>({});
  const prototypeTargetBudgetSeedAppliedRef = useRef(false);
  const [tableRowHeight, setTableRowHeight] = useState<TableRowHeight>("sm");
  const [tableFullscreen, setTableFullscreen] = useState(false);
  const [criteriaBuilderRows, setCriteriaBuilderRows] = useState<CriteriaBuilderRow[]>(() =>
    readPersistedCriteriaBuilderRows()
  );
  const [prioritizationCriteriaValues, setPrioritizationCriteriaValues] = useState<
    Record<string, Record<string, string>>
  >(() => buildInitialPrioritizationCriteriaValues());
  const [snapshotModalOpen, setSnapshotModalOpen] = useState(false);
  const [snapshotEditModalOpen, setSnapshotEditModalOpen] = useState(false);
  const [editingSnapshotId, setEditingSnapshotId] = useState<string | null>(null);
  const [snapshotDeleteModalOpen, setSnapshotDeleteModalOpen] = useState(false);
  const [snapshotPendingDeleteId, setSnapshotPendingDeleteId] = useState<string | null>(null);
  const [snapshotHistoryOptions, setSnapshotHistoryOptions] = useState<SnapshotHistoryOption[]>(
    () => [...SNAPSHOT_HISTORY_SEED]
  );
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<SnapshotSelectId>(SNAPSHOT_CURRENT_OPTION.id);
  const [snapshotToastMessage, setSnapshotToastMessage] = useState<string | null>(null);
  /** Filters snapshot menu options while the Select search field is used (Figma 4611-94196). */
  const [snapshotSelectSearchQuery, setSnapshotSelectSearchQuery] = useState("");
  const [comparisonSnapshotSelectSearchQuery, setComparisonSnapshotSelectSearchQuery] = useState("");
  const [selectedComparisonSnapshotId, setSelectedComparisonSnapshotId] = useState<SnapshotSelectId | null>(null);
  const [nowBetaBannerDismissed, setNowBetaBannerDismissed] = useState(false);
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
  const [capitalPlanningChangeLog, setCapitalPlanningChangeLog] = useState<ChangeHistoryRow[]>(() => [
    ...CHANGE_HISTORY_INITIAL_MOCK_ROWS,
  ]);

  const appendCapitalPlanningChange = useCallback((payload: CapitalPlanningChangeLogPayload) => {
    const row: ChangeHistoryRow = {
      id: `cp-ch-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      date: formatChangeHistoryTimestamp(),
      description: payload.description ?? prototypeProjectDescriptionFromName(payload.project),
      actionBy: payload.actionBy ?? "You",
      type: payload.type ?? "Project",
      project: payload.project,
      changed: payload.changed,
      from: payload.from,
      to: payload.to,
    };
    setCapitalPlanningChangeLog((prev) => [row, ...prev]);
  }, []);

  const onSaveHighLevelBudgetPlannedAmount = useCallback((rowId: string, plannedAmount: number) => {
    setPlannedAmountHighLevelBudgetByRowId((prev) => ({ ...prev, [rowId]: plannedAmount }));
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
    if (pageVariant !== "future" && headerTab === "prioritization") {
      setHeaderTab("capital_plan");
    }
  }, [pageVariant, headerTab]);

  useEffect(() => {
    if (pageVariant !== "target_budget" && pageVariant !== "target_budget_2_0" && headerTab === "target_budget") {
      setHeaderTab("capital_plan");
    }
  }, [pageVariant, headerTab]);

  useEffect(() => {
    if (headerTab === "target_budget") {
      setTableFullscreen(false);
    }
  }, [headerTab]);

  useEffect(() => {
    if (pageVariant !== "future") return;
    const sync = () => setCriteriaBuilderRows(readPersistedCriteriaBuilderRows());
    window.addEventListener(CAPITAL_PLANNING_CRITERIA_BUILDER_CHANGED_EVENT, sync);
    return () => window.removeEventListener(CAPITAL_PLANNING_CRITERIA_BUILDER_CHANGED_EVENT, sync);
  }, [pageVariant]);

  const hubFilterCtx = useHubFiltersOrNull();

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

  /** Home hub: limit the program table + summary rollups to projects that pass the page-level hub filter bar. */
  const projectRowsForEmbeddedHub = useMemo(() => {
    if (!embeddedInHub) return projectRows;
    const seedList = hubFilterCtx?.filteredSeedProjects ?? healthSeedProjects;
    const allowed = new Set(seedList.map((p: Project) => p.id));
    return projectRows.filter((r) => allowed.has(r.projectId));
  }, [embeddedInHub, hubFilterCtx?.filteredSeedProjects, projectRows]);

  const historicalSnapshotSelected = selectedSnapshotId !== SNAPSHOT_CURRENT_OPTION.id;

  useEffect(() => {
    if (historicalSnapshotSelected) {
      setSelectedProjectIds(new Set());
    }
  }, [historicalSnapshotSelected]);

  const filteredSnapshotHistoryOptions = useMemo(() => {
    const q = snapshotSelectSearchQuery.trim().toLowerCase();
    if (!q) return snapshotHistoryOptions;
    return snapshotHistoryOptions.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q) ||
        o.createdBy.toLowerCase().includes(q) ||
        o.dateLabel.toLowerCase().includes(q)
    );
  }, [snapshotHistoryOptions, snapshotSelectSearchQuery]);

  const snapshotSearchShowsCurrent = useMemo(() => {
    const q = snapshotSelectSearchQuery.trim().toLowerCase();
    return !q || SNAPSHOT_CURRENT_OPTION.label.toLowerCase().includes(q);
  }, [snapshotSelectSearchQuery]);

  const snapshotSelectDisplayLabel = useMemo(() => {
    if (selectedSnapshotId === SNAPSHOT_CURRENT_OPTION.id) return SNAPSHOT_CURRENT_OPTION.label;
    return snapshotHistoryOptions.find((o) => o.id === selectedSnapshotId)?.label;
  }, [selectedSnapshotId, snapshotHistoryOptions]);

  const filteredComparisonSnapshotHistoryOptions = useMemo(() => {
    const q = comparisonSnapshotSelectSearchQuery.trim().toLowerCase();
    if (!q) return snapshotHistoryOptions;
    return snapshotHistoryOptions.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q) ||
        o.createdBy.toLowerCase().includes(q) ||
        o.dateLabel.toLowerCase().includes(q)
    );
  }, [snapshotHistoryOptions, comparisonSnapshotSelectSearchQuery]);

  const comparisonSnapshotSearchShowsCurrent = useMemo(() => {
    const q = comparisonSnapshotSelectSearchQuery.trim().toLowerCase();
    return !q || SNAPSHOT_CURRENT_OPTION.label.toLowerCase().includes(q);
  }, [comparisonSnapshotSelectSearchQuery]);

  const comparisonSnapshotSelectDisplayLabel = useMemo((): string | undefined => {
    if (selectedComparisonSnapshotId == null) return undefined;
    if (selectedComparisonSnapshotId === SNAPSHOT_CURRENT_OPTION.id) return SNAPSHOT_CURRENT_OPTION.label;
    return snapshotHistoryOptions.find((o) => o.id === selectedComparisonSnapshotId)?.label;
  }, [selectedComparisonSnapshotId, snapshotHistoryOptions]);

  const comparisonHistoricalSnapshotSelected =
    selectedComparisonSnapshotId != null &&
    selectedComparisonSnapshotId !== SNAPSHOT_CURRENT_OPTION.id;

  const selectedHistoricalSnapshotMeta = useMemo(() => {
    if (!historicalSnapshotSelected) return null;
    return snapshotHistoryOptions.find((o) => o.id === selectedSnapshotId) ?? null;
  }, [historicalSnapshotSelected, snapshotHistoryOptions, selectedSnapshotId]);

  const editingSnapshot = useMemo(
    () =>
      editingSnapshotId ? snapshotHistoryOptions.find((o) => o.id === editingSnapshotId) ?? null : null,
    [editingSnapshotId, snapshotHistoryOptions]
  );

  const snapshotPendingDeleteMeta = useMemo(
    () =>
      snapshotPendingDeleteId
        ? snapshotHistoryOptions.find((o) => o.id === snapshotPendingDeleteId) ?? null
        : null,
    [snapshotHistoryOptions, snapshotPendingDeleteId]
  );

  useEffect(() => {
    if (!snapshotToastMessage) return;
    const t = window.setTimeout(() => setSnapshotToastMessage(null), 4500);
    return () => window.clearTimeout(t);
  }, [snapshotToastMessage]);

  const projectRowsForSelectedSnapshot = useMemo(() => {
    const base = embeddedInHub ? projectRowsForEmbeddedHub : projectRows;
    if (!historicalSnapshotSelected) return base;
    return rowsForHistoricalSnapshot(base, selectedSnapshotId as HistoricalSnapshotId);
  }, [
    embeddedInHub,
    historicalSnapshotSelected,
    projectRows,
    projectRowsForEmbeddedHub,
    selectedSnapshotId,
  ]);

  const filterPanelHasActiveSelections =
    headerTab === "target_budget"
      ? filterRegions.length > 0 || filterCampusLabels.length > 0 || filterBuildingLabels.length > 0
      : filterStatus.length > 0 || filterPriority.length > 0 || filterRegions.length > 0;

  const clearFilterPanel = useCallback(() => {
    setFilterStatus([]);
    setFilterPriority([]);
    setFilterRegions([]);
    setFilterCampusLabels([]);
    setFilterBuildingLabels([]);
  }, []);

  const resetTableSettings = useCallback(() => {
    setColumnVisibility(withCapitalPlanningColumnLocks(capitalPlanningProgramTableDefaultVisibility(pageVariant)));
    setTableRowHeight("sm");
  }, [pageVariant]);

  const filteredProjectRows = useMemo((): CapitalPlanningSampleRow[] => {
    const q = search.trim().toLowerCase();
    let rows = projectRowsForSelectedSnapshot;
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
    if (headerTab === "target_budget") {
      if (filterRegions.length > 0) {
        rows = rows.filter((r) => filterRegions.includes(assignedCapitalPlanningRegion(r.id)));
      }
      if (filterCampusLabels.length > 0) {
        rows = rows.filter((r) => filterCampusLabels.includes(assignedHierarchyCampus(r.id)));
      }
      if (filterBuildingLabels.length > 0) {
        rows = rows.filter((r) => filterBuildingLabels.includes(assignedHierarchyBuilding(r.id)));
      }
    } else {
      if (filterStatus.length > 0) {
        rows = rows.filter((r) => filterStatus.includes(r.status));
      }
      if (filterPriority.length > 0) {
        rows = rows.filter((r) => filterPriority.includes(r.priority));
      }
      if (filterRegions.length > 0) {
        rows = rows.filter((r) => filterRegions.includes(assignedCapitalPlanningRegion(r.id)));
      }
    }
    return rows;
  }, [
    projectRowsForSelectedSnapshot,
    search,
    headerTab,
    filterStatus,
    filterPriority,
    filterRegions,
    filterCampusLabels,
    filterBuildingLabels,
  ]);

  useEffect(() => {
    if (prototypeTargetBudgetSeedAppliedRef.current) return;
    if (filteredProjectRows.length === 0) return;
    const seed = buildPrototypeTargetBudgetForecastOverrides(filteredProjectRows, fiscalYearStartMonth);
    if (Object.keys(seed).length === 0) return;
    setTargetBudgetForecastOverrides(seed);
    prototypeTargetBudgetSeedAppliedRef.current = true;
  }, [filteredProjectRows, fiscalYearStartMonth]);

  const programSummaryMetrics = useMemo(
    () => computeCapitalPlanningProgramSummaryMetrics(filteredProjectRows),
    [filteredProjectRows]
  );

  useEffect(() => {
    if (!embeddedInHub || !hubEmbedReportSummaryMetrics) return;
    hubEmbedReportSummaryMetrics(programSummaryMetrics);
  }, [embeddedInHub, hubEmbedReportSummaryMetrics, programSummaryMetrics]);

  const breadcrumbs = [
    { label: "Portfolio", href: "/portfolio" },
  ];

  const actions = (
    <>
      {pageVariant === "target_budget_2_0" && headerTab === "target_budget" ? (
        <Button
          variant="secondary"
          className="b_secondary"
          icon={<Plus />}
          onClick={() => {
            window.dispatchEvent(new Event(CAPITAL_PLANNING_ADD_TARGET_BUDGET_CTA_EVENT));
          }}
        >
          Add Target Budget
        </Button>
      ) : null}
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
          if (item === "mvp") {
            void router.push(PORTFOLIO_CAPITAL_PLANNING_MVP_PATH);
            return;
          }
          if (item === "target_budget") {
            void router.push(PORTFOLIO_CAPITAL_PLANNING_TARGET_BUDGET_PATH);
            return;
          }
          if (item === "target_budget_2_0") {
            void router.push(PORTFOLIO_CAPITAL_PLANNING_TARGET_BUDGET_2_PATH);
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
        <Dropdown.Item item="mvp">MVP</Dropdown.Item>
        <Dropdown.Item item="next">Next</Dropdown.Item>
        <Dropdown.Item item="target_budget">Target Budgets</Dropdown.Item>
        <Dropdown.Item item="target_budget_2_0">Target Budget 2.0</Dropdown.Item>
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
      {pageVariant === "target_budget" || pageVariant === "target_budget_2_0" ? (
        <Tabs.Tab
          selected={headerTab === "target_budget"}
          onPress={() => setHeaderTab("target_budget")}
          role="button"
        >
          <Tabs.Link>Target Budgets</Tabs.Link>
        </Tabs.Tab>
      ) : null}
      <Tabs.Tab
        selected={headerTab === "change_history"}
        onPress={() => setHeaderTab("change_history")}
        role="button"
      >
        <Tabs.Link>Change History</Tabs.Link>
      </Tabs.Tab>
    </Tabs>
  );

  const planningBody = (
    <>
      {headerTab === "change_history" ? (
        <SplitViewCard>
          <SplitViewCard.Main>
            <SplitViewCard.Section heading="Change History">
              <ChangeHistoryDataTable rows={capitalPlanningChangeLog} />
            </SplitViewCard.Section>
          </SplitViewCard.Main>
        </SplitViewCard>
      ) : headerTab === "prioritization" ? (
        <SplitViewCard>
          <SplitViewCard.Main>
            <SplitViewCard.Section heading="Prioritization">
              <CapitalPlanningPrioritizationTab
                criteriaRows={criteriaBuilderRows}
                criteriaValuesByProjectId={prioritizationCriteriaValues}
                onCriteriaValueChange={onPrioritizationCriteriaValueChange}
                programPageVariant={pageVariant}
              />
            </SplitViewCard.Section>
          </SplitViewCard.Main>
        </SplitViewCard>
      ) : (
      <>
      {!embeddedInHub &&
      (pageVariant === "default" || pageVariant === "mvp") &&
      headerTab === "capital_plan" &&
      !nowBetaBannerDismissed ? (
        <InfoBanner style={{ marginBottom: 12, minHeight: 76 }}>
          <div
            style={{
              minHeight: 76,
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <Typography
              intent="small"
              as="p"
              style={{
                margin: 0,
                color: "var(--color-text-primary)",
                fontSize: 14,
                lineHeight: "20px",
                display: "flex",
                alignItems: "baseline",
                flexWrap: "wrap",
                gap: 0,
                flex: "1 1 520px",
                minWidth: 0,
              }}
            >
              <span style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>
                New! Capital Planning in Closed Beta
              </span>
              <span>
                Create a multi-year capital plan, assign early planned cost to projects, forecast
                planned project costs, and align costs with your organizational goals. To get started,
                assign your projects to programs.
              </span>
            </Typography>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <Button type="button" variant="secondary" className="b_secondary" size="md">
                Support Article
              </Button>
              <Button
                type="button"
                variant="tertiary"
                className="b_tertiary"
                size="md"
                icon={<Clear />}
                aria-label="Dismiss closed beta banner"
                onClick={() => setNowBetaBannerDismissed(true)}
              />
            </div>
          </div>
        </InfoBanner>
      ) : null}
      {selectedHistoricalSnapshotMeta &&
      historicalSnapshotSelected &&
      !embeddedInHub &&
      headerTab !== "target_budget" ? (
        <div
          style={{
            marginBottom: 16,
            padding: "16px 20px",
            borderRadius: 8,
            border: "1px solid var(--color-border-separator)",
            background: "var(--color-surface-primary)",
            boxSizing: "border-box",
            maxWidth: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                minWidth: 0,
                flex: "1 1 280px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <Typography intent="h3" as="h2" style={{ margin: 0, fontWeight: 600 }}>
                {selectedHistoricalSnapshotMeta.label}
              </Typography>
              <Typography intent="small" style={{ margin: 0, color: "var(--color-text-secondary)" }}>
                {selectedHistoricalSnapshotMeta.description}
              </Typography>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <Button
                type="button"
                variant="secondary"
                className="b_secondary"
                size="md"
                onClick={() => {
                  setEditingSnapshotId(selectedHistoricalSnapshotMeta.id);
                  setSnapshotEditModalOpen(true);
                }}
              >
                Edit
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="b_secondary"
                size="md"
                icon={<Trash />}
                aria-label="Delete snapshot"
                onClick={() => {
                  setSnapshotPendingDeleteId(selectedHistoricalSnapshotMeta.id);
                  setSnapshotDeleteModalOpen(true);
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
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
                marginBottom: embeddedInHub ? 0 : 12,
              }}
            >
            {embeddedInHub ? (
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
                <Typography
                  intent="h3"
                  as="h2"
                  style={{
                    margin: 0,
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                    fontSize: 16,
                    letterSpacing: "0.15px",
                    minWidth: 0,
                  }}
                >
                  Capital Plan
                </Typography>
                <Button
                  type="button"
                  variant="tertiary"
                  className="b_tertiary"
                  icon={<ExternalLink />}
                  onClick={() => {
                    void router.push(PORTFOLIO_CAPITAL_PLANNING_PATH);
                  }}
                  style={{ flexShrink: 0 }}
                >
                  Open Page
                </Button>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  justifyContent: headerTab === "target_budget" ? "flex-end" : "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                  width: "100%",
                  minWidth: 0,
                }}
              >
                {headerTab !== "target_budget" ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 24,
                      flex: "1 1 auto",
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
                        style={{ minWidth: 200, maxWidth: "100%", flex: "1 1 auto", width: 250 }}
                      >
                        <Select
                          aria-labelledby={CAPITAL_PLANNING_SNAPSHOT_SELECT_LABEL_ID}
                          className={`capital-planning-snapshot-select${
                            historicalSnapshotSelected ? " capital-planning-snapshot-select--historical" : ""
                          }`}
                          block
                          placeholder="Select snapshot"
                          label={snapshotSelectDisplayLabel}
                          onClear={
                            selectedSnapshotId !== SNAPSHOT_CURRENT_OPTION.id
                              ? () => setSelectedSnapshotId(SNAPSHOT_CURRENT_OPTION.id)
                              : undefined
                          }
                          onSearch={(e: ChangeEvent<HTMLInputElement>) =>
                            setSnapshotSelectSearchQuery(e.target.value)
                          }
                          afterHide={() => setSnapshotSelectSearchQuery("")}
                          emptyMessage="No snapshots match your search."
                          onSelect={(selection) => {
                            if (selection.action !== "selected") return;
                            const item = selection.item as typeof SNAPSHOT_CURRENT_OPTION | SnapshotHistoryOption;
                            setSelectedSnapshotId(item.id);
                          }}
                        >
                          {snapshotSearchShowsCurrent ? (
                            <Select.Option
                              key={SNAPSHOT_CURRENT_OPTION.id}
                              value={SNAPSHOT_CURRENT_OPTION}
                              selected={selectedSnapshotId === SNAPSHOT_CURRENT_OPTION.id}
                            >
                              <div className="capital-planning-snapshot-select-option-row">
                                <span style={{ fontWeight: 600 }}>{SNAPSHOT_CURRENT_OPTION.label}</span>
                              </div>
                            </Select.Option>
                          ) : null}
                          {filteredSnapshotHistoryOptions.map((opt, index) => (
                            <Select.Option key={opt.id} value={opt} selected={selectedSnapshotId === opt.id}>
                              <div
                                className="capital-planning-snapshot-select-option-row"
                                style={
                                  index === 0 && snapshotSearchShowsCurrent
                                    ? {
                                        marginTop: 10,
                                        paddingTop: 10,
                                        borderTop: "1px solid var(--color-border-separator)",
                                      }
                                    : undefined
                                }
                              >
                                <span style={{ fontWeight: 600 }}>{opt.label}</span>
                                <div className="capital-planning-snapshot-select-option-meta">
                                  {opt.createdBy} · {opt.dateLabel}
                                </div>
                              </div>
                            </Select.Option>
                          ))}
                        </Select>
                      </div>
                    </div>
                  ) : null}
                  {pageVariant === "future" ? (
                    <div style={{ flexShrink: 0 }}>
                      <SegmentedControl>
                        <SegmentedControl.Segment
                          icon={<ViewGrid size="sm" aria-hidden />}
                          label="Grid"
                          selected={capitalPlanTablePlanView === "grid"}
                          onClick={() => setPlanView("grid")}
                        />
                        <SegmentedControl.Segment
                          icon={<Gantt size="sm" aria-hidden />}
                          label="Gantt"
                          selected={planView === "gantt"}
                          onClick={() => setPlanView("gantt")}
                        />
                      </SegmentedControl>
                    </div>
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
                      Configure
                    </ToggleButton>
                  </div>
                </div>
              ) : null}
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
            {!embeddedInHub && filterOpen && (
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
                  {headerTab === "target_budget" ? (
                    <>
                      <FilterFieldSection>
                        <FilterFieldLabel htmlFor="capital-planning-filter-region-tb">Region</FilterFieldLabel>
                        <Select
                          id="capital-planning-filter-region-tb"
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
                      <FilterFieldSection>
                        <FilterFieldLabel htmlFor="capital-planning-filter-campus-tb">Campus</FilterFieldLabel>
                        <Select
                          id="capital-planning-filter-campus-tb"
                          placeholder="Select values"
                          label={filterCampusLabels.length ? `${filterCampusLabels.length} selected` : undefined}
                          onSelect={(s) => {
                            if (s.action !== "selected") return;
                            setFilterCampusLabels((prev) => toggleIncluded(prev, s.item as string));
                          }}
                          onClear={() => setFilterCampusLabels([])}
                          block
                        >
                          {HIERARCHY_CAMPUS_LABELS.map((v) => (
                            <Select.Option key={v} value={v} selected={filterCampusLabels.includes(v)}>
                              {v}
                            </Select.Option>
                          ))}
                        </Select>
                      </FilterFieldSection>
                      <FilterFieldSection>
                        <FilterFieldLabel htmlFor="capital-planning-filter-building-tb">Building</FilterFieldLabel>
                        <Select
                          id="capital-planning-filter-building-tb"
                          placeholder="Select values"
                          label={filterBuildingLabels.length ? `${filterBuildingLabels.length} selected` : undefined}
                          onSelect={(s) => {
                            if (s.action !== "selected") return;
                            setFilterBuildingLabels((prev) => toggleIncluded(prev, s.item as string));
                          }}
                          onClear={() => setFilterBuildingLabels([])}
                          block
                        >
                          {HIERARCHY_BUILDING_LABELS.map((v) => (
                            <Select.Option key={v} value={v} selected={filterBuildingLabels.includes(v)}>
                              {v}
                            </Select.Option>
                          ))}
                        </Select>
                      </FilterFieldSection>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </FilterPanelBody>
              </CapitalPlanningSidePanel>
            )}
            {/* Selection strip above the bordered table scrollport — not inside the data table Card / scroll region. */}
            <div className="capital-planning-table-and-banner-stack">
            {headerTab === "capital_plan" && pageVariant === "future" && selectedProjectIds.size > 0 ? (
              <div
                className="capital-planning-selection-banner"
                role="region"
                aria-label="Bulk actions for selected projects"
              >
                <Button
                  type="button"
                  variant="secondary"
                  className="b_secondary"
                  icon={<Pencil />}
                  disabled={embeddedInHub || historicalSnapshotSelected}
                  onClick={() => setSnapshotToastMessage("Edit Values — prototype")}
                >
                  Edit Values
                </Button>
                <div className="capital-planning-selection-banner__meta">
                  <Typography intent="small" color="gray45" as="span">
                    {selectedProjectIds.size.toLocaleString()} of{" "}
                    {filteredProjectRows.length.toLocaleString()} items selected
                  </Typography>
                  <Button
                    type="button"
                    variant="tertiary"
                    className="b_tertiary"
                    icon={<Clear />}
                    aria-label="Dismiss selection"
                    onClick={() => setSelectedProjectIds(new Set())}
                  />
                </div>
              </div>
            ) : null}
            {headerTab === "target_budget" ? (
              <TargetBudgetHierarchyForecastTable
                filteredProjectRows={filteredProjectRows}
                fiscalYearStartMonth={fiscalYearStartMonth}
                columnVisibility={columnVisibility}
                readOnly={embeddedInHub || historicalSnapshotSelected}
                targetBudgetForecastOverrides={targetBudgetForecastOverrides}
                setTargetBudgetForecastOverrides={setTargetBudgetForecastOverrides}
                disableForecastColumnToggles={pageVariant === "target_budget_2_0"}
                addTargetBudgetCtaEventName={CAPITAL_PLANNING_ADD_TARGET_BUDGET_CTA_EVENT}
                showTotalTargetsColumn={pageVariant === "target_budget_2_0"}
              />
            ) : (
            <>
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
              fiscalYearStartMonth={fiscalYearStartMonth}
              filteredProjectRows={filteredProjectRows}
              selectedProjectIds={selectedProjectIds}
              setSelectedProjectIds={setSelectedProjectIds}
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
              plannedAmountHighLevelBudgetByRowId={plannedAmountHighLevelBudgetByRowId}
              groupByDimensions={groupByDimensions}
              criteriaColumns={capitalPlanGridCriteriaColumns}
              criteriaValuesByProjectId={prioritizationCriteriaValues}
              onCriteriaValueChange={onPrioritizationCriteriaValueChange}
              showPrioritizationScoreColumn={false}
              renderCriteriaColumnsInGrid={false}
              programPageVariant={pageVariant}
              readOnly={embeddedInHub || historicalSnapshotSelected}
              onCapitalPlanningChange={appendCapitalPlanningChange}
              targetBudgetForecastOverrides={targetBudgetForecastOverrides}
              forecastComparisonSnapshotLabel={
                pageVariant === "default" || pageVariant === "mvp"
                  ? null
                  : selectedComparisonSnapshotId != null
                    ? (comparisonSnapshotSelectDisplayLabel ?? "")
                    : null
              }
              forecastPrimarySnapshotHeaderLabel={
                snapshotSelectDisplayLabel ?? SNAPSHOT_CURRENT_OPTION.label
              }
              forecastComparisonPlannedMultiplier={
                pageVariant === "default" || pageVariant === "mvp"
                  ? 1
                  : selectedComparisonSnapshotId == null ||
                      selectedComparisonSnapshotId === SNAPSHOT_CURRENT_OPTION.id
                    ? 1
                    : SNAPSHOT_HISTORY_PRESETS[selectedComparisonSnapshotId]?.plannedAmountMultiplier ?? 1
              }
            />
            </div>
            </>
            )}
            </div>
            {!embeddedInHub && configureOpen && (
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
                    <SegmentedControl>
                      <SegmentedControl.Segment
                        selected={tableRowHeight === "sm"}
                        onClick={() => setTableRowHeight("sm")}
                        label="Small"
                        tooltip="Compact row height"
                      />
                      <SegmentedControl.Segment
                        selected={tableRowHeight === "md"}
                        onClick={() => setTableRowHeight("md")}
                        label="Medium"
                        tooltip="Default row height"
                      />
                      <SegmentedControl.Segment
                        selected={tableRowHeight === "lg"}
                        onClick={() => setTableRowHeight("lg")}
                        label="Large"
                        tooltip="Expanded row height"
                      />
                    </SegmentedControl>
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
      </>
      )}
    </>
  );

  const betaPill = (
    <Pill
      color={
        pageVariant === "future" ? "green" : pageVariant === "next" || pageVariant === "target_budget" ? "blue" : "magenta"
      }
      style={{ flexShrink: 0 }}
    >
      {pageVariant === "next" || pageVariant === "target_budget"
        ? "Open Beta"
        : pageVariant === "future"
          ? "GA"
          : "Beta"}
    </Pill>
  );

  return (
    <>
      {embeddedInHub ? (
        <div
          className="capital-planning-embed-hub"
          style={{
            border: "1px solid var(--color-border-separator)",
            borderRadius: 8,
            background: "var(--color-surface-primary)",
            overflow: "hidden",
            flex: "1 1 0",
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          <div
            style={{
              flex: "1 1 0",
              minHeight: 0,
              minWidth: 0,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {planningBody}
          </div>
        </div>
      ) : (
        <ToolPageLayout
          title="Capital Planning"
          titleAddon={betaPill}
          icon={
            <Button
              type="button"
              variant="secondary"
              className="b_secondary"
              icon={<Cog />}
              onClick={() => {
                void router.push(capitalPlanningSettingsPath);
              }}
              aria-label="Capital Planning settings"
            />
          }
          breadcrumbs={breadcrumbs}
          actions={actions}
          tabs={headerTabs}
        >
          {planningBody}
        </ToolPageLayout>
      )}
      <CreateSnapshotModal
        open={snapshotModalOpen}
        onClose={() => setSnapshotModalOpen(false)}
        onSubmit={({ name, description }) => {
          const id = `snapshot-${Date.now()}`;
          const dateLabel = formatSnapshotDateLabelShort(new Date());
          setSnapshotHistoryOptions((prev) => [
            {
              id,
              label: name,
              description,
              createdBy: "Alex Rivera",
              dateLabel,
            },
            ...prev,
          ]);
          setSelectedSnapshotId(id);
          setSnapshotToastMessage("Snapshot created.");
        }}
      />
      <CreateSnapshotModal
        mode="edit"
        open={snapshotEditModalOpen}
        onClose={() => {
          setSnapshotEditModalOpen(false);
          setEditingSnapshotId(null);
        }}
        initialName={editingSnapshot?.label ?? ""}
        initialDescription={editingSnapshot?.description ?? ""}
        createdByLabel={editingSnapshot?.createdBy ?? "Alex Rivera"}
        onSubmit={({ name, description }) => {
          if (!editingSnapshotId) return;
          setSnapshotHistoryOptions((prev) =>
            prev.map((o) =>
              o.id === editingSnapshotId ? { ...o, label: name.trim(), description: description.trim() } : o
            )
          );
          setSnapshotToastMessage("Snapshot saved.");
        }}
      />
      <Modal
        open={snapshotDeleteModalOpen}
        onClose={() => {
          setSnapshotDeleteModalOpen(false);
          setSnapshotPendingDeleteId(null);
        }}
        howToClose={["x", "scrim"]}
        role="dialog"
        width="sm"
        placement="center"
      >
        <Modal.Header>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              width: "100%",
              minWidth: 0,
            }}
          >
            <Warning
              size="md"
              aria-hidden
              style={{ flexShrink: 0, color: "#f5a623", marginTop: 2 }}
            />
            <Modal.Heading level={2} style={{ flex: "1 1 auto", minWidth: 0 }}>
              Delete Snapshot?
            </Modal.Heading>
          </div>
        </Modal.Header>
        <Modal.Body>
          <Typography intent="body" style={{ margin: 0 }}>
            {snapshotPendingDeleteMeta
              ? `Delete ${snapshotPendingDeleteMeta.label} created by ${snapshotPendingDeleteMeta.createdBy} on ${formatDeleteSnapshotWhen(snapshotPendingDeleteMeta.dateLabel)}. Deleting this snapshot cannot be undone and will remove it from this view.`
              : "Deleting this snapshot cannot be undone and will remove it from this view."}
          </Typography>
        </Modal.Body>
        <Modal.Footer>
          <Modal.FooterButtons>
            <Button
              variant="primary"
              style={{
                background: "var(--color-orange-50, #f26925)",
                borderColor: "var(--color-orange-50, #f26925)",
                color: "#fff",
              }}
              onClick={() => {
                const id = snapshotPendingDeleteId;
                if (!id) return;
                setSnapshotHistoryOptions((prev) => prev.filter((o) => o.id !== id));
                setSelectedSnapshotId((current) => (current === id ? SNAPSHOT_CURRENT_OPTION.id : current));
                setSnapshotDeleteModalOpen(false);
                setSnapshotPendingDeleteId(null);
                setSnapshotToastMessage("Snapshot deleted.");
              }}
            >
              Delete
            </Button>
          </Modal.FooterButtons>
        </Modal.Footer>
      </Modal>
      {snapshotToastMessage ? (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 2000,
            maxWidth: "min(560px, calc(100vw - 32px))",
          }}
        >
          <Toast variant="success">
            <Toast.Text>{snapshotToastMessage}</Toast.Text>
          </Toast>
        </div>
      ) : null}
    </>
  );
}
