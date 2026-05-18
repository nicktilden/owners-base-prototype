import {
  cloneCriteriaBuilderRows,
  OWNER_OPERATOR_CRITERIA_BUILDER_SEED,
  type CriteriaBuilderRow,
} from "@/components/tools/capitalPlanning/CriteriaBuilderDataTable";

export const CAPITAL_PLANNING_CRITERIA_BUILDER_STORAGE_KEY =
  "owners-base.capitalPlanning.criteriaBuilderRows.v2";

/** Dispatched after {@link writePersistedCriteriaBuilderRows} so open Capital Plan syncs criteria columns. */
export const CAPITAL_PLANNING_CRITERIA_BUILDER_CHANGED_EVENT = "capitalPlanningCriteriaBuilderRowsChanged";

const LEGACY_NOI_CRITERION_ID = "cb-oo-noi";
const ROI_CRITERION_ID = "cb-oo-roi";
const LEGACY_TOP4_WEIGHT_SIGNATURE = ["40", "35", "25", "0"] as const;
const UPDATED_TOP4_WEIGHT_SIGNATURE = ["35", "30", "20", "15"] as const;

function seedRowById(id: string): CriteriaBuilderRow | undefined {
  return OWNER_OPERATOR_CRITERIA_BUILDER_SEED.find((row) => row.id === id);
}

function normalizeLegacyCriterionIds(rows: CriteriaBuilderRow[]): CriteriaBuilderRow[] {
  return rows.map((row) => {
    if (row.id !== LEGACY_NOI_CRITERION_ID) return { ...row, criteriaRuleOptions: row.criteriaRuleOptions.map((o) => ({ ...o })) };
    const roiSeed = seedRowById(ROI_CRITERION_ID);
    if (!roiSeed) return { ...row, criteriaRuleOptions: row.criteriaRuleOptions.map((o) => ({ ...o })) };
    return {
      ...cloneCriteriaBuilderRows([roiSeed])[0]!,
      scoringWeightPercent: row.scoringWeightPercent,
    };
  });
}

function applyLegacyWeightMigration(rows: CriteriaBuilderRow[]): CriteriaBuilderRow[] {
  const top4 = rows.slice(0, 4);
  if (top4.length < 4) return rows;
  const top4Ids = top4.map((row) => row.id);
  const canonicalTop4 = ["cb-oo-financial", "cb-oo-strategic", "cb-oo-market-risk", ROI_CRITERION_ID];
  if (top4Ids.join("|") !== canonicalTop4.join("|")) return rows;
  const top4Weights = top4.map((row) => row.scoringWeightPercent.trim());
  if (top4Weights.join("|") !== LEGACY_TOP4_WEIGHT_SIGNATURE.join("|")) return rows;
  return rows.map((row, index) =>
    index < 4 ? { ...row, scoringWeightPercent: UPDATED_TOP4_WEIGHT_SIGNATURE[index]! } : row
  );
}

function mergeMissingSeedCriteriaRows(rows: CriteriaBuilderRow[]): CriteriaBuilderRow[] {
  const merged = cloneCriteriaBuilderRows(rows);
  const seenIds = new Set(merged.map((row) => row.id));
  for (const seedRow of OWNER_OPERATOR_CRITERIA_BUILDER_SEED) {
    if (seenIds.has(seedRow.id)) continue;
    merged.push(cloneCriteriaBuilderRows([seedRow])[0]!);
    seenIds.add(seedRow.id);
  }
  return merged;
}

export function readPersistedCriteriaBuilderRows(): CriteriaBuilderRow[] {
  if (typeof window === "undefined") {
    return cloneCriteriaBuilderRows(OWNER_OPERATOR_CRITERIA_BUILDER_SEED);
  }
  try {
    const raw = localStorage.getItem(CAPITAL_PLANNING_CRITERIA_BUILDER_STORAGE_KEY);
    if (!raw) return cloneCriteriaBuilderRows(OWNER_OPERATOR_CRITERIA_BUILDER_SEED);
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return cloneCriteriaBuilderRows(OWNER_OPERATOR_CRITERIA_BUILDER_SEED);
    const normalized = normalizeLegacyCriterionIds(parsed as CriteriaBuilderRow[]);
    const merged = mergeMissingSeedCriteriaRows(normalized);
    return applyLegacyWeightMigration(merged);
  } catch {
    return cloneCriteriaBuilderRows(OWNER_OPERATOR_CRITERIA_BUILDER_SEED);
  }
}

export function writePersistedCriteriaBuilderRows(rows: CriteriaBuilderRow[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CAPITAL_PLANNING_CRITERIA_BUILDER_STORAGE_KEY, JSON.stringify(rows));
    window.dispatchEvent(new CustomEvent(CAPITAL_PLANNING_CRITERIA_BUILDER_CHANGED_EVENT));
  } catch {
    /* ignore quota / private mode */
  }
}
