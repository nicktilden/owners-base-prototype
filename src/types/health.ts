/**
 * HEALTH & RISK TYPES
 * KPI-driven health scoring model. Individual KPIs feed into a composite score.
 * Designed to be generic across account types (Owner, GC, Specialty).
 */

// ─── Status & Score ───────────────────────────────────────────────────────────

export type KPIStatus = 'green' | 'yellow' | 'red' | 'unavailable';
export type HealthScore = 'green' | 'yellow' | 'red';
export type HealthTrend = 'improving' | 'stable' | 'degrading';
export type DataSourceType = 'connected' | 'own' | 'seed' | 'unavailable';
export type SignalOrigin = 'automated' | 'manual' | 'mixed';

/** Human-readable labels for each HealthScore, per v5 vocabulary. */
export const HEALTH_LABELS: Record<HealthScore, string> = {
  green:  'Healthy',
  yellow: 'At Risk',
  red:    'Critical',
};

// ─── KPI Keys ────────────────────────────────────────────────────────────────

export type KPIKey =
  | 'budgetVariance'
  | 'remainingContingency'
  | 'changeEvents'
  | 'forecastToComplete'
  | 'costAtCompletion'
  | 'scheduleStatus'
  | 'milestoneRate'
  | 'scheduleVariance'
  | 'aggregateRisk'
  | 'rfisAtRisk'
  | 'submittalsAtRisk'
  | 'invoiceStatus'
  // Portfolio-level scorecard KPIs
  | 'avgRiskSeverity'
  | 'financialExposure'
  | 'openRiskCount';

export type KPICategory = 'cost' | 'schedule' | 'delivery' | 'risk';

export const KPI_CATEGORY_MAP: Record<KPIKey, KPICategory> = {
  budgetVariance:       'cost',
  remainingContingency: 'cost',
  changeEvents:         'cost',
  forecastToComplete:   'cost',
  costAtCompletion:     'cost',
  scheduleStatus:       'schedule',
  milestoneRate:        'schedule',
  scheduleVariance:     'schedule',
  aggregateRisk:        'risk',
  rfisAtRisk:           'delivery',
  submittalsAtRisk:     'delivery',
  invoiceStatus:        'delivery',
  avgRiskSeverity:      'risk',
  financialExposure:    'cost',
  openRiskCount:        'risk',
};

export const KPI_LABELS: Record<KPIKey, string> = {
  budgetVariance:       'Budget vs. Forecast Variance',
  remainingContingency: 'Remaining Contingency',
  changeEvents:         'Pending Change Events',
  forecastToComplete:   'Forecast to Complete (FTC)',
  costAtCompletion:     'Cost at Completion (CAC)',
  scheduleStatus:       'Schedule Status',
  milestoneRate:        'Milestone Completion Rate',
  scheduleVariance:     'Schedule Variance',
  aggregateRisk:        'Aggregate Risk Score',
  rfisAtRisk:           'RFIs at Risk',
  submittalsAtRisk:     'Submittals at Risk',
  invoiceStatus:        'Invoice Approval Status',
  avgRiskSeverity:      'Average Risk Severity',
  financialExposure:    'Financial Exposure',
  openRiskCount:        'Open Risk Count',
};

export const KPI_DESCRIPTIONS: Record<KPIKey, string> = {
  budgetVariance:       'Average % variance between approved budget and current forecast across active projects',
  remainingContingency: 'Average contingency remaining as a % of total budget across active projects',
  changeEvents:         'Total pending change events awaiting approval across active projects',
  forecastToComplete:   'Aggregate remaining cost to complete all active projects vs original estimate',
  costAtCompletion:     'Projected total spend at completion vs approved contract value',
  scheduleStatus:       'Average days behind schedule baseline across active projects',
  milestoneRate:        'Percentage of scheduled milestones completed on time across active projects',
  scheduleVariance:     'Average schedule variance in days across active projects',
  aggregateRisk:        'Total open high-probability risks (probability ≥ 4) across active projects',
  rfisAtRisk:           'Total overdue RFIs across active projects',
  submittalsAtRisk:     'Total overdue submittals across active projects',
  invoiceStatus:        'Average days overdue for outstanding invoice approvals',
  avgRiskSeverity:      'Mean severity score (1–5) across all open risks, combining probability and maximum impact',
  financialExposure:    'Total at-risk dollar exposure from budget variances across projects that are over budget',
  openRiskCount:        'Total number of open risks across all active projects',
};

// ─── Thresholds ───────────────────────────────────────────────────────────────

export interface KPIThreshold {
  /** Value at or beyond which status turns yellow */
  yellow: number;
  /** Value at or beyond which status turns red */
  red: number;
}

export const DEFAULT_THRESHOLDS: Record<KPIKey, KPIThreshold> = {
  budgetVariance:       { yellow: 5,   red: 10  },  // % over budget
  remainingContingency: { yellow: 10,  red: 5   },  // % remaining (lower = worse)
  changeEvents:         { yellow: 3,   red: 7   },  // pending count
  forecastToComplete:   { yellow: 5,   red: 10  },  // % over original
  costAtCompletion:     { yellow: 5,   red: 10  },  // % over budget
  scheduleStatus:       { yellow: 14,  red: 30  },  // days behind
  milestoneRate:        { yellow: 80,  red: 60  },  // % on time (lower = worse)
  scheduleVariance:     { yellow: 14,  red: 30  },  // days behind
  aggregateRisk:        { yellow: 3,   red: 7   },  // open high-prob risk count
  rfisAtRisk:           { yellow: 3,   red: 7   },  // overdue count
  submittalsAtRisk:     { yellow: 5,   red: 10  },  // overdue count
  invoiceStatus:        { yellow: 7,   red: 21  },  // overdue days
  avgRiskSeverity:      { yellow: 3,   red: 4   },  // 1–5 severity scale (higher = worse)
  financialExposure:    { yellow: 5,   red: 15  },  // $M total exposure (higher = worse)
  openRiskCount:        { yellow: 10,  red: 20  },  // total open risks (higher = worse)
};

// ─── Integrity ────────────────────────────────────────────────────────────────

export interface IntegrityResult {
  isComplete: boolean;
  missingFields: string[];
  issueType: 'config' | 'data' | null;
  resolutionPath: string | null;
  /** Whether the score is derived from automated tool data, manual Risk Records, or both. */
  signalOrigin: SignalOrigin;
}

// ─── Risk Types (account-level templates) ─────────────────────────────────────

export type RiskTypeCategory = 'financial' | 'schedule' | 'safety' | 'quality' | 'regulatory' | 'environmental' | 'contractual' | 'other';

/** Procore tool or data source that feeds signals into a Risk Type. */
export type RiskTypeSource = 'budget' | 'schedule' | 'rfis' | 'submittals' | 'change_events' | 'observations' | 'inspections' | 'punch_list' | 'action_plans';

export interface RiskType {
  id: string;
  label: string;
  description: string;
  category: RiskTypeCategory;
  /** Procore tools / data sources that signal this risk type. */
  sourceData: RiskTypeSource[];
  /** Which hub KPIs this risk type feeds into (by KPIKey). */
  linkedKpiKeys: KPIKey[];
  /** Default response strategies suggested when creating a risk of this type. */
  defaultResponseStrategies: ResponseStrategy[];
  /** Whether this is a Procore-shipped default (false = customer-created). */
  isDefault: boolean;
  /** Whether this risk type is hidden from the portfolio risk register. */
  isHidden: boolean;
}

// ─── KPI Result ───────────────────────────────────────────────────────────────

export interface KPIResult {
  key: KPIKey;
  label: string;
  category: KPICategory;
  status: KPIStatus;
  /** Human-readable current value (e.g. "+8.2%" or "21 days behind") */
  displayValue: string;
  /** Raw numeric value used for threshold comparison */
  numericValue: number | null;
  threshold: KPIThreshold;
  weight: number;
  dataSource: DataSourceType;
  /** e.g. "Procore Connect · Turner Construction" or "Own data" */
  sourceLabel: string;
  reasons: string[];
  integrity: IntegrityResult;
}

// ─── Health Snapshot (sparkline history) ─────────────────────────────────────

export interface HealthSnapshot {
  date: string;   // ISO date string YYYY-MM-DD
  score: HealthScore;
}

// ─── Risk Records ─────────────────────────────────────────────────────────────

export type RiskStatus = 'identified' | 'assessed' | 'mitigated' | 'closed';
export type RiskCategory = 'financial' | 'schedule' | 'safety' | 'contractual' | 'regulatory' | 'environmental';
export type ResponseStrategy = 'mitigate' | 'transfer' | 'accept' | 'avoid';

export interface Risk {
  id: string;
  projectId: string;
  category: RiskCategory;
  title: string;
  description: string;
  /** 1–5, where 5 = almost certain */
  probability: 1 | 2 | 3 | 4 | 5;
  /** 1–5, where 5 = catastrophic */
  impactCost: 1 | 2 | 3 | 4 | 5;
  impactSchedule: 1 | 2 | 3 | 4 | 5;
  impactSafety: 1 | 2 | 3 | 4 | 5;
  responseStrategy: ResponseStrategy;
  status: RiskStatus;
  dueDate: string | null;
  /** How this risk record was created: manually logged or promoted from an automated signal. */
  origin: 'manual' | 'promoted';
}

// ─── Portfolio Summary ────────────────────────────────────────────────────────

export interface PortfolioHealthSummary {
  totalProjects: number;
  green: number;
  yellow: number;
  red: number;
  unavailable: number;
  trend: HealthTrend;
}

// ─── Full Health Result ───────────────────────────────────────────────────────

export interface HealthResult {
  compositeScore: HealthScore;
  forecastScore: HealthScore;
  trend: HealthTrend;
  kpis: KPIResult[];
  risks: Risk[];
  history: HealthSnapshot[];
  dataAsOf: string;
  integrity: IntegrityResult;
}

// ─── Account Config ───────────────────────────────────────────────────────────

export type HealthTemplate = 'standard' | 'capital' | 'government' | 'energy';

export interface AccountHealthConfig {
  template: HealthTemplate;
  activeKPIs: KPIKey[];
  kpiWeights: Partial<Record<KPIKey, number>>;
  thresholds: Partial<Record<KPIKey, KPIThreshold>>;
  /** Project IDs included in portfolio health scope (empty = all) */
  scopedProjectIds: string[];
  /** Custom KPI cards created via the KPI Creation Wizard */
  customKPIs?: CustomKPICard[];
}

// ─── Custom KPI Cards (wizard output) ────────────────────────────────────────

export type CalcType = 'Count' | 'Sum' | 'Average' | 'Ratio' | 'Variance' | 'Trend';
export type VisualizationMode = 'card' | 'table-column' | 'sparkline';

export interface CustomKPICard {
  id: string;
  name: string;
  dataSource: string;
  calcType: CalcType;
  filters: Record<string, string>;
  thresholds: KPIThreshold;
  visualization: VisualizationMode;
  /** Placeholder computed value shown in the hub */
  placeholderValue: string;
  placeholderStatus: KPIStatus;
}

// ─── Starter Templates ────────────────────────────────────────────────────────

export const HEALTH_TEMPLATES: Record<HealthTemplate, {
  label: string;
  description: string;
  activeKPIs: KPIKey[];
  kpiWeights: Partial<Record<KPIKey, number>>;
}> = {
  standard: {
    label: 'Standard Commercial',
    description: 'Cost, schedule, and delivery risk. Moderate thresholds.',
    activeKPIs: ['budgetVariance', 'remainingContingency', 'changeEvents', 'scheduleStatus', 'scheduleVariance', 'rfisAtRisk', 'submittalsAtRisk'],
    kpiWeights: {
      budgetVariance: 20, remainingContingency: 10, changeEvents: 10,
      scheduleStatus: 20, scheduleVariance: 15,
      rfisAtRisk: 15, submittalsAtRisk: 10,
    },
  },
  capital: {
    label: 'Capital Program / Infrastructure',
    description: 'Cost, schedule, and delivery. Tighter thresholds. PMI-aligned.',
    activeKPIs: ['budgetVariance', 'remainingContingency', 'changeEvents', 'forecastToComplete', 'costAtCompletion', 'scheduleStatus', 'milestoneRate', 'scheduleVariance', 'aggregateRisk', 'rfisAtRisk', 'submittalsAtRisk'],
    kpiWeights: {
      budgetVariance: 15, remainingContingency: 10, changeEvents: 5, forecastToComplete: 5, costAtCompletion: 5,
      scheduleStatus: 15, milestoneRate: 10, scheduleVariance: 10,
      aggregateRisk: 10, rfisAtRisk: 10, submittalsAtRisk: 5,
    },
  },
  government: {
    label: 'Government / Public Agency',
    description: 'Strict thresholds. ISO 31000 / PMI-aligned. Invoice tracking on.',
    activeKPIs: ['budgetVariance', 'remainingContingency', 'changeEvents', 'forecastToComplete', 'scheduleStatus', 'milestoneRate', 'scheduleVariance', 'aggregateRisk', 'rfisAtRisk', 'submittalsAtRisk', 'invoiceStatus'],
    kpiWeights: {
      budgetVariance: 15, remainingContingency: 10, changeEvents: 10, forecastToComplete: 5,
      scheduleStatus: 15, milestoneRate: 10, scheduleVariance: 10,
      aggregateRisk: 10, rfisAtRisk: 5, submittalsAtRisk: 5, invoiceStatus: 5,
    },
  },
  energy: {
    label: 'Energy / Utilities',
    description: 'Safety and schedule weighted heavily. Environmental tracking.',
    activeKPIs: ['budgetVariance', 'remainingContingency', 'changeEvents', 'scheduleStatus', 'scheduleVariance', 'aggregateRisk', 'rfisAtRisk', 'invoiceStatus'],
    kpiWeights: {
      budgetVariance: 15, remainingContingency: 10, changeEvents: 5,
      scheduleStatus: 20, scheduleVariance: 15,
      aggregateRisk: 20, rfisAtRisk: 10, invoiceStatus: 5,
    },
  },
};
