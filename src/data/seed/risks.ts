/**
 * RISK SEED DATA
 * Structured risk records per project (5–10 per project).
 * Mix of categories and statuses.
 * High-probability risks on proj-011 (healthy project) drive the forecast-warning demo state.
 * origin: 'manual' = logged by project team; 'promoted' = elevated from an automated signal.
 */

import type { Risk } from '@/types/health';

export const risks: Risk[] = [

  // ── proj-001 · St. Joseph Tower Expansion (CRITICAL) ────────────────────
  { id: 'r-001-1', projectId: 'proj-001', category: 'financial', title: 'Steel Price Escalation', description: 'Structural steel costs have exceeded original estimates by 14% due to supply chain volatility.', probability: 5, impactCost: 5, impactSchedule: 3, impactSafety: 1, responseStrategy: 'mitigate', status: 'assessed', dueDate: '2026-05-15', origin: 'manual' },
  { id: 'r-001-2', projectId: 'proj-001', category: 'schedule', title: 'MEP Coordination Delays', description: 'Mechanical, electrical, and plumbing coordination conflicts on floors 4–6 causing a projected 6-week delay.', probability: 5, impactCost: 3, impactSchedule: 5, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-04-30', origin: 'promoted' },
  { id: 'r-001-3', projectId: 'proj-001', category: 'contractual', title: 'GC Change Order Dispute', description: 'Turner Construction has submitted a $4.2M contested change order for scope expansion.', probability: 4, impactCost: 4, impactSchedule: 2, impactSafety: 1, responseStrategy: 'transfer', status: 'assessed', dueDate: '2026-06-01', origin: 'manual' },
  { id: 'r-001-4', projectId: 'proj-001', category: 'safety', title: 'Elevated Work Safety Incidents', description: 'Three near-miss incidents recorded in Q1 2026 on elevated floor decks; OSHA review pending.', probability: 3, impactCost: 2, impactSchedule: 2, impactSafety: 5, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-04-25', origin: 'promoted' },
  { id: 'r-001-5', projectId: 'proj-001', category: 'schedule', title: 'Subcontractor Labor Shortage', description: 'Drywall subcontractor reporting 30% crew shortage due to competing regional projects.', probability: 4, impactCost: 2, impactSchedule: 4, impactSafety: 1, responseStrategy: 'mitigate', status: 'assessed', dueDate: '2026-05-01', origin: 'manual' },
  { id: 'r-001-6', projectId: 'proj-001', category: 'regulatory', title: 'Building Permit Amendment', description: 'Design change to emergency exit locations requires permit amendment; review queue is 8–10 weeks.', probability: 3, impactCost: 1, impactSchedule: 4, impactSafety: 2, responseStrategy: 'accept', status: 'identified', dueDate: '2026-07-01', origin: 'manual' },

  // ── proj-002 · Holy Cross Outpatient Pavilion (CRITICAL) ─────────────────
  { id: 'r-002-1', projectId: 'proj-002', category: 'financial', title: 'Budget Overage — Foundation Work', description: 'Unforeseen subsurface conditions added $3.1M to foundation scope, consuming 60% of contingency.', probability: 5, impactCost: 5, impactSchedule: 3, impactSafety: 1, responseStrategy: 'accept', status: 'assessed', dueDate: null, origin: 'manual' },
  { id: 'r-002-2', projectId: 'proj-002', category: 'schedule', title: 'End Date at Risk', description: 'Project is 34 days behind schedule; current forecast pushes substantial completion to Q1 2026.', probability: 5, impactCost: 2, impactSchedule: 5, impactSafety: 1, responseStrategy: 'mitigate', status: 'assessed', dueDate: '2026-05-30', origin: 'promoted' },
  { id: 'r-002-3', projectId: 'proj-002', category: 'contractual', title: 'Owner RFI Response Backlog', description: '17 RFIs awaiting owner response over 14 days; GC has issued a time-impact notice.', probability: 4, impactCost: 2, impactSchedule: 4, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-04-28', origin: 'promoted' },
  { id: 'r-002-4', projectId: 'proj-002', category: 'financial', title: 'Pending Change Events — Scope Growth', description: 'Six pending change events totaling $1.8M in scope additions not yet approved.', probability: 4, impactCost: 4, impactSchedule: 2, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-05-15', origin: 'manual' },
  { id: 'r-002-5', projectId: 'proj-002', category: 'safety', title: 'Site Access Risk', description: 'Active hospital campus proximity creates pedestrian safety risk during crane operations.', probability: 3, impactCost: 1, impactSchedule: 1, impactSafety: 4, responseStrategy: 'mitigate', status: 'mitigated', dueDate: null, origin: 'manual' },

  // ── proj-003 · Mercy Hospital MOB Phase II (AT RISK) ─────────────────────
  { id: 'r-003-1', projectId: 'proj-003', category: 'schedule', title: 'Curtainwall Lead Time', description: 'Curtainwall system delivery delayed 6 weeks due to manufacturer backlog; affects exterior closure.', probability: 4, impactCost: 1, impactSchedule: 4, impactSafety: 1, responseStrategy: 'mitigate', status: 'assessed', dueDate: '2026-06-15', origin: 'manual' },
  { id: 'r-003-2', projectId: 'proj-003', category: 'financial', title: 'Concrete Cost Escalation', description: 'Ready-mix concrete costs up 9% since bid; unrecovered exposure of approximately $480K.', probability: 4, impactCost: 3, impactSchedule: 1, impactSafety: 1, responseStrategy: 'accept', status: 'assessed', dueDate: null, origin: 'manual' },
  { id: 'r-003-3', projectId: 'proj-003', category: 'contractual', title: 'Submittal Cycle Delays', description: 'Design team averaging 18 days on submittal reviews vs. 10-day contractual requirement.', probability: 3, impactCost: 1, impactSchedule: 3, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-05-01', origin: 'promoted' },
  { id: 'r-003-4', projectId: 'proj-003', category: 'regulatory', title: 'Healthcare Licensing Delay', description: 'Occupancy cert requires AHCA sign-off which has a 12-week backlog in Georgia.', probability: 3, impactCost: 1, impactSchedule: 4, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-07-01', origin: 'manual' },
  { id: 'r-003-5', projectId: 'proj-003', category: 'safety', title: 'Hazardous Material Abatement', description: 'Phase I ESA found legacy asbestos in existing mechanical room; abatement scope TBD.', probability: 2, impactCost: 3, impactSchedule: 2, impactSafety: 3, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-05-30', origin: 'manual' },

  // ── proj-004 · St. Mary's Medical Center Renovation (AT RISK) ────────────
  { id: 'r-004-1', projectId: 'proj-004', category: 'financial', title: 'Existing Condition Unknowns', description: 'Renovation scope revealing hidden MEP systems requiring rerouting; estimated $1.2M exposure.', probability: 4, impactCost: 4, impactSchedule: 2, impactSafety: 1, responseStrategy: 'mitigate', status: 'assessed', dueDate: '2026-06-01', origin: 'manual' },
  { id: 'r-004-2', projectId: 'proj-004', category: 'schedule', title: 'Phased Occupancy Coordination', description: 'Hospital operations cannot vacate wing until replacement space is ready, creating sequencing risk.', probability: 3, impactCost: 1, impactSchedule: 4, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-08-01', origin: 'manual' },
  { id: 'r-004-3', projectId: 'proj-004', category: 'contractual', title: 'Change Event Backlog', description: '9 pending change events totaling $870K awaiting owner approval; contractor on notice.', probability: 4, impactCost: 3, impactSchedule: 1, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-05-10', origin: 'promoted' },
  { id: 'r-004-4', projectId: 'proj-004', category: 'safety', title: 'Infection Control Risk', description: 'Renovation in active hospital creates infection control risk; ICRA protocols must be maintained.', probability: 2, impactCost: 1, impactSchedule: 1, impactSafety: 4, responseStrategy: 'mitigate', status: 'mitigated', dueDate: null, origin: 'manual' },
  { id: 'r-004-5', projectId: 'proj-004', category: 'financial', title: 'Escalation Reserve Depleted', description: 'Escalation reserve fully consumed; further cost increases have no buffer.', probability: 3, impactCost: 4, impactSchedule: 1, impactSafety: 1, responseStrategy: 'accept', status: 'assessed', dueDate: null, origin: 'manual' },

  // ── proj-005 · Loyola Behavioral Health (AT RISK) ────────────────────────
  { id: 'r-005-1', projectId: 'proj-005', category: 'schedule', title: 'MEP Submittal Backlog', description: '23 overdue submittals concentrated in electrical and plumbing; blocking downstream procurement.', probability: 4, impactCost: 1, impactSchedule: 4, impactSafety: 1, responseStrategy: 'mitigate', status: 'assessed', dueDate: '2026-05-15', origin: 'promoted' },
  { id: 'r-005-2', projectId: 'proj-005', category: 'regulatory', title: 'TJC Accreditation Requirements', description: 'The Joint Commission requirements for behavioral health added late in design; 14 RFIs open.', probability: 3, impactCost: 2, impactSchedule: 3, impactSafety: 2, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-06-30', origin: 'manual' },
  { id: 'r-005-3', projectId: 'proj-005', category: 'financial', title: 'Specialty Equipment Cost Overrun', description: 'Behavioral health ligature-resistant hardware costs 22% above budgeted allowance.', probability: 4, impactCost: 3, impactSchedule: 1, impactSafety: 1, responseStrategy: 'accept', status: 'assessed', dueDate: null, origin: 'manual' },
  { id: 'r-005-4', projectId: 'proj-005', category: 'contractual', title: 'Roof Warranty Dispute', description: 'Roofing contractor claims design error voids manufacturer warranty; resolution pending.', probability: 2, impactCost: 2, impactSchedule: 1, impactSafety: 1, responseStrategy: 'transfer', status: 'identified', dueDate: '2026-07-01', origin: 'manual' },
  { id: 'r-005-5', projectId: 'proj-005', category: 'schedule', title: 'Schedule Float Consumed', description: 'Critical path float reduced to 0 days; any further delay directly impacts completion date.', probability: 4, impactCost: 2, impactSchedule: 5, impactSafety: 1, responseStrategy: 'mitigate', status: 'assessed', dueDate: '2026-05-01', origin: 'promoted' },

  // ── proj-006 · Chandler Regional (ON TRACK) ──────────────────────────────
  { id: 'r-006-1', projectId: 'proj-006', category: 'schedule', title: 'Long-Lead Equipment Procurement', description: 'MRI and CT equipment on order; delivery window aligned with construction schedule.', probability: 2, impactCost: 1, impactSchedule: 3, impactSafety: 1, responseStrategy: 'mitigate', status: 'mitigated', dueDate: null, origin: 'manual' },
  { id: 'r-006-2', projectId: 'proj-006', category: 'regulatory', title: 'OSHPD Review Duration', description: 'California OSHPD review expected to add 4–6 months before permit issuance.', probability: 2, impactCost: 1, impactSchedule: 3, impactSafety: 1, responseStrategy: 'accept', status: 'assessed', dueDate: '2026-09-01', origin: 'manual' },
  { id: 'r-006-3', projectId: 'proj-006', category: 'financial', title: 'Inflationary Escalation', description: 'Escalation exposure of $3.2M anticipated in the out years based on published indices.', probability: 2, impactCost: 2, impactSchedule: 1, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2027-01-01', origin: 'manual' },

  // ── proj-007 · St. Francis Hospital ED (ON TRACK) ────────────────────────
  { id: 'r-007-1', projectId: 'proj-007', category: 'contractual', title: 'Punch List Age', description: '42 punch list items open; 11 items over 30 days old with no action.', probability: 2, impactCost: 1, impactSchedule: 2, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-05-01', origin: 'manual' },
  { id: 'r-007-2', projectId: 'proj-007', category: 'financial', title: 'Retainage Release Dispute', description: 'GC requesting early retainage release; owner has contractual right to hold until final completion.', probability: 2, impactCost: 1, impactSchedule: 1, impactSafety: 1, responseStrategy: 'accept', status: 'identified', dueDate: null, origin: 'manual' },

  // ── proj-008 · Trinity Columbus (ON TRACK) ───────────────────────────────
  { id: 'r-008-1', projectId: 'proj-008', category: 'financial', title: 'Bid Market Competition', description: 'Strong bid market expected to produce favorable pricing in upcoming GMP negotiation.', probability: 1, impactCost: 2, impactSchedule: 1, impactSafety: 1, responseStrategy: 'accept', status: 'identified', dueDate: '2026-06-01', origin: 'manual' },

  // ── proj-009 · St. Vincent's Surgical Center (ON TRACK) ──────────────────
  { id: 'r-009-1', projectId: 'proj-009', category: 'schedule', title: 'Robotic Suite Commissioning', description: 'Da Vinci robotic surgery system commissioning requires 3-week exclusive access period.', probability: 2, impactCost: 1, impactSchedule: 2, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2025-10-01', origin: 'manual' },
  { id: 'r-009-2', projectId: 'proj-009', category: 'regulatory', title: 'Sterile Field Inspection', description: 'Sterile processing department requires specialized inspection before occupancy approval.', probability: 2, impactCost: 1, impactSchedule: 2, impactSafety: 2, responseStrategy: 'mitigate', status: 'identified', dueDate: '2025-11-01', origin: 'manual' },
  { id: 'r-009-3', projectId: 'proj-009', category: 'contractual', title: 'Overdue RFI Backlog', description: '5 RFIs aging past 14 days awaiting owner response; two with schedule impact noted.', probability: 2, impactCost: 1, impactSchedule: 2, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-05-01', origin: 'promoted' },

  // ── proj-010 · Marian Outpatient Clinic (HEALTHY) ────────────────────────
  { id: 'r-010-1', projectId: 'proj-010', category: 'regulatory', title: 'Coastal Development Permit', description: 'California Coastal Commission permit under review; no issues anticipated based on preliminary feedback.', probability: 1, impactCost: 1, impactSchedule: 2, impactSafety: 1, responseStrategy: 'accept', status: 'identified', dueDate: '2026-07-01', origin: 'manual' },

  // ── proj-011 · Mercy Research Institute (HEALTHY → FORECAST AT RISK) ─────
  // This project is currently healthy but carries HIGH-PROBABILITY risks that haven't materialized.
  // It is the most important demo state in the prototype.
  { id: 'r-011-1', projectId: 'proj-011', category: 'financial', title: 'Federal Grant Award Uncertainty', description: 'NIH grant decision ($48M) expected in Q3 2026; if denied, project cannot proceed to GMP.', probability: 5, impactCost: 5, impactSchedule: 5, impactSafety: 1, responseStrategy: 'accept', status: 'identified', dueDate: '2026-09-30', origin: 'manual' },
  { id: 'r-011-2', projectId: 'proj-011', category: 'schedule', title: 'Market Escalation Window', description: 'Construction market escalation of 7–9% per year projected; every 6-month delay adds ~$12M.', probability: 4, impactCost: 5, impactSchedule: 3, impactSafety: 1, responseStrategy: 'mitigate', status: 'assessed', dueDate: '2026-12-31', origin: 'manual' },
  { id: 'r-011-3', projectId: 'proj-011', category: 'regulatory', title: 'Environmental Review (NEPA)', description: 'NEPA environmental assessment required for federal funding; process takes 12–18 months.', probability: 4, impactCost: 2, impactSchedule: 5, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-06-30', origin: 'manual' },
  { id: 'r-011-4', projectId: 'proj-011', category: 'financial', title: 'Board Approval Contingency', description: 'Trinity Health board final capital authorization pending at September board meeting.', probability: 3, impactCost: 5, impactSchedule: 4, impactSafety: 1, responseStrategy: 'accept', status: 'identified', dueDate: '2026-09-15', origin: 'manual' },
  { id: 'r-011-5', projectId: 'proj-011', category: 'contractual', title: 'Academic Partner MOU', description: 'Research partnership MOU with University of Pennsylvania not yet executed; scope TBD.', probability: 3, impactCost: 2, impactSchedule: 3, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-06-01', origin: 'manual' },

  // ── proj-012 · St. Joseph Parking (DEGRADED / PARTIAL) ───────────────────
  // Intentional data gaps — no health signal fields populated in seed
  { id: 'r-012-1', projectId: 'proj-012', category: 'financial', title: 'Budget Reallocation Impact', description: 'Project placed on hold due to $14M budget reallocation to tower expansion.', probability: 3, impactCost: 3, impactSchedule: 4, impactSafety: 1, responseStrategy: 'accept', status: 'assessed', dueDate: null, origin: 'manual' },

  // ── proj-013 · Trinity Baton Rouge (AT RISK) ─────────────────────────────
  { id: 'r-013-1', projectId: 'proj-013', category: 'regulatory', title: 'Zoning Variance Pending', description: 'Zoning variance for height and setback submitted in Q4 2024; decision delayed pending EIR.', probability: 4, impactCost: 2, impactSchedule: 5, impactSafety: 1, responseStrategy: 'mitigate', status: 'assessed', dueDate: '2026-06-30', origin: 'manual' },
  { id: 'r-013-2', projectId: 'proj-013', category: 'financial', title: 'Escalation During Hold', description: 'Each month on hold adds ~$180K in projected escalation against a fixed budget.', probability: 4, impactCost: 3, impactSchedule: 1, impactSafety: 1, responseStrategy: 'accept', status: 'assessed', dueDate: null, origin: 'manual' },
  { id: 'r-013-3', projectId: 'proj-013', category: 'contractual', title: 'Design Team Continuity Risk', description: 'Lead architect may not be available if project resumes after 12-month hold.', probability: 3, impactCost: 1, impactSchedule: 3, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-08-01', origin: 'manual' },

  // ── proj-014 · Sequoia Imaging (DEGRADED / PARTIAL) ──────────────────────
  { id: 'r-014-1', projectId: 'proj-014', category: 'financial', title: 'Equipment Procurement Uncertainty', description: 'MRI machine lead times extended to 18–24 months; project cannot complete without delivery.', probability: 4, impactCost: 2, impactSchedule: 5, impactSafety: 1, responseStrategy: 'mitigate', status: 'assessed', dueDate: '2026-09-01', origin: 'manual' },

  // ── proj-015 · Holy Redeemer Cafeteria (ON TRACK / INACTIVE) ─────────────
  { id: 'r-015-1', projectId: 'proj-015', category: 'contractual', title: 'Final Punch List Resolution', description: 'GC has 14 punch list items outstanding; commissioning sign-off blocked until cleared.', probability: 2, impactCost: 1, impactSchedule: 1, impactSafety: 1, responseStrategy: 'mitigate', status: 'mitigated', dueDate: null, origin: 'manual' },

  // ── proj-016 · St. Elizabeth HVAC (HEALTHY / INACTIVE) ───────────────────
  { id: 'r-016-1', projectId: 'proj-016', category: 'financial', title: 'Warranty Claims', description: 'One HVAC unit warranty claim filed for vibration; vendor responding within SLA.', probability: 1, impactCost: 1, impactSchedule: 1, impactSafety: 1, responseStrategy: 'transfer', status: 'closed', dueDate: null, origin: 'manual' },

  // ── proj-017 · Our Lady MOB (ON TRACK / INACTIVE) ────────────────────────
  { id: 'r-017-1', projectId: 'proj-017', category: 'contractual', title: 'Tenant Fit-Out Punch Items', description: 'Three tenant suites have open punch items; physician practices have moved in pending resolution.', probability: 2, impactCost: 1, impactSchedule: 1, impactSafety: 1, responseStrategy: 'mitigate', status: 'mitigated', dueDate: null, origin: 'manual' },

  // ── proj-018 · Dominican Chapel (ON TRACK / INACTIVE) ────────────────────
  { id: 'r-018-1', projectId: 'proj-018', category: 'financial', title: 'Stained Glass Restoration Overrun', description: 'Specialty stained glass restoration exceeded estimate by $85K due to additional damaged panels found.', probability: 1, impactCost: 2, impactSchedule: 1, impactSafety: 1, responseStrategy: 'accept', status: 'closed', dueDate: null, origin: 'manual' },
];

/** Look up risks for a specific project. */
export function getRisksForProject(projectId: string): Risk[] {
  return risks.filter((r) => r.projectId === projectId);
}
