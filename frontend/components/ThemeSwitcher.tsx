"use client";

import React from "react";
import { useTheme, ThemeMode } from "@/context/ThemeContext";
import { Sun, Moon, Zap } from "lucide-react";

export default function ThemeSwitcher({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  const options: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { mode: "light", label: "فاتح", icon: <Sun className="w-3.5 h-3.5 text-amber-500" /> },
    { mode: "dark", label: "ليلي", icon: <Moon className="w-3.5 h-3.5 text-sky-400" /> },
    { mode: "contrast", label: "تباين عالي", icon: <Zap className="w-3.5 h-3.5 text-emerald-400" /> },
  ];

  return (
    <div
      className={`inline-flex items-center gap-1 p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs backdrop-blur-sm ${className}`}
      role="group"
      aria-label="تبديل مظهر المتجر"
    >
      {options.map((opt) => {
        const isActive = theme === opt.mode;
        return (
          <button
            key={opt.mode}
            type="button"
            onClick={() => setTheme(opt.mode)}
            title={`تفعيل المظهر: ${opt.label}`}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isActive
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-pink-200/60 dark:border-slate-600 font-black scale-100"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50"
            }`}
          >
            {opt.icon}
            <span className="hidden sm:inline-block text-[11px]">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
