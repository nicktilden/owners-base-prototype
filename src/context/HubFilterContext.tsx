/**
 * HUB FILTER CONTEXT
 * Shared filter state for all hub cards on a hub view (e.g. My Work, Cost Management).
 * Hub cards read this context to filter their project-scoped data.
 * Filters align with the ProjectRow type from @/data/projects.
 */

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { parseLocationCityState, sampleProjectRows } from '@/data/projects';
import { projects as seedProjects } from '@/data/seed/projects';
import type { ProjectRow, ProjectStage, ProjectRegion } from '@/data/projects';
import type { Project } from '@/types/project';
import type { ProjectStage as SeedProjectStage, ProjectRegion as SeedProjectRegion } from '@/types/project';

export interface HubFilterState {
  /** Stage filter — maps to ProjectStage values from data/projects */
  stage: ProjectStage[];
  /** Program filter — program names (e.g. "Data Center", "Retail") */
  program: string[];
  /** Region filter — geographic region names */
  region: ProjectRegion[];
  /** Project Manager filter — full names */
  projectManager: string[];
}

export const EMPTY_HUB_FILTERS: HubFilterState = {
  stage: [],
  program: [],
  region: [],
  projectManager: [],
};

// Maps display-name stages (hub filter) → machine-name stages (seed projects)
const STAGE_DISPLAY_TO_SEED: Record<string, SeedProjectStage> = {
  "Conceptual": "conceptual",
  "Feasibility": "feasibility",
  "Final design": "final_design",
  "Permitting": "permitting",
  "Bidding": "bidding",
  "Pre-Construction": "Pre-Construction",
  "Course of Construction": "course_of_construction",
  "Post-Construction": "Post-Construction",
  "Handover": "handover",
  "Closeout": "closeout",
  "Maintenance": "maintenance",
};

// Maps hub-filter region labels → seed project region values they should match
const REGION_DISPLAY_TO_SEED: Record<string, SeedProjectRegion[]> = {
  "Mid-Atlantic": ["Northeast"],
  "Northeast": ["Northeast"],
  "Midwest": ["Midwest"],
  "Southeast": ["South"],
  "Southwest": ["West", "Southwest"],
};

interface HubFilterContextValue {
  filters: HubFilterState;
  setFilters: React.Dispatch<React.SetStateAction<HubFilterState>>;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  /** All project rows filtered by the current hub filters */
  filteredProjectRows: ProjectRow[];
  /** Seed projects filtered by the current hub filters (stage + region) */
  filteredSeedProjects: Project[];
  /** Merge edits from the project details tearsheet (and future editors) into hub rows */
  patchProjectRow: (id: number, patch: Partial<ProjectRow>) => void;
}

const HubFilterContext = createContext<HubFilterContextValue | null>(null);

export function HubFilterProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<HubFilterState>(EMPTY_HUB_FILTERS);
  const [projectRowEdits, setProjectRowEdits] = useState<Record<number, Partial<ProjectRow>>>({});
  const hasActiveFilters = Object.values(filters).some((arr) => arr.length > 0);

  const projectRowsWithEdits = useMemo(
    () => sampleProjectRows.map((r) => ({ ...r, ...projectRowEdits[r.id] })),
    [projectRowEdits]
  );

  const patchProjectRow = useCallback((id: number, patch: Partial<ProjectRow>) => {
    setProjectRowEdits((prev) => {
      const merged: Partial<ProjectRow> = { ...prev[id], ...patch };
      if (patch.location !== undefined) {
        const { city, state } = parseLocationCityState(patch.location);
        merged.city = city;
        merged.state = state;
      }
      return { ...prev, [id]: merged };
    });
  }, []);

  const filteredProjectRows = useMemo(() => {
    let rows = projectRowsWithEdits;
    if (filters.stage.length > 0) {
      rows = rows.filter((p) => filters.stage.includes(p.stage));
    }
    if (filters.program.length > 0) {
      rows = rows.filter((p) => filters.program.includes(p.program));
    }
    if (filters.region.length > 0) {
      rows = rows.filter((p) => filters.region.includes(p.region));
    }
    if (filters.projectManager.length > 0) {
      rows = rows.filter((p) => filters.projectManager.includes(p.projectManager));
    }
    return rows;
  }, [filters, projectRowsWithEdits]);

  const filteredSeedProjects = useMemo(() => {
    let projects = seedProjects;
    if (filters.stage.length > 0) {
      const seedStages = new Set(
        filters.stage.map((s) => STAGE_DISPLAY_TO_SEED[s]).filter(Boolean)
      );
      projects = projects.filter((p) => seedStages.has(p.stage));
    }
    if (filters.region.length > 0) {
      const seedRegions = new Set(
        filters.region.flatMap((r) => REGION_DISPLAY_TO_SEED[r] ?? [])
      );
      projects = projects.filter((p) => seedRegions.has(p.region));
    }
    return projects;
  }, [filters]);

  function clearFilters() {
    setFilters(EMPTY_HUB_FILTERS);
  }

  return (
    <HubFilterContext.Provider value={{ filters, setFilters, clearFilters, hasActiveFilters, filteredProjectRows, filteredSeedProjects, patchProjectRow }}>
      {children}
    </HubFilterContext.Provider>
  );
}

export function useHubFilters(): HubFilterContextValue {
  const ctx = useContext(HubFilterContext);
  if (!ctx) throw new Error('useHubFilters must be used within HubFilterProvider');
  return ctx;
}

/**
 * Helper: toggle a value in/out of an array filter field.
 */
export function toggleFilterValue<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

