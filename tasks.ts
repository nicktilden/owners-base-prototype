import type { ToolLevel, ToolCoreActions, ToolSubPages } from './index';

/**
 * TASKS
 * A task management tool available at both portfolio and project levels.
 * Tasks are used to track and assign work items across the platform.
 * Portfolio level aggregates tasks across all projects.
 *
 * Private tasks are only visible to Admins, Assignees,
 * Distribution List members, and the Task Creator.
 */

// =============================================================================
// TASK
// =============================================================================

/**
 * TASK
 * A single work item within the Tasks tool.
 */
interface Task {
  id: string;                        // Unique identifier
  accountId: string;                 // Account this task belongs to
  projectId: string | null;          // Project this task belongs to; null if portfolio-level
  number: number;                    // Auto-incremented task number within the project
  title: string;                     // Display title of the task
  status: TaskStatus;                // Current status — defaults to 'initiated' on create
  category: TaskCategory | null;     // Optional category classification
  assignees: string[];               // User IDs of users assigned to complete this task
  dueDate: Date | null;              // Optional due date
  distributionList: string[];        // User IDs of users who receive notifications for this task
  private: boolean;                  // If true, only visible to admins, assignees, distribution list, and creator
  description: string | null;        // Rich text description
  attachments: TaskAttachment[];     // Attached files
  createdBy: string;                 // User ID of the creator
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// TASK ATTACHMENT
// =============================================================================

/**
 * TASK ATTACHMENT
 * A file attached to a task.
 */
interface TaskAttachment {
  id: string;                        // Unique identifier
  taskId: string;                    // The Task this attachment belongs to
  fileName: string;                  // Original file name
  fileSize: number;                  // File size in bytes
  fileType: string;                  // MIME type (e.g. 'application/pdf')
  url: string;                       // Storage URL for the file
  uploadedBy: string;                // User ID of the uploader
  uploadedAt: Date;
}

// =============================================================================
// TASK STATUS
// =============================================================================

/**
 * TASK STATUS
 * The current state of a task.
 * Drives Open Items / Closed Items sub-page filtering.
 *
 * Open:    initiated | in_progress | ready_for_review
 * Closed:  closed | void
 */
type TaskStatus =
  | 'initiated'          // Task has been created but not yet started — default
  | 'in_progress'        // Task is actively being worked on
  | 'ready_for_review'   // Task is complete and awaiting review
  | 'closed'             // Task has been reviewed and closed
  | 'void';              // Task has been voided and is no longer active

// =============================================================================
// TASK CATEGORY
// =============================================================================

/**
 * TASK CATEGORY
 * Classifies the task by its work type or discipline.
 * Displayed as a searchable dropdown on create/edit.
 */
type TaskCategory =
  | 'Administrative'
  | 'Closeout'
  | 'Contract'
  | 'Design'
  | 'Design - Drainage'
  | 'Design - Management'
  | 'Design - Roadway'
  | 'Design - Structures'
  | 'Design - Survey'
  | 'Design - Utilities'
  | 'Equipment'
  | 'Inspector'
  | 'Miscellaneous'
  | 'Preconstruction'
  | 'Utility Coordination';

// =============================================================================
// TASKS TOOL DEFINITION
// =============================================================================

/**
 * TASKS TOOL
 * The tool definition for Tasks, implementing the shared Tool base interface.
 */
interface TasksTool {
  key: 'tasks';
  name: 'Tasks';
  level: Extract<ToolLevel, 'both'>;
  description: 'Task management tool for creating, assigning, and tracking work items across a project or portfolio. Supports categorization, due dates, distribution lists, and private visibility controls.';
  coreActions: ToolCoreActions;
  subPages: ToolSubPages;
}
