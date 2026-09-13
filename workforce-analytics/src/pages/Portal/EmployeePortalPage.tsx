import React, { useState, useEffect } from 'react';
import {
  User,
  Fingerprint,
  Calendar,
  CalendarDays,
  CreditCard,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Download,
  MapPin,
  Camera,
  ShieldCheck,
  Send,
  Plus,
  RefreshCw,
  Building,
  DollarSign,
  Award,
  Zap,
  Radio,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  fetchEmployeeById,
  fetchLeaves,
  fetchShifts,
  fetchEmployeeInbox,
  getAttendanceStatus,
} from '../../services/api';
import { Employee, LeaveRequest, ShiftSchedule, ShiftSwapRequest } from '../../types';
import { ClockInModal } from '../../components/portal/ClockInModal';
import { ApplyLeaveModal } from '../../components/portal/ApplyLeaveModal';
import { RequestSwapModal } from '../../components/portal/RequestSwapModal';
import confetti from 'canvas-confetti';

export const EmployeePortalPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [activeTab, setActiveTab] = useState<'Overview' | 'Attendance' | 'Shifts' | 'Leaves' | 'Inbox' | 'Payslips'>('Overview');
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [shifts, setShifts] = useState<ShiftSchedule[]>([]);
  const [swapRequests, setSwapRequests] = useState<ShiftSwapRequest[]>([]);
  const [inboxEmails, setInboxEmails] = useState<any[]>([]);
  const [attendanceState, setAttendanceState] = useState<{
    clockedIn: boolean;
    checkInTime: string;
    method: string;
    status: string;
    location: string;
  }>({
    clockedIn: false,
    checkInTime: '08:45 AM',
    method: 'Face Recognition',
    status: 'On-Time',
    location: 'Bangalore Campus',
  });

  // Modals
  const [isClockInOpen, setIsClockInOpen] = useState(false);
  const [isApplyLeaveOpen, setIsApplyLeaveOpen] = useState(false);
  const [isRequestSwapOpen, setIsRequestSwapOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const empId = user?.role === 'Employee' ? user.id : 'EMP00001';

  const loadData = async () => {
    setLoading(true);
    try {
      const [empData, leavesData, shiftsData, inboxData, attStatus] = await Promise.all([
        fetchEmployeeById(empId),
        fetchLeaves({ employeeId: empId }),
        fetchShifts({ employeeId: empId }),
        fetchEmployeeInbox(empId),
        getAttendanceStatus(empId),
      ]);

      if (empData) setEmployee(empData);
      setLeaves(leavesData.leaves);
      setShifts(shiftsData.shifts);
      setSwapRequests(shiftsData.swapRequests.filter((s) => s.requesterId.toLowerCase() === empId.toLowerCase() || s.peerId?.toLowerCase() === empId.toLowerCase()));
      setInboxEmails(inboxData.inbox);
      setAttendanceState(attStatus);
    } catch (e) {
      console.error('Failed to load employee portal data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [empId]);

  const handleDownloadPayslip = () => {
    if (!employee) return;
    const base = Math.round(employee.salary / 12);
    const overtime = Math.round((employee.overtimeHours || 4) * 45);
    const bonus = 850;
    const net = base + overtime + bonus - 300;

    const csvContent = `data:text/csv;charset=utf-8,Employee ID,Employee Name,Department,Base Salary,Overtime Pay,Bonus,Deductions,Net Pay\n"${employee.id}","${employee.name}","${employee.department}",${base},${overtime},${bonus},300,${net}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Payslip_${employee.id}_August2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    confetti({ particleCount: 30, spread: 50 });
    addToast('Payslip Downloaded 💳', `Downloaded August 2026 statement for ${employee.name}.`, 'success');
  };

  const currentEmp = employee || {
    id: 'EMP00001',
    name: 'Employee_1',
    role: 'Senior Platform Analyst',
    department: 'IT',
    email: 'employee_1@company.com',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    salary: 113696,
    performanceScore: 3.8,
    location: 'Bangalore Campus',
    tenure: 4,
    joiningDate: '2022-04-15',
    manager: 'MGR010 - Engineering Lead',
    skills: ['Platform Engineering', 'Data Systems', 'System Architecture'],
    attendance: 98,
    overtimeHours: 4,
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 text-slate-900 dark:text-slate-100 font-sans">
      {/* Employee Profile Hero Card */}
      <div className="vibe-glass border border-violet-500/30 p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Subtle glowing ambient back-orb */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/10 dark:bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 z-10">
          <div className="relative">
            <img
              src={currentEmp.avatar}
              alt={currentEmp.name}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-cyan-500/40 shadow-xl"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-cyan-500 border-2 border-white dark:border-slate-950 flex items-center justify-center" title="Active Session">
              <span className="w-2 h-2 rounded-full bg-white dark:bg-slate-950" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-500/20 border border-violet-300 dark:border-violet-500/40 text-violet-700 dark:text-violet-300 text-[10px] font-mono font-bold shadow-xs">
                {currentEmp.id}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-500/20 border border-cyan-300 dark:border-cyan-500/40 text-cyan-700 dark:text-cyan-300 text-[10px] font-mono font-bold">
                {currentEmp.department} Business Unit
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-500 dark:text-emerald-400" />
                VERIFIED ESS
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight vibe-gradient-text">{currentEmp.name}</h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-3">
              <span className="text-slate-900 dark:text-slate-200 font-semibold">{currentEmp.role}</span> &bull; 
              <span><MapPin className="w-3.5 h-3.5 inline mr-1 text-cyan-600 dark:text-cyan-400" /> {currentEmp.location}</span> &bull; 
              <span className="text-slate-500 dark:text-slate-400">Reporting to: {currentEmp.manager}</span>
            </p>
          </div>
        </div>

        {/* Quick Clock-In Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 z-10">
          <button
            id="btn-portal-clock-in"
            onClick={() => setIsClockInOpen(true)}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-102 active:scale-98 vibe-shimmer"
          >
            <Fingerprint className="w-4 h-4 text-slate-950" />
            <span>{attendanceState.clockedIn ? `Checked In (${attendanceState.checkInTime})` : 'Launch Biometric Clock-In'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-white/10">
        {[
          { id: 'Overview', label: '⚡ My Dashboard' },
          { id: 'Attendance', label: '📍 Attendance & Clock-In' },
          { id: 'Shifts', label: '📅 My Shifts & Swaps' },
          { id: 'Leaves', label: '🌴 Leaves & Balances' },
          { id: 'Inbox', label: `📬 HR Inbox (${inboxEmails.length})` },
          { id: 'Payslips', label: '💳 My Payslips & Equity' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 border border-violet-400/40 font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'Overview' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="vibe-glass border border-violet-500/20 p-5 rounded-2xl shadow-lg vibe-card">
              <span className="text-[10px] font-mono font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">Base Compensation</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                ${Math.round(currentEmp.salary / 12).toLocaleString()}
                <span className="text-xs text-slate-500 dark:text-slate-400 font-normal"> /mo</span>
              </p>
              <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono font-bold mt-1 inline-block">Annual: ${currentEmp.salary.toLocaleString()}</span>
            </div>

            <div className="vibe-glass border border-cyan-500/20 p-5 rounded-2xl shadow-lg vibe-card">
              <span className="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">Performance Rating</span>
              <p className="text-2xl font-black text-cyan-600 dark:text-cyan-300 mt-1">
                {currentEmp.performanceScore} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">/ 5.0</span>
              </p>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold mt-1 inline-block">★ High Performer Track</span>
            </div>

            <div className="vibe-glass border border-emerald-500/20 p-5 rounded-2xl shadow-lg vibe-card">
              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Attendance Rate</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-300 mt-1">
                {currentEmp.attendance}%
              </p>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold mt-1 inline-block">Status: Verified Present</span>
            </div>

            <div className="vibe-glass border border-pink-500/20 p-5 rounded-2xl shadow-lg vibe-card">
              <span className="text-[10px] font-mono font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider">Remaining Leaves</span>
              <p className="text-2xl font-black text-pink-600 dark:text-pink-300 mt-1">
                14 <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">Days</span>
              </p>
              <span className="text-[10px] text-pink-600 dark:text-pink-400 font-mono font-bold mt-1 inline-block">Casual, Sick & Earned</span>
            </div>
          </div>

          {/* Connected Actions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Leaves Status */}
            <div className="vibe-glass border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-emerald-400" /> Applied Leaves & Approval Status
                </h3>
                <button
                  id="btn-open-apply-leave"
                  onClick={() => setIsApplyLeaveOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" /> Apply Leave
                </button>
              </div>

              <div className="space-y-2.5">
                {leaves.slice(0, 3).map((l) => (
                  <div key={l.id} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition-colors">
                    <div>
                      <span className="font-bold text-white">{l.leaveType} ({l.totalDays} Days)</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{l.startDate} to {l.endDate} &bull; {l.reason}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-mono font-extrabold ${
                        l.status === 'Approved'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : l.status === 'Rejected'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {l.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shift Roster & Swap */}
            <div className="vibe-glass border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-violet-400" /> Shift Schedule & Peer Swaps
                </h3>
                <button
                  id="btn-open-request-swap"
                  onClick={() => setIsRequestSwapOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" /> Request Swap
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-violet-950/40 border border-violet-500/30 space-y-1 text-xs">
                <span className="font-extrabold text-violet-300 block">Current Assignment: Morning Rotational Shift</span>
                <p className="text-slate-300">08:00 AM - 04:00 PM &bull; Bangalore HQ Campus</p>
              </div>

              <div className="space-y-2">
                {swapRequests.map((s) => (
                  <div key={s.id} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition-colors">
                    <div>
                      <span className="font-bold text-white">Swap with {s.peerName}</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{s.shiftDate} &bull; {s.reason}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-mono font-extrabold ${
                        s.status === 'Approved'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : s.status === 'Rejected'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ATTENDANCE & CLOCK-IN TAB */}
      {activeTab === 'Attendance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 vibe-glass border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-cyan-400" /> Today's Live Attendance Status
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Check-In Time</span>
                  <p className="text-xl font-black text-cyan-400">{attendanceState.checkInTime}</p>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">Method: {attendanceState.method}</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Verified Location</span>
                  <p className="text-sm font-bold text-white truncate">{attendanceState.location}</p>
                  <span className="text-[10px] text-violet-400 font-mono font-bold">GPS Geofence Verified (HQ)</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Your biometric attendance session is active and registered in the enterprise ledger.</span>
              </div>
            </div>

            <div className="vibe-glass border border-white/10 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">Biometric Check-In Station</h3>
                <p className="text-xs text-slate-400 mt-1">Authenticate via GPS perimeter check or Face Recognition scan.</p>
              </div>

              <button
                onClick={() => setIsClockInOpen(true)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-extrabold text-xs shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all vibe-shimmer"
              >
                <Camera className="w-4 h-4 text-cyan-300" />
                <span>Launch Face & GPS Scanner</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. SHIFTS TAB */}
      {activeTab === 'Shifts' && (
        <div className="vibe-glass border border-white/10 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-violet-400" /> Shift Management & Peer Swapping
              </h2>
              <p className="text-xs text-slate-400">View your active schedule and submit peer swap requests for HR approval.</p>
            </div>

            <button
              onClick={() => setIsRequestSwapOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" /> Request Shift Swap
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-3">Shift Date</th>
                  <th className="p-3">Assigned Shift</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Rotational</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {shifts.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3 font-mono text-slate-300">{s.date}</td>
                    <td className="p-3 font-bold text-white">{s.shiftName}</td>
                    <td className="p-3 text-slate-400">Bangalore HQ</td>
                    <td className="p-3 text-slate-300">{s.isRotational ? 'Yes' : 'Fixed'}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. LEAVES TAB */}
      {activeTab === 'Leaves' && (
        <div className="space-y-6">
          <div className="vibe-glass border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-emerald-400" /> Leave History & Approval Status
                </h2>
                <p className="text-xs text-slate-400">Track pending and finalized leave requests reviewed by HR.</p>
              </div>

              <button
                onClick={() => setIsApplyLeaveOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" /> Apply for Leave
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Leave Type</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Reason Note</th>
                    <th className="p-3">Applied At</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {leaves.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3 font-bold text-white">{l.leaveType}</td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-200">{l.totalDays} Days</div>
                        <div className="text-[10px] text-slate-400">{l.startDate} to {l.endDate}</div>
                      </td>
                      <td className="p-3 text-slate-300 max-w-xs truncate">{l.reason}</td>
                      <td className="p-3 font-mono text-slate-400">{l.appliedAt}</td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold ${
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. INBOX TAB */}
      {activeTab === 'Inbox' && (
        <div className="vibe-glass border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-cyan-400" /> HR Communications & Company Broadcasts
            </h2>
            <span className="text-xs font-mono font-semibold text-slate-400">{inboxEmails.length} Messages</span>
          </div>

          <div className="space-y-3">
            {inboxEmails.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No HR messages in inbox.</div>
            ) : (
              inboxEmails.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => setSelectedEmail(msg)}
                  className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-violet-500/60 transition-all cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-white">{msg.subject}</span>
                    <span className="text-[10px] font-mono text-slate-400">{msg.sentAt}</span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2">{msg.body}</p>
                  <div className="text-[10px] text-cyan-400 font-mono font-semibold pt-1">
                    From: {msg.sender} &bull; Template: {msg.templateName || 'Announcement'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 6. PAYSLIPS TAB */}
      {activeTab === 'Payslips' && (
        <div className="vibe-glass border border-white/10 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-cyan-400" /> Monthly Compensation & Payslips
              </h2>
              <p className="text-xs text-slate-400">Verified monthly payroll record generated via automated payroll engine.</p>
            </div>

            <button
              id="btn-download-portal-payslip"
              onClick={handleDownloadPayslip}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-102 transition-transform"
            >
              <Download className="w-4 h-4" /> Download August 2026 Payslip (CSV)
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Base Salary</span>
              <p className="text-lg font-black text-white">${Math.round(currentEmp.salary / 12).toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Overtime Pay (1.5x)</span>
              <p className="text-lg font-black text-cyan-400">+${(currentEmp.overtimeHours * 45).toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Performance Bonus</span>
              <p className="text-lg font-black text-emerald-400">+$850</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Net Disbursed</span>
              <p className="text-lg font-black text-white">
                ${(Math.round(currentEmp.salary / 12) + (currentEmp.overtimeHours * 45) + 850 - 300).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialogs */}
      <ClockInModal
        isOpen={isClockInOpen}
        onClose={() => setIsClockInOpen(false)}
        employeeId={currentEmp.id}
        employeeName={currentEmp.name}
        employeeAvatar={currentEmp.avatar}
        department={currentEmp.department}
        onSuccess={(record) => {
          setAttendanceState({
            clockedIn: true,
            checkInTime: record.checkInTime,
            method: record.method,
            status: record.status,
            location: record.location,
          });
        }}
      />

      <ApplyLeaveModal
        isOpen={isApplyLeaveOpen}
        onClose={() => setIsApplyLeaveOpen(false)}
        employeeId={currentEmp.id}
        employeeName={currentEmp.name}
        department={currentEmp.department}
        onSuccess={(newLeave) => {
          setLeaves([newLeave, ...leaves]);
        }}
      />

      <RequestSwapModal
        isOpen={isRequestSwapOpen}
        onClose={() => setIsRequestSwapOpen(false)}
        employeeId={currentEmp.id}
        employeeName={currentEmp.name}
        department={currentEmp.department}
        onSuccess={(newSwap) => {
          setSwapRequests([newSwap, ...swapRequests]);
        }}
      />

      {/* Email Reader Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="vibe-glass border border-white/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white">{selectedEmail.subject}</h3>
                <p className="text-xs text-slate-400 font-mono">From: {selectedEmail.sender} &bull; {selectedEmail.sentAt}</p>
              </div>
              <button
                onClick={() => setSelectedEmail(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                &times;
              </button>
            </div>
            <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
              {selectedEmail.body}
            </div>
            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedEmail(null)}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
