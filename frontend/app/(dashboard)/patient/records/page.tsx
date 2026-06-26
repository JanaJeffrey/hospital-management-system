"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, FileText, Calendar, User, 
  Download, Eye, Search, RefreshCw,
  AlertCircle, CheckCircle, Clock,
  Stethoscope, Pill, Activity, Heart,
  Droplets, Ruler, Thermometer, Weight,
  Plus
} from "lucide-react";

interface MedicalRecord {
  id: number;
  type: string;
  title: string;
  date: string;
  doctor: string;
  details: string;
  status: "ready" | "pending" | "reviewing";
}

export default function MedicalRecordsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [hasRecords, setHasRecords] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (!token || !userStr) {
      router.replace("/login");
      return;
    }
    
    try {
      const user = JSON.parse(userStr);
      setUserName(user.name || "Patient");
      setIsAuthenticated(true);
      
      // ✅ Check if user has actual records from backend
      // For now, we'll show empty state since no real backend endpoint exists
      // In production, you'd fetch from GET /api/patient/records
      setHasRecords(false);
      setRecords([]);
      
      // If you want to show demo records, you can uncomment this:
      // setHasRecords(true);
      // setRecords(demoRecords);
      
    } catch (e) {
      router.replace("/login");
    }
  }, [router]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ready":
        return { label: "Ready", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: <CheckCircle className="w-3 h-3" /> };
      case "pending":
        return { label: "Pending", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: <Clock className="w-3 h-3" /> };
      case "reviewing":
        return { label: "Reviewing", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: <Activity className="w-3 h-3" /> };
      default:
        return { label: status, color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400", icon: null };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Lab Result": return <Droplets className="w-4 h-4" />;
      case "Imaging": return <Activity className="w-4 h-4" />;
      case "Vital Signs": return <Heart className="w-4 h-4" />;
      case "Prescription": return <Pill className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link 
            href="/patient/dashboard" 
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: "var(--text)" }} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6" style={{ color: "rgb(16,185,129)" }} />
              <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Medical Records</h1>
            </div>
            <p className="text-sm" style={{ color: "var(--text-light)" }}>
              View and manage your health records
            </p>
          </div>
        </div>
      </div>

      {/* ✅ EMPTY STATE - Professional design when no records */}
      {!hasRecords || records.length === 0 ? (
        <div className="p-12 text-center rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(16,185,129,0.1)" }}>
            <FileText className="w-10 h-10" style={{ color: "rgb(16,185,129)" }} />
          </div>
          <h3 className="text-xl font-semibold" style={{ color: "var(--text)" }}>No Medical Records Yet</h3>
          <p className="mt-2 max-w-md mx-auto" style={{ color: "var(--text-light)" }}>
            Your medical records will appear here once your doctor adds them. This includes lab results, 
            imaging reports, prescriptions, and vital signs.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white font-medium hover:scale-105 transition"
              style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>
      ) : (
        // Records list (when records exist)
        <div className="space-y-4">
          {/* Stats Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 text-center rounded-xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
              <p className="text-xl font-bold" style={{ color: "rgb(16,185,129)" }}>{records.length}</p>
              <p className="text-xs" style={{ color: "var(--text-light)" }}>Total Records</p>
            </div>
            <div className="p-3 text-center rounded-xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
              <p className="text-xl font-bold" style={{ color: "rgb(59,130,246)" }}>{records.filter(r => r.status === "ready").length}</p>
              <p className="text-xs" style={{ color: "var(--text-light)" }}>Ready</p>
            </div>
            <div className="p-3 text-center rounded-xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
              <p className="text-xl font-bold" style={{ color: "rgb(234,179,8)" }}>{records.filter(r => r.status === "reviewing").length}</p>
              <p className="text-xs" style={{ color: "var(--text-light)" }}>Reviewing</p>
            </div>
            <div className="p-3 text-center rounded-xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
              <p className="text-xl font-bold" style={{ color: "rgb(139,92,246)" }}>3</p>
              <p className="text-xs" style={{ color: "var(--text-light)" }}>Conditions</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-light)" }} />
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-xl focus:outline-none focus:ring-2"
              style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
            />
          </div>

          {/* Records List */}
          <div className="space-y-4">
            {records.filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.doctor.toLowerCase().includes(searchTerm.toLowerCase())).map((record) => {
              const status = getStatusBadge(record.status);
              return (
                <div key={record.id} className="p-4 rounded-2xl transition hover:shadow-md" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(16,185,129,0.1)" }}>
                        <span style={{ color: "rgb(16,185,129)" }}>{getTypeIcon(record.type)}</span>
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold" style={{ color: "var(--text)" }}>{record.title}</h3>
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "rgb(16,185,129)" }}>
                            {record.type}
                          </span>
                        </div>
                        <p className="text-sm" style={{ color: "var(--text-light)" }}>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" /> {record.doctor}
                          </span>
                        </p>
                        <p className="text-sm mt-1" style={{ color: "var(--text-light)" }}>
                          {formatDate(record.date)}
                        </p>
                        <p className="text-xs mt-1" style={{ color: "var(--text-light)" }}>
                          {record.details}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.icon} {status.label}
                      </span>
                      {record.status === "ready" && (
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                          <Download className="w-4 h-4" style={{ color: "var(--text-light)" }} />
                        </button>
                      )}
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                        <Eye className="w-4 h-4" style={{ color: "var(--text-light)" }} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="p-4 rounded-xl" style={{ backgroundColor: "rgba(16,185,129,0.05)", border: "1px solid var(--border)" }}>
        <h3 className="font-medium mb-1" style={{ color: "var(--text)" }}>💡 About Your Records</h3>
        <p className="text-sm" style={{ color: "var(--text-light)" }}>
          Your medical records are securely stored and accessible only to you and your authorized healthcare providers.
          Records are added by your doctors after consultations and lab tests.
        </p>
      </div>
    </div>
  );
}