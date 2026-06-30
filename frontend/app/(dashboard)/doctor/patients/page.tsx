"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Users, Search, Mail, Phone, 
  Calendar, User, ChevronRight, Filter
} from "lucide-react";

// ✅ FIXED: Correct Render URL (medicurehub, NOT medicinehub)
// ✅ FIXED: No /api at the end (will add /api in the fetch call)
const API_URL = 'https://medicurehub-backend.onrender.com';

interface Patient {
  id: number;
  name: string;
  email: string;
  appointments: number;
  lastVisit: string;
}

export default function DoctorPatientsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
      setIsAuthenticated(true);
      fetchPatients();
    } catch (e) {
      router.replace("/login");
    }
  }, [router]);

  const fetchPatients = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    try {
      // ✅ FIXED: Using correct API_URL with /api
      const response = await fetch(`${API_URL}/api/appointments/doctor`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error("Failed to fetch patients");
      const data = await response.json();
      
      // Extract unique patients from appointments
      const patientMap = new Map();
      data.forEach((apt: any) => {
        if (!patientMap.has(apt.patientId)) {
          patientMap.set(apt.patientId, {
            id: apt.patientId,
            name: apt.patient.name,
            email: apt.patient.email,
            appointments: 1,
            lastVisit: apt.dateTime
          });
        } else {
          const existing = patientMap.get(apt.patientId);
          existing.appointments += 1;
          if (new Date(apt.dateTime) > new Date(existing.lastVisit)) {
            existing.lastVisit = apt.dateTime;
          }
        }
      });
      
      setPatients(Array.from(patientMap.values()));
    } catch (err: any) {
      console.error("Error fetching patients:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: "var(--text-light)" }}>Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link 
          href="/doctor/dashboard" 
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: "var(--text)" }} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>My Patients</h1>
          <p className="text-sm" style={{ color: "var(--text-light)" }}>
            {patients.length} patients total
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-light)" }} />
        <input
          type="text"
          placeholder="Search patients by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-3 py-2 rounded-xl focus:outline-none focus:ring-2"
          style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
        />
      </div>

      {/* Patient List */}
      <div className="rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
        {filteredPatients.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" style={{ color: "var(--text-light)" }} />
            <p style={{ color: "var(--text-light)" }}>
              {searchTerm ? "No patients found matching your search" : "No patients yet"}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-2 text-sm font-medium hover:underline"
                style={{ color: "rgb(16,185,129)" }}
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {filteredPatients.map((patient) => (
              <div key={patient.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}>
                    {patient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-medium" style={{ color: "var(--text)" }}>{patient.name}</h3>
                    <p className="text-sm" style={{ color: "var(--text-light)" }}>{patient.email}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: "var(--text-light)" }}>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {patient.appointments} appointments
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> Last visit: {formatDate(patient.lastVisit)}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition hover:scale-105" style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "rgb(16,185,129)" }}>
                  View Details <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}