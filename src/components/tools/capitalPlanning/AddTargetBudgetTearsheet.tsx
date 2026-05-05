import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Breadcrumbs,
  Box,
  Button,
  Card,
  CurrencyInput,
  EmptyState,
  Page,
  Select,
  Table,
  Tearsheet,
  TieredSelect,
  Tooltip,
  Typography,
} from "@procore/core-react";
import { CaretDown, CaretRight, Help, Plus, Trash } from "@procore/core-icons";
import { createGlobalStyle } from "styled-components";
import type { LocationHierarchyRegionNode } from "./capitalPlanningRowGrouping";
import {
  buildTargetBudgetTearsheetPeriodOptions,
  columnMetaToTearsheetPeriodKey,
  readTargetBudgetOverrideForCell,
  resolveTearsheetPeriodPickToColumnIndex,
  tearsheetPeriodKeyToPick,
  type TargetBudgetColumnMeta,
  TARGET_BUDGET_DISTRIBUTION_CURVES,
  type TargetBudgetDistributionCurve,
} from "./targetBudgetForecastColumnMeta";
import {
  buildProjectGroupTierOptionsFromLocationTree,
  tierValuePathForCollapseKey,
  type TargetBudgetProjectGroupTierOption,
} from "./targetBudgetProjectGroupTierOptions";
import { computeAvailableBudgetFromParent } from "./targetBudgetParentBudgetLimits";

const AddTargetBudgetTearsheetWidth = createGlobalStyle`
  [class*="StyledTearsheetBody"]:has(> .add-target-budget-tearsheet-root) {
    flex: 0 0 min(808px, 92vw) !important;
  }
`;

const CARD_STYLE: React.CSSProperties = {
  padding: 24,
  background: "var(--color-surface-primary)",
};

const FIELD_GRID: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "20px 24px",
  alignItems: "start",
};

const TARGET_BUDGET_CURVES_ROW: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
  gap: "20px 24px",
  alignItems: "start",
};

const LUMP_SUM_USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatUsd(n: number): string {
  return LUMP_SUM_USD.format(Number.isFinite(n) ? n : 0);
}

function moneyStringToNumber(s: string): number {
  const cleaned = s.replace(/,/g, "").replace(/[^0-9.]/g, "");
  if (cleaned === "" || cleaned === ".") return 0;
  const x = parseFloat(cleaned);
  return Number.isNaN(x) ? 0 : Math.max(0, x);
}

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

function numberToEditableDraft(n: number | undefined): string {
  if (n === undefined || !Number.isFinite(n) || n === 0) return "";
  const rounded = Math.round(n * 100) / 100;
  return rounded % 1 === 0 ? String(Math.trunc(rounded)) : String(rounded);
}

function InlineCurrencyDraftInput({
  value,
  onChange,
  ariaLabel,
}: {
  value: number | undefined;
  onChange: (n: number | undefined) => void;
  ariaLabel: string;
}) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState("");

  const displayValue = focused
    ? draft
    : value !== undefined && value > 0
      ? formatUsd(value)
      : "";

  return (
    <Table.InputCell
      className="add-target-budget-inline-input"
      size="block"
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={displayValue}
      onFocus={() => {
        setFocused(true);
        setDraft(numberToEditableDraft(value));
      }}
      onBlur={() => {
        setFocused(false);
        const normalized = filterMoneyDraftInput(draft).trim();
        if (normalized === "") {
          onChange(undefined);
        } else {
          onChange(moneyStringToNumber(normalized));
        }
        setDraft("");
      }}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        const nextDraft = filterMoneyDraftInput(e.currentTarget.value);
        setDraft(nextDraft);
      }}
      aria-label={ariaLabel}
    />
  );
}

/** @deprecated Use {@link TARGET_BUDGET_DISTRIBUTION_CURVES} from `targetBudgetForecastColumnMeta`. */
export const TARGET_BUDGET_CURVE_OPTIONS = TARGET_BUDGET_DISTRIBUTION_CURVES;

const TARGET_BUDGET_AMOUNT_TOOLTIP =
  "Set the maximum spending limit for the selected project grouping and timeframe.";

const FUNDING_SOURCE_OPTIONS: Array<{ label: string; availableFunding: number }> = [
  { label: "2027 State Bond", availableFunding: 20_000_000 },
  { label: "State Infrastructure Grant", availableFunding: 30_000_000 },
  { label: "Federal Infrastructure Grant", availableFunding: 15_000_000 },
  { label: "Municipal Bond", availableFunding: 10_000_000 },
  { label: "Capital Reserve", availableFunding: 8_000_000 },
];

function FieldLabelWithHelp({
  label,
  tooltipText,
  tooltipAriaLabel,
}: {
  label: string;
  tooltipText: string;
  tooltipAriaLabel: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
      <Typography intent="small" weight="semibold" as="span">
        {label}
      </Typography>
      <Tooltip
        trigger="hover"
        placement="top"
        overlay={
          <Tooltip.Content>
            <div
              style={{
                maxWidth: 280,
                lineHeight: 1.45,
                whiteSpace: "normal",
                overflowWrap: "anywhere",
                wordBreak: "break-word",
              }}
            >
              {tooltipText}
            </div>
          </Tooltip.Content>
        }
      >
        <span
          style={{
            display: "inline-flex",
            color: "var(--color-icon-primary)",
            cursor: "help",
            verticalAlign: "middle",
          }}
          aria-label={tooltipAriaLabel}
        >
          <Help size="sm" aria-hidden />
        </span>
      </Tooltip>
    </div>
  );
}

export type AddTargetBudgetSavePayload = {
  hierarchyCollapseKey: string;
  columnIndex: number;
  /** Stable period id (`fy-2`, `fq-8`, …) — matches grid columns regardless of FY/FQ expand state. */
  periodKey: string;
  amount: number;
  /** How to spread the target across quarters / months. */
  curve: TargetBudgetDistributionCurve;
};

export type AddTargetBudgetTearsheetProps = {
  open: boolean;
  onClose: () => void;
  /** Region → Campus → Building tree — drives {@link TieredSelect} options. */
  locationHierarchyTree: readonly LocationHierarchyRegionNode[];
  columnMetas: readonly TargetBudgetColumnMeta[];
  /** `LocationHierarchyAggregateFlattenItem.collapseKey` for the row that was clicked. */
  initialHierarchyCollapseKey: string;
  initialColumnIndex: number;
  initialAmount: number;
  /** When true, open with no preselected project group / fiscal year / amount. */
  startBlank?: boolean;
  /** Program fiscal year start month (Settings) — maps month/quarter picks to grid columns. */
  fiscalYearStartMonth: number;
  forecastFqLabels?: readonly string[];
  forecastMonthLabels?: readonly string[];
  /** Saved target amounts — used to enforce caps from parent tier budgets for the same period. */
  targetBudgetForecastOverrides?: Record<string, number>;
  onSave: (payload: AddTargetBudgetSavePayload) => void;
};

export function AddTargetBudgetTearsheet({
  open,
  onClose,
  locationHierarchyTree,
  columnMetas,
  initialHierarchyCollapseKey,
  initialColumnIndex,
  initialAmount,
  startBlank = false,
  fiscalYearStartMonth,
  forecastFqLabels,
  forecastMonthLabels,
  targetBudgetForecastOverrides = {},
  onSave,
}: AddTargetBudgetTearsheetProps) {
  const [projectGroupCollapseKey, setProjectGroupCollapseKey] = useState(initialHierarchyCollapseKey);
  const [selectedPeriodKey, setSelectedPeriodKey] = useState("");
  const [amountDraft, setAmountDraft] = useState("");
  const [tearsheetStep, setTearsheetStep] = useState<"target_budget" | "funding_sources">("target_budget");
  const [allocationHierarchyCollapsed, setAllocationHierarchyCollapsed] = useState<Record<string, boolean>>({});
  const [allocationBudgetsByKey, setAllocationBudgetsByKey] = useState<Record<string, number>>({});
  const [activeFundingRowKey, setActiveFundingRowKey] = useState<string | null>(null);
  const [savedFundingSourcesByRowKey, setSavedFundingSourcesByRowKey] = useState<
    Record<string, Array<{ id: string; source: string; availableFunding: number; reservedFunding: number }>>
  >({});
  const [fundingTargetBudgetAmount, setFundingTargetBudgetAmount] = useState(0);
  const [fundingSourceRows, setFundingSourceRows] = useState<
    Array<{ id: string; source: string; availableFunding: number; reservedFunding: number }>
  >([]);
  const [fundingSourceRowsBaseline, setFundingSourceRowsBaseline] = useState<
    Array<{ id: string; source: string; availableFunding: number; reservedFunding: number }>
  >([]);

  const periodCatalog = useMemo(
    () =>
      buildTargetBudgetTearsheetPeriodOptions({
        granularity: "fiscal_year",
        fiscalYearStartMonth,
        forecastFqLabels,
        forecastMonthLabels,
      }),
    [fiscalYearStartMonth, forecastFqLabels, forecastMonthLabels]
  );

  const resolvedColumnIndex = useMemo(() => {
    if (!selectedPeriodKey) return -1;
    const pick = tearsheetPeriodKeyToPick("fiscal_year", selectedPeriodKey);
    return resolveTearsheetPeriodPickToColumnIndex(columnMetas, pick, fiscalYearStartMonth);
  }, [columnMetas, selectedPeriodKey, fiscalYearStartMonth]);

  useEffect(() => {
    if (!open) return;
    if (startBlank) {
      setProjectGroupCollapseKey("");
      setSelectedPeriodKey("");
      setAmountDraft("");
      setTearsheetStep("target_budget");
      setAllocationHierarchyCollapsed({});
      setAllocationBudgetsByKey({});
      setActiveFundingRowKey(null);
      setSavedFundingSourcesByRowKey({});
      setFundingTargetBudgetAmount(0);
      setFundingSourceRows([]);
      setFundingSourceRowsBaseline([]);
      return;
    }
    const meta =
      columnMetas.find((m) => m.columnIndex === initialColumnIndex) ?? columnMetas[0] ?? null;
    if (!meta) return;
    setProjectGroupCollapseKey(initialHierarchyCollapseKey);
    const initialPeriodKey =
      meta.granularity === "fiscal_year" ? columnMetaToTearsheetPeriodKey(meta) : "fy-0";
    setSelectedPeriodKey(initialPeriodKey);
    setAmountDraft(initialAmount > 0 ? formatUsd(initialAmount).replace(/^\$/, "") : "");
    setTearsheetStep("target_budget");
    setAllocationHierarchyCollapsed({});
    setAllocationBudgetsByKey({});
    setActiveFundingRowKey(null);
    setSavedFundingSourcesByRowKey({});
    setFundingTargetBudgetAmount(0);
    setFundingSourceRows([]);
    setFundingSourceRowsBaseline([]);
  }, [open, startBlank, initialHierarchyCollapseKey, initialColumnIndex, initialAmount, columnMetas]);

  useEffect(() => {
    if (!selectedPeriodKey || !periodCatalog.some((o) => o.periodKey === selectedPeriodKey)) {
      if (!selectedPeriodKey) return;
      const first = periodCatalog[0]?.periodKey;
      if (first !== undefined) setSelectedPeriodKey(first);
    }
  }, [periodCatalog, selectedPeriodKey]);

  const projectGroupTierOptions = useMemo(
    () => buildProjectGroupTierOptionsFromLocationTree(locationHierarchyTree),
    [locationHierarchyTree]
  );

  const selectedProjectGroupTierValue = useMemo(
    () => tierValuePathForCollapseKey(projectGroupCollapseKey, projectGroupTierOptions),
    [projectGroupCollapseKey, projectGroupTierOptions]
  );
  const selectedProjectGroupLabel = useMemo(() => {
    if (!projectGroupCollapseKey) return "Project Group";
    if (projectGroupCollapseKey.startsWith("r:")) {
      const region = locationHierarchyTree.find((r) => `r:${r.key}` === projectGroupCollapseKey);
      return region?.label ?? "Project Group";
    }
    if (projectGroupCollapseKey.startsWith("c:")) {
      for (const region of locationHierarchyTree) {
        const campus = region.campuses.find((c) => `c:${c.key}` === projectGroupCollapseKey);
        if (campus) return campus.label;
      }
      return "Project Group";
    }
    if (projectGroupCollapseKey.startsWith("b:")) {
      for (const region of locationHierarchyTree) {
        for (const campus of region.campuses) {
          const building = campus.buildings.find((b) => `b:${b.key}` === projectGroupCollapseKey);
          if (building) return building.label;
        }
      }
    }
    return "Project Group";
  }, [locationHierarchyTree, projectGroupCollapseKey]);

  const handleProjectGroupTierChange = useCallback((selection: { value: TargetBudgetProjectGroupTierOption[] }) => {
    const path = selection.value;
    if (!path?.length) return;
    const last = path[path.length - 1];
    if (last?.id) setProjectGroupCollapseKey(String(last.id));
  }, []);

  const resolvedColumnMeta = useMemo(
    () => columnMetas.find((m) => m.columnIndex === resolvedColumnIndex),
    [columnMetas, resolvedColumnIndex]
  );

  const parentBudgetAvailability = useMemo(
    () =>
      computeAvailableBudgetFromParent({
        locationHierarchyTree: locationHierarchyTree,
        projectGroupCollapseKey,
        columnMeta: resolvedColumnMeta,
        columnIndex: resolvedColumnIndex,
        overrides: targetBudgetForecastOverrides,
        fiscalYearStartMonth,
      }),
    [
      locationHierarchyTree,
      projectGroupCollapseKey,
      resolvedColumnMeta,
      resolvedColumnIndex,
      targetBudgetForecastOverrides,
      fiscalYearStartMonth,
    ]
  );

  const amountExceedsParentBudget = useMemo(() => {
    if (!parentBudgetAvailability) return false;
    const n = moneyStringToNumber(amountDraft);
    return n > parentBudgetAvailability.availableFromParent + 1e-6;
  }, [amountDraft, parentBudgetAvailability]);

  const handleSave = useCallback(() => {
    const amount = moneyStringToNumber(amountDraft);
    if (
      parentBudgetAvailability &&
      amount > parentBudgetAvailability.availableFromParent + 1e-6
    ) {
      return;
    }
    onSave({
      hierarchyCollapseKey: projectGroupCollapseKey,
      columnIndex: resolvedColumnIndex,
      periodKey: selectedPeriodKey,
      amount,
      curve: "Linear",
    });
  }, [
    amountDraft,
    onSave,
    parentBudgetAvailability,
    projectGroupCollapseKey,
    resolvedColumnIndex,
    selectedPeriodKey,
  ]);

  const selectedPeriodLabel = useMemo(
    () => periodCatalog.find((o) => o.periodKey === selectedPeriodKey)?.periodLabel,
    [periodCatalog, selectedPeriodKey]
  );
  const selectedTargetBudgetAmount = useMemo(() => moneyStringToNumber(amountDraft), [amountDraft]);
  const allocationHierarchyRows = useMemo(() => {
    const out: Array<{
      key: string;
      label: string;
      depth: number;
      icon: "down" | "right" | null;
      bold: boolean;
      hasChildren: boolean;
    }> = [];
    const regionForSelection =
      locationHierarchyTree.find((r) => `r:${r.key}` === projectGroupCollapseKey) ??
      locationHierarchyTree.find((r) => r.campuses.some((c) => `c:${c.key}` === projectGroupCollapseKey || c.buildings.some((b) => `b:${b.key}` === projectGroupCollapseKey)));
    if (!regionForSelection) return out;

    const campusForSelection = regionForSelection.campuses.find(
      (c) => `c:${c.key}` === projectGroupCollapseKey || c.buildings.some((b) => `b:${b.key}` === projectGroupCollapseKey)
    );
    const selectedBuildingKey = campusForSelection?.buildings.find((b) => `b:${b.key}` === projectGroupCollapseKey)?.key;

    if (projectGroupCollapseKey.startsWith("r:")) {
      out.push({
        key: `r:${regionForSelection.key}`,
        label: regionForSelection.label,
        depth: 0,
        icon: allocationHierarchyCollapsed[`r:${regionForSelection.key}`] ? "right" : "down",
        bold: false,
        hasChildren: true,
      });
      const regionCollapsed = Boolean(allocationHierarchyCollapsed[`r:${regionForSelection.key}`]);
      if (regionCollapsed) return out;
      for (const campus of regionForSelection.campuses) {
        const campusKey = `c:${campus.key}`;
        const campusCollapsed = Boolean(allocationHierarchyCollapsed[campusKey]);
        out.push({
          key: campusKey,
          label: campus.label,
          depth: 1,
          icon: campusCollapsed ? "right" : "down",
          bold: true,
          hasChildren: true,
        });
        if (campusCollapsed) continue;
        for (const building of campus.buildings) {
          out.push({
            key: `b:${building.key}`,
            label: building.label,
            depth: 2,
            icon: null,
            bold: false,
            hasChildren: false,
          });
        }
      }
      return out;
    }

    if (campusForSelection) {
      if (selectedBuildingKey) {
        const selectedBuilding = campusForSelection.buildings.find((b) => b.key === selectedBuildingKey);
        if (selectedBuilding) {
          out.push({
            key: `b:${selectedBuilding.key}`,
            label: selectedBuilding.label,
            depth: 0,
            icon: null,
            bold: false,
            hasChildren: false,
          });
        }
        return out;
      }
      out.push({
        key: `c:${campusForSelection.key}`,
        label: campusForSelection.label,
        depth: 0,
        icon: allocationHierarchyCollapsed[`c:${campusForSelection.key}`] ? "right" : "down",
        bold: false,
        hasChildren: true,
      });
      const campusCollapsed = Boolean(allocationHierarchyCollapsed[`c:${campusForSelection.key}`]);
      if (campusCollapsed) return out;
      for (const building of campusForSelection.buildings) {
        out.push({
          key: `b:${building.key}`,
          label: building.label,
          depth: 1,
          icon: null,
          bold: false,
          hasChildren: false,
        });
      }
    }
    return out;
  }, [locationHierarchyTree, projectGroupCollapseKey, allocationHierarchyCollapsed]);
  const remainingToAllocate = useMemo(() => {
    if (!allocationHierarchyRows.length) return 0;
    const rootAmount = selectedTargetBudgetAmount;
    const firstChildDepth = allocationHierarchyRows[1]?.depth;
    if (firstChildDepth == null) return 0;
    const childTotals = allocationHierarchyRows
      .filter((r) => r.depth === firstChildDepth)
      .reduce((sum, r) => {
        const existing =
          resolvedColumnMeta == null
            ? 0
            : readTargetBudgetOverrideForCell(
                [r.key],
                resolvedColumnMeta,
                resolvedColumnIndex,
                targetBudgetForecastOverrides,
                fiscalYearStartMonth
              );
        return sum + (allocationBudgetsByKey[r.key] ?? existing);
      }, 0);
    return rootAmount - childTotals;
  }, [
    allocationHierarchyRows,
    allocationBudgetsByKey,
    selectedTargetBudgetAmount,
    resolvedColumnMeta,
    resolvedColumnIndex,
    targetBudgetForecastOverrides,
    fiscalYearStartMonth,
  ]);
  const reservedFundingGrandTotal = useMemo(
    () => fundingSourceRows.reduce((sum, row) => sum + row.reservedFunding, 0),
    [fundingSourceRows]
  );
  const remainingToFund = useMemo(
    () => fundingTargetBudgetAmount - reservedFundingGrandTotal,
    [fundingTargetBudgetAmount, reservedFundingGrandTotal]
  );
  const canSave = projectGroupCollapseKey.trim() !== "" && selectedPeriodKey.trim() !== "";

  return (
    <>
      <AddTargetBudgetTearsheetWidth />
      <Tearsheet
        open={open}
        onClose={onClose}
        aria-labelledby="add-target-budget-tearsheet-title"
        aria-label="Add target budget"
        placement="right"
      >
        <div
          className="add-target-budget-tearsheet-root"
          style={{ height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}
        >
          <Page
            style={{
              height: "100%",
              background: "var(--color-surface-primary)",
              color: "var(--color-text-primary)",
            }}
          >
            <Page.Main
              style={{
                height: "100%",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                background: "var(--color-surface-primary)",
              }}
            >
              <Page.Header
                style={{
                  background: "var(--color-surface-primary)",
                  borderBottom: "1px solid var(--color-border-separator)",
                }}
              >
                <Page.Title>
                  {tearsheetStep === "funding_sources" ? (
                    <Breadcrumbs variant="list" style={{ marginBottom: 8, color: "var(--color-text-secondary)" }}>
                      <Breadcrumbs.Crumb>
                        <button
                          type="button"
                          onClick={() => {
                            setFundingSourceRows(fundingSourceRowsBaseline);
                            setTearsheetStep("target_budget");
                          }}
                          style={{
                            border: 0,
                            background: "none",
                            padding: 0,
                            cursor: "pointer",
                            color: "var(--color-text-link)",
                          }}
                        >
                          Add Target Budget
                        </button>
                      </Breadcrumbs.Crumb>
                      <Breadcrumbs.Crumb active>{selectedProjectGroupLabel}</Breadcrumbs.Crumb>
                    </Breadcrumbs>
                  ) : null}
                  <Typography id="add-target-budget-tearsheet-title" intent="h2" as="h2" style={{ margin: 0 }}>
                    Add Target Budget
                  </Typography>
                  <Typography
                    intent="body"
                    as="p"
                    style={{ margin: "8px 0 0", color: "var(--color-text-secondary)", maxWidth: 560 }}
                  >
                    Create a target budget so you can track how your capital plan is performing.
                  </Typography>
                </Page.Title>
              </Page.Header>
              <Page.Body style={{ flex: 1, overflowY: "auto", padding: 24, background: "var(--color-surface-secondary)" }}>
              {tearsheetStep === "funding_sources" ? (
                <Card style={CARD_STYLE}>
                  <Table.Container
                    className="capital-planning-table-scroll capital-planning-no-row-selection capital-planning-row-height--sm add-target-budget-funding-table"
                    style={{ marginTop: 4 }}
                  >
                    <Table>
                      <Table.Header>
                        <Table.HeaderRow>
                          <Table.HeaderCell>Funding Source</Table.HeaderCell>
                          <Table.HeaderCell style={{ textAlign: "right", width: 180 }}>
                            Available Funding
                          </Table.HeaderCell>
                          <Table.HeaderCell style={{ textAlign: "right", width: 200 }}>
                            Reserved Funding
                          </Table.HeaderCell>
                          <Table.HeaderCell style={{ width: 44 }} aria-label="Remove funding source" />
                        </Table.HeaderRow>
                      </Table.Header>
                      <Table.Body>
                        {fundingSourceRows.length === 0 ? (
                          <Table.BodyRow className="add-target-budget-funding-empty-row">
                            <Table.BodyCell colSpan={4}>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  padding: "36px 0",
                                }}
                              >
                                <EmptyState size="md" style={{ maxWidth: 360 }}>
                                  <EmptyState.NoItems />
                                  <EmptyState.Title>No funding sources added</EmptyState.Title>
                                  <EmptyState.Description>Manage funding sourcse here</EmptyState.Description>
                                </EmptyState>
                              </div>
                            </Table.BodyCell>
                          </Table.BodyRow>
                        ) : null}
                        {fundingSourceRows.map((row) => (
                          <Table.BodyRow key={row.id}>
                            <Table.BodyCell>
                              <Select
                                aria-label={`Funding source ${row.id}`}
                                label={row.source || "Select Funding Source"}
                                block
                                onSelect={(s) => {
                                  if (s.action !== "selected") return;
                                  const selectedSource = String(s.item);
                                  const selectedMeta = FUNDING_SOURCE_OPTIONS.find(
                                    (option) => option.label === selectedSource
                                  );
                                  setFundingSourceRows((prev) =>
                                    prev.map((r) =>
                                      r.id === row.id
                                        ? {
                                            ...r,
                                            source: selectedSource,
                                            availableFunding: selectedMeta?.availableFunding ?? 0,
                                          }
                                        : r
                                    )
                                  );
                                }}
                              >
                                {FUNDING_SOURCE_OPTIONS.map((option) => (
                                  <Select.Option
                                    key={option.label}
                                    value={option.label}
                                    selected={row.source === option.label}
                                  >
                                    {option.label}
                                  </Select.Option>
                                ))}
                              </Select>
                            </Table.BodyCell>
                            <Table.BodyCell style={{ textAlign: "right", width: 180 }}>
                              <Typography intent="small" as="span">
                                {formatUsd(row.availableFunding)}
                              </Typography>
                            </Table.BodyCell>
                            <Table.BodyCell style={{ width: 200 }}>
                              <CurrencyInput
                                aria-label={`${row.source} reserved funding`}
                                currencyIsoCode="USD"
                                locale="en-US"
                                decimalScale={2}
                                fillDecimalScale="onBlur"
                                value={String(row.reservedFunding)}
                                onChange={({ value }) =>
                                  setFundingSourceRows((prev) =>
                                    prev.map((r) =>
                                      r.id === row.id
                                        ? { ...r, reservedFunding: moneyStringToNumber(value) }
                                        : r
                                    )
                                  )
                                }
                                style={{ width: "100%" }}
                              />
                            </Table.BodyCell>
                            <Table.BodyCell style={{ width: 44, textAlign: "center" }}>
                              <Button
                                type="button"
                                variant="tertiary"
                                size="sm"
                                icon={<Trash size="sm" />}
                                aria-label={`Remove funding source row ${row.id}`}
                                onClick={() =>
                                  setFundingSourceRows((prev) =>
                                    prev.filter((fundingRow) => fundingRow.id !== row.id)
                                  )
                                }
                              />
                            </Table.BodyCell>
                          </Table.BodyRow>
                        ))}
                        <Table.BodyRow style={{ background: "var(--color-surface-secondary)" }}>
                          <Table.BodyCell>
                            <Typography intent="small" weight="semibold" as="span">
                              Remaining to Fund
                            </Typography>
                          </Table.BodyCell>
                          <Table.BodyCell />
                          <Table.BodyCell style={{ textAlign: "right", width: 200 }}>
                            <Typography intent="small" weight="semibold" as="span">
                              {formatUsd(remainingToFund)}
                            </Typography>
                          </Table.BodyCell>
                          <Table.BodyCell />
                        </Table.BodyRow>
                      </Table.Body>
                    </Table>
                    <div style={{ padding: "10px 12px" }}>
                      <Button
                        type="button"
                        variant="secondary"
                        className="b_secondary"
                        icon={<Plus />}
                        size="sm"
                        onClick={() =>
                          setFundingSourceRows((prev) => [
                            ...prev,
                            {
                              id: `fs-${prev.length + 1}`,
                              source: "",
                              availableFunding: 0,
                              reservedFunding: 0,
                            },
                          ])
                        }
                      >
                        Add Funding Source
                      </Button>
                    </div>
                  </Table.Container>
                </Card>
              ) : (
              <Card style={CARD_STYLE}>
                <div style={FIELD_GRID}>
                  <Box style={{ gridColumn: "1 / -1" }}>
                    <Typography intent="small" weight="semibold" as="div">
                      Project Group
                    </Typography>
                    <div style={{ marginTop: 8 }}>
                      <TieredSelect
                        block
                        aria-label="Project group"
                        options={projectGroupTierOptions}
                        value={selectedProjectGroupTierValue}
                        onChange={handleProjectGroupTierChange}
                        getValueString="full-path"
                        selectableTiers
                      />
                    </div>
                  </Box>

                  <Box style={{ gridColumn: "1 / -1" }}>
                    <div style={TARGET_BUDGET_CURVES_ROW}>
                      <Box>
                        <FieldLabelWithHelp
                          label="Target Budget"
                          tooltipText={TARGET_BUDGET_AMOUNT_TOOLTIP}
                          tooltipAriaLabel="About target budget"
                        />
                        {parentBudgetAvailability ? (
                          <Typography intent="small" as="p" style={{ margin: "8px 0 0", color: "var(--color-text-secondary)" }}>
                            Available Budget from Parent Grouping:{" "}
                            <span style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>
                              {formatUsd(parentBudgetAvailability.availableFromParent)}
                            </span>
                          </Typography>
                        ) : null}
                        <Box style={{ marginTop: 8, width: "100%", maxWidth: "100%" }}>
                          <CurrencyInput
                            id="tb-amount"
                            aria-label="Target budget amount"
                            aria-invalid={amountExceedsParentBudget}
                            currencyIsoCode="USD"
                            locale="en-US"
                            decimalScale={2}
                            fillDecimalScale="onBlur"
                            value={amountDraft}
                            onChange={({ value }) => setAmountDraft(value)}
                            style={{ width: "100%" }}
                            error={amountExceedsParentBudget}
                          />
                          {amountExceedsParentBudget ? (
                            <Typography
                              intent="small"
                              as="p"
                              role="alert"
                              style={{ margin: "6px 0 0", color: "var(--color-text-error)" }}
                            >
                              Amount cannot exceed the available budget from the parent grouping for this period.
                            </Typography>
                          ) : null}
                        </Box>
                      </Box>
                      <Box>
                        <Typography intent="small" weight="semibold" as="label">
                          Fiscal Year
                        </Typography>
                        <div style={{ marginTop: 8 }}>
                          <Select
                            block
                            aria-label="Fiscal Year"
                            label={selectedPeriodLabel}
                            placeholder="Select fiscal year"
                            onSelect={(s) => {
                              if (s.action !== "selected") return;
                              setSelectedPeriodKey(s.item as string);
                            }}
                          >
                            {periodCatalog.map((o) => (
                              <Select.Option key={o.periodKey} value={o.periodKey} selected={selectedPeriodKey === o.periodKey}>
                                {o.periodLabel}
                              </Select.Option>
                            ))}
                          </Select>
                        </div>
                      </Box>
                    </div>
                    <div
                      style={{
                        marginTop: 16,
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      <Table.Container
                        className="capital-planning-table-scroll capital-planning-no-row-selection capital-planning-row-height--sm"
                        style={{ marginTop: 4 }}
                      >
                          <Table>
                            <Table.Header>
                              <Table.HeaderRow>
                                <Table.HeaderCell>Programs</Table.HeaderCell>
                                <Table.HeaderCell style={{ textAlign: "right", width: 180 }}>
                                  Budget
                                </Table.HeaderCell>
                                <Table.HeaderCell
                                  className="add-target-budget-funding-link-col"
                                  style={{ width: 300, minWidth: 300, maxWidth: 300 }}
                                >
                                  Funding Sources
                                </Table.HeaderCell>
                              </Table.HeaderRow>
                            </Table.Header>
                            <Table.Body>
                              {allocationHierarchyRows.map((row) => (
                                (() => {
                                  const existingRowBudget =
                                    resolvedColumnMeta == null
                                      ? 0
                                      : readTargetBudgetOverrideForCell(
                                          [row.key],
                                          resolvedColumnMeta,
                                          resolvedColumnIndex,
                                          targetBudgetForecastOverrides,
                                          fiscalYearStartMonth
                                        );
                                  const rowBudgetValue =
                                    row.depth === 0
                                      ? selectedTargetBudgetAmount
                                      : allocationBudgetsByKey[row.key] ?? existingRowBudget;
                                  const canAddFundingForRow = rowBudgetValue > 0;
                                  const savedFundingRowsForRow = savedFundingSourcesByRowKey[row.key] ?? [];
                                  const savedFundingSourceNames = savedFundingRowsForRow
                                    .map((fundingRow) => fundingRow.source.trim())
                                    .filter((name) => name.length > 0);
                                  const hasSavedFundingSourceNames = savedFundingSourceNames.length > 0;
                                  return (
                                <Table.BodyRow
                                  key={row.key}
                                  className={[
                                    "capital-planning-table-status-group",
                                    row.depth > 0 ? "capital-planning-program-hierarchy-aggregate" : "",
                                  ]
                                    .filter(Boolean)
                                    .join(" ")}
                                  style={
                                    row.depth > 0
                                      ? ({ ["--cp-program-hierarchy-rails" as string]: row.depth } as React.CSSProperties)
                                      : undefined
                                  }
                                >
                                  <Table.BodyCell className="capital-planning-table-status-group-header-label-cell">
                                    <Table.TextCell className="capital-planning-status-group-header-text-cell">
                                      <div className="capital-planning-project-select-cell-inner">
                                        {!row.hasChildren ? (
                                          <Typography
                                            intent="small"
                                            {...(row.bold ? { weight: "semibold" as const } : {})}
                                            as="span"
                                            className="capital-planning-status-group-header-title"
                                            style={row.depth > 0 ? { marginLeft: 16 } : undefined}
                                          >
                                            {row.label}
                                          </Typography>
                                        ) : (
                                          <button
                                            type="button"
                                            className="capital-planning-status-group-header-toggle"
                                            aria-expanded={row.icon === "down"}
                                            aria-label={row.icon === "down" ? `Collapse ${row.label}` : `Expand ${row.label}`}
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              if (!row.hasChildren) return;
                                              setAllocationHierarchyCollapsed((prev) => ({
                                                ...prev,
                                                [row.key]: !prev[row.key],
                                              }));
                                            }}
                                          >
                                            <span className="capital-planning-status-group-header-chevron" aria-hidden>
                                              {row.icon === "down" ? <CaretDown size="sm" /> : <CaretRight size="sm" />}
                                            </span>
                                            <Typography
                                              intent="small"
                                              {...(row.bold ? { weight: "semibold" as const } : {})}
                                              as="span"
                                              className="capital-planning-status-group-header-title"
                                            >
                                              {row.label}
                                            </Typography>
                                          </button>
                                        )}
                                      </div>
                                    </Table.TextCell>
                                  </Table.BodyCell>
                                  <Table.BodyCell style={{ width: 180 }}>
                                    {row.depth === 0 ? (
                                      <Table.CurrencyCell value={selectedTargetBudgetAmount} />
                                    ) : (
                                      <InlineCurrencyDraftInput
                                        ariaLabel={`${row.label} budget`}
                                        value={
                                          allocationBudgetsByKey[row.key] ??
                                          (resolvedColumnMeta == null
                                            ? undefined
                                            : (() => {
                                                const existing = readTargetBudgetOverrideForCell(
                                                  [row.key],
                                                  resolvedColumnMeta,
                                                  resolvedColumnIndex,
                                                  targetBudgetForecastOverrides,
                                                  fiscalYearStartMonth
                                                );
                                                return existing > 0 ? existing : undefined;
                                              })())
                                        }
                                        onChange={(nextValue) =>
                                          setAllocationBudgetsByKey((prev) => {
                                            if (nextValue === undefined) {
                                              const { [row.key]: _removed, ...rest } = prev;
                                              return rest;
                                            }
                                            return {
                                              ...prev,
                                              [row.key]: nextValue,
                                            };
                                          })
                                        }
                                      />
                                    )}
                                  </Table.BodyCell>
                                  <Table.BodyCell
                                    className="add-target-budget-funding-link-col"
                                    style={{ width: 300, minWidth: 300, maxWidth: 300 }}
                                  >
                                    {hasSavedFundingSourceNames ? (
                                      <a
                                        href="#"
                                        aria-label={`View funding for ${row.label}`}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          const existingSavedRows = (savedFundingSourcesByRowKey[row.key] ?? []).map((item) => ({ ...item }));
                                          setActiveFundingRowKey(row.key);
                                          setFundingSourceRows(existingSavedRows);
                                          setFundingSourceRowsBaseline(existingSavedRows.map((item) => ({ ...item })));
                                          setFundingTargetBudgetAmount(rowBudgetValue);
                                          setTearsheetStep("funding_sources");
                                        }}
                                        style={{
                                          color: "var(--p-blue-40)",
                                          textDecoration: "underline",
                                          display: "block",
                                          width: "100%",
                                          maxWidth: 300,
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap",
                                        }}
                                        title={savedFundingSourceNames.join(", ")}
                                      >
                                        {savedFundingSourceNames.join(", ")}
                                      </a>
                                    ) : (
                                      <Button
                                        type="button"
                                        variant="secondary"
                                        className="b_secondary"
                                        size="sm"
                                        icon={<Plus />}
                                        aria-label={`Add funding for ${row.label}`}
                                        disabled={!canAddFundingForRow}
                                        onClick={() => {
                                          const existingSavedRows = (savedFundingSourcesByRowKey[row.key] ?? []).map((item) => ({ ...item }));
                                          setActiveFundingRowKey(row.key);
                                          setFundingSourceRows(existingSavedRows);
                                          setFundingSourceRowsBaseline(existingSavedRows.map((item) => ({ ...item })));
                                          setFundingTargetBudgetAmount(rowBudgetValue);
                                          setTearsheetStep("funding_sources");
                                        }}
                                      >
                                        Add Funding
                                      </Button>
                                    )}
                                  </Table.BodyCell>
                                </Table.BodyRow>
                                  );
                                })()
                              ))}
                              <Table.BodyRow style={{ background: "var(--color-surface-secondary)" }}>
                                <Table.BodyCell>
                                  <Typography intent="small" weight="semibold" as="span">
                                    Remaining to Allocate
                                  </Typography>
                                </Table.BodyCell>
                                <Table.BodyCell style={{ textAlign: "right", width: 180 }}>
                                  <Typography intent="small" weight="semibold" as="span">
                                    {formatUsd(remainingToAllocate)}
                                  </Typography>
                                </Table.BodyCell>
                                <Table.BodyCell />
                              </Table.BodyRow>
                            </Table.Body>
                          </Table>
                      </Table.Container>
                      {null}
                    </div>
                  </Box>
                </div>
              </Card>
              )}
              </Page.Body>
              <Page.Footer>
                <Box
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 12,
                    width: "100%",
                    padding: "16px 24px",
                    boxSizing: "border-box",
                  }}
                >
                  <Button type="button" variant="tertiary" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    className="b_primary"
                    onClick={() => {
                      if (tearsheetStep === "funding_sources") {
                        if (activeFundingRowKey) {
                          const sanitizedFundingRows = fundingSourceRows
                            .map((row) => ({ ...row, source: row.source.trim() }))
                            .filter((row) => row.source.length > 0);
                          setSavedFundingSourcesByRowKey((prev) => ({
                            ...prev,
                            [activeFundingRowKey]: sanitizedFundingRows,
                          }));
                        }
                        setFundingSourceRowsBaseline(fundingSourceRows.map((row) => ({ ...row })));
                        setTearsheetStep("target_budget");
                        return;
                      }
                      handleSave();
                    }}
                    disabled={
                      tearsheetStep === "funding_sources"
                        ? false
                        : amountExceedsParentBudget || !canSave
                    }
                  >
                    {tearsheetStep === "funding_sources" ? "Save Funding Sources" : "Save"}
                  </Button>
                </Box>
              </Page.Footer>
            </Page.Main>
          </Page>
        </div>
      </Tearsheet>
    </>
  );
}

export type { TargetBudgetDistributionCurve } from "./targetBudgetForecastColumnMeta";
