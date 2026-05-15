import type { RiskTypeRule } from '@/types/health';

export const riskTypeRules: RiskTypeRule[] = [
  // ── Financial Risk (rt-001) ────────────────────────────────────────────────
  {
    id: 'rtr-001',
    riskTypeId: 'rt-001',
    sourceType: 'change_event',
    filter: { field: 'costImpact', operator: 'gt', value: 100000 },
    defaultProbability: 3,
    defaultImpact: 'inherit_from_source',
    autoCreate: true,
  },
  {
    id: 'rtr-002',
    riskTypeId: 'rt-001',
    sourceType: 'rfi',
    filter: { field: 'costImpact', operator: 'gt', value: 50000 },
    defaultProbability: 2,
    defaultImpact: 'inherit_from_source',
    autoCreate: false,
  },
  {
    id: 'rtr-003',
    riskTypeId: 'rt-001',
    sourceType: 'budget_line',
    filter: { field: 'overrunPct', operator: 'gte', value: 10 },
    defaultProbability: 4,
    defaultImpact: 'inherit_from_source',
    autoCreate: false,
  },

  // ── Schedule Risk (rt-002) ─────────────────────────────────────────────────
  {
    id: 'rtr-004',
    riskTypeId: 'rt-002',
    sourceType: 'rfi',
    filter: { field: 'scheduleImpact', operator: 'gt', value: 14 },
    defaultProbability: 3,
    defaultImpact: 'inherit_from_source',
    autoCreate: false,
  },
  {
    id: 'rtr-005',
    riskTypeId: 'rt-002',
    sourceType: 'milestone',
    filter: { field: 'daysLate', operator: 'gte', value: 7 },
    defaultProbability: 3,
    defaultImpact: 25,
    autoCreate: true,
  },

  // ── Contractual Risk (rt-007) ──────────────────────────────────────────────
  {
    id: 'rtr-006',
    riskTypeId: 'rt-007',
    sourceType: 'rfi',
    filter: { field: 'agingDays', operator: 'gte', value: 30 },
    defaultProbability: 2,
    defaultImpact: 15,
    autoCreate: false,
  },
  {
    id: 'rtr-007',
    riskTypeId: 'rt-007',
    sourceType: 'submittal',
    filter: { field: 'agingDays', operator: 'gte', value: 21 },
    defaultProbability: 2,
    defaultImpact: 10,
    autoCreate: false,
  },

  // ── Supply Chain Risk (rt-009) ─────────────────────────────────────────────
  {
    id: 'rtr-008',
    riskTypeId: 'rt-009',
    sourceType: 'submittal',
    filter: { field: 'scheduleImpact', operator: 'gt', value: 21 },
    defaultProbability: 3,
    defaultImpact: 20,
    autoCreate: false,
  },
];
