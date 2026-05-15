/**
 * HEALTH SNAPSHOTS SEED DATA
 * Extended 90-day daily history per project for sparkline and delta calculations.
 * Projects already carry a coarse healthHistory in their seed record (makeHistory).
 * This file provides per-project daily granularity used by the hub card "What changed" tab.
 *
 * Format: Record<projectId, HealthSnapshot[]> — 90 entries per project, newest last.
 */

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
  // proj-001: Rutherford County — budget pressure, degraded yellow
  'proj-001': fill(['green', 'green', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow'], 90),
  // proj-002: Sunflower Flats BESS — ERCOT delay risk, trending yellow
  'proj-002': fill(['green', 'green', 'green', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow'], 90),
  // proj-003: Marshall County — improving after interconnection cost resolution
  'proj-003': fill(['yellow', 'yellow', 'yellow', 'yellow', 'green', 'green', 'green', 'green', 'green'], 90),
  // proj-004: Logan County — tax equity risk, critical
  'proj-004': fill(['yellow', 'yellow', 'red', 'red', 'red', 'red', 'red', 'red', 'red'], 90),
  // proj-005: Pratt County — consistently healthy
  'proj-005': fill(['green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green'], 90),
  // proj-006: Luna County — permitting delays, at risk
  'proj-006': fill(['green', 'green', 'green', 'green', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow'], 90),
  // proj-007: Dodge County — COD approaching, slight schedule pressure
  'proj-007': fill(['green', 'green', 'green', 'green', 'green', 'green', 'yellow', 'yellow', 'green'], 90),
  // proj-008: Poinsett Transmission — ROW delays push to yellow
  'proj-008': fill(['green', 'green', 'green', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow'], 90),
  // proj-009: Limestone Phase 2 — construction on track, slight pressure
  'proj-009': fill(['green', 'green', 'green', 'green', 'green', 'yellow', 'yellow', 'green', 'green'], 90),
  // proj-010: Grady BESS — KEY DEMO: currently healthy, major risks forecast (interconnection queue)
  'proj-010': fill(['green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green'], 90),
  // proj-011–020: on hold / inactive / cancelled — stable green or no signals
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
