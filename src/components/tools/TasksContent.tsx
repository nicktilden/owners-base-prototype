import React, { useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  Dropdown,
  Pill,
  SegmentedController,
  Select,
  SplitViewCard,
  Switch,
  Table,
  Tabs,
  ToggleButton,
} from "@procore/core-react";
import {
  Check as TasksIcon,
  Filter,
  Plus,
  Search as SearchIcon,
  Clear,
  Sliders,
  ViewRows,
} from "@procore/core-icons";
import { tasks } from "@/data/seed/tasks";
import { projects } from "@/data/seed/projects";
import type { Task, TaskStatus } from "@/types/tasks";
import styled from "styled-components";
import ToolPageLayout from "@/components/tools/ToolPageLayout";
import { PINNED_BODY_CELL_STYLE, PINNED_HEADER_CELL_STYLE, StandardRowActions } from "@/components/table/TableActions";
import { formatDateMMDDYYYY } from "@/utils/date";

// ─── Styled components ────────────────────────────────────────────────────────

const SearchInputWrap = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #c4cbcf;
  border-radius: 4px;
  padding: 0 8px;
  height: 36px;
  gap: 6px;
  min-width: 220px;
  background: #fff;
  &:focus-within {
    border-color: #1d5cc9;
    box-shadow: 0 0 0 2px rgba(29, 92, 201, 0.2);
  }
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  flex: 1;
  font-size: 14px;
  background: transparent;
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0px;
  gap: 8px;
`;

const ToolbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ToolbarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TableLayout = styled.div`
  display: flex;
  flex-direction: row;
  min-height: 0;
  overflow: hidden;
`;

const TableArea = styled.div`
  flex: 1;
  min-width: 0;
  overflow: auto;
`;

// ─── Side panel shared styles ─────────────────────────────────────────────────

const SidePanel = styled.div`
  width: 280px;
  flex-shrink: 0;
  border: 1px solid #e0e4e7;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e4e7;
`;

const PanelTitle = styled.span`
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
  color: #1a2226;
`;

const PanelHeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PanelBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

// ─── Filter panel ─────────────────────────────────────────────────────────────

const FilterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FilterLabel = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #1a2226;
`;

// ─── Config panel ─────────────────────────────────────────────────────────────

const ConfigSectionHeading = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const ConfigSectionTitle = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #1a2226;
`;

const ShowAllLink = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: #1a2226;
  padding: 0;
  &:hover { text-decoration: underline; }
`;

const ColumnToggleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f2f3;
  &:last-child { border-bottom: none; }
`;

const ColumnToggleLabel = styled.span`
  font-size: 14px;
  color: #1a2226;
`;

// ─── Quick filter bar ──────────────────────────────────────────────────────────

const QuickFilterBar = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding: 4px 0 8px 0;
`;

const FilterChipEl = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  background: #e8f0fe;
  color: #1d5cc9;
  border: 1px solid #1d5cc9;
  border-radius: 4px;
  padding: 0 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: default;
  white-space: nowrap;
`;

const FilterChipRemove = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #1d5cc9;
  padding: 0;
  line-height: 1;
  font-size: 22px;
  display: flex;
  align-items: center;
  &:hover { color: #0f3a8a; }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: Date | null): string {
  return formatDateMMDDYYYY(d);
}

const STATUS_COLORS: Record<TaskStatus, "green" | "yellow" | "red" | "gray" | "blue"> = {
  initiated: "gray",
  in_progress: "blue",
  ready_for_review: "yellow",
  closed: "green",
  void: "gray",
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  initiated: "Initiated",
  in_progress: "In Progress",
  ready_for_review: "Ready for Review",
  closed: "Closed",
  void: "Void",
};

// ─── Column config ────────────────────────────────────────────────────────────

type ColumnKey =
  | "project"
  | "number"
  | "title"
  | "status"
  | "category"
  | "dueDate"
  | "private"
  | "createdAt";

const COLUMNS: { key: ColumnKey; label: string }[] = [
  { key: "project",   label: "Project" },
  { key: "number",    label: "#" },
  { key: "title",     label: "Title" },
  { key: "status",    label: "Status" },
  { key: "category",  label: "Category" },
  { key: "dueDate",   label: "Due Date" },
  { key: "private",   label: "Private" },
  { key: "createdAt", label: "Created" },
];

// ─── Filter config ────────────────────────────────────────────────────────────

interface FilterState {
  projectId: string[];
  status: TaskStatus[];
  category: string[];
}

const EMPTY_FILTERS: FilterState = {
  projectId: [],
  status: [],
  category: [],
};

type FilterKey = keyof FilterState;

interface FilterChip {
  filterKey: FilterKey;
  value: string;
  label: string;
}

const STATUS_OPTIONS: TaskStatus[] = ["initiated", "in_progress", "ready_for_review", "closed", "void"];
const CATEGORY_OPTIONS = [
  "Administrative",
  "Closeout",
  "Contract",
  "Design",
  "Equipment",
  "Inspector",
  "Miscellaneous",
  "Preconstruction",
  "Utility Coordination",
];

// ─── TaskRow sub-component ────────────────────────────────────────────────────

function TaskRow({ task, hidden, isPortfolio, projectLabel, selected, onToggle }: {
  task: Task;
  hidden: Set<ColumnKey>;
  isPortfolio: boolean;
  projectLabel: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <Table.BodyRow>
      <Table.BodyCell snugfit style={{ paddingLeft: 16 }}>
        <Checkbox
          checked={selected}
          onChange={onToggle}
          aria-label={`Select task ${task.number}`}
        />
      </Table.BodyCell>
      {!hidden.has("number") && (
        <Table.BodyCell>
          <Table.TextCell>
            <span style={{ color: "#6a767c", fontSize: 13 }}>#{task.number}</span>
          </Table.TextCell>
        </Table.BodyCell>
      )}
      {isPortfolio && !hidden.has("project") && (
        <Table.BodyCell>
          <Table.TextCell>
            <span style={{ color: "#1d5cc9", cursor: "pointer" }}>
              {projectLabel}
            </span>
          </Table.TextCell>
        </Table.BodyCell>
      )}
      {!hidden.has("title") && (
        <Table.BodyCell>
          <Table.TextCell>
            <span style={{ fontWeight: 600, color: "#1d5cc9", cursor: "pointer" }}>
              {task.title}
            </span>
          </Table.TextCell>
        </Table.BodyCell>
      )}
      {!hidden.has("status") && (
        <Table.BodyCell>
          <Pill color={STATUS_COLORS[task.status]}>{STATUS_LABELS[task.status]}</Pill>
        </Table.BodyCell>
      )}
      {!hidden.has("category") && (
        <Table.BodyCell>
          <Table.TextCell>{task.category ?? "—"}</Table.TextCell>
        </Table.BodyCell>
      )}
      {!hidden.has("dueDate") && (
        <Table.BodyCell>
          <Table.TextCell>{formatDate(task.dueDate)}</Table.TextCell>
        </Table.BodyCell>
      )}
      {!hidden.has("private") && (
        <Table.BodyCell>
          <Table.TextCell>{task.private ? "Yes" : "No"}</Table.TextCell>
        </Table.BodyCell>
      )}
      {!hidden.has("createdAt") && (
        <Table.BodyCell>
          <Table.TextCell>{formatDate(task.createdAt)}</Table.TextCell>
        </Table.BodyCell>
      )}
      <Table.BodyCell style={PINNED_BODY_CELL_STYLE}>
        <StandardRowActions />
      </Table.BodyCell>
    </Table.BodyRow>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

type TabKey = "list" | "my_tasks";

interface TasksContentProps {
  projectId: string;
}

export default function TasksContent({ projectId }: TasksContentProps) {
  const isPortfolio = projectId === "";
  const [search, setSearch]     = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("list");
  const [filterOpen, setFilterOpen]   = useState(false);
  const [configOpen, setConfigOpen]   = useState(false);
  const [filters, setFilters]         = useState<FilterState>(EMPTY_FILTERS);
  const [hiddenCols, setHiddenCols]   = useState<Set<ColumnKey>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const project = useMemo(
    () => projects.find((p) => p.id === projectId),
    [projectId]
  );
  const projectMap = useMemo(() => {
    const m = new Map<string, string>();
    projects.forEach((p) => m.set(p.id, `${p.number} ${p.name}`));
    return m;
  }, []);
  const projectOptions = useMemo(() => {
    const ids = new Set(tasks.map((t) => t.projectId));
    return projects.filter((p) => ids.has(p.id));
  }, []);

  const visibleColCount = COLUMNS.length - hiddenCols.size + 2;

  const projectTasks = useMemo<Task[]>(() => {
    let base = isPortfolio ? [...tasks] : tasks.filter((t) => t.projectId === projectId);

    if (search.trim()) {
      const q = search.toLowerCase();
      base = base.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.category?.toLowerCase().includes(q) ?? false) ||
          STATUS_LABELS[t.status].toLowerCase().includes(q)
      );
    }

    if (filters.status.length)   base = base.filter((t) => filters.status.includes(t.status));
    if (filters.category.length) base = base.filter((t) => t.category !== null && filters.category.includes(t.category));
    if (isPortfolio && filters.projectId.length) {
      base = base.filter((t) => t.projectId !== null && filters.projectId.includes(t.projectId));
    }

    return base;
  }, [projectId, isPortfolio, search, filters]);

  const projectLabel = project ? `${project.number} ${project.name}` : projectId;

  const hasActiveFilters = Object.values(filters).some((arr) => arr.length > 0);

  const activeFilterChips = useMemo<FilterChip[]>(() => {
    const chips: FilterChip[] = [];
    filters.projectId.forEach((v) =>
      chips.push({ filterKey: "projectId", value: v, label: `Project: ${projectMap.get(v) ?? v}` })
    );
    filters.status.forEach((v) => chips.push({ filterKey: "status", value: v, label: `Status: ${STATUS_LABELS[v]}` }));
    filters.category.forEach((v) => chips.push({ filterKey: "category", value: v, label: `Category: ${v}` }));
    return chips;
  }, [filters, projectMap]);

  function toggleColumn(key: ColumnKey) {
    setHiddenCols((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  function showAllColumns() {
    setHiddenCols(new Set());
  }

  function clearFilters() {
    setFilters(EMPTY_FILTERS);
  }

  function removeFilterChip(filterKey: FilterKey, value: string) {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: (prev[filterKey] as string[]).filter((v) => v !== value),
    }));
  }

  function toggleFilterValue<K extends FilterKey>(key: K, value: FilterState[K][number]) {
    setFilters((prev) => {
      const arr = prev[key] as string[];
      return {
        ...prev,
        [key]: arr.includes(value as string)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  }

  function toggleSelectRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === projectTasks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(projectTasks.map((t) => t.id)));
    }
  }

  const allSelected = projectTasks.length > 0 && selectedIds.size === projectTasks.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < projectTasks.length;

  const breadcrumbs = [
    { label: "Portfolio", href: "/portfolio" },
    ...(projectId ? [{ label: projectLabel, href: `/project/${projectId}` }] : []),
  ];

  const actions = (
    <>
      <Dropdown label="Export" variant="secondary">
        <Dropdown.Item item="pdf">PDF</Dropdown.Item>
        <Dropdown.Item item="csv">CSV</Dropdown.Item>
        <Dropdown.Item item="excel">Excel</Dropdown.Item>
      </Dropdown>
      <Button variant="primary" icon={<Plus />}>Add Task</Button>
    </>
  );

  const tabs = (
    <Tabs>
      <Tabs.Tab selected={activeTab === "list"} onPress={() => setActiveTab("list")} role="button">
        <Tabs.Link>List</Tabs.Link>
      </Tabs.Tab>
      <Tabs.Tab selected={activeTab === "my_tasks"} onPress={() => setActiveTab("my_tasks")} role="button">
        <Tabs.Link>My Tasks</Tabs.Link>
      </Tabs.Tab>
    </Tabs>
  );

  return (
    <ToolPageLayout
      title="Tasks"
      icon={<TasksIcon size="md" />}
      breadcrumbs={breadcrumbs}
      actions={actions}
      tabs={tabs}
    >
      {activeTab === "list" && (
        <SplitViewCard>
          <SplitViewCard.Main>
            <SplitViewCard.Section heading="Tasks">

              {/* Toolbar */}
              <Toolbar>
                <ToolbarLeft>
                  <SearchInputWrap>
                    <SearchIcon size="sm" style={{ color: "#6a767c", flexShrink: 0 }} />
                    <SearchInput
                      placeholder="Search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </SearchInputWrap>
                  <ToggleButton
                    selected={filterOpen}
                    icon={<Filter />}
                    onClick={() => {
                      setFilterOpen((v) => !v);
                      if (configOpen) setConfigOpen(false);
                    }}
                  >
                    Filter{hasActiveFilters ? " •" : ""}
                  </ToggleButton>
                </ToolbarLeft>
                <ToolbarRight>
                  <SegmentedController>
                    <SegmentedController.Segment
                      selected={true}
                      onClick={() => {}}
                      tooltip="List view"
                    >
                      <ViewRows />
                    </SegmentedController.Segment>
                  </SegmentedController>
                  <ToggleButton
                    selected={configOpen}
                    icon={<Sliders />}
                    onClick={() => {
                      setConfigOpen((v) => !v);
                      if (filterOpen) setFilterOpen(false);
                    }}
                  >
                    Configure
                  </ToggleButton>
                </ToolbarRight>
              </Toolbar>

              {/* Quick filter chips */}
              {activeFilterChips.length > 0 && (
                <QuickFilterBar>
                  {activeFilterChips.map((chip) => (
                    <FilterChipEl key={`${chip.filterKey}-${chip.value}`}>
                      {chip.label}
                      <FilterChipRemove
                        onClick={() => removeFilterChip(chip.filterKey, chip.value)}
                        aria-label={`Remove filter: ${chip.label}`}
                      >
                        <Clear size="sm" />
                      </FilterChipRemove>
                    </FilterChipEl>
                  ))}
                </QuickFilterBar>
              )}

              {/* Table area with side panels */}
              <TableLayout>
                {/* ── Filter panel (left) ── */}
                {filterOpen && (
                  <SidePanel style={{ marginRight: 16 }}>
                    <PanelHeader>
                      <PanelTitle>Filters</PanelTitle>
                      <PanelHeaderActions>
                        {hasActiveFilters && (
                          <Button
                            variant="tertiary"
                            size="md"
                            onClick={clearFilters}
                          >
                            Clear All Filters
                          </Button>
                        )}
                        <Button
                          variant="tertiary"
                          icon={<Clear />}
                          onClick={() => setFilterOpen(false)}
                          aria-label="Close filter panel"
                        />
                      </PanelHeaderActions>
                    </PanelHeader>
                    <PanelBody>
                      {isPortfolio && (
                        <FilterSection>
                          <FilterLabel>Project</FilterLabel>
                          <Select
                            placeholder="Select values"
                            label={filters.projectId.length ? `${filters.projectId.length} selected` : undefined}
                            onSelect={(s) => toggleFilterValue("projectId", s.item as string)}
                            onClear={() => setFilters((f) => ({ ...f, projectId: [] }))}
                            block
                          >
                            {projectOptions.map((p) => (
                              <Select.Option key={p.id} value={p.id} selected={filters.projectId.includes(p.id)}>
                                {p.number} {p.name}
                              </Select.Option>
                            ))}
                          </Select>
                        </FilterSection>
                      )}
                      <FilterSection>
                        <FilterLabel>Status</FilterLabel>
                        <Select
                          placeholder="Select values"
                          label={filters.status.length ? `${filters.status.length} selected` : undefined}
                          onSelect={(s) => toggleFilterValue("status", s.item as TaskStatus)}
                          onClear={() => setFilters((f) => ({ ...f, status: [] }))}
                          block
                        >
                          {STATUS_OPTIONS.map((v) => (
                            <Select.Option key={v} value={v} selected={filters.status.includes(v)}>
                              {STATUS_LABELS[v]}
                            </Select.Option>
                          ))}
                        </Select>
                      </FilterSection>
                      <FilterSection>
                        <FilterLabel>Category</FilterLabel>
                        <Select
                          placeholder="Select values"
                          label={filters.category.length ? `${filters.category.length} selected` : undefined}
                          onSelect={(s) => toggleFilterValue("category", s.item as string)}
                          onClear={() => setFilters((f) => ({ ...f, category: [] }))}
                          block
                        >
                          {CATEGORY_OPTIONS.map((v) => (
                            <Select.Option key={v} value={v} selected={filters.category.includes(v)}>
                              {v}
                            </Select.Option>
                          ))}
                        </Select>
                      </FilterSection>
                    </PanelBody>
                  </SidePanel>
                )}

                {/* ── Table ── */}
                <TableArea>
                  <Table.Container>
                    <Table>
                      <Table.Header>
                        <Table.HeaderRow>
                          <Table.HeaderCell snugfit style={{ paddingLeft: 16 }}>
                            <Checkbox
                              checked={allSelected}
                              indeterminate={someSelected}
                              onChange={toggleSelectAll}
                              aria-label="Select all rows"
                            />
                          </Table.HeaderCell>
                          {COLUMNS.filter((c) => !hiddenCols.has(c.key) && (isPortfolio || c.key !== "project")).map((c) => (
                            <Table.HeaderCell key={c.key}>{c.label}</Table.HeaderCell>
                          ))}
                          <Table.HeaderCell style={PINNED_HEADER_CELL_STYLE}>Actions</Table.HeaderCell>
                        </Table.HeaderRow>
                      </Table.Header>
                      <Table.Body>
                        {projectTasks.length === 0 ? (
                          <Table.BodyRow>
                            <Table.BodyCell colSpan={visibleColCount}>
                              <Table.TextCell>
                                {search || hasActiveFilters
                                  ? "No tasks match your search or filters."
                                  : "No tasks have been added to this project."}
                              </Table.TextCell>
                            </Table.BodyCell>
                          </Table.BodyRow>
                        ) : (
                          projectTasks.map((task) => (
                            <TaskRow
                              key={task.id}
                              task={task}
                              hidden={hiddenCols}
                              isPortfolio={isPortfolio}
                              projectLabel={task.projectId ? (projectMap.get(task.projectId) ?? task.projectId) : "No Project"}
                              selected={selectedIds.has(task.id)}
                              onToggle={() => toggleSelectRow(task.id)}
                            />
                          ))
                        )}
                      </Table.Body>
                    </Table>
                  </Table.Container>
                </TableArea>

                {/* ── Config panel (right) ── */}
                {configOpen && (
                  <SidePanel style={{ marginLeft: 16 }}>
                    <PanelHeader>
                      <PanelTitle>Table Settings</PanelTitle>
                      <Button
                        variant="tertiary"
                        icon={<Clear />}
                        onClick={() => setConfigOpen(false)}
                        aria-label="Close config panel"
                      />
                    </PanelHeader>
                    <PanelBody>
                      <div>
                        <ConfigSectionHeading>
                          <ConfigSectionTitle>Configure Columns</ConfigSectionTitle>
                          <ShowAllLink onClick={showAllColumns}>Show All</ShowAllLink>
                        </ConfigSectionHeading>
                        {COLUMNS.map((col) => (
                          <ColumnToggleRow key={col.key}>
                            <Switch
                              checked={!hiddenCols.has(col.key)}
                              onChange={() => toggleColumn(col.key)}
                              aria-label={`Toggle ${col.label} column`}
                            />
                            <ColumnToggleLabel>{col.label}</ColumnToggleLabel>
                          </ColumnToggleRow>
                        ))}
                      </div>
                    </PanelBody>
                  </SidePanel>
                )}
              </TableLayout>

            </SplitViewCard.Section>
          </SplitViewCard.Main>
        </SplitViewCard>
      )}

      {activeTab === "my_tasks" && (
        <SplitViewCard>
          <SplitViewCard.Main>
            <SplitViewCard.Section heading="My Tasks">
              <div style={{ padding: "24px", textAlign: "center", color: "#6a767c" }}>
                My Tasks coming soon.
              </div>
            </SplitViewCard.Section>
          </SplitViewCard.Main>
        </SplitViewCard>
      )}
    </ToolPageLayout>
  );
}
