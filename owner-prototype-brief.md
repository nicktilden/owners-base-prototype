# Owner Experience Prototype — Claude Code Brief

## Project Overview

Build a reusable, seed-data-driven React prototype that represents the **baseline Owner experience** for a construction management platform. This prototype is not a one-off — it is a **living scaffold** that every future owner-facing prototype starts from. It must be flexible, design-system-compliant, deployable, and persona-switchable.

---

## Tech Stack & Constraints

- **Framework:** React (Vite or Next.js — confirm with team)
- **Design System:** Procore component library (`@procore/core-react` or equivalent internal package)
- **Styling:** Design system tokens only — no custom CSS that conflicts with the system
- **Data:** Seed data only (no backend, no API calls) — all data lives in `/src/data/seed/`
- **Deployment:** Must be deployable to Vercel (resolve any module resolution errors before scaffolding)
- **State Management:** React Context or lightweight store (Zustand) for persona switching and shared state
- **Routing:** React Router v6

---

## Application Structure

```
/src
  /components
    /hub
      /cards          ← Individual hub card components
    /nav              ← Global + project-level nav
    /tearsheet        ← Tearsheet / detail panel component
    /create           ← Create flow / concept flow modal
  /pages
    /home             ← Homepage hub (tabbed)
    /project          ← Project-level overview + tools shell
    /settings         ← Company-level settings
  /data
    /seed             ← All seed data (projects, items, personas, settings)
  /context
    PersonaContext    ← Active user/persona switcher
  /design-system      ← Re-exports or wrappers around Procore components
```

---

## Feature Scope

### 1. Homepage Hub (Tabbed)

Three tabs, each composed of cards:

**Tab 1 — Portfolio**
- `ProjectListCard` — Full-featured project list with:
  - Bulk editing
  - Bulk create
  - Grouping (by status, type, etc.)
  - Column sorting and filtering
  - Inline actions
- `MyOpenItemsCard` — List of open action items scoped to active persona
- `AIDigestCard` — Static or lightly dynamic digest card (can be placeholder content seeded per persona)

**Tab 2 — Cost Management**
- Cost summary card
- Capital planning card
- Funding source card (or simplified budget allocation card)
- Budget vs. actuals (seed data driven chart)

**Tab 3 — Schedule & Milestones**
- Milestone timeline card
- Upcoming deadlines card
- At-risk projects indicator

Each card must:
- Accept a standard `CardProps` interface (title, subtitle, data, actions, loading state)
- Be independently collapsible/expandable
- Support a "go to detail" affordance that opens the Tearsheet

---

### 2. Tearsheet / Detail Panel

- Slide-in panel triggered from any hub card
- Shows detail view of a selected item (project, open item, cost line, etc.)
- Supports: view, inline action (e.g. approve, reassign), and a "Go to Project" CTA that navigates to project level
- Must be reusable — driven by item type + ID, not hardcoded per card

---

### 3. Create Experience

- Triggered from the hub (e.g. "+ New Project" button)
- Multi-step concept flow:
  1. Project type selection
  2. Basic info entry (name, owner, type, budget)
  3. Template/settings selection
  4. Confirmation
- On submit: adds project to seed data in local state (does not persist across refresh — that's fine)

---

### 4. Navigation

**Global Nav (Company Level)**
- Logo / company switcher (persona-aware)
- Top-level links: Home, Projects, Reports, Settings
- Active persona display + switcher (see Personas below)

**Project-Level Nav**
- Overview
- Tools shell (links exist, tools show placeholder/seed data — they don't need to be fully built)
  - Budget, Schedule, Documents, RFIs, Submittals
- Breadcrumb back to Portfolio

---

### 5. Project Overview Page

- Project header (name, status, type, key dates)
- Summary cards: Budget health, Schedule health, Open items count
- Recent activity feed (seeded)
- Quick links to tools (non-functional shells are fine)

---

### 6. Company-Level Settings

- Settings shell with sidebar nav
- At minimum, build out:
  - **Configurable experience settings** — toggles/options that influence what cards appear on the hub
  - **User/role management** (display only, tied to personas)
  - **Project templates** (display only)
- Settings state must connect to hub rendering — if a setting is toggled off, that card should not appear on the hub

---

### 7. Seed Data

All data lives in `/src/data/seed/`. Structure:

```
/seed
  projects.ts       ← 6–10 projects in various states (planning, active, closeout)
  openItems.ts      ← 15–20 open items across projects and personas
  costData.ts       ← Budget lines, actuals, funding sources per project
  milestones.ts     ← Schedule milestones per project
  personas.ts       ← 3–4 user personas (see below)
  settings.ts       ← Company-level settings defaults
```

---

### 8. Personas & Permission Levels

Implement a **Persona Switcher** (visible in the nav, dev-tool style) with 3–4 personas:

| Persona | Role | Permissions |
|---|---|---|
| Alex Chen | Owner Executive | Full access, sees all projects and financials |
| Jordan Reyes | Project Manager | Sees assigned projects only, no capital planning |
| Sam Taylor | Finance Lead | Sees cost/budget data, no schedule or RFI tools |
| Guest / Read-Only | Stakeholder | View-only, no actions available |

Switching persona should:
- Filter visible projects to those assigned to that persona
- Show/hide cards and actions based on permission level
- Update the AI Digest card content

---

## Hierarchy Support (Future-Ready)

Scaffold the data model to support hierarchy from day one, even if it's not fully rendered yet:

- Projects belong to a `Program`
- Programs belong to a `Portfolio`
- Seed data should include at least one program grouping
- The `ProjectListCard` should have a hidden/stub "group by program" toggle ready to enable

---

## Quality Standards

Claude Code should validate the following before considering any feature complete:

1. **Renders without console errors**
2. **Design system components used** — no raw HTML `<button>`, `<input>`, `<table>` where a DS component exists
3. **Persona switching works** — data and permissions update correctly on switch
4. **Tearsheet opens and closes correctly** from at least 2 different card types
5. **Create flow completes** and reflects new project in the list
6. **Settings toggle affects hub** — at least one setting drives card visibility
7. **Vercel build passes** — run `npm run build` and confirm zero errors before wrapping up any session

---

## Deployment

- Target: Vercel
- Confirm all imports resolve (especially `@procore/*` packages)
- Add a `.env.example` if any environment variables are needed
- Include a `README.md` with: setup steps, how to add seed data, how to add a new hub card, how to add a persona

---

## How to Add a New Hub Card (Pattern)

Every hub card must follow this pattern so the scaffold stays consistent:

```tsx
// /src/components/hub/cards/MyCard.tsx
interface MyCardProps {
  persona: Persona;
  data: MyDataType[];
  onDetailOpen: (itemId: string) => void;
}

export const MyCard = ({ persona, data, onDetailOpen }: MyCardProps) => {
  // Use design system Card, Heading, Table, etc.
  // Never raw HTML
}
```

Register the card in `/src/config/hubCards.ts` — this config drives what renders on each tab, and is filtered by settings + persona at runtime.

---

## Out of Scope (for now)

- Real API integration
- Authentication (persona switcher replaces this)
- Full tool buildout (shells + seed data only)
- Full settings experience (key flows only)
- Mobile responsiveness (desktop first)

---

## Open Questions to Resolve with Claude Code

1. **Vite vs Next.js** — confirm build target before scaffolding
2. **Procore package availability** — confirm which `@procore/*` packages are installable in this environment and pin versions
3. **Repo structure** — monorepo or standalone? Confirm before init
4. **Vercel deployment issue** — diagnose and fix `@procore/smart-grid-cells` module resolution error as first task

---

## Suggested Execution Order for Claude Code

1. Fix deployment / Vercel build issue first
2. Scaffold project structure and routing
3. Set up seed data and PersonaContext
4. Build nav (global + project level)
5. Build hub shell with tab structure
6. Build ProjectListCard (most complex — do this early)
7. Build Tearsheet component
8. Build remaining hub cards (OpenItems, Digest, Cost, Schedule)
9. Build Create flow
10. Build Project Overview page
11. Build Settings shell + connect to hub config
12. Wire persona switcher to permissions + data filtering
13. Final build check + Vercel deploy test
14. Write README

