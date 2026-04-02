import React, { useMemo, useState } from "react";
import { Button, Pill, Select } from "@procore/core-react";
import { EllipsisVertical, Info } from "@procore/core-icons";
import styled from "styled-components";
import HubCardFrame from "@/components/hubs/HubCardFrame";

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 48px 24px;
  width: 100%;
`;

const KpiLabel = styled.div`
  font-size: 14px;
  color: #232729;
  line-height: 20px;
  letter-spacing: 0.15px;
`;

const KpiValueRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-top: 2px;
`;

const KpiValue = styled.div`
  font-size: 26px;
  font-weight: 500;
  color: #232729;
  line-height: 1.1;
  letter-spacing: 0.15px;
`;

const KpiDelta = styled.div`
  color: #d92626;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 2px;
`;

const InvoiceList = styled.div`
  width: 100%;
  border: 1px solid #d6dadc;
  border-radius: 8px;
  overflow: hidden;
`;

const InvoiceRow = styled.div`
  display: grid;
  grid-template-columns: 160px 1fr auto auto;
  padding: 8px;
  gap: 8px;
  border-bottom: 1px solid #d6dadc;

  &:last-child {
    border-bottom: none;
  }
`;

const InvoiceLink = styled.a`
  color: #1d5cc9;
  text-decoration: underline;
  font-size: 14px;
  line-height: 20px;
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
  color: #232729;
  line-height: 16px;
`;

const Company = styled.div`
  font-size: 12px;
  color: #232729;
  line-height: 16px;
`;

const financialKpis = [
  { label: "Revised Budget", value: "$2.45bn", delta: "0.0%" },
  { label: "Forecast to Complete", value: "$0.00", delta: "0.0%" },
  { label: "Job to Date Costs", value: "$1.38bn", delta: "0.0%" },
  { label: "Total Committed", value: "$6.73M", delta: "0.0%" },
  { label: "% Forecast/Budget", value: "$2.46bn", delta: "0.0%" },
  { label: "Projected Over/Under", value: "-$6.73M", delta: "0.0%" },
  { label: "Invoiced to Date", value: "$924M", delta: "0.0%" },
  { label: "Est Cost of Completion", value: "100.27%", delta: "0.0%" },
];

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
  const valuePillColor = useMemo(() => "green" as const, []);

  return (
    <HubCardFrame
      title="Financial Scorecard"
      titleSuffix={
        <>
          <Info size="sm" style={{ color: "#232729" }} />
          <Pill color={valuePillColor}>Value</Pill>
        </>
      }
      actions={
        <Button
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
      <KpiGrid>
        {financialKpis.map((kpi) => (
          <div key={kpi.label}>
            <KpiLabel>{kpi.label}</KpiLabel>
            <KpiValueRow>
              <KpiValue>{kpi.value}</KpiValue>
              <KpiDelta>
                <span style={{ fontSize: 16 }}>↓</span>
                <span>{kpi.delta}</span>
              </KpiDelta>
            </KpiValueRow>
          </div>
        ))}
      </KpiGrid>
    </HubCardFrame>
  );
}

export function InvoicesForApprovalCard() {
  const [dateRange, setDateRange] = useState("10/01/25-10/31/25");
  const [company, setCompany] = useState("All Companies");

  return (
    <HubCardFrame
      title="Invoices for Approval"
      titleSuffix={<Info size="sm" style={{ color: "#232729" }} />}
      actions={
        <Button
          variant="tertiary"
          size="sm"
          icon={<EllipsisVertical size="sm" />}
          aria-label="Invoices for Approval actions"
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
            <Button variant="secondary" size="sm">View</Button>
          </InvoiceRow>
        ))}
      </InvoiceList>
    </HubCardFrame>
  );
}
