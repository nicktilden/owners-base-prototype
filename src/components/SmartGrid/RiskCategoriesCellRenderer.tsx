import React from 'react';
import type { ICellRendererParams } from 'ag-grid-community';
import type { RiskGridRow } from './riskColumnDefs';

export default function RiskCategoriesCellRenderer(
  params: ICellRendererParams<RiskGridRow, string[]>
) {
  const cats = params.value as string[];
  if (!cats?.length) return null;
  return <span>{cats.join(', ')}</span>;
}
