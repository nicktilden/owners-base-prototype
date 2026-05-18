import React, { useMemo, useState } from "react";
import { Avatar, Button, Card, Dropdown, H2, Link, Pill, Tabs, Tearsheet, Tooltip, Typography } from "@procore/core-react";
import {
  Comment,
  Copilot,
  Duplicate,
  EllipsisVertical,
  Envelope,
  ExternalLink,
  Fullscreen,
  Lightning,
  Phone,
  PhoneMobile,
} from "@procore/core-icons";
import {
  sampleProjectMilestones,
  sampleProjectRows,
  topScheduleRiskProjectRowsForMilestoneHeatmap,
  scheduleVarianceData,
  getCurrentMilestoneLabelForProject,
  PROJECT_MILESTONES,
  varianceColors,
  PROJECT_MANAGER_CONTACTS,
  type ProjectPriority,
  type ProjectStage,
} from "@/data/projects";
import HubCardFrame from "@/components/hubs/HubCardFrame";
import { useAiPanel } from "@/context/AiPanelContext";
import { createGlobalStyle } from "styled-components";
import { useHubFilters } from "@/context/HubFilterContext";
import type { ProjectStage as SeedProjectStage } from "@/types/project";
import { getProjectConnection } from "@/data/procoreConnect";
import { Connect } from "@procore/core-icons";

const TearsheetWide = createGlobalStyle`
  [class*="StyledTearsheetBody"]:has(> .schedule-insights-variance-tearsheet-root) {
    flex: 0 0 80vw !important;
    max-width: 1100px !important;
  }
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
  const currentMilestone = project ? getCurrentMilestoneLabelForProject(project) : "";

  const firstMilestoneWithActual = milestones.find(m => m.actualDate !== null);
  const startVariance = firstMilestoneWithActual?.varianceDays ?? 0;
  const actualStartDate = startVariance !== 0 && project ? addDaysLocal(project.startDate, startVariance) : null;
  const expectedEndDate = scheduleVariance !== 0 && project ? addDaysLocal(project.endDate, scheduleVariance) : null;
  const pmContact = project ? PROJECT_MANAGER_CONTACTS[project.projectManager] ?? null : null;

  const timeline = useMemo(() => {
    if (!project) return null;
    const bStart = new Date(project.startDate).getTime();
    const bEnd = new Date(project.endDate).getTime();
    const aStart = actualStartDate ? new Date(actualStartDate).getTime() : bStart;
    const eEnd = expectedEndDate ? new Date(expectedEndDate).getTime() : bEnd;
    const tMin = Math.min(bStart, aStart);
    const tMax = Math.max(bEnd, eEnd);
    const span = tMax - tMin || 1;
    return {
      baselineLeft: ((bStart - tMin) / span) * 100,
      baselineWidth: ((bEnd - bStart) / span) * 100,
      expectedLeft: ((aStart - tMin) / span) * 100,
      expectedWidth: ((eEnd - aStart) / span) * 100,
    };
  }, [project, actualStartDate, expectedEndDate]);

  return (
    <Tearsheet open={projectId !== null} onClose={onClose} aria-label="Project schedule detail" placement="right">
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
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
                <Pill color="blue">{project.stage}</Pill>
                <Typography intent="small" color="gray45">
                  <Typography intent="small" weight="bold">Schedule Variance:</Typography>{" "}
                  {varianceBadge(scheduleVariance)}
                </Typography>
                <Typography intent="small" color="gray45">
                  <Typography intent="small" weight="bold">Current Milestone:</Typography> {currentMilestone}
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
                <H2 style={{ marginBottom: 16 }}>Schedule Duration</H2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px", marginBottom: 16 }}>
                  <div>
                    <Typography intent="small" color="gray45" style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2, display: "block" }}>Start Date (Baseline)</Typography>
                    <Typography intent="body" style={{ fontWeight: 500 }}>{formatDate(project.startDate)}</Typography>
                  </div>
                  <div>
                    <Typography intent="small" color="gray45" style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2, display: "block" }}>Actual Start</Typography>
                    <Typography intent="body" style={{ fontWeight: 500 }}>
                      {actualStartDate ? (
                        <><span style={{ color: varianceColors(startVariance).bg }}>{formatDate(actualStartDate)}</span> <span style={{ marginLeft: 4 }}>{varianceBadge(startVariance)}</span></>
                      ) : (
                        <>{formatDate(project.startDate)} <Pill color="green">On Time</Pill></>
                      )}
                    </Typography>
                  </div>
                  <div>
                    <Typography intent="small" color="gray45" style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2, display: "block" }}>End Date</Typography>
                    <Typography intent="body" style={{ fontWeight: 500 }}>{formatDate(project.endDate)}</Typography>
                  </div>
                  <div>
                    <Typography intent="small" color="gray45" style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2, display: "block" }}>Expected Completion</Typography>
                    <Typography intent="body" style={{ fontWeight: 500 }}>
                      {expectedEndDate ? (
                        <><span style={{ color: varianceColors(scheduleVariance).bg }}>{formatDate(expectedEndDate)}</span> <span style={{ marginLeft: 4 }}>{varianceBadge(scheduleVariance)}</span></>
                      ) : (
                        <>{formatDate(project.endDate)} <Pill color="green">On Schedule</Pill></>
                      )}
                    </Typography>
                  </div>
                </div>
                {timeline && (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <div style={{ position: "relative", flex: 1, height: 14, background: "#f0f1f3", borderRadius: 4 }}>
                        <div style={{ position: "absolute", left: `${timeline.baselineLeft}%`, width: `${timeline.baselineWidth}%`, height: "100%", background: "#b0b8bc", borderRadius: 4 }} />
                      </div>
                      <Typography intent="small" color="gray45" style={{ whiteSpace: "nowrap", minWidth: 56 }}>Baseline</Typography>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ position: "relative", flex: 1, height: 14, background: "#f0f1f3", borderRadius: 4 }}>
                        <div style={{ position: "absolute", left: `${timeline.expectedLeft}%`, width: `${timeline.expectedWidth}%`, height: "100%", background: varianceColors(scheduleVariance).bg, borderRadius: 4, opacity: 0.85 }} />
                      </div>
                      <Typography intent="small" color="gray45" style={{ whiteSpace: "nowrap", minWidth: 56 }}>Expected</Typography>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, paddingRight: 64 }}>
                      <Typography intent="small" color="gray45">{formatDate(actualStartDate ?? project.startDate)}</Typography>
                      <Typography intent="small" color="gray45">{formatDate(expectedEndDate ?? project.endDate)}</Typography>
                    </div>
                  </div>
                )}
              </Card>

              {/* ── Project Manager ── */}
              {pmContact && (
                <Card style={{ margin: 16, marginTop: 0, padding: 16 }}>
                  <H2 style={{ marginBottom: 16 }}>Project Manager</H2>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <Avatar size="lg" role="img" aria-label={pmContact.name}>
                      <Avatar.Label>{pmContact.name.split(" ").map(n => n[0]).join("")}</Avatar.Label>
                    </Avatar>
                    <div>
                      <Typography intent="body" weight="bold">{pmContact.name}</Typography>
                      <Typography intent="small" color="gray45">{pmContact.company}</Typography>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                    <Button variant="secondary" size="sm" icon={<Envelope size="sm" />}>Send Mail</Button>
                    <Button variant="secondary" size="sm" icon={<Comment size="sm" />}>Direct Message</Button>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", padding: "10px 0" }}>
                    <Envelope size="sm" style={{ marginRight: 10, color: "#6a767c", flexShrink: 0 }} />
                    <Link href={`mailto:${pmContact.email}`} style={{ fontSize: 13, flex: 1 }}>{pmContact.email}</Link>
                    <Button variant="tertiary" size="sm" icon={<Duplicate size="sm" />} onClick={() => navigator.clipboard.writeText(pmContact.email)} aria-label="Copy email" />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", padding: "10px 0" }}>
                    <PhoneMobile size="sm" style={{ marginRight: 10, color: "#6a767c", flexShrink: 0 }} />
                    <Link href={`tel:${pmContact.mobile}`} style={{ fontSize: 13 }}>{pmContact.mobile}</Link>
                    <Typography intent="small" color="gray45" style={{ marginLeft: 4 }}>(mobile)</Typography>
                    <span style={{ flex: 1 }} />
                    <Button variant="tertiary" size="sm" icon={<Duplicate size="sm" />} onClick={() => navigator.clipboard.writeText(pmContact.mobile)} aria-label="Copy mobile" />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", padding: "10px 0" }}>
                    <Phone size="sm" style={{ marginRight: 10, color: "#6a767c", flexShrink: 0 }} />
                    <Link href={`tel:${pmContact.office}`} style={{ fontSize: 13 }}>{pmContact.office}</Link>
                    <Typography intent="small" color="gray45" style={{ marginLeft: 4 }}>(office)</Typography>
                    <span style={{ flex: 1 }} />
                    <Button variant="tertiary" size="sm" icon={<Duplicate size="sm" />} onClick={() => navigator.clipboard.writeText(pmContact.office)} aria-label="Copy office" />
                  </div>
                </Card>
              )}
            </>

          )}

          {/* ── Project Milestones ── */}
          <Card style={{ margin: 16, marginTop: 0, padding: 16 }}>
            <H2 style={{ marginBottom: 16 }}>Project Milestones</H2>
            {milestones.length === 0 ? (
              <Typography intent="body" style={{ color: "#6a767c" }}>No milestone data available.</Typography>
            ) : (
              <div style={{ border: "1px solid #d6dadc", borderRadius: 8, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f5f6f7" }}>
                      <th style={{ textAlign: "left", padding: "10px 14px", borderBottom: "1px solid #d6dadc", fontWeight: 600, color: "#6a767c" }}>Milestone</th>
                      <th style={{ textAlign: "left", padding: "10px 14px", borderBottom: "1px solid #d6dadc", fontWeight: 600, color: "#6a767c", whiteSpace: "nowrap" }}>Baseline Date</th>
                      <th style={{ textAlign: "left", padding: "10px 14px", borderBottom: "1px solid #d6dadc", fontWeight: 600, color: "#6a767c", whiteSpace: "nowrap" }}>Actual / Forecast</th>
                      <th style={{ textAlign: "right", padding: "10px 14px", borderBottom: "1px solid #d6dadc", fontWeight: 600, color: "#6a767c", whiteSpace: "nowrap" }}>Variance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {milestones.map((m, i) => {
                      const isCurrent = m.name === currentMilestone;
                      return (
                        <tr
                          key={m.name}
                          style={{
                            background: isCurrent ? "#fffde7" : i % 2 === 0 ? "#fff" : "#fafafa",
                          }}
                        >
                          <td style={{ padding: "9px 14px", borderBottom: "1px solid #eef0f1", fontWeight: isCurrent ? 700 : 400, color: isCurrent ? "#232729" : "#3d4447" }}>
                            {m.name}
                            {isCurrent && (
                              <Pill color="blue" style={{ marginLeft: 8 }}>Current</Pill>
                            )}
                          </td>
                          <td style={{ padding: "9px 14px", borderBottom: "1px solid #eef0f1", color: "#6a767c", whiteSpace: "nowrap" }}>{formatDate(m.baselineDate)}</td>
                          <td style={{ padding: "9px 14px", borderBottom: "1px solid #eef0f1", color: m.actualDate ? "#232729" : "#6a767c", whiteSpace: "nowrap" }}>{m.actualDate ? formatDate(m.actualDate) : "—"}</td>
                          <td style={{ padding: "9px 14px", borderBottom: "1px solid #eef0f1", textAlign: "right" }}>{m.actualDate ? varianceBadge(m.varianceDays) : <span style={{ color: "#6a767c" }}>—</span>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Tearsheet>
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
  const [openProjectId, setOpenProjectId] = useState<number | null>(null);

  return (
    <>
      <TearsheetWide />
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
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "var(--color-surface-secondary)" }}>
                      <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--color-border-separator)", fontWeight: 600, color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>#</th>
                      <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--color-border-separator)", fontWeight: 600, color: "var(--color-text-secondary)" }}>Name</th>
                      <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--color-border-separator)", fontWeight: 600, color: "var(--color-text-secondary)" }}>Stage</th>
                      <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--color-border-separator)", fontWeight: 600, color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>Current Milestone</th>
                      <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--color-border-separator)", fontWeight: 600, color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>Next Milestone</th>
                      <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--color-border-separator)", fontWeight: 600, color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>Start Date</th>
                      <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid var(--color-border-separator)", fontWeight: 600, color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>End Date</th>
                      <th style={{ textAlign: "right", padding: "10px 12px", borderBottom: "1px solid var(--color-border-separator)", fontWeight: 600, color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>Variance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={r.number} style={{ background: i % 2 === 0 ? "var(--color-surface-primary)" : "var(--color-surface-secondary)" }}>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--color-border-separator)", color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>{r.number}</td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--color-border-separator)" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <button
                              onClick={() => r.projectId !== undefined && setOpenProjectId(r.projectId)}
                              style={{ background: "none", border: "none", padding: 0, fontWeight: 600, color: "var(--color-text-link)", cursor: "pointer", fontSize: 13, textAlign: "left" }}
                            >
                              {r.name}
                            </button>
                            {r.projectId !== undefined && getProjectConnection(r.projectId) && <Connect size="sm" style={{ color: "#ff5200", flexShrink: 0 }} aria-label="Connected project" />}
                          </span>
                        </td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--color-border-separator)", color: "var(--color-text-primary)", whiteSpace: "nowrap" }}>{r.stage}</td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--color-border-separator)", color: "var(--color-text-primary)" }}>{r.currentMilestone}</td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--color-border-separator)", color: "var(--color-text-secondary)" }}>{r.nextMilestone}</td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--color-border-separator)", color: "var(--color-text-primary)", whiteSpace: "nowrap" }}>{formatDate(r.startDate)}</td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--color-border-separator)", color: "var(--color-text-primary)", whiteSpace: "nowrap" }}>{formatDate(r.endDate)}</td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--color-border-separator)", textAlign: "right", whiteSpace: "nowrap" }}>
                          {varianceBadge(r.varianceDays)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Tearsheet>
      <ProjectScheduleTearsheet projectId={openProjectId} onClose={() => setOpenProjectId(null)} />
    </>
  );
}

const HISTOGRAM_BUCKETS = [
  { label: "0-3 days", min: 0, max: 3, color: "#8bc34a" },
  { label: "3-7 days", min: 3, max: 7, color: "#ffcc80" },
  { label: "7-14 days", min: 7, max: 14, color: "#ff7043" },
  { label: "14+ days", min: 14, max: Infinity, color: "#b71c1c" },
];

/** Roll detailed `ProjectStage` values into four portfolio buckets (donut + legend). */
const PROJECT_STAGE_BUCKETS: readonly {
  readonly id: string;
  readonly label: string;
  readonly color: string;
  readonly stages: readonly ProjectStage[];
}[] = [
  { id: "concept", label: "Concept", color: "#1d59d1", stages: ["Conceptual", "Feasibility"] },
  {
    id: "preconstruction",
    label: "Preconstruction",
    color: "#26a69a",
    stages: ["Final design", "Permitting", "Pre-Construction"],
  },
  {
    id: "coc",
    label: "Course of Construction",
    color: "#7b1f62",
    stages: ["Course of Construction", "Post-Construction", "Handover", "Closeout", "Maintenance"],
  },
  { id: "bidding", label: "Bidding", color: "#8d6e63", stages: ["Bidding"] },
] as const;

/** Map seed `Project.stage` → donut bucket id (aligned with hub lifecycle buckets: Concept, Preconstruction, CoC, Bidding). */
function seedStageToDonutBucketId(stage: SeedProjectStage): (typeof PROJECT_STAGE_BUCKETS)[number]["id"] {
  switch (stage) {
    case "conceptual":
    case "feasibility":
      return "concept";
    case "final_design":
    case "permitting":
    case "Pre-Construction":
      return "preconstruction";
    case "course_of_construction":
    case "Post-Construction":
    case "handover":
    case "closeout":
    case "maintenance":
      return "coc";
    case "bidding":
      return "bidding";
    default: {
      const _exhaustive: never = stage;
      return _exhaustive;
    }
  }
}

const PROJECT_PRIORITY_BUCKETS: readonly {
  readonly id: string;
  readonly label: string;
  readonly color: string;
  readonly priority: ProjectPriority;
}[] = [
  { id: "high", label: "High", color: "#c62828", priority: "high" },
  { id: "medium", label: "Medium", color: "#ef6c00", priority: "medium" },
  { id: "low", label: "Low", color: "#2e7d32", priority: "low" },
] as const;

function donutSectorPath(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startDeg: number,
  endDeg: number
): string {
  const rad = (d: number) => (d * Math.PI) / 180;
  const a0 = rad(startDeg - 90);
  const a1 = rad(endDeg - 90);
  const sweep = endDeg - startDeg;
  const large = sweep > 180 ? 1 : 0;
  const xo0 = cx + rOuter * Math.cos(a0);
  const yo0 = cy + rOuter * Math.sin(a0);
  const xo1 = cx + rOuter * Math.cos(a1);
  const yo1 = cy + rOuter * Math.sin(a1);
  const xi0 = cx + rInner * Math.cos(a0);
  const yi0 = cy + rInner * Math.sin(a0);
  const xi1 = cx + rInner * Math.cos(a1);
  const yi1 = cy + rInner * Math.sin(a1);
  return `M ${xo0} ${yo0} A ${rOuter} ${rOuter} 0 ${large} 1 ${xo1} ${yo1} L ${xi1} ${yi1} A ${rInner} ${rInner} 0 ${large} 0 ${xi0} ${yi0} Z`;
}

export function ProjectsByStageHubCard() {
  const { filteredSeedProjects } = useHubFilters();
  const [chartView, setChartView] = useState<"pie" | "bar">("pie");

  const bucketCounts = useMemo(() => {
    const counts = PROJECT_STAGE_BUCKETS.map((b) => ({ bucket: b, value: 0 }));
    for (const p of filteredSeedProjects) {
      const id = seedStageToDonutBucketId(p.stage);
      const row = counts.find((c) => c.bucket.id === id);
      if (row) row.value += 1;
    }
    return counts;
  }, [filteredSeedProjects]);

  /** Center total = filtered seed portfolio size (matches Capital Planning hub filter). */
  const total = filteredSeedProjects.length;

  const gapDeg = 2;
  const cx = 50;
  const cy = 50;
  const rOuter = 38;
  const rInner = 24;
  const allocDeg = Math.max(0, 360 - PROJECT_STAGE_BUCKETS.length * gapDeg);

  const segments = useMemo(() => {
    if (total <= 0) return [] as { path: string; color: string; key: string }[];
    let angle = -90 + gapDeg / 2;
    return bucketCounts.map(({ bucket, value }) => {
      const sweep = (value / total) * allocDeg;
      const start = angle;
      const end = angle + sweep;
      angle = end + gapDeg;
      const path = value > 0 ? donutSectorPath(cx, cy, rInner, rOuter, start, end) : "";
      return { path, color: bucket.color, key: bucket.id };
    });
  }, [bucketCounts, total, allocDeg, gapDeg]);

  return (
    <HubCardFrame
      title="Projects by Stage"
      infoTooltip="On Home → Capital Planning: seed projects in the current hub filter, grouped into four lifecycle stages. Center total matches the filtered portfolio count."
      style={{ minHeight: 260, maxHeight: 360 }}
      actions={
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          <Button
            type="button"
            variant="tertiary"
            className="b_tertiary"
            size="sm"
            icon={<Fullscreen size="sm" />}
            aria-label="Full screen"
            onClick={() => {}}
          />
          <Dropdown
            variant="tertiary"
            className="b_tertiary"
            size="sm"
            icon={<EllipsisVertical size="sm" />}
            aria-label="Projects by stage card menu"
            placement="bottom-right"
            onSelect={(selection) => {
              if (selection.action !== "selected") return;
            }}
          >
            <Dropdown.Item item="export">Export</Dropdown.Item>
            <Dropdown.Item item="refresh">Refresh</Dropdown.Item>
          </Dropdown>
        </div>
      }
      controls={
        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
          <Tabs>
            <Tabs.Tab selected={chartView === "pie"} onPress={() => setChartView("pie")} role="button">
              <Tabs.Link>Pie Chart</Tabs.Link>
            </Tabs.Tab>
            <Tabs.Tab selected={chartView === "bar"} onPress={() => setChartView("bar")} role="button">
              <Tabs.Link>Bar Chart</Tabs.Link>
            </Tabs.Tab>
          </Tabs>
        </div>
      }
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: "28px 40px",
          width: "100%",
          minHeight: 200,
          boxSizing: "border-box",
        }}
      >
        {chartView === "pie" ? (
          <div
            style={{
              position: "relative",
              width: 200,
              height: 200,
              flexShrink: 0,
            }}
            aria-label="Projects by stage donut chart"
          >
            <svg width="200" height="200" viewBox="0 0 100 100" style={{ display: "block" }}>
              {total > 0 ? (
                segments.map(
                  (s, i) =>
                    s.path && (
                      <Tooltip
                        key={s.key}
                        trigger={["hover", "focus"]}
                        placement="top"
                        overlay={
                          <Tooltip.Content>
                            {`${PROJECT_STAGE_BUCKETS[i]?.label ?? "Segment"}: ${bucketCounts[i]?.value ?? 0}`}
                          </Tooltip.Content>
                        }
                      >
                        <path
                          d={s.path}
                          fill={s.color}
                          stroke="var(--color-surface-card)"
                          strokeWidth={0.6}
                          vectorEffect="non-scaling-stroke"
                          tabIndex={0}
                        />
                      </Tooltip>
                    )
                )
              ) : (
                <circle cx={50} cy={50} r={31} fill="none" stroke="var(--color-border-separator)" strokeWidth={14} />
              )}
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
                textAlign: "center",
              }}
            >
              <Typography intent="h2" style={{ margin: 0, fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1.1 }}>
                {total}
              </Typography>
              <Typography intent="small" style={{ marginTop: 2, color: "var(--color-text-secondary)" }}>
                Total
              </Typography>
            </div>
          </div>
        ) : (
          <div style={{ width: "100%", minHeight: 210, display: "flex", gap: 10 }}>
            {(() => {
              const maxValue = Math.max(1, ...bucketCounts.map(({ value }) => value));
              const axisMax = Math.ceil(maxValue / 5) * 5 || 5;
              const ticks = [0, 0.25, 0.5, 0.75, 1].map((k) => Math.round(axisMax * k));
              return (
                <>
                  <div style={{ width: 42, display: "flex", flexDirection: "column", justifyContent: "space-between", paddingBottom: 30 }}>
                    {[...ticks].reverse().map((tick, i) => (
                      <Typography key={`stage-tick-${i}`} intent="small" style={{ color: "var(--color-text-secondary)" }}>
                        {tick}
                      </Typography>
                    ))}
                  </div>
                  <div style={{ flex: 1, position: "relative", paddingBottom: 30 }}>
                    <div style={{ position: "absolute", inset: "0 0 30px 0", display: "flex", flexDirection: "column", justifyContent: "space-between", pointerEvents: "none" }}>
                      {ticks.slice(1).map((tick, i) => (
                        <div key={`stage-grid-${tick}-${i}`} style={{ borderTop: "1px dashed var(--color-border-separator)" }} />
                      ))}
                    </div>
                    <div style={{ position: "absolute", inset: "0 0 30px 0", display: "flex", alignItems: "flex-end", justifyContent: "space-around", gap: 14 }}>
                      {bucketCounts.map(({ bucket, value }) => {
                        const pct = axisMax > 0 ? (value / axisMax) * 100 : 0;
                        return (
                          <Tooltip
                            key={`stage-bar-${bucket.id}`}
                            trigger={["hover", "focus"]}
                            placement="top"
                            overlay={
                              <Tooltip.Content>
                                {`${bucket.label}: ${value}`}
                              </Tooltip.Content>
                            }
                          >
                            <div
                              style={{
                                width: 28,
                                minWidth: 28,
                                maxWidth: 28,
                                height: `${Math.max(0, pct)}%`,
                                minHeight: value > 0 ? 2 : 0,
                                background: bucket.color,
                                borderRadius: "3px 3px 0 0",
                              }}
                              tabIndex={0}
                            />
                          </Tooltip>
                        );
                      })}
                    </div>
                    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, display: "flex", justifyContent: "space-around", gap: 14, borderTop: "1px solid var(--color-border-separator)", paddingTop: 8 }}>
                      {bucketCounts.map(({ bucket }) => (
                        <Typography key={`stage-x-${bucket.id}`} intent="small" style={{ color: "var(--color-text-secondary)", width: 72, textAlign: "center" }}>
                          {bucket.label}
                        </Typography>
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: chartView === "pie" ? "column" : "row",
            flexWrap: chartView === "pie" ? "nowrap" : "wrap",
            gap: chartView === "pie" ? 16 : 12,
            minWidth: 0,
            flex: "1 1 200px",
            maxWidth: chartView === "pie" ? 320 : "100%",
          }}
          aria-label="Stage legend"
        >
          {bucketCounts.map(({ bucket, value }) => (
            <li
              key={bucket.id}
              style={{
                display: "flex",
                alignItems: chartView === "pie" ? "flex-start" : "center",
                gap: chartView === "pie" ? 10 : 6,
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: bucket.color,
                  marginTop: chartView === "pie" ? 5 : 0,
                  flexShrink: 0,
                }}
              />
              {chartView === "pie" ? (
                <div style={{ minWidth: 0, display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "6px 8px", lineHeight: 1.25 }}>
                  <Typography intent="body" weight="semibold" style={{ margin: 0, fontVariantNumeric: "tabular-nums" }}>
                    {value}
                  </Typography>
                  <Typography intent="body" style={{ margin: 0, color: "var(--color-text-secondary)" }}>
                    {bucket.label}
                  </Typography>
                </div>
              ) : (
                <Typography intent="small" style={{ margin: 0, color: "var(--color-text-primary)" }}>
                  {bucket.label}
                </Typography>
              )}
            </li>
          ))}
        </ul>
      </div>
    </HubCardFrame>
  );
}

export function ProjectsByPriorityHubCard() {
  const { filteredSeedProjects } = useHubFilters();
  const [chartView, setChartView] = useState<"pie" | "bar">("pie");

  const bucketCounts = useMemo(() => {
    const counts = PROJECT_PRIORITY_BUCKETS.map((b) => ({ bucket: b, value: 0 }));
    for (const p of filteredSeedProjects) {
      const row = counts.find((c) => c.bucket.priority === p.priority);
      if (row) row.value += 1;
    }
    return counts;
  }, [filteredSeedProjects]);

  /** Center total = filtered seed portfolio size (matches Capital Planning hub filter). */
  const total = filteredSeedProjects.length;

  const gapDeg = 2;
  const cx = 50;
  const cy = 50;
  const rOuter = 38;
  const rInner = 24;
  const nBuckets = PROJECT_PRIORITY_BUCKETS.length;
  const allocDeg = Math.max(0, 360 - nBuckets * gapDeg);

  const segments = useMemo(() => {
    if (total <= 0) return [] as { path: string; color: string; key: string }[];
    let angle = -90 + gapDeg / 2;
    return bucketCounts.map(({ bucket, value }) => {
      const sweep = (value / total) * allocDeg;
      const start = angle;
      const end = angle + sweep;
      angle = end + gapDeg;
      const path = value > 0 ? donutSectorPath(cx, cy, rInner, rOuter, start, end) : "";
      return { path, color: bucket.color, key: bucket.id };
    });
  }, [bucketCounts, total, allocDeg, gapDeg]);

  return (
    <HubCardFrame
      title="Projects by Priority"
      infoTooltip="On Home → Capital Planning: seed projects in the current hub filter, grouped by priority (High, Medium, Low). Center total matches the filtered portfolio count."
      style={{ minHeight: 260, maxHeight: 360 }}
      actions={
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          <Button
            type="button"
            variant="tertiary"
            className="b_tertiary"
            size="sm"
            icon={<Fullscreen size="sm" />}
            aria-label="Full screen"
            onClick={() => {}}
          />
          <Dropdown
            variant="tertiary"
            className="b_tertiary"
            size="sm"
            icon={<EllipsisVertical size="sm" />}
            aria-label="Projects by priority card menu"
            placement="bottom-right"
            onSelect={(selection) => {
              if (selection.action !== "selected") return;
            }}
          >
            <Dropdown.Item item="export">Export</Dropdown.Item>
            <Dropdown.Item item="refresh">Refresh</Dropdown.Item>
          </Dropdown>
        </div>
      }
      controls={
        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
          <Tabs>
            <Tabs.Tab selected={chartView === "pie"} onPress={() => setChartView("pie")} role="button">
              <Tabs.Link>Pie Chart</Tabs.Link>
            </Tabs.Tab>
            <Tabs.Tab selected={chartView === "bar"} onPress={() => setChartView("bar")} role="button">
              <Tabs.Link>Bar Chart</Tabs.Link>
            </Tabs.Tab>
          </Tabs>
        </div>
      }
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: "28px 40px",
          width: "100%",
          minHeight: 200,
          boxSizing: "border-box",
        }}
      >
        {chartView === "pie" ? (
          <div
            style={{
              position: "relative",
              width: 200,
              height: 200,
              flexShrink: 0,
            }}
            aria-label="Projects by priority donut chart"
          >
            <svg width="200" height="200" viewBox="0 0 100 100" style={{ display: "block" }}>
              {total > 0 ? (
                segments.map(
                  (s, i) =>
                    s.path && (
                      <Tooltip
                        key={s.key}
                        trigger={["hover", "focus"]}
                        placement="top"
                        overlay={
                          <Tooltip.Content>
                            {`${PROJECT_PRIORITY_BUCKETS[i]?.label ?? "Segment"}: ${bucketCounts[i]?.value ?? 0}`}
                          </Tooltip.Content>
                        }
                      >
                        <path
                          d={s.path}
                          fill={s.color}
                          stroke="var(--color-surface-card)"
                          strokeWidth={0.6}
                          vectorEffect="non-scaling-stroke"
                          tabIndex={0}
                        />
                      </Tooltip>
                    )
                )
              ) : (
                <circle cx={50} cy={50} r={31} fill="none" stroke="var(--color-border-separator)" strokeWidth={14} />
              )}
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
                textAlign: "center",
              }}
            >
              <Typography intent="h2" style={{ margin: 0, fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1.1 }}>
                {total}
              </Typography>
              <Typography intent="small" style={{ marginTop: 2, color: "var(--color-text-secondary)" }}>
                Total
              </Typography>
            </div>
          </div>
        ) : (
          <div style={{ width: "100%", minHeight: 210, display: "flex", gap: 10 }}>
            {(() => {
              const maxValue = Math.max(1, ...bucketCounts.map(({ value }) => value));
              const axisMax = Math.ceil(maxValue / 5) * 5 || 5;
              const ticks = [0, 0.25, 0.5, 0.75, 1].map((k) => Math.round(axisMax * k));
              return (
                <>
                  <div style={{ width: 42, display: "flex", flexDirection: "column", justifyContent: "space-between", paddingBottom: 30 }}>
                    {[...ticks].reverse().map((tick, i) => (
                      <Typography key={`priority-tick-${i}`} intent="small" style={{ color: "var(--color-text-secondary)" }}>
                        {tick}
                      </Typography>
                    ))}
                  </div>
                  <div style={{ flex: 1, position: "relative", paddingBottom: 30 }}>
                    <div style={{ position: "absolute", inset: "0 0 30px 0", display: "flex", flexDirection: "column", justifyContent: "space-between", pointerEvents: "none" }}>
                      {ticks.slice(1).map((tick, i) => (
                        <div key={`priority-grid-${tick}-${i}`} style={{ borderTop: "1px dashed var(--color-border-separator)" }} />
                      ))}
                    </div>
                    <div style={{ position: "absolute", inset: "0 0 30px 0", display: "flex", alignItems: "flex-end", justifyContent: "space-around", gap: 20 }}>
                      {bucketCounts.map(({ bucket, value }) => {
                        const pct = axisMax > 0 ? (value / axisMax) * 100 : 0;
                        return (
                          <Tooltip
                            key={`priority-bar-${bucket.id}`}
                            trigger={["hover", "focus"]}
                            placement="top"
                            overlay={
                              <Tooltip.Content>
                                {`${bucket.label}: ${value}`}
                              </Tooltip.Content>
                            }
                          >
                            <div
                              style={{
                                width: 40,
                                minWidth: 40,
                                maxWidth: 40,
                                height: `${Math.max(0, pct)}%`,
                                minHeight: value > 0 ? 2 : 0,
                                background: bucket.color,
                                borderRadius: "3px 3px 0 0",
                              }}
                              tabIndex={0}
                            />
                          </Tooltip>
                        );
                      })}
                    </div>
                    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, display: "flex", justifyContent: "space-around", gap: 20, borderTop: "1px solid var(--color-border-separator)", paddingTop: 8 }}>
                      {bucketCounts.map(({ bucket }) => (
                        <Typography key={`priority-x-${bucket.id}`} intent="small" style={{ color: "var(--color-text-secondary)", width: 70, textAlign: "center" }}>
                          {bucket.label}
                        </Typography>
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: chartView === "pie" ? "column" : "row",
            flexWrap: chartView === "pie" ? "nowrap" : "wrap",
            gap: chartView === "pie" ? 16 : 12,
            minWidth: 0,
            flex: "1 1 200px",
            maxWidth: chartView === "pie" ? 320 : "100%",
          }}
          aria-label="Priority legend"
        >
          {bucketCounts.map(({ bucket, value }) => (
            <li
              key={bucket.id}
              style={{
                display: "flex",
                alignItems: chartView === "pie" ? "flex-start" : "center",
                gap: chartView === "pie" ? 10 : 6,
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: bucket.color,
                  marginTop: chartView === "pie" ? 5 : 0,
                  flexShrink: 0,
                }}
              />
              {chartView === "pie" ? (
                <div style={{ minWidth: 0, display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "6px 8px", lineHeight: 1.25 }}>
                  <Typography intent="body" weight="semibold" style={{ margin: 0, fontVariantNumeric: "tabular-nums" }}>
                    {value}
                  </Typography>
                  <Typography intent="body" style={{ margin: 0, color: "var(--color-text-secondary)" }}>
                    {bucket.label}
                  </Typography>
                </div>
              ) : (
                <Typography intent="small" style={{ margin: 0, color: "var(--color-text-primary)" }}>
                  {bucket.label}
                </Typography>
              )}
            </li>
          ))}
        </ul>
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
      {openBucketIdx !== null && (
        <VarianceBucketTearsheet
          open={true}
          onClose={() => setOpenBucketIdx(null)}
          bucketLabel={HISTOGRAM_BUCKETS[openBucketIdx].label}
          rows={tearsheetRows}
        />
      )}
    <HubCardFrame
      title="Schedule Variance"
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
              color: 'var(--color-pill-text-blue)',
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
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "4px 6px", borderBottom: "1px solid var(--color-border-separator)", fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)" }}>Project</th>
                <th style={{ textAlign: "center", padding: "4px 6px", borderBottom: "1px solid var(--color-border-separator)", fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)" }}>End Date</th>
                <th style={{ textAlign: "center", padding: "4px 6px", borderBottom: "1px solid var(--color-border-separator)", fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>Expected Completion</th>
                <th style={{ textAlign: "center", padding: "4px 6px", borderBottom: "1px solid var(--color-border-separator)", fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)" }}>Variance</th>
                <th style={{ textAlign: "center", padding: "4px 6px", borderBottom: "1px solid var(--color-border-separator)", fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)" }}>% Complete</th>
                <th style={{ width: 36, borderBottom: "1px solid var(--color-border-separator)" }} />
              </tr>
            </thead>
            <tbody>
              {criticalRows.map(({ row, varianceDays, pctComplete, endDate, expectedCompletionDate }, i) => (
                <tr key={row.id} style={{ background: i % 2 === 0 ? "var(--color-surface-primary)" : "var(--color-surface-secondary)" }}>
                  <td style={{ padding: "8px 8px", borderBottom: "1px solid var(--color-border-separator)" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <button
                        onClick={() => setOpenProjectId(row.id)}
                        style={{ background: "none", border: "none", padding: 0, fontSize: 14, fontWeight: 600, color: "var(--color-text-link)", cursor: "pointer", textAlign: "left" }}
                      >
                        {sampleProjectRows.find((p) => p.id === row.id)?.name ?? row.name}
                      </button>
                      {getProjectConnection(row.id) && <Connect size="sm" style={{ color: "#ff5200", flexShrink: 0 }} aria-label="Connected project" />}
                    </span>
                  </td>
                  <td style={{ padding: "6px 6px", borderBottom: "1px solid var(--color-border-separator)", textAlign: "center", fontSize: 12, whiteSpace: "nowrap" }}>
                    {endDate ? formatDate(endDate) : "—"}
                  </td>
                  <td style={{ padding: "6px 6px", borderBottom: "1px solid var(--color-border-separator)", textAlign: "center", fontSize: 12, whiteSpace: "nowrap" }}>
                    {expectedCompletionDate ? formatDate(expectedCompletionDate) : "—"}
                  </td>
                  <td style={{ padding: "6px 6px", borderBottom: "1px solid var(--color-border-separator)", textAlign: "center" }}>
                    {varianceBadge(varianceDays)}
                  </td>
                  <td style={{ padding: "6px 6px", borderBottom: "1px solid var(--color-border-separator)", textAlign: "center", fontSize: "14px", fontWeight: "600", color: "var(--color-text-primary)" }}>
                    {pctComplete}%
                  </td>
                  <td style={{ padding: "4px 4px", borderBottom: "1px solid #eee", textAlign: "center" }}>
                    <button
                      onClick={() => openAiPanel({
                        itemName: sampleProjectRows.find((p) => p.id === row.id)?.name ?? row.name,
                        itemId: `#${row.id}`,
                        projectId: row.id,
                        pills: [{ label: `+${varianceDays}d variance`, color: varianceDays >= 14 ? 'red' : varianceDays >= 7 ? 'yellow' : 'green' }],
                        aiSummary: `This project is ${varianceDays} days behind schedule at ${pctComplete}% completion.`,
                        cardType: 'schedule_variance',
                        userRoles: ['owner', 'owner_admin', 'project_manager'],
                      })}
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
    </HubCardFrame>
    <ProjectScheduleTearsheet projectId={openProjectId} onClose={() => setOpenProjectId(null)} />
    </>
  );
}

export function ScheduleVariance2HubCard() {
  const [openSegment, setOpenSegment] = useState<"average" | "onSchedule" | "delays" | "critical" | null>(null);
  const [openProjectId, setOpenProjectId] = useState<number | null>(null);
  const { openPanel: openAiPanel } = useAiPanel();
  const { filteredProjectRows } = useHubFilters();

  const portfolioRows = useMemo(() => {
    return filteredProjectRows
      .map((row) => {
        const milestones = sampleProjectMilestones.get(row.id) ?? [];
        const worstVariance = milestones.reduce(
          (max, m) => Math.max(max, m.varianceDays),
          0
        );
        const delayed = milestones.filter((m) => m.varianceDays >= 7).length;
        const drift = milestones.length
          ? Math.round((delayed / milestones.length) * 100)
          : 0;
        const costDeltaMillions = Math.max(
          0.4,
          Math.round((worstVariance * 0.32 + row.id * 0.11) * 10) / 10
        );
        return {
          id: row.id,
          name: row.name,
          drift,
          worstVariance,
          costDeltaLabel:
            costDeltaMillions >= 1
              ? `+$${costDeltaMillions.toFixed(1)}M`
              : `+$${Math.round(costDeltaMillions * 1000)}K`,
        };
      })
      .sort((a, b) => b.worstVariance - a.worstVariance);
  }, [filteredProjectRows]);
  const rows = useMemo(() => portfolioRows.slice(0, 6), [portfolioRows]);

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

  // Build tearsheet rows for the selected KPI segment
  const tearsheetRows = useMemo(() => {
    if (openSegment === null) return [];
    let projectsForSegment = filteredProjectRows;
    if (openSegment === "onSchedule") {
      projectsForSegment = filteredProjectRows.filter((p) => {
        const d = scheduleVarianceData.find((x) => x.project === p.name);
        return (d?.variance ?? 0) <= 0;
      });
    } else if (openSegment === "delays") {
      projectsForSegment = filteredProjectRows.filter((p) => {
        const d = scheduleVarianceData.find((x) => x.project === p.name);
        const v = d?.variance ?? 0;
        return v >= 7 && v <= 13;
      });
    } else if (openSegment === "critical") {
      projectsForSegment = filteredProjectRows.filter((p) => {
        const d = scheduleVarianceData.find((x) => x.project === p.name);
        return (d?.variance ?? 0) >= 14;
      });
    }
    return projectsForSegment
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
  }, [openSegment, filteredProjectRows]);

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
      {openSegment !== null && (
        <VarianceBucketTearsheet
          open={true}
          onClose={() => setOpenSegment(null)}
          bucketLabel={tearsheetLabel}
          rows={tearsheetRows}
        />
      )}
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
              color: 'var(--color-pill-text-blue)',
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
          <div style={{ fontSize: 24, lineHeight: "28px", fontWeight: 600, color: varianceColors(avgVariance).bg, marginTop: 4 }}>+{avgVariance} days</div>
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
          <div style={{ fontSize: 24, lineHeight: "28px", fontWeight: 600, color: varianceColors(0).bg, marginTop: 4 }}>{onScheduleCount} <span style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 4 }}>of {portfolioRows.length}</span></div>
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
          <div style={{ fontSize: 14, fontWeight: 400, color: "var(--color-text-primary)", letterSpacing: 0.2 }}>Delays (7-13 days)</div>
          <div style={{ fontSize: 24, lineHeight: "28px", fontWeight: 600, color: varianceColors(10).bg, marginTop: 4 }}>{delaysCount} <span style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 4 }}>of {portfolioRows.length}</span></div>
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
          <div style={{ fontSize: 24, lineHeight: "28px", fontWeight: 600, color: varianceColors(21).bg, marginTop: 4 }}>{criticalCount} <span style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 4 }}>of {portfolioRows.length}</span></div>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid var(--color-border-separator)", color: "var(--color-text-secondary)" }}>Project</th>
            <th style={{ textAlign: "center", padding: "6px 8px", borderBottom: "1px solid var(--color-border-separator)", color: "var(--color-text-secondary)" }}>Drift</th>
            <th style={{ textAlign: "center", padding: "6px 8px", borderBottom: "1px solid var(--color-border-separator)", color: "var(--color-text-secondary)" }}>Variance</th>
            <th style={{ textAlign: "right", padding: "6px 8px", borderBottom: "1px solid var(--color-border-separator)", color: "var(--color-text-secondary)" }}>Cost Delta</th>
            <th style={{ width: 36, borderBottom: "1px solid var(--color-border-separator)" }} />
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id} style={{ background: i % 2 === 0 ? "var(--color-surface-primary)" : "var(--color-surface-secondary)" }}>
              <td style={{ padding: "7px 8px", borderBottom: "1px solid var(--color-border-separator)" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <button
                    onClick={() => setOpenProjectId(r.id)}
                    style={{ background: "none", border: "none", padding: 0, fontSize: 14, fontWeight: 600, color: "var(--color-text-link)", cursor: "pointer", textAlign: "left" }}
                  >
                    {r.name}
                  </button>
                  {getProjectConnection(r.id) && <Connect size="sm" style={{ color: "#ff5200", flexShrink: 0 }} aria-label="Connected project" />}
                </span>
              </td>
              <td style={{ padding: "7px 8px", borderBottom: "1px solid var(--color-border-separator)", textAlign: "center" }}>
                {(() => { const c = varianceColors(r.worstVariance); return (
                  <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, background: c.bg, color: c.fg, fontSize: 12, fontWeight: 600 }}>
                    {r.drift}%
                  </span>
                ); })()}
              </td>
              <td style={{ padding: "7px 8px", borderBottom: "1px solid var(--color-border-separator)", textAlign: "center" }}>
                {varianceBadge(r.worstVariance)}
              </td>
              <td style={{ padding: "7px 8px", borderBottom: "1px solid var(--color-border-separator)", textAlign: "right", color: varianceColors(r.worstVariance).bg, fontWeight: 600 }}>
                {r.costDeltaLabel}
              </td>
              <td style={{ padding: "4px 4px", borderBottom: "1px solid #eef0f1", textAlign: "center" }}>
                <button
                  onClick={() => openAiPanel({
                    itemName: r.name,
                    itemId: `#${r.id}`,
                    projectId: r.id,
                    pills: [
                      { label: `+${r.worstVariance}d variance`, color: r.worstVariance >= 14 ? 'red' : r.worstVariance >= 7 ? 'yellow' : 'green' },
                      { label: `${r.drift}% drift`, color: r.drift >= 50 ? 'red' : 'yellow' },
                    ],
                    aiSummary: `This project has a worst-case variance of +${r.worstVariance} days with ${r.drift}% milestone drift and an estimated cost delta of ${r.costDeltaLabel}.`,
                    cardType: 'schedule_variance',
                    userRoles: ['owner', 'owner_admin', 'project_manager'],
                  })}
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </HubCardFrame>
    <ProjectScheduleTearsheet projectId={openProjectId} onClose={() => setOpenProjectId(null)} />
    </>
  );
}
