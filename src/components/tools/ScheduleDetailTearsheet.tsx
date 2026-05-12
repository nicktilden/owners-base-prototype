import React, { useState } from "react";
import { Box, Button, Card, H2, Page, Pill, Tabs, Tearsheet, Typography } from "@procore/core-react";
import { Pencil } from "@procore/core-icons";
import styled, { createGlobalStyle } from "styled-components";
import type { ScheduleEntry, ScheduleItem, Milestone, ScheduleStatus } from "@/types/schedule";

const TearsheetWidth = createGlobalStyle`
  [class*="StyledTearsheetBody"]:has(> .schedule-detail-tearsheet-root) {
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

const STATUS_COLORS: Record<ScheduleStatus, PillColor> = {
  not_started: "gray",
  in_progress:  "blue",
  on_hold:      "yellow",
  delayed:      "red",
  complete:     "green",
};

const STATUS_LABELS: Record<ScheduleStatus, string> = {
  not_started: "Not Started",
  in_progress:  "In Progress",
  on_hold:      "On Hold",
  delayed:      "Delayed",
  complete:     "Complete",
};

const MILESTONE_TYPE_LABELS: Record<string, string> = {
  substantial_completion: "Substantial Completion",
  phase_handoff:          "Phase Handoff",
  regulatory_inspection:  "Regulatory Inspection",
  owner_acceptance:       "Owner Acceptance",
  ntp:                    "Notice to Proceed",
};

function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const dt = d instanceof Date ? d : new Date(d);
  return dt.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
}

const TABS = ["General", "Change History"] as const;
type TabName = typeof TABS[number];

interface Props {
  item: ScheduleEntry | null;
  open: boolean;
  onClose: () => void;
}

export default function ScheduleDetailTearsheet({ item, open, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<TabName>("General");

  if (!item) return null;

  const isItem = item.type === "item";
  const si = isItem ? (item as ScheduleItem) : null;
  const ms = !isItem ? (item as Milestone) : null;
  const status = item.status ?? "not_started";

  return (
    <>
      <TearsheetWidth />
      <Tearsheet open={open} onClose={onClose} aria-label="Schedule item details" placement="right">
        <div className="schedule-detail-tearsheet-root" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <Page style={{ height: "100%", background: "var(--color-surface-primary)", color: "var(--color-text-primary)" }}>
            <Page.Main style={{ height: "100%", overflow: "hidden", background: "var(--color-surface-primary)" }}>
              <Page.Header style={{ background: "var(--color-surface-primary)", borderColor: "var(--color-border-separator)" }}>
                <Page.Title>
                  <Box style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography intent="h2">{item.name}</Typography>
                    <Button variant="secondary" className="b_secondary" icon={<Pencil />}>Edit</Button>
                  </Box>
                </Page.Title>
                <Page.Tabs>
                  <Tabs>
                    {TABS.map(tab => (
                      <Tabs.Tab key={tab} role="button" selected={activeTab === tab} onPress={() => setActiveTab(tab)}>
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
                          <Typography intent="label" style={{ fontWeight: 600 }}>Name</Typography>
                          <Typography intent="body">{item.name}</Typography>
                        </FieldCellWide>
                        <FieldCell>
                          <Typography intent="label" style={{ fontWeight: 600 }}>Type</Typography>
                          <Typography intent="body">{isItem ? "Schedule Item" : "Milestone"}</Typography>
                        </FieldCell>
                        <FieldCell>
                          <Typography intent="label" style={{ fontWeight: 600 }}>WBS</Typography>
                          <Typography intent="body">{item.wbs || "—"}</Typography>
                        </FieldCell>
                        <FieldCell>
                          <Typography intent="label" style={{ fontWeight: 600 }}>Status</Typography>
                          <div style={{ alignSelf: "flex-start" }}>
                            <Pill color={STATUS_COLORS[status as ScheduleStatus] ?? "gray"}>
                              {STATUS_LABELS[status as ScheduleStatus] ?? status}
                            </Pill>
                          </div>
                        </FieldCell>

                        {isItem && si && (
                          <>
                            <FieldCell>
                              <Typography intent="label" style={{ fontWeight: 600 }}>% Complete</Typography>
                              <Typography intent="body">{si.percentComplete}%</Typography>
                            </FieldCell>
                            <FieldCell>
                              <Typography intent="label" style={{ fontWeight: 600 }}>Start Date</Typography>
                              <Typography intent="body">{fmtDate(si.startDate)}</Typography>
                            </FieldCell>
                            <FieldCell>
                              <Typography intent="label" style={{ fontWeight: 600 }}>Finish Date</Typography>
                              <Typography intent="body">{fmtDate(si.finishDate)}</Typography>
                            </FieldCell>
                            <FieldCell>
                              <Typography intent="label" style={{ fontWeight: 600 }}>Actual Start</Typography>
                              <Typography intent="body">{fmtDate(si.actualStartDate)}</Typography>
                            </FieldCell>
                            <FieldCell>
                              <Typography intent="label" style={{ fontWeight: 600 }}>Actual Finish</Typography>
                              <Typography intent="body">{fmtDate(si.actualFinishDate)}</Typography>
                            </FieldCell>
                          </>
                        )}

                        {!isItem && ms && (
                          <>
                            <FieldCell>
                              <Typography intent="label" style={{ fontWeight: 600 }}>Milestone Type</Typography>
                              <Typography intent="body">
                                {ms.milestoneType ? (MILESTONE_TYPE_LABELS[ms.milestoneType] ?? ms.milestoneType) : "—"}
                              </Typography>
                            </FieldCell>
                            <FieldCell>
                              <Typography intent="label" style={{ fontWeight: 600 }}>Planned Date</Typography>
                              <Typography intent="body">{fmtDate(ms.milestoneDate)}</Typography>
                            </FieldCell>
                            <FieldCell>
                              <Typography intent="label" style={{ fontWeight: 600 }}>Actual Date</Typography>
                              <Typography intent="body">{fmtDate(ms.actualMilestoneDate)}</Typography>
                            </FieldCell>
                            {ms.note && (
                              <FieldCellWide>
                                <Typography intent="label" style={{ fontWeight: 600 }}>Note</Typography>
                                <Typography intent="body">{ms.note}</Typography>
                              </FieldCellWide>
                            )}
                          </>
                        )}
                      </FieldGrid>
                    </SectionCard>

                    {isItem && si && (si.hazardousActivityType || si.safetyPlanRequired) && (
                      <SectionCard>
                        <H2 style={{ marginBottom: 20 }}>Safety</H2>
                        <FieldGrid>
                          {si.hazardousActivityType && (
                            <FieldCell>
                              <Typography intent="label" style={{ fontWeight: 600 }}>Hazardous Activity</Typography>
                              <Typography intent="body" style={{ textTransform: "capitalize" }}>
                                {si.hazardousActivityType.replace(/_/g, " ")}
                              </Typography>
                            </FieldCell>
                          )}
                          {si.safetyPlanRequired && (
                            <FieldCell>
                              <Typography intent="label" style={{ fontWeight: 600 }}>Safety Plan</Typography>
                              <div style={{ alignSelf: "flex-start" }}>
                                <Pill color={si.safetyPlanCompleted ? "green" : "yellow"}>
                                  {si.safetyPlanCompleted ? "Completed" : "Required"}
                                </Pill>
                              </div>
                            </FieldCell>
                          )}
                        </FieldGrid>
                      </SectionCard>
                    )}
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
