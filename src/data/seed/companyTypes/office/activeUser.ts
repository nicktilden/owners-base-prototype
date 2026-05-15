/**
 * ACTIVE USER — Empire State Realty Trust
 * Default logged-in user for this prototype session.
 */
import { users } from './users';

export const activeUser = users.find(u => u.id === 'user-001')!;
