"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Users, CheckCircle, XCircle, Clock, 
  Search, Eye, FileText, Award, Calendar, RefreshCw,
  AlertCircle, Loader2, Shield, UserCheck, UserX,
  Briefcase, Stethoscope, ExternalLink,
  AlertTriangle, MessageCircle, ChevronRight,
  Mail, Phone, MapPin, Building, BookOpen
} from "lucide-react";

interface PendingDoctor {
  id: number;
  name: string;
  email: string;
  licenseNumber: string;
  specialization: string;
  yearsExperience: number;
  certificateUrl: string | null;
  createdAt: string;
  status: string;
  rejectionReason: string | null;
}

export default function AdminDoctorsPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<PendingDoctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [adminName, setAdminName] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<PendingDoctor | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionReasonCustom, setRejectionReasonCustom] = useState("");
  const [isRejectionReasonOther, setIsRejectionReasonOther] = useState(false);
  const [rejectDoctorId, setRejectDoctorId] = useState<number | null>(null);

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
        router.replace("/patient/dashboard");
        return;
      }
      
      setIsAdmin(true);
      fetchDoctors();
    } catch (e) {
      router.replace("/login");
    }
  }, [router]);

  const fetchDoctors = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    try {
      setIsLoading(true);
      setError("");
      
      const response = await fetch("http://localhost:5000/api/auth/pending-doctors", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/login");
        return;
      }
      
      if (!response.ok) throw new Error("Failed to fetch doctors");
      
      const data = await response.json();
      setDoctors(data);
      
    } catch (err: any) {
      console.error("Error fetching doctors:", err);
      setError(err.message || "Failed to load doctors");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (doctorId: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    setProcessingId(doctorId);
    setError("");
    setSuccess("");
    
    try {
      const response = await fetch(`http://localhost:5000/api/auth/doctors/${doctorId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: "ACTIVE" })
      });
      
      if (!response.ok) throw new Error("Failed to approve doctor");
      
      const doctor = doctors.find(d => d.id === doctorId);
      setSuccess(`✅ Dr. ${doctor?.name} approved successfully!`);
      await fetchDoctors();
      
    } catch (err: any) {
      setError(err.message || "Failed to approve doctor");
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (doctorId: number) => {
    setRejectDoctorId(doctorId);
    setRejectionReason("");
    setRejectionReasonCustom("");
    setIsRejectionReasonOther(false);
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectDoctorId) return;
    
    let finalReason = rejectionReason;
    if (isRejectionReasonOther) {
      if (!rejectionReasonCustom.trim()) {
        setError("Please enter a custom rejection reason");
        return;
      }
      finalReason = rejectionReasonCustom;
    }
    
    if (!finalReason || !finalReason.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }
    
    const token = localStorage.getItem("token");
    if (!token) return;
    
    setProcessingId(rejectDoctorId);
    setError("");
    setSuccess("");
    
    try {
      const response = await fetch(`http://localhost:5000/api/auth/doctors/${rejectDoctorId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: "REJECTED",
          rejectionReason: finalReason 
        })
      });
      
      if (!response.ok) throw new Error("Failed to reject doctor");
      
      const doctor = doctors.find(d => d.id === rejectDoctorId);
      setSuccess(`❌ Dr. ${doctor?.name} rejected.`);
      setShowRejectModal(false);
      setRejectionReason("");
      setRejectionReasonCustom("");
      setIsRejectionReasonOther(false);
      await fetchDoctors();
      
    } catch (err: any) {
      setError(err.message || "Failed to reject doctor");
    } finally {
      setProcessingId(null);
      setRejectDoctorId(null);
    }
  };

  const viewDoctorDetails = (doctor: PendingDoctor) => {
    setSelectedDoctor(doctor);
    setShowDetailModal(true);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusBadge = (doctor: PendingDoctor) => {
    const status = doctor.status || "PENDING";
    switch (status) {
      case "ACTIVE":
        return { label: "Active", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: <CheckCircle className="w-3 h-3" /> };
      case "REJECTED":
        return { label: "Rejected", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: <XCircle className="w-3 h-3" /> };
      case "PENDING":
      default:
        return { label: "Pending", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: <Clock className="w-3 h-3" /> };
    }
  };

  const filteredDoctors = doctors.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || (d.status || "PENDING") === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (!isAdmin && isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: "rgb(16,185,129)" }} />
          <p style={{ color: "var(--text-light)" }}>Loading doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link 
            href="/admin/dashboard" 
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: "var(--text)" }} />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" style={{ color: "rgb(16,185,129)" }} />
              <h1 className="text-lg sm:text-2xl font-bold truncate" style={{ color: "var(--text)" }}>Doctor Verification</h1>
            </div>
            <p className="text-xs sm:text-sm truncate" style={{ color: "var(--text-light)" }}>
              {doctors.filter(d => d.status === "PENDING").length} pending · {doctors.filter(d => d.status === "REJECTED").length} rejected
            </p>
          </div>
        </div>
        <button
          onClick={fetchDoctors}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0"
          style={{ color: "var(--text)" }}
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Messages */}
      {success && (
        <div className="p-3 sm:p-4 rounded-xl flex items-start gap-3 mb-4" style={{ backgroundColor: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "rgb(16,185,129)" }} />
          <div className="min-w-0">
            <p className="font-medium text-sm" style={{ color: "rgb(16,185,129)" }}>Success</p>
            <p className="text-xs sm:text-sm break-words" style={{ color: "rgb(16,185,129)" }}>{success}</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="p-3 sm:p-4 rounded-xl flex items-start gap-3 mb-4" style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "rgb(239,68,68)" }} />
          <div className="min-w-0">
            <p className="font-medium text-sm" style={{ color: "rgb(239,68,68)" }}>Error</p>
            <p className="text-xs sm:text-sm break-words" style={{ color: "rgb(239,68,68)" }}>{error}</p>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex-shrink-0" style={{ color: "var(--text-light)" }} />
          <input
            type="text"
            placeholder="Search by name, email, license..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-xl focus:outline-none focus:ring-2 text-sm"
            style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-xl focus:outline-none focus:ring-2 text-sm w-full sm:w-auto flex-shrink-0"
          style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="ACTIVE">Active</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Doctor Cards */}
      {filteredDoctors.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(16,185,129,0.1)" }}>
            <UserCheck className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: "rgb(16,185,129)" }} />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold" style={{ color: "var(--text)" }}>All Caught Up! 🎉</h3>
          <p className="text-sm" style={{ color: "var(--text-light)" }}>
            {filterStatus !== "ALL" ? `No ${filterStatus.toLowerCase()} doctors found` : "No doctors to review"}
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredDoctors.map((doctor) => {
            const status = getStatusBadge(doctor);
            const isPending = doctor.status === "PENDING";
            const isRejected = doctor.status === "REJECTED";
            
            return (
              <div key={doctor.id} className="p-4 rounded-2xl transition hover:shadow-md" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3 lg:gap-4">
                  
                  {/* Left - Doctor Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 sm:gap-4">
                      {/* Avatar */}
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0" style={{ background: isRejected ? "linear-gradient(135deg, rgb(239,68,68), rgb(220,38,38))" : "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}>
                        {doctor.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                          <h3 className="font-semibold text-sm sm:text-lg truncate max-w-[150px] sm:max-w-xs" style={{ color: "var(--text)" }}>{doctor.name}</h3>
                          <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap ${status.color}`}>
                            {status.icon} {status.label}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm truncate" style={{ color: "var(--text-light)" }}>{doctor.email}</p>
                        
                        <div className="flex flex-wrap gap-1 sm:gap-3 mt-1.5 sm:mt-2 text-xs sm:text-sm">
                          <span className="flex items-center gap-0.5 sm:gap-1" style={{ color: "var(--text-light)" }}>
                            <Award className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: "rgb(16,185,129)" }} />
                            <span className="truncate max-w-[60px] sm:max-w-none">{doctor.licenseNumber}</span>
                          </span>
                          <span className="flex items-center gap-0.5 sm:gap-1" style={{ color: "var(--text-light)" }}>
                            <Stethoscope className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: "rgb(16,185,129)" }} />
                            <span className="truncate max-w-[70px] sm:max-w-none">{doctor.specialization}</span>
                          </span>
                          <span className="flex items-center gap-0.5 sm:gap-1" style={{ color: "var(--text-light)" }}>
                            <Briefcase className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: "rgb(16,185,129)" }} />
                            <span>{doctor.yearsExperience}y</span>
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-xs mt-1" style={{ color: "var(--text-light)" }}>
                          Registered: {formatDate(doctor.createdAt)}
                        </p>
                        {isRejected && doctor.rejectionReason && (
                          <div className="mt-1 inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 max-w-full">
                            <AlertTriangle className="w-3 h-3 flex-shrink-0" /> 
                            <span className="truncate max-w-[150px] sm:max-w-xs">{doctor.rejectionReason}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row lg:flex-col gap-1.5 sm:gap-2 flex-shrink-0 flex-wrap">
                    <button
                      onClick={() => viewDoctorDetails(doctor)}
                      className="inline-flex items-center justify-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm transition hover:bg-gray-100 dark:hover:bg-gray-800"
                      style={{ color: "var(--text-light)" }}
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden xs:inline">View</span>
                    </button>
                    {isPending && (
                      <div className="flex gap-1 sm:gap-2">
                        <button
                          onClick={() => handleApprove(doctor.id)}
                          disabled={processingId === doctor.id}
                          className="inline-flex items-center justify-center gap-0.5 sm:gap-1 px-2 sm:px-4 py-1 sm:py-2 rounded-xl text-white font-medium hover:scale-105 transition disabled:opacity-50 text-xs sm:text-sm flex-1"
                          style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}
                        >
                          {processingId === doctor.id ? (
                            <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> Approve
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => openRejectModal(doctor.id)}
                          disabled={processingId === doctor.id}
                          className="inline-flex items-center justify-center gap-0.5 sm:gap-1 px-2 sm:px-4 py-1 sm:py-2 rounded-xl font-medium hover:scale-105 transition disabled:opacity-50 text-xs sm:text-sm flex-1"
                          style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "rgb(239,68,68)" }}
                        >
                          <XCircle className="w-3 h-3 sm:w-4 sm:h-4" /> Reject
                        </button>
                      </div>
                    )}
                    {isRejected && (
                      <button
                        onClick={() => handleApprove(doctor.id)}
                        disabled={processingId === doctor.id}
                        className="inline-flex items-center justify-center gap-0.5 sm:gap-1 px-2 sm:px-4 py-1 sm:py-2 rounded-xl text-white font-medium hover:scale-105 transition disabled:opacity-50 text-xs sm:text-sm"
                        style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}
                      >
                        {processingId === doctor.id ? (
                          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> Re-approve
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Box */}
      <div className="p-3 sm:p-4 rounded-xl mt-4 sm:mt-6" style={{ backgroundColor: "rgba(16,185,129,0.05)", border: "1px solid var(--border)" }}>
        <h3 className="font-medium text-sm sm:text-base mb-1" style={{ color: "var(--text)" }}>💡 About Verification</h3>
        <p className="text-xs sm:text-sm" style={{ color: "var(--text-light)" }}>
          Review each doctor's credentials carefully. Approved doctors can accept appointments.
          Click <strong>"View"</strong> for full details and documents.
        </p>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowDetailModal(false)}>
          <div className="max-w-2xl w-full rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }} onClick={(e) => e.stopPropagation()}>
            <div className="p-4 sm:p-6 border-b sticky top-0 z-10" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-bold" style={{ color: "var(--text)" }}>Doctor Profile</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <XCircle className="w-5 h-5" style={{ color: "var(--text-light)" }} />
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-white font-bold text-xl sm:text-2xl flex-shrink-0" style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}>
                  {selectedDoctor.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-2xl font-bold truncate" style={{ color: "var(--text)" }}>{selectedDoctor.name}</h2>
                  <p className="text-xs sm:text-sm truncate" style={{ color: "var(--text-light)" }}>{selectedDoctor.email}</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusBadge(selectedDoctor).color}`}>
                    {getStatusBadge(selectedDoctor).icon} {getStatusBadge(selectedDoctor).label}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 rounded-xl" style={{ backgroundColor: "var(--input-bg)" }}>
                  <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-light)" }}>License</p>
                  <p className="font-semibold text-sm sm:text-base mt-1 truncate" style={{ color: "var(--text)" }}>{selectedDoctor.licenseNumber}</p>
                </div>
                <div className="p-3 sm:p-4 rounded-xl" style={{ backgroundColor: "var(--input-bg)" }}>
                  <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-light)" }}>Specialization</p>
                  <p className="font-semibold text-sm sm:text-base mt-1 truncate" style={{ color: "var(--text)" }}>{selectedDoctor.specialization}</p>
                </div>
                <div className="p-3 sm:p-4 rounded-xl" style={{ backgroundColor: "var(--input-bg)" }}>
                  <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-light)" }}>Experience</p>
                  <p className="font-semibold text-sm sm:text-base mt-1" style={{ color: "var(--text)" }}>{selectedDoctor.yearsExperience} years</p>
                </div>
                <div className="p-3 sm:p-4 rounded-xl" style={{ backgroundColor: "var(--input-bg)" }}>
                  <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-light)" }}>Registered</p>
                  <p className="font-semibold text-sm sm:text-base mt-1 truncate" style={{ color: "var(--text)" }}>{formatDate(selectedDoctor.createdAt)}</p>
                </div>
              </div>

              {selectedDoctor.rejectionReason && (
                <div className="p-3 sm:p-4 rounded-xl" style={{ backgroundColor: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider" style={{ color: "rgb(239,68,68)" }}>Rejection Reason</p>
                  <p className="text-sm sm:text-base mt-1 break-words" style={{ color: "var(--text)" }}>{selectedDoctor.rejectionReason}</p>
                </div>
              )}

              <div className="p-3 sm:p-4 rounded-xl border-2 border-dashed" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "rgb(16,185,129)" }} />
                  <h4 className="font-semibold text-sm sm:text-base" style={{ color: "var(--text)" }}>Documents</h4>
                </div>
                {selectedDoctor.certificateUrl ? (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: "rgba(16,185,129,0.05)" }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(16,185,129,0.1)" }}>
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "rgb(16,185,129)" }} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate" style={{ color: "var(--text)" }}>Medical License</p>
                        <p className="text-xs truncate" style={{ color: "var(--text-light)" }}>Uploaded during registration</p>
                      </div>
                    </div>
                    <a
                      href={selectedDoctor.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition hover:scale-105 text-white w-full sm:w-auto flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}
                    >
                      <ExternalLink className="w-3 h-3" /> View
                    </a>
                  </div>
                ) : (
                  <div className="p-4 text-center" style={{ backgroundColor: "rgba(239,68,68,0.05)", borderRadius: "8px" }}>
                    <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2" style={{ color: "rgb(234,179,8)" }} />
                    <p className="text-xs sm:text-sm" style={{ color: "var(--text-light)" }}>No document uploaded</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl font-medium transition hover:bg-gray-100 dark:hover:bg-gray-800 text-sm order-2 sm:order-1"
                  style={{ backgroundColor: "var(--muted)", color: "var(--text)" }}
                >
                  Close
                </button>
                {selectedDoctor.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        handleApprove(selectedDoctor.id);
                      }}
                      className="flex-1 px-4 py-2 rounded-xl text-white font-medium transition hover:scale-105 text-sm order-1 sm:order-2"
                      style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}
                    >
                      <CheckCircle className="w-4 h-4 inline mr-1" /> Approve
                    </button>
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        openRejectModal(selectedDoctor.id);
                      }}
                      className="flex-1 px-4 py-2 rounded-xl font-medium transition hover:scale-105 text-sm order-1 sm:order-3"
                      style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "rgb(239,68,68)" }}
                    >
                      <XCircle className="w-4 h-4 inline mr-1" /> Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowRejectModal(false)}>
          <div className="max-w-md w-full rounded-2xl shadow-xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }} onClick={(e) => e.stopPropagation()}>
            <div className="p-4 sm:p-6 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" style={{ color: "rgb(239,68,68)" }} />
                <h3 className="text-lg sm:text-xl font-semibold" style={{ color: "var(--text)" }}>Reject Doctor</h3>
              </div>
              <p className="text-xs sm:text-sm" style={{ color: "var(--text-light)" }}>Provide a reason for rejection</p>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Rejection Reason *</label>
                <select
                  value={rejectionReason}
                  onChange={(e) => {
                    const value = e.target.value;
                    setRejectionReason(value);
                    setIsRejectionReasonOther(value === "Other");
                    if (value !== "Other") setRejectionReasonCustom("");
                  }}
                  className="w-full px-3 py-2 rounded-xl focus:outline-none focus:ring-2 text-sm"
                  style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
                >
                  <option value="">Select a reason...</option>
                  <option value="Incomplete documentation">Incomplete documentation</option>
                  <option value="License verification failed">License verification failed</option>
                  <option value="Credentials don't meet standards">Credentials don't meet standards</option>
                  <option value="Duplicate application">Duplicate application</option>
                  <option value="Insufficient experience">Insufficient experience</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              {isRejectionReasonOther && (
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Custom Reason</label>
                  <textarea
                    value={rejectionReasonCustom}
                    onChange={(e) => setRejectionReasonCustom(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl focus:outline-none focus:ring-2 text-sm"
                    style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
                    placeholder="Enter custom reason..."
                  />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl font-medium transition hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
                  style={{ backgroundColor: "var(--muted)", color: "var(--text)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={processingId !== null}
                  className="flex-1 px-4 py-2 rounded-xl text-white font-medium transition hover:scale-105 disabled:opacity-50 text-sm"
                  style={{ background: "linear-gradient(135deg, rgb(239,68,68), rgb(220,38,38))" }}
                >
                  {processingId !== null ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 inline mr-1" /> Confirm
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}