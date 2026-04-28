import React from 'react';
import Link from 'next/link';
import type { ICellRendererParams } from 'ag-grid-community';
import type { PortfolioRiskRow } from './portfolioRiskColumnDefs';

export default function PortfolioRiskProjectNameCellRenderer(
  params: ICellRendererParams<PortfolioRiskRow>
) {
  const name = params.value as string | undefined;
  const id = params.data?.id;
  if (!name) return null;

  if (!id) return <span>{name}</span>;

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <Link
        href={`/project/${id}/overview`}
        style={{
          color: 'var(--color-text-link)',
          fontWeight: 600,
          textDecoration: 'underline',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          display: 'block',
        }}
      >
        {name}
      </Link>
    </div>
  );
}
