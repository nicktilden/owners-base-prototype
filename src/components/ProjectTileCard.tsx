/**
 * ProjectTileCard — portfolio tile view for a single project.
 *
 * Displays 8 priority attributes in a 4-column × 2-row grid, inspired by the
 * project card design. Clicking the project name or the "Details" menu item
 * opens the project tearsheet on the General tab; health badge opens the Health
 * tab; the connect icon opens the Connection tab.
 */

import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import {
  Calendar,
  FileCurrencyUSA,
  FileChartLine,
  FileQuestionMark,
  Warning,
  EllipsisVertical,
  Connect,
  Stamp,
  ChevronUp,
} from "@procore/core-icons";
import type { ProjectRow } from "@/data/projects";
import { getProjectPortfolioScheduleSummary } from "@/data/projects";
import { projectImages } from "@/images/projectImages";
import { useConnection } from "@/context/ConnectionContext";
import { buildHealthResult } from "@/utils/healthEngine";
import { account } from "@/data/seed/account";
import type { Project } from "@/types/project";
import type { TabKey } from "@/components/ProjectEditTearsheet";

// ─── Row→Project adapter (mirrors HealthPillCellRenderer) ─────────────────────

function rowToProject(row: ProjectRow): Project {
  const budgetVariancePct =
    row.originalBudget > 0
      ? ((row.estimatedCostAtCompletion - row.originalBudget) / row.originalBudget) * 100
      : undefined;
  const sched = getProjectPortfolioScheduleSummary(row);
  return {
    id: String(row.id),
    number: row.number,
    name: row.name,
    stage: row.stage as Project["stage"],
    status: "active",
    program: null,
    estimatedBudget: row.originalBudget,
    priority: (row.priority as Project["priority"]) ?? "medium",
    scope: "new_construction",
    sector: "Commercial > Office",
    delivery: "Design-Bid-Build (DBB)",
    type: "Capital Improvements",
    region: "Midwest",
    country: "United States",
    city: row.city ?? "",
    state: (row.state ?? "Michigan") as Project["state"],
    zip: "",
    address: row.location,
    latitude: 0,
    longitude: 0,
    favorite: row.favorite,
    photo: null,
    startDate: new Date(row.startDate),
    endDate: new Date(row.endDate),
    description: "",
    budgetVariancePct,
    scheduleVarianceDays: sched.scheduleVariance !== 0 ? sched.scheduleVariance : undefined,
    healthHistory: [],
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtMoney(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

const PRIORITY_COLORS: Record<string, string> = {
  high: "var(--color-red-50, #c62828)",
  medium: "var(--color-yellow-50, #f9a825)",
  low: "var(--color-green-50, #2e7d32)",
};

const HEALTH_CONFIG: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  green: { label: "Healthy", bg: "#e6f4ea", color: "#1e6e3a", dot: "#2e7d32" },
  yellow: { label: "At Risk", bg: "#fff8e1", color: "#7a5c00", dot: "#f9a825" },
  red: { label: "Critical", bg: "#fce8e6", color: "#a50e0e", dot: "#c62828" },
};

const STAGE_COLORS: Record<string, { bg: string; color: string }> = {
  "Pre-Construction": { bg: "#e3f2fd", color: "#1565c0" },
  "course_of_construction": { bg: "#fff8e1", color: "#7a5c00" },
  "Post-Construction": { bg: "#e8f5e9", color: "#2e7d32" },
  "closeout": { bg: "#fce4ec", color: "#880e4f" },
  "conceptual": { bg: "#f3e5f5", color: "#6a1b9a" },
  "feasibility": { bg: "#e8eaf6", color: "#283593" },
  "final_design": { bg: "#e0f2f1", color: "#004d40" },
  "permitting": { bg: "#fff3e0", color: "#e65100" },
  "bidding": { bg: "#fbe9e7", color: "#bf360c" },
  "handover": { bg: "#e0f7fa", color: "#006064" },
  "maintenance": { bg: "#f9fbe7", color: "#558b2f" },
};

function stageLabel(stage: string): string {
  const map: Record<string, string> = {
    course_of_construction: "Construction",
    Post_Construction: "Post-Construction",
    conceptual: "Conceptual",
    feasibility: "Feasibility",
    final_design: "Final Design",
    permitting: "Permitting",
    bidding: "Bidding",
    handover: "Handover",
    closeout: "Closeout",
    maintenance: "Maintenance",
  };
  return map[stage] ?? stage;
}

// ─── Styled components ────────────────────────────────────────────────────────

const Card = styled.div`
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-separator);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: box-shadow 0.15s, border-color 0.15s;
  &:hover {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    border-color: var(--color-border-default);
  }
`;

const CardHeader = styled.div`
  padding: 16px 16px 12px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;

const HeaderLeft = styled.div`
  flex: 1;
  min-width: 0;
`;

const ProjectNumber = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
`;

const ProjectName = styled(Link)`
  font-size: 15px;
  font-weight: 700;
  color: var(--color-action-primary, #ff5200);
  text-decoration: none;
  text-align: left;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  &:hover { text-decoration: underline; }
`;

const ProjectMeta = styled.div`
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProjectImage = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 6px;
  flex-shrink: 0;
  overflow: hidden;
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border-separator);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProjectImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    var(--color-surface-secondary) 0%,
    var(--color-surface-tertiary, #e8eaeb) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-secondary);
  letter-spacing: -0.5px;
  user-select: none;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: var(--color-text-secondary);
  flex-shrink: 0;
  &:hover { background: var(--color-surface-secondary); color: var(--color-text-primary); }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 160px;
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-separator);
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  z-index: 100;
  overflow: hidden;
`;

const DropdownItem = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 14px;
  font-size: 13px;
  color: var(--color-text-primary);
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  &:hover { background: var(--color-surface-secondary); }
`;

const AttributeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  border-top: 1px solid var(--color-border-separator);
  border-bottom: 1px solid var(--color-border-separator);
`;

const AttributeCell = styled.div<{ $clickable?: boolean }>`
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  border-right: 1px solid var(--color-border-separator);
  border-bottom: 1px solid var(--color-border-separator);
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};

  &:nth-child(4n) { border-right: none; }
  &:nth-child(5), &:nth-child(6), &:nth-child(7), &:nth-child(8) {
    border-bottom: none;
  }

  ${({ $clickable }) =>
    $clickable &&
    `&:hover { background: var(--color-surface-secondary); }`}
`;

const AttrIconRow = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const AttrValue = styled.div<{ $color?: string }>`
  font-size: 16px;
  font-weight: 700;
  color: ${({ $color }) => $color ?? "var(--color-text-primary)"};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const AttrLabel = styled.div`
  font-size: 10px;
  font-weight: 500;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const HealthBadge = styled.span<{ $bg: string; $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 7px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
`;

const HealthDot = styled.span<{ $color: string }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
`;

const StagePill = styled.span<{ $bg: string; $color: string }>`
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
`;

const CardFooter = styled.div`
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const FooterPM = styled.div`
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ProjectTileCardProps {
  project: ProjectRow;
  onOpen: (project: ProjectRow, tab?: TabKey) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProjectTileCard({ project, onOpen }: ProjectTileCardProps) {
  const { getConnection } = useConnection();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const connection = getConnection(project.id);
  const sched = getProjectPortfolioScheduleSummary(project);

  const health = useMemo(() => {
    const adapted = rowToProject(project);
    const result = buildHealthResult(adapted, account.healthConfig, connection, []);
    return result.compositeScore as "green" | "yellow" | "red" | "unavailable";
  }, [project, connection]);

  const healthCfg = health !== "unavailable" ? HEALTH_CONFIG[health] : null;

  // Derived attribute values
  const schedVariance = sched.scheduleVariance;
  const schedColor =
    schedVariance > 14
      ? "var(--color-red-50, #c62828)"
      : schedVariance > 0
      ? "var(--color-yellow-60, #7a5c00)"
      : schedVariance < 0
      ? "var(--color-green-50, #2e7d32)"
      : "var(--color-text-primary)";
  const schedLabel =
    schedVariance > 0 ? `+${schedVariance}d` : schedVariance < 0 ? `${schedVariance}d` : "On Track";

  const rfisOpen = connection ? connection.counts.rfis.open : null;
  const rfisOverdue = connection ? connection.counts.rfis.overdue : null;
  const submittalsOverdue = connection ? connection.counts.submittals.overdue : null;
  const totalOverdue =
    rfisOverdue != null && submittalsOverdue != null
      ? rfisOverdue + submittalsOverdue
      : null;

  const stageStyle = STAGE_COLORS[project.stage] ?? { bg: "var(--color-surface-secondary)", color: "var(--color-text-secondary)" };

  const budgetPct =
    project.originalBudget > 0
      ? ((project.estimatedCostAtCompletion - project.originalBudget) / project.originalBudget) * 100
      : 0;
  const costColor =
    budgetPct > 10
      ? "var(--color-red-50, #c62828)"
      : budgetPct > 3
      ? "var(--color-yellow-60, #7a5c00)"
      : "var(--color-text-primary)";

  const priorityColor = PRIORITY_COLORS[project.priority ?? "medium"];

  // Close dropdown on outside click
  React.useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <Card>
      {/* ── Header ── */}
      <CardHeader>
        <ProjectImage>
          {(() => {
            const seedId = `proj-${String(project.id).padStart(3, '0')}`;
            const img = projectImages[seedId];
            return img ? (
              <img src={img.src} alt={project.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <ProjectImagePlaceholder aria-hidden="true">
                {project.name.slice(0, 2).toUpperCase()}
              </ProjectImagePlaceholder>
            );
          })()}
        </ProjectImage>

        <HeaderLeft>
          <ProjectNumber>{project.number}</ProjectNumber>
          <ProjectName href={`/project/${project.id}/overview`}>
            {project.name}
          </ProjectName>
          <ProjectMeta>
            {[project.city, project.state].filter(Boolean).join(", ")}
            {project.program ? ` · ${project.program}` : ""}
          </ProjectMeta>
        </HeaderLeft>

        <div style={{ position: "relative", flexShrink: 0 }} ref={menuRef}>
          <MenuButton
            aria-label="Project options"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <EllipsisVertical size="sm" />
          </MenuButton>
          {menuOpen && (
            <DropdownMenu>
              <DropdownItem onClick={() => { setMenuOpen(false); onOpen(project, "General"); }}>
                Edit Project
              </DropdownItem>
              <DropdownItem onClick={() => { setMenuOpen(false); onOpen(project, "Health"); }}>
                View Health
              </DropdownItem>
              <DropdownItem onClick={() => { setMenuOpen(false); onOpen(project, "Financial"); }}>
                Financial Details
              </DropdownItem>
              <DropdownItem onClick={() => { setMenuOpen(false); onOpen(project, "Connection"); }}>
                {connection ? "View Connection" : "Connect Project"}
              </DropdownItem>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      {/* ── 8-attribute grid (4 col × 2 row) ── */}
      <AttributeGrid>

        {/* 1 — Original Budget */}
        <AttributeCell>
          <AttrIconRow>
            <FileCurrencyUSA size="sm" style={{ color: "var(--color-text-secondary)" }} />
          </AttrIconRow>
          <AttrValue>{fmtMoney(project.originalBudget)}</AttrValue>
          <AttrLabel>Orig. Budget</AttrLabel>
        </AttributeCell>

        {/* 2 — Est. Cost at Completion */}
        <AttributeCell>
          <AttrIconRow>
            <FileChartLine size="sm" style={{ color: costColor }} />
          </AttrIconRow>
          <AttrValue $color={costColor}>
            {fmtMoney(project.estimatedCostAtCompletion)}
          </AttrValue>
          <AttrLabel>Cost at Compl.</AttrLabel>
        </AttributeCell>

        {/* 3 — Project Health */}
        <AttributeCell $clickable onClick={() => onOpen(project, "Health")}>
          <AttrIconRow>
            <span style={{ fontSize: 11, color: "var(--color-text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px" }}>
              HEALTH
            </span>
          </AttrIconRow>
          {healthCfg ? (
            <HealthBadge $bg={healthCfg.bg} $color={healthCfg.color}>
              <HealthDot $color={healthCfg.dot} />
              {healthCfg.label}
            </HealthBadge>
          ) : (
            <AttrValue style={{ fontSize: 13 }}>—</AttrValue>
          )}
          <AttrLabel>Project Health</AttrLabel>
        </AttributeCell>

        {/* 4 — Priority */}
        <AttributeCell>
          <AttrIconRow>
            <ChevronUp size="sm" style={{ color: priorityColor }} />
          </AttrIconRow>
          <AttrValue $color={priorityColor} style={{ textTransform: "capitalize" }}>
            {project.priority ?? "—"}
          </AttrValue>
          <AttrLabel>Priority</AttrLabel>
        </AttributeCell>

        {/* 5 — Open RFIs */}
        <AttributeCell>
          <AttrIconRow>
            <FileQuestionMark
              size="sm"
              style={{
                color: rfisOpen != null && rfisOpen > 5
                  ? "var(--color-red-50, #c62828)"
                  : "var(--color-text-secondary)",
              }}
            />
          </AttrIconRow>
          <AttrValue
            $color={
              rfisOpen != null && rfisOpen > 5
                ? "var(--color-red-50, #c62828)"
                : undefined
            }
          >
            {rfisOpen != null ? rfisOpen : "—"}
          </AttrValue>
          <AttrLabel>Open RFIs</AttrLabel>
        </AttributeCell>

        {/* 6 — Submittals pending */}
        <AttributeCell>
          <AttrIconRow>
            <Stamp
              size="sm"
              style={{
                color:
                  connection && connection.counts.submittals.pending > 10
                    ? "var(--color-yellow-60, #7a5c00)"
                    : "var(--color-text-secondary)",
              }}
            />
          </AttrIconRow>
          <AttrValue
            $color={
              connection && connection.counts.submittals.pending > 10
                ? "var(--color-yellow-60, #7a5c00)"
                : undefined
            }
          >
            {connection ? connection.counts.submittals.pending : "—"}
          </AttrValue>
          <AttrLabel>Submittals</AttrLabel>
        </AttributeCell>

        {/* 7 — Overdue items */}
        <AttributeCell>
          <AttrIconRow>
            <Warning
              size="sm"
              style={{
                color:
                  totalOverdue != null && totalOverdue > 0
                    ? "var(--color-red-50, #c62828)"
                    : "var(--color-text-secondary)",
              }}
            />
          </AttrIconRow>
          <AttrValue
            $color={
              totalOverdue != null && totalOverdue > 0
                ? "var(--color-red-50, #c62828)"
                : undefined
            }
          >
            {totalOverdue != null ? totalOverdue : "—"}
          </AttrValue>
          <AttrLabel>Overdue</AttrLabel>
        </AttributeCell>

        {/* 8 — Schedule Variance */}
        <AttributeCell>
          <AttrIconRow>
            <Calendar size="sm" style={{ color: schedColor }} />
          </AttrIconRow>
          <AttrValue $color={schedColor}>{schedLabel}</AttrValue>
          <AttrLabel>Sched. Var.</AttrLabel>
        </AttributeCell>

      </AttributeGrid>

      {/* ── Footer ── */}
      <CardFooter>
        <FooterPM>
          {project.projectManager ? `By ${project.projectManager}` : "—"}
          {connection && (
            <Connect
              size="sm"
              style={{ color: "#FF5200", marginLeft: 6, verticalAlign: "middle" }}
              aria-label="Connected"
            />
          )}
        </FooterPM>
        <StagePill $bg={stageStyle.bg} $color={stageStyle.color}>
          {stageLabel(project.stage)}
        </StagePill>
      </CardFooter>
    </Card>
  );
}
