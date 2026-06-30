"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Calendar, Clock, User, Stethoscope, 
  FileText, CheckCircle, XCircle, AlertCircle,
  Phone, Mail, MapPin
} from "lucide-react";

// ✅ FIXED: Correct Render URL (medicurehub, NOT medicinehub)
// ✅ FIXED: No /api at the end (will add /api in the fetch call)
const API_URL = 'https://medicurehub-backend.onrender.com';

interface AppointmentDetail {
  id: number;
  dateTime: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  reason: string | null;
  createdAt: string;
  patient: {
    id: number;
    name: string;
    email: string;
  };
  doctor: {
    id: number;
    name: string;
    email: string;
  };
}

export default function PatientAppointmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.id;
  
  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (!token || !userStr) {
      router.replace("/login");
      return;
    }
    setIsAuthenticated(true);
  }, [router]);

  // Fetch appointment details
  useEffect(() => {
    if (!isAuthenticated || !appointmentId) return;
    
    const fetchAppointment = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      try {
        setIsLoading(true);
        setError("");
        
        // ✅ FIXED: Using correct API_URL with /api
        const response = await fetch(`${API_URL}/api/appointments/patient`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.replace("/login");
          return;
        }
        
        if (!response.ok) throw new Error("Failed to fetch appointment");
        
        const data = await response.json();
        const found = data.find((apt: any) => apt.id === parseInt(appointmentId as string));
        
        if (!found) {
          setError("Appointment not found");
          return;
        }
        
        setAppointment(found);
        
      } catch (err: any) {
        console.error("Error fetching appointment:", err);
        setError(err.message || "Failed to load appointment details");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAppointment();
  }, [isAuthenticated, appointmentId, router]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
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
      case "CONFIRMED": return <CheckCircle className="w-5 h-5" />;
      case "PENDING": return <AlertCircle className="w-5 h-5" />;
      case "CANCELLED": return <XCircle className="w-5 h-5" />;
      case "COMPLETED": return <CheckCircle className="w-5 h-5" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: "var(--text-light)" }}>Loading appointment details...</p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold" style={{ color: "var(--text)" }}>Appointment Not Found</h2>
          <p className="mt-2" style={{ color: "var(--text-light)" }}>{error || "The appointment you're looking for doesn't exist."}</p>
          <Link 
            href="/patient/dashboard" 
            className="inline-block mt-4 px-4 py-2 rounded-xl text-white"
            style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link 
          href="/patient/dashboard" 
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: "var(--text)" }} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Appointment Details</h1>
          <p className="text-sm" style={{ color: "var(--text-light)" }}>
            View your appointment information
          </p>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`p-4 rounded-xl flex items-center gap-3 ${getStatusColor(appointment.status)}`}>
        {getStatusIcon(appointment.status)}
        <div>
          <p className="font-semibold">Status: {appointment.status}</p>
          <p className="text-sm opacity-75">
            {appointment.status === "PENDING" && "This appointment is waiting for confirmation."}
            {appointment.status === "CONFIRMED" && "This appointment has been confirmed."}
            {appointment.status === "COMPLETED" && "This appointment has been completed."}
            {appointment.status === "CANCELLED" && "This appointment has been cancelled."}
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div className="rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="p-6 space-y-6">
          {/* Doctor Info */}
          <div>
            <h3 className="text-sm font-medium mb-3" style={{ color: "var(--text-light)" }}>Doctor</h3>
            <div className="flex items-start gap-4 p-4 rounded-xl" style={{ backgroundColor: "var(--input-bg)" }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}>
                {appointment.doctor.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold" style={{ color: "var(--text)" }}>Dr. {appointment.doctor.name}</p>
                <p className="text-sm" style={{ color: "var(--text-light)" }}>{appointment.doctor.email}</p>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--input-bg)" }}>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4" style={{ color: "rgb(16,185,129)" }} />
                <span className="text-sm font-medium" style={{ color: "var(--text-light)" }}>Date</span>
              </div>
              <p className="font-semibold" style={{ color: "var(--text)" }}>{formatDate(appointment.dateTime)}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--input-bg)" }}>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4" style={{ color: "rgb(16,185,129)" }} />
                <span className="text-sm font-medium" style={{ color: "var(--text-light)" }}>Time</span>
              </div>
              <p className="font-semibold" style={{ color: "var(--text)" }}>{formatTime(appointment.dateTime)}</p>
            </div>
          </div>

          {/* Reason */}
          {appointment.reason && (
            <div>
              <h3 className="text-sm font-medium mb-2" style={{ color: "var(--text-light)" }}>Reason for Visit</h3>
              <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--input-bg)" }}>
                <p style={{ color: "var(--text)" }}>{appointment.reason}</p>
              </div>
            </div>
          )}

          {/* Booking Date */}
          <div className="text-xs" style={{ color: "var(--text-light)" }}>
            Booked on: {formatDate(appointment.createdAt)} at {formatTime(appointment.createdAt)}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/patient/dashboard"
          className="flex-1 px-4 py-2.5 rounded-xl text-center font-medium transition hover:bg-gray-100 dark:hover:bg-gray-800"
          style={{ backgroundColor: "var(--muted)", color: "var(--text)" }}
        >
          Back to Dashboard
        </Link>
        {appointment.status === "PENDING" && (
          <>
            <button
              className="flex-1 px-4 py-2.5 rounded-xl text-center font-medium text-white transition hover:scale-105"
              style={{ background: "linear-gradient(135deg, rgb(239,68,68), rgb(220,38,38))" }}
            >
              Cancel Appointment
            </button>
          </>
        )}
      </div>
    </div>
  );
}