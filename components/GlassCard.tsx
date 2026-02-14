
import React from 'react';

// Changed to default import to ensure JSX intrinsic elements (div, etc.) are correctly recognized in this environment
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`glass-green rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:border-emerald-400/30 ${className} ${onClick ? 'cursor-pointer hover:-translate-y-1' : ''}`}
    >
      {children}
    </div>
  );
};
