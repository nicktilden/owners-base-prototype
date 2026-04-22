import type { DropdownFlyoutOption } from "@procore/core-react";
import { capitalPlanning } from "@/data/seed/capital_planning";
import type { CapitalPlanningRow, ProjectStatus, ProjectPriority, ProjectCurve } from "@/types/capitalPlanning";

export {
  PROJECT_STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  CURVE_OPTIONS,
} from "@/types/capitalPlanning";

export type { ProjectStatus, ProjectPriority, ProjectCurve, CapitalPlanningRow } from "@/types/capitalPlanning";

/**
 * Prototype program "regions" for Capital Planning table grouping.
 * {@link assignedCapitalPlanningRegion} picks one per row id (stable, pseudorandom spread).
 */
export const CAPITAL_PLANNING_REGIONS = [
  "Pacific Northwest",
  "Mountain West",
  "Southwest",
  "Central Plains",
  "Mid-Atlantic",
  "Southeast",
] as const;

export type CapitalPlanningRegion = (typeof CAPITAL_PLANNING_REGIONS)[number];

function hashRowIdForRegionBucket(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = Math.imul(31, h) + id.charCodeAt(i);
  }
  return Math.abs(h);
}

/** Region bucket for grouping (same id always maps to the same region). */
export function assignedCapitalPlanningRegion(rowId: string): CapitalPlanningRegion {
  return CAPITAL_PLANNING_REGIONS[hashRowIdForRegionBucket(rowId) % CAPITAL_PLANNING_REGIONS.length]!;
}

/** Shown in the Curve `SelectCell` when {@link ProjectCurve} is unset (`""`). */
export const CURVE_SELECT_PLACEHOLDER_LABEL = "Select Curve";

export const STATUS_PILL_COLOR: Record<
  ProjectStatus,
  "blue" | "cyan" | "gray" | "green" | "magenta" | "yellow"
> = {
  "Pre-Construction": "blue",
  "Course of Construction": "green",
  Concept: "yellow",
  Bidding: "blue",
};

/** Prioritization workflow column (Capital Planning prioritization tab). */
export const PRIORITIZATION_STATUS_OPTIONS = [
  "Unassigned",
  "Under Review",
  "Approved",
  "Rejected",
] as const;

export type PrioritizationStatusOption = (typeof PRIORITIZATION_STATUS_OPTIONS)[number];

/** Pill colors for the prioritization workflow column (matches {@link PRIORITIZATION_STATUS_OPTIONS}). */
export const PRIORITIZATION_STATUS_PILL_COLOR: Record<
  PrioritizationStatusOption,
  "blue" | "cyan" | "gray" | "green" | "magenta" | "yellow"
> = {
  Unassigned: "gray",
  "Under Review": "yellow",
  Approved: "green",
  Rejected: "magenta",
};

export const LUMP_SUM_PLANNED_AMOUNT_SOURCE = "lump-sum-manual";

/** Planned amount source: opens High Level Budget Items tearsheet when chosen. */
export const HIGH_LEVEL_BUDGET_ITEMS_SOURCE = "high-level-budget-items";

/** Planned amount follows {@link CapitalPlanningSampleRow.originalBudget}. */
export const PROJECT_BUDGET_ORIGINAL_SOURCE = "project-budget-original";

/** Planned amount follows {@link CapitalPlanningSampleRow.revisedBudget}. */
export const PROJECT_BUDGET_REVISED_SOURCE = "project-budget-revised";

/** No explicit source yet defaults to lump sum — planned amount stays editable until the user picks another source. */
export function isLumpSumPlannedAmountSource(source: string | undefined): boolean {
  return source === undefined || source === LUMP_SUM_PLANNED_AMOUNT_SOURCE;
}

/**
 * Whether a planned-amount flyout option (root or nested) matches the row's stored source,
 * so the menu can show it as selected (e.g. Lump Sum when source is default or lump-sum-manual).
 */
export function isPlannedAmountFlyoutOptionSelected(
  optionValue: unknown,
  selectedSource: string | undefined
): boolean {
  const v = String(optionValue);
  if (v === PLANNED_AMOUNT_FLYOUT_CAPTION_VALUE) return false;
  if (v === LUMP_SUM_PLANNED_AMOUNT_SOURCE) return isLumpSumPlannedAmountSource(selectedSource);
  if (v === HIGH_LEVEL_BUDGET_ITEMS_SOURCE) return selectedSource === HIGH_LEVEL_BUDGET_ITEMS_SOURCE;
  if (v === "project-budget") {
    return (
      selectedSource === PROJECT_BUDGET_ORIGINAL_SOURCE ||
      selectedSource === PROJECT_BUDGET_REVISED_SOURCE
    );
  }
  if (v === PROJECT_BUDGET_ORIGINAL_SOURCE) return selectedSource === PROJECT_BUDGET_ORIGINAL_SOURCE;
  if (v === PROJECT_BUDGET_REVISED_SOURCE) return selectedSource === PROJECT_BUDGET_REVISED_SOURCE;
  return selectedSource === v;
}

/** Non-selectable flyout row — label is shown as helper text above the real options. */
export const PLANNED_AMOUNT_FLYOUT_CAPTION_VALUE = "__capital_planning_planned_amount_flyout_caption__";

export type PlannedAmountSourceOption = DropdownFlyoutOption & {
  disabled?: boolean;
  children?: PlannedAmountSourceOption[];
};

/**
 * Planned amount flyout options for a row. Project Budget / Original / Revised are shown but disabled
 * when the row has no value in the corresponding budget column (`null`).
 */
export function plannedAmountSourceOptionsForRow(row: {
  originalBudget: number | null;
  revisedBudget: number | null;
}): PlannedAmountSourceOption[] {
  const hasOriginal = row.originalBudget != null;
  const hasRevised = row.revisedBudget != null;
  const noProjectBudgetData = !hasOriginal && !hasRevised;
  return [
    {
      value: PLANNED_AMOUNT_FLYOUT_CAPTION_VALUE,
      label: "Select planned amount type",
    },
    { value: LUMP_SUM_PLANNED_AMOUNT_SOURCE, label: "Lump Sum Manual Entry" },
    { value: HIGH_LEVEL_BUDGET_ITEMS_SOURCE, label: "High Level Budget Items" },
    {
      value: "project-budget",
      label: "Project Budget",
      disabled: noProjectBudgetData,
      children: [
        {
          value: PROJECT_BUDGET_ORIGINAL_SOURCE,
          label: "Original Budget",
          disabled: !hasOriginal,
        },
        {
          value: PROJECT_BUDGET_REVISED_SOURCE,
          label: "Revised Budget",
          disabled: !hasRevised,
        },
      ],
    },
  ];
}

/** Template when both budget columns have data (e.g. docs); prefer {@link plannedAmountSourceOptionsForRow} in the grid. */
export const PLANNED_AMOUNT_SOURCE_OPTIONS: PlannedAmountSourceOption[] = plannedAmountSourceOptionsForRow({
  originalBudget: 0,
  revisedBudget: 0,
});

/** Component-level type alias — extends seed CapitalPlanningRow (omits accountId for grid use). */
export type CapitalPlanningSampleRow = Omit<CapitalPlanningRow, "accountId">;

/** Concept-stage projects do not have original / revised budget or job-to-date in this prototype. */
export function withConceptBudgetColumnsCleared(row: CapitalPlanningSampleRow): CapitalPlanningSampleRow {
  if (row.status !== "Concept") return row;
  return {
    ...row,
    originalBudget: null,
    revisedBudget: null,
    jobToDateCosts: null,
  };
}

/** Zero planned amount: no schedule window in this prototype (clears start/end for display and seed). */
export function withZeroPlannedAmountDatesCleared(row: CapitalPlanningSampleRow): CapitalPlanningSampleRow {
  if (row.plannedAmount !== 0) return row;
  return { ...row, startDate: "", endDate: "" };
}

/** Rows sourced from seed data in src/data/seed/capital_planning.ts. */
export const SAMPLE_PROJECT_ROWS: CapitalPlanningSampleRow[] = capitalPlanning.map(
  ({ accountId: _, ...row }) => row
);

function hashPrototypeProjectLabel(label: string): number {
  let h = 0;
  for (let i = 0; i < label.length; i++) {
    h = Math.imul(31, h) + label.charCodeAt(i);
  }
  return Math.abs(h);
}

/**
 * Prioritization “Description” prototype — deterministic short copy from {@link CapitalPlanningSampleRow.project}
 * (no persisted description field on the row model).
 */
export function prototypeProjectDescriptionFromName(projectName: string): string {
  const name = projectName.trim() || "This project";
  const h = hashPrototypeProjectLabel(name);

  const variants: readonly (() => string)[] = [
    () =>
      `${name}: discretionary capital scope covering base-building systems, life-safety upgrades, and tenant coordination for phased turnover.`,
    () =>
      `Owner-operator initiative for ${name} — underwriting tie-in, milestone gates, and portfolio-level risk controls through delivery.`,
    () =>
      `${name} bundles hard and soft costs with contingency held at program level; narrative reflects current stage and funding corridor.`,
    () =>
      `Portfolio fit for ${name}: near-term cash use, NOI uplift assumptions, and alignment to regional demand in the capital plan cycle.`,
    () =>
      `${name} includes deferred maintenance catch-up, accessibility path of travel, and operational resilience work scoped for board review.`,
    () =>
      `Program entry for ${name}: lease-structure impacts, schedule float assumptions, and vendor qualification status summarized for prioritization.`,
  ];

  return variants[h % variants.length]!();
}

function sampleRowIdNumber(id: string): number {
  const m = /^p(\d+)$/.exec(id);
  return m ? parseInt(m[1], 10) : 0;
}

/**
 * Deterministic prototype defaults: Course of Construction rows mostly sync planned amount to project budget
 * (revised vs original varies by row id); Bidding and Concept use lump sum or High Level Budget Items only.
 */
export function initialPlannedAmountSources(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const r of SAMPLE_PROJECT_ROWS) {
    const n = sampleRowIdNumber(r.id);
    if (r.status === "Course of Construction") {
      if (r.revisedBudget != null && r.originalBudget != null) {
        out[r.id] = n % 5 === 0 ? PROJECT_BUDGET_ORIGINAL_SOURCE : PROJECT_BUDGET_REVISED_SOURCE;
      } else if (r.revisedBudget != null) {
        out[r.id] = PROJECT_BUDGET_REVISED_SOURCE;
      } else if (r.originalBudget != null) {
        out[r.id] = PROJECT_BUDGET_ORIGINAL_SOURCE;
      } else {
        out[r.id] = LUMP_SUM_PLANNED_AMOUNT_SOURCE;
      }
    } else if (r.status === "Bidding" || r.status === "Concept") {
      if (r.plannedAmount === 0) {
        out[r.id] = LUMP_SUM_PLANNED_AMOUNT_SOURCE;
      } else {
        out[r.id] = n % 2 === 0 ? LUMP_SUM_PLANNED_AMOUNT_SOURCE : HIGH_LEVEL_BUDGET_ITEMS_SOURCE;
      }
    }
  }
  return out;
}

export function initialPriorities(): Record<string, ProjectPriority> {
  return Object.fromEntries(SAMPLE_PROJECT_ROWS.map((r) => [r.id, r.priority])) as Record<
    string,
    ProjectPriority
  >;
}

export function initialCurves(): Record<string, ProjectCurve> {
  return Object.fromEntries(SAMPLE_PROJECT_ROWS.map((r) => [r.id, r.curve])) as Record<string, ProjectCurve>;
}

export function isoStringToDate(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

/** For controlled DateSelect: empty / invalid ISO means "no value" (cleared). */
export function optionalIsoStringToDate(iso: string): Date | undefined {
  const t = iso?.trim();
  if (!t) return undefined;
  const d = new Date(`${t}T00:00:00`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export function dateToIsoString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function initialRowDates(): Record<string, { startDate: string; endDate: string }> {
  return Object.fromEntries(
    SAMPLE_PROJECT_ROWS.map((r) => [r.id, { startDate: r.startDate, endDate: r.endDate }])
  ) as Record<string, { startDate: string; endDate: string }>;
}
