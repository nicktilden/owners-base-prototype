import type { HealthSnapshot } from '@/types/health';

function makeDate(daysAgo: number): string {
  const d = new Date('2026-05-14');
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

type HealthScore = 'green' | 'yellow' | 'red';

function fill(pattern: HealthScore[], days: number): HealthSnapshot[] {
  const result: HealthSnapshot[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const idx = Math.floor(((days - 1 - i) / days) * pattern.length);
    result.push({ date: makeDate(i), score: pattern[idx] ?? pattern[pattern.length - 1]! });
  }
  return result;
}

export const healthSnapshotsByProject: Record<string, HealthSnapshot[]> = {
  // proj-001: Terminal 1 — budget pressure, degraded yellow
  'proj-001': fill(['green', 'green', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow'], 90),
  // proj-002: Runway 24L/6R — healthy, Phase 2 schedule slight risk
  'proj-002': fill(['green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green'], 90),
  // proj-003: Parking P3 — improving, now green
  'proj-003': fill(['yellow', 'yellow', 'yellow', 'green', 'green', 'green', 'green', 'green', 'green'], 90),
  // proj-004: TBIT — critical, red and worsening
  'proj-004': fill(['yellow', 'yellow', 'red', 'red', 'red', 'red', 'red', 'red', 'red'], 90),
  // proj-005: T5/T6 Security — schedule risk, yellow
  'proj-005': fill(['green', 'green', 'green', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow'], 90),
  // proj-006: Airfield Lighting — pre-construction, stable green
  'proj-006': fill(['green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green'], 90),
  // proj-007: Lot C — healthy
  'proj-007': fill(['green', 'green', 'green', 'green', 'green', 'green', 'yellow', 'yellow', 'green'], 90),
  // proj-008: Metro Connector — slight cost pressure, yellow
  'proj-008': fill(['green', 'green', 'green', 'green', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow'], 90),
  // proj-009: Taxiways B & D — healthy, minor schedule pressure
  'proj-009': fill(['green', 'green', 'green', 'green', 'green', 'yellow', 'green', 'green', 'green'], 90),
  // proj-010: CONRAC — KEY DEMO: currently healthy, major risks pending (CEQA)
  'proj-010': fill(['green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green'], 90),
  // proj-011–020: on hold / inactive / cancelled
  'proj-011': fill(['green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green'], 90),
  'proj-012': fill(['green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green'], 90),
  'proj-013': fill(['green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green'], 90),
  'proj-014': fill(['green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green'], 90),
  'proj-015': fill(['green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green'], 90),
  'proj-016': fill(['green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green'], 90),
  'proj-017': fill(['green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green'], 90),
  'proj-018': fill(['green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green'], 90),
  'proj-019': fill(['green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green'], 90),
  'proj-020': fill(['green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green'], 90),
};
