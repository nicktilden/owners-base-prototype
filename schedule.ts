import type { ToolLevel, ToolCoreActions, ToolSubPages } from './index';
import type { WBSCostCode } from '../shared';

/**
 * SCHEDULE
 * A Gantt chart-based scheduling tool available at both portfolio and project levels.
 * Displays schedule items (duration-based) and milestones (single date) on a timeline.
 * Portfolio level aggregates schedule data across all projects.
 * Items support predecessor/successor dependencies.
 */

// =============================================================================
// SCHEDULE ITEM
// =============================================================================

/**
 * SCHEDULE ITEM
 * A duration-based task on the Gantt chart with a start and end date.
 * Duration and variance are calculated fields, not stored directly.
 *
 * duration        = finishDate - startDate (in days)
 * actualDuration  = actualFinishDate - actualStartDate (in days)
 * variance        = actualDuration - duration (in days; positive = behind, negative = ahead)
 */
interface ScheduleItem {
  id: string;                        // Unique identifier
  accountId: string;                 // Account this item belongs to
  projectId: string;                 // Project this item belongs to
  type: 'item';                      // Discriminant — distinguishes from Milestone
  name: string;                      // Item name, typically associated with a set of work
  percentComplete: number;           // Progress percentage (0–100)
  status: ScheduleStatus;            // not_started | in_progress | complete | on_hold | delayed
  startDate: Date;                   // Baseline start date
  actualStartDate: Date | null;      // Actual start date once work begins
  finishDate: Date;                  // Baseline finish date
  actualFinishDate: Date | null;     // Actual finish date once work is complete
  // Calculated fields (derived, not stored):
  // duration        = finishDate - startDate (days)
  // actualDuration  = actualFinishDate - actualStartDate (days)
  // variance        = actualDuration - duration (days)
  wbs: WBSCostCode['code'];          // Cost Code reference — Schedule only uses Cost Codes
  predecessors: ScheduleLink[];      // Items that must complete before this one starts
  successors: ScheduleLink[];        // Items that start after this one completes
  assignees: string[];               // User IDs assigned to this item
  createdBy: string;                 // User ID of the creator
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// MILESTONE
// =============================================================================

/**
 * MILESTONE
 * A single point-in-time marker on the Gantt chart.
 * Represents a key event, deadline, or deliverable — no duration.
 *
 * variance = actualMilestoneDate - milestoneDate (in days; positive = late, negative = early)
 */
interface Milestone {
  id: string;                        // Unique identifier
  accountId: string;                 // Account this milestone belongs to
  projectId: string;                 // Project this milestone belongs to
  type: 'milestone';                 // Discriminant — distinguishes from ScheduleItem
  name: string;                      // Milestone name
  milestoneDate: Date;               // Baseline target date
  actualMilestoneDate: Date | null;  // Actual date achieved
  // Calculated field (derived, not stored):
  // variance = actualMilestoneDate - milestoneDate (days)
  wbs: WBSCostCode['code'];          // Cost Code reference — Schedule only uses Cost Codes
  predecessors: ScheduleLink[];      // Items that must complete before this milestone
  successors: ScheduleLink[];        // Items that start after this milestone is reached
  assignees: string[];               // User IDs responsible for this milestone
  createdBy: string;                 // User ID of the creator
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// SCHEDULE LINK
// =============================================================================

/**
 * SCHEDULE LINK
 * Defines a dependency relationship between two schedule entries.
 */
interface ScheduleLink {
  targetId: string;                  // ID of the linked ScheduleItem or Milestone
  targetType: 'item' | 'milestone';  // Type of the linked entry
  linkType: ScheduleLinkType;        // Nature of the dependency
  lagDays: number;                   // Lag in days (positive = delay, negative = overlap)
}

/**
 * SCHEDULE LINK TYPE
 * Standard Gantt dependency types.
 *
 * FS — Finish-to-Start:  successor starts after predecessor finishes (most common)
 * SS — Start-to-Start:   successor starts when predecessor starts
 * FF — Finish-to-Finish: successor finishes when predecessor finishes
 * SF — Start-to-Finish:  successor finishes when predecessor starts (rare)
 */
type ScheduleLinkType = 'FS' | 'SS' | 'FF' | 'SF';

// =============================================================================
// SCHEDULE STATUS
// =============================================================================

/**
 * SCHEDULE STATUS
 * The current state of a schedule item or milestone.
 * Drives Open Items / Closed Items sub-page filtering.
 *
 * Open:    not_started | in_progress | on_hold | delayed
 * Closed:  complete
 */
type ScheduleStatus =
  | 'not_started'   // Work has not begun
  | 'in_progress'   // Work is underway
  | 'on_hold'       // Work is paused
  | 'delayed'       // Behind schedule
  | 'complete';     // Work is finished

/**
 * SCHEDULE ENTRY
 * Union type for anything that appears on the Gantt chart.
 */
type ScheduleEntry = ScheduleItem | Milestone;

// =============================================================================
// SCHEDULE TOOL DEFINITION
// =============================================================================

/**
 * SCHEDULE TOOL
 * The tool definition for Schedule, implementing the shared Tool base interface.
 */
interface ScheduleTool {
  key: 'schedule';
  name: 'Schedule';
  level: Extract<ToolLevel, 'both'>;
  description: 'Gantt chart-based scheduling tool for tracking schedule items and milestones across a project or portfolio. Supports predecessor/successor dependencies, WBS codes, and variance tracking.';
  coreActions: ToolCoreActions;
  subPages: ScheduleSubPages;
}

/**
 * SCHEDULE SUB-PAGES
 * Extends the base ToolSubPages with a dedicated Milestones sub-page.
 */
interface ScheduleSubPages extends ToolSubPages {
  milestones: {
    label: 'Milestones';
    description: 'Table view of all milestones on the schedule.';
    filter: 'all';
  };
}
