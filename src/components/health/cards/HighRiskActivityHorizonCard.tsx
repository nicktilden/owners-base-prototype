/**
 * HIGH RISK ACTIVITY HORIZON CARD — Use Case #6 Operations/Safety
 * Upcoming schedule activities classified as hazardous within the next 30 days.
 */

import React, { useMemo } from 'react';
import { Pill, Typography } from '@procore/core-react';
import { Warning } from '@procore/core-icons';
import styled from 'styled-components';
import HubCardFrame, { HubCardEmptyState } from '@/components/hubs/HubCardFrame';
import { useData } from '@/context/DataContext';
import { getHighRiskActivityHorizon } from '@/utils/healthRiskEngine';

const ActivityRow = styled.div`
  display: grid;
  grid-template-columns: 8px 1fr auto;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border-separator);
  &:last-child { border-bottom: none; }
`;

const UrgencyDot = styled.div<{ $days: number }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 4px;
  flex-shrink: 0;
  background: ${({ $days }) =>
    $days <= 7 ? 'var(--color-pill-border-red)' :
    $days <= 14 ? 'var(--color-pill-border-yellow)' :
    'var(--color-pill-border-gray)'};
`;

const HAZARD_LABELS: Record<string, string> = {
  high_voltage: 'High Voltage',
  confined_space: 'Confined Space',
  fall_risk: 'Fall Risk',
  crane_operation: 'Crane Op.',
  hazmat: 'Hazmat',
  excavation: 'Excavation',
  hot_work: 'Hot Work',
};

interface Props {
  scope?: 'portfolio' | 'project';
  projectId?: string;
}

export default function HighRiskActivityHorizonCard({ scope = 'portfolio', projectId }: Props) {
  const { data } = useData();

  const activities = useMemo(() => {
    const scheduleEntries = data.scheduleEntries ?? [];
    const projects = data.projects ?? [];
    return getHighRiskActivityHorizon(
      scheduleEntries,
      projects,
      30,
      scope === 'project' ? projectId : undefined,
    );
  }, [data.scheduleEntries, data.projects, scope, projectId]);

  const noPlanCount = activities.filter(a => a.safetyPlanRequired && !a.safetyPlanCompleted).length;
  const urgentCount = activities.filter(a => a.daysUntilStart <= 7).length;

  return (
    <HubCardFrame
      title="High-Risk Activity Horizon"
      titlePrefix={<Warning size="sm" />}
      infoTooltip="Upcoming hazardous schedule activities within 30 days. Red dot = within 7 days."
      titleSuffix={
        noPlanCount > 0
          ? <Pill color="red">{noPlanCount} no safety plan</Pill>
          : urgentCount > 0
          ? <Pill color="yellow">{urgentCount} within 7d</Pill>
          : undefined
      }
    >
      {activities.length === 0 ? (
        <HubCardEmptyState title="No High-Risk Activities" body="No hazardous schedule activities found in the next 30 days." />
      ) : (
        activities.slice(0, 6).map(activity => {
          const missingPlan = activity.safetyPlanRequired && !activity.safetyPlanCompleted;
          return (
            <ActivityRow key={activity.id}>
              <UrgencyDot $days={activity.daysUntilStart} />
              <div style={{ minWidth: 0 }}>
                <Typography intent="small" style={{ fontWeight: 600, color: 'var(--color-text-primary)', display: 'block', marginBottom: 2 }}>
                  {activity.name.length > 52 ? activity.name.slice(0, 52) + '…' : activity.name}
                </Typography>
                {scope === 'portfolio' && (
                  <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                    {activity.projectName}
                  </Typography>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <Pill color="gray" style={{ fontSize: 10 }}>
                    {HAZARD_LABELS[activity.hazardousActivityType] ?? activity.hazardousActivityType}
                  </Pill>
                  {missingPlan && (
                    <Pill color="red" style={{ fontSize: 10 }}>No safety plan</Pill>
                  )}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <Pill color={activity.daysUntilStart <= 7 ? 'red' : activity.daysUntilStart <= 14 ? 'yellow' : 'gray'}>
                  {activity.daysUntilStart}d
                </Pill>
              </div>
            </ActivityRow>
          );
        })
      )}
    </HubCardFrame>
  );
}
