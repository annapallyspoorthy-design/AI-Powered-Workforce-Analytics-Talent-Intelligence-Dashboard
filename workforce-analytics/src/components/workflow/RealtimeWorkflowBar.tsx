import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  Clock,
  Fingerprint,
  Cpu,
  Calculator,
  FileCheck,
  CreditCard,
  LayoutDashboard,
  Bell,
  FileSpreadsheet,
  RefreshCw,
  Sparkles,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

export const WORKFLOW_STEPS = [
  { id: 1, name: 'Check-In', desc: 'Biometric, Face, GPS, QR verification', icon: Fingerprint },
  { id: 2, name: 'Record', desc: 'Attendance auto-logged in cloud DB', icon: Clock },
  { id: 3, name: 'AI Anomaly Check', desc: 'AI verifies geofence & face match', icon: Cpu },
  { id: 4, name: 'Shift & Overtime', desc: 'Rotational shift & OT calculation', icon: Calculator },
  { id: 5, name: 'Leave Routing', desc: 'Auto-route pending leave requests', icon: FileCheck },
  { id: 6, name: 'Timesheet Sync', desc: 'Work log billing hours generated', icon: FileCheck },
  { id: 7, name: 'Payroll Auto-Input', desc: 'Salary, OT & bonuses computed', icon: CreditCard },
  { id: 8, name: 'HR Dashboard Live', desc: 'Headcount & analytics update', icon: LayoutDashboard },
  { id: 9, name: 'Manager Alerts', desc: 'Actionable flight risk alerts sent', icon: Bell },
  { id: 10, name: 'Auto-Report Export', desc: 'Daily PDF/CSV summary generated', icon: FileSpreadsheet },
];

export const RealtimeWorkflowBar: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleStartWorkflow = () => {
    if (isRunning) return;
    setIsRunning(true);
    setCompletedSteps([]);
    setCurrentStep(1);

    let step = 1;
    const interval = setInterval(() => {
      setCompletedSteps((prev) => [...prev, step]);
      step += 1;
      if (step <= 10) {
        setCurrentStep(step);
      } else {
        clearInterval(interval);
        setCurrentStep(null);
        setIsRunning(false);
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
      }
    }, 600);
  };

  return (
    <div className="vibe-glass border border-violet-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-violet-500/20 text-violet-300 border border-violet-500/30">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            </span>
            <h3 className="text-base font-black text-white">
              Real-Time Automated Workforce Engine
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            10-Step Autonomous Loop: Check-In &rarr; AI Validation &rarr; Shift/OT Calc &rarr; Payroll &rarr; Live Dashboards
          </p>
        </div>

        <button
          id="btn-run-workflow-simulation"
          onClick={handleStartWorkflow}
          disabled={isRunning}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 disabled:opacity-50 shadow-lg shadow-violet-500/30 transition-all cursor-pointer shrink-0 vibe-shimmer hover:scale-102 active:scale-98"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
              <span>Simulating Step {currentStep}/10...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Run Live 10-Step Engine</span>
            </>
          )}
        </button>
      </div>

      {/* Grid of Steps */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {WORKFLOW_STEPS.map((s) => {
          const Icon = s.icon;
          const isDone = completedSteps.includes(s.id);
          const isCurrent = currentStep === s.id;

          return (
            <motion.div
              key={s.id}
              animate={isCurrent ? { scale: [1, 1.04, 1] } : { scale: 1 }}
              transition={{ repeat: isCurrent ? Infinity : 0, duration: 0.8 }}
              className={`p-3 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                isDone
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                  : isCurrent
                  ? 'bg-violet-950/70 border-cyan-400 text-white ring-2 ring-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                  isDone ? 'bg-emerald-500/20 text-emerald-300' : isCurrent ? 'bg-cyan-500/30 text-cyan-200' : 'bg-slate-800 text-slate-400'
                }`}>
                  0{s.id}
                </span>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isCurrent ? (
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                ) : (
                  <Icon className="w-3.5 h-3.5 text-slate-500" />
                )}
              </div>
              <div>
                <p className="font-black text-xs leading-snug text-white">{s.name}</p>
                <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-tight">
                  {s.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
