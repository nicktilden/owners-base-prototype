import type { WBSItem } from '@/types/shared';

// Programs: TM = Terminal, AF = Airfield, PA = Parking & Landside, IN = Infrastructure
// Cost Types: L, M, E, S, P, F, I, C, O
// Cost Codes: 1.x Soft Costs, 2.x Hard Costs, 3.x Airfield Systems, 4.x Owner Indirects, 5.x Contingency

// ── Cost Codes ────────────────────────────────────────────────────────────────
const costCodes: WBSItem[] = [
  // 1.x Soft Costs
  { id: 'wbs-cc-001', accountId: 'acc-001', segment: 'cost_code', code: '1.1', description: 'Planning & Feasibility', status: 'active', createdAt: new Date('2018-03-01'), updatedAt: new Date('2018-03-01') },
  { id: 'wbs-cc-002', accountId: 'acc-001', segment: 'cost_code', code: '1.2', description: 'Architectural & Engineering Design', status: 'active', createdAt: new Date('2018-03-01'), updatedAt: new Date('2018-03-01') },
  { id: 'wbs-cc-003', accountId: 'acc-001', segment: 'cost_code', code: '1.3', description: 'Permitting & Regulatory Compliance', status: 'active', createdAt: new Date('2018-03-01'), updatedAt: new Date('2018-03-01') },
  { id: 'wbs-cc-004', accountId: 'acc-001', segment: 'cost_code', code: '1.4', description: 'FAA AIP Grant Administration', status: 'active', createdAt: new Date('2018-03-01'), updatedAt: new Date('2018-03-01') },
  // 2.x Hard Costs
  { id: 'wbs-cc-005', accountId: 'acc-001', segment: 'cost_code', code: '2.1', description: 'Site Preparation & Demolition', status: 'active', createdAt: new Date('2018-03-01'), updatedAt: new Date('2018-03-01') },
  { id: 'wbs-cc-006', accountId: 'acc-001', segment: 'cost_code', code: '2.2', description: 'Structural Concrete & Steel', status: 'active', createdAt: new Date('2018-03-01'), updatedAt: new Date('2018-03-01') },
  { id: 'wbs-cc-007', accountId: 'acc-001', segment: 'cost_code', code: '2.3', description: 'Building Enclosure & Glazing', status: 'active', createdAt: new Date('2018-03-01'), updatedAt: new Date('2018-03-01') },
  { id: 'wbs-cc-008', accountId: 'acc-001', segment: 'cost_code', code: '2.4', description: 'MEP Systems', status: 'active', createdAt: new Date('2018-03-01'), updatedAt: new Date('2018-03-01') },
  { id: 'wbs-cc-009', accountId: 'acc-001', segment: 'cost_code', code: '2.5', description: 'Interior Finishes & Specialties', status: 'active', createdAt: new Date('2018-03-01'), updatedAt: new Date('2018-03-01') },
  { id: 'wbs-cc-010', accountId: 'acc-001', segment: 'cost_code', code: '2.6', description: 'Passenger Boarding Bridges', status: 'active', createdAt: new Date('2018-03-01'), updatedAt: new Date('2018-03-01') },
  // 3.x Airfield Systems
  { id: 'wbs-cc-011', accountId: 'acc-001', segment: 'cost_code', code: '3.1', description: 'Airfield Pavement', status: 'active', createdAt: new Date('2018-03-01'), updatedAt: new Date('2018-03-01') },
  { id: 'wbs-cc-012', accountId: 'acc-001', segment: 'cost_code', code: '3.2', description: 'Airfield Lighting & Signage', status: 'active', createdAt: new Date('2018-03-01'), updatedAt: new Date('2018-03-01') },
  { id: 'wbs-cc-013', accountId: 'acc-001', segment: 'cost_code', code: '3.3', description: 'ILS & Navigation Systems', status: 'active', createdAt: new Date('2018-03-01'), updatedAt: new Date('2018-03-01') },
  // 4.x Owner Indirects
  { id: 'wbs-cc-014', accountId: 'acc-001', segment: 'cost_code', code: '4.1', description: 'Owner Project Management', status: 'active', createdAt: new Date('2018-03-01'), updatedAt: new Date('2018-03-01') },
  { id: 'wbs-cc-015', accountId: 'acc-001', segment: 'cost_code', code: '4.2', description: 'Security & Safety Compliance', status: 'active', createdAt: new Date('2018-03-01'), updatedAt: new Date('2018-03-01') },
  // 5.x Contingency
  { id: 'wbs-cc-016', accountId: 'acc-001', segment: 'cost_code', code: '5.1', description: 'Construction Contingency', status: 'active', createdAt: new Date('2018-03-01'), updatedAt: new Date('2018-03-01') },
  { id: 'wbs-cc-017', accountId: 'acc-001', segment: 'cost_code', code: '5.2', description: 'Program Contingency', status: 'active', createdAt: new Date('2018-03-01'), updatedAt: new Date('2018-03-01') },
];

// ── Cost Types ────────────────────────────────────────────────────────────────
const costTypes: WBSItem[] = [
  { id: 'wbs-ct-001', accountId: 'acc-001', segment: 'cost_type', code: 'L', description: 'Labor', status: 'active', createdAt: new Date('2018-03-01'), updatedAt: new Date('2018-03-01') },
  { id: 'wbs-ct-002', accountId: 'acc-001', segment: 'cost_type', code: 'M', description: 'Materials', status: 'active', createdAt: new Date('2018-03-01'), updatedAt: new Date('2018-03-01') },
  { id: 'wbs-ct-003', accountId: 'acc-001', segment: 'cost_type', code: 'E', description: 'Equipment', status: 'active', createdAt: new Date('2018-03-01'), updatedAt: new Date('2018-03-01') },
  { id: 'wbs-ct-004', accountId: 'acc-001', segment: 'cost_type', code: 'S', description: 'Subcontractors', status: 'active', createdAt: new Date('2018-03-01'), updatedAt: new Date('2018-03-01') },
  { id: 'wbs-ct-005', accountId: 'acc-001', segment: 'cost_type', code: 'P', description: 'Professional Services', status: 'active', createdAt: new Date('2018-03-01'), updatedAt: new Date('2018-03-01') },
  { id: 'wbs-ct-006', accountId: 'acc-001', segment: 'cost_type', code: 'F', description: 'FAA Grants & Reimbursables', status: 'active', createdAt: new Date('2018-03-01'), updatedAt: new Date('2018-03-01') },
  { id: 'wbs-ct-007', accountId: 'acc-001', segment: 'cost_type', code: 'I', description: 'Insurance & Bonds', status: 'active', createdAt: new Date('2018-03-01'), updatedAt: new Date('2018-03-01') },
  { id: 'wbs-ct-008', accountId: 'acc-001', segment: 'cost_type', code: 'C', description: 'Contingency', status: 'active', createdAt: new Date('2018-03-01'), updatedAt: new Date('2018-03-01') },
  { id: 'wbs-ct-009', accountId: 'acc-001', segment: 'cost_type', code: 'O', description: 'Other', status: 'active', createdAt: new Date('2018-03-01'), updatedAt: new Date('2018-03-01') },
];

// ── Programs ──────────────────────────────────────────────────────────────────
const programs: WBSItem[] = [
  { id: 'wbs-p-001', accountId: 'acc-001', segment: 'program', code: 'TM', description: 'Terminal Programs', status: 'active', createdAt: new Date('2018-03-01'), updatedAt: new Date('2018-03-01') },
  { id: 'wbs-p-002', accountId: 'acc-001', segment: 'program', code: 'AF', description: 'Airfield Programs', status: 'active', createdAt: new Date('2018-03-01'), updatedAt: new Date('2018-03-01') },
  { id: 'wbs-p-003', accountId: 'acc-001', segment: 'program', code: 'PA', description: 'Parking & Landside', status: 'active', createdAt: new Date('2018-03-01'), updatedAt: new Date('2018-03-01') },
  { id: 'wbs-p-004', accountId: 'acc-001', segment: 'program', code: 'IN', description: 'Infrastructure & Connectivity', status: 'active', createdAt: new Date('2018-03-01'), updatedAt: new Date('2018-03-01') },
];

export const wbsItems: WBSItem[] = [...costCodes, ...costTypes, ...programs];
