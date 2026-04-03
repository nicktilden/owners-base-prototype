import React, { useMemo, useState } from "react";
import { Button, Select } from "@procore/core-react";
import { EllipsisVertical, ExternalLink } from "@procore/core-icons";
import {
  sampleProjectMilestones,
  sampleProjectRows,
  topScheduleRiskProjectRowsForMilestoneHeatmap,
} from "@/data/projects";
import HubCardFrame from "@/components/hubs/HubCardFrame";

const HISTOGRAM_BUCKETS = [
  { label: "0-3 days", min: 0, max: 3, color: "#8bc34a" },
  { label: "3-7 days", min: 3, max: 7, color: "#ffcc80" },
  { label: "7-14 days", min: 7, max: 14, color: "#ff7043" },
  { label: "14+ days", min: 14, max: Infinity, color: "#b71c1c" },
];

function bucketIndexForVariance(v: number): number {
  return HISTOGRAM_BUCKETS.findIndex((b) => v >= b.min && v < b.max);
}

export function ProjectsByStageHubCard() {
  const [programFilter, setProgramFilter] = useState<string>("All Programs");
  const [stageFilter, setStageFilter] = useState<string>("All Stages");
  const stageColors = ["#1d5cc9", "#00a878", "#6b4ce6", "#f6a623", "#e05263", "#4a6572"];
  const programOptions = useMemo(
    () => ["All Programs", ...Array.from(new Set(sampleProjectRows.map((r) => r.program))).sort()],
    []
  );
  const stageOptions = useMemo(
    () => ["All Stages", ...Array.from(new Set(sampleProjectRows.map((r) => r.stage))).sort()],
    []
  );
  const filteredProjects = useMemo(
    () =>
      sampleProjectRows.filter((r) => {
        const programOk = programFilter === "All Programs" || r.program === programFilter;
        const stageOk = stageFilter === "All Stages" || r.stage === stageFilter;
        return programOk && stageOk;
      }),
    [programFilter, stageFilter]
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
  const allMilestones = useMemo(
    () =>
      topScheduleRiskProjectRowsForMilestoneHeatmap.flatMap(
        (row) => sampleProjectMilestones.get(row.id) ?? []
      ),
    []
  );
  const counts = useMemo(
    () =>
      HISTOGRAM_BUCKETS.map(
        (_, i) =>
          allMilestones.filter((m) => bucketIndexForVariance(m.varianceDays) === i).length
      ),
    [allMilestones]
  );
  const maxCount = Math.max(...counts, 1);
  const criticalRows = useMemo(
    () =>
      topScheduleRiskProjectRowsForMilestoneHeatmap
        .map((row) => {
          const project = sampleProjectRows.find((p) => p.id === row.id);
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
    []
  );

  return (
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
                <div key={b.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, height: "100%", justifyContent: "flex-end" }}>
                  <span style={{ fontSize: 12, color: "#232729", fontWeight: 600 }}>{count}</span>
                  <div
                    style={{
                      width: "100%",
                      height: `${Math.max(count > 0 ? 8 : 0, (count / maxCount) * 100)}%`,
                      background: b.color,
                      borderRadius: "3px 3px 0 0",
                    }}
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
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#1d5cc9" }}>
                      {sampleProjectRows.find((p) => p.id === row.id)?.name ?? row.name}
                    </span>
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
  );
}

export function ScheduleVariance2HubCard() {
  const portfolioRows = useMemo(() => {
    return sampleProjectRows
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
  }, []);
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

  return (
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
        <div style={{ padding: "8px 16px", borderRight: "1px solid #d6dadc" }}>
          <div style={{ fontSize: 14, fontWeight: 400, color: "#232729", letterSpacing: 0.2 }}>Average</div>
          <div style={{ fontSize: 24, lineHeight: "28px", fontWeight: 600, color: "#d92626", marginTop: 4 }}>+{avgVariance} days</div>
        </div>
        <div style={{ padding: "8px 16px", borderRight: "1px solid #d6dadc" }}>
          <div style={{ fontSize: 14, fontWeight: 400, color: "#232729", letterSpacing: 0.2 }}>On Schedule</div>
          <div style={{ fontSize: 24, lineHeight: "28px", fontWeight: 600, color: "#1a7d3a", marginTop: 4 }}>{onScheduleCount} <span style={{ fontSize: 12, color: "#6a767c", marginTop: 4 }}>of {portfolioRows.length}</span></div>
          
        </div>
        <div style={{ padding: "8px 16px", borderRight: "1px solid #d6dadc" }}>
          <div style={{ fontSize: 14, fontWeight: 400, color: "#232729", letterSpacing: 0.2 }}>Delays (7-13 days)</div>
          <div style={{ fontSize: 24, lineHeight: "28px", fontWeight: 600, color: "#f6a623", marginTop: 4 }}>{delaysCount} <span style={{ fontSize: 12, color: "#6a767c", marginTop: 4 }}>of {portfolioRows.length}</span></div>
        </div>
        <div style={{ padding: "8px 16px"}}>
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
                <span style={{ fontSize: 14, fontWeight: 600, color: "#1d5cc9", cursor: "pointer" }}>
                  {r.name}
                </span>
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
  );
}
