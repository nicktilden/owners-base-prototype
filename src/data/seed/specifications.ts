/**
 * SPECIFICATION SEED DATA
 *
 * CSI MasterFormat divisions and sections sourced from the project's
 * Specifications tool. Used by the RFI tool for spec section selection.
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
