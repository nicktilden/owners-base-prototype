/**
 * RISK BY TOOL BAR CARD
 * Highcharts horizontal bar chart showing active risk count per source tool.
 * Groups by sourceType on RiskTag; ManualRiskItem gets "Manual Entry".
 * Works at both portfolio and project scope.
 */

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { Options } from 'highcharts';
import { HC_COLORS } from '@/lib/highcharts';
import HubCardFrame from '@/components/hubs/HubCardFrame';
import { useRiskTags } from '@/context/RiskTagsContext';
import { useManualRiskItems } from '@/context/ManualRiskItemsContext';
import type { RiskTag, ManualRiskItem } from '@/types/health';

// ─── SSR-safe Highcharts import ───────────────────────────────────────────────

const HighchartsReact = dynamic(() => import('highcharts-react-official'), { ssr: false });

let Highcharts: typeof import('highcharts') | null = null;
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Highcharts = require('@/lib/highcharts').default as typeof import('highcharts');
}

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
};

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

  const chartHeight = Math.max(140, buckets.length * 36 + 40);

  const options = useMemo<Options>(() => ({
    chart: {
      type: 'bar',
      height: chartHeight,
      margin: [8, 24, 8, 0],
      spacing: [8, 8, 8, 8],
    },
    xAxis: {
      categories: buckets.map(b => b.label),
      lineWidth: 0,
      tickWidth: 0,
      labels: {
        style: { fontSize: '12px', color: HC_COLORS.text },
        align: 'right',
      },
    },
    yAxis: {
      title: { text: undefined },
      gridLineColor: HC_COLORS.gridLine,
      tickAmount: 4,
      labels: {
        style: { fontSize: '11px', color: HC_COLORS.textLight },
        formatter() { return Number.isInteger(this.value) ? String(this.value) : ''; },
      },
      allowDecimals: false,
    },
    tooltip: {
      pointFormat: '<b>{point.y}</b> risk{point.y !== 1 ? "s" : ""}',
    },
    plotOptions: {
      bar: {
        borderRadius: 3,
        color: HC_COLORS.green,
        dataLabels: {
          enabled: true,
          style: { fontSize: '11px', fontWeight: '600', color: HC_COLORS.text, textOutline: 'none' },
        },
        pointPadding: 0.1,
        groupPadding: 0.1,
      },
    },
    series: [{
      type: 'bar',
      name: 'Risks',
      data: buckets.map(b => b.count),
    }],
  }), [buckets, chartHeight]);

  return (
    <HubCardFrame
      title="Risk by Tool"
      infoTooltip="Active risk tags grouped by the source tool they were tagged from."
    >
      <div style={{ padding: '0 8px 8px' }}>
        {Highcharts && buckets.length > 0 ? (
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
