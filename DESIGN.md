# DESIGN.md — AI Constraint Layer

> This file is a directive constraint layer for AI. It is not documentation for humans. Read it before building any UI, component, or layout in this prototype. Rules are imperative and non-negotiable unless a human explicitly overrides them in the session.

---

## 1. Component Library Rules

**Source of truth:** `@procore/core-react` v12.42.0, installed via npm.

- Always import components from `@procore/core-react` before writing any custom HTML or styled-component.
- Always import icons from `@procore/core-icons`. Never use inline SVG, emoji, or third-party icon libraries.
- Never use raw HTML where a DS equivalent exists. This includes: `<button>`, `<input>`, `<select>`, `<textarea>`, `<table>`, `<a>` (use `Button` or `Link`), `<h1>`–`<h6>` (use `Typography`).
- Before creating any new component, verify the DS has no equivalent by checking `core-react/SKILL.md`. If a close match exists, use it. If it needs minor extension, compose it — do not replace it.
- When a DS component has deprecated props, never use them. Deprecated: `iconRight`, `tertiaryContrast`, `lg` size on `Button`, `active` on `Tabs.Tab`.
- One `Primary` button per context (page, modal, form). Never render two Primary buttons in the same visual scope.
- Button ordering: in page headers, Primary is leftmost. In modals and footer action bars, Primary is rightmost.

**Component quick-reference (need → component):**

| Need | Component |
|---|---|
| Page header with title + actions | `PageHeader` |
| Tabbed navigation | `Tabs` |
| Tool list / data grid | `SmartGridWrapper` (wraps AG Grid Enterprise) |
| Dashboard card container | `HubCardFrame` |
| Slide-in detail panel | `Tearsheet` |
| Form container | `Form` + `FormField` |
| Text input | `Input` (never `<input>`) |
| Dropdown | `Select` (never `<select>`) |
| Toggle/switch | `Switch` or `Toggle` |
| Status indicator | `Badge`, `Pill`, or `Tag` |
| Empty state | `EmptyState` |
| Loading state | `Skeleton` or `Spinner` |
| Popover / tooltip | `Popover`, `Tooltip` |
| Feedback banner | `Banner` or `Toast` |
| Checkbox | `Checkbox` (never `<input type="checkbox">`) |

---

## 2. Design Token Usage

**All colors, spacing, border radii, and shadows must use CSS variables. Never hardcode any value.**

### Token Architecture

Tokens are defined in `src/styles/globals.css` in three layers:

1. **Primitives** — `--p-gray-50`, `--p-orange-50`, `--p-metal-40`, etc. Never reference primitives in component code.
2. **Semantic aliases** — `--color-text-primary`, `--color-surface-card`, `--color-action-primary`, etc. Always use these.
3. **Theme overrides** — applied via `data-theme="owner"` (Metal), `"owner-alt1"` (Slate), `"owner-alt2"` (Metal+Black/Evergreen dark), `"owner-alt3"` (Metal dark). Semantic aliases automatically shift; component code never changes.

### Canonical Semantic Tokens

**Text:**
- `--color-text-primary` — body copy, headings
- `--color-text-secondary` — labels, captions, supporting copy
- `--color-text-disabled` — disabled state text
- `--color-text-error` — validation errors
- `--color-text-link` — links, interactive text

**Surfaces:**
- `--color-surface-primary` — page background
- `--color-surface-card` — card backgrounds
- `--color-surface-secondary` — read-only fields, subtle backgrounds
- `--color-surface-hover`, `--color-surface-active` — hover and active states

**Actions:**
- `--color-action-primary` — primary button fill (theme-aware, do not hardcode `#FF5200`)
- `--color-brand` — brand accent color

**Borders:**
- `--color-border-default` — default input/card borders
- `--color-border-separator` — dividers
- `--color-border-focus` — focus rings
- `--color-border-alert` — error states
- `--color-card-border` — card borders (transparent in default theme)

**Status (always reference by name, not hex):**
- Success: `--p-green-50` via semantic wrapper where available
- Error: `--color-text-error`
- Warning: `--p-yellow-50` via semantic wrapper where available
- Info: `--color-text-tinted`

**Pills (use the full set):**
- `--color-pill-bg-{green|red|gray|blue|yellow|magenta|cyan}`
- `--color-pill-border-{color}`
- `--color-pill-text-{color}`

**Navigation (internal use only — nav components only):**
- `--color-nav-bg`, `--color-nav-text`, `--color-nav-hover`, `--color-nav-surface`

### Typography

- Always use `<Typography intent="...">` from `@procore/core-react` for all text rendering.
- Never set raw `font-size`, `font-weight`, or `font-family` in component code except inside `HubCardFrame` header (which is locked at `fontSize: 16`, `fontWeight: 600`).
- For card titles: `intent="h3"` + `fontWeight: 600`, `fontSize: 16`, `color: var(--color-text-primary)`.
- For body copy: `intent="body"`.
- For labels/captions: `intent="small"`.

### Spacing

- Use multiples of 4px for all padding, margin, and gap values: `4`, `8`, `12`, `16`, `20`, `24`, `28`, `32`.
- Standard card internal padding: `16px`.
- Standard card header height: `44px`.
- Standard row gap between hub rows: `16px`.

---

## 3. Layout Patterns

There are exactly **4 page types**. Always identify which type before building. Never invent a new page structure.

### Hub (Portfolio Hub, Project Overview)

- Outer shell: use `ToolLandingPage` from `@procore/core-react`.
- Card grid: use `HubsContentLayout` + `HubsContentLayout.Row`. Never build a custom grid container for hub pages.
- `HubsContentLayout.Row` variant `"cards"` auto-grids up to 3 columns; variant `"table"` is single-column, max-height `800px`.
- Use `columnsTemplate` prop on `HubsContentLayout.Row` for asymmetric layouts (e.g. `"2fr 1fr"`).
- Always include a `PageHeader` with hub name, tab bar (`Tabs`), and action buttons.
- Always include a page-level filter bar below the header, before the card grid.

### Tool List

- Use `SmartGridWrapper` (which wraps AG Grid Enterprise) for all tool list tables.
- Always wrap `SmartGridWrapper` in a `HubCardFrame` when rendering inside a hub card.
- When used as a full tool page, use `SmartGridWrapper` directly at page level with `PageHeader` above it.
- All column definitions live in dedicated `*ColumnDefs.ts` files in `src/components/SmartGrid/`. Never inline column definitions in a page component.
- All custom cell renderers live in `src/components/SmartGrid/` as standalone `*CellRenderer.tsx` files.
- Filter panels are standalone components: `*FiltersPanel.tsx`.

### Tearsheet (Item Detail from Hub Cards)

- Every row/item click from a hub card must open a `Tearsheet`. Never navigate to a new page from a hub card item click.
- Use a single shared `Tearsheet` instance per hub page (not per card). Manage open state via a `selectedItem` state object at the hub level.
- Tearsheet always includes: header (item name + status badge + close button), body (key attributes, summary data, inline actions), footer ("Go to [Tool]" CTA + optional primary action).
- Width override pattern (as in `ProjectEditTearsheet`): use `createGlobalStyle` to target `[class*="StyledTearsheetBody"]` — never override tearsheet width via inline style on the component.
- The "Go to Tool" CTA is the only place within a Tearsheet where full-page navigation is acceptable.

### HubCardFrame (all hub cards)

- Always wrap hub card content in `HubCardFrame` from `src/components/hubs/HubCardFrame.tsx`.
- Props: `title` (string | ReactNode), `infoTooltip` (optional description text), `titlePrefix` (optional icon), `titleSuffix` (optional pill/badge), `actions` (optional button group), `controls` (optional tab/filter bar below header).
- Card constraints: `min-height: 200px`, `max-height: 420px`. For table-variant cards, override `max-height` via `style` prop.
- Card body padding: `8px 16px 16px`. Never add additional wrapper padding inside the card body — this causes double-padding.

### Settings

- Sidebar nav replaces drawer nav within settings.
- Content is stacked `Card` components containing forms — never a `DataTable` or `SmartGrid`.
- Every settings card uses explicit Save button. Never auto-save.

---

## 4. Interaction Patterns

### Hub Card Interactions (two affordances only)

1. **Row / item click → Tearsheet.** This is the default. Always.
2. **Card-level "Go to [Tool]" link → full navigation.** Secondary, placed in card `actions` prop or footer only.

Never mix these. A row click must never navigate. A card-level link must never open a Tearsheet.

### States

- **Loading:** Use `Skeleton` for content placeholders while data is pending. Use `Spinner` for inline action feedback. Never use a blank screen or hide the layout.
- **Empty:** Use `EmptyState` from `@procore/core-react`. Include a descriptive message and a primary action where appropriate (e.g. "No projects yet — Create Project").
- **Error:** Use `Banner` with `variant="warning"` or `variant="error"` pinned below the `PageHeader`. Never use a custom error box.
- **Success / confirmation:** Use `Toast` (transient feedback). Never use a custom success banner.

### Form Interactions

- All forms use `Form` + `FormField` from `@procore/core-react`. Never build label/input pairs manually.
- Validation errors attach to `FormField` via `error` prop. Never render error text as freestanding `<p>` or `<span>`.
- Multi-step flows use `Stepper` (or styled step indicator) internal to a `Modal` or `Tearsheet`. Never build a multi-step flow as a series of separate pages.
- Wizard/step state lives in the parent component as `useState<1|2|3>`. Never lift wizard step state to context.

### Permission-Gated UI

- Elements inaccessible to the active persona are **hidden** (`return null`), not disabled.
- Exception: action buttons the user can see but not use (e.g. future-state features) may be rendered `disabled` with a `Tooltip` explaining why.
- Always check permissions via utility functions in `src/utils/permissions.ts`: `canAccessTool(user, toolKey)`, `hasToolPermission(user, toolKey, level)`, `hasPermissionKey(user, key)`. Never hard-code role comparisons inline.

### Navigation

- Portfolio → Project: user selects project in Project Menu. Updates `LevelContext`.
- Project → Portfolio: user deselects project or clicks Procore logo.
- Never use `window.location.href` for internal navigation. Always use Next.js `<Link>` or `router.push()`.
- Project name links in tables navigate to `/project/[id]`.

---

## 5. Naming Conventions

**Always use domain-model names from the type system. Never invent synonyms.**

| Domain Concept | Canonical Name | Source |
|---|---|---|
| A construction project | `Project` | `src/types/project.ts` |
| Project identifier | `ProjectNumber` (e.g. `"NE1001"`) | `src/types/project.ts` |
| Project lifecycle state | `ProjectStatus` (active / inactive / on_hold / cancelled) | `src/types/project.ts` |
| Project phase | `ProjectStage` (11 values: conceptual → maintenance) | `src/types/project.ts` |
| Project classification | `ProjectSector` (80+ tiered path strings e.g. `"Residential > Multifamily"`) | `src/types/project.ts` |
| A tool (Budget, RFIs, etc.) | `ToolKey` | `src/types/tools.ts` |
| Tool availability | `ToolLevel` (portfolio / project / both / global) | `src/types/tools.ts` |
| User job title | `UserRole` (17-value union: CEO, CFO, Superintendent, etc.) | `src/types/user.ts` |
| Permission tier | `ToolPermissionLevel` (none / read / update / create / admin) | `src/types/permissions.ts` |
| WBS classification | `WBSItem`, `WBSCostCode`, `WBSCostType`, `WBSProgram` | `src/types/shared.ts` |
| Budget composite key | `{program.code}.{costType.code}{costCode.code}` | `data-model.ts` |
| Hub page entity | `Hub` → `HubTab[]` → `HubCard[]` | `src/types/hubs.ts` |
| Connection to GC | `ProjectConnection` | `src/data/procoreConnect.ts` |

**File naming:**
- Hub card components: `[DescriptiveName]Card.tsx` or `[DescriptiveName]HubCards.tsx`
- Cell renderers: `[DescriptiveName]CellRenderer.tsx`
- Column definitions: `[toolName]ColumnDefs.ts`
- Filter panels: `[ToolName]FiltersPanel.tsx`
- Seed data files: match the entity name in snake_case (e.g. `action_plans.ts`)

**`program` is always `null` on `Project`.** Do not use it as a grouping attribute. WBS `WBSProgram` is a financial classification — a different concept entirely.

---

## 6. Prohibited Patterns

### Colors
- Never use raw hex values in component code. `#FF5200`, `#566578`, `#232729` — none of these. Use `var(--color-*)` tokens.
- Never use raw hex in `SmartGridWrapper` theme params — those are already locked in `SmartGridWrapper.tsx` and must not be duplicated.
- Never import `colors` or `theme` from `@procore/core-react` for use in CSS. Use CSS variables only.

### Layout
- Never create a new grid container system. Use `HubsContentLayout` + `HubsContentLayout.Row` for hub grids.
- Never build a custom card shell. Use `HubCardFrame` for all hub cards.
- Never wrap `HubCardFrame` in an outer `<div>` with additional padding or margin. The frame handles its own spacing.
- Never use CSS `position: absolute` or `position: fixed` for card layout. Only use it for truly overlaid elements (tooltips, dropdowns).
- Never build a custom sidebar or drawer nav. Use the existing `NavDrawer` component.
- Never create a custom modal shell. Use `Modal` or `Tearsheet` from `@procore/core-react`.

### Icons
- Never use inline `<svg>` or `<img>` for icons. Always import from `@procore/core-icons`.
- Never use emoji as UI icons.

### State and Logic
- Never fetch data from an API. All data comes from seed files in `src/data/seed/`. Use React Context to access it.
- Never store computed budget columns (revisedBudget, projectedBudget, etc.) in seed data. These are runtime-calculated only.
- Never import `PROJECT_CONNECTIONS` directly. Always use `useConnection()` from `src/context/ConnectionContext.tsx`.

### Accessibility
- Never render an icon-only button without an `aria-label`.
- Never render a `Modal` or `Tearsheet` without an `aria-labelledby` pointing to the heading.
- Never render a form field without a `<label>` (use `FormField` — it handles this).

### Data Model
- Never add `programId` or program-level pages. Program is not a navigation level.
- Never redefine types that already exist in `src/types/`. Import them.
- Never add calculated budget columns to `BudgetLineItem` seed data.
- Never put project membership on `Project`. Membership is derived from `User.projectIds`.

---

## 7. When to Ask

Stop and flag to the human before proceeding if any of the following is true:

1. **A needed UI pattern doesn't exist in this codebase.** Examples: a rating control, a multi-select tag input, a timeline Gantt view. Do not invent a custom solution — ask what pattern to follow.

2. **A new page type would be required.** If the feature doesn't fit Hub, Tool List, Detail, or Settings, flag it. Do not create a fifth page type.

3. **A new hub tab or hub card needs to be added.** Confirm the card's column width (4/6/8/12), which hub it belongs to, and what tab it should appear on before building.

4. **A DS component is missing or ambiguous.** If `core-react/SKILL.md` doesn't document a component for the need, ask before creating a custom alternative.

5. **A permission rule is unclear.** If it's not obvious whether an element should be hidden for a given `UserRole`, ask rather than guessing.

6. **Seed data would need a new entity type.** Adding a new TypeScript interface that doesn't exist in `src/types/` requires human sign-off.

7. **The feature requires a backend or API call.** This prototype is seed-data only. Any request that implies persistence, real-time data, or user accounts is out of scope — flag it.

8. **A layout needs more than 3 columns in a `HubsContentLayout.Row`.** The grid supports up to 3 equal columns. Flag asymmetric layouts so the `columnsTemplate` can be explicitly approved.

---

## Quick Checklist (run before marking any UI work done)

- [ ] No raw hex values in any component file
- [ ] No raw HTML elements where a DS component exists
- [ ] All icons imported from `@procore/core-icons`
- [ ] All hub cards wrapped in `HubCardFrame`
- [ ] Hub card row/item clicks open a `Tearsheet`, not a new page
- [ ] `PageHeader` present on every page
- [ ] Permission checks use `canAccessTool` / `hasToolPermission` / `hasPermissionKey`
- [ ] TypeScript types imported from `src/types/`, not redefined
- [ ] No API calls — all data from seed files via Context
- [ ] `npm run build` passes with zero errors
