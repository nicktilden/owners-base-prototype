import type { ActionPlan, ActionPlanItem, ActionPlanSection } from '@/types/action_plans';

function d(iso: string): Date { return new Date(iso); }

function closedItem(
  id: string, sectionId: string, order: number, title: string,
  assignees: string[], dueDate: string, completedAt: string,
  createdBy: string, createdAt: string, acceptanceCriteria: string | null = null
): ActionPlanItem {
  return {
    id, sectionId, order, title, description: null, acceptanceCriteria,
    status: 'closed', assignees, dueDate: d(dueDate), references: [],
    completedAt: d(completedAt), createdBy, createdAt: d(createdAt), updatedAt: d(completedAt),
  };
}

function openItem(
  id: string, sectionId: string, order: number, title: string,
  assignees: string[], dueDate: string | null,
  createdBy: string, createdAt: string, acceptanceCriteria: string | null = null
): ActionPlanItem {
  return {
    id, sectionId, order, title, description: null, acceptanceCriteria,
    status: 'open', assignees, dueDate: dueDate ? d(dueDate) : null, references: [],
    completedAt: null, createdBy, createdAt: d(createdAt), updatedAt: d(createdAt),
  };
}

function inProgressItem(
  id: string, sectionId: string, order: number, title: string,
  assignees: string[], dueDate: string,
  createdBy: string, createdAt: string, acceptanceCriteria: string | null = null
): ActionPlanItem {
  return {
    id, sectionId, order, title, description: null, acceptanceCriteria,
    status: 'in_progress', assignees, dueDate: d(dueDate), references: [],
    completedAt: null, createdBy, createdAt: d(createdAt), updatedAt: d(createdAt),
  };
}

function delayedItem(
  id: string, sectionId: string, order: number, title: string,
  assignees: string[], dueDate: string,
  createdBy: string, createdAt: string
): ActionPlanItem {
  return {
    id, sectionId, order, title, description: null, acceptanceCriteria: null,
    status: 'delayed', assignees, dueDate: d(dueDate), references: [],
    completedAt: null, createdBy, createdAt: d(createdAt), updatedAt: d(createdAt),
  };
}

function section(
  id: string, planId: string, title: string, order: number,
  items: ActionPlanItem[], createdAt: string
): ActionPlanSection {
  return { id, planId, title, order, items, createdAt: d(createdAt), updatedAt: d(createdAt) };
}

// ── ACTION PLAN 1: Construction Gate Review — 250 West 55th Tower ─────────────
// Stage Gate: Mid-Construction → Commissioning authorization

const ap1Sections: ActionPlanSection[] = (() => {
  const p = 'ap-001';
  const s1 = p + '-s1', s2 = p + '-s2', s3 = p + '-s3', s4 = p + '-s4';
  return [
    section(s1, p, 'Budget & Cost Control', 0, [
      closedItem(s1+'-i1', s1, 0, 'Q1 2026 cost reconciliation reviewed and approved by CFO', ['user-011', 'user-003'], '2026-02-28', '2026-02-25', 'user-009', '2025-09-01', 'Remaining contingency must be at or above 6% of original contract sum.'),
      closedItem(s1+'-i2', s1, 1, 'GC pending change events reviewed — January through March', ['user-011', 'user-008'], '2026-03-31', '2026-03-28', 'user-009', '2025-09-01'),
      inProgressItem(s1+'-i3', s1, 2, 'April 2026 GC pay application reviewed and certified', ['user-011', 'user-003'], '2026-05-15', 'user-009', '2025-09-01', 'Unconditional lien waivers required from all subcontractors over $50K.'),
      delayedItem(s1+'-i4', s1, 3, 'Revised cost-at-completion forecast approved by VP Capital Planning', ['user-004', 'user-003'], '2026-04-30', 'user-009', '2025-09-01'),
    ], '2025-09-01'),
    section(s2, p, 'Schedule Compliance', 1, [
      closedItem(s2+'-i1', s2, 0, 'Demolition NTP and abatement contractor mobilized', ['user-013', 'user-009'], '2024-12-15', '2024-12-14', 'user-009', '2025-09-01'),
      inProgressItem(s2+'-i2', s2, 1, 'MEP rough-in milestone tracked and confirmed on schedule', ['user-010', 'user-011'], '2026-06-30', 'user-009', '2025-09-01', 'MEP rough-in must be substantially complete before lobby finishes begin.'),
      openItem(s2+'-i3', s2, 2, 'FF&E delivery schedule confirmed with supplier and GC', ['user-015', 'user-016'], '2026-07-01', 'user-009', '2025-09-01'),
    ], '2025-09-01'),
    section(s3, p, 'Quality & Compliance', 2, [
      closedItem(s3+'-i1', s3, 0, 'NYC DOB interim inspection passed — lobby structural work', ['user-014'], '2026-01-31', '2026-01-28', 'user-009', '2025-09-01', 'All critical inspection items must be signed off before proceeding.'),
      inProgressItem(s3+'-i2', s3, 1, 'Open RFI log reviewed — all critical RFIs resolved', ['user-014', 'user-009'], '2026-05-31', 'user-009', '2025-09-01'),
      openItem(s3+'-i3', s3, 2, 'Landmark Preservation Commission sign-off on lobby design', ['user-009', 'user-014'], '2026-07-31', 'user-009', '2025-09-01'),
    ], '2025-09-01'),
    section(s4, p, 'Tenant & Occupancy Readiness', 3, [
      openItem(s4+'-i1', s4, 0, 'Tenant notification plan for phased lobby reopening finalized', ['user-005', 'user-016'], '2026-08-01', 'user-006', '2025-09-01'),
      openItem(s4+'-i2', s4, 1, 'Building management system commissioning plan reviewed', ['user-009', 'user-013'], '2026-08-15', 'user-006', '2025-09-01'),
      openItem(s4+'-i3', s4, 2, 'Grand reopening marketing and tenant communication approved', ['user-005', 'user-001'], null, 'user-001', '2025-09-01', 'Reopening announcement must go out 30 days before opening.'),
    ], '2025-09-01'),
  ];
})();

export const ap001: ActionPlan = {
  id: 'ap-001',
  accountId: 'acc-001',
  projectId: 'proj-001',
  number: 1,
  title: 'Construction Gate Review — 250 West 55th Tower Repositioning',
  typeId: 'apt-gate',
  status: 'in_progress',
  private: false,
  locationId: null,
  description: 'Stage gate review for the 250 West 55th Tower repositioning program authorizing transition from active construction into commissioning and lobby reopening.',
  planManager: 'user-009',
  approvers: ['user-002', 'user-001'],
  completedReceivers: ['user-001', 'user-002', 'user-003', 'user-005'],
  sections: ap1Sections,
  createdBy: 'user-009',
  createdAt: d('2025-09-01'),
  updatedAt: d('2026-05-02'),
};

// ── ACTION PLAN 2: Development Authorization Gate — DC K Street Tower ─────────
// Stage Gate: Design → Pre-Construction authorization

const ap2Sections: ActionPlanSection[] = (() => {
  const p = 'ap-002';
  const s1 = p + '-s1', s2 = p + '-s2', s3 = p + '-s3';
  return [
    section(s1, p, 'Entitlements & Approvals', 0, [
      closedItem(s1+'-i1', s1, 0, 'Site acquisition closed and title insurance obtained', ['user-006', 'user-003'], '2025-10-31', '2025-10-29', 'user-006', '2025-06-01', 'Title insurance policy must be in hand before design contract signed.'),
      closedItem(s1+'-i2', s1, 1, 'DC Zoning pre-application meeting completed', ['user-006', 'user-014'], '2026-01-31', '2026-01-30', 'user-006', '2025-06-01'),
      inProgressItem(s1+'-i3', s1, 2, 'PUD application filed with DC Zoning Commission', ['user-014', 'user-009'], '2026-06-30', 'user-006', '2025-06-01', 'PUD filing required before GC procurement begins.'),
    ], '2025-06-01'),
    section(s2, p, 'Design & Budget Validation', 1, [
      closedItem(s2+'-i1', s2, 0, '60% Design Development owner review completed', ['user-009', 'user-014'], '2026-04-30', '2026-04-28', 'user-008', '2025-06-01'),
      inProgressItem(s2+'-i2', s2, 1, 'GC pricing within 8% of approved $185M budget', ['user-003', 'user-008'], '2026-07-31', 'user-008', '2025-06-01', 'Must be within 8% of board-approved capital budget.'),
      openItem(s2+'-i3', s2, 2, 'Anchor tenant LOI executed and credit review complete', ['user-006', 'user-003'], '2026-07-31', 'user-008', '2025-06-01', 'LOI required from 80,000 SF anchor tenant before construction authorization.'),
    ], '2025-06-01'),
    section(s3, p, 'Capital Authorization & Financing', 2, [
      closedItem(s3+'-i1', s3, 0, 'Board capital authorization for Phase 1 approved', ['user-001', 'user-007'], '2025-10-31', '2025-10-28', 'user-006', '2025-06-01', 'Board resolution required for projects over $50M.'),
      inProgressItem(s3+'-i2', s3, 1, 'Construction loan term sheet received from lenders', ['user-003', 'user-004'], '2026-06-30', 'user-006', '2025-06-01'),
      openItem(s3+'-i3', s3, 2, 'Construction loan closing and initial equity draw scheduled', ['user-003', 'user-006'], '2026-09-30', 'user-006', '2025-06-01', 'Loan closing required before GC NTP issuance.'),
    ], '2025-06-01'),
  ];
})();

export const ap002: ActionPlan = {
  id: 'ap-002',
  accountId: 'acc-001',
  projectId: 'proj-007',
  number: 2,
  title: 'Development Authorization Gate — DC K Street Mixed-Use Tower',
  typeId: 'apt-gate',
  status: 'in_progress',
  private: false,
  locationId: null,
  description: 'Development authorization gate review for the Washington DC K Street mixed-use tower project, governing the transition from design into construction procurement and pre-construction.',
  planManager: 'user-008',
  approvers: ['user-001', 'user-007'],
  completedReceivers: ['user-001', 'user-002', 'user-003', 'user-006'],
  sections: ap2Sections,
  createdBy: 'user-006',
  createdAt: d('2025-06-01'),
  updatedAt: d('2026-05-02'),
};

// ── ACTION PLAN 3: Closeout Gate — 345 Hudson Street Repositioning ────────────
// Stage Gate: Post-Construction → Closeout Completed

const ap3Sections: ActionPlanSection[] = (() => {
  const p = 'ap-003';
  const s1 = p + '-s1', s2 = p + '-s2', s3 = p + '-s3';
  return [
    section(s1, p, 'Construction Closeout', 0, [
      closedItem(s1+'-i1', s1, 0, 'All punch list items resolved and signed off by GC and owner', ['user-013', 'user-009'], '2025-10-31', '2025-10-29', 'user-009', '2025-03-01'),
      closedItem(s1+'-i2', s1, 1, 'Final building inspections passed — lobby and amenity levels', ['user-014'], '2025-11-15', '2025-11-14', 'user-009', '2025-03-01'),
      closedItem(s1+'-i3', s1, 2, 'NYC DOB Final Certificate of Occupancy for renovated areas', ['user-009'], '2025-12-15', '2025-12-10', 'user-009', '2025-03-01', 'TCO required before tenant access to renovated lobby.'),
    ], '2025-03-01'),
    section(s2, p, 'Owner Turnover & Documentation', 1, [
      closedItem(s2+'-i1', s2, 0, 'As-built drawings received and uploaded to project documents', ['user-014', 'user-009'], '2025-11-30', '2025-11-28', 'user-009', '2025-03-01'),
      closedItem(s2+'-i2', s2, 1, 'Operations & maintenance manuals for new MEP systems delivered', ['user-016'], '2025-12-15', '2025-12-13', 'user-009', '2025-03-01'),
      closedItem(s2+'-i3', s2, 2, 'Warranty documentation organized and transferred to Facilities', ['user-016', 'user-011'], '2025-12-31', '2025-12-28', 'user-009', '2025-03-01'),
    ], '2025-03-01'),
    section(s3, p, 'Financial Closeout', 2, [
      closedItem(s3+'-i1', s3, 0, 'Final GC pay application processed and retainage released', ['user-003', 'user-011'], '2026-01-31', '2026-01-29', 'user-009', '2025-03-01'),
      closedItem(s3+'-i2', s3, 1, 'Unconditional lien waivers received from all subcontractors', ['user-003'], '2026-02-15', '2026-02-13', 'user-009', '2025-03-01', 'Unconditional final lien waivers required from all subs over $25K.'),
      closedItem(s3+'-i3', s3, 2, 'Final project cost report submitted and approved by CFO', ['user-003', 'user-004'], '2026-02-28', '2026-02-26', 'user-009', '2025-03-01'),
    ], '2025-03-01'),
  ];
})();

export const ap003: ActionPlan = {
  id: 'ap-003',
  accountId: 'acc-001',
  projectId: 'proj-015',
  number: 3,
  title: 'Closeout Gate — 345 Hudson Street Repositioning',
  typeId: 'apt-gate',
  status: 'complete',
  private: false,
  locationId: null,
  description: 'Completed closeout gate review for the 345 Hudson Street lobby and amenity repositioning, covering construction closeout, owner turnover, and financial close.',
  planManager: 'user-009',
  approvers: ['user-001', 'user-002'],
  completedReceivers: ['user-001', 'user-002', 'user-003', 'user-009'],
  sections: ap3Sections,
  createdBy: 'user-009',
  createdAt: d('2025-03-01'),
  updatedAt: d('2026-02-26'),
};

export const actionPlans: ActionPlan[] = [ap001, ap002, ap003];
