/**
 * Forecast period helpers for Capital Planning program grid.
 *
 * Design references (verify in Figma when logged in — MCP or export for pixel parity):
 * - Forecast cost columns: https://www.figma.com/design/wbjpyOCTw2MQaOzx4ibk6r/Capital-Planning?node-id=4442-89611
 * - FY / FQ + months under quarters: https://www.figma.com/design/wbjpyOCTw2MQaOzx4ibk6r/Capital-Planning?node-id=4444-89771
 * - High level budget items tearsheet: https://www.figma.com/design/wbjpyOCTw2MQaOzx4ibk6r/Capital-Planning?node-id=4440-88961
 */

import type { CapitalPlanningSampleRow, ProjectCurve } from "./capitalPlanningData";
import { dateToIsoString, optionalIsoStringToDate } from "./capitalPlanningData";

export type ForecastGranularity = "month" | "quarter" | "year";

/**
 * US federal-style fiscal year (Oct 1 – Sep 30). Returns a display label such as `FY 2026`.
 */
export function getFiscalYearLabel(anchor: Date): string {
  const y = anchor.getFullYear();
  const m = anchor.getMonth();
  const fyYear = m >= 9 ? y + 1 : y;
  return `FY ${fyYear}`;
}

/** Calendar year of the US FY that contains `anchor` (same basis as {@link getFiscalYearLabel}). */
export function getFiscalYearNumber(anchor: Date): number {
  const y = anchor.getFullYear();
  const m = anchor.getMonth();
  return m >= 9 ? y + 1 : y;
}

/**
 * Twelve month labels (`Jan yy` … `Dec yy`) for a **calendar** FY year number
 * (FQ1 → Jan–Mar … FQ4 → Oct–Dec of that calendar year — same basis as {@link getFiscalYearMonthLabelsUnderQuarters}).
 */
export function getFiscalYearMonthLabelsForCalendarYear(fyYear: number): string[] {
  return Array.from({ length: 12 }, (_, monthIndex) => {
    const d = new Date(fyYear, monthIndex, 1);
    const month = d.toLocaleDateString("en-US", { month: "short" });
    const yy = String(d.getFullYear() % 100).padStart(2, "0");
    return `${month} ${yy}`;
  });
}

/**
 * Twelve month labels (`Jan yy` … `Dec yy`, short month + 2-digit year) in **calendar-quarter**
 * order for the FY number from {@link getFiscalYearNumber} / {@link getFiscalYearLabel}:
 * FQ1 → Jan–Mar, FQ2 → Apr–Jun, FQ3 → Jul–Sep, FQ4 → Oct–Dec of that calendar year.
 */
export function getFiscalYearMonthLabelsUnderQuarters(anchor: Date): string[] {
  return getFiscalYearMonthLabelsForCalendarYear(getFiscalYearNumber(anchor));
}

/** Program grid: FY 2026 through FY 2031 (each block mirrors the original single-FY quarter/month layout). */
export const CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS = [
  2026, 2027, 2028, 2029, 2030, 2031,
] as const;

export const CAPITAL_PLANNING_PROGRAM_FY_COUNT = CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.length;

/**
 * Default FY section expand/collapse (`true` = FQs + months; `false` = one FY total column).
 * **FY 2028–2031** start collapsed; **FY 2026–2027** expanded (first load + quarter reset + master re-expand).
 * For **FY 2027** quarter rollups, see {@link getDefaultForecastFqCollapsed}.
 */
export function getDefaultFyYearSectionExpanded(): boolean[] {
  return CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.map((y) => y < 2028);
}

/**
 * Default per-global-FQ rollup (`true` = one column per quarter; `false` = three month columns).
 * **FY 2027** starts with all four quarters collapsed; other FYs start with quarters expanded.
 */
export function getDefaultForecastFqCollapsed(): boolean[] {
  const n = CAPITAL_PLANNING_PROGRAM_FORECAST_QUARTERS;
  const out = Array.from({ length: n }, () => false);
  const idx2027 = CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.indexOf(2027);
  if (idx2027 >= 0) {
    const base = idx2027 * 4;
    for (let q = 0; q < 4; q++) {
      out[base + q] = true;
    }
  }
  return out;
}

export const CAPITAL_PLANNING_PROGRAM_FORECAST_MONTHS =
  CAPITAL_PLANNING_PROGRAM_FY_COUNT * 12;

export const CAPITAL_PLANNING_PROGRAM_FORECAST_QUARTERS =
  CAPITAL_PLANNING_PROGRAM_FY_COUNT * 4;

/** Concatenated month headers for all program FYs (length {@link CAPITAL_PLANNING_PROGRAM_FORECAST_MONTHS}). */
export function getProgramForecastMonthLabels(): string[] {
  return CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.flatMap((y) =>
    getFiscalYearMonthLabelsForCalendarYear(y)
  );
}

/** `FQ1` … `FQ4` repeated for each program FY (length {@link CAPITAL_PLANNING_PROGRAM_FORECAST_QUARTERS}). */
export function getProgramForecastFqLabels(): string[] {
  return CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.flatMap(() =>
    [1, 2, 3, 4].map((n) => `FQ${n}`)
  );
}

export function programForecastFyLabel(fyYear: number): string {
  return `FY ${fyYear}`;
}

export function getProgramForecastHeaderTitle(): string {
  const first = CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS[0];
  const last = CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS[CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.length - 1];
  return `${programForecastFyLabel(first)} – ${programForecastFyLabel(last)}`;
}

/**
 * Program columns use calendar-year FY blocks: FQ1 = Jan–Mar of `fyYear` (see {@link getFiscalYearMonthLabelsForCalendarYear}).
 * After that quarter ends (on/after Apr 1 of `fyYear`), FQ1 cells are read-only.
 */
export function isProgramForecastFq1PeriodEnded(fyYear: number, anchor: Date): boolean {
  const startOfToday = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate());
  const firstDayAfterFq1 = new Date(fyYear, 3, 1);
  return startOfToday >= firstDayAfterFq1;
}

/** Global month index 0… → which program FY calendar year (2026, 2027, …). */
export function programFiscalYearForGlobalMonthIndex(monthIndex: number): number | undefined {
  const fyIndex = Math.floor(monthIndex / 12);
  return CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS[fyIndex];
}

/** Jan–Mar within a program FY block (FQ1 month leaf columns). */
export function isGlobalMonthIndexInFq1(monthIndex: number): boolean {
  return monthIndex % 12 < 3;
}

function programHorizonStart(): Date {
  const y = CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS[0];
  return new Date(y, 0, 1);
}

function programHorizonEnd(): Date {
  const y = CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS[CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.length - 1];
  return new Date(y, 11, 31);
}

function startOfDayLocal(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfMonthLocal(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function inclusiveCalendarDays(a: Date, b: Date): number {
  const ta = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const tb = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor((tb - ta) / 86400000) + 1;
}

/** Inclusive overlap in calendar days between project [p0,p1] and month [m0,m1]. */
function overlapInclusiveDays(p0: Date, p1: Date, m0: Date, m1: Date): number {
  const lo = p0 > m0 ? p0 : m0;
  const hi = p1 < m1 ? p1 : m1;
  const loD = startOfDayLocal(lo);
  const hiD = startOfDayLocal(hi);
  if (loD.getTime() > hiD.getTime()) return 0;
  return inclusiveCalendarDays(loD, hiD);
}

/** First/last calendar day for a program-grid month column (FY block = calendar year). */
export function programGridMonthFirstLastDay(monthIndex: number): { start: Date; end: Date } | null {
  const fyYear = CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS[Math.floor(monthIndex / 12)];
  if (fyYear === undefined) return null;
  const m = monthIndex % 12;
  const start = new Date(fyYear, m, 1);
  const lastDay = new Date(fyYear, m + 1, 0).getDate();
  const end = new Date(fyYear, m, lastDay);
  return { start, end };
}

/**
 * Calendar range covered by a forecast override cell (program quarter grid or rolling month/year leaves).
 * Used to expand project start/end when a Manual-curve user commits dollars outside the current span.
 */
export function getForecastOverridePartsCalendarRange(
  parts: readonly (string | number)[],
  anchor: Date,
  forecastGranularity: ForecastGranularity
): { start: Date; end: Date } | null {
  if (parts.length < 2) return null;
  const head = parts[0];
  const kind = parts[1];
  if (head === "q") {
    if (kind === "m" && typeof parts[2] === "number") {
      return programGridMonthFirstLastDay(parts[2]);
    }
    if (kind === "r" && typeof parts[2] === "number") {
      const fq = parts[2];
      const lo = programGridMonthFirstLastDay(fq * 3);
      const hi = programGridMonthFirstLastDay(fq * 3 + 2);
      if (!lo || !hi) return null;
      return { start: lo.start, end: hi.end };
    }
    if (kind === "y" && typeof parts[2] === "number") {
      const fyYear = CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS[parts[2]];
      if (fyYear === undefined) return null;
      return { start: new Date(fyYear, 0, 1), end: new Date(fyYear, 11, 31) };
    }
    if (kind === "fy") {
      const y0 = CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS[0];
      const y1 = CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS[CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.length - 1];
      if (y0 === undefined || y1 === undefined) return null;
      return { start: new Date(y0, 0, 1), end: new Date(y1, 11, 31) };
    }
    return null;
  }
  if (head === "x" && kind === forecastGranularity && parts.length >= 4) {
    const leafKind = parts[2];
    const idx = parts[3];
    if (typeof idx !== "number") return null;
    if (leafKind !== "e" && leafKind !== "c") return null;
    const d0 = startOfMonthLocal(anchor);
    if (forecastGranularity === "month") {
      const d = new Date(d0);
      d.setMonth(d.getMonth() + idx);
      const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      return { start: new Date(d.getFullYear(), d.getMonth(), 1), end: new Date(d.getFullYear(), d.getMonth(), last) };
    }
    if (forecastGranularity === "year") {
      const y = d0.getFullYear() + idx;
      return { start: new Date(y, 0, 1), end: new Date(y, 11, 31) };
    }
  }
  return null;
}

/** Widen ISO start/end so the project span fully includes `range` (inclusive calendar days). */
export function expandProjectIsoDatesToCoverCalendarRange(
  startIso: string,
  endIso: string,
  range: { start: Date; end: Date }
): { startDate: string; endDate: string } {
  const rs = startOfDayLocal(range.start);
  const re = startOfDayLocal(range.end);
  let pStart = optionalIsoStringToDate(startIso);
  let pEnd = optionalIsoStringToDate(endIso);

  if (!pStart && !pEnd) {
    return { startDate: dateToIsoString(rs), endDate: dateToIsoString(re) };
  }
  if (!pStart) pStart = rs;
  if (!pEnd) pEnd = re;
  pStart = startOfDayLocal(pStart);
  pEnd = startOfDayLocal(pEnd);
  if (pEnd.getTime() < pStart.getTime()) {
    const t = pStart;
    pStart = pEnd;
    pEnd = t;
  }

  let nextStart = pStart;
  let nextEnd = pEnd;
  if (rs.getTime() < nextStart.getTime()) nextStart = rs;
  if (re.getTime() > nextEnd.getTime()) nextEnd = re;
  return { startDate: dateToIsoString(nextStart), endDate: dateToIsoString(nextEnd) };
}

/** Map Jan `calendarYear` + 0-based month → program column index, or undefined if outside FY 2026–2031. */
export function programGridMonthIndexForCalendarMonth(
  calendarYear: number,
  monthIndex: number
): number | undefined {
  const fyIndex = CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.findIndex((y) => y === calendarYear);
  if (fyIndex < 0) return undefined;
  return fyIndex * 12 + monthIndex;
}

/**
 * Relative weights for each chronologically ordered active month (length `k`).
 * The forecast total for the grid window is split across active months in proportion to these weights.
 */
function curveMultipliers(curve: ProjectCurve, k: number, rowId: string): number[] {
  if (k <= 0) return [];
  if (k === 1) return [1];
  switch (curve) {
    case "":
      return Array.from({ length: k }, () => 1);
    case "Linear":
      return Array.from({ length: k }, () => 1);
    case "Front-Loaded":
      return Array.from({ length: k }, (_, i) => k - i);
    case "Back-Loaded":
      return Array.from({ length: k }, (_, i) => i + 1);
    case "Bell":
      return Array.from({ length: k }, (_, i) => {
        const t = (i + 0.5) / k;
        return 0.08 + 0.92 * Math.sin(t * Math.PI);
      });
    case "Manual": {
      const seed = rowId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
      return Array.from({ length: k }, (_, i) => {
        const phase = ((seed + i * 31) % 37) / 37;
        return 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(phase * Math.PI));
      });
    }
    default:
      return Array.from({ length: k }, () => 1);
  }
}

/** Largest remainder: integer dollars matching `targetTotal`. */
function allocateExactDollars(targetTotal: number, exact: readonly number[]): number[] {
  const n = exact.length;
  if (n === 0) return [];
  const raw = exact.map((x) => Math.max(0, x));
  const floors = raw.map((x) => Math.floor(x));
  let remainder = Math.round(targetTotal) - floors.reduce((a, b) => a + b, 0);
  const fracs = raw.map((x, i) => ({ i, f: x - floors[i] }));
  fracs.sort((a, b) => b.f - a.f);
  const out = [...floors];
  for (let r = 0; r < remainder; r++) {
    out[fracs[r % n].i]++;
  }
  return out;
}

/**
 * Dollars to spread across the program forecast: **Planned Amount − Job to Date** when job-to-date exists,
 * otherwise the full planned amount (projects without JTD lines yet, e.g. Concept / Bidding with null costs).
 */
export function getForecastAllocationBasisDollars(row: CapitalPlanningSampleRow): number {
  const planned = row.plannedAmount;
  if (planned <= 0) return 0;
  if (row.jobToDateCosts == null) return planned;
  return Math.max(0, planned - row.jobToDateCosts);
}

/**
 * Allocation basis spread across program FY month columns (see {@link getForecastAllocationBasisDollars}).
 * Start/end dates set how much applies within the FY 2026–2031 grid (`sumNaive` from calendar overlap).
 * The selected **curve** splits that total across chronologically ordered months that overlap the project
 * (Linear = even, Front/Back-loaded = ramp, Bell = center-weighted, Manual = pseudo-random but stable per row).
 */
export function getProgramForecastMonthDollarAmounts(row: CapitalPlanningSampleRow): number[] {
  const n = CAPITAL_PLANNING_PROGRAM_FORECAST_MONTHS;
  const out = Array.from({ length: n }, () => 0);
  const planned = getForecastAllocationBasisDollars(row);
  if (planned <= 0) return out;

  let pStart = optionalIsoStringToDate(row.startDate) ?? programHorizonStart();
  let pEnd = optionalIsoStringToDate(row.endDate) ?? programHorizonEnd();
  pStart = startOfDayLocal(pStart);
  pEnd = startOfDayLocal(pEnd);
  if (pEnd.getTime() < pStart.getTime()) {
    const t = pStart;
    pStart = pEnd;
    pEnd = t;
  }

  const T = Math.max(1, inclusiveCalendarDays(pStart, pEnd));
  const naive: number[] = [];
  for (let m = 0; m < n; m++) {
    const rng = programGridMonthFirstLastDay(m);
    if (!rng) {
      naive.push(0);
      continue;
    }
    const od = overlapInclusiveDays(pStart, pEnd, rng.start, rng.end);
    naive.push((planned * od) / T);
  }

  const sumNaive = naive.reduce((a, b) => a + b, 0);
  if (sumNaive <= 0) return out;

  const activeIdx = naive
    .map((v, i) => (v > 1e-9 ? i : -1))
    .filter((i) => i >= 0)
    .sort((a, b) => a - b);
  const k = activeIdx.length;
  const mults = curveMultipliers(row.curve, k, row.id);
  const sumM = mults.reduce((a, b) => a + b, 0);
  if (sumM <= 0) {
    const target = Math.round(sumNaive);
    return allocateExactDollars(target, naive);
  }

  const exact = naive.map(() => 0);
  for (let j = 0; j < k; j++) {
    const i = activeIdx[j];
    exact[i] = sumNaive * ((mults[j] ?? 1) / sumM);
  }
  const target = Math.round(sumNaive);
  return allocateExactDollars(target, exact);
}

export function getProgramForecastDollarSumForFiscalYearIndex(
  row: CapitalPlanningSampleRow,
  fyIndex: number
): number {
  const monthly = getProgramForecastMonthDollarAmounts(row);
  const start = fyIndex * 12;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += monthly[start + i] ?? 0;
  }
  return sum;
}

export function getProgramForecastDollarTotal(row: CapitalPlanningSampleRow): number {
  return getProgramForecastMonthDollarAmounts(row).reduce((a, b) => a + b, 0);
}

/**
 * Matches Capital Planning grid forecast override storage keys.
 * `forecastBasisKey` is supplied by the grid (curve + planned + JTD — not project dates) so edits can widen the span
 * without orphaning overrides.
 */
export function buildCapitalPlanningForecastOverrideKey(
  rowId: string,
  parts: (string | number)[],
  forecastBasisKey: string
): string {
  return `${rowId}::fb:${forecastBasisKey}::${parts.join(":")}`;
}

function isProgramForecastFq1QuarterIndex(fqIndex: number): boolean {
  return fqIndex % 4 === 0;
}

function isProgramForecastQuarterRollupReadOnly(fqIndex: number, anchor: Date): boolean {
  if (!isProgramForecastFq1QuarterIndex(fqIndex)) return false;
  const fyYear = CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS[Math.floor(fqIndex / 4)];
  return fyYear !== undefined && isProgramForecastFq1PeriodEnded(fyYear, anchor);
}

/** FQ1 month leaf cells that are locked after the quarter ends. */
function isProgramForecastMonthGridCellReadOnly(monthIndex: number, anchor: Date): boolean {
  const fyYear = programFiscalYearForGlobalMonthIndex(monthIndex);
  if (fyYear === undefined) return false;
  return isGlobalMonthIndexInFq1(monthIndex) && isProgramForecastFq1PeriodEnded(fyYear, anchor);
}

/**
 * 72 program-month dollar amounts after applying month, quarter (even thirds), FY (even twelfths),
 * and whole-grid overrides — same rules as {@link getAllocatedForecastProgramTotal}.
 */
export function getEffectiveProgramForecastMonthAmounts(
  row: CapitalPlanningSampleRow,
  overrides: Record<string, number>,
  forecastBasisKey: string,
  anchor: Date
): number[] {
  const rowId = row.id;
  const key = (parts: (string | number)[]) =>
    buildCapitalPlanningForecastOverrideKey(rowId, parts, forecastBasisKey);

  const monthly = getProgramForecastMonthDollarAmounts(row);
  const effective = monthly.map((v) => Number(v));

  for (let m = 0; m < CAPITAL_PLANNING_PROGRAM_FORECAST_MONTHS; m++) {
    if (isProgramForecastMonthGridCellReadOnly(m, anchor)) continue;
    const km = key(["q", "m", m]);
    if (overrides[km] !== undefined) effective[m] = overrides[km]!;
  }

  const nq = CAPITAL_PLANNING_PROGRAM_FORECAST_QUARTERS;
  for (let q = 0; q < nq; q++) {
    if (isProgramForecastQuarterRollupReadOnly(q, anchor)) continue;
    const kq = key(["q", "r", q]);
    if (overrides[kq] === undefined) continue;
    const target = overrides[kq]!;
    const rounded = Math.round(target);
    const b = q * 3;
    const third = rounded / 3;
    const shares = allocateExactDollars(rounded, [third, third, third]);
    effective[b] = shares[0] ?? 0;
    effective[b + 1] = shares[1] ?? 0;
    effective[b + 2] = shares[2] ?? 0;
  }

  for (let fy = 0; fy < CAPITAL_PLANNING_PROGRAM_FY_COUNT; fy++) {
    const kfy = key(["q", "y", fy]);
    if (overrides[kfy] === undefined) continue;
    const target = overrides[kfy]!;
    const rounded = Math.round(target);
    const b = fy * 12;
    const twelfth = rounded / 12;
    const portions = Array.from({ length: 12 }, () => twelfth);
    const shares = allocateExactDollars(rounded, portions);
    for (let i = 0; i < 12; i++) effective[b + i] = shares[i] ?? 0;
  }

  const kall = key(["q", "fy"]);
  if (overrides[kall] !== undefined) {
    const target = overrides[kall]!;
    const rounded = Math.round(target);
    const n = CAPITAL_PLANNING_PROGRAM_FORECAST_MONTHS;
    const slice = rounded / n;
    const portions = Array.from({ length: n }, () => slice);
    const shares = allocateExactDollars(rounded, portions);
    for (let i = 0; i < n; i++) effective[i] = shares[i] ?? 0;
  }

  for (let m = 0; m < CAPITAL_PLANNING_PROGRAM_FORECAST_MONTHS; m++) {
    if (isProgramForecastMonthGridCellReadOnly(m, anchor)) {
      effective[m] = monthly[m] ?? 0;
    }
  }

  return effective;
}

/**
 * Total dollars currently allocated in the program FY forecast (72 months), including overrides.
 * Read-only FQ1 cells use the model amount only; FQ1 quarter rollup overrides are ignored when locked.
 */
export function getAllocatedForecastProgramTotal(
  row: CapitalPlanningSampleRow,
  overrides: Record<string, number>,
  forecastBasisKey: string,
  anchor: Date
): number {
  return getEffectiveProgramForecastMonthAmounts(row, overrides, forecastBasisKey, anchor).reduce(
    (a, b) => a + b,
    0
  );
}

function getTotalNonQuarterForecastAllocated(
  row: CapitalPlanningSampleRow,
  overrides: Record<string, number>,
  forecastBasisKey: string,
  anchor: Date,
  granularity: ForecastGranularity,
  forecastColumnsExpanded: boolean,
  leafCount: number
): number {
  const suffix = forecastColumnsExpanded ? "e" : "c";
  let sum = 0;
  for (let i = 0; i < leafCount; i++) {
    const k = buildCapitalPlanningForecastOverrideKey(
      row.id,
      ["x", granularity, suffix, i],
      forecastBasisKey
    );
    const comp = getForecastLeafDollarAmount(row, i, granularity, anchor);
    sum += overrides[k] ?? comp;
  }
  return sum;
}

/**
 * Total forecast dollars for the row (matches visible forecast controls for the given granularity).
 */
export function getTotalAllocatedForecastDollars(
  row: CapitalPlanningSampleRow,
  overrides: Record<string, number>,
  forecastBasisKey: string,
  anchor: Date,
  granularity: ForecastGranularity,
  forecastColumnsExpanded: boolean,
  leafCountNonQuarter: number
): number {
  if (granularity === "quarter") {
    return getAllocatedForecastProgramTotal(row, overrides, forecastBasisKey, anchor);
  }
  return getTotalNonQuarterForecastAllocated(
    row,
    overrides,
    forecastBasisKey,
    anchor,
    granularity,
    forecastColumnsExpanded,
    leafCountNonQuarter
  );
}

/** Allocation basis minus allocated forecast (negative = over-forecast). Basis = planned − JTD when JTD exists. */
export function getRemainingToForecast(
  allocationBasisDollars: number,
  allocatedForecastTotal: number
): number {
  return allocationBasisDollars - allocatedForecastTotal;
}

/** Negative values as `($10.00)`; zero and positive as normal USD. */
export function formatRemainingToForecastCurrency(n: number): string {
  const abs = Math.abs(n);
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs);
  if (n < 0) return `(${formatted})`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

/** Time-only share for a calendar month outside the program grid (rolling forecast columns). */
function naiveDollarOutsideProgramGridMonth(
  row: CapitalPlanningSampleRow,
  calendarYear: number,
  monthIndex: number
): number {
  const planned = getForecastAllocationBasisDollars(row);
  if (planned <= 0) return 0;
  let pStart = optionalIsoStringToDate(row.startDate) ?? programHorizonStart();
  let pEnd = optionalIsoStringToDate(row.endDate) ?? programHorizonEnd();
  pStart = startOfDayLocal(pStart);
  pEnd = startOfDayLocal(pEnd);
  if (pEnd.getTime() < pStart.getTime()) {
    const t = pStart;
    pStart = pEnd;
    pEnd = t;
  }
  const T = Math.max(1, inclusiveCalendarDays(pStart, pEnd));
  const rng = {
    start: new Date(calendarYear, monthIndex, 1),
    end: new Date(calendarYear, monthIndex, new Date(calendarYear, monthIndex + 1, 0).getDate()),
  };
  const od = overlapInclusiveDays(pStart, pEnd, rng.start, rng.end);
  return Math.round((planned * od) / T);
}

/**
 * Dollar amount for non–program-quarter forecast columns (rolling months or calendar years from anchor).
 */
export function getForecastLeafDollarAmount(
  row: CapitalPlanningSampleRow,
  leafIndex: number,
  granularity: ForecastGranularity,
  anchor: Date
): number {
  const monthly = getProgramForecastMonthDollarAmounts(row);
  if (granularity === "month") {
    const d0 = startOfMonthLocal(anchor);
    const d = new Date(d0);
    d.setMonth(d.getMonth() + leafIndex);
    const idx = programGridMonthIndexForCalendarMonth(d.getFullYear(), d.getMonth());
    if (idx !== undefined) return monthly[idx] ?? 0;
    return naiveDollarOutsideProgramGridMonth(row, d.getFullYear(), d.getMonth());
  }
  if (granularity === "year") {
    const d0 = startOfMonthLocal(anchor);
    const y = d0.getFullYear() + leafIndex;
    let sum = 0;
    for (let mon = 0; mon < 12; mon++) {
      const idx = programGridMonthIndexForCalendarMonth(y, mon);
      if (idx !== undefined) sum += monthly[idx] ?? 0;
      else sum += naiveDollarOutsideProgramGridMonth(row, y, mon);
    }
    return sum;
  }
  return 0;
}

export const FORECAST_GRANULARITIES: ForecastGranularity[] = ["month", "quarter", "year"];

export function forecastPeriodCount(granularity: ForecastGranularity): number {
  switch (granularity) {
    case "month":
      return 6;
    case "quarter":
      return 4;
    case "year":
      return 9;
    default:
      return 6;
  }
}

/** Column headers for the forecast section (starts at anchor month). */
export function getForecastColumnLabels(granularity: ForecastGranularity, anchor: Date): string[] {
  const d0 = startOfMonthLocal(anchor);
  const n = forecastPeriodCount(granularity);

  if (granularity === "month") {
    return Array.from({ length: n }, (_, i) => {
      const d = new Date(d0);
      d.setMonth(d.getMonth() + i);
      return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    });
  }

  /** Four US FY quarters (Oct–Sep), aligned with {@link getFiscalYearLabel} — FQ1 … FQ4. */
  if (granularity === "quarter") {
    return Array.from({ length: n }, (_, i) => `FQ${i + 1}`);
  }

  const y0 = d0.getFullYear();
  return Array.from({ length: n }, (_, i) => String(y0 + i));
}

/**
 * Deterministic prototype forecast cost per period (sums approximately to the passed `plannedAmount`
 * total across periods; rounded to whole dollars).
 */
export function sampleForecastCostForPeriod(
  rowId: string,
  periodIndex: number,
  periodCount: number,
  plannedAmount: number
): number {
  if (plannedAmount <= 0 || periodCount <= 0) return 0;
  const seed = rowId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const weights = Array.from({ length: periodCount }, (_, i) => {
    const phase = ((seed + i * 31) % 37) / 37;
    return 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(phase * Math.PI));
  });
  const sumW = weights.reduce((a, b) => a + b, 0);
  const w = weights[periodIndex] ?? 0;
  return Math.round(((w / sumW) * plannedAmount) / 100) * 100;
}

/** Sum of prototype forecast cells for a row (used when the period block is collapsed). */
export function sampleForecastTotalForRow(
  rowId: string,
  periodCount: number,
  plannedAmount: number
): number {
  if (periodCount <= 0) return 0;
  let sum = 0;
  for (let i = 0; i < periodCount; i++) {
    sum += sampleForecastCostForPeriod(rowId, i, periodCount, plannedAmount);
  }
  return sum;
}

const MONTHS_PER_PROGRAM_FY = 12;

/** Sum of the twelve month periods for one program FY index (row-wise FY collapsed to a single column). */
export function sampleForecastTotalForProgramFiscalYear(
  rowId: string,
  fyIndex: number,
  totalMonths: number,
  plannedAmount: number
): number {
  if (plannedAmount <= 0 || totalMonths <= 0 || fyIndex < 0) return 0;
  const start = fyIndex * MONTHS_PER_PROGRAM_FY;
  let sum = 0;
  for (let m = 0; m < MONTHS_PER_PROGRAM_FY; m++) {
    sum += sampleForecastCostForPeriod(rowId, start + m, totalMonths, plannedAmount);
  }
  return sum;
}
