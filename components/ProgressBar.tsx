
import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  colorClass?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, colorClass = 'bg-teal-500' }) => {
  const clampedValue = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
      <div
        className={`h-4 rounded-full transition-all duration-500 ease-out ${colorClass}`}
        style={{ width: `${clampedValue}%` }}
      ></div>
    </div>
  );
};
