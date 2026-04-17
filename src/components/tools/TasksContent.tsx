import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Button,
  Dropdown,
  Search,
  SplitViewCard,
  Tabs,
  ToggleButton,
} from "@procore/core-react";
import {
  Check as TasksIcon,
  Filter,
  Plus,
  Sliders,
} from "@procore/core-icons";
import type { GridApi } from "ag-grid-community";
import { SmartGridWrapper } from "@/components/SmartGrid";
import { buildTaskColumnDefs, CATEGORY_OPTIONS } from "@/components/SmartGrid/taskColumnDefs";
import TaskFiltersPanel, {
  type TaskFilterValues,
} from "@/components/SmartGrid/TaskFiltersPanel";
import ConfigureColumnsPanel from "@/components/SmartGrid/ConfigureColumnsPanel";
import { tasks } from "@/data/seed/tasks";
import { projects } from "@/data/seed/projects";
import type { Task, TaskStatus } from "@/types/tasks";
import styled from "styled-components";
import ToolPageLayout from "@/components/tools/ToolPageLayout";

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

const STATUS_LABELS: Record<TaskStatus, string> = {
  initiated: "Initiated",
  in_progress: "In Progress",
  ready_for_review: "Ready for Review",
  closed: "Closed",
  void: "Void",
};

const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([id, label]) => ({
  id,
  label,
}));

const CATEGORY_FILTER_OPTIONS = CATEGORY_OPTIONS.map((c) => ({
  id: c,
  label: c,
}));

type TabKey = "list" | "my_tasks";

interface TasksContentProps {
  projectId: string;
}

export default function TasksContent({ projectId }: TasksContentProps) {
  const isPortfolio = projectId === "";
  const [activeTab, setActiveTab] = useState<TabKey>("list");
  const [searchText, setSearchText] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const gridApiRef = useRef<GridApi<Task> | null>(null);

  const project = useMemo(
    () => projects.find((p) => p.id === projectId),
    [projectId]
  );

  const projectMap = useMemo(() => {
    const m = new Map<string, string>();
    projects.forEach((p) => m.set(p.id, `${p.number} ${p.name}`));
    return m;
  }, []);

  const rowData = useMemo<Task[]>(
    () =>
      isPortfolio
        ? [...tasks]
        : tasks.filter((t) => t.projectId === projectId),
    [isPortfolio, projectId]
  );

  const columnDefs = useMemo(
    () => buildTaskColumnDefs(projectMap, isPortfolio),
    [projectMap, isPortfolio]
  );

  const projectFilterOptions = useMemo(() => {
    const ids = new Set(tasks.map((t) => t.projectId).filter(Boolean));
    return projects
      .filter((p) => ids.has(p.id))
      .map((p) => ({ id: p.id, label: `${p.number} ${p.name}` }));
  }, []);

  const getRowId = useCallback(
    (params: { data: Task }) => params.data.id,
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
    async (filterValues: TaskFilterValues) => {
      const api = gridApiRef.current;
      if (!api) return;

      if (isPortfolio) {
        await api.setColumnFilterModel(
          "project",
          filterValues.projects.length > 0
            ? { values: filterValues.projects.map((id) => projectMap.get(id) ?? id) }
            : null
        );
      }

      await api.setColumnFilterModel(
        "status",
        filterValues.statuses.length > 0
          ? { values: filterValues.statuses }
          : null
      );

      await api.setColumnFilterModel(
        "category",
        filterValues.categories.length > 0
          ? { values: filterValues.categories }
          : null
      );

      api.onFilterChanged();
    },
    [isPortfolio, projectMap]
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

  const sideBar = useMemo(() => false, []);

  const projectLabel = project
    ? `${project.number} ${project.name}`
    : projectId;

  const breadcrumbs = [
    { label: "Portfolio", href: "/portfolio" },
    ...(projectId
      ? [{ label: projectLabel, href: `/project/${projectId}` }]
      : []),
  ];

  const actions = (
    <>
      <Dropdown label="Export" variant="secondary">
        <Dropdown.Item item="pdf">PDF</Dropdown.Item>
        <Dropdown.Item item="csv">CSV</Dropdown.Item>
        <Dropdown.Item item="excel">Excel</Dropdown.Item>
      </Dropdown>
      <Button variant="primary" icon={<Plus />}>
        Add Task
      </Button>
    </>
  );

  const tabs = (
    <Tabs>
      <Tabs.Tab
        selected={activeTab === "list"}
        onPress={() => setActiveTab("list")}
        role="button"
      >
        <Tabs.Link>List</Tabs.Link>
      </Tabs.Tab>
      <Tabs.Tab
        selected={activeTab === "my_tasks"}
        onPress={() => setActiveTab("my_tasks")}
        role="button"
      >
        <Tabs.Link>My Tasks</Tabs.Link>
      </Tabs.Tab>
    </Tabs>
  );

  return (
    <ToolPageLayout
      title="Tasks"
      icon={<TasksIcon size="md" />}
      actions={actions}
      tabs={tabs}
    >
      {activeTab === "list" && (
        <SplitViewCard>
          <SplitViewCard.Main>
            <SplitViewCard.Section heading="Tasks">
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
                  <ToggleButton
                    selected={configOpen}
                    icon={<Sliders />}
                    onClick={handleConfigToggle}
                  >
                    Configure
                  </ToggleButton>
                </ToolbarRight>
              </ToolbarRow>

              <GridArea>
                <TaskFiltersPanel
                  open={filtersOpen}
                  isPortfolio={isPortfolio}
                  projectOptions={projectFilterOptions}
                  statusOptions={STATUS_OPTIONS}
                  categoryOptions={CATEGORY_FILTER_OPTIONS}
                  onApply={handleFilterApply}
                  onClear={handleFilterClear}
                />
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    transition: "flex 0.25s ease",
                  }}
                >
                  <SmartGridWrapper<Task>
                    id="tasks-grid"
                    localStorageKey="owner-prototype-tasks-grid"
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
                    onGridReady={(event) => {
                      gridApiRef.current = event.api;
                    }}
                    statusBar={{
                      statusPanels: [
                        {
                          statusPanel:
                            "agTotalAndFilteredRowCountComponent",
                          align: "left",
                        },
                        {
                          statusPanel: "agSelectedRowCountComponent",
                          align: "left",
                        },
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
      )}

      {activeTab === "my_tasks" && (
        <SplitViewCard>
          <SplitViewCard.Main>
            <SplitViewCard.Section heading="My Tasks">
              <div
                style={{
                  padding: "24px",
                  textAlign: "center",
                  color: "var(--color-text-secondary)",
                }}
              >
                My Tasks coming soon.
              </div>
            </SplitViewCard.Section>
          </SplitViewCard.Main>
        </SplitViewCard>
      )}
    </ToolPageLayout>
  );
}
