/**
 * OBSERVATIONS SEED DATA
 * Fields: id, projectId, number, name, type, status, trade, created
 * ~8 per project (proj-001 to proj-010)
 */

const OBS_TYPES = ['Safety', 'Quality', 'Environmental', 'Commissioning', 'General'];
const OBS_STATUSES = ['Open', 'Closed', 'In Progress', 'Pending Review', 'Void'];
const TRADES = ['General', 'Structural', 'Mechanical', 'Electrical', 'Plumbing', 'Civil', 'Interior', 'Exterior'];

let seq = 0;

function mkObs(
  projectId: string,
  name: string,
  type: string,
  status: string,
  trade: string,
  created: string,
) {
  seq++;
  return {
    id: `obs-${String(seq).padStart(4, '0')}`,
    projectId,
    number: seq,
    name,
    type,
    status,
    trade,
    created,
  };
}

export const observations: any[] = [

  // ── proj-001 · St. Joseph Tower ─────────────────────────────────────────────
  mkObs('proj-001', 'Unprotected floor opening Level 7 — Elevator Shaft', 'Safety', 'Closed', 'Structural', '09/05/2023'),
  mkObs('proj-001', 'Curtainwall joint sealant — inconsistent application', 'Quality', 'Closed', 'Exterior', '10/15/2023'),
  mkObs('proj-001', 'Medical gas rough-in — missing support brackets', 'Quality', 'Closed', 'Mechanical', '11/01/2023'),
  mkObs('proj-001', 'Stairwell A — missing handrail at L4', 'Safety', 'Closed', 'Structural', '11/20/2023'),
  mkObs('proj-001', 'HVAC duct insulation — incomplete Level 8', 'Quality', 'In Progress', 'Mechanical', '12/10/2023'),
  mkObs('proj-001', 'Temporary electrical panel — expired GFCI protection', 'Safety', 'Closed', 'Electrical', '01/05/2024'),
  mkObs('proj-001', 'Curtainwall water test failure — Bay 14-C', 'Quality', 'Pending Review', 'Exterior', '01/20/2024'),
  mkObs('proj-001', 'Fire stopping gap — Corridor 9B penetration', 'Safety', 'Open', 'General', '02/01/2024'),
  mkObs('proj-001', 'Elevator pit — standing water accumulation', 'Quality', 'In Progress', 'Mechanical', '02/15/2024'),
  mkObs('proj-001', 'Concrete pour Level 10 — honeycombing observed', 'Quality', 'Closed', 'Structural', '10/25/2023'),

  // ── proj-002 · Holy Cross Outpatient Pavilion ───────────────────────────────
  mkObs('proj-002', 'Excavation edge — inadequate shoring at NW corner', 'Safety', 'Closed', 'Civil', '02/05/2024'),
  mkObs('proj-002', 'Concrete slab flatness — exceeds spec tolerance Zones 3-4', 'Quality', 'Closed', 'Structural', '03/01/2024'),
  mkObs('proj-002', 'Exterior cladding alignment — panel offset >3mm', 'Quality', 'In Progress', 'Exterior', '03/25/2024'),
  mkObs('proj-002', 'MEP coordination gap — VAV box interference Level 2', 'Quality', 'Closed', 'Mechanical', '04/05/2024'),
  mkObs('proj-002', 'Crane swing radius encroachment — public sidewalk', 'Safety', 'Closed', 'General', '02/20/2024'),
  mkObs('proj-002', 'Fire sprinkler head clearance — storage room violation', 'Safety', 'Open', 'Mechanical', '05/10/2024'),
  mkObs('proj-002', 'Interior finishes — tile grout color mismatch Room 212', 'Quality', 'Pending Review', 'Interior', '05/20/2024'),
  mkObs('proj-002', 'Concrete curing — insufficient moisture protection', 'Quality', 'Closed', 'Structural', '03/10/2024'),

  // ── proj-003 · Mercy MOB Phase II ──────────────────────────────────────────
  mkObs('proj-003', 'Steel erection — beam end bearing insufficient', 'Quality', 'Closed', 'Structural', '11/05/2023'),
  mkObs('proj-003', 'Curtainwall mullion — anchor bolt torque deficiency', 'Quality', 'Closed', 'Exterior', '11/25/2023'),
  mkObs('proj-003', 'MEP coordination — plumbing vent conflicts with structure', 'Quality', 'Closed', 'Plumbing', '12/05/2023'),
  mkObs('proj-003', 'Interior buildout — GWB installation behind schedule', 'General', 'In Progress', 'Interior', '01/05/2024'),
  mkObs('proj-003', 'Worker fall protection — leading edge Level 3', 'Safety', 'Closed', 'General', '11/10/2023'),
  mkObs('proj-003', 'Fire suppression — sprinkler head missing at stairwell', 'Safety', 'Closed', 'Mechanical', '01/15/2024'),
  mkObs('proj-003', 'Elevator door operator — misaligned track', 'Quality', 'Pending Review', 'Mechanical', '01/20/2024'),
  mkObs('proj-003', 'Signage rough-in — incorrect conduit size', 'Quality', 'Open', 'Electrical', '02/01/2024'),

  // ── proj-004 · St. Mary's Renovation ───────────────────────────────────────
  mkObs('proj-004', 'Hazmat survey — suspect ACM ceiling tiles identified', 'Environmental', 'Pending Review', 'General', '05/02/2026'),
  mkObs('proj-004', 'Existing structural framing — undocumented steel element', 'Quality', 'Open', 'Structural', '05/10/2026'),
  mkObs('proj-004', 'ICRA barrier — gap observed at smoke barrier penetration', 'Safety', 'Closed', 'General', '04/18/2026'),
  mkObs('proj-004', 'Asbestos abatement area — improper decon unit setup', 'Safety', 'Closed', 'General', '05/15/2026'),
  mkObs('proj-004', 'Pre-construction condition survey — roof membrane damage', 'Quality', 'Open', 'Exterior', '04/25/2026'),
  mkObs('proj-004', 'Lead paint testing — positive result in Corridor B', 'Environmental', 'Pending Review', 'General', '05/20/2026'),
  mkObs('proj-004', 'Technology rough-in locations — conflicts with existing utilities', 'Quality', 'Open', 'Electrical', '05/28/2026'),

  // ── proj-005 · Loyola Behavioral Health ────────────────────────────────────
  mkObs('proj-005', 'Foundation formwork — shoring not per approved plan', 'Safety', 'Closed', 'Structural', '07/05/2023'),
  mkObs('proj-005', 'Structural frame — weld inspection failure L3 column', 'Quality', 'Closed', 'Structural', '08/01/2023'),
  mkObs('proj-005', 'HVAC ductwork — acoustic liner missing in behavioral units', 'Quality', 'Closed', 'Mechanical', '09/01/2023'),
  mkObs('proj-005', 'Specialty hardware — ligature-resistant devices not installed', 'Quality', 'In Progress', 'Interior', '09/20/2023'),
  mkObs('proj-005', 'Site fence — gap created near public access point', 'Safety', 'Closed', 'Civil', '07/15/2023'),
  mkObs('proj-005', 'Interior finishes — incorrect paint color psychiatric unit', 'Quality', 'Closed', 'Interior', '10/05/2023'),
  mkObs('proj-005', 'Medical gas — brazing inspection required OR suite', 'Quality', 'Closed', 'Plumbing', '10/20/2023'),
  mkObs('proj-005', 'Kitchen equipment — gas connection pressure test fail', 'Safety', 'Pending Review', 'Mechanical', '11/05/2023'),

  // ── proj-006 · Chandler Regional ───────────────────────────────────────────
  mkObs('proj-006', 'Site boundary fence — incomplete at SW perimeter', 'Safety', 'Closed', 'Civil', '09/05/2023'),
  mkObs('proj-006', 'Geotech boring — additional borings required NE zone', 'Quality', 'Closed', 'Civil', '07/15/2023'),
  mkObs('proj-006', 'Survey marker — disturbed during mobilization', 'Quality', 'Closed', 'Civil', '08/05/2023'),
  mkObs('proj-006', 'Design review — mechanical plant room undersized', 'Quality', 'Pending Review', 'Mechanical', '11/10/2023'),
  mkObs('proj-006', 'Owner equipment allowance — vendor list incomplete', 'General', 'Open', 'General', '02/05/2026'),
  mkObs('proj-006', 'Commissioning plan — HVAC sequence missing from submittal', 'Commissioning', 'Pending Review', 'Mechanical', '01/25/2026'),
  mkObs('proj-006', 'Pre-construction site — storm drain inlet damaged', 'Environmental', 'Closed', 'Civil', '09/20/2023'),

  // ── proj-007 · St. Francis ED Modernization ─────────────────────────────────
  mkObs('proj-007', 'MEP demolition — live electrical circuit not de-energized', 'Safety', 'Closed', 'Electrical', '04/05/2023'),
  mkObs('proj-007', 'HVAC replacement — existing fire damper not reinstalled', 'Safety', 'Closed', 'Mechanical', '05/05/2023'),
  mkObs('proj-007', 'Electrical service upgrade — conduit installation gap', 'Quality', 'Closed', 'Electrical', '06/01/2023'),
  mkObs('proj-007', 'Medical equipment pad — incorrect elevation', 'Quality', 'Closed', 'Structural', '06/15/2023'),
  mkObs('proj-007', 'Nurse call rough-in — conduit fill exceeds 40% Corridor 3', 'Quality', 'Closed', 'Electrical', '08/10/2023'),
  mkObs('proj-007', 'Interior renovation — ceiling height non-compliant Bay 7', 'Quality', 'Closed', 'Interior', '07/20/2023'),
  mkObs('proj-007', 'HVAC controls — BACnet integration failing 3 AHUs', 'Commissioning', 'In Progress', 'Mechanical', '11/15/2025'),
  mkObs('proj-007', 'Final close-out — as-built drawings incomplete Level 2', 'Quality', 'Open', 'General', '01/10/2026'),

  // ── proj-008 · Trinity Columbus Specialist Office ───────────────────────────
  mkObs('proj-008', 'Geotech — unsuitable soils at building pad location', 'Quality', 'Closed', 'Civil', '12/20/2023'),
  mkObs('proj-008', 'Design review — structural beam size discrepancy SE corner', 'Quality', 'Pending Review', 'Structural', '02/20/2024'),
  mkObs('proj-008', 'MEP coordination — plumbing stack conflict with stairwell', 'Quality', 'Open', 'Plumbing', '03/05/2024'),
  mkObs('proj-008', 'Site boundary — temporary fencing not installed', 'Safety', 'Closed', 'Civil', '01/20/2024'),
  mkObs('proj-008', 'Bid package — IT conduit stub-out locations missing', 'Quality', 'Pending Review', 'Electrical', '04/05/2024'),
  mkObs('proj-008', 'Owner contingency — scope items not documented', 'General', 'Open', 'General', '04/15/2024'),
  mkObs('proj-008', 'Construction documents — ceiling height variation unaddressed', 'Quality', 'Pending Review', 'Interior', '03/25/2024'),

  // ── proj-009 · St. Vincent's Surgical ──────────────────────────────────────
  mkObs('proj-009', 'Surgical suite — HEPA filtration unit not commissioned', 'Commissioning', 'Pending Review', 'Mechanical', '05/05/2024'),
  mkObs('proj-009', 'Medical gas — oxygen manifold pressure test fail', 'Safety', 'Closed', 'Plumbing', '03/15/2024'),
  mkObs('proj-009', 'OR floor — epoxy coating delamination Suite 2', 'Quality', 'In Progress', 'Interior', '04/10/2024'),
  mkObs('proj-009', 'Robotic suite — cable tray routing above sterile field', 'Quality', 'Closed', 'Electrical', '04/20/2024'),
  mkObs('proj-009', 'HVAC pressurization — corridor/room differential insufficient', 'Quality', 'In Progress', 'Mechanical', '04/25/2024'),
  mkObs('proj-009', 'Sterile processing — exhaust fan motor failure', 'Quality', 'Pending Review', 'Mechanical', '05/15/2024'),
  mkObs('proj-009', 'Interior finishes — coved base missing at SPD room', 'Quality', 'Open', 'Interior', '05/20/2024'),
  mkObs('proj-009', 'Medical air compressor — vibration isolation ineffective', 'Quality', 'In Progress', 'Mechanical', '04/05/2024'),

  // ── proj-010 · Marian Medical Outpatient Clinic ──────────────────────────────
  mkObs('proj-010', 'Site development — erosion control not installed', 'Environmental', 'Closed', 'Civil', '11/05/2024'),
  mkObs('proj-010', 'Grading plan — stormwater direction non-compliant NE', 'Environmental', 'Closed', 'Civil', '11/20/2024'),
  mkObs('proj-010', 'Construction documents — accessible parking count insufficient', 'Quality', 'Pending Review', 'Civil', '12/05/2024'),
  mkObs('proj-010', 'Owner equipment scope — imaging room conduit missing', 'Quality', 'Open', 'Electrical', '02/10/2025'),
  mkObs('proj-010', 'Design review — structural steel connection detail missing', 'Quality', 'Open', 'Structural', '01/25/2025'),
  mkObs('proj-010', 'Technology scope — server room UPS circuit not shown', 'Quality', 'Pending Review', 'Electrical', '02/20/2025'),
  mkObs('proj-010', 'Pre-construction survey — existing utility conflict at entry', 'Quality', 'Open', 'Civil', '08/20/2024'),
];
