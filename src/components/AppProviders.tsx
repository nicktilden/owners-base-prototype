/**
 * APP PROVIDERS
 * Wraps the entire app in all required context providers and loads seed data.
 * Must be client-side only (no SSR) due to styled-components + core-react.
 */

import React, { useEffect } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { PersonaProvider, usePersona } from '@/context/PersonaContext';
import { LevelProvider } from '@/context/LevelContext';
import { DataProvider, useData } from '@/context/DataContext';

// Seed data imports — loaded once at app root
import { account } from '@/data/seed/account';
import { activeUser } from '@/data/seed/activeUser';
import { users } from '@/data/seed/users';
import { projects } from '@/data/seed/projects';
import { wbsItems } from '@/data/seed/wbs';
import { hubs } from '@/data/seed/hubs';
import { budgetLineItems } from '@/data/seed/budget';
import { scheduleEntries } from '@/data/seed/schedule';
import { tasks } from '@/data/seed/tasks';
import { documents } from '@/data/seed/documents';
import { assets } from '@/data/seed/assets';
import { actionPlans } from '@/data/seed/action_plans';

function SeedLoader({ children }: { children: React.ReactNode }) {
  const { setData } = useData();
  const { setUsers, setActiveUser } = usePersona();

  useEffect(() => {
    setData({
      account,
      users,
      projects,
      wbs: wbsItems,
      hubs,
      budget: budgetLineItems,
      schedule: scheduleEntries,
      tasks,
      documents,
      assets,
      actionPlans,
    });
    setUsers(users);
    setActiveUser(activeUser);
  }, []);

  return <>{children}</>;
}

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <DataProvider>
        <PersonaProvider>
          <LevelProvider>
            <SeedLoader>
              {children}
            </SeedLoader>
          </LevelProvider>
        </PersonaProvider>
      </DataProvider>
    </ThemeProvider>
  );
}
