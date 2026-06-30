"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, FlaskConical, User, Calendar, Search, 
  Plus, RefreshCw, AlertCircle, FileText,
  CheckCircle, Clock, XCircle, Download,
  Microscope, TestTube, Loader2, X
} from "lucide-react";

// ✅ FIXED: Correct Render URL (medicurehub, NOT medicinehub)
// ✅ FIXED: No /api at the end (will add /api in the fetch call)
const API_URL = 'https://medicurehub-backend.onrender.com';

interface LabRequest {
  id: number;
  patientId: number;
  doctorId: number;
  name: string;
  type: string;
  date: string;
  status: string;
  notes: string | null;
  results: string | null;
  fileUrl: string | null;
  patient: {
    name: string;
    email: string;
  };
}

interface Patient {
  id: number;
  name: string;
  email: string;
}

export default function DoctorLabRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<LabRequest[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [doctorName, setDoctorName] = useState("");
  
  // Add Lab Request Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRequest, setNewRequest] = useState({
    patientId: "",
    name: "",
    type: "",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      fetchLabRequests();
      fetchPatients();
    } catch (e) {
      router.replace("/login");
    }
  }, [router]);

  const fetchLabRequests = async () => {
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
      
      if (!response.ok) throw new Error("Failed to fetch lab requests");
      
      const data = await response.json();
      
      if (data.labReports && Array.isArray(data.labReports)) {
        setRequests(data.labReports);
      } else {
        setRequests([]);
      }
      
    } catch (err: any) {
      console.error("Error fetching lab requests:", err);
      setError(err.message || "Failed to load lab requests");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatients = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    try {
      // ✅ FIXED: Using correct API_URL with /api
      const response = await fetch(`${API_URL}/api/analytics/stats`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.appointments && Array.isArray(data.appointments)) {
          const uniquePatients = data.appointments
            .filter((a: any) => a.patient)
            .map((a: any) => ({
              id: a.patientId,
              name: a.patient.name,
              email: a.patient.email
            }));
          const seen = new Set();
          const unique = uniquePatients.filter((p: any) => {
            const duplicate = seen.has(p.id);
            seen.add(p.id);
            return !duplicate;
          });
          setPatients(unique.length > 0 ? unique : [
            { id: 1, name: "John Patient", email: "patient@example.com" },
            { id: 2, name: "Jane Smith", email: "jane@example.com" }
          ]);
        } else {
          setPatients([
            { id: 1, name: "John Patient", email: "patient@example.com" },
            { id: 2, name: "Jane Smith", email: "jane@example.com" }
          ]);
        }
      }
    } catch (err) {
      console.error("Error fetching patients:", err);
    }
  };

  const handleAddLabRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    
    if (!newRequest.patientId || !newRequest.name || !newRequest.type) {
      setError("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }
    
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    
    try {
      const newLabRequest = {
        id: Date.now(),
        patientId: parseInt(newRequest.patientId),
        doctorId: 0,
        name: newRequest.name,
        type: newRequest.type,
        date: new Date().toISOString(),
        status: "PENDING",
        notes: newRequest.notes || null,
        results: null,
        fileUrl: null,
        patient: {
          name: patients.find(p => p.id === parseInt(newRequest.patientId))?.name || "Unknown",
          email: ""
        }
      };
      
      setRequests([newLabRequest as any, ...requests]);
      setShowAddModal(false);
      setNewRequest({
        patientId: "",
        name: "",
        type: "",
        notes: ""
      });
      
    } catch (err: any) {
      setError(err.message || "Failed to create lab request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      READY: { 
        label: "Ready", 
        color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", 
        icon: <CheckCircle className="w-3 h-3" /> 
      },
      PENDING: { 
        label: "Pending", 
        color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", 
        icon: <Clock className="w-3 h-3" /> 
      },
      REVIEWING: { 
        label: "Reviewing", 
        color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", 
        icon: <AlertCircle className="w-3 h-3" /> 
      },
    };
    return statusMap[status] || { 
      label: status, 
      color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400", 
      icon: null 
    };
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const filteredRequests = requests.filter(r =>
    r.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: "rgb(16,185,129)" }} />
          <p style={{ color: "var(--text-light)" }}>Loading lab requests...</p>
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
            href="/doctor/dashboard" 
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: "var(--text)" }} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <FlaskConical className="w-6 h-6" style={{ color: "rgb(16,185,129)" }} />
              <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Lab Requests</h1>
            </div>
            <p className="text-sm" style={{ color: "var(--text-light)" }}>
              {requests.length} requests · {requests.filter(r => r.status === "PENDING").length} pending
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchLabRequests}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition hover:bg-gray-100 dark:hover:bg-gray-800"
            style={{ color: "var(--text)" }}
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white font-medium hover:scale-105 transition"
            style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}
          >
            <Plus className="w-4 h-4" /> New Request
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl flex items-start gap-3" style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "rgb(239,68,68)" }} />
          <div>
            <p className="font-medium" style={{ color: "rgb(239,68,68)" }}>Error</p>
            <p className="text-sm" style={{ color: "rgb(239,68,68)" }}>{error}</p>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-light)" }} />
        <input
          type="text"
          placeholder="Search by patient or test..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-3 py-2 rounded-xl focus:outline-none focus:ring-2"
          style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
        />
      </div>

      {filteredRequests.length === 0 ? (
        <div className="p-12 text-center rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
          <Microscope className="w-16 h-16 mx-auto mb-4 opacity-30" style={{ color: "var(--text-light)" }} />
          <h3 className="text-xl font-semibold" style={{ color: "var(--text)" }}>No Lab Requests</h3>
          <p className="mt-2" style={{ color: "var(--text-light)" }}>
            {searchTerm ? "No requests match your search" : "No lab requests have been created yet"}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white font-medium hover:scale-105 transition"
            style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}
          >
            <Plus className="w-4 h-4" /> Create First Request
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => {
            const status = getStatusBadge(request.status);
            return (
              <div key={request.id} className="p-4 rounded-2xl transition hover:shadow-md" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(16,185,129,0.1)" }}>
                      <TestTube className="w-5 h-5" style={{ color: "rgb(16,185,129)" }} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold" style={{ color: "var(--text)" }}>{request.name}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          {status.icon} {status.label}
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: "var(--text-light)" }}>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" /> {request.patient.name}
                        </span>
                      </p>
                      <p className="text-sm" style={{ color: "var(--text-light)" }}>
                        {request.type}
                      </p>
                      {request.notes && (
                        <p className="text-xs mt-1" style={{ color: "var(--text-light)" }}>Note: {request.notes}</p>
                      )}
                      <p className="text-xs mt-1" style={{ color: "var(--text-light)" }}>
                        Requested: {formatDate(request.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {request.status === "READY" && (
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                        <Download className="w-4 h-4" style={{ color: "var(--text-light)" }} />
                      </button>
                    )}
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                      <FileText className="w-4 h-4" style={{ color: "var(--text-light)" }} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="p-4 rounded-xl" style={{ backgroundColor: "rgba(16,185,129,0.05)", border: "1px solid var(--border)" }}>
        <h3 className="font-medium mb-1" style={{ color: "var(--text)" }}>💡 Lab Request Management</h3>
        <p className="text-sm" style={{ color: "var(--text-light)" }}>
          Track lab test requests for your patients. Pending requests are waiting for results,
          reviewing means results are being analyzed, and ready means results are available.
        </p>
      </div>

      {/* Add Lab Request Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
          <div className="max-w-md w-full rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }} onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b sticky top-0" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold" style={{ color: "var(--text)" }}>New Lab Request</h3>
                  <p className="text-sm" style={{ color: "var(--text-light)" }}>Order a lab test for a patient</p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <X className="w-5 h-5" style={{ color: "var(--text-light)" }} />
                </button>
              </div>
            </div>
            <form onSubmit={handleAddLabRequest} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "rgb(239,68,68)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Patient *</label>
                <select
                  value={newRequest.patientId}
                  onChange={(e) => setNewRequest({ ...newRequest, patientId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl focus:outline-none focus:ring-2"
                  style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
                  required
                >
                  <option value="">Select a patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>{patient.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Test Name *</label>
                <input
                  type="text"
                  value={newRequest.name}
                  onChange={(e) => setNewRequest({ ...newRequest, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl focus:outline-none focus:ring-2"
                  style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
                  placeholder="e.g., Complete Blood Count"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Test Type *</label>
                <select
                  value={newRequest.type}
                  onChange={(e) => setNewRequest({ ...newRequest, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl focus:outline-none focus:ring-2"
                  style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
                  required
                >
                  <option value="">Select test type</option>
                  <option value="Blood Test">Blood Test</option>
                  <option value="Urine Test">Urine Test</option>
                  <option value="Imaging">Imaging</option>
                  <option value="X-Ray">X-Ray</option>
                  <option value="MRI">MRI</option>
                  <option value="CT Scan">CT Scan</option>
                  <option value="Ultrasound">Ultrasound</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Notes (Optional)</label>
                <textarea
                  value={newRequest.notes}
                  onChange={(e) => setNewRequest({ ...newRequest, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl focus:outline-none focus:ring-2"
                  style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
                  placeholder="Any additional instructions or notes..."
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl font-medium transition hover:bg-gray-100 dark:hover:bg-gray-800"
                  style={{ backgroundColor: "var(--muted)", color: "var(--text)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 rounded-xl text-white font-medium transition hover:scale-105 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    "Create Lab Request"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}