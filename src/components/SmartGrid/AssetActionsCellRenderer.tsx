import React from "react";
import { Button } from "@procore/core-react";
import { Paperclip, EllipsisVertical } from "@procore/core-icons";
import type { ICellRendererParams } from "ag-grid-community";

export default function AssetActionsCellRenderer(params: ICellRendererParams) {
  if (!params.data) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, height: "100%" }}>
      <Button
        variant="tertiary"
        className="b_tertiary"
        size="sm"
        icon={<Paperclip size="sm" />}
        aria-label="Attachments"
        style={{ minWidth: 28, width: 28, height: 28, padding: 0 }}
      />
      <Button
        variant="tertiary"
        className="b_tertiary"
        size="sm"
        icon={<EllipsisVertical size="sm" />}
        aria-label="More actions"
        style={{ minWidth: 28, width: 28, height: 28, padding: 0 }}
      />
    </div>
  );
}
