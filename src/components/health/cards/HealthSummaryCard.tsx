/**
 * HEALTH SUMMARY CARD (v7)
 * Portfolio health hub card. Delta-led 3-tab layout:
 *   Tab 1 "What changed" — projects degraded/improved since last snapshot
 *   Tab 2 "What's coming" — forecast tensions (current green but forecast yellow/red)
 *   Tab 3 "All projects" — full leaderboard sortable by current or forecast
 * Connected projects appear in all tabs alongside owner-managed projects.
 * Uses DualStatusBadge (current|forecast split pill) throughout.
 */

import React, { useMemo, useState } from 'react';
import { Button, Tabs, Typography } from '@procore/core-react';
import { ArrowRight, EllipsisVertical } from '@procore/core-icons';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import HubCardFrame, { HubCardEmptyState } from '@/components/hubs/HubCardFrame';
import DualStatusBadge from '../DualStatusBadge';
import OriginIndicator from '../OriginIndicator';
import HealthDetailTearsheet from '../HealthDetailTearsheet';
import HealthSummaryPopover from '../HealthSummaryPopover';
import { buildHealthResult } from '@/utils/healthEngine';
import { projects as allProjects } from '@/data/seed/projects';
import { getRisksForProject } from '@/data/seed/risks';
import { useData } from '@/context/DataContext';
import { useRiskTags } from '@/context/RiskTagsContext';
import { useManualRiskItems } from '@/context/ManualRiskItemsContext';
import { useConnectData } from '@/context/ConnectDataContext';
import type { HealthResult, HealthScore } from '@/types/health';
import type { Project } from '@/types/project';

// ─── Styled components ────────────────────────────────────────────────────────

const Grid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const ProjectRow = styled.button`
  display: grid;
  grid-template-columns: 1fr 80px 24px;
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

const DeltaChip = styled.span<{ $direction: 'degraded' | 'improved' }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  background: ${({ $direction }) => $direction === 'degraded'
    ? 'var(--color-pill-bg-red)'
    : 'var(--color-pill-bg-green)'};
  color: ${({ $direction }) => $direction === 'degraded'
    ? 'var(--color-pill-text-red)'
    : 'var(--color-pill-text-green)'};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0 4px;
  border-bottom: 1px solid var(--color-border-separator);
  margin-bottom: 4px;
`;

const EmptyTabMsg = styled.div`
  padding: 24px 0;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 13px;
`;

type TabKey = 'changed' | 'coming' | 'all';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreOrder(s: HealthScore): number {
  return s === 'red' ? 0 : s === 'yellow' ? 1 : 2;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  scope?: 'portfolio' | 'project';
  projectId?: string;
}

export default function HealthSummaryCard({ scope = 'portfolio', projectId }: Props) {
  const router = useRouter();
  const { data } = useData();
  const { riskTags } = useRiskTags();
  const { manualRiskItems } = useManualRiskItems();
  const { getConnectDataForProject } = useConnectData();
  const config = data.account?.healthConfig;
  const snapshots = data.healthSnapshotsByProject;

  const [activeTab, setActiveTab] = useState<TabKey>('changed');
  const [tearsheetProject, setTearsheetProject] = useState<{ project: Project; result: HealthResult } | null>(null);

  const projectResults = useMemo(() => {
    if (!config) return [];
    const source = scope === 'project' && projectId
      ? allProjects.filter(p => p.id === projectId)
      : allProjects.filter(p => p.status === 'active');

    return source.map(p => {
      const risks = getRisksForProject(p.id);
      const tags = riskTags.filter(t => t.projectId === p.id);
      const manuals = manualRiskItems.filter(m => m.projectId === p.id);
      const connectData = p.isConnected ? getConnectDataForProject(p.id) : undefined;
      const result = buildHealthResult(p, config, undefined, risks, tags, manuals, connectData);
      const projectSnaps = snapshots[p.id] ?? [];
      const previousScore = projectSnaps.length >= 2
        ? projectSnaps[projectSnaps.length - 2]!.score
        : null;
      return { project: p, result, previousScore };
    });
  }, [config, scope, projectId, riskTags, manualRiskItems, getConnectDataForProject, snapshots]);

  if (!config) return null;

  // Tab 1: "What changed" — degraded or improved in last snapshot
  const changed = projectResults
    .filter(r => r.previousScore && r.previousScore !== r.result.compositeScore)
    .sort((a, b) => scoreOrder(a.result.compositeScore) - scoreOrder(b.result.compositeScore));

  const degraded = changed.filter(r => r.previousScore && scoreOrder(r.result.compositeScore) < scoreOrder(r.previousScore));
  const improved = changed.filter(r => r.previousScore && scoreOrder(r.result.compositeScore) > scoreOrder(r.previousScore));

  // Tab 2: "What's coming" — green now but forecast is yellow/red
  const tensions = projectResults
    .filter(r => r.result.compositeScore === 'green' && r.result.forecastScore !== 'green')
    .sort((a, b) => scoreOrder(a.result.forecastScore) - scoreOrder(b.result.forecastScore));

  // Tab 3: "All projects" — full leaderboard
  const allSorted = [...projectResults].sort((a, b) =>
    scoreOrder(a.result.compositeScore) - scoreOrder(b.result.compositeScore)
  );

  function getOriginState(p: Project) {
    if (p.isConnected) return 'connected_partner' as const;
    return 'automated' as const;
  }

  function renderRow({ project, result, previousScore }: typeof projectResults[number], showDelta = false) {
    return (
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
          {showDelta && previousScore && previousScore !== result.compositeScore && (
            <DeltaChip $direction={scoreOrder(result.compositeScore) < scoreOrder(previousScore) ? 'degraded' : 'improved'}>
              {scoreOrder(result.compositeScore) < scoreOrder(previousScore) ? '↓ Degraded' : '↑ Improved'}
            </DeltaChip>
          )}
        </div>
        <DualStatusBadge currentScore={result.compositeScore} forecastScore={result.forecastScore} />
        <OriginIndicator origin={getOriginState(project)} />
      </ProjectRow>
    );
  }

  const tabBar = scope === 'portfolio' ? (
    <Tabs>
      <Tabs.Tab role="button" selected={activeTab === 'changed'} onPress={() => setActiveTab('changed')}>
        What changed {changed.length > 0 ? `(${changed.length})` : ''}
      </Tabs.Tab>
      <Tabs.Tab role="button" selected={activeTab === 'coming'} onPress={() => setActiveTab('coming')}>
        What&apos;s coming {tensions.length > 0 ? `(${tensions.length})` : ''}
      </Tabs.Tab>
      <Tabs.Tab role="button" selected={activeTab === 'all'} onPress={() => setActiveTab('all')}>
        All projects
      </Tabs.Tab>
    </Tabs>
  ) : undefined;

  return (
    <>
      <HubCardFrame
        title={scope === 'project' ? 'Project Health' : 'Portfolio Health'}
        infoTooltip="v7: Delta-led health overview. Current|Forecast badges show where each project is now and where it's headed."
        controls={tabBar}
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
        {/* Portfolio 3-tab layout */}
        {scope === 'portfolio' && (
          <>
            {activeTab === 'changed' && (
              <>
                {changed.length === 0
                  ? <EmptyTabMsg>No status changes since last snapshot.</EmptyTabMsg>
                  : <Grid>
                    {degraded.length > 0 && (
                      <>
                        <SectionHeader>
                          <Typography intent="small" style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                            Degraded ({degraded.length})
                          </Typography>
                        </SectionHeader>
                        {degraded.map(r => renderRow(r, true))}
                      </>
                    )}
                    {improved.length > 0 && (
                      <>
                        <SectionHeader style={{ marginTop: degraded.length > 0 ? 8 : 0 }}>
                          <Typography intent="small" style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                            Improved ({improved.length})
                          </Typography>
                        </SectionHeader>
                        {improved.map(r => renderRow(r, true))}
                      </>
                    )}
                  </Grid>
                }
              </>
            )}

            {activeTab === 'coming' && (
              <>
                {tensions.length === 0
                  ? <EmptyTabMsg>No projects forecast to degrade. Looking good!</EmptyTabMsg>
                  : <Grid>{tensions.map(r => renderRow(r, false))}</Grid>
                }
              </>
            )}

            {activeTab === 'all' && (
              <>
                {allSorted.length === 0
                  ? <HubCardEmptyState title="No Health Data" body="No active projects with health data found." />
                  : <Grid>{allSorted.slice(0, 10).map(r => renderRow(r, false))}</Grid>
                }
              </>
            )}
          </>
        )}

        {/* Project scope — simple single view */}
        {scope === 'project' && (
          <>
            {projectResults.length === 0
              ? <HubCardEmptyState title="No Health Data to Display" body="No active projects with health data found." />
              : <Grid>{projectResults.map(r => renderRow(r, false))}</Grid>
            }
          </>
        )}
      </HubCardFrame>

      {tearsheetProject && (
        <HealthDetailTearsheet
          open={!!tearsheetProject}
          onClose={() => setTearsheetProject(null)}
          result={tearsheetProject.result}
          projectName={tearsheetProject.project.name}
          projectId={tearsheetProject.project.id}
          isConnected={tearsheetProject.project.isConnected}
          connectData={tearsheetProject.project.isConnected ? getConnectDataForProject(tearsheetProject.project.id) : undefined}
        />
      )}
    </>
  );
}
