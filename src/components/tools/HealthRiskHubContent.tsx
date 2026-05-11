/**
 * HEALTH & RISK HUB CONTENT
 * New hub view with 4 portfolio tabs and 3 project tabs.
 * Portfolio tabs: Overview | Supply Chain | Financial | Operations
 * Project tabs: Overview | Supply Chain | Financial | Operations
 * (project scope filters cards to a single projectId)
 */

import React, { useState } from 'react';
import { Tabs } from '@procore/core-react';
import { ShieldStar } from '@procore/core-icons';
import ToolPageLayout from '@/components/tools/ToolPageLayout';
import HubsContentLayout from '@/components/hubs/HubsContentLayout';

// Supply Chain cards
import SubmittalAgingCard from '@/components/health/cards/SubmittalAgingCard';
import CriticalPathSubmittalsCard from '@/components/health/cards/CriticalPathSubmittalsCard';
import SeasonalRiskCard from '@/components/health/cards/SeasonalRiskCard';
import VendorReliabilityCard from '@/components/health/cards/VendorReliabilityCard';

// Financial cards
import ContingencyBurnCard from '@/components/health/cards/ContingencyBurnCard';
import ScheduleCostDivergenceCard from '@/components/health/cards/ScheduleCostDivergenceCard';
import ForecastAtCompletionCard from '@/components/health/cards/ForecastAtCompletionCard';
import PendingCEExposureCard from '@/components/health/cards/PendingCEExposureCard';
import CapitalAtRiskCard from '@/components/health/cards/CapitalAtRiskCard';

// Operations/Safety cards
import OSHARateCard from '@/components/health/cards/OSHARateCard';
import HazardousConditionsCard from '@/components/health/cards/HazardousConditionsCard';
import NearMissTrendCard from '@/components/health/cards/NearMissTrendCard';
import HighRiskActivityHorizonCard from '@/components/health/cards/HighRiskActivityHorizonCard';
import IncidentCostExposureCard from '@/components/health/cards/IncidentCostExposureCard';

// Existing overview cards
import HealthSummaryCard from '@/components/health/cards/HealthSummaryCard';
import RiskRegisterCard from '@/components/health/cards/RiskRegisterCard';
import RiskCategoryDonutCard from '@/components/health/cards/RiskCategoryDonutCard';
import RiskByTypeBarCard from '@/components/health/cards/RiskByTypeBarCard';
import TopRiskProjectsCard from '@/components/health/cards/TopRiskProjectsCard';
import PortfolioRiskGaugeCard from '@/components/health/cards/PortfolioRiskGaugeCard';

const PORTFOLIO_TABS = ['Overview', 'Supply Chain', 'Financial', 'Operations'] as const;
type PortfolioTab = typeof PORTFOLIO_TABS[number];

const PROJECT_TABS = ['Overview', 'Supply Chain', 'Financial', 'Operations'] as const;
type ProjectTab = typeof PROJECT_TABS[number];

interface Props {
  scope?: 'portfolio' | 'project';
  projectId?: string;
}

export default function HealthRiskHubContent({ scope = 'portfolio', projectId }: Props) {
  const [activeTab, setActiveTab] = useState<PortfolioTab | ProjectTab>('Overview');

  const tabs = scope === 'portfolio' ? PORTFOLIO_TABS : PROJECT_TABS;
  const title = scope === 'project' ? 'Health & Risk' : 'Portfolio Health & Risk';
  const breadcrumbs = scope === 'project' && projectId
    ? [{ label: 'Portfolio', href: '/portfolio' }, { label: 'Project', href: `/project/${projectId}/overview` }]
    : [{ label: 'Portfolio', href: '/portfolio' }];

  const tabBar = (
    <Tabs>
      {tabs.map(tab => (
        <Tabs.Tab key={tab} role="button" selected={activeTab === tab} onPress={() => setActiveTab(tab)}>
          {tab}
        </Tabs.Tab>
      ))}
    </Tabs>
  );

  return (
    <ToolPageLayout
      title={title}
      icon={<ShieldStar size="md" />}
      breadcrumbs={breadcrumbs}
      tabs={tabBar}
    >
      <div style={{ padding: '24px', background: 'var(--color-surface-secondary)', minHeight: 'calc(100vh - 160px)' }}>
        {activeTab === 'Overview' && (
          <>
            {scope === 'portfolio' ? (
              <>
                <HubsContentLayout>
                  <HubsContentLayout.Row variant="cards">
                    <PortfolioRiskGaugeCard />
                    <HealthSummaryCard scope="portfolio" />
                    <TopRiskProjectsCard />
                  </HubsContentLayout.Row>
                  <HubsContentLayout.Row variant="cards" columnsTemplate="1fr 1fr">
                    <RiskRegisterCard scope="portfolio" />
                    <RiskCategoryDonutCard scope="portfolio" />
                  </HubsContentLayout.Row>
                  <HubsContentLayout.Row variant="cards">
                    <RiskByTypeBarCard scope="portfolio" />
                  </HubsContentLayout.Row>
                </HubsContentLayout>
              </>
            ) : (
              <HubsContentLayout>
                <HubsContentLayout.Row variant="cards">
                  <HealthSummaryCard scope="project" projectId={projectId} />
                  <RiskCategoryDonutCard scope="project" projectId={projectId} />
                </HubsContentLayout.Row>
                <HubsContentLayout.Row variant="cards">
                  <RiskRegisterCard scope="project" projectId={projectId} />
                </HubsContentLayout.Row>
              </HubsContentLayout>
            )}
          </>
        )}

        {activeTab === 'Supply Chain' && (
          <HubsContentLayout>
            <HubsContentLayout.Row variant="cards" columnsTemplate="1fr 1fr">
              <SubmittalAgingCard scope={scope} projectId={projectId} />
              <CriticalPathSubmittalsCard scope={scope} projectId={projectId} />
            </HubsContentLayout.Row>
            <HubsContentLayout.Row variant="cards" columnsTemplate="1fr 1fr">
              <VendorReliabilityCard scope={scope} projectId={projectId} />
              <SeasonalRiskCard scope={scope} projectId={projectId} />
            </HubsContentLayout.Row>
          </HubsContentLayout>
        )}

        {activeTab === 'Financial' && (
          <HubsContentLayout>
            <HubsContentLayout.Row variant="cards" columnsTemplate="1fr 1fr">
              <CapitalAtRiskCard scope={scope} projectId={projectId} />
              <PendingCEExposureCard scope={scope} projectId={projectId} />
            </HubsContentLayout.Row>
            <HubsContentLayout.Row variant="cards" columnsTemplate="1fr 1fr">
              <ContingencyBurnCard scope={scope} projectId={projectId} />
              <ForecastAtCompletionCard scope={scope} projectId={projectId} />
            </HubsContentLayout.Row>
            <HubsContentLayout.Row variant="cards">
              <ScheduleCostDivergenceCard scope={scope} projectId={projectId} />
            </HubsContentLayout.Row>
          </HubsContentLayout>
        )}

        {activeTab === 'Operations' && (
          <HubsContentLayout>
            <HubsContentLayout.Row variant="cards" columnsTemplate="1fr 1fr">
              <OSHARateCard scope={scope} projectId={projectId} />
              <NearMissTrendCard scope={scope} projectId={projectId} />
            </HubsContentLayout.Row>
            <HubsContentLayout.Row variant="cards" columnsTemplate="1fr 1fr">
              <HazardousConditionsCard scope={scope} projectId={projectId} />
              <HighRiskActivityHorizonCard scope={scope} projectId={projectId} />
            </HubsContentLayout.Row>
            <HubsContentLayout.Row variant="cards">
              <IncidentCostExposureCard scope={scope} projectId={projectId} />
            </HubsContentLayout.Row>
          </HubsContentLayout>
        )}
      </div>
    </ToolPageLayout>
  );
}
