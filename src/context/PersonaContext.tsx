/**
 * PERSONA CONTEXT
 * Manages the active user persona. Used throughout the app to gate
 * tool access, filter data, and render permission-aware UI.
 */

import React, { createContext, useContext, useState } from 'react';
import type { User } from '@/types/user';

interface PersonaContextValue {
  activeUser: User | null;
  setActiveUser: (user: User) => void;
  users: User[];
  setUsers: (users: User[]) => void;
}

const PersonaContext = createContext<PersonaContextValue | null>(null);

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [activeUser, setActiveUser] = useState<User | null>(null);

  return (
    <PersonaContext.Provider value={{ activeUser, setActiveUser, users, setUsers }}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona(): PersonaContextValue {
  const ctx = useContext(PersonaContext);
  if (!ctx) throw new Error('usePersona must be used within PersonaProvider');
  return ctx;
}
