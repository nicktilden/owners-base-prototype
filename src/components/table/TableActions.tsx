import React from "react";
import { Button } from "@procore/core-react";
import { Eye, Pencil, Star, NotepadList } from "@procore/core-icons";

const ACTIONS_WRAP_STYLE: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 8,
  minWidth: 110,
};

const BUTTON_STYLE: React.CSSProperties = {
  minWidth: 28,
  width: 28,
  height: 28,
  padding: 0,
};

export const PINNED_HEADER_CELL_STYLE: React.CSSProperties = {
  position: "sticky",
  right: 0,
  zIndex: 3,
  background: "#f4f5f6",
  borderLeft: "2px solid #d6dadc",
  boxShadow: "-8px 0 12px -10px rgba(35, 39, 41, 0.35)",
  paddingLeft: 16,
  paddingRight: 16,
};

export const PINNED_BODY_CELL_STYLE: React.CSSProperties = {
  position: "sticky",
  right: 0,
  zIndex: 2,
  background: "#fff",
  borderLeft: "2px solid #d6dadc",
  boxShadow: "-8px 0 12px -10px rgba(35, 39, 41, 0.25)",
  paddingLeft: 16,
  paddingRight: 16,
};

export function StandardRowActions() {
  return (
    <div style={ACTIONS_WRAP_STYLE}>
      <Button
        variant="tertiary"
        size="sm"
        icon={<Eye size="sm" />}
        aria-label="View"
        style={BUTTON_STYLE}
      />
      <Button
        variant="tertiary"
        size="sm"
        icon={<Pencil size="sm" />}
        aria-label="Edit"
        style={BUTTON_STYLE}
      />
    </div>
  );
}

export function ProjectRowActions() {
  return (
    <div style={ACTIONS_WRAP_STYLE}>
      <Button
        variant="tertiary"
        size="sm"
        icon={<Star size="sm" />}
        aria-label="Favorite"
        style={BUTTON_STYLE}
      />
      <Button
        variant="tertiary"
        size="sm"
        icon={<NotepadList size="sm" />}
        aria-label="Notes"
        style={BUTTON_STYLE}
      />
      <Button
        variant="tertiary"
        size="sm"
        icon={<Pencil size="sm" />}
        aria-label="Edit"
        style={BUTTON_STYLE}
      />
    </div>
  );
}
