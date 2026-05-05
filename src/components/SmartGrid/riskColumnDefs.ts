/**
 * RISK RECORDS COLUMN DEFS
 * AG Grid column definitions for the Active Risks table.
 * Columns reflect the source tool item, not legacy risk records.
 */

import type { ColDef } from 'ag-grid-community';

export interface RiskGridRow {
  id: string;
  /** Source-item fields */
  itemTitle: string;
  itemType: string;      // e.g. "Change Event", "RFI", "Punch List"
  itemDueDate: string;
  itemStatus: string;
  itemAssignedTo: string;
  /** Risk metadata */
  categories: string[];  // one or more RiskTypeCategory labels, e.g. ["Financial", "Schedule"]
  riskScore: number;     // probability × impact (normalized)
  impactSummary: string; // formatted impact string, e.g. "$320,000" or "21 days"
  impactRaw: number;     // numeric for sorting
  status: string;        // RiskTagStatus
  assignedTo: string;    // risk owner display name
  origin: string;
  /** Passthrough fields used by tearsheet */
  sourceType: string;
  sourceId: string;
  probability: number;
  impact: number;
  riskTypeLabel: string;
  description: string;
}

export interface RiskGridContext {
  onOpenRisk?: (id: string) => void;
}

// ─── Column definitions ────────────────────────────────────────────────────────

export const riskColumnDefs: ColDef<RiskGridRow>[] = [
  {
    field: 'itemTitle',
    headerName: 'Item Title',
    minWidth: 220,
    flex: 2,
    filter: 'agTextColumnFilter',
    pinned: 'left',
    cellRenderer: 'riskTitleCellRenderer',
  },
  {
    field: 'itemType',
    headerName: 'Item Type',
    width: 150,
    filter: 'agSetColumnFilter',
    enableRowGroup: true,
    cellRenderer: 'riskItemTypeCellRenderer',
  },
  {
    field: 'categories',
    headerName: 'Risk Category',
    width: 180,
    filter: 'agSetColumnFilter',
    enableRowGroup: true,
    cellRenderer: 'riskCategoriesCellRenderer',
    valueFormatter: (p) => (p.value as string[])?.join(', ') ?? '',
    keyCreator: (p) => (p.value as string[])?.[0] ?? '',
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
    field: 'impactSummary',
    headerName: 'Impact',
    width: 130,
    filter: 'agTextColumnFilter',
    sortable: true,
    comparator: (_a, _b, nodeA, nodeB) =>
      (nodeA.data?.impactRaw ?? 0) - (nodeB.data?.impactRaw ?? 0),
    cellStyle: { fontWeight: 500 },
    valueFormatter: (p) => (p.value as string) || '—',
  },
  {
    field: 'itemDueDate',
    headerName: 'Due Date',
    width: 115,
    filter: 'agDateColumnFilter',
    sortable: true,
    valueFormatter: (p) => (p.value as string) || '—',
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 170,
    filter: 'agSetColumnFilter',
    enableRowGroup: true,
    cellRenderer: 'riskStatusCellRenderer',
  },
  {
    field: 'assignedTo',
    headerName: 'Assigned To',
    width: 155,
    filter: 'agTextColumnFilter',
    valueFormatter: (p) => (p.value as string) || '—',
  },
  {
    field: 'origin',
    headerName: 'Origin',
    width: 120,
    filter: 'agSetColumnFilter',
    enableRowGroup: true,
    cellRenderer: 'riskOriginCellRenderer',
  },
];
