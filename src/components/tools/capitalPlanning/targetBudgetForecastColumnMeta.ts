import {
  CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS,
  CAPITAL_PLANNING_PROGRAM_FORECAST_MONTHS,
  fiscalQuarterMonthGlobalIndices,
  getProgramForecastFqLabels,
  getProgramForecastMonthLabels,
  programForecastFyLabel,
} from "./capitalPlanningForecast";

/** Matches {@link AddTargetBudgetTearsheet} curve select (no `Manual`). */
export const TARGET_BUDGET_DISTRIBUTION_CURVES = ["Linear", "Front-Loaded", "Back-Loaded", "Bell"] as const;
export type TargetBudgetDistributionCurve = (typeof TARGET_BUDGET_DISTRIBUTION_CURVES)[number];

/** Must match {@link ForecastEditableNumberCell} `forecastBasisKey` for Target Budget rows. */
export const TARGET_BUDGET_FORECAST_BASIS_KEY = "target-budget-tier";

export function targetBudgetForecastOverrideStorageKey(
  hierarchyCollapseKey: string,
  columnIndex: number,
  basisKey: string = TARGET_BUDGET_FORECAST_BASIS_KEY
): string {
  return `tb-tier-${hierarchyCollapseKey}::fb:${basisKey}::tb:${columnIndex}`;
}

/**
 * Stable key for a target amount by fiscal period (FY / FQ / month), independent of column expand state.
 * Tearsheet `periodKey` values: `pt`, `fy-0`, `fq-4`, `m-12`, etc.
 */
export function targetBudgetForecastOverridePeriodStorageKey(
  hierarchyCollapseKey: string,
  periodKey: string,
  basisKey: string = TARGET_BUDGET_FORECAST_BASIS_KEY
): string {
  return `tb-tier-${hierarchyCollapseKey}::fb:${basisKey}::p:${periodKey}`;
}

/** Map flat region group keys to Target Budget row keys (`r:…` / `c:…` / `b:…`). */
export function targetBudgetCollapseKeysForAggregateRow(aggregateKey: string): string[] {
  if (aggregateKey.startsWith("r:") || aggregateKey.startsWith("c:") || aggregateKey.startsWith("b:")) {
    return [aggregateKey];
  }
  return [`r:${aggregateKey}`, aggregateKey];
}

export type TargetBudgetTimeGranularity = "program_total" | "fiscal_year" | "fiscal_quarter" | "month";

export type TargetBudgetColumnMeta =
  | { columnIndex: number; granularity: "program_total"; periodLabel: string }
  | {
      columnIndex: number;
      granularity: "fiscal_year";
      fyIndex: number;
      fyYear: number;
      periodLabel: string;
    }
  | {
      columnIndex: number;
      granularity: "fiscal_quarter";
      fyIndex: number;
      fqIndex: number;
      fyYear: number;
      periodLabel: string;
    }
  | {
      columnIndex: number;
      granularity: "month";
      fyIndex: number;
      fqIndex: number;
      monthIndex: number;
      fyYear: number;
      periodLabel: string;
      /** Comparison snapshot sub-columns: omit Target Budget cap / variance chrome. */
      skipTargetBudgetCap?: boolean;
    };

/**
 * Visible Target Budget forecast columns in table order — matches
 * {@link computeCapitalPlanningGridTotals} / body cell class walk.
 */
export function enumerateTargetBudgetForecastColumns(args: {
  forecastColumnsExpanded: boolean;
  /** Target Budget uses quarter program layout. */
  forecastGranularity: "quarter";
  fyYearSectionExpanded: readonly boolean[];
  fqCollapsed: readonly boolean[];
  fiscalYearStartMonth: number;
  forecastFqLabels?: readonly string[];
  forecastMonthLabels?: readonly string[];
  /** When set with {@link args.forecastComparisonEnabled}, month columns expand to Current / Snapshot / Variance. */
  comparisonMonthDetailOpen?: ReadonlySet<number>;
  forecastComparisonEnabled?: boolean;
}): TargetBudgetColumnMeta[] {
  const fqLabels = args.forecastFqLabels ?? getProgramForecastFqLabels();
  const monthLabels = args.forecastMonthLabels ?? getProgramForecastMonthLabels();

  if (!args.forecastColumnsExpanded) {
    if (args.forecastGranularity !== "quarter") return [];
    return [{ columnIndex: 0, granularity: "program_total", periodLabel: "All periods" }];
  }

  const metas: TargetBudgetColumnMeta[] = [];
  let columnIndex = 0;

  for (let fyIndex = 0; fyIndex < CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.length; fyIndex++) {
    const fyYear = CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS[fyIndex]!;
    if (!args.fyYearSectionExpanded[fyIndex]) {
      metas.push({
        columnIndex: columnIndex++,
        granularity: "fiscal_year",
        fyIndex,
        fyYear,
        periodLabel: programForecastFyLabel(fyYear),
      });
      continue;
    }
    for (let fqInFy = 0; fqInFy < 4; fqInFy++) {
      const fqIndex = fyIndex * 4 + fqInFy;
      const fqLabel = fqLabels[fqIndex] ?? `FQ${fqInFy + 1}`;
      if (args.fqCollapsed[fqIndex]) {
        metas.push({
          columnIndex: columnIndex++,
          granularity: "fiscal_quarter",
          fyIndex,
          fqIndex,
          fyYear,
          periodLabel: `${fqLabel} ${fyYear}`,
        });
      } else {
        const fqMonthIndices = fiscalQuarterMonthGlobalIndices(
          fyIndex,
          fqInFy,
          args.fiscalYearStartMonth
        );
        for (let k = 0; k < 3; k++) {
          const monthIdx = fqMonthIndices[k]!;
          const baseLabel = monthLabels[monthIdx] ?? `Month ${monthIdx + 1}`;
          const expandComparison =
            Boolean(args.forecastComparisonEnabled) &&
            Boolean(args.comparisonMonthDetailOpen?.has(monthIdx));
          if (expandComparison) {
            metas.push({
              columnIndex: columnIndex++,
              granularity: "month",
              fyIndex,
              fqIndex,
              monthIndex: monthIdx,
              fyYear,
              periodLabel: `${baseLabel} — Current`,
            });
            metas.push({
              columnIndex: columnIndex++,
              granularity: "month",
              fyIndex,
              fqIndex,
              monthIndex: monthIdx,
              fyYear,
              periodLabel: `${baseLabel} — Comparison`,
              skipTargetBudgetCap: true,
            });
            metas.push({
              columnIndex: columnIndex++,
              granularity: "month",
              fyIndex,
              fqIndex,
              monthIndex: monthIdx,
              fyYear,
              periodLabel: `${baseLabel} — Variance`,
              skipTargetBudgetCap: true,
            });
          } else {
            metas.push({
              columnIndex: columnIndex++,
              granularity: "month",
              fyIndex,
              fqIndex,
              monthIndex: monthIdx,
              fyYear,
              periodLabel: baseLabel,
            });
          }
        }
      }
    }
  }
  return metas;
}

export function targetBudgetGranularityLabel(g: TargetBudgetTimeGranularity): string {
  switch (g) {
    case "program_total":
      return "Program Total";
    case "fiscal_year":
      return "Fiscal Year";
    case "fiscal_quarter":
      return "Fiscal Quarter";
    case "month":
      return "Month";
    default:
      return g;
  }
}

/** Tearsheet Time → period row (independent of current grid column collapse). */
export type TargetBudgetTearsheetPeriodPick =
  | { kind: "program_total" }
  | { kind: "fiscal_year"; fyIndex: number }
  | { kind: "fiscal_quarter"; fqIndex: number }
  | { kind: "month"; monthIndex: number };

export type TargetBudgetTearsheetPeriodOption = {
  periodKey: string;
  periodLabel: string;
  pick: TargetBudgetTearsheetPeriodPick;
};

/** When master forecast is one column, include program total; otherwise FY / quarter / month are all available. */
export function targetBudgetTearsheetGranularityChoices(hasProgramTotalColumn: boolean): TargetBudgetTimeGranularity[] {
  if (hasProgramTotalColumn) {
    return ["program_total", "fiscal_year", "fiscal_quarter", "month"];
  }
  return ["fiscal_year", "fiscal_quarter", "month"];
}

export function columnMetaToTearsheetPeriodKey(meta: TargetBudgetColumnMeta): string {
  if (meta.granularity === "program_total") return "pt";
  if (meta.granularity === "fiscal_year") return `fy-${meta.fyIndex}`;
  if (meta.granularity === "fiscal_quarter") return `fq-${meta.fqIndex}`;
  return `m-${meta.monthIndex}`;
}

/** Global program month indices (0 … 12·N−1) for one program fiscal year block. */
function globalMonthIndicesForProgramFiscalYear(fyIndex: number): number[] {
  return Array.from({ length: 12 }, (_, k) => fyIndex * 12 + k);
}

export function globalMonthIndicesForFiscalQuarter(
  fqIndex: number,
  fiscalYearStartMonth: number
): number[] {
  const fyIndex = Math.floor(fqIndex / 4);
  const fqInFy = fqIndex % 4;
  return [...fiscalQuarterMonthGlobalIndices(fyIndex, fqInFy, fiscalYearStartMonth)];
}

/**
 * Split a dollar total into `partCount` non-negative parts that sum to `total` (cent-safe).
 */
export function evenSplitDollarsAcrossParts(total: number, partCount: number): number[] {
  if (partCount <= 0) return [];
  const cents = Math.round(Math.max(0, total) * 100);
  const base = Math.floor(cents / partCount);
  const rem = cents % partCount;
  return Array.from({ length: partCount }, (_, i) => (base + (i < rem ? 1 : 0)) / 100);
}

function targetBudgetCurveRawWeights(partCount: number, curve: TargetBudgetDistributionCurve): number[] {
  if (partCount <= 0) return [];
  const n = partCount;
  if (curve === "Linear") {
    return Array.from({ length: n }, () => 1);
  }
  if (curve === "Front-Loaded") {
    return Array.from({ length: n }, (_, i) => n - i);
  }
  if (curve === "Back-Loaded") {
    return Array.from({ length: n }, (_, i) => i + 1);
  }
  if (curve === "Bell") {
    return Array.from({ length: n }, (_, i) => Math.sin(((i + 0.5) / n) * Math.PI));
  }
  return Array.from({ length: n }, () => 1);
}

/**
 * Split `total` dollars across `partCount` segments using the prototype curve (Linear = even).
 * Uses largest-remainder cent allocation so parts sum exactly to `total`.
 */
export function splitDollarsByTargetBudgetCurve(
  total: number,
  partCount: number,
  curve: TargetBudgetDistributionCurve
): number[] {
  if (partCount <= 0) return [];
  if (curve === "Linear") {
    return evenSplitDollarsAcrossParts(total, partCount);
  }
  const raw = targetBudgetCurveRawWeights(partCount, curve);
  const sumW = raw.reduce((a, b) => a + b, 0);
  if (sumW <= 0) {
    return evenSplitDollarsAcrossParts(total, partCount);
  }
  const totalCents = Math.round(Math.max(0, total) * 100);
  const norm = raw.map((w) => w / sumW);
  const exact = norm.map((p) => p * totalCents);
  const floors = exact.map((x) => Math.floor(x));
  let leftover = totalCents - floors.reduce((a, b) => a + b, 0);
  const order = exact
    .map((x, i) => ({ i, frac: x - floors[i]! }))
    .sort((a, b) => b.frac - a.frac);
  const centsOut = [...floors];
  for (let k = 0; k < leftover; k++) {
    centsOut[order[k]!.i] += 1;
  }
  return centsOut.map((c) => c / 100);
}

/**
 * Period keys for one hierarchy row that a new save replaces (FY/FQ saves spread to `m-*`, so clear
 * prior `fy-*` / `fq-*` / `m-*` in that scope).
 */
export function periodKeysSupersededByTargetBudgetSave(
  periodKey: string,
  fiscalYearStartMonth: number
): readonly string[] {
  if (periodKey === "pt") {
    const keys: string[] = ["pt"];
    for (let i = 0; i < CAPITAL_PLANNING_PROGRAM_FORECAST_MONTHS; i++) {
      keys.push(`m-${i}`);
    }
    return keys;
  }
  if (periodKey.startsWith("fy-")) {
    const fyIndex = Number(periodKey.slice(3)) || 0;
    const keys: string[] = [`fy-${fyIndex}`];
    for (let q = 0; q < 4; q++) {
      keys.push(`fq-${fyIndex * 4 + q}`);
    }
    for (const mi of globalMonthIndicesForProgramFiscalYear(fyIndex)) {
      keys.push(`m-${mi}`);
    }
    return keys;
  }
  if (periodKey.startsWith("fq-")) {
    const fqIndex = Number(periodKey.slice(3)) || 0;
    const months = globalMonthIndicesForFiscalQuarter(fqIndex, fiscalYearStartMonth);
    return [`fq-${fqIndex}`, ...months.map((mi) => `m-${mi}`)];
  }
  return [periodKey];
}

function clearLegacyTargetBudgetColumnKeysForHierarchy(
  next: Record<string, number>,
  hierarchyCollapseKey: string,
  basisKey: string = TARGET_BUDGET_FORECAST_BASIS_KEY
): void {
  const needle = `tb-tier-${hierarchyCollapseKey}::fb:${basisKey}::tb:`;
  for (const k of Object.keys(next)) {
    if (k.startsWith(needle)) {
      delete next[k];
    }
  }
}

/**
 * Apply a Target Budget tearsheet save: FY / FQ amounts are written on underlying `m-*` keys
 * (even split for Linear; weighted by curve otherwise). Program total uses `pt` for Linear only.
 */
export function mergeTargetBudgetSpreadSaveIntoOverrides(
  prev: Record<string, number>,
  hierarchyCollapseKey: string,
  periodKey: string,
  amount: number,
  fiscalYearStartMonth: number,
  legacyColumnIndex: number,
  curve: TargetBudgetDistributionCurve
): Record<string, number> {
  const next = { ...prev };
  for (const pk of periodKeysSupersededByTargetBudgetSave(periodKey, fiscalYearStartMonth)) {
    delete next[targetBudgetForecastOverridePeriodStorageKey(hierarchyCollapseKey, pk)];
  }
  delete next[targetBudgetForecastOverrideStorageKey(hierarchyCollapseKey, legacyColumnIndex)];
  clearLegacyTargetBudgetColumnKeysForHierarchy(next, hierarchyCollapseKey);

  if (!Number.isFinite(amount) || amount <= 0) {
    return next;
  }

  if (periodKey === "pt") {
    if (curve === "Linear") {
      next[targetBudgetForecastOverridePeriodStorageKey(hierarchyCollapseKey, "pt")] = amount;
      return next;
    }
    const months = Array.from({ length: CAPITAL_PLANNING_PROGRAM_FORECAST_MONTHS }, (_, i) => i);
    const parts = splitDollarsByTargetBudgetCurve(amount, months.length, curve);
    months.forEach((mi, i) => {
      next[targetBudgetForecastOverridePeriodStorageKey(hierarchyCollapseKey, `m-${mi}`)] = parts[i]!;
    });
    return next;
  }

  if (periodKey.startsWith("m-")) {
    next[targetBudgetForecastOverridePeriodStorageKey(hierarchyCollapseKey, periodKey)] = amount;
    return next;
  }

  if (periodKey.startsWith("fy-")) {
    const fyIndex = Number(periodKey.slice(3)) || 0;
    const months = globalMonthIndicesForProgramFiscalYear(fyIndex);
    const parts = splitDollarsByTargetBudgetCurve(amount, months.length, curve);
    months.forEach((mi, i) => {
      next[targetBudgetForecastOverridePeriodStorageKey(hierarchyCollapseKey, `m-${mi}`)] = parts[i]!;
    });
    return next;
  }

  if (periodKey.startsWith("fq-")) {
    const fqIndex = Number(periodKey.slice(3)) || 0;
    const months = globalMonthIndicesForFiscalQuarter(fqIndex, fiscalYearStartMonth);
    const parts = splitDollarsByTargetBudgetCurve(amount, months.length, curve);
    months.forEach((mi, i) => {
      next[targetBudgetForecastOverridePeriodStorageKey(hierarchyCollapseKey, `m-${mi}`)] = parts[i]!;
    });
    return next;
  }

  next[targetBudgetForecastOverridePeriodStorageKey(hierarchyCollapseKey, periodKey)] = amount;
  return next;
}

function sumTargetBudgetOverridesForPeriodKeys(
  hierarchyCollapseKey: string,
  periodKeys: readonly string[],
  overrides: Record<string, number>
): number {
  let sum = 0;
  for (const pk of periodKeys) {
    const v = overrides[targetBudgetForecastOverridePeriodStorageKey(hierarchyCollapseKey, pk)];
    if (v !== undefined && Number.isFinite(v) && v > 0) {
      sum += v;
    }
  }
  return sum;
}

function readTargetBudgetOverrideForSingleHierarchyKey(
  hierarchyCollapseKey: string,
  columnMeta: TargetBudgetColumnMeta | undefined,
  columnIndex: number,
  overrides: Record<string, number>,
  fiscalYearStartMonth: number
): number {
  if (columnMeta) {
    /**
     * FY / FQ columns must prefer sums of underlying `m-*` keys (tearsheet spread + Linear curve).
     * A stored `fy-*` / `fq-*` snapshot (e.g. legacy seed) would otherwise mask month splits and make
     * year vs quarter/month views disagree.
     */
    if (columnMeta.granularity === "month" && columnMeta.skipTargetBudgetCap) {
      return 0;
    }

    if (columnMeta.granularity === "month") {
      const pk = columnMetaToTearsheetPeriodKey(columnMeta);
      const periodMapKey = targetBudgetForecastOverridePeriodStorageKey(hierarchyCollapseKey, pk);
      const pv = overrides[periodMapKey];
      if (pv !== undefined && Number.isFinite(pv) && pv > 0) {
        return pv;
      }
    }

    if (columnMeta.granularity === "fiscal_year") {
      const monthKeys = globalMonthIndicesForProgramFiscalYear(columnMeta.fyIndex).map((mi) => `m-${mi}`);
      const rolled = sumTargetBudgetOverridesForPeriodKeys(hierarchyCollapseKey, monthKeys, overrides);
      if (rolled > 0) {
        return rolled;
      }
      const fyPk = `fy-${columnMeta.fyIndex}`;
      const fyDirect = overrides[targetBudgetForecastOverridePeriodStorageKey(hierarchyCollapseKey, fyPk)];
      if (fyDirect !== undefined && Number.isFinite(fyDirect) && fyDirect > 0) {
        return fyDirect;
      }
    }

    if (columnMeta.granularity === "fiscal_quarter") {
      const monthKeys = globalMonthIndicesForFiscalQuarter(columnMeta.fqIndex, fiscalYearStartMonth).map(
        (mi) => `m-${mi}`
      );
      const rolled = sumTargetBudgetOverridesForPeriodKeys(hierarchyCollapseKey, monthKeys, overrides);
      if (rolled > 0) {
        return rolled;
      }
      const fqPk = `fq-${columnMeta.fqIndex}`;
      const fqDirect = overrides[targetBudgetForecastOverridePeriodStorageKey(hierarchyCollapseKey, fqPk)];
      if (fqDirect !== undefined && Number.isFinite(fqDirect) && fqDirect > 0) {
        return fqDirect;
      }
    }

    if (columnMeta.granularity === "program_total") {
      const pk = columnMetaToTearsheetPeriodKey(columnMeta);
      const periodMapKey = targetBudgetForecastOverridePeriodStorageKey(hierarchyCollapseKey, pk);
      const pv = overrides[periodMapKey];
      if (pv !== undefined && Number.isFinite(pv) && pv > 0) {
        return pv;
      }
      const allMonthKeys = Array.from({ length: CAPITAL_PLANNING_PROGRAM_FORECAST_MONTHS }, (_, i) => `m-${i}`);
      const rolled = sumTargetBudgetOverridesForPeriodKeys(hierarchyCollapseKey, allMonthKeys, overrides);
      if (rolled > 0) {
        return rolled;
      }
    }
  }
  const legacyKey = targetBudgetForecastOverrideStorageKey(hierarchyCollapseKey, columnIndex);
  const lv = overrides[legacyKey];
  if (lv !== undefined && Number.isFinite(lv) && lv > 0) {
    return lv;
  }
  return 0;
}

/**
 * Resolve saved target amount for a forecast leaf column using period keys first, then legacy column index.
 * FY / FQ / program-total rollups sum underlying `m-*` saves from the Target Budget tearsheet (including curve-weighted spreads).
 */
export function readTargetBudgetOverrideForCell(
  hierarchyCollapseKeyCandidates: readonly string[],
  columnMeta: TargetBudgetColumnMeta | undefined,
  columnIndex: number,
  overrides: Record<string, number>,
  fiscalYearStartMonth: number
): number {
  for (const ck of hierarchyCollapseKeyCandidates) {
    const v = readTargetBudgetOverrideForSingleHierarchyKey(
      ck,
      columnMeta,
      columnIndex,
      overrides,
      fiscalYearStartMonth
    );
    if (v > 0) {
      return v;
    }
  }
  return 0;
}

export function tearsheetPeriodKeyToPick(
  granularity: TargetBudgetTimeGranularity,
  periodKey: string
): TargetBudgetTearsheetPeriodPick {
  if (granularity === "program_total" || periodKey === "pt") return { kind: "program_total" };
  if (granularity === "fiscal_year") return { kind: "fiscal_year", fyIndex: Number(periodKey.replace(/^fy-/, "")) || 0 };
  if (granularity === "fiscal_quarter")
    return { kind: "fiscal_quarter", fqIndex: Number(periodKey.replace(/^fq-/, "")) || 0 };
  return { kind: "month", monthIndex: Number(periodKey.replace(/^m-/, "")) || 0 };
}

function globalMonthIndexToFqIndex(monthIndex: number, fiscalYearStartMonth: number): number {
  for (let fyIndex = 0; fyIndex < CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.length; fyIndex++) {
    for (let fqInFy = 0; fqInFy < 4; fqInFy++) {
      const ix = fiscalQuarterMonthGlobalIndices(fyIndex, fqInFy, fiscalYearStartMonth);
      if (ix[0] === monthIndex || ix[1] === monthIndex || ix[2] === monthIndex) {
        return fyIndex * 4 + fqInFy;
      }
    }
  }
  return 0;
}

/**
 * Full list of periods for the Add Target Budget tearsheet (all FYs, FQs, months).
 * Saving uses {@link resolveTearsheetPeriodPickToColumnIndex} to map onto the current visible grid column.
 */
export function buildTargetBudgetTearsheetPeriodOptions(args: {
  granularity: TargetBudgetTimeGranularity;
  fiscalYearStartMonth: number;
  forecastFqLabels?: readonly string[];
  forecastMonthLabels?: readonly string[];
}): TargetBudgetTearsheetPeriodOption[] {
  const fqLabels = args.forecastFqLabels ?? getProgramForecastFqLabels();
  const monthLabels = args.forecastMonthLabels ?? getProgramForecastMonthLabels();
  const fyCount = CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.length;

  if (args.granularity === "program_total") {
    return [{ periodKey: "pt", periodLabel: "All periods", pick: { kind: "program_total" } }];
  }
  if (args.granularity === "fiscal_year") {
    return CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.map((fyYear, fyIndex) => ({
      periodKey: `fy-${fyIndex}`,
      periodLabel: programForecastFyLabel(fyYear),
      pick: { kind: "fiscal_year", fyIndex },
    }));
  }
  if (args.granularity === "fiscal_quarter") {
    const out: TargetBudgetTearsheetPeriodOption[] = [];
    for (let fyIndex = 0; fyIndex < fyCount; fyIndex++) {
      const fyYear = CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS[fyIndex]!;
      for (let fqInFy = 0; fqInFy < 4; fqInFy++) {
        const fqIndex = fyIndex * 4 + fqInFy;
        const fqLabel = fqLabels[fqIndex] ?? `FQ${fqInFy + 1}`;
        out.push({
          periodKey: `fq-${fqIndex}`,
          periodLabel: `${fqLabel} ${fyYear}`,
          pick: { kind: "fiscal_quarter", fqIndex },
        });
      }
    }
    return out;
  }
  return monthLabels.map((label, monthIndex) => ({
    periodKey: `m-${monthIndex}`,
    periodLabel: label,
    pick: { kind: "month", monthIndex },
  }));
}

/** Map tearsheet period choice to a forecast column index for the current table layout. */
export function resolveTearsheetPeriodPickToColumnIndex(
  columnMetas: readonly TargetBudgetColumnMeta[],
  pick: TargetBudgetTearsheetPeriodPick,
  fiscalYearStartMonth: number
): number {
  const fallback = columnMetas[0]?.columnIndex ?? 0;

  if (pick.kind === "program_total") {
    const m = columnMetas.find((x) => x.granularity === "program_total");
    return m?.columnIndex ?? fallback;
  }
  if (pick.kind === "fiscal_year") {
    const m = columnMetas.find((x) => x.granularity === "fiscal_year" && x.fyIndex === pick.fyIndex);
    return m?.columnIndex ?? fallback;
  }
  if (pick.kind === "fiscal_quarter") {
    const exact = columnMetas.find((x) => x.granularity === "fiscal_quarter" && x.fqIndex === pick.fqIndex);
    if (exact) return exact.columnIndex;
    const fyIdx = Math.floor(pick.fqIndex / 4);
    const fy = columnMetas.find((x) => x.granularity === "fiscal_year" && x.fyIndex === fyIdx);
    return fy?.columnIndex ?? fallback;
  }
  const exact = columnMetas.find((x) => x.granularity === "month" && x.monthIndex === pick.monthIndex);
  if (exact) return exact.columnIndex;

  const fqIdx = globalMonthIndexToFqIndex(pick.monthIndex, fiscalYearStartMonth);
  const fq = columnMetas.find((x) => x.granularity === "fiscal_quarter" && x.fqIndex === fqIdx);
  if (fq) return fq.columnIndex;

  const fyIdx = Math.floor(pick.monthIndex / 12);
  const fy = columnMetas.find((x) => x.granularity === "fiscal_year" && x.fyIndex === fyIdx);
  return fy?.columnIndex ?? fallback;
}
