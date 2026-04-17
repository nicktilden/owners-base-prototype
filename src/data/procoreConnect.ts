/**
 * Procore Connect — cross-project / cross-account data sharing.
 *
 * Three sample projects are "connected" to upstream GC accounts.
 * The upstream account pushes high-level schedule, cost, and object-count
 * data to the downstream (owner) account for visibility.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ConnectedDataCounts {
  rfis: { open: number; closed: number; costImpact: number; scheduleImpact: number };
  punchList: { open: number; closed: number; total: number };
  observations: { open: number; closed: number; total: number };
  submittals: { pending: number; approved: number; rejected: number; total: number };
  changeEvents: { approved: number; pending: number; totalCostImpact: number };
}

export interface ConnectedScheduleData {
  tasksInProgress: number;
  tasksCompleted: number;
  totalTasks: number;
  milestonesCompleted: number;
  milestonesTotal: number;
  scheduleDaysVariance: number;
}

export interface ConnectedBudgetData {
  approvedBudgetChanges: number;
  contingencyUsedPercent: number;
  originalContractValue: number;
  currentContractValue: number;
  costVariance: number;
}

export interface UpstreamProject {
  projectNumber: string;
  projectName: string;
  address: string;
  company: string;
  companyLogo?: string;
}

export interface ConnectedDataConfig {
  label: string;
  icon: "changeEvents" | "schedule" | "budget" | "rfis" | "submittals";
  description: string;
}

export interface ProjectConnection {
  /** The local (owner/downstream) project id from sampleProjectRows */
  localProjectId: number;
  /** Upstream GC project details */
  upstream: UpstreamProject;
  /** Local project display info (populated at lookup time) */
  localProjectNumber: string;
  localProjectName: string;
  localAddress: string;
  localCompany: string;
  /** What data categories are connected */
  connectedDataConfig: ConnectedDataConfig[];
  /** Actual shared data from the upstream project */
  counts: ConnectedDataCounts;
  schedule: ConnectedScheduleData;
  budget: ConnectedBudgetData;
  /** Freshness */
  lastSyncedIso: string;
  lastSyncedLabel: string;
}

// ─── Upstream GC Companies ────────────────────────────────────────────────────

const GC_TURNER = "Turner Construction Co.";
const GC_SKANSKA = "Skanska USA Building";
const GC_KIEWIT = "Kiewit Infrastructure";

// ─── Connection Definitions ───────────────────────────────────────────────────

export const PROJECT_CONNECTIONS: ProjectConnection[] = [
  {
    localProjectId: 1,
    upstream: {
      projectNumber: "TC-4401",
      projectName: "NoVA DC Phase 2 — MEP & Fit-Out",
      address: "21715 Filigree Ct, Ashburn, VA 20147",
      company: GC_TURNER,
    },
    localProjectNumber: "MA-1001",
    localProjectName: "Northern Virginia Data Center Phase 2",
    localAddress: "Ashburn, VA 20147",
    localCompany: "RivCloud Partners",
    connectedDataConfig: [
      { label: "Change Events", icon: "changeEvents", description: "By scope [Out of Scope] and status [Approved]" },
      { label: "Schedule Status", icon: "schedule", description: "Tasks and milestones by status [In Progress / Completed]" },
      { label: "Budget", icon: "budget", description: "Approved budget changes by type [Contingency]" },
      { label: "RFIs", icon: "rfis", description: "By status [Open / Closed], Cost Impact [Yes] and Schedule Impact [Yes]" },
      { label: "Submittals", icon: "submittals", description: "By status [Approved]" },
    ],
    counts: {
      rfis: { open: 14, closed: 38, costImpact: 6, scheduleImpact: 9 },
      punchList: { open: 42, closed: 118, total: 160 },
      observations: { open: 7, closed: 31, total: 38 },
      submittals: { pending: 11, approved: 64, rejected: 3, total: 78 },
      changeEvents: { approved: 8, pending: 3, totalCostImpact: 2_450_000 },
    },
    schedule: {
      tasksInProgress: 24,
      tasksCompleted: 87,
      totalTasks: 142,
      milestonesCompleted: 6,
      milestonesTotal: 12,
      scheduleDaysVariance: 8,
    },
    budget: {
      approvedBudgetChanges: 8,
      contingencyUsedPercent: 34,
      originalContractValue: 178_000_000,
      currentContractValue: 183_200_000,
      costVariance: 5_200_000,
    },
    lastSyncedIso: "2026-04-10T14:22:00Z",
    lastSyncedLabel: "3 days ago",
  },
  {
    localProjectId: 12,
    upstream: {
      projectNumber: "SK-GR-2208",
      projectName: "St. Mary's Emergency Dept — General Construction",
      address: "200 Jefferson Ave SE, Grand Rapids, MI 49503",
      company: GC_SKANSKA,
    },
    localProjectNumber: "MW-1085",
    localProjectName: "St. Mary's ED Expansion",
    localAddress: "Grand Rapids, MI 49503",
    localCompany: "RivCloud Partners",
    connectedDataConfig: [
      { label: "Change Events", icon: "changeEvents", description: "By scope [Out of Scope] and status [Approved]" },
      { label: "Schedule Status", icon: "schedule", description: "Tasks and milestones by status [In Progress / Completed]" },
      { label: "Budget", icon: "budget", description: "Approved budget changes by type [Contingency]" },
      { label: "RFIs", icon: "rfis", description: "By status [Open / Closed], Cost Impact [Yes] and Schedule Impact [Yes]" },
      { label: "Submittals", icon: "submittals", description: "By status [Approved]" },
    ],
    counts: {
      rfis: { open: 9, closed: 22, costImpact: 4, scheduleImpact: 5 },
      punchList: { open: 28, closed: 67, total: 95 },
      observations: { open: 5, closed: 19, total: 24 },
      submittals: { pending: 7, approved: 41, rejected: 1, total: 49 },
      changeEvents: { approved: 5, pending: 2, totalCostImpact: 1_180_000 },
    },
    schedule: {
      tasksInProgress: 18,
      tasksCompleted: 52,
      totalTasks: 96,
      milestonesCompleted: 4,
      milestonesTotal: 10,
      scheduleDaysVariance: -3,
    },
    budget: {
      approvedBudgetChanges: 5,
      contingencyUsedPercent: 22,
      originalContractValue: 36_500_000,
      currentContractValue: 37_680_000,
      costVariance: 1_180_000,
    },
    lastSyncedIso: "2026-04-11T09:15:00Z",
    lastSyncedLabel: "2 days ago",
  },
  {
    localProjectId: 28,
    upstream: {
      projectNumber: "KW-NY-0087",
      projectName: "Upstate Transmission Line — Civil & Structural",
      address: "100 Clinton Square, Syracuse, NY 13202",
      company: GC_KIEWIT,
    },
    localProjectNumber: "NE-1221",
    localProjectName: "Upstate NY Transmission",
    localAddress: "Syracuse, NY 13202",
    localCompany: "RivCloud Partners",
    connectedDataConfig: [
      { label: "Change Events", icon: "changeEvents", description: "By scope [Out of Scope] and status [Approved]" },
      { label: "Schedule Status", icon: "schedule", description: "Tasks and milestones by status [In Progress / Completed]" },
      { label: "Budget", icon: "budget", description: "Approved budget changes by type [Contingency]" },
      { label: "RFIs", icon: "rfis", description: "By status [Open / Closed], Cost Impact [Yes] and Schedule Impact [Yes]" },
      { label: "Submittals", icon: "submittals", description: "By status [Approved]" },
    ],
    counts: {
      rfis: { open: 21, closed: 56, costImpact: 11, scheduleImpact: 14 },
      punchList: { open: 63, closed: 189, total: 252 },
      observations: { open: 12, closed: 44, total: 56 },
      submittals: { pending: 15, approved: 89, rejected: 5, total: 109 },
      changeEvents: { approved: 12, pending: 4, totalCostImpact: 4_800_000 },
    },
    schedule: {
      tasksInProgress: 31,
      tasksCompleted: 104,
      totalTasks: 178,
      milestonesCompleted: 7,
      milestonesTotal: 14,
      scheduleDaysVariance: 13,
    },
    budget: {
      approvedBudgetChanges: 12,
      contingencyUsedPercent: 48,
      originalContractValue: 118_000_000,
      currentContractValue: 122_800_000,
      costVariance: 4_800_000,
    },
    lastSyncedIso: "2026-04-12T16:45:00Z",
    lastSyncedLabel: "1 day ago",
  },
];

// ─── Lookup Helpers ───────────────────────────────────────────────────────────

const connectionsByProjectId = new Map(
  PROJECT_CONNECTIONS.map((c) => [c.localProjectId, c])
);

/** Returns the connection for a project, or undefined if not connected. */
export function getProjectConnection(projectId: number): ProjectConnection | undefined {
  return connectionsByProjectId.get(projectId);
}

/** Returns true if the project has an active Procore Connect link. */
export function isProjectConnected(projectId: number): boolean {
  return connectionsByProjectId.has(projectId);
}

/** Set of connected project ids for fast membership checks. */
export const CONNECTED_PROJECT_IDS = new Set(PROJECT_CONNECTIONS.map((c) => c.localProjectId));

// ─── Connected RFIs ──────────────────────────────────────────────────────────

export interface ConnectedRfiInfo {
  rfiId: string;
  upstreamAccount: string;
  upstreamProject: string;
  syncStatus: "Active" | "Paused";
}

export const CONNECTED_RFIS: ConnectedRfiInfo[] = [
  { rfiId: "rfi-3",  upstreamAccount: "Turner Construction Co.",  upstreamProject: "NoVA DC Phase 2 — MEP & Fit-Out",  syncStatus: "Active" },
  { rfiId: "rfi-7",  upstreamAccount: "Turner Construction Co.",  upstreamProject: "NoVA DC Phase 2 — MEP & Fit-Out",  syncStatus: "Active" },
  { rfiId: "rfi-15", upstreamAccount: "Skanska USA Building",     upstreamProject: "St. Mary's Emergency Dept — General Construction", syncStatus: "Active" },
  { rfiId: "rfi-28", upstreamAccount: "Kiewit Infrastructure",    upstreamProject: "Upstate Transmission Line — Civil & Structural",   syncStatus: "Active" },
];

const connectedRfiMap = new Map(CONNECTED_RFIS.map((r) => [r.rfiId, r]));

export function getConnectedRfiInfo(rfiId: string): ConnectedRfiInfo | undefined {
  return connectedRfiMap.get(rfiId);
}

export function isRfiConnected(rfiId: string): boolean {
  return connectedRfiMap.has(rfiId);
}
