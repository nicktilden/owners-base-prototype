import React from "react";
import { Button } from "@procore/core-react";
import { NotepadList, Comments, Pencil } from "@procore/core-icons";
import type { ICellRendererParams } from "ag-grid-community";
import type { ProjectRow } from "@/data/projects";
import type { PortfolioGridContext } from "@/components/SmartGrid/portfolioGridContext";

export default function ActionsCellRenderer(params: ICellRendererParams<ProjectRow, PortfolioGridContext>) {
  if (!params.data) return null;

  const onEdit = params.context?.onEditProject;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, height: "100%" }}>
      <Button
        variant="tertiary"
        className="b_tertiary"
        size="sm"
        icon={<NotepadList size="sm" />}
        aria-label="Notes"
        style={{ minWidth: 28, width: 28, height: 28, padding: 0 }}
      />
      <Button
        variant="tertiary"
        className="b_tertiary"
        size="sm"
        icon={<Comments size="sm" />}
        aria-label="Comments"
        style={{ minWidth: 28, width: 28, height: 28, padding: 0 }}
      />
      <Button
        variant="tertiary"
        className="b_tertiary"
        size="sm"
        icon={<Pencil size="sm" />}
        aria-label="Edit project details"
        style={{ minWidth: 28, width: 28, height: 28, padding: 0 }}
        onClick={() => onEdit?.(params.data!)}
      />
    </div>
  );
}
