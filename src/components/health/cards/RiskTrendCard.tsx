/**
 * RISK TREND CARD
 * Highcharts area chart showing open risk count and aggregate risk score
 * over the last 6 months for a single project.
 * Trend data is synthesised from the current risk snapshot (no createdAt in seed).
 */

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Options, SeriesAreaOptions } from 'highcharts';
import { HC_COLORS } from '@/lib/highcharts';
import HubCardFrame from '@/components/hubs/HubCardFrame';
import SegmentedControl from '@/components/SegmentedControl';
import type { Risk } from '@/types/health';

// ─── SSR-safe Highcharts import ───────────────────────────────────────────────

const HighchartsReact = dynamic(() => import('highcharts-react-official'), { ssr: false });

let Highcharts: typeof import('highcharts') | null = null;
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Highcharts = require('@/lib/highcharts').default as typeof import('highcharts');
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function lastNMonths(n: number): string[] {
  const today = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - (n - 1 - i), 1);
    return MONTHS[d.getMonth()];
  });
}

function riskScore(r: Risk) {
  return r.probability * Math.max(r.impactCost, r.impactSchedule, r.impactSafety);
}

/**
 * Synthesises 6-month trend from current snapshot.
 * Logic: assume risks were gradually identified — earlier months show fewer
 * open risks, with a slight score escalation as high-severity risks surface.
 */
function buildTrend(risks: Risk[], resolvedIds: Set<string>) {
  const active = risks.filter(
    r => r.status !== 'closed' && r.status !== 'mitigated' && !resolvedIds.has(r.id)
  );
  const resolved = risks.filter(
    r => r.status === 'closed' || r.status === 'mitigated' || resolvedIds.has(r.id)
  );

  const n = 6;
  const counts: number[] = [];
  const scores: number[] = [];

  const baseCount = Math.max(1, Math.round(active.length * 0.4));
  const baseScore = active.length > 0
    ? Math.round(active.reduce((s, r) => s + riskScore(r), 0) / active.length * 0.5)
    : 0;

  for (let i = 0; i < n; i++) {
    const pct = 0.4 + (0.6 * i) / (n - 1);
    const resolvedThisMonth = Math.round(resolved.length * (i / n));
    counts.push(Math.round(baseCount + (active.length - baseCount) * (i / (n - 1))) - resolvedThisMonth);
    scores.push(Math.round((baseScore + (active.length > 0
      ? active.reduce((s, r) => s + riskScore(r), 0) / active.length
      : 0) * pct) / 2));
  }

  counts[n - 1] = active.length;
  scores[n - 1] = active.length > 0
    ? Math.round(active.reduce((s, r) => s + riskScore(r), 0) / active.length)
    : 0;

  return { counts, scores };
}

function buildOptions(
  months: string[],
  counts: number[],
  scores: number[],
  mode: 'count' | 'score',
): Options {
  const data = mode === 'count' ? counts : scores;
  const lastVal = data[data.length - 1];
  const prevVal = data[data.length - 2] ?? lastVal;
  const trending = lastVal > prevVal ? 'up' : lastVal < prevVal ? 'down' : 'flat';
  const color = mode === 'count'
    ? (trending === 'down' ? HC_COLORS.green : trending === 'up' ? HC_COLORS.red : HC_COLORS.yellow)
    : (lastVal >= 15 ? HC_COLORS.red : lastVal >= 8 ? HC_COLORS.yellow : HC_COLORS.green);

  const series: SeriesAreaOptions[] = [{
    type: 'area',
    name: mode === 'count' ? 'Open Risks' : 'Avg Score',
    data: data.map((y, x) => ({ x, y })),
    color,
    lineWidth: 2.5,
    marker: {
      enabled: true,
      radius: 4,
      symbol: 'circle',
      fillColor: color,
      lineColor: '#fff',
      lineWidth: 2,
    },
    fillColor: {
      linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
      stops: [
        [0, color + '28'],
        [1, color + '00'],
      ],
    },
  }];

  return {
    chart: { type: 'area', height: 180, margin: [12, 8, 28, 32], animation: false },
    xAxis: {
      categories: months,
      lineWidth: 0,
      tickWidth: 0,
      labels: { style: { fontSize: '11px', color: HC_COLORS.textLight } },
    },
    yAxis: {
      min: 0,
      allowDecimals: false,
      gridLineColor: HC_COLORS.gridLine,
      gridLineWidth: 1,
      lineWidth: 0,
      tickWidth: 0,
      title: { text: undefined },
      labels: { style: { fontSize: '11px', color: HC_COLORS.textLight } },
    },
    tooltip: {
      formatter() {
        const label = mode === 'count' ? 'Open risks' : 'Avg score';
        return `<b>${this.x}</b><br/>${label}: <b>${this.y}</b>`;
      },
    },
    plotOptions: {
      area: {
        fillOpacity: 1,
        marker: { enabled: true },
      },
    },
    series,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

interface RiskTrendCardProps {
  risks: Risk[];
  resolvedIds?: Set<string>;
}

type TrendMode = 'count' | 'score';

export default function RiskTrendCard({ risks, resolvedIds = new Set() }: RiskTrendCardProps) {
  const [mode, setMode] = useState<TrendMode>('count');
  const months = useMemo(() => lastNMonths(6), []);
  const { counts, scores } = useMemo(
    () => buildTrend(risks, resolvedIds),
    [risks, resolvedIds]
  );

  const options = useMemo(
    () => buildOptions(months, counts, scores, mode),
    [months, counts, scores, mode]
  );

  const activeCount = risks.filter(
    r => r.status !== 'closed' && r.status !== 'mitigated' && !resolvedIds.has(r.id)
  ).length;

  const prevCount = counts[counts.length - 2] ?? activeCount;
  const delta = activeCount - prevCount;

  const controls = (
    <SegmentedControl>
      <SegmentedControl.Segment
        label="Count"
        selected={mode === 'count'}
        onClick={() => setMode('count')}
      />
      <SegmentedControl.Segment
        label="Score"
        selected={mode === 'score'}
        onClick={() => setMode('score')}
      />
    </SegmentedControl>
  );

  return (
    <HubCardFrame
      title="Risk Trend"
      infoTooltip="Open risk count and average risk score over the last 6 months"
      controls={controls}
    >
      {/* Summary stat */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'baseline', marginBottom: 8 }}>
        <div>
          <span style={{ fontSize: 28, fontWeight: 600, color: 'var(--color-text-primary)', letterSpacing: '-0.5px' }}>
            {activeCount}
          </span>
          <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginLeft: 6 }}>
            open risks
          </span>
        </div>
        {delta !== 0 && (
          <span style={{
            fontSize: 13,
            fontWeight: 600,
            color: delta > 0 ? 'var(--color-pill-text-red)' : 'var(--color-pill-text-green)',
          }}>
            {delta > 0 ? `+${delta}` : delta} vs last month
          </span>
        )}
      </div>

      {Highcharts && (
        <HighchartsReact
          highcharts={Highcharts}
          options={options}
          containerProps={{ style: { width: '100%' } }}
        />
      )}
    </HubCardFrame>
  );
}
