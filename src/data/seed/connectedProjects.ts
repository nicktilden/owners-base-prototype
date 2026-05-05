/**
 * CONNECTED PROJECTS SEED DATA
 * Pre-aggregated ConnectedProjectHealth objects from GC Procore accounts via Procore Connect.
 * proj-007 → Meridian Construction Group (detail share, Healthy)
 * proj-005 → Apex Building Partners (summary share, At Risk)
 */

import type { ConnectedProjectHealth } from '@/types/health';

export const connectedProjects: ConnectedProjectHealth[] = [
  // proj-007: St. Francis Hospital — ED Modernization (Healthy, shared by Meridian at detail level)
  {
    sourceAccountId: 'ca-001',
    sourceAccountName: 'Meridian Construction Group',
    sourceProjectId: 'meridian-proj-0048',
    ownerProjectId: 'proj-007',
    shareLevel: 'detail',
    dimensions: {
      composite: {
        status: 'green',
        forecastStatus: 'green',
        trend: 'stable',
        delta: 0,
      },
      budget: {
        status: 'green',
        forecastStatus: 'green',
        trend: 'stable',
        delta: 0,
      },
      schedule: {
        status: 'green',
        forecastStatus: 'yellow',
        trend: 'stable',
        delta: -1,
      },
      quality: {
        status: 'green',
        forecastStatus: 'green',
        trend: 'improving',
        delta: 1,
      },
    },
    riskExposure: {
      financial: {
        openCount: 1,
        totalExpectedImpact: 45000,
        highSeverityCount: 0,
      },
      schedule: {
        openCount: 2,
        totalExpectedImpact: 12,
        highSeverityCount: 0,
      },
    },
    syncedAt: new Date('2026-04-30T14:22:00'),
    source: 'procore-connect',
  },
  // proj-005: Loyola Medical Campus — Behavioral Health Facility (At Risk, shared by Apex at summary level)
  {
    sourceAccountId: 'ca-002',
    sourceAccountName: 'Apex Building Partners',
    sourceProjectId: 'apex-proj-0112',
    ownerProjectId: 'proj-005',
    shareLevel: 'summary',
    dimensions: {
      composite: {
        status: 'yellow',
        forecastStatus: 'red',
        trend: 'degrading',
        delta: -2,
      },
    },
    riskExposure: {
      financial: {
        openCount: 4,
        totalExpectedImpact: 380000,
        highSeverityCount: 2,
      },
    },
    syncedAt: new Date('2026-04-30T09:05:00'),
    source: 'procore-connect',
  },
];
