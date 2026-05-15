import type { ActionPlan, ActionPlanItem, ActionPlanSection } from '@/types/action_plans';

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ── ACTION PLAN 1: Construction Gate Review — Grand Rapids Supercenter ─────────
// Stage Gate: Course of Construction → Store Opening readiness

const ap1Sections: ActionPlanSection[] = (() => {
  const p = 'ap-001';
  const s1 = p + '-s1', s2 = p + '-s2', s3 = p + '-s3', s4 = p + '-s4';
  return [
    section(s1, p, 'Budget & Cost Control', 0, [
      closedItem(s1+'-i1', s1, 0, 'Owner contingency review — Q1 2026 budget reconciliation', ['user-003', 'user-004'], '2026-02-28', '2026-02-26', 'user-003', '2025-10-01', 'Remaining contingency ≥ 4% of contract sum.'),
      closedItem(s1+'-i2', s1, 1, 'Pending change events dispositioned — October thru January', ['user-011', 'user-008'], '2026-02-15', '2026-02-14', 'user-003', '2025-10-01'),
      inProgressItem(s1+'-i3', s1, 2, 'April 2026 GC pay application reviewed and approved', ['user-011', 'user-003'], '2026-05-15', 'user-003', '2025-10-01', 'Pay application must include unconditional lien waivers from all subs.'),
      delayedItem(s1+'-i4', s1, 3, 'Revised cost-at-completion forecast reviewed by CFO', ['user-003', 'user-001'], '2026-04-30', 'user-003', '2025-10-01'),
    ], '2025-10-01'),
    section(s2, p, 'Schedule Compliance', 1, [
      closedItem(s2+'-i1', s2, 0, 'Steel erection NTP and site mobilization confirmed', ['user-013', 'user-009'], '2025-03-15', '2025-03-14', 'user-009', '2025-10-01'),
      inProgressItem(s2+'-i2', s2, 1, 'Building envelope dry-in milestone tracked and confirmed on schedule', ['user-010', 'user-011'], '2026-06-30', 'user-009', '2025-10-01', 'Building must be enclosed by December 31, 2025 to meet store opening schedule.'),
      openItem(s2+'-i3', s2, 2, 'MEP rough-in 90% complete verified by field walk', ['user-015', 'user-012'], '2026-07-15', 'user-009', '2025-10-01'),
    ], '2025-10-01'),
    section(s3, p, 'Quality & Inspections', 2, [
      closedItem(s3+'-i1', s3, 0, 'Third-party structural steel inspection completed — no critical deficiencies', ['user-014'], '2026-01-31', '2026-01-30', 'user-009', '2025-10-01', 'All critical weld deficiencies must be repaired before proceeding.'),
      inProgressItem(s3+'-i2', s3, 1, 'Open RFI log reviewed and all priority-1 RFIs resolved', ['user-014', 'user-009'], '2026-05-31', 'user-009', '2025-10-01'),
      openItem(s3+'-i3', s3, 2, 'Pre-opening fire marshal walkthrough scheduled', ['user-008', 'user-011'], '2026-08-31', 'user-009', '2025-10-01'),
    ], '2025-10-01'),
    section(s4, p, 'Store Opening Readiness', 3, [
      openItem(s4+'-i1', s4, 0, 'Fixture merchandising plan finalized with store operations', ['user-016', 'user-005'], '2026-08-01', 'user-006', '2025-10-01'),
      openItem(s4+'-i2', s4, 1, 'Store manager and department team hired and onboarded', ['user-016', 'user-005'], '2026-08-15', 'user-006', '2025-10-01'),
      openItem(s4+'-i3', s4, 2, 'Grand opening marketing campaign approved and scheduled', ['user-005', 'user-001'], null, 'user-001', '2025-10-01', 'Grand opening must be announced 30 days prior to opening day.'),
    ], '2025-10-01'),
  ];
})();

export const ap001: ActionPlan = {
  id: 'ap-001',
  accountId: 'acc-001',
  projectId: 'proj-001',
  number: 1,
  title: 'Construction Gate Review — Grand Rapids Supercenter Rebuild',
  typeId: 'apt-gate',
  status: 'in_progress',
  private: false,
  locationId: null,
  description: 'Stage gate review for the Grand Rapids Supercenter rebuild covering cost, schedule, quality, and store opening readiness before transitioning to commissioning and grand opening.',
  planManager: 'user-009',
  approvers: ['user-002', 'user-001'],
  completedReceivers: ['user-001', 'user-002', 'user-003'],
  sections: ap1Sections,
  createdBy: 'user-009',
  createdAt: d('2025-10-01'),
  updatedAt: d('2026-05-02'),
};

// ── ACTION PLAN 2: New Store Development Gate — Indianapolis Supercenter ────────
// Stage Gate: Bidding → Pre-Construction authorization

const ap2Sections: ActionPlanSection[] = (() => {
  const p = 'ap-002';
  const s1 = p + '-s1', s2 = p + '-s2', s3 = p + '-s3';
  return [
    section(s1, p, 'Site Control & Entitlements', 0, [
      closedItem(s1+'-i1', s1, 0, 'Site purchase agreement executed', ['user-006', 'user-003'], '2025-08-31', '2025-08-30', 'user-006', '2025-06-01', 'PSA executed with due diligence period of 90 days.'),
      closedItem(s1+'-i2', s1, 1, 'Zoning and variance approval obtained from Indianapolis BZA', ['user-006', 'user-014'], '2026-02-28', '2026-03-10', 'user-006', '2025-06-01'),
      inProgressItem(s1+'-i3', s1, 2, 'Construction permits issued for grading and foundations', ['user-014', 'user-011'], '2026-06-30', 'user-006', '2025-06-01', 'Permits required before GC site mobilization.'),
    ], '2025-06-01'),
    section(s2, p, 'Design & Budget Confirmation', 1, [
      closedItem(s2+'-i1', s2, 0, '60% Design Development package owner review completed', ['user-009', 'user-014'], '2025-12-31', '2025-12-28', 'user-008', '2025-06-01'),
      closedItem(s2+'-i2', s2, 1, 'GMP or bid budget within ±5% of approved budget', ['user-003', 'user-008'], '2026-03-31', '2026-04-15', 'user-008', '2025-06-01', 'Must be within 5% of $45M approved capital budget.'),
      inProgressItem(s2+'-i3', s2, 2, 'GC contract negotiated and executed', ['user-009', 'user-006'], '2026-06-15', 'user-008', '2025-06-01', 'Contract must include GMP, schedule, and liquidated damages clause.'),
    ], '2025-06-01'),
    section(s3, p, 'Capital Approval & Financing', 2, [
      closedItem(s3+'-i1', s3, 0, 'Board capital appropriation request approved', ['user-001', 'user-007'], '2025-09-30', '2025-09-28', 'user-006', '2025-06-01', 'Requires Board resolution for projects over $20M.'),
      inProgressItem(s3+'-i2', s3, 1, 'Construction loan term sheet received and accepted', ['user-003', 'user-004'], '2026-05-31', 'user-006', '2025-06-01'),
      openItem(s3+'-i3', s3, 2, 'Construction loan closing and initial draw scheduled', ['user-003', 'user-006'], '2026-07-15', 'user-006', '2025-06-01', 'Loan closing required before GC NTP issuance.'),
    ], '2025-06-01'),
  ];
})();

export const ap002: ActionPlan = {
  id: 'ap-002',
  accountId: 'acc-001',
  projectId: 'proj-004',
  number: 2,
  title: 'New Store Development Gate — Indianapolis Supercenter',
  typeId: 'apt-gate',
  status: 'in_progress',
  private: false,
  locationId: null,
  description: 'Development gate review for the Indianapolis Supercenter new build authorizing transition from bidding into pre-construction and construction start.',
  planManager: 'user-008',
  approvers: ['user-001', 'user-007'],
  completedReceivers: ['user-001', 'user-002', 'user-003', 'user-006'],
  sections: ap2Sections,
  createdBy: 'user-006',
  createdAt: d('2025-06-01'),
  updatedAt: d('2026-05-02'),
};

// ── ACTION PLAN 3: Closeout Gate — Kalamazoo Store Refresh ─────────────────────
// Stage Gate: Post-Construction → Closeout Completed

const ap3Sections: ActionPlanSection[] = (() => {
  const p = 'ap-003';
  const s1 = p + '-s1', s2 = p + '-s2', s3 = p + '-s3';
  return [
    section(s1, p, 'Construction Closeout', 0, [
      closedItem(s1+'-i1', s1, 0, 'All punch list items resolved and signed off by GC and owner', ['user-013', 'user-009'], '2024-02-15', '2024-02-14', 'user-009', '2023-11-01'),
      closedItem(s1+'-i2', s1, 1, 'Final building inspections passed (MEP and fire suppression)', ['user-013'], '2024-02-28', '2024-02-27', 'user-009', '2023-11-01'),
      closedItem(s1+'-i3', s1, 2, 'Certificate of Occupancy issued for renovated store areas', ['user-008'], '2024-03-15', '2024-03-12', 'user-009', '2023-11-01', 'CO required for all renovated areas before reopening.'),
    ], '2023-11-01'),
    section(s2, p, 'Owner Turnover & Documentation', 1, [
      closedItem(s2+'-i1', s2, 0, 'As-built drawings received from GC and uploaded to project docs', ['user-014', 'user-009'], '2024-03-31', '2024-03-28', 'user-009', '2023-11-01'),
      closedItem(s2+'-i2', s2, 1, 'Operations & maintenance manuals for new equipment delivered', ['user-016'], '2024-04-15', '2024-04-14', 'user-009', '2023-11-01'),
      closedItem(s2+'-i3', s2, 2, 'Warranty documentation organized and transferred to Facilities team', ['user-016', 'user-011'], '2024-04-30', '2024-04-29', 'user-009', '2023-11-01'),
    ], '2023-11-01'),
    section(s3, p, 'Financial Closeout', 2, [
      closedItem(s3+'-i1', s3, 0, 'Final GC pay application processed and retainage released', ['user-003', 'user-011'], '2024-05-31', '2024-05-30', 'user-009', '2023-11-01'),
      closedItem(s3+'-i2', s3, 1, 'Unconditional lien waivers received from all subcontractors', ['user-003'], '2024-06-15', '2024-06-14', 'user-009', '2023-11-01', 'Unconditional final lien waivers required from all subs over $10K.'),
      closedItem(s3+'-i3', s3, 2, 'Final project cost report submitted and approved by CFO', ['user-003', 'user-004'], '2024-06-30', '2024-06-28', 'user-009', '2023-11-01'),
    ], '2023-11-01'),
  ];
})();

export const ap003: ActionPlan = {
  id: 'ap-003',
  accountId: 'acc-001',
  projectId: 'proj-015',
  number: 3,
  title: 'Closeout Gate — Kalamazoo Store Refresh',
  typeId: 'apt-gate',
  status: 'complete',
  private: false,
  locationId: null,
  description: 'Completed closeout gate review for the Kalamazoo Gull Rd Store Refresh covering construction closeout, owner turnover, and project financial close.',
  planManager: 'user-009',
  approvers: ['user-001', 'user-002'],
  completedReceivers: ['user-001', 'user-002', 'user-003', 'user-009'],
  sections: ap3Sections,
  createdBy: 'user-009',
  createdAt: d('2023-11-01'),
  updatedAt: d('2024-06-28'),
};

export const actionPlans: ActionPlan[] = [ap001, ap002, ap003];
