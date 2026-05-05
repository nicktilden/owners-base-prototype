import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Checkbox, Search, Typography } from "@procore/core-react";
import { ChevronDown, ChevronRight, Connect } from "@procore/core-icons";
import type { GridApi } from "ag-grid-community";
import styled from "styled-components";

const PanelWrapper = styled.div<{ $open: boolean }>`
  width: ${({ $open }) => ($open ? "400px" : "0px")};
  min-width: ${({ $open }) => ($open ? "400px" : "0px")};
  overflow: hidden;
  transition: width 0.25s ease, min-width 0.25s ease;
  border-left: ${({ $open }) => ($open ? "1px solid var(--color-border-separator)" : "none")};
  display: flex;
  flex-direction: column;
  background: var(--color-surface-primary);
  height: 100%;
`;

const PanelInner = styled.div`
  display: flex;
  flex-direction: column;
  width: 400px;
  height: 100%;
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 8px 8px 16px;
  border-bottom: 1px solid var(--color-border-separator);
  flex-shrink: 0;
`;

const PanelSearchRow = styled.div`
  padding: 16px;
  border-bottom: 1px solid var(--color-border-separator);
  flex-shrink: 0;
`;

const PanelBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
`;

const ColumnRow = styled.div`
  display: flex;
  align-items: center;
  padding: 4px 16px;
  gap: 4px;
`;

const ColumnPill = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  background: var(--color-surface-hover);
  border-radius: 4px;
  padding: 4px;
  min-width: 0;
`;

const EnabledCount = styled.span`
  font-family: "Inter", system-ui, sans-serif;
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.25px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  margin-left: auto;
  padding-right: 4px;
`;

const SectionHeaderRow = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 8px 16px 4px;
  background: none;
  border: none;
  border-top: 1px solid var(--color-border-separator);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  &:first-child {
    border-top: none;
  }
`;

const PanelFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 8px 16px;
  border-top: 1px solid var(--color-border-separator);
  flex-shrink: 0;
`;

interface ColumnEntry {
  colId: string;
  headerName: string;
  visible: boolean;
}

/** Optional section grouping. Each section declares which colIds belong to it.
 *  ColIds not matched by any section fall into an implicit "Other" group at the end. */
export interface ConfigureColumnSection {
  label: string;
  colIds: string[];
}

interface ConfigureColumnsPanelProps {
  open: boolean;
  gridApi: GridApi | null;
  onClose: () => void;
  /** Column IDs whose data comes from a connected upstream project — renders a Connect icon next to the name. */
  connectedColIds?: ReadonlySet<string>;
  /** Optional section groupings with collapsible headers. */
  sections?: ConfigureColumnSection[];
}

export default function ConfigureColumnsPanel({
  open,
  gridApi,
  onClose,
  connectedColIds,
  sections,
}: ConfigureColumnsPanelProps) {
  const [columns, setColumns] = useState<ColumnEntry[]>([]);
  const [searchText, setSearchText] = useState("");
  const [pendingChanges, setPendingChanges] = useState<Map<string, boolean>>(new Map());
  // section collapse state: all expanded by default
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const toggleSection = useCallback((label: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label); else next.add(label);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!gridApi || !open) return;
    const EXCLUDED_COL_IDS = new Set([
      "ag-Grid-AutoColumn",
      "ag-Grid-SelectionColumn",
      "connect",
      "actions",
    ]);
    const allCols = gridApi.getColumns() ?? [];
    const entries: ColumnEntry[] = allCols
      .filter((col) => !EXCLUDED_COL_IDS.has(col.getColId()))
      .map((col) => ({
        colId: col.getColId(),
        headerName:
          col.getColDef().headerName ?? col.getColId(),
        visible: col.isVisible(),
      }));
    setColumns(entries);
    setPendingChanges(new Map());
  }, [gridApi, open]);

  const toggleColumn = useCallback((colId: string) => {
    setPendingChanges((prev) => {
      const next = new Map(prev);
      const current = columns.find((c) => c.colId === colId);
      if (!current) return prev;
      const currentVisible = next.has(colId) ? next.get(colId)! : current.visible;
      next.set(colId, !currentVisible);
      return next;
    });
  }, [columns]);

  const getEffectiveVisibility = useCallback(
    (col: ColumnEntry) =>
      pendingChanges.has(col.colId) ? pendingChanges.get(col.colId)! : col.visible,
    [pendingChanges]
  );

  const visibleColumns = useMemo(() => {
    if (!searchText) return columns;
    const q = searchText.toLowerCase();
    return columns.filter((c) => c.headerName.toLowerCase().includes(q));
  }, [columns, searchText]);

  const enabledCount = useMemo(
    () => columns.filter((c) => getEffectiveVisibility(c)).length,
    [columns, getEffectiveVisibility]
  );

  const handleReset = useCallback(() => {
    if (!gridApi) return;
    const allCols = gridApi.getColumns() ?? [];
    const state = allCols.map((col) => ({
      colId: col.getColId(),
      hide: false,
    }));
    gridApi.applyColumnState({ state });
    const entries: ColumnEntry[] = allCols
      .filter((col) => {
        const id = col.getColId();
        return id !== "ag-Grid-AutoColumn" && id !== "ag-Grid-SelectionColumn";
      })
      .map((col) => ({
        colId: col.getColId(),
        headerName: col.getColDef().headerName ?? col.getColId(),
        visible: true,
      }));
    setColumns(entries);
    setPendingChanges(new Map());
  }, [gridApi]);

  const handleApply = useCallback(() => {
    if (!gridApi) return;
    const state = Array.from(pendingChanges.entries()).map(([colId, visible]) => ({
      colId,
      hide: !visible,
    }));
    if (state.length > 0) {
      gridApi.applyColumnState({ state });
    }
    onClose();
  }, [gridApi, pendingChanges, onClose]);

  return (
    <PanelWrapper $open={open}>
      <PanelInner>
        <PanelHeader>
          <Typography
            intent="h3"
            style={{ flex: 1, fontSize: 16, fontWeight: 600, lineHeight: "24px", letterSpacing: "0.15px", color: "var(--color-text-primary)" }}
          >
            Configure Columns
          </Typography>
          <Button variant="tertiary" className="b_tertiary" onClick={handleReset}>
            Reset
          </Button>
        </PanelHeader>

        <PanelSearchRow>
          <Search
            placeholder="Search columns"
            value={searchText}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
            onClear={() => setSearchText("")}
          />
        </PanelSearchRow>

        <PanelBody>
          {sections && sections.length > 0 ? (() => {
            // Build section groups; collect matched colIds to find "leftover" items
            const matchedColIds = new Set(sections.flatMap((s) => s.colIds));
            const grouped = sections.map((sec) => ({
              label: sec.label,
              cols: visibleColumns.filter((c) => sec.colIds.includes(c.colId)),
            })).filter((g) => g.cols.length > 0);
            const ungrouped = visibleColumns.filter((c) => !matchedColIds.has(c.colId));
            const allGroups = [
              ...grouped,
              ...(ungrouped.length > 0 ? [{ label: "Other", cols: ungrouped }] : []),
            ];
            return allGroups.map((group, gi) => (
              <React.Fragment key={group.label}>
                <SectionHeaderRow
                  type="button"
                  onClick={() => toggleSection(group.label)}
                  style={{ borderTop: gi > 0 ? "1px solid var(--color-border-separator)" : "none" }}
                >
                  {collapsedSections.has(group.label)
                    ? <ChevronRight size="sm" style={{ color: "var(--color-text-secondary)", flexShrink: 0 }} />
                    : <ChevronDown size="sm" style={{ color: "var(--color-text-secondary)", flexShrink: 0 }} />
                  }
                  <Typography intent="small" style={{ fontWeight: 600, color: "var(--color-text-secondary)", userSelect: "none" }}>
                    {group.label}
                  </Typography>
                </SectionHeaderRow>
                {!collapsedSections.has(group.label) && group.cols.map((col) => {
                  const checked = getEffectiveVisibility(col);
                  const isConnected = connectedColIds?.has(col.colId) ?? false;
                  return (
                    <ColumnRow key={col.colId}>
                      <ColumnPill>
                        <Checkbox checked={checked} onChange={() => toggleColumn(col.colId)}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                            {col.headerName}
                            {isConnected && <Connect size="sm" style={{ color: "#ff5200", flexShrink: 0 }} aria-label="Connected data" />}
                          </span>
                        </Checkbox>
                        <EnabledCount>{checked ? "show" : "hide"}</EnabledCount>
                      </ColumnPill>
                    </ColumnRow>
                  );
                })}
              </React.Fragment>
            ));
          })() : visibleColumns.map((col) => {
            const checked = getEffectiveVisibility(col);
            const isConnected = connectedColIds?.has(col.colId) ?? false;
            return (
              <ColumnRow key={col.colId}>
                <ColumnPill>
                  <Checkbox
                    checked={checked}
                    onChange={() => toggleColumn(col.colId)}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                      {col.headerName}
                      {isConnected && (
                        <Connect
                          size="sm"
                          style={{ color: "#ff5200", flexShrink: 0 }}
                          aria-label="Connected data"
                        />
                      )}
                    </span>
                  </Checkbox>
                  <EnabledCount>
                    {checked ? "show" : "hide"}
                  </EnabledCount>
                </ColumnPill>
              </ColumnRow>
            );
          })}
        </PanelBody>

        <PanelFooter>
          <span style={{ flex: 1, fontSize: 12, color: "var(--color-text-secondary)" }}>
            {enabledCount}/{columns.length} columns enabled
          </span>
          <Button variant="primary" onClick={handleApply}>
            Apply
          </Button>
        </PanelFooter>
      </PanelInner>
    </PanelWrapper>
  );
}
