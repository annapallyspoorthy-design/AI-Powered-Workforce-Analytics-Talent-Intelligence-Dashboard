import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Employee, EmailCampaign } from '../../types';
import { useNotification } from '../../context/NotificationContext';
import { sendEmailBroadcast } from '../../services/api';
import {
  Mail,
  Send,
  Users,
  Check,
  Copy,
  Sparkles,
  FileText,
  Eye,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  Paperclip,
  CheckSquare,
  Square,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'motion/react';

interface EmailComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  allEmployees?: Employee[];
  preSelectedEmployeeIds?: string[];
  onEmailSent?: (campaign: EmailCampaign) => void;
  onCampaignCreated?: (campaign: EmailCampaign) => void;
}

const EMAIL_TEMPLATES = [
  {
    id: 'perf-review',
    name: 'Performance Review Notice',
    subject: 'Schedule Request: Q3 Executive Performance Review - {{EmployeeName}}',
    body: `Dear {{EmployeeName}},

As part of our commitment to continuous growth and career development at Workforce AI, your Q3 Performance & Career Review is now scheduled.

Review Details:
- Employee: {{EmployeeName}}
- Business Unit: {{Department}}
- Reviewing Manager: {{Manager}}

Please log into the HR portal prior to our meeting to review your key achievements and strategic initiatives. If you need to adjust your time slot, please respond directly to this email.

Best regards,
HR Leadership & Operations Team`,
  },
  {
    id: 'comp-update',
    name: 'Compensation & Merit Adjustment',
    subject: 'Official Notice: Annual Compensation & Equity Statement - {{EmployeeName}}',
    body: `Dear {{EmployeeName}},

We are pleased to share your updated annual compensation and merit review summary effective for the upcoming quarter.

Summary Highlights:
- Name: {{EmployeeName}}
- Department: {{Department}}
- Position: {{Role}}

Thank you for your outstanding contributions, dedication, and impact across our organizational goals.

Warm regards,
Global Compensation & HR Operations`,
  },
  {
    id: 'department-townhall',
    name: 'Department All-Hands Sync',
    subject: 'Urgent: Upcoming {{Department}} Department All-Hands & Strategy Sync',
    body: `Hi {{Department}} Team,

Please join us for our upcoming Department All-Hands meeting next Tuesday at 10:00 AM PST.

Agenda Highlights:
1. Q3 Roadmap Review & Key Milestones
2. Team Expansion & Growth Achievements
3. Open Q&A with Department Leadership

Calendar invitations with the video conference link have been dispatched.

Best regards,
Department Leadership`,
  },
  {
    id: 'promotion-congrats',
    name: 'Promotion & Leadership Recognition',
    subject: 'Congratulations on Your Career Advancement, {{EmployeeName}}!',
    body: `Dear {{EmployeeName}},

On behalf of executive leadership and the entire team, we are thrilled to formally congratulate you on your promotion readiness and leadership accomplishments in the {{Department}} department.

Your high performance rating, technical expertise, and collaborative spirit continue to elevate our company culture.

Congratulations once again on this well-deserved recognition!

Warmest regards,
Executive Leadership Team`,
  },
  {
    id: 'custom',
    name: 'Custom Email Announcement',
    subject: 'Important Workplace Announcement: {{Department}} Team Update',
    body: `Dear {{EmployeeName}},

We are writing to share an important workplace announcement regarding upcoming initiatives in {{Department}}.

[Insert your custom message here]

If you have any questions or feedback, please feel free to reach out to the HR Operations team.

Best regards,
HR Operations Team`,
  },
];

export const EmailComposerModal: React.FC<EmailComposerModalProps> = ({
  isOpen,
  onClose,
  allEmployees = [],
  preSelectedEmployeeIds = [],
  onEmailSent,
  onCampaignCreated,
}) => {
  const { addToast } = useNotification();

  const [selectedTemplateId, setSelectedTemplateId] = useState('perf-review');
  const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [senderEmail, setSenderEmail] = useState('hr-admin@workforce.ai');
  const [deptFilter, setDeptFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'compose' | 'preview'>('compose');
  const [isSending, setIsSending] = useState(false);
  const [sendingProgress, setSendingProgress] = useState(0);

  // Initialize selected employees & default template
  useEffect(() => {
    if (preSelectedEmployeeIds.length > 0) {
      setSelectedEmpIds(preSelectedEmployeeIds);
    } else if (allEmployees.length > 0) {
      setSelectedEmpIds(allEmployees.map((e) => e.id));
    }

    const tpl = EMAIL_TEMPLATES[0];
    setSubject(tpl.subject);
    setBody(tpl.body);
  }, [isOpen, preSelectedEmployeeIds, allEmployees]);

  // Template switch handler
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tpl = EMAIL_TEMPLATES.find((t) => t.id === templateId);
    if (tpl) {
      setSubject(tpl.subject);
      setBody(tpl.body);
    }
  };

  // Filter employees
  const filteredEmployees = allEmployees.filter((emp) => {
    const matchesDept = deptFilter === 'All' || emp.department === deptFilter;
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const handleToggleSelectEmp = (id: string) => {
    setSelectedEmpIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredEmployees.map((e) => e.id);
    const allSelected = filteredIds.every((id) => selectedEmpIds.includes(id));

    if (allSelected) {
      setSelectedEmpIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      const combined = new Set([...selectedEmpIds, ...filteredIds]);
      setSelectedEmpIds(Array.from(combined));
    }
  };

  const selectedEmployeesList = allEmployees.filter((e) =>
    selectedEmpIds.includes(e.id)
  );

  // Copy email list to clipboard
  const handleCopyEmails = () => {
    const emails = selectedEmployeesList.map((e) => e.email).join(', ');
    if (!emails) {
      addToast('No Recipients', 'Please select at least one recipient first.', 'error');
      return;
    }
    navigator.clipboard.writeText(emails);
    addToast('Emails Copied', `Copied ${selectedEmployeesList.length} email addresses to clipboard.`, 'success');
  };

  // Preview replacement using 1st recipient
  const sampleRecipient = selectedEmployeesList[0] || allEmployees[0];
  const renderPersonalizedText = (text: string, emp?: Employee) => {
    if (!emp) return text;
    return text
      .replace(/{{EmployeeName}}/g, emp.name)
      .replace(/{{Department}}/g, emp.department)
      .replace(/{{Role}}/g, emp.role)
      .replace(/{{Manager}}/g, emp.manager);
  };

  const handleSendEmail = () => {
    if (selectedEmpIds.length === 0) {
      addToast('No Recipients Selected', 'Please select at least one employee recipient.', 'error');
      return;
    }
    if (!subject.trim() || !body.trim()) {
      addToast('Missing Content', 'Subject line and body content are required.', 'error');
      return;
    }

    setIsSending(true);
    setSendingProgress(10);

    const interval = setInterval(() => {
      setSendingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsSending(false);
            setSendingProgress(0);

            const campaign: EmailCampaign = {
              id: `EML-${Date.now().toString().slice(-4)}`,
              subject,
              body,
              recipientsCount: selectedEmpIds.length,
              recipientNames: selectedEmployeesList.map((e) => e.name),
              sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              sender: senderEmail,
              status: 'Delivered',
              templateName: EMAIL_TEMPLATES.find((t) => t.id === selectedTemplateId)?.name,
            };

            sendEmailBroadcast({
              subject,
              body,
              sender: senderEmail,
              targetType: selectedEmpIds.length > 50 ? 'All' : 'Individual',
              recipientIds: selectedEmpIds,
              templateName: campaign.templateName,
            }).catch((err) => console.warn('Email broadcast save error:', err));

            if (onEmailSent) {
              onEmailSent(campaign);
            }
            if (onCampaignCreated) {
              onCampaignCreated(campaign);
            }

            addToast(
              'Emails Dispatched Successfully',
              `Broadcast sent to ${selectedEmpIds.length} employee recipients.`,
              'success'
            );
            onClose();
          }, 300);
          return 100;
        }
        return prev + 30;
      });
    }, 250);
  };

  return (
    <Modal
      id="modal-email-composer"
      isOpen={isOpen}
      onClose={onClose}
      title="HR Admin Email Broadcast & Communications"
      maxWidth="4xl"
    >
      <div className="space-y-5 text-xs text-slate-800 dark:text-slate-100">
        {/* Top Control Bar & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-xs">
                Target Group: <span className="text-blue-600 dark:text-blue-400 font-extrabold">{selectedEmpIds.length} Recipients Selected</span>
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Personalized bulk messaging with template variable injection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyEmails}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-1.5 shadow-xs transition-all"
              title="Copy email addresses to clipboard"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Copy Emails</span>
            </button>

            <div className="flex items-center bg-slate-200 dark:bg-slate-700 p-0.5 rounded-xl">
              <button
                onClick={() => setActiveTab('compose')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  activeTab === 'compose'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Compose</span>
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  activeTab === 'preview'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live Preview</span>
              </button>
            </div>
          </div>
        </div>

        {activeTab === 'compose' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left 2 Cols: Email Form & Templates */}
            <div className="lg:col-span-2 space-y-4">
              {/* Template Picker */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Select Pre-built HR Template
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {EMAIL_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleSelectTemplate(tpl.id)}
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        selectedTemplateId === tpl.id
                          ? 'bg-blue-50 dark:bg-blue-900/40 border-blue-500 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <p className="text-[11px] font-bold truncate">{tpl.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sender & Subject Line */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">From Sender</label>
                  <input
                    type="text"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 font-mono text-[11px]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Subject Line</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter email subject line..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 font-medium"
                  />
                </div>
              </div>

              {/* Body Area */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold">Message Body</label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Supported tags: {'{{EmployeeName}}'}, {'{{Department}}'}, {'{{Manager}}'}
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-100 font-sans text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Right 1 Col: Selective Recipient Group Picker */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-3 flex-1 flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                    <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Select Group ({selectedEmpIds.length})</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSelectAllFiltered}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Toggle All
                  </button>
                </div>

                {/* Filters for recipient selection */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Filter by name..."
                      className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl pl-8 pr-2 py-1.5 text-[11px] text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <select
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-2 py-1.5 text-[11px] text-slate-800 dark:text-slate-100"
                  >
                    <option value="All">All Departments</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Product">Product</option>
                    <option value="Sales">Sales</option>
                    <option value="Finance">Finance</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Design">Design</option>
                  </select>
                </div>

                {/* Recipient Checkbox List */}
                <div className="flex-1 overflow-y-auto max-h-56 pr-1 space-y-1.5 border border-slate-200 dark:border-slate-700/80 rounded-xl bg-white dark:bg-slate-900/60 p-2">
                  {filteredEmployees.map((emp) => {
                    const isChecked = selectedEmpIds.includes(emp.id);
                    return (
                      <div
                        key={emp.id}
                        onClick={() => handleToggleSelectEmp(emp.id)}
                        className={`p-1.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors text-[11px] ${
                          isChecked
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200 font-semibold'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {isChecked ? (
                            <CheckSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span className="truncate">{emp.name}</span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono shrink-0 ml-1">
                          {emp.department}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Live Preview Tab */
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                  Recipient Preview 1 of {selectedEmpIds.length}
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  To: {sampleRecipient?.name || 'Employee'} &lt;{sampleRecipient?.email || 'email@company.com'}&gt;
                </p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  From: {senderEmail}
                </p>
              </div>

              <div className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Live Variables Rendered
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Subject: {renderPersonalizedText(subject, sampleRecipient)}
              </h3>
              <div className="text-xs text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                {renderPersonalizedText(body, sampleRecipient)}
              </div>
            </div>
          </div>
        )}

        {/* Sending Progress Bar */}
        {isSending && (
          <div className="space-y-1.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
            <div className="flex justify-between text-xs font-bold text-blue-700 dark:text-blue-300">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-400" />
                Dispatching emails to selective group...
              </span>
              <span>{sendingProgress}%</span>
            </div>
            <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${sendingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Modal Action Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSendEmail}
            disabled={isSending || selectedEmpIds.length === 0}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs hover:scale-102 active:scale-98 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>Send Email Broadcast ({selectedEmpIds.length})</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
