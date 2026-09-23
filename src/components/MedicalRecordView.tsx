import React, { useState } from 'react';
import { 
  Patient, 
  PatientMedicalRecord, 
  ClinicalSessionNote, 
  TherapeuticObjective, 
  TreatmentPlan, 
  OfaAssessment, 
  UserProfile,
  RadiAssessment,
  DailyFeedingLog
} from '../types';
import { FOIS_SCALE } from '../data/mockData';
import { 
  FileText, 
  User, 
  Calendar, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Activity, 
  Utensils, 
  Sparkles, 
  Printer, 
  ShieldCheck, 
  Target, 
  ChevronRight, 
  Edit3, 
  Save, 
  X,
  Stethoscope,
  HeartPulse,
  Award,
  ChevronDown,
  Check,
  RotateCcw
} from 'lucide-react';

interface MedicalRecordViewProps {
  selectedPatient: Patient | null;
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  currentUser: UserProfile;
  medicalRecords: PatientMedicalRecord[];
  onUpdateMedicalRecord: (record: PatientMedicalRecord) => void;
  radiAssessments?: RadiAssessment[];
  dailyLogs?: DailyFeedingLog[];
}

type TabType = 'resumo' | 'anamnese' | 'metas' | 'plano' | 'evolucoes' | 'avaliacoes';

export const MedicalRecordView: React.FC<MedicalRecordViewProps> = ({
  selectedPatient,
  patients,
  onSelectPatient,
  currentUser,
  medicalRecords,
  onUpdateMedicalRecord,
  radiAssessments = [],
  dailyLogs = []
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('resumo');
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [isEditingOfa, setIsEditingOfa] = useState(false);
  const [isAddingObjective, setIsAddingObjective] = useState(false);
  const [showPatientSelector, setShowPatientSelector] = useState(false);

  // New Session Form State (SOAP)
  const [newSession, setNewSession] = useState({
    date: new Date().toISOString().split('T')[0],
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    currentFois: 5,
    symptoms: [] as string[]
  });

  // New Objective Form State
  const [newObjective, setNewObjective] = useState({
    term: 'curto_prazo' as 'curto_prazo' | 'medio_prazo' | 'longo_prazo',
    description: '',
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  if (!selectedPatient) {
    return (
      <div className="bg-[#221d1a] border border-[#3a312c] rounded-2xl p-8 text-center max-w-xl mx-auto my-12">
        <FileText className="w-12 h-12 text-[#c8a88a] mx-auto mb-4 opacity-70" />
        <h3 className="text-xl font-bold font-serif text-[#f4efe8] mb-2">
          Nenhum Paciente Selecionado
        </h3>
        <p className="text-sm text-[#a69a8f] mb-6">
          Selecione um paciente cadastrado para visualizar e registrar o prontuário eletrônico fonoaudiológico.
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {patients.map(p => (
            <button
              key={p.id}
              onClick={() => onSelectPatient(p)}
              className="px-4 py-2 rounded-xl bg-[#2b2420] hover:bg-[#382f2a] border border-[#42362f] text-sm text-[#c8a88a] transition-all flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Find or create a default clinical record for the selected patient
  let currentRecord = medicalRecords.find(r => r.patientId === selectedPatient.id);

  if (!currentRecord) {
    currentRecord = {
      id: `pep_${selectedPatient.id}`,
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      feedingRoute: 'VO_exclusiva',
      primaryComplaint: selectedPatient.medicalHistory || 'Encaminhado para acompanhamento fonoaudiológico e readequação de consistência alimentar.',
      pastMedicalHistory: selectedPatient.diagnosis || 'Sem histórico prévio detalhado.',
      oralHygieneDentition: 'Dentição conservada / Higiene oral regular.',
      baselineFois: 4,
      currentFois: 5,
      ofaAssessment: {
        lipSeal: 'adequado',
        tongueMobility: 'preservada',
        tongueStrength: 'adequado',
        laryngealElevation: 'adequada',
        cervicalAuscultation: 'limpa',
        wetVoice: false,
        swallowingReflex: 'imediato',
        coughReflex: 'eficaz',
        dentoFacialStatus: 'Oclusão e tônus orofacial em acompanhamento.'
      },
      treatmentPlan: {
        frequency: '2 sessões semanais',
        posturalManeuvers: ['Queixo para baixo durante a deglutição'],
        deglutitionManeuvers: ['Deglutição com esforço'],
        myofunctionalExercises: ['Fortalecimento lingual e de esfíncter velofaríngeo'],
        sensoryStrategies: ['Estimulação térmico-tátil gustativa'],
        dietaryPrescription: 'Consistência pastosa homogênea e líquidos espessados.',
        liquidThickening: 'Espessante alimentar padrão 2 medidas / 150ml.',
        caregiverGuidelines: 'Supervisão durante as refeições e higiene oral sistemática.'
      },
      objectives: [
        {
          id: `obj_init_${selectedPatient.id}`,
          term: 'curto_prazo',
          description: 'Garantir proteção de vias aéreas durante alimentação e prevenir broncoaspiração.',
          status: 'em_andamento',
          targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      ],
      sessions: [],
      updatedAt: new Date().toISOString()
    };
  }

  // Editable states for Plan and OFA
  const [editablePlan, setEditablePlan] = useState<TreatmentPlan>(currentRecord.treatmentPlan);
  const [editableOfa, setEditableOfa] = useState<OfaAssessment>(currentRecord.ofaAssessment);
  const [editableComplaint, setEditableComplaint] = useState(currentRecord.primaryComplaint);
  const [editableHistory, setEditableHistory] = useState(currentRecord.pastMedicalHistory);
  const [editableDentition, setEditableDentition] = useState(currentRecord.oralHygieneDentition);
  const [editableRoute, setEditableRoute] = useState(currentRecord.feedingRoute);

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'N/I';
    const birth = new Date(birthDate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} anos`;
  };

  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSession.subjective && !newSession.objective) return;

    const nextNumber = (currentRecord?.sessions.length || 0) + 1;
    const sessionDateStr = new Date(newSession.date).toLocaleDateString('pt-BR');
    const hash = `PEP-HASH-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const newNote: ClinicalSessionNote = {
      id: `sess_${Date.now()}`,
      patientId: selectedPatient.id,
      sessionNumber: nextNumber,
      date: newSession.date,
      therapistName: currentUser.name,
      therapistCrfa: currentUser.crfaNumber || 'CRFa 3-12894',
      subjective: newSession.subjective,
      objective: newSession.objective,
      assessment: newSession.assessment,
      plan: newSession.plan,
      currentFois: newSession.currentFois,
      symptomsObserved: newSession.symptoms,
      verificationSeal: hash,
      createdAt: new Date().toISOString()
    };

    const updated: PatientMedicalRecord = {
      ...currentRecord,
      currentFois: newSession.currentFois,
      sessions: [newNote, ...currentRecord.sessions],
      updatedAt: new Date().toISOString()
    };

    onUpdateMedicalRecord(updated);
    setIsAddingSession(false);
    setNewSession({
      date: new Date().toISOString().split('T')[0],
      subjective: '',
      objective: '',
      assessment: '',
      plan: '',
      currentFois: currentRecord.currentFois,
      symptoms: []
    });
  };

  const handleSavePlan = () => {
    const updated: PatientMedicalRecord = {
      ...currentRecord,
      treatmentPlan: editablePlan,
      primaryComplaint: editableComplaint,
      pastMedicalHistory: editableHistory,
      oralHygieneDentition: editableDentition,
      feedingRoute: editableRoute,
      updatedAt: new Date().toISOString()
    };
    onUpdateMedicalRecord(updated);
    setIsEditingPlan(false);
  };

  const handleSaveOfa = () => {
    const updated: PatientMedicalRecord = {
      ...currentRecord,
      ofaAssessment: editableOfa,
      updatedAt: new Date().toISOString()
    };
    onUpdateMedicalRecord(updated);
    setIsEditingOfa(false);
  };

  const handleAddObjective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObjective.description) return;

    const newObj: TherapeuticObjective = {
      id: `obj_${Date.now()}`,
      term: newObjective.term,
      description: newObjective.description,
      status: 'em_andamento',
      targetDate: newObjective.targetDate
    };

    const updated: PatientMedicalRecord = {
      ...currentRecord,
      objectives: [...currentRecord.objectives, newObj],
      updatedAt: new Date().toISOString()
    };

    onUpdateMedicalRecord(updated);
    setIsAddingObjective(false);
    setNewObjective({
      term: 'curto_prazo',
      description: '',
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  };

  const handleToggleObjectiveStatus = (objId: string) => {
    const updatedObjectives = currentRecord.objectives.map(o => {
      if (o.id === objId) {
        const nextStatus = o.status === 'em_andamento' ? 'atingido' : o.status === 'atingido' ? 'ajustado' : 'em_andamento';
        return { ...o, status: nextStatus as any };
      }
      return o;
    });

    const updated: PatientMedicalRecord = {
      ...currentRecord,
      objectives: updatedObjectives,
      updatedAt: new Date().toISOString()
    };
    onUpdateMedicalRecord(updated);
  };

  // Associated RaDI and Daily Logs for this patient
  const patientRadis = radiAssessments.filter(r => r.patientId === selectedPatient.id);
  const patientLogs = dailyLogs.filter(l => l.patientId === selectedPatient.id);

  const routeLabels: Record<string, { label: string; color: string }> = {
    VO_exclusiva: { label: 'Via Oral Exclusiva', color: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60' },
    VO_mista: { label: 'Via Oral Mista + Suplementação', color: 'bg-amber-950/40 text-amber-400 border-amber-800/60' },
    SNE: { label: 'Sonda Nasoentérica (SNE)', color: 'bg-rose-950/40 text-rose-400 border-rose-800/60' },
    GTT: { label: 'Gastrostomia (GTT)', color: 'bg-purple-950/40 text-purple-400 border-purple-800/60' },
  };

  return (
    <div className="space-y-6">
      {/* Patient Header Banner */}
      <div className="bg-[#221d1a] border border-[#3a312c] rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#c8a88a]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#c8a88a] to-[#8c735d] text-[#181513] font-bold text-xl flex items-center justify-center shadow-lg shrink-0">
              {selectedPatient.name.charAt(0)}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold font-serif text-[#f4efe8]">
                  {selectedPatient.name}
                </h2>
                <div className="relative">
                  <button
                    onClick={() => setShowPatientSelector(!showPatientSelector)}
                    className="text-xs px-2.5 py-1 rounded-md bg-[#2d2622] hover:bg-[#3d332d] text-[#c8a88a] border border-[#4a3e37] transition-colors flex items-center gap-1"
                  >
                    <span>Trocar Paciente</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {showPatientSelector && (
                    <div className="absolute left-0 mt-1 w-64 bg-[#26201c] border border-[#42362f] rounded-xl shadow-2xl py-1 z-30">
                      {patients.map(p => (
                        <button
                          key={p.id}
                          onClick={() => {
                            onSelectPatient(p);
                            setShowPatientSelector(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#342b26] transition-colors ${
                            p.id === selectedPatient.id ? 'text-[#c8a88a] font-semibold bg-[#2c2420]' : 'text-[#f4efe8]'
                          }`}
                        >
                          <span>{p.name}</span>
                          {p.id === selectedPatient.id && <Check className="w-3.5 h-3.5 text-[#c8a88a]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#a69a8f]">
                <span>Idade: <strong className="text-[#f4efe8]">{calculateAge(selectedPatient.birthDate)}</strong></span>
                <span>•</span>
                <span>CPF: <strong className="text-[#f4efe8]">{selectedPatient.cpf}</strong></span>
                <span>•</span>
                <span>Fonoaudióloga: <strong className="text-[#c8a88a]">{selectedPatient.fonoaudiologistName || currentUser.name}</strong></span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${routeLabels[currentRecord.feedingRoute]?.color}`}>
                  {routeLabels[currentRecord.feedingRoute]?.label}
                </span>

                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#2c2420] text-[#c8a88a] border border-[#453730]">
                  Escala FOIS Atual: Nível {currentRecord.currentFois}/7
                </span>

                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950/30 text-emerald-400 border border-emerald-800/40 flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-3 h-3" />
                  Prontuário Criptografado & LGPD
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start lg:self-center">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#2b2420] hover:bg-[#382f2a] border border-[#42362f] text-xs font-semibold text-[#c8a88a] transition-all shadow-sm"
              title="Imprimir prontuário em folha padrão com marca d'água"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Prontuário</span>
            </button>

            <button
              onClick={() => setIsAddingSession(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#c8a88a] hover:bg-[#b89574] text-[#181513] text-xs font-bold transition-all shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Evoluir Sessão (SOAP)</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="mt-6 pt-4 border-t border-[#342b26] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: 'resumo' as TabType, label: 'Visão Geral & FOIS', icon: Activity },
            { id: 'evolucoes' as TabType, label: `Sessões Clínicas (${currentRecord.sessions.length})`, icon: Clock },
            { id: 'anamnese' as TabType, label: 'Avaliação OFA & Deglutição', icon: Stethoscope },
            { id: 'metas' as TabType, label: `Metas Terapêuticas (${currentRecord.objectives.length})`, icon: Target },
            { id: 'plano' as TabType, label: 'Plano de Tratamento (PTS)', icon: Utensils },
            { id: 'avaliacoes' as TabType, label: `Triagens RaDI (${patientRadis.length})`, icon: Award }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#c8a88a] text-[#181513] font-bold shadow-sm'
                    : 'bg-[#1e1916] text-[#a69a8f] hover:text-[#f4efe8] hover:bg-[#2a231f] border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT: 1. RESUMO & EVOLUÇÃO FOIS */}
      {activeTab === 'resumo' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#221d1a] border border-[#3a312c] rounded-xl p-4">
              <span className="text-xs text-[#a69a8f] block mb-1">Status FOIS Inicial vs Atual</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-serif text-[#c8a88a]">Nível {currentRecord.currentFois}</span>
                <span className="text-xs text-[#a69a8f]">(Admissão: Nível {currentRecord.baselineFois})</span>
              </div>
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {currentRecord.currentFois > currentRecord.baselineFois 
                  ? `Evolução de +${currentRecord.currentFois - currentRecord.baselineFois} níveis na escala!`
                  : 'Manutenção da via oral com compensações'}
              </p>
            </div>

            <div className="bg-[#221d1a] border border-[#3a312c] rounded-xl p-4">
              <span className="text-xs text-[#a69a8f] block mb-1">Total de Sessões Registradas</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-serif text-[#f4efe8]">{currentRecord.sessions.length}</span>
                <span className="text-xs text-[#a69a8f]">evoluções clínicas</span>
              </div>
              <p className="text-[11px] text-[#a69a8f] mt-1">
                Última: {currentRecord.sessions[0]?.date ? new Date(currentRecord.sessions[0].date).toLocaleDateString('pt-BR') : 'Nenhuma'}
              </p>
            </div>

            <div className="bg-[#221d1a] border border-[#3a312c] rounded-xl p-4">
              <span className="text-xs text-[#a69a8f] block mb-1">Metas Terapêuticas</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-serif text-emerald-400">
                  {currentRecord.objectives.filter(o => o.status === 'atingido').length} / {currentRecord.objectives.length}
                </span>
                <span className="text-xs text-[#a69a8f]">concluídas</span>
              </div>
              <p className="text-[11px] text-[#c8a88a] mt-1">
                {currentRecord.objectives.filter(o => o.status === 'em_andamento').length} em andamento ativo
              </p>
            </div>

            <div className="bg-[#221d1a] border border-[#3a312c] rounded-xl p-4">
              <span className="text-xs text-[#a69a8f] block mb-1">Último Risco RaDI</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold font-serif ${
                  patientRadis[0]?.riskLevel === 'Alto Risco' ? 'text-rose-400' :
                  patientRadis[0]?.riskLevel === 'Risco Moderado' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {patientRadis[0]?.riskLevel || 'Pendente'}
                </span>
              </div>
              <p className="text-[11px] text-[#a69a8f] mt-1">
                Score: {patientRadis[0]?.score !== undefined ? `${patientRadis[0].score}/9 pontos` : 'Sem triagem'}
              </p>
            </div>
          </div>

          {/* Escala FOIS Visual Tracker */}
          <div className="bg-[#221d1a] border border-[#3a312c] rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold font-serif text-[#f4efe8]">
                  Evolução na Escala FOIS (Functional Oral Intake Scale)
                </h3>
                <p className="text-xs text-[#a69a8f]">
                  Parâmetro internacional para documentação da ingestão funcional por via oral do paciente disfágico
                </p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-[#2c2420] text-[#c8a88a] border border-[#42362f] font-mono">
                Classificação Oficial
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
              {FOIS_SCALE.map((step) => {
                const isCurrent = step.level === currentRecord.currentFois;
                const isBaseline = step.level === currentRecord.baselineFois;
                const isPassed = step.level <= currentRecord.currentFois;

                return (
                  <div
                    key={step.level}
                    className={`rounded-xl p-3 border transition-all relative ${
                      isCurrent
                        ? 'bg-[#c8a88a]/15 border-[#c8a88a] shadow-md ring-1 ring-[#c8a88a]'
                        : isPassed
                        ? 'bg-[#28211d] border-[#3f332c] text-[#f4efe8]'
                        : 'bg-[#1a1614] border-[#2c2420] text-[#6b5e55] opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold font-mono">Nível {step.level}</span>
                      {isCurrent && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#c8a88a] text-[#181513] font-bold">
                          Atual
                        </span>
                      )}
                      {isBaseline && !isCurrent && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#382f2a] text-[#c8a88a]">
                          Admissão
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] leading-tight line-clamp-3">{step.label.replace(`Nível ${step.level} - `, '')}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Histórico Clínico & Queixa Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#221d1a] border border-[#3a312c] rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-[#f4efe8] flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-[#c8a88a]" />
                  Queixa Principal & Diagnóstico Fonoaudiológico
                </h4>
              </div>
              <p className="text-xs text-[#d6c7b7] bg-[#1a1614] p-3.5 rounded-xl border border-[#332a24] leading-relaxed">
                {currentRecord.primaryComplaint}
              </p>

              <h4 className="font-bold text-sm text-[#f4efe8] flex items-center gap-2 pt-2">
                <Activity className="w-4 h-4 text-[#c8a88a]" />
                Histórico Patológico Pregresso
              </h4>
              <p className="text-xs text-[#d6c7b7] bg-[#1a1614] p-3.5 rounded-xl border border-[#332a24] leading-relaxed">
                {currentRecord.pastMedicalHistory}
              </p>
            </div>

            <div className="bg-[#221d1a] border border-[#3a312c] rounded-2xl p-5 sm:p-6 space-y-4">
              <h4 className="font-bold text-sm text-[#f4efe8] flex items-center gap-2">
                <Utensils className="w-4 h-4 text-[#c8a88a]" />
                Condutas Atuais de Alimentação & Segurança
              </h4>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-[#1a1614] border border-[#332a24]">
                  <span className="text-[#a69a8f] block mb-0.5">Prescrição de Consistência Alimentar:</span>
                  <p className="text-[#f4efe8] font-semibold">{currentRecord.treatmentPlan.dietaryPrescription}</p>
                </div>

                <div className="p-3 rounded-xl bg-[#1a1614] border border-[#332a24]">
                  <span className="text-[#a69a8f] block mb-0.5">Espessamento de Líquidos:</span>
                  <p className="text-[#f4efe8] font-semibold">{currentRecord.treatmentPlan.liquidThickening}</p>
                </div>

                <div className="p-3 rounded-xl bg-[#1a1614] border border-[#332a24]">
                  <span className="text-[#a69a8f] block mb-0.5">Orientações Essenciais para os Cuidadores:</span>
                  <p className="text-[#d6c7b7]">{currentRecord.treatmentPlan.caregiverGuidelines}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. SESSOES CLINICAS (SOAP) */}
      {activeTab === 'evolucoes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold font-serif text-[#f4efe8]">
                Evoluções Clínicas de Sessão (Registro SOAP)
              </h3>
              <p className="text-xs text-[#a69a8f]">
                Registro cronológico detalhado com carimbo digital, condutas e avaliação de sintomas
              </p>
            </div>

            <button
              onClick={() => setIsAddingSession(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#c8a88a] hover:bg-[#b89574] text-[#181513] text-xs font-bold transition-all shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nova Sessão</span>
            </button>
          </div>

          {currentRecord.sessions.length === 0 ? (
            <div className="bg-[#221d1a] border border-[#3a312c] rounded-2xl p-8 text-center">
              <Clock className="w-10 h-10 text-[#a69a8f] mx-auto mb-3 opacity-50" />
              <p className="text-sm text-[#a69a8f] mb-4">Nenhuma sessão clínica registrada ainda para este paciente.</p>
              <button
                onClick={() => setIsAddingSession(true)}
                className="px-4 py-2 rounded-xl bg-[#c8a88a] text-[#181513] font-bold text-xs"
              >
                Registrar Primeira Sessão
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {currentRecord.sessions.map((sess) => (
                <div
                  key={sess.id}
                  className="bg-[#221d1a] border border-[#3a312c] rounded-2xl p-5 sm:p-6 shadow-sm hover:border-[#4f4239] transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-[#332a24] gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#2c2420] text-[#c8a88a] font-bold flex items-center justify-center text-sm border border-[#42362f]">
                        #{sess.sessionNumber}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-[#f4efe8]">
                          Sessão Fonoaudiológica #{sess.sessionNumber}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-[#a69a8f]">
                          <Calendar className="w-3.5 h-3.5 text-[#c8a88a]" />
                          <span>{new Date(sess.date).toLocaleDateString('pt-BR')}</span>
                          <span>•</span>
                          <span>Profissional: <strong className="text-[#f4efe8]">{sess.therapistName}</strong> ({sess.therapistCrfa})</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-[#2a221e] text-[#c8a88a] border border-[#42362f]">
                        FOIS Nível {sess.currentFois}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        {sess.verificationSeal}
                      </span>
                    </div>
                  </div>

                  {/* SOAP Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-[#1a1614] border border-[#2e2621]">
                      <div className="flex items-center gap-1.5 text-[#c8a88a] font-bold mb-1 uppercase tracking-wider text-[10px]">
                        <span className="w-4 h-4 rounded bg-[#c8a88a]/20 text-[#c8a88a] flex items-center justify-center font-bold">S</span>
                        Subjetivo (Relato do Paciente / Cuidador)
                      </div>
                      <p className="text-[#d6c7b7] leading-relaxed">{sess.subjective}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#1a1614] border border-[#2e2621]">
                      <div className="flex items-center gap-1.5 text-blue-400 font-bold mb-1 uppercase tracking-wider text-[10px]">
                        <span className="w-4 h-4 rounded bg-blue-950/40 text-blue-400 flex items-center justify-center font-bold">O</span>
                        Objetivo (Procedimentos & Testes Realizados)
                      </div>
                      <p className="text-[#d6c7b7] leading-relaxed">{sess.objective}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#1a1614] border border-[#2e2621]">
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1 uppercase tracking-wider text-[10px]">
                        <span className="w-4 h-4 rounded bg-amber-950/40 text-amber-400 flex items-center justify-center font-bold">A</span>
                        Avaliação / Parecer Clínico
                      </div>
                      <p className="text-[#d6c7b7] leading-relaxed">{sess.assessment}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#1a1614] border border-[#2e2621]">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1 uppercase tracking-wider text-[10px]">
                        <span className="w-4 h-4 rounded bg-emerald-950/40 text-emerald-400 flex items-center justify-center font-bold">P</span>
                        Plano & Condutas Estabelecidas
                      </div>
                      <p className="text-[#d6c7b7] leading-relaxed">{sess.plan}</p>
                    </div>
                  </div>

                  {/* Observed Symptoms Badges */}
                  {sess.symptomsObserved && sess.symptomsObserved.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#2e2621] flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] text-[#a69a8f]">Sinais observados na sessão:</span>
                      {sess.symptomsObserved.map(sym => (
                        <span key={sym} className="text-[10px] px-2 py-0.5 rounded-md bg-[#2d221c] text-[#c8a88a] border border-[#42362f]">
                          {sym.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: 3. AVALIAÇÃO OFA & DEGLUTIÇÃO */}
      {activeTab === 'anamnese' && (
        <div className="space-y-6">
          <div className="bg-[#221d1a] border border-[#3a312c] rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold font-serif text-[#f4efe8]">
                  Avaliação Miofuncional dos Órgãos Fonoarticulatórios (OFAs) & Reflexos
                </h3>
                <p className="text-xs text-[#a69a8f]">
                  Exame físico orofacial, mobilidade de língua, vedamento labial e integridade dos mecanismos de proteção de vias aéreas
                </p>
              </div>

              <button
                onClick={() => setIsEditingOfa(!isEditingOfa)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2b2420] hover:bg-[#382f2a] border border-[#42362f] text-xs text-[#c8a88a] transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingOfa ? 'Cancelar' : 'Editar Exame'}</span>
              </button>
            </div>

            {isEditingOfa ? (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-[#a69a8f] mb-1">Vedamento Labial</label>
                    <select
                      value={editableOfa.lipSeal}
                      onChange={e => setEditableOfa({ ...editableOfa, lipSeal: e.target.value as any })}
                      className="w-full bg-[#1a1614] border border-[#3f342d] rounded-lg p-2 text-[#f4efe8]"
                    >
                      <option value="adequado">Adequado</option>
                      <option value="inadequado">Inadequado</option>
                      <option value="ausente">Ausente</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#a69a8f] mb-1">Mobilidade de Língua</label>
                    <select
                      value={editableOfa.tongueMobility}
                      onChange={e => setEditableOfa({ ...editableOfa, tongueMobility: e.target.value as any })}
                      className="w-full bg-[#1a1614] border border-[#3f342d] rounded-lg p-2 text-[#f4efe8]"
                    >
                      <option value="preservada">Preservada</option>
                      <option value="reduzida">Reduzida</option>
                      <option value="desvio">Desvio com assimetria</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#a69a8f] mb-1">Tônus de Língua</label>
                    <select
                      value={editableOfa.tongueStrength}
                      onChange={e => setEditableOfa({ ...editableOfa, tongueStrength: e.target.value as any })}
                      className="w-full bg-[#1a1614] border border-[#3f342d] rounded-lg p-2 text-[#f4efe8]"
                    >
                      <option value="adequado">Adequado</option>
                      <option value="hipotonico">Hipotônico</option>
                      <option value="espastico">Espástico</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#a69a8f] mb-1">Elevação Laríngea</label>
                    <select
                      value={editableOfa.laryngealElevation}
                      onChange={e => setEditableOfa({ ...editableOfa, laryngealElevation: e.target.value as any })}
                      className="w-full bg-[#1a1614] border border-[#3f342d] rounded-lg p-2 text-[#f4efe8]"
                    >
                      <option value="adequada">Adequada (&gt; 2 cm)</option>
                      <option value="reduzida">Reduzida</option>
                      <option value="ausente">Ausente</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#a69a8f] mb-1">Ausculta Cervical Pós-Deglutição</label>
                    <select
                      value={editableOfa.cervicalAuscultation}
                      onChange={e => setEditableOfa({ ...editableOfa, cervicalAuscultation: e.target.value as any })}
                      className="w-full bg-[#1a1614] border border-[#3f342d] rounded-lg p-2 text-[#f4efe8]"
                    >
                      <option value="limpa">Limpa (sem ruídos adventícios)</option>
                      <option value="estertorosa">Ruído estertoroso / secreção</option>
                      <option value="estridor">Estridor inspiratório</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#a69a8f] mb-1">Disparo do Reflexo de Deglutição</label>
                    <select
                      value={editableOfa.swallowingReflex}
                      onChange={e => setEditableOfa({ ...editableOfa, swallowingReflex: e.target.value as any })}
                      className="w-full bg-[#1a1614] border border-[#3f342d] rounded-lg p-2 text-[#f4efe8]"
                    >
                      <option value="imediato">Imediato / Oportuno</option>
                      <option value="atrasado">Atrasado (&gt; 2 segundos)</option>
                      <option value="ausente">Ausente</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#a69a8f] mb-1">Reflexo de Tosse Protetivo</label>
                    <select
                      value={editableOfa.coughReflex}
                      onChange={e => setEditableOfa({ ...editableOfa, coughReflex: e.target.value as any })}
                      className="w-full bg-[#1a1614] border border-[#3f342d] rounded-lg p-2 text-[#f4efe8]"
                    >
                      <option value="eficaz">Eficaz e forte</option>
                      <option value="fraco">Fraco / Ineficaz</option>
                      <option value="ausente">Ausente (Atenção para aspiração silente)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <label className="flex items-center gap-2 cursor-pointer text-[#f4efe8]">
                      <input
                        type="checkbox"
                        checked={editableOfa.wetVoice}
                        onChange={e => setEditableOfa({ ...editableOfa, wetVoice: e.target.checked })}
                        className="rounded accent-[#c8a88a]"
                      />
                      <span>Presença de Voz Molhada pós-deglutição</span>
                    </label>
                  </div>
                </div>

                <div className="text-xs pt-2">
                  <label className="block text-[#a69a8f] mb-1">Dentição, Próteses e Higiene Oral</label>
                  <input
                    type="text"
                    value={editableOfa.dentoFacialStatus}
                    onChange={e => setEditableOfa({ ...editableOfa, dentoFacialStatus: e.target.value })}
                    className="w-full bg-[#1a1614] border border-[#3f342d] rounded-lg p-2 text-[#f4efe8]"
                  />
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    onClick={handleSaveOfa}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#c8a88a] text-[#181513] font-bold text-xs"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Alterações do Exame</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-[#1a1614] border border-[#332a24]">
                  <span className="text-[#a69a8f] block mb-1">Vedamento Labial</span>
                  <span className={`font-bold capitalize ${
                    currentRecord.ofaAssessment.lipSeal === 'adequado' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {currentRecord.ofaAssessment.lipSeal}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#1a1614] border border-[#332a24]">
                  <span className="text-[#a69a8f] block mb-1">Mobilidade de Língua</span>
                  <span className={`font-bold capitalize ${
                    currentRecord.ofaAssessment.tongueMobility === 'preservada' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {currentRecord.ofaAssessment.tongueMobility}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#1a1614] border border-[#332a24]">
                  <span className="text-[#a69a8f] block mb-1">Elevação Laríngea</span>
                  <span className={`font-bold capitalize ${
                    currentRecord.ofaAssessment.laryngealElevation === 'adequada' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {currentRecord.ofaAssessment.laryngealElevation}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#1a1614] border border-[#332a24]">
                  <span className="text-[#a69a8f] block mb-1">Ausculta Cervical</span>
                  <span className={`font-bold capitalize ${
                    currentRecord.ofaAssessment.cervicalAuscultation === 'limpa' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {currentRecord.ofaAssessment.cervicalAuscultation}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#1a1614] border border-[#332a24]">
                  <span className="text-[#a69a8f] block mb-1">Reflexo de Deglutição</span>
                  <span className={`font-bold capitalize ${
                    currentRecord.ofaAssessment.swallowingReflex === 'imediato' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {currentRecord.ofaAssessment.swallowingReflex}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#1a1614] border border-[#332a24]">
                  <span className="text-[#a69a8f] block mb-1">Reflexo de Tosse</span>
                  <span className={`font-bold capitalize ${
                    currentRecord.ofaAssessment.coughReflex === 'eficaz' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {currentRecord.ofaAssessment.coughReflex}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#1a1614] border border-[#332a24]">
                  <span className="text-[#a69a8f] block mb-1">Voz Molhada (Wet Voice)</span>
                  <span className={`font-bold ${
                    currentRecord.ofaAssessment.wetVoice ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {currentRecord.ofaAssessment.wetVoice ? 'Presente (Alerta)' : 'Ausente (Limpa)'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#1a1614] border border-[#332a24]">
                  <span className="text-[#a69a8f] block mb-1">Condição Dentária</span>
                  <span className="text-[#f4efe8] font-semibold truncate block">
                    {currentRecord.ofaAssessment.dentoFacialStatus}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 4. METAS TERAPÊUTICAS */}
      {activeTab === 'metas' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold font-serif text-[#f4efe8]">
                Objetivos e Metas Terapêuticas Fonoaudiológicas
              </h3>
              <p className="text-xs text-[#a69a8f]">
                Metas clínicas estratificadas por prazo com acompanhamento sistemático de desfecho
              </p>
            </div>

            <button
              onClick={() => setIsAddingObjective(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#c8a88a] hover:bg-[#b89574] text-[#181513] text-xs font-bold transition-all shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nova Meta</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['curto_prazo', 'medio_prazo', 'longo_prazo'] as const).map(term => {
              const termGoals = currentRecord.objectives.filter(o => o.term === term);
              const termTitles: Record<string, string> = {
                curto_prazo: 'Curto Prazo (1 a 4 semanas)',
                medio_prazo: 'Médio Prazo (1 a 3 meses)',
                longo_prazo: 'Longo Prazo (> 3 meses / Manutenção)'
              };

              return (
                <div key={term} className="bg-[#221d1a] border border-[#3a312c] rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-[#f4efe8] mb-3 pb-2 border-b border-[#332a24] flex items-center justify-between">
                      <span>{termTitles[term]}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#2c2420] text-[#c8a88a]">
                        {termGoals.length}
                      </span>
                    </h4>

                    {termGoals.length === 0 ? (
                      <p className="text-xs text-[#a69a8f] italic py-4 text-center">Nenhuma meta estabelecida.</p>
                    ) : (
                      <div className="space-y-3">
                        {termGoals.map(g => (
                          <div
                            key={g.id}
                            onClick={() => handleToggleObjectiveStatus(g.id)}
                            className="p-3 rounded-xl bg-[#1a1614] border border-[#332a24] hover:border-[#4d3e35] transition-all cursor-pointer group"
                            title="Clique para alternar status da meta"
                          >
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                g.status === 'atingido' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40' :
                                g.status === 'ajustado' ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40' :
                                'bg-[#2b2420] text-[#c8a88a] border border-[#42362f]'
                              }`}>
                                {g.status === 'atingido' ? '✓ Atingido' : g.status === 'ajustado' ? 'Ajustado' : 'Em andamento'}
                              </span>

                              <span className="text-[10px] text-[#a69a8f]">
                                Alvo: {new Date(g.targetDate).toLocaleDateString('pt-BR')}
                              </span>
                            </div>

                            <p className="text-xs text-[#e0d3c5] leading-relaxed">
                              {g.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 5. PLANO DE TRATAMENTO (PTS) */}
      {activeTab === 'plano' && (
        <div className="space-y-6">
          <div className="bg-[#221d1a] border border-[#3a312c] rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold font-serif text-[#f4efe8]">
                  Plano Terapêutico Singular (PTS) Fonoaudiológico
                </h3>
                <p className="text-xs text-[#a69a8f]">
                  Manobras posturais, exercícios miofuncionais, estratégias sensoriais e orientações clínicas
                </p>
              </div>

              <button
                onClick={() => setIsEditingPlan(!isEditingPlan)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2b2420] hover:bg-[#382f2a] border border-[#42362f] text-xs text-[#c8a88a] transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingPlan ? 'Cancelar' : 'Editar Plano'}</span>
              </button>
            </div>

            {isEditingPlan ? (
              <div className="space-y-4 pt-2 text-xs">
                <div>
                  <label className="block text-[#a69a8f] mb-1 font-semibold">Via de Alimentação</label>
                  <select
                    value={editableRoute}
                    onChange={e => setEditableRoute(e.target.value as any)}
                    className="w-full bg-[#1a1614] border border-[#3f342d] rounded-lg p-2 text-[#f4efe8]"
                  >
                    <option value="VO_exclusiva">Via Oral Exclusiva</option>
                    <option value="VO_mista">Via Oral Mista + Suplementação</option>
                    <option value="SNE">Sonda Nasoentérica (SNE)</option>
                    <option value="GTT">Gastrostomia (GTT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#a69a8f] mb-1 font-semibold">Frequência das Sessões</label>
                  <input
                    type="text"
                    value={editablePlan.frequency}
                    onChange={e => setEditablePlan({ ...editablePlan, frequency: e.target.value })}
                    className="w-full bg-[#1a1614] border border-[#3f342d] rounded-lg p-2 text-[#f4efe8]"
                  />
                </div>

                <div>
                  <label className="block text-[#a69a8f] mb-1 font-semibold">Prescrição de Consistências (IDDSI)</label>
                  <input
                    type="text"
                    value={editablePlan.dietaryPrescription}
                    onChange={e => setEditablePlan({ ...editablePlan, dietaryPrescription: e.target.value })}
                    className="w-full bg-[#1a1614] border border-[#3f342d] rounded-lg p-2 text-[#f4efe8]"
                  />
                </div>

                <div>
                  <label className="block text-[#a69a8f] mb-1 font-semibold">Espessamento de Líquidos & Dosagem</label>
                  <input
                    type="text"
                    value={editablePlan.liquidThickening}
                    onChange={e => setEditablePlan({ ...editablePlan, liquidThickening: e.target.value })}
                    className="w-full bg-[#1a1614] border border-[#3f342d] rounded-lg p-2 text-[#f4efe8]"
                  />
                </div>

                <div>
                  <label className="block text-[#a69a8f] mb-1 font-semibold">Orientações Críticas aos Cuidadores</label>
                  <textarea
                    rows={3}
                    value={editablePlan.caregiverGuidelines}
                    onChange={e => setEditablePlan({ ...editablePlan, caregiverGuidelines: e.target.value })}
                    className="w-full bg-[#1a1614] border border-[#3f342d] rounded-lg p-2 text-[#f4efe8]"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSavePlan}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#c8a88a] text-[#181513] font-bold text-xs"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Plano de Tratamento</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Manobras Posturais e Deglutitórias */}
                  <div className="p-4 rounded-xl bg-[#1a1614] border border-[#332a24] space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#c8a88a] flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Manobras Posturais Protetivas
                    </h4>
                    <ul className="space-y-1.5 text-xs text-[#d6c7b7]">
                      {currentRecord.treatmentPlan.posturalManeuvers.map((m, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#c8a88a]">•</span>
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>

                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#c8a88a] flex items-center gap-2 pt-2">
                      <Utensils className="w-4 h-4" />
                      Manobras de Deglutição
                    </h4>
                    <ul className="space-y-1.5 text-xs text-[#d6c7b7]">
                      {currentRecord.treatmentPlan.deglutitionManeuvers.map((m, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#c8a88a]">•</span>
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Exercícios e Estimulações */}
                  <div className="p-4 rounded-xl bg-[#1a1614] border border-[#332a24] space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#c8a88a] flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Exercícios Miofuncionais Orofaciais
                    </h4>
                    <ul className="space-y-1.5 text-xs text-[#d6c7b7]">
                      {currentRecord.treatmentPlan.myofunctionalExercises.map((ex, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#c8a88a]">•</span>
                          <span>{ex}</span>
                        </li>
                      ))}
                    </ul>

                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#c8a88a] flex items-center gap-2 pt-2">
                      <Sparkles className="w-4 h-4" />
                      Estratégias Sensoriais
                    </h4>
                    <ul className="space-y-1.5 text-xs text-[#d6c7b7]">
                      {currentRecord.treatmentPlan.sensoryStrategies.map((s, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#c8a88a]">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#28211d] border border-[#42362f] text-xs">
                  <span className="font-bold text-[#c8a88a] block mb-1">Rotina de Acompanhamento & Frequência:</span>
                  <p className="text-[#f4efe8]">{currentRecord.treatmentPlan.frequency}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 6. TRIAGENS RaDI VINCULADAS */}
      {activeTab === 'avaliacoes' && (
        <div className="space-y-6">
          <div className="bg-[#221d1a] border border-[#3a312c] rounded-2xl p-5 sm:p-6">
            <h3 className="text-lg font-bold font-serif text-[#f4efe8] mb-1">
              Resultados de Triagens RaDI do Paciente
            </h3>
            <p className="text-xs text-[#a69a8f] mb-4">
              Histórico das 9 perguntas com score e recomendações fonoaudiológicas oficiais
            </p>

            {patientRadis.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#a69a8f]">
                Nenhuma avaliação RaDI realizada para este paciente ainda.
              </div>
            ) : (
              <div className="space-y-4">
                {patientRadis.map(r => (
                  <div key={r.id} className="p-4 rounded-xl bg-[#1a1614] border border-[#332a24]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#f4efe8]">
                        Data da Avaliação: {new Date(r.date).toLocaleDateString('pt-BR')}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        r.riskLevel === 'Alto Risco' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                        r.riskLevel === 'Risco Moderado' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}>
                        {r.riskLevel} ({r.score}/9)
                      </span>
                    </div>
                    <p className="text-xs text-[#d6c7b7] leading-relaxed">
                      <strong>Recomendações:</strong> {r.clinicalRecommendations}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: NOVA EVOLUÇÃO DE SESSÃO (SOAP) */}
      {isAddingSession && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#221d1a] border border-[#3a312c] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#332a24]">
              <div>
                <h3 className="text-lg font-bold font-serif text-[#f4efe8]">
                  Evoluir Sessão Fonoaudiológica #{currentRecord.sessions.length + 1}
                </h3>
                <p className="text-xs text-[#a69a8f]">
                  Paciente: {selectedPatient.name} • Modelo SOAP Fonoaudiológico
                </p>
              </div>

              <button
                onClick={() => setIsAddingSession(false)}
                className="p-1.5 rounded-lg bg-[#2c2420] text-[#a69a8f] hover:text-[#f4efe8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSession} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#a69a8f] mb-1 font-semibold">Data da Sessão</label>
                  <input
                    type="date"
                    required
                    value={newSession.date}
                    onChange={e => setNewSession({ ...newSession, date: e.target.value })}
                    className="w-full bg-[#1a1614] border border-[#3f342d] rounded-lg p-2.5 text-[#f4efe8]"
                  />
                </div>

                <div>
                  <label className="block text-[#a69a8f] mb-1 font-semibold">Nível FOIS nesta Sessão</label>
                  <select
                    value={newSession.currentFois}
                    onChange={e => setNewSession({ ...newSession, currentFois: Number(e.target.value) })}
                    className="w-full bg-[#1a1614] border border-[#3f342d] rounded-lg p-2.5 text-[#f4efe8]"
                  >
                    {FOIS_SCALE.map(s => (
                      <option key={s.level} value={s.level}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#c8a88a] mb-1 font-bold">
                  S - Subjetivo (Relato do Paciente / Cuidador sobre alimentação)
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Ex: Cuidador informa que paciente aceitou bem o almoço pastoso, sem queixa de dor ao engolir..."
                  value={newSession.subjective}
                  onChange={e => setNewSession({ ...newSession, subjective: e.target.value })}
                  className="w-full bg-[#1a1614] border border-[#3f342d] rounded-lg p-2.5 text-[#f4efe8]"
                />
              </div>

              <div>
                <label className="block text-blue-400 mb-1 font-bold">
                  O - Objetivo (Exercícios executados, consistências testadas, ausculta)
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Ex: Realizado treino com 5ml de água gelada espessada nível 3. Ausculta cervical limpa pré e pós..."
                  value={newSession.objective}
                  onChange={e => setNewSession({ ...newSession, objective: e.target.value })}
                  className="w-full bg-[#1a1614] border border-[#3f342d] rounded-lg p-2.5 text-[#f4efe8]"
                />
              </div>

              <div>
                <label className="block text-amber-400 mb-1 font-bold">
                  A - Avaliação / Parecer Clínico (Resposta motora e proteção)
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Ex: Boa adesão à manobra de queixo para baixo, sem sinais de aspiração silente..."
                  value={newSession.assessment}
                  onChange={e => setNewSession({ ...newSession, assessment: e.target.value })}
                  className="w-full bg-[#1a1614] border border-[#3f342d] rounded-lg p-2.5 text-[#f4efe8]"
                />
              </div>

              <div>
                <label className="block text-emerald-400 mb-1 font-bold">
                  P - Plano / Condutas Estabelecidas
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Ex: Manter dieta pastosa IDDSI 5. Orientar família sobre postura a 90°. Próxima sessão na quinta-feira..."
                  value={newSession.plan}
                  onChange={e => setNewSession({ ...newSession, plan: e.target.value })}
                  className="w-full bg-[#1a1614] border border-[#3f342d] rounded-lg p-2.5 text-[#f4efe8]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#332a24]">
                <button
                  type="button"
                  onClick={() => setIsAddingSession(false)}
                  className="px-4 py-2 rounded-xl bg-[#2c2420] text-[#a69a8f] font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#c8a88a] hover:bg-[#b89574] text-[#181513] font-bold shadow-md"
                >
                  Assinar e Salvar Sessão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVA META TERAPÊUTICA */}
      {isAddingObjective && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#221d1a] border border-[#3a312c] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#332a24]">
              <h3 className="text-lg font-bold font-serif text-[#f4efe8]">
                Adicionar Meta Terapêutica
              </h3>
              <button
                onClick={() => setIsAddingObjective(false)}
                className="p-1 rounded-lg bg-[#2c2420] text-[#a69a8f]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddObjective} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#a69a8f] mb-1 font-semibold">Prazo da Meta</label>
                <select
                  value={newObjective.term}
                  onChange={e => setNewObjective({ ...newObjective, term: e.target.value as any })}
                  className="w-full bg-[#1a1614] border border-[#3f342d] rounded-lg p-2.5 text-[#f4efe8]"
                >
                  <option value="curto_prazo">Curto Prazo (1 a 4 semanas)</option>
                  <option value="medio_prazo">Médio Prazo (1 a 3 meses)</option>
                  <option value="longo_prazo">Longo Prazo (&gt; 3 meses / Manutenção)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#a69a8f] mb-1 font-semibold">Descrição do Objetivo Clínico</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ex: Eliminar episódios de estase em valéculas e aumentar a força lingual..."
                  value={newObjective.description}
                  onChange={e => setNewObjective({ ...newObjective, description: e.target.value })}
                  className="w-full bg-[#1a1614] border border-[#3f342d] rounded-lg p-2.5 text-[#f4efe8]"
                />
              </div>

              <div>
                <label className="block text-[#a69a8f] mb-1 font-semibold">Data-Alvo Prevista</label>
                <input
                  type="date"
                  required
                  value={newObjective.targetDate}
                  onChange={e => setNewObjective({ ...newObjective, targetDate: e.target.value })}
                  className="w-full bg-[#1a1614] border border-[#3f342d] rounded-lg p-2.5 text-[#f4efe8]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-[#332a24]">
                <button
                  type="button"
                  onClick={() => setIsAddingObjective(false)}
                  className="px-4 py-2 rounded-xl bg-[#2c2420] text-[#a69a8f]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#c8a88a] text-[#181513] font-bold"
                >
                  Cadastrar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
