import React from 'react';
import { Pill } from '@procore/core-react';
import type { ICellRendererParams } from 'ag-grid-community';
import type { RiskGridRow } from './riskColumnDefs';

const STATUS_CONFIG: Record<string, { label: string; color: React.ComponentProps<typeof Pill>['color'] }> = {
  // RiskTagStatus values
  open:                { label: 'Open',               color: 'blue'   },
  pending_acceptance:  { label: 'Pending Acceptance', color: 'yellow' },
  pending_approval:    { label: 'Pending Approval',   color: 'yellow' },
  mitigated:           { label: 'Mitigated',          color: 'green'  },
  accepted:            { label: 'Accepted',           color: 'gray'   },
  closed:              { label: 'Closed',             color: 'gray'   },
  // Legacy RiskStatus values
  identified:          { label: 'Identified',         color: 'gray'   },
  assessed:            { label: 'Assessed',           color: 'yellow' },
};

export default function RiskStatusCellRenderer(
  params: ICellRendererParams<RiskGridRow, string>
) {
  const value = params.value as string;
  const cfg = STATUS_CONFIG[value];
  if (!cfg) return <span style={{ fontSize: 12 }}>{value}</span>;
  return <Pill color={cfg.color}>{cfg.label}</Pill>;
}
