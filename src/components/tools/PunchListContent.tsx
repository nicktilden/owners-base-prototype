import React, { useMemo } from "react";
import { Button, Dropdown, SplitViewCard } from "@procore/core-react";
import { ListBulleted as PunchListIcon, Plus } from "@procore/core-icons";
import { projects } from "@/data/seed/projects";
import ToolPageLayout from "@/components/tools/ToolPageLayout";
import { SmartGridWrapper } from "@/components/SmartGrid";
import type { ColDef } from "ag-grid-community";
import CostActionsCellRenderer from "@/components/SmartGrid/CostActionsCellRenderer";

const columnDefs: ColDef[] = [
  { field: "number", headerName: "#", width: 80 },
  { field: "description", headerName: "Description", minWidth: 200 },
  { field: "location", headerName: "Location", width: 150 },
  { field: "status", headerName: "Status", width: 120 },
  { field: "assignedTo", headerName: "Assigned To", width: 150 },
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

interface PunchListContentProps {
  projectId: string;
}

export default function PunchListContent({ projectId }: PunchListContentProps) {
  const project = useMemo(() => projects.find((p) => p.id === projectId), [projectId]);
  const projectLabel = project ? `${project.number} ${project.name}` : projectId;

  const breadcrumbs = [
    { label: "Portfolio", href: "/portfolio" },
    ...(projectId ? [{ label: projectLabel, href: `/project/${projectId}` }] : []),
  ];

  const actions = (
    <>
      <Dropdown label="Export" variant="secondary">
        <Dropdown.Item item="csv">CSV</Dropdown.Item>
        <Dropdown.Item item="excel">Excel</Dropdown.Item>
      </Dropdown>
      <Button variant="primary" icon={<Plus />}>Create Item</Button>
    </>
  );

  return (
    <ToolPageLayout
      title="Punch List"
      icon={<PunchListIcon size="md" />}
      breadcrumbs={breadcrumbs}
      actions={actions}
    >
      <SplitViewCard>
        <SplitViewCard.Main>
          <SplitViewCard.Section heading="Punch List">
            <SmartGridWrapper
              id="punch-list-grid"
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
