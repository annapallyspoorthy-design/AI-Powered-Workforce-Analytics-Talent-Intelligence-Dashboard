import React, { useState } from 'react';
import {
  CalendarDays,
  Sparkles,
  CheckCircle2,
  X,
  Send,
  Calendar,
  Clock,
} from 'lucide-react';
import { applyLeave } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import confetti from 'canvas-confetti';

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  employeeName: string;
  department: string;
  onSuccess: (newLeave: any) => void;
}

export const ApplyLeaveModal: React.FC<ApplyLeaveModalProps> = ({
  isOpen,
  onClose,
  employeeId,
  employeeName,
  department,
  onSuccess,
}) => {
  const { addToast } = useNotification();
  const [leaveType, setLeaveType] = useState<'Casual Leave' | 'Sick Leave' | 'Earned Leave' | 'Maternity/Paternity'>('Casual Leave');
  const [startDate, setStartDate] = useState('2026-09-02');
  const [endDate, setEndDate] = useState('2026-09-04');
  const [totalDays, setTotalDays] = useState(3);
  const [reason, setReason] = useState('Personal family vacation and travel.');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      addToast('Validation Error', 'Please enter a valid reason for the leave request.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await applyLeave({
        employeeId,
        leaveType,
        startDate,
        endDate,
        totalDays,
        reason,
      });

      confetti({ particleCount: 40, spread: 60 });
      addToast(
        'Leave Application Submitted! 🌴',
        `Your request for ${totalDays} days of ${leaveType} has been dispatched to HR for review.`,
        'success'
      );

      onSuccess(res.leave);
      onClose();
    } catch (err: any) {
      addToast('Error', err?.message || 'Failed to submit leave application', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="vibe-glass border border-emerald-500/30 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-6 relative text-slate-100 backdrop-blur-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/30">
              <CalendarDays className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Apply for Leave</h3>
              <p className="text-xs text-slate-400 font-mono">{employeeName} &bull; {employeeId}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-mono font-bold text-slate-300 mb-1">Leave Category</label>
            <select
              value={leaveType}
              onChange={(e: any) => setLeaveType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:outline-hidden"
            >
              <option value="Casual Leave">Casual Leave (12 Days Available)</option>
              <option value="Sick Leave">Sick Leave (10 Days Available)</option>
              <option value="Earned Leave">Earned Leave (15 Days Available)</option>
              <option value="Maternity/Paternity">Maternity / Paternity Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono font-bold text-slate-300 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-xl px-3.5 py-2 text-white font-medium focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-mono font-bold text-slate-300 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-xl px-3.5 py-2 text-white font-medium focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono font-bold text-slate-300 mb-1">Total Days</label>
            <input
              type="number"
              min={1}
              max={30}
              value={totalDays}
              onChange={(e) => setTotalDays(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-xl px-3.5 py-2 text-white font-bold focus:outline-hidden font-mono"
            />
          </div>

          <div>
            <label className="block font-mono font-bold text-slate-300 mb-1">Reason / Project Coverage Note</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State reason for absence and peer coverage details..."
              className="w-full bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-3 text-white focus:outline-hidden"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-slate-800 font-bold text-slate-400 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-submit-leave"
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Submit to HR'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
