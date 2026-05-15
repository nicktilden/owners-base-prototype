import type { User } from '@/types/user';
import { users } from './users';

// Default active user: Bridget O'Sullivan — Senior Project Manager
export const activeUser: User = users.find((u) => u.id === 'user-009')!;
