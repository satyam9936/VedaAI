import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const base = "inline-flex items-center justify-center font-semibold rounded-xl transition transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-gradient-to-r from-veda-600 to-indigo-600 hover:from-veda-500 hover:to-indigo-500 text-white shadow-lg shadow-veda-600/25 border border-veda-400/30",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700",
    outline: "bg-transparent hover:bg-slate-800/60 text-slate-300 border border-slate-700",
    ghost: "bg-transparent hover:bg-slate-800/40 text-slate-400 hover:text-white"
  };

  const sizes = {
    sm: "px-2.5 py-1 text-xs gap-1.5",
    md: "px-4 py-2 text-xs gap-2",
    lg: "px-5 py-2.5 text-sm gap-2.5"
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'neutral' | 'indigo';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', children, className = '' }) => {
  const styleMap = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    error: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    neutral: 'bg-slate-800 text-slate-300 border-slate-700',
    indigo: 'bg-indigo-950/60 text-indigo-300 border-indigo-500/30'
  };

  return (
    <span className={`px-2 py-0.5 rounded-md border text-[11px] font-medium inline-flex items-center gap-1 ${styleMap[variant]} ${className}`}>
      {children}
    </span>
  );
};
