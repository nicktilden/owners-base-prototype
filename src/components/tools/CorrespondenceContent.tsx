import React, { useMemo } from "react";
import { Button, Dropdown, SplitViewCard } from "@procore/core-react";
import { Envelope as CorrespondenceIcon, Plus } from "@procore/core-icons";
import ToolPageLayout from "@/components/tools/ToolPageLayout";
import { SmartGridWrapper } from "@/components/SmartGrid";
import type { ColDef } from "ag-grid-community";
import CostActionsCellRenderer from "@/components/SmartGrid/CostActionsCellRenderer";

const columnDefs: ColDef[] = [
  { field: "number", headerName: "#", width: 80 },
  { field: "subject", headerName: "Subject", minWidth: 200 },
  { field: "type", headerName: "Type", width: 120 },
  { field: "status", headerName: "Status", width: 120 },
  { field: "from", headerName: "From", width: 150 },
  { field: "date", headerName: "Date", width: 120 },
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
  },
];

interface CorrespondenceContentProps {
  projectId: string;
}

export default function CorrespondenceContent({ projectId }: CorrespondenceContentProps) {
  const actions = (
    <>
      <Dropdown label="Export" variant="secondary">
        <Dropdown.Item item="csv">CSV</Dropdown.Item>
        <Dropdown.Item item="excel">Excel</Dropdown.Item>
      </Dropdown>
      <Button variant="primary" icon={<Plus />}>Create Correspondence</Button>
    </>
  );

  return (
    <ToolPageLayout
      title="Correspondence"
      icon={<CorrespondenceIcon size="md" />}
      actions={actions}
    >
      <SplitViewCard>
        <SplitViewCard.Main>
          <SplitViewCard.Section heading="Correspondence">
            <SmartGridWrapper
              id="correspondence-grid"
              columnDefs={columnDefs}
              rowData={[]}
              height={400}
              sideBar={false}
            />
          </SplitViewCard.Section>
        </SplitViewCard.Main>
      </SplitViewCard>
    </ToolPageLayout>
  );
}
