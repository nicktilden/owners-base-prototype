import type { LocationHierarchyRegionNode } from "./capitalPlanningRowGrouping";
import {
  readTargetBudgetOverrideForCell,
  type TargetBudgetColumnMeta,
} from "./targetBudgetForecastColumnMeta";

/**
 * Parent collapse key for Target Budget hierarchy (`r:` → `c:` → `b:`), or null at region root.
 * Keys match {@link groupProjectRowsByRegionCampusBuilding} (`c:${campus.key}`, `b:${building.key}`).
 */
export function getParentTargetBudgetCollapseKey(collapseKey: string): string | null {
  if (collapseKey.startsWith("r:")) return null;
  if (collapseKey.startsWith("c:")) {
    const rest = collapseKey.slice(2);
    const pipe = rest.indexOf("|");
    if (pipe <= 0) return null;
    const regionKeyPart = rest.slice(0, pipe);
    return `r:${regionKeyPart}`;
  }
  if (collapseKey.startsWith("b:")) {
    const rest = collapseKey.slice(2);
    const parts = rest.split("|");
    if (parts.length < 3) return null;
    const regionKeyPart = parts[0]!;
    const campusLabel = parts[1]!;
    return `c:${regionKeyPart}|${campusLabel}`;
  }
  return null;
}

/**
 * Immediate parents from the current row up to region (closest first).
 * Building → campus then region; campus → region only.
 */
export function getAncestorTargetBudgetCollapseKeysInOrder(collapseKey: string): string[] {
  const ordered: string[] = [];
  if (collapseKey.startsWith("b:")) {
    const campus = getParentTargetBudgetCollapseKey(collapseKey);
    if (campus) {
      ordered.push(campus);
      const region = getParentTargetBudgetCollapseKey(campus);
      if (region) ordered.push(region);
    }
  } else if (collapseKey.startsWith("c:")) {
    const region = getParentTargetBudgetCollapseKey(collapseKey);
    if (region) ordered.push(region);
  }
  return ordered;
}

/** Every campus and building tier key under a region (not the region row itself). */
export function listDescendantTierBudgetKeysUnderRegion(region: LocationHierarchyRegionNode): string[] {
  const keys: string[] = [];
  for (const campus of region.campuses) {
    keys.push(`c:${campus.key}`);
    for (const building of campus.buildings) {
      keys.push(`b:${building.key}`);
    }
  }
  return keys;
}

/** Other campuses under the same region, or other buildings under the same campus (excludes `collapseKey`). */
export function listSiblingTargetBudgetCollapseKeys(
  tree: readonly LocationHierarchyRegionNode[],
  collapseKey: string
): string[] {
  const parentKey = getParentTargetBudgetCollapseKey(collapseKey);
  if (!parentKey) return [];

  if (parentKey.startsWith("r:")) {
    const regionKey = parentKey.slice(2);
    const region = tree.find((r) => r.key === regionKey);
    if (!region) return [];
    return region.campuses.map((c) => `c:${c.key}`).filter((k) => k !== collapseKey);
  }

  if (parentKey.startsWith("c:")) {
    const campusKey = parentKey.slice(2);
    for (const region of tree) {
      const campus = region.campuses.find((c) => c.key === campusKey);
      if (campus) {
        return campus.buildings.map((b) => `b:${b.key}`).filter((k) => k !== collapseKey);
      }
    }
  }

  return [];
}

export type ParentBudgetAvailability = {
  /** Budget tier that sets the cap (closest ancestor with a positive amount — campus or region). */
  parentCollapseKey: string;
  /** Total target saved on that tier for this period. */
  parentTotal: number;
  /** Remaining amount this row may use for the same period. */
  availableFromParent: number;
};

/**
 * Caps campus/building rows to the nearest ancestor with a positive target for the same period:
 * - If **campus** has a budget, only sibling campuses (for campus rows) or sibling buildings (for building rows) apply.
 * - If campus has **no** budget but **region** does (e.g. $12M at region, adding a building), the region pool applies:
 *   available = region total minus all other campus/building amounts under that region (excluding this row).
 */
export function computeAvailableBudgetFromParent(args: {
  locationHierarchyTree: readonly LocationHierarchyRegionNode[];
  projectGroupCollapseKey: string;
  columnMeta: TargetBudgetColumnMeta | undefined;
  columnIndex: number;
  overrides: Record<string, number>;
  fiscalYearStartMonth: number;
}): ParentBudgetAvailability | null {
  if (args.projectGroupCollapseKey.startsWith("r:")) return null;

  const ancestors = getAncestorTargetBudgetCollapseKeysInOrder(args.projectGroupCollapseKey);

  let effectiveParentKey: string | null = null;
  let effectiveParentTotal = 0;
  for (const ak of ancestors) {
    const v = readTargetBudgetOverrideForCell(
      [ak],
      args.columnMeta,
      args.columnIndex,
      args.overrides,
      args.fiscalYearStartMonth
    );
    if (v > 0) {
      effectiveParentKey = ak;
      effectiveParentTotal = v;
      break;
    }
  }
  if (!effectiveParentKey || !(effectiveParentTotal > 0)) return null;

  let availableFromParent: number;

  if (effectiveParentKey.startsWith("r:")) {
    const regionKey = effectiveParentKey.slice(2);
    const region = args.locationHierarchyTree.find((r) => r.key === regionKey);
    if (!region) return null;
    let usedByOthers = 0;
    for (const k of listDescendantTierBudgetKeysUnderRegion(region)) {
      if (k === args.projectGroupCollapseKey) continue;
      usedByOthers += readTargetBudgetOverrideForCell(
        [k],
        args.columnMeta,
        args.columnIndex,
        args.overrides,
        args.fiscalYearStartMonth
      );
    }
    availableFromParent = Math.max(0, effectiveParentTotal - usedByOthers);
  } else {
    const siblings = listSiblingTargetBudgetCollapseKeys(
      args.locationHierarchyTree,
      args.projectGroupCollapseKey
    );
    let usedBySiblings = 0;
    for (const sk of siblings) {
      usedBySiblings += readTargetBudgetOverrideForCell(
        [sk],
        args.columnMeta,
        args.columnIndex,
        args.overrides,
        args.fiscalYearStartMonth
      );
    }
    availableFromParent = Math.max(0, effectiveParentTotal - usedBySiblings);
  }

  return {
    parentCollapseKey: effectiveParentKey,
    parentTotal: effectiveParentTotal,
    availableFromParent,
  };
}
