/**
 * RISK TAGS CONTEXT
 * Owns RiskTag[] state. Provides CRUD operations and lifecycle transitions.
 * Seed data is loaded from DataContext on mount.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { RiskTag, RiskTagStatus } from '@/types/health';
import { useData } from './DataContext';

interface RiskTagsContextValue {
  riskTags: RiskTag[];
  getRiskTagsForProject: (projectId: string) => RiskTag[];
  getRiskTagsForSource: (sourceId: string, sourceType: string) => RiskTag[];
  addRiskTag: (tag: RiskTag) => void;
  updateRiskTag: (id: string, updates: Partial<RiskTag>) => void;
  transitionStatus: (id: string, newStatus: RiskTagStatus) => void;
  removeRiskTag: (id: string) => void;
}

const RiskTagsContext = createContext<RiskTagsContextValue | null>(null);

export function RiskTagsProvider({ children }: { children: React.ReactNode }) {
  const { data } = useData();
  const [riskTags, setRiskTags] = useState<RiskTag[]>([]);

  useEffect(() => {
    if (data.riskTags.length > 0) {
      setRiskTags(data.riskTags);
    }
  }, [data.riskTags]);

  function getRiskTagsForProject(projectId: string): RiskTag[] {
    return riskTags.filter(t => t.projectId === projectId);
  }

  function getRiskTagsForSource(sourceId: string, sourceType: string): RiskTag[] {
    return riskTags.filter(t => t.sourceId === sourceId && t.sourceType === sourceType);
  }

  function addRiskTag(tag: RiskTag) {
    setRiskTags(prev => [...prev, tag]);
  }

  function updateRiskTag(id: string, updates: Partial<RiskTag>) {
    setRiskTags(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }

  function transitionStatus(id: string, newStatus: RiskTagStatus) {
    setRiskTags(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  }

  function removeRiskTag(id: string) {
    setRiskTags(prev => prev.filter(t => t.id !== id));
  }

  return (
    <RiskTagsContext.Provider value={{
      riskTags,
      getRiskTagsForProject,
      getRiskTagsForSource,
      addRiskTag,
      updateRiskTag,
      transitionStatus,
      removeRiskTag,
    }}>
      {children}
    </RiskTagsContext.Provider>
  );
}

export function useRiskTags(): RiskTagsContextValue {
  const ctx = useContext(RiskTagsContext);
  if (!ctx) throw new Error('useRiskTags must be used within RiskTagsProvider');
  return ctx;
}
