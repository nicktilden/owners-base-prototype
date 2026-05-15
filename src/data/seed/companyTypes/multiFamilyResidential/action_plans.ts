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

// ── ACTION PLAN 1: New Development Gate Review — Crescent at South End ────────
// Stage Gate: Course of Construction → Post-Construction readiness check

const ap1Sections: ActionPlanSection[] = (() => {
  const p = 'ap-001';
  const s1 = p + '-s1', s2 = p + '-s2', s3 = p + '-s3', s4 = p + '-s4';
  return [
    section(s1, p, 'Budget & Cost Control', 0, [
      closedItem(s1+'-i1', s1, 0, 'Owner contingency utilization reviewed and within threshold', ['user-003','user-004'], '2025-09-30', '2025-09-28', 'user-003', '2025-09-01', 'Remaining contingency ≥ 5% of estimated budget.'),
      closedItem(s1+'-i2', s1, 1, 'Q3 2025 cost reconciliation approved by CFO', ['user-003'], '2025-10-15', '2025-10-14', 'user-003', '2025-09-01'),
      inProgressItem(s1+'-i3', s1, 2, 'Pending change events reviewed and dispositioned', ['user-008','user-011'], '2026-01-31', 'user-003', '2025-09-01', 'All PCEs > $50K require VP approval before incorporation.'),
      delayedItem(s1+'-i4', s1, 3, 'Revised cost-at-completion forecast submitted to lender', ['user-003','user-006'], '2026-01-15', 'user-003', '2025-09-01'),
    ], '2025-09-01'),
    section(s2, p, 'Schedule & Milestone Compliance', 1, [
      closedItem(s2+'-i1', s2, 0, 'Tower topped out confirmed and photo documentation uploaded', ['user-013','user-009'], '2025-11-30', '2025-11-28', 'user-009', '2025-09-01'),
      inProgressItem(s2+'-i2', s2, 1, 'Revised schedule with recovery plan approved by PM team', ['user-010','user-011'], '2026-02-14', 'user-009', '2025-09-01', 'Recovery plan must demonstrate Substantial Completion by August 2026.'),
      openItem(s2+'-i3', s2, 2, 'MEP systems rough-in 90% milestone achieved', ['user-015','user-012'], '2026-03-31', 'user-009', '2025-09-01'),
    ], '2025-09-01'),
    section(s3, p, 'Quality & Inspections', 2, [
      closedItem(s3+'-i1', s3, 0, 'Third-party waterproofing inspection completed', ['user-014'], '2025-12-15', '2025-12-14', 'user-009', '2025-09-01', 'No critical deficiencies permitted.'),
      inProgressItem(s3+'-i2', s3, 1, 'Overdue RFI log reviewed and responses obtained', ['user-014','user-009'], '2026-01-25', 'user-009', '2025-09-01'),
      openItem(s3+'-i3', s3, 2, 'Pre-CO inspection checklist finalized with city', ['user-008','user-011'], '2026-06-30', 'user-009', '2025-09-01'),
    ], '2025-09-01'),
    section(s4, p, 'Lease-Up Readiness', 3, [
      openItem(s4+'-i1', s4, 0, 'Marketing materials and virtual tours completed', ['user-005','user-016'], '2026-05-31', 'user-006', '2025-09-01'),
      openItem(s4+'-i2', s4, 1, 'Property management team onboarded and trained', ['user-016','user-005'], '2026-07-31', 'user-006', '2025-09-01'),
      openItem(s4+'-i3', s4, 2, 'Certificate of Occupancy issued by city', ['user-008'], null, 'user-008', '2025-09-01', 'CO required before any resident move-in.'),
    ], '2025-09-01'),
  ];
})();

export const ap001: ActionPlan = {
  id: 'ap-001',
  accountId: 'acc-001',
  projectId: 'proj-001',
  number: 1,
  title: 'Construction Gate Review — Course of Construction to Post-Construction',
  typeId: 'apt-gate',
  status: 'in_progress',
  private: false,
  locationId: null,
  description: 'Stage gate review checklist for the Crescent at South End project transitioning from course of construction to post-construction.',
  planManager: 'user-009',
  approvers: ['user-002', 'user-001'],
  completedReceivers: ['user-001', 'user-002', 'user-003'],
  sections: ap1Sections,
  createdBy: 'user-009',
  createdAt: d('2025-09-01'),
  updatedAt: d('2026-01-20'),
};

// ── ACTION PLAN 2: New Development Feasibility Gate — Crescent River District ──
// Stage Gate: Feasibility → Final Design approval

const ap2Sections: ActionPlanSection[] = (() => {
  const p = 'ap-002';
  const s1 = p + '-s1', s2 = p + '-s2', s3 = p + '-s3';
  return [
    section(s1, p, 'Needs Assessment & Market Study', 0, [
      closedItem(s1+'-i1', s1, 0, 'Market feasibility study completed and approved', ['user-005','user-006'], '2025-05-31', '2025-05-28', 'user-006', '2025-03-01', 'Must demonstrate ≥ 7.0% projected yield on cost.'),
      closedItem(s1+'-i2', s1, 1, 'Preliminary project scope and unit mix defined', ['user-006','user-008'], '2025-06-15', '2025-06-13', 'user-006', '2025-03-01'),
      closedItem(s1+'-i3', s1, 2, 'Order-of-magnitude budget estimate prepared (±25%)', ['user-003','user-004'], '2025-06-30', '2025-06-28', 'user-006', '2025-03-01'),
    ], '2025-03-01'),
    section(s2, p, 'Site Control & Regulatory Feasibility', 1, [
      closedItem(s2+'-i1', s2, 0, 'Site control (option to purchase) executed', ['user-006'], '2025-07-31', '2025-07-30', 'user-006', '2025-03-01'),
      closedItem(s2+'-i2', s2, 1, 'Zoning variance application filed with Nashville Planning', ['user-008','user-014'], '2025-08-31', '2025-09-02', 'user-006', '2025-03-01'),
      inProgressItem(s2+'-i3', s2, 2, 'Environmental Phase I assessment completed and cleared', ['user-014'], '2026-01-31', 'user-006', '2025-03-01', 'No RECs may remain open before Final Design begins.'),
    ], '2025-03-01'),
    section(s3, p, 'Capital Stack & Board Approval', 2, [
      closedItem(s3+'-i1', s3, 0, 'Equity partner identified and letter of intent executed', ['user-003','user-006'], '2025-09-30', '2025-09-29', 'user-006', '2025-03-01'),
      closedItem(s3+'-i2', s3, 1, 'Construction lender term sheet received', ['user-003'], '2025-10-31', '2025-10-28', 'user-006', '2025-03-01'),
      inProgressItem(s3+'-i3', s3, 2, 'Investment Committee approval obtained', ['user-001','user-007'], '2026-02-28', 'user-006', '2025-03-01', 'Requires IC resolution and CFO sign-off.'),
      openItem(s3+'-i4', s3, 3, 'Final Design contract and architect NTP issued', ['user-006','user-011'], '2026-03-31', 'user-006', '2025-03-01'),
    ], '2025-03-01'),
  ];
})();

export const ap002: ActionPlan = {
  id: 'ap-002',
  accountId: 'acc-001',
  projectId: 'proj-006',
  number: 2,
  title: 'Development Gate Review — Feasibility to Final Design',
  typeId: 'apt-gate',
  status: 'in_progress',
  private: false,
  locationId: null,
  description: 'Gate review for the Crescent River District development project moving from feasibility through final design approval.',
  planManager: 'user-006',
  approvers: ['user-001', 'user-007'],
  completedReceivers: ['user-001', 'user-002', 'user-003', 'user-006'],
  sections: ap2Sections,
  createdBy: 'user-006',
  createdAt: d('2025-03-01'),
  updatedAt: d('2026-01-15'),
};

// ── ACTION PLAN 3: Renovation Closeout Gate — Station House Apartments ─────────
// Stage Gate: Post-Construction → Handover

const ap3Sections: ActionPlanSection[] = (() => {
  const p = 'ap-003';
  const s1 = p + '-s1', s2 = p + '-s2', s3 = p + '-s3';
  return [
    section(s1, p, 'Construction Closeout', 0, [
      closedItem(s1+'-i1', s1, 0, 'All punch list items resolved and signed off', ['user-013','user-009'], '2025-05-15', '2025-05-14', 'user-009', '2025-01-01'),
      closedItem(s1+'-i2', s1, 1, 'Final building inspections passed (all trades)', ['user-013'], '2025-05-31', '2025-05-30', 'user-009', '2025-01-01'),
      closedItem(s1+'-i3', s1, 2, 'Certificate of Occupancy issued', ['user-008'], '2025-06-15', '2025-06-12', 'user-009', '2025-01-01', 'CO required for all occupied floors.'),
    ], '2025-01-01'),
    section(s2, p, 'Owner Turnover & Documentation', 1, [
      closedItem(s2+'-i1', s2, 0, 'As-built drawings received from GC', ['user-014','user-009'], '2025-06-30', '2025-06-28', 'user-009', '2025-01-01'),
      closedItem(s2+'-i2', s2, 1, 'Operations & maintenance manuals delivered', ['user-016'], '2025-07-15', '2025-07-14', 'user-009', '2025-01-01'),
      closedItem(s2+'-i3', s2, 2, 'Warranty documentation compiled and transferred to PM', ['user-016','user-011'], '2025-07-31', '2025-07-30', 'user-009', '2025-01-01'),
    ], '2025-01-01'),
    section(s3, p, 'Financial Closeout', 2, [
      closedItem(s3+'-i1', s3, 0, 'Final contractor pay application processed', ['user-003','user-011'], '2025-08-31', '2025-08-29', 'user-009', '2025-01-01'),
      closedItem(s3+'-i2', s3, 1, 'Lien waivers received from all subcontractors', ['user-003'], '2025-09-15', '2025-09-14', 'user-009', '2025-01-01', 'Unconditional final lien waivers required from all subs.'),
      closedItem(s3+'-i3', s3, 2, 'Project financial close report submitted to executive team', ['user-003','user-004'], '2025-09-30', '2025-09-28', 'user-009', '2025-01-01'),
    ], '2025-01-01'),
  ];
})();

export const ap003: ActionPlan = {
  id: 'ap-003',
  accountId: 'acc-001',
  projectId: 'proj-007',
  number: 3,
  title: 'Renovation Closeout Gate — Post-Construction to Handover',
  typeId: 'apt-gate',
  status: 'complete',
  private: false,
  locationId: null,
  description: 'Completed closeout gate review for the Station House Apartments renovation, covering construction closeout, owner turnover, and financial close.',
  planManager: 'user-009',
  approvers: ['user-001', 'user-002'],
  completedReceivers: ['user-001', 'user-002', 'user-003', 'user-009'],
  sections: ap3Sections,
  createdBy: 'user-009',
  createdAt: d('2025-01-01'),
  updatedAt: d('2025-09-28'),
};

export const actionPlans: ActionPlan[] = [ap001, ap002, ap003];
