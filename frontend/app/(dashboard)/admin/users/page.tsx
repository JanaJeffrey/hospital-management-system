"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Users, Search, Eye, RefreshCw,
  AlertCircle, Shield, Stethoscope, UserCheck,
  CheckCircle, XCircle, Clock, UserX,
  Trash2, Mail, Calendar, Award, Briefcase
} from "lucide-react";

// ✅ ADDED: Get the API URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  licenseNumber?: string;
  specialization?: string;
  yearsExperience?: number;
  rejectionReason?: string | null;
  createdAt: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // View modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [userToView, setUserToView] = useState<User | null>(null);

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
      
      if (user.role?.toLowerCase() !== "admin") {
        router.replace("/patient/dashboard");
        return;
      }
      
      setIsAdmin(true);
      fetchUsers();
    } catch (e) {
      router.replace("/login");
    }
  }, [router]);

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    try {
      setIsLoading(true);
      setError("");
      
      // ✅ CHANGED: Using environment variable instead of hardcoded localhost
      const response = await fetch(`${API_URL}/api/auth/all-users`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/login");
        return;
      }
      
      if (!response.ok) throw new Error("Failed to fetch users");
      
      const data = await response.json();
      setUsers(data.users || []);
      
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(err.message || "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ DELETE USER
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    const token = localStorage.getItem("token");
    if (!token) return;
    
    setIsDeleting(true);
    setError("");
    
    try {
      // ✅ CHANGED: Using environment variable instead of hardcoded localhost
      const response = await fetch(`${API_URL}/api/auth/delete-account`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete user");
      }
      
      setShowDeleteModal(false);
      setUserToDelete(null);
      await fetchUsers();
      
    } catch (err: any) {
      setError(err.message || "Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteModal = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const openViewModal = (user: User) => {
    setUserToView(user);
    setShowViewModal(true);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "DOCTOR": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "PATIENT": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "PENDING": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "REJECTED": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "DEACTIVATED": return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE": return <CheckCircle className="w-3 h-3" />;
      case "PENDING": return <Clock className="w-3 h-3" />;
      case "REJECTED": return <XCircle className="w-3 h-3" />;
      case "DEACTIVATED": return <UserX className="w-3 h-3" />;
      default: return null;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN": return <Shield className="w-3 h-3" />;
      case "DOCTOR": return <Stethoscope className="w-3 h-3" />;
      case "PATIENT": return <UserCheck className="w-3 h-3" />;
      default: return null;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "ALL" || user.role === filterRole;
    const matchesStatus = filterStatus === "ALL" || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const pendingCount = users.filter(u => u.status === "PENDING").length;
  const totalUsers = users.length;

  if (!isAdmin && isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: "var(--text-light)" }}>Loading users...</p>
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
            href="/admin/dashboard" 
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: "var(--text)" }} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6" style={{ color: "rgb(16,185,129)" }} />
              <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Manage Users</h1>
            </div>
            <p className="text-sm" style={{ color: "var(--text-light)" }}>
              {totalUsers} total users · {pendingCount} pending approvals
            </p>
          </div>
        </div>
        <button
          onClick={fetchUsers}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition hover:bg-gray-100 dark:hover:bg-gray-800"
          style={{ color: "var(--text)" }}
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
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

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-light)" }} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-xl focus:outline-none focus:ring-2"
            style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-3 py-2 rounded-xl focus:outline-none focus:ring-2"
          style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
        >
          <option value="ALL">All Roles</option>
          <option value="PATIENT">Patients</option>
          <option value="DOCTOR">Doctors</option>
          <option value="ADMIN">Admins</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-xl focus:outline-none focus:ring-2"
          style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING">Pending</option>
          <option value="REJECTED">Rejected</option>
          <option value="DEACTIVATED">Deactivated</option>
        </select>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="p-12 text-center rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
          <Users className="w-16 h-16 mx-auto mb-4 opacity-30" style={{ color: "var(--text-light)" }} />
          <h3 className="text-xl font-semibold" style={{ color: "var(--text)" }}>No Users Found</h3>
          <p className="mt-2" style={{ color: "var(--text-light)" }}>
            {searchTerm || filterRole !== "ALL" || filterStatus !== "ALL" ? "No users match your filters" : "No users have registered yet"}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b" style={{ borderColor: "var(--border)" }}>
                <tr>
                  <th className="text-left p-4 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-light)" }}>User</th>
                  <th className="text-left p-4 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-light)" }}>Role</th>
                  <th className="text-left p-4 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-light)" }}>Status</th>
                  <th className="text-left p-4 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-light)" }}>Joined</th>
                  <th className="text-right p-4 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-light)" }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: user.status === "REJECTED" ? "linear-gradient(135deg, rgb(239,68,68), rgb(220,38,38))" : "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: "var(--text)" }}>{user.name}</p>
                          <p className="text-sm" style={{ color: "var(--text-light)" }}>{user.email}</p>
                          {user.licenseNumber && (
                            <p className="text-xs" style={{ color: "var(--text-light)" }}>
                              License: {user.licenseNumber} · {user.specialization}
                            </p>
                          )}
                          {user.rejectionReason && (
                            <p className="text-xs text-red-500">Rejected: {user.rejectionReason}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                        {getRoleIcon(user.role)} {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(user.status)}`}>
                        {getStatusIcon(user.status)} {user.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm" style={{ color: "var(--text-light)" }}>
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Button - Shows user details */}
                        <button
                          onClick={() => openViewModal(user)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                          style={{ color: "var(--text-light)" }}
                          title="View User Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {/* Delete Button - Only for non-admin users */}
                        {user.role !== "ADMIN" && (
                          <button
                            onClick={() => openDeleteModal(user)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                            style={{ color: "rgb(239,68,68)" }}
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info Box */}
      {users.length > 0 && (
        <div className="p-4 rounded-xl" style={{ backgroundColor: "rgba(16,185,129,0.05)", border: "1px solid var(--border)" }}>
          <h3 className="font-medium mb-1" style={{ color: "var(--text)" }}>💡 User Summary</h3>
          <div className="flex flex-wrap gap-4 text-sm" style={{ color: "var(--text-light)" }}>
            <span>👤 Total: <strong style={{ color: "var(--text)" }}>{users.length}</strong></span>
            <span>🟢 Active: <strong style={{ color: "rgb(16,185,129)" }}>{users.filter(u => u.status === "ACTIVE").length}</strong></span>
            <span>🟡 Pending: <strong style={{ color: "rgb(234,179,8)" }}>{users.filter(u => u.status === "PENDING").length}</strong></span>
            <span>🔴 Rejected: <strong style={{ color: "rgb(239,68,68)" }}>{users.filter(u => u.status === "REJECTED").length}</strong></span>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}>
          <div className="max-w-md w-full rounded-2xl shadow-xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }} onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" style={{ color: "rgb(239,68,68)" }} />
                <h3 className="text-xl font-semibold" style={{ color: "var(--text)" }}>Delete User</h3>
              </div>
              <p className="text-sm" style={{ color: "var(--text-light)" }}>This action cannot be undone</p>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.1)" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(239,68,68,0.15)" }}>
                  <UserX className="w-5 h-5" style={{ color: "rgb(239,68,68)" }} />
                </div>
                <div>
                  <p className="font-medium" style={{ color: "var(--text)" }}>{userToDelete.name}</p>
                  <p className="text-sm" style={{ color: "var(--text-light)" }}>{userToDelete.email}</p>
                  <p className="text-xs" style={{ color: "var(--text-light)" }}>Role: {userToDelete.role}</p>
                </div>
              </div>
              <p className="text-sm mt-4" style={{ color: "var(--text-light)" }}>
                Are you sure you want to permanently delete this user? All their data will be removed.
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl font-medium transition hover:bg-gray-100 dark:hover:bg-gray-800"
                  style={{ backgroundColor: "var(--muted)", color: "var(--text)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 rounded-xl text-white font-medium transition hover:scale-105 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, rgb(239,68,68), rgb(220,38,38))" }}
                >
                  {isDeleting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 inline mr-1" /> Delete User
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW USER DETAILS MODAL */}
      {showViewModal && userToView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowViewModal(false)}>
          <div className="max-w-lg w-full rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }} onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b sticky top-0" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold" style={{ color: "var(--text)" }}>User Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <XCircle className="w-5 h-5" style={{ color: "var(--text-light)" }} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl" style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}>
                  {userToView.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>{userToView.name}</h2>
                  <p className="text-sm" style={{ color: "var(--text-light)" }}>{userToView.email}</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusBadgeColor(userToView.status)}`}>
                    {getStatusIcon(userToView.status)} {userToView.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--input-bg)" }}>
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-light)" }}>Role</p>
                  <p className="font-semibold mt-1" style={{ color: "var(--text)" }}>{userToView.role}</p>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--input-bg)" }}>
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-light)" }}>Joined</p>
                  <p className="font-semibold mt-1" style={{ color: "var(--text)" }}>{formatDate(userToView.createdAt)}</p>
                </div>
                {userToView.licenseNumber && (
                  <>
                    <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--input-bg)" }}>
                      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-light)" }}>License Number</p>
                      <p className="font-semibold mt-1" style={{ color: "var(--text)" }}>{userToView.licenseNumber}</p>
                    </div>
                    <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--input-bg)" }}>
                      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-light)" }}>Specialization</p>
                      <p className="font-semibold mt-1" style={{ color: "var(--text)" }}>{userToView.specialization}</p>
                    </div>
                    <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--input-bg)" }}>
                      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-light)" }}>Years Experience</p>
                      <p className="font-semibold mt-1" style={{ color: "var(--text)" }}>{userToView.yearsExperience} years</p>
                    </div>
                  </>
                )}
                {userToView.rejectionReason && (
                  <div className="p-4 rounded-xl col-span-2" style={{ backgroundColor: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "rgb(239,68,68)" }}>Rejection Reason</p>
                    <p className="mt-1" style={{ color: "var(--text)" }}>{userToView.rejectionReason}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 rounded-xl font-medium transition hover:bg-gray-100 dark:hover:bg-gray-800"
                  style={{ backgroundColor: "var(--muted)", color: "var(--text)" }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}