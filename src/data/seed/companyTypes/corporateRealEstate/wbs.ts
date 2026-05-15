import type { WBSItem } from '@/types/shared';

// Programs: CP = Campus Programs, TI = Tenant Improvement, OF = Office Build-Out, MF = Multi-Family
// Cost Types: L, M, E, S, P, F, I, C, O
// Cost Codes: 1.x Soft Costs, 2.x Hard Costs, 3.x Technology, 4.x Owner Indirects, 5.x Contingency

// ── Cost Codes ────────────────────────────────────────────────────────────────
const costCodes: WBSItem[] = [
  // 1.x Soft Costs
  { id: 'wbs-cc-001', accountId: 'acc-001', segment: 'cost_code', code: '1.1', description: 'Programming & Feasibility', status: 'active', createdAt: new Date('2015-01-01'), updatedAt: new Date('2015-01-01') },
  { id: 'wbs-cc-002', accountId: 'acc-001', segment: 'cost_code', code: '1.2', description: 'Architecture & Engineering', status: 'active', createdAt: new Date('2015-01-01'), updatedAt: new Date('2015-01-01') },
  { id: 'wbs-cc-003', accountId: 'acc-001', segment: 'cost_code', code: '1.3', description: 'Permitting & Municipal Fees', status: 'active', createdAt: new Date('2015-01-01'), updatedAt: new Date('2015-01-01') },
  { id: 'wbs-cc-004', accountId: 'acc-001', segment: 'cost_code', code: '1.4', description: 'Legal & Transaction Costs', status: 'active', createdAt: new Date('2015-01-01'), updatedAt: new Date('2015-01-01') },
  // 2.x Hard Costs
  { id: 'wbs-cc-005', accountId: 'acc-001', segment: 'cost_code', code: '2.1', description: 'Demolition & Site Prep', status: 'active', createdAt: new Date('2015-01-01'), updatedAt: new Date('2015-01-01') },
  { id: 'wbs-cc-006', accountId: 'acc-001', segment: 'cost_code', code: '2.2', description: 'Structural & Core & Shell', status: 'active', createdAt: new Date('2015-01-01'), updatedAt: new Date('2015-01-01') },
  { id: 'wbs-cc-007', accountId: 'acc-001', segment: 'cost_code', code: '2.3', description: 'Interior Partitions & Ceilings', status: 'active', createdAt: new Date('2015-01-01'), updatedAt: new Date('2015-01-01') },
  { id: 'wbs-cc-008', accountId: 'acc-001', segment: 'cost_code', code: '2.4', description: 'MEP Systems', status: 'active', createdAt: new Date('2015-01-01'), updatedAt: new Date('2015-01-01') },
  { id: 'wbs-cc-009', accountId: 'acc-001', segment: 'cost_code', code: '2.5', description: 'Interior Finishes & Specialties', status: 'active', createdAt: new Date('2015-01-01'), updatedAt: new Date('2015-01-01') },
  { id: 'wbs-cc-010', accountId: 'acc-001', segment: 'cost_code', code: '2.6', description: 'Exterior Works & Landscaping', status: 'active', createdAt: new Date('2015-01-01'), updatedAt: new Date('2015-01-01') },
  // 3.x Technology
  { id: 'wbs-cc-011', accountId: 'acc-001', segment: 'cost_code', code: '3.1', description: 'Workplace Technology & AV', status: 'active', createdAt: new Date('2015-01-01'), updatedAt: new Date('2015-01-01') },
  { id: 'wbs-cc-012', accountId: 'acc-001', segment: 'cost_code', code: '3.2', description: 'IT Infrastructure & Cabling', status: 'active', createdAt: new Date('2015-01-01'), updatedAt: new Date('2015-01-01') },
  { id: 'wbs-cc-013', accountId: 'acc-001', segment: 'cost_code', code: '3.3', description: 'Security & Access Control', status: 'active', createdAt: new Date('2015-01-01'), updatedAt: new Date('2015-01-01') },
  // 4.x Owner Indirects
  { id: 'wbs-cc-014', accountId: 'acc-001', segment: 'cost_code', code: '4.1', description: 'Furniture, Fixtures & Equipment', status: 'active', createdAt: new Date('2015-01-01'), updatedAt: new Date('2015-01-01') },
  { id: 'wbs-cc-015', accountId: 'acc-001', segment: 'cost_code', code: '4.2', description: 'Move Management & Relocation', status: 'active', createdAt: new Date('2015-01-01'), updatedAt: new Date('2015-01-01') },
  // 5.x Contingency
  { id: 'wbs-cc-016', accountId: 'acc-001', segment: 'cost_code', code: '5.1', description: 'Construction Contingency', status: 'active', createdAt: new Date('2015-01-01'), updatedAt: new Date('2015-01-01') },
  { id: 'wbs-cc-017', accountId: 'acc-001', segment: 'cost_code', code: '5.2', description: 'Program & Escalation Contingency', status: 'active', createdAt: new Date('2015-01-01'), updatedAt: new Date('2015-01-01') },
];

// ── Cost Types ────────────────────────────────────────────────────────────────
const costTypes: WBSItem[] = [
  { id: 'wbs-ct-001', accountId: 'acc-001', segment: 'cost_type', code: 'L', description: 'Labor', status: 'active', createdAt: new Date('2015-01-01'), updatedAt: new Date('2015-01-01') },
  { id: 'wbs-ct-002', accountId: 'acc-001', segment: 'cost_type', code: 'M', description: 'Materials', status: 'active', createdAt: new Date('2015-01-01'), updatedAt: new Date('2015-01-01') },
  { id: 'wbs-ct-003', accountId: 'acc-001', segment: 'cost_type', code: 'E', description: 'Equipment', status: 'active', createdAt: new Date('2015-01-01'), updatedAt: new Date('2015-01-01') },
  { id: 'wbs-ct-004', accountId: 'acc-001', segment: 'cost_type', code: 'S', description: 'Subcontractors', status: 'active', createdAt: new Date('2015-01-01'), updatedAt: new Date('2015-01-01') },
  { id: 'wbs-ct-005', accountId: 'acc-001', segment: 'cost_type', code: 'P', description: 'Professional Services', status: 'active', createdAt: new Date('2015-01-01'), updatedAt: new Date('2015-01-01') },
  { id: 'wbs-ct-006', accountId: 'acc-001', segment: 'cost_type', code: 'F', description: 'Furniture, Fixtures & Equipment', status: 'active', createdAt: new Date('2015-01-01'), updatedAt: new Date('2015-01-01') },
  { id: 'wbs-ct-007', accountId: 'acc-001', segment: 'cost_type', code: 'I', description: 'Insurance & Bonds', status: 'active', createdAt: new Date('2015-01-01'), updatedAt: new Date('2015-01-01') },
  { id: 'wbs-ct-008', accountId: 'acc-001', segment: 'cost_type', code: 'C', description: 'Contingency', status: 'active', createdAt: new Date('2015-01-01'), updatedAt: new Date('2015-01-01') },
  { id: 'wbs-ct-009', accountId: 'acc-001', segment: 'cost_type', code: 'O', description: 'Other', status: 'active', createdAt: new Date('2015-01-01'), updatedAt: new Date('2015-01-01') },
];

// ── Programs ──────────────────────────────────────────────────────────────────
const programs: WBSItem[] = [
  { id: 'wbs-p-001', accountId: 'acc-001', segment: 'program', code: 'CP', description: 'Campus Programs', status: 'active', createdAt: new Date('2015-01-01'), updatedAt: new Date('2015-01-01') },
  { id: 'wbs-p-002', accountId: 'acc-001', segment: 'program', code: 'TI', description: 'Tenant Improvement', status: 'active', createdAt: new Date('2015-01-01'), updatedAt: new Date('2015-01-01') },
  { id: 'wbs-p-003', accountId: 'acc-001', segment: 'program', code: 'OF', description: 'Office Build-Out', status: 'active', createdAt: new Date('2015-01-01'), updatedAt: new Date('2015-01-01') },
  { id: 'wbs-p-004', accountId: 'acc-001', segment: 'program', code: 'MF', description: 'Multi-Family Housing', status: 'active', createdAt: new Date('2015-01-01'), updatedAt: new Date('2015-01-01') },
];

export const wbsItems: WBSItem[] = [...costCodes, ...costTypes, ...programs];
