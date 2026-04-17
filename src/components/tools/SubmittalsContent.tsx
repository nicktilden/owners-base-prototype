import React, { useMemo } from "react";
import { Button, Dropdown, SplitViewCard } from "@procore/core-react";
import { Folder as SubmittalsIcon, Plus } from "@procore/core-icons";
import ToolPageLayout from "@/components/tools/ToolPageLayout";
import { SmartGridWrapper } from "@/components/SmartGrid";
import type { ColDef } from "ag-grid-community";
import CostActionsCellRenderer from "@/components/SmartGrid/CostActionsCellRenderer";

const columnDefs: ColDef[] = [
  { field: "number", headerName: "#", width: 80 },
  { field: "title", headerName: "Title", minWidth: 200 },
  { field: "type", headerName: "Type", width: 120 },
  { field: "status", headerName: "Status", width: 120 },
  { field: "responsibleContractor", headerName: "Responsible Contractor", width: 180 },
  { field: "dueDate", headerName: "Due Date", width: 120 },
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

interface SubmittalsContentProps {
  projectId: string;
}

export default function SubmittalsContent({ projectId }: SubmittalsContentProps) {
  const actions = (
    <>
      <Dropdown label="Export" variant="secondary" className="b_secondary">
        <Dropdown.Item item="csv">CSV</Dropdown.Item>
        <Dropdown.Item item="excel">Excel</Dropdown.Item>
      </Dropdown>
      <Button variant="primary" className="b_primary" icon={<Plus />}>Create Submittal</Button>
    </>
  );

  return (
    <ToolPageLayout
      title="Submittals"
      icon={<SubmittalsIcon size="md" />}
      actions={actions}
    >
      <SplitViewCard style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-card-border)', borderRadius: '4px' }}>
        <SplitViewCard.Main style={{ background: 'var(--color-surface-primary)' }}>
          <SplitViewCard.Section heading="Submittals">
            <SmartGridWrapper
              id="submittals-grid"
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
