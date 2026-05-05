/**
 * HEALTH SUMMARY POPOVER
 * Triggered on HealthScoreBadge hover. Shows composite score + top KPIs + data source.
 * Never navigates away — keeps portfolio context.
 */

import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Typography } from '@procore/core-react';
import { Link as LinkIcon, Connect, Person } from '@procore/core-icons';
import HealthScoreBadge from './HealthScoreBadge';
import KPIStatusChip from './KPIStatusChip';
import type { HealthResult } from '@/types/health';

// ─── Styled components ────────────────────────────────────────────────────────

const PopoverBox = styled.div<{ $top: number; $left: number }>`
  position: fixed;
  top: ${({ $top }) => $top}px;
  left: ${({ $left }) => $left}px;
  width: 280px;
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-default);
  border-radius: 8px;
  box-shadow: 0px 4px 28px 0px var(--color-shadow-strong, rgba(0,0,0,0.18));
  z-index: 1400;
  overflow: hidden;
`;

const PopoverHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 8px;
  border-bottom: 1px solid var(--color-border-separator);
  gap: 8px;
`;

const PopoverBody = styled.div`
  padding: 8px 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const KPILine = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
  gap: 8px;
`;

const ForecastNote = styled.div`
  margin-top: 6px;
  padding: 6px 8px;
  background: var(--color-pill-bg-yellow);
  border: 1px solid var(--color-pill-border-yellow);
  border-radius: 4px;
`;

const PopoverFooter = styled.div`
  padding: 6px 16px 8px;
  border-top: 1px solid var(--color-border-separator);
  display: flex;
  align-items: center;
  gap: 4px;
`;

// ─── Component ────────────────────────────────────────────────────────────────

interface HealthSummaryPopoverProps {
  result: HealthResult;
  projectName: string;
  anchorRect: DOMRect | null;
  onClose: () => void;
}

export default function HealthSummaryPopover({
  result,
  projectName,
  anchorRect,
  onClose,
}: HealthSummaryPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mouseover', handler);
    return () => document.removeEventListener('mouseover', handler);
  }, [onClose]);

  if (!anchorRect) return null;

  // Position below the anchor badge
  const top = anchorRect.bottom + 6;
  const left = Math.min(anchorRect.left, window.innerWidth - 288);

  // Show top 3 worst KPIs
  const sorted = [...result.kpis].sort((a, b) => {
    const order = { red: 0, yellow: 1, green: 2, unavailable: 3 };
    return order[a.status] - order[b.status];
  });
  const topKPIs = sorted.slice(0, 3);
  const showForecastWarning = result.forecastScore !== result.compositeScore;

  // Connected source label
  const connectedKPIs = result.kpis.filter(k => k.dataSource === 'connected');
  const sourceLabel = connectedKPIs.length > 0 ? connectedKPIs[0].sourceLabel : 'Own data';

  return (
    <PopoverBox
      ref={popoverRef}
      $top={top}
      $left={left}
      role="dialog"
      aria-label={`Health summary for ${projectName}`}
    >
      <PopoverHeader>
        <Typography intent="body" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {projectName}
        </Typography>
        <HealthScoreBadge
          score={result.compositeScore}
          forecastScore={result.forecastScore}
          trend={result.trend}
        />
      </PopoverHeader>

      <PopoverBody>
        {topKPIs.map(kpi => (
          <KPILine key={kpi.key}>
            <Typography intent="small" style={{ color: 'var(--color-text-secondary)', flex: 1 }}>
              {kpi.label}
            </Typography>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Typography intent="small" style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
                {kpi.displayValue}
              </Typography>
              <KPIStatusChip status={kpi.status} />
            </div>
          </KPILine>
        ))}

        {showForecastWarning && (
          <ForecastNote>
            <Typography intent="small" style={{ color: 'var(--color-pill-text-yellow)', fontWeight: 600 }}>
              Forecast: {result.forecastScore === 'red' ? 'Critical' : 'At Risk'} — {result.risks.filter(r => r.status !== 'closed' && r.status !== 'mitigated' && r.probability >= 4).length} open high-probability risks
            </Typography>
          </ForecastNote>
        )}
      </PopoverBody>

      <PopoverFooter>
        <LinkIcon size="sm" style={{ color: 'var(--color-text-secondary)' }} />
        <Typography intent="small" style={{ color: 'var(--color-text-secondary)', flex: 1 }}>
          {sourceLabel}
        </Typography>
        {result.integrity.signalOrigin === 'automated' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Connect size="sm" style={{ color: 'var(--color-text-secondary)' }} />
            <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>Automated</Typography>
          </div>
        )}
        {result.integrity.signalOrigin === 'manual' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Person size="sm" style={{ color: 'var(--color-text-secondary)' }} />
            <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>Manual</Typography>
          </div>
        )}
        {result.integrity.signalOrigin === 'mixed' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Person size="sm" style={{ color: 'var(--color-text-secondary)' }} />
            <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>Manual + Auto</Typography>
          </div>
        )}
      </PopoverFooter>
    </PopoverBox>
  );
}
