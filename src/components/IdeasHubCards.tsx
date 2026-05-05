/**
 * IDEAS HUB CARDS
 * Three hub cards for the "Ideas Hub" portfolio tab:
 *   1. IdeasScorecardCard   — 4 KPI tiles: total, pending review, approved, estimated value
 *   2. IdeaPipelineCard     — stage breakdown with item counts and value bars
 *   3. RecentIdeasCard      — scrollable list of recent ideas with status, score, and actions
 */

import React, { useState } from "react";
import styled from "styled-components";
import { Button, Pill, Tooltip, Typography } from "@procore/core-react";
import {
  ArrowRight,
  EllipsisVertical,
  Plus,
  LightBulb,
  ThumbUp,
  Calendar,
  CurrencyUSA,
  Building,
  People,
} from "@procore/core-icons";
import HubCardFrame from "@/components/hubs/HubCardFrame";
import { useHubLoading } from "@/context/HubLoadingContext";
import HubCardSkeleton from "@/components/skeletons/HubCardSkeleton";
import { SkeletonLine, SkeletonBlock } from "@/components/skeletons/SkeletonPrimitives";

// ─── Seed data ────────────────────────────────────────────────────────────────

type IdeaStatus = "new" | "in_review" | "approved" | "in_progress" | "on_hold" | "declined";
type IdeaCategory = "capital" | "operational" | "technology" | "sustainability" | "safety";

interface Idea {
  id: string;
  title: string;
  description: string;
  submittedBy: string;
  submittedAt: string;
  status: IdeaStatus;
  category: IdeaCategory;
  estimatedValue: number;
  votes: number;
  priority: "high" | "medium" | "low";
  project?: string;
}

const IDEAS: Idea[] = [
  { id: "idea-001", title: "Solar Canopy over North Parking Structure", description: "Install solar panel canopy over 800-space north parking structure to generate 1.2MW peak capacity.", submittedBy: "Derek Huang", submittedAt: "2025-01-15", status: "approved", category: "sustainability", estimatedValue: 4_200_000, votes: 47, priority: "high", project: "Main Campus Expansion" },
  { id: "idea-002", title: "Centralized IoT Building Monitoring", description: "Deploy unified IoT sensors across all active construction sites for real-time environmental and safety monitoring.", submittedBy: "Priya Nair", submittedAt: "2025-01-22", status: "in_progress", category: "technology", estimatedValue: 1_800_000, votes: 39, priority: "high" },
  { id: "idea-003", title: "Prefab Patient Room Modules", description: "Use modular prefabricated patient room units to reduce construction schedule by 14 weeks on the new inpatient tower.", submittedBy: "James Callahan", submittedAt: "2025-02-03", status: "in_review", category: "capital", estimatedValue: 6_500_000, votes: 34, priority: "high", project: "Inpatient Tower – Phase 2" },
  { id: "idea-004", title: "Drone-Based Site Inspection Program", description: "Replace bi-weekly manual inspections with weekly drone surveys generating 3D point clouds for progress tracking.", submittedBy: "Bridget O'Sullivan", submittedAt: "2025-02-10", status: "approved", category: "technology", estimatedValue: 320_000, votes: 28, priority: "medium" },
  { id: "idea-005", title: "Green Roof on Outpatient Pavilion", description: "Add 12,000 sq ft green roof to manage stormwater runoff and improve LEED rating from Silver to Gold.", submittedBy: "Rachel Kim", submittedAt: "2025-02-18", status: "in_review", category: "sustainability", estimatedValue: 780_000, votes: 22, priority: "medium", project: "Outpatient Pavilion Renovation" },
  { id: "idea-006", title: "Standardized Subcontractor Portal", description: "Build a unified digital portal for all subcontractors to submit daily reports, safety logs, and material deliveries.", submittedBy: "Carlos Mendez", submittedAt: "2025-03-01", status: "new", category: "operational", estimatedValue: 250_000, votes: 19, priority: "medium" },
  { id: "idea-007", title: "Workforce Safety AI Alerts", description: "Integrate computer vision with site cameras to detect PPE non-compliance and send real-time alerts to supers.", submittedBy: "Tyrone Jackson", submittedAt: "2025-03-08", status: "new", category: "safety", estimatedValue: 450_000, votes: 31, priority: "high" },
  { id: "idea-008", title: "Shared Equipment Rental Pool", description: "Create a shared equipment pool across 6 concurrent sites to reduce idle equipment costs by an estimated 18%.", submittedBy: "Anton Petrov", submittedAt: "2025-03-12", status: "in_review", category: "operational", estimatedValue: 1_100_000, votes: 15, priority: "medium" },
  { id: "idea-009", title: "Healing Garden Expansion", description: "Extend existing healing garden by 4,000 sq ft with shade structures and water features near the new ICU wing.", submittedBy: "Nina Patel", submittedAt: "2025-03-20", status: "on_hold", category: "capital", estimatedValue: 560_000, votes: 11, priority: "low", project: "ICU Expansion" },
  { id: "idea-010", title: "Rainwater Harvesting System", description: "Install cisterns on three campus buildings to capture and reuse rainwater for irrigation, targeting 40% reduction in water use.", submittedBy: "Rachel Kim", submittedAt: "2025-04-01", status: "new", category: "sustainability", estimatedValue: 290_000, votes: 8, priority: "low" },
  { id: "idea-011", title: "Phased Loading Dock Consolidation", description: "Consolidate five fragmented loading areas into a single managed receiving hub to reduce congestion and improve safety.", submittedBy: "Luis Herrera", submittedAt: "2025-04-05", status: "declined", category: "operational", estimatedValue: 940_000, votes: 6, priority: "low" },
  { id: "idea-012", title: "EV Charging Infrastructure Expansion", description: "Add 120 Level-2 EV charging stations across three campus parking structures to support fleet electrification goals.", submittedBy: "Derek Huang", submittedAt: "2025-04-10", status: "new", category: "sustainability", estimatedValue: 2_100_000, votes: 26, priority: "high" },
];

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_LABEL: Record<IdeaStatus, string> = {
  new: "New",
  in_review: "In Review",
  approved: "Approved",
  in_progress: "In Progress",
  on_hold: "On Hold",
  declined: "Declined",
};

const STATUS_COLOR: Record<IdeaStatus, React.ComponentProps<typeof Pill>["color"]> = {
  new: "blue",
  in_review: "yellow",
  approved: "green",
  in_progress: "green",
  on_hold: "gray",
  declined: "red",
};

const CATEGORY_LABEL: Record<IdeaCategory, string> = {
  capital: "Capital",
  operational: "Operational",
  technology: "Technology",
  sustainability: "Sustainability",
  safety: "Safety",
};

const CATEGORY_COLORS: Record<IdeaCategory, { bg: string; color: string }> = {
  capital:       { bg: "#e3f2fd", color: "#1565c0" },
  operational:   { bg: "#fff8e1", color: "#7a5c00" },
  technology:    { bg: "#f3e5f5", color: "#6a1b9a" },
  sustainability:{ bg: "#e8f5e9", color: "#2e7d32" },
  safety:        { bg: "#fce4ec", color: "#880e4f" },
};

function fmtValue(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${(n / 1_000).toFixed(0)}K`;
}

// ─── Styled ───────────────────────────────────────────────────────────────────

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  height: 100%;
`;

const KpiTile = styled.button`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 4px;
  padding: 12px 16px;
  border: none;
  border-right: 1px solid var(--color-border-separator);
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: background 0.12s;
  &:last-child { border-right: none; }
  &:hover { background: var(--color-surface-hover); }
`;

const KpiValue = styled.div<{ $color?: string }>`
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  color: ${({ $color }) => $color ?? "var(--color-text-primary)"};
`;

const KpiLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;

const KpiSub = styled.div`
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 2px;
`;

const PipelineList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const PipelineRow = styled.div<{ $clickable?: boolean }>`
  display: grid;
  grid-template-columns: 130px 36px 1fr 72px;
  align-items: center;
  gap: 12px;
  padding: 9px 0;
  border-bottom: 1px solid var(--color-border-separator);
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};
  &:last-child { border-bottom: none; }
  &:hover { ${({ $clickable }) => $clickable ? "background: var(--color-surface-hover);" : ""} }
`;

const PipelineLabel = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
`;

const PipelineCount = styled.div<{ $color?: string }>`
  font-size: 14px;
  font-weight: 700;
  color: ${({ $color }) => $color ?? "var(--color-text-primary)"};
  text-align: right;
`;

const BarTrack = styled.div`
  height: 8px;
  background: var(--color-surface-secondary);
  border-radius: 4px;
  overflow: hidden;
`;

const BarFill = styled.div<{ $pct: number; $color: string }>`
  height: 100%;
  width: ${({ $pct }) => $pct}%;
  background: ${({ $color }) => $color};
  border-radius: 4px;
  transition: width 0.4s ease;
`;

const PipelineValue = styled.div`
  font-size: 12px;
  color: var(--color-text-secondary);
  text-align: right;
  white-space: nowrap;
`;

const IdeaRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border-separator);
  cursor: pointer;
  &:last-child { border-bottom: none; }
  &:hover { background: var(--color-surface-hover); margin: 0 -16px; padding-left: 16px; padding-right: 16px; }
`;

const IdeaBody = styled.div`
  flex: 1;
  min-width: 0;
`;

const IdeaTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const IdeaMeta = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
`;

const MetaChip = styled.span<{ $bg: string; $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 10px;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
`;

const VoteBadge = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
  min-width: 36px;
`;

const VoteCount = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
`;

const VoteLabel = styled.div`
  font-size: 10px;
  color: var(--color-text-secondary);
  text-transform: uppercase;
`;

// ─── Pipeline stage definitions ───────────────────────────────────────────────

const PIPELINE_STAGES: { status: IdeaStatus; label: string; color: string }[] = [
  { status: "new",         label: "New",        color: "#4a90e2" },
  { status: "in_review",   label: "In Review",  color: "#f5a623" },
  { status: "approved",    label: "Approved",   color: "#27ae60" },
  { status: "in_progress", label: "In Progress",color: "#1abc9c" },
  { status: "on_hold",     label: "On Hold",    color: "#95a5a6" },
  { status: "declined",    label: "Declined",   color: "#e74c3c" },
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function IdeasScorecardSkeleton() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", height: "100%" }}>
      {[0,1,2,3].map(i => (
        <div key={i} style={{ padding: "12px 16px", borderRight: i < 3 ? "1px solid var(--color-border-separator)" : "none", display: "flex", flexDirection: "column", gap: 8 }}>
          <SkeletonBlock style={{ width: "100%", height: 32, borderRadius: 4 }} />
          <SkeletonLine style={{ width: "70%" }} />
        </div>
      ))}
    </div>
  );
}

function IdeaListSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {[0,1,2,3,4].map(i => (
        <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 0", borderBottom: i < 4 ? "1px solid var(--color-border-separator)" : "none" }}>
          <SkeletonBlock style={{ width: 36, height: 36, borderRadius: 6, flexShrink: 0 }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
            <SkeletonLine style={{ width: `${65 + (i % 3) * 10}%` }} />
            <SkeletonLine style={{ width: "45%" }} />
          </div>
          <SkeletonBlock style={{ width: 48, height: 20, borderRadius: 10, flexShrink: 0 }} />
        </div>
      ))}
    </div>
  );
}

// ─── 1. Ideas Scorecard ───────────────────────────────────────────────────────

export function IdeasScorecardCard() {
  const { isLoading } = useHubLoading();

  const total       = IDEAS.length;
  const pending     = IDEAS.filter(i => i.status === "in_review" || i.status === "new").length;
  const approved    = IDEAS.filter(i => i.status === "approved" || i.status === "in_progress").length;
  const totalValue  = IDEAS.filter(i => i.status !== "declined").reduce((s, i) => s + i.estimatedValue, 0);

  if (isLoading) {
    return (
      <HubCardSkeleton hasControls={false} actionCount={1}>
        <IdeasScorecardSkeleton />
      </HubCardSkeleton>
    );
  }

  return (
    <HubCardFrame
      title="Ideas Scorecard"
      infoTooltip="Summary of all submitted ideas across the portfolio, tracked from submission through approval."
      actions={
        <Button variant="secondary" className="b_secondary" size="sm" icon={<Plus size="sm" />}>
          Submit Idea
        </Button>
      }
    >
      <KpiGrid>
        <KpiTile>
          <KpiValue>{total}</KpiValue>
          <KpiLabel>Total Ideas</KpiLabel>
          <KpiSub>all time</KpiSub>
        </KpiTile>
        <KpiTile>
          <KpiValue $color="var(--color-yellow-60, #7a5c00)">{pending}</KpiValue>
          <KpiLabel>Pending Review</KpiLabel>
          <KpiSub>need evaluation</KpiSub>
        </KpiTile>
        <KpiTile>
          <KpiValue $color="var(--color-green-60, #1e6e3a)">{approved}</KpiValue>
          <KpiLabel>Approved</KpiLabel>
          <KpiSub>moving forward</KpiSub>
        </KpiTile>
        <KpiTile>
          <KpiValue style={{ fontSize: 22 }}>{fmtValue(totalValue)}</KpiValue>
          <KpiLabel>Est. Value</KpiLabel>
          <KpiSub>active pipeline</KpiSub>
        </KpiTile>
      </KpiGrid>
    </HubCardFrame>
  );
}

// ─── 2. Idea Pipeline Card ────────────────────────────────────────────────────

export function IdeaPipelineCard() {
  const { isLoading } = useHubLoading();

  const maxCount = Math.max(...PIPELINE_STAGES.map(s => IDEAS.filter(i => i.status === s.status).length), 1);

  if (isLoading) {
    return (
      <HubCardSkeleton hasControls={false} actionCount={1}>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {[0,1,2,3,4,5].map(i => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "130px 36px 1fr 72px", gap: 12, padding: "9px 0", borderBottom: i < 5 ? "1px solid var(--color-border-separator)" : "none", alignItems: "center" }}>
              <SkeletonLine style={{ width: "80%" }} />
              <SkeletonLine style={{ width: "100%", marginLeft: "auto" }} />
              <SkeletonBlock style={{ height: 8, borderRadius: 4 }} />
              <SkeletonLine style={{ width: "60%", marginLeft: "auto" }} />
            </div>
          ))}
        </div>
      </HubCardSkeleton>
    );
  }

  return (
    <HubCardFrame
      title="Idea Pipeline"
      infoTooltip="Count and estimated value of ideas at each stage of the review process."
      actions={
        <Button variant="tertiary" className="b_tertiary" size="sm" icon={<EllipsisVertical size="sm" />} aria-label="More" />
      }
    >
      <PipelineList>
        {PIPELINE_STAGES.map(({ status, label, color }) => {
          const items = IDEAS.filter(i => i.status === status);
          const value = items.reduce((s, i) => s + i.estimatedValue, 0);
          const pct = Math.round((items.length / maxCount) * 100);
          return (
            <PipelineRow key={status} $clickable>
              <PipelineLabel>{label}</PipelineLabel>
              <PipelineCount $color={items.length > 0 ? color : undefined}>{items.length}</PipelineCount>
              <BarTrack>
                <BarFill $pct={pct} $color={color} />
              </BarTrack>
              <PipelineValue>{items.length > 0 ? fmtValue(value) : "—"}</PipelineValue>
            </PipelineRow>
          );
        })}
      </PipelineList>
    </HubCardFrame>
  );
}

// ─── 3. Recent Ideas Card ─────────────────────────────────────────────────────

export function RecentIdeasCard() {
  const { isLoading } = useHubLoading();
  const [filter, setFilter] = useState<IdeaStatus | "all">("all");

  const filtered = (filter === "all" ? IDEAS : IDEAS.filter(i => i.status === filter))
    .slice()
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 8);

  if (isLoading) {
    return (
      <HubCardSkeleton hasControls controlCount={2} actionCount={2}>
        <IdeaListSkeleton />
      </HubCardSkeleton>
    );
  }

  const filterOptions: { value: IdeaStatus | "all"; label: string }[] = [
    { value: "all",         label: "All" },
    { value: "new",         label: "New" },
    { value: "in_review",   label: "In Review" },
    { value: "approved",    label: "Approved" },
    { value: "in_progress", label: "In Progress" },
  ];

  return (
    <HubCardFrame
      title="Top Ideas"
      infoTooltip="Most-voted ideas across the portfolio, sorted by community votes."
      controls={
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {filterOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              style={{
                padding: "3px 10px",
                borderRadius: 12,
                border: `1.5px solid ${filter === opt.value ? "var(--color-action-primary, #ff5200)" : "var(--color-border-separator)"}`,
                background: filter === opt.value ? "rgba(255,82,0,0.08)" : "transparent",
                color: filter === opt.value ? "var(--color-action-primary, #ff5200)" : "var(--color-text-secondary)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      }
      actions={
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Button variant="secondary" className="b_secondary" size="sm" icon={<ArrowRight size="sm" />}>
            View All
          </Button>
          <Button variant="tertiary" className="b_tertiary" size="sm" icon={<EllipsisVertical size="sm" />} aria-label="More" />
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        {filtered.map((idea, idx) => {
          const catStyle = CATEGORY_COLORS[idea.category];
          return (
            <IdeaRow key={idea.id}>
              <VoteBadge>
                <ThumbUp size="sm" style={{ color: "var(--color-text-secondary)" }} />
                <VoteCount>{idea.votes}</VoteCount>
                <VoteLabel>votes</VoteLabel>
              </VoteBadge>
              <IdeaBody>
                <IdeaTitle>{idea.title}</IdeaTitle>
                <IdeaMeta>
                  <Pill color={STATUS_COLOR[idea.status]}>{STATUS_LABEL[idea.status]}</Pill>
                  <MetaChip $bg={catStyle.bg} $color={catStyle.color}>
                    {CATEGORY_LABEL[idea.category]}
                  </MetaChip>
                  <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
                    {fmtValue(idea.estimatedValue)} est.
                  </span>
                  {idea.project && (
                    <span style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "inline-flex", alignItems: "center", gap: 3 }}>
                      <Building size="sm" style={{ width: 12, height: 12 }} />
                      {idea.project}
                    </span>
                  )}
                  <span style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "inline-flex", alignItems: "center", gap: 3 }}>
                    <People size="sm" style={{ width: 12, height: 12 }} />
                    {idea.submittedBy}
                  </span>
                </IdeaMeta>
              </IdeaBody>
            </IdeaRow>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ padding: "24px 0", textAlign: "center" }}>
            <Typography intent="small" style={{ color: "var(--color-text-secondary)" }}>
              No ideas match this filter.
            </Typography>
          </div>
        )}
      </div>
    </HubCardFrame>
  );
}
