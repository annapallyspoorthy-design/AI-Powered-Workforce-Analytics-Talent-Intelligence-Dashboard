import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  id?: string;
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  subtitle?: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconTextColor?: string;
  badgeText?: string;
  badgeType?: 'success' | 'warning' | 'danger' | 'info';
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  change,
  isPositive = true,
  subtitle,
  icon: Icon,
  iconBgColor = 'bg-blue-50 border-blue-100',
  iconTextColor = 'text-blue-600',
  badgeText,
  badgeType = 'info',
}) => {
  return (
    <motion.div
      id={id}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md group h-full flex flex-col justify-between"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl border ${iconBgColor} ${iconTextColor} shrink-0 shadow-2xs`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
        {change && (
          <div
            className={`flex items-center font-semibold gap-1 px-2.5 py-0.5 rounded-full border text-[11px] ${
              isPositive
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{change}</span>
          </div>
        )}

        {badgeText && (
          <span
            className={`px-2.5 py-0.5 rounded-full font-semibold border text-[11px] ${
              badgeType === 'danger'
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : badgeType === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : badgeType === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-blue-50 border-blue-200 text-blue-700'
            }`}
          >
            {badgeText}
          </span>
        )}

        {subtitle && <span className="text-slate-500 truncate text-[11px]">{subtitle}</span>}
      </div>
    </motion.div>
  );
};
