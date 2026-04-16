import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  DetailPage,
  Search,
  Select,
  SegmentedController,
  ToggleButton,
} from "@procore/core-react";
import { Filter, Location, Sliders, ViewRows } from "@procore/core-icons";
import type { GridApi } from "ag-grid-community";
import { SmartGridWrapper } from "@/components/SmartGrid";
import { costColumnDefs } from "@/components/SmartGrid/costColumnDefs";
import CostFiltersPanel, {
  type CostFilterValues,
} from "@/components/SmartGrid/CostFiltersPanel";
import ConfigureColumnsPanel from "@/components/SmartGrid/ConfigureColumnsPanel";
import type { ProjectRow } from "@/data/projects";
import { useHubFilters } from "@/context/HubFilterContext";
import styled from "styled-components";

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

type ViewMode = "rows" | "map";

interface GroupByOption {
  id: "stage" | "program" | "state";
  label: string;
}

const GROUP_BY_OPTIONS: GroupByOption[] = [
  { id: "stage", label: "Stage" },
  { id: "program", label: "Program" },
  { id: "state", label: "State" },
];

export default function CostManagementTableCard() {
  const [viewMode, setViewMode] = useState<ViewMode>("rows");
  const [searchText, setSearchText] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [groupBy, setGroupBy] = useState<GroupByOption | null>(null);
  const gridApiRef = useRef<GridApi<ProjectRow> | null>(null);
  const { filteredProjectRows } = useHubFilters();

  const rowData = useMemo(() => [...filteredProjectRows], [filteredProjectRows]);

  const stageOptions = useMemo(
    () => [...new Set(filteredProjectRows.map((p) => p.stage))].sort(),
    [filteredProjectRows]
  );
  const programOptions = useMemo(
    () => [...new Set(filteredProjectRows.map((p) => p.program))].sort(),
    [filteredProjectRows]
  );
  const stateOptions = useMemo(
    () => [...new Set(filteredProjectRows.map((p) => p.state))].filter(Boolean).sort(),
    [filteredProjectRows]
  );

  const getRowId = useCallback(
    (params: { data: ProjectRow }) => String(params.data.id),
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
    async (filterValues: CostFilterValues) => {
      const api = gridApiRef.current;
      if (!api) return;

      await api.setColumnFilterModel(
        "stage",
        filterValues.stages.length > 0 ? { values: filterValues.stages } : null
      );

      await api.setColumnFilterModel(
        "program",
        filterValues.programs.length > 0 ? { values: filterValues.programs } : null
      );

      await api.setColumnFilterModel(
        "state",
        filterValues.states.length > 0 ? { values: filterValues.states } : null
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

  const sideBar = useMemo(() => false, []);

  return (
    <DetailPage.Card navigationLabel="Cost Management">
      <DetailPage.Section heading="Cost Management">
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
                selected={viewMode === "map"}
                onClick={() => setViewMode("map")}
                tooltip="Map view"
              >
                <Location />
              </SegmentedController.Segment>
            </SegmentedController>
            <ToggleButton
              selected={configOpen}
              icon={<Sliders />}
              onClick={handleConfigToggle}
            >
              Configure
            </ToggleButton>
          </ToolbarRight>
        </ToolbarRow>

        {viewMode === "map" ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-text-secondary)" }}>
            Map view coming soon.
          </div>
        ) : (
          <GridArea>
            <CostFiltersPanel
              open={filtersOpen}
              stageOptions={stageOptions}
              programOptions={programOptions}
              stateOptions={stateOptions}
              onApply={handleFilterApply}
              onClear={handleFilterClear}
            />
            <div style={{ flex: 1, minWidth: 0, transition: "flex 0.25s ease" }}>
              <SmartGridWrapper<ProjectRow>
                id="cost-management-grid"
                localStorageKey="owner-prototype-cost-grid"
                height="100%"
                rowData={rowData}
                columnDefs={costColumnDefs}
                getRowId={getRowId}
                groupDisplayType="groupRows"
                autoGroupColumnDef={{
                  headerName: "Group",
                  minWidth: 200,
                }}
                sideBar={sideBar}
                onGridReady={(event) => {
                  gridApiRef.current = event.api;
                }}
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
      </DetailPage.Section>
    </DetailPage.Card>
  );
}
