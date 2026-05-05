const STORAGE_KEY = "capitalPlanning.fiscalYearStartMonth";

/** Dispatched on same-tab updates (storage event only fires across tabs). */
export const CAPITAL_PLANNING_FISCAL_SETTINGS_CHANGED_EVENT = "capitalPlanningFiscalSettingsChanged";

/** 0 = January … 11 = December. Matches Capital Planning Settings default (April). */
export const DEFAULT_CAPITAL_PLANNING_FISCAL_YEAR_START_MONTH = 3;

export function readCapitalPlanningFiscalYearStartMonth(): number {
  if (typeof window === "undefined") return DEFAULT_CAPITAL_PLANNING_FISCAL_YEAR_START_MONTH;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return DEFAULT_CAPITAL_PLANNING_FISCAL_YEAR_START_MONTH;
    const n = parseInt(raw, 10);
    if (!Number.isFinite(n) || n < 0 || n > 11) return DEFAULT_CAPITAL_PLANNING_FISCAL_YEAR_START_MONTH;
    return n;
  } catch {
    return DEFAULT_CAPITAL_PLANNING_FISCAL_YEAR_START_MONTH;
  }
}

export function writeCapitalPlanningFiscalYearStartMonth(month: number): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(month));
    window.dispatchEvent(new CustomEvent(CAPITAL_PLANNING_FISCAL_SETTINGS_CHANGED_EVENT));
  } catch {
    /* ignore quota / private mode */
  }
}
