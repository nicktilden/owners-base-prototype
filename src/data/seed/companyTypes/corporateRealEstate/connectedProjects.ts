import type { ConnectedProjectHealth } from '@/types/health';

export const connectedProjects: ConnectedProjectHealth[] = [
  // proj-001: Bellevue Building 3 (shared by Skanska — detail level, CO dispute yellow/red budget)
  {
    sourceAccountId: 'ca-001',
    sourceAccountName: 'Skanska USA',
    sourceProjectId: 'skanska-proj-1142',
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
        totalExpectedImpact: 4200000,
        highSeverityCount: 1,
      },
      schedule: {
        openCount: 2,
        totalExpectedImpact: 38,
        highSeverityCount: 1,
      },
    },
    syncedAt: new Date('2026-05-13T08:45:00'),
    source: 'procore-connect',
  },
  // proj-004: Campus Childcare Hub (shared by Howard S. Wright — summary level, critical red/red)
  {
    sourceAccountId: 'ca-002',
    sourceAccountName: 'Howard S. Wright',
    sourceProjectId: 'hsw-proj-0388',
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
        openCount: 5,
        totalExpectedImpact: 3780000,
        highSeverityCount: 2,
      },
      schedule: {
        openCount: 3,
        totalExpectedImpact: 28,
        highSeverityCount: 1,
      },
    },
    syncedAt: new Date('2026-05-13T10:20:00'),
    source: 'procore-connect',
  },
];
