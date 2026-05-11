/**
 * Target Budget Hierarchy Forecast Table.
 *
 * This component renders the "Target Budget" tab view in Capital Planning —
 * a read/write forecast table grouped by program region with target-budget
 * cap columns and variance indicators.
 *
 * The full implementation lives in the Capital Planning package. This stub
 * satisfies the TypeScript import boundary for the prototype.
 */

import React from "react";
import { Typography } from "@procore/core-react";
import type { CapitalPlanningSampleRow } from "./capitalPlanningData";
import type { CapitalPlanningColumnVisibility } from "./capitalPlanningColumnGroups";

export interface TargetBudgetHierarchyForecastTableProps {
  filteredProjectRows: readonly CapitalPlanningSampleRow[];
  fiscalYearStartMonth?: number;
  columnVisibility: CapitalPlanningColumnVisibility;
  readOnly?: boolean;
  targetBudgetForecastOverrides?: Record<string, number>;
  setTargetBudgetForecastOverrides?: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  disableForecastColumnToggles?: boolean;
  addTargetBudgetCtaEventName?: string;
  showTotalTargetsColumn?: boolean;
}

/**
 * Target Budget Hierarchy Forecast Table (prototype stub).
 *
 * Renders a placeholder while the full target-budget table is in development.
 */
export function TargetBudgetHierarchyForecastTable({
  filteredProjectRows,
}: TargetBudgetHierarchyForecastTableProps): JSX.Element {
  return (
    <div
      style={{
        padding: "32px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        color: "var(--color-text-secondary)",
      }}
    >
      <Typography intent="body" weight="semibold">
        Target Budget
      </Typography>
      <Typography intent="small">
        {filteredProjectRows.length} project{filteredProjectRows.length !== 1 ? "s" : ""} — target
        budget table coming soon.
      </Typography>
    </div>
  );
}
