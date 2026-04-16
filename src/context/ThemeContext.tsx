import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { createGlobalStyle } from 'styled-components';

type ThemeName = 'default' | 'owner' | 'owner-alt1' | 'owner-alt2' | 'owner-alt3';
type ColorScheme = 'light' | 'dark' | 'system';

const DarkModeOverrides = createGlobalStyle`
  html[data-color-scheme="dark"] {
    color-scheme: dark;
  }

  /* Override @procore/core-react styled-component backgrounds in dark mode.
     header and its children are excluded so GlobalHeader keeps --color-nav-bg.
     section is excluded because the broad override interferes with nested
     layout wrappers. */
  html[data-color-scheme="dark"] div[class]:not(header *, table *, [role="table"] *, [role="grid"] *, td *, th *),
  html[data-color-scheme="dark"] main[class],
  html[data-color-scheme="dark"] aside[class],
  html[data-color-scheme="dark"] article[class] {
    background-color: var(--color-surface-primary);
    color: var(--color-text-primary);
  }

 html[data-color-scheme="dark"] .table_container {
    border-color: transparent;
  }

  html[data-color-scheme="dark"] nav[class] a,
  html[data-color-scheme="dark"] nav[class] span {
    color: var(--color-text-secondary);
  }

  /* Primary buttons — core-react marks these with data-a11y-skip */
  html[data-color-scheme="dark"] button[data-a11y-skip="color-contrast"] {
    background: #f0f1f2 !important;
    color: #000 !important;
  }

  /* Secondary buttons — marked with data-variant="secondary" */
  html[data-color-scheme="dark"] button[data-variant="secondary"],
  html[data-color-scheme="dark"] button[class][aria-haspopup] {
    background: var(--color-surface-secondary) !important;
    color: #fff !important;
  }

  /* Tertiary buttons — white text by default so they're visible on dark
     backgrounds. Excludes Dropdown triggers (aria-haspopup), secondary
     (data-variant), and primary (data-a11y-skip). On hover/active/focus
     the rule stops matching and core-react's hover styles take over. */
  // html[data-color-scheme="dark"] button[class]:not(:hover):not(:active):not(:focus):not([aria-haspopup]):not([data-a11y-skip]):not([data-variant]) {
  //   color: var(--color-text-primary);
  // }

  html[data-color-scheme="dark"] [role="dialog"] > div[class] {
    background-color: var(--color-surface-primary);
  }

  /* Link text */
  html[data-color-scheme="dark"] a {
    color: var(--color-text-link);
  }
`;

interface ThemeContextValue {
  theme: ThemeName;
  colorScheme: ColorScheme;
  resolvedColorScheme: 'light' | 'dark';
  setTheme: (theme: ThemeName) => void;
  setColorScheme: (scheme: ColorScheme) => void;
}

const STORAGE_KEY = 'procore-theme-preference';

function getSystemColorScheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function loadPreference(): { theme: ThemeName; colorScheme: ColorScheme } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const validTheme = (['default', 'owner', 'owner-alt1', 'owner-alt2', 'owner-alt3'] as const).includes(parsed.theme) ? parsed.theme : 'owner';
      let colorScheme: ColorScheme = ['light', 'dark', 'system'].includes(parsed.colorScheme)
        ? parsed.colorScheme
        : 'light';
      if (validTheme === 'owner' && colorScheme === 'dark') colorScheme = 'light';
      return { theme: validTheme, colorScheme };
    }
  } catch { /* noop */ }
  return { theme: 'owner', colorScheme: 'light' };
}

function savePreference(theme: ThemeName, colorScheme: ColorScheme) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme, colorScheme }));
  } catch { /* noop */ }
}

function applyAttributes(theme: ThemeName, resolvedScheme: 'light' | 'dark') {
  const root = document.documentElement;
  if (theme === 'default') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }
  root.setAttribute('data-color-scheme', resolvedScheme);
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => loadPreference().theme);
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(() => loadPreference().colorScheme);
  const [resolvedColorScheme, setResolvedColorScheme] = useState<'light' | 'dark'>(() => {
    const pref = loadPreference();
    return pref.colorScheme === 'system' ? getSystemColorScheme() : (pref.colorScheme as 'light' | 'dark');
  });

  useEffect(() => {
    const resolved = colorScheme === 'system' ? getSystemColorScheme() : colorScheme;
    setResolvedColorScheme(resolved);
    applyAttributes(theme, resolved);

    if (colorScheme === 'system') {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => {
        const newScheme = e.matches ? 'dark' : 'light';
        setResolvedColorScheme(newScheme);
        applyAttributes(theme, newScheme);
      };
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    }
  }, [theme, colorScheme]);

  useEffect(() => {
    const timer = setTimeout(() => {
      document.documentElement.setAttribute('data-theme-transition', '');
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const setTheme = useCallback((t: ThemeName) => {
    setThemeState(t);
    savePreference(t, colorScheme);
  }, [colorScheme]);

  const setColorScheme = useCallback((s: ColorScheme) => {
    setColorSchemeState(s);
    savePreference(theme, s);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, colorScheme, resolvedColorScheme, setTheme, setColorScheme }}>
      <DarkModeOverrides />
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
