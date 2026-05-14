/**
 * COMPANY TYPE CONTEXT
 * Manages the active industry vertical for the demo. Persists selection
 * in localStorage under 'owner_prototype_company_type'. On change, hard-reloads
 * the page so all seed data re-resolves from the new dataset.
 */

import React, { createContext, useContext, useMemo } from 'react';
import type { CompanyType, CompanyTypeConfig } from '@/types/companyType';
import { COMPANY_TYPE_CONFIGS } from '@/data/seed/companyTypes/registry';

const STORAGE_KEY = 'owner_prototype_company_type';
const DEFAULT_TYPE: CompanyType = 'healthcare';

function readActiveType(): CompanyType {
  if (typeof window === 'undefined') return DEFAULT_TYPE;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && stored in COMPANY_TYPE_CONFIGS) return stored as CompanyType;
  return DEFAULT_TYPE;
}

interface CompanyTypeContextValue {
  activeType: CompanyType;
  /** Writes to localStorage and hard-reloads to root. */
  setActiveType: (type: CompanyType) => void;
  config: CompanyTypeConfig;
}

const CompanyTypeContext = createContext<CompanyTypeContextValue | null>(null);

export function CompanyTypeProvider({ children }: { children: React.ReactNode }) {
  const activeType = readActiveType();
  const config = COMPANY_TYPE_CONFIGS[activeType];

  const setActiveType = (type: CompanyType) => {
    localStorage.setItem(STORAGE_KEY, type);
    window.location.href = '/';
  };

  const value = useMemo(
    () => ({ activeType, setActiveType, config }),
    [activeType]
  );

  return (
    <CompanyTypeContext.Provider value={value}>
      {children}
    </CompanyTypeContext.Provider>
  );
}

export function useCompanyType(): CompanyTypeContextValue {
  const ctx = useContext(CompanyTypeContext);
  if (!ctx) throw new Error('useCompanyType must be used within CompanyTypeProvider');
  return ctx;
}

/** Module-level helper for seed data resolution (called before React renders). */
export function getActiveCompanyType(): CompanyType {
  return readActiveType();
}
