import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import styled from "styled-components";
import { Button, MenuImperative, Modal, ToolLandingPage, H1, Title, ToggleButton, Switch, Typography } from "@procore/core-react";
import { Home, Plus, EllipsisVertical } from "@procore/core-icons";
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
import { sampleProjectRows } from "@/data/projects";

const GlobalHeader = dynamic(() => import("@/components/nav/GlobalHeader"), { ssr: false });
const AppLayout = dynamic(() => import("@/components/nav/AppLayout"), { ssr: false });

const tabs = ["Overview"] as const;
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

const TAB_CARDS: Record<TabName, string[]> = {
  Overview: [
    "Project Info",
    "Project Links",
    "Site Safety & Information",
    "Project Dates",
    "My Open Items",
    "All Open Items",
    "Project Team",
  ],
};

type HiddenCards = Record<TabName, Set<string>>;

function makeEmptyHidden(): HiddenCards {
  return { Overview: new Set() };
}

function ProjectOverviewContentInner({ projectRowId }: { projectRowId: number }) {
  const project = sampleProjectRows.find((r) => r.id === projectRowId);

  const [activeTab, setActiveTab] = useState<TabName>("Overview");
  const [editViewTab, setEditViewTab] = useState<TabName | null>(null);
  const [hiddenCards, setHiddenCards] = useState<HiddenCards>(makeEmptyHidden);
  const [menuOpenTab, setMenuOpenTab] = useState<TabName | null>(null);

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
        <title>{project?.name ?? "Project Overview"} — Owner Prototype</title>
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
                      {project?.name ?? "Project Overview"}
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
                </div>
              </ToolLandingPage.Tabs>
            </ToolLandingPage.Header>
            <ToolLandingPage.Body>
              {activeTab === "Overview" && (
                <HubsContentLayout>
                  {visible("Project Info") || visible("Project Links") ? (
                    <HubsContentLayout.Row columnsTemplate="minmax(0, 1fr) 440px">
                      {visible("Project Info") && (
                        <ProjectInfoCard projectRowId={projectRowId} />
                      )}
                      {visible("Project Links") && (
                        <ProjectLinksCard projectRowId={projectRowId} />
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
                        <MyOpenItemsCard projectId={projectRowId} />
                      )}
                      {visible("All Open Items") && (
                        <AllOpenItemsCard projectRowId={projectRowId} />
                      )}
                    </HubsContentLayout.Row>
                  ) : null}

                  {visible("Project Team") && (
                    <HubsContentLayout.Row variant="table">
                      <ProjectTeamCard projectRowId={projectRowId} />
                    </HubsContentLayout.Row>
                  )}
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
  const projectRowId = Number(router.query.id) || 1;

  return (
    <HubFilterProvider>
      <ProjectOverviewContentInner projectRowId={projectRowId} />
    </HubFilterProvider>
  );
}
