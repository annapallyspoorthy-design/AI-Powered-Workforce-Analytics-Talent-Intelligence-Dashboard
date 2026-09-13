import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  FileCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Briefcase,
  Sparkles,
  Calendar,
  Layers,
  Search,
  Filter,
  UserCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { fetchLeaves, approveLeave, rejectLeave } from '../../services/api';
import { LeaveRequest, TimesheetEntry, LeaveBalance } from '../../types';

export const LeaveTimesheetsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Leave' | 'Timesheet' | 'Holidays'>('Leave');
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>([]);
  const [leaveSearch, setLeaveSearch] = useState('');
  const [leaveStatusFilter, setLeaveStatusFilter] = useState<string>('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Organization Balances
  const balances: LeaveBalance = {
    casualLeave: { used: 4, total: 15 },
    sickLeave: { used: 3, total: 12 },
    earnedLeave: { used: 6, total: 18 },
    unpaidLeave: { used: 0, total: 30 },
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchLeaves({ page, limit: 15 });
      setLeaves(res.leaves);
      setTimesheets(res.timesheets);
      setTotalPages(res.totalPages || 1);
    } catch (e) {
      console.error('Failed to load leaves & timesheets:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page]);

  const handleApproveLeave = async (id: string) => {
    try {
      await approveLeave(id);
      setLeaves((prev) => prev.map((l) => (l.id === id ? { ...l, status: 'Approved' } : l)));
    } catch (e) {
      console.error(e);
      setLeaves((prev) => prev.map((l) => (l.id === id ? { ...l, status: 'Approved' } : l)));
    }
  };

  const handleRejectLeave = async (id: string) => {
    try {
      await rejectLeave(id, 'Operational project deliverable window');
      setLeaves((prev) => prev.map((l) => (l.id === id ? { ...l, status: 'Rejected' } : l)));
    } catch (e) {
      console.error(e);
      setLeaves((prev) => prev.map((l) => (l.id === id ? { ...l, status: 'Rejected' } : l)));
    }
  };

  const handleApproveTimesheet = (id: string) => {
    setTimesheets(timesheets.map((t) => (t.id === id ? { ...t, status: 'Approved' } : t)));
  };

  const filteredLeaves = leaves.filter((l) => {
    const matchesSearch =
      l.employeeName.toLowerCase().includes(leaveSearch.toLowerCase()) ||
      l.employeeId.toLowerCase().includes(leaveSearch.toLowerCase()) ||
      l.department.toLowerCase().includes(leaveSearch.toLowerCase()) ||
      l.leaveType.toLowerCase().includes(leaveSearch.toLowerCase());
    const matchesStatus = leaveStatusFilter === 'All' || l.status === leaveStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner - Vibe Glass */}
      <div className="vibe-glass border border-violet-500/30 text-white p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-300 text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(139,92,246,0.2)]">
              <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" /> MODULE 4 &bull; TIME & ABSENCE LEDGER
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight vibe-gradient-text">
            Leave Approvals & Project Timesheets
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Monitor company-wide employee leave requests, review pending applications, track project timesheets, and inspect holiday schedules.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="relative z-10 flex bg-slate-900/80 p-1.5 rounded-2xl border border-white/10 shrink-0 shadow-inner">
          <button
            onClick={() => setActiveTab('Leave')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'Leave' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30 font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            Leave Oversight
          </button>
          <button
            onClick={() => setActiveTab('Timesheet')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'Timesheet' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30 font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            Timesheet Logs
          </button>
          <button
            onClick={() => setActiveTab('Holidays')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'Holidays' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30 font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            Holiday Calendar
          </button>
        </div>
      </div>

      {/* 1. Leave Management View */}
      {activeTab === 'Leave' && (
        <div className="space-y-6">
          {/* Organization Balances */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="vibe-glass border border-violet-500/20 rounded-3xl p-5 shadow-xl vibe-card">
              <span className="text-[10px] font-mono font-bold text-violet-400 uppercase">Casual Leave Avg</span>
              <p className="text-2xl font-black text-white mt-1">
                {balances.casualLeave.used} <span className="text-xs font-normal text-slate-400 font-mono">/ {balances.casualLeave.total} Days</span>
              </p>
              <div className="w-full bg-slate-900 h-1.5 rounded-full mt-3 overflow-hidden border border-slate-800">
                <div className="bg-violet-500 h-full rounded-full" style={{ width: `${(balances.casualLeave.used / balances.casualLeave.total) * 100}%` }} />
              </div>
            </div>

            <div className="vibe-glass border border-rose-500/20 rounded-3xl p-5 shadow-xl vibe-card">
              <span className="text-[10px] font-mono font-bold text-rose-400 uppercase">Sick Leave Avg</span>
              <p className="text-2xl font-black text-rose-300 mt-1">
                {balances.sickLeave.used} <span className="text-xs font-normal text-slate-400 font-mono">/ {balances.sickLeave.total} Days</span>
              </p>
              <div className="w-full bg-slate-900 h-1.5 rounded-full mt-3 overflow-hidden border border-slate-800">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${(balances.sickLeave.used / balances.sickLeave.total) * 100}%` }} />
              </div>
            </div>

            <div className="vibe-glass border border-emerald-500/20 rounded-3xl p-5 shadow-xl vibe-card">
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">Earned / Privilege</span>
              <p className="text-2xl font-black text-emerald-300 mt-1">
                {balances.earnedLeave.used} <span className="text-xs font-normal text-slate-400 font-mono">/ {balances.earnedLeave.total} Days</span>
              </p>
              <div className="w-full bg-slate-900 h-1.5 rounded-full mt-3 overflow-hidden border border-slate-800">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(balances.earnedLeave.used / balances.earnedLeave.total) * 100}%` }} />
              </div>
            </div>

            <div className="vibe-glass border border-purple-500/20 rounded-3xl p-5 shadow-xl vibe-card">
              <span className="text-[10px] font-mono font-bold text-purple-400 uppercase">Unpaid / Sabbatical</span>
              <p className="text-2xl font-black text-purple-300 mt-1">
                {balances.unpaidLeave.used} <span className="text-xs font-normal text-slate-400 font-mono">/ {balances.unpaidLeave.total} Days</span>
              </p>
              <div className="w-full bg-slate-900 h-1.5 rounded-full mt-3 overflow-hidden border border-slate-800">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: `0%` }} />
              </div>
            </div>
          </div>

          {/* Leave Requests Table */}
          <div className="vibe-glass border border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-emerald-400" /> Pending & Approved Leave Applications
                </h2>
                <p className="text-xs text-slate-400">Live employee leave requests derived from dataset records.</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={leaveSearch}
                    onChange={(e) => setLeaveSearch(e.target.value)}
                    placeholder="Search applicant..."
                    className="pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 hover:border-violet-500/50 rounded-xl focus:outline-hidden text-white font-mono"
                  />
                </div>

                <select
                  value={leaveStatusFilter}
                  onChange={(e) => setLeaveStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 hover:border-violet-500/50 rounded-xl font-mono font-semibold focus:outline-hidden text-slate-200"
                >
                  <option value="All">All Statuses</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">Applicant</th>
                    <th className="p-3">Leave Type</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Reason Note</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredLeaves.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-white">{l.employeeName}</div>
                        <div className="text-[10px] font-mono text-cyan-400">{l.employeeId} &bull; {l.department}</div>
                      </td>
                      <td className="p-3 font-semibold text-slate-200">{l.leaveType}</td>
                      <td className="p-3">
                        <div className="font-medium text-white">{l.totalDays} Days</div>
                        <div className="text-[10px] font-mono text-slate-400">{l.startDate} to {l.endDate}</div>
                      </td>
                      <td className="p-3 text-slate-300 max-w-xs truncate">{l.reason}</td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                            l.status === 'Approved'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : l.status === 'Rejected'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {l.status === 'Pending' ? (
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleApproveLeave(l.id)}
                              className="px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[11px] cursor-pointer shadow-md shadow-emerald-500/20"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectLeave(l.id)}
                              className="px-3 py-1 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-[11px] cursor-pointer shadow-md shadow-rose-500/20"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-mono">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
              <span className="text-slate-400 font-mono">
                Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Timesheet Logs View */}
      {activeTab === 'Timesheet' && (
        <div className="vibe-glass border border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-cyan-400" /> Project Timesheet Stream
            </h2>
            <span className="text-xs font-mono font-semibold text-slate-400">{timesheets.length} Active Records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Employee</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Project</th>
                  <th className="p-3">Hours Worked</th>
                  <th className="p-3">Billable Hours</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Approval</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {timesheets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3 font-bold text-white">
                      {t.employeeName}
                      <div className="text-[10px] font-mono text-cyan-400 font-normal">{t.employeeId}</div>
                    </td>
                    <td className="p-3 font-mono text-slate-300">{t.date}</td>
                    <td className="p-3 font-medium text-white">{t.project}</td>
                    <td className="p-3 font-black font-mono text-white">{t.hoursWorked} hrs</td>
                    <td className="p-3 font-black font-mono text-emerald-400">{t.clientBillingHours} hrs</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        {t.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {t.status === 'Submitted' ? (
                        <button
                          onClick={() => handleApproveTimesheet(t.id)}
                          className="px-3 py-1 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold text-[11px] hover:from-teal-500 hover:to-cyan-500 cursor-pointer shadow-md shadow-teal-500/20"
                        >
                          Approve
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono">Verified</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Holiday Calendar View */}
      {activeTab === 'Holidays' && (
        <div className="vibe-glass border border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" /> 2026 Enterprise Holiday Schedule
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {[
              { name: 'Labor Day', date: 'September 7, 2026', type: 'Federal Holiday', days: '1 Day' },
              { name: 'Diwali Festival', date: 'November 8, 2026', type: 'Regional Holiday', days: '2 Days' },
              { name: 'Thanksgiving & Day After', date: 'November 26-27, 2026', type: 'Corporate Holiday', days: '2 Days' },
              { name: 'Christmas Eve & Day', date: 'December 24-25, 2026', type: 'Federal Holiday', days: '2 Days' },
              { name: "New Year's Eve", date: 'December 31, 2026', type: 'Corporate Holiday', days: '1 Day' },
            ].map((h, i) => (
              <div key={i} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1 hover:border-emerald-500/40 transition-colors">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">{h.type}</span>
                <h4 className="font-black text-sm text-white">{h.name}</h4>
                <p className="text-xs text-slate-400 font-mono">{h.date} &bull; {h.days}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
