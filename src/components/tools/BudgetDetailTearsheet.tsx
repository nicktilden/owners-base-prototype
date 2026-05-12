import React, { useState } from "react";
import { Box, Button, Card, H2, Page, Pill, Tabs, Tearsheet, Typography } from "@procore/core-react";
import { Pencil } from "@procore/core-icons";
import styled, { createGlobalStyle } from "styled-components";
import type { BudgetLineItem } from "@/types/budget";
import { calculateBudget } from "@/types/budget";

const TearsheetWidth = createGlobalStyle`
  [class*="StyledTearsheetBody"]:has(> .budget-detail-tearsheet-root) {
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

const SectionCard = styled(Card)`
  padding: 24px;
  background: var(--color-surface-primary);
  margin-bottom: 16px;
`;

const PROGRAM_LABELS: Record<string, string> = {
  AC: "Acute Care",
  OP: "Outpatient",
  RE: "Research",
  FA: "Facilities",
};

const COST_TYPE_LABELS: Record<string, string> = {
  L: "Labor",
  M: "Material",
  E: "Equipment",
  S: "Subcontract",
  P: "Professional Fees",
  F: "Permits",
  I: "Insurance",
  C: "Contingency",
  O: "Overhead",
};

function fmt(n: number): string {
  if (n === 0) return "$0";
  const abs = Math.abs(n);
  const prefix = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${prefix}$${(abs / 1_000_000).toFixed(2)}M`;
  return `${prefix}${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(abs)}`;
}

const TABS = ["Details", "Change History"] as const;
type TabName = typeof TABS[number];

interface Props {
  item: BudgetLineItem | null;
  open: boolean;
  onClose: () => void;
}

export default function BudgetDetailTearsheet({ item, open, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<TabName>("Details");

  if (!item) return null;

  const calc = calculateBudget(item);
  const overUnderColor = calc.projectedOverUnder < 0 ? "red" : "green";

  return (
    <>
      <TearsheetWidth />
      <Tearsheet open={open} onClose={onClose} aria-label="Budget line item details" placement="right">
        <div className="budget-detail-tearsheet-root" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <Page style={{ height: "100%", background: "var(--color-surface-primary)", color: "var(--color-text-primary)" }}>
            <Page.Main style={{ height: "100%", overflow: "hidden", background: "var(--color-surface-primary)" }}>
              <Page.Header style={{ background: "var(--color-surface-primary)", borderColor: "var(--color-border-separator)" }}>
                <Page.Title>
                  <Box style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography intent="h2">{item.costCode} — {COST_TYPE_LABELS[item.costTypeCode] ?? item.costTypeCode}</Typography>
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
                {activeTab === "Details" && (
                  <>
                    <SectionCard>
                      <H2 style={{ marginBottom: 20 }}>Line Item</H2>
                      <FieldGrid>
                        <FieldCell>
                          <Typography intent="label" style={{ fontWeight: 600 }}>Cost Code</Typography>
                          <Typography intent="body">{item.costCode}</Typography>
                        </FieldCell>
                        <FieldCell>
                          <Typography intent="label" style={{ fontWeight: 600 }}>Program</Typography>
                          <Typography intent="body">{PROGRAM_LABELS[item.programCode] ?? item.programCode}</Typography>
                        </FieldCell>
                        <FieldCell>
                          <Typography intent="label" style={{ fontWeight: 600 }}>Cost Type</Typography>
                          <Typography intent="body">{COST_TYPE_LABELS[item.costTypeCode] ?? item.costTypeCode}</Typography>
                        </FieldCell>
                        <FieldCell>
                          <Typography intent="label" style={{ fontWeight: 600 }}>Over / Under</Typography>
                          <div style={{ alignSelf: "flex-start" }}>
                            <Pill color={overUnderColor}>{fmt(calc.projectedOverUnder)}</Pill>
                          </div>
                        </FieldCell>
                      </FieldGrid>
                    </SectionCard>

                    <SectionCard>
                      <H2 style={{ marginBottom: 20 }}>Budget</H2>
                      <FieldGrid>
                        <FieldCell>
                          <Typography intent="label" style={{ fontWeight: 600 }}>Original Budget</Typography>
                          <Typography intent="body">{fmt(item.originalBudgetAmount)}</Typography>
                        </FieldCell>
                        <FieldCell>
                          <Typography intent="label" style={{ fontWeight: 600 }}>Approved COs</Typography>
                          <Typography intent="body">{fmt(item.approvedCOs)}</Typography>
                        </FieldCell>
                        <FieldCell>
                          <Typography intent="label" style={{ fontWeight: 600 }}>Budget Changes</Typography>
                          <Typography intent="body">{fmt(item.budgetChanges)}</Typography>
                        </FieldCell>
                        <FieldCell>
                          <Typography intent="label" style={{ fontWeight: 600 }}>Revised Budget</Typography>
                          <Typography intent="body" style={{ fontWeight: 600 }}>{fmt(calc.revisedBudget)}</Typography>
                        </FieldCell>
                        <FieldCell>
                          <Typography intent="label" style={{ fontWeight: 600 }}>Projected Budget</Typography>
                          <Typography intent="body" style={{ fontWeight: 600 }}>{fmt(calc.projectedBudget)}</Typography>
                        </FieldCell>
                        <FieldCell>
                          <Typography intent="label" style={{ fontWeight: 600 }}>Pending Risk</Typography>
                          <Typography intent="body">{fmt(item.pendingRisk)}</Typography>
                        </FieldCell>
                      </FieldGrid>
                    </SectionCard>

                    <SectionCard>
                      <H2 style={{ marginBottom: 20 }}>Costs</H2>
                      <FieldGrid>
                        <FieldCell>
                          <Typography intent="label" style={{ fontWeight: 600 }}>Committed Costs</Typography>
                          <Typography intent="body">{fmt(item.committedCosts)}</Typography>
                        </FieldCell>
                        <FieldCell>
                          <Typography intent="label" style={{ fontWeight: 600 }}>Direct Costs</Typography>
                          <Typography intent="body">{fmt(item.directCosts)}</Typography>
                        </FieldCell>
                        <FieldCell>
                          <Typography intent="label" style={{ fontWeight: 600 }}>Pending Cost Changes</Typography>
                          <Typography intent="body">{fmt(item.pendingCostChanges)}</Typography>
                        </FieldCell>
                        <FieldCell>
                          <Typography intent="label" style={{ fontWeight: 600 }}>Subcontractor Invoices</Typography>
                          <Typography intent="body">{fmt(item.subcontractorInvoices)}</Typography>
                        </FieldCell>
                        <FieldCell>
                          <Typography intent="label" style={{ fontWeight: 600 }}>Job-to-Date Costs</Typography>
                          <Typography intent="body">{fmt(calc.jobToDateCosts)}</Typography>
                        </FieldCell>
                        <FieldCell>
                          <Typography intent="label" style={{ fontWeight: 600 }}>Est. Cost at Completion</Typography>
                          <Typography intent="body" style={{ fontWeight: 600 }}>{fmt(calc.estimatedCostAtCompletion)}</Typography>
                        </FieldCell>
                      </FieldGrid>
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
