import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Table, Typography } from "@procore/core-react";
import { AddTargetBudgetTearsheet, type AddTargetBudgetSavePayload } from "./AddTargetBudgetTearsheet";
import {
  CaretDown,
  CaretRight,
  CaretsIn,
  CaretsInHorizontalWithLine,
  CaretsInVertical,
  CaretsOut,
  CaretsOutVertical,
} from "@procore/core-icons";
import {
  baselineCellClasses,
  columnVisibilityToGroupVisibility,
  type CapitalPlanningColumnVisibility,
} from "./capitalPlanningColumnGroups";
import type { CapitalPlanningSampleRow } from "./capitalPlanningData";
import { ForecastEditableNumberCell } from "./CapitalPlanningSmartGrid";
import {
  flattenLocationHierarchyAggregatesOnly,
  groupProjectRowsByRegionCampusBuilding,
} from "./capitalPlanningRowGrouping";
import {
  CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS,
  fiscalQuarterMonthGlobalIndices,
  getDefaultForecastFqCollapsed,
  getProgramForecastFqLabels,
  getProgramForecastMonthLabels,
  programForecastFyLabel,
  type ForecastGranularity,
} from "./capitalPlanningForecast";
import {
  enumerateTargetBudgetForecastColumns,
  mergeTargetBudgetSpreadSaveIntoOverrides,
  TARGET_BUDGET_FORECAST_BASIS_KEY,
  readTargetBudgetOverrideForCell,
} from "./targetBudgetForecastColumnMeta";

/** Target Budget view only: each FY band starts collapsed to a single year column. */
function getTargetBudgetDefaultFyYearSectionExpanded(): boolean[] {
  return CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.map(() => false);
}

function quarterLeafColumnsForFy(fyIndex: number, fqCollapsed: readonly boolean[]): number {
  let sum = 0;
  for (let q = 0; q < 4; q++) {
    const g = fyIndex * 4 + q;
    sum += fqCollapsed[g] ? 1 : 3;
  }
  return sum;
}

function allFqCollapsedForFy(fyIndex: number, fqCollapsed: readonly boolean[]): boolean {
  const base = fyIndex * 4;
  return (
    fqCollapsed[base] &&
    fqCollapsed[base + 1] &&
    fqCollapsed[base + 2] &&
    fqCollapsed[base + 3]
  );
}

function ForecastFyGroupHeaderCell({
  expanded,
  fyLabel,
  colSpan,
  onToggle,
  showToggle = true,
}: {
  expanded: boolean;
  fyLabel: string;
  colSpan?: number;
  onToggle: () => void;
  showToggle?: boolean;
}) {
  const labelOnly = fyLabel.trim() === "";
  return (
    <Table.HeaderCell
      {...(colSpan !== undefined ? { colSpan } : {})}
      className="capital-planning-forecast-cost-group"
    >
      <div
        className={[
          "capital-planning-forecast-cost-group-inner",
          labelOnly ? "capital-planning-forecast-cost-group-inner--toggle-only" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {!labelOnly ? <span className="capital-planning-forecast-fy-label">{fyLabel}</span> : null}
        {showToggle ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="capital-planning-forecast-fy-toggle"
            icon={expanded ? <CaretsIn size="sm" /> : <CaretsOut size="sm" />}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggle();
            }}
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse forecast columns" : "Expand forecast columns"}
          />
        ) : null}
      </div>
    </Table.HeaderCell>
  );
}

function ForecastPeriodHeaderCell({
  label,
  onToggle,
  colSpan = 1,
  expanded,
  toggleAriaLabel,
  fqMonthWidthHeader = false,
  showToggle = true,
}: {
  label: string;
  onToggle: () => void;
  colSpan?: number;
  expanded: boolean;
  toggleAriaLabel: string;
  fqMonthWidthHeader?: boolean;
  showToggle?: boolean;
}) {
  return (
    <Table.HeaderCell
      colSpan={colSpan}
      className={[
        "capital-planning-forecast-period-header",
        fqMonthWidthHeader ? "capital-planning-forecast-period-header--fq-month-width" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="capital-planning-forecast-period-header-inner">
        <span className="capital-planning-forecast-period-label">{label}</span>
        {showToggle ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="capital-planning-forecast-fy-toggle"
            icon={expanded ? <CaretsIn size="sm" /> : <CaretsOut size="sm" />}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggle();
            }}
            aria-expanded={expanded}
            aria-label={toggleAriaLabel}
          />
        ) : null}
      </div>
    </Table.HeaderCell>
  );
}

export interface TargetBudgetHierarchyForecastTableProps {
  filteredProjectRows: readonly CapitalPlanningSampleRow[];
  fiscalYearStartMonth: number;
  columnVisibility: CapitalPlanningColumnVisibility;
  /** When true, show computed rollups only (no inline edits). */
  readOnly?: boolean;
  /**
   * Persist target amounts across tab unmounts. Pass both from the parent (e.g. Capital Planning shell);
   * if omitted, the table keeps its own in-memory state.
   */
  targetBudgetForecastOverrides?: Record<string, number>;
  setTargetBudgetForecastOverrides?: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  /** When true, hide all forecast column expand/collapse controls. */
  disableForecastColumnToggles?: boolean;
  /** Optional external CTA event name to open Add Target Budget tearsheet. */
  addTargetBudgetCtaEventName?: string;
  /** Show "Total Targets" column between Project Programs and FY columns. */
  showTotalTargetsColumn?: boolean;
}

/**
 * Target Budget tab: Region → Campus → Building rollups only (no project rows), with the same
 * FY / quarter / month forecast column expand–collapse behavior as the Capital Plan grid.
 * FY year bands default to collapsed on this view only.
 */

const TARGET_BUDGET_CELL_USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatTargetBudgetCellUsd(n: number): string {
  return TARGET_BUDGET_CELL_USD.format(Number.isFinite(n) ? n : 0);
}

const FOOTER_TOTAL_BOLD_STYLE: React.CSSProperties = { fontWeight: 700 };

/** Procore `Table.CurrencyCell` with `value={0}` renders empty — totals must show `$0.00`. */
function targetBudgetFooterCurrencyCell(value: number, style?: React.CSSProperties): React.ReactElement {
  const v = Number.isFinite(value) ? value : 0;
  if (v === 0) {
    return (
      <Table.CurrencyCell style={style}>
        {formatTargetBudgetCellUsd(0)}
      </Table.CurrencyCell>
    );
  }
  return <Table.CurrencyCell value={v} style={style} />;
}

export function TargetBudgetHierarchyForecastTable({
  filteredProjectRows,
  fiscalYearStartMonth,
  columnVisibility,
  readOnly = false,
  targetBudgetForecastOverrides: targetBudgetForecastOverridesProp,
  setTargetBudgetForecastOverrides: setTargetBudgetForecastOverridesProp,
  disableForecastColumnToggles = false,
  addTargetBudgetCtaEventName,
  showTotalTargetsColumn = false,
}: TargetBudgetHierarchyForecastTableProps) {
  const show = columnVisibilityToGroupVisibility(columnVisibility);
  const forecastGranularity: ForecastGranularity = "quarter";
  const ganttFlatForecast = false;

  /** Matches program grid: master “Forecast” strip can collapse to a single column. */
  const [forecastColumnsExpanded, setForecastColumnsExpanded] = useState(true);
  const [fqCollapsed, setFqCollapsed] = useState<boolean[]>(getDefaultForecastFqCollapsed);
  const [fyYearSectionExpanded, setFyYearSectionExpanded] = useState<boolean[]>(
    getTargetBudgetDefaultFyYearSectionExpanded
  );
  const [locationHierarchyCollapsed, setLocationHierarchyCollapsed] = useState<Record<string, boolean>>({});
  const [internalTargetBudgetOverrides, setInternalTargetBudgetOverrides] = useState<Record<string, number>>({});
  const targetBudgetForecastOverridesControlled =
    targetBudgetForecastOverridesProp !== undefined &&
    setTargetBudgetForecastOverridesProp !== undefined;
  const targetBudgetForecastOverrides = targetBudgetForecastOverridesControlled
    ? targetBudgetForecastOverridesProp
    : internalTargetBudgetOverrides;
  const setTargetBudgetForecastOverrides = targetBudgetForecastOverridesControlled
    ? setTargetBudgetForecastOverridesProp
    : setInternalTargetBudgetOverrides;
  const [addTargetBudgetCtx, setAddTargetBudgetCtx] = useState<{
    collapseKey: string;
    columnIndex: number;
    initialAmount: number;
    startBlank?: boolean;
  } | null>(null);

  const forecastLeafLabels = useMemo(() => getProgramForecastMonthLabels(), []);
  const forecastFqLabels = useMemo(() => getProgramForecastFqLabels(), []);

  const forecastMasterHeaderLabel = "";

  const quarterThreeRowForecastHeader = forecastGranularity === "quarter" && !ganttFlatForecast;
  const fyOnlyHeaderMode =
    disableForecastColumnToggles && forecastGranularity === "quarter" && forecastColumnsExpanded;

  const headerBaseRowSpan = useMemo(() => {
    if (!show.forecast) return 1;
    if (fyOnlyHeaderMode) return 2;
    if (!quarterThreeRowForecastHeader) return 2;
    if (forecastGranularity === "quarter" && forecastColumnsExpanded) return 4;
    return 3;
  }, [
    show.forecast,
    fyOnlyHeaderMode,
    quarterThreeRowForecastHeader,
    forecastGranularity,
    forecastColumnsExpanded,
  ]);

  useEffect(() => {
    if (forecastGranularity === "quarter" && !ganttFlatForecast) {
      setFqCollapsed(getDefaultForecastFqCollapsed());
      setFyYearSectionExpanded(getTargetBudgetDefaultFyYearSectionExpanded());
    }
  }, [fiscalYearStartMonth, forecastGranularity, ganttFlatForecast]);

  const quarterExpandedLeafColumns = useMemo(() => {
    return CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.reduce((sum, _, fyIndex) => {
      if (!fyYearSectionExpanded[fyIndex]) return sum + 1;
      return sum + quarterLeafColumnsForFy(fyIndex, fqCollapsed);
    }, 0);
  }, [fyYearSectionExpanded, fqCollapsed]);

  const leafColumnCountForTable = useMemo(() => {
    if (!forecastColumnsExpanded) {
      if (forecastGranularity === "quarter") return 1;
      return forecastLeafLabels.length;
    }
    if (forecastGranularity === "quarter") return quarterExpandedLeafColumns;
    return forecastLeafLabels.length;
  }, [forecastColumnsExpanded, forecastGranularity, quarterExpandedLeafColumns, forecastLeafLabels.length]);

  const handleForecastBlockToggle = useCallback(() => {
    setForecastColumnsExpanded((v) => {
      const next = !v;
      if (next) {
        setFqCollapsed(getDefaultForecastFqCollapsed());
        setFyYearSectionExpanded(getTargetBudgetDefaultFyYearSectionExpanded());
      }
      return next;
    });
  }, []);

  /** Target Budget tab shows $0 until the user sets an amount (no Capital Plan rollup). */
  const forecastZeroRow = useMemo(
    () => Array.from({ length: leafColumnCountForTable }, () => 0),
    [leafColumnCountForTable]
  );

  const locationTree = useMemo(
    () => groupProjectRowsByRegionCampusBuilding(filteredProjectRows),
    [filteredProjectRows]
  );

  const hierarchyRows = useMemo(
    () => flattenLocationHierarchyAggregatesOnly(locationTree, locationHierarchyCollapsed),
    [locationTree, locationHierarchyCollapsed]
  );

  const targetBudgetColumnMetas = useMemo(
    () =>
      enumerateTargetBudgetForecastColumns({
        forecastColumnsExpanded,
        forecastGranularity: "quarter",
        fyYearSectionExpanded,
        fqCollapsed,
        fiscalYearStartMonth,
        forecastFqLabels,
        forecastMonthLabels: forecastLeafLabels,
      }),
    [
      forecastColumnsExpanded,
      fyYearSectionExpanded,
      fqCollapsed,
      fiscalYearStartMonth,
      forecastFqLabels,
      forecastLeafLabels,
    ]
  );

  const handleAddTargetBudgetSave = useCallback(
    (p: AddTargetBudgetSavePayload) => {
      setTargetBudgetForecastOverrides((prev) =>
        mergeTargetBudgetSpreadSaveIntoOverrides(
          prev,
          p.hierarchyCollapseKey,
          p.periodKey,
          p.amount,
          fiscalYearStartMonth,
          p.columnIndex,
          p.curve
        )
      );
      setAddTargetBudgetCtx(null);
    },
    [fiscalYearStartMonth, setTargetBudgetForecastOverrides]
  );

  const openAddTargetBudgetFromCta = useCallback(() => {
    if (readOnly) return;
    setAddTargetBudgetCtx({
      collapseKey: "",
      columnIndex: 0,
      initialAmount: 0,
      startBlank: true,
    });
  }, [
    readOnly,
  ]);

  useEffect(() => {
    if (!addTargetBudgetCtaEventName) return;
    const onOpen = () => openAddTargetBudgetFromCta();
    window.addEventListener(addTargetBudgetCtaEventName, onOpen);
    return () => window.removeEventListener(addTargetBudgetCtaEventName, onOpen);
  }, [addTargetBudgetCtaEventName, openAddTargetBudgetFromCta]);

  const toggleLocationHierarchyCollapsed = useCallback((key: string) => {
    setLocationHierarchyCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const allLocationHierarchyRegionsExpanded = useMemo(() => {
    if (!locationTree.length) return false;
    return locationTree.every((r) => !locationHierarchyCollapsed[`r:${r.key}`]);
  }, [locationTree, locationHierarchyCollapsed]);

  const allLocationHierarchyRegionsCollapsed = useMemo(() => {
    if (!locationTree.length) return false;
    return locationTree.every((r) => Boolean(locationHierarchyCollapsed[`r:${r.key}`]));
  }, [locationTree, locationHierarchyCollapsed]);

  const toggleAllLocationHierarchyRegions = useCallback(() => {
    if (!locationTree.length) return;
    setLocationHierarchyCollapsed((prev) => {
      const collapseAll = locationTree.every((r) => !prev[`r:${r.key}`]);
      const next = { ...prev };
      for (const r of locationTree) {
        next[`r:${r.key}`] = collapseAll;
      }
      return next;
    });
  }, [locationTree]);

  const tableColumnCount = (showTotalTargetsColumn ? 2 : 1) + (show.forecast ? leafColumnCountForTable : 0);

  /** Match {@link CapitalPlanningSmartGrid} body: 150px rollup/month cells, not 396px period cells. */
  const targetBudgetForecastBodyCellClasses = useMemo((): string[] => {
    if (!show.forecast) return [];
    if (!forecastColumnsExpanded) {
      if (forecastGranularity === "quarter") {
        return ["capital-planning-forecast-fq-rollup-cell"];
      }
      return forecastLeafLabels.map(() => "capital-planning-forecast-period-cell");
    }
    if (forecastGranularity !== "quarter") {
      return forecastLeafLabels.map(() => "capital-planning-forecast-period-cell");
    }
    const classes: string[] = [];
    for (let fyIndex = 0; fyIndex < CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.length; fyIndex++) {
      if (!fyYearSectionExpanded[fyIndex]) {
        classes.push("capital-planning-forecast-fq-rollup-cell");
        continue;
      }
      for (let fqInFy = 0; fqInFy < 4; fqInFy++) {
        const fqIndex = fyIndex * 4 + fqInFy;
        if (fqCollapsed[fqIndex]) {
          classes.push("capital-planning-forecast-fq-rollup-cell");
        } else {
          classes.push(
            "capital-planning-forecast-month-cell",
            "capital-planning-forecast-month-cell",
            "capital-planning-forecast-month-cell"
          );
        }
      }
    }
    return classes;
  }, [
    show.forecast,
    forecastColumnsExpanded,
    forecastGranularity,
    fyYearSectionExpanded,
    fqCollapsed,
    forecastLeafLabels,
  ]);

  /**
   * Grand total per period: sum region-tier (depth 0) amounts so campus/building rows are not double-counted.
   * Region rows partition the portfolio; values entered only on lower tiers are excluded here (prototype).
   */
  const grandTotalForecastByColumn = useMemo(() => {
    if (!show.forecast) return [];
    const n = leafColumnCountForTable;
    const totals = Array.from({ length: n }, () => 0);
    const regionRows = hierarchyRows.filter((item) => item.depth === 0);
    for (const item of regionRows) {
      for (let idx = 0; idx < n; idx++) {
        const meta = targetBudgetColumnMetas.find((m) => m.columnIndex === idx);
        const v = readOnly
          ? 0
          : readTargetBudgetOverrideForCell(
              [item.collapseKey],
              meta,
              idx,
              targetBudgetForecastOverrides,
              fiscalYearStartMonth
            );
        totals[idx]! += v;
      }
    }
    return totals;
  }, [
    show.forecast,
    hierarchyRows,
    leafColumnCountForTable,
    targetBudgetColumnMetas,
    targetBudgetForecastOverrides,
    fiscalYearStartMonth,
    readOnly,
  ]);
  const grandTotalTargetsAcrossAllYears = useMemo(
    () => grandTotalForecastByColumn.reduce((sum, v) => sum + v, 0),
    [grandTotalForecastByColumn]
  );

  if (!show.forecast) {
    return (
      <Typography intent="small" style={{ margin: 0, color: "var(--color-text-secondary)" }}>
        Turn on <strong>Forecast</strong> under Table Settings → Configure to use periods for target budgets.
      </Typography>
    );
  }

  const showFooterRow = filteredProjectRows.length > 0;
  const showForecastMasterRow = !ganttFlatForecast && !(forecastGranularity === "quarter" && forecastColumnsExpanded);

  return (
    <div
      className="capital-planning-table-scroll-region"
      style={{ minWidth: 0, width: "100%", maxWidth: "100%", overflow: "auto" }}
    >
      {!readOnly ? (
        <AddTargetBudgetTearsheet
          open={addTargetBudgetCtx !== null}
          onClose={() => setAddTargetBudgetCtx(null)}
          locationHierarchyTree={locationTree}
          columnMetas={targetBudgetColumnMetas}
          initialHierarchyCollapseKey={addTargetBudgetCtx?.collapseKey ?? ""}
          initialColumnIndex={addTargetBudgetCtx?.columnIndex ?? 0}
          initialAmount={addTargetBudgetCtx?.initialAmount ?? 0}
          startBlank={Boolean(addTargetBudgetCtx?.startBlank)}
          fiscalYearStartMonth={fiscalYearStartMonth}
          forecastFqLabels={forecastFqLabels}
          forecastMonthLabels={forecastLeafLabels}
          targetBudgetForecastOverrides={targetBudgetForecastOverrides}
          onSave={handleAddTargetBudgetSave}
        />
      ) : null}
      <Table.Container className="capital-planning-table-scroll capital-planning-no-row-selection capital-planning-row-height--sm">
        <Table>
          <Table.Header>
            <Table.HeaderRow>
              <Table.HeaderCell
                rowSpan={headerBaseRowSpan}
                className={baselineCellClasses("project", columnVisibility)}
              >
                <div className="capital-planning-project-header-inner">
                  <span className="capital-planning-project-checkbox-slot">
                    <span className="capital-planning-project-checkbox-spacer" aria-hidden />
                  </span>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="capital-planning-forecast-fy-toggle capital-planning-project-header-region-toggle"
                    icon={
                      allLocationHierarchyRegionsCollapsed ? (
                        <CaretsOutVertical size="sm" />
                      ) : (
                        <CaretsInVertical size="sm" />
                      )
                    }
                    disabled={!locationTree.length}
                    aria-label={
                      !locationTree.length
                        ? "No project groups"
                        : allLocationHierarchyRegionsExpanded
                          ? "Collapse all program regions"
                          : "Expand all program regions"
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleAllLocationHierarchyRegions();
                    }}
                  />
                  <span className="capital-planning-project-header-label">
                    <Typography intent="small" weight="semibold" as="span">
                      Project Programs
                    </Typography>
                  </span>
                </div>
              </Table.HeaderCell>
              {showTotalTargetsColumn ? (
                <Table.HeaderCell
                  rowSpan={headerBaseRowSpan}
                  className="capital-planning-target-total-targets-col"
                >
                  <Typography intent="small" weight="semibold" as="span">
                    Target Totals
                  </Typography>
                </Table.HeaderCell>
              ) : null}
              {showForecastMasterRow ? (
                <ForecastFyGroupHeaderCell
                  expanded={forecastColumnsExpanded}
                  fyLabel={forecastMasterHeaderLabel}
                  colSpan={forecastColumnsExpanded ? leafColumnCountForTable : 1}
                  onToggle={handleForecastBlockToggle}
                  showToggle={!disableForecastColumnToggles}
                />
              ) : null}
            </Table.HeaderRow>
            {show.forecast && !ganttFlatForecast && forecastGranularity === "quarter" && forecastColumnsExpanded ? (
              <Table.HeaderRow>
                {CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.map((fyYear, fyIndex) => (
                  <Table.HeaderCell
                    key={`tb-fy-sub-${fyYear}`}
                    colSpan={
                      fyYearSectionExpanded[fyIndex] ? quarterLeafColumnsForFy(fyIndex, fqCollapsed) : 1
                    }
                    className="capital-planning-forecast-fy-subheader"
                  >
                    <div className="capital-planning-forecast-fy-subheader-inner">
                      <span className="capital-planning-forecast-fy-subheader-label">
                        {`${programForecastFyLabel(fyYear)} Target`}
                      </span>
                      {!disableForecastColumnToggles ? (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="capital-planning-forecast-fy-toggle"
                          icon={
                            !fyYearSectionExpanded[fyIndex] ? (
                              <CaretsOut size="sm" />
                            ) : allFqCollapsedForFy(fyIndex, fqCollapsed) ? (
                              <CaretsIn size="sm" />
                            ) : (
                              <CaretsInHorizontalWithLine size="sm" />
                            )
                          }
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!fyYearSectionExpanded[fyIndex]) {
                              setFyYearSectionExpanded((prev) => {
                                const next = [...prev];
                                next[fyIndex] = true;
                                return next;
                              });
                              return;
                            }
                            if (!allFqCollapsedForFy(fyIndex, fqCollapsed)) {
                              setFqCollapsed((prevFq) => {
                                const nextFq = [...prevFq];
                                const base = fyIndex * 4;
                                for (let q = 0; q < 4; q++) {
                                  nextFq[base + q] = true;
                                }
                                return nextFq;
                              });
                              return;
                            }
                            setFyYearSectionExpanded((prev) => {
                              const next = [...prev];
                              next[fyIndex] = false;
                              return next;
                            });
                          }}
                          aria-expanded={fyYearSectionExpanded[fyIndex]}
                          aria-label={
                            !fyYearSectionExpanded[fyIndex]
                              ? `Expand ${programForecastFyLabel(fyYear)} forecast columns`
                              : !allFqCollapsedForFy(fyIndex, fqCollapsed)
                                ? `Collapse quarters in ${programForecastFyLabel(fyYear)} to quarter totals`
                                : `Collapse ${programForecastFyLabel(fyYear)} to a single year column`
                          }
                        />
                      ) : null}
                    </div>
                  </Table.HeaderCell>
                ))}
              </Table.HeaderRow>
            ) : null}
            {show.forecast && !ganttFlatForecast && !fyOnlyHeaderMode ? (
              <Table.HeaderRow>
                {forecastColumnsExpanded ? (
                  forecastGranularity === "quarter" ? (
                    CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.flatMap((fyYear, fyIndex) => {
                      if (!fyYearSectionExpanded[fyIndex]) {
                        return [
                          <Table.HeaderCell
                            key={`tb-fq-fy-collapsed-${fyYear}`}
                            className={[
                              "capital-planning-forecast-period-header",
                              "capital-planning-forecast-period-header--fq-month-width",
                              "capital-planning-forecast-period-header--collapsed",
                            ].join(" ")}
                            aria-hidden
                          >
                            {"\u00a0"}
                          </Table.HeaderCell>,
                        ];
                      }
                      return [0, 1, 2, 3].map((fqInFy) => {
                        const i = fyIndex * 4 + fqInFy;
                        const label = forecastFqLabels[i];
                        return (
                          <ForecastPeriodHeaderCell
                            key={`tb-fq-${i}-${label}-${fyYear}`}
                            label={label}
                            colSpan={fqCollapsed[i] ? 1 : 3}
                            fqMonthWidthHeader={fqCollapsed[i]}
                            expanded={!fqCollapsed[i]}
                            toggleAriaLabel={
                              fqCollapsed[i]
                                ? `Expand ${programForecastFyLabel(fyYear)} ${label} to show months`
                                : `Collapse ${programForecastFyLabel(fyYear)} ${label} to quarter total`
                            }
                            onToggle={() =>
                              setFqCollapsed((prev) => {
                                const next = [...prev];
                                next[i] = !next[i];
                                return next;
                              })
                            }
                            showToggle={!disableForecastColumnToggles}
                          />
                        );
                      });
                    })
                  ) : null
                ) : forecastGranularity === "quarter" ? (
                  <Table.HeaderCell
                    className={[
                      "capital-planning-forecast-period-header",
                      "capital-planning-forecast-period-header--fq-month-width",
                      "capital-planning-forecast-period-header--collapsed",
                    ].join(" ")}
                    aria-hidden
                  >
                    {"\u00a0"}
                  </Table.HeaderCell>
                ) : null}
              </Table.HeaderRow>
            ) : null}
            {show.forecast && quarterThreeRowForecastHeader && !fyOnlyHeaderMode ? (
              <Table.HeaderRow>
                {forecastColumnsExpanded ? (
                  CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.flatMap((fyYear, fyIndex) => {
                    if (!fyYearSectionExpanded[fyIndex]) {
                      return [
                        <th
                          key={`tb-mo-fy-collapsed-${fyYear}`}
                          className="capital-planning-forecast-fq-rollup-header"
                          role="columnheader"
                          aria-hidden
                        >
                          {"\u00a0"}
                        </th>,
                      ];
                    }
                    return [0, 1, 2, 3].flatMap((fqInFy) => {
                      const fqIndex = fyIndex * 4 + fqInFy;
                      const fqMonthIndices = fiscalQuarterMonthGlobalIndices(
                        fyIndex,
                        fqInFy,
                        fiscalYearStartMonth
                      );
                      return fqCollapsed[fqIndex]
                        ? [
                            <th
                              key={`tb-fq-rollup-h-${fqIndex}`}
                              className="capital-planning-forecast-fq-rollup-header"
                              role="columnheader"
                              aria-hidden
                            >
                              {"\u00a0"}
                            </th>,
                          ]
                        : ([0, 1, 2] as const).map((k) => {
                            const monthIdx = fqMonthIndices[k]!;
                            const label = forecastLeafLabels[monthIdx] ?? "";
                            return (
                              <Table.HeaderCell
                                key={`tb-m-${fqIndex}-${k}-${monthIdx}`}
                                className="capital-planning-forecast-month-header"
                                scope="col"
                              >
                                {label}
                              </Table.HeaderCell>
                            );
                          });
                    });
                  })
                ) : (
                  <Table.HeaderCell className="capital-planning-forecast-fq-rollup-header" aria-hidden>
                    {"\u00a0"}
                  </Table.HeaderCell>
                )}
              </Table.HeaderRow>
            ) : null}
          </Table.Header>
          <Table.Body>
            {filteredProjectRows.length === 0 ? (
              <Table.BodyRow>
                  <Table.BodyCell colSpan={tableColumnCount}>
                  <Table.TextCell>No projects in view.</Table.TextCell>
                </Table.BodyCell>
              </Table.BodyRow>
            ) : (
              hierarchyRows.map((item) => {
                const expanded = !locationHierarchyCollapsed[item.collapseKey];
                return (
                  <Table.BodyRow
                    key={`tb-hier-${item.collapseKey}`}
                    className={[
                      "capital-planning-table-status-group",
                      item.depth > 0 ? "capital-planning-program-hierarchy-aggregate" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    style={
                      item.depth > 0
                        ? ({ ["--cp-program-hierarchy-rails" as string]: item.depth } as React.CSSProperties)
                        : undefined
                    }
                  >
                    <Table.BodyCell
                      className={[
                        baselineCellClasses("project", columnVisibility),
                        "capital-planning-table-status-group-header-label-cell",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <Table.TextCell className="capital-planning-status-group-header-text-cell">
                        <div className="capital-planning-project-select-cell-inner">
                          <span className="capital-planning-project-checkbox-slot">
                            <span className="capital-planning-project-checkbox-spacer" aria-hidden />
                          </span>
                          {item.depth === 2 ? (
                            <Typography
                              intent="small"
                              weight="semibold"
                              as="span"
                              className="capital-planning-status-group-header-title"
                            >
                              {item.label}
                            </Typography>
                          ) : (
                            <button
                              type="button"
                              className="capital-planning-status-group-header-toggle"
                              aria-expanded={expanded}
                              aria-label={expanded ? `Collapse ${item.label}` : `Expand ${item.label}`}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleLocationHierarchyCollapsed(item.collapseKey);
                              }}
                            >
                              <span className="capital-planning-status-group-header-chevron" aria-hidden>
                                {expanded ? <CaretDown size="sm" /> : <CaretRight size="sm" />}
                              </span>
                              <Typography
                                intent="small"
                                weight="semibold"
                                as="span"
                                className="capital-planning-status-group-header-title"
                              >
                                {item.label}
                              </Typography>
                            </button>
                          )}
                        </div>
                      </Table.TextCell>
                    </Table.BodyCell>
                    {showTotalTargetsColumn ? (
                      <Table.BodyCell className="capital-planning-target-total-targets-col">
                        {targetBudgetFooterCurrencyCell(
                          targetBudgetColumnMetas.reduce((sum, meta) => {
                            const v = readOnly
                              ? 0
                              : readTargetBudgetOverrideForCell(
                                  [item.collapseKey],
                                  meta,
                                  meta.columnIndex,
                                  targetBudgetForecastOverrides,
                                  fiscalYearStartMonth
                                );
                            return sum + v;
                          }, 0),
                          FOOTER_TOTAL_BOLD_STYLE
                        )}
                      </Table.BodyCell>
                    ) : null}
                    {forecastZeroRow.map((_, idx) => {
                      const meta = targetBudgetColumnMetas.find((m) => m.columnIndex === idx);
                      const resolved = readOnly
                        ? 0
                        : readTargetBudgetOverrideForCell(
                            [item.collapseKey],
                            meta,
                            idx,
                            targetBudgetForecastOverrides,
                            fiscalYearStartMonth
                          );
                      const cellAria = `Target budgets for ${item.label}, period column ${idx + 1}`;
                      return (
                        <Table.BodyCell
                          key={`tb-fc-${item.collapseKey}-${idx}`}
                          className={
                            targetBudgetForecastBodyCellClasses[idx] ??
                            "capital-planning-forecast-period-cell"
                          }
                        >
                          {readOnly ? (
                            <ForecastEditableNumberCell
                              rowId={`tb-tier-${item.collapseKey}`}
                              parts={["tb", idx]}
                              forecastBasisKey={TARGET_BUDGET_FORECAST_BASIS_KEY}
                              computedValue={0}
                              overrides={{}}
                              setOverrides={setTargetBudgetForecastOverrides}
                              ariaLabel={cellAria}
                              readOnly
                            />
                          ) : (
                            <button
                              type="button"
                              className="capital-planning-target-budget-forecast-cell-trigger"
                              onClick={() =>
                                setAddTargetBudgetCtx({
                                  collapseKey: item.collapseKey,
                                  columnIndex: idx,
                                  initialAmount: resolved,
                                })
                              }
                              aria-label={`${cellAria}. Open add target budgets`}
                            >
                              {resolved === 0 ? (
                                <Table.CurrencyCell aria-hidden>{formatTargetBudgetCellUsd(0)}</Table.CurrencyCell>
                              ) : (
                                <Table.CurrencyCell value={resolved} aria-hidden />
                              )}
                            </button>
                          )}
                        </Table.BodyCell>
                      );
                    })}
                  </Table.BodyRow>
                );
              })
            )}
          </Table.Body>
          {showFooterRow ? (
            <tfoot className="capital-planning-table-sticky-footer">
              <Table.BodyRow>
                <Table.BodyCell className={baselineCellClasses("project", columnVisibility)}>
                  <Table.TextCell>
                    <div className="capital-planning-project-footer-total-inner">
                      <span className="capital-planning-project-checkbox-spacer" aria-hidden />
                      <Typography intent="small" weight="semibold">
                        Grand total
                      </Typography>
                    </div>
                  </Table.TextCell>
                </Table.BodyCell>
                {showTotalTargetsColumn ? (
                  <Table.BodyCell className="capital-planning-target-total-targets-col">
                    {targetBudgetFooterCurrencyCell(grandTotalTargetsAcrossAllYears, FOOTER_TOTAL_BOLD_STYLE)}
                  </Table.BodyCell>
                ) : null}
                {grandTotalForecastByColumn.map((v, idx) => (
                  <Table.BodyCell
                    key={`tb-footer-total-${idx}`}
                    className={[
                      targetBudgetForecastBodyCellClasses[idx] ?? "capital-planning-forecast-period-cell",
                      "capital-planning-table-footer-forecast-cell",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {targetBudgetFooterCurrencyCell(v, FOOTER_TOTAL_BOLD_STYLE)}
                  </Table.BodyCell>
                ))}
              </Table.BodyRow>
            </tfoot>
          ) : null}
        </Table>
      </Table.Container>
    </div>
  );
}
