import React, { useMemo, useState, type ChangeEvent, type CSSProperties } from "react";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Search, Switch, Table, ToggleButton, Tooltip, Typography } from "@procore/core-react";
import { EllipsisVertical, Filter, Grip, Info } from "@procore/core-icons";

export type CapitalPlanningBudgetColumnRow = {
  id: string;
  label: string;
  enabled: boolean;
};

/**
 * Columns that already exist on the Capital Plan grid (`CapitalPlanningSmartGrid` /
 * {@link DEFAULT_CAPITAL_PLANNING_COLUMN_VISIBILITY} in `capitalPlanningColumnGroups.ts`) — budget-related baseline fields.
 */
const CAPITAL_PLAN_GRID_BUDGET_COLUMNS: readonly CapitalPlanningBudgetColumnRow[] = [
  { id: "cp-grid-plannedAmount", label: "Planned Amount", enabled: true },
  { id: "cp-grid-estimatedBudget", label: "Estimated Budget", enabled: false },
  { id: "cp-grid-originalBudget", label: "Original Budget", enabled: true },
  { id: "cp-grid-revisedBudget", label: "Revised Budget", enabled: true },
  { id: "cp-grid-jobToDate", label: "Job to Date Costs", enabled: true },
];

/** Additional prototype formula columns (numbered keys), shown after grid-backed columns. */
const CAPITAL_PLAN_FORMULA_COLUMN_ROWS: readonly CapitalPlanningBudgetColumnRow[] = [
  { id: "col-5", label: "5 Open Change Events", enabled: false },
  { id: "col-7", label: "7 Project Budget (4+5+6)", enabled: false },
  { id: "col-12", label: "12 Committed Total (8+9+10+11)", enabled: true },
  { id: "col-13", label: "13 Uncommitted Total", enabled: false },
  { id: "col-16", label: "16 Projected Job Cost (12+13+15+5)", enabled: true },
  { id: "col-19", label: "19 Forecast to Complete (7-17)", enabled: true },
  { id: "col-21", label: "21 Forecasted Cost at Completion (17+19)", enabled: true },
];

const COLUMN_SEED: readonly CapitalPlanningBudgetColumnRow[] = [
  ...CAPITAL_PLAN_GRID_BUDGET_COLUMNS,
  ...CAPITAL_PLAN_FORMULA_COLUMN_ROWS,
];

/** Placeholder copy — matches Capital Plan grid header tooltip layout (see `CapitalPlanningSmartGrid` column tooltips). */
const COLUMN_TOOLTIP_META: Record<
  string,
  { subtitle: string; lines: string[]; resultLine?: string }
> = {
  "cp-grid-plannedAmount": {
    subtitle: "Planning column",
    lines: [
      "Lump Sum, High-Level Budget Items, or Project Budget Sync",
      "Defines the total project cost forecasted in the Capital Plan",
    ],
  },
  "cp-grid-estimatedBudget": {
    subtitle: "Criteria scoring",
    lines: [
      "Working estimate while prioritizing; defaults to Planned Amount",
      "Does not replace the Capital Plan planned amount source",
    ],
  },
  "cp-grid-originalBudget": {
    subtitle: "Project Budget",
    lines: ["Synced from the linked project’s Original Budget Amount"],
  },
  "cp-grid-revisedBudget": {
    subtitle: "Calculated Column",
    lines: ["Original Budget Amount", "+ Approved Budget Changes", "+ Approved COs"],
    resultLine: "= Revised Budget",
  },
  "cp-grid-jobToDate": {
    subtitle: "Calculated Column",
    lines: ["Direct Costs + Contractor", "+ Invoices"],
    resultLine: "= Job to Date Costs",
  },
  "col-5": {
    subtitle: "Calculated Column",
    lines: ["Sum of open change event amounts", "+ Pending approvals (before posting)"],
    resultLine: "= Open Change Events",
  },
  "col-7": {
    subtitle: "Calculated Column",
    lines: ["Original Budget", "+ Revised Budget changes", "+ Pending transfers (cols 4–6)"],
    resultLine: "= Project Budget",
  },
  "col-12": {
    subtitle: "Calculated Column",
    lines: ["Purchase Orders (8)", "+ Subcontracts (9)", "+ Other commitments (10–11)"],
    resultLine: "= Committed Total",
  },
  "col-13": {
    subtitle: "Calculated Column",
    lines: ["Approved-but-unissued commitments", "+ Draft PO / subcontract balances"],
    resultLine: "= Uncommitted Total",
  },
  "col-16": {
    subtitle: "Calculated Column",
    lines: ["Committed Total (12)", "+ Uncommitted Total (13)", "+ Other job cost (15)", "+ Open CE (5)"],
    resultLine: "= Projected Job Cost",
  },
  "col-19": {
    subtitle: "Calculated Column",
    lines: ["Project Budget (7)", "− Job to Date Costs (17)"],
    resultLine: "= Forecast to Complete",
  },
  "col-21": {
    subtitle: "Calculated Column",
    lines: ["Job to Date Costs (17)", "+ Forecast to Complete (19)"],
    resultLine: "= Forecasted Cost at Completion",
  },
};

/**
 * Tooltip body styling aligned with `RevisedBudgetColumnHeaderTooltipBody` / grid budget headers
 * (white text on core Tooltip surface).
 */
function ColumnsSettingsColumnTooltipBody({ row }: { row: CapitalPlanningBudgetColumnRow }) {
  const ruleColor = "#ffffff";
  const meta = COLUMN_TOOLTIP_META[row.id] ?? {
    subtitle: "Budget column",
    lines: ["Enable this column to show values in the Capital Plan grid."],
    resultLine: undefined as string | undefined,
  };

  return (
    <div
      style={{
        maxWidth: 280,
        fontSize: 13,
        lineHeight: 1.45,
        color: "#ffffff",
        whiteSpace: "normal",
      }}
    >
      <div style={{ fontWeight: 700 }}>{row.label}</div>
      <div style={{ fontWeight: 400 }}>{meta.subtitle}</div>
      <div role="separator" aria-hidden style={{ borderTop: `2px solid ${ruleColor}`, margin: "10px 0" }} />
      {meta.lines.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
      {meta.resultLine ? (
        <>
          <div role="separator" aria-hidden style={{ borderTop: `1px solid ${ruleColor}`, margin: "10px 0" }} />
          <div style={{ fontWeight: 700 }}>{meta.resultLine}</div>
        </>
      ) : null}
    </div>
  );
}

/** Merge a new order for currently visible rows back into the full list (hidden rows keep their slots). */
function applyVisibleReorder(
  full: CapitalPlanningBudgetColumnRow[],
  newVisibleOrder: string[]
): CapitalPlanningBudgetColumnRow[] {
  const map = new Map(full.map((r) => [r.id, r]));
  const visibleSet = new Set(newVisibleOrder);
  let o = 0;
  return full.map((row) => {
    if (visibleSet.has(row.id)) {
      const id = newVisibleOrder[o++];
      return map.get(id) ?? row;
    }
    return row;
  });
}

function SortableColumnRow({
  row,
  setEnabled,
}: {
  row: CapitalPlanningBudgetColumnRow;
  setEnabled: (id: string, enabled: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({
      id: row.id,
    });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.92 : undefined,
    zIndex: isDragging ? 2 : undefined,
    position: "relative",
    ...(isDragging ? { boxShadow: "0 2px 12px hsla(200, 12%, 10%, 0.12)" } : {}),
  };

  return (
    <Table.BodyRow ref={setNodeRef} style={style} {...attributes}>
      <Table.BodyCell style={{ width: 48, verticalAlign: "middle", paddingRight: 4 }}>
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...listeners}
          aria-label={`Drag to reorder ${row.label}`}
          className="capital-planning-columns-drag-handle"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 4,
            margin: 0,
            border: "none",
            background: "transparent",
            cursor: isDragging ? "grabbing" : "grab",
            color: "var(--color-icon-primary)",
            touchAction: "none",
          }}
        >
          <Grip size="md" aria-hidden />
        </button>
      </Table.BodyCell>
      <Table.BodyCell style={{ width: 56, verticalAlign: "middle" }}>
        <Switch
          checked={row.enabled}
          onChange={() => setEnabled(row.id, !row.enabled)}
          aria-label={`Show column ${row.label}`}
        />
      </Table.BodyCell>
      <Table.BodyCell style={{ verticalAlign: "middle" }}>
        <Table.TextCell>{row.label}</Table.TextCell>
      </Table.BodyCell>
      <Table.BodyCell
        style={{
          width: 56,
          textAlign: "center",
          verticalAlign: "middle",
        }}
      >
        <Tooltip
          trigger="hover"
          placement="top"
          overlay={
            <Tooltip.Content>
              <ColumnsSettingsColumnTooltipBody row={row} />
            </Tooltip.Content>
          }
        >
          <button
            type="button"
            aria-label={`About ${row.label}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 4,
              margin: 0,
              border: "none",
              background: "transparent",
              cursor: "help",
              color: "var(--color-icon-primary)",
            }}
          >
            <Info size="sm" aria-hidden />
          </button>
        </Tooltip>
      </Table.BodyCell>
    </Table.BodyRow>
  );
}

/**
 * Capital Planning (Next) Settings → Columns: budget column visibility (prototype).
 */
export default function CapitalPlanningColumnsSettingsCard() {
  const [rows, setRows] = useState<CapitalPlanningBudgetColumnRow[]>(() => [...COLUMN_SEED]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersActive, setFiltersActive] = useState(false);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.label.toLowerCase().includes(q));
  }, [rows, searchQuery]);

  const sortableIds = useMemo(() => filteredRows.map((r) => r.id), [filteredRows]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const setEnabled = (id: string, enabled: boolean) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, enabled } : r)));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = filteredRows.map((r) => r.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const newVisibleOrder = arrayMove(ids, oldIndex, newIndex);
    setRows((prev) => applyVisibleReorder(prev, newVisibleOrder));
  };

  return (
    <div
      className="capital-planning-columns-settings"
      style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: "100%", minWidth: 0 }}
    >
      <Typography intent="small" style={{ margin: 0, color: "var(--color-text-secondary)", maxWidth: 720 }}>
        Define the budget columns you would like displayed in Capital Planning.
      </Typography>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
        <div style={{ width: 280, maxWidth: "100%", minWidth: 0 }}>
          <Search
            placeholder="Search"
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            aria-label="Search columns"
          />
        </div>
        <ToggleButton
          selected={filtersActive}
          icon={<Filter />}
          onClick={() => setFiltersActive((v) => !v)}
        >
          Filters
        </ToggleButton>
      </div>

      <div
        data-tab-scroll-root
        style={{
          width: "100%",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          border: "1px solid var(--color-border-separator)",
          borderRadius: 8,
          background: "var(--color-surface-primary)",
        }}
      >
        <Table.Container>
          <Table className="capital-planning-columns-settings-table">
            <Table.Header>
              <Table.HeaderRow>
                <Table.HeaderCell style={{ width: 48 }} aria-hidden>
                  {"\u00a0"}
                </Table.HeaderCell>
                <Table.HeaderCell style={{ width: 56 }} aria-hidden>
                  {"\u00a0"}
                </Table.HeaderCell>
                <Table.HeaderCell>Column Name</Table.HeaderCell>
                <Table.HeaderCell
                  scope="col"
                  aria-label="More actions"
                  style={{
                    width: 56,
                    textAlign: "center",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      justifyContent: "center",
                      color: "var(--color-icon-primary)",
                    }}
                  >
                    <EllipsisVertical size="sm" aria-hidden />
                  </span>
                </Table.HeaderCell>
              </Table.HeaderRow>
            </Table.Header>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                <Table.Body>
                  {filteredRows.map((row) => (
                    <SortableColumnRow key={row.id} row={row} setEnabled={setEnabled} />
                  ))}
                </Table.Body>
              </SortableContext>
            </DndContext>
          </Table>
        </Table.Container>
      </div>
    </div>
  );
}
