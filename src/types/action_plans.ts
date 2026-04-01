/**
 * ACTION PLANS TYPES
 */

export type ActionPlanStatus = 'draft' | 'active' | 'complete' | 'void';
export type ActionPlanType = 'safety' | 'quality' | 'environmental' | 'project' | 'other';
export type ActionPlanItemStatus = 'open' | 'in_progress' | 'complete' | 'void';

export interface ActionPlanReference {
  itemId: string;
  itemType: string;
  toolKey: string;
}

export interface ActionPlanItem {
  id: string;
  sectionId: string;
  title: string;
  description: string | null;
  status: ActionPlanItemStatus;
  assignees: string[];
  dueDate: Date | null;
  reference: ActionPlanReference | null;
  completedAt: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActionPlanSection {
  id: string;
  planId: string;
  title: string;
  order: number;
  items: ActionPlanItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ActionPlan {
  id: string;
  accountId: string;
  projectId: string;
  number: number;
  title: string;
  type: ActionPlanType;
  status: ActionPlanStatus;
  sections: ActionPlanSection[];
  description: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ActionPlanRecord = ActionPlan;
