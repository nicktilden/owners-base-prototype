import type { ColDef, ValueFormatterParams, ValueGetterParams } from "ag-grid-community";
import type { ProjectRow } from "@/data/projects";
import { PROJECT_STAGES, PROJECT_PROGRAMS } from "@/data/projects";
import { getProjectConnection } from "@/data/procoreConnect";
import StagePillRenderer from "./StagePillRenderer";
import ConnectCellRenderer from "./ConnectCellRenderer";
import CostActionsCellRenderer from "./CostActionsCellRenderer";

function fmtCurrency(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n === 0) return "$0";
  if (Math.abs(n) >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function fmtVariance(n: number | null | undefined): string {
  if (n == null) return "—";
  return `${n >= 0 ? "+" : ""}${fmtCurrency(n)}`;
}

const stageOptions = [...PROJECT_STAGES];
const programOptions = [...PROJECT_PROGRAMS];

export const costColumnDefs: ColDef<ProjectRow>[] = [
  {
    field: "number",
    headerName: "Project Number",
    filter: "agTextColumnFilter",
    width: 140,
  },
  {
    field: "name",
    headerName: "Project",
    pinned: "left",
    minWidth: 250,
    filter: "agTextColumnFilter",
  },
  {
    colId: "connect",
    headerName: "",
    width: 40,
    maxWidth: 40,
    minWidth: 40,
    resizable: false,
    sortable: false,
    filter: false,
    suppressMovable: true,
    suppressHeaderMenuButton: true,
    cellRenderer: ConnectCellRenderer,
    pinned: "left",
  },
  {
    colId: "location",
    headerName: "Location",
    filter: "agSetColumnFilter",
    minWidth: 140,
    valueGetter: (params: ValueGetterParams<ProjectRow>) => {
      if (!params.data) return "";
      return `${params.data.city}, ${params.data.state}`;
    },
  },
  {
    field: "stage",
    headerName: "Stage",
    minWidth: 170,
    filter: "agSetColumnFilter",
    filterParams: { values: stageOptions },
    cellRenderer: StagePillRenderer,
    enableRowGroup: true,
  },
  {
    field: "program",
    headerName: "Program",
    filter: "agSetColumnFilter",
    filterParams: { values: programOptions },
    enableRowGroup: true,
  },
  {
    field: "originalBudget",
    headerName: "Original Budget",
    filter: "agNumberColumnFilter",
    valueFormatter: (params: ValueFormatterParams<ProjectRow>) =>
      fmtCurrency(params.value),
  },
  {
    field: "jobToDateCost",
    headerName: "Spent to Date",
    filter: "agNumberColumnFilter",
    valueFormatter: (params: ValueFormatterParams<ProjectRow>) =>
      fmtCurrency(params.value),
  },
  {
    field: "estimatedCostAtCompletion",
    headerName: "Forecast EAC",
    filter: "agNumberColumnFilter",
    valueFormatter: (params: ValueFormatterParams<ProjectRow>) =>
      fmtCurrency(params.value),
  },
  {
    colId: "budgetVariance",
    headerName: "Budget Variance",
    filter: "agNumberColumnFilter",
    valueGetter: (params: ValueGetterParams<ProjectRow>) => {
      if (!params.data) return 0;
      return params.data.originalBudget - params.data.estimatedCostAtCompletion;
    },
    valueFormatter: (params: ValueFormatterParams) =>
      fmtVariance(params.value),
    cellStyle: (params) => {
      if (params.value == null) return null;
      if (params.value > 0) return { color: "var(--color-icon-success)" };
      if (params.value < 0) return { color: "var(--color-text-error)" };
      return null;
    },
  },
  {
    colId: "state",
    headerName: "State",
    filter: "agSetColumnFilter",
    valueGetter: (params: ValueGetterParams<ProjectRow>) =>
      params.data?.state ?? "",
    enableRowGroup: true,
    hide: true,
  },
  {
    colId: "actions",
    headerName: "Actions",
    width: 90,
    minWidth: 90,
    maxWidth: 90,
    resizable: false,
    sortable: false,
    filter: false,
    suppressMovable: true,
    suppressHeaderMenuButton: true,
    pinned: "right",
    cellRenderer: CostActionsCellRenderer,
    lockPosition: true,
  },
];
