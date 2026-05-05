const STORAGE_ENABLED = "capitalPlanning.lookBack.enabled";
const STORAGE_AMOUNT = "capitalPlanning.lookBack.amount";
const STORAGE_UNIT = "capitalPlanning.lookBack.unit";

export const CAPITAL_PLANNING_LOOK_BACK_SETTINGS_CHANGED_EVENT = "capitalPlanningLookBackSettingsChanged";

export type CapitalPlanningLookBackUnit = "months" | "quarters" | "years";

export const DEFAULT_CAPITAL_PLANNING_LOOK_BACK_ENABLED = true;
export const DEFAULT_CAPITAL_PLANNING_LOOK_BACK_AMOUNT = 12;
export const DEFAULT_CAPITAL_PLANNING_LOOK_BACK_UNIT: CapitalPlanningLookBackUnit = "months";

function dispatchChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CAPITAL_PLANNING_LOOK_BACK_SETTINGS_CHANGED_EVENT));
}

export function readCapitalPlanningLookBackEnabled(): boolean {
  if (typeof window === "undefined") return DEFAULT_CAPITAL_PLANNING_LOOK_BACK_ENABLED;
  try {
    const raw = window.localStorage.getItem(STORAGE_ENABLED);
    if (raw === null) return DEFAULT_CAPITAL_PLANNING_LOOK_BACK_ENABLED;
    if (raw === "true") return true;
    if (raw === "false") return false;
    return DEFAULT_CAPITAL_PLANNING_LOOK_BACK_ENABLED;
  } catch {
    return DEFAULT_CAPITAL_PLANNING_LOOK_BACK_ENABLED;
  }
}

export function writeCapitalPlanningLookBackEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_ENABLED, enabled ? "true" : "false");
    dispatchChanged();
  } catch {
    /* ignore */
  }
}

export function readCapitalPlanningLookBackAmount(): number {
  if (typeof window === "undefined") return DEFAULT_CAPITAL_PLANNING_LOOK_BACK_AMOUNT;
  try {
    const raw = window.localStorage.getItem(STORAGE_AMOUNT);
    if (raw === null) return DEFAULT_CAPITAL_PLANNING_LOOK_BACK_AMOUNT;
    const n = parseInt(raw, 10);
    if (!Number.isFinite(n)) return DEFAULT_CAPITAL_PLANNING_LOOK_BACK_AMOUNT;
    return clampAmount(n);
  } catch {
    return DEFAULT_CAPITAL_PLANNING_LOOK_BACK_AMOUNT;
  }
}

export function writeCapitalPlanningLookBackAmount(amount: number): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_AMOUNT, String(clampAmount(amount)));
    dispatchChanged();
  } catch {
    /* ignore */
  }
}

export function readCapitalPlanningLookBackUnit(): CapitalPlanningLookBackUnit {
  if (typeof window === "undefined") return DEFAULT_CAPITAL_PLANNING_LOOK_BACK_UNIT;
  try {
    const raw = window.localStorage.getItem(STORAGE_UNIT);
    if (raw === "months" || raw === "quarters" || raw === "years") return raw;
    return DEFAULT_CAPITAL_PLANNING_LOOK_BACK_UNIT;
  } catch {
    return DEFAULT_CAPITAL_PLANNING_LOOK_BACK_UNIT;
  }
}

export function writeCapitalPlanningLookBackUnit(unit: CapitalPlanningLookBackUnit): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_UNIT, unit);
    dispatchChanged();
  } catch {
    /* ignore */
  }
}

export function clampAmount(n: number): number {
  const x = Math.round(Number(n));
  if (!Number.isFinite(x)) return DEFAULT_CAPITAL_PLANNING_LOOK_BACK_AMOUNT;
  return Math.min(999, Math.max(1, x));
}
