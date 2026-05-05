import { DEFAULT_CAPITAL_PLANNING_FISCAL_YEAR_START_MONTH } from "@/utils/capitalPlanningFiscalSettings";
import type { CapitalPlanningSampleRow } from "./capitalPlanningData";
import {
  withConceptBudgetColumnsCleared,
  withZeroPlannedAmountDatesCleared,
} from "./capitalPlanningData";
import {
  CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS,
  CAPITAL_PLANNING_PROGRAM_FORECAST_MONTHS,
  clampProjectIsoDatesToProgramHorizon,
  fiscalQuarterMonthGlobalIndices,
  getProgramForecastMonthDollarAmounts,
  getProgramForecastMonthLabels,
  getProgramGridHorizon,
  getProgramJobToDateMonthAllocations,
  programForecastFyLabel,
  programGridMonthFirstLastDay,
} from "./capitalPlanningForecast";

export type HubPlannedCostPeriodView = "Years" | "Quarter" | "Month";

export type HubPlannedCostPoint = { label: string; planned: number; actual: number };

/** Optional calendar span (inclusive) to clip program-grid months before rollups and trim axis buckets. */
export type HubPlannedCostViewRange = { start: Date; end: Date };

/** Match table/grid behavior for dates + Concept zeroing before forecast math. */
export function prepareCapitalPlanningRowForProgramChart(row: CapitalPlanningSampleRow): CapitalPlanningSampleRow {
  const { startDate, endDate } = clampProjectIsoDatesToProgramHorizon(row.startDate, row.endDate, row.id);
  return withZeroPlannedAmountDatesCleared(
    withConceptBudgetColumnsCleared({
      ...row,
      startDate,
      endDate,
    })
  );
}

export function filterCapitalPlanningRowsByProjectIds(
  rows: readonly CapitalPlanningSampleRow[],
  allowedProjectIds: ReadonlySet<string>
): CapitalPlanningSampleRow[] {
  return rows.filter((r) => allowedProjectIds.has(r.projectId)).map(prepareCapitalPlanningRowForProgramChart);
}

function startOfDayLocal(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function inclusiveLocalCalendarDays(a: Date, b: Date): number {
  const ta = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const tb = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor((tb - ta) / 86400000) + 1;
}

/**
 * Zeros job-to-date amounts attributed to program months that are entirely after `anchor`'s calendar date,
 * and prorates the month that contains `anchor` so only the elapsed portion counts.
 */
export function maskActualSeriesToPastProgramMonths(
  actual: readonly number[],
  anchor: Date = new Date()
): number[] {
  const today0 = startOfDayLocal(anchor);
  const n = actual.length;
  const out = actual.map((v) => (Number.isFinite(v) ? v : 0));
  for (let i = 0; i < n; i++) {
    const rng = programGridMonthFirstLastDay(i);
    if (!rng) {
      out[i] = 0;
      continue;
    }
    const ms = startOfDayLocal(rng.start);
    const me = startOfDayLocal(rng.end);
    const ai = out[i] ?? 0;
    if (ai === 0) continue;
    if (ms.getTime() > today0.getTime()) {
      out[i] = 0;
      continue;
    }
    if (me.getTime() <= today0.getTime()) {
      continue;
    }
    const totalDays = inclusiveLocalCalendarDays(ms, me);
    const pastDays = inclusiveLocalCalendarDays(ms, today0);
    out[i] = Math.round((ai * pastDays) / Math.max(1, totalDays));
  }
  return out;
}

function aggregateProgramMonthPlannedAndActual(rows: readonly CapitalPlanningSampleRow[]): {
  planned: number[];
  actual: number[];
} {
  const n = CAPITAL_PLANNING_PROGRAM_FORECAST_MONTHS;
  const planned = Array.from({ length: n }, () => 0);
  const actual = Array.from({ length: n }, () => 0);
  for (const row of rows) {
    const p = getProgramForecastMonthDollarAmounts(row, "fullPlanned");
    const a = getProgramJobToDateMonthAllocations(row);
    for (let i = 0; i < n; i++) {
      planned[i] += p[i] ?? 0;
      actual[i] += a[i] ?? 0;
    }
  }
  return { planned, actual };
}

function rollupYears(planned: readonly number[], actual: readonly number[]): HubPlannedCostPoint[] {
  return CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.map((y, fyIdx) => {
    const base = fyIdx * 12;
    let ps = 0;
    let ac = 0;
    for (let m = 0; m < 12; m++) {
      ps += planned[base + m] ?? 0;
      ac += actual[base + m] ?? 0;
    }
    return { label: programForecastFyLabel(y), planned: ps, actual: ac };
  });
}

/** Parse calendar year from hub year axis label (`FY 2028` or legacy `2028`). */
function fiscalYearFromHubYearLabel(label: string): number | undefined {
  const fy = label.match(/^FY\s+(\d{4})$/i);
  if (fy) return Number(fy[1]);
  const plain = /^(\d{4})$/.exec(label);
  if (plain) return Number(plain[1]);
  const n = Number(label);
  return Number.isFinite(n) ? n : undefined;
}

const QUARTERS_PER_PROGRAM = CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.length * 4;

function rollupQuarters(
  planned: readonly number[],
  actual: readonly number[],
  fiscalStartMonth: number
): HubPlannedCostPoint[] {
  const out: HubPlannedCostPoint[] = [];
  for (let q = 0; q < QUARTERS_PER_PROGRAM; q++) {
    const fyIndex = Math.floor(q / 4);
    const fy = CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS[fyIndex];
    if (fy === undefined) continue;
    const quarterInFy = q % 4;
    const fq = quarterInFy + 1;
    const yy = String(fy % 100).padStart(2, "0");
    const [i0, i1, i2] = fiscalQuarterMonthGlobalIndices(fyIndex, quarterInFy, fiscalStartMonth);
    const ps = (planned[i0] ?? 0) + (planned[i1] ?? 0) + (planned[i2] ?? 0);
    const ac = (actual[i0] ?? 0) + (actual[i1] ?? 0) + (actual[i2] ?? 0);
    out.push({ label: `'${yy} Q${fq}`, planned: ps, actual: ac });
  }
  return out;
}

function rollupFirstProgramFiscalYearMonths(
  planned: readonly number[],
  actual: readonly number[]
): HubPlannedCostPoint[] {
  const labels = getProgramForecastMonthLabels().slice(0, 12);
  return labels.map((label, m) => ({
    label,
    planned: planned[m] ?? 0,
    actual: actual[m] ?? 0,
  }));
}

function clampViewRangeToHorizon(viewRange: HubPlannedCostViewRange | undefined): { start: Date; end: Date } {
  const h = getProgramGridHorizon();
  const hs = startOfDayLocal(h.start);
  const he = startOfDayLocal(h.end);
  if (!viewRange) return { start: hs, end: he };
  let rs = startOfDayLocal(viewRange.start);
  let re = startOfDayLocal(viewRange.end);
  if (rs.getTime() < hs.getTime()) rs = hs;
  if (re.getTime() > he.getTime()) re = he;
  if (rs.getTime() > re.getTime()) return { start: hs, end: he };
  return { start: rs, end: re };
}

function programMonthOverlapsRange(monthIndex: number, rangeStart: Date, rangeEnd: Date): boolean {
  const rng = programGridMonthFirstLastDay(monthIndex);
  if (!rng) return false;
  const ms = startOfDayLocal(rng.start);
  const me = startOfDayLocal(rng.end);
  const rs = startOfDayLocal(rangeStart);
  const re = startOfDayLocal(rangeEnd);
  return ms.getTime() <= re.getTime() && me.getTime() >= rs.getTime();
}

function maskMonthsToViewTimeline(
  planned: readonly number[],
  actual: readonly number[],
  rangeStart: Date,
  rangeEnd: Date
): { planned: number[]; actual: number[] } {
  const n = planned.length;
  const p = Array.from({ length: n }, (_, i) =>
    programMonthOverlapsRange(i, rangeStart, rangeEnd) ? planned[i] ?? 0 : 0
  );
  const a = Array.from({ length: n }, (_, i) =>
    programMonthOverlapsRange(i, rangeStart, rangeEnd) ? actual[i] ?? 0 : 0
  );
  return { planned: p, actual: a };
}

function filterHubPointsByTimeline(
  series: readonly HubPlannedCostPoint[],
  periodView: HubPlannedCostPeriodView,
  rangeStart: Date,
  rangeEnd: Date,
  fiscalStartMonth: number
): HubPlannedCostPoint[] {
  const rs = startOfDayLocal(rangeStart);
  const re = startOfDayLocal(rangeEnd);

  if (periodView === "Years") {
    return series.filter((p) => {
      const y = fiscalYearFromHubYearLabel(p.label);
      if (y === undefined) return true;
      const y0 = startOfDayLocal(new Date(y, 0, 1));
      const y1 = startOfDayLocal(new Date(y, 11, 31));
      return y0.getTime() <= re.getTime() && y1.getTime() >= rs.getTime();
    });
  }

  if (periodView === "Quarter") {
    return series.filter((p) => {
      const m = p.label.match(/^'(\d{2}) Q(\d)$/);
      if (!m) return true;
      const yy = parseInt(m[1]!, 10);
      const fq = parseInt(m[2]!, 10);
      const fy = CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.find((y) => y % 100 === yy % 100);
      if (fy === undefined) return true;
      const fyIndex = CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.indexOf(fy);
      if (fyIndex < 0 || fq < 1 || fq > 4) return true;
      const fqInFy = fq - 1;
      const [startIdx, , endIdx] = fiscalQuarterMonthGlobalIndices(fyIndex, fqInFy, fiscalStartMonth);
      const s0 = programGridMonthFirstLastDay(startIdx);
      const s2 = programGridMonthFirstLastDay(endIdx);
      if (!s0 || !s2) return true;
      return startOfDayLocal(s0.start).getTime() <= re.getTime() && startOfDayLocal(s2.end).getTime() >= rs.getTime();
    });
  }

  return series.filter((_, idx) => {
    const m = programGridMonthFirstLastDay(idx);
    if (!m) return true;
    return startOfDayLocal(m.start).getTime() <= re.getTime() && startOfDayLocal(m.end).getTime() >= rs.getTime();
  });
}

/**
 * Aggregates the same program-horizon month model as {@link getProgramForecastMonthDollarAmounts} (full planned)
 * and {@link getProgramJobToDateMonthAllocations} (job-to-date by overlap), summed across `rows`.
 * Actuals are masked to **past program months only** (through `anchor`'s calendar date); future months are zero.
 * When `viewRange` is set, program months outside the range (clamped to the program grid horizon) are excluded before rollups,
 * and axis buckets that do not overlap the range are dropped.
 */
export function buildCapitalPlanningHubChartSeries(
  rows: readonly CapitalPlanningSampleRow[],
  periodView: HubPlannedCostPeriodView,
  anchor: Date = new Date(),
  viewRange?: HubPlannedCostViewRange,
  fiscalYearStartMonth: number = DEFAULT_CAPITAL_PLANNING_FISCAL_YEAR_START_MONTH
): HubPlannedCostPoint[] {
  const { planned, actual } = aggregateProgramMonthPlannedAndActual(rows);
  const { start: rs, end: re } = clampViewRangeToHorizon(viewRange);
  const { planned: pMasked, actual: aMasked } = maskMonthsToViewTimeline(planned, actual, rs, re);
  const actualPast = maskActualSeriesToPastProgramMonths(aMasked, anchor);

  const rolled =
    periodView === "Quarter"
      ? rollupQuarters(pMasked, actualPast, fiscalYearStartMonth)
      : periodView === "Month"
        ? rollupFirstProgramFiscalYearMonths(pMasked, actualPast)
        : rollupYears(pMasked, actualPast);

  const full = clampViewRangeToHorizon(undefined);
  const isFullHorizon =
    startOfDayLocal(rs).getTime() === startOfDayLocal(full.start).getTime() &&
    startOfDayLocal(re).getTime() === startOfDayLocal(full.end).getTime();

  if (isFullHorizon) return rolled;

  const trimmed = filterHubPointsByTimeline(rolled, periodView, rs, re, fiscalYearStartMonth);
  return trimmed.length > 0 ? trimmed : rolled;
}
