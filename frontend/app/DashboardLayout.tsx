"use client";

import { usePathname } from "next/navigation";
import AuthGuard from "./components/AuthGuard";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Only show sidebar/header on dashboard pages (not login, register, or homepage)
  const isDashboardPage = pathname?.startsWith("/patient") || pathname?.startsWith("/doctor");
  
  if (!isDashboardPage) {
    return <>{children}</>;
  }

  return (
    <AuthGuard>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}