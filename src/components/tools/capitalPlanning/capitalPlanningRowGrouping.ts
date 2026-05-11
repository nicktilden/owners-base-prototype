import type { CapitalPlanningSampleRow } from "./capitalPlanningData";
import {
  assignedCapitalPlanningRegion,
  CAPITAL_PLANNING_REGIONS,
  PRIORITY_OPTIONS,
  PROJECT_STATUS_OPTIONS,
} from "./capitalPlanningData";

export type CapitalPlanningRegionGroup = {
  key: string;
  label: string;
  rows: CapitalPlanningSampleRow[];
};

/** Toolbar “Group by” dimension — matches Capital Planning data table spec. */
export type CapitalPlanningGroupBy =
  | "region"
  | "department"
  | "priority"
  | "status"
  | "projectType";

export const CAPITAL_PLANNING_GROUP_BY_OPTIONS: readonly {
  value: CapitalPlanningGroupBy;
  label: string;
}[] = [
  { value: "region", label: "Region" },
  { value: "department", label: "Department" },
  { value: "priority", label: "Priority" },
  { value: "status", label: "Status" },
  { value: "projectType", label: "Project Type" },
] as const;

/** When the select shows placeholder, the grid still groups by region (default). */
export function effectiveCapitalPlanningGroupBy(
  groupBy: CapitalPlanningGroupBy | null | undefined
): CapitalPlanningGroupBy {
  return groupBy ?? "region";
}

function hashRowIdToBucket(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = Math.imul(31, h) + id.charCodeAt(i);
  }
  return Math.abs(h);
}

/** Prototype departments — assigned deterministically from row id. */
export const CAPITAL_PLANNING_DEPARTMENTS = [
  "Facilities",
  "Operations",
  "Engineering",
  "Preconstruction",
  "Capital Projects",
] as const;

/** Prototype project types — assigned deterministically from row id. */
export const CAPITAL_PLANNING_PROJECT_TYPES = [
  "Vertical",
  "Horizontal",
  "Renovation",
  "Campus",
  "Infrastructure",
] as const;

export function assignedCapitalPlanningDepartment(rowId: string): string {
  return CAPITAL_PLANNING_DEPARTMENTS[hashRowIdToBucket(rowId) % CAPITAL_PLANNING_DEPARTMENTS.length]!;
}

export function assignedCapitalPlanningProjectType(rowId: string): string {
  return CAPITAL_PLANNING_PROJECT_TYPES[hashRowIdToBucket(rowId) % CAPITAL_PLANNING_PROJECT_TYPES.length]!;
}

/** Prototype campus labels for the location hierarchy (Target Budget tab). */
export const HIERARCHY_CAMPUS_LABELS = [
  "Main Campus",
  "North Campus",
  "South Campus",
  "East Campus",
  "West Campus",
] as const;

/** Prototype building labels for the location hierarchy (Target Budget tab). */
export const HIERARCHY_BUILDING_LABELS = [
  "Building A",
  "Building B",
  "Building C",
  "Building D",
  "Building E",
  "Building F",
] as const;

/** Deterministically assign a campus label to a row (prototype). */
export function assignedHierarchyCampus(rowId: string): string {
  return HIERARCHY_CAMPUS_LABELS[hashRowIdToBucket(rowId) % HIERARCHY_CAMPUS_LABELS.length]!;
}

/** Deterministically assign a building label to a row (prototype). */
export function assignedHierarchyBuilding(rowId: string): string {
  return HIERARCHY_BUILDING_LABELS[hashRowIdToBucket(rowId) % HIERARCHY_BUILDING_LABELS.length]!;
}

/**
 * Groups visible project rows by {@link assignedCapitalPlanningRegion} (prototype regions).
 * Empty buckets are omitted; order follows {@link CAPITAL_PLANNING_REGIONS}.
 */
export function groupProjectRowsByRegion(rows: readonly CapitalPlanningSampleRow[]): CapitalPlanningRegionGroup[] {
  const buckets = new Map<string, CapitalPlanningSampleRow[]>();
  for (const r of CAPITAL_PLANNING_REGIONS) {
    buckets.set(r, []);
  }
  for (const row of rows) {
    const region = assignedCapitalPlanningRegion(row.id);
    buckets.get(region)!.push(row);
  }
  return CAPITAL_PLANNING_REGIONS.filter((r) => (buckets.get(r) ?? []).length > 0).map((r) => ({
    key: r,
    label: r,
    rows: buckets.get(r) ?? [],
  }));
}

function groupByOrderedField<K extends string>(
  rows: readonly CapitalPlanningSampleRow[],
  orderedKeys: readonly K[],
  getKey: (row: CapitalPlanningSampleRow) => K
): CapitalPlanningRegionGroup[] {
  const buckets = new Map<K, CapitalPlanningSampleRow[]>();
  for (const k of orderedKeys) {
    buckets.set(k, []);
  }
  for (const row of rows) {
    const k = getKey(row);
    if (!buckets.has(k)) {
      buckets.set(k, []);
    }
    buckets.get(k)!.push(row);
  }
  return orderedKeys
    .filter((k) => (buckets.get(k) ?? []).length > 0)
    .map((k) => ({
      key: k,
      label: k,
      rows: buckets.get(k) ?? [],
    }));
}

function groupByAssignedBucket(
  rows: readonly CapitalPlanningSampleRow[],
  orderedLabels: readonly string[],
  assign: (rowId: string) => string
): CapitalPlanningRegionGroup[] {
  const buckets = new Map<string, CapitalPlanningSampleRow[]>();
  for (const label of orderedLabels) {
    buckets.set(label, []);
  }
  for (const row of rows) {
    const label = assign(row.id);
    if (!buckets.has(label)) {
      buckets.set(label, []);
    }
    buckets.get(label)!.push(row);
  }
  return orderedLabels
    .filter((label) => (buckets.get(label) ?? []).length > 0)
    .map((label) => ({
      key: label,
      label,
      rows: buckets.get(label) ?? [],
    }));
}

/**
 * Groups rows for the grid body / totals. {@link effectiveCapitalPlanningGroupBy} applies default region.
 */
export function groupProjectRowsForCapitalPlanning(
  rows: readonly CapitalPlanningSampleRow[],
  groupBy: CapitalPlanningGroupBy | null | undefined
): CapitalPlanningRegionGroup[] {
  const mode = effectiveCapitalPlanningGroupBy(groupBy);
  switch (mode) {
    case "region":
      return groupProjectRowsByRegion(rows);
    case "priority":
      return groupByOrderedField(rows, [...PRIORITY_OPTIONS], (r) => r.priority);
    case "status":
      return groupByOrderedField(rows, [...PROJECT_STATUS_OPTIONS], (r) => r.status);
    case "department":
      return groupByAssignedBucket(rows, [...CAPITAL_PLANNING_DEPARTMENTS], assignedCapitalPlanningDepartment);
    case "projectType":
      return groupByAssignedBucket(rows, [...CAPITAL_PLANNING_PROJECT_TYPES], assignedCapitalPlanningProjectType);
  }
}

/** Short noun phrase for header collapse control (e.g. “program regions”, “departments”). */
export function capitalPlanningGroupByCollapseNoun(mode: CapitalPlanningGroupBy): string {
  const m: Record<CapitalPlanningGroupBy, string> = {
    region: "program regions",
    department: "departments",
    priority: "priorities",
    status: "statuses",
    projectType: "project types",
  };
  return m[mode];
}

/** Title-case label when the collapse-all control is disabled (no rows / no groups). */
export function capitalPlanningGroupByEmptyToolbarLabel(mode: CapitalPlanningGroupBy): string {
  const m: Record<CapitalPlanningGroupBy, string> = {
    region: "Program regions",
    department: "Departments",
    priority: "Priorities",
    status: "Statuses",
    projectType: "Project types",
  };
  return m[mode];
}

// ── New hierarchy grouping utilities (required by CapitalPlanningSmartGrid) ──

export type HierarchyRenderItem =
  | { kind: "aggregate"; depth: number; collapseKey: string; label: string; rows: CapitalPlanningSampleRow[] }
  | { kind: "row"; row: CapitalPlanningSampleRow; leafRailCount: number };

export type RegionCampusBuilding = {
  key: string;
  label: string;
  campuses: {
    key: string;
    label: string;
    buildings: {
      key: string;
      label: string;
      rows: CapitalPlanningSampleRow[];
    }[];
  }[];
};

/** Group rows by region → campus → building (3-level hierarchy for Next/target_budget variants). */
export function groupProjectRowsByRegionCampusBuilding(
  rows: readonly CapitalPlanningSampleRow[]
): RegionCampusBuilding[] {
  const regionMap = new Map<string, Map<string, Map<string, CapitalPlanningSampleRow[]>>>();
  for (const row of rows) {
    const region = assignedCapitalPlanningRegion(row.id);
    const campus = row.id.slice(0, 6); // deterministic campus bucket from id prefix
    const building = row.id.slice(0, 8); // deterministic building bucket
    if (!regionMap.has(region)) regionMap.set(region, new Map());
    const campusMap = regionMap.get(region)!;
    if (!campusMap.has(campus)) campusMap.set(campus, new Map());
    const buildingMap = campusMap.get(campus)!;
    if (!buildingMap.has(building)) buildingMap.set(building, []);
    buildingMap.get(building)!.push(row);
  }
  return CAPITAL_PLANNING_REGIONS.filter((r) => regionMap.has(r)).map((r) => ({
    key: r,
    label: r,
    campuses: Array.from(regionMap.get(r)!.entries()).map(([cKey, buildingMap]) => ({
      key: cKey,
      label: `Campus ${cKey}`,
      buildings: Array.from(buildingMap.entries()).map(([bKey, bRows]) => ({
        key: bKey,
        label: `Building ${bKey}`,
        rows: bRows,
      })),
    })),
  }));
}

/** Flatten a region/campus/building hierarchy tree into a table-renderable list. */
export function flattenLocationHierarchyForTable(
  tree: RegionCampusBuilding[],
  collapsed: Record<string, boolean>
): HierarchyRenderItem[] {
  const result: HierarchyRenderItem[] = [];
  for (const region of tree) {
    const regionKey = `r:${region.key}`;
    const allRows = region.campuses.flatMap((c) => c.buildings.flatMap((b) => b.rows));
    result.push({ kind: "aggregate", depth: 0, collapseKey: regionKey, label: region.label, rows: allRows });
    if (collapsed[regionKey]) continue;
    for (const campus of region.campuses) {
      const campusKey = `c:${region.key}:${campus.key}`;
      const campusRows = campus.buildings.flatMap((b) => b.rows);
      result.push({ kind: "aggregate", depth: 1, collapseKey: campusKey, label: campus.label, rows: campusRows });
      if (collapsed[campusKey]) continue;
      for (const building of campus.buildings) {
        const buildingKey = `b:${region.key}:${campus.key}:${building.key}`;
        result.push({ kind: "aggregate", depth: 2, collapseKey: buildingKey, label: building.label, rows: building.rows });
        if (collapsed[buildingKey]) continue;
        for (const row of building.rows) {
          result.push({ kind: "row", row, leafRailCount: 3 });
        }
      }
    }
  }
  return result;
}

/** Group rows by a single dimension value. */
export function groupProjectRowsBySingleDimension(
  rows: readonly CapitalPlanningSampleRow[],
  dimension: CapitalPlanningGroupBy
): CapitalPlanningRegionGroup[] {
  return groupProjectRowsForCapitalPlanning(rows, dimension);
}

/** Flatten a multi-level dynamic group-by hierarchy into a table-renderable list. */
export function flattenDynamicHierarchyForTable(
  rows: readonly CapitalPlanningSampleRow[],
  dimensions: readonly CapitalPlanningGroupBy[],
  collapsed: Record<string, boolean>
): HierarchyRenderItem[] {
  if (dimensions.length === 0) {
    return rows.map((row) => ({ kind: "row", row, leafRailCount: 0 }));
  }

  function recurse(
    items: readonly CapitalPlanningSampleRow[],
    dims: readonly CapitalPlanningGroupBy[],
    depth: number,
    parentKey: string
  ): HierarchyRenderItem[] {
    if (dims.length === 0) {
      return items.map((row) => ({ kind: "row", row, leafRailCount: depth }));
    }
    const [dim, ...rest] = dims;
    const groups = groupProjectRowsForCapitalPlanning(items, dim!);
    const result: HierarchyRenderItem[] = [];
    for (const group of groups) {
      const collapseKey = parentKey ? `${parentKey}|${dim}:${group.key}` : `${dim}:${group.key}`;
      result.push({ kind: "aggregate", depth, collapseKey, label: group.label, rows: group.rows });
      if (collapsed[collapseKey]) continue;
      result.push(...recurse(group.rows, rest, depth + 1, collapseKey));
    }
    return result;
  }

  return recurse(rows, dimensions, 0, "");
}
