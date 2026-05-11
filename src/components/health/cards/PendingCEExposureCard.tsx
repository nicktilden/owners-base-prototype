/**
 * PENDING CE EXPOSURE CARD — Use Case #4 Financial
 * Summary of open/pending Change Events and their estimated financial exposure.
 */

import React, { useMemo } from 'react';
import { Pill, Typography } from '@procore/core-react';
import styled from 'styled-components';
import HubCardFrame, { HubCardEmptyState } from '@/components/hubs/HubCardFrame';
import { useData } from '@/context/DataContext';
import { getPendingCEExposure } from '@/utils/healthRiskEngine';

const CauseRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border-separator);
  &:last-child { border-bottom: none; }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 12px 0 16px;
`;

const SummaryBox = styled.div`
  padding: 14px;
  border-radius: 8px;
  background: var(--color-surface-secondary);
  text-align: center;
`;

const CAUSE_LABELS: Record<string, string> = {
  owner_driven: 'Owner Driven',
  design: 'Design',
  field_condition: 'Field Condition',
  regulatory: 'Regulatory',
  subcontractor: 'Subcontractor',
  other: 'Other',
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

export default function PendingCEExposureCard({ scope = 'portfolio', projectId }: Props) {
  const { data } = useData();

  const exposure = useMemo(() => {
    const changeEvents = (data.changeEvents ?? []).filter((ce: any) =>
      scope === 'project' && projectId ? ce.projectId === projectId : true
    );
    return getPendingCEExposure(changeEvents);
  }, [data.changeEvents, scope, projectId]);

  const causeEntries = Object.entries(exposure.byCause)
    .sort(([, a], [, b]) => (b as number) - (a as number));

  if (exposure.totalPendingCount === 0) {
    return (
      <HubCardFrame title="Pending CE Exposure" infoTooltip="Financial exposure from open and pending Change Events, broken down by cause.">
        <HubCardEmptyState title="No Pending Change Events" body="All change events have been resolved or no pending CEs with estimates exist." />
      </HubCardFrame>
    );
  }

  return (
    <HubCardFrame
      title="Pending CE Exposure"
      infoTooltip="Financial exposure from open and pending Change Events. Positive estimates only."
      titleSuffix={
        exposure.totalExposure > 1_000_000
          ? <Pill color="red">{fmtM(exposure.totalExposure)}</Pill>
          : <Pill color="yellow">{fmtM(exposure.totalExposure)}</Pill>
      }
    >
      <SummaryGrid>
        <SummaryBox>
          <Typography intent="h3" style={{ color: 'var(--color-text-primary)' }}>
            {exposure.totalPendingCount}
          </Typography>
          <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>Pending CEs</Typography>
        </SummaryBox>
        <SummaryBox>
          <Typography intent="h3" style={{ color: exposure.totalExposure > 500_000 ? 'var(--color-pill-text-red)' : 'var(--color-text-primary)' }}>
            {fmtM(exposure.totalExposure)}
          </Typography>
          <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>Total Exposure</Typography>
        </SummaryBox>
      </SummaryGrid>

      {causeEntries.map(([cause, amount]) => (
        <CauseRow key={cause}>
          <Typography intent="small" style={{ color: 'var(--color-text-primary)' }}>
            {CAUSE_LABELS[cause] ?? cause}
          </Typography>
          <Typography intent="small" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {fmtM(amount as number)}
          </Typography>
        </CauseRow>
      ))}
    </HubCardFrame>
  );
}
