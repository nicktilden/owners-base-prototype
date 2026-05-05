import React from "react";
import { Typography } from "@procore/core-react";
import styled from "styled-components";
import type { CapitalPlanningProgramSummaryMetrics } from "@/components/tools/capitalPlanning/capitalPlanningProgramSummaryMetrics";

const Root = styled.div<{ $flushBottom?: boolean }>`
  /* Match @procore/core-react Typography / inputs (font-family: inherit from design system). */
  font-family: inherit;
  flex: 0 0 auto;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  margin-bottom: ${({ $flushBottom }) => ($flushBottom ? 0 : "16px")};
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
`;

const TwoColumnGrid = styled.div`
  font-family: inherit;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px 24px;
  width: 100%;
  min-width: 0;
  align-items: start;
`;

const MetricColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
`;

const MetricBlock = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const LabelRow = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
`;

const ValueText = styled.div`
  font-family: inherit;
  font-size: 26px;
  line-height: 32px;
  font-weight: 500;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

function formatUsdAbbrev(n: number): string {
  const x = Number.isFinite(n) ? n : 0;
  const sign = x < 0 ? "-" : "";
  const v = Math.abs(x);
  if (v >= 1e9) return `${sign}$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `${sign}$${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `${sign}$${(v / 1e3).toFixed(2)}K`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(x);
}

export interface CapitalPlanningProgramSummaryCardsProps {
  metrics: CapitalPlanningProgramSummaryMetrics;
  omitHeader?: boolean;
  compact?: boolean;
}

function splitIntoTwoColumns<T>(arr: readonly T[]): [T[], T[]] {
  const mid = Math.ceil(arr.length / 2);
  return [arr.slice(0, mid) as T[], arr.slice(mid) as T[]];
}

export function CapitalPlanningProgramSummaryCards({
  metrics,
  omitHeader = false,
}: CapitalPlanningProgramSummaryCardsProps): React.ReactElement {
  const items: readonly { label: string; value: string }[] = [
    { label: "Planned Amount", value: formatUsdAbbrev(metrics.totalPlannedAmount) },
    { label: "Original Budget", value: formatUsdAbbrev(metrics.totalOriginalBudget) },
    { label: "Revised Budget", value: formatUsdAbbrev(metrics.totalRevisedBudget) },
    { label: "Job to Date Costs", value: formatUsdAbbrev(metrics.totalJobToDateCosts) },
    { label: "Forecast to Complete", value: formatUsdAbbrev(metrics.forecastToComplete) },
    { label: "Estimated Cost at Completion", value: formatUsdAbbrev(metrics.estimatedCostAtCompletion) },
    { label: "Remaining to Forecast", value: formatUsdAbbrev(metrics.remainingToForecast) },
  ];

  const [leftCol, rightCol] = splitIntoTwoColumns(items);

  const renderColumn = (col: readonly { label: string; value: string }[]) => (
    <MetricColumn>
      {col.map((m) => (
        <MetricBlock key={m.label}>
          <LabelRow>
            <Typography intent="body" breakWord style={{ color: "var(--color-text-secondary)", minWidth: 0 }}>
              {m.label}
            </Typography>
          </LabelRow>
          <ValueText>{m.value}</ValueText>
        </MetricBlock>
      ))}
    </MetricColumn>
  );

  return (
    <Root className="capital-planning-program-summary-cards" $flushBottom={omitHeader}>
      {omitHeader ? null : (
        <HeaderRow>
          <Typography intent="body" weight="semibold" as="h2" style={{ margin: 0 }}>
            Capital Plan Summary
          </Typography>
        </HeaderRow>
      )}
      <TwoColumnGrid>
        {renderColumn(leftCol)}
        {renderColumn(rightCol)}
      </TwoColumnGrid>
    </Root>
  );
}
