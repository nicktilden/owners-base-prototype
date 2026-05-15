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
import { HorizonProvider } from '@/context/HorizonContext';
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

// Seed data is loaded dynamically inside SeedLoader so that localStorage is
// read client-side. A static top-level import would be evaluated during SSR
// where window is undefined, causing getActiveType() to always return the
// default and ignore the stored company type selection.

function SeedLoader({ children }: { children: React.ReactNode }) {
  const { setData } = useData();
  const { setUsers, setActiveUser } = usePersona();

  useEffect(() => {
    import('@/data/seed/companyTypes').then((ds) => {
      setData({
        account: ds.account,
        users: ds.users,
        projects: ds.projects,
        wbs: ds.wbsItems,
        hubs: ds.hubs,
        budget: ds.budgetLineItems,
        schedule: ds.scheduleEntries,
        tasks: ds.tasks,
        documents: ds.documents,
        assets: ds.assets,
        actionPlans: ds.actionPlans,
        rfis: ds.rfis,
        specifications: ds.specifications,
        riskTags: ds.riskTags,
        manualRiskItems: ds.manualRiskItems,
        connectedProjects: ds.connectedProjects,
        healthSnapshotsByProject: ds.healthSnapshotsByProject,
        observations: ds.observations,
        submittals: ds.submittals,
        changeEvents: ds.changeEvents,
        primeContracts: ds.primeContracts,
        fundingSources: ds.fundingSource,
        budgetLineItems: ds.budgetLineItems,
        scheduleEntries: ds.scheduleEntries,
        incidents: ds.incidents,
        workHours: ds.workHours,
        automationRules: ds.automationRules,
      });
      setUsers(ds.users);
      setActiveUser(ds.activeUser);
    });
  }, []);

  return <>{children}</>;
}

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <CompanyTypeProvider>
    <HorizonProvider>
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
    </HorizonProvider>
    </CompanyTypeProvider>
  );
}
