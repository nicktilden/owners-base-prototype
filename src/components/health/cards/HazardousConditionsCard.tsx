/**
 * HAZARDOUS CONDITIONS CARD — Use Case #6 Operations/Safety
 * Open incidents classified as hazardous conditions or property damage.
 */

import React, { useMemo } from 'react';
import { Pill, Typography } from '@procore/core-react';
import { Warning } from '@procore/core-icons';
import styled from 'styled-components';
import HubCardFrame, { HubCardEmptyState } from '@/components/hubs/HubCardFrame';
import { useData } from '@/context/DataContext';

const IncidentRow = styled.div`
  display: grid;
  grid-template-columns: 8px 1fr auto;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border-separator);
  &:last-child { border-bottom: none; }
`;

const SeverityDot = styled.div<{ $severity: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 4px;
  flex-shrink: 0;
  background: ${({ $severity }) =>
    $severity === 'critical' || $severity === 'high' ? 'var(--color-pill-border-red)' :
    $severity === 'medium' ? 'var(--color-pill-border-yellow)' :
    'var(--color-pill-border-gray)'};
`;

const SEVERITY_COLORS: Record<string, 'red' | 'yellow' | 'gray'> = {
  critical: 'red',
  high: 'red',
  medium: 'yellow',
  low: 'gray',
};

const TYPE_LABELS: Record<string, string> = {
  injury: 'Injury',
  near_miss: 'Near Miss',
  property_damage: 'Property Damage',
  environmental: 'Environmental',
  security: 'Security',
};

function fmtM(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

interface Props {
  scope?: 'portfolio' | 'project';
  projectId?: string;
}

export default function HazardousConditionsCard({ scope = 'portfolio', projectId }: Props) {
  const { data } = useData();

  const openIncidents = useMemo(() => {
    const incidents = data.incidents ?? [];
    const projects = data.projects ?? [];
    const projectMap = new Map(projects.map((p: any) => [p.id, p.name]));

    return incidents
      .filter((i: any) => {
        if (i.status === 'closed') return false;
        if (i.incidentType === 'near_miss') return false;
        if (scope === 'project' && projectId && i.projectId !== projectId) return false;
        return true;
      })
      .map((i: any) => ({
        ...i,
        projectName: projectMap.get(i.projectId) ?? i.projectId,
      }))
      .sort((a: any, b: any) => {
        const order = { critical: 0, high: 1, medium: 2, low: 3 };
        return (order[a.severity as keyof typeof order] ?? 4) - (order[b.severity as keyof typeof order] ?? 4);
      })
      .slice(0, 6);
  }, [data.incidents, data.projects, scope, projectId]);

  const totalCostExposure = openIncidents.reduce((s: number, i: any) => s + (i.costEstimate ?? 0), 0);

  return (
    <HubCardFrame
      title="Hazardous Conditions"
      titlePrefix={<Warning size="sm" />}
      infoTooltip="Open incidents excluding near-misses. Sorted by severity."
      titleSuffix={
        openIncidents.some((i: any) => i.severity === 'high' || i.severity === 'critical')
          ? <Pill color="red">{openIncidents.filter((i: any) => ['high', 'critical'].includes(i.severity)).length} high</Pill>
          : undefined
      }
    >
      {openIncidents.length === 0 ? (
        <HubCardEmptyState title="No Open Hazardous Conditions" body="No open injury or property damage incidents found." />
      ) : (
        <>
          {totalCostExposure > 0 && (
            <div style={{ padding: '10px 0 14px', borderBottom: '1px solid var(--color-border-separator)' }}>
              <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
                Total cost exposure: <strong style={{ color: 'var(--color-text-primary)' }}>{fmtM(totalCostExposure)}</strong>
              </Typography>
            </div>
          )}
          {openIncidents.map((incident: any) => (
            <IncidentRow key={incident.id}>
              <SeverityDot $severity={incident.severity} />
              <div style={{ minWidth: 0 }}>
                <Typography intent="small" style={{ fontWeight: 600, color: 'var(--color-text-primary)', display: 'block', marginBottom: 2 }}>
                  {incident.title.length > 52 ? incident.title.slice(0, 52) + '…' : incident.title}
                </Typography>
                {scope === 'portfolio' && (
                  <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                    {incident.projectName}
                  </Typography>
                )}
                {incident.costEstimate && (
                  <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
                    {fmtM(incident.costEstimate)} estimated
                  </Typography>
                )}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <Pill color={SEVERITY_COLORS[incident.severity] ?? 'gray'}>
                  {TYPE_LABELS[incident.incidentType] ?? incident.incidentType}
                </Pill>
              </div>
            </IncidentRow>
          ))}
        </>
      )}
    </HubCardFrame>
  );
}
