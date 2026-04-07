import type { ActionPlan, ActionPlanItem, ActionPlanSection } from '@/types/action_plans';

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function closedSection(id: string, planId: string, title: string, order: number, items: ActionPlanItem[], createdAt: string): ActionPlanSection {
  return { id, planId, title, order, items, createdAt: d(createdAt), updatedAt: d(createdAt) };
}

// ─── Template section factories ───────────────────────────────────────────────

function tpl001Sections(planId: string, ca: string): ActionPlanSection[] {
  const s1 = planId + '-s1', s2 = planId + '-s2', s3 = planId + '-s3';
  return [
    closedSection(s1, planId, 'Needs Assessment & Business Case', 0, [
      closedItem(s1+'-i1', s1, 0, 'Clinical needs assessment completed', ['user-006','user-009'], ca, ca, 'user-008', ca, 'Signed off by CMO or VP of Clinical Operations.'),
      closedItem(s1+'-i2', s1, 1, 'Preliminary project scope defined', ['user-008'], ca, ca, 'user-008', ca),
      closedItem(s1+'-i3', s1, 2, 'Preliminary budget estimate prepared', ['user-003','user-004'], ca, ca, 'user-008', ca, 'Order-of-magnitude estimate within ±30%.'),
    ], ca),
    closedSection(s2, planId, 'Site & Regulatory Feasibility', 1, [
      closedItem(s2+'-i1', s2, 0, 'Site control or ownership confirmed', ['user-006'], ca, ca, 'user-008', ca),
      closedItem(s2+'-i2', s2, 1, 'Zoning and land-use review completed', ['user-014'], ca, ca, 'user-008', ca),
      closedItem(s2+'-i3', s2, 2, 'Environmental assessment initiated', ['user-014'], ca, ca, 'user-008', ca),
    ], ca),
    closedSection(s3, planId, 'Funding & Board Approval', 2, [
      closedItem(s3+'-i1', s3, 0, 'Capital funding sources identified', ['user-003','user-004'], ca, ca, 'user-008', ca),
      closedItem(s3+'-i2', s3, 1, 'Grant or bond application submitted (if applicable)', ['user-003'], ca, ca, 'user-008', ca),
      closedItem(s3+'-i3', s3, 2, 'Board of Directors approval obtained', ['user-001','user-007'], ca, ca, 'user-008', ca, 'Board resolution or meeting minutes on file.'),
    ], ca),
  ];
}

function tpl002CompleteSections(planId: string, ca: string, due: string): ActionPlanSection[] {
  const s1 = planId + '-s1', s2 = planId + '-s2';
  return [
    closedSection(s1, planId, 'Design Completion', 0, [
      closedItem(s1+'-i1', s1, 0, '100% construction documents issued for permit', ['user-011','user-014'], due, due, 'user-009', ca, 'Architect of record stamps all sheets.'),
      closedItem(s1+'-i2', s1, 1, 'Owner design review and acceptance', ['user-009'], due, due, 'user-009', ca),
      closedItem(s1+'-i3', s1, 2, 'ICRA/ILSM plan reviewed and approved', ['user-009','user-012'], due, due, 'user-009', ca),
      closedItem(s1+'-i4', s1, 3, 'Life safety code compliance review', ['user-014'], due, due, 'user-009', ca),
    ], ca),
    closedSection(s2, planId, 'Regulatory Approvals & Permits', 1, [
      closedItem(s2+'-i1', s2, 0, 'Building permit application submitted', ['user-008'], due, due, 'user-009', ca),
      closedItem(s2+'-i2', s2, 1, 'Building permit issued', ['user-008'], due, due, 'user-009', ca, 'Permit posted on site.'),
      closedItem(s2+'-i3', s2, 2, 'State Health Department plan approval (if required)', ['user-009'], due, due, 'user-009', ca),
      closedItem(s2+'-i4', s2, 3, 'Utility connection approvals obtained', ['user-014'], due, due, 'user-009', ca),
    ], ca),
  ];
}

function tpl002InProgressSections(planId: string, ca: string, due: string): ActionPlanSection[] {
  const s1 = planId + '-s1', s2 = planId + '-s2';
  return [
    { id: s1, planId, title: 'Design Completion', order: 0, createdAt: d(ca), updatedAt: d(ca), items: [
      closedItem(s1+'-i1', s1, 0, '100% construction documents issued for permit', ['user-011','user-014'], due, due, 'user-009', ca),
      closedItem(s1+'-i2', s1, 1, 'Owner design review and acceptance', ['user-009'], due, due, 'user-009', ca),
      inProgressItem(s1+'-i3', s1, 2, 'ICRA/ILSM plan reviewed and approved', ['user-009','user-012'], due, 'user-009', ca),
      openItem(s1+'-i4', s1, 3, 'Life safety code compliance review', ['user-014'], due, 'user-009', ca),
    ]},
    { id: s2, planId, title: 'Regulatory Approvals & Permits', order: 1, createdAt: d(ca), updatedAt: d(ca), items: [
      openItem(s2+'-i1', s2, 0, 'Building permit application submitted', ['user-008'], due, 'user-009', ca),
      openItem(s2+'-i2', s2, 1, 'Building permit issued', ['user-008'], null, 'user-009', ca),
      openItem(s2+'-i3', s2, 2, 'State Health Department plan approval (if required)', ['user-009'], null, 'user-009', ca),
      openItem(s2+'-i4', s2, 3, 'Utility connection approvals obtained', ['user-014'], null, 'user-009', ca),
    ]},
  ];
}

function tpl003CompleteSections(planId: string, ca: string, due: string): ActionPlanSection[] {
  const s1 = planId + '-s1', s2 = planId + '-s2', s3 = planId + '-s3';
  return [
    closedSection(s1, planId, 'Contractor Procurement', 0, [
      closedItem(s1+'-i1', s1, 0, 'GC/CM contract executed', ['user-006','user-008'], due, due, 'user-008', ca),
      closedItem(s1+'-i2', s1, 1, 'GC/CM insurance and bonds verified', ['user-008'], due, due, 'user-008', ca),
      closedItem(s1+'-i3', s1, 2, 'Key subcontractor scopes confirmed', ['user-012'], due, due, 'user-008', ca),
    ], ca),
    closedSection(s2, planId, 'Site Readiness', 1, [
      closedItem(s2+'-i1', s2, 0, 'Pre-construction site survey completed', ['user-013'], due, due, 'user-008', ca),
      closedItem(s2+'-i2', s2, 1, 'Utility locates completed', ['user-013'], due, due, 'user-008', ca),
      closedItem(s2+'-i3', s2, 2, 'Haul routes and site logistics plan approved', ['user-012','user-013'], due, due, 'user-008', ca),
      closedItem(s2+'-i4', s2, 3, 'Patient/staff notification and wayfinding plan in place', ['user-009','user-005'], due, due, 'user-008', ca),
    ], ca),
    closedSection(s3, planId, 'Project Controls Setup', 2, [
      closedItem(s3+'-i1', s3, 0, 'Baseline schedule established and approved', ['user-010','user-011'], due, due, 'user-008', ca),
      closedItem(s3+'-i2', s3, 1, 'Budget control structure (WBS) set up in Procore', ['user-003','user-008'], due, due, 'user-008', ca),
      closedItem(s3+'-i3', s3, 2, 'Submittal register published and GC acknowledged', ['user-011','user-014'], due, due, 'user-008', ca),
    ], ca),
  ];
}

function tpl003InProgressSections(planId: string, ca: string, due: string): ActionPlanSection[] {
  const s1 = planId + '-s1', s2 = planId + '-s2', s3 = planId + '-s3';
  return [
    { id: s1, planId, title: 'Contractor Procurement', order: 0, createdAt: d(ca), updatedAt: d(ca), items: [
      closedItem(s1+'-i1', s1, 0, 'GC/CM contract executed', ['user-006','user-008'], due, due, 'user-008', ca),
      inProgressItem(s1+'-i2', s1, 1, 'GC/CM insurance and bonds verified', ['user-008'], due, 'user-008', ca),
      openItem(s1+'-i3', s1, 2, 'Key subcontractor scopes confirmed', ['user-012'], due, 'user-008', ca),
    ]},
    { id: s2, planId, title: 'Site Readiness', order: 1, createdAt: d(ca), updatedAt: d(ca), items: [
      openItem(s2+'-i1', s2, 0, 'Pre-construction site survey completed', ['user-013'], due, 'user-008', ca),
      openItem(s2+'-i2', s2, 1, 'Utility locates completed', ['user-013'], null, 'user-008', ca),
      openItem(s2+'-i3', s2, 2, 'Haul routes and site logistics plan approved', ['user-012'], null, 'user-008', ca),
      openItem(s2+'-i4', s2, 3, 'Patient/staff notification and wayfinding plan in place', ['user-009'], null, 'user-008', ca),
    ]},
    { id: s3, planId, title: 'Project Controls Setup', order: 2, createdAt: d(ca), updatedAt: d(ca), items: [
      openItem(s3+'-i1', s3, 0, 'Baseline schedule established and approved', ['user-010','user-011'], null, 'user-008', ca),
      openItem(s3+'-i2', s3, 1, 'Budget control structure (WBS) set up in Procore', ['user-003','user-008'], null, 'user-008', ca),
      openItem(s3+'-i3', s3, 2, 'Submittal register published and GC acknowledged', ['user-011'], null, 'user-008', ca),
    ]},
  ];
}

function tpl004CompleteSections(planId: string, ca: string, due: string): ActionPlanSection[] {
  const s1 = planId + '-s1', s2 = planId + '-s2', s3 = planId + '-s3';
  return [
    closedSection(s1, planId, 'Safety & Infection Control', 0, [
      closedItem(s1+'-i1', s1, 0, 'Site safety plan posted and current', ['user-013'], due, due, 'user-009', ca),
      closedItem(s1+'-i2', s1, 1, 'ICRA barriers installed and inspected', ['user-009','user-013'], due, due, 'user-009', ca),
      closedItem(s1+'-i3', s1, 2, 'Hot work permit process active and documented', ['user-015'], due, due, 'user-009', ca),
      closedItem(s1+'-i4', s1, 3, 'Air quality monitoring documented (if clinical area)', ['user-013'], due, due, 'user-009', ca),
    ], ca),
    closedSection(s2, planId, 'Design & Submittals', 1, [
      closedItem(s2+'-i1', s2, 0, 'Critical long-lead submittals approved', ['user-011','user-014'], due, due, 'user-009', ca),
      closedItem(s2+'-i2', s2, 1, 'MEP coordination drawings approved', ['user-011','user-014'], due, due, 'user-009', ca),
      closedItem(s2+'-i3', s2, 2, 'RFI log current and no critical open items', ['user-012'], due, due, 'user-009', ca),
    ], ca),
    closedSection(s3, planId, 'Cost & Schedule Controls', 2, [
      closedItem(s3+'-i1', s3, 0, 'Monthly cost report issued and owner reviewed', ['user-003','user-010'], due, due, 'user-009', ca),
      closedItem(s3+'-i2', s3, 1, 'Schedule 2-week lookahead current and GC approved', ['user-010','user-012'], due, due, 'user-009', ca),
      closedItem(s3+'-i3', s3, 2, 'Owner-furnished equipment delivery schedule confirmed', ['user-010','user-011'], due, due, 'user-009', ca),
    ], ca),
  ];
}

function tpl004InProgressSections(planId: string, ca: string, due: string, withDelayed: boolean): ActionPlanSection[] {
  const s1 = planId + '-s1', s2 = planId + '-s2', s3 = planId + '-s3';
  const s1i3 = withDelayed
    ? delayedItem(s1+'-i3', s1, 2, 'Hot work permit process active and documented', ['user-015'], due, 'user-009', ca)
    : inProgressItem(s1+'-i3', s1, 2, 'Hot work permit process active and documented', ['user-015'], due, 'user-009', ca);
  return [
    { id: s1, planId, title: 'Safety & Infection Control', order: 0, createdAt: d(ca), updatedAt: d(ca), items: [
      closedItem(s1+'-i1', s1, 0, 'Site safety plan posted and current', ['user-013'], due, due, 'user-009', ca),
      closedItem(s1+'-i2', s1, 1, 'ICRA barriers installed and inspected', ['user-009','user-013'], due, due, 'user-009', ca),
      s1i3,
      openItem(s1+'-i4', s1, 3, 'Air quality monitoring documented (if clinical area)', ['user-013'], due, 'user-009', ca),
    ]},
    { id: s2, planId, title: 'Design & Submittals', order: 1, createdAt: d(ca), updatedAt: d(ca), items: [
      closedItem(s2+'-i1', s2, 0, 'Critical long-lead submittals approved', ['user-011','user-014'], due, due, 'user-009', ca),
      inProgressItem(s2+'-i2', s2, 1, 'MEP coordination drawings approved', ['user-011','user-014'], due, 'user-009', ca),
      openItem(s2+'-i3', s2, 2, 'RFI log current and no critical open items', ['user-012'], due, 'user-009', ca),
    ]},
    { id: s3, planId, title: 'Cost & Schedule Controls', order: 2, createdAt: d(ca), updatedAt: d(ca), items: [
      inProgressItem(s3+'-i1', s3, 0, 'Monthly cost report issued and owner reviewed', ['user-003','user-010'], due, 'user-009', ca),
      openItem(s3+'-i2', s3, 1, 'Schedule 2-week lookahead current and GC approved', ['user-010','user-012'], due, 'user-009', ca),
      openItem(s3+'-i3', s3, 2, 'Owner-furnished equipment delivery schedule confirmed', ['user-010','user-011'], null, 'user-009', ca),
    ]},
  ];
}

function tpl005CompleteSections(planId: string, ca: string, due: string): ActionPlanSection[] {
  const s1 = planId + '-s1', s2 = planId + '-s2', s3 = planId + '-s3';
  return [
    closedSection(s1, planId, 'Systems Commissioning', 0, [
      closedItem(s1+'-i1', s1, 0, 'HVAC functional performance testing complete', ['user-012','user-013'], due, due, 'user-009', ca),
      closedItem(s1+'-i2', s1, 1, 'Medical gas systems tested and certified', ['user-012'], due, due, 'user-009', ca),
      closedItem(s1+'-i3', s1, 2, 'Electrical systems energized and tested', ['user-013','user-015'], due, due, 'user-009', ca),
      closedItem(s1+'-i4', s1, 3, 'Nurse call and patient monitoring systems operational', ['user-009','user-013'], due, due, 'user-009', ca),
    ], ca),
    closedSection(s2, planId, 'Regulatory & Occupancy', 1, [
      closedItem(s2+'-i1', s2, 0, 'State Health Department final inspection passed', ['user-009'], due, due, 'user-009', ca),
      closedItem(s2+'-i2', s2, 1, 'Certificate of Occupancy issued', ['user-008'], due, due, 'user-009', ca),
      closedItem(s2+'-i3', s2, 2, 'Fire marshal final inspection passed', ['user-012'], due, due, 'user-009', ca),
    ], ca),
    closedSection(s3, planId, 'Activation & Staff Readiness', 2, [
      closedItem(s3+'-i1', s3, 0, 'Staff orientation and facility walkthrough completed', ['user-005','user-009'], due, due, 'user-009', ca),
      closedItem(s3+'-i2', s3, 1, 'Activation day logistics plan approved', ['user-010'], due, due, 'user-009', ca),
      closedItem(s3+'-i3', s3, 2, 'Equipment tested and clinical staff trained', ['user-005','user-013'], due, due, 'user-009', ca),
    ], ca),
  ];
}

function tpl005InProgressSections(planId: string, ca: string, due: string): ActionPlanSection[] {
  const s1 = planId + '-s1', s2 = planId + '-s2', s3 = planId + '-s3';
  return [
    { id: s1, planId, title: 'Systems Commissioning', order: 0, createdAt: d(ca), updatedAt: d(ca), items: [
      inProgressItem(s1+'-i1', s1, 0, 'HVAC functional performance testing complete', ['user-012','user-013'], due, 'user-009', ca),
      openItem(s1+'-i2', s1, 1, 'Medical gas systems tested and certified', ['user-012'], due, 'user-009', ca),
      openItem(s1+'-i3', s1, 2, 'Electrical systems energized and tested', ['user-013','user-015'], null, 'user-009', ca),
      openItem(s1+'-i4', s1, 3, 'Nurse call and patient monitoring systems operational', ['user-009'], null, 'user-009', ca),
    ]},
    { id: s2, planId, title: 'Regulatory & Occupancy', order: 1, createdAt: d(ca), updatedAt: d(ca), items: [
      openItem(s2+'-i1', s2, 0, 'State Health Department final inspection passed', ['user-009'], null, 'user-009', ca),
      openItem(s2+'-i2', s2, 1, 'Certificate of Occupancy issued', ['user-008'], null, 'user-009', ca),
      openItem(s2+'-i3', s2, 2, 'Fire marshal final inspection passed', ['user-012'], null, 'user-009', ca),
    ]},
    { id: s3, planId, title: 'Activation & Staff Readiness', order: 2, createdAt: d(ca), updatedAt: d(ca), items: [
      openItem(s3+'-i1', s3, 0, 'Staff orientation and facility walkthrough completed', ['user-005','user-009'], null, 'user-009', ca),
      openItem(s3+'-i2', s3, 1, 'Activation day logistics plan approved', ['user-010'], null, 'user-009', ca),
      openItem(s3+'-i3', s3, 2, 'Equipment tested and clinical staff trained', ['user-005'], null, 'user-009', ca),
    ]},
  ];
}

function tpl006CompleteSections(planId: string, ca: string, due: string): ActionPlanSection[] {
  const s1 = planId + '-s1', s2 = planId + '-s2', s3 = planId + '-s3';
  return [
    closedSection(s1, planId, 'Physical Completion', 0, [
      closedItem(s1+'-i1', s1, 0, 'Substantial completion walkthrough conducted', ['user-009','user-012'], due, due, 'user-012', ca),
      closedItem(s1+'-i2', s1, 1, 'Punchlist items resolved and accepted', ['user-012','user-013'], due, due, 'user-012', ca),
      closedItem(s1+'-i3', s1, 2, 'Final inspections and Certificate of Occupancy obtained', ['user-009','user-008'], due, due, 'user-012', ca),
    ], ca),
    closedSection(s2, planId, 'Documentation & Turnover', 1, [
      closedItem(s2+'-i1', s2, 0, 'As-built drawings submitted and archived', ['user-011','user-014'], due, due, 'user-012', ca),
      closedItem(s2+'-i2', s2, 1, 'Warranties and O&M manuals delivered to Facilities', ['user-009','user-017'], due, due, 'user-012', ca),
      closedItem(s2+'-i3', s2, 2, 'CMMS asset data entered', ['user-017'], due, due, 'user-012', ca),
    ], ca),
    closedSection(s3, planId, 'Financial Close', 2, [
      closedItem(s3+'-i1', s3, 0, 'Final GC application for payment approved', ['user-003','user-012'], due, due, 'user-012', ca),
      closedItem(s3+'-i2', s3, 1, 'Final cost report issued and accepted by Finance', ['user-003','user-004'], due, due, 'user-012', ca),
      closedItem(s3+'-i3', s3, 2, 'Project formally closed in Procore and capital accounting', ['user-004','user-008'], due, due, 'user-012', ca),
    ], ca),
  ];
}

function tpl006InProgressSections(planId: string, ca: string, due: string): ActionPlanSection[] {
  const s1 = planId + '-s1', s2 = planId + '-s2', s3 = planId + '-s3';
  return [
    { id: s1, planId, title: 'Physical Completion', order: 0, createdAt: d(ca), updatedAt: d(ca), items: [
      inProgressItem(s1+'-i1', s1, 0, 'Substantial completion walkthrough conducted', ['user-009','user-012'], due, 'user-012', ca),
      openItem(s1+'-i2', s1, 1, 'Punchlist items resolved and accepted', ['user-012','user-013'], due, 'user-012', ca),
      openItem(s1+'-i3', s1, 2, 'Final inspections and Certificate of Occupancy obtained', ['user-009'], null, 'user-012', ca),
    ]},
    { id: s2, planId, title: 'Documentation & Turnover', order: 1, createdAt: d(ca), updatedAt: d(ca), items: [
      openItem(s2+'-i1', s2, 0, 'As-built drawings submitted and archived', ['user-011','user-014'], null, 'user-012', ca),
      openItem(s2+'-i2', s2, 1, 'Warranties and O&M manuals delivered to Facilities', ['user-009','user-017'], null, 'user-012', ca),
      openItem(s2+'-i3', s2, 2, 'CMMS asset data entered', ['user-017'], null, 'user-012', ca),
    ]},
    { id: s3, planId, title: 'Financial Close', order: 2, createdAt: d(ca), updatedAt: d(ca), items: [
      openItem(s3+'-i1', s3, 0, 'Final GC application for payment approved', ['user-003','user-012'], null, 'user-012', ca),
      openItem(s3+'-i2', s3, 1, 'Final cost report issued and accepted by Finance', ['user-003','user-004'], null, 'user-012', ca),
      openItem(s3+'-i3', s3, 2, 'Project formally closed in Procore and capital accounting', ['user-004','user-008'], null, 'user-012', ca),
    ]},
  ];
}

// ─── Plans ────────────────────────────────────────────────────────────────────

export const actionPlans: ActionPlan[] = [

  // proj-001 · St. Joseph Tower · course_of_construction → tpl-001/002/003 complete, tpl-004 in_progress
  { id:'ap-001a', accountId:'acc-001', projectId:'proj-001', number:1, title:'Feasibility & Funding Gate', typeId:'apt-001', status:'complete', private:false, locationId:null, description:'Board-approved gate confirming clinical need, site feasibility, and $285M capital funding.', planManager:'user-008', approvers:['user-001','user-007'], completedReceivers:['user-002','user-004'], sections:tpl001Sections('ap-001a','2022-12-01'), createdBy:'user-008', createdAt:d('2022-10-01'), updatedAt:d('2022-12-01') },
  { id:'ap-001b', accountId:'acc-001', projectId:'proj-001', number:2, title:'Design & Permitting Readiness', typeId:'apt-006', status:'complete', private:false, locationId:null, description:'100% CDs, ICRA plan approval, and building permit issuance for the tower addition.', planManager:'user-009', approvers:['user-008'], completedReceivers:['user-010'], sections:tpl002CompleteSections('ap-001b','2023-03-01','2023-07-01'), createdBy:'user-009', createdAt:d('2023-03-01'), updatedAt:d('2023-07-15') },
  { id:'ap-001c', accountId:'acc-001', projectId:'proj-001', number:3, title:'Preconstruction Checklist', typeId:'apt-002', status:'complete', private:false, locationId:null, description:'All preconstruction activities confirmed prior to NTP.', planManager:'user-008', approvers:['user-009'], completedReceivers:['user-010','user-011'], sections:tpl003CompleteSections('ap-001c','2023-07-15','2023-08-15'), createdBy:'user-008', createdAt:d('2023-07-15'), updatedAt:d('2023-08-15') },
  { id:'ap-001d', accountId:'acc-001', projectId:'proj-001', number:4, title:'Construction Phase Oversight', typeId:'apt-003', status:'in_progress', private:false, locationId:null, description:'Ongoing construction phase checklist tracking safety, design, and cost milestones.', planManager:'user-008', approvers:['user-009'], completedReceivers:['user-010'], sections:tpl004InProgressSections('ap-001d','2023-09-01','2026-06-30',false), createdBy:'user-008', createdAt:d('2023-09-01'), updatedAt:d('2025-03-15') },

  // proj-002 · Holy Cross Outpatient Pavilion · course_of_construction → tpl-001/002/003 complete, tpl-004 in_progress (delayed)
  { id:'ap-002a', accountId:'acc-001', projectId:'proj-002', number:1, title:'Feasibility & Funding Gate', typeId:'apt-001', status:'complete', private:false, locationId:null, description:'Gate approval for the Holy Cross three-story outpatient pavilion.', planManager:'user-008', approvers:['user-001','user-007'], completedReceivers:['user-004'], sections:tpl001Sections('ap-002a','2023-04-01'), createdBy:'user-008', createdAt:d('2023-02-01'), updatedAt:d('2023-04-01') },
  { id:'ap-002b', accountId:'acc-001', projectId:'proj-002', number:2, title:'Design & Permitting Readiness', typeId:'apt-006', status:'complete', private:false, locationId:null, description:'Design completion and permit issuance for Holy Cross Outpatient Pavilion.', planManager:'user-009', approvers:['user-008'], completedReceivers:['user-010'], sections:tpl002CompleteSections('ap-002b','2023-07-01','2023-11-01'), createdBy:'user-009', createdAt:d('2023-07-01'), updatedAt:d('2023-11-15') },
  { id:'ap-002c', accountId:'acc-001', projectId:'proj-002', number:3, title:'Preconstruction Checklist', typeId:'apt-002', status:'complete', private:false, locationId:null, description:'Preconstruction readiness confirmed for Holy Cross Outpatient Pavilion.', planManager:'user-008', approvers:['user-009'], completedReceivers:['user-010','user-011'], sections:tpl003CompleteSections('ap-002c','2023-11-15','2024-01-01'), createdBy:'user-008', createdAt:d('2023-11-15'), updatedAt:d('2024-01-10') },
  { id:'ap-002d', accountId:'acc-001', projectId:'proj-002', number:4, title:'Construction Phase Oversight', typeId:'apt-003', status:'in_progress', private:false, locationId:null, description:'Active construction monitoring — delayed hot work permit compliance.', planManager:'user-009', approvers:['user-008'], completedReceivers:['user-010'], sections:tpl004InProgressSections('ap-002d','2024-01-15','2025-08-31',true), createdBy:'user-009', createdAt:d('2024-01-15'), updatedAt:d('2025-03-20') },

  // proj-003 · Mercy MOB Phase II · course_of_construction → tpl-001/002/003 complete, tpl-004 in_progress
  { id:'ap-003a', accountId:'acc-001', projectId:'proj-003', number:1, title:'Feasibility & Funding Gate', typeId:'apt-001', status:'complete', private:false, locationId:null, description:'Feasibility gate for Mercy MOB Phase II — 6-story specialty physician building.', planManager:'user-008', approvers:['user-001','user-007'], completedReceivers:['user-004'], sections:tpl001Sections('ap-003a','2023-03-01'), createdBy:'user-008', createdAt:d('2023-01-01'), updatedAt:d('2023-03-01') },
  { id:'ap-003b', accountId:'acc-001', projectId:'proj-003', number:2, title:'Design & Permitting Readiness', typeId:'apt-006', status:'complete', private:false, locationId:null, description:'Design and permit completion for Mercy MOB Phase II.', planManager:'user-009', approvers:['user-008'], completedReceivers:['user-010'], sections:tpl002CompleteSections('ap-003b','2023-05-01','2023-09-01'), createdBy:'user-009', createdAt:d('2023-05-01'), updatedAt:d('2023-09-15') },
  { id:'ap-003c', accountId:'acc-001', projectId:'proj-003', number:3, title:'Preconstruction Checklist', typeId:'apt-002', status:'complete', private:false, locationId:null, description:'Preconstruction readiness confirmed for Mercy MOB Phase II.', planManager:'user-008', approvers:['user-009'], completedReceivers:['user-010','user-011'], sections:tpl003CompleteSections('ap-003c','2023-09-15','2023-10-15'), createdBy:'user-008', createdAt:d('2023-09-15'), updatedAt:d('2023-10-15') },
  { id:'ap-003d', accountId:'acc-001', projectId:'proj-003', number:4, title:'Construction Phase Oversight', typeId:'apt-003', status:'in_progress', private:false, locationId:null, description:'Ongoing construction phase oversight for Mercy MOB Phase II.', planManager:'user-009', approvers:['user-008'], completedReceivers:['user-010'], sections:tpl004InProgressSections('ap-003d','2023-11-01','2025-07-31',false), createdBy:'user-009', createdAt:d('2023-11-01'), updatedAt:d('2025-03-10') },

  // proj-004 · St. Mary's Renovation · Pre-Construction → tpl-001+002 complete, tpl-003 in_progress
  { id:'ap-004a', accountId:'acc-001', projectId:'proj-004', number:1, title:'Feasibility & Funding Gate', typeId:'apt-001', status:'complete', private:false, locationId:null, description:"Feasibility gate for St. Mary's patient wing renovation.", planManager:'user-008', approvers:['user-001','user-007'], completedReceivers:['user-004'], sections:tpl001Sections('ap-004a','2023-10-01'), createdBy:'user-008', createdAt:d('2023-08-01'), updatedAt:d('2023-10-01') },
  { id:'ap-004b', accountId:'acc-001', projectId:'proj-004', number:2, title:'Design & Permitting Readiness', typeId:'apt-006', status:'complete', private:false, locationId:null, description:"Design completion and permit readiness for St. Mary's renovation.", planManager:'user-009', approvers:['user-008'], completedReceivers:['user-010'], sections:tpl002CompleteSections('ap-004b','2024-01-01','2024-04-01'), createdBy:'user-009', createdAt:d('2024-001-01'), updatedAt:d('2024-04-15') },
  { id:'ap-004c', accountId:'acc-001', projectId:'proj-004', number:3, title:'Preconstruction Checklist', typeId:'apt-002', status:'in_progress', private:false, locationId:null, description:'Preconstruction activities underway — contract executed, site readiness in progress.', planManager:'user-008', approvers:['user-009'], completedReceivers:['user-010','user-011'], sections:tpl003InProgressSections('ap-004c','2024-04-15','2024-07-01'), createdBy:'user-008', createdAt:d('2024-04-15'), updatedAt:d('2025-03-01') },

  // proj-005 · Loyola Behavioral Health · course_of_construction → tpl-001/002/003 complete, tpl-004 in_progress (delayed)
  { id:'ap-005a', accountId:'acc-001', projectId:'proj-005', number:1, title:'Feasibility & Funding Gate', typeId:'apt-001', status:'complete', private:false, locationId:null, description:'Feasibility gate for the Loyola 96-bed behavioral health facility.', planManager:'user-008', approvers:['user-001','user-007'], completedReceivers:['user-004'], sections:tpl001Sections('ap-005a','2022-11-01'), createdBy:'user-008', createdAt:d('2022-09-01'), updatedAt:d('2022-11-01') },
  { id:'ap-005b', accountId:'acc-001', projectId:'proj-005', number:2, title:'Design & Permitting Readiness', typeId:'apt-006', status:'complete', private:false, locationId:null, description:'Design and permitting readiness for the Loyola Behavioral Health Facility.', planManager:'user-009', approvers:['user-008'], completedReceivers:['user-010'], sections:tpl002CompleteSections('ap-005b','2023-01-01','2023-04-01'), createdBy:'user-009', createdAt:d('2023-01-01'), updatedAt:d('2023-04-15') },
  { id:'ap-005c', accountId:'acc-001', projectId:'proj-005', number:3, title:'Preconstruction Checklist', typeId:'apt-002', status:'complete', private:false, locationId:null, description:'Preconstruction checklist complete for Loyola Behavioral Health Facility.', planManager:'user-008', approvers:['user-009'], completedReceivers:['user-010','user-011'], sections:tpl003CompleteSections('ap-005c','2023-04-15','2023-06-15'), createdBy:'user-008', createdAt:d('2023-04-15'), updatedAt:d('2023-06-15') },
  { id:'ap-005d', accountId:'acc-001', projectId:'proj-005', number:4, title:'Construction Phase Oversight', typeId:'apt-003', status:'in_progress', private:false, locationId:null, description:'Construction phase oversight — delayed items in infection control compliance.', planManager:'user-009', approvers:['user-008'], completedReceivers:['user-010'], sections:tpl004InProgressSections('ap-005d','2023-07-01','2025-10-31',true), createdBy:'user-009', createdAt:d('2023-07-01'), updatedAt:d('2025-03-18') },

  // proj-006 · Chandler Regional · final_design → tpl-001 complete, tpl-002 in_progress
  { id:'ap-006a', accountId:'acc-001', projectId:'proj-006', number:1, title:'Feasibility & Funding Gate', typeId:'apt-001', status:'complete', private:false, locationId:null, description:'Board-approved feasibility gate for Chandler Regional $130M expansion.', planManager:'user-008', approvers:['user-001','user-007'], completedReceivers:['user-004'], sections:tpl001Sections('ap-006a','2023-08-01'), createdBy:'user-008', createdAt:d('2023-06-01'), updatedAt:d('2023-08-01') },
  { id:'ap-006b', accountId:'acc-001', projectId:'proj-006', number:2, title:'Design & Permitting Readiness', typeId:'apt-006', status:'in_progress', private:false, locationId:null, description:'Design and permitting readiness underway — CDs in final review.', planManager:'user-009', approvers:['user-008'], completedReceivers:['user-010'], sections:tpl002InProgressSections('ap-006b','2024-03-01','2025-06-30'), createdBy:'user-009', createdAt:d('2024-03-01'), updatedAt:d('2025-03-25') },

  // proj-007 · St. Francis ED Modernization · post-construction → tpl-001–004 complete, tpl-005 in_progress
  { id:'ap-007a', accountId:'acc-001', projectId:'proj-007', number:1, title:'Feasibility & Funding Gate', typeId:'apt-001', status:'complete', private:false, locationId:null, description:'Feasibility gate for St. Francis ED modernization.', planManager:'user-008', approvers:['user-001','user-007'], completedReceivers:['user-004'], sections:tpl001Sections('ap-007a','2022-08-01'), createdBy:'user-008', createdAt:d('2022-06-01'), updatedAt:d('2022-08-01') },
  { id:'ap-007b', accountId:'acc-001', projectId:'proj-007', number:2, title:'Design & Permitting Readiness', typeId:'apt-006', status:'complete', private:false, locationId:null, description:'Design and permit readiness completed for St. Francis ED Modernization.', planManager:'user-009', approvers:['user-008'], completedReceivers:['user-010'], sections:tpl002CompleteSections('ap-007b','2022-10-01','2023-01-01'), createdBy:'user-009', createdAt:d('2022-10-01'), updatedAt:d('2023-01-15') },
  { id:'ap-007c', accountId:'acc-001', projectId:'proj-007', number:3, title:'Preconstruction Checklist', typeId:'apt-002', status:'complete', private:false, locationId:null, description:'Preconstruction checklist complete for St. Francis ED.', planManager:'user-008', approvers:['user-009'], completedReceivers:['user-010','user-011'], sections:tpl003CompleteSections('ap-007c','2023-01-15','2023-03-15'), createdBy:'user-008', createdAt:d('2023-01-15'), updatedAt:d('2023-03-15') },
  { id:'ap-007d', accountId:'acc-001', projectId:'proj-007', number:4, title:'Construction Phase Oversight', typeId:'apt-003', status:'complete', private:false, locationId:null, description:'Construction phase oversight complete for St. Francis ED Modernization.', planManager:'user-009', approvers:['user-008'], completedReceivers:['user-010'], sections:tpl004CompleteSections('ap-007d','2023-04-01','2024-12-01'), createdBy:'user-009', createdAt:d('2023-04-01'), updatedAt:d('2024-12-15') },
  { id:'ap-007e', accountId:'acc-001', projectId:'proj-007', number:5, title:'Commissioning & Activation', typeId:'apt-004', status:'in_progress', private:false, locationId:null, description:'Systems commissioning and clinical activation underway for the renovated St. Francis ED.', planManager:'user-012', approvers:['user-009'], completedReceivers:['user-008','user-010'], sections:tpl005InProgressSections('ap-007e','2025-01-01','2025-04-30'), createdBy:'user-012', createdAt:d('2025-01-01'), updatedAt:d('2025-03-25') },

  // proj-008 · Trinity Columbus Specialist Office · bidding → tpl-001+002 complete, tpl-003 in_progress
  { id:'ap-008a', accountId:'acc-001', projectId:'proj-008', number:1, title:'Feasibility & Funding Gate', typeId:'apt-001', status:'complete', private:false, locationId:null, description:'Feasibility gate for Trinity Columbus 4-story specialist office building.', planManager:'user-008', approvers:['user-001','user-007'], completedReceivers:['user-004'], sections:tpl001Sections('ap-008a','2024-01-01'), createdBy:'user-008', createdAt:d('2023-10-01'), updatedAt:d('2024-01-01') },
  { id:'ap-008b', accountId:'acc-001', projectId:'proj-008', number:2, title:'Design & Permitting Readiness', typeId:'apt-006', status:'complete', private:false, locationId:null, description:'Design completion and permit issuance for Trinity Columbus specialist office.', planManager:'user-009', approvers:['user-008'], completedReceivers:['user-010'], sections:tpl002CompleteSections('ap-008b','2024-02-01','2024-06-01'), createdBy:'user-009', createdAt:d('2024-02-01'), updatedAt:d('2024-06-15') },
  { id:'ap-008c', accountId:'acc-001', projectId:'proj-008', number:3, title:'Preconstruction Checklist', typeId:'apt-002', status:'in_progress', private:false, locationId:null, description:'Preconstruction checklist in progress — contract in negotiation.', planManager:'user-008', approvers:['user-009'], completedReceivers:['user-010','user-011'], sections:tpl003InProgressSections('ap-008c','2024-06-15','2024-10-01'), createdBy:'user-008', createdAt:d('2024-06-15'), updatedAt:d('2025-03-01') },

  // proj-009 · St. Vincent's Surgical · course_of_construction → tpl-001/002/003 complete, tpl-004 in_progress
  { id:'ap-009a', accountId:'acc-001', projectId:'proj-009', number:1, title:'Feasibility & Funding Gate', typeId:'apt-001', status:'complete', private:false, locationId:null, description:"Feasibility gate for St. Vincent's surgical center expansion.", planManager:'user-008', approvers:['user-001','user-007'], completedReceivers:['user-004'], sections:tpl001Sections('ap-009a','2023-06-01'), createdBy:'user-008', createdAt:d('2023-04-01'), updatedAt:d('2023-06-01') },
  { id:'ap-009b', accountId:'acc-001', projectId:'proj-009', number:2, title:'Design & Permitting Readiness', typeId:'apt-006', status:'complete', private:false, locationId:null, description:"Design and permitting readiness for St. Vincent's Surgical Center.", planManager:'user-009', approvers:['user-008'], completedReceivers:['user-010'], sections:tpl002CompleteSections('ap-009b','2023-08-01','2023-12-01'), createdBy:'user-009', createdAt:d('2023-08-01'), updatedAt:d('2023-12-15') },
  { id:'ap-009c', accountId:'acc-001', projectId:'proj-009', number:3, title:'Preconstruction Checklist', typeId:'apt-002', status:'complete', private:false, locationId:null, description:"Preconstruction checklist complete for St. Vincent's Surgical Center.", planManager:'user-008', approvers:['user-009'], completedReceivers:['user-010','user-011'], sections:tpl003CompleteSections('ap-009c','2023-12-15','2024-01-15'), createdBy:'user-008', createdAt:d('2023-12-15'), updatedAt:d('2024-01-15') },
  { id:'ap-009d', accountId:'acc-001', projectId:'proj-009', number:4, title:'Construction Phase Oversight', typeId:'apt-003', status:'in_progress', private:false, locationId:null, description:"Ongoing construction oversight for St. Vincent's OR renovation.", planManager:'user-009', approvers:['user-008'], completedReceivers:['user-010'], sections:tpl004InProgressSections('ap-009d','2024-02-01','2025-11-30',false), createdBy:'user-009', createdAt:d('2024-02-01'), updatedAt:d('2025-03-12') },

  // proj-010 · Marian Medical Outpatient Clinic · permitting → tpl-001 complete, tpl-002 in_progress
  { id:'ap-010a', accountId:'acc-001', projectId:'proj-010', number:1, title:'Feasibility & Funding Gate', typeId:'apt-001', status:'complete', private:false, locationId:null, description:'Feasibility gate for the Marian Medical standalone outpatient clinic.', planManager:'user-008', approvers:['user-001','user-007'], completedReceivers:['user-004'], sections:tpl001Sections('ap-010a','2024-01-01'), createdBy:'user-008', createdAt:d('2023-11-01'), updatedAt:d('2024-01-01') },
  { id:'ap-010b', accountId:'acc-001', projectId:'proj-010', number:2, title:'Design & Permitting Readiness', typeId:'apt-006', status:'in_progress', private:false, locationId:null, description:'Permit application submitted — state health review pending.', planManager:'user-009', approvers:['user-008'], completedReceivers:['user-010'], sections:tpl002InProgressSections('ap-010b','2024-07-01','2025-03-31'), createdBy:'user-009', createdAt:d('2024-07-01'), updatedAt:d('2025-03-20') },

  // proj-011 · Mercy Health Research Institute · on_hold/feasibility → tpl-001 draft (incomplete)
  { id:'ap-011a', accountId:'acc-001', projectId:'proj-011', number:1, title:'Feasibility & Funding Gate', typeId:'apt-001', status:'draft', private:false, locationId:null, description:'On hold pending federal grant award — feasibility gate only partially complete.', planManager:null, approvers:['user-001','user-007'], completedReceivers:['user-004'],
    sections:[
      { id:'ap-011a-s1', planId:'ap-011a', title:'Needs Assessment & Business Case', order:0, createdAt:d('2023-01-15'), updatedAt:d('2023-06-01'), items:[
        closedItem('ap-011a-s1-i1','ap-011a-s1',0,'Clinical needs assessment completed',['user-006','user-009'],'2023-04-01','2023-03-28','user-008','2023-01-15'),
        inProgressItem('ap-011a-s1-i2','ap-011a-s1',1,'Preliminary project scope defined',['user-008'],'2023-09-01','user-008','2023-01-15'),
        openItem('ap-011a-s1-i3','ap-011a-s1',2,'Preliminary budget estimate prepared',['user-003','user-004'],null,'user-008','2023-01-15'),
      ]},
      { id:'ap-011a-s2', planId:'ap-011a', title:'Site & Regulatory Feasibility', order:1, createdAt:d('2023-01-15'), updatedAt:d('2023-01-15'), items:[
        openItem('ap-011a-s2-i1','ap-011a-s2',0,'Site control or ownership confirmed',['user-006'],null,'user-008','2023-01-15'),
        openItem('ap-011a-s2-i2','ap-011a-s2',1,'Zoning and land-use review completed',['user-014'],null,'user-008','2023-01-15'),
        openItem('ap-011a-s2-i3','ap-011a-s2',2,'Environmental assessment initiated',['user-014'],null,'user-008','2023-01-15'),
      ]},
      { id:'ap-011a-s3', planId:'ap-011a', title:'Funding & Board Approval', order:2, createdAt:d('2023-01-15'), updatedAt:d('2023-01-15'), items:[
        openItem('ap-011a-s3-i1','ap-011a-s3',0,'Capital funding sources identified',['user-003','user-004'],null,'user-008','2023-01-15'),
        openItem('ap-011a-s3-i2','ap-011a-s3',1,'Grant or bond application submitted (if applicable)',['user-003'],null,'user-008','2023-01-15'),
        openItem('ap-011a-s3-i3','ap-011a-s3',2,'Board of Directors approval obtained',['user-001','user-007'],null,'user-008','2023-01-15'),
      ]},
    ], createdBy:'user-008', createdAt:d('2023-01-15'), updatedAt:d('2023-06-01') },

  // proj-012 · St. Joseph Livonia Parking · on_hold/final_design → tpl-001 complete, tpl-002 draft (stalled)
  { id:'ap-012a', accountId:'acc-001', projectId:'proj-012', number:1, title:'Feasibility & Funding Gate', typeId:'apt-001', status:'complete', private:false, locationId:null, description:'Feasibility gate for St. Joseph Livonia 600-space parking structure.', planManager:'user-008', approvers:['user-001','user-007'], completedReceivers:['user-004'], sections:tpl001Sections('ap-012a','2023-03-01'), createdBy:'user-008', createdAt:d('2023-01-01'), updatedAt:d('2023-03-01') },
  { id:'ap-012b', accountId:'acc-001', projectId:'proj-012', number:2, title:'Design & Permitting Readiness', typeId:'apt-006', status:'draft', private:false, locationId:null, description:'CDs complete but permit submission paused due to budget reallocation.', planManager:'user-009', approvers:['user-008'], completedReceivers:['user-010'], sections:tpl002InProgressSections('ap-012b','2023-08-01','2024-06-30'), createdBy:'user-009', createdAt:d('2023-08-01'), updatedAt:d('2023-11-01') },

  // proj-013 · Trinity Baton Rouge MOB · on_hold/Pre-Construction → tpl-001+002 complete, tpl-003 draft (stalled)
  { id:'ap-013a', accountId:'acc-001', projectId:'proj-013', number:1, title:'Feasibility & Funding Gate', typeId:'apt-001', status:'complete', private:false, locationId:null, description:'Feasibility gate for Trinity Baton Rouge 5-story MOB.', planManager:'user-008', approvers:['user-001','user-007'], completedReceivers:['user-004'], sections:tpl001Sections('ap-013a','2023-06-01'), createdBy:'user-008', createdAt:d('2023-04-01'), updatedAt:d('2023-06-01') },
  { id:'ap-013b', accountId:'acc-001', projectId:'proj-013', number:2, title:'Design & Permitting Readiness', typeId:'apt-006', status:'complete', private:false, locationId:null, description:'Design and permitting readiness complete for Trinity Baton Rouge MOB.', planManager:'user-009', approvers:['user-008'], completedReceivers:['user-010'], sections:tpl002CompleteSections('ap-013b','2023-07-01','2023-11-01'), createdBy:'user-009', createdAt:d('2023-07-01'), updatedAt:d('2023-11-15') },
  { id:'ap-013c', accountId:'acc-001', projectId:'proj-013', number:3, title:'Preconstruction Checklist', typeId:'apt-002', status:'draft', private:false, locationId:null, description:'Stalled — project on hold pending zoning variance and environmental review.', planManager:null, approvers:['user-009'], completedReceivers:['user-010'], sections:tpl003InProgressSections('ap-013c','2024-01-01','2024-07-01'), createdBy:'user-008', createdAt:d('2024-01-01'), updatedAt:d('2024-02-01') },

  // proj-014 · Sequoia Imaging Center · on_hold/permitting → tpl-001 complete, tpl-002 draft (stalled)
  { id:'ap-014a', accountId:'acc-001', projectId:'proj-014', number:1, title:'Feasibility & Funding Gate', typeId:'apt-001', status:'complete', private:false, locationId:null, description:'Feasibility gate for Sequoia Hospital imaging suite expansion.', planManager:'user-008', approvers:['user-001','user-007'], completedReceivers:['user-004'], sections:tpl001Sections('ap-014a','2023-10-01'), createdBy:'user-008', createdAt:d('2023-08-01'), updatedAt:d('2023-10-01') },
  { id:'ap-014b', accountId:'acc-001', projectId:'proj-014', number:2, title:'Design & Permitting Readiness', typeId:'apt-006', status:'draft', private:false, locationId:null, description:'Permit submission paused pending MRI equipment procurement lead time resolution.', planManager:'user-009', approvers:['user-008'], completedReceivers:['user-010'], sections:tpl002InProgressSections('ap-014b','2024-04-01','2025-03-31'), createdBy:'user-009', createdAt:d('2024-04-01'), updatedAt:d('2024-07-01') },

  // proj-015 · Holy Redeemer Cafeteria · inactive/closeout → tpl-001–005 complete, tpl-006 in_progress
  { id:'ap-015a', accountId:'acc-001', projectId:'proj-015', number:1, title:'Feasibility & Funding Gate', typeId:'apt-001', status:'complete', private:false, locationId:null, description:'Feasibility gate for Holy Redeemer Hospital cafeteria and kitchen renovation.', planManager:'user-008', approvers:['user-001'], completedReceivers:['user-004'], sections:tpl001Sections('ap-015a','2022-10-01'), createdBy:'user-008', createdAt:d('2022-08-01'), updatedAt:d('2022-10-01') },
  { id:'ap-015b', accountId:'acc-001', projectId:'proj-015', number:2, title:'Design & Permitting Readiness', typeId:'apt-006', status:'complete', private:false, locationId:null, description:'Design and permits complete for Holy Redeemer cafeteria renovation.', planManager:'user-009', approvers:['user-008'], completedReceivers:['user-010'], sections:tpl002CompleteSections('ap-015b','2022-11-01','2023-01-01'), createdBy:'user-009', createdAt:d('2022-11-01'), updatedAt:d('2023-01-15') },
  { id:'ap-015c', accountId:'acc-001', projectId:'proj-015', number:3, title:'Preconstruction Checklist', typeId:'apt-002', status:'complete', private:false, locationId:null, description:'Preconstruction complete for Holy Redeemer cafeteria renovation.', planManager:'user-008', approvers:['user-009'], completedReceivers:['user-010'], sections:tpl003CompleteSections('ap-015c','2023-01-15','2023-02-01'), createdBy:'user-008', createdAt:d('2023-01-15'), updatedAt:d('2023-02-01') },
  { id:'ap-015d', accountId:'acc-001', projectId:'proj-015', number:4, title:'Construction Phase Oversight', typeId:'apt-003', status:'complete', private:false, locationId:null, description:'Construction phase oversight complete for Holy Redeemer cafeteria renovation.', planManager:'user-009', approvers:['user-008'], completedReceivers:['user-010'], sections:tpl004CompleteSections('ap-015d','2023-02-01','2024-05-01'), createdBy:'user-009', createdAt:d('2023-02-01'), updatedAt:d('2024-05-15') },
  { id:'ap-015e', accountId:'acc-001', projectId:'proj-015', number:5, title:'Commissioning & Activation', typeId:'apt-004', status:'complete', private:false, locationId:null, description:'Kitchen commissioning and staff activation complete.', planManager:'user-012', approvers:['user-009'], completedReceivers:['user-008'], sections:tpl005CompleteSections('ap-015e','2024-05-15','2024-06-01'), createdBy:'user-012', createdAt:d('2024-05-15'), updatedAt:d('2024-06-15') },
  { id:'ap-015f', accountId:'acc-001', projectId:'proj-015', number:6, title:'Project Close-out', typeId:'apt-005', status:'in_progress', private:false, locationId:null, description:'Closeout plan in progress — final punch items being resolved.', planManager:'user-012', approvers:['user-009'], completedReceivers:['user-008','user-010'], sections:tpl006InProgressSections('ap-015f','2024-06-15','2024-08-30'), createdBy:'user-012', createdAt:d('2024-06-15'), updatedAt:d('2025-01-15') },

  // proj-016 · St. Elizabeth HVAC · inactive/maintenance → all 6 complete
  { id:'ap-016a', accountId:'acc-001', projectId:'proj-016', number:1, title:'Feasibility & Funding Gate', typeId:'apt-001', status:'complete', private:false, locationId:null, description:'Feasibility gate for St. Elizabeth rooftop HVAC replacement.', planManager:'user-008', approvers:['user-001'], completedReceivers:['user-004'], sections:tpl001Sections('ap-016a','2022-05-01'), createdBy:'user-008', createdAt:d('2022-03-01'), updatedAt:d('2022-05-01') },
  { id:'ap-016b', accountId:'acc-001', projectId:'proj-016', number:2, title:'Design & Permitting Readiness', typeId:'apt-006', status:'complete', private:false, locationId:null, description:'Design and permits complete for St. Elizabeth HVAC replacement.', planManager:'user-009', approvers:['user-008'], completedReceivers:['user-010'], sections:tpl002CompleteSections('ap-016b','2022-05-15','2022-08-01'), createdBy:'user-009', createdAt:d('2022-05-15'), updatedAt:d('2022-08-15') },
  { id:'ap-016c', accountId:'acc-001', projectId:'proj-016', number:3, title:'Preconstruction Checklist', typeId:'apt-002', status:'complete', private:false, locationId:null, description:'Preconstruction complete for St. Elizabeth HVAC replacement.', planManager:'user-008', approvers:['user-009'], completedReceivers:['user-010'], sections:tpl003CompleteSections('ap-016c','2022-08-15','2022-09-01'), createdBy:'user-008', createdAt:d('2022-08-15'), updatedAt:d('2022-09-01') },
  { id:'ap-016d', accountId:'acc-001', projectId:'proj-016', number:4, title:'Construction Phase Oversight', typeId:'apt-003', status:'complete', private:false, locationId:null, description:'Construction phase oversight complete for St. Elizabeth HVAC replacement.', planManager:'user-009', approvers:['user-008'], completedReceivers:['user-010'], sections:tpl004CompleteSections('ap-016d','2022-09-01','2023-11-01'), createdBy:'user-009', createdAt:d('2022-09-01'), updatedAt:d('2023-11-15') },
  { id:'ap-016e', accountId:'acc-001', projectId:'proj-016', number:5, title:'Commissioning & Activation', typeId:'apt-004', status:'complete', private:false, locationId:null, description:'HVAC commissioning and systems activation complete.', planManager:'user-012', approvers:['user-009'], completedReceivers:['user-008'], sections:tpl005CompleteSections('ap-016e','2023-11-15','2024-02-01'), createdBy:'user-012', createdAt:d('2023-11-15'), updatedAt:d('2024-02-15') },
  { id:'ap-016f', accountId:'acc-001', projectId:'proj-016', number:6, title:'Project Close-out', typeId:'apt-005', status:'complete', private:false, locationId:null, description:'Project close-out complete for St. Elizabeth HVAC replacement.', planManager:'user-012', approvers:['user-009'], completedReceivers:['user-008','user-010'], sections:tpl006CompleteSections('ap-016f','2024-02-15','2024-03-15'), createdBy:'user-012', createdAt:d('2024-02-15'), updatedAt:d('2024-03-31') },

  // proj-017 · OLOL MOB Fit-Out · inactive/handover → tpl-001–005 complete, tpl-006 in_progress
  { id:'ap-017a', accountId:'acc-001', projectId:'proj-017', number:1, title:'Feasibility & Funding Gate', typeId:'apt-001', status:'complete', private:false, locationId:null, description:'Feasibility gate for OLOL MOB interior fit-out of three floors.', planManager:'user-008', approvers:['user-001'], completedReceivers:['user-004'], sections:tpl001Sections('ap-017a','2022-10-01'), createdBy:'user-008', createdAt:d('2022-08-01'), updatedAt:d('2022-10-01') },
  { id:'ap-017b', accountId:'acc-001', projectId:'proj-017', number:2, title:'Design & Permitting Readiness', typeId:'apt-006', status:'complete', private:false, locationId:null, description:'Design and permits complete for OLOL MOB fit-out.', planManager:'user-009', approvers:['user-008'], completedReceivers:['user-010'], sections:tpl002CompleteSections('ap-017b','2022-11-01','2023-02-01'), createdBy:'user-009', createdAt:d('2022-11-01'), updatedAt:d('2023-02-15') },
  { id:'ap-017c', accountId:'acc-001', projectId:'proj-017', number:3, title:'Preconstruction Checklist', typeId:'apt-002', status:'complete', private:false, locationId:null, description:'Preconstruction checklist complete for OLOL MOB fit-out.', planManager:'user-008', approvers:['user-009'], completedReceivers:['user-010'], sections:tpl003CompleteSections('ap-017c','2023-02-15','2023-03-01'), createdBy:'user-008', createdAt:d('2023-02-15'), updatedAt:d('2023-03-01') },
  { id:'ap-017d', accountId:'acc-001', projectId:'proj-017', number:4, title:'Construction Phase Oversight', typeId:'apt-003', status:'complete', private:false, locationId:null, description:'Construction phase oversight complete for OLOL MOB fit-out.', planManager:'user-009', approvers:['user-008'], completedReceivers:['user-010'], sections:tpl004CompleteSections('ap-017d','2023-03-01','2024-07-01'), createdBy:'user-009', createdAt:d('2023-03-01'), updatedAt:d('2024-07-15') },
  { id:'ap-017e', accountId:'acc-001', projectId:'proj-017', number:5, title:'Commissioning & Activation', typeId:'apt-004', status:'complete', private:false, locationId:null, description:'Systems commissioning and clinical activation complete for OLOL MOB.', planManager:'user-012', approvers:['user-009'], completedReceivers:['user-008'], sections:tpl005CompleteSections('ap-017e','2024-07-15','2024-08-01'), createdBy:'user-012', createdAt:d('2024-07-15'), updatedAt:d('2024-08-15') },
  { id:'ap-017f', accountId:'acc-001', projectId:'proj-017', number:6, title:'Project Close-out', typeId:'apt-005', status:'in_progress', private:false, locationId:null, description:'Project close-out underway — as-builts and warranties being collected.', planManager:'user-012', approvers:['user-009'], completedReceivers:['user-008','user-010'], sections:tpl006InProgressSections('ap-017f','2024-08-15','2024-10-31'), createdBy:'user-012', createdAt:d('2024-08-15'), updatedAt:d('2025-02-01') },

  // proj-018 · Dominican Chapel Restoration · inactive/closeout → tpl-001–005 complete, tpl-006 in_progress
  { id:'ap-018a', accountId:'acc-001', projectId:'proj-018', number:1, title:'Feasibility & Funding Gate', typeId:'apt-001', status:'complete', private:false, locationId:null, description:'Feasibility gate for Dominican Hospital historic chapel restoration.', planManager:'user-008', approvers:['user-001'], completedReceivers:['user-004'], sections:tpl001Sections('ap-018a','2023-01-01'), createdBy:'user-008', createdAt:d('2022-11-01'), updatedAt:d('2023-01-01') },
  { id:'ap-018b', accountId:'acc-001', projectId:'proj-018', number:2, title:'Design & Permitting Readiness', typeId:'apt-006', status:'complete', private:false, locationId:null, description:'Historic preservation permits and design approvals obtained for Dominican chapel.', planManager:'user-009', approvers:['user-008'], completedReceivers:['user-010'], sections:tpl002CompleteSections('ap-018b','2023-01-15','2023-04-01'), createdBy:'user-009', createdAt:d('2023-01-15'), updatedAt:d('2023-04-15') },
  { id:'ap-018c', accountId:'acc-001', projectId:'proj-018', number:3, title:'Preconstruction Checklist', typeId:'apt-002', status:'complete', private:false, locationId:null, description:'Preconstruction checklist complete for Dominican chapel restoration.', planManager:'user-008', approvers:['user-009'], completedReceivers:['user-010'], sections:tpl003CompleteSections('ap-018c','2023-04-15','2023-05-01'), createdBy:'user-008', createdAt:d('2023-04-15'), updatedAt:d('2023-05-01') },
  { id:'ap-018d', accountId:'acc-001', projectId:'proj-018', number:4, title:'Construction Phase Oversight', typeId:'apt-003', status:'complete', private:false, locationId:null, description:'Construction phase oversight complete for Dominican chapel restoration.', planManager:'user-009', approvers:['user-008'], completedReceivers:['user-010'], sections:tpl004CompleteSections('ap-018d','2023-05-01','2024-06-01'), createdBy:'user-009', createdAt:d('2023-05-01'), updatedAt:d('2024-06-15') },
  { id:'ap-018e', accountId:'acc-001', projectId:'proj-018', number:5, title:'Commissioning & Activation', typeId:'apt-004', status:'complete', private:false, locationId:null, description:'Commissioning complete for Dominican chapel restoration.', planManager:'user-012', approvers:['user-009'], completedReceivers:['user-008'], sections:tpl005CompleteSections('ap-018e','2024-06-15','2024-07-01'), createdBy:'user-012', createdAt:d('2024-06-15'), updatedAt:d('2024-07-15') },
  { id:'ap-018f', accountId:'acc-001', projectId:'proj-018', number:6, title:'Project Close-out', typeId:'apt-005', status:'in_progress', private:false, locationId:null, description:'Project close-out in progress — financial close pending.', planManager:'user-012', approvers:['user-009'], completedReceivers:['user-008','user-010'], sections:tpl006InProgressSections('ap-018f','2024-07-15','2024-10-31'), createdBy:'user-012', createdAt:d('2024-07-15'), updatedAt:d('2025-01-20') },

  // proj-019 · Lourdes Helipad · cancelled/conceptual → tpl-001 draft only
  { id:'ap-019a', accountId:'acc-001', projectId:'proj-019', number:1, title:'Feasibility & Funding Gate', typeId:'apt-001', status:'draft', private:false, locationId:null, description:'Cancelled following FAA airspace review denial — gate was never completed.', planManager:null, approvers:['user-001'], completedReceivers:[],
    sections:[
      { id:'ap-019a-s1', planId:'ap-019a', title:'Needs Assessment & Business Case', order:0, createdAt:d('2023-10-01'), updatedAt:d('2023-10-01'), items:[
        inProgressItem('ap-019a-s1-i1','ap-019a-s1',0,'Clinical needs assessment completed',['user-006'],'2023-12-01','user-008','2023-10-01'),
        openItem('ap-019a-s1-i2','ap-019a-s1',1,'Preliminary project scope defined',['user-008'],null,'user-008','2023-10-01'),
        openItem('ap-019a-s1-i3','ap-019a-s1',2,'Preliminary budget estimate prepared',['user-003'],null,'user-008','2023-10-01'),
      ]},
      { id:'ap-019a-s2', planId:'ap-019a', title:'Site & Regulatory Feasibility', order:1, createdAt:d('2023-10-01'), updatedAt:d('2023-10-01'), items:[
        openItem('ap-019a-s2-i1','ap-019a-s2',0,'Site control or ownership confirmed',['user-006'],null,'user-008','2023-10-01'),
        openItem('ap-019a-s2-i2','ap-019a-s2',1,'Zoning and land-use review completed',['user-014'],null,'user-008','2023-10-01'),
        openItem('ap-019a-s2-i3','ap-019a-s2',2,'Environmental assessment initiated',['user-014'],null,'user-008','2023-10-01'),
      ]},
      { id:'ap-019a-s3', planId:'ap-019a', title:'Funding & Board Approval', order:2, createdAt:d('2023-10-01'), updatedAt:d('2023-10-01'), items:[
        openItem('ap-019a-s3-i1','ap-019a-s3',0,'Capital funding sources identified',['user-003'],null,'user-008','2023-10-01'),
        openItem('ap-019a-s3-i2','ap-019a-s3',1,'Grant or bond application submitted (if applicable)',['user-003'],null,'user-008','2023-10-01'),
        openItem('ap-019a-s3-i3','ap-019a-s3',2,'Board of Directors approval obtained',['user-001'],null,'user-008','2023-10-01'),
      ]},
    ], createdBy:'user-008', createdAt:d('2023-10-01'), updatedAt:d('2023-10-01') },

  // proj-020 · Resurrection Health Satellite Clinic · cancelled/feasibility → tpl-001 draft only
  { id:'ap-020a', accountId:'acc-001', projectId:'proj-020', number:1, title:'Feasibility & Funding Gate', typeId:'apt-001', status:'draft', private:false, locationId:null, description:'Cancelled when lease negotiations fell through — feasibility gate only partially complete.', planManager:null, approvers:['user-001'], completedReceivers:[],
    sections:[
      { id:'ap-020a-s1', planId:'ap-020a', title:'Needs Assessment & Business Case', order:0, createdAt:d('2024-01-01'), updatedAt:d('2024-01-01'), items:[
        closedItem('ap-020a-s1-i1','ap-020a-s1',0,'Clinical needs assessment completed',['user-006'],'2024-03-01','2024-02-25','user-008','2024-01-01'),
        inProgressItem('ap-020a-s1-i2','ap-020a-s1',1,'Preliminary project scope defined',['user-008'],'2024-04-01','user-008','2024-01-01'),
        openItem('ap-020a-s1-i3','ap-020a-s1',2,'Preliminary budget estimate prepared',['user-003'],null,'user-008','2024-01-01'),
      ]},
      { id:'ap-020a-s2', planId:'ap-020a', title:'Site & Regulatory Feasibility', order:1, createdAt:d('2024-01-01'), updatedAt:d('2024-01-01'), items:[
        openItem('ap-020a-s2-i1','ap-020a-s2',0,'Site control or ownership confirmed',['user-006'],null,'user-008','2024-01-01'),
        openItem('ap-020a-s2-i2','ap-020a-s2',1,'Zoning and land-use review completed',['user-014'],null,'user-008','2024-01-01'),
        openItem('ap-020a-s2-i3','ap-020a-s2',2,'Environmental assessment initiated',['user-014'],null,'user-008','2024-01-01'),
      ]},
      { id:'ap-020a-s3', planId:'ap-020a', title:'Funding & Board Approval', order:2, createdAt:d('2024-01-01'), updatedAt:d('2024-01-01'), items:[
        openItem('ap-020a-s3-i1','ap-020a-s3',0,'Capital funding sources identified',['user-003'],null,'user-008','2024-01-01'),
        openItem('ap-020a-s3-i2','ap-020a-s3',1,'Grant or bond application submitted (if applicable)',['user-003'],null,'user-008','2024-01-01'),
        openItem('ap-020a-s3-i3','ap-020a-s3',2,'Board of Directors approval obtained',['user-001'],null,'user-008','2024-01-01'),
      ]},
    ], createdBy:'user-008', createdAt:d('2024-01-01'), updatedAt:d('2024-02-01') },
];
