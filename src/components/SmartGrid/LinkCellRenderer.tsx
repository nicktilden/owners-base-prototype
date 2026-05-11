import React from 'react';
import type { ICellRendererParams } from 'ag-grid-community';

/**
 * LinkCellRenderer
 * Renders a cell value as a bold, always-underlined text link.
 * Use as `cellRenderer: LinkCellRenderer` on any AG Grid column.
 */
export default function LinkCellRenderer(params: ICellRendererParams) {
  const value = params.value as string | undefined;
  if (!value) return null;

  return (
    <span
      style={{
        fontWeight: 600,
        color: 'var(--color-text-link)',
        textDecoration: 'underline',
        cursor: 'pointer',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        display: 'block',
      }}
      title={value}
    >
      {value}
    </span>
  );
}
