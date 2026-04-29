/**
 * RISK RECORDS COLUMN DEFS
 * AG Grid column definitions for the Risk Records table.
 * Used in HealthContent → project scope (Overview and Resolved tabs).
 */

import type { ColDef } from 'ag-grid-community';
import type { RiskCategory, RiskStatus, ResponseStrategy } from '@/types/health';

export interface RiskGridRow {
  id: string;
  title: string;
  category: string;
  status: string;
  probability: number;
  impactCost: number;
  impactSchedule: number;
  impactSafety: number;
  /** probability × max(impactCost, impactSchedule, impactSafety) */
  riskScore: number;
  responseStrategy: string;
  origin: string;
  dueDate: string;
  description: string;
  assignedTo: string; // user display name or empty string
}

export interface RiskGridContext {
  onOpenRisk?: (id: string) => void;
}

// ─── Category display order ────────────────────────────────────────────────────

const CATEGORY_ORDER: Record<string, number> = {
  financial: 0, schedule: 1, contractual: 2, regulatory: 3,
  safety: 4, environmental: 5,
};

const STATUS_ORDER: Record<string, number> = {
  identified: 0, assessed: 1, mitigated: 2, closed: 3,
};

// ─── Column definitions ────────────────────────────────────────────────────────

export const riskColumnDefs: ColDef<RiskGridRow>[] = [
  {
    field: 'title',
    headerName: 'Risk Title',
    minWidth: 220,
    flex: 2,
    filter: 'agTextColumnFilter',
    pinned: 'left',
    cellRenderer: 'riskTitleCellRenderer',
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 130,
    filter: 'agSetColumnFilter',
    enableRowGroup: true,
    comparator: (a, b) => (STATUS_ORDER[a] ?? 99) - (STATUS_ORDER[b] ?? 99),
    cellRenderer: 'riskStatusCellRenderer',
  },
  {
    field: 'riskScore',
    headerName: 'Risk Score',
    width: 120,
    filter: 'agNumberColumnFilter',
    sortable: true,
    sort: 'desc',
    cellRenderer: 'riskScoreCellRenderer',
  },
  {
    field: 'category',
    headerName: 'Category',
    width: 140,
    filter: 'agSetColumnFilter',
    enableRowGroup: true,
    comparator: (a, b) => (CATEGORY_ORDER[a] ?? 99) - (CATEGORY_ORDER[b] ?? 99),
    valueFormatter: (p) => {
      if (!p.value) return '';
      const v = p.value as string;
      return v.charAt(0).toUpperCase() + v.slice(1);
    },
  },
  {
    field: 'probability',
    headerName: 'Probability',
    width: 120,
    filter: 'agNumberColumnFilter',
    sortable: true,
    cellRenderer: 'riskProbabilityCellRenderer',
  },
  {
    field: 'impactCost',
    headerName: 'Impact: Cost',
    width: 120,
    filter: 'agNumberColumnFilter',
    sortable: true,
    cellRenderer: 'riskImpactCellRenderer',
  },
  {
    field: 'impactSchedule',
    headerName: 'Impact: Schedule',
    width: 140,
    filter: 'agNumberColumnFilter',
    sortable: true,
    cellRenderer: 'riskImpactCellRenderer',
  },
  {
    field: 'impactSafety',
    headerName: 'Impact: Safety',
    width: 130,
    filter: 'agNumberColumnFilter',
    sortable: true,
    cellRenderer: 'riskImpactCellRenderer',
  },
  {
    field: 'assignedTo',
    headerName: 'Assigned To',
    width: 160,
    filter: 'agTextColumnFilter',
    valueFormatter: (p) => (p.value as string) || '—',
  },
  {
    field: 'responseStrategy',
    headerName: 'Response Strategy',
    width: 160,
    filter: 'agSetColumnFilter',
    enableRowGroup: true,
    valueFormatter: (p) => {
      if (!p.value) return '—';
      const v = p.value as string;
      return v.charAt(0).toUpperCase() + v.slice(1);
    },
  },
  {
    field: 'origin',
    headerName: 'Origin',
    width: 110,
    filter: 'agSetColumnFilter',
    enableRowGroup: true,
    valueFormatter: (p) => {
      if (!p.value) return '—';
      const v = p.value as string;
      return v.charAt(0).toUpperCase() + v.slice(1);
    },
  },
  {
    field: 'dueDate',
    headerName: 'Due Date',
    width: 110,
    filter: 'agDateColumnFilter',
    sortable: true,
    valueFormatter: (p) => (p.value as string) || '—',
  },
  {
    field: 'description',
    headerName: 'Description',
    minWidth: 280,
    flex: 2,
    filter: 'agTextColumnFilter',
    valueFormatter: (p) => (p.value as string) || '—',
  },
];
