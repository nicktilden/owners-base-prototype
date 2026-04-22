export type CapitalPlanningColumnGroupId = "planning" | "budget" | "schedule" | "forecast";

export type CapitalPlanningColumnGroupVisibility = Record<CapitalPlanningColumnGroupId, boolean>;

/** @deprecated Prefer {@link DEFAULT_CAPITAL_PLANNING_COLUMN_VISIBILITY} and {@link columnVisibilityToGroupVisibility}. */
export const DEFAULT_CAPITAL_PLANNING_COLUMN_GROUP_VISIBILITY: CapitalPlanningColumnGroupVisibility = {
  planning: true,
  budget: true,
  schedule: true,
  forecast: true,
};

export const CAPITAL_PLANNING_COLUMN_GROUP_LABELS: Record<CapitalPlanningColumnGroupId, string> = {
  planning: "Planning",
  budget: "Budget",
  schedule: "Schedule & curve",
  forecast: "Forecast",
};

export type BaselineColumnKey =
  | "project"
  | "projectDescription"
  | "estimatedBudget"
  | "prioritizationStatus"
  | "plannedAmount"
  | "status"
  | "projectPriority"
  | "prioritizationScore"
  | "originalBudget"
  | "revisedBudget"
  | "jobToDate"
  | "startDate"
  | "endDate"
  | "curve"
  | "remaining";

/** Per-column visibility for the Capital Planning grid + forecast block (Table Settings). */
export type CapitalPlanningColumnVisibility = {
  projectDescription: boolean;
  estimatedBudget: boolean;
  prioritizationStatus: boolean;
  plannedAmount: boolean;
  status: boolean;
  projectPriority: boolean;
  prioritizationScore: boolean;
  originalBudget: boolean;
  revisedBudget: boolean;
  jobToDate: boolean;
  startDate: boolean;
  endDate: boolean;
  curve: boolean;
  remaining: boolean;
  forecast: boolean;
};

export const DEFAULT_CAPITAL_PLANNING_COLUMN_VISIBILITY: CapitalPlanningColumnVisibility = {
  projectDescription: false,
  estimatedBudget: false,
  prioritizationStatus: false,
  plannedAmount: true,
  status: true,
  projectPriority: false,
  prioritizationScore: true,
  originalBudget: true,
  revisedBudget: true,
  jobToDate: true,
  startDate: true,
  endDate: true,
  curve: true,
  remaining: true,
  forecast: true,
};

export type CapitalPlanningProgramPageVariant = "default" | "next" | "future";

/**
 * Main Capital Plan program table: Now/Next show Priority; Future shows Prioritization Score
 * (criteria-driven weighted score).
 */
export function capitalPlanningProgramTableDefaultVisibility(
  pageVariant: CapitalPlanningProgramPageVariant
): CapitalPlanningColumnVisibility {
  if (pageVariant === "future") {
    return { ...DEFAULT_CAPITAL_PLANNING_COLUMN_VISIBILITY };
  }
  return {
    ...DEFAULT_CAPITAL_PLANNING_COLUMN_VISIBILITY,
    projectPriority: true,
    prioritizationScore: false,
  };
}

/**
 * Table Settings — columns users may toggle (dates, curve, remaining, forecast stay visible; see
 * {@link withCapitalPlanningColumnLocks} in Capital Planning content).
 */
export const CAPITAL_PLANNING_TABLE_SETTINGS_COLUMNS: readonly {
  key: keyof CapitalPlanningColumnVisibility;
  label: string;
}[] = [
  { key: "projectPriority", label: "Priority" },
  { key: "prioritizationScore", label: "Prioritization Score" },
  { key: "originalBudget", label: "Original Budget" },
  { key: "revisedBudget", label: "Revised Budget" },
  { key: "jobToDate", label: "Job to Date Costs" },
] as const;

/** Excludes `estimatedBudget` so that column stays in the horizontal scroll strip (not sticky). */
const STICKY_SCAN_ORDER: Exclude<BaselineColumnKey, "project">[] = [
  "plannedAmount",
  "status",
  "projectPriority",
  "prioritizationScore",
  "originalBudget",
  "revisedBudget",
  "jobToDate",
  "startDate",
  "endDate",
  "curve",
  "remaining",
];

const LEFT_TO_RIGHT_BASELINE: BaselineColumnKey[] = [
  "project",
  "projectDescription",
  "estimatedBudget",
  "prioritizationStatus",
  "plannedAmount",
  "status",
  "projectPriority",
  "prioritizationScore",
  "originalBudget",
  "revisedBudget",
  "jobToDate",
  "startDate",
  "endDate",
  "curve",
  "remaining",
];

export function columnVisibilityToGroupVisibility(v: CapitalPlanningColumnVisibility): CapitalPlanningColumnGroupVisibility {
  return {
    planning:
      v.projectDescription ||
      v.estimatedBudget ||
      v.prioritizationStatus ||
      v.plannedAmount ||
      v.status ||
      v.projectPriority ||
      v.prioritizationScore,
    budget: v.originalBudget || v.revisedBudget || v.jobToDate,
    schedule: v.startDate || v.endDate || v.curve || v.remaining,
    forecast: v.forecast,
  };
}

export function countVisibleBaselineDataColumns(v: CapitalPlanningColumnVisibility): number {
  return (
    (v.projectDescription ? 1 : 0) +
    (v.estimatedBudget ? 1 : 0) +
    (v.prioritizationStatus ? 1 : 0) +
    (v.plannedAmount ? 1 : 0) +
    (v.status ? 1 : 0) +
    (v.projectPriority ? 1 : 0) +
    (v.prioritizationScore ? 1 : 0) +
    (v.originalBudget ? 1 : 0) +
    (v.revisedBudget ? 1 : 0) +
    (v.jobToDate ? 1 : 0) +
    (v.startDate ? 1 : 0) +
    (v.endDate ? 1 : 0) +
    (v.curve ? 1 : 0) +
    (v.remaining ? 1 : 0)
  );
}

export function isBaselineColumnVisible(key: BaselineColumnKey, v: CapitalPlanningColumnVisibility): boolean {
  if (key === "project") return true;
  return v[key as keyof CapitalPlanningColumnVisibility];
}

export function getSecondaryStickyBaselineKey(v: CapitalPlanningColumnVisibility): BaselineColumnKey | null {
  for (const k of STICKY_SCAN_ORDER) {
    if (v[k]) return k;
  }
  return null;
}

export function getLastBaselineColumnKey(v: CapitalPlanningColumnVisibility): BaselineColumnKey {
  let last: BaselineColumnKey = "project";
  for (const k of LEFT_TO_RIGHT_BASELINE) {
    if (isBaselineColumnVisible(k, v)) last = k;
  }
  return last;
}

export function baselineCellClasses(key: BaselineColumnKey, v: CapitalPlanningColumnVisibility): string {
  const parts: string[] = [];
  const secondary = getSecondaryStickyBaselineKey(v);
  const last = getLastBaselineColumnKey(v);

  if (key === "project") {
    parts.push("capital-planning-col-project");
  } else if (secondary === key) {
    parts.push("capital-planning-col-sticky-split");
  } else {
    parts.push("capital-planning-col-scroll");
  }

  if (key === "estimatedBudget") {
    parts.push("capital-planning-col-estimated-budget");
  }
  if (key === "prioritizationStatus") {
    parts.push("capital-planning-col-prioritization-status");
  }
  if (key === "projectDescription") {
    parts.push("capital-planning-col-project-description");
  }

  /* Text / bridge columns before criteria or forecast should not draw the “last baseline” vertical rule. */
  if (
    key === last &&
    key !== "estimatedBudget" &&
    key !== "prioritizationStatus" &&
    key !== "projectDescription"
  ) {
    parts.push("capital-planning-col-last-baseline");
  }
  return parts.filter(Boolean).join(" ");
}
