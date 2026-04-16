import type { DropdownFlyoutOption } from "@procore/core-react";

export const PROJECT_STATUS_OPTIONS = [
  "Pre-Construction",
  "Course of Construction",
  "Concept",
  "Bidding",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUS_OPTIONS)[number];

/**
 * Prototype program “regions” for Capital Planning table grouping.
 * {@link assignedCapitalPlanningRegion} picks one per row id (stable, pseudorandom spread).
 */
export const CAPITAL_PLANNING_REGIONS = [
  "Pacific Northwest",
  "Mountain West",
  "Southwest",
  "Central Plains",
  "Mid-Atlantic",
  "Southeast",
] as const;

export type CapitalPlanningRegion = (typeof CAPITAL_PLANNING_REGIONS)[number];

function hashRowIdForRegionBucket(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = Math.imul(31, h) + id.charCodeAt(i);
  }
  return Math.abs(h);
}

/** Region bucket for grouping (same id always maps to the same region). */
export function assignedCapitalPlanningRegion(rowId: string): CapitalPlanningRegion {
  return CAPITAL_PLANNING_REGIONS[hashRowIdForRegionBucket(rowId) % CAPITAL_PLANNING_REGIONS.length]!;
}

export const PRIORITY_OPTIONS = ["High", "Medium", "Low"] as const;
export type ProjectPriority = (typeof PRIORITY_OPTIONS)[number];

export const CURVE_OPTIONS = ["Front-Loaded", "Back-Loaded", "Bell", "Linear", "Manual"] as const;

/** Chosen distribution curve, or `""` when the user has not picked one yet. */
export type ProjectCurve = (typeof CURVE_OPTIONS)[number] | "";

/** Shown in the Curve `SelectCell` when {@link ProjectCurve} is unset (`""`). */
export const CURVE_SELECT_PLACEHOLDER_LABEL = "Select Curve";

export const STATUS_PILL_COLOR: Record<
  ProjectStatus,
  "blue" | "cyan" | "gray" | "green" | "magenta" | "yellow"
> = {
  "Pre-Construction": "blue",
  "Course of Construction": "green",
  Concept: "yellow",
  Bidding: "blue",
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

/**
 * Whether a planned-amount flyout option (root or nested) matches the row's stored source,
 * so the menu can show it as selected (e.g. Lump Sum when source is default or lump-sum-manual).
 */
export function isPlannedAmountFlyoutOptionSelected(
  optionValue: unknown,
  selectedSource: string | undefined
): boolean {
  const v = String(optionValue);
  if (v === PLANNED_AMOUNT_FLYOUT_CAPTION_VALUE) return false;
  if (v === LUMP_SUM_PLANNED_AMOUNT_SOURCE) return isLumpSumPlannedAmountSource(selectedSource);
  if (v === HIGH_LEVEL_BUDGET_ITEMS_SOURCE) return selectedSource === HIGH_LEVEL_BUDGET_ITEMS_SOURCE;
  if (v === "project-budget") {
    return (
      selectedSource === PROJECT_BUDGET_ORIGINAL_SOURCE ||
      selectedSource === PROJECT_BUDGET_REVISED_SOURCE
    );
  }
  if (v === PROJECT_BUDGET_ORIGINAL_SOURCE) return selectedSource === PROJECT_BUDGET_ORIGINAL_SOURCE;
  if (v === PROJECT_BUDGET_REVISED_SOURCE) return selectedSource === PROJECT_BUDGET_REVISED_SOURCE;
  return selectedSource === v;
}

/** Non-selectable flyout row — label is shown as helper text above the real options. */
export const PLANNED_AMOUNT_FLYOUT_CAPTION_VALUE = "__capital_planning_planned_amount_flyout_caption__";

export type PlannedAmountSourceOption = DropdownFlyoutOption & {
  disabled?: boolean;
  children?: PlannedAmountSourceOption[];
};

/**
 * Planned amount flyout options for a row. Project Budget / Original / Revised are shown but disabled
 * when the row has no value in the corresponding budget column (`null`).
 */
export function plannedAmountSourceOptionsForRow(row: {
  originalBudget: number | null;
  revisedBudget: number | null;
}): PlannedAmountSourceOption[] {
  const hasOriginal = row.originalBudget != null;
  const hasRevised = row.revisedBudget != null;
  const noProjectBudgetData = !hasOriginal && !hasRevised;
  return [
    {
      value: PLANNED_AMOUNT_FLYOUT_CAPTION_VALUE,
      label: "Select planned amount type",
    },
    { value: LUMP_SUM_PLANNED_AMOUNT_SOURCE, label: "Lump Sum Manual Entry" },
    { value: HIGH_LEVEL_BUDGET_ITEMS_SOURCE, label: "High Level Budget Items" },
    {
      value: "project-budget",
      label: "Project Budget",
      disabled: noProjectBudgetData,
      children: [
        {
          value: PROJECT_BUDGET_ORIGINAL_SOURCE,
          label: "Original Budget",
          disabled: !hasOriginal,
        },
        {
          value: PROJECT_BUDGET_REVISED_SOURCE,
          label: "Revised Budget",
          disabled: !hasRevised,
        },
      ],
    },
  ];
}

/** Template when both budget columns have data (e.g. docs); prefer {@link plannedAmountSourceOptionsForRow} in the grid. */
export const PLANNED_AMOUNT_SOURCE_OPTIONS: PlannedAmountSourceOption[] = plannedAmountSourceOptionsForRow({
  originalBudget: 0,
  revisedBudget: 0,
});

export interface CapitalPlanningSampleRow {
  id: string;
  projectId: string;
  project: string;
  plannedAmount: number;
  status: ProjectStatus;
  priority: ProjectPriority;
  /** Null when the project has no budget baseline yet (e.g. early Bidding). Concept rows never carry budget baselines. */
  originalBudget: number | null;
  /** Null when the project has no budget baseline yet (e.g. early Bidding). Concept rows never carry budget baselines. */
  revisedBudget: number | null;
  /** Null when the project has no job costs yet (e.g. early Bidding). Concept rows never carry JTD. */
  jobToDateCosts: number | null;
  startDate: string;
  endDate: string;
  curve: ProjectCurve;
  remaining: number;
}

/** Concept-stage projects do not have original / revised budget or job-to-date in this prototype. */
export function withConceptBudgetColumnsCleared(row: CapitalPlanningSampleRow): CapitalPlanningSampleRow {
  if (row.status !== "Concept") return row;
  return {
    ...row,
    originalBudget: null,
    revisedBudget: null,
    jobToDateCosts: null,
  };
}

/** Zero planned amount: no schedule window in this prototype (clears start/end for display and seed). */
export function withZeroPlannedAmountDatesCleared(row: CapitalPlanningSampleRow): CapitalPlanningSampleRow {
  if (row.plannedAmount !== 0) return row;
  return { ...row, startDate: "", endDate: "" };
}

/** Sample rows; `startDate` / `endDate` align with the program forecast grid (FY 2026–FY 2031, Jan 1 … Dec 31). */
export const SAMPLE_PROJECT_ROWS: CapitalPlanningSampleRow[] = [
  {
    id: "p1",
    projectId: "1",
    project: "North Patient Tower",
    plannedAmount: 2_450_000,
    status: "Concept",
    priority: "High",
    originalBudget: null,
    revisedBudget: null,
    jobToDateCosts: null,
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
    status: "Bidding",
    priority: "High",
    originalBudget: null,
    revisedBudget: null,
    jobToDateCosts: null,
    startDate: "2026-02-01",
    endDate: "2027-09-30",
    curve: "Front-Loaded",
    remaining: 3_030_000,
  },
  {
    id: "p3",
    projectId: "3",
    project: "South Parking Structure",
    plannedAmount: 0,
    status: "Concept",
    priority: "Medium",
    originalBudget: null,
    revisedBudget: null,
    jobToDateCosts: null,
    startDate: "",
    endDate: "",
    curve: "",
    remaining: 0,
  },
  {
    id: "p4",
    projectId: "4",
    project: "Research Lab Fit-Out",
    plannedAmount: 1_640_000,
    status: "Pre-Construction",
    priority: "Low",
    originalBudget: 1_520_000,
    revisedBudget: 1_640_000,
    jobToDateCosts: 88_000,
    startDate: "2030-02-10",
    endDate: "2031-11-15",
    curve: "Manual",
    remaining: 1_640_000,
  },
  {
    id: "p5",
    projectId: "5",
    project: "West Campus Chiller Replacement",
    plannedAmount: 3_275_000,
    status: "Concept",
    priority: "Medium",
    originalBudget: null,
    revisedBudget: null,
    jobToDateCosts: null,
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
    status: "Pre-Construction",
    priority: "High",
    originalBudget: 5_400_000,
    revisedBudget: 5_750_000,
    jobToDateCosts: 95_000,
    startDate: "2026-01-10",
    endDate: "2029-08-31",
    curve: "Bell",
    remaining: 5_650_000,
  },
  {
    id: "p7",
    projectId: "7",
    project: "Helipad & Rooftop Mechanical",
    plannedAmount: 0,
    status: "Concept",
    priority: "Medium",
    originalBudget: null,
    revisedBudget: null,
    jobToDateCosts: null,
    startDate: "",
    endDate: "",
    curve: "",
    remaining: 0,
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
    remaining: 2_800_000,
  },
  {
    id: "p9",
    projectId: "9",
    project: "Main Lobby & Wayfinding Renovation",
    plannedAmount: 640_000,
    status: "Bidding",
    priority: "Low",
    originalBudget: null,
    revisedBudget: null,
    jobToDateCosts: null,
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
    jobToDateCosts: 64_000,
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
    status: "Concept",
    priority: "High",
    originalBudget: null,
    revisedBudget: null,
    jobToDateCosts: null,
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
    jobToDateCosts: 120_000,
    startDate: "2026-03-01",
    endDate: "2027-06-30",
    curve: "Front-Loaded",
    remaining: 4_630_000,
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
    remaining: 830_000,
  },
  {
    id: "p15",
    projectId: "15",
    project: "Surgical Suite 4 HVAC Replacement",
    plannedAmount: 2_275_000,
    status: "Concept",
    priority: "Medium",
    originalBudget: null,
    revisedBudget: null,
    jobToDateCosts: null,
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
    status: "Concept",
    priority: "Low",
    originalBudget: null,
    revisedBudget: null,
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
    status: "Concept",
    priority: "High",
    originalBudget: null,
    revisedBudget: null,
    jobToDateCosts: null,
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
    status: "Bidding",
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
    status: "Concept",
    priority: "High",
    originalBudget: null,
    revisedBudget: null,
    jobToDateCosts: null,
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
    status: "Concept",
    priority: "Low",
    originalBudget: null,
    revisedBudget: null,
    jobToDateCosts: null,
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
    status: "Concept",
    priority: "Medium",
    originalBudget: null,
    revisedBudget: null,
    jobToDateCosts: null,
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
    status: "Course of Construction",
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
    plannedAmount: 0,
    status: "Concept",
    priority: "Medium",
    originalBudget: null,
    revisedBudget: null,
    jobToDateCosts: null,
    startDate: "",
    endDate: "",
    curve: "",
    remaining: 0,
  },
  {
    id: "p25",
    projectId: "25",
    project: "Cafeteria & Retail Pod Refresh",
    plannedAmount: 410_000,
    status: "Concept",
    priority: "Low",
    originalBudget: null,
    revisedBudget: null,
    jobToDateCosts: null,
    startDate: "2029-09-01",
    endDate: "2030-06-30",
    curve: "Linear",
    remaining: 395_000,
  },
  {
    id: "p26",
    projectId: "26",
    project: "Ambulatory Surgery Center Shell",
    plannedAmount: 8_400_000,
    status: "Course of Construction",
    priority: "High",
    originalBudget: 7_950_000,
    revisedBudget: 8_400_000,
    jobToDateCosts: 1_020_000,
    startDate: "2026-01-05",
    endDate: "2028-11-30",
    curve: "Front-Loaded",
    remaining: 7_380_000,
  },
  {
    id: "p27",
    projectId: "27",
    project: "North Campus Wayfinding & Signage",
    plannedAmount: 185_000,
    status: "Concept",
    priority: "Low",
    originalBudget: null,
    revisedBudget: null,
    jobToDateCosts: null,
    startDate: "2030-01-15",
    endDate: "2031-05-31",
    curve: "Linear",
    remaining: 175_000,
  },
  {
    id: "p28",
    projectId: "28",
    project: "OR 6–8 Air Handler Replacement",
    plannedAmount: 2_640_000,
    status: "Pre-Construction",
    priority: "High",
    originalBudget: 2_500_000,
    revisedBudget: 2_640_000,
    jobToDateCosts: 42_000,
    startDate: "2027-04-01",
    endDate: "2028-10-15",
    curve: "Bell",
    remaining: 2_598_000,
  },
  {
    id: "p29",
    projectId: "29",
    project: "Inpatient Unit 5 West Build-Out",
    plannedAmount: 4_950_000,
    status: "Course of Construction",
    priority: "High",
    originalBudget: 4_700_000,
    revisedBudget: 4_950_000,
    jobToDateCosts: 890_000,
    startDate: "2026-06-15",
    endDate: "2027-12-31",
    curve: "Back-Loaded",
    remaining: 4_060_000,
  },
  {
    id: "p30",
    projectId: "30",
    project: "Kitchen Exhaust & Grease Interceptor",
    plannedAmount: 620_000,
    status: "Bidding",
    priority: "Medium",
    originalBudget: null,
    revisedBudget: null,
    jobToDateCosts: null,
    startDate: "2028-08-01",
    endDate: "2029-03-31",
    curve: "Linear",
    remaining: 620_000,
  },
  {
    id: "p31",
    projectId: "31",
    project: "Linear Accelerator Vault Retrofit",
    plannedAmount: 11_200_000,
    status: "Concept",
    priority: "High",
    originalBudget: null,
    revisedBudget: null,
    jobToDateCosts: null,
    startDate: "2029-11-01",
    endDate: "2031-12-31",
    curve: "Bell",
    remaining: 10_400_000,
  },
  {
    id: "p32",
    projectId: "32",
    project: "Med/Surg Floor 7 Ceiling Grid & Lighting",
    plannedAmount: 1_125_000,
    status: "Course of Construction",
    priority: "Medium",
    originalBudget: 1_050_000,
    revisedBudget: 1_125_000,
    jobToDateCosts: 312_000,
    startDate: "2026-03-20",
    endDate: "2027-01-20",
    curve: "Manual",
    remaining: 813_000,
  },
  {
    id: "p33",
    projectId: "33",
    project: "Biocontainment Lab BSL-3 Envelope",
    plannedAmount: 7_800_000,
    status: "Pre-Construction",
    priority: "High",
    originalBudget: 7_400_000,
    revisedBudget: 7_800_000,
    jobToDateCosts: 118_000,
    startDate: "2027-01-10",
    endDate: "2029-09-30",
    curve: "Front-Loaded",
    remaining: 7_682_000,
  },
  {
    id: "p34",
    projectId: "34",
    project: "Visitor Parking Level P2 Waterproofing",
    plannedAmount: 0,
    status: "Concept",
    priority: "Medium",
    originalBudget: null,
    revisedBudget: null,
    jobToDateCosts: null,
    startDate: "",
    endDate: "",
    curve: "",
    remaining: 0,
  },
  {
    id: "p35",
    projectId: "35",
    project: "Central Materials Management Vertical Lift",
    plannedAmount: 3_380_000,
    status: "Course of Construction",
    priority: "Medium",
    originalBudget: 3_200_000,
    revisedBudget: 3_380_000,
    jobToDateCosts: 445_000,
    startDate: "2026-08-01",
    endDate: "2028-04-30",
    curve: "Linear",
    remaining: 2_935_000,
  },
  {
    id: "p36",
    projectId: "36",
    project: "Fire Alarm Campus-Wide Panel Upgrade",
    plannedAmount: 1_950_000,
    status: "Bidding",
    priority: "High",
    originalBudget: 1_820_000,
    revisedBudget: 1_950_000,
    jobToDateCosts: 55_000,
    startDate: "2028-01-15",
    endDate: "2029-12-15",
    curve: "Back-Loaded",
    remaining: 1_895_000,
  },
  {
    id: "p37",
    projectId: "37",
    project: "Hemodialysis Expansion — 12 Chairs",
    plannedAmount: 2_100_000,
    status: "Concept",
    priority: "Medium",
    originalBudget: null,
    revisedBudget: null,
    jobToDateCosts: null,
    startDate: "2028-02-01",
    endDate: "2029-08-31",
    curve: "Front-Loaded",
    remaining: 1_980_000,
  },
  {
    id: "p38",
    projectId: "38",
    project: "East Garage Facade & Sealant Package",
    plannedAmount: 2_775_000,
    status: "Course of Construction",
    priority: "Low",
    originalBudget: 2_600_000,
    revisedBudget: 2_775_000,
    jobToDateCosts: 198_000,
    startDate: "2026-11-10",
    endDate: "2028-02-28",
    curve: "Bell",
    remaining: 2_577_000,
  },
  {
    id: "p39",
    projectId: "39",
    project: "Cath Lab 2 Equipment Rigging Path",
    plannedAmount: 890_000,
    status: "Pre-Construction",
    priority: "Medium",
    originalBudget: 820_000,
    revisedBudget: 890_000,
    jobToDateCosts: 28_000,
    startDate: "2027-07-01",
    endDate: "2028-05-31",
    curve: "Linear",
    remaining: 862_000,
  },
  {
    id: "p40",
    projectId: "40",
    project: "Roof Ballasted PV Array — Building C",
    plannedAmount: 1_340_000,
    status: "Concept",
    priority: "Low",
    originalBudget: null,
    revisedBudget: null,
    jobToDateCosts: null,
    startDate: "2030-04-01",
    endDate: "2031-03-31",
    curve: "Back-Loaded",
    remaining: 1_290_000,
  },
  {
    id: "p41",
    projectId: "41",
    project: "Sterile Processing Decontamination Washers",
    plannedAmount: 740_000,
    status: "Bidding",
    priority: "Medium",
    originalBudget: null,
    revisedBudget: null,
    jobToDateCosts: null,
    startDate: "2029-03-01",
    endDate: "2030-01-31",
    curve: "Linear",
    remaining: 740_000,
  },
  {
    id: "p42",
    projectId: "42",
    project: "NICU Family Sleep Rooms & Ante Room",
    plannedAmount: 5_650_000,
    status: "Course of Construction",
    priority: "High",
    originalBudget: 5_400_000,
    revisedBudget: 5_650_000,
    jobToDateCosts: 1_340_000,
    startDate: "2026-04-01",
    endDate: "2028-09-15",
    curve: "Bell",
    remaining: 4_310_000,
  },
  {
    id: "p43",
    projectId: "43",
    project: "Security Operations Center Relocation",
    plannedAmount: 425_000,
    status: "Concept",
    priority: "Low",
    originalBudget: null,
    revisedBudget: null,
    jobToDateCosts: null,
    startDate: "2027-10-01",
    endDate: "2028-06-30",
    curve: "Linear",
    remaining: 410_000,
  },
  {
    id: "p44",
    projectId: "44",
    project: "Steam Tunnel Valve & Insulation Replacement",
    plannedAmount: 3_100_000,
    status: "Pre-Construction",
    priority: "High",
    originalBudget: 2_950_000,
    revisedBudget: 3_100_000,
    jobToDateCosts: 62_000,
    startDate: "2027-05-15",
    endDate: "2029-02-28",
    curve: "Manual",
    remaining: 3_038_000,
  },
  {
    id: "p45",
    projectId: "45",
    project: "Gift Shop & Coffee Kiosk Relocation",
    plannedAmount: 275_000,
    status: "Bidding",
    priority: "Low",
    originalBudget: null,
    revisedBudget: null,
    jobToDateCosts: null,
    startDate: "2028-11-01",
    endDate: "2029-07-31",
    curve: "Front-Loaded",
    remaining: 275_000,
  },
];

function sampleRowIdNumber(id: string): number {
  const m = /^p(\d+)$/.exec(id);
  return m ? parseInt(m[1], 10) : 0;
}

/**
 * Deterministic prototype defaults: Course of Construction rows mostly sync planned amount to project budget
 * (revised vs original varies by row id); Bidding and Concept use lump sum or High Level Budget Items only.
 */
export function initialPlannedAmountSources(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const r of SAMPLE_PROJECT_ROWS) {
    const n = sampleRowIdNumber(r.id);
    if (r.status === "Course of Construction") {
      if (r.revisedBudget != null && r.originalBudget != null) {
        out[r.id] = n % 5 === 0 ? PROJECT_BUDGET_ORIGINAL_SOURCE : PROJECT_BUDGET_REVISED_SOURCE;
      } else if (r.revisedBudget != null) {
        out[r.id] = PROJECT_BUDGET_REVISED_SOURCE;
      } else if (r.originalBudget != null) {
        out[r.id] = PROJECT_BUDGET_ORIGINAL_SOURCE;
      } else {
        out[r.id] = LUMP_SUM_PLANNED_AMOUNT_SOURCE;
      }
    } else if (r.status === "Bidding" || r.status === "Concept") {
      // Zero planned amount: lump sum only (not high-level budget items).
      if (r.plannedAmount === 0) {
        out[r.id] = LUMP_SUM_PLANNED_AMOUNT_SOURCE;
      } else {
        out[r.id] = n % 2 === 0 ? LUMP_SUM_PLANNED_AMOUNT_SOURCE : HIGH_LEVEL_BUDGET_ITEMS_SOURCE;
      }
    }
  }
  return out;
}

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
