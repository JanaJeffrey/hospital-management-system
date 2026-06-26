"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function SimpleTheme() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else if (saved === "light") {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  // Don't render anything on server to avoid hydration mismatch
  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full transition-all hover:scale-105"
      style={{ 
        backgroundColor: "var(--card)", 
        border: "1px solid var(--border)",
        cursor: "pointer",
        color: "var(--text)"
      }}
      aria-label="Toggle dark mode"
    >
      {isDark ? (
        <Sun className="w-5 h-5" style={{ color: "rgb(251,191,36)" }} />
      ) : (
        <Moon className="w-5 h-5" style={{ color: "var(--text)" }} />
      )}
    </button>
  );
}