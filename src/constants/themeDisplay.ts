/**
 * Appearance presets in Profile → Preferences.
 * Labels align with design-token families in `src/styles/globals.css`
 * (`--p-metal-*`, `--p-slate-*`, `--p-evergreen-*`) and product naming
 * (“Procore” standard UI vs “Owners” experience).
 */
export type ThemePresetId =
  | 'owner-light'
  | 'owner-alt1-light'
  | 'owner-alt2-light'
  | 'default-light'
  | 'owner-alt1-dark'
  | 'owner-alt2-dark'
  | 'owner-alt3-dark'
  | 'default-dark';

export interface ThemePresetPreview {
  surface: string;
  nav: string;
  accent: string;
  muted: string;
}

export interface ThemeAppearancePreset {
  value: ThemePresetId;
  /** Short label under the preview card */
  label: string;
  preview: ThemePresetPreview;
}

export const THEME_APPEARANCE_PRESETS: ThemeAppearancePreset[] = [
  {
    value: 'owner-light',
    label: 'Owners — Metal (light)',
    preview: { surface: '#f2f4f6', nav: '#212833', accent: '#455261', muted: '#b8c1cc' },
  },
  {
    value: 'owner-alt1-light',
    label: 'Owners — Slate (light)',
    preview: { surface: '#f0f3f7', nav: '#1e2836', accent: '#3e5268', muted: '#adbfcf' },
  },
  {
    value: 'owner-alt2-light',
    label: 'Owners — Metal (light, black actions)',
    preview: { surface: '#f2f4f6', nav: '#212833', accent: '#000000', muted: '#b8c1cc' },
  },
  {
    value: 'default-light',
    label: 'Procore (light)',
    preview: { surface: '#ffffff', nav: '#000000', accent: '#FF5200', muted: '#d6dadc' },
  },
  {
    value: 'owner-alt1-dark',
    label: 'Owners — Slate (dark)',
    preview: { surface: '#10141c', nav: '#0a0e14', accent: '#637a94', muted: '#2e3d50' },
  },
  {
    value: 'owner-alt2-dark',
    label: 'Owners — Evergreen (dark)',
    preview: { surface: '#0e1410', nav: '#080f0e', accent: '#5e9188', muted: '#28453f' },
  },
  {
    value: 'owner-alt3-dark',
    label: 'Owners — Metal (dark)',
    preview: { surface: '#252c38', nav: '#1c2330', accent: '#6f7e90', muted: '#38414f' },
  },
  {
    value: 'default-dark',
    label: 'Procore (dark)',
    preview: { surface: '#181818', nav: '#000000', accent: '#f69565', muted: '#3f4549' },
  },
];
