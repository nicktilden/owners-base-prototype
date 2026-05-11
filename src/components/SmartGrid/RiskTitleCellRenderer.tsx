import React from 'react';
import type { ICellRendererParams } from 'ag-grid-community';
import type { RiskGridRow, RiskGridContext } from './riskColumnDefs';

export default function RiskTitleCellRenderer(
  params: ICellRendererParams<RiskGridRow, string, RiskGridContext>
) {
  const { value, data, context } = params;
  if (!data) return null;

  return (
    <button
      onClick={() => context?.onOpenRisk?.(data.id)}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        color: 'var(--color-text-link)',
        fontWeight: 600,
        fontSize: 'inherit',
        textAlign: 'left',
        textDecoration: 'underline',
        maxWidth: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        display: 'block',
      }}
      title={value ?? ''}
    >
      {value}
    </button>
  );
}
