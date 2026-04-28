/**
 * Column definitions for the Portfolio Risk table card.
 * Fixed columns: Project Number, Project Name, Stage, Program (for grouping).
 * Dynamic KPI columns: one per active KPI, showing status pill + display value.
 */

import type { ColDef } from 'ag-grid-community';
import { KPI_LABELS, KPI_CATEGORY_MAP, type KPIKey } from '@/types/health';
import PortfolioRiskKpiCellRenderer from './PortfolioRiskKpiCellRenderer';

export interface PortfolioRiskRow {
  id: string;
  number: string;
  name: string;
  stage: string;
  region: string;
  sector: string;
  // KPI values keyed by KPIKey — each is a { status, displayValue } object
  [key: string]: unknown;
}

const STAGE_LABELS: Record<string, string> = {
  conceptual:              'Conceptual',
  feasibility:             'Feasibility',
  design:                  'Design',
  bidding:                 'Bidding',
  course_of_construction:  'Under Construction',
  closeout:                'Closeout',
  warranty:                'Warranty',
  complete:                'Complete',
  on_hold:                 'On Hold',
  cancelled:               'Cancelled',
};

const CATEGORY_HEADER: Record<string, string> = {
  cost:     'Cost',
  schedule: 'Schedule',
  delivery: 'Delivery',
  risk:     'Risk',
};

/** Fixed identity columns */
export const portfolioRiskFixedCols: ColDef<PortfolioRiskRow>[] = [
  {
    field: 'number',
    headerName: '#',
    width: 100,
    pinned: 'left',
    filter: 'agTextColumnFilter',
  },
  {
    field: 'name',
    headerName: 'Project Name',
    minWidth: 240,
    flex: 2,
    pinned: 'left',
    filter: 'agTextColumnFilter',
    enableRowGroup: true,
  },
  {
    field: 'stage',
    headerName: 'Stage',
    width: 160,
    filter: 'agSetColumnFilter',
    enableRowGroup: true,
    valueFormatter: (p) => (p.value ? (STAGE_LABELS[p.value as string] ?? p.value) : '—'),
  },
  {
    field: 'region',
    headerName: 'Region',
    width: 130,
    filter: 'agSetColumnFilter',
    enableRowGroup: true,
    hide: true,
  },
  {
    field: 'sector',
    headerName: 'Sector',
    minWidth: 200,
    filter: 'agSetColumnFilter',
    enableRowGroup: true,
    hide: true,
  },
];

/** Build KPI columns for the given active KPI keys */
export function buildKpiColumns(activeKPIs: KPIKey[]): ColDef<PortfolioRiskRow>[] {
  // Group by category so headers cluster together
  const byCategory: Record<string, KPIKey[]> = {};
  for (const key of activeKPIs) {
    const cat = KPI_CATEGORY_MAP[key] ?? 'other';
    (byCategory[cat] = byCategory[cat] ?? []).push(key);
  }

  const cols: ColDef<PortfolioRiskRow>[] = [];
  const categoryOrder = ['cost', 'schedule', 'delivery', 'risk'];

  for (const cat of categoryOrder) {
    const keys = byCategory[cat] ?? [];
    for (const key of keys) {
      cols.push({
        colId: key,
        field: key,
        headerName: KPI_LABELS[key],
        width: 130,
        sortable: true,
        filter: 'agSetColumnFilter',
        filterParams: {
          values: ['green', 'yellow', 'red', 'unavailable'],
          valueFormatter: (p: { value: string }) => {
            const map: Record<string, string> = { green: 'Healthy', yellow: 'At Risk', red: 'Critical', unavailable: 'No Data' };
            return map[p.value] ?? p.value;
          },
        },
        enableRowGroup: false,
        cellRenderer: PortfolioRiskKpiCellRenderer,
        // Sort by status severity: red < yellow < green < unavailable
        comparator: (a, b) => {
          const order: Record<string, number> = { red: 0, yellow: 1, green: 2, unavailable: 3 };
          return (order[a?.status ?? 'unavailable'] ?? 3) - (order[b?.status ?? 'unavailable'] ?? 3);
        },
        // For set filter, filter by status string
        valueGetter: (p) => {
          const val = p.data?.[key] as { status: string } | undefined;
          return val?.status ?? 'unavailable';
        },
      });
    }
  }

  return cols;
}

/** Build the composite "Overall Health" column */
export function buildOverallHealthCol(): ColDef<PortfolioRiskRow> {
  return {
    colId: 'overallHealth',
    field: 'overallHealth',
    headerName: 'Overall',
    width: 120,
    pinned: 'left',
    filter: 'agSetColumnFilter',
    filterParams: {
      values: ['green', 'yellow', 'red', 'unavailable'],
    },
    cellRenderer: PortfolioRiskKpiCellRenderer,
    comparator: (a, b) => {
      const order: Record<string, number> = { red: 0, yellow: 1, green: 2, unavailable: 3 };
      return (order[a?.status ?? 'unavailable'] ?? 3) - (order[b?.status ?? 'unavailable'] ?? 3);
    },
    valueGetter: (p) => {
      const val = p.data?.['overallHealth'] as { status: string } | undefined;
      return val?.status ?? 'unavailable';
    },
  };
}

export { CATEGORY_HEADER };
