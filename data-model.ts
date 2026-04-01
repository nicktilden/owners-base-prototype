/**
 * OWNER PROTOTYPE — DATA MODEL
 * ============================================================================
 * Reconciled against actual source files. This file is the authoritative
 * reference for Claude Code. All seed data in /src/data/seed/ must conform
 * to the interfaces and union types defined here (or imported from the
 * source files below).
 *
 * SOURCE FILES (already defined — do not redefine here):
 *   account.ts          Account, Office
 *   user.ts             User, UserRole, UserPermissions, UserFavorites,
 *                       AssignedItem, AssignedItemType
 *   project.ts          Project, ProjectNumber, ProjectStatus, ProjectStage,
 *                       ProjectPriority, WorkScope, ProjectSector,
 *                       DeliveryMethod, ProjectType, ProjectRegion
 *   shared.ts           USState, WBSItem, WBSStatus, WBSCostCode,
 *                       WBSCostType, WBSProgram, WBSSegmentType
 *   permissions.ts      ToolPermissionLevel, UserToolPermissions,
 *                       PermissionKey, UserPermissions, RolePermissionMap,
 *                       RoleToolPermissionMap + all role permission constants
 *   tools/index.ts      ToolKey, ToolLevel, Tool, ToolCoreActions,
 *                       ToolSubPages, TOOL_LEVEL_MAP, ExportFormat
 *   tools/hubs.ts       Hub, HubTab, HubCard, HubCardType, HubCardConfig,
 *                       HubDisplayName, HubTabSource
 *   tools/action_plans.ts  ActionPlan, ActionPlanSection, ActionPlanItem,
 *                          ActionPlanStatus, ActionPlanType,
 *                          ActionPlanItemStatus, ActionPlanReference,
 *                          ActionPlanRecord
 *   tools/assets.ts     Asset, AssetType, AssetTrade, AssetStatus,
 *                       AssetCondition
 *   tools/budget.ts     BudgetLineItem (+ calculated column documentation)
 *   tools/documents.ts  Document, DocumentType, DocumentFormat,
 *                       DocumentStatus
 *   tools/schedule.ts   ScheduleItem, Milestone, ScheduleLink,
 *                       ScheduleLinkType, ScheduleStatus, ScheduleEntry
 *   tools/tasks.ts      Task, TaskAttachment, TaskStatus, TaskCategory
 *
 * ============================================================================
 */

// =============================================================================
// RECONCILIATION NOTES
// =============================================================================
//
// The following corrections apply relative to earlier drafts in CONTEXT.md
// and the initial data-model.ts. All source files take precedence.
//
// 1. ACCOUNT
//    - companyName (not name)
//    - logo (not logoUrl) — string | null
//    - Added: timeZone (IANA string e.g. 'America/New_York')
//    - Added: office (Office object — name, address, city, state, zip, country)
//
// 2. USER
//    - firstName + lastName (not name)
//    - Added: companyName (user's organization, separate from Account)
//    - avatar (not avatarUrl) — string | null
//    - UserRole is a 17-value job title union, NOT a simplified enum:
//        CEO | COO | CFO | Capital Planning | VP of Operations |
//        VP of Development | Board of Directors |
//        Director of Project Management | Director of Construction |
//        Program Manager | Project Manager | Construction Manager |
//        Superintendent | Project Engineer | Foreman | Operators | IT Admin
//    - permissions is UserPermissions (roleDefaults, granted, denied PermissionKey[])
//      Tool-level access is separate in UserPermissions:
//        toolDefaults (from role) + toolGranted (overrides) + toolDenied (blocked keys)
//    - projectIds (not assignedProjectIds)
//    - Added: favorites (UserFavorites), createdAt, updatedAt, lastActiveAt
//
// 3. PROJECT
//    - estimatedBudget (not budget)
//    - program: null — reserved for future use. NOT a string grouping attribute.
//    - stage (ProjectStage — 11 values) is separate from status (ProjectStatus — 4 values)
//    - Added: priority (low | medium | high)
//    - Added: scope (WorkScope: new_construction | renovation | maintenance | other)
//    - Added: sector (ProjectSector — 80+ tiered path strings, cascading select)
//    - Added: delivery (DeliveryMethod — 9 values)
//    - type (ProjectType) has 23 values — not the 6-value draft enum
//    - Added: country, city, state (USState), zip, address, latitude, longitude
//    - Added: favorite (boolean, per-user)
//    - photo (not imageUrl) — string | null
//    - startDate / endDate are Date (not string)
//    - Added: description
//    - Project does NOT have assignedUserIds — membership is derived from User.projectIds
//
// 4. PROGRAM
//    - program on Project is null (typed as null, reserved for future hierarchy)
//    - WBSProgram in shared.ts is a WBS financial classification (Budget tool)
//      NOT a project grouping concept — these are two different things
//    - Remove all references to program as a project attribute or filter
//
// 5. TOOLS
//    - ToolLevel has 4 values: portfolio | project | both | global
//      (global exists but no tools currently use it)
//    - Tool level assignments:
//        both:      hubs, documents, schedule, assets, budget, tasks
//        portfolio: capital_planning, funding_source
//        project:   bidding, action_plans, change_events, change_orders,
//                   invoicing, prime_contracts, rfis, punch_list,
//                   specifications, submittals, observations,
//                   correspondence, commitments
//
// 6. PERMISSIONS — TWO-LAYER MODEL
//    Layer 1 — Tool access (ToolPermissionLevel per tool):
//      none | read | update | create | admin
//      Stored in UserPermissions: toolDefaults, toolGranted, toolDenied
//    Layer 2 — Action keys (PermissionKey):
//      platform:access, account:read/update/manage_billing,
//      users:invite/remove/update_role/update_permissions,
//      projects:create/read/update/delete/manage_members,
//      tools:enable/disable
//      Stored in UserPermissions: keyDefaults, keyGranted, keyDenied
//    Resolution order (both layers): roleDefaults → granted → denied
//    Role permission groups:
//      EXECUTIVE   → CEO, COO, CFO, Capital Planning
//      ADMIN       → VP of Operations, VP of Development,
//                    Director of PM, Director of Construction, IT Admin
//      MANAGER     → Program Manager, Project Manager, Construction Manager
//      FIELD       → Superintendent, Project Engineer, Foreman
//      OPERATOR    → Operators
//      BOARD       → Board of Directors
//
// 7. HUB / HUBS TOOL
//    - Hub is a full data entity: Hub → HubTab[] → HubCard[]
//    - HubTab.source: 'admin' | 'user'
//    - HubCard.type: 13 types (project_list, budget_summary, open_rfis, etc.)
//    - Portfolio nav label: 'Hub' | Project nav label: 'Project Overview'
//    - Project page title: '{ProjectNumber} {ProjectName}' (runtime resolved)
//    - Min 1 tab, max 10 tabs per Hub instance
//
// 8. BUDGET
//    - WBS composite key: {program.code}.{costType.code}{costCode.code}
//    - Source columns (stored): originalBudgetAmount, approvedCOs,
//      budgetChanges, committedCosts, directCosts, pendingCostChanges,
//      subcontractorInvoices, pendingRisk
//    - Calculated columns (runtime only — never stored):
//      revisedBudget, projectedBudget, projectedCosts, jobToDateCosts,
//      forecastToComplete, estimatedCostAtCompletion, projectedOverUnder
//
// 9. SCHEDULE
//    - Two types with discriminant field: type: 'item' | 'milestone'
//    - ScheduleLink dependency types: FS | SS | FF | SF
//    - variance is calculated (not stored) on both types
//    - Uses WBSCostCode only (not CostType or Program)
//
// 10. DOCUMENTS
//    - Primary action is 'upload' not 'create'
//    - DocumentsTool overrides ToolCoreActions to replace create with upload
//
// =============================================================================

// =============================================================================
// PERMISSION UTILITY FUNCTIONS
// Implement in /src/utils/permissions.ts
// =============================================================================

/**
 * PERMISSION TIER MAP
 * Numeric rank for each ToolPermissionLevel.
 * Used by hasToolPermission() for inclusive tier comparison.
 */
const PERMISSION_TIER: Record<ToolPermissionLevel, number> = {
  none:   0,
  read:   1,
  update: 2,
  create: 3,
  admin:  4,
};

/**
 * getEffectiveToolPermission(user, tool)
 * Returns the resolved ToolPermissionLevel for a user on a given tool.
 *
 * Resolution order:
 *   1. toolDenied includes tool → 'none'
 *   2. toolGranted has an entry → use granted level
 *   3. toolDefaults has an entry → use role baseline
 *   4. Not found anywhere → 'none'
 */
function getEffectiveToolPermission(
  user: User,
  tool: ToolKey
): ToolPermissionLevel {
  const { toolDenied, toolGranted, toolDefaults } = user.permissions;
  if (toolDenied.includes(tool)) return 'none';
  if (toolGranted[tool] !== undefined) return toolGranted[tool]!;
  return toolDefaults[tool] ?? 'none';
}

/**
 * hasToolPermission(user, tool, required)
 * Returns true if the user's effective permission meets or exceeds required.
 *
 * hasToolPermission(user, 'budget', 'read')   // true for most roles
 * hasToolPermission(user, 'budget', 'admin')  // true only for admin roles
 */
function hasToolPermission(
  user: User,
  tool: ToolKey,
  required: ToolPermissionLevel
): boolean {
  const effective = getEffectiveToolPermission(user, tool);
  return PERMISSION_TIER[effective] >= PERMISSION_TIER[required];
}

/**
 * canAccessTool(user, tool)
 * Returns true if user has any access above 'none'.
 * Used to show/hide tools in the drawer nav and hub cards.
 */
function canAccessTool(user: User, tool: ToolKey): boolean {
  return getEffectiveToolPermission(user, tool) !== 'none';
}

/**
 * hasPermissionKey(user, key)
 * Returns true if the user has a non-tool PermissionKey.
 *
 * Resolution order:
 *   1. keyDenied includes key → false
 *   2. keyGranted includes key → true
 *   3. keyDefaults includes key → true
 *   4. Default → false
 */
function hasPermissionKey(user: User, key: PermissionKey): boolean {
  const { keyDenied, keyGranted, keyDefaults } = user.permissions;
  if (keyDenied.includes(key)) return false;
  if (keyGranted.includes(key)) return true;
  return keyDefaults.includes(key);
}

// =============================================================================
// PROJECT NUMBER GENERATOR REFERENCE
// =============================================================================

/**
 * ProjectNumber format: {RegionCode}{SequentialNumber}
 * Regex: /^[A-Z]{1,2}\d{4}$/
 *
 * RegionCode derived from ProjectRegion:
 *   Northeast  → NE
 *   Midwest    → MW
 *   South      → S
 *   West       → W
 *   Southwest  → SW
 *
 * SequentialNumber: 4-digit zero-padded, starts at 1001, never reused.
 * Examples: NE1001, MW1002, S1003, W1004, SW1005
 */
const REGION_CODE_MAP: Record<ProjectRegion, string> = {
  'Northeast':  'NE',
  'Midwest':    'MW',
  'South':      'S',
  'West':       'W',
  'Southwest':  'SW',
};

// =============================================================================
// SEED DATA CHECKLIST
// /src/data/seed/ — one file per entity
// =============================================================================

/**
 * REQUIRED SEED FILES
 *
 * account.ts
 *   1 Account + 1 Office record
 *
 * users.ts
 *   5–6 User records covering these roles:
 *   CEO, Project Manager, CFO or Capital Planning,
 *   Board of Directors (read-only), IT Admin, Superintendent (field)
 *   Each user should have:
 *   - toolDefaults derived from ROLE_TOOL_PERMISSION_MAP
 *   - projectIds appropriate to their role
 *   - empty toolGranted / toolDenied / keyGranted / keyDenied (no overrides)
 *
 * projects.ts
 *   6–10 Project records covering:
 *   - Mixed statuses: active, on_hold, inactive
 *   - Mixed stages: pre-construction through closeout
 *   - Mixed regions: at least NE, MW, S, W, SW (one each)
 *   - Mixed sectors: at least 3–4 different tier-1 sectors
 *   - Mixed delivery methods: at least 3 different types
 *   - Mix of favorited (true) and non-favorited (false) projects
 *   - Realistic lat/lng coordinates for map card
 *   - program: null on all records (reserved for future use)
 *
 * wbs.ts
 *   WBSItem records for:
 *   - Cost Codes (segment: 'cost_code') — 8–12 items with hierarchical codes
 *   - Cost Types (segment: 'cost_type') — 4–6 items
 *   - Programs (segment: 'program') — 3–5 items (WBS financial programs, not project grouping)
 *
 * hubs.ts
 *   2 Hub instances:
 *   Portfolio Hub: level='portfolio', 3 tabs (Portfolio, Cost Management, Schedule & Milestones)
 *   Project Hub:   level='project',  3 tabs (Overview, Cost, Schedule)
 *   Each tab with 3–5 HubCard records of appropriate types
 *
 * budget.ts
 *   BudgetLineItem records — 5–8 per active project
 *   Use realistic WBS code combinations from wbs.ts
 *   Populate all source columns; leave calculated columns as comments only
 *
 * schedule.ts
 *   ScheduleItem + Milestone records — 4–6 items + 2–3 milestones per project
 *   Include at least one predecessor/successor link per project
 *
 * tasks.ts
 *   10–15 Task records across projects
 *   Mix of statuses, assignees, and categories
 *   Some private, some with due dates
 *
 * documents.ts
 *   8–12 Document records across projects
 *   Mix of types (DOC, DR, IMG) and statuses
 *
 * action_plans.ts
 *   2–3 ActionPlan records with sections and items
 *   Include at least one complete plan and one in-progress plan
 *
 * assets.ts
 *   6–10 Asset records across projects
 *   Mix of statuses and asset types
 *
 * STUB FILES (tool shell exists, list is empty — no seed data needed yet):
 *   bidding.ts, change_events.ts, change_orders.ts, invoicing.ts,
 *   prime_contracts.ts, rfis.ts, punch_list.ts, specifications.ts,
 *   submittals.ts, observations.ts, correspondence.ts, commitments.ts,
 *   capital_planning.ts, funding_source.ts
 */
