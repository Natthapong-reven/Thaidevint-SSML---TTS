import React from 'react';

interface SelectionCardProps {
  label: string;
  icon?: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
  disabled: boolean;
}

export const SelectionCard: React.FC<SelectionCardProps> = ({ label, icon, isSelected, onClick, disabled }) => {
  const baseClasses = 'flex flex-col items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800';
  
  const stateClasses = isSelected
    ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300'
    : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500';

  const disabledClasses = 'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-700/30 disabled:border-slate-700';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${stateClasses} ${disabledClasses}`}
      aria-pressed={isSelected}
    >
      {icon}
      <span className="text-xs font-semibold">{label}</span>
    </button>
  );
};