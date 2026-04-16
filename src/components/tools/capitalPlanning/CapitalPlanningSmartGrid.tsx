import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  DropdownFlyout,
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
import type { CapitalPlanningSampleRow, ProjectCurve, ProjectPriority, ProjectStatus } from "./capitalPlanningData";
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
    fyYearSectionExpanded: readonly boolean[];
    fqCollapsed: readonly boolean[];
    forecastLeafLabels: readonly string[];
  }
): { planned: number; original: number; revised: number; jtd: number; remaining: number; forecast: number[] } {
  const forecastLen = args.showForecast ? args.leafColumnCountForTable : 0;
  const forecastSums = forecastLen > 0 ? new Array(forecastLen).fill(0) : [];

  let planned = 0;
  let original = 0;
  let revised = 0;
  let jtd = 0;
  let remaining = 0;

  for (const row of rows) {
    planned += row.plannedAmount;
    original += row.originalBudget ?? 0;
    revised += row.revisedBudget ?? 0;
    jtd += row.jobToDateCosts ?? 0;

    const forecastBasisKey = `${row.curve}|${row.startDate}|${row.endDate}|${row.plannedAmount}|jtd:${row.jobToDateCosts ?? ""}`;
    remaining += getRemainingToForecast(
      getForecastAllocationBasisDollars(row),
      getTotalAllocatedForecastDollars(
        row,
        args.forecastOverrides,
        forecastBasisKey,
        args.anchorDate,
        args.forecastGranularity,
        args.forecastColumnsExpanded,
        args.forecastLeafLabels.length
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

    if (!args.forecastColumnsExpanded) {
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

  return { planned, original, revised, jtd, remaining, forecast: forecastSums };
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
  /** When true (non-Manual curve), inline edit opens a dialog instead of an input. */
  curveBlocksInlineForecastEdit?: boolean;
  onCurveBlocksInlineForecastEdit?: () => void;
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
    setFocused(false);
    setDraft("");
  }, [draft, setOverrides, storageKey]);

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
  setPrioritiesByRowId: React.Dispatch<React.SetStateAction<Record<string, ProjectPriority>>>;
  setRowDatesById: React.Dispatch<
    React.SetStateAction<Record<string, { startDate: string; endDate: string }>>
  >;
  setCurvesByRowId: React.Dispatch<React.SetStateAction<Record<string, ProjectCurve>>>;
  /** Forecast cost columns: period labels follow this granularity (month / quarter / year). */
  forecastGranularity: ForecastGranularity;
  /** Persist High Level Budget Items line total into Planned Amount for the row. */
  onSaveHighLevelBudgetPlannedAmount: (rowId: string, plannedAmount: number) => void;
  /** Table row grouping — `null` uses region grouping while the toolbar select shows placeholder. */
  groupBy?: CapitalPlanningGroupBy | null;
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
  setPrioritiesByRowId,
  setRowDatesById,
  setCurvesByRowId,
  forecastGranularity,
  onSaveHighLevelBudgetPlannedAmount,
  groupBy = null,
}: CapitalPlanningSmartGridProps) {
  const show = useMemo(() => columnVisibilityToGroupVisibility(columnVisibility), [columnVisibility]);
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

  const baselineVisibleColumnCount = 1 + countVisibleBaselineDataColumns(columnVisibility);
  const forecastLeafColumnsForTable = show.forecast ? leafColumnCountForTable : 0;
  const tableColumnCount = baselineVisibleColumnCount + forecastLeafColumnsForTable;

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

  const totalsAggregationArgs = useMemo(
    () => ({
      showForecast: show.forecast,
      leafColumnCountForTable,
      forecastOverrides,
      anchorDate,
      forecastGranularity,
      forecastColumnsExpanded,
      fyYearSectionExpanded,
      fqCollapsed,
      forecastLeafLabels,
    }),
    [
      show.forecast,
      leafColumnCountForTable,
      forecastOverrides,
      anchorDate,
      forecastGranularity,
      forecastColumnsExpanded,
      fyYearSectionExpanded,
      fqCollapsed,
      forecastLeafLabels,
    ]
  );

  const footerTotals = useMemo(() => {
    if (!configShowEmpty || filteredProjectRows.length === 0) {
      return {
        planned: 0,
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
                <span className="capital-planning-project-header-label">Project</span>
              </div>
            </Table.HeaderCell>
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
                    Planned Amount
                  </span>
                </Tooltip>
              </Table.HeaderCell>
            ) : null}
            {isBaselineColumnVisible("status", columnVisibility) ? (
              <Table.HeaderCell rowSpan={headerBaseRowSpan} className={baselineCellClasses("status", columnVisibility)}>
                Status
              </Table.HeaderCell>
            ) : null}
            {isBaselineColumnVisible("priority", columnVisibility) ? (
              <Table.HeaderCell rowSpan={headerBaseRowSpan} className={baselineCellClasses("priority", columnVisibility)}>
                Priority
              </Table.HeaderCell>
            ) : null}
            {isBaselineColumnVisible("originalBudget", columnVisibility) ? (
              <Table.HeaderCell rowSpan={headerBaseRowSpan} className={baselineCellClasses("originalBudget", columnVisibility)}>
                Original Budget
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
                    Revised Budget
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
                    Job to Date Costs
                  </span>
                </Tooltip>
              </Table.HeaderCell>
            ) : null}
            {isBaselineColumnVisible("startDate", columnVisibility) ? (
              <Table.HeaderCell rowSpan={headerBaseRowSpan} className={baselineCellClasses("startDate", columnVisibility)}>
                Start Date
              </Table.HeaderCell>
            ) : null}
            {isBaselineColumnVisible("endDate", columnVisibility) ? (
              <Table.HeaderCell rowSpan={headerBaseRowSpan} className={baselineCellClasses("endDate", columnVisibility)}>
                End Date
              </Table.HeaderCell>
            ) : null}
            {isBaselineColumnVisible("curve", columnVisibility) ? (
              <Table.HeaderCell rowSpan={headerBaseRowSpan} className={baselineCellClasses("curve", columnVisibility)}>
                Curve
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
                    Remaining
                  </span>
                </Tooltip>
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
                  {isBaselineColumnVisible("priority", columnVisibility) ? (
                    <Table.BodyCell className={baselineCellClasses("priority", columnVisibility)}>
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
              const forecastBasisKey = `${row.curve}|${row.startDate}|${row.endDate}|${row.plannedAmount}|jtd:${row.jobToDateCosts ?? ""}`;
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
              return (
              <Table.BodyRow key={row.id} className="capital-planning-table-status-group-child">
                <Table.BodyCell className={baselineCellClasses("project", columnVisibility)}>
                  <Table.LinkCell href={`/project/${row.projectId}`}>{row.project}</Table.LinkCell>
                </Table.BodyCell>
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
                {isBaselineColumnVisible("priority", columnVisibility) ? (
                <Table.BodyCell className={baselineCellClasses("priority", columnVisibility)} style={{ verticalAlign: "middle" }}>
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
                              curveBlocksInlineForecastEdit={row.curve !== "Manual"}
                              onCurveBlocksInlineForecastEdit={() => openForecastManualCurveModal(row.id)}
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
              {isBaselineColumnVisible("priority", columnVisibility) ? (
                <Table.BodyCell className={baselineCellClasses("priority", columnVisibility)}>
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
