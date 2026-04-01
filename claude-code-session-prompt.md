# Claude Code — Session Opening Prompt
# Owner Experience Prototype
# Copy and paste the full contents below into Claude Code to start a session.
# For re-entry sessions, use the shorter prompt at the bottom of this file.
# ============================================================================


Before doing anything else, read these two files in full:
- CONTEXT.md
- data-model.ts

These are your source of truth for everything we are building. Do not proceed
until you have read both.

Once read, confirm the following back to me:
1. The skill map — which skills you will load and when
2. The execution order — the 18 steps from CONTEXT.md
3. Any blockers or missing information you need before starting

---

When you are ready to build, start with Step 1 from the execution order:

> Fix Vercel / npm build issue (`@procore/smart-grid-cells` module resolution)

Work through the execution order sequentially. Do not skip steps. After
completing each step, summarize what was built, any decisions you made, and
confirm you are ready to move to the next step before proceeding.

---

GROUND RULES

1. Always load the relevant skill file before working on any component or page.
   Do not rely on memory for component APIs.
2. Never use raw HTML where a @procore/core-react component exists.
3. Never invent field names, type values, or permission levels. Everything must
   come from the source files in the data model.
4. All seed data must conform to the TypeScript interfaces in the source files —
   account.ts, user.ts, project.ts, shared.ts, permissions.ts, and the tools/ folder.
5. When building hub cards, always load create-hub-card/SKILL.md first.
6. Run `npm run build` after every major step. Do not move to the next step if
   the build is broken.
7. Before marking any feature complete, run the quality gate checklist from
   procore-ds-guidelines/SKILL.md.

---

SEED DATA

When you reach the seed data step (Step 3 in the execution order), do not
generate seed data manually. Instead:

  Load and run the `populate-seed-data/SKILL.md` skill.

The skill will:
  1. Ask which company type to use (9 options)
  2. Ask which user should be the active logged-in user (17 roles)
  3. Generate all 13 seed data files tailored to those selections
  4. Enforce role-based item assignments so every user has data when they log in
  5. Validate record counts and cross-file ID references
  6. Confirm zero TypeScript errors before proceeding

Do not skip the skill and write seed data by hand. The skill ensures consistency,
realistic data, and correct type conformance.

---

CONTEXT FILES TO HAVE OPEN

These files should be accessible to Claude Code throughout the session:

  CONTEXT.md                        — primary session context (read first, every session)
  data-model.ts                     — field names, types, reconciliation notes, seed checklist
  src/types/account.ts              — Account, Office
  src/types/user.ts                 — User, UserRole, UserPermissions, UserFavorites
  src/types/project.ts              — Project + all project union types
  src/types/shared.ts               — USState, WBSItem types
  src/types/permissions.ts          — permission levels, role maps, PermissionKey
  src/types/tools/index.ts          — ToolKey, ToolLevel, TOOL_LEVEL_MAP
  src/types/tools/hubs.ts           — Hub, HubTab, HubCard, HubCardType


# ============================================================================
# RE-ENTRY PROMPT (use this for continuing an existing session)
# ============================================================================

Read CONTEXT.md. We last completed Step [N]: [brief description].
Continue from Step [N+1]. Same ground rules apply.
If seed data has not been populated yet, load populate-seed-data/SKILL.md
before building any UI that depends on data.
