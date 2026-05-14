import type { Asset } from '@/types/assets';

// 15 assets covering terminal equipment, airfield systems, and construction equipment

export const assets: Asset[] = [
  // ── proj-001 · Terminal 1 Modernization ──────────────────────────────────
  {
    id: 'ast-001', assetCode: 'CRANE-T1-001', accountId: 'acc-001', projectId: 'proj-001',
    name: 'Tower Crane — Terminal 1 East Concourse',
    type: 'equipment', trade: 'structural', status: 'active', condition: 'good',
    serialNumber: 'LEB-LC-T1E-001', manufacturer: 'Liebherr', model: 'LTM 1400-7.1 Tower Crane',
    installDate: new Date('2024-03-01'), warrantyExpiry: null,
    description: '400-tonne capacity tower crane for steel erection on the Terminal 1 east concourse expansion.',
    imageUrl: null, createdBy: 'user-013', createdAt: new Date('2024-03-15'), updatedAt: new Date('2025-12-01'),
  },
  {
    id: 'ast-002', assetCode: 'PBB-T1-G06', accountId: 'acc-001', projectId: 'proj-001',
    name: 'Passenger Boarding Bridge — Gate 6, Terminal 1',
    type: 'equipment', trade: 'mechanical', status: 'commissioned', condition: 'excellent',
    serialNumber: 'JBT-PBB-T1-G06', manufacturer: 'JBT Aerotech', model: 'JetConnect III Single-Aisle',
    installDate: new Date('2025-09-01'), warrantyExpiry: new Date('2030-09-01'),
    description: 'Single-aisle passenger boarding bridge at Gate 6, installed as part of the phased Terminal 1 renovation.',
    imageUrl: null, createdBy: 'user-015', createdAt: new Date('2025-08-15'), updatedAt: new Date('2025-11-01'),
  },
  {
    id: 'ast-003', assetCode: 'FORM-T1-CW01', accountId: 'acc-001', projectId: 'proj-001',
    name: 'Curtain Wall Mockup — Zone B',
    type: 'material', trade: 'structural', status: 'installed', condition: 'excellent',
    serialNumber: 'GTRZ-CW-T1B-MOCK', manufacturer: 'Gartner', model: 'Unitized Curtain Wall System',
    installDate: new Date('2026-01-15'), warrantyExpiry: null,
    description: 'Full-scale curtain wall mockup panel under performance testing for air, water, and structural load requirements.',
    imageUrl: null, createdBy: 'user-013', createdAt: new Date('2026-01-15'), updatedAt: new Date('2026-04-28'),
  },

  // ── proj-002 · Runway 24L/6R Rehabilitation ───────────────────────────────
  {
    id: 'ast-004', assetCode: 'PAVE-RW24-001', accountId: 'acc-001', projectId: 'proj-002',
    name: 'Asphalt Paving Train — Runway 24L/6R',
    type: 'equipment', trade: 'civil', status: 'active', condition: 'good',
    serialNumber: 'VGELE-PT-LAX2-001', manufacturer: 'Vögele', model: 'Super 3000-3i Road Paver',
    installDate: new Date('2024-12-01'), warrantyExpiry: null,
    description: 'High-density asphalt paving train for full-depth HMA placement on the runway pavement reconstruction.',
    imageUrl: null, createdBy: 'user-014', createdAt: new Date('2024-12-15'), updatedAt: new Date('2026-01-15'),
  },
  {
    id: 'ast-005', assetCode: 'TEST-LT-LAX01', accountId: 'acc-001', projectId: 'proj-002',
    name: 'FAA L-890 Airfield Lighting Test Set',
    type: 'equipment', trade: 'electrical', status: 'active', condition: 'good',
    serialNumber: 'ABB-LTS-LAX-001', manufacturer: 'ABB', model: 'L-890 Portable Airfield Lighting Test Set',
    installDate: null, warrantyExpiry: null,
    description: 'FAA-certified portable L-890 test set for airfield lighting circuit testing and acceptance verification.',
    imageUrl: null, createdBy: 'user-014', createdAt: new Date('2024-10-15'), updatedAt: new Date('2025-04-01'),
  },

  // ── proj-003 · Parking Structure P3 ──────────────────────────────────────
  {
    id: 'ast-006', assetCode: 'FORM-P3-001', accountId: 'acc-001', projectId: 'proj-003',
    name: 'Self-Climbing Formwork System — P3',
    type: 'equipment', trade: 'structural', status: 'active', condition: 'good',
    serialNumber: 'DOKA-CFS-P3-001', manufacturer: 'Doka', model: 'SKE50 plus Self-Climbing Formwork',
    installDate: new Date('2025-01-01'), warrantyExpiry: null,
    description: 'Self-climbing formwork system for post-tensioned concrete floors cycling through Levels 2–4.',
    imageUrl: null, createdBy: 'user-013', createdAt: new Date('2025-01-15'), updatedAt: new Date('2026-04-01'),
  },
  {
    id: 'ast-007', assetCode: 'EV-P3-PILOT01', accountId: 'acc-001', projectId: 'proj-003',
    name: 'EV Charging Station — Level 2 Pilot Block (20 units)',
    type: 'electrical', trade: 'electrical', status: 'commissioned', condition: 'excellent',
    serialNumber: 'BLINK-L2-P3-001', manufacturer: 'Blink Charging', model: 'Blink IQ 200 Level 2 EVSE',
    installDate: new Date('2025-11-15'), warrantyExpiry: new Date('2030-11-15'),
    description: '20-unit pilot block of Level 2 EV charging stations installed on Level 1 of P3 for early commissioning.',
    imageUrl: null, createdBy: 'user-015', createdAt: new Date('2025-11-15'), updatedAt: new Date('2026-03-01'),
  },

  // ── proj-004 · TBIT Gates 147–152 Expansion ──────────────────────────────
  {
    id: 'ast-008', assetCode: 'CRANE-TBIT-001', accountId: 'acc-001', projectId: 'proj-004',
    name: 'Tower Crane — TBIT Concourse Extension',
    type: 'equipment', trade: 'structural', status: 'active', condition: 'good',
    serialNumber: 'MAM-TC-TBIT-001', manufacturer: 'Manitowoc', model: 'Grove GMK6400 All-Terrain Crane',
    installDate: new Date('2024-06-01'), warrantyExpiry: null,
    description: '400-ton all-terrain crane for wide-body boarding bridge pre-assembly and structural steel erection at TBIT.',
    imageUrl: null, createdBy: 'user-013', createdAt: new Date('2024-06-15'), updatedAt: new Date('2025-08-01'),
  },
  {
    id: 'ast-009', assetCode: 'PBB-TBIT-G147', accountId: 'acc-001', projectId: 'proj-004',
    name: 'Wide-Body Boarding Bridge — Gate 147 (Stored)',
    type: 'equipment', trade: 'mechanical', status: 'delivered', condition: 'excellent',
    serialNumber: 'TLD-WBPB-TBIT-G147', manufacturer: 'TLD Group', model: 'TLD PBB 800 Wide-Body Boarding Bridge',
    installDate: null, warrantyExpiry: new Date('2036-12-01'),
    description: 'Wide-body boarding bridge for Gate 147 stored on-site awaiting structural readiness for installation.',
    imageUrl: null, createdBy: 'user-015', createdAt: new Date('2025-12-15'), updatedAt: new Date('2026-02-01'),
  },

  // ── proj-005 · T5/T6 Security Checkpoint ─────────────────────────────────
  {
    id: 'ast-010', assetCode: 'CT-T56-L01', accountId: 'acc-001', projectId: 'proj-005',
    name: 'CT Baggage Scanning System — Lane 1 (Pilot)',
    type: 'equipment', trade: 'electrical', status: 'installed', condition: 'excellent',
    serialNumber: 'SMIT-CT-T56-L01', manufacturer: 'Smiths Detection', model: 'HI-SCAN 10080 XCT',
    installDate: new Date('2025-11-01'), warrantyExpiry: new Date('2030-11-01'),
    description: 'First CT baggage scanning unit installed for integration testing at the T5/T6 consolidated checkpoint.',
    imageUrl: null, createdBy: 'user-015', createdAt: new Date('2025-10-15'), updatedAt: new Date('2026-04-01'),
  },

  // ── proj-006 · Airfield Lighting Modernization ───────────────────────────
  {
    id: 'ast-011', assetCode: 'LED-TWY-LAX01', accountId: 'acc-001', projectId: 'proj-006',
    name: 'LED Taxiway Edge Light Units — Phase 1 Stockpile',
    type: 'electrical', trade: 'electrical', status: 'delivered', condition: 'excellent',
    serialNumber: 'SIEMENS-ATEL-LAX-001', manufacturer: 'Siemens Airport Systems', model: 'AIRLED-L866A LED Edge Light',
    installDate: null, warrantyExpiry: new Date('2036-04-01'),
    description: '2,400 LED taxiway edge light units stockpiled for Phase 1 installation, compliant with FAA AC 150/5345-46.',
    imageUrl: null, createdBy: 'user-010', createdAt: new Date('2026-04-15'), updatedAt: new Date('2026-05-01'),
  },

  // ── proj-007 · Economy Lot C Solar Carport ────────────────────────────────
  {
    id: 'ast-012', assetCode: 'SOLAR-LC-S01', accountId: 'acc-001', projectId: 'proj-007',
    name: 'Solar Carport Steel Structure — Section 1 (50 Bays)',
    type: 'material', trade: 'structural', status: 'installed', condition: 'excellent',
    serialNumber: 'SPG-SC-LC-001', manufacturer: 'SPI Energy', model: 'SPI Solar Carport Structural System',
    installDate: new Date('2025-10-01'), warrantyExpiry: null,
    description: 'Hot-dip galvanized steel structure for 50 carport bays with PV module mounting rails. Installation in progress.',
    imageUrl: null, createdBy: 'user-015', createdAt: new Date('2025-08-15'), updatedAt: new Date('2026-04-01'),
  },

  // ── proj-008 · Airport Metro Connector ───────────────────────────────────
  {
    id: 'ast-013', assetCode: 'GANTRY-AMC-001', accountId: 'acc-001', projectId: 'proj-008',
    name: 'Hydraulic Gantry — APM Guideway Segment Erection',
    type: 'equipment', trade: 'structural', status: 'active', condition: 'good',
    serialNumber: 'ENG-GC-AMC-001', manufacturer: 'Enerpac', model: 'Hydraulic Gantry System SL400',
    installDate: new Date('2025-02-01'), warrantyExpiry: null,
    description: 'Specialized hydraulic gantry system for placing precast APM guideway segments on the elevated structure.',
    imageUrl: null, createdBy: 'user-014', createdAt: new Date('2025-02-15'), updatedAt: new Date('2026-03-01'),
  },
  {
    id: 'ast-014', assetCode: 'APM-VEH-001', accountId: 'acc-001', projectId: 'proj-008',
    name: 'APM Vehicle Set — Factory Acceptance Testing',
    type: 'vehicle', trade: 'mechanical', status: 'ordered', condition: 'excellent',
    serialNumber: 'BOMBA-APM-LAX-001', manufacturer: 'Bombardier Transportation', model: 'Innovia APM 300',
    installDate: null, warrantyExpiry: null,
    description: 'First production set of 6 Innovia APM 300 vehicles for the Airport Metro Connector. FAT begins Q4 2026.',
    imageUrl: null, createdBy: 'user-009', createdAt: new Date('2026-03-15'), updatedAt: new Date('2026-04-01'),
  },

  // ── proj-009 · Taxiway B & D Rehabilitation ───────────────────────────────
  {
    id: 'ast-015', assetCode: 'MILL-TWY-001', accountId: 'acc-001', projectId: 'proj-009',
    name: 'Cold Milling Machine — Taxiway D Pavement Removal',
    type: 'equipment', trade: 'civil', status: 'active', condition: 'good',
    serialNumber: 'WIRT-MM-LAX-001', manufacturer: 'Wirtgen', model: 'W 250 Large Milling Machine',
    installDate: new Date('2025-04-01'), warrantyExpiry: null,
    description: 'Large cold milling machine for full-depth asphalt removal on Taxiway D within FAA-approved nighttime closure windows.',
    imageUrl: null, createdBy: 'user-014', createdAt: new Date('2025-04-15'), updatedAt: new Date('2026-04-01'),
  },
];
