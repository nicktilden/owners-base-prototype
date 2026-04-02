import React, { useMemo, useState } from "react";
import {
  Button,
  Dropdown,
  Pill,
  SplitViewCard,
  Table,
  Tabs,
} from "@procore/core-react";
import {
  ClipboardCheck as ActionPlansIcon,
  Plus,
} from "@procore/core-icons";
import { actionPlans } from "@/data/seed/action_plans";
import { projects } from "@/data/seed/projects";
import type { ActionPlan, ActionPlanStatus, ActionPlanType } from "@/types/action_plans";
import ToolPageLayout from "@/components/tools/ToolPageLayout";
import { PINNED_BODY_CELL_STYLE, PINNED_HEADER_CELL_STYLE, StandardRowActions } from "@/components/table/TableActions";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

const STATUS_COLORS: Record<ActionPlanStatus, "green" | "yellow" | "red" | "gray" | "blue"> = {
  draft: "gray",
  active: "blue",
  complete: "green",
  void: "gray",
};

const STATUS_LABELS: Record<ActionPlanStatus, string> = {
  draft: "Draft",
  active: "Active",
  complete: "Complete",
  void: "Void",
};

const TYPE_LABELS: Record<ActionPlanType, string> = {
  safety: "Safety",
  quality: "Quality",
  environmental: "Environmental",
  project: "Project",
  other: "Other",
};

// ─── Component ────────────────────────────────────────────────────────────────

type TabKey = "list" | "templates";

interface ActionPlansContentProps {
  projectId: string;
}

export default function ActionPlansContent({ projectId }: ActionPlansContentProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("list");

  const project = useMemo(() => projects.find((p) => p.id === projectId), [projectId]);
  const projectLabel = project ? `${project.number} ${project.name}` : projectId;

  const projectPlans = useMemo<ActionPlan[]>(() => {
    return actionPlans.filter((ap) => ap.projectId === projectId);
  }, [projectId]);

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
      <Button variant="primary" icon={<Plus />}>Create Action Plan</Button>
    </>
  );

  const tabs = (
    <Tabs>
      <Tabs.Tab selected={activeTab === "list"} onPress={() => setActiveTab("list")} role="button">
        <Tabs.Link>Action Plans</Tabs.Link>
      </Tabs.Tab>
      <Tabs.Tab selected={activeTab === "templates"} onPress={() => setActiveTab("templates")} role="button">
        <Tabs.Link>Templates</Tabs.Link>
      </Tabs.Tab>
    </Tabs>
  );

  return (
    <ToolPageLayout
      title="Action Plans"
      icon={<ActionPlansIcon size="md" />}
      breadcrumbs={breadcrumbs}
      actions={actions}
      tabs={tabs}
    >
      {activeTab === "list" && (
        <SplitViewCard>
          <SplitViewCard.Main>
            <SplitViewCard.Section heading="Action Plans">
              <Table.Container>
                <Table>
                  <Table.Header>
                    <Table.HeaderRow>
                      <Table.HeaderCell>#</Table.HeaderCell>
                      <Table.HeaderCell>Title</Table.HeaderCell>
                      <Table.HeaderCell>Type</Table.HeaderCell>
                      <Table.HeaderCell>Status</Table.HeaderCell>
                      <Table.HeaderCell>Sections</Table.HeaderCell>
                      <Table.HeaderCell>Created</Table.HeaderCell>
                      <Table.HeaderCell style={PINNED_HEADER_CELL_STYLE}>Actions</Table.HeaderCell>
                    </Table.HeaderRow>
                  </Table.Header>
                  <Table.Body>
                    {projectPlans.length === 0 ? (
                      <Table.BodyRow>
                        <Table.BodyCell colSpan={7}>
                          <Table.TextCell>No action plans have been created for this project.</Table.TextCell>
                        </Table.BodyCell>
                      </Table.BodyRow>
                    ) : (
                      projectPlans.map((plan) => (
                        <Table.BodyRow key={plan.id}>
                          <Table.BodyCell>
                            <Table.TextCell>
                              <span style={{ color: "#6a767c", fontSize: 13 }}>#{plan.number}</span>
                            </Table.TextCell>
                          </Table.BodyCell>
                          <Table.BodyCell>
                            <Table.TextCell>
                              <span style={{ fontWeight: 600, color: "#1d5cc9", cursor: "pointer" }}>
                                {plan.title}
                              </span>
                            </Table.TextCell>
                          </Table.BodyCell>
                          <Table.BodyCell>
                            <Table.TextCell>{TYPE_LABELS[plan.type]}</Table.TextCell>
                          </Table.BodyCell>
                          <Table.BodyCell>
                            <Pill color={STATUS_COLORS[plan.status]}>{STATUS_LABELS[plan.status]}</Pill>
                          </Table.BodyCell>
                          <Table.BodyCell>
                            <Table.TextCell>{plan.sections.length}</Table.TextCell>
                          </Table.BodyCell>
                          <Table.BodyCell>
                            <Table.TextCell>{formatDate(plan.createdAt)}</Table.TextCell>
                          </Table.BodyCell>
                          <Table.BodyCell style={PINNED_BODY_CELL_STYLE}>
                            <StandardRowActions />
                          </Table.BodyCell>
                        </Table.BodyRow>
                      ))
                    )}
                  </Table.Body>
                </Table>
              </Table.Container>
            </SplitViewCard.Section>
          </SplitViewCard.Main>
        </SplitViewCard>
      )}

      {activeTab === "templates" && (
        <SplitViewCard>
          <SplitViewCard.Main>
            <SplitViewCard.Section heading="Templates">
              <div style={{ padding: "24px", textAlign: "center", color: "#6a767c" }}>
                Templates coming soon.
              </div>
            </SplitViewCard.Section>
          </SplitViewCard.Main>
        </SplitViewCard>
      )}
    </ToolPageLayout>
  );
}
