import React, { createContext, useContext, useState, useCallback } from 'react';

interface HeaderActionsContextValue {
  headerActions: React.ReactNode;
  setHeaderActions: (node: React.ReactNode) => void;
  clearHeaderActions: () => void;
}

const HeaderActionsContext = createContext<HeaderActionsContextValue>({
  headerActions: null,
  setHeaderActions: () => {},
  clearHeaderActions: () => {},
});

export function HeaderActionsProvider({ children }: { children: React.ReactNode }) {
  const [headerActions, setHeaderActionsState] = useState<React.ReactNode>(null);

  const setHeaderActions = useCallback((node: React.ReactNode) => {
    setHeaderActionsState(node);
  }, []);

  const clearHeaderActions = useCallback(() => {
    setHeaderActionsState(null);
  }, []);

  return (
    <HeaderActionsContext.Provider value={{ headerActions, setHeaderActions, clearHeaderActions }}>
      {children}
    </HeaderActionsContext.Provider>
  );
}

export function useHeaderActions() {
  return useContext(HeaderActionsContext);
}
