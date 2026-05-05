import {
  cloneCriteriaBuilderRows,
  OWNER_OPERATOR_CRITERIA_BUILDER_SEED,
  type CriteriaBuilderRow,
} from "@/components/tools/capitalPlanning/CriteriaBuilderDataTable";

export const CAPITAL_PLANNING_CRITERIA_BUILDER_STORAGE_KEY =
  "owners-base.capitalPlanning.criteriaBuilderRows.v1";

/** Dispatched after {@link writePersistedCriteriaBuilderRows} so open Capital Plan syncs criteria columns. */
export const CAPITAL_PLANNING_CRITERIA_BUILDER_CHANGED_EVENT = "capitalPlanningCriteriaBuilderRowsChanged";

export function readPersistedCriteriaBuilderRows(): CriteriaBuilderRow[] {
  if (typeof window === "undefined") {
    return cloneCriteriaBuilderRows(OWNER_OPERATOR_CRITERIA_BUILDER_SEED);
  }
  try {
    const raw = localStorage.getItem(CAPITAL_PLANNING_CRITERIA_BUILDER_STORAGE_KEY);
    if (!raw) return cloneCriteriaBuilderRows(OWNER_OPERATOR_CRITERIA_BUILDER_SEED);
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return cloneCriteriaBuilderRows(OWNER_OPERATOR_CRITERIA_BUILDER_SEED);
    return cloneCriteriaBuilderRows(parsed as CriteriaBuilderRow[]);
  } catch {
    return cloneCriteriaBuilderRows(OWNER_OPERATOR_CRITERIA_BUILDER_SEED);
  }
}

export function writePersistedCriteriaBuilderRows(rows: CriteriaBuilderRow[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CAPITAL_PLANNING_CRITERIA_BUILDER_STORAGE_KEY, JSON.stringify(rows));
    window.dispatchEvent(new CustomEvent(CAPITAL_PLANNING_CRITERIA_BUILDER_CHANGED_EVENT));
  } catch {
    /* ignore quota / private mode */
  }
}
