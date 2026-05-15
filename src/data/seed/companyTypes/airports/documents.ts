import type { Document } from '@/types/documents';

// 15 documents — type: 6 DOC, 5 DR, 4 IMG
// format mix: pdf, docx, xlsx, dwg, png

export const documents: Document[] = [
  // ── DOC type ──────────────────────────────────────────────────────────────
  {
    id: 'doc-001', accountId: 'acc-001', projectId: 'proj-001',
    type: 'DOC', format: 'pdf', status: 'approved', version: 1,
    title: 'Terminal 1 Modernization — CEQA Environmental Impact Report',
    description: 'CEQA Environmental Impact Report including traffic, noise, air quality, and cultural resources analysis.',
    fileUrl: '/mock-documents/doc-001.pdf', fileSize: 24800000,
    uploadedBy: 'user-014', createdAt: new Date('2022-11-15'), updatedAt: new Date('2023-03-20'),
  },
  {
    id: 'doc-002', accountId: 'acc-001', projectId: 'proj-001',
    type: 'DOC', format: 'pdf', status: 'approved', version: 1,
    title: 'Terminal 1 — CM at Risk Agreement (Turner Construction)',
    description: 'Executed Construction Manager at Risk agreement with Turner Construction Company for Terminal 1.',
    fileUrl: '/mock-documents/doc-002.pdf', fileSize: 18200000,
    uploadedBy: 'user-006', createdAt: new Date('2023-06-01'), updatedAt: new Date('2023-06-01'),
  },
  {
    id: 'doc-003', accountId: 'acc-001', projectId: 'proj-002',
    type: 'DOC', format: 'pdf', status: 'approved', version: 1,
    title: 'Runway 24L/6R — FAA AC 150/5370-10 Compliance Report',
    description: 'FAA Advisory Circular compliance report and construction safety plan for the Runway 24L/6R rehabilitation.',
    fileUrl: '/mock-documents/doc-003.pdf', fileSize: 8600000,
    uploadedBy: 'user-012', createdAt: new Date('2025-03-15'), updatedAt: new Date('2025-04-01'),
  },
  {
    id: 'doc-004', accountId: 'acc-001', projectId: 'proj-004',
    type: 'DOC', format: 'pdf', status: 'approved', version: 2,
    title: 'TBIT Gates 147–152 — FAA Airport Layout Plan Amendment',
    description: 'Approved FAA Airport Layout Plan amendment for the TBIT concourse extension including airspace analysis.',
    fileUrl: '/mock-documents/doc-004.pdf', fileSize: 14200000,
    uploadedBy: 'user-012', createdAt: new Date('2024-01-10'), updatedAt: new Date('2024-01-20'),
  },
  {
    id: 'doc-005', accountId: 'acc-001', projectId: 'proj-004',
    type: 'DOC', format: 'pdf', status: 'approved', version: 1,
    title: 'TBIT Expansion — CM at Risk Agreement (Hensel Phelps)',
    description: 'Executed CM at Risk agreement with Hensel Phelps Construction for the TBIT Gates 147–152 expansion.',
    fileUrl: '/mock-documents/doc-005.pdf', fileSize: 16400000,
    uploadedBy: 'user-006', createdAt: new Date('2023-12-15'), updatedAt: new Date('2023-12-15'),
  },
  {
    id: 'doc-006', accountId: 'acc-001', projectId: 'proj-008',
    type: 'DOC', format: 'pdf', status: 'approved', version: 1,
    title: 'Airport Metro Connector — FTA Small Starts Grant Agreement',
    description: 'Federal grant agreement with FTA covering 60% of eligible capital costs for the Airport Metro Connector.',
    fileUrl: '/mock-documents/doc-006.pdf', fileSize: 9800000,
    uploadedBy: 'user-006', createdAt: new Date('2023-09-20'), updatedAt: new Date('2023-09-20'),
  },

  // ── DR type ───────────────────────────────────────────────────────────────
  {
    id: 'doc-007', accountId: 'acc-001', projectId: 'proj-002',
    type: 'DR', format: 'dwg', status: 'approved', version: 3,
    title: 'Runway 24L/6R — 100% IFB Construction Documents (Pavement & Lighting)',
    description: '100% IFB drawings for the Runway 24L/6R full-depth rehabilitation: pavement design, lighting, and drainage.',
    fileUrl: '/mock-documents/doc-007.dwg', fileSize: 31200000,
    uploadedBy: 'user-014', createdAt: new Date('2024-12-01'), updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'doc-008', accountId: 'acc-001', projectId: 'proj-001',
    type: 'DR', format: 'dwg', status: 'draft', version: 1,
    title: 'Terminal 1 — Phasing Plan & Passenger Wayfinding Strategy',
    description: 'Draft construction phasing plan and passenger wayfinding strategy to maintain operational access throughout renovation.',
    fileUrl: '/mock-documents/doc-008.dwg', fileSize: 11400000,
    uploadedBy: 'user-013', createdAt: new Date('2026-05-01'), updatedAt: new Date('2026-05-10'),
  },
  {
    id: 'doc-009', accountId: 'acc-001', projectId: 'proj-003',
    type: 'DR', format: 'dwg', status: 'approved', version: 2,
    title: 'Parking Structure P3 — Structural Engineering Drawings (100% CD)',
    description: '100% Construction Document structural drawings for the P3 post-tensioned parking structure.',
    fileUrl: '/mock-documents/doc-009.dwg', fileSize: 28600000,
    uploadedBy: 'user-014', createdAt: new Date('2024-08-01'), updatedAt: new Date('2024-09-15'),
  },
  {
    id: 'doc-010', accountId: 'acc-001', projectId: 'proj-005',
    type: 'DR', format: 'pdf', status: 'approved', version: 1,
    title: 'T5/T6 Security Checkpoint — TSA Approved Layout Drawings',
    description: 'TSA-approved checkpoint layout drawings showing lane configuration, equipment placement, and exit lane geometry.',
    fileUrl: '/mock-documents/doc-010.pdf', fileSize: 7200000,
    uploadedBy: 'user-009', createdAt: new Date('2025-04-10'), updatedAt: new Date('2025-05-15'),
  },
  {
    id: 'doc-011', accountId: 'acc-001', projectId: 'proj-007',
    type: 'DR', format: 'pdf', status: 'approved', version: 1,
    title: 'Economy Lot C — Solar Carport Structural Calculations',
    description: 'Stamped structural calculations for the 350-space solar carport canopy at Economy Lot C.',
    fileUrl: '/mock-documents/doc-011.pdf', fileSize: 8400000,
    uploadedBy: 'user-014', createdAt: new Date('2026-01-20'), updatedAt: new Date('2026-02-28'),
  },

  // ── IMG type ──────────────────────────────────────────────────────────────
  {
    id: 'doc-012', accountId: 'acc-001', projectId: 'proj-004',
    type: 'IMG', format: 'png', status: 'approved', version: 1,
    title: 'TBIT Expansion — Architectural Rendering (Exterior Approach)',
    description: 'Approved exterior rendering of the TBIT concourse extension and international arrival hall.',
    fileUrl: '/mock-documents/doc-012.png', fileSize: 5800000,
    uploadedBy: 'user-009', createdAt: new Date('2024-06-01'), updatedAt: new Date('2024-06-01'),
  },
  {
    id: 'doc-013', accountId: 'acc-001', projectId: 'proj-001',
    type: 'IMG', format: 'png', status: 'approved', version: 2,
    title: 'Terminal 1 — Interior Rendering (Concourse Holdroom)',
    description: 'Updated rendering of the Terminal 1 concourse holdroom with natural light design and seating layout.',
    fileUrl: '/mock-documents/doc-013.png', fileSize: 4200000,
    uploadedBy: 'user-009', createdAt: new Date('2025-08-01'), updatedAt: new Date('2026-01-15'),
  },
  {
    id: 'doc-014', accountId: 'acc-001', projectId: 'proj-010',
    type: 'IMG', format: 'png', status: 'in_review', version: 1,
    title: 'CONRAC — Site Plan Rendering (APM Interface)',
    description: 'Conceptual site plan rendering showing the CONRAC building, APM station, and ground transportation connections.',
    fileUrl: '/mock-documents/doc-014.png', fileSize: 6400000,
    uploadedBy: 'user-011', createdAt: new Date('2026-03-15'), updatedAt: new Date('2026-03-15'),
  },
  {
    id: 'doc-015', accountId: 'acc-001', projectId: 'proj-008',
    type: 'IMG', format: 'png', status: 'approved', version: 1,
    title: 'Airport Metro Connector — Station Interior Rendering',
    description: 'Approved interior rendering of the Airport Metro Connector station concourse and boarding platform.',
    fileUrl: '/mock-documents/doc-015.png', fileSize: 5100000,
    uploadedBy: 'user-009', createdAt: new Date('2023-12-01'), updatedAt: new Date('2023-12-01'),
  },
];
