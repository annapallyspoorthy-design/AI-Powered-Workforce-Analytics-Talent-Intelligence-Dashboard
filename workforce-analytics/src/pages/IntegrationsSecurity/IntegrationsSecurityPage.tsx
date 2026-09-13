import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  FileText,
  Sparkles,
  RefreshCw,
  Activity,
  AlertCircle,
  Key,
  Database,
  Radio,
  Server,
  UserCheck,
  Zap,
} from 'lucide-react';
import { MOCK_AUDIT_LOGS } from '../../data/mockData';
import { SecurityAuditLog } from '../../types';
import { useNotification } from '../../context/NotificationContext';
import confetti from 'canvas-confetti';

export const IntegrationsSecurityPage: React.FC = () => {
  const { addToast } = useNotification();
  const [logs, setLogs] = useState<SecurityAuditLog[]>(MOCK_AUDIT_LOGS);
  const [isVerifying, setIsVerifying] = useState(false);
  const [mfaStatus, setMfaStatus] = useState<'Enforced' | 'Active'>('Enforced');
  const [encryptionStatus, setEncryptionStatus] = useState<'AES-256-GCM Active' | 'Verified'>('AES-256-GCM Active');

  const handleRunSecurityAudit = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      confetti({ particleCount: 40, spread: 60 });
      addToast('Zero-Trust Audit Verified 🛡️', 'All RBAC policy enforcement engines passed 100% compliance checks.', 'success');
      const newLog: SecurityAuditLog = {
        id: `LOG-${Date.now().toString().slice(-4)}`,
        action: 'Manual Zero-Trust Security Audit',
        user: 'Alexandra Vance (VP HR)',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Success',
        ipAddress: '192.168.1.104',
      };
      setLogs((prev) => [newLog, ...prev]);
    }, 900);
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-900 dark:text-slate-100">
      {/* Header Banner */}
      <div className="vibe-glass border border-violet-500/30 p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/10 dark:bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-500/20 border border-violet-300 dark:border-violet-500/40 text-violet-700 dark:text-violet-300 text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3 h-3 text-cyan-500 dark:text-cyan-400 animate-spin" /> MODULE 11 &bull; ZERO-TRUST & RBAC SECURITY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight vibe-gradient-text">
            Enterprise RBAC Security & Zero-Trust Governance
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
            Granular Role-Based Access Control, MFA enforcement, AES-256 data encryption in transit and at rest, immutable audit telemetry, and GDPR compliance.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
          <button
            id="btn-run-security-audit"
            onClick={handleRunSecurityAudit}
            disabled={isVerifying}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-black text-xs shadow-lg shadow-violet-500/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 vibe-shimmer hover:scale-102 active:scale-98"
          >
            {isVerifying ? (
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-cyan-200" />
            )}
            <span>Run Security Audit</span>
          </button>

          <div className="bg-slate-100 dark:bg-slate-900/80 px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-violet-500/30 text-center shadow-sm">
            <span className="block text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">100% Compliant</span>
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono">SOC2 &bull; GDPR &bull; ISO</span>
          </div>
        </div>
      </div>

      {/* Security & Audit Logs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Checklist */}
        <div className="vibe-glass border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-7 shadow-lg space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Zero-Trust Security Policies
          </h2>

          <div className="space-y-3 text-xs">
            {[
              { title: 'Role-Based Access Control (RBAC)', desc: 'Strict granular permissions for Admin, Manager & ESS views', ok: true },
              { title: 'Multi-Factor Authentication (MFA)', desc: 'Enforced for all HR & Admin user sessions', ok: true },
              { title: 'AES-256 Data Encryption', desc: 'Encrypted in transit (TLS 1.3) and at rest', ok: true },
              { title: 'GDPR Right to Forget & Audit Trails', desc: 'Automated data retention and removal workflows', ok: true },
              { title: 'Biometric Hash Anonymization', desc: 'Face & fingerprint vector embeddings stored as SHA-256 nonces', ok: true },
            ].map((c, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{c.title}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Audit Logs */}
        <div className="lg:col-span-2 vibe-glass border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-7 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-violet-600 dark:text-violet-400" /> Immutable Security Telemetry & Audit Stream
            </h2>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
              <Radio className="w-3 h-3 animate-pulse" /> Live Telemetry
            </span>
          </div>

          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 text-xs hover:border-violet-400 dark:hover:border-violet-500/40 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{log.action}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                      log.status === 'Success'
                        ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                        : 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    Triggered by <strong className="text-cyan-700 dark:text-cyan-300">{log.user}</strong> &bull; IP: {log.ipAddress}
                  </p>
                </div>

                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono shrink-0">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
