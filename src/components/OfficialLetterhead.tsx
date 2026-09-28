import React from 'react';
import { ClinicConfig, DEFAULT_CLINIC_CONFIG } from '../types/clinicConfig';
import { Phone, Mail, Instagram, ShieldCheck } from 'lucide-react';

interface LetterheadProps {
  config?: ClinicConfig;
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
  showSignature = false,
  children,
  title,
  documentType,
  pageNumber,
  totalPages,
  className = ''
}) => {
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
          <div>
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
            <p className="text-xs text-neutral-500 font-sans mt-0.5">
              Responsável Técnica: <span className="font-semibold text-neutral-800">{config.technicalResponsible}</span> • {config.crfa}
            </p>
          </div>

          {/* Logotipo Oficial GAMA Estilizado */}
          <div className="flex flex-col items-end text-right select-none">
            <div className="flex items-center gap-1.5">
              {/* Símbolo do Monograma g° */}
              <div className="relative w-8 h-8 rounded-full border-2 border-[#7a5937] flex items-center justify-center font-serif text-[#7a5937] font-bold text-lg leading-none shadow-xs">
                g
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#7a5937]" />
              </div>
            </div>
            <span className="text-sm font-black tracking-widest text-neutral-800 font-sans mt-1">
              GAMA
            </span>
            <span className="text-[9px] font-semibold tracking-wider text-neutral-500 font-sans uppercase">
              FONOAUDIOLOGIA
            </span>
          </div>
        </header>

        {/* Corpo do Documento */}
        <main className="flex-1">
          {children}
        </main>

        {/* Área de Assinatura / Rubrica (Se selecionado com rubrica) */}
        {showSignature && (
          <div className="mt-8 pt-4 flex flex-col items-end text-right">
            {config.signatureUrl ? (
              <img 
                src={config.signatureUrl} 
                alt="Rubrica Digital" 
                className="h-14 object-contain mb-1" 
              />
            ) : (
              <div className="font-serif italic text-lg text-neutral-800 tracking-wide border-b border-neutral-400 pb-1 mb-1 px-4">
                {config.technicalResponsible}
              </div>
            )}
            <p className="text-xs font-bold text-neutral-900 leading-tight">{config.technicalResponsible}</p>
            <p className="text-[11px] text-neutral-600 leading-tight">{config.roleTitle}</p>
            <p className="text-[11px] text-neutral-600 font-mono leading-tight">{config.crfa}</p>
            {config.cpf && <p className="text-[10px] text-neutral-500 font-mono leading-tight">CPF: {config.cpf}</p>}
          </div>
        )}

        {/* Rodapé Oficial com Contatos Exatos do PDF da Cliente */}
        <footer className="mt-6 pt-3 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-600 font-sans gap-2 select-none">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="flex items-center gap-1.5 font-medium text-neutral-800">
              <Phone className="w-3.5 h-3.5 text-[#7a5937]" />
              {config.phoneWhatsapp}
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#7a5937]" />
              {config.email}
            </span>
            <span className="flex items-center gap-1.5">
              <Instagram className="w-3.5 h-3.5 text-[#7a5937]" />
              {config.instagram}
            </span>
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
