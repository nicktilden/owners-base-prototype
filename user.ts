/**
 * USER
 * Represents an individual with access to the platform.
 * Users belong to one Account and are assigned to Projects
 * based on their role and permissions.
 */
interface User {
  id: string;                        // Unique identifier
  accountId: string;                 // The Account this user belongs to
  firstName: string;                 // First name
  lastName: string;                  // Last name
  companyName: string;               // Company or organization the user belongs to
  email: string;                     // Login email — unique within the platform
  avatar: string | null;             // null until the user uploads a photo
  role: UserRole;                    // Job title — drives default permissions
  projectIds: string[];              // IDs of Projects this user is assigned to
  permissions: UserPermissions;      // Role-based defaults + individual overrides
  favorites: UserFavorites;          // Favorited projects and tools
  createdAt: Date;                   // Date the user was created
  updatedAt: Date;                   // Date the user was last updated
  lastActiveAt: Date | null;         // Last login or activity timestamp
}

/**
 * USER ROLE
 * Job title of the user within their organization.
 * Drives persona-based UI and default permission sets.
 * Displayed as a dropdown on invite/edit.
 */
type UserRole =
  | 'CEO'
  | 'COO'
  | 'CFO'
  | 'Capital Planning'
  | 'VP of Operations'
  | 'VP of Development'
  | 'Board of Directors'
  | 'Director of Project Management'
  | 'Director of Construction'
  | 'Program Manager'
  | 'Project Manager'
  | 'Construction Manager'
  | 'Superintendent'
  | 'Project Engineer'
  | 'Foreman'
  | 'Operators'
  | 'IT Admin';

/**
 * USER PERMISSIONS
 * Resolved permission set for a user.
 * Starts from the default set for their UserRole, then applies
 * individual grants and denials on top.
 */
interface UserPermissions {
  roleDefaults: PermissionKey[];     // Default permissions inherited from UserRole
  granted: PermissionKey[];          // Permissions explicitly added beyond the role defaults
  denied: PermissionKey[];           // Permissions explicitly removed from the role defaults
}

/**
 * USER FAVORITES
 * Projects and tools a user has marked as favorites.
 * Scoped account-wide — any project or tool the user has access to.
 */
interface UserFavorites {
  projectIds: string[];              // IDs of favorited Projects
  toolKeys: ToolKey[];               // Keys of favorited Tools
}

/**
 * ASSIGNED ITEM
 * Represents a single task or item assigned to a user within a tool.
 * Items (RFIs, submittals, issues, etc.) reference the user by assigneeId.
 * This type enables aggregation of all assignments across users and item types.
 */
interface AssignedItem {
  itemId: string;                    // ID of the assigned item
  itemType: AssignedItemType;        // The type of item (e.g. 'rfi', 'issue')
  projectId: string;                 // The Project the item belongs to
  toolKey: ToolKey;                  // The Tool the item belongs to
  assigneeId: string;                // The User assigned to this item
  dueDate: Date | null;              // Due date of the item, if set
  completedAt: Date | null;          // null until the item is marked complete
}

/**
 * ASSIGNED ITEM TYPE
 * The category of item that can be assigned to a user.
 */
type AssignedItemType =
  | 'rfi'
  | 'submittal'
  | 'issue'
  | 'inspection'
  | 'punch_list_item'
  | 'change_order'
  | 'meeting_action_item'
  | 'document_review'
  | 'daily_log';
