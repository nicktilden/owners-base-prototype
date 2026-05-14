/**
 * COMPANY TYPE ACTIVE-TYPE RESOLVER
 * Reads the active company type from localStorage (at module init) and
 * re-exports all seed data from the matching dataset directory.
 *
 * Uses a static import map so webpack bundles all datasets at build time —
 * only one dataset's exports are actually used at runtime.
 *
 * All dataset export names are identical to the original /src/data/seed/*
 * exports so AppProviders and all consumers need no further changes.
 */

import type { CompanyType } from '@/types/companyType';
import { COMPANY_TYPE_CONFIGS } from './registry';

// ─── Static import map (webpack bundles all at build time) ───────────────────
import * as healthcareDataset from './healthcare';
import * as multiFamilyResidentialDataset from './multiFamilyResidential';
import * as retailDataset from './retail';
import * as officeDataset from './office';
import * as dataCenterDataset from './dataCenter';
import * as utilitiesDataset from './utilities';
import * as educationDataset from './education';
import * as renewablesDataset from './renewables';
import * as airportsDataset from './airports';
import * as corporateRealEstateDataset from './corporateRealEstate';

const DATASETS: Record<CompanyType, typeof healthcareDataset> = {
  healthcare: healthcareDataset,
  multiFamilyResidential: multiFamilyResidentialDataset,
  retail: retailDataset,
  office: officeDataset,
  dataCenter: dataCenterDataset,
  utilities: utilitiesDataset,
  education: educationDataset,
  renewables: renewablesDataset,
  airports: airportsDataset,
  corporateRealEstate: corporateRealEstateDataset,
};

// ─── Active type resolution ───────────────────────────────────────────────────
const STORAGE_KEY = 'owner_prototype_company_type';
const DEFAULT_TYPE: CompanyType = 'healthcare';

function getActiveType(): CompanyType {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored in COMPANY_TYPE_CONFIGS) return stored as CompanyType;
  }
  return DEFAULT_TYPE;
}

export const activeType = getActiveType();
const ds = DATASETS[activeType];

// ─── Named re-exports (all consumers import from here unchanged) ──────────────
export const account = ds.account;
export const users = ds.users;
export const activeUser = ds.activeUser;
export const projects = ds.projects;
export const wbsItems = ds.wbsItems;
export const hubs = ds.hubs;
export const budgetLineItems = ds.budgetLineItems;
export const scheduleEntries = ds.scheduleEntries;
export const tasks = ds.tasks;
export const documents = ds.documents;
export const actionPlans = ds.actionPlans;
export const actionPlanTypes = ds.actionPlanTypes ?? [];
export const actionPlanTemplates = ds.actionPlanTemplates ?? [];
export const assets = ds.assets;
export const risks = ds.risks ?? [];
export const riskTypes = ds.riskTypes ?? [];
export const riskTags = ds.riskTags ?? [];
export const manualRiskItems = ds.manualRiskItems ?? [];
export const connectedProjects = ds.connectedProjects ?? [];
export const healthSnapshotsByProject = ds.healthSnapshotsByProject ?? {};
export const riskTypeRules = ds.riskTypeRules ?? [];
export const approvalTriggers = ds.approvalTriggers ?? [];
export const connectedAccounts = ds.connectedAccounts ?? [];

// Stub tools
export const rfis = ds.rfis ?? [];
export const changeOrders = ds.changeOrders ?? [];
export const bidding = ds.bidding ?? [];
export const changeEvents = ds.changeEvents ?? [];
export const invoicing = ds.invoicing ?? [];
export const primeContracts = ds.primeContracts ?? [];
export const punchList = ds.punchList ?? [];
export const specifications = ds.specifications ?? [];
export const specificationSections = ds.specificationSections ?? [];
export const submittals = ds.submittals ?? [];
export const observations = ds.observations ?? [];
export const correspondence = ds.correspondence ?? [];
export const commitments = ds.commitments ?? [];
export const capitalPlanning = ds.capitalPlanning ?? [];
export const fundingSource = ds.fundingSource ?? [];
export const incidents = ds.incidents ?? [];
export const workHours = ds.workHours ?? [];
export const automationRules = ds.automationRules ?? [];
