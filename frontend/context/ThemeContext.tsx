"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark" | "contrast";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("lolo_theme_mode") as ThemeMode | null;
    if (saved && (saved === "light" || saved === "dark" || saved === "contrast")) {
      setThemeState(saved);
      applyTheme(saved);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setThemeState("dark");
      applyTheme("dark");
    } else {
      applyTheme("light");
    }
  }, []);

  const applyTheme = (mode: ThemeMode) => {
    const root = document.documentElement;
    root.setAttribute("data-theme", mode);
    if (mode === "dark") {
      root.classList.add("dark");
      root.classList.remove("contrast");
    } else if (mode === "contrast") {
      root.classList.add("dark", "contrast");
    } else {
      root.classList.remove("dark", "contrast");
    }
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem("lolo_theme_mode", mode);
    applyTheme(mode);
  };

  const toggleTheme = () => {
    const next: ThemeMode = theme === "light" ? "dark" : theme === "dark" ? "contrast" : "light";
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
