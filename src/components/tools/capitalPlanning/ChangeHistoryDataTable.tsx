import React, { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  Button,
  DateInput,
  Pagination,
  Search,
  Select,
  Table,
  ToggleButton,
} from "@procore/core-react";
import { Clear, EllipsisVertical, Filter } from "@procore/core-icons";
import styled from "styled-components";
import { CHANGE_HISTORY_CHANGED_FILTER_ORDER } from "@/components/tools/capitalPlanning/capitalPlanningChangeHistory";

/** [Capital Planning — Change History (Figma)](https://www.figma.com/design/wbjpyOCTw2MQaOzx4ibk6r/Capital-Planning?node-id=4546-92086&t=w5sefxFOqRbZRF58-1) */
export const CHANGE_HISTORY_FIGMA_URL =
  "https://www.figma.com/design/wbjpyOCTw2MQaOzx4ibk6r/Capital-Planning?node-id=4546-92086&t=w5sefxFOqRbZRF58-1";

export interface ChangeHistoryRow {
  id: string;
  project: string;
  description: string;
  date: string;
  actionBy: string;
  type: "Program" | "Project";
  changed: string;
  from: string;
  to: string;
}

/** Prototype rows aligned to the Change History data table in Figma (node 4546-92086). */
export const CHANGE_HISTORY_TABLE_SAMPLE_ROWS: ChangeHistoryRow[] = [
  {
    id: "1",
    project: "Skyline Tower",
    description: "Residential Housing Development — Phase 2",
    date: "06/22/2026 at 1:40 pm",
    actionBy: "Ingrid Michaelsen",
    type: "Project",
    changed: "Planned Amount",
    from: "$800,000.00",
    to: "$900,000.00",
  },
  {
    id: "2",
    project: "Riverside Park Development",
    description: "Commercial Office Complex",
    date: "06/21/2026 at 11:15 am",
    actionBy: "John Smith",
    type: "Program",
    changed: "Planned Amount",
    from: "Lump Sum",
    to: "Original Budget",
  },
  {
    id: "3",
    project: "Harbor View Plaza",
    description: "Mixed-use retail and parking",
    date: "06/20/2026 at 4:02 pm",
    actionBy: "Omar Hassan",
    type: "Project",
    changed: "Start Date",
    from: "01/10/2026 at 8:00 am",
    to: "06/22/2026 at 1:40 pm",
  },
  {
    id: "4",
    project: "North Campus Phase 2",
    description: "Education facility expansion",
    date: "06/19/2026 at 9:30 am",
    actionBy: "Jordan Lee",
    type: "Project",
    changed: "End Date",
    from: "12/31/2027 at 5:00 pm",
    to: "03/15/2028 at 5:00 pm",
  },
  {
    id: "5",
    project: "Waterfront Tower",
    description: "High-rise residential",
    date: "06/18/2026 at 2:44 pm",
    actionBy: "Alex Chen",
    type: "Project",
    changed: "Curve",
    from: "manual",
    to: "bell",
  },
  {
    id: "6",
    project: "Central Station Retrofit",
    description: "Transit hub modernization",
    date: "06/17/2026 at 10:08 am",
    actionBy: "Sam Rivera",
    type: "Program",
    changed: "Curve",
    from: "back-loaded",
    to: "manual",
  },
  {
    id: "7",
    project: "Eastside Logistics Hub",
    description: "Warehouse and distribution",
    date: "06/16/2026 at 3:21 pm",
    actionBy: "Priya Nandakumar",
    type: "Project",
    changed: "Planned Amount",
    from: "$2,450,000.00",
    to: "$2,600,000.00",
  },
  {
    id: "8",
    project: "Greenfield Solar Array",
    description: "Utility-scale solar installation",
    date: "06/15/2026 at 8:55 am",
    actionBy: "John Smith",
    type: "Project",
    changed: "Start Date",
    from: "04/01/2026 at 12:00 am",
    to: "05/01/2026 at 12:00 am",
  },
  {
    id: "9",
    project: "Metro Line Extension",
    description: "Civil infrastructure package",
    date: "06/14/2026 at 5:12 pm",
    actionBy: "Omar Hassan",
    type: "Program",
    changed: "Curve",
    from: "manual",
    to: "back-loaded",
  },
  {
    id: "10",
    project: "Lakeside Medical Pavilion",
    description: "Outpatient clinic and parking",
    date: "06/13/2026 at 1:03 pm",
    actionBy: "Ingrid Michaelsen",
    type: "Project",
    changed: "End Date",
    from: "09/30/2026 at 5:00 pm",
    to: "11/15/2026 at 5:00 pm",
  },
];

/** Extra illustrative rows — appended when seeding the Capital Planning tab so Change History isn’t empty on first open. */
export const CHANGE_HISTORY_EXTRA_MOCK_ROWS: ChangeHistoryRow[] = [
  {
    id: "mock-seed-11",
    project: "MW1016 St. Elizabeth Hospital — Rooftop HVAC",
    description:
      "MW1016 St. Elizabeth Hospital — Rooftop HVAC: discretionary capital scope covering base-building systems, life-safety upgrades, and tenant coordination for phased turnover.",
    date: "06/12/2026 at 10:15 am",
    actionBy: "You",
    type: "Project",
    changed: "Planned Amount",
    from: "None",
    to: "$825,000.00",
  },
  {
    id: "mock-seed-12",
    project: "NE1015 Holy Redeemer Hospital — Cafeteria Renovation",
    description:
      "Owner-operator initiative for NE1015 Holy Redeemer Hospital — Cafeteria Renovation — underwriting tie-in, milestone gates, and portfolio-level risk controls through delivery.",
    date: "06/12/2026 at 10:12 am",
    actionBy: "You",
    type: "Project",
    changed: "Planned Amount",
    from: "Lump Sum",
    to: "High Level Budget Items",
  },
  {
    id: "mock-seed-13",
    project: "W1014 Sequoia Hospital Imaging Center Expansion",
    description:
      "W1014 Sequoia Hospital Imaging Center Expansion bundles hard and soft costs with contingency held at program level; narrative reflects current stage and funding corridor.",
    date: "06/11/2026 at 4:48 pm",
    actionBy: "Dean Lewis",
    type: "Project",
    changed: "Start Date",
    from: "None",
    to: "07/01/2026",
  },
  {
    id: "mock-seed-14",
    project: "S1013 Trinity Health Baton Rouge MOB",
    description:
      "Portfolio fit for S1013 Trinity Health Baton Rouge MOB: near-term cash use, NOI uplift assumptions, and alignment to regional demand in the capital plan cycle.",
    date: "06/11/2026 at 4:44 pm",
    actionBy: "Priya Shah",
    type: "Project",
    changed: "End Date",
    from: "None",
    to: "09/30/2028",
  },
  {
    id: "mock-seed-15",
    project: "MW1012 St. Joseph Livonia Campus — Parking Structure",
    description:
      "MW1012 St. Joseph Livonia Campus — Parking Structure includes deferred maintenance catch-up, accessibility path of travel, and operational resilience work scoped for board review.",
    date: "06/11/2026 at 9:02 am",
    actionBy: "Alex Rivera",
    type: "Project",
    changed: "Curve",
    from: "None",
    to: "front-loaded",
  },
  {
    id: "mock-seed-16",
    project: "NE1011 Mercy Health Research Institute",
    description:
      "Program entry for NE1011 Mercy Health Research Institute: lease-structure impacts, schedule float assumptions, and vendor qualification status summarized for prioritization.",
    date: "06/10/2026 at 2:30 pm",
    actionBy: "Jordan Kim",
    type: "Program",
    changed: "Planned Amount",
    from: "Revised Budget",
    to: "High Level Budget Items",
  },
];

/** Full seed list for Capital Planning (`CapitalPlanningContent`): Figma samples + extras. Real edits prepend above this list. */
export const CHANGE_HISTORY_INITIAL_MOCK_ROWS: ChangeHistoryRow[] = [
  ...CHANGE_HISTORY_TABLE_SAMPLE_ROWS,
  ...CHANGE_HISTORY_EXTRA_MOCK_ROWS,
];

/** Same panel chrome as {@link CapitalPlanningContent} / prioritization filters (340px side panel). */
const ChangeHistoryFilterSidePanel = styled.aside`
  width: 340px;
  flex: 0 0 340px;
  flex-shrink: 0;
  border: 1px solid var(--color-border-separator);
  background: var(--color-surface-primary);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
`;

const FilterPanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border-separator);
`;

const FilterPanelTitle = styled.span`
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
  color: var(--color-text-primary);
`;

const FilterPanelHeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FilterPanelBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
`;

const FilterFieldSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FilterFieldLabel = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
`;

const DateRangeRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  min-width: 0;

  & > div {
    flex: 1 1 0;
    min-width: 0;
  }
`;

const CELL_TRUNCATE: React.CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  maxWidth: "100%",
};

/** Parse leading MM/DD/YYYY from Change History date display strings. */
function parseChangeHistoryRowDate(dateDisplay: string): Date | null {
  const m = dateDisplay.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (!m) return null;
  const month = parseInt(m[1], 10) - 1;
  const day = parseInt(m[2], 10);
  const year = parseInt(m[3], 10);
  const d = new Date(year, month, day);
  return Number.isNaN(d.getTime()) ? null : d;
}

function ColumnHeaderWithMenu({ label, menuLabel }: { label: string; menuLabel: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        width: "100%",
        minWidth: 0,
      }}
    >
      <span style={{ ...CELL_TRUNCATE, flex: "1 1 auto" }}>{label}</span>
      <Button
        type="button"
        variant="tertiary"
        size="sm"
        icon={<EllipsisVertical />}
        aria-label={menuLabel}
        style={{ flexShrink: 0 }}
      />
    </div>
  );
}

const TYPE_OPTIONS = ["Program", "Project"] as const;

/**
 * Change History tab — data table + Capital Planning–style filter side panel.
 * @see CHANGE_HISTORY_FIGMA_URL
 */
export interface ChangeHistoryDataTableProps {
  /**
   * Rows recorded from Capital Planning edits (newest first).
   * When omitted, sample rows are used so the table matches Figma in isolation.
   */
  rows?: ChangeHistoryRow[];
}

export function ChangeHistoryDataTable(props: ChangeHistoryDataTableProps = {}) {
  const { rows: rowsProp } = props;
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const perPage = 10;

  const [filterProject, setFilterProject] = useState<string | null>(null);
  const [filterActionBy, setFilterActionBy] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterChanged, setFilterChanged] = useState<string | null>(null);
  const [filterDateFrom, setFilterDateFrom] = useState<Date | null>(null);
  const [filterDateTo, setFilterDateTo] = useState<Date | null>(null);

  const dateFromClearRef = useRef<HTMLButtonElement>(null);
  const dateToClearRef = useRef<HTMLButtonElement>(null);

  const baseRows = rowsProp !== undefined ? rowsProp : CHANGE_HISTORY_TABLE_SAMPLE_ROWS;

  const projectOptions = useMemo(
    () => [...new Set(baseRows.map((r) => r.project))].sort((a, b) => a.localeCompare(b)),
    [baseRows]
  );
  const actionByOptions = useMemo(
    () => [...new Set(baseRows.map((r) => r.actionBy))].sort((a, b) => a.localeCompare(b)),
    [baseRows]
  );
  const changedFilterOptions = CHANGE_HISTORY_CHANGED_FILTER_ORDER;

  const filterPanelHasActiveSelections =
    filterProject !== null ||
    filterActionBy !== null ||
    filterType !== null ||
    filterChanged !== null ||
    filterDateFrom !== null ||
    filterDateTo !== null;

  const clearFilterPanel = useCallback(() => {
    setFilterProject(null);
    setFilterActionBy(null);
    setFilterType(null);
    setFilterChanged(null);
    setFilterDateFrom(null);
    setFilterDateTo(null);
  }, []);

  const filteredRows = useMemo(() => {
    let rows = baseRows;

    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (r) =>
          r.project.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.actionBy.toLowerCase().includes(q) ||
          r.changed.toLowerCase().includes(q) ||
          r.from.toLowerCase().includes(q) ||
          r.to.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q)
      );
    }

    if (filterProject) {
      rows = rows.filter((r) => r.project === filterProject);
    }
    if (filterActionBy) {
      rows = rows.filter((r) => r.actionBy === filterActionBy);
    }
    if (filterType) {
      rows = rows.filter((r) => r.type === filterType);
    }
    if (filterChanged) {
      rows = rows.filter((r) => r.changed === filterChanged);
    }

    if (filterDateFrom || filterDateTo) {
      rows = rows.filter((r) => {
        const d = parseChangeHistoryRowDate(r.date);
        if (!d) return false;
        if (filterDateFrom) {
          const start = new Date(filterDateFrom);
          start.setHours(0, 0, 0, 0);
          if (d < start) return false;
        }
        if (filterDateTo) {
          const end = new Date(filterDateTo);
          end.setHours(23, 59, 59, 999);
          if (d > end) return false;
        }
        return true;
      });
    }

    return rows;
  }, [
    baseRows,
    search,
    filterProject,
    filterActionBy,
    filterType,
    filterChanged,
    filterDateFrom,
    filterDateTo,
  ]);

  const totalItems = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage) || 1);
  const safeActivePage = Math.min(activePage, totalPages);

  const pageRows = useMemo(() => {
    const start = (safeActivePage - 1) * perPage;
    return filteredRows.slice(start, start + perPage);
  }, [filteredRows, safeActivePage, perPage]);

  useEffect(() => {
    setActivePage(1);
  }, [search, filterProject, filterActionBy, filterType, filterChanged, filterDateFrom, filterDateTo]);

  useEffect(() => {
    if (activePage > totalPages) {
      setActivePage(totalPages);
    }
  }, [activePage, totalPages]);

  return (
    <div className="capital-planning-change-history" style={{ minWidth: 0, width: "100%" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
          width: "100%",
        }}
      >
        <div style={{ width: 280, maxWidth: "100%", minWidth: 0 }}>
          <Search
            placeholder="Search"
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
        </div>
        <ToggleButton selected={filterOpen} icon={<Filter />} onClick={() => setFilterOpen((v) => !v)}>
          Filters
        </ToggleButton>
      </div>

      <div
        className="capital-planning-main-with-filter"
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          gap: 16,
          minWidth: 0,
          width: "100%",
        }}
      >
        {filterOpen ? (
          <ChangeHistoryFilterSidePanel className="capital-planning-filter-panel">
            <FilterPanelHeader>
              <FilterPanelTitle>Filters</FilterPanelTitle>
              <FilterPanelHeaderActions>
                {filterPanelHasActiveSelections ? (
                  <Button variant="tertiary" className="b_tertiary" size="md" onClick={clearFilterPanel}>
                    Clear All
                  </Button>
                ) : null}
                <Button
                  variant="tertiary"
                  className="b_tertiary"
                  icon={<Clear />}
                  onClick={() => setFilterOpen(false)}
                  aria-label="Close filters"
                />
              </FilterPanelHeaderActions>
            </FilterPanelHeader>
            <FilterPanelBody>
              <FilterFieldSection>
                <FilterFieldLabel htmlFor="change-history-filter-project">Project Name</FilterFieldLabel>
                <Select
                  id="change-history-filter-project"
                  block
                  placeholder="Select Project Name"
                  label={filterProject ?? undefined}
                  onClear={filterProject ? () => setFilterProject(null) : undefined}
                  onSelect={(s) => {
                    if (s.action !== "selected") return;
                    setFilterProject(String(s.item));
                  }}
                >
                  {projectOptions.map((p) => (
                    <Select.Option key={p} value={p} selected={filterProject === p}>
                      {p}
                    </Select.Option>
                  ))}
                </Select>
              </FilterFieldSection>

              <FilterFieldSection>
                <FilterFieldLabel>Date Changed</FilterFieldLabel>
                <DateRangeRow>
                  <DateInput
                    aria-label="Date changed from"
                    clearRef={dateFromClearRef}
                    value={filterDateFrom ?? undefined}
                    onChange={(d) => setFilterDateFrom(d)}
                    onClear={() => setFilterDateFrom(null)}
                  />
                  <DateInput
                    aria-label="Date changed to"
                    clearRef={dateToClearRef}
                    value={filterDateTo ?? undefined}
                    onChange={(d) => setFilterDateTo(d)}
                    onClear={() => setFilterDateTo(null)}
                  />
                </DateRangeRow>
              </FilterFieldSection>

              <FilterFieldSection>
                <FilterFieldLabel htmlFor="change-history-filter-action-by">Action By</FilterFieldLabel>
                <Select
                  id="change-history-filter-action-by"
                  block
                  placeholder="Select Action By"
                  label={filterActionBy ?? undefined}
                  onClear={filterActionBy ? () => setFilterActionBy(null) : undefined}
                  onSelect={(s) => {
                    if (s.action !== "selected") return;
                    setFilterActionBy(String(s.item));
                  }}
                >
                  {actionByOptions.map((name) => (
                    <Select.Option key={name} value={name} selected={filterActionBy === name}>
                      {name}
                    </Select.Option>
                  ))}
                </Select>
              </FilterFieldSection>

              <FilterFieldSection>
                <FilterFieldLabel htmlFor="change-history-filter-type">Type</FilterFieldLabel>
                <Select
                  id="change-history-filter-type"
                  block
                  placeholder="Select Type"
                  label={filterType ?? undefined}
                  onClear={filterType ? () => setFilterType(null) : undefined}
                  onSelect={(s) => {
                    if (s.action !== "selected") return;
                    setFilterType(String(s.item));
                  }}
                >
                  {TYPE_OPTIONS.map((t) => (
                    <Select.Option key={t} value={t} selected={filterType === t}>
                      {t}
                    </Select.Option>
                  ))}
                </Select>
              </FilterFieldSection>

              <FilterFieldSection>
                <FilterFieldLabel htmlFor="change-history-filter-changed">Changed</FilterFieldLabel>
                <Select
                  id="change-history-filter-changed"
                  block
                  placeholder="Select Changed"
                  label={filterChanged ?? undefined}
                  onClear={filterChanged ? () => setFilterChanged(null) : undefined}
                  onSelect={(s) => {
                    if (s.action !== "selected") return;
                    setFilterChanged(String(s.item));
                  }}
                >
                  {changedFilterOptions.map((c) => (
                    <Select.Option key={c} value={c} selected={filterChanged === c}>
                      {c}
                    </Select.Option>
                  ))}
                </Select>
              </FilterFieldSection>
            </FilterPanelBody>
          </ChangeHistoryFilterSidePanel>
        ) : null}

        <div
          data-tab-scroll-root
          style={{
            flex: "1 1 auto",
            minWidth: 0,
            width: "100%",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            border: "1px solid #d6dadc",
            borderRadius: 8,
            background: "#ffffff",
          }}
        >
          <Table.Container>
            <Table className="capital-planning-change-history-table">
              <Table.Header>
                <Table.HeaderRow>
                  <Table.HeaderCell style={{ minWidth: 200 }}>
                    <ColumnHeaderWithMenu label="Project" menuLabel="Column options for Project" />
                  </Table.HeaderCell>
                  <Table.HeaderCell style={{ minWidth: 168 }}>
                    <ColumnHeaderWithMenu label="Date" menuLabel="Column options for Date" />
                  </Table.HeaderCell>
                  <Table.HeaderCell style={{ minWidth: 140 }}>
                    <ColumnHeaderWithMenu label="Action by" menuLabel="Column options for Action by" />
                  </Table.HeaderCell>
                  <Table.HeaderCell style={{ minWidth: 100 }}>
                    <ColumnHeaderWithMenu label="Type" menuLabel="Column options for Type" />
                  </Table.HeaderCell>
                  <Table.HeaderCell style={{ minWidth: 140 }}>
                    <ColumnHeaderWithMenu label="Changed" menuLabel="Column options for Changed" />
                  </Table.HeaderCell>
                  <Table.HeaderCell style={{ minWidth: 160 }}>
                    <ColumnHeaderWithMenu label="From" menuLabel="Column options for From" />
                  </Table.HeaderCell>
                  <Table.HeaderCell style={{ minWidth: 160 }}>
                    <ColumnHeaderWithMenu label="To" menuLabel="Column options for To" />
                  </Table.HeaderCell>
                </Table.HeaderRow>
              </Table.Header>
              <Table.Body>
                {pageRows.map((row) => (
                  <Table.BodyRow key={row.id}>
                    <Table.BodyCell>
                      <Table.TextCell style={CELL_TRUNCATE}>{row.project}</Table.TextCell>
                    </Table.BodyCell>
                    <Table.BodyCell>
                      <Table.TextCell>{row.date}</Table.TextCell>
                    </Table.BodyCell>
                    <Table.BodyCell>
                      <Table.TextCell style={CELL_TRUNCATE}>{row.actionBy}</Table.TextCell>
                    </Table.BodyCell>
                    <Table.BodyCell>
                      <Table.TextCell>{row.type}</Table.TextCell>
                    </Table.BodyCell>
                    <Table.BodyCell>
                      <Table.TextCell>{row.changed}</Table.TextCell>
                    </Table.BodyCell>
                    <Table.BodyCell>
                      <Table.TextCell style={CELL_TRUNCATE}>{row.from}</Table.TextCell>
                    </Table.BodyCell>
                    <Table.BodyCell>
                      <Table.TextCell style={CELL_TRUNCATE}>{row.to}</Table.TextCell>
                    </Table.BodyCell>
                  </Table.BodyRow>
                ))}
              </Table.Body>
            </Table>
          </Table.Container>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12, width: "100%" }}>
        <Pagination
          activePage={safeActivePage}
          items={totalItems}
          perPage={perPage}
          onSelectPage={setActivePage}
        />
      </div>
    </div>
  );
}
