import type { ToolLevel, ToolCoreActions, ToolSubPages } from './index';

/**
 * HUBS
 * A configurable dashboard tool available at both portfolio and project levels.
 * Content is organized into tabs, each containing Hub Cards (widgets/modules).
 *
 * Portfolio level — user-facing name: "Hub"
 *   Displays portfolio-wide data aggregated across projects.
 *
 * Project level — nav label: "Project Overview"
 *   Page title is the project's display name: {ProjectNumber} {ProjectName}
 *   Displays project-scoped data.
 *
 * Tabs are a mix of admin-assigned defaults and user-created tabs (subject to permissions).
 * Each Hub instance must have at least 1 tab and no more than 10.
 */

// =============================================================================
// HUB INSTANCE
// =============================================================================

/**
 * HUB
 * A single Hub instance, scoped to either a portfolio (accountId) or a project (projectId).
 */
interface Hub {
  id: string;                        // Unique identifier
  level: Extract<ToolLevel, 'portfolio' | 'project'>; // portfolio or project — not both/global
  accountId: string;                 // Account this Hub belongs to
  projectId: string | null;          // null for portfolio-level Hub; set for project-level Hub
  displayName: HubDisplayName;       // User-facing name and page title config
  tabs: HubTab[];                    // Ordered list of tabs — min 1, max 10
  createdAt: Date;
  updatedAt: Date;
}

/**
 * HUB DISPLAY NAME
 * Controls the user-facing name and page title for a Hub instance.
 *
 * Portfolio level:
 *   navLabel = 'Hub'
 *   pageTitle = 'Hub'
 *
 * Project level:
 *   navLabel = 'Project Overview'
 *   pageTitle = '{ProjectNumber} {ProjectName}' — resolved at render time
 */
interface HubDisplayName {
  navLabel: string;                  // Label shown in the navigation
  pageTitle: string;                 // Title shown at the top of the page
}

// =============================================================================
// HUB TABS
// =============================================================================

/**
 * HUB TAB
 * A single tab within a Hub. Contains an ordered list of Hub Cards.
 * Tabs can be admin-assigned (default) or user-created (if permitted).
 */
interface HubTab {
  id: string;                        // Unique identifier
  hubId: string;                     // The Hub this tab belongs to
  label: string;                     // Display label shown on the tab
  order: number;                     // Position in the tab bar (0-indexed)
  source: HubTabSource;              // Whether the tab was assigned by admin or created by user
  cards: HubCard[];                  // Ordered list of Hub Cards within this tab
  createdBy: string;                 // User ID of the creator
  createdAt: Date;
  updatedAt: Date;
}

/**
 * HUB TAB SOURCE
 * Indicates how the tab was created.
 *   admin   — assigned as a default by an admin; visible to all users on this Hub
 *   user    — created by an individual user with create/admin permission on Hubs
 */
type HubTabSource = 'admin' | 'user';

// =============================================================================
// HUB CARDS
// =============================================================================

/**
 * HUB CARD
 * A widget/module placed within a Hub Tab.
 * Each card displays data from a specific tool or metric.
 */
interface HubCard {
  id: string;                        // Unique identifier
  tabId: string;                     // The HubTab this card belongs to
  type: HubCardType;                 // The kind of data/widget this card displays
  title: string;                     // Display title shown on the card
  order: number;                     // Position within the tab layout (0-indexed)
  config: HubCardConfig;             // Card-specific configuration
  createdBy: string;                 // User ID of the creator
  createdAt: Date;
  updatedAt: Date;
}

/**
 * HUB CARD TYPE
 * The category of data or widget a Hub Card can display.
 * Each type maps to a specific visual component and data source.
 */
type HubCardType =
  | 'project_list'                   // List of projects with status and key metrics
  | 'project_map'                    // Map view of project locations
  | 'budget_summary'                 // Budget overview (spent vs. remaining)
  | 'schedule_summary'               // Schedule status and milestone progress
  | 'open_issues'                    // Count and list of open issues/observations
  | 'open_rfis'                      // Count and list of open RFIs
  | 'open_submittals'                // Count and list of open submittals
  | 'open_punch_list'                // Count and list of open punch list items
  | 'tasks_summary'                  // Assigned tasks and completion status
  | 'change_order_summary'           // Change order count and value
  | 'team_members'                   // List of assigned team members
  | 'recent_activity'                // Feed of recent actions across tools
  | 'custom_metric';                 // User-defined metric or KPI

/**
 * HUB CARD CONFIG
 * Configuration options for a Hub Card.
 * Fields are optional — only relevant ones apply per card type.
 */
interface HubCardConfig {
  toolKey?: string;                  // Source tool for the card's data
  projectIds?: string[];             // Specific projects to filter data by (portfolio-level cards)
  dateRange?: HubCardDateRange;      // Optional date range filter
  maxItems?: number;                 // Max number of items to display (e.g. top 5 open RFIs)
  customLabel?: string;              // Optional override label for the card
  customMetricKey?: string;          // Key for custom_metric card type
}

/**
 * HUB CARD DATE RANGE
 */
interface HubCardDateRange {
  start: Date;
  end: Date;
}

// =============================================================================
// HUB TOOL DEFINITION
// =============================================================================

/**
 * HUB TOOL
 * The tool definition for Hubs, implementing the shared Tool base interface.
 */
interface HubTool {
  key: 'hubs';
  name: 'Hub';                                        // Portfolio-level display name
  projectNavLabel: 'Project Overview';                // Project-level nav label
  level: Extract<ToolLevel, 'both'>;
  description: 'Configurable dashboard tool for displaying project and portfolio data through tabs and hub cards. Aggregates data across tools at both the portfolio and project level.';
  coreActions: ToolCoreActions;
  subPages: ToolSubPages;
}
