/**
 * HEALTH ENGINE
 * Calculates KPI-driven health scores for projects.
 *
 * Data resolution is delegated to normalization.ts.
 * This module only handles: scoring, thresholds, KPI assembly, and result construction.
 *
 * Entry points:
 *   resolveKPIs()           → KPIResult[] for a single project
 *   computeCompositeScore() → HealthScore from KPIResult[]
 *   buildHealthResult()     → full HealthResult for a project
 *   buildPortfolioSummary() → portfolio-level rollup
 */

import type { Project } from '@/types/project';
import type { ProjectConnection } from '@/data/procoreConnect';
import type {
  KPIKey,
  KPIResult,
  KPIStatus,
  KPIThreshold,
  HealthScore,
  HealthTrend,
  HealthResult,
  IntegrityResult,
  AccountHealthConfig,
  PortfolioHealthSummary,
  Risk,
  SignalOrigin,
  ManualRiskItem,
  RiskTag,
  ConnectedProjectHealth,
} from '@/types/health';
import {
  DEFAULT_THRESHOLDS,
  KPI_CATEGORY_MAP,
  KPI_LABELS,
  KPI_DESCRIPTIONS,
} from '@/types/health';
import { normalizeProjectData, type NormalizedField, type NormalizedProjectData } from './normalization';

// ─── Threshold helpers ────────────────────────────────────────────────────────

function resolveThreshold(key: KPIKey, config: AccountHealthConfig): KPIThreshold {
  return config.thresholds[key] ?? DEFAULT_THRESHOLDS[key];
}

/** Scores a metric where HIGHER values are WORSE (e.g. budget overrun, days late). */
function scoreHigherWorse(value: number, threshold: KPIThreshold): KPIStatus {
  if (value >= threshold.red)    return 'red';
  if (value >= threshold.yellow) return 'yellow';
  return 'green';
}

/** Scores a metric where LOWER values are WORSE (e.g. contingency %, milestone rate). */
function scoreLowerWorse(value: number, threshold: KPIThreshold): KPIStatus {
  if (value <= threshold.red)    return 'red';
  if (value <= threshold.yellow) return 'yellow';
  return 'green';
}

function noData(): IntegrityResult {
  return { isComplete: false, missingFields: [], issueType: 'data', resolutionPath: 'Connect a data source or enter values manually in project settings.', signalOrigin: 'manual' };
}

function ok(): IntegrityResult {
  return { isComplete: true, missingFields: [], issueType: null, resolutionPath: null, signalOrigin: 'automated' };
}

/** Build KPI partial from a NormalizedField using scoreHigherWorse. */
function fromFieldHigher(
  f: NormalizedField<number>,
  threshold: KPIThreshold,
  displayFn: (v: number) => string,
  reasonFn: (v: number, status: KPIStatus, t: KPIThreshold) => string[],
): Omit<KPIResult, 'key' | 'label' | 'category' | 'weight' | 'threshold'> {
  if (!f.isComplete || f.value == null) {
    return { status: 'unavailable', displayValue: '—', numericValue: null, dataSource: 'unavailable', sourceLabel: f.sourceLabel, reasons: [], integrity: noData() };
  }
  const status = scoreHigherWorse(f.value, threshold);
  return {
    status,
    displayValue: displayFn(f.value),
    numericValue: f.value,
    dataSource: f.source,
    sourceLabel: f.sourceLabel,
    reasons: status !== 'green' ? reasonFn(f.value, status, threshold) : [],
    integrity: ok(),
  };
}

/** Build KPI partial from a NormalizedField using scoreLowerWorse. */
function fromFieldLower(
  f: NormalizedField<number>,
  threshold: KPIThreshold,
  displayFn: (v: number) => string,
  reasonFn: (v: number, status: KPIStatus, t: KPIThreshold) => string[],
): Omit<KPIResult, 'key' | 'label' | 'category' | 'weight' | 'threshold'> {
  if (!f.isComplete || f.value == null) {
    return { status: 'unavailable', displayValue: '—', numericValue: null, dataSource: 'unavailable', sourceLabel: f.sourceLabel, reasons: [], integrity: noData() };
  }
  const status = scoreLowerWorse(f.value, threshold);
  return {
    status,
    displayValue: displayFn(f.value),
    numericValue: f.value,
    dataSource: f.source,
    sourceLabel: f.sourceLabel,
    reasons: status !== 'green' ? reasonFn(f.value, status, threshold) : [],
    integrity: ok(),
  };
}

// ─── Individual KPI evaluators — consume NormalizedProjectData ────────────────

function evalBudgetVariance(n: NormalizedProjectData, threshold: KPIThreshold) {
  return fromFieldHigher(
    { ...n.budgetVariancePct, value: n.budgetVariancePct.value != null ? Math.abs(n.budgetVariancePct.value) : null },
    threshold,
    v => `${(n.budgetVariancePct.value ?? 0) >= 0 ? '+' : ''}${(n.budgetVariancePct.value ?? 0).toFixed(1)}%`,
    (v, _, t) => [`Budget variance of ${v.toFixed(1)}% ${v >= t.red ? 'exceeds red' : 'exceeds yellow'} threshold (${t.yellow}%)`],
  );
}

function evalRemainingContingency(n: NormalizedProjectData, threshold: KPIThreshold) {
  return fromFieldLower(
    n.contingencyPct,
    threshold,
    v => `${v.toFixed(1)}%`,
    (v, _, t) => [`Only ${v.toFixed(1)}% contingency remaining (threshold: ${t.yellow}%)`],
  );
}

function evalChangeEvents(n: NormalizedProjectData, threshold: KPIThreshold) {
  const f = n.pendingChangeEventCount;
  if (!f.isComplete || f.value == null) {
    return { status: 'unavailable' as const, displayValue: '—', numericValue: null, dataSource: 'unavailable' as const, sourceLabel: f.sourceLabel, reasons: ['Change event data not connected'], integrity: noData() };
  }
  const status = scoreHigherWorse(f.value, threshold);
  const valM = n.pendingChangeEventValue.value != null ? ` ($${(n.pendingChangeEventValue.value / 1_000_000).toFixed(1)}M)` : '';
  return {
    status,
    displayValue: `${f.value} pending${valM}`,
    numericValue: f.value,
    dataSource: f.source,
    sourceLabel: f.sourceLabel,
    reasons: status !== 'green' ? [`${f.value} pending change events awaiting approval${valM}`] : [],
    integrity: ok(),
  };
}

function evalFTC(n: NormalizedProjectData, threshold: KPIThreshold) {
  const overPct = n.forecastAtCompletionOverPct;
  const ftcVal = n.forecastToCompleteValue;
  if (!overPct.isComplete || overPct.value == null) {
    return { status: 'unavailable' as const, displayValue: '—', numericValue: null, dataSource: 'unavailable' as const, sourceLabel: overPct.sourceLabel, reasons: [], integrity: noData() };
  }
  const status = scoreHigherWorse(overPct.value, threshold);
  const display = ftcVal.value != null ? `$${(ftcVal.value / 1_000_000).toFixed(1)}M remaining` : `${overPct.value.toFixed(1)}% over budget`;
  return {
    status,
    displayValue: display,
    numericValue: overPct.value,
    dataSource: overPct.source,
    sourceLabel: overPct.sourceLabel,
    reasons: status !== 'green' ? [`Forecast at completion trending ${overPct.value.toFixed(1)}% over contract`] : [],
    integrity: ok(),
  };
}

function evalCAC(n: NormalizedProjectData, threshold: KPIThreshold) {
  const pct = n.costAtCompletionPct;
  const val = n.costAtCompletionValue;
  if (!pct.isComplete || pct.value == null) {
    return { status: 'unavailable' as const, displayValue: '—', numericValue: null, dataSource: 'unavailable' as const, sourceLabel: pct.sourceLabel, reasons: [], integrity: noData() };
  }
  const status = scoreHigherWorse(pct.value, threshold);
  const display = val.value != null ? `$${(val.value / 1_000_000).toFixed(1)}M` : `${pct.value.toFixed(1)}% over`;
  return {
    status,
    displayValue: display,
    numericValue: pct.value,
    dataSource: pct.source,
    sourceLabel: pct.sourceLabel,
    reasons: status !== 'green' ? [`Cost at completion ${pct.value.toFixed(1)}% over revised contract`] : [],
    integrity: ok(),
  };
}

function evalScheduleStatus(n: NormalizedProjectData, threshold: KPIThreshold) {
  const f = n.scheduleVarianceDays;
  if (!f.isComplete || f.value == null) {
    return { status: 'unavailable' as const, displayValue: '—', numericValue: null, dataSource: 'unavailable' as const, sourceLabel: f.sourceLabel, reasons: [], integrity: noData() };
  }
  const v = f.value;
  const status = scoreHigherWorse(Math.max(0, v), threshold);
  const label = v === 0 ? 'On Schedule' : v > 0 ? `${v}d Behind` : `${Math.abs(v)}d Ahead`;
  return {
    status,
    displayValue: label,
    numericValue: Math.max(0, v),
    dataSource: f.source,
    sourceLabel: f.sourceLabel,
    reasons: status !== 'green' ? [`Schedule is ${v} days behind plan (threshold: ${threshold.yellow}d)`] : [],
    integrity: ok(),
  };
}

function evalMilestoneRate(n: NormalizedProjectData, threshold: KPIThreshold) {
  return fromFieldLower(
    n.milestoneCompletionRate,
    threshold,
    v => `${v.toFixed(0)}% on time`,
    (v, _, t) => [`Only ${v.toFixed(0)}% of milestones on time (threshold: ${t.yellow}%)`],
  );
}

function evalScheduleVariance(n: NormalizedProjectData, threshold: KPIThreshold) {
  return evalScheduleStatus(n, threshold);
}

function evalAggregateRisk(
  _n: NormalizedProjectData,
  threshold: KPIThreshold,
  risks: Risk[],
  riskTags: RiskTag[] = [],
  manualRisks: ManualRiskItem[] = [],
) {
  const legacyOpen = risks.filter(r => r.status !== 'closed' && r.status !== 'mitigated' && r.probability >= 4);
  const tagOpen = riskTags.filter(t => t.status !== 'closed' && t.status !== 'mitigated' && t.status !== 'accepted' && t.probability >= 4);
  const manualOpen = manualRisks.filter(m => m.status !== 'closed' && m.status !== 'mitigated' && m.status !== 'accepted' && m.probability >= 4);
  const count = legacyOpen.length + tagOpen.length + manualOpen.length;
  const total = risks.length + riskTags.length + manualRisks.length;
  const status = scoreHigherWorse(count, threshold);
  return {
    status,
    displayValue: `${count} open high-prob risk${count !== 1 ? 's' : ''}`,
    numericValue: count,
    dataSource: (total > 0 ? 'seed' : 'unavailable') as 'seed' | 'unavailable',
    sourceLabel: 'Risk Register',
    reasons: status !== 'green' ? [`${count} open high-probability risks identified`] : [],
    integrity: total > 0 ? ok() : noData(),
  };
}

function evalRFIsAtRisk(n: NormalizedProjectData, threshold: KPIThreshold) {
  return fromFieldHigher(
    n.overdueRFICount,
    threshold,
    v => `${v} overdue`,
    (v, _, t) => [`${v} RFIs are overdue (threshold: ${t.yellow})`],
  );
}

function evalSubmittalsAtRisk(n: NormalizedProjectData, threshold: KPIThreshold) {
  return fromFieldHigher(
    n.overdueSubmittalCount,
    threshold,
    v => `${v} overdue`,
    (v, _, t) => [`${v} submittals overdue (threshold: ${t.yellow})`],
  );
}

function evalInvoiceStatus(n: NormalizedProjectData, threshold: KPIThreshold) {
  const f = n.invoiceOverdueDays;
  if (!f.isComplete || f.value == null) {
    return { status: 'unavailable' as const, displayValue: '—', numericValue: null, dataSource: 'unavailable' as const, sourceLabel: f.sourceLabel, reasons: [], integrity: noData() };
  }
  const v = f.value;
  const status = scoreHigherWorse(v, threshold);
  return {
    status,
    displayValue: v > 0 ? `${v}d overdue` : 'Current',
    numericValue: v,
    dataSource: f.source,
    sourceLabel: f.sourceLabel,
    reasons: status !== 'green' ? [`Invoice is ${v} days overdue`] : [],
    integrity: ok(),
  };
}

// ─── Portfolio-level KPI aggregators ─────────────────────────────────────────

/**
 * Aggregates per-project KPI numeric values into a single portfolio-level KPIResult.
 * Used by the Risk KPIs scorecard to show portfolio rollups from the canonical health engine.
 *
 * Strategy per key:
 *   - Higher-worse counts/days: sum across projects
 *   - Higher-worse percentages: average across projects
 *   - Lower-worse percentages: average across projects
 *   - avgRiskSeverity: mean severity score across all open risks
 *   - financialExposure: total $M of over-budget variance
 *   - openRiskCount: total open risks
 */
export function aggregatePortfolioKPIs(
  projectResults: Array<{ kpis: KPIResult[]; risks: Risk[] }>,
  config: AccountHealthConfig,
): KPIResult[] {
  const allRisks = projectResults.flatMap(r => r.risks);

  // Collect all KPI keys that appear in any project
  const allKeys = new Set<KPIKey>();
  projectResults.forEach(r => r.kpis.forEach(k => allKeys.add(k.key)));

  return Array.from(allKeys).map(key => {
    const threshold = config.thresholds[key] ?? DEFAULT_THRESHOLDS[key];
    const weight = config.kpiWeights[key] ?? 0;
    const label = KPI_LABELS[key];
    const category = KPI_CATEGORY_MAP[key];

    // ── Portfolio-only keys computed directly from risk data ──────────────────
    if (key === 'avgRiskSeverity') {
      const openRisks = allRisks.filter(r => r.status !== 'closed' && r.status !== 'mitigated');
      if (openRisks.length === 0) {
        return { key, label, category, weight, threshold, status: 'unavailable' as KPIStatus, displayValue: '—', numericValue: null, dataSource: 'unavailable' as const, sourceLabel: 'Risk Register', reasons: [], integrity: noData() };
      }
      const scores = openRisks.map(r => (r.probability + Math.max(r.impactCost, r.impactSchedule, r.impactSafety)) / 2);
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      const status = scoreHigherWorse(avg, threshold);
      return { key, label, category, weight, threshold, status, displayValue: `${avg.toFixed(1)}/5`, numericValue: avg, dataSource: 'seed' as const, sourceLabel: 'Risk Register', reasons: status !== 'green' ? [`Average risk severity of ${avg.toFixed(1)}/5 exceeds threshold`] : [], integrity: ok() };
    }

    if (key === 'financialExposure') {
      const exposureM = projectResults.reduce((sum, { kpis }) => {
        const bv = kpis.find(k => k.key === 'budgetVariance');
        if (bv?.numericValue != null && bv.numericValue > 0) return sum + bv.numericValue;
        return sum;
      }, 0);
      if (exposureM === 0 && projectResults.every(r => r.kpis.find(k => k.key === 'budgetVariance')?.status === 'unavailable')) {
        return { key, label, category, weight, threshold, status: 'unavailable' as KPIStatus, displayValue: '—', numericValue: null, dataSource: 'unavailable' as const, sourceLabel: 'Budget', reasons: [], integrity: noData() };
      }
      const status = scoreHigherWorse(exposureM, threshold);
      return { key, label, category, weight, threshold, status, displayValue: `$${exposureM.toFixed(0)}M`, numericValue: exposureM, dataSource: 'seed' as const, sourceLabel: 'Budget', reasons: status !== 'green' ? [`$${exposureM.toFixed(0)}M total financial exposure across portfolio`] : [], integrity: ok() };
    }

    if (key === 'openRiskCount') {
      const openRisks = allRisks.filter(r => r.status !== 'closed' && r.status !== 'mitigated');
      const count = openRisks.length;
      const status = scoreHigherWorse(count, threshold);
      return { key, label, category, weight, threshold, status, displayValue: `${count}`, numericValue: count, dataSource: allRisks.length > 0 ? 'seed' as const : 'unavailable' as const, sourceLabel: 'Risk Register', reasons: status !== 'green' ? [`${count} open risks across portfolio`] : [], integrity: allRisks.length > 0 ? ok() : noData() };
    }

    // ── Standard keys: aggregate per-project KPI results ─────────────────────
    const perProject = projectResults
      .flatMap(r => r.kpis)
      .filter(k => k.key === key && k.status !== 'unavailable' && k.numericValue != null);

    if (perProject.length === 0) {
      return { key, label, category, weight, threshold, status: 'unavailable' as KPIStatus, displayValue: '—', numericValue: null, dataSource: 'unavailable' as const, sourceLabel: 'Multiple', reasons: [], integrity: noData() };
    }

    const values = perProject.map(k => k.numericValue as number);

    // Sum-type keys: change events, RFIs, submittals, aggregate risk
    const SUM_KEYS: KPIKey[] = ['changeEvents', 'rfisAtRisk', 'submittalsAtRisk', 'aggregateRisk', 'openRiskCount'];
    // Lower-worse keys (averages)
    const LOWER_WORSE_KEYS: KPIKey[] = ['remainingContingency', 'milestoneRate'];

    let aggValue: number;
    let displayValue: string;

    if (SUM_KEYS.includes(key)) {
      aggValue = values.reduce((a, b) => a + b, 0);
      displayValue = key === 'milestoneRate' ? `${aggValue.toFixed(0)}%` : `${aggValue}`;
    } else {
      aggValue = values.reduce((a, b) => a + b, 0) / values.length;
      // Format based on key type
      if (key === 'milestoneRate' || key === 'remainingContingency') {
        displayValue = `${aggValue.toFixed(0)}%`;
      } else if (key === 'budgetVariance' || key === 'forecastToComplete' || key === 'costAtCompletion') {
        displayValue = `${aggValue >= 0 ? '+' : ''}${aggValue.toFixed(1)}%`;
      } else if (key === 'scheduleStatus' || key === 'scheduleVariance') {
        displayValue = aggValue > 0 ? `${aggValue.toFixed(0)}d behind` : `${Math.abs(aggValue).toFixed(0)}d ahead`;
      } else if (key === 'invoiceStatus') {
        displayValue = aggValue > 0 ? `${aggValue.toFixed(0)}d overdue` : 'Current';
      } else {
        displayValue = aggValue.toFixed(1);
      }
    }

    const status = LOWER_WORSE_KEYS.includes(key)
      ? scoreLowerWorse(aggValue, threshold)
      : scoreHigherWorse(aggValue, threshold);

    const sourceLabel = perProject[0]?.sourceLabel ?? 'Multiple';

    return {
      key, label, category, weight, threshold, status,
      displayValue,
      numericValue: aggValue,
      dataSource: 'seed' as const,
      sourceLabel: `${sourceLabel} · ${perProject.length} projects`,
      reasons: status !== 'green' ? [`Portfolio aggregate: ${displayValue}`] : [],
      integrity: ok(),
    };
  });
}

// ─── Primary: resolveKPIs ─────────────────────────────────────────────────────
export function resolveKPIs(
  project: Project,
  config: AccountHealthConfig,
  connection?: ProjectConnection,
  risks: Risk[] = [],
  riskTags: RiskTag[] = [],
  manualRisks: ManualRiskItem[] = [],
): KPIResult[] {
  // Normalize raw data once; eval functions consume NormalizedProjectData
  const n = normalizeProjectData(project, connection);

  return config.activeKPIs.map((key) => {
    const threshold = resolveThreshold(key, config);
    const weight = config.kpiWeights[key] ?? 0;

    let partial: Omit<KPIResult, 'key' | 'label' | 'category' | 'weight' | 'threshold'>;

    switch (key) {
      case 'budgetVariance':       partial = evalBudgetVariance(n, threshold); break;
      case 'remainingContingency': partial = evalRemainingContingency(n, threshold); break;
      case 'changeEvents':         partial = evalChangeEvents(n, threshold); break;
      case 'forecastToComplete':   partial = evalFTC(n, threshold); break;
      case 'costAtCompletion':     partial = evalCAC(n, threshold); break;
      case 'scheduleStatus':       partial = evalScheduleStatus(n, threshold); break;
      case 'milestoneRate':        partial = evalMilestoneRate(n, threshold); break;
      case 'scheduleVariance':     partial = evalScheduleVariance(n, threshold); break;
      case 'aggregateRisk':        partial = evalAggregateRisk(n, threshold, risks, riskTags, manualRisks); break;
      case 'rfisAtRisk':           partial = evalRFIsAtRisk(n, threshold); break;
      case 'submittalsAtRisk':     partial = evalSubmittalsAtRisk(n, threshold); break;
      case 'invoiceStatus':        partial = evalInvoiceStatus(n, threshold); break;
      // Portfolio-level keys: not meaningful per-project, return unavailable
      case 'avgRiskSeverity':
      case 'financialExposure':
      case 'openRiskCount':
        partial = { status: 'unavailable', displayValue: '—', numericValue: null, dataSource: 'unavailable', sourceLabel: 'Portfolio only', reasons: [], integrity: noData() }; break;
      default:                     partial = { status: 'unavailable', displayValue: '—', numericValue: null, dataSource: 'unavailable', sourceLabel: 'Unknown KPI', reasons: [], integrity: noData() };
    }

    return {
      key,
      label: KPI_LABELS[key],
      category: KPI_CATEGORY_MAP[key],
      weight,
      threshold,
      ...partial,
    };
  });
}

// ─── computeCompositeScore ────────────────────────────────────────────────────

export function computeCompositeScore(kpis: KPIResult[]): HealthScore {
  const scoreable = kpis.filter(k => k.status !== 'unavailable');
  if (scoreable.length === 0) return 'green';
  if (scoreable.some(k => k.status === 'red')) return 'red';
  if (scoreable.some(k => k.status === 'yellow')) return 'yellow';
  return 'green';
}

// ─── computeForecastScore ─────────────────────────────────────────────────────

/**
 * Derives the forward-looking forecast score from open high-probability risks.
 * A project that is currently green but has 3+ high-probability risks → forecast yellow.
 * 5+ high-probability risks or any probability-5 risk → forecast red.
 */
export function computeForecastScore(
  currentScore: HealthScore,
  risks: Risk[] = [],
  riskTags: RiskTag[] = [],
  manualRisks: ManualRiskItem[] = [],
): HealthScore {
  const legacyOpen = risks.filter(r =>
    r.status !== 'closed' && r.status !== 'mitigated' && r.probability >= 4
  );
  const tagOpen = riskTags.filter(t =>
    t.status !== 'closed' && t.status !== 'mitigated' && t.status !== 'accepted' && t.probability >= 4
  );
  const manualOpen = manualRisks.filter(m =>
    m.status !== 'closed' && m.status !== 'mitigated' && m.status !== 'accepted' && m.probability >= 4
  );

  const allHighProb = [...legacyOpen, ...tagOpen, ...manualOpen];
  const criticalRisk = legacyOpen.some(r => r.probability === 5 && (r.impactCost >= 4 || r.impactSchedule >= 4))
    || tagOpen.some(t => t.probability === 5 && t.impact >= 4)
    || manualOpen.some(m => m.probability === 5 && m.impact >= 4);

  if (criticalRisk || allHighProb.length >= 5) {
    return currentScore === 'green' ? 'yellow' : 'red';
  }
  if (allHighProb.length >= 3) {
    return currentScore === 'green' ? 'yellow' : currentScore;
  }
  return currentScore;
}

// ─── computeTrend ─────────────────────────────────────────────────────────────

export function computeTrend(history: Array<{ score: HealthScore }>): HealthTrend {
  if (history.length < 3) return 'stable';
  const scoreOrder: Record<HealthScore, number> = { green: 0, yellow: 1, red: 2 };
  const recent = history.slice(-3).map(h => scoreOrder[h.score]);
  const first = recent[0];
  const last = recent[recent.length - 1];
  if (last < first) return 'improving';
  if (last > first) return 'degrading';
  return 'stable';
}

// ─── buildHealthResult ────────────────────────────────────────────────────────

export function buildHealthResult(
  project: Project,
  config: AccountHealthConfig,
  connection?: ProjectConnection,
  risks: Risk[] = [],
  riskTags: RiskTag[] = [],
  manualRisks: ManualRiskItem[] = [],
  connectData?: ConnectedProjectHealth,
  currentDate: Date = new Date(),
): HealthResult {
  // Connected projects: use pre-aggregated data from GC account — bypass normalization
  if (connectData) {
    const compositeScore: HealthScore = (connectData.dimensions?.['composite']?.status as HealthScore) ?? 'green';
    const forecastScore: HealthScore = (connectData.dimensions?.['composite']?.forecastStatus as HealthScore) ?? compositeScore;
    const trend: HealthTrend = connectData.dimensions?.['composite']?.trend ?? 'stable';

    return {
      compositeScore,
      forecastScore,
      trend,
      kpis: [],
      risks: [],
      history: project.healthHistory ?? [],
      dataAsOf: connectData.syncedAt.toISOString(),
      integrity: {
        isComplete: true,
        missingFields: [],
        issueType: null,
        resolutionPath: null,
        signalOrigin: 'automated',
      },
    };
  }

  const kpis = resolveKPIs(project, config, connection, risks, riskTags, manualRisks);
  const compositeScore = computeCompositeScore(kpis);
  const forecastScore = computeForecastScore(compositeScore, risks, riskTags, manualRisks);
  const history = project.healthHistory ?? [];
  const trend = computeTrend(history);

  const allUnavailable = kpis.every(k => k.status === 'unavailable');
  const someUnavailable = kpis.some(k => k.status === 'unavailable');
  const missingFields = kpis.filter(k => k.status === 'unavailable').map(k => k.label);

  const hasConnected = kpis.some(k => k.dataSource === 'connected');
  const hasManual = kpis.some(k => k.dataSource === 'seed' || k.dataSource === 'own') || risks.length > 0 || riskTags.length > 0;
  const signalOrigin: SignalOrigin = hasConnected && hasManual ? 'mixed' : hasConnected ? 'automated' : 'manual';

  const integrity: IntegrityResult = {
    isComplete: !someUnavailable,
    missingFields,
    issueType: allUnavailable ? 'data' : someUnavailable ? 'data' : null,
    resolutionPath: someUnavailable ? 'Connect data sources in Account Settings → Health & Risk → KPIs.' : null,
    signalOrigin,
  };

  return {
    compositeScore,
    forecastScore,
    trend,
    kpis,
    risks,
    history,
    dataAsOf: currentDate.toISOString(),
    integrity,
  };
}

// ─── buildPortfolioSummary ────────────────────────────────────────────────────

export function buildPortfolioSummary(
  results: Array<{ score: HealthScore; history: Array<{ score: HealthScore }> }>,
): PortfolioHealthSummary {
  const counts = { green: 0, yellow: 0, red: 0, unavailable: 0 };
  results.forEach(r => { counts[r.score] = (counts[r.score] ?? 0) + 1; });

  // Portfolio trend = majority trend direction
  const trends = results.map(r => computeTrend(r.history));
  const degrading = trends.filter(t => t === 'degrading').length;
  const improving = trends.filter(t => t === 'improving').length;
  const trend: HealthTrend = degrading > improving ? 'degrading' : improving > degrading ? 'improving' : 'stable';

  return {
    totalProjects: results.length,
    green: counts.green,
    yellow: counts.yellow,
    red: counts.red,
    unavailable: counts.unavailable,
    trend,
  };
}
