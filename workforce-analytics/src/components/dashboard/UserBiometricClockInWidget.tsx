import React, { useState, useEffect } from 'react';
import {
  Fingerprint,
  Camera,
  MapPin,
  QrCode,
  CheckCircle2,
  Clock,
  LogOut,
  Sparkles,
  RefreshCw,
  Zap,
  ShieldCheck,
  UserCheck,
  Radio,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';

export const UserBiometricClockInWidget: React.FC = () => {
  const { user } = useAuth();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'Biometric' | 'Face' | 'GPS' | 'QR'>('Biometric');
  const [isScanning, setIsScanning] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Timer while checked in
  useEffect(() => {
    let interval: any = null;
    if (isCheckedIn) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isCheckedIn]);

  const formatElapsedTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClockIn = () => {
    if (isCheckedIn) return;
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setIsCheckedIn(true);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setCheckInTime(timeStr);
      setNotice(`Verified via ${selectedMethod}! Checked in at ${timeStr}. Attendance auto-logged.`);
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
      setTimeout(() => setNotice(null), 5000);
    }, 1200);
  };

  const handleClockOut = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setIsCheckedIn(false);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setNotice(`Clocked out at ${timeStr}. Total Session Duration: ${formatElapsedTime(elapsedSeconds)}.`);
      setCheckInTime(null);
      setTimeout(() => setNotice(null), 5000);
    }, 1000);
  };

  return (
    <div className="vibe-glass border border-violet-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
      {/* Background Decorative Aurora Glow */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left Side: Personal Status */}
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(139,92,246,0.2)]">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Biometric & Multi-Modal Terminal
            </span>
            {isCheckedIn ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 animate-pulse">
                <Radio className="w-3 h-3 text-emerald-400" /> Active Session
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-slate-400 text-xs font-mono font-bold">
                Standby Mode
              </span>
            )}
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Welcome, {user?.name || 'User'}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-mono font-bold">
                {user?.role || 'Session'}
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              {isCheckedIn
                ? `Active work session verified at ${checkInTime} via ${selectedMethod}. Real-time timer active.`
                : 'Select your preferred biometric verification method below to record your daily attendance.'}
            </p>
          </div>

          {/* Active Timer Display */}
          {isCheckedIn && (
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-emerald-500/30 shadow-lg">
              <Clock className="w-4 h-4 text-emerald-400 animate-spin" />
              <div>
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold block">
                  Today's Session Elapsed
                </span>
                <span className="text-lg font-mono font-black text-emerald-300">
                  {formatElapsedTime(elapsedSeconds)}
                </span>
              </div>
            </div>
          )}

          {/* Verification Method Tabs */}
          {!isCheckedIn && (
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { id: 'Biometric', label: 'Thumbprint', icon: Fingerprint },
                { id: 'Face', label: 'Face AI', icon: Camera },
                { id: 'GPS', label: 'GPS Perimeter', icon: MapPin },
                { id: 'QR', label: 'QR Scan', icon: QrCode },
              ].map((m) => {
                const Icon = m.icon;
                const active = selectedMethod === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMethod(m.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      active
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30 border border-violet-400/40'
                        : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Interactive Action Scanner & Buttons */}
        <div className="flex flex-col items-center md:items-end justify-center gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
          <AnimatePresence mode="wait">
            {notice && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-3 rounded-2xl bg-emerald-950/70 border border-emerald-400/50 text-emerald-200 text-xs font-semibold flex items-center gap-2 max-w-xs text-left shadow-lg shadow-emerald-500/15"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{notice}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {!isCheckedIn ? (
            <button
              id="btn-user-dashboard-clockin"
              onClick={handleClockIn}
              disabled={isScanning}
              className="w-full md:w-auto px-6 py-3.5 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 disabled:opacity-50 shadow-xl shadow-violet-500/30 transition-all cursor-pointer flex items-center justify-center gap-2 vibe-shimmer hover:scale-102 active:scale-98"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                  <span>Verifying {selectedMethod}...</span>
                </>
              ) : (
                <>
                  <Fingerprint className="w-5 h-5 text-cyan-300" />
                  <span>Clock In via {selectedMethod}</span>
                </>
              )}
            </button>
          ) : (
            <button
              id="btn-user-dashboard-clockout"
              onClick={handleClockOut}
              disabled={isScanning}
              className="w-full md:w-auto px-6 py-3.5 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-50 shadow-xl shadow-rose-500/30 transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-102 active:scale-98"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Clocking Out...</span>
                </>
              ) : (
                <>
                  <LogOut className="w-5 h-5 text-white" />
                  <span>Clock Out Session</span>
                </>
              )}
            </button>
          )}

          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Encrypted Biometric Node Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
