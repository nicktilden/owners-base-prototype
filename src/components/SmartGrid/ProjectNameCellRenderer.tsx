import React from "react";
import type { ICellRendererParams } from "ag-grid-community";
import type { ProjectRow } from "@/data/projects";
import { useConnection } from "@/context/ConnectionContext";
import { Connect } from "@procore/core-icons";
import type { PortfolioGridContext } from "./portfolioGridContext";

export default function ProjectNameCellRenderer(params: ICellRendererParams<ProjectRow, unknown, PortfolioGridContext>) {
  const { isConnected } = useConnection();
  if (!params.data) return null;
  const connected = isConnected(params.data.id);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, height: "100%", overflow: "hidden" }}>
      <a
        href={`/project/${params.data.id}`}
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          color: "var(--color-text-link)",
          textDecoration: "underline",
          fontWeight: 500,
        }}
      >
        {String(params.value ?? "")}
      </a>
      {connected && (
        <button
          onClick={(e) => { e.stopPropagation(); params.context?.onOpenConnectionTab?.(params.data!); }}
          aria-label="View connection details"
          title="View connection in project details"
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            background: "none", border: "none", cursor: "pointer", padding: 2,
            borderRadius: 4, color: "#ff5200", flexShrink: 0,
          }}
        >
          <Connect size="sm" />
        </button>
      )}
    </div>
  );
}
