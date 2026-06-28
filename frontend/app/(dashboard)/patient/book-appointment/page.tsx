"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Calendar, Clock, Stethoscope, User, Mail, 
  ArrowLeft, CheckCircle, AlertCircle, Search,
  ChevronLeft, ChevronRight, X
} from "lucide-react";

// ✅ ADDED: Get the API URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Doctor {
  id: number;
  name: string;
  email: string;
}

export default function BookAppointmentPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication and fetch doctors
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (!token || !userStr) {
      router.replace("/login");
      return;
    }
    
    try {
      const user = JSON.parse(userStr);
      if (user.role?.toLowerCase() !== "patient") {
        router.replace("/doctor/dashboard");
        return;
      }
      setIsAuthenticated(true);
      fetchDoctors();
    } catch (e) {
      router.replace("/login");
    }
  }, [router]);

  const fetchDoctors = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    try {
      // ✅ CHANGED: Using environment variable instead of hardcoded localhost
      const response = await fetch(`${API_URL}/api/appointments/doctors`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error("Failed to fetch doctors");
      const data = await response.json();
      setDoctors(data);
    } catch (err: any) {
      setError("Failed to load doctors. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      setError("Please select a doctor, date, and time");
      return;
    }
    
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    
    const dateTime = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();
    
    setIsBooking(true);
    
    try {
      // ✅ CHANGED: Using environment variable instead of hardcoded localhost
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
      
      setSuccess(true);
      // Reset form after success
      setSelectedDoctor("");
      setSelectedDate("");
      setSelectedTime("");
      setReason("");
      
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push("/patient/dashboard");
      }, 3000);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsBooking(false);
    }
  };

  // Get available time slots (9 AM - 6 PM, every 30 minutes)
  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let min = 0; min < 60; min += 30) {
        if (hour === 18 && min > 0) continue;
        const timeStr = `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
        slots.push(timeStr);
      }
    }
    return slots;
  };

  // Get today's date for min date
  const today = new Date().toISOString().split("T")[0];
  
  // Filter doctors by search
  const filteredDoctors = doctors.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: "var(--text-light)" }}>Loading available doctors...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Appointment Booked!</h2>
          <p className="mt-2" style={{ color: "var(--text-light)" }}>
            Your appointment has been booked successfully. You'll receive a confirmation soon.
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--text-light)" }}>
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link 
          href="/patient/dashboard" 
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: "var(--text)" }} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Book Appointment</h1>
          <p className="text-sm" style={{ color: "var(--text-light)" }}>Schedule a consultation with a doctor</p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 rounded-xl flex items-start gap-3" style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "rgb(239,68,68)" }} />
          <div>
            <p className="font-medium" style={{ color: "rgb(239,68,68)" }}>Booking Failed</p>
            <p className="text-sm" style={{ color: "rgb(239,68,68)" }}>{error}</p>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="p-6 space-y-6">
          {/* Doctor Selection */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text)" }}>
              Select Doctor
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-light)" }} />
              <input
                type="text"
                placeholder="Search doctors by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-xl focus:outline-none focus:ring-2 mb-3"
                style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
              {filteredDoctors.length === 0 ? (
                <p className="col-span-2 text-center py-4" style={{ color: "var(--text-light)" }}>
                  {searchTerm ? "No doctors found matching your search" : "No doctors available"}
                </p>
              ) : (
                filteredDoctors.map((doctor) => (
                  <label
                    key={doctor.id}
                    className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition border-2 ${
                      selectedDoctor === doctor.id.toString()
                        ? "border-emerald-500"
                        : "border-transparent hover:border-emerald-300"
                    }`}
                    style={{ backgroundColor: "var(--input-bg)", borderColor: selectedDoctor === doctor.id.toString() ? "rgb(16,185,129)" : "var(--border)" }}
                  >
                    <input
                      type="radio"
                      name="doctor"
                      value={doctor.id}
                      checked={selectedDoctor === doctor.id.toString()}
                      onChange={() => setSelectedDoctor(doctor.id.toString())}
                      className="mt-1 w-4 h-4 flex-shrink-0"
                      style={{ accentColor: "rgb(16,185,129)" }}
                    />
                    <div>
                      <p className="font-medium text-sm" style={{ color: "var(--text)" }}>Dr. {doctor.name}</p>
                      <p className="text-xs" style={{ color: "var(--text-light)" }}>{doctor.email}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text)" }}>
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={today}
              className="w-full px-3 py-2 rounded-xl focus:outline-none focus:ring-2"
              style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
              required
            />
          </div>

          {/* Time Selection */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text)" }}>
              Select Time
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {getTimeSlots().map((time) => (
                <label
                  key={time}
                  className={`flex items-center justify-center p-2 rounded-xl cursor-pointer transition border-2 text-sm ${
                    selectedTime === time
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                      : "border-transparent hover:border-emerald-300"
                  }`}
                  style={{ 
                    backgroundColor: selectedTime === time ? "rgba(16,185,129,0.1)" : "var(--input-bg)",
                    borderColor: selectedTime === time ? "rgb(16,185,129)" : "var(--border)"
                  }}
                >
                  <input
                    type="radio"
                    name="time"
                    value={time}
                    checked={selectedTime === time}
                    onChange={() => setSelectedTime(time)}
                    className="sr-only"
                  />
                  <span style={{ color: selectedTime === time ? "rgb(16,185,129)" : "var(--text)" }}>
                    {time}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text)" }}>
              Reason for Visit (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-xl focus:outline-none focus:ring-2"
              style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
              placeholder="Describe your symptoms or reason for booking..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-3 p-6 border-t" style={{ borderColor: "var(--border)" }}>
          <button
            type="button"
            onClick={() => router.push("/patient/dashboard")}
            className="px-4 py-2 rounded-xl font-medium transition order-2 sm:order-1"
            style={{ backgroundColor: "var(--muted)", color: "var(--text)" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isBooking || !selectedDoctor || !selectedDate || !selectedTime}
            className="flex-1 px-4 py-2 rounded-xl font-medium text-white transition disabled:opacity-50 order-1 sm:order-2 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}
          >
            {isBooking ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Booking...
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4" /> Confirm Booking
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}