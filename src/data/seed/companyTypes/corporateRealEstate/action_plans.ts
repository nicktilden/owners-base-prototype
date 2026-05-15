import type { ActionPlan, ActionPlanItem, ActionPlanSection } from '@/types/action_plans';

function d(iso: string): Date { return new Date(iso); }

function closedItem(
  id: string, sectionId: string, order: number, title: string,
  assignees: string[], dueDate: string, completedAt: string,
  createdBy: string, createdAt: string
): ActionPlanItem {
  return {
    id, sectionId, order, title, description: null, acceptanceCriteria: null,
    status: 'closed', assignees, dueDate: d(dueDate), references: [],
    completedAt: d(completedAt), createdBy, createdAt: d(createdAt), updatedAt: d(completedAt),
  };
}

function openItem(
  id: string, sectionId: string, order: number, title: string,
  assignees: string[], dueDate: string | null,
  createdBy: string, createdAt: string
): ActionPlanItem {
  return {
    id, sectionId, order, title, description: null, acceptanceCriteria: null,
    status: 'open', assignees, dueDate: dueDate ? d(dueDate) : null, references: [],
    completedAt: null, createdBy, createdAt: d(createdAt), updatedAt: d(createdAt),
  };
}

function inProgressItem(
  id: string, sectionId: string, order: number, title: string,
  assignees: string[], dueDate: string,
  createdBy: string, createdAt: string
): ActionPlanItem {
  return {
    id, sectionId, order, title, description: null, acceptanceCriteria: null,
    status: 'in_progress', assignees, dueDate: d(dueDate), references: [],
    completedAt: null, createdBy, createdAt: d(createdAt), updatedAt: d(createdAt),
  };
}

function section(id: string, planId: string, title: string, order: number, items: ActionPlanItem[], createdAt: string): ActionPlanSection {
  return { id, planId, title, order, items, createdAt: d(createdAt), updatedAt: d(createdAt) };
}

export const actionPlans: ActionPlan[] = [
  // ── ap-001: Bellevue Building 3 — Design Review Gate ─────────────────────
  {
    id: 'ap-001', accountId: 'acc-001', projectId: 'proj-001', number: 1,
    title: 'Bellevue Building 3 — Design Review & Owner Approval Gate',
    typeId: 'apt-001',
    status: 'complete', private: false, locationId: null,
    description: 'Formal owner review and approval of the 100% Design Development package before proceeding to Construction Documents phase.',
    planManager: 'user-009', approvers: ['user-002'], completedReceivers: ['user-001'],
    sections: [
      section('ap-001-s1', 'ap-001', 'Design Development Review', 0, [
        closedItem('ap-001-s1-i1', 'ap-001-s1', 0, 'Approve architectural DD package', ['user-002'], '2025-02-28', '2025-02-25', 'user-009', '2025-01-15'),
        closedItem('ap-001-s1-i2', 'ap-001-s1', 1, 'Confirm GMP target cost at DD', ['user-003'], '2025-03-10', '2025-03-08', 'user-009', '2025-01-15'),
        closedItem('ap-001-s1-i3', 'ap-001-s1', 2, 'Approve technology package scope', ['user-009'], '2025-03-15', '2025-03-12', 'user-009', '2025-01-15'),
        closedItem('ap-001-s1-i4', 'ap-001-s1', 3, 'Board capital expenditure approval', ['user-001'], '2025-03-31', '2025-03-28', 'user-009', '2025-01-15'),
      ], '2025-01-15'),
    ],
    createdBy: 'user-009', createdAt: d('2025-01-15'), updatedAt: d('2025-04-01'),
  },

  // ── ap-002: Campus Childcare Hub — Budget Recovery Gate ───────────────────
  {
    id: 'ap-002', accountId: 'acc-001', projectId: 'proj-004', number: 2,
    title: 'Campus Childcare Hub — Budget Recovery & Reforecast Gate',
    typeId: 'apt-002',
    status: 'in_progress', private: false, locationId: null,
    description: 'Formal reforecast and budget recovery plan following contingency exhaustion. Owner approval required before authorizing additional funds.',
    planManager: 'user-009', approvers: ['user-003'], completedReceivers: ['user-001'],
    sections: [
      section('ap-002-s1', 'ap-002', 'Budget Analysis & Recovery', 0, [
        closedItem('ap-002-s1-i1', 'ap-002-s1', 0, 'Compile approved CO impacts to date', ['user-009'], '2026-04-30', '2026-04-28', 'user-003', '2026-04-20'),
        inProgressItem('ap-002-s1-i2', 'ap-002-s1', 1, 'Identify scope reduction options', ['user-011'], '2026-05-20', 'user-003', '2026-04-20'),
        openItem('ap-002-s1-i3', 'ap-002-s1', 2, 'CFO review and budget reauthorization', ['user-003'], '2026-06-01', 'user-003', '2026-04-20'),
        openItem('ap-002-s1-i4', 'ap-002-s1', 3, 'Issue amended GMP contract to GC', ['user-004'], '2026-06-15', 'user-003', '2026-04-20'),
      ], '2026-04-20'),
    ],
    createdBy: 'user-003', createdAt: d('2026-04-20'), updatedAt: d('2026-04-28'),
  },

  // ── ap-003: Seattle TI Westlake — Landlord Consent ────────────────────────
  {
    id: 'ap-003', accountId: 'acc-001', projectId: 'proj-002', number: 3,
    title: 'Seattle TI Westlake — Landlord Consent & Permit Readiness',
    typeId: 'apt-003',
    status: 'in_progress', private: false, locationId: null,
    description: 'Obtain all pre-construction approvals including landlord consent, permit submission, and GC mobilization authorization.',
    planManager: 'user-008', approvers: ['user-009'], completedReceivers: ['user-001'],
    sections: [
      section('ap-003-s1', 'ap-003', 'Pre-Construction Approvals', 0, [
        closedItem('ap-003-s1-i1', 'ap-003-s1', 0, 'Submit 100% CDs to landlord for review', ['user-011'], '2026-03-01', '2026-02-28', 'user-009', '2025-11-01'),
        inProgressItem('ap-003-s1-i2', 'ap-003-s1', 1, 'Obtain landlord written consent', ['user-008'], '2026-05-15', 'user-009', '2025-11-01'),
        openItem('ap-003-s1-i3', 'ap-003-s1', 2, 'Submit building permit to Seattle DCI', ['user-008'], '2026-05-25', 'user-009', '2025-11-01'),
        openItem('ap-003-s1-i4', 'ap-003-s1', 3, 'Authorize GC mobilization', ['user-009'], '2026-06-01', 'user-009', '2025-11-01'),
      ], '2025-11-01'),
    ],
    createdBy: 'user-009', createdAt: d('2025-11-01'), updatedAt: d('2026-04-20'),
  },

  // ── ap-004: Denver LoDo — LEED Platinum Certification ────────────────────
  {
    id: 'ap-004', accountId: 'acc-001', projectId: 'proj-009', number: 4,
    title: 'Denver LoDo TI — LEED Platinum Certification Closeout',
    typeId: 'apt-004',
    status: 'in_progress', private: false, locationId: null,
    description: 'Submit all LEED CI v4 documentation to USGBC and achieve Platinum certification before final occupancy.',
    planManager: 'user-006', approvers: ['user-009'], completedReceivers: ['user-001'],
    sections: [
      section('ap-004-s1', 'ap-004', 'LEED Documentation Submission', 0, [
        inProgressItem('ap-004-s1-i1', 'ap-004-s1', 0, 'Complete energy metering commissioning Cx reports', ['user-015'], '2026-05-15', 'user-009', '2025-12-01'),
        openItem('ap-004-s1-i2', 'ap-004-s1', 1, 'Submit LEED CI application to USGBC', ['user-006'], '2026-06-01', 'user-009', '2025-12-01'),
        openItem('ap-004-s1-i3', 'ap-004-s1', 2, 'Respond to USGBC reviewer comments', ['user-006'], '2026-07-15', 'user-009', '2025-12-01'),
        openItem('ap-004-s1-i4', 'ap-004-s1', 3, 'Receive LEED Platinum certification letter', ['user-006', 'user-009'], '2026-07-31', 'user-009', '2025-12-01'),
      ], '2025-12-01'),
    ],
    createdBy: 'user-009', createdAt: d('2025-12-01'), updatedAt: d('2026-04-15'),
  },

  // ── ap-005: Bellevue MF Housing — Entitlement Gate ────────────────────────
  {
    id: 'ap-005', accountId: 'acc-001', projectId: 'proj-008', number: 5,
    title: 'Bellevue MF Housing — Entitlement & Design Review Gate',
    typeId: 'apt-005',
    status: 'in_progress', private: false, locationId: null,
    description: 'Complete all land use entitlement steps and owner design review approvals before proceeding to Construction Documents.',
    planManager: 'user-009', approvers: ['user-001'], completedReceivers: ['user-001'],
    sections: [
      section('ap-005-s1', 'ap-005', 'Entitlement & Owner Approvals', 0, [
        inProgressItem('ap-005-s1-i1', 'ap-005-s1', 0, 'Publish draft EIS for public comment', ['user-014'], '2026-05-30', 'user-001', '2025-09-01'),
        openItem('ap-005-s1-i2', 'ap-005-s1', 1, 'Obtain density bonus approval from Bellevue DSD', ['user-008'], '2026-09-30', 'user-001', '2025-09-01'),
        openItem('ap-005-s1-i3', 'ap-005-s1', 2, 'Affordable housing covenant execution', ['user-004'], '2026-10-31', 'user-001', '2025-09-01'),
        openItem('ap-005-s1-i4', 'ap-005-s1', 3, 'Board approval of project budget at 100% DD', ['user-001'], '2026-11-30', 'user-001', '2025-09-01'),
      ], '2025-09-01'),
    ],
    createdBy: 'user-001', createdAt: d('2025-09-01'), updatedAt: d('2026-04-15'),
  },
];
