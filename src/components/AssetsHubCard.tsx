import React, { useMemo, useState } from "react";
import { Button, Pill, Tearsheet, Typography, colors } from "@procore/core-react";
import { Copilot, ExternalLink } from "@procore/core-icons";
import HubCardFrame from "@/components/hubs/HubCardFrame";
import { useData } from "@/context/DataContext";
import { useAiPanel } from "@/context/AiPanelContext";
import { useRouter } from "next/router";
import type { Asset, AssetStatus, AssetTrade } from "@/types/assets";

// ─── Lifecycle stages ─────────────────────────────────────────────────────────

type LifecycleStage = "Ordered" | "Delivered" | "Installed" | "Commissioned" | "Turned Over";

const LIFECYCLE_STAGES: LifecycleStage[] = ["Ordered", "Delivered", "Installed", "Commissioned", "Turned Over"];
const KPI_STAGES: LifecycleStage[] = ["Ordered", "Delivered", "Installed", "Turned Over"];

const STATUS_TO_STAGE: Record<AssetStatus, LifecycleStage> = {
  ordered:     "Ordered",
  delivered:   "Delivered",
  installed:   "Installed",
  commissioned:"Commissioned",
  turned_over: "Turned Over",
};

function toLifecycle(status: AssetStatus): LifecycleStage {
  return STATUS_TO_STAGE[status];
}

const STAGE_DOT: Record<LifecycleStage, string> = {
  Ordered:      "#9e9e9e",
  Delivered:    "#5c8de8",
  Installed:    "#1d5cc9",
  Commissioned: "#00a878",
  "Turned Over":"#4a6572",
};

const TRADE_LABELS: Record<AssetTrade, string> = {
  hvac:        "HVAC",
  electrical:  "Electrical",
  mechanical:  "Mechanical",
  plumbing:    "Plumbing",
  civil:       "Civil",
  structural:  "Structural",
  general:     "General",
  other:       "Other",
};

const STATUS_LABELS: Record<AssetStatus, string> = {
  ordered:     "Ordered",
  delivered:   "Delivered",
  installed:   "Installed",
  commissioned:"Commissioned",
  turned_over: "Turned Over",
};

const STATUS_PILL_COLOR: Record<AssetStatus, "green" | "gray" | "yellow" | "red"> = {
  ordered:     "gray",
  delivered:   "yellow",
  installed:   "green",
  commissioned:"green",
  turned_over: "gray",
};

const STAGE_BAR_COLORS: Record<LifecycleStage, string> = {
  Ordered:      "#bdbdbd",
  Delivered:    "#5c8de8",
  Installed:    "#1d5cc9",
  Commissioned: "#00a878",
  "Turned Over":"#4a6572",
};

// ─── Tearsheet ────────────────────────────────────────────────────────────────

type TearsheetAsset = {
  id: string;
  name: string;
  assetCode: string;
  projectId: string;
  status: AssetStatus;
  trade: AssetTrade;
};

interface AssetGroupTearsheetProps {
  open: boolean;
  onClose: () => void;
  groupLabel: string;
  assets: TearsheetAsset[];
}

function AssetGroupTearsheet({ open, onClose, groupLabel, assets }: AssetGroupTearsheetProps) {
  const router = useRouter();
  return (
    <Tearsheet open={open} onClose={onClose} aria-label={`Assets: ${groupLabel}`} placement="right">
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--color-border-separator)", flexShrink: 0 }}>
          <Typography intent="h2" style={{ fontWeight: 700, color: "var(--color-text-primary)" }}>
            {groupLabel}
          </Typography>
          <Typography intent="small" style={{ color: "var(--color-text-secondary)", display: "block", marginTop: 4 }}>
            {assets.length} asset{assets.length !== 1 ? "s" : ""}
          </Typography>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
          {assets.length === 0 ? (
            <Typography intent="body" style={{ color: "var(--color-text-secondary)" }}>No assets in this group.</Typography>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0, border: "1px solid var(--color-border-separator)", borderRadius: 8, overflow: "hidden" }}>
              {assets.map((asset, idx) => (
                <div
                  key={asset.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 16px",
                    borderTop: idx > 0 ? "1px solid var(--color-border-separator)" : "none",
                    background: "var(--color-surface-primary)",
                    cursor: "pointer",
                  }}
                  onClick={() => router.push("/portfolio/assets")}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--color-surface-primary)")}
                >
                  <div style={{ minWidth: 0 }}>
                    <Typography intent="body" style={{ fontWeight: 600, color: "var(--color-text-link)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                      {asset.name}
                    </Typography>
                    <Typography intent="small" style={{ color: "var(--color-text-secondary)", display: "block" }}>
                      {asset.assetCode} · {TRADE_LABELS[asset.trade]}
                    </Typography>
                  </div>
                  <Pill color={STATUS_PILL_COLOR[asset.status]}>{STATUS_LABELS[asset.status]}</Pill>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Tearsheet>
  );
}

// ─── Main Card ────────────────────────────────────────────────────────────────

export function AssetsHubCard() {
  const { data } = useData();
  const assets = data.assets;
  const { openPanel: openAiPanel } = useAiPanel();

  const [selectedStage, setSelectedStage] = useState<LifecycleStage | null>(null);
  const [selectedTrade, setSelectedTrade] = useState<string | null>(null);

  const total = assets.length;

  const stageCounts = useMemo(() => {
    const counts: Record<LifecycleStage, number> = { Ordered: 0, Delivered: 0, Installed: 0, Commissioned: 0, "Turned Over": 0 };
    assets.forEach((a: Asset) => { counts[toLifecycle(a.status)]++; });
    return counts;
  }, [assets]);

  // Horizontal bar rows: trade × lifecycle stage breakdown
  const tradeRows = useMemo(() => {
    const map = new Map<string, Record<LifecycleStage, number>>();
    assets.forEach((a: Asset) => {
      const label = TRADE_LABELS[a.trade] ?? a.trade;
      if (!map.has(label)) map.set(label, { Ordered: 0, Delivered: 0, Installed: 0, Commissioned: 0, "Turned Over": 0 });
      map.get(label)![toLifecycle(a.status)]++;
    });
    return Array.from(map.entries())
      .map(([name, stages]) => ({ name, stages, total: Object.values(stages).reduce((s, v) => s + v, 0) }))
      .sort((a, b) => b.total - a.total);
  }, [assets]);

  const maxTradeTotal = Math.max(...tradeRows.map((r) => r.total), 1);

  const tearsheetAssets = useMemo((): TearsheetAsset[] => {
    let filtered = assets as Asset[];
    if (selectedStage) filtered = filtered.filter((a) => toLifecycle(a.status) === selectedStage);
    if (selectedTrade) filtered = filtered.filter((a) => (TRADE_LABELS[a.trade] ?? a.trade) === selectedTrade);
    return filtered.map((a) => ({
      id: a.id, name: a.name, assetCode: a.assetCode,
      projectId: a.projectId, status: a.status, trade: a.trade,
    }));
  }, [assets, selectedStage, selectedTrade]);

  const tearsheetLabel = selectedStage ?? selectedTrade ?? "";

  const kpiCellStyle = (hasBorderRight: boolean): React.CSSProperties => ({
    padding: "8px 16px",
    ...(hasBorderRight ? { borderRight: "1px solid var(--color-border-separator)" } : {}),
    cursor: "pointer",
    transition: "background 0.15s",
    userSelect: "none" as const,
  });

  return (
    <>
      <AssetGroupTearsheet
        open={selectedStage !== null || selectedTrade !== null}
        onClose={() => { setSelectedStage(null); setSelectedTrade(null); }}
        groupLabel={tearsheetLabel}
        assets={tearsheetAssets}
      />
      <HubCardFrame
        title="Assets by Trade"
        infoTooltip="Asset lifecycle distribution by trade across all projects. Click a stage or row to drill in."
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              variant="secondary"
              size="sm"
              icon={<Copilot size="sm" style={{ color: colors.orange50 }} />}
              onClick={() => {
                const tradeSummary = tradeRows
                  .map((r) => `${r.name}:${r.stages["Ordered"]}:${r.stages["Delivered"]}:${r.stages["Installed"]}:${r.stages["Commissioned"]}:${r.stages["Turned Over"]}`)
                  .join('|');
                openAiPanel({
                  itemName: 'Assets by Trade',
                  pills: [
                    { label: `${assets.length} assets`, color: 'blue' },
                    { label: `${stageCounts["Installed"]} installed`, color: 'green' },
                    { label: `${stageCounts["Ordered"]} ordered`, color: 'gray' },
                  ],
                  aiSummary: `${assets.length}|${tradeSummary}`,
                  cardType: 'assets',
                  userRoles: ['owner', 'owner_admin', 'project_manager'],
                });
              }}
              aria-label="Open AI assistant"
              style={{
                background: colors.orange98,
                border: `1px solid ${colors.orange50}`,
                borderRadius: 4,
                color: colors.gray15,
              }}
            >
              Summarize
            </Button>
            <Button
              className="b_tertiary"
              variant="tertiary"
              size="sm"
              icon={<ExternalLink size="sm" />}
              aria-label="Go to Assets tool"
            >
              View All
            </Button>
          </div>
        }
      >
        {/* ── KPI tiles ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", border: "1px solid var(--color-border-separator)", borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>
          {KPI_STAGES.map((stage, i) => {
            const count = stageCounts[stage];
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            const isLast = i === KPI_STAGES.length - 1;
            return (
              <div
                key={stage}
                style={kpiCellStyle(!isLast)}
                onClick={() => setSelectedStage(stage)}
                role="button"
                tabIndex={0}
                aria-label={`View ${stage} assets`}
                onKeyDown={(e) => e.key === "Enter" && setSelectedStage(stage)}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: STAGE_DOT[stage], flexShrink: 0, display: "inline-block" }} />
                  <Typography intent="small" style={{ fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: 0.4, fontSize: 11 }}>
                    {stage}
                  </Typography>
                </div>
                <div style={{ fontSize: 24, lineHeight: "28px", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 2 }}>
                  {count} <span style={{ fontSize: 13, fontWeight: 400, color: "var(--color-text-secondary)" }}>({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Horizontal stacked bar chart by trade ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tradeRows.map((row) => (
            <div key={row.name} style={{ display: "grid", gridTemplateColumns: "88px 1fr 36px", gap: 8, alignItems: "center" }}>
              <Typography
                intent="small"
                style={{ color: "var(--color-text-secondary)", textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "pointer" }}
                onClick={() => setSelectedTrade(row.name)}
                title={row.name}
              >
                {row.name}
              </Typography>
              <div
                style={{ display: "flex", height: 20, borderRadius: 4, overflow: "hidden", cursor: "pointer", background: "var(--color-surface-secondary)" }}
                onClick={() => setSelectedTrade(row.name)}
                role="button"
                tabIndex={0}
                aria-label={`${row.name}: ${row.total} assets`}
                onKeyDown={(e) => e.key === "Enter" && setSelectedTrade(row.name)}
              >
                <div style={{ display: "flex", width: `${(row.total / maxTradeTotal) * 100}%`, height: "100%" }}>
                  {LIFECYCLE_STAGES.map((stage) => {
                    const count = row.stages[stage];
                    if (count === 0) return null;
                    return (
                      <div
                        key={stage}
                        style={{ flex: count, background: STAGE_BAR_COLORS[stage], transition: "opacity 0.15s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                        title={`${stage}: ${count}`}
                      />
                    );
                  })}
                </div>
              </div>
              <Typography intent="small" style={{ color: "var(--color-text-secondary)", fontVariantNumeric: "tabular-nums", textAlign: "right" }}>
                {row.total}
              </Typography>
            </div>
          ))}
        </div>

        {/* ── Legend ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
          {LIFECYCLE_STAGES.map((stage) => (
            <span key={stage} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: STAGE_BAR_COLORS[stage], flexShrink: 0 }} />
              <Typography intent="small" style={{ color: "var(--color-text-secondary)", fontSize: 11 }}>{stage}</Typography>
            </span>
          ))}
        </div>
      </HubCardFrame>
    </>
  );
}
