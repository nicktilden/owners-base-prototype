import type { ToolLevel, ToolCoreActions, ToolSubPages } from './index';
import type { WBSCostCode, WBSCostType, WBSProgram } from '../shared';

/**
 * BUDGET
 * A financial tracking tool available at both portfolio and project levels.
 * Budget line items are always scoped to a project.
 * The portfolio view aggregates line items across all projects.
 *
 * Each line item is identified by a composite WBS code:
 *   {Program.code}.{CostType.code}{CostCode.code}
 *   e.g. 102.999998 → Program=102, CostType=99, CostCode=9998
 *
 * =============================================================================
 * COLUMN REFERENCE
 * =============================================================================
 *
 * SOURCE COLUMNS (stored values — pulled from other tools):
 *
 *   originalBudgetAmount
 *     Entered directly on the budget line item.
 *
 *   approvedCOs
 *     Source: Prime Contracts → Change Orders
 *     Status filter: Approved
 *
 *   budgetChanges
 *     Source: Budget Change Adjustments
 *     Status filter: Approved
 *
 *   committedCosts
 *     Source: Commitments → Purchase Order Contracts (Status: Approved)
 *           + Commitments → Subcontracts (Status: Complete, Approved)
 *           + Change Orders (Status: Approved)
 *
 *   directCosts
 *     Source: Direct Costs
 *     Status filter: Revise and Resubmit, Pending, Approved
 *
 *   pendingCostChanges
 *     Source: Commitments → Purchase Order Contracts (Status: Submitted, Received, Processing, Partially Received)
 *           + Commitments → Subcontracts (Status: Out For Signature)
 *           + Change Orders (Status: Pending - Not Proceeding, Pending - Proceeding,
 *                            Pending - Revised, Pending - In Review,
 *                            Pending - Pricing, Pending - Not Pricing)
 *
 *   subcontractorInvoices
 *     Source: Commitments → Subcontractor Invoices (approved invoices)
 *     Used only in jobToDateCosts calculation.
 *
 *   pendingRisk
 *     Source: Change Events
 *       ROM (Rough Order of Magnitude)
 *       RFQ or Commitment Cost → Without Cost
 *       Non-Commitment Costs → Without Cost
 *       Change Event Status: Pending, Closed, Open
 *       Prime PCO: Without Price, With Price
 *
 * =============================================================================
 * CALCULATED COLUMNS (derived at runtime — not stored):
 *
 *   revisedBudget           = originalBudgetAmount + budgetModifications + approvedCOs
 *   projectedBudget         = revisedBudget + budgetChanges
 *   projectedCosts          = committedCosts + directCosts + pendingCostChanges
 *   jobToDateCosts          = directCosts + subcontractorInvoices
 *   forecastToComplete      = max(0, projectedBudget - projectedCosts)
 *                             (shows 0 if negative)
 *   estimatedCostAtCompl.   = projectedCosts + forecastToComplete
 *   projectedOverUnder      = projectedBudget - estimatedCostAtCompletion
 * =============================================================================
 */

// =============================================================================
// BUDGET LINE ITEM
// =============================================================================

/**
 * BUDGET LINE ITEM
 * A single row in the budget table.
 * Identified by a composite of Program + Cost Type + Cost Code WBS references.
 *
 * Only source values are stored. All calculated columns are derived at runtime.
 */
interface BudgetLineItem {
  id: string;                              // Unique identifier
  accountId: string;                       // Account this item belongs to
  projectId: string;                       // Project this item belongs to (always project-scoped)

  // WBS Classification
  // Composite display code: {program.code}.{costType.code}{costCode.code}
  // e.g. '102.999998' → program='102', costType='99', costCode='9998'
  programCode: WBSProgram['code'];         // Program WBS code
  costTypeCode: WBSCostType['code'];       // Cost Type WBS code
  costCode: WBSCostCode['code'];           // Cost Code WBS code

  // Source monetary fields (USD)
  originalBudgetAmount: number;            // Original approved budget amount — entered directly
  approvedCOs: number;                     // Approved Prime Contract Change Orders
  budgetChanges: number;                   // Approved Budget Change Adjustments
  committedCosts: number;                  // Approved PO Contracts + Subcontracts + Change Orders
  directCosts: number;                     // Direct Costs (Revise and Resubmit, Pending, Approved)
  pendingCostChanges: number;              // Pending PO Contracts + Subcontracts + Change Orders
  subcontractorInvoices: number;           // Approved subcontractor invoices (used in jobToDateCosts)
  pendingRisk: number;                     // Change Events (ROM, RFQ, Non-Commitment, Prime PCO)

  // Calculated fields (derived at runtime — not stored):
  // revisedBudget           = originalBudgetAmount + budgetModifications + approvedCOs
  // projectedBudget         = revisedBudget + budgetChanges
  // projectedCosts          = committedCosts + directCosts + pendingCostChanges
  // jobToDateCosts          = directCosts + subcontractorInvoices
  // forecastToComplete      = max(0, projectedBudget - projectedCosts)
  // estimatedCostAtCompl.   = projectedCosts + forecastToComplete
  // projectedOverUnder      = projectedBudget - estimatedCostAtCompletion

  createdBy: string;                       // User ID of the creator
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// BUDGET TOOL DEFINITION
// =============================================================================

/**
 * BUDGET TOOL
 * The tool definition for Budget, implementing the shared Tool base interface.
 */
interface BudgetTool {
  key: 'budget';
  name: 'Budget';
  level: Extract<ToolLevel, 'both'>;
  description: 'Financial tracking tool for managing project budgets across the full cost lifecycle. Tracks original budget, change orders, committed costs, direct costs, and forecasts. Portfolio view aggregates across all projects.';
  coreActions: ToolCoreActions;
  subPages: ToolSubPages;
}
