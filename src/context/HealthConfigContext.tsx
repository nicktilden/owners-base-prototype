/**
 * HEALTH CONFIG CONTEXT
 * Owns AccountHealthConfig state and exposes setThreshold so changes
 * propagate correctly to all engine consumers (portfolio, project, settings).
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AccountHealthConfig, KPIKey, KPIThreshold } from '@/types/health';
import { useData } from './DataContext';

interface HealthConfigContextValue {
  healthConfig: AccountHealthConfig | null;
  setThreshold: (key: KPIKey, threshold: KPIThreshold) => void;
  setKpiWeight: (key: KPIKey, weight: number) => void;
}

const HealthConfigContext = createContext<HealthConfigContextValue | null>(null);

export function HealthConfigProvider({ children }: { children: React.ReactNode }) {
  const { data } = useData();
  const [healthConfig, setHealthConfig] = useState<AccountHealthConfig | null>(null);

  useEffect(() => {
    if (data.account?.healthConfig) {
      setHealthConfig(data.account.healthConfig);
    }
  }, [data.account]);

  function setThreshold(key: KPIKey, threshold: KPIThreshold) {
    setHealthConfig(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        thresholds: { ...prev.thresholds, [key]: threshold },
      };
    });
  }

  function setKpiWeight(key: KPIKey, weight: number) {
    setHealthConfig(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        kpiWeights: { ...prev.kpiWeights, [key]: weight },
      };
    });
  }

  return (
    <HealthConfigContext.Provider value={{ healthConfig, setThreshold, setKpiWeight }}>
      {children}
    </HealthConfigContext.Provider>
  );
}

export function useHealthConfig(): HealthConfigContextValue {
  const ctx = useContext(HealthConfigContext);
  if (!ctx) throw new Error('useHealthConfig must be used within HealthConfigProvider');
  return ctx;
}
