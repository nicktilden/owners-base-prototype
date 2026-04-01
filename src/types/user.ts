/**
 * USER TYPES
 */

import type { ToolKey } from './tools';
import type { ToolPermissionLevel, UserToolPermissions, PermissionKey } from './permissions';

export type UserRole =
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

export interface UserPermissions {
  toolDefaults: UserToolPermissions;
  toolGranted: UserToolPermissions;
  toolDenied: ToolKey[];
  keyDefaults: PermissionKey[];
  keyGranted: PermissionKey[];
  keyDenied: PermissionKey[];
}

export interface UserFavorites {
  projectIds: string[];
  toolKeys: ToolKey[];
}

export interface User {
  id: string;
  accountId: string;
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  avatar: string | null;
  role: UserRole;
  projectIds: string[];
  permissions: UserPermissions;
  favorites: UserFavorites;
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date | null;
}

export type AssignedItemType =
  | 'rfi'
  | 'submittal'
  | 'issue'
  | 'inspection'
  | 'punch_list_item'
  | 'change_order'
  | 'meeting_action_item'
  | 'document_review'
  | 'daily_log';

export interface AssignedItem {
  itemId: string;
  itemType: AssignedItemType;
  projectId: string;
  toolKey: ToolKey;
  assigneeId: string;
  dueDate: Date | null;
  completedAt: Date | null;
}
