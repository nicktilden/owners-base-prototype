/**
 * STORAGE UTILITIES
 * Low-level localStorage helpers. All keys are namespaced with the
 * "owners_" prefix to avoid collisions with other apps and libraries.
 *
 * All functions are SSR-safe and wrapped in try/catch — localStorage
 * can throw in private browsing or when storage quota is exceeded.
 */

const PREFIX = 'owners_';

function prefixed(key: string): string {
  return `${PREFIX}${key}`;
}

export function getItem<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(prefixed(key));
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(prefixed(key), JSON.stringify(value));
  } catch {
    // Ignore storage errors (private browsing, quota exceeded).
  }
}

export function removeItem(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(prefixed(key));
  } catch {
    // noop
  }
}

/**
 * Removes all localStorage keys that start with the "owners_" prefix.
 * Does NOT touch unrelated keys (e.g. "procore-theme-preference",
 * "owners.projectFavorites.v1").
 */
export function resetAll(): void {
  if (typeof window === 'undefined') return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(PREFIX)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    // noop
  }
}
