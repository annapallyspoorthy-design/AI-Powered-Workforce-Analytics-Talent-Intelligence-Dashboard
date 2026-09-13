import React, { useState, useEffect } from 'react';
import { fetchEmployees } from '../../services/api';
import { Employee, EmailCampaign } from '../../types';
import { EmailComposerModal } from '../../components/email/EmailComposerModal';
import { useNotification } from '../../context/NotificationContext';
import {
  Mail,
  Send,
  Users,
  Copy,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  FileSpreadsheet,
  Download,
  Filter,
  Search,
} from 'lucide-react';

export const EmailBroadcastPage: React.FC = () => {
  const { addToast } = useNotification();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [preSelectedIds, setPreSelectedIds] = useState<string[]>([]);

  // Dispatched Email Log History
  const [sentCampaigns, setSentCampaigns] = useState<EmailCampaign[]>([
    {
      id: 'EML-1092',
      subject: 'Schedule Request: Q3 Executive Performance Review',
      body: 'Performance review details dispatched to selective department heads...',
      recipientsCount: 14,
      recipientNames: ['Dr. Alex Morgan', 'Marcus Vance', 'Sarah Jenkins'],
      sentAt: 'Today, 09:30 AM',
      sender: 'hr-admin@workforce.ai',
      status: 'Delivered',
      templateName: 'Performance Review Notice',
    },
    {
      id: 'EML-1088',
      subject: 'Urgent: Upcoming Engineering Department All-Hands',
      body: 'Engineering roadmap review and town hall agenda dispatched.',
      recipientsCount: 480,
      recipientNames: ['Engineering Team'],
      sentAt: 'Yesterday, 02:15 PM',
      sender: 'hr-admin@workforce.ai',
      status: 'Delivered',
      templateName: 'Department All-Hands Sync',
    },
    {
      id: 'EML-1075',
      subject: 'Congratulations on Your Career Advancement',
      body: 'Promotion readiness letters sent to high performing staff engineers.',
      recipientsCount: 6,
      recipientNames: ['Elena Rostova', 'David Chen'],
      sentAt: 'Aug 1, 2026',
      sender: 'hr-admin@workforce.ai',
      status: 'Delivered',
      templateName: 'Promotion Recognition',
    },
  ]);

  useEffect(() => {
    fetchEmployees({ limit: 2000 }).then((res) => setEmployees(res.employees));
  }, []);

  const handleOpenComposerForDept = (dept: string) => {
    const ids = employees
      .filter((e) => dept === 'All' || e.department === dept)
      .map((e) => e.id);
    setPreSelectedIds(ids);
    setIsComposerOpen(true);
  };

  const handleCampaignCreated = (campaign: EmailCampaign) => {
    setSentCampaigns((prev) => [campaign, ...prev]);
  };

  const handleCopyDeptEmails = (deptName: string) => {
    const list = employees
      .filter((e) => deptName === 'All' || e.department === deptName)
      .map((e) => e.email)
      .join(', ');

    if (!list) {
      addToast('No Emails Found', `No email addresses found for ${deptName}.`, 'info');
      return;
    }

    navigator.clipboard.writeText(list);
    addToast('Emails Copied', `Copied ${deptName} team emails to clipboard.`, 'success');
  };

  const departmentList = ['All', 'Engineering', 'HR', 'Sales', 'Operations', 'IT', 'Finance', 'Marketing', 'Support'];

  return (
    <div className="space-y-8 pb-12 text-slate-100 font-sans">
      {/* Header Bar - Vibe Glass */}
      <div className="vibe-glass border border-violet-500/30 text-white p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-300 text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(139,92,246,0.2)]">
              <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" /> MODULE 5 &bull; COMMUNICATIONS MATRIX
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight vibe-gradient-text flex items-center gap-2">
            <Mail className="w-7 h-7 text-cyan-400" />
            Executive Broadcast & Communications Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Dispatch announcements, stay interviews, retention offers, and department all-hands communications.
          </p>
        </div>

        <button
          id="btn-new-broadcast"
          onClick={() => {
            setPreSelectedIds([]);
            setIsComposerOpen(true);
          }}
          className="relative z-10 flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-black text-xs shadow-xl shadow-violet-500/30 transition-all cursor-pointer shrink-0 vibe-shimmer hover:scale-102 active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>New Targeted Broadcast</span>
        </button>
      </div>

      {/* Quick Department Distribution Broadcast Cards */}
      <div className="space-y-4">
        <h2 className="text-sm font-mono font-bold text-violet-400 uppercase tracking-wider flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" />
          Quick Department Broadcast Groups ({employees.length.toLocaleString()} FTEs)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {departmentList.map((dept) => {
            const count = dept === 'All' ? employees.length : employees.filter((e) => e.department === dept).length;
            return (
              <div
                key={dept}
                className="vibe-glass border border-white/10 rounded-3xl p-5 shadow-xl space-y-3 flex flex-col justify-between vibe-card hover:border-violet-500/50 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-white">{dept === 'All' ? 'All Company Staff' : `${dept} Division`}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      {count} FTEs
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {dept === 'All' ? 'Complete global organizational directory' : `Targeted group for ${dept} team`}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleOpenComposerForDept(dept)}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-violet-500/20"
                  >
                    <Send className="w-3.5 h-3.5" /> Broadcast
                  </button>
                  <button
                    onClick={() => handleCopyDeptEmails(dept)}
                    title="Copy Email Addresses"
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white text-xs transition-all cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dispatched Broadcast Log History */}
      <div className="vibe-glass border border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-violet-400" />
          Broadcast Communication History & Dispatch Log
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Campaign Subject</th>
                <th className="p-3">Recipients</th>
                <th className="p-3">Template</th>
                <th className="p-3">Dispatched At</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sentCampaigns.map((c) => (
                <tr key={c.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-3 font-bold text-white">
                    {c.subject}
                    <div className="text-[10px] text-slate-400 font-normal truncate max-w-sm font-mono mt-0.5">{c.body}</div>
                  </td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-300 font-mono font-bold text-[10px] border border-violet-500/30">
                      {c.recipientsCount} Staff
                    </span>
                  </td>
                  <td className="p-3 text-slate-300 font-medium">{c.templateName || 'Custom'}</td>
                  <td className="p-3 text-slate-400 font-mono">{c.sentAt}</td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 w-fit">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Email Composer Modal */}
      <EmailComposerModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        preSelectedEmployeeIds={preSelectedIds}
        onCampaignCreated={handleCampaignCreated}
      />
    </div>
  );
};
