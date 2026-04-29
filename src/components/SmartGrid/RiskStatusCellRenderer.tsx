import React from 'react';
import { Pill } from '@procore/core-react';
import type { ICellRendererParams } from 'ag-grid-community';
import type { RiskGridRow } from './riskColumnDefs';

const STATUS_CONFIG: Record<string, { label: string; color: React.ComponentProps<typeof Pill>['color'] }> = {
  identified: { label: 'Identified', color: 'gray' },
  assessed:   { label: 'Assessed',   color: 'yellow' },
  mitigated:  { label: 'Mitigated',  color: 'green' },
  closed:     { label: 'Closed',     color: 'gray' },
};

export default function RiskStatusCellRenderer(
  params: ICellRendererParams<RiskGridRow, string>
) {
  const value = params.value as string;
  const cfg = STATUS_CONFIG[value];
  if (!cfg) return <span>{value}</span>;
  return <Pill color={cfg.color}>{cfg.label}</Pill>;
}
