/**
 * HUB LOADING CONTEXT
 *
 * Global loading state for Hub cards. All cards subscribe to `isLoading`
 * and render their skeleton when true.
 *
 * - Simulates a 1.5s initial data-fetch on mount.
 * - `triggerReload()` re-enters the loading state for 1.5s (e.g. on Refresh).
 * - `LOADING_DURATION_MS` is exported so card-level overrides stay consistent.
 */

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

export const LOADING_DURATION_MS = 1500;

interface HubLoadingContextValue {
  isLoading: boolean;
  triggerReload: () => void;
}

const HubLoadingContext = createContext<HubLoadingContextValue>({
  isLoading: false,
  triggerReload: () => {},
});

export function HubLoadingProvider({ children }: { children: React.ReactNode }) {
  // Start false to avoid SSR/hydration mismatch; flip to true inside effect
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startLoading = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsLoading(true);
    timerRef.current = setTimeout(() => {
      setIsLoading(false);
      timerRef.current = null;
    }, LOADING_DURATION_MS);
  }, []);

  // Simulate initial page-load fetch once on mount
  useEffect(() => {
    startLoading();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const triggerReload = useCallback(() => {
    startLoading();
  }, [startLoading]);

  return (
    <HubLoadingContext.Provider value={{ isLoading, triggerReload }}>
      {children}
    </HubLoadingContext.Provider>
  );
}

export function useHubLoading(): HubLoadingContextValue {
  return useContext(HubLoadingContext);
}
