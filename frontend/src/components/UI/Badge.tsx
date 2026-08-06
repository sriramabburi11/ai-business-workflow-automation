import React from 'react';

interface BadgeProps {
  variant?: 'active' | 'pending' | 'completed' | 'urgent' | 'high' | 'medium' | 'low' | 'danger';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'active', children, className = '' }) => {
  const variantStyles = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    urgent: 'bg-rose-500/15 text-rose-400 border-rose-500/30 font-bold',
    high: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    medium: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    low: 'bg-slate-800 text-slate-300 border-slate-700',
    danger: 'bg-rose-500/15 text-rose-400 border-rose-500/30'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
