import type { ColDef, ValueFormatterParams, ValueGetterParams } from "ag-grid-community";
import type { ProjectRow } from "@/data/projects";
import {
  PROJECT_STAGES,
  PROJECT_PROGRAMS,
  getProjectPortfolioScheduleSummary,
} from "@/data/projects";
import { formatDateMMDDYYYY } from "@/utils/date";
import StagePillRenderer from "./StagePillRenderer";
import ProjectNameCellRenderer from "./ProjectNameCellRenderer";
import ActionsCellRenderer from "./ActionsCellRenderer";
import ConnectedDataCellRenderer from "./ConnectedDataCellRenderer";
import LocationCellRenderer from "./LocationCellRenderer";
import PriorityCellRenderer from "./PriorityCellRenderer";

function fmtCurrency(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

const stageOptions = [...PROJECT_STAGES];
const programOptions = [...PROJECT_PROGRAMS];

/** Column IDs whose data comes from a connected (upstream) Procore project. */
export const CONNECTED_DATA_COL_IDS = new Set([
  "rfis", "submittals", "punchList",
  "observations", "dailyLogs", "drawings", "changeOrders", "invoicing",
  "photos", "documents", "cost", "specifications", "correspondence",
  "inspections", "bimModels", "schedule",
]);

export const portfolioColumnDefs: ColDef<ProjectRow>[] = [
  {
    field: "number",
    headerName: "Number",
    filter: "agTextColumnFilter",
    width: 120,
  },
  {
    field: "name",
    headerName: "Project Name",
    pinned: "left",
    minWidth: 250,
    filter: "agTextColumnFilter",
    editable: true,
    cellRenderer: ProjectNameCellRenderer,
  },
  {
    field: "program",
    headerName: "Program",
    filter: "agSetColumnFilter",
    filterParams: { values: programOptions },
    editable: true,
    cellEditor: "agSelectCellEditor",
    cellEditorParams: { values: programOptions },
    enableRowGroup: true,
  },
  {
    colId: "location",
    headerName: "Location",
    minWidth: 180,
    filter: "agTextColumnFilter",
    cellRenderer: LocationCellRenderer,
    valueGetter: (params: ValueGetterParams<ProjectRow>) => {
      if (!params.data) return "";
      // Text value used for filtering/sorting: combine street + city line
      const parts = [params.data.streetAddress, params.data.location].filter(Boolean);
      return parts.join(", ");
    },
    autoHeight: true,
  },
  {
    field: "city",
    headerName: "City",
    filter: "agSetColumnFilter",
    enableRowGroup: true,
    hide: true,
  },
  {
    field: "state",
    headerName: "State",
    filter: "agSetColumnFilter",
    enableRowGroup: true,
    hide: true,
  },
  {
    field: "region",
    headerName: "Region",
    filter: "agSetColumnFilter",
    enableRowGroup: true,
    hide: true,
  },
  {
    field: "projectManager",
    headerName: "Project Manager",
    minWidth: 160,
    filter: "agSetColumnFilter",
    enableRowGroup: true,
    hide: true,
  },
  {
    field: "stage",
    headerName: "Stage",
    minWidth: 170,
    filter: "agSetColumnFilter",
    filterParams: { values: stageOptions },
    editable: true,
    cellEditor: "agSelectCellEditor",
    cellEditorParams: { values: stageOptions },
    cellRenderer: StagePillRenderer,
    enableRowGroup: true,
  },
  {
    field: "priority",
    headerName: "Priority",
    width: 110,
    filter: "agSetColumnFilter",
    filterParams: { values: ["high", "medium", "low"] },
    enableRowGroup: true,
    cellRenderer: PriorityCellRenderer,
    comparator: (a: string, b: string) => {
      const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
      return (order[a] ?? 3) - (order[b] ?? 3);
    },
  },
  {
    field: "startDate",
    headerName: "Start Date",
    filter: "agDateColumnFilter",
    editable: true,
    valueFormatter: (params: ValueFormatterParams<ProjectRow>) =>
      formatDateMMDDYYYY(params.value),
    filterParams: {
      comparator: (filterDate: Date, cellValue: string) => {
        const cell = new Date(cellValue);
        if (cell < filterDate) return -1;
        if (cell > filterDate) return 1;
        return 0;
      },
    },
  },
  {
    field: "endDate",
    headerName: "End Date",
    filter: "agDateColumnFilter",
    editable: true,
    valueFormatter: (params: ValueFormatterParams<ProjectRow>) =>
      formatDateMMDDYYYY(params.value),
    filterParams: {
      comparator: (filterDate: Date, cellValue: string) => {
        const cell = new Date(cellValue);
        if (cell < filterDate) return -1;
        if (cell > filterDate) return 1;
        return 0;
      },
    },
  },
  {
    colId: "lastMilestone",
    headerName: "Last Milestone",
    filter: "agTextColumnFilter",
    width: 180,
    minWidth: 120,
    cellStyle: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
    valueGetter: (params: ValueGetterParams<ProjectRow>) => {
      if (!params.data) return "";
      return getProjectPortfolioScheduleSummary(params.data).lastMilestone;
    },
  },
  {
    colId: "nextMilestone",
    headerName: "Next Milestone",
    filter: "agTextColumnFilter",
    width: 180,
    minWidth: 120,
    cellStyle: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
    valueGetter: (params: ValueGetterParams<ProjectRow>) => {
      if (!params.data) return "";
      return getProjectPortfolioScheduleSummary(params.data).nextMilestone;
    },
  },
  {
    colId: "scheduleVariance",
    headerName: "Schedule Variance",
    filter: "agNumberColumnFilter",
    valueGetter: (params: ValueGetterParams<ProjectRow>) => {
      if (!params.data) return 0;
      return getProjectPortfolioScheduleSummary(params.data).scheduleVariance;
    },
    valueFormatter: (params: ValueFormatterParams) =>
      params.value != null ? `${params.value}d` : "0d",
    cellStyle: (params) => {
      if (params.value != null && params.value < 0) {
        return { color: "var(--color-text-error)" };
      }
      return null;
    },
  },
  {
    field: "originalBudget",
    headerName: "Original Budget",
    filter: "agNumberColumnFilter",
    editable: true,
    valueFormatter: (params: ValueFormatterParams<ProjectRow>) =>
      fmtCurrency(params.value),
  },
  {
    field: "estimatedCostAtCompletion",
    headerName: "Est. Cost at Completion",
    filter: "agNumberColumnFilter",
    valueFormatter: (params: ValueFormatterParams<ProjectRow>) =>
      fmtCurrency(params.value),
  },
  {
    colId: "rfis",
    headerName: "RFIs",
    width: 200,
    minWidth: 190,
    suppressSizeToFit: true,
    filter: false,
    sortable: false,
    cellRenderer: ConnectedDataCellRenderer,
    cellRendererParams: { dataKey: "rfis" },
  },
  {
    colId: "submittals",
    headerName: "Submittals",
    width: 220,
    minWidth: 210,
    suppressSizeToFit: true,
    filter: false,
    sortable: false,
    cellRenderer: ConnectedDataCellRenderer,
    cellRendererParams: { dataKey: "submittals" },
  },
  {
    colId: "punchList",
    headerName: "Punch List",
    width: 210,
    minWidth: 200,
    suppressSizeToFit: true,
    filter: false,
    sortable: false,
    cellRenderer: ConnectedDataCellRenderer,
    cellRendererParams: { dataKey: "punchList" },
  },
  // ─ Additional connected-data columns (hidden by default; toggle in Configure Columns) ─
  {
    colId: "observations",
    headerName: "Observations",
    hide: true,
    width: 200,
    minWidth: 190,
    suppressSizeToFit: true,
    filter: false,
    sortable: false,
    cellRenderer: ConnectedDataCellRenderer,
    cellRendererParams: { dataKey: "observations" },
  },
  {
    colId: "dailyLogs",
    headerName: "Daily Logs",
    hide: true,
    width: 190,
    minWidth: 180,
    suppressSizeToFit: true,
    filter: false,
    sortable: false,
    cellRenderer: ConnectedDataCellRenderer,
    cellRendererParams: { dataKey: "dailyLogs" },
  },
  {
    colId: "drawings",
    headerName: "Drawings",
    hide: true,
    width: 160,
    minWidth: 150,
    suppressSizeToFit: true,
    filter: false,
    sortable: false,
    cellRenderer: ConnectedDataCellRenderer,
    cellRendererParams: { dataKey: "drawings" },
  },
  {
    colId: "changeOrders",
    headerName: "Change Orders",
    hide: true,
    width: 240,
    minWidth: 230,
    suppressSizeToFit: true,
    filter: false,
    sortable: false,
    cellRenderer: ConnectedDataCellRenderer,
    cellRendererParams: { dataKey: "changeOrders" },
  },
  {
    colId: "invoicing",
    headerName: "Invoicing",
    hide: true,
    width: 280,
    minWidth: 260,
    suppressSizeToFit: true,
    filter: false,
    sortable: false,
    cellRenderer: ConnectedDataCellRenderer,
    cellRendererParams: { dataKey: "invoicing" },
  },
  {
    colId: "photos",
    headerName: "Photos",
    hide: true,
    width: 200,
    minWidth: 190,
    suppressSizeToFit: true,
    filter: false,
    sortable: false,
    cellRenderer: ConnectedDataCellRenderer,
    cellRendererParams: { dataKey: "photos" },
  },
  {
    colId: "documents",
    headerName: "Documents",
    hide: true,
    width: 180,
    minWidth: 170,
    suppressSizeToFit: true,
    filter: false,
    sortable: false,
    cellRenderer: ConnectedDataCellRenderer,
    cellRendererParams: { dataKey: "documents" },
  },
  {
    colId: "cost",
    headerName: "Budget / Cost",
    hide: true,
    width: 270,
    minWidth: 260,
    suppressSizeToFit: true,
    filter: false,
    sortable: false,
    cellRenderer: ConnectedDataCellRenderer,
    cellRendererParams: { dataKey: "cost" },
  },
  {
    colId: "specifications",
    headerName: "Specifications",
    hide: true,
    width: 160,
    minWidth: 150,
    suppressSizeToFit: true,
    filter: false,
    sortable: false,
    cellRenderer: ConnectedDataCellRenderer,
    cellRendererParams: { dataKey: "specifications" },
  },
  {
    colId: "correspondence",
    headerName: "Correspondence",
    hide: true,
    width: 210,
    minWidth: 200,
    suppressSizeToFit: true,
    filter: false,
    sortable: false,
    cellRenderer: ConnectedDataCellRenderer,
    cellRendererParams: { dataKey: "correspondence" },
  },
  {
    colId: "inspections",
    headerName: "Inspections",
    hide: true,
    width: 200,
    minWidth: 190,
    suppressSizeToFit: true,
    filter: false,
    sortable: false,
    cellRenderer: ConnectedDataCellRenderer,
    cellRendererParams: { dataKey: "inspections" },
  },
  {
    colId: "bimModels",
    headerName: "BIM Models",
    hide: true,
    width: 160,
    minWidth: 150,
    suppressSizeToFit: true,
    filter: false,
    sortable: false,
    cellRenderer: ConnectedDataCellRenderer,
    cellRendererParams: { dataKey: "bimModels" },
  },
  {
    colId: "schedule",
    headerName: "Schedule",
    hide: true,
    width: 300,
    minWidth: 280,
    suppressSizeToFit: true,
    filter: false,
    sortable: false,
    cellRenderer: ConnectedDataCellRenderer,
    cellRendererParams: { dataKey: "schedule" },
  },
  {
    colId: "actions",
    headerName: "Actions",
    width: 120,
    minWidth: 120,
    maxWidth: 120,
    resizable: false,
    sortable: false,
    filter: false,
    suppressMovable: true,
    suppressHeaderMenuButton: true,
    pinned: "right",
    cellRenderer: ActionsCellRenderer,
    lockPosition: true,
  },
];
