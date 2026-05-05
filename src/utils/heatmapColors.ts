/**
 * HEATMAP COLOR UTILITIES
 * Shared color-scale logic extracted from ScheduleHeatmapCard.
 * Provides a consistent red→yellow→green gradient for all hub cards that
 * visualise completion, health, or adoption metrics.
 *
 * Gradient (pct 7–28, mapped from the heatmap card):
 *   ≤7  #b71c1c  deep red    (worst)
 *   ≤9  #d32f2f  red
 *   ≤11 #e53935  bright red
 *   ≤13 #ff7043  orange-red
 *   ≤15 #ffab91  salmon
 *   ≤17 #ffcc80  amber
 *   ≤19 #fff9c4  light yellow (midpoint)
 *   ≤21 #e6ee9c  yellow-green
 *   ≤23 #c5e1a5  light green
 *   ≤25 #8bc34a  medium green
 *   ≤27 #43a047  green
 *   ≤28 #2e7d32  dark green
 *   >28 #1b5e20  deep green  (best)
 */

// ─── Raw pct → bg/fg functions (mirrors ScheduleHeatmapCard exactly) ──────────

export function heatmapBgForPct(pct: number): string {
  if (pct <= 7)  return "#b71c1c";
  if (pct <= 9)  return "#d32f2f";
  if (pct <= 11) return "#e53935";
  if (pct <= 13) return "#ff7043";
  if (pct <= 15) return "#ffab91";
  if (pct <= 17) return "#ffcc80";
  if (pct <= 19) return "#fff9c4";
  if (pct <= 21) return "#e6ee9c";
  if (pct <= 23) return "#c5e1a5";
  if (pct <= 25) return "#8bc34a";
  if (pct <= 27) return "#43a047";
  if (pct <= 28) return "#2e7d32";
  return "#1b5e20";
}

/** Light text on dark ends of the scale, dark text in the yellow/green middle. */
export function heatmapFgForPct(pct: number): string {
  return pct <= 13 || pct >= 27 ? "#ffffff" : "#1a1a1a";
}

// ─── Completion color (0–100 %) ───────────────────────────────────────────────
//
// Maps a plan's completion percentage to a position on the heatmap scale:
//   0%  → pct 8  → #d32f2f  (red — not started is bad)
//   25% → pct 13 → #ff7043  (orange)
//   50% → pct 18 → #ffcc80  (amber — halfway)
//   75% → pct 23 → #c5e1a5  (light green)
//   100%→ pct 28 → #2e7d32  (dark green — complete)
//
// Overdue plans (that aren't yet 100%) snap to pct 7 (deep red).

function completionToPct(percent: number, overdue: boolean): number {
  if (overdue && percent < 100) return 7;
  if (percent >= 100) return 29; // always deep green
  return Math.round(8 + (percent / 100) * 20);
}

/** Background colour for a completion bar, ring, cell, or dot. */
export function completionBg(percent: number, overdue: boolean): string {
  return heatmapBgForPct(completionToPct(percent, overdue));
}

/** Foreground (text) colour to use on top of `completionBg`. */
export function completionFg(percent: number, overdue: boolean): string {
  return heatmapFgForPct(completionToPct(percent, overdue));
}

// ─── Adoption rate color (0–100 %) ───────────────────────────────────────────
//
// Same mapping as completion — low adoption is bad (red), high adoption is good (green).

/** Background colour for an adoption rate bar or chip. */
export function adoptionBg(rate: number): string {
  return heatmapBgForPct(Math.round(8 + (rate / 100) * 20));
}

// ─── Days-overdue severity color ─────────────────────────────────────────────
//
// Severity increases as more days pile up.
//   1–6d   → amber     (early warning)
//   7–13d  → orange-red (at risk)
//   ≥14d   → deep red  (critical)

export function overdueAgeBg(daysOverdue: number): string {
  if (daysOverdue >= 14) return heatmapBgForPct(8);   // deep red
  if (daysOverdue >= 7)  return heatmapBgForPct(13);  // orange-red
  return heatmapBgForPct(17);                          // amber
}

export function overdueAgeFg(daysOverdue: number): string {
  return heatmapFgForPct(daysOverdue >= 14 ? 8 : daysOverdue >= 7 ? 13 : 17);
}

// ─── Pre-built legend strips ──────────────────────────────────────────────────

export const HEATMAP_LEGEND_COLORS = [
  "#b71c1c", "#d32f2f", "#e53935", "#ff7043", "#ffab91",
  "#ffcc80", "#fff9c4", "#e6ee9c", "#c5e1a5", "#8bc34a", "#43a047", "#2e7d32", "#1b5e20",
];

export const HEATMAP_NEUTRAL_BG = "#eceff1";
