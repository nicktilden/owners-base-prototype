# Company Type Dataset — Required Files

Every directory under `companyTypes/` must contain exactly these files.
Stub files (empty arrays) are acceptable for unmodeled tools.

## Core Files (must have real data)

| File | Export | Type |
|---|---|---|
| `account.ts` | `account` | `Account` |
| `users.ts` | `users` | `User[]` (one per role, 17 total) |
| `activeUser.ts` | `activeUser` | `User` (default: CEO) |
| `projects.ts` | `projects` | `Project[]` (12–20 projects) |
| `wbs.ts` | `wbsItems` | `WBSItem[]` |
| `hubs.ts` | `hubs` | `Hub[]` |
| `budget.ts` | `budgetLineItems` | `BudgetLineItem[]` |
| `schedule.ts` | `scheduleEntries` | `ScheduleEntry[]` |
| `tasks.ts` | `tasks` | `Task[]` |
| `documents.ts` | `documents` | `Document[]` |
| `action_plans.ts` | `actionPlans` | `ActionPlan[]` |
| `assets.ts` | `assets` | `Asset[]` |

## Health & Risk Files (must have data)

| File | Export | Type |
|---|---|---|
| `riskTypes.ts` | `riskTypes` | `RiskType[]` |
| `risks.ts` | `risks` | `Risk[]` |
| `healthSnapshots.ts` | `healthSnapshotsByProject` | `Record<string, HealthSnapshot[]>` |
| `manualRiskItems.ts` | `manualRiskItems` | `ManualRiskItem[]` |
| `riskTags.ts` | `riskTags` | `RiskTag[]` |
| `connectedProjects.ts` | `connectedProjects` | `ConnectedProjectHealth[]` |
| `riskTypeRules.ts` | `riskTypeRules` | `RiskTypeRule[]` |
| `approvalTriggers.ts` | `approvalTriggers` | `ApprovalTrigger[]` |

## Stub Files (empty arrays acceptable)

`rfis.ts`, `change_orders.ts`, `bidding.ts`, `change_events.ts`, `invoicing.ts`,
`prime_contracts.ts`, `punch_list.ts`, `specifications.ts`, `submittals.ts`,
`observations.ts`, `correspondence.ts`, `commitments.ts`, `capital_planning.ts`,
`funding_source.ts`, `action_plan_types.ts`, `incidents.ts`, `work_hours.ts`,
`automationRules.ts`

## Rules

- `project.program` is always `null`
- All user emails use the company's `emailDomain` from the registry
- `users` has exactly one user per `UserRole`
- `activeUser` is the CEO by default
- Project IDs follow the pattern `proj-NNN` where NNN is zero-padded
- Budget line items reference valid project IDs from `projects.ts`
