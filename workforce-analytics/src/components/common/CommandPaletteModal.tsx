import React, { useState, useEffect } from 'react';
import {
  Search,
  LayoutDashboard,
  Fingerprint,
  Calendar,
  CalendarDays,
  CreditCard,
  BrainCircuit,
  Target,
  Users,
  Mail,
  BarChart3,
  FileSpreadsheet,
  ShieldCheck,
  Bot,
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleAssistant?: () => void;
  onSelectEmployee?: (empId: string) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onToggleAssistant,
  onSelectEmployee,
}) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const commands = [
    {
      name: 'Executive Dashboard',
      description: 'KPI overview, real-time activity stream & AI insights',
      path: '/',
      icon: LayoutDashboard,
      category: 'Navigation',
    },
    {
      name: 'Attendance & Biometric Clock-In',
      description: 'Employee check-in logs, face AI, GPS geofencing & timer',
      path: '/attendance',
      icon: Fingerprint,
      category: 'Workforce',
    },
    {
      name: 'Shift Management & Roster',
      description: 'Weekly schedule planner, automated AI shift assignment',
      path: '/shifts',
      icon: Calendar,
      category: 'Workforce',
    },
    {
      name: 'Leave Oversight & Timesheets',
      description: 'Review employee leave applications & billable project logs',
      path: '/leave-timesheets',
      icon: CalendarDays,
      category: 'HR Management',
    },
    {
      name: 'Payroll Processing Input',
      description: 'Gross salary preview, tax calculations & payment runs',
      path: '/payroll',
      icon: CreditCard,
      category: 'HR Management',
    },
    {
      name: 'AI Workforce Planning & Attrition',
      description: 'Skill gap analysis, flight risk predictions & staffing cost',
      path: '/workforce-planning',
      icon: BrainCircuit,
      category: 'AI Suite',
    },
    {
      name: 'Performance Goals & Reviews',
      description: 'OKRs, continuous feedback & 360 performance ratings',
      path: '/performance',
      icon: Target,
      category: 'HR Management',
    },
    {
      name: 'Employee Directory',
      description: 'Full employee profiles, skills taxonomy & department filter',
      path: '/employees',
      icon: Users,
      category: 'Directory',
    },
    {
      name: 'Selective Email Broadcast',
      description: 'Send announcement emails to targeted teams & staff',
      path: '/email',
      icon: Mail,
      category: 'Communication',
    },
    {
      name: 'Workforce Analytics & Charts',
      description: 'Departmental headcount, turnover rate & salary trends',
      path: '/analytics',
      icon: BarChart3,
      category: 'Analytics',
    },
    {
      name: 'Executive Compliance Reports',
      description: 'Download CSV/PDF reports for audit and leadership',
      path: '/reports',
      icon: FileSpreadsheet,
      category: 'Analytics',
    },
    {
      name: 'Integrations & System Security',
      description: 'AWS / MongoDB API connections & SOC2 security audit',
      path: '/integrations',
      icon: ShieldCheck,
      category: 'Settings',
    },
  ];

  const filteredCommands = commands.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.description.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (command: (typeof commands)[0]) => {
    onClose();
    setQuery('');
    navigate(command.path);
  };

  const handleOpenAssistant = () => {
    onClose();
    setQuery('');
    onToggleAssistant();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open via key
          const searchInput = document.getElementById('global-search-input');
          if (searchInput) {
            searchInput.click();
          }
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Command Bar Input Header */}
            <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <Search className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mr-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search modules... (e.g., 'Payroll', 'Clock-In', 'AI')"
                autoFocus
                className="w-full bg-transparent text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              />
              <span className="px-2 py-1 rounded-md bg-slate-200 dark:bg-slate-800 text-[10px] font-mono text-slate-500 font-bold shrink-0">
                ESC
              </span>
            </div>

            {/* Quick AI Action Callout */}
            <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border-b border-blue-100 dark:border-blue-900/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Ask AURA AI Copilot
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                  &bull; Instant HR policies, policy answers & workforce insights
                </span>
              </div>
              <button
                onClick={handleOpenAssistant}
                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <span>Launch Copilot</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Command Results List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1 divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredCommands.length > 0 ? (
                filteredCommands.map((cmd) => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.name}
                      onClick={() => handleSelect(cmd)}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/80 text-left transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                              {cmd.name}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-200/60 dark:bg-slate-800 text-slate-500">
                              {cmd.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {cmd.description}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                    </button>
                  );
                })
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  No command or module matching "{query}". Try searching for 'Payroll', 'Attendance', or 'Analytics'.
                </div>
              )}
            </div>

            {/* Command Palette Footer */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[9px] font-mono font-bold">
                    ↑↓
                  </kbd>{' '}
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[9px] font-mono font-bold">
                    ↵
                  </kbd>{' '}
                  Select
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold">
                <Zap className="w-3.5 h-3.5" />
                <span>Workforce AI Enterprise v3.2</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
