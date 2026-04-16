import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Dropdown,
  Search,
  SegmentedController,
  Select,
  SplitViewCard,
  Tabs,
  ToggleButton,
} from "@procore/core-react";
import {
  Assets as AssetsIcon,
  Filter,
  Location,
  Plus,
  Sliders,
  ViewRows,
} from "@procore/core-icons";
import type { GridApi } from "ag-grid-community";
import { SmartGridWrapper } from "@/components/SmartGrid";
import { getAssetColumnDefs } from "@/components/SmartGrid/assetColumnDefs";
import AssetFiltersPanel, {
  type AssetFilterValues,
} from "@/components/SmartGrid/AssetFiltersPanel";
import ConfigureColumnsPanel from "@/components/SmartGrid/ConfigureColumnsPanel";
import { assets } from "@/data/seed/assets";
import { projects } from "@/data/seed/projects";
import type { Asset } from "@/types/assets";
import styled from "styled-components";
import ToolPageLayout from "@/components/tools/ToolPageLayout";
import AssetDetailTearsheet from "@/components/tools/AssetDetailTearsheet";

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");
}

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  inactive: "Inactive",
  in_maintenance: "In Maintenance",
  retired: "Retired",
  disposed: "Disposed",
};

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

type ViewMode = "rows" | "grid";
type TabKey = "list" | "recycle_bin";

interface GroupByOption {
  id: "type" | "trade" | "status" | "condition";
  label: string;
}

const GROUP_BY_OPTIONS: GroupByOption[] = [
  { id: "type", label: "Type" },
  { id: "trade", label: "Trade" },
  { id: "status", label: "Status" },
  { id: "condition", label: "Condition" },
];

interface AssetsContentProps {
  projectId: string;
}

export default function AssetsContent({ projectId }: AssetsContentProps) {
  const isPortfolio = projectId === "";
  const [activeTab, setActiveTab] = useState<TabKey>("list");
  const [viewMode, setViewMode] = useState<ViewMode>("rows");
  const [searchText, setSearchText] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [groupBy, setGroupBy] = useState<GroupByOption | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const gridApiRef = useRef<GridApi<Asset> | null>(null);

  const project = useMemo(
    () => projects.find((p) => p.id === projectId),
    [projectId]
  );

  const projectMap = useMemo(() => {
    const m = new Map<string, string>();
    projects.forEach((p) => m.set(p.id, `${p.number} ${p.name}`));
    return m;
  }, []);

  const rowData = useMemo<Asset[]>(
    () => (isPortfolio ? [...assets] : assets.filter((a) => a.projectId === projectId)),
    [isPortfolio, projectId]
  );

  const handleAssetClick = useCallback((asset: Asset) => {
    setSelectedAsset(asset);
  }, []);

  const columnDefs = useMemo(
    () => getAssetColumnDefs(projectMap, handleAssetClick),
    [projectMap, handleAssetClick]
  );

  const projectFilterOptions = useMemo(() => {
    const ids = new Set(assets.map((a) => a.projectId));
    return projects
      .filter((p) => ids.has(p.id))
      .map((p) => `${p.number} ${p.name}`)
      .sort();
  }, []);

  const typeOptions = useMemo(
    () => [...new Set(rowData.map((a) => capitalize(a.type)))].sort(),
    [rowData]
  );
  const tradeOptions = useMemo(
    () => [...new Set(rowData.map((a) => capitalize(a.trade)))].sort(),
    [rowData]
  );
  const statusOptions = useMemo(
    () => [...new Set(rowData.map((a) => STATUS_LABELS[a.status] ?? capitalize(a.status)))].sort(),
    [rowData]
  );
  const conditionOptions = useMemo(
    () => [...new Set(rowData.map((a) => capitalize(a.condition)))].sort(),
    [rowData]
  );

  const getRowId = useCallback(
    (params: { data: Asset }) => params.data.id,
    []
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchText(value);
      gridApiRef.current?.setGridOption("quickFilterText", value);
    },
    []
  );

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

  const handleFilterApply = useCallback(
    async (filterValues: AssetFilterValues) => {
      const api = gridApiRef.current;
      if (!api) return;

      await api.setColumnFilterModel(
        "project",
        filterValues.projects.length > 0 ? { values: filterValues.projects } : null
      );
      await api.setColumnFilterModel(
        "type",
        filterValues.types.length > 0 ? { values: filterValues.types } : null
      );
      await api.setColumnFilterModel(
        "trade",
        filterValues.trades.length > 0 ? { values: filterValues.trades } : null
      );
      await api.setColumnFilterModel(
        "status",
        filterValues.statuses.length > 0 ? { values: filterValues.statuses } : null
      );
      await api.setColumnFilterModel(
        "condition",
        filterValues.conditions.length > 0 ? { values: filterValues.conditions } : null
      );

      api.onFilterChanged();
    },
    []
  );

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

  const sideBar = useMemo(() => false as const, []);

  const projectLabel = project ? `${project.number} ${project.name}` : projectId;

  const breadcrumbs = [
    { label: "Portfolio", href: "/portfolio" },
    ...(projectId ? [{ label: projectLabel, href: `/project/${projectId}` }] : []),
  ];

  const actions = (
    <>
      <Dropdown label="Export" className="b_secondary" variant="secondary">
        <Dropdown.Item item="pdf">PDF</Dropdown.Item>
        <Dropdown.Item item="csv">CSV</Dropdown.Item>
        <Dropdown.Item item="excel">Excel</Dropdown.Item>
      </Dropdown>
      <Button variant="primary" className="b_primary" icon={<Plus />}>Create Asset</Button>
    </>
  );

  const tabs = (
    <Tabs>
      <Tabs.Tab selected={activeTab === "list"} onPress={() => setActiveTab("list")} role="button">
        <Tabs.Link>List</Tabs.Link>
      </Tabs.Tab>
      <Tabs.Tab selected={activeTab === "recycle_bin"} onPress={() => setActiveTab("recycle_bin")} role="button">
        <Tabs.Link>Recycle Bin</Tabs.Link>
      </Tabs.Tab>
    </Tabs>
  );

  const handleGridReady = useCallback(
    (event: { api: GridApi<Asset> }) => {
      gridApiRef.current = event.api;
      if (!isPortfolio) {
        event.api.applyColumnState({
          state: [{ colId: "project", hide: true }],
        });
      }
    },
    [isPortfolio]
  );

  return (
    <ToolPageLayout
      title="Assets"
      icon={<AssetsIcon size="md" />}
      breadcrumbs={breadcrumbs}
      actions={actions}
      tabs={tabs}
    >
      {activeTab === "list" && (
        <SplitViewCard>
          <SplitViewCard.Main>
            <SplitViewCard.Section heading="Assets">
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
                  <SegmentedController>
                    <SegmentedController.Segment
                      selected={viewMode === "rows"}
                      onClick={() => setViewMode("rows")}
                      tooltip="List view"
                    >
                      <ViewRows />
                    </SegmentedController.Segment>
                    <SegmentedController.Segment
                      selected={viewMode === "grid"}
                      onClick={() => setViewMode("grid")}
                      tooltip="Map view"
                    >
                      <Location />
                    </SegmentedController.Segment>
                  </SegmentedController>
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

              {viewMode === "grid" ? (
                <div style={{ padding: 40, textAlign: "center", color: "var(--color-text-secondary)" }}>
                  Map view coming soon.
                </div>
              ) : (
                <GridArea>
                  <AssetFiltersPanel
                    open={filtersOpen}
                    isPortfolio={isPortfolio}
                    projectOptions={projectFilterOptions}
                    typeOptions={typeOptions}
                    tradeOptions={tradeOptions}
                    statusOptions={statusOptions}
                    conditionOptions={conditionOptions}
                    onApply={handleFilterApply}
                    onClear={handleFilterClear}
                  />
                  <div style={{ flex: 1, minWidth: 0, transition: "flex 0.25s ease" }}>
                    <SmartGridWrapper<Asset>
                      id="assets-grid"
                      localStorageKey="owner-prototype-assets-grid"
                      height="100%"
                      rowData={rowData}
                      columnDefs={columnDefs}
                      getRowId={getRowId}
                      groupDisplayType="groupRows"
                      autoGroupColumnDef={{
                        headerName: "Group",
                        minWidth: 200,
                      }}
                      sideBar={sideBar}
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
              )}
            </SplitViewCard.Section>
          </SplitViewCard.Main>
        </SplitViewCard>
      )}

      {activeTab === "recycle_bin" && (
        <SplitViewCard>
          <SplitViewCard.Main>
            <SplitViewCard.Section heading="Recycle Bin">
              <Box padding="xl" style={{ textAlign: "center", color: "var(--color-text-secondary)" }}>
                Recycle Bin coming soon.
              </Box>
            </SplitViewCard.Section>
          </SplitViewCard.Main>
        </SplitViewCard>
      )}
      <AssetDetailTearsheet
        asset={selectedAsset}
        projectName={selectedAsset ? (projectMap.get(selectedAsset.projectId) ?? selectedAsset.projectId) : ""}
        open={selectedAsset !== null}
        onClose={() => setSelectedAsset(null)}
      />
    </ToolPageLayout>
  );
}
