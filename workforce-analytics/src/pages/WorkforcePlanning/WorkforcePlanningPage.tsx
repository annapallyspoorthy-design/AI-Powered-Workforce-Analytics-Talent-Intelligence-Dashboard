import React, { useEffect, useState } from 'react';
import {
  BrainCircuit,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Users,
  Target,
  Smile,
  ShieldAlert,
  ArrowUpRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { MOCK_FORECASTS, MOCK_SKILL_MATRIX } from '../../data/mockData';
import { fetchEmployees, fetchKPIOverview } from '../../services/api';
import { Employee, KPIOverview } from '../../types';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';

export const WorkforcePlanningPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useNotification();
  const [highRiskEmployees, setHighRiskEmployees] = useState<Employee[]>([]);
  const [kpis, setKpis] = useState<KPIOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [empRes, kpiRes] = await Promise.all([
          fetchEmployees({ risk: 'High', limit: 8 }),
          fetchKPIOverview(),
        ]);
        setHighRiskEmployees(empRes.employees);
        setKpis(kpiRes);
      } catch (e) {
        console.error('Failed to load planning data:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6 pb-12 text-slate-100 font-sans">
      {/* Header Banner - Vibe Glass */}
      <div className="vibe-glass border border-violet-500/30 text-white p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-300 text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(139,92,246,0.2)]">
              <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" /> MODULE 7 &bull; PREDICTIVE TALENT RADAR
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight vibe-gradient-text">
            Workforce Forecasting, Flight Risk & Skill Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            12-Month headcount demand forecasting, AI staffing recommendations, flight risk prediction models, and skill gap matrices.
          </p>
        </div>

        <div className="relative z-10 flex gap-3 shrink-0">
          <div className="bg-slate-900/80 px-4 py-3 rounded-2xl border border-violet-500/30 text-center shadow-lg">
            <span className="block text-2xl font-black text-cyan-300 font-mono">94.6%</span>
            <span className="text-[10px] text-slate-400 font-mono">Model Accuracy</span>
          </div>
        </div>
      </div>

      {/* Demand Forecasting Chart & AI Staffing Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Forecast Chart */}
        <div className="lg:col-span-2 vibe-glass border border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-violet-400" /> Headcount Demand Forecasting vs Capacity
              </h2>
              <p className="text-xs text-slate-400">AI predicted workforce expansion requirements for 2026-2027.</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_FORECASTS}>
                <defs>
                  <linearGradient id="colorDemandVibe" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorActualVibe" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="#334155" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} domain={[1400, 2100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090D16',
                    borderColor: 'rgba(139, 92, 246, 0.4)',
                    borderRadius: '1rem',
                    fontSize: '12px',
                    color: '#F8FAFC',
                  }}
                />
                <Area type="monotone" dataKey="predictedDemand" name="AI Required Demand" stroke="#8B5CF6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDemandVibe)" />
                <Area type="monotone" dataKey="actualHeadcount" name="Current Headcount" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#colorActualVibe)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Recommendations Panel */}
        <div className="vibe-glass border border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-cyan-400" /> AI Staffing Directives
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-violet-950/40 border border-violet-500/30 space-y-1">
              <span className="font-extrabold text-violet-300 block">Engineering Scale-Up</span>
              <p className="text-slate-300">
                Recommend hiring +24 Senior Platform & AI Engineers by Q4 to meet high-volume enterprise roadmap demand.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 space-y-1">
              <span className="font-extrabold text-cyan-300 block">Data Science Upskilling</span>
              <p className="text-slate-300">
                Bridge 12% skill gap in Cloud Security Architecture via internal AI training bootcamps.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-1">
              <span className="font-extrabold text-emerald-300 block">Sales Load Balancing</span>
              <p className="text-slate-300">
                Redistribute Fortune 500 accounts in Sales to reduce travel burnout and decrease flight risk by 40%.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Attrition Risk & Skill Gap Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attrition Risk Diagnostics */}
        <div className="vibe-glass border border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" /> High Flight-Risk Telemetry
            </h2>
            <span className="text-xs font-mono font-bold text-rose-400">
              {kpis?.highRiskCount || highRiskEmployees.length} Flagged FTEs
            </span>
          </div>

          <div className="space-y-3">
            {highRiskEmployees.map((emp) => (
              <div
                key={emp.id}
                className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-2 hover:border-rose-500/60 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={emp.avatar} alt={emp.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-rose-500/40" />
                    <div>
                      <h4 className="font-bold text-white text-xs">{emp.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">{emp.id} &bull; {emp.role} &bull; {emp.department}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono font-black text-xs">
                    {emp.attritionRiskScore}% Flight Risk
                  </span>
                </div>

                <div className="text-xs text-slate-300 pt-1">
                  <span className="font-mono font-bold block text-[10px] uppercase text-rose-400 mb-1">
                    AI Identified Drivers:
                  </span>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-300">
                    {emp.flightRiskDrivers?.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-rose-900/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => navigate(`/employees/${emp.id}`)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-400 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                  >
                    View Full Profile &rarr;
                  </button>
                  <button
                    onClick={() => {
                      addToast('Retention Action Initiated', `Dispatched priority compensation & workload review for ${emp.name}.`, 'success');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-rose-500/20"
                  >
                    Take Retention Action
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skill Matrix & Competency Gaps */}
        <div className="vibe-glass border border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" /> Competency Skill Gap Analysis
          </h2>

          <div className="space-y-3">
            {MOCK_SKILL_MATRIX.map((sk) => (
              <div key={sk.skillName} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-white">{sk.skillName}</span>
                  <span className={sk.criticalGap ? 'text-rose-400 font-mono font-bold' : 'text-slate-400 font-mono'}>
                    {sk.currentProficiencyPct}% / {sk.targetProficiencyPct}% Target {sk.criticalGap && '(Critical Gap)'}
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full ${sk.criticalGap ? 'bg-gradient-to-r from-rose-500 to-amber-500' : 'bg-gradient-to-r from-violet-600 to-cyan-400'}`}
                    style={{ width: `${sk.currentProficiencyPct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
