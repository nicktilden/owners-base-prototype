import React from 'react';
import type { ICellRendererParams } from 'ag-grid-community';
import type { RiskGridRow } from './riskColumnDefs';

function scoreColor(score: number): { bg: string; text: string } {
  if (score >= 20) return { bg: 'var(--color-pill-bg-red)',    text: 'var(--color-pill-text-red)' };
  if (score >= 12) return { bg: 'var(--color-pill-bg-yellow)', text: 'var(--color-pill-text-yellow)' };
  if (score >= 6)  return { bg: '#fff3cd',                     text: '#856404' };
  return             { bg: 'var(--color-pill-bg-green)',  text: 'var(--color-pill-text-green)' };
}

export default function RiskScoreCellRenderer(
  params: ICellRendererParams<RiskGridRow, number>
) {
  const score = params.value;
  if (score == null) return <span style={{ color: 'var(--color-text-secondary)' }}>—</span>;
  const { bg, text } = scoreColor(score);
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 32,
      padding: '4px 8px',
      borderRadius: 4,
      background: bg,
      color: text,
      fontWeight: 700,
      fontSize: 13,
      lineHeight: 1,
    }}>
      {score}
    </span>
  );
}
