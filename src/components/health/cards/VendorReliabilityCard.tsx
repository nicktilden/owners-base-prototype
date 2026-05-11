/**
 * VENDOR RELIABILITY CARD — Use Case #2 Supply Chain
 * Submittal on-time performance ranked by vendor/contractor.
 */

import React, { useMemo } from 'react';
import { Pill, Typography } from '@procore/core-react';
import { ArrowDown, ArrowUp } from '@procore/core-icons';
import styled from 'styled-components';
import HubCardFrame, { HubCardEmptyState } from '@/components/hubs/HubCardFrame';
import { useData } from '@/context/DataContext';
import { getVendorPerformance } from '@/utils/healthRiskEngine';

const VendorRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 8px;
  padding: 9px 0;
  border-bottom: 1px solid var(--color-border-separator);
  &:last-child { border-bottom: none; }
`;

const ProgressBar = styled.div<{ $pct: number; $color: string }>`
  height: 4px;
  border-radius: 2px;
  background: var(--color-border-separator);
  margin-top: 4px;
  overflow: hidden;
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${({ $pct }) => $pct}%;
    background: ${({ $color }) => $color};
    border-radius: 2px;
  }
`;

interface Props {
  scope?: 'portfolio' | 'project';
  projectId?: string;
}

export default function VendorReliabilityCard({ scope = 'portfolio', projectId }: Props) {
  const { data } = useData();

  const vendors = useMemo(() => {
    const submittals = (data.submittals ?? []).filter((s: any) =>
      scope === 'project' && projectId ? s.projectId === projectId : true
    );
    return getVendorPerformance(submittals).slice(0, 7);
  }, [data.submittals, scope, projectId]);

  const atRiskCount = vendors.filter(v => v.onTimePercentage < 80).length;

  return (
    <HubCardFrame
      title="Vendor Reliability"
      infoTooltip="Submittal on-time performance by responsible contractor. Sorted by worst performers first."
      titleSuffix={atRiskCount > 0 ? <Pill color="red">{atRiskCount} at risk</Pill> : undefined}
    >
      {vendors.length === 0 ? (
        <HubCardEmptyState title="No Vendor Data" body="No submittal data available to assess vendor reliability." />
      ) : (
        vendors.map(vendor => {
          const barColor =
            vendor.onTimePercentage >= 90 ? 'var(--color-pill-border-green)' :
            vendor.onTimePercentage >= 75 ? 'var(--color-pill-border-yellow)' :
            'var(--color-pill-border-red)';

          const pillColor =
            vendor.onTimePercentage >= 90 ? 'green' as const :
            vendor.onTimePercentage >= 75 ? 'yellow' as const :
            'red' as const;

          return (
            <VendorRow key={vendor.vendorId}>
              <div style={{ minWidth: 0 }}>
                <Typography intent="small" style={{ fontWeight: 600, color: 'var(--color-text-primary)', display: 'block' }}>
                  {vendor.vendorName.length > 38 ? vendor.vendorName.slice(0, 38) + '…' : vendor.vendorName}
                </Typography>
                <ProgressBar $pct={vendor.onTimePercentage} $color={barColor} />
                <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
                  {vendor.activeSubmittalCount} submittals · {vendor.lateSubmittalCount} late
                </Typography>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {vendor.trendDirection === 'degrading'
                  ? <ArrowDown size="sm" style={{ color: 'var(--color-pill-text-red)' }} />
                  : vendor.trendDirection === 'improving'
                  ? <ArrowUp size="sm" style={{ color: 'var(--color-pill-text-green)' }} />
                  : null}
              </div>
              <Pill color={pillColor}>{vendor.onTimePercentage}%</Pill>
            </VendorRow>
          );
        })
      )}
    </HubCardFrame>
  );
}
