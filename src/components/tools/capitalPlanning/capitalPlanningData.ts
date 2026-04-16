import type { DropdownFlyoutOption } from "@procore/core-react";
import { capitalPlanning } from "@/data/seed/capital_planning";
import type { CapitalPlanningRow, ProjectStatus, ProjectPriority, ProjectCurve } from "@/types/capitalPlanning";

export {
  PROJECT_STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  CURVE_OPTIONS,
} from "@/types/capitalPlanning";

export type { ProjectStatus, ProjectPriority, ProjectCurve, CapitalPlanningRow } from "@/types/capitalPlanning";

export const STATUS_PILL_COLOR: Record<
  ProjectStatus,
  "blue" | "cyan" | "gray" | "green" | "magenta" | "yellow"
> = {
  "Pre-Construction": "blue",
  "Course of Construction": "green",
  Concept: "gray",
  Bidding: "yellow",
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

/** Non-selectable flyout row — label is shown as helper text above the real options. */
export const PLANNED_AMOUNT_FLYOUT_CAPTION_VALUE = "__capital_planning_planned_amount_flyout_caption__";

export const PLANNED_AMOUNT_SOURCE_OPTIONS: DropdownFlyoutOption[] = [
  {
    value: PLANNED_AMOUNT_FLYOUT_CAPTION_VALUE,
    label: "Select planned amount type",
  },
  { value: LUMP_SUM_PLANNED_AMOUNT_SOURCE, label: "Lump Sum Manual Entry" },
  { value: HIGH_LEVEL_BUDGET_ITEMS_SOURCE, label: "High Level Budget Items" },
  {
    value: "project-budget",
    label: "Project Budget",
    children: [
      { value: "project-budget-original", label: "Original Budget" },
      { value: "project-budget-revised", label: "Revised Budget" },
    ],
  },
];

/** Component-level type alias — extends seed CapitalPlanningRow (omits accountId for grid use). */
export type CapitalPlanningSampleRow = Omit<CapitalPlanningRow, "accountId">;

/** Rows sourced from seed data in src/data/seed/capital_planning.ts. */
export const SAMPLE_PROJECT_ROWS: CapitalPlanningSampleRow[] = capitalPlanning.map(
  ({ accountId: _, ...row }) => row
);

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

/** For controlled DateSelect: empty / invalid ISO means “no value” (cleared). */
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
