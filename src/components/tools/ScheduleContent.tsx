import React, { useMemo, useState } from "react";
import {
  Button,
  Dropdown,
  Pill,
  SplitViewCard,
  Select,
  Table,
  Tabs,
} from "@procore/core-react";
import {
  Calendar as ScheduleIcon,
  Plus,
} from "@procore/core-icons";
import { scheduleEntries } from "@/data/seed/schedule";
import { projects } from "@/data/seed/projects";
import type { ScheduleEntry, ScheduleItem, Milestone, ScheduleStatus } from "@/types/schedule";
import styled from "styled-components";
import ToolPageLayout from "@/components/tools/ToolPageLayout";
import { PINNED_BODY_CELL_STYLE, PINNED_HEADER_CELL_STYLE, StandardRowActions } from "@/components/table/TableActions";
import { formatDateMMDDYYYY } from "@/utils/date";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: Date | null): string {
  return formatDateMMDDYYYY(d);
}

function formatPercent(n: number): string {
  return `${n}%`;
}

const STATUS_COLORS: Record<ScheduleStatus, "green" | "yellow" | "red" | "gray" | "blue"> = {
  not_started: "gray",
  in_progress: "blue",
  on_hold: "yellow",
  delayed: "red",
  complete: "green",
};

const STATUS_LABELS: Record<ScheduleStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  on_hold: "On Hold",
  delayed: "Delayed",
  complete: "Complete",
};

const ProgressBarWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ProgressBarOuter = styled.div`
  flex: 1;
  height: 6px;
  background: #e0e4e7;
  border-radius: 3px;
  overflow: hidden;
  min-width: 60px;
`;

const ProgressBarInner = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${({ $pct }) => $pct}%;
  background: #1d5cc9;
  border-radius: 3px;
`;

const ProgressLabel = styled.span`
  font-size: 13px;
  color: #6a767c;
  white-space: nowrap;
`;

// ─── Component ────────────────────────────────────────────────────────────────

type TabKey = "schedule" | "milestones";

interface ScheduleContentProps {
  projectId: string;
}

export default function ScheduleContent({ projectId }: ScheduleContentProps) {
  const isPortfolio = projectId === "";
  const [activeTab, setActiveTab] = useState<TabKey>("schedule");
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  const projectMap = useMemo(() => {
    const m = new Map<string, string>();
    projects.forEach((p) => m.set(p.id, `${p.number} ${p.name}`));
    return m;
  }, []);
  const projectOptions = useMemo(() => {
    const ids = new Set(scheduleEntries.map((e) => e.projectId));
    return projects.filter((p) => ids.has(p.id));
  }, []);

  const projectEntries = useMemo<ScheduleEntry[]>(() => {
    let base = isPortfolio
      ? [...scheduleEntries]
      : scheduleEntries.filter((e) => e.projectId === projectId);
    if (isPortfolio && selectedProjectIds.length > 0) {
      base = base.filter((e) => selectedProjectIds.includes(e.projectId));
    }
    return base;
  }, [projectId, isPortfolio, selectedProjectIds]);

  const scheduleItems = projectEntries.filter((e): e is ScheduleItem => e.type === "item");
  const milestones = projectEntries.filter((e): e is Milestone => e.type === "milestone");


  const actions = (
    <>
      <Dropdown label="Export" variant="secondary">
        <Dropdown.Item item="csv">CSV</Dropdown.Item>
        <Dropdown.Item item="excel">Excel</Dropdown.Item>
      </Dropdown>
      <Button variant="primary" icon={<Plus />}>Add Item</Button>
    </>
  );

  const tabs = (
    <Tabs>
      <Tabs.Tab selected={activeTab === "schedule"} onPress={() => setActiveTab("schedule")} role="button">
        <Tabs.Link>Schedule</Tabs.Link>
      </Tabs.Tab>
      <Tabs.Tab selected={activeTab === "milestones"} onPress={() => setActiveTab("milestones")} role="button">
        <Tabs.Link>Milestones</Tabs.Link>
      </Tabs.Tab>
    </Tabs>
  );

  return (
    <ToolPageLayout
      title="Schedule"
      icon={<ScheduleIcon size="md" />}
      actions={actions}
      tabs={tabs}
    >
      {activeTab === "schedule" && (
        <SplitViewCard>
          <SplitViewCard.Main>
            <SplitViewCard.Section heading="Schedule Items">
              {isPortfolio && (
                <div style={{ marginBottom: 12, maxWidth: 320 }}>
                  <Select
                    placeholder="Filter by project"
                    label={selectedProjectIds.length ? `${selectedProjectIds.length} selected` : undefined}
                    onSelect={(s) => {
                      const id = s.item as string;
                      setSelectedProjectIds((prev) =>
                        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                      );
                    }}
                    onClear={() => setSelectedProjectIds([])}
                    block
                  >
                    {projectOptions.map((p) => (
                      <Select.Option key={p.id} value={p.id} selected={selectedProjectIds.includes(p.id)}>
                        {p.number} {p.name}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              )}
              <Table.Container>
                <Table>
                  <Table.Header>
                    <Table.HeaderRow>
                      {isPortfolio && <Table.HeaderCell>Project</Table.HeaderCell>}
                      <Table.HeaderCell>WBS</Table.HeaderCell>
                      <Table.HeaderCell>Name</Table.HeaderCell>
                      <Table.HeaderCell>Status</Table.HeaderCell>
                      <Table.HeaderCell>% Complete</Table.HeaderCell>
                      <Table.HeaderCell>Start Date</Table.HeaderCell>
                      <Table.HeaderCell>Finish Date</Table.HeaderCell>
                      <Table.HeaderCell style={PINNED_HEADER_CELL_STYLE}>Actions</Table.HeaderCell>
                    </Table.HeaderRow>
                  </Table.Header>
                  <Table.Body>
                    {scheduleItems.length === 0 ? (
                      <Table.BodyRow>
                        <Table.BodyCell colSpan={isPortfolio ? 8 : 7}>
                          <Table.TextCell>No schedule items have been added to this project.</Table.TextCell>
                        </Table.BodyCell>
                      </Table.BodyRow>
                    ) : (
                      scheduleItems.map((item) => (
                        <Table.BodyRow key={item.id}>
                          {isPortfolio && (
                            <Table.BodyCell>
                              <Table.TextCell>
                                <span style={{ color: "#1d5cc9", cursor: "pointer" }}>
                                  {projectMap.get(item.projectId) ?? item.projectId}
                                </span>
                              </Table.TextCell>
                            </Table.BodyCell>
                          )}
                          <Table.BodyCell>
                            <Table.TextCell>
                              <span style={{ color: "#6a767c", fontSize: 13 }}>{item.wbs}</span>
                            </Table.TextCell>
                          </Table.BodyCell>
                          <Table.BodyCell>
                            <Table.TextCell>
                              <span style={{ fontWeight: 600, color: "#1d5cc9", cursor: "pointer" }}>
                                {item.name}
                              </span>
                            </Table.TextCell>
                          </Table.BodyCell>
                          <Table.BodyCell>
                            <Pill color={STATUS_COLORS[item.status]}>{STATUS_LABELS[item.status]}</Pill>
                          </Table.BodyCell>
                          <Table.BodyCell>
                            <ProgressBarWrap>
                              <ProgressBarOuter>
                                <ProgressBarInner $pct={item.percentComplete} />
                              </ProgressBarOuter>
                              <ProgressLabel>{formatPercent(item.percentComplete)}</ProgressLabel>
                            </ProgressBarWrap>
                          </Table.BodyCell>
                          <Table.BodyCell>
                            <Table.TextCell>{formatDate(item.startDate)}</Table.TextCell>
                          </Table.BodyCell>
                          <Table.BodyCell>
                            <Table.TextCell>{formatDate(item.finishDate)}</Table.TextCell>
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

      {activeTab === "milestones" && (
        <SplitViewCard>
          <SplitViewCard.Main>
            <SplitViewCard.Section heading="Milestones">
              {isPortfolio && (
                <div style={{ marginBottom: 12, maxWidth: 320 }}>
                  <Select
                    placeholder="Filter by project"
                    label={selectedProjectIds.length ? `${selectedProjectIds.length} selected` : undefined}
                    onSelect={(s) => {
                      const id = s.item as string;
                      setSelectedProjectIds((prev) =>
                        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                      );
                    }}
                    onClear={() => setSelectedProjectIds([])}
                    block
                  >
                    {projectOptions.map((p) => (
                      <Select.Option key={p.id} value={p.id} selected={selectedProjectIds.includes(p.id)}>
                        {p.number} {p.name}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              )}
              <Table.Container>
                <Table>
                  <Table.Header>
                    <Table.HeaderRow>
                      {isPortfolio && <Table.HeaderCell>Project</Table.HeaderCell>}
                      <Table.HeaderCell>WBS</Table.HeaderCell>
                      <Table.HeaderCell>Name</Table.HeaderCell>
                      <Table.HeaderCell>Planned Date</Table.HeaderCell>
                      <Table.HeaderCell>Actual Date</Table.HeaderCell>
                      <Table.HeaderCell style={PINNED_HEADER_CELL_STYLE}>Actions</Table.HeaderCell>
                    </Table.HeaderRow>
                  </Table.Header>
                  <Table.Body>
                    {milestones.length === 0 ? (
                      <Table.BodyRow>
                        <Table.BodyCell colSpan={isPortfolio ? 6 : 5}>
                          <Table.TextCell>No milestones have been added to this project.</Table.TextCell>
                        </Table.BodyCell>
                      </Table.BodyRow>
                    ) : (
                      milestones.map((m) => (
                        <Table.BodyRow key={m.id}>
                          {isPortfolio && (
                            <Table.BodyCell>
                              <Table.TextCell>
                                <span style={{ color: "#1d5cc9", cursor: "pointer" }}>
                                  {projectMap.get(m.projectId) ?? m.projectId}
                                </span>
                              </Table.TextCell>
                            </Table.BodyCell>
                          )}
                          <Table.BodyCell>
                            <Table.TextCell>
                              <span style={{ color: "#6a767c", fontSize: 13 }}>{m.wbs}</span>
                            </Table.TextCell>
                          </Table.BodyCell>
                          <Table.BodyCell>
                            <Table.TextCell>
                              <span style={{ fontWeight: 600, color: "#1d5cc9", cursor: "pointer" }}>
                                {m.name}
                              </span>
                            </Table.TextCell>
                          </Table.BodyCell>
                          <Table.BodyCell>
                            <Table.TextCell>{formatDate(m.milestoneDate)}</Table.TextCell>
                          </Table.BodyCell>
                          <Table.BodyCell>
                            <Table.TextCell>
                              {m.actualMilestoneDate ? (
                                <span style={{ color: "#1a7d3a" }}>{formatDate(m.actualMilestoneDate)}</span>
                              ) : (
                                <span style={{ color: "#6a767c" }}>—</span>
                              )}
                            </Table.TextCell>
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
    </ToolPageLayout>
  );
}
