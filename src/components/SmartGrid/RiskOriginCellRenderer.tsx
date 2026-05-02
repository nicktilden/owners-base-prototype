import React from 'react';
import type { ICellRendererParams } from 'ag-grid-community';
import type { RiskGridRow } from './riskColumnDefs';

const ORIGIN_CONFIG: Record<string, { label: string; color: string }> = {
  manual:           { label: 'Manual',    color: 'var(--color-text-secondary)' },
  automated:        { label: 'Automated', color: 'var(--color-blue-500, #0069be)' },
  connected_partner:{ label: 'Connected', color: 'var(--color-green-500, #2e7d32)' },
};

export default function RiskOriginCellRenderer(
  params: ICellRendererParams<RiskGridRow, string>
) {
  const value = params.value as string;
  const cfg = ORIGIN_CONFIG[value] ?? { label: value, color: 'var(--color-text-secondary)' };
  return (
    <span style={{ fontSize: 12, fontWeight: 500, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}
