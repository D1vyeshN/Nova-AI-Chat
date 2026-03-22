"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
  isLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const getSystemTheme = (): Theme => {
    if (typeof window !== 'undefined') {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "dark"; // Fallback for SSR
  };

  const [theme, setTheme] = useState<Theme>(getSystemTheme());
  const [resolvedTheme, setResolvedTheme] = useState<Theme>(getSystemTheme());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("nova-theme") as Theme;
    if (saved && ["light", "dark"].includes(saved)) {
      setTheme(saved);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("nova-theme", theme);
  }, [theme]);

  useEffect(() => {
    // Apply theme immediately to prevent flash
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    setResolvedTheme(theme);
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = () => {
      // Only auto-update if user hasn't manually set a preference
      const saved = localStorage.getItem("nova-theme");
      if (!saved) {
        const systemTheme = mediaQuery.matches ? "dark" : "light";
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(systemTheme);
        setTheme(systemTheme);
        setResolvedTheme(systemTheme);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme, isLoaded }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
