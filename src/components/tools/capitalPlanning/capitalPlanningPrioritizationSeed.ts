import { OWNER_OPERATOR_CRITERIA_BUILDER_SEED } from "@/components/tools/capitalPlanning/CriteriaBuilderDataTable";
import { SAMPLE_PROJECT_ROWS } from "@/components/tools/capitalPlanning/capitalPlanningData";

/** ~80% of program rows start with every current criterion answered (Prioritization tab demo). */
const PRIORITIZATION_DEMO_FILL_RATIO = 0.8;

/**
 * Deterministic prototype data: first `floor(n * 0.8)` rows (seed order) get values for each
 * {@link OWNER_OPERATOR_CRITERIA_BUILDER_SEED} column; remaining rows are empty for manual entry.
 */
export function buildInitialPrioritizationCriteriaValues(): Record<string, Record<string, string>> {
  const rows = SAMPLE_PROJECT_ROWS;
  const n = rows.length;
  const filledCount = Math.max(0, Math.min(n, Math.floor(n * PRIORITIZATION_DEMO_FILL_RATIO)));
  const criteria = OWNER_OPERATOR_CRITERIA_BUILDER_SEED;
  const out: Record<string, Record<string, string>> = {};

  for (let i = 0; i < filledCount; i++) {
    const row = rows[i]!;
    const per: Record<string, string> = {};
    for (let c = 0; c < criteria.length; c++) {
      const col = criteria[c]!;
      const idx = i + c;
      const opts = col.criteriaRuleOptions;
      if (opts.length === 0) continue;
      per[col.id] = opts[idx % opts.length]!.id;
    }
    out[row.id] = per;
  }
  return out;
}
