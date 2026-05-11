/**
 * CHANGE ORDERS SEED DATA
 * Fields: id, projectId, number, title, status, amount, reason, created,
 *         contract, revision, dateInitiated, contractCompany, designatedReviewer,
 *         dueDate, reviewDate, signaturesRequired
 * ~6-8 per project (proj-001 to proj-010)
 */

const CO_STATUSES = ['Approved', 'Pending Approval', 'Draft', 'Void', 'Under Review'];
const CO_REASONS = ['Owner Request', 'Site Condition', 'Design Change', 'Regulatory', 'Value Engineering', 'Force Majeure'];

function fmt(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  return `${sign}$${abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

let seq = 0;

function mkCO(
  projectId: string,
  title: string,
  status: string,
  amount: number,
  reason: string,
  created: string,
  contract: string,
  revision: number,
  dateInitiated: string,
  contractCompany: string,
  designatedReviewer: string,
  dueDate: string,
  reviewDate: string,
  signaturesRequired: number,
) {
  seq++;
  return {
    id: `co-${String(seq).padStart(4, '0')}`,
    projectId,
    number: seq,
    title,
    status,
    amount: fmt(amount),
    reason,
    created,
    contract,
    revision,
    dateInitiated,
    contractCompany,
    designatedReviewer,
    dueDate,
    reviewDate,
    signaturesRequired,
  };
}

export const changeOrders: any[] = [

  // ── proj-001 · St. Joseph Tower ─────────────────────────────────────────────
  mkCO('proj-001', 'CO-001: Structural beam rerouting — elevator core', 'Approved', 284_000, 'Design Change', '10/15/2023', 'Prime Contract #1', 0, '10/01/2023', 'Skanska USA', 'Rivera, Alex', '10/20/2023', '10/18/2023', 2),
  mkCO('proj-001', 'CO-002: Medical gas drops — Level 9 ICU expansion', 'Approved', 520_000, 'Owner Request', '11/01/2023', 'Prime Contract #1', 0, '10/18/2023', 'Clark Construction', 'Lee, Jordan', '11/10/2023', '11/08/2023', 2),
  mkCO('proj-001', 'CO-003: Blast-rated glazing upgrade — curtainwall', 'Approved', 1_100_000, 'Regulatory', '12/01/2023', 'Prime Contract #1', 0, '11/15/2023', 'DPR Construction', 'Torres, Sam', '12/10/2023', '12/08/2023', 3),
  mkCO('proj-001', 'CO-004: Seismic bracing — MEP systems Levels 7-10', 'Approved', 640_000, 'Regulatory', '12/15/2023', 'Prime Contract #1', 0, '12/01/2023', 'PCL Construction', 'Kim, Morgan', '12/22/2023', '12/20/2023', 2),
  mkCO('proj-001', 'CO-005: Unforeseen subsurface obstruction removal', 'Approved', 168_000, 'Site Condition', '10/01/2023', 'Prime Contract #1', 0, '09/20/2023', 'Skanska USA', 'Rivera, Alex', '10/08/2023', '10/06/2023', 2),
  mkCO('proj-001', 'CO-006: IT infrastructure scope expansion', 'Under Review', 380_000, 'Owner Request', '02/01/2024', 'Prime Contract #1', 0, '01/20/2024', 'Gilbane Building', 'Lee, Jordan', '02/10/2024', '', 2),
  mkCO('proj-001', 'CO-007: Value engineering — standardize FF&E package', 'Pending Approval', -240_000, 'Value Engineering', '02/15/2024', 'Prime Contract #1', 0, '02/05/2024', 'Hensel Phelps', 'Torres, Sam', '02/25/2024', '', 2),
  mkCO('proj-001', 'CO-008: Owner contingency drawdown — Phase 2 additions', 'Draft', 800_000, 'Owner Request', '03/01/2024', 'Prime Contract #1', 0, '02/20/2024', 'McCarthy Building', 'Kim, Morgan', '03/12/2024', '', 3),

  // ── proj-002 · Holy Cross Outpatient Pavilion ───────────────────────────────
  mkCO('proj-002', 'CO-001: Structural slab thickening — equipment load', 'Approved', 310_000, 'Owner Request', '03/01/2024', 'Prime Contract #2', 0, '02/18/2024', 'Mortenson Construction', 'Rivera, Alex', '03/10/2024', '03/08/2024', 2),
  mkCO('proj-002', 'CO-002: Exterior cladding change to terracotta', 'Approved', 480_000, 'Owner Request', '04/10/2024', 'Prime Contract #2', 0, '03/28/2024', 'JE Dunn Construction', 'Lee, Jordan', '04/20/2024', '04/18/2024', 3),
  mkCO('proj-002', 'CO-003: Additional electrical circuits — medical rooms', 'Approved', 162_000, 'Design Change', '04/25/2024', 'Prime Contract #2', 0, '04/12/2024', 'Clark Construction', 'Torres, Sam', '05/05/2024', '05/03/2024', 2),
  mkCO('proj-002', 'CO-004: NFPA 13 fire protection upgrade', 'Approved', 95_000, 'Regulatory', '03/20/2024', 'Prime Contract #2', 0, '03/08/2024', 'DPR Construction', 'Kim, Morgan', '03/28/2024', '03/26/2024', 2),
  mkCO('proj-002', 'CO-005: Bioretention pond — stormwater requirement', 'Under Review', 380_000, 'Regulatory', '05/01/2024', 'Prime Contract #2', 0, '04/18/2024', 'Barton Malow', 'Rivera, Alex', '05/12/2024', '', 2),
  mkCO('proj-002', 'CO-006: FF&E scope — patient room TV infrastructure', 'Draft', 142_000, 'Owner Request', '05/20/2024', 'Prime Contract #2', 0, '05/10/2024', 'Hensel Phelps', 'Lee, Jordan', '05/30/2024', '', 2),

  // ── proj-003 · Mercy MOB Phase II ──────────────────────────────────────────
  mkCO('proj-003', 'CO-001: Steel connection plate revision', 'Approved', 78_000, 'Design Change', '12/01/2023', 'Prime Contract #3', 0, '11/18/2023', 'Mortenson Construction', 'Torres, Sam', '12/10/2023', '12/08/2023', 2),
  mkCO('proj-003', 'CO-002: MEP routing change — curtainwall conflict', 'Approved', 124_000, 'Design Change', '12/20/2023', 'Prime Contract #3', 0, '12/08/2023', 'McCarthy Building', 'Kim, Morgan', '12/28/2023', '12/26/2023', 2),
  mkCO('proj-003', 'CO-003: Interior finishes upgrade — Level 3', 'Approved', 215_000, 'Owner Request', '01/05/2024', 'Prime Contract #3', 0, '12/22/2023', 'PCL Construction', 'Rivera, Alex', '01/15/2024', '01/13/2024', 2),
  mkCO('proj-003', 'CO-004: Elevator pit waterproofing — groundwater', 'Approved', 186_000, 'Site Condition', '12/10/2023', 'Prime Contract #3', 0, '11/28/2023', 'Walsh Construction', 'Lee, Jordan', '12/18/2023', '12/16/2023', 2),
  mkCO('proj-003', 'CO-005: Signage additions — code compliance', 'Approved', 32_000, 'Regulatory', '01/20/2024', 'Prime Contract #3', 0, '01/08/2024', 'Brasfield & Gorrie', 'Torres, Sam', '01/28/2024', '01/26/2024', 2),
  mkCO('proj-003', 'CO-006: Weather delay costs — January ice storm', 'Pending Approval', 95_000, 'Force Majeure', '02/15/2024', 'Prime Contract #3', 0, '02/05/2024', 'Mortenson Construction', 'Kim, Morgan', '02/25/2024', '', 2),

  // ── proj-004 · St. Mary's Renovation ───────────────────────────────────────
  mkCO('proj-004', 'CO-001: Hazmat abatement scope increase — ACM tiles', 'Under Review', 280_000, 'Site Condition', '05/10/2026', 'Prime Contract #4', 0, '04/28/2026', 'Barton Malow', 'Rivera, Alex', '05/20/2026', '', 2),
  mkCO('proj-004', 'CO-002: Lead paint abatement — Corridors A-C', 'Draft', 190_000, 'Site Condition', '05/25/2026', 'Prime Contract #4', 0, '05/15/2026', 'AECOM Hunt', 'Lee, Jordan', '06/05/2026', '', 2),
  mkCO('proj-004', 'CO-003: Structural assessment — undocumented steel', 'Draft', 45_000, 'Site Condition', '05/15/2026', 'Prime Contract #4', 0, '05/05/2026', 'Hensel Phelps', 'Torres, Sam', '05/25/2026', '', 1),
  mkCO('proj-004', 'CO-004: ICRA zone expansion — additional area', 'Pending Approval', 120_000, 'Owner Request', '05/01/2026', 'Prime Contract #4', 0, '04/20/2026', 'Barton Malow', 'Kim, Morgan', '05/12/2026', '', 2),

  // ── proj-005 · Loyola Behavioral Health ────────────────────────────────────
  mkCO('proj-005', 'CO-001: Structural shear wall addition — code', 'Approved', 420_000, 'Regulatory', '09/01/2023', 'Prime Contract #5', 0, '08/18/2023', 'Clark Construction', 'Rivera, Alex', '09/10/2023', '09/08/2023', 2),
  mkCO('proj-005', 'CO-002: Behavioral hardware upgrade — new code', 'Approved', 340_000, 'Regulatory', '10/01/2023', 'Prime Contract #5', 0, '09/18/2023', 'DPR Construction', 'Lee, Jordan', '10/10/2023', '10/08/2023', 2),
  mkCO('proj-005', 'CO-003: Medical gas expansion — all patient floors', 'Approved', 580_000, 'Owner Request', '10/15/2023', 'Prime Contract #5', 0, '10/02/2023', 'Walsh Construction', 'Torres, Sam', '10/25/2023', '10/23/2023', 3),
  mkCO('proj-005', 'CO-004: Unforeseen telecom duct bank relocation', 'Approved', 145_000, 'Site Condition', '08/05/2023', 'Prime Contract #5', 0, '07/24/2023', 'Brasfield & Gorrie', 'Kim, Morgan', '08/15/2023', '08/13/2023', 2),
  mkCO('proj-005', 'CO-005: Interior finishes upgrade — soundproofing', 'Approved', 285_000, 'Owner Request', '11/01/2023', 'Prime Contract #5', 0, '10/18/2023', 'Mortenson Construction', 'Rivera, Alex', '11/10/2023', '11/08/2023', 2),
  mkCO('proj-005', 'CO-006: Kitchen equipment — owner-direct procurement credit', 'Pending Approval', -180_000, 'Owner Request', '11/25/2023', 'Prime Contract #5', 0, '11/14/2023', 'Barton Malow', 'Lee, Jordan', '12/05/2023', '', 2),
  mkCO('proj-005', 'CO-007: FF&E reduction — owner-furnished patient furniture', 'Draft', -520_000, 'Owner Request', '12/01/2023', 'Prime Contract #5', 0, '11/20/2023', 'Skanska USA', 'Torres, Sam', '12/12/2023', '', 2),

  // ── proj-006 · Chandler Regional ───────────────────────────────────────────
  mkCO('proj-006', 'CO-001: Additional foundation depth — poor soils', 'Approved', 680_000, 'Site Condition', '08/10/2023', 'Prime Contract #6', 0, '07/28/2023', 'Walsh Construction', 'Kim, Morgan', '08/20/2023', '08/18/2023', 2),
  mkCO('proj-006', 'CO-002: Utility relocation — water main conflict', 'Under Review', 240_000, 'Site Condition', '09/10/2023', 'Prime Contract #6', 0, '08/28/2023', 'AECOM Hunt', 'Rivera, Alex', '09/20/2023', '', 2),
  mkCO('proj-006', 'CO-003: Mechanical plant room enlargement', 'Under Review', 1_200_000, 'Design Change', '12/01/2023', 'Prime Contract #6', 0, '11/18/2023', 'Gilbane Building', 'Lee, Jordan', '12/12/2023', '', 3),
  mkCO('proj-006', 'CO-004: Owner equipment scope expansion — imaging', 'Draft', 850_000, 'Owner Request', '02/15/2026', 'Prime Contract #6', 0, '02/04/2026', 'PCL Construction', 'Torres, Sam', '02/26/2026', '', 2),
  mkCO('proj-006', 'CO-005: Commissioning scope increase — EMS', 'Pending Approval', 320_000, 'Owner Request', '02/10/2026', 'Prime Contract #6', 0, '01/30/2026', 'Barton Malow', 'Kim, Morgan', '02/20/2026', '', 2),

  // ── proj-007 · St. Francis ED Modernization ─────────────────────────────────
  mkCO('proj-007', 'CO-001: Electrical service upgrade — new equipment', 'Approved', 195_000, 'Owner Request', '05/01/2023', 'Prime Contract #7', 0, '04/18/2023', 'McCarthy Building', 'Rivera, Alex', '05/10/2023', '05/08/2023', 2),
  mkCO('proj-007', 'CO-002: Negative pressure room conversion', 'Approved', 420_000, 'Regulatory', '06/01/2023', 'Prime Contract #7', 0, '05/18/2023', 'Clark Construction', 'Lee, Jordan', '06/10/2023', '06/08/2023', 2),
  mkCO('proj-007', 'CO-003: Unforeseen asbestos — ED Bays 8-12', 'Approved', 310_000, 'Site Condition', '04/20/2023', 'Prime Contract #7', 0, '04/08/2023', 'Turner Construction', 'Torres, Sam', '04/28/2023', '04/26/2023', 2),
  mkCO('proj-007', 'CO-004: Robot-assisted procedure room slab reinforcement', 'Approved', 165_000, 'Owner Request', '07/01/2023', 'Prime Contract #7', 0, '06/18/2023', 'Walsh Construction', 'Kim, Morgan', '07/10/2023', '07/08/2023', 2),
  mkCO('proj-007', 'CO-005: Nurse call system expansion', 'Approved', 88_000, 'Owner Request', '09/01/2023', 'Prime Contract #7', 0, '08/18/2023', 'Gilbane Building', 'Rivera, Alex', '09/10/2023', '09/08/2023', 2),
  mkCO('proj-007', 'CO-006: BMS integration — commissioning scope', 'Under Review', 245_000, 'Owner Request', '12/01/2025', 'Prime Contract #7', 0, '11/18/2025', 'Mortenson Construction', 'Lee, Jordan', '12/12/2025', '', 2),
  mkCO('proj-007', 'CO-007: Extended close-out — BIM deliverable scope', 'Pending Approval', 68_000, 'Owner Request', '01/20/2026', 'Prime Contract #7', 0, '01/08/2026', 'JE Dunn Construction', 'Torres, Sam', '01/30/2026', '', 2),

  // ── proj-008 · Trinity Columbus Specialist Office ───────────────────────────
  mkCO('proj-008', 'CO-001: Over-excavation and re-compaction — poor soils', 'Approved', 485_000, 'Site Condition', '01/05/2024', 'Prime Contract #8', 0, '12/22/2023', 'Skanska USA', 'Kim, Morgan', '01/15/2024', '01/13/2024', 2),
  mkCO('proj-008', 'CO-002: Structural grid modification — SE corner', 'Under Review', 620_000, 'Design Change', '03/01/2024', 'Prime Contract #8', 0, '02/18/2024', 'Brasfield & Gorrie', 'Rivera, Alex', '03/12/2024', '', 3),
  mkCO('proj-008', 'CO-003: MEP reroute — plumbing/stairwell conflict', 'Pending Approval', 185_000, 'Design Change', '03/20/2024', 'Prime Contract #8', 0, '03/08/2024', 'AECOM Hunt', 'Lee, Jordan', '03/30/2024', '', 2),
  mkCO('proj-008', 'CO-004: IT infrastructure scope — server room expansion', 'Draft', 210_000, 'Owner Request', '04/01/2024', 'Prime Contract #8', 0, '03/20/2024', 'Barton Malow', 'Torres, Sam', '04/12/2024', '', 2),

  // ── proj-009 · St. Vincent's Surgical ──────────────────────────────────────
  mkCO('proj-009', 'CO-001: OR electrical outlets expansion', 'Approved', 148_000, 'Owner Request', '04/01/2024', 'Prime Contract #9', 0, '03/18/2024', 'Turner Construction', 'Kim, Morgan', '04/10/2024', '04/08/2024', 2),
  mkCO('proj-009', 'CO-002: Medical gas manifold relocation', 'Approved', 95_000, 'Design Change', '04/05/2024', 'Prime Contract #9', 0, '03/22/2024', 'Walsh Construction', 'Rivera, Alex', '04/15/2024', '04/13/2024', 2),
  mkCO('proj-009', 'CO-003: Additional air handling units — HVAC', 'Approved', 580_000, 'Design Change', '04/25/2024', 'Prime Contract #9', 0, '04/12/2024', 'Clark Construction', 'Lee, Jordan', '05/05/2024', '05/03/2024', 3),
  mkCO('proj-009', 'CO-004: Robotic suite enhanced structural floor slab', 'Approved', 820_000, 'Owner Request', '05/01/2024', 'Prime Contract #9', 0, '04/18/2024', 'DPR Construction', 'Torres, Sam', '05/10/2024', '05/08/2024', 3),
  mkCO('proj-009', 'CO-005: Sterile processing equipment — owner procurement', 'Draft', -580_000, 'Owner Request', '05/25/2024', 'Prime Contract #9', 0, '05/14/2024', 'McCarthy Building', 'Kim, Morgan', '06/05/2024', '', 2),
  mkCO('proj-009', 'CO-006: Phase 2 scope study authorization', 'Pending Approval', 300_000, 'Owner Request', '06/01/2024', 'Prime Contract #9', 0, '05/20/2024', 'Whiting-Turner', 'Rivera, Alex', '06/12/2024', '', 2),

  // ── proj-010 · Marian Medical Outpatient Clinic ──────────────────────────────
  mkCO('proj-010', 'CO-001: Stormwater detention pond — regulatory', 'Approved', 385_000, 'Regulatory', '12/01/2024', 'Prime Contract #10', 0, '11/18/2024', 'Brasfield & Gorrie', 'Lee, Jordan', '12/10/2024', '12/08/2024', 2),
  mkCO('proj-010', 'CO-002: Additional exam room — program change', 'Under Review', 620_000, 'Owner Request', '01/20/2025', 'Prime Contract #10', 0, '01/08/2025', 'JE Dunn Construction', 'Torres, Sam', '01/30/2025', '', 2),
  mkCO('proj-010', 'CO-003: CT scanner room prep — owner equipment', 'Draft', 285_000, 'Owner Request', '03/01/2025', 'Prime Contract #10', 0, '02/18/2025', 'Mortenson Construction', 'Kim, Morgan', '03/12/2025', '', 2),
  mkCO('proj-010', 'CO-004: Security camera expansion', 'Pending Approval', 148_000, 'Owner Request', '03/15/2025', 'Prime Contract #10', 0, '03/04/2025', 'AECOM Hunt', 'Rivera, Alex', '03/25/2025', '', 2),
];
