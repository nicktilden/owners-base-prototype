import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { ReleaseFilter, ReleaseTimeframe, isReleaseFilter } from '@/types/features';

const STORAGE_KEY = 'procore-owner-prototype:horizon';
const URL_PARAM = 'view';

interface HorizonContextValue {
  filter: ReleaseFilter;
  setFilter: (f: ReleaseFilter) => void;
  isVisible: (timeframe?: ReleaseTimeframe) => boolean;
}

const HorizonContext = createContext<HorizonContextValue | undefined>(undefined);

export function HorizonProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [filter, setFilterState] = useState<ReleaseFilter>('now');

  // On mount: URL param wins, then sessionStorage, then default 'now'.
  useEffect(() => {
    let initial: ReleaseFilter | undefined;

    const urlValue = router.query[URL_PARAM];
    const urlString = Array.isArray(urlValue) ? urlValue[0] : urlValue;
    if (isReleaseFilter(urlString)) {
      initial = urlString;
      // Strip the param — one-shot override.
      const { [URL_PARAM]: _, ...rest } = router.query;
      router.replace(
        { pathname: router.pathname, query: rest },
        undefined,
        { shallow: true, scroll: false }
      );
    } else if (typeof window !== 'undefined') {
      const stored = window.sessionStorage.getItem(STORAGE_KEY);
      if (isReleaseFilter(stored)) initial = stored;
    }

    if (initial) setFilterState(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  const setFilter = useCallback((f: ReleaseFilter) => {
    setFilterState(f);
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(STORAGE_KEY, f);
    }
  }, []);

  const isVisible = useCallback(
    (timeframe?: ReleaseTimeframe) => {
      if (filter === 'all') return true;
      const order: ReleaseFilter[] = ['now', 'next', 'future'];
      const itemRank = order.indexOf(timeframe ?? 'now');
      const filterRank = order.indexOf(filter);
      return itemRank <= filterRank;
    },
    [filter]
  );

  return (
    <HorizonContext.Provider value={{ filter, setFilter, isVisible }}>
      {children}
    </HorizonContext.Provider>
  );
}

export function useHorizon(): HorizonContextValue {
  const ctx = useContext(HorizonContext);
  if (!ctx) throw new Error('useHorizon must be used within HorizonProvider');
  return ctx;
}
