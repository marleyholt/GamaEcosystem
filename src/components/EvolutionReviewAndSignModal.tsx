import React, { useState } from 'react';
import { 
  X, 
  FileCheck2, 
  Calendar, 
  User, 
  ShieldCheck, 
  Clock, 
  Activity, 
  Utensils, 
  CheckCircle2, 
  AlertCircle,
  FileDown,
  Printer
} from 'lucide-react';
import { OfficialEvolutionData, DigitalSignatureInfo } from '../types/clinicalEvolution';
import { Patient, UserProfile } from '../types';
import { ClinicConfig } from '../types/clinicConfig';
import { SignaturePadModal } from './SignaturePadModal';
import { createDigitalSignature } from '../utils/signatureAudit';
import { generateOfficialEvolutionPDF } from '../utils/evolutionPdfGenerator';

interface EvolutionReviewAndSignModalProps {
  isOpen: boolean;
  onClose: () => void;
  evolution: OfficialEvolutionData;
  patient: Patient;
  currentUser: UserProfile;
  clinicConfig: ClinicConfig;
  onSignSuccess: (updatedEvolution: OfficialEvolutionData) => void;
}

export const EvolutionReviewAndSignModal: React.FC<EvolutionReviewAndSignModalProps> = ({
  isOpen,
  onClose,
  evolution,
  patient,
  currentUser,
  clinicConfig,
  onSignSuccess
}) => {
  const [showSignPad, setShowSignPad] = useState(false);
  const [signAsRole, setSignAsRole] = useState<'fonoaudiologo' | 'cuidador'>('cuidador');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const isMasterUser = 
    currentUser.role === 'admin' ||
    currentUser.name.toLowerCase().includes('adriane gama') ||
    currentUser.email.toLowerCase().includes('adriane') ||
    currentUser.email.toLowerCase().includes('gamafono');

  const isResponsibleUser = currentUser.role === 'cuidador';

  const isTherapistUser = 
    currentUser.role === 'fonoaudiologo' || 
    currentUser.role === 'admin';

  // Usuário Master pode assinar a qualquer momento como Fonoaudióloga ou como Responsável/Paciente
  const canSignAsResponsible = 
    (isResponsibleUser && evolution.status === 'aguardando_familiar') ||
    (isMasterUser && !evolution.responsibleSignature);

  const canSignAsTherapist = 
    (isTherapistUser && evolution.status === 'rascunho') ||
    (isMasterUser && !evolution.therapistSignature);

  const isFullySigned = (evolution.status === 'finalizado_assinado' || isMasterUser) && Boolean(evolution.therapistSignature) && Boolean(evolution.responsibleSignature);

  // Processa assinatura touch/mouse confirmada
  const handleSignatureConfirmed = async (signatureDataUrl: string) => {
    setIsProcessing(true);
    try {
      const activeSigningRole: 'fonoaudiologo' | 'cuidador' = signAsRole;

      const sigInfo: DigitalSignatureInfo = await createDigitalSignature({
        evolutionId: evolution.id,
        patientId: patient.id,
        sessionDate: evolution.sessionDate,
        signerName: activeSigningRole === 'cuidador' && isMasterUser 
          ? (patient.guardianName || 'Responsável pelo Paciente (Simulado Master)') 
          : currentUser.name,
        signerRole: activeSigningRole,
        signerDocument: activeSigningRole === 'fonoaudiologo' 
          ? (currentUser.crfaNumber || 'CREFONO 9531-RJ') 
          : (patient.cpf || 'CPF 341.892.408-11'),
        signerEmail: currentUser.email,
        signatureDataUrl
      });

      let updated: OfficialEvolutionData;

      if (activeSigningRole === 'fonoaudiologo') {
        const nextStatus = evolution.responsibleSignature ? 'finalizado_assinado' : 'aguardando_familiar';
        updated = {
          ...evolution,
          therapistSignature: sigInfo,
          status: nextStatus
        };
      } else {
        // Cuidador / Responsável assinou
        const nextStatus = evolution.therapistSignature ? 'finalizado_assinado' : 'rascunho';
        updated = {
          ...evolution,
          responsibleSignature: sigInfo,
          status: nextStatus === 'finalizado_assinado' ? 'finalizado_assinado' : 'aguardando_familiar',
          pdfGeneratedAt: new Date().toISOString()
        };
      }

      onSignSuccess(updated);
      setShowSignPad(false);
    } catch (err) {
      console.error('Erro ao assinar digitalmente:', err);
      alert('Houve um erro ao processar a assinatura digital. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPDF = () => {
    // Se for Master, permite gerar PDF diretamente para teste se desejar, alertando caso falte uma assinatura
    if (!Boolean(evolution.therapistSignature) && !Boolean(evolution.responsibleSignature) && !isMasterUser) {
      alert('O documento em PDF só pode ser emitido após a assinatura da Fonoaudióloga E do Responsável pelo paciente.');
      return;
    }
    generateOfficialEvolutionPDF({
      evolution,
      patient,
      clinicConfig
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#1f1a17] border border-[#3e342e] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header com Status do Fluxo de Aprovação */}
        <div className="p-4 sm:p-6 border-b border-[#342b26] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#181513]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#c8a88a]/20 border border-[#c8a88a]/40 flex items-center justify-center text-[#c8a88a] shadow-inner">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#c8a88a]/20 text-[#c8a88a] border border-[#c8a88a]/30">
                  Prontuário Oficial • 4 Módulos
                </span>

                {evolution.status === 'rascunho' && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-950/70 text-amber-300 border border-amber-700/40">
                    Aguardando Assinatura da Terapeuta
                  </span>
                )}

                {evolution.status === 'aguardando_familiar' && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-950/70 text-blue-300 border border-blue-700/40 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Aguardando Assinatura do Familiar/Responsável
                  </span>
                )}

                {evolution.status === 'finalizado_assinado' && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-700/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Documento 100% Assinado & Válido
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-serif text-[#f4efe8] mt-1">
                Evolução Clínica de Deglutição - {new Date(evolution.sessionDate).toLocaleDateString('pt-BR')}
              </h2>
              <p className="text-xs text-[#a69a8f]">
                Paciente: <strong className="text-[#f4efe8]">{patient.name}</strong> • Terapeuta: <span className="text-[#c8a88a]">{evolution.therapistName} ({evolution.therapistCrfa})</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#a69a8f] hover:text-[#f4efe8] hover:bg-[#2b2420] border border-[#3e342e] transition-colors self-end sm:self-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Laudo - Visualização Estruturada Completa */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-thin scrollbar-thumb-[#3a312c]">
          
          {/* Banner de Aviso de Ação para o Usuário Atual */}
          {isMasterUser && (!evolution.therapistSignature || !evolution.responsibleSignature) && (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-[#f4efe8]">Acesso MASTER / Modo de Desenvolvimento Ativo</h4>
                  <p className="text-xs text-amber-200/90 mt-0.5">
                    Como Usuário Master, você não fica travado por sequências de permissão e pode assinar como <strong>Fonoaudióloga</strong> ou como <strong>Familiar/Paciente</strong> livremente para testes.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {!evolution.therapistSignature && (
                  <button
                    onClick={() => {
                      setSignAsRole('fonoaudiologo');
                      setShowSignPad(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#c8a88a] hover:bg-[#d6bca3] text-[#181513] font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Assinar como Fono
                  </button>
                )}
                {!evolution.responsibleSignature && (
                  <button
                    onClick={() => {
                      setSignAsRole('cuidador');
                      setShowSignPad(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#2a221d] hover:bg-[#382f2a] text-[#c8a88a] border border-[#524134] font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Assinar como Familiar
                  </button>
                )}
              </div>
            </div>
          )}

          {!isMasterUser && canSignAsResponsible && (
            <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-600/40 text-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-[#f4efe8]">Aprovação Pendente do Responsável / Cuidador</h4>
                  <p className="text-xs text-blue-200/90 mt-0.5">
                    A Fonoaudióloga concluiu o relatório da sessão. Por favor, confira o atendimento abaixo e confirme a assinatura digital para liberação do laudo oficial em PDF.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSignAsRole('cuidador');
                  setShowSignPad(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#c8a88a] hover:bg-[#d6bca3] text-[#181513] font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer"
              >
                Conferir e Assinar Sessão
              </button>
            </div>
          )}

          {!isMasterUser && canSignAsTherapist && (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-[#f4efe8]">Assinatura da Fonoaudióloga Pendente</h4>
                  <p className="text-xs text-amber-200/90 mt-0.5">
                    Assine este relatório para que ele seja disponibilizado na área do paciente/familiar para conferência.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSignAsRole('fonoaudiologo');
                  setShowSignPad(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#c8a88a] hover:bg-[#d6bca3] text-[#181513] font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer"
              >
                Assinar como Fonoaudióloga
              </button>
            </div>
          )}

          {/* Quadro 1: Quadro Clínico & Consciência */}
          <div className="bg-[#181513] border border-[#2e2621] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#2e2621] pb-2">
              <h3 className="text-xs font-bold text-[#c8a88a] uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4" /> Quadro Clínico, Consciência & Respiração
              </h3>
              <span className="text-[11px] text-[#a69a8f]">Página 1 do Laudo</span>
            </div>
            <p className="text-xs text-[#f4efe8] leading-relaxed bg-[#201a17] p-3 rounded-lg border border-[#342b26]">
              {evolution.clinicalSummary || 'Nenhuma síntese clínica informada.'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded bg-[#201a17] border border-[#342b26]">
                <span className="text-[10px] text-[#85796f] block uppercase">Nível Consciência</span>
                <span className="text-[#f4efe8] font-semibold">{evolution.consciousness.join(', ') || 'Não avaliado'}</span>
              </div>
              <div className="p-2 rounded bg-[#201a17] border border-[#342b26]">
                <span className="text-[10px] text-[#85796f] block uppercase">Padrão Respiratório</span>
                <span className="text-[#f4efe8] font-semibold capitalize">{evolution.respiratoryPattern}</span>
              </div>
              <div className="p-2 rounded bg-[#201a17] border border-[#342b26]">
                <span className="text-[10px] text-[#85796f] block uppercase">Oxigênio</span>
                <span className="text-[#f4efe8] font-semibold capitalize">{evolution.oxygenSupport.replace('_', ' ')}</span>
              </div>
              <div className="p-2 rounded bg-[#201a17] border border-[#342b26]">
                <span className="text-[10px] text-[#85796f] block uppercase">Traqueostomia</span>
                <span className="text-[#f4efe8] font-semibold capitalize">{evolution.tqtType}</span>
              </div>
            </div>
          </div>

          {/* Quadro 2: Vias Alternativas, IDDSI & Escalas Clínicas */}
          <div className="bg-[#181513] border border-[#2e2621] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#2e2621] pb-2">
              <h3 className="text-xs font-bold text-[#c8a88a] uppercase tracking-wider flex items-center gap-2">
                <Utensils className="w-4 h-4" /> Vias de Alimentação, IDDSI, FOIS & PARD
              </h3>
              <span className="text-[11px] text-[#a69a8f]">Páginas 2 e 3 do Laudo</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[#201a17] border border-[#342b26]">
                <span className="text-[10px] text-[#85796f] uppercase block font-semibold">Alimentação Oral</span>
                <p className="text-sm font-bold text-[#f4efe8] capitalize mt-0.5">{evolution.oralFeedingModality.replace('_', ' ')}</p>
                {evolution.oralFeedingVolumeDetails && (
                  <p className="text-[11px] text-[#a69a8f] mt-1">{evolution.oralFeedingVolumeDetails}</p>
                )}
              </div>

              <div className="p-3 rounded-lg bg-[#201a17] border border-[#342b26]">
                <span className="text-[10px] text-[#85796f] uppercase block font-semibold">Via Alternativa</span>
                <p className="text-sm font-bold text-amber-300 mt-0.5">{evolution.alternativeRoute}</p>
                {evolution.alternativeRouteCaliber && (
                  <p className="text-[11px] text-[#a69a8f] mt-1">Calibre: {evolution.alternativeRouteCaliber}</p>
                )}
              </div>

              <div className="p-3 rounded-lg bg-[#201a17] border border-[#342b26]">
                <span className="text-[10px] text-[#85796f] uppercase block font-semibold">Classificação Funcional</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded bg-[#c8a88a] text-[#181513] font-bold text-xs">
                    FOIS {evolution.foisLevel}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#2c2420] text-[#c8a88a] font-mono text-xs border border-[#44372e]">
                    PARD {evolution.pardLevel}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#201a17] border border-[#342b26] text-xs space-y-1">
              <span className="text-[10px] text-[#85796f] uppercase font-semibold block">Consistências Liberadas (IDDSI)</span>
              <p className="text-[#f4efe8]">
                <strong>Alimentos:</strong> {evolution.iddsiFoods.length > 0 ? evolution.iddsiFoods.map(f => f.replace('nivel_', 'Nível ').replace(/_/g, ' ')).join(', ') : 'Nenhum'}
              </p>
              <p className="text-[#f4efe8]">
                <strong>Líquidos/Bebidas:</strong> {[...evolution.iddsiDrinksHigh, ...evolution.iddsiDrinksLow].length > 0 ? [...evolution.iddsiDrinksHigh, ...evolution.iddsiDrinksLow].map(d => d.replace('nivel_', 'Nível ').replace(/_/g, ' ')).join(', ') : 'Sem restrição'}
              </p>
              {evolution.thickenerUsed && (
                <p className="text-amber-300 text-[11px]">
                  • Espessante prescrito: {evolution.thickenerBrand || 'Sim'} ({evolution.thickenerDose || 'Dose padrão'})
                </p>
              )}
            </div>
          </div>

          {/* Quadro 3: Conduta Clínica da Sessão */}
          <div className="bg-[#181513] border border-[#2e2621] rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-bold text-[#c8a88a] uppercase tracking-wider">
              Conduta Terapêutica Aplicada na Sessão
            </h3>
            <p className="text-xs text-[#f4efe8] leading-relaxed bg-[#201a17] p-3 rounded-lg border border-[#342b26]">
              {evolution.sessionConductSummary || 'Nenhuma conduta detalhada informada.'}
            </p>
            {evolution.nextSessionFocus && (
              <p className="text-xs text-[#a69a8f] pt-1">
                <strong className="text-[#c8a88a]">Foco da Próxima Sessão:</strong> {evolution.nextSessionFocus}
              </p>
            )}
          </div>

          {/* ======================================================== */}
          {/* SEÇÃO DE AUDITORIA & CARIMBOS DE ASSINATURA DIGITAL DUPLA */}
          {/* ======================================================== */}
          <div className="bg-[#181513] border border-[#3a312c] rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-[#2e2621] pb-2">
              <h3 className="text-xs font-bold text-[#c8a88a] uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Registro Legal de Assinaturas Digitais Auditáveis
              </h3>
              <span className="text-[10px] text-[#85796f]">Conforme Lei 14.063/20 & CFM/CFFa</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Carimbo 1: Fonoaudióloga / Terapeuta */}
              <div className={`p-4 rounded-xl border ${
                evolution.therapistSignature 
                  ? 'bg-[#1e1916] border-emerald-800/40 text-[#f4efe8]' 
                  : 'bg-[#1b1714] border-dashed border-[#44362d] text-[#85796f]'
              } space-y-2`}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase font-bold text-[#c8a88a]">1. Fonoaudióloga Responsável</span>
                  {evolution.therapistSignature ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-400 border border-emerald-800/40 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Assinado
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-400 font-bold">Pendente</span>
                  )}
                </div>

                {evolution.therapistSignature ? (
                  <div className="space-y-1.5 text-xs">
                    <div className="h-16 flex items-center justify-center bg-white/95 rounded-lg p-2 border border-gray-300">
                      <img 
                        src={evolution.therapistSignature.signatureDataUrl} 
                        alt="Rubrica Fonoaudióloga" 
                        className="max-h-12 object-contain" 
                      />
                    </div>
                    <p className="font-bold text-[#f4efe8]">{evolution.therapistSignature.signerName}</p>
                    <p className="text-[11px] text-[#a69a8f]">{evolution.therapistSignature.signerDocument}</p>
                    <div className="text-[10px] text-[#85796f] space-y-0.5 pt-1 border-t border-[#2e2621] font-mono">
                      <p>Data/Hora: {new Date(evolution.therapistSignature.signedAt).toLocaleString('pt-BR')}</p>
                      <p>IP: {evolution.therapistSignature.ipAddress}</p>
                      <p className="truncate">Código: {evolution.therapistSignature.signatureId}</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-28 flex flex-col items-center justify-center text-center p-3 text-xs">
                    <p className="text-[#a69a8f]">Aguardando rubrica digital da Fonoaudióloga</p>
                    {canSignAsTherapist && (
                      <button
                        onClick={() => setShowSignPad(true)}
                        className="mt-2 px-3 py-1.5 rounded-lg bg-[#c8a88a] text-[#181513] font-bold text-xs"
                      >
                        Assinar Agora
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Carimbo 2: Paciente / Familiar / Cuidador */}
              <div className={`p-4 rounded-xl border ${
                evolution.responsibleSignature 
                  ? 'bg-[#1e1916] border-emerald-800/40 text-[#f4efe8]' 
                  : 'bg-[#1b1714] border-dashed border-[#44362d] text-[#85796f]'
              } space-y-2`}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase font-bold text-[#c8a88a]">2. Paciente / Responsável Legal</span>
                  {evolution.responsibleSignature ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-400 border border-emerald-800/40 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Assinado
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-400 font-bold">Pendente</span>
                  )}
                </div>

                {evolution.responsibleSignature ? (
                  <div className="space-y-1.5 text-xs">
                    <div className="h-16 flex items-center justify-center bg-white/95 rounded-lg p-2 border border-gray-300">
                      <img 
                        src={evolution.responsibleSignature.signatureDataUrl} 
                        alt="Rubrica do Familiar" 
                        className="max-h-12 object-contain" 
                      />
                    </div>
                    <p className="font-bold text-[#f4efe8]">{evolution.responsibleSignature.signerName}</p>
                    <p className="text-[11px] text-[#a69a8f]">{evolution.responsibleSignature.signerDocument}</p>
                    <div className="text-[10px] text-[#85796f] space-y-0.5 pt-1 border-t border-[#2e2621] font-mono">
                      <p>Data/Hora: {new Date(evolution.responsibleSignature.signedAt).toLocaleString('pt-BR')}</p>
                      <p>IP: {evolution.responsibleSignature.ipAddress}</p>
                      <p className="truncate">Código: {evolution.responsibleSignature.signatureId}</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-28 flex flex-col items-center justify-center text-center p-3 text-xs">
                    <p className="text-[#a69a8f]">
                      {evolution.status === 'rascunho' 
                        ? 'Ficará disponível após a assinatura da Fonoaudióloga' 
                        : 'Aguardando conferência e assinatura do Familiar'}
                    </p>
                    {canSignAsResponsible && (
                      <button
                        onClick={() => setShowSignPad(true)}
                        className="mt-2 px-3 py-1.5 rounded-lg bg-[#c8a88a] text-[#181513] font-bold text-xs"
                      >
                        Conferir & Assinar
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer com Botões de Ação */}
        <div className="p-4 sm:p-5 border-t border-[#342b26] bg-[#181513] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-[#a69a8f]">
            {isFullySigned ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Relatório liberado para download em papel timbrado.
              </span>
            ) : (
              <span>O PDF oficial com papel timbrado requer as duas assinaturas para emissão.</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-end sm:self-center">
            {canSignAsResponsible && (
              <button
                type="button"
                onClick={() => {
                  setSignAsRole('cuidador');
                  setShowSignPad(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2a221d] hover:bg-[#382f2a] text-[#c8a88a] border border-[#524134] font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Assinar como Familiar</span>
              </button>
            )}

            {canSignAsTherapist && (
              <button
                type="button"
                onClick={() => {
                  setSignAsRole('fonoaudiologo');
                  setShowSignPad(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#c8a88a] hover:bg-[#d6bca3] text-[#181513] font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Assinar como Fonoaudióloga</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={!isFullySigned}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isFullySigned 
                  ? 'bg-[#2a221d] hover:bg-[#382f2a] text-[#c8a88a] border border-[#524134] cursor-pointer' 
                  : 'bg-[#181513] text-[#554b42] border border-[#2a221d] cursor-not-allowed opacity-60'
              }`}
              title={isFullySigned ? 'Baixar laudo em PDF' : 'Disponível após as 2 assinaturas'}
            >
              <FileDown className="w-4 h-4" />
              <span>Emitir Laudo em PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Pad de Assinatura */}
      {showSignPad && (
        <SignaturePadModal
          isOpen={showSignPad}
          onClose={() => setShowSignPad(false)}
          title={signAsRole === 'fonoaudiologo' ? 'Assinatura da Fonoaudióloga' : 'Assinatura do Paciente / Responsável'}
          subtitle={`Confirmação de atendimento prestado ao paciente ${patient.name}`}
          signerName={signAsRole === 'cuidador' && isMasterUser ? (patient.guardianName || 'Responsável pelo Paciente (Master Teste)') : currentUser.name}
          signerRole={signAsRole}
          signerDocument={signAsRole === 'fonoaudiologo' ? (currentUser.crfaNumber || 'CREFONO 9531-RJ') : (patient.cpf || 'CPF 341.892.408-11')}
          signerEmail={currentUser.email}
          defaultSignatureUrl={signAsRole === 'fonoaudiologo' ? clinicConfig.signatureUrl : undefined}
          onConfirmSignature={handleSignatureConfirmed}
        />
      )}
    </div>
  );
};
