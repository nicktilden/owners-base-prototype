import React, { useMemo, useState } from "react";
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
import {
  filterCapitalPlanningRowsByProjectIds,
} from "@/components/tools/capitalPlanning/capitalPlanningHubChartData";

const FUNDING_SOURCES = [
  "National Science Foundation",
  "Department of Energy",
  "Private Venture Capital",
  "Corporate Sponsorship",
  "University Endowment",
  "Regional Infrastructure Bond",
] as const;

type FundingSource = (typeof FUNDING_SOURCES)[number];

type FlowLink = {
  region: CapitalPlanningRegion;
  source: FundingSource;
  value: number;
};

type Node = {
  id: string;
  label: string;
  value: number;
};

const NODE_ROW_HEIGHT = 38;
const NODE_ROW_GAP = 8;
const COLUMN_HEADER_HEIGHT = 22;
const COLUMN_HEADER_MARGIN_BOTTOM = 8;

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
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  return `$${Math.round(n / 1_000_000)}M`;
}

export default function CapitalPlanningRegionFundingFlowHubCard(): React.ReactElement {
  const { filteredSeedProjects } = useHubFilters();
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const flow = useMemo(() => {
    const allowed = new Set(filteredSeedProjects.map((p) => p.id));
    const filteredRows = filterCapitalPlanningRowsByProjectIds(SAMPLE_PROJECT_ROWS, allowed);
    const sourceRows = filteredRows.length > 0 ? filteredRows : SAMPLE_PROJECT_ROWS;

    const linkMap = new Map<string, FlowLink>();
    for (const row of sourceRows) {
      const region = assignedCapitalPlanningRegion(row.id);
      const sources = fundingSourcesForRow(row.id);
      const base = Number.isFinite(row.plannedAmount) && row.plannedAmount > 0 ? row.plannedAmount : 12_000_000;
      const share = base / Math.max(1, sources.length);
      for (const source of sources) {
        const key = `${region}__${source}`;
        const existing = linkMap.get(key);
        if (existing) existing.value += share;
        else linkMap.set(key, { region, source, value: share });
      }
    }

    const links = Array.from(linkMap.values()).filter((l) => l.value > 0);
    const regionValues = new Map<CapitalPlanningRegion, number>();
    const sourceValues = new Map<FundingSource, number>();
    for (const link of links) {
      regionValues.set(link.region, (regionValues.get(link.region) ?? 0) + link.value);
      sourceValues.set(link.source, (sourceValues.get(link.source) ?? 0) + link.value);
    }

    const leftNodes: Node[] = CAPITAL_PLANNING_REGIONS.map((region) => ({
      id: region,
      label: region,
      value: regionValues.get(region) ?? 0,
    }));
    const rightNodes: Node[] = [...FUNDING_SOURCES]
      .map((source) => ({ id: source, label: source, value: sourceValues.get(source) ?? 0 }))
      .sort((a, b) => b.value - a.value);

    return { links, leftNodes, rightNodes };
  }, [filteredSeedProjects]);

  const maxLink = useMemo(
    () => flow.links.reduce((max, l) => Math.max(max, l.value), 0) || 1,
    [flow.links]
  );
  const rowCount = Math.max(flow.leftNodes.length, flow.rightNodes.length);
  const flowAreaHeightPx = rowCount * NODE_ROW_HEIGHT + Math.max(0, rowCount - 1) * NODE_ROW_GAP;
  const flowTopOffsetPx = COLUMN_HEADER_HEIGHT + COLUMN_HEADER_MARGIN_BOTTOM;
  const centerYPxForIndex = (idx: number) => idx * (NODE_ROW_HEIGHT + NODE_ROW_GAP) + NODE_ROW_HEIGHT / 2;

  return (
    <HubCardFrame
      title="Region to Funding Source Flow"
      infoTooltip="Shows how forecasted capital is distributed from regions across multiple funding sources."
      style={{ minHeight: 320, maxHeight: 460 }}
      actions={
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          <Button type="button" variant="tertiary" className="b_tertiary" size="sm" icon={<Fullscreen size="sm" />} aria-label="Full screen" onClick={() => {}} />
          <Dropdown
            variant="tertiary"
            className="b_tertiary"
            size="sm"
            icon={<EllipsisVertical size="sm" />}
            aria-label="Region funding flow card menu"
            placement="bottom-right"
          >
            <Dropdown.Item item="export">Export</Dropdown.Item>
            <Dropdown.Item item="refresh">Refresh</Dropdown.Item>
          </Dropdown>
        </div>
      }
      contentStyle={{ paddingTop: 10 }}
    >
      <div style={{ position: "relative", display: "grid", gridTemplateColumns: "280px minmax(220px, 1fr) 280px", gap: 12, minHeight: 300 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Typography intent="small" weight="semibold" style={{ color: "var(--color-text-secondary)", height: COLUMN_HEADER_HEIGHT }}>
            Regions
          </Typography>
          {flow.leftNodes.map((node) => (
            <div
              key={node.id}
              style={{
                height: NODE_ROW_HEIGHT,
                border: "1px solid var(--color-border-separator)",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 10px",
                background: "var(--color-surface-primary)",
              }}
            >
              <Typography intent="small" weight="semibold" style={{ color: "var(--color-text-primary)" }}>
                {node.label}
              </Typography>
              <Typography intent="small" style={{ color: "var(--color-text-secondary)" }}>
                {formatUsdShort(node.value)}
              </Typography>
            </div>
          ))}
        </div>

        <div style={{ position: "relative", minHeight: 300 }}>
          <svg
            viewBox={`0 0 100 ${flowAreaHeightPx}`}
            preserveAspectRatio="none"
            style={{
              position: "absolute",
              left: 0,
              top: flowTopOffsetPx,
              width: "100%",
              height: flowAreaHeightPx,
              display: "block",
            }}
          >
            {flow.links.map((link, idx) => {
              const leftIdx = flow.leftNodes.findIndex((n) => n.id === link.region);
              const rightIdx = flow.rightNodes.findIndex((n) => n.id === link.source);
              if (leftIdx < 0 || rightIdx < 0) return null;
              const leftY = centerYPxForIndex(leftIdx);
              const rightY = centerYPxForIndex(rightIdx);
              const width = 1 + (link.value / maxLink) * 7;
              const thickness = Math.max(1.8, width * 1.6);
              const leftYBottom = leftY + thickness;
              const rightYBottom = rightY + thickness;
              const key = `${link.region}__${link.source}`;
              const highlighted = hoveredKey === null || hoveredKey === key;
              const ribbonPath = [
                `M 0 ${leftY}`,
                `C 30 ${leftY}, 70 ${rightY}, 100 ${rightY}`,
                `L 100 ${rightYBottom}`,
                `C 70 ${rightYBottom}, 30 ${leftYBottom}, 0 ${leftYBottom}`,
                "Z",
              ].join(" ");
              return (
                <g key={`${key}-${idx}`}>
                  <Tooltip
                    trigger={["hover", "focus"]}
                    placement="top"
                    overlay={
                      <Tooltip.Content>
                        <span>{`${link.source} -> ${link.region}: ${formatUsdShort(link.value)} allocated`}</span>
                      </Tooltip.Content>
                    }
                  >
                    <path
                      d={ribbonPath}
                      fill="var(--color-icon-tinted)"
                      fillOpacity={highlighted ? 0.35 : 0.1}
                      stroke="none"
                      tabIndex={0}
                      onMouseEnter={() => setHoveredKey(key)}
                      onMouseLeave={() => setHoveredKey(null)}
                    />
                  </Tooltip>
                  <circle cx={100} cy={rightY + thickness / 2} r={highlighted ? 1.6 : 1.2} fill="var(--color-icon-tinted)" fillOpacity={highlighted ? 0.85 : 0.25} />
                </g>
              );
            })}
          </svg>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Typography intent="small" weight="semibold" style={{ color: "var(--color-text-secondary)", height: COLUMN_HEADER_HEIGHT }}>
            Funding Sources
          </Typography>
          {flow.rightNodes.map((node) => (
            <Tooltip
              key={node.id}
              trigger={["hover", "focus"]}
              placement="left"
              overlay={
                <Tooltip.Content>
                  <span>
                    {node.label}: {formatUsdShort(node.value)}
                  </span>
                </Tooltip.Content>
              }
            >
              <div
                tabIndex={0}
                style={{
                  height: NODE_ROW_HEIGHT,
                  border: "1px solid var(--color-border-separator)",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 10px",
                  background: "var(--color-surface-primary)",
                }}
              >
                <Typography
                  intent="small"
                  weight="semibold"
                  style={{ color: "var(--color-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                >
                  {node.label}
                </Typography>
                <Typography intent="small" style={{ color: "var(--color-text-secondary)", marginLeft: 8 }}>
                  {formatUsdShort(node.value)}
                </Typography>
              </div>
            </Tooltip>
          ))}
        </div>
      </div>
    </HubCardFrame>
  );
}
