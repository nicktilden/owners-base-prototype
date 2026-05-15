/**
 * HEALTHCARE DATASET — Trinity Health
 * Named exports for direct import; default export for the validation checker.
 */

export { account, connectedAccounts } from './account';
export { activeUser } from './activeUser';
export { users } from './users';
export { projects } from './projects';
export { wbsItems } from './wbs';
export { hubs } from './hubs';
export { budgetLineItems } from './budget';
export { scheduleEntries } from './schedule';
export { tasks } from './tasks';
export { documents } from './documents';
export { actionPlans } from './action_plans';
export { actionPlanTypes, actionPlanTemplates } from './action_plan_types';
export { assets } from './assets';
export { risks, getRisksForProject } from './risks';
export { riskTypes } from './riskTypes';
export { riskTags } from './riskTags';
export { manualRiskItems } from './manualRiskItems';
export { connectedProjects } from './connectedProjects';
export { healthSnapshotsByProject } from './healthSnapshots';
export { riskTypeRules } from './riskTypeRules';
export { approvalTriggers } from './approvalTriggers';

// Stub tools
export { rfis } from './rfis';
export { changeOrders } from './change_orders';
export { bidding } from './bidding';
export { changeEvents } from './change_events';
export { invoicing } from './invoicing';
export { primeContracts } from './prime_contracts';
export { punchList } from './punch_list';
export { specifications, specificationSections } from './specifications';
export { submittals } from './submittals';
export { observations } from './observations';
export { correspondence } from './correspondence';
export { commitments } from './commitments';
export { capitalPlanning } from './capital_planning';
export { fundingSource } from './funding_source';
export { incidents } from './incidents';
export { workHours } from './work_hours';
export { automationRules } from './automationRules';

// Default export for _validation.ts exhaustiveness check
import { account } from './account';
import { activeUser } from './activeUser';
import { users } from './users';
import { projects } from './projects';
import { wbsItems } from './wbs';
import { hubs } from './hubs';
import { budgetLineItems } from './budget';
import { scheduleEntries } from './schedule';
import { tasks } from './tasks';
import { documents } from './documents';
import { actionPlans } from './action_plans';
import { assets } from './assets';

const _default = {
  account,
  activeUser,
  users,
  projects,
  wbsItems,
  hubs,
  budgetLineItems,
  scheduleEntries,
  tasks,
  documents,
  actionPlans,
  assets,
};

export default _default;
