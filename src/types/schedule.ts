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

export type SeasonalConstraint = 'avoid_winter' | 'avoid_summer_heat' | 'avoid_monsoon' | 'avoid_freeze_thaw' | null;
export type MilestoneType = 'substantial_completion' | 'phase_handoff' | 'regulatory_inspection' | 'owner_acceptance' | 'ntp' | null;
export type HazardousActivityType = 'electrical' | 'confined_space' | 'demolition' | 'excavation' | 'hot_work' | 'working_at_height' | 'asbestos' | null;

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
  /** Seasonal constraint on this activity window. */
  seasonalConstraint?: SeasonalConstraint;
  /** Hazardous activity type, if applicable. */
  hazardousActivityType?: HazardousActivityType;
  /** Whether this activity requires a pre-work safety plan. */
  safetyPlanRequired?: boolean;
  /** Whether the required safety plan has been completed. */
  safetyPlanCompleted?: boolean | null;
  /** Linked Procore Action Plan for safety prep. */
  linkedActionPlanId?: string | null;
}

export interface Milestone {
  id: string;
  accountId: string;
  projectId: string;
  type: 'milestone';
  name: string;
  status?: ScheduleStatus;
  milestoneDate: Date;
  actualMilestoneDate: Date | null;
  /** Optional note explaining why the actual date differs from baseline. */
  note?: string;
  wbs: string;
  predecessors: ScheduleLink[];
  successors: ScheduleLink[];
  assignees: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  /** Semantic milestone classification. */
  milestoneType?: MilestoneType;
  /** Seasonal constraint — this milestone must occur before/after a seasonal window. */
  seasonalConstraint?: SeasonalConstraint;
}

export type ScheduleEntry = ScheduleItem | Milestone;
