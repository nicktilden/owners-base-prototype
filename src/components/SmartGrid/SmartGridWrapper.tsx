import React, { useCallback, useMemo, useRef } from "react";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import type { ColDef, GridApi, GridReadyEvent } from "ag-grid-community";
import { themeAlpine } from "ag-grid-community";
import {
  AllEnterpriseModule,
  LicenseManager,
} from "ag-grid-enterprise";
import ProcoreHeader from "./ProcoreHeader";

LicenseManager.setLicenseKey("");

const ENTERPRISE_MODULES = [AllEnterpriseModule];

const procoreTheme = themeAlpine.withParams({
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  fontSize: 12,

  headerHeight: 48,
  rowHeight: 48,

  headerBackgroundColor: "#F4F5F7",
  headerTextColor: "#464F53",
  headerFontWeight: 600,
  headerFontSize: 12,

  backgroundColor: "#FFFFFF",
  foregroundColor: "#232729",
  textColor: "#232729",
  oddRowBackgroundColor: "#FFFFFF",

  borderColor: "#E0E4E7",
  rowBorder: { width: 1, color: "#E0E4E7" },
  columnBorder: false,
  headerColumnBorder: false,
  headerColumnResizeHandleColor: "transparent",
  wrapperBorder: { width: 1, color: "#E0E4E7" },
  wrapperBorderRadius: 0,

  selectedRowBackgroundColor: "rgba(32, 102, 223, 0.08)",
  rowHoverColor: "#F4F5F7",
  rangeSelectionBorderColor: "#2066DF",

  accentColor: "#2066DF",
  iconSize: 16,
  cellHorizontalPadding: 12,

  sidePanelBorder: { width: 1, color: "#E0E4E7" },
  sideBarPanelWidth: 280,

  spacing: 4,
  rowGroupIndentSize: 14,
});

export interface SmartGridWrapperProps<TData> extends Omit<AgGridReactProps<TData>, "modules" | "theme"> {
  id: string;
  localStorageKey?: string;
  height?: string | number;
}

export default function SmartGridWrapper<TData>({
  id,
  localStorageKey,
  height = 600,
  defaultColDef: defaultColDefOverride,
  sideBar: sideBarOverride,
  rowSelection: rowSelectionOverride,
  onGridReady: onGridReadyOverride,
  ...rest
}: SmartGridWrapperProps<TData>) {
  const gridApiRef = useRef<GridApi<TData> | null>(null);

  const defaultColDef: ColDef<TData> = useMemo(() => ({
    resizable: true,
    sortable: true,
    minWidth: 100,
    filter: true,
    headerComponent: ProcoreHeader,
    ...defaultColDefOverride,
  }), [defaultColDefOverride]);

  const sideBar = useMemo(() => sideBarOverride ?? {
    toolPanels: [
      {
        id: "columns",
        labelDefault: "Columns",
        labelKey: "columns",
        iconKey: "columns",
        toolPanel: "agColumnsToolPanel",
      },
      {
        id: "filters",
        labelDefault: "Filters",
        labelKey: "filters",
        iconKey: "filter",
        toolPanel: "agFiltersToolPanel",
      },
    ],
    defaultToolPanel: "",
  }, [sideBarOverride]);

  const rowSelection = useMemo(() => rowSelectionOverride ?? {
    mode: "multiRow" as const,
    checkboxLocation: "selectionColumn" as const,
    groupSelects: "descendants" as const,
  }, [rowSelectionOverride]);

  const handleGridReady = useCallback(
    (event: GridReadyEvent<TData>) => {
      gridApiRef.current = event.api;
      event.api.autoSizeAllColumns();
      onGridReadyOverride?.(event);
    },
    [onGridReadyOverride]
  );

  return (
    <div
      id={id}
      style={{ height, width: "100%" }}
    >
      <AgGridReact<TData>
        theme={procoreTheme}
        modules={ENTERPRISE_MODULES}
        defaultColDef={defaultColDef}
        sideBar={sideBar}
        rowSelection={rowSelection}
        selectionColumnDef={{
          width: 48,
          maxWidth: 48,
          minWidth: 48,
          resizable: false,
          suppressMovable: true,
          lockPosition: true,
          pinned: "left",
          sortable: false,
          suppressHeaderMenuButton: true,
        }}
        onGridReady={handleGridReady}
        enableCellTextSelection
        ensureDomOrder
        animateRows={false}
        {...rest}
      />
    </div>
  );
}
