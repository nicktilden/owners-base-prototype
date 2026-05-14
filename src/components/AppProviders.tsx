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
import { CompanyTypeProvider } from '@/context/CompanyTypeContext';
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

// Seed data imports — resolved from the active company type at module init.
// All imports come from the companyTypes barrel, which reads localStorage
// and returns the matching dataset. Adding a new company type only requires
// adding its directory — this file does not need to change.
import {
  account,
  activeUser,
  users,
  projects,
  wbsItems,
  hubs,
  budgetLineItems,
  scheduleEntries,
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
  fundingSource as fundingSources,
  incidents,
  workHours,
  automationRules,
} from '@/data/seed/companyTypes';

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
    <CompanyTypeProvider>
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
    </CompanyTypeProvider>
  );
}
