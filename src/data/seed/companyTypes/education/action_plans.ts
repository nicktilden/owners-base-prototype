import type { ActionPlan, ActionPlanItem } from '@/types/action_plans';

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

// Action Plan 1: Kiewit Hall Addition GMP Execution Gate
const ap001: ActionPlan = {
  id: 'ap-001', accountId: 'acc-001', projectId: 'proj-001', number: 1,
  title: 'Kiewit Hall Addition - Construction Phase Gate (GMP Execution)',
  typeId: 'apt-gate', status: 'in_progress', private: false, locationId: null,
  description: 'Pre-construction and GMP execution readiness gate for the $148M Kiewit Hall Addition.',
  planManager: 'user-009', approvers: ['user-002', 'user-001'],
  completedReceivers: ['user-001', 'user-002', 'user-003'],
  createdBy: 'user-006', createdAt: d('2025-02-01'), updatedAt: d('2025-05-14'),
  sections: [
    {
      id: 'ap-001-s1', planId: 'ap-001', title: 'Owner Authorization & Funding', order: 0,
      createdAt: d('2025-02-01'), updatedAt: d('2025-02-01'),
      items: [
        inProgressItem('ap-001-s1-i1', 'ap-001-s1', 0, 'Board of Regents GMP approval resolution', ['user-002'], '2025-06-10', 'user-006', '2025-02-01'),
        closedItem('ap-001-s1-i2', 'ap-001-s1', 1, 'State Building Bond authorization confirmed with VP Finance', ['user-002'], '2025-04-30', '2025-04-28', 'user-006', '2025-02-01'),
        closedItem('ap-001-s1-i3', 'ap-001-s1', 2, 'NSHE capital project reporting form submitted to state', ['user-007'], '2025-04-15', '2025-04-12', 'user-006', '2025-02-01'),
      ],
    },
    {
      id: 'ap-001-s2', planId: 'ap-001', title: 'Contractor & Subcontractor Compliance', order: 1,
      createdAt: d('2025-02-01'), updatedAt: d('2025-02-01'),
      items: [
        closedItem('ap-001-s2-i1', 'ap-001-s2', 0, 'Kiewit Building Group GMP contract fully executed', ['user-007'], '2025-03-31', '2025-03-29', 'user-006', '2025-02-01'),
        closedItem('ap-001-s2-i2', 'ap-001-s2', 1, 'Performance and payment bonds received (100% of GMP)', ['user-006'], '2025-04-05', '2025-04-03', 'user-006', '2025-02-01'),
        closedItem('ap-001-s2-i3', 'ap-001-s2', 2, 'Certificate of insurance - all required coverages verified', ['user-007'], '2025-04-10', '2025-04-08', 'user-006', '2025-02-01'),
        inProgressItem('ap-001-s2-i4', 'ap-001-s2', 3, 'Structural steel subcontractor award confirmed', ['user-010'], '2025-05-20', 'user-006', '2025-02-01'),
        openItem('ap-001-s2-i5', 'ap-001-s2', 4, 'Lab casework vendor award (Hamilton / Thermo / Kewaunee)', ['user-011'], '2025-06-01', 'user-006', '2025-02-01'),
      ],
    },
    {
      id: 'ap-001-s3', planId: 'ap-001', title: 'Design & Permits', order: 2,
      createdAt: d('2025-02-01'), updatedAt: d('2025-02-01'),
      items: [
        closedItem('ap-001-s3-i1', 'ap-001-s3', 0, 'City of Lincoln building permit issued', ['user-013'], '2025-03-20', '2025-03-18', 'user-006', '2025-02-01'),
        inProgressItem('ap-001-s3-i2', 'ap-001-s3', 1, 'LEED v4 design review submission to USGBC confirmed', ['user-008'], '2025-05-30', 'user-006', '2025-02-01'),
        closedItem('ap-001-s3-i3', 'ap-001-s3', 2, 'Site logistics plan approved by UNL Campus Planning', ['user-006'], '2025-04-01', '2025-03-28', 'user-006', '2025-02-01'),
      ],
    },
  ],
};

// Action Plan 2: Memorial Stadium East Club Game Day Readiness Gate
const ap002: ActionPlan = {
  id: 'ap-002', accountId: 'acc-001', projectId: 'proj-002', number: 2,
  title: 'Memorial Stadium East Club - Game Day Readiness Gate (August 28)',
  typeId: 'apt-gate', status: 'in_progress', private: false, locationId: null,
  description: 'Substantial completion and game-day readiness gate for the $92M Memorial Stadium East Club premium seating expansion.',
  planManager: 'user-009', approvers: ['user-001', 'user-007'],
  completedReceivers: ['user-001', 'user-002', 'user-003', 'user-006'],
  createdBy: 'user-006', createdAt: d('2025-01-15'), updatedAt: d('2025-05-13'),
  sections: [
    {
      id: 'ap-002-s1', planId: 'ap-002', title: 'Construction Completion', order: 0,
      createdAt: d('2025-01-15'), updatedAt: d('2025-01-15'),
      items: [
        inProgressItem('ap-002-s1-i1', 'ap-002-s1', 0, 'Structural reinforcement - all shear walls accepted by EOR', ['user-015'], '2025-06-15', 'user-006', '2025-01-15'),
        inProgressItem('ap-002-s1-i2', 'ap-002-s1', 1, 'MEP systems rough-in complete and ready for inspections', ['user-014'], '2025-06-30', 'user-006', '2025-01-15'),
        openItem('ap-002-s1-i3', 'ap-002-s1', 2, 'Interior finishes complete (suites, concourse, club lounge)', ['user-010'], '2025-07-31', 'user-006', '2025-01-15'),
        closedItem('ap-002-s1-i4', 'ap-002-s1', 3, 'Hellas turf system installation accepted', ['user-015'], '2025-04-30', '2025-04-28', 'user-006', '2025-01-15'),
      ],
    },
    {
      id: 'ap-002-s2', planId: 'ap-002', title: 'AV, Technology & Broadcast', order: 1,
      createdAt: d('2025-01-15'), updatedAt: d('2025-01-15'),
      items: [
        inProgressItem('ap-002-s2-i1', 'ap-002-s2', 0, 'Open AV/broadcast RFI backlog (19 RFIs) cleared', ['user-014'], '2025-05-30', 'user-006', '2025-01-15'),
        openItem('ap-002-s2-i2', 'ap-002-s2', 1, 'Daktronics scoreboard installation and factory acceptance complete', ['user-010'], '2025-07-20', 'user-006', '2025-01-15'),
        openItem('ap-002-s2-i3', 'ap-002-s2', 2, 'NEP Broadcasting fiber backbone and signal routing commissioned', ['user-017'], '2025-08-01', 'user-006', '2025-01-15'),
      ],
    },
    {
      id: 'ap-002-s3', planId: 'ap-002', title: 'Inspections & Occupancy', order: 2,
      createdAt: d('2025-01-15'), updatedAt: d('2025-01-15'),
      items: [
        openItem('ap-002-s3-i1', 'ap-002-s3', 0, 'City of Lincoln building final inspection passed', ['user-013'], '2025-08-10', 'user-006', '2025-01-15'),
        openItem('ap-002-s3-i2', 'ap-002-s3', 1, 'Certificate of Occupancy issued by City of Lincoln', ['user-013'], '2025-08-12', 'user-006', '2025-01-15', 'Certificate on file with Owner.'),
        openItem('ap-002-s3-i3', 'ap-002-s3', 2, 'Athletics Department formal acceptance walkthrough complete', ['user-005'], '2025-08-14', 'user-006', '2025-01-15'),
      ],
    },
  ],
};

// Action Plan 3: Love Library Asbestos Abatement Phase 2 Clearance Gate
const ap003: ActionPlan = {
  id: 'ap-003', accountId: 'acc-001', projectId: 'proj-005', number: 3,
  title: 'Love Library Renovation - Asbestos Abatement Phase 2 Clearance Gate',
  typeId: 'apt-compliance', status: 'in_progress', private: false, locationId: null,
  description: 'Environmental clearance gate prior to Phase 2 framing and MEP installation on floors 3-5.',
  planManager: 'user-016', approvers: ['user-009', 'user-002'],
  completedReceivers: ['user-001', 'user-002', 'user-009'],
  createdBy: 'user-009', createdAt: d('2025-04-01'), updatedAt: d('2025-05-14'),
  sections: [
    {
      id: 'ap-003-s1', planId: 'ap-003', title: 'Abatement Execution', order: 0,
      createdAt: d('2025-04-01'), updatedAt: d('2025-04-01'),
      items: [
        closedItem('ap-003-s1-i1', 'ap-003-s1', 0, 'NDEQ 10-day notification submitted for floors 3-5 abatement', ['user-016'], '2025-04-28', '2025-04-25', 'user-009', '2025-04-01'),
        inProgressItem('ap-003-s1-i2', 'ap-003-s1', 1, 'ACM floor tile and pipe insulation removal complete - floors 3-5', ['user-015'], '2025-05-20', 'user-009', '2025-04-01'),
        inProgressItem('ap-003-s1-i3', 'ap-003-s1', 2, 'ACM waste manifests and disposal documentation filed', ['user-016'], '2025-05-22', 'user-009', '2025-04-01'),
      ],
    },
    {
      id: 'ap-003-s2', planId: 'ap-003', title: 'Air Monitoring & Clearance', order: 1,
      createdAt: d('2025-04-01'), updatedAt: d('2025-04-01'),
      items: [
        inProgressItem('ap-003-s2-i1', 'ap-003-s2', 0, 'Aggressive final air clearance sampling collected - IHA', ['user-016'], '2025-05-23', 'user-009', '2025-04-01'),
        openItem('ap-003-s2-i2', 'ap-003-s2', 1, 'NDE laboratory PCM analysis results received', ['user-016'], '2025-05-24', 'user-009', '2025-04-01'),
        openItem('ap-003-s2-i3', 'ap-003-s2', 2, 'IHA certified industrial hygienist air clearance letter issued', ['user-016'], '2025-05-24', 'user-009', '2025-04-01', 'Air clearance letter from licensed CIH on file.'),
        openItem('ap-003-s2-i4', 'ap-003-s2', 3, 'Phase 2 framing NTP issued to contractor', ['user-009'], '2025-05-27', 'user-009', '2025-04-01'),
      ],
    },
  ],
};

// Action Plan 4: Utility Tunnel Contract Award & Pre-Construction Gate
const ap004: ActionPlan = {
  id: 'ap-004', accountId: 'acc-001', projectId: 'proj-008', number: 4,
  title: 'Utility Tunnel Rehabilitation - Contract Award & Pre-Construction Gate',
  typeId: 'apt-gate', status: 'in_progress', private: false, locationId: null,
  description: 'Contract award authorization and pre-construction readiness gate for the $14M utility tunnel rehabilitation.',
  planManager: 'user-006', approvers: ['user-001', 'user-007'],
  completedReceivers: ['user-001', 'user-002', 'user-003', 'user-009'],
  createdBy: 'user-009', createdAt: d('2025-04-15'), updatedAt: d('2025-05-12'),
  sections: [
    {
      id: 'ap-004-s1', planId: 'ap-004', title: 'Bid Evaluation & Award Authorization', order: 0,
      createdAt: d('2025-04-15'), updatedAt: d('2025-04-15'),
      items: [
        inProgressItem('ap-004-s1-i1', 'ap-004-s1', 0, 'Bid tabulation and contractor evaluation matrix completed', ['user-006'], '2025-05-25', 'user-009', '2025-04-15'),
        openItem('ap-004-s1-i2', 'ap-004-s1', 1, 'Award recommendation memo approved by VP Finance & Admin', ['user-002'], '2025-05-30', 'user-009', '2025-04-15'),
        openItem('ap-004-s1-i3', 'ap-004-s1', 2, 'Contract documents fully executed', ['user-007'], '2025-06-05', 'user-009', '2025-04-15'),
      ],
    },
    {
      id: 'ap-004-s2', planId: 'ap-004', title: 'Pre-Construction Safety & Environmental', order: 1,
      createdAt: d('2025-04-15'), updatedAt: d('2025-04-15'),
      items: [
        closedItem('ap-004-s2-i1', 'ap-004-s2', 0, 'Confined space entry program reviewed and approved', ['user-016'], '2025-05-10', '2025-05-08', 'user-009', '2025-04-15'),
        openItem('ap-004-s2-i2', 'ap-004-s2', 1, 'ACM abatement contractor availability confirmed', ['user-016'], '2025-06-12', 'user-009', '2025-04-15'),
        closedItem('ap-004-s2-i3', 'ap-004-s2', 2, 'Campus utility shutdown and notification plan approved by Facilities', ['user-005'], '2025-05-08', '2025-05-06', 'user-009', '2025-04-15'),
        openItem('ap-004-s2-i4', 'ap-004-s2', 3, 'Pre-construction conference scheduled with contractor and Facilities', ['user-010'], '2025-06-08', 'user-009', '2025-04-15'),
      ],
    },
  ],
};

// Action Plan 5: Henzlik Hall STEM Labs Laboratory Commissioning Gate
const ap005: ActionPlan = {
  id: 'ap-005', accountId: 'acc-001', projectId: 'proj-009', number: 5,
  title: 'Henzlik Hall STEM Labs - Laboratory Commissioning & Occupancy Gate',
  typeId: 'apt-gate', status: 'in_progress', private: false, locationId: null,
  description: 'Laboratory commissioning readiness and occupancy authorization gate for the $28M Henzlik Hall STEM lab renovation.',
  planManager: 'user-009', approvers: ['user-001', 'user-007'],
  completedReceivers: ['user-001', 'user-002', 'user-003', 'user-009'],
  createdBy: 'user-006', createdAt: d('2025-03-10'), updatedAt: d('2025-05-13'),
  sections: [
    {
      id: 'ap-005-s1', planId: 'ap-005', title: 'MEP & Fume Hood Commissioning', order: 0,
      createdAt: d('2025-03-10'), updatedAt: d('2025-03-10'),
      items: [
        inProgressItem('ap-005-s1-i1', 'ap-005-s1', 0, 'All fume hoods flow-tested and certified by commissioning agent', ['user-014'], '2025-07-15', 'user-006', '2025-03-10'),
        inProgressItem('ap-005-s1-i2', 'ap-005-s1', 1, 'Perchloric acid fume hood stack test - NDEE pre-commissioning meeting', ['user-016'], '2025-06-25', 'user-006', '2025-03-10'),
        openItem('ap-005-s1-i3', 'ap-005-s1', 2, 'NDEE air permit compliance demonstration and clearance letter', ['user-016'], '2025-07-20', 'user-006', '2025-03-10'),
        openItem('ap-005-s1-i4', 'ap-005-s1', 3, 'Emergency eyewash/shower stations flow tested and documented', ['user-015'], '2025-07-25', 'user-006', '2025-03-10'),
      ],
    },
    {
      id: 'ap-005-s2', planId: 'ap-005', title: 'Scientific Equipment Installation', order: 1,
      createdAt: d('2025-03-10'), updatedAt: d('2025-03-10'),
      items: [
        inProgressItem('ap-005-s2-i1', 'ap-005-s2', 0, 'Thermo Fisher Apreo 2 SEM PO issued (28-week lead)', ['user-014'], '2025-05-21', 'user-006', '2025-03-10'),
        inProgressItem('ap-005-s2-i2', 'ap-005-s2', 1, 'Waters ACQUITY UPLC mass spectrometer PO issued (22-week lead)', ['user-014'], '2025-05-21', 'user-006', '2025-03-10'),
        openItem('ap-005-s2-i3', 'ap-005-s2', 2, 'Vibration-isolated equipment room (Lab 108) accepted by Thermo Fisher site surveyor', ['user-015'], '2025-07-30', 'user-006', '2025-03-10'),
      ],
    },
    {
      id: 'ap-005-s3', planId: 'ap-005', title: 'Lab Safety & Occupancy', order: 2,
      createdAt: d('2025-03-10'), updatedAt: d('2025-03-10'),
      items: [
        openItem('ap-005-s3-i1', 'ap-005-s3', 0, 'UNL Environmental Health & Safety lab safety inspection complete', ['user-016'], '2025-08-05', 'user-006', '2025-03-10'),
        openItem('ap-005-s3-i2', 'ap-005-s3', 1, 'Faculty lab orientation and hazard training completed', ['user-016'], '2025-08-12', 'user-006', '2025-03-10'),
        openItem('ap-005-s3-i3', 'ap-005-s3', 2, 'College of Education Dean occupancy authorization signed', ['user-003'], '2025-08-18', 'user-006', '2025-03-10', 'Signed authorization on file.'),
      ],
    },
  ],
};

export const actionPlans: ActionPlan[] = [ap001, ap002, ap003, ap004, ap005];
