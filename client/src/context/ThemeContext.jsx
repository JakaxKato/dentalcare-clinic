import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'dc_theme';
const VERSION_KEY = 'dc_theme_version';
const THEME_VERSION = 'yellow-white-v1';

const getInitialTheme = () => {
  const savedVersion = localStorage.getItem(VERSION_KEY);
  if (savedVersion !== THEME_VERSION) {
    localStorage.removeItem(STORAGE_KEY);
    return 'light';
  }
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return 'light';
};

const ThemeContext = createContext({
  theme: 'light',
  isDark: false,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
    localStorage.setItem(VERSION_KEY, THEME_VERSION);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
