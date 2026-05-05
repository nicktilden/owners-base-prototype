/**
 * MANUAL RISK ITEMS SEED DATA
 * ManualRiskItems are the "escape hatch" — risks with no source object.
 * Used for market conditions, regulatory horizon, subsurface risk, etc.
 */

import type { ManualRiskItem } from '@/types/health';

export const manualRiskItems: ManualRiskItem[] = [
  // Subsurface conditions (geotechnical) — proj-001
  {
    id: 'mri-001',
    projectId: 'proj-001',
    title: 'Unforeseen subsurface obstructions — Phase 2 excavation',
    description: 'Geotechnical report flagged potential for abandoned utility infrastructure in the Phase 2 excavation zone. No source item exists yet — this is a forward-looking exposure.',
    riskTypeId: 'rt-008',
    probability: 3,
    impact: 120000,
    status: 'open',
    riskOwner: 'user-009',
    responseStrategy: 'mitigate',
    mitigationPlan: 'Engage geotech firm to conduct additional borings prior to Phase 2 mobilization.',
    origin: 'manual',
    createdBy: 'user-009',
    createdAt: new Date('2026-01-15'),
  },
  // Market / labor escalation — proj-005
  {
    id: 'mri-002',
    projectId: 'proj-005',
    title: 'Labor market escalation — Q3/Q4 2026',
    description: 'Regional labor shortage anticipated in Houston market due to two concurrent stadium projects. Risk to productivity and wage rates for skilled trades during critical installation phase.',
    riskTypeId: 'rt-010',
    probability: 4,
    impact: 175000,
    status: 'open',
    riskOwner: 'user-004',
    responseStrategy: 'mitigate',
    mitigationPlan: 'Pre-negotiate wage rates with subcontractors via early contract amendment. Identify secondary labor sources in Dallas market.',
    origin: 'manual',
    createdBy: 'user-004',
    createdAt: new Date('2026-02-01'),
  },
  // Regulatory horizon risk — proj-011 (key demo project)
  {
    id: 'mri-003',
    projectId: 'proj-011',
    title: 'Pending federal grant re-appropriation — NIH capital program',
    description: 'Congressional budget negotiations may affect $42M NIH grant tied to the Research Institute. Final appropriation vote expected Q3 2026 — before project financial close.',
    riskTypeId: 'rt-005',
    probability: 3,
    impact: 42000000,
    status: 'open',
    riskOwner: 'user-001',
    responseStrategy: 'avoid',
    mitigationPlan: 'Engage government affairs firm. Delay financial close until appropriations confirmed. Model alternative funding bridge.',
    origin: 'manual',
    createdBy: 'user-001',
    createdAt: new Date('2026-03-20'),
  },
  // Force majeure — proj-003
  {
    id: 'mri-004',
    projectId: 'proj-003',
    title: 'Severe weather season exposure — Philadelphia Q2 2026',
    description: 'Facade installation window overlaps with historically severe spring storm season. Risk of weather-related delays during exterior closure phase.',
    riskTypeId: 'rt-012',
    probability: 2,
    impact: 14,
    status: 'accepted',
    riskOwner: 'user-009',
    responseStrategy: 'accept',
    origin: 'manual',
    createdBy: 'user-009',
    createdAt: new Date('2026-02-10'),
  },
  // Regulatory risk — proj-009
  {
    id: 'mri-005',
    projectId: 'proj-009',
    title: 'OSHPD plan check backlog — surgical suite change order',
    description: 'California OSHPD plan check queue estimated at 8–12 weeks for the surgical suite scope addition. May impact CO issuance.',
    riskTypeId: 'rt-005',
    probability: 3,
    impact: 0,
    status: 'open',
    riskOwner: 'user-011',
    origin: 'manual',
    createdBy: 'user-011',
    createdAt: new Date('2026-03-05'),
  },
];
