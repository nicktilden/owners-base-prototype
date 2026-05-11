/**
 * CRITICAL PATH SUBMITTALS CARD — Use Case #2 Supply Chain
 * Lists submittals flagged as critical path, sorted by urgency.
 */

import React, { useMemo } from 'react';
import { Button, Pill, Typography } from '@procore/core-react';
import { ArrowRight, Warning } from '@procore/core-icons';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import HubCardFrame, { HubCardEmptyState } from '@/components/hubs/HubCardFrame';
import { useData } from '@/context/DataContext';
import { getCriticalPathSubmittals } from '@/utils/healthRiskEngine';

const ItemRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border-separator);
  &:last-child { border-bottom: none; }
`;

const StatusDot = styled.span<{ $late: boolean }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  flex-shrink: 0;
  background: ${({ $late }) => $late ? 'var(--color-pill-border-red)' : 'var(--color-pill-border-yellow)'};
`;

interface Props {
  scope?: 'portfolio' | 'project';
  projectId?: string;
}

export default function CriticalPathSubmittalsCard({ scope = 'portfolio', projectId }: Props) {
  const { data } = useData();
  const router = useRouter();

  const items = useMemo(() => {
    const submittals = data.submittals ?? [];
    const projects = data.projects ?? [];
    return getCriticalPathSubmittals(submittals, projects, scope === 'project' ? projectId : undefined);
  }, [data.submittals, data.projects, scope, projectId]);

  const displayed = items.slice(0, 6);
  const lateCount = items.filter(i => i.daysInReview > 0).length;

  const toolPath = scope === 'project' && projectId
    ? `/project/${projectId}/submittals`
    : '/portfolio/submittals';

  return (
    <HubCardFrame
      title="Critical Path Submittals"
      infoTooltip="Submittals on the project critical path. Delays here directly impact the project completion date."
      titleSuffix={lateCount > 0 ? <Pill color="red">{lateCount} late</Pill> : undefined}
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
      {items.length === 0 ? (
        <HubCardEmptyState title="No Critical Path Submittals" body="No submittals are currently flagged as critical path." />
      ) : (
        displayed.map(item => {
          const isLate = item.daysInReview > 0;
          return (
            <ItemRow key={item.id}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                  <StatusDot $late={isLate} />
                  <Typography intent="small" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {item.title.length > 55 ? item.title.slice(0, 55) + '…' : item.title}
                  </Typography>
                </div>
                {scope === 'portfolio' && (
                  <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: 2, paddingLeft: 14 }}>
                    {item.projectName.length > 45 ? item.projectName.slice(0, 45) + '…' : item.projectName}
                  </Typography>
                )}
                <Typography intent="small" style={{ color: 'var(--color-text-secondary)', paddingLeft: 14 }}>
                  {item.responsibleContractor}
                  {item.leadTimeDays ? ` · ${item.leadTimeDays}d lead` : ''}
                </Typography>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                {isLate ? (
                  <Pill color="red">{item.daysInReview}d overdue</Pill>
                ) : (
                  <Pill color={item.status === 'Approved' ? 'green' : 'yellow'}>{item.status}</Pill>
                )}
              </div>
            </ItemRow>
          );
        })
      )}
    </HubCardFrame>
  );
}
