/**
 * HEALTH SUMMARY CARD
 * Portfolio or project health overview — traffic-light grid with composite score.
 * Scope: portfolio (shows all projects) or project (shows one project detail).
 */

import React, { useMemo, useState, useRef, useCallback } from 'react';
import { Button, Typography } from '@procore/core-react';
import { ArrowRight, EllipsisVertical } from '@procore/core-icons';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import HubCardFrame, { HubCardEmptyState } from '@/components/hubs/HubCardFrame';
import HealthScoreBadge from '../HealthScoreBadge';
import HealthDetailTearsheet from '../HealthDetailTearsheet';
import HealthSummaryPopover from '../HealthSummaryPopover';
import { buildHealthResult } from '@/utils/healthEngine';
import { projects as allProjects } from '@/data/seed/projects';
import { getRisksForProject } from '@/data/seed/risks';
import { useData } from '@/context/DataContext';
import type { HealthResult, HealthScore } from '@/types/health';
import type { Project } from '@/types/project';

// ─── Styled ───────────────────────────────────────────────────────────────────

const Grid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const ProjectRow = styled.button`
  display: grid;
  grid-template-columns: 1fr 80px 80px;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border: none;
  background: transparent;
  border-bottom: 1px solid var(--color-border-separator);
  text-align: left;
  cursor: pointer;
  width: 100%;
  &:hover { background: var(--color-surface-hover); }
  &:last-child { border-bottom: none; }
`;

const SummaryBar = styled.div`
  display: flex;
  gap: 12px;
  padding: 10px 0 8px;
  border-bottom: 1px solid var(--color-border-separator);
  margin-bottom: 8px;
`;

const SummaryItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const CountBadge = styled.span<{ $color: string }>`
  font-size: 20px;
  font-weight: 700;
  color: ${({ $color }) => $color};
`;

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  scope?: 'portfolio' | 'project';
  projectId?: string;
}

export default function HealthSummaryCard({ scope = 'portfolio', projectId }: Props) {
  const router = useRouter();
  const { data } = useData();
  const config = data.account?.healthConfig;
  const [tearsheetProject, setTearsheetProject] = useState<{ project: Project; result: HealthResult } | null>(null);
  const [popover, setPopover] = useState<{ project: Project; result: HealthResult; rect: DOMRect } | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const projectResults = useMemo(() => {
    if (!config) return [];
    const source = scope === 'project' && projectId
      ? allProjects.filter(p => p.id === projectId)
      : allProjects.filter(p => p.status === 'active');

    return source.map(p => {
      const risks = getRisksForProject(p.id);
      const result = buildHealthResult(p, config, undefined, risks);
      return { project: p, result };
    });
  }, [config, scope, projectId]);

  if (!config) return null;

  const activeOnly = projectResults.filter(r => r.project.status === 'active');
  const counts: Record<HealthScore, number> = { green: 0, yellow: 0, red: 0 };
  activeOnly.forEach(r => { counts[r.result.compositeScore]++; });

  const displayed = scope === 'project'
    ? projectResults
    : activeOnly.sort((a, b) => {
        const order = { red: 0, yellow: 1, green: 2 };
        return order[a.result.compositeScore] - order[b.result.compositeScore];
      }).slice(0, 8);

  return (
    <>
      <HubCardFrame
        title={scope === 'project' ? 'Project Health' : 'Portfolio Health'}
        infoTooltip="Composite health score calculated from active KPIs. Click a row to see detail."
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
        {scope === 'portfolio' && (
          <SummaryBar>
            {counts.red > 0 && (
              <SummaryItem>
                <CountBadge $color="var(--color-pill-text-red)">{counts.red}</CountBadge>
                <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>Critical</Typography>
              </SummaryItem>
            )}
            {counts.yellow > 0 && (
              <SummaryItem>
                <CountBadge $color="var(--color-pill-text-yellow)">{counts.yellow}</CountBadge>
                <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>At Risk</Typography>
              </SummaryItem>
            )}
            <SummaryItem>
              <CountBadge $color="var(--color-pill-text-green)">{counts.green}</CountBadge>
              <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>Healthy</Typography>
            </SummaryItem>
          </SummaryBar>
        )}

        {displayed.length === 0
          ? <HubCardEmptyState title="No Health Data to Display" body="No active projects with health data found. Ensure projects are active and KPIs are configured in Account Settings." />
          : <Grid>{displayed.map(({ project, result }) => (
            <ProjectRow
              key={project.id}
              onClick={() => setTearsheetProject({ project, result })}
              aria-label={`Health detail for ${project.name}`}
            >
              <div style={{ minWidth: 0 }}>
                <Typography intent="small" style={{ color: 'var(--color-text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                  {project.name}
                </Typography>
                <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                  {project.region} · {project.stage.replace(/_/g, ' ')}
                </Typography>
              </div>
              <div
                onMouseEnter={e => {
                  e.stopPropagation();
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
                  hoverTimerRef.current = setTimeout(() => {
                    setPopover({ project, result, rect });
                  }, 300);
                }}
                onMouseLeave={() => {
                  if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
                }}
                onClick={e => {
                  e.stopPropagation();
                  setPopover(null);
                  setTearsheetProject({ project, result });
                }}
              >
                <HealthScoreBadge score={result.compositeScore} forecastScore={result.forecastScore} />
              </div>
              <Typography intent="small" style={{ color: 'var(--color-text-secondary)', textAlign: 'right' }}>
                {result.trend === 'degrading' ? '↓' : result.trend === 'improving' ? '↑' : '—'}
              </Typography>
            </ProjectRow>
          ))}</Grid>}
      </HubCardFrame>

      {tearsheetProject && (
        <HealthDetailTearsheet
          open={!!tearsheetProject}
          onClose={() => setTearsheetProject(null)}
          result={tearsheetProject.result}
          projectName={tearsheetProject.project.name}
          projectId={tearsheetProject.project.id}
        />
      )}

      {popover && (
        <HealthSummaryPopover
          result={popover.result}
          projectName={popover.project.name}
          anchorRect={popover.rect}
          onClose={() => setPopover(null)}
        />
      )}
    </>
  );
}
