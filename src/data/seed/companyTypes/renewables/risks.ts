import type { Risk } from '@/types/health';

export const risks: Risk[] = [

  // ── proj-001 · Rutherford County Phase 1 (construction active, budget pressure) ──
  { id: 'r-001-1', projectId: 'proj-001', category: 'financial', title: 'Module Price Escalation', description: 'TOPCon module pricing increased 8% above contracted rate due to anti-dumping duties; EPC seeking change order.', probability: 4, impactCost: 4, impactSchedule: 2, impactSafety: 1, responseStrategy: 'mitigate', status: 'assessed', dueDate: '2026-05-15', origin: 'manual' },
  { id: 'r-001-2', projectId: 'proj-001', category: 'schedule', title: 'TVA Substation Delay', description: 'TVA has pushed back the 161 kV energization date by 6 weeks due to transformer delivery lead time.', probability: 5, impactCost: 3, impactSchedule: 5, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-05-30', origin: 'automated' },
  { id: 'r-001-3', projectId: 'proj-001', category: 'contractual', title: 'EPC Change Order Dispute', description: 'Mortenson has submitted a $6.1M contested CO for differing site conditions in Zone 4.', probability: 4, impactCost: 4, impactSchedule: 2, impactSafety: 1, responseStrategy: 'transfer', status: 'assessed', dueDate: '2026-06-01', origin: 'manual' },
  { id: 'r-001-4', projectId: 'proj-001', category: 'regulatory', title: 'ITC Safe Harbor Documentation Gap', description: 'Continuous construction log has a 3-week documentation gap that could jeopardize ITC safe harbor status.', probability: 3, impactCost: 5, impactSchedule: 1, impactSafety: 1, responseStrategy: 'mitigate', status: 'assessed', dueDate: '2026-04-30', origin: 'manual' },

  // ── proj-002 · Sunflower Flats BESS (ERCOT qualification pending) ────────────
  { id: 'r-002-1', projectId: 'proj-002', category: 'regulatory', title: 'ERCOT Market Qualification Delay', description: 'Real-Time Market qualification test rescheduled 45 days by ERCOT; threatens COD ancillary services revenue.', probability: 4, impactCost: 3, impactSchedule: 4, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-03-31', origin: 'automated' },
  { id: 'r-002-2', projectId: 'proj-002', category: 'financial', title: 'Battery Module Cost Overrun', description: 'LFP battery module pricing exceeded budgeted rate by 6% due to lithium carbonate spot price spike.', probability: 3, impactCost: 3, impactSchedule: 1, impactSafety: 1, responseStrategy: 'accept', status: 'assessed', dueDate: '2026-04-15', origin: 'manual' },

  // ── proj-003 · Marshall County Solar (agrivoltaics delays) ───────────────────
  { id: 'r-003-1', projectId: 'proj-003', category: 'schedule', title: 'Agrivoltaics Research Delay Impact', description: 'MSU research team access requirements are slowing Zone 3 tracker installation by an estimated 3 weeks.', probability: 3, impactCost: 2, impactSchedule: 3, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-05-20', origin: 'manual' },
  { id: 'r-003-2', projectId: 'proj-003', category: 'financial', title: 'Entergy Interconnection Cost Increase', description: 'Entergy Mississippi issued a revised cost estimate for relay protection upgrades, adding $1.8M to interconnection budget.', probability: 4, impactCost: 3, impactSchedule: 2, impactSafety: 1, responseStrategy: 'mitigate', status: 'assessed', dueDate: '2026-06-01', origin: 'automated' },

  // ── proj-004 · Logan County Solar + Storage (tax equity closing) ─────────────
  { id: 'r-004-1', projectId: 'proj-004', category: 'financial', title: 'Tax Equity Closing Risk', description: 'JP Morgan partnership agreement negotiation has stalled on flip rate mechanics; COD delay could trigger step-down.', probability: 4, impactCost: 5, impactSchedule: 3, impactSafety: 1, responseStrategy: 'mitigate', status: 'assessed', dueDate: '2026-09-30', origin: 'manual' },
  { id: 'r-004-2', projectId: 'proj-004', category: 'regulatory', title: 'PTC/ITC Election Deadline', description: 'Form 3468 PTC election must be filed before COD; project schedule slip creates risk of missing filing window.', probability: 3, impactCost: 5, impactSchedule: 1, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-12-01', origin: 'manual' },

  // ── proj-005 · Pratt County 300 MW (operational, healthy) ───────────────────
  { id: 'r-005-1', projectId: 'proj-005', category: 'safety', title: 'Zone 5 Trenching Hazard', description: 'Electrical BOP trench in Zone 5 is adjacent to active irrigation lines; unmarked utility crossings identified.', probability: 3, impactCost: 2, impactSchedule: 2, impactSafety: 4, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-05-10', origin: 'automated' },
  { id: 'r-005-2', projectId: 'proj-005', category: 'financial', title: 'SCADA Integration Cost Variance', description: 'GE Digital expanded scope for DERMS integration added $220K above original SCADA contract value.', probability: 2, impactCost: 2, impactSchedule: 1, impactSafety: 1, responseStrategy: 'accept', status: 'assessed', dueDate: '2026-04-30', origin: 'manual' },

  // ── proj-006 · Luna County Solar (permitting / BLM pre-construction) ─────────
  { id: 'r-006-1', projectId: 'proj-006', category: 'regulatory', title: 'BLM Right-of-Way Denial Risk', description: 'BLM has requested supplemental information on the gen-tie ROW; 90-day response period extends into critical path.', probability: 4, impactCost: 3, impactSchedule: 5, impactSafety: 1, responseStrategy: 'mitigate', status: 'assessed', dueDate: '2026-08-01', origin: 'manual' },
  { id: 'r-006-2', projectId: 'proj-006', category: 'schedule', title: 'NEPA EA Timeline Extension', description: 'BLM environmental assessment comment period may extend timeline by 4–6 months beyond current schedule.', probability: 4, impactCost: 2, impactSchedule: 5, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-06-30', origin: 'automated' },

  // ── proj-007 · Dodge County Solar (COD commissioning) ───────────────────────
  { id: 'r-007-1', projectId: 'proj-007', category: 'schedule', title: 'Inverter Commissioning Delay', description: '7 of 68 inverters have failed factory acceptance tests and require replacement; delivery lead time is 8 weeks.', probability: 4, impactCost: 2, impactSchedule: 4, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-05-30', origin: 'automated' },
  { id: 'r-007-2', projectId: 'proj-007', category: 'regulatory', title: 'Georgia Power DERMS Acceptance', description: 'Georgia Power DERMS integration acceptance testing has undocumented requirements; risk of additional test cycles.', probability: 3, impactCost: 2, impactSchedule: 3, impactSafety: 1, responseStrategy: 'mitigate', status: 'assessed', dueDate: '2026-06-15', origin: 'manual' },

  // ── proj-008 · Poinsett County Transmission (ROW pending) ───────────────────
  { id: 'r-008-1', projectId: 'proj-008', category: 'contractual', title: 'ROW Easement Condemnation Risk', description: '4 landowners are contesting easement valuation; eminent domain proceedings could delay construction start by 5 months.', probability: 4, impactCost: 3, impactSchedule: 5, impactSafety: 1, responseStrategy: 'mitigate', status: 'assessed', dueDate: '2026-07-01', origin: 'manual' },
  { id: 'r-008-2', projectId: 'proj-008', category: 'financial', title: 'Line Contractor Bid Escalation', description: 'All 3 line contractor bids came in 18% above engineer\'s estimate due to crew availability and fuel costs.', probability: 5, impactCost: 4, impactSchedule: 1, impactSafety: 1, responseStrategy: 'accept', status: 'assessed', dueDate: '2026-05-25', origin: 'manual' },

  // ── proj-009 · Limestone County Phase 2 (construction) ──────────────────────
  { id: 'r-009-1', projectId: 'proj-009', category: 'schedule', title: 'Shared Substation Capacity Constraint', description: 'Phase 1 substation is near capacity during peak summer generation; Phase 2 energization may require curtailment agreements.', probability: 3, impactCost: 2, impactSchedule: 3, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-06-01', origin: 'automated' },

  // ── proj-010 · Grady County BESS (pre-construction, KEY DEMO healthy→at-risk) ─
  { id: 'r-010-1', projectId: 'proj-010', category: 'regulatory', title: 'SPP Interconnection Queue Position Risk', description: 'Two higher-queue-priority projects have filed for the same 115 kV substation bus; capacity study results pending.', probability: 4, impactCost: 3, impactSchedule: 5, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-09-01', origin: 'manual' },
  { id: 'r-010-2', projectId: 'proj-010', category: 'financial', title: 'Battery Module Supply Allocation', description: 'CATL has not confirmed production slot allocation for 200 MWh order; competing orders from European projects may reduce priority.', probability: 4, impactCost: 4, impactSchedule: 4, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-08-01', origin: 'automated' },
  { id: 'r-010-3', projectId: 'proj-010', category: 'schedule', title: 'SPP EMS Interface Certification', description: 'SPP ICCP/SCADA certification process requires 6-month lead time and has not been initiated; threatens revenue date.', probability: 5, impactCost: 3, impactSchedule: 5, impactSafety: 1, responseStrategy: 'mitigate', status: 'identified', dueDate: '2026-07-01', origin: 'manual' },
];

export function getRisksForProject(projectId: string): Risk[] {
  return risks.filter((r) => r.projectId === projectId);
}
