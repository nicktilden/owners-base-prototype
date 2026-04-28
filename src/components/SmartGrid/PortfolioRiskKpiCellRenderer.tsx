/**
 * Cell renderer for a single KPI column in the Portfolio Risk table.
 * Shows status pill (Healthy / At Risk / Critical / —) with the display value as a tooltip.
 */

import React from 'react';
import { Pill } from '@procore/core-react';
import type { ICellRendererParams } from 'ag-grid-community';
import type { KPIStatus } from '@/types/health';

export interface KpiCellValue {
  status: KPIStatus;
  displayValue: string;
}

const PILL_COLOR: Record<KPIStatus, 'green' | 'yellow' | 'red' | 'gray'> = {
  green:       'green',
  yellow:      'yellow',
  red:         'red',
  unavailable: 'gray',
};

const PILL_LABEL: Record<KPIStatus, string> = {
  green:       'OK',
  yellow:      'Risk',
  red:         'Crit',
  unavailable: '—',
};

export default function PortfolioRiskKpiCellRenderer(
  params: ICellRendererParams<unknown, KpiCellValue>
) {
  const val = params.value;
  if (!val) return null;

  return (
    <span title={val.displayValue || undefined}>
      <Pill color={PILL_COLOR[val.status]}>{PILL_LABEL[val.status]}</Pill>
    </span>
  );
}
