/**
 * BUDGET TYPES
 */

export interface BudgetLineItem {
  id: string;
  accountId: string;
  projectId: string;
  programCode: string;
  costTypeCode: string;
  costCode: string;
  originalBudgetAmount: number;
  approvedCOs: number;
  budgetChanges: number;
  committedCosts: number;
  directCosts: number;
  pendingCostChanges: number;
  subcontractorInvoices: number;
  pendingRisk: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Calculated columns (derived at runtime — never stored)
export interface BudgetCalculated {
  revisedBudget: number;           // originalBudgetAmount + budgetModifications + approvedCOs
  projectedBudget: number;         // revisedBudget + budgetChanges
  projectedCosts: number;          // committedCosts + directCosts + pendingCostChanges
  jobToDateCosts: number;          // directCosts + subcontractorInvoices
  forecastToComplete: number;      // max(0, projectedBudget - projectedCosts)
  estimatedCostAtCompletion: number; // projectedCosts + forecastToComplete
  projectedOverUnder: number;      // projectedBudget - estimatedCostAtCompletion
}

export function calculateBudget(item: BudgetLineItem): BudgetCalculated {
  const revisedBudget = item.originalBudgetAmount + item.approvedCOs;
  const projectedBudget = revisedBudget + item.budgetChanges;
  const projectedCosts = item.committedCosts + item.directCosts + item.pendingCostChanges;
  const jobToDateCosts = item.directCosts + item.subcontractorInvoices;
  const forecastToComplete = Math.max(0, projectedBudget - projectedCosts);
  const estimatedCostAtCompletion = projectedCosts + forecastToComplete;
  const projectedOverUnder = projectedBudget - estimatedCostAtCompletion;
  return {
    revisedBudget,
    projectedBudget,
    projectedCosts,
    jobToDateCosts,
    forecastToComplete,
    estimatedCostAtCompletion,
    projectedOverUnder,
  };
}
