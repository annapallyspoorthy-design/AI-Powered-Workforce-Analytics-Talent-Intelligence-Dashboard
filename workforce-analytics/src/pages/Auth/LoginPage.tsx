import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  ShieldCheck,
  User,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  Zap,
  Fingerprint,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import confetti from 'canvas-confetti';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [activeRole, setActiveRole] = useState<'HR Admin' | 'Employee'>('HR Admin');
  const [email, setEmail] = useState('alexandra.vance@workforceintel.ai');
  const [employeeId, setEmployeeId] = useState('EMP00001');
  const [password, setPassword] = useState('••••••••••••');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (activeRole === 'HR Admin') {
        await login({
          email: email || 'alexandra.vance@workforceintel.ai',
          role: 'HR Admin',
        });
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
        addToast('Welcome, Alexandra! ⚡', 'Logged in as VP of Human Resources & Org Analytics.', 'success');
        navigate('/');
      } else {
        await login({
          employeeId: employeeId || 'EMP00001',
          role: 'Employee',
        });
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
        addToast('Welcome Back! 🌴', `Authenticated Employee Self-Service Session (${employeeId}).`, 'success');
        navigate('/portal');
      }
    } catch (e: any) {
      addToast('Login Failed', e?.message || 'Unable to authenticate.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (role: 'HR Admin' | 'Employee', empId?: string) => {
    setSubmitting(true);
    try {
      if (role === 'HR Admin') {
        await login({
          email: 'alexandra.vance@workforceintel.ai',
          role: 'HR Admin',
        });
        confetti({ particleCount: 30, spread: 50 });
        addToast('HR VP Persona Activated', 'Authorized as Alexandra Vance (HR VP).', 'success');
        navigate('/');
      } else {
        const id = empId || 'EMP00001';
        await login({
          employeeId: id,
          role: 'Employee',
        });
        confetti({ particleCount: 30, spread: 50 });
        addToast('Employee Persona Activated', `Authorized as ${id} (Self-Service Portal).`, 'success');
        navigate('/portal');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans vibe-grid-bg">
      {/* Aurora Ambient Mesh Background Glows */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-violet-600/25 via-indigo-600/20 to-transparent rounded-full blur-3xl pointer-events-none vibe-aurora-orb-1" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-gradient-to-tl from-cyan-500/20 via-pink-500/15 to-transparent rounded-full blur-3xl pointer-events-none vibe-aurora-orb-2" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-950/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-6 z-10 animate-in fade-in zoom-in-95 duration-500">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-0.5 shadow-2xl shadow-violet-500/40 mx-auto flex items-center justify-center group hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
              <BrainCircuit className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-950/60 border border-violet-500/40 text-violet-300 text-xs font-mono font-bold mb-2 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              <span>NEXT-GEN TALENT INTELLIGENCE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight vibe-gradient-text">
              WORKFORCE<span className="text-violet-400">.AI</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Autonomous Workforce Analytics, Biometric Terminals & RBAC Platform
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="vibe-glass border border-violet-500/20 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-2xl">
          {/* Subtle top light bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-cyan-400 to-pink-500" />

          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-white/10 shadow-inner">
            <button
              type="button"
              id="tab-login-hr"
              onClick={() => {
                setActiveRole('HR Admin');
                setEmail('alexandra.vance@workforceintel.ai');
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeRole === 'HR Admin'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30 border border-violet-400/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> HR Administrator
            </button>
            <button
              type="button"
              id="tab-login-employee"
              onClick={() => {
                setActiveRole('Employee');
                setEmployeeId('EMP00001');
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeRole === 'Employee'
                  ? 'bg-gradient-to-r from-cyan-600 to-emerald-600 text-white shadow-lg shadow-cyan-500/30 border border-cyan-400/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" /> Employee Portal
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {activeRole === 'HR Admin' ? (
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">Executive HR Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-violet-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="alexandra.vance@workforceintel.ai"
                    className="w-full bg-slate-950/80 border border-slate-700/80 hover:border-violet-500/50 rounded-xl pl-10 pr-3.5 py-3 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400 transition-all font-mono"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">Employee ID (EMPxxxxx)</label>
                <div className="relative">
                  <Fingerprint className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    required
                    placeholder="EMP00001 (or EMP00004, EMP00005)"
                    className="w-full bg-slate-950/80 border border-slate-700/80 hover:border-cyan-500/50 rounded-xl pl-10 pr-3.5 py-3 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400 transition-all font-mono font-bold"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-300 mb-1.5">Security Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950/80 border border-slate-700/80 hover:border-slate-600 rounded-xl pl-10 pr-3.5 py-3 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400 transition-all"
                />
              </div>
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              disabled={submitting}
              className={`w-full py-3.5 rounded-2xl text-white font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-2 vibe-shimmer ${
                activeRole === 'HR Admin'
                  ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 shadow-violet-500/30'
                  : 'bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 shadow-cyan-500/30'
              }`}
            >
              <span>{submitting ? 'Authenticating Credentials...' : `Enter ${activeRole}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Personas with Vibe Badges */}
          <div className="pt-4 border-t border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" /> 1-Click Evaluation Presets
              </span>
              <span className="text-[9px] text-slate-500 font-mono">Instant Auth</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                id="btn-quick-login-hr"
                onClick={() => handleQuickDemoLogin('HR Admin')}
                className="w-full py-2.5 px-3.5 rounded-xl bg-slate-950/60 hover:bg-violet-950/40 border border-slate-800 hover:border-violet-500/50 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-violet-500/20 text-violet-300">🔑</span>
                  <span><strong>HR VP</strong> (Alexandra Vance)</span>
                </div>
                <span className="text-[10px] text-violet-400 font-mono group-hover:translate-x-0.5 transition-transform">HR Command &rarr;</span>
              </button>

              <button
                type="button"
                id="btn-quick-login-emp1"
                onClick={() => handleQuickDemoLogin('Employee', 'EMP00001')}
                className="w-full py-2.5 px-3.5 rounded-xl bg-slate-950/60 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-cyan-500/20 text-cyan-300">👤</span>
                  <span><strong>Employee_1</strong> (IT &bull; EMP00001)</span>
                </div>
                <span className="text-[10px] text-cyan-400 font-mono group-hover:translate-x-0.5 transition-transform">Portal View &rarr;</span>
              </button>

              <button
                type="button"
                id="btn-quick-login-emp4"
                onClick={() => handleQuickDemoLogin('Employee', 'EMP00004')}
                className="w-full py-2.5 px-3.5 rounded-xl bg-slate-950/60 hover:bg-pink-950/40 border border-slate-800 hover:border-pink-500/50 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-pink-500/20 text-pink-300">👤</span>
                  <span><strong>Employee_4</strong> (Sales &bull; EMP00004)</span>
                </div>
                <span className="text-[10px] text-pink-400 font-mono group-hover:translate-x-0.5 transition-transform">Portal View &rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
