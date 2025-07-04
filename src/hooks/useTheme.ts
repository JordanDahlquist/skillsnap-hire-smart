
import { useState, useEffect } from 'react';

type Theme = 'white' | 'black' | 'system';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage and migrate old themes
    const stored = localStorage.getItem('theme') as Theme | 'light' | 'dark';
    
    // Migrate old themes
    if (stored === 'light') {
      return 'white';
    } else if (stored === 'dark') {
      return 'black';
    } else if (stored === 'white' || stored === 'black' || stored === 'system') {
      return stored;
    }
    
    // Default to white
    return 'white';
  });

  const [systemTheme, setSystemTheme] = useState<'white' | 'black'>(() => {
    // System theme now maps to white/black instead of light/dark
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'black' : 'white';
  });

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'black' : 'white');
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
    if (effectiveTheme === 'black') {
      root.classList.add('black');
    } else if (effectiveTheme === 'white') {
      root.classList.add('white');
    }
    // Default is white, no class needed
  }, [theme, systemTheme]);

  // Persist theme preference
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      // Cycle through: white -> black -> system -> white
      switch (prev) {
        case 'white':
          return 'black';
        case 'black':
          return 'system';
        case 'system':
          return 'white';
        default:
          return 'white';
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
    isDark: currentTheme === 'black'
  };
};
