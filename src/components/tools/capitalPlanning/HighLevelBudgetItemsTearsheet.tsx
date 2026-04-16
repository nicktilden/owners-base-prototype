import React, { useMemo } from "react";
import { Box, Button, Page, Table, Tearsheet, Typography } from "@procore/core-react";
import type { CapitalPlanningSampleRow } from "./capitalPlanningData";

/*
 * Layout reference (Capital Planning — High Level Budget Items):
 * https://www.figma.com/design/wbjpyOCTw2MQaOzx4ibk6r/Capital-Planning?node-id=4440-88961
 *
 * `Tearsheet` + `block`: panel uses most of the viewport width (`calc(100vw - minScrimSize)`) while
 * keeping the design-system scrim and close control (see @procore/core-react Tearsheet styles).
 */

export interface HighLevelBudgetLine {
  id: string;
  item: string;
  quantity: number;
  unitType: string;
  unitCost: number;
  markupPct: number;
  amount: number;
}

const UNIT_TYPES = ["EA", "LS", "SF", "CY", "HR", "MO", "TON", "EA"] as const;

/** Deterministic sample lines derived from row id; line amounts sum to `targetTotal`. */
function sampleHighLevelBudgetLines(rowId: string, targetTotal: number): HighLevelBudgetLine[] {
  const seed = rowId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const weights = [0.22, 0.18, 0.14, 0.12, 0.1, 0.08, 0.08, 0.08];
  const items = [
    "General conditions",
    "Structure & envelope",
    "MEP — rough-in",
    "Interior fit-out",
    "Site & civil",
    "Equipment allowance",
    "Design contingency",
    "Owner reserve",
  ];
  const raw = weights.map((w, i) => {
    const jitter = 1 + ((seed + i * 13) % 7) * 0.01;
    return Math.round(targetTotal * w * jitter);
  });
  const sum = raw.reduce((a, b) => a + b, 0);
  const scale = targetTotal > 0 && sum > 0 ? targetTotal / sum : 1;
  return items.map((item, i) => {
    const amount = Math.round(raw[i] * scale);
    const markupPct = 5 + ((seed + i * 7) % 11);
    const quantity = Math.max(1, 10 + ((seed + i * 19) % 400));
    const divisor = quantity * (1 + markupPct / 100);
    const unitCost = divisor > 0 ? Math.round((amount / divisor) * 100) / 100 : 0;
    return {
      id: `${rowId}-hlb-${i}`,
      item,
      quantity,
      unitType: UNIT_TYPES[i] ?? "EA",
      unitCost,
      markupPct,
      amount,
    };
  });
}

export interface HighLevelBudgetItemsTearsheetProps {
  open: boolean;
  onClose: () => void;
  row: CapitalPlanningSampleRow | null;
}

function formatQuantity(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

export function HighLevelBudgetItemsTearsheet({ open, onClose, row }: HighLevelBudgetItemsTearsheetProps) {
  const lines = useMemo(
    () => (row ? sampleHighLevelBudgetLines(row.id, row.plannedAmount) : []),
    [row]
  );
  const total = useMemo(() => lines.reduce((s, l) => s + l.amount, 0), [lines]);

  return (
    <Tearsheet open={open} onClose={onClose} placement="right" block aria-label="High level budget items">
      {row ? (
        <Page style={{ height: "100%" }}>
          <Page.Main style={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <Page.Header>
              <Page.Title>
                <Typography intent="h2" style={{ fontWeight: 700, color: "#232729", display: "block" }}>
                  High Level Budget Items
                </Typography>
              </Page.Title>
            </Page.Header>
            <Page.Body style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
              <Table.Container>
                <Table>
                  <Table.Header>
                    <Table.HeaderRow>
                      <Table.HeaderCell>Items</Table.HeaderCell>
                      <Table.HeaderCell>Quantity</Table.HeaderCell>
                      <Table.HeaderCell>Unit Type</Table.HeaderCell>
                      <Table.HeaderCell>Unit Cost</Table.HeaderCell>
                      <Table.HeaderCell>% Markup</Table.HeaderCell>
                      <Table.HeaderCell>Amount</Table.HeaderCell>
                    </Table.HeaderRow>
                  </Table.Header>
                  <Table.Body>
                    {lines.map((line) => (
                      <Table.BodyRow key={line.id}>
                        <Table.BodyCell>
                          <Table.TextCell>{line.item}</Table.TextCell>
                        </Table.BodyCell>
                        <Table.BodyCell>
                          <Table.TextCell>{formatQuantity(line.quantity)}</Table.TextCell>
                        </Table.BodyCell>
                        <Table.BodyCell>
                          <Table.TextCell>{line.unitType}</Table.TextCell>
                        </Table.BodyCell>
                        <Table.BodyCell>
                          <Table.CurrencyCell value={line.unitCost} />
                        </Table.BodyCell>
                        <Table.BodyCell>
                          <Table.TextCell>{`${line.markupPct.toFixed(1)}%`}</Table.TextCell>
                        </Table.BodyCell>
                        <Table.BodyCell>
                          <Table.CurrencyCell value={line.amount} />
                        </Table.BodyCell>
                      </Table.BodyRow>
                    ))}
                    <Table.BodyRow>
                      <Table.BodyCell colSpan={5}>
                        <Table.TextCell>
                          <Typography intent="small" weight="bold">
                            Total (rolled to planned amount)
                          </Typography>
                        </Table.TextCell>
                      </Table.BodyCell>
                      <Table.BodyCell>
                        <Table.CurrencyCell value={total} />
                      </Table.BodyCell>
                    </Table.BodyRow>
                  </Table.Body>
                </Table>
              </Table.Container>
            </Page.Body>
            <Page.Footer>
              <Box style={{ display: "flex", justifyContent: "flex-end", padding: "16px 24px" }}>
                <Button variant="primary" onClick={onClose}>
                  Done
                </Button>
              </Box>
            </Page.Footer>
          </Page.Main>
        </Page>
      ) : null}
    </Tearsheet>
  );
}
