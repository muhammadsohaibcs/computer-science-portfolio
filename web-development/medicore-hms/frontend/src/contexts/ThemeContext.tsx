/**
 * Theme Context
 * Provides theme state and toggle functionality throughout the application
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * Theme type
 */
type Theme = 'light' | 'dark';

/**
 * Theme Context State
 */
interface ThemeContextState {
  theme: Theme;
  toggleTheme: () => void;
}

/**
 * Theme Context
 */
const ThemeContext = createContext<ThemeContextState | undefined>(undefined);

/**
 * Theme Provider Props
 */
interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Theme Provider Component
 * Manages theme state and provides theme functions to children
 */
export function ThemeProvider({ children }: ThemeProviderProps): JSX.Element {
  const [theme, setTheme] = useState<Theme>(() => {
    // Initialize theme from localStorage or default to light
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    return savedTheme || 'light';
  });

  /**
   * Apply theme to document root
   */
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove previous theme class
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    root.classList.add(theme);
    
    // Persist theme preference
    localStorage.setItem('theme', theme);
  }, [theme]);

  /**
   * Toggles between light and dark theme
   */
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const value: ThemeContextState = {
    theme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Hook to use theme context
 * @throws Error if used outside of ThemeProvider
 */
export function useTheme(): ThemeContextState {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}
