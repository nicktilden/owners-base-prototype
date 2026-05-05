import type { CapitalPlanningSampleRow } from "./capitalPlanningData";
import { CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS } from "./capitalPlanningForecast";
import { groupProjectRowsByRegionCampusBuilding } from "./capitalPlanningRowGrouping";
import {
  evenSplitDollarsAcrossParts,
  targetBudgetForecastOverridePeriodStorageKey,
} from "./targetBudgetForecastColumnMeta";

/**
 * Split integer cents across `n` children so the parts sum exactly to `totalCents`
 * (remainder distributed to the first children — stable, hierarchy-safe).
 */
function splitTotalCentsEven(totalCents: number, n: number): number[] {
  if (n <= 0) return [];
  const base = Math.floor(totalCents / n);
  const rem = totalCents - base * n;
  return Array.from({ length: n }, (_, i) => base + (i < rem ? 1 : 0));
}

function fromCents(cents: number): number {
  return Math.round(cents) / 100;
}

function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Regional annual prototype caps — shuffled onto regions; mix of mid and high tiers for variance demos.
 */
const REGION_TARGET_PRESET_USD_POOL = [
  40_000_000,
  48_000_000,
  58_000_000,
  68_000_000,
  78_000_000,
  92_000_000,
  108_000_000,
  270_000_000,
  285_000_000,
  310_000_000,
] as const;

/**
 * Prototype-only loosen/tighten vs rolled-up forecasts. Lower ⇒ more “target exceeded” cells (still sparse by month).
 */
const TARGET_BUDGET_SEED_ANNUAL_MULTIPLIER = 1.12;

/** Random subset of months per FY carries the annual total — wider band ⇒ more period cells can show variance. */
const SPARSE_MONTH_COUNT_MIN = 6;
const SPARSE_MONTH_COUNT_MAX = 9;

function shuffleUint32InPlace(arr: number[], rng: () => number): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const a = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = a;
  }
}

/**
 * One flat target per **display index** in the location tree (same order as `groupProjectRowsByRegion`).
 * Presets are shuffled and then randomly permuted across indices so “low cap / exceeded” demos are spread
 * across Pacific Northwest, Southeast, etc. instead of always following array order.
 */
function buildRegionIndexToTargetUsd(regionCount: number, seed: number): number[] {
  if (regionCount <= 0) return [];
  const pool = [...REGION_TARGET_PRESET_USD_POOL];
  const rng = mulberry32(seed ^ 0x64726162);
  shuffleUint32InPlace(pool, rng);
  const picked = pool.slice(0, Math.min(regionCount, pool.length));
  while (picked.length < regionCount) {
    picked.push(pool[picked.length % pool.length]!);
  }
  const perm = Array.from({ length: regionCount }, (_, i) => i);
  shuffleUint32InPlace(perm, mulberry32(seed ^ 0x62756467));
  return Array.from({ length: regionCount }, (_, i) => picked[perm[i]!]!);
}

/** Stable seed from which regions are present so caps stay consistent until filters change. */
function hashLocationTreeRegionKeysForTargetSeed(tree: LocationTree): number {
  let h = 0xcbf29ce484222325;
  for (const r of tree) {
    h ^= r.key.length;
    for (let i = 0; i < r.key.length; i++) {
      h = Math.imul(h ^ r.key.charCodeAt(i), 0x100000001b3);
    }
  }
  return h >>> 0;
}

type LocationTree = ReturnType<typeof groupProjectRowsByRegionCampusBuilding>;

/** DFS order must match {@link writeHierarchyTargetsForProgramFiscalYearMonths}. */
function collectHierarchyKeysInWriteOrder(locationTree: LocationTree): string[] {
  const keys: string[] = [];
  locationTree.forEach((region) => {
    keys.push(`r:${region.key}`);
    region.campuses.forEach((campus) => {
      keys.push(`c:${campus.key}`);
      campus.buildings.forEach((b) => {
        keys.push(`b:${b.key}`);
      });
    });
  });
  return keys;
}

/**
 * Deterministic subset: exactly `round(n * fillRatio)` hierarchy keys get targets (Fisher–Yates shuffle
 * seeded per fiscal year so FY 2028 / FY 2029 look sparse but stable across reloads).
 */
function buildIncludedHierarchyKeySet(
  orderedKeys: readonly string[],
  fyYear: number,
  fillRatio: number
): Set<string> {
  const n = orderedKeys.length;
  if (n === 0) return new Set();
  if (fillRatio >= 1) return new Set(orderedKeys);
  if (fillRatio <= 0) return new Set();
  const k = Math.max(0, Math.min(n, Math.round(n * fillRatio)));
  const rng = mulberry32((fyYear * 0x9e3779b1) ^ 0xcbf29ce4);
  const idx = orderedKeys.map((_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const a = idx[i]!;
    idx[i] = idx[j]!;
    idx[j] = a;
  }
  const set = new Set<string>();
  for (let i = 0; i < k; i++) {
    set.add(orderedKeys[idx[i]!]!);
  }
  return set;
}

function includedKeysForFyYear(
  fyYear: number,
  allKeysSet: Set<string>,
  includedFy2028: Set<string>,
  includedFy2029: Set<string>
): Set<string> {
  if (fyYear === 2028) return includedFy2028;
  if (fyYear === 2029) return includedFy2029;
  return allKeysSet;
}

function hashHierarchyKeyForSparseMonths(hierarchyKey: string, fyIndex: number): number {
  let h = fyIndex * 0x9e3779b1;
  for (let i = 0; i < hierarchyKey.length; i++) {
    h = Math.imul(h ^ hierarchyKey.charCodeAt(i), 0x100000001b3);
  }
  return h >>> 0;
}

/** Deterministic subset of calendar months (indices 0–11 within the FY block) that carry this row’s annual total. */
function pickSparseLocalMonthIndices(hierarchyKey: string, fyIndex: number): number[] {
  const rng = mulberry32(hashHierarchyKeyForSparseMonths(hierarchyKey, fyIndex));
  const span = SPARSE_MONTH_COUNT_MAX - SPARSE_MONTH_COUNT_MIN + 1;
  const count = SPARSE_MONTH_COUNT_MIN + Math.floor(rng() * span);
  const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  shuffleUint32InPlace(months, rng);
  return months.slice(0, count).sort((a, b) => a - b);
}

function writeSparseAnnualToMonthKeys(
  out: Record<string, number>,
  hierarchyKey: string,
  fyIndex: number,
  annualUsd: number,
  includedKeys: Set<string>
): void {
  if (!includedKeys.has(hierarchyKey)) return;
  const finite = Number.isFinite(annualUsd) ? Math.max(0, annualUsd) : 0;
  if (finite <= 0) return;
  const localMonths = pickSparseLocalMonthIndices(hierarchyKey, fyIndex);
  if (localMonths.length === 0) return;
  const parts = evenSplitDollarsAcrossParts(finite, localMonths.length);
  localMonths.forEach((lm, i) => {
    const mi = fyIndex * 12 + lm;
    out[targetBudgetForecastOverridePeriodStorageKey(hierarchyKey, `m-${mi}`)] = parts[i]!;
  });
}

/**
 * Same hierarchy math as before: each node’s annual total is scaled by a prototype multiplier and spread
 * across a **pseudo-random subset of months** per FY (unique pattern per `hierarchyKey`) so variance icons
 * scatter across the grid.
 */
function writeHierarchyTargetsForProgramFiscalYearMonths(
  out: Record<string, number>,
  locationTree: LocationTree,
  fyIndex: number,
  includedKeys: Set<string>,
  regionTargetUsdByIndex: readonly number[]
): void {
  locationTree.forEach((region, regionIndex) => {
    const regionUsdRaw = regionTargetUsdByIndex[regionIndex] ?? 270_000_000;
    const regionUsd = regionUsdRaw * TARGET_BUDGET_SEED_ANNUAL_MULTIPLIER;
    const regionCents = Math.round(regionUsd * 100);
    const rKey = `r:${region.key}`;
    writeSparseAnnualToMonthKeys(out, rKey, fyIndex, regionUsd, includedKeys);

    const campuses = region.campuses;
    if (campuses.length === 0) return;

    const campusCentsParts = splitTotalCentsEven(regionCents, campuses.length);
    campuses.forEach((campus, ci) => {
      const campusCents = campusCentsParts[ci]!;
      const campusUsd = fromCents(campusCents);
      const cKey = `c:${campus.key}`;
      writeSparseAnnualToMonthKeys(out, cKey, fyIndex, campusUsd, includedKeys);

      const buildings = campus.buildings;
      if (buildings.length === 0) return;

      const buildingCentsParts = splitTotalCentsEven(campusCents, buildings.length);
      buildings.forEach((b, bi) => {
        const buildingUsd = fromCents(buildingCentsParts[bi]!);
        const bKey = `b:${b.key}`;
        writeSparseAnnualToMonthKeys(out, bKey, fyIndex, buildingUsd, includedKeys);
      });
    });
  });
}

/**
 * Prototype demo data: region annual caps with campus/building amounts even-split from the parent;
 * each FY total is spread across a sparse subset of month columns per row. FY 2030 / FY 2031 omitted.
 * FY 2028 / FY 2029 use a deterministic random subset of hierarchy rows (~75% / ~30%).
 */
export function buildPrototypeTargetBudgetForecastOverrides(
  filteredProjectRows: readonly CapitalPlanningSampleRow[],
  _fiscalYearStartMonth: number,
  _options?: { anchorDate?: Date; forecastOverrides?: Record<string, number> }
): Record<string, number> {
  if (filteredProjectRows.length === 0) return {};

  const locationTree = groupProjectRowsByRegionCampusBuilding(filteredProjectRows);
  const regionTargetUsdByIndex = buildRegionIndexToTargetUsd(
    locationTree.length,
    hashLocationTreeRegionKeysForTargetSeed(locationTree) ^ (filteredProjectRows.length * 0x9e3779b1)
  );
  const orderedKeys = collectHierarchyKeysInWriteOrder(locationTree);
  const allKeysSet = new Set(orderedKeys);
  const includedFy2028 = buildIncludedHierarchyKeySet(orderedKeys, 2028, 0.75);
  const includedFy2029 = buildIncludedHierarchyKeySet(orderedKeys, 2029, 0.3);

  const out: Record<string, number> = {};

  for (let fyIndex = 0; fyIndex < CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.length; fyIndex++) {
    const fyYear = CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS[fyIndex]!;
    if (fyYear === 2030 || fyYear === 2031) continue;
    const included = includedKeysForFyYear(fyYear, allKeysSet, includedFy2028, includedFy2029);
    writeHierarchyTargetsForProgramFiscalYearMonths(out, locationTree, fyIndex, included, regionTargetUsdByIndex);
  }

  return out;
}
