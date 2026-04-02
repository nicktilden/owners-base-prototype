/**
 * Open Items sample data for the hub dashboard.
 * Modeled on a Procore Open Items export; replace with API calls when wiring to real data.
 * Each item is linked to a project by projectId / projectNumber matching sampleProjectRows in projects.ts.
 *
 * Types: RFI | Submittal | Punch List | Observation | Issue
 * Statuses: Open | In Review | Pending | Closed | Void
 * Priorities: Critical | High | Medium | Low
 * Trades: General | Electrical | Mechanical | Plumbing | Civil | Structural | Architectural | Fire Protection | IT/Low Voltage
 */

/** Open item types supported in Procore. */
export const OPEN_ITEM_TYPES = [
  "RFI",
  "Submittal",
  "Punch List",
  "Observation",
  "Issue",
] as const;

export type OpenItemType = (typeof OPEN_ITEM_TYPES)[number];

/** Lifecycle statuses for open items. */
export const OPEN_ITEM_STATUSES = [
  "Open",
  "In Review",
  "Pending",
  "Closed",
  "Void",
] as const;

export type OpenItemStatus = (typeof OPEN_ITEM_STATUSES)[number];

/** Priority levels for open items. */
export const OPEN_ITEM_PRIORITIES = [
  "Critical",
  "High",
  "Medium",
  "Low",
] as const;

export type OpenItemPriority = (typeof OPEN_ITEM_PRIORITIES)[number];

/** Trade / discipline for the item. */
export const OPEN_ITEM_TRADES = [
  "General",
  "Electrical",
  "Mechanical",
  "Plumbing",
  "Civil",
  "Structural",
  "Architectural",
  "Fire Protection",
  "IT/Low Voltage",
] as const;

export type OpenItemTrade = (typeof OPEN_ITEM_TRADES)[number];

/** Single open item row. */
export interface OpenItemRow {
  id: number;
  /** Procore-style item number, e.g. "RFI-0042" or "SUB-0015". */
  number: string;
  type: OpenItemType;
  title: string;
  status: OpenItemStatus;
  priority: OpenItemPriority;
  trade: OpenItemTrade;
  /** ISO date the item was created. */
  createdDate: string;
  /** ISO date the item is due / required by. */
  dueDate: string;
  /** ISO date the item was closed; empty string when still open. */
  closedDate: string;
  /** Days past due (positive = overdue, 0 = on time or closed). */
  daysOverdue: number;
  /** Person responsible for resolving the item. */
  assignee: string;
  /** Person who submitted / created the item. */
  submittedBy: string;
  /** Numeric id matching ProjectRow.id in projects.ts */
  projectId: number;
  /** Project number string, e.g. "MA-1001" */
  projectNumber: string;
  /** Project name for display convenience. */
  projectName: string;
  /** Spec section or drawing reference, e.g. "03 30 00" or "A-201". */
  specSection: string;
  /** Short description / response summary. */
  description: string;
}

// ---------------------------------------------------------------------------
// Sample data helpers
// ---------------------------------------------------------------------------

/** Stable pseudo-random hash for deterministic sample value picks. Always returns a non-negative integer. */
function hash(n: number, salt: number): number {
  let h = ((n * 2654435761) ^ (salt * 40503)) >>> 0;
  h ^= h >>> 16;
  h = ((h * 0x45d9f3b) & 0xffffffff) >>> 0;
  h ^= h >>> 16;
  return h >>> 0; // guarantee unsigned
}

function pick<T>(arr: readonly T[], n: number, salt: number): T {
  const idx = hash(n, salt) % arr.length;
  const val = arr[idx];
  if (val === undefined) return arr[0] as T;
  return val;
}

/** Add days to an ISO date string, return YYYY-MM-DD. */
function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Days between two ISO date strings (positive when b > a). */
function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

const TODAY = "2026-03-27";

// ---------------------------------------------------------------------------
// Static reference pools
// ---------------------------------------------------------------------------

const ASSIGNEES = [
  "Hector Rodriguez",
  "Sarah Maragos",
  "Sidney Shah",
  "Will Bauer",
  "Brent Baker",
] as const;

const SUBMITTERS = [
  "Chris Morgan",
  "Dana Hill",
  "Jesse Cooper",
  "Lee Baker",
  "Pat Green",
  "Robin Clark",
  "Shawn Lewis",
  "Terry Hall",
  "Val Young",
  "Wren Allen",
] as const;

const RFI_TITLES = [
  "Clarification on structural beam connection detail",
  "Confirm MEP coordination at ceiling plenum",
  "Grounding requirements for server room floor",
  "Waterproofing membrane specification at plaza level",
  "Expansion joint locations at building perimeter",
  "Curtain wall anchor bolt embed depth",
  "Fire-rated partition head-of-wall detail",
  "Concrete mix design approval for slab on grade",
  "Rooftop equipment access clearance requirements",
  "Stairwell pressurization duct routing",
  "Temporary power panel location during mobilization",
  "Existing utility survey accuracy confirmation",
  "Generator transfer switch integration method",
  "Elevator pit sump pump discharge point",
  "Exterior paint system compatibility with substrate",
] as const;

const SUBMITTAL_TITLES = [
  "Structural steel shop drawings — Level 3 framing",
  "Mechanical equipment submittals — AHU-01 through AHU-04",
  "Electrical switchgear submittals — MDP panel",
  "Precast concrete panel shop drawings",
  "Curtain wall system mock-up report",
  "Fire suppression heads and pipe submittal",
  "Generator and transfer switch O&M submittals",
  "Roofing membrane product data and warranty",
  "Interior glazing and framing submittal",
  "Low voltage cabling and pathways submittal",
  "Concrete reinforcing bar mill certificates",
  "Elevator equipment and controls submittal",
  "Plumbing fixtures product data",
  "Flooring adhesive VOC compliance submittal",
  "Thermal insulation product data",
] as const;

const PUNCHLIST_TITLES = [
  "Missing cover plate at junction box — Room 214",
  "Paint touch-up required at corridor south wall",
  "Door hardware adjustment — Suite 300 entry",
  "Floor drain cover not flush — Kitchen Level 1",
  "Ceiling tile damaged during mechanical rough-in",
  "Exterior caulking gap at storefront glazing",
  "Light fixture alignment off-center — Lobby",
  "HVAC diffuser not balanced — Zone 4",
  "Grout missing at restroom tile — 2nd floor",
  "Signage panel not level — Main entrance",
  "Window sill scratched during install — Room 108",
  "Handrail end cap missing — Stair B",
  "Overhead door seal torn — Loading dock",
  "Outlet cover plate missing — Server closet",
  "Landscaping incomplete — North parking island",
] as const;

const OBSERVATION_TITLES = [
  "Formwork shoring not per approved shoring plan",
  "Rebar spacing exceeds specification tolerance",
  "OSHA guardrail height deficiency at Level 5 deck",
  "Electrical conduit bends exceed max code angle",
  "Subcontractor working without required permits",
  "Concrete placed in rain — curing concerns",
  "Fireproofing application thickness out of tolerance",
  "Structural weld not inspected prior to enclosure",
  "Improperly stored materials on elevated deck",
  "Excavation sloping not per OSHA soil classification",
  "Electrical panel interior wet — waterproofing breach",
  "Roof drain blocked during storm event",
  "Overhead work without barricades in occupied area",
  "Inadequate fall protection on roof perimeter",
  "Compressed gas cylinders stored unsecured",
] as const;

const ISSUE_TITLES = [
  "Site access road damaged by concrete trucks",
  "Neighboring property fence encroachment identified",
  "Permit drawings do not match issued-for-construction set",
  "Material delivery damaged — curtain wall panels",
  "Design conflict between structural and MEP at Grid C",
  "Owner-furnished equipment delay affecting schedule",
  "Existing slab thickness less than anticipated",
  "Unforeseen underground obstruction — Grid B4",
  "Subcontractor default — framing package",
  "Contaminated soil discovered during excavation",
  "Change order dispute — general conditions costs",
  "Inspection failed — electrical rough-in",
  "Dewatering system insufficient for current conditions",
  "LEED documentation gap — energy modeling",
  "Weather delay claim submitted by GC",
] as const;

const SPEC_SECTIONS = [
  "01 33 00", "01 45 00", "03 11 00", "03 30 00", "03 41 00",
  "04 20 00", "05 12 00", "05 50 00", "06 10 00", "07 11 00",
  "07 27 00", "07 62 00", "08 11 00", "08 44 00", "09 29 00",
  "09 65 00", "09 91 00", "10 14 00", "22 10 00", "23 09 00",
  "26 05 00", "26 24 00", "27 10 00", "28 13 00", "31 23 00",
  "32 12 00", "32 90 00", "33 40 00", "A-101", "A-201",
  "A-301", "S-101", "S-201", "M-101", "E-101",
] as const;

// ---------------------------------------------------------------------------
// Project-level seed data (maps id → metadata used for item generation)
// ---------------------------------------------------------------------------

interface ProjectSeed {
  id: number;
  number: string;
  name: string;
  startDate: string;
  /** Approx items to generate for this project (2–8). */
  itemCount: number;
}

/** Subset of project data needed here; kept in sync with projects.ts by project id. */
const PROJECT_SEEDS: ProjectSeed[] = [
  { id: 1, number: "MA-1001", name: "Northern Virginia Data Center Phase 2", startDate: "2024-01-08", itemCount: 7 },
  { id: 2, number: "MW-1006", name: "Ohio Region Campus Expansion", startDate: "2024-02-01", itemCount: 6 },
  { id: 3, number: "MW-1012", name: "Roastery Chicago", startDate: "2024-01-15", itemCount: 4 },
  { id: 4, number: "SW-1019", name: "Drive-Thru Store Prototype Phoenix", startDate: "2024-03-01", itemCount: 3 },
  { id: 5, number: "SE-1027", name: "Atlanta Data Hall 3 Buildout", startDate: "2024-02-15", itemCount: 5 },
  { id: 6, number: "SW-1034", name: "Dallas Critical Facility Upgrade", startDate: "2024-05-01", itemCount: 4 },
  { id: 7, number: "MW-1042", name: "Denver HQ Fit-Out", startDate: "2024-06-01", itemCount: 3 },
  { id: 8, number: "SW-1051", name: "Retail Pads Austin Phase 1", startDate: "2024-01-20", itemCount: 5 },
  { id: 9, number: "MW-1059", name: "Supercenter Grand Rapids", startDate: "2024-02-10", itemCount: 6 },
  { id: 10, number: "NE-1068", name: "Buffalo Substation Upgrade", startDate: "2024-01-05", itemCount: 5 },
  { id: 11, number: "SE-1076", name: "Store Orlando", startDate: "2024-03-15", itemCount: 4 },
  { id: 12, number: "MW-1085", name: "St. Mary's ED Expansion", startDate: "2024-02-01", itemCount: 7 },
  { id: 13, number: "W-1093", name: "Oregon Region Power & Cooling", startDate: "2024-07-01", itemCount: 3 },
  { id: 14, number: "W-1102", name: "Support Center Seattle Renovation", startDate: "2024-08-01", itemCount: 3 },
  { id: 15, number: "MW-1110", name: "Chicago Meet-Me Room Expansion", startDate: "2024-04-01", itemCount: 4 },
  { id: 16, number: "SW-1119", name: "Houston Office", startDate: "2024-09-01", itemCount: 2 },
  { id: 17, number: "SE-1127", name: "Multifamily Nashville", startDate: "2024-01-10", itemCount: 5 },
  { id: 18, number: "MW-1136", name: "Distribution Center Toledo", startDate: "2024-06-15", itemCount: 4 },
  { id: 19, number: "NE-1144", name: "Boston Gas Main Replacement", startDate: "2024-02-20", itemCount: 5 },
  { id: 20, number: "SE-1153", name: "Fulfillment Center Atlanta", startDate: "2024-01-12", itemCount: 6 },
  { id: 21, number: "MW-1161", name: "Mercy Campus OR Renovation", startDate: "2024-03-01", itemCount: 5 },
  { id: 22, number: "W-1170", name: "San Francisco Bay Area Office", startDate: "2024-05-01", itemCount: 3 },
  { id: 23, number: "SE-1178", name: "Reserve Store Miami", startDate: "2024-04-10", itemCount: 3 },
  { id: 24, number: "NE-1187", name: "NYC Metro Edge Site", startDate: "2024-10-01", itemCount: 2 },
  { id: 25, number: "SE-1195", name: "Atlanta Client Fit-Out", startDate: "2024-02-01", itemCount: 2 },
  { id: 26, number: "SW-1204", name: "Industrial Shell Dallas", startDate: "2024-01-25", itemCount: 4 },
  { id: 27, number: "MW-1212", name: "Supercenter Indianapolis", startDate: "2024-07-01", itemCount: 3 },
  { id: 28, number: "NE-1221", name: "Upstate NY Transmission", startDate: "2024-01-15", itemCount: 6 },
  { id: 29, number: "MW-1229", name: "Store Minneapolis", startDate: "2024-04-01", itemCount: 4 },
  { id: 30, number: "MW-1238", name: "Outpatient Pavilion Lansing", startDate: "2024-08-15", itemCount: 3 },
  { id: 31, number: "MA-1246", name: "Virginia Solar + BESS", startDate: "2024-11-01", itemCount: 2 },
  { id: 32, number: "SW-1255", name: "Distribution Center Dallas", startDate: "2024-02-15", itemCount: 5 },
  { id: 33, number: "SW-1263", name: "Phoenix Data Hall 1", startDate: "2024-03-10", itemCount: 4 },
  { id: 34, number: "SE-1272", name: "Office Building Charlotte", startDate: "2024-01-08", itemCount: 5 },
  { id: 35, number: "MW-1280", name: "Fuel Station & Convenience Detroit", startDate: "2024-05-01", itemCount: 2 },
  { id: 36, number: "NE-1289", name: "Rhode Island Substation", startDate: "2024-07-15", itemCount: 3 },
  { id: 37, number: "MW-1297", name: "Store Denver", startDate: "2024-04-20", itemCount: 4 },
  { id: 38, number: "MW-1306", name: "Imaging Center Ann Arbor", startDate: "2024-03-15", itemCount: 5 },
  { id: 39, number: "SW-1314", name: "Texas Region Data Center", startDate: "2024-02-01", itemCount: 7 },
  { id: 40, number: "SW-1323", name: "Store Las Vegas", startDate: "2024-05-15", itemCount: 2 },
  { id: 41, number: "W-1331", name: "Salt Lake City Buildout", startDate: "2024-09-01", itemCount: 3 },
  { id: 42, number: "SW-1340", name: "Phoenix Office", startDate: "2024-06-15", itemCount: 2 },
  { id: 43, number: "SE-1348", name: "Mixed-Use Raleigh", startDate: "2024-08-01", itemCount: 4 },
  { id: 44, number: "MW-1357", name: "Supercenter Cincinnati", startDate: "2024-03-01", itemCount: 5 },
  { id: 45, number: "NE-1365", name: "Brooklyn Network Upgrade", startDate: "2024-01-22", itemCount: 5 },
  { id: 46, number: "W-1374", name: "Store San Diego", startDate: "2024-04-05", itemCount: 3 },
  { id: 47, number: "MW-1382", name: "Medical Office Building Port Huron", startDate: "2024-02-10", itemCount: 4 },
  { id: 48, number: "MA-1391", name: "Virginia HQ2 Phase 2", startDate: "2024-01-01", itemCount: 8 },
  { id: 49, number: "INT-1399", name: "Farmer Support Center Expansion", startDate: "2024-07-01", itemCount: 3 },
  { id: 50, number: "SE-1408", name: "Miami Critical Load Upgrade", startDate: "2024-04-01", itemCount: 4 },
];

// Per-type sequential counters for item numbers.
const typeCounters: Record<OpenItemType, number> = {
  RFI: 0,
  Submittal: 0,
  "Punch List": 0,
  Observation: 0,
  Issue: 0,
};

const TYPE_PREFIXES: Record<OpenItemType, string> = {
  RFI: "RFI",
  Submittal: "SUB",
  "Punch List": "PCH",
  Observation: "OBS",
  Issue: "ISS",
};

function nextItemNumber(type: OpenItemType): string {
  typeCounters[type] += 1;
  return `${TYPE_PREFIXES[type]}-${String(typeCounters[type]).padStart(4, "0")}`;
}

/** Title pools keyed by type. */
const TITLE_POOLS: Record<OpenItemType, readonly string[]> = {
  RFI: RFI_TITLES,
  Submittal: SUBMITTAL_TITLES,
  "Punch List": PUNCHLIST_TITLES,
  Observation: OBSERVATION_TITLES,
  Issue: ISSUE_TITLES,
};

/** Status weights: mostly open/in-review with some closed; few voids. */
const STATUS_POOL: OpenItemStatus[] = [
  "Open", "Open", "Open",
  "In Review", "In Review",
  "Pending",
  "Closed", "Closed",
  "Void",
];

/** Priority weights: mostly medium/high. */
const PRIORITY_POOL: OpenItemPriority[] = [
  "Critical",
  "High", "High", "High",
  "Medium", "Medium", "Medium", "Medium",
  "Low", "Low",
];

function buildItem(globalId: number, project: ProjectSeed, localIndex: number): OpenItemRow {
  const seed = globalId * 97 + localIndex;

  const type = pick(OPEN_ITEM_TYPES, seed, 1);
  const status = STATUS_POOL[hash(seed, 2) % STATUS_POOL.length];
  const priority = PRIORITY_POOL[hash(seed, 3) % PRIORITY_POOL.length];
  const trade = pick(OPEN_ITEM_TRADES, seed, 4);
  const assignee = pick(ASSIGNEES, seed, 5);
  const submittedBy = pick(SUBMITTERS, seed, 6);
  const specSection = pick(SPEC_SECTIONS, seed, 7);
  const titlePool = TITLE_POOLS[type];
  const title = titlePool[hash(seed, 8) % titlePool.length];

  // Created between 0–90 days after project start; due 14–45 days after creation.
  const createdOffsetDays = hash(seed, 9) % 270;
  const dueDurationDays = 14 + (hash(seed, 10) % 32);
  const createdDate = addDays(project.startDate, createdOffsetDays);
  const dueDate = addDays(createdDate, dueDurationDays);

  let closedDate = "";
  let daysOverdue = 0;

  if (status === "Closed" || status === "Void") {
    // Closed 0–20 days after due date (or up to 10 days early).
    const closeOffset = (hash(seed, 11) % 31) - 10;
    closedDate = addDays(dueDate, closeOffset);
  } else {
    // For open items, compute overdue relative to today.
    const overdue = daysBetween(dueDate, TODAY);
    daysOverdue = Math.max(0, overdue);
  }

  const description = `${project.name} — ${specSection}: ${title.toLowerCase()}.`;

  return {
    id: globalId,
    number: nextItemNumber(type),
    type,
    title,
    status,
    priority,
    trade,
    createdDate,
    dueDate,
    closedDate,
    daysOverdue,
    assignee,
    submittedBy,
    projectId: project.id,
    projectNumber: project.number,
    projectName: project.name,
    specSection,
    description,
  };
}

// ---------------------------------------------------------------------------
// Build the sample rows
// ---------------------------------------------------------------------------

function buildAllOpenItems(): OpenItemRow[] {
  const rows: OpenItemRow[] = [];
  let globalId = 1;
  for (const project of PROJECT_SEEDS) {
    for (let i = 0; i < project.itemCount; i++) {
      rows.push(buildItem(globalId, project, i));
      globalId++;
    }
  }
  return rows;
}

/** All sample open item rows (~200 items across 50 projects). */
export const sampleOpenItemRows: OpenItemRow[] = buildAllOpenItems();

// ---------------------------------------------------------------------------
// Derived filter helpers (mirrors the pattern in projects.ts)
// ---------------------------------------------------------------------------

/** Distinct open item types present in sample data. */
export const OPEN_ITEM_TYPES_DISTINCT: OpenItemType[] = [
  ...new Set(sampleOpenItemRows.map((r) => r.type)),
].sort() as OpenItemType[];

/** Distinct statuses present in sample data. */
export const OPEN_ITEM_STATUSES_DISTINCT: OpenItemStatus[] = [
  ...new Set(sampleOpenItemRows.map((r) => r.status)),
].sort() as OpenItemStatus[];

/** Distinct priorities present in sample data. */
export const OPEN_ITEM_PRIORITIES_DISTINCT: OpenItemPriority[] = [
  ...new Set(sampleOpenItemRows.map((r) => r.priority)),
].sort() as OpenItemPriority[];

/** Distinct trades present in sample data. */
export const OPEN_ITEM_TRADES_DISTINCT: OpenItemTrade[] = [
  ...new Set(sampleOpenItemRows.map((r) => r.trade)),
].sort() as OpenItemTrade[];

/** Distinct project names present in sample data (for grid select filters). */
export const OPEN_ITEM_PROJECTS_DISTINCT: string[] = [
  ...new Set(sampleOpenItemRows.map((r) => r.projectName)),
].sort((a, b) => a.localeCompare(b));

/** Distinct assignees present in sample data. */
export const OPEN_ITEM_ASSIGNEES_DISTINCT: string[] = [
  ...new Set(sampleOpenItemRows.map((r) => r.assignee)),
].sort((a, b) => a.localeCompare(b));

// ---------------------------------------------------------------------------
// Summary aggregates (mirrors projectsByStage pattern)
// ---------------------------------------------------------------------------

/** Open items by type (count per type). */
export const openItemsByType: { name: OpenItemType; value: number }[] = (() => {
  const counts: Partial<Record<OpenItemType, number>> = {};
  for (const r of sampleOpenItemRows) {
    counts[r.type] = (counts[r.type] ?? 0) + 1;
  }
  return OPEN_ITEM_TYPES.map((t) => ({ name: t, value: counts[t] ?? 0 }));
})();

/** Open items by status (count per status). */
export const openItemsByStatus: { name: OpenItemStatus; value: number }[] = (() => {
  const counts: Partial<Record<OpenItemStatus, number>> = {};
  for (const r of sampleOpenItemRows) {
    counts[r.status] = (counts[r.status] ?? 0) + 1;
  }
  return OPEN_ITEM_STATUSES.map((s) => ({ name: s, value: counts[s] ?? 0 }));
})();

/** Open items by priority (count per priority). */
export const openItemsByPriority: { name: OpenItemPriority; value: number }[] = (() => {
  const counts: Partial<Record<OpenItemPriority, number>> = {};
  for (const r of sampleOpenItemRows) {
    counts[r.priority] = (counts[r.priority] ?? 0) + 1;
  }
  return OPEN_ITEM_PRIORITIES.map((p) => ({ name: p, value: counts[p] ?? 0 }));
})();

/** Count of overdue open items (daysOverdue > 0 and not closed/void). */
export const overdueOpenItemCount: number = sampleOpenItemRows.filter(
  (r) => r.daysOverdue > 0 && r.status !== "Closed" && r.status !== "Void"
).length;

/** Top 10 open items by daysOverdue (for aging / risk widgets). */
export const topOverdueOpenItems: OpenItemRow[] = [...sampleOpenItemRows]
  .filter((r) => r.daysOverdue > 0)
  .sort((a, b) => b.daysOverdue - a.daysOverdue)
  .slice(0, 10);
