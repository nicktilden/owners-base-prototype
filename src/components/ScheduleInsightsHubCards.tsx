import React, { useMemo, useState } from "react";
import { Avatar, Button, Card, H2, Link, Pill, Select, Tearsheet, Typography } from "@procore/core-react";
import { Comment, Copilot, Duplicate, EllipsisVertical, Envelope, ExternalLink, Lightning, Phone, PhoneMobile } from "@procore/core-icons";
import {
  sampleProjectMilestones,
  sampleProjectRows,
  topScheduleRiskProjectRowsForMilestoneHeatmap,
  scheduleVarianceData,
  getCurrentMilestoneLabelForProject,
  PROJECT_MILESTONES,
  varianceColors,
  PROJECT_MANAGER_CONTACTS,
} from "@/data/projects";
import HubCardFrame from "@/components/hubs/HubCardFrame";
import { useAiPanel } from "@/context/AiPanelContext";
import { createGlobalStyle } from "styled-components";
import { useHubFilters } from "@/context/HubFilterContext";

const TearsheetWide = createGlobalStyle`
  .sc-ljrxoq-1 {
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
    <Tearsheet open={projectId !== null} onClose={onClose} aria-label="Project schedule detail" placement="right" block>
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Header */}
        <div style={{ padding: "16px 20px 14px", borderBottom: "1px solid #d6dadc", flexShrink: 0 }}>
          {project ? (
            <>
              <Typography intent="small" style={{ color: "#6a767c", fontWeight: 500, display: "block", marginBottom: 2 }}>{project.number}</Typography>
              <Typography intent="h2" style={{ fontWeight: 700, color: "#232729", display: "block" }}>
                {project.name}
              </Typography>
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
            <Typography intent="h2" style={{ fontWeight: 700, color: "#232729" }}>Project Schedule</Typography>
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
      <Tearsheet open={open} onClose={onClose} aria-label={`Schedule variance: ${bucketLabel}`} placement="right" block>
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Header */}
          <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #d6dadc", flexShrink: 0 }}>
            <Typography intent="h2" style={{ fontWeight: 700, color: "#232729" }}>
              Schedule Variance: {bucketLabel}
            </Typography>
            <Typography intent="small" style={{ color: "#6a767c", display: "block", marginTop: 2 }}>
              {rows.length} project{rows.length !== 1 ? "s" : ""} in this variance range
            </Typography>
          </div>
          {/* Body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
            {rows.length === 0 ? (
              <Typography intent="body" style={{ color: "#6a767c" }}>No projects in this range.</Typography>
            ) : (
              <div style={{ border: "1px solid #d6dadc", borderRadius: 8, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f5f6f7" }}>
                      <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid #d6dadc", fontWeight: 600, color: "#6a767c", whiteSpace: "nowrap" }}>#</th>
                      <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid #d6dadc", fontWeight: 600, color: "#6a767c" }}>Name</th>
                      <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid #d6dadc", fontWeight: 600, color: "#6a767c" }}>Stage</th>
                      <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid #d6dadc", fontWeight: 600, color: "#6a767c", whiteSpace: "nowrap" }}>Current Milestone</th>
                      <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid #d6dadc", fontWeight: 600, color: "#6a767c", whiteSpace: "nowrap" }}>Next Milestone</th>
                      <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid #d6dadc", fontWeight: 600, color: "#6a767c", whiteSpace: "nowrap" }}>Start Date</th>
                      <th style={{ textAlign: "left", padding: "10px 12px", borderBottom: "1px solid #d6dadc", fontWeight: 600, color: "#6a767c", whiteSpace: "nowrap" }}>End Date</th>
                      <th style={{ textAlign: "right", padding: "10px 12px", borderBottom: "1px solid #d6dadc", fontWeight: 600, color: "#6a767c", whiteSpace: "nowrap" }}>Variance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={r.number} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid #eef0f1", color: "#6a767c", whiteSpace: "nowrap" }}>{r.number}</td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid #eef0f1" }}>
                          <button
                            onClick={() => r.projectId !== undefined && setOpenProjectId(r.projectId)}
                            style={{ background: "none", border: "none", padding: 0, fontWeight: 600, color: "#1d5cc9", cursor: "pointer", fontSize: 13, textAlign: "left" }}
                          >
                            {r.name}
                          </button>
                        </td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid #eef0f1", color: "#232729", whiteSpace: "nowrap" }}>{r.stage}</td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid #eef0f1", color: "#232729" }}>{r.currentMilestone}</td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid #eef0f1", color: "#6a767c" }}>{r.nextMilestone}</td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid #eef0f1", color: "#232729", whiteSpace: "nowrap" }}>{formatDate(r.startDate)}</td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid #eef0f1", color: "#232729", whiteSpace: "nowrap" }}>{formatDate(r.endDate)}</td>
                        <td style={{ padding: "10px 12px", borderBottom: "1px solid #eef0f1", textAlign: "right", whiteSpace: "nowrap" }}>
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

export function ProjectsByStageHubCard() {
  const [programFilter, setProgramFilter] = useState<string>("All Programs");
  const [stageFilter, setStageFilter] = useState<string>("All Stages");
  const { filteredProjectRows } = useHubFilters();
  const stageColors = ["#1d5cc9", "#00a878", "#6b4ce6", "#f6a623", "#e05263", "#4a6572"];
  const programOptions = useMemo(
    () => ["All Programs", ...Array.from(new Set(filteredProjectRows.map((r) => r.program))).sort()],
    [filteredProjectRows]
  );
  const stageOptions = useMemo(
    () => ["All Stages", ...Array.from(new Set(filteredProjectRows.map((r) => r.stage))).sort()],
    [filteredProjectRows]
  );
  const filteredProjects = useMemo(
    () =>
      filteredProjectRows.filter((r) => {
        const programOk = programFilter === "All Programs" || r.program === programFilter;
        const stageOk = stageFilter === "All Stages" || r.stage === stageFilter;
        return programOk && stageOk;
      }),
    [filteredProjectRows, programFilter, stageFilter]
  );
  const stageRows = useMemo(() => {
    const counts = new Map<string, number>();
    filteredProjects.forEach((p) => {
      counts.set(p.stage, (counts.get(p.stage) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredProjects]);
  const total = useMemo(
    () => stageRows.reduce((sum, s) => sum + s.value, 0),
    [stageRows]
  );
  const maxStageValue = useMemo(
    () => Math.max(...stageRows.map((s) => s.value), 1),
    [stageRows]
  );

  return (
    <HubCardFrame
      title="Projects by Stage"
      infoTooltip="Distribution of projects by current stage from the sample project dataset, with optional Program and Stage filters."
      actions={
        <Button
          variant="tertiary"
          size="sm"
          icon={<ExternalLink size="sm" />}
          aria-label="View all projects by stage"
        >
          View All
        </Button>
      }
      controls={
        <>
          <Select
            onSelect={(next) => {
              if (typeof next === "string") setProgramFilter(next);
            }}
            placeholder="Program"
            style={{ minWidth: 180 }}
          >
            {programOptions.map((opt) => (
              <Select.Option key={opt} value={opt} selected={programFilter === opt}>
                {opt}
              </Select.Option>
            ))}
          </Select>
          <Select
            onSelect={(next) => {
              if (typeof next === "string") setStageFilter(next);
            }}
            placeholder="Stage"
            style={{ minWidth: 160 }}
          >
            {stageOptions.map((opt) => (
              <Select.Option key={opt} value={opt} selected={stageFilter === opt}>
                {opt}
              </Select.Option>
            ))}
          </Select>
        </>
      }
    >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${Math.max(stageRows.length, 1)}, minmax(56px, 1fr))`,
              gap: 10,
              alignItems: "end",
              height: 210,
            }}
            aria-label="Projects by Stage column chart"
          >
            {stageRows.map((s, i) => {
              const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
              const barHeight = `${Math.max(s.value > 0 ? 12 : 0, (s.value / maxStageValue) * 140)}px`;
              return (
                <div key={s.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#232729", fontVariantNumeric: "tabular-nums" }}>
                    {s.value}
                  </span>
                  <div
                    style={{
                      width: "100%",
                      maxWidth: 48,
                      height: barHeight,
                      borderRadius: "6px 6px 0 0",
                      background: stageColors[i % stageColors.length],
                    }}
                  />
                  <span
                    style={{
                      width: "100%",
                      fontSize: 12,
                      color: "#232729",
                      textAlign: "center",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={s.name}
                  >
                    {s.name}
                  </span>
                  <span style={{ fontSize: 12, color: "#6a767c", fontVariantNumeric: "tabular-nums" }}>
                    {pct}%
                  </span>
                </div>
              );
            })}
            {stageRows.length === 0 && (
              <div style={{ gridColumn: "1 / -1", fontSize: 12, color: "#6a767c", textAlign: "center" }}>
                No projects for selected filters.
              </div>
            )}
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
            variant="secondary"
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
            AI Actions
          </Button>
          <Button
            variant="secondary"
            size="sm"
            aria-label="View all schedule variance rows"
          >
            View all
          </Button>
          <Button
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
                  <span style={{ fontSize: 12, color: "#232729", fontWeight: 600 }}>{count}</span>
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
                  <span style={{ fontSize: 12, color: "#6A767C" }}>{b.label}</span>
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
                <th style={{ textAlign: "left", padding: "4px 6px", borderBottom: "1px solid #ddd", fontSize: 12, fontWeight: 600, color: "#6A767C" }}>Project</th>
                <th style={{ textAlign: "center", padding: "4px 6px", borderBottom: "1px solid #ddd", fontSize: 12, fontWeight: 600, color: "#6A767C" }}>End Date</th>
                <th style={{ textAlign: "center", padding: "4px 6px", borderBottom: "1px solid #ddd", fontSize: 12, fontWeight: 600, color: "#6A767C", whiteSpace: "nowrap" }}>Expected Completion</th>
                <th style={{ textAlign: "center", padding: "4px 6px", borderBottom: "1px solid #ddd", fontSize: 12, fontWeight: 600, color: "#6A767C" }}>Variance</th>
                <th style={{ textAlign: "center", padding: "4px 6px", borderBottom: "1px solid #ddd", fontSize: 12, fontWeight: 600, color: "#6A767C" }}>% Complete</th>
                <th style={{ width: 36, borderBottom: "1px solid #ddd" }} />
              </tr>
            </thead>
            <tbody>
              {criticalRows.map(({ row, varianceDays, pctComplete, endDate, expectedCompletionDate }, i) => (
                <tr key={row.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={{ padding: "8px 8px", borderBottom: "1px solid #eee" }}>
                    <button
                      onClick={() => setOpenProjectId(row.id)}
                      style={{ background: "none", border: "none", padding: 0, fontSize: 14, fontWeight: 600, color: "#1d5cc9", cursor: "pointer", textAlign: "left" }}
                    >
                      {sampleProjectRows.find((p) => p.id === row.id)?.name ?? row.name}
                    </button>
                  </td>
                  <td style={{ padding: "6px 6px", borderBottom: "1px solid #eee", textAlign: "center", fontSize: 12, whiteSpace: "nowrap" }}>
                    {endDate ? formatDate(endDate) : "—"}
                  </td>
                  <td style={{ padding: "6px 6px", borderBottom: "1px solid #eee", textAlign: "center", fontSize: 12, whiteSpace: "nowrap" }}>
                    {expectedCompletionDate ? formatDate(expectedCompletionDate) : "—"}
                  </td>
                  <td style={{ padding: "6px 6px", borderBottom: "1px solid #eee", textAlign: "center" }}>
                    {varianceBadge(varianceDays)}
                  </td>
                  <td style={{ padding: "6px 6px", borderBottom: "1px solid #eee", textAlign: "center", fontSize: "14px", fontWeight: "600", color: "#232729" }}>
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
  const rows = useMemo(() => portfolioRows.slice(0, 7), [portfolioRows]);

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
    ...(hasBorderRight ? { borderRight: "1px solid #d6dadc" } : {}),
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
      title="Schedule Variance 2"
      infoTooltip="An overview of top schedule-risk projects based on schedule milestones variance."
      actions={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Button
            variant="secondary"
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
            AI Actions
          </Button>
          <Button
            variant="secondary"
            size="sm"
            aria-label="View all schedule variance rows"
          >
            View all
          </Button>
          <Button
            variant="tertiary"
            size="sm"
            icon={<EllipsisVertical size="sm" />}
            aria-label="More actions"
          />
        </div>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", border: "1px solid #d6dadc", borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
        <div
          style={kpiCellStyle(true)}
          onClick={() => setOpenSegment("average")}
          role="button"
          tabIndex={0}
          aria-label="View all projects by average variance"
          onKeyDown={(e) => e.key === "Enter" && setOpenSegment("average")}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f6f7")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "")}
        >
          <div style={{ fontSize: 14, fontWeight: 400, color: "#232729", letterSpacing: 0.2 }}>Average</div>
          <div style={{ fontSize: 24, lineHeight: "28px", fontWeight: 600, color: varianceColors(avgVariance).bg, marginTop: 4 }}>+{avgVariance} days</div>
        </div>
        <div
          style={kpiCellStyle(true)}
          onClick={() => setOpenSegment("onSchedule")}
          role="button"
          tabIndex={0}
          aria-label="View projects on schedule"
          onKeyDown={(e) => e.key === "Enter" && setOpenSegment("onSchedule")}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f6f7")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "")}
        >
          <div style={{ fontSize: 14, fontWeight: 400, color: "#232729", letterSpacing: 0.2 }}>On Schedule</div>
          <div style={{ fontSize: 24, lineHeight: "28px", fontWeight: 600, color: varianceColors(0).bg, marginTop: 4 }}>{onScheduleCount} <span style={{ fontSize: 12, color: "#6a767c", marginTop: 4 }}>of {portfolioRows.length}</span></div>
        </div>
        <div
          style={kpiCellStyle(true)}
          onClick={() => setOpenSegment("delays")}
          role="button"
          tabIndex={0}
          aria-label="View projects with 7–13 day delays"
          onKeyDown={(e) => e.key === "Enter" && setOpenSegment("delays")}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f6f7")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "")}
        >
          <div style={{ fontSize: 14, fontWeight: 400, color: "#232729", letterSpacing: 0.2 }}>Delays (7-13 days)</div>
          <div style={{ fontSize: 24, lineHeight: "28px", fontWeight: 600, color: varianceColors(10).bg, marginTop: 4 }}>{delaysCount} <span style={{ fontSize: 12, color: "#6a767c", marginTop: 4 }}>of {portfolioRows.length}</span></div>
        </div>
        <div
          style={kpiCellStyle(false)}
          onClick={() => setOpenSegment("critical")}
          role="button"
          tabIndex={0}
          aria-label="View projects with 14+ day delays"
          onKeyDown={(e) => e.key === "Enter" && setOpenSegment("critical")}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f6f7")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "")}
        >
          <div style={{ fontSize: 14, fontWeight: 400, color: "#232729", letterSpacing: 0.2 }}>Delays (14+ days)</div>
          <div style={{ fontSize: 24, lineHeight: "28px", fontWeight: 600, color: varianceColors(21).bg, marginTop: 4 }}>{criticalCount} <span style={{ fontSize: 12, color: "#6a767c", marginTop: 4 }}>of {portfolioRows.length}</span></div>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid #d6dadc", color: "#6a767c" }}>Project</th>
            <th style={{ textAlign: "center", padding: "6px 8px", borderBottom: "1px solid #d6dadc", color: "#6a767c" }}>Drift</th>
            <th style={{ textAlign: "center", padding: "6px 8px", borderBottom: "1px solid #d6dadc", color: "#6a767c" }}>Variance</th>
            <th style={{ textAlign: "right", padding: "6px 8px", borderBottom: "1px solid #d6dadc", color: "#6a767c" }}>Cost Delta</th>
            <th style={{ width: 36, borderBottom: "1px solid #d6dadc" }} />
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
              <td style={{ padding: "7px 8px", borderBottom: "1px solid #eef0f1" }}>
                <button
                  onClick={() => setOpenProjectId(r.id)}
                  style={{ background: "none", border: "none", padding: 0, fontSize: 14, fontWeight: 600, color: "#1d5cc9", cursor: "pointer", textAlign: "left" }}
                >
                  {r.name}
                </button>
              </td>
              <td style={{ padding: "7px 8px", borderBottom: "1px solid #eef0f1", textAlign: "center" }}>
                {(() => { const c = varianceColors(r.worstVariance); return (
                  <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, background: c.bg, color: c.fg, fontSize: 12, fontWeight: 600 }}>
                    {r.drift}%
                  </span>
                ); })()}
              </td>
              <td style={{ padding: "7px 8px", borderBottom: "1px solid #eef0f1", textAlign: "center" }}>
                {varianceBadge(r.worstVariance)}
              </td>
              <td style={{ padding: "7px 8px", borderBottom: "1px solid #eef0f1", textAlign: "right", color: varianceColors(r.worstVariance).bg, fontWeight: 600 }}>
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
