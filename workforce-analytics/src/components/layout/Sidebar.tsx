import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  BrainCircuit,
  FileSpreadsheet,
  Bot,
  UserCheck,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Mail,
  Fingerprint,
  Calendar,
  CalendarDays,
  CreditCard,
  Target,
  User,
  Sparkles,
  Zap,
  Radio,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onToggleAssistant: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: any;
  isAction?: boolean;
  isPortal?: boolean;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  onToggleAssistant,
}) => {
  const { role, user } = useAuth();

  const hrNavItems: NavItem[] = [
    { name: 'Executive Command', path: '/', icon: LayoutDashboard, badge: 'PRO' },
    { name: 'Attendance & Radar', path: '/attendance', icon: Fingerprint },
    { name: 'Shift Management', path: '/shifts', icon: Calendar },
    { name: 'Leave & Timesheets', path: '/leave-timesheets', icon: CalendarDays },
    { name: 'Payroll Engine', path: '/payroll', icon: CreditCard },
    { name: 'AI Workforce Planning', path: '/workforce-planning', icon: BrainCircuit, badge: 'AI' },
    { name: 'Performance & OKRs', path: '/performance', icon: Target },
    { name: 'Employee Directory', path: '/employees', icon: Users },
    { name: 'Broadcast Comms', path: '/email', icon: Mail },
    { name: 'Analytics Hub', path: '/analytics', icon: BarChart3 },
    { name: 'Data Reports', path: '/reports', icon: FileSpreadsheet },
    { name: 'Security & RBAC', path: '/integrations', icon: ShieldCheck },
    { name: 'AURA AI Assistant', path: '#assistant', icon: Bot, isAction: true },
  ];

  const employeeNavItems: NavItem[] = [
    { name: 'My Employee Portal', path: '/portal', icon: User, isPortal: true, badge: 'LIVE' },
    { name: 'Company Directory', path: '/employees', icon: Users },
    { name: 'AURA AI Assistant', path: '#assistant', icon: Bot, isAction: true },
  ];

  const navItems: NavItem[] = role === 'Employee' ? employeeNavItems : hrNavItems;

  return (
    <>
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-white/95 dark:bg-slate-950/90 backdrop-blur-2xl border-r border-slate-200 dark:border-white/10 shadow-lg dark:shadow-2xl transition-all duration-300 flex flex-col ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-white/10 relative overflow-hidden">
          {/* Subtle glowing ambient back-orb */}
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-violet-500/10 dark:bg-violet-600/20 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3 overflow-hidden z-10">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-violet-500/30 shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 dark:bg-slate-950 rounded-[14px] flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-slate-900 dark:text-white text-sm tracking-wider uppercase truncate">
                    WORKFORCE<span className="text-violet-600 dark:text-violet-400">.AI</span>
                  </span>
                  <span className="px-1.5 py-0.2 rounded-md bg-violet-100 dark:bg-violet-500/20 border border-violet-300 dark:border-violet-500/40 text-[9px] font-mono font-bold text-violet-700 dark:text-violet-300">
                    2.6
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-tight truncate flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                  {role === 'Employee' ? 'Self-Service Station' : 'Executive Command'}
                </span>
              </div>
            )}
          </div>

          <button
            id="btn-collapse-sidebar"
            onClick={onToggleCollapse}
            className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-300 dark:hover:border-slate-700 transition-all hidden lg:block shrink-0 cursor-pointer z-10"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Persona Mode Indicator Card */}
        {!isCollapsed && (
          <div className="mx-3 mt-3 p-3 rounded-2xl bg-slate-100 dark:bg-slate-900/70 border border-slate-200 dark:border-white/10 backdrop-blur-md flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="relative">
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={user?.name}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-violet-500/50"
                />
                <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ${role === 'Employee' ? 'bg-cyan-500' : 'bg-violet-500'} ring-1 ring-white dark:ring-slate-950`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user?.name || 'Active Persona'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                  {role === 'Employee' ? `${user?.id || 'EMP00001'}` : 'HR Administrator'}
                </p>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold ${
                role === 'Employee'
                  ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40'
                  : 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-500/40'
              }`}
            >
              {role === 'Employee' ? 'ESS' : 'HR VP'}
            </span>
          </div>
        )}

        {/* Navigation Link List */}
        <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;

            if (item.isAction) {
              return (
                <button
                  key={item.name}
                  id="nav-btn-assistant"
                  onClick={onToggleAssistant}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all group text-left cursor-pointer ${
                    isCollapsed ? 'justify-center' : ''
                  } bg-violet-100 dark:bg-gradient-to-r dark:from-violet-950/40 dark:to-indigo-950/40 border border-violet-300 dark:border-violet-500/30 text-violet-800 dark:text-violet-300 hover:border-violet-400 hover:text-violet-900 dark:hover:text-white hover:shadow-md`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0 text-cyan-600 dark:text-cyan-400 animate-pulse" />
                  {!isCollapsed && <span className="flex-1 font-bold">{item.name}</span>}
                  {!isCollapsed && (
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-extrabold bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30">
                      GEMINI
                    </span>
                  )}
                </button>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all group relative ${
                    isCollapsed ? 'justify-center' : ''
                  } ${
                    isActive
                      ? item.isPortal
                        ? 'bg-gradient-to-r from-cyan-600 to-emerald-600 text-white font-bold shadow-lg shadow-cyan-500/25 border border-cyan-400/40'
                        : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold shadow-lg shadow-violet-500/25 border border-violet-400/40'
                      : item.isPortal
                      ? 'text-cyan-700 dark:text-cyan-300 font-bold bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-500/20 hover:border-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-950/50'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/80 hover:border-slate-200 dark:hover:border-slate-800 border border-transparent'
                  }`
                }
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span className="truncate flex-1">{item.name}</span>}
                {item.badge && !isCollapsed && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold ${
                      item.badge === 'LIVE'
                        ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40'
                        : item.badge === 'AI'
                        ? 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-500/40'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </aside>
    </>
  );
};
