import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  customLogoUrl?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, customLogoUrl }) => {
  // Tamanhos aprimorados e generosos para nitidez e presença visual impecável
  const sizeMap = {
    sm: 'w-11 h-11 sm:w-12 sm:h-12', // Aumentado significativamente para destacar o ícone
    md: 'w-12 h-12 sm:w-14 sm:h-14',
    lg: 'w-16 h-16 sm:w-20 sm:h-20',
    xl: 'w-24 h-24 sm:w-28 sm:h-28',
  };

  // Se não foi passado customLogoUrl, busca do cache local de clinicConfig (faviconUrl ou logoUrl)
  const effectiveCustomLogo = customLogoUrl || (() => {
    try {
      const saved = localStorage.getItem('health_deglut_clinic_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.faviconUrl || parsed.logoUrl;
      }
    } catch {
      return undefined;
    }
    return undefined;
  })();

  return (
    <div className="flex items-center gap-3">
      {/* Símbolo do Ícone / Favicon com Moldura Elegante e Alto Contraste */}
      <div
        className={`${sizeMap[size]} rounded-2xl bg-white flex items-center justify-center p-1.5 shadow-md border border-[#c8a88a]/40 shrink-0 overflow-hidden transition-transform duration-200 hover:scale-105`}
        title="GamaEcosystem - Ícone do Aplicativo"
      >
        {effectiveCustomLogo ? (
          <img 
            src={effectiveCustomLogo} 
            alt="Ícone do Aplicativo GamaEcosystem" 
            className="w-full h-full object-contain rounded-xl" 
          />
        ) : (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            {/* Círculo Marrom Principal */}
            <circle cx="50" cy="50" r="28" fill="#5c2c16" />
            <circle cx="50" cy="50" r="14" fill="#ffffff" />
            {/* Cabeça */}
            <circle cx="68" cy="28" r="8" fill="#5c2c16" />
            {/* Ondas Acústicas de Deglutição */}
            <path
              d="M74 38 C79 43, 79 57, 74 62"
              stroke="#5c2c16"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M82 32 C90 40, 90 60, 82 68"
              stroke="#5c2c16"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </svg>
        )}
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
