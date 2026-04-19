import type { ProjectRow } from "@/data/projects";

/** Passed to AG Grid via `context` for portfolio (Projects hub) cell renderers. */
export interface PortfolioGridContext {
  onEditProject?: (row: ProjectRow) => void;
  /** Open the project tearsheet directly on the Connection tab. */
  onOpenConnectionTab?: (row: ProjectRow) => void;
}
