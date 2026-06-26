"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Users, UserCheck, Calendar, FileText, 
  Activity, Clock, CheckCircle, XCircle, 
  RefreshCw, Shield, Stethoscope, Award,
  UserPlus, BarChart3, UserCog, Hospital,
  Eye, Trash2, Edit, UserX
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  patients: number;
  doctors: number;
  admins: number;
  pending: number;
  rejected: number;
  active: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    patients: 0,
    doctors: 0,
    admins: 0,
    pending: 0,
    rejected: 0,
    active: 0
  });
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [todayAppointments, setTodayAppointments] = useState(0);
  const [completedAppointments, setCompletedAppointments] = useState(0);
  const [cancelledAppointments, setCancelledAppointments] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (!token || !userStr) {
      router.replace("/login");
      return;
    }
    
    try {
      const user = JSON.parse(userStr);
      setIsAuthenticated(true);
      setAdminName(user.name || "Admin");
      
      if (user.role?.toLowerCase() !== "admin") {
        router.replace("/patient/dashboard");
        return;
      }
      
      setIsAdmin(true);
      fetchData();
    } catch (e) {
      router.replace("/login");
    }
  }, [router]);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    try {
      setIsLoading(true);
      setError("");
      
      // ✅ Fetch ALL users from backend
      const usersRes = await fetch("http://localhost:5000/api/auth/all-users", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (usersRes.ok) {
        const data = await usersRes.json();
        setStats(data.counts);
      }
      
      // ✅ Fetch appointments stats
      try {
        const statsRes = await fetch("http://localhost:5000/api/analytics/stats", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.overview) {
            setTotalAppointments(statsData.overview.totalAppointments || 0);
          }
          if (statsData.appointments && Array.isArray(statsData.appointments)) {
            const today = new Date().toDateString();
            const todayApps = statsData.appointments.filter((a: any) => 
              new Date(a.dateTime).toDateString() === today && a.status !== "CANCELLED"
            );
            setTodayAppointments(todayApps.length);
            setCompletedAppointments(statsData.appointments.filter((a: any) => a.status === "COMPLETED").length);
            setCancelledAppointments(statsData.appointments.filter((a: any) => a.status === "CANCELLED").length);
          }
        }
      } catch (e) {
        console.log("Could not fetch appointment stats:", e);
      }
      
    } catch (err: any) {
      console.error("Error fetching admin stats:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin && isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: "var(--text-light)" }}>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6" style={{ color: "rgb(16,185,129)" }} />
            <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Admin Dashboard</h1>
          </div>
          <p className="text-sm" style={{ color: "var(--text-light)" }}>
            Welcome back, {adminName} 👋 · {stats.totalUsers} total users · {stats.pending} pending
          </p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition hover:bg-gray-100 dark:hover:bg-gray-800"
          style={{ color: "var(--text)" }}
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* ✅ User Stats - REAL DATA */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="emerald" />
        <StatCard title="Patients" value={stats.patients} icon={UserCheck} color="blue" />
        <StatCard title="Doctors" value={stats.doctors} icon={Stethoscope} color="purple" />
        <StatCard title="Admins" value={stats.admins} icon={Shield} color="orange" />
      </div>

      {/* ✅ Status Stats - REAL DATA */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <StatCard title="Active" value={stats.active} icon={CheckCircle} color="emerald" />
        <StatCard title="Pending" value={stats.pending} icon={Clock} color="orange" />
        <StatCard title="Rejected" value={stats.rejected} icon={XCircle} color="red" />
      </div>

      {/* ✅ Appointment Stats - REAL DATA */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <StatCard title="Total Appointments" value={totalAppointments} icon={Calendar} color="emerald" />
        <StatCard title="Today's Appointments" value={todayAppointments} icon={Activity} color="blue" />
        <StatCard title="Completed" value={completedAppointments} icon={CheckCircle} color="purple" />
        <StatCard title="Cancelled" value={cancelledAppointments} icon={XCircle} color="red" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <AdminQuickAction
          icon={<UserCheck className="w-6 h-6" />}
          title="Verify Doctors"
          description={`${stats.pending} pending doctor${stats.pending !== 1 ? 's' : ''} awaiting approval`}
          count={stats.pending}
          href="/admin/doctors"
          color="emerald"
        />
        <AdminQuickAction
          icon={<Users className="w-6 h-6" />}
          title="Manage Users"
          description={`${stats.totalUsers} total users`}
          href="/admin/users"
          color="blue"
        />
        <AdminQuickAction
          icon={<Calendar className="w-6 h-6" />}
          title="All Appointments"
          description={`${totalAppointments} total appointments`}
          href="/admin/appointments"
          color="purple"
        />
      </div>
    </div>
  );
}

// ========== STAT CARD ==========
function StatCard({ title, value, icon: Icon, color }: { 
  title: string; 
  value: number | string; 
  icon: React.ElementType; 
  color: string;
}) {
  const getColorClasses = () => {
    switch (color) {
      case "emerald": return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400";
      case "blue": return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
      case "purple": return "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400";
      case "orange": return "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400";
      case "red": return "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400";
      default: return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400";
    }
  };
  
  return (
    <div className="rounded-2xl p-4 sm:p-5 transition-all hover:scale-[1.02] cursor-default" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm" style={{ color: "var(--text-light)" }}>{title}</p>
          <p className="text-xl sm:text-2xl font-bold mt-1" style={{ color: "var(--text)" }}>{value}</p>
        </div>
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${getColorClasses()}`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>
    </div>
  );
}

// ========== ADMIN QUICK ACTION ==========
function AdminQuickAction({ icon, title, description, count, href, color }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  count?: number;
  href: string;
  color: string;
}) {
  const getColor = () => {
    switch (color) {
      case "emerald": return "rgb(16,185,129)";
      case "blue": return "rgb(59,130,246)";
      case "purple": return "rgb(139,92,246)";
      default: return "rgb(16,185,129)";
    }
  };
  
  return (
    <Link href={href} className="group p-4 sm:p-5 rounded-2xl transition-all hover:scale-[1.02] hover:shadow-xl cursor-pointer" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${getColor()}15` }}>
            <span style={{ color: getColor() }}>{icon}</span>
          </div>
          <div>
            <h3 className="font-semibold text-sm sm:text-base" style={{ color: "var(--text)" }}>{title}</h3>
            <p className="text-xs sm:text-sm" style={{ color: "var(--text-light)" }}>{description}</p>
          </div>
        </div>
        {count !== undefined && count > 0 && (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: "rgba(239,68,68,0.15)", color: "rgb(239,68,68)" }}>
            {count}
          </span>
        )}
      </div>
    </Link>
  );
}