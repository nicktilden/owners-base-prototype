import {
  CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS,
  fiscalQuarterMonthGlobalIndices,
} from "./capitalPlanningForecast";

export type ProgramQuarterLeafSlot =
  | { kind: "fy_year"; fyIndex: number }
  | { kind: "fq_rollup"; fyIndex: number; fqIndex: number }
  | { kind: "month_single"; fyIndex: number; fqIndex: number; monthIdx: number }
  | { kind: "cmp_current"; fyIndex: number; fqIndex: number; monthIdx: number }
  | { kind: "cmp_snapshot"; fyIndex: number; fqIndex: number; monthIdx: number }
  | { kind: "cmp_variance"; fyIndex: number; fqIndex: number; monthIdx: number };

/**
 * Flat leaf column order for the program quarter grid (matches FY → FQ → month walk).
 * When comparison is enabled and a month is expanded, that month becomes three leaf columns.
 */
export function buildProgramQuarterLeafSlots(p: {
  fyYearSectionExpanded: readonly boolean[];
  fqCollapsed: readonly boolean[];
  fiscalYearStartMonth: number;
  comparisonMonthDetailOpen: ReadonlySet<number>;
  comparisonFeatureEnabled: boolean;
}): ProgramQuarterLeafSlot[] {
  const out: ProgramQuarterLeafSlot[] = [];
  for (let fyIndex = 0; fyIndex < CAPITAL_PLANNING_PROGRAM_FISCAL_YEARS.length; fyIndex++) {
    if (!p.fyYearSectionExpanded[fyIndex]) {
      out.push({ kind: "fy_year", fyIndex });
      continue;
    }
    for (let fqInFy = 0; fqInFy < 4; fqInFy++) {
      const fqIndex = fyIndex * 4 + fqInFy;
      if (p.fqCollapsed[fqIndex]) {
        out.push({ kind: "fq_rollup", fyIndex, fqIndex });
        continue;
      }
      const fqMonthIndices = fiscalQuarterMonthGlobalIndices(fyIndex, fqInFy, p.fiscalYearStartMonth);
      for (let k = 0; k < 3; k++) {
        const monthIdx = fqMonthIndices[k]!;
        if (p.comparisonFeatureEnabled && p.comparisonMonthDetailOpen.has(monthIdx)) {
          out.push({ kind: "cmp_current", fyIndex, fqIndex, monthIdx });
          out.push({ kind: "cmp_snapshot", fyIndex, fqIndex, monthIdx });
          out.push({ kind: "cmp_variance", fyIndex, fqIndex, monthIdx });
        } else {
          out.push({ kind: "month_single", fyIndex, fqIndex, monthIdx });
        }
      }
    }
  }
  return out;
}

export function programQuarterSlotsColspanForFy(slots: readonly ProgramQuarterLeafSlot[], fyIndex: number): number {
  return slots.reduce((n, s) => n + (s.fyIndex === fyIndex ? 1 : 0), 0);
}

export function programQuarterSlotsColspanForFq(slots: readonly ProgramQuarterLeafSlot[], fqIndex: number): number {
  return slots.reduce((n, s) => (s.kind !== "fy_year" && s.fqIndex === fqIndex ? n + 1 : n), 0);
}
