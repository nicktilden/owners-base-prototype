/**
 * HEALTH & RISK ENGINE — Use Case Aggregations
 * Functions for Use Cases #2 (Supply Chain), #4 (Financial), #6 (Operations/Safety).
 *
 * All functions are pure — they accept seed data arrays (not context) so they
 * can be called from both server-side and client-side code.
 */

import type { Project } from '@/types/project';
import type { Incident, WorkHours } from '@/types/health';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DateRange {
  from: Date;
  to: Date;
}

export interface VendorPerformance {
  vendorId: string;
  vendorName: string;
  activeSubmittalCount: number;
  lateSubmittalCount: number;
  onTimePercentage: number;
  averageReviewLatencyDays: number;
  trendDirection: 'improving' | 'stable' | 'degrading';
}

export interface CriticalPathSubmittal {
  id: string;
  title: string;
  projectId: string;
  projectName: string;
  status: string;
  responsibleContractor: string;
  leadTimeDays: number | null;
  expectedDeliveryDate: string | null;
  criticalPath: boolean;
  dueDate: string;
  daysInReview: number;
}

export interface ContingencyBurnResult {
  projectId: string;
  contingencyOriginal: number;
  contingencyUsed: number;
  contingencyRemaining: number;
  pctRemaining: number;
  monthlyBurnRate: number;
}

export interface ScheduleCostDivergence {
  projectId: string;
  projectName: string;
  pctComplete: number;
  pctBilled: number;
  divergencePoints: number;
  status: 'green' | 'yellow' | 'red';
}

export interface CEExposureSummary {
  totalPendingCount: number;
  totalExposure: number;
  byProjectId: Record<string, { count: number; exposure: number; oldestDays: number }>;
  byCause: Record<string, number>;
}

export interface CapitalAtRiskResult {
  total: number;
  byCause: Record<string, number>;
  byProject: Record<string, number>;
}

export interface TrendDataPoint {
  label: string;
  value: number;
}

export interface TrendData {
  points: TrendDataPoint[];
  trend: 'improving' | 'stable' | 'worsening';
}

export interface HighRiskActivity {
  id: string;
  projectId: string;
  projectName: string;
  name: string;
  startDate: Date;
  daysUntilStart: number;
  hazardousActivityType: string;
  safetyPlanRequired: boolean;
  safetyPlanCompleted: boolean | null;
  linkedActionPlanId: string | null;
}

// ─── Use Case #2 — Supply Chain ───────────────────────────────────────────────

/**
 * Returns submittals on the critical path, sorted by urgency (days until expected delivery ascending).
 * "Aging" = status is 'Under Review' or 'Revise and Resubmit' with a past dueDate.
 */
export function getCriticalPathSubmittals(
  submittals: any[],
  projects: Project[],
  projectId?: string,
): CriticalPathSubmittal[] {
  const projectMap = new Map(projects.map(p => [p.id, p.name]));
  const today = new Date('2026-05-04');

  return submittals
    .filter(s => {
      if (projectId && s.projectId !== projectId) return false;
      return s.criticalPath === true;
    })
    .map(s => {
      const dueDateObj = s.dueDate ? new Date(s.dueDate.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$1-$2')) : null;
      const daysInReview = dueDateObj
        ? Math.max(0, Math.floor((today.getTime() - dueDateObj.getTime()) / 86400000))
        : 0;
      return {
        id: s.id,
        title: s.title,
        projectId: s.projectId,
        projectName: projectMap.get(s.projectId) ?? s.projectId,
        status: s.status,
        responsibleContractor: s.responsibleContractor,
        leadTimeDays: s.leadTimeDays ?? null,
        expectedDeliveryDate: s.expectedDeliveryDate ?? null,
        criticalPath: s.criticalPath ?? false,
        dueDate: s.dueDate,
        daysInReview,
      };
    })
    .sort((a, b) => b.daysInReview - a.daysInReview);
}

/**
 * Returns vendor performance aggregated from submittal data.
 * Vendors = responsibleContractor values across submittals.
 */
export function getVendorPerformance(submittals: any[]): VendorPerformance[] {
  const today = new Date('2026-05-04');
  const byVendor: Record<string, { total: number; late: number; latencySum: number; recent: number[] }> = {};

  submittals.forEach(s => {
    const vendor = s.responsibleContractor;
    if (!byVendor[vendor]) byVendor[vendor] = { total: 0, late: 0, latencySum: 0, recent: [] };
    byVendor[vendor].total++;

    const dueDateObj = s.dueDate
      ? new Date(s.dueDate.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$1-$2'))
      : null;

    const isLate = dueDateObj && dueDateObj < today && s.status !== 'Approved' && s.status !== 'Void';
    if (isLate) {
      byVendor[vendor].late++;
      const latencyDays = Math.floor((today.getTime() - dueDateObj!.getTime()) / 86400000);
      byVendor[vendor].latencySum += latencyDays;
      byVendor[vendor].recent.push(latencyDays);
    }
  });

  return Object.entries(byVendor).map(([vendor, data]) => ({
    vendorId: vendor.toLowerCase().replace(/\s+/g, '-'),
    vendorName: vendor,
    activeSubmittalCount: data.total,
    lateSubmittalCount: data.late,
    onTimePercentage: data.total > 0 ? Math.round(((data.total - data.late) / data.total) * 100) : 100,
    averageReviewLatencyDays: data.late > 0 ? Math.round(data.latencySum / data.late) : 0,
    trendDirection: (data.late > 2 ? 'degrading' : data.late > 0 ? 'stable' : 'improving') as 'improving' | 'stable' | 'degrading',
  })).sort((a, b) => a.onTimePercentage - b.onTimePercentage);
}

/**
 * Count of submittals past review threshold (dueDate > N days ago and still in review).
 */
export function getSubmittalAgingCount(submittals: any[], thresholdDays = 14): number {
  const today = new Date('2026-05-04');
  return submittals.filter(s => {
    if (s.status !== 'Under Review' && s.status !== 'Revise and Resubmit') return false;
    if (!s.dueDate) return false;
    const due = new Date(s.dueDate.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$1-$2'));
    const daysOver = Math.floor((today.getTime() - due.getTime()) / 86400000);
    return daysOver > thresholdDays;
  }).length;
}

/**
 * Projects with schedule items that have a seasonalConstraint.
 */
export function getSeasonalRiskProjects(scheduleEntries: any[], projects: Project[]): Project[] {
  const projectMap = new Map(projects.map(p => [p.id, p]));
  const withConstraint = new Set<string>();
  scheduleEntries.forEach(e => {
    if (e.seasonalConstraint && e.seasonalConstraint !== null) {
      withConstraint.add(e.projectId);
    }
  });
  return Array.from(withConstraint)
    .map(id => projectMap.get(id))
    .filter(Boolean) as Project[];
}

// ─── Use Case #4 — Financial ──────────────────────────────────────────────────

/**
 * Contingency burn rate for a project.
 */
export function getContingencyBurnRate(project: Project): ContingencyBurnResult {
  const original = project.contingencyOriginal ?? 0;
  const used = project.contingencyUsed ?? 0;
  const remaining = original - used;
  const pctRemaining = original > 0 ? (remaining / original) * 100 : 0;

  // Monthly burn rate: assume 6 months of activity (simplified)
  const monthlyBurnRate = original > 0 ? ((used / original) * 100) / 6 : 0;

  return {
    projectId: project.id,
    contingencyOriginal: original,
    contingencyUsed: used,
    contingencyRemaining: remaining,
    pctRemaining: Math.round(pctRemaining * 10) / 10,
    monthlyBurnRate: Math.round(monthlyBurnRate * 10) / 10,
  };
}

/**
 * Schedule-to-cost divergence for a project.
 * pctComplete is physical progress; pctBilled is financial.
 * Positive divergence = overbilled relative to progress (financial ahead of physical).
 */
export function getScheduleCostDivergence(project: Project): ScheduleCostDivergence {
  const pctComplete = project.pctComplete ?? 0;
  const pctBilled = project.pctBilled ?? 0;
  const divergencePoints = pctBilled - pctComplete;

  let status: 'green' | 'yellow' | 'red' = 'green';
  if (Math.abs(divergencePoints) >= 20) status = 'red';
  else if (Math.abs(divergencePoints) >= 10) status = 'yellow';

  return {
    projectId: project.id,
    projectName: project.name,
    pctComplete,
    pctBilled,
    divergencePoints: Math.round(divergencePoints * 10) / 10,
    status,
  };
}

/**
 * Portfolio-level Capital at Risk: sum of (probability / 5) × impact across open Cost Risk tags.
 */
export function getCapitalAtRisk(riskTags: any[], riskTypes: any[]): CapitalAtRiskResult {
  const costRiskTypeIds = new Set(
    riskTypes.filter((rt: any) => rt.category === 'financial').map((rt: any) => rt.id)
  );

  const openCostTags = riskTags.filter(
    t => costRiskTypeIds.has(t.riskTypeId) && (t.status === 'open' || t.status === 'pending_approval')
  );

  const total = openCostTags.reduce((sum, t) => sum + (t.probability / 5) * t.impact, 0);

  const byCause: Record<string, number> = {};
  const byProject: Record<string, number> = {};
  openCostTags.forEach(t => {
    const expected = (t.probability / 5) * t.impact;
    byProject[t.projectId] = (byProject[t.projectId] ?? 0) + expected;
    const cause = t.cause ?? 'other';
    byCause[cause] = (byCause[cause] ?? 0) + expected;
  });

  return { total: Math.round(total), byCause, byProject };
}

/**
 * Pending Change Event exposure summary across portfolio.
 */
export function getPendingCEExposure(changeEvents: any[]): CEExposureSummary {
  const pending = changeEvents.filter(ce =>
    ['Open', 'Under Review', 'Pending Pricing'].includes(ce.status) && ce.currentEstimate
  );

  const totalExposure = pending.reduce((sum, ce) => sum + (ce.currentEstimate ?? 0), 0);
  const byCause: Record<string, number> = {};
  const byProject: Record<string, { count: number; exposure: number; oldestDays: number }> = {};
  const today = new Date('2026-05-04');

  pending.forEach(ce => {
    const cause = ce.cause ?? 'other';
    byCause[cause] = (byCause[cause] ?? 0) + (ce.currentEstimate ?? 0);

    if (!byProject[ce.projectId]) byProject[ce.projectId] = { count: 0, exposure: 0, oldestDays: 0 };
    byProject[ce.projectId].count++;
    byProject[ce.projectId].exposure += ce.currentEstimate ?? 0;

    if (ce.created) {
      const createdDate = new Date(ce.created.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$1-$2'));
      const ageDays = Math.floor((today.getTime() - createdDate.getTime()) / 86400000);
      byProject[ce.projectId].oldestDays = Math.max(byProject[ce.projectId].oldestDays, ageDays);
    }
  });

  return {
    totalPendingCount: pending.length,
    totalExposure,
    byProjectId: byProject,
    byCause,
  };
}

// ─── Use Case #6 — Operations / Safety ───────────────────────────────────────

/**
 * OSHA recordable rate = (recordableCount × 200,000) / totalHoursWorked.
 */
export function calculateOSHARate(
  incidents: Incident[],
  workHours: WorkHours[],
  projectId?: string,
): number {
  const filteredIncidents = projectId
    ? incidents.filter(i => i.projectId === projectId)
    : incidents;
  const filteredHours = projectId
    ? workHours.filter(w => w.projectId === projectId)
    : workHours;

  const recordableCount = filteredIncidents.filter(i => i.oshaRecordable).length;
  const totalHours = filteredHours.reduce((sum, w) => sum + w.totalHoursWorked, 0);

  if (totalHours === 0) return 0;
  return Math.round(((recordableCount * 200000) / totalHours) * 100) / 100;
}

/**
 * Near-miss trend over trailing 12 months, grouped by month.
 */
export function getNearMissTrend(
  incidents: Incident[],
  projectId?: string,
): TrendData {
  const nearMisses = incidents.filter(i => {
    if (i.incidentType !== 'near_miss') return false;
    if (projectId && i.projectId !== projectId) return false;
    return true;
  });

  // Build monthly buckets for last 12 months
  const today = new Date('2026-05-04');
  const points: TrendDataPoint[] = [];
  for (let m = 11; m >= 0; m--) {
    const d = new Date(today);
    d.setMonth(d.getMonth() - m);
    const yr = d.getFullYear();
    const mo = d.getMonth();
    const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
    const count = nearMisses.filter(i => {
      const io = new Date(i.dateOccurred);
      return io.getFullYear() === yr && io.getMonth() === mo;
    }).length;
    points.push({ label, value: count });
  }

  const recentAvg = points.slice(-3).reduce((s, p) => s + p.value, 0) / 3;
  const earlierAvg = points.slice(0, 3).reduce((s, p) => s + p.value, 0) / 3;
  const trend = recentAvg > earlierAvg * 1.2 ? 'worsening' : recentAvg < earlierAvg * 0.8 ? 'improving' : 'stable';

  return { points, trend };
}

/**
 * Upcoming hazardous schedule activities.
 */
export function getHighRiskActivityHorizon(
  scheduleEntries: any[],
  projects: Project[],
  daysOut = 30,
  projectId?: string,
): HighRiskActivity[] {
  const projectMap = new Map(projects.map(p => [p.id, p.name]));
  const today = new Date('2026-05-04');
  const horizon = new Date(today);
  horizon.setDate(horizon.getDate() + daysOut);

  return scheduleEntries
    .filter(e => {
      if (projectId && e.projectId !== projectId) return false;
      if (!e.hazardousActivityType || e.hazardousActivityType === null) return false;
      const start = new Date(e.startDate);
      return start >= today && start <= horizon;
    })
    .map(e => {
      const start = new Date(e.startDate);
      const daysUntilStart = Math.floor((start.getTime() - today.getTime()) / 86400000);
      return {
        id: e.id,
        projectId: e.projectId,
        projectName: projectMap.get(e.projectId) ?? e.projectId,
        name: e.name,
        startDate: start,
        daysUntilStart,
        hazardousActivityType: e.hazardousActivityType,
        safetyPlanRequired: e.safetyPlanRequired ?? false,
        safetyPlanCompleted: e.safetyPlanCompleted ?? null,
        linkedActionPlanId: e.linkedActionPlanId ?? null,
      };
    })
    .sort((a, b) => a.daysUntilStart - b.daysUntilStart);
}

/**
 * Total dollar cost estimate of open incidents.
 */
export function getIncidentCostExposure(incidents: Incident[], projectId?: string): number {
  return incidents
    .filter(i => {
      if (projectId && i.projectId !== projectId) return false;
      return i.status !== 'closed' && i.costEstimate;
    })
    .reduce((sum, i) => sum + (i.costEstimate ?? 0), 0);
}

/**
 * Portfolio contingency burn rate across all projects with contingency data.
 */
export function getPortfolioContingencyStatus(projects: Project[]): {
  avgPctRemaining: number;
  criticalProjects: string[];
  status: 'green' | 'yellow' | 'red';
} {
  const withData = projects.filter(p => p.contingencyOriginal !== undefined);
  if (!withData.length) return { avgPctRemaining: 100, criticalProjects: [], status: 'green' };

  const pcts = withData.map(p => {
    const orig = p.contingencyOriginal ?? 0;
    const used = p.contingencyUsed ?? 0;
    return orig > 0 ? ((orig - used) / orig) * 100 : 100;
  });

  const avgPctRemaining = pcts.reduce((s, v) => s + v, 0) / pcts.length;
  const criticalProjects = withData
    .filter((p, i) => pcts[i] < 15)
    .map(p => p.id);

  const status: 'green' | 'yellow' | 'red' =
    avgPctRemaining < 15 ? 'red' : avgPctRemaining < 35 ? 'yellow' : 'green';

  return { avgPctRemaining: Math.round(avgPctRemaining), criticalProjects, status };
}
