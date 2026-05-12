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

// ─── v7 Tag Model ─────────────────────────────────────────────────────────────

/** Source object types that can carry a RiskTag. */
export type SourceType =
  | 'rfi'
  | 'change_event'
  | 'punch_list'
  | 'submittal'
  | 'correspondence'
  | 'milestone'
  | 'budget_line'
  | 'observation'
  | 'incident'
  | 'manual'; // points to a ManualRiskItem

/** Lifecycle states for a RiskTag. */
export type RiskTagStatus =
  | 'open'
  | 'pending_acceptance'  // manual escalation — PM lacks risk:accept
  | 'pending_approval'    // automatic governance via ApprovalTrigger
  | 'mitigated'
  | 'accepted'
  | 'closed';

/** A RiskTag attaches risk metadata to an existing Procore source object. */
export interface RiskTag {
  id: string;
  /** The type of source object this tag is attached to. */
  sourceType: SourceType;
  /** The id of the source object (rfi id, change_event id, etc.). */
  sourceId: string;
  /** Which project this tag belongs to (denormalized for efficient queries). */
  projectId: string;
  /** References the account-level RiskType template. */
  riskTypeId: string;
  /** 1–5, where 5 = almost certain */
  probability: 1 | 2 | 3 | 4 | 5;
  /** Type-specific impact value (dollar amount, days, severity level, etc.) */
  impact: number;
  /** Schedule impact in days */
  scheduleImpact?: number;
  status: RiskTagStatus;
  /** User responsible for managing this risk. Defaults to source item owner. */
  riskOwner: string; // User id
  responseStrategy?: ResponseStrategy;
  mitigationPlan?: string;
  /** Expected residual impact after mitigation */
  residualImpact?: number;
  /** How this tag was created. */
  origin: 'manual' | 'automated' | 'connected_partner';
  createdBy: string; // User id
  createdAt: Date;
  /** When true, the tag closes automatically when the source item closes. */
  autoCloseOnSourceClose: boolean;
}

/** ManualRiskItem — escape hatch for risks with no source Procore object. */
export interface ManualRiskItem {
  id: string;
  projectId: string;
  title: string;
  description: string;
  riskTypeId: string;
  probability: 1 | 2 | 3 | 4 | 5;
  impact: number;
  status: RiskTagStatus;
  riskOwner: string; // User id
  responseStrategy?: ResponseStrategy;
  mitigationPlan?: string;
  residualImpact?: number;
  origin: 'manual';
  createdBy: string;
  createdAt: Date;
}

// ─── v7 Automation & Governance ───────────────────────────────────────────────

/** Defines conditions for a SourceFilter (used in RiskTypeRule). */
export interface SourceFilter {
  field: string;
  operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq' | 'contains';
  value: number | string;
}

/** Automated tagging rule — fires when source items match the filter. */
export interface RiskTypeRule {
  id: string;
  riskTypeId: string;
  sourceType: SourceType;
  filter: SourceFilter;
  defaultProbability: 1 | 2 | 3 | 4 | 5;
  /** Numeric impact value, or 'inherit_from_source' to copy from source item. */
  defaultImpact: number | 'inherit_from_source';
  /** If true, creates a tag automatically. If false, surfaces as a signal for review. */
  autoCreate: boolean;
}

/** Triggers the existing Procore Workflows tool when a tag crosses a threshold. */
export interface ApprovalTrigger {
  id: string;
  riskTypeId: string;
  condition: SourceFilter;
  workflowId: string;
  onTrigger: 'pending_approval';
}

// ─── v7 Procore Connect ───────────────────────────────────────────────────────

export interface ConnectedDimensionData {
  status: HealthScore;
  forecastStatus: HealthScore;
  trend: HealthTrend;
  delta?: number;
}

export interface ConnectedRiskExposure {
  openCount: number;
  totalExpectedImpact: number;
  highSeverityCount: number;
}

/** Pre-aggregated health data from a GC's Procore account via Procore Connect. */
export interface ConnectedProjectHealth {
  sourceAccountId: string;
  sourceAccountName: string;
  sourceProjectId: string;
  ownerProjectId: string;
  shareLevel: 'summary' | 'detail';
  dimensions: Partial<Record<string, ConnectedDimensionData>>;
  riskExposure: Partial<Record<string, ConnectedRiskExposure>>;
  syncedAt: Date;
  source: 'procore-connect';
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
  /** v7: Automated tagging rules for this type. */
  taggingRules: RiskTypeRule[];
  /** v7: Approval workflow triggers for this type. */
  approvalTriggers: ApprovalTrigger[];
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
  /** Dimension-specific numeric fields for trend KPIs. */
  numericFields?: {
    // Cost dimension
    ftc?: number;
    cac?: number;
    contingencyRemaining?: number;
    pctBilled?: number;
    pctComplete?: number;
    // Schedule dimension
    criticalPathVarianceDays?: number;
    submittalAgingCount?: number;
    // Safety dimension
    openIncidentCount?: number;
    nearMissCount?: number;
    oshaRate?: number;
  };
}

// ─── Incidents ────────────────────────────────────────────────────────────────

export type IncidentType = 'injury' | 'near_miss' | 'property_damage' | 'environmental' | 'security' | 'other';
export type IncidentSeverity = 'minor' | 'moderate' | 'serious' | 'critical';
export type OshaCategory = 'fatality' | 'days_away' | 'restricted_work' | 'medical_treatment' | 'first_aid' | 'other';

export interface Incident {
  id: string;
  projectId: string;
  incidentNumber: string;
  dateOccurred: Date;
  dateReported: Date;
  incidentType: IncidentType;
  severity: IncidentSeverity;
  oshaRecordable: boolean;
  oshaCategory?: OshaCategory | null;
  description: string;
  injuredPersonId?: string | null;
  bodyPart?: string | null;
  daysAwayFromWork?: number | null;
  linkedSubcontractorId?: string | null;
  linkedTradeId?: string | null;
  rootCause?: string | null;
  contributingFactors?: string[];
  costEstimate?: number | null;
  status: 'open' | 'under_investigation' | 'closed';
}

// ─── Work Hours ───────────────────────────────────────────────────────────────

export interface WorkHours {
  projectId: string;
  weekStarting: Date;
  totalHoursWorked: number;
  headcount: number;
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
  /** How this risk record was created: manually logged or generated by an automated signal. */
  origin: 'manual' | 'automated';
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
  visualization: VisualizationMode[];
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
