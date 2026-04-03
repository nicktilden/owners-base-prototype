import React from "react";
import { Button } from "@procore/core-react";
import {
  Comments,
  ClipboardBulletedChecks,
  Calendar,
  Circle,
  FileList,
  EllipsisVertical,
} from "@procore/core-icons";
import styled from "styled-components";
import { sampleOpenItemRows } from "@/data/openitems";
import HubCardFrame from "@/components/hubs/HubCardFrame";
import { formatDateMMDDYYYY } from "@/utils/date";

// ─── Hub Card anatomy ─────────────────────────────────────────────────────────

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

// ─── Alert Banner (orange summary strip) ─────────────────────────────────────

const AlertBanner = styled.div`
  background: #fff1eb;
  border-radius: 4px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
`;

const AlertDate = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: #ff5100;
  letter-spacing: 0.15px;
  line-height: 20px;
`;

const AlertBody = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 400;
  color: #ff5100;
  letter-spacing: 0.15px;
  line-height: 20px;
`;

const AlertBold = styled.span`
  font-weight: 600;
`;

// ─── Brief List ───────────────────────────────────────────────────────────────

const BriefList = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid #d6dadc;
  border-radius: 8px;
  overflow: hidden;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`;

const BriefRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
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

const IconWrap = styled.div`
  background: #f4f5f6;
  border-radius: 40px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #6a767c;
`;

const RowContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;

const RowTitleLine = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const RowTitle = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #1d5cc9;
  letter-spacing: 0.15px;
  line-height: 20px;
  white-space: nowrap;
`;

const CountBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  background: #ff5100;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  line-height: 16px;
  flex-shrink: 0;
`;

const RowSubtitle = styled.span`
  font-size: 12px;
  font-weight: 400;
  color: #6a767c;
  letter-spacing: 0.25px;
  line-height: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// ─── Data ─────────────────────────────────────────────────────────────────────

const CURRENT_USER = "Sidney Shah";
const TODAY = "2026-03-27";

/** Open items assigned to the current user that are not Closed or Void. */
const myOpenItems = sampleOpenItemRows.filter(
  (r) => r.assignee === CURRENT_USER && r.status !== "Closed" && r.status !== "Void"
);

/** Overdue items (past due date). */
const overdueCount = myOpenItems.filter((r) => r.dueDate < TODAY).length;

/** Items due within the next 14 days. */
const upcomingCount = myOpenItems.filter(
  (r) => r.dueDate >= TODAY && r.dueDate <= "2026-04-10"
).length;

const BRIEF_ROWS = [
  {
    id: "conversations",
    icon: <Comments size="sm" />,
    title: "Unread Conversations",
    count: 12,
    subtitle: "Including 2 from the Foreman about Monarch Apartments",
  },
  {
    id: "openitems",
    icon: <ClipboardBulletedChecks size="sm" />,
    title: "Open Items Due Soon",
    count: overdueCount + upcomingCount || myOpenItems.length,
    subtitle: `${myOpenItems.length} total open items assigned to you`,
  },
  {
    id: "meetings",
    icon: <Calendar size="sm" />,
    title: "Today's Meetings",
    count: 2,
    subtitle: "Design review at 2 PM, Client call at 4 PM",
  },
  {
    id: "milestones",
    icon: <Circle size="sm" />,
    title: "Upcoming Project Milestones",
    count: 1,
    subtitle: "Foundation completion review on Aegis Medical Pavilion",
  },
  {
    id: "documents",
    icon: <FileList size="sm" />,
    title: "New Documents",
    count: 3,
    subtitle: "Updated drawings and specifications",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AIDailyPlannerCard() {
  const today = formatDateMMDDYYYY(TODAY);

  return (
    <HubCardFrame
      title="Daily Brief"
      infoTooltip="AI-generated daily summary built from seeded open items, meeting placeholders, upcoming milestones, and new document signals."
      actions={
        <HeaderActions>
          <Button variant="secondary" size="sm" aria-label="Start Day">
            Start Day
          </Button>
          <Button
            variant="tertiary"
            size="sm"
            icon={<EllipsisVertical size="sm" />}
            aria-label="More actions"
          />
        </HeaderActions>
      }
    >
      <AlertBanner style={{ marginBottom: 8 }}>
        <AlertDate>Today, {today}</AlertDate>
        <AlertBody>
          You have{" "}
          <AlertBold>{overdueCount} urgent items</AlertBold>
          {" "}and{" "}
          <AlertBold>{upcomingCount} upcoming deadlines</AlertBold>
          {" "}this week
        </AlertBody>
      </AlertBanner>

      {/* Brief List */}
      <BriefList>
        {BRIEF_ROWS.map((row) => (
          <BriefRow key={row.id} tabIndex={0}>
            <IconWrap>{row.icon}</IconWrap>
            <RowContent>
              <RowTitleLine>
                <RowTitle>{row.title}</RowTitle>
                <CountBadge>{row.count}</CountBadge>
              </RowTitleLine>
              <RowSubtitle>{row.subtitle}</RowSubtitle>
            </RowContent>
          </BriefRow>
        ))}
      </BriefList>
    </HubCardFrame>
  );
}
