/**
 * CONTINGENCY BURN CARD — Use Case #4 Financial
 * Contingency utilization across projects with burn rate gauge.
 */

import React, { useMemo } from 'react';
import { Pill, Typography } from '@procore/core-react';
import styled from 'styled-components';
import HubCardFrame, { HubCardEmptyState } from '@/components/hubs/HubCardFrame';
import { useData } from '@/context/DataContext';
import { getContingencyBurnRate } from '@/utils/healthRiskEngine';

const ProjectRow = styled.div`
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border-separator);
  &:last-child { border-bottom: none; }
`;

const RowHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
`;

const BurnBar = styled.div<{ $pct: number; $color: string }>`
  height: 6px;
  border-radius: 3px;
  background: var(--color-border-separator);
  overflow: hidden;
  margin-bottom: 4px;
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${({ $pct }) => Math.min(100, $pct)}%;
    background: ${({ $color }) => $color};
    border-radius: 3px;
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 12px 0 16px;
`;

const SummaryBox = styled.div`
  padding: 12px;
  border-radius: 8px;
  background: var(--color-surface-secondary);
  text-align: center;
`;

function fmtM(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

interface Props {
  scope?: 'portfolio' | 'project';
  projectId?: string;
}

export default function ContingencyBurnCard({ scope = 'portfolio', projectId }: Props) {
  const { data } = useData();

  const projectsWithData = useMemo(() => {
    const projects = data.projects ?? [];
    const filtered = scope === 'project' && projectId
      ? projects.filter((p: any) => p.id === projectId)
      : projects;
    return filtered
      .filter((p: any) => p.contingencyOriginal !== undefined && p.contingencyOriginal > 0)
      .map((p: any) => ({ project: p, burn: getContingencyBurnRate(p) }))
      .sort((a: any, b: any) => a.burn.pctRemaining - b.burn.pctRemaining);
  }, [data.projects, scope, projectId]);

  const projectNameMap = useMemo(() => {
    const m = new Map<string, string>();
    (data.projects ?? []).forEach((p: any) => m.set(p.id, p.name));
    return m;
  }, [data.projects]);

  const totalOriginal = projectsWithData.reduce((s: number, d: any) => s + d.burn.contingencyOriginal, 0);
  const totalRemaining = projectsWithData.reduce((s: number, d: any) => s + d.burn.contingencyRemaining, 0);
  const criticalCount = projectsWithData.filter((d: any) => d.burn.pctRemaining < 15).length;

  if (projectsWithData.length === 0) {
    return (
      <HubCardFrame title="Contingency Burn Rate" infoTooltip="Contingency utilization across active projects.">
        <HubCardEmptyState title="No Contingency Data" body="No projects with contingency data are available." />
      </HubCardFrame>
    );
  }

  return (
    <HubCardFrame
      title="Contingency Burn Rate"
      infoTooltip="Contingency utilization per project. Red = under 15% remaining, yellow = under 25%."
      titleSuffix={criticalCount > 0 ? <Pill color="red">{criticalCount} critical</Pill> : undefined}
    >
      {scope === 'portfolio' && (
        <SummaryGrid>
          <SummaryBox>
            <Typography intent="h3" style={{ color: 'var(--color-text-primary)' }}>{fmtM(totalOriginal)}</Typography>
            <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>Total Contingency</Typography>
          </SummaryBox>
          <SummaryBox>
            <Typography intent="h3" style={{ color: totalRemaining < totalOriginal * 0.15 ? 'var(--color-pill-text-red)' : 'var(--color-text-primary)' }}>
              {fmtM(totalRemaining)}
            </Typography>
            <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>Remaining</Typography>
          </SummaryBox>
        </SummaryGrid>
      )}

      {projectsWithData.slice(0, 5).map(({ project, burn }: any) => {
        const usedPct = 100 - burn.pctRemaining;
        const barColor =
          burn.pctRemaining < 15 ? 'var(--color-pill-border-red)' :
          burn.pctRemaining < 25 ? 'var(--color-pill-border-yellow)' :
          'var(--color-pill-border-green)';
        const pillColor =
          burn.pctRemaining < 15 ? 'red' as const :
          burn.pctRemaining < 25 ? 'yellow' as const :
          'green' as const;

        return (
          <ProjectRow key={project.id}>
            <RowHeader>
              <Typography intent="small" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {(projectNameMap.get(project.id) ?? project.id).slice(0, 45)}
              </Typography>
              <Pill color={pillColor}>{burn.pctRemaining.toFixed(0)}% left</Pill>
            </RowHeader>
            <BurnBar $pct={usedPct} $color={barColor} />
            <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
              {fmtM(burn.contingencyUsed)} used of {fmtM(burn.contingencyOriginal)}
            </Typography>
          </ProjectRow>
        );
      })}
    </HubCardFrame>
  );
}
