import React, { useMemo } from "react";
import { Button, Dropdown, SplitViewCard } from "@procore/core-react";
import { NotepadPencil as SpecificationsIcon, Plus } from "@procore/core-icons";
import { projects } from "@/data/seed/projects";
import ToolPageLayout from "@/components/tools/ToolPageLayout";
import { SmartGridWrapper } from "@/components/SmartGrid";
import type { ColDef } from "ag-grid-community";
import CostActionsCellRenderer from "@/components/SmartGrid/CostActionsCellRenderer";

const columnDefs: ColDef[] = [
  { field: "sectionNumber", headerName: "Section #", width: 100 },
  { field: "title", headerName: "Title", minWidth: 200 },
  { field: "division", headerName: "Division", width: 120 },
  { field: "status", headerName: "Status", width: 120 },
  { field: "revision", headerName: "Revision", width: 100 },
  { field: "updated", headerName: "Updated", width: 120 },
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

interface SpecificationsContentProps {
  projectId: string;
}

export default function SpecificationsContent({ projectId }: SpecificationsContentProps) {
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
      <Button variant="primary" icon={<Plus />}>Upload Section</Button>
    </>
  );

  return (
    <ToolPageLayout
      title="Specifications"
      icon={<SpecificationsIcon size="md" />}
      breadcrumbs={breadcrumbs}
      actions={actions}
    >
      <SplitViewCard>
        <SplitViewCard.Main>
          <SplitViewCard.Section heading="Specifications">
            <SmartGridWrapper
              id="specifications-grid"
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
