import React, { useMemo, useState } from "react";
import { Button, Select } from "@procore/core-react";
import { ExternalLink } from "@procore/core-icons";
import {
  sampleProjectMilestones,
  sampleProjectRows,
  topScheduleRiskProjectRowsForMilestoneHeatmap,
} from "@/data/projects";
import HubCardFrame from "@/components/hubs/HubCardFrame";

const HISTOGRAM_BUCKETS = [
  { label: "0-3d", min: 0, max: 3, color: "#8bc34a" },
  { label: "3-7d", min: 3, max: 7, color: "#ffcc80" },
  { label: "7-14d", min: 7, max: 14, color: "#ff7043" },
  { label: "14+d", min: 14, max: Infinity, color: "#b71c1c" },
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
  const gradient = useMemo(() => {
    if (total === 0) return "#eef0f1";
    let cursor = 0;
    const stops = stageRows.map((s, i) => {
      const pct = (s.value / total) * 100;
      const start = cursor;
      const end = cursor + pct;
      cursor = end;
      return `${stageColors[i % stageColors.length]} ${start}% ${end}%`;
    });
    return `conic-gradient(${stops.join(", ")})`;
  }, [stageRows, total]);

  return (
    <HubCardFrame
      title="Projects by Stage"
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
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 16, alignItems: "start" }}>
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 6 }}>
              <div
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: "50%",
                  background: gradient,
                  position: "relative",
                  flexShrink: 0,
                }}
                aria-label="Projects by Stage donut chart"
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 26,
                    borderRadius: "50%",
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                  }}
                >
                  <span style={{ fontSize: 24, fontWeight: 700, color: "#232729", lineHeight: 1 }}>{total}</span>
                  <span style={{ fontSize: 11, color: "#6a767c" }}>Projects</span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {stageRows.map((s, i) => {
                const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
                return (
                  <div key={s.name} style={{ display: "grid", gridTemplateColumns: "12px 1fr auto", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: stageColors[i % stageColors.length] }} />
                    <span style={{ fontSize: 12, color: "#232729", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {s.name}
                    </span>
                    <span style={{ fontSize: 12, color: "#6a767c", fontVariantNumeric: "tabular-nums" }}>
                      {s.value} ({pct}%)
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
          const milestones = sampleProjectMilestones.get(row.id) ?? [];
          const critCount = milestones.filter((m) => m.varianceDays >= 14).length;
          return {
            row,
            critCount,
            pct: milestones.length > 0 ? Math.round((critCount / milestones.length) * 100) : 0,
          };
        })
        .filter((r) => r.critCount > 0)
        .sort((a, b) => b.critCount - a.critCount)
        .slice(0, 8),
    []
  );

  return (
    <HubCardFrame
      title="Schedule Risk"
      actions={
        <Button
          variant="tertiary"
          size="sm"
          icon={<ExternalLink size="sm" />}
          aria-label="View all schedule risk details"
        >
          View All
        </Button>
      }
    >
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80, marginBottom: 12 }}>
            {HISTOGRAM_BUCKETS.map((b, i) => {
              const count = counts[i] ?? 0;
              return (
                <div key={b.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, height: "100%", justifyContent: "flex-end" }}>
                  <span style={{ fontSize: 10, color: "#555", fontWeight: 600 }}>{count}</span>
                  <div
                    style={{
                      width: "100%",
                      height: `${Math.max(count > 0 ? 8 : 0, (count / maxCount) * 100)}%`,
                      background: b.color,
                      borderRadius: "3px 3px 0 0",
                    }}
                  />
                  <span style={{ fontSize: 9, color: "#888" }}>{b.label}</span>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#444", borderTop: "1px solid #eee", paddingTop: 8, marginBottom: 6 }}>
            Critical milestones (&gt;=14d)
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "4px 6px", borderBottom: "1px solid #ddd", fontSize: 11, color: "#666" }}>Project</th>
                <th style={{ textAlign: "center", padding: "4px 6px", borderBottom: "1px solid #ddd", fontSize: 11, color: "#666" }}>Critical</th>
                <th style={{ textAlign: "center", padding: "4px 6px", borderBottom: "1px solid #ddd", fontSize: 11, color: "#666" }}>%</th>
              </tr>
            </thead>
            <tbody>
              {criticalRows.map(({ row, critCount, pct }, i) => (
                <tr key={row.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={{ padding: "5px 6px", borderBottom: "1px solid #eee" }}>
                    <span style={{ fontWeight: 600, color: "#1d5cc9" }}>
                      {sampleProjectRows.find((p) => p.id === row.id)?.name ?? row.name}
                    </span>
                  </td>
                  <td style={{ padding: "5px 6px", borderBottom: "1px solid #eee", textAlign: "center" }}>
                    <span style={{ display: "inline-block", padding: "1px 6px", borderRadius: 4, background: "#fbe9e7", color: "#b71c1c", fontSize: 11, fontWeight: 700 }}>
                      {critCount}
                    </span>
                  </td>
                  <td style={{ padding: "5px 6px", borderBottom: "1px solid #eee", textAlign: "center", color: "#555" }}>
                    {pct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
    </HubCardFrame>
  );
}
