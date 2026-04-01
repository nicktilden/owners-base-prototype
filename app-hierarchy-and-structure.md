# App Hierarchy & Structure Reference

> This document defines the navigation hierarchy, page types, layout anatomy, and component inventory of the existing app. It is intended to (1) document the current system accurately and (2) serve as authoritative context for Claude Code when building or extending the owner prototype.

---

## 1. Application Levels

The app operates across two distinct levels. Everything — navigation, tools, data scope — is contextual to which level the user is at.

| Level | Description |
|---|---|
| **Portfolio** | Company-wide view. Aggregates data across all projects. No single project is "selected." |
| **Project** | Single project context. Tools show data scoped to that project only. |

There is also a third top-level area:

| Level | Description |
|---|---|
| **Settings** | Company-level configuration. Exists outside the main nav hierarchy entirely. |

---

## 2. Global Navigation (Always Present)

The global nav bar is persistent across all levels and page types. Left to right:

| Element | Component | Behavior |
|---|---|---|
| **Menu Button** | Icon button | Opens the sliding drawer nav (contextual to level) |
| **Procore Logo** | Logo / link | Navigates to home (Portfolio Hub) |
| **Project Menu** | Dropdown / selector | Shows account name + current project. Allows quick project switching. At Portfolio level, no project is selected. |
| **Search Bar** | AI-powered search input | Global search across all data types |
| **App Menu** | Icon button | Opens 3rd party app integrations |
| **Help** | Icon button | Opens help popover |
| **Open Items** | Icon button | Opens open items popover |
| **Notifications** | Icon button | Opens notifications popover |
| **User Avatar** | Icon button | Opens profile menu |
| **Company Logo** | Image button | Opens profile menu (same as avatar) |

### Implementation Notes
- Help, Open Items, and Notifications all open **popovers** (not new pages)
- User Avatar and Company Logo share the same profile menu — two entry points, one component
- The Project Menu is the primary level-switching mechanism for moving between projects
- Navigating to Portfolio level = deselecting the current project in the Project Menu

---

## 3. Sliding Drawer Navigation

Triggered by the Menu Button. Content is **contextual to the current level**.

### Structure
- Flat alphabetical list of **Tools**
- No grouping or categories
- Tools at Portfolio level aggregate cross-project data
- Tools at Project level are scoped to the selected project
- Some tools exist at both levels (same tool, different data scope)
- Some tools are unique to one level only

### Tool Definition
A Tool is a self-contained data set and workflow for a specific construction domain. Examples:
- Drawings, Documents, RFIs, Submittals (Field)
- Budget, Invoicing, Cost Management (Finance)
- Schedule, Milestones (Time)
- Directory, Permissions (Admin)

At the **Portfolio level**, tools focus on aggregation, KPIs, and cross-project insights.
At the **Project level**, tools are where objects are created and managed day-to-day.

---

## 4. Information Architecture

```
App Root
├── Portfolio Level
│   ├── Portfolio Hub (Home)              ← Hub page type
│   │   ├── Tab 1 (e.g. Portfolio)
│   │   ├── Tab 2 (e.g. Cost Management)
│   │   └── Tab N...
│   └── Portfolio Tools (drawer nav)      ← Tool List page type
│       ├── [Tool Name]                   ← Tool List
│       │   └── [Item Detail]             ← Detail page type
│       └── ...
│
├── Project Level
│   ├── Project Overview (Home)           ← Hub page type (same structure as Portfolio Hub)
│   │   ├── Tab 1 (e.g. Overview)
│   │   ├── Tab 2 (e.g. Cost)
│   │   └── Tab N...
│   └── Project Tools (drawer nav)        ← Tool List page type
│       ├── [Tool Name]                   ← Tool List
│       │   └── [Item Detail]             ← Detail page type
│       └── ...
│
└── Settings (top-level, outside main nav)
    └── [Settings Section]                ← Settings page type
        └── [Settings Detail / Form]
```

---

## 5. Page Types

There are **4 distinct page types** in the system. Every page in the app is one of these.

---

### Page Type 1: Hub

**Used for:** Portfolio Hub, Project Overview

**Purpose:** A configurable dashboard that gives users a high-level, actionable summary of data across projects or within a single project. Focused on timely, prioritized data, KPIs, and insights. Designed for drill-down and in-context action without navigating away.

**Layout Anatomy:**
```
┌─────────────────────────────────────────────────┐
│ PageHeader                                      │
│  - Page/Hub name                                │
│  - Action buttons (e.g. + Add Card, Edit View)  │
│  - Tab bar (one tab per hub view)               │
├─────────────────────────────────────────────────┤
│ Page-Level Filter Bar                           │
│  - Filter by: Program, Region, Status, Stage,   │
│    Project Type, and other project attributes   │
│  - Applies across all cards on the active tab   │
├─────────────────────────────────────────────────┤
│ Hub Grid                                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │  Card    │ │  Card    │ │  Card    │        │
│  └──────────┘ └──────────┘ └──────────┘        │
│  ┌─────────────────────┐ ┌──────────┐          │
│  │  Card (wide)        │ │  Card    │          │
│  └─────────────────────┘ └──────────┘          │
└─────────────────────────────────────────────────┘
```

**Hub Grid Rules:**
- Flexible grid layout (configurable column/row spans per card)
- Cards are independently collapsible
- Grid layout is user/admin configurable

**Tab Rules:**
- Each tab = a distinct hub view with its own card configuration
- Tabs are defined by admins as defaults; users with permissions can create personal views
- Default tabs are set by audience type (e.g. Owner, GC, Sub)

**Permission Model for Customization:**

| Role | Can Do |
|---|---|| Company Admin | Define default tabs + cards for all users |
| Team Admin | Customize for their team |
| Power User | Create personal views, add/remove cards |
| Standard User | View only; uses admin-defined defaults |

**Card Anatomy:**
```
┌─────────────────────────────────────────┐
│ Card Header                             │
│  - Title                                │
│  - Subtitle / context                   │
│  - Actions (filter, expand, overflow)   │
├─────────────────────────────────────────┤
│ Card Body                               │
│  - Data visualization or list           │
│  - KPI metrics, charts, tables          │
├─────────────────────────────────────────┤
│ Card Footer (optional)                  │
│  - "View all" link or summary count     │
└─────────────────────────────────────────┘
```

**Card Interaction Pattern:**
- Clicking a row or data point → opens **Tearsheet** (slide-in side panel)
- Tearsheet allows: viewing detail, taking action, or navigating to full Tool page
- No full-page navigation triggered from card interactions (except explicit "Go to Project / Tool" CTA)

**Procore Components to Use:**
- `Card` — card container
- `Tabs` — hub tab bar
- `Button`, `IconButton` — actions
- `Filters` / `FilterGroup` — page-level filter bar
- `Grid` / layout primitives — hub grid

---

### Page Type 2: Tool List

**Used for:** All tools at Portfolio and Project level (e.g. Budget, RFIs, Documents)

**Purpose:** A comprehensive, filterable, sortable list of all items within a tool's data set. Primary entry point for finding, managing, and acting on individual records.

**Layout Anatomy:**
```
┌─────────────────────────────────────────────────┐
│ PageHeader                                      │
│  - Tool name                                    │
│  - Primary action button (e.g. + Create RFI)   │
│  - Optional tabs (sub-views within the tool)    │
├─────────────────────────────────────────────────┤
│ Toolbar                                         │
│  - Search, filters, column config, bulk actions │
├─────────────────────────────────────────────────┤
│ DataTable                                       │
│  - Rows = individual items                      │
│  - Columns = key attributes                     │
│  - Supports: sort, filter, group, bulk select   │
│  - Row click → navigates to Detail page         │
└─────────────────────────────────────────────────┘
```

**Procore Components to Use:**
- `DataTable` or `SmartGrid` — primary list component
- `PageHeader` — consistent header with title + actions
- `Tabs` — if tool has sub-views
- `Button` — create action
- `Toolbar` / `FilterBar` — search and filter controls
- `Checkbox` — bulk selection

---

### Page Type 3: Detail

**Used for:** Individual item view/edit (e.g. a single RFI, Invoice, Drawing)

**Purpose:** Full view of a single record. Allows users to view all attributes, edit fields, take status actions, and see related activity.

**Layout Anatomy:**
```
┌─────────────────────────────────────────────────┐
│ PageHeader                                      │
│  - Item name / ID                               │
│  - Status badge                                 │
│  - Primary actions (Edit, Approve, Close, etc.) │
│  - Optional tabs (Details, Activity, Related)   │
├─────────────────────────────────────────────────┤
│ Detail Body                                     │
│  ┌──────────────────────┐ ┌───────────────────┐ │
│  │ Main Content         │ │ Sidebar           │ │
│  │ - Form fields        │ │ - Key attributes  │ │
│  │ - Rich content       │ │ - Status history  │ │
│  │ - Attachments        │ │ - Related items   │ │
│  └──────────────────────┘ └───────────────────┘ │
├─────────────────────────────────────────────────┤
│ Activity / Comments Feed (optional)             │
└─────────────────────────────────────────────────┘
```

**Navigation:**
- Accessed by clicking a row in a Tool List — full page navigation
- Browser back returns to the Tool List
- Breadcrumb: `Portfolio / [Tool] / [Item Name]` or `[Project] / [Tool] / [Item Name]`

**Procore Components to Use:**
- `PageHeader` — with breadcrumb + status badge
- `Tabs` — detail sub-sections
- `Form`, `FormField`, `Input`, `Select`, `DatePicker` — editable fields
- `Card` — content grouping within the detail body
- `ActivityFeed` — comments and history

---

### Page Type 4: Settings

**Used for:** Company-level configuration, tool configuration

**Purpose:** Administrative configuration of the app, tools, and user experience. Accessed from a separate top-level area outside the main nav.

**Layout Anatomy:**
```
┌──────────────┬──────────────────────────────────┐
│ Settings     │ PageHeader                        │
│ Sidebar Nav  │  - Section name                   │
│              │  - Save / action buttons          │
│ - Section 1  ├──────────────────────────────────┤
│ - Section 2  │ Settings Content                  │
│ - Section 3  │                                   │
│              │  ┌────────────────────────────┐   │
│              │  │ Settings Card              │   │
│              │  │  - Section label           │   │
│              │  │  - Stacked form fields     │   │
│              │  └────────────────────────────┘   │
│              │  ┌────────────────────────────┐   │
│              │  │ Settings Card              │   │
│              │  │  - Stacked form fields     │   │
│              │  └────────────────────────────┘   │
└──────────────┴──────────────────────────────────┘
```

**Settings Categories:**
1. **Company / Org Settings** — company profile, branding, regional defaults
2. **Tool Configuration** — per-tool settings, defaults, custom fields, workflows

**Key Difference from Tool List:**
- No DataTable — content is stacked `Card` components containing forms
- Sidebar nav replaces drawer nav for in-settings wayfinding
- Changes are saved explicitly (Save button), not auto-saved inline

**Procore Components to Use:**
- `PageHeader` — section title + save action
- `Card` — settings grouping container
- `Form`, `FormField`, `Input`, `Select`, `Toggle`, `Checkbox` — form controls
- `SideNav` or equivalent — settings section navigation

---

## 6. Tearsheet Pattern

The Tearsheet is not a page type — it is a **cross-cutting UI pattern** used on Hub pages to enable drill-down and action without leaving the page.

**Behavior:**
- Slides in from the right, overlaying the page content
- Triggered by clicking a row or data point within a Hub card
- Can contain: item detail, key attributes, action buttons, status controls
- Always includes a "Go to [Tool/Project]" CTA for full-page navigation when needed
- Dismissible via close button or clicking outside

**Tearsheet Anatomy:**
```
┌───────────────────────────────┐
│ Tearsheet Header              │
│  - Item name / title          │
│  - Status badge               │
│  - Close button               │
├───────────────────────────────┤
│ Tearsheet Body                │
│  - Key attributes             │
│  - Summary data               │
│  - Inline actions             │
├───────────────────────────────┤
│ Tearsheet Footer              │
│  - "Go to [Tool]" CTA         │
│  - Primary action button      │
└───────────────────────────────┘
```

**Procore Components to Use:**
- `Tearsheet` (if available in component library)
- `Sheet` / `Drawer` as fallback
- `Button` — actions + CTA

---

## 7. Design System Rules

All components must be sourced from the Procore component library (`@procore/core-react`) imported directly via npm. No custom components should be built where a Procore equivalent exists.

### Core Principles
- **Never use raw HTML elements** where a DS component exists (`<button>`, `<input>`, `<table>`, `<select>`, etc.)
- **Use DS tokens** for all spacing, color, and typography — no hardcoded values
- **Follow DS layout primitives** for grid and spacing patterns
- **PageHeader is mandatory** on every page, regardless of type

### Component Priority Reference

| Need | Use |
|---|---|
| Page header with title + actions | `PageHeader` |
| Tabbed navigation | `Tabs` |
| Data list / grid | `DataTable` or `SmartGrid` |
| Dashboard card container | `Card` |
| Slide-in detail panel | `Tearsheet` or `Sheet` |
| Form fields | `Form`, `FormField`, `Input`, `Select`, `DatePicker`, `Toggle` |
| Action buttons | `Button`, `IconButton` |
| Filter controls | `FilterGroup`, `Filter` |
| Status indicators | `Badge`, `Tag` |
| Bulk selection | `Checkbox` |
| Empty states | `EmptyState` |
| Loading states | `Skeleton`, `Spinner` |
| Popovers | `Popover` |
| Notifications / toasts | `Toast`, `Banner` |

---

## 8. Data & Permissions Model

### Hierarchy
```
Company
└── Portfolio
    └── Program (grouping of projects — future-ready, scaffold now)
        └── Project
            └── Tool
                └── Item (e.g. RFI, Invoice, Drawing)
```

### Persona Permission Levels

| Persona | Level | Access |
|---|---|---|
| Company Admin | Company | Full access to all levels, settings, and configuration |
| Portfolio Manager | Portfolio | All projects, all tools, no company settings |
| Project Manager | Project | Assigned projects only, all tools within those projects |
| Finance Lead | Portfolio + Project | Cost/budget tools only across all projects |
| Read-Only / Stakeholder | Portfolio + Project | View only, no create/edit/delete actions |

### Permission Effects on UI
- Cards and tools not accessible to a persona are **hidden**, not disabled
- Action buttons (Create, Edit, Approve) are hidden when user lacks permission
- Project Menu only shows projects the persona has access to
- Hub tabs and cards respect permission scope — finance-only persona sees cost cards only

---

## 9. Summary: Page Type Quick Reference

| Page Type | When Used | Primary Component | Detail Pattern |
|---|---|---|---|
| **Hub** | Portfolio home, Project Overview | Card grid on flexible layout | Tearsheet |
| **Tool List** | Any tool at any level | DataTable / SmartGrid | New page (Detail) |
| **Detail** | Single item view/edit | Form + Card layout | N/A (deepest level) |
| **Settings** | Company + tool config | Stacked Cards + Forms | N/A |

---

## 10. Claude Code Implementation Notes

When building any page or component, Claude Code must:

1. **Check this document first** to identify which page type is being built
2. **Use the layout anatomy** as the structural blueprint
3. **Reference the Procore component list** before creating any custom component
4. **Respect the permission model** — all data-fetching and rendering must be persona-aware
5. **Follow the hub card pattern** for any new card added to a hub view
6. **Register new hub cards** in the central `hubCards.ts` config — never hardcode card layout into a page
7. **Use the Tearsheet** for all drill-down interactions from hub cards — never navigate away from a hub on card click unless explicitly using the "Go to Tool" CTA
8. **Apply PageHeader** to every page without exception

