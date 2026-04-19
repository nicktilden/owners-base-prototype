/**
 * Project Overview Hub Cards
 * All cards are scoped to a single project via `projectRowId` (numeric, matching sampleProjectRows.id).
 */

import React, { useMemo, useState } from "react";
import { Button, Link, Pill, Typography } from "@procore/core-react";
import {
  ArrowRight,
  Building,
  Calendar,
  ChevronDown,
  CompassDirection,
  ExternalLink,
  Location,
  Person,
  Ruler,
  ConcentricCircles,
} from "@procore/core-icons";
import styled from "styled-components";
import { sampleProjectRows } from "@/data/projects";
import { scheduleEntries } from "@/data/seed/schedule";
import type { Milestone } from "@/types/schedule";
import { users } from "@/data/seed/users";
import { sampleOpenItemRows } from "@/data/openitems";
import HubCardFrame from "@/components/hubs/HubCardFrame";
import { formatDateMMDDYYYY } from "@/utils/date";

// ─── Shared helpers ────────────────────────────────────────────────────────────

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

/** Convert numeric projectRowId (1–50) to seed string format ('proj-001'…'proj-020'). */
function toSeedId(projectRowId: number): string {
  return `proj-${String(projectRowId).padStart(3, "0")}`;
}

// ─── 1. ProjectInfoCard ──────────────────────────────────────────────────────

const ProjectImagePlaceholder = styled.div`
  width: 120px;
  height: 80px;
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border-separator);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--color-icon-secondary);
`;

const PrimaryRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
`;

const ProjectNameBlock = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ProjectInfoDivider = styled.div`
  height: 1px;
  background: var(--color-border-separator);
`;

const SecondaryRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
`;

const StatCol = styled.div`
  display: flex;
  gap: 4px;
  align-items: flex-start;
  flex-shrink: 0;
`;

const StatIconWrap = styled.div`
  padding-top: 3px;
  color: var(--color-text-secondary);
  display: flex;
  align-items: flex-start;
`;

const StatTextBlock = styled.div`
  display: flex;
  flex-direction: column;
`;

const WeatherBlock = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 4px 8px;
  flex-shrink: 0;
`;

interface CardProps {
  projectRowId: number;
}

export function ProjectInfoCard({ projectRowId }: CardProps) {
  const project = sampleProjectRows.find((r) => r.id === projectRowId);

  if (!project) {
    return (
      <HubCardFrame title="Project Info">
        <Typography intent="small" style={{ color: "var(--color-text-secondary)" }}>
          Project not found.
        </Typography>
      </HubCardFrame>
    );
  }

  const addressLine1 = project.streetAddress ?? "";
  const addressLine2 = `${project.city}, ${project.state}`;
  const fullAddress = addressLine1 ? `${addressLine1}, ${addressLine2}` : addressLine2;

  const actions = (
    <HeaderActions>
      <Button variant="tertiary" size="sm" className="b_tertiary">
        Edit
      </Button>
    </HeaderActions>
  );

  const statItems = [
    { icon: <ConcentricCircles size="sm" />, label: "Stage", value: project.stage },
    { icon: <Ruler size="sm" />, label: "Priority", value: project.priority, capitalize: true },
    { icon: <CompassDirection size="sm" />, label: "Region", value: project.region },
    { icon: <Calendar size="sm" />, label: "Start Date", value: formatDateMMDDYYYY(project.startDate) },
    { icon: <Person size="sm" />, label: "Project Manager", value: project.projectManager },
  ];

  return (
    <HubCardFrame title="Project Info" actions={actions}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <PrimaryRow>
          <ProjectImagePlaceholder>
            <Building size="lg" />
          </ProjectImagePlaceholder>

          <ProjectNameBlock>
            <Typography
              style={{
                fontSize: 20,
                fontWeight: 600,
                lineHeight: "28px",
                letterSpacing: "0.15px",
                color: "var(--color-text-primary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "block",
              }}
            >
              {project.number} — {project.name}
            </Typography>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <Location size="sm" style={{ color: "var(--color-text-secondary)", flexShrink: 0 }} />
              <Link href="#">{fullAddress}</Link>
            </div>
          </ProjectNameBlock>

          <WeatherBlock>
            <span style={{ fontSize: 18, lineHeight: 1 }} aria-hidden="true">⛅</span>
            <Typography
              style={{
                fontSize: 20,
                fontWeight: 600,
                lineHeight: "20px",
                letterSpacing: "0.15px",
                color: "var(--color-text-primary)",
              }}
            >
              87°<span style={{ fontSize: 13, fontWeight: 400 }}>F</span>
            </Typography>
            <Typography
              intent="small"
              style={{ color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}
            >
              91° | 64°
            </Typography>
          </WeatherBlock>
        </PrimaryRow>

        <ProjectInfoDivider />

        <SecondaryRow>
          {statItems.map(({ icon, label, value, capitalize }) => (
            <StatCol key={label}>
              <StatIconWrap>{icon}</StatIconWrap>
              <StatTextBlock>
                <Typography
                  intent="small"
                  style={{
                    color: "var(--color-text-secondary)",
                    lineHeight: "20px",
                    letterSpacing: "0.15px",
                    fontSize: 14,
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </Typography>
                <Typography
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    lineHeight: "20px",
                    letterSpacing: "0.15px",
                    color: "var(--color-text-primary)",
                    whiteSpace: "nowrap",
                    textTransform: capitalize ? "capitalize" : undefined,
                  }}
                >
                  {String(value ?? "—")}
                </Typography>
              </StatTextBlock>
            </StatCol>
          ))}
        </SecondaryRow>
      </div>
    </HubCardFrame>
  );
}

// ─── 2. ProjectLinksCard ──────────────────────────────────────────────────────

interface ProjectLink {
  label: string;
  url: string;
  hasExternal?: boolean;
}

const PROJECT_LINKS_DATA: Record<string, ProjectLink[]> = {
  default: [
    { label: "Site Logistic Plans", url: "#", hasExternal: false },
    { label: "Resource Delivery Schedule", url: "#", hasExternal: true },
    { label: "Latest Drawings", url: "#", hasExternal: false },
    { label: "EarthCam Link", url: "#", hasExternal: true },
    { label: "DroneDeploy Management", url: "#", hasExternal: true },
  ],
};

// Per-project overrides for first few projects for variety
const PROJECT_LINKS_OVERRIDES: Record<number, ProjectLink[]> = {
  1: [
    { label: "Site Logistic Plans", url: "#" },
    { label: "Structural Steel Submittals", url: "#", hasExternal: true },
    { label: "Latest Drawings — Tower", url: "#" },
    { label: "EarthCam — Tower Expansion", url: "#", hasExternal: true },
    { label: "MEP Coordination Model", url: "#", hasExternal: true },
  ],
  2: [
    { label: "Site Logistic Plans", url: "#" },
    { label: "Resource Delivery Schedule", url: "#", hasExternal: true },
    { label: "Latest Drawings", url: "#" },
    { label: "Owner Portal", url: "#", hasExternal: true },
    { label: "DroneDeploy Management", url: "#", hasExternal: true },
  ],
  3: [
    { label: "Renovation Drawings", url: "#" },
    { label: "Equipment Schedule", url: "#", hasExternal: true },
    { label: "Safety Plan", url: "#" },
    { label: "BIM Model (Navisworks)", url: "#", hasExternal: true },
    { label: "Project Dashboard", url: "#", hasExternal: true },
  ],
};

const LinkList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid var(--color-border-separator);
  border-radius: 8px;
  overflow: hidden;
`;

const LinkRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: var(--color-surface-primary);
  border-bottom: 1px solid var(--color-border-separator);
  gap: 8px;
  min-height: 40px;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--color-surface-hover);
  }
`;

const LinkLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-link);
  text-decoration: underline;
  letter-spacing: 0.15px;
  line-height: 20px;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
`;

const LinkIconBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--color-text-secondary);
  flex-shrink: 0;
  padding: 0;

  &:hover {
    background: var(--color-surface-secondary);
    color: var(--color-text-primary);
  }
`;

export function ProjectLinksCard({ projectRowId }: CardProps) {
  const links = PROJECT_LINKS_OVERRIDES[projectRowId] ?? PROJECT_LINKS_DATA.default;

  const actions = (
    <HeaderActions>
      <Button variant="secondary" size="sm" className="b_secondary">
        + Add Link
      </Button>
      <Button variant="tertiary" size="sm" className="b_tertiary">
        View All
      </Button>
    </HeaderActions>
  );

  return (
    <HubCardFrame
      title="Project Links"
      infoTooltip="Quick links to frequently accessed project resources, drawings, and external tools."
      actions={actions}
    >
      <LinkList>
        {links.map((link) => (
          <LinkRow key={link.label}>
            <LinkLabel>{link.label}</LinkLabel>
            {link.hasExternal && (
              <LinkIconBtn aria-label={`Open ${link.label} externally`}>
                <ExternalLink size="sm" />
              </LinkIconBtn>
            )}
          </LinkRow>
        ))}
      </LinkList>
    </HubCardFrame>
  );
}

// ─── 3. SiteSafetyCard ────────────────────────────────────────────────────────

const SafetyBody = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

const SafetyContent = styled.div`
  height: 100%;
  overflow-y: auto;
  padding-bottom: 24px;
`;

const SafetyFade = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(to bottom, transparent, var(--color-surface-card));
  pointer-events: none;
`;

const SafetyText = styled.p`
  font-size: 13px;
  color: var(--color-text-primary);
  line-height: 1.6;
  margin: 0 0 12px;
`;

const SafetyHeading = styled.h3`
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 12px 0 6px;
`;

const SafetyList = styled.ul`
  margin: 0 0 12px;
  padding-left: 18px;
  font-size: 13px;
  color: var(--color-text-primary);
  line-height: 1.6;

  li {
    margin-bottom: 4px;
  }
`;

const SAFETY_CONTENT = (
  <>
    <SafetyText>
      All personnel on site must wear appropriate PPE at all times, including hard hats, high-visibility
      vests, steel-toed boots, and safety glasses in designated areas.
    </SafetyText>
    <SafetyHeading>Emergency Procedures</SafetyHeading>
    <SafetyList>
      <li>First aid kits and fire extinguishers are located at all entry points and floor break areas.</li>
      <li>Report all injuries immediately to your supervisor and the safety officer.</li>
      <li>Know the evacuation routes and assembly points posted at each stairwell.</li>
      <li>Emergency contact numbers are posted at the site office and all break rooms.</li>
    </SafetyList>
    <SafetyHeading>General Safety</SafetyHeading>
    <SafetyList>
      <li>Maintain good housekeeping — clean up immediately after each task.</li>
      <li>No horseplay or distractions on the jobsite.</li>
      <li>No drug or alcohol use; violations will result in immediate removal from site.</li>
      <li>Stay hydrated — water stations are located at each floor.</li>
      <li>Participate in all toolbox talks and weekly safety meetings.</li>
      <li>Report unsafe conditions using the safety reporting app or directly to supervision.</li>
      <li>Follow all site-specific safety plans and OSHA regulations at all times.</li>
    </SafetyList>
  </>
);

export function SiteSafetyCard({ projectRowId: _ }: CardProps) {
  const newBadge = (
    <Pill color="blue">
      New
    </Pill>
  );

  return (
    <HubCardFrame
      title="Site Safety & Information"
      titleSuffix={newBadge}
      style={{ display: "flex", flexDirection: "column" }}
    >
      <SafetyBody>
        <SafetyContent>{SAFETY_CONTENT}</SafetyContent>
        <SafetyFade />
      </SafetyBody>
    </HubCardFrame>
  );
}

// ─── 4. ProjectDatesCard ──────────────────────────────────────────────────────

interface MilestoneRow {
  name: string;
  baselineDate: Date;
  actualDate: Date | null;
  varianceDays: number;
}

const DATES_PAGE_SIZE = 4;

const DatesTable = styled.div`
  width: 100%;
`;

const DatesTableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 120px 120px 80px;
  padding: 0 8px;
  height: 28px;
  align-items: center;
  border-bottom: 1px solid var(--color-border-separator);
`;

const DatesHeaderCell = styled.span`
  font-size: 12px;
  color: var(--color-text-secondary);
  font-weight: 500;
`;

const DatesRow = styled.div<{ $even?: boolean }>`
  display: grid;
  grid-template-columns: 1fr 120px 120px 80px;
  padding: 0 8px;
  min-height: 40px;
  align-items: center;
  background: ${({ $even }) =>
    $even ? "var(--color-surface-primary)" : "var(--color-surface-secondary)"};
  border-bottom: 1px solid var(--color-border-separator);

  &:last-child {
    border-bottom: none;
  }
`;

const DatesNameCell = styled.span`
  font-size: 13px;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 8px;
`;

const DatesDateCell = styled.span`
  font-size: 12px;
  color: var(--color-text-secondary);
`;

const VarianceCell = styled.span<{ $late?: boolean; $early?: boolean }>`
  font-size: 12px;
  font-weight: 600;
  color: ${({ $late, $early }) =>
    $late ? "#d92626" : $early ? "#1d7c40" : "var(--color-text-secondary)"};
`;

const DatesPagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0 0;
  border-top: 1px solid var(--color-border-separator);
  margin-top: 4px;
`;

const PageInfo = styled.span`
  font-size: 12px;
  color: var(--color-text-secondary);
`;

const TimelineWrap = styled.div`
  padding: 8px 0 12px;
  flex-shrink: 0;
`;

const TimelineSvgWrap = styled.div`
  width: 100%;
  overflow: hidden;
`;

function formatVariance(days: number, hasActual: boolean): string {
  if (!hasActual) return "—";
  if (days === 0) return "On schedule";
  return days > 0 ? `+${days} days` : `${days} days`;
}

export function ProjectDatesCard({ projectRowId }: CardProps) {
  const seedId = toSeedId(projectRowId);

  const milestones = useMemo<MilestoneRow[]>(() => {
    return (scheduleEntries.filter(
      (e) => e.projectId === seedId && e.type === "milestone"
    ) as Milestone[]).map((m) => {
      const baseline = m.milestoneDate instanceof Date ? m.milestoneDate : new Date(m.milestoneDate as string);
      const actual = m.actualMilestoneDate
        ? m.actualMilestoneDate instanceof Date
          ? m.actualMilestoneDate
          : new Date(m.actualMilestoneDate as string)
        : null;
      const varianceDays = actual
        ? Math.round((actual.getTime() - baseline.getTime()) / 86400000)
        : 0;
      return { name: m.name, baselineDate: baseline, actualDate: actual, varianceDays };
    });
  }, [seedId]);

  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(milestones.length / DATES_PAGE_SIZE));
  const pageItems = milestones.slice(page * DATES_PAGE_SIZE, (page + 1) * DATES_PAGE_SIZE);

  const project = sampleProjectRows.find((r) => r.id === projectRowId);
  const dateRange = project
    ? `${formatDateMMDDYYYY(project.startDate)} – ${formatDateMMDDYYYY(project.endDate)}`
    : "";

  const projectStart = project ? new Date(project.startDate) : null;
  const projectEnd = project ? new Date(project.endDate) : null;

  const dateSuffix = dateRange ? (
    <span style={{ fontSize: 12, color: "var(--color-text-secondary)", marginLeft: 4 }}>{dateRange}</span>
  ) : null;

  const actions = (
    <HeaderActions>
      <Button variant="tertiary" size="sm" className="b_tertiary" icon={<ChevronDown size="sm" />}>
        More
      </Button>
    </HeaderActions>
  );

  return (
    <HubCardFrame
      title="Project Dates"
      titleSuffix={dateSuffix}
      infoTooltip="Project milestones with baseline dates, actual dates, and schedule variance."
      actions={actions}
    >
      {milestones.length === 0 || !projectStart || !projectEnd ? (
        <div style={{ color: "var(--color-text-secondary)", fontSize: 13, padding: "12px 0", textAlign: "center" }}>
          No schedule data available for this project.
        </div>
      ) : (
        <>
          <TimelineWrap>
            <MilestoneTimeline
              milestones={milestones}
              projectStartDate={projectStart!}
              projectEndDate={projectEnd!}
            />
          </TimelineWrap>
          <DatesTable>
            <DatesTableHeader>
              <DatesHeaderCell>Name</DatesHeaderCell>
              <DatesHeaderCell>Baseline Date</DatesHeaderCell>
              <DatesHeaderCell>Actual Date</DatesHeaderCell>
              <DatesHeaderCell>Variance</DatesHeaderCell>
            </DatesTableHeader>
            {pageItems.map((m, idx) => (
              <DatesRow key={m.name} $even={idx % 2 === 0}>
                <DatesNameCell title={m.name}>{m.name}</DatesNameCell>
                <DatesDateCell>{formatDateMMDDYYYY(m.baselineDate.toISOString().slice(0, 10))}</DatesDateCell>
                <DatesDateCell>
                  {m.actualDate
                    ? formatDateMMDDYYYY(m.actualDate.toISOString().slice(0, 10))
                    : "—"}
                </DatesDateCell>
                <VarianceCell $late={m.varianceDays > 0} $early={m.varianceDays < 0}>
                  {formatVariance(m.varianceDays, !!m.actualDate)}
                </VarianceCell>
              </DatesRow>
            ))}
          </DatesTable>
          {milestones.length > DATES_PAGE_SIZE && (
            <DatesPagination>
              <PageInfo>
                {page * DATES_PAGE_SIZE + 1}–{Math.min((page + 1) * DATES_PAGE_SIZE, milestones.length)} of{" "}
                {milestones.length}
              </PageInfo>
              <div style={{ display: "flex", gap: 4 }}>
                <Button
                  variant="tertiary"
                  size="sm"
                  className="b_tertiary"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  ‹
                </Button>
                <Button
                  variant="tertiary"
                  size="sm"
                  className="b_tertiary"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                >
                  ›
                </Button>
              </div>
            </DatesPagination>
          )}
        </>
      )}
    </HubCardFrame>
  );
}

// ─── Milestone Timeline SVG ───────────────────────────────────────────────────

function MilestoneTimeline({
  milestones,
  projectStartDate,
  projectEndDate,
}: {
  milestones: MilestoneRow[];
  projectStartDate: Date;
  projectEndDate: Date;
}) {
  const SVG_W = 500;
  const SVG_H = 76;
  const TRACK_Y = 38;
  const DIAMOND_SIZE = 7;
  const PAD = 52;
  const TODAY_DATE = new Date("2026-04-17");

  const startT = projectStartDate.getTime();
  const endT = projectEndDate.getTime();
  const span = Math.max(endT - startT, 1);
  const toX = (t: number) => PAD + ((t - startT) / span) * (SVG_W - 2 * PAD);

  const todayT = TODAY_DATE.getTime();
  const todayX = toX(todayT);
  const showToday = todayT > startT && todayT < endT;

  return (
    <TimelineSvgWrap>
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: "100%", height: SVG_H, display: "block" }}
        aria-label="Project milestone timeline"
      >
        {/* Track */}
        <line
          x1={PAD} y1={TRACK_Y} x2={SVG_W - PAD} y2={TRACK_Y}
          stroke="var(--color-border-default)" strokeWidth={2}
        />

        {/* Start cap + date label */}
        <line x1={PAD} y1={TRACK_Y - 5} x2={PAD} y2={TRACK_Y + 5}
          stroke="var(--color-border-default)" strokeWidth={2} />
        <text x={PAD} y={SVG_H - 3} textAnchor="start" fontSize={9}
          fill="var(--color-text-secondary)">
          {formatDateMMDDYYYY(projectStartDate.toISOString().slice(0, 10))}
        </text>

        {/* End cap + date label */}
        <line x1={SVG_W - PAD} y1={TRACK_Y - 5} x2={SVG_W - PAD} y2={TRACK_Y + 5}
          stroke="var(--color-border-default)" strokeWidth={2} />
        <text x={SVG_W - PAD} y={SVG_H - 3} textAnchor="end" fontSize={9}
          fill="var(--color-text-secondary)">
          {formatDateMMDDYYYY(projectEndDate.toISOString().slice(0, 10))}
        </text>

        {/* Today marker */}
        {showToday && (
          <g>
            <line
              x1={todayX} y1={TRACK_Y - 16} x2={todayX} y2={TRACK_Y + 16}
              stroke="var(--color-action-primary)" strokeWidth={1.5}
              strokeDasharray="3,2"
            />
            <text x={todayX} y={9} textAnchor="middle" fontSize={8}
              fill="var(--color-action-primary)" fontWeight="600">
              Today
            </text>
          </g>
        )}

        {/* Milestone diamonds */}
        {milestones.map((m, idx) => {
          const x = toX(m.baselineDate.getTime());
          if (x < PAD - 4 || x > SVG_W - PAD + 4) return null;

          const hasActual = !!m.actualDate;
          const isLate = m.varianceDays > 0;
          const fill = hasActual
            ? isLate
              ? "var(--color-feedback-negative, #d92626)"
              : "var(--color-feedback-positive, #1d7c40)"
            : "var(--color-text-disabled, #9ca3af)";

          const abbrev = m.name.length > 15 ? m.name.slice(0, 14) + "…" : m.name;
          const above = idx % 2 === 0;
          const labelY = above
            ? TRACK_Y - DIAMOND_SIZE - 5
            : TRACK_Y + DIAMOND_SIZE + 13;

          return (
            <g key={m.name}>
              <polygon
                points={`${x},${TRACK_Y - DIAMOND_SIZE} ${x + DIAMOND_SIZE},${TRACK_Y} ${x},${TRACK_Y + DIAMOND_SIZE} ${x - DIAMOND_SIZE},${TRACK_Y}`}
                fill={fill}
                stroke="white"
                strokeWidth={1.5}
              />
              <text x={x} y={labelY} textAnchor="middle" fontSize={9}
                fill="var(--color-text-secondary)">
                {abbrev}
              </text>
            </g>
          );
        })}
      </svg>
    </TimelineSvgWrap>
  );
}

// ─── 5. AllOpenItemsCard ──────────────────────────────────────────────────────

const TODAY = new Date("2026-04-17");

interface BarSegments {
  overdue: number;
  dueSoon: number; // due within 4 days
  dueLater: number;
  noDueDate: number;
  total: number;
}

const ALL_OPEN_ITEM_CATEGORIES = [
  "RFI",
  "Submittal",
  "Punch List",
  "Observation",
  "Issue",
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  RFI: "RFIs",
  Submittal: "Submittals",
  "Punch List": "Punch List",
  Observation: "Observations",
  Issue: "Issues",
};

function computeSegments(items: typeof sampleOpenItemRows): BarSegments {
  let overdue = 0;
  let dueSoon = 0;
  let dueLater = 0;
  let noDueDate = 0;

  for (const item of items) {
    if (item.status === "Closed" || item.status === "Void") continue;
    if (!item.dueDate) {
      noDueDate++;
      continue;
    }
    const dueMs = new Date(item.dueDate).getTime();
    const diffDays = (dueMs - TODAY.getTime()) / 86400000;
    if (diffDays < 0) {
      overdue++;
    } else if (diffDays <= 4) {
      dueSoon++;
    } else {
      dueLater++;
    }
  }

  return { overdue, dueSoon, dueLater, noDueDate, total: overdue + dueSoon + dueLater + noDueDate };
}

const LegendRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--color-text-secondary);
`;

const LegendDot = styled.span<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  display: inline-block;
  flex-shrink: 0;
`;

const BarCategoryRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const BarCategoryLabel = styled.span`
  font-size: 12px;
  color: var(--color-text-secondary);
  width: 90px;
  flex-shrink: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const BarTrack = styled.div`
  flex: 1;
  height: 14px;
  background: var(--color-surface-secondary);
  border-radius: 3px;
  overflow: hidden;
  display: flex;
`;

const BarSegment = styled.div<{ $color: string; $pct: number }>`
  width: ${({ $pct }) => $pct}%;
  background: ${({ $color }) => $color};
  height: 100%;
  min-width: ${({ $pct }) => ($pct > 0 ? "3px" : "0")};
`;

const BarCount = styled.span`
  font-size: 12px;
  color: var(--color-text-secondary);
  width: 24px;
  text-align: right;
  flex-shrink: 0;
`;

const ViewAllLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  font-size: 11px;
  color: var(--color-text-link);
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }
`;

const SEGMENT_COLORS = {
  overdue: "#d92626",
  dueSoon: "#f59e0b",
  dueLater: "#2563eb",
  noDueDate: "#9ca3af",
};

export function AllOpenItemsCard({ projectRowId }: CardProps) {
  const projectItems = useMemo(
    () => sampleOpenItemRows.filter((r) => r.projectId === projectRowId),
    [projectRowId]
  );

  const actions = (
    <HeaderActions>
      <Button variant="secondary" size="sm" className="b_secondary">
        Refresh
      </Button>
    </HeaderActions>
  );

  const categoryData = ALL_OPEN_ITEM_CATEGORIES.map((cat) => {
    const items = projectItems.filter((r) => r.type === cat);
    const segs = computeSegments(items);
    return { cat, segs };
  }).filter((d) => d.segs.total > 0);

  const hasData = categoryData.length > 0;

  return (
    <HubCardFrame
      title="All Open Items"
      infoTooltip="Summary of all open items grouped by type and urgency for this project."
      actions={actions}
    >
      <LegendRow>
        <LegendItem>
          <LegendDot $color={SEGMENT_COLORS.overdue} />
          Overdue
        </LegendItem>
        <LegendItem>
          <LegendDot $color={SEGMENT_COLORS.dueSoon} />
          Due &lt;4 Days
        </LegendItem>
        <LegendItem>
          <LegendDot $color={SEGMENT_COLORS.dueLater} />
          Due &gt;4 Days
        </LegendItem>
        <LegendItem>
          <LegendDot $color={SEGMENT_COLORS.noDueDate} />
          No Due Date
        </LegendItem>
      </LegendRow>

      {!hasData ? (
        <div
          style={{
            color: "var(--color-text-secondary)",
            fontSize: 13,
            textAlign: "center",
            padding: "24px 0",
          }}
        >
          No open items for this project.
        </div>
      ) : (
        categoryData.map(({ cat, segs }) => {
          const max = segs.total || 1;
          const overdueP = (segs.overdue / max) * 100;
          const dueSoonP = (segs.dueSoon / max) * 100;
          const dueLaterP = (segs.dueLater / max) * 100;
          const noDueDateP = (segs.noDueDate / max) * 100;

          return (
            <BarCategoryRow key={cat}>
              <BarCategoryLabel title={CATEGORY_LABELS[cat]}>
                {CATEGORY_LABELS[cat]}
              </BarCategoryLabel>
              <BarTrack>
                <BarSegment $color={SEGMENT_COLORS.overdue} $pct={overdueP} />
                <BarSegment $color={SEGMENT_COLORS.dueSoon} $pct={dueSoonP} />
                <BarSegment $color={SEGMENT_COLORS.dueLater} $pct={dueLaterP} />
                <BarSegment $color={SEGMENT_COLORS.noDueDate} $pct={noDueDateP} />
              </BarTrack>
              <BarCount>{segs.total}</BarCount>
              <ViewAllLink>View All</ViewAllLink>
            </BarCategoryRow>
          );
        })
      )}

      <div
        style={{
          marginTop: 12,
          borderTop: "1px solid var(--color-border-separator)",
          paddingTop: 8,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
          Last updated 30 mins ago
        </span>
      </div>
    </HubCardFrame>
  );
}

// ─── 6. ProjectTeamCard ───────────────────────────────────────────────────────

const TeamTable = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border-separator);
  border-radius: 8px;
  overflow: hidden;
`;

const TeamRow = styled.div`
  display: grid;
  grid-template-columns: 180px 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--color-surface-primary);
  border-bottom: 1px solid var(--color-border-separator);

  &:last-child {
    border-bottom: none;
  }

  &:nth-child(even) {
    background: var(--color-surface-secondary);
  }
`;

const TeamRoleLabel = styled.span`
  font-size: 12px;
  color: var(--color-text-secondary);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TeamNameLabel = styled.span`
  font-size: 13px;
  color: var(--color-text-primary);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TeamHeader = styled.div`
  display: grid;
  grid-template-columns: 180px 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: var(--color-surface-secondary);
  border-bottom: 1px solid var(--color-border-separator);
`;

const TeamHeaderCell = styled.span`
  font-size: 12px;
  color: var(--color-text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export function ProjectTeamCard({ projectRowId }: CardProps) {
  const seedId = toSeedId(projectRowId);

  const teamMembers = useMemo(() => {
    return users.filter((u) => u.projectIds.includes(seedId)).slice(0, 6).map((u) => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
      role: u.jobTitle,
    }));
  }, [seedId]);

  const actions = (
    <HeaderActions>
      <Button variant="secondary" size="sm" className="b_secondary">
        View All
      </Button>
      <Button variant="tertiary" size="sm" className="b_tertiary" icon={<ChevronDown size="sm" />}>
        More
      </Button>
    </HeaderActions>
  );

  return (
    <HubCardFrame
      title="Project Team"
      infoTooltip="People assigned to this project and their roles."
      actions={actions}
      style={{ maxHeight: "none" }}
    >
      {teamMembers.length === 0 ? (
        <div
          style={{
            color: "var(--color-text-secondary)",
            fontSize: 13,
            textAlign: "center",
            padding: "24px 0",
          }}
        >
          No team members assigned to this project.
        </div>
      ) : (
        <TeamTable>
          <TeamHeader>
            <TeamHeaderCell>Role</TeamHeaderCell>
            <TeamHeaderCell>Name</TeamHeaderCell>
            <TeamHeaderCell />
          </TeamHeader>
          {teamMembers.map((member) => (
            <TeamRow key={member.id}>
              <TeamRoleLabel title={member.role}>{member.role}</TeamRoleLabel>
              <TeamNameLabel>{member.name}</TeamNameLabel>
              <Button variant="tertiary" size="sm" className="b_tertiary" icon={<ArrowRight size="sm" />}>
                See Details
              </Button>
            </TeamRow>
          ))}
        </TeamTable>
      )}
    </HubCardFrame>
  );
}
