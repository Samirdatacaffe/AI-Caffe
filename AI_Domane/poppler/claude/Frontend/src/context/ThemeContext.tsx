import { createContext, useContext, useState, useEffect, useCallback } from 'react';

type ColorMode = 'light' | 'auto' | 'dark';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  colorMode: ColorMode;
  theme: ResolvedTheme;
  setColorMode: (mode: ColorMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  colorMode: 'light',
  theme: 'light',
  setColorMode: () => {},
  toggleTheme: () => {},
});

export const useTheme = (): ThemeContextType => useContext(ThemeContext);

function getSystemTheme(): ResolvedTheme {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

function resolveTheme(mode: ColorMode): ResolvedTheme {
  if (mode === 'auto') return getSystemTheme();
  return mode;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [colorMode, setColorModeState] = useState<ColorMode>(() => {
    const saved = localStorage.getItem('colorMode') as ColorMode | null;
    if (saved === 'dark' || saved === 'auto' || saved === 'light') return saved;
    // Migrate old 'theme' key
    const oldTheme = localStorage.getItem('theme');
    if (oldTheme === 'dark') return 'dark';
    return 'light';
  });

  const [theme, setTheme] = useState<ResolvedTheme>(() => resolveTheme(colorMode));

  // Apply theme to DOM
  useEffect(() => {
    const resolved = resolveTheme(colorMode);
    setTheme(resolved);
    document.documentElement.setAttribute('data-theme', resolved);
    localStorage.setItem('colorMode', colorMode);
  }, [colorMode]);

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (colorMode !== 'auto') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const resolved = resolveTheme('auto');
      setTheme(resolved);
      document.documentElement.setAttribute('data-theme', resolved);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [colorMode]);

  const setColorMode = useCallback((mode: ColorMode) => {
    setColorModeState(mode);
  }, []);

  const toggleTheme = useCallback(() => {
    setColorModeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <ThemeContext.Provider value={{ colorMode, theme, setColorMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
