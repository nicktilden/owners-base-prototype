import React, { useMemo } from "react";
import { Button, Dropdown, Tooltip, Typography } from "@procore/core-react";
import { EllipsisVertical, Fullscreen } from "@procore/core-icons";
import HubCardFrame from "@/components/hubs/HubCardFrame";
import { useHubFilters } from "@/context/HubFilterContext";
import {
  SAMPLE_PROJECT_ROWS,
  CAPITAL_PLANNING_REGIONS,
  assignedCapitalPlanningRegion,
  type CapitalPlanningSampleRow,
  type CapitalPlanningRegion,
} from "@/components/tools/capitalPlanning/capitalPlanningData";
import {
  buildCapitalPlanningHubChartSeries,
  filterCapitalPlanningRowsByProjectIds,
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

type TreemapNode = {
  region: CapitalPlanningRegion;
  value: number;
  pct: number;
};

type TreemapRect = TreemapNode & {
  x: number;
  y: number;
  width: number;
  height: number;
};

function formatUsdShort(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "$0";
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  return `$${Math.round(n / 1_000_000)}M`;
}

function buildTreemapRects(nodes: readonly TreemapNode[], x: number, y: number, w: number, h: number): TreemapRect[] {
  if (nodes.length === 0) return [];
  if (nodes.length === 1) {
    const n = nodes[0]!;
    return [{ ...n, x, y, width: w, height: h }];
  }

  const total = nodes.reduce((sum, n) => sum + n.value, 0) || 1;
  let running = 0;
  let splitIndex = 0;
  for (let i = 0; i < nodes.length; i++) {
    running += nodes[i]!.value;
    if (running >= total / 2) {
      splitIndex = i + 1;
      break;
    }
  }
  splitIndex = Math.min(Math.max(1, splitIndex), nodes.length - 1);

  const first = nodes.slice(0, splitIndex);
  const second = nodes.slice(splitIndex);
  const firstTotal = first.reduce((sum, n) => sum + n.value, 0);
  const firstRatio = firstTotal / total;

  if (w >= h) {
    const w1 = w * firstRatio;
    const left = buildTreemapRects(first, x, y, w1, h);
    const right = buildTreemapRects(second, x + w1, y, w - w1, h);
    return [...left, ...right];
  }

  const h1 = h * firstRatio;
  const top = buildTreemapRects(first, x, y, w, h1);
  const bottom = buildTreemapRects(second, x, y + h1, w, h - h1);
  return [...top, ...bottom];
}

export default function CapitalPlanningForecastTreemapHubCard(): React.ReactElement {
  const { filteredSeedProjects } = useHubFilters();
  const [fiscalYearStartMonth, setFiscalYearStartMonth] = React.useState(readCapitalPlanningFiscalYearStartMonth);

  React.useEffect(() => {
    const sync = () => setFiscalYearStartMonth(readCapitalPlanningFiscalYearStartMonth());
    window.addEventListener(CAPITAL_PLANNING_FISCAL_SETTINGS_CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CAPITAL_PLANNING_FISCAL_SETTINGS_CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const regionNodes = useMemo<TreemapNode[]>(() => {
    const allowed = new Set(filteredSeedProjects.map((p) => p.id));
    const filteredRows = filterCapitalPlanningRowsByProjectIds(SAMPLE_PROJECT_ROWS, allowed);
    const sourceRows = filteredRows.length > 0 ? filteredRows : SAMPLE_PROJECT_ROWS;
    const rowsByRegion = new Map<string, CapitalPlanningSampleRow[]>();

    sourceRows.forEach((row) => {
      const region = assignedCapitalPlanningRegion(row.id);
      if (!rowsByRegion.has(region)) rowsByRegion.set(region, []);
      rowsByRegion.get(region)!.push(row);
    });

    const base = CAPITAL_PLANNING_REGIONS.map((region) => {
      const regionRows = rowsByRegion.get(region) ?? [];
      const series = buildCapitalPlanningHubChartSeries(
        regionRows,
        "Years",
        new Date(),
        undefined,
        fiscalYearStartMonth
      );
      const value = series.reduce((sum, p) => sum + (p.planned ?? 0), 0);
      return { region, value };
    });

    const hasPositive = base.some((b) => b.value > 0);
    const seeded = hasPositive
      ? base
      : base.map((b, i) => ({
          ...b,
          value: 50_000_000 + i * 30_000_000,
        }));
    const total = seeded.reduce((sum, b) => sum + b.value, 0) || 1;
    return seeded
      .map((b) => ({
        region: b.region,
        value: b.value,
        pct: (b.value / total) * 100,
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredSeedProjects, fiscalYearStartMonth]);

  const rects = useMemo(() => buildTreemapRects(regionNodes, 0, 0, 100, 100), [regionNodes]);

  return (
    <HubCardFrame
      title="Forecasted Cost by Region"
      infoTooltip="Each block size represents the region's share of total forecasted cost."
      style={{ minHeight: 300, maxHeight: 420 }}
      actions={
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          <Button type="button" variant="tertiary" className="b_tertiary" size="sm" icon={<Fullscreen size="sm" />} aria-label="Full screen" onClick={() => {}} />
          <Dropdown
            variant="tertiary"
            className="b_tertiary"
            size="sm"
            icon={<EllipsisVertical size="sm" />}
            aria-label="Forecast treemap card menu"
            placement="bottom-right"
          >
            <Dropdown.Item item="export">Export</Dropdown.Item>
            <Dropdown.Item item="refresh">Refresh</Dropdown.Item>
          </Dropdown>
        </div>
      }
      contentStyle={{ paddingTop: 12 }}
    >
      <div style={{ position: "relative", height: 280, borderRadius: 6, overflow: "hidden", border: "1px solid var(--color-border-separator)" }}>
        {rects.map((rect) => (
          <Tooltip
            key={rect.region}
            trigger={["hover", "focus"]}
            placement="top"
            overlay={
              <Tooltip.Content>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span>{rect.region}</span>
                  <span>Forecasted: {formatUsdShort(rect.value)}</span>
                  <span>Share: {Math.round(rect.pct)}%</span>
                </div>
              </Tooltip.Content>
            }
          >
            <div
              tabIndex={0}
              style={{
                position: "absolute",
                left: `${rect.x}%`,
                top: `${rect.y}%`,
                width: `${rect.width}%`,
                height: `${rect.height}%`,
                background: REGION_COLORS[rect.region],
                border: "1px solid #fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "8px 10px",
              }}
            >
              <Typography
                intent="small"
                weight="semibold"
                style={{
                  color: "var(--color-text-reversed)",
                  textAlign: "center",
                  textShadow: "0 1px 2px rgba(0,0,0,0.45)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  width: "100%",
                }}
              >
                {rect.region} · {Math.round(rect.pct)}%
              </Typography>
            </div>
          </Tooltip>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
        <Typography intent="small" style={{ color: "var(--color-text-secondary)" }}>Region share of total forecast:</Typography>
        {regionNodes.map((node) => (
          <span key={`legend-${node.region}`} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span aria-hidden style={{ width: 10, height: 10, borderRadius: "50%", background: REGION_COLORS[node.region], flexShrink: 0 }} />
            <Typography intent="small" style={{ color: "var(--color-text-secondary)" }}>
              {node.region} ({Math.round(node.pct)}%)
            </Typography>
          </span>
        ))}
      </div>
    </HubCardFrame>
  );
}
