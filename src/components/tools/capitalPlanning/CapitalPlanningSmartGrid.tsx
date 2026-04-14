import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  DropdownFlyout,
  Pill,
  Select,
  StyledDropdownFlyoutExpandIcon,
  StyledDropdownFlyoutLabel,
  Table,
  Typography,
} from "@procore/core-react";
import type { DropdownFlyoutOption } from "@procore/core-react";
import { CaretDown, CaretsIn, CaretsOut } from "@procore/core-icons";
import type { CapitalPlanningColumnGroupVisibility } from "./capitalPlanningColumnGroups";
import { baselineCellClasses, isBaselineColumnVisible } from "./capitalPlanningColumnGroups";
import type { CapitalPlanningSampleRow, ProjectCurve, ProjectPriority } from "./capitalPlanningData";
import {
  CURVE_OPTIONS,
  HIGH_LEVEL_BUDGET_ITEMS_SOURCE,
  isLumpSumPlannedAmountSource,
  LUMP_SUM_PLANNED_AMOUNT_SOURCE,
  PLANNED_AMOUNT_FLYOUT_CAPTION_VALUE,
  PLANNED_AMOUNT_SOURCE_OPTIONS,
  PRIORITY_OPTIONS,
  STATUS_PILL_COLOR,
  dateToIsoString,
  optionalIsoStringToDate,
} from "./capitalPlanningData";
import { HighLevelBudgetItemsTearsheet } from "./HighLevelBudgetItemsTearsheet";

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
  getEffectiveProgramForecastMonthAmounts,
  getProgramForecastFqLabels,
  getProgramForecastHeaderTitle,
  formatRemainingToForecastCurrency,
  getProgramForecastMonthLabels,
  getRemainingToForecast,
  getTotalAllocatedForecastDollars,
  isGlobalMonthIndexInFq1,
  isProgramForecastFq1PeriodEnded,
  programFiscalYearForGlobalMonthIndex,
  programForecastFyLabel,
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

const LUMP_SUM_USD_FORMAT = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatLumpSumUsdInput(n: number): string {
  return LUMP_SUM_USD_FORMAT.format(Number.isFinite(n) ? n : 0);
}

function renderPlannedAmountSourceOption(option: DropdownFlyoutOption): React.ReactNode {
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
  return (
    <>
      <StyledDropdownFlyoutLabel>{option.label}</StyledDropdownFlyoutLabel>
      {option.children && option.children.length > 0 ? (
        <StyledDropdownFlyoutExpandIcon data-qa="core-dropdown-flyout-option-expand-icon" />
      ) : null}
    </>
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
}: {
  rowId: string;
  parts: (string | number)[];
  /** Curve, dates, planned amount, and job-to-date — when these change, overrides stay tied to the prior basis. */
  forecastBasisKey: string;
  computedValue: number;
  overrides: Record<string, number>;
  setOverrides: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  ariaLabel: string;
  /** When true, show computed amount only (no overrides); used for closed FQ1 columns. */
  readOnly?: boolean;
}) {
  const storageKey = forecastOverrideStorageKey(rowId, parts, forecastBasisKey);
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState("");

  const resolved = readOnly ? computedValue : overrides[storageKey] ?? computedValue;

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

  const display = focused ? draft : formatLumpSumUsdInput(resolved);

  const handleFocus = useCallback(() => {
    setFocused(true);
    const n = overrides[storageKey] ?? computedValue;
    setDraft(Number.isFinite(n) && n === 0 ? "0" : numberToEditableDraft(n));
  }, [computedValue, overrides, storageKey]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    const trimmed = draft.trim();
    setOverrides((prev) => {
      const next = { ...prev };
      if (trimmed === "") {
        delete next[storageKey];
      } else {
        const p = moneyStringToNumber(trimmed);
        if (Number.isFinite(p)) next[storageKey] = Math.max(0, p);
        else delete next[storageKey];
      }
      return next;
    });
    setDraft("");
  }, [draft, setOverrides, storageKey]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDraft(filterMoneyDraftInput(e.currentTarget.value));
  }, []);

  return (
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
      aria-label={ariaLabel}
    />
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
}: {
  expanded: boolean;
  fyLabel: string;
  colSpan?: number;
  onToggle: () => void;
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
}: {
  label: string;
  onToggle: () => void;
  colSpan?: number;
  expanded: boolean;
  toggleAriaLabel: string;
  /** 132px leaf header (rolled-up FQ / FY-collapsed summary columns). */
  fqMonthWidthHeader?: boolean;
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
      </div>
    </Table.HeaderCell>
  );
}

export interface CapitalPlanningSmartGridProps {
  columnGroupVisibility: CapitalPlanningColumnGroupVisibility;
  configShowEmpty: boolean;
  search: string;
  filteredProjectRows: CapitalPlanningSampleRow[];
  plannedAmountSourceByRowId: Record<string, string>;
  setPlannedAmountSourceByRowId: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  plannedAmountManualByRowId: Record<string, number>;
  setPlannedAmountManualByRowId: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  setPrioritiesByRowId: React.Dispatch<React.SetStateAction<Record<string, ProjectPriority>>>;
  setRowDatesById: React.Dispatch<
    React.SetStateAction<Record<string, { startDate: string; endDate: string }>>
  >;
  setCurvesByRowId: React.Dispatch<React.SetStateAction<Record<string, ProjectCurve>>>;
  /** Forecast cost columns: period labels follow this granularity (month / quarter / year). */
  forecastGranularity: ForecastGranularity;
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
  columnGroupVisibility,
  configShowEmpty,
  search,
  filteredProjectRows,
  plannedAmountSourceByRowId,
  setPlannedAmountSourceByRowId,
  plannedAmountManualByRowId,
  setPlannedAmountManualByRowId,
  setPrioritiesByRowId,
  setRowDatesById,
  setCurvesByRowId,
  forecastGranularity,
}: CapitalPlanningSmartGridProps) {
  const show = columnGroupVisibility;
  const [highLevelBudgetItemsRow, setHighLevelBudgetItemsRow] = useState<CapitalPlanningSampleRow | null>(null);
  const [forecastColumnsExpanded, setForecastColumnsExpanded] = useState(true);
  /** Per FQ (across all program FYs): collapsed → rollup column; expanded → three month columns. */
  const [fqCollapsed, setFqCollapsed] = useState<boolean[]>(getDefaultForecastFqCollapsed);
  /** Per program FY: when false, that year collapses to a single forecast column (not the whole grid). */
  const [fyYearSectionExpanded, setFyYearSectionExpanded] = useState<boolean[]>(
    getDefaultFyYearSectionExpanded
  );
  const [forecastOverrides, setForecastOverrides] = useState<Record<string, number>>({});

  const anchorDate = useMemo(() => new Date(), []);
  const forecastFqLabels = useMemo(
    () => (forecastGranularity === "quarter" ? getProgramForecastFqLabels() : []),
    [forecastGranularity]
  );
  const forecastLeafLabels = useMemo(() => {
    if (forecastGranularity === "quarter") {
      return getProgramForecastMonthLabels();
    }
    return getForecastColumnLabels(forecastGranularity, anchorDate);
  }, [forecastGranularity, anchorDate]);

  useEffect(() => {
    if (forecastGranularity === "quarter") {
      setFqCollapsed(getDefaultForecastFqCollapsed());
      setFyYearSectionExpanded(getDefaultFyYearSectionExpanded());
    }
  }, [forecastGranularity]);

  const quarterExpandedLeafColumns = useMemo(
    () =>
      CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.reduce((sum, _, fyIndex) => {
        if (!fyYearSectionExpanded[fyIndex]) return sum + 1;
        return sum + quarterLeafColumnsForFy(fyIndex, fqCollapsed);
      }, 0),
    [fyYearSectionExpanded, fqCollapsed]
  );

  const leafColumnCountForTable = useMemo(() => {
    if (!forecastColumnsExpanded) {
      if (forecastGranularity === "quarter") return 1;
      return forecastLeafLabels.length;
    }
    if (forecastGranularity === "quarter") return quarterExpandedLeafColumns;
    return forecastLeafLabels.length;
  }, [
    forecastColumnsExpanded,
    forecastGranularity,
    quarterExpandedLeafColumns,
    forecastLeafLabels.length,
  ]);

  const baselineVisibleColumnCount =
    1 +
    (show.planning ? 3 : 0) +
    (show.budget ? 3 : 0) +
    (show.schedule ? 4 : 0);
  const forecastLeafColumnsForTable = show.forecast ? leafColumnCountForTable : 0;
  const tableColumnCount = baselineVisibleColumnCount + forecastLeafColumnsForTable;
  const forecastMasterHeaderLabel = useMemo(() => {
    if (forecastGranularity === "quarter") return "";
    if (forecastGranularity === "year") return "Forecast (calendar years)";
    return "Forecast (months)";
  }, [forecastGranularity]);
  /**
   * Quarter forecast: optional master row (when collapsed), FY band row, FQ row, month row.
   * When expanded, the merged “FY 2026 – FY 2031” title row is omitted; each FY band toggles only that year.
   */
  const quarterThreeRowForecastHeader = forecastGranularity === "quarter";
  /** Must match the number of `<Table.HeaderRow>` rows under the forecast so month/FQ cells align after the baseline columns. */
  const headerBaseRowSpan = useMemo(() => {
    if (!show.forecast) return 1;
    if (!quarterThreeRowForecastHeader) return 2;
    if (forecastGranularity === "quarter" && forecastColumnsExpanded) return 4;
    return 3;
  }, [show.forecast, quarterThreeRowForecastHeader, forecastGranularity, forecastColumnsExpanded]);

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

  const footerTotals = useMemo(() => {
    const empty = () => ({
      planned: 0,
      original: 0,
      revised: 0,
      jtd: 0,
      remaining: 0,
      forecast: [] as number[],
    });

    if (!configShowEmpty || filteredProjectRows.length === 0) {
      return empty();
    }

    const forecastLen = show.forecast ? leafColumnCountForTable : 0;
    const forecastSums = forecastLen > 0 ? new Array(forecastLen).fill(0) : [];

    let planned = 0;
    let original = 0;
    let revised = 0;
    let jtd = 0;
    let remaining = 0;

    for (const row of filteredProjectRows) {
      planned += row.plannedAmount;
      original += row.originalBudget ?? 0;
      revised += row.revisedBudget ?? 0;
      jtd += row.jobToDateCosts ?? 0;

      const forecastBasisKey = `${row.curve}|${row.startDate}|${row.endDate}|${row.plannedAmount}|jtd:${row.jobToDateCosts ?? ""}`;
      remaining += getRemainingToForecast(
        getForecastAllocationBasisDollars(row),
        getTotalAllocatedForecastDollars(
          row,
          forecastOverrides,
          forecastBasisKey,
          anchorDate,
          forecastGranularity,
          forecastColumnsExpanded,
          forecastLeafLabels.length
        )
      );

      if (!show.forecast || forecastLen === 0) {
        continue;
      }

      const effectiveMonthAmounts = getEffectiveProgramForecastMonthAmounts(
        row,
        forecastOverrides,
        forecastBasisKey,
        anchorDate
      );

      let ci = 0;

      if (!forecastColumnsExpanded) {
        if (forecastGranularity === "quarter") {
          const comp = effectiveMonthAmounts.reduce((a, b) => a + b, 0);
          forecastSums[ci] += resolvedForecastCellDollars(
            false,
            row.id,
            ["q", "fy"],
            forecastBasisKey,
            comp,
            forecastOverrides
          );
        } else {
          for (let i = 0; i < forecastLeafLabels.length; i++) {
            const comp = getForecastLeafDollarAmount(row, i, forecastGranularity, anchorDate);
            forecastSums[ci] += resolvedForecastCellDollars(
              false,
              row.id,
              ["x", forecastGranularity, "c", i],
              forecastBasisKey,
              comp,
              forecastOverrides
            );
            ci++;
          }
        }
        continue;
      }

      if (forecastGranularity === "quarter") {
        for (let fyIndex = 0; fyIndex < CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.length; fyIndex++) {
          const fyYear = CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS[fyIndex];
          if (!fyYearSectionExpanded[fyIndex]) {
            const comp = effectiveMonthAmounts
              .slice(fyIndex * 12, fyIndex * 12 + 12)
              .reduce((a, b) => a + b, 0);
            forecastSums[ci] += resolvedForecastCellDollars(
              false,
              row.id,
              ["q", "y", fyIndex],
              forecastBasisKey,
              comp,
              forecastOverrides
            );
            ci++;
            continue;
          }
          for (let fqInFy = 0; fqInFy < 4; fqInFy++) {
            const fqIndex = fyIndex * 4 + fqInFy;
            const fq1ReadOnly =
              fqInFy === 0 && isProgramForecastFq1PeriodEnded(fyYear, anchorDate);
            if (fqCollapsed[fqIndex]) {
              const comp = sumQuarterMonthAmounts(effectiveMonthAmounts, fqIndex);
              forecastSums[ci] += resolvedForecastCellDollars(
                fq1ReadOnly,
                row.id,
                ["q", "r", fqIndex],
                forecastBasisKey,
                comp,
                forecastOverrides
              );
              ci++;
            } else {
              for (let k = 0; k < 3; k++) {
                const monthIdx = fqIndex * 3 + k;
                const fyForMonth = programFiscalYearForGlobalMonthIndex(monthIdx);
                const monthFq1ReadOnly =
                  isGlobalMonthIndexInFq1(monthIdx) &&
                  fyForMonth !== undefined &&
                  isProgramForecastFq1PeriodEnded(fyForMonth, anchorDate);
                const comp = effectiveMonthAmounts[monthIdx] ?? 0;
                forecastSums[ci] += resolvedForecastCellDollars(
                  monthFq1ReadOnly,
                  row.id,
                  ["q", "m", monthIdx],
                  forecastBasisKey,
                  comp,
                  forecastOverrides
                );
                ci++;
              }
            }
          }
        }
      } else {
        for (let i = 0; i < forecastLeafLabels.length; i++) {
          const comp = getForecastLeafDollarAmount(row, i, forecastGranularity, anchorDate);
          forecastSums[ci] += resolvedForecastCellDollars(
            false,
            row.id,
            ["x", forecastGranularity, "e", i],
            forecastBasisKey,
            comp,
            forecastOverrides
          );
          ci++;
        }
      }
    }

    return { planned, original, revised, jtd, remaining, forecast: forecastSums };
  }, [
    configShowEmpty,
    filteredProjectRows,
    show.forecast,
    leafColumnCountForTable,
    forecastOverrides,
    anchorDate,
    forecastGranularity,
    forecastColumnsExpanded,
    fyYearSectionExpanded,
    fqCollapsed,
    forecastLeafLabels,
  ]);

  /** Footer: only show currency totals when at least one visible row has that metric (no placeholder dash). */
  const footerBudgetColumnsWithData = useMemo(() => {
    if (!configShowEmpty || filteredProjectRows.length === 0) {
      return { original: false, revised: false, jtd: false };
    }
    return {
      original: filteredProjectRows.some((r) => r.originalBudget != null),
      revised: filteredProjectRows.some((r) => r.revisedBudget != null),
      jtd: filteredProjectRows.some((r) => r.jobToDateCosts != null),
    };
  }, [configShowEmpty, filteredProjectRows]);

  const showFooterRow = configShowEmpty && filteredProjectRows.length > 0;

  return (
    <>
    <Table.Container className="capital-planning-table-scroll">
      <Table>
        <Table.Header>
          <Table.HeaderRow>
            <Table.HeaderCell rowSpan={headerBaseRowSpan} className={baselineCellClasses("project", show)}>
              Project
            </Table.HeaderCell>
            {isBaselineColumnVisible("plannedAmount", show) ? (
              <Table.HeaderCell rowSpan={headerBaseRowSpan} className={baselineCellClasses("plannedAmount", show)}>
                Planned Amount
              </Table.HeaderCell>
            ) : null}
            {isBaselineColumnVisible("status", show) ? (
              <Table.HeaderCell rowSpan={headerBaseRowSpan} className={baselineCellClasses("status", show)}>
                Status
              </Table.HeaderCell>
            ) : null}
            {isBaselineColumnVisible("priority", show) ? (
              <Table.HeaderCell rowSpan={headerBaseRowSpan} className={baselineCellClasses("priority", show)}>
                Priority
              </Table.HeaderCell>
            ) : null}
            {isBaselineColumnVisible("originalBudget", show) ? (
              <Table.HeaderCell rowSpan={headerBaseRowSpan} className={baselineCellClasses("originalBudget", show)}>
                Original Budget
              </Table.HeaderCell>
            ) : null}
            {isBaselineColumnVisible("revisedBudget", show) ? (
              <Table.HeaderCell rowSpan={headerBaseRowSpan} className={baselineCellClasses("revisedBudget", show)}>
                Revised Budget
              </Table.HeaderCell>
            ) : null}
            {isBaselineColumnVisible("jobToDate", show) ? (
              <Table.HeaderCell rowSpan={headerBaseRowSpan} className={baselineCellClasses("jobToDate", show)}>
                Job to Date Costs
              </Table.HeaderCell>
            ) : null}
            {isBaselineColumnVisible("startDate", show) ? (
              <Table.HeaderCell rowSpan={headerBaseRowSpan} className={baselineCellClasses("startDate", show)}>
                Start Date
              </Table.HeaderCell>
            ) : null}
            {isBaselineColumnVisible("endDate", show) ? (
              <Table.HeaderCell rowSpan={headerBaseRowSpan} className={baselineCellClasses("endDate", show)}>
                End Date
              </Table.HeaderCell>
            ) : null}
            {isBaselineColumnVisible("curve", show) ? (
              <Table.HeaderCell rowSpan={headerBaseRowSpan} className={baselineCellClasses("curve", show)}>
                Curve
              </Table.HeaderCell>
            ) : null}
            {isBaselineColumnVisible("remaining", show) ? (
              <Table.HeaderCell rowSpan={headerBaseRowSpan} className={baselineCellClasses("remaining", show)}>
                Remaining
              </Table.HeaderCell>
            ) : null}
            {show.forecast && !(forecastGranularity === "quarter" && forecastColumnsExpanded) ? (
              <ForecastFyGroupHeaderCell
                expanded={forecastColumnsExpanded}
                fyLabel={forecastMasterHeaderLabel}
                colSpan={forecastColumnsExpanded ? leafColumnCountForTable : 1}
                onToggle={handleForecastBlockToggle}
              />
            ) : null}
          </Table.HeaderRow>
          {show.forecast && forecastGranularity === "quarter" && forecastColumnsExpanded ? (
            <Table.HeaderRow>
              {CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.map((fyYear, fyIndex) => (
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
                        fyYearSectionExpanded[fyIndex] ? (
                          <CaretsIn size="sm" />
                        ) : (
                          <CaretsOut size="sm" />
                        )
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setFyYearSectionExpanded((prev) => {
                          const next = [...prev];
                          next[fyIndex] = !next[fyIndex];
                          return next;
                        });
                      }}
                      aria-expanded={fyYearSectionExpanded[fyIndex]}
                      aria-label={
                        fyYearSectionExpanded[fyIndex]
                          ? `Collapse ${programForecastFyLabel(fyYear)} forecast columns`
                          : `Expand ${programForecastFyLabel(fyYear)} forecast columns`
                      }
                    />
                  </div>
                </Table.HeaderCell>
              ))}
            </Table.HeaderRow>
          ) : null}
          {show.forecast ? (
          <Table.HeaderRow>
            {forecastColumnsExpanded ? (
              forecastGranularity === "quarter" ? (
                CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.flatMap((fyYear, fyIndex) => {
                  if (!fyYearSectionExpanded[fyIndex]) {
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
                    return (
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
              {forecastColumnsExpanded ? (
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
            filteredProjectRows.map((row) => {
              const forecastBasisKey = `${row.curve}|${row.startDate}|${row.endDate}|${row.plannedAmount}|jtd:${row.jobToDateCosts ?? ""}`;
              const effectiveMonthAmounts = getEffectiveProgramForecastMonthAmounts(
                row,
                forecastOverrides,
                forecastBasisKey,
                anchorDate
              );
              const plannedSource = plannedAmountSourceByRowId[row.id];
              const isLumpSumPlannedAmount = isLumpSumPlannedAmountSource(plannedSource);
              return (
              <Table.BodyRow key={row.id}>
                <Table.BodyCell className={baselineCellClasses("project", show)}>
                  <Table.LinkCell href={`/project/${row.projectId}`}>{row.project}</Table.LinkCell>
                </Table.BodyCell>
                {isBaselineColumnVisible("plannedAmount", show) ? (
                <Table.BodyCell
                  className={baselineCellClasses("plannedAmount", show)}
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
                      options={PLANNED_AMOUNT_SOURCE_OPTIONS}
                      optionRenderer={renderPlannedAmountSourceOption}
                      onClick={(option: DropdownFlyoutOption) => {
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
                      ) : (
                        <Table.CurrencyCell value={row.plannedAmount} />
                      )}
                    </div>
                  </div>
                </Table.BodyCell>
                ) : null}
                {isBaselineColumnVisible("status", show) ? (
                <Table.BodyCell className={baselineCellClasses("status", show)}>
                  <Pill color={STATUS_PILL_COLOR[row.status]}>{row.status}</Pill>
                </Table.BodyCell>
                ) : null}
                {isBaselineColumnVisible("priority", show) ? (
                <Table.BodyCell className={baselineCellClasses("priority", show)} style={{ verticalAlign: "middle" }}>
                  <Table.SelectCell
                    block
                    label={row.priority}
                    aria-label={`Priority For ${row.project}`}
                    onSelect={(s) => {
                      if (s.action !== "selected") return;
                      const next = s.item as ProjectPriority;
                      setPrioritiesByRowId((prev) => ({ ...prev, [row.id]: next }));
                    }}
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <Select.Option key={p} value={p} selected={row.priority === p}>
                        {p}
                      </Select.Option>
                    ))}
                  </Table.SelectCell>
                </Table.BodyCell>
                ) : null}
                {isBaselineColumnVisible("originalBudget", show) ? (
                <Table.BodyCell className={baselineCellClasses("originalBudget", show)}>
                  {budgetMetricCurrencyCell(row.originalBudget)}
                </Table.BodyCell>
                ) : null}
                {isBaselineColumnVisible("revisedBudget", show) ? (
                <Table.BodyCell className={baselineCellClasses("revisedBudget", show)}>
                  {budgetMetricCurrencyCell(row.revisedBudget)}
                </Table.BodyCell>
                ) : null}
                {isBaselineColumnVisible("jobToDate", show) ? (
                <Table.BodyCell className={baselineCellClasses("jobToDate", show)}>
                  {budgetMetricCurrencyCell(row.jobToDateCosts)}
                </Table.BodyCell>
                ) : null}
                {isBaselineColumnVisible("startDate", show) ? (
                <Table.BodyCell className={baselineCellClasses("startDate", show)} style={{ verticalAlign: "middle" }}>
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
                {isBaselineColumnVisible("endDate", show) ? (
                <Table.BodyCell className={baselineCellClasses("endDate", show)} style={{ verticalAlign: "middle" }}>
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
                {isBaselineColumnVisible("curve", show) ? (
                <Table.BodyCell className={baselineCellClasses("curve", show)} style={{ verticalAlign: "middle" }}>
                  <Table.SelectCell
                    block
                    label={row.curve}
                    aria-label={`Curve For ${row.project}`}
                    onSelect={(s) => {
                      if (s.action !== "selected") return;
                      const next = s.item as ProjectCurve;
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
                {isBaselineColumnVisible("remaining", show) ? (
                <Table.BodyCell className={baselineCellClasses("remaining", show)}>
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
                          forecastLeafLabels.length
                        )
                      )
                    )}
                  </Table.TextCell>
                </Table.BodyCell>
                ) : null}
                {show.forecast ? (
                  forecastColumnsExpanded ? (
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
                        ariaLabel={`Forecast ${label} for ${row.project}`}
                      />
                    </Table.BodyCell>
                  ))
                )
                ) : null}
              </Table.BodyRow>
              );
            })
          )}
        </Table.Body>
        {showFooterRow ? (
          <tfoot className="capital-planning-table-sticky-footer">
            <Table.BodyRow>
              <Table.BodyCell className={baselineCellClasses("project", show)}>
                <Table.TextCell>
                  <Typography intent="small" weight="semibold">
                    Total
                  </Typography>
                </Table.TextCell>
              </Table.BodyCell>
              {isBaselineColumnVisible("plannedAmount", show) ? (
                <Table.BodyCell className={baselineCellClasses("plannedAmount", show)}>
                  <Table.CurrencyCell
                    value={footerTotals.planned}
                    style={FOOTER_TOTAL_BOLD_STYLE}
                  />
                </Table.BodyCell>
              ) : null}
              {isBaselineColumnVisible("status", show) ? (
                <Table.BodyCell className={baselineCellClasses("status", show)}>
                  <Table.TextCell />
                </Table.BodyCell>
              ) : null}
              {isBaselineColumnVisible("priority", show) ? (
                <Table.BodyCell className={baselineCellClasses("priority", show)}>
                  <Table.TextCell />
                </Table.BodyCell>
              ) : null}
              {isBaselineColumnVisible("originalBudget", show) ? (
                <Table.BodyCell className={baselineCellClasses("originalBudget", show)}>
                  {footerBudgetColumnsWithData.original ? (
                    <Table.CurrencyCell
                      value={footerTotals.original}
                      style={FOOTER_TOTAL_BOLD_STYLE}
                    />
                  ) : (
                    <Table.TextCell />
                  )}
                </Table.BodyCell>
              ) : null}
              {isBaselineColumnVisible("revisedBudget", show) ? (
                <Table.BodyCell className={baselineCellClasses("revisedBudget", show)}>
                  {footerBudgetColumnsWithData.revised ? (
                    <Table.CurrencyCell
                      value={footerTotals.revised}
                      style={FOOTER_TOTAL_BOLD_STYLE}
                    />
                  ) : (
                    <Table.TextCell />
                  )}
                </Table.BodyCell>
              ) : null}
              {isBaselineColumnVisible("jobToDate", show) ? (
                <Table.BodyCell className={baselineCellClasses("jobToDate", show)}>
                  {footerBudgetColumnsWithData.jtd ? (
                    <Table.CurrencyCell
                      value={footerTotals.jtd}
                      style={FOOTER_TOTAL_BOLD_STYLE}
                    />
                  ) : (
                    <Table.TextCell />
                  )}
                </Table.BodyCell>
              ) : null}
              {isBaselineColumnVisible("startDate", show) ? (
                <Table.BodyCell className={baselineCellClasses("startDate", show)}>
                  <Table.TextCell />
                </Table.BodyCell>
              ) : null}
              {isBaselineColumnVisible("endDate", show) ? (
                <Table.BodyCell className={baselineCellClasses("endDate", show)}>
                  <Table.TextCell />
                </Table.BodyCell>
              ) : null}
              {isBaselineColumnVisible("curve", show) ? (
                <Table.BodyCell className={baselineCellClasses("curve", show)}>
                  <Table.TextCell />
                </Table.BodyCell>
              ) : null}
              {isBaselineColumnVisible("remaining", show) ? (
                <Table.BodyCell className={baselineCellClasses("remaining", show)}>
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
              {show.forecast
                ? footerTotals.forecast.map((v, idx) => (
                    <Table.BodyCell
                      key={`footer-forecast-${idx}`}
                      className="capital-planning-table-footer-forecast-cell"
                    >
                      <Table.CurrencyCell value={v} style={FOOTER_TOTAL_BOLD_STYLE} />
                    </Table.BodyCell>
                  ))
                : null}
            </Table.BodyRow>
          </tfoot>
        ) : null}
      </Table>
    </Table.Container>
    <HighLevelBudgetItemsTearsheet
      open={highLevelBudgetItemsRow !== null}
      onClose={() => setHighLevelBudgetItemsRow(null)}
      row={highLevelBudgetItemsRow}
    />
    </>
  );
}

/** Alias for consumers that expect a “SmartGrid” name until the real package is wired. */
export { CapitalPlanningSmartGrid as SmartGrid };
