/**
 * SPECIFICATION SEED DATA
 *
 * CSI MasterFormat divisions and sections sourced from the project's
 * Specifications tool. Used by the RFI tool for spec section selection.
 *
 * Also exports `specificationSections` — a flat array of per-project
 * section rows consumed by the Specifications tool grid.
 */

import type { SpecificationDivision } from '@/types/specifications';

export const specifications: SpecificationDivision[] = [
  {
    id: 'div-00',
    accountId: 'acct-1',
    code: '00',
    title: 'Procurement and Contracting Requirements',
    sections: [
      { id: 'spec-000110', divisionId: 'div-00', code: '000110', title: 'Table of Contents' },
    ],
  },
  {
    id: 'div-01',
    accountId: 'acct-1',
    code: '01',
    title: 'General Requirements',
    sections: [
      { id: 'spec-011000', divisionId: 'div-01', code: '011000', title: 'SUMMARY' },
      { id: 'spec-012500', divisionId: 'div-01', code: '012500', title: 'SUBSTITUTION PROCEDURES' },
      { id: 'spec-012600', divisionId: 'div-01', code: '012600', title: 'CONTRACT MODIFICATION PROCEDURES' },
      { id: 'spec-012900', divisionId: 'div-01', code: '012900', title: 'PAYMENT PROCEDURES' },
      { id: 'spec-013100', divisionId: 'div-01', code: '013100', title: 'PROJECT MANAGEMENT AND COORDINATION' },
      { id: 'spec-013200', divisionId: 'div-01', code: '013200', title: 'CONSTRUCTION PROGRESS DOCUMENTATION' },
      { id: 'spec-013300', divisionId: 'div-01', code: '013300', title: 'SUBMITTAL PROCEDURES' },
      { id: 'spec-014000', divisionId: 'div-01', code: '014000', title: 'QUALITY REQUIREMENTS' },
      { id: 'spec-014200', divisionId: 'div-01', code: '014200', title: 'REFERENCES' },
      { id: 'spec-014533', divisionId: 'div-01', code: '014533', title: 'STRUCTURAL TESTS AND SPECIAL INSPECTIONS' },
      { id: 'spec-015000', divisionId: 'div-01', code: '015000', title: 'TEMPORARY FACILITIES AND CONTROLS' },
      { id: 'spec-016000', divisionId: 'div-01', code: '016000', title: 'PRODUCT REQUIREMENTS' },
      { id: 'spec-017300', divisionId: 'div-01', code: '017300', title: 'EXECUTION' },
      { id: 'spec-017419', divisionId: 'div-01', code: '017419', title: 'CONSTRUCTION WASTE MANAGEMENT AND DISPOSAL' },
      { id: 'spec-017700', divisionId: 'div-01', code: '017700', title: 'CLOSEOUT PROCEDURES' },
      { id: 'spec-017823', divisionId: 'div-01', code: '017823', title: 'OPERATION AND MAINTENANCE DATA' },
      { id: 'spec-017839', divisionId: 'div-01', code: '017839', title: 'PROJECT RECORD DOCUMENTS' },
      { id: 'spec-019113', divisionId: 'div-01', code: '019113', title: 'GENERAL COMMISSIONING REQUIREMENTS' },
    ],
  },
  {
    id: 'div-03',
    accountId: 'acct-1',
    code: '03',
    title: 'Concrete',
    sections: [
      { id: 'spec-033000', divisionId: 'div-03', code: '033000', title: 'CAST-IN-PLACE CONCRETE' },
    ],
  },
  {
    id: 'div-21',
    accountId: 'acct-1',
    code: '21',
    title: 'Fire Suppression',
    sections: [
      { id: 'spec-211000', divisionId: 'div-21', code: '211000', title: 'FIRE PROTECTION' },
    ],
  },
  {
    id: 'div-22',
    accountId: 'acct-1',
    code: '22',
    title: 'Plumbing',
    sections: [
      { id: 'spec-221410', divisionId: 'div-22', code: '221410', title: 'PLUMBING PIPING' },
      { id: 'spec-224450', divisionId: 'div-22', code: '224450', title: 'PLUMBING EQUIPMENT' },
    ],
  },
  {
    id: 'div-23',
    accountId: 'acct-1',
    code: '23',
    title: 'Heating, Ventilating, and Air Conditioning (HVAC)',
    sections: [
      { id: 'spec-230500', divisionId: 'div-23', code: '230500', title: 'BASIC MECHANICAL REQUIREMENTS' },
      { id: 'spec-230529', divisionId: 'div-23', code: '230529', title: 'BASIC MECHANICAL MATERIALS AND METHODS' },
      { id: 'spec-230540', divisionId: 'div-23', code: '230540', title: 'MECHANICAL SOUND AND VIBRATION CONTROL' },
      { id: 'spec-230593', divisionId: 'div-23', code: '230593', title: 'TESTING, ADJUSTING, AND BALANCING' },
      { id: 'spec-230700', divisionId: 'div-23', code: '230700', title: 'MECHANICAL INSULATION' },
      { id: 'spec-231123', divisionId: 'div-23', code: '231123', title: 'NATURAL GAS SYSTEMS' },
      { id: 'spec-233100', divisionId: 'div-23', code: '233100', title: 'AIR DISTRIBUTION' },
      { id: 'spec-235700', divisionId: 'div-23', code: '235700', title: 'HEAT TRANSFER' },
      { id: 'spec-236400', divisionId: 'div-23', code: '236400', title: 'REFRIGERATION' },
      { id: 'spec-237400', divisionId: 'div-23', code: '237400', title: 'AIR HANDLING SYSTEMS ON ROOF' },
    ],
  },
];

// ---------------------------------------------------------------------------
// FLAT GRID ROWS — per-project specification sections for the Specifications
// tool grid. Fields: id, projectId, sectionNumber, title, division, status,
// revision, updated, dateIssued, dateReceived.
// ---------------------------------------------------------------------------

export interface SpecSectionRow {
  id: string;
  projectId: string;
  sectionNumber: string;
  title: string;
  division: string;
  status: string;
  revision: string;
  updated: string;
  dateIssued: string;
  dateReceived: string;
}

/** Offset a YYYY-MM-DD string by a number of days. */
function offsetDate(base: string, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

let seq = 0;
function mk(
  projectId: string,
  sectionNumber: string,
  title: string,
  division: string,
  status: string,
  revision: string,
  updated: string,
): SpecSectionRow {
  seq++;
  const dateIssued = offsetDate(updated, -14);
  const dateReceived = offsetDate(updated, -10);
  return { id: `ss-${String(seq).padStart(4, '0')}`, projectId, sectionNumber, title, division, status, revision, updated, dateIssued, dateReceived };
}

export const specificationSections: SpecSectionRow[] = [
  // ── proj-001: Children's Hospital Expansion ─────────────────────────────
  mk('proj-001', '000110', 'Table of Contents', '00 - Procurement & Contracting', 'Current', 'Rev 0', '2024-01-15'),
  mk('proj-001', '011000', 'Summary', '01 - General Requirements', 'Current', 'Rev 1', '2024-02-01'),
  mk('proj-001', '012500', 'Substitution Procedures', '01 - General Requirements', 'Current', 'Rev 0', '2024-02-01'),
  mk('proj-001', '013100', 'Project Management and Coordination', '01 - General Requirements', 'Current', 'Rev 1', '2024-03-10'),
  mk('proj-001', '013300', 'Submittal Procedures', '01 - General Requirements', 'Current', 'Rev 2', '2024-03-10'),
  mk('proj-001', '014000', 'Quality Requirements', '01 - General Requirements', 'Current', 'Rev 1', '2024-03-15'),
  mk('proj-001', '015000', 'Temporary Facilities and Controls', '01 - General Requirements', 'Current', 'Rev 0', '2024-01-20'),
  mk('proj-001', '017700', 'Closeout Procedures', '01 - General Requirements', 'Superseded', 'Rev 0', '2024-01-15'),
  mk('proj-001', '019113', 'General Commissioning Requirements', '01 - General Requirements', 'Current', 'Rev 1', '2024-04-01'),
  mk('proj-001', '033000', 'Cast-in-Place Concrete', '03 - Concrete', 'Current', 'Rev 2', '2024-03-20'),
  mk('proj-001', '054000', 'Cold-Formed Metal Framing', '05 - Metals', 'Current', 'Rev 1', '2024-03-20'),
  mk('proj-001', '092900', 'Gypsum Board', '09 - Finishes', 'Current', 'Rev 1', '2024-04-05'),
  mk('proj-001', '093000', 'Ceramic Tiling', '09 - Finishes', 'Current', 'Rev 0', '2024-04-05'),
  mk('proj-001', '211000', 'Fire Protection', '21 - Fire Suppression', 'Current', 'Rev 1', '2024-04-10'),
  mk('proj-001', '221410', 'Plumbing Piping', '22 - Plumbing', 'Current', 'Rev 2', '2024-04-10'),
  mk('proj-001', '230593', 'Testing, Adjusting, and Balancing', '23 - HVAC', 'Current', 'Rev 1', '2024-04-15'),
  mk('proj-001', '233100', 'Air Distribution', '23 - HVAC', 'Current', 'Rev 2', '2024-04-15'),
  mk('proj-001', '260500', 'Common Work Results for Electrical', '26 - Electrical', 'Current', 'Rev 1', '2024-04-20'),
  mk('proj-001', '262000', 'Low-Voltage Electrical Distribution', '26 - Electrical', 'Current', 'Rev 1', '2024-04-20'),
  mk('proj-001', '283100', 'Fire Alarm', '28 - Electronic Safety', 'Current', 'Rev 1', '2024-04-22'),

  // ── proj-002: Riverside Corporate Campus ────────────────────────────────
  mk('proj-002', '011000', 'Summary', '01 - General Requirements', 'Current', 'Rev 1', '2024-01-10'),
  mk('proj-002', '012600', 'Contract Modification Procedures', '01 - General Requirements', 'Current', 'Rev 0', '2024-01-10'),
  mk('proj-002', '013200', 'Construction Progress Documentation', '01 - General Requirements', 'Current', 'Rev 0', '2024-01-15'),
  mk('proj-002', '013300', 'Submittal Procedures', '01 - General Requirements', 'Current', 'Rev 1', '2024-02-05'),
  mk('proj-002', '014000', 'Quality Requirements', '01 - General Requirements', 'Current', 'Rev 0', '2024-02-05'),
  mk('proj-002', '017419', 'Construction Waste Management and Disposal', '01 - General Requirements', 'Current', 'Rev 0', '2024-01-20'),
  mk('proj-002', '017823', 'Operation and Maintenance Data', '01 - General Requirements', 'Current', 'Rev 0', '2024-01-20'),
  mk('proj-002', '031000', 'Concrete Forming and Accessories', '03 - Concrete', 'Current', 'Rev 1', '2024-02-20'),
  mk('proj-002', '033000', 'Cast-in-Place Concrete', '03 - Concrete', 'Current', 'Rev 2', '2024-02-20'),
  mk('proj-002', '051200', 'Structural Steel Framing', '05 - Metals', 'Current', 'Rev 2', '2024-03-01'),
  mk('proj-002', '055100', 'Metal Stairs', '05 - Metals', 'Current', 'Rev 1', '2024-03-01'),
  mk('proj-002', '078413', 'Penetration Firestopping', '07 - Thermal Protection', 'Current', 'Rev 0', '2024-03-10'),
  mk('proj-002', '079200', 'Joint Sealants', '07 - Thermal Protection', 'Current', 'Rev 0', '2024-03-10'),
  mk('proj-002', '092900', 'Gypsum Board', '09 - Finishes', 'Current', 'Rev 1', '2024-03-20'),
  mk('proj-002', '096813', 'Tile Carpeting', '09 - Finishes', 'Current', 'Rev 0', '2024-03-20'),
  mk('proj-002', '211000', 'Fire Protection', '21 - Fire Suppression', 'Current', 'Rev 1', '2024-04-01'),
  mk('proj-002', '230700', 'Mechanical Insulation', '23 - HVAC', 'Current', 'Rev 0', '2024-04-05'),
  mk('proj-002', '236400', 'Refrigeration', '23 - HVAC', 'Current', 'Rev 1', '2024-04-05'),
  mk('proj-002', '260500', 'Common Work Results for Electrical', '26 - Electrical', 'Current', 'Rev 1', '2024-04-10'),
  mk('proj-002', '271500', 'Communications Horizontal Cabling', '27 - Communications', 'Current', 'Rev 0', '2024-04-15'),

  // ── proj-003: Metro Transit Hub ─────────────────────────────────────────
  mk('proj-003', '011000', 'Summary', '01 - General Requirements', 'Current', 'Rev 0', '2023-10-01'),
  mk('proj-003', '012900', 'Payment Procedures', '01 - General Requirements', 'Current', 'Rev 0', '2023-10-01'),
  mk('proj-003', '013100', 'Project Management and Coordination', '01 - General Requirements', 'Current', 'Rev 1', '2023-11-01'),
  mk('proj-003', '014000', 'Quality Requirements', '01 - General Requirements', 'Current', 'Rev 0', '2023-11-01'),
  mk('proj-003', '015000', 'Temporary Facilities and Controls', '01 - General Requirements', 'Current', 'Rev 0', '2023-10-15'),
  mk('proj-003', '017700', 'Closeout Procedures', '01 - General Requirements', 'Current', 'Rev 0', '2023-10-01'),
  mk('proj-003', '019113', 'General Commissioning Requirements', '01 - General Requirements', 'Current', 'Rev 1', '2024-01-15'),
  mk('proj-003', '030130', 'Maintenance of Cast-in-Place Concrete', '03 - Concrete', 'Current', 'Rev 0', '2023-11-20'),
  mk('proj-003', '033000', 'Cast-in-Place Concrete', '03 - Concrete', 'Current', 'Rev 3', '2023-11-20'),
  mk('proj-003', '051200', 'Structural Steel Framing', '05 - Metals', 'Current', 'Rev 2', '2023-12-01'),
  mk('proj-003', '055000', 'Metal Fabrications', '05 - Metals', 'Current', 'Rev 1', '2023-12-01'),
  mk('proj-003', '072100', 'Thermal Insulation', '07 - Thermal Protection', 'Current', 'Rev 0', '2023-12-15'),
  mk('proj-003', '076200', 'Sheet Metal Flashing and Trim', '07 - Thermal Protection', 'Current', 'Rev 0', '2023-12-15'),
  mk('proj-003', '088000', 'Glazing', '08 - Openings', 'Current', 'Rev 1', '2024-01-05'),
  mk('proj-003', '211000', 'Fire Protection', '21 - Fire Suppression', 'Current', 'Rev 1', '2024-01-20'),
  mk('proj-003', '221410', 'Plumbing Piping', '22 - Plumbing', 'Current', 'Rev 1', '2024-01-20'),
  mk('proj-003', '230500', 'Basic Mechanical Requirements', '23 - HVAC', 'Current', 'Rev 1', '2024-02-01'),
  mk('proj-003', '233100', 'Air Distribution', '23 - HVAC', 'Current', 'Rev 1', '2024-02-01'),
  mk('proj-003', '237400', 'Air Handling Systems on Roof', '23 - HVAC', 'Current', 'Rev 1', '2024-02-10'),
  mk('proj-003', '260500', 'Common Work Results for Electrical', '26 - Electrical', 'Current', 'Rev 1', '2024-02-15'),

  // ── proj-004: Lakefront Mixed-Use Development ────────────────────────────
  mk('proj-004', '011000', 'Summary', '01 - General Requirements', 'Current', 'Rev 1', '2024-02-01'),
  mk('proj-004', '012500', 'Substitution Procedures', '01 - General Requirements', 'Current', 'Rev 0', '2024-02-01'),
  mk('proj-004', '013100', 'Project Management and Coordination', '01 - General Requirements', 'Current', 'Rev 0', '2024-02-10'),
  mk('proj-004', '013300', 'Submittal Procedures', '01 - General Requirements', 'Current', 'Rev 1', '2024-02-10'),
  mk('proj-004', '014000', 'Quality Requirements', '01 - General Requirements', 'Current', 'Rev 0', '2024-02-15'),
  mk('proj-004', '015000', 'Temporary Facilities and Controls', '01 - General Requirements', 'Current', 'Rev 0', '2024-02-05'),
  mk('proj-004', '017700', 'Closeout Procedures', '01 - General Requirements', 'Current', 'Rev 0', '2024-02-01'),
  mk('proj-004', '033000', 'Cast-in-Place Concrete', '03 - Concrete', 'Current', 'Rev 2', '2024-03-01'),
  mk('proj-004', '042000', 'Unit Masonry', '04 - Masonry', 'Current', 'Rev 1', '2024-03-05'),
  mk('proj-004', '051200', 'Structural Steel Framing', '05 - Metals', 'Current', 'Rev 1', '2024-03-10'),
  mk('proj-004', '072100', 'Thermal Insulation', '07 - Thermal Protection', 'Current', 'Rev 0', '2024-03-15'),
  mk('proj-004', '074100', 'Preformed Metal Roof Panels', '07 - Thermal Protection', 'Current', 'Rev 1', '2024-03-15'),
  mk('proj-004', '079200', 'Joint Sealants', '07 - Thermal Protection', 'Current', 'Rev 0', '2024-03-20'),
  mk('proj-004', '092900', 'Gypsum Board', '09 - Finishes', 'Current', 'Rev 1', '2024-04-01'),
  mk('proj-004', '096800', 'Carpet', '09 - Finishes', 'Current', 'Rev 0', '2024-04-01'),
  mk('proj-004', '211000', 'Fire Protection', '21 - Fire Suppression', 'Current', 'Rev 1', '2024-04-10'),
  mk('proj-004', '221410', 'Plumbing Piping', '22 - Plumbing', 'Current', 'Rev 1', '2024-04-10'),
  mk('proj-004', '230700', 'Mechanical Insulation', '23 - HVAC', 'Current', 'Rev 0', '2024-04-15'),
  mk('proj-004', '233100', 'Air Distribution', '23 - HVAC', 'Current', 'Rev 1', '2024-04-15'),
  mk('proj-004', '260500', 'Common Work Results for Electrical', '26 - Electrical', 'Current', 'Rev 1', '2024-04-20'),

  // ── proj-005: University Science Building ───────────────────────────────
  mk('proj-005', '011000', 'Summary', '01 - General Requirements', 'Current', 'Rev 1', '2023-09-01'),
  mk('proj-005', '012500', 'Substitution Procedures', '01 - General Requirements', 'Current', 'Rev 0', '2023-09-01'),
  mk('proj-005', '013100', 'Project Management and Coordination', '01 - General Requirements', 'Current', 'Rev 2', '2023-10-01'),
  mk('proj-005', '013300', 'Submittal Procedures', '01 - General Requirements', 'Current', 'Rev 2', '2023-10-01'),
  mk('proj-005', '014000', 'Quality Requirements', '01 - General Requirements', 'Current', 'Rev 1', '2023-10-15'),
  mk('proj-005', '014533', 'Structural Tests and Special Inspections', '01 - General Requirements', 'Current', 'Rev 1', '2023-10-15'),
  mk('proj-005', '019113', 'General Commissioning Requirements', '01 - General Requirements', 'Current', 'Rev 2', '2023-11-01'),
  mk('proj-005', '033000', 'Cast-in-Place Concrete', '03 - Concrete', 'Current', 'Rev 3', '2023-11-15'),
  mk('proj-005', '051200', 'Structural Steel Framing', '05 - Metals', 'Current', 'Rev 3', '2023-12-01'),
  mk('proj-005', '055100', 'Metal Stairs', '05 - Metals', 'Current', 'Rev 1', '2023-12-01'),
  mk('proj-005', '072100', 'Thermal Insulation', '07 - Thermal Protection', 'Current', 'Rev 1', '2023-12-15'),
  mk('proj-005', '093000', 'Ceramic Tiling', '09 - Finishes', 'Current', 'Rev 0', '2024-01-10'),
  mk('proj-005', '096813', 'Tile Carpeting', '09 - Finishes', 'Current', 'Rev 0', '2024-01-10'),
  mk('proj-005', '099100', 'Painting', '09 - Finishes', 'Current', 'Rev 1', '2024-01-15'),
  mk('proj-005', '211000', 'Fire Protection', '21 - Fire Suppression', 'Current', 'Rev 1', '2024-02-01'),
  mk('proj-005', '221410', 'Plumbing Piping', '22 - Plumbing', 'Current', 'Rev 2', '2024-02-01'),
  mk('proj-005', '224450', 'Plumbing Equipment', '22 - Plumbing', 'Current', 'Rev 1', '2024-02-10'),
  mk('proj-005', '230593', 'Testing, Adjusting, and Balancing', '23 - HVAC', 'Current', 'Rev 1', '2024-02-15'),
  mk('proj-005', '233100', 'Air Distribution', '23 - HVAC', 'Current', 'Rev 2', '2024-02-15'),
  mk('proj-005', '260500', 'Common Work Results for Electrical', '26 - Electrical', 'Current', 'Rev 2', '2024-03-01'),

  // ── proj-006: Green Energy Campus ───────────────────────────────────────
  mk('proj-006', '011000', 'Summary', '01 - General Requirements', 'Current', 'Rev 0', '2024-03-01'),
  mk('proj-006', '013100', 'Project Management and Coordination', '01 - General Requirements', 'Current', 'Rev 0', '2024-03-01'),
  mk('proj-006', '013300', 'Submittal Procedures', '01 - General Requirements', 'Current', 'Rev 0', '2024-03-10'),
  mk('proj-006', '014000', 'Quality Requirements', '01 - General Requirements', 'Current', 'Rev 0', '2024-03-10'),
  mk('proj-006', '015000', 'Temporary Facilities and Controls', '01 - General Requirements', 'Current', 'Rev 0', '2024-03-05'),
  mk('proj-006', '017419', 'Construction Waste Management and Disposal', '01 - General Requirements', 'Current', 'Rev 0', '2024-03-05'),
  mk('proj-006', '019113', 'General Commissioning Requirements', '01 - General Requirements', 'Current', 'Rev 0', '2024-03-15'),
  mk('proj-006', '033000', 'Cast-in-Place Concrete', '03 - Concrete', 'Current', 'Rev 1', '2024-04-01'),
  mk('proj-006', '051200', 'Structural Steel Framing', '05 - Metals', 'Current', 'Rev 1', '2024-04-10'),
  mk('proj-006', '072100', 'Thermal Insulation', '07 - Thermal Protection', 'Current', 'Rev 0', '2024-04-15'),
  mk('proj-006', '074216', 'Steeply Sloped Roof Shingles', '07 - Thermal Protection', 'Superseded', 'Rev 0', '2024-03-20'),
  mk('proj-006', '096500', 'Resilient Flooring', '09 - Finishes', 'Current', 'Rev 0', '2024-04-20'),
  mk('proj-006', '211000', 'Fire Protection', '21 - Fire Suppression', 'Current', 'Rev 0', '2024-05-01'),
  mk('proj-006', '221410', 'Plumbing Piping', '22 - Plumbing', 'Current', 'Rev 0', '2024-05-01'),
  mk('proj-006', '230700', 'Mechanical Insulation', '23 - HVAC', 'Current', 'Rev 0', '2024-05-05'),
  mk('proj-006', '231123', 'Natural Gas Systems', '23 - HVAC', 'Current', 'Rev 0', '2024-05-05'),
  mk('proj-006', '260500', 'Common Work Results for Electrical', '26 - Electrical', 'Current', 'Rev 0', '2024-05-10'),
  mk('proj-006', '264313', 'Lightning Protection for Structures', '26 - Electrical', 'Current', 'Rev 0', '2024-05-10'),
  mk('proj-006', '271500', 'Communications Horizontal Cabling', '27 - Communications', 'Current', 'Rev 0', '2024-05-15'),
  mk('proj-006', '283100', 'Fire Alarm', '28 - Electronic Safety', 'Current', 'Rev 0', '2024-05-15'),

  // ── proj-007: Waterfront Hotel & Conference Center ───────────────────────
  mk('proj-007', '011000', 'Summary', '01 - General Requirements', 'Current', 'Rev 2', '2023-06-01'),
  mk('proj-007', '012500', 'Substitution Procedures', '01 - General Requirements', 'Current', 'Rev 0', '2023-06-01'),
  mk('proj-007', '013100', 'Project Management and Coordination', '01 - General Requirements', 'Current', 'Rev 2', '2023-07-01'),
  mk('proj-007', '013300', 'Submittal Procedures', '01 - General Requirements', 'Current', 'Rev 3', '2023-07-01'),
  mk('proj-007', '014000', 'Quality Requirements', '01 - General Requirements', 'Current', 'Rev 1', '2023-07-15'),
  mk('proj-007', '015000', 'Temporary Facilities and Controls', '01 - General Requirements', 'Current', 'Rev 0', '2023-06-15'),
  mk('proj-007', '017823', 'Operation and Maintenance Data', '01 - General Requirements', 'Current', 'Rev 0', '2023-06-01'),
  mk('proj-007', '019113', 'General Commissioning Requirements', '01 - General Requirements', 'Current', 'Rev 1', '2023-08-01'),
  mk('proj-007', '033000', 'Cast-in-Place Concrete', '03 - Concrete', 'Current', 'Rev 3', '2023-08-15'),
  mk('proj-007', '042000', 'Unit Masonry', '04 - Masonry', 'Current', 'Rev 1', '2023-09-01'),
  mk('proj-007', '051200', 'Structural Steel Framing', '05 - Metals', 'Current', 'Rev 3', '2023-09-15'),
  mk('proj-007', '072100', 'Thermal Insulation', '07 - Thermal Protection', 'Current', 'Rev 1', '2023-10-01'),
  mk('proj-007', '079200', 'Joint Sealants', '07 - Thermal Protection', 'Current', 'Rev 0', '2023-10-01'),
  mk('proj-007', '088000', 'Glazing', '08 - Openings', 'Current', 'Rev 2', '2023-10-15'),
  mk('proj-007', '092900', 'Gypsum Board', '09 - Finishes', 'Current', 'Rev 2', '2023-11-01'),
  mk('proj-007', '096813', 'Tile Carpeting', '09 - Finishes', 'Current', 'Rev 1', '2023-11-01'),
  mk('proj-007', '099100', 'Painting', '09 - Finishes', 'Current', 'Rev 1', '2023-11-15'),
  mk('proj-007', '211000', 'Fire Protection', '21 - Fire Suppression', 'Current', 'Rev 2', '2023-12-01'),
  mk('proj-007', '221410', 'Plumbing Piping', '22 - Plumbing', 'Current', 'Rev 2', '2023-12-01'),
  mk('proj-007', '260500', 'Common Work Results for Electrical', '26 - Electrical', 'Current', 'Rev 2', '2024-01-15'),

  // ── proj-008: Stadium Renovation ────────────────────────────────────────
  mk('proj-008', '011000', 'Summary', '01 - General Requirements', 'Current', 'Rev 1', '2023-03-01'),
  mk('proj-008', '013100', 'Project Management and Coordination', '01 - General Requirements', 'Current', 'Rev 2', '2023-04-01'),
  mk('proj-008', '013300', 'Submittal Procedures', '01 - General Requirements', 'Current', 'Rev 2', '2023-04-01'),
  mk('proj-008', '014000', 'Quality Requirements', '01 - General Requirements', 'Current', 'Rev 1', '2023-04-15'),
  mk('proj-008', '014533', 'Structural Tests and Special Inspections', '01 - General Requirements', 'Current', 'Rev 1', '2023-04-15'),
  mk('proj-008', '015000', 'Temporary Facilities and Controls', '01 - General Requirements', 'Current', 'Rev 0', '2023-03-15'),
  mk('proj-008', '017700', 'Closeout Procedures', '01 - General Requirements', 'Current', 'Rev 0', '2023-03-01'),
  mk('proj-008', '017839', 'Project Record Documents', '01 - General Requirements', 'Current', 'Rev 0', '2023-03-01'),
  mk('proj-008', '033000', 'Cast-in-Place Concrete', '03 - Concrete', 'Current', 'Rev 4', '2023-05-01'),
  mk('proj-008', '034500', 'Precast Architectural Concrete', '03 - Concrete', 'Current', 'Rev 2', '2023-05-01'),
  mk('proj-008', '051200', 'Structural Steel Framing', '05 - Metals', 'Current', 'Rev 4', '2023-06-01'),
  mk('proj-008', '055000', 'Metal Fabrications', '05 - Metals', 'Current', 'Rev 2', '2023-06-01'),
  mk('proj-008', '072100', 'Thermal Insulation', '07 - Thermal Protection', 'Current', 'Rev 1', '2023-07-01'),
  mk('proj-008', '211000', 'Fire Protection', '21 - Fire Suppression', 'Current', 'Rev 2', '2023-09-01'),
  mk('proj-008', '221410', 'Plumbing Piping', '22 - Plumbing', 'Current', 'Rev 2', '2023-09-01'),
  mk('proj-008', '230500', 'Basic Mechanical Requirements', '23 - HVAC', 'Current', 'Rev 1', '2023-10-01'),
  mk('proj-008', '230540', 'Mechanical Sound and Vibration Control', '23 - HVAC', 'Current', 'Rev 0', '2023-10-01'),
  mk('proj-008', '260500', 'Common Work Results for Electrical', '26 - Electrical', 'Current', 'Rev 2', '2023-11-01'),
  mk('proj-008', '260923', 'Lighting Control Devices', '26 - Electrical', 'Current', 'Rev 1', '2023-11-15'),
  mk('proj-008', '283100', 'Fire Alarm', '28 - Electronic Safety', 'Current', 'Rev 2', '2023-12-01'),

  // ── proj-009: Downtown Medical Office Building ────────────────────────────
  mk('proj-009', '011000', 'Summary', '01 - General Requirements', 'Current', 'Rev 1', '2024-01-01'),
  mk('proj-009', '012900', 'Payment Procedures', '01 - General Requirements', 'Current', 'Rev 0', '2024-01-01'),
  mk('proj-009', '013100', 'Project Management and Coordination', '01 - General Requirements', 'Current', 'Rev 1', '2024-01-15'),
  mk('proj-009', '013300', 'Submittal Procedures', '01 - General Requirements', 'Current', 'Rev 1', '2024-01-15'),
  mk('proj-009', '014000', 'Quality Requirements', '01 - General Requirements', 'Current', 'Rev 0', '2024-01-20'),
  mk('proj-009', '015000', 'Temporary Facilities and Controls', '01 - General Requirements', 'Current', 'Rev 0', '2024-01-05'),
  mk('proj-009', '019113', 'General Commissioning Requirements', '01 - General Requirements', 'Current', 'Rev 1', '2024-02-01'),
  mk('proj-009', '033000', 'Cast-in-Place Concrete', '03 - Concrete', 'Current', 'Rev 2', '2024-02-15'),
  mk('proj-009', '051200', 'Structural Steel Framing', '05 - Metals', 'Current', 'Rev 2', '2024-03-01'),
  mk('proj-009', '054000', 'Cold-Formed Metal Framing', '05 - Metals', 'Current', 'Rev 1', '2024-03-01'),
  mk('proj-009', '093000', 'Ceramic Tiling', '09 - Finishes', 'Current', 'Rev 0', '2024-03-15'),
  mk('proj-009', '099100', 'Painting', '09 - Finishes', 'Current', 'Rev 0', '2024-03-15'),
  mk('proj-009', '211000', 'Fire Protection', '21 - Fire Suppression', 'Current', 'Rev 1', '2024-04-01'),
  mk('proj-009', '221410', 'Plumbing Piping', '22 - Plumbing', 'Current', 'Rev 1', '2024-04-01'),
  mk('proj-009', '224450', 'Plumbing Equipment', '22 - Plumbing', 'Current', 'Rev 1', '2024-04-05'),
  mk('proj-009', '230500', 'Basic Mechanical Requirements', '23 - HVAC', 'Current', 'Rev 1', '2024-04-10'),
  mk('proj-009', '230700', 'Mechanical Insulation', '23 - HVAC', 'Current', 'Rev 0', '2024-04-10'),
  mk('proj-009', '233100', 'Air Distribution', '23 - HVAC', 'Current', 'Rev 1', '2024-04-15'),
  mk('proj-009', '260500', 'Common Work Results for Electrical', '26 - Electrical', 'Current', 'Rev 1', '2024-04-20'),
  mk('proj-009', '283100', 'Fire Alarm', '28 - Electronic Safety', 'Current', 'Rev 1', '2024-04-22'),

  // ── proj-010: Airport Concourse Expansion ───────────────────────────────
  mk('proj-010', '011000', 'Summary', '01 - General Requirements', 'Current', 'Rev 2', '2023-01-01'),
  mk('proj-010', '012500', 'Substitution Procedures', '01 - General Requirements', 'Current', 'Rev 0', '2023-01-01'),
  mk('proj-010', '012600', 'Contract Modification Procedures', '01 - General Requirements', 'Current', 'Rev 0', '2023-01-01'),
  mk('proj-010', '013100', 'Project Management and Coordination', '01 - General Requirements', 'Current', 'Rev 3', '2023-02-01'),
  mk('proj-010', '013300', 'Submittal Procedures', '01 - General Requirements', 'Current', 'Rev 3', '2023-02-01'),
  mk('proj-010', '014000', 'Quality Requirements', '01 - General Requirements', 'Current', 'Rev 2', '2023-02-15'),
  mk('proj-010', '014533', 'Structural Tests and Special Inspections', '01 - General Requirements', 'Current', 'Rev 1', '2023-02-15'),
  mk('proj-010', '015000', 'Temporary Facilities and Controls', '01 - General Requirements', 'Current', 'Rev 1', '2023-01-15'),
  mk('proj-010', '019113', 'General Commissioning Requirements', '01 - General Requirements', 'Current', 'Rev 2', '2023-03-01'),
  mk('proj-010', '033000', 'Cast-in-Place Concrete', '03 - Concrete', 'Current', 'Rev 4', '2023-04-01'),
  mk('proj-010', '034500', 'Precast Architectural Concrete', '03 - Concrete', 'Current', 'Rev 2', '2023-04-01'),
  mk('proj-010', '051200', 'Structural Steel Framing', '05 - Metals', 'Current', 'Rev 4', '2023-05-01'),
  mk('proj-010', '055000', 'Metal Fabrications', '05 - Metals', 'Current', 'Rev 2', '2023-05-01'),
  mk('proj-010', '072100', 'Thermal Insulation', '07 - Thermal Protection', 'Current', 'Rev 1', '2023-06-01'),
  mk('proj-010', '088000', 'Glazing', '08 - Openings', 'Current', 'Rev 2', '2023-06-15'),
  mk('proj-010', '096500', 'Resilient Flooring', '09 - Finishes', 'Current', 'Rev 1', '2023-07-01'),
  mk('proj-010', '211000', 'Fire Protection', '21 - Fire Suppression', 'Current', 'Rev 2', '2023-08-01'),
  mk('proj-010', '221410', 'Plumbing Piping', '22 - Plumbing', 'Current', 'Rev 2', '2023-08-01'),
  mk('proj-010', '260500', 'Common Work Results for Electrical', '26 - Electrical', 'Current', 'Rev 2', '2023-09-01'),
  mk('proj-010', '283100', 'Fire Alarm', '28 - Electronic Safety', 'Current', 'Rev 2', '2023-09-15'),
];
