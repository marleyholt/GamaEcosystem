import React, { useState } from 'react';
import { 
  OfficialEvolutionData, 
  ConsciousnessLevel, 
  OxygenSupport, 
  TqtType, 
  SuctionType, 
  CervicalAuscultation, 
  LanguageAspect, 
  CommunicationDiagnosis, 
  OralFeedingModality, 
  AlternativeRoute, 
  IddsiFoodLevel, 
  IddsiDrinkLevel, 
  FOIS_LEVELS_INFO, 
  PARD_LEVELS_INFO 
} from '../types/clinicalEvolution';
import { Patient } from '../types';
import { ClinicConfig, Therapist, getEffectiveTherapistProfile } from '../types/clinicConfig';
import { OfficialLetterhead } from './OfficialLetterhead';
import { SignaturePadModal } from './SignaturePadModal';
import { createDigitalSignature } from '../utils/signatureAudit';
import { 
  Save, 
  Printer, 
  Copy, 
  Check, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  FileCheck, 
  Clock, 
  ShieldAlert, 
  HeartPulse, 
  Utensils, 
  Layers, 
  Flame, 
  Info,
  Calendar,
  User,
  ArrowUpRight,
  TrendingUp,
  Award,
  ShieldCheck
} from 'lucide-react';

interface OfficialEvolutionFormProps {
  patient: Patient;
  clinicConfig: ClinicConfig;
  currentTherapist?: Therapist | null;
  previousEvolutions?: OfficialEvolutionData[];
  onSaveEvolution: (data: OfficialEvolutionData) => void;
  onCancel?: () => void;
}

export const OfficialEvolutionForm: React.FC<OfficialEvolutionFormProps> = ({
  patient,
  clinicConfig,
  currentTherapist,
  previousEvolutions = [],
  onSaveEvolution,
  onCancel
}) => {
  const profile = getEffectiveTherapistProfile(currentTherapist, clinicConfig);
  const [activePage, setActivePage] = useState<1 | 2 | 3 | 4>(1);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Última evolução para preenchimento com 1 clique (redução de trabalho braçal)
  const lastEvolution = previousEvolutions[previousEvolutions.length - 1];

  // Estado Principal com TODOS os campos das 4 Páginas Oficiais
  const [formData, setFormData] = useState<OfficialEvolutionData>({
    id: `evo_${Date.now()}`,
    patientId: patient.id,
    sessionDate: new Date().toISOString().split('T')[0],
    therapistId: currentTherapist?.id || 'rt_default',
    therapistName: profile.name,
    therapistCrfa: profile.crfa,
    status: 'rascunho',

    // PÁGINA 1
    clinicalSummary: '',
    consciousness: ['lucido', 'orientado'],
    canMakeDecisions: true,
    decisionNotes: '',
    respiratoryPattern: 'eupneico',
    oxygenSupport: 'ar_ambiente',
    oxygenFlowLiters: '',
    tqtType: 'nenhuma',
    tqtCaliber: '',
    suction: 'ausente',
    mechanicalVentilation: false,
    mechanicalVentilationMode: '',
    cervicalAuscultation: 'limpa',
    languageAspects: ['compreensao_preservada', 'expressao_preservada'],
    communicationDiagnosis: ['sem_alteracao'],
    communicationNotes: '',
    oralFeedingModality: 'vo_conforto',
    oralFeedingVolumeDetails: '',

    // PÁGINA 2
    alternativeRoute: 'nenhuma',
    alternativeRouteCaliber: '',
    alternativeRouteNotes: '',
    iddsiFoods: ['nivel_4_pure'],
    iddsiDrinksHigh: ['nivel_3_moderadamente_espesso'],

    // PÁGINA 3
    iddsiDrinksLow: ['nivel_2_pouco_espesso'],
    thickenerUsed: false,
    thickenerBrand: '',
    thickenerDose: '',
    foisLevel: 4,
    foisJustification: '',
    pardLevel: 'IV',
    pardDescription: '',

    // PÁGINA 4
    therapies: [
      { name: 'laser', applied: false, objective: '', techniqueOrParams: '' },
      { name: 'eletroestimulacao', applied: false, objective: '', techniqueOrParams: '' },
      { name: 'neuromodulacao', applied: false, objective: '', techniqueOrParams: '' },
      { name: 'bandagem', applied: false, objective: '', techniqueOrParams: '' }
    ],
    treatmentFrequency: '2x por semana',
    sessionConductSummary: '',
    nextSessionFocus: '',
    createdAt: new Date().toISOString()
  });

  // Função Eficiente: Carregar dados da última sessão (redução de 85% do tempo de digitação)
  const handleCopyLastSession = () => {
    if (!lastEvolution) return;
    setFormData({
      ...lastEvolution,
      id: `evo_${Date.now()}`,
      sessionDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      therapistName: profile.name,
      therapistCrfa: profile.crfa
    });
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 3000);
  };

  const handleToggleConsciousness = (item: ConsciousnessLevel) => {
    setFormData(prev => ({
      ...prev,
      consciousness: prev.consciousness.includes(item)
        ? prev.consciousness.filter(c => c !== item)
        : [...prev.consciousness, item]
    }));
  };

  const handleToggleLanguage = (item: LanguageAspect) => {
    setFormData(prev => ({
      ...prev,
      languageAspects: prev.languageAspects.includes(item)
        ? prev.languageAspects.filter(l => l !== item)
        : [...prev.languageAspects, item]
    }));
  };

  const handleToggleCommunication = (item: CommunicationDiagnosis) => {
    setFormData(prev => ({
      ...prev,
      communicationDiagnosis: prev.communicationDiagnosis.includes(item)
        ? prev.communicationDiagnosis.filter(c => c !== item)
        : [...prev.communicationDiagnosis, item]
    }));
  };

  const handleToggleFoodIddsi = (item: IddsiFoodLevel) => {
    setFormData(prev => ({
      ...prev,
      iddsiFoods: prev.iddsiFoods.includes(item)
        ? prev.iddsiFoods.filter(f => f !== item)
        : [...prev.iddsiFoods, item]
    }));
  };

  const handleToggleDrinkHigh = (item: IddsiDrinkLevel) => {
    setFormData(prev => ({
      ...prev,
      iddsiDrinksHigh: prev.iddsiDrinksHigh.includes(item)
        ? prev.iddsiDrinksHigh.filter(d => d !== item)
        : [...prev.iddsiDrinksHigh, item]
    }));
  };

  const handleToggleDrinkLow = (item: IddsiDrinkLevel) => {
    setFormData(prev => ({
      ...prev,
      iddsiDrinksLow: prev.iddsiDrinksLow.includes(item)
        ? prev.iddsiDrinksLow.filter(d => d !== item)
        : [...prev.iddsiDrinksLow, item]
    }));
  };

  const handleUpdateTherapy = (index: number, updates: Partial<typeof formData.therapies[0]>) => {
    const updated = [...formData.therapies];
    updated[index] = { ...updated[index], ...updates };
    setFormData(prev => ({ ...prev, therapies: updated }));
  };

  const [showSignModal, setShowSignModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clinicalSummary.trim() && !formData.sessionConductSummary.trim()) {
      alert('Por favor, preencha pelo menos a síntese clínica ou a conduta da sessão.');
      return;
    }
    onSaveEvolution(formData);
  };

  const handleOpenSignatureModal = () => {
    if (!formData.clinicalSummary.trim() && !formData.sessionConductSummary.trim()) {
      alert('Por favor, preencha a síntese clínica ou conduta da sessão antes de assinar.');
      return;
    }
    setShowSignModal(true);
  };

  const handleConfirmTherapistSignature = async (signatureDataUrl: string) => {
    try {
      const sigInfo = await createDigitalSignature({
        evolutionId: formData.id,
        patientId: patient.id,
        sessionDate: formData.sessionDate,
        signerName: profile.name,
        signerRole: 'fonoaudiologo',
        signerDocument: profile.crfa,
        signerEmail: profile.email,
        signatureDataUrl
      });

      const signedEvolution: OfficialEvolutionData = {
        ...formData,
        therapistSignature: sigInfo,
        status: 'aguardando_familiar'
      };

      setFormData(signedEvolution);
      onSaveEvolution(signedEvolution);
      setShowSignModal(false);
    } catch (err) {
      console.error('Erro ao assinar evolução:', err);
      alert('Erro ao registrar assinatura digital da fonoaudióloga.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header com Ações de Produtividade */}
      <div className="bg-[#1f1a17] border border-[#382e27] p-5 sm:p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#c8a88a]/20 border border-[#c8a88a]/40 flex items-center justify-center text-[#c8a88a] shadow-inner">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#c8a88a]/20 text-[#c8a88a] border border-[#c8a88a]/30">
                Modelo Oficial Fonoaudiológico GAMA
              </span>
              <span className="text-xs text-[#a69a8f] font-mono">4 Módulos Integrados</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#f4efe8] mt-1">
              Evolução Clínica de Deglutição & Comunicação
            </h1>
            <p className="text-xs text-[#a69a8f]">
              Paciente: <strong className="text-[#f4efe8]">{patient.name}</strong> • Terapeuta: <span className="text-[#c8a88a]">{profile.name} ({profile.crfa})</span>
            </p>
          </div>
        </div>

        {/* Botões de Aceleração e Produtividade */}
        <div className="flex flex-wrap items-center gap-2.5">
          {lastEvolution && (
            <button
              type="button"
              onClick={handleCopyLastSession}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#2a221d] hover:bg-[#382f2a] text-[#c8a88a] border border-[#44362d] text-xs font-semibold transition-all cursor-pointer shadow-xs"
              title="Carrega os dados e parâmetros da última sessão para você apenas atualizar as alterações"
            >
              <Copy className="w-4 h-4" />
              <span>{copiedSuccess ? 'Dados Carregados!' : 'Repetir Última Sessão'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowPrintPreview(!showPrintPreview)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#27211d] hover:bg-[#342b26] text-[#f4efe8] border border-[#3e342e] text-xs font-semibold transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#c8a88a]" />
            <span>{showPrintPreview ? 'Voltar ao Formulário' : 'Visualizar Relatório'}</span>
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2a221d] hover:bg-[#382f2a] text-[#c8a88a] border border-[#44362d] font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Evolução</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!showPrintPreview) {
                setShowPrintPreview(true);
              }
              handleOpenSignatureModal();
            }}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#c8a88a] hover:bg-[#d6bca3] text-[#181513] font-bold text-xs shadow-md transition-all cursor-pointer"
            title="Confere o laudo e aplica a assinatura da Fonoaudióloga"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Conferir & Assinar</span>
          </button>
        </div>
      </div>

      {/* Visualização de Impressão do Laudo Timbrado Oficial */}
      {showPrintPreview ? (
        <div className="bg-[#14110f] p-4 sm:p-8 rounded-2xl border border-[#342b26] flex flex-col items-center gap-6">
          <div className="w-full flex justify-between items-center text-xs text-[#a69a8f] max-w-[210mm]">
            <span>Prévia do Laudo Clínico Timbrado em 4 Páginas</span>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#c8a88a] text-[#181513] font-bold text-xs"
            >
              <Printer className="w-4 h-4" />
              Imprimir Documento Oficial
            </button>
          </div>

          <OfficialLetterhead
            config={clinicConfig}
            therapist={currentTherapist}
            showSignature={clinicConfig.includeSignatureOnPrint}
            documentType="Evolução Fonoaudiológica Oficial"
            title="Evolução de Atendimento & Deglutição"
            pageNumber={1}
            totalPages={4}
            className="shadow-2xl"
          >
            <div className="py-4 space-y-4 text-xs font-sans text-neutral-800">
              <div className="grid grid-cols-2 gap-2 p-3 bg-neutral-50 rounded border border-neutral-200 text-[11px]">
                <p><strong>Paciente:</strong> {patient.name}</p>
                <p><strong>Data da Sessão:</strong> {formData.sessionDate}</p>
                <p><strong>Diagnóstico:</strong> {patient.mainDiagnosis || patient.diagnosis}</p>
                <p><strong>Escala FOIS Atual:</strong> Nível {formData.foisLevel}</p>
                <p><strong>Classificação PARD:</strong> Nível {formData.pardLevel}</p>
                <p><strong>Via Alimentar:</strong> {formData.oralFeedingModality} ({formData.alternativeRoute})</p>
              </div>

              <div>
                <h4 className="font-bold text-[#7a5937] uppercase text-[10px] tracking-wider mb-1">
                  1. Síntese do Quadro Clínico
                </h4>
                <p className="p-3 bg-neutral-50/50 rounded border border-neutral-200 text-neutral-700 leading-relaxed">
                  {formData.clinicalSummary || 'Quadro clínico em acompanhamento e reabilitação fonoaudiológica contínua.'}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#7a5937] uppercase text-[10px] tracking-wider mb-1">
                  2. Conduta Clínica da Sessão
                </h4>
                <p className="p-3 bg-neutral-50/50 rounded border border-neutral-200 text-neutral-700 leading-relaxed whitespace-pre-line">
                  {formData.sessionConductSummary || 'Atendimento fonoaudiológico especializado executado conforme os objetivos terapêuticos propostos.'}
                </p>
              </div>

              {formData.therapies.some(t => t.applied) && (
                <div>
                  <h4 className="font-bold text-[#7a5937] uppercase text-[10px] tracking-wider mb-1">
                    3. Terapias Complementares Aplicadas
                  </h4>
                  <div className="space-y-1 text-[11px]">
                    {formData.therapies.filter(t => t.applied).map(t => (
                      <p key={t.name} className="p-2 bg-neutral-50 rounded border border-neutral-200">
                        <strong>{t.name.toUpperCase()}:</strong> {t.objective} • Parâmetros: {t.techniqueOrParams || 'Padrão clínico'}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </OfficialLetterhead>
        </div>
      ) : (
        /* Modo Formulário Clínico: 4 Páginas Fluidas com Navegação em Tabs */
        <div className="bg-[#1f1a17] border border-[#382e27] rounded-2xl overflow-hidden shadow-sm">
          {/* Navegação entre as 4 Páginas do PDF com quebra automática de linha responsiva */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-b border-[#382e27] bg-[#1a1613]">
            <button
              type="button"
              onClick={() => setActivePage(1)}
              className={`p-3.5 sm:p-4 text-left border-b sm:border-b-0 border-r border-[#382e27] transition-all cursor-pointer ${
                activePage === 1 ? 'bg-[#27211d] border-l-4 sm:border-l-0 sm:border-b-2 border-[#c8a88a]' : 'hover:bg-[#221c18]'
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-[#c8a88a] block">Página 1</span>
              <span className="text-xs font-semibold text-[#f4efe8] block leading-snug break-words">
                Quadro, Consciência, Respiração & VO
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActivePage(2)}
              className={`p-3.5 sm:p-4 text-left border-b sm:border-b-0 border-r border-[#382e27] transition-all cursor-pointer ${
                activePage === 2 ? 'bg-[#27211d] border-l-4 sm:border-l-0 sm:border-b-2 border-[#c8a88a]' : 'hover:bg-[#221c18]'
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-[#c8a88a] block">Página 2</span>
              <span className="text-xs font-semibold text-[#f4efe8] block leading-snug break-words">
                Vias Alternativas & IDDSI (Alimentos/Bebidas)
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActivePage(3)}
              className={`p-3.5 sm:p-4 text-left border-b sm:border-b-0 border-r border-[#382e27] transition-all cursor-pointer ${
                activePage === 3 ? 'bg-[#27211d] border-l-4 sm:border-l-0 sm:border-b-2 border-[#c8a88a]' : 'hover:bg-[#221c18]'
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-[#c8a88a] block">Página 3</span>
              <span className="text-xs font-semibold text-[#f4efe8] block leading-snug break-words">
                Líquidos, Espessante, FOIS & PARD
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActivePage(4)}
              className={`p-3.5 sm:p-4 text-left transition-all cursor-pointer ${
                activePage === 4 ? 'bg-[#27211d] border-l-4 sm:border-l-0 sm:border-b-2 border-[#c8a88a]' : 'hover:bg-[#221c18]'
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-[#c8a88a] block">Página 4</span>
              <span className="text-xs font-semibold text-[#f4efe8] block leading-snug break-words">
                Terapias Complementares & Conduta
              </span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* ======================================================== */}
            {/* PÁGINA 1: QUADRO, CONSCIÊNCIA, RESPIRAÇÃO, COMUNICAÇÃO & ALIMENTAÇÃO ORAL */}
            {/* ======================================================== */}
            {activePage === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-[#382e27] pb-3">
                  <div>
                    <h3 className="text-base font-bold font-serif text-[#f4efe8] flex items-center gap-2">
                      <HeartPulse className="w-5 h-5 text-[#c8a88a]" />
                      Página 1: Avaliação Clínica, Respiratória & Comunicação
                    </h3>
                    <p className="text-xs text-[#a69a8f]">
                      Preencha o estado geral de vigília, suporte ventilatório, vias aéreas e padrão funcional da fala.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-[#c8a88a] font-medium">Data do Atendimento:</label>
                    <input
                      type="date"
                      value={formData.sessionDate}
                      onChange={e => setFormData({ ...formData, sessionDate: e.target.value })}
                      className="bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-1.5 text-xs text-[#f4efe8] outline-none focus:border-[#c8a88a]"
                    />
                  </div>
                </div>

                {/* Síntese do Quadro Clínico */}
                <div>
                  <label className="block text-xs font-bold text-[#c8a88a] uppercase tracking-wider mb-1.5">
                    Síntese do Quadro Clínico
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Descreva a história pregressa, internações recentes, diagnóstico funcional e evolução clínica..."
                    value={formData.clinicalSummary}
                    onChange={e => setFormData({ ...formData, clinicalSummary: e.target.value })}
                    className="w-full bg-[#181513] border border-[#3e342e] rounded-xl p-3 text-xs text-[#f4efe8] outline-none focus:border-[#c8a88a] leading-relaxed"
                  />
                </div>

                {/* Nível de Consciência (Chips Clicáveis de Alta Eficiência) */}
                <div className="bg-[#181513] p-4 rounded-xl border border-[#2e2621] space-y-3">
                  <label className="block text-xs font-bold text-[#f4efe8] uppercase tracking-wider">
                    Nível de Consciência
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['lucido', 'orientado', 'desorientado', 'sonolento', 'acordado', 'torporoso', 'coma'] as ConsciousnessLevel[]).map(item => {
                      const selected = formData.consciousness.includes(item);
                      return (
                        <button
                          type="button"
                          key={item}
                          onClick={() => handleToggleConsciousness(item)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                            selected
                              ? 'bg-[#c8a88a] text-[#181513] shadow-xs'
                              : 'bg-[#27211d] text-[#a69a8f] border border-[#3e342e] hover:border-[#52443a]'
                          }`}
                        >
                          {selected && '✓ '}
                          {item}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4 text-xs">
                    <span className="text-[#c8a88a] font-medium">Capacidade de Tomada de Decisões:</span>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 cursor-pointer text-[#f4efe8]">
                        <input
                          type="radio"
                          name="canMakeDecisions"
                          checked={formData.canMakeDecisions === true}
                          onChange={() => setFormData({ ...formData, canMakeDecisions: true })}
                          className="accent-[#c8a88a]"
                        />
                        Sim, preservada
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-[#f4efe8]">
                        <input
                          type="radio"
                          name="canMakeDecisions"
                          checked={formData.canMakeDecisions === false}
                          onChange={() => setFormData({ ...formData, canMakeDecisions: false })}
                          className="accent-[#c8a88a]"
                        />
                        Não, dependente
                      </label>
                    </div>
                  </div>
                </div>

                {/* Padrão Ventilatório, Oxigenoterapia & Traqueostomia */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#181513] p-4 rounded-xl border border-[#2e2621] space-y-2">
                    <label className="block text-xs font-bold text-[#c8a88a]">Padrão Ventilatório</label>
                    <select
                      value={formData.respiratoryPattern}
                      onChange={e => setFormData({ ...formData, respiratoryPattern: e.target.value as any })}
                      className="w-full bg-[#27211d] border border-[#3e342e] rounded-lg px-3 py-2 text-xs text-[#f4efe8] outline-none"
                    >
                      <option value="eupneico">Eupneico (Respiração normal)</option>
                      <option value="taquipneico">Taquipneico</option>
                      <option value="dispneico">Dispneico (Esforço respiratório)</option>
                      <option value="outro">Outro padrão</option>
                    </select>

                    <label className="block text-xs font-bold text-[#c8a88a] pt-2">Ausculta Cervical</label>
                    <select
                      value={formData.cervicalAuscultation}
                      onChange={e => setFormData({ ...formData, cervicalAuscultation: e.target.value as any })}
                      className="w-full bg-[#27211d] border border-[#3e342e] rounded-lg px-3 py-2 text-xs text-[#f4efe8] outline-none"
                    >
                      <option value="limpa">Limpa (Sem ruídos pré e pós-deglutição)</option>
                      <option value="ruidosa">Ruidosa / Com secreção</option>
                      <option value="estertorosa">Estertorosa (Sinal de estase/penetração)</option>
                      <option value="estridor">Estridor laríngeo</option>
                    </select>
                  </div>

                  <div className="bg-[#181513] p-4 rounded-xl border border-[#2e2621] space-y-2">
                    <label className="block text-xs font-bold text-[#c8a88a]">Oxigenoterapia / Suporte</label>
                    <select
                      value={formData.oxygenSupport}
                      onChange={e => setFormData({ ...formData, oxygenSupport: e.target.value as any })}
                      className="w-full bg-[#27211d] border border-[#3e342e] rounded-lg px-3 py-2 text-xs text-[#f4efe8] outline-none"
                    >
                      <option value="ar_ambiente">Ar Ambiente</option>
                      <option value="cateter_nasal">Cateter Nasal</option>
                      <option value="concentrador">Concentrador de O2</option>
                      <option value="cilindro">Cilindro de O2</option>
                      <option value="macronebulizacao">Macronebulização (Mnbz)</option>
                      <option value="mascara_venturi">Máscara de Venturi</option>
                    </select>

                    {formData.oxygenSupport !== 'ar_ambiente' && (
                      <input
                        type="text"
                        placeholder="Vazão (ex: 2 L/min)"
                        value={formData.oxygenFlowLiters || ''}
                        onChange={e => setFormData({ ...formData, oxygenFlowLiters: e.target.value })}
                        className="w-full bg-[#27211d] border border-[#3e342e] rounded-lg px-3 py-1.5 text-xs text-[#f4efe8] outline-none"
                      />
                    )}

                    <div className="pt-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="mechVent"
                        checked={formData.mechanicalVentilation}
                        onChange={e => setFormData({ ...formData, mechanicalVentilation: e.target.checked })}
                        className="accent-[#c8a88a]"
                      />
                      <label htmlFor="mechVent" className="text-xs text-[#f4efe8] font-medium cursor-pointer">
                        Ventilação Mecânica (VM)
                      </label>
                    </div>
                  </div>

                  <div className="bg-[#181513] p-4 rounded-xl border border-[#2e2621] space-y-2">
                    <label className="block text-xs font-bold text-[#c8a88a]">Traqueostomia (TQT)</label>
                    <select
                      value={formData.tqtType}
                      onChange={e => setFormData({ ...formData, tqtType: e.target.value as any })}
                      className="w-full bg-[#27211d] border border-[#3e342e] rounded-lg px-3 py-2 text-xs text-[#f4efe8] outline-none"
                    >
                      <option value="nenhuma">Nenhuma (Via aérea natural)</option>
                      <option value="plastica">Cânula Plástica (Portex/Shiley)</option>
                      <option value="metalica">Cânula Metálica</option>
                      <option value="fenestrada">Fenestrada</option>
                      <option value="valvula_fala">Com Válvula de Fala (Passy-Muir)</option>
                      <option value="com_cuff">Cuff Insuflado</option>
                      <option value="desinsuflada">Cuff Desinsuflado</option>
                    </select>

                    <label className="block text-xs font-bold text-[#c8a88a] pt-1">Necessidade de Aspiração</label>
                    <select
                      value={formData.suction}
                      onChange={e => setFormData({ ...formData, suction: e.target.value as any })}
                      className="w-full bg-[#27211d] border border-[#3e342e] rounded-lg px-3 py-2 text-xs text-[#f4efe8] outline-none"
                    >
                      <option value="ausente">Ausente / Não necessita</option>
                      <option value="vas">Vias Aéreas Superiores (VAS)</option>
                      <option value="traqueal">Aspiração Traqueal</option>
                      <option value="ambas">Ambas (VAS e Traqueal)</option>
                    </select>
                  </div>
                </div>

                {/* Aspectos da Comunicação & Linguagem */}
                <div className="bg-[#181513] p-4 rounded-xl border border-[#2e2621] space-y-3">
                  <label className="block text-xs font-bold text-[#f4efe8] uppercase tracking-wider">
                    Linguagem & Comunicação
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[11px] text-[#c8a88a] font-medium block mb-1.5">Aspectos de Compreensão e Expressão:</span>
                      <div className="flex flex-wrap gap-2">
                        {([
                          'compreensao_preservada',
                          'compreensao_alterada',
                          'expressao_preservada',
                          'expressao_alterada'
                        ] as LanguageAspect[]).map(aspect => {
                          const active = formData.languageAspects.includes(aspect);
                          return (
                            <button
                              type="button"
                              key={aspect}
                              onClick={() => handleToggleLanguage(aspect)}
                              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                                active
                                  ? 'bg-[#c8a88a] text-[#181513] font-bold'
                                  : 'bg-[#27211d] text-[#a69a8f] border border-[#3e342e]'
                              }`}
                            >
                              {active && '✓ '}
                              {aspect.replace('_', ' ')}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] text-[#c8a88a] font-medium block mb-1.5">Diagnóstico Funcional da Fala/Voz:</span>
                      <div className="flex flex-wrap gap-2">
                        {([
                          'sem_alteracao',
                          'afasia',
                          'disartria',
                          'disfonia',
                          'apraxia'
                        ] as CommunicationDiagnosis[]).map(diag => {
                          const active = formData.communicationDiagnosis.includes(diag);
                          return (
                            <button
                              type="button"
                              key={diag}
                              onClick={() => handleToggleCommunication(diag)}
                              className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-all ${
                                active
                                  ? 'bg-[#c8a88a] text-[#181513] font-bold'
                                  : 'bg-[#27211d] text-[#a69a8f] border border-[#3e342e]'
                              }`}
                            >
                              {active && '✓ '}
                              {diag}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alimentação Oral */}
                <div className="bg-[#181513] p-4 rounded-xl border border-[#2e2621] space-y-3">
                  <label className="block text-xs font-bold text-[#f4efe8] uppercase tracking-wider flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-[#c8a88a]" />
                    Modalidade de Alimentação Oral
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {[
                      { key: 'vo_plena', label: 'Via Oral Plena', desc: '100% de nutrição e hidratação por via oral' },
                      { key: 'estimulo_gustativo', label: 'Estímulo Gustativo (<30ml)', desc: 'Treino de sabor e sensibilidade oral' },
                      { key: 'dieta_prova', label: 'Dieta de Prova (30-50ml)', desc: 'Avaliação funcional de segurança em sessão' },
                      { key: 'vo_conforto', label: 'VO de Conforto (<100ml)', desc: 'Ingestão de prazer e satisfação oral' },
                      { key: 'vo_parcial', label: 'VO Parcial (Refeições definidas)', desc: 'Com etapas e volumes programados' }
                    ].map(mod => (
                      <div
                        key={mod.key}
                        onClick={() => setFormData({ ...formData, oralFeedingModality: mod.key as any })}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          formData.oralFeedingModality === mod.key
                            ? 'bg-[#27211d] border-[#c8a88a] shadow-sm'
                            : 'bg-[#201a16] border-[#382e27] hover:border-[#4c3f35]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-[#f4efe8]">{mod.label}</span>
                          {formData.oralFeedingModality === mod.key && <Check className="w-4 h-4 text-[#c8a88a]" />}
                        </div>
                        <p className="text-[10px] text-[#a69a8f]">{mod.desc}</p>
                      </div>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Detalhes adicionais de volume e etapas (ex: 3 etapas diárias de 80ml supervisionadas)"
                    value={formData.oralFeedingVolumeDetails || ''}
                    onChange={e => setFormData({ ...formData, oralFeedingVolumeDetails: e.target.value })}
                    className="w-full bg-[#27211d] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] outline-none focus:border-[#c8a88a]"
                  />
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* PÁGINA 2: VIAS ALTERNATIVAS & IDDSI (ALIMENTOS E BEBIDAS ESPESSAS) */}
            {/* ======================================================== */}
            {activePage === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-[#382e27] pb-3">
                  <h3 className="text-base font-bold font-serif text-[#f4efe8] flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#c8a88a]" />
                    Página 2: Vias Alternativas & Dieta Oral IDDSI (Níveis 7 a 2)
                  </h3>
                  <p className="text-xs text-[#a69a8f]">
                    Configuração de nutrição enteral e seleção de consistências orais com o padrão global IDDSI.
                  </p>
                </div>

                {/* Vias Alternativas de Alimentação */}
                <div className="bg-[#181513] p-4 rounded-xl border border-[#2e2621] space-y-3">
                  <label className="block text-xs font-bold text-[#c8a88a] uppercase tracking-wider">
                    Via Alternativa de Alimentação
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {(['nenhuma', 'CNE', 'GTT', 'COG', 'JTT'] as AlternativeRoute[]).map(route => (
                      <button
                        type="button"
                        key={route}
                        onClick={() => setFormData({ ...formData, alternativeRoute: route })}
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                          formData.alternativeRoute === route
                            ? 'bg-[#c8a88a] text-[#181513]'
                            : 'bg-[#27211d] text-[#a69a8f] border border-[#3e342e]'
                        }`}
                      >
                        {route === 'nenhuma' ? 'Nenhuma (VO Exclusiva)' : route}
                      </button>
                    ))}
                  </div>

                  {formData.alternativeRoute !== 'nenhuma' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <input
                        type="text"
                        placeholder="Calibre / Modelo (ex: Mic-Key 18 Fr / Sonda Dobbhoff 10 Fr)"
                        value={formData.alternativeRouteCaliber || ''}
                        onChange={e => setFormData({ ...formData, alternativeRouteCaliber: e.target.value })}
                        className="bg-[#27211d] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Observações de horário, infusão ou desmame progressivo"
                        value={formData.alternativeRouteNotes || ''}
                        onChange={e => setFormData({ ...formData, alternativeRouteNotes: e.target.value })}
                        className="bg-[#27211d] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* IDDSI Alimentos (Níveis 7 a 3) */}
                <div className="bg-[#181513] p-4 rounded-xl border border-[#2e2621] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#f4efe8] uppercase tracking-wider">
                      Consistência de Alimentos Sólidos (IDDSI Níveis 7 ao 3)
                    </label>
                    <span className="text-[10px] text-[#c8a88a] font-mono">Seleção Múltipla Permitida</span>
                  </div>

                  <div className="space-y-2">
                    {[
                      { key: 'nivel_7_regular', level: 7, label: 'Nível 7 - Regular / Normal', desc: 'Alimentos cotidianos sem restrição de corte ou textura' },
                      { key: 'nivel_6_macio_pequenos_pedacos', level: 6, label: 'Nível 6 - Macio e Pequenos Pedaços', desc: 'Tamanho máx 1.5cm, macio, amassável com garfo' },
                      { key: 'nivel_5_moido_humido', level: 5, label: 'Nível 5 - Moído e Úmido', desc: 'Partículas de 4mm, coeso, exige mínima mastigação' },
                      { key: 'nivel_4_pure', level: 4, label: 'Nível 4 - Pastoso / Purê', desc: 'Homogêneo, sem grumos, não requer mastigação' },
                      { key: 'nivel_3_liquefeito', level: 3, label: 'Nível 3 - Liquefeito', desc: 'Textura suave, escorre lentamente de colher' }
                    ].map(food => {
                      const active = formData.iddsiFoods.includes(food.key as any);
                      return (
                        <div
                          key={food.key}
                          onClick={() => handleToggleFoodIddsi(food.key as any)}
                          className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                            active
                              ? 'bg-[#2b2420] border-[#c8a88a] shadow-xs'
                              : 'bg-[#201a16] border-[#382e27] hover:border-[#4a3d35]'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-[#f4efe8] flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-[#c8a88a]/30 text-[#c8a88a] text-[10px] flex items-center justify-center font-mono">
                                {food.level}
                              </span>
                              {food.label}
                            </span>
                            <p className="text-[10px] text-[#a69a8f] pl-7">{food.desc}</p>
                          </div>
                          {active && <Check className="w-4 h-4 text-[#c8a88a]" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* IDDSI Bebidas Espessadas (Níveis 4 a 2) */}
                <div className="bg-[#181513] p-4 rounded-xl border border-[#2e2621] space-y-3">
                  <label className="text-xs font-bold text-[#f4efe8] uppercase tracking-wider block">
                    Bebidas Espessadas (IDDSI Níveis 4 ao 2)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { key: 'nivel_4_extremamente_espesso', level: 4, label: 'Nível 4 - Pudim', desc: 'Extremamente espesso, ingerido com colher' },
                      { key: 'nivel_3_moderadamente_espesso', level: 3, label: 'Nível 3 - Mel', desc: 'Moderadamente espesso, escorre devagar' },
                      { key: 'nivel_2_pouco_espesso', level: 2, label: 'Nível 2 - Néctar', desc: 'Pouco espesso, escorre em fio' }
                    ].map(drink => {
                      const active = formData.iddsiDrinksHigh.includes(drink.key as any);
                      return (
                        <div
                          key={drink.key}
                          onClick={() => handleToggleDrinkHigh(drink.key as any)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            active
                              ? 'bg-[#2b2420] border-[#c8a88a]'
                              : 'bg-[#201a16] border-[#382e27] hover:border-[#4a3d35]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-[#f4efe8]">{drink.label}</span>
                            {active && <Check className="w-4 h-4 text-[#c8a88a]" />}
                          </div>
                          <p className="text-[10px] text-[#a69a8f]">{drink.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* PÁGINA 3: IDDSI LÍQUIDOS FINOS, ESPESSANTE, FOIS & PARD */}
            {/* ======================================================== */}
            {activePage === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-[#382e27] pb-3">
                  <h3 className="text-base font-bold font-serif text-[#f4efe8] flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#c8a88a]" />
                    Página 3: IDDSI Líquidos, Espessante, Escalas FOIS & PARD
                  </h3>
                  <p className="text-xs text-[#a69a8f]">
                    Classificação funcional com métricas indexadas para os gráficos de evolução do paciente.
                  </p>
                </div>

                {/* IDDSI Bebidas Leves & Finas (Níveis 1 e 0) */}
                <div className="bg-[#181513] p-4 rounded-xl border border-[#2e2621] space-y-3">
                  <label className="text-xs font-bold text-[#f4efe8] uppercase tracking-wider block">
                    Líquidos Finos & Ligeiramente Espessados (IDDSI Níveis 1 e 0)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: 'nivel_1_ligeiramente_espesso', level: 1, label: 'Nível 1 - Ligeiramente Espesso', desc: 'Mais espesso que a água, exige menor propulsão que o néctar' },
                      { key: 'nivel_0_fino', level: 0, label: 'Nível 0 - Líquido Fino / Livre', desc: 'Água, sucos coados, chá, café sem qualquer agente espessante' }
                    ].map(drink => {
                      const active = formData.iddsiDrinksLow.includes(drink.key as any);
                      return (
                        <div
                          key={drink.key}
                          onClick={() => handleToggleDrinkLow(drink.key as any)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            active
                              ? 'bg-[#2b2420] border-[#c8a88a]'
                              : 'bg-[#201a16] border-[#382e27] hover:border-[#4a3d35]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-[#f4efe8]">{drink.label}</span>
                            {active && <Check className="w-4 h-4 text-[#c8a88a]" />}
                          </div>
                          <p className="text-[10px] text-[#a69a8f]">{drink.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Uso de Espessante & Posologia */}
                <div className="bg-[#181513] p-4 rounded-xl border border-[#2e2621] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#c8a88a] uppercase tracking-wider">
                      Prescrição de Agente Espessante
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-[#f4efe8]">
                      <input
                        type="checkbox"
                        checked={formData.thickenerUsed}
                        onChange={e => setFormData({ ...formData, thickenerUsed: e.target.checked })}
                        className="accent-[#c8a88a]"
                      />
                      <span>Paciente utiliza espessante na dieta</span>
                    </label>
                  </div>

                  {formData.thickenerUsed && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-[11px] text-[#a69a8f] mb-1">Marca Comercial</label>
                        <input
                          type="text"
                          placeholder="Ex: Resource ThickenUp Clear, Biosen, Nutilis"
                          value={formData.thickenerBrand || ''}
                          onChange={e => setFormData({ ...formData, thickenerBrand: e.target.value })}
                          className="w-full bg-[#27211d] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#a69a8f] mb-1">Dose / Diluição Prescrita</label>
                        <input
                          type="text"
                          placeholder="Ex: 2 colheres-medida para 100ml de líquido frio"
                          value={formData.thickenerDose || ''}
                          onChange={e => setFormData({ ...formData, thickenerDose: e.target.value })}
                          className="w-full bg-[#27211d] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Escala FOIS (Functional Oral Intake Scale) - Níveis 1 ao 7 */}
                <div className="bg-[#181513] p-5 rounded-xl border border-[#2e2621] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#f4efe8] uppercase tracking-wider flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-400" />
                        Escala FOIS (Functional Oral Intake Scale)
                      </h4>
                      <p className="text-[11px] text-[#a69a8f]">
                        Nível de ingestão oral funcional indexado automaticamente no gráfico do prontuário.
                      </p>
                    </div>
                    <span className="text-base font-bold font-mono px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Nível {formData.foisLevel}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {FOIS_LEVELS_INFO.map(f => (
                      <div
                        key={f.level}
                        onClick={() => setFormData({ ...formData, foisLevel: f.level })}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          formData.foisLevel === f.level
                            ? 'bg-[#2b2420] border-amber-400/80 shadow-md ring-1 ring-amber-400/40'
                            : 'bg-[#201a16] border-[#382e27] hover:border-[#4a3d34]'
                        }`}
                      >
                        <span className="text-xs font-bold text-amber-300 block mb-1">{f.label}</span>
                        <p className="text-[10px] text-[#d8cec4] leading-tight">{f.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Escala PARD (Protocolo Fonoaudiológico de Avaliação do Risco para Disfagia) */}
                <div className="bg-[#181513] p-5 rounded-xl border border-[#2e2621] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#f4efe8] uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-emerald-400" />
                        Classificação PARD (Severidade da Deglutição)
                      </h4>
                      <p className="text-[11px] text-[#a69a8f]">
                        Determina o grau de risco e segurança laringotraqueal.
                      </p>
                    </div>
                    <span className="text-base font-bold font-mono px-3 py-1 rounded-xl bg-[#c8a88a]/20 text-[#c8a88a] border border-[#c8a88a]/30">
                      Grau {formData.pardLevel}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {PARD_LEVELS_INFO.map(p => (
                      <div
                        key={p.level}
                        onClick={() => setFormData({ ...formData, pardLevel: p.level as any })}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          formData.pardLevel === p.level
                            ? 'bg-[#2b2420] border-[#c8a88a] shadow-md ring-1 ring-[#c8a88a]/40'
                            : 'bg-[#201a16] border-[#382e27] hover:border-[#4a3d34]'
                        }`}
                      >
                        <span className="text-xs font-bold text-[#f4efe8] block mb-1">Nível {p.level}</span>
                        <p className="text-[10px] text-[#a69a8f] leading-tight">{p.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* PÁGINA 4: TERAPIAS COMPLEMENTARES, PLANO E CONDUTA DA SESSÃO */}
            {/* ======================================================== */}
            {activePage === 4 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-[#382e27] pb-3">
                  <h3 className="text-base font-bold font-serif text-[#f4efe8] flex items-center gap-2">
                    <Flame className="w-5 h-5 text-[#c8a88a]" />
                    Página 4: Terapias Complementares, Frequência & Conduta da Sessão
                  </h3>
                  <p className="text-xs text-[#a69a8f]">
                    Registro de tecnologias de reabilitação (Laser, Eletroestimulação, Neuromodulação) e síntese conclusiva.
                  </p>
                </div>

                {/* Terapias Complementares */}
                <div className="bg-[#181513] p-4 rounded-xl border border-[#2e2621] space-y-4">
                  <label className="text-xs font-bold text-[#f4efe8] uppercase tracking-wider block">
                    Recursos Tecnológicos & Terapias Complementares
                  </label>

                  <div className="space-y-3">
                    {formData.therapies.map((therapy, idx) => (
                      <div key={therapy.name} className="p-3.5 rounded-xl bg-[#201a16] border border-[#382e27] space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={therapy.applied}
                              onChange={e => handleUpdateTherapy(idx, { applied: e.target.checked })}
                              className="accent-[#c8a88a]"
                            />
                            <span className="text-xs font-bold text-[#f4efe8] uppercase tracking-wider">
                              {therapy.name === 'eletroestimulacao' && '⚡ Eletroestimulação (FES / TENS)'}
                              {therapy.name === 'laser' && '🔴 Laserterapia (Laser de Baixa Potência)'}
                              {therapy.name === 'neuromodulacao' && '🧠 Neuromodulação Não Invasiva (tDCS)'}
                              {therapy.name === 'bandagem' && '🩹 Bandagem Elástica Funcional (Kinesio)'}
                            </span>
                          </label>
                          {therapy.applied && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono">
                              Aplicada na Sessão
                            </span>
                          )}
                        </div>

                        {therapy.applied && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <input
                              type="text"
                              placeholder="Objetivo clínico (ex: Fortalecimento supra-hióideo)"
                              value={therapy.objective || ''}
                              onChange={e => handleUpdateTherapy(idx, { objective: e.target.value })}
                              className="bg-[#27211d] border border-[#3e342e] rounded-lg px-3 py-1.5 text-xs text-[#f4efe8] outline-none"
                            />
                            <input
                              type="text"
                              placeholder="Parâmetros / Técnicas (ex: 80Hz, 300us / 808nm 4J/ponto)"
                              value={therapy.techniqueOrParams || ''}
                              onChange={e => handleUpdateTherapy(idx, { techniqueOrParams: e.target.value })}
                              className="bg-[#27211d] border border-[#3e342e] rounded-lg px-3 py-1.5 text-xs text-[#f4efe8] outline-none"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plano Terapêutico e Frequência */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#181513] p-4 rounded-xl border border-[#2e2621]">
                    <label className="block text-xs font-bold text-[#c8a88a] mb-1">
                      Frequência Semanal do Atendimento
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 2x por semana (terças e quintas)"
                      value={formData.treatmentFrequency}
                      onChange={e => setFormData({ ...formData, treatmentFrequency: e.target.value })}
                      className="w-full bg-[#27211d] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] outline-none"
                    />
                  </div>

                  <div className="bg-[#181513] p-4 rounded-xl border border-[#2e2621]">
                    <label className="block text-xs font-bold text-[#c8a88a] mb-1">
                      Foco da Próxima Sessão
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Progressão para sólidos macios e treino postural"
                      value={formData.nextSessionFocus || ''}
                      onChange={e => setFormData({ ...formData, nextSessionFocus: e.target.value })}
                      className="w-full bg-[#27211d] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] outline-none"
                    />
                  </div>
                </div>

                {/* Síntese da Conduta Clínica da Sessão (Texto Longo) */}
                <div>
                  <label className="block text-xs font-bold text-[#c8a88a] uppercase tracking-wider mb-1.5">
                    Síntese da Conduta Clínica da Sessão *
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Descreva detalhadamente as manobras realizadas, alimentos ofertados, volumes testados, reações do paciente, orientações aos cuidadores e conclusões da sessão..."
                    value={formData.sessionConductSummary}
                    onChange={e => setFormData({ ...formData, sessionConductSummary: e.target.value })}
                    className="w-full bg-[#181513] border border-[#3e342e] rounded-xl p-3.5 text-xs text-[#f4efe8] outline-none focus:border-[#c8a88a] leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* Barra Inferior com Navegação Entre Páginas */}
            <div className="flex items-center justify-between pt-4 border-t border-[#382e27]">
              <div>
                {activePage > 1 && (
                  <button
                    type="button"
                    onClick={() => setActivePage((activePage - 1) as any)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#27211d] hover:bg-[#342b26] text-[#c8a88a] text-xs font-semibold transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Página Anterior
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {activePage < 4 ? (
                  <button
                    type="button"
                    onClick={() => setActivePage((activePage + 1) as any)}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#c8a88a] hover:bg-[#d6bca3] text-[#181513] font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Próxima Página ({activePage + 1}/4)
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#c8a88a] hover:bg-[#d6bca3] text-[#181513] font-bold text-xs shadow-lg transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    Finalizar e Salvar Evolução
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Modal Pad de Assinatura para a Terapeuta */}
      {showSignModal && (
        <SignaturePadModal
          isOpen={showSignModal}
          onClose={() => setShowSignModal(false)}
          title="Assinatura da Fonoaudióloga"
          subtitle={`Atendimento prestado ao paciente ${patient.name}`}
          signerName={profile.name}
          signerRole="fonoaudiologo"
          signerDocument={profile.crfa}
          signerEmail={profile.email}
          defaultSignatureUrl={clinicConfig.signatureUrl}
          onConfirmSignature={handleConfirmTherapistSignature}
        />
      )}
    </div>
  );
};
