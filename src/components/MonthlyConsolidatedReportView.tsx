import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Calendar, 
  TrendingUp, 
  Activity, 
  Award, 
  ShieldCheck, 
  Download, 
  Printer, 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  Utensils,
  Layers,
  HeartPulse,
  User,
  Filter,
  Edit3,
  X
} from 'lucide-react';
import { Patient, UserProfile } from '../types';
import { OfficialEvolutionData, FOIS_LEVELS_INFO, PARD_LEVELS_INFO } from '../types/clinicalEvolution';
import { ClinicConfig, DEFAULT_CLINIC_CONFIG, getEffectiveTherapistProfile } from '../types/clinicConfig';
import { SignaturePadModal } from './SignaturePadModal';
import { createDigitalSignature } from '../utils/signatureAudit';
import { generateMonthlyConsolidatedPDF } from '../utils/monthlyPdfGenerator';

interface MonthlyConsolidatedReportViewProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
  officialEvolutions: OfficialEvolutionData[];
  currentUser: UserProfile;
  clinicConfig?: ClinicConfig;
}

export const MonthlyConsolidatedReportView: React.FC<MonthlyConsolidatedReportViewProps> = ({
  patients,
  selectedPatient,
  onSelectPatient,
  officialEvolutions = [],
  currentUser,
  clinicConfig = DEFAULT_CLINIC_CONFIG
}) => {
  const profile = getEffectiveTherapistProfile(null, clinicConfig);

  // Mês de referência padrão: Mês atual (ex: 2026-09)
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });

  const [activePatient, setActivePatient] = useState<Patient | null>(selectedPatient);
  const [generalNotes, setGeneralNotes] = useState<string>('');
  const [showSignPad, setShowSignPad] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [signedData, setSignedData] = useState<any | null>(null);

  // Filtra evoluções pelo paciente selecionado e pelo mês selecionado (YYYY-MM)
  const monthlyEvolutions = useMemo(() => {
    if (!activePatient) return [];
    return officialEvolutions
      .filter(evo => {
        if (evo.patientId !== activePatient.id) return false;
        return evo.sessionDate.startsWith(selectedMonth);
      })
      .sort((a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime());
  }, [officialEvolutions, activePatient, selectedMonth]);

  const firstEvo = monthlyEvolutions[0];
  const lastEvo = monthlyEvolutions[monthlyEvolutions.length - 1];

  const foisProgress = firstEvo && lastEvo ? lastEvo.foisLevel - firstEvo.foisLevel : 0;

  // Meses disponíveis para seleção com base nas evoluções gravadas
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    const now = new Date();
    monthsSet.add(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
    
    officialEvolutions.forEach(evo => {
      if (evo.sessionDate && evo.sessionDate.length >= 7) {
        monthsSet.add(evo.sessionDate.substring(0, 7));
      }
    });

    return Array.from(monthsSet).sort().reverse();
  }, [officialEvolutions]);

  // Handler de confirmação da rubrica / assinatura digital da fonoaudióloga
  const handleConfirmSignature = async (signatureDataUrl: string) => {
    setIsGenerating(true);
    try {
      const sigInfo = await createDigitalSignature({
        evolutionId: `monthly_${activePatient?.id}_${selectedMonth}`,
        patientId: activePatient?.id || 'pat_default',
        sessionDate: `${selectedMonth}-28`,
        signerName: profile.name,
        signerRole: 'fonoaudiologo',
        signerDocument: profile.crfa,
        signerEmail: profile.email,
        signatureDataUrl
      });

      setSignedData(sigInfo);
      setShowSignPad(false);

      // Gera e descarrega automaticamente o PDF consolidado
      if (activePatient) {
        generateMonthlyConsolidatedPDF({
          patient: activePatient,
          selectedMonth,
          evolutions: monthlyEvolutions,
          clinicConfig,
          generalNotes,
          therapistSignature: sigInfo
        });
      }
    } catch (err) {
      console.error('Erro ao emitir relatório mensal assinado:', err);
      alert('Houve um erro ao processar a assinatura digital.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenPreview = () => {
    if (!activePatient) {
      alert('Por favor, selecione um paciente.');
      return;
    }
    if (monthlyEvolutions.length === 0) {
      alert('Não existem evoluções fonoaudiológicas registradas para este paciente no mês selecionado.');
      return;
    }
    setShowPreviewModal(true);
  };

  const handleProceedToSign = () => {
    setShowPreviewModal(false);
    setShowSignPad(true);
  };

  return (
    <div className="space-y-6">
      {/* Header do Módulo */}
      <div className="bg-[#1f1a17] border border-[#382e27] p-5 sm:p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#c8a88a]/20 border border-[#c8a88a]/40 flex items-center justify-center text-[#c8a88a] shadow-inner">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#c8a88a]/20 text-[#c8a88a] border border-[#c8a88a]/30">
                Consolidação Periódica Oficial
              </span>
              <span className="text-xs text-[#a69a8f] font-mono">Modelo Mensal Agregado</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#f4efe8] mt-1">
              Relatório de Acompanhamento Mensal Consolidado
            </h1>
            <p className="text-xs text-[#a69a8f]">
              Agregação cronológica de sessões, gráficos de curva funcional e quadro de auditoria legal para a Fonoaudióloga Responsável.
            </p>
          </div>
        </div>

        {/* Seletor de Mês & Ação de Download */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-1.5">
            <Calendar className="w-4 h-4 text-[#c8a88a]" />
            <span className="text-xs text-[#a69a8f]">Mês de Referência:</span>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#f4efe8] focus:outline-none cursor-pointer"
            >
              {availableMonths.map(m => {
                const [y, mon] = m.split('-');
                const dateObj = new Date(parseInt(y), parseInt(mon) - 1, 1);
                const label = dateObj.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                return (
                  <option key={m} value={m} className="bg-[#221d1a] text-[#f4efe8]">
                    {label.charAt(0).toUpperCase() + label.slice(1)}
                  </option>
                );
              })}
            </select>
          </div>

          <button
            type="button"
            onClick={handleOpenPreview}
            disabled={monthlyEvolutions.length === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer ${
              monthlyEvolutions.length > 0
                ? 'bg-[#c8a88a] hover:bg-[#d6bca3] text-[#181513]'
                : 'bg-[#2a221d] text-[#6d5f53] border border-[#3d322b] cursor-not-allowed opacity-60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Visualizar Relatório & Assinar</span>
          </button>
        </div>
      </div>

      {/* Seletor Rápido de Pacientes */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <span className="text-xs text-[#85796f] font-semibold uppercase tracking-wider shrink-0 mr-1">
          Paciente:
        </span>
        {patients.map(p => (
          <button
            key={p.id}
            onClick={() => {
              setActivePatient(p);
              onSelectPatient(p);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              activePatient?.id === p.id
                ? 'bg-[#c8a88a] text-[#181513] font-bold shadow-xs'
                : 'bg-[#221d1a] text-[#a69a8f] hover:text-[#f4efe8] border border-[#382e27]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{p.name}</span>
          </button>
        ))}
      </div>

      {/* Estado Vazio caso não haja sessões no mês */}
      {monthlyEvolutions.length === 0 ? (
        <div className="bg-[#1f1a17] border border-[#382e27] rounded-2xl p-10 text-center space-y-3">
          <Clock className="w-10 h-10 text-[#c8a88a] mx-auto opacity-40" />
          <h3 className="text-base font-bold font-serif text-[#f4efe8]">
            Nenhuma sessão registrada em {selectedMonth} para {activePatient?.name || 'este paciente'}
          </h3>
          <p className="text-xs text-[#a69a8f] max-w-md mx-auto">
            Para gerar a consolidação periódica, registre evoluções no Prontuário Eletrônico (PEP) com datas pertencentes ao mês selecionado.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ======================================================== */}
          {/* 1. CARDS DE DESEMPENHO E COMPARAÇÃO INICIAL VS FINAL    */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#1f1a17] border border-[#382e27] shadow-sm">
              <span className="text-[10px] text-[#c8a88a] uppercase font-bold tracking-wider block">
                Total de Sessões no Mês
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono text-[#f4efe8]">
                  {monthlyEvolutions.length}
                </span>
                <span className="text-xs text-[#a69a8f]">atendimentos</span>
              </div>
              <p className="text-[11px] text-[#a69a8f] mt-1">
                Primeira: {new Date(firstEvo.sessionDate).toLocaleDateString('pt-BR')} • Última: {new Date(lastEvo.sessionDate).toLocaleDateString('pt-BR')}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#1f1a17] border border-[#382e27] shadow-sm">
              <span className="text-[10px] text-[#c8a88a] uppercase font-bold tracking-wider block">
                Evolução Escala FOIS
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono text-[#f4efe8]">
                  Nível {firstEvo.foisLevel} ➔ {lastEvo.foisLevel}
                </span>
              </div>
              <p className={`text-[11px] mt-1 font-semibold flex items-center gap-1 ${
                foisProgress >= 0 ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                <TrendingUp className="w-3.5 h-3.5" />
                {foisProgress > 0 
                  ? `+${foisProgress} níveis na escala (Melhora clínica)` 
                  : 'Manutenção da ingestão funcional'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#1f1a17] border border-[#382e27] shadow-sm">
              <span className="text-[10px] text-[#c8a88a] uppercase font-bold tracking-wider block">
                Classificação PARD
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono text-[#f4efe8]">
                  Grau {firstEvo.pardLevel} ➔ {lastEvo.pardLevel}
                </span>
              </div>
              <p className="text-[11px] text-[#a69a8f] mt-1">
                {PARD_LEVELS_INFO.find(p => p.level === lastEvo.pardLevel)?.desc}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#1f1a17] border border-[#382e27] shadow-sm">
              <span className="text-[10px] text-[#c8a88a] uppercase font-bold tracking-wider block">
                Via de Alimentação
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg font-bold text-[#f4efe8] capitalize">
                  {lastEvo.oralFeedingModality.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-[11px] text-[#a69a8f] mt-1">
                Via alternativa: <strong className="text-amber-300">{lastEvo.alternativeRoute}</strong>
              </p>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 2. GRÁFICO VISUAL DE BARRAS DE PROGREÇÃO FOIS            */}
          {/* ======================================================== */}
          <div className="bg-[#1f1a17] border border-[#382e27] rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#332a24] gap-2">
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-5 h-5 text-[#c8a88a]" />
                <div>
                  <h3 className="text-sm font-bold text-[#f4efe8]">
                    Curva Evolutiva de Deglutição (Escala FOIS) no Mês
                  </h3>
                  <p className="text-xs text-[#a69a8f]">
                    Acompanhamento sessão a sessão do nível de segurança da ingestão por via oral.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#c8a88a] bg-[#27211d] px-3 py-1 rounded-lg border border-[#3a3028]">
                <span>Nível Inicial: {firstEvo.foisLevel}</span>
                <span>➔</span>
                <span>Nível Final: {lastEvo.foisLevel}</span>
              </div>
            </div>

            {/* Gráfico de Barras Responsivo */}
            <div className="pt-2">
              <div className="relative h-44 border-b border-l border-[#3a312c] flex items-end justify-around px-4 gap-2 sm:gap-6">
                {/* Linhas de fundo de referência FOIS 1 a 7 */}
                {[1, 2, 3, 4, 5, 6, 7].map(lvl => (
                  <div
                    key={lvl}
                    className="absolute left-0 right-0 border-t border-[#2e2621] pointer-events-none flex items-center justify-start"
                    style={{ bottom: `${(lvl / 7) * 100}%` }}
                  >
                    <span className="text-[9px] text-[#85796f] -translate-y-1/2 -translate-x-5 font-mono">
                      N{lvl}
                    </span>
                  </div>
                ))}

                {/* Barras de cada sessão */}
                {monthlyEvolutions.map((evo, idx) => {
                  const percent = (evo.foisLevel / 7) * 100;
                  return (
                    <div
                      key={evo.id}
                      className="flex-1 flex flex-col items-center justify-end z-10 group relative max-w-[60px]"
                    >
                      {/* Tooltip com dados completos da sessão */}
                      <div className="absolute -top-12 hidden group-hover:flex flex-col items-center bg-[#2b2420] border border-[#44362d] px-2.5 py-1 rounded-lg shadow-xl text-[10px] text-[#f4efe8] whitespace-nowrap z-20">
                        <span className="font-bold">FOIS Nível {evo.foisLevel} (PARD {evo.pardLevel})</span>
                        <span className="text-[#a69a8f]">{new Date(evo.sessionDate).toLocaleDateString('pt-BR')}</span>
                      </div>

                      {/* Valor do nível */}
                      <span className="text-xs font-bold text-[#c8a88a] mb-1 font-mono">
                        {evo.foisLevel}
                      </span>

                      {/* Barra */}
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-[#8c735d] to-[#c8a88a] shadow-md transition-all group-hover:brightness-110"
                        style={{ height: `${percent}%` }}
                      />

                      {/* Data no rodapé */}
                      <span className="text-[10px] text-[#a69a8f] mt-2 font-mono whitespace-nowrap">
                        {new Date(evo.sessionDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 3. HISTÓRICO CRONOLÓGICO ORGANIZADO PELOS 4 MÓDULOS      */}
          {/* ======================================================== */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#342b26]">
              <h3 className="text-sm font-bold font-serif text-[#f4efe8] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#c8a88a]" />
                Histórico Cronológico Detalhado das Sessões (4 Módulos)
              </h3>
              <span className="text-xs text-[#a69a8f]">
                {monthlyEvolutions.length} sessões analisadas
              </span>
            </div>

            {monthlyEvolutions.map((evo, idx) => (
              <div
                key={evo.id}
                className="p-5 rounded-2xl bg-[#1f1a17] border border-[#382e27] space-y-4 hover:border-[#4d4036] transition-all shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#2d241f] gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#2a221d] text-[#c8a88a] font-bold text-xs flex items-center justify-center border border-[#3e322a]">
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#f4efe8]">
                          Sessão de Atendimento Fonoaudiológico
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#c8a88a]/20 text-[#c8a88a] border border-[#c8a88a]/30">
                          {new Date(evo.sessionDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-xs text-[#a69a8f]">
                        Fonoaudióloga: <strong className="text-[#f4efe8]">{evo.therapistName}</strong> ({evo.therapistCrfa})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-[#2a221e] text-amber-300 border border-amber-500/30 font-bold">
                      FOIS {evo.foisLevel}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-[#2a221e] text-[#c8a88a] border border-[#42362f] font-mono">
                      PARD {evo.pardLevel}
                    </span>
                  </div>
                </div>

                {/* 4 Módulos Estruturados */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {/* Módulo 1 */}
                  <div className="p-3 rounded-xl bg-[#181513] border border-[#2c231e]">
                    <span className="text-[10px] text-[#c8a88a] uppercase font-bold tracking-wider block mb-1">
                      Módulo 1: Consciência & Respiração
                    </span>
                    <p className="text-[#f4efe8] font-medium capitalize">
                      {evo.consciousness.join(', ') || 'Lúcido'}
                    </p>
                    <p className="text-[#a69a8f] text-[11px] mt-0.5">
                      {evo.respiratoryPattern} • O2: {evo.oxygenSupport.replace('_', ' ')}
                    </p>
                  </div>

                  {/* Módulo 2 */}
                  <div className="p-3 rounded-xl bg-[#181513] border border-[#2c231e]">
                    <span className="text-[10px] text-[#c8a88a] uppercase font-bold tracking-wider block mb-1">
                      Módulo 2: Vias & Consistências
                    </span>
                    <p className="text-[#f4efe8] font-medium">
                      VO: {evo.oralFeedingModality.replace('_', ' ')}
                    </p>
                    <p className="text-[#a69a8f] text-[11px] mt-0.5 truncate">
                      Via Alternativa: {evo.alternativeRoute}
                    </p>
                  </div>

                  {/* Módulo 3 */}
                  <div className="p-3 rounded-xl bg-[#181513] border border-[#2c231e]">
                    <span className="text-[10px] text-[#c8a88a] uppercase font-bold tracking-wider block mb-1">
                      Módulo 3: Líquidos & Espessante
                    </span>
                    <p className="text-[#f4efe8] font-medium">
                      {evo.thickenerUsed ? `Espessante: ${evo.thickenerBrand || 'Sim'}` : 'Líquidos Livres'}
                    </p>
                    <p className="text-[#a69a8f] text-[11px] mt-0.5 truncate">
                      {evo.thickenerDose || 'Dose padrão'}
                    </p>
                  </div>

                  {/* Módulo 4 */}
                  <div className="p-3 rounded-xl bg-[#181513] border border-[#2c231e]">
                    <span className="text-[10px] text-[#c8a88a] uppercase font-bold tracking-wider block mb-1">
                      Módulo 4: Recursos Terapêuticos
                    </span>
                    <p className="text-[#f4efe8] font-medium">
                      {evo.treatmentFrequency || '2x por semana'}
                    </p>
                    <p className="text-[#a69a8f] text-[11px] mt-0.5">
                      {evo.therapies.filter(t => t.applied).length} recurso(s) aplicados
                    </p>
                  </div>
                </div>

                {/* Síntese da Conduta Clínica */}
                <div className="p-3.5 rounded-xl bg-[#181513] border border-[#2c231e] text-xs">
                  <span className="text-[10px] uppercase font-bold text-[#c8a88a] tracking-wider block mb-1">
                    Conduta Clínica da Sessão
                  </span>
                  <p className="text-[#d8cec4] leading-relaxed whitespace-pre-line">
                    {evo.sessionConductSummary || evo.clinicalSummary}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ======================================================== */}
          {/* 4. CAMPO DE OBSERVAÇÕES GERAIS DA FONOAUDIÓLOGA          */}
          {/* ======================================================== */}
          <div className="p-5 rounded-2xl bg-[#1f1a17] border border-[#382e27] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase font-bold text-[#c8a88a] tracking-wider flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                Observações Gerais da Fonoaudióloga (Aparece no Final do Relatório)
              </label>
              <span className="text-[11px] text-[#85796f]">Texto livre editável pré-assinatura</span>
            </div>
            <textarea
              rows={4}
              placeholder="Digite aqui observações adicionais sobre a evolução geral do paciente no mês, orientações para os familiares/cuidadores, intercorrências clínicas, agendamento de retorno ou metas para o próximo mês..."
              value={generalNotes}
              onChange={e => setGeneralNotes(e.target.value)}
              className="w-full bg-[#181513] border border-[#3e342e] rounded-xl p-3.5 text-xs text-[#f4efe8] outline-none focus:border-[#c8a88a] leading-relaxed"
            />
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleOpenPreview}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c8a88a] hover:bg-[#d6bca3] text-[#181513] font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Visualizar Relatório Completo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE PRÉ-VISUALIZAÇÃO COMPLETA DO RELATÓRIO ANTES DA ASSINATURA */}
      {showPreviewModal && activePatient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#1f1a17] border border-[#3e342e] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in duration-200">
            {/* Header do Preview */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#342b26] bg-[#181513]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#c8a88a]/20 border border-[#c8a88a]/40 flex items-center justify-center text-[#c8a88a]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#f4efe8] font-serif">
                    Conferência Prévia do Relatório Mensal ({selectedMonth})
                  </h3>
                  <p className="text-xs text-[#a69a8f]">
                    Paciente: <strong className="text-[#f4efe8]">{activePatient.name}</strong> • Revise todos os dados antes de apor sua rubrica digital
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1.5 rounded-xl bg-[#2a221d] text-[#a69a8f] hover:text-[#f4efe8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Corpo com visualização fiel */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-[#181513] border border-[#2e2621] space-y-2">
                <h4 className="font-bold text-[#c8a88a] uppercase text-[11px] tracking-wider">
                  1. Indicadores de Desempenho & Comparativo
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 rounded bg-[#201a17] border border-[#342b26]">
                    <span className="text-[10px] text-[#85796f] block uppercase">Sessões Totais</span>
                    <span className="text-[#f4efe8] font-bold text-sm">{monthlyEvolutions.length}</span>
                  </div>
                  <div className="p-2.5 rounded bg-[#201a17] border border-[#342b26]">
                    <span className="text-[10px] text-[#85796f] block uppercase">FOIS Inicial ➔ Final</span>
                    <span className="text-[#f4efe8] font-bold text-sm">Nível {firstEvo?.foisLevel} ➔ Nível {lastEvo?.foisLevel}</span>
                  </div>
                  <div className="p-2.5 rounded bg-[#201a17] border border-[#342b26]">
                    <span className="text-[10px] text-[#85796f] block uppercase">Classificação PARD</span>
                    <span className="text-[#f4efe8] font-bold text-sm">Grau {lastEvo?.pardLevel}</span>
                  </div>
                  <div className="p-2.5 rounded bg-[#201a17] border border-[#342b26]">
                    <span className="text-[10px] text-[#85796f] block uppercase">Via de Alimentação</span>
                    <span className="text-[#f4efe8] font-bold text-sm capitalize">{lastEvo?.oralFeedingModality.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              </div>

              {/* Cronologia Resumida */}
              <div className="p-4 rounded-xl bg-[#181513] border border-[#2e2621] space-y-2">
                <h4 className="font-bold text-[#c8a88a] uppercase text-[11px] tracking-wider">
                  2. Sessões Cronológicas que Integrarão o Laudo
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {monthlyEvolutions.map((evo, i) => (
                    <div key={evo.id} className="p-2.5 rounded-lg bg-[#201a17] border border-[#342b26] flex items-center justify-between">
                      <div>
                        <span className="font-bold text-[#f4efe8]">Sessão #{i + 1} - {new Date(evo.sessionDate).toLocaleDateString('pt-BR')}</span>
                        <p className="text-[11px] text-[#a69a8f] line-clamp-1">{evo.sessionConductSummary || evo.clinicalSummary}</p>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-amber-400 bg-[#2d241f] px-2 py-0.5 rounded border border-amber-600/30 shrink-0">
                        FOIS {evo.foisLevel}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Observações Gerais */}
              <div className="p-4 rounded-xl bg-[#181513] border border-[#2e2621] space-y-1.5">
                <h4 className="font-bold text-[#c8a88a] uppercase text-[11px] tracking-wider">
                  3. Observações Gerais & Metas para o Próximo Mês
                </h4>
                <p className="text-[#f4efe8] bg-[#201a17] p-3 rounded-lg border border-[#342b26] whitespace-pre-line leading-relaxed">
                  {generalNotes.trim() || 'Nenhuma observação geral adicional informada. O relatório será emitido com as condutas consolidadas de cada sessão.'}
                </p>
              </div>
            </div>

            {/* Footer do Preview com Botão de Avanço para Assinatura */}
            <div className="p-4 sm:p-5 border-t border-[#342b26] bg-[#181513] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-[#a69a8f]">
                Revise os dados acima. Se estiver tudo correto, prossiga para a assinatura digital.
              </div>
              <div className="flex items-center gap-2.5 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#27211d] hover:bg-[#342b26] text-[#a69a8f] font-semibold text-xs border border-[#3a312c] cursor-pointer"
                >
                  Voltar e Editar
                </button>
                <button
                  type="button"
                  onClick={handleProceedToSign}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c8a88a] hover:bg-[#d6bca3] text-[#181513] font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirmar & Assinar Digitalmente</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pad de Assinatura Exclusiva da Fonoaudióloga Responsável */}
      {showSignPad && activePatient && (
        <SignaturePadModal
          isOpen={showSignPad}
          onClose={() => setShowSignPad(false)}
          title="Assinatura da Fonoaudióloga Responsável"
          subtitle={`Emissão do Relatório Mensal Consolidado (${selectedMonth}) do paciente ${activePatient.name}`}
          signerName={profile.name}
          signerRole="fonoaudiologo"
          signerDocument={profile.crfa}
          signerEmail={profile.email}
          defaultSignatureUrl={clinicConfig.signatureUrl}
          onConfirmSignature={handleConfirmSignature}
        />
      )}
    </div>
  );
};
