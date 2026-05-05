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

/** One grouping tier (region, department, …) — used for flat toolbar grouping and multi-level hierarchy steps. */
export function groupProjectRowsBySingleDimension(
  rows: readonly CapitalPlanningSampleRow[],
  dim: CapitalPlanningGroupBy
): CapitalPlanningRegionGroup[] {
  switch (dim) {
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

/**
 * Groups rows for the grid body / totals. {@link effectiveCapitalPlanningGroupBy} applies default region.
 */
export function groupProjectRowsForCapitalPlanning(
  rows: readonly CapitalPlanningSampleRow[],
  groupBy: CapitalPlanningGroupBy | null | undefined
): CapitalPlanningRegionGroup[] {
  const mode = effectiveCapitalPlanningGroupBy(groupBy);
  return groupProjectRowsBySingleDimension(rows, mode);
}

export type DynamicHierarchyFlattenItem =
  | {
      kind: "aggregate";
      depth: number;
      collapseKey: string;
      label: string;
      rows: readonly CapitalPlanningSampleRow[];
    }
  | {
      kind: "project";
      row: CapitalPlanningSampleRow;
      leafRailCount: number;
    };

/** Nested groups in toolbar order: first dimension = outermost, last = innermost before project rows. */
export function flattenDynamicHierarchyForTable(
  rows: readonly CapitalPlanningSampleRow[],
  dimensions: readonly CapitalPlanningGroupBy[],
  collapsed: Record<string, boolean>
): DynamicHierarchyFlattenItem[] {
  if (dimensions.length === 0) {
    return rows.map((row) => ({ kind: "project", row, leafRailCount: 0 }));
  }
  const out: DynamicHierarchyFlattenItem[] = [];

  function recurse(subset: readonly CapitalPlanningSampleRow[], level: number, pathKey: string): void {
    if (level >= dimensions.length) {
      for (const row of subset) {
        out.push({ kind: "project", row, leafRailCount: dimensions.length });
      }
      return;
    }
    const dim = dimensions[level]!;
    const groups = groupProjectRowsBySingleDimension(subset, dim);
    for (const g of groups) {
      const collapseKey = pathKey ? `${pathKey}|${dim}:${g.key}` : `${dim}:${g.key}`;
      const expanded = !collapsed[collapseKey];
      out.push({
        kind: "aggregate",
        depth: level,
        collapseKey,
        label: g.label,
        rows: g.rows,
      });
      if (!expanded) continue;
      recurse(g.rows, level + 1, collapseKey);
    }
  }

  recurse(rows, 0, "");
  return out;
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

/** Campus labels used by {@link groupProjectRowsByRegionCampusBuilding} and Target Budget filters (2nd tier under each region). */
export const HIERARCHY_CAMPUS_LABELS = ["North Campus", "South Campus", "Central"] as const;
/** Building labels used by {@link groupProjectRowsByRegionCampusBuilding} and Target Budget filters. */
export const HIERARCHY_BUILDING_LABELS = ["Building A", "Building B", "Building C", "Tower 1"] as const;

export function assignedHierarchyCampus(rowId: string): string {
  return HIERARCHY_CAMPUS_LABELS[hashRowIdToBucket(rowId) % HIERARCHY_CAMPUS_LABELS.length]!;
}

export function assignedHierarchyBuilding(rowId: string): string {
  return HIERARCHY_BUILDING_LABELS[hashRowIdToBucket(`${rowId}|b`) % HIERARCHY_BUILDING_LABELS.length]!;
}

export type LocationHierarchyRegionNode = {
  key: string;
  label: string;
  campuses: LocationHierarchyCampusNode[];
};

export type LocationHierarchyCampusNode = {
  key: string;
  label: string;
  buildings: LocationHierarchyBuildingNode[];
};

export type LocationHierarchyBuildingNode = {
  key: string;
  label: string;
  rows: CapitalPlanningSampleRow[];
};

/**
 * Next-route program table: Region → Campus → Building for collapsible hierarchy + indent rails.
 */
export function groupProjectRowsByRegionCampusBuilding(
  rows: readonly CapitalPlanningSampleRow[]
): LocationHierarchyRegionNode[] {
  const regionGroups = groupProjectRowsByRegion(rows);
  return regionGroups.map((rg) => {
    const campusMap = new Map<string, CapitalPlanningSampleRow[]>();
    for (const row of rg.rows) {
      const c = assignedHierarchyCampus(row.id);
      if (!campusMap.has(c)) campusMap.set(c, []);
      campusMap.get(c)!.push(row);
    }
    const campuses: LocationHierarchyCampusNode[] = [...campusMap.entries()].map(([campusLabel, campusRows]) => {
      const buildingMap = new Map<string, CapitalPlanningSampleRow[]>();
      for (const row of campusRows) {
        const b = assignedHierarchyBuilding(row.id);
        if (!buildingMap.has(b)) buildingMap.set(b, []);
        buildingMap.get(b)!.push(row);
      }
      const buildings: LocationHierarchyBuildingNode[] = [...buildingMap.entries()].map(([buildingLabel, br]) => ({
        key: `${rg.key}|${campusLabel}|${buildingLabel}`,
        label: buildingLabel,
        rows: br,
      }));
      return {
        key: `${rg.key}|${campusLabel}`,
        label: campusLabel,
        buildings,
      };
    });
    return {
      key: rg.key,
      label: rg.label,
      campuses,
    };
  });
}

export type LocationHierarchyFlattenItem =
  | {
      kind: "aggregate";
      depth: 0 | 1 | 2;
      collapseKey: string;
      label: string;
      rows: readonly CapitalPlanningSampleRow[];
    }
  | {
      kind: "project";
      row: CapitalPlanningSampleRow;
      leafRailCount: number;
    };

export function flattenLocationHierarchyForTable(
  tree: readonly LocationHierarchyRegionNode[] | null,
  collapsed: Record<string, boolean>
): LocationHierarchyFlattenItem[] {
  if (!tree?.length) return [];
  const out: LocationHierarchyFlattenItem[] = [];
  for (const region of tree) {
    const rKey = `r:${region.key}`;
    const rExpanded = !collapsed[rKey];
    const regionRows = region.campuses.flatMap((c) => c.buildings.flatMap((b) => b.rows));
    out.push({
      kind: "aggregate",
      depth: 0,
      collapseKey: rKey,
      label: region.label,
      rows: regionRows,
    });
    if (!rExpanded) continue;
    for (const campus of region.campuses) {
      const cKey = `c:${campus.key}`;
      const cExpanded = !collapsed[cKey];
      const campusRows = campus.buildings.flatMap((b) => b.rows);
      out.push({
        kind: "aggregate",
        depth: 1,
        collapseKey: cKey,
        label: campus.label,
        rows: campusRows,
      });
      if (!cExpanded) continue;
      for (const building of campus.buildings) {
        const bKey = `b:${building.key}`;
        const bExpanded = !collapsed[bKey];
        out.push({
          kind: "aggregate",
          depth: 2,
          collapseKey: bKey,
          label: building.label,
          rows: building.rows,
        });
        if (!bExpanded) continue;
        for (const row of building.rows) {
          out.push({ kind: "project", row, leafRailCount: 3 });
        }
      }
    }
  }
  return out;
}

export type LocationHierarchyAggregateFlattenItem = Extract<LocationHierarchyFlattenItem, { kind: "aggregate" }>;

/** Region → Campus → Building tiers only (no project leaf rows), for Target Budget and similar rollups. */
export function flattenLocationHierarchyAggregatesOnly(
  tree: readonly LocationHierarchyRegionNode[] | null,
  collapsed: Record<string, boolean>
): LocationHierarchyAggregateFlattenItem[] {
  if (!tree?.length) return [];
  const out: LocationHierarchyAggregateFlattenItem[] = [];
  for (const region of tree) {
    const rKey = `r:${region.key}`;
    const rExpanded = !collapsed[rKey];
    const regionRows = region.campuses.flatMap((c) => c.buildings.flatMap((b) => b.rows));
    out.push({
      kind: "aggregate",
      depth: 0,
      collapseKey: rKey,
      label: region.label,
      rows: regionRows,
    });
    if (!rExpanded) continue;
    for (const campus of region.campuses) {
      const cKey = `c:${campus.key}`;
      const cExpanded = !collapsed[cKey];
      const campusRows = campus.buildings.flatMap((b) => b.rows);
      out.push({
        kind: "aggregate",
        depth: 1,
        collapseKey: cKey,
        label: campus.label,
        rows: campusRows,
      });
      if (!cExpanded) continue;
      for (const building of campus.buildings) {
        const bKey = `b:${building.key}`;
        const bExpanded = !collapsed[bKey];
        out.push({
          kind: "aggregate",
          depth: 2,
          collapseKey: bKey,
          label: building.label,
          rows: building.rows,
        });
        if (!bExpanded) continue;
      }
    }
  }
  return out;
}
