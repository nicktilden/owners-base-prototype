/**
 * useLocalStorage
 * Generic hook that mirrors useState but persists the value in localStorage.
 *
 * Usage:
 *   const [projects, setProjects] = useLocalStorage<Project[]>('projects', []);
 *
 * - Keys are passed without the "owners_" prefix — the storage utility
 *   applies the prefix internally.
 * - SSR-safe: the lazy initializer runs only on the client.
 * - Returns [value, setValue] like useState.
 */

import { useState, useCallback } from 'react';
import { getItem, setItem } from '@/utils/storage';

export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    const persisted = getItem<T>(key);
    return persisted !== null ? persisted : defaultValue;
  });

  const setValue = useCallback(
    (value: T) => {
      setStoredValue(value);
      setItem(key, value);
    },
    [key]
  );

  return [storedValue, setValue];
}
