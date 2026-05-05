/**
 * COMMITMENTS SEED DATA
 * Fields: number, title, vendor, status, contractAmount, executedDate, projectId
 * ~8 per active project (proj-001 to proj-010), 4+ with Bridget O'Sullivan (user-009) as PM
 */

const VENDORS = [
  'Turner Construction', 'DPR Construction', 'Skanska USA', 'Walsh Construction',
  'Hensel Phelps', 'McCarthy Building', 'PCL Construction', 'Gilbane Building',
  'Barton Malow', 'Clark Construction', 'Mortenson Construction', 'JE Dunn Construction',
  'Whiting-Turner', 'Brasfield & Gorrie', 'AECOM Hunt',
];

const STATUSES = ['Approved', 'Pending', 'Executed', 'Draft', 'Void', 'Under Review'];

function fmt(n: number): string {
  return `$${(n / 1000000).toFixed(2)}M`;
}

let seq = 0;

function mkCommitment(
  projectId: string,
  title: string,
  vendor: string,
  status: string,
  amount: number,
  executedDate: string,
) {
  seq++;
  return {
    id: `comm-${String(seq).padStart(4, '0')}`,
    projectId,
    number: seq,
    title,
    vendor,
    status,
    contractAmount: fmt(amount),
    executedDate,
  };
}

export const commitments: any[] = [

  // ── proj-001 · St. Joseph Tower ─────────────────────────────────────────────
  mkCommitment('proj-001', 'GC/CM Construction Management Contract', 'Turner Construction', 'Executed', 148_000_000, '08/15/2023'),
  mkCommitment('proj-001', 'Structural Steel Package', 'Skanska USA', 'Executed', 22_400_000, '09/01/2023'),
  mkCommitment('proj-001', 'Mechanical Systems Contract', 'PCL Construction', 'Executed', 18_700_000, '09/15/2023'),
  mkCommitment('proj-001', 'Electrical Systems Contract', 'Gilbane Building', 'Executed', 15_200_000, '10/01/2023'),
  mkCommitment('proj-001', 'Medical Gas Piping Contract', 'Clark Construction', 'Executed', 4_100_000, '10/15/2023'),
  mkCommitment('proj-001', 'Curtainwall and Glazing Package', 'DPR Construction', 'Approved', 9_800_000, '11/01/2023'),
  mkCommitment('proj-001', 'Elevator and Vertical Transport', 'Walsh Construction', 'Executed', 6_300_000, '11/15/2023'),
  mkCommitment('proj-001', 'FF&E Procurement — Clinical Equipment', 'Hensel Phelps', 'Pending', 12_500_000, ''),
  mkCommitment('proj-001', 'Owner Contingency Reserve — Phase 2', 'Turner Construction', 'Draft', 8_000_000, ''),
  mkCommitment('proj-001', 'IT Infrastructure & Nurse Call Systems', 'McCarthy Building', 'Under Review', 3_200_000, ''),

  // ── proj-002 · Holy Cross Outpatient Pavilion ───────────────────────────────
  mkCommitment('proj-002', 'GC/CM General Conditions Contract', 'Walsh Construction', 'Executed', 76_500_000, '01/15/2024'),
  mkCommitment('proj-002', 'Structural Concrete Package', 'Mortenson Construction', 'Executed', 11_200_000, '02/01/2024'),
  mkCommitment('proj-002', 'Mechanical, Plumbing & HVAC Contract', 'Barton Malow', 'Executed', 14_800_000, '02/15/2024'),
  mkCommitment('proj-002', 'Electrical Distribution Package', 'Clark Construction', 'Executed', 10_400_000, '03/01/2024'),
  mkCommitment('proj-002', 'Exterior Envelope & Cladding', 'JE Dunn Construction', 'Approved', 7_600_000, '03/15/2024'),
  mkCommitment('proj-002', 'Interior Finishes Package', 'Skanska USA', 'Executed', 5_900_000, '04/01/2024'),
  mkCommitment('proj-002', 'Fire Protection Systems', 'DPR Construction', 'Executed', 2_100_000, '04/15/2024'),
  mkCommitment('proj-002', 'Sitework and Utilities Contract', 'Turner Construction', 'Pending', 4_300_000, ''),
  mkCommitment('proj-002', 'Furniture, Fixtures & Equipment', 'Hensel Phelps', 'Under Review', 3_800_000, ''),

  // ── proj-003 · Mercy MOB Phase II ──────────────────────────────────────────
  mkCommitment('proj-003', 'GC/CM Construction Services Contract', 'DPR Construction', 'Executed', 52_000_000, '10/15/2023'),
  mkCommitment('proj-003', 'Structural Steel Erection', 'Mortenson Construction', 'Executed', 8_400_000, '11/01/2023'),
  mkCommitment('proj-003', 'MEP Coordination & Installation', 'McCarthy Building', 'Executed', 11_600_000, '11/15/2023'),
  mkCommitment('proj-003', 'Curtainwall System Supply & Install', 'Walsh Construction', 'Executed', 6_200_000, '12/01/2023'),
  mkCommitment('proj-003', 'Interior Buildout Package', 'PCL Construction', 'Approved', 7_800_000, '12/15/2023'),
  mkCommitment('proj-003', 'Fire Suppression Systems', 'Clark Construction', 'Executed', 1_900_000, '01/01/2024'),
  mkCommitment('proj-003', 'Elevator Supply & Installation', 'Gilbane Building', 'Executed', 2_400_000, '01/15/2024'),
  mkCommitment('proj-003', 'Owner FF&E Procurement', 'JE Dunn Construction', 'Pending', 4_200_000, ''),
  mkCommitment('proj-003', 'Project Signage & Wayfinding', 'Brasfield & Gorrie', 'Draft', 520_000, ''),

  // ── proj-004 · St. Mary's Renovation ───────────────────────────────────────
  mkCommitment('proj-004', 'GC/CM Pre-Construction Services', 'Hensel Phelps', 'Executed', 980_000, '04/15/2026'),
  mkCommitment('proj-004', 'Architectural & Engineering Services', 'Skanska USA', 'Executed', 3_600_000, '02/01/2024'),
  mkCommitment('proj-004', 'GC/CM Construction Contract (Pending NTP)', 'Hensel Phelps', 'Draft', 64_000_000, ''),
  mkCommitment('proj-004', 'Abatement & Hazmat Removal', 'Barton Malow', 'Under Review', 1_200_000, ''),
  mkCommitment('proj-004', 'ICRA Compliance Monitoring Services', 'AECOM Hunt', 'Approved', 480_000, '03/15/2026'),
  mkCommitment('proj-004', 'Technology & AV Package (Pre-Procure)', 'Turner Construction', 'Draft', 2_800_000, ''),
  mkCommitment('proj-004', 'Owner Furniture Allowance Reserve', 'PCL Construction', 'Draft', 1_500_000, ''),

  // ── proj-005 · Loyola Behavioral Health ────────────────────────────────────
  mkCommitment('proj-005', 'GC/CM Construction Management Contract', 'McCarthy Building', 'Executed', 98_000_000, '06/01/2023'),
  mkCommitment('proj-005', 'Structural Frame & Foundation', 'Clark Construction', 'Executed', 14_200_000, '07/01/2023'),
  mkCommitment('proj-005', 'HVAC & Mechanical Systems', 'Walsh Construction', 'Executed', 16_400_000, '07/15/2023'),
  mkCommitment('proj-005', 'Electrical Package', 'JE Dunn Construction', 'Executed', 12_800_000, '08/01/2023'),
  mkCommitment('proj-005', 'Specialty Behavioral Health Hardware', 'DPR Construction', 'Executed', 4_600_000, '09/01/2023'),
  mkCommitment('proj-005', 'Interior Finishes & Millwork', 'Mortenson Construction', 'Approved', 8_200_000, '09/15/2023'),
  mkCommitment('proj-005', 'Site Civil & Underground Utilities', 'Brasfield & Gorrie', 'Executed', 5_400_000, '10/01/2023'),
  mkCommitment('proj-005', 'Medical Gas Systems', 'Skanska USA', 'Executed', 2_900_000, '10/15/2023'),
  mkCommitment('proj-005', 'Kitchen Equipment Package', 'Barton Malow', 'Pending', 1_800_000, ''),
  mkCommitment('proj-005', 'Patient Room FF&E Allowance', 'Turner Construction', 'Draft', 5_200_000, ''),

  // ── proj-006 · Chandler Regional ───────────────────────────────────────────
  mkCommitment('proj-006', 'Architectural Design Services Contract', 'AECOM Hunt', 'Executed', 5_800_000, '06/01/2023'),
  mkCommitment('proj-006', 'GC/CM Pre-Construction Services', 'PCL Construction', 'Executed', 1_200_000, '09/01/2023'),
  mkCommitment('proj-006', 'MEP Engineering Services', 'Gilbane Building', 'Executed', 2_400_000, '10/01/2023'),
  mkCommitment('proj-006', 'GC/CM Construction Contract (Pending Award)', 'PCL Construction', 'Under Review', 108_000_000, ''),
  mkCommitment('proj-006', 'Survey & Geotech Services', 'Walsh Construction', 'Executed', 380_000, '07/01/2023'),
  mkCommitment('proj-006', 'Owner Equipment Allowance Reserve', 'DPR Construction', 'Draft', 8_500_000, ''),
  mkCommitment('proj-006', 'Commissioning Agent Services', 'Barton Malow', 'Approved', 720_000, '01/15/2026'),

  // ── proj-007 · St. Francis ED Modernization ─────────────────────────────────
  mkCommitment('proj-007', 'GC/CM Base Contract', 'JE Dunn Construction', 'Executed', 44_200_000, '03/15/2023'),
  mkCommitment('proj-007', 'MEP Systems Replacement Package', 'Skanska USA', 'Executed', 8_600_000, '04/01/2023'),
  mkCommitment('proj-007', 'HVAC Upgrade & Controls', 'McCarthy Building', 'Executed', 5_200_000, '05/01/2023'),
  mkCommitment('proj-007', 'Electrical Service Upgrade', 'Clark Construction', 'Executed', 3_800_000, '05/15/2023'),
  mkCommitment('proj-007', 'Medical Equipment Planning & Install', 'Turner Construction', 'Executed', 6_100_000, '06/01/2023'),
  mkCommitment('proj-007', 'Interior Renovation Package', 'Walsh Construction', 'Executed', 4_400_000, '07/01/2023'),
  mkCommitment('proj-007', 'Nurse Call & Communications Systems', 'Gilbane Building', 'Executed', 1_600_000, '08/01/2023'),
  mkCommitment('proj-007', 'Final Commissioning Agent', 'Mortenson Construction', 'Approved', 480_000, '01/01/2026'),
  mkCommitment('proj-007', 'Close-out Documentation Services', 'DPR Construction', 'Pending', 220_000, ''),

  // ── proj-008 · Trinity Columbus Specialist Office ───────────────────────────
  mkCommitment('proj-008', 'Architect of Record Contract', 'Brasfield & Gorrie', 'Executed', 3_400_000, '11/01/2023'),
  mkCommitment('proj-008', 'GC/CM Pre-Construction Services', 'Barton Malow', 'Executed', 840_000, '01/15/2024'),
  mkCommitment('proj-008', 'MEP Engineering Contract', 'AECOM Hunt', 'Executed', 1_800_000, '02/01/2024'),
  mkCommitment('proj-008', 'Geotechnical & Surveying Services', 'Skanska USA', 'Executed', 290_000, '12/15/2023'),
  mkCommitment('proj-008', 'GC/CM Construction Contract (Bidding)', 'Barton Malow', 'Pending', 86_000_000, ''),
  mkCommitment('proj-008', 'Owner Contingency Reserve', 'Barton Malow', 'Draft', 5_200_000, ''),
  mkCommitment('proj-008', 'IT Infrastructure Allowance', 'PCL Construction', 'Draft', 2_100_000, ''),

  // ── proj-009 · St. Vincent's Surgical ──────────────────────────────────────
  mkCommitment('proj-009', "GC/CM St. Vincent's Phase 1 Contract", 'Whiting-Turner', 'Executed', 54_800_000, '02/01/2024'),
  mkCommitment('proj-009', 'Surgical Suite MEP Package', 'Turner Construction', 'Executed', 9_200_000, '03/01/2024'),
  mkCommitment('proj-009', 'Medical Gas Systems Contract', 'Walsh Construction', 'Executed', 3_100_000, '03/15/2024'),
  mkCommitment('proj-009', 'HVAC Isolation & Pressurization Systems', 'Clark Construction', 'Executed', 4_600_000, '04/01/2024'),
  mkCommitment('proj-009', 'Robotic Surgery Suite Fit-Out', 'DPR Construction', 'Approved', 7_400_000, '04/15/2024'),
  mkCommitment('proj-009', 'Interior Finishes & Specialty Flooring', 'McCarthy Building', 'Executed', 3_200_000, '05/01/2024'),
  mkCommitment('proj-009', 'Sterile Processing Equipment', 'Gilbane Building', 'Pending', 5_800_000, ''),
  mkCommitment('proj-009', 'Phase 2 Preconstruction Reserve', 'Whiting-Turner', 'Draft', 3_000_000, ''),

  // ── proj-010 · Marian Medical Outpatient Clinic ──────────────────────────────
  mkCommitment('proj-010', 'Architecture & Engineering Contract', 'JE Dunn Construction', 'Executed', 2_100_000, '08/01/2024'),
  mkCommitment('proj-010', 'GC/CM Pre-Construction Services', 'Mortenson Construction', 'Executed', 600_000, '01/15/2025'),
  mkCommitment('proj-010', 'Site Development Services', 'Brasfield & Gorrie', 'Executed', 1_400_000, '11/01/2024'),
  mkCommitment('proj-010', 'GC/CM Construction Contract (Permitting)', 'Mortenson Construction', 'Draft', 34_000_000, ''),
  mkCommitment('proj-010', 'Owner Equipment Procurement Allowance', 'AECOM Hunt', 'Draft', 2_800_000, ''),
  mkCommitment('proj-010', 'Technology & Security Systems', 'Skanska USA', 'Draft', 980_000, ''),
];
