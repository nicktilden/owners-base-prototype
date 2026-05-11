/**
 * Prototype seed data for the Target Budget feature.
 *
 * In a real implementation target budgets would be loaded from the API.
 * For the prototype, this module generates deterministic overrides based on
 * each row's planned amount so that the variance-warning indicators appear
 * in the grid without requiring manual input.
 */

import type { CapitalPlanningSampleRow } from "./capitalPlanningData";
import {
  CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS,
  CAPITAL_PLANNING_PROGRAM_FORECAST_QUARTERS,
} from "./capitalPlanningForecast";
import { fiscalQuarterMonthGlobalIndices } from "./capitalPlanningForecast";

/**
 * Generate a seed `targetBudgetForecastOverrides` record for prototype use.
 *
 * For each visible row we set per-FQ target budgets at 90% of the forecast
 * amount so that some quarters will naturally exceed the cap and trigger the
 * variance-warning icon.
 *
 * @param rows - Filtered project rows currently visible in the grid.
 * @param fiscalYearStartMonth - Calendar month (0–11) where the FY begins.
 * @returns A `Record<string, number>` suitable for `targetBudgetForecastOverrides`.
 */
export function buildPrototypeTargetBudgetForecastOverrides(
  rows: readonly CapitalPlanningSampleRow[],
  fiscalYearStartMonth: number = 0
): Record<string, number> {
  const result: Record<string, number> = {};

  for (const row of rows) {
    const plannedAmount = row.plannedAmount;
    if (!plannedAmount || plannedAmount <= 0) continue;

    // Distribute planned amount across quarters (simplified even split).
    const perQuarter = plannedAmount / CAPITAL_PLANNING_PROGRAM_FORECAST_QUARTERS;

    for (let fyIndex = 0; fyIndex < CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.length; fyIndex++) {
      for (let fqInFy = 0; fqInFy < 4; fqInFy++) {
        const fqIndex = fyIndex * 4 + fqInFy;
        const monthIndices = fiscalQuarterMonthGlobalIndices(fyIndex, fqInFy, fiscalYearStartMonth);

        // Use a deterministic hash of the row id to vary the cap slightly.
        let h = 0;
        for (let i = 0; i < row.id.length; i++) {
          h = (Math.imul(31, h) + row.id.charCodeAt(i)) | 0;
        }
        const factor = 0.85 + (Math.abs(h) % 20) / 100; // 0.85–1.04

        const targetCap = Math.round(perQuarter * factor);
        if (targetCap <= 0) continue;

        // Store by row id + FQ storage key (matches targetBudgetForecastColumnMeta format).
        result[`${row.id}|fq:${fqIndex}`] = targetCap;

        // Also store by month indices for month-grain cells.
        for (const monthIdx of monthIndices) {
          result[`${row.id}|m:${monthIdx}`] = Math.round(targetCap / 3);
        }
      }
    }
  }

  return result;
}
