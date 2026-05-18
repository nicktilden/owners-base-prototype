import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Dropdown, Select, Tabs, Tooltip, Typography } from "@procore/core-react";
import { EllipsisVertical, Fullscreen } from "@procore/core-icons";
import HubCardFrame from "@/components/hubs/HubCardFrame";
import { useHubFilters } from "@/context/HubFilterContext";
import {
  SAMPLE_PROJECT_ROWS,
  assignedCapitalPlanningRegion,
  prototypeDepartmentFromName,
  prototypeProjectTypeFromName,
  type CapitalPlanningRegion,
} from "@/components/tools/capitalPlanning/capitalPlanningData";
import {
  buildCapitalPlanningHubChartSeries,
  filterCapitalPlanningRowsByProjectIds,
  type HubPlannedCostPeriodView,
} from "@/components/tools/capitalPlanning/capitalPlanningHubChartData";
import {
  CAPITAL_PLANNING_FISCAL_SETTINGS_CHANGED_EVENT,
  readCapitalPlanningFiscalYearStartMonth,
} from "@/utils/capitalPlanningFiscalSettings";

const REGION_COLORS: Record<CapitalPlanningRegion, string> = {
  "Pacific Northwest": "#2563eb",
  "Mountain West": "#6d28d9",
  Southwest: "#0f766e",
  "Central Plains": "#8b5e3c",
  "Mid-Atlantic": "#c2410c",
  Southeast: "#0d9488",
};

const GROUP_PALETTE = [
  "#2563eb",
  "#6d28d9",
  "#0f766e",
  "#8b5e3c",
  "#c2410c",
  "#0d9488",
  "#4f46e5",
  "#b45309",
  "#0284c7",
  "#be185d",
] as const;

type BreakdownGroupBy = "region" | "stage" | "project_type" | "priority" | "department";

const BREAKDOWN_OPTIONS: readonly { id: BreakdownGroupBy; label: string }[] = [
  { id: "region", label: "Region" },
  { id: "stage", label: "Stage" },
  { id: "project_type", label: "Project Type" },
  { id: "priority", label: "Priority" },
  { id: "department", label: "Department" },
];

const VIEW_BY_OPTIONS: readonly { id: HubPlannedCostPeriodView; label: string }[] = [
  { id: "Years", label: "Year" },
  { id: "Quarter", label: "Quarter" },
  { id: "Month", label: "Month" },
];

function formatAxisUsdCompact(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "$0";
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  return `$${Math.round(n / 1_000_000)}M`;
}

function niceAxisCap(dataMax: number): number {
  if (!Number.isFinite(dataMax) || dataMax <= 0) return 10_000_000;
  const padded = dataMax * 1.12;
  const exp = Math.floor(Math.log10(padded));
  const frac = padded / 10 ** exp;
  let niceFrac: number;
  if (frac <= 1) niceFrac = 1;
  else if (frac <= 2) niceFrac = 2;
  else if (frac <= 2.5) niceFrac = 2.5;
  else if (frac <= 5) niceFrac = 5;
  else niceFrac = 10;
  return niceFrac * 10 ** exp;
}

function yForAmount(value: number, cap: number): number {
  const t = Math.min(1, Math.max(0, value / cap));
  return 100 - t * 100;
}

function linePath(points: readonly { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  let d = `M ${points[0]!.x} ${points[0]!.y}`;
  for (let i = 1; i < points.length; i++) {
    const p = points[i]!;
    d += ` L ${p.x} ${p.y}`;
  }
  return d;
}

export default function CapitalPlanByRegionHubCard(): React.ReactElement {
  const { filteredSeedProjects } = useHubFilters();
  const [fiscalYearStartMonth, setFiscalYearStartMonth] = useState(readCapitalPlanningFiscalYearStartMonth);
  const [chartTab, setChartTab] = useState<"bar" | "line">("bar");
  const [groupBy, setGroupBy] = useState<BreakdownGroupBy>("region");
  const [periodView, setPeriodView] = useState<HubPlannedCostPeriodView>("Years");
  const lineSvgRef = useRef<SVGSVGElement | null>(null);
  const [lineSvgAspectRatio, setLineSvgAspectRatio] = useState(1);

  useEffect(() => {
    const sync = () => setFiscalYearStartMonth(readCapitalPlanningFiscalYearStartMonth());
    window.addEventListener(CAPITAL_PLANNING_FISCAL_SETTINGS_CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CAPITAL_PLANNING_FISCAL_SETTINGS_CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    const svgEl = lineSvgRef.current;
    if (!svgEl) return;
    const updateAspect = () => {
      const w = svgEl.clientWidth || 1;
      const h = svgEl.clientHeight || 1;
      setLineSvgAspectRatio(w / h);
    };
    updateAspect();
    const observer = new ResizeObserver(updateAspect);
    observer.observe(svgEl);
    return () => observer.disconnect();
  }, [chartTab, periodView]);

  const filteredRows = useMemo(() => {
    const allowed = new Set(filteredSeedProjects.map((p) => p.id));
    return filterCapitalPlanningRowsByProjectIds(SAMPLE_PROJECT_ROWS, allowed);
  }, [filteredSeedProjects]);

  const rowsByGroup = useMemo(() => {
    const map = new Map<string, typeof filteredRows>();
    for (const row of filteredRows) {
      let key: string;
      if (groupBy === "region") {
        key = assignedCapitalPlanningRegion(row.id);
      } else if (groupBy === "stage") {
        key = row.status;
      } else if (groupBy === "project_type") {
        key = prototypeProjectTypeFromName(row.project);
      } else if (groupBy === "priority") {
        key = row.priority;
      } else {
        key = prototypeDepartmentFromName(row.project);
      }
      const existing = map.get(key) ?? [];
      existing.push(row);
      map.set(key, existing);
    }
    return map;
  }, [filteredRows, groupBy]);

  const groupedSeries = useMemo(() => {
    const entries = Array.from(rowsByGroup.entries()).map(([groupLabel, rows]) => {
      const periods = buildCapitalPlanningHubChartSeries(rows, periodView, new Date(), undefined, fiscalYearStartMonth);
      return { groupLabel, periods };
    });
    return entries.filter((entry) => entry.periods.some((p) => (p.planned ?? 0) > 0));
  }, [rowsByGroup, periodView, fiscalYearStartMonth]);

  const groupColors = useMemo(() => {
    const out: Record<string, string> = {};
    groupedSeries.forEach((entry, idx) => {
      if (groupBy === "region" && (entry.groupLabel as CapitalPlanningRegion) in REGION_COLORS) {
        out[entry.groupLabel] = REGION_COLORS[entry.groupLabel as CapitalPlanningRegion];
      } else {
        out[entry.groupLabel] = GROUP_PALETTE[idx % GROUP_PALETTE.length]!;
      }
    });
    return out;
  }, [groupBy, groupedSeries]);

  const periodLabels = useMemo(() => {
    const first = groupedSeries[0]?.periods ?? [];
    return first.map((p) => (periodView === "Years" ? p.label.replace(/^FY\s+/i, "") : p.label));
  }, [groupedSeries, periodView]);

  const stackedTotals = useMemo(
    () =>
      periodLabels.map((_, idx) =>
        groupedSeries.reduce((sum, entry) => sum + (entry.periods[idx]?.planned ?? 0), 0)
      ),
    [groupedSeries, periodLabels]
  );
  const axisCap = useMemo(() => niceAxisCap(Math.max(0, ...stackedTotals)), [stackedTotals]);
  const yTicks = useMemo(() => [0, 0.25, 0.5, 0.75, 1].map((k) => axisCap * k), [axisCap]);
  const lineSeries = useMemo(
    () =>
      groupedSeries.map((entry) => {
        const points = entry.periods.map((point, index) => {
          const x = entry.periods.length <= 1 ? 50 : (index / (entry.periods.length - 1)) * 100;
          return { x, y: yForAmount(point.planned ?? 0, axisCap), amount: point.planned ?? 0 };
        });
        return { groupLabel: entry.groupLabel, points };
      }),
    [axisCap, groupedSeries]
  );

  const groupingLabel = BREAKDOWN_OPTIONS.find((o) => o.id === groupBy)?.label ?? "Region";
  const lineMarkerRadiusY = 1.2;
  const lineMarkerRadiusX = Math.max(0.18, lineMarkerRadiusY / Math.max(1, lineSvgAspectRatio));

  return (
    <HubCardFrame
      title={`Forecasted Cost by ${groupingLabel}`}
      infoTooltip={`Stacked planned cost by fiscal year, grouped by ${groupingLabel.toLowerCase()}.`}
      style={{ minHeight: 320, maxHeight: 520 }}
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
            aria-label="Capital plan by region card menu"
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
        <div style={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between", gap: 12 }}>
          <Tabs>
            <Tabs.Tab selected={chartTab === "bar"} onPress={() => setChartTab("bar")} role="button">
              <Tabs.Link>Bar Chart</Tabs.Link>
            </Tabs.Tab>
            <Tabs.Tab selected={chartTab === "line"} onPress={() => setChartTab("line")} role="button">
              <Tabs.Link>Line Chart</Tabs.Link>
            </Tabs.Tab>
          </Tabs>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "0 0 auto", minWidth: 0 }}>
            <div style={{ width: 140, maxWidth: "100%" }}>
              <Select
                block
                placeholder="View by"
                label={VIEW_BY_OPTIONS.find((o) => o.id === periodView)?.label}
                onSelect={(selection) => {
                  if (selection.action !== "selected") return;
                  const item = selection.item as (typeof VIEW_BY_OPTIONS)[number];
                  setPeriodView(item.id);
                }}
              >
                {VIEW_BY_OPTIONS.map((option) => (
                  <Select.Option key={option.id} value={option} selected={periodView === option.id}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </div>
            <div style={{ width: 190, maxWidth: "100%" }}>
              <Select
                block
                placeholder="Group by"
                label={groupingLabel}
                onSelect={(selection) => {
                  if (selection.action !== "selected") return;
                  const item = selection.item as (typeof BREAKDOWN_OPTIONS)[number];
                  setGroupBy(item.id);
                }}
              >
                {BREAKDOWN_OPTIONS.map((option) => (
                  <Select.Option key={option.id} value={option} selected={groupBy === option.id}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      }
      contentStyle={{ paddingTop: 12 }}
    >
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 10 }}>
        {groupedSeries.map((entry) => (
          <span key={entry.groupLabel} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span
              aria-hidden
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: groupColors[entry.groupLabel],
                flexShrink: 0,
              }}
            />
            <Typography intent="small" style={{ color: "var(--color-text-secondary)" }}>
              {entry.groupLabel}
            </Typography>
          </span>
        ))}
      </div>

      <div style={{ display: "flex", minHeight: 250, gap: 10 }}>
        <div style={{ width: 62, display: "flex", flexDirection: "column", justifyContent: "space-between", paddingBottom: 34 }}>
          {[...yTicks].reverse().map((tick) => (
            <Typography
              key={`tick-${tick}`}
              intent="small"
              style={{ color: "var(--color-text-secondary)", fontVariantNumeric: "tabular-nums" }}
            >
              {formatAxisUsdCompact(tick)}
            </Typography>
          ))}
        </div>
        <div style={{ flex: 1, position: "relative", paddingBottom: 34 }}>
          <div style={{ position: "absolute", inset: "0 0 34px 0", display: "flex", flexDirection: "column", justifyContent: "space-between", pointerEvents: "none" }}>
            {yTicks.slice(1).map((tick) => (
              <div key={`grid-${tick}`} style={{ borderTop: "1px dashed var(--color-border-separator)" }} />
            ))}
          </div>
          {chartTab === "bar" ? (
            <div style={{ position: "absolute", inset: "0 0 34px 0", display: "flex", alignItems: "flex-end", justifyContent: "space-around", gap: 20 }}>
              {periodLabels.map((period, periodIdx) => (
                (() => {
                  const visibleSegments = groupedSeries
                    .map((entry) => {
                      const amount = entry.periods[periodIdx]?.planned ?? 0;
                      const pct = axisCap > 0 ? (amount / axisCap) * 100 : 0;
                      return { entry, amount, pct };
                    })
                    .filter((segment) => segment.amount > 0);

                  return (
                    <div
                      key={`bar-col-${period}-${periodIdx}`}
                      style={{
                        width: 16,
                        minWidth: 16,
                        maxWidth: 16,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        gap: 1,
                        height: "100%",
                      }}
                    >
                      {visibleSegments.map((segment, segmentIdx) => (
                        <Tooltip
                          key={`${segment.entry.groupLabel}-${period}-${periodIdx}`}
                          trigger={["hover", "focus"]}
                          placement="top"
                          overlay={
                            <Tooltip.Content>
                              {segment.entry.groupLabel}: {formatAxisUsdCompact(segment.amount)}
                            </Tooltip.Content>
                          }
                        >
                          <div
                            style={{
                              width: 16,
                              minWidth: 16,
                              maxWidth: 16,
                              height: `${segment.pct}%`,
                              minHeight: 2,
                              background: groupColors[segment.entry.groupLabel],
                              borderRadius: segmentIdx === 0 ? "4px 4px 0 0" : 0,
                              border: "1px solid rgba(255,255,255,0.35)",
                            }}
                          />
                        </Tooltip>
                      ))}
                    </div>
                  );
                })()
              ))}
            </div>
          ) : (
            <div style={{ position: "absolute", inset: "0 0 34px 0" }}>
              <svg
                ref={lineSvgRef}
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                style={{ display: "block" }}
                aria-label="Planned cost by region line chart"
              >
                {lineSeries.map((series) => (
                  <path
                    key={`line-${series.groupLabel}`}
                    d={linePath(series.points)}
                    fill="none"
                    stroke={groupColors[series.groupLabel]}
                    strokeWidth={1.5}
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}
                {lineSeries.flatMap((series) =>
                  series.points.map((p, idx) => (
                    <g key={`line-point-${series.groupLabel}-${idx}`}>
                      <ellipse
                        cx={p.x}
                        cy={p.y}
                        rx={Math.max(2.2, lineMarkerRadiusX * 8)}
                        ry={Math.max(2.2, lineMarkerRadiusY * 2)}
                        fill="transparent"
                        style={{ pointerEvents: "all" }}
                        tabIndex={0}
                      >
                        <title>{`${series.groupLabel}: ${formatAxisUsdCompact(p.amount)}`}</title>
                      </ellipse>
                      <ellipse
                        cx={p.x}
                        cy={p.y}
                        rx={lineMarkerRadiusX}
                        ry={lineMarkerRadiusY}
                        fill={groupColors[series.groupLabel]}
                        tabIndex={0}
                      >
                        <title>{`${series.groupLabel}: ${formatAxisUsdCompact(p.amount)}`}</title>
                      </ellipse>
                    </g>
                  ))
                )}
              </svg>
            </div>
          )}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, display: "flex", justifyContent: "space-around", gap: 20, borderTop: "1px solid var(--color-border-separator)", paddingTop: 8 }}>
            {periodLabels.map((period, idx) => (
              <Typography key={`x-${period}-${idx}`} intent="small" style={{ color: "var(--color-text-secondary)" }}>
                {period}
              </Typography>
            ))}
          </div>
        </div>
      </div>
    </HubCardFrame>
  );
}
