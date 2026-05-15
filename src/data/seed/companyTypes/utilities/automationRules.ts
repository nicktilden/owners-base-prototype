/**
 * AUTOMATION RULES SEED DATA
 * Default rules per Risk Type. Covers tagging and workflow triggers.
 * These are the "out of the box" rules shown in Settings → Health & Risk → Automation Rules.
 */

import type { AutomationRule } from '@/types/automation';

export const automationRules: AutomationRule[] = [
  // ── Cost Risk: Change Event > $1M → tag + CFO approval ──────────────────────
  {
    id: 'ar-001',
    name: 'Large Change Event — auto-approval',
    status: 'active',
    sourceType: 'change_event',
    conditions: [
      { field: 'currentEstimate', operator: 'gt', value: 1000000 },
    ],
    taggingAction: {
      riskTypeId: 'rt-001',
      defaultProbability: 4,
      defaultImpact: 'inherit_from_source',
      behavior: 'auto_create',
    },
    workflowAction: {
      workflowId: 'wf-cost-risk-approval-v2',
      finalApproverRole: 'CFO',
      tagStateOnTrigger: 'pending_approval',
    },
    lastFiredAt: new Date('2026-04-30'),
    fireCount: 3,
    createdBy: 'user-001',
    createdAt: new Date('2025-10-01'),
  },

  // ── Cost Risk: Change Event > $250K → tag only ───────────────────────────────
  {
    id: 'ar-002',
    name: 'Significant Change Event — auto-tag',
    status: 'active',
    sourceType: 'change_event',
    conditions: [
      { field: 'currentEstimate', operator: 'gt', value: 250000 },
    ],
    taggingAction: {
      riskTypeId: 'rt-001',
      defaultProbability: 3,
      defaultImpact: 'inherit_from_source',
      behavior: 'auto_create',
    },
    lastFiredAt: new Date('2026-05-01'),
    fireCount: 11,
    createdBy: 'user-001',
    createdAt: new Date('2025-10-01'),
  },

  // ── Schedule Risk: Critical-path submittal aging > 14 days → tag ────────────
  {
    id: 'ar-003',
    name: 'Critical-path submittal aging',
    status: 'active',
    sourceType: 'submittal',
    conditions: [
      { field: 'criticalPath', operator: 'eq', value: true },
      { field: 'daysInCurrentReview', operator: 'aging_gt', value: 14 },
    ],
    taggingAction: {
      riskTypeId: 'rt-002',
      defaultProbability: 3,
      defaultImpact: 21,
      behavior: 'auto_create',
    },
    lastFiredAt: new Date('2026-04-30T06:12:00'),
    fireCount: 7,
    createdBy: 'user-001',
    createdAt: new Date('2025-10-01'),
  },

  // ── Safety Risk: Hazardous schedule activity without safety plan, starts < 14 days
  {
    id: 'ar-004',
    name: 'Hazardous activity prep — upcoming',
    status: 'active',
    sourceType: 'milestone',
    conditions: [
      { field: 'hazardousActivityType', operator: 'neq', value: 'null' },
      { field: 'startsInDays', operator: 'lt', value: 14 },
      { field: 'safetyPlanCompleted', operator: 'eq', value: false },
    ],
    taggingAction: {
      riskTypeId: 'rt-003',
      defaultProbability: 4,
      defaultImpact: 4,
      behavior: 'auto_create',
    },
    lastFiredAt: new Date('2026-04-26'),
    fireCount: 2,
    createdBy: 'user-001',
    createdAt: new Date('2025-10-01'),
  },

  // ── Quality Risk: Punch list item open > 30 days → tag ──────────────────────
  {
    id: 'ar-005',
    name: 'Overdue punch list item',
    status: 'active',
    sourceType: 'punch_list',
    conditions: [
      { field: 'daysOpen', operator: 'gt', value: 30 },
    ],
    taggingAction: {
      riskTypeId: 'rt-004',
      defaultProbability: 2,
      defaultImpact: 15000,
      behavior: 'surface_as_suggestion',
    },
    lastFiredAt: new Date('2026-04-28'),
    fireCount: 4,
    createdBy: 'user-001',
    createdAt: new Date('2025-10-15'),
  },

  // ── Schedule Risk: RFI open > 21 days → tag ─────────────────────────────────
  {
    id: 'ar-006',
    name: 'Overdue RFI — schedule risk signal',
    status: 'active',
    sourceType: 'rfi',
    conditions: [
      { field: 'daysOpen', operator: 'gt', value: 21 },
    ],
    taggingAction: {
      riskTypeId: 'rt-002',
      defaultProbability: 2,
      defaultImpact: 7,
      behavior: 'surface_as_suggestion',
    },
    lastFiredAt: new Date('2026-05-02'),
    fireCount: 14,
    createdBy: 'user-001',
    createdAt: new Date('2025-10-15'),
  },

  // ── Cost Risk: Owner-driven CE > $500K → tag + PM Director approval ──────────
  {
    id: 'ar-007',
    name: 'Owner-driven CE — Director approval',
    status: 'active',
    sourceType: 'change_event',
    conditions: [
      { field: 'cause', operator: 'eq', value: 'owner_driven' },
      { field: 'currentEstimate', operator: 'gt', value: 500000 },
    ],
    taggingAction: {
      riskTypeId: 'rt-001',
      defaultProbability: 4,
      defaultImpact: 'inherit_from_source',
      behavior: 'auto_create',
    },
    workflowAction: {
      workflowId: 'wf-owner-ce-review-v1',
      finalApproverRole: 'Director of Construction',
      tagStateOnTrigger: 'pending_approval',
    },
    lastFiredAt: new Date('2026-05-01'),
    fireCount: 2,
    createdBy: 'user-001',
    createdAt: new Date('2025-11-01'),
  },

  // ── Safety Risk: Incident with OSHA recordable → tag ────────────────────────
  {
    id: 'ar-008',
    name: 'OSHA-recordable incident — Safety Risk',
    status: 'active',
    sourceType: 'incident',
    conditions: [
      { field: 'oshaRecordable', operator: 'eq', value: true },
    ],
    taggingAction: {
      riskTypeId: 'rt-003',
      defaultProbability: 4,
      defaultImpact: 3,
      behavior: 'auto_create',
    },
    lastFiredAt: new Date('2026-02-03'),
    fireCount: 1,
    createdBy: 'user-001',
    createdAt: new Date('2025-11-01'),
  },

  // ── Draft rule (not yet active) ──────────────────────────────────────────────
  {
    id: 'ar-009',
    name: 'Near-miss trend — safety signal',
    status: 'draft',
    sourceType: 'incident',
    conditions: [
      { field: 'incidentType', operator: 'eq', value: 'near_miss' },
    ],
    taggingAction: {
      riskTypeId: 'rt-003',
      defaultProbability: 3,
      defaultImpact: 2,
      behavior: 'surface_as_suggestion',
    },
    fireCount: 0,
    createdBy: 'user-001',
    createdAt: new Date('2026-03-15'),
  },
];
