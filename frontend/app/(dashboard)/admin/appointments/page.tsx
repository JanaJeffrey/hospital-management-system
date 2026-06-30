"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Calendar, Clock, Users, 
  Search, Eye, RefreshCw, AlertCircle,
  CheckCircle, XCircle, Clock as ClockIcon,
  User, Stethoscope, Filter, ChevronRight
} from "lucide-react";

// ✅ FIXED: Correct Render URL (medicurehub, NOT medicinehub)
// ✅ FIXED: No /api at the end (will add /api in the fetch call)
const API_URL = 'https://medicurehub-backend.onrender.com';

interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  dateTime: string;
  status: string;
  reason: string | null;
  patient: {
    name: string;
    email: string;
  };
  doctor: {
    name: string;
    email: string;
  };
}

export default function AdminAppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminName, setAdminName] = useState("");

  // Check authentication and admin role
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
        if (user.role?.toLowerCase() === "doctor") {
          router.replace("/doctor/dashboard");
        } else {
          router.replace("/patient/dashboard");
        }
        return;
      }
      
      setIsAdmin(true);
      fetchAppointments();
    } catch (e) {
      router.replace("/login");
    }
  }, [router]);

  const fetchAppointments = async () => {
  const token = localStorage.getItem("token");
  if (!token) return;
  
  try {
    setIsLoading(true);
    setError("");
    
    // ✅ FIXED: Using correct API_URL with /api
    const response = await fetch(`${API_URL}/api/analytics/stats`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.replace("/login");
      return;
    }
    
    if (!response.ok) throw new Error("Failed to fetch appointments");
    
    const data = await response.json();
    
    // ✅ Ensure appointments is always an array
    let appointmentsList = [];
    if (data.appointments && Array.isArray(data.appointments)) {
      appointmentsList = data.appointments;
    } else if (data.overview) {
      // If no appointments list, create empty array
      appointmentsList = [];
    }
    
    setAppointments(appointmentsList);
    
  } catch (err: any) {
    console.error("Error fetching appointments:", err);
    setError(err.message || "Failed to load appointments");
  } finally {
    setIsLoading(false);
  }
};

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
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
      case "PENDING": return <ClockIcon className="w-3 h-3" />;
      case "CANCELLED": return <XCircle className="w-3 h-3" />;
      case "COMPLETED": return <CheckCircle className="w-3 h-3" />;
      default: return null;
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          apt.doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (apt.reason && apt.reason.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === "ALL" || apt.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (!isAdmin && isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: "var(--text-light)" }}>Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link 
            href="/admin/dashboard" 
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: "var(--text)" }} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-6 h-6" style={{ color: "rgb(16,185,129)" }} />
              <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>All Appointments</h1>
            </div>
            <p className="text-sm" style={{ color: "var(--text-light)" }}>
              {appointments.length} total appointments · {appointments.filter(a => a.status === "PENDING").length} pending
            </p>
          </div>
        </div>
        <button
          onClick={fetchAppointments}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition hover:bg-gray-100 dark:hover:bg-gray-800"
          style={{ color: "var(--text)" }}
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl flex items-start gap-3" style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "rgb(239,68,68)" }} />
          <div>
            <p className="font-medium" style={{ color: "rgb(239,68,68)" }}>Error</p>
            <p className="text-sm" style={{ color: "rgb(239,68,68)" }}>{error}</p>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-light)" }} />
          <input
            type="text"
            placeholder="Search by patient, doctor, or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-xl focus:outline-none focus:ring-2"
            style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-xl focus:outline-none focus:ring-2"
          style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Appointments Table */}
      {filteredAppointments.length === 0 ? (
        <div className="p-12 text-center rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
          <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" style={{ color: "var(--text-light)" }} />
          <h3 className="text-xl font-semibold" style={{ color: "var(--text)" }}>No Appointments Found</h3>
          <p className="mt-2" style={{ color: "var(--text-light)" }}>
            {searchTerm || filterStatus !== "ALL" ? "No appointments match your filters" : "No appointments have been created yet"}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b" style={{ borderColor: "var(--border)" }}>
                <tr>
                  <th className="text-left p-4 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-light)" }}>Patient</th>
                  <th className="text-left p-4 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-light)" }}>Doctor</th>
                  <th className="text-left p-4 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-light)" }}>Date & Time</th>
                  <th className="text-left p-4 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-light)" }}>Status</th>
                  <th className="text-left p-4 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-light)" }}>Reason</th>
                  <th className="text-right p-4 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-light)" }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                {filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}>
                          {apt.patient.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-sm" style={{ color: "var(--text)" }}>{apt.patient.name}</p>
                          <p className="text-xs" style={{ color: "var(--text-light)" }}>{apt.patient.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4" style={{ color: "rgb(16,185,129)" }} />
                        <span className="text-sm" style={{ color: "var(--text)" }}>Dr. {apt.doctor.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm" style={{ color: "var(--text)" }}>
                        {formatDate(apt.dateTime)}
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-light)" }}>
                        {formatTime(apt.dateTime)}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                        {getStatusIcon(apt.status)} {apt.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-sm truncate max-w-[120px]" style={{ color: "var(--text-light)" }}>
                        {apt.reason || "No reason provided"}
                      </p>
                    </td>
                    <td className="p-4 text-right">
                      <Link 
                        href={`/admin/appointments/${apt.id}`}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm transition hover:bg-gray-100 dark:hover:bg-gray-800"
                        style={{ color: "var(--text-light)" }}
                      >
                        <Eye className="w-4 h-4" /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info Box */}
      {appointments.length > 0 && (
        <div className="p-4 rounded-xl" style={{ backgroundColor: "rgba(16,185,129,0.05)", border: "1px solid var(--border)" }}>
          <h3 className="font-medium mb-1" style={{ color: "var(--text)" }}>💡 Appointment Summary</h3>
          <div className="flex flex-wrap gap-4 text-sm" style={{ color: "var(--text-light)" }}>
            <span>📊 Total: <strong style={{ color: "var(--text)" }}>{appointments.length}</strong></span>
            <span>⏳ Pending: <strong style={{ color: "rgb(234,179,8)" }}>{appointments.filter(a => a.status === "PENDING").length}</strong></span>
            <span>✅ Confirmed: <strong style={{ color: "rgb(16,185,129)" }}>{appointments.filter(a => a.status === "CONFIRMED").length}</strong></span>
            <span>✔️ Completed: <strong style={{ color: "rgb(59,130,246)" }}>{appointments.filter(a => a.status === "COMPLETED").length}</strong></span>
            <span>❌ Cancelled: <strong style={{ color: "rgb(239,68,68)" }}>{appointments.filter(a => a.status === "CANCELLED").length}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}