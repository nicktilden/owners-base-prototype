import React from "react";
import type { ICellRendererParams } from "ag-grid-community";
import type { ProjectRow } from "@/data/projects";

export default function LocationCellRenderer(params: ICellRendererParams<ProjectRow>) {
  const row = params.data;
  if (!row) return null;

  const street = row.streetAddress;
  const cityLine = row.location; // "City, ST ZIP"

  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", lineHeight: 1.3, padding: "2px 0" }}>
      {street && (
        <span style={{ fontSize: 13, color: "var(--color-text-primary)", fontWeight: 500 }}>
          {street}
        </span>
      )}
      <span style={{ fontSize: 12, color: street ? "var(--color-text-secondary)" : "var(--color-text-primary)" }}>
        {cityLine}
      </span>
    </div>
  );
}
