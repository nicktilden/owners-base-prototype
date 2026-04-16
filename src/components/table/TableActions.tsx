import React from "react";
import { Button } from "@procore/core-react";
import { Eye, Pencil, Star, StarOff, NotepadList } from "@procore/core-icons";

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
  background: "#f5f6f7",
  paddingLeft: 16,
  paddingRight: 16,
  zIndex: 2,
  borderLeft: "1px solid #d6dadc",
  boxShadow: "-2px 0 4px rgba(0,0,0,0.06)",
};

export const PINNED_BODY_CELL_STYLE: React.CSSProperties = {
  position: "sticky",
  right: 0,
  background: "#F4F5F6",
  paddingLeft: 16,
  paddingRight: 16,
  zIndex: 1,
  borderLeft: "1px solid #e0e4e7",
  boxShadow: "-2px 0 4px rgba(0,0,0,0.06)",
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

export function ProjectRowActions({
  isFavorite,
  onToggleFavorite,
}: {
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  return (
    <div style={ACTIONS_WRAP_STYLE}>
      <Button
        variant="tertiary"
        size="sm"
        icon={isFavorite ? <Star size="sm" /> : <StarOff size="sm" />}
        aria-label={isFavorite ? "Unfavorite" : "Favorite"}
        style={BUTTON_STYLE}
        onClick={onToggleFavorite}
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
