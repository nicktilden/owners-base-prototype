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

/** Inclusive program forecast horizon (Jan 1 first FY … Dec 31 last FY). */
export function getProgramGridHorizon(): { start: Date; end: Date } {
  const y0 = CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS[0];
  const y1 = CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS[CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.length - 1];
  return { start: new Date(y0, 0, 1), end: new Date(y1, 11, 31) };
}

/**
 * Minimum inclusive calendar span between project start and end when both are set
 * (clamp, Gantt create + edge resize). **28** = shortest calendar month (month-level floor;
 * bars may be shorter than one year but not shorter than one month).
 */
export const CAPITAL_PLANNING_MIN_PROJECT_SPAN_DAYS = 28;

const CAPITAL_PLANNING_MIN_PROJECT_SPAN_MS = CAPITAL_PLANNING_MIN_PROJECT_SPAN_DAYS * 86400000;

/** When seed dates miss the program horizon, synthetic spans stay multi-quarter for demo variety. */
const SYNTHETIC_SPAN_LO_DAYS = 90;
const SYNTHETIC_SPAN_CAP_DAYS = 1095;

function fnv1a32(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/** Inclusive calendar day count from `a` through `b` (both treated as local calendar dates). */
function inclusiveDaysBetweenLocal(a: Date, b: Date): number {
  const ta = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const tb = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor((tb - ta) / 86400000) + 1;
}

function addCalendarDaysLocal(d: Date, days: number): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() + days);
  return startOfDayLocal(x);
}

/**
 * If [lo, hi] is shorter than `minDays` inclusive, lengthen inside [hb0, hb1] (anchoring start when possible).
 */
function expandInclusiveSpanToMinDaysInHorizon(
  lo: Date,
  hi: Date,
  hb0: Date,
  hb1: Date,
  minDays: number
): { start: Date; end: Date } {
  const loD = startOfDayLocal(lo);
  const hiD = startOfDayLocal(hi);
  const [a, b] = loD.getTime() <= hiD.getTime() ? [loD, hiD] : [hiD, loD];
  let loOut = a;
  let hiOut = b;
  const spanDays = inclusiveDaysBetweenLocal(loOut, hiOut);
  if (spanDays >= minDays) {
    return { start: loOut, end: hiOut };
  }
  const hb0d = startOfDayLocal(hb0);
  const hb1d = startOfDayLocal(hb1);
  const endExt = addCalendarDaysLocal(loOut, minDays - 1);
  if (endExt.getTime() <= hb1d.getTime()) {
    return { start: loOut, end: endExt };
  }
  const startBack = addCalendarDaysLocal(hb1d, -(minDays - 1));
  if (startBack.getTime() >= hb0d.getTime()) {
    return { start: startBack, end: hb1d };
  }
  return { start: hb0d, end: hb1d };
}

/**
 * When the project span does not intersect the program horizon, pick a stable varied span
 * inside FY 2026–2031 so demo rows are not all collapsed to a single day.
 */
function syntheticSpanInsideProgramHorizon(
  stableKey: string,
  originalStartIso: string,
  originalEndIso: string
): { startDate: string; endDate: string } {
  const { start: hs, end: he } = getProgramGridHorizon();
  const hb0 = startOfDayLocal(hs);
  const hb1 = startOfDayLocal(he);
  const totalDays = inclusiveDaysBetweenLocal(hb0, hb1);
  const seed = `${stableKey}\0${originalStartIso}\0${originalEndIso}`;
  const h0 = fnv1a32(seed);
  const h1 = fnv1a32(`${seed}:span`);
  const spanLo = Math.max(SYNTHETIC_SPAN_LO_DAYS, CAPITAL_PLANNING_MIN_PROJECT_SPAN_DAYS);
  const spanCap = Math.min(SYNTHETIC_SPAN_CAP_DAYS, totalDays);
  if (spanCap < spanLo) {
    return { startDate: dateToIsoString(hb0), endDate: dateToIsoString(hb1) };
  }
  const spanDays = spanLo + (h1 % (spanCap - spanLo + 1));
  const maxStart = Math.max(0, totalDays - spanDays);
  const startOffset = maxStart > 0 ? h0 % (maxStart + 1) : 0;
  const start = addCalendarDaysLocal(hb0, startOffset);
  const end = addCalendarDaysLocal(hb0, startOffset + spanDays - 1);
  return { startDate: dateToIsoString(start), endDate: dateToIsoString(end) };
}

/**
 * Clamp inclusive project start/end to {@link getProgramGridHorizon} (the program forecast columns).
 * If the span does not intersect the horizon, assigns a deterministic varied span inside the grid
 * (keyed by `stableKey` when provided, else the original ISO strings) so prototype data is spread
 * across FY 2026–2031 instead of a single day.
 * Missing or one-sided dates are left unchanged (empty strings preserved).
 */
export function clampProjectIsoDatesToProgramHorizon(
  startIso: string | undefined,
  endIso: string | undefined,
  stableKey?: string
): { startDate: string; endDate: string } {
  const sTrim = startIso?.trim() ?? "";
  const eTrim = endIso?.trim() ?? "";
  if (!sTrim || !eTrim) {
    return { startDate: sTrim, endDate: eTrim };
  }
  const psD = optionalIsoStringToDate(sTrim);
  const peD = optionalIsoStringToDate(eTrim);
  if (!psD || !peD) {
    return { startDate: sTrim, endDate: eTrim };
  }
  const ps = startOfDayLocal(psD);
  const pe = startOfDayLocal(peD);
  const [a0, a1] = ps.getTime() <= pe.getTime() ? [ps, pe] : [pe, ps];
  const { start: hs, end: he } = getProgramGridHorizon();
  const hb0 = startOfDayLocal(hs);
  const hb1 = startOfDayLocal(he);
  const lo = a0.getTime() > hb0.getTime() ? a0 : hb0;
  const hi = a1.getTime() < hb1.getTime() ? a1 : hb1;
  if (lo.getTime() > hi.getTime()) {
    const key = stableKey?.trim() || `${sTrim}|${eTrim}`;
    return syntheticSpanInsideProgramHorizon(key, sTrim, eTrim);
  }
  const expanded = expandInclusiveSpanToMinDaysInHorizon(
    lo,
    hi,
    hb0,
    hb1,
    CAPITAL_PLANNING_MIN_PROJECT_SPAN_DAYS
  );
  return { startDate: dateToIsoString(expanded.start), endDate: dateToIsoString(expanded.end) };
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
    if (forecastGranularity === "quarter") {
      const dStart = new Date(d0);
      dStart.setMonth(dStart.getMonth() + idx * 3);
      const dEnd = new Date(dStart);
      dEnd.setMonth(dEnd.getMonth() + 2);
      const last = new Date(dEnd.getFullYear(), dEnd.getMonth() + 1, 0).getDate();
      return {
        start: new Date(dStart.getFullYear(), dStart.getMonth(), 1),
        end: new Date(dEnd.getFullYear(), dEnd.getMonth(), last),
      };
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
  leafCountNonQuarter: number,
  /** When true with quarter granularity, sum rolling FQ columns instead of the 72-month program grid. */
  ganttFlatForecast = false,
  /** Gantt + View by Month: 72 program months (same totals as grid program forecast). */
  ganttProgramMonthGrid = false,
  /** Gantt + View by Quarter: 24 program quarter rollups (same program total as grid). */
  ganttProgramQuarterBands = false
): number {
  if (
    (granularity === "quarter" && !ganttFlatForecast) ||
    ganttProgramMonthGrid ||
    ganttProgramQuarterBands
  ) {
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

/** One rolling calendar month from anchor (`leafIndex` 0 = anchor month). */
function forecastRollingMonthLeafDollars(
  row: CapitalPlanningSampleRow,
  leafIndex: number,
  anchor: Date
): number {
  const monthly = getProgramForecastMonthDollarAmounts(row);
  const d0 = startOfMonthLocal(anchor);
  const d = new Date(d0);
  d.setMonth(d.getMonth() + leafIndex);
  const idx = programGridMonthIndexForCalendarMonth(d.getFullYear(), d.getMonth());
  if (idx !== undefined) return monthly[idx] ?? 0;
  return naiveDollarOutsideProgramGridMonth(row, d.getFullYear(), d.getMonth());
}

/**
 * Dollar amount for non–program-quarter forecast columns (rolling months or calendar years from anchor),
 * and for **Gantt** rolling fiscal quarters (FQ1–FQ4 = three anchor-aligned months each).
 */
export function getForecastLeafDollarAmount(
  row: CapitalPlanningSampleRow,
  leafIndex: number,
  granularity: ForecastGranularity,
  anchor: Date
): number {
  if (granularity === "month") {
    return forecastRollingMonthLeafDollars(row, leafIndex, anchor);
  }
  if (granularity === "year") {
    const monthly = getProgramForecastMonthDollarAmounts(row);
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
  if (granularity === "quarter") {
    let sum = 0;
    for (let k = 0; k < 3; k++) {
      sum += forecastRollingMonthLeafDollars(row, leafIndex * 3 + k, anchor);
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

/** Calendar span for Gantt “View by year” (matches {@link getForecastColumnLabels} year columns). */
export function getRollingYearGanttHorizon(anchor: Date): { start: Date; end: Date } {
  const d0 = startOfMonthLocal(anchor);
  const y0 = d0.getFullYear();
  const n = forecastPeriodCount("year");
  return { start: new Date(y0, 0, 1), end: new Date(y0 + n - 1, 11, 31) };
}

export type CapitalPlanningGanttBarTimeline = "program" | "rollingYear";

/** Minimum rendered width of the Gantt bar on the timeline rail (px); see {@link getCapitalPlanningGanttBarPercents}. */
export const GANTT_MIN_BAR_VISUAL_WIDTH_PX = 25;

export type GetCapitalPlanningGanttBarPercentsOptions = {
  /** When set, `widthPct` is floored so the bar is at least ~{@link GANTT_MIN_BAR_VISUAL_WIDTH_PX}px wide on that rail. */
  trackWidthPx?: number;
};

/**
 * CSS percentage `left` / `width` for a Gantt bar along the program FY grid or rolling-year columns.
 * Both dates empty → zero width. One date missing → other edge clamped to horizon.
 *
 * Bar chrome (explorations / screenshot parity): fill `#D5F6F1`, border `#1B7E6E`, end handles `#24A892`, height 24px.
 * [Figma — Capital Planning explorations](https://www.figma.com/design/HHkPLbAONFYxhCrcfsrpEs/Capital-Planning-Explorations?node-id=5205-19451).
 */
export function getCapitalPlanningGanttBarPercents(
  startIso: string | undefined,
  endIso: string | undefined,
  timeline: CapitalPlanningGanttBarTimeline,
  anchor: Date,
  options?: GetCapitalPlanningGanttBarPercentsOptions
): { leftPct: number; widthPct: number } {
  const horizon =
    timeline === "program" ? getProgramGridHorizon() : getRollingYearGanttHorizon(anchor);
  const sTrim = startIso?.trim() ?? "";
  const eTrim = endIso?.trim() ?? "";
  if (!sTrim && !eTrim) {
    return { leftPct: 0, widthPct: 0 };
  }

  const h0 = startOfDayLocal(horizon.start).getTime();
  const h1 = startOfDayLocal(horizon.end).getTime() + 86400000;
  const span = Math.max(1, h1 - h0);

  const pS = optionalIsoStringToDate(sTrim) ?? horizon.start;
  const pE = optionalIsoStringToDate(eTrim) ?? horizon.end;
  const ps = startOfDayLocal(pS).getTime();
  const pe = startOfDayLocal(pE).getTime() + 86400000;

  const u0 = Math.min(Math.max(ps, h0), h1);
  const u1 = Math.min(Math.max(pe, h0), h1);
  const lo = Math.min(u0, u1);
  const hi = Math.max(u0, u1);
  let widthPct = ((hi - lo) / span) * 100;
  let leftPct = ((lo - h0) / span) * 100;

  const tw = options?.trackWidthPx;
  if (tw && tw > 0 && widthPct > 0) {
    const minPct = (GANTT_MIN_BAR_VISUAL_WIDTH_PX / tw) * 100;
    if (widthPct < minPct) {
      widthPct = minPct;
    }
    if (leftPct + widthPct > 100) {
      leftPct = Math.max(0, 100 - widthPct);
    }
  } else if (widthPct > 0 && widthPct < 0.75) {
    widthPct = 0.75;
  }

  if (!Number.isFinite(leftPct) || leftPct < 0) {
    return { leftPct: 0, widthPct: 0 };
  }
  if (!Number.isFinite(widthPct) || widthPct <= 0) {
    return { leftPct, widthPct: 0 };
  }
  return { leftPct, widthPct };
}

/**
 * Clamped timeline window for horizontal drag (same `lo` / `hi` ms bounds as {@link getCapitalPlanningGanttBarPercents}).
 * `hi` is exclusive end-of-range (midnight after the last inclusive calendar day).
 */
export function getCapitalPlanningGanttBarDragRange(
  startIso: string | undefined,
  endIso: string | undefined,
  timeline: CapitalPlanningGanttBarTimeline,
  anchor: Date
): { h0: number; h1: number; span: number; lo: number; hi: number } | null {
  const horizon =
    timeline === "program" ? getProgramGridHorizon() : getRollingYearGanttHorizon(anchor);
  const sTrim = startIso?.trim() ?? "";
  const eTrim = endIso?.trim() ?? "";
  if (!sTrim && !eTrim) {
    return null;
  }
  const h0 = startOfDayLocal(horizon.start).getTime();
  const h1 = startOfDayLocal(horizon.end).getTime() + 86400000;
  const span = Math.max(1, h1 - h0);

  const pS = optionalIsoStringToDate(sTrim) ?? horizon.start;
  const pE = optionalIsoStringToDate(eTrim) ?? horizon.end;
  const ps = startOfDayLocal(pS).getTime();
  const pe = startOfDayLocal(pE).getTime() + 86400000;
  const u0 = Math.min(Math.max(ps, h0), h1);
  const u1 = Math.min(Math.max(pe, h0), h1);
  const lo = Math.min(u0, u1);
  const hi = Math.max(u0, u1);
  return { h0, h1, span, lo, hi };
}

/** Program / rolling-year timeline bounds for drawing a first bar (both dates still blank). */
export function getCapitalPlanningGanttEmptyBarHorizon(
  timeline: CapitalPlanningGanttBarTimeline,
  anchor: Date
): { h0: number; h1: number; span: number } {
  const horizon =
    timeline === "program" ? getProgramGridHorizon() : getRollingYearGanttHorizon(anchor);
  const h0 = startOfDayLocal(horizon.start).getTime();
  const h1 = startOfDayLocal(horizon.end).getTime() + 86400000;
  return { h0, h1, span: Math.max(1, h1 - h0) };
}

/**
 * Map a click-drag along the empty rail to inclusive start/end ISO dates (same horizon as the bar).
 * Enforces at least {@link CAPITAL_PLANNING_MIN_PROJECT_SPAN_DAYS} calendar days (month floor), at least one day,
 * and at least ~{@link GANTT_MIN_BAR_VISUAL_WIDTH_PX} on the rail.
 */
export function capitalPlanningGanttDatesFromNewBarDrag(
  trackLeftPx: number,
  trackWidthPx: number,
  downClientX: number,
  moveClientX: number,
  h0: number,
  h1: number,
  span: number
): { startDate: string; endDate: string } {
  const w = Math.max(1, trackWidthPx);
  const r0 = Math.min(1, Math.max(0, (downClientX - trackLeftPx) / w));
  const r1 = Math.min(1, Math.max(0, (moveClientX - trackLeftPx) / w));
  const t0 = h0 + r0 * span;
  const t1 = h0 + r1 * span;
  const dayA = startOfDayLocal(new Date(Math.min(t0, t1))).getTime();
  const dayB = startOfDayLocal(new Date(Math.max(t0, t1))).getTime();
  let nlo = Math.max(h0, Math.min(dayA, h1 - 86400000));
  let nhiExclusive = Math.min(h1, dayB + 86400000);
  if (nhiExclusive <= nlo) {
    nhiExclusive = Math.min(h1, nlo + 86400000);
  }
  const minSpanMs = Math.max(
    86400000,
    (GANTT_MIN_BAR_VISUAL_WIDTH_PX / w) * span,
    CAPITAL_PLANNING_MIN_PROJECT_SPAN_MS
  );
  if (nhiExclusive - nlo < minSpanMs) {
    nhiExclusive = Math.min(h1, nlo + minSpanMs);
    if (nhiExclusive - nlo < minSpanMs) {
      nlo = Math.max(h0, nhiExclusive - minSpanMs);
    }
  }
  return {
    startDate: dateToIsoString(startOfDayLocal(new Date(nlo))),
    endDate: dateToIsoString(startOfDayLocal(new Date(nhiExclusive - 86400000))),
  };
}

/** Shift the bar by pointer delta (ratio of full track width); preserves duration; clamps inside the horizon. */
export function capitalPlanningGanttDatesAfterHorizontalShift(
  range: { h0: number; h1: number; span: number; lo: number; hi: number },
  /** (pointerClientX - pointerDownClientX) / trackWidthPx */
  deltaXRatio: number
): { startDate: string; endDate: string } {
  const deltaMs = deltaXRatio * range.span;
  let nlo = range.lo + deltaMs;
  let nhi = range.hi + deltaMs;
  if (nlo < range.h0) {
    const fix = range.h0 - nlo;
    nlo += fix;
    nhi += fix;
  }
  if (nhi > range.h1) {
    const fix = range.h1 - nhi;
    nlo += fix;
    nhi += fix;
  }
  return {
    startDate: dateToIsoString(startOfDayLocal(new Date(nlo))),
    endDate: dateToIsoString(startOfDayLocal(new Date(nhi - 86400000))),
  };
}

/**
 * Resize the bar from the start or end edge by dragging along the track (same timeline mapping as the bar).
 * Opposite edge stays fixed in timeline ms (`lo` / `hi` from {@link getCapitalPlanningGanttBarDragRange}).
 */
export function capitalPlanningGanttDatesAfterEdgeResize(
  edge: "start" | "end",
  trackLeftPx: number,
  trackWidthPx: number,
  pointerClientX: number,
  h0: number,
  h1: number,
  span: number,
  loMs: number,
  hiMs: number
): { startDate: string; endDate: string } {
  const w = Math.max(1, trackWidthPx);
  const ratio = Math.min(1, Math.max(0, (pointerClientX - trackLeftPx) / w));
  const t = h0 + ratio * span;
  if (edge === "end") {
    let nhi = Math.min(Math.max(t, loMs + CAPITAL_PLANNING_MIN_PROJECT_SPAN_MS), h1);
    const nlo = loMs;
    return {
      startDate: dateToIsoString(startOfDayLocal(new Date(nlo))),
      endDate: dateToIsoString(startOfDayLocal(new Date(nhi - 86400000))),
    };
  }
  let nlo = Math.min(Math.max(t, h0), hiMs - CAPITAL_PLANNING_MIN_PROJECT_SPAN_MS);
  const nhi = hiMs;
  return {
    startDate: dateToIsoString(startOfDayLocal(new Date(nlo))),
    endDate: dateToIsoString(startOfDayLocal(new Date(nhi - 86400000))),
  };
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
