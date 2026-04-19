import React from "react";
import type { ICellRendererParams } from "ag-grid-community";
import type { ProjectRow, ProjectPriority } from "@/data/projects";

const PRIORITY_STYLES: Record<ProjectPriority, { background: string; color: string; label: string }> = {
  high:   { background: "#fdecea", color: "#b71c1c", label: "High"   },
  medium: { background: "#fff8e1", color: "#7b4f00", label: "Medium" },
  low:    { background: "#f1f8e9", color: "#33691e", label: "Low"    },
};

export default function PriorityCellRenderer(params: ICellRendererParams<ProjectRow>) {
  const priority = params.data?.priority;
  if (!priority) return null;

  const style = PRIORITY_STYLES[priority];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 10,
        fontSize: 12,
        fontWeight: 600,
        background: style.background,
        color: style.color,
        lineHeight: "18px",
      }}
    >
      {style.label}
    </span>
  );
}
