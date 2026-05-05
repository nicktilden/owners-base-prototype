import type { CapitalPlanningSampleRow } from "@/components/tools/capitalPlanning/capitalPlanningData";

function rowBudgetEnvelope(row: CapitalPlanningSampleRow): number {
  const pa = Number.isFinite(row.plannedAmount) ? row.plannedAmount : 0;
  const rev = row.revisedBudget;
  const orig = row.originalBudget;
  if (rev != null && Number.isFinite(rev)) return rev;
  if (orig != null && Number.isFinite(orig)) return orig;
  return pa;
}

export interface CapitalPlanningProgramSummaryMetrics {
  totalPlannedAmount: number;
  /** Sum of original budget where present on a row. */
  totalOriginalBudget: number;
  /** Sum of revised budget where present on a row. */
  totalRevisedBudget: number;
  /** Sum of job-to-date costs (actuals) where present. */
  totalJobToDateCosts: number;
  /**
   * Rollup of budget envelope less job-to-date (≥ 0 per row).
   * Envelope = revised → original → planned when upstream columns are empty.
   */
  forecastToComplete: number;
  /** Sum of per-row budget envelope (revised → original → planned). */
  estimatedCostAtCompletion: number;
  /**
   * Planned amount in excess of the row budget envelope (≥ 0 per row).
   * Prototype stand-in for “not yet tied to forecast / envelope” dollars.
   */
  remainingToForecast: number;
}

export function computeCapitalPlanningProgramSummaryMetrics(
  rows: readonly CapitalPlanningSampleRow[]
): CapitalPlanningProgramSummaryMetrics {
  let totalPlannedAmount = 0;
  let totalOriginalBudget = 0;
  let totalRevisedBudget = 0;
  let totalJobToDateCosts = 0;
  let forecastToComplete = 0;
  let estimatedCostAtCompletion = 0;
  let remainingToForecast = 0;

  for (const row of rows) {
    const pa = Number.isFinite(row.plannedAmount) ? row.plannedAmount : 0;
    totalPlannedAmount += pa;

    const ob = row.originalBudget;
    if (ob != null && Number.isFinite(ob)) {
      totalOriginalBudget += ob;
    }
    const rb = row.revisedBudget;
    if (rb != null && Number.isFinite(rb)) {
      totalRevisedBudget += rb;
    }

    const jtd = row.jobToDateCosts;
    const jtdN = jtd != null && Number.isFinite(jtd) ? jtd : 0;
    if (jtd != null && Number.isFinite(jtd)) {
      totalJobToDateCosts += jtd;
    }

    const envelope = rowBudgetEnvelope(row);
    estimatedCostAtCompletion += envelope;
    forecastToComplete += Math.max(0, envelope - jtdN);

    remainingToForecast += Math.max(0, pa - envelope);
  }

  return {
    totalPlannedAmount,
    totalOriginalBudget,
    totalRevisedBudget,
    totalJobToDateCosts,
    forecastToComplete,
    estimatedCostAtCompletion,
    remainingToForecast,
  };
}
