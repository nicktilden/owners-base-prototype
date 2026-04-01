import type { ToolLevel, ToolCoreActions, ToolSubPages } from './index';

/**
 * ACTION PLANS
 * A checklist-based planning tool available at the project level.
 * An Action Plan is a container organized into Sections, each containing Items.
 * Hierarchy: ActionPlan → ActionPlanSection → ActionPlanItem
 *
 * Progress is tracked as completed items / total items.
 * Private plans are only visible to Admins, Assignees, and the Plan Creator.
 */

// =============================================================================
// ACTION PLAN
// =============================================================================

/**
 * ACTION PLAN
 * The top-level container for a set of sections and checklist items.
 */
interface ActionPlan {
  id: string;                              // Unique identifier
  accountId: string;                       // Account this plan belongs to
  projectId: string;                       // Project this plan belongs to
  number: number;                          // Auto-incremented plan number within the project
  name: string;                            // Display name (required)
  status: ActionPlanStatus;               // Current status — defaults to 'draft' on create
  type: ActionPlanType;                    // Plan type classification (required)
  private: boolean;                        // If true, restricted visibility
  locationId: string | null;              // Reference to a Location record
  description: string | null;             // Rich text description
  planManagerId: string | null;           // User ID of the Plan Manager
  approverIds: string[];                   // User IDs of Action Plan Approvers
  completedReceiverIds: string[];          // User IDs notified when plan is completed
  sections: ActionPlanSection[];          // Ordered list of sections
  createdBy: string;                       // User ID of the creator
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// ACTION PLAN SECTION
// =============================================================================

/**
 * ACTION PLAN SECTION
 * A grouping container within an Action Plan.
 * Numbered sequentially (1, 2, 3...). Sections can be reordered.
 */
interface ActionPlanSection {
  id: string;                              // Unique identifier
  actionPlanId: string;                    // The Action Plan this section belongs to
  number: number;                          // Section number (1-indexed, determines display order)
  title: string;                           // Section title
  items: ActionPlanItem[];                 // Ordered list of items within this section
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// ACTION PLAN ITEM
// =============================================================================

/**
 * ACTION PLAN ITEM
 * A single checklist item within a Section.
 * Numbered as {sectionNumber}.{itemNumber} (e.g. 1.1, 1.2, 2.1).
 */
interface ActionPlanItem {
  id: string;                              // Unique identifier
  sectionId: string;                       // The Section this item belongs to
  actionPlanId: string;                    // The Action Plan this item belongs to
  number: number;                          // Item number within the section (1-indexed)
  title: string;                           // Item title
  status: ActionPlanItemStatus;           // Current status — defaults to 'open'
  acceptanceCriteria: string | null;       // Description of what constitutes completion
  references: ActionPlanReference[];       // Linked Procore items or documents
  dueDate: Date | null;                    // Optional due date
  assigneeIds: string[];                   // User IDs assigned to this item
  verificationMethods: string | null;      // How completion will be verified
  records: ActionPlanRecord[];             // Linked requests or records
  notes: string | null;                    // Free text notes
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// ACTION PLAN REFERENCE
// =============================================================================

/**
 * ACTION PLAN REFERENCE
 * A linked item or document attached to an Action Plan Item.
 */
interface ActionPlanReference {
  id: string;                              // Unique identifier
  itemId: string;                          // The ActionPlanItem this reference belongs to
  type: ActionPlanReferenceType;           // Whether this is a Procore item or document
  referenceId: string;                     // ID of the linked item or document
  label: string | null;                    // Optional display label
}

/**
 * ACTION PLAN REFERENCE TYPE
 */
type ActionPlanReferenceType = 'procore_item' | 'document';

// =============================================================================
// ACTION PLAN RECORD
// =============================================================================

/**
 * ACTION PLAN RECORD
 * A linked request or record attached to an Action Plan Item.
 */
interface ActionPlanRecord {
  id: string;                              // Unique identifier
  itemId: string;                          // The ActionPlanItem this record belongs to
  requestId: string;                       // ID of the linked request
  label: string | null;                    // Optional display label
}

// =============================================================================
// ACTION PLAN STATUS
// =============================================================================

/**
 * ACTION PLAN STATUS
 * The current state of an Action Plan.
 * Drives Open Items / Closed Items sub-page filtering.
 *
 * Open:    draft | in_progress
 * Closed:  complete
 */
type ActionPlanStatus =
  | 'draft'         // Plan created but not yet active — default
  | 'in_progress'   // Plan is actively being worked on
  | 'complete';     // All items are closed and plan is complete

// =============================================================================
// ACTION PLAN ITEM STATUS
// =============================================================================

/**
 * ACTION PLAN ITEM STATUS
 * The current state of an individual checklist item.
 * Drives progress calculation (completedItems / totalItems).
 *
 * Open:    open | in_progress | delayed
 * Closed:  closed
 */
type ActionPlanItemStatus =
  | 'open'          // Item not yet started — default
  | 'in_progress'   // Item is being worked on
  | 'delayed'       // Item is behind schedule
  | 'closed';       // Item is complete

// =============================================================================
// ACTION PLAN TYPE
// =============================================================================

/**
 * ACTION PLAN TYPE
 * Classifies the Action Plan by its purpose or phase.
 * Displayed as a searchable dropdown on create/edit.
 */
type ActionPlanType =
  | 'Change Management'
  | 'Client Sign-Off'
  | 'Commissioning'
  | 'Concrete'
  | 'Construction'
  | 'Construction Phase Checklist'
  | 'Demo'
  | 'Design & Permitting'
  | 'Design / Funding / Programming'
  | 'Design Stage Review'
  | 'Document Control'
  | 'Electrical'
  | 'Environmental'
  | 'Finishes'
  | 'Handoff'
  | 'ILSM'
  | 'Initiation'
  | 'Metalwork'
  | 'New Type'
  | 'Phase Gate'
  | 'Pre-Construction Action Plans'
  | 'Preconstruction'
  | 'Procurement'
  | 'Project Close-out'
  | 'Project Execution'
  | 'Project Planning'
  | 'Quality'
  | 'Request and Approval Tracking'
  | 'Risk Assessment'
  | 'Safety'
  | 'Scope Planning'
  | 'SFPUC Design & Planning Phase Checklist'
  | 'Stage Gate'
  | 'Transportation Real Estate'
  | 'Warranty';

// =============================================================================
// ACTION PLANS TOOL DEFINITION
// =============================================================================

/**
 * ACTION PLANS TOOL
 * The tool definition for Action Plans, implementing the shared Tool base interface.
 */
interface ActionPlansTool {
  key: 'action_plans';
  name: 'Action Plans';
  level: Extract<ToolLevel, 'project'>;
  description: 'Checklist-based planning tool for tracking structured action items across project phases. Plans are organized into sections and items with acceptance criteria, assignees, due dates, and verification methods.';
  coreActions: ToolCoreActions;
  subPages: ToolSubPages;
}
