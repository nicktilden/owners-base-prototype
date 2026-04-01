/**
 * TOOLS TYPES
 */

export type ToolLevel = 'portfolio' | 'project' | 'both' | 'global';

export type ToolKey =
  | 'hubs'
  | 'documents'
  | 'schedule'
  | 'assets'
  | 'budget'
  | 'tasks'
  | 'capital_planning'
  | 'funding_source'
  | 'bidding'
  | 'action_plans'
  | 'change_events'
  | 'change_orders'
  | 'invoicing'
  | 'prime_contracts'
  | 'rfis'
  | 'punch_list'
  | 'specifications'
  | 'submittals'
  | 'observations'
  | 'correspondence'
  | 'commitments';

export type ExportFormat = 'PDF' | 'CSV' | 'Excel';

export const TOOL_LEVEL_MAP: Record<ToolKey, ToolLevel> = {
  hubs:               'both',
  documents:          'both',
  schedule:           'both',
  assets:             'both',
  budget:             'both',
  tasks:              'both',
  capital_planning:   'portfolio',
  funding_source:     'portfolio',
  bidding:            'project',
  action_plans:       'project',
  change_events:      'project',
  change_orders:      'project',
  invoicing:          'project',
  prime_contracts:    'project',
  rfis:               'project',
  punch_list:         'project',
  specifications:     'project',
  submittals:         'project',
  observations:       'project',
  correspondence:     'project',
  commitments:        'project',
};

// Human-readable display names for tools in the nav
export const TOOL_DISPLAY_NAMES: Record<ToolKey, string> = {
  hubs:               'Hub',
  documents:          'Documents',
  schedule:           'Schedule',
  assets:             'Assets',
  budget:             'Budget',
  tasks:              'Tasks',
  capital_planning:   'Capital Planning',
  funding_source:     'Funding Source',
  bidding:            'Bidding',
  action_plans:       'Action Plans',
  change_events:      'Change Events',
  change_orders:      'Change Orders',
  invoicing:          'Invoicing',
  prime_contracts:    'Prime Contracts',
  rfis:               'RFIs',
  punch_list:         'Punch List',
  specifications:     'Specifications',
  submittals:         'Submittals',
  observations:       'Observations',
  correspondence:     'Correspondence',
  commitments:        'Commitments',
};
