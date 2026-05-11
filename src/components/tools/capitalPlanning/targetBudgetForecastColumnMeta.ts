/**
 * Target-budget forecast column metadata for the Capital Planning grid.
 *
 * The target-budget feature lets users set a per-period spending cap that is
 * compared against the forecast total. This module provides:
 *   - A descriptor type for each visible forecast leaf column
 *   - A builder that enumerates all visible columns in the same order as the
 *     forecast grid header
 *   - A lookup helper that resolves the target-budget cap for a given cell
 *   - A helper that derives the storage keys used by aggregate (group) rows
 */

import type { ForecastGranularity } from "./capitalPlanningForecast";
import {
  CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS,
} from "./capitalPlanningForecast";
import { fiscalQuarterMonthGlobalIndices } from "./capitalPlanningForecast";

// ── Column descriptor ─────────────────────────────────────────────────────────

export type TargetBudgetForecastPeriodKind =
  | "fy_year"
  | "fq_rollup"
  | "month";

/** Descriptor for a single visible leaf column in the forecast grid. */
export interface TargetBudgetForecastColumnMeta {
  /** Zero-based index of this column in the leaf column array. */
  columnIndex: number;
  /** What kind of period this column represents. */
  kind: TargetBudgetForecastPeriodKind;
  /**
   * Global month indices covered by this column.
   * - For "month": one element.
   * - For "fq_rollup": three elements.
   * - For "fy_year": twelve elements.
   */
  monthIndices: number[];
  /**
   * Storage key suffix used to look up overrides for this column in the
   * `targetBudgetForecastOverrides` record.
   */
  storageKey: string;
}

// ── Builder ───────────────────────────────────────────────────────────────────

export interface EnumerateTargetBudgetForecastColumnsArgs {
  forecastColumnsExpanded: boolean;
  forecastGranularity: ForecastGranularity;
  fyYearSectionExpanded: readonly boolean[];
  fqCollapsed: readonly boolean[];
  fiscalYearStartMonth?: number;
  forecastFqLabels: readonly string[];
  forecastMonthLabels: readonly string[];
  comparisonMonthDetailOpen?: ReadonlySet<number>;
  forecastComparisonEnabled?: boolean;
}

/**
 * Enumerate target-budget forecast column descriptors in the same order as the
 * grid header leaf columns.  Returns an empty array when the forecast columns
 * are not in quarter mode or are collapsed.
 */
export function enumerateTargetBudgetForecastColumns(
  args: EnumerateTargetBudgetForecastColumnsArgs
): TargetBudgetForecastColumnMeta[] {
  const {
    forecastColumnsExpanded,
    forecastGranularity,
    fyYearSectionExpanded,
    fqCollapsed,
    fiscalYearStartMonth = 0,
  } = args;

  if (forecastGranularity !== "quarter" || !forecastColumnsExpanded) {
    return [];
  }

  const metas: TargetBudgetForecastColumnMeta[] = [];
  let ci = 0;

  for (let fyIndex = 0; fyIndex < CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.length; fyIndex++) {
    if (!fyYearSectionExpanded[fyIndex]) {
      // Collapsed FY → single FY aggregate column.
      const monthIndices = Array.from({ length: 12 }, (_, m) => fyIndex * 12 + m + fiscalYearStartMonth);
      metas.push({
        columnIndex: ci++,
        kind: "fy_year",
        monthIndices,
        storageKey: `fy:${fyIndex}`,
      });
      continue;
    }

    // Expanded FY → iterate quarters.
    for (let fqInFy = 0; fqInFy < 4; fqInFy++) {
      const fqIndex = fyIndex * 4 + fqInFy;

      if (fqCollapsed[fqIndex]) {
        // Collapsed FQ → single rollup column.
        const monthIndices = Array.from(fiscalQuarterMonthGlobalIndices(fyIndex, fqInFy, fiscalYearStartMonth));
        metas.push({
          columnIndex: ci++,
          kind: "fq_rollup",
          monthIndices,
          storageKey: `fq:${fqIndex}`,
        });
        continue;
      }

      // Expanded FQ → 3 month columns.
      const [m0, m1, m2] = fiscalQuarterMonthGlobalIndices(fyIndex, fqInFy, fiscalYearStartMonth);
      for (const monthIdx of [m0, m1, m2]) {
        metas.push({
          columnIndex: ci++,
          kind: "month",
          monthIndices: [monthIdx],
          storageKey: `m:${monthIdx}`,
        });
      }
    }
  }

  return metas;
}

// ── Lookup helpers ────────────────────────────────────────────────────────────

/**
 * Derive the set of override storage keys that apply to an aggregate (group)
 * row identified by `aggregateKey`.  In the prototype the aggregate key is
 * used as a prefix for all target-budget override keys that belong to that
 * group (e.g. `"region:West Coast|fq:3"`).
 */
export function targetBudgetCollapseKeysForAggregateRow(
  aggregateKey: string
): string[] {
  // Return the aggregate key itself plus a wildcard-style prefix list so that
  // callers can look up both group-level and per-period overrides.
  return [aggregateKey];
}

/**
 * Resolve the target-budget cap for a single forecast leaf cell.
 *
 * Returns 0 when no override has been set for this cell, which the grid
 * interprets as "no cap".
 *
 * @param aggregateKeys  - Keys from {@link targetBudgetCollapseKeysForAggregateRow}.
 * @param leafMeta       - Column descriptor for this leaf (may be undefined when
 *                         the column has no descriptor, e.g. comparison sub-cols).
 * @param columnIndex    - Zero-based index of the leaf column in the grid.
 * @param overrides      - Full overrides record (`Record<string, number>`).
 * @param _fiscalYearStartMonth - FY start month (reserved for future use).
 */
export function readTargetBudgetOverrideForCell(
  aggregateKeys: string[],
  leafMeta: TargetBudgetForecastColumnMeta | undefined,
  columnIndex: number,
  overrides: Record<string, number>,
  _fiscalYearStartMonth: number = 0
): number {
  if (!leafMeta || aggregateKeys.length === 0) return 0;

  // Try aggregate-key prefixed override first.
  for (const aggregateKey of aggregateKeys) {
    const key = `${aggregateKey}|${leafMeta.storageKey}`;
    const value = overrides[key];
    if (value !== undefined && value > 0) return value;
  }

  // Try plain storage-key override (row-level).
  const plain = overrides[leafMeta.storageKey];
  if (plain !== undefined && plain > 0) return plain;

  // Try column-index override.
  const byIndex = overrides[`col:${columnIndex}`];
  if (byIndex !== undefined && byIndex > 0) return byIndex;

  return 0;
}
