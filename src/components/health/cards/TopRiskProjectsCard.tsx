/**
 * TOP RISK PROJECTS CARD
 * Shows top 5 projects sorted by composite health score (worst first).
 * Row click opens HealthDetailTearsheet for the selected project.
 */

import React, { useMemo, useState } from 'react';
import { Button, Pill, Typography } from '@procore/core-react';
import { ArrowRight } from '@procore/core-icons';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import HubCardFrame, { HubCardEmptyState } from '@/components/hubs/HubCardFrame';
import HealthDetailTearsheet from '../HealthDetailTearsheet';
import { buildHealthResult } from '@/utils/healthEngine';
import { projects as allProjects } from '@/data/seed/projects';
import { getRisksForProject } from '@/data/seed/risks';
import { useData } from '@/context/DataContext';
import type { HealthResult } from '@/types/health';
import type { Project } from '@/types/project';

// ─── Styled ───────────────────────────────────────────────────────────────────

const TableWrap = styled.div`
  overflow-x: auto;
  overflow-y: auto;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
`;

const Th = styled.th`
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-secondary);
  padding: 6px 8px 6px 0;
  border-bottom: 1px solid var(--color-border-separator);
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 8px 8px 8px 0;
  border-bottom: 1px solid var(--color-border-separator);
  color: var(--color-text-primary);
  vertical-align: middle;
`;

const TrClickable = styled.tr`
  cursor: pointer;
  &:last-child td { border-bottom: none; }
  &:hover td { background: var(--color-surface-secondary); }
`;

const TrendArrow = styled.span<{ $trend: string }>`
  font-size: 14px;
  color: ${({ $trend }) =>
    $trend === 'improving' ? 'var(--color-status-success)' :
    $trend === 'degrading' ? 'var(--color-status-danger)' :
    'var(--color-text-secondary)'};
`;

const SCORE_ORDER: Record<string, number> = { red: 0, yellow: 1, green: 2, unavailable: 3 };

const SCORE_COLOR: Record<string, 'red' | 'yellow' | 'green' | 'gray'> = {
  red: 'red',
  yellow: 'yellow',
  green: 'green',
  unavailable: 'gray',
};

const SCORE_LABEL: Record<string, string> = {
  red: 'Critical',
  yellow: 'At Risk',
  green: 'Healthy',
  unavailable: 'No Data',
};

const TREND_ARROW: Record<string, string> = {
  improving: '↑',
  degrading: '↓',
  stable: '→',
};

// ─── Component ────────────────────────────────────────────────────────────────

type TearsheetEntry = { project: Project; result: HealthResult };

export default function TopRiskProjectsCard() {
  const { data } = useData();
  const router = useRouter();
  const [tearsheetEntry, setTearsheetEntry] = useState<TearsheetEntry | null>(null);

  const rankedProjects = useMemo(() => {
    if (!data.account) return [];
    const healthConfig = data.account.healthConfig;
    const activeProjects = allProjects.filter((p) => p.status === 'active');

    return activeProjects
      .map((project) => {
        const risks = getRisksForProject(project.id);
        const result = buildHealthResult(project, healthConfig, undefined, risks);
        const openRisks = risks.filter((r) => r.status === 'identified' || r.status === 'assessed').length;
        return { project, result, openRisks };
      })
      .sort((a, b) => {
        const aOrder = SCORE_ORDER[a.result.compositeScore] ?? 3;
        const bOrder = SCORE_ORDER[b.result.compositeScore] ?? 3;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return b.openRisks - a.openRisks;
      })
      .slice(0, 5);
  }, [data.account]);

  return (
    <>
      <HubCardFrame
        title="Top Projects by Risk"
        actions={
          <Button
            variant="tertiary"
            size="sm"
            iconRight={<ArrowRight size="sm" />}
            onClick={() => router.push('/portfolio/health')}
          >
            View All
          </Button>
        }
      >
        {rankedProjects.length === 0 ? (
          <HubCardEmptyState title="No Active Projects" body="No active projects found." />
        ) : (
          <TableWrap>
            <StyledTable>
              <thead>
                <tr>
                  <Th>Project</Th>
                  <Th>Score</Th>
                  <Th>Trend</Th>
                  <Th style={{ textAlign: 'right' }}>Open Risks</Th>
                </tr>
              </thead>
              <tbody>
                {rankedProjects.map(({ project, result, openRisks }) => (
                  <TrClickable
                    key={project.id}
                    onClick={() => setTearsheetEntry({ project, result })}
                    aria-label={`Health detail for ${project.name}`}
                  >
                    <Td>
                      <Typography intent="small" style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                        {project.name}
                      </Typography>
                    </Td>
                    <Td>
                      <Pill color={SCORE_COLOR[result.compositeScore] ?? 'gray'}>
                        {SCORE_LABEL[result.compositeScore] ?? 'No Data'}
                      </Pill>
                    </Td>
                    <Td>
                      <TrendArrow $trend={result.trend}>
                        {TREND_ARROW[result.trend] ?? '→'}
                      </TrendArrow>
                    </Td>
                    <Td style={{ textAlign: 'right' }}>
                      <Typography intent="small" style={{ color: openRisks > 0 ? 'var(--color-status-danger)' : 'var(--color-text-secondary)' }}>
                        {openRisks}
                      </Typography>
                    </Td>
                  </TrClickable>
                ))}
              </tbody>
            </StyledTable>
          </TableWrap>
        )}
      </HubCardFrame>

      {tearsheetEntry && (
        <HealthDetailTearsheet
          open={!!tearsheetEntry}
          onClose={() => setTearsheetEntry(null)}
          result={tearsheetEntry.result}
          projectName={tearsheetEntry.project.name}
          projectId={tearsheetEntry.project.id}
        />
      )}
    </>
  );
}
