"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Video, Mic, MicOff, VideoOff, PhoneOff,
  Maximize2, Minimize2, Users
} from "lucide-react";

interface VideoCallProps {
  roomId: string;
  isDoctor: boolean;
  doctorName?: string;
  patientName?: string;
  onEndCall: () => void;
}

export function VideoCall({ 
  roomId, 
  isDoctor, 
  doctorName = "Doctor",
  patientName = "Patient",
  onEndCall 
}: VideoCallProps) {
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [peerConnected, setPeerConnected] = useState(false);
  const [error, setError] = useState("");
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<any>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize PeerJS
    const initPeer = async () => {
      try {
        const Peer = (await import('peerjs')).default;
        const peer = new Peer({
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' }
            ]
          }
        });
        
        peerRef.current = peer;
        
        peer.on('open', (id: string) => {
          console.log('Peer connected with ID:', id);
          setPeerConnected(true);
          
          // If doctor, they need to join the room
          if (isDoctor) {
            joinCall(roomId);
          } else {
            // Patient creates the room
            startCall();
          }
        });
        
        peer.on('error', (err: any) => {
          console.error('Peer error:', err);
          setError('Connection error. Please try again.');
        });
        
        peer.on('call', (call: any) => {
          // Answer incoming call
          if (localStreamRef.current) {
            call.answer(localStreamRef.current);
            call.on('stream', (remoteStream: MediaStream) => {
              if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream;
              }
            });
            setIsCallActive(true);
          }
        });
        
      } catch (err) {
        console.error('Error initializing PeerJS:', err);
        setError('Failed to initialize video call.');
      }
    };
    
    initPeer();
    
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, [roomId, isDoctor]);

  // Start local media
  const startLocalMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return true;
    } catch (err) {
      // Try audio only
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true
        });
        localStreamRef.current = audioStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = audioStream;
        }
        setCameraOn(false);
        return true;
      } catch (audioErr) {
        setError('Unable to access camera or microphone.');
        return false;
      }
    }
  };

  // Patient starts the call
  const startCall = async () => {
    const mediaReady = await startLocalMedia();
    if (!mediaReady) return;
    
    setIsCallActive(true);
    startTimer();
  };

  // Doctor joins the call
  const joinCall = async (roomId: string) => {
    const mediaReady = await startLocalMedia();
    if (!mediaReady) return;
    
    try {
      const call = peerRef.current.call(roomId, localStreamRef.current);
      call.on('stream', (remoteStream: MediaStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });
      setIsCallActive(true);
      startTimer();
    } catch (err) {
      console.error('Error joining call:', err);
      setError('Could not join the call. Please try again.');
    }
  };

  // Start timer
  const startTimer = () => {
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle mic
  const toggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setMicOn(!micOn);
    }
  };

  // Toggle camera
  const toggleCamera = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setCameraOn(!cameraOn);
    }
  };

  // End call
  const endCall = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerRef.current) {
      peerRef.current.destroy();
    }
    onEndCall();
  };

  return (
    <div className="relative">
      {/* Error */}
      {error && (
        <div className="p-4 mb-4 rounded-xl bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Main Video Container */}
      <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden relative">
        {/* Remote Video (Patient sees doctor, Doctor sees patient) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Remote Avatar (when no remote stream) */}
        {!remoteVideoRef.current?.srcObject && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/30">
                {isDoctor ? `Waiting for patient...` : `Waiting for doctor...`}
              </p>
              <p className="text-white/20 text-sm mt-2">
                Room: {roomId.slice(0, 8)}
              </p>
            </div>
          </div>
        )}

        {/* Local Video (Picture-in-Picture) */}
        <div className="absolute bottom-4 right-4 w-32 sm:w-48 h-24 sm:h-36 rounded-xl overflow-hidden border-2 border-white/20">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${!cameraOn ? 'hidden' : ''}`}
          />
          {!cameraOn && (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <VideoOff className="w-8 h-8 text-white/30" />
            </div>
          )}
          <div className="absolute bottom-1 left-2 bg-black/50 px-2 py-0.5 rounded text-white/80 text-xs">
            You
          </div>
        </div>

        {/* Status */}
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <div className={`w-2 h-2 rounded-full ${isCallActive ? 'bg-emerald-500 animate-pulse' : 'bg-yellow-500'}`}></div>
          <span className="text-white text-xs font-medium">
            {isCallActive ? 'Live' : 'Connecting...'}
          </span>
          {isCallActive && (
            <span className="text-white/50 text-xs ml-2">{formatDuration(callDuration)}</span>
          )}
        </div>

        {/* Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3 bg-black/50 backdrop-blur-sm px-4 py-3 rounded-full">
          <button
            onClick={toggleMic}
            className={`p-2 rounded-full transition hover:scale-110 ${micOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'}`}
          >
            {micOn ? <Mic className="w-5 h-5 text-white" /> : <MicOff className="w-5 h-5 text-white" />}
          </button>
          
          <button
            onClick={toggleCamera}
            className={`p-2 rounded-full transition hover:scale-110 ${cameraOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'}`}
          >
            {cameraOn ? <Video className="w-5 h-5 text-white" /> : <VideoOff className="w-5 h-5 text-white" />}
          </button>
          
          <button
            onClick={endCall}
            className="p-2 rounded-full bg-red-500 hover:bg-red-600 transition hover:scale-110"
          >
            <PhoneOff className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Call Info */}
      <div className="mt-4 text-center">
        <p className="text-sm" style={{ color: "var(--text-light)" }}>
          {isDoctor ? (
            <>Consulting with <strong style={{ color: "var(--text)" }}>{patientName}</strong></>
          ) : (
            <>Consulting with <strong style={{ color: "var(--text)" }}>Dr. {doctorName}</strong></>
          )}
        </p>
        <p className="text-xs" style={{ color: "var(--text-light)" }}>
          Room ID: {roomId.slice(0, 8)}...{roomId.slice(-4)}
        </p>
      </div>
    </div>
  );
}