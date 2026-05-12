/**
 * RISK REGISTER CARD
 * Displays top open risks with probability/impact matrix.
 * Scope: portfolio (top risks across all projects) or project (risks for one project).
 *
 * Data sources (merged):
 *  1. Seed Risk records     — allRisks from /data/seed/risks
 *  2. RiskTag records       — user-tagged tool objects (Change Events, RFIs, etc.)
 *  3. ManualRiskItem records — risks created without a source object
 */

import React, { useMemo } from 'react';
import { Button, Pill, Typography } from '@procore/core-react';
import { ArrowRight, EllipsisVertical } from '@procore/core-icons';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import HubCardFrame, { HubCardEmptyState } from '@/components/hubs/HubCardFrame';
import RiskExposureBar from '../RiskExposureBar';
import { risks as allRisks } from '@/data/seed/risks';
import { projects as allProjects } from '@/data/seed/projects';
import { riskTypes } from '@/data/seed/riskTypes';
import { useRiskTags } from '@/context/RiskTagsContext';
import { useManualRiskItems } from '@/context/ManualRiskItemsContext';
import type { Risk, RiskTag, ManualRiskItem, RiskCategory } from '@/types/health';

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

const riskTypeLookup = Object.fromEntries(riskTypes.map(rt => [rt.id, rt]));

// Unified display shape used internally by the card
interface DisplayRisk {
  id: string;
  projectId: string;
  title: string;
  probability: 1 | 2 | 3 | 4 | 5;
  score: number;
  category: string;
  responseStrategy: string;
  status: string;
  dueDate: string | null;
  origin: 'seed' | 'tag' | 'manual';
}

function seedRiskToDisplay(r: Risk): DisplayRisk {
  const maxImpact = Math.max(r.impactCost, r.impactSchedule, r.impactSafety);
  return {
    id: r.id,
    projectId: r.projectId,
    title: r.title,
    probability: r.probability,
    score: r.probability * maxImpact,
    category: r.category.charAt(0).toUpperCase() + r.category.slice(1),
    responseStrategy: r.responseStrategy,
    status: r.status,
    dueDate: r.dueDate,
    origin: 'seed',
  };
}

function tagToDisplay(tag: RiskTag): DisplayRisk {
  const rt = riskTypeLookup[tag.riskTypeId];
  const category = rt?.category ?? 'financial';
  const impactNorm = tag.impact > 5
    ? Math.min(5, Math.round(tag.impact / 100000)) || 1
    : (tag.impact as 1 | 2 | 3 | 4 | 5);
  const title = rt?.label ?? tag.sourceType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return {
    id: tag.id,
    projectId: tag.projectId,
    title,
    probability: tag.probability,
    score: tag.probability * impactNorm,
    category: category.charAt(0).toUpperCase() + category.slice(1),
    responseStrategy: tag.responseStrategy ?? 'mitigate',
    status: tag.status,
    dueDate: null,
    origin: 'tag',
  };
}

function manualToDisplay(item: ManualRiskItem): DisplayRisk {
  const rt = riskTypeLookup[item.riskTypeId];
  const category = rt?.category ?? 'financial';
  const impactNorm = item.impact > 5
    ? Math.min(5, Math.round(item.impact / 100000)) || 1
    : (item.impact as 1 | 2 | 3 | 4 | 5);
  return {
    id: item.id,
    projectId: item.projectId,
    title: item.title,
    probability: item.probability,
    score: item.probability * impactNorm,
    category: category.charAt(0).toUpperCase() + category.slice(1),
    responseStrategy: item.responseStrategy ?? 'mitigate',
    status: item.status,
    dueDate: null,
    origin: 'manual',
  };
}

const RESOLVED = new Set(['closed', 'mitigated', 'accepted']);

function statusColor(r: DisplayRisk): 'red' | 'yellow' | 'gray' {
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
  const { riskTags, getRiskTagsForProject } = useRiskTags();
  const { manualRiskItems, getManualRiskItemsForProject } = useManualRiskItems();

  const openRisks = useMemo<DisplayRisk[]>(() => {
    const isProject = scope === 'project' && !!projectId;

    // 1. Seed risks
    const seedSource = isProject
      ? allRisks.filter(r => r.projectId === projectId)
      : allRisks;
    const seedRows = seedSource
      .filter(r => r.status !== 'closed' && r.status !== 'mitigated')
      .map(seedRiskToDisplay);

    // 2. Risk tags (user-tagged tool objects)
    const tagSource = isProject
      ? getRiskTagsForProject(projectId)
      : riskTags;
    const tagRows = tagSource
      .filter(t => !RESOLVED.has(t.status))
      .map(tagToDisplay);

    // 3. Manual risk items
    const manualSource = isProject
      ? getManualRiskItemsForProject(projectId)
      : manualRiskItems;
    const manualRows = manualSource
      .filter(m => !RESOLVED.has(m.status))
      .map(manualToDisplay);

    return [...seedRows, ...tagRows, ...manualRows].sort((a, b) => b.score - a.score);
  }, [scope, projectId, riskTags, manualRiskItems, getRiskTagsForProject, getManualRiskItemsForProject]);

  // RiskExposureBar expects the legacy Risk shape — build a compatible proxy
  // using probability as all three impact dimensions for tags/manual items.
  const riskBarProxy = useMemo(() => openRisks.map(r => ({
    id: r.id,
    projectId: r.projectId,
    category: r.category.toLowerCase() as RiskCategory,
    title: r.title,
    description: '',
    probability: r.probability,
    impactCost: r.probability as 1 | 2 | 3 | 4 | 5,
    impactSchedule: r.probability as 1 | 2 | 3 | 4 | 5,
    impactSafety: r.probability as 1 | 2 | 3 | 4 | 5,
    responseStrategy: (r.responseStrategy ?? 'mitigate') as 'mitigate' | 'transfer' | 'accept' | 'avoid',
    status: (RESOLVED.has(r.status) ? 'mitigated' : 'identified') as 'identified' | 'assessed' | 'mitigated' | 'closed',
    dueDate: r.dueDate,
    origin: r.origin === 'seed' ? 'manual' : 'manual' as 'manual' | 'automated',
  })), [openRisks]);

  const displayed = openRisks.slice(0, 6);

  return (
    <HubCardFrame
      title="Risk Register"
      infoTooltip="Open risks sorted by probability × impact score. Includes tagged tool objects and manually logged risks."
      actions={
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button
            variant="secondary"
            className="b_secondary"
            size="sm"
            icon={<ArrowRight size="sm" />}
            onClick={() => router.push(scope === 'project' && projectId ? `/project/${projectId}/risk-register` : '/portfolio/risk-register')}
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
          <RiskExposureBar risks={riskBarProxy} />
        </BarWrapper>

        {displayed.map(risk => (
          <RiskRow key={risk.id}>
            <ProbBar $prob={risk.probability} />
            <RiskInfo>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
                <Typography intent="small" style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
                  {risk.title}
                </Typography>
                <Pill color={statusColor(risk)} style={{ fontSize: 10 }}>
                  P{risk.probability}
                </Pill>
                {risk.origin !== 'seed' && (
                  <Pill color="blue" style={{ fontSize: 10 }}>
                    Tagged
                  </Pill>
                )}
              </div>
              {scope === 'portfolio' && (
                <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: 2 }}>
                  {(projectLookup[risk.projectId] ?? risk.projectId).length > 50
                    ? (projectLookup[risk.projectId] ?? risk.projectId).slice(0, 50) + '…'
                    : (projectLookup[risk.projectId] ?? risk.projectId)}
                </Typography>
              )}
              <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
                {risk.category} · {risk.responseStrategy}
                {risk.dueDate ? ` · Due ${risk.dueDate}` : ''}
              </Typography>
            </RiskInfo>
            <Pill color="gray" style={{ fontSize: 10, flexShrink: 0 }}>
              {risk.status.charAt(0).toUpperCase() + risk.status.slice(1).replace(/_/g, ' ')}
            </Pill>
          </RiskRow>
        ))}
        </>)}
    </HubCardFrame>
  );
}
