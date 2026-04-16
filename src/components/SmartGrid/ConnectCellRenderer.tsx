import React from "react";
import type { ICellRendererParams } from "ag-grid-community";
import type { ProjectRow } from "@/data/projects";
import { getProjectConnection } from "@/data/procoreConnect";
import { ConnectIconWithPopover } from "@/components/ConnectPopover";

export default function ConnectCellRenderer(params: ICellRendererParams<ProjectRow>) {
  if (!params.data) return null;
  const connection = getProjectConnection(params.data.id);
  if (!connection) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
      <ConnectIconWithPopover connection={connection} />
    </div>
  );
}
