import type { ApprovalTrigger } from '@/types/health';

export const approvalTriggers: ApprovalTrigger[] = [
  // High-value financial risk → director approval required
  {
    id: 'at-001',
    riskTypeId: 'rt-001',
    condition: { field: 'impact', operator: 'gt', value: 250000 },
    workflowId: 'cost-risk-approval-v2',
    onTrigger: 'pending_approval',
  },
  // Critical schedule risk (2+ week impact) → PM + Director sign-off
  {
    id: 'at-002',
    riskTypeId: 'rt-002',
    condition: { field: 'impact', operator: 'gte', value: 14 },
    workflowId: 'schedule-risk-approval-v1',
    onTrigger: 'pending_approval',
  },
  // Large contractual risk → legal + owner review
  {
    id: 'at-003',
    riskTypeId: 'rt-007',
    condition: { field: 'impact', operator: 'gt', value: 100000 },
    workflowId: 'contractual-risk-approval-v1',
    onTrigger: 'pending_approval',
  },
];
