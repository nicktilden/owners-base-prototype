/**
 * CHANGE EVENTS SEED DATA
 * Fields: id, projectId, number, title, status, scope, origin, created
 * ~7-8 per project (proj-001 to proj-010)
 */

const CE_STATUSES = ['Open', 'Closed', 'Under Review', 'Void', 'Pending Pricing'];
const CE_SCOPES = ['In Scope', 'Out of Scope', 'Undetermined'];
const CE_ORIGINS = ['Owner Request', 'RFI', 'Site Condition', 'Design Issue', 'Regulatory', 'Contractor Request'];

let seq = 0;

function mkCE(
  projectId: string,
  title: string,
  status: string,
  scope: string,
  origin: string,
  created: string,
) {
  seq++;
  return {
    id: `ce-${String(seq).padStart(4, '0')}`,
    projectId,
    number: seq,
    title,
    status,
    scope,
    origin,
    created,
  };
}

export const changeEvents: any[] = [

  // ── proj-001 · St. Joseph Tower ─────────────────────────────────────────────
  mkCE('proj-001', 'Structural beam rerouting — elevator core conflict', 'Closed', 'Out of Scope', 'Design Issue', '09/20/2023'),
  mkCE('proj-001', 'Added medical gas drops — Level 9 ICU expansion', 'Closed', 'Out of Scope', 'Owner Request', '10/10/2023'),
  mkCE('proj-001', 'Curtainwall system upgrade — blast-rated glazing required', 'Closed', 'Out of Scope', 'Regulatory', '11/05/2023'),
  mkCE('proj-001', 'Additional seismic bracing — MEP systems Level 7-10', 'Closed', 'Out of Scope', 'Regulatory', '11/20/2023'),
  mkCE('proj-001', 'IT infrastructure scope increase — nurse call expansion', 'Under Review', 'Undetermined', 'Owner Request', '01/15/2024'),
  mkCE('proj-001', 'FF&E scope reduction — standardize patient room furniture', 'Open', 'In Scope', 'Owner Request', '02/01/2024'),
  mkCE('proj-001', 'Owner contingency drawdown — Phase 2 scope additions', 'Under Review', 'Out of Scope', 'Owner Request', '02/15/2024'),
  mkCE('proj-001', 'Unforeseen subsurface obstruction — additional excavation', 'Closed', 'Out of Scope', 'Site Condition', '09/05/2023'),

  // ── proj-002 · Holy Cross Outpatient Pavilion ───────────────────────────────
  mkCE('proj-002', 'Structural slab thickening — equipment load increase', 'Closed', 'Out of Scope', 'Owner Request', '02/20/2024'),
  mkCE('proj-002', 'Exterior cladding change — aluminum panel to terracotta', 'Closed', 'Out of Scope', 'Owner Request', '03/20/2024'),
  mkCE('proj-002', 'Additional electrical circuits — medical equipment rooms', 'Closed', 'Out of Scope', 'Design Issue', '04/10/2024'),
  mkCE('proj-002', 'Sitework scope addition — bioretention pond requirement', 'Under Review', 'Undetermined', 'Regulatory', '04/20/2024'),
  mkCE('proj-002', 'Fire protection upgrade — NFPA 13D vs 13 variance', 'Closed', 'Out of Scope', 'Regulatory', '03/05/2024'),
  mkCE('proj-002', 'FF&E scope addition — patient room TV infrastructure', 'Open', 'Undetermined', 'Owner Request', '05/15/2024'),
  mkCE('proj-002', 'Delayed sitework start — contractor resource conflict', 'Open', 'In Scope', 'Contractor Request', '05/01/2024'),

  // ── proj-003 · Mercy MOB Phase II ──────────────────────────────────────────
  mkCE('proj-003', 'Steel connection plate revision — engineer of record change', 'Closed', 'Out of Scope', 'Design Issue', '11/15/2023'),
  mkCE('proj-003', 'MEP routing change — conflict with curtainwall structure', 'Closed', 'Out of Scope', 'Design Issue', '12/10/2023'),
  mkCE('proj-003', 'Interior finishes upgrade — Level 3 executive offices', 'Closed', 'Out of Scope', 'Owner Request', '12/20/2023'),
  mkCE('proj-003', 'Elevator pit waterproofing — unforeseen groundwater', 'Closed', 'Out of Scope', 'Site Condition', '11/20/2023'),
  mkCE('proj-003', 'Signage quantity increase — code-mandated additions', 'Closed', 'Out of Scope', 'Regulatory', '01/10/2024'),
  mkCE('proj-003', 'FF&E procurement delay — furniture vendor backorder', 'Open', 'In Scope', 'Contractor Request', '02/10/2024'),
  mkCE('proj-003', 'Weather delay claim — January 2024 ice storm', 'Under Review', 'In Scope', 'Contractor Request', '02/01/2024'),

  // ── proj-004 · St. Mary's Renovation ───────────────────────────────────────
  mkCE('proj-004', 'Hazmat scope increase — ACM tiles found in Zone B', 'Under Review', 'Out of Scope', 'Site Condition', '05/05/2026'),
  mkCE('proj-004', 'Lead paint abatement — positive test Corridors A-C', 'Open', 'Out of Scope', 'Site Condition', '05/22/2026'),
  mkCE('proj-004', 'Structural assessment — undocumented steel element', 'Open', 'Undetermined', 'Site Condition', '05/12/2026'),
  mkCE('proj-004', 'ICRA zone expansion — additional construction area', 'Under Review', 'Out of Scope', 'Owner Request', '04/25/2026'),
  mkCE('proj-004', 'Technology scope expansion — AV upgrade Level 2', 'Open', 'Undetermined', 'Owner Request', '05/28/2026'),

  // ── proj-005 · Loyola Behavioral Health ────────────────────────────────────
  mkCE('proj-005', 'Structural frame revision — additional shear wall required', 'Closed', 'Out of Scope', 'Regulatory', '08/15/2023'),
  mkCE('proj-005', 'Behavioral unit hardware upgrade — new code requirement', 'Closed', 'Out of Scope', 'Regulatory', '09/10/2023'),
  mkCE('proj-005', 'MEP scope change — medical gas to all patient floors', 'Closed', 'Out of Scope', 'Owner Request', '09/25/2023'),
  mkCE('proj-005', 'Site utility conflict — unmarked telecom duct bank', 'Closed', 'Out of Scope', 'Site Condition', '07/20/2023'),
  mkCE('proj-005', 'Kitchen equipment change — owner-direct procurement', 'Open', 'In Scope', 'Owner Request', '11/20/2023'),
  mkCE('proj-005', 'Interior finishes upgrade — behavioral unit soundproofing', 'Closed', 'Out of Scope', 'Owner Request', '10/10/2023'),
  mkCE('proj-005', 'FF&E scope — patient room furniture owner-furnished', 'Under Review', 'Undetermined', 'Owner Request', '11/01/2023'),

  // ── proj-006 · Chandler Regional ───────────────────────────────────────────
  mkCE('proj-006', 'Geotech findings — additional foundation depth required', 'Closed', 'Out of Scope', 'Site Condition', '07/20/2023'),
  mkCE('proj-006', 'Utility relocation — water main conflict at building entry', 'Under Review', 'Out of Scope', 'Site Condition', '08/20/2023'),
  mkCE('proj-006', 'Design change — mechanical plant room enlarged', 'Under Review', 'Out of Scope', 'Design Issue', '11/15/2023'),
  mkCE('proj-006', 'Owner equipment scope expansion — imaging department', 'Open', 'Undetermined', 'Owner Request', '02/10/2026'),
  mkCE('proj-006', 'GC/CM contract delays — GMP negotiation extended', 'Open', 'In Scope', 'Owner Request', '01/10/2026'),
  mkCE('proj-006', 'Commissioning scope increase — energy management system', 'Pending Pricing', 'Out of Scope', 'Owner Request', '02/01/2026'),

  // ── proj-007 · St. Francis ED Modernization ─────────────────────────────────
  mkCE('proj-007', 'Electrical service upgrade — load increase new ED equipment', 'Closed', 'Out of Scope', 'Owner Request', '04/20/2023'),
  mkCE('proj-007', 'HVAC scope addition — negative pressure room conversion', 'Closed', 'Out of Scope', 'Regulatory', '05/15/2023'),
  mkCE('proj-007', 'Medical equipment pad revision — robot-assisted procedure room', 'Closed', 'Out of Scope', 'Owner Request', '06/20/2023'),
  mkCE('proj-007', 'Unforeseen asbestos — ceiling above ED Bays 8-12', 'Closed', 'Out of Scope', 'Site Condition', '04/10/2023'),
  mkCE('proj-007', 'Nurse call system expansion — additional call points', 'Closed', 'Out of Scope', 'Owner Request', '08/15/2023'),
  mkCE('proj-007', 'Close-out documentation delay — BIM deliverable scope', 'Open', 'In Scope', 'Contractor Request', '01/15/2026'),
  mkCE('proj-007', 'Commissioning additional systems — BMS integration', 'Under Review', 'Undetermined', 'Owner Request', '11/20/2025'),

  // ── proj-008 · Trinity Columbus Specialist Office ───────────────────────────
  mkCE('proj-008', 'Geotech finding — unsuitable soils requiring over-excavation', 'Closed', 'Out of Scope', 'Site Condition', '12/22/2023'),
  mkCE('proj-008', 'Design change — structural grid modification SE corner', 'Under Review', 'Out of Scope', 'Design Issue', '02/25/2024'),
  mkCE('proj-008', 'MEP coordination — plumbing reroute for stairwell conflict', 'Pending Pricing', 'Undetermined', 'Design Issue', '03/08/2024'),
  mkCE('proj-008', 'IT scope increase — additional server room capacity', 'Open', 'Undetermined', 'Owner Request', '03/25/2024'),
  mkCE('proj-008', 'Owner contingency draw — scope documentation required', 'Open', 'In Scope', 'Owner Request', '04/20/2024'),

  // ── proj-009 · St. Vincent's Surgical ──────────────────────────────────────
  mkCE('proj-009', 'Surgical suite MEP revision — additional OR outlets', 'Closed', 'Out of Scope', 'Owner Request', '03/20/2024'),
  mkCE('proj-009', 'Medical gas system change — manifold relocation', 'Closed', 'Out of Scope', 'Design Issue', '03/25/2024'),
  mkCE('proj-009', 'HVAC pressurization — additional air handlers required', 'Closed', 'Out of Scope', 'Design Issue', '04/15/2024'),
  mkCE('proj-009', 'Robotic suite structural support — enhanced floor loading', 'Closed', 'Out of Scope', 'Owner Request', '04/20/2024'),
  mkCE('proj-009', 'Sterile processing equipment change — owner procurement', 'Under Review', 'Undetermined', 'Owner Request', '05/20/2024'),
  mkCE('proj-009', 'Phase 2 scope definition — additional surgical suites', 'Open', 'Undetermined', 'Owner Request', '05/25/2024'),

  // ── proj-010 · Marian Medical Outpatient Clinic ──────────────────────────────
  mkCE('proj-010', 'Site grading revision — stormwater detention pond added', 'Closed', 'Out of Scope', 'Regulatory', '11/15/2024'),
  mkCE('proj-010', 'Building program change — additional exam room added', 'Under Review', 'Out of Scope', 'Owner Request', '01/10/2025'),
  mkCE('proj-010', 'Permitting delay — structural plan review comments', 'Open', 'In Scope', 'Regulatory', '02/10/2025'),
  mkCE('proj-010', 'Owner equipment scope addition — CT scanner prep', 'Open', 'Undetermined', 'Owner Request', '02/20/2025'),
  mkCE('proj-010', 'Technology infrastructure — security camera expansion', 'Pending Pricing', 'Undetermined', 'Owner Request', '03/05/2025'),
];
