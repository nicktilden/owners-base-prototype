/**
 * HIGHCHARTS — shared setup
 *
 * Import this module in components that use Highcharts. It registers required
 * modules (HighchartsMore, SolidGauge, Accessibility) and applies design-system
 * defaults. All components must be rendered client-side only (dynamic import
 * with ssr: false) because Highcharts requires the DOM.
 *
 * Usage in a component:
 *   import Highcharts from '@/lib/highcharts';
 */

import * as Highcharts from 'highcharts';
import HighchartsMore from 'highcharts/highcharts-more';
import SolidGauge from 'highcharts/modules/solid-gauge';
import Accessibility from 'highcharts/modules/accessibility';

// Register modules (idempotent)
if (typeof HighchartsMore === 'function') (HighchartsMore as (h: unknown) => void)(Highcharts);
if (typeof SolidGauge === 'function') (SolidGauge as (h: unknown) => void)(Highcharts);
if (typeof Accessibility === 'function') (Accessibility as (h: unknown) => void)(Highcharts);

// ─── Design-system theme defaults ────────────────────────────────────────────

Highcharts.setOptions({
  chart: {
    backgroundColor: 'transparent',
    style: { fontFamily: 'Inter, system-ui, sans-serif' },
    animation: { duration: 400 },
  },
  title:    { text: undefined },
  subtitle: { text: undefined },
  credits:  { enabled: false },
  legend:   { enabled: false },
  tooltip: {
    borderRadius: 8,
    borderWidth: 0,
    shadow: false,
    style: { fontSize: '13px' },
  },
  colors: ['#566578', '#10b981', '#f59e0b', '#ef4444', '#8a97a7', '#3c4856'],
  plotOptions: {
    series: { animation: { duration: 400 } },
  },
});

export default Highcharts;

// ─── Shared color constants ───────────────────────────────────────────────────

export const HC_COLORS = {
  green:     '#10b981',
  greenMid:  '#34d399',
  yellow:    '#f59e0b',
  red:       '#ef4444',
  track:     '#e8ebef',
  text:      '#566578',
  textLight: '#8a97a7',
  gridLine:  '#e8ebef',
} as const;
