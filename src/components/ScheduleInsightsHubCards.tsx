import React, { useMemo, useState } from "react";
import { Button, Select, Tearsheet, Typography } from "@procore/core-react";
import { EllipsisVertical, ExternalLink } from "@procore/core-icons";
import {
  sampleProjectMilestones,
  sampleProjectRows,
  topScheduleRiskProjectRowsForMilestoneHeatmap,
  scheduleVarianceData,
  getCurrentMilestoneLabelForProject,
  PROJECT_MILESTONES,
} from "@/data/projects";
import HubCardFrame from "@/components/hubs/HubCardFrame";
import { createGlobalStyle } from "styled-components";
import { useHubFilters } from "@/context/HubFilterContext";

const TearsheetWide = createGlobalStyle`
  .sc-ljrxoq-1 {
    flex: 0 0 80vw !important;
    max-width: 1100px !important;
  }
`;

// ─── Project schedule detail tearsheet ───────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function varianceBadge(v: number) {
  const color = v <= 0 ? "#1a7d3a" : v <= 3 ? "#8bc34a" : v <= 7 ? "#f6a623" : v <= 14 ? "#ff7043" : "#b71c1c";
  const bg = v <= 0 ? "#e8f5e9" : "#fbe9e7";
  const label = v > 0 ? `+${v}d` : `${v}d`;
  return (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, background: bg, color, fontWeight: 600, fontSize: 12 }}>
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

  return (
    <Tearsheet open={projectId !== null} onClose={onClose} aria-label="Project schedule detail" placement="right" block>
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Header */}
        <div style={{ padding: "16px 20px 14px", borderBottom: "1px solid #d6dadc", flexShrink: 0 }}>
          {project ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <Typography intent="small" style={{ color: "#6a767c", fontWeight: 500 }}>{project.number}</Typography>
                <span style={{ color: "#d6dadc" }}>·</span>
                <Typography intent="small" style={{ color: "#6a767c" }}>{project.stage}</Typography>
              </div>
              <Typography intent="h2" style={{ fontWeight: 700, color: "#232729", display: "block" }}>
                {project.name}
              </Typography>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, color: "#6a767c" }}>
                  <span style={{ fontWeight: 600 }}>Start:</span> {formatDate(project.startDate)}
                </span>
                <span style={{ fontSize: 12, color: "#6a767c" }}>
                  <span style={{ fontWeight: 600 }}>End:</span> {formatDate(project.endDate)}
                </span>
                <span style={{ fontSize: 12, color: "#6a767c" }}>
                  <span style={{ fontWeight: 600 }}>Schedule Variance:</span>{" "}
                  {varianceBadge(scheduleVariance)}
                </span>
                <span style={{ fontSize: 12, color: "#6a767c" }}>
                  <span style={{ fontWeight: 600 }}>Current Milestone:</span> {currentMilestone}
                </span>
              </div>
            </>
          ) : (
            <Typography intent="h2" style={{ fontWeight: 700, color: "#232729" }}>Project Schedule</Typography>
          )}
        </div>

        {/* Body — milestone table */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
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
                            <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 600, color: "#1d5cc9", background: "#e8eefb", borderRadius: 3, padding: "1px 6px" }}>
                              Current
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "9px 14px", borderBottom: "1px solid #eef0f1", color: "#6a767c", whiteSpace: "nowrap" }}>{formatDate(m.baselineDate)}</td>
                        <td style={{ padding: "9px 14px", borderBottom: "1px solid #eef0f1", color: "#232729", whiteSpace: "nowrap" }}>{formatDate(m.actualDate)}</td>
                        <td style={{ padding: "9px 14px", borderBottom: "1px solid #eef0f1", textAlign: "right" }}>{varianceBadge(m.varianceDays)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
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
          return {
            row,
            critCount,
            varianceDays,
            pctComplete,
          };
        })
        .filter((r) => r.critCount > 0)
        .sort((a, b) => b.critCount - a.critCount)
        .slice(0, 7),
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
                <th style={{ textAlign: "center", padding: "4px 6px", borderBottom: "1px solid #ddd", fontSize: 12, fontWeight: 600, color: "#6A767C" }}>Variance</th>
                <th style={{ textAlign: "center", padding: "4px 6px", borderBottom: "1px solid #ddd", fontSize: 12, fontWeight: 600, color: "#6A767C" }}>% Complete</th>
              </tr>
            </thead>
            <tbody>
              {criticalRows.map(({ row, varianceDays, pctComplete }, i) => (
                <tr key={row.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={{ padding: "8px 8px", borderBottom: "1px solid #eee" }}>
                    <button
                      onClick={() => setOpenProjectId(row.id)}
                      style={{ background: "none", border: "none", padding: 0, fontSize: 14, fontWeight: 600, color: "#1d5cc9", cursor: "pointer", textAlign: "left" }}
                    >
                      {sampleProjectRows.find((p) => p.id === row.id)?.name ?? row.name}
                    </button>
                  </td>
                  <td style={{ padding: "6px 6px", borderBottom: "1px solid #eee", textAlign: "center" }}>
                    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, background: "#fbe9e7", color: "#b71c1c", fontSize: 12, fontWeight: 600 }}>
                      +{varianceDays}d
                    </span>
                  </td>
                  <td style={{ padding: "6px 6px", borderBottom: "1px solid #eee", textAlign: "center", fontSize: "14px", fontWeight: "600", color: "#232729" }}>
                    {pctComplete}%
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
          <div style={{ fontSize: 24, lineHeight: "28px", fontWeight: 600, color: "#d92626", marginTop: 4 }}>+{avgVariance} days</div>
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
          <div style={{ fontSize: 24, lineHeight: "28px", fontWeight: 600, color: "#1a7d3a", marginTop: 4 }}>{onScheduleCount} <span style={{ fontSize: 12, color: "#6a767c", marginTop: 4 }}>of {portfolioRows.length}</span></div>
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
          <div style={{ fontSize: 24, lineHeight: "28px", fontWeight: 600, color: "#f6a623", marginTop: 4 }}>{delaysCount} <span style={{ fontSize: 12, color: "#6a767c", marginTop: 4 }}>of {portfolioRows.length}</span></div>
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
          <div style={{ fontSize: 24, lineHeight: "28px", fontWeight: 600, color: "#d92626", marginTop: 4 }}>{criticalCount} <span style={{ fontSize: 12, color: "#6a767c", marginTop: 4 }}>of {portfolioRows.length}</span></div>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid #d6dadc", color: "#6a767c" }}>Project</th>
            <th style={{ textAlign: "center", padding: "6px 8px", borderBottom: "1px solid #d6dadc", color: "#6a767c" }}>Drift</th>
            <th style={{ textAlign: "center", padding: "6px 8px", borderBottom: "1px solid #d6dadc", color: "#6a767c" }}>Variance</th>
            <th style={{ textAlign: "right", padding: "6px 8px", borderBottom: "1px solid #d6dadc", color: "#6a767c" }}>Cost Delta</th>
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
                <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, background: "#fbe9e7", color: "#b71c1c", fontSize: 12, fontWeight: 600 }}>
                  {r.drift}%
                </span>
              </td>
              <td style={{ padding: "7px 8px", borderBottom: "1px solid #eef0f1", textAlign: "center" }}>
                <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, background: "#fbe9e7", color: "#b71c1c", fontSize: 12, fontWeight: 600 }}>
                  +{r.worstVariance}d
                </span>
              </td>
              <td style={{ padding: "7px 8px", borderBottom: "1px solid #eef0f1", textAlign: "right", color: "#b71c1c", fontWeight: 600 }}>
                {r.costDeltaLabel}
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
