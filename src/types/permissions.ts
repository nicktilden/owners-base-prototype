/**
 * PERMISSIONS TYPES
 */

import type { ToolKey } from './tools';

export type ToolPermissionLevel = 'none' | 'read' | 'update' | 'create' | 'admin';

export type UserToolPermissions = Partial<Record<ToolKey, ToolPermissionLevel>>;

export type PermissionKey =
  | 'platform:access'
  | 'account:read'
  | 'account:update'
  | 'account:manage_billing'
  | 'users:invite'
  | 'users:remove'
  | 'users:update_role'
  | 'users:update_permissions'
  | 'projects:create'
  | 'projects:read'
  | 'projects:update'
  | 'projects:delete'
  | 'projects:manage_members'
  | 'tools:enable'
  | 'tools:disable';

export type RolePermissionMap = Record<string, PermissionKey[]>;
export type RoleToolPermissionMap = Record<string, UserToolPermissions>;

// Permission tier for numeric comparison
export const PERMISSION_TIER: Record<ToolPermissionLevel, number> = {
  none:   0,
  read:   1,
  update: 2,
  create: 3,
  admin:  4,
};

// Role tool permission defaults
export const EXECUTIVE_TOOL_PERMISSIONS: UserToolPermissions = {
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

export const ADMIN_TOOL_PERMISSIONS: UserToolPermissions = {
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

export const MANAGER_TOOL_PERMISSIONS: UserToolPermissions = {
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

export const FIELD_TOOL_PERMISSIONS: UserToolPermissions = {
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

export const BOARD_TOOL_PERMISSIONS: UserToolPermissions = {
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

export const OPERATOR_TOOL_PERMISSIONS: UserToolPermissions = {
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

import type { UserRole } from './user';

export const ROLE_TOOL_PERMISSION_MAP: Record<UserRole, UserToolPermissions> = {
  'Executive Strategy': EXECUTIVE_TOOL_PERMISSIONS,
  'Operations & Administration': ADMIN_TOOL_PERMISSIONS,
  'Project Delivery': MANAGER_TOOL_PERMISSIONS,
  'Field Opperations': FIELD_TOOL_PERMISSIONS,
};
