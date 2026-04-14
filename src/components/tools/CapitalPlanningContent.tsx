import React, { useEffect, useMemo, useState, type ChangeEvent } from "react";
import {
  Button,
  Checkbox,
  Dropdown,
  Search,
  Select,
  SplitViewCard,
  ToggleButton,
  Typography,
} from "@procore/core-react";
import {
  CurrencyUSA as CapitalPlanningIcon,
  Filter,
  Fullscreen,
  FullscreenExit,
  Plus,
  Sliders,
} from "@procore/core-icons";
import ToolPageLayout from "@/components/tools/ToolPageLayout";
import { CreateSnapshotModal } from "@/components/tools/capitalPlanning/CreateSnapshotModal";
import { CapitalPlanningSmartGrid } from "@/components/tools/capitalPlanning/CapitalPlanningSmartGrid";
import type { CapitalPlanningSampleRow, ProjectCurve, ProjectPriority } from "@/components/tools/capitalPlanning/capitalPlanningData";
import {
  isLumpSumPlannedAmountSource,
  PROJECT_BUDGET_ORIGINAL_SOURCE,
  PROJECT_BUDGET_REVISED_SOURCE,
  SAMPLE_PROJECT_ROWS,
  initialCurves,
  initialPriorities,
  initialRowDates,
} from "@/components/tools/capitalPlanning/capitalPlanningData";
import type { ForecastGranularity } from "@/components/tools/capitalPlanning/capitalPlanningForecast";
import { DEFAULT_CAPITAL_PLANNING_COLUMN_GROUP_VISIBILITY } from "@/components/tools/capitalPlanning/capitalPlanningColumnGroups";
import { formatDateMMDDYYYY } from "@/utils/date";

const GROUP_BY_COLUMN_OPTIONS = [
  { id: "project" as const, label: "Project" },
  { id: "status" as const, label: "Status" },
  { id: "priority" as const, label: "Priority" },
  { id: "curve" as const, label: "Curve" },
  { id: "originalBudget" as const, label: "Original Budget" },
  { id: "revisedBudget" as const, label: "Revised Budget" },
];

type GroupByColumnId = (typeof GROUP_BY_COLUMN_OPTIONS)[number]["id"];

/** Prototype snapshot list — replace with API when snapshots ship. Figma: Capital Planning Explorations node 5167-579189. */
const SNAPSHOT_SELECT_OPTIONS = [
  { id: "live", label: "Current plan (live)" },
  { id: "baseline-jan-2026", label: "Baseline — Jan 15, 2026" },
  { id: "board-dec-2025", label: "Board review — Dec 1, 2025" },
] as const;

type SnapshotSelectId = (typeof SNAPSHOT_SELECT_OPTIONS)[number]["id"];

const CAPITAL_PLANNING_SNAPSHOT_SELECT_LABEL_ID = "capital-planning-snapshot-select-label";

export default function CapitalPlanningContent() {
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [configureOpen, setConfigureOpen] = useState(false);
  const [configShowEmpty, setConfigShowEmpty] = useState(true);
  const [tableFullscreen, setTableFullscreen] = useState(false);
  const [snapshotModalOpen, setSnapshotModalOpen] = useState(false);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<SnapshotSelectId | null>(null);
  /** Prototype — wire to grouped rows when product supports it. */
  const [groupByColumn, setGroupByColumn] = useState<GroupByColumnId | null>(null);
  const [prioritiesByRowId, setPrioritiesByRowId] = useState<Record<string, ProjectPriority>>(initialPriorities);
  const [rowDatesById, setRowDatesById] = useState<Record<string, { startDate: string; endDate: string }>>(
    initialRowDates
  );
  const [curvesByRowId, setCurvesByRowId] = useState<Record<string, ProjectCurve>>(initialCurves);
  const [plannedAmountSourceByRowId, setPlannedAmountSourceByRowId] = useState<Record<string, string>>({});
  const [plannedAmountManualByRowId, setPlannedAmountManualByRowId] = useState<Record<string, number>>({});
  /** Forecast period columns in the grid (toolbar removed; wire to product control when needed). */
  const forecastGranularity: ForecastGranularity = "quarter";

  useEffect(() => {
    if (!tableFullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setTableFullscreen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [tableFullscreen]);

  const projectRows = useMemo((): CapitalPlanningSampleRow[] => {
    return SAMPLE_PROJECT_ROWS.map((r) => {
      const dates = rowDatesById[r.id];
      const source = plannedAmountSourceByRowId[r.id];
      const lumpSum = isLumpSumPlannedAmountSource(source);
      const manual = plannedAmountManualByRowId[r.id];
      let plannedAmount = r.plannedAmount;
      if (lumpSum && manual !== undefined) {
        plannedAmount = manual;
      } else if (source === PROJECT_BUDGET_ORIGINAL_SOURCE) {
        plannedAmount = r.originalBudget ?? r.plannedAmount;
      } else if (source === PROJECT_BUDGET_REVISED_SOURCE) {
        plannedAmount = r.revisedBudget ?? r.plannedAmount;
      }
      return {
        ...r,
        priority: prioritiesByRowId[r.id] ?? r.priority,
        startDate: dates?.startDate ?? r.startDate,
        endDate: dates?.endDate ?? r.endDate,
        curve: curvesByRowId[r.id] ?? r.curve,
        plannedAmount,
      };
    });
  }, [
    prioritiesByRowId,
    rowDatesById,
    curvesByRowId,
    plannedAmountSourceByRowId,
    plannedAmountManualByRowId,
  ]);

  const filteredProjectRows = useMemo((): CapitalPlanningSampleRow[] => {
    const q = search.trim().toLowerCase();
    if (!q) return projectRows;
    return projectRows.filter(
      (r) =>
        r.project.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q) ||
        r.priority.toLowerCase().includes(q) ||
        r.curve.toLowerCase().includes(q) ||
        formatDateMMDDYYYY(r.startDate).toLowerCase().includes(q) ||
        formatDateMMDDYYYY(r.endDate).toLowerCase().includes(q) ||
        String(r.remaining).includes(q)
    );
  }, [search, projectRows]);

  const breadcrumbs = [
    { label: "Portfolio", href: "/portfolio" },
  ];

  const actions = (
    <>
      <Button variant="secondary" icon={<Plus />} onClick={() => setSnapshotModalOpen(true)}>
        Create Snapshot
      </Button>
      <Dropdown label="Export" variant="secondary">
        <Dropdown.Item item="csv">CSV</Dropdown.Item>
        <Dropdown.Item item="excel">Excel</Dropdown.Item>
      </Dropdown>
    </>
  );

  return (
    <>
    <ToolPageLayout
      title="Capital Planning"
      icon={<CapitalPlanningIcon size="md" />}
      breadcrumbs={breadcrumbs}
      actions={actions}
    >
      <SplitViewCard>
        <SplitViewCard.Main>
          <SplitViewCard.Section>
            <div
              className="capital-planning-tool-section"
              style={{
                minWidth: 0,
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box",
                ...(tableFullscreen
                  ? {
                      position: "fixed",
                      inset: 0,
                      zIndex: 1300,
                      background: "#ffffff",
                      padding: 16,
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                    }
                  : {}),
              }}
            >
            <div
              className="capital-planning-toolbar-stack"
              style={tableFullscreen ? { flexShrink: 0 } : undefined}
            >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                width: "100%",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                  width: "100%",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flex: "0 1 auto",
                    minWidth: 0,
                    maxWidth: "100%",
                  }}
                >
                  <Typography
                    id={CAPITAL_PLANNING_SNAPSHOT_SELECT_LABEL_ID}
                    intent="small"
                    weight="semibold"
                    as="span"
                    style={{ flexShrink: 0 }}
                  >
                    Snapshot
                  </Typography>
                  <div style={{ width: 280, minWidth: 200, maxWidth: "100%", flex: "1 1 auto" }}>
                    <Select
                      aria-labelledby={CAPITAL_PLANNING_SNAPSHOT_SELECT_LABEL_ID}
                      className="capital-planning-group-by-select"
                      block
                      placeholder="Select snapshot"
                      label={
                        selectedSnapshotId
                          ? SNAPSHOT_SELECT_OPTIONS.find((o) => o.id === selectedSnapshotId)?.label
                          : undefined
                      }
                      onClear={selectedSnapshotId ? () => setSelectedSnapshotId(null) : undefined}
                      onSelect={(selection) => {
                        if (selection.action !== "selected") return;
                        const opt = selection.item as (typeof SNAPSHOT_SELECT_OPTIONS)[number];
                        setSelectedSnapshotId(opt.id);
                      }}
                    >
                      {SNAPSHOT_SELECT_OPTIONS.map((opt) => (
                        <Select.Option key={opt.id} value={opt} selected={selectedSnapshotId === opt.id}>
                          {opt.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                </div>
                <Button
                  variant="tertiary"
                  icon={tableFullscreen ? <FullscreenExit /> : <Fullscreen />}
                  onClick={() => setTableFullscreen((v) => !v)}
                  style={{ flexShrink: 0 }}
                >
                  {tableFullscreen ? "Exit Full Screen" : "Full Screen"}
                </Button>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                  minWidth: 0,
                  width: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                    minWidth: 0,
                    flex: "1 1 auto",
                  }}
                >
                  <div style={{ width: 280, maxWidth: "100%", minWidth: 0 }}>
                    <Search
                      placeholder="Search Projects"
                      value={search}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                    />
                  </div>
                  <ToggleButton
                    selected={filterOpen}
                    icon={<Filter />}
                    onClick={() => setFilterOpen((v) => !v)}
                  >
                    Filter
                  </ToggleButton>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                    flexShrink: 0,
                    justifyContent: "flex-end",
                    minWidth: 0,
                  }}
                >
                  <div style={{ width: 260, maxWidth: "100%", minWidth: 0 }}>
                    <Select
                      className="capital-planning-group-by-select"
                      block
                      placeholder="Select a Column to Group"
                      label={
                        groupByColumn
                          ? GROUP_BY_COLUMN_OPTIONS.find((o) => o.id === groupByColumn)?.label
                          : undefined
                      }
                      onClear={groupByColumn ? () => setGroupByColumn(null) : undefined}
                      onSelect={(selection) => {
                        if (selection.action !== "selected") return;
                        const opt = selection.item as (typeof GROUP_BY_COLUMN_OPTIONS)[number];
                        setGroupByColumn(opt.id);
                      }}
                    >
                      {GROUP_BY_COLUMN_OPTIONS.map((opt) => (
                        <Select.Option key={opt.id} value={opt} selected={groupByColumn === opt.id}>
                          {opt.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                  <Button
                    variant="tertiary"
                    icon={<Sliders />}
                    onClick={() => setConfigureOpen((v) => !v)}
                  >
                    Configure
                  </Button>
                </div>
              </div>
            </div>
            {configureOpen && (
              <div
                style={{
                  marginBottom: 12,
                  padding: 12,
                  border: "1px solid #d6dadc",
                  borderRadius: 8,
                  background: "#fafbfb",
                  ...(tableFullscreen ? { flexShrink: 0 } : {}),
                }}
              >
                <Typography intent="small" weight="bold" style={{ display: "block", marginBottom: 8 }}>
                  Configuration
                </Typography>
                <Typography intent="small" color="gray45" style={{ display: "block", marginBottom: 10, lineHeight: 1.45 }}>
                  Prototype Options — Wire to Data When Programs Exist.
                </Typography>
                <Checkbox checked={configShowEmpty} onChange={() => setConfigShowEmpty((v) => !v)}>
                  Show Sample Project Rows in the Table
                </Checkbox>
              </div>
            )}
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
                ...(tableFullscreen ? { flex: 1, minHeight: 0 } : {}),
              }}
            >
            {filterOpen && (
              <aside
                className="capital-planning-filter-panel"
                style={{
                  width: 280,
                  flex: "0 0 280px",
                  boxSizing: "border-box",
                  padding: 16,
                  border: "1px solid #d6dadc",
                  borderRadius: 8,
                  background: "#fafbfb",
                  alignSelf: "flex-start",
                  ...(tableFullscreen ? { flexShrink: 0, maxHeight: "100%", overflow: "auto" } : {}),
                }}
              >
                <Typography intent="small" weight="bold" style={{ display: "block", marginBottom: 12 }}>
                  Filters
                </Typography>
                <Typography
                  intent="small"
                  color="gray45"
                  style={{ display: "block", marginBottom: 6, lineHeight: 1.4 }}
                >
                  Group by
                </Typography>
                <Select
                  className="capital-planning-group-by-select"
                  block
                  placeholder="Select a Column to Group"
                  label={
                    groupByColumn
                      ? GROUP_BY_COLUMN_OPTIONS.find((o) => o.id === groupByColumn)?.label
                      : undefined
                  }
                  onClear={groupByColumn ? () => setGroupByColumn(null) : undefined}
                  onSelect={(selection) => {
                    if (selection.action !== "selected") return;
                    const opt = selection.item as (typeof GROUP_BY_COLUMN_OPTIONS)[number];
                    setGroupByColumn(opt.id);
                  }}
                >
                  {GROUP_BY_COLUMN_OPTIONS.map((opt) => (
                    <Select.Option key={opt.id} value={opt} selected={groupByColumn === opt.id}>
                      {opt.label}
                    </Select.Option>
                  ))}
                </Select>
                <Typography
                  intent="small"
                  color="gray45"
                  style={{ display: "block", marginTop: 16, lineHeight: 1.45 }}
                >
                  Additional column and status filters — Coming Soon.
                </Typography>
              </aside>
            )}
            {/* Horizontal (and fullscreen vertical) scroll only inside this region — filter stays put. */}
            <div
              className={[
                "capital-planning-table-scroll-region",
                tableFullscreen ? "capital-planning-table-scroll-region--fullscreen" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{
                minWidth: 0,
                flex: "1 1 auto",
                width: "100%",
                maxWidth: "100%",
                ...(tableFullscreen
                  ? { minHeight: 0, overflow: "auto" }
                  : {}),
              }}
            >
            <CapitalPlanningSmartGrid
              columnGroupVisibility={DEFAULT_CAPITAL_PLANNING_COLUMN_GROUP_VISIBILITY}
              configShowEmpty={configShowEmpty}
              search={search}
              filteredProjectRows={filteredProjectRows}
              plannedAmountSourceByRowId={plannedAmountSourceByRowId}
              setPlannedAmountSourceByRowId={setPlannedAmountSourceByRowId}
              plannedAmountManualByRowId={plannedAmountManualByRowId}
              setPlannedAmountManualByRowId={setPlannedAmountManualByRowId}
              setPrioritiesByRowId={setPrioritiesByRowId}
              setRowDatesById={setRowDatesById}
              setCurvesByRowId={setCurvesByRowId}
              forecastGranularity={forecastGranularity}
            />
            </div>
            </div>
            </div>
          </SplitViewCard.Section>
        </SplitViewCard.Main>
      </SplitViewCard>
    </ToolPageLayout>
    <CreateSnapshotModal open={snapshotModalOpen} onClose={() => setSnapshotModalOpen(false)} />
    </>
  );
}
