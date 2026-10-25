import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { load, save } from '@/services/storageService';

const DEFAULTS = {
  sidebarCollapsed: false,
  theme: 'light',
  rowsPerPage: 8,
  reduceMotion: false,
  mutedCategories: [],
};

const PrefsContext = createContext(null);

export function PrefsProvider({ children }) {
  const [prefs, setPrefs] = useState(() => ({ ...DEFAULTS, ...load('prefs', {}) }));

  useEffect(() => {
    save('prefs', prefs);
  }, [prefs]);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = prefs.theme === 'dark' || (prefs.theme === 'system' && media.matches);
      root.classList.toggle('dark', dark);
    };
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [prefs.theme]);

  const setPref = useCallback((key, value) => setPrefs((p) => ({ ...p, [key]: value })), []);
  const toggleCategory = useCallback(
    (category) =>
      setPrefs((p) => ({
        ...p,
        mutedCategories: p.mutedCategories.includes(category)
          ? p.mutedCategories.filter((c) => c !== category)
          : [...p.mutedCategories, category],
      })),
    [],
  );

  const value = useMemo(() => ({ prefs, setPref, toggleCategory }), [prefs, setPref, toggleCategory]);

  return (
    <PrefsContext.Provider value={value}>
      <MotionConfig reducedMotion={prefs.reduceMotion ? 'always' : 'user'}>{children}</MotionConfig>
    </PrefsContext.Provider>
  );
}

export function usePrefs() {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error('usePrefs must be used within PrefsProvider');
  return ctx;
}
