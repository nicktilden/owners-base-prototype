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
