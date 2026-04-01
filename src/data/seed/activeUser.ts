/**
 * ACTIVE USER
 * The default logged-in user for this prototype session.
 * Replace this import in UserContext to change the active perspective.
 * A runtime persona switcher will supersede this file when implemented.
 *
 * Active user: Bridget O'Sullivan (Director of Construction) — user-009
 */
import { users } from './users';

export const activeUser = users.find(u => u.id === 'user-009')!;
