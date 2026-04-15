import { useMemo } from "react";
import { DetailPage } from "@procore/core-react";
import { SmartGridWrapper } from "@/components/SmartGrid";
import type { ColDef } from "ag-grid-community";
import CostActionsCellRenderer from "@/components/SmartGrid/CostActionsCellRenderer";

export interface TableCardColumn {
  key: string;
  label: string;
}

export interface TableCardRow {
  [key: string]: string | number;
}

interface TableCardProps {
  heading: string;
  columns: TableCardColumn[];
  rows: TableCardRow[];
  navigationLabel?: string;
}

const actionsColDef: ColDef = {
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
};

export default function TableCard({
  heading,
  columns,
  rows,
  navigationLabel,
}: TableCardProps) {
  const columnDefs: ColDef[] = useMemo(
    () => [
      ...columns.map((col, i) => ({
        field: col.key,
        headerName: col.label,
        ...(i === 0 ? { width: 100 } : { minWidth: 120 }),
      })),
      actionsColDef,
    ],
    [columns]
  );

  return (
    <DetailPage.Card navigationLabel={navigationLabel}>
      <DetailPage.Section heading={heading}>
        <SmartGridWrapper
          id={`table-card-${heading.toLowerCase().replace(/\s+/g, "-")}`}
          columnDefs={columnDefs}
          rowData={rows}
          height={400}
          sideBar={false}
        />
      </DetailPage.Section>
    </DetailPage.Card>
  );
}
