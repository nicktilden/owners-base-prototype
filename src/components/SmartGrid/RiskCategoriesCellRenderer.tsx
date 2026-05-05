import React from 'react';
import type { ICellRendererParams } from 'ag-grid-community';
import type { RiskGridRow } from './riskColumnDefs';

const CATEGORY_COLORS: Record<string, string> = {
  Financial:    '#e53935',
  Schedule:     '#f57c00',
  Safety:       '#c62828',
  Quality:      '#7b1fa2',
  Contractual:  '#2e7d32',
  Regulatory:   '#0277bd',
  Environmental:'#388e3c',
  Other:        '#546e7a',
};

export default function RiskCategoriesCellRenderer(
  params: ICellRendererParams<RiskGridRow, string[]>
) {
  const cats = params.value as string[];
  if (!cats?.length) return null;

  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center', paddingTop: 2 }}>
      {cats.map(cat => {
        const color = CATEGORY_COLORS[cat] ?? '#546e7a';
        return (
          <span key={cat} style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '1px 7px',
            borderRadius: 10,
            fontSize: 11,
            fontWeight: 600,
            background: `${color}18`,
            color,
            border: `1px solid ${color}40`,
            whiteSpace: 'nowrap',
          }}>
            {cat}
          </span>
        );
      })}
    </div>
  );
}
