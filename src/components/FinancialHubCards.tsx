import React, { useMemo, useState } from "react";
import { Button, Pill, Select, Tooltip } from "@procore/core-react";
import { EllipsisVertical, Info } from "@procore/core-icons";
import styled from "styled-components";
import HubCardFrame from "@/components/hubs/HubCardFrame";
import KPIPill from "@/components/KPIPill";
import { sampleProjectRows } from "@/data/projects";
import { useHubFilters } from "@/context/HubFilterContext";

const KpiGridWrap = styled.div`
  display: flex;
  height: 100%;
  align-items: center;
`;

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  width: 100%;
`;

const KpiTile = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
`;

const KpiLabel = styled.div`
  font-size: 12px;
  font-weight: 400;
  color: var(--color-text-primary);
  line-height: 16px;
  letter-spacing: 0.15px;
`;

const KpiValue = styled.div`
  font-size: 24px;
  font-weight: 500;
  color: var(--color-text-primary);
  line-height: 1.15;
  letter-spacing: 0.15px;
`;

const KpiTrendRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const TrendInfoButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: var(--color-text-secondary);
  line-height: 1;

  &:hover {
    color: var(--color-text-primary);
  }
`;

const InvoiceList = styled.div`
  width: 100%;
  overflow: hidden;
`;

const InvoiceRow = styled.div`
  display: grid;
  grid-template-columns: 160px 1fr auto auto;
  padding: 8px;
  gap: 8px;
  border-bottom: 1px solid var(--color-border-separator);

  &:last-child {
    border-bottom: none;
  }
`;

const InvoiceLink = styled.a`
  color: var(--color-text-link);
  font-size: 14px;
  line-height: 20px;
  text-decoration: underline;
  font-weight: 600;
  cursor: pointer;
  display: inline-block;
  width: 100%;
  max-width: 180px;
  align-content: center;
`;

const InvoiceMeta = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  text-align: left;
`;

const Amount = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 16px;
`;

const Company = styled.div`
  font-size: 12px;
  color: var(--color-text-primary);
  line-height: 16px;
`;

function formatCurrency(n: number): string {
  if (Math.abs(n) >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}bn`;
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
}

const invoiceRows = [
  { invoice: "Invoice #234", amount: "$20,000", company: "Vertigo Construction" },
  { invoice: "Invoice #001-109", amount: "$205,445", company: "ABC Construction" },
  { invoice: "Invoice #004-277", amount: "$10,250", company: "Vertigo Construction" },
  { invoice: "Invoice #002-247", amount: "$88,264", company: "Catalyst CM" },
  { invoice: "Invoice #001-114", amount: "$32,505", company: "ABC Construction" },
  { invoice: "Invoice #002-259", amount: "$157,990", company: "Catalyst CM" },
];

export function FinancialScorecardCard() {
  const [view, setView] = useState("Budget View");
  const [snapshot, setSnapshot] = useState("Budget Snapshot");
  const { filteredProjectRows } = useHubFilters();
  const valuePillColor = useMemo(() => "green" as const, []);
  const financialKpis = useMemo(() => {
    const revisedBudget = filteredProjectRows.reduce((sum, p) => sum + p.originalBudget, 0);
    const forecastToComplete = filteredProjectRows.reduce((sum, p) => sum + p.forecastToComplete, 0);
    const jobToDateCosts = filteredProjectRows.reduce((sum, p) => sum + p.jobToDateCost, 0);
    const estCostAtCompletion = filteredProjectRows.reduce(
      (sum, p) => sum + p.estimatedCostAtCompletion,
      0
    );
    const totalCommitted = filteredProjectRows.reduce(
      (sum, p) => sum + p.jobToDateCost + p.forecastToComplete * 0.35,
      0
    );
    const invoicedToDate = filteredProjectRows.reduce(
      (sum, p) => sum + p.jobToDateCost * 0.72,
      0
    );
    const forecastVsBudget =
      revisedBudget > 0 ? (estCostAtCompletion / revisedBudget) * 100 : 0;
    const projectedOverUnder = estCostAtCompletion - revisedBudget;

    return [
      { label: "Revised Budget", value: formatCurrency(revisedBudget), delta: "+2.4%", tone: "positive" as const, trendValue: 1, tooltipText: "Revised Budget increased 2.4% vs. the last 30 days. Budget adjustments approved across active projects." },
      { label: "Forecast to Complete", value: formatCurrency(forecastToComplete), delta: "-3.1%", tone: "positive" as const, trendValue: -1, tooltipText: "Forecast to Complete decreased 3.1% vs. the last 30 days. Remaining cost projections have improved across the portfolio." },
      { label: "Job to Date Costs", value: formatCurrency(jobToDateCosts), delta: "+5.7%", tone: "negative" as const, trendValue: 1, tooltipText: "Job to Date Costs increased 5.7% vs. the last 30 days. Spending is tracking above the prior period pace." },
      { label: "Total Committed", value: formatCurrency(totalCommitted), delta: "+1.8%", tone: "negative" as const, trendValue: 1, tooltipText: "Total Committed increased 1.8% vs. the last 30 days. New commitments and change orders have been executed." },
      { label: "% Forecast/Budget", value: `${forecastVsBudget.toFixed(2)}%`, delta: "-0.6%", tone: "positive" as const, trendValue: -1, tooltipText: "% Forecast/Budget decreased 0.6 pts vs. the last 30 days. The forecast-to-budget ratio is trending closer to 100%." },
      {
        label: "Projected Over/Under",
        value: `${projectedOverUnder >= 0 ? "+" : "-"}${formatCurrency(Math.abs(projectedOverUnder))}`,
        delta: projectedOverUnder > 0 ? "+4.2%" : "-4.2%",
        tone: projectedOverUnder > 0 ? ("negative" as const) : projectedOverUnder < 0 ? ("positive" as const) : ("neutral" as const),
        trendValue: projectedOverUnder > 0 ? -1 : projectedOverUnder < 0 ? 1 : 0,
        tooltipText: projectedOverUnder > 0
          ? "Projected Over/Under worsened 4.2% vs. the last 30 days. The portfolio is tracking further over budget."
          : "Projected Over/Under improved 4.2% vs. the last 30 days. The portfolio is tracking closer to budget.",
      },
      { label: "Invoiced to Date", value: formatCurrency(invoicedToDate), delta: "+8.3%", tone: "positive" as const, trendValue: 1, tooltipText: "Invoiced to Date increased 8.3% vs. the last 30 days. Invoice volume has accelerated across active projects." },
      { label: "Est Cost of Completion", value: formatCurrency(estCostAtCompletion), delta: "-1.2%", tone: "positive" as const, trendValue: -1, tooltipText: "Est Cost of Completion decreased 1.2% vs. the last 30 days. Overall cost-at-completion projections have improved." },
    ];
  }, [filteredProjectRows]);

  return (
    <HubCardFrame
      title="Financial Scorecard"
      infoTooltip="Portfolio financial KPIs from seeded budget/forecast data, including revised budget, cost-to-complete, commitments, and variance indicators."
      titleSuffix={null}
      actions={
        <Button
          className="b_tertiary"
          variant="tertiary"
          size="sm"
          icon={<EllipsisVertical size="sm" />}
          aria-label="Financial scorecard actions"
        />
      }
      controls={
        <>
          <Select
            onSelect={(next) => {
              if (typeof next === "string") setView(next);
            }}
            placeholder="Budget View"
            style={{ minWidth: 180 }}
          >
            <Select.Option value="Budget View" selected={view === "Budget View"}>
              Budget View
            </Select.Option>
            <Select.Option value="Forecast View" selected={view === "Forecast View"}>
              Forecast View
            </Select.Option>
          </Select>
          <Select
            onSelect={(next) => {
              if (typeof next === "string") setSnapshot(next);
            }}
            placeholder="Budget Snapshot"
            style={{ minWidth: 180 }}
          >
            <Select.Option value="Budget Snapshot" selected={snapshot === "Budget Snapshot"}>
              Budget Snapshot
            </Select.Option>
            <Select.Option value="Current Snapshot" selected={snapshot === "Current Snapshot"}>
              Current Snapshot
            </Select.Option>
          </Select>
        </>
      }
    >
      <KpiGridWrap>
      <KpiGrid>
        {financialKpis.map((kpi) => (
          <KpiTile key={kpi.label}>
            <KpiLabel>{kpi.label}</KpiLabel>
            <KpiValue>{kpi.value}</KpiValue>
            <KpiTrendRow>
              <KPIPill tone={kpi.tone} trendValue={kpi.trendValue} value={kpi.delta} />
              <Tooltip
                trigger="hover"
                placement="top"
                overlay={
                  <Tooltip.Content>
                    <div style={{ maxWidth: 240, whiteSpace: "normal" }}>{kpi.tooltipText}</div>
                  </Tooltip.Content>
                }
              >
                <TrendInfoButton aria-label={`Trend info for ${kpi.label}`}>
                  <Info size="sm" />
                </TrendInfoButton>
              </Tooltip>
            </KpiTrendRow>
          </KpiTile>
        ))}
      </KpiGrid>
      </KpiGridWrap>
    </HubCardFrame>
  );
}

export function InvoicesForApprovalCard() {
  const [dateRange, setDateRange] = useState("10/01/25-10/31/25");
  const [company, setCompany] = useState("All Companies");

  return (
    <HubCardFrame
      title="Invoices for Approval"
      infoTooltip="Invoices currently awaiting approval from the seeded invoice list, filtered by date range and company."
      actions={
        <Button
          className="b_tertiary"
          variant="tertiary"
          size="sm"
          icon={<EllipsisVertical size="sm" />}
          aria-label="More actions"
        />
      }
      controls={
        <>
          <Select
            onSelect={(next) => {
              if (typeof next === "string") setDateRange(next);
            }}
            placeholder="Date range"
            style={{ minWidth: 190 }}
          >
            <Select.Option value="10/01/25-10/31/25" selected={dateRange === "10/01/25-10/31/25"}>
              10/01/25-10/31/25
            </Select.Option>
            <Select.Option value="11/01/25-11/30/25" selected={dateRange === "11/01/25-11/30/25"}>
              11/01/25-11/30/25
            </Select.Option>
          </Select>
          <Select
            onSelect={(next) => {
              if (typeof next === "string") setCompany(next);
            }}
            placeholder="All Companies"
            style={{ minWidth: 180 }}
          >
            <Select.Option value="All Companies" selected={company === "All Companies"}>
              All Companies
            </Select.Option>
            <Select.Option value="ABC Construction" selected={company === "ABC Construction"}>
              ABC Construction
            </Select.Option>
            <Select.Option value="Vertigo Construction" selected={company === "Vertigo Construction"}>
              Vertigo Construction
            </Select.Option>
            <Select.Option value="Catalyst CM" selected={company === "Catalyst CM"}>
              Catalyst CM
            </Select.Option>
          </Select>
        </>
      }
    >
      <InvoiceList>
        {invoiceRows.map((row) => (
          <InvoiceRow key={row.invoice}>
            <InvoiceLink href="#" aria-label={`Open ${row.invoice}`}>
              {row.invoice}
            </InvoiceLink>
            <InvoiceMeta>
              <Amount>{row.amount}</Amount>
              <Company>{row.company}</Company>
            </InvoiceMeta>
            <Button variant="secondary" className="b_secondary" size="sm">View</Button>
          </InvoiceRow>
        ))}
      </InvoiceList>
    </HubCardFrame>
  );
}
