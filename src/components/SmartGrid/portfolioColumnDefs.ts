import type { ColDef, ValueFormatterParams, ValueGetterParams } from "ag-grid-community";
import type { ProjectRow } from "@/data/projects";
import {
  PROJECT_STAGES,
  PROJECT_PROGRAMS,
  sampleProjectMilestones,
  scheduleVarianceData,
} from "@/data/projects";
import { formatDateMMDDYYYY } from "@/utils/date";
import { getProjectConnection } from "@/data/procoreConnect";
import StagePillRenderer from "./StagePillRenderer";
import ConnectCellRenderer from "./ConnectCellRenderer";
import ActionsCellRenderer from "./ActionsCellRenderer";

function fmtCurrency(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

const varianceByName = new Map(scheduleVarianceData.map((d) => [d.project, d.variance]));

function getScheduleDetails(row: ProjectRow) {
  const todayIso = new Date().toISOString().slice(0, 10);
  const milestones = sampleProjectMilestones.get(row.id) ?? [];
  const completed = milestones.filter((m) => m.actualDate != null && m.actualDate <= todayIso);
  const upcoming = milestones.filter((m) => m.actualDate == null || m.actualDate > todayIso);
  return {
    lastMilestone: completed.length > 0 ? completed[completed.length - 1]?.name ?? "—" : "—",
    nextMilestone: upcoming.length > 0 ? upcoming[0]?.name ?? "—" : "—",
    scheduleVariance: varianceByName.get(row.name) ?? 0,
  };
}

const stageOptions = [...PROJECT_STAGES];
const programOptions = [...PROJECT_PROGRAMS];

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
    filter: "agSetColumnFilter",
    minWidth: 140,
    valueGetter: (params: ValueGetterParams<ProjectRow>) => {
      if (!params.data) return "";
      return `${params.data.city}, ${params.data.state}`;
    },
    enableRowGroup: true,
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
    valueGetter: (params: ValueGetterParams<ProjectRow>) => {
      if (!params.data) return "";
      return getScheduleDetails(params.data).lastMilestone;
    },
  },
  {
    colId: "nextMilestone",
    headerName: "Next Milestone",
    filter: "agTextColumnFilter",
    valueGetter: (params: ValueGetterParams<ProjectRow>) => {
      if (!params.data) return "";
      return getScheduleDetails(params.data).nextMilestone;
    },
  },
  {
    colId: "scheduleVariance",
    headerName: "Schedule Variance",
    filter: "agNumberColumnFilter",
    valueGetter: (params: ValueGetterParams<ProjectRow>) => {
      if (!params.data) return 0;
      return getScheduleDetails(params.data).scheduleVariance;
    },
    valueFormatter: (params: ValueFormatterParams) =>
      params.value != null ? `${params.value}d` : "0d",
    cellStyle: (params) => {
      if (params.value != null && params.value < 0) {
        return { color: "#d92626" };
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
    colId: "connectedRfis",
    headerName: "GC RFIs",
    filter: "agTextColumnFilter",
    valueGetter: (params: ValueGetterParams<ProjectRow>) => {
      if (!params.data) return "";
      const conn = getProjectConnection(params.data.id);
      return conn ? `${conn.counts.rfis.open} open / ${conn.counts.rfis.closed} closed` : "—";
    },
  },
  {
    colId: "connectedPunchList",
    headerName: "GC Punch List",
    filter: "agTextColumnFilter",
    valueGetter: (params: ValueGetterParams<ProjectRow>) => {
      if (!params.data) return "";
      const conn = getProjectConnection(params.data.id);
      return conn ? `${conn.counts.punchList.open} open / ${conn.counts.punchList.total} total` : "—";
    },
  },
  {
    colId: "connectedObservations",
    headerName: "GC Observations",
    filter: "agTextColumnFilter",
    valueGetter: (params: ValueGetterParams<ProjectRow>) => {
      if (!params.data) return "";
      const conn = getProjectConnection(params.data.id);
      return conn ? `${conn.counts.observations.open} open / ${conn.counts.observations.total} total` : "—";
    },
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
