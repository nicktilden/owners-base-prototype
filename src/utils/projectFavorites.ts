import { getItem, setItem } from "@/utils/storage";

// Key under owners_ prefix so resetAll() covers it.
const FAVORITES_KEY = "project_favorites";

// Migrate any data from the legacy key on first read.
function migrateFromLegacy(): ProjectFavoriteMap | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("owners.projectFavorites.v1");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProjectFavoriteMap;
    if (parsed && typeof parsed === "object") {
      setItem(FAVORITES_KEY, parsed);
      window.localStorage.removeItem("owners.projectFavorites.v1");
      return parsed;
    }
  } catch {
    // noop
  }
  return null;
}

export type ProjectFavoriteMap = Record<string, boolean>;

export function readProjectFavorites(): ProjectFavoriteMap {
  const saved = getItem<ProjectFavoriteMap>(FAVORITES_KEY);
  if (saved) return saved;
  const migrated = migrateFromLegacy();
  return migrated ?? {};
}

export function writeProjectFavorites(map: ProjectFavoriteMap): void {
  setItem(FAVORITES_KEY, map);
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
