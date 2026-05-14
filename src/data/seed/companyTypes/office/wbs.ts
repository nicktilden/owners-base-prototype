import type { WBSItem } from '@/types/shared';

// Cost Codes (segment: 'cost_code')
const costCodes: WBSItem[] = [
  { id: 'wbs-cc-01',  accountId: 'acc-001', segment: 'cost_code', code: '1.0', description: 'Pre-Development & Soft Costs',           status: 'active', createdAt: new Date('2020-01-01'), updatedAt: new Date('2020-01-01') },
  { id: 'wbs-cc-02',  accountId: 'acc-001', segment: 'cost_code', code: '1.1', description: 'Land Acquisition',                       status: 'active', createdAt: new Date('2020-01-01'), updatedAt: new Date('2020-01-01') },
  { id: 'wbs-cc-03',  accountId: 'acc-001', segment: 'cost_code', code: '1.2', description: 'Design & Engineering Fees',               status: 'active', createdAt: new Date('2020-01-01'), updatedAt: new Date('2020-01-01') },
  { id: 'wbs-cc-04',  accountId: 'acc-001', segment: 'cost_code', code: '1.3', description: 'Permits & Government Fees',               status: 'active', createdAt: new Date('2020-01-01'), updatedAt: new Date('2020-01-01') },
  { id: 'wbs-cc-05',  accountId: 'acc-001', segment: 'cost_code', code: '1.4', description: 'Legal & Professional Services',           status: 'active', createdAt: new Date('2020-01-01'), updatedAt: new Date('2020-01-01') },
  { id: 'wbs-cc-06',  accountId: 'acc-001', segment: 'cost_code', code: '2.0', description: 'Hard Costs (Construction)',               status: 'active', createdAt: new Date('2020-01-01'), updatedAt: new Date('2020-01-01') },
  { id: 'wbs-cc-07',  accountId: 'acc-001', segment: 'cost_code', code: '2.1', description: 'Site Preparation & Civil',                status: 'active', createdAt: new Date('2020-01-01'), updatedAt: new Date('2020-01-01') },
  { id: 'wbs-cc-08',  accountId: 'acc-001', segment: 'cost_code', code: '2.2', description: 'Shell & Core (Structure/Envelope)',       status: 'active', createdAt: new Date('2020-01-01'), updatedAt: new Date('2020-01-01') },
  { id: 'wbs-cc-09',  accountId: 'acc-001', segment: 'cost_code', code: '2.3', description: 'Interior Construction & Finishes',        status: 'active', createdAt: new Date('2020-01-01'), updatedAt: new Date('2020-01-01') },
  { id: 'wbs-cc-10',  accountId: 'acc-001', segment: 'cost_code', code: '2.4', description: 'MEP (Mechanical, Electrical, Plumbing)',  status: 'active', createdAt: new Date('2020-01-01'), updatedAt: new Date('2020-01-01') },
  { id: 'wbs-cc-11',  accountId: 'acc-001', segment: 'cost_code', code: '2.5', description: 'General Conditions (GC Fees/Insurance)', status: 'active', createdAt: new Date('2020-01-01'), updatedAt: new Date('2020-01-01') },
  { id: 'wbs-cc-12',  accountId: 'acc-001', segment: 'cost_code', code: '3.0', description: 'FF&E and Technology',                     status: 'active', createdAt: new Date('2020-01-01'), updatedAt: new Date('2020-01-01') },
  { id: 'wbs-cc-13',  accountId: 'acc-001', segment: 'cost_code', code: '3.1', description: 'Furniture & Fixtures',                    status: 'active', createdAt: new Date('2020-01-01'), updatedAt: new Date('2020-01-01') },
  { id: 'wbs-cc-14',  accountId: 'acc-001', segment: 'cost_code', code: '3.2', description: 'IT, AV & Security Systems',               status: 'active', createdAt: new Date('2020-01-01'), updatedAt: new Date('2020-01-01') },
  { id: 'wbs-cc-15',  accountId: 'acc-001', segment: 'cost_code', code: '3.3', description: 'Signage & Branding',                      status: 'active', createdAt: new Date('2020-01-01'), updatedAt: new Date('2020-01-01') },
  { id: 'wbs-cc-16',  accountId: 'acc-001', segment: 'cost_code', code: '4.0', description: 'Owner Indirects & Finance',               status: 'active', createdAt: new Date('2020-01-01'), updatedAt: new Date('2020-01-01') },
  { id: 'wbs-cc-17',  accountId: 'acc-001', segment: 'cost_code', code: '4.1', description: 'Owner Project Management',                status: 'active', createdAt: new Date('2020-01-01'), updatedAt: new Date('2020-01-01') },
  { id: 'wbs-cc-18',  accountId: 'acc-001', segment: 'cost_code', code: '4.2', description: 'Financing Interest & Bank Fees',          status: 'active', createdAt: new Date('2020-01-01'), updatedAt: new Date('2020-01-01') },
  { id: 'wbs-cc-19',  accountId: 'acc-001', segment: 'cost_code', code: '4.3', description: 'Marketing & Leasing Commissions',         status: 'active', createdAt: new Date('2020-01-01'), updatedAt: new Date('2020-01-01') },
  { id: 'wbs-cc-20',  accountId: 'acc-001', segment: 'cost_code', code: '4.4', description: "Insurance (Builder's Risk)",              status: 'active', createdAt: new Date('2020-01-01'), updatedAt: new Date('2020-01-01') },
  { id: 'wbs-cc-21',  accountId: 'acc-001', segment: 'cost_code', code: '5.0', description: 'Contingency & Reserves',                  status: 'active', createdAt: new Date('2020-01-01'), updatedAt: new Date('2020-01-01') },
  { id: 'wbs-cc-22',  accountId: 'acc-001', segment: 'cost_code', code: '5.1', description: 'Owner Construction Contingency',          status: 'active', createdAt: new Date('2020-01-01'), updatedAt: new Date('2020-01-01') },
  { id: 'wbs-cc-23',  accountId: 'acc-001', segment: 'cost_code', code: '5.2', description: 'Design/Escalation Reserve',               status: 'active', createdAt: new Date('2020-01-01'), updatedAt: new Date('2020-01-01') },
  { id: 'wbs-cc-24',  accountId: 'acc-001', segment: 'cost_code', code: '5.3', description: 'Closeout & Commissioning',                status: 'active', createdAt: new Date('2020-01-01'), updatedAt: new Date('2020-01-01') },
];

// Cost Types (segment: 'cost_type')
const costTypes: WBSItem[] = [
  { id: 'wbs-ct-01', accountId: 'acc-001', segment: 'cost_type', code: 'L', description: 'Labor',             status: 'active', createdAt: new Date('2020-01-01'), updatedAt: new Date('2020-01-01') },
  { id: 'wbs-ct-02', accountId: 'acc-001', segment: 'cost_type', code: 'M', description: 'Material',          status: 'active', createdAt: new Date('2020-01-01'), updatedAt: new Date('2020-01-01') },
  { id: 'wbs-ct-03', accountId: 'acc-001', segment: 'cost_type', code: 'E', description: 'Equipment',         status: 'active', createdAt: new Date('2020-01-01'), updatedAt: new Date('2020-01-01') },
  { id: 'wbs-ct-04', accountId: 'acc-001', segment: 'cost_type', code: 'S', description: 'Subcontract',       status: 'active', createdAt: new Date('2020-01-01'), updatedAt: new Date('2020-01-01') },
  { id: 'wbs-ct-05', accountId: 'acc-001', segment: 'cost_type', code: 'P', description: 'Professional Fees', status: 'active', createdAt: new Date('2020-01-01'), updatedAt: new Date('2020-01-01') },
  { id: 'wbs-ct-06', accountId: 'acc-001', segment: 'cost_type', code: 'F', description: 'Permits & Fees',    status: 'active', createdAt: new Date('2020-01-01'), updatedAt: new Date('2020-01-01') },
  { id: 'wbs-ct-07', accountId: 'acc-001', segment: 'cost_type', code: 'I', description: 'Insurance & Tax',   status: 'active', createdAt: new Date('2020-01-01'), updatedAt: new Date('2020-01-01') },
  { id: 'wbs-ct-08', accountId: 'acc-001', segment: 'cost_type', code: 'C', description: 'Contingency',       status: 'active', createdAt: new Date('2020-01-01'), updatedAt: new Date('2020-01-01') },
  { id: 'wbs-ct-09', accountId: 'acc-001', segment: 'cost_type', code: 'O', description: 'Overhead/Other',    status: 'active', createdAt: new Date('2020-01-01'), updatedAt: new Date('2020-01-01') },
];

// WBS Programs (segment: 'program')
const programs: WBSItem[] = [
  { id: 'wbs-p-01', accountId: 'acc-001', segment: 'program', code: 'RM', description: 'Repositioning & Major Capital', status: 'active', createdAt: new Date('2020-01-01'), updatedAt: new Date('2020-01-01') },
  { id: 'wbs-p-02', accountId: 'acc-001', segment: 'program', code: 'TI', description: 'Tenant Improvements',          status: 'active', createdAt: new Date('2020-01-01'), updatedAt: new Date('2020-01-01') },
  { id: 'wbs-p-03', accountId: 'acc-001', segment: 'program', code: 'BS', description: 'Base Building Systems',        status: 'active', createdAt: new Date('2020-01-01'), updatedAt: new Date('2020-01-01') },
  { id: 'wbs-p-04', accountId: 'acc-001', segment: 'program', code: 'ND', description: 'New Development',             status: 'active', createdAt: new Date('2020-01-01'), updatedAt: new Date('2020-01-01') },
];

export const wbsItems: WBSItem[] = [...costCodes, ...costTypes, ...programs];
