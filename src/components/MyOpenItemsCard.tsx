import React, { useMemo, useState } from "react";
import { Button, Pill, Search, Select, Tearsheet, Typography, colors } from "@procore/core-react";
import {
  Copilot,
  ExternalLink,
  FileQuestionMark,
  ClipboardPushpin,
  PencilErase,
  File,
  EllipsisVertical,
} from "@procore/core-icons";
import styled from "styled-components";
import { sampleOpenItemRows, type OpenItemRow } from "@/data/openitems";
import { rfis } from "@/data/seed/rfis";
import { projects } from "@/data/seed/projects";
import { usePersona } from "@/context/PersonaContext";
import HubCardFrame from "@/components/hubs/HubCardFrame";
import { useAiPanel } from "@/context/AiPanelContext";
import { formatDateMMDDYYYY } from "@/utils/date";

// ─── Hub Card anatomy ─────────────────────────────────────────────────────────

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

// ─── Table layout ─────────────────────────────────────────────────────────────

const ItemTable = styled.div`
  width: 100%;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 100px 1fr 100px 90px 36px;
  padding: 0 8px;
  height: 28px;
  align-items: center;
  border-bottom: 1px solid var(--color-border-separator);
`;

const HeaderCell = styled.span`
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 16px;
  white-space: nowrap;
  padding: 6px 0;

  &:nth-child(3) {
    text-align: left;
  }
  &:nth-child(4) {
    text-align: left;
  }
`;

const ItemRow = styled.div<{ $even?: boolean }>`
  display: grid;
  grid-template-columns: 100px 1fr 110px 100px 36px;
  padding: 0 8px;
  min-height: 44px;
  align-items: center;
  background: ${({ $even }) => ($even ? "var(--color-surface-primary)" : "var(--color-surface-secondary)")};
  border-bottom: 1px solid var(--color-border-separator);
  cursor: pointer;
`;

const TypeCell = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  overflow: hidden;
  padding: 8px 0;
`;

const TypeLabel = styled.span`
  font-size: 13px;
  color: var(--color-text-primary);
  line-height: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 118px;
`;

const TitleCell = styled.div`
  min-width: 0;
  padding: 8px 8px 8px 0;
`;

const ProjectLabel = styled.div`
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ItemLinkButton = styled.button`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-link);
  text-decoration: underline;
  letter-spacing: 0.15px;
  line-height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  cursor: pointer;
  border: none;
  background: transparent;
  padding: 0;
  text-align: left;
`;

const DueDateCell = styled.div<{ $overdue?: boolean }>`
  font-size: 13px;
  color: ${({ $overdue }) => ($overdue ? "#c42223" : "var(--color-text-primary)")};
  line-height: 16px;
  white-space: nowrap;
  text-align: left;
  padding: 8px 0;
`;

const StatusCell = styled.div`
  display: flex;
  justify-content: flex-start;
`;

const TearsheetHeader = styled.div`
  padding: 20px 24px 12px;
  border-bottom: 1px solid var(--color-border-separator);
`;

const TearsheetBody = styled.div`
  width: 75%;
  padding: 16px 24px 24px;
  overflow-y: auto;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 160px 1fr;
  row-gap: 8px;
  column-gap: 8px;
`;

const DetailLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
`;

const DetailValue = styled.div`
  font-size: 14px;
  color: var(--color-text-primary);
`;

// ─── Data helpers ─────────────────────────────────────────────────────────────

const projectLookup: Record<string, { name: string; number: string }> = {};
for (const p of projects) {
  projectLookup[p.id] = { name: p.name, number: p.number };
}

function useMyOpenItems(): OpenItemRow[] {
  const { activeUser } = usePersona();
  return useMemo(() => {
    const userName = activeUser
      ? `${activeUser.firstName} ${activeUser.lastName}`
      : "Bridget O'Sullivan";

    // RFIs assigned to the active user, converted to OpenItemRow shape
    const rfiItems: OpenItemRow[] = rfis
      .filter((r) => r.assignees.includes(userName) && r.status !== 'Closed' && r.status !== 'Closed - Revised' && r.status !== 'Closed - Draft')
      .map((r, idx) => {
        const proj = projectLookup[r.projectId];
        const daysOverdue = r.dueDate
          ? Math.max(0, Math.round((new Date('2026-03-27').getTime() - new Date(r.dueDate).getTime()) / 86400000))
          : 0;
        return {
          id: 10000 + idx,
          number: `RFI-${String(r.number).padStart(4, '0')}`,
          type: 'RFI' as const,
          title: r.subject,
          status: r.status === 'Open' ? 'Open' as const : 'Pending' as const,
          priority: 'High' as const,
          trade: 'General' as const,
          createdDate: r.createdAt,
          dueDate: r.dueDate ?? r.createdAt,
          closedDate: '',
          daysOverdue,
          assignee: userName,
          submittedBy: r.createdBy,
          projectId: 0,
          projectNumber: proj?.number ?? '',
          projectName: proj?.name ?? '',
          specSection: '',
          description: r.question,
        };
      });

    // Original open items for backwards compatibility
    const legacyItems = sampleOpenItemRows
      .filter((r) => r.assignee === userName && r.status !== "Closed" && r.status !== "Void");

    return [...rfiItems, ...legacyItems]
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 5);
  }, [activeUser]);
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  "RFI": <FileQuestionMark size="sm" />,
  "Punch List": <ClipboardPushpin size="sm" />,
  "Submittal": <File size="sm" />,
  "Observation": <File size="sm" />,
  "Issue": <PencilErase size="sm" />,
};

const STATUS_COLOR: Record<string, "blue" | "green" | "yellow" | "gray"> = {
  "Open": "blue",
  "In Review": "yellow",
  "Pending": "yellow",
};

function formatDueDate(isoDate: string): string {
  return formatDateMMDDYYYY(isoDate);
}

function isOverdue(isoDate: string): boolean {
  return isoDate < "2026-03-27";
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MyOpenItemsCard() {
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<OpenItemRow | null>(null);
  const [projectFilter, setProjectFilter] = useState("All Projects");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [progressFilter, setProgressFilter] = useState("All Progress");
  const { openPanel: openAiPanel } = useAiPanel();
  const MY_OPEN_ITEMS = useMyOpenItems();

  const projectOptions = ["All Projects", ...Array.from(new Set(MY_OPEN_ITEMS.map((item) => item.projectName))).sort()];
  const typeOptions = ["All Types", ...Array.from(new Set(MY_OPEN_ITEMS.map((item) => item.type))).sort()];
  const progressOptions = ["All Progress", ...Array.from(new Set(MY_OPEN_ITEMS.map((item) => item.status))).sort()];

  const filtered = MY_OPEN_ITEMS.filter((item) => {
    if (projectFilter !== "All Projects" && item.projectName !== projectFilter) return false;
    if (typeFilter !== "All Types" && item.type !== typeFilter) return false;
    if (progressFilter !== "All Progress" && item.status !== progressFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.projectName.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q)
    );
  });

  return (
    <>
    <HubCardFrame 
      title="My Open Items"
      infoTooltip="Top open work items assigned to the current user, sourced from the seeded open-items dataset and sorted by due date."
      actions={
        <HeaderActions>
        <Button
         className="b_secondary"
          variant="secondary"
          size="sm"
          icon={<Copilot size="sm" style={{ color: colors.orange50 }} />}
          onClick={() => openAiPanel({
            itemName: 'My Open Items',
            pills: [
              { label: `${MY_OPEN_ITEMS.length} items`, color: 'blue' },
              { label: `${MY_OPEN_ITEMS.filter(i => isOverdue(i.dueDate)).length} overdue`, color: 'red' },
            ],
            aiSummary: `${MY_OPEN_ITEMS.length} open items assigned to you across ${new Set(MY_OPEN_ITEMS.map(i => i.type)).size} item types.`,
            cardType: 'open_items',
            userRoles: ['owner', 'owner_admin', 'project_manager'],
          })}
          aria-label="Open AI assistant"
          style={{
            background: colors.orange98,
            border: `1px solid ${colors.orange50}`,
            borderRadius: 4,
            color: colors.gray15,
          }}
        >
          Summarize
        </Button>
        <Button
          variant="secondary"
          size="sm"
          aria-label="View all open items"
        >
          View All
        </Button>
        <Button
          className="b_tertiary"
          variant="tertiary"
          size="sm"
          icon={<EllipsisVertical size="sm" />}
          aria-label="More actions"
        />
      </HeaderActions>
      }
      controls={
        <>
          <Search
            className="i_search"
            placeholder="Search"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
          <Select
            onSelect={(next) => {
              if (typeof next === "string") setProjectFilter(next);
            }}
            placeholder="Project Name"
            style={{ minWidth: 170 }}
          >
            {projectOptions.map((opt) => (
              <Select.Option key={opt} value={opt} selected={projectFilter === opt}>
                {opt}
              </Select.Option>
            ))}
          </Select>
          <Select
            onSelect={(next) => {
              if (typeof next === "string") setTypeFilter(next);
            }}
            placeholder="Item Type"
            style={{ minWidth: 150 }}
          >
            {typeOptions.map((opt) => (
              <Select.Option key={opt} value={opt} selected={typeFilter === opt}>
                {opt}
              </Select.Option>
            ))}
          </Select>
          <Select
            onSelect={(next) => {
              if (typeof next === "string") setProgressFilter(next);
            }}
            placeholder="Progress"
            style={{ minWidth: 140 }}
          >
            {progressOptions.map((opt) => (
              <Select.Option key={opt} value={opt} selected={progressFilter === opt}>
                {opt}
              </Select.Option>
            ))}
          </Select>
        </>
      }
    >
        <ItemTable role="table" aria-label="My open items">
          <TableHeader role="row">
            <HeaderCell role="columnheader">Type</HeaderCell>
            <HeaderCell role="columnheader">Project Details and Open Item Title</HeaderCell>
            <HeaderCell role="columnheader">Due Date</HeaderCell>
            <HeaderCell role="columnheader">Status</HeaderCell>
            <HeaderCell role="columnheader" />
          </TableHeader>

          {filtered.map((item, idx) => {
            const overdue = isOverdue(item.dueDate);
            return (
              <ItemRow key={item.id} role="row" tabIndex={0} $even={idx % 2 === 0}>
                <TypeCell role="cell">
                  <span style={{ color: "var(--color-text-primary)", display: "flex", alignItems: "center", flexShrink: 0 }}>
                    {TYPE_ICONS[item.type] ?? <File size="sm" />}
                  </span>
                  <TypeLabel>{item.type}</TypeLabel>
                </TypeCell>

                <TitleCell role="cell">
                  <ProjectLabel>{item.projectName}</ProjectLabel>
                  <ItemLinkButton
                    onClick={() => setSelectedItem(item)}
                    aria-label={`Open details for ${item.number}`}
                  >
                    {item.number}: {item.title.length > 24 ? `${item.title.slice(0, 24)}…` : item.title}
                  </ItemLinkButton>
                </TitleCell>

                <DueDateCell role="cell" $overdue={overdue}>
                  {formatDueDate(item.dueDate)}
                </DueDateCell>

                <StatusCell role="cell">
                  <Pill color={STATUS_COLOR[item.status] ?? "gray"} data-pill-color={STATUS_COLOR[item.status] ?? "gray"}>
                    {item.status}
                  </Pill>
                </StatusCell>

                <div role="cell" style={{ display: "flex", justifyContent: "center" }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const overdue = isOverdue(item.dueDate);
                      openAiPanel({
                        itemName: `${item.number}: ${item.title}`,
                        itemId: item.number,
                        projectId: item.projectId,
                        pills: [
                          { label: item.type, color: 'blue' },
                          { label: item.priority, color: item.priority === 'Critical' ? 'red' : item.priority === 'High' ? 'yellow' : 'green' },
                          ...(overdue ? [{ label: 'Overdue', color: 'red' as const }] : []),
                        ],
                        aiSummary: `${item.type} on ${item.projectName} — ${item.status}, ${item.priority} priority, due ${formatDueDate(item.dueDate)}${overdue ? ' (overdue)' : ''}.`,
                        cardType: 'open_items',
                        userRoles: ['owner', 'owner_admin', 'project_manager'],
                      });
                    }}
                    aria-label={`AI actions for ${item.number}`}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 4,
                      border: `1px solid ${colors.orange50}`,
                      background: colors.orange98,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                    }}
                  >
                    <Copilot size="sm" style={{ color: colors.orange50, width: 14, height: 14 }} />
                  </button>
                </div>
              </ItemRow>
            );
          })}
        </ItemTable>
    </HubCardFrame>
    <Tearsheet
      open={selectedItem !== null}
      onClose={() => setSelectedItem(null)}
      placement="right"
      block
      aria-label="Open item details"
    >
      {selectedItem && (
        <>
          <TearsheetHeader>
            <Typography intent="h2" style={{ fontWeight: 700, color: "var(--color-text-primary)" }}>
              {selectedItem.number}
            </Typography>
            <Typography intent="body" style={{ display: "block", color: "var(--color-text-secondary)", marginTop: 2 }}>
              {selectedItem.title}
            </Typography>
          </TearsheetHeader>
          <TearsheetBody>
            <DetailGrid>
              <DetailLabel>Project</DetailLabel>
              <DetailValue>{selectedItem.projectName}</DetailValue>
              <DetailLabel>Type</DetailLabel>
              <DetailValue>{selectedItem.type}</DetailValue>
              <DetailLabel>Status</DetailLabel>
              <DetailValue>{selectedItem.status}</DetailValue>
              <DetailLabel>Priority</DetailLabel>
              <DetailValue>{selectedItem.priority}</DetailValue>
              <DetailLabel>Trade</DetailLabel>
              <DetailValue>{selectedItem.trade}</DetailValue>
              <DetailLabel>Assignee</DetailLabel>
              <DetailValue>{selectedItem.assignee}</DetailValue>
              <DetailLabel>Submitted By</DetailLabel>
              <DetailValue>{selectedItem.submittedBy}</DetailValue>
              <DetailLabel>Created Date</DetailLabel>
              <DetailValue>{formatDueDate(selectedItem.createdDate)}</DetailValue>
              <DetailLabel>Due Date</DetailLabel>
              <DetailValue>{formatDueDate(selectedItem.dueDate)}</DetailValue>
              <DetailLabel>Spec Section</DetailLabel>
              <DetailValue>{selectedItem.specSection}</DetailValue>
              <DetailLabel>Description</DetailLabel>
              <DetailValue>{selectedItem.description}</DetailValue>
            </DetailGrid>
          </TearsheetBody>
        </>
      )}
    </Tearsheet>
    </>
  );
}
