"use client";

import { useEffect, useState } from "react";
import { User } from "lucide-react";
import SimpleTheme from "./SimpleTheme";
import NotificationBell from "./NotificationBell";

export default function Header() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  return (
    <header className="sticky top-0 z-30 px-4 sm:px-6 py-3 flex justify-between items-center" style={{ backgroundColor: "var(--card)", borderBottom: "1px solid var(--border)" }}>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}>
          <span className="text-white font-bold text-sm">HMS</span>
        </div>
        <h1 className="text-lg sm:text-xl font-semibold" style={{ color: "var(--text)" }}>
          {user?.role?.toLowerCase() === "doctor" ? "Doctor Portal" : user?.role?.toLowerCase() === "admin" ? "Admin Portal" : "Patient Portal"}
        </h1>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        {/* ✅ Notification Bell - NOW VISIBLE */}
        <NotificationBell />
        
        {/* Theme Toggle */}
        <SimpleTheme />

        {/* User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-sm font-medium hidden sm:inline" style={{ color: "var(--text)" }}>
            {user?.name}
          </span>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}>
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
}