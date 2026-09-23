import React from 'react';
import type { Emirate } from '../types';
import { MapPin } from 'lucide-react';

interface EmirateBadgeProps {
  emirate: Emirate;
  type?: 'pickup' | 'delivery' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
}

export const EmirateBadge: React.FC<EmirateBadgeProps> = ({ 
  emirate, 
  type = 'neutral',
  size = 'md'
}) => {
  const getColors = () => {
    switch (type) {
      case 'pickup':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20';
      case 'delivery':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/25';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-0.5 gap-1';
      case 'lg':
        return 'text-base px-3.5 py-1.5 gap-2 font-bold';
      default:
        return 'text-sm px-2.5 py-1 gap-1.5 font-medium';
    }
  };

  return (
    <span className={`inline-flex items-center rounded-lg border transition-colors ${getColors()} ${getSizeClasses()}`}>
      <MapPin className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      {emirate}
    </span>
  );
};
