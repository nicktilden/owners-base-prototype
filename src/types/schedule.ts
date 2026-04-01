/**
 * SCHEDULE TYPES
 */

export type ScheduleStatus =
  | 'not_started'
  | 'in_progress'
  | 'on_hold'
  | 'delayed'
  | 'complete';

export type ScheduleLinkType = 'FS' | 'SS' | 'FF' | 'SF';

export interface ScheduleLink {
  targetId: string;
  targetType: 'item' | 'milestone';
  linkType: ScheduleLinkType;
  lagDays: number;
}

export interface ScheduleItem {
  id: string;
  accountId: string;
  projectId: string;
  type: 'item';
  name: string;
  percentComplete: number;
  status: ScheduleStatus;
  startDate: Date;
  actualStartDate: Date | null;
  finishDate: Date;
  actualFinishDate: Date | null;
  wbs: string;
  predecessors: ScheduleLink[];
  successors: ScheduleLink[];
  assignees: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Milestone {
  id: string;
  accountId: string;
  projectId: string;
  type: 'milestone';
  name: string;
  milestoneDate: Date;
  actualMilestoneDate: Date | null;
  wbs: string;
  predecessors: ScheduleLink[];
  successors: ScheduleLink[];
  assignees: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ScheduleEntry = ScheduleItem | Milestone;
