/**
 * AUTOMATION RULES TYPES
 * UI-facing umbrella over RiskTypeRule + ApprovalTrigger (v7 internal types).
 */

import type { SourceType } from './health';

export type AutomationRuleStatus = 'active' | 'inactive' | 'draft';

export interface RuleCondition {
  field: string;
  operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq' | 'neq' | 'contains' | 'aging_gt';
  value: number | string | boolean;
}

export interface AutomationRule {
  id: string;
  name: string;
  status: AutomationRuleStatus;
  sourceType: SourceType;
  conditions: RuleCondition[];

  taggingAction?: {
    riskTypeId: string;
    defaultProbability: 1 | 2 | 3 | 4 | 5;
    defaultImpact: number | 'inherit_from_source';
    behavior: 'auto_create' | 'surface_as_suggestion';
  };

  workflowAction?: {
    workflowId: string;
    finalApproverRole?: string;
    tagStateOnTrigger: 'pending_approval';
  };

  notificationAction?: {
    recipientRoles: string[];
  };

  lastFiredAt?: Date;
  fireCount: number;
  createdBy: string;
  createdAt: Date;
}
