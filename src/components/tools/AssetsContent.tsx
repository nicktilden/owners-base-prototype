import React, { useMemo, useState } from "react";
import {
  Box,
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
  Assets as AssetsIcon,
  Filter,
  Pencil,
  Plus,
  Search as SearchIcon,
  CaretDown,
  CaretRight,
  Clear,
  Location,
  Sliders,
  ViewRows,
} from "@procore/core-icons";
import { assets } from "@/data/seed/assets";
import { projects } from "@/data/seed/projects";
import type { Asset, AssetStatus, AssetCondition } from "@/types/assets";
import styled from "styled-components";
import ToolPageLayout from "@/components/tools/ToolPageLayout";
import { PINNED_BODY_CELL_STYLE, PINNED_HEADER_CELL_STYLE, StandardRowActions } from "@/components/table/TableActions";

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

/** Outer container: table + optional side panels sit in a horizontal flex row */
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

// ─── Bulk action bar ──────────────────────────────────────────────────────────

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

// ─── Group header row styles ───────────────────────────────────────────────────

const GroupHeaderCell = styled.td<{ $depth: number }>`
  background: #ffffff;
  padding: 0 8px 0 ${({ $depth }) => $depth * 12}px;
  height: 48px;
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const STATUS_COLORS: Record<AssetStatus, "green" | "yellow" | "red" | "gray"> = {
  active: "green",
  inactive: "gray",
  in_maintenance: "yellow",
  retired: "red",
  disposed: "gray",
};

const STATUS_LABELS: Record<AssetStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  in_maintenance: "In Maintenance",
  retired: "Retired",
  disposed: "Disposed",
};

const CONDITION_COLORS: Record<AssetCondition, "green" | "yellow" | "red" | "gray"> = {
  excellent: "green",
  good: "green",
  fair: "yellow",
  poor: "red",
  critical: "red",
};

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");
}

// ─── Column config ────────────────────────────────────────────────────────────

type ColumnKey =
  | "project"
  | "name"
  | "type"
  | "trade"
  | "manufacturer"
  | "serialNumber"
  | "status"
  | "condition"
  | "installDate"
  | "warrantyExpiry";

const COLUMNS: { key: ColumnKey; label: string }[] = [
  { key: "project",       label: "Project" },
  { key: "name",          label: "Name" },
  { key: "type",          label: "Type" },
  { key: "trade",         label: "Trade" },
  { key: "manufacturer",  label: "Manufacturer / Model" },
  { key: "serialNumber",  label: "Serial Number" },
  { key: "status",        label: "Status" },
  { key: "condition",     label: "Condition" },
  { key: "installDate",   label: "Install Date" },
  { key: "warrantyExpiry",label: "Warranty Expiry" },
];

// ─── Filter config ────────────────────────────────────────────────────────────

interface FilterState {
  projectId: string[];
  type: string[];
  trade: string[];
  status: AssetStatus[];
  condition: AssetCondition[];
}

const EMPTY_FILTERS: FilterState = {
  projectId: [],
  type: [],
  trade: [],
  status: [],
  condition: [],
};

type FilterKey = keyof FilterState;

interface FilterChip {
  filterKey: FilterKey;
  value: string;
  label: string;
}

const TYPE_OPTIONS = ["equipment", "vehicle", "tool", "material", "fixture", "system", "other"];
const TRADE_OPTIONS = ["general", "electrical", "mechanical", "plumbing", "hvac", "civil", "structural", "other"];
const STATUS_OPTIONS: AssetStatus[] = ["active", "inactive", "in_maintenance", "retired", "disposed"];
const CONDITION_OPTIONS: AssetCondition[] = ["excellent", "good", "fair", "poor", "critical"];

// ─── Group-by config ──────────────────────────────────────────────────────────

type GroupByKey = "type" | "trade" | "status" | "condition";

interface GroupByOption {
  id: GroupByKey;
  label: string;
}

const GROUP_BY_OPTIONS: GroupByOption[] = [
  { id: "type",      label: "Type" },
  { id: "trade",     label: "Trade" },
  { id: "status",    label: "Status" },
  { id: "condition", label: "Condition" },
];

function getGroupLabel(asset: Asset, key: GroupByKey): string {
  switch (key) {
    case "type":      return capitalize(asset.type);
    case "trade":     return capitalize(asset.trade);
    case "status":    return STATUS_LABELS[asset.status];
    case "condition": return capitalize(asset.condition);
  }
}

// ─── AssetRow sub-component ───────────────────────────────────────────────────

function AssetRow({ asset, hidden, isPortfolio, projectLabel, selected, onToggle, depth = 0 }: {
  asset: Asset;
  hidden: Set<ColumnKey>;
  isPortfolio: boolean;
  projectLabel: string;
  selected: boolean;
  onToggle: () => void;
  depth?: number;
}) {
  return (
    <Table.BodyRow>
      {depth > 0 && <DepthRail $depth={depth} />}
      <Table.BodyCell snugfit style={{ paddingLeft: 16 }}>
        <Checkbox
          checked={selected}
          onChange={onToggle}
          aria-label={`Select ${asset.name}`}
        />
      </Table.BodyCell>
      {isPortfolio && !hidden.has("project") && (
        <Table.BodyCell>
          <Table.TextCell>
            <span style={{ color: "#1d5cc9", cursor: "pointer" }}>
              {projectLabel}
            </span>
          </Table.TextCell>
        </Table.BodyCell>
      )}
      {!hidden.has("name") && (
        <Table.BodyCell>
          <Table.TextCell>
            <span style={{ fontWeight: 600, color: "#1d5cc9", cursor: "pointer" }}>
              {asset.name}
            </span>
          </Table.TextCell>
        </Table.BodyCell>
      )}
      {!hidden.has("type") && (
        <Table.BodyCell>
          <Table.TextCell>{capitalize(asset.type)}</Table.TextCell>
        </Table.BodyCell>
      )}
      {!hidden.has("trade") && (
        <Table.BodyCell>
          <Table.TextCell>{capitalize(asset.trade)}</Table.TextCell>
        </Table.BodyCell>
      )}
      {!hidden.has("manufacturer") && (
        <Table.BodyCell>
          <Table.TextCell>
            {asset.manufacturer && asset.model
              ? `${asset.manufacturer} ${asset.model}`
              : asset.manufacturer ?? asset.model ?? "—"}
          </Table.TextCell>
        </Table.BodyCell>
      )}
      {!hidden.has("serialNumber") && (
        <Table.BodyCell>
          <Table.TextCell>{asset.serialNumber ?? "—"}</Table.TextCell>
        </Table.BodyCell>
      )}
      {!hidden.has("status") && (
        <Table.BodyCell>
          <Pill color={STATUS_COLORS[asset.status]}>{STATUS_LABELS[asset.status]}</Pill>
        </Table.BodyCell>
      )}
      {!hidden.has("condition") && (
        <Table.BodyCell>
          <Pill color={CONDITION_COLORS[asset.condition]}>{capitalize(asset.condition)}</Pill>
        </Table.BodyCell>
      )}
      {!hidden.has("installDate") && (
        <Table.BodyCell>
          <Table.TextCell>{formatDate(asset.installDate)}</Table.TextCell>
        </Table.BodyCell>
      )}
      {!hidden.has("warrantyExpiry") && (
        <Table.BodyCell>
          <Table.TextCell>{formatDate(asset.warrantyExpiry)}</Table.TextCell>
        </Table.BodyCell>
      )}
      <Table.BodyCell style={PINNED_BODY_CELL_STYLE}>
        <StandardRowActions />
      </Table.BodyCell>
    </Table.BodyRow>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

type TabKey = "list" | "recycle_bin";

interface AssetsContentProps {
  projectId: string;
}

export default function AssetsContent({ projectId }: AssetsContentProps) {
  const isPortfolio = projectId === "";
  const [search, setSearch]       = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("list");
  const [viewMode, setViewMode]   = useState<"rows" | "grid">("rows");
  const [groupBy, setGroupBy]     = useState<GroupByOption[]>([]);
  const [filterOpen, setFilterOpen]       = useState(false);
  const [configOpen, setConfigOpen]       = useState(false);
  const [filters, setFilters]             = useState<FilterState>(EMPTY_FILTERS);
  const [hiddenCols, setHiddenCols]       = useState<Set<ColumnKey>>(new Set());
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

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
    const ids = new Set(assets.map((a) => a.projectId));
    return projects.filter((p) => ids.has(p.id));
  }, []);

  // +1 for the checkbox column
  const visibleColCount = COLUMNS.length - hiddenCols.size + 2;

  const projectAssets = useMemo<Asset[]>(() => {
    let base = isPortfolio ? [...assets] : assets.filter((a) => a.projectId === projectId);

    // Text search
    if (search.trim()) {
      const q = search.toLowerCase();
      base = base.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          (a.manufacturer?.toLowerCase().includes(q) ?? false) ||
          (a.model?.toLowerCase().includes(q) ?? false) ||
          a.type.toLowerCase().includes(q) ||
          a.trade.toLowerCase().includes(q) ||
          STATUS_LABELS[a.status].toLowerCase().includes(q)
      );
    }

    // Attribute filters
    if (filters.type.length)      base = base.filter((a) => filters.type.includes(a.type));
    if (filters.trade.length)     base = base.filter((a) => filters.trade.includes(a.trade));
    if (filters.status.length)    base = base.filter((a) => filters.status.includes(a.status));
    if (filters.condition.length) base = base.filter((a) => filters.condition.includes(a.condition));
    if (isPortfolio && filters.projectId.length) {
      base = base.filter((a) => filters.projectId.includes(a.projectId));
    }

    return base;
  }, [projectId, isPortfolio, search, filters]);

  const projectLabel = project ? `${project.number} ${project.name}` : projectId;

  const hasActiveFilters = Object.values(filters).some((arr) => arr.length > 0);

  const activeFilterChips = useMemo<FilterChip[]>(() => {
    const chips: FilterChip[] = [];
    filters.projectId.forEach((v) => chips.push({ filterKey: "projectId", value: v, label: `Project: ${projectMap.get(v) ?? v}` }));
    filters.type.forEach((v) => chips.push({ filterKey: "type", value: v, label: `Type: ${capitalize(v)}` }));
    filters.trade.forEach((v) => chips.push({ filterKey: "trade", value: v, label: `Trade: ${capitalize(v)}` }));
    filters.status.forEach((v) => chips.push({ filterKey: "status", value: v, label: `Status: ${STATUS_LABELS[v]}` }));
    filters.condition.forEach((v) => chips.push({ filterKey: "condition", value: v, label: `Condition: ${capitalize(v)}` }));
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

  function toggleGroupCollapse(label: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label); else next.add(label);
      return next;
    });
  }

  // ── Selection helpers ────────────────────────────────────────────────────────

  function toggleSelectRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === projectAssets.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(projectAssets.map((a) => a.id)));
    }
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  const allSelected = projectAssets.length > 0 && selectedIds.size === projectAssets.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < projectAssets.length;

  const breadcrumbs = [
    { label: 'Portfolio', href: '/portfolio' },
    ...(projectId ? [{ label: projectLabel, href: `/project/${projectId}` }] : []),
  ];

  const actions = (
    <>
      <Dropdown label="Export" variant="secondary">
        <Dropdown.Item item="pdf">PDF</Dropdown.Item>
        <Dropdown.Item item="csv">CSV</Dropdown.Item>
        <Dropdown.Item item="excel">Excel</Dropdown.Item>
      </Dropdown>
      <Button variant="primary" icon={<Plus />}>Add Asset</Button>
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
                          <Select
                            placeholder="Group by..."
                            label={groupBy.length ? groupBy.map((g) => g.label).join(" › ") : undefined}
                            onSelect={(selection) => {
                              const opt = selection.item as GroupByOption;
                              setGroupBy((prev) =>
                                prev.some((g) => g.id === opt.id)
                                  ? prev.filter((g) => g.id !== opt.id)
                                  : [...prev, opt]
                              );
                            }}
                            onClear={() => setGroupBy([])}
                            style={{ minWidth: 240 }}
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
                              selected={viewMode === "grid"}
                              onClick={() => setViewMode("grid")}
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

                      {/* Bulk action bar */}
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
                              <FilterSection>
                                {isPortfolio && (
                                  <>
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
                                  </>
                                )}
                              </FilterSection>
                              <FilterSection>
                                <FilterLabel>Type</FilterLabel>
                                <Select
                                  placeholder="Select values"
                                  label={filters.type.length ? `${filters.type.length} selected` : undefined}
                                  onSelect={(s) => toggleFilterValue("type", s.item as string)}
                                  onClear={() => setFilters((f) => ({ ...f, type: [] }))}
                                  block
                                >
                                  {TYPE_OPTIONS.map((v) => (
                                    <Select.Option key={v} value={v} selected={filters.type.includes(v)}>
                                      {capitalize(v)}
                                    </Select.Option>
                                  ))}
                                </Select>
                              </FilterSection>
                              <FilterSection>
                                <FilterLabel>Trade</FilterLabel>
                                <Select
                                  placeholder="Select values"
                                  label={filters.trade.length ? `${filters.trade.length} selected` : undefined}
                                  onSelect={(s) => toggleFilterValue("trade", s.item as string)}
                                  onClear={() => setFilters((f) => ({ ...f, trade: [] }))}
                                  block
                                >
                                  {TRADE_OPTIONS.map((v) => (
                                    <Select.Option key={v} value={v} selected={filters.trade.includes(v)}>
                                      {capitalize(v)}
                                    </Select.Option>
                                  ))}
                                </Select>
                              </FilterSection>
                              <FilterSection>
                                <FilterLabel>Status</FilterLabel>
                                <Select
                                  placeholder="Select values"
                                  label={filters.status.length ? `${filters.status.length} selected` : undefined}
                                  onSelect={(s) => toggleFilterValue("status", s.item as AssetStatus)}
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
                                <FilterLabel>Condition</FilterLabel>
                                <Select
                                  placeholder="Select values"
                                  label={filters.condition.length ? `${filters.condition.length} selected` : undefined}
                                  onSelect={(s) => toggleFilterValue("condition", s.item as AssetCondition)}
                                  onClear={() => setFilters((f) => ({ ...f, condition: [] }))}
                                  block
                                >
                                  {CONDITION_OPTIONS.map((v) => (
                                    <Select.Option key={v} value={v} selected={filters.condition.includes(v)}>
                                      {capitalize(v)}
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
                                {projectAssets.length === 0 ? (
                                  <Table.BodyRow>
                                    <Table.BodyCell colSpan={visibleColCount}>
                                      <Table.TextCell>
                                        {search || hasActiveFilters
                                          ? "No assets match your search or filters."
                                          : "No assets have been added to this project."}
                                      </Table.TextCell>
                                    </Table.BodyCell>
                                  </Table.BodyRow>
                                ) : groupBy.length > 0 ? (
                                  (() => {
                                    // Recursive helper: groups assets by groupBy keys at given depth
                                    function renderGroups(
                                      assetList: Asset[],
                                      keys: GroupByOption[],
                                      depth: number,
                                      pathPrefix: string
                                    ): React.ReactNode[] {
                                      const key = keys[0];
                                      const rest = keys.slice(1);
                                      const grouped = new Map<string, Asset[]>();
                                      for (const asset of assetList) {
                                        const label = getGroupLabel(asset, key.id);
                                        if (!grouped.has(label)) grouped.set(label, []);
                                        grouped.get(label)!.push(asset);
                                      }
                                      const rows: React.ReactNode[] = [];
                                      grouped.forEach((groupAssets, label) => {
                                        const collapseKey = `${pathPrefix}::${label}`;
                                        const isCollapsed = collapsedGroups.has(collapseKey);
                                        rows.push(
                                          <tr key={`group-${collapseKey}`}>
                                            <GroupHeaderCell $depth={depth} colSpan={visibleColCount}>
                                              <GroupHeaderContent
                                                onClick={() => toggleGroupCollapse(collapseKey)}
                                                aria-expanded={!isCollapsed}
                                              >
                                                {isCollapsed
                                                  ? <CaretRight size="sm" />
                                                  : <CaretDown size="sm" />}
                                                {label} ({groupAssets.length})
                                              </GroupHeaderContent>
                                            </GroupHeaderCell>
                                          </tr>
                                        );
                                        if (!isCollapsed) {
                                          if (rest.length > 0) {
                                            rows.push(...renderGroups(groupAssets, rest, depth + 1, collapseKey));
                                          } else {
                                            groupAssets.forEach((asset) =>
                                              rows.push(
                                                <AssetRow
                                                  key={asset.id}
                                                  asset={asset}
                                                  hidden={hiddenCols}
                                                  isPortfolio={isPortfolio}
                                                  projectLabel={projectMap.get(asset.projectId) ?? asset.projectId}
                                                  selected={selectedIds.has(asset.id)}
                                                  onToggle={() => toggleSelectRow(asset.id)}
                                                  depth={depth + 1}
                                                />
                                              )
                                            );
                                          }
                                        }
                                      });
                                      return rows;
                                    }
                                    return renderGroups(projectAssets, groupBy, 0, "root");
                                  })()
                                ) : (
                                  projectAssets.map((asset) => (
                                    <AssetRow
                                      key={asset.id}
                                      asset={asset}
                                      hidden={hiddenCols}
                                      isPortfolio={isPortfolio}
                                      projectLabel={projectMap.get(asset.projectId) ?? asset.projectId}
                                      selected={selectedIds.has(asset.id)}
                                      onToggle={() => toggleSelectRow(asset.id)}
                                    />
                                  ))
                                )}
                              </Table.Body>
                            </Table>
                          </Table.Container>
                        </TableArea>

                        {/* ── Config panel (right) ── */}
                        {configOpen && (
                          <SidePanel  style={{ marginLeft: 16 }}>
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

              {activeTab === "recycle_bin" && (
                <SplitViewCard>
                  <SplitViewCard.Main>
                    <SplitViewCard.Section heading="Recycle Bin">
                      <Box padding="xl" style={{ textAlign: "center", color: "#6a767c" }}>
                        Recycle Bin coming soon.
                      </Box>
                    </SplitViewCard.Section>
                  </SplitViewCard.Main>
                </SplitViewCard>
              )}
    </ToolPageLayout>
  );
}
