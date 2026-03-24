"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-[104px] h-8" />;
  }

  const isDark = theme === "dark";

  return (
    <div className="flex items-center gap-0.5">
      {/* Sun Icon */}
      <button
        onClick={() => setTheme("light")}
        aria-label="Light mode"
        className="focus:outline-none"
      >
        <svg
          className={cn("w-[18px] h-[18px] transition-colors duration-300", !isDark ? "text-foreground" : "text-muted-foreground/50")}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </button>

      {/* Pill Switch */}
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className={cn(
          "relative inline-flex h-[28px] w-[52px] shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none shadow-inner border",
          isDark ? "bg-[#1c1c1e] border-[#262626]" : "bg-[#e5e5e5] border-transparent"
        )}
        style={{
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)"
        }}
      >
        <span className="sr-only">Toggle theme</span>
        <span
          className={cn(
            "pointer-events-none absolute left-[3px] h-[20px] w-[20px] transform rounded-full transition-all duration-300 ease-in-out",
            isDark
              ? "translate-x-[24px] bg-[#737373]"
              : "translate-x-0 bg-white shadow-md"
          )}
        />
      </button>

      {/* Moon Icon */}
      <button
        onClick={() => setTheme("dark")}
        aria-label="Dark mode"
        className="focus:outline-none"
      >
        <svg
          className={cn("w-[16px] h-[16px] transition-colors duration-300", isDark ? "text-foreground" : "text-muted-foreground/50")}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </button>
    </div>
  );
}
