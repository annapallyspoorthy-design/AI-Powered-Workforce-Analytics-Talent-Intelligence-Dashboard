import React from 'react';

interface BadgeProps {
  id?: string;
  variant?: 'high' | 'medium' | 'low' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ id, variant = 'primary', children, className = '' }) => {
  let styles = 'bg-blue-50 border-blue-200 text-blue-700';

  if (variant === 'high' || variant === 'danger') {
    styles = 'bg-rose-50 border-rose-200 text-rose-700';
  } else if (variant === 'medium' || variant === 'warning') {
    styles = 'bg-amber-50 border-amber-200 text-amber-800';
  } else if (variant === 'low' || variant === 'success') {
    styles = 'bg-emerald-50 border-emerald-200 text-emerald-800';
  } else if (variant === 'secondary') {
    styles = 'bg-slate-100 border-slate-200 text-slate-700';
  }

  return (
    <span
      id={id}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
};
