export type CapitalPlanningColumnGroupId = "planning" | "budget" | "schedule" | "forecast";

export type CapitalPlanningColumnGroupVisibility = Record<CapitalPlanningColumnGroupId, boolean>;

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

export function getSecondaryStickyBaselineKey(
  v: CapitalPlanningColumnGroupVisibility
): BaselineColumnKey | null {
  if (v.planning) return "plannedAmount";
  if (v.budget) return "originalBudget";
  if (v.schedule) return "startDate";
  return null;
}

export function getLastBaselineColumnKey(v: CapitalPlanningColumnGroupVisibility): BaselineColumnKey {
  if (v.schedule) return "remaining";
  if (v.budget) return "jobToDate";
  if (v.planning) return "priority";
  return "project";
}

export function baselineCellClasses(key: BaselineColumnKey, v: CapitalPlanningColumnGroupVisibility): string {
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

export function isBaselineColumnVisible(
  key: BaselineColumnKey,
  v: CapitalPlanningColumnGroupVisibility
): boolean {
  if (key === "project") return true;
  if (key === "plannedAmount" || key === "status" || key === "priority") return v.planning;
  if (key === "originalBudget" || key === "revisedBudget" || key === "jobToDate") return v.budget;
  if (key === "startDate" || key === "endDate" || key === "curve" || key === "remaining") return v.schedule;
  return false;
}
