"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, LogIn, Stethoscope, Calendar, Activity, Sparkles, Shield } from "lucide-react";
import SimpleTheme from "../components/SimpleTheme";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"patient" | "doctor" | "admin">("patient");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        const userRole = user.role?.toLowerCase();
        if (userRole === "admin") {
          router.push("/admin/dashboard");
        } else if (userRole === "doctor") {
          router.push("/doctor/dashboard");
        } else {
          router.push("/patient/dashboard");
        }
      } catch (e) {}
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        // ✅ Professional error message
        setError("Invalid email or password. Please try again.");
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({
        ...data.user,
        role: data.user.role?.toLowerCase() || "patient"
      }));

      const userRole = data.user.role?.toLowerCase();
      if (userRole === "admin") {
        window.location.href = "/admin/dashboard";
      } else if (userRole === "doctor") {
        window.location.href = "/doctor/dashboard";
      } else {
        window.location.href = "/patient/dashboard";
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "var(--bg)" }}>
      
      <div className="fixed top-4 right-4 z-50">
        <SimpleTheme />
      </div>

      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(var(--text-light) 1px, transparent 1px)", backgroundSize: "24px 24px" }}></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row rounded-3xl shadow-2xl overflow-hidden" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
        
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-between relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(20,184,166,0.05) 100%)" }}>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl" style={{ color: "var(--text)" }}>MediCare<span style={{ color: "rgb(16,185,129)" }}>Hub</span></span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight" style={{ color: "var(--text)" }}>
              Your Health
              <br />
              <span style={{ color: "rgb(16,185,129)" }}>Our Priority</span>
            </h1>
            <p className="mb-8 leading-relaxed" style={{ color: "var(--text-light)" }}>
              Join thousands of patients and doctors using our platform for seamless healthcare management.
            </p>

            <div className="space-y-3">
              {[
                { icon: Calendar, text: "Smart appointment booking" },
                { icon: Stethoscope, text: "Connect with expert doctors" },
                { icon: Activity, text: "Digital health records" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(16,185,129,0.1)" }}>
                    <item.icon className="w-3.5 h-3.5" style={{ color: "rgb(16,185,129)" }} />
                  </div>
                  <span className="text-sm" style={{ color: "var(--text)" }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 mt-8 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
            <p className="text-sm italic leading-relaxed" style={{ color: "var(--text-light)" }}>
              "The most intuitive healthcare platform I've ever used."
            </p>
            <p className="text-xs font-medium mt-2" style={{ color: "var(--text)" }}>— Dr. Sarah Johnson, Cardiologist</p>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-10">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2" style={{ color: "var(--text)" }}>Welcome Back</h2>
            <p className="text-sm" style={{ color: "var(--text-light)" }}>Sign in to continue to your dashboard</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm" style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "rgb(239,68,68)", border: "1px solid rgba(239,68,68,0.2)" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-light)" }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 transition-all"
                  style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-light)" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl focus:outline-none focus:ring-2 transition-all"
                  style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" style={{ color: "var(--text-light)" }} /> : <Eye className="w-4 h-4" style={{ color: "var(--text-light)" }} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text)" }}>Account Type</label>
              <div className="flex gap-6">
                {["patient", "doctor", "admin"].map((r) => (
                  <label key={r} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value={r}
                      checked={role === r}
                      onChange={() => setRole(r as "patient" | "doctor" | "admin")}
                      className="w-4 h-4"
                      style={{ accentColor: "rgb(16,185,129)" }}
                    />
                    <span className="text-sm capitalize" style={{ color: "var(--text)" }}>{r}</span>
                    {r === "admin" && <Shield className="w-3 h-3" style={{ color: "rgb(139,92,246)" }} />}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 mt-6 text-white"
              style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: "var(--text-light)" }}>
              Don't have an account?{" "}
              <Link href="/register" className="font-medium hover:underline" style={{ color: "rgb(16,185,129)" }}>
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}