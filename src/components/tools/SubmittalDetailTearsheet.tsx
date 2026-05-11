import React, { useState } from "react";
import { Box, Button, Card, H2, Page, Pill, Tabs, Tearsheet, Typography } from "@procore/core-react";
import { Pencil } from "@procore/core-icons";
import TagPanel from "@/components/risk/TagPanel";
import styled, { createGlobalStyle } from "styled-components";

const TearsheetWidth = createGlobalStyle`
  [class*="StyledTearsheetBody"]:has(> .submittal-detail-tearsheet-root) {
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
  Approved: "green",
  "Approved as Noted": "yellow",
  "Revise and Resubmit": "red",
  "Under Review": "blue",
  "Pending Submission": "gray",
  Rejected: "red",
  Void: "gray",
};

interface SubmittalItem {
  id: string;
  projectId: string;
  number: number;
  title: string;
  type: string;
  status: string;
  responsibleContractorId: string | null;
  finalDueDate: string | null;
}

interface Props {
  item: SubmittalItem | null;
  open: boolean;
  onClose: () => void;
}

const TABS = ["General", "Change History"] as const;
type TabKey = (typeof TABS)[number];

export default function SubmittalDetailTearsheet({ item, open, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("General");

  if (!item) return null;

  return (
    <>
      <TearsheetWidth />
      <Tearsheet open={open} onClose={onClose} aria-label="Submittal details" placement="right">
        <div className="submittal-detail-tearsheet-root" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <Page style={{ height: "100%", background: "var(--color-surface-primary)", color: "var(--color-text-primary)" }}>
            <Page.Main style={{ height: "100%", overflow: "hidden", background: "var(--color-surface-primary)" }}>
              <Page.Header style={{ background: "var(--color-surface-primary)", borderColor: "var(--color-border-separator)" }}>
                <Page.Title>
                  <Box style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography intent="h2">Submittal #{item.number}: {item.title}</Typography>
                    <Box style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
                          <Typography intent="label" style={{ fontWeight: 600 }}>Title</Typography>
                          <Typography intent="body">{item.title}</Typography>
                        </FieldCellWide>
                        <FieldCell>
                          <Typography intent="label" style={{ fontWeight: 600 }}>Number</Typography>
                          <Typography intent="body">{item.number}</Typography>
                        </FieldCell>
                        <FieldCell>
                          <Typography intent="label" style={{ fontWeight: 600 }}>Type</Typography>
                          <Typography intent="body">{item.type}</Typography>
                        </FieldCell>
                        <FieldCell>
                          <Typography intent="label" style={{ fontWeight: 600 }}>Status</Typography>
                          <div style={{ alignSelf: "flex-start" }}>
                            <Pill color={STATUS_COLORS[item.status] ?? "gray"}>{item.status}</Pill>
                          </div>
                        </FieldCell>
                        <FieldCell>
                          <Typography intent="label" style={{ fontWeight: 600 }}>Responsible Contractor</Typography>
                          <Typography intent="body">{item.responsibleContractorId ?? '—'}</Typography>
                        </FieldCell>
                        <FieldCell>
                          <Typography intent="label" style={{ fontWeight: 600 }}>Due Date</Typography>
                          <Typography intent="body">{item.finalDueDate ?? '—'}</Typography>
                        </FieldCell>
                      </FieldGrid>
                    </SectionCard>

                    <SectionCard>
                      <H2 style={{ marginBottom: 16 }}>Risk</H2>
                      <TagPanel
                        sourceType="submittal"
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
