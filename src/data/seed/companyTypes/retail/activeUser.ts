/**
 * ACTIVE USER
 * The default logged-in user for this prototype session.
 * Replace this import in UserContext to change the active perspective.
 * A runtime persona switcher will supersede this file when implemented.
 *
 * Active user: Katherine Marsh (CEO) — user-001
 */
import { users } from './users';

export const activeUser = users.find(u => u.id === 'user-001')!;
