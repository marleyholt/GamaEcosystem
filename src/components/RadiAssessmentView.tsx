import React, { useState } from 'react';
import { Patient, RadiAssessment, RiskLevel, UserProfile } from '../types';
import { RADI_QUESTIONS } from '../data/mockData';
import { generateClinicalSeal } from '../utils/crypto';
import { 
  Activity, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ShieldAlert,
  Sparkles,
  Save
} from 'lucide-react';

interface RadiAssessmentViewProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
  currentUser: UserProfile;
  onSaveAssessment: (assessment: RadiAssessment) => void;
  onGenerateReport: (assessment: RadiAssessment) => void;
}

export const RadiAssessmentView: React.FC<RadiAssessmentViewProps> = ({
  patients,
  selectedPatient,
  onSelectPatient,
  currentUser,
  onSaveAssessment,
  onGenerateReport,
}) => {
  const [activePatient, setActivePatient] = useState<Patient | null>(selectedPatient);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<string>('');
  const [sealHash, setSealHash] = useState<string>('');

  // If no patient picked, show the selection screen (matching video at 00:06)
  if (!activePatient) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold font-serif text-[#f4efe8]">
            Selecionar Paciente para RaDI
          </h2>
          <p className="text-sm text-[#a69a8f] mt-1">
            Escolha qual paciente deseja realizar o RaDI de disfagia
          </p>
        </div>

        <div className="space-y-3">
          {patients.map((patient) => (
            <div
              key={patient.id}
              className="p-5 rounded-2xl bg-[#221d1a] border border-[#3a312c] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#342b26] flex items-center justify-center text-[#c8a88a] font-bold">
                  {patient.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-[#f4efe8] text-base">{patient.name}</h3>
                  <p className="text-xs text-[#a69a8f]">
                    Diagnóstico: <span className="text-[#f4efe8]">{patient.diagnosis}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setActivePatient(patient);
                  onSelectPatient(patient);
                  setCurrentStep(0);
                  setAnswers({});
                  setIsFinished(false);
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#c8a88a] hover:bg-[#d6bba0] text-[#181513] font-semibold text-sm transition-colors text-center"
              >
                Iniciar RaDI
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Calculate score
  const answeredCount = Object.keys(answers).length;
  const totalScore = Object.values(answers).filter(Boolean).length;
  
  const getRiskLevel = (score: number): RiskLevel => {
    if (score <= 2) return 'Baixo Risco';
    if (score <= 5) return 'Risco Moderado';
    return 'Alto Risco';
  };

  const risk = getRiskLevel(totalScore);

  const handleNext = async () => {
    if (currentStep < RADI_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calculate final recommendations
      let recText = '';
      if (risk === 'Alto Risco') {
        recText = 'Sinais clínicos de elevado risco para broncoaspiração laringotraqueal. Sugere-se suspensão de líquidos finos até avaliação fonoaudiológica instrumental (videodeglutograma/FEES). Dieta adaptada para nível Pastoso (IDDSI 4) e líquido moderadamente espessado (IDDSI 3). Cuidado redobrado com higiene bucal e monitoramento de saturação e temperatura.';
      } else if (risk === 'Risco Moderado') {
        recText = 'Risco moderado para disfagia orofaríngea. Recomendada readequação de textura para Macio e Picado (IDDSI 6) ou Moído e Úmido (IDDSI 5). Monitorar tempo de refeição, manter postura sentada a 90° e fracionar as porções. Acompanhamento semanal com Fonoaudiologia.';
      } else {
        recText = 'Baixo risco de disfagia funcional no momento. Manter consistência habitual sob vigilância de sinais de fadiga ou engasgo esporádico. Reavaliar a cada 30 dias.';
      }
      setRecommendations(recText);
      const seal = await generateClinicalSeal(activePatient.id, new Date().toISOString(), currentUser.id);
      setSealHash(seal);
      setIsFinished(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      setActivePatient(null);
    }
  };

  const handleSave = () => {
    const newAssessment: RadiAssessment = {
      id: `radi_${Date.now()}`,
      patientId: activePatient.id,
      patientName: activePatient.name,
      evaluatorId: currentUser.id,
      evaluatorName: currentUser.name,
      evaluatorRole: currentUser.role === 'fonoaudiologo' ? `Fonoaudióloga (${currentUser.crfaNumber || 'CRFa'})` : 'Avaliador Clínico',
      date: new Date().toLocaleDateString('pt-BR'),
      answers,
      score: totalScore,
      riskLevel: risk,
      clinicalRecommendations: recommendations,
      createdAt: new Date().toISOString(),
      verificationHash: sealHash
    };

    onSaveAssessment(newAssessment);
  };

  const currentQ = RADI_QUESTIONS[currentStep];
  const progressPercent = Math.round(((currentStep + 1) / RADI_QUESTIONS.length) * 100);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Top Header with Back to selection */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActivePatient(null)}
          className="flex items-center gap-2 text-xs text-[#a69a8f] hover:text-[#f4efe8]"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para lista de pacientes
        </button>
        <span className="text-xs px-3 py-1 rounded-full bg-[#2a231f] text-[#c8a88a] border border-[#3f342d]">
          Paciente: {activePatient.name}
        </span>
      </div>

      {!isFinished ? (
        /* Questionnaire Wizard (Matching video at 01:01) */
        <div className="bg-[#221d1a] border border-[#3a312c] rounded-2xl p-6 sm:p-8 space-y-6 shadow-md">
          <div className="flex items-center justify-between border-b border-[#342b26] pb-4">
            <div>
              <h2 className="text-xl font-bold font-serif text-[#f4efe8]">
                Triagem de Disfagia - {activePatient.name}
              </h2>
              <p className="text-xs text-[#a69a8f] mt-0.5">
                Progresso: {progressPercent}%
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-[#2c2420] text-xs font-semibold text-[#c8a88a] border border-[#4a3e37]">
              Pergunta {currentStep + 1} de {RADI_QUESTIONS.length}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-[#2c2522] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#c8a88a] transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Question Text */}
          <div className="py-6 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-semibold text-[#f4efe8] leading-relaxed">
              {currentQ.question}
            </h3>
            <p className="text-xs text-[#a69a8f] mt-3">
              Impacto Clínico: {currentQ.impact}
            </p>
          </div>

          {/* Answer choices (Radio buttons matching video) */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setAnswers({ ...answers, [currentQ.id]: false })}
              className={`py-4 px-6 rounded-xl border flex items-center justify-center gap-3 text-base font-semibold transition-all ${
                answers[currentQ.id] === false
                  ? 'bg-[#352c26] border-[#c8a88a] text-[#f4efe8] ring-2 ring-[#c8a88a]/40 shadow-inner'
                  : 'bg-[#27211d] border-[#3a312c] text-[#a69a8f] hover:bg-[#2e2621]'
              }`}
            >
              <span className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                answers[currentQ.id] === false ? 'border-[#c8a88a] bg-[#c8a88a]' : 'border-[#61544a]'
              }`}>
                {answers[currentQ.id] === false && <span className="w-2 h-2 rounded-full bg-[#181513]" />}
              </span>
              Não
            </button>

            <button
              type="button"
              onClick={() => setAnswers({ ...answers, [currentQ.id]: true })}
              className={`py-4 px-6 rounded-xl border flex items-center justify-center gap-3 text-base font-semibold transition-all ${
                answers[currentQ.id] === true
                  ? 'bg-[#352c26] border-[#c8a88a] text-[#f4efe8] ring-2 ring-[#c8a88a]/40 shadow-inner'
                  : 'bg-[#27211d] border-[#3a312c] text-[#a69a8f] hover:bg-[#2e2621]'
              }`}
            >
              <span className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                answers[currentQ.id] === true ? 'border-[#c8a88a] bg-[#c8a88a]' : 'border-[#61544a]'
              }`}>
                {answers[currentQ.id] === true && <span className="w-2 h-2 rounded-full bg-[#181513]" />}
              </span>
              Sim
            </button>
          </div>

          {/* Nav buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-[#342b26]">
            <button
              onClick={handlePrevious}
              className="px-5 py-2.5 rounded-xl bg-[#27211d] hover:bg-[#342b26] text-[#f4efe8] text-sm font-medium border border-[#3a312c] flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>

            <button
              onClick={handleNext}
              disabled={answers[currentQ.id] === undefined}
              className={`px-7 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
                answers[currentQ.id] !== undefined
                  ? 'bg-[#c8a88a] hover:bg-[#d6bba0] text-[#181513] shadow-md'
                  : 'bg-[#2c2420] text-[#6d635a] cursor-not-allowed'
              }`}
            >
              {currentStep === RADI_QUESTIONS.length - 1 ? 'Finalizar RaDI' : 'Próxima'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Results & Clinical Conclusion */
        <div className="bg-[#221d1a] border border-[#3a312c] rounded-2xl p-6 sm:p-8 space-y-6 shadow-lg animate-fadeIn">
          <div className="text-center space-y-2">
            <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
              risk === 'Alto Risco' ? 'bg-rose-950/60 text-rose-400 border border-rose-800' :
              risk === 'Risco Moderado' ? 'bg-amber-950/60 text-amber-400 border border-amber-800' :
              'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
            }`}>
              {risk === 'Alto Risco' ? <AlertTriangle className="w-8 h-8" /> : <Activity className="w-8 h-8" />}
            </div>
            <h2 className="text-2xl font-bold font-serif text-[#f4efe8]">
              Resultado da Triagem RaDI
            </h2>
            <p className="text-xs text-[#a69a8f]">
              Paciente: {activePatient.name} • Data: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>

          {/* Score & Risk Badge */}
          <div className="p-5 rounded-xl bg-[#27211d] border border-[#3a312c] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-[#a69a8f] uppercase tracking-wider font-semibold">
                Classificação de Risco
              </span>
              <h3 className={`text-2xl font-bold mt-0.5 ${
                risk === 'Alto Risco' ? 'text-rose-400' :
                risk === 'Risco Moderado' ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {risk}
              </h3>
              <p className="text-xs text-[#a69a8f] mt-1">
                Pontos afirmativos: {totalScore} de {RADI_QUESTIONS.length} perguntas
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-[#a69a8f] block">Carimbo Criptográfico:</span>
              <code className="text-xs font-mono text-[#c8a88a] bg-[#1a1614] px-2.5 py-1 rounded border border-[#3f342d] inline-block mt-1">
                {sealHash || 'HD-SEAL-VERIFIED'}
              </code>
            </div>
          </div>

          {/* Recommendations edit box */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#f4efe8] flex items-center justify-between">
              <span>Condutas Fonoaudiológicas & Recomendações:</span>
              <span className="text-[11px] text-[#c8a88a]">Editável pelo profissional</span>
            </label>
            <textarea
              rows={4}
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              className="w-full bg-[#1c1815] border border-[#3a312c] rounded-xl p-3 text-sm text-[#f4efe8] focus:outline-none focus:border-[#c8a88a]"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#342b26]">
            <button
              onClick={() => setIsFinished(false)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#27211d] hover:bg-[#342b26] text-[#a69a8f] text-sm border border-[#3a312c]"
            >
              Revisar Respostas
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleSave}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#c8a88a] hover:bg-[#d6bba0] text-[#181513] font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Salvar no Prontuário
              </button>

              <button
                onClick={() => {
                  const evalObj: RadiAssessment = {
                    id: `radi_${Date.now()}`,
                    patientId: activePatient.id,
                    patientName: activePatient.name,
                    evaluatorId: currentUser.id,
                    evaluatorName: currentUser.name,
                    evaluatorRole: currentUser.role === 'fonoaudiologo' ? `Fonoaudióloga (${currentUser.crfaNumber || 'CRFa'})` : 'Avaliador Clínico',
                    date: new Date().toLocaleDateString('pt-BR'),
                    answers,
                    score: totalScore,
                    riskLevel: risk,
                    clinicalRecommendations: recommendations,
                    createdAt: new Date().toISOString(),
                    verificationHash: sealHash
                  };
                  onGenerateReport(evalObj);
                }}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#352c26] hover:bg-[#433830] text-[#c8a88a] font-semibold text-sm border border-[#4a3e37] transition-all flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Gerar Laudo PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
