"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Calendar, Clock, Stethoscope, Pill, FileText, Video, 
  Plus, ChevronRight, Users, CheckCircle, XCircle, AlertCircle,
  RefreshCw
} from "lucide-react";

// ✅ FIXED: Correct Render URL (medicurehub, NOT medicinehub)
// ✅ FIXED: No /api at the end (will add /api in the fetch call)
const API_URL = 'https://medicurehub-backend.onrender.com';

interface Appointment {
  id: number;
  doctorId: number;
  dateTime: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  reason: string | null;
  doctor: {
    name: string;
    email: string;
  };
}

interface Doctor {
  id: number;
  name: string;
  email: string;
}

export default function PatientDashboard() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [reason, setReason] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  // Check authentication and role
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
      
      // If admin, redirect to admin panel
      if (userRole === "admin") {
        router.replace("/admin/doctors");
        return;
      }
      
      if (userRole !== "patient") {
        router.replace("/doctor/dashboard");
        return;
      }
      setUserName(user.name || "Patient");
      setIsAuthenticated(true);
    } catch (e) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.replace("/login");
    }
  }, [router]);

  // Fetch data
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }
      
      try {
        setIsLoading(true);
        setError("");
        
        // ✅ FIXED: Using correct API_URL with /api
        const appointmentsRes = await fetch(`${API_URL}/api/appointments/my`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (appointmentsRes.status === 401 || appointmentsRes.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.replace("/login");
          return;
        }
        
        if (!appointmentsRes.ok) {
          throw new Error(`Failed to fetch appointments: ${appointmentsRes.status}`);
        }
        
        const appointmentsData = await appointmentsRes.json();
        setAppointments(appointmentsData);
        
        // ✅ FIXED: Using correct API_URL with /api
        const doctorsRes = await fetch(`${API_URL}/api/appointments/doctors`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (doctorsRes.ok) {
          const doctorsData = await doctorsRes.json();
          setDoctors(doctorsData);
        }
        
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated, router]);

  // Book appointment
  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      setError("Please select doctor, date, and time");
      return;
    }
    
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    
    const dateTime = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();
    
    setIsBooking(true);
    setError("");
    
    try {
      // ✅ FIXED: Using correct API_URL with /api
      const response = await fetch(`${API_URL}/api/appointments/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorId: parseInt(selectedDoctor),
          dateTime: dateTime,
          reason: reason || null
        })
      });
      
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/login");
        return;
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Booking failed");
      }
      
      // Refresh appointments after booking
      setAppointments([data, ...appointments]);
      setShowBookingModal(false);
      setSelectedDoctor("");
      setSelectedDate("");
      setSelectedTime("");
      setReason("");
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsBooking(false);
    }
  };

  // Helper functions
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
      case "PENDING": return <AlertCircle className="w-3 h-3" />;
      case "CANCELLED": return <XCircle className="w-3 h-3" />;
      case "COMPLETED": return <CheckCircle className="w-3 h-3" />;
      default: return null;
    }
  };
  
  const upcomingCount = appointments.filter(a => 
    a.status !== "CANCELLED" && new Date(a.dateTime) > new Date()
  ).length;
  
  const totalCount = appointments.length;
  const completedCount = appointments.filter(a => a.status === "COMPLETED").length;
  const pendingCount = appointments.filter(a => a.status === "PENDING").length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: "var(--text-light)" }}>Loading your dashboard...</p>
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

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--text)" }}>
            Welcome back, {userName} 👋
          </h1>
          <p className="mt-1" style={{ color: "var(--text-light)" }}>
            Here's what's happening with your health today.
          </p>
        </div>
        <button
          onClick={() => setShowBookingModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white font-medium hover:scale-105 transition w-full sm:w-auto justify-center"
          style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}
        >
          <Plus className="w-4 h-4" /> Book Appointment
        </button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <StatCard title="Total Appointments" value={totalCount} icon={Calendar} color="emerald" />
        <StatCard title="Upcoming" value={upcomingCount} icon={Clock} color="blue" />
        <StatCard title="Completed" value={completedCount} icon={CheckCircle} color="purple" />
        <StatCard title="Pending" value={pendingCount} icon={AlertCircle} color="orange" />
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <QuickActionCard
          icon={<Video className="w-6 h-6" />}
          title="Video Consult"
          description="Connect with a doctor remotely"
          gradient="from-purple-500 to-indigo-500"
          href="/patient/video-consult"
        />
        <QuickActionCard
          icon={<FileText className="w-6 h-6" />}
          title="Medical Records"
          description="View your health history"
          gradient="from-blue-500 to-cyan-500"
          href="/patient/records"
        />
        <QuickActionCard
          icon={<Pill className="w-6 h-6" />}
          title="Prescriptions"
          description="View your medications"
          gradient="from-emerald-500 to-teal-500"
          href="/patient/prescriptions"
        />
      </div>
      
      {/* Appointments Section */}
      <div className="rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="p-4 sm:p-6 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold" style={{ color: "var(--text)" }}>Your Appointments</h2>
              <p className="text-sm" style={{ color: "var(--text-light)" }}>Manage your upcoming and past appointments</p>
            </div>
            <span className="text-sm px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "rgb(16,185,129)" }}>
              {appointments.length} total
            </span>
          </div>
        </div>
        
        <div className="divide-y" style={{ borderColor: "var(--border)" }}>
          {appointments.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" style={{ color: "var(--text-light)" }} />
              <p style={{ color: "var(--text-light)" }}>No appointments yet</p>
              <button
                onClick={() => setShowBookingModal(true)}
                className="mt-3 px-4 py-2 rounded-xl text-white text-sm font-medium hover:scale-105 transition"
                style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}
              >
                Book your first appointment
              </button>
            </div>
          ) : (
            appointments.map((apt) => (
              <div key={apt.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(16,185,129,0.1)" }}>
                    <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: "rgb(16,185,129)" }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base" style={{ color: "var(--text)" }}>{apt.doctor.name}</h3>
                    <p className="text-xs sm:text-sm" style={{ color: "var(--text-light)" }}>
                      {formatDate(apt.dateTime)} at {formatTime(apt.dateTime)}
                    </p>
                    {apt.reason && <p className="text-xs mt-1" style={{ color: "var(--text-light)" }}>Reason: {apt.reason}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                    {getStatusIcon(apt.status)} {apt.status}
                  </span>
                  <Link 
                    href={`/patient/appointments/${apt.id}`}
                    className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <ChevronRight className="w-4 h-4" style={{ color: "var(--text-light)" }} />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowBookingModal(false)}>
          <div className="max-w-md w-full rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }} onClick={(e) => e.stopPropagation()}>
            <div className="p-4 sm:p-6 border-b" style={{ borderColor: "var(--border)" }}>
              <h3 className="text-lg sm:text-xl font-semibold" style={{ color: "var(--text)" }}>Book Appointment</h3>
              <p className="text-sm" style={{ color: "var(--text-light)" }}>Fill in the details below</p>
            </div>
            
            <form onSubmit={handleBookAppointment} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Select Doctor</label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl focus:outline-none focus:ring-2"
                  style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
                  required
                >
                  <option value="">Choose a doctor</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>Dr. {doc.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl focus:outline-none focus:ring-2"
                  style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Time</label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl focus:outline-none focus:ring-2"
                  style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Reason (Optional)</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl focus:outline-none focus:ring-2"
                  style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
                  placeholder="Describe your symptoms..."
                />
              </div>
              
              {error && (
                <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "rgb(239,68,68)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  {error}
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl font-medium transition order-2 sm:order-1"
                  style={{ backgroundColor: "var(--muted)", color: "var(--text)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBooking}
                  className="flex-1 px-4 py-2 rounded-xl font-medium text-white transition disabled:opacity-50 order-1 sm:order-2"
                  style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}
                >
                  {isBooking ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ========== STAT CARD COMPONENT ==========
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
function QuickActionCard({ icon, title, description, gradient, href }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  href: string;
}) {
  return (
    <Link 
      href={href}
      className={`group p-4 sm:p-5 rounded-2xl transition-all hover:scale-[1.02] hover:shadow-xl cursor-pointer`}
      style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center bg-gradient-to-r ${gradient} text-white group-hover:scale-110 transition`}>
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-sm sm:text-base" style={{ color: "var(--text)" }}>{title}</h3>
          <p className="text-xs sm:text-sm" style={{ color: "var(--text-light)" }}>{description}</p>
        </div>
      </div>
    </Link>
  );
}