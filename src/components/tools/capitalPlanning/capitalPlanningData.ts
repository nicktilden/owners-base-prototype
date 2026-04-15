import type { DropdownFlyoutOption } from "@procore/core-react";

export const PROJECT_STATUS_OPTIONS = [
  "Pre-Construction",
  "Course of Construction",
  "Concept",
  "Bidding",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUS_OPTIONS)[number];

export const PRIORITY_OPTIONS = ["High", "Medium", "Low"] as const;
export type ProjectPriority = (typeof PRIORITY_OPTIONS)[number];

export const CURVE_OPTIONS = ["Front-Loaded", "Back-Loaded", "Bell", "Linear", "Manual"] as const;
export type ProjectCurve = (typeof CURVE_OPTIONS)[number];

export const STATUS_PILL_COLOR: Record<
  ProjectStatus,
  "blue" | "cyan" | "gray" | "green" | "magenta" | "yellow"
> = {
  "Pre-Construction": "blue",
  "Course of Construction": "green",
  Concept: "gray",
  Bidding: "yellow",
};

export const LUMP_SUM_PLANNED_AMOUNT_SOURCE = "lump-sum-manual";

/** Planned amount source: opens High Level Budget Items tearsheet when chosen. */
export const HIGH_LEVEL_BUDGET_ITEMS_SOURCE = "high-level-budget-items";

/** Planned amount follows {@link CapitalPlanningSampleRow.originalBudget}. */
export const PROJECT_BUDGET_ORIGINAL_SOURCE = "project-budget-original";

/** Planned amount follows {@link CapitalPlanningSampleRow.revisedBudget}. */
export const PROJECT_BUDGET_REVISED_SOURCE = "project-budget-revised";

/** No explicit source yet defaults to lump sum — planned amount stays editable until the user picks another source. */
export function isLumpSumPlannedAmountSource(source: string | undefined): boolean {
  return source === undefined || source === LUMP_SUM_PLANNED_AMOUNT_SOURCE;
}

/** Non-selectable flyout row — label is shown as helper text above the real options. */
export const PLANNED_AMOUNT_FLYOUT_CAPTION_VALUE = "__capital_planning_planned_amount_flyout_caption__";

export const PLANNED_AMOUNT_SOURCE_OPTIONS: DropdownFlyoutOption[] = [
  {
    value: PLANNED_AMOUNT_FLYOUT_CAPTION_VALUE,
    label: "Select planned amount type",
  },
  { value: LUMP_SUM_PLANNED_AMOUNT_SOURCE, label: "Lump Sum Manual Entry" },
  { value: HIGH_LEVEL_BUDGET_ITEMS_SOURCE, label: "High Level Budget Items" },
  {
    value: "project-budget",
    label: "Project Budget",
    children: [
      { value: "project-budget-original", label: "Original Budget" },
      { value: "project-budget-revised", label: "Revised Budget" },
    ],
  },
];

export interface CapitalPlanningSampleRow {
  id: string;
  projectId: string;
  project: string;
  plannedAmount: number;
  status: ProjectStatus;
  priority: ProjectPriority;
  /** Null when the project has no budget baseline yet (e.g. Concept / early Bidding). */
  originalBudget: number | null;
  /** Null when the project has no budget baseline yet (e.g. Concept / early Bidding). */
  revisedBudget: number | null;
  /** Null when the project has no job costs yet (e.g. Concept / early Bidding). */
  jobToDateCosts: number | null;
  startDate: string;
  endDate: string;
  curve: ProjectCurve;
  remaining: number;
}

/** Sample rows; `startDate` / `endDate` align with the program forecast grid (FY 2026–FY 2031, Jan 1 … Dec 31). */
export const SAMPLE_PROJECT_ROWS: CapitalPlanningSampleRow[] = [
  {
    id: "p1",
    projectId: "1",
    project: "North Patient Tower",
    plannedAmount: 2_450_000,
    status: "Pre-Construction",
    priority: "High",
    originalBudget: 2_200_000,
    revisedBudget: 2_450_000,
    jobToDateCosts: 185_000,
    startDate: "2026-06-01",
    endDate: "2028-12-31",
    curve: "Bell",
    remaining: 2_265_000,
  },
  {
    id: "p2",
    projectId: "2",
    project: "Central Energy Plant",
    plannedAmount: 4_120_000,
    status: "Course of Construction",
    priority: "High",
    originalBudget: 3_800_000,
    revisedBudget: 4_050_000,
    jobToDateCosts: 1_020_000,
    startDate: "2026-02-01",
    endDate: "2027-09-30",
    curve: "Front-Loaded",
    remaining: 3_030_000,
  },
  {
    id: "p3",
    projectId: "3",
    project: "South Parking Structure",
    plannedAmount: 890_000,
    status: "Concept",
    priority: "Medium",
    originalBudget: null,
    revisedBudget: null,
    jobToDateCosts: null,
    startDate: "2028-04-01",
    endDate: "2029-12-31",
    curve: "Linear",
    remaining: 877_500,
  },
  {
    id: "p4",
    projectId: "4",
    project: "Research Lab Fit-Out",
    plannedAmount: 1_640_000,
    status: "Bidding",
    priority: "Low",
    originalBudget: null,
    revisedBudget: null,
    jobToDateCosts: null,
    startDate: "2030-02-10",
    endDate: "2031-11-15",
    curve: "Manual",
    remaining: 1_230_000,
  },
  {
    id: "p5",
    projectId: "5",
    project: "West Campus Chiller Replacement",
    plannedAmount: 3_275_000,
    status: "Pre-Construction",
    priority: "Medium",
    originalBudget: 3_100_000,
    revisedBudget: 3_275_000,
    jobToDateCosts: 48_000,
    startDate: "2026-09-01",
    endDate: "2028-06-30",
    curve: "Back-Loaded",
    remaining: 3_227_000,
  },
  {
    id: "p6",
    projectId: "6",
    project: "ICU Expansion Phase 2",
    plannedAmount: 5_800_000,
    status: "Course of Construction",
    priority: "High",
    originalBudget: 5_400_000,
    revisedBudget: 5_750_000,
    jobToDateCosts: 2_100_000,
    startDate: "2026-01-10",
    endDate: "2029-08-31",
    curve: "Bell",
    remaining: 3_700_000,
  },
  {
    id: "p7",
    projectId: "7",
    project: "Helipad & Rooftop Mechanical",
    plannedAmount: 1_125_000,
    status: "Bidding",
    priority: "Medium",
    originalBudget: null,
    revisedBudget: null,
    jobToDateCosts: null,
    startDate: "2027-07-01",
    endDate: "2028-05-31",
    curve: "Linear",
    remaining: 980_000,
  },
  {
    id: "p8",
    projectId: "8",
    project: "Behavioral Health Suite",
    plannedAmount: 2_980_000,
    status: "Concept",
    priority: "Low",
    originalBudget: null,
    revisedBudget: null,
    jobToDateCosts: null,
    startDate: "2029-01-15",
    endDate: "2031-04-30",
    curve: "Front-Loaded",
    remaining: 2_650_000,
  },
  {
    id: "p9",
    projectId: "9",
    project: "Main Lobby & Wayfinding Renovation",
    plannedAmount: 640_000,
    status: "Pre-Construction",
    priority: "Low",
    originalBudget: 620_000,
    revisedBudget: 640_000,
    jobToDateCosts: 12_000,
    startDate: "2028-03-01",
    endDate: "2029-11-30",
    curve: "Linear",
    remaining: 640_000,
  },
  {
    id: "p10",
    projectId: "10",
    project: "Central Sterile Supply Upgrade",
    plannedAmount: 1_890_000,
    status: "Course of Construction",
    priority: "Medium",
    originalBudget: 1_720_000,
    revisedBudget: 1_890_000,
    jobToDateCosts: 512_000,
    startDate: "2026-11-01",
    endDate: "2027-12-15",
    curve: "Manual",
    remaining: 1_378_000,
  },
  {
    id: "p11",
    projectId: "11",
    project: "MRI Suite 3B Renovation",
    plannedAmount: 3_420_000,
    status: "Pre-Construction",
    priority: "High",
    originalBudget: 3_200_000,
    revisedBudget: 3_420_000,
    jobToDateCosts: 95_000,
    startDate: "2026-08-15",
    endDate: "2028-03-31",
    curve: "Bell",
    remaining: 3_325_000,
  },
  {
    id: "p12",
    projectId: "12",
    project: "East Bridge Link Walkway",
    plannedAmount: 2_050_000,
    status: "Bidding",
    priority: "Medium",
    originalBudget: null,
    revisedBudget: null,
    jobToDateCosts: null,
    startDate: "2027-01-01",
    endDate: "2028-10-31",
    curve: "Linear",
    remaining: 1_890_000,
  },
  {
    id: "p13",
    projectId: "13",
    project: "Data Center Cooling Upgrade",
    plannedAmount: 4_800_000,
    status: "Course of Construction",
    priority: "High",
    originalBudget: 4_500_000,
    revisedBudget: 4_750_000,
    jobToDateCosts: 1_890_000,
    startDate: "2026-03-01",
    endDate: "2027-06-30",
    curve: "Front-Loaded",
    remaining: 2_860_000,
  },
  {
    id: "p14",
    projectId: "14",
    project: "Outpatient Pharmacy Expansion",
    plannedAmount: 980_000,
    status: "Concept",
    priority: "Low",
    originalBudget: null,
    revisedBudget: null,
    jobToDateCosts: null,
    startDate: "2029-06-01",
    endDate: "2030-12-31",
    curve: "Back-Loaded",
    remaining: 920_000,
  },
  {
    id: "p15",
    projectId: "15",
    project: "Surgical Suite 4 HVAC Replacement",
    plannedAmount: 2_275_000,
    status: "Pre-Construction",
    priority: "Medium",
    originalBudget: 2_100_000,
    revisedBudget: 2_275_000,
    jobToDateCosts: 42_000,
    startDate: "2026-12-01",
    endDate: "2028-08-15",
    curve: "Manual",
    remaining: 2_233_000,
  },
  {
    id: "p16",
    projectId: "16",
    project: "Loading Dock & Receiving Modernization",
    plannedAmount: 1_180_000,
    status: "Bidding",
    priority: "Low",
    originalBudget: 1_050_000,
    revisedBudget: 1_180_000,
    jobToDateCosts: null,
    startDate: "2027-09-01",
    endDate: "2028-12-20",
    curve: "Linear",
    remaining: 1_100_000,
  },
  {
    id: "p17",
    projectId: "17",
    project: "Nurse Call System Replacement — Campus",
    plannedAmount: 3_650_000,
    status: "Course of Construction",
    priority: "High",
    originalBudget: 3_400_000,
    revisedBudget: 3_600_000,
    jobToDateCosts: 1_200_000,
    startDate: "2026-01-20",
    endDate: "2027-11-30",
    curve: "Bell",
    remaining: 2_400_000,
  },
  {
    id: "p18",
    projectId: "18",
    project: "Radiation Oncology Shielding Upgrade",
    plannedAmount: 5_200_000,
    status: "Pre-Construction",
    priority: "High",
    originalBudget: 4_900_000,
    revisedBudget: 5_200_000,
    jobToDateCosts: 210_000,
    startDate: "2026-10-01",
    endDate: "2029-05-31",
    curve: "Back-Loaded",
    remaining: 4_990_000,
  },
  {
    id: "p19",
    projectId: "19",
    project: "Staff Locker & Wellness Center",
    plannedAmount: 720_000,
    status: "Concept",
    priority: "Medium",
    originalBudget: null,
    revisedBudget: null,
    jobToDateCosts: null,
    startDate: "2030-03-01",
    endDate: "2031-08-30",
    curve: "Linear",
    remaining: 680_000,
  },
  {
    id: "p20",
    projectId: "20",
    project: "Emergency Generator Paralleling",
    plannedAmount: 1_450_000,
    status: "Bidding",
    priority: "High",
    originalBudget: 1_380_000,
    revisedBudget: 1_450_000,
    jobToDateCosts: 18_000,
    startDate: "2027-02-15",
    endDate: "2028-01-31",
    curve: "Front-Loaded",
    remaining: 1_432_000,
  },
  {
    id: "p21",
    projectId: "21",
    project: "Pediatric Play Deck & Family Lounge",
    plannedAmount: 560_000,
    status: "Pre-Construction",
    priority: "Low",
    originalBudget: 520_000,
    revisedBudget: 560_000,
    jobToDateCosts: 8_000,
    startDate: "2028-07-01",
    endDate: "2029-04-30",
    curve: "Linear",
    remaining: 552_000,
  },
  {
    id: "p22",
    projectId: "22",
    project: "Central Plant SCADA & Controls",
    plannedAmount: 2_890_000,
    status: "Course of Construction",
    priority: "Medium",
    originalBudget: 2_650_000,
    revisedBudget: 2_890_000,
    jobToDateCosts: 640_000,
    startDate: "2026-05-10",
    endDate: "2027-09-15",
    curve: "Manual",
    remaining: 2_250_000,
  },
  {
    id: "p23",
    projectId: "23",
    project: "Interventional Radiology Suite 1",
    plannedAmount: 6_100_000,
    status: "Pre-Construction",
    priority: "High",
    originalBudget: 5_800_000,
    revisedBudget: 6_100_000,
    jobToDateCosts: 125_000,
    startDate: "2026-09-20",
    endDate: "2029-12-20",
    curve: "Bell",
    remaining: 5_975_000,
  },
  {
    id: "p24",
    projectId: "24",
    project: "Site Utilities — Phase 3 Storm",
    plannedAmount: 1_320_000,
    status: "Bidding",
    priority: "Medium",
    originalBudget: null,
    revisedBudget: null,
    jobToDateCosts: null,
    startDate: "2027-11-01",
    endDate: "2029-03-31",
    curve: "Linear",
    remaining: 1_210_000,
  },
  {
    id: "p25",
    projectId: "25",
    project: "Cafeteria & Retail Pod Refresh",
    plannedAmount: 410_000,
    status: "Concept",
    priority: "Low",
    originalBudget: 380_000,
    revisedBudget: 410_000,
    jobToDateCosts: null,
    startDate: "2029-09-01",
    endDate: "2030-06-30",
    curve: "Linear",
    remaining: 395_000,
  },
];

export function initialPriorities(): Record<string, ProjectPriority> {
  return Object.fromEntries(SAMPLE_PROJECT_ROWS.map((r) => [r.id, r.priority])) as Record<
    string,
    ProjectPriority
  >;
}

export function initialCurves(): Record<string, ProjectCurve> {
  return Object.fromEntries(SAMPLE_PROJECT_ROWS.map((r) => [r.id, r.curve])) as Record<string, ProjectCurve>;
}

export function isoStringToDate(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

/** For controlled DateSelect: empty / invalid ISO means “no value” (cleared). */
export function optionalIsoStringToDate(iso: string): Date | undefined {
  const t = iso?.trim();
  if (!t) return undefined;
  const d = new Date(`${t}T00:00:00`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export function dateToIsoString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function initialRowDates(): Record<string, { startDate: string; endDate: string }> {
  return Object.fromEntries(
    SAMPLE_PROJECT_ROWS.map((r) => [r.id, { startDate: r.startDate, endDate: r.endDate }])
  ) as Record<string, { startDate: string; endDate: string }>;
}
