/**
 * PERMISSION UTILITIES
 * Resolution order: roleDefaults → granted → denied
 */

import type { User } from '@/types/user';
import type { ToolKey } from '@/types/tools';
import type { ToolPermissionLevel, PermissionKey } from '@/types/permissions';
import { PERMISSION_TIER } from '@/types/permissions';

export function getEffectiveToolPermission(
  user: User,
  tool: ToolKey
): ToolPermissionLevel {
  const { toolDenied, toolGranted, toolDefaults } = user.permissions;
  if (toolDenied.includes(tool)) return 'none';
  if (toolGranted[tool] !== undefined) return toolGranted[tool]!;
  return toolDefaults[tool] ?? 'none';
}

export function hasToolPermission(
  user: User,
  tool: ToolKey,
  required: ToolPermissionLevel
): boolean {
  const effective = getEffectiveToolPermission(user, tool);
  return PERMISSION_TIER[effective] >= PERMISSION_TIER[required];
}

export function canAccessTool(user: User, tool: ToolKey): boolean {
  return getEffectiveToolPermission(user, tool) !== 'none';
}

export function hasPermissionKey(user: User, key: PermissionKey): boolean {
  const { keyDenied, keyGranted, keyDefaults } = user.permissions;
  if (keyDenied.includes(key)) return false;
  if (keyGranted.includes(key)) return true;
  return keyDefaults.includes(key);
}
