import React, { useMemo, useState, type ChangeEvent } from "react";
import {
  Button,
  Pagination,
  Search,
  Select,
  Table,
  ToggleButton,
} from "@procore/core-react";
import { EllipsisVertical, Filter } from "@procore/core-icons";

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

const QUICK_FILTER_OPTIONS = [
  { id: "qf1", label: "Quick Filter 01" },
  { id: "qf2", label: "Quick Filter 01" },
  { id: "qf3", label: "Quick Filter 01" },
] as const;

const CELL_TRUNCATE: React.CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  maxWidth: "100%",
};

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

/**
 * Change History tab — data table pattern from Figma (toolbar, 8 columns, pagination).
 * @see CHANGE_HISTORY_FIGMA_URL
 */
export function ChangeHistoryDataTable() {
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [activePage, setActivePage] = useState(5);
  const totalItems = 1000;
  const perPage = 10;

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return CHANGE_HISTORY_TABLE_SAMPLE_ROWS;
    return CHANGE_HISTORY_TABLE_SAMPLE_ROWS.filter(
      (r) =>
        r.project.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.actionBy.toLowerCase().includes(q) ||
        r.changed.toLowerCase().includes(q) ||
        r.from.toLowerCase().includes(q) ||
        r.to.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q)
    );
  }, [search]);

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
        {QUICK_FILTER_OPTIONS.map((opt) => (
          <div key={opt.id} style={{ width: 155, minWidth: 140, maxWidth: "100%" }}>
            <Select block placeholder="Quick Filter 01">
              <Select.Option value={opt.id}>Quick Filter 01</Select.Option>
            </Select>
          </div>
        ))}
        <ToggleButton selected={filterOpen} icon={<Filter />} onClick={() => setFilterOpen((v) => !v)}>
          Filters
        </ToggleButton>
      </div>

      <div
        style={{
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
                <Table.HeaderCell style={{ minWidth: 200 }}>
                  <ColumnHeaderWithMenu label="Description" menuLabel="Column options for Description" />
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
              {filteredRows.map((row) => (
                <Table.BodyRow key={row.id}>
                  <Table.BodyCell>
                    <Table.TextCell style={CELL_TRUNCATE}>{row.project}</Table.TextCell>
                  </Table.BodyCell>
                  <Table.BodyCell>
                    <Table.TextCell style={CELL_TRUNCATE}>{row.description}</Table.TextCell>
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

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12, width: "100%" }}>
        <Pagination
          activePage={activePage}
          items={totalItems}
          perPage={perPage}
          onSelectPage={setActivePage}
        />
      </div>
    </div>
  );
}
