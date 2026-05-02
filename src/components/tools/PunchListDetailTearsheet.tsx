import React, { useState } from "react";
import { Box, Button, Card, H2, Page, Pill, Tabs, Tearsheet, Typography } from "@procore/core-react";
import { Pencil } from "@procore/core-icons";
import TagPanel from "@/components/risk/TagPanel";
import styled, { createGlobalStyle } from "styled-components";

const TearsheetWidth = createGlobalStyle`
  [class*="StyledTearsheetBody"]:has(> .punch-detail-tearsheet-root) {
    flex: 0 0 60vw !important;
  }
`;

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px 32px;
`;

const FieldCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FieldCellWide = styled(FieldCell)`
  grid-column: 1 / -1;
`;

const SectionCard = styled(Card)`
  padding: 24px;
  background: var(--color-surface-primary);
  margin-bottom: 16px;
`;

type PillColor = "blue" | "green" | "yellow" | "gray" | "red";

const STATUS_COLORS: Record<string, PillColor> = {
  Open: "blue",
  "In Progress": "yellow",
  Completed: "green",
  Void: "gray",
  "Ready for Review": "yellow",
  Pending: "gray",
};

interface PunchListItem {
  id: string;
  projectId: string;
  number: number;
  description: string;
  location: string;
  status: string;
  assignedTo: string;
  dueDate: string;
}

interface Props {
  item: PunchListItem | null;
  open: boolean;
  onClose: () => void;
}

const TABS = ["General", "Change History"] as const;
type TabKey = (typeof TABS)[number];

export default function PunchListDetailTearsheet({ item, open, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("General");

  if (!item) return null;

  return (
    <>
      <TearsheetWidth />
      <Tearsheet open={open} onClose={onClose} aria-label="Punch List item details" placement="right">
        <div className="punch-detail-tearsheet-root" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <Page style={{ height: "100%", background: "var(--color-surface-primary)", color: "var(--color-text-primary)" }}>
            <Page.Main style={{ height: "100%", overflow: "hidden", background: "var(--color-surface-primary)" }}>
              <Page.Header style={{ background: "var(--color-surface-primary)", borderColor: "var(--color-border-separator)" }}>
                <Page.Title>
                  <Box style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography intent="h2">Punch List #{item.number}</Typography>
                    <Box style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {item.status !== "Completed" && item.status !== "Void" && (
                        <Button variant="primary" className="b_primary">Mark Complete</Button>
                      )}
                      <Button variant="secondary" className="b_secondary" icon={<Pencil />}>Edit</Button>
                    </Box>
                  </Box>
                </Page.Title>
                <Page.Tabs>
                  <Tabs>
                    {TABS.map((tab) => (
                      <Tabs.Tab
                        key={tab}
                        role="button"
                        selected={activeTab === tab}
                        onPress={() => setActiveTab(tab)}
                      >
                        {tab}
                      </Tabs.Tab>
                    ))}
                  </Tabs>
                </Page.Tabs>
              </Page.Header>

              <Page.Body style={{ padding: 24, overflowY: "auto", background: "var(--color-surface-secondary)" }}>
                {activeTab === "General" && (
                  <>
                    <SectionCard>
                      <H2 style={{ marginBottom: 20 }}>Details</H2>
                      <FieldGrid>
                        <FieldCellWide>
                          <Typography intent="label" style={{ fontWeight: 600 }}>Description</Typography>
                          <Typography intent="body">{item.description}</Typography>
                        </FieldCellWide>
                        <FieldCell>
                          <Typography intent="label" style={{ fontWeight: 600 }}>Number</Typography>
                          <Typography intent="body">{item.number}</Typography>
                        </FieldCell>
                        <FieldCell>
                          <Typography intent="label" style={{ fontWeight: 600 }}>Status</Typography>
                          <div style={{ alignSelf: "flex-start" }}>
                            <Pill color={STATUS_COLORS[item.status] ?? "gray"}>{item.status}</Pill>
                          </div>
                        </FieldCell>
                        <FieldCell>
                          <Typography intent="label" style={{ fontWeight: 600 }}>Due Date</Typography>
                          <Typography intent="body">{item.dueDate}</Typography>
                        </FieldCell>
                        <FieldCell>
                          <Typography intent="label" style={{ fontWeight: 600 }}>Location</Typography>
                          <Typography intent="body">{item.location}</Typography>
                        </FieldCell>
                        <FieldCell>
                          <Typography intent="label" style={{ fontWeight: 600 }}>Assigned To</Typography>
                          <Typography intent="body">{item.assignedTo}</Typography>
                        </FieldCell>
                      </FieldGrid>
                    </SectionCard>

                    <SectionCard>
                      <H2 style={{ marginBottom: 16 }}>Risk</H2>
                      <TagPanel
                        sourceType="punch_list"
                        sourceId={item.id}
                        projectId={item.projectId}
                      />
                    </SectionCard>
                  </>
                )}

                {activeTab === "Change History" && (
                  <SectionCard>
                    <Box padding="xl" style={{ textAlign: "center", color: "var(--color-text-secondary)" }}>
                      <Typography intent="body">No change history available.</Typography>
                    </Box>
                  </SectionCard>
                )}
              </Page.Body>
            </Page.Main>
          </Page>
        </div>
      </Tearsheet>
    </>
  );
}
