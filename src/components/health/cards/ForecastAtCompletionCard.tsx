/**
 * FORECAST AT COMPLETION CARD — Use Case #4 Financial
 * EAC = Original Contract + Approved COs + Pending CE Exposure, compared to Budget.
 */

import React, { useMemo } from 'react';
import { Pill, Typography } from '@procore/core-react';
import styled from 'styled-components';
import HubCardFrame, { HubCardEmptyState } from '@/components/hubs/HubCardFrame';
import { useData } from '@/context/DataContext';

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border-separator);
  &:last-child { border-bottom: none; }
`;

const SummaryRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 12px 0 16px;
`;

const Metric = styled.div`
  padding: 12px;
  border-radius: 8px;
  background: var(--color-surface-secondary);
  text-align: center;
`;

function fmtM(n: number) {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

interface Props {
  scope?: 'portfolio' | 'project';
  projectId?: string;
}

export default function ForecastAtCompletionCard({ scope = 'portfolio', projectId }: Props) {
  const { data } = useData();

  const projectForecasts = useMemo(() => {
    const projects = data.projects ?? [];
    const changeEvents = data.changeEvents ?? [];
    const budgetLines = data.budgetLineItems ?? [];

    const filtered = scope === 'project' && projectId
      ? projects.filter((p: any) => p.id === projectId)
      : projects.filter((p: any) => p.status === 'active');

    return filtered.map((p: any) => {
      // Original budget from budget lines
      const budget = budgetLines
        .filter((b: any) => b.projectId === p.id)
        .reduce((s: number, b: any) => s + (b.originalBudget ?? 0), 0);

      // Approved change orders
      const approvedCOValue = changeEvents
        .filter((ce: any) => ce.projectId === p.id && ce.status === 'Approved')
        .reduce((s: number, ce: any) => s + (ce.currentEstimate ?? ce.value ?? 0), 0);

      // Pending exposure
      const pendingExposure = changeEvents
        .filter((ce: any) => ce.projectId === p.id && ['Open', 'Under Review', 'Pending Pricing'].includes(ce.status))
        .reduce((s: number, ce: any) => s + (ce.currentEstimate ?? 0), 0);

      const eac = budget + approvedCOValue + pendingExposure;
      const variance = eac - budget;
      const variancePct = budget > 0 ? (variance / budget) * 100 : 0;

      return {
        projectId: p.id,
        projectName: p.name,
        budget,
        eac,
        variance,
        variancePct: Math.round(variancePct * 10) / 10,
        status: variancePct >= 10 ? 'red' as const : variancePct >= 5 ? 'yellow' as const : 'green' as const,
      };
    })
    .filter((f: any) => f.budget > 0)
    .sort((a: any, b: any) => b.variancePct - a.variancePct);
  }, [data.projects, data.changeEvents, data.budgetLineItems, scope, projectId]);

  const totalBudget = projectForecasts.reduce((s: number, f: any) => s + f.budget, 0);
  const totalEAC = projectForecasts.reduce((s: number, f: any) => s + f.eac, 0);
  const overBudgetCount = projectForecasts.filter((f: any) => f.status !== 'green').length;

  if (projectForecasts.length === 0) {
    return (
      <HubCardFrame title="Forecast at Completion" infoTooltip="EAC = Original Budget + Approved COs + Pending CE Exposure.">
        <HubCardEmptyState title="No Forecast Data" body="No budget data available for active projects." />
      </HubCardFrame>
    );
  }

  return (
    <HubCardFrame
      title="Forecast at Completion"
      infoTooltip="EAC = Original Budget + Approved COs + Pending CE Exposure. Variance % shown against original budget."
      titleSuffix={overBudgetCount > 0 ? <Pill color="yellow">{overBudgetCount} over budget</Pill> : undefined}
    >
      {scope === 'portfolio' && (
        <SummaryRow>
          <Metric>
            <Typography intent="small" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{fmtM(totalBudget)}</Typography>
            <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>Budget</Typography>
          </Metric>
          <Metric>
            <Typography intent="small" style={{ fontWeight: 600, color: totalEAC > totalBudget ? 'var(--color-pill-text-red)' : 'var(--color-text-primary)' }}>
              {fmtM(totalEAC)}
            </Typography>
            <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>EAC</Typography>
          </Metric>
          <Metric>
            <Typography intent="small" style={{ fontWeight: 600, color: totalEAC - totalBudget > 0 ? 'var(--color-pill-text-red)' : 'var(--color-pill-text-green)' }}>
              {fmtM(totalEAC - totalBudget)}
            </Typography>
            <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>Variance</Typography>
          </Metric>
        </SummaryRow>
      )}

      {projectForecasts.slice(0, 5).map((forecast: any) => (
        <Row key={forecast.projectId}>
          <div style={{ minWidth: 0 }}>
            <Typography intent="small" style={{ fontWeight: 600, color: 'var(--color-text-primary)', display: 'block' }}>
              {forecast.projectName.length > 40 ? forecast.projectName.slice(0, 40) + '…' : forecast.projectName}
            </Typography>
            <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
              EAC: {fmtM(forecast.eac)} · Budget: {fmtM(forecast.budget)}
            </Typography>
          </div>
          <Pill color={forecast.status}>
            {forecast.variance > 0 ? '+' : ''}{forecast.variancePct.toFixed(1)}%
          </Pill>
        </Row>
      ))}
    </HubCardFrame>
  );
}
