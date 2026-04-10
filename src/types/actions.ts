/**
 * HUB ACTION TYPES
 * Defines the shape of AI-suggested actions surfaced in the Hub panel.
 */

export type ActionTier = 'object-specific' | 'common';

export type ActionCardType =
  | 'invoices'
  | 'rfis'
  | 'action_items'
  | 'budget'
  | 'submittals'
  | 'financial_scorecard'
  | 'schedule_variance';

/**
 * RBAC roles used in the action permission model.
 * These are granular, object-level roles — distinct from the broader
 * UserRole used for tool-level permissions.
 */
export type ActionRole =
  | 'owner'
  | 'owner_admin'
  | 'project_manager'
  | 'accounts_payable'
  | 'rfi_manager'
  | 'action_item_creator'
  | 'action_item_assignee'
  | 'budget_manager'
  | 'submittal_manager'
  | 'scheduler';

export type ActionHttpMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ActionParameter {
  name: string;
  required: boolean;
  description: string;
  /** When true, the AI pre-fills this value from conversation context */
  ai_prefilled?: boolean;
  /** UI control type hint */
  input_type?: 'text' | 'textarea' | 'user_select' | 'date' | 'select';
}

export interface HubAction {
  action_id: string;
  label: string;
  description: string;
  action_tier: ActionTier;
  confirmation_required: boolean;
  reversible: boolean;
  api_endpoint: string;
  api_method: ActionHttpMethod;
  permitted_roles: ActionRole[] | 'all';
  card_types: ActionCardType[] | 'all';
  parameters?: ActionParameter[];
  /** Cooldown in hours — prevents repeated execution on the same item */
  cooldown_hours?: number;
}

export type ActionExecutionStatus = 'idle' | 'confirming' | 'executing' | 'success' | 'error';

export interface ActionExecution {
  action: HubAction;
  status: ActionExecutionStatus;
  /** Timestamp of last execution against the current item */
  last_executed_at?: Date;
  /** AI-generated confirmation or result message */
  message?: string;
  /** Parameter values collected from the user */
  parameter_values?: Record<string, string>;
}
