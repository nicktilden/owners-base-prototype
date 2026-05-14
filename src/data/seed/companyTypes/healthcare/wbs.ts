import type { WBSItem } from '@/types/shared';

// ── COST CODES (23 items: parent headers + leaf codes) ────────────────────────
// WBS Dictionary — Construction Owner standard
const costCodes: WBSItem[] = [
  // 1.0 Pre-Development & Soft Costs
  { id: 'wbs-cc-001', accountId: 'acc-001', segment: 'cost_code', code: '1.0', description: 'Pre-Development & Soft Costs', status: 'active', createdAt: new Date('2023-03-15'), updatedAt: new Date('2023-03-15') },
  { id: 'wbs-cc-002', accountId: 'acc-001', segment: 'cost_code', code: '1.1', description: 'Land Acquisition', status: 'active', createdAt: new Date('2023-03-15'), updatedAt: new Date('2023-03-15') },
  { id: 'wbs-cc-003', accountId: 'acc-001', segment: 'cost_code', code: '1.2', description: 'Design & Engineering Fees', status: 'active', createdAt: new Date('2023-03-15'), updatedAt: new Date('2023-03-15') },
  { id: 'wbs-cc-004', accountId: 'acc-001', segment: 'cost_code', code: '1.3', description: 'Permits & Government Fees', status: 'active', createdAt: new Date('2023-03-15'), updatedAt: new Date('2023-03-15') },
  { id: 'wbs-cc-005', accountId: 'acc-001', segment: 'cost_code', code: '1.4', description: 'Legal & Professional Services', status: 'active', createdAt: new Date('2023-03-15'), updatedAt: new Date('2023-03-15') },
  // 2.0 Hard Costs (Construction)
  { id: 'wbs-cc-006', accountId: 'acc-001', segment: 'cost_code', code: '2.0', description: 'Hard Costs (Construction)', status: 'active', createdAt: new Date('2023-03-15'), updatedAt: new Date('2023-03-15') },
  { id: 'wbs-cc-007', accountId: 'acc-001', segment: 'cost_code', code: '2.1', description: 'Site Preparation & Civil', status: 'active', createdAt: new Date('2023-03-15'), updatedAt: new Date('2023-03-15') },
  { id: 'wbs-cc-008', accountId: 'acc-001', segment: 'cost_code', code: '2.2', description: 'Shell & Core (Structure/Envelope)', status: 'active', createdAt: new Date('2023-03-15'), updatedAt: new Date('2023-03-15') },
  { id: 'wbs-cc-009', accountId: 'acc-001', segment: 'cost_code', code: '2.3', description: 'Interior Construction & Finishes', status: 'active', createdAt: new Date('2023-03-15'), updatedAt: new Date('2023-03-15') },
  { id: 'wbs-cc-010', accountId: 'acc-001', segment: 'cost_code', code: '2.4', description: 'MEP (Mechanical, Electrical, Plumbing)', status: 'active', createdAt: new Date('2023-03-15'), updatedAt: new Date('2023-03-15') },
  { id: 'wbs-cc-011', accountId: 'acc-001', segment: 'cost_code', code: '2.5', description: 'General Conditions (GC Fees/Insurance)', status: 'active', createdAt: new Date('2023-03-15'), updatedAt: new Date('2023-03-15') },
  // 3.0 FF&E and Technology
  { id: 'wbs-cc-012', accountId: 'acc-001', segment: 'cost_code', code: '3.0', description: 'FF&E and Technology', status: 'active', createdAt: new Date('2023-03-15'), updatedAt: new Date('2023-03-15') },
  { id: 'wbs-cc-013', accountId: 'acc-001', segment: 'cost_code', code: '3.1', description: 'Furniture & Fixtures', status: 'active', createdAt: new Date('2023-03-15'), updatedAt: new Date('2023-03-15') },
  { id: 'wbs-cc-014', accountId: 'acc-001', segment: 'cost_code', code: '3.2', description: 'IT, AV & Security Systems', status: 'active', createdAt: new Date('2023-03-15'), updatedAt: new Date('2023-03-15') },
  { id: 'wbs-cc-015', accountId: 'acc-001', segment: 'cost_code', code: '3.3', description: 'Signage & Branding', status: 'active', createdAt: new Date('2023-03-15'), updatedAt: new Date('2023-03-15') },
  // 4.0 Owner Indirects & Finance
  { id: 'wbs-cc-016', accountId: 'acc-001', segment: 'cost_code', code: '4.0', description: 'Owner Indirects & Finance', status: 'active', createdAt: new Date('2023-03-15'), updatedAt: new Date('2023-03-15') },
  { id: 'wbs-cc-017', accountId: 'acc-001', segment: 'cost_code', code: '4.1', description: 'Owner Project Management', status: 'active', createdAt: new Date('2023-03-15'), updatedAt: new Date('2023-03-15') },
  { id: 'wbs-cc-018', accountId: 'acc-001', segment: 'cost_code', code: '4.2', description: 'Financing Interest & Bank Fees', status: 'active', createdAt: new Date('2023-03-15'), updatedAt: new Date('2023-03-15') },
  { id: 'wbs-cc-019', accountId: 'acc-001', segment: 'cost_code', code: '4.3', description: 'Marketing & Leasing Commissions', status: 'active', createdAt: new Date('2023-03-15'), updatedAt: new Date('2023-03-15') },
  { id: 'wbs-cc-020', accountId: 'acc-001', segment: 'cost_code', code: '4.4', description: "Insurance (Builder's Risk)", status: 'active', createdAt: new Date('2023-03-15'), updatedAt: new Date('2023-03-15') },
  // 5.0 Contingency & Reserves
  { id: 'wbs-cc-021', accountId: 'acc-001', segment: 'cost_code', code: '5.0', description: 'Contingency & Reserves', status: 'active', createdAt: new Date('2023-03-15'), updatedAt: new Date('2023-03-15') },
  { id: 'wbs-cc-022', accountId: 'acc-001', segment: 'cost_code', code: '5.1', description: 'Owner Construction Contingency', status: 'active', createdAt: new Date('2023-03-15'), updatedAt: new Date('2023-03-15') },
  { id: 'wbs-cc-023', accountId: 'acc-001', segment: 'cost_code', code: '5.2', description: 'Design/Escalation Reserve', status: 'active', createdAt: new Date('2023-03-15'), updatedAt: new Date('2023-03-15') },
  { id: 'wbs-cc-024', accountId: 'acc-001', segment: 'cost_code', code: '5.3', description: 'Closeout & Commissioning', status: 'active', createdAt: new Date('2023-03-15'), updatedAt: new Date('2023-03-15') },
];

// ── COST TYPES (9 items) ───────────────────────────────────────────────────────
const costTypes: WBSItem[] = [
  { id: 'wbs-ct-001', accountId: 'acc-001', segment: 'cost_type', code: 'L', description: 'Labor', status: 'active', createdAt: new Date('2023-03-15'), updatedAt: new Date('2023-03-15') },
  { id: 'wbs-ct-002', accountId: 'acc-001', segment: 'cost_type', code: 'M', description: 'Material', status: 'active', createdAt: new Date('2023-03-15'), updatedAt: new Date('2023-03-15') },
  { id: 'wbs-ct-003', accountId: 'acc-001', segment: 'cost_type', code: 'E', description: 'Equipment', status: 'active', createdAt: new Date('2023-03-15'), updatedAt: new Date('2023-03-15') },
  { id: 'wbs-ct-004', accountId: 'acc-001', segment: 'cost_type', code: 'S', description: 'Subcontract', status: 'active', createdAt: new Date('2023-03-15'), updatedAt: new Date('2023-03-15') },
  { id: 'wbs-ct-005', accountId: 'acc-001', segment: 'cost_type', code: 'P', description: 'Professional Fees', status: 'active', createdAt: new Date('2023-03-15'), updatedAt: new Date('2023-03-15') },
  { id: 'wbs-ct-006', accountId: 'acc-001', segment: 'cost_type', code: 'F', description: 'Permits & Fees', status: 'active', createdAt: new Date('2023-03-15'), updatedAt: new Date('2023-03-15') },
  { id: 'wbs-ct-007', accountId: 'acc-001', segment: 'cost_type', code: 'I', description: 'Insurance & Tax', status: 'active', createdAt: new Date('2023-03-15'), updatedAt: new Date('2023-03-15') },
  { id: 'wbs-ct-008', accountId: 'acc-001', segment: 'cost_type', code: 'C', description: 'Contingency', status: 'active', createdAt: new Date('2023-03-15'), updatedAt: new Date('2023-03-15') },
  { id: 'wbs-ct-009', accountId: 'acc-001', segment: 'cost_type', code: 'O', description: 'Overhead/Other', status: 'active', createdAt: new Date('2023-03-15'), updatedAt: new Date('2023-03-15') },
];

// ── WBS PROGRAMS (4 items — Healthcare financial programs) ────────────────────
const programs: WBSItem[] = [
  { id: 'wbs-p-001', accountId: 'acc-001', segment: 'program', code: 'AC', description: 'Acute Care', status: 'active', createdAt: new Date('2023-03-15'), updatedAt: new Date('2023-03-15') },
  { id: 'wbs-p-002', accountId: 'acc-001', segment: 'program', code: 'OP', description: 'Outpatient', status: 'active', createdAt: new Date('2023-03-15'), updatedAt: new Date('2023-03-15') },
  { id: 'wbs-p-003', accountId: 'acc-001', segment: 'program', code: 'RE', description: 'Research', status: 'active', createdAt: new Date('2023-03-15'), updatedAt: new Date('2023-03-15') },
  { id: 'wbs-p-004', accountId: 'acc-001', segment: 'program', code: 'FA', description: 'Facilities', status: 'active', createdAt: new Date('2023-03-15'), updatedAt: new Date('2023-03-15') },
];

export const wbsItems: WBSItem[] = [...costCodes, ...costTypes, ...programs];
