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
  // ── ap-001: Terminal 1 — TSA Security Layout Approval ──────────────────────
  {
    id: 'ap-001', accountId: 'acc-001', projectId: 'proj-001', number: 1,
    title: 'Terminal 1 Modernization — TSA Security Layout Approval',
    typeId: 'apt-001',
    status: 'in_progress', private: false, locationId: null,
    description: 'Obtain TSA Federal Security Director approval for the consolidated security checkpoint layout for the Terminal 1 modernization.',
    planManager: 'user-009', approvers: ['user-002'], completedReceivers: ['user-001'],
    sections: [
      section('ap-001-s1', 'ap-001', 'TSA Checkpoint Layout Review', 0, [
        closedItem('ap-001-s1-i1', 'ap-001-s1', 0, 'Submit 100% IFC security layout to TSA Federal Security Director', ['user-009'], '2025-12-31', '2025-12-28', 'user-009', '2025-01-15'),
        closedItem('ap-001-s1-i2', 'ap-001-s1', 1, 'Resolve TSA comment set — checkpoint lane geometry', ['user-012'], '2026-03-31', '2026-03-25', 'user-009', '2025-01-15'),
        inProgressItem('ap-001-s1-i3', 'ap-001-s1', 2, 'TSA FSD formal approval letter', ['user-009'], '2026-06-30', 'user-009', '2025-01-15'),
        openItem('ap-001-s1-i4', 'ap-001-s1', 3, 'CT scanner equipment installation coordination plan', ['user-015'], '2026-09-30', 'user-009', '2025-01-15'),
      ], '2025-01-15'),
    ],
    createdBy: 'user-009', createdAt: d('2025-01-15'), updatedAt: d('2026-04-25'),
  },

  // ── ap-002: Runway 24L/6R — FAA Phase 2 Closure Safety Plan ───────────────
  {
    id: 'ap-002', accountId: 'acc-001', projectId: 'proj-002', number: 2,
    title: 'Runway 24L/6R Reconstruction — FAA Phase 2 Closure Authorization',
    typeId: 'apt-002',
    status: 'in_progress', private: false, locationId: null,
    description: 'Complete all FAA authorization requirements for the Phase 2 runway closure including NOTAM issuance, ILS protection plan, and airline coordination.',
    planManager: 'user-010', approvers: ['user-002'], completedReceivers: ['user-001'],
    sections: [
      section('ap-002-s1', 'ap-002', 'FAA Regulatory Coordination', 0, [
        closedItem('ap-002-s1-i1', 'ap-002-s1', 0, 'Submit Phase 2 construction safety plan to FAA ADO', ['user-012'], '2025-12-01', '2025-11-28', 'user-009', '2025-06-01'),
        closedItem('ap-002-s1-i2', 'ap-002-s1', 1, 'Coordinate ILS critical area protection plan with airlines', ['user-010'], '2026-01-10', '2026-01-08', 'user-009', '2025-06-01'),
        inProgressItem('ap-002-s1-i3', 'ap-002-s1', 2, 'NOTAM issuance — Phase 2 runway closure schedule', ['user-010'], '2026-05-15', 'user-009', '2025-06-01'),
        openItem('ap-002-s1-i4', 'ap-002-s1', 3, 'FAA flight inspection pre-clearance', ['user-009'], '2026-06-30', 'user-009', '2025-06-01'),
      ], '2025-06-01'),
    ],
    createdBy: 'user-009', createdAt: d('2025-06-01'), updatedAt: d('2026-04-10'),
  },

  // ── ap-003: TBIT Gates — CBP FIS Acceptance ───────────────────────────────
  {
    id: 'ap-003', accountId: 'acc-001', projectId: 'proj-004', number: 3,
    title: 'TBIT International Gates — CBP Federal Inspection Station Acceptance',
    typeId: 'apt-003',
    status: 'in_progress', private: false, locationId: null,
    description: 'Coordinate all CBP design reviews and acceptance milestones for the new Federal Inspection Station in the TBIT expansion.',
    planManager: 'user-009', approvers: ['user-002'], completedReceivers: ['user-001'],
    sections: [
      section('ap-003-s1', 'ap-003', 'CBP FIS Design Review', 0, [
        closedItem('ap-003-s1-i1', 'ap-003-s1', 0, 'Submit FIS hall design to CBP Port Director for review', ['user-009'], '2025-06-30', '2025-06-25', 'user-009', '2024-08-01'),
        inProgressItem('ap-003-s1-i2', 'ap-003-s1', 1, 'Resolve CBP layout comments — primary inspection flow', ['user-009', 'user-008'], '2026-06-30', 'user-009', '2024-08-01'),
        openItem('ap-003-s1-i3', 'ap-003-s1', 2, 'CBP equipment fit plan — AIT, kiosk, and baggage claim', ['user-009'], '2027-01-31', 'user-009', '2024-08-01'),
        openItem('ap-003-s1-i4', 'ap-003-s1', 3, 'CBP final FIS acceptance letter', ['user-009'], '2027-08-31', 'user-009', '2024-08-01'),
      ], '2024-08-01'),
    ],
    createdBy: 'user-009', createdAt: d('2024-08-01'), updatedAt: d('2026-05-02'),
  },

  // ── ap-004: People Mover — FTA Grant Closeout ─────────────────────────────
  {
    id: 'ap-004', accountId: 'acc-001', projectId: 'proj-008', number: 4,
    title: 'Airport Metro Connector — FTA Small Starts Grant Compliance',
    typeId: 'apt-004',
    status: 'in_progress', private: false, locationId: null,
    description: 'Ensure compliance with all FTA Small Starts grant requirements through construction and revenue service startup.',
    planManager: 'user-009', approvers: ['user-002'], completedReceivers: ['user-001'],
    sections: [
      section('ap-004-s1', 'ap-004', 'FTA Grant Compliance Milestones', 0, [
        inProgressItem('ap-004-s1-i1', 'ap-004-s1', 0, 'DBE goal tracking — quarterly reporting', ['user-006'], '2026-05-31', 'user-009', '2023-09-20'),
        inProgressItem('ap-004-s1-i2', 'ap-004-s1', 1, 'Buy America compliance documentation — APM vehicles', ['user-012'], '2026-09-30', 'user-009', '2023-09-20'),
        openItem('ap-004-s1-i3', 'ap-004-s1', 2, 'FTA pre-revenue service safety review', ['user-009'], '2027-06-30', 'user-009', '2023-09-20'),
        openItem('ap-004-s1-i4', 'ap-004-s1', 3, 'FTA project completion milestone report', ['user-009', 'user-004'], '2028-12-31', 'user-009', '2023-09-20'),
      ], '2023-09-20'),
    ],
    createdBy: 'user-009', createdAt: d('2023-09-20'), updatedAt: d('2026-04-15'),
  },

  // ── ap-005: Taxiway C/D — FAA AIP Grant Obligation ────────────────────────
  {
    id: 'ap-005', accountId: 'acc-001', projectId: 'proj-006', number: 5,
    title: 'Taxiway C/D Rehabilitation — FAA AIP Grant Obligation & Closeout',
    typeId: 'apt-005',
    status: 'in_progress', private: false, locationId: null,
    description: 'Complete all FAA AIP grant compliance steps from obligation through final closeout for the Taxiway C/D rehab project.',
    planManager: 'user-010', approvers: ['user-002'], completedReceivers: ['user-001'],
    sections: [
      section('ap-005-s1', 'ap-005', 'FAA AIP Grant Steps', 0, [
        closedItem('ap-005-s1-i1', 'ap-005-s1', 0, 'FAA AIP pre-application meeting', ['user-008', 'user-004'], '2024-10-31', '2024-10-28', 'user-010', '2024-08-01'),
        inProgressItem('ap-005-s1-i2', 'ap-005-s1', 1, 'Complete procurement — IFB advertisement per FAA requirements', ['user-006'], '2026-07-01', 'user-010', '2024-08-01'),
        openItem('ap-005-s1-i3', 'ap-005-s1', 2, 'FAA grant agreement execution', ['user-010'], '2026-09-30', 'user-010', '2024-08-01'),
        openItem('ap-005-s1-i4', 'ap-005-s1', 3, 'Final inspection and AIP grant closeout report', ['user-009', 'user-004'], '2026-12-31', 'user-010', '2024-08-01'),
      ], '2024-08-01'),
    ],
    createdBy: 'user-010', createdAt: d('2024-08-01'), updatedAt: d('2026-04-25'),
  },
];
