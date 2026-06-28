"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, User, Mail, Lock, Shield, 
  AlertCircle, CheckCircle, Eye, EyeOff,
  Save, Trash2, LogOut
} from "lucide-react";

// ✅ ADDED: Get the API URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface User {
  id?: number;
  name: string;
  email: string;
  role: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  // Profile form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Messages
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (!token || !userStr) {
      router.replace("/login");
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userStr);
      const userData: User = {
        name: parsedUser.name || "",
        email: parsedUser.email || "",
        role: parsedUser.role || "patient"
      };
      setUser(userData);
      setName(userData.name);
      setEmail(userData.email);
      setIsAuthenticated(true);
    } catch (e) {
      router.replace("/login");
    }
  }, [router]);

  // Update profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      // ✅ CHANGED: Using environment variable instead of hardcoded localhost
      const response = await fetch(`${API_URL}/api/auth/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name, email })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }
      
      const updatedUser: User = {
        ...user!,
        name: name,
        email: email,
        role: user?.role || "patient"
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setSuccess("Profile updated successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);
    
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      setIsLoading(false);
      return;
    }
    
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      setIsLoading(false);
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      // ✅ CHANGED: Using environment variable instead of hardcoded localhost
      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to change password");
      }
      
      setSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Deactivate account
  const handleDeactivate = async () => {
    if (!confirm("Are you sure you want to deactivate your account? You can reactivate later by contacting support.")) return;
    
    try {
      const token = localStorage.getItem("token");
      // ✅ CHANGED: Using environment variable instead of hardcoded localhost
      const response = await fetch(`${API_URL}/api/auth/deactivate`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to deactivate account");
      }
      
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (!confirm("⚠️ Are you absolutely sure? This action cannot be undone. All your data will be permanently deleted.")) return;
    
    try {
      const token = localStorage.getItem("token");
      // ✅ CHANGED: Using environment variable instead of hardcoded localhost
      const response = await fetch(`${API_URL}/api/auth/delete-account`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete account");
      }
      
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link 
          href={user?.role?.toLowerCase() === "doctor" ? "/doctor/dashboard" : "/patient/dashboard"}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: "var(--text)" }} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Settings</h1>
          <p className="text-sm" style={{ color: "var(--text-light)" }}>
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 rounded-xl flex items-center gap-3" style={{ backgroundColor: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
          <CheckCircle className="w-5 h-5" style={{ color: "rgb(16,185,129)" }} />
          <span style={{ color: "rgb(16,185,129)" }}>{success}</span>
        </div>
      )}
      
      {error && (
        <div className="p-4 rounded-xl flex items-center gap-3" style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertCircle className="w-5 h-5" style={{ color: "rgb(239,68,68)" }} />
          <span style={{ color: "rgb(239,68,68)" }}>{error}</span>
        </div>
      )}

      {/* Profile Section */}
      <div className="rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="p-5 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>Profile Information</h2>
          <p className="text-sm" style={{ color: "var(--text-light)" }}>Update your personal information</p>
        </div>
        <form onSubmit={handleUpdateProfile} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-light)" }} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-xl focus:outline-none focus:ring-2"
                style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-light)" }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-xl focus:outline-none focus:ring-2"
                style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white font-medium hover:scale-105 transition"
            style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}
          >
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </form>
      </div>

      {/* Password Section */}
      <div className="rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="p-5 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>Change Password</h2>
          <p className="text-sm" style={{ color: "var(--text-light)" }}>Update your password</p>
        </div>
        <form onSubmit={handleChangePassword} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Current Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-light)" }} />
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 rounded-xl focus:outline-none focus:ring-2"
                style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" style={{ color: "var(--text-light)" }} /> : <Eye className="w-4 h-4" style={{ color: "var(--text-light)" }} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-light)" }} />
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 rounded-xl focus:outline-none focus:ring-2"
                style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" style={{ color: "var(--text-light)" }} /> : <Eye className="w-4 h-4" style={{ color: "var(--text-light)" }} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-light)" }} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 rounded-xl focus:outline-none focus:ring-2"
                style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" style={{ color: "var(--text-light)" }} /> : <Eye className="w-4 h-4" style={{ color: "var(--text-light)" }} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white font-medium hover:scale-105 transition"
            style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}
          >
            <Save className="w-4 h-4" /> Change Password
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid rgba(239,68,68,0.3)" }}>
        <div className="p-5 border-b" style={{ borderColor: "rgba(239,68,68,0.2)" }}>
          <h2 className="text-lg font-semibold" style={{ color: "rgb(239,68,68)" }}>Danger Zone</h2>
          <p className="text-sm" style={{ color: "var(--text-light)" }}>Irreversible account actions</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl" style={{ backgroundColor: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.1)" }}>
            <div>
              <p className="font-medium" style={{ color: "var(--text)" }}>Deactivate Account</p>
              <p className="text-sm" style={{ color: "var(--text-light)" }}>Your account will be temporarily disabled</p>
            </div>
            <button
              onClick={handleDeactivate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white font-medium hover:scale-105 transition"
              style={{ background: "linear-gradient(135deg, rgb(245,158,11), rgb(217,119,6))" }}
            >
              <LogOut className="w-4 h-4" /> Deactivate
            </button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl" style={{ backgroundColor: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.1)" }}>
            <div>
              <p className="font-medium" style={{ color: "rgb(239,68,68)" }}>Delete Account</p>
              <p className="text-sm" style={{ color: "var(--text-light)" }}>Permanently delete your account and all data</p>
            </div>
            <button
              onClick={handleDeleteAccount}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white font-medium hover:scale-105 transition"
              style={{ background: "linear-gradient(135deg, rgb(239,68,68), rgb(220,38,38))" }}
            >
              <Trash2 className="w-4 h-4" /> Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}