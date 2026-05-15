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

function section(
  id: string, planId: string, title: string, order: number,
  items: ActionPlanItem[], createdAt: string
): ActionPlanSection {
  return { id, planId, title, order, items, createdAt: d(createdAt), updatedAt: d(createdAt) };
}

// ── ACTION PLAN 1: ITC Safe Harbor Compliance Gate — Rutherford County Phase 1 ──

const ap1Sections: ActionPlanSection[] = (() => {
  const p = 'ap-001';
  const s1 = p + '-s1', s2 = p + '-s2';
  return [
    section(s1, p, 'ITC Documentation & Compliance', 0, [
      closedItem(s1+'-i1', s1, 0, 'Confirm 5% cost incurrence certificate', ['user-003'], '2024-10-31', '2024-10-28', 'user-004', '2024-03-01'),
      inProgressItem(s1+'-i2', s1, 1, 'Compile continuous construction log', ['user-009'], '2026-06-30', 'user-004', '2024-03-01'),
      closedItem(s1+'-i3', s1, 2, 'Legal review of ITC eligibility', ['user-006'], '2024-12-15', '2024-12-10', 'user-004', '2024-03-01'),
    ], '2024-03-01'),
    section(s2, p, 'Engineering & Construction Evidence', 1, [
      closedItem(s2+'-i1', s2, 0, 'Executed EPC contract on file', ['user-009', 'user-011'], '2024-04-30', '2024-04-28', 'user-004', '2024-03-01'),
      inProgressItem(s2+'-i2', s2, 1, 'Monthly construction progress documentation binder', ['user-009'], '2026-06-30', 'user-004', '2024-03-01'),
    ], '2024-03-01'),
  ];
})();

export const ap001: ActionPlan = {
  id: 'ap-001',
  accountId: 'acc-001',
  projectId: 'proj-001',
  number: 1,
  title: 'Rutherford County Phase 1 — ITC Safe Harbor Compliance Gate',
  typeId: 'apt-gate',
  status: 'in_progress',
  private: false,
  locationId: null,
  description: 'Ensure ITC safe harbor requirements are met by verifying 5% cost incurrence threshold and continuous construction documentation before year-end.',
  planManager: 'user-009',
  approvers: ['user-004', 'user-003'],
  completedReceivers: ['user-001', 'user-003', 'user-004'],
  sections: ap1Sections,
  createdBy: 'user-004',
  createdAt: d('2024-03-01'),
  updatedAt: d('2026-04-20'),
};

// ── ACTION PLAN 2: ERCOT Market Qualification — Sunflower Flats BESS ──────────

const ap2Sections: ActionPlanSection[] = (() => {
  const p = 'ap-002';
  const s1 = p + '-s1';
  return [
    section(s1, p, 'ERCOT Registration & Qualification', 0, [
      closedItem(s1+'-i1', s1, 0, 'Submit ESR registration application to ERCOT', ['user-011'], '2025-10-15', '2025-10-12', 'user-009', '2024-07-01'),
      inProgressItem(s1+'-i2', s1, 1, 'Complete Real-Time Market qualification test', ['user-012'], '2026-03-31', 'user-009', '2024-07-01'),
      openItem(s1+'-i3', s1, 2, 'Register BESS as qualified scheduling entity', ['user-012'], '2026-04-15', 'user-009', '2024-07-01'),
    ], '2024-07-01'),
  ];
})();

export const ap002: ActionPlan = {
  id: 'ap-002',
  accountId: 'acc-001',
  projectId: 'proj-002',
  number: 2,
  title: 'Sunflower Flats BESS — ERCOT Market Qualification',
  typeId: 'apt-gate',
  status: 'in_progress',
  private: false,
  locationId: null,
  description: 'Complete all ERCOT registration and qualification steps required for the BESS to participate in ancillary services markets at COD.',
  planManager: 'user-012',
  approvers: ['user-009', 'user-004'],
  completedReceivers: ['user-001', 'user-004', 'user-009'],
  sections: ap2Sections,
  createdBy: 'user-009',
  createdAt: d('2024-07-01'),
  updatedAt: d('2026-04-10'),
};

// ── ACTION PLAN 3: NEPA & Permitting Gate — Luna County Solar ─────────────────

const ap3Sections: ActionPlanSection[] = (() => {
  const p = 'ap-003';
  const s1 = p + '-s1';
  return [
    section(s1, p, 'Federal & State Permitting', 0, [
      inProgressItem(s1+'-i1', s1, 0, 'File BLM right-of-way application', ['user-011'], '2026-06-01', 'user-008', '2025-04-01'),
      inProgressItem(s1+'-i2', s1, 1, 'Complete NEPA environmental assessment', ['user-014'], '2026-08-31', 'user-008', '2025-04-01'),
      openItem(s1+'-i3', s1, 2, 'Obtain NMPRC interconnection approval', ['user-008'], '2026-10-31', 'user-008', '2025-04-01'),
    ], '2025-04-01'),
  ];
})();

export const ap003: ActionPlan = {
  id: 'ap-003',
  accountId: 'acc-001',
  projectId: 'proj-006',
  number: 3,
  title: 'Luna County Solar — NEPA & Permitting Gate',
  typeId: 'apt-gate',
  status: 'in_progress',
  private: false,
  locationId: null,
  description: 'Complete all federal and state permitting requirements before Notice to Proceed for the Luna County 200 MW solar farm.',
  planManager: 'user-011',
  approvers: ['user-008', 'user-004'],
  completedReceivers: ['user-001', 'user-004', 'user-008'],
  sections: ap3Sections,
  createdBy: 'user-008',
  createdAt: d('2025-04-01'),
  updatedAt: d('2026-04-15'),
};

export const actionPlans: ActionPlan[] = [ap001, ap002, ap003];
