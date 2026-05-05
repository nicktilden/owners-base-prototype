import type { LocationHierarchyRegionNode } from "./capitalPlanningRowGrouping";

/** Flat rows for {@link TieredSelect} — matches `r:` / `c:` / `b:` collapse keys on aggregate rows. */
export type TargetBudgetProjectGroupTierOption = {
  id: string;
  groupId: string | null;
  nextGroupId?: string | null;
  label: string;
};

/**
 * Build tiered-select options from the same Region → Campus → Building tree as the Target Budget table.
 */
export function buildProjectGroupTierOptionsFromLocationTree(
  tree: readonly LocationHierarchyRegionNode[]
): TargetBudgetProjectGroupTierOption[] {
  const out: TargetBudgetProjectGroupTierOption[] = [];
  for (const region of tree) {
    const campusGroupId = `tier-g:${region.key}:campuses`;
    out.push({
      id: `r:${region.key}`,
      groupId: null,
      nextGroupId: campusGroupId,
      label: region.label,
    });
    for (const campus of region.campuses) {
      const buildingGroupId = `tier-g:${campus.key}:buildings`;
      out.push({
        id: `c:${campus.key}`,
        groupId: campusGroupId,
        nextGroupId: buildingGroupId,
        label: campus.label,
      });
      for (const building of campus.buildings) {
        out.push({
          id: `b:${building.key}`,
          groupId: buildingGroupId,
          label: building.label,
        });
      }
    }
  }
  return out;
}

/**
 * Path of tier objects for the current {@link TargetBudgetProjectGroupTierOption} list (for `TieredSelect` `value`).
 */
export function tierValuePathForCollapseKey(
  collapseKey: string,
  flat: readonly TargetBudgetProjectGroupTierOption[]
): TargetBudgetProjectGroupTierOption[] {
  const byId = new Map(flat.map((r) => [r.id, r]));
  const selected = byId.get(collapseKey);
  if (!selected) return [];
  const path: TargetBudgetProjectGroupTierOption[] = [];
  let cur: TargetBudgetProjectGroupTierOption | undefined = selected;
  while (cur) {
    path.unshift(cur);
    const g: string | null | undefined = cur.groupId;
    if (g == null || g === undefined) break;
    const parent: TargetBudgetProjectGroupTierOption | undefined = flat.find((r) => r.nextGroupId === g);
    cur = parent;
  }
  return path;
}
