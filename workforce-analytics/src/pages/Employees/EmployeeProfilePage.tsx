import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchEmployeeById } from '../../services/api';
import { Employee } from '../../types';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmailComposerModal } from '../../components/email/EmailComposerModal';
import {
  ArrowLeft,
  Mail,
  MapPin,
  Briefcase,
  Award,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Send,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export const EmployeeProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEmailComposerOpen, setIsEmailComposerOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const data = await fetchEmployeeById(id);
        setEmployee(data);
      } catch (e) {
        console.error('Error loading employee:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <LoadingSkeleton count={3} height="h-40" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <AlertTriangle className="w-12 h-12 text-rose-600 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Employee Profile Not Found</h2>
        <button
          onClick={() => navigate('/employees')}
          className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-xs hover:bg-blue-700"
        >
          Return to Employee Directory
        </button>
      </div>
    );
  }

  const performanceHistoryData = [
    { year: '2023', score: 4.1 },
    { year: '2024', score: 4.4 },
    { year: '2025', score: 4.6 },
    { year: '2026', score: employee.performanceScore },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 text-slate-100 font-sans">
      {/* Top Back Navigation - Vibe Glass Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/employees')}
          className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>&larr; Back to Employee Directory</span>
        </button>

        <button
          onClick={() => setIsEmailComposerOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-black text-xs shadow-xl shadow-violet-500/30 transition-all cursor-pointer vibe-shimmer hover:scale-102 active:scale-98"
        >
          <Send className="w-4 h-4" />
          <span>Send Direct HR Email</span>
        </button>
      </div>

      {/* Main Profile Header Card - Vibe Glass */}
      <div className="relative overflow-hidden rounded-3xl vibe-glass border border-violet-500/30 p-6 lg:p-8 shadow-2xl backdrop-blur-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={employee.avatar}
              alt={employee.name}
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-violet-500/50 shadow-xl shadow-violet-500/20"
            />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight vibe-gradient-text">{employee.name}</h1>
                {employee.promotionEligibility && (
                  <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/40">
                    ★ Promotion Ready
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-cyan-300 mt-1 font-mono">{employee.role}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-2 font-mono">
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-violet-400" /> {employee.department}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" /> {employee.email}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {employee.location}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Metrics & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Metrics */}
        <div className="space-y-6">
          {/* Key Metrics Box */}
          <div className="vibe-glass border border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4 vibe-card">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Award className="w-4 h-4 text-cyan-400" /> Compensation & Rating Summary
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
                <p className="text-slate-400 text-[10px] uppercase font-mono font-bold">Base Salary</p>
                <p className="text-lg font-black text-white font-mono mt-0.5">
                  ${employee.salary.toLocaleString()}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
                <p className="text-slate-400 text-[10px] uppercase font-mono font-bold">Performance</p>
                <p className="text-lg font-black text-emerald-400 font-mono mt-0.5">
                  {employee.performanceScore} / 5.0
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
                <p className="text-slate-400 text-[10px] uppercase font-mono font-bold">Tenure</p>
                <p className="text-base font-black text-white font-mono mt-0.5">{employee.tenure} Years</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
                <p className="text-slate-400 text-[10px] uppercase font-mono font-bold">Attendance Rate</p>
                <p className="text-base font-black text-cyan-300 font-mono mt-0.5">{employee.attendance}%</p>
              </div>
            </div>

            <div className="pt-2 text-xs text-slate-300 space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Reporting Manager:</span>
                <span className="font-semibold text-white">{employee.manager}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Last Review Date:</span>
                <span className="font-semibold text-white">{employee.lastReviewDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Performance Timeline & Skills (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Timeline Chart */}
          <div className="vibe-glass border border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl vibe-card">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-cyan-400" /> Performance Score Trajectory
            </h3>
            <p className="text-xs text-slate-400 mb-6">Annual performance rating progression</p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceHistoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="year" stroke="#64748B" fontSize={11} />
                  <YAxis domain={[0, 5]} stroke="#64748B" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090D16',
                      borderColor: 'rgba(139, 92, 246, 0.4)',
                      borderRadius: '1rem',
                      fontSize: '12px',
                      color: '#F8FAFC',
                    }}
                  />
                  <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                    {performanceHistoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === performanceHistoryData.length - 1 ? '#06B6D4' : '#8B5CF6'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Skills & Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="vibe-glass border border-white/10 rounded-3xl p-6 shadow-xl space-y-3 vibe-card">
              <h4 className="text-sm font-bold text-white font-mono">Technical Competencies</h4>
              <div className="flex flex-wrap gap-2">
                {employee.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-xl bg-violet-500/20 border border-violet-500/30 text-xs text-violet-300 font-mono font-bold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="vibe-glass border border-white/10 rounded-3xl p-6 shadow-xl space-y-3 vibe-card">
              <h4 className="text-sm font-bold text-white font-mono">Assigned Strategic Initiatives</h4>
              <div className="space-y-2 text-xs font-mono">
                {employee.projects.map((proj, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-200 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="font-semibold">{proj}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      <EmailComposerModal
        isOpen={isEmailComposerOpen}
        onClose={() => setIsEmailComposerOpen(false)}
        allEmployees={[employee]}
        preSelectedEmployeeIds={[employee.id]}
      />
    </div>
  );
};
