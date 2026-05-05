/**
 * HEALTH SPARKLINE
 * Highcharts area chart showing health trend over 30/60/90d window.
 * Series 1 (solid area): actuals from healthHistory.
 * Series 2 (dashed line): single-point forecast extension.
 */

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Typography } from '@procore/core-react';
import type { Options, SeriesAreaOptions, SeriesLineOptions } from 'highcharts';
import { HC_COLORS } from '@/lib/highcharts';
import SegmentedControl from '@/components/SegmentedControl';
import type { HealthSnapshot, HealthScore } from '@/types/health';

// ─── SSR-safe import ──────────────────────────────────────────────────────────

const HighchartsReact = dynamic(
  () => import('highcharts-react-official'),
  { ssr: false }
);

let Highcharts: typeof import('highcharts') | null = null;
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Highcharts = require('@/lib/highcharts').default as typeof import('highcharts');
}

// ─── Score mapping ────────────────────────────────────────────────────────────

const SCORE_Y: Record<HealthScore, number> = { green: 3, yellow: 2, red: 1 };

const SCORE_COLOR: Record<HealthScore, string> = {
  green:  HC_COLORS.green,
  yellow: HC_COLORS.yellow,
  red:    HC_COLORS.red,
};

const SCORE_LABEL: Record<HealthScore, string> = {
  green: 'Healthy',
  yellow: 'At Risk',
  red: 'Critical',
};

// ─── Chart options ────────────────────────────────────────────────────────────

function buildSparklineOptions(
  snapshots: HealthSnapshot[],
  forecastScore: HealthScore | undefined,
  height: number,
): Options {
  const lastScore = snapshots[snapshots.length - 1]?.score ?? 'green';
  const lineColor = SCORE_COLOR[lastScore];

  const actualData = snapshots.map((s, i) => ({ x: i, y: SCORE_Y[s.score] }));

  const forecastData: { x: number; y: number }[] = forecastScore
    ? [
        { x: snapshots.length - 1, y: SCORE_Y[lastScore] },
        { x: snapshots.length,     y: SCORE_Y[forecastScore] },
      ]
    : [];

  const series: (SeriesAreaOptions | SeriesLineOptions)[] = [
    {
      type: 'area',
      name: 'Health',
      data: actualData,
      color: lineColor,
      lineWidth: 2.5,
      marker: {
        enabled: true,
        radius: 4,
        symbol: 'circle',
        fillColor: lineColor,
        lineColor: '#fff',
        lineWidth: 2,
      },
      fillColor: {
        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
        stops: [
          [0, lineColor + '28'],
          [1, lineColor + '00'],
        ],
      },
      zIndex: 2,
    },
  ];

  if (forecastData.length > 0 && forecastScore) {
    series.push({
      type: 'line',
      name: 'Forecast',
      data: forecastData,
      color: SCORE_COLOR[forecastScore],
      lineWidth: 2,
      dashStyle: 'Dash',
      opacity: 0.7,
      marker: { enabled: false },
      zIndex: 1,
    } as SeriesLineOptions);
  }

  return {
    chart: {
      type: 'area',
      height,
      margin: [12, 8, 28, 40],
      animation: false,
    },
    xAxis: {
      visible: false,
      min: 0,
      max: snapshots.length + (forecastScore ? 1 : 0),
    },
    yAxis: {
      min: 0.5,
      max: 3.5,
      tickPositions: [1, 2, 3],
      gridLineColor: HC_COLORS.gridLine,
      gridLineWidth: 1,
      lineWidth: 0,
      tickWidth: 0,
      title: { text: undefined },
      labels: {
        style: { fontSize: '11px', color: HC_COLORS.textLight },
        formatter() {
          const map: Record<number, string> = { 3: 'Good', 2: 'Risk', 1: 'Crit' };
          return map[this.value as number] ?? '';
        },
      },
    },
    tooltip: {
      formatter() {
        const labels: Record<number, string> = { 3: 'Healthy', 2: 'At Risk', 1: 'Critical' };
        const name = this.series.name === 'Forecast' ? ' (forecast)' : '';
        return `<b>${labels[this.y as number] ?? ''}${name}</b>`;
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

interface HealthSparklineProps {
  history: HealthSnapshot[];
  forecastScore?: HealthScore;
  className?: string;
  width?: number;
  height?: number;
}

type Window = 30 | 60 | 90;

export default function HealthSparkline({
  history,
  forecastScore,
  className,
  height = 180,
}: HealthSparklineProps) {
  const [window, setWindow] = useState<Window>(90);

  const filtered = history.slice(-window);
  const lastScore = filtered[filtered.length - 1]?.score;
  const prevScore = filtered[filtered.length - 2]?.score;

  const options = useMemo(
    () => buildSparklineOptions(filtered, forecastScore, height),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtered.length, forecastScore, height, window]
  );

  if (filtered.length === 0) {
    return (
      <div className={className}>
        <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
          No history available
        </Typography>
      </div>
    );
  }

  const controls = (
    <SegmentedControl>
      {([30, 60, 90] as Window[]).map(w => (
        <SegmentedControl.Segment
          key={w}
          label={`${w}d`}
          selected={window === w}
          onClick={() => setWindow(w)}
        />
      ))}
    </SegmentedControl>
  );

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography intent="small" style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
          Trend (last {window} days)
        </Typography>
        {controls}
      </div>

      {/* Summary stat */}
      {lastScore && (
        <div style={{ display: 'flex', gap: 16, alignItems: 'baseline' }}>
          <span style={{ fontSize: 28, fontWeight: 600, color: SCORE_COLOR[lastScore], letterSpacing: '-0.5px' }}>
            {SCORE_LABEL[lastScore]}
          </span>
          {prevScore && prevScore !== lastScore && (
            <span style={{
              fontSize: 13,
              fontWeight: 600,
              color: lastScore === 'green' ? 'var(--color-pill-text-green)'
                : lastScore === 'red' ? 'var(--color-pill-text-red)'
                : 'var(--color-pill-text-yellow)',
            }}>
              {lastScore === 'green' ? 'Improved' : lastScore === 'red' ? 'Degraded' : 'Changed'} from {SCORE_LABEL[prevScore]}
            </span>
          )}
        </div>
      )}

      {Highcharts && (
        <HighchartsReact
          highcharts={Highcharts}
          options={options}
          containerProps={{ style: { width: '100%' } }}
        />
      )}
    </div>
  );
}
