import React from 'react';

interface CardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, icon, children, className }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center text-slate-800 mb-4">
        {icon}
        <h2 className="text-xl font-bold ms-3">{title}</h2>
      </div>
      <div className="text-slate-600">{children}</div>
    </div>
  );
};