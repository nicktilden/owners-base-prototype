/**
 * Program-quarter leaf slot utilities for the Capital Planning forecast grid.
 *
 * When the grid is in "quarter" forecast-granularity mode it renders a dynamic
 * set of leaf columns whose shape depends on:
 *   – which fiscal years are expanded/collapsed  (fyYearSectionExpanded)
 *   – which fiscal quarters are expanded/collapsed (fqCollapsed)
 *   – whether the month-comparison feature is active (comparisonFeatureEnabled)
 *   – whether a particular month's comparison detail panel is open (comparisonMonthDetailOpen)
 *
 * Each leaf column is described by a {@link ProgramQuarterLeafSlot} discriminated
 * union so that the grid can render the correct cell content without additional
 * per-column branching.
 */

import {
  CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS,
} from "./capitalPlanningForecast";

// ── Slot type ─────────────────────────────────────────────────────────────────

/**
 * All slots carry the fiscal-year index so the grid can resolve the FY calendar
 * year (`CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS[fyIndex]`) without narrowing the
 * discriminant first.
 */
interface SlotBase {
  fyIndex: number;
}

/** A collapsed fiscal year rendered as a single aggregated column. */
export type FyYearSlot = SlotBase & { kind: "fy_year" };

/** A collapsed fiscal quarter rendered as a single aggregated column. */
export type FqRollupSlot = SlotBase & { kind: "fq_rollup"; fqIndex: number };

/** A single month leaf column (no comparison feature active, or comparison off for this month). */
export type MonthSingleSlot = SlotBase & { kind: "month_single"; monthIdx: number };

/** Current-period column within a month comparison triplet. */
export type CmpCurrentSlot = SlotBase & { kind: "cmp_current"; monthIdx: number };

/** Snapshot column within a month comparison triplet. */
export type CmpSnapshotSlot = SlotBase & { kind: "cmp_snapshot"; monthIdx: number };

/** Variance column within a month comparison triplet. */
export type CmpVarianceSlot = SlotBase & { kind: "cmp_variance"; monthIdx: number };

export type ProgramQuarterLeafSlot =
  | FyYearSlot
  | FqRollupSlot
  | MonthSingleSlot
  | CmpCurrentSlot
  | CmpSnapshotSlot
  | CmpVarianceSlot;

// ── Builder ───────────────────────────────────────────────────────────────────

export interface BuildProgramQuarterLeafSlotsArgs {
  /** Per-FY expansion state (index = FY position in CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS). */
  fyYearSectionExpanded: readonly boolean[];
  /**
   * Per-FQ collapse state (global index = fyIndex * 4 + fqInFy).
   * When true the quarter is rolled up into a single column.
   */
  fqCollapsed: readonly boolean[];
  /** Calendar month (0–11) where the fiscal year begins. Default: 0 (January). */
  fiscalYearStartMonth?: number;
  /** Set of global month indices for which the comparison detail panel is open. */
  comparisonMonthDetailOpen?: ReadonlySet<number>;
  /** Whether the comparison snapshot feature is enabled for this grid instance. */
  comparisonFeatureEnabled?: boolean;
}

/**
 * Build the ordered array of leaf column descriptors for the program-quarter
 * forecast grid.  The result length equals the total number of visible leaf
 * columns, which drives both header colSpan computation and cell rendering.
 */
export function buildProgramQuarterLeafSlots({
  fyYearSectionExpanded,
  fqCollapsed,
  fiscalYearStartMonth = 0,
  comparisonMonthDetailOpen = new Set(),
  comparisonFeatureEnabled = false,
}: BuildProgramQuarterLeafSlotsArgs): ProgramQuarterLeafSlot[] {
  const slots: ProgramQuarterLeafSlot[] = [];

  for (let fyIndex = 0; fyIndex < CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.length; fyIndex++) {
    // Collapsed FY → single aggregate column.
    if (!fyYearSectionExpanded[fyIndex]) {
      slots.push({ kind: "fy_year", fyIndex });
      continue;
    }

    // Expanded FY → iterate over its 4 fiscal quarters.
    for (let fqInFy = 0; fqInFy < 4; fqInFy++) {
      const fqIndex = fyIndex * 4 + fqInFy;

      if (fqCollapsed[fqIndex]) {
        // Collapsed quarter → single rollup column.
        slots.push({ kind: "fq_rollup", fyIndex, fqIndex });
        continue;
      }

      // Expanded quarter → 3 month columns (offset by fiscal year start month).
      for (let k = 0; k < 3; k++) {
        const monthIdx = fyIndex * 12 + fqInFy * 3 + k + fiscalYearStartMonth;

        if (comparisonFeatureEnabled && comparisonMonthDetailOpen.has(monthIdx)) {
          // Comparison triplet: current | snapshot | variance.
          slots.push({ kind: "cmp_current", fyIndex, monthIdx });
          slots.push({ kind: "cmp_snapshot", fyIndex, monthIdx });
          slots.push({ kind: "cmp_variance", fyIndex, monthIdx });
        } else {
          slots.push({ kind: "month_single", fyIndex, monthIdx });
        }
      }
    }
  }

  return slots;
}

// ── Colspan helpers ───────────────────────────────────────────────────────────

/**
 * Total colspan contributed by the given fiscal year index across all its leaf
 * slots.  Used for the FY sub-header row `colSpan` attribute.
 */
export function programQuarterSlotsColspanForFy(
  slots: readonly ProgramQuarterLeafSlot[],
  fyIndex: number
): number {
  let count = 0;
  for (const slot of slots) {
    if (slot.fyIndex === fyIndex) count++;
  }
  return Math.max(count, 1);
}

/**
 * Total colspan contributed by the given global FQ index across all its leaf
 * slots.  Used for the FQ sub-header row `colSpan` attribute.
 */
export function programQuarterSlotsColspanForFq(
  slots: readonly ProgramQuarterLeafSlot[],
  fqIndex: number
): number {
  let count = 0;
  const fyIndex = Math.floor(fqIndex / 4);
  const fqInFy = fqIndex % 4;
  // Global month index range for this FQ (ignoring fiscal year start month offset
  // for the purposes of counting — the offset is accounted for in buildProgramQuarterLeafSlots).
  const baseMo = fyIndex * 12 + fqInFy * 3;
  for (const slot of slots) {
    if (slot.kind === "fq_rollup" && slot.fqIndex === fqIndex) {
      count++;
      continue;
    }
    if (
      slot.kind === "month_single" ||
      slot.kind === "cmp_current" ||
      slot.kind === "cmp_snapshot" ||
      slot.kind === "cmp_variance"
    ) {
      // Count slots whose month falls within this FQ's 3-month range.
      const relative = slot.monthIdx - baseMo;
      if (relative >= 0 && relative < 3) count++;
    }
  }
  return Math.max(count, 1);
}
