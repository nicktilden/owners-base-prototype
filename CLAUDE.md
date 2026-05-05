# CLAUDE.md — Owner Prototype

> Read this file at the start of every session. It is the authoritative quick-reference for Claude Code in this repo. For full context, also read `CONTEXT.md` and `DESIGN.md`.

---

## What This Project Is

A **seed-data-driven React prototype** representing the Owner experience on a Procore-based construction management platform. It is a living scaffold — not a one-off demo — used as the foundation for all owner-facing prototype work.

- No backend, no API calls. All data is static TypeScript seed files.
- Persona-switchable: the active user drives permissions, visible tools, and data scope.
- Design system compliant: `@procore/core-react` v12.45.0 (installed via npm), `@procore/core-icons`.
- Deployable to Vercel.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (Pages Router) |
| Language | TypeScript 5 (strict mode) |
| UI Library | `@procore/core-react` ^12.45.0 |
| Icons | `@procore/core-icons` ^12.15.0 |
| Styling | `styled-components` v6 + CSS custom properties (token system in `globals.css`) |
| Data Grid | AG Grid Enterprise v35 (via `SmartGridWrapper`) |
| Maps | `@react-google-maps/api` |
| Forms | `formik` |
| i18n | `@procore/globalization-toolkit` |
| Path alias | `@/` → `src/` |

**Dev commands:**
```bash
npm run dev      # Next.js dev server (webpack mode)
npm run build    # Production build
npm run lint     # ESLint
```

---

## Directory Structure

```
src/
  components/
    hubs/               # HubCardFrame, HubsContentLayout, ActionPanel, ActionRail
    nav/                # GlobalHeader, NavDrawer, AppLayout, ProjectPickerPopover, etc.
    SmartGrid/          # SmartGridWrapper + all *ColumnDefs.ts + *CellRenderer.tsx + *FiltersPanel.tsx
    tools/              # One *Content.tsx per tool (Budget, RFIs, Assets, etc.)
    health/             # Health & Risk cards and components
    settings/           # Settings page content components
    skeletons/          # Skeleton loading placeholders
    table/              # TableActions helper
  context/
    DataContext.tsx      # Holds all seed data; useData() hook
    PersonaContext.tsx   # Active user; usePersona() hook
    LevelContext.tsx     # portfolio | project level + activeProjectId; useLevel() hook
    ThemeContext.tsx     # Theme switching (owner / owner-alt1 / owner-alt2 / owner-alt3)
    AiPanelContext.tsx   # AI chat panel visibility
    ConnectionContext.tsx # Procore Connect (GC project links); useConnection() hook
    HubLoadingContext.tsx # Hub card loading state coordination
  data/
    seed/               # All seed data files (account, users, projects, budget, etc.)
    procoreConnect.ts   # PROJECT_CONNECTIONS — access via useConnection(), never directly
    projects.ts         # Legacy project helpers
    openitems.ts        # Open items data
  pages/
    index.tsx           # Redirects → /portfolio
    portfolio/
      index.tsx         # Portfolio Hub (HomeContent)
      [tool].tsx        # Portfolio-level tool pages
      health.tsx        # Portfolio Health & Risk
    project/[id]/
      index.tsx         # Redirects → /project/[id]/overview
      overview.tsx      # Project Overview Hub
      [tool].tsx        # Project-level tool pages
    settings/
      index.tsx         # Settings landing
      health-risk.tsx   # Health & Risk settings
  types/                # All TypeScript types (never redefine — always import)
  utils/
    permissions.ts      # canAccessTool, hasToolPermission, hasPermissionKey
    healthEngine.ts     # Health score computation
    heatmapColors.ts    # Schedule heatmap color utilities
    normalization.ts    # Data normalization helpers
    date.ts             # Date utilities
    actions.ts          # Action item helpers
    projectFavorites.ts # Project favorites (localStorage)
  styles/
    globals.css         # Full token system: primitives → semantic aliases → theme overrides
  constants/
    themeDisplay.ts     # Theme display name mapping
  images/
    proj-001.png … proj-020.png  # Project photo assets
    projectImages.ts             # Image import map
```

---

## Application Levels

| Level | Description | Entry Page |
|---|---|---|
| **Portfolio** | Company-wide; aggregates all projects | `/portfolio` |
| **Project** | Single project context; scoped to one project | `/project/[id]/overview` |
| **Settings** | Company config; outside main nav | `/settings` |

Level state is managed by `LevelContext`. Switching projects calls `setProject(id)`. Returning to portfolio calls `clearProject()`.

---

## Page Types (4 total — never invent a 5th)

| Type | Used For | Outer Shell |
|---|---|---|
| **Hub** | Portfolio Hub, Project Overview | `HubsContentLayout` + `HubCardFrame` cards |
| **Tool List** | All tool pages | `SmartGridWrapper` (AG Grid) inside `ToolPageLayout` |
| **Detail** | Individual item view/edit | `DetailPage` shell + form layout |
| **Settings** | Config pages | Stacked `Card` components + sidebar nav |

Every page **must** have a `PageHeader`. Hub pages use `HubsContentLayout.Row`. Tool list pages use `SmartGridWrapper` directly at page level.

---

## Hub Card System

All hub cards are built using `HubCardFrame` (`src/components/hubs/HubCardFrame.tsx`). Never build a custom card shell.

```tsx
<HubCardFrame
  title="Card Title"
  infoTooltip="Optional description"     // optional
  titlePrefix={<Icon />}                  // optional
  titleSuffix={<Pill>badge</Pill>}        // optional
  actions={<Button>...</Button>}          // optional
  controls={<Tabs>...</Tabs>}             // optional
  style={{ maxHeight: 600 }}              // optional override
>
  {/* card body */}
</HubCardFrame>
```

Hub layout uses `HubsContentLayout` + `HubsContentLayout.Row`:
- `variant="cards"` — auto-grids up to 3 equal columns
- `variant="table"` — single-column, max-height 800px
- Use `columnsTemplate` prop for asymmetric layouts (`"2fr 1fr"`)

**Card interaction rule:** Row/item clicks → `Tearsheet`. Card-level "Go to Tool" link → full navigation. Never mix these.

---

## Context Providers (loading order in AppProviders)

```
ThemeProvider
  DataProvider          ← useData() → all seed data
    PersonaProvider     ← usePersona() → activeUser, setActiveUser
      LevelProvider     ← useLevel() → level, activeProjectId
        ConnectionProvider ← useConnection() → Procore Connect data
          AiPanelProvider
            HubLoadingProvider
              SeedLoader (loads seed data into contexts on mount)
```

Seed data is loaded **once** in `SeedLoader` via `useEffect`. All components consume via hooks.

---

## Seed Data Files

All in `src/data/seed/`. Never add computed columns to seed data — compute at runtime.

| File | Contents |
|---|---|
| `account.ts` | 1 Account + 1 Office |
| `activeUser.ts` | Default active user on app load |
| `users.ts` | All User records (CEO, PM, CFO, Board, IT Admin, Superintendent, etc.) |
| `projects.ts` | Project records (20 projects across regions/stages/sectors) |
| `wbs.ts` | WBSItem records (Cost Codes, Cost Types, WBS Programs) |
| `hubs.ts` | Hub instances with tabs + card configs |
| `budget.ts` | BudgetLineItem records per project (source columns only) |
| `schedule.ts` | ScheduleEntry + Milestone records |
| `tasks.ts` | Task records |
| `documents.ts` | Document records |
| `assets.ts` | Asset records |
| `action_plans.ts` | ActionPlan + Section + Item records |
| `action_plan_types.ts` | Action plan type definitions |
| `rfis.ts` | RFI records |
| `specifications.ts` | Specification divisions |
| `risks.ts` | Risk records (for Health & Risk) |
| `riskTypes.ts` | Risk type definitions |
| `observations.ts`, `punch_list.ts`, `submittals.ts`, `correspondence.ts`, `commitments.ts`, `change_events.ts`, `change_orders.ts`, `invoicing.ts`, `prime_contracts.ts`, `bidding.ts`, `funding_source.ts`, `capital_planning.ts` | Domain-specific data |

---

## Persona & Permissions

Active persona is set via the persona switcher in the global nav. Switching updates:
- Visible projects (filtered by `user.projectIds`)
- Visible tools in nav (via `canAccessTool(user, tool)`)
- Action buttons (via `hasToolPermission(user, tool, 'create')`)
- Hub card visibility

**Permission utilities** — always use these, never hard-code role comparisons:
```ts
import { canAccessTool, hasToolPermission, hasPermissionKey } from '@/utils/permissions';

canAccessTool(user, 'budget')              // show/hide tool in nav
hasToolPermission(user, 'budget', 'create') // show/hide Create button
hasPermissionKey(user, 'projects:create')   // non-tool permission check
```

Permission resolution order: `toolDefaults` → `toolGranted` (override) → `toolDenied` (block).

Hidden elements return `null`, not disabled — except future-state features which may be `disabled` with a `Tooltip`.

---

## SmartGrid (AG Grid Enterprise)

All tool list tables use `SmartGridWrapper` from `src/components/SmartGrid/`.

Conventions:
- Column definitions → `src/components/SmartGrid/*ColumnDefs.ts` (never inline)
- Custom cell renderers → `src/components/SmartGrid/*CellRenderer.tsx`
- Filter panels → `src/components/SmartGrid/*FiltersPanel.tsx`
- When inside a hub card → wrap `SmartGridWrapper` in `HubCardFrame`
- When on a full tool page → use `SmartGridWrapper` at page level with `PageHeader` above

---

## Tearsheet Pattern

Used for item-level drill-down from hub cards. Use a single shared tearsheet instance per hub page — not one per card.

```tsx
const [selectedItem, setSelectedItem] = useState<{ type: string; id: string } | null>(null);

// In card: onRowClick → setSelectedItem({ type: 'rfi', id: rfi.id })
// Tearsheet: reads selectedItem, renders detail, close → setSelectedItem(null)
```

Tearsheet width override (when needed):
```tsx
const TearsheetWidthOverride = createGlobalStyle`
  [class*="StyledTearsheetBody"] { width: 680px !important; }
`;
```

---

## Design Token System

Three-layer architecture in `src/styles/globals.css`:

1. **Primitives** — `--p-gray-50`, `--p-metal-50`, `--p-orange-50` etc. — **never reference in components**
2. **Semantic aliases** — `--color-text-primary`, `--color-surface-card`, `--color-action-primary` etc. — **always use these**
3. **Theme overrides** — set via `data-theme` on `<html>`:
   - *(none)* = Procore standard (orange)
   - `owner` = Metal (owners default)
   - `owner-alt1` = Slate
   - `owner-alt2` = Metal + black / Evergreen dark
   - `owner-alt3` = Metal dark

All hub card colors must use CSS variables. Never hardcode hex values in component code.

---

## Design System Rules (Hard Rules)

- Never use raw HTML where a `@procore/core-react` component exists (`<button>`, `<input>`, `<select>`, `<table>`, `<a>`, `<h1>`–`<h6>`)
- Never use deprecated props: `iconRight`, `tertiaryContrast`, `lg` size on Button, `active` on Tabs.Tab
- Button ordering: page headers → Primary leftmost; modals/footer → Primary rightmost
- One Primary button per context (page, modal, form)
- All icons → `@procore/core-icons`. Never inline SVG, emoji, or third-party icons.
- All text → `<Typography intent="...">`. Never set raw `font-size`/`font-weight` in component code
- Spacing: multiples of 4px (`4, 8, 12, 16, 20, 24, 28, 32`)
- Accessibility: `aria-label` on icon-only buttons; `aria-labelledby` on Modal/Tearsheet; labels on all form fields (use `FormField`)
- Never call an external API. All data from seed files via Context.
- Never store computed budget columns in seed data.
- `project.program` is always `null` — it is not a navigation level.
- Never import `PROJECT_CONNECTIONS` directly — use `useConnection()` from `ConnectionContext`.
- Internal navigation: always use Next.js `<Link>` or `router.push()`. Never `window.location.href`.

---

## Routing Conventions

- `/` → redirects to `/portfolio`
- `/portfolio` → Portfolio Hub (`HomeContent`)
- `/portfolio/[tool]` → Portfolio-level tool page
- `/portfolio/health` → Portfolio Health & Risk
- `/project/[id]` → redirects to `/project/[id]/overview`
- `/project/[id]/overview` → Project Overview Hub
- `/project/[id]/[tool]` → Project tool page (tool key uses `_` separator, URL uses `-`)
- `/settings` → Settings landing
- `/settings/health-risk` → Health & Risk settings

URL → toolKey conversion: `tool.replace(/-/g, '_')`

---

## Key Type Files

Always import from `src/types/` — never redefine.

| Type File | Key Types |
|---|---|
| `project.ts` | `Project`, `ProjectStatus`, `ProjectStage`, `ProjectSector`, `ProjectRegion`, `ProjectPriority`, `DeliveryMethod`, `ProjectType` |
| `user.ts` | `User`, `UserRole`, `UserPermissions` |
| `permissions.ts` | `ToolPermissionLevel`, `PermissionKey`, `UserToolPermissions`, role permission maps |
| `tools.ts` | `ToolKey`, `ToolLevel`, `TOOL_DISPLAY_NAMES`, `TOOL_LEVEL_MAP` |
| `hubs.ts` | `Hub`, `HubTab`, `HubCard` |
| `budget.ts` | `BudgetLineItem` |
| `schedule.ts` | `ScheduleEntry` |
| `health.ts` | `HealthSnapshot`, `Risk`, health-related types |
| `shared.ts` | `WBSItem`, `USState`, and other shared types |

---

## Skills to Load

These skills exist in the environment and must be loaded before doing related work:

| Skill | When to Load |
|---|---|
| `core-react` | Any time building, auditing, or looking up a UI component |
| `procore-ds-guidelines` | Before building any page or running a quality gate |
| `create-hub-card` | Any time building or modifying a hub card |
| `populate-seed-data` | When initializing, resetting, or repopulating seed data |

---

## Quality Checklist (run before marking any feature done)

- [ ] `npm run build` passes with zero errors
- [ ] No raw hex values in component files
- [ ] No raw HTML where a DS component exists
- [ ] All icons imported from `@procore/core-icons`
- [ ] All hub cards wrapped in `HubCardFrame`
- [ ] Hub card row/item clicks → Tearsheet (not new page)
- [ ] `PageHeader` present on every page
- [ ] Permission checks use utility functions, not inline role comparisons
- [ ] TypeScript types imported from `src/types/`, not redefined
- [ ] No API calls — all data from seed files via Context
- [ ] Persona switching updates data, permissions, and card visibility correctly
