import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Button,
  Dropdown,
  Pill,
  Search,
  Select,
  SplitViewCard,
  Tabs,
} from "@procore/core-react";
import {
  Calendar as ScheduleIcon,
  Plus,
} from "@procore/core-icons";
import type { ColDef, GridApi, ICellRendererParams } from "ag-grid-community";
import styled from "styled-components";
import { SmartGridWrapper } from "@/components/SmartGrid";
import CostActionsCellRenderer from "@/components/SmartGrid/CostActionsCellRenderer";
import { scheduleEntries } from "@/data/seed/schedule";
import { projects } from "@/data/seed/projects";
import type { ScheduleEntry, ScheduleItem, Milestone, ScheduleStatus } from "@/types/schedule";
import ToolPageLayout from "@/components/tools/ToolPageLayout";
import { formatDateMMDDYYYY } from "@/utils/date";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<ScheduleStatus, "green" | "yellow" | "red" | "gray" | "blue"> = {
  not_started: "gray",
  in_progress: "blue",
  on_hold: "yellow",
  delayed: "red",
  complete: "green",
};

const STATUS_LABELS: Record<ScheduleStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  on_hold: "On Hold",
  delayed: "Delayed",
  complete: "Complete",
};

// ─── Styled components ────────────────────────────────────────────────────────

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

const GridArea = styled.div`
  display: flex;
  height: 640px;
  border: 1px solid var(--color-border-default);
  overflow: hidden;
`;

const ProgressBarWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ProgressBarOuter = styled.div`
  flex: 1;
  height: 6px;
  background: var(--color-border-default);
  border-radius: 3px;
  overflow: hidden;
  min-width: 60px;
`;

const ProgressBarInner = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${({ $pct }) => $pct}%;
  background: var(--color-text-link);
  border-radius: 3px;
`;

const ProgressLabel = styled.span`
  font-size: 13px;
  color: var(--color-text-secondary);
  white-space: nowrap;
`;

// ─── Cell renderers ───────────────────────────────────────────────────────────

function ScheduleStatusPillRenderer(params: ICellRendererParams) {
  const status = params.value as ScheduleStatus | undefined;
  if (!status) return null;
  return <Pill color={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Pill>;
}

function PercentCompleteRenderer(params: ICellRendererParams<ScheduleItem>) {
  if (!params.data) return null;
  const pct = params.data.percentComplete;
  return (
    <ProgressBarWrap>
      <ProgressBarOuter>
        <ProgressBarInner $pct={pct} />
      </ProgressBarOuter>
      <ProgressLabel>{pct}%</ProgressLabel>
    </ProgressBarWrap>
  );
}

function ActualDateRenderer(params: ICellRendererParams<Milestone>) {
  if (!params.data) return null;
  const d = params.data.actualMilestoneDate;
  if (d) {
    return <span style={{ color: "var(--color-icon-success)" }}>{formatDateMMDDYYYY(d)}</span>;
  }
  return <span style={{ color: "var(--color-text-secondary)" }}>—</span>;
}

// ─── Component ────────────────────────────────────────────────────────────────

type TabKey = "schedule" | "milestones";

interface ScheduleContentProps {
  projectId: string;
}

export default function ScheduleContent({ projectId }: ScheduleContentProps) {
  const isPortfolio = projectId === "";
  const [activeTab, setActiveTab] = useState<TabKey>("schedule");
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const gridApiRef = useRef<GridApi | null>(null);

  const projectMap = useMemo(() => {
    const m = new Map<string, string>();
    projects.forEach((p) => m.set(p.id, `${p.number} ${p.name}`));
    return m;
  }, []);
  const projectOptions = useMemo(() => {
    const ids = new Set(scheduleEntries.map((e) => e.projectId));
    return projects.filter((p) => ids.has(p.id));
  }, []);

  const projectEntries = useMemo<ScheduleEntry[]>(() => {
    let base = isPortfolio
      ? [...scheduleEntries]
      : scheduleEntries.filter((e) => e.projectId === projectId);
    if (isPortfolio && selectedProjectIds.length > 0) {
      base = base.filter((e) => selectedProjectIds.includes(e.projectId));
    }
    return base;
  }, [projectId, isPortfolio, selectedProjectIds]);

  const scheduleItems = useMemo(
    () => projectEntries.filter((e): e is ScheduleItem => e.type === "item"),
    [projectEntries]
  );
  const milestones = useMemo(
    () => projectEntries.filter((e): e is Milestone => e.type === "milestone"),
    [projectEntries]
  );

  const getScheduleRowId = useCallback(
    (params: { data: ScheduleItem }) => params.data.id,
    []
  );

  const getMilestoneRowId = useCallback(
    (params: { data: Milestone }) => params.data.id,
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

  const scheduleColumnDefs = useMemo<ColDef<ScheduleItem>[]>(() => {
    const cols: ColDef<ScheduleItem>[] = [];

    if (isPortfolio) {
      cols.push({
        colId: "project",
        headerName: "Project",
        minWidth: 180,
        filter: "agSetColumnFilter",
        valueGetter: (params) =>
          params.data ? (projectMap.get(params.data.projectId) ?? params.data.projectId) : "",
        cellStyle: { color: "var(--color-text-link)", cursor: "pointer" },
      });
    }

    cols.push(
      {
        field: "wbs",
        headerName: "WBS",
        width: 100,
        filter: "agTextColumnFilter",
        cellStyle: { color: "var(--color-text-secondary)", fontSize: "13px" },
      },
      {
        field: "name",
        headerName: "Name",
        minWidth: 220,
        filter: "agTextColumnFilter",
        cellStyle: { fontWeight: 600, color: "var(--color-text-link)", cursor: "pointer" },
      },
      {
        field: "status",
        headerName: "Status",
        filter: "agSetColumnFilter",
        cellRenderer: ScheduleStatusPillRenderer,
      },
      {
        colId: "percentComplete",
        headerName: "% Complete",
        minWidth: 150,
        filter: "agNumberColumnFilter",
        valueGetter: (params) => params.data?.percentComplete ?? 0,
        cellRenderer: PercentCompleteRenderer,
      },
      {
        field: "startDate",
        headerName: "Start Date",
        filter: "agDateColumnFilter",
        valueFormatter: (params) => formatDateMMDDYYYY(params.value),
      },
      {
        field: "finishDate",
        headerName: "Finish Date",
        filter: "agDateColumnFilter",
        valueFormatter: (params) => formatDateMMDDYYYY(params.value),
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
      }
    );

    return cols;
  }, [isPortfolio, projectMap]);

  const milestoneColumnDefs = useMemo<ColDef<Milestone>[]>(() => {
    const cols: ColDef<Milestone>[] = [];

    if (isPortfolio) {
      cols.push({
        colId: "project",
        headerName: "Project",
        minWidth: 180,
        filter: "agSetColumnFilter",
        valueGetter: (params) =>
          params.data ? (projectMap.get(params.data.projectId) ?? params.data.projectId) : "",
        cellStyle: { color: "var(--color-text-link)", cursor: "pointer" },
      });
    }

    cols.push(
      {
        field: "wbs",
        headerName: "WBS",
        width: 100,
        filter: "agTextColumnFilter",
        cellStyle: { color: "var(--color-text-secondary)", fontSize: "13px" },
      },
      {
        field: "name",
        headerName: "Name",
        minWidth: 220,
        filter: "agTextColumnFilter",
        cellStyle: { fontWeight: 600, color: "var(--color-text-link)", cursor: "pointer" },
      },
      {
        field: "milestoneDate",
        headerName: "Planned Date",
        filter: "agDateColumnFilter",
        valueFormatter: (params) => formatDateMMDDYYYY(params.value),
      },
      {
        colId: "actualDate",
        headerName: "Actual Date",
        filter: "agDateColumnFilter",
        valueGetter: (params) => params.data?.actualMilestoneDate ?? null,
        cellRenderer: ActualDateRenderer,
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
      }
    );

    return cols;
  }, [isPortfolio, projectMap]);


  const actions = (
    <>
      <Dropdown label="Export" variant="secondary">
        <Dropdown.Item item="csv">CSV</Dropdown.Item>
        <Dropdown.Item item="excel">Excel</Dropdown.Item>
      </Dropdown>
      <Button variant="primary" icon={<Plus />}>Add Item</Button>
    </>
  );

  const tabs = (
    <Tabs>
      <Tabs.Tab selected={activeTab === "schedule"} onPress={() => setActiveTab("schedule")} role="button">
        <Tabs.Link>Schedule</Tabs.Link>
      </Tabs.Tab>
      <Tabs.Tab selected={activeTab === "milestones"} onPress={() => setActiveTab("milestones")} role="button">
        <Tabs.Link>Milestones</Tabs.Link>
      </Tabs.Tab>
    </Tabs>
  );

  const projectFilter = isPortfolio && (
    <div style={{ width: 260 }}>
      <Select
        placeholder="Filter by project"
        label={selectedProjectIds.length ? `${selectedProjectIds.length} selected` : undefined}
        onSelect={(s) => {
          const id = s.item as string;
          setSelectedProjectIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
          );
        }}
        onClear={() => setSelectedProjectIds([])}
        block
      >
        {projectOptions.map((p) => (
          <Select.Option key={p.id} value={p.id} selected={selectedProjectIds.includes(p.id)}>
            {p.number} {p.name}
          </Select.Option>
        ))}
      </Select>
    </div>
  );

  return (
    <ToolPageLayout
      title="Schedule"
      icon={<ScheduleIcon size="md" />}
      actions={actions}
      tabs={tabs}
    >
      {activeTab === "schedule" && (
        <SplitViewCard>
          <SplitViewCard.Main>
            <SplitViewCard.Section heading="Schedule Items">
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
                  {projectFilter}
                </ToolbarLeft>
              </ToolbarRow>

              <GridArea>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <SmartGridWrapper<ScheduleItem>
                    id="schedule-items-grid"
                    localStorageKey="owner-prototype-schedule-grid"
                    height="100%"
                    rowData={scheduleItems}
                    columnDefs={scheduleColumnDefs}
                    getRowId={getScheduleRowId}
                    sideBar={false}
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
              </GridArea>
            </SplitViewCard.Section>
          </SplitViewCard.Main>
        </SplitViewCard>
      )}

      {activeTab === "milestones" && (
        <SplitViewCard>
          <SplitViewCard.Main>
            <SplitViewCard.Section heading="Milestones">
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
                  {projectFilter}
                </ToolbarLeft>
              </ToolbarRow>

              <GridArea>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <SmartGridWrapper<Milestone>
                    id="milestones-grid"
                    localStorageKey="owner-prototype-milestones-grid"
                    height="100%"
                    rowData={milestones}
                    columnDefs={milestoneColumnDefs}
                    getRowId={getMilestoneRowId}
                    sideBar={false}
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
              </GridArea>
            </SplitViewCard.Section>
          </SplitViewCard.Main>
        </SplitViewCard>
      )}
    </ToolPageLayout>
  );
}
