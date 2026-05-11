/**
 * SEASONAL RISK CARD — Use Case #2 Supply Chain
 * Projects with upcoming seasonal constraints on schedule items.
 */

import React, { useMemo } from 'react';
import { Pill, Typography } from '@procore/core-react';
import { Calendar } from '@procore/core-icons';
import styled from 'styled-components';
import HubCardFrame, { HubCardEmptyState } from '@/components/hubs/HubCardFrame';
import { useData } from '@/context/DataContext';

const ItemRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border-separator);
  &:last-child { border-bottom: none; }
`;

const CONSTRAINT_COLORS: Record<string, 'yellow' | 'blue' | 'red' | 'gray'> = {
  winter_shutdown: 'blue',
  rain_season: 'blue',
  high_wind: 'yellow',
  extreme_heat: 'red',
  frost_moratorium: 'blue',
};

const CONSTRAINT_LABELS: Record<string, string> = {
  winter_shutdown: 'Winter Shutdown',
  rain_season: 'Rain Season',
  high_wind: 'High Wind',
  extreme_heat: 'Extreme Heat',
  frost_moratorium: 'Frost Moratorium',
};

interface Props {
  scope?: 'portfolio' | 'project';
  projectId?: string;
}

export default function SeasonalRiskCard({ scope = 'portfolio', projectId }: Props) {
  const { data } = useData();

  const constrainedItems = useMemo(() => {
    const entries = data.scheduleEntries ?? [];
    const projects = data.projects ?? [];
    const projectMap = new Map(projects.map((p: any) => [p.id, p.name]));
    const today = new Date('2026-05-04');
    const horizon = new Date(today);
    horizon.setDate(horizon.getDate() + 90);

    return entries
      .filter((e: any) => {
        if (projectId && e.projectId !== projectId) return false;
        if (!e.seasonalConstraint) return false;
        const start = new Date(e.startDate);
        return start >= today && start <= horizon;
      })
      .map((e: any) => ({
        id: e.id,
        name: e.name,
        projectId: e.projectId,
        projectName: projectMap.get(e.projectId) ?? e.projectId,
        constraint: e.seasonalConstraint as string,
        startDate: e.startDate,
        daysUntil: Math.floor((new Date(e.startDate).getTime() - today.getTime()) / 86400000),
      }))
      .sort((a: any, b: any) => a.daysUntil - b.daysUntil)
      .slice(0, 6);
  }, [data.scheduleEntries, data.projects, scope, projectId]);

  const urgentCount = constrainedItems.filter((i: any) => i.daysUntil <= 30).length;

  return (
    <HubCardFrame
      title="Seasonal Risk Horizon"
      infoTooltip="Upcoming schedule activities with weather or seasonal constraints in the next 90 days."
      titleSuffix={urgentCount > 0 ? <Pill color="yellow">{urgentCount} within 30d</Pill> : undefined}
      titlePrefix={<Calendar size="sm" />}
    >
      {constrainedItems.length === 0 ? (
        <HubCardEmptyState title="No Seasonal Constraints" body="No schedule activities with seasonal constraints found in the next 90 days." />
      ) : (
        constrainedItems.map((item: any) => (
          <ItemRow key={item.id}>
            <div style={{ minWidth: 0 }}>
              <Typography intent="small" style={{ fontWeight: 600, color: 'var(--color-text-primary)', display: 'block', marginBottom: 2 }}>
                {item.name.length > 52 ? item.name.slice(0, 52) + '…' : item.name}
              </Typography>
              {scope === 'portfolio' && (
                <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                  {item.projectName}
                </Typography>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
              <Pill color={CONSTRAINT_COLORS[item.constraint] ?? 'gray'}>
                {CONSTRAINT_LABELS[item.constraint] ?? item.constraint}
              </Pill>
              <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
                {item.daysUntil}d
              </Typography>
            </div>
          </ItemRow>
        ))
      )}
    </HubCardFrame>
  );
}
