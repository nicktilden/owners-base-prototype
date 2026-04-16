import React, { useMemo } from "react";
import { Button, Dropdown, SplitViewCard } from "@procore/core-react";
import { File as ChangeEventsIcon, Plus } from "@procore/core-icons";
import ToolPageLayout from "@/components/tools/ToolPageLayout";
import { SmartGridWrapper } from "@/components/SmartGrid";
import type { ColDef } from "ag-grid-community";
import CostActionsCellRenderer from "@/components/SmartGrid/CostActionsCellRenderer";

const columnDefs: ColDef[] = [
  { field: "number", headerName: "#", width: 80 },
  { field: "title", headerName: "Title", minWidth: 200 },
  { field: "status", headerName: "Status", width: 120 },
  { field: "scope", headerName: "Scope", width: 120 },
  { field: "origin", headerName: "Origin", width: 150 },
  { field: "created", headerName: "Created", width: 120 },
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

interface ChangeEventsContentProps {
  projectId: string;
}

export default function ChangeEventsContent({ projectId }: ChangeEventsContentProps) {
  const actions = (
    <>
      <Dropdown label="Export" variant="secondary">
        <Dropdown.Item item="csv">CSV</Dropdown.Item>
        <Dropdown.Item item="excel">Excel</Dropdown.Item>
      </Dropdown>
      <Button variant="primary" icon={<Plus />}>Create Change Event</Button>
    </>
  );

  return (
    <ToolPageLayout
      title="Change Events"
      icon={<ChangeEventsIcon size="md" />}
      actions={actions}
    >
      <SplitViewCard>
        <SplitViewCard.Main>
          <SplitViewCard.Section heading="Change Events">
            <SmartGridWrapper
              id="change-events-grid"
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
