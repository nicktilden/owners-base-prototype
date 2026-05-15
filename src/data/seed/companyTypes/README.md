# Company Type Seed Data

Runtime dataset switcher for the Owner Experience Prototype. The active dataset is resolved from `localStorage` at module init — switching company type hard-reloads the page from `window.location.href = '/'`.

**localStorage key:** `owner_prototype_company_type`  
**Default:** `healthcare`

---

## The 10 Company Types

| Key | Label | Account | HQ |
|---|---|---|---|
| `multiFamilyResidential` | Multi-Family Residential | Crescent Communities | Charlotte, NC |
| `retail` | Retail | Brightline Retail Group | Grand Rapids, MI |
| `office` | Office | Empire State Realty Trust | New York, NY |
| `dataCenter` | Data Center | Vantage Data Centers | Denver, CO |
| `healthcare` ⭐ | Healthcare | Trinity Health | Livonia, MI |
| `utilities` | Utilities | Keystone Utilities | Waltham, MA |
| `education` | Education | University of Nebraska | Lincoln, NE |
| `renewables` | Renewables | Silicon Ranch | Nashville, TN |
| `airports` | Airports | Los Angeles World Airports | Los Angeles, CA |
| `corporateRealEstate` | Corporate Real Estate | Northgate Services | Bellevue, WA |

⭐ = default

---

## Directory Structure

```
companyTypes/
  _template/
    REQUIRED_FILES.md       ← Required file manifest
  _validation.ts            ← Compile-time exhaustiveness check
  registry.ts               ← All 10 CompanyTypeConfig objects
  index.ts                  ← Active-type resolver (barrel entry point)
  healthcare/               ← Default dataset (Trinity Health)
    index.ts
    account.ts
    users.ts
    activeUser.ts
    projects.ts
    wbs.ts
    hubs.ts
    budget.ts
    schedule.ts
    tasks.ts
    documents.ts
    action_plans.ts
    assets.ts
    ... (health & risk files + 19 stub files)
  multiFamilyResidential/   ← Crescent Communities
  retail/                   ← Brightline Retail Group
  office/                   ← Empire State Realty Trust
  dataCenter/               ← Vantage Data Centers
  utilities/                ← Keystone Utilities
  education/                ← University of Nebraska
  renewables/               ← Silicon Ranch
  airports/                 ← Los Angeles World Airports
  corporateRealEstate/      ← Northgate Services
```

---

## Required Files Per Company Type

Each directory must export these named symbols (see `_template/REQUIRED_FILES.md` for full list):

| File | Export | Notes |
|---|---|---|
| `account.ts` | `account`, `connectedAccounts` | `id` is always `'acc-001'` |
| `users.ts` | `users` | 17 users, one per role mapping |
| `activeUser.ts` | `activeUser` | Points to `users.find(u => u.id === 'user-NNN')` |
| `projects.ts` | `projects` | 20 projects; `project.program` always `null` |
| `wbs.ts` | `wbsItems` | Cost codes + cost types + programs |
| `hubs.ts` | `hubs` | Shared layout — copy from healthcare |
| `budget.ts` | `budgetLineItems` | 5 items × 10 active projects |
| `schedule.ts` | `scheduleEntries` | 6 items + 4 milestones × 10 active projects |
| `tasks.ts` | `tasks` | 24 tasks |
| `documents.ts` | `documents` | 15 documents |
| `action_plans.ts` | `actionPlans` | 5 action plans |
| `assets.ts` | `assets` | 15 assets |

Each directory also needs an `index.ts` barrel with named exports + a `default` export:

```typescript
// index.ts
export { account, connectedAccounts } from './account';
export { activeUser } from './activeUser';
// ... all named exports ...

import { account } from './account';
// ... etc ...
export default { account, activeUser, users, projects, wbsItems, hubs,
                 budgetLineItems, scheduleEntries, tasks, documents, actionPlans, assets };
```

---

## How to Add a New Data Type

If a new seed data type needs to be added to all company types (e.g. a new tool gets seeded):

1. Add the new file to all 10 company type directories
2. Export the new symbol from each `companyTypes/<type>/index.ts`
3. Add the export to `companyTypes/index.ts` (the barrel resolver)
4. Add the type to `AppProviders.tsx` seed loader if it needs to be loaded into DataContext
5. Add the type to `_validation.ts` → `RequiredDatasetShape` interface

---

## How to Add a New Company Type

1. Create a new directory: `src/data/seed/companyTypes/<newKey>/`
2. Add all required files (see `_template/REQUIRED_FILES.md`)
3. Add the new type to `src/types/companyType.ts` → `CompanyType` union + `COMPANY_TYPE_KEYS`
4. Add the config to `src/data/seed/companyTypes/registry.ts` → `COMPANY_TYPE_CONFIGS`
5. Add a static import in `companyTypes/index.ts` → `DATASETS` map
6. Add to `_validation.ts` → `REGISTERED_DATASETS` record (TypeScript will enforce it)
7. Run `npm run validate-seed` — must pass before merging

---

## Validation

```bash
npm run validate-seed
```

This runs `tsc --noEmit` against `_validation.ts`, which uses a `Record<CompanyType, RequiredDatasetShape>` to enforce that every company type key has a registered dataset with the required exports. TypeScript will error if any key is missing.

---

## Active User Role Preservation on Switch

When switching company types, the active user's **role** is preserved, not their user ID.

- Before switch: read `activeUser.role` from current dataset
- After switch: `users.find(u => u.role === savedRole)` becomes the new active user
- This is wired up in `CompanyTypeContext.tsx`

All 10 datasets have exactly 4 `UserRole` values; the active user defaults to an Executive Strategy user on first load.
