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
        return 'bg-[#EEF4FA] text-[#142F52] border-[#E5EDF3] hover:bg-[#E2EDF7] font-semibold';
      case 'delivery':
        return 'bg-[#EAF6F1] text-[#159B7A] border-[#159B7A]/30 hover:bg-[#DEF0E8] font-bold';
      default:
        return 'bg-[#F5F9FC] text-[#64748B] border-[#E5EDF3] hover:bg-[#EEF4FA]';
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
      <MapPin className={size === 'sm' ? 'w-3 h-3 text-[#159B7A]' : size === 'lg' ? 'w-4 h-4 text-[#159B7A]' : 'w-3.5 h-3.5 text-[#159B7A]'} />
      {emirate}
    </span>
  );
};
