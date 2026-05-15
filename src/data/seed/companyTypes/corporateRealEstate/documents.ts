import type { Document } from '@/types/documents';

// 15 documents — type: 6 DOC, 5 DR, 4 IMG
// format mix: pdf, docx, xlsx, dwg, png

export const documents: Document[] = [
  // ── DOC type ──────────────────────────────────────────────────────────────
  {
    id: 'doc-001', accountId: 'acc-001', projectId: 'proj-001',
    type: 'DOC', format: 'pdf', status: 'approved', version: 1,
    title: 'Bellevue Building 3 — CM at Risk Agreement (Skanska)',
    description: 'Executed Construction Manager at Risk agreement with Skanska USA for the Building 3 campus headquarters project.',
    fileUrl: '/mock-documents/doc-001.pdf', fileSize: 9200000,
    uploadedBy: 'user-004', createdAt: new Date('2025-01-20'), updatedAt: new Date('2025-01-20'),
  },
  {
    id: 'doc-002', accountId: 'acc-001', projectId: 'proj-002',
    type: 'DOC', format: 'pdf', status: 'approved', version: 1,
    title: 'Seattle TI Westlake — Lease Agreement (Floor 22)',
    description: 'Executed 10-year lease for 28,500 RSF on the 22nd floor of Westlake Center, including TI allowance and build-out rights.',
    fileUrl: '/mock-documents/doc-002.pdf', fileSize: 5800000,
    uploadedBy: 'user-003', createdAt: new Date('2025-09-01'), updatedAt: new Date('2025-09-01'),
  },
  {
    id: 'doc-003', accountId: 'acc-001', projectId: 'proj-009',
    type: 'DOC', format: 'pdf', status: 'approved', version: 1,
    title: 'Denver LoDo TI — LEED CI v4 Credit Scorecard',
    description: 'LEED Commercial Interiors v4 credit scorecard targeting Platinum certification for the Denver LoDo tenant improvement.',
    fileUrl: '/mock-documents/doc-003.pdf', fileSize: 1600000,
    uploadedBy: 'user-006', createdAt: new Date('2026-03-15'), updatedAt: new Date('2026-04-01'),
  },
  {
    id: 'doc-004', accountId: 'acc-001', projectId: 'proj-006',
    type: 'DOC', format: 'pdf', status: 'approved', version: 1,
    title: 'SF R&D Lab — Hazardous Materials Assessment Report',
    description: 'Phase II hazardous materials assessment (asbestos, lead, PCBs) for the 1985 building shell prior to R&D lab fit-out demolition.',
    fileUrl: '/mock-documents/doc-004.pdf', fileSize: 7200000,
    uploadedBy: 'user-017', createdAt: new Date('2026-03-25'), updatedAt: new Date('2026-04-05'),
  },
  {
    id: 'doc-005', accountId: 'acc-001', projectId: 'proj-010',
    type: 'DOC', format: 'pdf', status: 'approved', version: 1,
    title: 'NYC Hudson Yards — Lease Abstract (Suite 4100)',
    description: 'Executed sublease abstract for 12,000 RSF at 30 Hudson Yards, Suite 4100, including TI allowance and HVAC provisions.',
    fileUrl: '/mock-documents/doc-005.pdf', fileSize: 3600000,
    uploadedBy: 'user-003', createdAt: new Date('2025-10-01'), updatedAt: new Date('2025-10-01'),
  },
  {
    id: 'doc-006', accountId: 'acc-001', projectId: 'proj-001',
    type: 'DOC', format: 'xlsx', status: 'draft', version: 4,
    title: 'Bellevue Building 3 — Change Order Log (April 2026)',
    description: 'Current change order log summarizing all approved and pending COs for Building 3, including differing site conditions claims.',
    fileUrl: '/mock-documents/doc-006.xlsx', fileSize: 1400000,
    uploadedBy: 'user-009', createdAt: new Date('2026-04-20'), updatedAt: new Date('2026-04-22'),
  },

  // ── DR type ───────────────────────────────────────────────────────────────
  {
    id: 'doc-007', accountId: 'acc-001', projectId: 'proj-001',
    type: 'DR', format: 'dwg', status: 'approved', version: 2,
    title: 'Bellevue Building 3 — Schematic Design Package (100% SD)',
    description: 'Complete 100% schematic design package: site plan, floor plans, elevations, and structural system narrative.',
    fileUrl: '/mock-documents/doc-007.dwg', fileSize: 31400000,
    uploadedBy: 'user-014', createdAt: new Date('2024-09-10'), updatedAt: new Date('2024-11-15'),
  },
  {
    id: 'doc-008', accountId: 'acc-001', projectId: 'proj-002',
    type: 'DR', format: 'dwg', status: 'approved', version: 3,
    title: 'Seattle TI — 100% Construction Documents (IFC Set)',
    description: 'Issued-for-Construction drawing set for Seattle Westlake 22nd floor TI: architecture, interiors, MEP, and structural.',
    fileUrl: '/mock-documents/doc-008.dwg', fileSize: 18900000,
    uploadedBy: 'user-011', createdAt: new Date('2026-02-15'), updatedAt: new Date('2026-03-01'),
  },
  {
    id: 'doc-009', accountId: 'acc-001', projectId: 'proj-003',
    type: 'DR', format: 'dwg', status: 'approved', version: 2,
    title: 'Reno Ops Center — Site & Foundation Plan (60% CD)',
    description: '60% Construction Document site plan and foundation drawings for the Reno Operations Center ground-up build.',
    fileUrl: '/mock-documents/doc-009.dwg', fileSize: 22400000,
    uploadedBy: 'user-014', createdAt: new Date('2025-10-01'), updatedAt: new Date('2025-11-15'),
  },
  {
    id: 'doc-010', accountId: 'acc-001', projectId: 'proj-004',
    type: 'DR', format: 'pdf', status: 'in_review', version: 1,
    title: 'Campus Childcare Hub — City of Bellevue Plan Check Response (Round 2)',
    description: 'Round 2 plan check response drawings addressing egress, structural, and daycare licensing compliance comments.',
    fileUrl: '/mock-documents/doc-010.pdf', fileSize: 2100000,
    uploadedBy: 'user-014', createdAt: new Date('2026-04-10'), updatedAt: new Date('2026-04-22'),
  },
  {
    id: 'doc-011', accountId: 'acc-001', projectId: 'proj-005',
    type: 'DR', format: 'pdf', status: 'approved', version: 1,
    title: 'Portland TI Pearl — Project Closeout Package (As-Builts)',
    description: 'Final as-built drawing set and closeout package including warranties, O&M manuals, and Certificate of Occupancy.',
    fileUrl: '/mock-documents/doc-011.pdf', fileSize: 22100000,
    uploadedBy: 'user-013', createdAt: new Date('2025-12-10'), updatedAt: new Date('2025-12-20'),
  },

  // ── IMG type ──────────────────────────────────────────────────────────────
  {
    id: 'doc-012', accountId: 'acc-001', projectId: 'proj-001',
    type: 'IMG', format: 'png', status: 'approved', version: 2,
    title: 'Bellevue Building 3 — Exterior Rendering (Southwest Elevation)',
    description: 'Approved architectural rendering of the Building 3 southwest elevation with curtain wall and ground floor entry.',
    fileUrl: '/mock-documents/doc-012.png', fileSize: 6200000,
    uploadedBy: 'user-009', createdAt: new Date('2025-03-01'), updatedAt: new Date('2025-09-15'),
  },
  {
    id: 'doc-013', accountId: 'acc-001', projectId: 'proj-008',
    type: 'IMG', format: 'png', status: 'draft', version: 1,
    title: 'Bellevue MF Housing — Concept Massing Rendering',
    description: 'Draft massing rendering for the Bellevue Multi-Family Housing 18-story residential tower with ground floor retail.',
    fileUrl: '/mock-documents/doc-013.png', fileSize: 4800000,
    uploadedBy: 'user-011', createdAt: new Date('2026-02-28'), updatedAt: new Date('2026-04-10'),
  },
  {
    id: 'doc-014', accountId: 'acc-001', projectId: 'proj-009',
    type: 'IMG', format: 'png', status: 'approved', version: 1,
    title: 'Denver LoDo TI — Interior Rendering (Open Office)',
    description: 'Approved interior rendering of the Denver LoDo open office workspace with biophilic design elements and LEED daylighting strategy.',
    fileUrl: '/mock-documents/doc-014.png', fileSize: 3900000,
    uploadedBy: 'user-009', createdAt: new Date('2025-11-01'), updatedAt: new Date('2025-11-01'),
  },
  {
    id: 'doc-015', accountId: 'acc-001', projectId: 'proj-010',
    type: 'IMG', format: 'png', status: 'in_review', version: 1,
    title: 'NYC Hudson Yards — Space Plan Rendering (Suite 4100)',
    description: 'Conceptual space plan rendering for the NYC Hudson Yards executive suite showing open workstation zones and private offices.',
    fileUrl: '/mock-documents/doc-015.png', fileSize: 3200000,
    uploadedBy: 'user-011', createdAt: new Date('2026-04-01'), updatedAt: new Date('2026-04-18'),
  },
];
