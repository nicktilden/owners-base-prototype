/**
 * RISK BY TOOL BAR CARD
 * HTML horizontal bar chart showing active risk count per source tool.
 * Matches the Assets by Type card layout: label left, bar middle, count right.
 * Works at both portfolio and project scope.
 */

import React, { useMemo } from 'react';
import { Typography } from '@procore/core-react';
import HubCardFrame from '@/components/hubs/HubCardFrame';
import { useRiskTags } from '@/context/RiskTagsContext';
import { useManualRiskItems } from '@/context/ManualRiskItemsContext';
import type { RiskTag, ManualRiskItem } from '@/types/health';

// ─── Config ───────────────────────────────────────────────────────────────────

interface RiskByTypeBarCardProps {
  scope?: 'portfolio' | 'project';
  projectId?: string;
}

const ACTIVE_STATUSES = new Set(['open', 'pending_acceptance', 'pending_approval']);

const SOURCE_TYPE_LABELS: Record<string, string> = {
  rfi:            'RFIs',
  change_event:   'Change Events',
  submittal:      'Submittals',
  punch_list:     'Punch List',
  correspondence: 'Correspondence',
  milestone:      'Milestones',
  budget_line:    'Budget',
  manual:         'Manual Entry',
  observation:    'Observations',
  incident:       'Incidents',
  inspection:     'Inspections',
  task:           'Tasks',
  document:       'Documents',
};

// Assets by Type palette — same bar color
const BAR_COLOR = '#1d5cc9';

// ─── Component ────────────────────────────────────────────────────────────────

export default function RiskByTypeBarCard({ scope = 'portfolio', projectId }: RiskByTypeBarCardProps) {
  const { getRiskTagsForProject, riskTags } = useRiskTags();
  const { getManualRiskItemsForProject, manualRiskItems } = useManualRiskItems();

  const buckets = useMemo<{ label: string; count: number }[]>(() => {
    const counts: Record<string, number> = {};

    const tags: RiskTag[] = scope === 'project' && projectId
      ? getRiskTagsForProject(projectId).filter(t => ACTIVE_STATUSES.has(t.status))
      : riskTags.filter(t => ACTIVE_STATUSES.has(t.status));

    const manual: ManualRiskItem[] = scope === 'project' && projectId
      ? getManualRiskItemsForProject(projectId).filter(m => ACTIVE_STATUSES.has(m.status))
      : manualRiskItems.filter(m => ACTIVE_STATUSES.has(m.status));

    for (const tag of tags) {
      counts[tag.sourceType] = (counts[tag.sourceType] ?? 0) + 1;
    }
    if (manual.length > 0) {
      counts['manual'] = (counts['manual'] ?? 0) + manual.length;
    }

    return Object.entries(counts)
      .map(([key, count]) => ({ label: SOURCE_TYPE_LABELS[key] ?? key, count }))
      .sort((a, b) => b.count - a.count);
  }, [scope, projectId, riskTags, manualRiskItems, getRiskTagsForProject, getManualRiskItemsForProject]);

  const maxCount = Math.max(...buckets.map(b => b.count), 1);

  return (
    <HubCardFrame
      title="Risk by Tool"
      infoTooltip="Active risk tags grouped by the source tool they were tagged from."
    >
      <div style={{ padding: '0 8px 8px' }}>
        {buckets.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {buckets.map(row => (
              <div
                key={row.label}
                style={{ display: 'grid', gridTemplateColumns: '100px 1fr 32px', gap: 8, alignItems: 'center' }}
              >
                <Typography
                  intent="small"
                  style={{
                    color: 'var(--color-text-secondary)',
                    textAlign: 'right',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={row.label}
                >
                  {row.label}
                </Typography>
                <div
                  style={{
                    display: 'flex',
                    height: 20,
                    borderRadius: 4,
                    overflow: 'hidden',
                    background: 'var(--color-surface-secondary)',
                  }}
                >
                  <div
                    style={{
                      width: `${(row.count / maxCount) * 100}%`,
                      background: BAR_COLOR,
                      borderRadius: 4,
                      transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    title={`${row.label}: ${row.count} risk${row.count !== 1 ? 's' : ''}`}
                  />
                </div>
                <Typography
                  intent="small"
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontVariantNumeric: 'tabular-nums',
                    textAlign: 'right',
                  }}
                >
                  {String(row.count)}
                </Typography>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 13 }}>
            No active risk tags to display.
          </div>
        )}
      </div>
    </HubCardFrame>
  );
}
