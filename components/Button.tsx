
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', ...props }) => {
  const baseClasses =
    'flex h-12 w-full items-center justify-center rounded-lg px-6 font-semibold shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed';

  const variantClasses = {
    primary:
      'bg-cyan-600 text-white hover:bg-cyan-500 focus:ring-cyan-400 disabled:bg-slate-600 disabled:opacity-70',
    secondary:
      'border-2 border-slate-600 bg-transparent text-slate-300 hover:border-slate-500 hover:bg-slate-700 focus:ring-slate-500 disabled:border-slate-700 disabled:text-slate-500 disabled:bg-transparent',
  };

  return (
    <button {...props} className={`${baseClasses} ${variantClasses[variant]}`}>
      {children}
    </button>
  );
};
