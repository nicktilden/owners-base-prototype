/**
 * CORRESPONDENCE SEED DATA
 * Fields: id, projectId, number, subject, type, status, from, date
 * ~8 per project (proj-001 to proj-010)
 */

const TYPES = ['RFI Response', 'Submittal Response', 'Notice', 'Letter', 'Memo', 'Meeting Minutes', 'Transmittal', 'Email'];
const STATUSES = ['Sent', 'Received', 'Draft', 'Pending Response', 'Closed'];

let seq = 0;

function mkCorr(
  projectId: string,
  subject: string,
  type: string,
  status: string,
  from: string,
  date: string,
) {
  seq++;
  return {
    id: `corr-${String(seq).padStart(4, '0')}`,
    projectId,
    number: seq,
    subject,
    type,
    status,
    from,
    date,
  };
}

export const correspondence: any[] = [

  // ── proj-001 · St. Joseph Tower ─────────────────────────────────────────────
  mkCorr('proj-001', 'Notice to Proceed — Phase 2 Construction', 'Notice', 'Sent', 'Bridget O\'Sullivan', '08/20/2023'),
  mkCorr('proj-001', 'Response to RFI-042: Structural Beam Clarification', 'RFI Response', 'Closed', 'Turner Construction', '09/10/2023'),
  mkCorr('proj-001', 'Submittal Review — Curtainwall Shop Drawings', 'Submittal Response', 'Sent', 'DPR Construction', '10/05/2023'),
  mkCorr('proj-001', 'Monthly Progress Meeting Minutes — October 2023', 'Meeting Minutes', 'Received', 'PCL Construction', '10/31/2023'),
  mkCorr('proj-001', 'Transmittal: Revised MEP Coordination Drawings', 'Transmittal', 'Sent', 'Bridget O\'Sullivan', '11/12/2023'),
  mkCorr('proj-001', 'Notice of Potential Delay — Steel Delivery', 'Notice', 'Received', 'Skanska USA', '11/20/2023'),
  mkCorr('proj-001', 'Letter: Insurance Compliance Confirmation', 'Letter', 'Closed', 'Turner Construction', '12/01/2023'),
  mkCorr('proj-001', 'Memo: Infection Control Protocol Update', 'Memo', 'Sent', 'Bridget O\'Sullivan', '12/15/2023'),
  mkCorr('proj-001', 'Response to RFI-071: Medical Gas Routing', 'RFI Response', 'Closed', 'Clark Construction', '01/08/2024'),
  mkCorr('proj-001', 'Monthly Progress Meeting Minutes — January 2024', 'Meeting Minutes', 'Received', 'Turner Construction', '01/31/2024'),

  // ── proj-002 · Holy Cross Outpatient Pavilion ───────────────────────────────
  mkCorr('proj-002', 'Notice to Proceed — Foundation Works', 'Notice', 'Sent', 'Bridget O\'Sullivan', '01/20/2024'),
  mkCorr('proj-002', 'Response to RFI-011: Footing Depth Variance', 'RFI Response', 'Closed', 'Walsh Construction', '02/10/2024'),
  mkCorr('proj-002', 'Submittal Review — Structural Concrete Mix Design', 'Submittal Response', 'Sent', 'Mortenson Construction', '02/25/2024'),
  mkCorr('proj-002', 'Monthly Progress Meeting Minutes — February 2024', 'Meeting Minutes', 'Received', 'Walsh Construction', '02/29/2024'),
  mkCorr('proj-002', 'Transmittal: Updated Civil Grading Plans', 'Transmittal', 'Sent', 'Bridget O\'Sullivan', '03/05/2024'),
  mkCorr('proj-002', 'Notice of Change — Exterior Cladding Material', 'Notice', 'Received', 'JE Dunn Construction', '03/18/2024'),
  mkCorr('proj-002', 'Letter: Fire Protection System Approval', 'Letter', 'Closed', 'DPR Construction', '04/20/2024'),
  mkCorr('proj-002', 'Email: Sitework Contractor Schedule Conflict', 'Email', 'Pending Response', 'Turner Construction', '05/01/2024'),

  // ── proj-003 · Mercy MOB Phase II ──────────────────────────────────────────
  mkCorr('proj-003', 'Notice to Proceed — Structural Steel Package', 'Notice', 'Sent', 'Bridget O\'Sullivan', '10/20/2023'),
  mkCorr('proj-003', 'Response to RFI-007: Curtainwall Anchor Locations', 'RFI Response', 'Closed', 'Walsh Construction', '11/08/2023'),
  mkCorr('proj-003', 'Submittal Review — MEP Above-Ceiling Coordination', 'Submittal Response', 'Sent', 'McCarthy Building', '11/22/2023'),
  mkCorr('proj-003', 'Monthly Progress Meeting Minutes — November 2023', 'Meeting Minutes', 'Received', 'DPR Construction', '11/30/2023'),
  mkCorr('proj-003', 'Transmittal: Revised Fire Suppression Drawings', 'Transmittal', 'Sent', 'Bridget O\'Sullivan', '12/10/2023'),
  mkCorr('proj-003', 'Letter: Elevator Inspection Scheduling', 'Letter', 'Closed', 'Gilbane Building', '01/20/2024'),
  mkCorr('proj-003', 'Memo: Infection Control Variance — Zone 3', 'Memo', 'Sent', 'Bridget O\'Sullivan', '01/28/2024'),
  mkCorr('proj-003', 'Notice of Potential Claim — Weather Delays', 'Notice', 'Received', 'DPR Construction', '02/05/2024'),

  // ── proj-004 · St. Mary's Renovation ───────────────────────────────────────
  mkCorr('proj-004', 'Notice to Proceed — Pre-Construction Services', 'Notice', 'Sent', 'Bridget O\'Sullivan', '04/20/2026'),
  mkCorr('proj-004', 'Transmittal: Existing Conditions Survey Report', 'Transmittal', 'Received', 'Hensel Phelps', '05/01/2026'),
  mkCorr('proj-004', 'Response to RFI-002: Hazmat Survey Scope', 'RFI Response', 'Sent', 'Barton Malow', '05/10/2026'),
  mkCorr('proj-004', 'Letter: ICRA Plan Approval', 'Letter', 'Closed', 'AECOM Hunt', '05/20/2026'),
  mkCorr('proj-004', 'Meeting Minutes — Pre-Construction Kick-Off', 'Meeting Minutes', 'Received', 'Hensel Phelps', '04/16/2026'),
  mkCorr('proj-004', 'Memo: Technology Infrastructure Pre-Procurement', 'Memo', 'Sent', 'Bridget O\'Sullivan', '05/25/2026'),
  mkCorr('proj-004', 'Notice: Construction Contract Award Pending', 'Notice', 'Pending Response', 'Bridget O\'Sullivan', '06/01/2026'),

  // ── proj-005 · Loyola Behavioral Health ────────────────────────────────────
  mkCorr('proj-005', 'Notice to Proceed — GC/CM Contract', 'Notice', 'Sent', 'Bridget O\'Sullivan', '06/05/2023'),
  mkCorr('proj-005', 'Response to RFI-013: Behavioral Health Hardware Spec', 'RFI Response', 'Closed', 'DPR Construction', '07/15/2023'),
  mkCorr('proj-005', 'Submittal Review — Specialty Hardware Package', 'Submittal Response', 'Sent', 'McCarthy Building', '08/05/2023'),
  mkCorr('proj-005', 'Monthly Progress Meeting Minutes — August 2023', 'Meeting Minutes', 'Received', 'McCarthy Building', '08/31/2023'),
  mkCorr('proj-005', 'Transmittal: Updated Egress Plans — All Floors', 'Transmittal', 'Sent', 'Bridget O\'Sullivan', '09/10/2023'),
  mkCorr('proj-005', 'Notice of Change — Medical Gas System Routing', 'Notice', 'Received', 'Walsh Construction', '10/05/2023'),
  mkCorr('proj-005', 'Letter: Site Civil Contractor Schedule Update', 'Letter', 'Closed', 'Brasfield & Gorrie', '10/20/2023'),
  mkCorr('proj-005', 'Email: Kitchen Equipment Procurement Status', 'Email', 'Pending Response', 'Barton Malow', '11/15/2023'),

  // ── proj-006 · Chandler Regional ───────────────────────────────────────────
  mkCorr('proj-006', 'Letter of Intent — GC/CM Selection', 'Letter', 'Sent', 'Bridget O\'Sullivan', '08/15/2023'),
  mkCorr('proj-006', 'Transmittal: Schematic Design Package', 'Transmittal', 'Received', 'AECOM Hunt', '09/15/2023'),
  mkCorr('proj-006', 'Response to RFI-003: Site Survey Boundary Clarification', 'RFI Response', 'Closed', 'Walsh Construction', '10/10/2023'),
  mkCorr('proj-006', 'Meeting Minutes — Design Development Review', 'Meeting Minutes', 'Received', 'PCL Construction', '11/01/2023'),
  mkCorr('proj-006', 'Notice: Construction Contract Award Pending GMP', 'Notice', 'Pending Response', 'Bridget O\'Sullivan', '01/20/2026'),
  mkCorr('proj-006', 'Memo: Owner Equipment Allowance Allocation', 'Memo', 'Sent', 'Bridget O\'Sullivan', '02/01/2026'),
  mkCorr('proj-006', 'Letter: Commissioning Agent Engagement', 'Letter', 'Sent', 'Barton Malow', '01/20/2026'),

  // ── proj-007 · St. Francis ED Modernization ─────────────────────────────────
  mkCorr('proj-007', 'Notice to Proceed — Base Contract', 'Notice', 'Sent', 'Bridget O\'Sullivan', '03/20/2023'),
  mkCorr('proj-007', 'Response to RFI-019: MEP Shaft Routing Conflict', 'RFI Response', 'Closed', 'Skanska USA', '05/10/2023'),
  mkCorr('proj-007', 'Submittal Review — HVAC Controls Sequence of Operations', 'Submittal Response', 'Sent', 'McCarthy Building', '06/01/2023'),
  mkCorr('proj-007', 'Monthly Progress Meeting Minutes — June 2023', 'Meeting Minutes', 'Received', 'JE Dunn Construction', '06/30/2023'),
  mkCorr('proj-007', 'Transmittal: Revised Electrical One-Line Diagram', 'Transmittal', 'Sent', 'Bridget O\'Sullivan', '07/15/2023'),
  mkCorr('proj-007', 'Letter: Medical Equipment Planning Sign-Off', 'Letter', 'Closed', 'Turner Construction', '08/15/2023'),
  mkCorr('proj-007', 'Email: Close-Out Documentation Timeline', 'Email', 'Pending Response', 'DPR Construction', '12/01/2025'),
  mkCorr('proj-007', 'Memo: Final Commissioning Schedule', 'Memo', 'Sent', 'Bridget O\'Sullivan', '01/05/2026'),

  // ── proj-008 · Trinity Columbus Specialist Office ───────────────────────────
  mkCorr('proj-008', 'Transmittal: Architectural SD Package', 'Transmittal', 'Received', 'Brasfield & Gorrie', '11/15/2023'),
  mkCorr('proj-008', 'Response to RFI-001: Site Geotech Boring Locations', 'RFI Response', 'Closed', 'Skanska USA', '12/20/2023'),
  mkCorr('proj-008', 'Meeting Minutes — MEP Design Coordination', 'Meeting Minutes', 'Received', 'AECOM Hunt', '02/15/2024'),
  mkCorr('proj-008', 'Notice: GC/CM Bidding Phase Commencement', 'Notice', 'Sent', 'Bridget O\'Sullivan', '03/01/2024'),
  mkCorr('proj-008', 'Letter: IT Infrastructure Scope Clarification', 'Letter', 'Pending Response', 'PCL Construction', '03/20/2024'),
  mkCorr('proj-008', 'Memo: Owner Contingency Reserve Authorization', 'Memo', 'Sent', 'Bridget O\'Sullivan', '04/01/2024'),
  mkCorr('proj-008', 'Transmittal: Bid Package — GC/CM Award', 'Transmittal', 'Pending Response', 'Barton Malow', '04/10/2024'),

  // ── proj-009 · St. Vincent's Surgical ──────────────────────────────────────
  mkCorr('proj-009', 'Notice to Proceed — Phase 1 Construction', 'Notice', 'Sent', 'Bridget O\'Sullivan', '02/05/2024'),
  mkCorr('proj-009', 'Response to RFI-008: Surgical Suite HVAC Pressurization', 'RFI Response', 'Closed', 'Clark Construction', '03/10/2024'),
  mkCorr('proj-009', 'Submittal Review — Robotic Surgery Suite Layout', 'Submittal Response', 'Sent', 'DPR Construction', '04/20/2024'),
  mkCorr('proj-009', 'Monthly Progress Meeting Minutes — April 2024', 'Meeting Minutes', 'Received', 'Whiting-Turner', '04/30/2024'),
  mkCorr('proj-009', 'Transmittal: Updated Sterile Processing Equipment Schedule', 'Transmittal', 'Sent', 'Bridget O\'Sullivan', '05/10/2024'),
  mkCorr('proj-009', 'Letter: Phase 2 Preconstruction Authorization', 'Letter', 'Sent', 'Bridget O\'Sullivan', '05/20/2024'),
  mkCorr('proj-009', 'Email: Sterile Processing Equipment Lead Time Concern', 'Email', 'Pending Response', 'Gilbane Building', '06/01/2024'),

  // ── proj-010 · Marian Medical Outpatient Clinic ──────────────────────────────
  mkCorr('proj-010', 'Notice to Proceed — A&E Services', 'Notice', 'Sent', 'Bridget O\'Sullivan', '08/05/2024'),
  mkCorr('proj-010', 'Transmittal: Site Development Permit Application', 'Transmittal', 'Received', 'Brasfield & Gorrie', '11/10/2024'),
  mkCorr('proj-010', 'Response to RFI-002: Parking Layout Revision', 'RFI Response', 'Sent', 'JE Dunn Construction', '12/01/2024'),
  mkCorr('proj-010', 'Meeting Minutes — Pre-Construction Kick-Off', 'Meeting Minutes', 'Received', 'Mortenson Construction', '01/20/2025'),
  mkCorr('proj-010', 'Letter: Building Permit Status Update', 'Letter', 'Pending Response', 'Bridget O\'Sullivan', '02/01/2025'),
  mkCorr('proj-010', 'Memo: Technology & Security Systems Scope', 'Memo', 'Sent', 'Bridget O\'Sullivan', '02/15/2025'),
  mkCorr('proj-010', 'Notice: GMP Negotiation — Construction Contract', 'Notice', 'Pending Response', 'Mortenson Construction', '03/01/2025'),
];
