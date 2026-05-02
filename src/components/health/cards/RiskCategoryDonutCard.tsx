/**
 * RISK CATEGORY DONUT CARD
 * Highcharts pie/donut chart showing active risk tag counts by category.
 * Works at both portfolio and project scope.
 */

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { Options } from 'highcharts';
import { HC_COLORS } from '@/lib/highcharts';
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

const CATEGORY_COLORS: Record<string, string> = {
  financial:    '#e53935',
  schedule:     '#f57c00',
  safety:       '#c62828',
  quality:      '#7b1fa2',
  contractual:  '#2e7d32',
  regulatory:   '#0277bd',
  environmental:'#388e3c',
  other:        '#546e7a',
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
        y,
        color: CATEGORY_COLORS[cat] ?? HC_COLORS.text,
      }))
      .sort((a, b) => b.y - a.y);
  }, [activeItems]);

  const total = activeItems.length;

  const options = useMemo<Options>(() => ({
    chart: {
      type: 'pie',
      height: 200,
      margin: [0, 0, 0, 0],
      spacing: [8, 8, 8, 8],
    },
    tooltip: {
      pointFormat: '<b>{point.y}</b> risk{point.y !== 1 ? "s" : ""} ({point.percentage:.0f}%)',
    },
    plotOptions: {
      pie: {
        innerSize: '62%',
        dataLabels: { enabled: false },
        showInLegend: true,
        borderWidth: 2,
        borderColor: 'transparent',
      },
    },
    legend: {
      enabled: true,
      layout: 'vertical',
      align: 'right',
      verticalAlign: 'middle',
      itemStyle: {
        fontSize: '11px',
        fontWeight: '400',
        color: HC_COLORS.text,
      },
      itemHoverStyle: { color: '#1a2533' },
      symbolRadius: 2,
      symbolHeight: 10,
      symbolWidth: 10,
    },
    series: [{
      type: 'pie',
      name: 'Risks',
      data: seriesData,
    }],
    // Center label rendered via subtitle trick
    subtitle: {
      text: `<span style="font-size:22px;font-weight:700;color:#1a2533">${total}</span><br/><span style="font-size:11px;color:${HC_COLORS.textLight}">active</span>`,
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
          <div style={{ padding: '32px 16px', textAlign: 'center', color: HC_COLORS.textLight, fontSize: 13 }}>
            No active risk tags to display.
          </div>
        )}
      </div>
    </HubCardFrame>
  );
}
