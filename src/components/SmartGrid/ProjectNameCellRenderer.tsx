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
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {params.value}
      </span>
      {connection && <ConnectIconWithPopover connection={connection} />}
    </div>
  );
}
