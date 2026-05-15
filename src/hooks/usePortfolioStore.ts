/**
 * usePortfolioStore
 * Application-level store that wraps DataContext seed data with localStorage
 * persistence. Projects, companies, and the active user ID are stored under
 * "owners_" prefixed keys and survive page refreshes until resetStore() is called.
 *
 * Relation to DataContext:
 * - DataContext holds all seed data (budget, schedule, tasks, etc.) and remains
 *   unchanged. This hook reads DataContext as the default baseline for its three
 *   entities, then persists any runtime changes to localStorage.
 *
 * Non-serializable values:
 * - User.avatar fields are imported image assets (StaticImageData objects). When
 *   users are serialized to localStorage the avatar becomes a URL string, which
 *   is fine — the resolved User objects served by currentUser still come from
 *   DataContext.users so avatars remain correct.
 * - Project.startDate / endDate are Date objects. They are serialized as ISO
 *   strings by JSON.stringify and deserialized back to strings. Consumers that
 *   need Date objects should call new Date(project.startDate).
 */

import { useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { resetAll, removeItem } from '@/utils/storage';
import { useData } from '@/context/DataContext';
import type { Project } from '@/types/project';
import type { User } from '@/types/user';
import type { OwnerCompany } from '@/types/ownerCompany';

const SEED_COMPANIES: OwnerCompany[] = [
  { id: 'acc-001', name: 'Trinity Health', logo: null },
];

// Default active user ID — matches activeUser.ts (user-009: Bridget O'Sullivan)
const DEFAULT_USER_ID = 'user-009';

export function usePortfolioStore() {
  const { data } = useData();

  // ── Projects ─────────────────────────────────────────────────────────────
  const [projects, setProjects] = useLocalStorage<Project[]>(
    'projects',
    data.projects
  );

  // ── Companies ─────────────────────────────────────────────────────────────
  const [companies, setCompanies] = useLocalStorage<OwnerCompany[]>(
    'companies',
    SEED_COMPANIES
  );

  // ── Current user (stored as ID only — full User resolved from DataContext) ──
  const [currentUserId, setCurrentUserId] = useLocalStorage<string>(
    'current_user_id',
    DEFAULT_USER_ID
  );

  const currentUser: User | null =
    data.users.find((u) => u.id === currentUserId) ??
    data.users.find((u) => u.id === DEFAULT_USER_ID) ??
    null;

  // ── Project mutations ─────────────────────────────────────────────────────

  const addProject = useCallback(
    (project: Project) => {
      setProjects([...projects, project]);
    },
    [projects, setProjects]
  );

  const updateProject = useCallback(
    (id: string, patch: Partial<Project>) => {
      setProjects(
        projects.map((p) => (p.id === id ? { ...p, ...patch } : p))
      );
    },
    [projects, setProjects]
  );

  const deleteProject = useCallback(
    (id: string) => {
      setProjects(projects.filter((p) => p.id !== id));
    },
    [projects, setProjects]
  );

  // ── Store reset ───────────────────────────────────────────────────────────

  const resetStore = useCallback(() => {
    resetAll();
    // resetAll() covers owners_* keys including: projects, companies, current_user_id,
    // risk_tags, kpi_scorecard, project_row_edits, project_favorites.
    // Re-seed the in-memory values that useLocalStorage mirrors from localStorage.
    setProjects(data.projects);
    setCompanies(SEED_COMPANIES);
    setCurrentUserId(DEFAULT_USER_ID);
  }, [data.projects, setProjects, setCompanies, setCurrentUserId]);

  return {
    projects,
    companies,
    currentUser,
    currentUserId,
    addProject,
    updateProject,
    deleteProject,
    setCurrentUserId,
    resetStore,
  };
}
