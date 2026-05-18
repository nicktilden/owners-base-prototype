import React, { useMemo, useState } from "react";
import { Button, Dropdown, Select, Tabs, Tooltip, Typography } from "@procore/core-react";
import { EllipsisVertical, Fullscreen } from "@procore/core-icons";
import HubCardFrame from "@/components/hubs/HubCardFrame";
import { useHubFilters } from "@/context/HubFilterContext";
import {
  SAMPLE_PROJECT_ROWS,
  prototypeDepartmentFromName,
  prototypeProjectTypeFromName,
} from "@/components/tools/capitalPlanning/capitalPlanningData";
import { assignedCapitalPlanningRegion } from "@/components/tools/capitalPlanning/capitalPlanningData";

type BreakdownBucket = {
  id: string;
  label: string;
  color: string;
};

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

function BreakdownCard({
  title,
  infoTooltip,
  buckets,
  counts,
  extraControls,
  cardStyle,
}: {
  title: string;
  infoTooltip: string;
  buckets: readonly BreakdownBucket[];
  counts: ReadonlyMap<string, number>;
  extraControls?: React.ReactNode;
  cardStyle?: React.CSSProperties;
}) {
  const [chartView, setChartView] = useState<"pie" | "bar">("pie");
  const total = Array.from(counts.values()).reduce((sum, v) => sum + v, 0);
  const gapDeg = 2;
  const cx = 50;
  const cy = 50;
  const rOuter = 38;
  const rInner = 24;
  const allocDeg = Math.max(0, 360 - buckets.length * gapDeg);

  const segments = useMemo(() => {
    if (total <= 0) return [] as { path: string; color: string; key: string; label: string; value: number }[];
    let angle = -90 + gapDeg / 2;
    return buckets.map((bucket) => {
      const value = counts.get(bucket.id) ?? 0;
      const sweep = total > 0 ? (value / total) * allocDeg : 0;
      const start = angle;
      const end = angle + sweep;
      angle = end + gapDeg;
      const path = value > 0 ? donutSectorPath(cx, cy, rInner, rOuter, start, end) : "";
      return { path, color: bucket.color, key: bucket.id, label: bucket.label, value };
    });
  }, [allocDeg, buckets, counts, total]);

  return (
    <HubCardFrame
      title={title}
      infoTooltip={infoTooltip}
      style={cardStyle ?? { minHeight: 260, maxHeight: 360 }}
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
            aria-label={`${title} card menu`}
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, width: "100%" }}>
          <Tabs>
            <Tabs.Tab selected={chartView === "pie"} onPress={() => setChartView("pie")} role="button">
              <Tabs.Link>Pie Chart</Tabs.Link>
            </Tabs.Tab>
            <Tabs.Tab selected={chartView === "bar"} onPress={() => setChartView("bar")} role="button">
              <Tabs.Link>Bar Chart</Tabs.Link>
            </Tabs.Tab>
          </Tabs>
          {extraControls ? <div style={{ display: "flex", alignItems: "center", gap: 8 }}>{extraControls}</div> : null}
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
          <div style={{ position: "relative", width: 200, height: 200, flexShrink: 0 }} aria-label={`${title} donut chart`}>
            <svg width="200" height="200" viewBox="0 0 100 100" style={{ display: "block" }}>
              {total > 0 ? (
                segments.map(
                  (segment) =>
                    segment.path && (
                      <Tooltip
                        key={segment.key}
                        trigger={["hover", "focus"]}
                        placement="top"
                        overlay={
                          <Tooltip.Content>
                            {`${segment.label}: ${segment.value}`}
                          </Tooltip.Content>
                        }
                      >
                        <path
                          d={segment.path}
                          fill={segment.color}
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
          <div style={{ width: "100%", minHeight: 230, display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
              }}
              aria-label={`${title} legend`}
            >
              {buckets.map((bucket) => (
                <span key={`bar-legend-${bucket.id}`} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span
                    aria-hidden
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: bucket.color,
                      flexShrink: 0,
                    }}
                  />
                  <Typography intent="small" style={{ color: "var(--color-text-secondary)" }}>
                    {bucket.label}
                  </Typography>
                </span>
              ))}
            </div>
            <div style={{ width: "100%", minHeight: 210, display: "flex", gap: 10 }}>
            {(() => {
              const maxValue = Math.max(1, ...buckets.map((bucket) => counts.get(bucket.id) ?? 0));
              const axisMax = Math.ceil(maxValue / 5) * 5 || 5;
              const ticks = [0, 0.25, 0.5, 0.75, 1].map((k) => Math.round(axisMax * k));
              return (
                <>
                  <div style={{ width: 42, display: "flex", flexDirection: "column", justifyContent: "space-between", paddingBottom: 30 }}>
                    {[...ticks].reverse().map((tick, i) => (
                      <Typography key={`breakdown-tick-${i}`} intent="small" style={{ color: "var(--color-text-secondary)" }}>
                        {tick}
                      </Typography>
                    ))}
                  </div>
                  <div style={{ flex: 1, position: "relative", paddingBottom: 30 }}>
                    <div style={{ position: "absolute", inset: "0 0 30px 0", display: "flex", flexDirection: "column", justifyContent: "space-between", pointerEvents: "none" }}>
                      {ticks.slice(1).map((tick, i) => (
                        <div key={`breakdown-grid-${tick}-${i}`} style={{ borderTop: "1px dashed var(--color-border-separator)" }} />
                      ))}
                    </div>
                    <div style={{ position: "absolute", inset: "0 0 30px 0", display: "flex", alignItems: "flex-end", justifyContent: "space-around", gap: 12 }}>
                      {buckets.map((bucket) => {
                        const value = counts.get(bucket.id) ?? 0;
                        const pct = axisMax > 0 ? (value / axisMax) * 100 : 0;
                        return (
                          <Tooltip
                            key={`bar-${bucket.id}`}
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
                                width: 24,
                                minWidth: 24,
                                maxWidth: 24,
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
                    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, display: "flex", justifyContent: "space-around", gap: 12, borderTop: "1px solid var(--color-border-separator)", paddingTop: 8 }}>
                      {buckets.map((bucket) => (
                        <Typography key={`breakdown-x-${bucket.id}`} intent="small" style={{ color: "var(--color-text-secondary)", width: 72, textAlign: "center" }}>
                          {bucket.label}
                        </Typography>
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}
            </div>
          </div>
        )}

        {chartView === "pie" ? (
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            minWidth: 0,
            flex: "1 1 200px",
            maxWidth: 320,
          }}
          aria-label={`${title} legend`}
        >
          {buckets.map((bucket) => {
            const value = counts.get(bucket.id) ?? 0;
            return (
              <li key={bucket.id} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span
                  aria-hidden
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: bucket.color,
                    marginTop: 5,
                    flexShrink: 0,
                  }}
                />
                <div style={{ minWidth: 0, display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "6px 8px", lineHeight: 1.25 }}>
                  <Typography intent="body" weight="semibold" style={{ margin: 0, fontVariantNumeric: "tabular-nums" }}>
                    {value}
                  </Typography>
                  <Typography intent="body" style={{ margin: 0, color: "var(--color-text-secondary)" }}>
                    {bucket.label}
                  </Typography>
                </div>
              </li>
            );
          })}
        </ul>
        ) : null}
      </div>
    </HubCardFrame>
  );
}

const DEPARTMENT_BUCKETS: readonly BreakdownBucket[] = [
  { id: "operations", label: "Operations", color: "#1d59d1" },
  { id: "facilities", label: "Facilities", color: "#26a69a" },
  { id: "workplace", label: "Workplace", color: "#7b1f62" },
  { id: "engineering", label: "Engineering", color: "#ef6c00" },
  { id: "finance", label: "Finance", color: "#8d6e63" },
  { id: "real-estate", label: "Real Estate", color: "#2e7d32" },
] as const;

const PROJECT_TYPE_BUCKETS: readonly BreakdownBucket[] = [
  { id: "ground-up-construction", label: "Ground-Up Construction", color: "#c62828" },
  { id: "tenant-improvement", label: "Tenant Improvement", color: "#ef6c00" },
  { id: "infrastructure-upgrade", label: "Infrastructure Upgrade", color: "#1d59d1" },
  { id: "modernization", label: "Modernization", color: "#7b1f62" },
  { id: "sustainability-retrofit", label: "Sustainability Retrofit", color: "#2e7d32" },
  { id: "life-safety", label: "Life Safety", color: "#26a69a" },
] as const;

const PROGRAM_BUCKETS: readonly BreakdownBucket[] = [
  { id: "pacific-northwest", label: "Pacific Northwest", color: "#1d59d1" },
  { id: "mountain-west", label: "Mountain West", color: "#26a69a" },
  { id: "southwest", label: "Southwest", color: "#7b1f62" },
  { id: "central-plains", label: "Central Plains", color: "#ef6c00" },
  { id: "mid-atlantic", label: "Mid-Atlantic", color: "#8d6e63" },
  { id: "southeast", label: "Southeast", color: "#2e7d32" },
] as const;

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function useFilteredCapitalPlanningRows() {
  const { filteredSeedProjects } = useHubFilters();
  const allowedProjectIds = useMemo(() => new Set(filteredSeedProjects.map((p) => p.id)), [filteredSeedProjects]);
  return useMemo(
    () => SAMPLE_PROJECT_ROWS.filter((row) => allowedProjectIds.has(row.projectId)),
    [allowedProjectIds]
  );
}

export function ProjectsByDepartmentHubCard() {
  const rows = useFilteredCapitalPlanningRows();
  const counts = useMemo(() => {
    const map = new Map<string, number>(DEPARTMENT_BUCKETS.map((b) => [b.id, 0]));
    for (const row of rows) {
      const key = slugify(prototypeDepartmentFromName(row.project));
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [rows]);
  return (
    <BreakdownCard
      title="Projects by Department"
      infoTooltip="Capital Planning 2.0: filtered capital plan projects grouped by Department."
      buckets={DEPARTMENT_BUCKETS}
      counts={counts}
    />
  );
}

export function ProjectsByProjectTypeHubCard() {
  const rows = useFilteredCapitalPlanningRows();
  const counts = useMemo(() => {
    const map = new Map<string, number>(PROJECT_TYPE_BUCKETS.map((b) => [b.id, 0]));
    for (const row of rows) {
      const key = slugify(prototypeProjectTypeFromName(row.project));
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [rows]);
  return (
    <BreakdownCard
      title="Projects by Project Type"
      infoTooltip="Capital Planning 2.0: filtered capital plan projects grouped by Project Type."
      buckets={PROJECT_TYPE_BUCKETS}
      counts={counts}
    />
  );
}

export function ProjectsByProgramHubCard() {
  const rows = useFilteredCapitalPlanningRows();
  const counts = useMemo(() => {
    const map = new Map<string, number>(PROGRAM_BUCKETS.map((b) => [b.id, 0]));
    for (const row of rows) {
      const key = slugify(assignedCapitalPlanningRegion(row.id));
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [rows]);
  return (
    <BreakdownCard
      title="Projects by Program"
      infoTooltip="Capital Planning 2.0: filtered capital plan projects grouped by Program (region)."
      buckets={PROGRAM_BUCKETS}
      counts={counts}
    />
  );
}

type BreakdownSelectorOption = "region" | "stage" | "project_type" | "priority" | "department";

const BREAKDOWN_SELECTOR_OPTIONS: readonly { id: BreakdownSelectorOption; label: string }[] = [
  { id: "region", label: "Region" },
  { id: "stage", label: "Stage" },
  { id: "project_type", label: "Project Type" },
  { id: "priority", label: "Priority" },
  { id: "department", label: "Department" },
];

const STAGE_BUCKETS: readonly BreakdownBucket[] = [
  { id: "concept", label: "Concept", color: "#1d59d1" },
  { id: "pre-construction", label: "Pre-Construction", color: "#26a69a" },
  { id: "course-of-construction", label: "Course of Construction", color: "#7b1f62" },
  { id: "bidding", label: "Bidding", color: "#8d6e63" },
] as const;

const PRIORITY_BUCKETS: readonly BreakdownBucket[] = [
  { id: "high", label: "High", color: "#c62828" },
  { id: "medium", label: "Medium", color: "#ef6c00" },
  { id: "low", label: "Low", color: "#26a69a" },
] as const;

export function ProjectsBreakdownSelectorHubCard() {
  const rows = useFilteredCapitalPlanningRows();
  const [selection, setSelection] = useState<BreakdownSelectorOption>("region");

  const selectedBuckets =
    selection === "region"
      ? PROGRAM_BUCKETS
      : selection === "stage"
        ? STAGE_BUCKETS
      : selection === "priority"
        ? PRIORITY_BUCKETS
      : selection === "department"
      ? DEPARTMENT_BUCKETS
      : selection === "project_type"
        ? PROJECT_TYPE_BUCKETS
        : DEPARTMENT_BUCKETS;

  const selectedCounts = useMemo(() => {
    const map = new Map<string, number>(selectedBuckets.map((b) => [b.id, 0]));
    for (const row of rows) {
      const key =
        selection === "region"
          ? slugify(assignedCapitalPlanningRegion(row.id))
          : selection === "stage"
            ? slugify(row.status)
          : selection === "priority"
            ? slugify(row.priority)
          : selection === "department"
          ? slugify(prototypeDepartmentFromName(row.project))
          : selection === "project_type"
            ? slugify(prototypeProjectTypeFromName(row.project))
            : slugify(prototypeDepartmentFromName(row.project));
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [rows, selectedBuckets, selection]);

  const selectedLabel = BREAKDOWN_SELECTOR_OPTIONS.find((o) => o.id === selection)?.label ?? "Department";

  return (
    <BreakdownCard
      title={`Projects by ${selectedLabel}`}
      infoTooltip={`Capital Planning 2.0: filtered capital plan projects grouped by ${selectedLabel}.`}
      buckets={selectedBuckets}
      counts={selectedCounts}
      cardStyle={{ minHeight: 320, maxHeight: 520 }}
      extraControls={
        <div style={{ width: 180, maxWidth: "100%" }}>
          <Select
            block
            placeholder="Breakdown"
            label={selectedLabel}
            onSelect={(selectionEvent) => {
              if (selectionEvent.action !== "selected") return;
              const item = selectionEvent.item as (typeof BREAKDOWN_SELECTOR_OPTIONS)[number];
              setSelection(item.id);
            }}
          >
            {BREAKDOWN_SELECTOR_OPTIONS.map((option) => (
              <Select.Option key={option.id} value={option} selected={selection === option.id}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </div>
      }
    />
  );
}
