import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import styled from "styled-components";
import { Button, MenuImperative, Modal, ToolLandingPage, H1, Title, ToggleButton, Switch, Typography } from "@procore/core-react";
import { Home, Plus, EllipsisVertical, Check } from "@procore/core-icons";
import { HubFilterProvider } from "@/context/HubFilterContext";
import HubsContentLayout from "@/components/hubs/HubsContentLayout";
import MyOpenItemsCard from "@/components/MyOpenItemsCard";
import {
  ProjectInfoCard,
  ProjectLinksCard,
  SiteSafetyCard,
  ProjectDatesCard,
  AllOpenItemsCard,
  ProjectTeamCard,
} from "@/components/ProjectOverviewHubCards";
import HealthSummaryCard from "@/components/health/cards/HealthSummaryCard";
import CostHealthCard from "@/components/health/cards/CostHealthCard";
import ScheduleHealthCard from "@/components/health/cards/ScheduleHealthCard";
import DeliveryRiskCard from "@/components/health/cards/DeliveryRiskCard";
import RiskRegisterCard from "@/components/health/cards/RiskRegisterCard";
import ProjectRiskLevelCard from "@/components/health/cards/ProjectRiskLevelCard";
import { sampleProjectRows } from "@/data/projects";

/** Convert numeric projectRowId (1–50) to seed string format ('proj-001'…). */
function toSeedId(projectRowId: number): string {
  return `proj-${String(projectRowId).padStart(3, "0")}`;
}

const GlobalHeader = dynamic(() => import("@/components/nav/GlobalHeader"), { ssr: false });
const AppLayout = dynamic(() => import("@/components/nav/AppLayout"), { ssr: false });

const tabs = ["Overview", "Health & Risk"] as const;
type TabName = (typeof tabs)[number];

// ─── Custom tab bar styled to match @procore/core-react Tabs ─────────────────

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

  ${({ $selected }) => ($selected ? `border-bottom: 3px solid hsl(200, 8%, 15%);` : "")}
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

const TAB_CARDS: Record<TabName, string[]> = {
  Overview: [
    "Project Info",
    "Project Risk Level",
    "Site Safety & Information",
    "Project Dates",
    "My Open Items",
    "All Open Items",
    "Project Team",
    "Project Links",
  ],
  "Health & Risk": [
    "Project Health",
    "Cost Health",
    "Schedule Health",
    "Delivery Risk",
    "Health & Risk",
  ],
};

type HiddenCards = Record<TabName, Set<string>>;

function makeEmptyHidden(): HiddenCards {
  return { Overview: new Set(), "Health & Risk": new Set() };
}

function ProjectOverviewContentInner({ projectRowId, seedProjectId }: { projectRowId: number; seedProjectId: string }) {
  const project = sampleProjectRows.find((r) => r.id === projectRowId);

  const [activeTab, setActiveTab] = useState<TabName>("Overview");
  const [editViewTab, setEditViewTab] = useState<TabName | null>(null);
  const [hiddenCards, setHiddenCards] = useState<HiddenCards>(makeEmptyHidden);
  const [menuOpenTab, setMenuOpenTab] = useState<TabName | null>(null);

  // Hub views visibility
  const [hiddenTabs, setHiddenTabs] = useState<Set<TabName>>(new Set());
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
        if (activeTab === tab) {
          const firstVisible = tabs.find(t => !next.has(t));
          if (firstVisible) setActiveTab(firstVisible);
        }
      }
      return next;
    });
  }

  const menuRef = useRef<HTMLDivElement>(null);
  const ellipsisBtnRefs = useRef<Partial<Record<TabName, HTMLButtonElement>>>({});

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
    if (action === "edit_view") setEditViewTab(tab);
  }

  const visible = (cardName: string) => isCardVisible("Overview", cardName);

  return (
    <>
      <Head>
        <title>{project ? `${project.number} — ${project.name}` : "Project Overview"} — Owner Prototype</title>
      </Head>
      <GlobalHeader />
      <AppLayout>
        <ToolLandingPage>
          <ToolLandingPage.Main>
            <ToolLandingPage.Header style={{ borderBottom: "1px solid var(--color-card-border)" }}>
              <ToolLandingPage.Title>
                <Title>
                  <Title.Text>
                    <H1 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Home size="md" />
                      {project ? `${project.number} — ${project.name}` : "Project Overview"}
                    </H1>
                  </Title.Text>
                  <Title.Actions>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Button variant="primary" className="b_primary" icon={<Plus />}>
                        Add Update
                      </Button>
                      <Button variant="secondary" className="b_secondary" data-variant="secondary">
                        Export
                      </Button>
                    </div>
                  </Title.Actions>
                </Title>
              </ToolLandingPage.Title>
              <ToolLandingPage.Tabs>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <TabBarList className="Tabs__TabsList">
                    {tabs.filter(tab => !hiddenTabs.has(tab)).map((tab) => {
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
                                ref={(el) => {
                                  if (el) ellipsisBtnRefs.current[tab] = el;
                                }}
                                type="button"
                                aria-label={`${tab} options`}
                                aria-haspopup="menu"
                                aria-expanded={menuOpenTab === tab}
                                onClick={(e) => openMenu(tab, e)}
                                style={{
                                  background:
                                    menuOpenTab === tab ? "rgba(0,0,0,0.08)" : undefined,
                                }}
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
                                <MenuImperative.Item
                                  item="edit_view"
                                  onClick={() => handleMenuAction("edit_view")}
                                >
                                  Edit Hub View
                                </MenuImperative.Item>
                                <MenuImperative.Item
                                  item="share"
                                  onClick={() => handleMenuAction("share")}
                                >
                                  Share
                                </MenuImperative.Item>
                              </MenuImperative>
                            </div>
                          )}
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
                        const isVisible = !hiddenTabs.has(tab);
                        return (
                          <ViewsMenuItem
                            key={tab}
                            role="menuitemcheckbox"
                            aria-checked={isVisible}
                            onClick={() => toggleTabVisibility(tab)}
                          >
                            <ViewsMenuLabel>{tab}</ViewsMenuLabel>
                            <CheckIconWrap>
                              {isVisible && <Check size="sm" />}
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
              {activeTab === "Overview" && (
                <HubsContentLayout>
                  {visible("Project Info") || visible("Project Risk Level") ? (
                    <HubsContentLayout.Row columnsTemplate="minmax(0, 1fr) 440px">
                      {visible("Project Info") && (
                        <ProjectInfoCard projectRowId={projectRowId} />
                      )}
                      {visible("Project Risk Level") && (
                        <ProjectRiskLevelCard projectId={seedProjectId} />
                      )}
                    </HubsContentLayout.Row>
                  ) : null}

                  {visible("Site Safety & Information") || visible("Project Dates") ? (
                    <HubsContentLayout.Row columnsTemplate="440px minmax(0, 1fr)">
                      {visible("Site Safety & Information") && (
                        <SiteSafetyCard projectRowId={projectRowId} />
                      )}
                      {visible("Project Dates") && (
                        <ProjectDatesCard projectRowId={projectRowId} />
                      )}
                    </HubsContentLayout.Row>
                  ) : null}

                  {visible("My Open Items") || visible("All Open Items") ? (
                    <HubsContentLayout.Row columnsTemplate="minmax(0, 1fr) 440px">
                      {visible("My Open Items") && (
                        <MyOpenItemsCard seedProjectId={seedProjectId} />
                      )}
                      {visible("All Open Items") && (
                        <AllOpenItemsCard projectRowId={projectRowId} />
                      )}
                    </HubsContentLayout.Row>
                  ) : null}

                  {visible("Project Team") || visible("Project Links") ? (
                    <HubsContentLayout.Row columnsTemplate="minmax(0, 1fr) 440px">
                      {visible("Project Team") && (
                        <ProjectTeamCard projectRowId={projectRowId} />
                      )}
                      {visible("Project Links") && (
                        <ProjectLinksCard projectRowId={projectRowId} />
                      )}
                    </HubsContentLayout.Row>
                  ) : null}
                </HubsContentLayout>
              )}
              {activeTab === "Health & Risk" && (
                <HubsContentLayout>
                  {isCardVisible("Health & Risk", "Project Health") || isCardVisible("Health & Risk", "Health & Risk") ? (
                    <HubsContentLayout.Row>
                      {isCardVisible("Health & Risk", "Project Health") && <HealthSummaryCard scope="project" projectId={seedProjectId} />}
                      {isCardVisible("Health & Risk", "Health & Risk") && <RiskRegisterCard scope="project" projectId={seedProjectId} />}
                    </HubsContentLayout.Row>
                  ) : null}
                  {isCardVisible("Health & Risk", "Cost Health") || isCardVisible("Health & Risk", "Schedule Health") || isCardVisible("Health & Risk", "Delivery Risk") ? (
                    <HubsContentLayout.Row>
                      {isCardVisible("Health & Risk", "Cost Health") && <CostHealthCard scope="project" projectId={seedProjectId} />}
                      {isCardVisible("Health & Risk", "Schedule Health") && <ScheduleHealthCard scope="project" projectId={seedProjectId} />}
                      {isCardVisible("Health & Risk", "Delivery Risk") && <DeliveryRiskCard scope="project" projectId={seedProjectId} />}
                    </HubsContentLayout.Row>
                  ) : null}
                </HubsContentLayout>
              )}
            </ToolLandingPage.Body>
          </ToolLandingPage.Main>
        </ToolLandingPage>
      </AppLayout>

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
            <Typography
              intent="small"
              style={{
                color: "var(--color-text-secondary)",
                display: "block",
                marginBottom: 16,
                lineHeight: 1.45,
              }}
            >
              Toggle cards on or off for this hub view.
            </Typography>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 0,
                border: "1px solid var(--color-border-separator)",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              {TAB_CARDS[editViewTab].map((cardName, idx) => {
                const vis = isCardVisible(editViewTab, cardName);
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
                    <span
                      style={{
                        fontSize: 14,
                        color: "var(--color-text-primary)",
                        fontWeight: vis ? 500 : 400,
                      }}
                    >
                      {cardName}
                    </span>
                    <Switch
                      checked={vis}
                      onChange={() => toggleCard(editViewTab, cardName)}
                      aria-label={`${vis ? "Hide" : "Show"} ${cardName}`}
                    />
                  </div>
                );
              })}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="primary"
              className="b_primary"
              onClick={() => setEditViewTab(null)}
            >
              Done
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
}

export default function ProjectOverviewContent() {
  const router = useRouter();
  const rawId = typeof router.query.id === 'string' ? router.query.id : '';

  // URL id is a seed string like 'proj-001'. Parse numeric index for sampleProjectRows.
  // 'proj-001' → 1, 'proj-012' → 12, etc.
  const seedMatch = rawId.match(/^proj-(\d+)$/);
  const projectRowId = seedMatch ? parseInt(seedMatch[1], 10) : (Number(rawId) || 1);
  const seedProjectId = seedMatch ? rawId : toSeedId(projectRowId);

  return (
    <HubFilterProvider>
      <ProjectOverviewContentInner projectRowId={projectRowId} seedProjectId={seedProjectId} />
    </HubFilterProvider>
  );
}
