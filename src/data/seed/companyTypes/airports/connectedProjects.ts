import type { ConnectedProjectHealth } from '@/types/health';

export const connectedProjects: ConnectedProjectHealth[] = [
  // proj-001: Terminal 1 (shared by Turner Construction — detail level, cost pressure)
  {
    sourceAccountId: 'ca-001',
    sourceAccountName: 'Turner Construction Company',
    sourceProjectId: 'turner-proj-0294',
    ownerProjectId: 'proj-001',
    shareLevel: 'detail',
    dimensions: {
      composite: {
        status: 'yellow',
        forecastStatus: 'yellow',
        trend: 'stable',
        delta: -1,
      },
      budget: {
        status: 'yellow',
        forecastStatus: 'red',
        trend: 'degrading',
        delta: -2,
      },
      schedule: {
        status: 'yellow',
        forecastStatus: 'yellow',
        trend: 'stable',
        delta: 0,
      },
      quality: {
        status: 'green',
        forecastStatus: 'green',
        trend: 'stable',
        delta: 0,
      },
    },
    riskExposure: {
      financial: {
        openCount: 4,
        totalExpectedImpact: 8200000,
        highSeverityCount: 2,
      },
      schedule: {
        openCount: 3,
        totalExpectedImpact: 56,
        highSeverityCount: 1,
      },
    },
    syncedAt: new Date('2026-05-13T08:30:00'),
    source: 'procore-connect',
  },
  // proj-004: TBIT Expansion (shared by Hensel Phelps — summary level, critical)
  {
    sourceAccountId: 'ca-002',
    sourceAccountName: 'Hensel Phelps Construction',
    sourceProjectId: 'henselphelps-proj-0158',
    ownerProjectId: 'proj-004',
    shareLevel: 'summary',
    dimensions: {
      composite: {
        status: 'red',
        forecastStatus: 'red',
        trend: 'degrading',
        delta: -3,
      },
      budget: {
        status: 'red',
        forecastStatus: 'red',
        trend: 'degrading',
        delta: -3,
      },
      schedule: {
        status: 'yellow',
        forecastStatus: 'red',
        trend: 'degrading',
        delta: -2,
      },
      quality: {
        status: 'yellow',
        forecastStatus: 'yellow',
        trend: 'stable',
        delta: 0,
      },
    },
    riskExposure: {
      financial: {
        openCount: 6,
        totalExpectedImpact: 42000000,
        highSeverityCount: 3,
      },
      schedule: {
        openCount: 4,
        totalExpectedImpact: 120,
        highSeverityCount: 2,
      },
    },
    syncedAt: new Date('2026-05-13T10:15:00'),
    source: 'procore-connect',
  },
];
