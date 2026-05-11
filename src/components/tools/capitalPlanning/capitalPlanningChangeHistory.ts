/**
 * Change history utilities for Capital Planning.
 * Provides payload shape and formatting helpers for the change log.
 */

export interface CapitalPlanningChangeLogPayload {
  project: string;
  description?: string;
  actionBy?: string;
  type?: "Project" | "Program";
  changed: string;
  from: string;
  to: string;
}

/** Canonical field name constants for change log entries. */
export const changeHistoryChangedField = {
  plannedAmount: "Planned Amount",
  startDate: "Start Date",
  endDate: "End Date",
  curve: "Curve",
  source: "Source",
  estimatedBudget: "Estimated Budget",
  status: "Status",
  priority: "Priority",
} as const;

/** Format a planned amount value for display in the change log. */
export function formatChangeHistoryPlannedAmountValue(value: number | null | undefined): string {
  if (value == null || value === 0) return "$0";
  return `$${value.toLocaleString()}`;
}

/** Format an ISO date string for display in the change log. */
export function isoDateToChangeHistoryField(isoDate: string | null | undefined): string {
  if (!isoDate) return "—";
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Format a curve name for display in the change log. */
export function curveValueForChangeHistory(curve: string | null | undefined): string {
  if (!curve) return "—";
  return curve;
}

/** Format a planned amount source for display in the change log. */
export function labelForPlannedAmountSourceHistory(source: string | null | undefined): string {
  if (!source) return "—";
  return source;
}

/** Return a formatted timestamp string for a change history entry. */
export function formatChangeHistoryTimestamp(date?: Date): string {
  const d = date ?? new Date();
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
