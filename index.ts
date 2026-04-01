/**
 * TOOLS — BASE SCHEMA
 * Defines the shared structure, types, and scope map for all platform tools.
 * Individual tool definitions live in their own files within this folder.
 */

// =============================================================================
// TOOL SCOPE
// =============================================================================

/**
 * TOOL LEVEL
 * Defines where a tool exists within the platform hierarchy.
 *   portfolio — available at the portfolio level only
 *   project   — available at the project level only
 *   both      — available at both levels; portfolio view aggregates across projects
 *   global    — available platform-wide, outside of portfolio or project context
 */
type ToolLevel = 'portfolio' | 'project' | 'both' | 'global';

// =============================================================================
// TOOL KEY
// =============================================================================

/**
 * TOOL KEY
 * Machine-readable keys for each available platform tool.
 *
 * Level reference:
 *   both      — Hubs, Documents, Schedule, Assets, Budget, Tasks
 *   portfolio — Capital Planning, Funding Source
 *   project   — Bidding, Action Plans, Change Events, Change Orders,
 *               Invoicing, Prime Contracts, RFIs, Punch List,
 *               Specifications, Submittals, Observations,
 *               Correspondence, Commitments
 */
type ToolKey =
  // Portfolio + Project
  | 'hubs'
  | 'documents'
  | 'schedule'
  | 'assets'
  | 'budget'
  | 'tasks'
  // Portfolio only
  | 'capital_planning'
  | 'funding_source'
  // Project only
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

// =============================================================================
// CORE ACTIONS
// =============================================================================

/**
 * EXPORT FORMAT
 * Available export formats for the Export core action.
 */
type ExportFormat = 'PDF' | 'CSV' | 'Excel';

/**
 * TOOL CORE ACTIONS
 * Actions available at the top level of every tool.
 */
interface ToolCoreActions {
  create: ToolCoreAction;      // Creates a new item within the tool (e.g. RFI, Punch List Item)
  export: ExportFormat[];      // Available export formats (dropdown)
  reports: ToolCoreAction;     // Tool-level reporting — report types defined per tool (TBD)
}

/**
 * TOOL CORE ACTION
 * Describes a single core action available within a tool.
 */
interface ToolCoreAction {
  label: string;               // Button label shown in the UI
  description: string;         // Short description of what the action does
}

// =============================================================================
// SUB-PAGES
// =============================================================================

/**
 * TOOL SUB-PAGES
 * Standard sub-pages available within every tool.
 * Both pages render a table view filtered by item status.
 */
interface ToolSubPages {
  openItems: ToolSubPage;      // Table view of all items with status = open
  closedItems: ToolSubPage;    // Table view of all items with status = closed
}

/**
 * TOOL SUB-PAGE
 * Describes a single sub-page within a tool.
 */
interface ToolSubPage {
  label: string;               // Nav label shown in the UI
  description: string;         // Short description of the sub-page
  filter: 'open' | 'closed';  // Status filter applied to the item list
}

// =============================================================================
// TOOL BASE
// =============================================================================

/**
 * TOOL
 * Base interface for all platform tools.
 * Each individual tool extends or implements this interface.
 */
interface Tool {
  key: ToolKey;                // Machine-readable identifier
  name: string;                // Display name (e.g. 'Budget', 'Action Plans')
  level: ToolLevel;            // Where the tool exists in the platform hierarchy
  description: string;         // Short description of the tool and its value
  coreActions: ToolCoreActions; // Create, Export, Reports
  subPages: ToolSubPages;      // Open Items, Closed Items
}

// =============================================================================
// TOOL LEVEL MAP
// =============================================================================

/**
 * TOOL LEVEL MAP
 * Maps each ToolKey to its ToolLevel.
 * Used to determine where a tool is available in the UI
 * and whether its data should be aggregated at the portfolio level.
 */
const TOOL_LEVEL_MAP: Record<ToolKey, ToolLevel> = {
  // Both
  hubs:               'both',
  documents:          'both',
  schedule:           'both',
  assets:             'both',
  budget:             'both',
  tasks:              'both',
  // Portfolio only
  capital_planning:   'portfolio',
  funding_source:     'portfolio',
  // Project only
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
