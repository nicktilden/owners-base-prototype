/**
 * AG Grid cell renderer for the "Project Health" column.
 *
 * Adapts a ProjectRow into the Project interface expected by the health engine,
 * computes the composite health score (optionally using connected data), and
 * renders a coloured pill. Clicking the pill opens the project tearsheet on the
 * Health tab via the grid context callback.
 */

import React, { useMemo } from "react";
import { Pill } from "@procore/core-react";
import type { ICellRendererParams } from "ag-grid-community";
import type { ProjectRow } from "@/data/projects";
import { getProjectPortfolioScheduleSummary } from "@/data/projects";
import type { PortfolioGridContext } from "./portfolioGridContext";
import { buildHealthResult } from "@/utils/healthEngine";
import { account } from "@/data/seed/account";
import { useConnection } from "@/context/ConnectionContext";
import type { Project } from "@/types/project";

// ─── Wrapper button — bare, so the Pill provides all visual styling ───────────

const pillBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  padding: 0,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
};

// ─── ProjectRow → Project adapter ────────────────────────────────────────────

/**
 * Adapts a `ProjectRow` (AG Grid data) to the `Project` interface
 * required by `buildHealthResult`.
 *
 * Only fields that are computable from `ProjectRow` are populated; the rest
 * are left `undefined` so the health engine marks them as "unavailable".
 */
function rowToProject(row: ProjectRow): Project {
  const budgetVariancePct =
    row.originalBudget > 0
      ? ((row.estimatedCostAtCompletion - row.originalBudget) / row.originalBudget) * 100
      : undefined;

  const sched = getProjectPortfolioScheduleSummary(row);
  const scheduleVarianceDays =
    sched.scheduleVariance !== 0 ? sched.scheduleVariance : undefined;

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
    scheduleVarianceDays,
    healthHistory: [],
  };
}

// ─── Score labels ─────────────────────────────────────────────────────────────

const SCORE_LABEL: Record<"green" | "yellow" | "red", string> = {
  green: "Healthy",
  yellow: "At Risk",
  red: "Critical",
};

// ─── Cell renderer ────────────────────────────────────────────────────────────

export default function HealthPillCellRenderer(
  params: ICellRendererParams<ProjectRow, unknown, PortfolioGridContext>
) {
  const { getConnection } = useConnection();
  const row = params.data;
  const context = params.context;

  const score = useMemo(() => {
    if (!row) return "unavailable" as const;
    const connection = getConnection(row.id);
    const project = rowToProject(row);
    const result = buildHealthResult(project, account.healthConfig, connection, []);
    return result.compositeScore;
  }, [row, getConnection]);

  if (!row) return null;

  const handleClick = () => {
    context?.onOpenHealthTab?.(row);
  };

  if (score === "green" || score === "yellow" || score === "red") {
    return (
      <button style={pillBtnStyle} onClick={handleClick} title="View health details">
        <Pill color={score}>{SCORE_LABEL[score]}</Pill>
      </button>
    );
  }

  return (
    <button style={pillBtnStyle} onClick={handleClick} title="View health details">
      <Pill color="gray">—</Pill>
    </button>
  );
}
