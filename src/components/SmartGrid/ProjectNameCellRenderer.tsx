import React from "react";
import type { ICellRendererParams } from "ag-grid-community";
import type { ProjectRow } from "@/data/projects";
import { getProjectConnection } from "@/data/procoreConnect";
import { ConnectIconWithPopover } from "@/components/ConnectPopover";

export default function ProjectNameCellRenderer(params: ICellRendererParams<ProjectRow>) {
  if (!params.data) return null;
  const connection = getProjectConnection(params.data.id);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, height: "100%", overflow: "hidden" }}>
      <a
        href="#"
        onClick={(e) => e.preventDefault()}
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          color: "var(--color-text-link)",
          textDecoration: "underline",
          fontWeight: 500,
        }}
      >
        {params.value}
      </a>
      {connection && <ConnectIconWithPopover connection={connection} />}
    </div>
  );
}
