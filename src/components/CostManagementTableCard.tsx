import React, { useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  DetailPage,
  SegmentedController,
  Select,
  Switch,
  Table,
  ToggleButton,
} from "@procore/core-react";
import {
  CaretDown,
  CaretRight,
  Clear,
  Filter,
  Location,
  Pencil,
  Sliders,
  ViewRows,
} from "@procore/core-icons";
import styled from "styled-components";
import { sampleProjectRows } from "@/data/projects";
import {
  PINNED_BODY_CELL_STYLE,
  PINNED_HEADER_CELL_STYLE,
  StandardRowActions,
} from "@/components/table/TableActions";
import { useHubFilters } from "@/context/HubFilterContext";

function formatCurrency(n: number): string {
  if (n === 0) return "$0";
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

interface CostRow {
  id: number;
  projectNumber: string;
  project: string;
  location: string;
  originalBudget: number;
  spent: number;
  forecastEAC: number;
  variance: number;
  stage: string;
  program: string;
  state: string;
}

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
    content: "";
    position: absolute;
    left: ${({ $depth }) => ($depth - 1) * 12}px;
    top: 0;
    bottom: 0;
    width: ${({ $depth }) => ($depth > 0 ? 12 : 0)}px;
    background: #f4f5f6;
    border-right: 1px solid #d6dadc;
    display: ${({ $depth }) => ($depth > 0 ? "block" : "none")};
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
    content: "";
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

const Th = styled.th`
  font-size: 12px;
  font-weight: 600;
  color: #232729;
 `;

type ColumnKey =
  | "projectNumber"
  | "project"
  | "location"
  | "stage"
  | "originalBudget"
  | "spent"
  | "forecastEAC"
  | "variance";
type ViewMode = "rows" | "map";
type GroupByKey = "stage" | "program" | "state";
type FilterKey = "stage" | "program" | "state";

interface FilterState {
  stage: string[];
  program: string[];
  state: string[];
}

interface GroupByOption {
  id: GroupByKey;
  label: string;
}

const COLUMNS: { key: ColumnKey; label: string }[] = [
  { key: "projectNumber", label: "Project Number" },
  { key: "project", label: "Project" },
  { key: "location", label: "Location" },
  { key: "stage", label: "Stage" },
  { key: "originalBudget", label: "Original Budget" },
  { key: "spent", label: "Spent to Date" },
  { key: "forecastEAC", label: "Forecast EAC" },
  { key: "variance", label: "Budget Variance" },
];

const EMPTY_FILTERS: FilterState = { stage: [], program: [], state: [] };
const GROUP_BY_OPTIONS: GroupByOption[] = [
  { id: "stage", label: "Stage" },
  { id: "program", label: "Program" },
  { id: "state", label: "State" },
];

function toggleFilterArrayValue<K extends FilterKey>(
  prev: FilterState,
  key: K,
  value: FilterState[K][number]
): FilterState {
  const arr = prev[key] as string[];
  return {
    ...prev,
    [key]: arr.includes(value as string) ? arr.filter((v) => v !== value) : [...arr, value],
  };
}

export default function CostManagementTableCard() {
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

  const rows = useMemo<CostRow[]>(() => {
    let base = filteredProjectRows.map((p) => {
      const variance = p.originalBudget - p.estimatedCostAtCompletion;
      return {
        id: p.id,
        projectNumber: p.number,
        project: p.name,
        location: `${p.city}, ${p.state}`,
        originalBudget: p.originalBudget,
        spent: p.jobToDateCost,
        forecastEAC: p.estimatedCostAtCompletion,
        variance,
        stage: p.stage,
        program: p.program,
        state: p.state,
      };
    });
    if (search.trim()) {
      const q = search.toLowerCase();
      base = base.filter(
        (r) =>
          r.project.toLowerCase().includes(q) ||
          r.stage.toLowerCase().includes(q) ||
          r.program.toLowerCase().includes(q) ||
          r.state.toLowerCase().includes(q)
      );
    }
    if (filters.stage.length) base = base.filter((r) => filters.stage.includes(r.stage));
    if (filters.program.length) base = base.filter((r) => filters.program.includes(r.program));
    if (filters.state.length) base = base.filter((r) => filters.state.includes(r.state));
    return base;
  }, [filteredProjectRows, search, filters]);

  const stageOptions = useMemo(
    () => [...new Set(filteredProjectRows.map((p) => p.stage))].sort((a, b) => a.localeCompare(b)),
    [filteredProjectRows]
  );
  const programOptions = useMemo(
    () => [...new Set(filteredProjectRows.map((p) => p.program))].sort((a, b) => a.localeCompare(b)),
    [filteredProjectRows]
  );
  const stateOptions = useMemo(
    () => [...new Set(filteredProjectRows.map((p) => p.state))].filter(Boolean).sort((a, b) => a.localeCompare(b)),
    [filteredProjectRows]
  );

  const hasActiveFilters = Object.values(filters).some((arr) => arr.length > 0);
  const visibleColCount = COLUMNS.length - hiddenCols.size + 2;
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

  return (
    <DetailPage.Card navigationLabel="Cost Management">
      <DetailPage.Section heading="Cost Management">
        <Toolbar>
          <ToolbarLeft>
            <SearchInputWrap>
              <SearchInput placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
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
                  prev.some((g) => g.id === opt.id) ? prev.filter((g) => g.id !== opt.id) : [...prev, opt]
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
              <SegmentedController.Segment selected={viewMode === "rows"} onClick={() => setViewMode("rows")} tooltip="List view">
                <ViewRows />
              </SegmentedController.Segment>
              <SegmentedController.Segment selected={viewMode === "map"} onClick={() => setViewMode("map")} tooltip="Map view">
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
                    {stageOptions.map((v) => (
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
                    {programOptions.map((v) => (
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
                    {stateOptions.map((v) => (
                      <Select.Option key={v} value={v} selected={filters.state.includes(v)}>
                        {v}
                      </Select.Option>
                    ))}
                  </Select>
                </FilterSection>
              </PanelBody>
            </SidePanel>
          )}

          <TableArea>
            {selectedIds.size > 0 && (
              <BulkActionBar>
                <BulkEditLabel><Pencil size="sm" />Edit</BulkEditLabel>
                <BulkCountLabel>{selectedIds.size} {selectedIds.size === 1 ? "item" : "items"} selected</BulkCountLabel>
              </BulkActionBar>
            )}
            <Table.Container>
              <Table>
                <Table.Header>
                  <Table.HeaderRow>
                    <Table.HeaderCell snugfit style={{ paddingLeft: 16 }}>
                      <Checkbox checked={allSelected} indeterminate={someSelected} onChange={toggleSelectAll} aria-label="Select all rows" />
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
                      <Table.BodyCell colSpan={visibleColCount}><Table.TextCell>Map view coming soon.</Table.TextCell></Table.BodyCell>
                    </Table.BodyRow>
                  ) : rows.length === 0 ? (
                    <Table.BodyRow>
                      <Table.BodyCell colSpan={visibleColCount}><Table.TextCell>No rows match your search or filters.</Table.TextCell></Table.BodyCell>
                    </Table.BodyRow>
                  ) : groupBy.length > 0 ? (
                    (() => {
                      function renderRow(r: CostRow, depth = 0): React.ReactNode {
                        return (
                          <Table.BodyRow key={`${r.id}-${depth}`}>
                            {depth > 0 && <DepthRail $depth={depth} />}
                            <Table.BodyCell snugfit style={{ paddingLeft: 16 }}>
                              <Checkbox checked={selectedIds.has(r.id)} onChange={() => toggleSelectRow(r.id)} aria-label={`Select ${r.project}`} />
                            </Table.BodyCell>
                            {!hiddenCols.has("projectNumber") && <Table.BodyCell><Table.TextCell>{r.projectNumber}</Table.TextCell></Table.BodyCell>}
                            {!hiddenCols.has("project") && <Table.BodyCell><Table.TextCell><span style={{ fontWeight: 600, color: "#1d5cc9", cursor: "pointer" }}>{r.project}</span></Table.TextCell></Table.BodyCell>}
                            {!hiddenCols.has("location") && <Table.BodyCell><Table.TextCell>{r.location}</Table.TextCell></Table.BodyCell>}
                            {!hiddenCols.has("stage") && <Table.BodyCell><Table.TextCell>{r.stage}</Table.TextCell></Table.BodyCell>}
                            {!hiddenCols.has("originalBudget") && <Table.BodyCell><Table.TextCell>{formatCurrency(r.originalBudget)}</Table.TextCell></Table.BodyCell>}
                            {!hiddenCols.has("spent") && <Table.BodyCell><Table.TextCell>{formatCurrency(r.spent)}</Table.TextCell></Table.BodyCell>}
                            {!hiddenCols.has("forecastEAC") && <Table.BodyCell><Table.TextCell>{formatCurrency(r.forecastEAC)}</Table.TextCell></Table.BodyCell>}
                            {!hiddenCols.has("variance") && (
                              <Table.BodyCell>
                                <Table.TextCell>
                                  <span style={{ color: r.variance > 0 ? "#1a7d3a" : r.variance < 0 ? "#b91c1c" : undefined }}>
                                    {`${r.variance >= 0 ? "+" : ""}${formatCurrency(r.variance)}`}
                                  </span>
                                </Table.TextCell>
                              </Table.BodyCell>
                            )}
                            <Table.BodyCell style={PINNED_BODY_CELL_STYLE}><StandardRowActions /></Table.BodyCell>
                          </Table.BodyRow>
                        );
                      }

                      function renderGroups(list: CostRow[], keys: GroupByOption[], depth: number, pathPrefix: string): React.ReactNode[] {
                        const key = keys[0];
                        const rest = keys.slice(1);
                        const grouped = new Map<string, CostRow[]>();
                        for (const r of list) {
                          const rawLabel = r[key.id];
                          const label = rawLabel || "—";
                          if (!grouped.has(label)) grouped.set(label, []);
                          grouped.get(label)!.push(r);
                        }
                        const rendered: React.ReactNode[] = [];
                        grouped.forEach((groupRows, label) => {
                          const collapseKey = `${pathPrefix}::${label}`;
                          const isCollapsed = collapsedGroups.has(collapseKey);
                          rendered.push(
                            <tr key={`group-${collapseKey}`}>
                              <GroupHeaderCell $depth={depth} colSpan={visibleColCount}>
                                <GroupHeaderContent onClick={() => toggleGroupCollapse(collapseKey)} aria-expanded={!isCollapsed}>
                                  {isCollapsed ? <CaretRight size="sm" /> : <CaretDown size="sm" />}
                                  {label} ({groupRows.length})
                                </GroupHeaderContent>
                              </GroupHeaderCell>
                            </tr>
                          );
                          if (!isCollapsed) {
                            if (rest.length > 0) rendered.push(...renderGroups(groupRows, rest, depth + 1, collapseKey));
                            else groupRows.forEach((r) => rendered.push(renderRow(r, depth + 1)));
                          }
                        });
                        return rendered;
                      }
                      return renderGroups(rows, groupBy, 0, "root");
                    })()
                  ) : (
                    rows.map((r) => (
                      <Table.BodyRow key={r.id}>
                        <Table.BodyCell snugfit style={{ paddingLeft: 16 }}>
                          <Checkbox checked={selectedIds.has(r.id)} onChange={() => toggleSelectRow(r.id)} aria-label={`Select ${r.project}`} />
                        </Table.BodyCell>
                        {!hiddenCols.has("projectNumber") && <Table.BodyCell><Table.TextCell>{r.projectNumber}</Table.TextCell></Table.BodyCell>}
                        {!hiddenCols.has("project") && <Table.BodyCell><Table.TextCell><span style={{ fontWeight: 600, color: "#1d5cc9", cursor: "pointer" }}>{r.project}</span></Table.TextCell></Table.BodyCell>}
                        {!hiddenCols.has("location") && <Table.BodyCell><Table.TextCell>{r.location}</Table.TextCell></Table.BodyCell>}
                        {!hiddenCols.has("stage") && <Table.BodyCell><Table.TextCell>{r.stage}</Table.TextCell></Table.BodyCell>}
                        {!hiddenCols.has("originalBudget") && <Table.BodyCell><Table.TextCell>{formatCurrency(r.originalBudget)}</Table.TextCell></Table.BodyCell>}
                        {!hiddenCols.has("spent") && <Table.BodyCell><Table.TextCell>{formatCurrency(r.spent)}</Table.TextCell></Table.BodyCell>}
                        {!hiddenCols.has("forecastEAC") && <Table.BodyCell><Table.TextCell>{formatCurrency(r.forecastEAC)}</Table.TextCell></Table.BodyCell>}
                        {!hiddenCols.has("variance") && (
                          <Table.BodyCell>
                            <Table.TextCell>
                              <span style={{ color: r.variance > 0 ? "#1a7d3a" : r.variance < 0 ? "#b91c1c" : undefined }}>
                                {`${r.variance >= 0 ? "+" : ""}${formatCurrency(r.variance)}`}
                              </span>
                            </Table.TextCell>
                          </Table.BodyCell>
                        )}
                        <Table.BodyCell style={PINNED_BODY_CELL_STYLE}><StandardRowActions /></Table.BodyCell>
                      </Table.BodyRow>
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
