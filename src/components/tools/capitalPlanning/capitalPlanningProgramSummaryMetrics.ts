/**
 * Capital Planning program-level summary metrics.
 *
 * These aggregates are reported upward to hub-embedded callers via the
 * `hubEmbedReportSummaryMetrics` callback on `CapitalPlanningContent`.
 */

import type { CapitalPlanningSampleRow } from "./capitalPlanningData";

export interface CapitalPlanningProgramSummaryMetrics {
  /** Number of visible project rows. */
  projectCount: number;
  /** Sum of planned amounts across all visible rows. */
  totalPlannedAmount: number;
  /** Sum of estimated budgets across all visible rows. */
  totalEstimatedBudget: number;
  /** Sum of original budgets across all visible rows (may be 0 when not set). */
  totalOriginalBudget: number;
  /** Sum of revised budgets across all visible rows (may be 0 when not set). */
  totalRevisedBudget: number;
  /** Sum of job-to-date costs across all visible rows (may be 0 when not set). */
  totalJobToDateCosts: number;
}

/**
 * Compute program-level summary metrics from a filtered row set.
 * Used to report aggregate figures to hub-embedded callers.
 */
export function computeCapitalPlanningProgramSummaryMetrics(
  rows: readonly CapitalPlanningSampleRow[]
): CapitalPlanningProgramSummaryMetrics {
  let totalPlannedAmount = 0;
  let totalEstimatedBudget = 0;
  let totalOriginalBudget = 0;
  let totalRevisedBudget = 0;
  let totalJobToDateCosts = 0;

  for (const row of rows) {
    totalPlannedAmount += row.plannedAmount;
    totalEstimatedBudget += row.plannedAmount; // Estimated budget defaults to planned amount for prototype
    totalOriginalBudget += row.originalBudget ?? 0;
    totalRevisedBudget += row.revisedBudget ?? 0;
    totalJobToDateCosts += row.jobToDateCosts ?? 0;
  }

  return {
    projectCount: rows.length,
    totalPlannedAmount,
    totalEstimatedBudget,
    totalOriginalBudget,
    totalRevisedBudget,
    totalJobToDateCosts,
  };
}
