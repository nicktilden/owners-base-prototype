# Skills Inventory & Gap Analysis

> Documents what existing skills cover, what's missing, and what needs to be built before Claude Code can reliably execute the owner prototype.

---

## Existing Skills

### 1. `core-react` (v12.42.0)
**Location**: `core-react/SKILL.md` + 8 reference files  
**What it covers**:
- Full component knowledge base for `@procore/core-react` — 91 components with TypeScript types, Storybook usage, and Confluence design guidelines
- 4 workflows: Build UI from design, Update cache, Component lookup, Audit/refactor existing code
- Design foundations: color tokens, spacing, typography, grid, shadows, border radius
- Code patterns: DetailPage, ListPage, SettingsPage, Form, Modal, Tearsheet compositions
- 10 enforced guardrails (no raw HTML, no deprecated props, correct button ordering, accessibility, one primary per context, etc.)
- Figma MCP integration via node IDs for ToolLandingPage and DetailPage layouts
- Icon catalog (292 icons from `@procore/core-icons`)
- Hooks and style export reference

**What it does NOT cover**:
- Hub page type (no `HubPage` component exists — this is a custom pattern built on `Card` + `Grid`)
- Hub card composition pattern and registration system
- Persona switching and permission-gated rendering
- Seed data structure and shape
- Tearsheet-from-card interaction pattern (it documents the `Tearsheet` component but not the hub-specific trigger pattern)
- Create flow / multi-step concept flow pattern
- Project-level vs. Portfolio-level context switching

### 2. `procore-ds-guidelines`
**Location**: `procore-ds-guidelines/SKILL.md`  
**What it covers**:
- NGX layout pattern selection (maps to our 4 page types)
- Button hierarchy, form rules, data table toolbar structure
- List vs. table decision criteria
- Overlay and panel selection (Split View, Page-Level Panel, Dock Sidepanel)
- Content guidelines (casing, action verbs, error copy)
- Accessibility baseline (WCAG 2.1 AA, POUR)
- i18n baseline (text expansion, locale-aware formatting)
- Master implementation checklist (run as quality gate)

**What it does NOT cover**:
- Hub-specific patterns (same gap as `core-react`)
- Persona/permission model
- Seed data
- Prototype-specific patterns

---

## Gap Analysis

### Gap 1: Hub Page Pattern ✅ COVERED
The `create-hub-card` skill covers the full HubCard component system including anatomy, sizing, body variants (9 types), GridStack registration (3-step process), edit mode props, and complete usage examples. The CONTEXT.md adds the Tearsheet trigger pattern and TearsheetManager that bridges the card system to the DS `Tearsheet` component.

---

### Gap 2: Persona & Permission System ❌ NOT COVERED
**Priority: Critical**  
No existing skill handles persona switching or permission-gated rendering.

Needs a skill (or section) that defines:
- `PersonaContext` shape and provider pattern
- Persona definitions (names, roles, permission levels)
- How components consume persona context (`usePersona` hook)
- Permission check pattern (`hasPermission(persona, 'create:project')`)
- How persona switch affects: visible projects, card visibility, action button visibility, hub tab visibility

**Action**: Document in `CONTEXT.md` (prototype-specific, not a reusable skill)

---

### Gap 3: Seed Data Structure ❌ NOT COVERED
**Priority: High**  
No existing skill defines the seed data shape or how it flows through the app.

Needs documentation of:
- `projects.ts` shape (id, name, status, type, budget, program, assignedPersonas, etc.)
- `openItems.ts` shape (id, title, type, status, dueDate, projectId, assignedTo)
- `costData.ts` shape (projectId, budgetLines, actuals, fundingSources)
- `milestones.ts` shape (projectId, name, date, status)
- `personas.ts` shape (id, name, role, permissions[], assignedProjectIds[])
- `settings.ts` shape (visibleCards[], enabledTools[], companyDefaults)

**Action**: Document in `CONTEXT.md` and scaffold as TypeScript types in the prototype

---

### Gap 4: Tearsheet-from-Card Pattern ✅ COVERED (via CONTEXT.md)
Documented in CONTEXT.md Section 9 — TearsheetManager pattern with state shape, item type routing, and "Go to Tool" CTA pattern.

---

### Gap 5: Create Flow / Concept Flow ❌ NOT COVERED
**Priority: Medium**  
Multi-step project creation flow has no existing pattern documented.

Needs documentation of:
- Multi-step modal pattern using `Modal` + step state
- Step validation before advancing
- Confirmation step pattern
- How created item is added to local seed data state

**Action**: Document in `CONTEXT.md`

---

### Gap 6: Navigation Context Switching ❌ NOT COVERED
**Priority: Medium**  
Portfolio ↔ Project level context switching via the Project Menu has no documented pattern.

Needs documentation of:
- `LevelContext` (Portfolio vs. Project) and how it affects drawer nav content
- Project Menu component pattern (shows account + project, allows switching)
- How routing changes on level switch

**Action**: Document in `CONTEXT.md`

---

## Skills to Build

| Skill | Priority | Covers |
|---|---|---|
| *(none — all gaps resolved via existing skills + CONTEXT.md)* | — | — |

---

## All Skills — Final Status

| Skill | Status | Use In Prototype |
|---|---|---|
| `core-react` | ✅ Ready | All component lookups, UI generation, audit/refactor |
| `procore-ds-guidelines` | ✅ Ready | Quality gate checklist, layout selection, content rules |
| `create-hub-card` | ✅ Ready | All hub card building and GridStack registration |
| `CONTEXT.md` | ✅ Ready | Prototype-specific: persona model, seed data, tearsheet pattern, create flow, nav switching |

---

## NGX Layout → Page Type Mapping

The `core-react` skill uses DS-native template names. The structure doc uses product-level names. This table reconciles them so Claude Code doesn't treat them as separate systems:

| Product Name (Structure Doc) | DS Template Name (core-react skill) | Core-React Component |
|---|---|---|
| Hub (Portfolio or Project Overview) | `ToolLandingPage` (closest fit) | `ToolLandingPage` / `PageLayout` |
| Tool List | `Tool Landing` / `ListPage` | `ListPage` |
| Detail | `Detail Page` | `DetailPage` |
| Settings | `Tool Settings` / `SettingsPage` | `SettingsPage` |

> Note: The Hub has no exact DS template equivalent. Use `ToolLandingPage` as the outer shell and compose the card grid manually using `Grid` + `Card`.
