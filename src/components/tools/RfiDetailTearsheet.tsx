import React, { useEffect, useRef, useState } from "react";
import { Box, Button, Card, H2, Page, Pill, Tabs, Tearsheet, Typography } from "@procore/core-react";
import { Pencil, Paperclip, Connect } from "@procore/core-icons";
import styled, { createGlobalStyle } from "styled-components";
import type { Rfi, RfiStatus } from "@/types/rfis";
import { formatDateMMDDYYYY } from "@/utils/date";
import { specifications } from "@/data/seed/specifications";
import { getConnectedRfiInfo, type ConnectedRfiInfo } from "@/data/procoreConnect";

const RfiTearsheetWidth = createGlobalStyle`
  [class*="StyledTearsheetBody"] {
    flex: 0 0 55vw !important;
  }
`;

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
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

const FieldCellHalf = styled(FieldCell)`
  grid-column: span 2;
`;

const SectionCard = styled(Card)`
  padding: 24px;
  background: var(--color-surface-primary);
  margin-bottom: 16px;
`;

const ResponseCard = styled.div`
  border: 1px solid var(--color-border-separator);
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 12px;
  background: var(--color-surface-primary);
`;

const ResponseHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const AttachmentLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text-link);
  font-size: 14px;
  text-decoration: none;
  &:hover { text-decoration: underline; }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  gap: 12px;
`;

const ConnectBadgeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  position: relative;
`;

const ConnectBadge = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border: 1px solid #ff5200;
  border-radius: 4px;
  background: var(--color-surface-primary);
  cursor: pointer;
  font-size: 13px;
  color: var(--color-text-primary);
  font-weight: 500;
  transition: background 0.15s;
  &:hover { background: rgba(255, 82, 0, 0.08); }
`;

const ConnectTooltip = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 10;
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-separator);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  padding: 16px 20px;
  min-width: 280px;
`;

const TooltipField = styled.div`
  margin-bottom: 12px;
  &:last-child { margin-bottom: 0; }
`;

const TooltipLabel = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 2px;
`;

const TooltipValue = styled.div`
  font-size: 14px;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
`;

type PillColor = "blue" | "green" | "yellow" | "gray";

const STATUS_COLORS: Record<RfiStatus, PillColor> = {
  Draft: "gray",
  Open: "blue",
  Closed: "green",
  "Closed - Revised": "yellow",
  "Closed - Draft": "gray",
};

function formatStage(stage: string | null): string {
  if (!stage) return "—";
  return stage.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function lookupSpecSection(sectionId: string | null): string {
  if (!sectionId) return "—";
  for (const div of specifications) {
    const section = div.sections.find((s) => s.id === sectionId);
    if (section) return `${section.code} - ${section.title}`;
  }
  return "—";
}

function formatCostImpact(rfi: Rfi): string {
  if (!rfi.costImpact.hasImpact) return "No";
  if (rfi.costImpact.amount != null) return `$${rfi.costImpact.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  return "Yes";
}

function formatScheduleImpact(rfi: Rfi): string {
  if (!rfi.scheduleImpact.hasImpact) return "No";
  if (rfi.scheduleImpact.days != null) return `Yes (${rfi.scheduleImpact.days} day${rfi.scheduleImpact.days !== 1 ? 's' : ''})`;
  return "Yes";
}

const TABS = ["General", "Related Items (0)", "Emails (0)", "Change History"] as const;
type TabKey = (typeof TABS)[number];

interface RfiDetailTearsheetProps {
  rfi: Rfi | null;
  projectName: string;
  open: boolean;
  onClose: () => void;
}

export default function RfiDetailTearsheet({ rfi, projectName, open, onClose }: RfiDetailTearsheetProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("General");
  const [connectTooltipOpen, setConnectTooltipOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!connectTooltipOpen) return;
    const handler = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setConnectTooltipOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [connectTooltipOpen]);

  if (!rfi) return null;
  const connectInfo = getConnectedRfiInfo(rfi.id);

  return (
    <>
      <RfiTearsheetWidth />
      <Tearsheet open={open} onClose={onClose} aria-label="RFI details" placement="right">
        <Page style={{ height: "100%", background: "var(--color-surface-primary)", color: "var(--color-text-primary)" }}>
          <Page.Main style={{ height: "100%", overflow: "hidden", background: "var(--color-surface-primary)" }}>
            <Page.Header style={{ background: "var(--color-surface-primary)", borderColor: "var(--color-border-separator)" }}>
              <Page.Title>
                <Box style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Typography intent="h2">RFI #{rfi.number}: {rfi.subject}</Typography>
                  </Box>
                  <Box style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {rfi.status === 'Open' && (
                      <Button variant="primary" className="b_primary">Close RFI</Button>
                    )}
                    <Button variant="secondary" className="b_secondary" icon={<Pencil />}>Edit</Button>
                  </Box>
                </Box>
                {connectInfo && (
                  <ConnectBadgeRow ref={tooltipRef}>
                    <ConnectBadge
                      onClick={() => setConnectTooltipOpen((v) => !v)}
                      aria-label="View Procore Connect details"
                    >
                      <Connect size="sm" style={{ width: 14, height: 14, color: "#ff5200" }} />
                      {connectInfo.upstreamAccount}
                    </ConnectBadge>
                    {connectTooltipOpen && (
                      <ConnectTooltip>
                        <TooltipField>
                          <TooltipLabel>Account</TooltipLabel>
                          <TooltipValue>{connectInfo.upstreamAccount}</TooltipValue>
                        </TooltipField>
                        <TooltipField>
                          <TooltipLabel>Project</TooltipLabel>
                          <TooltipValue>{connectInfo.upstreamProject}</TooltipValue>
                        </TooltipField>
                        <TooltipField>
                          <TooltipLabel>Sync Status</TooltipLabel>
                          <TooltipValue>
                            <span style={{ color: "#2e7d32" }}>✓</span> {connectInfo.syncStatus}
                          </TooltipValue>
                        </TooltipField>
                      </ConnectTooltip>
                    )}
                  </ConnectBadgeRow>
                )}
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
                  {/* ── Request section ── */}
                  <SectionCard>
                    <H2 style={{ marginBottom: 20 }}>Request</H2>
                    <FieldGrid>
                      <FieldCellWide>
                        <Typography intent="label" style={{ fontWeight: 600 }}>Subject</Typography>
                        <Typography intent="body">{rfi.subject}</Typography>
                      </FieldCellWide>

                      <FieldCellHalf>
                        <Typography intent="label" style={{ fontWeight: 600 }}>Question</Typography>
                        <Typography intent="body" style={{ whiteSpace: "pre-wrap" }}>{rfi.question}</Typography>
                      </FieldCellHalf>

                      <FieldCellHalf>
                        <Typography intent="label" style={{ fontWeight: 600 }}>Attachments</Typography>
                        {rfi.attachments.length > 0 ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {rfi.attachments.map((att) => (
                              <AttachmentLink key={att.id} href={att.url}>
                                <Paperclip size="sm" />
                                {att.filename}
                              </AttachmentLink>
                            ))}
                          </div>
                        ) : (
                          <Typography intent="body" style={{ color: "var(--color-text-secondary)" }}>—</Typography>
                        )}
                      </FieldCellHalf>
                    </FieldGrid>
                  </SectionCard>

                  {/* ── Responses section ── */}
                  <SectionCard>
                    <Box style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                      <H2>Responses</H2>
                    </Box>

                    {rfi.responses.length > 0 ? (
                      rfi.responses.map((resp) => (
                        <ResponseCard key={resp.id}>
                          <ResponseHeader>
                            <Box style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <Typography intent="body" style={{ fontWeight: 600 }}>{resp.author}</Typography>
                              {resp.isOfficial && <Pill color="green">Official</Pill>}
                            </Box>
                            <Typography intent="small" style={{ color: "var(--color-text-secondary)" }}>
                              {formatDateMMDDYYYY(resp.date)}
                            </Typography>
                          </ResponseHeader>
                          <Typography intent="body" style={{ whiteSpace: "pre-wrap" }}>{resp.body}</Typography>
                          {resp.attachments.length > 0 && (
                            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                              {resp.attachments.map((att) => (
                                <AttachmentLink key={att.id} href={att.url}>
                                  <Paperclip size="sm" />
                                  {att.filename}
                                </AttachmentLink>
                              ))}
                            </div>
                          )}
                        </ResponseCard>
                      ))
                    ) : (
                      <EmptyState>
                        <Typography intent="h3" style={{ color: "var(--color-text-primary)" }}>
                          There Are No Responses to Display Right Now
                        </Typography>
                        <Typography intent="body" style={{ color: "var(--color-text-secondary)" }}>
                          Once your team creates responses, you can view them here.
                        </Typography>
                        <Button variant="secondary" className="b_secondary">Add Response</Button>
                      </EmptyState>
                    )}
                  </SectionCard>

                  {/* ── General Information section ── */}
                  <SectionCard>
                    <H2 style={{ marginBottom: 20 }}>General Information</H2>
                    <FieldGrid>
                      <FieldCell>
                        <Typography intent="label" style={{ fontWeight: 600 }}>Number</Typography>
                        <Typography intent="body">{rfi.number}</Typography>
                      </FieldCell>
                      <FieldCell>
                        <Typography intent="label" style={{ fontWeight: 600 }}>Due Date</Typography>
                        <Typography intent="body">{formatDateMMDDYYYY(rfi.dueDate)}</Typography>
                      </FieldCell>
                      <FieldCell>
                        <Typography intent="label" style={{ fontWeight: 600 }}>RFI Manager</Typography>
                        <Typography intent="body">{rfi.rfiManager ?? "—"}</Typography>
                      </FieldCell>
                      <FieldCell>
                        <Typography intent="label" style={{ fontWeight: 600 }}>Status</Typography>
                        <div style={{ alignSelf: "flex-start" }}>
                          <Pill color={STATUS_COLORS[rfi.status]}>{rfi.status}</Pill>
                        </div>
                      </FieldCell>

                      <FieldCell>
                        <Typography intent="label" style={{ fontWeight: 600 }}>Received From</Typography>
                        <Typography intent="body">{rfi.receivedFrom ?? "—"}</Typography>
                      </FieldCell>
                      <FieldCell>
                        <Typography intent="label" style={{ fontWeight: 600 }}>Assignees</Typography>
                        <Typography intent="body">{rfi.assignees.join(", ") || "—"}</Typography>
                      </FieldCell>
                      <FieldCell>
                        <Typography intent="label" style={{ fontWeight: 600 }}>Distribution List</Typography>
                        <Typography intent="body">{rfi.distributionList.join(", ") || "—"}</Typography>
                      </FieldCell>
                      <FieldCell>
                        <Typography intent="label" style={{ fontWeight: 600 }}>Ball In Court</Typography>
                        <Typography intent="body">{rfi.ballInCourt ?? "—"}</Typography>
                      </FieldCell>

                      <FieldCell>
                        <Typography intent="label" style={{ fontWeight: 600 }}>Responsible Contractor</Typography>
                        <Typography intent="body">{rfi.responsibleContractor ?? "—"}</Typography>
                      </FieldCell>
                      <FieldCell>
                        <Typography intent="label" style={{ fontWeight: 600 }}>Specification</Typography>
                        <Typography intent="body">{lookupSpecSection(rfi.specificationSectionId)}</Typography>
                      </FieldCell>
                      <FieldCell>
                        <Typography intent="label" style={{ fontWeight: 600 }}>Location</Typography>
                        <Typography intent="body">{rfi.location ?? "—"}</Typography>
                      </FieldCell>
                      <FieldCell>
                        <Typography intent="label" style={{ fontWeight: 600 }}>Created By</Typography>
                        <Typography intent="body">{rfi.createdBy}</Typography>
                      </FieldCell>

                      <FieldCell>
                        <Typography intent="label" style={{ fontWeight: 600 }}>RFI Stage</Typography>
                        <Typography intent="body">{formatStage(rfi.stage)}</Typography>
                      </FieldCell>
                      <FieldCell>
                        <Typography intent="label" style={{ fontWeight: 600 }}>Drawing Number</Typography>
                        <Typography intent="body">{rfi.drawingNumber ?? "—"}</Typography>
                      </FieldCell>
                      <FieldCell>
                        <Typography intent="label" style={{ fontWeight: 600 }}>Cost Code</Typography>
                        <Typography intent="body">{rfi.costCode ?? "—"}</Typography>
                      </FieldCell>
                      <FieldCell>
                        <Typography intent="label" style={{ fontWeight: 600 }}>Date Initiated</Typography>
                        <Typography intent="body">{formatDateMMDDYYYY(rfi.dateInitiated)}</Typography>
                      </FieldCell>

                      <FieldCell>
                        <Typography intent="label" style={{ fontWeight: 600 }}>Schedule Impact</Typography>
                        <Typography intent="body">{formatScheduleImpact(rfi)}</Typography>
                      </FieldCell>
                      <FieldCell>
                        <Typography intent="label" style={{ fontWeight: 600 }}>Cost Impact</Typography>
                        <Typography intent="body">{formatCostImpact(rfi)}</Typography>
                      </FieldCell>
                      <FieldCell>
                        <Typography intent="label" style={{ fontWeight: 600 }}>Reference</Typography>
                        <Typography intent="body">{rfi.reference ?? "—"}</Typography>
                      </FieldCell>
                      <FieldCell>
                        <Typography intent="label" style={{ fontWeight: 600 }}>Private</Typography>
                        <Typography intent="body" style={{ color: "var(--color-text-secondary)" }}>
                          {rfi.private
                            ? "Yes — visible only to RFI Admins, Manager, Assignees, Creator, and Distribution List"
                            : "No"
                          }
                        </Typography>
                      </FieldCell>
                    </FieldGrid>
                  </SectionCard>
                </>
              )}

              {activeTab.startsWith("Related Items") && (
                <SectionCard>
                  <Box padding="xl" style={{ textAlign: "center", color: "var(--color-text-secondary)" }}>
                    <Typography intent="body">No related items.</Typography>
                  </Box>
                </SectionCard>
              )}

              {activeTab.startsWith("Emails") && (
                <SectionCard>
                  <Box padding="xl" style={{ textAlign: "center", color: "var(--color-text-secondary)" }}>
                    <Typography intent="body">No emails.</Typography>
                  </Box>
                </SectionCard>
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
      </Tearsheet>
    </>
  );
}
