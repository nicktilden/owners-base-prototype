/**
 * RISK REGISTER CARD
 * Displays top open risks with probability/impact matrix.
 * Scope: portfolio (top risks across all projects) or project (risks for one project).
 */

import React, { useMemo, useState } from 'react';
import { Button, Pill, Typography } from '@procore/core-react';
import { ArrowRight, EllipsisVertical } from '@procore/core-icons';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import HubCardFrame, { HubCardEmptyState } from '@/components/hubs/HubCardFrame';
import RiskExposureBar from '../RiskExposureBar';
import { risks as allRisks } from '@/data/seed/risks';
import { projects as allProjects } from '@/data/seed/projects';
import type { Risk } from '@/types/health';

// ─── Styled ───────────────────────────────────────────────────────────────────

const RiskRow = styled.div`
  display: grid;
  grid-template-columns: 6px 1fr auto;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border-separator);
  &:last-child { border-bottom: none; }
`;

const ProbBar = styled.div<{ $prob: number }>`
  width: 6px;
  border-radius: 3px;
  height: 100%;
  min-height: 32px;
  background: ${({ $prob }) =>
    $prob >= 4 ? 'var(--color-pill-border-red)' :
    $prob >= 3 ? 'var(--color-pill-border-yellow)' :
    'var(--color-pill-border-green)'};
`;

const RiskInfo = styled.div`
  min-width: 0;
`;

const BarWrapper = styled.div`
  padding: 8px 0 12px;
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const projectLookup: Record<string, string> = {};
for (const p of allProjects) {
  projectLookup[p.id] = p.name;
}

function riskScore(r: Risk): number {
  return r.probability * Math.max(r.impactCost, r.impactSchedule, r.impactSafety);
}

function riskStatusColor(r: Risk): 'red' | 'yellow' | 'gray' {
  if (r.probability >= 4) return 'red';
  if (r.probability >= 3) return 'yellow';
  return 'gray';
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  scope?: 'portfolio' | 'project';
  projectId?: string;
}

export default function RiskRegisterCard({ scope = 'portfolio', projectId }: Props) {
  const router = useRouter();

  const openRisks = useMemo(() => {
    const source = scope === 'project' && projectId
      ? allRisks.filter(r => r.projectId === projectId)
      : allRisks;
    return source
      .filter(r => r.status !== 'closed' && r.status !== 'mitigated')
      .sort((a, b) => riskScore(b) - riskScore(a));
  }, [scope, projectId]);

  const displayed = openRisks.slice(0, 6);

  return (
    <HubCardFrame
      title="Risk Register"
      infoTooltip="Open risks sorted by probability × impact score. High-probability risks indicate forecast exposure."
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
      {openRisks.length === 0
        ? <HubCardEmptyState title="No Open Risks" body="There are no open risks for this project. All risks have been resolved or none have been logged yet." />
        : (<>
        <BarWrapper>
          <RiskExposureBar risks={openRisks} />
        </BarWrapper>

        {displayed.map(risk => (
          <RiskRow key={risk.id}>
            <ProbBar $prob={risk.probability} />
            <RiskInfo>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
                <Typography intent="small" style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
                  {risk.title}
                </Typography>
                <Pill color={riskStatusColor(risk)} style={{ fontSize: 10 }}>
                  P{risk.probability}
                </Pill>
              </div>
              {scope === 'portfolio' && (
                <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: 2 }}>
                  {(projectLookup[risk.projectId] ?? risk.projectId).length > 50
                    ? (projectLookup[risk.projectId] ?? risk.projectId).slice(0, 50) + '…'
                    : (projectLookup[risk.projectId] ?? risk.projectId)}
                </Typography>
              )}
              <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
                {risk.category.charAt(0).toUpperCase() + risk.category.slice(1)} · {risk.responseStrategy}
                {risk.dueDate ? ` · Due ${risk.dueDate}` : ''}
              </Typography>
            </RiskInfo>
            <Pill color="gray" style={{ fontSize: 10, flexShrink: 0 }}>
              {risk.status.charAt(0).toUpperCase() + risk.status.slice(1)}
            </Pill>
          </RiskRow>
        ))}
        </>)}
    </HubCardFrame>
  );
}
