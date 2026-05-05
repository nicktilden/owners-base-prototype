/**
 * KPI STATUS CHIP
 * Compact inline chip for a single KPI status. Used in grid cells and KPI rows.
 */

import React from 'react';
import styled from 'styled-components';
import type { KPIStatus } from '@/types/health';

const CHIP_STYLES: Record<KPIStatus, { bg: string; border: string; text: string; label: string }> = {
  green:       { bg: 'var(--color-pill-bg-green)',  border: 'var(--color-pill-border-green)',  text: 'var(--color-pill-text-green)',  label: 'Good' },
  yellow:      { bg: 'var(--color-pill-bg-yellow)', border: 'var(--color-pill-border-yellow)', text: 'var(--color-pill-text-yellow)', label: 'At Risk' },
  red:         { bg: 'var(--color-pill-bg-red)',     border: 'var(--color-pill-border-red)',     text: 'var(--color-pill-text-red)',     label: 'Critical' },
  unavailable: { bg: 'var(--color-pill-bg-gray)',   border: 'var(--color-pill-border-gray)',   text: 'var(--color-pill-text-gray)',   label: 'N/A' },
};

const Chip = styled.span<{ $status: KPIStatus }>`
  display: inline-flex;
  align-items: center;
  border-radius: 10px;
  border: 1px solid ${({ $status }) => CHIP_STYLES[$status].border};
  background: ${({ $status }) => CHIP_STYLES[$status].bg};
  color: ${({ $status }) => CHIP_STYLES[$status].text};
  padding: 1px 6px;
  font-size: 11px;
  font-weight: 600;
  line-height: 16px;
  letter-spacing: 0.25px;
  white-space: nowrap;
`;

interface KPIStatusChipProps {
  status: KPIStatus;
  label?: string;
  className?: string;
}

export default function KPIStatusChip({ status, label, className }: KPIStatusChipProps) {
  return (
    <Chip $status={status} className={className} aria-label={`Status: ${CHIP_STYLES[status].label}`}>
      {label ?? CHIP_STYLES[status].label}
    </Chip>
  );
}
