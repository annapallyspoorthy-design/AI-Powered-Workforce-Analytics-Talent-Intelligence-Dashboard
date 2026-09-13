import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { fetchNotifications, markNotificationRead } from '../services/api';
import { NotificationItem } from '../types';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: ToastType;
}

interface NotificationContextType {
  addToast: (title: string, message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
  notifications: ToastItem[];
  systemNotifications: NotificationItem[];
  loadNotifications: (recipientId?: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([
    {
      id: 'init-1',
      title: 'REST API Connected',
      message: 'Live connection to Enterprise Workforce Database established.',
      type: 'info',
    },
  ]);

  const [systemNotifications, setSystemNotifications] = useState<NotificationItem[]>([]);

  const loadNotifications = async (recipientId?: string) => {
    try {
      const res = await fetchNotifications(recipientId);
      if (res.notifications) {
        setSystemNotifications(res.notifications);
      }
    } catch (e) {
      console.warn('Failed to load live notifications:', e);
    }
  };

  const markAsRead = async (id: string) => {
    setSystemNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await markNotificationRead(id);
    } catch (e) {
      console.warn('Failed to mark notification as read:', e);
    }
  };

  const addToast = (title: string, message: string, type: ToastType = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastItem = { id, title, message, type };
    setToasts((prev) => [newToast, ...prev].slice(0, 5));

    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{
        addToast,
        removeToast,
        notifications: toasts,
        systemNotifications,
        loadNotifications,
        markAsRead,
      }}
    >
      {children}
      <div id="toast-container" className="fixed top-20 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            let Icon = Info;
            let bgColor = 'bg-slate-800/95 border-sky-500/50 text-sky-200';
            let iconColor = 'text-sky-400';

            if (toast.type === 'success') {
              Icon = CheckCircle2;
              bgColor = 'bg-slate-800/95 border-emerald-500/50 text-emerald-200';
              iconColor = 'text-emerald-400';
            } else if (toast.type === 'warning') {
              Icon = AlertTriangle;
              bgColor = 'bg-slate-800/95 border-amber-500/50 text-amber-200';
              iconColor = 'text-amber-400';
            } else if (toast.type === 'error') {
              Icon = XCircle;
              bgColor = 'bg-slate-800/95 border-rose-500/50 text-rose-200';
              iconColor = 'text-rose-400';
            }

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                transition={{ duration: 0.25 }}
                className={`pointer-events-auto p-4 rounded-xl border backdrop-blur-md shadow-2xl flex items-start gap-3 ${bgColor}`}
              >
                <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-100">{toast.title}</h4>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
                </div>
                <button
                  id={`btn-close-toast-${toast.id}`}
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
