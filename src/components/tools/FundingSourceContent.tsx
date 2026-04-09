import React from "react";
import { Button, Dropdown, SplitViewCard, Table } from "@procore/core-react";
import { Building as FundingSourceIcon, Plus } from "@procore/core-icons";
import ToolPageLayout from "@/components/tools/ToolPageLayout";
import { PINNED_HEADER_CELL_STYLE } from "@/components/table/TableActions";

export default function FundingSourceContent() {
  const breadcrumbs = [
    { label: "Portfolio", href: "/portfolio" },
  ];

  const actions = (
    <>
      <Dropdown label="Export" variant="secondary" className="b_secondary">
        <Dropdown.Item item="csv">CSV</Dropdown.Item>
        <Dropdown.Item item="excel">Excel</Dropdown.Item>
      </Dropdown>
      <Button variant="primary" className="b_primary" icon={<Plus />}>Add Funding Source</Button>
    </>
  );

  return (
    <ToolPageLayout
      title="Funding Source"
      icon={<FundingSourceIcon size="md" />}
      breadcrumbs={breadcrumbs}
      actions={actions}
    >
      <SplitViewCard style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-card-border)', borderRadius: '4px' }}>
        <SplitViewCard.Main style={{ background: 'var(--color-surface-primary)' }}>
          <SplitViewCard.Section heading="Funding Sources">
            <Table.Container>
              <Table>
                <Table.Header>
                  <Table.HeaderRow>
                    <Table.HeaderCell>Name</Table.HeaderCell>
                    <Table.HeaderCell>Type</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                    <Table.HeaderCell>Total Amount</Table.HeaderCell>
                    <Table.HeaderCell>Drawn to Date</Table.HeaderCell>
                    <Table.HeaderCell>Expiration</Table.HeaderCell>
                    <Table.HeaderCell style={PINNED_HEADER_CELL_STYLE}>Actions</Table.HeaderCell>
                  </Table.HeaderRow>
                </Table.Header>
                <Table.Body>
                  <Table.BodyRow>
                    <Table.BodyCell colSpan={7}>
                      <Table.TextCell>No funding sources have been created.</Table.TextCell>
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
