/**
 * LEVEL CONTEXT
 * Manages portfolio vs. project level state and the active project ID.
 * All navigation, tool visibility, and data scope depend on this context.
 */

import React, { createContext, useContext, useState } from 'react';

interface LevelContextValue {
  level: 'portfolio' | 'project';
  activeProjectId: string | null;
  setProject: (projectId: string) => void;
  clearProject: () => void;
}

const LevelContext = createContext<LevelContextValue | null>(null);

export function LevelProvider({ children }: { children: React.ReactNode }) {
  const [level, setLevel] = useState<'portfolio' | 'project'>('portfolio');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  function setProject(projectId: string) {
    setActiveProjectId(projectId);
    setLevel('project');
  }

  function clearProject() {
    setActiveProjectId(null);
    setLevel('portfolio');
  }

  return (
    <LevelContext.Provider value={{ level, activeProjectId, setProject, clearProject }}>
      {children}
    </LevelContext.Provider>
  );
}

export function useLevel(): LevelContextValue {
  const ctx = useContext(LevelContext);
  if (!ctx) throw new Error('useLevel must be used within LevelProvider');
  return ctx;
}
