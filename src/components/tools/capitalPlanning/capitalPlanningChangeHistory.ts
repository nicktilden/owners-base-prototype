import type { ProjectCurve } from "@/components/tools/capitalPlanning/capitalPlanningData";
import {
  HIGH_LEVEL_BUDGET_ITEMS_SOURCE,
  isLumpSumPlannedAmountSource,
  PROJECT_BUDGET_ORIGINAL_SOURCE,
  PROJECT_BUDGET_REVISED_SOURCE,
} from "@/components/tools/capitalPlanning/capitalPlanningData";

/** Labels for the Change History "Changed" column (Capital Planning). */
export const changeHistoryChangedField = {
  plannedAmount: "Planned Amount",
  curve: "Curve",
  startDate: "Start Date",
  endDate: "End Date",
} as const;

export const CHANGE_HISTORY_CHANGED_VALUES = Object.values(changeHistoryChangedField);

/** Filter dropdown order for "Changed" (matches product grouping). */
export const CHANGE_HISTORY_CHANGED_FILTER_ORDER = [
  changeHistoryChangedField.plannedAmount,
  changeHistoryChangedField.curve,
  changeHistoryChangedField.startDate,
  changeHistoryChangedField.endDate,
] as const;

export type ChangeHistoryChangedKind =
  (typeof changeHistoryChangedField)[keyof typeof changeHistoryChangedField];

/** Payload recorded from the Capital Plan grid; parent assigns id + date for {@link ChangeHistoryRow}. */
export type CapitalPlanningChangeLogPayload = {
  project: string;
  description?: string;
  actionBy?: string;
  type?: "Program" | "Project";
  changed: ChangeHistoryChangedKind;
  from: string;
  to: string;
};

export function formatChangeHistoryTimestamp(d = new Date()): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  let h = d.getHours();
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12;
  if (h === 0) h = 12;
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${mm}/${dd}/${yyyy} at ${h}:${min} ${ampm}`;
}

export function formatChangeHistoryCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

/** Dollar amounts for planned amount *value* rows: zero / invalid → `None` (distinct from source-label logs). */
export function formatChangeHistoryPlannedAmountValue(n: number): string {
  if (!Number.isFinite(n) || n === 0) {
    return "None";
  }
  return formatChangeHistoryCurrency(n);
}

/**
 * Labels for planned amount *source* transitions (dropdown), separate from {@link formatChangeHistoryPlannedAmountValue}.
 * e.g. Lump Sum → High Level Budget Items is one row; None → $800,000.00 is another when the amount is saved/edited.
 */
export function labelForPlannedAmountSourceHistory(source: string | undefined): string {
  if (source === HIGH_LEVEL_BUDGET_ITEMS_SOURCE) return "High Level Budget Items";
  if (source === PROJECT_BUDGET_ORIGINAL_SOURCE) return "Original Budget";
  if (source === PROJECT_BUDGET_REVISED_SOURCE) return "Revised Budget";
  if (isLumpSumPlannedAmountSource(source)) return "Lump Sum";
  return source?.trim() ? source : "None";
}

export function isoDateToChangeHistoryField(iso: string): string {
  const t = iso?.trim();
  if (!t) return "None";
  const d = new Date(`${t}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "None";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

export function labelForPlannedAmountSource(source: string | undefined): string {
  if (source === HIGH_LEVEL_BUDGET_ITEMS_SOURCE) return "High Level Budget Items";
  if (source === PROJECT_BUDGET_ORIGINAL_SOURCE) return "Original Budget";
  if (source === PROJECT_BUDGET_REVISED_SOURCE) return "Revised Budget";
  if (isLumpSumPlannedAmountSource(source)) return "Lump Sum Manual Entry";
  return source?.trim() ? source : "—";
}

export function curveValueForChangeHistory(curve: ProjectCurve): string {
  if (curve === "") return "None";
  return curve.toLowerCase();
}
