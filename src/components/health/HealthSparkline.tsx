/**
 * HEALTH SPARKLINE
 * Inline SVG trend line from healthHistory.
 * Solid line = actuals, dashed = forecast extension. 30/60/90d window.
 * No chart library — pure SVG.
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Typography } from '@procore/core-react';
import type { HealthSnapshot, HealthScore } from '@/types/health';

// ─── Score → Y value (higher on chart = better) ──────────────────────────────

const SCORE_Y: Record<HealthScore, number> = { green: 10, yellow: 40, red: 70 };
const SCORE_COLOR: Record<HealthScore, string> = {
  green:  'var(--color-pill-border-green)',
  yellow: 'var(--color-pill-border-yellow)',
  red:    'var(--color-pill-border-red)',
};

// ─── Styled components ────────────────────────────────────────────────────────

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
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

const ChartArea = styled.div`
  position: relative;
`;

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
  width = 300,
  height = 80,
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

  const padX = 4;
  const padY = 8;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  // Build polyline points for actuals
  const pts = filtered.map((snap, i) => {
    const x = padX + (i / Math.max(filtered.length - 1, 1)) * chartW;
    const y = padY + (SCORE_Y[snap.score] / 80) * chartH;
    return { x, y, snap };
  });

  const actualPoints = pts.map(p => `${p.x},${p.y}`).join(' ');

  // Forecast extension: one extra point beyond the last actual
  const lastPt = pts[pts.length - 1];
  const forecastY = forecastScore ? padY + (SCORE_Y[forecastScore] / 80) * chartH : null;
  const forecastPoints = forecastY != null ? `${lastPt.x},${lastPt.y} ${width - padX},${forecastY}` : null;

  // Determine line color based on last score
  const lastScore = filtered[filtered.length - 1].score;
  const lineColor = SCORE_COLOR[lastScore];

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

      <ChartArea>
        <svg width={width} height={height} aria-label={`Health trend over last ${window} days`} role="img">
          {/* Grid lines */}
          {[10, 40, 70].map((yVal, i) => (
            <line
              key={i}
              x1={padX} y1={padY + (yVal / 80) * chartH}
              x2={width - padX} y2={padY + (yVal / 80) * chartH}
              stroke="var(--color-border-separator)"
              strokeWidth={0.5}
              strokeDasharray="3,3"
            />
          ))}

          {/* Actual trend line */}
          <polyline
            points={actualPoints}
            fill="none"
            stroke={lineColor}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Forecast extension (dashed) */}
          {forecastPoints && forecastScore && (
            <polyline
              points={forecastPoints}
              fill="none"
              stroke={SCORE_COLOR[forecastScore]}
              strokeWidth={2}
              strokeDasharray="4,3"
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity={0.7}
            />
          )}

          {/* Data points */}
          {pts.map((p, i) => (
            <circle
              key={i}
              cx={p.x} cy={p.y} r={3}
              fill={SCORE_COLOR[p.snap.score]}
              stroke="var(--color-surface-card)"
              strokeWidth={1.5}
            />
          ))}
        </svg>

        {/* Y-axis labels */}
        <div style={{ position: 'absolute', left: 0, top: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height, pointerEvents: 'none' }}>
          <span style={{ fontSize: 9, color: 'var(--color-pill-text-green)', paddingTop: padY - 4 }}>Good</span>
          <span style={{ fontSize: 9, color: 'var(--color-pill-text-yellow)' }}>Risk</span>
          <span style={{ fontSize: 9, color: 'var(--color-pill-text-red)', paddingBottom: padY - 4 }}>Critical</span>
        </div>
      </ChartArea>
    </Wrapper>
  );
}
