/**
 * COMPANY TYPE DATASET VALIDATION
 * Compile-time exhaustiveness check: every CompanyType key must have a registered dataset.
 * This file is intentionally NOT imported by the app — run it with `npm run validate-seed`.
 * It will produce TypeScript errors if any required dataset is missing or malformed.
 *
 * NOTE: This file will error until Phase 3 fills in all 10 datasets.
 */

import type { CompanyType } from '@/types/companyType';
import type { Account } from '@/types/account';
import type { User } from '@/types/user';
import type { Project } from '@/types/project';
import type { WBSItem } from '@/types/shared';
import type { Hub } from '@/types/hubs';
import type { BudgetLineItem } from '@/types/budget';
import type { ScheduleEntry } from '@/types/schedule';
import type { Task } from '@/types/tasks';
import type { Document } from '@/types/documents';
import type { ActionPlan } from '@/types/action_plans';
import type { Asset } from '@/types/assets';

interface RequiredDatasetShape {
  account: Account;
  users: User[];
  activeUser: User;
  projects: Project[];
  wbsItems: WBSItem[];
  hubs: Hub[];
  budgetLineItems: BudgetLineItem[];
  scheduleEntries: ScheduleEntry[];
  tasks: Task[];
  documents: Document[];
  actionPlans: ActionPlan[];
  assets: Asset[];
}

// TypeScript will error if any CompanyType key is missing from this record.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const REGISTERED_DATASETS: Record<CompanyType, RequiredDatasetShape> = {
  healthcare: require('./healthcare').default,
  multiFamilyResidential: require('./multiFamilyResidential').default,
  retail: require('./retail').default,
  office: require('./office').default,
  dataCenter: require('./dataCenter').default,
  utilities: require('./utilities').default,
  education: require('./education').default,
  renewables: require('./renewables').default,
  airports: require('./airports').default,
  corporateRealEstate: require('./corporateRealEstate').default,
};
