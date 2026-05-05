/**
 * RISK EXPOSURE BAR
 * Horizontal stacked bar showing open risk count by severity (Red / Yellow / Green).
 * Pulled from Risk[] seed data. Sits alongside health signals to show forward-looking exposure.
 */

import React from 'react';
import styled from 'styled-components';
import { Typography } from '@procore/core-react';
import type { Risk } from '@/types/health';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function riskScore(r: Risk): number {
  return r.probability * Math.max(r.impactCost, r.impactSchedule, r.impactSafety);
}

function riskTier(r: Risk): 'red' | 'yellow' | 'green' {
  const s = riskScore(r);
  if (s >= 16) return 'red';
  if (s >= 9)  return 'yellow';
  return 'green';
}

// ─── Styled components ────────────────────────────────────────────────────────

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const BarTrack = styled.div`
  display: flex;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  background: var(--color-surface-secondary);
  gap: 2px;
`;

const BarSegment = styled.div<{ $color: string; $flex: number }>`
  flex: ${({ $flex }) => $flex};
  background: ${({ $color }) => $color};
  border-radius: 4px;
  min-width: ${({ $flex }) => ($flex > 0 ? 4 : 0)}px;
`;

const Legend = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Dot = styled.span<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`;

// ─── Component ────────────────────────────────────────────────────────────────

const TIER_COLORS = {
  red:    'var(--color-pill-bg-red)',
  yellow: 'var(--color-pill-bg-yellow)',
  green:  'var(--color-pill-bg-green)',
};

const TIER_BORDER_COLORS = {
  red:    'var(--color-pill-border-red)',
  yellow: 'var(--color-pill-border-yellow)',
  green:  'var(--color-pill-border-green)',
};

interface RiskExposureBarProps {
  risks: Risk[];
  className?: string;
}

export default function RiskExposureBar({ risks, className }: RiskExposureBarProps) {
  const open = risks.filter(r => r.status !== 'closed' && r.status !== 'mitigated');
  const redCount    = open.filter(r => riskTier(r) === 'red').length;
  const yellowCount = open.filter(r => riskTier(r) === 'yellow').length;
  const greenCount  = open.filter(r => riskTier(r) === 'green').length;
  const total = open.length;

  if (total === 0) {
    return (
      <Wrapper className={className}>
        <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
          No open risks
        </Typography>
      </Wrapper>
    );
  }

  return (
    <Wrapper className={className}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography intent="small" style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
          Open Risk Exposure
        </Typography>
        <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
          {total} open
        </Typography>
      </div>
      <BarTrack aria-label={`Risk exposure: ${redCount} critical, ${yellowCount} high, ${greenCount} low`}>
        {redCount > 0    && <BarSegment $color={TIER_BORDER_COLORS.red}    $flex={redCount} />}
        {yellowCount > 0 && <BarSegment $color={TIER_BORDER_COLORS.yellow} $flex={yellowCount} />}
        {greenCount > 0  && <BarSegment $color={TIER_BORDER_COLORS.green}  $flex={greenCount} />}
      </BarTrack>
      <Legend>
        {redCount > 0 && (
          <LegendItem>
            <Dot $color={TIER_BORDER_COLORS.red} />
            <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
              {redCount} Critical
            </Typography>
          </LegendItem>
        )}
        {yellowCount > 0 && (
          <LegendItem>
            <Dot $color={TIER_BORDER_COLORS.yellow} />
            <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
              {yellowCount} High
            </Typography>
          </LegendItem>
        )}
        {greenCount > 0 && (
          <LegendItem>
            <Dot $color={TIER_BORDER_COLORS.green} />
            <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
              {greenCount} Low
            </Typography>
          </LegendItem>
        )}
      </Legend>
    </Wrapper>
  );
}
