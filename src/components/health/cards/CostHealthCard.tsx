/**
 * COST HEALTH CARD
 * Shows cost-category KPIs: budget variance, contingency, change events.
 * Works at portfolio (multi-project table) or project (single project KPI list) scope.
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
import type { KPIResult } from '@/types/health';

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

const COST_KPIS = ['budgetVariance', 'remainingContingency', 'changeEvents', 'forecastToComplete', 'costAtCompletion'] as const;

export default function CostHealthCard({ scope = 'portfolio', projectId }: Props) {
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
      const costKPIs = allKPIs.filter(k => k.category === 'cost' && config.activeKPIs.includes(k.key as any));
      const worstStatus = costKPIs.some(k => k.status === 'red') ? 'red' : costKPIs.some(k => k.status === 'yellow') ? 'yellow' : 'green';
      return { project: p, kpis: costKPIs, worstStatus };
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
      title="Cost Health"
      infoTooltip="Budget variance, remaining contingency, and pending change events per project."
      actions={
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button
            variant="secondary"
            className="b_secondary"
            size="sm"
            icon={<ArrowRight size="sm" />}
            onClick={() => router.push(scope === 'project' && projectId ? `/project/${projectId}/risk-register` : '/portfolio/health')}
          >
            View All
          </Button>
          <Button className="b_tertiary" variant="tertiary" size="sm" icon={<EllipsisVertical size="sm" />} aria-label="More actions" />
        </div>
      }
    >
      {displayed.length === 0
        ? <HubCardEmptyState title="No Cost KPIs to Display" body="No active cost KPIs are configured for this project. Visit Account Settings to enable KPIs." />
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
