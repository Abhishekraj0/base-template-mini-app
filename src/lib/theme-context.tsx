"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Load theme from localStorage or user preferences
    const loadTheme = async () => {
      try {
        // First check localStorage
        const savedTheme = localStorage.getItem('ansluta_theme') as Theme;
        if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
          setThemeState(savedTheme);
          return;
        }

        // Then check user preferences from API
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const userData = await response.json();
          if (userData.theme) {
            setThemeState(userData.theme);
            localStorage.setItem('ansluta_theme', userData.theme);
          }
        }
      } catch (error) {
        console.error('Error loading theme:', error);
        // Fallback to light theme if there's an error
        setThemeState('light');
      }
    };

    loadTheme();
  }, []);

  useEffect(() => {
    const updateActualTheme = () => {
      if (theme === 'auto') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setActualTheme(systemPrefersDark ? 'dark' : 'light');
      } else {
        setActualTheme(theme);
      }
    };

    updateActualTheme();

    // Listen for system theme changes when in auto mode
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', updateActualTheme);
      return () => mediaQuery.removeEventListener('change', updateActualTheme);
    }
  }, [theme]);

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;
    
    if (actualTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [actualTheme]);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('ansluta_theme', newTheme);

    // Update user preferences in database
    try {
      await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme: newTheme,
        }),
      });
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const value = {
    theme,
    actualTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}