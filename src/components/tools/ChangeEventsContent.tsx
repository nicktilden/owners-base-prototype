import React, { useMemo } from "react";
import { Button, Dropdown, SplitViewCard, Table } from "@procore/core-react";
import { File as ChangeEventsIcon, Plus } from "@procore/core-icons";
import { projects } from "@/data/seed/projects";
import ToolPageLayout from "@/components/tools/ToolPageLayout";
import { PINNED_HEADER_CELL_STYLE } from "@/components/table/TableActions";

interface ChangeEventsContentProps {
  projectId: string;
}

export default function ChangeEventsContent({ projectId }: ChangeEventsContentProps) {
  const project = useMemo(() => projects.find((p) => p.id === projectId), [projectId]);
  const projectLabel = project ? `${project.number} ${project.name}` : projectId;

  const breadcrumbs = [
    { label: "Portfolio", href: "/portfolio" },
    ...(projectId ? [{ label: projectLabel, href: `/project/${projectId}` }] : []),
  ];

  const actions = (
    <>
      <Dropdown label="Export" variant="secondary" className="b_secondary">
        <Dropdown.Item item="csv">CSV</Dropdown.Item>
        <Dropdown.Item item="excel">Excel</Dropdown.Item>
      </Dropdown>
      <Button variant="primary" className="b_primary" icon={<Plus />}>Create Change Event</Button>
    </>
  );

  return (
    <ToolPageLayout
      title="Change Events"
      icon={<ChangeEventsIcon size="md" />}
      breadcrumbs={breadcrumbs}
      actions={actions}
    >
      <SplitViewCard style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-card-border)', borderRadius: '4px' }}>
        <SplitViewCard.Main style={{ background: 'var(--color-surface-primary)' }}>
          <SplitViewCard.Section heading="Change Events">
            <Table.Container>
              <Table>
                <Table.Header>
                  <Table.HeaderRow>
                    <Table.HeaderCell>#</Table.HeaderCell>
                    <Table.HeaderCell>Title</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                    <Table.HeaderCell>Scope</Table.HeaderCell>
                    <Table.HeaderCell>Origin</Table.HeaderCell>
                    <Table.HeaderCell>Created</Table.HeaderCell>
                    <Table.HeaderCell style={PINNED_HEADER_CELL_STYLE}>Actions</Table.HeaderCell>
                  </Table.HeaderRow>
                </Table.Header>
                <Table.Body>
                  <Table.BodyRow>
                    <Table.BodyCell colSpan={7}>
                      <Table.TextCell>No change events have been created for this project.</Table.TextCell>
                    </Table.BodyCell>
                  </Table.BodyRow>
                </Table.Body>
              </Table>
            </Table.Container>
          </SplitViewCard.Section>
        </SplitViewCard.Main>
      </SplitViewCard>
    </ToolPageLayout>
  );
}
