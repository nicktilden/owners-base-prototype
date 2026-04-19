import React from "react";
import type { ICellRendererParams } from "ag-grid-community";
import type { ProjectRow } from "@/data/projects";
import { getProjectConnection } from "@/data/procoreConnect";
import { useConnection } from "@/context/ConnectionContext";
import { Connect } from "@procore/core-icons";
import type { PortfolioGridContext } from "./portfolioGridContext";

export default function ConnectCellRenderer(params: ICellRendererParams<ProjectRow, unknown, PortfolioGridContext>) {
  const { isConnected } = useConnection();
  if (!params.data) return null;
  if (!isConnected(params.data.id)) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
      <button
        onClick={(e) => { e.stopPropagation(); params.context?.onOpenConnectionTab?.(params.data!); }}
        aria-label="View connection details"
        title="View connection in project details"
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          background: "none", border: "none", cursor: "pointer", padding: 2,
          borderRadius: 4, color: "#ff5200",
        }}
      >
        <Connect size="sm" />
      </button>
    </div>
  );
}
