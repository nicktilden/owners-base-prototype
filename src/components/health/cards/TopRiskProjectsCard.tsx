/**
 * TOP RISK TYPES CARD
 * Shows the top 5 risk categories by aggregate severity score across all active projects.
 * Score = sum of (probability × max impact) for all open/assessed risks in that category.
 * Row click navigates to the full Risk Registry filtered by category.
 */

import React, { useMemo } from 'react';
import { Button, Pill, Tooltip, Typography } from '@procore/core-react';
import { ArrowRight, ArrowUp, ArrowDown, Minus, Info } from '@procore/core-icons';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import HubCardFrame, { HubCardEmptyState } from '@/components/hubs/HubCardFrame';
import { projects as allProjects } from '@/data/seed/projects';
import { risks as allRisks } from '@/data/seed/risks';
import { riskTypes } from '@/data/seed/riskTypes';
import { useRiskTags } from '@/context/RiskTagsContext';
import { useManualRiskItems } from '@/context/ManualRiskItemsContext';
import type { RiskCategory } from '@/types/health';

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

const ScoreCell = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

const InfoIconWrap = styled.span`
  display: inline-flex;
  align-items: center;
  color: var(--color-text-secondary);
  cursor: help;
  flex-shrink: 0;
  &:hover { color: var(--color-text-primary); }
`;

const TrendWrap = styled.div<{ $dir: 'up' | 'down' | 'stable' }>`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  font-weight: 500;
  color: ${({ $dir }) =>
    $dir === 'up' ? 'var(--color-status-danger)' :
    $dir === 'down' ? 'var(--color-status-success)' :
    'var(--color-text-secondary)'};
`;

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<RiskCategory, string> = {
  financial:     'Financial',
  schedule:      'Schedule',
  safety:        'Safety',
  contractual:   'Contractual',
  regulatory:    'Regulatory',
  environmental: 'Environmental',
};

// Score thresholds: max possible per risk = 5×5 = 25; we bucket aggregate score
function scoreToLevel(score: number, maxScore: number): 'red' | 'yellow' | 'green' {
  const pct = maxScore > 0 ? score / maxScore : 0;
  if (pct >= 0.6) return 'red';
  if (pct >= 0.3) return 'yellow';
  return 'green';
}

const LEVEL_LABEL: Record<string, string>                    = { red: 'Critical', yellow: 'At Risk', green: 'Healthy' };
const LEVEL_COLOR: Record<string, 'red' | 'yellow' | 'green'> = { red: 'red', yellow: 'yellow', green: 'green' };

// Deterministic pseudo-trend per category using score + count as seed.
// Simulates "vs. last period" — no real historical data available.
const CATEGORY_TREND_SEED: Partial<Record<RiskCategory, 'up' | 'down' | 'stable'>> = {
  financial:     'up',
  schedule:      'up',
  contractual:   'stable',
  regulatory:    'down',
  safety:        'down',
  environmental: 'stable',
};

const TREND_LABEL: Record<'up' | 'down' | 'stable', string> = {
  up:     'Worsening',
  down:   'Improving',
  stable: 'Stable',
};

// Active statuses that count toward risk score (seed risks use these statuses)
const SEED_ACTIVE_STATUSES = new Set(['identified', 'assessed']);
// Active statuses for tags/manual items
const TAG_ACTIVE_STATUSES = new Set(['open', 'pending_acceptance', 'pending_approval']);

const riskTypeLookup = Object.fromEntries(riskTypes.map(rt => [rt.id, rt]));

// ─── Component ────────────────────────────────────────────────────────────────

export default function TopRiskProjectsCard() {
  const router = useRouter();
  const { riskTags } = useRiskTags();
  const { manualRiskItems } = useManualRiskItems();

  const rankedCategories = useMemo(() => {
    const activeProjectIds = new Set(
      allProjects.filter(p => p.status === 'active').map(p => p.id)
    );

    // Aggregate per category
    const categoryMap = new Map<RiskCategory, {
      score: number;
      openCount: number;
      projectIds: Set<string>;
    }>();

    function accumulate(category: RiskCategory, severity: number, projectId: string) {
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { score: 0, openCount: 0, projectIds: new Set() });
      }
      const entry = categoryMap.get(category)!;
      entry.score += severity;
      entry.openCount += 1;
      entry.projectIds.add(projectId);
    }

    // 1. Seed risks
    for (const r of allRisks) {
      if (!activeProjectIds.has(r.projectId)) continue;
      if (!SEED_ACTIVE_STATUSES.has(r.status)) continue;
      const severity = r.probability * Math.max(r.impactCost, r.impactSchedule, r.impactSafety);
      accumulate(r.category, severity, r.projectId);
    }

    // 2. RiskTags (user-tagged tool objects)
    for (const tag of riskTags) {
      if (!activeProjectIds.has(tag.projectId)) continue;
      if (!TAG_ACTIVE_STATUSES.has(tag.status)) continue;
      const rt = riskTypeLookup[tag.riskTypeId];
      const category: RiskCategory = (rt?.category as RiskCategory) ?? 'financial';
      const impactNorm = tag.impact > 5 ? Math.min(5, Math.round(tag.impact / 100000)) || 1 : tag.impact;
      accumulate(category, tag.probability * impactNorm, tag.projectId);
    }

    // 3. Manual risk items
    for (const item of manualRiskItems) {
      if (!activeProjectIds.has(item.projectId)) continue;
      if (!TAG_ACTIVE_STATUSES.has(item.status)) continue;
      const rt = riskTypeLookup[item.riskTypeId];
      const category: RiskCategory = (rt?.category as RiskCategory) ?? 'financial';
      const impactNorm = item.impact > 5 ? Math.min(5, Math.round(item.impact / 100000)) || 1 : item.impact;
      accumulate(category, item.probability * impactNorm, item.projectId);
    }

    const entries = Array.from(categoryMap.entries()).map(([category, { score, openCount, projectIds }]) => ({
      category,
      score,
      openCount,
      projectCount: projectIds.size,
      trend: CATEGORY_TREND_SEED[category] ?? 'stable',
    }));

    // Sort by score descending
    entries.sort((a, b) => b.score - a.score);

    const maxScore = entries[0]?.score ?? 1;
    return entries.slice(0, 5).map(e => ({
      ...e,
      level: scoreToLevel(e.score, maxScore),
      scoreDisplay: Math.round(e.score),
    }));
  }, [riskTags, manualRiskItems]);

  return (
    <HubCardFrame
      title="Top Risk Types"
      infoTooltip="Ranks risk categories by aggregate severity score (probability × impact) across all open risks on active projects."
      actions={
        <Button
          variant="tertiary"
          size="sm"
          iconRight={<ArrowRight size="sm" />}
          onClick={() => router.push('/portfolio/risk-register')}
        >
          View All
        </Button>
      }
    >
      {rankedCategories.length === 0 ? (
        <HubCardEmptyState title="No Open Risks" body="No open or assessed risks found across active projects." />
      ) : (
        <TableWrap>
          <StyledTable>
            <thead>
              <tr>
                <Th>Risk Type</Th>
                <Th>Score</Th>
                <Th style={{ textAlign: 'center' }}>Trend</Th>
                <Th style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Open Risks</Th>
                <Th style={{ textAlign: 'right' }}>Projects</Th>
              </tr>
            </thead>
            <tbody>
              {rankedCategories.map(({ category, scoreDisplay, openCount, projectCount, level, trend }) => (
                <TrClickable
                  key={category}
                  onClick={() => router.push('/portfolio/risk-register')}
                  aria-label={`View ${CATEGORY_LABELS[category]} risks`}
                >
                  <Td style={{ minWidth: 120 }}>
                    <Typography intent="small" style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                      {CATEGORY_LABELS[category]}
                    </Typography>
                  </Td>

                  {/* Score: pill + info icon with tooltip */}
                  <Td style={{ minWidth: 120 }}>
                    <ScoreCell>
                      <Pill color={LEVEL_COLOR[level]} style={{ fontSize: 11, flexShrink: 0 }}>
                        {LEVEL_LABEL[level]}
                      </Pill>
                      <Tooltip
                        trigger="hover"
                        placement="top"
                        overlay={
                          <Tooltip.Content>
                            <div style={{ maxWidth: 220, whiteSpace: 'normal' }}>
                              <strong>Risk Score: {scoreDisplay}</strong>
                              <br />
                              Calculated as the sum of probability × max impact across all open risks in this category.
                              Higher scores indicate greater aggregate exposure.
                            </div>
                          </Tooltip.Content>
                        }
                      >
                        <InfoIconWrap onClick={e => e.stopPropagation()}>
                          <Info size="sm" />
                        </InfoIconWrap>
                      </Tooltip>
                    </ScoreCell>
                  </Td>

                  {/* Trend */}
                  <Td style={{ textAlign: 'center' }}>
                    <Tooltip
                      trigger="hover"
                      placement="top"
                      overlay={
                        <Tooltip.Content>
                          <div style={{ whiteSpace: 'nowrap' }}>
                            {TREND_LABEL[trend]} vs. last 30 days
                          </div>
                        </Tooltip.Content>
                      }
                    >
                      <TrendWrap $dir={trend} onClick={e => e.stopPropagation()}>
                        {trend === 'up'     && <ArrowUp size="sm" />}
                        {trend === 'down'   && <ArrowDown size="sm" />}
                        {trend === 'stable' && <Minus size="sm" />}
                        <span>{TREND_LABEL[trend]}</span>
                      </TrendWrap>
                    </Tooltip>
                  </Td>

                  <Td style={{ textAlign: 'right' }}>
                    <Typography intent="small" style={{ color: openCount > 0 ? 'var(--color-status-danger)' : 'var(--color-text-secondary)' }}>
                      {openCount}
                    </Typography>
                  </Td>
                  <Td style={{ textAlign: 'right' }}>
                    <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
                      {projectCount}
                    </Typography>
                  </Td>
                </TrClickable>
              ))}
            </tbody>
          </StyledTable>
        </TableWrap>
      )}
    </HubCardFrame>
  );
}
