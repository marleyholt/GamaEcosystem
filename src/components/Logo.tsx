import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true }) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div className="flex items-center gap-3">
      {/* Stylized circular logo matching the image */}
      <div
        className={`${sizeMap[size]} rounded-full bg-white flex items-center justify-center p-1.5 shadow-md border border-[#c8a88a]/30 shrink-0`}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          {/* Main brown circle */}
          <circle cx="50" cy="50" r="28" fill="#5c2c16" />
          <circle cx="50" cy="50" r="14" fill="#ffffff" />
          {/* Head circle */}
          <circle cx="68" cy="28" r="8" fill="#5c2c16" />
          {/* Acoustic waves / deglutition waves */}
          <path
            d="M74 38 C79 43, 79 57, 74 62"
            stroke="#5c2c16"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M82 32 C90 40, 90 60, 82 68"
            stroke="#5c2c16"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-serif font-bold tracking-tight text-[#f4efe8] text-lg sm:text-xl leading-none">
            GamaEcosystem
          </span>
          <span className="text-xs text-[#c8a88a] font-medium tracking-wide uppercase mt-0.5">
            Health Deglut
          </span>
        </div>
      )}
    </div>
  );
};
