import React, { useCallback, useMemo, useRef, useState } from "react";
import { Button, Dropdown, Pill, Search, Select, SplitViewCard, ToggleButton } from "@procore/core-react";
import { People as CommitmentsIcon, Filter, Plus, Sliders } from "@procore/core-icons";
import type { ColDef, GridApi, ICellRendererParams } from "ag-grid-community";
import LinkCellRenderer from "@/components/SmartGrid/LinkCellRenderer";
import ToolPageLayout from "@/components/tools/ToolPageLayout";
import { SmartGridWrapper } from "@/components/SmartGrid";
import CostActionsCellRenderer from "@/components/SmartGrid/CostActionsCellRenderer";
import ConfigureColumnsPanel from "@/components/SmartGrid/ConfigureColumnsPanel";
import styled from "styled-components";
import { commitments } from "@/data/seed/commitments";

const ToolbarRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 8px;
  gap: 8px;
  background: var(--color-surface-primary);
`;

const ToolbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const ToolbarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

const GridArea = styled.div`
  display: flex;
  height: 640px;
  border: 1px solid var(--color-border-default);
  border-radius: 0;
  overflow: hidden;
`;

interface GroupByOption {
  id: "contractCompany" | "status" | "ssovStatus";
  label: string;
}

const GROUP_BY_OPTIONS: GroupByOption[] = [
  { id: "contractCompany", label: "Contract Company" },
  { id: "status", label: "Status" },
  { id: "ssovStatus", label: "SSOV Status" },
];

type PillColor = "green" | "yellow" | "red" | "gray" | "blue";

const STATUS_COLORS: Record<string, PillColor> = {
  "Approved": "green",
  "Pending": "yellow",
  "Executed": "green",
  "Draft": "gray",
  "Void": "gray",
  "Under Review": "yellow",
  "Complete": "green",
};

const STATUS_LABELS: Record<string, string> = {
  "Approved": "Approved",
  "Pending": "Pending",
  "Executed": "Executed",
  "Draft": "Draft",
  "Void": "Void",
  "Under Review": "Under Review",
  "Complete": "Complete",
};

const SSOV_STATUS_COLORS: Record<string, PillColor> = {
  "Approved": "green",
  "Draft": "gray",
  "Pending": "yellow",
  "": "gray",
};

const SSOV_STATUS_LABELS: Record<string, string> = {
  "Approved": "Approved",
  "Draft": "Draft",
  "Pending": "Pending",
  "": "—",
};

function StatusPillRenderer(params: ICellRendererParams) {
  const status = params.value as string | undefined;
  if (!status) return null;
  const color: PillColor = STATUS_COLORS[status] ?? "gray";
  const label = STATUS_LABELS[status] ?? status;
  return React.createElement(Pill, { color }, label);
}

function SSOVStatusPillRenderer(params: ICellRendererParams) {
  const status = params.value as string | undefined;
  if (!status) return null;
  const color: PillColor = SSOV_STATUS_COLORS[status] ?? "gray";
  const label = SSOV_STATUS_LABELS[status] ?? status;
  return React.createElement(Pill, { color }, label);
}

interface CommitmentsContentProps {
  projectId: string;
}

export default function CommitmentsContent({ projectId }: CommitmentsContentProps) {
  const [searchText, setSearchText] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [groupBy, setGroupBy] = useState<GroupByOption | null>(null);
  const gridApiRef = useRef<GridApi | null>(null);

  const rowData = useMemo(() => commitments.filter((c) => c.projectId === projectId), [projectId]);

  const columnDefs = useMemo<ColDef[]>(() => [
    { field: "number", headerName: "Number", width: 130, pinned: "left", filter: "agTextColumnFilter" },
    { field: "contractCompany", headerName: "Contract Company", minWidth: 180, filter: "agSetColumnFilter", enableRowGroup: true },
    { field: "title", headerName: "Title", minWidth: 220, cellRenderer: LinkCellRenderer },
    { field: "status", headerName: "Status", width: 140, filter: "agSetColumnFilter", enableRowGroup: true, cellRenderer: StatusPillRenderer },
    { field: "executed", headerName: "Executed", width: 110 },
    { field: "ssovStatus", headerName: "SSOV Status", width: 130, filter: "agSetColumnFilter", enableRowGroup: true, cellRenderer: SSOVStatusPillRenderer },
    { field: "originalContractAmount", headerName: "Original Contract Amount", width: 190 },
    { field: "approvedChangeOrders", headerName: "Approved Change Orders", width: 190 },
    { field: "revisedContractAmount", headerName: "Revised Contract Amount", width: 190 },
    { field: "pendingChangeOrders", headerName: "Pending Change Orders", width: 180 },
    { field: "draftChangeOrders", headerName: "Draft Change Orders", width: 170 },
    { field: "invoiced", headerName: "Invoiced", width: 140 },
    { field: "paymentsIssued", headerName: "Payments Issued", width: 150 },
    { field: "percentPaid", headerName: "% Paid", width: 100 },
    { field: "remainingBalance", headerName: "Remaining Balance Outstanding", width: 230 },
    { field: "private", headerName: "Private", width: 100 },
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
  ], []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    gridApiRef.current?.setGridOption("quickFilterText", value);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchText("");
    gridApiRef.current?.setGridOption("quickFilterText", "");
  }, []);

  const handleFiltersToggle = useCallback(() => {
    setFiltersOpen((prev) => {
      if (!prev) setConfigOpen(false);
      return !prev;
    });
  }, []);

  const handleFilterClear = useCallback(async () => {
    const api = gridApiRef.current;
    if (!api) return;
    await api.setFilterModel(null);
    api.onFilterChanged();
  }, []);

  const handleConfigToggle = useCallback(() => {
    setConfigOpen((prev) => {
      if (!prev) setFiltersOpen(false);
      return !prev;
    });
  }, []);

  const handleGroupBySelect = useCallback(
    (selection: { item: unknown }) => {
      const opt = selection.item as GroupByOption;
      const prevId = groupBy?.id;
      setGroupBy(opt);
      const api = gridApiRef.current;
      if (!api) return;
      const state = api.getColumnState().map((col) => {
        if (col.colId === opt.id) {
          return { ...col, rowGroup: true, hide: true };
        }
        if (prevId && col.colId === prevId) {
          return { ...col, rowGroup: false, hide: false };
        }
        return { ...col, rowGroup: false };
      });
      api.applyColumnState({ state });
    },
    [groupBy]
  );

  const handleGroupByClear = useCallback(() => {
    const prevId = groupBy?.id;
    setGroupBy(null);
    const api = gridApiRef.current;
    if (!api) return;
    const state = api.getColumnState().map((col) => ({
      ...col,
      rowGroup: false,
      hide: prevId && col.colId === prevId ? false : col.hide,
    }));
    api.applyColumnState({ state });
  }, [groupBy]);

  const handleGridReady = useCallback((event: { api: GridApi }) => {
    gridApiRef.current = event.api;
  }, []);

  const actions = (
    <>
      <Dropdown label="Export" variant="secondary" className="b_secondary">
        <Dropdown.Item item="csv">CSV</Dropdown.Item>
        <Dropdown.Item item="excel">Excel</Dropdown.Item>
      </Dropdown>
      <Button variant="primary" className="b_primary" icon={<Plus />}>Create Commitment</Button>
    </>
  );

  return (
    <ToolPageLayout
      title="Commitments"
      icon={<CommitmentsIcon size="md" />}
      actions={actions}
    >
      <SplitViewCard>
        <SplitViewCard.Main>
          <SplitViewCard.Section heading="Commitments">
            <ToolbarRow>
              <ToolbarLeft>
                <div style={{ maxWidth: 260 }}>
                  <Search
                    placeholder="Search"
                    value={searchText}
                    onChange={handleSearchChange}
                    onClear={handleSearchClear}
                  />
                </div>
                <ToggleButton
                  selected={filtersOpen}
                  className="b_toggle"
                  icon={<Filter />}
                  onClick={handleFiltersToggle}
                >
                  Filters
                </ToggleButton>
              </ToolbarLeft>
              <ToolbarRight>
                <div style={{ width: 226 }}>
                  <Select
                    placeholder="Group by"
                    label={groupBy?.label}
                    onSelect={handleGroupBySelect}
                    onClear={handleGroupByClear}
                    block
                  >
                    {GROUP_BY_OPTIONS.map((opt) => (
                      <Select.Option
                        key={opt.id}
                        value={opt}
                        selected={groupBy?.id === opt.id}
                      >
                        {opt.label}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
                <ToggleButton
                  selected={configOpen}
                  className="b_toggle"
                  icon={<Sliders />}
                  onClick={handleConfigToggle}
                >
                  Configure
                </ToggleButton>
              </ToolbarRight>
            </ToolbarRow>

            <GridArea>
              {filtersOpen && (
                <div style={{ width: 240, borderRight: "1px solid var(--color-border-default)", padding: "16px 12px", background: "var(--color-surface-secondary)", flexShrink: 0 }}>
                  <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Filters</span>
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0, transition: "flex 0.25s ease" }}>
                <SmartGridWrapper
                  id="commitments-grid"
                  localStorageKey="owner-prototype-commitments-grid"
                  height="100%"
                  rowData={rowData}
                  columnDefs={columnDefs}
                  groupDisplayType="groupRows"
                  autoGroupColumnDef={{ headerName: "Group", minWidth: 200 }}
                  sideBar={false}
                  onGridReady={handleGridReady}
                  statusBar={{
                    statusPanels: [
                      { statusPanel: "agTotalAndFilteredRowCountComponent", align: "left" },
                      { statusPanel: "agSelectedRowCountComponent", align: "left" },
                    ],
                  }}
                />
              </div>
              <ConfigureColumnsPanel
                open={configOpen}
                gridApi={gridApiRef.current}
                onClose={() => setConfigOpen(false)}
              />
            </GridArea>
          </SplitViewCard.Section>
        </SplitViewCard.Main>
      </SplitViewCard>
    </ToolPageLayout>
  );
}
