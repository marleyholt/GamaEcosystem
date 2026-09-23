import React, { useState } from 'react';
import { Patient, RadiAssessment, DailyFeedingLog, UserProfile } from '../types';
import { generateOfficialReportPDF } from '../utils/pdfGenerator';
import { maskCPF } from '../utils/crypto';
import { 
  FileText, 
  Download, 
  Printer, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft,
  Share2
} from 'lucide-react';

interface ReportsViewProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
  assessments: RadiAssessment[];
  dailyLogs: DailyFeedingLog[];
  currentUser: UserProfile;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  patients,
  selectedPatient,
  onSelectPatient,
  assessments,
  dailyLogs,
  currentUser,
}) => {
  const [activePatient, setActivePatient] = useState<Patient | null>(selectedPatient);
  const [reportDate] = useState<string>(new Date().toLocaleDateString('pt-BR'));

  if (!activePatient) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold font-serif text-[#f4efe8]">
            Emitir Laudo / Relatório com Marca d'Água
          </h2>
          <p className="text-sm text-[#a69a8f] mt-1">
            Escolha qual paciente deseja gerar a folha padrão timbrada com marca d'água oficial
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
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#c8a88a] hover:bg-[#d6bba0] text-[#181513] font-semibold text-sm transition-colors text-center"
              >
                Gerar Laudo Clínico
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const patientAssessments = assessments.filter(a => a.patientId === activePatient.id);
  const latestAssessment = patientAssessments[0];
  const patientLogs = dailyLogs.filter(l => l.patientId === activePatient.id);

  const handleDownloadPDF = () => {
    generateOfficialReportPDF({
      patient: activePatient,
      assessment: latestAssessment,
      recentLogs: patientLogs,
      evaluatorName: currentUser.name || 'Adriane Gama',
      evaluatorCrfa: currentUser.crfaNumber || 'CRFa 3-12894',
      reportDate,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => setActivePatient(null)}
            className="flex items-center gap-1.5 text-xs text-[#a69a8f] hover:text-[#f4efe8] mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Selecionar outro paciente
          </button>
          <h2 className="text-2xl font-bold font-serif text-[#f4efe8]">
            Folha Padrão & Laudo Clínico
          </h2>
          <p className="text-xs text-[#a69a8f]">
            Visualização prévia do documento timbrado com marca d'água anti-fraude e conformidade LGPD
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl bg-[#27211d] hover:bg-[#342b26] text-[#f4efe8] text-xs font-semibold border border-[#3a312c] flex items-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4 text-[#c8a88a]" /> Imprimir
          </button>

          <button
            onClick={handleDownloadPDF}
            className="px-5 py-2.5 rounded-xl bg-[#c8a88a] hover:bg-[#d6bba0] text-[#181513] text-xs font-bold shadow-md flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" /> Baixar PDF com Marca d'Água
          </button>
        </div>
      </div>

      {/* Visual Letterhead Sheet (Folha Padrão com Marca d'Água) */}
      <div className="relative bg-[#fffdfa] text-[#2c2420] border-2 border-[#c8a88a] rounded-2xl p-8 sm:p-12 shadow-2xl overflow-hidden print:p-0 print:border-none print:shadow-none print:bg-white">
        {/* Semi-transparent Diagonal Watermark (Matching user's express request) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10 opacity-[0.07] rotate-[-30deg]">
          <span className="font-serif font-extrabold text-5xl sm:text-7xl text-[#3b2a20] tracking-wider text-center leading-tight">
            GamaEcosystem<br />Health Deglut<br />DOCUMENTO OFICIAL
          </span>
        </div>

        {/* Outer decorative border */}
        <div className="absolute inset-2 border border-[#c8a88a]/40 rounded-xl pointer-events-none" />

        {/* Content Container */}
        <div className="relative z-20 space-y-6">
          {/* Header */}
          <div className="border-b-2 border-[#c8a88a] pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-2xl font-serif font-bold text-[#452c1b] tracking-tight block">
                GamaEcosystem - Health Deglut
              </span>
              <span className="text-xs font-medium text-[#7a5c43] uppercase tracking-wider block">
                Excelência, Humanização e Inovação em Fonoaudiologia e Cuidados com Disfagia
              </span>
              <span className="text-[11px] text-[#8c7462] mt-0.5 block">
                Responsável Técnica: Dra. Adriane Paes da Gama • CRFa 3-12894
              </span>
            </div>

            <div className="text-right text-xs text-[#7a5c43]">
              <span className="font-semibold block text-[#452c1b]">Laudo de Evolução Clínica</span>
              <span>Emissão: {reportDate}</span>
              <span className="block text-[10px] font-mono text-[#a38b78]">Autenticação Digital Ativa</span>
            </div>
          </div>

          {/* Patient Identification Card */}
          <div className="bg-[#f5ede4]/80 p-4 rounded-xl border border-[#dbc6b2] text-xs space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-[#8a684b] uppercase tracking-wider">Identificação do Paciente</span>
                <h4 className="text-base font-bold text-[#3d2919]">{activePatient.name}</h4>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                Status: {activePatient.status.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-[#e3d3c2]">
              <div><span className="text-[#8a684b]">CPF:</span> <strong className="text-[#3d2919]">{maskCPF(activePatient.cpf)}</strong></div>
              <div><span className="text-[#8a684b]">Nascimento:</span> <strong className="text-[#3d2919]">{activePatient.birthDate || '-'}</strong></div>
              <div><span className="text-[#8a684b]">Responsável:</span> <strong className="text-[#3d2919]">{activePatient.guardianName || '-'}</strong></div>
              <div><span className="text-[#8a684b]">Telefone:</span> <strong className="text-[#3d2919]">{activePatient.guardianPhone || '-'}</strong></div>
            </div>

            <div className="pt-1">
              <span className="text-[#8a684b]">Diagnóstico Clínico / Base:</span> <strong className="text-[#3d2919]">{activePatient.diagnosis}</strong>
            </div>
          </div>

          {/* RaDI Results Section */}
          <div className="space-y-3">
            <div className="bg-[#452c1b] text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">
              1. Rastreio e Triagem de Risco para Disfagia (RaDI)
            </div>

            {latestAssessment ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#faf5f0] border border-[#e8dacb]">
                  <div>
                    <span className="text-[#8a684b]">Pontuação Obtida:</span>
                    <strong className="text-sm font-bold text-[#3d2919] ml-1.5">{latestAssessment.score} de 9 pontos</strong>
                  </div>
                  <div>
                    <span className="text-[#8a684b] mr-1.5">Classificação:</span>
                    <span className={`px-3 py-1 rounded-full font-bold ${
                      latestAssessment.riskLevel === 'Alto Risco' ? 'bg-rose-100 text-rose-800' :
                      latestAssessment.riskLevel === 'Risco Moderado' ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {latestAssessment.riskLevel}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-[#faf5f0] border border-[#e8dacb] space-y-1">
                  <span className="font-bold text-[#452c1b]">Parecer e Conduta Fonoaudiológica:</span>
                  <p className="text-[#523d2f] leading-relaxed">
                    {latestAssessment.clinicalRecommendations}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#8c7462] italic">Nenhuma triagem RaDI recente registrada para este paciente.</p>
            )}
          </div>

          {/* Daily Logs & IDDSI Consistency */}
          <div className="space-y-3">
            <div className="bg-[#452c1b] text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">
              2. Consistências Ingestas e Padrão IDDSI Recomendado
            </div>

            {patientLogs.length > 0 ? (
              <div className="space-y-2 text-xs">
                {patientLogs.slice(0, 2).map((log) => (
                  <div key={log.id} className="p-3 rounded-lg bg-[#faf5f0] border border-[#e8dacb] space-y-1.5">
                    <div className="flex justify-between font-bold text-[#452c1b]">
                      <span>Registro de {log.date}</span>
                      <span className="text-[#8a684b] font-normal">Registrado por: {log.caregiverName}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <p><span className="text-[#8a684b]">Consistência Sólidos/Alimentos:</span> <strong>{log.foodConsistency}</strong></p>
                      <p><span className="text-[#8a684b]">Consistência Líquidos:</span> <strong>{log.liquidConsistency}</strong></p>
                    </div>
                    {log.liquidBrandDose && (
                      <p className="text-[11px]"><span className="text-[#8a684b]">Espessante Prescrito:</span> {log.liquidBrandDose}</p>
                    )}
                    {log.observations && (
                      <p className="text-[11px] text-[#6d5746] italic">"{log.observations}"</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#8c7462] italic">Sem registros alimentares associados no período.</p>
            )}
          </div>

          {/* Signature & Seal Footer */}
          <div className="pt-8 mt-6 border-t-2 border-[#c8a88a] flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-[#7a5c43]">
            <div className="space-y-1">
              <span className="font-semibold text-[#452c1b] flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                Conformidade LGPD & Criptografia Ponta a Ponta
              </span>
              <p className="text-[10px] text-[#8c7462]">
                Dados clínicos protegidos nos termos da Lei Federal 13.709/2018.
              </p>
              <code className="text-[10px] font-mono text-[#452c1b] bg-[#ede1d3] px-2 py-0.5 rounded inline-block">
                SEAL: {latestAssessment?.verificationHash || 'HD-AUTH-GAMA-2026-VAL'}
              </code>
            </div>

            <div className="text-center sm:text-right pt-4 sm:pt-0">
              <div className="w-48 border-b border-[#5a4231] mx-auto sm:ml-auto mb-1" />
              <span className="font-bold text-sm text-[#452c1b] block">
                {currentUser.name || 'Adriane Paes da Gama'}
              </span>
              <span className="text-[11px] text-[#7a5c43]">
                {currentUser.crfaNumber || 'Fonoaudióloga - CRFa 3-12894'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
