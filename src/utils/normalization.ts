/**
 * NORMALIZATION LAYER
 * Resolves raw project + connection data into a flat, typed struct
 * where every field carries its value, source classification, and completeness flag.
 *
 * Data source resolution order:
 *   connected (ProjectConnection) > seed (project fields) > unavailable
 *
 * Risk Records are normalized separately: each carries origin ('manual' | 'automated')
 * and a completeness check (title + probability required).
 *
 * healthEngine.ts consumes NormalizedProjectData instead of accessing
 * project / connection fields directly.
 */

import type { Project } from '@/types/project';
import type { ProjectConnection } from '@/data/procoreConnect';
import type { Risk } from '@/types/health';

// ─── Types ────────────────────────────────────────────────────────────────────

export type DataSource = 'connected' | 'seed' | 'unavailable';

export interface NormalizedField<T> {
  value: T | null;
  source: DataSource;
  sourceLabel: string;
  isComplete: boolean;
}

export interface NormalizedRisk {
  risk: Risk;
  origin: 'manual' | 'automated';
  isComplete: boolean;
}

export interface NormalizedProjectData {
  // ── Cost
  budgetVariancePct:      NormalizedField<number>;
  contingencyPct:         NormalizedField<number>;
  pendingChangeEventCount: NormalizedField<number>;
  pendingChangeEventValue: NormalizedField<number>;
  forecastAtCompletionOverPct: NormalizedField<number>;
  forecastToCompleteValue: NormalizedField<number>;
  costAtCompletionPct:    NormalizedField<number>;
  costAtCompletionValue:  NormalizedField<number>;

  // ── Schedule
  scheduleVarianceDays:   NormalizedField<number>;
  milestoneCompletionRate: NormalizedField<number>;

  // ── Delivery
  overdueRFICount:        NormalizedField<number>;
  overdueSubmittalCount:  NormalizedField<number>;
  invoiceOverdueDays:     NormalizedField<number>;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function field<T>(value: T | null, source: DataSource, sourceLabel: string): NormalizedField<T> {
  return { value, source, sourceLabel, isComplete: value != null };
}

function unavailable<T>(reason?: string): NormalizedField<T> {
  return { value: null, source: 'unavailable', sourceLabel: reason ?? 'No data source', isComplete: false };
}

// ─── Main normalizer ──────────────────────────────────────────────────────────

export function normalizeProjectData(
  project: Project,
  connection?: ProjectConnection,
): NormalizedProjectData {
  // Connected source label (reused below)
  const connLabel = connection ? `Procore Connect · ${connection.upstream.company}` : '';

  // ── Budget Variance ──────────────────────────────────────────────────────────
  let budgetVariancePct: NormalizedField<number>;
  if (connection) {
    const { varianceToBudget, revisedContractValue } = connection.counts.cost;
    const pct = revisedContractValue > 0 ? (varianceToBudget / revisedContractValue) * 100 : 0;
    budgetVariancePct = field(pct, 'connected', connLabel);
  } else if (project.budgetVariancePct != null) {
    budgetVariancePct = field(project.budgetVariancePct, 'seed', 'Budget module');
  } else {
    budgetVariancePct = unavailable('No budget data');
  }

  // ── Remaining Contingency ────────────────────────────────────────────────────
  let contingencyPct: NormalizedField<number>;
  if (connection) {
    const { revisedContractValue, contingencyRemaining } = connection.counts.cost;
    const pct = revisedContractValue > 0 ? (contingencyRemaining / revisedContractValue) * 100 : 0;
    contingencyPct = field(pct, 'connected', connLabel);
  } else if (project.contingencyPct != null) {
    contingencyPct = field(project.contingencyPct, 'seed', 'Budget module');
  } else {
    contingencyPct = unavailable('No contingency data');
  }

  // ── Change Events ────────────────────────────────────────────────────────────
  let pendingChangeEventCount: NormalizedField<number>;
  let pendingChangeEventValue: NormalizedField<number>;
  if (connection) {
    const { pending, totalPendingValue } = connection.counts.changeOrders;
    pendingChangeEventCount = field(pending, 'connected', connLabel);
    pendingChangeEventValue = field(totalPendingValue, 'connected', connLabel);
  } else if (project.pendingChangeEventCount != null) {
    pendingChangeEventCount = field(project.pendingChangeEventCount, 'seed', 'Change Events module');
    pendingChangeEventValue = unavailable();
  } else {
    pendingChangeEventCount = unavailable('No change event data');
    pendingChangeEventValue = unavailable();
  }

  // ── Forecast to Complete / Cost at Completion ────────────────────────────────
  let forecastAtCompletionOverPct: NormalizedField<number>;
  let forecastToCompleteValue: NormalizedField<number>;
  let costAtCompletionPct: NormalizedField<number>;
  let costAtCompletionValue: NormalizedField<number>;
  if (connection) {
    const { forecastAtCompletion, revisedContractValue, actualCostToDate } = connection.counts.cost;
    const overPct = revisedContractValue > 0
      ? ((forecastAtCompletion - revisedContractValue) / revisedContractValue) * 100
      : 0;
    forecastAtCompletionOverPct = field(Math.max(0, overPct), 'connected', connLabel);
    forecastToCompleteValue = field(forecastAtCompletion - actualCostToDate, 'connected', connLabel);
    costAtCompletionPct = field(Math.max(0, overPct), 'connected', connLabel);
    costAtCompletionValue = field(forecastAtCompletion, 'connected', connLabel);
  } else if (project.budgetVariancePct != null && project.estimatedBudget) {
    const v = project.budgetVariancePct;
    const estimatedFAC = project.estimatedBudget * (1 + v / 100);
    const ftc = estimatedFAC - project.estimatedBudget * 0.6; // rough 60% spend estimate
    forecastAtCompletionOverPct = field(Math.max(0, v), 'seed', 'Budget module (estimated)');
    forecastToCompleteValue = field(ftc, 'seed', 'Budget module (estimated)');
    costAtCompletionPct = field(Math.max(0, v), 'seed', 'Budget module (estimated)');
    costAtCompletionValue = field(estimatedFAC, 'seed', 'Budget module (estimated)');
  } else {
    forecastAtCompletionOverPct = unavailable();
    forecastToCompleteValue = unavailable();
    costAtCompletionPct = unavailable();
    costAtCompletionValue = unavailable();
  }

  // ── Schedule Variance ────────────────────────────────────────────────────────
  let scheduleVarianceDays: NormalizedField<number>;
  if (connection) {
    scheduleVarianceDays = field(connection.counts.schedule.daysVariance, 'connected', connLabel);
  } else if (project.scheduleVarianceDays != null) {
    scheduleVarianceDays = field(project.scheduleVarianceDays, 'seed', 'Schedule module');
  } else {
    scheduleVarianceDays = unavailable('No schedule data');
  }

  // ── Milestone Completion Rate ────────────────────────────────────────────────
  let milestoneCompletionRate: NormalizedField<number>;
  if (connection) {
    const onTime = connection.counts.schedule.milestonesOnTime;
    const total = Math.max(onTime, Math.round(onTime / Math.max(connection.counts.schedule.percentComplete / 100, 0.1)));
    const pct = total > 0 ? (onTime / total) * 100 : 100;
    milestoneCompletionRate = field(pct, 'connected', connLabel);
  } else if (project.milestoneCompletionRate != null) {
    milestoneCompletionRate = field(project.milestoneCompletionRate, 'seed', 'Schedule module');
  } else {
    milestoneCompletionRate = unavailable('No schedule data');
  }

  // ── RFIs ─────────────────────────────────────────────────────────────────────
  let overdueRFICount: NormalizedField<number>;
  if (connection) {
    overdueRFICount = field(connection.counts.rfis.overdue, 'connected', connLabel);
  } else if (project.overdueRFICount != null) {
    overdueRFICount = field(project.overdueRFICount, 'seed', 'RFIs module');
  } else {
    overdueRFICount = unavailable('No RFI data');
  }

  // ── Submittals ───────────────────────────────────────────────────────────────
  let overdueSubmittalCount: NormalizedField<number>;
  if (connection) {
    overdueSubmittalCount = field(connection.counts.submittals.overdue, 'connected', connLabel);
  } else if (project.overdueSubmittalCount != null) {
    overdueSubmittalCount = field(project.overdueSubmittalCount, 'seed', 'Submittals module');
  } else {
    overdueSubmittalCount = unavailable('No submittal data');
  }

  // ── Invoice ──────────────────────────────────────────────────────────────────
  let invoiceOverdueDays: NormalizedField<number>;
  if (connection) {
    invoiceOverdueDays = field(connection.counts.invoicing.overdueDays, 'connected', connLabel);
  } else if (project.invoiceOverdueDays != null) {
    invoiceOverdueDays = field(project.invoiceOverdueDays, 'seed', 'Invoicing module');
  } else {
    invoiceOverdueDays = unavailable('No invoice data');
  }

  return {
    budgetVariancePct,
    contingencyPct,
    pendingChangeEventCount,
    pendingChangeEventValue,
    forecastAtCompletionOverPct,
    forecastToCompleteValue,
    costAtCompletionPct,
    costAtCompletionValue,
    scheduleVarianceDays,
    milestoneCompletionRate,
    overdueRFICount,
    overdueSubmittalCount,
    invoiceOverdueDays,
  };
}

// ─── Risk Record normalizer ───────────────────────────────────────────────────

/**
 * Normalizes a list of Risk records: validates completeness (title + probability required)
 * and preserves the origin field ('manual' | 'automated').
 */
export function normalizeRiskRecords(risks: Risk[]): NormalizedRisk[] {
  return risks.map(risk => ({
    risk,
    origin: risk.origin,
    isComplete: !!(risk.title && risk.probability > 0),
  }));
}
