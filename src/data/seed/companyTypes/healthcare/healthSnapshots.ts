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
  const d = new Date('2026-05-01');
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
  // proj-001: Degraded from green → yellow → currently yellow
  'proj-001': fill(['green', 'green', 'green', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow'], 90),
  // proj-002: Consistently on track, minor blip
  'proj-002': fill(['green', 'green', 'yellow', 'green', 'green', 'green', 'green', 'green', 'green'], 90),
  // proj-003: Trending better (improving)
  'proj-003': fill(['yellow', 'yellow', 'yellow', 'yellow', 'green', 'green', 'green', 'green', 'green'], 90),
  // proj-004: Critical — red and staying red
  'proj-004': fill(['yellow', 'red', 'red', 'red', 'red', 'red', 'red', 'red', 'red'], 90),
  // proj-005: At risk (connected via Apex — degrading)
  'proj-005': fill(['green', 'green', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow'], 90),
  // proj-006: Stable on track
  'proj-006': fill(['green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green'], 90),
  // proj-007: Healthy (connected via Meridian)
  'proj-007': fill(['green', 'green', 'green', 'green', 'green', 'green', 'green', 'yellow', 'green'], 90),
  // proj-008: Pre-construction, minimal signals
  'proj-008': fill(['green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green'], 90),
  // proj-009: Slight schedule pressure
  'proj-009': fill(['green', 'green', 'green', 'green', 'green', 'yellow', 'yellow', 'green', 'green'], 90),
  // proj-010: Permitting delays pushing into yellow
  'proj-010': fill(['green', 'green', 'green', 'green', 'green', 'green', 'yellow', 'yellow', 'yellow'], 90),
  // proj-011: KEY DEMO — HEALTHY NOW, AT RISK FORECAST (all green currently)
  'proj-011': fill(['green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green'], 90),
  // proj-012: On hold, stable green
  'proj-012': fill(['green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green'], 90),
  // proj-013: On hold, stable
  'proj-013': fill(['green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green'], 90),
  // proj-014: Permitting delays → yellow
  'proj-014': fill(['green', 'green', 'green', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow'], 90),
  // proj-015: Closeout, clean
  'proj-015': fill(['green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green'], 90),
  // proj-016: Maintenance, stable
  'proj-016': fill(['green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green'], 90),
  // proj-017: Handover, clean
  'proj-017': fill(['green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green'], 90),
  // proj-018: Closeout, clean
  'proj-018': fill(['green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green'], 90),
  // proj-019: Cancelled
  'proj-019': fill(['green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green'], 90),
  // proj-020: Cancelled
  'proj-020': fill(['green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green'], 90),
};
