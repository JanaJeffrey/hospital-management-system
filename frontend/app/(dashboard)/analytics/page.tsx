"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, TrendingUp, Users, Clock, Calendar,
  Award, Star, BarChart3, Activity, CheckCircle,
  AlertCircle, Download, RefreshCw, Loader2,
  FileText, FlaskConical
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from "recharts";

// ✅ ADDED: Get the API URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  change?: string;
  color: string;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [userName, setUserName] = useState("");
  
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    completionRate: "0%",
    avgRating: "4.8 ★",
    activePatients: 0,
    pendingReports: 0,
    totalPrescriptions: 0,
    totalLabReports: 0
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (!token || !userStr) {
      router.replace("/login");
      return;
    }
    
    try {
      const user = JSON.parse(userStr);
      setUserRole(user.role?.toLowerCase() || "patient");
      setUserName(user.name || "User");
      setIsAuthenticated(true);
    } catch (e) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchAnalytics = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      try {
        setIsLoading(true);
        setError("");
        
        // ✅ CHANGED: Using environment variable instead of hardcoded localhost
        const trendsRes = await fetch(`${API_URL}/api/analytics/trends`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (trendsRes.status === 401 || trendsRes.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.replace("/login");
          return;
        }
        
        if (trendsRes.ok) {
          const trendsData = await trendsRes.json();
          setWeeklyData(trendsData);
        }
        
        // ✅ CHANGED: Using environment variable instead of hardcoded localhost
        const statsRes = await fetch(`${API_URL}/api/analytics/stats`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          
          if (userRole === "doctor") {
            setStats({
              totalAppointments: statsData.overview?.totalAppointments || 0,
              completionRate: statsData.overview?.completionRate || "0%",
              avgRating: "4.8 ★",
              activePatients: statsData.overview?.totalPatients || 0,
              pendingReports: statsData.overview?.pendingReports || 0,
              totalPrescriptions: statsData.overview?.totalPrescriptions || 0,
              totalLabReports: statsData.overview?.totalLabReports || 0
            });
          } else {
            setStats({
              totalAppointments: statsData.appointments?.total || 0,
              completionRate: statsData.appointments?.completed > 0 
                ? `${Math.round((statsData.appointments.completed / statsData.appointments.total) * 100)}%` 
                : "0%",
              avgRating: "4.8 ★",
              activePatients: 0,
              pendingReports: 0,
              totalPrescriptions: 0,
              totalLabReports: 0
            });
          }
        }
        
      } catch (err: any) {
        console.error("Error fetching analytics:", err);
        setError(err.message || "Failed to load analytics");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [isAuthenticated, userRole, router]);

  const exportCSV = () => {
    if (weeklyData.length === 0) {
      setError("No data to export");
      return;
    }
    
    let csv = "Day,Appointments,Completed,Cancelled\n";
    weeklyData.forEach((day: any) => {
      csv += `${day.day},${day.appointments},${day.completed || 0},${day.cancelled || 0}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appointment-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: "rgb(16,185,129)" }} />
          <p style={{ color: "var(--text-light)" }}>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={userRole === "doctor" ? "/doctor/dashboard" : "/patient/dashboard"}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: "var(--text)" }} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
              Analytics Dashboard
            </h1>
            <p className="text-sm" style={{ color: "var(--text-light)" }}>
              Welcome, {userName} 👋 · Real-time insights
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition hover:bg-gray-100 dark:hover:bg-gray-800"
            style={{ color: "var(--text)" }}
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-white transition hover:scale-105"
            style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl flex items-start gap-3" style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "rgb(239,68,68)" }} />
          <div>
            <p className="font-medium" style={{ color: "rgb(239,68,68)" }}>Failed to load</p>
            <p className="text-sm" style={{ color: "rgb(239,68,68)" }}>{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <StatCard
          title="Total Appointments"
          value={stats.totalAppointments}
          icon={Calendar}
          change="+12%"
          color="emerald"
        />
        <StatCard
          title="Completion Rate"
          value={stats.completionRate}
          icon={CheckCircle}
          change="+5%"
          color="blue"
        />
        <StatCard
          title="Avg. Rating"
          value={stats.avgRating}
          icon={Star}
          change="+0.2"
          color="purple"
        />
        <StatCard
          title={userRole === "doctor" ? "Active Patients" : "Health Score"}
          value={userRole === "doctor" ? stats.activePatients : "92%"}
          icon={Users}
          change="+18%"
          color="orange"
        />
      </div>

      {userRole === "doctor" && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <StatCard title="Pending Reports" value={stats.pendingReports} icon={AlertCircle} color="orange" />
          <StatCard title="Prescriptions" value={stats.totalPrescriptions} icon={FileText} color="purple" />
          <StatCard title="Lab Reports" value={stats.totalLabReports} icon={FlaskConical} color="blue" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-4 sm:p-6" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold" style={{ color: "var(--text)" }}>Weekly Activity</h3>
              <p className="text-sm" style={{ color: "var(--text-light)" }}>Last 7 days</p>
            </div>
            <Activity className="w-5 h-5" style={{ color: "var(--text-light)" }} />
          </div>
          <div className="h-64">
            {weeklyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="appointmentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" stroke="var(--text-light)" />
                  <YAxis stroke="var(--text-light)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="appointments"
                    stroke="#10b981"
                    fill="url(#appointmentGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p style={{ color: "var(--text-light)" }}>No data available</p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl p-4 sm:p-6" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
          <h3 className="font-semibold mb-4" style={{ color: "var(--text)" }}>Quick Insights</h3>
          <div className="space-y-3">
            <InsightCard
              icon={<TrendingUp className="w-4 h-4" />}
              title="Peak Activity"
              value={weeklyData.length > 0 ? `${Math.max(...weeklyData.map(d => d.appointments))} appointments` : "No data"}
              description={weeklyData.length > 0 ? `On ${weeklyData.reduce((a, b) => a.appointments > b.appointments ? a : b).day}` : ""}
              color="emerald"
            />
            <InsightCard
              icon={<Clock className="w-4 h-4" />}
              title="Average per Day"
              value={weeklyData.length > 0 ? `${Math.round(weeklyData.reduce((sum, d) => sum + d.appointments, 0) / weeklyData.length)} appointments` : "No data"}
              description="Last 7 days average"
              color="blue"
            />
            <InsightCard
              icon={<CheckCircle className="w-4 h-4" />}
              title="Completion Rate"
              value={stats.completionRate}
              description={userRole === "doctor" ? "Of all scheduled appointments" : "Of your appointments"}
              color="purple"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, change, color }: StatCardProps) {
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
          {change && (
            <p className="text-xs mt-1" style={{ color: "rgb(16,185,129)" }}>{change}</p>
          )}
        </div>
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${getColorClasses()}`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>
    </div>
  );
}

function InsightCard({ icon, title, value, description, color }: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  color: string;
}) {
  const getColor = () => {
    switch (color) {
      case "emerald": return "rgb(16,185,129)";
      case "blue": return "rgb(59,130,246)";
      case "purple": return "rgb(139,92,246)";
      case "orange": return "rgb(234,179,8)";
      default: return "rgb(16,185,129)";
    }
  };
  
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl transition hover:bg-gray-50 dark:hover:bg-gray-800" style={{ backgroundColor: "var(--input-bg)" }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${getColor()}15` }}>
        <span style={{ color: getColor() }}>{icon}</span>
      </div>
      <div className="flex-1">
        <p className="text-xs" style={{ color: "var(--text-light)" }}>{title}</p>
        <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>{value}</p>
        <p className="text-xs" style={{ color: "var(--text-light)" }}>{description}</p>
      </div>
    </div>
  );
}