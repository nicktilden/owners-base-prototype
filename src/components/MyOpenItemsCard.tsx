import React, { useState } from "react";
import { Button, Pill, Search, Tearsheet, Typography } from "@procore/core-react";
import {
  ExternalLink,
  FileQuestionMark,
  ClipboardPushpin,
  PencilErase,
  File,
} from "@procore/core-icons";
import styled from "styled-components";
import { sampleOpenItemRows, type OpenItemRow } from "@/data/openitems";
import HubCardFrame from "@/components/hubs/HubCardFrame";

// ─── Hub Card anatomy ─────────────────────────────────────────────────────────

const QuickFilter = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 16px;
  height: 36px;
  padding: 6px 6px 6px 12px;
  border: 1px solid #acb5b9;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 400;
  color: #232729;
  letter-spacing: 0.15px;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    border-color: #6a767c;
  }
`;

// ─── Table layout ─────────────────────────────────────────────────────────────

const ItemTable = styled.div`
  width: 100%;
  border: 1px solid #d6dadc;
  border-radius: 8px;
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 110px 1fr auto auto;
  padding: 0 12px;
  height: 32px;
  align-items: center;
  border-bottom: 1px solid #d6dadc;
`;

const HeaderCell = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #6a767c;
  letter-spacing: 0.25px;
  line-height: 16px;
  white-space: nowrap;

  &:nth-child(3) {
    text-align: right;
    padding-right: 16px;
  }
  &:nth-child(4) {
    text-align: right;
  }
`;

const ItemRow = styled.div`
  display: grid;
  grid-template-columns: 110px 1fr auto auto;
  padding: 0 12px;
  min-height: 52px;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #d6dadc;
  cursor: pointer;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f4f5f6;
  }
`;

const TypeCell = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  overflow: hidden;
`;

const TypeLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #232729;
  letter-spacing: 0.25px;
  line-height: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 118px;
`;

const TitleCell = styled.div`
  min-width: 0;
  padding-right: 16px;
`;

const ProjectLabel = styled.div`
  font-size: 12px;
  font-weight: 400;
  color: #6a767c;
  letter-spacing: 0.25px;
  line-height: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ItemLinkButton = styled.button`
  font-size: 14px;
  font-weight: 600;
  color: #1d5cc9;
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
  font-size: 12px;
  font-weight: 600;
  color: ${({ $overdue }) => ($overdue ? "#c42223" : "#232729")};
  letter-spacing: 0.25px;
  line-height: 16px;
  white-space: nowrap;
  text-align: right;
  padding-right: 16px;
`;

const StatusCell = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const TearsheetHeader = styled.div`
  padding: 20px 24px 12px;
  border-bottom: 1px solid #d6dadc;
`;

const TearsheetBody = styled.div`
  padding: 16px 24px 24px;
  overflow-y: auto;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: 160px 1fr;
  row-gap: 10px;
  column-gap: 12px;
`;

const DetailLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #6a767c;
`;

const DetailValue = styled.div`
  font-size: 14px;
  color: #232729;
`;

// ─── Data ─────────────────────────────────────────────────────────────────────

const CURRENT_USER = "Sidney Shah";

/** Top 5 open (non-closed, non-void) items assigned to the current user, sorted soonest due date first. */
const MY_OPEN_ITEMS: OpenItemRow[] = sampleOpenItemRows
  .filter((r) => r.assignee === CURRENT_USER && r.status !== "Closed" && r.status !== "Void")
  .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  .slice(0, 5);

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
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function isOverdue(isoDate: string): boolean {
  return isoDate < "2026-03-27";
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MyOpenItemsCard() {
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<OpenItemRow | null>(null);

  const filtered = MY_OPEN_ITEMS.filter((item) => {
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
      actions={
        <Button
          variant="tertiary"
          size="sm"
          icon={<ExternalLink size="sm" />}
          aria-label="View all open items"
        >
          View All
        </Button>
      }
      controls={
        <>
          <Search
            placeholder="Search"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
          <QuickFilter aria-label="Filter by Project Name">
            Project Name
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M7 10l5 5 5-5" stroke="#232729" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </QuickFilter>
          <QuickFilter aria-label="Filter by Item Type">
            Item Type
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M7 10l5 5 5-5" stroke="#232729" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </QuickFilter>
          <QuickFilter aria-label="Filter by Progress">
            Progress
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M7 10l5 5 5-5" stroke="#232729" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </QuickFilter>
        </>
      }
    >
        <ItemTable role="table" aria-label="My open items">
          <TableHeader role="row">
            <HeaderCell role="columnheader">Type</HeaderCell>
            <HeaderCell role="columnheader">Project Details and Open Item Title</HeaderCell>
            <HeaderCell role="columnheader">Due Date</HeaderCell>
            <HeaderCell role="columnheader">Status</HeaderCell>
          </TableHeader>

          {filtered.map((item) => {
            const overdue = isOverdue(item.dueDate);
            return (
              <ItemRow key={item.id} role="row" tabIndex={0}>
                <TypeCell role="cell">
                  <span style={{ color: "#232729", display: "flex", alignItems: "center", flexShrink: 0 }}>
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
                    {item.number}: {item.title}
                  </ItemLinkButton>
                </TitleCell>

                <DueDateCell role="cell" $overdue={overdue}>
                  {formatDueDate(item.dueDate)}
                </DueDateCell>

                <StatusCell role="cell">
                  <Pill color={STATUS_COLOR[item.status] ?? "gray"}>
                    {item.status}
                  </Pill>
                </StatusCell>
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
            <Typography intent="h2" style={{ fontWeight: 700, color: "#232729" }}>
              {selectedItem.number}
            </Typography>
            <Typography intent="body" style={{ display: "block", color: "#6a767c", marginTop: 2 }}>
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
