import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  autoUpdate,
  FloatingPortal,
  flip,
  limitShift,
  offset,
  shift,
  useFloating,
  useHover,
  useInteractions,
} from "@floating-ui/react";
import {
  Button,
  DropdownFlyout,
  OverlayTrigger,
  Pill,
  Select,
  StyledDropdownFlyoutExpandIcon,
  StyledDropdownFlyoutLabel,
  Table,
  Tooltip,
  Typography,
} from "@procore/core-react";
import type { DropdownFlyoutOption } from "@procore/core-react";
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
  countVisibleBaselineDataColumns,
  isBaselineColumnVisible,
  type CapitalPlanningColumnVisibility,
} from "./capitalPlanningColumnGroups";
import type {
  CapitalPlanningSampleRow,
  PrioritizationStatusOption,
  ProjectCurve,
  ProjectPriority,
  ProjectStatus,
} from "./capitalPlanningData";
import {
  CURVE_OPTIONS,
  CURVE_SELECT_PLACEHOLDER_LABEL,
  HIGH_LEVEL_BUDGET_ITEMS_SOURCE,
  isLumpSumPlannedAmountSource,
  isPlannedAmountFlyoutOptionSelected,
  LUMP_SUM_PLANNED_AMOUNT_SOURCE,
  PLANNED_AMOUNT_FLYOUT_CAPTION_VALUE,
  PROJECT_BUDGET_ORIGINAL_SOURCE,
  PROJECT_BUDGET_REVISED_SOURCE,
  type PlannedAmountSourceOption,
  plannedAmountSourceOptionsForRow,
  PRIORITY_OPTIONS,
  PRIORITIZATION_STATUS_OPTIONS,
  PRIORITIZATION_STATUS_PILL_COLOR,
  prototypeProjectDescriptionFromName,
  STATUS_PILL_COLOR,
  dateToIsoString,
  optionalIsoStringToDate,
} from "./capitalPlanningData";
import { CurveChangeFromManualModal } from "./CurveChangeFromManualModal";
import { ForecastManualCurveModal } from "./ForecastManualCurveModal";
import {
  capitalPlanningGroupByCollapseNoun,
  capitalPlanningGroupByEmptyToolbarLabel,
  effectiveCapitalPlanningGroupBy,
  groupProjectRowsForCapitalPlanning,
  type CapitalPlanningGroupBy,
} from "./capitalPlanningRowGrouping";
import { HighLevelBudgetItemsTearsheet } from "./HighLevelBudgetItemsTearsheet";
import {
  computePrioritizationScorePercent,
  formatPrioritizationScorePercent,
} from "./capitalPlanningPrioritizationScore";

/** Criteria Builder columns: fixed width so every criterion column matches. */
const CRITERIA_COLUMN_WIDTH_PX = 200;

const CRITERIA_COLUMN_CLASS = "capital-planning-col-criteria";

const CRITERIA_COLUMN_BOX_STYLE = {
  width: CRITERIA_COLUMN_WIDTH_PX,
  minWidth: CRITERIA_COLUMN_WIDTH_PX,
  maxWidth: CRITERIA_COLUMN_WIDTH_PX,
  boxSizing: "border-box" as const,
};

function normalizePrioritizationStatus(value: string | undefined): PrioritizationStatusOption {
  const v = (value ?? "").trim();
  if (!v) return "Unassigned";
  return (PRIORITIZATION_STATUS_OPTIONS as readonly string[]).includes(v)
    ? (v as PrioritizationStatusOption)
    : "Unassigned";
}

/** Presentational title case per Unicode word (punctuation unchanged). */
function toHeaderTitleCase(text: string): string {
  return text.replace(/\p{L}+/gu, (word) =>
    word.length === 0 ? word : word.charAt(0).toLocaleUpperCase() + word.slice(1).toLocaleLowerCase()
  );
}

/**
 * Revised Budget column header tooltip — [Figma node 4401-74723](https://www.figma.com/design/wbjpyOCTw2MQaOzx4ibk6r/Capital-Planning?node-id=4401-74723).
 */
function RevisedBudgetColumnHeaderTooltipBody() {
  const ruleColor = "#ffffff";
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
      <div style={{ fontWeight: 700 }}>Revised Budget</div>
      <div style={{ fontWeight: 400 }}>Calculated Column</div>
      <div
        role="separator"
        aria-hidden
        style={{ borderTop: `2px solid ${ruleColor}`, margin: "10px 0" }}
      />
      <div>Original Budget Amount</div>
      <div>+ Approved Budget Changes</div>
      <div>+ Approved COs</div>
      <div
        role="separator"
        aria-hidden
        style={{ borderTop: `1px solid ${ruleColor}`, margin: "10px 0" }}
      />
      <div style={{ fontWeight: 700 }}>= Revised Budget</div>
    </div>
  );
}

function RemainingColumnHeaderTooltipBody() {
  const ruleColor = "#ffffff";
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
      <div style={{ fontWeight: 700 }}>Remaining</div>
      <div style={{ fontWeight: 400 }}>Calculated Column</div>
      <div
        role="separator"
        aria-hidden
        style={{ borderTop: `2px solid ${ruleColor}`, margin: "10px 0" }}
      />
      <div>Planned Amount</div>
      <div>- Job to Date Costs</div>
      <div
        role="separator"
        aria-hidden
        style={{ borderTop: `1px solid ${ruleColor}`, margin: "10px 0" }}
      />
      <div style={{ fontWeight: 700 }}>= Remaining</div>
    </div>
  );
}

function JobToDateCostsColumnHeaderTooltipBody() {
  const ruleColor = "#ffffff";
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
      <div style={{ fontWeight: 700 }}>Job to Date Costs</div>
      <div style={{ fontWeight: 400 }}>Calculated Column</div>
      <div
        role="separator"
        aria-hidden
        style={{ borderTop: `2px solid ${ruleColor}`, margin: "10px 0" }}
      />
      <div style={{ fontWeight: 400 }}>Direct Costs + Contractor</div>
      <div style={{ fontWeight: 400 }}>Invoices</div>
      <div
        role="separator"
        aria-hidden
        style={{ borderTop: `1px solid ${ruleColor}`, margin: "10px 0" }}
      />
      <div style={{ fontWeight: 400 }}>= Job to Date Costs</div>
    </div>
  );
}

function PlannedAmountColumnHeaderTooltipBody() {
  const itemStyle: React.CSSProperties = { marginBottom: 10, fontWeight: 400 };
  const labelStyle: React.CSSProperties = { fontWeight: 700 };
  return (
    <div
      style={{
        maxWidth: 440,
        fontSize: 13,
        lineHeight: 1.45,
        color: "#ffffff",
        whiteSpace: "normal",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Planned Amount</div>
      <p style={{ margin: "0 0 12px 0", fontWeight: 400 }}>
        Define the total project cost to be forecasted across your capital plan using one of the following methods:
      </p>
      <ul
        style={{
          margin: 0,
          paddingLeft: 18,
          listStyleType: "disc",
        }}
      >
        <li style={itemStyle}>
          <span style={labelStyle}>Lump Sum:</span> A single manual total for early conceptual estimates.
        </li>
        <li style={itemStyle}>
          <span style={labelStyle}>High-Level Budget Items:</span> Manually created cost categories (e.g., Hard Costs,
          Soft Costs, Land).
        </li>
        <li style={{ ...itemStyle, marginBottom: 0 }}>
          <span style={labelStyle}>Project Budget Sync:</span> Live values pulled directly from your Project Budget.
        </li>
      </ul>
    </div>
  );
}

function EstimatedBudgetColumnHeaderTooltipBody() {
  return (
    <div
      style={{
        maxWidth: 440,
        fontSize: 13,
        lineHeight: 1.45,
        color: "#ffffff",
        whiteSpace: "normal",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Estimated Budget</div>
      <p style={{ margin: 0, fontWeight: 400 }}>
        Enter a working dollar estimate for this project while scoring criteria. This value defaults to Planned Amount
        until you change it; it does not replace the Capital Plan planned amount source.
      </p>
    </div>
  );
}

/** Sticky footer row: bold all currency / numeric totals for visual consistency. */
const FOOTER_TOTAL_BOLD_STYLE: React.CSSProperties = { fontWeight: 700 };

function budgetMetricCurrencyCell(value: number | null): React.ReactElement {
  return value == null ? (
    <Table.CurrencyCell>
      <Typography intent="small" color="gray45">
        —
      </Typography>
    </Table.CurrencyCell>
  ) : (
    <Table.CurrencyCell value={value} />
  );
}
import type { ForecastGranularity } from "./capitalPlanningForecast";
import {
  CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS,
  CAPITAL_PLANNING_PROGRAM_FORECAST_MONTHS,
  CAPITAL_PLANNING_PROGRAM_FORECAST_QUARTERS,
  CAPITAL_PLANNING_PROGRAM_FY_COUNT,
  getDefaultForecastFqCollapsed,
  getDefaultFyYearSectionExpanded,
  getForecastAllocationBasisDollars,
  getForecastColumnLabels,
  getForecastLeafDollarAmount,
  expandProjectIsoDatesToCoverCalendarRange,
  getEffectiveProgramForecastMonthAmounts,
  getForecastOverridePartsCalendarRange,
  getProgramForecastFqLabels,
  getProgramForecastHeaderTitle,
  formatRemainingToForecastCurrency,
  getProgramForecastMonthLabels,
  getRemainingToForecast,
  getTotalAllocatedForecastDollars,
  getCapitalPlanningGanttBarPercents,
  getCapitalPlanningGanttBarDragRange,
  getCapitalPlanningGanttEmptyBarHorizon,
  capitalPlanningGanttDatesFromNewBarDrag,
  capitalPlanningGanttDatesAfterHorizontalShift,
  capitalPlanningGanttDatesAfterEdgeResize,
  isGlobalMonthIndexInFq1,
  isProgramForecastFq1PeriodEnded,
  programFiscalYearForGlobalMonthIndex,
  programForecastFyLabel,
  type CapitalPlanningGanttBarTimeline,
} from "./capitalPlanningForecast";

/** Leaf columns for one program FY given per-FQ rollup state (global `fqCollapsed` indices `fyIndex*4 + q`). */
function quarterLeafColumnsForFy(fyIndex: number, fqCollapsed: readonly boolean[]): number {
  let sum = 0;
  for (let q = 0; q < 4; q++) {
    const g = fyIndex * 4 + q;
    sum += fqCollapsed[g] ? 1 : 3;
  }
  return sum;
}

/** All four FQs in this program FY are rolled up to a single column each (no month breakdown). */
function allFqCollapsedForFy(fyIndex: number, fqCollapsed: readonly boolean[]): boolean {
  const base = fyIndex * 4;
  return (
    fqCollapsed[base] &&
    fqCollapsed[base + 1] &&
    fqCollapsed[base + 2] &&
    fqCollapsed[base + 3]
  );
}

function sumQuarterMonthAmounts(monthAmounts: readonly number[], globalFqIndex: number): number {
  const baseMonth = globalFqIndex * 3;
  let sum = 0;
  for (let k = 0; k < 3; k++) {
    sum += monthAmounts[baseMonth + k] ?? 0;
  }
  return sum;
}

function forecastOverrideStorageKey(
  rowId: string,
  parts: (string | number)[],
  forecastBasisKey: string
): string {
  return `${rowId}::fb:${forecastBasisKey}::${parts.join(":")}`;
}

function clearForecastOverridesForRow(
  rowId: string,
  setForecastOverrides: React.Dispatch<React.SetStateAction<Record<string, number>>>
): void {
  setForecastOverrides((prev) => {
    const next = { ...prev };
    const p = `${rowId}::fb:`;
    for (const k of Object.keys(next)) {
      if (k.startsWith(p)) delete next[k];
    }
    return next;
  });
}

/** Matches {@link ForecastEditableNumberCell} resolved dollar value for totals row. */
function resolvedForecastCellDollars(
  readOnly: boolean,
  rowId: string,
  parts: (string | number)[],
  forecastBasisKey: string,
  computedValue: number,
  forecastOverrides: Record<string, number>
): number {
  if (readOnly) {
    return Number.isFinite(computedValue) ? computedValue : 0;
  }
  const k = forecastOverrideStorageKey(rowId, parts, forecastBasisKey);
  return forecastOverrides[k] ?? computedValue;
}

/** Same aggregation as the footer row, for an arbitrary subset of project rows (e.g. one region group). */
function computeCapitalPlanningGridTotals(
  rows: readonly CapitalPlanningSampleRow[],
  args: {
    showForecast: boolean;
    leafColumnCountForTable: number;
    forecastOverrides: Record<string, number>;
    anchorDate: Date;
    forecastGranularity: ForecastGranularity;
    forecastColumnsExpanded: boolean;
    /** Collapsed master forecast vs expanded columns (Gantt is always treated as expanded for totals). */
    forecastExpandedForTotals: boolean;
    ganttFlatForecast: boolean;
    /** Gantt + month: 72-column program month grid (same aggregation as expanded grid quarter view). */
    ganttProgramMonthGrid: boolean;
    /** Gantt + quarter: 24 program quarter rollup columns. */
    ganttProgramQuarterBands: boolean;
    fyYearSectionExpanded: readonly boolean[];
    fqCollapsed: readonly boolean[];
    forecastLeafLabels: readonly string[];
    /** Prioritization / optional column: per-row override; falls back to {@link CapitalPlanningSampleRow.plannedAmount}. */
    estimatedBudgetByRowId?: Record<string, number>;
  }
): {
  planned: number;
  estimatedBudget: number;
  original: number;
  revised: number;
  jtd: number;
  remaining: number;
  forecast: number[];
} {
  const forecastLen = args.showForecast ? args.leafColumnCountForTable : 0;
  const forecastSums = forecastLen > 0 ? new Array(forecastLen).fill(0) : [];

  let planned = 0;
  let estimatedBudget = 0;
  let original = 0;
  let revised = 0;
  let jtd = 0;
  let remaining = 0;

  for (const row of rows) {
    planned += row.plannedAmount;
    estimatedBudget += args.estimatedBudgetByRowId?.[row.id] ?? row.plannedAmount;
    original += row.originalBudget ?? 0;
    revised += row.revisedBudget ?? 0;
    jtd += row.jobToDateCosts ?? 0;

    const forecastBasisKey = `${row.curve}|${row.plannedAmount}|jtd:${row.jobToDateCosts ?? ""}`;
    remaining += getRemainingToForecast(
      getForecastAllocationBasisDollars(row),
      getTotalAllocatedForecastDollars(
        row,
        args.forecastOverrides,
        forecastBasisKey,
        args.anchorDate,
        args.forecastGranularity,
        args.forecastColumnsExpanded,
        args.forecastLeafLabels.length,
        args.ganttFlatForecast,
        args.ganttProgramMonthGrid,
        args.ganttProgramQuarterBands
      )
    );

    if (!args.showForecast || forecastLen === 0) {
      continue;
    }

    const effectiveMonthAmounts = getEffectiveProgramForecastMonthAmounts(
      row,
      args.forecastOverrides,
      forecastBasisKey,
      args.anchorDate
    );

    let ci = 0;

    if (args.ganttProgramMonthGrid) {
      for (let fyIndex = 0; fyIndex < CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.length; fyIndex++) {
        const fyYear = CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS[fyIndex];
        for (let fqInFy = 0; fqInFy < 4; fqInFy++) {
          const fqIndex = fyIndex * 4 + fqInFy;
          const fq1ReadOnly = fqInFy === 0 && isProgramForecastFq1PeriodEnded(fyYear, args.anchorDate);
          for (let k = 0; k < 3; k++) {
            const monthIdx = fqIndex * 3 + k;
            const fyForMonth = programFiscalYearForGlobalMonthIndex(monthIdx);
            const monthFq1ReadOnly =
              isGlobalMonthIndexInFq1(monthIdx) &&
              fyForMonth !== undefined &&
              isProgramForecastFq1PeriodEnded(fyForMonth, args.anchorDate);
            const comp = effectiveMonthAmounts[monthIdx] ?? 0;
            forecastSums[ci] += resolvedForecastCellDollars(
              monthFq1ReadOnly,
              row.id,
              ["q", "m", monthIdx],
              forecastBasisKey,
              comp,
              args.forecastOverrides
            );
            ci++;
          }
        }
      }
      continue;
    }

    if (args.ganttProgramQuarterBands) {
      for (let fqIndex = 0; fqIndex < CAPITAL_PLANNING_PROGRAM_FORECAST_QUARTERS; fqIndex++) {
        const fyYear = CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS[Math.floor(fqIndex / 4)];
        const fq1ReadOnly =
          fyYear !== undefined && fqIndex % 4 === 0 && isProgramForecastFq1PeriodEnded(fyYear, args.anchorDate);
        const comp = sumQuarterMonthAmounts(effectiveMonthAmounts, fqIndex);
        forecastSums[ci] += resolvedForecastCellDollars(
          fq1ReadOnly,
          row.id,
          ["q", "r", fqIndex],
          forecastBasisKey,
          comp,
          args.forecastOverrides
        );
        ci++;
      }
      continue;
    }

    if (args.ganttFlatForecast) {
      for (let i = 0; i < args.forecastLeafLabels.length; i++) {
        const comp = getForecastLeafDollarAmount(row, i, args.forecastGranularity, args.anchorDate);
        forecastSums[ci] += resolvedForecastCellDollars(
          false,
          row.id,
          ["x", args.forecastGranularity, "e", i],
          forecastBasisKey,
          comp,
          args.forecastOverrides
        );
        ci++;
      }
      continue;
    }

    if (!args.forecastExpandedForTotals) {
      if (args.forecastGranularity === "quarter") {
        const comp = effectiveMonthAmounts.reduce((a, b) => a + b, 0);
        forecastSums[ci] += resolvedForecastCellDollars(
          false,
          row.id,
          ["q", "fy"],
          forecastBasisKey,
          comp,
          args.forecastOverrides
        );
      } else {
        for (let i = 0; i < args.forecastLeafLabels.length; i++) {
          const comp = getForecastLeafDollarAmount(row, i, args.forecastGranularity, args.anchorDate);
          forecastSums[ci] += resolvedForecastCellDollars(
            false,
            row.id,
            ["x", args.forecastGranularity, "c", i],
            forecastBasisKey,
            comp,
            args.forecastOverrides
          );
          ci++;
        }
      }
      continue;
    }

    if (args.forecastGranularity === "quarter") {
      for (let fyIndex = 0; fyIndex < CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.length; fyIndex++) {
        const fyYear = CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS[fyIndex];
        if (!args.fyYearSectionExpanded[fyIndex]) {
          const comp = effectiveMonthAmounts
            .slice(fyIndex * 12, fyIndex * 12 + 12)
            .reduce((a, b) => a + b, 0);
          forecastSums[ci] += resolvedForecastCellDollars(
            false,
            row.id,
            ["q", "y", fyIndex],
            forecastBasisKey,
            comp,
            args.forecastOverrides
          );
          ci++;
          continue;
        }
        for (let fqInFy = 0; fqInFy < 4; fqInFy++) {
          const fqIndex = fyIndex * 4 + fqInFy;
          const fq1ReadOnly = fqInFy === 0 && isProgramForecastFq1PeriodEnded(fyYear, args.anchorDate);
          if (args.fqCollapsed[fqIndex]) {
            const comp = sumQuarterMonthAmounts(effectiveMonthAmounts, fqIndex);
            forecastSums[ci] += resolvedForecastCellDollars(
              fq1ReadOnly,
              row.id,
              ["q", "r", fqIndex],
              forecastBasisKey,
              comp,
              args.forecastOverrides
            );
            ci++;
          } else {
            for (let k = 0; k < 3; k++) {
              const monthIdx = fqIndex * 3 + k;
              const fyForMonth = programFiscalYearForGlobalMonthIndex(monthIdx);
              const monthFq1ReadOnly =
                isGlobalMonthIndexInFq1(monthIdx) &&
                fyForMonth !== undefined &&
                isProgramForecastFq1PeriodEnded(fyForMonth, args.anchorDate);
              const comp = effectiveMonthAmounts[monthIdx] ?? 0;
              forecastSums[ci] += resolvedForecastCellDollars(
                monthFq1ReadOnly,
                row.id,
                ["q", "m", monthIdx],
                forecastBasisKey,
                comp,
                args.forecastOverrides
              );
              ci++;
            }
          }
        }
      }
    } else {
      for (let i = 0; i < args.forecastLeafLabels.length; i++) {
        const comp = getForecastLeafDollarAmount(row, i, args.forecastGranularity, args.anchorDate);
        forecastSums[ci] += resolvedForecastCellDollars(
          false,
          row.id,
          ["x", args.forecastGranularity, "e", i],
          forecastBasisKey,
          comp,
          args.forecastOverrides
        );
        ci++;
      }
    }
  }

  return { planned, estimatedBudget, original, revised, jtd, remaining, forecast: forecastSums };
}

function budgetMetricPresenceInRows(rows: readonly CapitalPlanningSampleRow[]): {
  original: boolean;
  revised: boolean;
  jtd: boolean;
} {
  return {
    original: rows.some((r) => r.originalBudget != null),
    revised: rows.some((r) => r.revisedBudget != null),
    jtd: rows.some((r) => r.jobToDateCosts != null),
  };
}

const LUMP_SUM_USD_FORMAT = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatLumpSumUsdInput(n: number): string {
  return LUMP_SUM_USD_FORMAT.format(Number.isFinite(n) ? n : 0);
}

/** Procore `Table.CurrencyCell` with `value={0}` renders empty — totals/subtotals must show `$0.00`. */
function currencyTotalCell(
  value: number,
  props?: { style?: React.CSSProperties; className?: string; "aria-label"?: string }
): React.ReactElement {
  const v = Number.isFinite(value) ? value : 0;
  if (v === 0) {
    return (
      <Table.CurrencyCell
        className={props?.className}
        style={props?.style}
        aria-label={props?.["aria-label"]}
      >
        {formatLumpSumUsdInput(0)}
      </Table.CurrencyCell>
    );
  }
  return (
    <Table.CurrencyCell
      className={props?.className}
      value={v}
      style={props?.style}
      aria-label={props?.["aria-label"]}
    />
  );
}

function renderPlannedAmountSourceOption(
  option: DropdownFlyoutOption,
  selectedSource: string | undefined
): React.ReactNode {
  if (option.value === PLANNED_AMOUNT_FLYOUT_CAPTION_VALUE) {
    return (
      <Typography
        intent="small"
        color="gray45"
        className="capital-planning-planned-amount-flyout-description"
      >
        {option.label}
      </Typography>
    );
  }
  const disabled = Boolean((option as PlannedAmountSourceOption).disabled);
  const selected = isPlannedAmountFlyoutOptionSelected(option.value, selectedSource) && !disabled;
  return (
    <>
      <StyledDropdownFlyoutLabel
        className={[
          selected ? "capital-planning-planned-amount-flyout-option--selected" : undefined,
          disabled ? "capital-planning-planned-amount-flyout-option--disabled" : undefined,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-disabled={disabled}
      >
        {option.label}
      </StyledDropdownFlyoutLabel>
      {option.children && option.children.length > 0 ? (
        <StyledDropdownFlyoutExpandIcon data-qa="core-dropdown-flyout-option-expand-icon" />
      ) : null}
    </>
  );
}

function ordinalSuffix(day: number): string {
  const v = day % 100;
  if (v >= 11 && v <= 13) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

/** e.g. `Nov 30th, 2026` — matches Capital Planning Gantt hover spec. */
function formatCapitalPlanningGanttPopoverDate(iso: string): string {
  const d = optionalIsoStringToDate(iso);
  if (!d) return "—";
  const mon = d.toLocaleDateString("en-US", { month: "short" });
  const day = d.getDate();
  const year = d.getFullYear();
  return `${mon} ${day}${ordinalSuffix(day)}, ${year}`;
}

function inclusiveDurationDaysLabel(startIso: string, endIso: string): string {
  const s = optionalIsoStringToDate(startIso);
  const e = optionalIsoStringToDate(endIso);
  if (!s || !e) return "—";
  const ta = Date.UTC(s.getFullYear(), s.getMonth(), s.getDate());
  const tb = Date.UTC(e.getFullYear(), e.getMonth(), e.getDate());
  const lo = Math.min(ta, tb);
  const hi = Math.max(ta, tb);
  const days = Math.floor((hi - lo) / 86400000) + 1;
  return `${days} Days`;
}

/** Shown on the forecast timeline cell when both start and end are empty (Procore `Tooltip`, not the bar date popover). */
const GANTT_EMPTY_SCHEDULE_TOOLTIP = "Click and drag to add start and end dates.";

type CapitalPlanningGanttBarDragSession =
  | {
      kind: "move";
      pointerId: number;
      originX: number;
      widthPx: number;
      range: NonNullable<ReturnType<typeof getCapitalPlanningGanttBarDragRange>>;
    }
  | {
      kind: "resize";
      edge: "start" | "end";
      pointerId: number;
      trackLeft: number;
      widthPx: number;
      h0: number;
      h1: number;
      span: number;
      loMs: number;
      hiMs: number;
    }
  | {
      kind: "createBar";
      pointerId: number;
      trackLeft: number;
      widthPx: number;
      h0: number;
      h1: number;
      span: number;
      originClientX: number;
    };

function CapitalPlanningProjectGanttBar({
  rowId,
  barTitle,
  startIso,
  endIso,
  timeline,
  anchorDate,
  setRowDatesById,
}: {
  rowId: string;
  /** Shown inside the bar and popover — same as the row project name. */
  barTitle: string;
  startIso: string;
  endIso: string;
  timeline: CapitalPlanningGanttBarTimeline;
  anchorDate: Date;
  setRowDatesById: React.Dispatch<
    React.SetStateAction<Record<string, { startDate: string; endDate: string }>>
  >;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<CapitalPlanningGanttBarDragSession | null>(null);
  /** Measured rail width so {@link getCapitalPlanningGanttBarPercents} can enforce a 25px-wide minimum bar. */
  const [ganttTrackWidthPx, setGanttTrackWidthPx] = useState(0);
  /** `move` = whole-bar drag. `resize` = edge drag. `createBar` = draw first span on empty rail (both dates blank). */
  const [pointerSessionKind, setPointerSessionKind] = useState<"none" | "move" | "resize" | "createBar">("none");
  const pointerSessionKindRef = useRef(pointerSessionKind);
  pointerSessionKindRef.current = pointerSessionKind;
  const dragging = pointerSessionKind !== "none";
  const [ganttPopoverOpen, setGanttPopoverOpen] = useState(false);

  const { leftPct, widthPct } = useMemo(
    () =>
      getCapitalPlanningGanttBarPercents(startIso, endIso, timeline, anchorDate, {
        trackWidthPx: ganttTrackWidthPx > 0 ? ganttTrackWidthPx : undefined,
      }),
    [anchorDate, endIso, ganttTrackWidthPx, startIso, timeline]
  );

  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      setGanttTrackWidthPx((prev) => {
        const next = Math.max(1, Math.round(w));
        return next === prev ? prev : next;
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [startIso, endIso, timeline, anchorDate]);
  const sTrim = startIso?.trim() ?? "";
  const eTrim = endIso?.trim() ?? "";
  /** No schedule span yet — parent cell shows `GANTT_EMPTY_SCHEDULE_TOOLTIP` via Procore Tooltip; suppress bar date popover on hover. */
  const bothDatesBlank = !sTrim && !eTrim;

  const { refs, floatingStyles, context } = useFloating({
    open:
      ganttPopoverOpen ||
      pointerSessionKind === "resize" ||
      pointerSessionKind === "move",
    onOpenChange(nextOpen) {
      const k = pointerSessionKindRef.current;
      if (!nextOpen && (k === "resize" || k === "move")) return;
      setGanttPopoverOpen(nextOpen);
    },
    placement: "top",
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
    /* Flush above the bar: no gap between popover bottom and segment top */
    middleware: [offset(0), flip(), shift({ limiter: limitShift() })],
  });

  const hover = useHover(context, {
    enabled:
      !bothDatesBlank && pointerSessionKind !== "move" && pointerSessionKind !== "createBar",
    move: false,
    delay: { close: 80 },
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

  useEffect(() => {
    if (pointerSessionKind === "createBar") setGanttPopoverOpen(false);
  }, [pointerSessionKind]);

  useEffect(() => {
    if (bothDatesBlank) setGanttPopoverOpen(false);
  }, [bothDatesBlank]);
  const ariaLabel =
    !sTrim && !eTrim
      ? `No start or end date for ${barTitle}`
      : sTrim && eTrim
        ? `Schedule ${sTrim} through ${eTrim}: ${barTitle}`
        : sTrim
          ? `Schedule from ${sTrim}: ${barTitle}`
          : `Schedule through ${eTrim}: ${barTitle}`;

  const applyPointerRatio = useCallback(
    (clientX: number) => {
      const s = dragRef.current;
      if (!s || s.kind !== "move" || s.widthPx <= 0) return;
      const ratio = (clientX - s.originX) / s.widthPx;
      const next = capitalPlanningGanttDatesAfterHorizontalShift(s.range, ratio);
      setRowDatesById((prev) => {
        const cur = prev[rowId] ?? { startDate: startIso ?? "", endDate: endIso ?? "" };
        return { ...prev, [rowId]: { ...cur, startDate: next.startDate, endDate: next.endDate } };
      });
    },
    [rowId, setRowDatesById, startIso, endIso]
  );

  const applyResizeClientX = useCallback(
    (clientX: number) => {
      const s = dragRef.current;
      if (!s || s.kind !== "resize") return;
      const next = capitalPlanningGanttDatesAfterEdgeResize(
        s.edge,
        s.trackLeft,
        s.widthPx,
        clientX,
        s.h0,
        s.h1,
        s.span,
        s.loMs,
        s.hiMs
      );
      setRowDatesById((prev) => {
        const cur = prev[rowId] ?? { startDate: startIso ?? "", endDate: endIso ?? "" };
        return { ...prev, [rowId]: { ...cur, startDate: next.startDate, endDate: next.endDate } };
      });
    },
    [rowId, setRowDatesById, startIso, endIso]
  );

  const applyCreateBarDrag = useCallback(
    (clientX: number) => {
      const s = dragRef.current;
      if (!s || s.kind !== "createBar") return;
      const next = capitalPlanningGanttDatesFromNewBarDrag(
        s.trackLeft,
        s.widthPx,
        s.originClientX,
        clientX,
        s.h0,
        s.h1,
        s.span
      );
      setRowDatesById((prev) => {
        const cur = prev[rowId] ?? { startDate: startIso ?? "", endDate: endIso ?? "" };
        return { ...prev, [rowId]: { ...cur, startDate: next.startDate, endDate: next.endDate } };
      });
    },
    [rowId, setRowDatesById, startIso, endIso]
  );

  const onTrackCreatePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      if (widthPct > 0) return;
      if (sTrim || eTrim) return;
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      if (rect.width <= 0) return;
      const { h0, h1, span } = getCapitalPlanningGanttEmptyBarHorizon(timeline, anchorDate);
      dragRef.current = {
        kind: "createBar",
        pointerId: e.pointerId,
        trackLeft: rect.left,
        widthPx: rect.width,
        h0,
        h1,
        span,
        originClientX: e.clientX,
      };
      setPointerSessionKind("createBar");
      applyCreateBarDrag(e.clientX);
      e.currentTarget.setPointerCapture(e.pointerId);
      e.preventDefault();
    },
    [anchorDate, applyCreateBarDrag, eTrim, sTrim, timeline, widthPct]
  );

  const onTrackCreatePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const s = dragRef.current;
      if (!s || e.pointerId !== s.pointerId || s.kind !== "createBar") return;
      applyCreateBarDrag(e.clientX);
    },
    [applyCreateBarDrag]
  );

  const onSegmentPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      const track = trackRef.current;
      if (!track) return;
      const range = getCapitalPlanningGanttBarDragRange(startIso, endIso, timeline, anchorDate);
      if (!range) return;
      const widthPx = track.getBoundingClientRect().width;
      if (widthPx <= 0) return;
      dragRef.current = { kind: "move", pointerId: e.pointerId, originX: e.clientX, widthPx, range };
      setPointerSessionKind("move");
      e.currentTarget.setPointerCapture(e.pointerId);
      e.preventDefault();
    },
    [anchorDate, endIso, startIso, timeline]
  );

  const onSegmentPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const s = dragRef.current;
      if (!s || e.pointerId !== s.pointerId || s.kind !== "move") return;
      applyPointerRatio(e.clientX);
    },
    [applyPointerRatio]
  );

  const onResizeEdgePointerDown = useCallback(
    (edge: "start" | "end", e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      const track = trackRef.current;
      if (!track) return;
      const range = getCapitalPlanningGanttBarDragRange(startIso, endIso, timeline, anchorDate);
      if (!range) return;
      const rect = track.getBoundingClientRect();
      if (rect.width <= 0) return;
      dragRef.current = {
        kind: "resize",
        edge,
        pointerId: e.pointerId,
        trackLeft: rect.left,
        widthPx: rect.width,
        h0: range.h0,
        h1: range.h1,
        span: range.span,
        loMs: range.lo,
        hiMs: range.hi,
      };
      setPointerSessionKind("resize");
      e.currentTarget.setPointerCapture(e.pointerId);
      e.preventDefault();
    },
    [anchorDate, endIso, startIso, timeline]
  );

  const onResizePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const s = dragRef.current;
      if (!s || e.pointerId !== s.pointerId || s.kind !== "resize") return;
      applyResizeClientX(e.clientX);
    },
    [applyResizeClientX]
  );

  const finishPointerInteraction = useCallback((el: Element, pointerId: number) => {
    const s = dragRef.current;
    if (!s || s.pointerId !== pointerId) return;
    dragRef.current = null;
    setPointerSessionKind("none");
    try {
      if (el instanceof HTMLElement) el.releasePointerCapture(pointerId);
    } catch {
      /* capture may already be released */
    }
  }, []);

  const onTrackCreatePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const s = dragRef.current;
      if (!s || e.pointerId !== s.pointerId || s.kind !== "createBar") return;
      applyCreateBarDrag(e.clientX);
      finishPointerInteraction(e.currentTarget, e.pointerId);
    },
    [applyCreateBarDrag, finishPointerInteraction]
  );

  const onSegmentPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      finishPointerInteraction(e.currentTarget, e.pointerId);
    },
    [finishPointerInteraction]
  );

  const onResizePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      finishPointerInteraction(e.currentTarget, e.pointerId);
    },
    [finishPointerInteraction]
  );

  const onLostPointerCapture = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const s = dragRef.current;
    if (!s || s.pointerId !== e.pointerId) return;
    dragRef.current = null;
    setPointerSessionKind("none");
  }, []);

  const referenceProps = getReferenceProps();
  const referenceOnPointerDown =
    typeof referenceProps.onPointerDown === "function" ? referenceProps.onPointerDown : undefined;

  const showSegment = widthPct > 0;

  return (
    <div
      ref={trackRef}
      className={[
        "capital-planning-gantt-row-bar-track",
        !showSegment ? "capital-planning-gantt-row-bar-track--empty-host" : "",
        pointerSessionKind === "createBar" ? "capital-planning-gantt-row-bar-track--creating" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      role="presentation"
      onPointerDown={(e) => {
        if (bothDatesBlank && !showSegment) onTrackCreatePointerDown(e);
      }}
      onPointerMove={onTrackCreatePointerMove}
      onPointerUp={(e) => {
        if (dragRef.current?.kind === "createBar") onTrackCreatePointerUp(e);
      }}
      onPointerCancel={(e) => {
        if (dragRef.current?.kind === "createBar") onTrackCreatePointerUp(e);
      }}
      onLostPointerCapture={onLostPointerCapture}
    >
      {!showSegment ? (
        <div
          ref={refs.setReference}
          className="capital-planning-gantt-row-bar-track--empty capital-planning-gantt-row-bar-track--empty-inner"
          role="img"
          aria-label={ariaLabel}
          {...(bothDatesBlank ? {} : referenceProps)}
        />
      ) : (
        <div
          ref={refs.setReference}
          className={[
            "capital-planning-gantt-row-bar-segment",
            dragging ? "capital-planning-gantt-row-bar-segment--dragging" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
          role="img"
          aria-label={ariaLabel}
          {...referenceProps}
          onPointerDown={(e) => {
            referenceOnPointerDown?.(e);
            onSegmentPointerDown(e);
          }}
          onPointerMove={onSegmentPointerMove}
          onPointerUp={onSegmentPointerUp}
          onPointerCancel={onSegmentPointerUp}
          onLostPointerCapture={onLostPointerCapture}
        >
          <span className="capital-planning-gantt-row-bar-handle" aria-hidden />
          <span className="capital-planning-gantt-row-bar-label">{barTitle}</span>
          <span className="capital-planning-gantt-row-bar-handle" aria-hidden />
          <div
            className="capital-planning-gantt-row-bar-resize-zone capital-planning-gantt-row-bar-resize-zone--start"
            aria-hidden
            onPointerDown={(e) => onResizeEdgePointerDown("start", e)}
            onPointerMove={onResizePointerMove}
            onPointerUp={onResizePointerUp}
            onPointerCancel={onResizePointerUp}
            onLostPointerCapture={onLostPointerCapture}
          />
          <div
            className="capital-planning-gantt-row-bar-resize-zone capital-planning-gantt-row-bar-resize-zone--end"
            aria-hidden
            onPointerDown={(e) => onResizeEdgePointerDown("end", e)}
            onPointerMove={onResizePointerMove}
            onPointerUp={onResizePointerUp}
            onPointerCancel={onResizePointerUp}
            onLostPointerCapture={onLostPointerCapture}
          />
        </div>
      )}
      {!bothDatesBlank &&
      (ganttPopoverOpen ||
        pointerSessionKind === "resize" ||
        pointerSessionKind === "move") ? (
        <FloatingPortal id="capital-planning-gantt-popover-root">
          <div
            ref={refs.setFloating}
            className="capital-planning-gantt-bar-popover"
            style={{
              ...floatingStyles,
              zIndex: 10800,
            }}
            role="tooltip"
            {...getFloatingProps()}
          >
            <div className="capital-planning-gantt-bar-popover-title">{barTitle}</div>
            <div className="capital-planning-gantt-bar-popover-rows">
              <div className="capital-planning-gantt-bar-popover-row">
                <span className="capital-planning-gantt-bar-popover-label">Start Date:</span>
                <span className="capital-planning-gantt-bar-popover-value">
                  {sTrim ? formatCapitalPlanningGanttPopoverDate(sTrim) : "—"}
                </span>
              </div>
              <div className="capital-planning-gantt-bar-popover-row">
                <span className="capital-planning-gantt-bar-popover-label">End Date:</span>
                <span className="capital-planning-gantt-bar-popover-value">
                  {eTrim ? formatCapitalPlanningGanttPopoverDate(eTrim) : "—"}
                </span>
              </div>
              <div className="capital-planning-gantt-bar-popover-row">
                <span className="capital-planning-gantt-bar-popover-label">Duration:</span>
                <span className="capital-planning-gantt-bar-popover-value">
                  {sTrim && eTrim ? inclusiveDurationDaysLabel(sTrim, eTrim) : "—"}
                </span>
              </div>
            </div>
          </div>
        </FloatingPortal>
      ) : null}
    </div>
  );
}

function ForecastEditableNumberCell({
  rowId,
  parts,
  forecastBasisKey,
  computedValue,
  overrides,
  setOverrides,
  ariaLabel,
  readOnly = false,
  curveBlocksInlineForecastEdit = false,
  onCurveBlocksInlineForecastEdit,
  onExpandProjectDatesForManualForecast,
}: {
  rowId: string;
  parts: (string | number)[];
  /** Curve + planned + JTD (dates intentionally omitted so span edits and Manual forecast commits stay stable). */
  forecastBasisKey: string;
  computedValue: number;
  overrides: Record<string, number>;
  setOverrides: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  ariaLabel: string;
  /** When true, show computed amount only (no overrides); used for closed FQ1 columns. */
  readOnly?: boolean;
  /** When true (non-Manual curve), inline edit opens a dialog instead of an input. */
  curveBlocksInlineForecastEdit?: boolean;
  onCurveBlocksInlineForecastEdit?: () => void;
  /**
   * Manual curve only: before persisting a positive override, widen project start/end to include this cell’s period
   * when the user enters dollars in a month/quarter/year outside the current span.
   */
  onExpandProjectDatesForManualForecast?: (parts: (string | number)[], committedDollars: number) => void;
}) {
  const editShellRef = useRef<HTMLDivElement>(null);
  const storageKey = forecastOverrideStorageKey(rowId, parts, forecastBasisKey);
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState("");

  const resolved = readOnly ? computedValue : overrides[storageKey] ?? computedValue;

  const handleFocus = useCallback(() => {
    setFocused(true);
    const n = overrides[storageKey] ?? computedValue;
    setDraft(Number.isFinite(n) && n === 0 ? "0" : numberToEditableDraft(n));
  }, [computedValue, overrides, storageKey]);

  /** Leaving the input without Update/Cancel (e.g. Tab away) discards edits — Figma 4589-94155. */
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const related = e.relatedTarget as Node | null;
    if (editShellRef.current && related && editShellRef.current.contains(related)) {
      return;
    }
    setFocused(false);
    setDraft("");
  }, []);

  const handleCancel = useCallback(() => {
    setFocused(false);
    setDraft("");
  }, []);

  const handleUpdate = useCallback(() => {
    const trimmed = draft.trim();
    let committed = 0;
    let clearOverride = false;
    if (trimmed === "") {
      clearOverride = true;
    } else {
      const p = moneyStringToNumber(trimmed);
      if (!Number.isFinite(p)) clearOverride = true;
      else committed = Math.max(0, p);
    }

    if (!clearOverride && committed > 0 && onExpandProjectDatesForManualForecast) {
      onExpandProjectDatesForManualForecast(parts, committed);
    }

    setOverrides((prev) => {
      const next = { ...prev };
      if (clearOverride) {
        delete next[storageKey];
      } else if (Number.isFinite(committed)) {
        next[storageKey] = committed;
      } else {
        delete next[storageKey];
      }
      return next;
    });
    setFocused(false);
    setDraft("");
  }, [draft, onExpandProjectDatesForManualForecast, parts, setOverrides, storageKey]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDraft(filterMoneyDraftInput(e.currentTarget.value));
  }, []);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        handleUpdate();
      } else if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        handleCancel();
      }
    },
    [handleUpdate, handleCancel]
  );

  const display = focused ? draft : formatLumpSumUsdInput(resolved);

  if (readOnly) {
    const v = Number.isFinite(computedValue) ? computedValue : 0;
    /* Procore `CurrencyCell` treats 0 as empty — show $0.00 for past periods (e.g. ended FQ1) with no forecast. */
    if (v === 0) {
      /* Same surface as `value` branch: `StyledTableCellText` + currency alignment (no nested Typography). */
      return (
        <Table.CurrencyCell aria-label={ariaLabel}>{formatLumpSumUsdInput(0)}</Table.CurrencyCell>
      );
    }
    return <Table.CurrencyCell value={v} aria-label={ariaLabel} />;
  }

  if (curveBlocksInlineForecastEdit && onCurveBlocksInlineForecastEdit) {
    const v = Number.isFinite(resolved) ? resolved : 0;
    return (
      <div
        className="capital-planning-forecast-curve-blocked-trigger"
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          onCurveBlocksInlineForecastEdit();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            onCurveBlocksInlineForecastEdit();
          }
        }}
        aria-label={`${ariaLabel}. Open dialog: Update to Manual Curve?`}
      >
        {v === 0 ? (
          <Table.CurrencyCell aria-hidden>{formatLumpSumUsdInput(0)}</Table.CurrencyCell>
        ) : (
          <Table.CurrencyCell value={v} aria-hidden />
        )}
      </div>
    );
  }

  const input = (
    <Table.InputCell
      size="block"
      type="text"
      inputMode="decimal"
      autoComplete="off"
      className="capital-planning-forecast-number-input"
      value={display}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onChange={handleChange}
      onKeyDown={handleInputKeyDown}
      aria-label={ariaLabel}
    />
  );

  return (
    <div
      ref={editShellRef}
      className={[
        "capital-planning-forecast-editable-wrap",
        focused ? "capital-planning-forecast-editable-wrap--editing" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {input}
      {focused ? (
        <div
          className="capital-planning-forecast-edit-actions"
          role="group"
          aria-label={`${ariaLabel} save or discard`}
        >
          <div className="capital-planning-forecast-edit-actions-bar">
            <Button
              type="button"
              variant="tertiary"
              size="sm"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleUpdate}
            >
              Update
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Strip non-numeric (except one decimal) for parsing typed currency. */
function moneyStringToNumber(s: string): number {
  const cleaned = s.replace(/,/g, "").replace(/[^0-9.]/g, "");
  if (cleaned === "" || cleaned === ".") return 0;
  const x = parseFloat(cleaned);
  return Number.isNaN(x) ? 0 : Math.max(0, x);
}

/** Allow only digits and a single decimal while editing. */
function filterMoneyDraftInput(s: string): string {
  let out = "";
  let dot = false;
  for (const ch of s) {
    if (ch >= "0" && ch <= "9") out += ch;
    else if (ch === "." && !dot) {
      dot = true;
      out += ".";
    }
  }
  return out;
}

function numberToEditableDraft(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "";
  const rounded = Math.round(n * 100) / 100;
  return rounded % 1 === 0 ? String(Math.trunc(rounded)) : String(rounded);
}

function LumpSumPlannedAmountCurrencyInput({
  value,
  onChange,
  ariaLabel,
}: {
  value: number;
  onChange: (n: number) => void;
  ariaLabel: string;
}) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState("");

  const handleFocus = useCallback(() => {
    setFocused(true);
    setDraft(numberToEditableDraft(value));
  }, [value]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    const n = moneyStringToNumber(draft);
    onChange(n);
    setDraft("");
  }, [draft, onChange]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextDraft = filterMoneyDraftInput(e.currentTarget.value);
      setDraft(nextDraft);
      onChange(moneyStringToNumber(nextDraft));
    },
    [onChange]
  );

  const displayValue = focused ? draft : formatLumpSumUsdInput(value);

  return (
    <Table.InputCell
      size="block"
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={displayValue}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onChange={handleChange}
      aria-label={ariaLabel}
    />
  );
}

function ForecastFyGroupHeaderCell({
  expanded,
  fyLabel,
  colSpan,
  onToggle,
  readOnly = false,
}: {
  expanded: boolean;
  fyLabel: string;
  colSpan?: number;
  onToggle: () => void;
  /** When true, omit expand/collapse control (e.g. Gantt month program layout). */
  readOnly?: boolean;
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
        {readOnly ? null : (
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
        )}
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
  readOnly = false,
}: {
  label: string;
  onToggle: () => void;
  colSpan?: number;
  expanded: boolean;
  toggleAriaLabel: string;
  /** 150px leaf header (rolled-up FQ / FY-collapsed summary columns). */
  fqMonthWidthHeader?: boolean;
  /** When true, omit quarter expand/collapse (e.g. Gantt month program layout). */
  readOnly?: boolean;
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
        {readOnly ? null : (
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
        )}
      </div>
    </Table.HeaderCell>
  );
}

/** Criterion mapped from Criteria Builder for extra grid columns. */
export interface CapitalPlanningCriteriaGridColumn {
  criterionId: string;
  label: string;
  /** Criteria Builder description — shown in prioritization column header tooltip when non-empty. */
  description: string;
  inputType: "number" | "dropdown" | "rating_scale";
  selectOptions: { optionId: string; label: string; scoreValue: number }[];
  /** Criteria Builder weight (0–100); drives weighted prioritization score. */
  scoringWeightPercent: number;
}

export interface CapitalPlanningSmartGridProps {
  columnVisibility: CapitalPlanningColumnVisibility;
  /** Table Settings row height — drives compact / comfortable / spacious row density. */
  rowHeight?: "sm" | "md" | "lg";
  configShowEmpty: boolean;
  search: string;
  filteredProjectRows: CapitalPlanningSampleRow[];
  plannedAmountSourceByRowId: Record<string, string>;
  setPlannedAmountSourceByRowId: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  plannedAmountManualByRowId: Record<string, number>;
  setPlannedAmountManualByRowId: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  setRowDatesById: React.Dispatch<
    React.SetStateAction<Record<string, { startDate: string; endDate: string }>>
  >;
  setCurvesByRowId: React.Dispatch<React.SetStateAction<Record<string, ProjectCurve>>>;
  /** When the Priority baseline column is visible: editable High/Medium/Low per row. */
  setPrioritiesByRowId?: React.Dispatch<React.SetStateAction<Record<string, ProjectPriority>>>;
  /** Forecast cost columns: period labels follow this granularity (month / quarter / year). */
  forecastGranularity: ForecastGranularity;
  /**
   * `grid`: program FY/FQ/month forecast chrome with collapse. `gantt`: flat headers for View by period only (no FY/FQ toggles).
   */
  planView?: "grid" | "gantt";
  /** Persist High Level Budget Items line total into Planned Amount for the row. */
  onSaveHighLevelBudgetPlannedAmount: (rowId: string, plannedAmount: number) => void;
  /** Table row grouping — `null` uses region grouping while the toolbar select shows placeholder. */
  groupBy?: CapitalPlanningGroupBy | null;
  /** Dynamic criteria columns (Criteria Builder) — rendered after baseline columns, before forecast. */
  criteriaColumns?: CapitalPlanningCriteriaGridColumn[];
  criteriaValuesByProjectId?: Record<string, Record<string, string>>;
  onCriteriaValueChange?: (projectId: string, criterionId: string, value: string) => void;
  /** When true with criteria columns, show a read-only weighted score (0–100%) after criteria. */
  showPrioritizationScoreColumn?: boolean;
  /**
   * When false, criteria columns are not rendered in the grid (capital plan), but the same
   * `criteriaColumns` definitions are still used to compute baseline prioritization score.
   * @default true
   */
  renderCriteriaColumnsInGrid?: boolean;
  /** Prioritization tab: apply title case to visible column header labels. */
  titleCaseHeaders?: boolean;
  /** When {@link CapitalPlanningColumnVisibility.estimatedBudget} is on: per-row dollar amount (defaults to row planned amount). */
  estimatedBudgetByRowId?: Record<string, number>;
  setEstimatedBudgetByRowId?: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  /** When {@link CapitalPlanningColumnVisibility.prioritizationStatus} is on: triage workflow state per row. */
  prioritizationStatusByRowId?: Record<string, string>;
  setPrioritizationStatusByRowId?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

/**
 * Program grid for Capital Planning.
 *
 * Layout targets (confirm in Figma when authenticated):
 * - Forecast: https://www.figma.com/design/wbjpyOCTw2MQaOzx4ibk6r/Capital-Planning?node-id=4442-89611
 * - Quarters + months row: https://www.figma.com/design/wbjpyOCTw2MQaOzx4ibk6r/Capital-Planning?node-id=4444-89771
 * - High level budget items: https://www.figma.com/design/wbjpyOCTw2MQaOzx4ibk6r/Capital-Planning?node-id=4440-88961
 *
 * Procore **SmartGrid** (e.g. `@procore/smart-grid-cells`) is not on the **public** npm registry
 * (install returns 404). This implementation uses **`@procore/core-react` `Table`**, which matches
 * common list patterns in this prototype. When SmartGrid is available from your Procore registry,
 * swap the markup inside this component and keep {@link CapitalPlanningSmartGridProps} as the integration boundary.
 */
export function CapitalPlanningSmartGrid({
  columnVisibility,
  rowHeight = "sm",
  configShowEmpty,
  search,
  filteredProjectRows,
  plannedAmountSourceByRowId,
  setPlannedAmountSourceByRowId,
  plannedAmountManualByRowId,
  setPlannedAmountManualByRowId,
  setRowDatesById,
  setCurvesByRowId,
  setPrioritiesByRowId,
  forecastGranularity,
  planView = "grid",
  onSaveHighLevelBudgetPlannedAmount,
  groupBy = null,
  criteriaColumns,
  criteriaValuesByProjectId,
  onCriteriaValueChange,
  showPrioritizationScoreColumn = false,
  renderCriteriaColumnsInGrid = true,
  titleCaseHeaders = false,
  estimatedBudgetByRowId,
  setEstimatedBudgetByRowId,
  prioritizationStatusByRowId,
  setPrioritizationStatusByRowId,
}: CapitalPlanningSmartGridProps) {
  const formatHeaderLabel = useCallback(
    (text: string) => (titleCaseHeaders ? toHeaderTitleCase(text) : text),
    [titleCaseHeaders]
  );
  const show = useMemo(() => columnVisibilityToGroupVisibility(columnVisibility), [columnVisibility]);
  const ganttFlatForecast = planView === "gantt";
  const ganttProgramMonthLayout = ganttFlatForecast && forecastGranularity === "month";
  const ganttQuarterYearBands = ganttFlatForecast && forecastGranularity === "quarter";
  const ganttYearRollingFlat = ganttFlatForecast && forecastGranularity === "year";
  const [highLevelBudgetItemsRow, setHighLevelBudgetItemsRow] = useState<CapitalPlanningSampleRow | null>(null);
  /** Row that opened “Update to Manual Curve?” — Update sets curve to Manual for this id. */
  const [forecastManualCurveModalRowId, setForecastManualCurveModalRowId] = useState<string | null>(null);
  /** Pending curve change away from Manual (Figma 3615-152732). */
  const [curveChangeFromManual, setCurveChangeFromManual] = useState<{
    rowId: string;
    nextCurve: ProjectCurve;
  } | null>(null);
  const openForecastManualCurveModal = useCallback((rowId: string) => {
    setForecastManualCurveModalRowId(rowId);
  }, []);
  const [forecastColumnsExpanded, setForecastColumnsExpanded] = useState(true);
  /** Per FQ (across all program FYs): collapsed → rollup column; expanded → three month columns. */
  const [fqCollapsed, setFqCollapsed] = useState<boolean[]>(getDefaultForecastFqCollapsed);
  /** Per program FY: when false, that year collapses to a single forecast column (not the whole grid). */
  const [fyYearSectionExpanded, setFyYearSectionExpanded] = useState<boolean[]>(
    getDefaultFyYearSectionExpanded
  );
  const [forecastOverrides, setForecastOverrides] = useState<Record<string, number>>({});

  const closeForecastManualCurveModal = useCallback(() => {
    setForecastManualCurveModalRowId(null);
  }, []);

  const confirmForecastManualCurveUpdate = useCallback(
    (rowId: string) => {
      setCurvesByRowId((prev) => ({ ...prev, [rowId]: "Manual" }));
      setForecastManualCurveModalRowId(null);
    },
    [setCurvesByRowId]
  );

  const handleCurveChangeFromManualConfirm = useCallback(
    (rowId: string, nextCurve: ProjectCurve) => {
      clearForecastOverridesForRow(rowId, setForecastOverrides);
      setCurvesByRowId((prev) => ({ ...prev, [rowId]: nextCurve }));
      setCurveChangeFromManual(null);
    },
    [setCurvesByRowId, setForecastOverrides]
  );

  /** Live row from the grid so Planned Amount (incl. HLBI saved total) matches the tearsheet — state snapshot can go stale. */
  const highLevelBudgetTearsheetRow = useMemo((): CapitalPlanningSampleRow | null => {
    if (!highLevelBudgetItemsRow) return null;
    const live = filteredProjectRows.find((r) => r.id === highLevelBudgetItemsRow.id);
    return live ?? highLevelBudgetItemsRow;
  }, [highLevelBudgetItemsRow, filteredProjectRows]);

  const anchorDate = useMemo(() => new Date(), []);
  const forecastFqLabels = useMemo(
    () =>
      forecastGranularity === "quarter" || ganttQuarterYearBands || ganttProgramMonthLayout
        ? getProgramForecastFqLabels()
        : [],
    [forecastGranularity, ganttQuarterYearBands, ganttProgramMonthLayout]
  );
  const forecastLeafLabels = useMemo(() => {
    if (ganttProgramMonthLayout) {
      return getProgramForecastMonthLabels();
    }
    if (ganttQuarterYearBands) {
      return getProgramForecastFqLabels();
    }
    if (ganttYearRollingFlat) {
      return getForecastColumnLabels("year", anchorDate);
    }
    if (ganttFlatForecast) {
      return getForecastColumnLabels(forecastGranularity, anchorDate);
    }
    if (forecastGranularity === "quarter") {
      return getProgramForecastMonthLabels();
    }
    return getForecastColumnLabels(forecastGranularity, anchorDate);
  }, [
    ganttProgramMonthLayout,
    ganttQuarterYearBands,
    ganttYearRollingFlat,
    ganttFlatForecast,
    forecastGranularity,
    anchorDate,
  ]);

  const expandProjectDatesForManualForecast = useCallback(
    (
      rowId: string,
      startIso: string,
      endIso: string,
      parts: (string | number)[],
      committedDollars: number
    ) => {
      if (committedDollars <= 0) return;
      const range = getForecastOverridePartsCalendarRange(parts, anchorDate, forecastGranularity);
      if (!range) return;
      setRowDatesById((prev) => {
        const cur = prev[rowId] ?? { startDate: startIso, endDate: endIso };
        const expanded = expandProjectIsoDatesToCoverCalendarRange(cur.startDate, cur.endDate, range);
        if (expanded.startDate === cur.startDate && expanded.endDate === cur.endDate) return prev;
        return { ...prev, [rowId]: { ...cur, ...expanded } };
      });
    },
    [anchorDate, forecastGranularity, setRowDatesById]
  );

  useEffect(() => {
    if (forecastGranularity === "quarter" && !ganttFlatForecast) {
      setFqCollapsed(getDefaultForecastFqCollapsed());
      setFyYearSectionExpanded(getDefaultFyYearSectionExpanded());
    }
  }, [forecastGranularity, ganttFlatForecast]);

  const quarterExpandedLeafColumns = useMemo(() => {
    if (ganttProgramMonthLayout) {
      return CAPITAL_PLANNING_PROGRAM_FY_COUNT * 12;
    }
    return CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.reduce((sum, _, fyIndex) => {
      if (!fyYearSectionExpanded[fyIndex]) return sum + 1;
      return sum + quarterLeafColumnsForFy(fyIndex, fqCollapsed);
    }, 0);
  }, [ganttProgramMonthLayout, fyYearSectionExpanded, fqCollapsed]);

  const leafColumnCountForTable = useMemo(() => {
    if (ganttQuarterYearBands) {
      return 24;
    }
    if (ganttProgramMonthLayout) {
      return quarterExpandedLeafColumns;
    }
    if (ganttYearRollingFlat) {
      return forecastLeafLabels.length;
    }
    if (ganttFlatForecast) {
      return forecastLeafLabels.length;
    }
    if (!forecastColumnsExpanded) {
      if (forecastGranularity === "quarter") return 1;
      return forecastLeafLabels.length;
    }
    if (forecastGranularity === "quarter") return quarterExpandedLeafColumns;
    return forecastLeafLabels.length;
  }, [
    ganttQuarterYearBands,
    ganttProgramMonthLayout,
    ganttYearRollingFlat,
    ganttFlatForecast,
    forecastColumnsExpanded,
    forecastGranularity,
    quarterExpandedLeafColumns,
    forecastLeafLabels.length,
  ]);

  const baselineVisibleColumnCount = 1 + countVisibleBaselineDataColumns(columnVisibility);
  const forecastLeafColumnsForTable = show.forecast ? leafColumnCountForTable : 0;
  const criteriaDefsForScoreCount = criteriaColumns?.length ?? 0;
  const criteriaColumnsRenderedCount = renderCriteriaColumnsInGrid ? criteriaDefsForScoreCount : 0;
  const embeddedPrioritizationScoreColumnCount =
    showPrioritizationScoreColumn && criteriaDefsForScoreCount > 0 && renderCriteriaColumnsInGrid ? 1 : 0;
  const tableColumnCount =
    baselineVisibleColumnCount +
    criteriaColumnsRenderedCount +
    embeddedPrioritizationScoreColumnCount +
    forecastLeafColumnsForTable;

  /** Sticky right only when score is the last column (prioritization view has no forecast). */
  const prioritizationScoreStickyColClass =
    showPrioritizationScoreColumn && criteriaDefsForScoreCount > 0 && renderCriteriaColumnsInGrid && !show.forecast
      ? "capital-planning-col-sticky-prioritization-score"
      : undefined;

  const prioritizationScoresByRowId = useMemo((): Record<string, number | null> | null => {
    if (!criteriaColumns?.length) return null;
    const out: Record<string, number | null> = {};
    for (const row of filteredProjectRows) {
      out[row.id] = computePrioritizationScorePercent(
        criteriaColumns,
        criteriaValuesByProjectId?.[row.id] ?? {}
      );
    }
    return out;
  }, [criteriaColumns, criteriaValuesByProjectId, filteredProjectRows]);

  const renderProjectCriteriaCells = useCallback(
    (projectRowId: string) => {
      if (!renderCriteriaColumnsInGrid || !criteriaColumns?.length) return null;
      const vals = criteriaValuesByProjectId?.[projectRowId] ?? {};
      return criteriaColumns.map((col) => {
        const val = vals[col.criterionId] ?? "";
        if (col.inputType === "number") {
          return (
            <Table.BodyCell
              key={`cc-${projectRowId}-${col.criterionId}`}
              className={CRITERIA_COLUMN_CLASS}
              style={{ ...CRITERIA_COLUMN_BOX_STYLE, verticalAlign: "middle" }}
            >
              <Table.InputCell
                size="block"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={val}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const next = e.target.value.replace(/[^\d.-]/g, "");
                  onCriteriaValueChange?.(projectRowId, col.criterionId, next);
                }}
                aria-label={col.label}
                placeholder="—"
              />
            </Table.BodyCell>
          );
        }
        if (!col.selectOptions.length) {
          return (
            <Table.BodyCell
              key={`cc-${projectRowId}-${col.criterionId}`}
              className={CRITERIA_COLUMN_CLASS}
              style={{ ...CRITERIA_COLUMN_BOX_STYLE, verticalAlign: "middle" }}
            >
              <Typography intent="small" style={{ color: "var(--color-text-secondary)" }}>
                —
              </Typography>
            </Table.BodyCell>
          );
        }
        const labelShown = col.selectOptions.find((o) => o.optionId === val)?.label ?? "";
        return (
          <Table.BodyCell
            key={`cc-${projectRowId}-${col.criterionId}`}
            className={CRITERIA_COLUMN_CLASS}
            style={{ ...CRITERIA_COLUMN_BOX_STYLE, verticalAlign: "middle" }}
          >
            <div style={{ minWidth: 0, width: "100%" }}>
              <Select
                block
                label={labelShown}
                placeholder="Select"
                aria-label={col.label}
                onSelect={(s) => {
                  if (s.action !== "selected") return;
                  onCriteriaValueChange?.(projectRowId, col.criterionId, String(s.item));
                }}
              >
                {col.selectOptions.map((o) => (
                  <Select.Option key={o.optionId} value={o.optionId} selected={val === o.optionId}>
                    {o.label}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </Table.BodyCell>
        );
      });
    },
    [criteriaColumns, criteriaValuesByProjectId, onCriteriaValueChange, renderCriteriaColumnsInGrid]
  );

  const resolvedGroupBy = effectiveCapitalPlanningGroupBy(groupBy);

  const rowsGroupedByRegion = useMemo(
    () => groupProjectRowsForCapitalPlanning(filteredProjectRows, groupBy),
    [filteredProjectRows, groupBy]
  );

  /** When `true`, that region section’s project rows are hidden (group header stays visible). */
  const [regionGroupCollapsed, setRegionGroupCollapsed] = useState<Partial<Record<string, boolean>>>({});

  useEffect(() => {
    setRegionGroupCollapsed({});
  }, [groupBy]);

  const toggleRegionGroupCollapsed = useCallback((key: string) => {
    setRegionGroupCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const allRegionGroupsExpanded = useMemo(
    () =>
      rowsGroupedByRegion.length > 0 &&
      rowsGroupedByRegion.every((g) => !regionGroupCollapsed[g.key]),
    [rowsGroupedByRegion, regionGroupCollapsed]
  );

  const allRegionGroupsCollapsed = useMemo(
    () =>
      rowsGroupedByRegion.length > 0 &&
      rowsGroupedByRegion.every((g) => Boolean(regionGroupCollapsed[g.key])),
    [rowsGroupedByRegion, regionGroupCollapsed]
  );

  const toggleAllRegionGroups = useCallback(() => {
    setRegionGroupCollapsed((prev) => {
      const collapseAll =
        rowsGroupedByRegion.length > 0 &&
        rowsGroupedByRegion.every((g) => !prev[g.key]);
      const next: Partial<Record<string, boolean>> = {};
      for (const g of rowsGroupedByRegion) {
        next[g.key] = collapseAll;
      }
      return next;
    });
  }, [rowsGroupedByRegion]);

  const forecastMasterHeaderLabel = useMemo(() => {
    if (forecastGranularity === "quarter") return "";
    if (forecastGranularity === "year") return "Forecast (calendar years)";
    return "Forecast (months)";
  }, [forecastGranularity]);
  /**
   * Quarter forecast: optional master row (when collapsed), FY band row, FQ row, month row.
   * When expanded, the merged “FY 2026 – FY 2031” title row is omitted; each FY band toggles only that year.
   */
  const quarterThreeRowForecastHeader =
    (forecastGranularity === "quarter" && !ganttFlatForecast) || ganttProgramMonthLayout;
  /** Must match the number of `<Table.HeaderRow>` rows under the forecast so month/FQ cells align after the baseline columns. */
  const headerBaseRowSpan = useMemo(() => {
    if (!show.forecast) return 1;
    if (ganttProgramMonthLayout) return 4;
    if (ganttQuarterYearBands) return 2;
    if (ganttYearRollingFlat) return 1;
    if (ganttFlatForecast) return 1;
    if (!quarterThreeRowForecastHeader) return 2;
    if (forecastGranularity === "quarter" && forecastColumnsExpanded) return 4;
    return 3;
  }, [
    show.forecast,
    ganttProgramMonthLayout,
    ganttQuarterYearBands,
    ganttYearRollingFlat,
    ganttFlatForecast,
    quarterThreeRowForecastHeader,
    forecastGranularity,
    forecastColumnsExpanded,
  ]);

  const handleForecastBlockToggle = useCallback(() => {
    setForecastColumnsExpanded((v) => {
      const next = !v;
      if (next) {
        setFqCollapsed(getDefaultForecastFqCollapsed());
        setFyYearSectionExpanded(getDefaultFyYearSectionExpanded());
      }
      return next;
    });
  }, []);

  const forecastExpandedForTotals = ganttFlatForecast || forecastColumnsExpanded;

  const totalsAggregationArgs = useMemo(
    () => ({
      showForecast: show.forecast,
      leafColumnCountForTable,
      forecastOverrides,
      anchorDate,
      forecastGranularity,
      forecastColumnsExpanded,
      forecastExpandedForTotals,
      ganttFlatForecast,
      ganttProgramMonthGrid: ganttProgramMonthLayout,
      ganttProgramQuarterBands: ganttQuarterYearBands,
      fyYearSectionExpanded,
      fqCollapsed,
      forecastLeafLabels,
      estimatedBudgetByRowId,
    }),
    [
      show.forecast,
      leafColumnCountForTable,
      forecastOverrides,
      anchorDate,
      forecastGranularity,
      forecastColumnsExpanded,
      forecastExpandedForTotals,
      ganttFlatForecast,
      ganttProgramMonthLayout,
      ganttQuarterYearBands,
      fyYearSectionExpanded,
      fqCollapsed,
      forecastLeafLabels,
      estimatedBudgetByRowId,
    ]
  );

  const footerTotals = useMemo(() => {
    if (!configShowEmpty || filteredProjectRows.length === 0) {
      return {
        planned: 0,
        estimatedBudget: 0,
        original: 0,
        revised: 0,
        jtd: 0,
        remaining: 0,
        forecast: [] as number[],
      };
    }
    return computeCapitalPlanningGridTotals(filteredProjectRows, totalsAggregationArgs);
  }, [configShowEmpty, filteredProjectRows, totalsAggregationArgs]);

  /** Footer: only show currency totals when at least one visible row has that metric (no placeholder dash). */
  const footerBudgetColumnsWithData = useMemo(() => {
    if (!configShowEmpty || filteredProjectRows.length === 0) {
      return { original: false, revised: false, jtd: false };
    }
    return budgetMetricPresenceInRows(filteredProjectRows);
  }, [configShowEmpty, filteredProjectRows]);

  const showFooterRow = configShowEmpty && filteredProjectRows.length > 0;

  return (
    <>
    <Table.Container
      className={[
        "capital-planning-table-scroll",
        ganttFlatForecast ? "capital-planning--gantt-forecast" : "",
        ganttYearRollingFlat ? "capital-planning--gantt-forecast-rolling-year" : "",
        show.forecast && ganttQuarterYearBands ? "capital-planning--gantt-forecast-quarter-bands" : "",
        rowHeight === "sm" ? "capital-planning-row-height--sm" : "",
        rowHeight === "md" ? "capital-planning-row-height--md" : "",
        rowHeight === "lg" ? "capital-planning-row-height--lg" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Table>
        <Table.Header>
          <Table.HeaderRow>
            <Table.HeaderCell rowSpan={headerBaseRowSpan} className={baselineCellClasses("project", columnVisibility)}>
              <div className="capital-planning-project-header-inner">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="capital-planning-forecast-fy-toggle capital-planning-project-header-region-toggle"
                  icon={
                    allRegionGroupsCollapsed ? (
                      <CaretsOutVertical size="sm" />
                    ) : (
                      <CaretsInVertical size="sm" />
                    )
                  }
                  disabled={rowsGroupedByRegion.length === 0}
                  aria-label={
                    rowsGroupedByRegion.length === 0
                      ? capitalPlanningGroupByEmptyToolbarLabel(resolvedGroupBy)
                      : allRegionGroupsExpanded
                        ? `Collapse all ${capitalPlanningGroupByCollapseNoun(resolvedGroupBy)}`
                        : `Expand all ${capitalPlanningGroupByCollapseNoun(resolvedGroupBy)}`
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleAllRegionGroups();
                  }}
                />
                <span className="capital-planning-project-header-label">{formatHeaderLabel("Project")}</span>
              </div>
            </Table.HeaderCell>
            {isBaselineColumnVisible("projectDescription", columnVisibility) ? (
              <Table.HeaderCell
                rowSpan={headerBaseRowSpan}
                className={baselineCellClasses("projectDescription", columnVisibility)}
              >
                <Typography intent="small" weight="semibold" as="span">
                  {formatHeaderLabel("Description")}
                </Typography>
              </Table.HeaderCell>
            ) : null}
            {isBaselineColumnVisible("estimatedBudget", columnVisibility) ? (
              <Table.HeaderCell
                rowSpan={headerBaseRowSpan}
                className={baselineCellClasses("estimatedBudget", columnVisibility)}
              >
                <Tooltip
                  trigger="hover"
                  placement="top"
                  overlay={
                    <Tooltip.Content>
                      <EstimatedBudgetColumnHeaderTooltipBody />
                    </Tooltip.Content>
                  }
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: "100%",
                      cursor: "help",
                    }}
                  >
                    {formatHeaderLabel("Estimated Budget")}
                  </span>
                </Tooltip>
              </Table.HeaderCell>
            ) : null}
            {isBaselineColumnVisible("prioritizationStatus", columnVisibility) ? (
              <Table.HeaderCell
                rowSpan={headerBaseRowSpan}
                className={baselineCellClasses("prioritizationStatus", columnVisibility)}
              >
                <Typography intent="small" weight="semibold" as="span">
                  {formatHeaderLabel("Prioritization Status")}
                </Typography>
              </Table.HeaderCell>
            ) : null}
            {isBaselineColumnVisible("plannedAmount", columnVisibility) ? (
              <Table.HeaderCell rowSpan={headerBaseRowSpan} className={baselineCellClasses("plannedAmount", columnVisibility)}>
                <Tooltip
                  trigger="hover"
                  placement="top"
                  overlay={
                    <Tooltip.Content>
                      <PlannedAmountColumnHeaderTooltipBody />
                    </Tooltip.Content>
                  }
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: "100%",
                      cursor: "help",
                    }}
                  >
                    {formatHeaderLabel("Planned Amount")}
                  </span>
                </Tooltip>
              </Table.HeaderCell>
            ) : null}
            {isBaselineColumnVisible("status", columnVisibility) ? (
              <Table.HeaderCell rowSpan={headerBaseRowSpan} className={baselineCellClasses("status", columnVisibility)}>
                {formatHeaderLabel("Stage")}
              </Table.HeaderCell>
            ) : null}
            {isBaselineColumnVisible("projectPriority", columnVisibility) ? (
              <Table.HeaderCell rowSpan={headerBaseRowSpan} className={baselineCellClasses("projectPriority", columnVisibility)}>
                {formatHeaderLabel("Priority")}
              </Table.HeaderCell>
            ) : null}
            {isBaselineColumnVisible("prioritizationScore", columnVisibility) ? (
              <Table.HeaderCell
                rowSpan={headerBaseRowSpan}
                className={baselineCellClasses("prioritizationScore", columnVisibility)}
              >
                <Typography intent="small" weight="semibold" as="span">
                  {formatHeaderLabel("Prioritization Score")}
                </Typography>
              </Table.HeaderCell>
            ) : null}
            {isBaselineColumnVisible("originalBudget", columnVisibility) ? (
              <Table.HeaderCell rowSpan={headerBaseRowSpan} className={baselineCellClasses("originalBudget", columnVisibility)}>
                {formatHeaderLabel("Original Budget")}
              </Table.HeaderCell>
            ) : null}
            {isBaselineColumnVisible("revisedBudget", columnVisibility) ? (
              <Table.HeaderCell rowSpan={headerBaseRowSpan} className={baselineCellClasses("revisedBudget", columnVisibility)}>
                <Tooltip
                  trigger="hover"
                  placement="top"
                  overlay={
                    <Tooltip.Content>
                      <RevisedBudgetColumnHeaderTooltipBody />
                    </Tooltip.Content>
                  }
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: "100%",
                      cursor: "help",
                    }}
                  >
                    {formatHeaderLabel("Revised Budget")}
                  </span>
                </Tooltip>
              </Table.HeaderCell>
            ) : null}
            {isBaselineColumnVisible("jobToDate", columnVisibility) ? (
              <Table.HeaderCell rowSpan={headerBaseRowSpan} className={baselineCellClasses("jobToDate", columnVisibility)}>
                <Tooltip
                  trigger="hover"
                  placement="top"
                  overlay={
                    <Tooltip.Content>
                      <JobToDateCostsColumnHeaderTooltipBody />
                    </Tooltip.Content>
                  }
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: "100%",
                      cursor: "help",
                    }}
                  >
                    {formatHeaderLabel("Job to Date Costs")}
                  </span>
                </Tooltip>
              </Table.HeaderCell>
            ) : null}
            {isBaselineColumnVisible("startDate", columnVisibility) ? (
              <Table.HeaderCell rowSpan={headerBaseRowSpan} className={baselineCellClasses("startDate", columnVisibility)}>
                {formatHeaderLabel("Start Date")}
              </Table.HeaderCell>
            ) : null}
            {isBaselineColumnVisible("endDate", columnVisibility) ? (
              <Table.HeaderCell rowSpan={headerBaseRowSpan} className={baselineCellClasses("endDate", columnVisibility)}>
                {formatHeaderLabel("End Date")}
              </Table.HeaderCell>
            ) : null}
            {isBaselineColumnVisible("curve", columnVisibility) ? (
              <Table.HeaderCell rowSpan={headerBaseRowSpan} className={baselineCellClasses("curve", columnVisibility)}>
                {formatHeaderLabel("Curve")}
              </Table.HeaderCell>
            ) : null}
            {isBaselineColumnVisible("remaining", columnVisibility) ? (
              <Table.HeaderCell rowSpan={headerBaseRowSpan} className={baselineCellClasses("remaining", columnVisibility)}>
                <Tooltip
                  trigger="hover"
                  placement="top"
                  overlay={
                    <Tooltip.Content>
                      <RemainingColumnHeaderTooltipBody />
                    </Tooltip.Content>
                  }
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: "100%",
                      cursor: "help",
                    }}
                  >
                    {formatHeaderLabel("Remaining")}
                  </span>
                </Tooltip>
              </Table.HeaderCell>
            ) : null}
            {renderCriteriaColumnsInGrid
              ? criteriaColumns?.map((col) => {
                  const criteriaDescription = col.description.trim();
                  const labelEl = (
                    <Typography intent="small" weight="semibold" as="span">
                      {formatHeaderLabel(col.label)}
                    </Typography>
                  );
                  return (
                    <Table.HeaderCell
                      key={`criteria-h-${col.criterionId}`}
                      rowSpan={headerBaseRowSpan}
                      className={CRITERIA_COLUMN_CLASS}
                      style={{ ...CRITERIA_COLUMN_BOX_STYLE }}
                    >
                      {criteriaDescription ? (
                        <Tooltip
                          trigger="hover"
                          placement="top"
                          overlay={<Tooltip.Content>{criteriaDescription}</Tooltip.Content>}
                        >
                          <span
                            style={{
                              display: "inline-block",
                              width: "100%",
                              cursor: "help",
                            }}
                          >
                            {labelEl}
                          </span>
                        </Tooltip>
                      ) : (
                        labelEl
                      )}
                    </Table.HeaderCell>
                  );
                }) ?? null
              : null}
            {showPrioritizationScoreColumn && criteriaDefsForScoreCount > 0 && renderCriteriaColumnsInGrid ? (
              <Table.HeaderCell
                key="prioritization-score-h"
                rowSpan={headerBaseRowSpan}
                className={prioritizationScoreStickyColClass}
              >
                <Typography intent="small" weight="semibold" as="span">
                  {formatHeaderLabel("Prioritization Score")}
                </Typography>
              </Table.HeaderCell>
            ) : null}
            {show.forecast && !ganttFlatForecast && !(forecastGranularity === "quarter" && forecastColumnsExpanded) ? (
              <ForecastFyGroupHeaderCell
                expanded={forecastColumnsExpanded}
                fyLabel={forecastMasterHeaderLabel}
                colSpan={forecastColumnsExpanded ? leafColumnCountForTable : 1}
                onToggle={handleForecastBlockToggle}
              />
            ) : null}
            {show.forecast && ganttQuarterYearBands
              ? CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.map((fyYear) => (
                  <Table.HeaderCell
                    key={`gantt-qy-fy-${fyYear}`}
                    colSpan={4}
                    className="capital-planning-forecast-fy-subheader"
                    scope="colgroup"
                  >
                    <div className="capital-planning-forecast-fy-subheader-inner">
                      <span className="capital-planning-forecast-fy-subheader-label">
                        {programForecastFyLabel(fyYear)}
                      </span>
                    </div>
                  </Table.HeaderCell>
                ))
              : null}
            {show.forecast && ganttYearRollingFlat
              ? forecastLeafLabels.map((label, i) => (
                  <Table.HeaderCell
                    key={`gantt-flat-period-r1-${i}-${label}`}
                    className={[
                      "capital-planning-forecast-period-header",
                      "capital-planning-forecast-gantt-leaf",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    scope="col"
                  >
                    <div className="capital-planning-forecast-period-header-inner capital-planning-forecast-gantt-leaf-inner">
                      <span className="capital-planning-forecast-period-label">{label}</span>
                    </div>
                  </Table.HeaderCell>
                ))
              : null}
          </Table.HeaderRow>
          {show.forecast && ganttQuarterYearBands ? (
            <Table.HeaderRow>
              {CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.flatMap((_fyYear, fyIndex) =>
                ([0, 1, 2, 3] as const).map((fqInFy) => {
                  const fqIndex = fyIndex * 4 + fqInFy;
                  const label = forecastFqLabels[fqIndex] ?? "";
                  return (
                    <Table.HeaderCell
                      key={`gantt-qy-fq-${fqIndex}-${label}`}
                      className={[
                        "capital-planning-forecast-period-header",
                        "capital-planning-forecast-gantt-leaf",
                      ].join(" ")}
                      scope="col"
                    >
                      <div className="capital-planning-forecast-period-header-inner capital-planning-forecast-gantt-leaf-inner">
                        <span className="capital-planning-forecast-period-label">{label}</span>
                      </div>
                    </Table.HeaderCell>
                  );
                })
              )}
            </Table.HeaderRow>
          ) : null}
          {show.forecast &&
          ((!ganttFlatForecast && forecastGranularity === "quarter" && forecastColumnsExpanded) ||
            ganttProgramMonthLayout) ? (
            <Table.HeaderRow>
              {CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.map((fyYear, fyIndex) =>
                ganttProgramMonthLayout ? (
                  <Table.HeaderCell
                    key={`gantt-mo-fy-${fyYear}`}
                    colSpan={12}
                    className="capital-planning-forecast-fy-subheader"
                    scope="colgroup"
                  >
                    <div className="capital-planning-forecast-fy-subheader-inner">
                      <span className="capital-planning-forecast-fy-subheader-label">
                        {programForecastFyLabel(fyYear)}
                      </span>
                    </div>
                  </Table.HeaderCell>
                ) : (
                  <Table.HeaderCell
                    key={`forecast-fy-sub-${fyYear}`}
                    colSpan={
                      fyYearSectionExpanded[fyIndex]
                        ? quarterLeafColumnsForFy(fyIndex, fqCollapsed)
                        : 1
                    }
                    className="capital-planning-forecast-fy-subheader"
                  >
                    <div className="capital-planning-forecast-fy-subheader-inner">
                      <span className="capital-planning-forecast-fy-subheader-label">
                        {programForecastFyLabel(fyYear)}
                      </span>
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
                    </div>
                  </Table.HeaderCell>
                )
              )}
            </Table.HeaderRow>
          ) : null}
          {show.forecast && (!ganttFlatForecast || ganttProgramMonthLayout) ? (
          <Table.HeaderRow>
            {forecastColumnsExpanded || ganttProgramMonthLayout ? (
              forecastGranularity === "quarter" || ganttProgramMonthLayout ? (
                CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.flatMap((fyYear, fyIndex) => {
                  if (!ganttProgramMonthLayout && !fyYearSectionExpanded[fyIndex]) {
                    return [
                      <Table.HeaderCell
                        key={`forecast-fq-fy-collapsed-${fyYear}`}
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
                    return ganttProgramMonthLayout ? (
                      <ForecastPeriodHeaderCell
                        key={`gantt-mo-fq-${i}-${label}-${fyYear}`}
                        readOnly
                        label={label}
                        colSpan={3}
                        expanded
                        toggleAriaLabel=""
                        onToggle={() => {}}
                      />
                    ) : (
                      <ForecastPeriodHeaderCell
                        key={`forecast-fq-${i}-${label}-${fyYear}`}
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
                      />
                    );
                  });
                })
              ) : (
                forecastLeafLabels.map((label, i) => (
                  <ForecastPeriodHeaderCell
                    key={`forecast-h-${i}-${label}`}
                    label={label}
                    expanded
                    toggleAriaLabel={`Collapse forecast columns (${label})`}
                    onToggle={() => setForecastColumnsExpanded(false)}
                  />
                ))
              )
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
            ) : (
              forecastLeafLabels.map((label, i) => (
                <ForecastPeriodHeaderCell
                  key={`forecast-leaf-fy-collapsed-${i}-${label}`}
                  label={label}
                  colSpan={1}
                  fqMonthWidthHeader
                  expanded={false}
                  toggleAriaLabel={`Expand forecast columns (${label})`}
                  onToggle={() => setForecastColumnsExpanded(true)}
                />
              ))
            )}
          </Table.HeaderRow>
          ) : null}
          {show.forecast && quarterThreeRowForecastHeader ? (
            <Table.HeaderRow>
              {forecastColumnsExpanded || ganttProgramMonthLayout ? (
                ganttProgramMonthLayout ? (
                  CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.flatMap((_fyYear, fyIndex) =>
                    [0, 1, 2, 3].flatMap((fqInFy) => {
                      const fqIndex = fyIndex * 4 + fqInFy;
                      return ([0, 1, 2] as const).map((k) => {
                        const monthIdx = fqIndex * 3 + k;
                        const label = forecastLeafLabels[monthIdx] ?? "";
                        return (
                          <Table.HeaderCell
                            key={`gantt-mo-m-${fqIndex}-${k}-${monthIdx}`}
                            className="capital-planning-forecast-month-header"
                            scope="col"
                          >
                            {label}
                          </Table.HeaderCell>
                        );
                      });
                    })
                  )
                ) : (
                CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.flatMap((fyYear, fyIndex) => {
                  if (!fyYearSectionExpanded[fyIndex]) {
                    return [
                      <th
                        key={`forecast-month-fy-collapsed-${fyYear}`}
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
                    return fqCollapsed[fqIndex]
                      ? [
                          <th
                            key={`forecast-fq-rollup-h-${fqIndex}`}
                            className="capital-planning-forecast-fq-rollup-header"
                            role="columnheader"
                            aria-hidden
                          >
                            {"\u00a0"}
                          </th>,
                        ]
                      : ([0, 1, 2] as const).map((k) => {
                          const monthIdx = fqIndex * 3 + k;
                          const label = forecastLeafLabels[monthIdx] ?? "";
                          return (
                            <Table.HeaderCell
                              key={`forecast-m-${fqIndex}-${k}-${monthIdx}`}
                              className="capital-planning-forecast-month-header"
                              scope="col"
                            >
                              {label}
                            </Table.HeaderCell>
                          );
                        });
                  });
                })
                )
              ) : (
                <Table.HeaderCell
                  className="capital-planning-forecast-fq-rollup-header"
                  aria-hidden
                >
                  {"\u00a0"}
                </Table.HeaderCell>
              )}
            </Table.HeaderRow>
          ) : null}
        </Table.Header>
        <Table.Body>
          {!configShowEmpty ? (
            <Table.BodyRow>
              <Table.BodyCell colSpan={tableColumnCount}>
                <Table.TextCell>
                  Table Rows Hidden by Configuration — Turn the Option Back On Under Filter → Configure.
                </Table.TextCell>
              </Table.BodyCell>
            </Table.BodyRow>
          ) : filteredProjectRows.length === 0 ? (
            <Table.BodyRow>
              <Table.BodyCell colSpan={tableColumnCount}>
                <Table.TextCell>{`No Projects Match "${search.trim()}".`}</Table.TextCell>
              </Table.BodyCell>
            </Table.BodyRow>
          ) : (
            rowsGroupedByRegion.flatMap((group) => {
              const groupExpanded = !regionGroupCollapsed[group.key];
              const groupTotals = computeCapitalPlanningGridTotals(group.rows, totalsAggregationArgs);
              const groupHeader = (
                <Table.BodyRow key={`region-group-${group.key}`} className="capital-planning-table-status-group">
                  <Table.BodyCell
                    className={[
                      baselineCellClasses("project", columnVisibility),
                      "capital-planning-table-status-group-header-label-cell",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <Table.TextCell className="capital-planning-status-group-header-text-cell">
                      <button
                        type="button"
                        className="capital-planning-status-group-header-toggle"
                        aria-expanded={groupExpanded}
                        aria-label={
                          groupExpanded
                            ? `Collapse ${group.label} (${group.rows.length} projects)`
                            : `Expand ${group.label} (${group.rows.length} projects)`
                        }
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleRegionGroupCollapsed(group.key);
                        }}
                      >
                        <span className="capital-planning-status-group-header-chevron" aria-hidden>
                          {groupExpanded ? <CaretDown size="sm" /> : <CaretRight size="sm" />}
                        </span>
                        <Typography
                          intent="small"
                          weight="semibold"
                          as="span"
                          className="capital-planning-status-group-header-title"
                        >
                          {group.label}
                        </Typography>
                      </button>
                    </Table.TextCell>
                  </Table.BodyCell>
                  {isBaselineColumnVisible("projectDescription", columnVisibility) ? (
                    <Table.BodyCell className={baselineCellClasses("projectDescription", columnVisibility)}>
                      <Table.TextCell />
                    </Table.BodyCell>
                  ) : null}
                  {isBaselineColumnVisible("estimatedBudget", columnVisibility) ? (
                    <Table.BodyCell className={baselineCellClasses("estimatedBudget", columnVisibility)}>
                      {currencyTotalCell(groupTotals.estimatedBudget, {
                        className: "capital-planning-planned-amount-value",
                        style: FOOTER_TOTAL_BOLD_STYLE,
                      })}
                    </Table.BodyCell>
                  ) : null}
                  {isBaselineColumnVisible("prioritizationStatus", columnVisibility) ? (
                    <Table.BodyCell className={baselineCellClasses("prioritizationStatus", columnVisibility)}>
                      <Table.TextCell />
                    </Table.BodyCell>
                  ) : null}
                  {isBaselineColumnVisible("plannedAmount", columnVisibility) ? (
                    <Table.BodyCell className={baselineCellClasses("plannedAmount", columnVisibility)}>
                      {currencyTotalCell(groupTotals.planned, {
                        className: "capital-planning-planned-amount-value",
                        style: FOOTER_TOTAL_BOLD_STYLE,
                      })}
                    </Table.BodyCell>
                  ) : null}
                  {isBaselineColumnVisible("status", columnVisibility) ? (
                    <Table.BodyCell className={baselineCellClasses("status", columnVisibility)}>
                      <Table.TextCell />
                    </Table.BodyCell>
                  ) : null}
                  {isBaselineColumnVisible("projectPriority", columnVisibility) ? (
                    <Table.BodyCell className={baselineCellClasses("projectPriority", columnVisibility)}>
                      <Table.TextCell />
                    </Table.BodyCell>
                  ) : null}
                  {isBaselineColumnVisible("prioritizationScore", columnVisibility) ? (
                    <Table.BodyCell className={baselineCellClasses("prioritizationScore", columnVisibility)}>
                      <Table.TextCell />
                    </Table.BodyCell>
                  ) : null}
                  {isBaselineColumnVisible("originalBudget", columnVisibility) ? (
                    <Table.BodyCell className={baselineCellClasses("originalBudget", columnVisibility)}>
                      {currencyTotalCell(groupTotals.original, { style: FOOTER_TOTAL_BOLD_STYLE })}
                    </Table.BodyCell>
                  ) : null}
                  {isBaselineColumnVisible("revisedBudget", columnVisibility) ? (
                    <Table.BodyCell className={baselineCellClasses("revisedBudget", columnVisibility)}>
                      {currencyTotalCell(groupTotals.revised, { style: FOOTER_TOTAL_BOLD_STYLE })}
                    </Table.BodyCell>
                  ) : null}
                  {isBaselineColumnVisible("jobToDate", columnVisibility) ? (
                    <Table.BodyCell className={baselineCellClasses("jobToDate", columnVisibility)}>
                      {currencyTotalCell(groupTotals.jtd, { style: FOOTER_TOTAL_BOLD_STYLE })}
                    </Table.BodyCell>
                  ) : null}
                  {isBaselineColumnVisible("startDate", columnVisibility) ? (
                    <Table.BodyCell className={baselineCellClasses("startDate", columnVisibility)}>
                      <Table.TextCell />
                    </Table.BodyCell>
                  ) : null}
                  {isBaselineColumnVisible("endDate", columnVisibility) ? (
                    <Table.BodyCell className={baselineCellClasses("endDate", columnVisibility)}>
                      <Table.TextCell />
                    </Table.BodyCell>
                  ) : null}
                  {isBaselineColumnVisible("curve", columnVisibility) ? (
                    <Table.BodyCell className={baselineCellClasses("curve", columnVisibility)}>
                      <Table.TextCell />
                    </Table.BodyCell>
                  ) : null}
                  {isBaselineColumnVisible("remaining", columnVisibility) ? (
                    <Table.BodyCell className={baselineCellClasses("remaining", columnVisibility)}>
                      <Table.TextCell
                        style={{
                          textAlign: "right",
                          fontVariantNumeric: "tabular-nums",
                          ...FOOTER_TOTAL_BOLD_STYLE,
                        }}
                      >
                        {formatRemainingToForecastCurrency(groupTotals.remaining)}
                      </Table.TextCell>
                    </Table.BodyCell>
                  ) : null}
                  {renderCriteriaColumnsInGrid
                    ? criteriaColumns?.map((col) => (
                        <Table.BodyCell
                          key={`region-group-${group.key}-crit-${col.criterionId}`}
                          className={CRITERIA_COLUMN_CLASS}
                          style={{ ...CRITERIA_COLUMN_BOX_STYLE, verticalAlign: "middle" }}
                        >
                          <Table.TextCell />
                        </Table.BodyCell>
                      )) ?? null
                    : null}
                  {showPrioritizationScoreColumn && criteriaDefsForScoreCount > 0 && renderCriteriaColumnsInGrid ? (
                    <Table.BodyCell
                      key={`region-group-${group.key}-prio-score`}
                      className={prioritizationScoreStickyColClass}
                    >
                      <Table.TextCell />
                    </Table.BodyCell>
                  ) : null}
                  {show.forecast
                    ? groupTotals.forecast.map((v, idx) => (
                        <Table.BodyCell
                          key={`region-group-${group.key}-fc-${idx}`}
                          className="capital-planning-table-footer-forecast-cell"
                        >
                          {currencyTotalCell(v, { style: FOOTER_TOTAL_BOLD_STYLE })}
                        </Table.BodyCell>
                      ))
                    : null}
                </Table.BodyRow>
              );
              if (!groupExpanded) {
                return [groupHeader];
              }
              return [
                groupHeader,
                ...group.rows.map((row) => {
              const forecastBasisKey = `${row.curve}|${row.plannedAmount}|jtd:${row.jobToDateCosts ?? ""}`;
              const manualForecastDateExpand =
                row.curve === "Manual"
                  ? (parts: (string | number)[], dollars: number) =>
                      expandProjectDatesForManualForecast(row.id, row.startDate, row.endDate, parts, dollars)
                  : undefined;
              const effectiveMonthAmounts = getEffectiveProgramForecastMonthAmounts(
                row,
                forecastOverrides,
                forecastBasisKey,
                anchorDate
              );
              const plannedSource = plannedAmountSourceByRowId[row.id];
              const isLumpSumPlannedAmount = isLumpSumPlannedAmountSource(plannedSource);
              const isHighLevelBudgetItemsPlannedAmount =
                plannedSource === HIGH_LEVEL_BUDGET_ITEMS_SOURCE;
              const projectBudgetPlannedAmountTooltip =
                plannedSource === PROJECT_BUDGET_ORIGINAL_SOURCE
                  ? "Original Budget"
                  : plannedSource === PROJECT_BUDGET_REVISED_SOURCE
                    ? "Revised Budget"
                    : null;
              const projectDescription = prototypeProjectDescriptionFromName(row.project);
              return (
              <Table.BodyRow key={row.id} className="capital-planning-table-status-group-child">
                <Table.BodyCell className={baselineCellClasses("project", columnVisibility)}>
                  <Table.LinkCell href={`/project/${row.projectId}`}>{row.project}</Table.LinkCell>
                </Table.BodyCell>
                {isBaselineColumnVisible("projectDescription", columnVisibility) ? (
                  <Table.BodyCell
                    className={baselineCellClasses("projectDescription", columnVisibility)}
                    style={{ verticalAlign: "middle" }}
                  >
                    <Table.TextCell title={projectDescription}>{projectDescription}</Table.TextCell>
                  </Table.BodyCell>
                ) : null}
                {isBaselineColumnVisible("estimatedBudget", columnVisibility) ? (
                  <Table.BodyCell
                    className={baselineCellClasses("estimatedBudget", columnVisibility)}
                    style={{ verticalAlign: "middle" }}
                  >
                    <div
                      className="capital-planning-planned-amount-cell capital-planning-planned-amount-cell--lump-sum"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        gap: 8,
                        width: "100%",
                        minWidth: 0,
                        boxSizing: "border-box",
                      }}
                    >
                      <div
                        style={{
                          flex: "1 1 auto",
                          minWidth: 0,
                          width: "100%",
                          display: "flex",
                          justifyContent: "stretch",
                          alignItems: "center",
                        }}
                      >
                        {setEstimatedBudgetByRowId ? (
                          <div
                            className="capital-planning-planned-amount-input-wrap"
                            style={{
                              flex: "1 1 auto",
                              minWidth: 0,
                              width: "100%",
                              maxWidth: "100%",
                            }}
                          >
                            <LumpSumPlannedAmountCurrencyInput
                              value={
                                estimatedBudgetByRowId?.[row.id] ??
                                (Number.isFinite(row.plannedAmount) ? row.plannedAmount : 0)
                              }
                              onChange={(n) => {
                                setEstimatedBudgetByRowId((prev) => ({
                                  ...prev,
                                  [row.id]: n,
                                }));
                              }}
                              ariaLabel={`Estimated Budget for ${row.project}`}
                            />
                          </div>
                        ) : (
                          <div
                            style={{
                              flex: "1 1 auto",
                              minWidth: 0,
                              width: "100%",
                              display: "flex",
                              justifyContent: "flex-end",
                              alignItems: "center",
                            }}
                          >
                            <Table.CurrencyCell
                              className="capital-planning-planned-amount-value"
                              value={
                                estimatedBudgetByRowId?.[row.id] ??
                                (Number.isFinite(row.plannedAmount) ? row.plannedAmount : 0)
                              }
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </Table.BodyCell>
                ) : null}
                {isBaselineColumnVisible("prioritizationStatus", columnVisibility) ? (
                  <Table.BodyCell
                    className={baselineCellClasses("prioritizationStatus", columnVisibility)}
                    style={{ verticalAlign: "middle" }}
                  >
                    {setPrioritizationStatusByRowId ? (
                      <Table.SelectCell
                        key={`capital-planning-prio-status-${row.id}-${normalizePrioritizationStatus(prioritizationStatusByRowId?.[row.id])}`}
                        block
                        label={
                          <Pill color={PRIORITIZATION_STATUS_PILL_COLOR[normalizePrioritizationStatus(prioritizationStatusByRowId?.[row.id])]}>
                            {normalizePrioritizationStatus(prioritizationStatusByRowId?.[row.id])}
                          </Pill>
                        }
                        aria-label={`Prioritization status for ${row.project}`}
                        onSelect={(s) => {
                          if (s.action !== "selected") return;
                          const next = String(s.item);
                          setPrioritizationStatusByRowId((prev) => ({ ...prev, [row.id]: next }));
                        }}
                      >
                        {PRIORITIZATION_STATUS_OPTIONS.map((opt) => (
                          <Select.Option key={opt} value={opt} selected={normalizePrioritizationStatus(prioritizationStatusByRowId?.[row.id]) === opt}>
                            <Pill color={PRIORITIZATION_STATUS_PILL_COLOR[opt]}>{opt}</Pill>
                          </Select.Option>
                        ))}
                      </Table.SelectCell>
                    ) : (
                      <Table.TextCell>
                        <Pill color={PRIORITIZATION_STATUS_PILL_COLOR[normalizePrioritizationStatus(prioritizationStatusByRowId?.[row.id])]}>
                          {normalizePrioritizationStatus(prioritizationStatusByRowId?.[row.id])}
                        </Pill>
                      </Table.TextCell>
                    )}
                  </Table.BodyCell>
                ) : null}
                {isBaselineColumnVisible("plannedAmount", columnVisibility) ? (
                <Table.BodyCell
                  className={baselineCellClasses("plannedAmount", columnVisibility)}
                  style={{ verticalAlign: "middle" }}
                >
                  <div
                    className={[
                      "capital-planning-planned-amount-cell",
                      isLumpSumPlannedAmount ? "capital-planning-planned-amount-cell--lump-sum" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      gap: 8,
                      width: "100%",
                      minWidth: 0,
                      boxSizing: "border-box",
                    }}
                  >
                    <DropdownFlyout
                      variant="secondary"
                      size="sm"
                      icon={<CaretDown />}
                      aria-label={`Planned Amount Options For ${row.project}`}
                      placement="bottom-left"
                      options={plannedAmountSourceOptionsForRow(row)}
                      optionRenderer={(opt) => renderPlannedAmountSourceOption(opt, plannedAmountSourceByRowId[row.id])}
                      onClick={(option: DropdownFlyoutOption) => {
                        if ((option as PlannedAmountSourceOption).disabled) {
                          return;
                        }
                        const value = String(option.value);
                        if (value === PLANNED_AMOUNT_FLYOUT_CAPTION_VALUE) {
                          return;
                        }
                        setPlannedAmountSourceByRowId((prev) => ({
                          ...prev,
                          [row.id]: value,
                        }));
                        if (value === LUMP_SUM_PLANNED_AMOUNT_SOURCE) {
                          setPlannedAmountManualByRowId((prev) => ({
                            ...prev,
                            [row.id]: prev[row.id] ?? row.plannedAmount,
                          }));
                        } else {
                          setPlannedAmountManualByRowId((prev) => {
                            const next = { ...prev };
                            delete next[row.id];
                            return next;
                          });
                        }
                        if (value === HIGH_LEVEL_BUDGET_ITEMS_SOURCE) {
                          setHighLevelBudgetItemsRow(row);
                        }
                      }}
                    />
                    <div
                      style={{
                        flex: "1 1 auto",
                        minWidth: 0,
                        width: "100%",
                        display: "flex",
                        justifyContent: isLumpSumPlannedAmount ? "stretch" : "flex-end",
                        alignItems: "center",
                      }}
                    >
                      {isLumpSumPlannedAmount ? (
                        <div
                          className="capital-planning-planned-amount-input-wrap"
                          style={{ flex: "1 1 auto", minWidth: 0, width: "100%", maxWidth: "100%" }}
                        >
                          <LumpSumPlannedAmountCurrencyInput
                            value={plannedAmountManualByRowId[row.id] ?? row.plannedAmount}
                            onChange={(n) => {
                              setPlannedAmountManualByRowId((prev) => ({
                                ...prev,
                                [row.id]: n,
                              }));
                            }}
                            ariaLabel={`Planned Amount For ${row.project}`}
                          />
                        </div>
                      ) : isHighLevelBudgetItemsPlannedAmount ? (
                        <Table.CurrencyCell className="capital-planning-planned-amount-value capital-planning-planned-amount-high-level-link">
                          <Table.LinkCell
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setHighLevelBudgetItemsRow(row);
                            }}
                            aria-label={`Open High Level Budget Items for ${row.project}`}
                          >
                            {formatLumpSumUsdInput(
                              Number.isFinite(row.plannedAmount) ? row.plannedAmount : 0
                            )}
                          </Table.LinkCell>
                        </Table.CurrencyCell>
                      ) : projectBudgetPlannedAmountTooltip ? (
                        <Tooltip
                          trigger="hover"
                          placement="top"
                          overlay={
                            <Tooltip.Content>{projectBudgetPlannedAmountTooltip}</Tooltip.Content>
                          }
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              width: "100%",
                              justifyContent: "flex-end",
                              minWidth: 0,
                            }}
                          >
                            <Table.CurrencyCell
                              className="capital-planning-planned-amount-value"
                              value={row.plannedAmount}
                            />
                          </span>
                        </Tooltip>
                      ) : (
                        <Table.CurrencyCell
                          className="capital-planning-planned-amount-value"
                          value={row.plannedAmount}
                        />
                      )}
                    </div>
                  </div>
                </Table.BodyCell>
                ) : null}
                {isBaselineColumnVisible("status", columnVisibility) ? (
                <Table.BodyCell className={baselineCellClasses("status", columnVisibility)}>
                  <Pill color={STATUS_PILL_COLOR[row.status]}>{row.status}</Pill>
                </Table.BodyCell>
                ) : null}
                {isBaselineColumnVisible("projectPriority", columnVisibility) ? (
                  <Table.BodyCell
                    className={baselineCellClasses("projectPriority", columnVisibility)}
                    style={{ verticalAlign: "middle" }}
                  >
                    {setPrioritiesByRowId ? (
                      <Table.SelectCell
                        key={`capital-planning-priority-${row.id}-${row.priority}`}
                        block
                        label={row.priority}
                        aria-label={`Priority For ${row.project}`}
                        onSelect={(s) => {
                          if (s.action !== "selected") return;
                          const next = s.item as ProjectPriority;
                          if (next === row.priority) return;
                          setPrioritiesByRowId((prev) => ({ ...prev, [row.id]: next }));
                        }}
                      >
                        {PRIORITY_OPTIONS.map((p) => (
                          <Select.Option key={p} value={p} selected={row.priority === p}>
                            {p}
                          </Select.Option>
                        ))}
                      </Table.SelectCell>
                    ) : (
                      <Table.TextCell>{row.priority}</Table.TextCell>
                    )}
                  </Table.BodyCell>
                ) : null}
                {isBaselineColumnVisible("prioritizationScore", columnVisibility) ? (
                  <Table.BodyCell
                    className={baselineCellClasses("prioritizationScore", columnVisibility)}
                    style={{ verticalAlign: "middle", textAlign: "right" }}
                  >
                    <Typography intent="small" weight="semibold" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {formatPrioritizationScorePercent(
                        prioritizationScoresByRowId?.[row.id] ?? null
                      )}
                    </Typography>
                  </Table.BodyCell>
                ) : null}
                {isBaselineColumnVisible("originalBudget", columnVisibility) ? (
                <Table.BodyCell className={baselineCellClasses("originalBudget", columnVisibility)}>
                  {budgetMetricCurrencyCell(row.originalBudget)}
                </Table.BodyCell>
                ) : null}
                {isBaselineColumnVisible("revisedBudget", columnVisibility) ? (
                <Table.BodyCell className={baselineCellClasses("revisedBudget", columnVisibility)}>
                  {budgetMetricCurrencyCell(row.revisedBudget)}
                </Table.BodyCell>
                ) : null}
                {isBaselineColumnVisible("jobToDate", columnVisibility) ? (
                <Table.BodyCell className={baselineCellClasses("jobToDate", columnVisibility)}>
                  {budgetMetricCurrencyCell(row.jobToDateCosts)}
                </Table.BodyCell>
                ) : null}
                {isBaselineColumnVisible("startDate", columnVisibility) ? (
                <Table.BodyCell className={baselineCellClasses("startDate", columnVisibility)} style={{ verticalAlign: "middle" }}>
                  <Table.DateSelectCell
                    value={optionalIsoStringToDate(row.startDate)}
                    onChange={(d) => {
                      setRowDatesById((prev) => {
                        const cur = prev[row.id] ?? {
                          startDate: row.startDate,
                          endDate: row.endDate,
                        };
                        if (!d) {
                          return {
                            ...prev,
                            [row.id]: { ...cur, startDate: "" },
                          };
                        }
                        const nextStart = dateToIsoString(d);
                        const end = cur.endDate ?? "";
                        const nextEnd =
                          end.trim() !== "" && nextStart > end ? nextStart : end;
                        return {
                          ...prev,
                          [row.id]: {
                            ...cur,
                            startDate: nextStart,
                            endDate: nextEnd,
                          },
                        };
                      });
                    }}
                    disabledDate={(candidate) => {
                      const end = row.endDate?.trim() ?? "";
                      if (!end) return false;
                      return dateToIsoString(candidate) > end;
                    }}
                    aria-label={`Start Date For ${row.project}`}
                  />
                </Table.BodyCell>
                ) : null}
                {isBaselineColumnVisible("endDate", columnVisibility) ? (
                <Table.BodyCell className={baselineCellClasses("endDate", columnVisibility)} style={{ verticalAlign: "middle" }}>
                  <Table.DateSelectCell
                    value={optionalIsoStringToDate(row.endDate)}
                    onChange={(d) => {
                      setRowDatesById((prev) => {
                        const cur = prev[row.id] ?? {
                          startDate: row.startDate,
                          endDate: row.endDate,
                        };
                        if (!d) {
                          return {
                            ...prev,
                            [row.id]: { ...cur, endDate: "" },
                          };
                        }
                        const nextEnd = dateToIsoString(d);
                        return {
                          ...prev,
                          [row.id]: { ...cur, endDate: nextEnd },
                        };
                      });
                    }}
                    disabledDate={(candidate) => {
                      const start = row.startDate?.trim() ?? "";
                      if (!start) return false;
                      return dateToIsoString(candidate) < start;
                    }}
                    aria-label={`End Date For ${row.project}`}
                  />
                </Table.BodyCell>
                ) : null}
                {isBaselineColumnVisible("curve", columnVisibility) ? (
                <Table.BodyCell className={baselineCellClasses("curve", columnVisibility)} style={{ verticalAlign: "middle" }}>
                  <Table.SelectCell
                    key={`capital-planning-curve-${row.id}-${row.curve}`}
                    block
                    label={
                      row.curve === "" ? (
                        <span className="capital-planning-curve-placeholder">{CURVE_SELECT_PLACEHOLDER_LABEL}</span>
                      ) : (
                        row.curve
                      )
                    }
                    aria-label={`Curve For ${row.project}`}
                    onSelect={(s) => {
                      if (s.action !== "selected") return;
                      const next = s.item as ProjectCurve;
                      if (next === "" || next === row.curve) return;
                      if (row.curve === "Manual" && next !== "Manual") {
                        setCurveChangeFromManual({
                          rowId: row.id,
                          nextCurve: next,
                        });
                        return;
                      }
                      setCurvesByRowId((prev) => ({ ...prev, [row.id]: next }));
                    }}
                  >
                    {CURVE_OPTIONS.map((c) => (
                      <Select.Option key={c} value={c} selected={row.curve === c}>
                        {c}
                      </Select.Option>
                    ))}
                  </Table.SelectCell>
                </Table.BodyCell>
                ) : null}
                {isBaselineColumnVisible("remaining", columnVisibility) ? (
                <Table.BodyCell className={baselineCellClasses("remaining", columnVisibility)}>
                  <Table.TextCell
                    style={{
                      textAlign: "right",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {formatRemainingToForecastCurrency(
                      getRemainingToForecast(
                        getForecastAllocationBasisDollars(row),
                        getTotalAllocatedForecastDollars(
                          row,
                          forecastOverrides,
                          forecastBasisKey,
                          anchorDate,
                          forecastGranularity,
                          forecastColumnsExpanded,
                          forecastLeafLabels.length,
                          ganttFlatForecast,
                          ganttProgramMonthLayout,
                          ganttQuarterYearBands
                        )
                      )
                    )}
                  </Table.TextCell>
                </Table.BodyCell>
                ) : null}
                {renderProjectCriteriaCells(row.id)}
                {showPrioritizationScoreColumn && criteriaDefsForScoreCount > 0 && renderCriteriaColumnsInGrid ? (
                  <Table.BodyCell
                    key={`${row.id}-prio-score`}
                    className={prioritizationScoreStickyColClass}
                    style={{ verticalAlign: "middle" }}
                  >
                    <Typography intent="small" weight="semibold" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {formatPrioritizationScorePercent(
                        prioritizationScoresByRowId?.[row.id] ?? null
                      )}
                    </Typography>
                  </Table.BodyCell>
                ) : null}
                {show.forecast ? (
                  ganttFlatForecast ? (
                    <Table.BodyCell
                      key={`${row.id}-gantt-timeline`}
                      colSpan={leafColumnCountForTable}
                      className="capital-planning-gantt-row-timeline-cell"
                    >
                      {/*
                        Keep Tooltip + Gantt in one stable tree. If we only wrapped the empty-date case,
                        the first create-bar paint would swap branches, unmount the bar, and drop pointer capture
                        so click-drag could not resize in one gesture.
                      */}
                      <Tooltip
                        trigger="hover"
                        placement="top"
                        beforeShow={() => {
                          const hasStart = Boolean(String(row.startDate ?? "").trim());
                          const hasEnd = Boolean(String(row.endDate ?? "").trim());
                          if (hasStart && hasEnd) return false;
                          return undefined;
                        }}
                        overlay={<Tooltip.Content>{GANTT_EMPTY_SCHEDULE_TOOLTIP}</Tooltip.Content>}
                      >
                        <div className="capital-planning-gantt-forecast-tooltip-target">
                          <div className="capital-planning-gantt-row-bar-wrap">
                            <CapitalPlanningProjectGanttBar
                              rowId={row.id}
                              barTitle={row.project}
                              startIso={row.startDate ?? ""}
                              endIso={row.endDate ?? ""}
                              timeline={ganttYearRollingFlat ? "rollingYear" : "program"}
                              anchorDate={anchorDate}
                              setRowDatesById={setRowDatesById}
                            />
                          </div>
                        </div>
                      </Tooltip>
                    </Table.BodyCell>
                  ) : forecastColumnsExpanded ? (
                  forecastGranularity === "quarter" ? (
                    CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.flatMap((fyYear, fyIndex) => {
                      if (!fyYearSectionExpanded[fyIndex]) {
                        return [
                          <Table.BodyCell
                            key={`${row.id}-fy-year-rollup-${fyIndex}`}
                            className="capital-planning-forecast-fq-rollup-cell"
                          >
                            <ForecastEditableNumberCell
                              rowId={row.id}
                              parts={["q", "y", fyIndex]}
                              forecastBasisKey={forecastBasisKey}
                              computedValue={effectiveMonthAmounts
                                .slice(fyIndex * 12, fyIndex * 12 + 12)
                                .reduce((a, b) => a + b, 0)}
                              overrides={forecastOverrides}
                              setOverrides={setForecastOverrides}
                              curveBlocksInlineForecastEdit={row.curve !== "Manual"}
                              onCurveBlocksInlineForecastEdit={() => openForecastManualCurveModal(row.id)}
                              onExpandProjectDatesForManualForecast={manualForecastDateExpand}
                              ariaLabel={`Forecast ${programForecastFyLabel(fyYear)} total for ${row.project}`}
                            />
                          </Table.BodyCell>,
                        ];
                      }
                      return [0, 1, 2, 3].flatMap((fqInFy) => {
                        const fqIndex = fyIndex * 4 + fqInFy;
                        const fqLabel = forecastFqLabels[fqIndex];
                        const fq1ReadOnly =
                          fqInFy === 0 && isProgramForecastFq1PeriodEnded(fyYear, anchorDate);
                        return fqCollapsed[fqIndex]
                          ? [
                              <Table.BodyCell
                                key={`${row.id}-fq-rollup-${fqIndex}`}
                                className="capital-planning-forecast-fq-rollup-cell"
                              >
                                <ForecastEditableNumberCell
                                  rowId={row.id}
                                  parts={["q", "r", fqIndex]}
                                  forecastBasisKey={forecastBasisKey}
                                  computedValue={sumQuarterMonthAmounts(effectiveMonthAmounts, fqIndex)}
                                  overrides={forecastOverrides}
                                  setOverrides={setForecastOverrides}
                                  curveBlocksInlineForecastEdit={row.curve !== "Manual"}
                                  onCurveBlocksInlineForecastEdit={() => openForecastManualCurveModal(row.id)}
                                  onExpandProjectDatesForManualForecast={manualForecastDateExpand}
                                  readOnly={fq1ReadOnly}
                                  ariaLabel={`Forecast ${programForecastFyLabel(fyYear)} ${fqLabel} total for ${row.project}`}
                                />
                              </Table.BodyCell>,
                            ]
                          : [0, 1, 2].map((k) => {
                              const monthIdx = fqIndex * 3 + k;
                              const fyForMonth = programFiscalYearForGlobalMonthIndex(monthIdx);
                              const monthFq1ReadOnly =
                                isGlobalMonthIndexInFq1(monthIdx) &&
                                fyForMonth !== undefined &&
                                isProgramForecastFq1PeriodEnded(fyForMonth, anchorDate);
                              return (
                                <Table.BodyCell
                                  key={`${row.id}-forecast-m-${fqIndex}-${k}`}
                                  className="capital-planning-forecast-month-cell"
                                >
                                  <ForecastEditableNumberCell
                                    rowId={row.id}
                                    parts={["q", "m", monthIdx]}
                                    forecastBasisKey={forecastBasisKey}
                                    computedValue={effectiveMonthAmounts[monthIdx] ?? 0}
                                    overrides={forecastOverrides}
                                    setOverrides={setForecastOverrides}
                                    curveBlocksInlineForecastEdit={row.curve !== "Manual"}
                                    onCurveBlocksInlineForecastEdit={() => openForecastManualCurveModal(row.id)}
                                    onExpandProjectDatesForManualForecast={manualForecastDateExpand}
                                    readOnly={monthFq1ReadOnly}
                                    ariaLabel={`Forecast ${forecastLeafLabels[monthIdx]} (${programForecastFyLabel(fyYear)}) for ${row.project}`}
                                  />
                                </Table.BodyCell>
                              );
                            });
                      });
                    })
                  ) : (
                    forecastLeafLabels.map((label, i) => (
                      <Table.BodyCell
                        key={`${row.id}-forecast-leaf-${i}-${label}`}
                        className="capital-planning-forecast-period-cell"
                      >
                        <ForecastEditableNumberCell
                          rowId={row.id}
                          parts={["x", forecastGranularity, "e", i]}
                          forecastBasisKey={forecastBasisKey}
                          computedValue={getForecastLeafDollarAmount(
                            row,
                            i,
                            forecastGranularity,
                            anchorDate
                          )}
                          overrides={forecastOverrides}
                          setOverrides={setForecastOverrides}
                          curveBlocksInlineForecastEdit={row.curve !== "Manual"}
                          onCurveBlocksInlineForecastEdit={() => openForecastManualCurveModal(row.id)}
                          onExpandProjectDatesForManualForecast={manualForecastDateExpand}
                          ariaLabel={`Forecast ${label} for ${row.project}`}
                        />
                      </Table.BodyCell>
                    ))
                  )
                ) : forecastGranularity === "quarter" ? (
                  <Table.BodyCell className="capital-planning-forecast-fq-rollup-cell">
                    <ForecastEditableNumberCell
                      rowId={row.id}
                      parts={["q", "fy"]}
                      forecastBasisKey={forecastBasisKey}
                      computedValue={effectiveMonthAmounts.reduce((a, b) => a + b, 0)}
                      overrides={forecastOverrides}
                      setOverrides={setForecastOverrides}
                      curveBlocksInlineForecastEdit={row.curve !== "Manual"}
                      onCurveBlocksInlineForecastEdit={() => openForecastManualCurveModal(row.id)}
                      onExpandProjectDatesForManualForecast={manualForecastDateExpand}
                      ariaLabel={`Forecast ${getProgramForecastHeaderTitle()} total for ${row.project}`}
                    />
                  </Table.BodyCell>
                ) : (
                  forecastLeafLabels.map((label, i) => (
                    <Table.BodyCell
                      key={`${row.id}-fy-collapsed-leaf-${i}-${label}`}
                      className="capital-planning-forecast-fq-rollup-cell"
                    >
                      <ForecastEditableNumberCell
                        rowId={row.id}
                        parts={["x", forecastGranularity, "c", i]}
                        forecastBasisKey={forecastBasisKey}
                        computedValue={getForecastLeafDollarAmount(
                          row,
                          i,
                          forecastGranularity,
                          anchorDate
                        )}
                        overrides={forecastOverrides}
                        setOverrides={setForecastOverrides}
                        curveBlocksInlineForecastEdit={row.curve !== "Manual"}
                        onCurveBlocksInlineForecastEdit={() => openForecastManualCurveModal(row.id)}
                        onExpandProjectDatesForManualForecast={manualForecastDateExpand}
                        ariaLabel={`Forecast ${label} for ${row.project}`}
                      />
                    </Table.BodyCell>
                  ))
                )
                ) : null}
              </Table.BodyRow>
              );
                })
              ];
            })
          )}
        </Table.Body>
        {showFooterRow ? (
          <tfoot className="capital-planning-table-sticky-footer">
            <Table.BodyRow>
              <Table.BodyCell className={baselineCellClasses("project", columnVisibility)}>
                <Table.TextCell>
                  <Typography intent="small" weight="semibold">
                    Total
                  </Typography>
                </Table.TextCell>
              </Table.BodyCell>
              {isBaselineColumnVisible("projectDescription", columnVisibility) ? (
                <Table.BodyCell className={baselineCellClasses("projectDescription", columnVisibility)}>
                  <Table.TextCell />
                </Table.BodyCell>
              ) : null}
              {isBaselineColumnVisible("estimatedBudget", columnVisibility) ? (
                <Table.BodyCell className={baselineCellClasses("estimatedBudget", columnVisibility)}>
                  {currencyTotalCell(footerTotals.estimatedBudget, {
                    className: "capital-planning-planned-amount-value",
                    style: FOOTER_TOTAL_BOLD_STYLE,
                  })}
                </Table.BodyCell>
              ) : null}
              {isBaselineColumnVisible("prioritizationStatus", columnVisibility) ? (
                <Table.BodyCell className={baselineCellClasses("prioritizationStatus", columnVisibility)}>
                  <Table.TextCell />
                </Table.BodyCell>
              ) : null}
              {isBaselineColumnVisible("plannedAmount", columnVisibility) ? (
                <Table.BodyCell className={baselineCellClasses("plannedAmount", columnVisibility)}>
                  {currencyTotalCell(footerTotals.planned, {
                    className: "capital-planning-planned-amount-value",
                    style: FOOTER_TOTAL_BOLD_STYLE,
                  })}
                </Table.BodyCell>
              ) : null}
              {isBaselineColumnVisible("status", columnVisibility) ? (
                <Table.BodyCell className={baselineCellClasses("status", columnVisibility)}>
                  <Table.TextCell />
                </Table.BodyCell>
              ) : null}
              {isBaselineColumnVisible("projectPriority", columnVisibility) ? (
                <Table.BodyCell className={baselineCellClasses("projectPriority", columnVisibility)}>
                  <Table.TextCell />
                </Table.BodyCell>
              ) : null}
              {isBaselineColumnVisible("prioritizationScore", columnVisibility) ? (
                <Table.BodyCell className={baselineCellClasses("prioritizationScore", columnVisibility)}>
                  <Table.TextCell />
                </Table.BodyCell>
              ) : null}
              {isBaselineColumnVisible("originalBudget", columnVisibility) ? (
                <Table.BodyCell className={baselineCellClasses("originalBudget", columnVisibility)}>
                  {footerBudgetColumnsWithData.original ? (
                    currencyTotalCell(footerTotals.original, { style: FOOTER_TOTAL_BOLD_STYLE })
                  ) : (
                    <Table.TextCell />
                  )}
                </Table.BodyCell>
              ) : null}
              {isBaselineColumnVisible("revisedBudget", columnVisibility) ? (
                <Table.BodyCell className={baselineCellClasses("revisedBudget", columnVisibility)}>
                  {footerBudgetColumnsWithData.revised ? (
                    currencyTotalCell(footerTotals.revised, { style: FOOTER_TOTAL_BOLD_STYLE })
                  ) : (
                    <Table.TextCell />
                  )}
                </Table.BodyCell>
              ) : null}
              {isBaselineColumnVisible("jobToDate", columnVisibility) ? (
                <Table.BodyCell className={baselineCellClasses("jobToDate", columnVisibility)}>
                  {footerBudgetColumnsWithData.jtd ? (
                    currencyTotalCell(footerTotals.jtd, { style: FOOTER_TOTAL_BOLD_STYLE })
                  ) : (
                    <Table.TextCell />
                  )}
                </Table.BodyCell>
              ) : null}
              {isBaselineColumnVisible("startDate", columnVisibility) ? (
                <Table.BodyCell className={baselineCellClasses("startDate", columnVisibility)}>
                  <Table.TextCell />
                </Table.BodyCell>
              ) : null}
              {isBaselineColumnVisible("endDate", columnVisibility) ? (
                <Table.BodyCell className={baselineCellClasses("endDate", columnVisibility)}>
                  <Table.TextCell />
                </Table.BodyCell>
              ) : null}
              {isBaselineColumnVisible("curve", columnVisibility) ? (
                <Table.BodyCell className={baselineCellClasses("curve", columnVisibility)}>
                  <Table.TextCell />
                </Table.BodyCell>
              ) : null}
              {isBaselineColumnVisible("remaining", columnVisibility) ? (
                <Table.BodyCell className={baselineCellClasses("remaining", columnVisibility)}>
                  <Table.TextCell
                    style={{
                      textAlign: "right",
                      fontVariantNumeric: "tabular-nums",
                      ...FOOTER_TOTAL_BOLD_STYLE,
                    }}
                  >
                    {formatRemainingToForecastCurrency(footerTotals.remaining)}
                  </Table.TextCell>
                </Table.BodyCell>
              ) : null}
              {renderCriteriaColumnsInGrid
                ? criteriaColumns?.map((col) => (
                    <Table.BodyCell
                      key={`footer-crit-${col.criterionId}`}
                      className={CRITERIA_COLUMN_CLASS}
                      style={{ ...CRITERIA_COLUMN_BOX_STYLE, verticalAlign: "middle" }}
                    >
                      <Table.TextCell />
                    </Table.BodyCell>
                  )) ?? null
                : null}
              {showPrioritizationScoreColumn && criteriaDefsForScoreCount > 0 && renderCriteriaColumnsInGrid ? (
                <Table.BodyCell key="footer-prio-score" className={prioritizationScoreStickyColClass}>
                  <Table.TextCell />
                </Table.BodyCell>
              ) : null}
              {show.forecast
                ? footerTotals.forecast.map((v, idx) => (
                    <Table.BodyCell
                      key={`footer-forecast-${idx}`}
                      className="capital-planning-table-footer-forecast-cell"
                    >
                      {currencyTotalCell(v, { style: FOOTER_TOTAL_BOLD_STYLE })}
                    </Table.BodyCell>
                  ))
                : null}
            </Table.BodyRow>
          </tfoot>
        ) : null}
      </Table>
    </Table.Container>
    <ForecastManualCurveModal
      open={forecastManualCurveModalRowId !== null}
      rowId={forecastManualCurveModalRowId}
      onClose={closeForecastManualCurveModal}
      onConfirm={confirmForecastManualCurveUpdate}
    />
    <CurveChangeFromManualModal
      open={curveChangeFromManual !== null}
      rowId={curveChangeFromManual?.rowId ?? null}
      nextCurve={curveChangeFromManual?.nextCurve ?? "Linear"}
      onCancel={() => setCurveChangeFromManual(null)}
      onConfirm={handleCurveChangeFromManualConfirm}
    />
    <HighLevelBudgetItemsTearsheet
      open={highLevelBudgetItemsRow !== null}
      onClose={() => setHighLevelBudgetItemsRow(null)}
      onSave={(plannedAmountTotal) => {
        if (highLevelBudgetItemsRow) {
          onSaveHighLevelBudgetPlannedAmount(highLevelBudgetItemsRow.id, plannedAmountTotal);
        }
        setHighLevelBudgetItemsRow(null);
      }}
      row={highLevelBudgetTearsheetRow}
    />
    </>
  );
}

/** Alias for consumers that expect a “SmartGrid” name until the real package is wired. */
export { CapitalPlanningSmartGrid as SmartGrid };
