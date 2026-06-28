"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Video, Mic, MicOff, VideoOff, 
  PhoneOff, Calendar, Clock, User, CheckCircle,
  AlertCircle, Camera, Monitor, Share2,
  Maximize2, Minimize2, X, Loader2
} from "lucide-react";

// ✅ ADDED: Get the API URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Appointment {
  id: number;
  doctorId: number;
  doctor: {
    name: string;
    email: string;
  };
  dateTime: string;
  status: string;
  reason: string | null;
}

export default function VideoConsultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');
  
  // ✅ State
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showEndCallModal, setShowEndCallModal] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ Check authentication and fetch appointment
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
      
      if (appointmentId) {
        fetchAppointmentDetails(parseInt(appointmentId));
      } else {
        // If no appointment ID, fetch the latest upcoming appointment
        fetchLatestAppointment();
      }
    } catch (e) {
      router.replace("/login");
    }
  }, [router, appointmentId]);

  // ✅ Fetch specific appointment
  const fetchAppointmentDetails = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    try {
      setIsLoading(true);
      setError("");
      
      // Try to get from appointments list first
      const response = await fetch(`${API_URL}/api/appointments/my`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/login");
        return;
      }
      
      if (!response.ok) throw new Error("Failed to fetch appointment");
      
      const appointments = await response.json();
      const found = appointments.find((apt: any) => apt.id === id);
      
      if (!found) {
        setError("Appointment not found");
        return;
      }
      
      setAppointment(found);
      
    } catch (err: any) {
      console.error("Error fetching appointment:", err);
      setError(err.message || "Failed to load appointment");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Fetch latest upcoming appointment
  const fetchLatestAppointment = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    try {
      setIsLoading(true);
      setError("");
      
      const response = await fetch(`${API_URL}/api/appointments/my`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/login");
        return;
      }
      
      if (!response.ok) throw new Error("Failed to fetch appointments");
      
      const appointments = await response.json();
      
      // Find the nearest upcoming appointment (CONFIRMED or PENDING)
      const now = new Date();
      const upcoming = appointments
        .filter((apt: any) => 
          (apt.status === "CONFIRMED" || apt.status === "PENDING") && 
          new Date(apt.dateTime) > now
        )
        .sort((a: any, b: any) => 
          new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
        );
      
      if (upcoming.length === 0) {
        setError("No upcoming appointments found. Please book an appointment first.");
        return;
      }
      
      setAppointment(upcoming[0]);
      
    } catch (err: any) {
      console.error("Error fetching appointments:", err);
      setError(err.message || "Failed to load appointments");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Initialize camera and microphone
  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setLocalStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      return true;
    } catch (err) {
      console.error("Error accessing media devices:", err);
      // If camera fails, try audio only
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true
        });
        setLocalStream(audioStream);
        if (videoRef.current) {
          videoRef.current.srcObject = audioStream;
        }
        setCameraOn(false);
        return true;
      } catch (audioErr) {
        setError("Unable to access camera or microphone. Please check your permissions.");
        return false;
      }
    }
  };

  // ✅ Join call
  const handleJoinCall = async () => {
    setIsUpdatingStatus(true);
    setError("");
    
    try {
      // Initialize media
      const mediaReady = await initializeMedia();
      if (!mediaReady) {
        setIsUpdatingStatus(false);
        return;
      }
      
      // Update appointment status to CONFIRMED
      if (appointment) {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/api/appointments/${appointment.id}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ status: "CONFIRMED" })
        });
        
        if (!response.ok) {
          console.warn("Could not update appointment status");
        }
      }
      
      setIsCallActive(true);
      
      // Start timer
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      
    } catch (err: any) {
      setError(err.message || "Failed to join call");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // ✅ End call
  const handleEndCall = () => {
    setShowEndCallModal(true);
  };

  const confirmEndCall = async () => {
    setShowEndCallModal(false);
    setIsUpdatingStatus(true);
    
    try {
      // Stop timer
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }
      
      // Stop media stream
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
      
      // Update appointment status to COMPLETED
      if (appointment) {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/api/appointments/${appointment.id}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ status: "COMPLETED" })
        });
        
        if (!response.ok) {
          console.warn("Could not update appointment status");
        }
      }
      
      setIsCallActive(false);
      
      // Redirect to dashboard
      router.push("/patient/dashboard");
      
    } catch (err: any) {
      setError(err.message || "Failed to end call");
      setIsUpdatingStatus(false);
    }
  };

  const cancelEndCall = () => {
    setShowEndCallModal(false);
  };

  // ✅ Toggle microphone
  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setMicOn(!micOn);
    }
  };

  // ✅ Toggle camera
  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setCameraOn(!cameraOn);
    }
  };

  // ✅ Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // ✅ Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ✅ Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [localStream]);

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: "rgb(16,185,129)" }} />
          <p style={{ color: "var(--text-light)" }}>Loading appointment details...</p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold" style={{ color: "var(--text)" }}>No Appointment Found</h2>
          <p className="mt-2" style={{ color: "var(--text-light)" }}>{error || "Please book an appointment before starting a video consultation."}</p>
          <Link 
            href="/patient/book-appointment"
            className="inline-block mt-4 px-4 py-2 rounded-xl text-white"
            style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}
          >
            Book Appointment
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 max-w-5xl mx-auto ${isFullscreen ? 'fixed inset-0 z-50 p-4 bg-black' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link 
            href="/patient/dashboard" 
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: "var(--text)" }} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Video Consultation</h1>
            <p className="text-sm" style={{ color: "var(--text-light)" }}>
              {isCallActive ? `⏱️ ${formatDuration(callDuration)}` : 'Ready to connect'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" style={{ color: "var(--text)" }} /> : <Maximize2 className="w-5 h-5" style={{ color: "var(--text)" }} />}
          </button>
        </div>
      </div>

      {/* Video Container */}
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center relative">
          {/* Local Video */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`absolute inset-0 w-full h-full object-cover ${!cameraOn ? 'hidden' : ''}`}
          />
          
          {/* Camera Off Overlay */}
          {!cameraOn && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <VideoOff className="w-16 h-16 mx-auto text-red-500/50 mb-4" />
                <p className="text-white/50">Camera is off</p>
              </div>
            </div>
          )}

          {/* Doctor's Picture-in-Picture */}
          <div className="absolute bottom-4 right-4 w-32 sm:w-48 h-24 sm:h-36 rounded-xl bg-gradient-to-br from-emerald-900/80 to-teal-900/80 border-2 border-white/20 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-1">
                <User className="w-5 h-5 text-white" />
              </div>
              <p className="text-white text-xs font-medium">Dr. {appointment.doctor.name}</p>
              <p className="text-white/50 text-[10px]">{isCallActive ? 'Connected' : 'Waiting'}</p>
            </div>
          </div>

          {/* Status Overlay */}
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <div className={`w-2 h-2 rounded-full ${isCallActive ? 'bg-emerald-500 animate-pulse' : 'bg-yellow-500'}`}></div>
            <span className="text-white text-xs font-medium">
              {isCallActive ? 'Live' : 'Waiting to join...'}
            </span>
            <span className="text-white/50 text-xs ml-2">
              {new Date(appointment.dateTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          {/* Patient Name */}
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <span className="text-white text-xs font-medium">{userName} (You)</span>
          </div>

          {/* Call Duration */}
          {isCallActive && (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-white text-sm font-medium">{formatDuration(callDuration)}</span>
            </div>
          )}

          {/* Join Call Overlay */}
          {!isCallActive && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <Video className="w-10 h-10 text-emerald-400" />
                </div>
                <h3 className="text-white text-xl font-semibold mb-2">Ready to Connect</h3>
                <p className="text-white/60 text-sm mb-6">
                  Your video consultation with Dr. {appointment.doctor.name} is ready
                </p>
                <button
                  onClick={handleJoinCall}
                  disabled={isUpdatingStatus}
                  className="px-8 py-3 rounded-xl text-white font-medium hover:scale-105 transition disabled:opacity-50 disabled:hover:scale-100"
                  style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}
                >
                  {isUpdatingStatus ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    'Join Call'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={toggleMic}
            disabled={!isCallActive}
            className={`p-3 sm:p-4 rounded-full transition-all hover:scale-110 disabled:opacity-50 disabled:hover:scale-100 ${micOn ? 'bg-gray-200 dark:bg-gray-700' : 'bg-red-500'}`}
          >
            {micOn ? (
              <Mic className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: micOn ? 'var(--text)' : 'white' }} />
            ) : (
              <MicOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            )}
          </button>
          
          <button
            onClick={toggleCamera}
            disabled={!isCallActive}
            className={`p-3 sm:p-4 rounded-full transition-all hover:scale-110 disabled:opacity-50 disabled:hover:scale-100 ${cameraOn ? 'bg-gray-200 dark:bg-gray-700' : 'bg-red-500'}`}
          >
            {cameraOn ? (
              <Camera className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: cameraOn ? 'var(--text)' : 'white' }} />
            ) : (
              <VideoOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            )}
          </button>

          <button
            onClick={() => {
              if (navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices) {
                navigator.mediaDevices.getDisplayMedia({ video: true })
                  .then((stream) => {
                    // Handle screen sharing
                    console.log("Screen sharing started");
                  })
                  .catch((err) => {
                    console.error("Screen sharing cancelled or failed:", err);
                  });
              }
            }}
            disabled={!isCallActive}
            className="p-3 sm:p-4 rounded-full bg-gray-200 dark:bg-gray-700 transition-all hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
          >
            <Share2 className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: 'var(--text)' }} />
          </button>
          
          {isCallActive && (
            <button
              onClick={handleEndCall}
              disabled={isUpdatingStatus}
              className="p-3 sm:p-4 rounded-full bg-red-500 hover:bg-red-600 transition-all hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
            >
              <PhoneOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Appointment Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl flex items-center gap-3" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(16,185,129,0.1)" }}>
            <User className="w-5 h-5" style={{ color: "rgb(16,185,129)" }} />
          </div>
          <div>
            <p className="text-xs" style={{ color: "var(--text-light)" }}>Doctor</p>
            <p className="font-medium text-sm" style={{ color: "var(--text)" }}>Dr. {appointment.doctor.name}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl flex items-center gap-3" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(16,185,129,0.1)" }}>
            <Calendar className="w-5 h-5" style={{ color: "rgb(16,185,129)" }} />
          </div>
          <div>
            <p className="text-xs" style={{ color: "var(--text-light)" }}>Date</p>
            <p className="font-medium text-sm" style={{ color: "var(--text)" }}>
              {new Date(appointment.dateTime).toLocaleDateString("en-US", { 
                weekday: "short", 
                month: "short", 
                day: "numeric" 
              })}
            </p>
          </div>
        </div>
        <div className="p-4 rounded-xl flex items-center gap-3" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(16,185,129,0.1)" }}>
            <Clock className="w-5 h-5" style={{ color: "rgb(16,185,129)" }} />
          </div>
          <div>
            <p className="text-xs" style={{ color: "var(--text-light)" }}>Time</p>
            <p className="font-medium text-sm" style={{ color: "var(--text)" }}>
              {new Date(appointment.dateTime).toLocaleTimeString("en-US", { 
                hour: "2-digit", 
                minute: "2-digit" 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* End Call Modal */}
      {showEndCallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="max-w-md w-full rounded-2xl shadow-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <PhoneOff className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--text)" }}>End Video Call?</h3>
              <p className="text-sm" style={{ color: "var(--text-light)" }}>
                Are you sure you want to end this video consultation with Dr. {appointment.doctor.name}?
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={cancelEndCall}
                  className="flex-1 px-4 py-2 rounded-xl font-medium transition hover:bg-gray-100 dark:hover:bg-gray-800"
                  style={{ backgroundColor: "var(--muted)", color: "var(--text)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmEndCall}
                  disabled={isUpdatingStatus}
                  className="flex-1 px-4 py-2 rounded-xl text-white font-medium transition hover:scale-105 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, rgb(239,68,68), rgb(220,38,38))" }}
                >
                  {isUpdatingStatus ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    'End Call'
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