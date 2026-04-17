import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, Dropdown, EmptyState, Page, Select, Table, Tearsheet, Typography } from "@procore/core-react";
import { Trash } from "@procore/core-icons";
import type { CapitalPlanningSampleRow } from "./capitalPlanningData";

/*
 * Layout reference (Capital Planning — High Level Budget Items):
 * https://www.figma.com/design/wbjpyOCTw2MQaOzx4ibk6r/Capital-Planning?node-id=4440-88961
 *
 * Empty state (no line items):
 * https://www.figma.com/design/wbjpyOCTw2MQaOzx4ibk6r/Capital-Planning?node-id=4550-93955
 *
 * `Tearsheet` + `block`: panel uses most of the viewport width (`calc(100vw - minScrimSize)`) while
 * keeping the design-system scrim and close control (see @procore/core-react Tearsheet styles).
 */

/** User-added amount-based line: only item + amount are used; other columns are blank. `amountText` is raw input for stable typing. */
export type HighLevelBudgetLineAmountOnly = {
  kind: "amount-only";
  id: string;
  item: string;
  /** Raw currency input (e.g. `1,234.56`); total uses {@link parseUsdInput}. */
  amountText: string;
};

/** User-added unit & quantity line: item, quantity, unit type, unit cost editable; % markup blank; amount = quantity × unit cost. */
export type HighLevelBudgetLineUnitQuantity = {
  kind: "unit-quantity";
  id: string;
  item: string;
  quantityText: string;
  unitType: string;
  unitCostText: string;
};

/**
 * User-added % markup line: item + markup % editable; other columns blank.
 * Amount = (sum of dollar amounts for all non–percent-markup lines) × (markup % ÷ 100).
 */
export type HighLevelBudgetLinePercentMarkup = {
  kind: "percent-markup";
  id: string;
  item: string;
  /** Raw percent input (e.g. `10` or `10%`); dollar amount uses {@link parseMarkupPercent}. */
  markupPctText: string;
};

export type HighLevelBudgetLine =
  | HighLevelBudgetLineAmountOnly
  | HighLevelBudgetLineUnitQuantity
  | HighLevelBudgetLinePercentMarkup;

/*
 * Editable fields by line kind:
 * - amount-only: Item, Amount
 * - unit-quantity: Item, Quantity, Unit type (select), Unit cost; Amount is derived
 * - percent-markup: Item, % Markup; Amount is derived
 */

/** Units of measure for Unit & Quantity lines (`Table.SelectCell`). */
const UNITS_OF_MEASURE = [
  "EA",
  "LS",
  "SF",
  "SY",
  "LF",
  "CY",
  "TON",
  "GAL",
  "HR",
  "MO",
  "BD",
  "SHT",
  "RL",
  "BOX",
  "PKG",
  "SQ",
] as const;

function parseUsdInput(s: string): number {
  const cleaned = s.replace(/,/g, "").replace(/[^0-9.-]/g, "");
  if (cleaned === "" || cleaned === "-" || cleaned === ".") return 0;
  const x = parseFloat(cleaned);
  return Number.isNaN(x) ? 0 : Math.max(0, x);
}

/** Quantity for unit–quantity lines (allows decimals). */
function parseQuantityInput(s: string): number {
  const cleaned = s.replace(/,/g, "").replace(/[^0-9.]/g, "");
  if (cleaned === "" || cleaned === ".") return 0;
  const x = parseFloat(cleaned);
  return Number.isNaN(x) ? 0 : Math.max(0, x);
}

function unitQuantityLineAmount(line: HighLevelBudgetLineUnitQuantity): number {
  const q = parseQuantityInput(line.quantityText);
  const u = parseUsdInput(line.unitCostText);
  return Math.round(q * u * 100) / 100;
}

/** Parses a percentage for % markup lines (allows `%` suffix, non-negative). */
function parseMarkupPercent(s: string): number {
  const cleaned = s.replace(/%/g, "").replace(/,/g, "").trim();
  if (cleaned === "" || cleaned === "-" || cleaned === ".") return 0;
  const x = parseFloat(cleaned);
  return Number.isNaN(x) ? 0 : Math.max(0, x);
}

/** Dollar value for a line when it is not a percent-markup row (subtotal base). */
function lineDollarAmountNonMarkup(line: HighLevelBudgetLine): number | null {
  if (line.kind === "percent-markup") return null;
  if (line.kind === "amount-only") return parseUsdInput(line.amountText);
  return unitQuantityLineAmount(line);
}

/** Sum of all line amounts excluding percent-markup rows — markup % applies to this subtotal. */
function subtotalExcludingPercentMarkupLines(lines: HighLevelBudgetLine[]): number {
  return lines.reduce((s, l) => {
    const v = lineDollarAmountNonMarkup(l);
    return v === null ? s : s + v;
  }, 0);
}

function percentMarkupLineAmount(line: HighLevelBudgetLinePercentMarkup, lines: HighLevelBudgetLine[]): number {
  const base = subtotalExcludingPercentMarkupLines(lines);
  const pct = parseMarkupPercent(line.markupPctText);
  return Math.round(base * (pct / 100) * 100) / 100;
}

function lineAmountForTotal(line: HighLevelBudgetLine, lines: HighLevelBudgetLine[]): number {
  if (line.kind === "amount-only") return parseUsdInput(line.amountText);
  if (line.kind === "unit-quantity") return unitQuantityLineAmount(line);
  return percentMarkupLineAmount(line, lines);
}

function highLevelBudgetLinesSum(lines: HighLevelBudgetLine[]): number {
  return lines.reduce((s, l) => s + lineAmountForTotal(l, lines), 0);
}

/**
 * Nudge the first amount-only line so the grand total matches `targetTotal` (seed math can drift by cents).
 * Markup lines recompute from the updated subtotal on the next pass.
 */
function reconcileHighLevelBudgetLinesToTotal(lines: HighLevelBudgetLine[], targetTotal: number): HighLevelBudgetLine[] {
  let current = lines;
  for (let iter = 0; iter < 16; iter++) {
    const sum = highLevelBudgetLinesSum(current);
    const diff = Math.round((targetTotal - sum) * 100) / 100;
    if (Math.abs(diff) < 0.005) return current;
    const ai = current.findIndex((l) => l.kind === "amount-only");
    if (ai < 0) return current;
    const l = current[ai];
    if (l.kind !== "amount-only") return current;
    const nextDollars = Math.max(0, parseUsdInput(l.amountText) + diff);
    current = current.map((line, i) =>
      i === ai && line.kind === "amount-only" ? { ...line, amountText: formatUsdSeed(nextDollars) } : line
    );
  }
  return current;
}

function newLineId(rowId: string, suffix: string): string {
  return `${rowId}-hlb-${suffix}-${typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now())}`;
}

function formatUsdSeed(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Deterministic seed: **Amount**, **Unit & Quantity**, and **% Markup** lines. Non-markup dollars sum to `S`;
 * each markup row is `S × (pct/100)`, so grand total equals `targetTotal` (within cent rounding).
 */
function sampleHighLevelBudgetLines(rowId: string, targetTotal: number): HighLevelBudgetLine[] {
  const seed = rowId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const markupPctA = 5 + (seed % 4);
  const markupPctB = 3 + ((seed >> 3) % 3);
  const pctSum = markupPctA + markupPctB;
  const mult = 1 + pctSum / 100;
  const S = targetTotal > 0 && mult > 0 ? targetTotal / mult : 0;

  const wAmount = [0.15, 0.17, 0.13, 0.11] as const;
  const amountLabels = [
    "General conditions",
    "Structure & envelope",
    "MEP — rough-in",
    "Site & civil",
  ] as const;
  const wUnit = [0.22, 0.22] as const;
  const unitLabels = ["Interior fit-out", "Equipment package"] as const;

  const lines: HighLevelBudgetLine[] = [];

  for (let k = 0; k < wAmount.length; k++) {
    const dollars = Math.round(S * wAmount[k] * 100) / 100;
    lines.push({
      kind: "amount-only",
      id: `${rowId}-hlb-seed-amt-${k}`,
      item: amountLabels[k],
      amountText: formatUsdSeed(dollars),
    });
  }

  for (let k = 0; k < wUnit.length; k++) {
    const dollars = Math.round(S * wUnit[k] * 100) / 100;
    const qty = k === 0 ? 800 + (seed % 400) : 4 + (seed % 8);
    const safeQty = Math.max(1, qty);
    const unitCost = Math.round((dollars / safeQty) * 100) / 100;
    lines.push({
      kind: "unit-quantity",
      id: `${rowId}-hlb-seed-uq-${k}`,
      item: unitLabels[k],
      quantityText: String(safeQty),
      unitType: k === 0 ? UNITS_OF_MEASURE[seed % UNITS_OF_MEASURE.length] : "EA",
      unitCostText: formatUsdSeed(unitCost),
    });
  }

  lines.push(
    {
      kind: "percent-markup",
      id: `${rowId}-hlb-seed-pct-0`,
      item: "Design contingency",
      markupPctText: String(markupPctA),
    },
    {
      kind: "percent-markup",
      id: `${rowId}-hlb-seed-pct-1`,
      item: "Owner reserve & fee",
      markupPctText: String(markupPctB),
    }
  );

  return reconcileHighLevelBudgetLinesToTotal(lines, targetTotal);
}

export interface HighLevelBudgetItemsTearsheetProps {
  open: boolean;
  onClose: () => void;
  /** Writes the sum of budget lines to Capital Planning Planned Amount for this project. */
  onSave: (plannedAmountTotal: number) => void;
  row: CapitalPlanningSampleRow | null;
}

/** Non-editable empty cell for N/A columns (amount-only lines). */
function EmptyNotApplicableCell() {
  return (
    <Table.BodyCell>
      <Table.TextCell>
        <span style={{ display: "block", minHeight: 1 }} aria-label="Not applicable" />
      </Table.TextCell>
    </Table.BodyCell>
  );
}

function RowDeleteCell({ onRemove }: { onRemove: () => void }) {
  return (
    <Table.BodyCell
      style={{ width: 44, maxWidth: 44, boxSizing: "border-box", verticalAlign: "middle", padding: "0 4px" }}
    >
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
        <Button type="button" variant="tertiary" size="sm" icon={<Trash />} aria-label="Delete line item" onClick={onRemove} />
      </div>
    </Table.BodyCell>
  );
}

export function HighLevelBudgetItemsTearsheet({ open, onClose, onSave, row }: HighLevelBudgetItemsTearsheetProps) {
  const [lines, setLines] = useState<HighLevelBudgetLine[]>([]);

  useEffect(() => {
    if (!open) {
      setLines([]);
      return;
    }
    if (!row) {
      setLines([]);
      return;
    }
    setLines(sampleHighLevelBudgetLines(row.id, row.plannedAmount));
    // Only re-seed when the tearsheet opens or the grid’s resolved planned amount / project changes — not when `row`
    // is a new object reference each render (would wipe in-progress line edits).
  }, [open, row?.id, row?.plannedAmount]);

  const total = useMemo(() => lines.reduce((s, l) => s + lineAmountForTotal(l, lines), 0), [lines]);

  const handleSave = useCallback(() => {
    const rounded = Math.round(total * 100) / 100;
    onSave(rounded);
  }, [onSave, total]);

  const removeLine = (lineId: string) => {
    setLines((prev) => prev.filter((l) => l.id !== lineId));
  };

  const addLineFromMenu = useCallback(
    (item: string) => {
      if (!row) return;
      if (item === "amount") {
        setLines((prev) => [
          ...prev,
          { kind: "amount-only", id: newLineId(row.id, "amt"), item: "", amountText: "" },
        ]);
        return;
      }
      if (item === "unit-quantity") {
        setLines((prev) => [
          ...prev,
          {
            kind: "unit-quantity",
            id: newLineId(row.id, "uq"),
            item: "",
            quantityText: "",
            unitType: "",
            unitCostText: "",
          },
        ]);
        return;
      }
      if (item === "markup") {
        setLines((prev) => [
          ...prev,
          {
            kind: "percent-markup",
            id: newLineId(row.id, "pct"),
            item: "",
            markupPctText: "",
          },
        ]);
      }
    },
    [row]
  );

  return (
    <Tearsheet open={open} onClose={onClose} placement="right" aria-label="High level budget items">
      {row ? (
        <div className="high-level-budget-items-tearsheet-layout">
        <Page
          className="high-level-budget-items-page"
          style={{
            height: "100%",
            minHeight: 0,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Page.Main
            className="high-level-budget-items-page-main"
            style={{
              height: "100%",
              minHeight: 0,
              flex: 1,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Page.Header style={{ flexShrink: 0 }}>
              <Page.Title>
                <Typography intent="h2" style={{ fontWeight: 700, color: "#232729", display: "block" }}>
                  High Level Budget Items
                </Typography>
                <Typography
                  intent="body"
                  color="gray45"
                  style={{ marginTop: 8, maxWidth: 560, lineHeight: 1.45, display: "block" }}
                >
                  Add high level budget line items to organize cost in the early stages of the project.
                </Typography>
              </Page.Title>
            </Page.Header>
            <Page.Body
              className="high-level-budget-items-page-body"
              style={{
                flex: 1,
                minHeight: 0,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div className="high-level-budget-items-table-shell">
                <Table.Container>
                  <Table
                    className={
                      lines.length === 0
                        ? "high-level-budget-items-table high-level-budget-items-table--empty-body"
                        : "high-level-budget-items-table"
                    }
                  >
                  <Table.Header>
                    <Table.HeaderRow>
                      <Table.HeaderCell>Items</Table.HeaderCell>
                      <Table.HeaderCell>Quantity</Table.HeaderCell>
                      <Table.HeaderCell>Unit Type</Table.HeaderCell>
                      <Table.HeaderCell>Unit Cost</Table.HeaderCell>
                      <Table.HeaderCell>% Markup</Table.HeaderCell>
                      <Table.HeaderCell>Amount</Table.HeaderCell>
                      <Table.HeaderCell
                        snugfit
                        style={{ width: 44, maxWidth: 44, paddingLeft: 4, paddingRight: 4 }}
                        aria-label="Remove row"
                      />
                    </Table.HeaderRow>
                  </Table.Header>
                  <Table.Body>
                    {lines.map((line) => {
                      if (line.kind === "amount-only") {
                        return (
                          <Table.BodyRow key={line.id} className="high-level-budget-items-inline-edit-row">
                            <Table.BodyCell>
                              <Table.InputCell
                                size="block"
                                type="text"
                                autoComplete="off"
                                value={line.item}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                  const next = e.currentTarget.value;
                                  setLines((prev) =>
                                    prev.map((l) =>
                                      l.id === line.id && l.kind === "amount-only" ? { ...l, item: next } : l
                                    )
                                  );
                                }}
                                aria-label="Budget line item description"
                              />
                            </Table.BodyCell>
                            <EmptyNotApplicableCell />
                            <EmptyNotApplicableCell />
                            <EmptyNotApplicableCell />
                            <EmptyNotApplicableCell />
                            <Table.BodyCell>
                              <Table.InputCell
                                size="block"
                                type="text"
                                inputMode="decimal"
                                autoComplete="off"
                                value={line.amountText}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                  const next = e.currentTarget.value;
                                  setLines((prev) =>
                                    prev.map((l) =>
                                      l.id === line.id && l.kind === "amount-only" ? { ...l, amountText: next } : l
                                    )
                                  );
                                }}
                                aria-label="Budget line amount"
                              />
                            </Table.BodyCell>
                            <RowDeleteCell onRemove={() => removeLine(line.id)} />
                          </Table.BodyRow>
                        );
                      }

                      if (line.kind === "unit-quantity") {
                        const rowAmount = unitQuantityLineAmount(line);
                        return (
                          <Table.BodyRow key={line.id} className="high-level-budget-items-inline-edit-row">
                            <Table.BodyCell>
                              <Table.InputCell
                                size="block"
                                type="text"
                                autoComplete="off"
                                value={line.item}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                  const next = e.currentTarget.value;
                                  setLines((prev) =>
                                    prev.map((l) =>
                                      l.id === line.id && l.kind === "unit-quantity" ? { ...l, item: next } : l
                                    )
                                  );
                                }}
                                aria-label="Budget line item description"
                              />
                            </Table.BodyCell>
                            <Table.BodyCell>
                              <Table.InputCell
                                size="block"
                                type="text"
                                inputMode="decimal"
                                autoComplete="off"
                                value={line.quantityText}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                  const next = e.currentTarget.value;
                                  setLines((prev) =>
                                    prev.map((l) =>
                                      l.id === line.id && l.kind === "unit-quantity" ? { ...l, quantityText: next } : l
                                    )
                                  );
                                }}
                                aria-label="Quantity"
                              />
                            </Table.BodyCell>
                            <Table.BodyCell style={{ verticalAlign: "middle" }}>
                              <Table.SelectCell
                                block
                                label={line.unitType}
                                aria-label="Unit of measure"
                                onSelect={(s) => {
                                  if (s.action !== "selected") return;
                                  const next = String(s.item);
                                  setLines((prev) =>
                                    prev.map((l) =>
                                      l.id === line.id && l.kind === "unit-quantity" ? { ...l, unitType: next } : l
                                    )
                                  );
                                }}
                              >
                                {UNITS_OF_MEASURE.map((u) => (
                                  <Select.Option key={u} value={u} selected={line.unitType === u}>
                                    {u}
                                  </Select.Option>
                                ))}
                              </Table.SelectCell>
                            </Table.BodyCell>
                            <Table.BodyCell>
                              <Table.InputCell
                                size="block"
                                type="text"
                                inputMode="decimal"
                                autoComplete="off"
                                value={line.unitCostText}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                  const next = e.currentTarget.value;
                                  setLines((prev) =>
                                    prev.map((l) =>
                                      l.id === line.id && l.kind === "unit-quantity" ? { ...l, unitCostText: next } : l
                                    )
                                  );
                                }}
                                aria-label="Unit cost"
                              />
                            </Table.BodyCell>
                            <EmptyNotApplicableCell />
                            <Table.BodyCell>
                              <Table.CurrencyCell value={rowAmount} />
                            </Table.BodyCell>
                            <RowDeleteCell onRemove={() => removeLine(line.id)} />
                          </Table.BodyRow>
                        );
                      }

                      if (line.kind === "percent-markup") {
                        const rowAmount = percentMarkupLineAmount(line, lines);
                        return (
                          <Table.BodyRow key={line.id} className="high-level-budget-items-inline-edit-row">
                            <Table.BodyCell>
                              <Table.InputCell
                                size="block"
                                type="text"
                                autoComplete="off"
                                value={line.item}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                  const next = e.currentTarget.value;
                                  setLines((prev) =>
                                    prev.map((l) =>
                                      l.id === line.id && l.kind === "percent-markup" ? { ...l, item: next } : l
                                    )
                                  );
                                }}
                                aria-label="Budget line item description"
                              />
                            </Table.BodyCell>
                            <EmptyNotApplicableCell />
                            <EmptyNotApplicableCell />
                            <EmptyNotApplicableCell />
                            <Table.BodyCell>
                              <div
                                className="high-level-budget-items-percent-markup-field"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                  width: "100%",
                                  minWidth: 0,
                                  boxSizing: "border-box",
                                }}
                              >
                                <Table.InputCell
                                  size="block"
                                  type="text"
                                  inputMode="decimal"
                                  autoComplete="off"
                                  value={line.markupPctText}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    const next = e.currentTarget.value;
                                    setLines((prev) =>
                                      prev.map((l) =>
                                        l.id === line.id && l.kind === "percent-markup"
                                          ? { ...l, markupPctText: next }
                                          : l
                                      )
                                    );
                                  }}
                                  aria-label="Percent markup"
                                  style={{ flex: "1 1 auto", minWidth: 0 }}
                                />
                                <Typography
                                  intent="small"
                                  weight="semibold"
                                  color="gray15"
                                  as="span"
                                  aria-hidden
                                  style={{ flexShrink: 0, lineHeight: 1 }}
                                >
                                  %
                                </Typography>
                              </div>
                            </Table.BodyCell>
                            <Table.BodyCell>
                              <Table.CurrencyCell value={rowAmount} />
                            </Table.BodyCell>
                            <RowDeleteCell onRemove={() => removeLine(line.id)} />
                          </Table.BodyRow>
                        );
                      }
                      return null;
                    })}
                    {lines.length > 0 ? (
                    <Table.BodyRow className="high-level-budget-items-footer-row">
                      <Table.BodyCell colSpan={5}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-start",
                            width: "100%",
                            minWidth: 0,
                            boxSizing: "border-box",
                          }}
                        >
                          <Dropdown
                            label="Add Line Items"
                            variant="secondary"
                            size="sm"
                            placement="bottom-left"
                            onSelect={(selection) => {
                              if (selection.action !== "selected") return;
                              addLineFromMenu(String(selection.item));
                            }}
                            style={{ flexShrink: 0 }}
                          >
                            <Dropdown.Item item="amount">Amount</Dropdown.Item>
                            <Dropdown.Item item="unit-quantity">Unit & Quantity</Dropdown.Item>
                            <Dropdown.Item item="markup">% Markup</Dropdown.Item>
                          </Dropdown>
                        </div>
                      </Table.BodyCell>
                      <Table.BodyCell>
                        <Table.CurrencyCell value={total} />
                      </Table.BodyCell>
                      <Table.BodyCell
                        style={{ width: 44, maxWidth: 44, boxSizing: "border-box", padding: "0 4px", border: 0 }}
                        aria-hidden
                      />
                    </Table.BodyRow>
                    ) : null}
                  </Table.Body>
                </Table>
              </Table.Container>
              {lines.length === 0 ? (
                <div
                  className="high-level-budget-items-empty-overlay"
                  role="region"
                  aria-label="Add high level budget items to get started"
                >
                  <EmptyState size="md" style={{ maxWidth: 400, width: "100%", position: "relative", zIndex: 1 }}>
                    <EmptyState.NoItems />
                    <EmptyState.Title>Add High Level Budget Items to Get Started</EmptyState.Title>
                    <EmptyState.Description>
                      Adding high level budget items allows you to manually build a structured cost by adding cost
                      categories (e.g., Hard Costs, Soft Costs, Land Acquisition). Once you add high level budget
                      items, you can view them here.
                    </EmptyState.Description>
                    <EmptyState.Actions>
                      <Dropdown
                        label="Add Line Items"
                        variant="secondary"
                        placement="bottom-left"
                        onSelect={(selection) => {
                          if (selection.action !== "selected") return;
                          addLineFromMenu(String(selection.item));
                        }}
                      >
                        <Dropdown.Item item="amount">Amount</Dropdown.Item>
                        <Dropdown.Item item="unit-quantity">Unit & Quantity</Dropdown.Item>
                        <Dropdown.Item item="markup">% Markup</Dropdown.Item>
                      </Dropdown>
                    </EmptyState.Actions>
                  </EmptyState>
                </div>
              ) : null}
              </div>
            </Page.Body>
            <Page.Footer className="high-level-budget-items-page-footer" style={{ flexShrink: 0 }}>
              <Box
                className="high-level-budget-items-page-footer-inner"
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: 8,
                  padding: "16px 24px",
                }}
              >
                <Button variant="secondary" type="button" onClick={onClose}>
                  Cancel
                </Button>
                <Button variant="primary" type="button" onClick={handleSave}>
                  Save
                </Button>
              </Box>
            </Page.Footer>
          </Page.Main>
        </Page>
        </div>
      ) : null}
    </Tearsheet>
  );
}
