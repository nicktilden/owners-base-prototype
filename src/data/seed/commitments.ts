/**
 * COMMITMENTS SEED DATA
 * Fields: id, projectId, number, contractCompany, title, status, executed,
 *         ssovStatus, originalContractAmount, approvedChangeOrders,
 *         revisedContractAmount, pendingChangeOrders, draftChangeOrders,
 *         invoiced, paymentsIssued, percentPaid, remainingBalance, private,
 *         contractAmount (legacy alias), executedDate (legacy alias), vendor (legacy alias)
 */

const STATUSES = ['Approved', 'Pending', 'Executed', 'Draft', 'Void', 'Under Review', 'Complete'];
const SSOV_STATUSES = ['Approved', 'Draft', 'Pending', ''];

function fmtDollar(n: number): string {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtPct(n: number): string {
  return `${n.toFixed(2)}%`;
}

let seq = 0;

function mkCommitment(
  projectId: string,
  numberLabel: string,
  title: string,
  contractCompany: string,
  status: string,
  executed: string,
  ssovStatus: string,
  originalContractAmount: number,
  approvedChangeOrders: number,
  pendingChangeOrders: number,
  draftChangeOrders: number,
  invoiced: number,
  paymentsIssued: number,
  isPrivate: boolean,
) {
  seq++;
  const revisedContractAmount = originalContractAmount + approvedChangeOrders;
  const percentPaid = revisedContractAmount > 0 ? (paymentsIssued / revisedContractAmount) * 100 : 0;
  const remainingBalance = revisedContractAmount - paymentsIssued;
  return {
    id: `comm-${String(seq).padStart(4, '0')}`,
    projectId,
    number: numberLabel,
    title,
    contractCompany,
    // legacy aliases kept for backward compat
    vendor: contractCompany,
    status,
    executed,
    ssovStatus,
    originalContractAmount: fmtDollar(originalContractAmount),
    approvedChangeOrders: fmtDollar(approvedChangeOrders),
    revisedContractAmount: fmtDollar(revisedContractAmount),
    pendingChangeOrders: fmtDollar(pendingChangeOrders),
    draftChangeOrders: fmtDollar(draftChangeOrders),
    invoiced: fmtDollar(invoiced),
    paymentsIssued: fmtDollar(paymentsIssued),
    percentPaid: fmtPct(percentPaid),
    remainingBalance: fmtDollar(remainingBalance),
    private: isPrivate ? 'Yes' : 'No',
    // legacy fields
    contractAmount: fmtDollar(originalContractAmount),
    executedDate: executed,
  };
}

export const commitments: any[] = [

  // ── proj-001 · St. Joseph Tower ─────────────────────────────────────────────
  mkCommitment('proj-001', 'SC-001-001', 'Earth Work & Landscaping', 'Tilden Construction', 'Complete', 'Yes', 'Approved', 1_141_941, 65_000, 0, 19_280, 218_186.97, 0, true),
  mkCommitment('proj-001', 'SC-001-002', 'Concrete & Masonry', 'Smooth Concrete', 'Complete', 'Yes', 'Approved', 2_862_021, 7_584, 0, 700, 0, 0, true),
  mkCommitment('proj-001', 'SC-001-003', 'Steel — Misc. Metal', 'Jet Steel Co.', 'Approved', 'Yes', 'Approved', 1_801_436, 0, 0, 24_500, 0, 0, true),
  mkCommitment('proj-001', 'SC-001-004', 'Rough & Finish Carpentry', 'Stick Framers', 'Approved', 'Yes', 'Approved', 2_218_020, 0, 0, 0, 0, 0, true),
  mkCommitment('proj-001', 'SC-001-005', 'Doors & Windows', 'Swinging Doors', 'Approved', 'Yes', 'Draft', 1_158_000, 30_000, 0, 400, 0, 0, true),
  mkCommitment('proj-001', 'SC-001-006', 'Drywall, Paint & Coatings', 'Drywall Gunners', 'Approved', 'Yes', 'Draft', 646_800, 0, 0, 0, 0, 0, true),
  mkCommitment('proj-001', 'PO-001-001', 'Supply of Owner Installed Equipment', "Ben's Sprinklers and Landscapes", 'Approved', 'Yes', '', 239_142, 344_761.48, 0, 0, 0, 0, true),
  mkCommitment('proj-001', 'SC-001-007', 'Flooring', 'Flooring Specialists', 'Approved', 'Yes', 'Draft', 749_770, 0, 0, 7_501.23, 0, 0, true),
  mkCommitment('proj-001', 'SC-001-008', 'Mechanical Systems', 'PCL Construction', 'Executed', 'Yes', 'Approved', 18_700_000, 520_000, 0, 380_000, 4_200_000, 4_200_000, true),
  mkCommitment('proj-001', 'SC-001-009', 'Electrical Systems', 'Gilbane Building', 'Executed', 'Yes', 'Approved', 15_200_000, 640_000, 0, 0, 3_100_000, 3_100_000, true),
  mkCommitment('proj-001', 'SC-001-010', 'FF&E Clinical Equipment', 'Hensel Phelps', 'Pending', '', '', 12_500_000, 0, 0, 0, 0, 0, true),

  // ── proj-002 · Holy Cross Outpatient Pavilion ───────────────────────────────
  mkCommitment('proj-002', 'SC-002-001', 'GC/CM General Conditions', 'Walsh Construction', 'Executed', 'Yes', 'Approved', 76_500_000, 0, 380_000, 142_000, 12_400_000, 12_400_000, true),
  mkCommitment('proj-002', 'SC-002-002', 'Structural Concrete Package', 'Mortenson Construction', 'Executed', 'Yes', 'Approved', 11_200_000, 310_000, 0, 0, 2_800_000, 2_800_000, true),
  mkCommitment('proj-002', 'SC-002-003', 'Mechanical, Plumbing & HVAC', 'Barton Malow', 'Executed', 'Yes', 'Approved', 14_800_000, 0, 0, 0, 3_600_000, 3_600_000, true),
  mkCommitment('proj-002', 'SC-002-004', 'Electrical Distribution', 'Clark Construction', 'Executed', 'Yes', 'Approved', 10_400_000, 162_000, 0, 0, 2_400_000, 2_400_000, true),
  mkCommitment('proj-002', 'SC-002-005', 'Exterior Envelope & Cladding', 'JE Dunn Construction', 'Approved', 'Yes', 'Draft', 7_600_000, 480_000, 0, 0, 0, 0, true),
  mkCommitment('proj-002', 'SC-002-006', 'Interior Finishes Package', 'Skanska USA', 'Executed', 'Yes', 'Approved', 5_900_000, 0, 0, 0, 1_200_000, 1_200_000, true),
  mkCommitment('proj-002', 'SC-002-007', 'Fire Protection Systems', 'DPR Construction', 'Executed', 'Yes', 'Approved', 2_100_000, 95_000, 0, 0, 580_000, 580_000, true),
  mkCommitment('proj-002', 'SC-002-008', 'Sitework and Utilities', 'Turner Construction', 'Pending', '', '', 4_300_000, 0, 0, 0, 0, 0, true),
  mkCommitment('proj-002', 'SC-002-009', 'Furniture, Fixtures & Equipment', 'Hensel Phelps', 'Under Review', '', '', 3_800_000, 0, 0, 0, 0, 0, true),

  // ── proj-003 · Mercy MOB Phase II ──────────────────────────────────────────
  mkCommitment('proj-003', 'SC-003-001', 'GC/CM Construction Services', 'DPR Construction', 'Executed', 'Yes', 'Approved', 52_000_000, 0, 95_000, 0, 18_200_000, 18_200_000, true),
  mkCommitment('proj-003', 'SC-003-002', 'Structural Steel Erection', 'Mortenson Construction', 'Executed', 'Yes', 'Approved', 8_400_000, 78_000, 0, 0, 4_800_000, 4_800_000, true),
  mkCommitment('proj-003', 'SC-003-003', 'MEP Coordination & Installation', 'McCarthy Building', 'Executed', 'Yes', 'Approved', 11_600_000, 124_000, 0, 0, 7_200_000, 7_200_000, true),
  mkCommitment('proj-003', 'SC-003-004', 'Curtainwall System Supply & Install', 'Walsh Construction', 'Executed', 'Yes', 'Approved', 6_200_000, 0, 0, 0, 6_200_000, 6_200_000, true),
  mkCommitment('proj-003', 'SC-003-005', 'Interior Buildout Package', 'PCL Construction', 'Approved', 'Yes', 'Draft', 7_800_000, 215_000, 0, 0, 0, 0, true),
  mkCommitment('proj-003', 'SC-003-006', 'Fire Suppression Systems', 'Clark Construction', 'Executed', 'Yes', 'Approved', 1_900_000, 32_000, 0, 0, 1_932_000, 1_932_000, true),
  mkCommitment('proj-003', 'SC-003-007', 'Elevator Supply & Installation', 'Gilbane Building', 'Executed', 'Yes', 'Approved', 2_400_000, 186_000, 0, 0, 2_586_000, 2_586_000, true),
  mkCommitment('proj-003', 'SC-003-008', 'Owner FF&E Procurement', 'JE Dunn Construction', 'Pending', '', '', 4_200_000, 0, 0, 0, 0, 0, true),
  mkCommitment('proj-003', 'SC-003-009', 'Project Signage & Wayfinding', 'Brasfield & Gorrie', 'Draft', '', '', 520_000, 0, 0, 0, 0, 0, true),

  // ── proj-004 · St. Mary's Renovation ───────────────────────────────────────
  mkCommitment('proj-004', 'SC-004-001', 'GC/CM Pre-Construction Services', 'Hensel Phelps', 'Executed', 'Yes', 'Approved', 980_000, 0, 120_000, 0, 980_000, 980_000, true),
  mkCommitment('proj-004', 'SC-004-002', 'Architectural & Engineering Services', 'Skanska USA', 'Executed', 'Yes', 'Approved', 3_600_000, 0, 0, 0, 2_100_000, 2_100_000, true),
  mkCommitment('proj-004', 'SC-004-003', 'GC/CM Construction Contract (Pending NTP)', 'Hensel Phelps', 'Draft', '', '', 64_000_000, 0, 0, 0, 0, 0, true),
  mkCommitment('proj-004', 'SC-004-004', 'Abatement & Hazmat Removal', 'Barton Malow', 'Under Review', '', '', 1_200_000, 280_000, 0, 190_000, 0, 0, true),
  mkCommitment('proj-004', 'SC-004-005', 'ICRA Compliance Monitoring', 'AECOM Hunt', 'Approved', 'Yes', 'Approved', 480_000, 0, 0, 0, 0, 0, true),
  mkCommitment('proj-004', 'SC-004-006', 'Technology & AV Package', 'Turner Construction', 'Draft', '', '', 2_800_000, 0, 0, 0, 0, 0, true),
  mkCommitment('proj-004', 'SC-004-007', 'Owner Furniture Allowance Reserve', 'PCL Construction', 'Draft', '', '', 1_500_000, 0, 0, 0, 0, 0, true),

  // ── proj-005 · Loyola Behavioral Health ────────────────────────────────────
  mkCommitment('proj-005', 'SC-005-001', 'GC/CM Construction Management', 'McCarthy Building', 'Executed', 'Yes', 'Approved', 98_000_000, 0, 0, -520_000, 42_000_000, 42_000_000, true),
  mkCommitment('proj-005', 'SC-005-002', 'Structural Frame & Foundation', 'Clark Construction', 'Executed', 'Yes', 'Approved', 14_200_000, 420_000, 0, 0, 14_620_000, 14_620_000, true),
  mkCommitment('proj-005', 'SC-005-003', 'HVAC & Mechanical Systems', 'Walsh Construction', 'Executed', 'Yes', 'Approved', 16_400_000, 580_000, 0, 0, 16_980_000, 16_980_000, true),
  mkCommitment('proj-005', 'SC-005-004', 'Electrical Package', 'JE Dunn Construction', 'Executed', 'Yes', 'Approved', 12_800_000, 0, 0, 0, 12_800_000, 12_800_000, true),
  mkCommitment('proj-005', 'SC-005-005', 'Specialty Behavioral Health Hardware', 'DPR Construction', 'Executed', 'Yes', 'Approved', 4_600_000, 340_000, 0, 0, 4_940_000, 4_940_000, true),
  mkCommitment('proj-005', 'SC-005-006', 'Interior Finishes & Millwork', 'Mortenson Construction', 'Approved', 'Yes', 'Approved', 8_200_000, 285_000, 0, 0, 0, 0, true),
  mkCommitment('proj-005', 'SC-005-007', 'Site Civil & Underground Utilities', 'Brasfield & Gorrie', 'Executed', 'Yes', 'Approved', 5_400_000, 145_000, 0, 0, 5_545_000, 5_545_000, true),
  mkCommitment('proj-005', 'SC-005-008', 'Medical Gas Systems', 'Skanska USA', 'Executed', 'Yes', 'Approved', 2_900_000, 0, 0, 0, 2_900_000, 2_900_000, true),
  mkCommitment('proj-005', 'SC-005-009', 'Kitchen Equipment Package', 'Barton Malow', 'Pending', '', '', 1_800_000, -180_000, 0, 0, 0, 0, true),
  mkCommitment('proj-005', 'SC-005-010', 'Patient Room FF&E Allowance', 'Turner Construction', 'Draft', '', '', 5_200_000, -520_000, 0, 0, 0, 0, true),

  // ── proj-006 · Chandler Regional ───────────────────────────────────────────
  mkCommitment('proj-006', 'SC-006-001', 'Architectural Design Services', 'AECOM Hunt', 'Executed', 'Yes', 'Approved', 5_800_000, 0, 0, 0, 2_900_000, 2_900_000, true),
  mkCommitment('proj-006', 'SC-006-002', 'GC/CM Pre-Construction Services', 'PCL Construction', 'Executed', 'Yes', 'Approved', 1_200_000, 0, 320_000, 0, 1_200_000, 1_200_000, true),
  mkCommitment('proj-006', 'SC-006-003', 'MEP Engineering Services', 'Gilbane Building', 'Executed', 'Yes', 'Approved', 2_400_000, 0, 0, 0, 1_200_000, 1_200_000, true),
  mkCommitment('proj-006', 'SC-006-004', 'GC/CM Construction Contract (Pending Award)', 'PCL Construction', 'Under Review', '', '', 108_000_000, 1_200_000, 0, 850_000, 0, 0, true),
  mkCommitment('proj-006', 'SC-006-005', 'Survey & Geotech Services', 'Walsh Construction', 'Executed', 'Yes', 'Approved', 380_000, 680_000, 240_000, 0, 380_000, 380_000, true),
  mkCommitment('proj-006', 'SC-006-006', 'Owner Equipment Allowance Reserve', 'DPR Construction', 'Draft', '', '', 8_500_000, 0, 0, 0, 0, 0, true),
  mkCommitment('proj-006', 'SC-006-007', 'Commissioning Agent Services', 'Barton Malow', 'Approved', 'Yes', 'Approved', 720_000, 0, 0, 0, 0, 0, true),

  // ── proj-007 · St. Francis ED Modernization ─────────────────────────────────
  mkCommitment('proj-007', 'SC-007-001', 'GC/CM Base Contract', 'JE Dunn Construction', 'Executed', 'Yes', 'Approved', 44_200_000, 0, 68_000, 0, 44_200_000, 44_200_000, true),
  mkCommitment('proj-007', 'SC-007-002', 'MEP Systems Replacement', 'Skanska USA', 'Executed', 'Yes', 'Approved', 8_600_000, 0, 0, 0, 8_600_000, 8_600_000, true),
  mkCommitment('proj-007', 'SC-007-003', 'HVAC Upgrade & Controls', 'McCarthy Building', 'Executed', 'Yes', 'Approved', 5_200_000, 0, 245_000, 0, 5_200_000, 5_200_000, true),
  mkCommitment('proj-007', 'SC-007-004', 'Electrical Service Upgrade', 'Clark Construction', 'Executed', 'Yes', 'Approved', 3_800_000, 195_000, 0, 0, 3_995_000, 3_995_000, true),
  mkCommitment('proj-007', 'SC-007-005', 'Medical Equipment Planning & Install', 'Turner Construction', 'Executed', 'Yes', 'Approved', 6_100_000, 165_000, 0, 0, 6_265_000, 6_265_000, true),
  mkCommitment('proj-007', 'SC-007-006', 'Interior Renovation Package', 'Walsh Construction', 'Executed', 'Yes', 'Approved', 4_400_000, 420_000, 0, 0, 4_820_000, 4_820_000, true),
  mkCommitment('proj-007', 'SC-007-007', 'Nurse Call & Communications', 'Gilbane Building', 'Executed', 'Yes', 'Approved', 1_600_000, 88_000, 0, 0, 1_688_000, 1_688_000, true),
  mkCommitment('proj-007', 'SC-007-008', 'Final Commissioning Agent', 'Mortenson Construction', 'Approved', 'Yes', 'Draft', 480_000, 0, 0, 0, 0, 0, true),
  mkCommitment('proj-007', 'SC-007-009', 'Close-out Documentation Services', 'DPR Construction', 'Pending', '', '', 220_000, 0, 0, 0, 0, 0, true),

  // ── proj-008 · Trinity Columbus Specialist Office ───────────────────────────
  mkCommitment('proj-008', 'SC-008-001', 'Architect of Record Contract', 'Brasfield & Gorrie', 'Executed', 'Yes', 'Approved', 3_400_000, 0, 0, 0, 1_700_000, 1_700_000, true),
  mkCommitment('proj-008', 'SC-008-002', 'GC/CM Pre-Construction Services', 'Barton Malow', 'Executed', 'Yes', 'Approved', 840_000, 485_000, 620_000, 210_000, 840_000, 840_000, true),
  mkCommitment('proj-008', 'SC-008-003', 'MEP Engineering Contract', 'AECOM Hunt', 'Executed', 'Yes', 'Approved', 1_800_000, 0, 0, 0, 900_000, 900_000, true),
  mkCommitment('proj-008', 'SC-008-004', 'Geotechnical & Surveying Services', 'Skanska USA', 'Executed', 'Yes', 'Approved', 290_000, 0, 0, 0, 290_000, 290_000, true),
  mkCommitment('proj-008', 'SC-008-005', 'GC/CM Construction Contract (Bidding)', 'Barton Malow', 'Pending', '', '', 86_000_000, 0, 185_000, 0, 0, 0, true),
  mkCommitment('proj-008', 'SC-008-006', 'Owner Contingency Reserve', 'Barton Malow', 'Draft', '', '', 5_200_000, 0, 0, 0, 0, 0, true),
  mkCommitment('proj-008', 'SC-008-007', 'IT Infrastructure Allowance', 'PCL Construction', 'Draft', '', '', 2_100_000, 0, 0, 0, 0, 0, true),

  // ── proj-009 · St. Vincent's Surgical ──────────────────────────────────────
  mkCommitment('proj-009', 'SC-009-001', "GC/CM Phase 1 Contract", 'Whiting-Turner', 'Executed', 'Yes', 'Approved', 54_800_000, 0, 300_000, 0, 38_360_000, 38_360_000, true),
  mkCommitment('proj-009', 'SC-009-002', 'Surgical Suite MEP Package', 'Turner Construction', 'Executed', 'Yes', 'Approved', 9_200_000, 148_000, 0, 0, 9_348_000, 9_348_000, true),
  mkCommitment('proj-009', 'SC-009-003', 'Medical Gas Systems Contract', 'Walsh Construction', 'Executed', 'Yes', 'Approved', 3_100_000, 95_000, 0, 0, 3_195_000, 3_195_000, true),
  mkCommitment('proj-009', 'SC-009-004', 'HVAC Isolation & Pressurization', 'Clark Construction', 'Executed', 'Yes', 'Approved', 4_600_000, 580_000, 0, 0, 5_180_000, 5_180_000, true),
  mkCommitment('proj-009', 'SC-009-005', 'Robotic Surgery Suite Fit-Out', 'DPR Construction', 'Approved', 'Yes', 'Approved', 7_400_000, 820_000, 0, 0, 0, 0, true),
  mkCommitment('proj-009', 'SC-009-006', 'Interior Finishes & Specialty Flooring', 'McCarthy Building', 'Executed', 'Yes', 'Approved', 3_200_000, 0, 0, -580_000, 3_200_000, 3_200_000, true),
  mkCommitment('proj-009', 'SC-009-007', 'Sterile Processing Equipment', 'Gilbane Building', 'Pending', '', '', 5_800_000, 0, 0, 0, 0, 0, true),
  mkCommitment('proj-009', 'SC-009-008', 'Phase 2 Preconstruction Reserve', 'Whiting-Turner', 'Draft', '', '', 3_000_000, 0, 0, 0, 0, 0, true),

  // ── proj-010 · Marian Medical Outpatient Clinic ──────────────────────────────
  mkCommitment('proj-010', 'SC-010-001', 'Architecture & Engineering Contract', 'JE Dunn Construction', 'Executed', 'Yes', 'Approved', 2_100_000, 0, 0, 0, 1_050_000, 1_050_000, true),
  mkCommitment('proj-010', 'SC-010-002', 'GC/CM Pre-Construction Services', 'Mortenson Construction', 'Executed', 'Yes', 'Approved', 600_000, 385_000, 0, 0, 600_000, 600_000, true),
  mkCommitment('proj-010', 'SC-010-003', 'Site Development Services', 'Brasfield & Gorrie', 'Executed', 'Yes', 'Approved', 1_400_000, 0, 0, 0, 700_000, 700_000, true),
  mkCommitment('proj-010', 'SC-010-004', 'GC/CM Construction Contract (Permitting)', 'Mortenson Construction', 'Draft', '', '', 34_000_000, 0, 620_000, 285_000, 0, 0, true),
  mkCommitment('proj-010', 'SC-010-005', 'Owner Equipment Procurement Allowance', 'AECOM Hunt', 'Draft', '', '', 2_800_000, 0, 0, 0, 0, 0, true),
  mkCommitment('proj-010', 'SC-010-006', 'Technology & Security Systems', 'Skanska USA', 'Draft', '', '', 980_000, 0, 148_000, 0, 0, 0, true),
];
