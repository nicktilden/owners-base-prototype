import { DetailPage, Table } from "@procore/core-react";
import { PINNED_BODY_CELL_STYLE, PINNED_HEADER_CELL_STYLE, StandardRowActions } from "@/components/table/TableActions";

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

const TABLE_HEADER_CELL_STYLE: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  lineHeight: "16px",
  color: "#232729",
};

export default function TableCard({
  heading,
  columns,
  rows,
  navigationLabel,
}: TableCardProps) {
  return (
    <DetailPage.Card navigationLabel={navigationLabel}>
      <DetailPage.Section heading={heading}>
        <Table.Container>
          <Table>
            <Table.Header>
              <Table.HeaderRow>
                {columns.map((col) => (
                  <Table.HeaderCell key={col.key} style={TABLE_HEADER_CELL_STYLE}>
                    {col.label}
                  </Table.HeaderCell>
                ))}
                <Table.HeaderCell
                  style={{ ...TABLE_HEADER_CELL_STYLE, ...PINNED_HEADER_CELL_STYLE }}
                >
                  Actions
                </Table.HeaderCell>
              </Table.HeaderRow>
            </Table.Header>
            <Table.Body>
              {rows.map((row, i) => (
                <Table.BodyRow key={i}>
                  {columns.map((col) => (
                    <Table.TextCell key={col.key}>
                      {String(row[col.key] ?? "")}
                    </Table.TextCell>
                  ))}
                  <Table.BodyCell style={PINNED_BODY_CELL_STYLE}>
                    <StandardRowActions />
                  </Table.BodyCell>
                </Table.BodyRow>
              ))}
            </Table.Body>
          </Table>
        </Table.Container>
      </DetailPage.Section>
    </DetailPage.Card>
  );
}
