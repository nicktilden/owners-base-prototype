/**
 * RISK TAGS CONTEXT
 * Owns RiskTag[] state. Provides CRUD operations and lifecycle transitions.
 * Seed data is loaded from DataContext on mount.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { RiskTag, RiskTagStatus } from '@/types/health';
import { useData } from './DataContext';
import { getItem, setItem } from '@/utils/storage';

const STORAGE_KEY = 'risk_tags';

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
    const saved = getItem<RiskTag[]>(STORAGE_KEY);
    if (saved && saved.length > 0) {
      setRiskTags(saved);
    } else if (data.riskTags.length > 0) {
      setRiskTags(data.riskTags);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getRiskTagsForProject = useCallback((projectId: string): RiskTag[] => {
    return riskTags.filter(t => t.projectId === projectId);
  }, [riskTags]);

  const getRiskTagsForSource = useCallback((sourceId: string, sourceType: string): RiskTag[] => {
    return riskTags.filter(t => t.sourceId === sourceId && t.sourceType === sourceType);
  }, [riskTags]);

  const addRiskTag = useCallback((tag: RiskTag) => {
    setRiskTags(prev => {
      const next = [...prev, tag];
      setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const updateRiskTag = useCallback((id: string, updates: Partial<RiskTag>) => {
    setRiskTags(prev => {
      const next = prev.map(t => t.id === id ? { ...t, ...updates } : t);
      setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const transitionStatus = useCallback((id: string, newStatus: RiskTagStatus) => {
    setRiskTags(prev => {
      const next = prev.map(t => t.id === id ? { ...t, status: newStatus } : t);
      setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const removeRiskTag = useCallback((id: string) => {
    setRiskTags(prev => {
      const next = prev.filter(t => t.id !== id);
      setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

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
