/**
 * ACTIVE USER
 * Default logged-in user for Vantage Data Centers prototype session.
 * Active user: Bridget O'Sullivan (Director of Critical Facilities) — user-009
 */
import { users } from './users';

export const activeUser = users.find(u => u.id === 'user-009')!;
