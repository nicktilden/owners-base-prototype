/**
 * Cell renderer for a single KPI column in the Portfolio Risk table.
 * Shows a sparkline trend chart + status pill with a hover Popover containing
 * the display value and KPI description.
 */

import React from 'react';
import { Box, Pill, Popover, Typography } from '@procore/core-react';
import type { ICellRendererParams } from 'ag-grid-community';
import type { KPIStatus, KPIKey } from '@/types/health';
import { KPI_LABELS, KPI_DESCRIPTIONS } from '@/types/health';

export interface KpiCellValue {
  status: KPIStatus;
  displayValue: string;
  /** 8-point normalized trend series (0–1), newest last */
  sparkline?: number[];
}

// ─── Sparkline SVG ───────────────────────────────────────────────────────────

const W = 52;
const H = 22;

function Sparkline({ points, color }: { points: number[]; color: string }) {
  if (!points || points.length < 2) return null;

  const xs = points.map((_, i) => (i / (points.length - 1)) * W);
  const ys = points.map((v) => H - v * H);

  const polyline = xs.map((x, i) => `${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');

  // Filled area: close down to baseline
  const area = [
    `M ${xs[0].toFixed(1)},${ys[0].toFixed(1)}`,
    ...xs.slice(1).map((x, i) => `L ${x.toFixed(1)},${ys[i + 1].toFixed(1)}`),
    `L ${xs[xs.length - 1].toFixed(1)},${H}`,
    `L ${xs[0].toFixed(1)},${H}`,
    'Z',
  ].join(' ');

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ display: 'block', flexShrink: 0 }}
      aria-hidden="true"
    >
      {/* Fill */}
      <path d={area} fill={color} fillOpacity={0.12} />
      {/* Line */}
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* End dot */}
      <circle
        cx={xs[xs.length - 1].toFixed(1)}
        cy={ys[ys.length - 1].toFixed(1)}
        r={2}
        fill={color}
      />
    </svg>
  );
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

// Raw hex for SVG — CSS vars don't work inside SVG attributes
const SPARKLINE_COLOR: Record<KPIStatus, string> = {
  green:       '#2e7d32',
  yellow:      '#f59e0b',
  red:         '#d32f2f',
  unavailable: '#9e9e9e',
};

export default function PortfolioRiskKpiCellRenderer(
  params: ICellRendererParams<unknown, KpiCellValue> & { kpiKey?: KPIKey }
) {
  const val = params.value;
  if (!val) return null;

  const { kpiKey } = params;
  const label = kpiKey ? KPI_LABELS[kpiKey] : '';
  const description = kpiKey ? KPI_DESCRIPTIONS[kpiKey] : '';

  const sparkColor = SPARKLINE_COLOR[val.status];

  const cellContent = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
      {val.sparkline && val.sparkline.length >= 2 && (
        <Sparkline points={val.sparkline} color={sparkColor} />
      )}
      <Pill color={PILL_COLOR[val.status]}>{PILL_LABEL[val.status]}</Pill>
    </div>
  );

  if (val.status === 'unavailable') return cellContent;

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
      {cellContent}
    </Popover>
  );
}
