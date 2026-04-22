import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  DetailPage,
  MultiSelect,
  Search,
  SegmentedController,
  ToggleButton,
} from "@procore/core-react";
import { ArrowDown, ArrowUp, Clear, Filter, Location, Sliders, ViewRows } from "@procore/core-icons";
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
import ProjectEditTearsheet from "@/components/ProjectEditTearsheet";
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

const GroupChipsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 0 8px;
  flex-wrap: wrap;
`;

const GroupChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border-default);
  border-radius: 20px;
  padding: 2px 6px 2px 10px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
`;

const ChipLabel = styled.span`
  font-size: 11px;
  color: var(--color-text-secondary);
  margin-right: 2px;
`;

const ChipIconBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 1px;
  display: flex;
  align-items: center;
  color: var(--color-text-secondary);
  border-radius: 50%;
  &:hover { background: var(--color-surface-tertiary); color: var(--color-text-primary); }
`;

const ChipSeparator = styled.span`
  font-size: 14px;
  color: var(--color-text-secondary);
  user-select: none;
  margin: 0 2px;
`;

const ClearAllBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  color: var(--color-orange-50, #f26925);
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 4px;
  &:hover { text-decoration: underline; }
`;

type ViewMode = "rows" | "map";

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
  const [viewMode, setViewMode] = useState<ViewMode>("rows");
  const [searchText, setSearchText] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [groupBys, setGroupBys] = useState<GroupByOption[]>([]);
  const gridApiRef = useRef<GridApi<ProjectRow> | null>(null);
  const [gridApi, setGridApi] = useState<GridApi<ProjectRow> | null>(null);
  const [editProject, setEditProject] = useState<ProjectRow | null>(null);
  const [editProjectTab, setEditProjectTab] = useState<"General" | "Connection">("General");
  const { filteredProjectRows, patchProjectRow } = useHubFilters();

  const gridContext = useMemo<PortfolioGridContext>(
    () => ({
      onEditProject: (row) => { setEditProjectTab("General"); setEditProject(row); },
      onOpenConnectionTab: (row) => { setEditProjectTab("Connection"); setEditProject(row); },
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
    const prevIds = new Set(prev.map((g) => g.id));
    api.applyColumnState({
      state: [
        // Apply new groups in order (hide the column so it doesn't appear as a regular column)
        ...next.map((g, i) => ({ colId: g.id, rowGroup: true, rowGroupIndex: i, hide: true })),
        // Restore columns that were previously grouped but are no longer
        ...prev
          .filter((g) => !nextIds.has(g.id))
          .map((g) => ({ colId: g.id, rowGroup: false, rowGroupIndex: null, hide: false })),
      ],
      defaultState: { rowGroup: false, rowGroupIndex: null },
    });
  }, []);

  /** MultiSelect onChange — preserves existing order, appends new picks at the end */
  const handleGroupByChange = useCallback(
    (selected: GroupByOption[]) => {
      const selectedIds = new Set(selected.map((g) => g.id));
      const kept = groupBys.filter((g) => selectedIds.has(g.id));
      const keptIds = new Set(kept.map((g) => g.id));
      const added = selected.filter((g) => !keptIds.has(g.id));
      const next = [...kept, ...added];
      setGroupBys(next);
      applyGroupsToGrid(next, groupBys);
    },
    [groupBys, applyGroupsToGrid]
  );

  /** Remove a single level from the active groupings */
  const handleRemoveGroupBy = useCallback(
    (id: string) => {
      const next = groupBys.filter((g) => g.id !== id);
      setGroupBys(next);
      applyGroupsToGrid(next, groupBys);
    },
    [groupBys, applyGroupsToGrid]
  );

  /** Move a group level up or down in the nesting order */
  const handleReorderGroupBy = useCallback(
    (id: string, dir: "up" | "down") => {
      const idx = groupBys.findIndex((g) => g.id === id);
      if (idx < 0) return;
      const next = [...groupBys];
      const swap = dir === "up" ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= next.length) return;
      [next[idx], next[swap]] = [next[swap], next[idx]];
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
            <div style={{ width: 226 }}>
              <MultiSelect
                options={GROUP_BY_OPTIONS}
                value={groupBys}
                onChange={handleGroupByChange}
                getId={(o) => o.id}
                getLabel={(o) => o.label}
                placeholder="Group by"
                block
              />
            </div>
            <SegmentedController className="b_radiogroup">
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
              className="b_toggle"
              icon={<Sliders />}
              onClick={handleConfigToggle}
            >
              Configure
            </ToggleButton>
          </ToolbarRight>
        </ToolbarRow>

        {groupBys.length > 0 && (
          <GroupChipsRow>
            <ChipLabel>Grouped by:</ChipLabel>
            {groupBys.map((g, i) => (
              <React.Fragment key={g.id}>
                {i > 0 && <ChipSeparator>›</ChipSeparator>}
                <GroupChip>
                  {g.label}
                  <ChipIconBtn
                    title="Move up"
                    onClick={() => handleReorderGroupBy(g.id, "up")}
                    disabled={i === 0}
                    style={{ opacity: i === 0 ? 0.3 : 1 }}
                  >
                    <ArrowUp size="sm" />
                  </ChipIconBtn>
                  <ChipIconBtn
                    title="Move down"
                    onClick={() => handleReorderGroupBy(g.id, "down")}
                    disabled={i === groupBys.length - 1}
                    style={{ opacity: i === groupBys.length - 1 ? 0.3 : 1 }}
                  >
                    <ArrowDown size="sm" />
                  </ChipIconBtn>
                  <ChipIconBtn title="Remove" onClick={() => handleRemoveGroupBy(g.id)}>
                    <Clear size="sm" />
                  </ChipIconBtn>
                </GroupChip>
              </React.Fragment>
            ))}
            <ClearAllBtn onClick={handleGroupByClear}>Clear all</ClearAllBtn>
          </GroupChipsRow>
        )}

        {viewMode === "map" ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-text-secondary)" }}>
            Map view coming soon.
          </div>
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
