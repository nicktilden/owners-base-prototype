/**
 * SUBMITTAL AGING CARD — Use Case #2 Supply Chain
 * KPI counts of submittals past review threshold.
 */

import React, { useMemo } from 'react';
import { Button, Pill, Typography } from '@procore/core-react';
import { ArrowRight } from '@procore/core-icons';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import HubCardFrame, { HubCardEmptyState } from '@/components/hubs/HubCardFrame';
import { useData } from '@/context/DataContext';
import { getSubmittalAgingCount } from '@/utils/healthRiskEngine';

const KPIGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 16px 0;
`;

const KPIBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px;
  border-radius: 8px;
  background: var(--color-surface-secondary);
`;

const Divider = styled.div`
  height: 1px;
  background: var(--color-border-separator);
  margin: 8px 0;
`;

const AgingRow = styled.div`
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

export default function SubmittalAgingCard({ scope = 'portfolio', projectId }: Props) {
  const { data } = useData();
  const router = useRouter();

  const submittals = useMemo(() => {
    const all = data.submittals ?? [];
    return scope === 'project' && projectId ? all.filter((s: any) => s.projectId === projectId) : all;
  }, [data.submittals, scope, projectId]);

  const aging14 = useMemo(() => getSubmittalAgingCount(submittals, 14), [submittals]);
  const aging21 = useMemo(() => getSubmittalAgingCount(submittals, 21), [submittals]);
  const aging30 = useMemo(() => getSubmittalAgingCount(submittals, 30), [submittals]);

  const agingByBucket = [
    { label: '14–21 days', count: aging14 - aging21, color: 'yellow' as const },
    { label: '21–30 days', count: aging21 - aging30, color: 'yellow' as const },
    { label: '30+ days', count: aging30, color: 'red' as const },
  ];

  const toolPath = scope === 'project' && projectId
    ? `/project/${projectId}/submittals`
    : '/portfolio/submittals';

  return (
    <HubCardFrame
      title="Submittal Aging"
      infoTooltip="Submittals currently under review or requiring resubmission past their due date."
      actions={
        <Button
          variant="secondary"
          className="b_secondary"
          size="sm"
          icon={<ArrowRight size="sm" />}
          onClick={() => router.push(toolPath)}
        >
          View All
        </Button>
      }
    >
      {aging14 === 0 ? (
        <HubCardEmptyState title="No Aging Submittals" body="All submittals are within review cycle targets." />
      ) : (
        <>
          <KPIGrid>
            <KPIBox>
              <Typography intent="h2" style={{ color: aging14 > 10 ? 'var(--color-pill-text-red)' : 'var(--color-text-primary)' }}>
                {aging14}
              </Typography>
              <Typography intent="small" style={{ color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                Over 14 days
              </Typography>
            </KPIBox>
            <KPIBox>
              <Typography intent="h2" style={{ color: aging21 > 5 ? 'var(--color-pill-text-red)' : 'var(--color-text-primary)' }}>
                {aging21}
              </Typography>
              <Typography intent="small" style={{ color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                Over 21 days
              </Typography>
            </KPIBox>
            <KPIBox>
              <Typography intent="h2" style={{ color: aging30 > 0 ? 'var(--color-pill-text-red)' : 'var(--color-text-primary)' }}>
                {aging30}
              </Typography>
              <Typography intent="small" style={{ color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                Over 30 days
              </Typography>
            </KPIBox>
          </KPIGrid>

          <Divider />

          {agingByBucket.map(bucket => (
            <AgingRow key={bucket.label}>
              <Typography intent="body">{bucket.label}</Typography>
              <Pill color={bucket.count > 0 ? bucket.color : 'gray'}>
                {bucket.count}
              </Pill>
            </AgingRow>
          ))}
        </>
      )}
    </HubCardFrame>
  );
}
