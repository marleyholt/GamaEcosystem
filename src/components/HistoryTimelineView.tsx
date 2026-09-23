import React, { useState } from 'react';
import { Patient, RadiAssessment, DailyFeedingLog } from '../types';
import { 
  Clock, 
  Activity, 
  Utensils, 
  ArrowLeft, 
  FileText, 
  ShieldCheck, 
  Calendar, 
  Filter, 
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

interface HistoryTimelineViewProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
  assessments: RadiAssessment[];
  dailyLogs: DailyFeedingLog[];
  onGenerateReport: (assessment: RadiAssessment, logs: DailyFeedingLog[]) => void;
}

export const HistoryTimelineView: React.FC<HistoryTimelineViewProps> = ({
  patients,
  selectedPatient,
  onSelectPatient,
  assessments,
  dailyLogs,
  onGenerateReport,
}) => {
  const [activePatient, setActivePatient] = useState<Patient | null>(selectedPatient);
  const [filterType, setFilterType] = useState<'all' | 'radi' | 'logs'>('all');

  if (!activePatient) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold font-serif text-[#f4efe8]">
            Selecionar Paciente para Histórico
          </h2>
          <p className="text-sm text-[#a69a8f] mt-1">
            Escolha qual paciente deseja visualizar o histórico de evolução clínica
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
                Ver Histórico
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const patientAssessments = assessments.filter(a => a.patientId === activePatient.id);
  const patientLogs = dailyLogs.filter(l => l.patientId === activePatient.id);

  // Combine timeline items
  type TimelineItem = 
    | { type: 'radi'; data: RadiAssessment; date: string }
    | { type: 'log'; data: DailyFeedingLog; date: string };

  const timelineItems: TimelineItem[] = [
    ...patientAssessments.map(a => ({ type: 'radi' as const, data: a, date: a.date })),
    ...patientLogs.map(l => ({ type: 'log' as const, data: l, date: l.date }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredItems = timelineItems.filter(item => {
    if (filterType === 'radi') return item.type === 'radi';
    if (filterType === 'logs') return item.type === 'log';
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => setActivePatient(null)}
            className="flex items-center gap-1.5 text-xs text-[#a69a8f] hover:text-[#f4efe8] mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar para lista de pacientes
          </button>
          <h2 className="text-2xl font-bold font-serif text-[#f4efe8]">
            Histórico Clínico - {activePatient.name}
          </h2>
          <p className="text-xs text-[#a69a8f]">
            Linha do tempo de triagens RaDI, registros alimentares e consistências
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#221d1a] border border-[#3a312c] p-1 rounded-xl">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterType === 'all' ? 'bg-[#c8a88a] text-[#181513] font-bold' : 'text-[#a69a8f] hover:text-[#f4efe8]'
            }`}
          >
            Todos ({timelineItems.length})
          </button>
          <button
            onClick={() => setFilterType('radi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterType === 'radi' ? 'bg-[#c8a88a] text-[#181513] font-bold' : 'text-[#a69a8f] hover:text-[#f4efe8]'
            }`}
          >
            RaDI ({patientAssessments.length})
          </button>
          <button
            onClick={() => setFilterType('logs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterType === 'logs' ? 'bg-[#c8a88a] text-[#181513] font-bold' : 'text-[#a69a8f] hover:text-[#f4efe8]'
            }`}
          >
            Refeições ({patientLogs.length})
          </button>
        </div>
      </div>

      {/* Timeline List */}
      <div className="space-y-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item, idx) => {
            if (item.type === 'radi') {
              const assessment = item.data;
              return (
                <div
                  key={`timeline-radi-${assessment.id}-${idx}`}
                  className="p-5 rounded-2xl bg-[#221d1a] border border-[#3a312c] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-[#2e241f] text-[#c8a88a] border border-[#4a3e37]">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-[#c8a88a] uppercase tracking-wider">
                          Triagem de Disfagia (RaDI)
                        </span>
                        <h4 className="text-base font-bold text-[#f4efe8]">
                          {assessment.date} • Score {assessment.score}/9
                        </h4>
                      </div>
                    </div>

                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      assessment.riskLevel === 'Alto Risco' ? 'bg-rose-950/60 text-rose-300 border border-rose-800/40' :
                      assessment.riskLevel === 'Risco Moderado' ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40' :
                      'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                    }`}>
                      {assessment.riskLevel}
                    </span>
                  </div>

                  <p className="text-xs text-[#d5cbc0] bg-[#1c1815] p-3 rounded-xl border border-[#342b26]">
                    <strong className="text-[#f4efe8]">Conduta Fonoaudiológica:</strong> {assessment.clinicalRecommendations}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-[#342b26] text-xs">
                    <span className="text-[#85796f]">
                      Avaliador: {assessment.evaluatorName} ({assessment.evaluatorRole})
                    </span>
                    <button
                      onClick={() => onGenerateReport(assessment, patientLogs)}
                      className="px-3 py-1.5 rounded-lg bg-[#2f2722] hover:bg-[#3f342d] text-[#c8a88a] border border-[#4a3e37] flex items-center gap-1.5 transition-colors font-semibold"
                    >
                      <FileText className="w-3.5 h-3.5" /> Laudo com Marca d'Água
                    </button>
                  </div>
                </div>
              );
            } else {
              const log = item.data;
              return (
                <div
                  key={`timeline-log-${log.id}-${idx}`}
                  className="p-5 rounded-2xl bg-[#221d1a] border border-[#3a312c] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-[#242b23] text-emerald-400 border border-emerald-900/40">
                        <Utensils className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                          Registro de Alimentação & IDDSI
                        </span>
                        <h4 className="text-base font-bold text-[#f4efe8]">
                          {log.date}
                        </h4>
                      </div>
                    </div>

                    <span className="text-xs text-[#85796f]">
                      Por: {log.caregiverName}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-[#1c1815] border border-[#342b26]">
                      <span className="text-[#a69a8f] block">Alimento Oferecido:</span>
                      <strong className="text-[#f4efe8]">{log.foodConsistency}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#1c1815] border border-[#342b26]">
                      <span className="text-[#a69a8f] block">Líquidos Oferecidos:</span>
                      <strong className="text-[#f4efe8]">{log.liquidConsistency}</strong>
                    </div>
                  </div>

                  {log.liquidBrandDose && (
                    <p className="text-xs text-[#a69a8f]">
                      Espessante: <span className="text-[#f4efe8]">{log.liquidBrandDose}</span>
                    </p>
                  )}

                  {log.observations && (
                    <p className="text-xs text-[#a69a8f] italic bg-[#1c1815] p-2.5 rounded-lg">
                      "{log.observations}"
                    </p>
                  )}

                  {log.photos && log.photos.length > 0 && (
                    <div className="flex items-center gap-2 pt-1 overflow-x-auto">
                      {log.photos.map((photo) => (
                        <div key={photo.id} className="w-16 h-16 rounded-lg overflow-hidden border border-[#3a312c] shrink-0 bg-[#181513]">
                          <img src={photo.photoUrl} alt={photo.mealType} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
          })
        ) : (
          <div className="py-12 text-center text-[#85796f] border border-dashed border-[#3a312c] rounded-2xl">
            <Clock className="w-8 h-8 mx-auto text-[#52443b] mb-2" />
            <p className="text-sm">Nenhum registro encontrado para este filtro.</p>
          </div>
        )}
      </div>
    </div>
  );
};
