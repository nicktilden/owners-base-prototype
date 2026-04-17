/**
 * AI PANEL CONTEXT
 * Global state for the sliding AI chat panel.
 * Any component can open/close the panel and optionally pass contextual data.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ActionCardType, ActionRole } from '@/types/actions';

export interface AiPanelContextData {
  itemName?: string;
  itemId?: string;
  pills?: Array<{ label: string; color?: string }>;
  aiSummary?: string;
  cardType?: ActionCardType;
  userRoles?: ActionRole[];
  /** Numeric project ID for looking up milestone data */
  projectId?: number;
}

interface AiPanelState {
  open: boolean;
  context: AiPanelContextData | null;
  openPanel: (ctx?: AiPanelContextData) => void;
  closePanel: () => void;
}

const AiPanelCtx = createContext<AiPanelState>({
  open: false,
  context: null,
  openPanel: () => {},
  closePanel: () => {},
});

export function AiPanelProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState<AiPanelContextData | null>(null);

  const openPanel = useCallback((ctx?: AiPanelContextData) => {
    setContext(ctx ? { ...ctx } : null);
    setOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <AiPanelCtx.Provider value={{ open, context, openPanel, closePanel }}>
      {children}
    </AiPanelCtx.Provider>
  );
}

export const useAiPanel = () => useContext(AiPanelCtx);
