/**
 * INCIDENT COST EXPOSURE CARD — Use Case #6 Operations/Safety
 * Total estimated cost of open incidents across portfolio.
 */

import React, { useMemo } from 'react';
import { Pill, Typography } from '@procore/core-react';
import styled from 'styled-components';
import HubCardFrame, { HubCardEmptyState } from '@/components/hubs/HubCardFrame';
import { useData } from '@/context/DataContext';
import { getIncidentCostExposure } from '@/utils/healthRiskEngine';

const TotalBanner = styled.div`
  padding: 18px;
  border-radius: 8px;
  background: var(--color-surface-secondary);
  text-align: center;
  margin-bottom: 16px;
`;

const TypeRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border-separator);
  &:last-child { border-bottom: none; }
`;

const TYPE_LABELS: Record<string, string> = {
  injury: 'Injury',
  near_miss: 'Near Miss',
  property_damage: 'Property Damage',
  environmental: 'Environmental',
  security: 'Security',
};

function fmtM(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

interface Props {
  scope?: 'portfolio' | 'project';
  projectId?: string;
}

export default function IncidentCostExposureCard({ scope = 'portfolio', projectId }: Props) {
  const { data } = useData();

  const incidents = data.incidents ?? [];

  const totalExposure = useMemo(() => {
    return getIncidentCostExposure(incidents, scope === 'project' ? projectId : undefined);
  }, [incidents, scope, projectId]);

  const byType = useMemo(() => {
    const filtered = incidents.filter((i: any) => {
      if (i.status === 'closed' || !i.costEstimate) return false;
      if (scope === 'project' && projectId && i.projectId !== projectId) return false;
      return true;
    });
    const acc: Record<string, number> = {};
    filtered.forEach((i: any) => {
      acc[i.incidentType] = (acc[i.incidentType] ?? 0) + (i.costEstimate ?? 0);
    });
    return Object.entries(acc).sort(([, a], [, b]) => (b as number) - (a as number));
  }, [incidents, scope, projectId]);

  const openCount = incidents.filter((i: any) => {
    if (i.status === 'closed') return false;
    if (scope === 'project' && projectId && i.projectId !== projectId) return false;
    return true;
  }).length;

  if (totalExposure === 0) {
    return (
      <HubCardFrame title="Incident Cost Exposure" infoTooltip="Total estimated cost exposure from open incidents.">
        <HubCardEmptyState title="No Cost Exposure" body="No open incidents with cost estimates found." />
      </HubCardFrame>
    );
  }

  return (
    <HubCardFrame
      title="Incident Cost Exposure"
      infoTooltip="Total estimated dollar cost of open, unresolved incidents. Excludes closed incidents."
      titleSuffix={
        <Pill color={totalExposure >= 100_000 ? 'red' : 'yellow'}>{fmtM(totalExposure)}</Pill>
      }
    >
      <TotalBanner>
        <Typography intent="h2" style={{ color: totalExposure >= 100_000 ? 'var(--color-pill-text-red)' : 'var(--color-text-primary)' }}>
          {fmtM(totalExposure)}
        </Typography>
        <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
          across {openCount} open incident{openCount !== 1 ? 's' : ''}
        </Typography>
      </TotalBanner>

      {byType.map(([type, amount]) => (
        <TypeRow key={type}>
          <Typography intent="small" style={{ color: 'var(--color-text-primary)' }}>
            {TYPE_LABELS[type] ?? type}
          </Typography>
          <Typography intent="small" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {fmtM(amount as number)}
          </Typography>
        </TypeRow>
      ))}
    </HubCardFrame>
  );
}
