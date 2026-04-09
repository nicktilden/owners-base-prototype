import React from "react";
import { Button, Dropdown, SplitViewCard, Table } from "@procore/core-react";
import { CurrencyUSA as CapitalPlanningIcon, Plus } from "@procore/core-icons";
import ToolPageLayout from "@/components/tools/ToolPageLayout";
import { PINNED_HEADER_CELL_STYLE } from "@/components/table/TableActions";

export default function CapitalPlanningContent() {
  const breadcrumbs = [
    { label: "Portfolio", href: "/portfolio" },
  ];

  const actions = (
    <>
      <Dropdown label="Export" variant="secondary" className="b_secondary">
        <Dropdown.Item item="csv">CSV</Dropdown.Item>
        <Dropdown.Item item="excel">Excel</Dropdown.Item>
      </Dropdown>
      <Button variant="primary" className="b_primary" icon={<Plus />}>Add Program</Button>
    </>
  );

  return (
    <ToolPageLayout
      title="Capital Planning"
      icon={<CapitalPlanningIcon size="md" />}
      breadcrumbs={breadcrumbs}
      actions={actions}
    >
      <SplitViewCard style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-card-border)', borderRadius: '4px' }}>
        <SplitViewCard.Main style={{ background: 'var(--color-surface-primary)' }}>
          <SplitViewCard.Section heading="Capital Programs">
            <Table.Container>
              <Table>
                <Table.Header>
                  <Table.HeaderRow>
                    <Table.HeaderCell>Program</Table.HeaderCell>
                    <Table.HeaderCell>Fiscal Year</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                    <Table.HeaderCell>Approved Budget</Table.HeaderCell>
                    <Table.HeaderCell>Spent to Date</Table.HeaderCell>
                    <Table.HeaderCell>Remaining</Table.HeaderCell>
                    <Table.HeaderCell style={PINNED_HEADER_CELL_STYLE}>Actions</Table.HeaderCell>
                  </Table.HeaderRow>
                </Table.Header>
                <Table.Body>
                  <Table.BodyRow>
                    <Table.BodyCell colSpan={7}>
                      <Table.TextCell>No capital programs have been created.</Table.TextCell>
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
