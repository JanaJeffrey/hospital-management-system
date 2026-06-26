"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Clock, Calendar, CheckCircle, 
  AlertCircle, Plus, X, ChevronLeft, ChevronRight,
  Trash2, Edit, Save
} from "lucide-react";

interface ScheduleDay {
  day: string;
  start: string;
  end: string;
  available: boolean;
}

export default function DoctorSchedulePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [doctorName, setDoctorName] = useState("");
  
  const [schedule, setSchedule] = useState<ScheduleDay[]>([
    { day: "Monday", start: "09:00", end: "17:00", available: true },
    { day: "Tuesday", start: "09:00", end: "17:00", available: true },
    { day: "Wednesday", start: "09:00", end: "17:00", available: true },
    { day: "Thursday", start: "09:00", end: "17:00", available: true },
    { day: "Friday", start: "09:00", end: "16:00", available: true },
    { day: "Saturday", start: "", end: "", available: false },
    { day: "Sunday", start: "", end: "", available: false },
  ]);

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
      if (user.role?.toLowerCase() !== "doctor") {
        router.replace("/patient/dashboard");
        return;
      }
      setDoctorName(user.name || "Doctor");
      setIsAuthenticated(true);
    } catch (e) {
      router.replace("/login");
    }
  }, [router]);

  const updateDay = (index: number, field: keyof ScheduleDay, value: any) => {
    const updated = [...schedule];
    updated[index] = { ...updated[index], [field]: value };
    setSchedule(updated);
    setSuccess(false);
  };

  const saveSchedule = async () => {
    setIsSaving(true);
    setError("");
    setSuccess(false);
    
    // Simulate saving (connect to backend later)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSuccess(true);
    setIsSaving(false);
  };

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link 
          href="/doctor/dashboard" 
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: "var(--text)" }} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Manage Schedule</h1>
          <p className="text-sm" style={{ color: "var(--text-light)" }}>Set your weekly working hours</p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 rounded-xl flex items-center gap-3" style={{ backgroundColor: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
          <CheckCircle className="w-5 h-5" style={{ color: "rgb(16,185,129)" }} />
          <span style={{ color: "rgb(16,185,129)" }}>Schedule saved successfully!</span>
        </div>
      )}
      
      {error && (
        <div className="p-4 rounded-xl flex items-center gap-3" style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertCircle className="w-5 h-5" style={{ color: "rgb(239,68,68)" }} />
          <span style={{ color: "rgb(239,68,68)" }}>{error}</span>
        </div>
      )}

      {/* Schedule Table */}
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>Weekly Schedule</h2>
          <p className="text-sm" style={{ color: "var(--text-light)" }}>Toggle availability and set working hours for each day</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b" style={{ borderColor: "var(--border)" }}>
              <tr>
                <th className="text-left p-4 text-sm font-medium" style={{ color: "var(--text-light)" }}>Day</th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: "var(--text-light)" }}>Available</th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: "var(--text-light)" }}>Start Time</th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: "var(--text-light)" }}>End Time</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((day, idx) => (
                <tr key={day.day} className="border-b" style={{ borderColor: "var(--border)" }}>
                  <td className="p-4 font-medium" style={{ color: "var(--text)" }}>{day.day}</td>
                  <td className="p-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={day.available}
                        onChange={(e) => updateDay(idx, "available", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </td>
                  <td className="p-4">
                    <input
                      type="time"
                      value={day.start}
                      onChange={(e) => updateDay(idx, "start", e.target.value)}
                      disabled={!day.available}
                      className="px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 w-28"
                      style={{ 
                        backgroundColor: day.available ? "var(--input-bg)" : "var(--muted)",
                        border: "1px solid var(--border)",
                        color: day.available ? "var(--text)" : "var(--text-light)"
                      }}
                    />
                  </td>
                  <td className="p-4">
                    <input
                      type="time"
                      value={day.end}
                      onChange={(e) => updateDay(idx, "end", e.target.value)}
                      disabled={!day.available}
                      className="px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 w-28"
                      style={{ 
                        backgroundColor: day.available ? "var(--input-bg)" : "var(--muted)",
                        border: "1px solid var(--border)",
                        color: day.available ? "var(--text)" : "var(--text-light)"
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t flex flex-col sm:flex-row justify-between items-center gap-3" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--text-light)" }}>
            Available days: {schedule.filter(d => d.available).length} / 7
          </p>
          <button
            onClick={saveSchedule}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-xl text-white font-medium hover:scale-105 transition disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Schedule
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="p-4 rounded-xl" style={{ backgroundColor: "rgba(16,185,129,0.05)", border: "1px solid var(--border)" }}>
        <h3 className="font-medium mb-1" style={{ color: "var(--text)" }}>💡 About Your Schedule</h3>
        <p className="text-sm" style={{ color: "var(--text-light)" }}>
          Your schedule determines when patients can book appointments with you. 
          Unavailable days will be blocked in the booking system.
        </p>
      </div>
    </div>
  );
}