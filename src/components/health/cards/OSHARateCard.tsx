/**
 * OSHA RATE CARD — Use Case #6 Operations/Safety
 * TRIR (Total Recordable Incident Rate) = (recordable count × 200,000) / hours worked.
 */

import React, { useMemo } from 'react';
import { Pill, Typography } from '@procore/core-react';
import { ShieldStar } from '@procore/core-icons';
import styled from 'styled-components';
import HubCardFrame, { HubCardEmptyState } from '@/components/hubs/HubCardFrame';
import { useData } from '@/context/DataContext';
import { calculateOSHARate } from '@/utils/healthRiskEngine';

const GaugeBanner = styled.div`
  padding: 20px;
  border-radius: 8px;
  background: var(--color-surface-secondary);
  text-align: center;
  margin-bottom: 16px;
`;

const BenchmarkRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border-separator);
  &:last-child { border-bottom: none; }
`;

const ProjectRateRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border-separator);
  &:last-child { border-bottom: none; }
`;

interface Props {
  scope?: 'portfolio' | 'project';
  projectId?: string;
}

export default function OSHARateCard({ scope = 'portfolio', projectId }: Props) {
  const { data } = useData();

  const incidents = data.incidents ?? [];
  const workHours = data.workHours ?? [];

  const portfolioRate = useMemo(() => {
    return calculateOSHARate(incidents, workHours, scope === 'project' ? projectId : undefined);
  }, [incidents, workHours, scope, projectId]);

  const projectRates = useMemo(() => {
    if (scope !== 'portfolio') return [];
    const projects = data.projects ?? [];
    return projects
      .map((p: any) => ({
        projectId: p.id,
        projectName: p.name,
        rate: calculateOSHARate(incidents, workHours, p.id),
      }))
      .filter((p: any) => p.rate > 0)
      .sort((a: any, b: any) => b.rate - a.rate)
      .slice(0, 5);
  }, [data.projects, incidents, workHours, scope]);

  const rateColor =
    portfolioRate === 0 ? 'var(--color-pill-text-green)' :
    portfolioRate <= 1.5 ? 'var(--color-pill-text-yellow)' :
    'var(--color-pill-text-red)';

  const ratePillColor =
    portfolioRate === 0 ? 'green' as const :
    portfolioRate <= 1.5 ? 'yellow' as const :
    'red' as const;

  const recordableCount = (scope === 'project' && projectId
    ? incidents.filter((i: any) => i.projectId === projectId && i.oshaRecordable)
    : incidents.filter((i: any) => i.oshaRecordable)
  ).length;

  const totalHours = (scope === 'project' && projectId
    ? workHours.filter((w: any) => w.projectId === projectId)
    : workHours
  ).reduce((s: number, w: any) => s + w.totalHoursWorked, 0);

  if (totalHours === 0) {
    return (
      <HubCardFrame title="OSHA Recordable Rate" titlePrefix={<ShieldStar size="sm" />} infoTooltip="TRIR = (recordable incidents × 200,000) / total hours worked.">
        <HubCardEmptyState title="No Hours Data" body="Work hours data is required to calculate the OSHA recordable rate." />
      </HubCardFrame>
    );
  }

  return (
    <HubCardFrame
      title="OSHA Recordable Rate"
      titlePrefix={<ShieldStar size="sm" />}
      infoTooltip="TRIR = (recordable incidents × 200,000) / total hours worked. Industry average: ~3.0. Target: < 2.0."
      titleSuffix={<Pill color={ratePillColor}>{portfolioRate.toFixed(2)} TRIR</Pill>}
    >
      <GaugeBanner>
        <Typography intent="h2" style={{ color: rateColor }}>{portfolioRate.toFixed(2)}</Typography>
        <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>TRIR (YTD)</Typography>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
          <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
            {recordableCount} recordable{recordableCount !== 1 ? 's' : ''}
          </Typography>
          <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
            {totalHours.toLocaleString()} hrs
          </Typography>
        </div>
      </GaugeBanner>

      <BenchmarkRow>
        <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>Industry Average</Typography>
        <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>3.0</Typography>
      </BenchmarkRow>
      <BenchmarkRow>
        <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>Target Rate</Typography>
        <Pill color="green">{'< 2.0'}</Pill>
      </BenchmarkRow>

      {projectRates.map((pr: any) => (
        <ProjectRateRow key={pr.projectId}>
          <Typography intent="small" style={{ color: 'var(--color-text-primary)' }}>
            {pr.projectName.length > 42 ? pr.projectName.slice(0, 42) + '…' : pr.projectName}
          </Typography>
          <Pill color={pr.rate > 2 ? 'red' : pr.rate > 1 ? 'yellow' : 'green'}>
            {pr.rate.toFixed(2)}
          </Pill>
        </ProjectRateRow>
      ))}
    </HubCardFrame>
  );
}
