/**
 * PERMISSIONS
 * Two-layer access model:
 *
 * 1. ToolPermissionLevel — controls per-tool access using a tiered level system.
 *    Applied per user per tool. Levels are cumulative (admin includes all below it).
 *
 * 2. PermissionKey — controls platform, account, project, and user management
 *    actions that live outside of individual tools.
 *
 * Resolution order for both layers:
 *   1. Start with roleDefaults for the user's UserRole
 *   2. Apply granted (add permissions beyond the defaults)
 *   3. Apply denied (remove permissions from the resolved set)
 */

// =============================================================================
// TOOL PERMISSION LEVEL
// =============================================================================

/**
 * TOOL PERMISSION LEVEL
 * Tiered access model — each level includes all levels below it.
 * If a user has no entry for a tool, they have no access (tool is hidden).
 *
 * none   → tool is hidden from nav and hub cards
 * read   → can view records, no modifications
 * update → read + can edit existing records
 * create → update + can create and delete records
 * admin  → create + access to tool-level settings
 */
type ToolPermissionLevel = 'none' | 'read' | 'update' | 'create' | 'admin';

/**
 * USER TOOL PERMISSIONS
 * Maps each ToolKey to the user's ToolPermissionLevel.
 * A single level applies regardless of whether the tool is accessed
 * at the portfolio or project level.
 * If a tool key is absent, access defaults to 'none'.
 */
type UserToolPermissions = Partial<Record<ToolKey, ToolPermissionLevel>>;

/**
 * OPERATOR TOOL PERMISSIONS
 * Shared by: Operators
 */
const OPERATOR_TOOL_PERMISSIONS: UserToolPermissions = {
  hubs:              'update',
  documents:         'update',
  schedule:          'read',
  assets:            'read',
  capital_planning:  'none',
  funding_source:    'none',
  budget:            'none',
  bidding:           'none',
  action_plans:      'read',
  change_events:     'none',
  change_orders:     'none',
  invoicing:         'none',
  prime_contracts:   'none',
  rfis:              'read',
  punch_list:        'read',
  specifications:    'read',
  submittals:        'read',
  observations:      'read',
  correspondence:    'read',
  commitments:       'read',
  tasks:             'read',
};

/**
 * Defines the default UserToolPermissions for each UserRole.
 * Used to populate a user's tool permissions at creation time.
 */
type RoleToolPermissionMap = Record<UserRole, UserToolPermissions>;

// =============================================================================
// PERMISSION KEY
// =============================================================================

/**
 * PERMISSION KEY
 * Machine-readable keys for platform, account, project, and user management
 * actions that exist outside of individual tools.
 * Grouped by resource type.
 */
type PermissionKey =
  // Platform
  | 'platform:access'               // Can log in and access the platform

  // Account
  | 'account:read'                  // Can view account settings
  | 'account:update'                // Can edit account settings
  | 'account:manage_billing'        // Can manage billing and subscription

  // Users
  | 'users:invite'                  // Can invite new users to the account
  | 'users:remove'                  // Can remove users from the account
  | 'users:update_role'             // Can change a user's role
  | 'users:update_permissions'      // Can customize a user's permissions

  // Projects
  | 'projects:create'               // Can create a new project
  | 'projects:read'                 // Can view projects they are assigned to
  | 'projects:update'               // Can edit project details
  | 'projects:delete'               // Can delete a project
  | 'projects:manage_members'       // Can add or remove users from a project

  // Tool management (enabling/disabling tools — not tool content access)
  | 'tools:enable'                  // Can enable tools on a project
  | 'tools:disable';                // Can disable tools on a project

/**
 * USER PERMISSIONS
 * Resolved permission set for a user.
 * Starts from the defaults for their UserRole, then applies
 * individual grants and denials on top.
 */
interface UserPermissions {
  // Tool access
  toolDefaults: UserToolPermissions;   // Tool levels inherited from UserRole
  toolGranted: UserToolPermissions;    // Tool levels explicitly elevated per user
  toolDenied: ToolKey[];               // Tools explicitly set to 'none' for this user

  // Non-tool action keys
  keyDefaults: PermissionKey[];        // Action keys inherited from UserRole
  keyGranted: PermissionKey[];         // Action keys explicitly added per user
  keyDenied: PermissionKey[];          // Action keys explicitly removed per user
}

/**
 * ROLE PERMISSION MAP
 * Defines the default PermissionKeys for each UserRole.
 * Used alongside RoleToolPermissionMap at user creation.
 */
type RolePermissionMap = Record<UserRole, PermissionKey[]>;

// =============================================================================
// ROLE TOOL PERMISSION DEFAULTS
// =============================================================================

/**
 * EXECUTIVE TOOL PERMISSIONS
 * Shared by: CEO, COO, CFO, Capital Planning
 */
const EXECUTIVE_TOOL_PERMISSIONS: UserToolPermissions = {
  hubs:              'create',
  documents:         'read',
  schedule:          'read',
  assets:            'read',
  capital_planning:  'admin',
  funding_source:    'admin',
  budget:            'create',
  bidding:           'read',
  action_plans:      'update',
  change_events:     'update',
  change_orders:     'update',
  invoicing:         'update',
  prime_contracts:   'update',
  rfis:              'update',
  punch_list:        'update',
  specifications:    'update',
  submittals:        'update',
  observations:      'update',
  correspondence:    'update',
  commitments:       'update',
  tasks:             'create',
};

/**
 * ADMIN TOOL PERMISSIONS
 * Shared by: VP of Operations, VP of Development,
 *            Director of Project Management, Director of Construction, IT Admin
 */
const ADMIN_TOOL_PERMISSIONS: UserToolPermissions = {
  hubs:              'admin',
  documents:         'admin',
  schedule:          'admin',
  assets:            'admin',
  capital_planning:  'admin',
  funding_source:    'admin',
  budget:            'admin',
  bidding:           'admin',
  action_plans:      'admin',
  change_events:     'admin',
  change_orders:     'admin',
  invoicing:         'admin',
  prime_contracts:   'admin',
  rfis:              'admin',
  punch_list:        'admin',
  specifications:    'admin',
  submittals:        'admin',
  observations:      'admin',
  correspondence:    'admin',
  commitments:       'admin',
  tasks:             'admin',
};

/**
 * MANAGER TOOL PERMISSIONS
 * Shared by: Program Manager, Project Manager, Construction Manager
 */
const MANAGER_TOOL_PERMISSIONS: UserToolPermissions = {
  hubs:              'create',
  documents:         'create',
  schedule:          'create',
  assets:            'create',
  capital_planning:  'create',
  funding_source:    'create',
  budget:            'admin',
  bidding:           'admin',
  action_plans:      'admin',
  change_events:     'admin',
  change_orders:     'admin',
  invoicing:         'admin',
  prime_contracts:   'admin',
  rfis:              'admin',
  punch_list:        'admin',
  specifications:    'admin',
  submittals:        'admin',
  observations:      'admin',
  correspondence:    'admin',
  commitments:       'admin',
  tasks:             'admin',
};

/**
 * FIELD ROLE TOOL PERMISSIONS
 * Shared by: Superintendent, Project Engineer, Foreman
 * create on all tools except capital_planning, funding_source, and budget (none)
 */
const FIELD_ROLE_TOOL_PERMISSIONS: UserToolPermissions = {
  hubs:              'create',
  documents:         'create',
  schedule:          'create',
  assets:            'create',
  capital_planning:  'none',
  funding_source:    'none',
  budget:            'none',
  bidding:           'create',
  action_plans:      'create',
  change_events:     'create',
  change_orders:     'create',
  invoicing:         'create',
  prime_contracts:   'create',
  rfis:              'create',
  punch_list:        'create',
  specifications:    'create',
  submittals:        'create',
  observations:      'create',
  correspondence:    'create',
  commitments:       'create',
  tasks:             'create',
};


/**
 * BOARD OF DIRECTORS TOOL PERMISSIONS
 */
const BOARD_TOOL_PERMISSIONS: UserToolPermissions = {
  hubs:              'read',
  documents:         'read',
  schedule:          'read',
  assets:            'none',
  capital_planning:  'none',
  funding_source:    'none',
  budget:            'none',
  bidding:           'none',
  action_plans:      'none',
  change_events:     'none',
  change_orders:     'none',
  invoicing:         'none',
  prime_contracts:   'none',
  rfis:              'none',
  punch_list:        'none',
  specifications:    'none',
  submittals:        'none',
  observations:      'none',
  correspondence:    'none',
  commitments:       'none',
  tasks:             'none',
};

const ROLE_TOOL_PERMISSION_MAP: RoleToolPermissionMap = {
  'CEO':                              EXECUTIVE_TOOL_PERMISSIONS,
  'COO':                              EXECUTIVE_TOOL_PERMISSIONS,
  'CFO':                              EXECUTIVE_TOOL_PERMISSIONS,
  'Capital Planning':                 EXECUTIVE_TOOL_PERMISSIONS,
  'VP of Operations':                 ADMIN_TOOL_PERMISSIONS,
  'VP of Development':                ADMIN_TOOL_PERMISSIONS,
  'Director of Project Management':   ADMIN_TOOL_PERMISSIONS,
  'Director of Construction':         ADMIN_TOOL_PERMISSIONS,
  'IT Admin':                         ADMIN_TOOL_PERMISSIONS,
  'Program Manager':                  MANAGER_TOOL_PERMISSIONS,
  'Project Manager':                  MANAGER_TOOL_PERMISSIONS,
  'Construction Manager':             MANAGER_TOOL_PERMISSIONS,
  'Superintendent':                   FIELD_ROLE_TOOL_PERMISSIONS,
  'Project Engineer':                 FIELD_ROLE_TOOL_PERMISSIONS,
  'Foreman':                          FIELD_ROLE_TOOL_PERMISSIONS,
  'Operators':                        OPERATOR_TOOL_PERMISSIONS,
  'Board of Directors':               BOARD_TOOL_PERMISSIONS,
};
