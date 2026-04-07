/**
 * HUB FILTER CONTEXT
 * Shared filter state for all hub cards on a hub view (e.g. My Work, Cost Management).
 * Hub cards read this context to filter their project-scoped data.
 * Filters align with the ProjectRow type from @/data/projects.
 */

import React, { createContext, useContext, useMemo, useState } from 'react';
import { sampleProjectRows } from '@/data/projects';
import type { ProjectRow, ProjectStage, ProjectRegion } from '@/data/projects';

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

interface HubFilterContextValue {
  filters: HubFilterState;
  setFilters: React.Dispatch<React.SetStateAction<HubFilterState>>;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  /** All project rows filtered by the current hub filters */
  filteredProjectRows: ProjectRow[];
}

const HubFilterContext = createContext<HubFilterContextValue | null>(null);

export function HubFilterProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<HubFilterState>(EMPTY_HUB_FILTERS);
  const hasActiveFilters = Object.values(filters).some((arr) => arr.length > 0);

  const filteredProjectRows = useMemo(() => {
    let rows = sampleProjectRows;
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
  }, [filters]);

  function clearFilters() {
    setFilters(EMPTY_HUB_FILTERS);
  }

  return (
    <HubFilterContext.Provider value={{ filters, setFilters, clearFilters, hasActiveFilters, filteredProjectRows }}>
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

