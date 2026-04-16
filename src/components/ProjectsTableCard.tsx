import React, { useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  DetailPage,
  Pill,
  SegmentedController,
  Select,
  Switch,
  Table,
  ToggleButton,
} from "@procore/core-react";
import { Filter, Location, Sliders, ViewRows, Clear, CaretDown, CaretRight, Pencil } from "@procore/core-icons";
import styled from "styled-components";
import { sampleProjectMilestones, sampleProjectRows, scheduleVarianceData } from "@/data/projects";
import { PINNED_BODY_CELL_STYLE, PINNED_HEADER_CELL_STYLE, ProjectRowActions } from "@/components/table/TableActions";
import { formatDateMMDDYYYY } from "@/utils/date";
import {
  favoriteKeyForSampleProject,
  getFavorite,
  readProjectFavorites,
  writeProjectFavorites,
} from "@/utils/projectFavorites";
import { useHubFilters } from "@/context/HubFilterContext";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

const STAGE_COLORS: Record<string, "blue" | "green" | "yellow" | "gray" | "red"> = {
  "Conceptual": "gray",
  "Feasibility": "gray",
  "Final design": "blue",
  "Permitting": "yellow",
  "Bidding": "yellow",
  "Pre-Construction": "blue",
  "Course of Construction": "green",
  "Post-Construction": "green",
  "Handover": "blue",
  "Closeout": "yellow",
  "Maintenance": "gray",
};

const SearchInputWrap = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #c4cbcf;
  border-radius: 4px;
  padding: 0 8px;
  height: 36px;
  gap: 8px;
  min-width: 260px;
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
  padding: 8px 0;
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

const SidePanel = styled.div`
  width: 340px;
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

const GroupHeaderCell = styled.td<{ $depth: number }>`
  background: #ffffff;
  padding: 0 8px 0 ${({ $depth }) => $depth * 12}px;
  height: 44px;
  border-bottom: 1px solid #e0e4e7;
  border-top: 1px solid #e0e4e7;
  position: relative;
  &::before {
    content: '';
    position: absolute;
    left: ${({ $depth }) => ($depth - 1) * 12}px;
    top: 0;
    bottom: 0;
    width: ${({ $depth }) => ($depth > 0 ? 12 : 0)}px;
    background: #f4f5f6;
    border-right: 1px solid #d6dadc;
    display: ${({ $depth }) => ($depth > 0 ? 'block' : 'none')};
  }
`;

const GroupHeaderContent = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  font-size: 13px;
  font-weight: 600;
  color: #1a2226;
  &:hover { color: #1d5cc9; }
`;

const DepthRail = styled.td<{ $depth: number }>`
  position: relative;
  padding: 0;
  width: 0;
  border: none;
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: ${({ $depth }) => $depth * 12}px;
    background: repeating-linear-gradient(
      to right,
      #f4f5f6 0px,
      #f4f5f6 11px,
      #d6dadc 11px,
      #d6dadc 12px
    );
  }
`;

const BulkActionBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: rgb(246, 249, 254);
  margin-bottom: 8px;
`;

const BulkEditLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1a2226;
`;

const BulkCountLabel = styled.span`
  font-size: 14px;
  color: #1a2226;
`;

type ColumnKey =
  | "number"
  | "name"
  | "program"
  | "location"
  | "stage"
  | "startDate"
  | "endDate"
  | "lastMilestone"
  | "nextMilestone"
  | "scheduleVariance"
  | "originalBudget"
  | "estimatedCostAtCompletion";

const COLUMNS: { key: ColumnKey; label: string }[] = [
  { key: "number", label: "Number" },
  { key: "name", label: "Project Name" },
  { key: "program", label: "Program" },
  { key: "location", label: "Location" },
  { key: "stage", label: "Stage" },
  { key: "startDate", label: "Start Date" },
  { key: "endDate", label: "End Date" },
  { key: "lastMilestone", label: "Last Milestone" },
  { key: "nextMilestone", label: "Next Milestone" },
  { key: "scheduleVariance", label: "Schedule Variance" },
  { key: "originalBudget", label: "Original Budget" },
  { key: "estimatedCostAtCompletion", label: "Est. Cost at Completion" },
];

interface FilterState {
  stage: string[];
  program: string[];
  state: string[];
  favorite: string[];
}

const EMPTY_FILTERS: FilterState = { stage: [], program: [], state: [], favorite: [] };

const STAGE_OPTIONS = [...new Set(sampleProjectRows.map((p) => p.stage))].sort((a, b) => a.localeCompare(b));
const PROGRAM_OPTIONS = [...new Set(sampleProjectRows.map((p) => p.program))].sort((a, b) => a.localeCompare(b));
const STATE_OPTIONS = [...new Set(sampleProjectRows.map((p) => p.state))].filter(Boolean).sort((a, b) => a.localeCompare(b));

type FilterKey = keyof FilterState;

function toggleFilterArrayValue<K extends FilterKey>(
  prev: FilterState,
  key: K,
  value: FilterState[K][number]
): FilterState {
  const arr = prev[key] as string[];
  return {
    ...prev,
    [key]: arr.includes(value as string)
      ? arr.filter((v) => v !== value)
      : [...arr, value],
  };
}

type ViewMode = "rows" | "map";
type GroupByKey = "stage" | "program" | "state";
interface GroupByOption {
  id: GroupByKey;
  label: string;
}

const GROUP_BY_OPTIONS: GroupByOption[] = [
  { id: "stage", label: "Stage" },
  { id: "program", label: "Program" },
  { id: "state", label: "State" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProjectsTableCard() {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("rows");
  const [groupBy, setGroupBy] = useState<GroupByOption[]>([]);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [filterOpen, setFilterOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [hiddenCols, setHiddenCols] = useState<Set<ColumnKey>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const { filteredProjectRows } = useHubFilters();
  const [favoriteOverrides, setFavoriteOverrides] = useState<Record<number, boolean>>(() => {
    const map = readProjectFavorites();
    const next: Record<number, boolean> = {};
    sampleProjectRows.forEach((p) => {
      const key = favoriteKeyForSampleProject(p.id);
      next[p.id] = getFavorite(map, key, p.favorite);
    });
    return next;
  });

  const rows = useMemo(() => {
    let base = [...filteredProjectRows];
    if (search.trim()) {
      const q = search.toLowerCase();
      base = base.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.number.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.stage.toLowerCase().includes(q) ||
        p.program.toLowerCase().includes(q)
      );
    }
    if (filters.stage.length) base = base.filter((p) => filters.stage.includes(p.stage));
    if (filters.program.length) base = base.filter((p) => filters.program.includes(p.program));
    if (filters.state.length) base = base.filter((p) => filters.state.includes(p.state));
    if (filters.favorite.length) {
      base = base.filter((p) => {
        const isFavorite = favoriteOverrides[p.id] ?? p.favorite;
        if (filters.favorite.includes("favorited") && isFavorite) return true;
        if (filters.favorite.includes("not_favorited") && !isFavorite) return true;
        return false;
      });
    }
    return base;
  }, [filteredProjectRows, search, filters, favoriteOverrides]);
  const scheduleDetailsByProjectId = useMemo(() => {
    const todayIso = new Date().toISOString().slice(0, 10);
    const varianceByName = new Map(scheduleVarianceData.map((d) => [d.project, d.variance]));
    const details = new Map<number, { lastMilestone: string; nextMilestone: string; scheduleVariance: number }>();
    filteredProjectRows.forEach((p) => {
      const milestones = sampleProjectMilestones.get(p.id) ?? [];
      const completed = milestones.filter((m) => m.actualDate != null && m.actualDate <= todayIso);
      const upcoming = milestones.filter((m) => m.actualDate == null || m.actualDate > todayIso);
      const lastMilestone =
        completed.length > 0 ? completed[completed.length - 1]?.name ?? "—" : "—";
      const nextMilestone =
        upcoming.length > 0 ? upcoming[0]?.name ?? "—" : "—";
      details.set(p.id, {
        lastMilestone,
        nextMilestone,
        scheduleVariance: varianceByName.get(p.name) ?? 0,
      });
    });
    return details;
  }, [filteredProjectRows]);

  const hasActiveFilters = Object.values(filters).some((arr) => arr.length > 0);
  const visibleColCount = COLUMNS.length - hiddenCols.size + 1;
  const allVisibleIds = rows.map((r) => r.id);
  const allSelected = allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedIds.has(id));
  const someSelected = !allSelected && allVisibleIds.some((id) => selectedIds.has(id));

  function toggleColumn(key: ColumnKey) {
    setHiddenCols((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  function toggleGroupCollapse(label: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label); else next.add(label);
      return next;
    });
  }

  function toggleSelectRow(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        allVisibleIds.forEach((id) => next.delete(id));
        return next;
      });
      return;
    }
    setSelectedIds((prev) => {
      const next = new Set(prev);
      allVisibleIds.forEach((id) => next.add(id));
      return next;
    });
  }

  function toggleFavorite(projectId: number) {
    setFavoriteOverrides((prev) => {
      const current = prev[projectId] ?? sampleProjectRows.find((p) => p.id === projectId)?.favorite ?? false;
      const next = { ...prev, [projectId]: !current };
      const map = readProjectFavorites();
      map[favoriteKeyForSampleProject(projectId)] = !current;
      writeProjectFavorites(map);
      return next;
    });
  }

  return (
    <DetailPage.Card navigationLabel="Projects">
      <DetailPage.Section heading="Portfolio">
        <Toolbar>
          <ToolbarLeft>
            <SearchInputWrap>
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
            <Select
              placeholder="Group by..."
              label={groupBy.length ? groupBy.map((g) => g.label).join(" > ") : undefined}
              onSelect={(selection) => {
                const opt = selection.item as GroupByOption;
                setGroupBy((prev) =>
                  prev.some((g) => g.id === opt.id)
                    ? prev.filter((g) => g.id !== opt.id)
                    : [...prev, opt]
                );
              }}
              onClear={() => {
                setGroupBy([]);
                setCollapsedGroups(new Set());
              }}
              style={{ minWidth: 200 }}
            >
              {GROUP_BY_OPTIONS.map((opt) => (
                <Select.Option key={opt.id} value={opt} selected={groupBy.some((g) => g.id === opt.id)}>
                  {opt.label}
                </Select.Option>
              ))}
            </Select>
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
              onClick={() => {
                setConfigOpen((v) => !v);
                if (filterOpen) setFilterOpen(false);
              }}
            >
              Configure
            </ToggleButton>
          </ToolbarRight>
        </Toolbar>

        <TableLayout>
          {filterOpen && (
            <SidePanel style={{ marginRight: 16 }}>
              <PanelHeader>
                <PanelTitle>Filters</PanelTitle>
                <PanelHeaderActions>
                  {hasActiveFilters && (
                    <Button variant="tertiary" size="md" onClick={() => setFilters(EMPTY_FILTERS)}>
                      Clear All
                    </Button>
                  )}
                  <Button variant="tertiary" icon={<Clear />} onClick={() => setFilterOpen(false)} />
                </PanelHeaderActions>
              </PanelHeader>
              <PanelBody>
                <FilterSection>
                  <FilterLabel>Stage</FilterLabel>
                  <Select
                    placeholder="Select values"
                    label={filters.stage.length ? `${filters.stage.length} selected` : undefined}
                    onSelect={(s) => setFilters((f) => toggleFilterArrayValue(f, "stage", s.item as string))}
                    onClear={() => setFilters((f) => ({ ...f, stage: [] }))}
                    block
                  >
                    {STAGE_OPTIONS.map((v) => (
                      <Select.Option key={v} value={v} selected={filters.stage.includes(v)}>
                        {v}
                      </Select.Option>
                    ))}
                  </Select>
                </FilterSection>
                <FilterSection>
                  <FilterLabel>Program</FilterLabel>
                  <Select
                    placeholder="Select values"
                    label={filters.program.length ? `${filters.program.length} selected` : undefined}
                    onSelect={(s) => setFilters((f) => toggleFilterArrayValue(f, "program", s.item as string))}
                    onClear={() => setFilters((f) => ({ ...f, program: [] }))}
                    block
                  >
                    {PROGRAM_OPTIONS.map((v) => (
                      <Select.Option key={v} value={v} selected={filters.program.includes(v)}>
                        {v}
                      </Select.Option>
                    ))}
                  </Select>
                </FilterSection>
                <FilterSection>
                  <FilterLabel>State</FilterLabel>
                  <Select
                    placeholder="Select values"
                    label={filters.state.length ? `${filters.state.length} selected` : undefined}
                    onSelect={(s) => setFilters((f) => toggleFilterArrayValue(f, "state", s.item as string))}
                    onClear={() => setFilters((f) => ({ ...f, state: [] }))}
                    block
                  >
                    {STATE_OPTIONS.map((v) => (
                      <Select.Option key={v} value={v} selected={filters.state.includes(v)}>
                        {v}
                      </Select.Option>
                    ))}
                  </Select>
                </FilterSection>
                <FilterSection>
                  <FilterLabel>Favorites</FilterLabel>
                  <Select
                    placeholder="Select values"
                    label={filters.favorite.length ? `${filters.favorite.length} selected` : undefined}
                    onSelect={(s) => setFilters((f) => toggleFilterArrayValue(f, "favorite", s.item as string))}
                    onClear={() => setFilters((f) => ({ ...f, favorite: [] }))}
                    block
                  >
                    <Select.Option value="favorited" selected={filters.favorite.includes("favorited")}>
                      Favorited
                    </Select.Option>
                    <Select.Option value="not_favorited" selected={filters.favorite.includes("not_favorited")}>
                      Not Favorited
                    </Select.Option>
                  </Select>
                </FilterSection>
              </PanelBody>
            </SidePanel>
          )}

          <TableArea>
            {selectedIds.size > 0 && (
              <BulkActionBar>
                <BulkEditLabel>
                  <Pencil size="sm" />
                  Edit
                </BulkEditLabel>
                <BulkCountLabel>
                  {selectedIds.size} {selectedIds.size === 1 ? "item" : "items"} selected
                </BulkCountLabel>
              </BulkActionBar>
            )}
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
                    {COLUMNS.filter((c) => !hiddenCols.has(c.key)).map((c) => (
                      <Table.HeaderCell key={c.key}>{c.label}</Table.HeaderCell>
                    ))}
                    <Table.HeaderCell style={PINNED_HEADER_CELL_STYLE}>Actions</Table.HeaderCell>
                  </Table.HeaderRow>
                </Table.Header>
                <Table.Body>
                  {viewMode === "map" ? (
                    <Table.BodyRow>
                      <Table.BodyCell colSpan={visibleColCount}>
                        <Table.TextCell>Map view coming soon.</Table.TextCell>
                      </Table.BodyCell>
                    </Table.BodyRow>
                  ) : rows.length === 0 ? (
                    <Table.BodyRow>
                      <Table.BodyCell colSpan={visibleColCount}>
                        <Table.TextCell>No projects match your search or filters.</Table.TextCell>
                      </Table.BodyCell>
                    </Table.BodyRow>
                  ) : groupBy.length > 0 ? (
                    (() => {
                      function renderProjectRow(p: (typeof rows)[number], depth = 0): React.ReactNode {
                        const scheduleDetails = scheduleDetailsByProjectId.get(p.id);
                        const isFavorite = favoriteOverrides[p.id] ?? p.favorite;
                        return (
                          <Table.BodyRow key={`${p.id}-${depth}`}>
                            {depth > 0 && <DepthRail $depth={depth} />}
                            <Table.BodyCell snugfit style={{ paddingLeft: 16 }}>
                              <Checkbox
                                checked={selectedIds.has(p.id)}
                                onChange={() => toggleSelectRow(p.id)}
                                aria-label={`Select project ${p.number}`}
                              />
                            </Table.BodyCell>
                            {!hiddenCols.has("number") && <Table.BodyCell><Table.TextCell>{p.number}</Table.TextCell></Table.BodyCell>}
                            {!hiddenCols.has("name") && (
                              <Table.BodyCell>
                                <Table.TextCell>
                                  <span style={{ fontWeight: 600, color: "#1d5cc9", cursor: "pointer" }}>{p.name}</span>
                                </Table.TextCell>
                              </Table.BodyCell>
                            )}
                            {!hiddenCols.has("program") && <Table.BodyCell><Table.TextCell>{p.program}</Table.TextCell></Table.BodyCell>}
                            {!hiddenCols.has("location") && <Table.BodyCell><Table.TextCell>{p.city}, {p.state}</Table.TextCell></Table.BodyCell>}
                            {!hiddenCols.has("stage") && (
                              <Table.BodyCell>
                                <Pill color={STAGE_COLORS[p.stage] ?? "gray"}>{p.stage}</Pill>
                              </Table.BodyCell>
                            )}
                            {!hiddenCols.has("startDate") && <Table.BodyCell><Table.TextCell>{formatDateMMDDYYYY(p.startDate)}</Table.TextCell></Table.BodyCell>}
                            {!hiddenCols.has("endDate") && <Table.BodyCell><Table.TextCell>{formatDateMMDDYYYY(p.endDate)}</Table.TextCell></Table.BodyCell>}
                            {!hiddenCols.has("lastMilestone") && <Table.BodyCell><Table.TextCell>{scheduleDetails?.lastMilestone ?? "—"}</Table.TextCell></Table.BodyCell>}
                            {!hiddenCols.has("nextMilestone") && <Table.BodyCell><Table.TextCell>{scheduleDetails?.nextMilestone ?? "—"}</Table.TextCell></Table.BodyCell>}
                            {!hiddenCols.has("scheduleVariance") && (
                              <Table.BodyCell>
                                <Table.TextCell style={{ color: (scheduleDetails?.scheduleVariance ?? 0) < 0 ? "#d92626" : undefined }}>
                                  {`${scheduleDetails?.scheduleVariance ?? 0}d`}
                                </Table.TextCell>
                              </Table.BodyCell>
                            )}
                            {!hiddenCols.has("originalBudget") && <Table.BodyCell><Table.TextCell>{fmt(p.originalBudget)}</Table.TextCell></Table.BodyCell>}
                            {!hiddenCols.has("estimatedCostAtCompletion") && <Table.BodyCell><Table.TextCell>{fmt(p.estimatedCostAtCompletion)}</Table.TextCell></Table.BodyCell>}
                            <Table.BodyCell style={PINNED_BODY_CELL_STYLE}>
                              <ProjectRowActions
                                isFavorite={isFavorite}
                                onToggleFavorite={() => toggleFavorite(p.id)}
                              />
                            </Table.BodyCell>
                          </Table.BodyRow>
                        );
                      }

                      function renderGroups(
                        projectList: typeof rows,
                        keys: GroupByOption[],
                        depth: number,
                        pathPrefix: string
                      ): React.ReactNode[] {
                        const key = keys[0];
                        const rest = keys.slice(1);
                        const grouped = new Map<string, typeof rows>();
                        for (const p of projectList) {
                          const rawLabel = key.id === "state" ? p.state : p[key.id];
                          const label = rawLabel || "—";
                          if (!grouped.has(label)) grouped.set(label, []);
                          grouped.get(label)!.push(p);
                        }
                        const rendered: React.ReactNode[] = [];
                        grouped.forEach((groupRows, label) => {
                          const collapseKey = `${pathPrefix}::${label}`;
                          const isCollapsed = collapsedGroups.has(collapseKey);
                          rendered.push(
                            <tr key={`group-${collapseKey}`}>
                              <GroupHeaderCell $depth={depth} colSpan={visibleColCount}>
                                <GroupHeaderContent
                                  onClick={() => toggleGroupCollapse(collapseKey)}
                                  aria-expanded={!isCollapsed}
                                >
                                  {isCollapsed ? <CaretRight size="sm" /> : <CaretDown size="sm" />}
                                  {label} ({groupRows.length})
                                </GroupHeaderContent>
                              </GroupHeaderCell>
                            </tr>
                          );
                          if (!isCollapsed) {
                            if (rest.length > 0) {
                              rendered.push(...renderGroups(groupRows, rest, depth + 1, collapseKey));
                            } else {
                              groupRows.forEach((p) => rendered.push(renderProjectRow(p, depth + 1)));
                            }
                          }
                        });
                        return rendered;
                      }
                      return renderGroups(rows, groupBy, 0, "root");
                    })()
                  ) : (
                    rows.map((p) => (
                      (() => {
                        const scheduleDetails = scheduleDetailsByProjectId.get(p.id);
                        const isFavorite = favoriteOverrides[p.id] ?? p.favorite;
                        return (
                      <Table.BodyRow key={p.id}>
                        <Table.BodyCell snugfit style={{ paddingLeft: 16 }}>
                          <Checkbox
                            checked={selectedIds.has(p.id)}
                            onChange={() => toggleSelectRow(p.id)}
                            aria-label={`Select project ${p.number}`}
                          />
                        </Table.BodyCell>
                        {!hiddenCols.has("number") && <Table.BodyCell><Table.TextCell>{p.number}</Table.TextCell></Table.BodyCell>}
                        {!hiddenCols.has("name") && (
                          <Table.BodyCell>
                            <Table.TextCell>
                              <span style={{ fontWeight: 600, color: "#1d5cc9", cursor: "pointer" }}>{p.name}</span>
                            </Table.TextCell>
                          </Table.BodyCell>
                        )}
                        {!hiddenCols.has("program") && <Table.BodyCell><Table.TextCell>{p.program}</Table.TextCell></Table.BodyCell>}
                        {!hiddenCols.has("location") && <Table.BodyCell><Table.TextCell>{p.city}, {p.state}</Table.TextCell></Table.BodyCell>}
                        {!hiddenCols.has("stage") && (
                          <Table.BodyCell>
                            <Pill color={STAGE_COLORS[p.stage] ?? "gray"}>{p.stage}</Pill>
                          </Table.BodyCell>
                        )}
                        {!hiddenCols.has("startDate") && <Table.BodyCell><Table.TextCell>{formatDateMMDDYYYY(p.startDate)}</Table.TextCell></Table.BodyCell>}
                        {!hiddenCols.has("endDate") && <Table.BodyCell><Table.TextCell>{formatDateMMDDYYYY(p.endDate)}</Table.TextCell></Table.BodyCell>}
                        {!hiddenCols.has("lastMilestone") && <Table.BodyCell><Table.TextCell>{scheduleDetails?.lastMilestone ?? "—"}</Table.TextCell></Table.BodyCell>}
                        {!hiddenCols.has("nextMilestone") && <Table.BodyCell><Table.TextCell>{scheduleDetails?.nextMilestone ?? "—"}</Table.TextCell></Table.BodyCell>}
                        {!hiddenCols.has("scheduleVariance") && (
                          <Table.BodyCell>
                            <Table.TextCell style={{ color: (scheduleDetails?.scheduleVariance ?? 0) < 0 ? "#d92626" : undefined }}>
                              {`${scheduleDetails?.scheduleVariance ?? 0}d`}
                            </Table.TextCell>
                          </Table.BodyCell>
                        )}
                        {!hiddenCols.has("originalBudget") && <Table.BodyCell><Table.TextCell>{fmt(p.originalBudget)}</Table.TextCell></Table.BodyCell>}
                        {!hiddenCols.has("estimatedCostAtCompletion") && <Table.BodyCell><Table.TextCell>{fmt(p.estimatedCostAtCompletion)}</Table.TextCell></Table.BodyCell>}
                        <Table.BodyCell style={PINNED_BODY_CELL_STYLE}>
                          <ProjectRowActions
                            isFavorite={isFavorite}
                            onToggleFavorite={() => toggleFavorite(p.id)}
                          />
                        </Table.BodyCell>
                      </Table.BodyRow>
                        );
                      })()
                    ))
                  )}
                </Table.Body>
              </Table>
            </Table.Container>
          </TableArea>

          {configOpen && (
            <SidePanel style={{ marginLeft: 16 }}>
              <PanelHeader>
                <PanelTitle>Table Settings</PanelTitle>
                <Button variant="tertiary" icon={<Clear />} onClick={() => setConfigOpen(false)} />
              </PanelHeader>
              <PanelBody>
                <div>
                  <ConfigSectionHeading>
                    <ConfigSectionTitle>Configure Columns</ConfigSectionTitle>
                    <ShowAllLink onClick={() => setHiddenCols(new Set())}>Show All</ShowAllLink>
                  </ConfigSectionHeading>
                  {COLUMNS.map((col) => (
                    <ColumnToggleRow key={col.key}>
                      <Switch checked={!hiddenCols.has(col.key)} onChange={() => toggleColumn(col.key)} />
                      <ColumnToggleLabel>{col.label}</ColumnToggleLabel>
                    </ColumnToggleRow>
                  ))}
                </div>
              </PanelBody>
            </SidePanel>
          )}
        </TableLayout>
      </DetailPage.Section>
    </DetailPage.Card>
  );
}
