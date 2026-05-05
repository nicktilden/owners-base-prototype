/**
 * CONNECT DATA CONTEXT
 * Owns ConnectedProjectHealth[] state — pre-aggregated health data from GC Procore accounts.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ConnectedProjectHealth } from '@/types/health';
import { useData } from './DataContext';

interface ConnectDataContextValue {
  connectedProjects: ConnectedProjectHealth[];
  getConnectDataForProject: (ownerProjectId: string) => ConnectedProjectHealth | undefined;
}

const ConnectDataContext = createContext<ConnectDataContextValue | null>(null);

export function ConnectDataProvider({ children }: { children: React.ReactNode }) {
  const { data } = useData();
  const [connectedProjects, setConnectedProjects] = useState<ConnectedProjectHealth[]>([]);

  useEffect(() => {
    if (data.connectedProjects.length > 0) {
      setConnectedProjects(data.connectedProjects);
    }
  }, [data.connectedProjects]);

  function getConnectDataForProject(ownerProjectId: string): ConnectedProjectHealth | undefined {
    return connectedProjects.find(c => c.ownerProjectId === ownerProjectId);
  }

  return (
    <ConnectDataContext.Provider value={{ connectedProjects, getConnectDataForProject }}>
      {children}
    </ConnectDataContext.Provider>
  );
}

export function useConnectData(): ConnectDataContextValue {
  const ctx = useContext(ConnectDataContext);
  if (!ctx) throw new Error('useConnectData must be used within ConnectDataProvider');
  return ctx;
}
