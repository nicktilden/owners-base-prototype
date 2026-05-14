/**
 * ACTIVE USER
 * Default logged-in user for University of Nebraska–Lincoln prototype session.
 * Active user: Bridget O'Sullivan (Director of Capital Projects) — user-009
 */
import { users } from './users';

export const activeUser = users.find(u => u.id === 'user-009')!;
