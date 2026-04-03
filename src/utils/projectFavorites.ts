const STORAGE_KEY = "owners.projectFavorites.v1";

export type ProjectFavoriteMap = Record<string, boolean>;

export function readProjectFavorites(): ProjectFavoriteMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ProjectFavoriteMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function writeProjectFavorites(map: ProjectFavoriteMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage errors in prototype mode.
  }
}

export function favoriteKeyForSampleProject(id: number): string {
  return `sample:${id}`;
}

export function favoriteKeyForSeedProject(id: string): string {
  return `seed:${id}`;
}

export function getFavorite(map: ProjectFavoriteMap, key: string, fallback = false): boolean {
  return map[key] ?? fallback;
}
