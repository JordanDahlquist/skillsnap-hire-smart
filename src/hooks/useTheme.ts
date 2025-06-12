
import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'white' | 'black' | 'system';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first, fallback to system preference
    const stored = localStorage.getItem('theme') as Theme;
    return stored || 'system';
  });

  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes first
    root.classList.remove('dark', 'white', 'black');
    
    let effectiveTheme = theme;
    if (theme === 'system') {
      effectiveTheme = systemTheme;
    }
    
    // Apply appropriate theme class
    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
    } else if (effectiveTheme === 'white') {
      root.classList.add('white');
    } else if (effectiveTheme === 'black') {
      root.classList.add('black');
    }
    // 'light' doesn't need a class - it's the default
  }, [theme, systemTheme]);

  // Persist theme preference
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      // Cycle through all theme options: light -> dark -> white -> black -> light
      switch (prev) {
        case 'light':
        case 'system':
          return 'dark';
        case 'dark':
          return 'white';
        case 'white':
          return 'black';
        case 'black':
          return 'light';
        default:
          return 'light';
      }
    });
  };

  const getEffectiveTheme = () => {
    if (theme === 'system') {
      return systemTheme;
    }
    return theme;
  };

  const currentTheme = getEffectiveTheme();

  return {
    theme,
    currentTheme,
    setTheme,
    toggleTheme,
    isDark: currentTheme === 'dark' || currentTheme === 'black'
  };
};
