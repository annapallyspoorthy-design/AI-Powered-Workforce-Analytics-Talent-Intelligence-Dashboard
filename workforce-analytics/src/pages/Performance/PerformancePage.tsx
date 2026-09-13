import React, { useEffect, useState } from 'react';
import {
  Award,
  Target,
  TrendingUp,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  BookOpen,
  Plus,
  X,
  Send,
  User,
} from 'lucide-react';
import { fetchPerformance, fetchKPIOverview } from '../../services/api';
import { Employee, KPIOverview } from '../../types';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import confetti from 'canvas-confetti';

export const PerformancePage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useNotification();
  const [topPerformers, setTopPerformers] = useState<Employee[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [skillMatrix, setSkillMatrix] = useState<any[]>([]);
  const [kpis, setKpis] = useState<KPIOverview | null>(null);
  const [loading, setLoading] = useState(true);

  // New Goal Modal state
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalAssignee, setGoalAssignee] = useState('Employee_1');
  const [goalAssigneeId, setGoalAssigneeId] = useState('EMP00001');
  const [goalTargetDate, setGoalTargetDate] = useState('2026-11-30');
  const [goalProgress, setGoalProgress] = useState(25);

  useEffect(() => {
    const load = async () => {
      try {
        const [perfData, kpiData] = await Promise.all([
          fetchPerformance(),
          fetchKPIOverview(),
        ]);
        setTopPerformers(perfData.topPerformers);
        setGoals(perfData.goals);
        setSkillMatrix(perfData.skillMatrix);
        setKpis(kpiData);
      } catch (e) {
        console.error('Failed to load performance data:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) {
      addToast('Validation Error', 'Please enter a goal title.', 'warning');
      return;
    }

    const newGoal = {
      id: `G-${Date.now().toString().slice(-4)}`,
      title: goalTitle,
      employeeName: goalAssignee,
      employeeId: goalAssigneeId,
      targetDate: goalTargetDate,
      progressPct: goalProgress,
      status: goalProgress >= 80 ? 'On Track' : 'In Progress',
    };

    setGoals([newGoal, ...goals]);
    confetti({ particleCount: 35, spread: 50 });
    addToast('OKR Goal Created 🎯', `Assigned "${goalTitle}" to ${goalAssignee}.`, 'success');
    setIsAddGoalOpen(false);
    setGoalTitle('');
  };

  return (
    <div className="space-y-6 pb-12 text-slate-100 font-sans">
      {/* Header Banner - Vibe Glass */}
      <div className="vibe-glass border border-violet-500/30 text-white p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-300 text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(139,92,246,0.2)]">
              <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" /> MODULE 8 &bull; MERIT & OKR SCORECARDS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight vibe-gradient-text">
            Performance Scorecards & OKR Objectives
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Real-time KPI tracking, goal progress monitoring, productivity scoring, and annual review scorecards.
          </p>
        </div>

        <div className="relative z-10 bg-slate-900/80 px-5 py-3 rounded-2xl border border-violet-500/30 text-center shrink-0 shadow-lg">
          <span className="block text-2xl font-black text-emerald-400 font-mono">
            {kpis?.avgPerformance ? `${kpis.avgPerformance} / 5.0` : '4.35 / 5.0'}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Org Avg Performance</span>
        </div>
      </div>

      {/* Goal & OKR Progress List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 vibe-glass border border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" /> Key Goals & OKR Tracker
            </h2>
            <button
              id="btn-add-okr-goal"
              onClick={() => setIsAddGoalOpen(true)}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-violet-500/30 vibe-shimmer hover:scale-102 active:scale-98"
            >
              <Plus className="w-4 h-4" /> Add New OKR Goal
            </button>
          </div>

          <div className="space-y-4">
            {goals.map((g) => (
              <div
                key={g.id}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 hover:border-violet-500/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white">{g.title}</span>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">Assigned to: {g.employeeName} ({g.employeeId}) &bull; Target: {g.targetDate}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                      g.status === 'On Track'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {g.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono font-bold">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-cyan-400">{g.progressPct}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-violet-600 to-cyan-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${g.progressPct}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Skill Gap Matrix */}
          <div className="pt-4 border-t border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-violet-400" /> Department Skill Proficiency & Training Gaps
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {skillMatrix.map((sm, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs hover:border-violet-500/40 transition-colors">
                  <div className="flex justify-between font-bold text-white">
                    <span>{sm.skillName}</span>
                    <span className="text-slate-400 font-mono text-[10px]">{sm.department}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
                    <span>Current: {sm.currentProficiencyPct}%</span>
                    <span>Target: {sm.targetProficiencyPct}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full mt-1.5 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-violet-500 to-cyan-400 h-full rounded-full"
                      style={{ width: `${sm.currentProficiencyPct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Productivity Leaderboard Scorecards */}
        <div className="vibe-glass border border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" /> Top Performer Scorecards
          </h2>

          <div className="space-y-3">
            {topPerformers.slice(0, 5).map((emp) => (
              <div
                key={emp.id}
                onClick={() => navigate(`/employees/${emp.id}`)}
                className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-violet-500/60 transition-all flex items-center justify-between cursor-pointer group"
                title={`View profile of ${emp.name}`}
              >
                <div className="flex items-center gap-3">
                  <img src={emp.avatar} alt={emp.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-violet-500/30 group-hover:ring-cyan-400 transition-all" />
                  <div>
                    <h4 className="font-bold text-xs text-white group-hover:text-cyan-300 transition-colors">{emp.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">{emp.id} &bull; {emp.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-black text-sm text-cyan-300 font-mono">{emp.performanceScore} / 5.0</span>
                  <span className="block text-[9px] text-emerald-400 font-mono font-bold">
                    {emp.promotionEligibility ? '★ Promotion Ready' : 'Key Talent'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add OKR Modal */}
      {isAddGoalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="vibe-glass border border-violet-500/30 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" />
                <h3 className="font-black text-base text-white">Create New OKR Goal</h3>
              </div>
              <button
                onClick={() => setIsAddGoalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4 text-xs">
              <div>
                <label className="block font-mono font-bold text-slate-300 mb-1">Goal / Objective Title</label>
                <input
                  type="text"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="e.g. Deploy Zero-Downtime Microservices Architecture"
                  className="w-full bg-slate-950 border border-slate-800 hover:border-violet-500/50 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono font-bold text-slate-300 mb-1">Assignee</label>
                  <select
                    value={goalAssigneeId}
                    onChange={(e) => {
                      setGoalAssigneeId(e.target.value);
                      setGoalAssignee(e.target.options[e.target.selectedIndex].text.split(' (')[0]);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-violet-500/50 rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden"
                  >
                    <option value="EMP00001">Employee_1 (IT)</option>
                    <option value="EMP00002">Employee_2 (IT)</option>
                    <option value="EMP00003">Employee_3 (IT)</option>
                    <option value="EMP00004">Employee_4 (IT)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono font-bold text-slate-300 mb-1">Target Date</label>
                  <input
                    type="date"
                    value={goalTargetDate}
                    onChange={(e) => setGoalTargetDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-violet-500/50 rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-mono font-bold text-slate-300 mb-1">
                  <span>Initial Progress</span>
                  <span className="text-cyan-400">{goalProgress}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={goalProgress}
                  onChange={(e) => setGoalProgress(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddGoalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-black shadow-lg shadow-violet-500/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Assign OKR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
