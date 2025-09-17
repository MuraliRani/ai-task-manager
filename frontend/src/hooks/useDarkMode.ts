'use client';

import { useState, useEffect } from 'react';

export const useDarkMode = () => {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const shouldBeDark = savedTheme === 'dark' || (savedTheme === null && systemDark);
    setIsDark(shouldBeDark);
    
    // Apply theme to document
    updateTheme(shouldBeDark);
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem('theme') === null) {
        setIsDark(e.matches);
        updateTheme(e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const updateTheme = (dark: boolean) => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const toggleDarkMode = () => {
    if (!mounted) return;
    
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    // Save preference
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
    
    // Apply to document
    updateTheme(newIsDark);
  };

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return { isDark: false, toggleDarkMode: () => {} };
  }

  return { isDark, toggleDarkMode };
};