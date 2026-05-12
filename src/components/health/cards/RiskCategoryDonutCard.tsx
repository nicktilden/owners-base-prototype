/**
 * RISK CATEGORY DONUT CARD
 * Highcharts pie/donut chart showing active risk tag counts by category.
 * Works at both portfolio and project scope.
 */

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Typography } from '@procore/core-react';
import type { Options } from 'highcharts';
import HubCardFrame from '@/components/hubs/HubCardFrame';
import { useRiskTags } from '@/context/RiskTagsContext';
import { useManualRiskItems } from '@/context/ManualRiskItemsContext';
import { riskTypes } from '@/data/seed/riskTypes';
import type { RiskTag, ManualRiskItem } from '@/types/health';

// ─── SSR-safe Highcharts import ───────────────────────────────────────────────

const HighchartsReact = dynamic(() => import('highcharts-react-official'), { ssr: false });

let Highcharts: typeof import('highcharts') | null = null;
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Highcharts = require('@/lib/highcharts').default as typeof import('highcharts');
}

// ─── Config ───────────────────────────────────────────────────────────────────

interface RiskCategoryDonutCardProps {
  scope?: 'portfolio' | 'project';
  projectId?: string;
}

const ACTIVE_STATUSES = new Set(['open', 'pending_acceptance', 'pending_approval']);

// Assets by Type palette — same color scheme
const CATEGORY_COLORS: Record<string, string> = {
  financial:    '#1d5cc9',
  schedule:     '#5c8de8',
  safety:       '#c62828',
  quality:      '#9e9e9e',
  contractual:  '#4a6572',
  regulatory:   '#00a878',
  environmental:'#388e3c',
  other:        '#bdbdbd',
};

const CATEGORY_LABELS: Record<string, string> = {
  financial:    'Financial',
  schedule:     'Schedule',
  safety:       'Safety',
  quality:      'Quality',
  contractual:  'Contractual',
  regulatory:   'Regulatory',
  environmental:'Environmental',
  other:        'Other',
};

const riskTypeCategoryLookup = Object.fromEntries(
  riskTypes.map(rt => [rt.id, rt.category as string])
);

// ─── Component ────────────────────────────────────────────────────────────────

export default function RiskCategoryDonutCard({ scope = 'portfolio', projectId }: RiskCategoryDonutCardProps) {
  const { getRiskTagsForProject, riskTags } = useRiskTags();
  const { getManualRiskItemsForProject, manualRiskItems } = useManualRiskItems();

  const activeItems = useMemo<(RiskTag | ManualRiskItem)[]>(() => {
    if (scope === 'project' && projectId) {
      return [
        ...getRiskTagsForProject(projectId).filter(t => ACTIVE_STATUSES.has(t.status)),
        ...getManualRiskItemsForProject(projectId).filter(m => ACTIVE_STATUSES.has(m.status)),
      ];
    }
    return [
      ...riskTags.filter(t => ACTIVE_STATUSES.has(t.status)),
      ...manualRiskItems.filter(m => ACTIVE_STATUSES.has(m.status)),
    ];
  }, [scope, projectId, riskTags, manualRiskItems, getRiskTagsForProject, getManualRiskItemsForProject]);

  const seriesData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of activeItems) {
      const cat = riskTypeCategoryLookup[item.riskTypeId] ?? 'other';
      counts[cat] = (counts[cat] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([cat, y]) => ({
        name: CATEGORY_LABELS[cat] ?? cat,
        cat,
        y,
        color: CATEGORY_COLORS[cat] ?? '#bdbdbd',
      }))
      .sort((a, b) => b.y - a.y);
  }, [activeItems]);

  const total = activeItems.length;

  const options = useMemo<Options>(() => ({
    chart: {
      type: 'pie',
      height: 180,
      margin: [0, 0, 0, 0],
      spacing: [8, 8, 8, 8],
    },
    tooltip: {
      formatter() {
        const pt = this as unknown as { key: string; y: number; percentage: number };
        const label = pt.key ?? (this as unknown as { point: { name: string } }).point?.name ?? '';
        const count = pt.y ?? 0;
        return `<b>${label}</b><br/>${count} risk${count !== 1 ? 's' : ''} (${Math.round(pt.percentage ?? 0)}%)`;
      },
      useHTML: false,
    },
    plotOptions: {
      pie: {
        innerSize: '62%',
        dataLabels: { enabled: false },
        showInLegend: false,
        borderWidth: 2,
        borderColor: 'transparent',
      },
    },
    legend: { enabled: false },
    series: [{
      type: 'pie',
      name: 'Risks',
      data: seriesData,
    }],
    subtitle: {
      text: `<span style="font-size:22px;font-weight:700;color:#1a2533">${total}</span><br/><span style="font-size:11px;color:#8a97a7">active</span>`,
      floating: true,
      verticalAlign: 'middle',
      y: 8,
      useHTML: true,
    },
  }), [seriesData, total]);

  return (
    <HubCardFrame
      title="Risk by Category"
      infoTooltip="Active risk tags grouped by category across all source items."
    >
      <div style={{ padding: '0 8px 8px' }}>
        {Highcharts && seriesData.length > 0 ? (
          <HighchartsReact
            highcharts={Highcharts}
            options={options}
            containerProps={{ style: { width: '100%' } }}
          />
        ) : (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: '#8a97a7', fontSize: 13 }}>
            No active risk tags to display.
          </div>
        )}

        {/* Legend — matches Assets by Type style */}
        {seriesData.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
            {seriesData.map(item => (
              <span key={item.cat} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: item.color, flexShrink: 0 }} />
                <Typography intent="small" style={{ color: 'var(--color-text-secondary)', fontSize: 11 }}>
                  {item.name}
                </Typography>
              </span>
            ))}
          </div>
        )}
      </div>
    </HubCardFrame>
  );
}
