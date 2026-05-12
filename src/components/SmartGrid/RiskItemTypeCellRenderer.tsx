import React from 'react';
import type { ICellRendererParams } from 'ag-grid-community';
import type { RiskGridRow } from './riskColumnDefs';

export default function RiskItemTypeCellRenderer(
  params: ICellRendererParams<RiskGridRow, string>
) {
  const value = params.value as string;
  if (!value) return null;
  return <span>{value}</span>;
}
