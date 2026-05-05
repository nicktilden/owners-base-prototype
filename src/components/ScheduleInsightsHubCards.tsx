import React, { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Avatar, Banner, Button, Card, H2, Link, Pill, Popover, Select, Table, Tearsheet, Typography } from "@procore/core-react";
import { ChevronDown, ChevronRight, Comment, Copilot, Duplicate, EllipsisVertical, Envelope, ExternalLink, Info, Lightning, Phone, PhoneMobile } from "@procore/core-icons";
import {
  sampleProjectMilestones,
  sampleProjectRows,
  topScheduleRiskProjectRowsForMilestoneHeatmap,
  scheduleVarianceData,
  getCurrentMilestoneLabelForProject,
  PROJECT_MILESTONES,
  varianceColors,
  PROJECT_MANAGER_CONTACTS,
  getDaysRemaining,
  getProjectPortfolioScheduleSummary,
} from "@/data/projects";
import HubCardFrame from "@/components/hubs/HubCardFrame";
import HubCardTable from "@/components/HubCardTable";
import { useAiPanel } from "@/context/AiPanelContext";
import { createGlobalStyle } from "styled-components";
import { useHubFilters } from "@/context/HubFilterContext";
import { getProjectConnection } from "@/data/procoreConnect";
import { Connect } from "@procore/core-icons";

const TearsheetWide = createGlobalStyle`
  [class*="StyledTearsheetBody"]:has(> .schedule-insights-variance-tearsheet-root) {
    flex: 0 0 60vw !important;
  }
`;

const TearsheetProject = createGlobalStyle`
  [class*="StyledTearsheetBody"]:has(> .schedule-project-tearsheet-root) {
    flex: 0 0 60vw !important;
  }
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STAGE_COLORS: Record<string, "blue" | "green" | "yellow" | "gray" | "magenta" | "cyan"> = {
  "Conceptual":             "magenta",
  "Feasibility":            "magenta",
  "Final design":           "cyan",
  "Permitting":             "yellow",
  "Bidding":                "yellow",
  "Pre-Construction":       "blue",
  "Course of Construction": "green",
  "Post-Construction":      "green",
  "Handover":               "blue",
  "Closeout":               "gray",
  "Maintenance":            "gray",
};

function addDaysLocal(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function pmAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const palette = ["#1d5cc9", "#00a878", "#6b4ce6", "#e05263", "#f6a623", "#4a6572", "#8e24aa", "#0097a7"];
  return palette[Math.abs(hash) % palette.length];
}

// ─── Project schedule detail tearsheet ───────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function varianceBadge(v: number) {
  const { bg, fg } = varianceColors(v);
  const label = v > 0 ? `+${v}d` : `${v}d`;
  return (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, background: bg, color: fg, fontWeight: 600, fontSize: 12 }}>
      {label}
    </span>
  );
}

interface ProjectScheduleTearsheetProps {
  projectId: number | null;
  onClose: () => void;
}

function ProjectScheduleTearsheet({ projectId, onClose }: ProjectScheduleTearsheetProps) {
  const [pastExpanded, setPastExpanded] = useState(false);
  const [currentExpanded, setCurrentExpanded] = useState(true);
  const project = useMemo(
    () => projectId !== null ? sampleProjectRows.find((p) => p.id === projectId) ?? null : null,
    [projectId]
  );
  const milestones = useMemo(
    () => (projectId !== null ? sampleProjectMilestones.get(projectId) ?? [] : []),
    [projectId]
  );
  const scheduleVariance = useMemo(
    () => project ? scheduleVarianceData.find((d) => d.project === project.name)?.variance ?? 0 : 0,
    [project]
  );

  const { lastMilestone, nextMilestone } = useMemo(
    () => project ? getProjectPortfolioScheduleSummary(project) : { lastMilestone: "—", nextMilestone: "—" },
    [project]
  );

  const firstMilestoneWithActual = milestones.find(m => m.actualDate !== null);
  const startVariance = firstMilestoneWithActual?.varianceDays ?? 0;
  const actualStartDate = startVariance !== 0 && project ? addDaysLocal(project.startDate, startVariance) : null;
  const pmContact = project ? PROJECT_MANAGER_CONTACTS[project.projectManager] ?? null : null;

  const todayIso = new Date().toISOString().slice(0, 10);
  const pastMilestones = milestones.filter(m => m.baselineDate < todayIso);
  const currentMilestones = milestones.filter(m => m.baselineDate >= todayIso);

  // Timeline: gray bar = baseline full span, blue bar = progress (start → today clamped to end)
  const timeline = useMemo(() => {
    if (!project) return null;
    const bStart = new Date(project.startDate).getTime();
    const bEnd = new Date(project.endDate).getTime();
    const today = Date.now();
    const progressEnd = Math.min(today, bEnd);
    const progressWidth = bStart < bEnd
      ? Math.max(0, Math.min(100, ((progressEnd - bStart) / (bEnd - bStart)) * 100))
      : 0;
    return {
      progressWidth,
      startLabel: formatDate(project.startDate),
      endLabel: formatDate(project.endDate),
      isComplete: today >= bEnd,
    };
  }, [project]);

  return (
    <>
      <TearsheetProject />
      <Tearsheet open={projectId !== null} onClose={onClose} aria-label="Project schedule detail" placement="right">
        <div className="schedule-project-tearsheet-root" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Header */}
          <div style={{ padding: "16px 20px 14px", borderBottom: "1px solid var(--color-border-separator)", flexShrink: 0 }}>
            {project ? (
              <>
                <Typography intent="small" style={{ color: "var(--color-text-secondary)", fontWeight: 500, display: "block", marginBottom: 2 }}>{project.number}</Typography>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Typography intent="h2" style={{ fontWeight: 700, color: "var(--color-text-primary)", display: "block" }}>
                    {project.name}
                  </Typography>
                  {getProjectConnection(project.id) && <Connect size="sm" style={{ color: "#ff5200", flexShrink: 0 }} aria-label="Connected project" />}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
                  <Pill color="blue">{project.stage.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</Pill>
                  <Typography intent="small" color="gray45">
                    <Typography intent="small" weight="bold">Schedule Variance:</Typography>{" "}
                    {varianceBadge(scheduleVariance)}
                  </Typography>
                  <Typography intent="small" color="gray45">
                    <Typography intent="small" weight="bold">Last Milestone:</Typography> {lastMilestone}
                  </Typography>
                  <Typography intent="small" color="gray45">
                    <Typography intent="small" weight="bold">Next Milestone:</Typography> {nextMilestone}
                  </Typography>
                </div>
              </>
            ) : (
              <Typography intent="h2" style={{ fontWeight: 700, color: "var(--color-text-primary)" }}>Project Schedule</Typography>
            )}
          </div>

          {/* Scrollable body */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {project && (
              <>
                {/* ── Schedule Duration ── */}
                <Card style={{ margin: 16, padding: 16 }}>
                  <H2 style={{ marginBottom: 12 }}>Schedule Duration</H2>
                  {/* Info Banner */}
                  {scheduleVariance !== 0 && (
                    <Banner variant={scheduleVariance > 0 ? "attention" : "info"} style={{ marginBottom: 14 }}>
                      <Banner.Content>
                        <Banner.Title>
                          {scheduleVariance > 0
                            ? `Project is running ${scheduleVariance} day${scheduleVariance !== 1 ? "s" : ""} behind baseline`
                            : `Project is running ${Math.abs(scheduleVariance)} day${Math.abs(scheduleVariance) !== 1 ? "s" : ""} ahead of baseline`}
                        </Banner.Title>
                        <Banner.Body>
                          {scheduleVariance > 0
                            ? `The current schedule variance indicates this project may complete ${scheduleVariance} day${scheduleVariance !== 1 ? "s" : ""} later than the original baseline end date of ${formatDate(project!.endDate)}.`
                            : `The current schedule variance indicates this project may complete ${Math.abs(scheduleVariance)} day${Math.abs(scheduleVariance) !== 1 ? "s" : ""} earlier than the original baseline end date of ${formatDate(project!.endDate)}.`}
                        </Banner.Body>
                      </Banner.Content>
                    </Banner>
                  )}
                  {scheduleVariance === 0 && (
                    <Banner variant="info" style={{ marginBottom: 14 }}>
                      <Banner.Content>
                        <Banner.Body>
                          This project is tracking on schedule with no variance from the original baseline end date of {formatDate(project!.endDate)}.
                        </Banner.Body>
                      </Banner.Content>
                    </Banner>
                  )}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px", marginBottom: 14 }}>
                    <div>
                      <Typography intent="small" color="gray45" style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2, display: "block" }}>Baseline</Typography>
                      <Typography intent="body" style={{ fontWeight: 500 }}>
                        {formatDate(project.startDate)} → {formatDate(project.endDate)}
                      </Typography>
                    </div>
                    <div>
                      <Typography intent="small" color="gray45" style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2, display: "block" }}>Actual</Typography>
                      <Typography intent="body" style={{ fontWeight: 500 }}>
                        {actualStartDate ? (
                          <>{formatDate(actualStartDate)} → {scheduleVariance !== 0 ? formatDate(addDaysLocal(project.endDate, scheduleVariance)) : formatDate(project.endDate)}</>
                        ) : "—"}
                      </Typography>
                    </div>
                  </div>
                  {timeline && (
                    <div>
                      {/* Bar legend */}
                      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 2, background: "hsl(200, 8%, 82%)" }} />
                          <Typography intent="small" color="gray45">Baseline duration</Typography>
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 2, background: "var(--color-action-primary)" }} />
                          <Typography intent="small" color="gray45">Progress to date</Typography>
                        </span>
                      </div>
                      {/* Bar: gray = baseline full span, blue on top = progress so far */}
                      <div style={{ position: "relative", width: "100%", height: 16, background: "hsl(200, 8%, 82%)", borderRadius: 4, marginBottom: 6, overflow: "hidden" }}>
                        <div style={{
                          position: "absolute",
                          left: 0,
                          width: `${timeline.progressWidth}%`,
                          height: "100%",
                          background: "var(--color-action-primary)",
                          borderRadius: timeline.isComplete ? 4 : "4px 0 0 4px",
                          opacity: 0.9,
                          transition: "width 0.3s ease",
                        }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography intent="small" color="gray45">{timeline.startLabel}</Typography>
                        <Typography intent="small" color="gray45">{timeline.endLabel}</Typography>
                      </div>
                    </div>
                  )}
                </Card>

                {/* ── Project Manager ── */}
                {pmContact && (
                  <Card style={{ margin: 16, marginTop: 0, padding: 16 }}>
                    <H2 style={{ marginBottom: 16 }}>Project Manager</H2>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                      <Avatar size="lg" role="img" aria-label={pmContact.name}>
                        <Avatar.Label>{pmContact.name.split(" ").map(n => n[0]).join("")}</Avatar.Label>
                      </Avatar>
                      <div>
                        <Typography intent="body" weight="bold" style={{ display: "block" }}>{pmContact.name}</Typography>
                        <Typography intent="small" color="gray45">{pmContact.company}</Typography>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Button variant="secondary" size="sm" icon={<Envelope size="sm" />}>Send Email</Button>
                      <Button variant="secondary" size="sm" icon={<Comment size="sm" />}>Direct Message</Button>
                      <Button variant="secondary" size="sm" icon={<PhoneMobile size="sm" />}>Call Cell</Button>
                    </div>
                  </Card>
                )}
              </>
            )}

            {/* ── Project Milestones ── */}
            <Card style={{ margin: 16, marginTop: 0, padding: 16 }}>
              <H2 style={{ marginBottom: 16 }}>Project Milestones</H2>
              {milestones.length === 0 ? (
                <Typography intent="body" style={{ color: "var(--color-text-secondary)" }}>No milestone data available.</Typography>
              ) : (
                <div style={{ border: "1px solid var(--color-border-separator)", borderRadius: 8, overflow: "hidden" }}>
                  <Table.Container>
                    <Table>
                      <Table.Header>
                        <Table.HeaderRow>
                          <Table.HeaderCell>Milestone</Table.HeaderCell>
                          <Table.HeaderCell style={{ whiteSpace: "nowrap" }}>Baseline Date</Table.HeaderCell>
                          <Table.HeaderCell style={{ whiteSpace: "nowrap" }}>Actual / Forecast</Table.HeaderCell>
                          <Table.HeaderCell style={{ textAlign: "right", whiteSpace: "nowrap" }}>Variance</Table.HeaderCell>
                          <Table.HeaderCell>Note</Table.HeaderCell>
                        </Table.HeaderRow>
                      </Table.Header>
                      <Table.Body>
                        {/* ── Past Milestones (collapsed) ── */}
                        <Table.BodyRow
                          style={{ background: "var(--color-surface-secondary)", cursor: "pointer" }}
                          onClick={() => setPastExpanded(x => !x)}
                        >
                          <Table.BodyCell colSpan={5} style={{ height: 48 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              {pastExpanded
                                ? <ChevronDown size="sm" style={{ color: "var(--color-text-secondary)" }} />
                                : <ChevronRight size="sm" style={{ color: "var(--color-text-secondary)" }} />
                              }
                              <Typography intent="small" weight="bold" style={{ color: "var(--color-text-secondary)" }}>
                                Past Milestones ({pastMilestones.length})
                              </Typography>
                            </div>
                          </Table.BodyCell>
                        </Table.BodyRow>
                        {pastExpanded && pastMilestones.map((m) => (
                          <Table.BodyRow key={`past-${m.name}`}>
                            <Table.BodyCell style={{ height: 48 }}>{m.name}</Table.BodyCell>
                            <Table.BodyCell style={{ height: 48, whiteSpace: "nowrap" }}>{formatDate(m.baselineDate)}</Table.BodyCell>
                            <Table.BodyCell style={{ height: 48, color: m.actualDate ? undefined : "var(--color-text-secondary)", whiteSpace: "nowrap" }}>
                              {m.actualDate ? formatDate(m.actualDate) : "—"}
                            </Table.BodyCell>
                            <Table.BodyCell style={{ height: 48, textAlign: "right" }}>
                              {m.actualDate ? varianceBadge(m.varianceDays) : <span style={{ color: "var(--color-text-secondary)" }}>—</span>}
                            </Table.BodyCell>
                            <Table.BodyCell style={{ height: 48 }}>
                              {m.note ? (
                                <Typography intent="small" style={{ color: "var(--color-text-secondary)" }}>{m.note}</Typography>
                              ) : null}
                            </Table.BodyCell>
                          </Table.BodyRow>
                        ))}
                        {/* ── Current & Upcoming Milestones ── */}
                        <Table.BodyRow
                          style={{ background: "var(--color-surface-secondary)", cursor: "pointer" }}
                          onClick={() => setCurrentExpanded(x => !x)}
                        >
                          <Table.BodyCell colSpan={5} style={{ height: 48 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              {currentExpanded
                                ? <ChevronDown size="sm" style={{ color: "var(--color-text-secondary)" }} />
                                : <ChevronRight size="sm" style={{ color: "var(--color-text-secondary)" }} />
                              }
                              <Typography intent="small" weight="bold" style={{ color: "var(--color-text-secondary)" }}>
                                Current &amp; Upcoming Milestones ({currentMilestones.length})
                              </Typography>
                            </div>
                          </Table.BodyCell>
                        </Table.BodyRow>
                        {currentExpanded && currentMilestones.map((m) => (
                          <Table.BodyRow key={`current-${m.name}`}>
                            <Table.BodyCell style={{ height: 48, fontWeight: 500 }}>{m.name}</Table.BodyCell>
                            <Table.BodyCell style={{ height: 48, whiteSpace: "nowrap" }}>{formatDate(m.baselineDate)}</Table.BodyCell>
                            <Table.BodyCell style={{ height: 48, color: m.actualDate ? undefined : "var(--color-text-secondary)", whiteSpace: "nowrap" }}>
                              {m.actualDate ? formatDate(m.actualDate) : "—"}
                            </Table.BodyCell>
                            <Table.BodyCell style={{ height: 48, textAlign: "right" }}>
                              {m.actualDate ? varianceBadge(m.varianceDays) : <span style={{ color: "var(--color-text-secondary)" }}>—</span>}
                            </Table.BodyCell>
                            <Table.BodyCell style={{ height: 48 }}>
                              {m.note ? (
                                <Typography intent="small" style={{ color: "var(--color-text-secondary)" }}>{m.note}</Typography>
                              ) : null}
                            </Table.BodyCell>
                          </Table.BodyRow>
                        ))}
                      </Table.Body>
                    </Table>
                  </Table.Container>
                </div>
              )}
            </Card>
          </div>
        </div>
      </Tearsheet>
    </>
  );
}

// ─── Shared tearsheet for Schedule Variance buckets ──────────────────────────

interface VarianceBucketRow {
  number: string;
  projectId?: number;
  name: string;
  stage: string;
  currentMilestone: string;
  nextMilestone: string;
  startDate: string;
  endDate: string;
  varianceDays: number;
}

interface VarianceBucketTearsheetProps {
  open: boolean;
  onClose: () => void;
  bucketLabel: string;
  rows: VarianceBucketRow[];
}

function VarianceBucketTearsheet({ open, onClose, bucketLabel, rows }: VarianceBucketTearsheetProps) {
  const router = useRouter();

  return (
    <>
      <Tearsheet open={open} onClose={onClose} aria-label={`Schedule variance: ${bucketLabel}`} placement="right">
        <div className="schedule-insights-variance-tearsheet-root" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Header */}
          <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--color-border-separator)", flexShrink: 0 }}>
            <Typography intent="h2" style={{ fontWeight: 700, color: "var(--color-text-primary)" }}>
              Schedule Variance: {bucketLabel}
            </Typography>
            <Typography intent="small" style={{ color: "var(--color-text-secondary)", display: "block", marginTop: 2 }}>
              {rows.length} project{rows.length !== 1 ? "s" : ""} in this variance range
            </Typography>
          </div>
          {/* Body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
            {rows.length === 0 ? (
              <Typography intent="body" style={{ color: "var(--color-text-secondary)" }}>No projects in this range.</Typography>
            ) : (
              <div style={{ border: "1px solid var(--color-border-separator)", borderRadius: 8, overflow: "hidden" }}>
                <Table.Container>
                  <Table>
                    <Table.Header>
                      <Table.HeaderRow>
                        <Table.HeaderCell style={{ whiteSpace: "nowrap" }}>#</Table.HeaderCell>
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.HeaderCell>Stage</Table.HeaderCell>
                        <Table.HeaderCell style={{ whiteSpace: "nowrap" }}>Current Milestone</Table.HeaderCell>
                        <Table.HeaderCell style={{ whiteSpace: "nowrap" }}>Next Milestone</Table.HeaderCell>
                        <Table.HeaderCell style={{ textAlign: "right", whiteSpace: "nowrap" }}>Variance</Table.HeaderCell>
                      </Table.HeaderRow>
                    </Table.Header>
                    <Table.Body>
                      {rows.map((r) => (
                        <Table.BodyRow key={r.number}>
                          <Table.BodyCell style={{ height: 48, color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>{r.number}</Table.BodyCell>
                          <Table.BodyCell style={{ height: 48 }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                              <button
                                onClick={() => r.projectId !== undefined && router.push(`/project/${r.projectId}/overview`)}
                                style={{ background: "none", border: "none", padding: 0, fontWeight: 600, color: "var(--color-text-link)", cursor: "pointer", fontSize: 13, textAlign: "left", textDecoration: "underline" }}
                              >
                                {r.name}
                              </button>
                              {r.projectId !== undefined && getProjectConnection(r.projectId) && <Connect size="sm" style={{ color: "#ff5200", flexShrink: 0 }} aria-label="Connected project" />}
                            </span>
                          </Table.BodyCell>
                          <Table.BodyCell style={{ height: 48, whiteSpace: "nowrap" }}>
                            <Pill color={STAGE_COLORS[r.stage] ?? "gray"}>{r.stage}</Pill>
                          </Table.BodyCell>
                          <Table.BodyCell style={{ height: 48 }}>{r.currentMilestone}</Table.BodyCell>
                          <Table.BodyCell style={{ height: 48, color: "var(--color-text-secondary)" }}>{r.nextMilestone}</Table.BodyCell>
                          <Table.BodyCell style={{ height: 48, textAlign: "right", whiteSpace: "nowrap" }}>
                            {varianceBadge(r.varianceDays)}
                          </Table.BodyCell>
                        </Table.BodyRow>
                      ))}
                    </Table.Body>
                  </Table>
                </Table.Container>
              </div>
            )}
          </div>
        </div>
      </Tearsheet>
    </>
  );
}

const HISTOGRAM_BUCKETS = [
  { label: "0-3 days", min: 0, max: 3, color: "#8bc34a" },
  { label: "3-7 days", min: 3, max: 7, color: "#ffcc80" },
  { label: "7-14 days", min: 7, max: 14, color: "#ff7043" },
  { label: "14+ days", min: 14, max: Infinity, color: "#b71c1c" },
];

type GroupByKey = "stage" | "program" | "region" | "priority" | "type";

const GROUP_BY_OPTIONS: { value: GroupByKey; label: string }[] = [
  { value: "stage",    label: "Stage"    },
  { value: "program",  label: "Program"  },
  { value: "region",   label: "Region"   },
  { value: "priority", label: "Priority" },
  { value: "type",     label: "Type"     },
];

const TYPE_KEYWORDS: [RegExp, string][] = [
  [/fit-?out|tenant improvement/i,              "Fit-Out"],
  [/renovation|remodel|retrofit/i,              "Renovation"],
  [/expansion|expand/i,                         "Expansion"],
  [/upgrade|replacement|replace/i,              "Upgrade"],
  [/phase \d|buildout|build-out|new construction/i, "New Construction"],
  [/solar|substation|transmission|gas main|network/i, "Infrastructure"],
];

function deriveProjectType(name: string): string {
  for (const [re, label] of TYPE_KEYWORDS) {
    if (re.test(name)) return label;
  }
  return "New Construction";
}

const BAR_COLORS = ["#1d5cc9", "#00a878", "#6b4ce6", "#f6a623", "#e05263"];
const OTHER_COLOR = "#9e9e9e";

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

import type { ProjectRow } from "@/data/projects";

function getGroupValue(row: ProjectRow, key: GroupByKey): string {
  switch (key) {
    case "stage":    return row.stage ?? "Unknown";
    case "program":  return row.program ?? "No Program";
    case "region":   return row.region ?? "Unknown";
    case "priority": return row.priority ? row.priority.charAt(0).toUpperCase() + row.priority.slice(1) : "Unknown";
    case "type":     return deriveProjectType(row.name);
  }
}

export function ProjectsByStageHubCard() {
  const [groupBy, setGroupBy] = useState<GroupByKey>("stage");
  const { filteredProjectRows } = useHubFilters();

  const rows = useMemo(() => {
    const counts = new Map<string, number>();
    filteredProjectRows.forEach((p) => {
      const key = getGroupValue(p, groupBy);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    let sorted = Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }));

    if (groupBy === "priority") {
      sorted.sort((a, b) => (PRIORITY_ORDER[a.name.toLowerCase()] ?? 9) - (PRIORITY_ORDER[b.name.toLowerCase()] ?? 9));
    } else {
      sorted.sort((a, b) => b.value - a.value);
    }

    if (sorted.length <= 5) return sorted.map((r, i) => ({ ...r, color: BAR_COLORS[i % BAR_COLORS.length], isOther: false }));

    const top5 = sorted.slice(0, 5);
    const otherCount = sorted.slice(5).reduce((s, r) => s + r.value, 0);
    return [
      ...top5.map((r, i) => ({ ...r, color: BAR_COLORS[i], isOther: false })),
      { name: "Other", value: otherCount, color: OTHER_COLOR, isOther: true },
    ];
  }, [filteredProjectRows, groupBy]);

  const total = rows.reduce((s, r) => s + r.value, 0);
  const maxVal = Math.max(...rows.map((r) => r.value), 1);

  const groupByLabel = GROUP_BY_OPTIONS.find((o) => o.value === groupBy)?.label ?? "Stage";

  return (
    <HubCardFrame
      title={`Project by ${groupByLabel}`}
      infoTooltip={`Distribution of projects grouped by ${groupByLabel.toLowerCase()}. Shows top 5 values; remaining are grouped into "Other".`}
      actions={
        <Button
          className="b_tertiary"
          variant="tertiary"
          size="sm"
          icon={<ExternalLink size="sm" />}
          aria-label={`View all projects by ${groupByLabel}`}
        >
          View All
        </Button>
      }
      controls={
        <Select
          onSelect={(selection: { item: unknown }) => {
            const val = selection.item as string;
            setGroupBy(val as GroupByKey);
          }}
          placeholder="Group by"
          style={{ minWidth: 140 }}
        >
          {GROUP_BY_OPTIONS.map((opt) => (
            <Select.Option key={opt.value} value={opt.value} selected={groupBy === opt.value}>
              {opt.label}
            </Select.Option>
          ))}
        </Select>
      }
    >
      <div aria-label={`Project by ${groupByLabel} column chart`}>
        {/* Bar + count area */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.max(rows.length, 1)}, minmax(52px, 1fr))`,
            gap: 8,
            alignItems: "end",
            height: 160,
            paddingTop: 8,
            borderBottom: "2px solid var(--color-border-separator)",
          }}
        >
          {rows.map((r) => {
            const barHeight = Math.max(r.value > 0 ? 12 : 0, (r.value / maxVal) * 120);
            const pct = total > 0 ? Math.round((r.value / total) * 100) : 0;
            const popoverContent = (
              <div style={{ padding: "8px 12px", minWidth: 140 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 4 }}>{r.name}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
                  <span style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{r.value}</span> project{r.value !== 1 ? "s" : ""}
                </div>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{pct}% of portfolio</div>
              </div>
            );
            return (
              <Popover
                key={r.name}
                overlay={<Popover.Content>{popoverContent}</Popover.Content>}
                trigger={["hover"]}
                placement="top"
              >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "default" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-primary)", fontVariantNumeric: "tabular-nums" }}>
                    {r.value}
                  </span>
                  <div
                    style={{
                      width: "100%",
                      maxWidth: 44,
                      height: barHeight,
                      borderRadius: "5px 5px 0 0",
                      background: r.color,
                      opacity: r.isOther ? 0.7 : 1,
                      transition: "height 0.3s ease",
                    }}
                  />
                </div>
              </Popover>
            );
          })}
          {rows.length === 0 && (
            <div style={{ gridColumn: "1 / -1", fontSize: 12, color: "var(--color-text-secondary)", textAlign: "center", paddingTop: 40 }}>
              No projects match the current filters.
            </div>
          )}
        </div>
        {/* Label + percentage area */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.max(rows.length, 1)}, minmax(52px, 1fr))`,
            gap: 8,
            paddingTop: 6,
          }}
        >
          {rows.map((r) => {
            const pct = total > 0 ? Math.round((r.value / total) * 100) : 0;
            return (
              <div key={r.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <span
                  style={{
                    width: "100%",
                    fontSize: 11,
                    color: r.isOther ? "var(--color-text-secondary)" : "var(--color-text-primary)",
                    textAlign: "center",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontStyle: r.isOther ? "italic" : "normal",
                  }}
                  title={r.name}
                >
                  {r.name}
                </span>
                <span style={{ fontSize: 11, color: "var(--color-text-secondary)", fontVariantNumeric: "tabular-nums" }}>
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </HubCardFrame>
  );
}


export function ScheduleRiskGHubCard() {
  const [openBucketIdx, setOpenBucketIdx] = useState<number | null>(null);
  const [openProjectId, setOpenProjectId] = useState<number | null>(null);
  const { openPanel: openAiPanel } = useAiPanel();
  const { filteredProjectRows } = useHubFilters();

  const counts = useMemo(
    () =>
      HISTOGRAM_BUCKETS.map((b) =>
        filteredProjectRows.filter((project) => {
          const v = scheduleVarianceData.find((x) => x.project === project.name)?.variance ?? 0;
          return v >= b.min && v < b.max;
        }).length
      ),
    [filteredProjectRows]
  );
  const maxCount = Math.max(...counts, 1);
  const criticalRows = useMemo(
    () =>
      topScheduleRiskProjectRowsForMilestoneHeatmap
        .filter((row) => filteredProjectRows.some((p) => p.id === row.id))
        .map((row) => {
          const project = filteredProjectRows.find((p) => p.id === row.id);
          const milestones = sampleProjectMilestones.get(row.id) ?? [];
          const critCount = milestones.filter((m) => m.varianceDays >= 14).length;
          const varianceDays = milestones.reduce(
            (max, m) => Math.max(max, m.varianceDays),
            0
          );
          const start = project ? new Date(project.startDate).getTime() : 0;
          const end = project ? new Date(project.endDate).getTime() : 0;
          const now = Date.now();
          const totalDays =
            start > 0 && end > start
              ? (end - start) / (1000 * 60 * 60 * 24)
              : 0;
          const elapsedDays =
            totalDays > 0
              ? Math.min(Math.max((now - start) / (1000 * 60 * 60 * 24), 0), totalDays)
              : 0;
          const pctComplete =
            totalDays > 0 ? Math.round((elapsedDays / totalDays) * 100) : 0;
          const endDateStr = project?.endDate ?? "";
          const endMs = endDateStr ? new Date(endDateStr).getTime() : 0;
          const expectedCompletionDate = endMs && varianceDays > 0
            ? new Date(endMs + varianceDays * 24 * 60 * 60 * 1000).toISOString()
            : endDateStr;
          return {
            row,
            critCount,
            varianceDays,
            pctComplete,
            endDate: endDateStr,
            expectedCompletionDate,
          };
        })
        .filter((r) => r.varianceDays > 0 && r.pctComplete < 100)
        .sort((a, b) => b.varianceDays - a.varianceDays)
        .slice(0, 14),
    [filteredProjectRows]
  );

  // Build tearsheet rows for a given bucket index
  const tearsheetRows = useMemo(() => {
    if (openBucketIdx === null) return [];
    const bucket = HISTOGRAM_BUCKETS[openBucketIdx];
    return filteredProjectRows
      .filter((project) => {
        const d = scheduleVarianceData.find((x) => x.project === project.name);
        const v = d?.variance ?? 0;
        return v >= bucket.min && v < bucket.max;
      })
      .map((project) => {
        const d = scheduleVarianceData.find((x) => x.project === project.name);
        const varianceDays = d?.variance ?? 0;
        const currentMilestone = getCurrentMilestoneLabelForProject(project);
        const curIdx = PROJECT_MILESTONES.indexOf(currentMilestone as typeof PROJECT_MILESTONES[number]);
        const nextMilestone = curIdx >= 0 && curIdx + 1 < PROJECT_MILESTONES.length
          ? PROJECT_MILESTONES[curIdx + 1]
          : "—";
        return {
          number: project.number,
          projectId: project.id,
          name: project.name,
          stage: project.stage,
          currentMilestone,
          nextMilestone,
          startDate: project.startDate,
          endDate: project.endDate,
          varianceDays,
        };
      })
      .sort((a, b) => b.varianceDays - a.varianceDays);
  }, [openBucketIdx, filteredProjectRows]);

  return (
    <>
      <TearsheetWide />
      <VarianceBucketTearsheet
        open={openBucketIdx !== null}
        onClose={() => setOpenBucketIdx(null)}
        bucketLabel={openBucketIdx !== null ? HISTOGRAM_BUCKETS[openBucketIdx].label : ""}
        rows={tearsheetRows}
      />
    <HubCardFrame
      title="Schedule Variance 1"
      infoTooltip="An overview of top schedule-risk projects based on schedule milestones variance."
      actions={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Button
            className="b_secondary"
            variant="secondary"
            data-variant="secondary"
            size="sm"
            icon={<Copilot size="sm" style={{ color: '#FF5100' }} />}
            onClick={() => openAiPanel({
              itemName: 'Portfolio Schedule Overview',
              pills: [
                { label: `${counts[2] + counts[3]} at risk`, color: 'red' },
                { label: `${counts[0] + counts[1]} on track`, color: 'green' },
              ],
              aiSummary: `${counts[3]} project${counts[3] !== 1 ? 's' : ''} have critical delays (14+ days). ${counts[2]} additional project${counts[2] !== 1 ? 's' : ''} are showing moderate delays (7–14 days). Consider requesting recovery plans for the most impacted projects.`,
              cardType: 'schedule_variance',
              userRoles: ['owner', 'owner_admin', 'project_manager'],
            })}
            aria-label="Open AI assistant"
            style={{
              background: '#FFF8F5',
              border: '1px solid #FF5100',
              borderRadius: 4,
              color: '#232729',
            }}
          >
            Summarize
          </Button>
          <Button
            variant="secondary"
            size="sm"
            aria-label="View all schedule variance rows"
          >
            View all
          </Button>
          <Button
            className="b_tertiary"
            variant="tertiary"
            size="sm"
            icon={<EllipsisVertical size="sm" />}
            aria-label="More actions"
          />
        </div>
      }
    >
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80, marginBottom: 12 }}>
            {HISTOGRAM_BUCKETS.map((b, i) => {
              const count = counts[i] ?? 0;
              return (
                <div
                  key={b.label}
                  onClick={() => setOpenBucketIdx(i)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View projects with variance ${b.label}`}
                  onKeyDown={(e) => e.key === "Enter" && setOpenBucketIdx(i)}
                  style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, height: "100%", justifyContent: "flex-end", cursor: "pointer" }}
                >
                  <span style={{ fontSize: 12, color: "var(--color-text-primary)", fontWeight: 600 }}>{count}</span>
                  <div
                    style={{
                      width: "100%",
                      height: `${Math.max(count > 0 ? 8 : 0, (count / maxCount) * 100)}%`,
                      background: b.color,
                      borderRadius: "3px 3px 0 0",
                      transition: "opacity 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  />
                  <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{b.label}</span>
                </div>
              );
            })}
          </div>
          {/* <div style={{ fontSize: 11, fontWeight: 600, color: "#444", borderTop: "1px solid #eee", paddingTop: 8, marginBottom: 6 }}>
            Critical milestones (&gt;=14d)
          </div> */}
          <HubCardTable columns="1fr 90px 120px 80px 80px 36px">
            <HubCardTable.Header>
              <HubCardTable.HeaderCell>Project</HubCardTable.HeaderCell>
              <HubCardTable.HeaderCell style={{ textAlign: "center" }}>End Date</HubCardTable.HeaderCell>
              <HubCardTable.HeaderCell style={{ textAlign: "center" }}>Expected Completion</HubCardTable.HeaderCell>
              <HubCardTable.HeaderCell style={{ textAlign: "center" }}>Variance</HubCardTable.HeaderCell>
              <HubCardTable.HeaderCell style={{ textAlign: "center" }}>% Complete</HubCardTable.HeaderCell>
              <HubCardTable.HeaderCell />
            </HubCardTable.Header>
            <HubCardTable.Body>
              {criticalRows.map(({ row, varianceDays, pctComplete, endDate, expectedCompletionDate }, i) => (
                <HubCardTable.Row key={row.id} index={i} onClick={() => setOpenProjectId(row.id)}>
                  <HubCardTable.Cell>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-link)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {sampleProjectRows.find((p) => p.id === row.id)?.name ?? row.name}
                      </span>
                      {getProjectConnection(row.id) && <Connect size="sm" style={{ color: "#ff5200", flexShrink: 0 }} aria-label="Connected project" />}
                    </span>
                  </HubCardTable.Cell>
                  <HubCardTable.Cell style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                    {endDate ? formatDate(endDate) : "—"}
                  </HubCardTable.Cell>
                  <HubCardTable.Cell style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                    {expectedCompletionDate ? formatDate(expectedCompletionDate) : "—"}
                  </HubCardTable.Cell>
                  <HubCardTable.Cell style={{ textAlign: "center" }}>
                    {varianceBadge(varianceDays)}
                  </HubCardTable.Cell>
                  <HubCardTable.Cell style={{ textAlign: "center", fontWeight: 600 }}>
                    {pctComplete}%
                  </HubCardTable.Cell>
                  <HubCardTable.Cell style={{ textAlign: "center" }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openAiPanel({
                          itemName: sampleProjectRows.find((p) => p.id === row.id)?.name ?? row.name,
                          itemId: `#${row.id}`,
                          projectId: row.id,
                          pills: [{ label: `+${varianceDays}d variance`, color: varianceDays >= 14 ? 'red' : varianceDays >= 7 ? 'yellow' : 'green' }],
                          aiSummary: `This project is ${varianceDays} days behind schedule at ${pctComplete}% completion.`,
                          cardType: 'schedule_variance',
                          userRoles: ['owner', 'owner_admin', 'project_manager'],
                        });
                      }}
                      aria-label="AI actions for this project"
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 4,
                        border: '1px solid #FF5100',
                        background: '#FFF8F5',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                      }}
                    >
                      <Copilot size="sm" style={{ color: '#FF5100', width: 14, height: 14 }} />
                    </button>
                  </HubCardTable.Cell>
                </HubCardTable.Row>
              ))}
            </HubCardTable.Body>
          </HubCardTable>
    </HubCardFrame>
    <ProjectScheduleTearsheet projectId={openProjectId} onClose={() => setOpenProjectId(null)} />
    </>
  );
}

export function ScheduleVariance2HubCard() {
  const [openSegment, setOpenSegment] = useState<"average" | "onSchedule" | "delays" | "critical" | null>(null);
  const [openProjectId, setOpenProjectId] = useState<number | null>(null);
  const [viewAllOpen, setViewAllOpen] = useState(false);
  const { openPanel: openAiPanel } = useAiPanel();
  const { filteredProjectRows } = useHubFilters();

  const portfolioRows = useMemo(() => {
    const today = Date.now();
    return filteredProjectRows
      .filter((row) => new Date(row.endDate).getTime() > today)
      .map((row) => {
        const worstVariance = scheduleVarianceData.find((d) => d.project === row.name)?.variance ?? 0;
        const costDeltaMillions = Math.max(
          0.4,
          Math.round((worstVariance * 0.32 + row.id * 0.11) * 10) / 10
        );
        return {
          id: row.id,
          name: row.name,
          worstVariance,
          endDate: row.endDate,
          daysRemaining: getDaysRemaining(row.endDate),
          costDeltaLabel:
            costDeltaMillions >= 1
              ? `+$${costDeltaMillions.toFixed(1)}M`
              : `+$${Math.round(costDeltaMillions * 1000)}K`,
        };
      })
      .sort((a, b) => b.worstVariance - a.worstVariance);
  }, [filteredProjectRows]);
  const rows = useMemo(() => portfolioRows.slice(0, 5), [portfolioRows]);

  const avgVariance = useMemo(() => {
    if (!portfolioRows.length) return 0;
    return Math.round(
      portfolioRows.reduce((sum, r) => sum + r.worstVariance, 0) / portfolioRows.length
    );
  }, [portfolioRows]);

  const onScheduleCount = portfolioRows.filter((r) => r.worstVariance <= 0).length;
  const delaysCount = portfolioRows.filter(
    (r) => r.worstVariance >= 7 && r.worstVariance <= 13
  ).length;
  const criticalCount = portfolioRows.filter((r) => r.worstVariance >= 14).length;

  // Build tearsheet rows helper
  const buildTearsheetRows = (projectsForSegment: typeof filteredProjectRows) =>
    projectsForSegment
      .map((project) => {
        const d = scheduleVarianceData.find((x) => x.project === project.name);
        const varianceDays = d?.variance ?? 0;
        const { lastMilestone: currentMilestone, nextMilestone } = getProjectPortfolioScheduleSummary(project);
        return {
          number: project.number,
          projectId: project.id,
          name: project.name,
          stage: project.stage,
          currentMilestone,
          nextMilestone,
          startDate: project.startDate,
          endDate: project.endDate,
          varianceDays,
        };
      })
      .sort((a, b) => b.varianceDays - a.varianceDays);

  // Build tearsheet rows for the selected KPI segment
  // Use portfolioRows (same source as KPI counts) so tearsheet count matches the KPI tile
  const tearsheetRows = useMemo(() => {
    if (openSegment === null) return [];
    let projectsForSegment = portfolioRows;
    if (openSegment === "onSchedule") {
      projectsForSegment = portfolioRows.filter((r) => r.worstVariance <= 0);
    } else if (openSegment === "delays") {
      projectsForSegment = portfolioRows.filter((r) => r.worstVariance >= 7 && r.worstVariance <= 13);
    } else if (openSegment === "critical") {
      projectsForSegment = portfolioRows.filter((r) => r.worstVariance >= 14);
    }
    // Map portfolioRows back to ProjectRow shape for buildTearsheetRows
    const portfolioIds = new Set(projectsForSegment.map((r) => r.id));
    return buildTearsheetRows(filteredProjectRows.filter((p) => portfolioIds.has(p.id)));
  }, [openSegment, portfolioRows, filteredProjectRows]);

  // All-projects rows for "View all" tearsheet
  const allProjectsRows = useMemo(
    () => buildTearsheetRows(filteredProjectRows),
    [filteredProjectRows]
  );

  const tearsheetLabel = openSegment === "average"
    ? "All Projects (Average View)"
    : openSegment === "onSchedule"
    ? "On Schedule"
    : openSegment === "delays"
    ? "Delays (7–13 days)"
    : openSegment === "critical"
    ? "Delays (14+ days)"
    : "";

  const kpiCellStyle = (hasBorderRight: boolean): React.CSSProperties => ({
    padding: "8px 16px",
    ...(hasBorderRight ? { borderRight: "1px solid var(--color-border-separator)" } : {}),
    cursor: "pointer",
    transition: "background 0.15s",
  });

  return (
    <>
      <TearsheetWide />
      <VarianceBucketTearsheet
        open={openSegment !== null}
        onClose={() => setOpenSegment(null)}
        bucketLabel={tearsheetLabel}
        rows={tearsheetRows}
      />
      <VarianceBucketTearsheet
        open={viewAllOpen}
        onClose={() => setViewAllOpen(false)}
        bucketLabel="All Projects"
        rows={allProjectsRows}
      />
    <HubCardFrame
      title="Schedule Risk"
      infoTooltip="An overview of top schedule-risk projects based on schedule milestones variance."
      actions={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Button
            className="b_secondary"
            variant="secondary"
            data-variant="secondary"
            size="sm"
            icon={<Copilot size="sm" style={{ color: '#FF5100' }} />}
            onClick={() => openAiPanel({
              itemName: 'Portfolio Schedule Overview',
              pills: [
                { label: `${criticalCount} critical`, color: 'red' },
                { label: `${delaysCount} delayed`, color: 'yellow' },
                { label: `${onScheduleCount} on schedule`, color: 'green' },
              ],
              aiSummary: `Portfolio average variance is +${avgVariance} days. ${criticalCount} project${criticalCount !== 1 ? 's' : ''} are in critical delay territory (14+ days). Consider escalating or requesting recovery plans for the most impacted.`,
              cardType: 'schedule_variance',
              userRoles: ['owner', 'owner_admin', 'project_manager'],
            })}
            aria-label="Open AI assistant"
            style={{
              background: '#FFF8F5',
              border: '1px solid #FF5100',
              borderRadius: 4,
              color: '#232729',
            }}
          >
            Summarize
          </Button>
          <Button
            variant="secondary"
            size="sm"
            aria-label="View all schedule variance rows"
            onClick={() => setViewAllOpen(true)}
          >
            View all
          </Button>
          <Button
            className="b_tertiary"
            variant="tertiary"
            size="sm"
            icon={<EllipsisVertical size="sm" />}
            aria-label="More actions"
          />
        </div>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", border: "1px solid var(--color-border-separator)", borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
        <div
          style={kpiCellStyle(true)}
          onClick={() => setOpenSegment("average")}
          role="button"
          tabIndex={0}
          aria-label="View all projects by average variance"
          onKeyDown={(e) => e.key === "Enter" && setOpenSegment("average")}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "")}
        >
          <div style={{ fontSize: 14, fontWeight: 400, color: "var(--color-text-primary)", letterSpacing: 0.2 }}>Average</div>
          <div style={{ fontSize: 24, lineHeight: "28px", fontWeight: 600, color: "var(--color-text-primary)", marginTop: 4 }}>+{avgVariance} days</div>
        </div>
        <div
          style={kpiCellStyle(true)}
          onClick={() => setOpenSegment("onSchedule")}
          role="button"
          tabIndex={0}
          aria-label="View projects on schedule"
          onKeyDown={(e) => e.key === "Enter" && setOpenSegment("onSchedule")}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "")}
        >
          <div style={{ fontSize: 14, fontWeight: 400, color: "var(--color-text-primary)", letterSpacing: 0.2 }}>On Schedule</div>
          <div style={{ fontSize: 24, lineHeight: "28px", fontWeight: 600, color: "var(--color-text-primary)", marginTop: 4 }}>{onScheduleCount} <span style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 4 }}>of {portfolioRows.length}</span></div>
        </div>
        <div
          style={kpiCellStyle(true)}
          onClick={() => setOpenSegment("delays")}
          role="button"
          tabIndex={0}
          aria-label="View projects with 7–13 day delays"
          onKeyDown={(e) => e.key === "Enter" && setOpenSegment("delays")}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "")}
        >
          <div style={{ fontSize: 14, fontWeight: 400, color: "var(--color-text-primary)", letterSpacing: 0.2 }}>Delays (7–13 days)</div>
          <div style={{ fontSize: 24, lineHeight: "28px", fontWeight: 600, color: "var(--color-text-primary)", marginTop: 4 }}>{delaysCount} <span style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 4 }}>of {portfolioRows.length}</span></div>
        </div>
        <div
          style={kpiCellStyle(false)}
          onClick={() => setOpenSegment("critical")}
          role="button"
          tabIndex={0}
          aria-label="View projects with 14+ day delays"
          onKeyDown={(e) => e.key === "Enter" && setOpenSegment("critical")}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "")}
        >
          <div style={{ fontSize: 14, fontWeight: 400, color: "var(--color-text-primary)", letterSpacing: 0.2 }}>Delays (14+ days)</div>
          <div style={{ fontSize: 24, lineHeight: "28px", fontWeight: 600, color: "var(--color-text-primary)", marginTop: 4 }}>{criticalCount} <span style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 4 }}>of {portfolioRows.length}</span></div>
        </div>
      </div>

      <HubCardTable columns="1fr 120px 100px 80px">
        <HubCardTable.Header>
          <HubCardTable.HeaderCell>Project</HubCardTable.HeaderCell>
          <HubCardTable.HeaderCell style={{ textAlign: "center" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, justifyContent: "center" }}>
              Days Remaining
              <Popover
                overlay={
                  <Popover.Content>
                    <div style={{ padding: "8px 12px", maxWidth: 220, fontSize: 12, color: "var(--color-text-primary)", lineHeight: "1.5" }}>
                      The number of calendar days remaining until the project&apos;s current planned end date. Does not account for schedule variance.
                    </div>
                  </Popover.Content>
                }
                trigger={["hover"]}
                placement="top"
              >
                <span style={{ display: "inline-flex", alignItems: "center", cursor: "default" }}>
                  <Info size="sm" style={{ color: "var(--color-text-secondary)", width: 12, height: 12 }} />
                </span>
              </Popover>
            </span>
          </HubCardTable.HeaderCell>
          <HubCardTable.HeaderCell style={{ textAlign: "center" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, justifyContent: "center" }}>
              Variance
              <Popover
                overlay={
                  <Popover.Content>
                    <div style={{ padding: "8px 12px", maxWidth: 220, fontSize: 12, color: "var(--color-text-primary)", lineHeight: "1.5" }}>
                      The worst milestone schedule variance for this project, in days. Positive values mean the project is running behind the original baseline.
                    </div>
                  </Popover.Content>
                }
                trigger={["hover"]}
                placement="top"
              >
                <span style={{ display: "inline-flex", alignItems: "center", cursor: "default" }}>
                  <Info size="sm" style={{ color: "var(--color-text-secondary)", width: 12, height: 12 }} />
                </span>
              </Popover>
            </span>
          </HubCardTable.HeaderCell>
          <HubCardTable.HeaderCell style={{ textAlign: "right" }}>Cost Delta</HubCardTable.HeaderCell>
        </HubCardTable.Header>
        <HubCardTable.Body>
          {rows.map((r, i) => (
            <HubCardTable.Row key={r.id} index={i} onClick={() => setOpenProjectId(r.id)}>
              <HubCardTable.Cell>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-link)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.name}
                  </span>
                  {getProjectConnection(r.id) && <Connect size="sm" style={{ color: "#ff5200", flexShrink: 0 }} aria-label="Connected project" />}
                </span>
              </HubCardTable.Cell>
              <HubCardTable.Cell style={{ textAlign: "center", fontWeight: 600 }}>
                {r.daysRemaining}d
              </HubCardTable.Cell>
              <HubCardTable.Cell style={{ textAlign: "center" }}>
                {varianceBadge(r.worstVariance)}
              </HubCardTable.Cell>
              <HubCardTable.Cell style={{ textAlign: "right", color: varianceColors(r.worstVariance).bg, fontWeight: 600 }}>
                {r.costDeltaLabel}
              </HubCardTable.Cell>
            </HubCardTable.Row>
          ))}
        </HubCardTable.Body>
      </HubCardTable>
    </HubCardFrame>
    <ProjectScheduleTearsheet projectId={openProjectId} onClose={() => setOpenProjectId(null)} />
    </>
  );
}
