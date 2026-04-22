/**
 * RFI SEED DATA
 *
 * Generates 10–15 RFIs per project (all projects in seed) for Trinity Health.
 * Uses deterministic pseudo-random generation so data is stable across renders.
 * Statuses are weighted toward Open/Draft for active projects and Closed for
 * inactive/closeout projects. A subset is assigned to the active user (user-009,
 * Bridget O'Sullivan) so they appear in My Open Items.
 */

import type { Rfi, RfiStatus, RfiCostImpact, RfiScheduleImpact, RfiAttachment, RfiResponse } from '@/types/rfis';
import type { ProjectStage } from '@/types/project';

// ─── Deterministic hash (same approach as openitems.ts) ──────────────────────

function hash(n: number, salt: number): number {
  let h = ((n * 2654435761) ^ (salt * 40503)) >>> 0;
  h ^= h >>> 16;
  h = ((h * 0x45d9f3b) & 0xffffffff) >>> 0;
  h ^= h >>> 16;
  return h >>> 0;
}

function pick<T>(arr: readonly T[], n: number, salt: number): T {
  return arr[hash(n, salt) % arr.length]!;
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// ─── Reference pools ─────────────────────────────────────────────────────────

const RFI_SUBJECTS = [
  'Clarification on structural beam connection detail at Level 3',
  'Confirm MEP routing at ceiling plenum — Grids C-4 to D-6',
  'Grounding requirements for server room raised floor system',
  'Waterproofing membrane specification at plaza deck level',
  'Expansion joint locations at building perimeter — South elevation',
  'Curtain wall anchor bolt embed depth — confirm per SE calcs',
  'Fire-rated partition head-of-wall detail at corridor intersections',
  'Concrete mix design approval for slab on grade — Building A',
  'Rooftop equipment access and clearance requirements',
  'Stairwell pressurization duct routing conflicts with structural',
  'Temporary power panel location during Phase 1 mobilization',
  'Existing utility survey accuracy — discrepancies found at Grid B',
  'Generator transfer switch integration with existing switchgear',
  'Elevator pit sump pump discharge point and piping route',
  'Exterior paint system compatibility with CMU substrate',
  'Medical gas piping material specification — copper vs CSST',
  'Nurse call system rough-in locations per revised floor plan',
  'Radiation shielding thickness for imaging suite walls',
  'Seismic bracing requirements for overhead MEP systems',
  'ADA clearance at patient room entry doors — verify 44" minimum',
  'Smoke damper locations in return air plenum — confirm quantity',
  'Operating room HVAC supply air requirements — CFM confirmation',
  'Emergency power distribution to critical care areas',
  'Infection control barrier requirements during active construction',
  'Clean room HEPA filter housing detail and mounting brackets',
  'Patient lift ceiling track layout — confirm structural capacity',
  'Pneumatic tube system routing through fire-rated walls',
  'Loading dock leveler specification — confirm capacity',
  'Chilled water pipe insulation specification at exterior run',
  'Helical pile capacity confirmation — geotechnical report discrepancy',
  'Roof drain overflow scupper sizing — hydraulic calc review',
  'Fire alarm notification appliance candela rating by room type',
  'Kitchen exhaust hood Type I vs Type II — confirm at Café servery',
  'Transformer vault ventilation requirements per NEC',
  'Data center UPS bypass maintenance clearance dimensions',
  'Window glazing performance spec — STC rating for patient rooms',
  'Handrail extension at ramp landings — confirm ADA compliant',
  'Concrete topping slab reinforcement at elevated deck',
  'Domestic hot water recirculation pump sizing discrepancy',
  'Isolation room negative pressure monitoring system spec',
] as const;

const RFI_QUESTIONS: Record<string, string> = {
  'Clarification on structural beam connection detail at Level 3': 'Structural drawing S-301 shows a moment connection at the beam-to-column joint at Grid C/3 Level 3, but the connection schedule on sheet S-001 indicates a shear connection at this location. Please clarify which connection type governs and provide revised detail if needed.',
  'Confirm MEP routing at ceiling plenum — Grids C-4 to D-6': 'During coordination review we found conflicts between the HVAC ductwork and plumbing risers at the ceiling plenum between grids C-4 and D-6. The mechanical drawings show the main trunk duct at 10\'-6" AFF but the plumbing riser occupies the same space. Please clarify routing priority and required adjustments.',
  'Grounding requirements for server room raised floor system': 'The server room floor specification calls for a raised access floor with static-dissipative tiles but does not specify the grounding method for the pedestal system. Section 26 05 26 references a grounding grid but does not detail connection to the raised floor. Please confirm the grounding approach.',
  'Waterproofing membrane specification at plaza deck level': 'The waterproofing specification in Section 07 13 00 references a hot-applied rubberized asphalt membrane, but the detail on drawing A-501 calls out a cold-applied fluid membrane. The substrate preparation differs for each system. Please confirm which product is to be used.',
  'Medical gas piping material specification — copper vs CSST': 'Section 22 62 00 calls for Type L copper tubing for medical gas piping, but the mechanical contractor has proposed CSST per manufacturer pre-approval. The OSHPD/AHJ requirements for this facility may restrict CSST use. Please confirm whether CSST is acceptable or if copper is required.',
  'Nurse call system rough-in locations per revised floor plan': 'The nurse call system rough-in locations shown on drawing E-401 are based on the Rev 2 floor plan, but the patient room layouts were revised in Addendum 3. Several bed head locations have shifted and the corridor dome light spacing no longer aligns with the revised room entries. Please provide updated rough-in locations.',
  'Radiation shielding thickness for imaging suite walls': 'The radiation shielding plan on drawing A-310 specifies 1/16" lead lining on three walls of the CT suite, but the updated equipment spec from the vendor indicates higher scatter radiation levels that may require 1/8" lead. Please confirm required shielding thickness based on the finalized equipment selection.',
  'Operating room HVAC supply air requirements — CFM confirmation': 'The mechanical schedule on drawing M-201 shows 2,400 CFM supply air to OR-3, but ASHRAE 170-2017 Table 7.1 requires a minimum of 20 ACH for Class C operating rooms, which at the room volume shown requires approximately 3,200 CFM. Please confirm the design CFM and reconcile with code requirements.',
  'Seismic bracing requirements for overhead MEP systems': 'The seismic bracing specification in Section 13 48 00 references SMACNA guidelines for HVAC ductwork bracing, but does not address the medical gas piping or fire suppression systems. Given the Seismic Design Category D designation for this site, please confirm bracing requirements for all overhead MEP systems.',
};

const STATUS_POOLS: Record<string, readonly RfiStatus[]> = {
  active: ['Draft', 'Draft', 'Open', 'Open', 'Open', 'Open', 'Open', 'Closed', 'Closed', 'Closed - Revised'],
  on_hold: ['Draft', 'Open', 'Open', 'Closed', 'Closed', 'Closed', 'Closed - Draft', 'Closed - Revised'],
  inactive: ['Closed', 'Closed', 'Closed', 'Closed', 'Closed - Revised', 'Closed - Draft', 'Open'],
  cancelled: ['Closed', 'Closed', 'Closed - Draft', 'Draft'],
};

const INTERNAL_USERS = [
  { id: 'user-008', name: 'Carlos Mendez' },
  { id: 'user-009', name: "Bridget O'Sullivan" },
  { id: 'user-010', name: 'Tyrone Jackson' },
  { id: 'user-011', name: 'Rachel Kim' },
  { id: 'user-012', name: 'Anton Petrov' },
  { id: 'user-013', name: 'Luis Herrera' },
  { id: 'user-014', name: 'Amara Osei' },
] as const;

const CONTRACTORS = [
  'Turner Construction', 'Skanska USA', 'Hensel Phelps', 'Gilbane Building Co.',
  'Barton Malow', 'Robins & Morton', 'Brasfield & Gorrie', 'DPR Construction',
  'JE Dunn Construction', 'Mortenson Construction',
] as const;

const SPEC_SECTION_IDS = [
  'spec-011000', 'spec-013100', 'spec-013300', 'spec-033000',
  'spec-211000', 'spec-221410', 'spec-230500', 'spec-230700',
  'spec-231123', 'spec-233100', 'spec-235700', null, null, null,
] as const;

const LOCATIONS = [
  'Level 1 — Zone A', 'Level 1 — Zone B', 'Level 2 — East Wing',
  'Level 2 — West Wing', 'Level 3 — Patient Tower', 'Level 3 — Mechanical Room',
  'Level 4 — Surgical Suite', 'Level 5 — Rooftop Mechanical',
  'Basement — Electrical Room', 'Basement — Central Plant',
  'Exterior — South Elevation', 'Exterior — Loading Dock',
  'Parking Structure — P1', 'Site — North Entry Drive',
] as const;

const COST_CODES = [
  '03-100', '05-200', '07-300', '09-400', '22-100',
  '23-200', '26-100', '28-300', '31-500', '32-100',
] as const;

interface ProjectSeedRef {
  id: string;
  stage: ProjectStage;
  status: string;
  startDate: string;
  name: string;
}

const PROJECT_REFS: ProjectSeedRef[] = [
  { id: 'proj-001', stage: 'course_of_construction', status: 'active', startDate: '2023-09-01', name: 'St. Joseph Medical Center — Tower Expansion' },
  { id: 'proj-002', stage: 'course_of_construction', status: 'active', startDate: '2024-01-15', name: 'Holy Cross Outpatient Pavilion' },
  { id: 'proj-003', stage: 'course_of_construction', status: 'active', startDate: '2023-11-01', name: 'Mercy Hospital MOB — Phase II' },
  { id: 'proj-004', stage: 'Pre-Construction', status: 'active', startDate: '2024-06-01', name: "St. Mary's Medical Center Renovation" },
  { id: 'proj-005', stage: 'course_of_construction', status: 'active', startDate: '2023-07-01', name: 'Loyola Medical Campus — Behavioral Health Facility' },
  { id: 'proj-006', stage: 'final_design', status: 'active', startDate: '2024-03-01', name: 'Chandler Regional Medical Center Expansion' },
  { id: 'proj-007', stage: 'Post-Construction', status: 'active', startDate: '2023-04-01', name: 'St. Francis Hospital — ED Modernization' },
  { id: 'proj-008', stage: 'bidding', status: 'active', startDate: '2024-09-01', name: 'Trinity Columbus Specialist Office Building' },
  { id: 'proj-009', stage: 'course_of_construction', status: 'active', startDate: '2024-02-01', name: "St. Vincent's Surgical Center Upgrade" },
  { id: 'proj-010', stage: 'permitting', status: 'active', startDate: '2024-07-01', name: 'Marian Medical Center Outpatient Clinic' },
  { id: 'proj-011', stage: 'feasibility', status: 'on_hold', startDate: '2023-01-15', name: 'Mercy Health Research Institute' },
  { id: 'proj-012', stage: 'final_design', status: 'on_hold', startDate: '2023-08-01', name: 'St. Joseph Livonia Campus — Parking Structure' },
  { id: 'proj-013', stage: 'Pre-Construction', status: 'on_hold', startDate: '2024-01-01', name: 'Trinity Health Baton Rouge MOB' },
  { id: 'proj-014', stage: 'permitting', status: 'on_hold', startDate: '2024-04-01', name: 'Sequoia Hospital Imaging Center Expansion' },
  { id: 'proj-015', stage: 'closeout', status: 'inactive', startDate: '2023-02-01', name: 'Holy Redeemer Hospital — Cafeteria Renovation' },
  { id: 'proj-016', stage: 'maintenance', status: 'inactive', startDate: '2022-09-01', name: 'St. Elizabeth Hospital — Rooftop HVAC Replacement' },
  { id: 'proj-017', stage: 'handover', status: 'inactive', startDate: '2023-03-01', name: 'Our Lady of the Lake MOB — Interior Fit-Out' },
  { id: 'proj-018', stage: 'closeout', status: 'inactive', startDate: '2023-05-01', name: 'Dominican Hospital — Chapel Restoration' },
  { id: 'proj-019', stage: 'conceptual', status: 'cancelled', startDate: '2023-10-01', name: 'Lourdes Health System — Helipad Expansion' },
  { id: 'proj-020', stage: 'feasibility', status: 'cancelled', startDate: '2024-01-01', name: 'Resurrection Health — Satellite Clinic (Pasadena)' },
];

function buildRfis(): Rfi[] {
  const all: Rfi[] = [];
  let globalIdx = 0;

  for (const proj of PROJECT_REFS) {
    const statusPool = STATUS_POOLS[proj.status] ?? STATUS_POOLS.active;
    const rfiCount = 10 + (hash(globalIdx, 99) % 6); // 10–15

    for (let i = 0; i < rfiCount; i++) {
      globalIdx++;
      const seed = globalIdx * 73 + i;
      const rfiNumber = i + 1;

      const status: RfiStatus = statusPool[hash(seed, 1) % statusPool.length]!;
      const subject = pick(RFI_SUBJECTS, seed, 2);

      const question = RFI_QUESTIONS[subject]
        ?? `Regarding "${subject.toLowerCase()}": The current drawings and specifications do not provide sufficient detail to proceed with construction. Please provide clarification and any supplemental details needed for field installation.`;

      // Assignees — mix of internal users; make some assigned to Bridget (user-009)
      const assigneeUser = (hash(seed, 3) % 5 === 0)
        ? INTERNAL_USERS[1] // Bridget, roughly 20% of the time
        : INTERNAL_USERS[hash(seed, 4) % INTERNAL_USERS.length]!;

      const rfiManagerUser = INTERNAL_USERS[hash(seed, 5) % INTERNAL_USERS.length]!;
      const receivedFromUser = INTERNAL_USERS[hash(seed, 6) % INTERNAL_USERS.length]!;
      const contractor = pick(CONTRACTORS, seed, 7);
      const ballInCourtUser = status === 'Open' ? assigneeUser : rfiManagerUser;

      // Dates
      const createdOffset = hash(seed, 10) % 600;
      const createdAt = addDays(proj.startDate, createdOffset);
      const dueOffset = 7 + (hash(seed, 11) % 21); // 7–27 days after creation
      const dueDate = addDays(createdAt, dueOffset);

      let closedDate: string | null = null;
      if (status === 'Closed' || status === 'Closed - Revised' || status === 'Closed - Draft') {
        const closeOffset = (hash(seed, 12) % 20);
        closedDate = addDays(dueDate, closeOffset);
      }

      // Cost impact
      const hasCostImpact = hash(seed, 20) % 4 === 0; // ~25%
      const costImpact: RfiCostImpact = {
        hasImpact: hasCostImpact,
        amount: hasCostImpact ? (1000 + (hash(seed, 21) % 24) * 1000) : null,
      };

      // Schedule impact
      const hasScheduleImpact = hash(seed, 22) % 3 === 0; // ~33%
      const scheduleImpact: RfiScheduleImpact = {
        hasImpact: hasScheduleImpact,
        days: hasScheduleImpact ? (1 + (hash(seed, 23) % 14)) : null,
      };

      // Spec section
      const specSectionId = pick(SPEC_SECTION_IDS, seed, 30) ?? null;

      // Location
      const location = pick(LOCATIONS, seed, 31);
      const costCode = pick(COST_CODES, seed, 32);

      // Distribution list (3-5 people)
      const distCount = 3 + (hash(seed, 40) % 3);
      const distributionList: string[] = [];
      for (let d = 0; d < distCount; d++) {
        const person = INTERNAL_USERS[hash(seed + d, 41) % INTERNAL_USERS.length]!.name;
        if (!distributionList.includes(person)) distributionList.push(person);
      }

      // Attachments
      const attachments: RfiAttachment[] = hash(seed, 50) % 3 === 0
        ? [{ id: `att-rfi-${globalIdx}-0`, filename: `RFI-${rfiNumber}_markup.pdf`, url: '#' }]
        : [];

      // Responses (0-2 for open, 1-3 for closed)
      const responseCount = (status === 'Closed' || status === 'Closed - Revised')
        ? 1 + (hash(seed, 60) % 3)
        : hash(seed, 60) % 3;

      const responses: RfiResponse[] = [];
      for (let r = 0; r < responseCount; r++) {
        const responder = INTERNAL_USERS[hash(seed + r, 61) % INTERNAL_USERS.length]!;
        const respDate = addDays(createdAt, 2 + r * 3 + (hash(seed + r, 62) % 5));
        responses.push({
          id: `resp-${globalIdx}-${r}`,
          author: responder.name,
          date: respDate,
          body: r === responseCount - 1 && (status === 'Closed' || status === 'Closed - Revised')
            ? 'Reviewed and confirmed. Proceed per the attached revised detail. This response constitutes the official direction.'
            : 'Acknowledged. We are reviewing the referenced documents and will provide a formal response within 48 hours. Please hold on the affected work area.',
          attachments: r === responseCount - 1 && hash(seed + r, 63) % 2 === 0
            ? [{ id: `att-resp-${globalIdx}-${r}`, filename: `RFI-${rfiNumber}_response_sketch.pdf`, url: '#' }]
            : [],
          isOfficial: r === responseCount - 1,
        });
      }

      const isPrivate = hash(seed, 70) % 10 === 0; // ~10%

      const rfi: Rfi = {
        id: `rfi-${globalIdx}`,
        accountId: 'acc-001',
        projectId: proj.id,
        number: rfiNumber,
        subject,
        status,
        stage: proj.stage,

        question,
        attachments,
        responses,

        rfiManager: rfiManagerUser.name,
        receivedFrom: receivedFromUser.name,
        assignees: [assigneeUser.name],
        distributionList,
        ballInCourt: ballInCourtUser.name,
        responsibleContractor: contractor,

        specificationSectionId: specSectionId,
        location,
        drawingNumber: hash(seed, 80) % 3 === 0 ? `A-${300 + (hash(seed, 81) % 20)}` : null,
        costCode,
        subJob: null,
        reference: hash(seed, 82) % 4 === 0 ? `ASI-${1 + (hash(seed, 83) % 12)}` : null,

        costImpact,
        scheduleImpact,

        private: isPrivate,

        dueDate,
        closedDate,
        dateInitiated: createdAt,
        createdBy: receivedFromUser.name,
        createdAt,
        updatedAt: closedDate ?? addDays(createdAt, hash(seed, 90) % 30),
      };

      all.push(rfi);
    }
  }

  return all;
}

export const rfis: Rfi[] = buildRfis();
