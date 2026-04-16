import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Button,
  Dropdown,
  Search,
  Select,
  SplitViewCard,
} from "@procore/core-react";
import {
  ChartBar as BudgetIcon,
  Plus,
} from "@procore/core-icons";
import type { ColDef, GridApi, ValueFormatterParams, ValueGetterParams } from "ag-grid-community";
import styled from "styled-components";
import { SmartGridWrapper } from "@/components/SmartGrid";
import CostActionsCellRenderer from "@/components/SmartGrid/CostActionsCellRenderer";
import { budgetLineItems } from "@/data/seed/budget";
import { projects } from "@/data/seed/projects";
import type { BudgetLineItem } from "@/types/budget";
import { calculateBudget } from "@/types/budget";
import ToolPageLayout from "@/components/tools/ToolPageLayout";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n === 0) return "$0";
  if (Math.abs(n) >= 1_000_000) {
    return `$${(n / 1_000_000).toFixed(2)}M`;
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

const COST_TYPE_LABELS: Record<string, string> = {
  L: "Labor",
  M: "Material",
  E: "Equipment",
  S: "Subcontract",
  P: "Professional Fees",
  F: "Permits",
  I: "Insurance",
  C: "Contingency",
  O: "Overhead",
};

const PROGRAM_LABELS: Record<string, string> = {
  AC: "Acute Care",
  OP: "Outpatient",
  RE: "Research",
  FA: "Facilities",
};

// ─── Styled components ────────────────────────────────────────────────────────

const ToolbarRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 8px;
  gap: 8px;
  background: #fff;
`;

const ToolbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const GridArea = styled.div`
  display: flex;
  height: 640px;
  border: 1px solid #E0E4E7;
  overflow: hidden;
`;

// ─── Component ────────────────────────────────────────────────────────────────

interface BudgetContentProps {
  projectId: string;
}

export default function BudgetContent({ projectId }: BudgetContentProps) {
  const isPortfolio = projectId === "";
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const gridApiRef = useRef<GridApi<BudgetLineItem> | null>(null);

  const project = useMemo(() => projects.find((p) => p.id === projectId), [projectId]);
  const projectLabel = project ? `${project.number} ${project.name}` : projectId;
  const projectMap = useMemo(() => {
    const m = new Map<string, string>();
    projects.forEach((p) => m.set(p.id, `${p.number} ${p.name}`));
    return m;
  }, []);
  const projectOptions = useMemo(() => {
    const ids = new Set(budgetLineItems.map((b) => b.projectId));
    return projects.filter((p) => ids.has(p.id));
  }, []);

  const rowData = useMemo<BudgetLineItem[]>(() => {
    let base = isPortfolio
      ? [...budgetLineItems]
      : budgetLineItems.filter((b) => b.projectId === projectId);
    if (isPortfolio && selectedProjectIds.length > 0) {
      base = base.filter((b) => selectedProjectIds.includes(b.projectId));
    }
    return base;
  }, [projectId, isPortfolio, selectedProjectIds]);

  const columnDefs = useMemo<ColDef<BudgetLineItem>[]>(() => {
    const cols: ColDef<BudgetLineItem>[] = [];

    if (isPortfolio) {
      cols.push({
        colId: "project",
        headerName: "Project",
        minWidth: 180,
        filter: "agSetColumnFilter",
        valueGetter: (params: ValueGetterParams<BudgetLineItem>) =>
          params.data ? (projectMap.get(params.data.projectId) ?? params.data.projectId) : "",
        cellStyle: { color: "#1d5cc9", cursor: "pointer" },
      });
    }

    cols.push(
      {
        field: "programCode",
        headerName: "Program",
        filter: "agSetColumnFilter",
        valueFormatter: (params: ValueFormatterParams<BudgetLineItem>) =>
          PROGRAM_LABELS[params.value] ?? params.value ?? "",
      },
      {
        field: "costTypeCode",
        headerName: "Cost Type",
        filter: "agSetColumnFilter",
        valueFormatter: (params: ValueFormatterParams<BudgetLineItem>) =>
          COST_TYPE_LABELS[params.value] ?? params.value ?? "",
      },
      {
        field: "costCode",
        headerName: "Cost Code",
        width: 120,
        filter: "agTextColumnFilter",
        cellStyle: { color: "#6a767c", fontSize: "13px" },
      },
      {
        field: "originalBudgetAmount",
        headerName: "Original Budget",
        filter: "agNumberColumnFilter",
        type: "rightAligned",
        aggFunc: "sum",
        valueFormatter: (params: ValueFormatterParams<BudgetLineItem>) =>
          formatCurrency(params.value),
      },
      {
        field: "approvedCOs",
        headerName: "Approved COs",
        filter: "agNumberColumnFilter",
        type: "rightAligned",
        aggFunc: "sum",
        valueFormatter: (params: ValueFormatterParams<BudgetLineItem>) =>
          formatCurrency(params.value),
      },
      {
        colId: "revisedBudget",
        headerName: "Revised Budget",
        filter: "agNumberColumnFilter",
        type: "rightAligned",
        aggFunc: "sum",
        valueGetter: (params: ValueGetterParams<BudgetLineItem>) => {
          if (!params.data) return 0;
          return calculateBudget(params.data).revisedBudget;
        },
        valueFormatter: (params: ValueFormatterParams) =>
          formatCurrency(params.value),
        cellStyle: { fontWeight: 600 },
      },
      {
        field: "committedCosts",
        headerName: "Committed Costs",
        filter: "agNumberColumnFilter",
        type: "rightAligned",
        aggFunc: "sum",
        valueFormatter: (params: ValueFormatterParams<BudgetLineItem>) =>
          formatCurrency(params.value),
      },
      {
        field: "directCosts",
        headerName: "Direct Costs",
        filter: "agNumberColumnFilter",
        type: "rightAligned",
        aggFunc: "sum",
        valueFormatter: (params: ValueFormatterParams<BudgetLineItem>) =>
          formatCurrency(params.value),
      },
      {
        colId: "overUnder",
        headerName: "Over / Under",
        filter: "agNumberColumnFilter",
        type: "rightAligned",
        aggFunc: "sum",
        valueGetter: (params: ValueGetterParams<BudgetLineItem>) => {
          if (!params.data) return 0;
          return calculateBudget(params.data).projectedOverUnder;
        },
        valueFormatter: (params: ValueFormatterParams) =>
          formatCurrency(params.value),
        cellStyle: (params) => {
          const base = { fontWeight: 600 as const };
          if (params.value > 0) return { ...base, color: "#1a7d3a" };
          if (params.value < 0) return { ...base, color: "#b91c1c" };
          return base;
        },
      },
      {
        colId: "actions",
        headerName: "Actions",
        width: 90,
        minWidth: 90,
        maxWidth: 90,
        resizable: false,
        sortable: false,
        filter: false,
        suppressMovable: true,
        suppressHeaderMenuButton: true,
        pinned: "right",
        cellRenderer: CostActionsCellRenderer,
        lockPosition: true,
      }
    );

    return cols;
  }, [isPortfolio, projectMap]);

  const getRowId = useCallback(
    (params: { data: BudgetLineItem }) => params.data.id,
    []
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchText(value);
      gridApiRef.current?.setGridOption("quickFilterText", value);
    },
    []
  );

  const handleSearchClear = useCallback(() => {
    setSearchText("");
    gridApiRef.current?.setGridOption("quickFilterText", "");
  }, []);


  const actions = (
    <>
      <Dropdown label="Export" variant="secondary">
        <Dropdown.Item item="csv">CSV</Dropdown.Item>
        <Dropdown.Item item="excel">Excel</Dropdown.Item>
      </Dropdown>
      <Button variant="primary" icon={<Plus />}>Add Line Item</Button>
    </>
  );

  return (
    <ToolPageLayout
      title="Budget"
      icon={<BudgetIcon size="md" />}
      actions={actions}
    >
      <SplitViewCard>
        <SplitViewCard.Main>
          <SplitViewCard.Section heading="Budget">
            <ToolbarRow>
              <ToolbarLeft>
                <div style={{ maxWidth: 260 }}>
                  <Search
                    placeholder="Search"
                    value={searchText}
                    onChange={handleSearchChange}
                    onClear={handleSearchClear}
                  />
                </div>
                {isPortfolio && (
                  <div style={{ width: 260 }}>
                    <Select
                      placeholder="Filter by project"
                      label={selectedProjectIds.length ? `${selectedProjectIds.length} selected` : undefined}
                      onSelect={(s) => {
                        const id = s.item as string;
                        setSelectedProjectIds((prev) =>
                          prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                        );
                      }}
                      onClear={() => setSelectedProjectIds([])}
                      block
                    >
                      {projectOptions.map((p) => (
                        <Select.Option key={p.id} value={p.id} selected={selectedProjectIds.includes(p.id)}>
                          {p.number} {p.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                )}
              </ToolbarLeft>
            </ToolbarRow>

            <GridArea>
              <div style={{ flex: 1, minWidth: 0 }}>
                <SmartGridWrapper<BudgetLineItem>
                  id="budget-grid"
                  localStorageKey="owner-prototype-budget-grid"
                  height="100%"
                  rowData={rowData}
                  columnDefs={columnDefs}
                  getRowId={getRowId}
                  sideBar={false}
                  grandTotalRow="bottom"
                  onGridReady={(event) => {
                    gridApiRef.current = event.api;
                  }}
                  statusBar={{
                    statusPanels: [
                      { statusPanel: "agTotalAndFilteredRowCountComponent", align: "left" },
                      { statusPanel: "agSelectedRowCountComponent", align: "left" },
                    ],
                  }}
                />
              </div>
            </GridArea>
          </SplitViewCard.Section>
        </SplitViewCard.Main>
      </SplitViewCard>
    </ToolPageLayout>
  );
}
