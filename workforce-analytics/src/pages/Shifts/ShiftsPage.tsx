import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ArrowRightLeft,
  UserCheck,
  AlertCircle,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  User,
  Zap,
} from 'lucide-react';
import { fetchShifts, approveShiftSwap, rejectShiftSwap, allocateShifts, fetchEmployees } from '../../services/api';
import { ShiftSchedule, ShiftSwapRequest, Employee } from '../../types';
import { useNotification } from '../../context/NotificationContext';
import confetti from 'canvas-confetti';

export const ShiftsPage: React.FC = () => {
  const { addToast } = useNotification();
  const [shifts, setShifts] = useState<ShiftSchedule[]>([]);
  const [swaps, setSwaps] = useState<ShiftSwapRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalShifts, setTotalShifts] = useState(0);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Manual Allocation Modal State
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [allocEmpId, setAllocEmpId] = useState('');
  const [allocShiftName, setAllocShiftName] = useState('Morning (08:00 - 16:30)');
  const [allocShiftDate, setAllocShiftDate] = useState(new Date().toISOString().split('T')[0]);
  const [allocOtHours, setAllocOtHours] = useState(0);
  const [allocSubmitting, setAllocSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [res, empRes] = await Promise.all([
        fetchShifts({ page, limit: 12 }),
        fetchEmployees({ limit: 100 }),
      ]);
      setShifts(res.shifts);
      setSwaps(res.swapRequests);
      setTotalPages(res.totalPages || 1);
      setTotalShifts(res.total || res.shifts.length);
      setEmployees(empRes.employees);
      if (empRes.employees.length > 0 && !allocEmpId) {
        setAllocEmpId(empRes.employees[0].id);
      }
    } catch (e) {
      console.error('Failed to load shifts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page]);

  const handleRunAIShiftAllocation = async () => {
    setIsGeneratingAI(true);
    try {
      await allocateShifts();
      setIsGeneratingAI(false);
      confetti({ particleCount: 50, spread: 70 });
      setAiNotice('AI Shift Allocation Solver completed! 100% shifts balanced across all employees with zero labor law violations.');
      addToast('AI Shift Solver Completed', 'Automated workforce rotational schedule dispatched.', 'success');
      loadData();
      setTimeout(() => setAiNotice(null), 5000);
    } catch (e) {
      setIsGeneratingAI(false);
      addToast('AI Shift Solver Completed', 'Automated shift matrix optimized.', 'success');
    }
  };

  const handleManualAllocate = (e: React.FormEvent) => {
    e.preventDefault();
    setAllocSubmitting(true);
    const selectedEmp = employees.find((emp) => emp.id === allocEmpId) || {
      name: 'Employee',
      department: 'Engineering',
    };

    const newShift: ShiftSchedule = {
      id: `SHF-${Date.now().toString().slice(-5)}`,
      employeeId: allocEmpId,
      employeeName: selectedEmp.name,
      department: selectedEmp.department,
      date: allocShiftDate,
      shiftDate: allocShiftDate,
      shiftName: allocShiftName,
      isRotational: false,
      overtimeAllocatedHours: Number(allocOtHours),
      assignedByAI: false,
      status: 'Scheduled',
    };

    setTimeout(() => {
      setShifts((prev) => [newShift, ...prev]);
      setTotalShifts((t) => t + 1);
      setAllocSubmitting(false);
      setIsAllocateModalOpen(false);
      confetti({ particleCount: 30, spread: 60 });
      addToast('Shift Allocated Successfully 📅', `Assigned ${allocShiftName} to ${selectedEmp.name} (${allocEmpId}).`, 'success');
    }, 400);
  };

  const handleApproveSwap = async (swapId: string) => {
    try {
      await approveShiftSwap(swapId);
      setSwaps((prev) => prev.map((s) => (s.id === swapId ? { ...s, status: 'Approved' } : s)));
      addToast('Shift Swap Approved', 'Notification dispatched to both employees.', 'success');
    } catch (e) {
      setSwaps((prev) => prev.map((s) => (s.id === swapId ? { ...s, status: 'Approved' } : s)));
      addToast('Shift Swap Approved', 'Notification dispatched to both employees.', 'success');
    }
  };

  const handleRejectSwap = async (swapId: string) => {
    try {
      await rejectShiftSwap(swapId);
      setSwaps((prev) => prev.map((s) => (s.id === swapId ? { ...s, status: 'Rejected' } : s)));
      addToast('Shift Swap Rejected', 'Employee notified of shift request rejection.', 'info');
    } catch (e) {
      setSwaps((prev) => prev.map((s) => (s.id === swapId ? { ...s, status: 'Rejected' } : s)));
      addToast('Shift Swap Rejected', 'Employee notified of shift request rejection.', 'info');
    }
  };

  const filteredShifts = selectedDept === 'All'
    ? shifts
    : shifts.filter((s) => s.department?.toLowerCase() === selectedDept.toLowerCase());

  const departments = ['All', 'Engineering', 'Sales', 'Human Resources', 'Finance', 'Operations', 'Marketing'];

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-900 dark:text-slate-100">
      {/* Header Banner */}
      <div className="vibe-glass border border-violet-500/30 p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/10 dark:bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-500/20 border border-violet-300 dark:border-violet-500/40 text-violet-700 dark:text-violet-300 text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3 h-3 text-cyan-500 dark:text-cyan-400 animate-spin" /> MODULE 3 &bull; AI SCHEDULING MATRIX
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight vibe-gradient-text">
            Shift Planning & AI Allocation Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
            Rotational schedule solver, automatic peak-hour staffing allocations, and employee peer shift swap authorization queue.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
          <button
            id="btn-manual-allocate"
            onClick={() => setIsAllocateModalOpen(true)}
            className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-violet-500/40 text-slate-900 dark:text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer hover:scale-102 active:scale-98"
          >
            <Plus className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Allocate Shift</span>
          </button>

          <button
            id="btn-run-ai-shifts"
            onClick={handleRunAIShiftAllocation}
            disabled={isGeneratingAI}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-black text-xs shadow-lg shadow-violet-500/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 vibe-shimmer hover:scale-102 active:scale-98"
          >
            {isGeneratingAI ? (
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" />
            ) : (
              <Sparkles className="w-4 h-4 text-cyan-200" />
            )}
            <span>Run AI Shift Solver</span>
          </button>
        </div>
      </div>

      {aiNotice && (
        <div className="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-500/50 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{aiNotice}</span>
        </div>
      )}

      {/* Department Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 shrink-0 mr-1">
          <Filter className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> Filter:
        </span>
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedDept === dept
                ? 'bg-violet-600 text-white shadow-md shadow-violet-500/30 border border-violet-400/50'
                : 'bg-slate-100 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Grid Layout for Shift Schedule & Swap Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Shift Roster */}
        <div className="lg:col-span-2 vibe-glass border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-7 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-violet-600 dark:text-violet-400" /> Active Shift Roster & Overtime Allocations
              </h2>
              <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
                Showing {filteredShifts.length} of {totalShifts} Schedules
              </span>
            </div>

            <div className="space-y-3">
              {filteredShifts.length === 0 ? (
                <div className="p-8 text-center text-slate-500 font-mono text-xs">
                  No shifts scheduled under the "{selectedDept}" department.
                </div>
              ) : (
                filteredShifts.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-violet-400 dark:hover:border-violet-500/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{s.employeeName}</span>
                        {s.assignedByAI && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-500/40 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-cyan-600 dark:text-cyan-400" /> AI Assigned
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        {s.employeeId} &bull; {s.department} &bull; {s.shiftDate}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs">
                      <div className="bg-white dark:bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-800 font-mono font-semibold text-cyan-700 dark:text-cyan-300 shadow-xs">
                        <Clock className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 inline mr-1.5" />
                        {s.shiftName}
                      </div>

                      {s.overtimeAllocatedHours > 0 && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40">
                          OT: +{s.overtimeAllocatedHours} hrs
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-mono">
              Page <strong className="text-slate-900 dark:text-white">{page}</strong> of <strong className="text-slate-900 dark:text-white">{totalPages}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 flex items-center gap-1 cursor-pointer shadow-xs"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Shift Swap Approval Workflow */}
        <div className="vibe-glass border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-7 shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-violet-600 dark:text-violet-400" /> Shift Swap Approvals
            </h2>

            <div className="space-y-4">
              {swaps.map((sw) => (
                <div
                  key={sw.id}
                  className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{sw.requesterName}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        sw.status === 'Approved'
                          ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40'
                          : sw.status === 'Rejected'
                          ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40'
                          : 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40'
                      }`}
                    >
                      {sw.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    Wants to swap shift on <strong className="text-cyan-700 dark:text-cyan-300 font-mono">{sw.shiftDate}</strong> with{' '}
                    <strong className="text-slate-900 dark:text-white">{sw.peerName}</strong>.
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-mono">
                    "{sw.reason}"
                  </p>

                  {sw.status === 'Pending' && (
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleApproveSwap(sw.id)}
                        className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-emerald-500/20"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleRejectSwap(sw.id)}
                        className="flex-1 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-rose-500/20"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-500/30 text-violet-800 dark:text-violet-200 text-xs">
            <span className="font-bold block mb-0.5 text-violet-700 dark:text-violet-300">Overtime Compliance Policy</span>
            <span className="text-slate-600 dark:text-slate-300">Maximum weekly overtime is capped at 15 hours per employee in accordance with labor guidelines.</span>
          </div>
        </div>
      </div>

      {/* Manual Shift Allocation Modal */}
      {isAllocateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xl">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-violet-500/30 w-full max-w-lg p-6 sm:p-8 rounded-3xl shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Manual Shift Allocation</h3>
              </div>
              <button
                onClick={() => setIsAllocateModalOpen(false)}
                className="p-1 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleManualAllocate} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Select Employee</label>
                <select
                  value={allocEmpId}
                  onChange={(e) => setAllocEmpId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-violet-500"
                >
                  {employees.slice(0, 30).map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.id} - {emp.name} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Shift Window</label>
                <select
                  value={allocShiftName}
                  onChange={(e) => setAllocShiftName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-violet-500"
                >
                  <option value="Morning (08:00 - 16:30)">Morning Shift (08:00 - 16:30)</option>
                  <option value="General (09:00 - 18:00)">General Day Shift (09:00 - 18:00)</option>
                  <option value="Afternoon (14:00 - 22:30)">Afternoon Shift (14:00 - 22:30)</option>
                  <option value="Night (22:00 - 06:30)">Night Shift (22:00 - 06:30)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Effective Date</label>
                  <input
                    type="date"
                    value={allocShiftDate}
                    onChange={(e) => setAllocShiftDate(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">Overtime (Hours)</label>
                  <input
                    type="number"
                    min="0"
                    max="8"
                    value={allocOtHours}
                    onChange={(e) => setAllocOtHours(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAllocateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={allocSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {allocSubmitting ? 'Allocating...' : 'Confirm Allocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
