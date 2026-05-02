/**
 * DUAL STATUS BADGE (v7)
 * 56×24px split pill showing current | forecast health status.
 * Left half = current score, right half = forecast score.
 * Visual encoding: circle (stable), diamond (degrading/improving), dashed (first-run).
 */

import React from 'react';
import styled from 'styled-components';
import { Tooltip } from '@procore/core-react';
import type { HealthScore } from '@/types/health';

// ─── Token maps ───────────────────────────────────────────────────────────────

const SCORE_STYLES: Record<HealthScore, { bg: string; border: string; text: string; label: string }> = {
  green:  { bg: 'var(--color-pill-bg-green)',  border: 'var(--color-pill-border-green)',  text: 'var(--color-pill-text-green)',  label: 'Healthy' },
  yellow: { bg: 'var(--color-pill-bg-yellow)', border: 'var(--color-pill-border-yellow)', text: 'var(--color-pill-text-yellow)', label: 'At Risk' },
  red:    { bg: 'var(--color-pill-bg-red)',     border: 'var(--color-pill-border-red)',     text: 'var(--color-pill-text-red)',     label: 'Critical' },
};

const SCORE_ABBR: Record<HealthScore, string> = {
  green:  '●',
  yellow: '◆',
  red:    '■',
};

// ─── Styled components ────────────────────────────────────────────────────────

const PillWrapper = styled.div<{ $interactive: boolean; $firstRun?: boolean }>`
  display: inline-flex;
  align-items: stretch;
  height: 24px;
  min-width: 56px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--color-border-default);
  cursor: ${({ $interactive }) => ($interactive ? 'pointer' : 'default')};
  outline: ${({ $firstRun }) => ($firstRun ? '1px dashed var(--color-border-default)' : 'none')};
  outline-offset: ${({ $firstRun }) => ($firstRun ? '2px' : '0')};
  &:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }
`;

const Half = styled.div<{ $score: HealthScore; $side: 'left' | 'right' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 0 7px;
  background: ${({ $score }) => SCORE_STYLES[$score].bg};
  color: ${({ $score }) => SCORE_STYLES[$score].text};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1px;
  border-right: ${({ $side }) => ($side === 'left' ? '1px solid var(--color-border-default)' : 'none')};
`;

const Divider = styled.div`
  width: 1px;
  background: var(--color-border-default);
  flex-shrink: 0;
`;

const FirstRunOverlay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 24px;
  background: var(--color-surface-card);
  border: 1px dashed var(--color-border-muted);
  border-radius: 12px;
  font-size: 10px;
  color: var(--color-text-secondary);
  letter-spacing: 0.5px;
`;

// ─── Component ────────────────────────────────────────────────────────────────

interface DualStatusBadgeProps {
  currentScore: HealthScore;
  forecastScore: HealthScore;
  firstRun?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function DualStatusBadge({
  currentScore,
  forecastScore,
  firstRun = false,
  onClick,
  className,
}: DualStatusBadgeProps) {
  const currentLabel = SCORE_STYLES[currentScore].label;
  const forecastLabel = SCORE_STYLES[forecastScore].label;
  const ariaLabel = `Current health: ${currentLabel}. Forecast: ${forecastLabel}.`;

  if (firstRun) {
    return (
      <Tooltip overlay="Health tracking begins today" placement="top">
        <FirstRunOverlay aria-label="First run — tracking begins today" className={className}>
          —·—
        </FirstRunOverlay>
      </Tooltip>
    );
  }

  const body = (
    <PillWrapper
      as={onClick ? 'button' : 'div'}
      $interactive={!!onClick}
      onClick={onClick}
      aria-label={ariaLabel}
      className={className}
      {...(onClick ? { type: 'button' as const } : {})}
    >
      <Half $score={currentScore} $side="left" aria-hidden="true">
        {SCORE_ABBR[currentScore]}
      </Half>
      <Divider />
      <Half $score={forecastScore} $side="right" aria-hidden="true">
        {SCORE_ABBR[forecastScore]}
      </Half>
    </PillWrapper>
  );

  if (currentScore === forecastScore) return body;

  return (
    <Tooltip
      overlay={`Now: ${currentLabel} · Forecast: ${forecastLabel}`}
      placement="top"
    >
      {body}
    </Tooltip>
  );
}
