import type { ConnectedProjectHealth } from '@/types/health';

export const connectedProjects: ConnectedProjectHealth[] = [
  // proj-001: Rutherford County Phase 1 (shared by Mortenson Energy — detail level, budget pressure)
  {
    sourceAccountId: 'ca-001',
    sourceAccountName: 'Mortenson Energy',
    sourceProjectId: 'mortenson-proj-0082',
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
        openCount: 3,
        totalExpectedImpact: 6100000,
        highSeverityCount: 1,
      },
      schedule: {
        openCount: 2,
        totalExpectedImpact: 42,
        highSeverityCount: 1,
      },
    },
    syncedAt: new Date('2026-05-13T09:15:00'),
    source: 'procore-connect',
  },
  // proj-007: Dodge County Solar (shared by McCarthy Building — summary level, commissioning healthy)
  {
    sourceAccountId: 'ca-002',
    sourceAccountName: 'McCarthy Building Companies',
    sourceProjectId: 'mccarthy-proj-0214',
    ownerProjectId: 'proj-007',
    shareLevel: 'summary',
    dimensions: {
      composite: {
        status: 'green',
        forecastStatus: 'yellow',
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
        trend: 'degrading',
        delta: -1,
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
        openCount: 1,
        totalExpectedImpact: 380000,
        highSeverityCount: 0,
      },
      schedule: {
        openCount: 2,
        totalExpectedImpact: 35,
        highSeverityCount: 1,
      },
    },
    syncedAt: new Date('2026-05-13T11:40:00'),
    source: 'procore-connect',
  },
];
