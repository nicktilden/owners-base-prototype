/**
 * MANUAL RISK ITEMS CONTEXT
 * Owns ManualRiskItem[] state — the escape hatch for risks without source objects.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ManualRiskItem, RiskTagStatus } from '@/types/health';
import { useData } from './DataContext';

interface ManualRiskItemsContextValue {
  manualRiskItems: ManualRiskItem[];
  getManualRiskItemsForProject: (projectId: string) => ManualRiskItem[];
  addManualRiskItem: (item: ManualRiskItem) => void;
  updateManualRiskItem: (id: string, updates: Partial<ManualRiskItem>) => void;
  transitionStatus: (id: string, newStatus: RiskTagStatus) => void;
  removeManualRiskItem: (id: string) => void;
}

const ManualRiskItemsContext = createContext<ManualRiskItemsContextValue | null>(null);

export function ManualRiskItemsProvider({ children }: { children: React.ReactNode }) {
  const { data } = useData();
  const [manualRiskItems, setManualRiskItems] = useState<ManualRiskItem[]>([]);

  useEffect(() => {
    if (data.manualRiskItems.length > 0) {
      setManualRiskItems(data.manualRiskItems);
    }
  }, [data.manualRiskItems]);

  const getManualRiskItemsForProject = useCallback((projectId: string): ManualRiskItem[] => {
    return manualRiskItems.filter(m => m.projectId === projectId);
  }, [manualRiskItems]);

  const addManualRiskItem = useCallback((item: ManualRiskItem) => {
    setManualRiskItems(prev => [...prev, item]);
  }, []);

  const updateManualRiskItem = useCallback((id: string, updates: Partial<ManualRiskItem>) => {
    setManualRiskItems(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  }, []);

  const transitionStatus = useCallback((id: string, newStatus: RiskTagStatus) => {
    setManualRiskItems(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
  }, []);

  const removeManualRiskItem = useCallback((id: string) => {
    setManualRiskItems(prev => prev.filter(m => m.id !== id));
  }, []);

  return (
    <ManualRiskItemsContext.Provider value={{
      manualRiskItems,
      getManualRiskItemsForProject,
      addManualRiskItem,
      updateManualRiskItem,
      transitionStatus,
      removeManualRiskItem,
    }}>
      {children}
    </ManualRiskItemsContext.Provider>
  );
}

export function useManualRiskItems(): ManualRiskItemsContextValue {
  const ctx = useContext(ManualRiskItemsContext);
  if (!ctx) throw new Error('useManualRiskItems must be used within ManualRiskItemsProvider');
  return ctx;
}
