# Owner Prototype — Claude Code Context File

> **Read this file at the start of every session.** It is the single source of truth for the owner prototype. It defines what is being built, how the app is structured, which skills to load and when, and what patterns to follow. Do not deviate from the patterns defined here.

---

## 1. What Is Being Built

A **reusable React prototype scaffold** representing the baseline Owner experience for a construction management platform. This is not a one-off prototype — it is a living scaffold that every future owner-facing prototype starts from.

**Core characteristics:**
- Seed-data driven (no backend, no API calls)
- Persona-switchable (permissions and data filter by active user)
- Design system compliant (`@procore/core-react` v12.42.0, imported directly via npm)
- Deployable to Vercel
- Flexible — new cards, tabs, tools, and personas can be added without restructuring

---

## 2. Skill Map — Load Before Working

These skills exist and must be loaded before doing any related work. Do not rely on memory for component APIs, design rules, or card patterns.

| Skill | When to Load | What It Covers |
|---|---|---|
| `core-react/SKILL.md` | Any time you are building, auditing, or looking up a UI component | All `@procore/core-react` components (91), TypeScript types, Storybook usage, design guidelines, 4 workflows, 10 guardrails |
| `procore-ds-guidelines/SKILL.md` | Before building any page or running a quality gate | NGX layout selection, button rules, form rules, data table rules, content guidelines, a11y, master checklist |
| `create-hub-card/SKILL.md` | Any time you are building or modifying a hub card | HubCard component anatomy, sizing, body variants, GridStack registration, edit mode props |
| `populate-seed-data/SKILL.md` | When initializing, resetting, or repopulating seed data | Prompts for company type + active user, generates all 13 seed files, enforces role-based assignments, validates coverage |

**Loading order for a typical build session:**
1. This file (`CONTEXT.md`) — always first
2. `core-react/SKILL.md` — route to correct workflow
3. `create-hub-card/SKILL.md` — if building hub cards
4. `procore-ds-guidelines/SKILL.md` — run checklist before marking any feature done
5. `populate-seed-data/SKILL.md` — only when seeding or re-seeding data

---

## 3. Application Levels

The app operates across two distinct levels. Everything — navigation, tools, data scope — is contextual to which level the user is at.

| Level | Description | Home Page |
|---|---|---|
| **Portfolio** | Company-wide. Aggregates data across all projects. No project selected. | Portfolio Hub |
| **Project** | Single project context. Tools scoped to that project only. | Project Overview |
| **Settings** | Company-level configuration. Separate top-level area outside main nav. | Settings Landing |

---

## 4. Global Navigation (Always Present)

Persistent across all levels and page types. Left to right:

| Element | Behavior |
|---|---|
| **Menu Button** | Opens sliding drawer nav (contextual to level) |
| **Procore Logo** | Navigates home (Portfolio Hub) |
| **Project Menu** | Account name + current project. Quick project switching. No project selected at Portfolio level. |
| **Search Bar** | AI-powered global search |
| **App Menu** | 3rd party app integrations |
| **Help / Open Items / Notifications** | Icon buttons — each opens a **popover** (not a new page) |
| **User Avatar + Company Logo** | Both open the same profile menu — includes Settings access |

---

## 5. Sliding Drawer Navigation

- Flat alphabetical list of **Tools**
- Content is contextual to current level (Portfolio vs. Project)
- Some tools exist at both levels (same tool, different data scope)
- Some tools are unique to one level

**Tool definition:** A self-contained data set and workflow for a specific construction domain. At Portfolio level, tools aggregate cross-project data. At Project level, tools are where objects are created and managed.

**Tool list (alphabetical):**
Action Plans, Assets, Bidding, Budget, Capital Planning, Change Events, Change Orders, Commitments, Correspondence, Documents, Funding Source, Hubs, Invoicing, Observations, Prime Contracts, Punch List, RFIs, Schedule, Specifications, Submittals, Tasks

---

## 6. Information Architecture

```
App Root
├── Portfolio Level
│   ├── Portfolio Hub (Home)                ← Hub page type
│   │   ├── Tab: Portfolio
│   │   ├── Tab: Cost Management
│   │   └── Tab: Schedule & Milestones
│   └── Portfolio Tools (drawer nav)        ← Tool List page type
│       ├── [Tool Name]
│       │   └── [Item Detail]               ← Detail page type
│       └── ...
│
├── Project Level
│   ├── Project Overview (Home)             ← Hub page type (same structure, different content)
│   │   ├── Tab: Overview
│   │   ├── Tab: Cost
│   │   └── Tab: Schedule
│   └── Project Tools (drawer nav)          ← Tool List page type
│       ├── [Tool Name]
│       │   └── [Item Detail]               ← Detail page type
│       └── ...
│
└── Settings                                ← Settings page type
    └── [Section] → [Form Cards]
```

> Note: "Program" is a project attribute used for grouping and filtering, not a navigation level.

---

## 7. Page Types

There are **4 page types**. Every page in the app is one of these. Always identify the page type before building.

### Page Type Mapping (Product Name → DS Template → Core-React Component)

| Product Name | NGX Template Name | Core-React Component |
|---|---|---|
| **Hub** (Portfolio Hub, Project Overview) | `ToolLandingPage` (outer shell only) | `ToolLandingPage` + `Grid` + `Card` |
| **Tool List** | `Tool Landing` / `ListPage` | `ListPage` |
| **Detail** | `Detail Page` | `DetailPage` |
| **Settings** | `Tool Settings` / `SettingsPage` | `SettingsPage` |

> ⚠️ The Hub has no exact DS template equivalent. Use `ToolLandingPage` as the outer shell. Compose the card grid using `Grid` + `Card` per the `create-hub-card` skill.

---

### Hub Page Type

**Used for:** Portfolio Hub, Project Overview

**Layout anatomy:**
- `PageHeader` — hub name, action buttons (+ Add Card, Edit View), tab bar
- Page-level filter bar — filter by Program, Region, Status, Stage, Project Type; applies across all cards on active tab
- Card grid — 12-column GridStack grid, cards sized at 4 / 6 / 8 / 12 columns

**Tab rules:**
- Each tab = distinct hub view with its own card configuration
- Defaults set by audience type; admin can standardize; users with permissions can create personal views
- Permission model: Company Admin → Team Admin → Power User → Standard User (view only)

**Card interaction pattern — two distinct affordances:**

1. **Item / row click → Tearsheet** (primary pattern to reinforce)
   - Clicking any individual item, row, or data grouping within a card body always opens the Tearsheet
   - The Tearsheet lets users view detail, take action, or navigate deeper without leaving the hub
   - This is the pattern to default to and push in all new card designs

2. **Card-level "Go to [Tool]" link → full navigation** (secondary escape hatch)
   - Each card may include a direct link to the underlying tool (e.g. in the card header `secondaryAction` or footer)
   - This is for users who want to bypass the Tearsheet and work directly in the tool — typically for management-level bulk tasks
   - This link navigates away from the hub entirely to the Tool List page

**Rule:** Individual items always open a Tearsheet. The card itself may offer a direct tool link, but that is secondary. Never make item-level row clicks navigate directly to a Detail page from a hub card.

**Components:** `ToolLandingPage`, `Tabs`, `Grid`, `Card`, `Button`, `FilterGroup` — plus `HubCard` system from `create-hub-card` skill

---

### Tool List Page Type

**Used for:** All tools at Portfolio and Project level

**Layout anatomy:**
- `PageHeader` — tool name, primary action (+ Create), optional sub-view tabs
- Toolbar row 1: Search + filters + column config
- Toolbar row 2: Quick filters + applied filter chips
- `ListPage` / `DataTable` — rows = items, row click → navigates to **Detail page** (full navigation)

**Components:** `ListPage`, `Table` or `TableShelf`, `ToolHeader`, `Search`, `Button`, `Checkbox` (bulk select), `Pagination`, `EmptyState`

---

### Detail Page Type

**Used for:** Individual item view/edit

**Layout anatomy:**
- `PageHeader` — item name/ID, status badge, action buttons, optional tabs
- Breadcrumb: `Portfolio / [Tool] / [Item]` or `[Project] / [Tool] / [Item]`
- Two-column body: main content (form fields, rich content, attachments) + sidebar (key attributes, status history, related items)
- Optional activity/comments feed

**Navigation:** Accessed by clicking a row in a Tool List. Browser back returns to Tool List.

**Components:** `DetailPage`, `Breadcrumbs`, `Tabs`, `Form`, `FormField`, `Input`, `Select`, `DateSelect`, `Card`, `Badge`

---

### Settings Page Type

**Used for:** Company + tool configuration

**Layout anatomy:**
- Settings sidebar nav (section wayfinding, replaces drawer nav within settings)
- `PageHeader` — section name, Save action
- Stacked `Card` components containing forms (no DataTable)
- Changes are explicitly saved (Save button), not auto-saved

**Access:** Settings is accessed from the profile menu (User Avatar or Company Logo in the global nav). It is a separate top-level area — not part of the drawer nav.
1. Company / Org settings — profile, branding, regional defaults
2. Tool configuration — per-tool defaults, custom fields, workflows

**Components:** `SettingsPage`, `Card`, `Form`, `FormField`, `Input`, `Select`, `Toggle`, `Switch`, `Button`

---

## 8. Hub Card System

> Always load `create-hub-card/SKILL.md` before building or modifying hub cards.

### Card Anatomy

```
┌─────────────────────────────────────────────┐
│ HEADER (mandatory)                          │
│  Title | Info Icon | Pill | Actions | Menu  │
├─────────────────────────────────────────────┤
│ CONTROL BAR (optional)                      │
│  Tabs | Filters | Search                    │
├─────────────────────────────────────────────┤
│ BODY (mandatory)                            │
│  donut-chart | line-chart | bar-chart |     │
│  number-card | list-item | table | custom   │
├─────────────────────────────────────────────┤
│ FOOTER (optional)                           │
│  Pagination | Metadata | Action link        │
└─────────────────────────────────────────────┘
```

### Card Sizes (GridStack 12-column grid)

| Size | Columns | Use |
|---|---|---|
| `sm` | 4 cols | Metric cards, small charts |
| `md` | 6 cols | Lists, medium charts |
| `lg` | 8 cols | Complex lists, wide charts |
| `xl` | 12 cols | Tables, full-width dashboards |

### Adding a New Card (3 Steps)

1. Add content key to `GridItem.content` string literal union in `/src/App.tsx`
2. Add `GridItem` entry to `DEFAULT_HUB_LAYOUT` and `initialLayout` arrays
3. Add `case` branch in `renderCardContent()` switch statement

Always pass `isEditMode`, `currentWidth`, and `onManualResize` to every `<HubCard>` in `renderCardContent()`.

### Hub Cards in This Prototype

**Portfolio Tab:**
- `ProjectListCard` (xl) — full project list with bulk edit, bulk create, grouping
- `MyOpenItemsCard` (md) — open items scoped to active persona
- `AIDigestCard` (md) — AI-driven digest, content varies by persona

**Cost Management Tab:**
- `CostSummaryCard` (sm) — budget vs. actuals KPI
- `CapitalPlanningCard` (lg) — capital planning overview
- `FundingSourceCard` (md) — funding source allocation
- `BudgetActualsCard` (xl) — budget vs. actuals chart

**Schedule & Milestones Tab:**
- `MilestoneTimelineCard` (xl) — milestone timeline
- `UpcomingDeadlinesCard` (md) — upcoming deadlines list
- `AtRiskCard` (sm) — at-risk projects indicator

**Project Overview (Project Level):**
- `ProjectHealthCard` (sm) — budget health KPI
- `ScheduleHealthCard` (sm) — schedule health KPI
- `OpenItemsCountCard` (sm) — open items count
- `RecentActivityCard` (lg) — recent activity feed

---

## 9. Tearsheet Pattern

The Tearsheet is the **primary interaction pattern** for all item-level drill-down from hub cards. It is never used on Tool List or Detail pages.

### Two Affordances on Every Hub Card

| Affordance | Trigger | Destination | When to Use |
|---|---|---|---|
| **Item click** | Click a row, data point, or grouping in the card body | Tearsheet (slide-in panel) | Always — this is the default pattern |
| **Tool link** | `secondaryAction` button or footer link on the card itself | Tool List page (full navigation) | Secondary escape hatch for users doing bulk management work |

The tool link bypasses the Tearsheet entirely and navigates to the tool. This is intentional for power users, but the Tearsheet is the experience to design for and reinforce by default.

**Behavior:**
- Slides in from the right, overlays the page
- Dismissed via close button or clicking outside
- Always includes a "Go to [Tool/Project]" CTA in the footer for deeper navigation when needed

### TearsheetManager Pattern

Use a single shared `TearsheetManager` — do not instantiate a tearsheet per card.

```tsx
// State shape
const [selectedItem, setSelectedItem] = useState<{
  type: 'project' | 'openItem' | 'costLine' | 'milestone';
  id: string;
} | null>(null);

// Cards call this on row / item click
onDetailOpen: (type, id) => setSelectedItem({ type, id })

// Single tearsheet instance reads selected item and routes content
<TearsheetManager
  item={selectedItem}
  onClose={() => setSelectedItem(null)}
/>
```

**Components:** `Tearsheet` from `@procore/core-react`, `Button` for actions + CTA

---

## 10. Seed Data

All seed data lives in `/src/data/seed/`. No API calls. Data is loaded into React Context at app root. All types must conform to the source files in the data model.

### File Structure

```
/src/data/seed/
  account.ts        ← 1 Account + 1 Office record
  users.ts          ← 5–6 User records (CEO, Project Manager, CFO, Board, IT Admin, Superintendent)
  projects.ts       ← 6–10 Project records across mixed statuses, stages, regions, sectors
  wbs.ts            ← WBSItem records for Cost Codes, Cost Types, WBS Programs
  hubs.ts           ← 2 Hub instances (portfolio + project) with tabs and cards
  budget.ts         ← BudgetLineItem records per project (source columns only)
  schedule.ts       ← ScheduleItem + Milestone records per project
  tasks.ts          ← Task records across projects and users
  documents.ts      ← Document records per project
  action_plans.ts   ← ActionPlan + Section + Item records
  assets.ts         ← Asset records per project
  [stubs]           ← Empty lists for: bidding, change_events, change_orders,
                      invoicing, prime_contracts, rfis, punch_list,
                      specifications, submittals, observations,
                      correspondence, commitments, capital_planning, funding_source
```

### Key Data Shapes (reconciled against source files)

```typescript
// From project.ts — key fields
interface Project {
  id: string;
  number: ProjectNumber;          // e.g. "NE1001"
  name: string;
  status: ProjectStatus;          // active | inactive | on_hold | cancelled
  stage: ProjectStage;            // conceptual → closeout (11 values)
  program: null;                  // Reserved — always null, future hierarchy
  estimatedBudget: number;
  priority: ProjectPriority;      // low | medium | high
  scope: WorkScope;
  sector: ProjectSector;          // Tiered path string e.g. 'Residential > Multifamily'
  delivery: DeliveryMethod;
  type: ProjectType;              // 23-value classification
  region: ProjectRegion;          // Northeast | Midwest | South | West | Southwest
  city: string; state: USState; country: string;
  address: string; latitude: number; longitude: number;
  favorite: boolean;
  photo: string | null;
  startDate: Date; endDate: Date;
  description: string;
}

// From user.ts — key fields
interface User {
  id: string;
  accountId: string;
  firstName: string; lastName: string;
  companyName: string;
  email: string;
  avatar: string | null;
  role: UserRole;                 // 17-value job title union
  projectIds: string[];
  permissions: UserPermissions;   // toolDefaults + toolGranted + toolDenied + keyDefaults + keyGranted + keyDenied
  favorites: UserFavorites;
  createdAt: Date; updatedAt: Date; lastActiveAt: Date | null;
}

// From account.ts
interface Account {
  id: string;
  companyName: string;
  logo: string | null;
  timeZone: string;               // IANA e.g. 'America/New_York'
  office: Office;
}
```

---

## 11. Persona & Permission Model

### Persona Switcher

A dev-tool style switcher visible in the global nav. Switching the active user:
- Filters visible projects to those in `user.projectIds`
- Shows/hides tools in the drawer nav via `canAccessTool(user, tool)`
- Shows/hides action buttons via `hasToolPermission(user, tool, 'create')`
- Shows/hides hub cards and tabs based on tool access
- Adjusts AI Digest card content per user context

### Prototype Users (seed data — covers key role tiers)

| Name | UserRole | Project Access | Permission Group |
|---|---|---|---|
| Alex Chen | CEO | All projects | EXECUTIVE — capital planning, full financials |
| Jordan Reyes | Project Manager | Assigned projects only | MANAGER — all tools, no capital planning |
| Sam Taylor | CFO | All projects | EXECUTIVE — full financial access |
| Dana Brooks | Board of Directors | All projects | BOARD — hubs + documents + schedule read only |
| Morgan Ellis | IT Admin | All projects | ADMIN — full access including settings |
| Casey Ward | Superintendent | Assigned projects only | FIELD — no financials, field tools only |

### Permission Resolution (from permissions.ts)

```
Effective permission = roleDefaults → + granted → - denied
```

- Tool access: `canAccessTool(user, toolKey)` → show/hide in nav
- Tool action: `hasToolPermission(user, toolKey, 'create')` → show/hide buttons
- Non-tool action: `hasPermissionKey(user, 'projects:create')` → show/hide Create Project
- All utilities live in `/src/utils/permissions.ts`

---

## 12. Create Flow

Multi-step project creation triggered from the Portfolio Hub ("+ New Project").

**Pattern:** Multi-step `Modal` with internal step state

**Steps:**
1. Project type selection
2. Basic info (name, owner, type, budget)
3. Template / settings selection
4. Confirmation

**On submit:** Adds project to local state (does not persist across refresh — intentional).

**Components:** `Modal`, `Form`, `FormField`, `Select`, `TextInput`, `Button`, `ProgressBar` (step indicator)

---

## 13. Navigation Context Switching

**Portfolio → Project:** User selects a project in the Project Menu dropdown. Sets `LevelContext` to `'project'` with selected project ID. Drawer nav content switches to project-level tools.

**Project → Portfolio:** User deselects project (or clicks Procore logo). Sets `LevelContext` to `'portfolio'`. Navigates to Portfolio Hub.

```tsx
// /src/context/LevelContext.tsx
interface LevelContextValue {
  level: 'portfolio' | 'project';
  activeProjectId: string | null;
  setProject: (projectId: string) => void;
  clearProject: () => void;
}
```

---

## 14. Hierarchy — Current State & Future Direction

### Current State
The app has a flat two-level structure: Portfolio → Project. There is no Program level in the product today.

```
Company
└── Portfolio
    └── Project (has a "program" attribute for grouping)
        └── Tool
            └── Item
```

**Program** is currently a **project attribute** — a metadata field used to group or filter projects in list views and hub cards. It is not a navigation level and does not have its own page or context.

Seed data should include a `program` field on projects (e.g. "Infrastructure", "Commercial", "Residential") so filtering and grouping by program works in the `ProjectListCard` and hub filter bar.

### Future Direction
A flexible project hierarchy is planned to allow companies to organize their portfolio in custom ways (programs, regions, business units, etc.). This is not being built now. When it arrives, it will likely introduce new navigation levels and page types.

**For the prototype:** Do not scaffold hierarchy levels beyond Portfolio → Project. Do not add `programId` relational lookups or program-level pages. Keep `program` as a simple string attribute on the `Project` type.

---

## 15. Design System Rules

> Always load `core-react/SKILL.md` and `procore-ds-guidelines/SKILL.md` for full rules.

**Hard rules — never violate:**
- Never use raw HTML where a `@procore/core-react` component exists
- Never use deprecated props (`iconRight`, `tertiaryContrast`, `lg` size on Button, `active` on Tabs.Tab)
- Never violate button ordering (header: Primary leftmost; modal/footer: Primary rightmost)
- Never skip accessibility (`aria-labelledby` on modals, `aria-label` on icon-only buttons, labels on all fields)
- Always use `colors.*`, `spacing.*`, `borderRadius.*` tokens — never hardcode values
- Never use inline SVGs for icons — import from `@procore/core-icons`
- One Primary button per context (page, modal, form)
- `PageHeader` / `ToolHeader` is mandatory on every page

**Hub card specific:**
- All colors use CSS variables — never hardcode hex values
- Never create new card component files — always use existing `HubCard` system
- Card widths must be one of `[4, 6, 8, 12]` columns
- Always pass `isEditMode`, `currentWidth`, `onManualResize` to every card in `renderCardContent()`

---

## 16. Quality Gates

Run before marking any feature complete:

- [ ] Renders without console errors
- [ ] `@procore/core-react` components used — no raw HTML where DS equivalent exists
- [ ] Persona switching updates data, permissions, and card visibility correctly
- [ ] Tearsheet opens and closes correctly from at least 2 card types
- [ ] Create flow completes and new project appears in list
- [ ] At least one settings toggle drives hub card visibility
- [ ] `npm run build` passes with zero errors
- [ ] Master implementation checklist from `procore-ds-guidelines/SKILL.md` passes

---

## 17. Execution Order (First Build)

1. Fix Vercel / npm build issue (`@procore/smart-grid-cells` module resolution)
2. Scaffold project structure and routing
3. Set up seed data files and TypeScript interfaces
4. Set up `PersonaContext` and `LevelContext` providers
5. Build global nav + persona switcher
6. Build sliding drawer nav (Portfolio + Project variants)
7. Build Hub shell — `ToolLandingPage` outer shell + `Tabs` + GridStack grid
8. Build `ProjectListCard` (most complex — do early)
9. Build `TearsheetManager` + first 2 tearsheet content types
10. Build remaining Portfolio Hub cards
11. Build Create flow (multi-step modal)
12. Build Project Overview (hub with project-scoped cards)
13. Build Tool List shell (one working tool, rest as stubs)
14. Build Detail page (one working detail, rest as stubs)
15. Build Settings shell + connect at least one toggle to hub card visibility
16. Wire persona permissions to all data + UI rendering
17. Final build check + Vercel deploy test
18. Write `README.md`

---

## 18. Out of Scope (For Now)

- Real API integration
- Authentication (persona switcher replaces this)
- Full tool buildout (shells + seed data only for most tools)
- Mobile responsiveness (desktop first)
- Full settings experience (key flows only)
- Program-level rendering (data model scaffolded, UI deferred)

---

## 19. File Structure

```
/src
  /components
    /hub
      /cards              ← Individual hub card components
      TearsheetManager    ← Single shared tearsheet instance
    /nav
      GlobalNav           ← Top nav bar
      DrawerNav           ← Sliding drawer (Portfolio + Project variants)
      PersonaSwitcher     ← Dev-tool style persona switcher
    /create               ← Create flow modal (multi-step)
  /pages
    /portfolio            ← Portfolio Hub
    /project              ← Project Overview + tool shells
    /settings             ← Settings shell
  /data
    /seed                 ← All seed data files
  /context
    PersonaContext        ← Active persona + permissions
    LevelContext          ← Portfolio vs. Project level + active project
  /config
    hubCards.ts           ← Card registry (key → component + default position)
```
