import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { getStoredBackendUrl } from '../../services/api';
import { BackendApiModal } from '../common/BackendApiModal';
import { CommandPaletteModal } from '../common/CommandPaletteModal';
import {
  Search,
  Bell,
  Sparkles,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  Command,
  User,
  ShieldCheck,
  ArrowRightLeft,
  Radio,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onToggleAssistant: () => void;
  onGlobalSearch?: (query: string) => void;
  isSidebarCollapsed?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleAssistant,
  onGlobalSearch,
  isSidebarCollapsed = false,
}) => {
  const { user, role, logout } = useAuth();
  const { systemNotifications, loadNotifications, markAsRead } = useNotification();
  const { theme, toggleTheme } = useTheme();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications(user?.role === 'Employee' ? user.id : undefined);
  }, [user]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (onGlobalSearch) {
      onGlobalSearch(e.target.value);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/employees?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const unreadCount = systemNotifications.filter((n) => !n.read).length;

  return (
    <>
      <header
        className={`fixed top-0 right-0 left-0 h-16 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 z-30 flex items-center justify-between px-4 lg:px-8 shadow-xs dark:shadow-lg dark:shadow-black/20 transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:left-20' : 'lg:left-64'
        }`}
      >
        {/* Search Input / Command Palette Trigger */}
        <div className="relative flex-1 max-w-xs sm:max-w-sm lg:max-w-md">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-500 dark:text-violet-400" />
            <input
              id="global-search-input"
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onClick={() => setShowCommandPalette(true)}
              placeholder="Search 2,000 employees, AI models, skills... (⌘K)"
              className="w-full bg-slate-100/90 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/80 hover:border-violet-500/50 rounded-xl pl-10 pr-16 py-2 text-xs lg:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400 transition-all cursor-pointer shadow-inner"
            />
            <button
              type="button"
              onClick={() => setShowCommandPalette(true)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-700/80 border border-slate-300 dark:border-slate-600/50 text-[10px] font-mono font-bold text-violet-600 dark:text-violet-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              title="Open Command Palette"
            >
              <Command className="w-3 h-3" />
              <span>K</span>
            </button>
          </form>
        </div>

        {/* Right Navbar Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Authenticated Role Badge */}
          <div className="hidden sm:flex items-center">
            {role === 'HR Admin' ? (
              <div className="px-3 py-1.5 rounded-xl bg-violet-100 dark:bg-violet-950/60 border border-violet-300 dark:border-violet-500/30 text-violet-700 dark:text-violet-300 text-xs font-extrabold flex items-center gap-1.5 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                <span>HR VP Command</span>
              </div>
            ) : (
              <div className="px-3 py-1.5 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-xs font-extrabold flex items-center gap-1.5 shadow-xs">
                <User className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>Employee Portal ({user?.id || 'EMP00001'})</span>
              </div>
            )}
          </div>

          {/* Theme Switcher Toggle */}
          <button
            id="btn-toggle-theme"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-300 dark:border-slate-700/60 transition-all flex items-center justify-center shadow-xs cursor-pointer"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-slate-700" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* AI Assistant Quick Trigger */}
          <button
            id="btn-open-assistant"
            onClick={onToggleAssistant}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md shadow-violet-500/30 hover:scale-102 active:scale-98 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse" />
            <span className="hidden sm:inline">Ask AURA AI</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              id="btn-notifications-toggle"
              onClick={() => {
                setShowNotifications(!showNotifications);
                loadNotifications(user?.role === 'Employee' ? user.id : undefined);
              }}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-300 dark:border-slate-800 transition-colors cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-cyan-500 ring-2 ring-white dark:ring-slate-900 animate-ping" />
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 backdrop-blur-xl rounded-2xl shadow-2xl p-4 z-50 text-slate-900 dark:text-slate-100"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400 animate-pulse" />
                      Live Feed
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-semibold border border-violet-200 dark:border-violet-800">
                      {systemNotifications.length} Events
                    </span>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {systemNotifications.length === 0 ? (
                      <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">No notifications yet.</p>
                    ) : (
                      systemNotifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            n.read
                              ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-500'
                              : 'bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800/80 text-slate-900 dark:text-slate-200 hover:border-violet-400 dark:hover:border-violet-500'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <p className="font-bold text-violet-600 dark:text-violet-400">{n.title}</p>
                            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono">{n.timestamp}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile Menu */}
          {user && (
            <div className="relative">
              <button
                id="btn-user-profile-menu"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-violet-500/50"
                />
                <div className="text-left hidden xl:block">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{user.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{user.role}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 hidden xl:block" />
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 backdrop-blur-xl rounded-2xl shadow-2xl p-2 z-50 text-slate-900 dark:text-slate-100"
                  >
                    <div className="p-3 border-b border-slate-200 dark:border-slate-800 mb-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[9px] px-2 py-0.5 rounded-md font-bold bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                        {user.role}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate('/portal');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-medium flex items-center gap-2 cursor-pointer"
                      >
                        <User className="w-4 h-4 text-cyan-500 dark:text-cyan-400" /> My Employee Portal
                      </button>

                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate('/login');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-medium flex items-center gap-2 cursor-pointer"
                      >
                        <ArrowRightLeft className="w-4 h-4 text-violet-500 dark:text-violet-400" /> Switch / Change Account
                      </button>

                      <button
                        id="btn-logout"
                        onClick={() => {
                          logout();
                          setShowProfileMenu(false);
                          navigate('/login');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-medium flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </header>

      {/* Backend API Modal */}
      <BackendApiModal
        isOpen={showApiModal}
        onClose={() => setShowApiModal(false)}
      />

      {/* Command Palette */}
      <CommandPaletteModal
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onSelectEmployee={(empId) => navigate(`/employees/${empId}`)}
      />
    </>
  );
};
