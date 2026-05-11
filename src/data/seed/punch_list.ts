/**
 * PUNCH LIST SEED DATA
 * Fields: id, projectId, number, description, location, status, assignedTo, dueDate, createdBy, trade
 * ~8 per project for active/construction-phase projects (proj-001 to proj-010)
 */

const STATUSES = ['Open', 'In Progress', 'Completed', 'Void', 'Ready for Review'];
const LOCATIONS_MEDICAL = [
  'Level 1 — Lobby', 'Level 2 — Patient Rooms', 'Level 3 — ICU', 'Level 4 — Admin',
  'Mechanical Room', 'Roof Level', 'Loading Dock', 'Stairwell A', 'Stairwell B',
  'OR Suite 1', 'OR Suite 2', 'Sterile Processing', 'Imaging Suite', 'ED Bay Area',
];

let seq = 0;

function mkPunch(
  projectId: string,
  description: string,
  location: string,
  status: string,
  assignedTo: string,
  dueDate: string,
  createdBy: string,
  trade: string,
) {
  seq++;
  return {
    id: `punch-${String(seq).padStart(4, '0')}`,
    projectId,
    number: seq,
    description,
    location,
    status,
    assignedTo,
    dueDate,
    createdBy,
    trade,
  };
}

export const punchList: any[] = [

  // ── proj-001 · St. Joseph Tower ─────────────────────────────────────────────
  mkPunch('proj-001', 'Touch-up paint — scuff marks on corridor walls Level 5', 'Level 2 — Patient Rooms', 'In Progress', 'Turner Construction', '03/15/2025', 'Alex Rivera', 'Finishes'),
  mkPunch('proj-001', 'Door hardware — room 512 lever handle loose', 'Level 2 — Patient Rooms', 'Open', 'Clark Construction', '03/10/2025', 'Jordan Lee', 'Doors & Hardware'),
  mkPunch('proj-001', 'Ceiling tile replacement — water stain Nurse Station 3', 'Level 3 — ICU', 'Ready for Review', 'PCL Construction', '03/05/2025', 'Alex Rivera', 'Finishes'),
  mkPunch('proj-001', 'HVAC diffuser — missing fastener Corridor 7', 'Mechanical Room', 'Completed', 'PCL Construction', '02/28/2025', 'Sam Torres', 'HVAC'),
  mkPunch('proj-001', 'Curtainwall sealant — small gap Bay 22-A', 'Level 4 — Admin', 'In Progress', 'DPR Construction', '03/20/2025', 'Jordan Lee', 'Envelope'),
  mkPunch('proj-001', 'Electrical cover plate — missing in janitor closet L6', 'Level 3 — ICU', 'Open', 'Gilbane Building', '03/25/2025', 'Morgan Kim', 'Electrical'),
  mkPunch('proj-001', 'Plumbing — slow drain at sink in OR Scrub Alcove', 'Level 2 — Patient Rooms', 'Completed', 'Clark Construction', '02/20/2025', 'Sam Torres', 'Plumbing'),
  mkPunch('proj-001', 'Elevator — cab lighting flicker cab #2', 'Level 1 — Lobby', 'In Progress', 'Walsh Construction', '03/30/2025', 'Morgan Kim', 'Electrical'),
  mkPunch('proj-001', 'Signage — missing room number plaque Room 407', 'Level 4 — Admin', 'Open', 'McCarthy Building', '04/01/2025', 'Alex Rivera', 'Finishes'),
  mkPunch('proj-001', 'Flooring — resilient base adhesive failure Level 2 corridor', 'Level 2 — Patient Rooms', 'Ready for Review', 'Skanska USA', '03/12/2025', 'Alex Rivera', 'Finishes'),

  // ── proj-002 · Holy Cross Outpatient Pavilion ───────────────────────────────
  mkPunch('proj-002', 'Exterior cladding panel — hairline crack panel 18', 'Level 1 — Lobby', 'In Progress', 'JE Dunn Construction', '06/10/2025', 'Jordan Lee', 'Envelope'),
  mkPunch('proj-002', 'Interior finishes — grout missing Room 112 corridor', 'Level 2 — Patient Rooms', 'Open', 'Skanska USA', '06/15/2025', 'Alex Rivera', 'Finishes'),
  mkPunch('proj-002', 'Plumbing — toilet flush valve adjustment Room 204', 'Level 2 — Patient Rooms', 'Ready for Review', 'Barton Malow', '06/05/2025', 'Sam Torres', 'Plumbing'),
  mkPunch('proj-002', 'HVAC balancing — airflow test fail Zone B2', 'Mechanical Room', 'In Progress', 'Barton Malow', '06/20/2025', 'Sam Torres', 'HVAC'),
  mkPunch('proj-002', 'Exit sign — battery backup failure Stairwell A', 'Stairwell A', 'Open', 'Clark Construction', '06/12/2025', 'Morgan Kim', 'Electrical'),
  mkPunch('proj-002', 'Door — auto-close hardware adjustment Room 118', 'Level 1 — Lobby', 'Completed', 'Walsh Construction', '05/30/2025', 'Jordan Lee', 'Doors & Hardware'),
  mkPunch('proj-002', 'Landscaping — irrigation head broken Zone 3', 'Loading Dock', 'Open', 'Turner Construction', '07/01/2025', 'Jordan Lee', 'Civil'),
  mkPunch('proj-002', 'Ceiling — access panel latch broken Storage 1', 'Level 3 — ICU', 'Open', 'Mortenson Construction', '06/25/2025', 'Alex Rivera', 'Finishes'),

  // ── proj-003 · Mercy MOB Phase II ──────────────────────────────────────────
  mkPunch('proj-003', 'Interior finishes — paint color mismatch Exam Room 3', 'Level 2 — Patient Rooms', 'Completed', 'PCL Construction', '03/01/2024', 'Alex Rivera', 'Finishes'),
  mkPunch('proj-003', 'Ceiling tile — damaged during MEP above-ceiling work', 'Level 3 — ICU', 'Completed', 'McCarthy Building', '03/05/2024', 'Alex Rivera', 'Finishes'),
  mkPunch('proj-003', 'Door hardware — panic bar alignment off at Exit A', 'Stairwell A', 'Completed', 'DPR Construction', '02/28/2024', 'Jordan Lee', 'Doors & Hardware'),
  mkPunch('proj-003', 'Plumbing — hot water temperature adjustment Suite 4', 'Level 2 — Patient Rooms', 'Completed', 'McCarthy Building', '03/10/2024', 'Sam Torres', 'Plumbing'),
  mkPunch('proj-003', 'Elevator — call button backlight out Floor 3', 'Level 3 — ICU', 'Completed', 'Gilbane Building', '02/25/2024', 'Morgan Kim', 'Electrical'),
  mkPunch('proj-003', 'Signage — room identification plaques 3 locations', 'Level 4 — Admin', 'Completed', 'Brasfield & Gorrie', '03/15/2024', 'Alex Rivera', 'Finishes'),
  mkPunch('proj-003', 'HVAC diffuser — deflector orientation wrong Conf Room', 'Level 4 — Admin', 'Completed', 'McCarthy Building', '03/08/2024', 'Sam Torres', 'HVAC'),

  // ── proj-004 · St. Mary's Renovation ───────────────────────────────────────
  mkPunch('proj-004', 'Pre-construction — hazmat containment barrier inspection', 'Level 1 — Lobby', 'Open', 'Barton Malow', '06/15/2026', 'Jordan Lee', 'General'),
  mkPunch('proj-004', 'Pre-construction — ICRA barrier integrity check daily', 'Level 2 — Patient Rooms', 'In Progress', 'AECOM Hunt', '06/01/2026', 'Jordan Lee', 'General'),
  mkPunch('proj-004', 'Staging area — temporary utility disconnection needed', 'Mechanical Room', 'Open', 'Hensel Phelps', '06/10/2026', 'Sam Torres', 'Mechanical'),
  mkPunch('proj-004', 'Site logistics — delivery route sign installation missing', 'Loading Dock', 'Open', 'Hensel Phelps', '06/05/2026', 'Jordan Lee', 'Civil'),
  mkPunch('proj-004', 'Abatement — final clearance air testing required Zone 3', 'Level 3 — ICU', 'Pending', 'Barton Malow', '06/20/2026', 'Morgan Kim', 'General'),

  // ── proj-005 · Loyola Behavioral Health ────────────────────────────────────
  mkPunch('proj-005', 'Behavioral unit — door gap exceeds 1/8" spec Room 201', 'Level 2 — Patient Rooms', 'In Progress', 'DPR Construction', '01/15/2024', 'Jordan Lee', 'Doors & Hardware'),
  mkPunch('proj-005', 'Specialty hardware — missing ligature-resistant grab bar Bath 3', 'Level 2 — Patient Rooms', 'Open', 'DPR Construction', '01/20/2024', 'Jordan Lee', 'Doors & Hardware'),
  mkPunch('proj-005', 'Interior finishes — vinyl base loose Corridor B Level 2', 'Level 2 — Patient Rooms', 'Completed', 'Mortenson Construction', '01/10/2024', 'Alex Rivera', 'Finishes'),
  mkPunch('proj-005', 'HVAC — AHU filter replacement Unit 4', 'Mechanical Room', 'Completed', 'Walsh Construction', '12/15/2023', 'Sam Torres', 'HVAC'),
  mkPunch('proj-005', 'Medical gas — pressure gauge calibration OR-1', 'OR Suite 1', 'In Progress', 'Skanska USA', '01/25/2024', 'Sam Torres', 'Mechanical'),
  mkPunch('proj-005', 'Plumbing — patient toilet privacy door hinge adjustment', 'Level 3 — ICU', 'Open', 'Barton Malow', '02/01/2024', 'Sam Torres', 'Plumbing'),
  mkPunch('proj-005', 'Electrical — emergency lighting test fail Stairwell B', 'Stairwell B', 'Ready for Review', 'JE Dunn Construction', '01/30/2024', 'Morgan Kim', 'Electrical'),
  mkPunch('proj-005', 'Exterior — security lighting pole alignment off NE entry', 'Loading Dock', 'Open', 'Brasfield & Gorrie', '02/05/2024', 'Morgan Kim', 'Electrical'),

  // ── proj-006 · Chandler Regional ───────────────────────────────────────────
  mkPunch('proj-006', 'Construction office — temporary HVAC unit filter change', 'Mechanical Room', 'Open', 'PCL Construction', '03/01/2026', 'Sam Torres', 'HVAC'),
  mkPunch('proj-006', 'Site office — exterior door lock cylinder replacement', 'Level 1 — Lobby', 'Open', 'PCL Construction', '03/05/2026', 'Jordan Lee', 'Doors & Hardware'),
  mkPunch('proj-006', 'Temporary fencing — panel connection loose SE corner', 'Loading Dock', 'In Progress', 'AECOM Hunt', '02/15/2026', 'Jordan Lee', 'Civil'),
  mkPunch('proj-006', 'Staging plan — material storage zone markings faded', 'Loading Dock', 'Open', 'PCL Construction', '02/20/2026', 'Jordan Lee', 'Civil'),

  // ── proj-007 · St. Francis ED Modernization ─────────────────────────────────
  mkPunch('proj-007', 'ED Bay — casework drawer runner adjustment Bay 12', 'ED Bay Area', 'In Progress', 'Walsh Construction', '02/01/2026', 'Alex Rivera', 'Finishes'),
  mkPunch('proj-007', 'Nurse call — annunciator panel lamp replacement Zone 2', 'Level 2 — Patient Rooms', 'Open', 'Gilbane Building', '02/10/2026', 'Morgan Kim', 'Electrical'),
  mkPunch('proj-007', 'HVAC — ACH commissioning test fail Isolation Room 3', 'Level 3 — ICU', 'In Progress', 'Mortenson Construction', '02/15/2026', 'Sam Torres', 'HVAC'),
  mkPunch('proj-007', 'Interior renovation — paint touch-up Corridor C Level 1', 'Level 1 — Lobby', 'Ready for Review', 'JE Dunn Construction', '01/25/2026', 'Alex Rivera', 'Finishes'),
  mkPunch('proj-007', 'Flooring — epoxy coating delamination Trauma Bay entrance', 'ED Bay Area', 'Open', 'Walsh Construction', '02/20/2026', 'Alex Rivera', 'Finishes'),
  mkPunch('proj-007', 'Electrical — missing data outlet cover Nurse Station 1', 'Level 1 — Lobby', 'Completed', 'Clark Construction', '01/20/2026', 'Morgan Kim', 'Electrical'),
  mkPunch('proj-007', 'Plumbing — scrub sink faucet dripping OR Prep Room', 'OR Suite 1', 'Open', 'Skanska USA', '02/25/2026', 'Sam Torres', 'Plumbing'),
  mkPunch('proj-007', 'Close-out — O&M manual binders not yet submitted', 'Level 4 — Admin', 'Open', 'JE Dunn Construction', '03/01/2026', 'Jordan Lee', 'General'),

  // ── proj-008 · Trinity Columbus Specialist Office ───────────────────────────
  mkPunch('proj-008', 'Pre-construction site — utility locate flags replaced', 'Loading Dock', 'Open', 'Barton Malow', '05/01/2024', 'Jordan Lee', 'Civil'),
  mkPunch('proj-008', 'Staging — construction trailer leveling adjustment', 'Level 1 — Lobby', 'In Progress', 'Barton Malow', '05/05/2024', 'Jordan Lee', 'General'),
  mkPunch('proj-008', 'Site signage — project information board installation', 'Level 1 — Lobby', 'Open', 'Brasfield & Gorrie', '05/10/2024', 'Alex Rivera', 'General'),
  mkPunch('proj-008', 'Owner review — geotech report comments outstanding', 'Level 4 — Admin', 'Open', 'Skanska USA', '05/15/2024', 'Morgan Kim', 'General'),

  // ── proj-009 · St. Vincent's Surgical ──────────────────────────────────────
  mkPunch('proj-009', 'OR Suite 1 — ceiling tile damage during equipment delivery', 'OR Suite 1', 'Completed', 'DPR Construction', '06/05/2024', 'Alex Rivera', 'Finishes'),
  mkPunch('proj-009', 'OR Suite 2 — door seal gap above frame', 'OR Suite 2', 'In Progress', 'Whiting-Turner', '06/10/2024', 'Jordan Lee', 'Doors & Hardware'),
  mkPunch('proj-009', 'Sterile processing — floor drain cover missing SPD room', 'Sterile Processing', 'Open', 'McCarthy Building', '06/15/2024', 'Sam Torres', 'Plumbing'),
  mkPunch('proj-009', 'Medical gas — zone valve box label missing Suite 3', 'OR Suite 2', 'Ready for Review', 'Walsh Construction', '06/08/2024', 'Sam Torres', 'Mechanical'),
  mkPunch('proj-009', 'HVAC — differential pressure gauge calibration OR 1', 'OR Suite 1', 'In Progress', 'Clark Construction', '06/20/2024', 'Sam Torres', 'HVAC'),
  mkPunch('proj-009', 'Interior finishes — stainless base cove not installed Corridor', 'Sterile Processing', 'Open', 'McCarthy Building', '06/25/2024', 'Alex Rivera', 'Finishes'),
  mkPunch('proj-009', 'Electrical — surgical light circuit label correction OR 2', 'OR Suite 2', 'Completed', 'Turner Construction', '05/30/2024', 'Morgan Kim', 'Electrical'),
  mkPunch('proj-009', 'Robotic suite — cable management cover panel loose', 'OR Suite 1', 'In Progress', 'DPR Construction', '06/18/2024', 'Morgan Kim', 'Electrical'),

  // ── proj-010 · Marian Medical Outpatient Clinic ──────────────────────────────
  mkPunch('proj-010', 'Site grading — low spot erosion at SW corner', 'Loading Dock', 'Open', 'Brasfield & Gorrie', '04/01/2025', 'Jordan Lee', 'Civil'),
  mkPunch('proj-010', 'Pre-construction — utility locate refresher needed', 'Loading Dock', 'In Progress', 'Mortenson Construction', '03/15/2025', 'Jordan Lee', 'Civil'),
  mkPunch('proj-010', 'Staging area — wheel wash station installation', 'Loading Dock', 'Open', 'Mortenson Construction', '03/20/2025', 'Jordan Lee', 'Civil'),
  mkPunch('proj-010', 'Permit documents — structural drawing revision submittal', 'Level 4 — Admin', 'Open', 'JE Dunn Construction', '04/15/2025', 'Morgan Kim', 'Structural'),
];
