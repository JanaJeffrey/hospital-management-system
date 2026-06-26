"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { LayoutDashboard, Calendar, FileText, Users, Clock, Pill, FlaskConical, Video, Settings, LogOut, Menu, X } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false); // For mobile menu
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const isDoctor = pathname.includes("/doctor");

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const patientLinks = [
    { href: "/patient/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/patient/book-appointment", label: "Book Appointment", icon: Calendar },
    { href: "/patient/prescriptions", label: "Prescriptions", icon: Pill },
    { href: "/patient/lab-reports", label: "Lab Reports", icon: FlaskConical },
    { href: "/patient/video-consult", label: "Video Consult", icon: Video },
    { href: "/patient/records", label: "Medical Records", icon: FileText },
  ];

  const doctorLinks = [
    { href: "/doctor/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/doctor/manage-schedule", label: "Schedule", icon: Clock },
    { href: "/doctor/patients", label: "Patients", icon: Users },
    { href: "/doctor/prescriptions", label: "Prescriptions", icon: Pill },
    { href: "/doctor/lab-requests", label: "Lab Requests", icon: FlaskConical },
    { href: "/doctor/settings", label: "Settings", icon: Settings },
  ];

  const links = isDoctor ? doctorLinks : patientLinks;

  // Sidebar content (shared between mobile and desktop)
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
        {(!isDesktopCollapsed || window.innerWidth < 768) && <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">HMS</span>}
        <button
          onClick={() => window.innerWidth >= 768 && setIsDesktopCollapsed(!isDesktopCollapsed)}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 hidden md:block"
        >
          {isDesktopCollapsed ? "→" : "←"}
        </button>
        <button className="md:hidden p-1" onClick={() => setIsOpen(false)}>
          <X className="w-5 h-5" />
        </button>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Icon className="w-5 h-5" />
              {(!isDesktopCollapsed || window.innerWidth < 768) && <span className="text-sm font-medium">{link.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
          className="flex items-center gap-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full px-3 py-2 rounded-xl transition"
        >
          <LogOut className="w-5 h-5" />
          {(!isDesktopCollapsed || window.innerWidth < 768) && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button (visible on small screens) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md md:hidden"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Desktop sidebar (always visible, can be collapsed) */}
      <aside className={`hidden md:flex ${isDesktopCollapsed ? "w-20" : "w-64"} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 flex-col h-screen sticky top-0`}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar (overlay) */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-900 z-50 shadow-xl md:hidden flex flex-col">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}