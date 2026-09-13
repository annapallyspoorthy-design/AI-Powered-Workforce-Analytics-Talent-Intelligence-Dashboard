import React, { useEffect, useState } from 'react';
import { fetchEmployees, fetchKPIOverview } from '../../services/api';
import { Employee, KPIOverview } from '../../types';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  DollarSign,
  Users,
  Award,
  TrendingUp,
  AlertCircle,
  Database,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [timeframe, setTimeframe] = useState('12m');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [kpis, setKpis] = useState<KPIOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [empRes, kpiRes] = await Promise.all([
          fetchEmployees({ limit: 500 }),
          fetchKPIOverview(),
        ]);
        setEmployees(empRes.employees);
        setKpis(kpiRes);
      } catch (err) {
        console.error('Error loading analytics data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <LoadingSkeleton count={3} height="h-48" />
      </div>
    );
  }

  // Calculate dynamic department salary data
  const deptMap: Record<string, { totalSalary: number; count: number; min: number; max: number }> = {};
  employees.forEach((emp) => {
    const d = emp.department || 'Unassigned';
    if (!deptMap[d]) {
      deptMap[d] = { totalSalary: 0, count: 0, min: Infinity, max: -Infinity };
    }
    deptMap[d].totalSalary += emp.salary || 0;
    deptMap[d].count += 1;
    if (emp.salary < deptMap[d].min) deptMap[d].min = emp.salary;
    if (emp.salary > deptMap[d].max) deptMap[d].max = emp.salary;
  });

  const deptSalaryData = Object.keys(deptMap).map((d) => ({
    department: d,
    avgSalary: Math.round(deptMap[d].totalSalary / deptMap[d].count),
    minSalary: deptMap[d].min === Infinity ? 0 : deptMap[d].min,
    maxSalary: deptMap[d].max === -Infinity ? 0 : deptMap[d].max,
    headcount: deptMap[d].count,
  }));

  // Calculate gender diversity data
  const genderCounts: Record<string, number> = {};
  employees.forEach((emp) => {
    const g = emp.gender || 'Other';
    genderCounts[g] = (genderCounts[g] || 0) + 1;
  });

  const totalG = employees.length || 1;
  const genderColors = ['#2563EB', '#0284C7', '#9333EA', '#10B981'];
  const genderDiversityData = Object.keys(genderCounts).map((g, i) => ({
    name: g,
    value: parseFloat(((genderCounts[g] / totalG) * 100).toFixed(1)),
    color: genderColors[i % genderColors.length],
  }));

  // Calculate tenure / experience data
  const expMap: Record<number, { totalSal: number; totalPerf: number; count: number }> = {};
  employees.forEach((emp) => {
    const exp = Math.round(emp.experience || 1);
    if (!expMap[exp]) expMap[exp] = { totalSal: 0, totalPerf: 0, count: 0 };
    expMap[exp].totalSal += emp.salary || 0;
    expMap[exp].totalPerf += emp.performanceScore || 0;
    expMap[exp].count += 1;
  });

  const experienceVsSalary = Object.keys(expMap)
    .map(Number)
    .sort((a, b) => a - b)
    .map((exp) => ({
      exp,
      salary: Math.round(expMap[exp].totalSal / expMap[exp].count),
      perf: parseFloat((expMap[exp].totalPerf / expMap[exp].count).toFixed(1)),
    }));

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 text-slate-100 font-sans">
      {/* Header Bar - Vibe Glass */}
      <div className="vibe-glass border border-violet-500/30 text-white p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-300 text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(139,92,246,0.2)]">
              <TrendingUp className="w-3 h-3 text-cyan-400 animate-pulse" /> LIVE TELEMETRY &bull; 2,000 WORKFORCE DATASET
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight vibe-gradient-text flex items-center gap-2">
            Workforce Analytics Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Real-time analytics and predictive telemetry directly synchronized with live workforce operations.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-white/10 text-xs shadow-inner">
            <button
              onClick={() => setTimeframe('6m')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                timeframe === '6m'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              6 Months
            </button>
            <button
              onClick={() => setTimeframe('12m')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                timeframe === '12m'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              12 Months
            </button>
          </div>
        </div>
      </div>

      {employees.length === 0 ? (
        <div className="p-12 text-center vibe-glass border border-white/10 rounded-3xl shadow-xl space-y-4">
          <Database className="w-12 h-12 text-cyan-400 mx-auto opacity-80" />
          <h3 className="text-lg font-bold text-white">No Backend Data Connected</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            The analytics engine is ready to generate real-time metrics, salary benchmarks, and headcount distribution as soon as you connect your AWS / MongoDB API or add employee records.
          </p>
        </div>
      ) : (
        /* Balanced 2x2 Bento Grid Charts Section */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Salary Distribution by Department */}
          <div className="vibe-glass border border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl vibe-card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-amber-400" />
                  Department Compensation Benchmarks
                </h2>
                <p className="text-xs text-slate-400">Average base salary across connected business units</p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptSalaryData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="department" stroke="#64748B" fontSize={11} angle={-20} textAnchor="end" />
                  <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip
                    formatter={(val: number) => [`$${val.toLocaleString()}`, 'Avg Base Salary']}
                    contentStyle={{
                      backgroundColor: '#090D16',
                      borderColor: 'rgba(139, 92, 246, 0.4)',
                      borderRadius: '1rem',
                      fontSize: '12px',
                      color: '#F8FAFC',
                    }}
                  />
                  <Bar dataKey="avgSalary" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. Experience vs Salary Correlation */}
          <div className="vibe-glass border border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl vibe-card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  Experience vs Compensation Curve
                </h2>
                <p className="text-xs text-slate-400">Career progression curve relative to years in industry</p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={experienceVsSalary} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="exp" stroke="#64748B" fontSize={11} unit=" Yrs" />
                  <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip
                    formatter={(val: number) => [`$${val.toLocaleString()}`, 'Compensation']}
                    contentStyle={{
                      backgroundColor: '#090D16',
                      borderColor: 'rgba(6, 182, 212, 0.4)',
                      borderRadius: '1rem',
                      fontSize: '12px',
                      color: '#F8FAFC',
                    }}
                  />
                  <Bar dataKey="salary" fill="#06B6D4" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. Gender & Diversity Representation */}
          <div className="vibe-glass border border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl vibe-card flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
                <Users className="w-5 h-5 text-violet-400" />
                Gender & Diversity Representation Ratio
              </h2>
              <p className="text-xs text-slate-400">Organization-wide representation balance</p>
            </div>

            <div className="h-56 w-full my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderDiversityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {genderDiversityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => [`${val}%`, 'Representation']}
                    contentStyle={{
                      backgroundColor: '#090D16',
                      borderColor: 'rgba(139, 92, 246, 0.4)',
                      borderRadius: '1rem',
                      fontSize: '12px',
                      color: '#F8FAFC',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              {genderDiversityData.map((d) => (
                <div key={d.name} className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <p className="text-slate-400 text-[10px] font-mono font-semibold">{d.name}</p>
                  <p className="font-mono font-black text-cyan-300 text-sm mt-0.5">{d.value}%</p>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Headcount Capacity Distribution */}
          <div className="vibe-glass border border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl vibe-card flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
                <Award className="w-5 h-5 text-emerald-400" />
                Department Headcount Capacity Allocation
              </h2>
              <p className="text-xs text-slate-400">FTE allocation density across business units</p>
            </div>

            <div className="space-y-3 my-auto pt-4">
              {deptSalaryData.slice(0, 5).map((d) => (
                <div key={d.department} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono font-bold">
                    <span className="text-white">{d.department}</span>
                    <span className="text-cyan-300">{d.headcount} FTEs ({((d.headcount / (employees.length || 1)) * 100).toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400 h-full rounded-full"
                      style={{ width: `${Math.min(100, (d.headcount / (employees.length || 1)) * 300)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">Total Verified FTEs:</span>
              <span className="font-mono font-black text-emerald-400">{employees.length.toLocaleString()} Active</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

