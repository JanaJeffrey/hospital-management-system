"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, FileText, Calendar, User, 
  Download, ChevronRight, Clock, CheckCircle,
  AlertCircle, Microscope, RefreshCw
} from "lucide-react";

interface LabReport {
  id: number;
  name: string;
  type: string;
  date: string;
  status: "PENDING" | "REVIEWING" | "READY";
  notes: string | null;
  results: string | null;
  fileUrl: string | null;
  doctor: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function LabReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<LabReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"ALL" | "READY" | "PENDING" | "REVIEWING">("ALL");
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
      if (user.role?.toLowerCase() !== "patient") {
        router.replace("/doctor/dashboard");
        return;
      }
      setIsAuthenticated(true);
    } catch (e) {
      router.replace("/login");
    }
  }, [router]);

  // Fetch lab reports from backend
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchReports = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      try {
        setIsLoading(true);
        setError("");
        
        const response = await fetch("http://localhost:5000/api/analytics/stats", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.replace("/login");
          return;
        }
        
        if (!response.ok) throw new Error("Failed to fetch lab reports");
        
        const data = await response.json();
        setReports(data.labReports?.list || []);
        
      } catch (err: any) {
        console.error("Error fetching lab reports:", err);
        setError(err.message || "Failed to load lab reports");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReports();
  }, [isAuthenticated, router]);

  const filteredReports = reports.filter(r => 
    filter === "ALL" || r.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "READY": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "PENDING": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "REVIEWING": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "READY": return <CheckCircle className="w-3 h-3" />;
      case "PENDING": return <Clock className="w-3 h-3" />;
      case "REVIEWING": return <AlertCircle className="w-3 h-3" />;
      default: return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "READY": return "Ready";
      case "PENDING": return "Pending";
      case "REVIEWING": return "Reviewing";
      default: return status;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  // Calculate stats
  const readyCount = reports.filter(r => r.status === "READY").length;
  const pendingCount = reports.filter(r => r.status === "PENDING").length;
  const reviewingCount = reports.filter(r => r.status === "REVIEWING").length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: "var(--text-light)" }}>Loading lab reports...</p>
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
            href="/patient/dashboard" 
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: "var(--text)" }} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Lab Reports</h1>
            <p className="text-sm" style={{ color: "var(--text-light)" }}>
              {reports.length} reports on record
            </p>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
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
            <p className="font-medium" style={{ color: "rgb(239,68,68)" }}>Failed to load</p>
            <p className="text-sm" style={{ color: "rgb(239,68,68)" }}>{error}</p>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      {reports.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 text-center rounded-xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
            <p className="text-xl font-bold" style={{ color: "rgb(16,185,129)" }}>{readyCount}</p>
            <p className="text-xs" style={{ color: "var(--text-light)" }}>Ready</p>
          </div>
          <div className="p-3 text-center rounded-xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
            <p className="text-xl font-bold" style={{ color: "rgb(234,179,8)" }}>{pendingCount}</p>
            <p className="text-xs" style={{ color: "var(--text-light)" }}>Pending</p>
          </div>
          <div className="p-3 text-center rounded-xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
            <p className="text-xl font-bold" style={{ color: "rgb(59,130,246)" }}>{reviewingCount}</p>
            <p className="text-xs" style={{ color: "var(--text-light)" }}>Reviewing</p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      {reports.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["ALL", "READY", "PENDING", "REVIEWING"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition whitespace-nowrap ${
                filter === f
                  ? "text-white"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              style={filter === f ? { background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" } : { color: "var(--text)" }}
            >
              {f === "ALL" ? "All" : f.toLowerCase()}
            </button>
          ))}
        </div>
      )}

      {/* Report List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="p-8 text-center rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
            <Microscope className="w-12 h-12 mx-auto mb-3 opacity-50" style={{ color: "var(--text-light)" }} />
            <p style={{ color: "var(--text-light)" }}>
              {filter !== "ALL" ? `No ${filter.toLowerCase()} lab reports found` : "No lab reports yet"}
            </p>
            {filter !== "ALL" && (
              <button
                onClick={() => setFilter("ALL")}
                className="mt-2 text-sm font-medium hover:underline"
                style={{ color: "rgb(16,185,129)" }}
              >
                View all reports
              </button>
            )}
            {reports.length === 0 && (
              <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: "rgba(16,185,129,0.05)", border: "1px solid var(--border)" }}>
                <p className="text-sm" style={{ color: "var(--text-light)" }}>
                  💡 Lab reports will appear here once your doctor orders tests and the results are ready.
                </p>
              </div>
            )}
          </div>
        ) : (
          filteredReports.map((report) => (
            <div key={report.id} className="p-4 rounded-2xl transition hover:shadow-md" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(16,185,129,0.1)" }}>
                    <FileText className="w-5 h-5" style={{ color: "rgb(16,185,129)" }} />
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: "var(--text)" }}>{report.name}</h3>
                    <p className="text-sm" style={{ color: "var(--text-light)" }}>{report.type} · {formatDate(report.date)}</p>
                    <p className="text-sm" style={{ color: "var(--text-light)" }}>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" /> Dr. {report.doctor.name}
                      </span>
                    </p>
                    {report.notes && (
                      <p className="text-xs mt-1" style={{ color: "var(--text-light)" }}>{report.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                    {getStatusIcon(report.status)} {getStatusLabel(report.status)}
                  </span>
                  {report.status === "READY" && (
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                      <Download className="w-4 h-4" style={{ color: "var(--text-light)" }} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}