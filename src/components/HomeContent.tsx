import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Button, MenuImperative, Modal, ToolLandingPage, H1, Title, ToggleButton, Switch, Typography } from "@procore/core-react";
import { Home, Plus, Filter, EllipsisVertical } from "@procore/core-icons";
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
import {
  ActionPlansPortfolioMatrixHubCard,
  ActionPlansTemplateAdoptionHubCard,
  ActionPlansOverdueItemsHubCard,
} from "@/components/ActionPlansExplorationHubCards";
import {
  APv2FullMatrixHubCard,
  APv2KpiDashboardHubCard,
  APv2ProjectCardsHubCard,
} from "@/components/ActionPlansExploration2HubCards";
import { HubFilterProvider, useHubFilters } from "@/context/HubFilterContext";
import HubFilterBar from "@/components/HubFilterBar";

const tabs = ["My Work", "Cost Management", "Schedule & Milestones", "Action Plans"] as const;
type TabName = typeof tabs[number];

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

/** Card registry: the display name for each card per tab (order matches render order). */
const TAB_CARDS: Record<TabName, string[]> = {
  "My Work": ["My Open Items", "AI Daily Planner", "Projects Table"],
  "Cost Management": ["Financial Scorecard", "Invoices for Approval", "Cost Management Table"],
  "Schedule & Milestones": ["Schedule Risk", "Schedule Variance", "Schedule Heatmap"],
  "Action Plans": [
    "AP v2 Full Matrix",
    "Action Plans Portfolio Matrix",
    "Template Adoption",
    "Overdue Action Items",
    "AP v2 KPI Dashboard",
    "AP v2 Project Cards",
  ],
};

type HiddenCards = Record<TabName, Set<string>>;

function makeEmptyHidden(): HiddenCards {
  return {
    "My Work": new Set(),
    "Cost Management": new Set(),
    "Schedule & Milestones": new Set(),
    "Action Plans": new Set(),
  };
}

function HomeContentInner() {
  const [activeTab, setActiveTab] = useState<TabName>("My Work");
  const [filterBarOpen, setFilterBarOpen] = useState(false);
  const { hasActiveFilters } = useHubFilters();

  // Ellipsis menu state
  const [menuOpenTab, setMenuOpenTab] = useState<TabName | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const ellipsisBtnRefs = useRef<Partial<Record<TabName, HTMLButtonElement>>>({});

  // Edit view modal state
  const [editViewTab, setEditViewTab] = useState<TabName | null>(null);
  const [hiddenCards, setHiddenCards] = useState<HiddenCards>(makeEmptyHidden);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    if (!menuOpenTab) return;
    function handleClick(e: MouseEvent) {
      const btn = ellipsisBtnRefs.current[menuOpenTab!];
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        btn &&
        !btn.contains(e.target as Node)
      ) {
        setMenuOpenTab(null);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpenTab(null);
        ellipsisBtnRefs.current[menuOpenTab!]?.focus();
      }
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpenTab]);

  function isCardVisible(tab: TabName, cardName: string) {
    return !hiddenCards[tab].has(cardName);
  }

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

  function openMenu(tab: TabName, e: React.MouseEvent) {
    e.stopPropagation();
    setMenuOpenTab((prev) => (prev === tab ? null : tab));
  }

  function handleMenuAction(action: string) {
    const tab = menuOpenTab;
    setMenuOpenTab(null);
    if (!tab) return;
    if (action === "edit_view") {
      setEditViewTab(tab);
    }
  }

  return (
    <>
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
                  {tabs.map((tab) => {
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
                            <EllipsisBtn
                             className="b_tertiary"
                              ref={(el) => { if (el) ellipsisBtnRefs.current[tab] = el; }}
                              type="button"
                              aria-label={`${tab} options`}
                              aria-haspopup="menu"
                              aria-expanded={menuOpenTab === tab}
                              onClick={(e) => openMenu(tab, e)}
                              style={{ background: menuOpenTab === tab ? "rgba(0,0,0,0.08)" : undefined }}
                            >
                              <EllipsisVertical size="sm" />
                            </EllipsisBtn>
                          )}
                        </TabInner>
                        {menuOpenTab === tab && (
                          <div
                            ref={menuRef}
                            style={{
                              position: "absolute",
                              top: "calc(100% + 4px)",
                              left: 0,
                              zIndex: 100,
                              minWidth: 150,
                              borderRadius: 4,
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                              backgroundColor: "var(--color-surface-primary)",
                              overflow: "hidden",
                            }}
                          >
                            <MenuImperative role="menu">
                              <MenuImperative.Item item="rename" onClick={() => handleMenuAction("rename")}>Rename</MenuImperative.Item>
                              <MenuImperative.Item item="edit_view" onClick={() => handleMenuAction("edit_view")}>Edit Hub View</MenuImperative.Item>
                              <MenuImperative.Item item="share" onClick={() => handleMenuAction("share")}>Share</MenuImperative.Item>
                              <MenuImperative.Item item="duplicate" onClick={() => handleMenuAction("duplicate")}>Duplicate</MenuImperative.Item>
                              <MenuImperative.Item item="delete" onClick={() => handleMenuAction("delete")}>Delete</MenuImperative.Item>
                            </MenuImperative>
                          </div>
                        )}
                      </TabItem>
                    );
                  })}
                </TabBarList>
              </div>
            </ToolLandingPage.Tabs>
          </ToolLandingPage.Header>
          <ToolLandingPage.Body>
            {filterBarOpen && (
              <div style={{ marginBottom: 16 }}>
                <HubFilterBar />
              </div>
            )}
            {activeTab === "My Work" && (
              <HubsContentLayout>
                {isCardVisible("My Work", "My Open Items") || isCardVisible("My Work", "AI Daily Planner") ? (
                  <HubsContentLayout.Row>
                    {isCardVisible("My Work", "My Open Items") && <MyOpenItemsCard />}
                    {isCardVisible("My Work", "AI Daily Planner") && <AIDailyPlannerCard />}
                  </HubsContentLayout.Row>
                ) : null}
                {isCardVisible("My Work", "Projects Table") && (
                  <HubsContentLayout.Row variant="table">
                    <ProjectsTableCard />
                  </HubsContentLayout.Row>
                )}
              </HubsContentLayout>
            )}
            {activeTab === "Cost Management" && (
              <HubsContentLayout>
                {isCardVisible("Cost Management", "Financial Scorecard") || isCardVisible("Cost Management", "Invoices for Approval") ? (
                  <HubsContentLayout.Row columnsTemplate="minmax(0, 1fr) 440px">
                    {isCardVisible("Cost Management", "Financial Scorecard") && <FinancialScorecardCard />}
                    {isCardVisible("Cost Management", "Invoices for Approval") && <InvoicesForApprovalCard />}
                  </HubsContentLayout.Row>
                ) : null}
                {isCardVisible("Cost Management", "Cost Management Table") && (
                  <HubsContentLayout.Row variant="table">
                    <CostManagementTableCard />
                  </HubsContentLayout.Row>
                )}
              </HubsContentLayout>
            )}
            {activeTab === "Schedule & Milestones" && (
              <HubsContentLayout>
                {isCardVisible("Schedule & Milestones", "Schedule Risk") || isCardVisible("Schedule & Milestones", "Schedule Variance") ? (
                  <HubsContentLayout.Row>
                    {isCardVisible("Schedule & Milestones", "Schedule Risk") && <ScheduleRiskGHubCard />}
                    {isCardVisible("Schedule & Milestones", "Schedule Variance") && <ScheduleVariance2HubCard />}
                  </HubsContentLayout.Row>
                ) : null}
                {isCardVisible("Schedule & Milestones", "Schedule Heatmap") && (
                  <HubsContentLayout.Row variant="table">
                    <ScheduleHeatmapCard />
                  </HubsContentLayout.Row>
                )}
              </HubsContentLayout>
            )}
            {activeTab === "Action Plans" && (
              <HubsContentLayout>
                {isCardVisible("Action Plans", "AP v2 Full Matrix") && (
                  <HubsContentLayout.Row variant="table">
                    <APv2FullMatrixHubCard />
                  </HubsContentLayout.Row>
                )}
                {isCardVisible("Action Plans", "Overdue Action Items") || isCardVisible("Action Plans", "Template Adoption") ? (
                  <HubsContentLayout.Row columnsTemplate="minmax(0, 1fr) 440px">
                    {isCardVisible("Action Plans", "Overdue Action Items") && <ActionPlansOverdueItemsHubCard />}
                    {isCardVisible("Action Plans", "Template Adoption") && <ActionPlansTemplateAdoptionHubCard />}
                  </HubsContentLayout.Row>
                ) : null}
                {isCardVisible("Action Plans", "AP v2 KPI Dashboard") || isCardVisible("Action Plans", "AP v2 Project Cards") ? (
                  <HubsContentLayout.Row>
                    {isCardVisible("Action Plans", "AP v2 KPI Dashboard") && <APv2KpiDashboardHubCard />}
                    {isCardVisible("Action Plans", "AP v2 Project Cards") && <APv2ProjectCardsHubCard />}
                  </HubsContentLayout.Row>
                ) : null}
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
