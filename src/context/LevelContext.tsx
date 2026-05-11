/**
 * LEVEL CONTEXT
 * Manages portfolio vs. project level state and the active project ID.
 * Derives level from the router URL so the header/nav always reflect the
 * current route without requiring pages to call setProject/clearProject.
 * setProject/clearProject are kept for imperative navigation from components.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface LevelContextValue {
  level: 'portfolio' | 'project';
  activeProjectId: string | null;
  setProject: (projectId: string) => void;
  clearProject: () => void;
}

const LevelContext = createContext<LevelContextValue | null>(null);

export function LevelProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [level, setLevel] = useState<'portfolio' | 'project'>('portfolio');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  // Derive level from URL on every route change
  useEffect(() => {
    const syncFromPath = (url: string) => {
      const path = url.split('?')[0] ?? '';
      const match = path.match(/^\/project\/([^/]+)/);
      if (match?.[1]) {
        const rawId = match[1];
        // Normalise numeric IDs (e.g. "4" → "proj-004")
        const numeric = /^\d+$/.test(rawId) ? parseInt(rawId, 10) : null;
        const projectId = numeric !== null
          ? `proj-${String(numeric).padStart(3, '0')}`
          : rawId;
        setActiveProjectId(projectId);
        setLevel('project');
      } else {
        setActiveProjectId(null);
        setLevel('portfolio');
      }
    };

    // Sync on initial load
    syncFromPath(router.asPath);

    // Sync on every subsequent navigation
    router.events.on('routeChangeComplete', syncFromPath);
    return () => router.events.off('routeChangeComplete', syncFromPath);
  }, [router]);

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
