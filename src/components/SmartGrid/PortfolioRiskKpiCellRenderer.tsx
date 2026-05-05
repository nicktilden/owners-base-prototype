/**
 * Cell renderer for a single KPI column in the Portfolio Risk table.
 * Shows a status pill with a hover Popover containing the display value and KPI description.
 */

import React from 'react';
import { Box, Pill, Popover, Typography } from '@procore/core-react';
import type { ICellRendererParams } from 'ag-grid-community';
import type { KPIStatus, KPIKey } from '@/types/health';
import { KPI_LABELS, KPI_DESCRIPTIONS } from '@/types/health';

export interface KpiCellValue {
  status: KPIStatus;
  displayValue: string;
}

const PILL_COLOR: Record<KPIStatus, 'green' | 'yellow' | 'red' | 'gray'> = {
  green:       'green',
  yellow:      'yellow',
  red:         'red',
  unavailable: 'gray',
};

const PILL_LABEL: Record<KPIStatus, string> = {
  green:       'On Track',
  yellow:      'At Risk',
  red:         'Critical',
  unavailable: '—',
};

const STATUS_COLOR: Record<KPIStatus, string> = {
  green:       'var(--color-icon-success)',
  yellow:      'var(--color-text-warning)',
  red:         'var(--color-text-error)',
  unavailable: 'var(--color-text-secondary)',
};

export default function PortfolioRiskKpiCellRenderer(
  params: ICellRendererParams<unknown, KpiCellValue> & { kpiKey?: KPIKey }
) {
  const val = params.value;
  if (!val) return null;

  const { kpiKey } = params;
  const label = kpiKey ? KPI_LABELS[kpiKey] : '';
  const description = kpiKey ? KPI_DESCRIPTIONS[kpiKey] : '';

  const pill = (
    <Pill color={PILL_COLOR[val.status]}>{PILL_LABEL[val.status]}</Pill>
  );

  if (val.status === 'unavailable') return pill;

  return (
    <Popover
      trigger="hover"
      placement="top"
      overlay={
        <Popover.Content>
          <Box padding="sm" style={{ minWidth: 180, maxWidth: 240 }}>
            <Typography
              intent="small"
              weight="bold"
              style={{ display: 'block', marginBottom: 4 }}
            >
              {label}
            </Typography>
            <Typography
              intent="h2"
              style={{ display: 'block', color: STATUS_COLOR[val.status], marginBottom: 6 }}
            >
              {val.displayValue}
            </Typography>
            <Typography
              intent="small"
              color="gray45"
              style={{ display: 'block' }}
            >
              {description}
            </Typography>
          </Box>
        </Popover.Content>
      }
    >
      {pill}
    </Popover>
  );
}
