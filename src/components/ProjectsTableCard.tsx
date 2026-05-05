import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  DetailPage,
  Search,
  Select,
  ToggleButton,
} from "@procore/core-react";
import SegmentedControl from "@/components/SegmentedControl";
import { Filter, List, Location, Sliders, ViewThumbnails } from "@procore/core-icons";
import type { CellValueChangedEvent, GridApi } from "ag-grid-community";
import { SmartGridWrapper } from "@/components/SmartGrid";
import { portfolioColumnDefs, CONNECTED_DATA_COL_IDS } from "@/components/SmartGrid/portfolioColumnDefs";
import PortfolioFiltersPanel, {
  type PortfolioFilterValues,
} from "@/components/SmartGrid/PortfolioFiltersPanel";
import ConfigureColumnsPanel from "@/components/SmartGrid/ConfigureColumnsPanel";
import type { ProjectRow } from "@/data/projects";
import { PROJECT_MANAGER_NAMES, PROJECT_REGION_NAMES } from "@/data/projects";
import { useHubFilters } from "@/context/HubFilterContext";
import type { PortfolioGridContext } from "@/components/SmartGrid/portfolioGridContext";
import ProjectEditTearsheet, { type TabKey as TearsheetTabKey } from "@/components/ProjectEditTearsheet";
import ProjectTileCard from "@/components/ProjectTileCard";
import styled from "styled-components";
import { useHubLoading } from "@/context/HubLoadingContext";
import ProjectsTableSkeleton from "@/components/skeletons/ProjectsTableSkeleton";
import ProjectTileGridSkeleton from "@/components/skeletons/ProjectTileGridSkeleton";
import PortfolioMapView from "@/components/PortfolioMapView";

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

const TileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 4px 0 16px;
  max-height: 640px;
  overflow-y: auto;
`;

type ViewMode = "rows" | "tiles" | "map";

interface GroupByOption {
  id: "stage" | "program" | "priority" | "region" | "projectManager" | "city" | "state";
  label: string;
}

const GROUP_BY_OPTIONS: GroupByOption[] = [
  { id: "stage",          label: "Stage"           },
  { id: "program",        label: "Program"         },
  { id: "priority",       label: "Priority"        },
  { id: "region",         label: "Region"          },
  { id: "projectManager", label: "Project Manager" },
  { id: "city",           label: "City"            },
  { id: "state",          label: "State"           },
];

export default function ProjectsTableCard() {
  const { isLoading } = useHubLoading();
  const [viewMode, setViewMode] = useState<ViewMode>("rows");
  const [searchText, setSearchText] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [groupBys, setGroupBys] = useState<GroupByOption[]>([]);
  const gridApiRef = useRef<GridApi<ProjectRow> | null>(null);
  const [gridApi, setGridApi] = useState<GridApi<ProjectRow> | null>(null);
  const [editProject, setEditProject] = useState<ProjectRow | null>(null);
  const [editProjectTab, setEditProjectTab] = useState<TearsheetTabKey>("General");
  const { filteredProjectRows, patchProjectRow } = useHubFilters();

  const gridContext = useMemo<PortfolioGridContext>(
    () => ({
      onEditProject: (row) => { setEditProjectTab("General"); setEditProject(row); },
      onOpenConnectionTab: (row) => { setEditProjectTab("Connection"); setEditProject(row); },
      onOpenHealthTab: (row) => { setEditProjectTab("Health"); setEditProject(row); },
    }),
    []
  );

  const rowData = useMemo(() => [...filteredProjectRows], [filteredProjectRows]);

  const cityOptions = useMemo(
    () => [...new Set(filteredProjectRows.map((r) => r.city).filter(Boolean))].sort(),
    [filteredProjectRows]
  );
  const stateOptions = useMemo(
    () => [...new Set(filteredProjectRows.map((r) => r.state).filter(Boolean))].sort(),
    [filteredProjectRows]
  );
  // Region and PM options come from the full static lists (not filtered) so all values are always selectable
  const regionOptions = useMemo(() => [...PROJECT_REGION_NAMES].sort(), []);
  const projectManagerOptions = useMemo(() => [...PROJECT_MANAGER_NAMES].sort(), []);

  const getRowId = useCallback(
    (params: { data: ProjectRow }) => String(params.data.id),
    []
  );

  const onCellValueChanged = useCallback((event: CellValueChangedEvent<ProjectRow>) => {
    console.log("Cell edit:", {
      field: event.colDef.field ?? event.colDef.colId,
      oldValue: event.oldValue,
      newValue: event.newValue,
      rowId: event.data?.id,
    });
  }, []);

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
    async (filterValues: PortfolioFilterValues) => {
      const api = gridApiRef.current;
      if (!api) return;

      // Set-based filters
      const setFilter = async (colId: string, values: string[]) =>
        api.setColumnFilterModel(colId, values.length > 0 ? { values } : null);

      await setFilter("program",        filterValues.programs);
      await setFilter("stage",          filterValues.stages);
      await setFilter("priority",       filterValues.priorities);
      await setFilter("region",         filterValues.regions);
      await setFilter("projectManager", filterValues.projectManagers);
      await setFilter("city",           filterValues.cities);
      await setFilter("state",          filterValues.states);

      // Date range filters
      const applyDateFilter = async (colId: string, from: string, to: string) => {
        if (!from && !to) {
          await api.setColumnFilterModel(colId, null);
          return;
        }
        const model: Record<string, unknown> = { filterType: "date" };
        if (from && to) {
          model.type = "inRange";
          model.dateFrom = from;
          model.dateTo = to;
        } else if (from) {
          model.type = "greaterThan";
          model.dateFrom = from;
        } else {
          model.type = "lessThan";
          model.dateFrom = to;
        }
        await api.setColumnFilterModel(colId, model);
      };

      await applyDateFilter("startDate", filterValues.startDateFrom, filterValues.startDateTo);
      await applyDateFilter("endDate",   filterValues.endDateFrom,   filterValues.endDateTo);

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

  /** Apply an ordered list of groups to the grid */
  const applyGroupsToGrid = useCallback((next: GroupByOption[], prev: GroupByOption[]) => {
    const api = gridApiRef.current;
    if (!api) return;
    const nextIds = new Set(next.map((g) => g.id));
    api.applyColumnState({
      state: [
        ...next.map((g, i) => ({ colId: g.id, rowGroup: true, rowGroupIndex: i, hide: true })),
        ...prev
          .filter((g) => !nextIds.has(g.id))
          .map((g) => ({ colId: g.id, rowGroup: false, rowGroupIndex: null, hide: false })),
      ],
      defaultState: { rowGroup: false, rowGroupIndex: null },
    });
  }, []);

  /** Toggle a single group-by option on/off */
  const handleGroupBySelect = useCallback(
    (selection: { item: unknown }) => {
      const opt = selection.item as GroupByOption;
      const alreadySelected = groupBys.some((g) => g.id === opt.id);
      const next = alreadySelected
        ? groupBys.filter((g) => g.id !== opt.id)
        : [...groupBys, opt];
      setGroupBys(next);
      applyGroupsToGrid(next, groupBys);
    },
    [groupBys, applyGroupsToGrid]
  );

  const handleGroupByClear = useCallback(() => {
    const prev = groupBys;
    setGroupBys([]);
    applyGroupsToGrid([], prev);
  }, [groupBys, applyGroupsToGrid]);

  const sideBar = useMemo(() => false, []);

  if (isLoading) {
    return (
      <DetailPage.Card navigationLabel="Projects">
        <DetailPage.Section heading="Portfolio">
          {viewMode === "tiles" ? (
            <ProjectTileGridSkeleton />
          ) : viewMode === "map" ? (
            <ProjectsTableSkeleton />
          ) : (
            <ProjectsTableSkeleton />
          )}
        </DetailPage.Section>
      </DetailPage.Card>
    );
  }

  return (
    <DetailPage.Card navigationLabel="Projects">
      <DetailPage.Section heading="Portfolio">
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
            <div style={{ width: 200 }}>
              <Select
                placeholder="Group by"
                label={groupBys.length > 0 ? `Group by: ${groupBys.map((g) => g.label).join(", ")}` : undefined}
                onSelect={handleGroupBySelect}
                onClear={groupBys.length > 0 ? handleGroupByClear : undefined}
                block
              >
                {GROUP_BY_OPTIONS.map((opt) => (
                  <Select.Option
                    key={opt.id}
                    value={opt}
                    selected={groupBys.some((g) => g.id === opt.id)}
                  >
                    {opt.label}
                  </Select.Option>
                ))}
              </Select>
            </div>
            <SegmentedControl>
              <SegmentedControl.Segment
                selected={viewMode === "rows"}
                onClick={() => setViewMode("rows")}
                icon={<List />}
                tooltip="List view"
              />
              <SegmentedControl.Segment
                selected={viewMode === "tiles"}
                onClick={() => setViewMode("tiles")}
                icon={<ViewThumbnails />}
                tooltip="Tile view"
              />
              <SegmentedControl.Segment
                selected={viewMode === "map"}
                onClick={() => setViewMode("map")}
                icon={<Location />}
                tooltip="Map view"
              />
            </SegmentedControl>
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

        {viewMode === "map" ? (
          <PortfolioMapView
            projects={rowData}
            onOpenProject={(row, tab) => {
              setEditProjectTab(tab ?? "General");
              setEditProject(row);
            }}
          />
        ) : viewMode === "tiles" ? (
          <TileGrid>
            {rowData.map((project) => (
              <ProjectTileCard
                key={project.id}
                project={project}
                onOpen={(row, tab) => {
                  setEditProjectTab(tab ?? "General");
                  setEditProject(row);
                }}
              />
            ))}
          </TileGrid>
        ) : (
          <GridArea>
            <PortfolioFiltersPanel
              open={filtersOpen}
              cityOptions={cityOptions}
              stateOptions={stateOptions}
              regionOptions={regionOptions}
              projectManagerOptions={projectManagerOptions}
              onApply={handleFilterApply}
              onClear={handleFilterClear}
            />
            <div style={{ flex: 1, minWidth: 0, transition: "flex 0.25s ease" }}>
              <SmartGridWrapper<ProjectRow>
                id="portfolio-grid"
                localStorageKey="owner-prototype-portfolio-grid"
                height="100%"
                rowData={rowData}
                columnDefs={portfolioColumnDefs}
                context={gridContext}
                getRowId={getRowId}
                groupDisplayType="groupRows"
                autoGroupColumnDef={{
                  headerName: "Project",
                  minWidth: 200,
                }}
                sideBar={sideBar}
                onCellValueChanged={onCellValueChanged}
                onGridReady={(event) => {
                  gridApiRef.current = event.api;
                  setGridApi(event.api);
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
              gridApi={gridApi}
              onClose={() => setConfigOpen(false)}
              connectedColIds={CONNECTED_DATA_COL_IDS}
            />
          </GridArea>
        )}
        <ProjectEditTearsheet
          project={editProject}
          open={editProject !== null}
          defaultTab={editProjectTab}
          onClose={() => setEditProject(null)}
          onSave={(id, patch) => {
            patchProjectRow(id, patch);
          }}
        />
      </DetailPage.Section>
    </DetailPage.Card>
  );
}
