import type { ActionPlanType, ActionPlanTemplate } from '@/types/action_plans';

/**
 * ACTION PLAN TYPES — Trinity Health account-level configurable types.
 */
export const actionPlanTypes: ActionPlanType[] = [
  { id: 'apt-001', accountId: 'acc-001', name: 'Stage Gate',             active: true, createdAt: new Date('2023-04-01'), updatedAt: new Date('2023-04-01') },
  { id: 'apt-002', accountId: 'acc-001', name: 'Preconstruction',        active: true, createdAt: new Date('2023-04-01'), updatedAt: new Date('2023-04-01') },
  { id: 'apt-003', accountId: 'acc-001', name: 'Construction Phase',     active: true, createdAt: new Date('2023-04-01'), updatedAt: new Date('2023-04-01') },
  { id: 'apt-004', accountId: 'acc-001', name: 'Commissioning',          active: true, createdAt: new Date('2023-04-01'), updatedAt: new Date('2023-04-01') },
  { id: 'apt-005', accountId: 'acc-001', name: 'Project Close-out',      active: true, createdAt: new Date('2023-04-01'), updatedAt: new Date('2023-04-01') },
  { id: 'apt-006', accountId: 'acc-001', name: 'Design & Permitting',    active: true, createdAt: new Date('2023-04-01'), updatedAt: new Date('2023-04-01') },
];

/**
 * ACTION PLAN TEMPLATES — 6 account-level templates for Trinity Health.
 * These are the reusable shells applied to projects. The resulting plans
 * are fully detached from the template after creation.
 *
 * Template IDs:
 *   tpl-001  Feasibility & Funding Gate         (apt-001 Stage Gate)
 *   tpl-002  Design & Permitting Readiness      (apt-006 Design & Permitting)
 *   tpl-003  Preconstruction Checklist          (apt-002 Preconstruction)
 *   tpl-004  Construction Phase Oversight       (apt-003 Construction Phase)
 *   tpl-005  Commissioning & Activation         (apt-004 Commissioning)
 *   tpl-006  Project Close-out                  (apt-005 Project Close-out)
 */
export const actionPlanTemplates: ActionPlanTemplate[] = [

  // ── TEMPLATE 1: Feasibility & Funding Gate ───────────────────────────────
  {
    id: 'tpl-001',
    accountId: 'acc-001',
    name: 'Feasibility & Funding Gate',
    typeId: 'apt-001',
    description: 'Gate review confirming project feasibility, funding authorization, and board-level approvals before advancing to design.',
    private: false,
    sections: [
      {
        id: 'tpl-001-s1', templateId: 'tpl-001', title: 'Needs Assessment & Business Case', order: 0,
        items: [
          { id: 'tpl-001-s1-i1', sectionId: 'tpl-001-s1', order: 0, title: 'Clinical needs assessment completed', acceptanceCriteria: 'Signed off by CMO or VP of Clinical Operations.' },
          { id: 'tpl-001-s1-i2', sectionId: 'tpl-001-s1', order: 1, title: 'Preliminary project scope defined', acceptanceCriteria: null },
          { id: 'tpl-001-s1-i3', sectionId: 'tpl-001-s1', order: 2, title: 'Preliminary budget estimate prepared', acceptanceCriteria: 'Order-of-magnitude estimate within ±30%.' },
        ],
      },
      {
        id: 'tpl-001-s2', templateId: 'tpl-001', title: 'Site & Regulatory Feasibility', order: 1,
        items: [
          { id: 'tpl-001-s2-i1', sectionId: 'tpl-001-s2', order: 0, title: 'Site control or ownership confirmed', acceptanceCriteria: null },
          { id: 'tpl-001-s2-i2', sectionId: 'tpl-001-s2', order: 1, title: 'Zoning and land-use review completed', acceptanceCriteria: null },
          { id: 'tpl-001-s2-i3', sectionId: 'tpl-001-s2', order: 2, title: 'Environmental assessment initiated', acceptanceCriteria: null },
        ],
      },
      {
        id: 'tpl-001-s3', templateId: 'tpl-001', title: 'Funding & Board Approval', order: 2,
        items: [
          { id: 'tpl-001-s3-i1', sectionId: 'tpl-001-s3', order: 0, title: 'Capital funding sources identified', acceptanceCriteria: null },
          { id: 'tpl-001-s3-i2', sectionId: 'tpl-001-s3', order: 1, title: 'Grant or bond application submitted (if applicable)', acceptanceCriteria: null },
          { id: 'tpl-001-s3-i3', sectionId: 'tpl-001-s3', order: 2, title: 'Board of Directors approval obtained', acceptanceCriteria: 'Board resolution or meeting minutes on file.' },
        ],
      },
    ],
    createdBy: 'user-008',
    createdAt: new Date('2023-04-15'),
    updatedAt: new Date('2023-04-15'),
  },

  // ── TEMPLATE 2: Design & Permitting Readiness ────────────────────────────
  {
    id: 'tpl-002',
    accountId: 'acc-001',
    name: 'Design & Permitting Readiness',
    typeId: 'apt-006',
    description: 'Ensures design documents are complete and all permits have been secured prior to Notice to Proceed.',
    private: false,
    sections: [
      {
        id: 'tpl-002-s1', templateId: 'tpl-002', title: 'Design Completion', order: 0,
        items: [
          { id: 'tpl-002-s1-i1', sectionId: 'tpl-002-s1', order: 0, title: '100% construction documents issued for permit', acceptanceCriteria: 'Architect of record stamps all sheets.' },
          { id: 'tpl-002-s1-i2', sectionId: 'tpl-002-s1', order: 1, title: 'Owner design review and acceptance', acceptanceCriteria: null },
          { id: 'tpl-002-s1-i3', sectionId: 'tpl-002-s1', order: 2, title: 'ICRA/ILSM plan reviewed and approved', acceptanceCriteria: 'Approved by Infection Control and Facilities.' },
          { id: 'tpl-002-s1-i4', sectionId: 'tpl-002-s1', order: 3, title: 'Life safety code compliance review', acceptanceCriteria: null },
        ],
      },
      {
        id: 'tpl-002-s2', templateId: 'tpl-002', title: 'Regulatory Approvals & Permits', order: 1,
        items: [
          { id: 'tpl-002-s2-i1', sectionId: 'tpl-002-s2', order: 0, title: 'Building permit application submitted', acceptanceCriteria: null },
          { id: 'tpl-002-s2-i2', sectionId: 'tpl-002-s2', order: 1, title: 'Building permit issued', acceptanceCriteria: 'Permit posted on site.' },
          { id: 'tpl-002-s2-i3', sectionId: 'tpl-002-s2', order: 2, title: 'State Health Department plan approval (if required)', acceptanceCriteria: null },
          { id: 'tpl-002-s2-i4', sectionId: 'tpl-002-s2', order: 3, title: 'Utility connection approvals obtained', acceptanceCriteria: null },
        ],
      },
    ],
    createdBy: 'user-008',
    createdAt: new Date('2023-04-15'),
    updatedAt: new Date('2023-04-15'),
  },

  // ── TEMPLATE 3: Preconstruction Checklist ────────────────────────────────
  {
    id: 'tpl-003',
    accountId: 'acc-001',
    name: 'Preconstruction Checklist',
    typeId: 'apt-002',
    description: 'Confirms all preconstruction activities are complete and the project is ready for Notice to Proceed.',
    private: false,
    sections: [
      {
        id: 'tpl-003-s1', templateId: 'tpl-003', title: 'Contractor Procurement', order: 0,
        items: [
          { id: 'tpl-003-s1-i1', sectionId: 'tpl-003-s1', order: 0, title: 'GC/CM contract executed', acceptanceCriteria: 'Fully executed contract on file.' },
          { id: 'tpl-003-s1-i2', sectionId: 'tpl-003-s1', order: 1, title: 'GC/CM insurance and bonds verified', acceptanceCriteria: null },
          { id: 'tpl-003-s1-i3', sectionId: 'tpl-003-s1', order: 2, title: 'Key subcontractor scopes confirmed', acceptanceCriteria: null },
        ],
      },
      {
        id: 'tpl-003-s2', templateId: 'tpl-003', title: 'Site Readiness', order: 1,
        items: [
          { id: 'tpl-003-s2-i1', sectionId: 'tpl-003-s2', order: 0, title: 'Pre-construction site survey completed', acceptanceCriteria: null },
          { id: 'tpl-003-s2-i2', sectionId: 'tpl-003-s2', order: 1, title: 'Utility locates completed', acceptanceCriteria: null },
          { id: 'tpl-003-s2-i3', sectionId: 'tpl-003-s2', order: 2, title: 'Haul routes and site logistics plan approved', acceptanceCriteria: null },
          { id: 'tpl-003-s2-i4', sectionId: 'tpl-003-s2', order: 3, title: 'Patient/staff notification and wayfinding plan in place', acceptanceCriteria: 'Facilities and Nursing leadership sign-off.' },
        ],
      },
      {
        id: 'tpl-003-s3', templateId: 'tpl-003', title: 'Project Controls Setup', order: 2,
        items: [
          { id: 'tpl-003-s3-i1', sectionId: 'tpl-003-s3', order: 0, title: 'Baseline schedule established and approved', acceptanceCriteria: null },
          { id: 'tpl-003-s3-i2', sectionId: 'tpl-003-s3', order: 1, title: 'Budget control structure (WBS) set up in Procore', acceptanceCriteria: null },
          { id: 'tpl-003-s3-i3', sectionId: 'tpl-003-s3', order: 2, title: 'Submittal register published and GC acknowledged', acceptanceCriteria: null },
        ],
      },
    ],
    createdBy: 'user-009',
    createdAt: new Date('2023-04-15'),
    updatedAt: new Date('2023-04-15'),
  },

  // ── TEMPLATE 4: Construction Phase Oversight ─────────────────────────────
  {
    id: 'tpl-004',
    accountId: 'acc-001',
    name: 'Construction Phase Oversight',
    typeId: 'apt-003',
    description: 'Ongoing milestone tracking for active construction, covering safety, design, infection control, and cost management.',
    private: false,
    sections: [
      {
        id: 'tpl-004-s1', templateId: 'tpl-004', title: 'Safety & Infection Control', order: 0,
        items: [
          { id: 'tpl-004-s1-i1', sectionId: 'tpl-004-s1', order: 0, title: 'Site safety plan posted and current', acceptanceCriteria: null },
          { id: 'tpl-004-s1-i2', sectionId: 'tpl-004-s1', order: 1, title: 'ICRA barriers installed and inspected', acceptanceCriteria: 'Weekly ICRA inspection logs on file.' },
          { id: 'tpl-004-s1-i3', sectionId: 'tpl-004-s1', order: 2, title: 'Hot work permit process active and documented', acceptanceCriteria: null },
          { id: 'tpl-004-s1-i4', sectionId: 'tpl-004-s1', order: 3, title: 'Air quality monitoring documented (if clinical area)', acceptanceCriteria: null },
        ],
      },
      {
        id: 'tpl-004-s2', templateId: 'tpl-004', title: 'Design & Submittals', order: 1,
        items: [
          { id: 'tpl-004-s2-i1', sectionId: 'tpl-004-s2', order: 0, title: 'Critical long-lead submittals approved', acceptanceCriteria: null },
          { id: 'tpl-004-s2-i2', sectionId: 'tpl-004-s2', order: 1, title: 'MEP coordination drawings approved', acceptanceCriteria: 'Engineer of record stamped BIM coordination set.' },
          { id: 'tpl-004-s2-i3', sectionId: 'tpl-004-s2', order: 2, title: 'RFI log current and no critical open items', acceptanceCriteria: null },
        ],
      },
      {
        id: 'tpl-004-s3', templateId: 'tpl-004', title: 'Cost & Schedule Controls', order: 2,
        items: [
          { id: 'tpl-004-s3-i1', sectionId: 'tpl-004-s3', order: 0, title: 'Monthly cost report issued and owner reviewed', acceptanceCriteria: null },
          { id: 'tpl-004-s3-i2', sectionId: 'tpl-004-s3', order: 1, title: 'Schedule 2-week lookahead current and GC approved', acceptanceCriteria: null },
          { id: 'tpl-004-s3-i3', sectionId: 'tpl-004-s3', order: 2, title: 'Owner-furnished equipment delivery schedule confirmed', acceptanceCriteria: null },
        ],
      },
    ],
    createdBy: 'user-009',
    createdAt: new Date('2023-04-15'),
    updatedAt: new Date('2023-04-15'),
  },

  // ── TEMPLATE 5: Commissioning & Activation ───────────────────────────────
  {
    id: 'tpl-005',
    accountId: 'acc-001',
    name: 'Commissioning & Activation',
    typeId: 'apt-004',
    description: 'Verifies all building systems are tested, commissioned, and clinical spaces are ready for occupancy.',
    private: false,
    sections: [
      {
        id: 'tpl-005-s1', templateId: 'tpl-005', title: 'Systems Commissioning', order: 0,
        items: [
          { id: 'tpl-005-s1-i1', sectionId: 'tpl-005-s1', order: 0, title: 'HVAC functional performance testing complete', acceptanceCriteria: 'Cx report signed by Cx agent and GC.' },
          { id: 'tpl-005-s1-i2', sectionId: 'tpl-005-s1', order: 1, title: 'Medical gas systems tested and certified', acceptanceCriteria: 'ASSE 6010/6020 certification on file.' },
          { id: 'tpl-005-s1-i3', sectionId: 'tpl-005-s1', order: 2, title: 'Electrical systems energized and tested', acceptanceCriteria: null },
          { id: 'tpl-005-s1-i4', sectionId: 'tpl-005-s1', order: 3, title: 'Nurse call and patient monitoring systems operational', acceptanceCriteria: null },
        ],
      },
      {
        id: 'tpl-005-s2', templateId: 'tpl-005', title: 'Regulatory & Occupancy', order: 1,
        items: [
          { id: 'tpl-005-s2-i1', sectionId: 'tpl-005-s2', order: 0, title: 'State Health Department final inspection passed', acceptanceCriteria: 'Approval letter on file.' },
          { id: 'tpl-005-s2-i2', sectionId: 'tpl-005-s2', order: 1, title: 'Certificate of Occupancy issued', acceptanceCriteria: 'CO posted.' },
          { id: 'tpl-005-s2-i3', sectionId: 'tpl-005-s2', order: 2, title: 'Fire marshal final inspection passed', acceptanceCriteria: null },
        ],
      },
      {
        id: 'tpl-005-s3', templateId: 'tpl-005', title: 'Activation & Staff Readiness', order: 2,
        items: [
          { id: 'tpl-005-s3-i1', sectionId: 'tpl-005-s3', order: 0, title: 'Staff orientation and facility walkthrough completed', acceptanceCriteria: 'Nursing and clinical leads sign attendance sheet.' },
          { id: 'tpl-005-s3-i2', sectionId: 'tpl-005-s3', order: 1, title: 'Activation day logistics plan approved', acceptanceCriteria: null },
          { id: 'tpl-005-s3-i3', sectionId: 'tpl-005-s3', order: 2, title: 'Equipment tested and clinical staff trained', acceptanceCriteria: null },
        ],
      },
    ],
    createdBy: 'user-009',
    createdAt: new Date('2023-04-15'),
    updatedAt: new Date('2023-04-15'),
  },

  // ── TEMPLATE 6: Project Close-out ────────────────────────────────────────
  {
    id: 'tpl-006',
    accountId: 'acc-001',
    name: 'Project Close-out',
    typeId: 'apt-005',
    description: 'Final administrative, financial, and documentation steps to officially close the project.',
    private: false,
    sections: [
      {
        id: 'tpl-006-s1', templateId: 'tpl-006', title: 'Physical Completion', order: 0,
        items: [
          { id: 'tpl-006-s1-i1', sectionId: 'tpl-006-s1', order: 0, title: 'Substantial completion walkthrough conducted', acceptanceCriteria: 'Inspection report signed by architect and owner.' },
          { id: 'tpl-006-s1-i2', sectionId: 'tpl-006-s1', order: 1, title: 'Punchlist items resolved and accepted', acceptanceCriteria: 'All punch items closed in Procore.' },
          { id: 'tpl-006-s1-i3', sectionId: 'tpl-006-s1', order: 2, title: 'Final inspections and Certificate of Occupancy obtained', acceptanceCriteria: null },
        ],
      },
      {
        id: 'tpl-006-s2', templateId: 'tpl-006', title: 'Documentation & Turnover', order: 1,
        items: [
          { id: 'tpl-006-s2-i1', sectionId: 'tpl-006-s2', order: 0, title: 'As-built drawings submitted and archived', acceptanceCriteria: 'Complete set uploaded to DMS.' },
          { id: 'tpl-006-s2-i2', sectionId: 'tpl-006-s2', order: 1, title: 'Warranties and O&M manuals delivered to Facilities', acceptanceCriteria: 'Facilities Manager acknowledgment on file.' },
          { id: 'tpl-006-s2-i3', sectionId: 'tpl-006-s2', order: 2, title: 'CMMS asset data entered', acceptanceCriteria: null },
        ],
      },
      {
        id: 'tpl-006-s3', templateId: 'tpl-006', title: 'Financial Close', order: 2,
        items: [
          { id: 'tpl-006-s3-i1', sectionId: 'tpl-006-s3', order: 0, title: 'Final GC application for payment approved', acceptanceCriteria: null },
          { id: 'tpl-006-s3-i2', sectionId: 'tpl-006-s3', order: 1, title: 'Final cost report issued and accepted by Finance', acceptanceCriteria: null },
          { id: 'tpl-006-s3-i3', sectionId: 'tpl-006-s3', order: 2, title: 'Project formally closed in Procore and capital accounting', acceptanceCriteria: null },
        ],
      },
    ],
    createdBy: 'user-008',
    createdAt: new Date('2023-04-15'),
    updatedAt: new Date('2023-04-15'),
  },
];
