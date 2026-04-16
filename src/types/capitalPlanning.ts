/**
 * CAPITAL PLANNING TYPES
 */

export const PROJECT_STATUS_OPTIONS = [
  'Pre-Construction',
  'Course of Construction',
  'Concept',
  'Bidding',
] as const;

export type ProjectStatus = (typeof PROJECT_STATUS_OPTIONS)[number];

export const PRIORITY_OPTIONS = ['High', 'Medium', 'Low'] as const;
export type ProjectPriority = (typeof PRIORITY_OPTIONS)[number];

export const CURVE_OPTIONS = ['Front-Loaded', 'Back-Loaded', 'Bell', 'Linear', 'Manual'] as const;
export type ProjectCurve = (typeof CURVE_OPTIONS)[number];

export interface CapitalPlanningRow {
  id: string;
  accountId: string;
  projectId: string;
  project: string;
  plannedAmount: number;
  status: ProjectStatus;
  priority: ProjectPriority;
  originalBudget: number | null;
  revisedBudget: number | null;
  jobToDateCosts: number | null;
  startDate: string;
  endDate: string;
  curve: ProjectCurve;
  remaining: number;
}
