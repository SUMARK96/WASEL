import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  className = ''
}) => {
  const heights = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-12',
    lg: 'h-14 sm:h-16',
    xl: 'h-20 sm:h-24'
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official Image Logo */}
      <img
        src="/wasel-logo.jpg"
        alt="واصل WASEL"
        className={`${heights[size]} object-contain rounded-xl shadow-md transition-transform duration-300`}
      />
    </div>
  );
};
