import type { Risk } from '@/types/health';

export const risks: Risk[] = [

  // ── proj-001 · Terminal 1 Modernization (budget pressure, SW coordination) ──
  { id: 'r-001-1', projectId: 'proj-001', category: 'financial', title: 'Steel Fabrication Cost Escalation', description: 'Structural steel fabrication costs exceeded contracted rate by 12% due to mill lead time constraints and tariff exposure.', probability: 4, impactCost: 4, impactSchedule: 2, impactSafety: 1, responseStrategy: 'mitigate', status: 'assessed', dueDate: '2026-05-30', origin: 'manual' },
  { id: 'r-001-2', projectId: 'proj-001', category: 'schedule', title: 'Southwest Airlines Operational Coordination Delay', description: 'SW Airlines operations team has not finalized gate handover sequence; risk of construction coordination conflicts during phased openings.', probability: 3, impactCost: 2, impactSchedule: 4, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-06-15', origin: 'automated' },
  { id: 'r-001-3', projectId: 'proj-001', category: 'contractual', title: 'Turner Change Order Dispute — Zone 4 MEP Conflicts', description: 'Turner has submitted a $4.8M contested CO for MEP coordination conflicts on floors 2–3 requiring redesign.', probability: 4, impactCost: 4, impactSchedule: 3, impactSafety: 1, responseStrategy: 'mitigate', status: 'assessed', dueDate: '2026-07-01', origin: 'manual' },

  // ── proj-002 · Runway 24L/6R (Phase 2 schedule tight) ───────────────────
  { id: 'r-002-1', projectId: 'proj-002', category: 'schedule', title: 'Nighttime Closure Window Reduction', description: 'Airline complaints have led to pressure to reduce nighttime closure windows from 6 to 4 hours, threatening Phase 2 paving schedule.', probability: 4, impactCost: 2, impactSchedule: 4, impactSafety: 1, responseStrategy: 'mitigate', status: 'assessed', dueDate: '2026-05-25', origin: 'manual' },
  { id: 'r-002-2', projectId: 'proj-002', category: 'regulatory', title: 'FAA ILS Flight Check Scheduling Delay', description: 'FAA flight check team has limited availability in Q4 2026; delay in commissioning could push runway return to service past contractor deadline.', probability: 3, impactCost: 1, impactSchedule: 3, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-09-15', origin: 'manual' },

  // ── proj-003 · Parking Structure P3 (healthy, on track) ─────────────────
  { id: 'r-003-1', projectId: 'proj-003', category: 'financial', title: 'LADWP EV Service Upgrade Cost', description: 'LADWP service upgrade estimate for EV charging load came in $1.2M above design estimate; utility contribution agreement needed.', probability: 3, impactCost: 2, impactSchedule: 1, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-07-01', origin: 'automated' },

  // ── proj-004 · TBIT Gates 147–152 (critical — over budget) ──────────────
  { id: 'r-004-1', projectId: 'proj-004', category: 'financial', title: 'Foundation Change Order — Unforeseen Conditions', description: 'Hensel Phelps has submitted a $28M CO for differing foundation conditions; geotechnical assessment disputes ongoing.', probability: 5, impactCost: 5, impactSchedule: 3, impactSafety: 1, responseStrategy: 'transfer', status: 'assessed', dueDate: '2026-06-01', origin: 'manual' },
  { id: 'r-004-2', projectId: 'proj-004', category: 'schedule', title: 'Wide-Body Bridge Delivery Lead Time', description: 'Manufacturer has extended wide-body boarding bridge delivery lead time to 22 months, threatening installation schedule.', probability: 4, impactCost: 2, impactSchedule: 5, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-08-01', origin: 'automated' },
  { id: 'r-004-3', projectId: 'proj-004', category: 'regulatory', title: 'CBP FIS Approval Delay', description: 'CBP design review process has extended 90 days beyond original timeline; concurrent construction decisions may require rework.', probability: 4, impactCost: 3, impactSchedule: 4, impactSafety: 1, responseStrategy: 'mitigate', status: 'assessed', dueDate: '2026-09-30', origin: 'manual' },

  // ── proj-005 · T5/T6 Security Checkpoint (schedule risk) ────────────────
  { id: 'r-005-1', projectId: 'proj-005', category: 'schedule', title: 'TSA CT Scanner Delivery Delay', description: 'TSA reports a 3-month supply chain delay on CT baggage scanners from the primary manufacturer.', probability: 4, impactCost: 1, impactSchedule: 4, impactSafety: 1, responseStrategy: 'mitigate', status: 'assessed', dueDate: '2026-06-30', origin: 'automated' },
  { id: 'r-005-2', projectId: 'proj-005', category: 'safety', title: 'Airside Security Perimeter During Construction', description: 'Temporary construction access near the secure side of T5 checkpoint requires TSA security plan review and approval.', probability: 3, impactCost: 1, impactSchedule: 2, impactSafety: 4, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-05-30', origin: 'manual' },

  // ── proj-006 · Airfield Lighting (pre-construction) ──────────────────────
  { id: 'r-006-1', projectId: 'proj-006', category: 'regulatory', title: 'FAA AIP Grant Funding Availability', description: 'FAA FY2026 AIP funding is oversubscribed nationally; LAWA\' application may not receive full funding in first cycle.', probability: 3, impactCost: 4, impactSchedule: 3, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-09-30', origin: 'manual' },

  // ── proj-007 · Economy Lot C (healthy) ───────────────────────────────────
  { id: 'r-007-1', projectId: 'proj-007', category: 'schedule', title: 'Solar Panel Procurement Lead Time', description: 'PV module supplier has extended lead time to 14 weeks due to port congestion; May push Section 2 solar installation into 2027.', probability: 3, impactCost: 1, impactSchedule: 3, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-08-01', origin: 'automated' },

  // ── proj-008 · Airport Metro Connector (schedule & budget risk) ──────────
  { id: 'r-008-1', projectId: 'proj-008', category: 'financial', title: 'Guideway Survey Deviation — Realignment Cost', description: 'Survey revealed 3-inch guideway misalignment requiring segment realignment; contractor dispute on responsibility in progress.', probability: 4, impactCost: 3, impactSchedule: 3, impactSafety: 1, responseStrategy: 'mitigate', status: 'assessed', dueDate: '2026-06-30', origin: 'manual' },
  { id: 'r-008-2', projectId: 'proj-008', category: 'regulatory', title: 'FTA Buy America Compliance — APM Vehicles', description: 'Bombardier has not confirmed meeting 70% domestic content threshold; compliance documentation outstanding.', probability: 3, impactCost: 2, impactSchedule: 2, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-09-30', origin: 'manual' },

  // ── proj-009 · Taxiway B & D (construction on track) ────────────────────
  { id: 'r-009-1', projectId: 'proj-009', category: 'schedule', title: 'Night Closure Window Conflicts — Adjacent Operations', description: 'Concurrent runway and taxiway closure windows are creating airfield capacity constraints during peak departure banks.', probability: 3, impactCost: 1, impactSchedule: 3, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-06-01', origin: 'automated' },

  // ── proj-010 · CONRAC (pre-construction, KEY DEMO healthy→at-risk) ───────
  { id: 'r-010-1', projectId: 'proj-010', category: 'regulatory', title: 'CEQA Litigation Risk', description: 'Environmental advocacy group has filed notice of intent to challenge CEQA findings; litigation could delay construction start by 12–18 months.', probability: 4, impactCost: 3, impactSchedule: 5, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-12-31', origin: 'manual' },
  { id: 'r-010-2', projectId: 'proj-010', category: 'financial', title: 'Rental Car Company Financing Withdrawal', description: 'Two CONRAC anchor tenants have indicated they may withdraw from cost-sharing agreement if project schedule slips beyond 2030.', probability: 4, impactCost: 5, impactSchedule: 4, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-10-01', origin: 'manual' },
  { id: 'r-010-3', projectId: 'proj-010', category: 'schedule', title: 'Design-Build Procurement Timeline', description: 'City procurement process for a project of this size requires additional approval steps; DB contractor award may push NTP past 2027.', probability: 3, impactCost: 1, impactSchedule: 4, impactSafety: 1, responseStrategy: 'accept', status: 'identified', dueDate: '2027-03-01', origin: 'manual' },
];

export function getRisksForProject(projectId: string): Risk[] {
  return risks.filter((r) => r.projectId === projectId);
}
