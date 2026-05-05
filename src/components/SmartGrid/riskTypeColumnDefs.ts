/**
 * RISK TYPE COLUMN DEFS
 * AG Grid column definitions for the Risk Types settings table.
 * Used in HealthRiskSettingsContent → Risk Types tab.
 */

import type { ColDef } from 'ag-grid-community';
import type { RiskTypeCategory } from '@/types/health';

export interface RiskTypeGridRow {
  id: string;
  label: string;
  isDefault: boolean;
  category: RiskTypeCategory;
  categoryDisplay: string;
  sourceData: string;   // comma-joined display labels
  linkedKpiCount: number;
  linkedKpiLabels: string; // comma-joined KPI labels
  visible: boolean;
  description: string;
}

// ─── Category display order ────────────────────────────────────────────────────

const CATEGORY_ORDER: Record<string, number> = {
  financial: 0, schedule: 1, safety: 2, quality: 3,
  regulatory: 4, environmental: 5, contractual: 6, other: 7,
};

// ─── Column definitions ────────────────────────────────────────────────────────

export const riskTypeColumnDefs: ColDef<RiskTypeGridRow>[] = [
  {
    field: 'label',
    headerName: 'Name',
    minWidth: 200,
    flex: 2,
    filter: 'agTextColumnFilter',
    pinned: 'left',
    valueFormatter: (p) => p.value as string,
  },
  {
    field: 'isDefault',
    headerName: 'Type',
    width: 100,
    filter: 'agSetColumnFilter',
    filterParams: { values: ['Default', 'Custom'] },
    valueFormatter: (p) => (p.value ? 'Default' : 'Custom'),
    sortable: true,
  },
  {
    field: 'categoryDisplay',
    headerName: 'Category',
    width: 150,
    filter: 'agSetColumnFilter',
    enableRowGroup: true,
    comparator: (a, b) => {
      const aKey = Object.keys(CATEGORY_ORDER).find(k => k === a) ?? a;
      const bKey = Object.keys(CATEGORY_ORDER).find(k => k === b) ?? b;
      return (CATEGORY_ORDER[aKey] ?? 99) - (CATEGORY_ORDER[bKey] ?? 99);
    },
  },
  {
    field: 'sourceData',
    headerName: 'Source Data',
    minWidth: 200,
    flex: 1.5,
    filter: 'agTextColumnFilter',
    valueFormatter: (p) => (p.value as string) || '—',
  },
  {
    field: 'linkedKpiCount',
    headerName: 'Linked KPIs',
    width: 120,
    filter: false,
    sortable: true,
    valueFormatter: (p) => {
      const n = p.value as number;
      return n > 0 ? `${n} KPI${n !== 1 ? 's' : ''}` : '—';
    },
  },
  {
    field: 'visible',
    headerName: 'Visible',
    width: 100,
    filter: 'agSetColumnFilter',
    filterParams: { values: ['Yes', 'No'] },
    sortable: true,
    valueFormatter: (p) => (p.value ? 'Yes' : 'No'),
  },
  {
    field: 'description',
    headerName: 'Description',
    minWidth: 260,
    flex: 2,
    filter: 'agTextColumnFilter',
    valueFormatter: (p) => (p.value as string) || '—',
  },
  {
    field: 'linkedKpiLabels',
    headerName: 'Linked KPI Names',
    minWidth: 220,
    flex: 1.5,
    filter: 'agTextColumnFilter',
    valueFormatter: (p) => (p.value as string) || '—',
  },
];
