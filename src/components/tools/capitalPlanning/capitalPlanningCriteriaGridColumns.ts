import type { CriteriaBuilderRow } from "@/components/tools/capitalPlanning/CriteriaBuilderDataTable";
import type { CapitalPlanningCriteriaGridColumn } from "@/components/tools/capitalPlanning/CapitalPlanningSmartGrid";

function parseOptionScoreValue(value: string): number {
  const n = parseFloat(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(10, n));
}

function parseCriteriaWeightPercent(s: string): number {
  const n = parseFloat(s);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.max(0, Math.min(100, n));
}

/** Maps Criteria Builder rows to prioritization grid / score column definitions. */
export function criteriaBuilderRowsToGridColumns(rows: CriteriaBuilderRow[]): CapitalPlanningCriteriaGridColumn[] {
  return rows
    .filter((r) => r.criteria.trim() !== "" && r.criteriaRuleOptions.some((o) => o.label.trim() !== ""))
    .map((r) => ({
      criterionId: r.id,
      label: r.criteria.trim(),
      description: r.description.trim(),
      inputType: r.inputType as CapitalPlanningCriteriaGridColumn["inputType"],
      selectOptions: r.criteriaRuleOptions
        .filter((o) => o.label.trim() !== "")
        .map((o) => ({
          optionId: o.id,
          label: o.label.trim(),
          scoreValue: parseOptionScoreValue(o.value),
        })),
      scoringWeightPercent: parseCriteriaWeightPercent(r.scoringWeightPercent),
    }));
}
