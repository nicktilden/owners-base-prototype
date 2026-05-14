import type { User } from '@/types/user';
import { users } from './users';

export const activeUser: User = users.find((u) => u.id === 'user-009')!;
