import type { WBSItem } from '@/types/shared';

// Cost Codes (segment: 'cost_code')
const costCodes: WBSItem[] = [
  { id: 'wbs-cc-001', accountId: 'acc-001', segment: 'cost_code', code: '1.0', description: 'Pre-Development & Soft Costs',           status: 'active', createdAt: new Date('2021-01-10'), updatedAt: new Date('2021-01-10') },
  { id: 'wbs-cc-002', accountId: 'acc-001', segment: 'cost_code', code: '1.1', description: 'Land Acquisition & Easements',           status: 'active', createdAt: new Date('2021-01-10'), updatedAt: new Date('2021-01-10') },
  { id: 'wbs-cc-003', accountId: 'acc-001', segment: 'cost_code', code: '1.2', description: 'Engineering & Design Fees',              status: 'active', createdAt: new Date('2021-01-10'), updatedAt: new Date('2021-01-10') },
  { id: 'wbs-cc-004', accountId: 'acc-001', segment: 'cost_code', code: '1.3', description: 'Permits & Government Fees',              status: 'active', createdAt: new Date('2021-01-10'), updatedAt: new Date('2021-01-10') },
  { id: 'wbs-cc-005', accountId: 'acc-001', segment: 'cost_code', code: '1.4', description: 'Legal & Interconnection Fees',           status: 'active', createdAt: new Date('2021-01-10'), updatedAt: new Date('2021-01-10') },
  { id: 'wbs-cc-006', accountId: 'acc-001', segment: 'cost_code', code: '2.0', description: 'Hard Costs (Construction)',               status: 'active', createdAt: new Date('2021-01-10'), updatedAt: new Date('2021-01-10') },
  { id: 'wbs-cc-007', accountId: 'acc-001', segment: 'cost_code', code: '2.1', description: 'Site Preparation & Civil',               status: 'active', createdAt: new Date('2021-01-10'), updatedAt: new Date('2021-01-10') },
  { id: 'wbs-cc-008', accountId: 'acc-001', segment: 'cost_code', code: '2.2', description: 'Structural & Foundation',                status: 'active', createdAt: new Date('2021-01-10'), updatedAt: new Date('2021-01-10') },
  { id: 'wbs-cc-009', accountId: 'acc-001', segment: 'cost_code', code: '2.3', description: 'Electrical Balance of Plant',            status: 'active', createdAt: new Date('2021-01-10'), updatedAt: new Date('2021-01-10') },
  { id: 'wbs-cc-010', accountId: 'acc-001', segment: 'cost_code', code: '2.4', description: 'Mechanical Balance of Plant',            status: 'active', createdAt: new Date('2021-01-10'), updatedAt: new Date('2021-01-10') },
  { id: 'wbs-cc-011', accountId: 'acc-001', segment: 'cost_code', code: '2.5', description: 'General Conditions & GC Fees',           status: 'active', createdAt: new Date('2021-01-10'), updatedAt: new Date('2021-01-10') },
  { id: 'wbs-cc-012', accountId: 'acc-001', segment: 'cost_code', code: '3.0', description: 'Major Equipment Procurement',            status: 'active', createdAt: new Date('2021-01-10'), updatedAt: new Date('2021-01-10') },
  { id: 'wbs-cc-013', accountId: 'acc-001', segment: 'cost_code', code: '3.1', description: 'Solar Panels / Turbines / BESS Units',   status: 'active', createdAt: new Date('2021-01-10'), updatedAt: new Date('2021-01-10') },
  { id: 'wbs-cc-014', accountId: 'acc-001', segment: 'cost_code', code: '3.2', description: 'Inverters & Power Electronics',          status: 'active', createdAt: new Date('2021-01-10'), updatedAt: new Date('2021-01-10') },
  { id: 'wbs-cc-015', accountId: 'acc-001', segment: 'cost_code', code: '3.3', description: 'Substation & Switchgear',                status: 'active', createdAt: new Date('2021-01-10'), updatedAt: new Date('2021-01-10') },
  { id: 'wbs-cc-016', accountId: 'acc-001', segment: 'cost_code', code: '4.0', description: 'Owner Indirects & Finance',              status: 'active', createdAt: new Date('2021-01-10'), updatedAt: new Date('2021-01-10') },
  { id: 'wbs-cc-017', accountId: 'acc-001', segment: 'cost_code', code: '4.1', description: 'Owner Project Management',              status: 'active', createdAt: new Date('2021-01-10'), updatedAt: new Date('2021-01-10') },
  { id: 'wbs-cc-018', accountId: 'acc-001', segment: 'cost_code', code: '4.2', description: 'Financing Interest & Bank Fees',         status: 'active', createdAt: new Date('2021-01-10'), updatedAt: new Date('2021-01-10') },
  { id: 'wbs-cc-019', accountId: 'acc-001', segment: 'cost_code', code: '4.3', description: 'Insurance & Bonding',                   status: 'active', createdAt: new Date('2021-01-10'), updatedAt: new Date('2021-01-10') },
  { id: 'wbs-cc-020', accountId: 'acc-001', segment: 'cost_code', code: '4.4', description: 'Commissioning & Testing',               status: 'active', createdAt: new Date('2021-01-10'), updatedAt: new Date('2021-01-10') },
  { id: 'wbs-cc-021', accountId: 'acc-001', segment: 'cost_code', code: '5.0', description: 'Contingency & Reserves',                status: 'active', createdAt: new Date('2021-01-10'), updatedAt: new Date('2021-01-10') },
  { id: 'wbs-cc-022', accountId: 'acc-001', segment: 'cost_code', code: '5.1', description: 'Owner Construction Contingency',        status: 'active', createdAt: new Date('2021-01-10'), updatedAt: new Date('2021-01-10') },
  { id: 'wbs-cc-023', accountId: 'acc-001', segment: 'cost_code', code: '5.2', description: 'Design/Escalation Reserve',             status: 'active', createdAt: new Date('2021-01-10'), updatedAt: new Date('2021-01-10') },
  { id: 'wbs-cc-024', accountId: 'acc-001', segment: 'cost_code', code: '5.3', description: 'Closeout & Commissioning Reserve',      status: 'active', createdAt: new Date('2021-01-10'), updatedAt: new Date('2021-01-10') },
];

// Cost Types (segment: 'cost_type')
const costTypes: WBSItem[] = [
  { id: 'wbs-ct-001', accountId: 'acc-001', segment: 'cost_type', code: 'L', description: 'Labor',             status: 'active', createdAt: new Date('2021-01-10'), updatedAt: new Date('2021-01-10') },
  { id: 'wbs-ct-002', accountId: 'acc-001', segment: 'cost_type', code: 'M', description: 'Material',          status: 'active', createdAt: new Date('2021-01-10'), updatedAt: new Date('2021-01-10') },
  { id: 'wbs-ct-003', accountId: 'acc-001', segment: 'cost_type', code: 'E', description: 'Equipment',         status: 'active', createdAt: new Date('2021-01-10'), updatedAt: new Date('2021-01-10') },
  { id: 'wbs-ct-004', accountId: 'acc-001', segment: 'cost_type', code: 'S', description: 'Subcontract',       status: 'active', createdAt: new Date('2021-01-10'), updatedAt: new Date('2021-01-10') },
  { id: 'wbs-ct-005', accountId: 'acc-001', segment: 'cost_type', code: 'P', description: 'Professional Fees', status: 'active', createdAt: new Date('2021-01-10'), updatedAt: new Date('2021-01-10') },
  { id: 'wbs-ct-006', accountId: 'acc-001', segment: 'cost_type', code: 'F', description: 'Permits & Fees',    status: 'active', createdAt: new Date('2021-01-10'), updatedAt: new Date('2021-01-10') },
  { id: 'wbs-ct-007', accountId: 'acc-001', segment: 'cost_type', code: 'I', description: 'Insurance & Tax',   status: 'active', createdAt: new Date('2021-01-10'), updatedAt: new Date('2021-01-10') },
  { id: 'wbs-ct-008', accountId: 'acc-001', segment: 'cost_type', code: 'C', description: 'Contingency',       status: 'active', createdAt: new Date('2021-01-10'), updatedAt: new Date('2021-01-10') },
  { id: 'wbs-ct-009', accountId: 'acc-001', segment: 'cost_type', code: 'O', description: 'Overhead/Other',    status: 'active', createdAt: new Date('2021-01-10'), updatedAt: new Date('2021-01-10') },
];

// WBS Programs (segment: 'program')
const programs: WBSItem[] = [
  { id: 'wbs-p-001', accountId: 'acc-001', segment: 'program', code: 'SL', description: 'Solar PV',                    status: 'active', createdAt: new Date('2021-01-10'), updatedAt: new Date('2021-01-10') },
  { id: 'wbs-p-002', accountId: 'acc-001', segment: 'program', code: 'BS', description: 'Battery Energy Storage',      status: 'active', createdAt: new Date('2021-01-10'), updatedAt: new Date('2021-01-10') },
  { id: 'wbs-p-003', accountId: 'acc-001', segment: 'program', code: 'TR', description: 'Transmission & Substation',   status: 'active', createdAt: new Date('2021-01-10'), updatedAt: new Date('2021-01-10') },
  { id: 'wbs-p-004', accountId: 'acc-001', segment: 'program', code: 'IN', description: 'Infrastructure & O&M',        status: 'active', createdAt: new Date('2021-01-10'), updatedAt: new Date('2021-01-10') },
];

export const wbsItems: WBSItem[] = [...costCodes, ...costTypes, ...programs];
