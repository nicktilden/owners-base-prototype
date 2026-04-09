import React, { useMemo, useState } from "react";
import {
  Button,
  Dropdown,
  SplitViewCard,
  Table,
  Select,
} from "@procore/core-react";
import {
  ChartBar as BudgetIcon,
  Plus,
} from "@procore/core-icons";
import { budgetLineItems } from "@/data/seed/budget";
import { projects } from "@/data/seed/projects";
import type { BudgetLineItem } from "@/types/budget";
import { calculateBudget } from "@/types/budget";
import styled from "styled-components";
import ToolPageLayout from "@/components/tools/ToolPageLayout";
import { PINNED_BODY_CELL_STYLE, PINNED_HEADER_CELL_STYLE, StandardRowActions } from "@/components/table/TableActions";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(n: number): string {
  if (n === 0) return "$0";
  if (Math.abs(n) >= 1_000_000) {
    return `$${(n / 1_000_000).toFixed(2)}M`;
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

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

const PROGRAM_LABELS: Record<string, string> = {
  AC: "Acute Care",
  OP: "Outpatient",
  RE: "Research",
  FA: "Facilities",
};

const TotalsRow = styled.tr`
  background: var(--color-surface-secondary);
  font-weight: 700;
  border-top: 2px solid #c4cbcf;
`;

// ─── Component ────────────────────────────────────────────────────────────────

interface BudgetContentProps {
  projectId: string;
}

export default function BudgetContent({ projectId }: BudgetContentProps) {
  const isPortfolio = projectId === "";
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const project = useMemo(() => projects.find((p) => p.id === projectId), [projectId]);
  const projectLabel = project ? `${project.number} ${project.name}` : projectId;
  const projectMap = useMemo(() => {
    const m = new Map<string, string>();
    projects.forEach((p) => m.set(p.id, `${p.number} ${p.name}`));
    return m;
  }, []);
  const projectOptions = useMemo(() => {
    const ids = new Set(budgetLineItems.map((b) => b.projectId));
    return projects.filter((p) => ids.has(p.id));
  }, []);

  const lineItems = useMemo<BudgetLineItem[]>(() => {
    let base = isPortfolio
      ? [...budgetLineItems]
      : budgetLineItems.filter((b) => b.projectId === projectId);
    if (isPortfolio && selectedProjectIds.length > 0) {
      base = base.filter((b) => selectedProjectIds.includes(b.projectId));
    }
    return base;
  }, [projectId, isPortfolio, selectedProjectIds]);

  const totals = useMemo(() => {
    return lineItems.reduce(
      (acc, item) => {
        const calc = calculateBudget(item);
        return {
          originalBudgetAmount: acc.originalBudgetAmount + item.originalBudgetAmount,
          approvedCOs: acc.approvedCOs + item.approvedCOs,
          revisedBudget: acc.revisedBudget + calc.revisedBudget,
          committedCosts: acc.committedCosts + item.committedCosts,
          directCosts: acc.directCosts + item.directCosts,
          projectedOverUnder: acc.projectedOverUnder + calc.projectedOverUnder,
        };
      },
      { originalBudgetAmount: 0, approvedCOs: 0, revisedBudget: 0, committedCosts: 0, directCosts: 0, projectedOverUnder: 0 }
    );
  }, [lineItems]);

  const breadcrumbs = [
    { label: "Portfolio", href: "/portfolio" },
    ...(projectId ? [{ label: projectLabel, href: `/project/${projectId}` }] : []),
  ];

  const actions = (
    <>
      <Dropdown label="Export" variant="secondary" className="b_secondary">
        <Dropdown.Item item="csv">CSV</Dropdown.Item>
        <Dropdown.Item item="excel">Excel</Dropdown.Item>
      </Dropdown>
      <Button variant="primary" className="b_primary" icon={<Plus />}>Add Line Item</Button>
    </>
  );

  return (
    <ToolPageLayout
      title="Budget"
      icon={<BudgetIcon size="md" />}
      breadcrumbs={breadcrumbs}
      actions={actions}
    >
      <SplitViewCard style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-card-border)', borderRadius: '4px' }}>
        <SplitViewCard.Main style={{ background: 'var(--color-surface-primary)' }}>
          <SplitViewCard.Section heading="Budget">
            {isPortfolio && (
              <div style={{ marginBottom: 12, maxWidth: 320 }}>
                <Select
                  placeholder="Filter by project"
                  label={selectedProjectIds.length ? `${selectedProjectIds.length} selected` : undefined}
                  onSelect={(s) => {
                    const id = s.item as string;
                    setSelectedProjectIds((prev) =>
                      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                    );
                  }}
                  onClear={() => setSelectedProjectIds([])}
                  block
                >
                  {projectOptions.map((p) => (
                    <Select.Option key={p.id} value={p.id} selected={selectedProjectIds.includes(p.id)}>
                      {p.number} {p.name}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            )}
            <Table.Container>
              <Table>
                <Table.Header>
                  <Table.HeaderRow>
                    {isPortfolio && <Table.HeaderCell>Project</Table.HeaderCell>}
                    <Table.HeaderCell>Program</Table.HeaderCell>
                    <Table.HeaderCell>Cost Type</Table.HeaderCell>
                    <Table.HeaderCell>Cost Code</Table.HeaderCell>
                    <Table.HeaderCell>Original Budget</Table.HeaderCell>
                    <Table.HeaderCell>Approved COs</Table.HeaderCell>
                    <Table.HeaderCell>Revised Budget</Table.HeaderCell>
                    <Table.HeaderCell>Committed Costs</Table.HeaderCell>
                    <Table.HeaderCell>Direct Costs</Table.HeaderCell>
                    <Table.HeaderCell>Over / Under</Table.HeaderCell>
                    <Table.HeaderCell style={PINNED_HEADER_CELL_STYLE}>Actions</Table.HeaderCell>
                  </Table.HeaderRow>
                </Table.Header>
                <Table.Body>
                  {lineItems.length === 0 ? (
                    <Table.BodyRow>
                      <Table.BodyCell colSpan={isPortfolio ? 11 : 10}>
                        <Table.TextCell>No budget line items have been added to this project.</Table.TextCell>
                      </Table.BodyCell>
                    </Table.BodyRow>
                  ) : (
                    <>
                      {lineItems.map((item) => {
                        const calc = calculateBudget(item);
                        const overUnderColor =
                          calc.projectedOverUnder > 0
                            ? "#1a7d3a"
                            : calc.projectedOverUnder < 0
                            ? "#b91c1c"
                            : undefined;
                        return (
                          <Table.BodyRow key={item.id}>
                            {isPortfolio && (
                              <Table.BodyCell>
                                <Table.TextCell>
                                  <span style={{ color: "var(--color-text-link)", cursor: "pointer" }}>
                                    {projectMap.get(item.projectId) ?? item.projectId}
                                  </span>
                                </Table.TextCell>
                              </Table.BodyCell>
                            )}
                            <Table.BodyCell>
                              <Table.TextCell>
                                {PROGRAM_LABELS[item.programCode] ?? item.programCode}
                              </Table.TextCell>
                            </Table.BodyCell>
                            <Table.BodyCell>
                              <Table.TextCell>
                                {COST_TYPE_LABELS[item.costTypeCode] ?? item.costTypeCode}
                              </Table.TextCell>
                            </Table.BodyCell>
                            <Table.BodyCell>
                              <Table.TextCell>
                                <span style={{ color: "var(--color-text-secondary)", fontSize: 13 }}>{item.costCode}</span>
                              </Table.TextCell>
                            </Table.BodyCell>
                            <Table.BodyCell>
                              <Table.TextCell style={{ textAlign: "right" }}>
                                {formatCurrency(item.originalBudgetAmount)}
                              </Table.TextCell>
                            </Table.BodyCell>
                            <Table.BodyCell>
                              <Table.TextCell style={{ textAlign: "right" }}>
                                {formatCurrency(item.approvedCOs)}
                              </Table.TextCell>
                            </Table.BodyCell>
                            <Table.BodyCell>
                              <Table.TextCell style={{ textAlign: "right", fontWeight: 600 }}>
                                {formatCurrency(calc.revisedBudget)}
                              </Table.TextCell>
                            </Table.BodyCell>
                            <Table.BodyCell>
                              <Table.TextCell style={{ textAlign: "right" }}>
                                {formatCurrency(item.committedCosts)}
                              </Table.TextCell>
                            </Table.BodyCell>
                            <Table.BodyCell>
                              <Table.TextCell style={{ textAlign: "right" }}>
                                {formatCurrency(item.directCosts)}
                              </Table.TextCell>
                            </Table.BodyCell>
                            <Table.BodyCell>
                              <Table.TextCell style={{ textAlign: "right", color: overUnderColor, fontWeight: 600 }}>
                                {formatCurrency(calc.projectedOverUnder)}
                              </Table.TextCell>
                            </Table.BodyCell>
                            <Table.BodyCell style={PINNED_BODY_CELL_STYLE}>
                              <StandardRowActions />
                            </Table.BodyCell>
                          </Table.BodyRow>
                        );
                      })}
                      <TotalsRow>
                        <td colSpan={isPortfolio ? 4 : 3} style={{ padding: "12px 16px", fontSize: 14 }}>Totals</td>
                        <td style={{ padding: "12px 16px", fontSize: 14, textAlign: "right" }}>
                          {formatCurrency(totals.originalBudgetAmount)}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 14, textAlign: "right" }}>
                          {formatCurrency(totals.approvedCOs)}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 14, textAlign: "right" }}>
                          {formatCurrency(totals.revisedBudget)}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 14, textAlign: "right" }}>
                          {formatCurrency(totals.committedCosts)}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 14, textAlign: "right" }}>
                          {formatCurrency(totals.directCosts)}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 14, textAlign: "right",
                          color: totals.projectedOverUnder > 0 ? "#1a7d3a" : totals.projectedOverUnder < 0 ? "#b91c1c" : undefined,
                        }}>
                          {formatCurrency(totals.projectedOverUnder)}
                        </td>
                        <td style={{ ...PINNED_BODY_CELL_STYLE, padding: "12px 16px" }} />
                      </TotalsRow>
                    </>
                  )}
                </Table.Body>
              </Table>
            </Table.Container>
          </SplitViewCard.Section>
        </SplitViewCard.Main>
      </SplitViewCard>
    </ToolPageLayout>
  );
}
