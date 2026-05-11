/**
 * Capital Planning fiscal-year settings helpers.
 *
 * The fiscal year start month is stored in localStorage so it persists across
 * page refreshes and can be changed from the Configuration panel.  A custom
 * DOM event is dispatched whenever the value changes so that any mounted
 * component can re-render without a full page reload.
 */

const STORAGE_KEY = "capitalPlanning.fiscalYearStartMonth";

/** Custom event name dispatched on `window` when the fiscal-year start month changes. */
export const CAPITAL_PLANNING_FISCAL_SETTINGS_CHANGED_EVENT =
  "capitalPlanningFiscalSettingsChanged";

/**
 * Default fiscal year start month (0 = January).
 * Used as the initial value before any user customisation.
 */
export const DEFAULT_CAPITAL_PLANNING_FISCAL_YEAR_START_MONTH = 0;

/**
 * Read the persisted fiscal-year start month from localStorage.
 * Falls back to {@link DEFAULT_CAPITAL_PLANNING_FISCAL_YEAR_START_MONTH} if
 * the value is absent or invalid.
 */
export function readCapitalPlanningFiscalYearStartMonth(): number {
  if (typeof window === "undefined") {
    return DEFAULT_CAPITAL_PLANNING_FISCAL_YEAR_START_MONTH;
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === null) return DEFAULT_CAPITAL_PLANNING_FISCAL_YEAR_START_MONTH;
  const parsed = parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed < 0 || parsed > 11) {
    return DEFAULT_CAPITAL_PLANNING_FISCAL_YEAR_START_MONTH;
  }
  return parsed;
}

/**
 * Persist a new fiscal-year start month and notify all listeners.
 *
 * @param month - Calendar month index (0 = January … 11 = December).
 */
export function writeCapitalPlanningFiscalYearStartMonth(month: number): void {
  if (typeof window === "undefined") return;
  const clamped = Math.max(0, Math.min(11, Math.round(month)));
  window.localStorage.setItem(STORAGE_KEY, String(clamped));
  window.dispatchEvent(new Event(CAPITAL_PLANNING_FISCAL_SETTINGS_CHANGED_EVENT));
}
