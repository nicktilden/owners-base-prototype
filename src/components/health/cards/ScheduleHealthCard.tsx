/**
 * SCHEDULE HEALTH CARD
 * Shows schedule-category KPIs: schedule status, variance, milestone completion rate.
 */

import React, { useMemo } from 'react';
import { Button, Pill, Typography } from '@procore/core-react';
import { ArrowRight, EllipsisVertical } from '@procore/core-icons';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import HubCardFrame, { HubCardEmptyState } from '@/components/hubs/HubCardFrame';
import KPIRow from '../KPIRow';
import { resolveKPIs } from '@/utils/healthEngine';
import { projects as allProjects } from '@/data/seed/projects';
import { useData } from '@/context/DataContext';

// ─── Styled ───────────────────────────────────────────────────────────────────

const ProjectSection = styled.div`
  padding-bottom: 8px;
  border-bottom: 2px solid var(--color-border-separator);
  margin-bottom: 8px;
  &:last-child { border-bottom: none; }
`;

const ProjectName = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  padding: 4px 0;
`;

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  scope?: 'portfolio' | 'project';
  projectId?: string;
}

export default function ScheduleHealthCard({ scope = 'portfolio', projectId }: Props) {
  const router = useRouter();
  const { data } = useData();
  const config = data.account?.healthConfig;

  const projectKPIs = useMemo(() => {
    if (!config) return [];
    const source = scope === 'project' && projectId
      ? allProjects.filter(p => p.id === projectId)
      : allProjects.filter(p => p.status === 'active');

    return source.map(p => {
      const allKPIs = resolveKPIs(p, config);
      const schedKPIs = allKPIs.filter(k => k.category === 'schedule' && config.activeKPIs.includes(k.key as any));
      const worstStatus = schedKPIs.some(k => k.status === 'red') ? 'red' : schedKPIs.some(k => k.status === 'yellow') ? 'yellow' : 'green';
      return { project: p, kpis: schedKPIs, worstStatus };
    }).filter(r => r.kpis.length > 0);
  }, [config, scope, projectId]);

  if (!config) return null;

  const sorted = [...projectKPIs].sort((a, b) => {
    const order = { red: 0, yellow: 1, green: 2, unavailable: 3 };
    return order[a.worstStatus as keyof typeof order] - order[b.worstStatus as keyof typeof order];
  });

  const displayed = scope === 'project' ? sorted : sorted.slice(0, 3);

  return (
    <HubCardFrame
      title="Schedule Health"
      infoTooltip="Schedule variance, status, and milestone completion rate per project."
      actions={
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button
            variant="secondary"
            className="b_secondary"
            size="sm"
            icon={<ArrowRight size="sm" />}
            onClick={() => router.push(scope === 'project' && projectId ? `/project/${projectId}/health` : '/portfolio/health')}
          >
            View All
          </Button>
          <Button className="b_tertiary" variant="tertiary" size="sm" icon={<EllipsisVertical size="sm" />} aria-label="More actions" />
        </div>
      }
    >
      {displayed.length === 0
        ? <HubCardEmptyState title="No Schedule KPIs to Display" body="No active schedule KPIs are configured for this project. Visit Account Settings to enable KPIs." />
        : displayed.map(({ project, kpis, worstStatus }) => (
        <ProjectSection key={project.id}>
          {scope === 'portfolio' && (
            <ProjectName>
              <Typography intent="small" style={{ color: 'var(--color-text-primary)', fontWeight: 600, flex: 1 }}>
                {project.name.length > 42 ? project.name.slice(0, 42) + '…' : project.name}
              </Typography>
              <Pill color={worstStatus === 'red' ? 'red' : worstStatus === 'yellow' ? 'yellow' : 'green'}>
                {worstStatus === 'red' ? 'Critical' : worstStatus === 'yellow' ? 'At Risk' : 'Good'}
              </Pill>
            </ProjectName>
          )}
          {kpis.map(kpi => (
            <KPIRow key={kpi.key} kpi={kpi} showReasons={scope === 'project'} showSource={scope === 'project'} />
          ))}
        </ProjectSection>
        ))}
    </HubCardFrame>
  );
}
