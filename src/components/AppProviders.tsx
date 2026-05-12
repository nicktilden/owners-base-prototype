/**
 * APP PROVIDERS
 * Wraps the entire app in all required context providers and loads seed data.
 * Must be client-side only (no SSR) due to styled-components + core-react.
 */

import React, { useEffect } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { createGlobalStyle } from 'styled-components';
import { PersonaProvider, usePersona } from '@/context/PersonaContext';
import { LevelProvider } from '@/context/LevelContext';
import { DataProvider, useData } from '@/context/DataContext';
import { AiPanelProvider } from '@/context/AiPanelContext';
import { ConnectionProvider } from '@/context/ConnectionContext';
import { HubLoadingProvider } from '@/context/HubLoadingContext';
import { HeaderActionsProvider } from '@/context/HeaderActionsContext';
import { RiskTagsProvider } from '@/context/RiskTagsContext';
import { ManualRiskItemsProvider } from '@/context/ManualRiskItemsContext';
import { ConnectDataProvider } from '@/context/ConnectDataContext';
import { HealthConfigProvider } from '@/context/HealthConfigContext';
import dynamic from 'next/dynamic';

const AiChatPanel = dynamic(() => import('@/components/AiChatPanel'), { ssr: false });
const DevResetButton = dynamic(() => import('@/components/DevResetButton'), { ssr: false });

const TearsheetAnimationOverride = createGlobalStyle`
  /* Tearsheet panel: use CSS transitions instead of keyframe animations */
  [class*="StyledTearsheetContent"] {
    animation: none !important;
    transition-property: width, transform !important;
    transition-duration: 200ms !important;
    transition-timing-function: ease !important;
  }

  /* Close button: no animation or delay */
  [class*="StyledButtonCard"] {
    animation: none !important;
    animation-delay: 0ms !important;
    transition: none !important;
    transition-delay: 0ms !important;
  }

  /* Scrim fade transition */
  [class*="sc-1ijdug2-0"] {
    transition-duration: 200ms !important;
    transition-timing-function: ease !important;
  }
`;

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
import { rfis } from '@/data/seed/rfis';
import { specifications } from '@/data/seed/specifications';
import { riskTags } from '@/data/seed/riskTags';
import { manualRiskItems } from '@/data/seed/manualRiskItems';
import { connectedProjects } from '@/data/seed/connectedProjects';
import { healthSnapshotsByProject } from '@/data/seed/healthSnapshots';
import { observations } from '@/data/seed/observations';
import { submittals } from '@/data/seed/submittals';
import { changeEvents } from '@/data/seed/change_events';
import { primeContracts } from '@/data/seed/prime_contracts';
import { fundingSource as fundingSources } from '@/data/seed/funding_source';
import { incidents } from '@/data/seed/incidents';
import { workHours } from '@/data/seed/work_hours';
import { automationRules } from '@/data/seed/automationRules';

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
      rfis,
      specifications,
      riskTags,
      manualRiskItems,
      connectedProjects,
      healthSnapshotsByProject,
      observations,
      submittals,
      changeEvents,
      primeContracts,
      fundingSources,
      budgetLineItems,
      scheduleEntries,
      incidents,
      workHours,
      automationRules,
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
            <ConnectionProvider>
              <HealthConfigProvider>
              <RiskTagsProvider>
              <ManualRiskItemsProvider>
              <ConnectDataProvider>
              <AiPanelProvider>
                <HeaderActionsProvider>
                <HubLoadingProvider>
                  <TearsheetAnimationOverride />
                  <SeedLoader>
                    {children}
                    <AiChatPanel />
                    <DevResetButton />
                  </SeedLoader>
                </HubLoadingProvider>
                </HeaderActionsProvider>
              </AiPanelProvider>
              </ConnectDataProvider>
              </ManualRiskItemsProvider>
              </RiskTagsProvider>
              </HealthConfigProvider>
            </ConnectionProvider>
          </LevelProvider>
        </PersonaProvider>
      </DataProvider>
    </ThemeProvider>
  );
}
