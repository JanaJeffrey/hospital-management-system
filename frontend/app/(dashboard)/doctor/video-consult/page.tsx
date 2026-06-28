"use client";

// ✅ THIS FIXES THE VERCEL BUILD ERROR
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { VideoCall } from "@/components/VideoCall";

// ✅ Get the API URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Appointment {
  id: number;
  patientId: number;
  patient: {
    name: string;
    email: string;
  };
  doctorId: number;
  dateTime: string;
  status: string;
  reason: string | null;
}

export default function DoctorVideoConsultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [roomId, setRoomId] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [doctorName, setDoctorName] = useState("");

  // ✅ Check authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (!token || !userStr) {
      router.replace("/login");
      return;
    }
    
    try {
      const user = JSON.parse(userStr);
      if (user.role?.toLowerCase() !== "doctor") {
        router.replace("/patient/dashboard");
        return;
      }
      setDoctorName(user.name || "Doctor");
      setIsAuthenticated(true);
      
      if (appointmentId) {
        fetchAppointment(parseInt(appointmentId));
      } else {
        fetchLatestAppointment();
      }
    } catch (e) {
      router.replace("/login");
    }
  }, [router, appointmentId]);

  // ✅ Fetch specific appointment from BACKEND
  const fetchAppointment = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    try {
      setIsLoading(true);
      setError("");
      
      // ✅ REAL API CALL - Fetches doctor's appointments from backend
      const response = await fetch(`${API_URL}/api/appointments/doctor`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/login");
        return;
      }
      
      if (!response.ok) throw new Error("Failed to fetch appointment");
      
      const appointments = await response.json();
      const found = appointments.find((apt: any) => apt.id === id);
      
      if (!found) {
        setError("Appointment not found");
        return;
      }
      
      setAppointment(found);
      // Generate a unique room ID for the call
      setRoomId(`call-${found.id}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`);
      
    } catch (err: any) {
      console.error("Error fetching appointment:", err);
      setError(err.message || "Failed to load appointment");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Fetch latest upcoming appointment from BACKEND
  const fetchLatestAppointment = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    try {
      setIsLoading(true);
      setError("");
      
      // ✅ REAL API CALL - Fetches doctor's appointments from backend
      const response = await fetch(`${API_URL}/api/appointments/doctor`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/login");
        return;
      }
      
      if (!response.ok) throw new Error("Failed to fetch appointments");
      
      const appointments = await response.json();
      
      // Find the nearest upcoming appointment (CONFIRMED or PENDING)
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
        setError("No upcoming appointments found.");
        return;
      }
      
      setAppointment(upcoming[0]);
      // Generate a unique room ID for the call
      setRoomId(`call-${upcoming[0].id}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`);
      
    } catch (err: any) {
      console.error("Error fetching appointments:", err);
      setError(err.message || "Failed to load appointments");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Handle end call - Updates appointment status in BACKEND
  const handleEndCall = async () => {
    if (appointment) {
      const token = localStorage.getItem("token");
      try {
        // ✅ REAL API CALL - Updates appointment status to COMPLETED
        await fetch(`${API_URL}/api/appointments/${appointment.id}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ status: "COMPLETED" })
        });
      } catch (err) {
        console.error("Error updating appointment status:", err);
      }
    }
    router.push("/doctor/dashboard");
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: "rgb(16,185,129)" }} />
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
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold" style={{ color: "var(--text)" }}>No Appointment Found</h2>
          <p className="mt-2" style={{ color: "var(--text-light)" }}>{error || "No upcoming appointments available for video consultation."}</p>
          <Link 
            href="/doctor/dashboard"
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/doctor/dashboard")}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: "var(--text)" }} />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Video Consultation</h1>
            <p className="text-sm" style={{ color: "var(--text-light)" }}>
              With {appointment.patient.name} · {new Date(appointment.dateTime).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Video Call Component - Uses REAL PeerJS */}
      <VideoCall
        roomId={roomId}
        isDoctor={true}
        doctorName={doctorName}
        patientName={appointment.patient.name}
        onEndCall={handleEndCall}
      />
    </div>
  );
}