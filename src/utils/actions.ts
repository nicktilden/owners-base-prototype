/**
 * ACTION UTILITIES
 * Runtime filtering, permission checks, and cooldown logic for hub actions.
 */

import type { HubAction, ActionRole, ActionCardType, ActionExecution } from '@/types/actions';
import { ACTION_CATALOG, OBJECT_SPECIFIC_ACTIONS, COMMON_ACTIONS } from '@/data/actions';

/**
 * Returns true if the action is available to the given role.
 */
export function isActionPermitted(action: HubAction, userRoles: ActionRole[]): boolean {
  if (action.permitted_roles === 'all') return true;
  return userRoles.some((role) => action.permitted_roles.includes(role));
}

/**
 * Returns true if the action is relevant to the given card type.
 */
export function isActionRelevantToCard(action: HubAction, cardType: ActionCardType): boolean {
  if (action.card_types === 'all') return true;
  return action.card_types.includes(cardType);
}

/**
 * Returns true if the action is within its cooldown window for the given item.
 */
export function isActionOnCooldown(
  action: HubAction,
  lastExecutedAt: Date | undefined,
  now: Date = new Date()
): boolean {
  if (!action.cooldown_hours || !lastExecutedAt) return false;
  const cooldownMs = action.cooldown_hours * 60 * 60 * 1000;
  return now.getTime() - lastExecutedAt.getTime() < cooldownMs;
}

/**
 * Formats a human-readable cooldown label, e.g. "Sent 3h ago".
 */
export function getCooldownLabel(lastExecutedAt: Date, now: Date = new Date()): string {
  const diffMs = now.getTime() - lastExecutedAt.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffHours >= 1) return `Sent ${diffHours}h ago`;
  if (diffMinutes >= 1) return `Sent ${diffMinutes}m ago`;
  return 'Sent just now';
}

export interface ActionRailContext {
  cardType: ActionCardType;
  userRoles: ActionRole[];
  /** Map of action_id → last execution timestamp for cooldown checks */
  executionHistory?: Record<string, Date>;
  /** Whether the current user is the assignee of the selected item */
  currentUserIsAssignee?: boolean;
}

export interface ActionRailResult {
  /** Up to 3 object-specific actions for the primary rail */
  primary: HubAction[];
  /** Common actions for the secondary rail */
  secondary: HubAction[];
}

/**
 * Computes the actions to display in the two-tier action rail
 * given the current card context and user roles.
 */
export function getActionsForRail(ctx: ActionRailContext): ActionRailResult {
  const { cardType, userRoles, executionHistory = {}, currentUserIsAssignee = false } = ctx;

  const primary = OBJECT_SPECIFIC_ACTIONS
    .filter((a) => isActionRelevantToCard(a, cardType))
    .filter((a) => isActionPermitted(a, userRoles))
    .slice(0, 3);

  const secondary = COMMON_ACTIONS
    .filter((a) => isActionPermitted(a, userRoles))
    .map((a) => {
      if (a.action_id === 'common-nudge-assignee' && currentUserIsAssignee) {
        return null;
      }
      return a;
    })
    .filter(Boolean) as HubAction[];

  return { primary, secondary };
}

/**
 * Looks up a single action by ID.
 */
export function getActionById(actionId: string): HubAction | undefined {
  return ACTION_CATALOG.find((a) => a.action_id === actionId);
}

/**
 * Returns all actions for a given card type, regardless of role.
 * Useful for admin/configuration views.
 */
export function getActionsForCardType(cardType: ActionCardType): HubAction[] {
  return ACTION_CATALOG.filter((a) => isActionRelevantToCard(a, cardType));
}
