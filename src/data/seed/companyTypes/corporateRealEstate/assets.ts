import type { Asset } from '@/types/assets';

// 15 assets covering campus construction equipment, AV systems, and facilities

export const assets: Asset[] = [
  // ── proj-001 · Bellevue Building 3 Expansion ─────────────────────────────
  {
    id: 'ast-001', assetCode: 'CRANE-BLV-B3-001', accountId: 'acc-001', projectId: 'proj-001',
    name: 'Tower Crane — Liebherr 280 EC-H 16 (Bellevue B3)',
    type: 'equipment', trade: 'structural', status: 'active', condition: 'good',
    serialNumber: 'LHR-280ECH-BLV-001', manufacturer: 'Liebherr', model: '280 EC-H 16 Litronic',
    installDate: new Date('2025-02-15'), warrantyExpiry: null,
    description: 'Luffing jib tower crane with 16t capacity serving the 12-story Building 3 structural steel and curtain wall erection.',
    imageUrl: null, createdBy: 'user-013', createdAt: new Date('2025-02-15'), updatedAt: new Date('2025-06-01'),
  },
  {
    id: 'ast-002', assetCode: 'MSW-BLV-B3-001', accountId: 'acc-001', projectId: 'proj-001',
    name: 'Main Electrical Switchgear — Bellevue B3 (4000A, 480V)',
    type: 'electrical', trade: 'electrical', status: 'delivered', condition: 'excellent',
    serialNumber: 'ABB-MSW-BLVB3-001', manufacturer: 'ABB', model: 'UniGear ZS1 Medium-Voltage Switchgear',
    installDate: null, warrantyExpiry: new Date('2036-01-15'),
    description: 'Main 4000A, 480V switchgear assembly with ATS and emergency tie for the Building 3 base building electrical distribution system.',
    imageUrl: null, createdBy: 'user-015', createdAt: new Date('2026-01-20'), updatedAt: new Date('2026-03-01'),
  },

  // ── proj-002 · Seattle TI — Westlake Tower ────────────────────────────────
  {
    id: 'ast-003', assetCode: 'CAT6A-SEA-TI-001', accountId: 'acc-001', projectId: 'proj-002',
    name: 'Structured Cabling System — Seattle TI Westlake',
    type: 'system', trade: 'electrical', status: 'installed', condition: 'excellent',
    serialNumber: 'CME-CAT6A-SEA-22-001', manufacturer: 'CommScope', model: 'SYSTIMAX 2500 Cat6A UTP',
    installDate: new Date('2026-04-01'), warrantyExpiry: new Date('2041-04-01'),
    description: 'Cat6A structured cabling system for 350 data drops, patch panels, and IDFs on the Seattle TI 22nd floor.',
    imageUrl: null, createdBy: 'user-016', createdAt: new Date('2026-03-20'), updatedAt: new Date('2026-04-15'),
  },

  // ── proj-003 · Reno Operations Center ────────────────────────────────────
  {
    id: 'ast-004', assetCode: 'GEN-RNO-OPS-001', accountId: 'acc-001', projectId: 'proj-003',
    name: 'Emergency Generator — Reno Ops Center (1500 kW)',
    type: 'generator', trade: 'electrical', status: 'delivered', condition: 'excellent',
    serialNumber: 'CAT-G1500-RNO-001', manufacturer: 'Caterpillar', model: 'Cat XQ1500 Mobile Diesel Generator',
    installDate: null, warrantyExpiry: new Date('2036-11-01'),
    description: '1500 kW emergency standby generator for the Reno Operations Center data lab and critical systems backup.',
    imageUrl: null, createdBy: 'user-015', createdAt: new Date('2025-11-10'), updatedAt: new Date('2026-02-01'),
  },
  {
    id: 'ast-005', assetCode: 'CCTV-RNO-OPS-001', accountId: 'acc-001', projectId: 'proj-003',
    name: 'CCTV Security System — Reno Ops Center (128 Cameras)',
    type: 'system', trade: 'electrical', status: 'ordered', condition: 'excellent',
    serialNumber: 'AXS-CCTV-RNO-001', manufacturer: 'Axis Communications', model: 'P3245-V Fixed Dome Network Camera',
    installDate: null, warrantyExpiry: null,
    description: '128-camera IP CCTV system for the Reno Operations Center exterior, parking, loading dock, and interior coverage.',
    imageUrl: null, createdBy: 'user-017', createdAt: new Date('2026-01-25'), updatedAt: new Date('2026-03-01'),
  },

  // ── proj-004 · Campus Childcare & Amenity Hub ─────────────────────────────
  {
    id: 'ast-006', assetCode: 'KITCH-CCAFE-001', accountId: 'acc-001', projectId: 'proj-004',
    name: 'Commercial Kitchen Equipment — Campus Café (Full Package)',
    type: 'equipment', trade: 'mechanical', status: 'ordered', condition: 'excellent',
    serialNumber: 'CKE-CCAFE-BLV-001', manufacturer: 'Hobart Corporation', model: 'Commercial Kitchen Suite (Custom)',
    installDate: null, warrantyExpiry: null,
    description: 'Full commercial kitchen package for Campus Childcare Hub café including ranges, dishwasher, refrigeration, and prep stations.',
    imageUrl: null, createdBy: 'user-013', createdAt: new Date('2026-02-20'), updatedAt: new Date('2026-04-01'),
  },
  {
    id: 'ast-007', assetCode: 'PLAY-CCAFE-001', accountId: 'acc-001', projectId: 'proj-004',
    name: 'Playground Equipment — Campus Childcare Outdoor Play Area',
    type: 'fixture', trade: 'general', status: 'ordered', condition: 'excellent',
    serialNumber: 'LCI-PGE-CCAFE-001', manufacturer: 'Landscape Structures', model: 'PlayBooster Custom (Ages 2–12)',
    installDate: null, warrantyExpiry: null,
    description: 'ADA-accessible playground structure for ages 2–12 with nature play elements, shade structure, and safety surfacing.',
    imageUrl: null, createdBy: 'user-013', createdAt: new Date('2026-03-10'), updatedAt: new Date('2026-04-01'),
  },

  // ── proj-005 · Portland Pearl District TI ────────────────────────────────
  {
    id: 'ast-008', assetCode: 'AV-PDX-TI-001', accountId: 'acc-001', projectId: 'proj-005',
    name: 'Conference Room AV System — Portland TI (12 Rooms)',
    type: 'system', trade: 'electrical', status: 'commissioned', condition: 'excellent',
    serialNumber: 'CRS-AV-PDX-TI-001', manufacturer: 'Crestron Electronics', model: 'Flex UC-C160-T Tabletop System',
    installDate: new Date('2025-11-01'), warrantyExpiry: new Date('2030-11-01'),
    description: '12-room AV package with 85" displays, videoconferencing, and Crestron room scheduling panels at Portland TI.',
    imageUrl: null, createdBy: 'user-016', createdAt: new Date('2025-09-10'), updatedAt: new Date('2025-12-01'),
  },

  // ── proj-006 · SF R&D Laboratory TI ──────────────────────────────────────
  {
    id: 'ast-009', assetCode: 'FHOOD-SFR&D-001', accountId: 'acc-001', projectId: 'proj-006',
    name: 'Fume Hood System — SF R&D Lab (24 Units)',
    type: 'equipment', trade: 'mechanical', status: 'ordered', condition: 'excellent',
    serialNumber: 'HAW-FH24-SFRD-001', manufacturer: 'Labconco', model: 'Protector Premier 48" VAV Hood',
    installDate: null, warrantyExpiry: null,
    description: '24 VAV fume hoods on order for the SF R&D laboratory fit-out; awaiting hazmat abatement clearance before installation.',
    imageUrl: null, createdBy: 'user-017', createdAt: new Date('2026-03-10'), updatedAt: new Date('2026-04-15'),
  },
  {
    id: 'ast-010', assetCode: 'UPS-SFRD-001', accountId: 'acc-001', projectId: 'proj-006',
    name: 'UPS System — SF R&D Lab Server Infrastructure',
    type: 'electrical', trade: 'electrical', status: 'ordered', condition: 'excellent',
    serialNumber: 'EAT-UPS-SFRD-001', manufacturer: 'Eaton Corporation', model: '9PX 20kVA Rack-Mount UPS',
    installDate: null, warrantyExpiry: null,
    description: '20kVA rack-mount UPS units for the SF R&D lab server infrastructure and critical research equipment power conditioning.',
    imageUrl: null, createdBy: 'user-017', createdAt: new Date('2026-04-05'), updatedAt: new Date('2026-04-05'),
  },

  // ── proj-007 · Austin Domain Campus TI ───────────────────────────────────
  {
    id: 'ast-011', assetCode: 'ACS-AUS-TI-001', accountId: 'acc-001', projectId: 'proj-007',
    name: 'Access Control System — Austin Domain TI',
    type: 'system', trade: 'electrical', status: 'installed', condition: 'excellent',
    serialNumber: 'LKM-ACS-AUS-TI-001', manufacturer: 'Lenel Systems', model: 'OnGuard 8.1 Access Control Platform',
    installDate: new Date('2026-03-01'), warrantyExpiry: new Date('2031-02-01'),
    description: 'Card-based access control system with 42 readers covering all entry points, conference rooms, and server room at Austin Domain TI.',
    imageUrl: null, createdBy: 'user-017', createdAt: new Date('2026-02-10'), updatedAt: new Date('2026-03-15'),
  },

  // ── proj-008 · Bellevue MF Housing ───────────────────────────────────────
  {
    id: 'ast-012', assetCode: 'HOIST-BLVMF-001', accountId: 'acc-001', projectId: 'proj-008',
    name: 'Construction Hoist — Bellevue MF Housing (Dual Mast)',
    type: 'equipment', trade: 'structural', status: 'active', condition: 'good',
    serialNumber: 'MHI-DUAL-BLVMF-001', manufacturer: 'Maber', model: 'MSE 300/32-2 Dual Mast Personnel Hoist',
    installDate: new Date('2025-10-10'), warrantyExpiry: null,
    description: 'Dual mast construction personnel and material hoist serving all 18 floors of the Bellevue Multi-Family Housing residential tower.',
    imageUrl: null, createdBy: 'user-013', createdAt: new Date('2025-10-10'), updatedAt: new Date('2026-01-15'),
  },

  // ── proj-009 · Denver LoDo TI ─────────────────────────────────────────────
  {
    id: 'ast-013', assetCode: 'BAS-DEN-TI-001', accountId: 'acc-001', projectId: 'proj-009',
    name: 'Building Automation System — Denver LoDo TI',
    type: 'hvac_system', trade: 'hvac', status: 'installed', condition: 'excellent',
    serialNumber: 'JCI-BAS-DEN-TI-001', manufacturer: 'Johnson Controls', model: 'Metasys N2 Open BACnet Controller',
    installDate: new Date('2026-02-15'), warrantyExpiry: new Date('2031-02-15'),
    description: 'BACnet-based BAS controlling HVAC, lighting, and energy metering for the Denver LoDo tenant improvement.',
    imageUrl: null, createdBy: 'user-015', createdAt: new Date('2026-01-15'), updatedAt: new Date('2026-03-15'),
  },

  // ── proj-010 · NYC Hudson Yards Office ───────────────────────────────────
  {
    id: 'ast-014', assetCode: 'FRN-NYC-HY-001', accountId: 'acc-001', projectId: 'proj-010',
    name: 'Premium Furniture Package — NYC Hudson Yards (Full Floor)',
    type: 'fixture', trade: 'general', status: 'ordered', condition: 'excellent',
    serialNumber: 'KNL-FRN-NYC-HY-001', manufacturer: 'Knoll Inc.', model: 'Anchor Workstation + Rockwell Seating',
    installDate: null, warrantyExpiry: null,
    description: 'Premium executive furniture package for NYC Hudson Yards office including workstations, conference tables, and lounge seating.',
    imageUrl: null, createdBy: 'user-013', createdAt: new Date('2026-04-05'), updatedAt: new Date('2026-04-20'),
  },
  {
    id: 'ast-015', assetCode: 'AV-NYC-HY-001', accountId: 'acc-001', projectId: 'proj-010',
    name: 'Executive AV System — NYC Hudson Yards Boardroom',
    type: 'system', trade: 'electrical', status: 'ordered', condition: 'excellent',
    serialNumber: 'CRES-AV-NYC-HY-001', manufacturer: 'Crestron Electronics', model: 'Flex UC-M150-T + 105" Display',
    installDate: null, warrantyExpiry: null,
    description: 'Premium boardroom AV system with 105" LED display, Crestron UC platform, and integrated videoconferencing for the NYC executive suite.',
    imageUrl: null, createdBy: 'user-016', createdAt: new Date('2026-04-10'), updatedAt: new Date('2026-04-20'),
  },
];
