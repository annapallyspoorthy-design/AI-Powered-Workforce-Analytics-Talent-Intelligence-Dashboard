import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  CheckCircle2,
  X,
  Send,
  Users,
} from 'lucide-react';
import { requestShiftSwap } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import confetti from 'canvas-confetti';

interface RequestSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  employeeName: string;
  department: string;
  onSuccess: (newSwap: any) => void;
}

export const RequestSwapModal: React.FC<RequestSwapModalProps> = ({
  isOpen,
  onClose,
  employeeId,
  employeeName,
  department,
  onSuccess,
}) => {
  const { addToast } = useNotification();
  const [peerId, setPeerId] = useState('EMP00002');
  const [shiftDate, setShiftDate] = useState('2026-09-08');
  const [reason, setReason] = useState('Personal family event during morning shift.');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      addToast('Validation Error', 'Please enter a reason for the shift swap.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await requestShiftSwap({
        requesterId: employeeId,
        peerId,
        shiftDate,
        reason,
      });

      confetti({ particleCount: 35, spread: 50 });
      addToast(
        'Shift Swap Requested! 🔄',
        `Swap request for ${shiftDate} dispatched to peer and HR oversight queue.`,
        'success'
      );

      onSuccess(res.swap);
      onClose();
    } catch (err: any) {
      addToast('Error', err?.message || 'Failed to request shift swap', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="vibe-glass border border-violet-500/30 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-6 relative text-slate-100 backdrop-blur-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white shadow-lg shadow-violet-500/30">
              <Calendar className="w-6 h-6 text-cyan-200" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Request Shift Swap</h3>
              <p className="text-xs text-slate-400 font-mono">{employeeName} &bull; {department}</p>
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
            <label className="block font-mono font-bold text-slate-300 mb-1">Target Shift Date</label>
            <input
              type="date"
              value={shiftDate}
              onChange={(e) => setShiftDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 hover:border-violet-500/50 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-mono font-bold text-slate-300 mb-1">Swap With Colleague (Peer)</label>
            <select
              value={peerId}
              onChange={(e) => setPeerId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 hover:border-violet-500/50 rounded-xl px-3.5 py-2.5 text-white font-semibold focus:outline-hidden"
            >
              <option value="EMP00002">Employee_2 (IT &bull; Afternoon Shift)</option>
              <option value="EMP00003">Employee_3 (IT &bull; Flexible Shift)</option>
              <option value="EMP00004">Employee_4 (IT &bull; Night Shift)</option>
              <option value="EMP00005">Employee_5 (IT &bull; Morning Shift)</option>
            </select>
          </div>

          <div>
            <label className="block font-mono font-bold text-slate-300 mb-1">Swap Reason</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State reason for shift swap request..."
              className="w-full bg-slate-950 border border-slate-800 hover:border-violet-500/50 rounded-xl p-3 text-white focus:outline-hidden"
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
              id="btn-submit-swap"
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-black shadow-lg shadow-violet-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Submit Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
