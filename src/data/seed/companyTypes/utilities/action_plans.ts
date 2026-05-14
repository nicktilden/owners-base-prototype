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

// Action Plan 1: Route 128 Segment B Pre-Construction Readiness Gate
const ap001: ActionPlan = {
  id: 'ap-001', accountId: 'acc-001', projectId: 'proj-001', number: 1,
  title: 'Route 128 Segment B - Pre-Construction Readiness Gate',
  typeId: 'apt-gate', status: 'in_progress', private: false, locationId: null,
  description: 'Pre-construction readiness checklist for mobilizing Segment B (Miles 7-12) ductbank excavation.',
  planManager: 'user-009', approvers: ['user-002', 'user-001'],
  completedReceivers: ['user-001', 'user-002', 'user-003'],
  createdBy: 'user-009', createdAt: d('2026-03-01'), updatedAt: d('2026-04-18'),
  sections: [
    {
      id: 'ap-001-s1', planId: 'ap-001', title: 'Design & Engineering', order: 0,
      createdAt: d('2026-03-01'), updatedAt: d('2026-03-01'),
      items: [
        closedItem('ap-001-s1-i1', 'ap-001-s1', 0, 'Confirm 100% IFC drawings issued for Segment B ductbank', ['user-011'], '2026-04-01', '2026-03-28', 'user-009', '2026-03-01'),
        inProgressItem('ap-001-s1-i2', 'ap-001-s1', 1, 'Eversource joint trench conflict resolution at 4 locations', ['user-015'], '2026-05-01', 'user-009', '2026-03-01'),
        inProgressItem('ap-001-s1-i3', 'ap-001-s1', 2, 'Close 12 outstanding RFIs - ductbank depth and conduit stub-outs', ['user-011'], '2026-04-25', 'user-009', '2026-03-01'),
      ],
    },
    {
      id: 'ap-001-s2', planId: 'ap-001', title: 'Permits & Traffic Control', order: 1,
      createdAt: d('2026-03-01'), updatedAt: d('2026-03-01'),
      items: [
        inProgressItem('ap-001-s2-i1', 'ap-001-s2', 0, 'Burlington DPW TSSR (Traffic Safety & Signing Request) approved', ['user-015'], '2026-04-28', 'user-009', '2026-03-01'),
        closedItem('ap-001-s2-i2', 'ap-001-s2', 1, 'State Highway road opening permit extension obtained', ['user-014'], '2026-04-15', '2026-04-12', 'user-009', '2026-03-01'),
      ],
    },
    {
      id: 'ap-001-s3', planId: 'ap-001', title: 'Subcontractor Readiness', order: 2,
      createdAt: d('2026-03-01'), updatedAt: d('2026-03-01'),
      items: [
        closedItem('ap-001-s3-i1', 'ap-001-s3', 0, 'Cable pulling subcontractor mobilization plan approved', ['user-013'], '2026-04-10', '2026-04-08', 'user-009', '2026-03-01'),
        openItem('ap-001-s3-i2', 'ap-001-s3', 1, 'Segment B EPR cable reels confirmed delivered to staging yard', ['user-015'], '2026-05-10', 'user-009', '2026-03-01'),
      ],
    },
  ],
};

// Action Plan 2: Lawrence Substation Bay 7-18 Energization Gate
const ap002: ActionPlan = {
  id: 'ap-002', accountId: 'acc-001', projectId: 'proj-002', number: 2,
  title: 'Lawrence Substation Bay 7-18 Energization Gate',
  typeId: 'apt-gate', status: 'in_progress', private: false, locationId: null,
  description: 'Formal gate review required before energizing Bays 7-18 of the GIS switchgear.',
  planManager: 'user-009', approvers: ['user-001', 'user-007'],
  completedReceivers: ['user-001', 'user-002', 'user-003', 'user-006'],
  createdBy: 'user-011', createdAt: d('2026-02-01'), updatedAt: d('2026-04-18'),
  sections: [
    {
      id: 'ap-002-s1', planId: 'ap-002', title: 'Protection & Relay Coordination', order: 0,
      createdAt: d('2026-02-01'), updatedAt: d('2026-02-01'),
      items: [
        inProgressItem('ap-002-s1-i1', 'ap-002-s1', 0, 'ABB REL670 relay settings files approved by Keystone OPS Engineering', ['user-013'], '2026-05-15', 'user-011', '2026-02-01', 'Settings files reviewed and approved on file.'),
        openItem('ap-002-s1-i2', 'ap-002-s1', 1, 'ISO-NE protection coordination review submitted and accepted', ['user-009'], '2026-06-01', 'user-011', '2026-02-01'),
        inProgressItem('ap-002-s1-i3', 'ap-002-s1', 2, 'OMICRON relay test reports for all 18 relays completed', ['user-013'], '2026-05-31', 'user-011', '2026-02-01'),
      ],
    },
    {
      id: 'ap-002-s2', planId: 'ap-002', title: 'SCADA & Communications', order: 1,
      createdAt: d('2026-02-01'), updatedAt: d('2026-02-01'),
      items: [
        inProgressItem('ap-002-s2-i1', 'ap-002-s2', 0, 'DNP3 point list tested and accepted - all 18 bays', ['user-014'], '2026-05-20', 'user-011', '2026-02-01'),
        delayedItem('ap-002-s2-i2', 'ap-002-s2', 1, 'Close 16 overdue SCADA integration RFIs', ['user-011'], '2026-04-30', 'user-011', '2026-02-01'),
      ],
    },
    {
      id: 'ap-002-s3', planId: 'ap-002', title: 'Physical Inspection', order: 2,
      createdAt: d('2026-02-01'), updatedAt: d('2026-02-01'),
      items: [
        closedItem('ap-002-s3-i1', 'ap-002-s3', 0, 'SF6 gas pressure checks - all 18 bays at design pressure', ['user-016'], '2026-04-01', '2026-03-30', 'user-011', '2026-02-01'),
        openItem('ap-002-s3-i2', 'ap-002-s3', 1, 'Cable penetration sealing per fire protection spec', ['user-015'], '2026-06-01', 'user-011', '2026-02-01'),
      ],
    },
  ],
};

// Action Plan 3: Lowell WTP PFAS Compliance Interim Test Gate
const ap003: ActionPlan = {
  id: 'ap-003', accountId: 'acc-001', projectId: 'proj-003', number: 3,
  title: 'Lowell WTP - PFAS Compliance Interim Test Gate',
  typeId: 'apt-compliance', status: 'in_progress', private: false, locationId: null,
  description: 'Prerequisites required before conducting interim EPA PFAS compliance test planned for June 2026.',
  planManager: 'user-009', approvers: ['user-001', 'user-007'],
  completedReceivers: ['user-001', 'user-002', 'user-009'],
  createdBy: 'user-011', createdAt: d('2026-03-01'), updatedAt: d('2026-04-15'),
  sections: [
    {
      id: 'ap-003-s1', planId: 'ap-003', title: 'Regulatory Requirements', order: 0,
      createdAt: d('2026-03-01'), updatedAt: d('2026-03-01'),
      items: [
        inProgressItem('ap-003-s1-i1', 'ap-003-s1', 0, 'EPA-approved test method selected (Method 533 or 537.1)', ['user-014'], '2026-05-15', 'user-011', '2026-03-01'),
        openItem('ap-003-s1-i2', 'ap-003-s1', 1, 'MassDEP-certified laboratory engaged and sampling plan approved', ['user-009'], '2026-05-20', 'user-011', '2026-03-01'),
        openItem('ap-003-s1-i3', 'ap-003-s1', 2, 'MassDEP PWS test notification filed (30-day advance)', ['user-011'], '2026-05-01', 'user-011', '2026-03-01'),
      ],
    },
    {
      id: 'ap-003-s2', planId: 'ap-003', title: 'MBR Operational Readiness', order: 1,
      createdAt: d('2026-03-01'), updatedAt: d('2026-03-01'),
      items: [
        inProgressItem('ap-003-s2-i1', 'ap-003-s2', 0, 'All 48 MBR membrane panels installed and operational', ['user-013'], '2026-05-31', 'user-011', '2026-03-01'),
        inProgressItem('ap-003-s2-i2', 'ap-003-s2', 1, 'MBR transmembrane pressure (TMP) baselines established', ['user-016'], '2026-05-15', 'user-011', '2026-03-01'),
        delayedItem('ap-003-s2-i3', 'ap-003-s2', 2, 'Resolve Ovivo panel backorder - confirm delivery of 24 outstanding panels', ['user-013'], '2026-05-01', 'user-011', '2026-03-01'),
      ],
    },
  ],
};

// Action Plan 4: Fitchburg Pipeline PHMSA Pre-Service Inspection Readiness Gate
const ap004: ActionPlan = {
  id: 'ap-004', accountId: 'acc-001', projectId: 'proj-006', number: 4,
  title: 'Fitchburg Pipeline - PHMSA Pre-Service Inspection Readiness Gate',
  typeId: 'apt-gate', status: 'draft', private: false, locationId: null,
  description: 'PHMSA 49 CFR 192.505 hydrostatic test and pre-service inspection prerequisites for the Fitchburg pipeline.',
  planManager: 'user-009', approvers: ['user-001', 'user-007'],
  completedReceivers: ['user-001', 'user-002', 'user-009'],
  createdBy: 'user-011', createdAt: d('2026-04-01'), updatedAt: d('2026-04-01'),
  sections: [
    {
      id: 'ap-004-s1', planId: 'ap-004', title: 'Pipeline Construction Completion', order: 0,
      createdAt: d('2026-04-01'), updatedAt: d('2026-04-01'),
      items: [
        openItem('ap-004-s1-i1', 'ap-004-s1', 0, 'All 18 miles of pipe welded, lowered, and backfilled', ['user-015'], '2026-09-01', 'user-011', '2026-04-01'),
        openItem('ap-004-s1-i2', 'ap-004-s1', 1, 'Three mainline valve stations mechanically complete', ['user-013'], '2026-09-01', 'user-011', '2026-04-01'),
        openItem('ap-004-s1-i3', 'ap-004-s1', 2, 'All weld inspection records reviewed and accepted (100% AUT)', ['user-011'], '2026-09-15', 'user-011', '2026-04-01'),
      ],
    },
    {
      id: 'ap-004-s2', planId: 'ap-004', title: 'Regulatory & Environmental', order: 1,
      createdAt: d('2026-04-01'), updatedAt: d('2026-04-01'),
      items: [
        openItem('ap-004-s2-i1', 'ap-004-s2', 0, 'Archaeological monitor clearance for Mile 11.4 segment', ['user-014'], '2026-06-01', 'user-011', '2026-04-01'),
        openItem('ap-004-s2-i2', 'ap-004-s2', 1, 'National Grid outage authorization confirmed for Winchendon tie-in', ['user-013'], '2026-07-01', 'user-011', '2026-04-01'),
        openItem('ap-004-s2-i3', 'ap-004-s2', 2, 'ROW final cleanup and revegetation completed', ['user-016'], '2026-09-30', 'user-011', '2026-04-01'),
      ],
    },
  ],
};

// Action Plan 5: Worcester Pumping Station Substantial Completion Gate
const ap005: ActionPlan = {
  id: 'ap-005', accountId: 'acc-001', projectId: 'proj-007', number: 5,
  title: 'Worcester Pumping Station No. 4 - Substantial Completion Gate',
  typeId: 'apt-gate', status: 'in_progress', private: false, locationId: null,
  description: 'Formal substantial completion checklist per contract requirements.',
  planManager: 'user-009', approvers: ['user-001', 'user-007'],
  completedReceivers: ['user-001', 'user-002', 'user-003', 'user-009'],
  createdBy: 'user-009', createdAt: d('2026-04-01'), updatedAt: d('2026-04-18'),
  sections: [
    {
      id: 'ap-005-s1', planId: 'ap-005', title: 'Punchlist & Deficiencies', order: 0,
      createdAt: d('2026-04-01'), updatedAt: d('2026-04-01'),
      items: [
        inProgressItem('ap-005-s1-i1', 'ap-005-s1', 0, 'All 44 punchlist items closed or conditionally accepted', ['user-015'], '2026-05-15', 'user-009', '2026-04-01'),
        inProgressItem('ap-005-s1-i2', 'ap-005-s1', 1, 'Generator transfer switch functional test passed', ['user-016'], '2026-05-01', 'user-009', '2026-04-01'),
        openItem('ap-005-s1-i3', 'ap-005-s1', 2, 'SCADA remote monitoring connectivity to SCADA server confirmed', ['user-014'], '2026-05-10', 'user-009', '2026-04-01'),
      ],
    },
    {
      id: 'ap-005-s2', planId: 'ap-005', title: 'Permit & Compliance', order: 1,
      createdAt: d('2026-04-01'), updatedAt: d('2026-04-01'),
      items: [
        openItem('ap-005-s2-i1', 'ap-005-s2', 0, 'MassDEP operational permit transfer to Worcester DPW initiated', ['user-011'], '2026-05-20', 'user-009', '2026-04-01'),
        inProgressItem('ap-005-s2-i2', 'ap-005-s2', 1, 'Final performance test at 12 MGD design capacity completed', ['user-013'], '2026-05-01', 'user-009', '2026-04-01', 'Performance test report signed by Engineer of Record.'),
      ],
    },
    {
      id: 'ap-005-s3', planId: 'ap-005', title: 'Closeout Documents', order: 2,
      createdAt: d('2026-04-01'), updatedAt: d('2026-04-01'),
      items: [
        inProgressItem('ap-005-s3-i1', 'ap-005-s3', 0, 'O&M Manual draft approved by Owner', ['user-013'], '2026-05-15', 'user-009', '2026-04-01'),
        openItem('ap-005-s3-i2', 'ap-005-s3', 1, 'As-built drawings submitted by contractor', ['user-011'], '2026-05-25', 'user-009', '2026-04-01'),
        openItem('ap-005-s3-i3', 'ap-005-s3', 2, 'All spare parts, tools, and commissioning records turned over to Owner', ['user-015'], '2026-05-28', 'user-009', '2026-04-01'),
      ],
    },
  ],
};

export const actionPlans: ActionPlan[] = [ap001, ap002, ap003, ap004, ap005];
