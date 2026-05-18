import React, { useMemo } from "react";
import { Button, Dropdown, Tooltip, Typography } from "@procore/core-react";
import { EllipsisVertical, Fullscreen } from "@procore/core-icons";
import HubCardFrame from "@/components/hubs/HubCardFrame";
import { useHubFilters } from "@/context/HubFilterContext";
import {
  SAMPLE_PROJECT_ROWS,
  CAPITAL_PLANNING_REGIONS,
  assignedCapitalPlanningRegion,
  type CapitalPlanningRegion,
} from "@/components/tools/capitalPlanning/capitalPlanningData";
import { filterCapitalPlanningRowsByProjectIds } from "@/components/tools/capitalPlanning/capitalPlanningHubChartData";

const FUNDING_SOURCES = [
  "GO Bond Series 2024",
  "Federal Infrastructure Grant",
  "State Transportation Grant",
  "Operating Capital Reserve",
  "Rainy Day Reserve",
] as const;

type FundingSource = (typeof FUNDING_SOURCES)[number];

const REGION_COLORS: Record<CapitalPlanningRegion, string> = {
  "Pacific Northwest": "#0284c7",
  "Mountain West": "#0d9488",
  Southwest: "#ca8a04",
  "Central Plains": "#16a34a",
  "Mid-Atlantic": "#ef4444",
  Southeast: "#2563eb",
};

function hashText(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = Math.imul(31, h) + input.charCodeAt(i);
  return Math.abs(h);
}

function fundingSourcesForRow(rowId: string): FundingSource[] {
  const h = hashText(rowId);
  const count = 1 + (h % 3);
  const out: FundingSource[] = [];
  for (let i = 0; i < count; i++) {
    const source = FUNDING_SOURCES[(h + i * 2) % FUNDING_SOURCES.length]!;
    if (!out.includes(source)) out.push(source);
  }
  return out;
}

function formatUsdShort(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "$0";
  return `$${(n / 1_000_000).toFixed(0)}M`;
}

export default function CapitalPlanningFundingAllocationByRegionHubCard(): React.ReactElement {
  const { filteredSeedProjects } = useHubFilters();

  const data = useMemo(() => {
    const allowed = new Set(filteredSeedProjects.map((p) => p.id));
    const filteredRows = filterCapitalPlanningRowsByProjectIds(SAMPLE_PROJECT_ROWS, allowed);
    const sourceRows = filteredRows.length > 0 ? filteredRows : SAMPLE_PROJECT_ROWS;

    const sourceTotals = new Map<FundingSource, number>();
    const bySourceRegion = new Map<FundingSource, Map<CapitalPlanningRegion, number>>();

    for (const row of sourceRows) {
      const region = assignedCapitalPlanningRegion(row.id);
      const sources = fundingSourcesForRow(row.id);
      const planned = Number.isFinite(row.plannedAmount) && row.plannedAmount > 0 ? row.plannedAmount : 10_000_000;
      const share = planned / Math.max(1, sources.length);

      for (const source of sources) {
        sourceTotals.set(source, (sourceTotals.get(source) ?? 0) + share);
        if (!bySourceRegion.has(source)) bySourceRegion.set(source, new Map<CapitalPlanningRegion, number>());
        const regionMap = bySourceRegion.get(source)!;
        regionMap.set(region, (regionMap.get(region) ?? 0) + share);
      }
    }

    const totalCommitted = Array.from(sourceTotals.values()).reduce((sum, v) => sum + v, 0) || 1;

    const columns = FUNDING_SOURCES.map((source) => {
      const total = sourceTotals.get(source) ?? 0;
      const regionMap = bySourceRegion.get(source) ?? new Map<CapitalPlanningRegion, number>();
      const segments = CAPITAL_PLANNING_REGIONS
        .map((region) => ({ region, value: regionMap.get(region) ?? 0 }))
        .filter((s) => s.value > 0)
        .sort((a, b) => b.value - a.value);
      return {
        source,
        total,
        widthPct: (total / totalCommitted) * 100,
        segments,
      };
    }).filter((c) => c.total > 0);

    return { columns, totalCommitted };
  }, [filteredSeedProjects]);

  return (
    <HubCardFrame
      title="Funding Allocation by Source & Region"
      infoTooltip="Column width = total committed per funding source. Segment height = share allocated to each region."
      style={{ minHeight: 320, maxHeight: 520 }}
      actions={
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          <Button type="button" variant="tertiary" className="b_tertiary" size="sm" icon={<Fullscreen size="sm" />} aria-label="Full screen" onClick={() => {}} />
          <Dropdown variant="tertiary" className="b_tertiary" size="sm" icon={<EllipsisVertical size="sm" />} aria-label="Funding allocation card menu" placement="bottom-right">
            <Dropdown.Item item="export">Export</Dropdown.Item>
            <Dropdown.Item item="refresh">Refresh</Dropdown.Item>
          </Dropdown>
        </div>
      }
      contentStyle={{ paddingTop: 12 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        {CAPITAL_PLANNING_REGIONS.map((region) => (
          <span key={`legend-${region}`} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span aria-hidden style={{ width: 9, height: 9, borderRadius: "50%", background: REGION_COLORS[region], flexShrink: 0 }} />
            <Typography intent="small" style={{ color: "var(--color-text-secondary)" }}>
              {region}
            </Typography>
          </span>
        ))}
      </div>

      <Typography intent="small" style={{ color: "var(--color-text-secondary)", marginBottom: 8 }}>
        Total committed: {formatUsdShort(data.totalCommitted)}
      </Typography>

      <div style={{ border: "1px solid var(--color-border-separator)", borderRadius: 8, overflow: "hidden", background: "var(--color-surface-primary)" }}>
        <div style={{ display: "flex", alignItems: "stretch", minHeight: 280 }}>
          {data.columns.map((col) => (
            <div
              key={`col-${col.source}`}
              style={{
                width: `${col.widthPct}%`,
                minWidth: 72,
                borderRight: "1px solid rgba(255,255,255,0.35)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {col.segments.map((seg) => {
                  const pct = (seg.value / col.total) * 100;
                  return (
                    <Tooltip
                      key={`${col.source}-${seg.region}`}
                      trigger={["hover", "focus"]}
                      placement="top"
                      overlay={
                        <Tooltip.Content>
                          <span>
                            {`${col.source} -> ${seg.region}: ${formatUsdShort(seg.value)}`}
                          </span>
                        </Tooltip.Content>
                      }
                    >
                      <div
                        tabIndex={0}
                        style={{
                          height: `${pct}%`,
                          minHeight: 16,
                          background: REGION_COLORS[seg.region],
                          borderBottom: "1px solid rgba(255,255,255,0.25)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "0 6px",
                        }}
                      >
                        {pct >= 16 ? (
                          <Typography
                            intent="small"
                            weight="semibold"
                            style={{
                              color: "var(--color-text-reversed)",
                              textShadow: "0 1px 2px rgba(0,0,0,0.35)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {formatUsdShort(seg.value)}
                          </Typography>
                        ) : null}
                      </div>
                    </Tooltip>
                  );
                })}
              </div>
              <div
                style={{
                  borderTop: "1px solid var(--color-border-separator)",
                  padding: "8px 6px 9px",
                  textAlign: "center",
                  background: "var(--color-surface-primary)",
                }}
              >
                <Typography intent="small" weight="semibold" style={{ color: "var(--color-text-primary)" }}>
                  {col.source}
                </Typography>
                <Typography intent="small" style={{ color: "var(--color-text-secondary)" }}>
                  {formatUsdShort(col.total)}
                </Typography>
              </div>
            </div>
          ))}
        </div>
      </div>
    </HubCardFrame>
  );
}
