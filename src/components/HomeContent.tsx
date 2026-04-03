import { useState } from "react";
import { Button, ToolLandingPage, H1, Title, Tabs } from "@procore/core-react";
import { Home, Plus } from "@procore/core-icons";
import styled from "styled-components";
import GlobalHeader from "@/components/nav/GlobalHeader";
import AppLayout from "@/components/nav/AppLayout";
import MyOpenItemsCard from "@/components/MyOpenItemsCard";
import AIDailyPlannerCard from "@/components/AIDailyPlannerCard";
import ProjectsTableCard from "@/components/ProjectsTableCard";
import ScheduleHeatmapCard from "@/components/ScheduleHeatmapCard";
import CostManagementTableCard from "@/components/CostManagementTableCard";
import HubsContentLayout from "@/components/hubs/HubsContentLayout";
import { ScheduleRiskGHubCard, ScheduleVariance2HubCard } from "@/components/ScheduleInsightsHubCards";
import { FinancialScorecardCard, InvoicesForApprovalCard } from "@/components/FinancialHubCards";

const tabs = ["My Work", "Cost Management", "Schedule & Milestones"] as const;
type TabName = typeof tabs[number];

export default function HomeContent() {
  const [activeTab, setActiveTab] = useState<TabName>("My Work");

  return (
    <>
      <GlobalHeader />
      <AppLayout>
      <ToolLandingPage>
        <ToolLandingPage.Main>
          <ToolLandingPage.Header>
            <ToolLandingPage.Title>
              <Title>
                <Title.Text>
                  <H1 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Home size="md" />
                    Home
                  </H1>
                </Title.Text>
                <Title.Actions>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button variant="primary" icon={<Plus />}>Create Project</Button>
                    <Button variant="secondary">Export</Button>
                  </div>
                </Title.Actions>
              </Title>
            </ToolLandingPage.Title>
            <ToolLandingPage.Tabs>
              <Tabs>
                {tabs.map((tab) => (
                  <Tabs.Tab
                    key={tab}
                    selected={activeTab === tab}
                    onPress={() => setActiveTab(tab)}
                    role="button"
                  >
                    <Tabs.Link>{tab}</Tabs.Link>
                  </Tabs.Tab>
                ))}
              </Tabs>
            </ToolLandingPage.Tabs>
          </ToolLandingPage.Header>
          <ToolLandingPage.Body>
            {activeTab === "My Work" && (
              <HubsContentLayout>
                <HubsContentLayout.Row>
                  <MyOpenItemsCard />
                  <AIDailyPlannerCard />
                </HubsContentLayout.Row>
                <HubsContentLayout.Row variant="table">
                  <ProjectsTableCard />
                </HubsContentLayout.Row>
              </HubsContentLayout>
            )}
            {activeTab === "Cost Management" && (
              <HubsContentLayout>
                <HubsContentLayout.Row columnsTemplate="minmax(0, 1fr) 440px">
                  <FinancialScorecardCard />
                  <InvoicesForApprovalCard />
                </HubsContentLayout.Row>
                <HubsContentLayout.Row variant="table">
                  <CostManagementTableCard />
                </HubsContentLayout.Row>
              </HubsContentLayout>
            )}
            {activeTab === "Schedule & Milestones" && (
              <HubsContentLayout>
                <HubsContentLayout.Row>
                  <ScheduleRiskGHubCard />
                  <ScheduleVariance2HubCard />
                </HubsContentLayout.Row>
                <HubsContentLayout.Row variant="table">
                  <ScheduleHeatmapCard />
                </HubsContentLayout.Row>
              </HubsContentLayout>
            )}
          </ToolLandingPage.Body>
        </ToolLandingPage.Main>
      </ToolLandingPage>
      </AppLayout>
    </>
  );
}
