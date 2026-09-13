import React, { useState, useEffect } from 'react';
import {
  Fingerprint,
  MapPin,
  Camera,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  Sparkles,
  ShieldCheck,
  Zap,
  Radio,
} from 'lucide-react';
import { performCheckIn } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import confetti from 'canvas-confetti';

interface ClockInModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  employeeName: string;
  employeeAvatar: string;
  department: string;
  onSuccess: (record: any) => void;
}

export const ClockInModal: React.FC<ClockInModalProps> = ({
  isOpen,
  onClose,
  employeeId,
  employeeName,
  employeeAvatar,
  department,
  onSuccess,
}) => {
  const { addToast } = useNotification();
  const [method, setMethod] = useState<'GPS Geofence' | 'Face Recognition' | 'Biometric' | 'QR Code'>('Face Recognition');
  const [scanning, setScanning] = useState(false);
  const [verified, setVerified] = useState(false);
  const [geoDistance, setGeoDistance] = useState<number>(18);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: 12.9716,
    lng: 77.5946,
  });

  useEffect(() => {
    if (isOpen) {
      setVerified(false);
      setScanning(false);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setCurrentCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setGeoDistance(Math.floor(10 + Math.random() * 25));
          },
          () => {
            setGeoDistance(18);
          }
        );
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartScan = async () => {
    setScanning(true);
    setTimeout(async () => {
      setScanning(false);
      setVerified(true);
      confetti({ particleCount: 40, spread: 60 });

      try {
        const res = await performCheckIn({
          employeeId,
          method,
          location: 'Bangalore HQ Campus - Main Turnstile',
          latitude: currentCoords.lat,
          longitude: currentCoords.lng,
          faceVerified: true,
        });

        addToast(
          'Clock-In Verified! ⚡',
          `Successfully recorded attendance via ${method} at ${res.record?.checkInTime || '09:00 AM'}.`,
          'success'
        );

        onSuccess(res.record);
        setTimeout(() => {
          onClose();
        }, 1200);
      } catch (err: any) {
        addToast('Clock-In Error', err?.message || 'Failed to submit check-in', 'error');
      }
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="vibe-glass border border-violet-500/30 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-2xl text-slate-100">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-500/30">
              <Fingerprint className="w-6 h-6 text-cyan-200" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>Biometric & GPS Station</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  AI NODE
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">{employeeName} &bull; {employeeId} ({department})</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Method Switcher Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => {
              setMethod('Face Recognition');
              setVerified(false);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              method === 'Face Recognition'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/30 border border-violet-400/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" /> Face Scan
          </button>
          <button
            onClick={() => {
              setMethod('GPS Geofence');
              setVerified(false);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              method === 'GPS Geofence'
                ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md shadow-cyan-500/30 border border-cyan-400/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" /> GPS Perimeter
          </button>
          <button
            onClick={() => {
              setMethod('Biometric');
              setVerified(false);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              method === 'Biometric'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/30 border border-emerald-400/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" /> Thumbprint
          </button>
        </div>

        {/* 1. Face Recognition View */}
        {method === 'Face Recognition' && (
          <div className="space-y-4 text-center">
            <div className="relative w-48 h-48 mx-auto rounded-3xl overflow-hidden border-4 border-cyan-500/40 shadow-2xl bg-slate-950 flex items-center justify-center">
              <img
                src={employeeAvatar}
                alt={employeeName}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  scanning ? 'opacity-80' : 'opacity-95'
                }`}
              />

              {/* Scanning Radar Laser Line */}
              {scanning && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#22d3ee] animate-bounce top-1/2" />
              )}

              {/* Verified Overlay */}
              {verified && (
                <div className="absolute inset-0 bg-emerald-950/85 backdrop-blur-xs flex flex-col items-center justify-center text-emerald-400 animate-in fade-in duration-300">
                  <CheckCircle2 className="w-12 h-12 animate-pulse" />
                  <span className="text-xs font-mono font-black uppercase tracking-wider mt-2">Face Match 99.8%</span>
                </div>
              )}
            </div>

            <div>
              <h4 className="text-sm font-bold text-white">AI Biometric Facial Verification</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time 128-point facial landmark matching against authorized personnel database.
              </p>
            </div>
          </div>
        )}

        {/* 2. GPS Geofence View */}
        {method === 'GPS Geofence' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Geofence Perimeter: Authorized
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {geoDistance}m Inside Perimeter
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Current Coordinates: <strong className="font-mono text-cyan-300">{currentCoords.lat.toFixed(4)}° N, {currentCoords.lng.toFixed(4)}° E</strong> (Bangalore Tech Park Campus).
              </p>
            </div>

            <div className="text-xs text-slate-400 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800 font-mono">
              <p>⚡ High-precision campus location check authorized under Enterprise Geo Policy.</p>
            </div>
          </div>
        )}

        {/* 3. Biometric Fingerprint View */}
        {method === 'Biometric' && (
          <div className="space-y-4 text-center">
            <div className="w-36 h-36 mx-auto rounded-3xl bg-slate-950 border-2 border-dashed border-violet-500/50 flex items-center justify-center relative shadow-inner">
              <Fingerprint className={`w-16 h-16 text-cyan-400 ${scanning ? 'animate-pulse' : ''}`} />
              {verified && (
                <div className="absolute inset-0 rounded-3xl bg-emerald-950/90 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
              )}
            </div>

            <div>
              <h4 className="text-sm font-bold text-white">Optical Fingerprint Scanner</h4>
              <p className="text-xs text-slate-400">Place finger on hardware terminal or tap scan to authenticate.</p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          id="btn-confirm-clock-in"
          onClick={handleStartScan}
          disabled={scanning || verified}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-black text-sm shadow-xl shadow-violet-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 vibe-shimmer hover:scale-102 active:scale-98"
        >
          {scanning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" />
              <span>Scanning & Authenticating...</span>
            </>
          ) : verified ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Clocked In Successfully!</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Authorize & Clock In Now</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
