/** Shape needed to score a row (matches {@link CapitalPlanningCriteriaGridColumn} scoring fields). */
export type PrioritizationScoreCriterionColumn = {
  criterionId: string;
  inputType: "number" | "dropdown" | "rating_scale";
  scoringWeightPercent: number;
  selectOptions: { optionId: string; scoreValue: number }[];
};

/**
 * Additive 0–100 prioritization score from Criteria Builder weights and responses.
 *
 * Each answered criterion with a positive weight contributes `weightPercent × unit`, where `unit`
 * is the response on a 0–1 scale (option `scoreValue` 0–10 → unit = score/10; number inputs same).
 * Unanswered criteria contribute nothing; the total rises as the user fills more criteria.
 * Result is capped at 100 (e.g. if weights sum above 100).
 */
export function computePrioritizationScorePercent(
  columns: readonly PrioritizationScoreCriterionColumn[] | undefined,
  valuesByCriterionId: Record<string, string>
): number | null {
  if (!columns?.length) return null;

  let total = 0;
  let hasContribution = false;

  for (const col of columns) {
    const w =
      typeof col.scoringWeightPercent === "number" &&
      Number.isFinite(col.scoringWeightPercent) &&
      col.scoringWeightPercent > 0
        ? col.scoringWeightPercent
        : 0;
    if (w <= 0) continue;

    const raw = valuesByCriterionId[col.criterionId] ?? "";
    let unit: number | null = null;

    if (col.inputType === "number") {
      if (raw.trim() === "") continue;
      const n = parseFloat(raw);
      if (!Number.isFinite(n)) continue;
      if (n >= 0 && n <= 10) unit = n / 10;
      else unit = Math.max(0, Math.min(1, n / 100));
    } else {
      if (!raw || !col.selectOptions.length) continue;
      const opt = col.selectOptions.find((o) => o.optionId === raw);
      if (!opt) continue;
      unit = Math.max(0, Math.min(1, (Number(opt.scoreValue) || 0) / 10));
    }

    if (unit === null) continue;
    hasContribution = true;
    total += w * unit;
  }

  if (!hasContribution) return null;
  return Math.round(Math.min(100, total));
}

export function formatPrioritizationScorePercent(score: number | null): string {
  if (score === null) return "—";
  return `${score}%`;
}
