/**
 * HUB ACTION CATALOG
 * Every action the AI can suggest or facilitate within the Hub panel.
 *
 * Actions are organised into two tiers:
 *   • object-specific — operate on a particular Procore object; fill the primary rail (max 3)
 *   • common           — available across all card types; rendered as a persistent secondary rail
 */

import type { HubAction } from '@/types/actions';

// ─── Invoice Actions ──────────────────────────────────────────────────────────

const invoiceActions: HubAction[] = [
  {
    action_id: 'invoice-reassign-approver',
    label: 'Reassign to new approver',
    description:
      "Changes the invoice's assigned approver to a user you select, and sends that user an email notification with the invoice summary.",
    action_tier: 'object-specific',
    confirmation_required: true,
    reversible: true,
    api_endpoint: '/rest/v1.0/invoices/{invoice_id}/approver',
    api_method: 'PATCH',
    permitted_roles: ['owner', 'owner_admin', 'project_manager'],
    card_types: ['invoices'],
    parameters: [
      { name: 'invoice_id', required: true, description: 'ID of the target invoice' },
      {
        name: 'new_approver_id',
        required: true,
        description: 'User ID of the new approver',
        input_type: 'user_select',
      },
    ],
  },
  {
    action_id: 'invoice-send-overdue-notice',
    label: 'Send overdue notice to vendor',
    description:
      "Sends a system-generated email to the vendor's primary contact notifying them that the invoice is overdue, including the invoice number, amount, and due date.",
    action_tier: 'object-specific',
    confirmation_required: true,
    reversible: false,
    api_endpoint: '/rest/v1.0/invoices/{invoice_id}/overdue_notice',
    api_method: 'POST',
    permitted_roles: ['owner', 'owner_admin', 'project_manager', 'accounts_payable'],
    card_types: ['invoices'],
    parameters: [
      { name: 'invoice_id', required: true, description: 'ID of the target invoice' },
      {
        name: 'message_override',
        required: false,
        description: 'Custom note to append to the system message',
        input_type: 'textarea',
        ai_prefilled: true,
      },
    ],
  },
  {
    action_id: 'invoice-add-comment',
    label: 'Add note to invoice',
    description:
      "Adds a comment to the invoice's activity log, visible to all users with access to that invoice.",
    action_tier: 'object-specific',
    confirmation_required: false,
    reversible: false,
    api_endpoint: '/rest/v1.0/invoices/{invoice_id}/comments',
    api_method: 'POST',
    permitted_roles: 'all',
    card_types: ['invoices'],
    parameters: [
      { name: 'invoice_id', required: true, description: 'ID of the target invoice' },
      {
        name: 'comment_body',
        required: true,
        description: 'Comment text — pre-filled by AI based on conversation context',
        input_type: 'textarea',
        ai_prefilled: true,
      },
    ],
  },
  {
    action_id: 'invoice-put-on-hold',
    label: 'Put invoice on hold',
    description:
      'Marks the invoice as On Hold, stopping it from progressing through the approval workflow until the hold is released.',
    action_tier: 'object-specific',
    confirmation_required: true,
    reversible: true,
    api_endpoint: '/rest/v1.0/invoices/{invoice_id}/hold',
    api_method: 'POST',
    permitted_roles: ['owner', 'owner_admin', 'project_manager'],
    card_types: ['invoices'],
    parameters: [
      { name: 'invoice_id', required: true, description: 'ID of the target invoice' },
    ],
  },
  {
    action_id: 'invoice-request-revision',
    label: 'Request revision from vendor',
    description:
      'Returns the invoice to the vendor with a request for changes, and sends an email notification explaining what needs to be updated.',
    action_tier: 'object-specific',
    confirmation_required: true,
    reversible: false,
    api_endpoint: '/rest/v1.0/invoices/{invoice_id}/revision_request',
    api_method: 'POST',
    permitted_roles: ['owner', 'owner_admin', 'project_manager'],
    card_types: ['invoices'],
    parameters: [
      { name: 'invoice_id', required: true, description: 'ID of the target invoice' },
      {
        name: 'revision_reason',
        required: true,
        description: 'Explanation of what needs to change — pre-filled by AI',
        input_type: 'textarea',
        ai_prefilled: true,
      },
    ],
  },
];

// ─── RFI Actions ──────────────────────────────────────────────────────────────

const rfiActions: HubAction[] = [
  {
    action_id: 'rfi-reassign',
    label: 'Reassign to new responder',
    description:
      "Changes the RFI's ball-in-court to a different user or company, and sends that party an email notification with the RFI details.",
    action_tier: 'object-specific',
    confirmation_required: true,
    reversible: true,
    api_endpoint: '/rest/v1.0/rfis/{rfi_id}/assignee',
    api_method: 'PATCH',
    permitted_roles: ['owner', 'project_manager', 'rfi_manager'],
    card_types: ['rfis'],
    parameters: [
      { name: 'rfi_id', required: true, description: 'ID of the target RFI' },
      {
        name: 'new_assignee_id',
        required: true,
        description: 'User or company ID of the new responder',
        input_type: 'user_select',
      },
    ],
  },
  {
    action_id: 'rfi-set-due-date',
    label: 'Update RFI due date',
    description:
      "Changes the required response date on the RFI and notifies the assigned responder of the updated deadline.",
    action_tier: 'object-specific',
    confirmation_required: true,
    reversible: true,
    api_endpoint: '/rest/v1.0/rfis/{rfi_id}/due_date',
    api_method: 'PATCH',
    permitted_roles: ['owner', 'project_manager', 'rfi_manager'],
    card_types: ['rfis'],
    parameters: [
      { name: 'rfi_id', required: true, description: 'ID of the target RFI' },
      {
        name: 'new_due_date',
        required: true,
        description: 'New response due date',
        input_type: 'date',
      },
    ],
  },
  {
    action_id: 'rfi-escalate',
    label: 'Escalate to project manager',
    description:
      'Adds the project manager as a watcher on this RFI and sends them an escalation email flagging the overdue status and schedule impact.',
    action_tier: 'object-specific',
    confirmation_required: true,
    reversible: false,
    api_endpoint: '/rest/v1.0/rfis/{rfi_id}/escalate',
    api_method: 'POST',
    permitted_roles: ['owner', 'owner_admin'],
    card_types: ['rfis'],
    parameters: [
      { name: 'rfi_id', required: true, description: 'ID of the target RFI' },
    ],
  },
  {
    action_id: 'rfi-add-comment',
    label: 'Add note to RFI',
    description: 'Adds a comment to the RFI visible to all parties in the distribution list.',
    action_tier: 'object-specific',
    confirmation_required: false,
    reversible: false,
    api_endpoint: '/rest/v1.0/rfis/{rfi_id}/comments',
    api_method: 'POST',
    permitted_roles: 'all',
    card_types: ['rfis'],
    parameters: [
      { name: 'rfi_id', required: true, description: 'ID of the target RFI' },
      {
        name: 'comment_body',
        required: true,
        description: 'Comment text',
        input_type: 'textarea',
        ai_prefilled: true,
      },
    ],
  },
];

// ─── Action Item Actions ──────────────────────────────────────────────────────

const actionItemActions: HubAction[] = [
  {
    action_id: 'action-item-reassign',
    label: 'Reassign to new owner',
    description:
      "Changes the action item's assignee and sends the new owner an email notification with the item details and due date.",
    action_tier: 'object-specific',
    confirmation_required: true,
    reversible: true,
    api_endpoint: '/rest/v1.0/action_items/{item_id}/assignee',
    api_method: 'PATCH',
    permitted_roles: ['owner', 'project_manager', 'action_item_creator'],
    card_types: ['action_items'],
    parameters: [
      { name: 'item_id', required: true, description: 'ID of the action item' },
      {
        name: 'new_assignee_id',
        required: true,
        description: 'User ID of the new assignee',
        input_type: 'user_select',
      },
    ],
  },
  {
    action_id: 'action-item-extend-due-date',
    label: 'Extend due date',
    description:
      "Updates the action item's due date to the date you select, and notifies the assignee of the change.",
    action_tier: 'object-specific',
    confirmation_required: true,
    reversible: true,
    api_endpoint: '/rest/v1.0/action_items/{item_id}/due_date',
    api_method: 'PATCH',
    permitted_roles: ['owner', 'project_manager', 'action_item_creator'],
    card_types: ['action_items'],
    parameters: [
      { name: 'item_id', required: true, description: 'ID of the action item' },
      {
        name: 'new_due_date',
        required: true,
        description: 'New due date',
        input_type: 'date',
      },
    ],
  },
  {
    action_id: 'action-item-mark-complete',
    label: 'Mark as complete',
    description:
      'Closes the action item and records the completion date. The item will be removed from the overdue count on the Hub card.',
    action_tier: 'object-specific',
    confirmation_required: true,
    reversible: true,
    api_endpoint: '/rest/v1.0/action_items/{item_id}/complete',
    api_method: 'POST',
    permitted_roles: ['owner', 'project_manager', 'action_item_assignee', 'action_item_creator'],
    card_types: ['action_items'],
    parameters: [
      { name: 'item_id', required: true, description: 'ID of the action item' },
    ],
  },
  {
    action_id: 'action-item-escalate-priority',
    label: 'Escalate to high priority',
    description:
      "Changes the action item's priority to High and sends a notification to the assignee and the project manager.",
    action_tier: 'object-specific',
    confirmation_required: true,
    reversible: true,
    api_endpoint: '/rest/v1.0/action_items/{item_id}/priority',
    api_method: 'PATCH',
    permitted_roles: ['owner', 'project_manager'],
    card_types: ['action_items'],
    parameters: [
      { name: 'item_id', required: true, description: 'ID of the action item' },
    ],
  },
];

// ─── Budget Actions ───────────────────────────────────────────────────────────

const budgetActions: HubAction[] = [
  {
    action_id: 'budget-create-change-event',
    label: 'Create budget change event',
    description:
      'Opens a new change event linked to the selected cost code, pre-populated with the current variance amount. You will review and complete the change event details before submitting.',
    action_tier: 'object-specific',
    confirmation_required: true,
    reversible: true,
    api_endpoint: '/rest/v1.0/change_events',
    api_method: 'POST',
    permitted_roles: ['owner', 'project_manager', 'budget_manager'],
    card_types: ['budget'],
    parameters: [
      { name: 'project_id', required: true, description: 'Project containing the budget line' },
      { name: 'cost_code_id', required: true, description: 'Cost code to link the change event to' },
      {
        name: 'amount',
        required: true,
        description: 'Change event amount — pre-populated from current variance',
        ai_prefilled: true,
        input_type: 'text',
      },
    ],
  },
  {
    action_id: 'budget-add-forecast-note',
    label: 'Add forecast note',
    description:
      'Attaches a note to the selected budget line item explaining the projected variance. The note is visible to all users with budget access on this project.',
    action_tier: 'object-specific',
    confirmation_required: false,
    reversible: false,
    api_endpoint: '/rest/v1.0/budget_line_items/{line_item_id}/notes',
    api_method: 'POST',
    permitted_roles: 'all',
    card_types: ['budget'],
    parameters: [
      { name: 'line_item_id', required: true, description: 'Budget line item ID' },
      {
        name: 'note_body',
        required: true,
        description: 'Forecast note text',
        input_type: 'textarea',
        ai_prefilled: true,
      },
    ],
  },
  {
    action_id: 'budget-notify-pm',
    label: 'Notify project manager',
    description:
      "Sends the project manager an email flagging the budget variance, including the current numbers and the AI's summary of the issue.",
    action_tier: 'object-specific',
    confirmation_required: true,
    reversible: false,
    api_endpoint: '/rest/v1.0/notifications/budget_variance',
    api_method: 'POST',
    permitted_roles: ['owner', 'owner_admin'],
    card_types: ['budget'],
    parameters: [
      { name: 'project_id', required: true, description: 'Project ID' },
      { name: 'cost_code_id', required: true, description: 'Cost code with the variance' },
    ],
  },
];

// ─── Submittal Actions ────────────────────────────────────────────────────────

const submittalActions: HubAction[] = [
  {
    action_id: 'submittal-send-reminder',
    label: 'Send reminder to responsible party',
    description:
      "Sends a system email to the current ball-in-court party reminding them of the submittal's required on-site date and current review status.",
    action_tier: 'object-specific',
    confirmation_required: true,
    reversible: false,
    api_endpoint: '/rest/v1.0/submittals/{submittal_id}/reminder',
    api_method: 'POST',
    permitted_roles: ['owner', 'project_manager', 'submittal_manager'],
    card_types: ['submittals'],
    parameters: [
      { name: 'submittal_id', required: true, description: 'ID of the submittal' },
    ],
  },
  {
    action_id: 'submittal-reassign-reviewer',
    label: 'Reassign reviewer',
    description:
      "Changes the submittal's assigned reviewer and notifies them by email with the submittal details and deadline.",
    action_tier: 'object-specific',
    confirmation_required: true,
    reversible: true,
    api_endpoint: '/rest/v1.0/submittals/{submittal_id}/reviewer',
    api_method: 'PATCH',
    permitted_roles: ['owner', 'project_manager', 'submittal_manager'],
    card_types: ['submittals'],
    parameters: [
      { name: 'submittal_id', required: true, description: 'ID of the submittal' },
      {
        name: 'new_reviewer_id',
        required: true,
        description: 'User ID of the new reviewer',
        input_type: 'user_select',
      },
    ],
  },
];

// ─── Financial Scorecard Actions ──────────────────────────────────────────────

const financialScorecardActions: HubAction[] = [
  {
    action_id: 'scorecard-notify-pm-overrun',
    label: 'Notify PM of budget overrun',
    description:
      "Sends the project manager an email flagging the current forecast overrun, including the projected over/under amount, % forecast/budget, and the AI's summary of contributing factors.",
    action_tier: 'object-specific',
    confirmation_required: true,
    reversible: false,
    api_endpoint: '/rest/v1.0/notifications/scorecard_overrun',
    api_method: 'POST',
    permitted_roles: ['owner', 'owner_admin'],
    card_types: ['financial_scorecard'],
    parameters: [
      { name: 'project_id', required: true, description: 'Project ID' },
    ],
  },
  {
    action_id: 'scorecard-create-change-event',
    label: 'Create budget change event',
    description:
      'Opens a new change event on the selected project, pre-populated with the current projected overrun amount. You will review and complete the details before submitting.',
    action_tier: 'object-specific',
    confirmation_required: true,
    reversible: true,
    api_endpoint: '/rest/v1.0/change_events',
    api_method: 'POST',
    permitted_roles: ['owner', 'owner_admin', 'project_manager', 'budget_manager'],
    card_types: ['financial_scorecard'],
    parameters: [
      { name: 'project_id', required: true, description: 'Project ID' },
      {
        name: 'amount',
        required: true,
        description: 'Projected overrun amount — pre-populated',
        ai_prefilled: true,
        input_type: 'text',
      },
    ],
  },
  {
    action_id: 'scorecard-add-forecast-note',
    label: 'Add forecast explanation note',
    description:
      "Attaches a note to the selected project's financial record explaining the current variance. The note is visible to all users with budget access on that project.",
    action_tier: 'object-specific',
    confirmation_required: false,
    reversible: false,
    api_endpoint: '/rest/v1.0/projects/{project_id}/forecast_notes',
    api_method: 'POST',
    permitted_roles: 'all',
    card_types: ['financial_scorecard'],
    parameters: [
      { name: 'project_id', required: true, description: 'Project ID' },
      {
        name: 'note_body',
        required: true,
        description: 'Forecast explanation',
        input_type: 'textarea',
        ai_prefilled: true,
      },
    ],
  },
  {
    action_id: 'scorecard-request-budget-review',
    label: 'Request budget review meeting',
    description:
      'Creates a calendar invite for a budget review and sends it to the project manager and owner stakeholders listed on the project, with the current financial summary attached.',
    action_tier: 'object-specific',
    confirmation_required: true,
    reversible: false,
    api_endpoint: '/rest/v1.0/meetings/budget_review',
    api_method: 'POST',
    permitted_roles: ['owner', 'owner_admin'],
    card_types: ['financial_scorecard'],
    parameters: [
      { name: 'project_id', required: true, description: 'Project ID' },
      {
        name: 'meeting_date',
        required: true,
        description: 'Proposed meeting date',
        input_type: 'date',
      },
    ],
  },
  {
    action_id: 'scorecard-change-snapshot',
    label: 'Change comparison snapshot',
    description:
      'Updates the snapshot period used for period-over-period change calculations across all scorecard metrics. Changes apply to this session only unless saved as default.',
    action_tier: 'object-specific',
    confirmation_required: false,
    reversible: true,
    api_endpoint: '/rest/v1.0/scorecard/snapshot',
    api_method: 'PATCH',
    permitted_roles: 'all',
    card_types: ['financial_scorecard'],
    parameters: [
      {
        name: 'snapshot_period',
        required: true,
        description: 'Snapshot period for comparison',
        input_type: 'select',
      },
    ],
  },
];

// ─── Schedule Variance Actions ────────────────────────────────────────────────

const scheduleVarianceActions: HubAction[] = [
  {
    action_id: 'schedule-request-recovery-plan',
    label: 'Request recovery plan from PM',
    description:
      'Sends the project manager an email requesting a written schedule recovery plan for the selected project, with a response deadline you specify.',
    action_tier: 'object-specific',
    confirmation_required: true,
    reversible: false,
    api_endpoint: '/rest/v1.0/notifications/recovery_plan_request',
    api_method: 'POST',
    permitted_roles: ['owner', 'owner_admin'],
    card_types: ['schedule_variance'],
    parameters: [
      { name: 'project_id', required: true, description: 'Project ID' },
      {
        name: 'response_deadline',
        required: true,
        description: 'Deadline for the PM to respond',
        input_type: 'date',
      },
    ],
  },
  {
    action_id: 'schedule-escalate-to-owner',
    label: 'Escalate delay to owner stakeholder',
    description:
      "Sends an escalation email to the designated owner stakeholder for the selected project, including the current variance, expected completion date, and the AI's delay summary.",
    action_tier: 'object-specific',
    confirmation_required: true,
    reversible: false,
    api_endpoint: '/rest/v1.0/notifications/schedule_escalation',
    api_method: 'POST',
    permitted_roles: ['owner_admin'],
    card_types: ['schedule_variance'],
    parameters: [
      { name: 'project_id', required: true, description: 'Project ID' },
    ],
  },
  {
    action_id: 'schedule-add-delay-note',
    label: 'Log delay explanation',
    description:
      'Adds a delay note to the selected project\'s schedule record, attributing the variance to a category (weather, owner change, subcontractor, etc.) and recording a plain-language explanation.',
    action_tier: 'object-specific',
    confirmation_required: false,
    reversible: false,
    api_endpoint: '/rest/v1.0/projects/{project_id}/delay_notes',
    api_method: 'POST',
    permitted_roles: ['owner', 'owner_admin', 'project_manager'],
    card_types: ['schedule_variance'],
    parameters: [
      { name: 'project_id', required: true, description: 'Project ID' },
      {
        name: 'delay_category',
        required: true,
        description: 'Category: weather, owner_change, subcontractor, permitting, design, other',
        input_type: 'select',
      },
      {
        name: 'explanation',
        required: true,
        description: 'Plain-language explanation of the delay',
        input_type: 'textarea',
        ai_prefilled: true,
      },
    ],
  },
  {
    action_id: 'schedule-update-forecast-date',
    label: 'Update expected completion date',
    description:
      "Updates the project's expected completion date in Procore to reflect the current forecast, and notifies the project manager that the date has been revised.",
    action_tier: 'object-specific',
    confirmation_required: true,
    reversible: true,
    api_endpoint: '/rest/v1.0/projects/{project_id}/forecast_date',
    api_method: 'PATCH',
    permitted_roles: ['owner', 'project_manager', 'scheduler'],
    card_types: ['schedule_variance'],
    parameters: [
      { name: 'project_id', required: true, description: 'Project ID' },
      {
        name: 'new_completion_date',
        required: true,
        description: 'Revised expected completion date',
        input_type: 'date',
      },
    ],
  },
  {
    action_id: 'schedule-flag-critical-risk',
    label: 'Flag project as schedule risk',
    description:
      'Applies a "Schedule Risk" flag to the selected project on the Hub, making it visible across all portfolio views and triggering a notification to the program manager.',
    action_tier: 'object-specific',
    confirmation_required: true,
    reversible: true,
    api_endpoint: '/rest/v1.0/projects/{project_id}/flags',
    api_method: 'POST',
    permitted_roles: ['owner', 'owner_admin', 'project_manager'],
    card_types: ['schedule_variance'],
    parameters: [
      { name: 'project_id', required: true, description: 'Project ID' },
    ],
  },
];

// ─── Common Actions ───────────────────────────────────────────────────────────

const commonActions: HubAction[] = [
  {
    action_id: 'common-start-conversation',
    label: 'Start a conversation',
    description:
      "Opens a new Conversation in Procore's Conversations tool, pre-populated with the item context (object type, number, project) and the AI's current summary as a starting message. The user selects participants before sending.",
    action_tier: 'common',
    confirmation_required: true,
    reversible: false,
    api_endpoint: '/rest/v1.0/conversations',
    api_method: 'POST',
    permitted_roles: 'all',
    card_types: 'all',
    parameters: [
      { name: 'source_object_type', required: true, description: 'Type of the linked object' },
      { name: 'source_object_id', required: true, description: 'ID of the linked object' },
      {
        name: 'opening_message',
        required: true,
        description: 'AI-drafted opening message summarizing the issue',
        input_type: 'textarea',
        ai_prefilled: true,
      },
      {
        name: 'participant_ids',
        required: true,
        description: 'Participants — AI suggests relevant people, user makes final selection',
        input_type: 'user_select',
      },
    ],
  },
  {
    action_id: 'common-send-reminder',
    label: 'Send a reminder',
    description:
      "Sends an automated notification to the responsible party for the current item, reminding them of their outstanding action and the due date. The notification is sent through Procore's notification system and logged in the item's activity history.",
    action_tier: 'common',
    confirmation_required: true,
    reversible: false,
    api_endpoint: '/rest/v1.0/notifications/reminder',
    api_method: 'POST',
    permitted_roles: 'all',
    card_types: 'all',
    cooldown_hours: 48,
    parameters: [
      { name: 'source_object_type', required: true, description: 'Type of the linked object' },
      { name: 'source_object_id', required: true, description: 'ID of the linked object' },
      { name: 'recipient_id', required: true, description: 'Recipient user ID — auto-determined from assignee', input_type: 'user_select' },
      {
        name: 'message',
        required: true,
        description: 'Reminder message — AI-drafted with item context',
        input_type: 'textarea',
        ai_prefilled: true,
      },
    ],
  },
  {
    action_id: 'common-nudge-assignee',
    label: 'Nudge assignee',
    description:
      'Sends a lightweight, informal in-app notification to the current assignee of the selected item, surfacing it at the top of their Procore notifications. Does not send an email. Intended for low-friction check-ins rather than formal reminders.',
    action_tier: 'common',
    confirmation_required: false,
    reversible: false,
    api_endpoint: '/rest/v1.0/notifications/nudge',
    api_method: 'POST',
    permitted_roles: 'all',
    card_types: 'all',
    cooldown_hours: 24,
    parameters: [
      { name: 'source_object_type', required: true, description: 'Type of the linked object' },
      { name: 'source_object_id', required: true, description: 'ID of the linked object' },
      { name: 'assignee_id', required: true, description: 'User ID of the current assignee' },
    ],
  },
  {
    action_id: 'common-open-in-system',
    label: 'Open full record',
    description:
      'Opens the full object record in the appropriate Procore tool in a new tab, giving the user access to the complete detail view beyond what the pull-forward panel shows.',
    action_tier: 'common',
    confirmation_required: false,
    reversible: true,
    api_endpoint: '',
    api_method: 'POST',
    permitted_roles: 'all',
    card_types: 'all',
  },
];

// ─── Aggregate Catalog ────────────────────────────────────────────────────────

export const ACTION_CATALOG: HubAction[] = [
  ...invoiceActions,
  ...rfiActions,
  ...actionItemActions,
  ...budgetActions,
  ...submittalActions,
  ...financialScorecardActions,
  ...scheduleVarianceActions,
  ...commonActions,
];

export const OBJECT_SPECIFIC_ACTIONS = ACTION_CATALOG.filter(
  (a) => a.action_tier === 'object-specific'
);

export const COMMON_ACTIONS = ACTION_CATALOG.filter(
  (a) => a.action_tier === 'common'
);

export {
  invoiceActions,
  rfiActions,
  actionItemActions,
  budgetActions,
  submittalActions,
  financialScorecardActions,
  scheduleVarianceActions,
  commonActions,
};
