/**
 * HEALTH SPARKLINE
 * Highcharts line chart showing health trend over 30/60/90d window.
 * Series 1 (solid): actuals from healthHistory.
 * Series 2 (dashed): single-point forecast extension.
 */

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import styled from 'styled-components';
import { Typography } from '@procore/core-react';
import type { Options, SeriesLineOptions } from 'highcharts';
import { HC_COLORS } from '@/lib/highcharts';
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

// ─── Styled ───────────────────────────────────────────────────────────────────

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Controls = styled.div`
  display: flex;
  gap: 4px;
`;

const WindowBtn = styled.button<{ $active: boolean }>`
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid ${({ $active }) => $active ? 'var(--color-action-primary)' : 'var(--color-border-default)'};
  background: ${({ $active }) => $active ? 'var(--color-action-primary)' : 'transparent'};
  color: ${({ $active }) => $active ? '#fff' : 'var(--color-text-secondary)'};
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
`;

// ─── Chart options ────────────────────────────────────────────────────────────

function buildSparklineOptions(
  snapshots: HealthSnapshot[],
  forecastScore: HealthScore | undefined,
  height: number,
): Options {
  const lastScore = snapshots[snapshots.length - 1]?.score ?? 'green';
  const lineColor = SCORE_COLOR[lastScore];

  // Actual data points: [index, y-value]
  const actualData = snapshots.map((s, i) => ({ x: i, y: SCORE_Y[s.score] }));

  // Forecast: repeat last actual point then extend one step
  const forecastData: { x: number; y: number }[] = forecastScore
    ? [
        { x: snapshots.length - 1, y: SCORE_Y[lastScore] },
        { x: snapshots.length,     y: SCORE_Y[forecastScore] },
      ]
    : [];

  const series: SeriesLineOptions[] = [
    {
      type: 'line',
      name: 'Health',
      data: actualData,
      color: lineColor,
      lineWidth: 2,
      marker: {
        enabled: true,
        radius: 3,
        symbol: 'circle',
        fillColor: lineColor,
        lineColor: '#fff',
        lineWidth: 1.5,
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
    });
  }

  return {
    chart: {
      type: 'line',
      height,
      margin: [8, 8, 24, 36],
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
      labels: {
        style: { fontSize: '9px', color: HC_COLORS.textLight },
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
  height = 100,
}: HealthSparklineProps) {
  const [window, setWindow] = useState<Window>(90);

  const filtered = history.slice(-window);

  if (filtered.length === 0) {
    return (
      <Wrapper className={className}>
        <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
          No history available
        </Typography>
      </Wrapper>
    );
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const options = useMemo(
    () => buildSparklineOptions(filtered, forecastScore, height),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtered.length, forecastScore, height, window]
  );

  return (
    <Wrapper className={className}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography intent="small" style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
          Trend (last {window} days)
        </Typography>
        <Controls>
          {([30, 60, 90] as Window[]).map(w => (
            <WindowBtn key={w} $active={window === w} onClick={() => setWindow(w)} aria-pressed={window === w}>
              {w}d
            </WindowBtn>
          ))}
        </Controls>
      </div>

      {Highcharts && (
        <HighchartsReact
          highcharts={Highcharts}
          options={options}
          containerProps={{ style: { width: '100%' } }}
        />
      )}
    </Wrapper>
  );
}
