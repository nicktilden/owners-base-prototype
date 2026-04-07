/**
 * Project and chart sample data for the home dashboard.
 * Replace with API calls or Hub Data Loader when wiring to real data.
 * Project numbers: region code (NE, MA, SE, MW, SW, W) + number starting 1001 with gaps for canceled/completed.
 */

/**
 * Project stages in sequential order (1–11). Order is significant for workflow and approval gates;
 * projects move from one stage to the next. Use getStageOrder() to get 1–11 for workflow/approval logic.
 */
export const PROJECT_STAGES = [
  "Conceptual",
  "Feasibility",
  "Final design",
  "Permitting",
  "Bidding",
  "Pre-Construction",
  "Course of Construction",
  "Post-Construction",
  "Handover",
  "Closeout",
  "Maintenance",
] as const;

export type ProjectStage = (typeof PROJECT_STAGES)[number];

/** 1-based order for a stage (1–11). Use for workflow/approval logic. */
export function getStageOrder(stage: ProjectStage): number {
  const i = PROJECT_STAGES.indexOf(stage);
  return i === -1 ? 0 : i + 1;
}

/** Project row for the Projects table hub card. */
export interface ProjectRow {
  id: number;
  name: string;
  number: string;
  favorite: boolean;
  /** Full address line shown in the Location column */
  location: string;
  /** Parsed for filters (US: "City, ST ZIP"; otherwise city + region/country after last comma). */
  city: string;
  state: string;
  stage: ProjectStage;
  startDate: string;
  endDate: string;
  program: string;
  region: ProjectRegion;
  projectManager: string;
  estimatedCost: number;
  originalBudget: number;
  jobToDateCost: number;
  forecastToComplete: number;
  estimatedCostAtCompletion: number;
  priorities: string;
}

/**
 * Derive city and US state (or non-US region) from the location string used in sample data.
 */
export function parseLocationCityState(location: string): { city: string; state: string } {
  const t = location.trim();
  const us = t.match(/^(.+),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/);
  if (us) return { city: us[1].trim(), state: us[2] };
  const twoPart = t.match(/^(.+),\s*(.+)$/);
  if (twoPart) return { city: twoPart[1].trim(), state: twoPart[2].trim() };
  return { city: t, state: "" };
}

/**
 * Project milestones in typical schedule order. Dates are derived from project start/end;
 * variance blends project-level schedule signal for the current stage with varied completed / forecast deltas per milestone.
 */
export const PROJECT_MILESTONES = [
  "Project Charter",
  "Feasibility Study",
  "Design Kickoff",
  "Project Scope",
  "Decision Support Package",
  "Readiness Review",
  "Construction Documents",
  "Designs Approved",
  "Storm Water Pollution Prevention Plan",
  "Environmental Survey",
  "Municipal Approvals",
  "Building Permits",
  "Bidding",
  "Notice to Proceed",
  "Site Mobilization",
  "Phase 1 - Construction",
  "MEP Rough-In",
  "Phase 2 - Construction",
  "Interior Finishes",
  "Phase 3 - Final Build",
  "Retrofit Start",
  "Substantial Completion",
  "Client Handoff",
] as const;

export type ProjectMilestoneName = (typeof PROJECT_MILESTONES)[number];

/** 1-based stage index (1–11) for each milestone; variance applies when project's stage matches. */
const MILESTONE_STAGE_INDEX: Record<ProjectMilestoneName, number> = {
  "Project Charter": 1,
  "Feasibility Study": 2,
  "Design Kickoff": 3,
  "Project Scope": 1,
  "Decision Support Package": 2,
  "Readiness Review": 3,
  "Construction Documents": 3,
  "Designs Approved": 3,
  "Storm Water Pollution Prevention Plan": 4,
  "Environmental Survey": 4,
  "Municipal Approvals": 4,
  "Building Permits": 4,
  "Bidding": 5,
  "Notice to Proceed": 6,
  "Site Mobilization": 6,
  "Phase 1 - Construction": 7,
  "MEP Rough-In": 7,
  "Phase 2 - Construction": 7,
  "Interior Finishes": 7,
  "Phase 3 - Final Build": 7,
  "Retrofit Start": 7,
  "Substantial Completion": 8,
  "Client Handoff": 9,
};

/**
 * First milestone in `PROJECT_MILESTONES` order mapped to the project's workflow stage.
 * When no milestone shares that stage index (e.g. Maintenance), returns `project.stage`.
 */
export function getCurrentMilestoneLabelForProject(project: ProjectRow): string {
  const stageOrder = getStageOrder(project.stage);
  for (const name of PROJECT_MILESTONES) {
    if (MILESTONE_STAGE_INDEX[name] === stageOrder) {
      return name;
    }
  }
  return project.stage;
}

/** Single milestone with baseline date, actual date, and variance in days (positive = late, negative = ahead). */
export interface ProjectMilestone {
  name: ProjectMilestoneName;
  baselineDate: string;
  actualDate: string;
  varianceDays: number;
}

/** Add days to an ISO date string, return YYYY-MM-DD. */
function addDaysToDate(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Compute total days between two ISO date strings. */
function daysBetween(start: string, end: string): number {
  const a = new Date(start);
  const b = new Date(end);
  return Math.round((b.getTime() - a.getTime()) / (24 * 60 * 60 * 1000));
}

/** Stable hash for per-milestone demo variance (deterministic per project + milestone name). */
function milestoneVarianceHash(projectId: number, name: string): number {
  let h = projectId * 5381;
  for (let i = 0; i < name.length; i++) {
    h = (h * 33 + name.charCodeAt(i)) >>> 0;
  }
  return h;
}

/**
 * Completed milestones: mix of on schedule, ahead, and some late.
 * Future milestones: mostly on plan with light pull-ahead / minor slip.
 */
const COMPLETED_MILESTONE_VARIANCE_DAYS = [
  0, 0, 0, -2, -5, -9, -14, 3, 7, -3, 0, 5, -7, 2, -1, 0, 4, -11, 0, 6,
] as const;

const FUTURE_MILESTONE_VARIANCE_DAYS = [
  0, 0, 0, 0, -3, -6, -2, 4, 0, -4, 1, 0, -8, 2, 0, 0, 3, -1, 0, 5,
] as const;

function varianceDaysForMilestone(
  project: ProjectRow,
  milestoneName: ProjectMilestoneName,
  milestoneStage: number,
  stageOrder: number,
  projectVarianceDays: number
): number {
  const h = milestoneVarianceHash(project.id, milestoneName);
  if (milestoneStage < stageOrder) {
    return COMPLETED_MILESTONE_VARIANCE_DAYS[h % COMPLETED_MILESTONE_VARIANCE_DAYS.length];
  }
  if (milestoneStage > stageOrder) {
    return FUTURE_MILESTONE_VARIANCE_DAYS[h % FUTURE_MILESTONE_VARIANCE_DAYS.length];
  }
  const jitter = ((h >> 8) % 5) - 2;
  return projectVarianceDays + jitter;
}

/**
 * Build milestone list for a project. Baseline dates are spread between startDate and endDate;
 * the project's primary variance applies to the current-stage block (with small jitter). Earlier
 * milestones use varied completed performance (on time / ahead / some late); later milestones use
 * light forecast variance.
 */
export function getProjectMilestones(
  project: ProjectRow,
  projectVarianceDays: number,
  /** Extra slip (days) on the milestone immediately after the last in-schedule milestone for the project's current stage (discrete overage). */
  followingMilestoneOverageDays = 0
): ProjectMilestone[] {
  const totalDays = daysBetween(project.startDate, project.endDate);
  const stageOrder = getStageOrder(project.stage);
  const n = PROJECT_MILESTONES.length;

  const result: ProjectMilestone[] = PROJECT_MILESTONES.map((name, i) => {
    const t = totalDays <= 0 ? 0 : (i + 0.5) / n;
    const baselineDate = addDaysToDate(project.startDate, Math.round(totalDays * t));
    const milestoneStage = MILESTONE_STAGE_INDEX[name];
    const varianceDays = varianceDaysForMilestone(project, name, milestoneStage, stageOrder, projectVarianceDays);
    const actualDate = addDaysToDate(baselineDate, varianceDays);
    return { name, baselineDate, actualDate, varianceDays };
  });

  if (followingMilestoneOverageDays > 0) {
    let lastStageIdx = -1;
    for (let i = result.length - 1; i >= 0; i--) {
      if (MILESTONE_STAGE_INDEX[result[i].name] === stageOrder) {
        lastStageIdx = i;
        break;
      }
    }
    const nextIdx = lastStageIdx + 1;
    if (lastStageIdx >= 0 && nextIdx < result.length) {
      const m = result[nextIdx];
      const vd = m.varianceDays + followingMilestoneOverageDays;
      result[nextIdx] = {
        ...m,
        varianceDays: vd,
        actualDate: addDaysToDate(m.baselineDate, vd),
      };
    }
  }

  return result;
}

/** Single date point for Project Dates Variance card. */
export interface ProjectDateVariancePoint {
  name: string;
  baseline: string;
  actual: string;
  varianceDays: number;
}

/** Project row for Project Dates Variance card. */
export interface ProjectDatesVarianceRow {
  id: number;
  name: string;
  dates: ProjectDateVariancePoint[];
}

/** Schedule variance in days for bar chart (negative = ahead, positive = behind / late). */
export interface ScheduleVarianceDatum {
  project: string;
  variance: number;
  /** Optional slip rolled into the next milestone after the current-stage block (see `getProjectMilestones`). */
  followingMilestoneOverageDays?: number;
}

export const PER_PAGE = 10;

/** Geographic region names for each project (1–50, matching REGIONS code index). */
export const PROJECT_REGIONS = [
  "Mid-Atlantic", "Midwest", "Midwest", "Southwest", "Southeast", "Southwest",
  "Midwest", "Southwest", "Midwest", "Northeast", "Southeast", "Midwest",
  "West", "West", "Midwest", "Southwest", "Southeast", "Midwest", "Northeast",
  "Southeast", "Midwest", "West", "Southeast", "Northeast", "Southeast",
  "Southwest", "Midwest", "Northeast", "Midwest", "Midwest", "Mid-Atlantic",
  "Southwest", "Southwest", "Southeast", "Midwest", "Northeast", "Midwest",
  "Midwest", "Southwest", "Southwest", "West", "Southwest", "Southeast",
  "Midwest", "Northeast", "West", "Midwest", "Mid-Atlantic", "International", "Southeast",
] as const;

export type ProjectRegion = (typeof PROJECT_REGIONS)[number];

/** Project Manager names assigned per project (1–50). */
const PROJECT_MANAGERS = [
  "Sarah Chen", "Marcus Rivera", "Priya Nair", "James O'Brien", "Elena Vasquez",
  "David Kim", "Aisha Moyo", "Thomas Nguyen", "Sarah Chen", "Marcus Rivera",
  "Priya Nair", "James O'Brien", "Elena Vasquez", "David Kim", "Aisha Moyo",
  "Thomas Nguyen", "Sarah Chen", "Marcus Rivera", "Priya Nair", "James O'Brien",
  "Elena Vasquez", "David Kim", "Aisha Moyo", "Thomas Nguyen", "Sarah Chen",
  "Marcus Rivera", "Priya Nair", "James O'Brien", "Elena Vasquez", "David Kim",
  "Aisha Moyo", "Thomas Nguyen", "Sarah Chen", "Marcus Rivera", "Priya Nair",
  "James O'Brien", "Elena Vasquez", "David Kim", "Aisha Moyo", "Thomas Nguyen",
  "Sarah Chen", "Marcus Rivera", "Priya Nair", "James O'Brien", "Elena Vasquez",
  "David Kim", "Aisha Moyo", "Thomas Nguyen", "Sarah Chen", "Marcus Rivera",
] as const;

/** Region codes for project numbers (NE=Northeast, MA=Mid-Atlantic, SE=Southeast, MW=Midwest, SW=Southwest, W=West). */
const REGIONS = ["MA", "MW", "MW", "SW", "SE", "SW", "MW", "SW", "MW", "NE", "SE", "MW", "W", "W", "MW", "SW", "SE", "MW", "NE", "SE", "MW", "W", "SE", "NE", "SE", "SW", "MW", "NE", "MW", "MW", "MA", "SW", "SW", "SE", "MW", "NE", "MW", "MW", "SW", "SW", "W", "SW", "SE", "MW", "NE", "W", "MW", "MA", "INT", "SE"] as const;

/** Project numbers with gaps (1001+) for canceled/completed projects. */
const PROJECT_NUMBERS = [1001, 1006, 1012, 1019, 1027, 1034, 1042, 1051, 1059, 1068, 1076, 1085, 1093, 1102, 1110, 1119, 1127, 1136, 1144, 1153, 1161, 1170, 1178, 1187, 1195, 1204, 1212, 1221, 1229, 1238, 1246, 1255, 1263, 1272, 1280, 1289, 1297, 1306, 1314, 1323, 1331, 1340, 1348, 1357, 1365, 1374, 1382, 1391, 1399, 1408];

/** Stage assigned per project (by id 1–50) so all 11 stages appear. Order matches PROJECT_STAGES (1–11). */
const SAMPLE_STAGES: ProjectStage[] = [
  "Course of Construction",   // 1
  "Course of Construction",   // 2
  "Post-Construction",       // 3
  "Handover",                 // 4
  "Course of Construction",   // 5
  "Permitting",               // 6
  "Final design",             // 7
  "Course of Construction",   // 8
  "Course of Construction",   // 9
  "Course of Construction",   // 10
  "Course of Construction",   // 11
  "Course of Construction",   // 12
  "Bidding",                  // 13
  "Final design",             // 14
  "Course of Construction",   // 15
  "Conceptual",               // 16
  "Course of Construction",   // 17
  "Pre-Construction",        // 18
  "Course of Construction",   // 19
  "Course of Construction",   // 20
  "Course of Construction",   // 21
  "Final design",             // 22
  "Course of Construction",   // 23
  "Conceptual",               // 24
  "Closeout",                 // 25
  "Course of Construction",   // 26
  "Pre-Construction",        // 27
  "Course of Construction",   // 28
  "Course of Construction",   // 29
  "Final design",             // 30
  "Feasibility",              // 31
  "Course of Construction",   // 32
  "Course of Construction",   // 33
  "Course of Construction",   // 34
  "Post-Construction",       // 35
  "Pre-Construction",        // 36
  "Course of Construction",   // 37
  "Course of Construction",   // 38
  "Course of Construction",   // 39
  "Maintenance",              // 40
  "Conceptual",               // 41
  "Final design",             // 42
  "Pre-Construction",        // 43
  "Course of Construction",   // 44
  "Course of Construction",   // 45
  "Course of Construction",   // 46
  "Course of Construction",   // 47
  "Course of Construction",   // 48
  "Final design",             // 49
  "Course of Construction",   // 50
];

/** Sample projects for the Projects table (50 projects). Program: Data Center | Retail | Commercial | Healthcare | Industrial | Infrastructure | Residential. */
const SAMPLE_PROJECT_ROWS_BASE: Omit<ProjectRow, "city" | "state" | "favorite" | "region" | "projectManager">[] = [
  { id: 1, name: "Northern Virginia Data Center Phase 2", number: `${REGIONS[0]}-${PROJECT_NUMBERS[0]}`, location: "Ashburn, VA 20147", stage: SAMPLE_STAGES[0], startDate: "2024-01-08", endDate: "2025-09-30", program: "Data Center", estimatedCost: 185000000, originalBudget: 178000000, jobToDateCost: 92000000, forecastToComplete: 187000000, estimatedCostAtCompletion: 187000000, priorities: "Schedule, Budget" },
  { id: 2, name: "Ohio Region Campus Expansion", number: `${REGIONS[1]}-${PROJECT_NUMBERS[1]}`, location: "Columbus, OH 43215", stage: SAMPLE_STAGES[1], startDate: "2024-02-01", endDate: "2025-11-15", program: "Data Center", estimatedCost: 220000000, originalBudget: 215000000, jobToDateCost: 88000000, forecastToComplete: 222000000, estimatedCostAtCompletion: 222000000, priorities: "Safety, Schedule" },
  { id: 3, name: "Roastery Chicago", number: `${REGIONS[2]}-${PROJECT_NUMBERS[2]}`, location: "Chicago, IL 60654", stage: SAMPLE_STAGES[2], startDate: "2024-01-15", endDate: "2025-06-30", program: "Retail", estimatedCost: 28500000, originalBudget: 27200000, jobToDateCost: 14200000, forecastToComplete: 28800000, estimatedCostAtCompletion: 28800000, priorities: "Quality, Schedule" },
  { id: 4, name: "Drive-Thru Store Prototype Phoenix", number: `${REGIONS[3]}-${PROJECT_NUMBERS[3]}`, location: "Phoenix, AZ 85004", stage: SAMPLE_STAGES[3], startDate: "2024-03-01", endDate: "2024-12-15", program: "Retail", estimatedCost: 3200000, originalBudget: 3050000, jobToDateCost: 1800000, forecastToComplete: 3180000, estimatedCostAtCompletion: 3180000, priorities: "Budget" },
  { id: 5, name: "Atlanta Data Hall 3 Buildout", number: `${REGIONS[4]}-${PROJECT_NUMBERS[4]}`, location: "Atlanta, GA 30318", stage: SAMPLE_STAGES[4], startDate: "2024-02-15", endDate: "2025-04-30", program: "Data Center", estimatedCost: 42000000, originalBudget: 40500000, jobToDateCost: 21000000, forecastToComplete: 41800000, estimatedCostAtCompletion: 41800000, priorities: "Schedule" },
  { id: 6, name: "Dallas Critical Facility Upgrade", number: `${REGIONS[5]}-${PROJECT_NUMBERS[5]}`, location: "Dallas, TX 75244", stage: SAMPLE_STAGES[5], startDate: "2024-05-01", endDate: "2026-01-31", program: "Data Center", estimatedCost: 68000000, originalBudget: 65000000, jobToDateCost: 4200000, forecastToComplete: 67500000, estimatedCostAtCompletion: 67500000, priorities: "Budget, Quality" },
  { id: 7, name: "Denver HQ Fit-Out", number: `${REGIONS[6]}-${PROJECT_NUMBERS[6]}`, location: "Denver, CO 80202", stage: SAMPLE_STAGES[6], startDate: "2024-06-01", endDate: "2025-08-31", program: "Commercial", estimatedCost: 8500000, originalBudget: 8200000, jobToDateCost: 0, forecastToComplete: 8600000, estimatedCostAtCompletion: 8600000, priorities: "Quality" },
  { id: 8, name: "Retail Pads Austin Phase 1", number: `${REGIONS[7]}-${PROJECT_NUMBERS[7]}`, location: "Austin, TX 78758", stage: SAMPLE_STAGES[7], startDate: "2024-01-20", endDate: "2025-03-15", program: "Commercial", estimatedCost: 12500000, originalBudget: 12000000, jobToDateCost: 6200000, forecastToComplete: 12400000, estimatedCostAtCompletion: 12400000, priorities: "Schedule" },
  { id: 9, name: "Supercenter Grand Rapids", number: `${REGIONS[8]}-${PROJECT_NUMBERS[8]}`, location: "Grand Rapids, MI 49503", stage: SAMPLE_STAGES[8], startDate: "2024-02-10", endDate: "2025-07-31", program: "Retail", estimatedCost: 18500000, originalBudget: 17800000, jobToDateCost: 7400000, forecastToComplete: 18600000, estimatedCostAtCompletion: 18600000, priorities: "Safety, Budget" },
  { id: 10, name: "Buffalo Substation Upgrade", number: `${REGIONS[9]}-${PROJECT_NUMBERS[9]}`, location: "Buffalo, NY 14202", stage: SAMPLE_STAGES[9], startDate: "2024-01-05", endDate: "2025-12-20", program: "Infrastructure", estimatedCost: 42000000, originalBudget: 40000000, jobToDateCost: 16800000, forecastToComplete: 42500000, estimatedCostAtCompletion: 42500000, priorities: "Safety, Schedule" },
  { id: 11, name: "Store Orlando", number: `${REGIONS[10]}-${PROJECT_NUMBERS[10]}`, location: "Orlando, FL 32822", stage: SAMPLE_STAGES[10], startDate: "2024-03-15", endDate: "2025-05-30", program: "Retail", estimatedCost: 12500000, originalBudget: 12200000, jobToDateCost: 5000000, forecastToComplete: 12600000, estimatedCostAtCompletion: 12600000, priorities: "Schedule" },
  { id: 12, name: "St. Mary's ED Expansion", number: `${REGIONS[11]}-${PROJECT_NUMBERS[11]}`, location: "Grand Rapids, MI 49503", stage: SAMPLE_STAGES[11], startDate: "2024-02-01", endDate: "2025-10-31", program: "Healthcare", estimatedCost: 38000000, originalBudget: 36500000, jobToDateCost: 15200000, forecastToComplete: 38200000, estimatedCostAtCompletion: 38200000, priorities: "Safety, Quality" },
  { id: 13, name: "Oregon Region Power & Cooling", number: `${REGIONS[12]}-${PROJECT_NUMBERS[12]}`, location: "Boardman, OR 97818", stage: SAMPLE_STAGES[12], startDate: "2024-07-01", endDate: "2026-06-30", program: "Data Center", estimatedCost: 95000000, originalBudget: 91000000, jobToDateCost: 5800000, forecastToComplete: 95200000, estimatedCostAtCompletion: 95200000, priorities: "Budget" },
  { id: 14, name: "Support Center Seattle Renovation", number: `${REGIONS[13]}-${PROJECT_NUMBERS[13]}`, location: "Seattle, WA 98134", stage: SAMPLE_STAGES[13], startDate: "2024-08-01", endDate: "2026-02-28", program: "Commercial", estimatedCost: 22000000, originalBudget: 21000000, jobToDateCost: 0, forecastToComplete: 21800000, estimatedCostAtCompletion: 21800000, priorities: "Quality" },
  { id: 15, name: "Chicago Meet-Me Room Expansion", number: `${REGIONS[14]}-${PROJECT_NUMBERS[14]}`, location: "Chicago, IL 60601", stage: SAMPLE_STAGES[14], startDate: "2024-04-01", endDate: "2025-02-28", program: "Data Center", estimatedCost: 12000000, originalBudget: 11500000, jobToDateCost: 3600000, forecastToComplete: 11900000, estimatedCostAtCompletion: 11900000, priorities: "Schedule" },
  { id: 16, name: "Houston Office", number: `${REGIONS[15]}-${PROJECT_NUMBERS[15]}`, location: "Houston, TX 77002", stage: SAMPLE_STAGES[15], startDate: "2024-09-01", endDate: "2026-03-31", program: "Commercial", estimatedCost: 6200000, originalBudget: 6000000, jobToDateCost: 0, forecastToComplete: 6150000, estimatedCostAtCompletion: 6150000, priorities: "Budget" },
  { id: 17, name: "Multifamily Nashville", number: `${REGIONS[16]}-${PROJECT_NUMBERS[16]}`, location: "Nashville, TN 37203", stage: SAMPLE_STAGES[16], startDate: "2024-01-10", endDate: "2025-11-30", program: "Residential", estimatedCost: 28500000, originalBudget: 27200000, jobToDateCost: 11400000, forecastToComplete: 28600000, estimatedCostAtCompletion: 28600000, priorities: "Schedule, Quality" },
  { id: 18, name: "Distribution Center Toledo", number: `${REGIONS[17]}-${PROJECT_NUMBERS[17]}`, location: "Toledo, OH 43608", stage: SAMPLE_STAGES[17], startDate: "2024-06-15", endDate: "2026-04-30", program: "Industrial", estimatedCost: 95000000, originalBudget: 90000000, jobToDateCost: 7200000, forecastToComplete: 94800000, estimatedCostAtCompletion: 94800000, priorities: "Budget, Schedule" },
  { id: 19, name: "Boston Gas Main Replacement", number: `${REGIONS[18]}-${PROJECT_NUMBERS[18]}`, location: "Boston, MA 02108", stage: SAMPLE_STAGES[18], startDate: "2024-02-20", endDate: "2025-08-15", program: "Infrastructure", estimatedCost: 18500000, originalBudget: 17800000, jobToDateCost: 5550000, forecastToComplete: 18600000, estimatedCostAtCompletion: 18600000, priorities: "Safety" },
  { id: 20, name: "Fulfillment Center Atlanta", number: `${REGIONS[19]}-${PROJECT_NUMBERS[19]}`, location: "Atlanta, GA 30336", stage: SAMPLE_STAGES[19], startDate: "2024-01-12", endDate: "2025-09-30", program: "Industrial", estimatedCost: 125000000, originalBudget: 120000000, jobToDateCost: 62500000, forecastToComplete: 124000000, estimatedCostAtCompletion: 124000000, priorities: "Schedule" },
  { id: 21, name: "Mercy Campus OR Renovation", number: `${REGIONS[20]}-${PROJECT_NUMBERS[20]}`, location: "Muskegon, MI 49444", stage: SAMPLE_STAGES[20], startDate: "2024-03-01", endDate: "2025-12-15", program: "Healthcare", estimatedCost: 22000000, originalBudget: 21200000, jobToDateCost: 6600000, forecastToComplete: 22100000, estimatedCostAtCompletion: 22100000, priorities: "Quality, Safety" },
  { id: 22, name: "San Francisco Bay Area Office", number: `${REGIONS[21]}-${PROJECT_NUMBERS[21]}`, location: "San Francisco, CA 94105", stage: SAMPLE_STAGES[21], startDate: "2024-05-01", endDate: "2026-01-31", program: "Commercial", estimatedCost: 45000000, originalBudget: 43200000, jobToDateCost: 1800000, forecastToComplete: 44800000, estimatedCostAtCompletion: 44800000, priorities: "Quality" },
  { id: 23, name: "Reserve Store Miami", number: `${REGIONS[22]}-${PROJECT_NUMBERS[22]}`, location: "Miami, FL 33139", stage: SAMPLE_STAGES[22], startDate: "2024-04-10", endDate: "2025-01-31", program: "Retail", estimatedCost: 4800000, originalBudget: 4600000, jobToDateCost: 1920000, forecastToComplete: 4780000, estimatedCostAtCompletion: 4780000, priorities: "Schedule" },
  { id: 24, name: "NYC Metro Edge Site", number: `${REGIONS[23]}-${PROJECT_NUMBERS[23]}`, location: "Secaucus, NJ 07094", stage: SAMPLE_STAGES[23], startDate: "2024-10-01", endDate: "2026-08-31", program: "Data Center", estimatedCost: 78000000, originalBudget: 75000000, jobToDateCost: 0, forecastToComplete: 77500000, estimatedCostAtCompletion: 77500000, priorities: "Budget" },
  { id: 25, name: "Atlanta Client Fit-Out", number: `${REGIONS[24]}-${PROJECT_NUMBERS[24]}`, location: "Atlanta, GA 30308", stage: SAMPLE_STAGES[24], startDate: "2024-02-01", endDate: "2024-11-30", program: "Commercial", estimatedCost: 4200000, originalBudget: 4050000, jobToDateCost: 1680000, forecastToComplete: 4180000, estimatedCostAtCompletion: 4180000, priorities: "Schedule" },
  { id: 26, name: "Industrial Shell Dallas", number: `${REGIONS[25]}-${PROJECT_NUMBERS[25]}`, location: "Dallas, TX 75240", stage: SAMPLE_STAGES[25], startDate: "2024-01-25", endDate: "2025-05-15", program: "Industrial", estimatedCost: 18500000, originalBudget: 17800000, jobToDateCost: 7400000, forecastToComplete: 18400000, estimatedCostAtCompletion: 18400000, priorities: "Budget" },
  { id: 27, name: "Supercenter Indianapolis", number: `${REGIONS[26]}-${PROJECT_NUMBERS[26]}`, location: "Indianapolis, IN 46250", stage: SAMPLE_STAGES[26], startDate: "2024-07-01", endDate: "2026-02-28", program: "Retail", estimatedCost: 19200000, originalBudget: 18500000, jobToDateCost: 960000, forecastToComplete: 19100000, estimatedCostAtCompletion: 19100000, priorities: "Schedule" },
  { id: 28, name: "Upstate NY Transmission", number: `${REGIONS[27]}-${PROJECT_NUMBERS[27]}`, location: "Syracuse, NY 13202", stage: SAMPLE_STAGES[27], startDate: "2024-01-15", endDate: "2026-06-30", program: "Infrastructure", estimatedCost: 125000000, originalBudget: 118000000, jobToDateCost: 37500000, forecastToComplete: 124000000, estimatedCostAtCompletion: 124000000, priorities: "Safety, Schedule" },
  { id: 29, name: "Store Minneapolis", number: `${REGIONS[28]}-${PROJECT_NUMBERS[28]}`, location: "Minneapolis, MN 55425", stage: SAMPLE_STAGES[28], startDate: "2024-04-01", endDate: "2025-06-30", program: "Retail", estimatedCost: 11800000, originalBudget: 11400000, jobToDateCost: 3540000, forecastToComplete: 11700000, estimatedCostAtCompletion: 11700000, priorities: "Budget" },
  { id: 30, name: "Outpatient Pavilion Lansing", number: `${REGIONS[29]}-${PROJECT_NUMBERS[29]}`, location: "Lansing, MI 48912", stage: SAMPLE_STAGES[29], startDate: "2024-08-15", endDate: "2026-09-30", program: "Healthcare", estimatedCost: 68000000, originalBudget: 65000000, jobToDateCost: 0, forecastToComplete: 67500000, estimatedCostAtCompletion: 67500000, priorities: "Quality" },
  { id: 31, name: "Virginia Solar + BESS", number: `${REGIONS[30]}-${PROJECT_NUMBERS[30]}`, location: "Dulles, VA 20166", stage: SAMPLE_STAGES[30], startDate: "2024-11-01", endDate: "2026-12-31", program: "Infrastructure", estimatedCost: 52000000, originalBudget: 50000000, jobToDateCost: 0, forecastToComplete: 51800000, estimatedCostAtCompletion: 51800000, priorities: "Budget" },
  { id: 32, name: "Distribution Center Dallas", number: `${REGIONS[31]}-${PROJECT_NUMBERS[31]}`, location: "Dallas, TX 75241", stage: SAMPLE_STAGES[31], startDate: "2024-02-15", endDate: "2025-10-31", program: "Industrial", estimatedCost: 85000000, originalBudget: 82000000, jobToDateCost: 34000000, forecastToComplete: 84800000, estimatedCostAtCompletion: 84800000, priorities: "Schedule" },
  { id: 33, name: "Phoenix Data Hall 1", number: `${REGIONS[32]}-${PROJECT_NUMBERS[32]}`, location: "Phoenix, AZ 85034", stage: SAMPLE_STAGES[32], startDate: "2024-03-10", endDate: "2025-07-31", program: "Data Center", estimatedCost: 38000000, originalBudget: 36500000, jobToDateCost: 11400000, forecastToComplete: 37800000, estimatedCostAtCompletion: 37800000, priorities: "Schedule" },
  { id: 34, name: "Office Building Charlotte", number: `${REGIONS[33]}-${PROJECT_NUMBERS[33]}`, location: "Charlotte, NC 28202", stage: SAMPLE_STAGES[33], startDate: "2024-01-08", endDate: "2025-08-30", program: "Commercial", estimatedCost: 42000000, originalBudget: 40500000, jobToDateCost: 16800000, forecastToComplete: 42200000, estimatedCostAtCompletion: 42200000, priorities: "Quality" },
  { id: 35, name: "Fuel Station & Convenience Detroit", number: `${REGIONS[34]}-${PROJECT_NUMBERS[34]}`, location: "Detroit, MI 48201", stage: SAMPLE_STAGES[34], startDate: "2024-05-01", endDate: "2024-12-20", program: "Retail", estimatedCost: 3200000, originalBudget: 3080000, jobToDateCost: 960000, forecastToComplete: 3180000, estimatedCostAtCompletion: 3180000, priorities: "Budget" },
  { id: 36, name: "Rhode Island Substation", number: `${REGIONS[35]}-${PROJECT_NUMBERS[35]}`, location: "Providence, RI 02903", stage: SAMPLE_STAGES[35], startDate: "2024-07-15", endDate: "2026-05-31", program: "Infrastructure", estimatedCost: 35000000, originalBudget: 33500000, jobToDateCost: 2100000, forecastToComplete: 34800000, estimatedCostAtCompletion: 34800000, priorities: "Safety" },
  { id: 37, name: "Store Denver", number: `${REGIONS[36]}-${PROJECT_NUMBERS[36]}`, location: "Denver, CO 80222", stage: SAMPLE_STAGES[36], startDate: "2024-04-20", endDate: "2025-07-15", program: "Retail", estimatedCost: 12200000, originalBudget: 11800000, jobToDateCost: 3660000, forecastToComplete: 12100000, estimatedCostAtCompletion: 12100000, priorities: "Schedule" },
  { id: 38, name: "Imaging Center Ann Arbor", number: `${REGIONS[37]}-${PROJECT_NUMBERS[37]}`, location: "Ann Arbor, MI 48105", stage: SAMPLE_STAGES[37], startDate: "2024-03-15", endDate: "2025-04-30", program: "Healthcare", estimatedCost: 12500000, originalBudget: 12000000, jobToDateCost: 5000000, forecastToComplete: 12400000, estimatedCostAtCompletion: 12400000, priorities: "Quality" },
  { id: 39, name: "Texas Region Data Center", number: `${REGIONS[38]}-${PROJECT_NUMBERS[38]}`, location: "San Antonio, TX 78216", stage: SAMPLE_STAGES[38], startDate: "2024-02-01", endDate: "2025-12-15", program: "Data Center", estimatedCost: 195000000, originalBudget: 188000000, jobToDateCost: 78000000, forecastToComplete: 196000000, estimatedCostAtCompletion: 196000000, priorities: "Schedule" },
  { id: 40, name: "Store Las Vegas", number: `${REGIONS[39]}-${PROJECT_NUMBERS[39]}`, location: "Las Vegas, NV 89109", stage: SAMPLE_STAGES[39], startDate: "2024-05-15", endDate: "2024-11-30", program: "Retail", estimatedCost: 2850000, originalBudget: 2720000, jobToDateCost: 855000, forecastToComplete: 2820000, estimatedCostAtCompletion: 2820000, priorities: "Budget" },
  { id: 41, name: "Salt Lake City Buildout", number: `${REGIONS[40]}-${PROJECT_NUMBERS[40]}`, location: "Salt Lake City, UT 84116", stage: SAMPLE_STAGES[40], startDate: "2024-09-01", endDate: "2026-06-30", program: "Data Center", estimatedCost: 55000000, originalBudget: 52800000, jobToDateCost: 0, forecastToComplete: 54800000, estimatedCostAtCompletion: 54800000, priorities: "Budget" },
  { id: 42, name: "Phoenix Office", number: `${REGIONS[41]}-${PROJECT_NUMBERS[41]}`, location: "Phoenix, AZ 85004", stage: SAMPLE_STAGES[41], startDate: "2024-06-15", endDate: "2025-12-31", program: "Commercial", estimatedCost: 5800000, originalBudget: 5600000, jobToDateCost: 0, forecastToComplete: 5750000, estimatedCostAtCompletion: 5750000, priorities: "Quality" },
  { id: 43, name: "Mixed-Use Raleigh", number: `${REGIONS[42]}-${PROJECT_NUMBERS[42]}`, location: "Raleigh, NC 27601", stage: SAMPLE_STAGES[42], startDate: "2024-08-01", endDate: "2026-11-30", program: "Commercial", estimatedCost: 72000000, originalBudget: 69000000, jobToDateCost: 4320000, forecastToComplete: 71800000, estimatedCostAtCompletion: 71800000, priorities: "Schedule" },
  { id: 44, name: "Supercenter Cincinnati", number: `${REGIONS[43]}-${PROJECT_NUMBERS[43]}`, location: "Cincinnati, OH 45240", stage: SAMPLE_STAGES[43], startDate: "2024-03-01", endDate: "2025-08-31", program: "Retail", estimatedCost: 18800000, originalBudget: 18100000, jobToDateCost: 5640000, forecastToComplete: 18700000, estimatedCostAtCompletion: 18700000, priorities: "Safety" },
  { id: 45, name: "Brooklyn Network Upgrade", number: `${REGIONS[44]}-${PROJECT_NUMBERS[44]}`, location: "Brooklyn, NY 11201", stage: SAMPLE_STAGES[44], startDate: "2024-01-22", endDate: "2025-09-15", program: "Infrastructure", estimatedCost: 28000000, originalBudget: 26800000, jobToDateCost: 8400000, forecastToComplete: 27900000, estimatedCostAtCompletion: 27900000, priorities: "Safety, Schedule" },
  { id: 46, name: "Store San Diego", number: `${REGIONS[45]}-${PROJECT_NUMBERS[45]}`, location: "San Diego, CA 92108", stage: SAMPLE_STAGES[45], startDate: "2024-04-05", endDate: "2025-05-20", program: "Retail", estimatedCost: 11500000, originalBudget: 11100000, jobToDateCost: 3450000, forecastToComplete: 11400000, estimatedCostAtCompletion: 11400000, priorities: "Schedule" },
  { id: 47, name: "Medical Office Building Port Huron", number: `${REGIONS[46]}-${PROJECT_NUMBERS[46]}`, location: "Port Huron, MI 48060", stage: SAMPLE_STAGES[46], startDate: "2024-02-10", endDate: "2025-11-30", program: "Healthcare", estimatedCost: 18500000, originalBudget: 17800000, jobToDateCost: 7400000, forecastToComplete: 18400000, estimatedCostAtCompletion: 18400000, priorities: "Quality" },
  { id: 48, name: "Virginia HQ2 Phase 2", number: `${REGIONS[47]}-${PROJECT_NUMBERS[47]}`, location: "Arlington, VA 22202", stage: SAMPLE_STAGES[47], startDate: "2024-01-01", endDate: "2026-06-30", program: "Commercial", estimatedCost: 2500000000, originalBudget: 2400000000, jobToDateCost: 625000000, forecastToComplete: 2490000000, estimatedCostAtCompletion: 2490000000, priorities: "Schedule, Quality" },
  { id: 49, name: "Farmer Support Center Expansion", number: `${REGIONS[48]}-${PROJECT_NUMBERS[48]}`, location: "San José, Costa Rica", stage: SAMPLE_STAGES[48], startDate: "2024-07-01", endDate: "2026-03-31", program: "Commercial", estimatedCost: 12000000, originalBudget: 11500000, jobToDateCost: 0, forecastToComplete: 11900000, estimatedCostAtCompletion: 11900000, priorities: "Quality" },
  { id: 50, name: "Miami Critical Load Upgrade", number: `${REGIONS[49]}-${PROJECT_NUMBERS[49]}`, location: "Miami, FL 33122", stage: SAMPLE_STAGES[49], startDate: "2024-04-01", endDate: "2025-06-30", program: "Data Center", estimatedCost: 22000000, originalBudget: 21200000, jobToDateCost: 6600000, forecastToComplete: 21900000, estimatedCostAtCompletion: 21900000, priorities: "Schedule" },
];

export const sampleProjectRows: ProjectRow[] = SAMPLE_PROJECT_ROWS_BASE.map((row, i) => ({
  ...row,
  favorite: false,
  region: PROJECT_REGIONS[i],
  projectManager: PROJECT_MANAGERS[i],
  ...parseLocationCityState(row.location),
}));

/** Currency columns that use dual-slider range filters on the Projects grid. */
export type ProjectCurrencyField =
  | "estimatedCost"
  | "originalBudget"
  | "jobToDateCost"
  | "forecastToComplete"
  | "estimatedCostAtCompletion";

export type CurrencySliderExtent = { min: number; max: number; step: number };

/** ~200 steps across the span, adjusted so `(max - min) % step === 0` (Slider expects clean increments). */
function niceSliderStep(span: number): number {
  if (!Number.isFinite(span) || span <= 0) return 1;
  let step = Math.max(1, Math.floor(span / 200));
  while (step > 1 && span % step !== 0) step -= 1;
  return step;
}

function currencyFieldExtent(field: ProjectCurrencyField): CurrencySliderExtent {
  const vals = sampleProjectRows.map((r) => r[field]);
  let min = Math.min(...vals);
  let max = Math.max(...vals);
  if (!Number.isFinite(min)) min = 0;
  if (!Number.isFinite(max)) max = 1;
  if (max < min) [min, max] = [max, min];
  if (min === max) {
    return { min: min - 1, max: max + 1, step: 1 };
  }
  const step = niceSliderStep(max - min);
  return { min, max, step };
}

/** Min / max / step for each money column, derived from `sampleProjectRows`. */
export const PROJECT_CURRENCY_SLIDER_EXTENTS: Record<ProjectCurrencyField, CurrencySliderExtent> = {
  estimatedCost: currencyFieldExtent("estimatedCost"),
  originalBudget: currencyFieldExtent("originalBudget"),
  jobToDateCost: currencyFieldExtent("jobToDateCost"),
  forecastToComplete: currencyFieldExtent("forecastToComplete"),
  estimatedCostAtCompletion: currencyFieldExtent("estimatedCostAtCompletion"),
};

/** Distinct program values for grid set filters. */
export const PROJECT_PROGRAMS = [
  "Commercial",
  "Data Center",
  "Healthcare",
  "Industrial",
  "Infrastructure",
  "Residential",
  "Retail",
] as const;

/** Distinct `priorities` strings in sample data (for grid select filters). */
export const PROJECT_PRIORITIES_DISTINCT: string[] = [
  ...new Set(sampleProjectRows.map((r) => r.priorities)),
].sort();

/** Distinct cities in sample data (for grid select filters). */
export const PROJECT_CITIES_DISTINCT: string[] = [
  ...new Set(sampleProjectRows.map((r) => r.city)),
].sort((a, b) => a.localeCompare(b));

/** Distinct states/regions in sample data (for grid select filters). */
export const PROJECT_STATES_DISTINCT: string[] = [
  ...new Set(sampleProjectRows.map((r) => r.state).filter(Boolean)),
].sort((a, b) => a.localeCompare(b));

/** Projects by stage for pie/donut chart (count per stage). */
export const projectsByStage = (() => {
  const countByStage: Record<string, number> = {};
  sampleProjectRows.forEach((r) => {
    countByStage[r.stage] = (countByStage[r.stage] ?? 0) + 1;
  });
  return Object.entries(countByStage).map(([name, value]) => ({ name, value }));
})();

/** Primary schedule variance (days) per sample project index — includes strong late (+) and ahead (−) values. */
const SCHEDULE_VARIANCE_DAYS: number[] = [
  24, -14, 0, -8, 18, 6, -11, 22, -6, 28, -3, 15, 9, -16, 5, -9, 21, 7, -12, 19, 0, 11, -7, 26, 4, -18, 8,
  13, -5, 17, -2, 20, 14, 0, 10, -15, 6, 23, -4, 12, 25, 3, -10, 16, 0, 9, -13, 5, 7, -8,
];

/** Discrete milestone overage (days) on the next milestone after the current-stage block; 0 = none. */
const FOLLOWING_MILESTONE_OVERAGE_DAYS: number[] = [
  0, 0, 0, 12, 0, 8, 0, 14, 0, 10, 0, 6, 7, 0, 0, 0, 11, 0, 0, 9, 0, 5, 0, 15, 0, 0, 8, 0, 13, 0, 0, 10, 0, 0,
  6, 0, 0, 12, 0, 7, 9, 0, 0, 0, 11, 0, 0, 5, 0, 0,
];

/** Schedule variance in days per project for the Schedule Variance bar chart (50 projects). */
export const scheduleVarianceData: ScheduleVarianceDatum[] = sampleProjectRows.map((p, i) => {
  const variance = SCHEDULE_VARIANCE_DAYS[i] ?? 0;
  const over = FOLLOWING_MILESTONE_OVERAGE_DAYS[i] ?? 0;
  return {
    project: p.name,
    variance,
    ...(over > 0 ? { followingMilestoneOverageDays: over } : {}),
  };
});

/** Milestones for each sample project: current-stage block uses schedule variance (+ jitter); earlier/later milestones use demo spreads (on time / ahead / late); optional overage on the milestone after the current-stage block. */
export const sampleProjectMilestones: Map<number, ProjectMilestone[]> = (() => {
  const map = new Map<number, ProjectMilestone[]>();
  sampleProjectRows.forEach((row) => {
    const d = scheduleVarianceData.find((x) => x.project === row.name);
    const variance = d?.variance ?? 0;
    const over = d?.followingMilestoneOverageDays ?? 0;
    map.set(row.id, getProjectMilestones(row, variance, over));
  });
  return map;
})();

/** Hub cards: show only the N projects with the worst schedule variance (largest positive `variance` = most behind). */
export const TOP_SCHEDULE_RISK_PROJECT_COUNT = 5;

/** Milestone heatmap (Project Dates Variance D): additional rows beyond `TOP_SCHEDULE_RISK_PROJECT_COUNT`. */
export const MILESTONE_HEATMAP_EXTRA_PROJECT_COUNT = 3;

/** Same sort as `topScheduleRiskProjectRows`, extended for the milestone heatmap card only. */
export const topScheduleRiskProjectRowsForMilestoneHeatmap: ProjectRow[] = (() => {
  const n = TOP_SCHEDULE_RISK_PROJECT_COUNT + MILESTONE_HEATMAP_EXTRA_PROJECT_COUNT;
  const sorted = [...scheduleVarianceData].sort((a, b) => b.variance - a.variance);
  return sorted
    .slice(0, n)
    .map((d) => sampleProjectRows.find((r) => r.name === d.project))
    .filter((r): r is ProjectRow => r !== undefined);
})();

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Full `ProjectRow`s for the top-risk projects, sorted worst-first (same order as `projectDatesVarianceRows`). */
export const topScheduleRiskProjectRows: ProjectRow[] = (() => {
  const sorted = [...scheduleVarianceData].sort((a, b) => b.variance - a.variance);
  return sorted
    .slice(0, TOP_SCHEDULE_RISK_PROJECT_COUNT)
    .map((d) => sampleProjectRows.find((r) => r.name === d.project))
    .filter((r): r is ProjectRow => r !== undefined);
})();

/** Project Dates Variance cards: top-risk projects only, same sort as `topScheduleRiskProjectRows`. */
export const projectDatesVarianceRows: ProjectDatesVarianceRow[] = topScheduleRiskProjectRows.map((p) => {
  const variance = scheduleVarianceData.find((d) => d.project === p.name)?.variance ?? 0;
  const h = milestoneVarianceHash(p.id, "dates-row");
  const mid = Math.round(variance * 0.55);
  const mildLate = Math.max(0, Math.round(variance * 0.35));
  /** Per-row mix so charts show late, on schedule, and ahead — not only cumulative slip. */
  const patterns: readonly [number, number][] = [
    [variance, 0],
    [mildLate, -10],
    [variance, mid],
    [0, -6],
    [-5, variance],
    [Math.round(variance * 0.4), -14],
    [0, 0],
  ] as const;
  const [vNtp, vSc] = patterns[h % patterns.length];
  const milestones = sampleProjectMilestones.get(p.id);
  const ntp = milestones?.find((m) => m.name === "Notice to Proceed");
  const sc = milestones?.find((m) => m.name === "Substantial Completion");
  const ntpBaseline = ntp?.baselineDate ?? p.startDate;
  const scBaseline = sc?.baselineDate ?? p.endDate;
  return {
    id: p.id,
    name: p.name,
    dates: [
      { name: "Notice to Proceed", baseline: ntpBaseline, actual: addDays(ntpBaseline, vNtp), varianceDays: vNtp },
      { name: "Substantial Completion", baseline: scBaseline, actual: addDays(scBaseline, vSc), varianceDays: vSc },
    ],
  };
});

/** Variance axis bounds for Project Dates Variance card (days). Wider than sample extrema so markers aren't clamped at the rails. */
export const VARIANCE_AXIS_MIN = -24;
export const VARIANCE_AXIS_MAX = 32;

/** Color for variance: red (late / behind), yellow (on time), green (ahead). */
export function varianceToColor(varianceDays: number): string {
  if (varianceDays > 0) return "#c00";
  if (varianceDays === 0) return "#c9a227";
  return "#00a878";
}
