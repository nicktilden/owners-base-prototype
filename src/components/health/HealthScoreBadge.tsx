/**
 * HEALTH SCORE BADGE
 * The primary health status chip. Always interactive — hover opens popover, click opens tearsheet.
 * Shows a forecast indicator arrow when current score ≠ forecast score.
 */

import React from 'react';
import styled from 'styled-components';
import { ArrowRight, ArrowDown, ArrowUp } from '@procore/core-icons';
import type { HealthScore, HealthTrend } from '@/types/health';

// ─── Token maps ───────────────────────────────────────────────────────────────

const SCORE_STYLES: Record<HealthScore, { bg: string; border: string; text: string; label: string }> = {
  green:  { bg: 'var(--color-pill-bg-green)',  border: 'var(--color-pill-border-green)',  text: 'var(--color-pill-text-green)',  label: 'Healthy' },
  yellow: { bg: 'var(--color-pill-bg-yellow)', border: 'var(--color-pill-border-yellow)', text: 'var(--color-pill-text-yellow)', label: 'At Risk' },
  red:    { bg: 'var(--color-pill-bg-red)',     border: 'var(--color-pill-border-red)',     text: 'var(--color-pill-text-red)',     label: 'Critical' },
};

// ─── Styled components ────────────────────────────────────────────────────────

const Badge = styled.div<{ $score: HealthScore; $interactive: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 10px;
  border: 1px solid ${({ $score }) => SCORE_STYLES[$score].border};
  background: ${({ $score }) => SCORE_STYLES[$score].bg};
  color: ${({ $score }) => SCORE_STYLES[$score].text};
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
  letter-spacing: 0.15px;
  white-space: nowrap;
  cursor: ${({ $interactive }) => ($interactive ? 'pointer' : 'default')};
  transition: opacity 0.12s;
  &:hover { opacity: ${({ $interactive }) => ($interactive ? 0.8 : 1)}; }
  &:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }
`;

const ForecastArrow = styled.span<{ $score: HealthScore }>`
  display: inline-flex;
  align-items: center;
  color: ${({ $score }) => SCORE_STYLES[$score].text};
  opacity: 0.7;
`;

const TrendIcon = styled.span`
  display: inline-flex;
  align-items: center;
  opacity: 0.7;
`;

// ─── Component ────────────────────────────────────────────────────────────────

interface HealthScoreBadgeProps {
  score: HealthScore;
  forecastScore?: HealthScore;
  trend?: HealthTrend;
  /** Show trend arrow alongside the badge */
  showTrend?: boolean;
  onClick?: () => void;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseLeave?: () => void;
  className?: string;
  'aria-label'?: string;
}

export default function HealthScoreBadge({
  score,
  forecastScore,
  trend,
  showTrend = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  className,
  'aria-label': ariaLabel,
}: HealthScoreBadgeProps) {
  const showForecast = forecastScore && forecastScore !== score;
  const label = SCORE_STYLES[score].label;
  const forecastLabel = forecastScore ? SCORE_STYLES[forecastScore].label : undefined;

  const defaultAriaLabel = ariaLabel ??
    `Health: ${label}${showForecast ? ` · Forecast: ${forecastLabel}` : ''}${trend ? ` · Trend: ${trend}` : ''}`;

  const interactive = !!(onClick || onMouseEnter);

  return (
    <Badge
      as={interactive ? 'button' : 'div'}
      $score={score}
      $interactive={interactive}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={className}
      aria-label={defaultAriaLabel}
      {...(interactive ? { type: 'button' } : {})}
    >
      {label}
      {showForecast && forecastScore && (
        <ForecastArrow $score={forecastScore} aria-hidden="true">
          <ArrowRight size="sm" />
        </ForecastArrow>
      )}
      {showTrend && trend && (
        <TrendIcon aria-hidden="true">
          {trend === 'improving' && <ArrowUp size="sm" />}
          {trend === 'degrading' && <ArrowDown size="sm" />}
        </TrendIcon>
      )}
    </Badge>
  );
}
