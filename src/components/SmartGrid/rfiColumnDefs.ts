import React from "react";
import { Pill } from "@procore/core-react";
import { Connect } from "@procore/core-icons";
import type { ColDef, ValueFormatterParams, ICellRendererParams } from "ag-grid-community";
import type { Rfi, RfiStatus } from "@/types/rfis";
import { formatDateMMDDYYYY } from "@/utils/date";
import { isRfiConnected } from "@/data/procoreConnect";
import RfiActionsCellRenderer from "./RfiActionsCellRenderer";

type PillColor = "blue" | "green" | "yellow" | "gray" | "red";

const STATUS_COLORS: Record<RfiStatus, PillColor> = {
  Draft: "gray",
  Open: "blue",
  Closed: "green",
  "Closed - Revised": "yellow",
  "Closed - Draft": "gray",
};

function StatusPillRenderer(params: ICellRendererParams<Rfi>) {
  const value = params.value as RfiStatus | undefined;
  if (!value) return null;
  const color = STATUS_COLORS[value] ?? "gray";
  return React.createElement(Pill, { color }, value);
}

function CostImpactRenderer(params: ICellRendererParams<Rfi>) {
  const val = params.data?.costImpact;
  if (!val) return "—";
  if (!val.hasImpact) return "No";
  return val.amount != null ? `Yes — $${val.amount.toLocaleString()}` : "Yes";
}

function ScheduleImpactRenderer(params: ICellRendererParams<Rfi>) {
  const val = params.data?.scheduleImpact;
  if (!val) return "—";
  if (!val.hasImpact) return "No";
  return val.days != null ? `Yes — ${val.days} day${val.days !== 1 ? "s" : ""}` : "Yes";
}

export function getRfiColumnDefs(
  projectMap: Map<string, string>,
  onRfiClick?: (rfi: Rfi) => void
): ColDef<Rfi>[] {
  return [
    {
      field: "number",
      headerName: "#",
      filter: "agNumberColumnFilter",
      width: 80,
      minWidth: 60,
      pinned: "left",
      sort: "asc",
    },
    {
      field: "subject",
      headerName: "Subject",
      filter: "agTextColumnFilter",
      minWidth: 280,
      flex: 1,
      cellRenderer: (params: ICellRendererParams<Rfi>) => {
        if (!params.data) return null;
        const connected = isRfiConnected(params.data.id);
        return React.createElement(
          "span",
          { style: { display: "inline-flex", alignItems: "center", gap: 6 } },
          React.createElement(
            "a",
            {
              href: "#",
              onClick: (e: React.MouseEvent) => {
                e.preventDefault();
                onRfiClick?.(params.data!);
              },
              style: { color: "var(--color-text-link)", textDecoration: "underline", fontWeight: 500 },
            },
            params.value
          ),
          connected
            ? React.createElement(Connect, {
                size: "sm",
                style: { color: "#ff5200", flexShrink: 0, width: 16, height: 16 },
              } as any)
            : null
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      filter: "agSetColumnFilter",
      enableRowGroup: true,
      width: 160,
      minWidth: 130,
      cellRenderer: StatusPillRenderer,
    },
    {
      field: "ballInCourt",
      headerName: "Ball In Court",
      filter: "agSetColumnFilter",
      enableRowGroup: true,
      width: 170,
    },
    {
      field: "dueDate",
      headerName: "Due Date",
      filter: "agDateColumnFilter",
      width: 120,
      valueFormatter: (params: ValueFormatterParams<Rfi>) =>
        formatDateMMDDYYYY(params.value),
    },
    {
      field: "dateInitiated",
      headerName: "Created",
      filter: "agDateColumnFilter",
      width: 120,
      valueFormatter: (params: ValueFormatterParams<Rfi>) =>
        formatDateMMDDYYYY(params.value),
    },
    {
      field: "rfiManager",
      headerName: "RFI Manager",
      filter: "agSetColumnFilter",
      enableRowGroup: true,
      width: 170,
    },
    {
      field: "responsibleContractor",
      headerName: "Responsible Contractor",
      filter: "agSetColumnFilter",
      enableRowGroup: true,
      width: 200,
    },
    {
      field: "location",
      headerName: "Location",
      filter: "agSetColumnFilter",
      enableRowGroup: true,
      width: 180,
      hide: true,
    },
    {
      colId: "project",
      headerName: "Project",
      filter: "agSetColumnFilter",
      minWidth: 200,
      hide: true,
      valueGetter: (params) =>
        params.data ? projectMap.get(params.data.projectId) ?? params.data.projectId : "",
    },
    {
      colId: "costImpact",
      headerName: "Cost Impact",
      filter: "agSetColumnFilter",
      width: 160,
      hide: true,
      cellRenderer: CostImpactRenderer,
    },
    {
      colId: "scheduleImpact",
      headerName: "Schedule Impact",
      filter: "agSetColumnFilter",
      width: 160,
      hide: true,
      cellRenderer: ScheduleImpactRenderer,
    },
    {
      field: "costCode",
      headerName: "Cost Code",
      filter: "agTextColumnFilter",
      width: 120,
      hide: true,
    },
    {
      field: "receivedFrom",
      headerName: "Received From",
      filter: "agSetColumnFilter",
      width: 170,
      hide: true,
    },
    {
      field: "closedDate",
      headerName: "Closed Date",
      filter: "agDateColumnFilter",
      width: 120,
      hide: true,
      valueFormatter: (params: ValueFormatterParams<Rfi>) =>
        formatDateMMDDYYYY(params.value),
    },
    {
      colId: "actions",
      headerName: "",
      width: 90,
      minWidth: 90,
      maxWidth: 90,
      resizable: false,
      sortable: false,
      filter: false,
      suppressMovable: true,
      suppressHeaderMenuButton: true,
      pinned: "right",
      cellRenderer: RfiActionsCellRenderer,
      cellRendererParams: { onRfiClick },
      lockPosition: true,
    },
  ];
}
