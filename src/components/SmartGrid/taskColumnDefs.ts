import React from "react";
import { Pill } from "@procore/core-react";
import type {
  ColDef,
  ICellRendererParams,
  ValueFormatterParams,
  ValueGetterParams,
} from "ag-grid-community";
import type { Task, TaskStatus } from "@/types/tasks";
import { formatDateMMDDYYYY } from "@/utils/date";
import CostActionsCellRenderer from "./CostActionsCellRenderer";

type PillColor = "blue" | "cyan" | "gray" | "green" | "magenta" | "red" | "UNSAFE_orange" | "yellow";

const STATUS_COLORS: Record<TaskStatus, PillColor> = {
  initiated: "gray",
  in_progress: "blue",
  ready_for_review: "yellow",
  closed: "green",
  void: "gray",
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  initiated: "Initiated",
  in_progress: "In Progress",
  ready_for_review: "Ready for Review",
  closed: "Closed",
  void: "Void",
};

function StatusPillRenderer(params: ICellRendererParams) {
  const value = params.value as TaskStatus | undefined;
  if (!value) return null;
  const color = STATUS_COLORS[value] ?? "gray";
  return React.createElement(Pill, { color }, STATUS_LABELS[value] ?? value);
}

export const CATEGORY_OPTIONS = [
  "Administrative",
  "Closeout",
  "Contract",
  "Design",
  "Equipment",
  "Inspector",
  "Miscellaneous",
  "Preconstruction",
  "Utility Coordination",
];

export function buildTaskColumnDefs(
  projectMap: Map<string, string>,
  isPortfolio: boolean
): ColDef<Task>[] {
  return [
    {
      field: "number",
      headerName: "#",
      width: 90,
      filter: "agNumberColumnFilter",
    },
    ...(isPortfolio
      ? [
          {
            colId: "project",
            headerName: "Project",
            minWidth: 200,
            filter: "agSetColumnFilter" as const,
            valueGetter: (params: ValueGetterParams<Task>) => {
              if (!params.data?.projectId) return "";
              return projectMap.get(params.data.projectId) ?? "";
            },
          } satisfies ColDef<Task>,
        ]
      : []),
    {
      field: "title",
      headerName: "Title",
      minWidth: 250,
      filter: "agTextColumnFilter",
      cellStyle: { fontWeight: 600, color: "#1d5cc9", cursor: "pointer" },
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 160,
      filter: "agSetColumnFilter",
      filterParams: {
        values: Object.keys(STATUS_LABELS),
        valueFormatter: (params: ValueFormatterParams) =>
          STATUS_LABELS[params.value as TaskStatus] ?? params.value,
      },
      cellRenderer: StatusPillRenderer,
      enableRowGroup: true,
    },
    {
      field: "category",
      headerName: "Category",
      minWidth: 160,
      filter: "agSetColumnFilter",
      filterParams: { values: CATEGORY_OPTIONS },
      enableRowGroup: true,
    },
    {
      field: "dueDate",
      headerName: "Due Date",
      minWidth: 120,
      filter: "agDateColumnFilter",
      valueFormatter: (params: ValueFormatterParams<Task>) =>
        formatDateMMDDYYYY(params.value),
    },
    {
      field: "private",
      headerName: "Private",
      width: 100,
      valueFormatter: (params: ValueFormatterParams<Task>) =>
        params.value ? "Yes" : "No",
    },
    {
      field: "createdAt",
      headerName: "Created",
      minWidth: 120,
      filter: "agDateColumnFilter",
      valueFormatter: (params: ValueFormatterParams<Task>) =>
        formatDateMMDDYYYY(params.value),
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
}
