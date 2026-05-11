/**
 * NEAR MISS TREND CARD — Use Case #6 Operations/Safety
 * Monthly near-miss count sparkline over 12 months with trend indicator.
 */

import React, { useMemo } from 'react';
import { Pill, Typography } from '@procore/core-react';
import { ArrowDown, ArrowUp } from '@procore/core-icons';
import styled from 'styled-components';
import HubCardFrame, { HubCardEmptyState } from '@/components/hubs/HubCardFrame';
import { useData } from '@/context/DataContext';
import { getNearMissTrend } from '@/utils/healthRiskEngine';

const ChartArea = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 80px;
  padding: 8px 0;
`;

const Bar = styled.div<{ $height: number; $worsening: boolean }>`
  flex: 1;
  border-radius: 3px 3px 0 0;
  height: ${({ $height }) => $height}%;
  min-height: 4px;
  background: ${({ $worsening }) => $worsening ? 'var(--color-pill-border-red)' : 'var(--color-pill-border-yellow)'};
  opacity: 0.75;
  transition: opacity 0.1s;
  &:hover { opacity: 1; }
`;

const MonthLabels = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
`;

const MonthLabel = styled.div`
  flex: 1;
  text-align: center;
  font-size: 9px;
  color: var(--color-text-secondary);
  overflow: hidden;
  white-space: nowrap;
`;

const StatRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-top: 1px solid var(--color-border-separator);
`;

interface Props {
  scope?: 'portfolio' | 'project';
  projectId?: string;
}

export default function NearMissTrendCard({ scope = 'portfolio', projectId }: Props) {
  const { data } = useData();

  const trendData = useMemo(() => {
    const incidents = data.incidents ?? [];
    return getNearMissTrend(incidents, scope === 'project' ? projectId : undefined);
  }, [data.incidents, scope, projectId]);

  const maxVal = Math.max(...trendData.points.map(p => p.value), 1);
  const totalYTD = trendData.points.slice(-12).reduce((s, p) => s + p.value, 0);
  const recentMonthCount = trendData.points[trendData.points.length - 1]?.value ?? 0;
  const worsening = trendData.trend === 'worsening';

  if (totalYTD === 0) {
    return (
      <HubCardFrame title="Near-Miss Trend" infoTooltip="Monthly near-miss incident count over the trailing 12 months.">
        <HubCardEmptyState title="No Near-Miss Incidents" body="No near-miss incidents recorded in the past 12 months." />
      </HubCardFrame>
    );
  }

  return (
    <HubCardFrame
      title="Near-Miss Trend"
      infoTooltip="Monthly near-miss incident count. Trend compares recent 3-month average to first 3 months of the period."
      titleSuffix={
        <Pill color={worsening ? 'red' : trendData.trend === 'stable' ? 'yellow' : 'green'}>
          {trendData.trend}
        </Pill>
      }
    >
      <ChartArea>
        {trendData.points.map((pt, i) => (
          <Bar
            key={i}
            $height={maxVal > 0 ? (pt.value / maxVal) * 100 : 0}
            $worsening={worsening}
            title={`${pt.label}: ${pt.value}`}
          />
        ))}
      </ChartArea>
      <MonthLabels>
        {trendData.points.map((pt, i) => (
          <MonthLabel key={i}>{pt.label.slice(0, 3)}</MonthLabel>
        ))}
      </MonthLabels>

      <StatRow>
        <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>YTD Total</Typography>
        <Typography intent="small" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{totalYTD}</Typography>
      </StatRow>
      <StatRow>
        <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>Current Month</Typography>
        <Typography intent="small" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{recentMonthCount}</Typography>
      </StatRow>
      <StatRow>
        <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>Trend</Typography>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {worsening
            ? <ArrowDown size="sm" style={{ color: 'var(--color-pill-text-red)' }} />
            : trendData.trend === 'improving'
            ? <ArrowUp size="sm" style={{ color: 'var(--color-pill-text-green)' }} />
            : null}
          <Typography intent="small" style={{ fontWeight: 600, color: worsening ? 'var(--color-pill-text-red)' : trendData.trend === 'improving' ? 'var(--color-pill-text-green)' : 'var(--color-text-primary)' }}>
            {trendData.trend.charAt(0).toUpperCase() + trendData.trend.slice(1)}
          </Typography>
        </div>
      </StatRow>
    </HubCardFrame>
  );
}
