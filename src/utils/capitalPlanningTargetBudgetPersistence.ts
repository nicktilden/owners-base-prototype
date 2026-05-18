export const CAPITAL_PLANNING_TARGET_BUDGET_OVERRIDES_STORAGE_KEY =
  "owner-prototype-capital-planning-target-budget-overrides";

export const CAPITAL_PLANNING_TARGET_BUDGET_OVERRIDES_CHANGED_EVENT =
  "capital-planning:target-budget-overrides-changed";

export function readPersistedTargetBudgetForecastOverrides(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(CAPITAL_PLANNING_TARGET_BUDGET_OVERRIDES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

export function writePersistedTargetBudgetForecastOverrides(overrides: Record<string, number>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      CAPITAL_PLANNING_TARGET_BUDGET_OVERRIDES_STORAGE_KEY,
      JSON.stringify(overrides)
    );
    window.dispatchEvent(new Event(CAPITAL_PLANNING_TARGET_BUDGET_OVERRIDES_CHANGED_EVENT));
  } catch {
    // no-op in prototype mode
  }
}
