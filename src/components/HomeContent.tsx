import { useState, useRef, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import styled, { createGlobalStyle } from "styled-components";
import { Button, Dropdown, Modal, ToolLandingPage, H1, Title, ToggleButton, Switch, Typography } from "@procore/core-react";
import { Home, Plus, Filter, EllipsisVertical, Check } from "@procore/core-icons";
import GlobalHeader from "@/components/nav/GlobalHeader";
import AppLayout from "@/components/nav/AppLayout";
import MyOpenItemsCard from "@/components/MyOpenItemsCard";
import RiskScorecardCard from "@/components/RiskScorecardCard";
import AIDailyPlannerCard from "@/components/AIDailyPlannerCard";
import ProjectsTableCard from "@/components/ProjectsTableCard";
import ScheduleHeatmapCard from "@/components/ScheduleHeatmapCard";
import CostManagementTableCard from "@/components/CostManagementTableCard";
import HubsContentLayout from "@/components/hubs/HubsContentLayout";
import { ScheduleRiskGHubCard, ScheduleVariance2HubCard, ProjectsByStageHubCard } from "@/components/ScheduleInsightsHubCards";
import { FinancialScorecardCard, InvoicesForApprovalCard } from "@/components/FinancialHubCards";
import {
  ActionPlansPortfolioMatrixHubCard,
  ActionPlansTemplateAdoptionHubCard,
  ActionPlansOverdueItemsHubCard,
} from "@/components/ActionPlansExplorationHubCards";
import { AssetsHubCard } from "@/components/AssetsHubCard";
import {
  APv2FullMatrixHubCard,
  APv2KpiDashboardHubCard,
  APv2ProjectCardsHubCard,
} from "@/components/ActionPlansExploration2HubCards";
import { HubFilterProvider, useHubFilters } from "@/context/HubFilterContext";
import { useHorizon } from "@/context/HorizonContext";
import { ReleaseTimeframe } from "@/types/features";
import HubFilterBar from "@/components/HubFilterBar";
import { useResetScrollOnTabChange } from "@/hooks/useResetScrollOnTabChange";
import HealthSummaryCard from "@/components/health/cards/HealthSummaryCard";
import TopRiskProjectsCard from "@/components/health/cards/TopRiskProjectsCard";
import PortfolioRiskGaugeCard from "@/components/health/cards/PortfolioRiskGaugeCard";
import HealthKPIGridCard from "@/components/health/cards/HealthKPIGridCard";
import PortfolioRiskTableCard from "@/components/health/cards/PortfolioRiskTableCard";

const tabs = ["Portfolio Performance", "My Work", "Health & Risk", "Schedule & Milestones", "Ideas Hub"] as const;
type TabName = typeof tabs[number];

// Horizon timeframe for each tab. Omitted === 'now'.
// Seed verification: "Ideas Hub" tagged 'future'.
const TAB_TIMEFRAMES: Partial<Record<TabName, ReleaseTimeframe>> = {
  "Ideas Hub": "future",
};

// Horizon timeframe for individual cards within a tab. Omitted === 'now'.
// Seed verification: "Invoices for Approval" tagged 'next'.
const CARD_TIMEFRAMES: Partial<Record<TabName, Partial<Record<string, ReleaseTimeframe>>>> = {
  "Ideas Hub": {
    "Invoices for Approval": "next",
  },
};

// Default tabs that start hidden — users can toggle them on via the + menu
const DEFAULT_HIDDEN_TABS = new Set<TabName>(["Ideas Hub"]);

// ─── Custom tab bar styled to match @procore/core-react Tabs ─────────────────
// Uses the same colors/spacing as Tabs internals so it's visually identical,
// but renders as plain divs so a <button> inside is never a nested-button violation.

const TabBarList = styled.div`
  display: flex;
  align-items: stretch;
  gap: 0;
`;

const TabItem = styled.div<{ $selected: boolean }>`
  display: inline-flex;
  align-items: center;
  position: relative;
  cursor: pointer;
  border-radius: 4px 4px 0 0;
  background: transparent;
  border: none;
  height: 26px;
  padding: 0;
  margin-left: 0;

  & + & {
    margin-left: 24px;
  }

  &:hover {
    background: hsl(200, 8%, 90%);
  }

  ${({ $selected }) =>
    $selected
      ? `border-bottom: 3px solid hsl(200, 8%, 15%);`
      : ""}
`;

const TabInner = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 4px;
  height: 23px;
  border-radius: 4px 4px 0 0;
  font-size: 14px;
  font-weight: ${({ $selected }) => ($selected ? 600 : 400)};
  color: hsl(200, 8%, 15%);
  white-space: nowrap;
  user-select: none;
`;

const EllipsisBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  color: inherit;
  flex-shrink: 0;

  &:hover {
    background: rgba(0, 0, 0, 0.08);
  }
`;

const ViewsMenuWrap = styled.div<{ $top: number; $left: number }>`
  position: fixed;
  top: ${({ $top }) => $top}px;
  left: ${({ $left }) => $left}px;
  z-index: 1000;
  min-width: 220px;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-separator);
  overflow: hidden;
  padding: 4px 0;
`;

const ViewsMenuItem = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 14px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: var(--color-text-primary);
  text-align: left;
  gap: 8px;

  &:hover {
    background: var(--color-surface-secondary);
  }
`;

const ViewsMenuLabel = styled.span`
  flex: 1;
`;

const CheckIconWrap = styled.span`
  display: inline-flex;
  align-items: center;
  color: var(--color-text-primary);
  width: 16px;
  flex-shrink: 0;
`;

const AddViewBtnWrap = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
`;

// Force min-width on the Dropdown (ellipsis) popovers rendered in the tab bar
const TabDropdownMinWidth = createGlobalStyle`
  [class*="StyledDropdownMenu"] {
    min-width: 220px !important;
    max-width: none !important;
  }
`;

/** Card registry: the display name for each card per tab (order matches render order). */
const TAB_CARDS: Record<TabName, string[]> = {
  "My Work": ["My Open Items", "Projects by Stage", "Projects Table"],
  "Health & Risk": ["Portfolio Health", "Cost Health", "Schedule Health", "Delivery Risk", "Health & Risk"],
  "Portfolio Performance": ["Risk KPIs", "Financial Scorecard", "Schedule Variance", "Assets by Type", "Action Plans Portfolio Matrix"],
  "Schedule & Milestones": ["Schedule Risk", "Action Plans Template", "Schedule Heatmap"],
  "Ideas Hub": [
    "Invoices for Approval",
    "AP v2 Full Matrix",
    "AI Daily Planner",
    "Overdue Action Items",
    "AP v2 KPI Dashboard",
    "AP v2 Project Cards",
    "Cost Management Table",
  ],
};

type HiddenCards = Record<TabName, Set<string>>;

function makeEmptyHidden(): HiddenCards {
  return {
    "My Work": new Set(),
    "Health & Risk": new Set(),
    "Portfolio Performance": new Set(["Schedule Variance"]),
    "Schedule & Milestones": new Set(),
    "Ideas Hub": new Set(),
  };
}

function HomeContentInner() {
  const [activeTab, setActiveTab] = useState<TabName>("Portfolio Performance");
  useResetScrollOnTabChange(activeTab);
  const [filterBarOpen, setFilterBarOpen] = useState(false);
  const { hasActiveFilters } = useHubFilters();
  const { isVisible } = useHorizon();

  // Edit view modal state
  const [editViewTab, setEditViewTab] = useState<TabName | null>(null);
  const [hiddenCards, setHiddenCards] = useState<HiddenCards>(makeEmptyHidden);

  // Hub views visibility (tabs) — start with the defaults hidden
  const [hiddenTabs, setHiddenTabs] = useState<Set<TabName>>(() => new Set(DEFAULT_HIDDEN_TABS));

  // Tabs visible under current horizon and user-hidden state
  const visibleTabs = tabs.filter(t => !hiddenTabs.has(t) && isVisible(TAB_TIMEFRAMES[t]));

  // If the active tab is no longer visible (horizon changed), fall back to first visible tab
  useEffect(() => {
    if (visibleTabs.length > 0 && !visibleTabs.includes(activeTab)) {
      setActiveTab(visibleTabs[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleTabs.join(','), activeTab]);
  const [viewsMenuOpen, setViewsMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const viewsMenuRef = useRef<HTMLDivElement>(null);
  const viewsBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!viewsMenuOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        viewsMenuRef.current && !viewsMenuRef.current.contains(e.target as Node) &&
        viewsBtnRef.current && !viewsBtnRef.current.contains(e.target as Node)
      ) {
        setViewsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [viewsMenuOpen]);

  function openViewsMenu() {
    if (viewsBtnRef.current) {
      const rect = viewsBtnRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 6,
        left: rect.left,
      });
    }
    setViewsMenuOpen(v => !v);
  }

  function toggleTabVisibility(tab: TabName) {
    setHiddenTabs(prev => {
      const next = new Set(prev);
      if (next.has(tab)) {
        next.delete(tab);
      } else {
        next.add(tab);
        // If the hidden tab was active, switch to the first visible tab
        if (activeTab === tab) {
          const firstVisible = tabs.find(t => !next.has(t));
          if (firstVisible) setActiveTab(firstVisible);
        }
      }
      return next;
    });
  }


  const isCardVisible = useCallback((tab: TabName, cardName: string) => {
    if (hiddenCards[tab].has(cardName)) return false;
    const cardTimeframe = CARD_TIMEFRAMES[tab]?.[cardName];
    return isVisible(cardTimeframe);
  }, [hiddenCards, isVisible]);

  function toggleCard(tab: TabName, cardName: string) {
    setHiddenCards((prev) => {
      const next = { ...prev, [tab]: new Set(prev[tab]) };
      if (next[tab].has(cardName)) {
        next[tab].delete(cardName);
      } else {
        next[tab].add(cardName);
      }
      return next;
    });
  }

  function handleMenuAction(action: string) {
    if (action === "edit_view") {
      setEditViewTab(activeTab);
    }
  }

  return (
    <>
      <TabDropdownMinWidth />
      <GlobalHeader />
      <AppLayout>
      <ToolLandingPage>
        <ToolLandingPage.Main>
          <ToolLandingPage.Header style={{ borderBottom: '1px solid var(--color-card-border)' }}>
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
                    <Button variant="primary" className="b_primary" icon={<Plus />}>Create Project</Button>
                    <Button variant="secondary" className="b_secondary" data-variant="secondary">Export</Button>
                  </div>
                </Title.Actions>
              </Title>
            </ToolLandingPage.Title>
            <ToolLandingPage.Tabs>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ToggleButton
                  className="b_toggle"
                  selected={filterBarOpen}
                  size="sm"
                  icon={<Filter />}
                  onClick={() => setFilterBarOpen((v) => !v)}
                >
                  Filter{hasActiveFilters ? " •" : ""}
                </ToggleButton>
                <div style={{ width: 2, height: 20, background: "var(--color-border-separator)", borderRadius: 1, flexShrink: 0 }} />
                <TabBarList className="Tabs__TabsList">
                  {visibleTabs.map((tab) => {
                    const isActive = activeTab === tab;
                    return (
                      <TabItem
                        key={tab}
                        $selected={isActive}
                        data-active={isActive || undefined}
                        onClick={() => setActiveTab(tab)}
                      >
                        <TabInner $selected={isActive}>
                          {tab}
                          {isActive && (
                            <Dropdown
                              label=""
                              icon={<EllipsisVertical size="sm" />}
                              onSelect={({ item }) => handleMenuAction(item as string)}
                              onClick={(e) => e.stopPropagation()}
                              variant="tertiary"
                              size="sm"
                              style={{ width: 20, height: 20, padding: 0, minWidth: 0 }}
                              aria-label={`${tab} options`}
                            >
                              <Dropdown.Item item="rename">Rename</Dropdown.Item>
                              <Dropdown.Item item="edit_view">Edit</Dropdown.Item>
                              <Dropdown.Item item="share">Share</Dropdown.Item>
                              <Dropdown.Item item="duplicate">Duplicate</Dropdown.Item>
                              <Dropdown.Item item="delete">Delete</Dropdown.Item>
                            </Dropdown>
                          )}
                        </TabInner>
                      </TabItem>
                    );
                  })}
                </TabBarList>
                <div style={{ width: 2, height: 20, background: 'var(--color-border-separator)', borderRadius: 1, flexShrink: 0 }} />
                <AddViewBtnWrap ref={viewsBtnRef}>
                  <Button
                    variant="tertiary"
                    size="sm"
                    icon={<Plus size="sm" />}
                    aria-label="Manage hub views"
                    aria-haspopup="menu"
                    aria-expanded={viewsMenuOpen}
                    onClick={openViewsMenu}
                  />
                </AddViewBtnWrap>
                {viewsMenuOpen && typeof document !== 'undefined' && ReactDOM.createPortal(
                  <ViewsMenuWrap ref={viewsMenuRef} role="menu" $top={menuPos.top} $left={menuPos.left}>
                    {tabs.map(tab => {
                      const isTabOn = !hiddenTabs.has(tab);
                      return (
                        <ViewsMenuItem
                          key={tab}
                          role="menuitemcheckbox"
                          aria-checked={isTabOn}
                          onClick={() => toggleTabVisibility(tab)}
                        >
                          <ViewsMenuLabel>{tab}</ViewsMenuLabel>
                          <CheckIconWrap>
                            {isTabOn && <Check size="sm" />}
                          </CheckIconWrap>
                        </ViewsMenuItem>
                      );
                    })}
                  </ViewsMenuWrap>,
                  document.body
                )}
              </div>
            </ToolLandingPage.Tabs>
          </ToolLandingPage.Header>
          <ToolLandingPage.Body>
            {filterBarOpen && (
              <div style={{ marginBottom: 16 }}>
                <HubFilterBar />
              </div>
            )}
            {visibleTabs.length === 0 && (
              <div style={{ padding: 48, textAlign: 'center' }}>
                <Typography intent="body" color="gray45">No features in the current Horizon.</Typography>
              </div>
            )}
            {activeTab === "My Work" && (
              <HubsContentLayout>
                {isCardVisible("My Work", "My Open Items") || isCardVisible("My Work", "Projects by Stage") ? (
                  <HubsContentLayout.Row columnsTemplate="1fr minmax(0, 440px)">
                    {isCardVisible("My Work", "My Open Items") && <MyOpenItemsCard />}
                    {isCardVisible("My Work", "Projects by Stage") && <ProjectsByStageHubCard />}
                  </HubsContentLayout.Row>
                ) : null}
                {isCardVisible("My Work", "Projects Table") && (
                  <HubsContentLayout.Row variant="table">
                    <ProjectsTableCard />
                  </HubsContentLayout.Row>
                )}
              </HubsContentLayout>
            )}
            {activeTab === "Health & Risk" && (
              <HubsContentLayout>
                <HubsContentLayout.Row variant="table">
                  <RiskScorecardCard cardId="health-risk" defaultKPIs={['budgetVariance', 'rfisAtRisk', 'scheduleStatus', 'changeEvents']} />
                </HubsContentLayout.Row>
                <HubsContentLayout.Row columnsTemplate="2fr 1fr">
                  <TopRiskProjectsCard />
                  <PortfolioRiskGaugeCard />
                </HubsContentLayout.Row>
                <HubsContentLayout.Row variant="table">
                  <PortfolioRiskTableCard />
                </HubsContentLayout.Row>
              </HubsContentLayout>
            )}
            {activeTab === "Portfolio Performance" && (
              <HubsContentLayout>
                {isCardVisible("Portfolio Performance", "Risk KPIs") && (
                  <HubsContentLayout.Row>
                    <RiskScorecardCard cardId="portfolio-performance" />
                  </HubsContentLayout.Row>
                )}
                {isCardVisible("Portfolio Performance", "Financial Scorecard") || isCardVisible("Portfolio Performance", "Schedule Variance") || isCardVisible("Portfolio Performance", "Assets by Type") ? (
                  <HubsContentLayout.Row columnsTemplate="1fr 1fr">
                    {isCardVisible("Portfolio Performance", "Financial Scorecard") && <FinancialScorecardCard />}
                    {isCardVisible("Portfolio Performance", "Schedule Variance") && <ScheduleVariance2HubCard />}
                    {isCardVisible("Portfolio Performance", "Assets by Type") && <AssetsHubCard />}
                  </HubsContentLayout.Row>
                ) : null}
                {isCardVisible("Portfolio Performance", "Action Plans Portfolio Matrix") && (
                  <HubsContentLayout.Row variant="table">
                    <ActionPlansPortfolioMatrixHubCard />
                  </HubsContentLayout.Row>
                )}
              </HubsContentLayout>
            )}
            {activeTab === "Schedule & Milestones" && (
              <HubsContentLayout>
                {(isCardVisible("Schedule & Milestones", "Schedule Risk") || isCardVisible("Schedule & Milestones", "Action Plans Template")) && (
                  <HubsContentLayout.Row columnsTemplate="1fr 1fr">
                    {isCardVisible("Schedule & Milestones", "Schedule Risk") && <ScheduleRiskGHubCard />}
                    {isCardVisible("Schedule & Milestones", "Action Plans Template") && <ActionPlansTemplateAdoptionHubCard />}
                  </HubsContentLayout.Row>
                )}
                {isCardVisible("Schedule & Milestones", "Schedule Heatmap") && (
                  <HubsContentLayout.Row variant="table">
                    <ScheduleHeatmapCard />
                  </HubsContentLayout.Row>
                )}
              </HubsContentLayout>
            )}
            {activeTab === "Ideas Hub" && (
              <HubsContentLayout>
                {isCardVisible("Ideas Hub", "Invoices for Approval") || isCardVisible("Ideas Hub", "AP v2 Full Matrix") ? (
                  <HubsContentLayout.Row>
                    {isCardVisible("Ideas Hub", "Invoices for Approval") && <InvoicesForApprovalCard />}
                    {isCardVisible("Ideas Hub", "AP v2 Full Matrix") && <APv2FullMatrixHubCard />}
                  </HubsContentLayout.Row>
                ) : null}
                {isCardVisible("Ideas Hub", "AI Daily Planner") || isCardVisible("Ideas Hub", "Overdue Action Items") ? (
                  <HubsContentLayout.Row>
                    {isCardVisible("Ideas Hub", "AI Daily Planner") && <AIDailyPlannerCard />}
                    {isCardVisible("Ideas Hub", "Overdue Action Items") && <ActionPlansOverdueItemsHubCard />}
                  </HubsContentLayout.Row>
                ) : null}
                {isCardVisible("Ideas Hub", "AP v2 KPI Dashboard") || isCardVisible("Ideas Hub", "AP v2 Project Cards") ? (
                  <HubsContentLayout.Row>
                    {isCardVisible("Ideas Hub", "AP v2 KPI Dashboard") && <APv2KpiDashboardHubCard />}
                    {isCardVisible("Ideas Hub", "AP v2 Project Cards") && <APv2ProjectCardsHubCard />}
                  </HubsContentLayout.Row>
                ) : null}
                {isCardVisible("Ideas Hub", "Cost Management Table") && (
                  <HubsContentLayout.Row variant="table">
                    <CostManagementTableCard />
                  </HubsContentLayout.Row>
                )}
              </HubsContentLayout>
            )}
          </ToolLandingPage.Body>
        </ToolLandingPage.Main>
      </ToolLandingPage>
      </AppLayout>

      {/* Edit Hub View modal */}
      {editViewTab && (
        <Modal
          open
          onClose={() => setEditViewTab(null)}
          aria-label="Edit Hub View"
          howToClose={["x", "scrim"]}
          role="dialog"
          style={{ width: 688 }}
        >
          <Modal.Header>Edit Hub View — {editViewTab}</Modal.Header>
          <Modal.Body>
            <Typography intent="small" style={{ color: "var(--color-text-secondary)", display: "block", marginBottom: 16, lineHeight: 1.45 }}>
              Toggle cards on or off for this hub view.
            </Typography>
            <div style={{ display: "flex", flexDirection: "column", gap: 0, border: "1px solid var(--color-border-separator)", borderRadius: 8, overflow: "hidden" }}>
              {TAB_CARDS[editViewTab].map((cardName, idx) => {
                const visible = isCardVisible(editViewTab, cardName);
                return (
                  <div
                    key={cardName}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderTop: idx > 0 ? "1px solid var(--color-border-separator)" : "none",
                      background: "var(--color-surface-primary)",
                    }}
                  >
                    <span style={{ fontSize: 14, color: "var(--color-text-primary)", fontWeight: visible ? 500 : 400 }}>{cardName}</span>
                    <Switch
                      checked={visible}
                      onChange={() => toggleCard(editViewTab, cardName)}
                      aria-label={`${visible ? "Hide" : "Show"} ${cardName}`}
                    />
                  </div>
                );
              })}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" className="b_primary" onClick={() => setEditViewTab(null)}>Done</Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
}

export default function HomeContent() {
  return (
    <HubFilterProvider>
      <HomeContentInner />
    </HubFilterProvider>
  );
}
