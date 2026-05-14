import type { WBSItem } from '@/types/shared';

// ── COST CODES (24 items: parent headers + leaf codes) ────────────────────────
// WBS Dictionary — Utility & Infrastructure Owner standard
const costCodes: WBSItem[] = [
  // 1.0 Pre-Development & Soft Costs
  { id: 'wbs-cc-001', accountId: 'acc-001', segment: 'cost_code', code: '1.0', description: 'Pre-Development & Soft Costs', status: 'active', createdAt: new Date('2023-01-10'), updatedAt: new Date('2023-01-10') },
  { id: 'wbs-cc-002', accountId: 'acc-001', segment: 'cost_code', code: '1.1', description: 'Right-of-Way & Easement Acquisition', status: 'active', createdAt: new Date('2023-01-10'), updatedAt: new Date('2023-01-10') },
  { id: 'wbs-cc-003', accountId: 'acc-001', segment: 'cost_code', code: '1.2', description: 'Engineering & Design Fees', status: 'active', createdAt: new Date('2023-01-10'), updatedAt: new Date('2023-01-10') },
  { id: 'wbs-cc-004', accountId: 'acc-001', segment: 'cost_code', code: '1.3', description: 'Permits, Regulatory & Government Fees', status: 'active', createdAt: new Date('2023-01-10'), updatedAt: new Date('2023-01-10') },
  { id: 'wbs-cc-005', accountId: 'acc-001', segment: 'cost_code', code: '1.4', description: 'Environmental Studies & Mitigation', status: 'active', createdAt: new Date('2023-01-10'), updatedAt: new Date('2023-01-10') },
  // 2.0 Civil & Earthwork
  { id: 'wbs-cc-006', accountId: 'acc-001', segment: 'cost_code', code: '2.0', description: 'Civil & Earthwork', status: 'active', createdAt: new Date('2023-01-10'), updatedAt: new Date('2023-01-10') },
  { id: 'wbs-cc-007', accountId: 'acc-001', segment: 'cost_code', code: '2.1', description: 'Site Clearing & Grading', status: 'active', createdAt: new Date('2023-01-10'), updatedAt: new Date('2023-01-10') },
  { id: 'wbs-cc-008', accountId: 'acc-001', segment: 'cost_code', code: '2.2', description: 'Excavation & Trenching', status: 'active', createdAt: new Date('2023-01-10'), updatedAt: new Date('2023-01-10') },
  { id: 'wbs-cc-009', accountId: 'acc-001', segment: 'cost_code', code: '2.3', description: 'Foundations & Structures', status: 'active', createdAt: new Date('2023-01-10'), updatedAt: new Date('2023-01-10') },
  { id: 'wbs-cc-010', accountId: 'acc-001', segment: 'cost_code', code: '2.4', description: 'Pavement, Restoration & Surfacing', status: 'active', createdAt: new Date('2023-01-10'), updatedAt: new Date('2023-01-10') },
  // 3.0 Electrical Infrastructure
  { id: 'wbs-cc-011', accountId: 'acc-001', segment: 'cost_code', code: '3.0', description: 'Electrical Infrastructure', status: 'active', createdAt: new Date('2023-01-10'), updatedAt: new Date('2023-01-10') },
  { id: 'wbs-cc-012', accountId: 'acc-001', segment: 'cost_code', code: '3.1', description: 'Conductors & Cable', status: 'active', createdAt: new Date('2023-01-10'), updatedAt: new Date('2023-01-10') },
  { id: 'wbs-cc-013', accountId: 'acc-001', segment: 'cost_code', code: '3.2', description: 'Switchgear, Transformers & Breakers', status: 'active', createdAt: new Date('2023-01-10'), updatedAt: new Date('2023-01-10') },
  { id: 'wbs-cc-014', accountId: 'acc-001', segment: 'cost_code', code: '3.3', description: 'SCADA, Protection & Controls', status: 'active', createdAt: new Date('2023-01-10'), updatedAt: new Date('2023-01-10') },
  // 4.0 Mechanical / Process Equipment
  { id: 'wbs-cc-015', accountId: 'acc-001', segment: 'cost_code', code: '4.0', description: 'Mechanical / Process Equipment', status: 'active', createdAt: new Date('2023-01-10'), updatedAt: new Date('2023-01-10') },
  { id: 'wbs-cc-016', accountId: 'acc-001', segment: 'cost_code', code: '4.1', description: 'Pumps, Valves & Piping', status: 'active', createdAt: new Date('2023-01-10'), updatedAt: new Date('2023-01-10') },
  { id: 'wbs-cc-017', accountId: 'acc-001', segment: 'cost_code', code: '4.2', description: 'Treatment & Filtration Systems', status: 'active', createdAt: new Date('2023-01-10'), updatedAt: new Date('2023-01-10') },
  { id: 'wbs-cc-018', accountId: 'acc-001', segment: 'cost_code', code: '4.3', description: 'Instrumentation & Metering', status: 'active', createdAt: new Date('2023-01-10'), updatedAt: new Date('2023-01-10') },
  // 5.0 Owner Indirects & Finance
  { id: 'wbs-cc-019', accountId: 'acc-001', segment: 'cost_code', code: '5.0', description: 'Owner Indirects & Finance', status: 'active', createdAt: new Date('2023-01-10'), updatedAt: new Date('2023-01-10') },
  { id: 'wbs-cc-020', accountId: 'acc-001', segment: 'cost_code', code: '5.1', description: 'Owner Project Management', status: 'active', createdAt: new Date('2023-01-10'), updatedAt: new Date('2023-01-10') },
  { id: 'wbs-cc-021', accountId: 'acc-001', segment: 'cost_code', code: '5.2', description: "Insurance (Builder's Risk)", status: 'active', createdAt: new Date('2023-01-10'), updatedAt: new Date('2023-01-10') },
  { id: 'wbs-cc-022', accountId: 'acc-001', segment: 'cost_code', code: '5.3', description: 'Legal & Professional Services', status: 'active', createdAt: new Date('2023-01-10'), updatedAt: new Date('2023-01-10') },
  // 6.0 Contingency & Reserves
  { id: 'wbs-cc-023', accountId: 'acc-001', segment: 'cost_code', code: '6.0', description: 'Contingency & Reserves', status: 'active', createdAt: new Date('2023-01-10'), updatedAt: new Date('2023-01-10') },
  { id: 'wbs-cc-024', accountId: 'acc-001', segment: 'cost_code', code: '6.1', description: 'Construction Contingency', status: 'active', createdAt: new Date('2023-01-10'), updatedAt: new Date('2023-01-10') },
];

// ── COST TYPES (9 items) ───────────────────────────────────────────────────────
const costTypes: WBSItem[] = [
  { id: 'wbs-ct-001', accountId: 'acc-001', segment: 'cost_type', code: 'L', description: 'Labor', status: 'active', createdAt: new Date('2023-01-10'), updatedAt: new Date('2023-01-10') },
  { id: 'wbs-ct-002', accountId: 'acc-001', segment: 'cost_type', code: 'M', description: 'Material', status: 'active', createdAt: new Date('2023-01-10'), updatedAt: new Date('2023-01-10') },
  { id: 'wbs-ct-003', accountId: 'acc-001', segment: 'cost_type', code: 'E', description: 'Equipment', status: 'active', createdAt: new Date('2023-01-10'), updatedAt: new Date('2023-01-10') },
  { id: 'wbs-ct-004', accountId: 'acc-001', segment: 'cost_type', code: 'S', description: 'Subcontract', status: 'active', createdAt: new Date('2023-01-10'), updatedAt: new Date('2023-01-10') },
  { id: 'wbs-ct-005', accountId: 'acc-001', segment: 'cost_type', code: 'P', description: 'Professional Fees', status: 'active', createdAt: new Date('2023-01-10'), updatedAt: new Date('2023-01-10') },
  { id: 'wbs-ct-006', accountId: 'acc-001', segment: 'cost_type', code: 'F', description: 'Permits & Regulatory Fees', status: 'active', createdAt: new Date('2023-01-10'), updatedAt: new Date('2023-01-10') },
  { id: 'wbs-ct-007', accountId: 'acc-001', segment: 'cost_type', code: 'I', description: 'Insurance & Tax', status: 'active', createdAt: new Date('2023-01-10'), updatedAt: new Date('2023-01-10') },
  { id: 'wbs-ct-008', accountId: 'acc-001', segment: 'cost_type', code: 'C', description: 'Contingency', status: 'active', createdAt: new Date('2023-01-10'), updatedAt: new Date('2023-01-10') },
  { id: 'wbs-ct-009', accountId: 'acc-001', segment: 'cost_type', code: 'O', description: 'Overhead/Other', status: 'active', createdAt: new Date('2023-01-10'), updatedAt: new Date('2023-01-10') },
];

// ── WBS PROGRAMS (4 items — Utilities financial programs) ────────────────────
const programs: WBSItem[] = [
  { id: 'wbs-p-001', accountId: 'acc-001', segment: 'program', code: 'ED', description: 'Energy Distribution', status: 'active', createdAt: new Date('2023-01-10'), updatedAt: new Date('2023-01-10') },
  { id: 'wbs-p-002', accountId: 'acc-001', segment: 'program', code: 'EP', description: 'Energy Production & Transmission', status: 'active', createdAt: new Date('2023-01-10'), updatedAt: new Date('2023-01-10') },
  { id: 'wbs-p-003', accountId: 'acc-001', segment: 'program', code: 'WI', description: 'Water Infrastructure', status: 'active', createdAt: new Date('2023-01-10'), updatedAt: new Date('2023-01-10') },
  { id: 'wbs-p-004', accountId: 'acc-001', segment: 'program', code: 'TR', description: 'Transportation & Roads', status: 'active', createdAt: new Date('2023-01-10'), updatedAt: new Date('2023-01-10') },
];

export const wbsItems: WBSItem[] = [...costCodes, ...costTypes, ...programs];
