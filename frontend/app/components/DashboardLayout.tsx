"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Menu, X, LayoutDashboard, Calendar, Clock, Users,
  Pill, FlaskConical, Video, Settings, LogOut,
  Stethoscope, FileText, BarChart3, Shield, Home,
  Activity, Award, UserCheck, ClipboardList
} from "lucide-react";
import SimpleTheme from "./SimpleTheme";
import NotificationBell from "./NotificationBell";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDoctor, setIsDoctor] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userStr);
      setUser(parsedUser);
      setIsAdmin(parsedUser.role?.toLowerCase() === 'admin');
      setIsDoctor(parsedUser.role?.toLowerCase() === 'doctor');
    } catch (e) {
      router.push("/login");
    }
  }, [router]);

  // ✅ PATIENT NAVIGATION LINKS
  const patientLinks = [
    { href: "/patient/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/patient/book-appointment", label: "Book Appointment", icon: Calendar },
    { href: "/patient/prescriptions", label: "Prescriptions", icon: Pill },
    { href: "/patient/lab-reports", label: "Lab Reports", icon: FlaskConical },
    { href: "/patient/video-consult", label: "Video Consult", icon: Video },
    { href: "/patient/records", label: "Medical Records", icon: FileText },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  // ✅ DOCTOR NAVIGATION LINKS
  const doctorLinks = [
    { href: "/doctor/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/doctor/schedule", label: "My Schedule", icon: Clock },
    { href: "/doctor/patients", label: "Patients", icon: Users },
    { href: "/doctor/prescriptions", label: "Prescriptions", icon: Pill },
    { href: "/doctor/lab-requests", label: "Lab Requests", icon: FlaskConical },
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
  ];

  // ✅ ADMIN NAVIGATION LINKS
  const adminLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/doctors", label: "Doctor Verification", icon: UserCheck },
    { href: "/admin/users", label: "Manage Users", icon: Users },
    { href: "/admin/appointments", label: "All Appointments", icon: Calendar },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
  ];

  // ✅ BUILD LINKS BASED ON ROLE
  let links: any[] = [];

  if (isAdmin) {
    links = [...adminLinks];
  } else if (isDoctor) {
    links = [...doctorLinks];
  } else {
    links = [...patientLinks];
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    window.location.href = "/login";
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-xl lg:hidden"
        style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
      >
        <Menu className="w-5 h-5" style={{ color: "var(--text)" }} />
      </button>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0 overflow-y-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        style={{
          backgroundColor: "var(--card)",
          borderRight: "1px solid var(--border)",
          scrollbarWidth: "thin",
          scrollbarColor: "var(--border) transparent"
        }}
      >
        {/* Custom Scrollbar Styles */}
        <style jsx>{`
          aside::-webkit-scrollbar {
            width: 4px;
          }
          aside::-webkit-scrollbar-track {
            background: transparent;
          }
          aside::-webkit-scrollbar-thumb {
            background: var(--border);
            border-radius: 4px;
          }
          aside::-webkit-scrollbar-thumb:hover {
            background: var(--text-light);
          }
        `}</style>

        {/* Sidebar Header - Sticky */}
        <div className="sticky top-0 p-5 border-b" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", zIndex: 10 }}>
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2" onClick={closeSidebar}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}>
                <Stethoscope className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg" style={{ color: "var(--text)" }}>
                MediCare<span style={{ color: "rgb(16,185,129)" }}>Hub</span>
              </span>
            </Link>
            <button
              onClick={closeSidebar}
              className="p-1 rounded-lg lg:hidden"
              style={{ color: "var(--text-light)" }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="p-5 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(16,185,129,0.15)" }}>
              <span className="font-bold" style={{ color: "rgb(16,185,129)" }}>
                {user?.name?.charAt(0) || "U"}
              </span>
            </div>
            <div>
              <p className="font-medium" style={{ color: "var(--text)" }}>{user?.name || "User"}</p>
              <p className="text-xs capitalize" style={{ color: "var(--text-light)" }}>
                {user?.role || "Patient"}
                {isAdmin && " ⭐"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links - Scrollable */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto" style={{ maxHeight: "calc(100vh - 280px)" }}>
          {links.map((link: any) => {
            const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${isActive
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                    : "hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                  }`}
                style={!isActive ? { color: "var(--text)" } : {}}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button - Sticky Bottom */}
        <div className="sticky bottom-0 p-4 border-t" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all hover:bg-red-50 dark:hover:bg-red-900/20"
            style={{ color: "rgb(239,68,68)" }}
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Header */}
        <header className="sticky top-0 z-30 px-4 py-3 border-b lg:px-6" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center lg:hidden" style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}>
                <Stethoscope className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-semibold lg:text-xl" style={{ color: "var(--text)" }}>
                {isDoctor ? "Doctor Portal" : isAdmin ? "Admin Portal" : "Patient Portal"}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <SimpleTheme />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(16,185,129,0.15)" }}>
                  <span className="text-sm font-medium" style={{ color: "rgb(16,185,129)" }}>
                    {user?.name?.charAt(0) || "U"}
                  </span>
                </div>
                <span className="text-sm font-medium hidden sm:block" style={{ color: "var(--text)" }}>
                  {user?.name || "User"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}