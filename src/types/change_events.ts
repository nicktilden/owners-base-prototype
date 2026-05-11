/**
 * CHANGE EVENT TYPES
 */

export type ChangeEventStatus = 'Open' | 'Closed' | 'Pending' | 'Void';

export type ChangeEventOrigin =
  | 'Correspondence'
  | 'Meetings'
  | 'Observations'
  | 'RFIs';

export type ChangeEventType =
  | 'Allowance'
  | 'Back Charged'
  | 'Contingency'
  | 'Lump Sum'
  | 'Owner Change'
  | 'TBD'
  | 'Transfer';

export type ChangeEventChangeReason =
  | 'Allowance'
  | 'Back Charge'
  | 'Client Request'
  | 'Code Compliance'
  | 'Design Development'
  | 'Direct Cost'
  | 'Drawing Discrepancy'
  | 'Existing Condition'
  | 'ODP - Owner Directive Purchase'
  | 'Owner Directive'
  | 'SOV Modification'
  | 'Unforeseen Field Condition';

export type ChangeEventScope = 'In Scope' | 'Out of Scope' | 'TBD';

export type UnitOfMeasureCode =
  // Time
  | 'days' | 'hours' | 'months' | 'weeks' | 'years'
  // Amount
  | 'ea' | 'fh' | 'ls' | 'wd'
  // Length
  | 'in_dia' | 'lf' | 'm' | 'mm'
  // Area
  | 'm2' | 'sf' | 'sy'
  // Volume
  | 'cf' | 'cy' | 'm3'
  // Mass
  | 'kg' | 'lbs' | 'sta' | 't' | 'ton';

export interface ChangeEventLineItem {
  id: string;
  changeEventId: string;

  // Details
  budgetCode: string;            // links to WBS / budget code
  description: string;
  vendor: string | null;         // vendor name
  contractId: string | null;     // links to prime contract
  unitOfMeasure: UnitOfMeasureCode | null;

  // Revenue
  revenueQuantity: number | null;
  revenueUnitCost: number | null;
  // revenue = revenueQuantity × revenueUnitCost (computed at runtime)

  // Cost
  costQuantity: number | null;
  costUnitCost: number | null;
  // costROM = costQuantity × costUnitCost (computed at runtime)

  // Budget
  budgetQuantity: number | null;
  budgetUnitCost: number | null;
  // budgetROM = budgetQuantity × budgetUnitCost (computed at runtime)
}

export interface ChangeEvent {
  id: string;
  accountId: string;
  projectId: string;

  number: number;
  title: string;
  status: ChangeEventStatus;
  origin: ChangeEventOrigin;
  type: ChangeEventType;
  changeReason: ChangeEventChangeReason;
  scope: ChangeEventScope;

  // Revenue flag
  expectingRevenue: boolean;
  primeContractId: string | null;  // prime contract for markup estimates

  // Content
  description: string;

  // Line items
  lineItems: ChangeEventLineItem[];

  // Computed summary (sourced from lineItems, stored for perf)
  currentEstimate: number | null;

  // Legacy / Health engine field
  cause: string;                   // maps to healthRiskEngine CECause

  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Computed helpers ─────────────────────────────────────────────────────────

export function calcLineItemRevenue(item: ChangeEventLineItem): number {
  return (item.revenueQuantity ?? 0) * (item.revenueUnitCost ?? 0);
}

export function calcLineItemCostROM(item: ChangeEventLineItem): number {
  return (item.costQuantity ?? 0) * (item.costUnitCost ?? 0);
}

export function calcLineItemBudgetROM(item: ChangeEventLineItem): number {
  return (item.budgetQuantity ?? 0) * (item.budgetUnitCost ?? 0);
}
