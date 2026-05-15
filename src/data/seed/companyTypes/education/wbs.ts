import type { WBSItem } from '@/types/shared';

// ── COST CODES (24 items: parent headers + leaf codes) ────────────────────────
// WBS Dictionary — Higher Education Owner standard
const costCodes: WBSItem[] = [
  // 1.0 Pre-Development & Soft Costs
  { id: 'wbs-cc-001', accountId: 'acc-001', segment: 'cost_code', code: '1.0', description: 'Pre-Development & Soft Costs', status: 'active', createdAt: new Date('2022-08-01'), updatedAt: new Date('2022-08-01') },
  { id: 'wbs-cc-002', accountId: 'acc-001', segment: 'cost_code', code: '1.1', description: 'Architectural & Engineering Fees', status: 'active', createdAt: new Date('2022-08-01'), updatedAt: new Date('2022-08-01') },
  { id: 'wbs-cc-003', accountId: 'acc-001', segment: 'cost_code', code: '1.2', description: 'Programming & Pre-Design Studies', status: 'active', createdAt: new Date('2022-08-01'), updatedAt: new Date('2022-08-01') },
  { id: 'wbs-cc-004', accountId: 'acc-001', segment: 'cost_code', code: '1.3', description: 'Permits, Fees & State Agency Review', status: 'active', createdAt: new Date('2022-08-01'), updatedAt: new Date('2022-08-01') },
  { id: 'wbs-cc-005', accountId: 'acc-001', segment: 'cost_code', code: '1.4', description: 'Legal & Procurement Services', status: 'active', createdAt: new Date('2022-08-01'), updatedAt: new Date('2022-08-01') },
  // 2.0 Site Work & Civil
  { id: 'wbs-cc-006', accountId: 'acc-001', segment: 'cost_code', code: '2.0', description: 'Site Work & Civil', status: 'active', createdAt: new Date('2022-08-01'), updatedAt: new Date('2022-08-01') },
  { id: 'wbs-cc-007', accountId: 'acc-001', segment: 'cost_code', code: '2.1', description: 'Demolition & Abatement', status: 'active', createdAt: new Date('2022-08-01'), updatedAt: new Date('2022-08-01') },
  { id: 'wbs-cc-008', accountId: 'acc-001', segment: 'cost_code', code: '2.2', description: 'Site Preparation & Earthwork', status: 'active', createdAt: new Date('2022-08-01'), updatedAt: new Date('2022-08-01') },
  { id: 'wbs-cc-009', accountId: 'acc-001', segment: 'cost_code', code: '2.3', description: 'Site Utilities & Underground', status: 'active', createdAt: new Date('2022-08-01'), updatedAt: new Date('2022-08-01') },
  { id: 'wbs-cc-010', accountId: 'acc-001', segment: 'cost_code', code: '2.4', description: 'Landscaping, Hardscape & Site Restoration', status: 'active', createdAt: new Date('2022-08-01'), updatedAt: new Date('2022-08-01') },
  // 3.0 Building Structure & Envelope
  { id: 'wbs-cc-011', accountId: 'acc-001', segment: 'cost_code', code: '3.0', description: 'Building Structure & Envelope', status: 'active', createdAt: new Date('2022-08-01'), updatedAt: new Date('2022-08-01') },
  { id: 'wbs-cc-012', accountId: 'acc-001', segment: 'cost_code', code: '3.1', description: 'Foundation & Concrete', status: 'active', createdAt: new Date('2022-08-01'), updatedAt: new Date('2022-08-01') },
  { id: 'wbs-cc-013', accountId: 'acc-001', segment: 'cost_code', code: '3.2', description: 'Structural Steel & Framing', status: 'active', createdAt: new Date('2022-08-01'), updatedAt: new Date('2022-08-01') },
  { id: 'wbs-cc-014', accountId: 'acc-001', segment: 'cost_code', code: '3.3', description: 'Exterior Envelope & Roofing', status: 'active', createdAt: new Date('2022-08-01'), updatedAt: new Date('2022-08-01') },
  // 4.0 Interior Construction
  { id: 'wbs-cc-015', accountId: 'acc-001', segment: 'cost_code', code: '4.0', description: 'Interior Construction', status: 'active', createdAt: new Date('2022-08-01'), updatedAt: new Date('2022-08-01') },
  { id: 'wbs-cc-016', accountId: 'acc-001', segment: 'cost_code', code: '4.1', description: 'Partitions, Doors & Frames', status: 'active', createdAt: new Date('2022-08-01'), updatedAt: new Date('2022-08-01') },
  { id: 'wbs-cc-017', accountId: 'acc-001', segment: 'cost_code', code: '4.2', description: 'Finishes & Millwork', status: 'active', createdAt: new Date('2022-08-01'), updatedAt: new Date('2022-08-01') },
  { id: 'wbs-cc-018', accountId: 'acc-001', segment: 'cost_code', code: '4.3', description: 'MEP Systems (Mechanical, Electrical, Plumbing)', status: 'active', createdAt: new Date('2022-08-01'), updatedAt: new Date('2022-08-01') },
  // 5.0 FF&E and Technology
  { id: 'wbs-cc-019', accountId: 'acc-001', segment: 'cost_code', code: '5.0', description: 'FF&E and Technology', status: 'active', createdAt: new Date('2022-08-01'), updatedAt: new Date('2022-08-01') },
  { id: 'wbs-cc-020', accountId: 'acc-001', segment: 'cost_code', code: '5.1', description: 'Furniture, Fixtures & Equipment', status: 'active', createdAt: new Date('2022-08-01'), updatedAt: new Date('2022-08-01') },
  { id: 'wbs-cc-021', accountId: 'acc-001', segment: 'cost_code', code: '5.2', description: 'Audio-Visual, IT & Security', status: 'active', createdAt: new Date('2022-08-01'), updatedAt: new Date('2022-08-01') },
  // 6.0 Owner Indirects & Finance
  { id: 'wbs-cc-022', accountId: 'acc-001', segment: 'cost_code', code: '6.0', description: 'Owner Indirects & Finance', status: 'active', createdAt: new Date('2022-08-01'), updatedAt: new Date('2022-08-01') },
  // 7.0 Contingency & Reserves
  { id: 'wbs-cc-023', accountId: 'acc-001', segment: 'cost_code', code: '7.0', description: 'Contingency & Reserves', status: 'active', createdAt: new Date('2022-08-01'), updatedAt: new Date('2022-08-01') },
  { id: 'wbs-cc-024', accountId: 'acc-001', segment: 'cost_code', code: '7.1', description: 'Construction Contingency', status: 'active', createdAt: new Date('2022-08-01'), updatedAt: new Date('2022-08-01') },
];

// ── COST TYPES (9 items) ───────────────────────────────────────────────────────
const costTypes: WBSItem[] = [
  { id: 'wbs-ct-001', accountId: 'acc-001', segment: 'cost_type', code: 'L', description: 'Labor', status: 'active', createdAt: new Date('2022-08-01'), updatedAt: new Date('2022-08-01') },
  { id: 'wbs-ct-002', accountId: 'acc-001', segment: 'cost_type', code: 'M', description: 'Material', status: 'active', createdAt: new Date('2022-08-01'), updatedAt: new Date('2022-08-01') },
  { id: 'wbs-ct-003', accountId: 'acc-001', segment: 'cost_type', code: 'E', description: 'Equipment', status: 'active', createdAt: new Date('2022-08-01'), updatedAt: new Date('2022-08-01') },
  { id: 'wbs-ct-004', accountId: 'acc-001', segment: 'cost_type', code: 'S', description: 'Subcontract', status: 'active', createdAt: new Date('2022-08-01'), updatedAt: new Date('2022-08-01') },
  { id: 'wbs-ct-005', accountId: 'acc-001', segment: 'cost_type', code: 'P', description: 'Professional Fees', status: 'active', createdAt: new Date('2022-08-01'), updatedAt: new Date('2022-08-01') },
  { id: 'wbs-ct-006', accountId: 'acc-001', segment: 'cost_type', code: 'F', description: 'Permits & Fees', status: 'active', createdAt: new Date('2022-08-01'), updatedAt: new Date('2022-08-01') },
  { id: 'wbs-ct-007', accountId: 'acc-001', segment: 'cost_type', code: 'I', description: 'Insurance & Tax', status: 'active', createdAt: new Date('2022-08-01'), updatedAt: new Date('2022-08-01') },
  { id: 'wbs-ct-008', accountId: 'acc-001', segment: 'cost_type', code: 'C', description: 'Contingency', status: 'active', createdAt: new Date('2022-08-01'), updatedAt: new Date('2022-08-01') },
  { id: 'wbs-ct-009', accountId: 'acc-001', segment: 'cost_type', code: 'O', description: 'Overhead/Other', status: 'active', createdAt: new Date('2022-08-01'), updatedAt: new Date('2022-08-01') },
];

// ── WBS PROGRAMS (4 items — Higher Education financial programs) ──────────────
const programs: WBSItem[] = [
  { id: 'wbs-p-001', accountId: 'acc-001', segment: 'program', code: 'AC', description: 'Academic Buildings', status: 'active', createdAt: new Date('2022-08-01'), updatedAt: new Date('2022-08-01') },
  { id: 'wbs-p-002', accountId: 'acc-001', segment: 'program', code: 'AT', description: 'Athletics', status: 'active', createdAt: new Date('2022-08-01'), updatedAt: new Date('2022-08-01') },
  { id: 'wbs-p-003', accountId: 'acc-001', segment: 'program', code: 'HS', description: 'Housing & Dining', status: 'active', createdAt: new Date('2022-08-01'), updatedAt: new Date('2022-08-01') },
  { id: 'wbs-p-004', accountId: 'acc-001', segment: 'program', code: 'IN', description: 'Infrastructure & Utilities', status: 'active', createdAt: new Date('2022-08-01'), updatedAt: new Date('2022-08-01') },
];

export const wbsItems: WBSItem[] = [...costCodes, ...costTypes, ...programs];
