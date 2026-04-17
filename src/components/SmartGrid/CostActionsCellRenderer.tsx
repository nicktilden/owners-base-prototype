import React from "react";
import { Button } from "@procore/core-react";
import { Eye, Pencil } from "@procore/core-icons";
import type { ICellRendererParams } from "ag-grid-community";

export default function CostActionsCellRenderer(params: ICellRendererParams) {
  if (!params.data) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, height: "100%" }}>
      <Button
        variant="tertiary"
        className="b_tertiary"
        size="sm"
        icon={<Eye size="sm" />}
        aria-label="View"
        style={{ minWidth: 28, width: 28, height: 28, padding: 0 }}
      />
      <Button
        variant="tertiary"
        className="b_tertiary"
        size="sm"
        icon={<Pencil size="sm" />}
        aria-label="Edit"
        style={{ minWidth: 28, width: 28, height: 28, padding: 0 }}
      />
    </div>
  );
}
