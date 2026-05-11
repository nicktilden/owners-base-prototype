/**
 * Capital Planning Criteria Builder persistence helpers.
 *
 * Criteria Builder rows are stored in localStorage so they survive page
 * refreshes.  A custom DOM event is dispatched whenever the rows change so
 * that any mounted component can re-render without a full page reload.
 */

import type { CriteriaBuilderRow } from "@/components/tools/capitalPlanning/CriteriaBuilderDataTable";
import {
  OWNER_OPERATOR_CRITERIA_BUILDER_SEED,
  cloneCriteriaBuilderRows,
} from "@/components/tools/capitalPlanning/CriteriaBuilderDataTable";

const STORAGE_KEY = "capitalPlanning.criteriaBuilderRows";

/** Custom event name dispatched on `window` when the criteria builder rows change. */
export const CAPITAL_PLANNING_CRITERIA_BUILDER_CHANGED_EVENT =
  "capitalPlanningCriteriaBuilderChanged";

/**
 * Read the persisted criteria builder rows from localStorage.
 * Falls back to {@link OWNER_OPERATOR_CRITERIA_BUILDER_SEED} if the value is
 * absent or cannot be parsed.
 */
export function readPersistedCriteriaBuilderRows(): CriteriaBuilderRow[] {
  if (typeof window === "undefined") {
    return cloneCriteriaBuilderRows(OWNER_OPERATOR_CRITERIA_BUILDER_SEED);
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return cloneCriteriaBuilderRows(OWNER_OPERATOR_CRITERIA_BUILDER_SEED);
  try {
    const parsed = JSON.parse(raw) as CriteriaBuilderRow[];
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // fall through to seed
  }
  return cloneCriteriaBuilderRows(OWNER_OPERATOR_CRITERIA_BUILDER_SEED);
}

/**
 * Persist criteria builder rows and notify all listeners.
 */
export function writePersistedCriteriaBuilderRows(rows: CriteriaBuilderRow[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  window.dispatchEvent(new Event(CAPITAL_PLANNING_CRITERIA_BUILDER_CHANGED_EVENT));
}
