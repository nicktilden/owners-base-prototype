import React from "react";
import { Pill } from "@procore/core-react";
import type { ICellRendererParams } from "ag-grid-community";
import type { ProjectRow, ProjectPriority } from "@/data/projects";

const PRIORITY_COLOR: Record<ProjectPriority, React.ComponentProps<typeof Pill>["color"]> = {
  high:   "red",
  medium: "yellow",
  low:    "green",
};

const PRIORITY_LABEL: Record<ProjectPriority, string> = {
  high:   "High",
  medium: "Medium",
  low:    "Low",
};

export default function PriorityCellRenderer(params: ICellRendererParams<ProjectRow>) {
  const priority = params.data?.priority;
  if (!priority) return null;

  return (
    <Pill color={PRIORITY_COLOR[priority]}>
      {PRIORITY_LABEL[priority]}
    </Pill>
  );
}
