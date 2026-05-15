// Active user: Bridget O'Sullivan (Director of Capital Projects) — see activeUser.ts
import type { User } from '@/types/user';
import {
  EXECUTIVE_TOOL_PERMISSIONS,
  ADMIN_TOOL_PERMISSIONS,
  MANAGER_TOOL_PERMISSIONS,
  FIELD_TOOL_PERMISSIONS,
  BOARD_TOOL_PERMISSIONS,
  OPERATOR_TOOL_PERMISSIONS,
} from '@/types/permissions';
import AmaraOseiAvatar from '@/images/Amara_Osei-Avatar.png';
import AntonPetrovAvatar from '@/images/Anton_Petrov-Avatar.png';
import BridgetOSullivanAvatar from '@/images/Bridget_OSullivan-Avatar.png';
import CarlosMendezAvatar from '@/images/Carlos_Mendez-Avatar.png';
import DerekHuangAvatar from '@/images/Derek_Huang-Avatar.png';
import EleanorVossAvatar from '@/images/Eleanor_Voss-Avatar.png';
import JakeKowalskiAvatar from '@/images/Jake_Kowalski-Avatar.png';
import JamesCallahanAvatar from '@/images/James_Callahan-Avatar.png';
import LuisHerreraAvatar from '@/images/Luis_Herrera-Avatar.png';
import MarcusWebbAvatar from '@/images/Marcus_Webb-Avatar.png';
import NinaPatelAvatar from '@/images/Nina_Patel-Avatar.png';
import PriyaNairAvatar from '@/images/Priya_Nair-Avatar.png';
import RachelKimAvatar from '@/images/Rachel_Kim-Avatar.png';
import SamThorntonAvatar from '@/images/Sam_Thornton-Avatar.png';
import SandraOkaforAvatar from '@/images/Sandar_Okafor-Avatar.png';
import TyroneJacksonAvatar from '@/images/Tyrone_Jackson-Avatar.png';
import VictoriaLangfordAvatar from '@/images/Victoria_Lanford-Avatar.png';

const ALL_PROJECT_IDS = [
  'proj-001','proj-002','proj-003','proj-004','proj-005',
  'proj-006','proj-007','proj-008','proj-009','proj-010',
  'proj-011','proj-012','proj-013','proj-014','proj-015',
  'proj-016','proj-017','proj-018','proj-019','proj-020',
];

const EXECUTIVE_STRATEGY_KEY_DEFAULTS: User['permissions']['keyDefaults'] = [
  'platform:access', 'account:read', 'account:update', 'account:manage_billing',
  'users:invite', 'users:remove', 'users:update_role', 'users:update_permissions',
  'projects:create', 'projects:read', 'projects:update', 'projects:delete', 'projects:manage_members',
  'tools:enable', 'tools:disable',
];

const OPERATIONS_ADMIN_KEY_DEFAULTS: User['permissions']['keyDefaults'] = [
  'platform:access', 'account:read', 'account:update',
  'users:invite', 'users:update_role', 'users:update_permissions',
  'projects:create', 'projects:read', 'projects:update', 'projects:delete', 'projects:manage_members',
  'tools:enable', 'tools:disable',
];

const PROJECT_DELIVERY_KEY_DEFAULTS: User['permissions']['keyDefaults'] = [
  'platform:access', 'account:read',
  'projects:create', 'projects:read', 'projects:update', 'projects:manage_members',
  'tools:enable',
];

const FIELD_OPPERATIONS_KEY_DEFAULTS: User['permissions']['keyDefaults'] = [
  'platform:access', 'projects:read',
];

export const users: User[] = [
  // ── EXECUTIVE STRATEGY (4) ──────────────────────────────────────────────────

  // user-001: Victoria Langford — Chancellor
  {
    id: 'user-001',
    accountId: 'acc-001',
    firstName: 'Victoria',
    lastName: 'Langford',
    companyName: 'University of Nebraska–Lincoln',
    email: 'vlangford@nebraska.edu',
    avatar: VictoriaLangfordAvatar.src,
    role: 'Executive Strategy',
    jobTitle: 'Chancellor',
    projectIds: ALL_PROJECT_IDS,
    permissions: {
      toolDefaults: EXECUTIVE_TOOL_PERMISSIONS,
      toolGranted: {},
      toolDenied: [],
      keyDefaults: EXECUTIVE_STRATEGY_KEY_DEFAULTS,
      keyGranted: [],
      keyDenied: [],
    },
    favorites: { projectIds: [], toolKeys: [] },
    createdAt: new Date('2022-08-01'),
    updatedAt: new Date('2025-09-01'),
    lastActiveAt: new Date('2026-04-20'),
  },

  // user-002: Marcus Webb — VP for Finance & Administration
  {
    id: 'user-002',
    accountId: 'acc-001',
    firstName: 'Marcus',
    lastName: 'Webb',
    companyName: 'University of Nebraska–Lincoln',
    email: 'mwebb@nebraska.edu',
    avatar: MarcusWebbAvatar.src,
    role: 'Executive Strategy',
    jobTitle: 'Vice Chancellor for Finance & Administration',
    projectIds: ALL_PROJECT_IDS,
    permissions: {
      toolDefaults: EXECUTIVE_TOOL_PERMISSIONS,
      toolGranted: {},
      toolDenied: [],
      keyDefaults: EXECUTIVE_STRATEGY_KEY_DEFAULTS,
      keyGranted: [],
      keyDenied: [],
    },
    favorites: { projectIds: [], toolKeys: [] },
    createdAt: new Date('2022-08-01'),
    updatedAt: new Date('2025-09-01'),
    lastActiveAt: new Date('2026-04-18'),
  },

  // user-003: Sandra Okafor — Associate Vice Chancellor for Budget & Finance
  {
    id: 'user-003',
    accountId: 'acc-001',
    firstName: 'Sandra',
    lastName: 'Okafor',
    companyName: 'University of Nebraska–Lincoln',
    email: 'sokafor@nebraska.edu',
    avatar: SandraOkaforAvatar.src,
    role: 'Executive Strategy',
    jobTitle: 'Associate Vice Chancellor, Budget & Finance',
    projectIds: ALL_PROJECT_IDS,
    permissions: {
      toolDefaults: EXECUTIVE_TOOL_PERMISSIONS,
      toolGranted: {},
      toolDenied: [],
      keyDefaults: EXECUTIVE_STRATEGY_KEY_DEFAULTS,
      keyGranted: [],
      keyDenied: [],
    },
    favorites: { projectIds: [], toolKeys: [] },
    createdAt: new Date('2022-08-01'),
    updatedAt: new Date('2025-01-10'),
    lastActiveAt: new Date('2026-04-15'),
  },

  // user-004: Derek Huang — Board of Regents Member
  {
    id: 'user-004',
    accountId: 'acc-001',
    firstName: 'Derek',
    lastName: 'Huang',
    companyName: 'University of Nebraska–Lincoln',
    email: 'dhuang@nebraska.edu',
    avatar: DerekHuangAvatar.src,
    role: 'Executive Strategy',
    jobTitle: 'Board of Regents — Student Regent',
    projectIds: ALL_PROJECT_IDS,
    permissions: {
      toolDefaults: BOARD_TOOL_PERMISSIONS,
      toolGranted: {},
      toolDenied: [],
      keyDefaults: EXECUTIVE_STRATEGY_KEY_DEFAULTS,
      keyGranted: [],
      keyDenied: [],
    },
    favorites: { projectIds: [], toolKeys: [] },
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2025-08-15'),
    lastActiveAt: new Date('2026-04-05'),
  },

  // ── OPERATIONS & ADMINISTRATION (4) ─────────────────────────────────────────

  // user-005: Priya Nair — Director of Facilities Management & Planning
  {
    id: 'user-005',
    accountId: 'acc-001',
    firstName: 'Priya',
    lastName: 'Nair',
    companyName: 'University of Nebraska–Lincoln',
    email: 'pnair@nebraska.edu',
    avatar: PriyaNairAvatar.src,
    role: 'Operations & Administration',
    jobTitle: 'Director, Facilities Management & Planning',
    projectIds: ALL_PROJECT_IDS,
    permissions: {
      toolDefaults: ADMIN_TOOL_PERMISSIONS,
      toolGranted: {},
      toolDenied: [],
      keyDefaults: OPERATIONS_ADMIN_KEY_DEFAULTS,
      keyGranted: [],
      keyDenied: [],
    },
    favorites: { projectIds: [], toolKeys: [] },
    createdAt: new Date('2022-08-01'),
    updatedAt: new Date('2024-06-01'),
    lastActiveAt: new Date('2026-04-19'),
  },

  // user-006: James Callahan — Director of Capital Construction
  {
    id: 'user-006',
    accountId: 'acc-001',
    firstName: 'James',
    lastName: 'Callahan',
    companyName: 'University of Nebraska–Lincoln',
    email: 'jcallahan@nebraska.edu',
    avatar: JamesCallahanAvatar.src,
    role: 'Operations & Administration',
    jobTitle: 'Director, Capital Construction',
    projectIds: ALL_PROJECT_IDS,
    permissions: {
      toolDefaults: ADMIN_TOOL_PERMISSIONS,
      toolGranted: {},
      toolDenied: [],
      keyDefaults: OPERATIONS_ADMIN_KEY_DEFAULTS,
      keyGranted: [],
      keyDenied: [],
    },
    favorites: { projectIds: [], toolKeys: [] },
    createdAt: new Date('2022-08-01'),
    updatedAt: new Date('2024-02-01'),
    lastActiveAt: new Date('2026-04-20'),
  },

  // user-007: Eleanor Voss — Associate General Counsel
  {
    id: 'user-007',
    accountId: 'acc-001',
    firstName: 'Eleanor',
    lastName: 'Voss',
    companyName: 'University of Nebraska–Lincoln',
    email: 'evoss@nebraska.edu',
    avatar: EleanorVossAvatar.src,
    role: 'Operations & Administration',
    jobTitle: 'Associate General Counsel, Construction',
    projectIds: ALL_PROJECT_IDS,
    permissions: {
      toolDefaults: ADMIN_TOOL_PERMISSIONS,
      toolGranted: {},
      toolDenied: [],
      keyDefaults: OPERATIONS_ADMIN_KEY_DEFAULTS,
      keyGranted: [],
      keyDenied: [],
    },
    favorites: { projectIds: [], toolKeys: [] },
    createdAt: new Date('2023-03-01'),
    updatedAt: new Date('2024-03-01'),
    lastActiveAt: new Date('2026-04-10'),
  },

  // user-008: Carlos Mendez — Director of Sustainability & Campus Planning
  {
    id: 'user-008',
    accountId: 'acc-001',
    firstName: 'Carlos',
    lastName: 'Mendez',
    companyName: 'University of Nebraska–Lincoln',
    email: 'cmendez@nebraska.edu',
    avatar: CarlosMendezAvatar.src,
    role: 'Operations & Administration',
    jobTitle: 'Director, Sustainability & Campus Planning',
    projectIds: ALL_PROJECT_IDS,
    permissions: {
      toolDefaults: ADMIN_TOOL_PERMISSIONS,
      toolGranted: {},
      toolDenied: [],
      keyDefaults: OPERATIONS_ADMIN_KEY_DEFAULTS,
      keyGranted: [],
      keyDenied: [],
    },
    favorites: { projectIds: [], toolKeys: [] },
    createdAt: new Date('2022-08-01'),
    updatedAt: new Date('2024-07-01'),
    lastActiveAt: new Date('2026-04-12'),
  },

  // ── PROJECT DELIVERY (5) ────────────────────────────────────────────────────

  // user-009: Bridget O'Sullivan — Director of Capital Projects (ACTIVE USER)
  {
    id: 'user-009',
    accountId: 'acc-001',
    firstName: 'Bridget',
    lastName: "O'Sullivan",
    companyName: 'University of Nebraska–Lincoln',
    email: "bosullivan@nebraska.edu",
    avatar: BridgetOSullivanAvatar.src,
    role: 'Project Delivery',
    jobTitle: 'Director, Capital Projects',
    projectIds: ALL_PROJECT_IDS,
    permissions: {
      toolDefaults: MANAGER_TOOL_PERMISSIONS,
      toolGranted: {},
      toolDenied: [],
      keyDefaults: PROJECT_DELIVERY_KEY_DEFAULTS,
      keyGranted: [],
      keyDenied: [],
    },
    favorites: {
      projectIds: ['proj-001', 'proj-002', 'proj-005'],
      toolKeys: ['budget', 'rfis', 'schedule'],
    },
    createdAt: new Date('2022-08-01'),
    updatedAt: new Date('2025-08-15'),
    lastActiveAt: new Date('2026-04-20'),
  },

  // user-010: Tyrone Jackson — Senior Project Manager
  {
    id: 'user-010',
    accountId: 'acc-001',
    firstName: 'Tyrone',
    lastName: 'Jackson',
    companyName: 'University of Nebraska–Lincoln',
    email: 'tjackson@nebraska.edu',
    avatar: TyroneJacksonAvatar.src,
    role: 'Project Delivery',
    jobTitle: 'Senior Project Manager',
    projectIds: ['proj-001', 'proj-002', 'proj-003', 'proj-004', 'proj-005', 'proj-011', 'proj-012', 'proj-015', 'proj-016'],
    permissions: {
      toolDefaults: MANAGER_TOOL_PERMISSIONS,
      toolGranted: {},
      toolDenied: [],
      keyDefaults: PROJECT_DELIVERY_KEY_DEFAULTS,
      keyGranted: [],
      keyDenied: [],
    },
    favorites: { projectIds: [], toolKeys: [] },
    createdAt: new Date('2022-08-01'),
    updatedAt: new Date('2024-09-01'),
    lastActiveAt: new Date('2026-04-20'),
  },

  // user-011: Rachel Kim — Project Manager
  {
    id: 'user-011',
    accountId: 'acc-001',
    firstName: 'Rachel',
    lastName: 'Kim',
    companyName: 'University of Nebraska–Lincoln',
    email: 'rkim@nebraska.edu',
    avatar: RachelKimAvatar.src,
    role: 'Project Delivery',
    jobTitle: 'Project Manager',
    projectIds: ['proj-001', 'proj-002', 'proj-006', 'proj-007', 'proj-008', 'proj-013', 'proj-014', 'proj-017', 'proj-018'],
    permissions: {
      toolDefaults: MANAGER_TOOL_PERMISSIONS,
      toolGranted: {},
      toolDenied: [],
      keyDefaults: PROJECT_DELIVERY_KEY_DEFAULTS,
      keyGranted: [],
      keyDenied: [],
    },
    favorites: { projectIds: [], toolKeys: [] },
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-01-15'),
    lastActiveAt: new Date('2026-04-18'),
  },

  // user-012: Anton Petrov — Project Manager
  {
    id: 'user-012',
    accountId: 'acc-001',
    firstName: 'Anton',
    lastName: 'Petrov',
    companyName: 'University of Nebraska–Lincoln',
    email: 'apetrov@nebraska.edu',
    avatar: AntonPetrovAvatar.src,
    role: 'Project Delivery',
    jobTitle: 'Project Manager',
    projectIds: ['proj-009', 'proj-010', 'proj-011', 'proj-019', 'proj-020'],
    permissions: {
      toolDefaults: MANAGER_TOOL_PERMISSIONS,
      toolGranted: {},
      toolDenied: [],
      keyDefaults: PROJECT_DELIVERY_KEY_DEFAULTS,
      keyGranted: [],
      keyDenied: [],
    },
    favorites: { projectIds: [], toolKeys: [] },
    createdAt: new Date('2023-08-15'),
    updatedAt: new Date('2024-08-15'),
    lastActiveAt: new Date('2026-04-16'),
  },

  // user-013: Luis Herrera — Owner's Representative / Construction Manager
  {
    id: 'user-013',
    accountId: 'acc-001',
    firstName: 'Luis',
    lastName: 'Herrera',
    companyName: 'University of Nebraska–Lincoln',
    email: 'lherrera@nebraska.edu',
    avatar: LuisHerreraAvatar.src,
    role: 'Project Delivery',
    jobTitle: "Owner's Representative",
    projectIds: ['proj-001', 'proj-002', 'proj-003', 'proj-004', 'proj-005', 'proj-006', 'proj-007', 'proj-008', 'proj-009', 'proj-010'],
    permissions: {
      toolDefaults: MANAGER_TOOL_PERMISSIONS,
      toolGranted: {},
      toolDenied: [],
      keyDefaults: PROJECT_DELIVERY_KEY_DEFAULTS,
      keyGranted: [],
      keyDenied: [],
    },
    favorites: { projectIds: [], toolKeys: [] },
    createdAt: new Date('2022-08-01'),
    updatedAt: new Date('2024-08-01'),
    lastActiveAt: new Date('2026-04-20'),
  },

  // ── FIELD OPPERATIONS (4) ────────────────────────────────────────────────────

  // user-014: Amara Osei — Project Engineer
  {
    id: 'user-014',
    accountId: 'acc-001',
    firstName: 'Amara',
    lastName: 'Osei',
    companyName: 'University of Nebraska–Lincoln',
    email: 'aosei@nebraska.edu',
    avatar: AmaraOseiAvatar.src,
    role: 'Field Opperations',
    jobTitle: 'Project Engineer',
    projectIds: ['proj-001', 'proj-002', 'proj-003', 'proj-006', 'proj-007', 'proj-008'],
    permissions: {
      toolDefaults: OPERATOR_TOOL_PERMISSIONS,
      toolGranted: {},
      toolDenied: [],
      keyDefaults: FIELD_OPPERATIONS_KEY_DEFAULTS,
      keyGranted: [],
      keyDenied: [],
    },
    favorites: { projectIds: [], toolKeys: [] },
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08'),
    lastActiveAt: new Date('2026-04-18'),
  },

  // user-015: Jake Kowalski — Field Superintendent
  {
    id: 'user-015',
    accountId: 'acc-001',
    firstName: 'Jake',
    lastName: 'Kowalski',
    companyName: 'University of Nebraska–Lincoln',
    email: 'jkowalski@nebraska.edu',
    avatar: JakeKowalskiAvatar.src,
    role: 'Field Opperations',
    jobTitle: 'Field Superintendent',
    projectIds: ['proj-001', 'proj-002', 'proj-003', 'proj-004', 'proj-005', 'proj-009', 'proj-010'],
    permissions: {
      toolDefaults: FIELD_TOOL_PERMISSIONS,
      toolGranted: {},
      toolDenied: [],
      keyDefaults: FIELD_OPPERATIONS_KEY_DEFAULTS,
      keyGranted: [],
      keyDenied: [],
    },
    favorites: { projectIds: [], toolKeys: [] },
    createdAt: new Date('2022-08-01'),
    updatedAt: new Date('2024-02-01'),
    lastActiveAt: new Date('2026-04-20'),
  },

  // user-016: Nina Patel — Safety & Environmental Manager
  {
    id: 'user-016',
    accountId: 'acc-001',
    firstName: 'Nina',
    lastName: 'Patel',
    companyName: 'University of Nebraska–Lincoln',
    email: 'npatel@nebraska.edu',
    avatar: NinaPatelAvatar.src,
    role: 'Field Opperations',
    jobTitle: 'Safety & Environmental Manager',
    projectIds: ['proj-001', 'proj-002', 'proj-003', 'proj-004', 'proj-005', 'proj-006', 'proj-007', 'proj-008', 'proj-009', 'proj-010'],
    permissions: {
      toolDefaults: FIELD_TOOL_PERMISSIONS,
      toolGranted: {},
      toolDenied: [],
      keyDefaults: FIELD_OPPERATIONS_KEY_DEFAULTS,
      keyGranted: [],
      keyDenied: [],
    },
    favorites: { projectIds: [], toolKeys: [] },
    createdAt: new Date('2022-08-01'),
    updatedAt: new Date('2024-05-01'),
    lastActiveAt: new Date('2026-04-19'),
  },

  // user-017: Sam Thornton — IT & Systems Administrator
  {
    id: 'user-017',
    accountId: 'acc-001',
    firstName: 'Sam',
    lastName: 'Thornton',
    companyName: 'University of Nebraska–Lincoln',
    email: 'sthornton@nebraska.edu',
    avatar: SamThorntonAvatar.src,
    role: 'Field Opperations',
    jobTitle: 'IT & Systems Administrator',
    projectIds: [],
    permissions: {
      toolDefaults: ADMIN_TOOL_PERMISSIONS,
      toolGranted: {},
      toolDenied: [],
      keyDefaults: OPERATIONS_ADMIN_KEY_DEFAULTS,
      keyGranted: [],
      keyDenied: [],
    },
    favorites: { projectIds: [], toolKeys: [] },
    createdAt: new Date('2022-08-01'),
    updatedAt: new Date('2024-04-01'),
    lastActiveAt: new Date('2026-04-15'),
  },
];
