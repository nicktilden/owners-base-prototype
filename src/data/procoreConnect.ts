/**
 * Procore Connect — cross-project / cross-account data sharing.
 *
 * Three sample projects are "connected" to upstream GC accounts.
 * The upstream account pushes high-level counts, schedule, and cost
 * data to the downstream (owner) account for visibility.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ConnectedDataCounts {
  rfis: {
    open: number;
    closed: number;
    costImpact: number;
    scheduleImpact: number;
    overdue: number;
    avgDaysToClose: number;
    avgOwnerResponseTimeDays: number;
  };
  submittals: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
    underReview: number;
    overdue: number;
    reviseResubmit: number;
    awaitingOwner: number;
    awaitingGC: number;
    awaitingDesignTeam: number;
    avgApprovalCycleDays: number;
    firstPassApprovalRatePct: number;
  };
  punchList: {
    open: number;
    closed: number;
    total: number;
    overdue: number;
    addedThisWeek: number;
    clearedThisWeek: number;
    avgDaysToResolve: number;
  };
  observations: {
    open: number;
    closed: number;
    total: number;
    overdue: number;
    safety: number;
    quality: number;
    other: number;
    awaitingGCResponse: number;
    createdByOwnerThisMonth: number;
  };
  dailyLogs: {
    thisMonth: number;
    lastSubmittedDate: string;
    missingDays: number;
    workersOnSiteThisWeek: number;
    workersOnSiteAvg: number;
    weatherDelayDaysThisMonth: number;
    workStoppageEvents: number;
  };
  drawings: {
    latestRevisionDate: string;
    markupsAddedThisWeek: number;
    sheetsWithUnresolvedMarkups: number;
  };
  changeOrders: {
    approved: number;
    pending: number;
    totalApprovedValue: number;
    totalPendingValue: number;
    inReview: number;
    overdueDisputed: number;
    netChangeToContractPct: number;
    contingencyRemaining: number;
    avgDaysToOwnerApproval: number;
  };
  invoicing: {
    amountRequested: number;
    totalBilledToDate: number;
    contractValueBilledPct: number;
    retainageHeld: number;
    retainageReleased: number;
    status: string;
    overdueDays: number;
  };
  photos: {
    total: number;
    thisWeek: number;
    thisMonth: number;
  };
  documents: {
    received: number;
    closeoutCompletePct: number;
    outstanding: number;
    asBuiltReceived: number;
    asBuiltRequired: number;
    warrantiesReceived: number;
    warrantiesRequired: number;
    OMmanualsReceived: number;
    OMmanualsRequired: number;
  };
  cost: {
    originalContractValue: number;
    approvedCOs: number;
    revisedContractValue: number;
    actualCostToDate: number;
    forecastAtCompletion: number;
    varianceToBudget: number;
    contingencyRemaining: number;
  };
  specifications: {
    total: number;
    sections: number;
    approvedSubstitutions: number;
    sectionsLinkedToSubmittals: number;
    sectionsWithOpenRFIs: number;
  };
  correspondence: {
    sentThisMonth: number;
    unansweredFormal: number;
    activeEOTClaimsDays: number;
    openRiskItems: number;
    mitigatedRiskItems: number;
  };
  inspections: {
    scheduledThisWeek: number;
    passed: number;
    failed: number;
    openCorrectiveActions: number;
    permitCompleted: number;
    permitOutstanding: number;
    firstAttemptPassRatePct: number;
  };
  bimModels: {
    total: number;
    active: number;
    openClashes: number;
    resolvedClashes: number;
    highSeverityOpenClashes: number;
  };
  schedule: {
    lastMilestone: string;
    nextMilestone: string;
    daysVariance: number;
    milestonesOnTime: number;
    criticalPathFloatDays: number;
    percentComplete: number;
  };
}

/** Icon key used across ConnectedDataConfig and ConnectFeature. */
export type ConnectFeatureIcon =
  | "rfis"
  | "submittals"
  | "punchList"
  | "observations"
  | "drawings"
  | "schedule"
  | "cost"
  | "dailyLogs"
  | "changeOrders"
  | "invoicing"
  | "photos"
  | "documents"
  | "specifications"
  | "correspondence"
  | "inspections"
  | "bimModels";

export interface ConnectedDataConfig {
  label: string;
  icon: ConnectFeatureIcon;
  description: string;
}

export interface UpstreamProject {
  projectNumber: string;
  projectName: string;
  address: string;
  company: string;
  companyLogo?: string;
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
  /** Freshness */
  lastSyncedIso: string;
  lastSyncedLabel: string;
}

// ─── Upstream GC Companies ────────────────────────────────────────────────────

const GC_TURNER  = "Turner Construction Co.";
const GC_SKANSKA = "Skanska USA Building";
const GC_KIEWIT  = "Kiewit Infrastructure";

// ─── Shared connected feature config (used by all three seed connections) ─────

const FULL_DATA_CONFIG: ConnectedDataConfig[] = [
  { label: "RFIs",            icon: "rfis",           description: "By status [Open / Closed], Cost Impact [Yes] and Schedule Impact [Yes]" },
  { label: "Submittals",      icon: "submittals",     description: "By status [Approved / Pending / Rejected]" },
  { label: "Punch List",      icon: "punchList",      description: "By status [Open / Closed]" },
  { label: "Observations",    icon: "observations",   description: "By status [Open / Closed]" },
  { label: "Daily Logs",      icon: "dailyLogs",      description: "Total and this-week counts" },
  { label: "Drawings",        icon: "drawings",       description: "Latest revision with markup activity" },
  { label: "Change Orders",   icon: "changeOrders",   description: "By status [Approved / Pending] with cost impact" },
  { label: "Invoicing",       icon: "invoicing",      description: "By status [Approved / Pending] with total value" },
  { label: "Photos",          icon: "photos",         description: "Total and this-month upload counts" },
  { label: "Documents",       icon: "documents",      description: "Received and closeout package status" },
  { label: "Budget / Cost",   icon: "cost",           description: "Contract value, actual cost, forecast at completion" },
  { label: "Specifications",  icon: "specifications", description: "Total spec files and section count" },
  { label: "Correspondence",  icon: "correspondence", description: "Sent this month with risk register items" },
  { label: "Inspections",     icon: "inspections",    description: "By status [Passed / Failed / Pending]" },
  { label: "BIM Models",      icon: "bimModels",      description: "Active models with clash detection summary" },
  { label: "Schedule",        icon: "schedule",       description: "Milestone progress and schedule variance" },
];

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
    connectedDataConfig: FULL_DATA_CONFIG,
    counts: {
      rfis: {
        open: 14, closed: 38, costImpact: 6, scheduleImpact: 9,
        overdue: 4, avgDaysToClose: 8.2, avgOwnerResponseTimeDays: 2.1,
      },
      submittals: {
        pending: 11, approved: 64, rejected: 3, total: 78,
        underReview: 8, overdue: 5, reviseResubmit: 3,
        awaitingOwner: 4, awaitingGC: 3, awaitingDesignTeam: 2,
        avgApprovalCycleDays: 12.4, firstPassApprovalRatePct: 82,
      },
      punchList: {
        open: 42, closed: 118, total: 160,
        overdue: 11, addedThisWeek: 7, clearedThisWeek: 14, avgDaysToResolve: 6.8,
      },
      observations: {
        open: 7, closed: 31, total: 38,
        overdue: 2, safety: 12, quality: 18, other: 8,
        awaitingGCResponse: 4, createdByOwnerThisMonth: 6,
      },
      dailyLogs: {
        thisMonth: 22, lastSubmittedDate: "2026-04-16",
        missingDays: 1, workersOnSiteThisWeek: 148, workersOnSiteAvg: 134,
        weatherDelayDaysThisMonth: 0, workStoppageEvents: 0,
      },
      drawings: {
        latestRevisionDate: "2026-04-08", markupsAddedThisWeek: 14, sheetsWithUnresolvedMarkups: 9,
      },
      changeOrders: {
        approved: 8, pending: 3,
        totalApprovedValue: 2_450_000, totalPendingValue: 620_000,
        inReview: 2, overdueDisputed: 1,
        netChangeToContractPct: 2.9, contingencyRemaining: 4_800_000, avgDaysToOwnerApproval: 11.3,
      },
      invoicing: {
        amountRequested: 3_200_000, totalBilledToDate: 62_400_000,
        contractValueBilledPct: 34, retainageHeld: 3_120_000, retainageReleased: 1_040_000,
        status: "Under Review", overdueDays: 0,
      },
      photos: { total: 3_812, thisWeek: 74, thisMonth: 248 },
      documents: {
        received: 541, closeoutCompletePct: 38,
        outstanding: 87, asBuiltReceived: 14, asBuiltRequired: 22,
        warrantiesReceived: 9, warrantiesRequired: 18,
        OMmanualsReceived: 6, OMmanualsRequired: 12,
      },
      cost: {
        originalContractValue: 178_000_000, approvedCOs: 2_450_000,
        revisedContractValue: 183_200_000, actualCostToDate: 62_400_000,
        forecastAtCompletion: 185_600_000, varianceToBudget: 2_400_000, contingencyRemaining: 4_800_000,
      },
      specifications: {
        total: 48, sections: 312, approvedSubstitutions: 7,
        sectionsLinkedToSubmittals: 41, sectionsWithOpenRFIs: 9,
      },
      correspondence: {
        sentThisMonth: 14, unansweredFormal: 3,
        activeEOTClaimsDays: 8, openRiskItems: 6, mitigatedRiskItems: 11,
      },
      inspections: {
        scheduledThisWeek: 4, passed: 62, failed: 4,
        openCorrectiveActions: 7, permitCompleted: 18, permitOutstanding: 3,
        firstAttemptPassRatePct: 89,
      },
      bimModels: {
        total: 6, active: 4, openClashes: 38, resolvedClashes: 142, highSeverityOpenClashes: 5,
      },
      schedule: {
        lastMilestone: "MEP Rough-In Complete", nextMilestone: "Drywall Inspection",
        daysVariance: 8, milestonesOnTime: 6, criticalPathFloatDays: 4, percentComplete: 61,
      },
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
    connectedDataConfig: FULL_DATA_CONFIG,
    counts: {
      rfis: {
        open: 9, closed: 22, costImpact: 4, scheduleImpact: 5,
        overdue: 2, avgDaysToClose: 6.4, avgOwnerResponseTimeDays: 1.8,
      },
      submittals: {
        pending: 7, approved: 41, rejected: 1, total: 49,
        underReview: 5, overdue: 3, reviseResubmit: 1,
        awaitingOwner: 2, awaitingGC: 2, awaitingDesignTeam: 1,
        avgApprovalCycleDays: 9.7, firstPassApprovalRatePct: 88,
      },
      punchList: {
        open: 28, closed: 67, total: 95,
        overdue: 6, addedThisWeek: 4, clearedThisWeek: 9, avgDaysToResolve: 5.2,
      },
      observations: {
        open: 5, closed: 19, total: 24,
        overdue: 1, safety: 8, quality: 11, other: 5,
        awaitingGCResponse: 2, createdByOwnerThisMonth: 3,
      },
      dailyLogs: {
        thisMonth: 21, lastSubmittedDate: "2026-04-16",
        missingDays: 2, workersOnSiteThisWeek: 97, workersOnSiteAvg: 88,
        weatherDelayDaysThisMonth: 1, workStoppageEvents: 0,
      },
      drawings: {
        latestRevisionDate: "2026-04-11", markupsAddedThisWeek: 8, sheetsWithUnresolvedMarkups: 5,
      },
      changeOrders: {
        approved: 5, pending: 2,
        totalApprovedValue: 1_180_000, totalPendingValue: 310_000,
        inReview: 1, overdueDisputed: 0,
        netChangeToContractPct: 3.2, contingencyRemaining: 2_900_000, avgDaysToOwnerApproval: 9.1,
      },
      invoicing: {
        amountRequested: 1_600_000, totalBilledToDate: 22_600_000,
        contractValueBilledPct: 62, retainageHeld: 1_130_000, retainageReleased: 565_000,
        status: "Approved", overdueDays: 0,
      },
      photos: { total: 2_104, thisWeek: 41, thisMonth: 131 },
      documents: {
        received: 318, closeoutCompletePct: 57,
        outstanding: 44, asBuiltReceived: 9, asBuiltRequired: 14,
        warrantiesReceived: 7, warrantiesRequired: 12,
        OMmanualsReceived: 5, OMmanualsRequired: 8,
      },
      cost: {
        originalContractValue: 36_500_000, approvedCOs: 1_180_000,
        revisedContractValue: 37_680_000, actualCostToDate: 22_600_000,
        forecastAtCompletion: 38_200_000, varianceToBudget: 520_000, contingencyRemaining: 2_900_000,
      },
      specifications: {
        total: 34, sections: 218, approvedSubstitutions: 3,
        sectionsLinkedToSubmittals: 28, sectionsWithOpenRFIs: 5,
      },
      correspondence: {
        sentThisMonth: 9, unansweredFormal: 1,
        activeEOTClaimsDays: 0, openRiskItems: 3, mitigatedRiskItems: 7,
      },
      inspections: {
        scheduledThisWeek: 3, passed: 41, failed: 2,
        openCorrectiveActions: 4, permitCompleted: 12, permitOutstanding: 2,
        firstAttemptPassRatePct: 93,
      },
      bimModels: {
        total: 4, active: 3, openClashes: 21, resolvedClashes: 84, highSeverityOpenClashes: 2,
      },
      schedule: {
        lastMilestone: "Structural Steel Complete", nextMilestone: "MEP Rough-In",
        daysVariance: -3, milestonesOnTime: 4, criticalPathFloatDays: 7, percentComplete: 74,
      },
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
    connectedDataConfig: FULL_DATA_CONFIG,
    counts: {
      rfis: {
        open: 21, closed: 56, costImpact: 11, scheduleImpact: 14,
        overdue: 7, avgDaysToClose: 11.6, avgOwnerResponseTimeDays: 3.4,
      },
      submittals: {
        pending: 15, approved: 89, rejected: 5, total: 109,
        underReview: 11, overdue: 8, reviseResubmit: 5,
        awaitingOwner: 6, awaitingGC: 4, awaitingDesignTeam: 3,
        avgApprovalCycleDays: 16.1, firstPassApprovalRatePct: 76,
      },
      punchList: {
        open: 63, closed: 189, total: 252,
        overdue: 18, addedThisWeek: 12, clearedThisWeek: 22, avgDaysToResolve: 9.3,
      },
      observations: {
        open: 12, closed: 44, total: 56,
        overdue: 5, safety: 21, quality: 24, other: 11,
        awaitingGCResponse: 7, createdByOwnerThisMonth: 9,
      },
      dailyLogs: {
        thisMonth: 20, lastSubmittedDate: "2026-04-15",
        missingDays: 3, workersOnSiteThisWeek: 214, workersOnSiteAvg: 198,
        weatherDelayDaysThisMonth: 2, workStoppageEvents: 1,
      },
      drawings: {
        latestRevisionDate: "2026-04-09", markupsAddedThisWeek: 22, sheetsWithUnresolvedMarkups: 17,
      },
      changeOrders: {
        approved: 12, pending: 4,
        totalApprovedValue: 4_800_000, totalPendingValue: 1_240_000,
        inReview: 3, overdueDisputed: 2,
        netChangeToContractPct: 4.1, contingencyRemaining: 7_200_000, avgDaysToOwnerApproval: 14.7,
      },
      invoicing: {
        amountRequested: 5_800_000, totalBilledToDate: 89_100_000,
        contractValueBilledPct: 75, retainageHeld: 4_455_000, retainageReleased: 2_970_000,
        status: "Submitted", overdueDays: 4,
      },
      photos: { total: 5_947, thisWeek: 118, thisMonth: 394 },
      documents: {
        received: 822, closeoutCompletePct: 22,
        outstanding: 198, asBuiltReceived: 22, asBuiltRequired: 41,
        warrantiesReceived: 14, warrantiesRequired: 28,
        OMmanualsReceived: 8, OMmanualsRequired: 19,
      },
      cost: {
        originalContractValue: 118_000_000, approvedCOs: 4_800_000,
        revisedContractValue: 122_800_000, actualCostToDate: 89_100_000,
        forecastAtCompletion: 125_400_000, varianceToBudget: 2_600_000, contingencyRemaining: 7_200_000,
      },
      specifications: {
        total: 61, sections: 441, approvedSubstitutions: 12,
        sectionsLinkedToSubmittals: 52, sectionsWithOpenRFIs: 14,
      },
      correspondence: {
        sentThisMonth: 22, unansweredFormal: 6,
        activeEOTClaimsDays: 13, openRiskItems: 11, mitigatedRiskItems: 18,
      },
      inspections: {
        scheduledThisWeek: 6, passed: 94, failed: 7,
        openCorrectiveActions: 14, permitCompleted: 31, permitOutstanding: 8,
        firstAttemptPassRatePct: 81,
      },
      bimModels: {
        total: 9, active: 6, openClashes: 64, resolvedClashes: 271, highSeverityOpenClashes: 9,
      },
      schedule: {
        lastMilestone: "Foundation Complete", nextMilestone: "Tower Erection — Section A",
        daysVariance: 13, milestonesOnTime: 7, criticalPathFloatDays: 2, percentComplete: 48,
      },
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
  { rfiId: "rfi-3",  upstreamAccount: GC_TURNER,  upstreamProject: "NoVA DC Phase 2 — MEP & Fit-Out",                  syncStatus: "Active" },
  { rfiId: "rfi-7",  upstreamAccount: GC_TURNER,  upstreamProject: "NoVA DC Phase 2 — MEP & Fit-Out",                  syncStatus: "Active" },
  { rfiId: "rfi-15", upstreamAccount: GC_SKANSKA, upstreamProject: "St. Mary's Emergency Dept — General Construction", syncStatus: "Active" },
  { rfiId: "rfi-28", upstreamAccount: GC_KIEWIT,  upstreamProject: "Upstate Transmission Line — Civil & Structural",   syncStatus: "Active" },
];

const connectedRfiMap = new Map(CONNECTED_RFIS.map((r) => [r.rfiId, r]));

export function getConnectedRfiInfo(rfiId: string): ConnectedRfiInfo | undefined {
  return connectedRfiMap.get(rfiId);
}

export function isRfiConnected(rfiId: string): boolean {
  return connectedRfiMap.has(rfiId);
}

// ─── Own-Account Counts (unconnected projects) ────────────────────────────────

/** Counts from the owner's own Procore account, used when no GC connection exists. */
export interface OwnProjectCounts {
  rfis:       { open: number; closed: number };
  submittals: { pending: number; approved: number };
  punchList:  { open: number; total: number };
}

/** Deterministic hash for synthetic own-account counts. */
function ownHash(id: number, salt: number): number {
  let h = ((id * 2654435761) ^ (salt * 40503)) >>> 0;
  h ^= h >>> 16;
  h = ((h * 0x45d9f3b) & 0xffffffff) >>> 0;
  h ^= h >>> 16;
  return h >>> 0;
}

/**
 * Synthetic own-account counts for all 50 portfolio projects.
 * For connected projects the connected counts are used instead; these serve as
 * the "your data" baseline for the 47 unconnected rows.
 */
const _OWN_COUNTS_MAP = new Map<number, OwnProjectCounts>(
  Array.from({ length: 50 }, (_, i) => {
    const id = i + 1;
    const rfiOpen     = 1 + (ownHash(id, 1) % 18);
    const rfiClosed   = 2 + (ownHash(id, 2) % 45);
    const subPending  = ownHash(id, 3) % 14;
    const subApproved = 3 + (ownHash(id, 4) % 52);
    const plOpen      = 1 + (ownHash(id, 5) % 22);
    const plTotal     = plOpen + (ownHash(id, 6) % 80);
    return [id, {
      rfis:       { open: rfiOpen, closed: rfiClosed },
      submittals: { pending: subPending, approved: subApproved },
      punchList:  { open: plOpen, total: plTotal },
    }];
  })
);

/** Returns own-account counts for any project id (1–50). */
export function getProjectOwnCounts(id: number): OwnProjectCounts | undefined {
  return _OWN_COUNTS_MAP.get(id);
}

// ─── Upstream Wizard Data ─────────────────────────────────────────────────────

/** GC companies selectable in the connection setup wizard. */
export const UPSTREAM_COMPANIES = [
  "Turner Construction Co.",
  "Skanska USA Building",
  "Kiewit Infrastructure",
  "Hensel Phelps Construction",
  "McCarthy Building Companies",
  "Suffolk Construction",
  "Whiting-Turner Contracting",
  "Clark Construction Group",
  "DPR Construction",
  "Mortenson Construction",
] as const;

export type UpstreamCompany = (typeof UPSTREAM_COMPANIES)[number];

/** Sample upstream GC projects available per company in the setup wizard. */
export const UPSTREAM_PROJECTS_BY_COMPANY: Record<string, { number: string; name: string; address: string }[]> = {
  "Turner Construction Co.": [
    { number: "TC-4401", name: "NoVA DC Phase 2 — MEP & Fit-Out",    address: "21715 Filigree Ct, Ashburn, VA 20147" },
    { number: "TC-5502", name: "Midtown Office Tower — Core & Shell", address: "350 Park Ave, New York, NY 10022" },
    { number: "TC-6103", name: "Austin Mixed-Use Block A",            address: "700 W 6th St, Austin, TX 78701" },
  ],
  "Skanska USA Building": [
    { number: "SK-GR-2208",  name: "St. Mary's Emergency Dept — General Construction", address: "200 Jefferson Ave SE, Grand Rapids, MI 49503" },
    { number: "SK-SEA-3310", name: "Seattle Life Sciences Campus — Phase 1",            address: "4000 15th Ave NE, Seattle, WA 98105" },
    { number: "SK-CHI-4421", name: "River North Hotel Renovation",                     address: "166 E Superior St, Chicago, IL 60611" },
  ],
  "Kiewit Infrastructure": [
    { number: "KW-NY-0087", name: "Upstate Transmission Line — Civil & Structural", address: "100 Clinton Square, Syracuse, NY 13202" },
    { number: "KW-TX-0214", name: "Eagle Ford Pipeline Loop — Segment 4",           address: "IH-35 & SH-130, San Marcos, TX 78666" },
    { number: "KW-CO-0398", name: "I-70 Viaduct Replacement",                       address: "I-70 & Brighton Blvd, Denver, CO 80216" },
  ],
  "Hensel Phelps Construction": [
    { number: "HP-DFW-0190", name: "DFW Terminal D Expansion", address: "2400 Aviation Dr, Dallas, TX 75261" },
    { number: "HP-PHX-0231", name: "Sky Harbor Concourse B",   address: "3400 E Sky Harbor Blvd, Phoenix, AZ 85034" },
  ],
  "McCarthy Building Companies": [
    { number: "MB-LA-0455",  name: "Cedars-Sinai Outpatient Tower",       address: "8635 W 3rd St, Los Angeles, CA 90048" },
    { number: "MB-STL-0619", name: "BJC Medical Campus Parking Structure", address: "4590 Children's Pl, St. Louis, MO 63110" },
  ],
  "Suffolk Construction": [
    { number: "SF-BOS-0820", name: "South End Life Sciences Hub", address: "575 Albany St, Boston, MA 02118" },
    { number: "SF-MIA-0934", name: "Brickell City Centre Phase 2", address: "78 SE 7th St, Miami, FL 33131" },
  ],
  "Whiting-Turner Contracting": [
    { number: "WT-BAL-1042", name: "Johns Hopkins Bayview Pavilion", address: "4940 Eastern Ave, Baltimore, MD 21224" },
    { number: "WT-ATL-1108", name: "Midtown Atlanta Mixed-Use",      address: "1175 Peachtree St NE, Atlanta, GA 30361" },
  ],
  "Clark Construction Group": [
    { number: "CK-DC-1201", name: "US Capitol Visitor Center Phase 3", address: "First St SE, Washington, DC 20004" },
    { number: "CK-LA-1355", name: "Inglewood Transit Connector",       address: "1 Carrier Dr, Inglewood, CA 90301" },
  ],
  "DPR Construction": [
    { number: "DP-SF-1440",  name: "Mission Bay Medical Office",          address: "1825 4th St, San Francisco, CA 94158" },
    { number: "DP-RDU-1502", name: "RTP Life Sciences Campus Build-Out",  address: "4000 Centregreen Way, Cary, NC 27513" },
  ],
  "Mortenson Construction": [
    { number: "MC-MIN-1600", name: "Vikings Headquarters Training Facility", address: "2600 Vikings Circle, Eagan, MN 55121" },
    { number: "MC-DEN-1712", name: "Denver Convention Center Expansion",     address: "700 14th St, Denver, CO 80202" },
  ],
};

/** Features that can be enabled in the connection setup wizard. */
export interface ConnectFeature {
  id:          string;
  label:       string;
  icon:        ConnectFeatureIcon;
  description: string;
  isPilot?:    boolean;
}

export const CONNECT_FEATURES: ConnectFeature[] = [
  { id: "rfis",           label: "RFIs",           icon: "rfis",           description: "Open, closed, and overdue RFIs with average days to close." },
  { id: "submittals",     label: "Submittals",      icon: "submittals",     description: "Submittal status by approval cycle, including awaiting-owner breakdown." },
  { id: "punchList",      label: "Punch List",      icon: "punchList",      description: "Open, closed, and overdue punch list items with resolution time." },
  { id: "observations",   label: "Observations",    icon: "observations",   description: "Safety, quality, and general observations raised on site." },
  { id: "drawings",       label: "Drawings",        icon: "drawings",       description: "Latest drawing revision date and unresolved markup counts." },
  { id: "dailyLogs",      label: "Daily Logs",      icon: "dailyLogs",      description: "Daily log submissions, workforce on site, and weather delay days." },
  { id: "changeOrders",   label: "Change Orders",   icon: "changeOrders",   description: "Approved and pending COs with total value and net contract change." },
  { id: "invoicing",      label: "Invoicing",       icon: "invoicing",      description: "Invoice amounts requested, billed to date, retainage, and status." },
  { id: "photos",         label: "Photos",          icon: "photos",         description: "Total photos and upload activity this week and this month." },
  { id: "documents",      label: "Documents",       icon: "documents",      description: "Documents received and closeout package completion percentage." },
  { id: "cost",           label: "Budget / Cost",   icon: "cost",           description: "Contract value, actual cost to date, and variance to budget." },
  { id: "specifications", label: "Specifications",  icon: "specifications", description: "Spec sections, approved substitutions, and sections with open RFIs." },
  { id: "correspondence", label: "Correspondence",  icon: "correspondence", description: "Formal correspondence sent and open risk register items." },
  { id: "inspections",    label: "Inspections",     icon: "inspections",    description: "Inspection pass/fail results, permit status, and corrective actions." },
  { id: "bimModels",      label: "BIM Models",      icon: "bimModels",      description: "Open and resolved clash counts with high-severity highlights." },
  { id: "schedule",       label: "Schedule",        icon: "schedule",       description: "Milestone progress, days ahead/behind schedule, and % complete." },
];
