import React from 'react';
import { ClinicConfig, DEFAULT_CLINIC_CONFIG, Therapist, getEffectiveTherapistProfile } from '../types/clinicConfig';
import { Phone, Mail, Instagram, ShieldCheck } from 'lucide-react';

interface LetterheadProps {
  config?: ClinicConfig;
  therapist?: Therapist | null;
  showSignature?: boolean;
  children: React.ReactNode;
  title?: string;
  documentType?: string;
  pageNumber?: number;
  totalPages?: number;
  className?: string;
}

export const OfficialLetterhead: React.FC<LetterheadProps> = ({
  config = DEFAULT_CLINIC_CONFIG,
  therapist,
  showSignature = false,
  children,
  title,
  documentType,
  pageNumber,
  totalPages,
  className = ''
}) => {
  // Obter perfil efetivo: dados da terapeuta com fallback automático para os dados da clínica e RT
  const profile = getEffectiveTherapistProfile(therapist, config);

  return (
    <div className={`relative bg-white text-neutral-900 shadow-xl rounded-sm print:shadow-none print:m-0 print:p-0 print:border-none w-full max-w-[210mm] mx-auto min-h-[297mm] flex flex-col justify-between overflow-hidden border border-neutral-200 ${className}`}>
      {/* Faixa Marrom Lateral Esquerda (Identidade Visual Fiel ao Papel Timbrado Oficial) */}
      <div 
        className="absolute top-0 bottom-0 left-0 w-4 sm:w-5 print:w-4 bg-[#7a5937] z-10" 
        aria-hidden="true" 
      />

      {/* Conteúdo da Folha com Margem da Faixa */}
      <div className="flex-1 flex flex-col pl-7 sm:pl-9 pr-6 sm:pr-8 pt-7 pb-6 relative z-0">
        {/* Cabeçalho Oficial GAMA FONOAUDIOLOGIA */}
        <header className="flex items-start justify-between border-b border-neutral-200 pb-5 mb-6">
          <div className="max-w-[60%]">
            {documentType && (
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#7a5937] block mb-0.5">
                {documentType}
              </span>
            )}
            {title && (
              <h1 className="text-xl sm:text-2xl font-bold font-serif text-neutral-900 leading-tight">
                {title}
              </h1>
            )}
            <p className="text-xs text-neutral-500 font-sans mt-1">
              Responsável Técnica: <span className="font-semibold text-neutral-800">{profile.name}</span> • {profile.crfa}
            </p>
          </div>

          {/* Logotipo Oficial GAMA (Proporção Fiel ao Documento PDF Original) */}
          <div className="flex flex-col items-center justify-center text-center select-none min-w-[130px]">
            {config.logoUrl ? (
              <div className="flex flex-col items-center">
                <img 
                  src={config.logoUrl} 
                  alt={config.clinicName || 'Logomarca Oficial'} 
                  className="h-16 sm:h-20 max-w-[180px] object-contain mb-1 drop-shadow-sm" 
                />
              </div>
            ) : (
              <div className="flex flex-col items-center">
                {/* Símbolo Nobre do Monograma g° com proporção e detalhes fiéis */}
                <div className="relative mb-1">
                  <div className="w-11 h-11 rounded-full border-[2.5px] border-[#7a5937] flex items-center justify-center font-serif text-[#7a5937] font-bold text-2xl leading-none shadow-xs">
                    g
                  </div>
                  {/* Pequena esfera superior do expoente do monograma */}
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#7a5937] border-2 border-white shadow-xs" />
                </div>
                {/* Tipografia Clássica GAMA FONOAUDIOLOGIA */}
                <span className="text-base sm:text-lg font-serif font-black tracking-[0.25em] text-[#2b2420] uppercase leading-none mt-1">
                  {config.clinicName ? config.clinicName.replace(' FONOAUDIOLOGIA', '') : 'GAMA'}
                </span>
                <span className="text-[8px] sm:text-[9px] font-sans font-semibold tracking-[0.3em] text-[#7a5937] uppercase leading-tight mt-0.5">
                  FONOAUDIOLOGIA
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Corpo do Documento */}
        <main className="flex-1">
          {children}
        </main>

        {/* Área de Assinatura / Rubrica (Se selecionado com rubrica) */}
        {showSignature && (
          <div className="mt-8 pt-4 flex flex-col items-end text-right">
            {profile.signatureUrl ? (
              <img 
                src={profile.signatureUrl} 
                alt="Rubrica Digital" 
                className="h-14 object-contain mb-1" 
              />
            ) : (
              <div className="font-serif italic text-lg text-neutral-800 tracking-wide border-b border-neutral-400 pb-1 mb-1 px-4">
                {profile.name}
              </div>
            )}
            <p className="text-xs font-bold text-neutral-900 leading-tight">{profile.name}</p>
            <p className="text-[11px] text-neutral-600 leading-tight">{profile.roleTitle}</p>
            <p className="text-[11px] text-neutral-600 font-mono leading-tight">{profile.crfa}</p>
            {profile.cpf && <p className="text-[10px] text-neutral-500 font-mono leading-tight">CPF: {profile.cpf}</p>}
          </div>
        )}

        {/* Rodapé Oficial com Contatos Efetivos (Refletindo Dados Atuais ou da Terapeuta) */}
        <footer className="mt-6 pt-3 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-600 font-sans gap-2 select-none">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {profile.phone && (
              <span className="flex items-center gap-1.5 font-medium text-neutral-800">
                <Phone className="w-3.5 h-3.5 text-[#7a5937]" />
                {profile.phone}
              </span>
            )}
            {profile.email && (
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#7a5937]" />
                {profile.email}
              </span>
            )}
            {profile.instagram && (
              <span className="flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-[#7a5937]" />
                {profile.instagram}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
            {pageNumber && (
              <span>
                Pág. {pageNumber}{totalPages ? ` de ${totalPages}` : ''}
              </span>
            )}
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1 text-[#7a5937] font-semibold">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Documento Oficial
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};
