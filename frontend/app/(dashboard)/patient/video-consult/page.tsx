"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Video, Mic, MicOff, VideoOff, 
  PhoneOff, Calendar, Clock, User, CheckCircle,
  AlertCircle, Camera, Monitor, Share2,
  Maximize2, Minimize2, X
} from "lucide-react";

export default function VideoConsultPage() {
  const router = useRouter();
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const [doctorName, setDoctorName] = useState("Dr. Sarah Johnson");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showEndCallModal, setShowEndCallModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(true);

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
      
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
      });
      setAppointmentTime(timeStr);
    } catch (e) {
      router.replace("/login");
    }
  }, [router]);

  // ✅ Call duration timer - only when active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  const handleJoinCall = () => {
    setShowJoinModal(false);
    setIsCallActive(true);
  };

  const handleEndCall = () => {
    setShowEndCallModal(true);
  };

  const confirmEndCall = () => {
    setShowEndCallModal(false);
    setIsCallActive(false);
    router.push("/patient/dashboard");
  };

  const cancelEndCall = () => {
    setShowEndCallModal(false);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!isAuthenticated) {
    return null;
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
          {/* Main Video */}
          <div className="absolute inset-0 flex items-center justify-center">
            {cameraOn ? (
              <div className="text-center">
                <Video className="w-16 h-16 mx-auto text-white/30 mb-4" />
                <p className="text-white/50">Camera feed will appear here</p>
                <p className="text-white/30 text-sm mt-2">(In production, this would show your camera stream)</p>
              </div>
            ) : (
              <div className="text-center">
                <VideoOff className="w-16 h-16 mx-auto text-red-500/50 mb-4" />
                <p className="text-white/50">Camera is off</p>
              </div>
            )}
          </div>

          {/* Doctor's Video (Picture-in-Picture) */}
          <div className="absolute bottom-4 right-4 w-32 sm:w-48 h-24 sm:h-36 rounded-xl bg-gradient-to-br from-emerald-900/80 to-teal-900/80 border-2 border-white/20 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-1">
                <User className="w-5 h-5 text-white" />
              </div>
              <p className="text-white text-xs font-medium">{doctorName}</p>
              <p className="text-white/50 text-[10px]">{isCallActive ? 'Connected' : 'Waiting'}</p>
            </div>
          </div>

          {/* Status Overlay */}
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <div className={`w-2 h-2 rounded-full ${isCallActive ? 'bg-emerald-500 animate-pulse' : 'bg-yellow-500'}`}></div>
            <span className="text-white text-xs font-medium">
              {isCallActive ? 'Live' : 'Waiting to join...'}
            </span>
            <span className="text-white/50 text-xs ml-2">{appointmentTime}</span>
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
                <p className="text-white/60 text-sm mb-6">Your video consultation with {doctorName} is ready</p>
                <button
                  onClick={handleJoinCall}
                  className="px-8 py-3 rounded-xl text-white font-medium hover:scale-105 transition"
                  style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}
                >
                  Join Call
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={() => setMicOn(!micOn)}
            className={`p-3 sm:p-4 rounded-full transition-all hover:scale-110 ${micOn ? 'bg-gray-200 dark:bg-gray-700' : 'bg-red-500'}`}
          >
            {micOn ? (
              <Mic className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: micOn ? 'var(--text)' : 'white' }} />
            ) : (
              <MicOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            )}
          </button>
          
          <button
            onClick={() => setCameraOn(!cameraOn)}
            className={`p-3 sm:p-4 rounded-full transition-all hover:scale-110 ${cameraOn ? 'bg-gray-200 dark:bg-gray-700' : 'bg-red-500'}`}
          >
            {cameraOn ? (
              <Camera className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: cameraOn ? 'var(--text)' : 'white' }} />
            ) : (
              <VideoOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            )}
          </button>

          <button
            onClick={() => {/* Share screen functionality */}}
            className="p-3 sm:p-4 rounded-full bg-gray-200 dark:bg-gray-700 transition-all hover:scale-110"
          >
            <Share2 className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: 'var(--text)' }} />
          </button>
          
          {isCallActive && (
            <button
              onClick={handleEndCall}
              className="p-3 sm:p-4 rounded-full bg-red-500 hover:bg-red-600 transition-all hover:scale-110"
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
            <p className="font-medium text-sm" style={{ color: "var(--text)" }}>{doctorName}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl flex items-center gap-3" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(16,185,129,0.1)" }}>
            <Calendar className="w-5 h-5" style={{ color: "rgb(16,185,129)" }} />
          </div>
          <div>
            <p className="text-xs" style={{ color: "var(--text-light)" }}>Date</p>
            <p className="font-medium text-sm" style={{ color: "var(--text)" }}>
              {new Date().toLocaleDateString("en-US", { 
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
            <p className="font-medium text-sm" style={{ color: "var(--text)" }}>{appointmentTime}</p>
          </div>
        </div>
      </div>

      {/* ✅ CUSTOM END CALL MODAL - No browser alert */}
      {showEndCallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="max-w-md w-full rounded-2xl shadow-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <PhoneOff className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--text)" }}>End Video Call?</h3>
              <p className="text-sm" style={{ color: "var(--text-light)" }}>
                Are you sure you want to end this video consultation? The call will be disconnected.
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
                  className="flex-1 px-4 py-2 rounded-xl text-white font-medium transition hover:scale-105"
                  style={{ background: "linear-gradient(135deg, rgb(239,68,68), rgb(220,38,38))" }}
                >
                  End Call
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ CUSTOM JOIN MODAL */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="max-w-md w-full rounded-2xl shadow-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                <Video className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--text)" }}>Video Consultation</h3>
              <p className="text-sm" style={{ color: "var(--text-light)" }}>
                You are about to start a video consultation with <strong>{doctorName}</strong>.
              </p>
              <p className="text-xs mt-2" style={{ color: "var(--text-light)" }}>
                Please ensure your camera and microphone are ready.
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowJoinModal(false);
                    router.push("/patient/dashboard");
                  }}
                  className="flex-1 px-4 py-2 rounded-xl font-medium transition hover:bg-gray-100 dark:hover:bg-gray-800"
                  style={{ backgroundColor: "var(--muted)", color: "var(--text)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoinCall}
                  className="flex-1 px-4 py-2 rounded-xl text-white font-medium transition hover:scale-105"
                  style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}
                >
                  Join Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}