/**
 * PROJECT ROW ADAPTER
 * Converts the active seed dataset (Project[], BudgetLineItem[], User[]) into
 * ProjectRow[] — the shape consumed by the portfolio grid, hub filters, and
 * other components that previously read from the static sampleProjectRows.
 *
 * Financial columns are aggregated from budget line items per project.
 * If a project has no budget lines (e.g. inactive / cancelled), we fall back
 * to estimatedBudget for all cost columns.
 */

import type { Project } from '@/types/project';
import type { BudgetLineItem } from '@/types/budget';
import type { User } from '@/types/user';
import type { ProjectRow, ProjectStage, ProjectRegion } from '@/data/projects';

// ─── Stage name mapping: seed machine-names → display names ──────────────────

const STAGE_SEED_TO_DISPLAY: Record<string, ProjectStage> = {
  conceptual:             'Conceptual',
  feasibility:            'Feasibility',
  final_design:           'Final design',
  permitting:             'Permitting',
  bidding:                'Bidding',
  'Pre-Construction':     'Pre-Construction',
  course_of_construction: 'Course of Construction',
  'Post-Construction':    'Post-Construction',
  handover:               'Handover',
  closeout:               'Closeout',
  maintenance:            'Maintenance',
};

// ─── Region mapping: seed ProjectRegion → display ProjectRegion ───────────────
// Seed regions: 'Northeast' | 'Midwest' | 'South' | 'West' | 'Southwest'
// Display regions used in portfolio grid (from PROJECT_REGIONS):
//   "Mid-Atlantic" | "Midwest" | "Southwest" | "Southeast" | "Northeast" | "West" | "International"

const REGION_SEED_TO_DISPLAY: Record<string, ProjectRegion> = {
  Northeast:  'Northeast',
  Midwest:    'Midwest',
  South:      'Southeast',
  West:       'West',
  Southwest:  'Southwest',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractNumericId(seedId: string): number {
  // 'proj-001' → 1, 'proj-012' → 12
  const m = seedId.match(/(\d+)$/);
  return m ? parseInt(m[1], 10) : 0;
}

function formatLocation(p: Project): string {
  return `${p.city}, ${p.state} ${p.zip}`;
}

/** Aggregate budget line items for a single project. */
interface ProjectBudgetAgg {
  originalBudget: number;
  jobToDateCost: number;
  forecastToComplete: number;
  estimatedCostAtCompletion: number;
}

function aggregateBudget(
  projectId: string,
  lineItems: BudgetLineItem[],
  fallback: number,
): ProjectBudgetAgg {
  const items = lineItems.filter((b) => b.projectId === projectId);
  if (items.length === 0) {
    return {
      originalBudget: fallback,
      jobToDateCost: 0,
      forecastToComplete: fallback,
      estimatedCostAtCompletion: fallback,
    };
  }

  let originalBudget = 0;
  let jobToDateCost = 0;
  let forecastToComplete = 0;
  let estimatedCostAtCompletion = 0;

  for (const b of items) {
    const revisedBudget = b.originalBudgetAmount + b.approvedCOs;
    const projectedBudget = revisedBudget + b.budgetChanges;
    const projectedCosts = b.committedCosts + b.directCosts + b.pendingCostChanges;
    const jtd = b.directCosts + b.subcontractorInvoices;
    const ftc = Math.max(0, projectedBudget - projectedCosts);
    const ecac = projectedCosts + ftc;

    originalBudget += b.originalBudgetAmount;
    jobToDateCost += jtd;
    forecastToComplete += ftc;
    estimatedCostAtCompletion += ecac;
  }

  return { originalBudget, jobToDateCost, forecastToComplete, estimatedCostAtCompletion };
}

/** Pick a project manager name from the users list. Prefers users with PM-like roles. */
const PM_ROLES = ['Project Manager', 'VP of Construction', 'Director of Construction', 'Owner'];
function assignProjectManager(index: number, users: User[]): string {
  const pms = users.filter((u) => PM_ROLES.some((r) => u.role?.includes(r)));
  const pool = pms.length > 0 ? pms : users;
  const u = pool[index % pool.length];
  return u ? `${u.firstName} ${u.lastName}` : 'Unassigned';
}

/** Convert a Project's priority to the priorities string used in ProjectRow. */
function derivePriorities(p: Project): string {
  if (p.priority === 'high') return 'Schedule, Budget';
  if (p.priority === 'medium') return 'Quality, Schedule';
  return 'Budget';
}

// ─── Main adapter ─────────────────────────────────────────────────────────────

export function buildProjectRows(
  projects: Project[],
  budgetLineItems: BudgetLineItem[],
  users: User[],
): ProjectRow[] {
  return projects.map((p, i) => {
    const numericId = extractNumericId(p.id);
    const location = formatLocation(p);
    const budget = aggregateBudget(p.id, budgetLineItems, p.estimatedBudget);
    const stage = STAGE_SEED_TO_DISPLAY[p.stage] ?? ('Course of Construction' as ProjectStage);
    const region = (REGION_SEED_TO_DISPLAY[p.region] ?? 'Midwest') as ProjectRegion;

    return {
      id: numericId,
      name: p.name,
      number: p.number,
      favorite: p.favorite,
      streetAddress: p.address,
      location,
      city: p.city,
      state: p.state,
      stage,
      startDate: p.startDate.toISOString().split('T')[0],
      endDate: p.endDate.toISOString().split('T')[0],
      program: p.program ?? '',
      region,
      projectManager: assignProjectManager(i, users),
      estimatedCost: p.estimatedBudget,
      originalBudget: budget.originalBudget,
      jobToDateCost: budget.jobToDateCost,
      forecastToComplete: budget.forecastToComplete,
      estimatedCostAtCompletion: budget.estimatedCostAtCompletion,
      priorities: derivePriorities(p),
      priority: p.priority,
      latitude: p.latitude,
      longitude: p.longitude,
    };
  });
}
