"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, User, UserPlus, Stethoscope, Calendar, Activity, Sparkles, Award, FileText, Clock } from "lucide-react";
import SimpleTheme from "../components/SimpleTheme";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingMessage, setPendingMessage] = useState("");
  
  // Doctor verification fields
  const [licenseNumber, setLicenseNumber] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [certificateFile, setCertificateFile] = useState<File | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      const user = JSON.parse(userStr);
      router.push(user.role?.toLowerCase() === "doctor" ? "/doctor/dashboard" : "/patient/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPendingMessage("");
    setIsLoading(true);

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    // Validate doctor fields
    if (role === "doctor") {
      if (!licenseNumber) {
        setError("Please enter your medical license number");
        setIsLoading(false);
        return;
      }
      if (!specialization) {
        setError("Please select your specialization");
        setIsLoading(false);
        return;
      }
      if (!yearsExperience) {
        setError("Please enter your years of experience");
        setIsLoading(false);
        return;
      }
    }

    try {
      // ✅ Use FormData for file upload
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('role', role);
      
      if (role === "doctor") {
        formData.append('licenseNumber', licenseNumber);
        formData.append('specialization', specialization);
        formData.append('yearsExperience', yearsExperience);
        if (certificateFile) {
          formData.append('certificate', certificateFile);
        }
      }

      // ✅ Send as FormData, not JSON
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        body: formData,  // ✅ FormData, not JSON
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // If doctor registration is pending approval
      if (data.user?.status === "PENDING") {
        setPendingMessage("Your doctor account has been submitted for verification. You'll be notified once approved.");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({
        ...data.user,
        role: data.user.role?.toLowerCase() || "patient"
      }));

      const userRole = data.user.role?.toLowerCase();
      if (userRole === "doctor") {
        window.location.href = "/doctor/dashboard";
      } else {
        window.location.href = "/patient/dashboard";
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
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
        
        {/* LEFT SIDE - Branding */}
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-between relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(20,184,166,0.05) 100%)" }}>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl" style={{ color: "var(--text)" }}>MediCare<span style={{ color: "rgb(16,185,129)" }}>Hub</span></span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight" style={{ color: "var(--text)" }}>
              Join Our
              <br />
              <span style={{ color: "rgb(16,185,129)" }}>Healthcare Community</span>
            </h1>
            <p className="mb-8 leading-relaxed" style={{ color: "var(--text-light)" }}>
              Create your account and start managing your healthcare journey with ease.
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

        {/* RIGHT SIDE - Register Form */}
        <div className="w-full md:w-1/2 p-8 md:p-10 max-h-[90vh] overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2" style={{ color: "var(--text)" }}>Create Account</h2>
            <p className="text-sm" style={{ color: "var(--text-light)" }}>Join MediCareHub today</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm" style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "rgb(239,68,68)", border: "1px solid rgba(239,68,68,0.2)" }}>
              {error}
            </div>
          )}

          {pendingMessage && (
            <div className="mb-4 p-4 rounded-xl text-sm" style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "rgb(16,185,129)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <p className="font-semibold">✅ Registration Submitted!</p>
              <p className="mt-1">{pendingMessage}</p>
              <Link href="/login" className="mt-2 inline-block text-sm font-medium hover:underline" style={{ color: "rgb(16,185,129)" }}>
                Return to Login
              </Link>
            </div>
          )}

          {!pendingMessage && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-light)" }} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 transition-all"
                    style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              {/* Email */}
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

              {/* Password */}
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

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-light)" }} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl focus:outline-none focus:ring-2 transition-all"
                    style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
                    placeholder="••••••••"
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

              {/* Account Type */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text)" }}>I am a</label>
                <div className="flex gap-6">
                  {["patient", "doctor"].map((r) => (
                    <label key={r} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value={r}
                        checked={role === r}
                        onChange={() => setRole(r as "patient" | "doctor")}
                        className="w-4 h-4"
                        style={{ accentColor: "rgb(16,185,129)" }}
                      />
                      <span className="text-sm capitalize" style={{ color: "var(--text)" }}>{r}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* ✅ DOCTOR VERIFICATION FIELDS */}
              {role === "doctor" && (
                <div className="space-y-4 p-4 rounded-xl" style={{ backgroundColor: "rgba(16,185,129,0.05)", border: "1px solid var(--border)" }}>
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5" style={{ color: "rgb(16,185,129)" }} />
                    <h3 className="font-semibold text-sm" style={{ color: "var(--text)" }}>Doctor Verification</h3>
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-light)" }}>
                    Please provide your credentials for verification. Your account will be reviewed before activation.
                  </p>
                  
                  {/* License Number */}
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Medical License Number</label>
                    <input
                      type="text"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl focus:outline-none focus:ring-2"
                      style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
                      placeholder="e.g., MD-12345"
                      required={role === "doctor"}
                    />
                  </div>
                  
                  {/* Specialization */}
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Specialization</label>
                    <select
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl focus:outline-none focus:ring-2"
                      style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
                      required={role === "doctor"}
                    >
                      <option value="">Select your specialization</option>
                      <option value="Cardiologist">Cardiologist</option>
                      <option value="Dermatologist">Dermatologist</option>
                      <option value="Endocrinologist">Endocrinologist</option>
                      <option value="Gastroenterologist">Gastroenterologist</option>
                      <option value="General Practitioner">General Practitioner</option>
                      <option value="Neurologist">Neurologist</option>
                      <option value="Obstetrician">Obstetrician</option>
                      <option value="Ophthalmologist">Ophthalmologist</option>
                      <option value="Orthopedic Surgeon">Orthopedic Surgeon</option>
                      <option value="Pediatrician">Pediatrician</option>
                      <option value="Psychiatrist">Psychiatrist</option>
                      <option value="Radiologist">Radiologist</option>
                      <option value="Surgeon">Surgeon</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  {/* Years of Experience */}
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Years of Experience</label>
                    <input
                      type="number"
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl focus:outline-none focus:ring-2"
                      style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
                      placeholder="e.g., 5"
                      min="0"
                      max="50"
                      required={role === "doctor"}
                    />
                  </div>
                  
                  {/* ✅ Certificate Upload - Now sends file to backend */}
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "var(--text)" }}>Upload Certificate or License (PDF/Image)</label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setCertificateFile(e.target.files?.[0] || null)}
                      className="w-full px-3 py-2 rounded-xl focus:outline-none focus:ring-2"
                      style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--text)" }}
                    />
                    <p className="text-xs mt-1" style={{ color: "var(--text-light)" }}>Supported formats: PDF, JPG, PNG (Max 5MB)</p>
                    {certificateFile && (
                      <p className="text-xs mt-1" style={{ color: "rgb(16,185,129)" }}>
                        ✅ Selected: {certificateFile.name} ({(certificateFile.size / 1024).toFixed(1)} KB)
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Button */}
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
                    <UserPlus className="w-4 h-4" /> Create Account
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: "var(--text-light)" }}>
              Already have an account?{" "}
              <Link href="/login" className="font-medium hover:underline" style={{ color: "rgb(16,185,129)" }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}