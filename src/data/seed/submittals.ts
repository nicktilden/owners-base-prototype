/**
 * SUBMITTALS SEED DATA
 * Fields: id, projectId, number, title, type, status, responsibleContractor, dueDate, specSection, createdBy
 * ~8 per project (proj-001 to proj-010)
 */

const SUB_TYPES = ['Shop Drawings', 'Product Data', 'Samples', 'O&M Manuals', 'Test Reports', 'Certificates', 'Closeout'];
const SUB_STATUSES = ['Approved', 'Approved as Noted', 'Revise and Resubmit', 'Under Review', 'Pending Submission', 'Rejected', 'Void'];

let seq = 0;

function mkSub(
  projectId: string,
  title: string,
  type: string,
  status: string,
  responsibleContractor: string,
  dueDate: string,
  specSection: string,
  createdBy: string,
) {
  seq++;
  return {
    id: `sub-${String(seq).padStart(4, '0')}`,
    projectId,
    number: seq,
    title,
    type,
    status,
    responsibleContractor,
    dueDate,
    specSection,
    createdBy,
  };
}

export const submittals: any[] = [

  // ── proj-001 · St. Joseph Tower ─────────────────────────────────────────────
  mkSub('proj-001', 'Structural Steel Shop Drawings — Levels 1-6', 'Shop Drawings', 'Approved', 'Skanska USA', '09/15/2023', '051200', 'Alex Rivera'),
  mkSub('proj-001', 'Structural Steel Shop Drawings — Levels 7-12', 'Shop Drawings', 'Approved as Noted', 'Skanska USA', '10/01/2023', '051200', 'Alex Rivera'),
  mkSub('proj-001', 'Curtainwall System Product Data', 'Product Data', 'Approved', 'DPR Construction', '10/15/2023', '088000', 'Jordan Lee'),
  mkSub('proj-001', 'Curtainwall Glazing Unit Shop Drawings', 'Shop Drawings', 'Approved as Noted', 'DPR Construction', '11/01/2023', '088000', 'Jordan Lee'),
  mkSub('proj-001', 'Medical Gas Piping System Product Data', 'Product Data', 'Approved', 'Clark Construction', '11/15/2023', '221410', 'Sam Torres'),
  mkSub('proj-001', 'HVAC AHU Product Data — Levels 5-8', 'Product Data', 'Under Review', 'PCL Construction', '12/01/2023', '233100', 'Sam Torres'),
  mkSub('proj-001', 'Elevator Machine Room Equipment', 'Product Data', 'Approved', 'Walsh Construction', '12/15/2023', '142100', 'Morgan Kim'),
  mkSub('proj-001', 'Electrical Switchgear Shop Drawings', 'Shop Drawings', 'Approved as Noted', 'Gilbane Building', '01/01/2024', '262000', 'Morgan Kim'),
  mkSub('proj-001', 'FF&E Clinical Equipment Samples — Patient Rooms', 'Samples', 'Pending Submission', 'Hensel Phelps', '02/01/2024', '115000', 'Alex Rivera'),
  mkSub('proj-001', 'IT Infrastructure O&M Manual — Nurse Call', 'O&M Manuals', 'Pending Submission', 'McCarthy Building', '03/01/2024', '274000', 'Morgan Kim'),

  // ── proj-002 · Holy Cross Outpatient Pavilion ───────────────────────────────
  mkSub('proj-002', 'Structural Concrete Mix Design — Foundation', 'Test Reports', 'Approved', 'Mortenson Construction', '02/10/2024', '033000', 'Alex Rivera'),
  mkSub('proj-002', 'Structural Concrete Mix Design — Superstructure', 'Test Reports', 'Approved', 'Mortenson Construction', '02/25/2024', '033000', 'Alex Rivera'),
  mkSub('proj-002', 'Exterior Cladding System Shop Drawings', 'Shop Drawings', 'Approved as Noted', 'JE Dunn Construction', '03/15/2024', '074200', 'Jordan Lee'),
  mkSub('proj-002', 'HVAC VAV Box Product Data', 'Product Data', 'Approved', 'Barton Malow', '03/01/2024', '233100', 'Sam Torres'),
  mkSub('proj-002', 'Electrical Distribution Panel Shop Drawings', 'Shop Drawings', 'Under Review', 'Clark Construction', '04/01/2024', '262000', 'Morgan Kim'),
  mkSub('proj-002', 'Interior Finishes — Flooring Product Data', 'Product Data', 'Approved', 'Skanska USA', '04/15/2024', '096500', 'Alex Rivera'),
  mkSub('proj-002', 'Fire Sprinkler System Shop Drawings', 'Shop Drawings', 'Approved', 'DPR Construction', '04/20/2024', '211000', 'Sam Torres'),
  mkSub('proj-002', 'FF&E Product Data — Patient Waiting', 'Product Data', 'Pending Submission', 'Hensel Phelps', '06/01/2024', '115000', 'Jordan Lee'),

  // ── proj-003 · Mercy MOB Phase II ──────────────────────────────────────────
  mkSub('proj-003', 'Structural Steel Shop Drawings — Main Frame', 'Shop Drawings', 'Approved', 'Mortenson Construction', '11/10/2023', '051200', 'Alex Rivera'),
  mkSub('proj-003', 'Curtainwall System Shop Drawings', 'Shop Drawings', 'Approved', 'Walsh Construction', '12/01/2023', '088000', 'Jordan Lee'),
  mkSub('proj-003', 'MEP Coordination BIM Model — Level 2', 'Test Reports', 'Approved as Noted', 'McCarthy Building', '12/15/2023', '013100', 'Sam Torres'),
  mkSub('proj-003', 'Interior Partition Product Data — Exam Rooms', 'Product Data', 'Approved', 'PCL Construction', '01/05/2024', '092900', 'Alex Rivera'),
  mkSub('proj-003', 'Fire Suppression — Dry Chemical Product Data', 'Product Data', 'Approved', 'Clark Construction', '01/10/2024', '211000', 'Sam Torres'),
  mkSub('proj-003', 'Elevator Cab Finishes Samples', 'Samples', 'Approved', 'Gilbane Building', '01/20/2024', '142100', 'Morgan Kim'),
  mkSub('proj-003', 'Signage and Wayfinding Product Data', 'Product Data', 'Pending Submission', 'Brasfield & Gorrie', '03/01/2024', '101400', 'Alex Rivera'),
  mkSub('proj-003', 'FF&E Product Data — Medical Office Furniture', 'Product Data', 'Pending Submission', 'JE Dunn Construction', '03/15/2024', '115000', 'Jordan Lee'),

  // ── proj-004 · St. Mary's Renovation ───────────────────────────────────────
  mkSub('proj-004', 'Asbestos Abatement Plan — Floors 1-3', 'Test Reports', 'Under Review', 'Barton Malow', '05/15/2026', '028200', 'Jordan Lee'),
  mkSub('proj-004', 'ICRA Compliance Plan — Phase 1 Scope', 'Certificates', 'Approved', 'AECOM Hunt', '04/20/2026', '015000', 'Jordan Lee'),
  mkSub('proj-004', 'A&E Existing Conditions Survey Report', 'Test Reports', 'Approved', 'Skanska USA', '04/15/2024', '013200', 'Alex Rivera'),
  mkSub('proj-004', 'Technology & AV System Product Data', 'Product Data', 'Pending Submission', 'Turner Construction', '07/01/2026', '271500', 'Morgan Kim'),
  mkSub('proj-004', 'GC/CM Pre-Construction Schedule', 'Product Data', 'Approved', 'Hensel Phelps', '05/01/2026', '013200', 'Alex Rivera'),
  mkSub('proj-004', 'Owner Furniture Samples — Administrative', 'Samples', 'Pending Submission', 'PCL Construction', '08/01/2026', '115000', 'Jordan Lee'),

  // ── proj-005 · Loyola Behavioral Health ────────────────────────────────────
  mkSub('proj-005', 'Structural Frame Shop Drawings — Levels 1-4', 'Shop Drawings', 'Approved', 'Clark Construction', '07/15/2023', '051200', 'Alex Rivera'),
  mkSub('proj-005', 'HVAC Ductwork Product Data — Behavioral Units', 'Product Data', 'Approved', 'Walsh Construction', '08/01/2023', '233100', 'Sam Torres'),
  mkSub('proj-005', 'Behavioral Health Specialty Hardware Samples', 'Samples', 'Approved as Noted', 'DPR Construction', '09/01/2023', '087100', 'Jordan Lee'),
  mkSub('proj-005', 'Electrical Lighting Product Data — Patient Rooms', 'Product Data', 'Approved', 'JE Dunn Construction', '08/15/2023', '265100', 'Morgan Kim'),
  mkSub('proj-005', 'Site Civil Utility Shop Drawings', 'Shop Drawings', 'Approved', 'Brasfield & Gorrie', '10/01/2023', '330000', 'Jordan Lee'),
  mkSub('proj-005', 'Medical Gas System Test Report — Initial Rough-In', 'Test Reports', 'Approved', 'Skanska USA', '10/20/2023', '221410', 'Sam Torres'),
  mkSub('proj-005', 'Interior Finishes — Flooring Samples', 'Samples', 'Approved as Noted', 'Mortenson Construction', '09/20/2023', '096500', 'Alex Rivera'),
  mkSub('proj-005', 'Kitchen Equipment O&M Manuals', 'O&M Manuals', 'Pending Submission', 'Barton Malow', '01/01/2024', '114000', 'Sam Torres'),

  // ── proj-006 · Chandler Regional ───────────────────────────────────────────
  mkSub('proj-006', 'Geotechnical Investigation Report', 'Test Reports', 'Approved', 'Walsh Construction', '07/15/2023', '310000', 'Jordan Lee'),
  mkSub('proj-006', 'Schematic Design Package — Architectural', 'Shop Drawings', 'Approved as Noted', 'AECOM Hunt', '10/01/2023', '013100', 'Alex Rivera'),
  mkSub('proj-006', 'MEP Systems Basis of Design Report', 'Product Data', 'Approved', 'Gilbane Building', '11/01/2023', '230500', 'Sam Torres'),
  mkSub('proj-006', 'GC/CM Pre-Construction Services Plan', 'Product Data', 'Approved', 'PCL Construction', '10/15/2023', '013100', 'Alex Rivera'),
  mkSub('proj-006', 'Owner Equipment Vendor List', 'Product Data', 'Pending Submission', 'DPR Construction', '03/01/2026', '115000', 'Morgan Kim'),
  mkSub('proj-006', 'Commissioning Plan — HVAC Systems', 'Test Reports', 'Pending Submission', 'Barton Malow', '04/01/2026', '019113', 'Sam Torres'),

  // ── proj-007 · St. Francis ED Modernization ─────────────────────────────────
  mkSub('proj-007', 'HVAC Replacement Equipment Product Data', 'Product Data', 'Approved', 'McCarthy Building', '05/15/2023', '233100', 'Sam Torres'),
  mkSub('proj-007', 'HVAC Controls Sequence of Operations', 'Product Data', 'Approved as Noted', 'McCarthy Building', '06/15/2023', '230900', 'Sam Torres'),
  mkSub('proj-007', 'Electrical Service Upgrade Shop Drawings', 'Shop Drawings', 'Approved', 'Clark Construction', '06/01/2023', '262000', 'Morgan Kim'),
  mkSub('proj-007', 'Medical Equipment Layout — ED Bays', 'Shop Drawings', 'Approved', 'Turner Construction', '07/01/2023', '115000', 'Alex Rivera'),
  mkSub('proj-007', 'Interior Renovation Finishes Samples', 'Samples', 'Approved', 'Walsh Construction', '08/01/2023', '096500', 'Alex Rivera'),
  mkSub('proj-007', 'Nurse Call System Product Data', 'Product Data', 'Approved', 'Gilbane Building', '09/01/2023', '274000', 'Morgan Kim'),
  mkSub('proj-007', 'Commissioning Test Reports — HVAC', 'Test Reports', 'Under Review', 'Mortenson Construction', '12/01/2025', '019113', 'Sam Torres'),
  mkSub('proj-007', 'Project Close-Out O&M Manuals', 'O&M Manuals', 'Pending Submission', 'JE Dunn Construction', '02/01/2026', '017700', 'Jordan Lee'),

  // ── proj-008 · Trinity Columbus Specialist Office ───────────────────────────
  mkSub('proj-008', 'Geotechnical Boring Log Report', 'Test Reports', 'Approved', 'Skanska USA', '12/20/2023', '310000', 'Jordan Lee'),
  mkSub('proj-008', 'Architectural Schematic Design Package', 'Shop Drawings', 'Approved as Noted', 'Brasfield & Gorrie', '01/15/2024', '013100', 'Alex Rivera'),
  mkSub('proj-008', 'MEP Engineering Design Intent Report', 'Product Data', 'Approved', 'AECOM Hunt', '02/20/2024', '230500', 'Sam Torres'),
  mkSub('proj-008', 'GC/CM Pre-Construction Services Schedule', 'Product Data', 'Under Review', 'Barton Malow', '03/15/2024', '013200', 'Alex Rivera'),
  mkSub('proj-008', 'IT Infrastructure Design Criteria', 'Product Data', 'Pending Submission', 'PCL Construction', '05/01/2024', '271500', 'Morgan Kim'),
  mkSub('proj-008', 'Owner Contingency Scope Documentation', 'Product Data', 'Pending Submission', 'Barton Malow', '05/15/2024', '013100', 'Jordan Lee'),

  // ── proj-009 · St. Vincent's Surgical ──────────────────────────────────────
  mkSub('proj-009', 'Surgical Suite MEP Shop Drawings — OR 1-3', 'Shop Drawings', 'Approved', 'Turner Construction', '03/15/2024', '230500', 'Sam Torres'),
  mkSub('proj-009', 'Medical Gas System Product Data — Phase 1', 'Product Data', 'Approved', 'Walsh Construction', '03/20/2024', '221410', 'Sam Torres'),
  mkSub('proj-009', 'HVAC Pressurization System Product Data', 'Product Data', 'Approved', 'Clark Construction', '04/10/2024', '233100', 'Sam Torres'),
  mkSub('proj-009', 'Robotic Surgery Suite Equipment Layout', 'Shop Drawings', 'Approved as Noted', 'DPR Construction', '04/20/2024', '115000', 'Alex Rivera'),
  mkSub('proj-009', 'Interior Finishes Samples — OR Suites', 'Samples', 'Approved', 'McCarthy Building', '05/05/2024', '096500', 'Alex Rivera'),
  mkSub('proj-009', 'Sterile Processing Equipment Product Data', 'Product Data', 'Under Review', 'Gilbane Building', '05/15/2024', '115000', 'Morgan Kim'),
  mkSub('proj-009', 'Phase 2 Pre-Construction Scope Plan', 'Product Data', 'Pending Submission', 'Whiting-Turner', '07/01/2024', '013100', 'Jordan Lee'),

  // ── proj-010 · Marian Medical Outpatient Clinic ──────────────────────────────
  mkSub('proj-010', 'Civil Site Development Shop Drawings', 'Shop Drawings', 'Approved', 'Brasfield & Gorrie', '11/15/2024', '330000', 'Jordan Lee'),
  mkSub('proj-010', 'Architectural Design Development Package', 'Shop Drawings', 'Approved as Noted', 'JE Dunn Construction', '10/01/2024', '013100', 'Alex Rivera'),
  mkSub('proj-010', 'GC/CM Pre-Construction Services Schedule', 'Product Data', 'Approved', 'Mortenson Construction', '02/01/2025', '013200', 'Alex Rivera'),
  mkSub('proj-010', 'Owner Equipment Scope — Imaging System', 'Product Data', 'Pending Submission', 'AECOM Hunt', '05/01/2025', '115000', 'Morgan Kim'),
  mkSub('proj-010', 'Technology & Security System Design Criteria', 'Product Data', 'Pending Submission', 'Skanska USA', '05/15/2025', '271500', 'Morgan Kim'),
  mkSub('proj-010', 'Building Permit Documents — Structural', 'Shop Drawings', 'Under Review', 'Mortenson Construction', '03/01/2025', '051200', 'Alex Rivera'),
];
