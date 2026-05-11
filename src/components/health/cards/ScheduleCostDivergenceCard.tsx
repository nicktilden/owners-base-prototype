/**
 * SCHEDULE-COST DIVERGENCE CARD — Use Case #4 Financial
 * Shows divergence between physical % complete vs financial % billed per project.
 */

import React, { useMemo } from 'react';
import { Pill, Typography } from '@procore/core-react';
import styled from 'styled-components';
import HubCardFrame, { HubCardEmptyState } from '@/components/hubs/HubCardFrame';
import { useData } from '@/context/DataContext';
import { getScheduleCostDivergence } from '@/utils/healthRiskEngine';

const Row = styled.div`
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border-separator);
  &:last-child { border-bottom: none; }
`;

const RowHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const BarGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const BarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BarLabel = styled(Typography)`
  width: 60px;
  flex-shrink: 0;
  color: var(--color-text-secondary);
`;

const Bar = styled.div<{ $pct: number; $color: string }>`
  flex: 1;
  height: 8px;
  border-radius: 4px;
  background: var(--color-surface-secondary);
  overflow: hidden;
  position: relative;
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${({ $pct }) => Math.min(100, Math.max(0, $pct))}%;
    background: ${({ $color }) => $color};
    border-radius: 4px;
  }
`;

interface Props {
  scope?: 'portfolio' | 'project';
  projectId?: string;
}

export default function ScheduleCostDivergenceCard({ scope = 'portfolio', projectId }: Props) {
  const { data } = useData();

  const divergenceItems = useMemo(() => {
    const projects = data.projects ?? [];
    const filtered = scope === 'project' && projectId
      ? projects.filter((p: any) => p.id === projectId)
      : projects;
    return filtered
      .filter((p: any) => p.pctComplete !== undefined && p.pctBilled !== undefined)
      .map((p: any) => getScheduleCostDivergence(p))
      .sort((a: any, b: any) => Math.abs(b.divergencePoints) - Math.abs(a.divergencePoints));
  }, [data.projects, scope, projectId]);

  const redCount = divergenceItems.filter((d: any) => d.status === 'red').length;
  const yellowCount = divergenceItems.filter((d: any) => d.status === 'yellow').length;

  if (divergenceItems.length === 0) {
    return (
      <HubCardFrame title="Schedule–Cost Divergence" infoTooltip="Divergence between physical completion % and financial billing %. Positive = overbilled relative to progress.">
        <HubCardEmptyState title="No Data" body="No projects with both % complete and % billed data available." />
      </HubCardFrame>
    );
  }

  return (
    <HubCardFrame
      title="Schedule–Cost Divergence"
      infoTooltip="Divergence between physical completion % and financial billing %. Positive = overbilled relative to progress."
      titleSuffix={
        redCount > 0 ? <Pill color="red">{redCount} red</Pill> :
        yellowCount > 0 ? <Pill color="yellow">{yellowCount} flagged</Pill> :
        undefined
      }
    >
      {divergenceItems.slice(0, 5).map((item: any) => {
        const isOverbilled = item.divergencePoints > 0;
        return (
          <Row key={item.projectId}>
            <RowHeader>
              <Typography intent="small" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {item.projectName.length > 40 ? item.projectName.slice(0, 40) + '…' : item.projectName}
              </Typography>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Pill color={item.status === 'red' ? 'red' : item.status === 'yellow' ? 'yellow' : 'green'}>
                  {isOverbilled ? '+' : ''}{item.divergencePoints.toFixed(1)}pts
                </Pill>
              </div>
            </RowHeader>
            <BarGroup>
              <BarRow>
                <BarLabel intent="small">Physical</BarLabel>
                <Bar $pct={item.pctComplete} $color="var(--color-pill-border-blue)" />
                <Typography intent="small" style={{ color: 'var(--color-text-secondary)', width: 32, textAlign: 'right' }}>{item.pctComplete}%</Typography>
              </BarRow>
              <BarRow>
                <BarLabel intent="small">Billed</BarLabel>
                <Bar $pct={item.pctBilled} $color={item.status === 'red' ? 'var(--color-pill-border-red)' : item.status === 'yellow' ? 'var(--color-pill-border-yellow)' : 'var(--color-pill-border-green)'} />
                <Typography intent="small" style={{ color: 'var(--color-text-secondary)', width: 32, textAlign: 'right' }}>{item.pctBilled}%</Typography>
              </BarRow>
            </BarGroup>
          </Row>
        );
      })}
    </HubCardFrame>
  );
}
