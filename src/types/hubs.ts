/**
 * HUB TYPES
 */

import type { ToolLevel } from './tools';

export type HubTabSource = 'admin' | 'user';

export type HubCardType =
  | 'project_list'
  | 'project_map'
  | 'budget_summary'
  | 'schedule_summary'
  | 'open_issues'
  | 'open_rfis'
  | 'open_submittals'
  | 'open_punch_list'
  | 'tasks_summary'
  | 'change_order_summary'
  | 'team_members'
  | 'recent_activity'
  | 'custom_metric';

export interface HubCardDateRange {
  start: Date;
  end: Date;
}

export interface HubCardConfig {
  toolKey?: string;
  projectIds?: string[];
  dateRange?: HubCardDateRange;
  maxItems?: number;
  customLabel?: string;
  customMetricKey?: string;
}

export interface HubCard {
  id: string;
  tabId: string;
  type: HubCardType;
  title: string;
  order: number;
  config: HubCardConfig;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HubTab {
  id: string;
  hubId: string;
  label: string;
  order: number;
  source: HubTabSource;
  cards: HubCard[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HubDisplayName {
  navLabel: string;
  pageTitle: string;
}

export interface Hub {
  id: string;
  level: Extract<ToolLevel, 'portfolio' | 'project'>;
  accountId: string;
  projectId: string | null;
  displayName: HubDisplayName;
  tabs: HubTab[];
  createdAt: Date;
  updatedAt: Date;
}
