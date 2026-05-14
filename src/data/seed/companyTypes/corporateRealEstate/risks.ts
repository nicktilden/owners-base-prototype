import type { Risk } from '@/types/health';

export const risks: Risk[] = [

  // ── proj-001 · Bellevue Building 3 (under construction, differing site conditions) ──
  { id: 'r-001-1', projectId: 'proj-001', category: 'financial', title: 'Differing Site Conditions CO Dispute', description: 'Skanska submitted a $4.2M differing site conditions change order for underground obstructions not shown on geotechnical drawings.', probability: 4, impactCost: 4, impactSchedule: 2, impactSafety: 1, responseStrategy: 'transfer', status: 'assessed', dueDate: '2026-05-30', origin: 'manual' },
  { id: 'r-001-2', projectId: 'proj-001', category: 'schedule', title: 'Curtain Wall Delivery Lead Time', description: 'Unitized curtain wall fabricator has flagged a 6-week delay due to glass supply constraints; threatens enclosure milestone.', probability: 4, impactCost: 2, impactSchedule: 4, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-06-15', origin: 'automated' },
  { id: 'r-001-3', projectId: 'proj-001', category: 'financial', title: 'FF&E Cost Escalation', description: 'FF&E vendor repriced floors 4–8 package 11% above contract due to global supply chain tariffs on imported office furniture.', probability: 3, impactCost: 3, impactSchedule: 1, impactSafety: 1, responseStrategy: 'mitigate', status: 'assessed', dueDate: '2026-06-01', origin: 'manual' },
  { id: 'r-001-4', projectId: 'proj-001', category: 'contractual', title: 'GC Subcontractor Default Risk', description: 'MEP subcontractor has exhibited signs of financial distress; payment bond rider under review.', probability: 3, impactCost: 3, impactSchedule: 3, impactSafety: 1, responseStrategy: 'mitigate', status: 'assessed', dueDate: '2026-05-15', origin: 'manual' },

  // ── proj-002 · Seattle TI Westlake (TI under permit) ────────────────────────
  { id: 'r-002-1', projectId: 'proj-002', category: 'regulatory', title: 'Landlord Consent Delay', description: 'Landlord is requiring additional structural review before issuing consent; may delay permit submission by 3 weeks.', probability: 4, impactCost: 2, impactSchedule: 3, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-05-20', origin: 'automated' },
  { id: 'r-002-2', projectId: 'proj-002', category: 'financial', title: 'TI Allowance Overage Risk', description: 'Updated CD pricing from GC shows TI construction costs are 8% above the landlord TI allowance.', probability: 4, impactCost: 3, impactSchedule: 1, impactSafety: 1, responseStrategy: 'mitigate', status: 'assessed', dueDate: '2026-05-30', origin: 'manual' },

  // ── proj-003 · Reno Ops Center (ground-up, permit delays) ───────────────────
  { id: 'r-003-1', projectId: 'proj-003', category: 'regulatory', title: 'City of Reno Permit Delay', description: 'Building permit under City of Reno review is 3 weeks behind schedule due to plan check backlog.', probability: 4, impactCost: 1, impactSchedule: 3, impactSafety: 1, responseStrategy: 'accept', status: 'identified', dueDate: '2026-05-31', origin: 'automated' },
  { id: 'r-003-2', projectId: 'proj-003', category: 'financial', title: 'Steel Framing Cost Variance', description: 'Structural steel pricing came in 9% over budget due to tariff increases on imported wide-flange shapes.', probability: 3, impactCost: 3, impactSchedule: 1, impactSafety: 1, responseStrategy: 'mitigate', status: 'assessed', dueDate: '2026-06-15', origin: 'manual' },

  // ── proj-004 · Campus Childcare Hub (contingency exhausted — critical) ───────
  { id: 'r-004-1', projectId: 'proj-004', category: 'financial', title: 'Contingency Exhausted — Budget Overrun', description: 'All $2.56M construction contingency has been consumed by approved change orders; project requires additional owner funding authorization.', probability: 5, impactCost: 5, impactSchedule: 2, impactSafety: 1, responseStrategy: 'mitigate', status: 'assessed', dueDate: '2026-06-01', origin: 'manual' },
  { id: 'r-004-2', projectId: 'proj-004', category: 'regulatory', title: 'WA DCYF Childcare Licensing Requirement Changes', description: 'DCYF issued new indoor air quality and egress requirements that may require CDs revision and permit resubmittal.', probability: 4, impactCost: 3, impactSchedule: 4, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-05-25', origin: 'manual' },
  { id: 'r-004-3', projectId: 'proj-004', category: 'schedule', title: 'Childcare Equipment Lead Times', description: 'Custom playground and commercial kitchen equipment have 16-week lead times that were underestimated in the original schedule.', probability: 3, impactCost: 1, impactSchedule: 3, impactSafety: 1, responseStrategy: 'mitigate', status: 'assessed', dueDate: '2026-06-30', origin: 'automated' },

  // ── proj-005 · Portland TI Pearl (closed/healthy) ────────────────────────────
  { id: 'r-005-1', projectId: 'proj-005', category: 'contractual', title: 'GC Warranty Claim — HVAC Deficiency', description: 'Post-occupancy HVAC underperformance identified in server room; warranty claim filed with GC.', probability: 2, impactCost: 2, impactSchedule: 1, impactSafety: 1, responseStrategy: 'transfer', status: 'assessed', dueDate: '2026-04-30', origin: 'manual' },

  // ── proj-006 · SF R&D Lab (pre-construction, hazmat / permits) ───────────────
  { id: 'r-006-1', projectId: 'proj-006', category: 'regulatory', title: 'BAAQMD Hazardous Material Permit', description: 'Bay Area Air Quality Management District requires additional permit review for chemical storage above threshold quantities.', probability: 4, impactCost: 2, impactSchedule: 4, impactSafety: 2, responseStrategy: 'mitigate', status: 'assessed', dueDate: '2026-06-30', origin: 'manual' },
  { id: 'r-006-2', projectId: 'proj-006', category: 'schedule', title: 'Asbestos Abatement Scope Expansion', description: 'Phase II environmental assessment found additional asbestos-containing materials not identified in Phase I; abatement scope may expand by 4 weeks.', probability: 4, impactCost: 3, impactSchedule: 4, impactSafety: 3, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-05-10', origin: 'automated' },

  // ── proj-007 · Austin TI Domain (construction in progress) ──────────────────
  { id: 'r-007-1', projectId: 'proj-007', category: 'schedule', title: 'Move Management Date Slip', description: 'IT infrastructure cutover planning is behind schedule; move-in date may slip by 2 weeks affecting lease commencement.', probability: 3, impactCost: 2, impactSchedule: 3, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-05-30', origin: 'automated' },
  { id: 'r-007-2', projectId: 'proj-007', category: 'financial', title: 'AV/IT Scope Increase', description: 'Corporate IT team expanded AV requirements post-CD completion; additional scope adds $180K above contract value.', probability: 4, impactCost: 2, impactSchedule: 1, impactSafety: 1, responseStrategy: 'accept', status: 'assessed', dueDate: '2026-05-20', origin: 'manual' },

  // ── proj-008 · Bellevue MF Housing (pre-construction, entitlement) ───────────
  { id: 'r-008-1', projectId: 'proj-008', category: 'regulatory', title: 'Density Bonus Affordable Housing Covenant Dispute', description: 'City of Bellevue is requiring more restrictive affordability covenant language than anticipated; legal review ongoing.', probability: 4, impactCost: 2, impactSchedule: 4, impactSafety: 1, responseStrategy: 'mitigate', status: 'assessed', dueDate: '2026-10-31', origin: 'manual' },
  { id: 'r-008-2', projectId: 'proj-008', category: 'financial', title: 'Construction Cost Escalation Forecast', description: 'Current market study projects 7–9% construction cost escalation between DD estimate and anticipated GMP in 2027.', probability: 4, impactCost: 4, impactSchedule: 1, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-11-30', origin: 'automated' },

  // ── proj-009 · Denver LoDo TI (LEED Platinum closeout) ──────────────────────
  { id: 'r-009-1', projectId: 'proj-009', category: 'regulatory', title: 'LEED Credit Review Failure Risk', description: 'Two EAc credits may not achieve required documentation quality; USGBC review could result in Silver rather than Platinum certification.', probability: 3, impactCost: 1, impactSchedule: 2, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-07-15', origin: 'manual' },

  // ── proj-010 · NYC Hudson Yards (KEY DEMO healthy→at-risk) ──────────────────
  { id: 'r-010-1', projectId: 'proj-010', category: 'financial', title: 'Custom Millwork Delivery Delay', description: 'Custom millwork fabricator reported a 4-week production delay; threatens move-in date and impacts lease commencement penalties.', probability: 4, impactCost: 3, impactSchedule: 4, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-05-25', origin: 'automated' },
  { id: 'r-010-2', projectId: 'proj-010', category: 'regulatory', title: 'NYC DOB Inspection Backlog', description: 'NYC Department of Buildings inspection scheduling backlog could delay Certificate of Occupancy by 3–5 weeks.', probability: 4, impactCost: 2, impactSchedule: 4, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-06-15', origin: 'manual' },
  { id: 'r-010-3', projectId: 'proj-010', category: 'financial', title: 'Premium FF&E Cost Overrun', description: 'Knoll furniture package final invoice is 12% over budget due to executive specification upgrades approved post-procurement.', probability: 5, impactCost: 3, impactSchedule: 1, impactSafety: 1, responseStrategy: 'accept', status: 'assessed', dueDate: '2026-06-01', origin: 'manual' },
];

export function getRisksForProject(projectId: string): Risk[] {
  return risks.filter((r) => r.projectId === projectId);
}
