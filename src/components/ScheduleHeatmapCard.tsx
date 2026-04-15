import React from "react";
import { DetailPage, Pill, Tooltip } from "@procore/core-react";
import styled from "styled-components";
import {
  sampleProjectRows,
  sampleProjectMilestones,
  PROJECT_MILESTONES,
  VARIANCE_AXIS_MIN,
  VARIANCE_AXIS_MAX,
  getStageOrder,
  type ProjectMilestoneName,
} from "@/data/projects";
import { formatDateMMDDYYYY } from "@/utils/date";
import { useHubFilters } from "@/context/HubFilterContext";

// ─── Heatmap color logic ───────────────────────────────────────────────────────

const HEATMAP_PCT_LO = 5;
const HEATMAP_PCT_HI = 30;
const HEATMAP_HEADER_BG = "hsl(200, 8%, 96%)";
const HEATMAP_HEADER_FG = "hsl(200, 8%, 30%)";
const HEATMAP_NEUTRAL_BG = "#eceff1";
const HEATMAP_CELL_FG_DARK = "#1a1a1a";
const HEATMAP_CELL_FG_LIGHT = "#ffffff";

function varianceToHeatmapPct(v: number): number {
  const lo = VARIANCE_AXIS_MIN;
  const hi = VARIANCE_AXIS_MAX;
  const c = Math.max(lo, Math.min(hi, v));
  const ratio = (hi - c) / (hi - lo);
  return Math.round(HEATMAP_PCT_LO + ratio * (HEATMAP_PCT_HI - HEATMAP_PCT_LO));
}

function heatmapBgForPct(pct: number): string {
  if (pct <= 7) return "#b71c1c";
  if (pct <= 9) return "#d32f2f";
  if (pct <= 11) return "#e53935";
  if (pct <= 13) return "#ff7043";
  if (pct <= 15) return "#ffab91";
  if (pct <= 17) return "#ffcc80";
  if (pct <= 19) return "#fff9c4";
  if (pct <= 21) return "#e6ee9c";
  if (pct <= 23) return "#c5e1a5";
  if (pct <= 25) return "#8bc34a";
  if (pct <= 27) return "#43a047";
  if (pct <= 28) return "#2e7d32";
  return "#1b5e20";
}

function heatmapFgForPct(pct: number): string {
  // Light text on dark ends of the scale, dark text on light middle
  return pct <= 13 || pct >= 27 ? HEATMAP_CELL_FG_LIGHT : HEATMAP_CELL_FG_DARK;
}

// ─── Milestone stage membership (mirrors MILESTONE_STAGE_INDEX in projects.ts) ─

const MILESTONE_STAGE_MAP: Record<ProjectMilestoneName, number> = {
  "Project Charter": 1,
  "Feasibility Study": 2,
  "Design Kickoff": 3,
  "Project Scope": 1,
  "Decision Support Package": 2,
  "Readiness Review": 3,
  "Construction Documents": 3,
  "Designs Approved": 3,
  "Storm Water Pollution Prevention Plan": 4,
  "Environmental Survey": 4,
  "Municipal Approvals": 4,
  "Building Permits": 4,
  "Bidding": 5,
  "Notice to Proceed": 6,
  "Site Mobilization": 6,
  "Phase 1 - Construction": 7,
  "MEP Rough-In": 7,
  "Phase 2 - Construction": 7,
  "Interior Finishes": 7,
  "Phase 3 - Final Build": 7,
  "Retrofit Start": 7,
  "Substantial Completion": 8,
  "Client Handoff": 9,
};

// ─── Abbreviated column labels ─────────────────────────────────────────────────

const MILESTONE_ABBR: Record<ProjectMilestoneName, string> = {
  "Project Charter":                       "Charter",
  "Feasibility Study":                     "Feasib.",
  "Design Kickoff":                        "Des. KO",
  "Project Scope":                         "Scope",
  "Decision Support Package":              "DSP",
  "Readiness Review":                      "Rdy Rev",
  "Construction Documents":                "Con Docs",
  "Designs Approved":                      "Des. App",
  "Storm Water Pollution Prevention Plan": "SWPPP",
  "Environmental Survey":                  "Env Sur",
  "Municipal Approvals":                   "Muni App",
  "Building Permits":                      "Permits",
  "Bidding":                               "Bidding",
  "Notice to Proceed":                     "NTP",
  "Site Mobilization":                     "Site Mob",
  "Phase 1 - Construction":                "Ph. 1",
  "MEP Rough-In":                          "MEP",
  "Phase 2 - Construction":                "Ph. 2",
  "Interior Finishes":                     "Int. Fin",
  "Phase 3 - Final Build":                 "Ph. 3",
  "Retrofit Start":                        "Retrofit",
  "Substantial Completion":                "Sub Comp",
  "Client Handoff":                        "Handoff",
};

// ─── Stage pill colors ─────────────────────────────────────────────────────────

const STAGE_COLORS: Record<string, "blue" | "green" | "yellow" | "gray" | "magenta" | "cyan"> = {
  "Conceptual":             "magenta",
  "Feasibility":            "magenta",
  "Final design":           "cyan",
  "Permitting":             "yellow",
  "Bidding":                "yellow",
  "Pre-Construction":       "blue",
  "Course of Construction": "green",
  "Post-Construction":      "green",
  "Handover":               "blue",
  "Closeout":               "gray",
  "Maintenance":            "gray",
};

// ─── Styled components ─────────────────────────────────────────────────────────

const ScrollWrapper = styled.div`
  overflow-x: auto;
  overflow-y: auto;
  max-height: 800px;
  width: 100%;
  margin-top: 4px;
  border: 1px solid hsl(200, 8%, 85%);
  border-radius: 4px;
`;

const HeatmapTable = styled.table`
  border-collapse: collapse;
  width: max-content;
  min-width: 100%;
`;

const THead = styled.thead`
  background: ${HEATMAP_HEADER_BG};
`;

const Th = styled.th<{ $sticky?: boolean }>`
  padding: 0 16px;
  height: 48px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: 0.25px;
  white-space: nowrap;
  text-align: left;
  border-bottom: 1px solid var(--color-border-separator);
  border-right: 1px solid #e8eaeb;
  background: ${HEATMAP_HEADER_BG};
  ${({ $sticky }) =>
    $sticky &&
    `
    position: sticky;
    left: 0;
    z-index: 3;
  `}
`;

const ThMilestone = styled.th`
  padding: 0 4px;
  height: 48px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: 0.2px;
  white-space: nowrap;
  text-align: center;
  border-bottom: 1px solid var(--color-border-separator);
  border-right: 1px solid #e8eaeb;
  background: ${HEATMAP_HEADER_BG};
  min-width: 80px;
`;

const Tr = styled.tr`
  &:last-child td {
    border-bottom: none;
  }
  &:hover td {
    filter: brightness(0.96);
  }
`;

const Td = styled.td<{ $sticky?: boolean }>`
  padding: 6px 8px;
  border-bottom: 1px solid #e8eaeb;
  border-right: 1px solid #e8eaeb;
  background: var(--color-surface-primary);
  vertical-align: middle;
  white-space: nowrap;
  ${({ $sticky }) =>
    $sticky &&
    `
    position: sticky;
    left: 0;
    z-index: 1;
    background: var(--color-surface-primary);
  `}
`;

const TdMilestone = styled.td`
  padding: 3px 2px;
  border-bottom: 1px solid #e8eaeb;
  border-right: 0px solid #e8eaeb;
  background: var(--color-surface-primary);
  text-align: center;
  vertical-align: middle;
`;

const ProjectMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

const ProjectNumber = styled.span`
  font-size: 11px;
  font-weight: 400;
  color: var(--color-text-secondary);
  line-height: 1.2;
`;

const ProjectName = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-link);
  text-decoration: underline;
  cursor: pointer;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  line-height: 1.3;
`;

const HeatCell = styled.div<{ $bg: string; $fg: string; $current: boolean }>`
  width: 44px;
  height: 28px;
  border-radius: 3px;
  background: ${({ $bg }) => $bg};
  color: ${({ $fg }) => $fg};
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1px;
  line-height: 1;
  ${({ $current }) =>
    $current &&
    `
    outline: 2px solid var(--color-text-primary);
    outline-offset: 1px;
  `}
`;

const FutureDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${HEATMAP_NEUTRAL_BG};
  margin: 0 auto;
`;

const Legend = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0 0 10px;
  flex-wrap: wrap;
`;

const LegendGradient = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LegendLabel = styled.span`
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
`;

const LegendStrip = styled.div`
  display: flex;
  border-radius: 3px;
  overflow: hidden;
  height: 14px;
`;

const LegendBand = styled.div<{ $color: string }>`
  width: 14px;
  height: 14px;
  background: ${({ $color }) => $color};
`;

const LegendSeparator = styled.div`
  width: 1px;
  background: var(--color-border-separator);
  margin: 0 12px;
  height: 16px;
  align-self: center;
`;

const LegendDotItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--color-text-secondary);
`;

const LegendDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${HEATMAP_NEUTRAL_BG};
  border: 1px solid var(--color-border-separator);
`;

const LegendCurrentBox = styled.div`
  width: 14px;
  height: 14px;
  border-radius: 2px;
  background: #8bc34a;
  outline: 2px solid var(--color-text-primary);
  outline-offset: 1px;
`;

const SegmentedControllerWrap = styled.div`
  /* default (unselected) segment label */
  [role="radiogroup"] label {
    background-color: var(--color-surface-secondary) !important;
    color: var(--color-text-secondary) !important;
    transition: background-color 0.15s ease, color 0.15s ease;

    &:hover {
      background-color: var(--color-surface-tertiary) !important;
      color: var(--color-text-primary) !important;
    }
  }

  /* selected segment — the label that contains a checked radio input */
  [role="radiogroup"] label:has(input:checked) {
    background-color: var(--color-action-primary) !important;
    border-color: var(--color-action-primary) !important;
    color: #ffffff !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);

    &:hover {
      background-color: var(--color-action-primary) !important;
      color: #ffffff !important;
    }
  }
`;

// ─── Component ─────────────────────────────────────────────────────────────────

const LEGEND_COLORS = [
  "#b71c1c", "#d32f2f", "#e53935", "#ff7043", "#ffab91",
  "#ffcc80", "#fff9c4", "#e6ee9c", "#c5e1a5", "#8bc34a", "#43a047", "#2e7d32", "#1b5e20",
];

export default function ScheduleHeatmapCard() {
  const { filteredProjectRows } = useHubFilters();
  return (
    <DetailPage.Card navigationLabel="Schedule & Milestones" className="card_container">
      <DetailPage.Section heading="Schedule & Milestones">
        <Legend>
          <LegendGradient>
            <LegendLabel>Behind</LegendLabel>
            <LegendStrip>
              {LEGEND_COLORS.map((c) => (
                <LegendBand key={c} $color={c} />
              ))}
            </LegendStrip>
            <LegendLabel>Ahead</LegendLabel>
          </LegendGradient>
          <LegendSeparator />
          <LegendDotItem>
            <LegendDot />
            Not yet reached
          </LegendDotItem>
          <LegendSeparator />
          <LegendDotItem>
            <LegendCurrentBox />
            Current milestone
          </LegendDotItem>
        </Legend>

        <ScrollWrapper className="table_container">
          <HeatmapTable> 
            <THead>
              <tr>
                <Th $sticky>Project</Th>
                <Th>Stage</Th>
                {PROJECT_MILESTONES.map((m) => (
                  <ThMilestone key={m} title={m}>
                    {MILESTONE_ABBR[m]}
                  </ThMilestone>
                ))}
              </tr>
            </THead>
            <tbody>
              {filteredProjectRows.map((project) => {
                const stageOrder = getStageOrder(project.stage);
                const milestones = sampleProjectMilestones.get(project.id) ?? [];
                const milestoneMap = new Map(milestones.map((m) => [m.name, m]));

                let currentIdx = -1;
                PROJECT_MILESTONES.forEach((name, i) => {
                  if (MILESTONE_STAGE_MAP[name] <= stageOrder) currentIdx = i;
                });

                return (
                  <Tr key={project.id}>
                    <Td $sticky>
                      <ProjectMeta>
                        <ProjectNumber>{project.number}</ProjectNumber>
                        <ProjectName title={project.name}>{project.name}</ProjectName>
                      </ProjectMeta>
                    </Td>
                    <Td style={{ minWidth: 160 }}>
                      <Pill style={{ whiteSpace: "nowrap" }} color={STAGE_COLORS[project.stage] ?? "gray"} data-pill-color={STAGE_COLORS[project.stage] ?? "gray"}>
                        {project.stage}
                      </Pill>
                    </Td>
                    {PROJECT_MILESTONES.map((name, i) => {
                      const m = milestoneMap.get(name);
                      const isPast = i <= currentIdx;
                      const isCurrent = i === currentIdx;
                      const varianceLabel = m
                        ? m.varianceDays === 0
                          ? "0 days"
                          : `${m.varianceDays > 0 ? "+" : ""}${m.varianceDays} days`
                        : "Not reached";

                      const tooltipContent = (
                        <Tooltip.Content>
                          <div
                            style={{
                              minWidth: 220,
                              maxWidth: 280,
                              lineHeight: 1.45,
                              whiteSpace: "normal",
                              overflowWrap: "anywhere",
                              wordBreak: "break-word",
                            }}
                          >
                            <div style={{ fontWeight: 700 }}>{name}</div>
                            <div style={{ marginTop: 2, color: "#c9d1d4" }}>{project.name}</div>
                            <div style={{ marginTop: 8 }}>Baseline: {m ? formatDateMMDDYYYY(m.baselineDate) : "N/A"}</div>
                            <div>Actual: {m?.actualDate ? formatDateMMDDYYYY(m.actualDate) : "—"}</div>
                            <div>Variance: {varianceLabel}</div>
                          </div>
                        </Tooltip.Content>
                      );

                      if (!isPast || !m) {
                        return (
                          <TdMilestone key={name}>
                            <Tooltip trigger="hover" placement="top" overlay={tooltipContent}>
                              <span style={{ display: "inline-flex" }}>
                                <FutureDot />
                              </span>
                            </Tooltip>
                          </TdMilestone>
                        );
                      }

                      const pct = varianceToHeatmapPct(m.varianceDays);
                      const bg = heatmapBgForPct(pct);
                      const fg = heatmapFgForPct(pct);
                      const label = m.varianceDays === 0
                        ? "0d"
                        : `${m.varianceDays > 0 ? "+" : ""}${m.varianceDays}d`;

                      return (
                        <TdMilestone key={name}>
                          <Tooltip trigger="hover" placement="top" overlay={tooltipContent}>
                            <span style={{ display: "inline-flex" }}>
                              <HeatCell $bg={bg} $fg={fg} $current={isCurrent}>
                                {label}
                              </HeatCell>
                            </span>
                          </Tooltip>
                        </TdMilestone>
                      );
                    })}
                  </Tr>
                );
              })}
            </tbody>
          </HeatmapTable>
        </ScrollWrapper>
      </DetailPage.Section>
    </DetailPage.Card>
  );
}
