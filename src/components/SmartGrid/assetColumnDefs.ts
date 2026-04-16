import React from "react";
import { Pill } from "@procore/core-react";
import type { ColDef, ValueGetterParams, ValueFormatterParams, ICellRendererParams } from "ag-grid-community";
import type { Asset, AssetStatus, AssetCondition } from "@/types/assets";
import { formatDateMMDDYYYY } from "@/utils/date";
import CostActionsCellRenderer from "./CostActionsCellRenderer";

type PillColor = "green" | "yellow" | "red" | "gray";

const STATUS_COLORS: Record<AssetStatus, PillColor> = {
  active: "green",
  inactive: "gray",
  in_maintenance: "yellow",
  retired: "red",
  disposed: "gray",
};

const STATUS_LABELS: Record<AssetStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  in_maintenance: "In Maintenance",
  retired: "Retired",
  disposed: "Disposed",
};

const CONDITION_COLORS: Record<AssetCondition, PillColor> = {
  excellent: "green",
  good: "green",
  fair: "yellow",
  poor: "red",
  critical: "red",
};

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");
}

function StatusPillRenderer(params: ICellRendererParams) {
  const value = params.value as AssetStatus | undefined;
  if (!value) return null;
  const color = STATUS_COLORS[value] ?? "gray";
  const label = STATUS_LABELS[value] ?? capitalize(value);
  return React.createElement(Pill, { color }, label);
}

function ConditionPillRenderer(params: ICellRendererParams) {
  const value = params.value as AssetCondition | undefined;
  if (!value) return null;
  const color = CONDITION_COLORS[value] ?? "gray";
  return React.createElement(Pill, { color }, capitalize(value));
}

export function getAssetColumnDefs(projectMap: Map<string, string>): ColDef<Asset>[] {
  return [
    {
      colId: "project",
      headerName: "Project",
      filter: "agSetColumnFilter",
      minWidth: 200,
      valueGetter: (params: ValueGetterParams<Asset>) =>
        params.data ? projectMap.get(params.data.projectId) ?? params.data.projectId : "",
    },
    {
      field: "name",
      headerName: "Name",
      filter: "agTextColumnFilter",
      minWidth: 200,
    },
    {
      field: "type",
      headerName: "Type",
      filter: "agSetColumnFilter",
      enableRowGroup: true,
      valueFormatter: (params: ValueFormatterParams<Asset>) =>
        params.value ? capitalize(params.value) : "",
    },
    {
      field: "trade",
      headerName: "Trade",
      filter: "agSetColumnFilter",
      enableRowGroup: true,
      valueFormatter: (params: ValueFormatterParams<Asset>) =>
        params.value ? capitalize(params.value) : "",
    },
    {
      colId: "manufacturerModel",
      headerName: "Manufacturer / Model",
      filter: "agTextColumnFilter",
      minWidth: 180,
      valueGetter: (params: ValueGetterParams<Asset>) => {
        if (!params.data) return "";
        const { manufacturer, model } = params.data;
        if (manufacturer && model) return `${manufacturer} ${model}`;
        return manufacturer ?? model ?? "—";
      },
    },
    {
      field: "serialNumber",
      headerName: "Serial Number",
      filter: "agTextColumnFilter",
      valueFormatter: (params: ValueFormatterParams<Asset>) =>
        params.value ?? "—",
    },
    {
      field: "status",
      headerName: "Status",
      filter: "agSetColumnFilter",
      enableRowGroup: true,
      minWidth: 150,
      cellRenderer: StatusPillRenderer,
    },
    {
      field: "condition",
      headerName: "Condition",
      filter: "agSetColumnFilter",
      enableRowGroup: true,
      minWidth: 130,
      cellRenderer: ConditionPillRenderer,
    },
    {
      field: "installDate",
      headerName: "Install Date",
      filter: "agDateColumnFilter",
      valueFormatter: (params: ValueFormatterParams<Asset>) =>
        formatDateMMDDYYYY(params.value),
    },
    {
      field: "warrantyExpiry",
      headerName: "Warranty Expiry",
      filter: "agDateColumnFilter",
      valueFormatter: (params: ValueFormatterParams<Asset>) =>
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
