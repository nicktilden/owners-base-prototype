/**
 * CAPITAL AT RISK CARD — Use Case #4 Financial
 * Expected value of open cost risk tags: (probability/5) × impact.
 */

import React, { useMemo } from 'react';
import { Pill, Typography } from '@procore/core-react';
import styled from 'styled-components';
import HubCardFrame, { HubCardEmptyState } from '@/components/hubs/HubCardFrame';
import { useData } from '@/context/DataContext';
import { getCapitalAtRisk } from '@/utils/healthRiskEngine';

const ProjectRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border-separator);
  &:last-child { border-bottom: none; }
`;

const TotalBanner = styled.div`
  padding: 20px;
  border-radius: 8px;
  background: var(--color-surface-secondary);
  text-align: center;
  margin-bottom: 16px;
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

export default function CapitalAtRiskCard({ scope = 'portfolio', projectId }: Props) {
  const { data } = useData();

  const result = useMemo(() => {
    const riskTags = (data.riskTags ?? []).filter((t: any) =>
      scope === 'project' && projectId ? t.projectId === projectId : true
    );
    const riskTypes = data.account?.riskTypes ?? [];
    return getCapitalAtRisk(riskTags, riskTypes);
  }, [data.riskTags, data.account, scope, projectId]);

  const projectNameMap = useMemo(() => {
    const m = new Map<string, string>();
    (data.projects ?? []).forEach((p: any) => m.set(p.id, p.name));
    return m;
  }, [data.projects]);

  const projectEntries = Object.entries(result.byProject)
    .sort(([, a], [, b]) => (b as number) - (a as number));

  const totalColor =
    result.total >= 10_000_000 ? 'var(--color-pill-text-red)' :
    result.total >= 5_000_000 ? 'var(--color-pill-text-yellow)' :
    'var(--color-text-primary)';

  if (result.total === 0) {
    return (
      <HubCardFrame title="Capital at Risk" infoTooltip="Expected value of open financial risk tags: (Probability / 5) × Impact.">
        <HubCardEmptyState title="No Capital at Risk" body="No open financial risk tags with impact estimates found." />
      </HubCardFrame>
    );
  }

  return (
    <HubCardFrame
      title="Capital at Risk"
      infoTooltip="Expected financial exposure from open cost risk tags. Formula: (Probability / 5) × Impact."
      titleSuffix={<Pill color={result.total >= 10_000_000 ? 'red' : 'yellow'}>{fmtM(result.total)}</Pill>}
    >
      <TotalBanner>
        <Typography intent="h2" style={{ color: totalColor }}>{fmtM(result.total)}</Typography>
        <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>Expected Capital Exposure</Typography>
      </TotalBanner>

      {projectEntries.slice(0, 5).map(([pid, amount]) => (
        <ProjectRow key={pid}>
          <Typography intent="small" style={{ color: 'var(--color-text-primary)' }}>
            {(projectNameMap.get(pid) ?? pid).slice(0, 42)}
          </Typography>
          <Typography intent="small" style={{ fontWeight: 600, color: (amount as number) >= 3_000_000 ? 'var(--color-pill-text-red)' : 'var(--color-text-primary)' }}>
            {fmtM(amount as number)}
          </Typography>
        </ProjectRow>
      ))}
    </HubCardFrame>
  );
}
