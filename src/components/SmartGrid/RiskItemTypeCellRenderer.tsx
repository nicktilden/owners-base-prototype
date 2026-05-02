import React from 'react';
import type { ICellRendererParams } from 'ag-grid-community';
import type { RiskGridRow } from './riskColumnDefs';

const TYPE_COLORS: Record<string, string> = {
  'Change Event':   'var(--color-blue-500, #0069be)',
  'RFI':            'var(--color-orange-500, #e87722)',
  'Punch List':     'var(--color-red-500, #c62828)',
  'Submittal':      'var(--color-purple-500, #6a1b9a)',
  'Correspondence': 'var(--color-teal-500, #00695c)',
  'Milestone':      'var(--color-indigo-500, #283593)',
  'Budget Line':    'var(--color-green-500, #2e7d32)',
  'Manual':         'var(--color-gray-500, #546e7a)',
};

export default function RiskItemTypeCellRenderer(
  params: ICellRendererParams<RiskGridRow, string>
) {
  const value = params.value as string;
  if (!value) return null;
  const color = TYPE_COLORS[value] ?? 'var(--color-text-secondary)';
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 12,
      fontWeight: 600,
      color,
    }}>
      <span style={{
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: color,
        flexShrink: 0,
        display: 'inline-block',
      }} />
      {value}
    </span>
  );
}
