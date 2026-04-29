import React from 'react';
import type { ICellRendererParams } from 'ag-grid-community';
import type { RiskGridRow } from './riskColumnDefs';

interface RiskRatingCellRendererParams extends ICellRendererParams<RiskGridRow, number> {
  prefix?: 'P' | 'I';
}

function ratingColor(prefix: 'P' | 'I', value: number): { bg: string; text: string } {
  if (prefix === 'P') {
    if (value >= 5) return { bg: 'var(--color-pill-bg-red)',    text: 'var(--color-pill-text-red)' };
    if (value >= 4) return { bg: '#fff3cd',                     text: '#856404' };
    if (value >= 3) return { bg: 'var(--color-pill-bg-yellow)', text: 'var(--color-pill-text-yellow)' };
    return           { bg: 'var(--color-pill-bg-green)',  text: 'var(--color-pill-text-green)' };
  }
  // Impact
  if (value >= 5) return { bg: 'var(--color-pill-bg-red)',    text: 'var(--color-pill-text-red)' };
  if (value >= 4) return { bg: '#fff3cd',                     text: '#856404' };
  if (value >= 3) return { bg: 'var(--color-pill-bg-yellow)', text: 'var(--color-pill-text-yellow)' };
  return           { bg: 'var(--color-pill-bg-green)',  text: 'var(--color-pill-text-green)' };
}

export default function RiskRatingCellRenderer(params: RiskRatingCellRendererParams) {
  const value = params.value;
  const prefix = params.prefix ?? 'I';
  if (value == null) return <span style={{ color: 'var(--color-text-secondary)' }}>—</span>;
  const { bg, text } = ratingColor(prefix, value);
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 36,
      padding: '4px 8px',
      borderRadius: 4,
      background: bg,
      color: text,
      fontWeight: 700,
      fontSize: 13,
      lineHeight: 1,
    }}>
      {prefix}:{value}
    </span>
  );
}
