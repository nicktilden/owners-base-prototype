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
import { filterCapitalPlanningRowsByProjectIds } from "@/components/tools/capitalPlanning/capitalPlanningHubChartData";

const FUNDING_SOURCES = [
  "GO Bond Series 2024",
  "Federal Infrastructure Grant",
  "State Transportation Grant",
  "Operating Capital Reserve",
  "Rainy Day Reserve",
] as const;

const SOURCE_COLORS = ["#0891d1", "#0d9488", "#d97706", "#2f9e44", "#ef4444"] as const;

type FundingSource = (typeof FUNDING_SOURCES)[number];

type Link = {
  source: FundingSource;
  region: CapitalPlanningRegion;
  value: number;
};

type Node = {
  id: string;
  label: string;
  value: number;
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

type StackPos = { y0: number; y1: number };

export default function CapitalPlanningProjectFundingFlowHubCard(): React.ReactElement {
  const { filteredSeedProjects } = useHubFilters();
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const flow = useMemo(() => {
    const allowed = new Set(filteredSeedProjects.map((p) => p.id));
    const filteredRows = filterCapitalPlanningRowsByProjectIds(SAMPLE_PROJECT_ROWS, allowed);
    const sourceRows = filteredRows.length > 0 ? filteredRows : SAMPLE_PROJECT_ROWS;

    const linkMap = new Map<string, Link>();
    const sourceTotals = new Map<FundingSource, number>();
    const regionTotals = new Map<CapitalPlanningRegion, number>();

    for (const row of sourceRows) {
      const region = assignedCapitalPlanningRegion(row.id);
      const sources = fundingSourcesForRow(row.id);
      const amount = Number.isFinite(row.plannedAmount) && row.plannedAmount > 0 ? row.plannedAmount : 12_000_000;
      const share = amount / Math.max(1, sources.length);

      for (const source of sources) {
        const key = `${source}__${region}`;
        const existing = linkMap.get(key);
        if (existing) existing.value += share;
        else linkMap.set(key, { source, region, value: share });
        sourceTotals.set(source, (sourceTotals.get(source) ?? 0) + share);
        regionTotals.set(region, (regionTotals.get(region) ?? 0) + share);
      }
    }

    const leftNodes: Node[] = [...FUNDING_SOURCES].map((s) => ({
      id: s,
      label: s,
      value: sourceTotals.get(s) ?? 0,
    }));
    const rightNodes: Node[] = CAPITAL_PLANNING_REGIONS.map((region) => ({
      id: region,
      label: region,
      value: regionTotals.get(region) ?? 0,
    }));

    const links = Array.from(linkMap.values()).filter((l) => l.value > 0);
    return { links, leftNodes, rightNodes };
  }, [filteredSeedProjects]);

  const totalFlow = useMemo(() => flow.links.reduce((sum, l) => sum + l.value, 0) || 1, [flow.links]);

  const { leftStack, rightStack, ribbons } = useMemo(() => {
    const topPad = 2;
    const bottomPad = 2;
    const gap = 1.2;
    const innerHeight = 100 - topPad - bottomPad;
    const leftScale = (innerHeight - Math.max(0, flow.leftNodes.length - 1) * gap) / totalFlow;
    const rightScale = (innerHeight - Math.max(0, flow.rightNodes.length - 1) * gap) / totalFlow;

    const leftPos = new Map<string, StackPos>();
    const rightPos = new Map<string, StackPos>();
    const leftCursor = new Map<string, number>();
    const rightCursor = new Map<string, number>();

    let ly = topPad;
    for (const n of flow.leftNodes) {
      const h = Math.max(0.8, n.value * leftScale);
      leftPos.set(n.id, { y0: ly, y1: ly + h });
      leftCursor.set(n.id, ly);
      ly += h + gap;
    }
    let ry = topPad;
    for (const n of flow.rightNodes) {
      const h = Math.max(0.8, n.value * rightScale);
      rightPos.set(n.id, { y0: ry, y1: ry + h });
      rightCursor.set(n.id, ry);
      ry += h + gap;
    }

    const built = flow.links.map((link) => {
      const thickness = Math.max(0.75, link.value * leftScale);
      const l0 = leftCursor.get(link.source) ?? 0;
        const r0 = rightCursor.get(link.region) ?? 0;
      const l1 = l0 + thickness;
      const r1 = r0 + thickness;
      leftCursor.set(link.source, l1);
        rightCursor.set(link.region, r1);
      return { ...link, y0: l0, y0b: l1, y1: r0, y1b: r1 };
    });
    return { leftStack: leftPos, rightStack: rightPos, ribbons: built };
  }, [flow.leftNodes, flow.rightNodes, flow.links, totalFlow]);

  const sourceColorById = useMemo(
    () => Object.fromEntries(FUNDING_SOURCES.map((s, i) => [s, SOURCE_COLORS[i % SOURCE_COLORS.length]])) as Record<FundingSource, string>,
    []
  );

  return (
    <HubCardFrame
      title="Funding Allocation by Region"
      infoTooltip="Ribbon width represents committed capital from each funding source to each region."
      style={{ minHeight: 380, maxHeight: 620 }}
      actions={
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          <Button type="button" variant="tertiary" className="b_tertiary" size="sm" icon={<Fullscreen size="sm" />} aria-label="Full screen" onClick={() => {}} />
          <Dropdown variant="tertiary" className="b_tertiary" size="sm" icon={<EllipsisVertical size="sm" />} aria-label="Project funding flow card menu" placement="bottom-right">
            <Dropdown.Item item="export">Export</Dropdown.Item>
            <Dropdown.Item item="refresh">Refresh</Dropdown.Item>
          </Dropdown>
        </div>
      }
      contentStyle={{ paddingTop: 10 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 8 }}>
        {FUNDING_SOURCES.map((source) => (
          <span key={`legend-${source}`} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span
              aria-hidden
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: sourceColorById[source],
                flexShrink: 0,
              }}
            />
            <Typography intent="small" style={{ color: "var(--color-text-secondary)" }}>
              {source}
            </Typography>
          </span>
        ))}
      </div>
      <div style={{ position: "relative", minHeight: 420 }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: 420, display: "block" }}>
          {flow.leftNodes.map((node) => {
            const pos = leftStack.get(node.id);
            if (!pos) return null;
            const source = node.id as FundingSource;
            return (
              <g key={`left-${node.id}`}>
                <rect x={1.5} y={pos.y0} width={1.6} height={pos.y1 - pos.y0} fill={sourceColorById[source]} />
              </g>
            );
          })}

          {flow.rightNodes.map((node) => {
            const pos = rightStack.get(node.id);
            if (!pos) return null;
            return (
              <g key={`right-${node.id}`}>
                <rect x={82} y={pos.y0} width={1.6} height={pos.y1 - pos.y0} fill="#6b7280" />
              </g>
            );
          })}

          {ribbons.map((link, idx) => {
            const key = `${link.source}__${link.region}`;
            const highlighted = hoveredKey === null || hoveredKey === key;
            const x0 = 3.2;
            const x1 = 82;
            const c1 = 34;
            const c2 = 66;
            const d = [
              `M ${x0} ${link.y0}`,
              `C ${c1} ${link.y0}, ${c2} ${link.y1}, ${x1} ${link.y1}`,
              `L ${x1} ${link.y1b}`,
              `C ${c2} ${link.y1b}, ${c1} ${link.y0b}, ${x0} ${link.y0b}`,
              "Z",
            ].join(" ");
            return (
              <Tooltip
                key={`r-${key}-${idx}`}
                trigger={["hover", "focus"]}
                placement="top"
                overlay={
                  <Tooltip.Content>
                    <span>{`${link.source} -> ${link.region}: ${formatUsdShort(link.value)} allocated`}</span>
                  </Tooltip.Content>
                }
              >
                <path
                  d={d}
                  tabIndex={0}
                  fill={sourceColorById[link.source]}
                  fillOpacity={highlighted ? 0.5 : 0.14}
                  stroke="none"
                  onMouseEnter={() => setHoveredKey(key)}
                  onMouseLeave={() => setHoveredKey(null)}
                />
              </Tooltip>
            );
          })}
        </svg>
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            height: "100%",
            width: 210,
            pointerEvents: "none",
          }}
        >
          {flow.rightNodes.map((node) => {
            const pos = rightStack.get(node.id);
            if (!pos) return null;
            const centerPercent = (pos.y0 + pos.y1) / 2;
            return (
              <div
                key={`label-${node.id}`}
                style={{
                  position: "absolute",
                  left: 26,
                  top: `${centerPercent}%`,
                  transform: "translateY(-50%)",
                  whiteSpace: "nowrap",
                }}
              >
                <Typography intent="small" weight="semibold" style={{ color: "var(--color-text-primary)" }}>
                  {node.label}
                </Typography>
                <Typography intent="small" as="div" style={{ color: "var(--color-text-secondary)" }}>
                  {formatUsdShort(node.value)}
                </Typography>
              </div>
            );
          })}
        </div>
      </div>
    </HubCardFrame>
  );
}
