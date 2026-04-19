/**
 * CONNECTION CONTEXT
 * Wraps the static PROJECT_CONNECTIONS seed data with mutable React state so
 * new connections created via the setup wizard are immediately reflected in the
 * portfolio table and project tearsheet.
 *
 * Design principles:
 * - `getConnection` / `isConnected` are the only read paths — all consumers go
 *   through here, never import PROJECT_CONNECTIONS directly.
 * - `addConnection` / `removeConnection` are the only write paths — the setup
 *   wizard calls addConnection, which can later be swapped for an API call
 *   without touching any UI code.
 */

import React, { createContext, useCallback, useContext, useState } from "react";
import { PROJECT_CONNECTIONS } from "@/data/procoreConnect";
import type { ProjectConnection } from "@/data/procoreConnect";

interface ConnectionContextValue {
  /** Returns the active GC connection for this project, or undefined. */
  getConnection: (projectId: number) => ProjectConnection | undefined;
  /** True if the project has an active GC connection. */
  isConnected: (projectId: number) => boolean;
  /** Persist a new connection (from the setup wizard). */
  addConnection: (conn: ProjectConnection) => void;
  /** Remove a connection (future disconnect flow). */
  removeConnection: (projectId: number) => void;
}

const ConnectionContext = createContext<ConnectionContextValue | null>(null);

export function ConnectionProvider({ children }: { children: React.ReactNode }) {
  const [connectionMap, setConnectionMap] = useState<Map<number, ProjectConnection>>(
    () => new Map(PROJECT_CONNECTIONS.map((c) => [c.localProjectId, c]))
  );

  const getConnection = useCallback(
    (projectId: number) => connectionMap.get(projectId),
    [connectionMap]
  );

  const isConnected = useCallback(
    (projectId: number) => connectionMap.has(projectId),
    [connectionMap]
  );

  const addConnection = useCallback((conn: ProjectConnection) => {
    setConnectionMap((prev) => new Map(prev).set(conn.localProjectId, conn));
  }, []);

  const removeConnection = useCallback((projectId: number) => {
    setConnectionMap((prev) => {
      const next = new Map(prev);
      next.delete(projectId);
      return next;
    });
  }, []);

  return (
    <ConnectionContext.Provider value={{ getConnection, isConnected, addConnection, removeConnection }}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection(): ConnectionContextValue {
  const ctx = useContext(ConnectionContext);
  if (!ctx) throw new Error("useConnection must be used within ConnectionProvider");
  return ctx;
}
