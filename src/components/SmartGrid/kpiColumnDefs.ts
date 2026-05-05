/**
 * KPI COLUMN DEFS
 * AG Grid column definitions for the KPIs settings table.
 * Used in HealthRiskSettingsContent → KPIs tab.
 */

import type { ColDef } from 'ag-grid-community';
import type { KPIKey } from '@/types/health';

export interface KPIGridRow {
  key: KPIKey;
  label: string;
  category: string;
  calcLabel: string;
  units: string;
  direction: 'higher = worse' | 'lower = worse';
  description: string;
  requiresTool: string;
  linkedRiskTypes: string; // comma-joined labels
  active: boolean;
  yellowThreshold: number;
  redThreshold: number;
  weight: number;
}

// ─── KPI metadata ─────────────────────────────────────────────────────────────

export const KPI_DESCRIPTIONS: Record<KPIKey, string> = {
  budgetVariance:       'Budget vs. forecast — % over original contract',
  remainingContingency: 'Remaining contingency as % of budget',
  changeEvents:         'Number of pending unresolved change events',
  forecastToComplete:   'Expected remaining spend vs. original plan',
  costAtCompletion:     'Projected final cost vs. original budget',
  scheduleStatus:       'Overall schedule on-track / at-risk / behind',
  milestoneRate:        'Percentage of key milestones completed on time',
  scheduleVariance:     'Days ahead or behind schedule baseline',
  aggregateRisk:        'Open high-probability risk count from Risk Register',
  rfisAtRisk:           'Overdue RFIs that may impact schedule or cost',
  submittalsAtRisk:     'Overdue submittals blocking procurement or installation',
  invoiceStatus:        'Invoice approval aging — days overdue',
  avgRiskSeverity:      'Mean severity score (1–5) across all open risks',
  financialExposure:    'Total at-risk dollar exposure from over-budget projects',
  openRiskCount:        'Total number of open risks across all active projects',
};

export const KPI_REQUIRES_TOOL: Partial<Record<KPIKey, string>> = {
  changeEvents:       'Change Events',
  forecastToComplete: 'Budget / Procore Connect',
  costAtCompletion:   'Budget / Procore Connect',
  milestoneRate:      'Schedule',
  rfisAtRisk:         'RFIs',
  submittalsAtRisk:   'Submittals',
  invoiceStatus:      'Invoicing',
};

export const KPI_UNITS: Record<KPIKey, string> = {
  budgetVariance:       '%',
  remainingContingency: '%',
  changeEvents:         '#',
  forecastToComplete:   '%',
  costAtCompletion:     '%',
  scheduleStatus:       'days',
  milestoneRate:        '%',
  scheduleVariance:     'days',
  aggregateRisk:        '#',
  rfisAtRisk:           '#',
  submittalsAtRisk:     '#',
  invoiceStatus:        'days',
  avgRiskSeverity:      '/5',
  financialExposure:    '$M',
  openRiskCount:        '#',
};

export const KPI_CALC_LABELS: Record<KPIKey, string> = {
  budgetVariance:       'Variance %',
  remainingContingency: 'Ratio %',
  changeEvents:         'Count',
  forecastToComplete:   'Variance %',
  costAtCompletion:     'Variance %',
  scheduleStatus:       'Variance (days)',
  milestoneRate:        'Ratio %',
  scheduleVariance:     'Variance (days)',
  aggregateRisk:        'Count',
  rfisAtRisk:           'Count',
  submittalsAtRisk:     'Count',
  invoiceStatus:        'Variance (days)',
  avgRiskSeverity:      'Average (1–5)',
  financialExposure:    'Sum ($M)',
  openRiskCount:        'Count',
};

/** KPIs where lower threshold value = worse (inverted direction) */
export const INVERTED_KPIS = new Set<KPIKey>(['remainingContingency', 'milestoneRate']);

// ─── Column definitions ────────────────────────────────────────────────────────

const CATEGORY_ORDER: Record<string, number> = { cost: 0, schedule: 1, delivery: 2, risk: 3 };

export const kpiColumnDefs: ColDef<KPIGridRow>[] = [
  {
    field: 'label',
    headerName: 'KPI',
    minWidth: 220,
    flex: 2,
    filter: 'agTextColumnFilter',
    enableRowGroup: true,
    pinned: 'left',
  },
  {
    field: 'category',
    headerName: 'Category',
    width: 120,
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
    field: 'calcLabel',
    headerName: 'Calc Type',
    width: 140,
    filter: 'agTextColumnFilter',
  },
  {
    field: 'active',
    headerName: 'Active',
    width: 100,
    filter: false,
    sortable: true,
    valueFormatter: (p) => (p.value ? 'Yes' : 'No'),
  },
  {
    field: 'yellowThreshold',
    headerName: 'Yellow ⚠',
    width: 120,
    filter: false,
    sortable: true,
    valueFormatter: (p) => (p.value != null ? `${p.value} ${p.data?.units ?? ''}`.trim() : '—'),
  },
  {
    field: 'redThreshold',
    headerName: 'Red 🔴',
    width: 110,
    filter: false,
    sortable: true,
    valueFormatter: (p) => (p.value != null ? `${p.value} ${p.data?.units ?? ''}`.trim() : '—'),
  },
  {
    field: 'weight',
    headerName: 'Weight',
    width: 90,
    filter: false,
    sortable: true,
    valueFormatter: (p) => (p.value != null ? `${p.value}%` : '—'),
  },
  {
    field: 'direction',
    headerName: 'Direction',
    width: 150,
    filter: 'agSetColumnFilter',
  },
  {
    field: 'requiresTool',
    headerName: 'Requires Tool',
    width: 170,
    filter: 'agTextColumnFilter',
    valueFormatter: (p) => (p.value as string) || '—',
  },
  {
    field: 'linkedRiskTypes',
    headerName: 'Linked Risk Types',
    minWidth: 200,
    flex: 1,
    filter: 'agTextColumnFilter',
    valueFormatter: (p) => (p.value as string) || '—',
  },
  {
    field: 'description',
    headerName: 'Description',
    minWidth: 260,
    flex: 1.5,
    filter: 'agTextColumnFilter',
  },
];
