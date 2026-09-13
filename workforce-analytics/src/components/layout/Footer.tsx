import React from 'react';
import { ShieldCheck, Cpu, Database, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 py-6 px-6 vibe-glass border border-white/10 rounded-3xl text-slate-400 text-xs flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
      <div className="flex items-center gap-2">
        <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
        <span className="text-slate-300 font-semibold">WORKFORCE.AI &bull; Autonomous Enterprise Intelligence Platform &copy; {new Date().getFullYear()}</span>
      </div>

      <div className="flex items-center gap-6">
        <span className="flex items-center gap-1.5 text-slate-400">
          <Database className="w-3.5 h-3.5 text-violet-400" />
          <span>Express REST Engine (2k FTEs)</span>
        </span>
        <span className="flex items-center gap-1.5 text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Zero-Trust Encryption</span>
        </span>
      </div>
    </footer>
  );
};
