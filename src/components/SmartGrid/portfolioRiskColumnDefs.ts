/**
 * Column definitions for the Portfolio Risk table card.
 * Fixed columns: Project Number, Project Name, Stage, Program (for grouping).
 * Dynamic KPI columns: one per active KPI, showing status pill + display value.
 */

import type { ColDef } from 'ag-grid-community';
import { KPI_LABELS, KPI_CATEGORY_MAP, type KPIKey } from '@/types/health';
import PortfolioRiskKpiCellRenderer from './PortfolioRiskKpiCellRenderer';
import StagePillRenderer from './StagePillRenderer';
import PortfolioRiskProjectNameCellRenderer from './PortfolioRiskProjectNameCellRenderer';

export interface PortfolioRiskRow {
  id: string;
  number: string;
  name: string;
  stage: string;
  program: string;
  region: string;
  sector: string;
  // KPI values keyed by KPIKey — each is a { status, displayValue } object
  [key: string]: unknown;
}

export const STAGE_LABELS: Record<string, string> = {
  conceptual:              'Conceptual',
  feasibility:             'Feasibility',
  final_design:            'Final design',
  permitting:              'Permitting',
  design:                  'Design',
  bidding:                 'Bidding',
  'Pre-Construction':      'Pre-Construction',
  course_of_construction:  'Course of Construction',
  post_construction:       'Post-Construction',
  handover:                'Handover',
  closeout:                'Closeout',
  maintenance:             'Maintenance',
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
    minWidth: 300,
    flex: 2,
    pinned: 'left',
    filter: 'agTextColumnFilter',
    enableRowGroup: true,
    cellRenderer: PortfolioRiskProjectNameCellRenderer,
  },
  {
    field: 'stage',
    headerName: 'Stage',
    minWidth: 140,
    width: 180,
    filter: 'agSetColumnFilter',
    enableRowGroup: true,
    valueFormatter: (p) => (p.value ? (STAGE_LABELS[p.value as string] ?? p.value) : '—'),
    cellRenderer: StagePillRenderer,
    // StagePillRenderer reads params.value — pass the display label, not the key
    valueGetter: (p) => p.data ? (STAGE_LABELS[p.data.stage] ?? p.data.stage) : '',
  },
  {
    field: 'program',
    headerName: 'Program',
    width: 150,
    filter: 'agSetColumnFilter',
    enableRowGroup: true,
    valueFormatter: (p) => p.value ?? '—',
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
        width: 150,
        sortable: true,
        filter: 'agSetColumnFilter',
        cellRendererParams: { kpiKey: key },
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
          const aStatus = (a as { status?: string })?.status ?? 'unavailable';
          const bStatus = (b as { status?: string })?.status ?? 'unavailable';
          return (order[aStatus] ?? 3) - (order[bStatus] ?? 3);
        },
        // For set filter, extract status string without overriding the cell value
        filterValueGetter: (p) => {
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
    width: 150,
    pinned: 'left',
    filter: 'agSetColumnFilter',
    filterParams: {
      values: ['green', 'yellow', 'red', 'unavailable'],
    },
    cellRenderer: PortfolioRiskKpiCellRenderer,
    comparator: (a, b) => {
      const order: Record<string, number> = { red: 0, yellow: 1, green: 2, unavailable: 3 };
      const aStatus = (a as { status?: string })?.status ?? 'unavailable';
      const bStatus = (b as { status?: string })?.status ?? 'unavailable';
      return (order[aStatus] ?? 3) - (order[bStatus] ?? 3);
    },
    filterValueGetter: (p) => {
      const val = p.data?.['overallHealth'] as { status: string } | undefined;
      return val?.status ?? 'unavailable';
    },
  };
}

export { CATEGORY_HEADER };
