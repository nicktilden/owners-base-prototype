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
  | "plannedAmount"
  | "status"
  | "priority"
  | "originalBudget"
  | "revisedBudget"
  | "jobToDate"
  | "startDate"
  | "endDate"
  | "curve"
  | "remaining";

/** Per-column visibility for the Capital Planning grid + forecast block (Table Settings). */
export type CapitalPlanningColumnVisibility = {
  plannedAmount: boolean;
  status: boolean;
  priority: boolean;
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
  plannedAmount: true,
  status: true,
  priority: true,
  originalBudget: true,
  revisedBudget: true,
  jobToDate: true,
  startDate: true,
  endDate: true,
  curve: true,
  remaining: true,
  forecast: true,
};

/**
 * Table Settings — columns users may toggle (dates, curve, remaining, forecast stay visible; see
 * {@link withCapitalPlanningColumnLocks} in Capital Planning content).
 */
export const CAPITAL_PLANNING_TABLE_SETTINGS_COLUMNS: readonly {
  key: keyof CapitalPlanningColumnVisibility;
  label: string;
}[] = [
  { key: "status", label: "Stage" },
  { key: "priority", label: "Priority" },
  { key: "originalBudget", label: "Original Budget" },
  { key: "revisedBudget", label: "Revised Budget" },
  { key: "jobToDate", label: "Job to Date Costs" },
] as const;

const STICKY_SCAN_ORDER: Exclude<BaselineColumnKey, "project">[] = [
  "plannedAmount",
  "status",
  "priority",
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
  "plannedAmount",
  "status",
  "priority",
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
    planning: v.plannedAmount || v.status || v.priority,
    budget: v.originalBudget || v.revisedBudget || v.jobToDate,
    schedule: v.startDate || v.endDate || v.curve || v.remaining,
    forecast: v.forecast,
  };
}

export function countVisibleBaselineDataColumns(v: CapitalPlanningColumnVisibility): number {
  return (
    (v.plannedAmount ? 1 : 0) +
    (v.status ? 1 : 0) +
    (v.priority ? 1 : 0) +
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

  if (key === last) {
    parts.push("capital-planning-col-last-baseline");
  }
  return parts.filter(Boolean).join(" ");
}
