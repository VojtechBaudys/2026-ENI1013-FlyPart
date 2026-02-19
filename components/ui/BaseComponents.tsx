import React from 'react';
import { LucideIcon } from 'lucide-react';

// --- Card ---
export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-slate-900/90 border border-slate-700 backdrop-blur-md rounded-xl shadow-xl ${className}`}>
    {children}
  </div>
);

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'icon';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-900/20",
    secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "bg-transparent text-slate-300 hover:text-white hover:bg-slate-800"
  };

  const sizes = {
    sm: "h-8 px-3 text-xs rounded-md",
    md: "h-10 px-4 py-2 rounded-lg",
    icon: "h-10 w-10 rounded-lg p-2"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

// --- Badge ---
export const Badge: React.FC<{ children: React.ReactNode; variant?: 'success' | 'warning' | 'danger' | 'neutral' }> = ({ children, variant = 'neutral' }) => {
  const styles = {
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    danger: "bg-red-500/10 text-red-400 border-red-500/20",
    neutral: "bg-slate-500/10 text-slate-400 border-slate-500/20"
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${styles[variant]}`}>
      {children}
    </span>
  );
};

// --- Input ---
export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 ring-offset-slate-950 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
    {...props}
  />
);

// --- Status Indicator ---
export const StatusItem: React.FC<{ icon: LucideIcon; label: string; value: string; color?: string }> = ({ icon: Icon, label, value, color = "text-slate-200" }) => (
  <div className="flex items-center space-x-2 bg-slate-800/50 px-3 py-1.5 rounded-md border border-slate-700/50">
    <Icon className={`w-4 h-4 ${color}`} />
    <span className="text-xs text-slate-400 uppercase tracking-wider">{label}</span>
    {/* Enforced min-width and text alignment to prevent layout shift */}
    <span className="text-sm font-mono font-bold text-slate-100 min-w-[3.5rem] text-right inline-block">{value}</span>
  </div>
);