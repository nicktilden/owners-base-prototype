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
import styled, { createGlobalStyle } from "styled-components";
import { sampleOpenItemRows, type OpenItemRow } from "@/data/openitems";
import { rfis } from "@/data/seed/rfis";
import { projects } from "@/data/seed/projects";
import { usePersona } from "@/context/PersonaContext";
import { useHubFilters } from "@/context/HubFilterContext";
import HubCardFrame from "@/components/hubs/HubCardFrame";
import { useAiPanel } from "@/context/AiPanelContext";
import { formatDateMMDDYYYY } from "@/utils/date";
import { useHubLoading } from "@/context/HubLoadingContext";
import HubCardSkeleton from "@/components/skeletons/HubCardSkeleton";
import MyOpenItemsSkeleton from "@/components/skeletons/MyOpenItemsSkeleton";
import HubCardTable from "@/components/HubCardTable";

// ─── Hub Card anatomy ─────────────────────────────────────────────────────────

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
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

const MyOpenItemsTearsheetWidth = createGlobalStyle`
  [class*="StyledTearsheetBody"]:has(> .my-open-items-tearsheet-root) {
    flex: 0 0 60vw !important;
  }
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

/** OpenItemRow with projectId normalised to seed string format ('proj-001'). */
type OpenItemRowNorm = Omit<OpenItemRow, 'projectId'> & { projectId: string };

function useMyOpenItems(): OpenItemRowNorm[] {
  const { activeUser } = usePersona();
  return useMemo(() => {
    const userName = activeUser
      ? `${activeUser.firstName} ${activeUser.lastName}`
      : "Bridget O'Sullivan";

    // RFIs assigned to the active user, converted to OpenItemRowNorm shape
    const rfiItems: OpenItemRowNorm[] = rfis
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
          // Keep the seed string ID for reliable cross-source filtering
          projectId: r.projectId,
          projectNumber: proj?.number ?? '',
          projectName: proj?.name ?? '',
          specSection: '',
          description: r.question,
        };
      });

    // sampleOpenItemRows items — convert numeric projectId to seed string format
    const legacyItems = sampleOpenItemRows
      .filter((r) => r.assignee === userName && r.status !== "Closed" && r.status !== "Void")
      .map((r) => ({
        ...r,
        // Normalise to seed string format so filtering is consistent
        projectId: `proj-${String(r.projectId).padStart(3, '0')}`,
      }));

    return [...rfiItems, ...legacyItems]
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
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

interface MyOpenItemsCardProps {
  /** Seed string project ID (e.g. 'proj-001'). When provided, filters to only items for this project. */
  seedProjectId?: string;
}

export default function MyOpenItemsCard({ seedProjectId }: MyOpenItemsCardProps = {}) {
  const { isLoading } = useHubLoading();
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<OpenItemRowNorm | null>(null);
  const [projectFilter, setProjectFilter] = useState("All Projects");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [progressFilter, setProgressFilter] = useState("All Progress");
  const { openPanel: openAiPanel } = useAiPanel();
  const { filteredSeedProjects } = useHubFilters();
  const allOpenItems = useMyOpenItems();

  const filteredProjectIds = new Set(filteredSeedProjects.map((p) => p.id));
  const MY_OPEN_ITEMS = seedProjectId != null
    ? allOpenItems.filter((item) => item.projectId === seedProjectId)
    : allOpenItems.filter((item) => filteredProjectIds.has(item.projectId));

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

  if (isLoading) {
    return (
      <HubCardSkeleton hasControls controlCount={3} actionCount={3}>
        <MyOpenItemsSkeleton />
      </HubCardSkeleton>
    );
  }

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
          {seedProjectId == null && (
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
          )}
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
        <HubCardTable columns="100px 1fr 110px 100px 36px">
          <HubCardTable.Header>
            <HubCardTable.HeaderCell>Type</HubCardTable.HeaderCell>
            <HubCardTable.HeaderCell>{seedProjectId != null ? "Open Item Title" : "Project Details and Open Item Title"}</HubCardTable.HeaderCell>
            <HubCardTable.HeaderCell>Due Date</HubCardTable.HeaderCell>
            <HubCardTable.HeaderCell>Status</HubCardTable.HeaderCell>
            <HubCardTable.HeaderCell />
          </HubCardTable.Header>
          <HubCardTable.Body>
          {filtered.map((item, idx) => {
            const overdue = isOverdue(item.dueDate);
            return (
              <HubCardTable.Row key={item.id} index={idx}>
                <HubCardTable.Cell>
                  <TypeCell>
                    <span style={{ color: "var(--color-text-primary)", display: "flex", alignItems: "center", flexShrink: 0 }}>
                      {TYPE_ICONS[item.type] ?? <File size="sm" />}
                    </span>
                    <TypeLabel>{item.type}</TypeLabel>
                  </TypeCell>
                </HubCardTable.Cell>

                <HubCardTable.Cell>
                  <TitleCell>
                    {seedProjectId == null && <ProjectLabel>{item.projectName}</ProjectLabel>}
                    <ItemLinkButton
                      onClick={() => setSelectedItem(item)}
                      aria-label={`Open details for ${item.number}`}
                    >
                      {item.number}: {item.title.length > 24 ? `${item.title.slice(0, 24)}…` : item.title}
                    </ItemLinkButton>
                  </TitleCell>
                </HubCardTable.Cell>

                <HubCardTable.Cell>
                  <DueDateCell $overdue={overdue}>
                    {formatDueDate(item.dueDate)}
                  </DueDateCell>
                </HubCardTable.Cell>

                <HubCardTable.Cell>
                  <StatusCell>
                    <Pill color={STATUS_COLOR[item.status] ?? "gray"} data-pill-color={STATUS_COLOR[item.status] ?? "gray"}>
                      {item.status}
                    </Pill>
                  </StatusCell>
                </HubCardTable.Cell>

                <HubCardTable.Cell style={{ display: "flex", justifyContent: "center" }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const overdue = isOverdue(item.dueDate);
                      openAiPanel({
                        itemName: `${item.number}: ${item.title}`,
                        itemId: item.number,
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
                </HubCardTable.Cell>
              </HubCardTable.Row>
            );
          })}
          </HubCardTable.Body>
        </HubCardTable>
    </HubCardFrame>
    <MyOpenItemsTearsheetWidth />
    <Tearsheet
      open={selectedItem !== null}
      onClose={() => setSelectedItem(null)}
      placement="right"
      block
      aria-label="Open item details"
    >
      <div className="my-open-items-tearsheet-root" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
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
      </div>
    </Tearsheet>
    </>
  );
}
