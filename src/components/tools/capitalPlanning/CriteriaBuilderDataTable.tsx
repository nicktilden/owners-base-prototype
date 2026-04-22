import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Box, Button, EmptyState, Table, Typography } from "@procore/core-react";
import { Clear, Pencil, Plus, Trash } from "@procore/core-icons";
import styled from "styled-components";

/** Criteria always use dropdown-style rule options (no separate input type in the UI). */
export type CriteriaBuilderInputType = "dropdown";

export interface CriteriaRuleOption {
  id: string;
  label: string;
  /** Whole number 0–10 as typed string */
  value: string;
}

export interface CriteriaBuilderRow {
  id: string;
  criteria: string;
  description: string;
  inputType: CriteriaBuilderInputType;
  criteriaRuleOptions: CriteriaRuleOption[];
  /** Whole percent 0–100 as typed string */
  scoringWeightPercent: string;
}

const OptionsPanelBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1400;
  background: hsla(200, 10%, 15%, 0.4);
`;

const OptionsPanelAside = styled.aside`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 1410;
  width: min(520px, 100vw);
  display: flex;
  flex-direction: column;
  background: var(--color-surface-primary);
  border-left: 1px solid var(--color-border-separator);
  box-shadow: -4px 0 24px hsla(200, 10%, 15%, 0.12);
  box-sizing: border-box;
`;

/** Horizontal scroll so Option Label / Value / Delete columns stay usable in the drawer. */
const OptionsPanelTableScroll = styled.div`
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

const OptionsPanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border-separator);
  flex-shrink: 0;
`;

const OptionsPanelTitle = styled.span`
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
  color: var(--color-text-primary);
`;

const OptionsPanelBody = styled.div`
  flex: 1;
  overflow: auto;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
`;

const OptionsTableFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  box-sizing: border-box;
  margin: 0;
  padding: 10px 12px 12px;
  border-top: 1px solid var(--color-border-separator);
  background: var(--color-surface-secondary);
`;

const OptionsPanelFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 12px 16px;
  border-top: 1px solid var(--color-border-separator);
  flex-shrink: 0;
`;

/** Data rows only — footer row keeps its own background. */
const CriteriaBuilderDataRow = styled(Table.BodyRow)`
  & td {
    transition: background-color 120ms ease-out;
  }

  &:hover td {
    background-color: var(--color-surface-hover);
  }
`;

function newRowId(): string {
  return `cb-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function newOptionId(): string {
  return `opt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function emptyOption(): CriteriaRuleOption {
  return { id: newOptionId(), label: "", value: "" };
}

function emptyRow(): CriteriaBuilderRow {
  return {
    id: newRowId(),
    criteria: "",
    description: "",
    inputType: "dropdown",
    criteriaRuleOptions: [],
    scoringWeightPercent: "",
  };
}

function cloneOptions(opts: CriteriaRuleOption[]): CriteriaRuleOption[] {
  return opts.map((o) => ({ ...o, id: o.id || newOptionId() }));
}

function clampValue0to10(raw: string): string {
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n)) return "0";
  return String(Math.min(10, Math.max(0, n)));
}

function sumScoringWeightPercents(rows: CriteriaBuilderRow[]): number {
  let sum = 0;
  for (const r of rows) {
    const n = parseFloat(r.scoringWeightPercent);
    if (Number.isFinite(n)) sum += n;
  }
  return sum;
}

/** Rounds to cents for display; drops trailing zeros (e.g. 37.5 not 37.50). */
function formatScoringWeightTotal(sum: number): string {
  const rounded = Math.round(sum * 100) / 100;
  if (!Number.isFinite(rounded)) return "0";
  return String(parseFloat(rounded.toFixed(2)));
}

const WEIGHT_TOTAL_TOLERANCE = 0.01;

/**
 * Starter rubric for an owner-operator ranking discretionary capital (TI, spec suites,
 * base-building, parking, amenities). Weights total 100%. Values on options are 0–10 scores.
 */
export const OWNER_OPERATOR_CRITERIA_BUILDER_SEED: readonly CriteriaBuilderRow[] = [
  {
    id: "cb-oo-financial",
    criteria: "Risk-adjusted return",
    description:
      "Underwritten NPV, IRR, or simple payback after reserves, leasing costs, and contingency—how the project clears your capital hurdle.",
    inputType: "dropdown",
    criteriaRuleOptions: [
      { id: "cb-oo-financial-o1", label: "Below hurdle / negative", value: "2" },
      { id: "cb-oo-financial-o2", label: "At hurdle with thin margin", value: "5" },
      { id: "cb-oo-financial-o3", label: "Comfortably clears hurdle", value: "7" },
      { id: "cb-oo-financial-o4", label: "Top-quartile return", value: "9" },
      { id: "cb-oo-financial-o5", label: "Exceptional / strategic premium", value: "10" },
    ],
    scoringWeightPercent: "25",
  },
  {
    id: "cb-oo-strategic",
    criteria: "Strategic portfolio fit",
    description:
      "Alignment with market plan, anchor strategy, hold period, and where this asset sits in the portfolio (core vs value-add).",
    inputType: "dropdown",
    criteriaRuleOptions: [
      { id: "cb-oo-strategic-o1", label: "Outside stated strategy", value: "2" },
      { id: "cb-oo-strategic-o2", label: "Opportunistic / one-off", value: "4" },
      { id: "cb-oo-strategic-o3", label: "Supports portfolio plan", value: "6" },
      { id: "cb-oo-strategic-o4", label: "Priority market or asset", value: "8" },
      { id: "cb-oo-strategic-o5", label: "Flagship / anchor initiative", value: "10" },
    ],
    scoringWeightPercent: "20",
  },
  {
    id: "cb-oo-market-risk",
    criteria: "Market & entitlement risk",
    description:
      "Leasing risk, rent growth assumptions, approvals, easements, and exposure if timelines slip.",
    inputType: "dropdown",
    criteriaRuleOptions: [
      { id: "cb-oo-market-o1", label: "Low — entitled path, stable demand", value: "9" },
      { id: "cb-oo-market-o2", label: "Moderate — some contingencies", value: "5" },
      { id: "cb-oo-market-o3", label: "High — rezoning, lease-up, or volatile submarket", value: "2" },
    ],
    scoringWeightPercent: "18",
  },
  {
    id: "cb-oo-noi",
    criteria: "Revenue & NOI impact",
    description:
      "Stabilized rent roll, renewal rates, downtime, and incremental NOI or yield on cost your asset management team expects.",
    inputType: "dropdown",
    criteriaRuleOptions: [
      { id: "cb-oo-noi-o1", label: "Limited incremental NOI", value: "3" },
      { id: "cb-oo-noi-o2", label: "Modest uplift", value: "5" },
      { id: "cb-oo-noi-o3", label: "Meaningful stabilized impact", value: "7" },
      { id: "cb-oo-noi-o4", label: "Material to portfolio yield", value: "9" },
      { id: "cb-oo-noi-o5", label: "Transformative revenue profile", value: "10" },
    ],
    scoringWeightPercent: "15",
  },
  {
    id: "cb-oo-building",
    criteria: "Building condition & compliance",
    description:
      "Life-safety, code, insurance, accessibility, and near-term capex exposure after the project.",
    inputType: "dropdown",
    criteriaRuleOptions: [
      { id: "cb-oo-building-o1", label: "Critical deferred items", value: "2" },
      { id: "cb-oo-building-o2", label: "Baseline maintained", value: "5" },
      { id: "cb-oo-building-o3", label: "Modern systems; low near-term risk", value: "8" },
      { id: "cb-oo-building-o4", label: "Materially extends useful life", value: "10" },
    ],
    scoringWeightPercent: "12",
  },
  {
    id: "cb-oo-disruption",
    criteria: "Operations & schedule disruption",
    description:
      "Tenant experience, revenue loss during work, parking/loading impacts, and confidence in delivery dates.",
    inputType: "dropdown",
    criteriaRuleOptions: [
      { id: "cb-oo-disruption-o1", label: "Minimal — phased or off-hours", value: "9" },
      { id: "cb-oo-disruption-o2", label: "Manageable interruptions", value: "6" },
      { id: "cb-oo-disruption-o3", label: "Material outage or revenue impact", value: "3" },
    ],
    scoringWeightPercent: "10",
  },
];

export function cloneCriteriaBuilderRows(source: readonly CriteriaBuilderRow[]): CriteriaBuilderRow[] {
  return source.map((r) => ({
    ...r,
    criteriaRuleOptions: r.criteriaRuleOptions.map((o) => ({ ...o })),
  }));
}

export type CriteriaBuilderSaveValidation =
  | { ok: true }
  | { ok: false; message: string };

export interface CriteriaBuilderDataTableHandle {
  validateForSave: () => CriteriaBuilderSaveValidation;
}

export interface CriteriaBuilderDataTableProps {
  /** Called whenever criteria rows change (e.g. clear a stale save error in the parent). */
  onRowsChange?: () => void;
  /** Controlled mode: parent owns rows (Future route — shared with Prioritization grid). */
  rows?: CriteriaBuilderRow[];
  onRowsCommit?: React.Dispatch<React.SetStateAction<CriteriaBuilderRow[]>>;
}

function countLabeledOptions(row: CriteriaBuilderRow): number {
  return row.criteriaRuleOptions.filter((o) => o.label.trim() !== "").length;
}

function validateCriteriaBuilderForSave(rows: CriteriaBuilderRow[]): CriteriaBuilderSaveValidation {
  if (rows.length === 0) return { ok: true };
  for (const r of rows) {
    if (countLabeledOptions(r) < 1) {
      const name = r.criteria.trim() || "Untitled criterion";
      return {
        ok: false,
        message: `Each criterion must include at least one option with a label. Add options for “${name}”.`,
      };
    }
  }
  const sum = sumScoringWeightPercents(rows);
  if (Math.abs(sum - 100) < WEIGHT_TOTAL_TOLERANCE) return { ok: true };
  return {
    ok: false,
    message: `Scoring weights must total 100%. Current total is ${formatScoringWeightTotal(sum)}%.`,
  };
}

/** Criteria Builder tab — editable criteria table (prototype). */
export const CriteriaBuilderDataTable = forwardRef<CriteriaBuilderDataTableHandle, CriteriaBuilderDataTableProps>(
  function CriteriaBuilderDataTable({ onRowsChange, rows: rowsProp, onRowsCommit }, ref) {
  const isControlled = rowsProp !== undefined && onRowsCommit !== undefined;
  const [uncontrolledRows, setUncontrolledRows] = useState<CriteriaBuilderRow[]>(() =>
    cloneCriteriaBuilderRows(OWNER_OPERATOR_CRITERIA_BUILDER_SEED)
  );
  const rows = isControlled ? rowsProp : uncontrolledRows;
  const setRows: React.Dispatch<React.SetStateAction<CriteriaBuilderRow[]>> = useCallback(
    (action) => {
      if (isControlled) {
        onRowsCommit!(action);
      } else {
        setUncontrolledRows(action);
      }
    },
    [isControlled, onRowsCommit]
  );
  const [optionsPanelRowId, setOptionsPanelRowId] = useState<string | null>(null);
  const [draftOptions, setDraftOptions] = useState<CriteriaRuleOption[]>([]);

  useImperativeHandle(
    ref,
    () => ({
      validateForSave: () => validateCriteriaBuilderForSave(rows),
    }),
    [rows]
  );

  useEffect(() => {
    onRowsChange?.();
  }, [rows, onRowsChange]);

  useEffect(() => {
    if (!optionsPanelRowId) return;
    const row = rows.find((r) => r.id === optionsPanelRowId);
    if (!row) {
      setOptionsPanelRowId(null);
      setDraftOptions([]);
      return;
    }
  }, [optionsPanelRowId, rows]);

  const optionsPanelRowIdRef = useRef<string | null>(null);
  optionsPanelRowIdRef.current = optionsPanelRowId;

  const openOptionsPanel = useCallback((rowId: string) => {
    const row = rows.find((r) => r.id === rowId);
    const initial = row?.criteriaRuleOptions?.length
      ? cloneOptions(row.criteriaRuleOptions)
      : [emptyOption()];
    setDraftOptions(initial);
    setOptionsPanelRowId(rowId);
  }, [rows]);

  const closeOptionsPanel = useCallback(() => {
    setOptionsPanelRowId(null);
    setDraftOptions([]);
  }, []);

  useEffect(() => {
    if (!optionsPanelRowId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeOptionsPanel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [optionsPanelRowId, closeOptionsPanel]);

  const updateRow = useCallback((id: string, patch: Partial<CriteriaBuilderRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const addRow = useCallback(() => {
    setRows((prev) => [...prev, emptyRow()]);
  }, []);

  const removeRow = useCallback((id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
    if (optionsPanelRowIdRef.current === id) {
      setOptionsPanelRowId(null);
      setDraftOptions([]);
    }
  }, []);

  const addDraftOption = useCallback(() => {
    setDraftOptions((prev) => [...prev, emptyOption()]);
  }, []);

  const updateDraftOption = useCallback((optionId: string, patch: Partial<CriteriaRuleOption>) => {
    setDraftOptions((prev) => prev.map((o) => (o.id === optionId ? { ...o, ...patch } : o)));
  }, []);

  const removeDraftOption = useCallback((optionId: string) => {
    setDraftOptions((prev) => prev.filter((o) => o.id !== optionId));
  }, []);

  const handleSaveOptions = useCallback(() => {
    if (!optionsPanelRowId) return;
    const normalized = draftOptions
      .map((o) => ({
        id: o.id || newOptionId(),
        label: o.label.trim(),
        value: clampValue0to10(o.value === "" ? "0" : o.value),
      }))
      .filter((o) => o.label !== "");
    if (normalized.length < 1) return;
    updateRow(optionsPanelRowId, { criteriaRuleOptions: normalized });
    closeOptionsPanel();
  }, [optionsPanelRowId, draftOptions, updateRow, closeOptionsPanel]);

  const draftOptionsHasValidOption = useMemo(
    () => draftOptions.some((o) => o.label.trim() !== ""),
    [draftOptions]
  );

  const scoringWeightTotalLabel = useMemo(() => {
    const sum = sumScoringWeightPercents(rows);
    return `Total: ${formatScoringWeightTotal(sum)}%`;
  }, [rows]);

  return (
    <div style={{ minWidth: 0, width: "100%" }}>
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
        {rows.length === 0 ? (
          <Box
            role="region"
            aria-labelledby="criteria-builder-empty-state-title"
            style={{
              padding: "48px 24px",
              boxSizing: "border-box",
            }}
          >
            <EmptyState
              size="lg"
              style={{
                maxWidth: 400,
                width: "100%",
                margin: "0 auto",
                position: "relative",
              }}
            >
              <EmptyState.NoItems />
              <EmptyState.Title id="criteria-builder-empty-state-title">
                Add Scoring Criteria to Get Started
              </EmptyState.Title>
              <EmptyState.Description as="p">
                Create a custom rubric with criterion names, scoring weights, and rule options (each criterion needs at
                least one option). Your criteria appear in the table once you add the first row.
              </EmptyState.Description>
              <EmptyState.Actions>
                <Button type="button" variant="primary" icon={<Plus />} onClick={addRow}>
                  Add Criteria
                </Button>
              </EmptyState.Actions>
            </EmptyState>
          </Box>
        ) : (
          <Table.Container>
            <Table>
              <Table.Header>
                <Table.HeaderRow>
                  <Table.HeaderCell style={{ minWidth: 160 }}>Criteria</Table.HeaderCell>
                  <Table.HeaderCell style={{ minWidth: 220 }}>Description</Table.HeaderCell>
                  <Table.HeaderCell
                    style={{
                      minWidth: 200,
                      boxSizing: "border-box",
                      paddingLeft: 16,
                      paddingRight: 16,
                    }}
                  >
                    Criteria options
                  </Table.HeaderCell>
                  <Table.HeaderCell style={{ minWidth: 120 }}>% Weight</Table.HeaderCell>
                  <Table.HeaderCell scope="col" style={{ width: 48 }} aria-label="Delete criteria" />
                </Table.HeaderRow>
              </Table.Header>
              <Table.Body>
                {rows.map((row) => {
                const nOpts = row.criteriaRuleOptions.filter((o) => o.label.trim() !== "").length;
                return (
                  <CriteriaBuilderDataRow key={row.id}>
                    <Table.BodyCell style={{ verticalAlign: "top" }}>
                      <Table.InputCell
                        size="block"
                        type="text"
                        autoComplete="off"
                        value={row.criteria}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updateRow(row.id, { criteria: e.target.value })
                        }
                        aria-label={`Criteria name for row ${row.id}`}
                        placeholder="Enter criteria"
                      />
                    </Table.BodyCell>
                    <Table.BodyCell style={{ verticalAlign: "top" }}>
                      <Table.InputCell
                        size="block"
                        type="text"
                        autoComplete="off"
                        value={row.description}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updateRow(row.id, { description: e.target.value })
                        }
                        aria-label={`Description for row ${row.id}`}
                        placeholder="Enter description"
                      />
                    </Table.BodyCell>
                    <Table.BodyCell
                      style={{
                        verticalAlign: "middle",
                        boxSizing: "border-box",
                        paddingTop: 12,
                        paddingBottom: 12,
                        paddingLeft: 16,
                        paddingRight: 16,
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          icon={nOpts > 0 ? <Pencil /> : <Plus />}
                          onClick={() => openOptionsPanel(row.id)}
                          aria-label={
                            nOpts > 0 ? `Edit criteria options, row ${row.id}` : `Add criteria options, row ${row.id}`
                          }
                        >
                          {nOpts > 0 ? "Edit" : "Add Options"}
                        </Button>
                      </div>
                    </Table.BodyCell>
                    <Table.BodyCell style={{ verticalAlign: "top" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 0, maxWidth: 120 }}>
                        <div style={{ flex: "1 1 auto", minWidth: 0, maxWidth: 88 }}>
                          <Table.InputCell
                            size="block"
                            type="text"
                            inputMode="decimal"
                            autoComplete="off"
                            value={row.scoringWeightPercent}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const raw = e.target.value.replace(/[^\d.]/g, "");
                              const parts = raw.split(".");
                              const next =
                                parts.length > 2
                                  ? `${parts[0]}.${parts.slice(1).join("").replace(/\./g, "")}`
                                  : raw;
                              updateRow(row.id, { scoringWeightPercent: next });
                            }}
                            onBlur={() => {
                              const n = parseFloat(row.scoringWeightPercent);
                              if (Number.isFinite(n)) {
                                const clamped = Math.min(100, Math.max(0, n));
                                updateRow(row.id, {
                                  scoringWeightPercent: String(clamped),
                                });
                              }
                            }}
                            aria-label={`% weight for row ${row.id}`}
                            placeholder="0"
                          />
                        </div>
                        <Typography intent="small" as="span" style={{ flexShrink: 0 }}>
                          %
                        </Typography>
                      </div>
                    </Table.BodyCell>
                    <Table.BodyCell style={{ verticalAlign: "middle" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        <Button
                          type="button"
                          variant="tertiary"
                          size="sm"
                          icon={<Trash />}
                          onClick={() => removeRow(row.id)}
                          aria-label="Delete criteria"
                        />
                      </div>
                    </Table.BodyCell>
                  </CriteriaBuilderDataRow>
                );
              })}
              <Table.BodyRow
                key="criteria-builder-table-footer"
                style={{ background: "var(--color-surface-secondary)" }}
              >
                <Table.BodyCell
                  colSpan={3}
                  style={{
                    verticalAlign: "middle",
                    padding: "10px 12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", minHeight: 32 }}>
                    <Button
                      type="button"
                      variant="secondary"
                      className="b_secondary"
                      size="sm"
                      icon={<Plus />}
                      onClick={addRow}
                    >
                      Add Criteria
                    </Button>
                  </div>
                </Table.BodyCell>
                <Table.BodyCell style={{ verticalAlign: "middle", padding: "10px 12px" }}>
                  <Typography intent="body" weight="semibold" as="span">
                    {scoringWeightTotalLabel}
                  </Typography>
                </Table.BodyCell>
                <Table.BodyCell style={{ verticalAlign: "middle", padding: "10px 12px" }} />
              </Table.BodyRow>
            </Table.Body>
          </Table>
        </Table.Container>
        )}
      </div>

      {optionsPanelRowId ? (
        <>
          <OptionsPanelBackdrop role="presentation" aria-hidden onClick={closeOptionsPanel} />
          <OptionsPanelAside role="dialog" aria-modal="true" aria-labelledby="criteria-options-panel-title">
            <OptionsPanelHeader>
              <OptionsPanelTitle id="criteria-options-panel-title">Add Criteria Rule Options</OptionsPanelTitle>
              <Button
                type="button"
                variant="tertiary"
                className="b_tertiary"
                icon={<Clear />}
                onClick={closeOptionsPanel}
                aria-label="Close options panel"
              />
            </OptionsPanelHeader>
            <OptionsPanelBody>
              <div
                style={{
                  border: "1px solid var(--color-border-separator)",
                  borderRadius: 8,
                  background: "var(--color-surface-primary)",
                  overflow: "hidden",
                  minWidth: 0,
                }}
              >
                <OptionsPanelTableScroll>
                  <Table.Container style={{ minWidth: 360 }}>
                    <Table>
                    <Table.Header>
                      <Table.HeaderRow>
                        <Table.HeaderCell style={{ minWidth: 160, width: "42%" }}>Option Label</Table.HeaderCell>
                        <Table.HeaderCell style={{ minWidth: 112, width: "28%" }}>Value (0–10)</Table.HeaderCell>
                        <Table.HeaderCell
                          scope="col"
                          style={{ minWidth: 52, width: 52, maxWidth: 52 }}
                          aria-label="Delete option"
                        />
                      </Table.HeaderRow>
                    </Table.Header>
                    <Table.Body>
                      {draftOptions.length === 0 ? (
                        <Table.BodyRow key="criteria-options-draft-empty">
                          <Table.BodyCell colSpan={3} style={{ verticalAlign: "middle", padding: "12px 16px" }}>
                            <Typography intent="small" style={{ color: "var(--color-text-secondary)" }}>
                              No options yet. Use Add Options below to add one.
                            </Typography>
                          </Table.BodyCell>
                        </Table.BodyRow>
                      ) : null}
                      {draftOptions.map((opt) => (
                        <Table.BodyRow key={opt.id}>
                          <Table.BodyCell style={{ verticalAlign: "top" }}>
                            <Table.InputCell
                              size="block"
                              type="text"
                              autoComplete="off"
                              value={opt.label}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                updateDraftOption(opt.id, { label: e.target.value })
                              }
                              aria-label="Option label"
                              placeholder="Enter label"
                            />
                          </Table.BodyCell>
                          <Table.BodyCell style={{ verticalAlign: "top" }}>
                            <Table.InputCell
                              size="block"
                              type="text"
                              inputMode="numeric"
                              autoComplete="off"
                              value={opt.value}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const d = e.target.value.replace(/\D/g, "").slice(0, 2);
                                if (d === "") {
                                  updateDraftOption(opt.id, { value: "" });
                                  return;
                                }
                                const n = parseInt(d, 10);
                                if (!Number.isFinite(n)) {
                                  updateDraftOption(opt.id, { value: "" });
                                  return;
                                }
                                updateDraftOption(opt.id, { value: String(Math.min(10, n)) });
                              }}
                              onBlur={() => {
                                const v =
                                  opt.value.trim() === "" ? "" : clampValue0to10(opt.value);
                                updateDraftOption(opt.id, { value: v });
                              }}
                              aria-label="Value from 0 to 10"
                              placeholder="0"
                            />
                          </Table.BodyCell>
                          <Table.BodyCell style={{ verticalAlign: "middle" }}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                width: "100%",
                              }}
                            >
                              <Button
                                type="button"
                                variant="tertiary"
                                size="sm"
                                icon={<Trash />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeDraftOption(opt.id);
                                }}
                                aria-label="Delete option"
                              />
                            </div>
                          </Table.BodyCell>
                        </Table.BodyRow>
                      ))}
                    </Table.Body>
                  </Table>
                </Table.Container>
                </OptionsPanelTableScroll>
                <OptionsTableFooter>
                  <Button type="button" variant="secondary" size="sm" icon={<Plus />} onClick={addDraftOption}>
                    Add Options
                  </Button>
                </OptionsTableFooter>
              </div>
            </OptionsPanelBody>
            <OptionsPanelFooter>
              <Button type="button" variant="tertiary" className="b_tertiary" onClick={closeOptionsPanel}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleSaveOptions}
                disabled={!draftOptionsHasValidOption}
              >
                Save
              </Button>
            </OptionsPanelFooter>
          </OptionsPanelAside>
        </>
      ) : null}
    </div>
  );
  }
);

CriteriaBuilderDataTable.displayName = "CriteriaBuilderDataTable";
