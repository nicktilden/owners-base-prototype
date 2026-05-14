import type { WBSItem } from '@/types/shared';

// ── COST CODES (24 items: parent headers + leaf codes) ────────────────────────
const costCodes: WBSItem[] = [
  // 1.0 Pre-Development & Soft Costs
  { id: 'wbs-cc-001', accountId: 'acc-001', segment: 'cost_code', code: '1.0', description: 'Pre-Development & Soft Costs', status: 'active', createdAt: new Date('2022-04-01'), updatedAt: new Date('2022-04-01') },
  { id: 'wbs-cc-002', accountId: 'acc-001', segment: 'cost_code', code: '1.1', description: 'Land Acquisition & Due Diligence', status: 'active', createdAt: new Date('2022-04-01'), updatedAt: new Date('2022-04-01') },
  { id: 'wbs-cc-003', accountId: 'acc-001', segment: 'cost_code', code: '1.2', description: 'Design & Engineering Fees', status: 'active', createdAt: new Date('2022-04-01'), updatedAt: new Date('2022-04-01') },
  { id: 'wbs-cc-004', accountId: 'acc-001', segment: 'cost_code', code: '1.3', description: 'Permits, Fees & Interconnection Studies', status: 'active', createdAt: new Date('2022-04-01'), updatedAt: new Date('2022-04-01') },
  { id: 'wbs-cc-005', accountId: 'acc-001', segment: 'cost_code', code: '1.4', description: 'Legal & Professional Services', status: 'active', createdAt: new Date('2022-04-01'), updatedAt: new Date('2022-04-01') },
  // 2.0 Hard Costs (Construction)
  { id: 'wbs-cc-006', accountId: 'acc-001', segment: 'cost_code', code: '2.0', description: 'Hard Costs (Construction)', status: 'active', createdAt: new Date('2022-04-01'), updatedAt: new Date('2022-04-01') },
  { id: 'wbs-cc-007', accountId: 'acc-001', segment: 'cost_code', code: '2.1', description: 'Site Preparation & Civil', status: 'active', createdAt: new Date('2022-04-01'), updatedAt: new Date('2022-04-01') },
  { id: 'wbs-cc-008', accountId: 'acc-001', segment: 'cost_code', code: '2.2', description: 'Shell & Core (Structure/Envelope)', status: 'active', createdAt: new Date('2022-04-01'), updatedAt: new Date('2022-04-01') },
  { id: 'wbs-cc-009', accountId: 'acc-001', segment: 'cost_code', code: '2.3', description: 'Interior Construction & Finishes', status: 'active', createdAt: new Date('2022-04-01'), updatedAt: new Date('2022-04-01') },
  { id: 'wbs-cc-010', accountId: 'acc-001', segment: 'cost_code', code: '2.4', description: 'MEP (Mechanical, Electrical, Plumbing)', status: 'active', createdAt: new Date('2022-04-01'), updatedAt: new Date('2022-04-01') },
  { id: 'wbs-cc-011', accountId: 'acc-001', segment: 'cost_code', code: '2.5', description: 'General Conditions (GC Fees/Insurance)', status: 'active', createdAt: new Date('2022-04-01'), updatedAt: new Date('2022-04-01') },
  // 3.0 Critical Systems & Technology
  { id: 'wbs-cc-012', accountId: 'acc-001', segment: 'cost_code', code: '3.0', description: 'Critical Systems & Technology', status: 'active', createdAt: new Date('2022-04-01'), updatedAt: new Date('2022-04-01') },
  { id: 'wbs-cc-013', accountId: 'acc-001', segment: 'cost_code', code: '3.1', description: 'Power Infrastructure (UPS, PDUs, Switchgear)', status: 'active', createdAt: new Date('2022-04-01'), updatedAt: new Date('2022-04-01') },
  { id: 'wbs-cc-014', accountId: 'acc-001', segment: 'cost_code', code: '3.2', description: 'Cooling Systems (CRAC, Cooling Towers, CDHX)', status: 'active', createdAt: new Date('2022-04-01'), updatedAt: new Date('2022-04-01') },
  { id: 'wbs-cc-015', accountId: 'acc-001', segment: 'cost_code', code: '3.3', description: 'Network & Fiber Infrastructure', status: 'active', createdAt: new Date('2022-04-01'), updatedAt: new Date('2022-04-01') },
  { id: 'wbs-cc-016', accountId: 'acc-001', segment: 'cost_code', code: '3.4', description: 'Security & Access Control', status: 'active', createdAt: new Date('2022-04-01'), updatedAt: new Date('2022-04-01') },
  // 4.0 Owner Indirects & Finance
  { id: 'wbs-cc-017', accountId: 'acc-001', segment: 'cost_code', code: '4.0', description: 'Owner Indirects & Finance', status: 'active', createdAt: new Date('2022-04-01'), updatedAt: new Date('2022-04-01') },
  { id: 'wbs-cc-018', accountId: 'acc-001', segment: 'cost_code', code: '4.1', description: 'Owner Project Management', status: 'active', createdAt: new Date('2022-04-01'), updatedAt: new Date('2022-04-01') },
  { id: 'wbs-cc-019', accountId: 'acc-001', segment: 'cost_code', code: '4.2', description: 'Financing Interest & Debt Service', status: 'active', createdAt: new Date('2022-04-01'), updatedAt: new Date('2022-04-01') },
  { id: 'wbs-cc-020', accountId: 'acc-001', segment: 'cost_code', code: '4.3', description: "Insurance (Builder's Risk & Equipment Floater)", status: 'active', createdAt: new Date('2022-04-01'), updatedAt: new Date('2022-04-01') },
  // 5.0 Contingency & Reserves
  { id: 'wbs-cc-021', accountId: 'acc-001', segment: 'cost_code', code: '5.0', description: 'Contingency & Reserves', status: 'active', createdAt: new Date('2022-04-01'), updatedAt: new Date('2022-04-01') },
  { id: 'wbs-cc-022', accountId: 'acc-001', segment: 'cost_code', code: '5.1', description: 'Owner Construction Contingency', status: 'active', createdAt: new Date('2022-04-01'), updatedAt: new Date('2022-04-01') },
  { id: 'wbs-cc-023', accountId: 'acc-001', segment: 'cost_code', code: '5.2', description: 'Equipment Long-Lead / Escalation Reserve', status: 'active', createdAt: new Date('2022-04-01'), updatedAt: new Date('2022-04-01') },
  { id: 'wbs-cc-024', accountId: 'acc-001', segment: 'cost_code', code: '5.3', description: 'Commissioning & Closeout', status: 'active', createdAt: new Date('2022-04-01'), updatedAt: new Date('2022-04-01') },
];

// ── COST TYPES (9 items) ───────────────────────────────────────────────────────
const costTypes: WBSItem[] = [
  { id: 'wbs-ct-001', accountId: 'acc-001', segment: 'cost_type', code: 'L', description: 'Labor', status: 'active', createdAt: new Date('2022-04-01'), updatedAt: new Date('2022-04-01') },
  { id: 'wbs-ct-002', accountId: 'acc-001', segment: 'cost_type', code: 'M', description: 'Material', status: 'active', createdAt: new Date('2022-04-01'), updatedAt: new Date('2022-04-01') },
  { id: 'wbs-ct-003', accountId: 'acc-001', segment: 'cost_type', code: 'E', description: 'Equipment', status: 'active', createdAt: new Date('2022-04-01'), updatedAt: new Date('2022-04-01') },
  { id: 'wbs-ct-004', accountId: 'acc-001', segment: 'cost_type', code: 'S', description: 'Subcontract', status: 'active', createdAt: new Date('2022-04-01'), updatedAt: new Date('2022-04-01') },
  { id: 'wbs-ct-005', accountId: 'acc-001', segment: 'cost_type', code: 'P', description: 'Professional Fees', status: 'active', createdAt: new Date('2022-04-01'), updatedAt: new Date('2022-04-01') },
  { id: 'wbs-ct-006', accountId: 'acc-001', segment: 'cost_type', code: 'F', description: 'Permits & Interconnection Fees', status: 'active', createdAt: new Date('2022-04-01'), updatedAt: new Date('2022-04-01') },
  { id: 'wbs-ct-007', accountId: 'acc-001', segment: 'cost_type', code: 'I', description: 'Insurance & Tax', status: 'active', createdAt: new Date('2022-04-01'), updatedAt: new Date('2022-04-01') },
  { id: 'wbs-ct-008', accountId: 'acc-001', segment: 'cost_type', code: 'C', description: 'Contingency', status: 'active', createdAt: new Date('2022-04-01'), updatedAt: new Date('2022-04-01') },
  { id: 'wbs-ct-009', accountId: 'acc-001', segment: 'cost_type', code: 'O', description: 'Overhead/Other', status: 'active', createdAt: new Date('2022-04-01'), updatedAt: new Date('2022-04-01') },
];

// ── WBS PROGRAMS (4 items — Data Center financial programs) ───────────────────
const programs: WBSItem[] = [
  { id: 'wbs-p-001', accountId: 'acc-001', segment: 'program', code: 'DC', description: 'Data Center', status: 'active', createdAt: new Date('2022-04-01'), updatedAt: new Date('2022-04-01') },
  { id: 'wbs-p-002', accountId: 'acc-001', segment: 'program', code: 'PW', description: 'Power Infrastructure', status: 'active', createdAt: new Date('2022-04-01'), updatedAt: new Date('2022-04-01') },
  { id: 'wbs-p-003', accountId: 'acc-001', segment: 'program', code: 'CO', description: 'Cooling Systems', status: 'active', createdAt: new Date('2022-04-01'), updatedAt: new Date('2022-04-01') },
  { id: 'wbs-p-004', accountId: 'acc-001', segment: 'program', code: 'NW', description: 'Network Infrastructure', status: 'active', createdAt: new Date('2022-04-01'), updatedAt: new Date('2022-04-01') },
];

export const wbsItems: WBSItem[] = [...costCodes, ...costTypes, ...programs];
