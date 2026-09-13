import React, { useEffect, useState } from 'react';
import { fetchKPIOverview, fetchEmployees } from '../../services/api';
import { KPIOverview, Employee } from '../../types';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Users,
  TrendingDown,
  Award,
  Building2,
  DollarSign,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Briefcase,
  Layers,
  Check,
  RefreshCw,
  Activity,
  ArrowUpRight,
  Zap,
  Radio,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { RealtimeWorkflowBar } from '../../components/workflow/RealtimeWorkflowBar';
import { UserBiometricClockInWidget } from '../../components/dashboard/UserBiometricClockInWidget';

export const DashboardPage: React.FC = () => {
  const [kpis, setKpis] = useState<KPIOverview | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'Q3 2026' | 'YTD' | '12 Months'>('Q3 2026');
  const [growthViewMode, setGrowthViewMode] = useState<'flow' | 'net'>('flow');
  const [deptViewMode, setDeptViewMode] = useState<'headcount' | 'budget'>('headcount');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [isApplyingStrategy, setIsApplyingStrategy] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [kpiData, empData] = await Promise.all([
          fetchKPIOverview(),
          fetchEmployees(),
        ]);
        setKpis(kpiData);
        setEmployees(empData.employees);
      } catch (e) {
        console.error('Error loading dashboard data:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleApplyStrategy = (strategyTitle: string) => {
    setIsApplyingStrategy(strategyTitle);
    setTimeout(() => {
      setIsApplyingStrategy(null);
      setActionSuccessMessage(`Strategy "${strategyTitle}" applied successfully across relevant teams.`);
      setTimeout(() => setActionSuccessMessage(null), 5000);
    }, 1200);
  };

  if (loading || !kpis) {
    return (
      <div className="space-y-6 pb-12">
        <LoadingSkeleton count={4} height="h-32" />
      </div>
    );
  }

  const PIE_COLORS = ['#8B5CF6', '#06B6D4', '#EC4899', '#10B981', '#F59E0B', '#6366F1', '#3B82F6'];

  const deptOverview = (kpis.departmentDistribution || []).map((d) => ({
    name: d.name,
    count: d.count,
    avgSalary: kpis.avgSalary || 0,
    budget: `$${((d.count * (kpis.avgSalary || 0)) / 1000000).toFixed(1)}M`,
  }));

  const netGrowthData = (kpis.hiringTrend || []).map((item) => ({
    month: item.month,
    hired: item.hired,
    departed: item.departed,
    netGrowth: item.hired - item.departed,
  }));

  return (
    <div className="space-y-8 pb-12 text-slate-900 dark:text-slate-100 font-sans">
      {/* Action Notification Toast */}
      <AnimatePresence>
        {actionSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white dark:bg-slate-900/95 border border-emerald-500/50 text-emerald-700 dark:text-emerald-300 shadow-2xl backdrop-blur-xl max-w-md font-medium text-xs shadow-emerald-500/20"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Executive Control & Header Banner */}
      <div className="relative overflow-hidden rounded-3xl vibe-glass border border-violet-500/30 p-6 lg:p-8 shadow-xl backdrop-blur-2xl">
        {/* Glowing Aurora back-orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 dark:bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-extrabold bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-500/40 uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3 h-3 text-cyan-500 dark:text-cyan-400 animate-spin" /> AURA Intelligence Platform
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" /> Org Health: 94/100
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 text-cyan-500 dark:text-cyan-400 animate-pulse" /> LIVE STREAM
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight vibe-gradient-text">
              Workforce Intelligence Command
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
              Real-time telemetry across <strong className="text-slate-900 dark:text-white">{kpis.totalEmployees.toLocaleString()} global FTEs</strong>. Retention rate sits at <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{(100 - kpis.attritionRate).toFixed(1)}%</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-inner">
              {(['Q3 2026', 'YTD', '12 Months'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3.5 py-1.5 rounded-xl transition-all font-mono text-xs cursor-pointer ${
                    timeframe === tf
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/30 font-bold'
                      : 'hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            <button
              id="btn-dash-view-directory"
              onClick={() => navigate('/employees')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-violet-500/30 hover:scale-102 active:scale-98 transition-all cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Employee Directory</span>
            </button>
          </div>
        </div>
      </div>

      {/* Personal Biometric Clock-In Widget */}
      <UserBiometricClockInWidget />

      {/* Real-Time Automated Workforce Workflow Simulator Bar */}
      <RealtimeWorkflowBar />

      {/* 2. Structured Executive KPI Metrics Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
            Core Enterprise Metrics ({timeframe})
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" /> Live Synced
          </span>
        </div>

        {/* Primary 4-Card Executive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="vibe-glass border border-violet-500/30 p-5 rounded-3xl shadow-lg vibe-card">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-violet-600 dark:text-violet-300 uppercase tracking-wider">Active Headcount</span>
              <span className="p-2 rounded-xl bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30">
                <Users className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              </span>
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{kpis.totalEmployees.toLocaleString()}</p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 dark:border-white/10 text-[10px]">
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">+8.4% YoY</span>
              <span className="text-slate-500 dark:text-slate-400 font-mono">72% Hybrid &bull; 28% Remote</span>
            </div>
          </div>

          <div className="vibe-glass border border-emerald-500/30 p-5 rounded-3xl shadow-lg vibe-card">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-300 uppercase tracking-wider">Annual Attrition</span>
              <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </span>
            </div>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-300 mt-2">{kpis.attritionRate}%</p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 dark:border-white/10 text-[10px]">
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">-1.2% vs Industry</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono font-bold">Healthy</span>
            </div>
          </div>

          <div className="vibe-glass border border-cyan-500/30 p-5 rounded-3xl shadow-lg vibe-card">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-300 uppercase tracking-wider">Avg Performance</span>
              <span className="p-2 rounded-xl bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30">
                <Award className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              </span>
            </div>
            <p className="text-3xl font-black text-cyan-600 dark:text-cyan-300 mt-2">{kpis.avgPerformance} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">/ 5.0</span></p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 dark:border-white/10 text-[10px]">
              <span className="text-cyan-600 dark:text-cyan-400 font-mono font-bold">+0.2 pts Q/Q</span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-mono font-bold">High Band</span>
            </div>
          </div>

          <div className="vibe-glass border border-pink-500/30 p-5 rounded-3xl shadow-lg vibe-card">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-pink-600 dark:text-pink-300 uppercase tracking-wider">Avg Compensation</span>
              <span className="p-2 rounded-xl bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-500/30">
                <DollarSign className="w-4 h-4 text-pink-600 dark:text-pink-400" />
              </span>
            </div>
            <p className="text-3xl font-black text-pink-600 dark:text-pink-300 mt-2">${(kpis.avgSalary / 1000).toFixed(1)}k</p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 dark:border-white/10 text-[10px]">
              <span className="text-pink-600 dark:text-pink-400 font-mono font-bold">+4.5% Equity</span>
              <span className="text-slate-500 dark:text-slate-400 font-mono">92% Market Parity</span>
            </div>
          </div>
        </div>

        {/* Secondary Operational Metric Band */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="vibe-glass border border-slate-200 dark:border-white/10 rounded-2xl p-3.5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">Business Units</p>
              <p className="text-lg font-black text-slate-900 dark:text-white">{kpis.totalDepartments} Divisions</p>
            </div>
            <Building2 className="w-5 h-5 text-cyan-500 dark:text-cyan-400 opacity-80" />
          </div>

          <div className="vibe-glass border border-slate-200 dark:border-white/10 rounded-2xl p-3.5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">Promotion Rate</p>
              <p className="text-lg font-black text-violet-600 dark:text-violet-300">{kpis.promotionRate}% / yr</p>
            </div>
            <TrendingUp className="w-5 h-5 text-violet-500 dark:text-violet-400 opacity-80" />
          </div>

          <div className="vibe-glass border border-slate-200 dark:border-white/10 rounded-2xl p-3.5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">Satisfaction Score</p>
              <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">4.6 / 5.0</p>
            </div>
            <Award className="w-5 h-5 text-emerald-500 dark:text-emerald-400 opacity-80" />
          </div>

          <div className="vibe-glass border border-slate-200 dark:border-white/10 rounded-2xl p-3.5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">Retention Rate</p>
              <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{(100 - kpis.attritionRate).toFixed(1)}%</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 opacity-80" />
          </div>
        </div>
      </div>

      {/* 3. Primary Visual Analytics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 vibe-glass border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-lg flex flex-col justify-between h-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                Hiring vs Turnover Velocity Flow
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Monthly onboarding telemetry compared to exit velocity
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                <button
                  onClick={() => setGrowthViewMode('flow')}
                  className={`px-3 py-1.5 rounded-lg transition-all font-mono text-xs cursor-pointer ${
                    growthViewMode === 'flow'
                      ? 'bg-violet-600 text-white shadow-md font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Flow
                </button>
                <button
                  onClick={() => setGrowthViewMode('net')}
                  className={`px-3 py-1.5 rounded-lg transition-all font-mono text-xs cursor-pointer ${
                    growthViewMode === 'net'
                      ? 'bg-violet-600 text-white shadow-md font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Net Growth
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4 p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center text-xs">
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono font-bold">Total Hired (YTD)</p>
              <p className="text-sm font-black text-violet-600 dark:text-violet-400">+441 Hired</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono font-bold">Total Departed</p>
              <p className="text-sm font-black text-slate-500 dark:text-slate-400">-84 Departed</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono font-bold">Net Expansion</p>
              <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">+357 Headcount</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {growthViewMode === 'flow' ? (
                <AreaChart data={kpis.hiringTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHiredVibe" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorDepartedVibe" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" opacity={0.2} />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--vibe-glass-bg)',
                      borderColor: 'rgba(139, 92, 246, 0.4)',
                      borderRadius: '1rem',
                      fontSize: '12px',
                      color: 'inherit',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                    }}
                  />
                  <Area
                    name="Hired"
                    type="monotone"
                    dataKey="hired"
                    stroke="#8B5CF6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorHiredVibe)"
                  />
                  <Area
                    name="Departed"
                    type="monotone"
                    dataKey="departed"
                    stroke="#06B6D4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorDepartedVibe)"
                  />
                </AreaChart>
              ) : (
                <BarChart data={netGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" opacity={0.2} />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--vibe-glass-bg)',
                      borderColor: 'rgba(16, 185, 129, 0.4)',
                      borderRadius: '1rem',
                      fontSize: '12px',
                      color: 'inherit',
                    }}
                  />
                  <Bar name="Net Growth" dataKey="netGrowth" fill="#10B981" radius={[8, 8, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Business Unit Distribution */}
        <div className="vibe-glass border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-lg flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                Division Breakdown
              </h2>

              <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-mono font-semibold">
                <button
                  onClick={() => setDeptViewMode('headcount')}
                  className={`px-2 py-1 rounded transition-all ${
                    deptViewMode === 'headcount'
                      ? 'bg-cyan-600 text-white font-bold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Headcount
                </button>
                <button
                  onClick={() => setDeptViewMode('budget')}
                  className={`px-2 py-1 rounded transition-all ${
                    deptViewMode === 'budget'
                      ? 'bg-cyan-600 text-white font-bold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Payroll
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Headcount share & annual payroll allocation</p>
          </div>

          {deptViewMode === 'headcount' ? (
            <div className="h-52 w-full my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={kpis.departmentDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {kpis.departmentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--vibe-glass-bg)',
                      borderColor: 'rgba(139, 92, 246, 0.4)',
                      borderRadius: '1rem',
                      fontSize: '12px',
                      color: 'inherit',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-52 w-full my-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptOverview.slice(0, 5)} layout="vertical" margin={{ top: 5, right: 10, left: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94A3B8" opacity={0.2} />
                  <XAxis type="number" stroke="#64748B" fontSize={10} />
                  <YAxis type="category" dataKey="name" stroke="#64748B" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--vibe-glass-bg)',
                      borderColor: 'rgba(6, 182, 212, 0.4)',
                      borderRadius: '1rem',
                      fontSize: '12px',
                      color: 'inherit',
                    }}
                  />
                  <Bar dataKey="avgSalary" fill="#06B6D4" radius={[0, 6, 6, 0]} name="Avg Salary ($)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="space-y-1.5 text-xs max-h-36 overflow-y-auto pr-1">
            {kpis.departmentDistribution.map((dept, idx) => {
              const pct = Math.round((dept.count / (kpis.totalEmployees || 1)) * 100);
              return (
                <div key={dept.name} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-all">
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                    />
                    <span className="truncate text-slate-700 dark:text-slate-300 font-medium">{dept.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-slate-900 dark:text-white">{dept.count}</span>
                    <span className="text-[10px]">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Department Overview & Compensation Matrix */}
      <div className="vibe-glass border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              Department Compensation & Headcount Matrix
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Cross-departmental headcount and payroll allocation</p>
          </div>
          <button
            onClick={() => navigate('/analytics')}
            className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-mono font-bold flex items-center gap-1 cursor-pointer"
          >
            Explore Analytics <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono font-bold uppercase text-[10px] tracking-wider bg-slate-100/80 dark:bg-slate-900/80">
                <th className="py-3 px-3">Business Unit</th>
                <th className="py-3 px-3">Headcount</th>
                <th className="py-3 px-3">Avg Salary</th>
                <th className="py-3 px-3">Est Payroll</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {deptOverview.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500 dark:text-slate-400">
                    No department data available. Connect your backend API or add employee profiles.
                  </td>
                </tr>
              ) : (
                deptOverview.map((dept) => (
                  <tr key={dept.name} className="hover:bg-slate-100/60 dark:hover:bg-slate-900/40 transition-all">
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                      {dept.name}
                    </td>
                    <td className="py-3 px-3 font-mono">{dept.count} FTEs</td>
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">${dept.avgSalary.toLocaleString()}</td>
                    <td className="py-3 px-3 font-mono text-cyan-600 dark:text-cyan-400 font-bold">{dept.budget}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => navigate(`/employees?department=${dept.name}`)}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-semibold transition-all border border-slate-300 dark:border-slate-700 cursor-pointer"
                      >
                        Filter Team
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Strategic Recommendations */}
      <div className="vibe-glass border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-lg flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-2xl bg-violet-100 dark:bg-violet-500/20 border border-violet-300 dark:border-violet-500/40 text-violet-700 dark:text-violet-300">
                <Sparkles className="w-5 h-5 text-cyan-600 dark:text-cyan-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  AURA Executive Strategy Recommendations
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Data-driven workforce optimizations generated via Gemini AI</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-500/40">
              2 Initiatives Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-500/40">
                    COMPENSATION REALIGNMENT
                  </span>
                  <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono font-bold">High ROI</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Senior Staff Compensation Review</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Engineering and Data Science teams display market alignment opportunities.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-mono">Est Budget: +$42k/yr</span>
                <button
                  onClick={() => handleApplyStrategy('Senior Staff Compensation Review')}
                  disabled={isApplyingStrategy === 'Senior Staff Compensation Review'}
                  className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {isApplyingStrategy === 'Senior Staff Compensation Review' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Apply Strategy</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40">
                    LEADERSHIP DEVELOPMENT
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">High Potential</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Executive Leadership Cohort</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Identify top-performing team managers for the annual Leadership Mentorship Cohort.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-mono">2 Key Leaders</span>
                <button
                  onClick={() => handleApplyStrategy('Executive Leadership Cohort')}
                  disabled={isApplyingStrategy === 'Executive Leadership Cohort'}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {isApplyingStrategy === 'Executive Leadership Cohort' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Enroll Leaders</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <span>
              Need custom workforce reports? Ask <strong className="text-slate-900 dark:text-white">AURA Chatbot</strong> or check out the <strong className="text-slate-900 dark:text-white">Reports</strong> section.
            </span>
          </div>
          <button
            onClick={() => navigate('/reports')}
            className="px-3 py-1 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 font-semibold hover:bg-violet-200 dark:hover:bg-violet-900/60 transition-all text-xs shrink-0 border border-violet-300 dark:border-violet-500/30 cursor-pointer"
          >
            View Reports
          </button>
        </div>
      </div>
    </div>
  );
};
