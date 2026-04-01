---
name: populate-seed-data
description: >-
  Populates all seed data files in /src/data/seed/ for the Owner Experience Prototype.
  Triggered when the user wants to initialize, reset, or repopulate prototype seed data.
  The skill prompts for a company type, then generates a full, realistic, type-appropriate
  seed data set including: 1 account, 17 users (one per role), 20 projects, WBS codes,
  hub instances, budget lines, schedule items, milestones, tasks, documents, action plans,
  and assets. All generated data must conform to the TypeScript interfaces defined in the
  data model source files. Do NOT trigger for component building, UI work, or permission
  logic — this skill is data generation only.
---

# Populate Seed Data Skill

Generates a complete, realistic seed data set for the Owner Experience Prototype,
tailored to a chosen company type. All output must conform to the TypeScript interfaces
in the project's data model source files.

---

## Prerequisites

Read and understand these files before generating any data:
- `data-model.ts` — reconciliation notes, field names, type constraints
- `src/types/account.ts` — Account, Office
- `src/types/user.ts` — User, UserRole, UserPermissions, UserFavorites
- `src/types/project.ts` — Project, ProjectStatus, ProjectStage, ProjectRegion, ProjectSector, DeliveryMethod, ProjectType, ProjectPriority, WorkScope
- `src/types/shared.ts` — USState, WBSItem, WBSSegmentType
- `src/types/permissions.ts` — UserToolPermissions, ROLE_TOOL_PERMISSION_MAP
- `src/types/tools/index.ts` — ToolKey, TOOL_LEVEL_MAP

---

## Step 1: Ask the User to Choose a Company Type

Present the following options and wait for a selection before generating any data:

```
Which company type would you like to use for seed data?

1. Multi-Family Residential
   Developers and operators who build, manage, and hold long-term residential
   housing assets. Examples: AMLI, Crescent Communities, Dominium.

2. Retail
   Companies focused on developing, remodeling, and operating commercial
   storefronts and distribution centers. Examples: Target, Meijer, Dick's Sporting Goods.

3. Office
   Real estate firms and investors focused on developing and leasing commercial
   office spaces and corporate campuses. Examples: Boston Properties, ESRT.

4. Data Center
   Highly complex large-scale facilities housing IT infrastructure and server
   equipment. Examples: Equinix, QTS Data Centers, Vantage Data Centers.

5. Healthcare
   Organizations building and managing clinical facilities and hospital campuses.
   Examples: Trinity Health, Tampa General Hospital, Essentia Health.

6. Utilities
   Entities building and maintaining critical infrastructure — electrical,
   gas, water, sewer. Examples: National Grid, SDGE, Santee Cooper.

7. Education
   K-12 districts and universities executing capital master plans for campus
   infrastructure. Examples: MIT, University of Nebraska, Guilford County Schools.

8. Renewables
   Developers of clean energy infrastructure — solar, wind, battery storage.
   Examples: Catalyze, Pivot Energy, Silicon Ranch.

9. Airports
   Public transit hubs undertaking multi-year terminal and master plan programs.
   Examples: LAWA, Houston Airports, JFK International Airport.
```

Do not proceed until the user selects a company type.

---

## Step 2: Ask the User to Choose the Active (Logged-In) User

After the company type is selected, present the following and wait for a selection:

```
Which user should be the active logged-in user for this prototype session?
This sets the default perspective — whose data, permissions, and assigned items
are shown on first load. You can add a persona switcher later to change this at runtime.

1.  Victoria Langford     — CEO
2.  Marcus Webb           — COO
3.  Sandra Okafor         — CFO
4.  Derek Huang           — Capital Planning
5.  Priya Nair            — VP of Operations
6.  James Callahan        — VP of Development
7.  Eleanor Voss          — Board of Directors (read-only)
8.  Carlos Mendez         — Director of Project Management
9.  Bridget O'Sullivan    — Director of Construction
10. Tyrone Jackson        — Program Manager
11. Rachel Kim            — Project Manager
12. Anton Petrov          — Construction Manager
13. Luis Herrera          — Superintendent
14. Amara Osei            — Project Engineer
15. Jake Kowalski         — Foreman
16. Nina Patel            — Operators
17. Sam Thornton          — IT Admin
```

Do not proceed until the user selects an active user.

Once selected, write the following to `/src/data/seed/activeUser.ts`:

```typescript
/**
 * ACTIVE USER
 * The default logged-in user for this prototype session.
 * Replace this import in UserContext to change the active perspective.
 * A runtime persona switcher will supersede this file when implemented.
 */
import { users } from './users';

export const activeUser = users.find(u => u.id === '{selected_user_id}')!;
```

Also add a comment at the top of `/src/data/seed/users.ts` indicating which user
is the current active user:

```typescript
// Active user: {selected_user_name} ({selected_user_role}) — see activeUser.ts
```

---

## Step 3: Resolve Company Type Configuration

Use the selected company type to determine the values below.
Apply these values throughout all seed data generation in this session.

### Company Type Configurations

#### 1. Multi-Family Residential
```
accountName:      "Crescent Communities"
industry:         "Multi-Family Residential"
sector:           "Private"
ownerType:        "Type 1: Owner Builder / Type 3: Owner Investor"
timeZone:         "America/Charlotte"
office:           { city: "Charlotte", state: "North Carolina" }
primarySectors:   ["Residential > Multifamily", "Residential > Student Housing", "Mixed-Use > Residential / Retail"]
deliveryMethods:  ["Design-Build (DB)", "Construction Management at Risk (CMaR)", "Design-Bid-Build (DBB)"]
projectTypes:     ["Capital Improvements", "Design-Build", "Renewal"]
regions:          ["Southeast", "Northeast", "Midwest", "South", "Southwest"]
stageDistribution: heavy toward Course of Construction and Pre-Construction
budgetRange:      { min: 8000000, max: 85000000 }
```

#### 2. Retail
```
accountName:      "Meijer Development Group"
industry:         "Retail"
sector:           "Private"
ownerType:        "Type 1: Owner Builder"
timeZone:         "America/Detroit"
office:           { city: "Grand Rapids", state: "Michigan" }
primarySectors:   ["Commercial > Retail > Big Box Store", "Commercial > Retail > Grocery Store", "Commercial > Retail > Shopping Center / Mall"]
deliveryMethods:  ["Design-Build (DB)", "Design-Bid-Build (DBB)", "Construction Manager as Agent (Owners Rep)"]
projectTypes:     ["Capital Improvements", "Facility Improvements", "Renovation"]
regions:          ["Midwest", "Northeast", "South"]
stageDistribution: heavy toward Bidding and Pre-Construction
budgetRange:      { min: 3000000, max: 45000000 }
```

#### 3. Office
```
accountName:      "Empire State Realty Trust"
industry:         "Office"
sector:           "Private"
ownerType:        "Type 1: Owner Builder / Type 3: Owner Investor"
timeZone:         "America/New_York"
office:           { city: "New York", state: "New York" }
primarySectors:   ["Commercial > Office", "Mixed-Use > Office / Retail", "Mixed-Use > Residential / Office / Retail"]
deliveryMethods:  ["Construction Management at Risk (CMaR)", "Design-Bid-Build (DBB)", "Integrated Project Delivery"]
projectTypes:     ["Capital Improvements", "Facility Improvements", "CM/GC"]
regions:          ["Northeast", "South", "Midwest"]
stageDistribution: heavy toward Final Design and Permitting
budgetRange:      { min: 15000000, max: 250000000 }
```

#### 4. Data Center
```
accountName:      "Vantage Data Centers"
industry:         "Data Center"
sector:           "Private"
ownerType:        "Type 2a: High Maturity Owner Operator"
timeZone:         "America/Denver"
office:           { city: "Denver", state: "Colorado" }
primarySectors:   ["Industrial > Data Center", "Industrial > Business Park"]
deliveryMethods:  ["Design-Build (DB)", "Construction Management at Risk (CMaR)", "Integrated Project Delivery"]
projectTypes:     ["Capital Improvements", "Design-Build", "TBD."]
regions:          ["West", "Southwest", "Northeast", "Midwest"]
stageDistribution: heavy toward Course of Construction and Final Design
budgetRange:      { min: 50000000, max: 800000000 }
```

#### 5. Healthcare
```
accountName:      "Trinity Health"
industry:         "Healthcare"
sector:           "Public and Private"
ownerType:        "Type 2a: High Maturity Owner Operator"
timeZone:         "America/Detroit"
office:           { city: "Livonia", state: "Michigan" }
primarySectors:   ["Institutional > Health Care > Hospital", "Institutional > Health Care > Medical Office Building (MOB)", "Institutional > Health Care > Outpatient Care", "Institutional > Health Care > Medical Center"]
deliveryMethods:  ["Construction Management at Risk (CMaR)", "Design-Bid-Build (DBB)", "Construction Manager as Agent (Owners Rep)"]
projectTypes:     ["Capital Improvements", "Facility Improvements", "CMAR"]
regions:          ["Midwest", "Northeast", "South", "West"]
stageDistribution: balanced across all stages
budgetRange:      { min: 10000000, max: 350000000 }
```

#### 6. Utilities
```
accountName:      "National Grid"
industry:         "Utilities"
sector:           "Public and Private"
ownerType:        "Type 2b: Seasonal Owner Operator"
timeZone:         "America/New_York"
office:           { city: "Waltham", state: "Massachusetts" }
primarySectors:   ["Civil & Infrastructure > Energy > Energy Distribution", "Civil & Infrastructure > Energy > Energy Production", "Civil & Infrastructure > Waste + Water > Water Infrastructure", "Civil & Infrastructure > Transportation > Roads / Highways"]
deliveryMethods:  ["Design-Bid-Build (DBB)", "Indefinite Delivery, Indefinite Quantity (IDIQ)", "Multi-Prime"]
projectTypes:     ["Utilities", "Transmission", "Capital Improvements"]
regions:          ["Northeast", "Midwest", "South"]
stageDistribution: heavy toward Course of Construction and Maintenance
budgetRange:      { min: 2000000, max: 120000000 }
```

#### 7. Education
```
accountName:      "University of Nebraska"
industry:         "Education"
sector:           "Public"
ownerType:        "Type 2b: Seasonal Owner Operator"
timeZone:         "America/Chicago"
office:           { city: "Lincoln", state: "Nebraska" }
primarySectors:   ["Institutional > Educational > College / University", "Institutional > Cultural > Library", "Institutional > Cultural > Museum", "Recreation > Indoor > Gym / Athletic Studio"]
deliveryMethods:  ["Design-Bid-Build (DBB)", "Construction Management at Risk (CMaR)", "Construction Manager as Agent (Owners Rep)"]
projectTypes:     ["Capital Improvements", "Facility Improvements", "Renewal of Existing Buildings and Facilities"]
regions:          ["Midwest", "South", "West"]
stageDistribution: heavy toward Feasibility, Final Design, and Bidding
budgetRange:      { min: 5000000, max: 180000000 }
```

#### 8. Renewables
```
accountName:      "Silicon Ranch"
industry:         "Renewables"
sector:           "Private"
ownerType:        "Type 2a: High Maturity Owner Operator"
timeZone:         "America/Chicago"
office:           { city: "Nashville", state: "Tennessee" }
primarySectors:   ["Civil & Infrastructure > Energy > Energy Production", "Civil & Infrastructure > Energy > Energy Storage", "Civil & Infrastructure > Energy > Energy Distribution"]
deliveryMethods:  ["Design-Build (DB)", "Construction Management at Risk (CMaR)", "Public-Private-Partnership (P3)"]
projectTypes:     ["Capital Improvements", "P3", "Utilities"]
regions:          ["South", "Southwest", "Midwest", "West"]
stageDistribution: heavy toward Permitting, Pre-Construction, and Course of Construction
budgetRange:      { min: 20000000, max: 500000000 }
```

#### 9. Airports
```
accountName:      "Los Angeles World Airports"
industry:         "Airports"
sector:           "Public"
ownerType:        "Type 2b: Seasonal Owner Operator"
timeZone:         "America/Los_Angeles"
office:           { city: "Los Angeles", state: "California" }
primarySectors:   ["Civil & Infrastructure > Transportation > Aviation", "Civil & Infrastructure > Transportation > Transportation Terminals", "Civil & Infrastructure > Transportation > Parking Garage"]
deliveryMethods:  ["Construction Management at Risk (CMaR)", "Design-Build (DB)", "Public-Private-Partnership (P3)", "Multi-Prime"]
projectTypes:     ["Capital Improvements", "P3", "DOT"]
regions:          ["West", "Southwest", "South"]
stageDistribution: heavy toward Final Design, Course of Construction, and Post-Construction
budgetRange:      { min: 25000000, max: 1200000000 }
```

---

## Step 4: Generate Seed Data Files

Generate all files below in order. Write each file completely before moving to the next.
After all files are written, run `npx tsc --noEmit` to confirm zero type errors.

---

### File 1: `/src/data/seed/account.ts`

Generate 1 Account record using the resolved company type configuration.

Rules:
- `id`: `"acc_001"`
- `companyName`: from config `accountName`
- `logo`: `null`
- `timeZone`: from config
- `office.name`: `"Headquarters"`
- `office.address`: a realistic street address for the config city
- `office.city`, `office.state`: from config
- `office.zip`: realistic ZIP for the city
- `office.country`: `"United States"`

---

### File 2: `/src/data/seed/users.ts`

Generate exactly 17 User records — one per UserRole. Derive each user's
`toolDefaults` from `ROLE_TOOL_PERMISSION_MAP` in `permissions.ts`.

UserRoles and suggested names:
```
CEO                           → Victoria Langford
COO                           → Marcus Webb
CFO                           → Sandra Okafor
Capital Planning              → Derek Huang
VP of Operations              → Priya Nair
VP of Development             → James Callahan
Board of Directors            → Eleanor Voss
Director of Project Management → Carlos Mendez
Director of Construction      → Bridget O'Sullivan
Program Manager               → Tyrone Jackson
Project Manager               → Rachel Kim
Construction Manager          → Anton Petrov
Superintendent                → Luis Herrera
Project Engineer              → Amara Osei
Foreman                       → Jake Kowalski
Operators                     → Nina Patel
IT Admin                      → Sam Thornton
```

Rules per user:
- `id`: `"user_001"` through `"user_017"` (sequential)
- `accountId`: `"acc_001"`
- `email`: `firstname.lastname@` + lowercase `accountName` domain (e.g. `victoria.langford@crescentcommunities.com`)
- `avatar`: `null`
- `permissions.toolDefaults`: derive from `ROLE_TOOL_PERMISSION_MAP[role]`
- `permissions.toolGranted`: `{}` (no overrides)
- `permissions.toolDenied`: `[]`
- `permissions.keyDefaults`: appropriate PermissionKeys for the role (see below)
- `permissions.keyGranted`: `[]`
- `permissions.keyDenied`: `[]`
- `favorites`: `{ projectIds: [], toolKeys: [] }`
- `createdAt`, `updatedAt`: realistic dates within last 2 years
- `lastActiveAt`: within last 30 days for active roles, null for Board of Directors

**keyDefaults by role tier:**
```
CEO, COO, CFO, IT Admin:
  All PermissionKeys

VP of Operations, VP of Development,
Director of Project Management, Director of Construction:
  platform:access, account:read, account:update,
  users:invite, users:update_role, users:update_permissions,
  projects:create, projects:read, projects:update, projects:delete, projects:manage_members,
  tools:enable, tools:disable

Capital Planning, Program Manager, Project Manager, Construction Manager:
  platform:access, account:read,
  projects:create, projects:read, projects:update, projects:manage_members,
  tools:enable

Superintendent, Project Engineer, Foreman, Operators:
  platform:access, projects:read

Board of Directors:
  platform:access, projects:read
```

**projectIds by role:**
```
CEO, COO, CFO, VP of Operations, VP of Development,
Director of PM, Director of Construction, IT Admin,
Capital Planning, Board of Directors:
  All 20 project IDs ("proj_001" through "proj_020")

Program Manager:
  proj_001 through proj_010

Project Manager (Rachel Kim):
  proj_001 through proj_006

Construction Manager:
  proj_007 through proj_014

Superintendent, Project Engineer, Foreman, Operators:
  proj_003 through proj_008
```

---

### File 3: `/src/data/seed/projects.ts`

Generate exactly 20 Project records using the resolved company type configuration.

**Status distribution (across 20 projects):**
- `active`: 10
- `on_hold`: 4
- `inactive`: 4
- `cancelled`: 2

**Stage distribution:** follow `stageDistribution` from the config.
Spread across all 11 stages with heavier weighting on configured stages.

**Region distribution:** use all configured regions, spread across 20 projects.
Each region drives the ProjectNumber prefix:
```
Northeast  → NE
Midwest    → MW
South      → S
West       → W
Southwest  → SW
```
ProjectNumbers: NE1001, MW1002, S1003... sequential per account.

**Rules per project:**
- `id`: `"proj_001"` through `"proj_020"`
- `program`: `null` (always — reserved for future use)
- `estimatedBudget`: realistic value within config `budgetRange`
- `sector`: one of config `primarySectors` (distribute across projects)
- `delivery`: one of config `deliveryMethods` (distribute)
- `type`: one of config `projectTypes` (distribute)
- `scope`: distribute across `new_construction`, `renovation`, `maintenance`
- `priority`: distribute `low`, `medium`, `high` realistically (more medium/high on active)
- `favorite`: `true` for 5 projects, `false` for 15
- `photo`: `null` for all
- `country`: `"United States"`
- `latitude` / `longitude`: accurate coords for the city
- `startDate` / `endDate`: realistic — active projects started 6–18 months ago,
  on_hold started 12–24 months ago, cancelled never completed
- `description`: 1–2 sentences describing the project scope

Generate realistic project names appropriate to the company type.
Examples for Multi-Family:
  "Crescent at South End", "The Residences at Mueller", "Parkside Commons Phase II"

---

### File 4: `/src/data/seed/wbs.ts`

Generate WBSItem records for all three segment types.
Use the Construction Owner WBS Dictionary below as the source of truth.

**Cost Codes (segment: 'cost_code') — use exactly this structure:**
```
1.0  PRE-DEVELOPMENT & SOFT COSTS
1.1    Land Acquisition
1.2    Design & Engineering Fees
1.3    Permits & Govt Fees
1.4    Legal & Professional Services
2.0  HARD COSTS (CONSTRUCTION)
2.1    Site Preparation & Civil
2.2    Shell & Core (Structure/Envelope)
2.3    Interior Construction & Finishes
2.4    MEP (Mechanical, Electrical, Plumbing)
2.5    General Conditions (GC Fees/Insurance)
3.0  FF&E AND TECHNOLOGY
3.1    Furniture & Fixtures
3.2    IT, AV & Security Systems
3.3    Signage & Branding
4.0  OWNER INDIRECTS & FINANCE
4.1    Owner Project Management
4.2    Financing Interest & Bank Fees
4.3    Marketing & Leasing Commissions
4.4    Insurance (Builder's Risk)
5.0  CONTINGENCY & RESERVES
5.1    Owner Construction Contingency
5.2    Design/Escalation Reserve
5.3    Closeout & Commissioning
```

**Cost Types (segment: 'cost_type') — use exactly these:**
```
L   Labor
M   Material
E   Equipment
S   Subcontract
P   Professional Fees
F   Permits & Fees
I   Insurance & Tax
C   Contingency
O   Overhead/Other
```

**WBS Programs (segment: 'program') — generate 4 records appropriate to company type.**
Examples for Multi-Family: "Infrastructure", "Amenities", "Unit Renovation", "Common Areas"
Examples for Healthcare: "Acute Care", "Outpatient", "Research", "Facilities"

Rules:
- `id`: `"wbs_cc_001"` etc. (prefix by segment: cc=cost_code, ct=cost_type, p=program)
- `accountId`: `"acc_001"`
- `status`: `"active"` for all
- `createdAt` / `updatedAt`: realistic dates

---

### File 5: `/src/data/seed/hubs.ts`

Generate 2 Hub instances using Hub, HubTab, and HubCard types from `tools/hubs.ts`.

**Portfolio Hub:**
```
id: "hub_portfolio"
level: "portfolio"
projectId: null
displayName: { navLabel: "Hub", pageTitle: "Hub" }

Tabs:
  Tab 1 — "Portfolio" (order: 0, source: 'admin')
    Cards:
      project_list     (order: 0) — title: "Projects"
      open_issues      (order: 1) — title: "Open Issues"
      tasks_summary    (order: 2) — title: "My Tasks"

  Tab 2 — "Cost Management" (order: 1, source: 'admin')
    Cards:
      budget_summary        (order: 0) — title: "Budget Overview"
      change_order_summary  (order: 1) — title: "Change Orders"
      custom_metric         (order: 2) — title: "Forecast to Complete"

  Tab 3 — "Schedule & Milestones" (order: 2, source: 'admin')
    Cards:
      schedule_summary  (order: 0) — title: "Schedule Status"
      open_rfis         (order: 1) — title: "Open RFIs"
```

**Project Hub:**
```
id: "hub_project"
level: "project"
projectId: null  (resolved at runtime to the active project)
displayName: { navLabel: "Project Overview", pageTitle: "" }
(pageTitle resolved at runtime: "{ProjectNumber} {ProjectName}")

Tabs:
  Tab 1 — "Overview" (order: 0, source: 'admin')
    Cards:
      budget_summary    (order: 0) — title: "Budget Health"
      schedule_summary  (order: 1) — title: "Schedule Health"
      open_issues       (order: 2) — title: "Open Issues"
      recent_activity   (order: 3) — title: "Recent Activity"

  Tab 2 — "Cost" (order: 1, source: 'admin')
    Cards:
      budget_summary        (order: 0) — title: "Budget Summary"
      change_order_summary  (order: 1) — title: "Change Orders"

  Tab 3 — "Schedule" (order: 2, source: 'admin')
    Cards:
      schedule_summary  (order: 0) — title: "Schedule"
```

HubCard config rules:
- `toolKey`: match the card type to its source tool
- `maxItems`: 5 for list-type cards, omit for summary/chart cards
- `projectIds`: omit (portfolio hub filters via page-level filters at runtime)
- `dateRange`: omit
- `customMetricKey`: `"forecast_to_complete"` for custom_metric card

---

### File 6: `/src/data/seed/budget.ts`

Generate BudgetLineItem records — 5 per active project (10 active projects = 50 total).

Rules:
- Use realistic WBS code combinations from the wbs.ts data
- `programCode`: one of the 4 WBS Program codes
- `costTypeCode`: one of the 9 Cost Type codes
- `costCode`: one of the leaf Cost Code codes (e.g. "1.1", "2.3", "4.2")
- `originalBudgetAmount`: realistic portion of the project's `estimatedBudget`
  (5 line items should sum to roughly 80–95% of total budget)
- `approvedCOs`: 0 to 8% of originalBudgetAmount
- `budgetChanges`: 0 to 5% of originalBudgetAmount
- `committedCosts`: 20–90% of originalBudgetAmount (higher for active/later-stage projects)
- `directCosts`: 10–70% of committedCosts
- `pendingCostChanges`: 0 to 15% of originalBudgetAmount
- `subcontractorInvoices`: 0 to directCosts
- `pendingRisk`: 0 to 10% of originalBudgetAmount
- Do NOT include calculated fields — comment them as: `// Calculated at runtime`

---

### File 7: `/src/data/seed/schedule.ts`

Generate ScheduleItem and Milestone records per active project.
Use the standard milestone list as the source for Milestone names.

**Per active project (10 projects):**
- 6 ScheduleItems covering major work phases
- 4 Milestones chosen from this list:
  ```
  Project Charter, Design Kickoff, Readiness Review, Decision Support Package,
  Project Scope, Feasibility Study, Construction Documents,
  Storm Water Pollution Prevention Plan, Municipal Approvals, Environmental Survey,
  Building Permits, Bidding, Client Handoff, Designs Approved, Interior Finishes,
  MEP Rough-In, Notice to Proceed, Phase 1 - Construction, Phase 2 - Construction,
  Phase 3 - Final Build, Retrofit Start, Site Mobilization, Substantial Completion
  ```
  Choose milestones appropriate to the project's stage.

Rules:
- `type`: `'item'` for ScheduleItems, `'milestone'` for Milestones
- `status`: align with project status and stage
  (active + course_of_construction → in_progress or complete items)
- At least 1 predecessor link per project (FS type)
- `percentComplete`: 0 for not_started, 1–99 for in_progress, 100 for complete
- `wbs`: reference a realistic cost code from wbs.ts (e.g. "2.1" for site work)
- `actualStartDate` / `actualFinishDate`: null for future items, set for started/complete
- `actualMilestoneDate`: null for future milestones, set for reached milestones
- `assignees`: assign 1–2 user IDs appropriate to the work

---

## Role-Based Assignment Matrix

Every user must appear as an assignee, approver, plan manager, or distribution list
member in at least 2 records across all seed data files. Use this matrix to guide
assignment decisions across tasks, documents, schedule items, action plans, and assets.

The goal is that when a user logs in and views "My Open Items" or any assigned-items
view, they see meaningful, role-appropriate work — not an empty list.

| User | Role | Assign To |
|---|---|---|
| Victoria Langford | CEO | Action plan approver (plans 1+2), distribution list on high-value tasks |
| Marcus Webb | COO | Schedule milestone assignee (Substantial Completion, Phase 3), task distribution list |
| Sandra Okafor | CFO | Budget-related tasks (2), document assignee for financial docs (in_review) |
| Derek Huang | Capital Planning | Budget-related tasks (2), document assignee for cost reports (in_review) |
| Priya Nair | VP of Operations | Action plan approver (plan 1), schedule item assignee (site work phases) |
| James Callahan | VP of Development | Action plan approver (plan 3), task assignee (design/contract tasks) |
| Eleanor Voss | Board of Directors | Distribution list only — never a primary assignee |
| Carlos Mendez | Director of PM | Action plan planManagerId (plans 1+2), task assignee (3+ tasks), completedReceiver |
| Bridget O'Sullivan | Director of Construction | Schedule item assignee (construction phases), task assignee (2+ field tasks) |
| Tyrone Jackson | Program Manager | Task assignee (3+ tasks across projects), schedule milestone assignee |
| Rachel Kim | Project Manager | Task assignee (4+ tasks), action plan item assignee, document assignee |
| Anton Petrov | Construction Manager | Schedule item assignee (2+ items), task assignee (2+ tasks) |
| Luis Herrera | Superintendent | Schedule item assignee (site mobilization, phase 1), task assignee (field tasks) |
| Amara Osei | Project Engineer | Document assignee (drawings in_review), action plan item assignee, tasks |
| Jake Kowalski | Foreman | Task assignee (field tasks), schedule item assignee (MEP, finishes) |
| Nina Patel | Operators | Task assignee (1–2 operational tasks), asset createdBy |
| Sam Thornton | IT Admin | Task assignee (IT/systems tasks), document assignee (IT docs) |

### Enforcement Rules

1. **Every user must be an assignee or approver in at least 2 records total**
   across tasks + documents + schedule items + action plans + assets combined.

2. **Executive roles** (CEO, COO, CFO, VPs, Directors) appear primarily as:
   - Action plan `approverIds` or `planManagerId`
   - Task `distributionList` members
   - Document `assignees` for in_review approval items
   - Schedule milestone `assignees` for key delivery milestones

3. **Operational roles** (Program Manager, Project Manager, Construction Manager) appear as:
   - Primary task `assignees` (most tasks)
   - Action plan item `assigneeIds`
   - Schedule item `assignees`

4. **Field roles** (Superintendent, Project Engineer, Foreman, Operators) appear as:
   - Schedule item `assignees` for construction phase items
   - Task `assignees` for field-level tasks
   - Asset `createdBy`

5. **Board of Directors** (Eleanor Voss) appears only in `distributionList` —
   never as a primary assignee on any record.

6. **After generating all files**, produce a coverage table confirming every user
   appears in at least 2 records. If any user has fewer than 2, add records before
   moving to validation.

---



### File 8: `/src/data/seed/tasks.ts`

Generate 24 Task records spread across projects and users.
Every user must appear as an assignee or distribution list member in at least 1 task.

**Status distribution:**
- `initiated`: 7
- `in_progress`: 8
- `ready_for_review`: 5
- `closed`: 3
- `void`: 1

**Required task assignments by role** (create these first, then fill remaining tasks freely):

| Task | Assignee(s) | Category | Status |
|---|---|---|---|
| Review structural engineering report | Rachel Kim, Amara Osei | Design | in_progress |
| Coordinate MEP rough-in schedule | Anton Petrov, Luis Herrera | Design | in_progress |
| Submit building permit application | Carlos Mendez | Administrative | initiated |
| Confirm subcontractor insurance certificates | Rachel Kim | Contract | ready_for_review |
| Site mobilization checklist | Luis Herrera, Jake Kowalski | Administrative | closed |
| Review change order log | Sandra Okafor, Derek Huang | Contract | in_progress |
| Update project schedule | Tyrone Jackson, Rachel Kim | Administrative | in_progress |
| IT infrastructure procurement | Sam Thornton | Equipment | initiated |
| Utility coordination sign-off | Jake Kowalski, Nina Patel | Utility Coordination | in_progress |
| Design review package submission | James Callahan, Amara Osei | Design | ready_for_review |
| Final commissioning walkthrough | Bridget O'Sullivan, Luis Herrera | Closeout | initiated |
| Capital expenditure approval | Derek Huang | Contract | ready_for_review |
| Project close-out documentation | Carlos Mendez, Rachel Kim | Closeout | initiated |
| Safety inspection report | Jake Kowalski | Miscellaneous | closed |
| Lease commission reconciliation | Sandra Okafor | Administrative | in_progress |
| Board update presentation | Priya Nair | Administrative | initiated |
| Phase 2 construction kickoff | Tyrone Jackson, Anton Petrov | Preconstruction | initiated |
| Procurement tracking update | Nina Patel | Equipment | void |

Rules:
- `distributionList` on executive tasks: include Victoria Langford, Marcus Webb, or Eleanor Voss
- Mix of `private: true` (4 tasks) and `private: false` (20 tasks)
- 10 tasks with `dueDate` set, 14 with `dueDate: null`
- `attachments`: `[]` for all
- `description`: 1 sentence per task

---

### File 9: `/src/data/seed/documents.ts`

Generate 15 Document records across projects.

**Type distribution:** 6 DOC, 5 DR, 4 IMG
**Status distribution:** 5 open, 5 in_review, 4 approved, 1 rejected
**Format distribution:** mix of PDF, DOCX, DWG, PNG, XLSX

**Required document assignments by role** (in_review documents need assignees):

| Document Title | Type | Format | Status | Assignee(s) |
|---|---|---|---|---|
| Structural Engineering Report | DOC | PDF | in_review | Sandra Okafor, Derek Huang |
| Site Plan Rev 3 | DR | DWG | in_review | Amara Osei, Rachel Kim |
| MEP Coordination Drawing | DR | DWG | in_review | Anton Petrov, Amara Osei |
| Cost Reconciliation Report | DOC | XLSX | in_review | Sandra Okafor |
| Phase 1 Progress Photos | IMG | PNG | in_review | Bridget O'Sullivan |

Rules:
- `url`: `"/mock-documents/{id}.{format.toLowerCase()}"` (placeholder path)
- `version`: 1 for most, 2 for 3 records (to show versioning)
- `size`: realistic file sizes in bytes (PDF ~500KB–5MB, images ~200KB–2MB)
- `dateAuthored`: realistic, before `createdAt`
- `authoredBy`: assign to the user whose role fits the document type
  (drawings → Amara Osei; financial docs → Derek Huang; field photos → Luis Herrera)
- `assignees`: `[]` for open/approved/rejected documents

---

### File 10: `/src/data/seed/action_plans.ts`

Generate 3 ActionPlan records across projects.

**Plan 1 — In Progress:**
- `status: 'in_progress'`
- `type`: appropriate to company type (e.g. "Construction Phase Checklist")
- `planManagerId`: Carlos Mendez
- `approverIds`: Victoria Langford, Priya Nair
- `completedReceiverIds`: Marcus Webb
- 3 sections, 3–4 items each
- Item assignees: Rachel Kim, Tyrone Jackson, Amara Osei (distribute across items)
- Mix of open, in_progress, and closed items
- `private: false`

**Plan 2 — Complete:**
- `status: 'complete'`
- `type`: "Project Close-out"
- `planManagerId`: Carlos Mendez
- `approverIds`: Victoria Langford, James Callahan
- `completedReceiverIds`: Marcus Webb, Sandra Okafor
- 2 sections, 3 items each
- Item assignees: Rachel Kim, Anton Petrov, Bridget O'Sullivan
- All items closed
- `private: false`

**Plan 3 — Draft:**
- `status: 'draft'`
- `type`: "Preconstruction"
- `planManagerId`: Tyrone Jackson
- `approverIds`: James Callahan
- `completedReceiverIds`: Carlos Mendez
- 2 sections, 2 items each
- Item assignees: Rachel Kim, Amara Osei
- All items open
- `private: true`

Rules:
- Item numbering: `{sectionNumber}.{itemNumber}` (e.g. 1.1, 1.2, 2.1)
- `acceptanceCriteria`: 1 sentence per item
- `dueDate`: set for in_progress items, null for draft items
- `references`: `[]`, `records`: `[]` for all

---

### File 11: `/src/data/seed/assets.ts`

Generate 12 Asset records across projects.

**Status distribution:**
- `planned`: 2
- `in_design`: 2
- `installed`: 2
- `commissioned`: 2
- `active`: 3
- `under_maintenance`: 1

Rules:
- `type`: use AssetType values appropriate to company type
  (Healthcare → HVAC Systems, Elevators; Data Center → Generator, HVAC Systems)
- `trade`: match to asset type (HVAC → 'HVAC', Generator → 'Electrical')
- `federalAssetId`: realistic alphanumeric string (e.g. "FA-2024-00142")
- `warrantyExpirationDate`: 1–10 years in the future
- `conditionAtInstall`: set for installed/commissioned/active, null for planned/in_design
- `photo`: `null`
- `code`: unique alphanumeric (e.g. "ASSET-001")

---

### File 12: Stub Files

Generate empty stub files for all unmodeled tools.
Each stub exports an empty array typed to a placeholder interface.

```typescript
// /src/data/seed/rfis.ts
export const rfis: any[] = [];

// /src/data/seed/change_orders.ts
export const changeOrders: any[] = [];

// ... repeat for:
// bidding, change_events, invoicing, prime_contracts, punch_list,
// specifications, submittals, observations, correspondence,
// commitments, capital_planning, funding_source
```

---

### File 13: `/src/data/seed/index.ts`

Generate a barrel export file that re-exports all seed data:

```typescript
export { account } from './account';
export { activeUser } from './activeUser';
export { users } from './users';
export { projects } from './projects';
export { wbsItems } from './wbs';
export { hubs } from './hubs';
export { budgetLineItems } from './budget';
export { scheduleItems, milestones } from './schedule';
export { tasks } from './tasks';
export { documents } from './documents';
export { actionPlans } from './action_plans';
export { assets } from './assets';
// Stubs
export { rfis } from './rfis';
export { changeOrders } from './change_orders';
// ... all other stubs
```

---

## Step 5: Validate

After all files are written:

1. Run `npx tsc --noEmit` — confirm zero type errors
2. Confirm record counts:
   - 1 account, 1 activeUser reference, 17 users, 20 projects
   - 23 WBS cost codes + 9 cost types + 4 WBS programs
   - 2 hub instances, 6 hub tabs, 10+ hub cards
   - 50 budget line items (5 per active project)
   - 60 schedule entries (6 items + 4 milestones × 10 active projects)
   - 24 tasks, 15 documents, 3 action plans, 12 assets
3. Confirm all `projectId` references in child records match valid project IDs
4. Confirm all `userId` / `assigneeId` / `createdBy` references match valid user IDs
5. **Produce a user coverage table** — every user must appear in at least 2 records:

   | User | Role | Assigned To (records) | Count |
   |---|---|---|---|
   | Victoria Langford | CEO | ... | ≥ 2 |
   | Marcus Webb | COO | ... | ≥ 2 |
   | Sandra Okafor | CFO | ... | ≥ 2 |
   | ... | ... | ... | ≥ 2 |

   If any user has fewer than 2 assignments, add the missing records before
   marking complete. Eleanor Voss (Board of Directors) counts distributionList
   appearances toward her minimum.

6. Report any issues before marking complete

---

## Key Rules

1. **Never invent type values.** All union type values must come from the source files.
2. **program is always null on Project.** Do not use it as a string grouping field.
3. **Budget calculated fields are never stored.** Comment them as `// Calculated at runtime`.
4. **All IDs must be consistent across files.** A projectId referenced in budget.ts must exist in projects.ts.
5. **Tool defaults come from ROLE_TOOL_PERMISSION_MAP.** Do not invent permission levels.
6. **Milestones come from the standard list.** Do not invent milestone names.
7. **WBS codes come from the dictionary above.** Do not invent cost codes or cost types.
8. **Company type drives everything.** Names, sectors, budgets, and project types must be appropriate to the selected company type.
9. **Every user must have assigned items.** Follow the role-based assignment matrix. No user should have an empty assigned-items view when they log in. Produce the coverage table in Step 4 to confirm.
