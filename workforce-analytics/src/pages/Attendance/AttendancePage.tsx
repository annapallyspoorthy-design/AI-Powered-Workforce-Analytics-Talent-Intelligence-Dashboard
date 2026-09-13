import React, { useState, useEffect } from 'react';
import {
  Fingerprint,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserCheck,
  Search,
  Filter,
  Sparkles,
  Download,
  Users,
  Building2,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { fetchAttendance } from '../../services/api';
import { AttendanceRecord } from '../../types';

export const AttendancePage: React.FC = () => {
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [summary, setSummary] = useState({
    totalEmployees: 2000,
    totalPresent: 1850,
    onTimeCount: 1540,
    lateCount: 310,
    absentCount: 150,
    avgWorkingHours: '8.5',
  });
  const [loading, setLoading] = useState(true);

  const departments = ['All', 'Engineering', 'HR', 'Sales', 'Operations', 'IT', 'Finance', 'Marketing', 'Support'];

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchAttendance({
        search: searchQuery,
        status: statusFilter,
        department: departmentFilter,
        page,
        limit: 15,
      });
      setAttendanceList(res.records);
      setTotalPages(res.totalPages || 1);
      setTotalRecords(res.total || res.records.length);
      if (res.summary) {
        setSummary(res.summary);
      }
    } catch (e) {
      console.error('Failed to load attendance:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, statusFilter, departmentFilter, page]);

  const handleExportCSV = () => {
    const headers = 'Employee ID,Employee Name,Department,Date,Check-In Time,Method,Location,Status,Late Minutes\n';
    const rows = attendanceList
      .map(
        (a) =>
          `"${a.employeeId}","${a.employeeName}","${a.department}","${a.date}","${a.checkIn}","${a.method}","${a.location}","${a.status}",${a.lateMinutes || 0}`
      )
      .join('\n');

    const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${headers}${rows}`);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Employee_Attendance_Log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner - Vibe Glass */}
      <div className="vibe-glass border border-violet-500/30 text-white p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-300 text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(139,92,246,0.2)]">
              <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" /> MODULE 2 &bull; TELEMETRY STREAM
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight vibe-gradient-text">
            Employee Attendance Stream & Anomaly Radar
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Complete organization-wide employee attendance stream, biometric check-in logs, geofence verification, and AI anomaly alerts.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <button
            id="btn-export-attendance-csv"
            onClick={handleExportCSV}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-violet-500/30 hover:scale-102 active:scale-98"
          >
            <Download className="w-4 h-4 text-cyan-200" />
            <span>Export Log (CSV)</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards - Vibe Glass */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="vibe-glass border border-violet-500/20 rounded-3xl p-5 shadow-xl vibe-card">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-violet-400 uppercase">Total Checked-In</span>
            <span className="p-2 rounded-xl bg-violet-500/20 text-violet-300">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-white mt-2">{summary.totalPresent.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400 font-mono">Logged Today / Active</span>
        </div>

        <div className="vibe-glass border border-emerald-500/20 rounded-3xl p-5 shadow-xl vibe-card">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">On-Time Staff</span>
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-300 mt-2">{summary.onTimeCount.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-400 font-mono font-bold">
            {summary.totalPresent > 0 ? ((summary.onTimeCount / summary.totalPresent) * 100).toFixed(1) : '95.0'}% On-Time Rate
          </span>
        </div>

        <div className="vibe-glass border border-amber-500/20 rounded-3xl p-5 shadow-xl vibe-card">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">Late Arrivals</span>
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-amber-300 mt-2">{summary.lateCount.toLocaleString()}</p>
          <span className="text-[10px] text-amber-400 font-mono">Late Minutes Logged</span>
        </div>

        <div className="vibe-glass border border-rose-500/20 rounded-3xl p-5 shadow-xl vibe-card">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-rose-400 uppercase">Absent / Leave</span>
            <span className="p-2 rounded-xl bg-rose-500/20 text-rose-300">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-rose-300 mt-2">{summary.absentCount.toLocaleString()}</p>
          <span className="text-[10px] text-rose-400 font-mono font-bold">Avg Hours: {summary.avgWorkingHours}h/day</span>
        </div>
      </div>

      {/* Main Employee Attendance Stream Table */}
      <div className="vibe-glass border border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-cyan-400" />
              Employee Attendance Directory
            </h3>
            <p className="text-xs text-slate-400">
              Showing {attendanceList.length} of {totalRecords.toLocaleString()} verified employee records.
            </p>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search employee, ID..."
                className="pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 hover:border-violet-500/50 rounded-xl focus:outline-hidden text-white font-mono"
              />
            </div>

            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs bg-slate-950 border border-slate-800 hover:border-violet-500/50 rounded-xl font-mono font-semibold focus:outline-hidden text-slate-200"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d === 'All' ? 'All Departments' : d}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs bg-slate-950 border border-slate-800 hover:border-violet-500/50 rounded-xl font-mono font-semibold focus:outline-hidden text-slate-200"
            >
              <option value="All">All Statuses</option>
              <option value="On-Time">On-Time</option>
              <option value="Late">Late</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
        </div>

        {/* Attendance Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Employee</th>
                <th className="p-3">Department</th>
                <th className="p-3">Check-In / Out</th>
                <th className="p-3">Method</th>
                <th className="p-3">Location</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {attendanceList.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-white">{rec.employeeName}</div>
                    <div className="text-[10px] font-mono text-cyan-400">{rec.employeeId}</div>
                  </td>
                  <td className="p-3 text-slate-300 font-medium">{rec.department}</td>
                  <td className="p-3 font-mono text-slate-200">
                    <div>{rec.checkIn}</div>
                    <div className="text-[10px] text-slate-400">{rec.checkOut || '18:00'}</div>
                  </td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/40">
                      {rec.method}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">{rec.location}</td>
                  <td className="p-3">
                    {rec.status === 'On-Time' && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        On-Time
                      </span>
                    )}
                    {rec.status === 'Late' && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        Late (+{rec.lateMinutes || 15}m)
                      </span>
                    )}
                    {rec.status === 'Absent' && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        Absent
                      </span>
                    )}
                    {rec.status === 'Anomaly' && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1 w-fit">
                        <AlertTriangle className="w-3 h-3" /> Anomaly Alert
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {attendanceList.length === 0 && !loading && (
            <div className="text-center py-12 text-slate-400">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold">No attendance records found matching your filters.</p>
            </div>
          )}
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
              <ChevronLeft className="w-4 h-4" /> Previous
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
  );
};
