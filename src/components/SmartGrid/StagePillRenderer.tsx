import React from "react";
import { Pill } from "@procore/core-react";
import type { ICellRendererParams } from "ag-grid-community";

type PillColor = "blue" | "cyan" | "gray" | "green" | "magenta" | "red" | "UNSAFE_orange" | "yellow";

const STAGE_COLORS: Record<string, PillColor> = {
  Conceptual: "gray",
  Feasibility: "cyan",
  "Final design": "blue",
  Permitting: "yellow",
  Bidding: "UNSAFE_orange",
  "Pre-Construction": "magenta",
  "Course of Construction": "green",
  "Post-Construction": "cyan",
  Handover: "blue",
  Closeout: "gray",
  Maintenance: "gray",
};

export default function StagePillRenderer(params: ICellRendererParams) {
  const value = params.value as string | undefined;
  if (!value) return null;

  const color = STAGE_COLORS[value] ?? "gray";

  return <Pill color={color}>{value}</Pill>;
}
