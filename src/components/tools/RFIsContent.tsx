import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Dropdown,
  Search,
  Select,
  SplitViewCard,
  Tabs,
  ToggleButton,
} from "@procore/core-react";
import {
  QuestionMark as RFIsIcon,
  Filter,
  Plus,
  Sliders,
} from "@procore/core-icons";
import type { GridApi } from "ag-grid-community";
import { SmartGridWrapper } from "@/components/SmartGrid";
import { getRfiColumnDefs } from "@/components/SmartGrid/rfiColumnDefs";
import RfiFiltersPanel, {
  type RfiFilterValues,
} from "@/components/SmartGrid/RfiFiltersPanel";
import ConfigureColumnsPanel from "@/components/SmartGrid/ConfigureColumnsPanel";
import { rfis } from "@/data/seed/rfis";
import { projects } from "@/data/seed/projects";
import type { Rfi } from "@/types/rfis";
import styled from "styled-components";
import ToolPageLayout from "@/components/tools/ToolPageLayout";
import RfiDetailTearsheet from "@/components/tools/RfiDetailTearsheet";

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

type TabKey = "list" | "draft";

interface GroupByOption {
  id: "status" | "rfiManager" | "responsibleContractor" | "ballInCourt" | "location";
  label: string;
}

const GROUP_BY_OPTIONS: GroupByOption[] = [
  { id: "status", label: "Status" },
  { id: "rfiManager", label: "RFI Manager" },
  { id: "responsibleContractor", label: "Responsible Contractor" },
  { id: "ballInCourt", label: "Ball In Court" },
  { id: "location", label: "Location" },
];

interface RFIsContentProps {
  projectId: string;
}

export default function RFIsContent({ projectId }: RFIsContentProps) {
  const isPortfolio = projectId === "";
  const [activeTab, setActiveTab] = useState<TabKey>("list");
  const [searchText, setSearchText] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [groupBy, setGroupBy] = useState<GroupByOption | null>(null);
  const [selectedRfi, setSelectedRfi] = useState<Rfi | null>(null);
  const gridApiRef = useRef<GridApi<Rfi> | null>(null);

  const project = useMemo(
    () => projects.find((p) => p.id === projectId),
    [projectId]
  );

  const projectMap = useMemo(() => {
    const m = new Map<string, string>();
    projects.forEach((p) => m.set(p.id, `${p.number} ${p.name}`));
    return m;
  }, []);

  const allProjectRfis = useMemo(
    () => (isPortfolio ? [...rfis] : rfis.filter((r) => r.projectId === projectId)),
    [isPortfolio, projectId]
  );

  const rowData = useMemo(
    () => activeTab === "draft"
      ? allProjectRfis.filter((r) => r.status === "Draft")
      : allProjectRfis,
    [allProjectRfis, activeTab]
  );

  const handleRfiClick = useCallback((rfi: Rfi) => {
    setSelectedRfi(rfi);
  }, []);

  const columnDefs = useMemo(
    () => getRfiColumnDefs(projectMap, handleRfiClick),
    [projectMap, handleRfiClick]
  );

  const projectFilterOptions = useMemo(() => {
    const ids = new Set(rfis.map((r) => r.projectId));
    return projects
      .filter((p) => ids.has(p.id))
      .map((p) => `${p.number} ${p.name}`)
      .sort();
  }, []);

  const statusOptions = useMemo(
    () => [...new Set(rowData.map((r) => r.status))].sort(),
    [rowData]
  );
  const rfiManagerOptions = useMemo(
    () => [...new Set(rowData.map((r) => r.rfiManager).filter(Boolean) as string[])].sort(),
    [rowData]
  );
  const contractorOptions = useMemo(
    () => [...new Set(rowData.map((r) => r.responsibleContractor).filter(Boolean) as string[])].sort(),
    [rowData]
  );
  const ballInCourtOptions = useMemo(
    () => [...new Set(rowData.map((r) => r.ballInCourt).filter(Boolean) as string[])].sort(),
    [rowData]
  );

  const getRowId = useCallback(
    (params: { data: Rfi }) => params.data.id,
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
    async (filterValues: RfiFilterValues) => {
      const api = gridApiRef.current;
      if (!api) return;

      await api.setColumnFilterModel(
        "project",
        filterValues.projects.length > 0 ? { values: filterValues.projects } : null
      );
      await api.setColumnFilterModel(
        "status",
        filterValues.statuses.length > 0 ? { values: filterValues.statuses } : null
      );
      await api.setColumnFilterModel(
        "rfiManager",
        filterValues.rfiManagers.length > 0 ? { values: filterValues.rfiManagers } : null
      );
      await api.setColumnFilterModel(
        "responsibleContractor",
        filterValues.contractors.length > 0 ? { values: filterValues.contractors } : null
      );
      await api.setColumnFilterModel(
        "ballInCourt",
        filterValues.ballInCourt.length > 0 ? { values: filterValues.ballInCourt } : null
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

  const draftCount = allProjectRfis.filter((r) => r.status === "Draft").length;

  const actions = (
    <>
      <Dropdown label="Export" className="b_secondary" variant="secondary">
        <Dropdown.Item item="pdf">PDF</Dropdown.Item>
        <Dropdown.Item item="csv">CSV</Dropdown.Item>
        <Dropdown.Item item="excel">Excel</Dropdown.Item>
      </Dropdown>
      <Button variant="primary" className="b_primary" icon={<Plus />}>Create RFI</Button>
    </>
  );

  const tabs = (
    <Tabs>
      <Tabs.Tab selected={activeTab === "list"} onPress={() => setActiveTab("list")} role="button">
        <Tabs.Link>List</Tabs.Link>
      </Tabs.Tab>
      <Tabs.Tab selected={activeTab === "draft"} onPress={() => setActiveTab("draft")} role="button">
        <Tabs.Link>Drafts ({draftCount})</Tabs.Link>
      </Tabs.Tab>
    </Tabs>
  );

  const handleGridReady = useCallback(
    (event: { api: GridApi<Rfi> }) => {
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
      title="RFIs"
      icon={<RFIsIcon size="md" />}
      actions={actions}
      tabs={tabs}
    >
      {activeTab === "list" || activeTab === "draft" ? (
        <SplitViewCard>
          <SplitViewCard.Main>
            <SplitViewCard.Section heading={activeTab === "draft" ? `Drafts (${draftCount})` : `RFIs (${rowData.length})`}>
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
                <RfiFiltersPanel
                  open={filtersOpen}
                  isPortfolio={isPortfolio}
                  projectOptions={projectFilterOptions}
                  statusOptions={statusOptions}
                  rfiManagerOptions={rfiManagerOptions}
                  contractorOptions={contractorOptions}
                  ballInCourtOptions={ballInCourtOptions}
                  onApply={handleFilterApply}
                  onClear={handleFilterClear}
                />
                <div style={{ flex: 1, minWidth: 0, transition: "flex 0.25s ease" }}>
                  <SmartGridWrapper<Rfi>
                    id="rfis-grid"
                    localStorageKey="owner-prototype-rfis-grid"
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
            </SplitViewCard.Section>
          </SplitViewCard.Main>
        </SplitViewCard>
      ) : null}
      <RfiDetailTearsheet
        rfi={selectedRfi}
        projectName={selectedRfi ? (projectMap.get(selectedRfi.projectId) ?? selectedRfi.projectId) : ""}
        open={selectedRfi !== null}
        onClose={() => setSelectedRfi(null)}
      />
    </ToolPageLayout>
  );
}
