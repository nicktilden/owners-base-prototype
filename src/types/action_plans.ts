/**
 * ACTION PLANS TYPES
 *
 * Two-layer model:
 *   Account level  — ActionPlanType (configurable) + ActionPlanTemplate (reusable shell)
 *   Project level  — ActionPlan (instance, fully detached from template after creation)
 */

// ─── Account-level: Type ─────────────────────────────────────────────────────

/**
 * User-configurable plan type (managed in Account Settings → Action Plans).
 * Not a fixed enum — accounts create and name their own types.
 */
export interface ActionPlanType {
  id: string;
  accountId: string;
  name: string;         // e.g. "Stage Gate", "Commissioning", "Safety", "Scope Planning"
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Account-level: Template ──────────────────────────────────────────────────

/**
 * Structural scaffold defined in Account Settings.
 * Applied to a project to create a new ActionPlan instance.
 * The plan is fully detached from the template after creation.
 */
export interface ActionPlanTemplateItem {
  id: string;
  sectionId: string;
  order: number;
  title: string;
  acceptanceCriteria: string | null;
}

export interface ActionPlanTemplateSection {
  id: string;
  templateId: string;
  title: string;
  order: number;
  items: ActionPlanTemplateItem[];
}

export interface ActionPlanTemplate {
  id: string;
  accountId: string;
  name: string;
  typeId: string;           // references ActionPlanType.id
  description: string | null;
  private: boolean;
  sections: ActionPlanTemplateSection[];
  createdBy: string;        // references User.id
  createdAt: Date;
  updatedAt: Date;
}

// ─── Project-level: Plan ──────────────────────────────────────────────────────

/**
 * Plan status.
 * - draft       : created but not yet activated; items may have no assignees/dates
 * - in_progress : active workflow; items are being worked
 * - complete    : all sections complete (all items closed); may require approver sign-off
 */
export type ActionPlanStatus = 'draft' | 'in_progress' | 'complete';

/**
 * Item status within a plan workflow.
 * A section is complete when all its items are 'closed'.
 * A plan is complete when all its sections are complete.
 */
export type ActionPlanItemStatus = 'open' | 'in_progress' | 'delayed' | 'closed';

/**
 * A reference attached to an action plan item.
 * Items can have multiple references of different kinds.
 */
export interface ActionPlanReference {
  id: string;
  itemId: string;
  kind: 'procore_item' | 'document';
  toolKey: string | null;   // e.g. 'submittals', 'rfis', 'observations' — null for documents
  recordId: string;         // ID of the linked record or document
  label: string;            // display label, e.g. "Submittal #42 — Steel Shop Drawings"
}

/**
 * A single checklist step within a section.
 * Multiple users can be assigned; all items must be closed for the section to complete.
 */
export interface ActionPlanItem {
  id: string;
  sectionId: string;
  order: number;
  title: string;
  description: string | null;
  acceptanceCriteria: string | null;
  status: ActionPlanItemStatus;
  assignees: string[];          // User.id[]
  dueDate: Date | null;
  references: ActionPlanReference[];
  completedAt: Date | null;
  createdBy: string;            // User.id
  createdAt: Date;
  updatedAt: Date;
}

/**
 * A named group of items within a plan.
 * Section completion is derived: all items are 'closed'.
 */
export interface ActionPlanSection {
  id: string;
  planId: string;
  title: string;
  order: number;
  items: ActionPlanItem[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Project-level action plan instance.
 * Created from a template or from scratch; fully independent of any template after creation.
 * Plan completion is derived: all sections complete (all items closed).
 */
export interface ActionPlan {
  id: string;
  accountId: string;
  projectId: string;
  number: number;
  title: string;
  typeId: string;               // references ActionPlanType.id
  status: ActionPlanStatus;
  private: boolean;
  locationId: string | null;    // references a project location node
  description: string | null;
  planManager: string | null;   // User.id — single responsible owner
  approvers: string[];          // User.id[] — must sign off to mark complete
  completedReceivers: string[]; // User.id[] — notified when plan is marked complete
  sections: ActionPlanSection[];
  createdBy: string;            // User.id
  createdAt: Date;
  updatedAt: Date;
}

export type ActionPlanRecord = ActionPlan;
