"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Calendar, Clock, Users, Pill, FileText, 
  Plus, ChevronRight, Activity, TrendingUp,
  Stethoscope, Video, MessageSquare, Settings,
  CheckCircle, XCircle, AlertCircle, Award,
  RefreshCw
} from "lucide-react";

// ✅ ADDED: Get the API URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Appointment {
  id: number;
  patientId: number;
  dateTime: string;
  status: string;
  reason: string | null;
  patient: {
    name: string;
    email: string;
  };
}

interface DoctorStats {
  overview: {
    totalPatients: number;
    todayPatients: number;
    weeklyAppointments: number;
    completionRate: string;
    totalAppointments: number;
    pendingReports: number;
    totalPrescriptions: number;
    totalLabReports: number;
  };
  appointments: Appointment[];
}

export default function DoctorDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DoctorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [doctorName, setDoctorName] = useState("");
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [videoConsultError, setVideoConsultError] = useState("");

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (!token || !userStr) {
      router.replace("/login");
      return;
    }
    
    try {
      const user = JSON.parse(userStr);
      const userRole = user.role?.toLowerCase();
      if (userRole !== "doctor") {
        router.replace("/patient/dashboard");
        return;
      }
      setDoctorName(user.name || "Doctor");
      setIsAuthenticated(true);
    } catch (e) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.replace("/login");
    }
  }, [router]);

  // Fetch doctor stats
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchStats = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }
      
      try {
        setIsLoading(true);
        setError("");
        
        // ✅ CHANGED: Using environment variable instead of hardcoded localhost
        const response = await fetch(`${API_URL}/api/analytics/stats`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.replace("/login");
          return;
        }
        
        if (!response.ok) throw new Error("Failed to fetch doctor stats");
        
        const statsData = await response.json();
        setData(statsData);
        
      } catch (err: any) {
        console.error("Error fetching doctor stats:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, [isAuthenticated, router]);

  // ✅ Handle Video Consult click
  const handleVideoConsult = () => {
    const appointments = data?.appointments || [];
    
    // Find the first upcoming appointment (CONFIRMED or PENDING)
    const now = new Date();
    const upcoming = appointments
      .filter((apt: any) => 
        (apt.status === "CONFIRMED" || apt.status === "PENDING") && 
        new Date(apt.dateTime) > now
      )
      .sort((a: any, b: any) => 
        new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
      );
    
    if (upcoming.length === 0) {
      setVideoConsultError("No upcoming appointments available for video consultation.");
      // Clear error after 5 seconds
      setTimeout(() => setVideoConsultError(""), 5000);
      return;
    }
    
    // Navigate to video consult with the first upcoming appointment
    router.push(`/doctor/video-consult?appointmentId=${upcoming[0].id}`);
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "PENDING": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "CANCELLED": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "COMPLETED": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONFIRMED": return <CheckCircle className="w-3 h-3" />;
      case "PENDING": return <AlertCircle className="w-3 h-3" />;
      case "CANCELLED": return <XCircle className="w-3 h-3" />;
      case "COMPLETED": return <CheckCircle className="w-3 h-3" />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "CONFIRMED": return "Confirmed";
      case "PENDING": return "Waiting";
      case "CANCELLED": return "Cancelled";
      case "COMPLETED": return "Completed";
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: "var(--text-light)" }}>Loading your schedule...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold" style={{ color: "var(--text)" }}>Something went wrong</h2>
          <p className="mt-2" style={{ color: "var(--text-light)" }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 rounded-xl text-white"
            style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Use real data from backend or fallback to empty
  const stats = data?.overview || {
    totalPatients: 0,
    todayPatients: 0,
    weeklyAppointments: 0,
    completionRate: "0%",
    totalAppointments: 0,
    pendingReports: 0,
    totalPrescriptions: 0,
    totalLabReports: 0
  };

  const appointments = data?.appointments || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--text)" }}>
            Good morning, Dr. {doctorName} 👨‍⚕️
          </h1>
          <p className="mt-1" style={{ color: "var(--text-light)" }}>
            Here's your schedule and patient overview for today.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition hover:bg-gray-100 dark:hover:bg-gray-800"
          style={{ color: "var(--text)" }}
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Video Consult Error Message */}
      {videoConsultError && (
        <div className="p-4 rounded-xl flex items-start gap-3" style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "rgb(239,68,68)" }} />
          <div>
            <p className="font-medium" style={{ color: "rgb(239,68,68)" }}>No Appointment Available</p>
            <p className="text-sm" style={{ color: "rgb(239,68,68)" }}>{videoConsultError}</p>
          </div>
        </div>
      )}

      {/* Stats Cards - ALL REAL DATA */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <StatCard title="Today's Patients" value={stats.todayPatients} icon={Users} color="emerald" />
        <StatCard title="Weekly Appointments" value={stats.weeklyAppointments} icon={Calendar} color="blue" />
        <StatCard title="Pending Reports" value={stats.pendingReports} icon={FileText} color="purple" />
        <StatCard title="Completion Rate" value={stats.completionRate} icon={Award} color="orange" />
      </div>

      {/* Extra Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <StatCard title="Total Patients" value={stats.totalPatients} icon={Users} color="emerald" />
        <StatCard title="Total Appointments" value={stats.totalAppointments} icon={Calendar} color="blue" />
        <StatCard title="Prescriptions" value={stats.totalPrescriptions} icon={Pill} color="purple" />
        <StatCard title="Lab Reports" value={stats.totalLabReports} icon={FileText} color="orange" />
      </div>

      {/* Today's Schedule + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="p-4 sm:p-5 border-b" style={{ borderColor: "var(--border)" }}>
            <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>Today's Schedule</h2>
            <p className="text-sm" style={{ color: "var(--text-light)" }}>Your appointments for today</p>
          </div>
          
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {appointments.length === 0 ? (
              <div className="p-8 sm:p-10 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" style={{ color: "var(--text-light)" }} />
                <p style={{ color: "var(--text-light)" }}>No appointments scheduled for today</p>
              </div>
            ) : (
              appointments.slice(0, 5).map((apt) => (
                <div key={apt.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(16,185,129,0.1)" }}>
                      <Users className="w-5 h-5" style={{ color: "rgb(16,185,129)" }} />
                    </div>
                    <div>
                      <h3 className="font-medium" style={{ color: "var(--text)" }}>{apt.patient.name}</h3>
                      <p className="text-sm" style={{ color: "var(--text-light)" }}>
                        {formatTime(apt.dateTime)} · {apt.reason || "General consultation"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                      {getStatusIcon(apt.status)} {getStatusText(apt.status)}
                    </span>
                    <Link 
                      href={`/doctor/appointments/${apt.id}`}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                      <ChevronRight className="w-4 h-4" style={{ color: "var(--text-light)" }} />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="p-4 sm:p-5 border-b" style={{ borderColor: "var(--border)" }}>
            <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>Quick Actions</h2>
            <p className="text-sm" style={{ color: "var(--text-light)" }}>Common tasks</p>
          </div>
          
          <div className="p-4 space-y-3">
            <QuickActionCard
              icon={<Pill className="w-4 h-4" />}
              title="Write Prescription"
              description="Create a new prescription"
              color="emerald"
              onClick={() => router.push("/doctor/prescriptions")}
            />
            <QuickActionCard
              icon={<FileText className="w-4 h-4" />}
              title="Request Lab Test"
              description="Order blood work or imaging"
              color="purple"
              onClick={() => router.push("/doctor/lab-requests")}
            />
            <QuickActionCard
              icon={<Clock className="w-4 h-4" />}
              title="Block Time Off"
              description="Mark unavailable hours"
              color="red"
              onClick={() => {/* Add your time off logic */}}
            />
            <QuickActionCard
              icon={<Video className="w-4 h-4" />}
              title="Start Video Consult"
              description="Connect with patient remotely"
              color="blue"
              onClick={handleVideoConsult}
            />
          </div>
        </div>
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

// ========== QUICK ACTION CARD ==========
function QuickActionCard({ icon, title, description, color, onClick }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  onClick: () => void;
}) {
  const getBgColor = () => {
    switch (color) {
      case "emerald": return "rgba(16,185,129,0.08)";
      case "purple": return "rgba(139,92,246,0.08)";
      case "red": return "rgba(239,68,68,0.08)";
      case "blue": return "rgba(59,130,246,0.08)";
      default: return "rgba(16,185,129,0.08)";
    }
  };
  
  const getIconBg = () => {
    switch (color) {
      case "emerald": return "rgba(16,185,129,0.15)";
      case "purple": return "rgba(139,92,246,0.15)";
      case "red": return "rgba(239,68,68,0.15)";
      case "blue": return "rgba(59,130,246,0.15)";
      default: return "rgba(16,185,129,0.15)";
    }
  };
  
  const getTextColor = () => {
    switch (color) {
      case "emerald": return "rgb(16,185,129)";
      case "purple": return "rgb(139,92,246)";
      case "red": return "rgb(239,68,68)";
      case "blue": return "rgb(59,130,246)";
      default: return "rgb(16,185,129)";
    }
  };
  
  return (
    <button 
      onClick={onClick}
      className="w-full p-3 sm:p-4 text-left rounded-xl transition-all hover:scale-[1.02] cursor-pointer" 
      style={{ backgroundColor: getBgColor() }}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: getIconBg() }}>
          <span style={{ color: getTextColor() }}>{icon}</span>
        </div>
        <div>
          <p className="font-medium text-sm sm:text-base" style={{ color: "var(--text)" }}>{title}</p>
          <p className="text-xs" style={{ color: "var(--text-light)" }}>{description}</p>
        </div>
      </div>
    </button>
  );
}