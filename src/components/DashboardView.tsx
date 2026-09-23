import React from 'react';
import { Patient, RadiAssessment, DailyFeedingLog, UserProfile, NavigationTab } from '../types';
import { 
  User, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Utensils, 
  MessageSquare, 
  Users, 
  FileText, 
  ArrowRight,
  TrendingUp,
  HeartPulse,
  Stethoscope
} from 'lucide-react';

export interface DashboardViewProps {
  selectedPatient: Patient | null;
  onSelectPatientClick?: () => void;
  onNavigate: (tab: any) => void;
  latestAssessment?: RadiAssessment;
  allAssessments?: RadiAssessment[];
  recentLogs?: DailyFeedingLog[];
  patients?: Patient[];
  onSelectPatient?: (patient: Patient) => void;
  assessments?: RadiAssessment[];
  dailyLogs?: DailyFeedingLog[];
  currentUser?: UserProfile;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  selectedPatient,
  onSelectPatientClick,
  onNavigate,
  latestAssessment: propLatestAssessment,
  allAssessments: propAllAssessments = [],
  recentLogs: propRecentLogs = [],
  patients = [],
  onSelectPatient,
  assessments = [],
  dailyLogs = [],
  currentUser,
}) => {
  const combinedAssessments = assessments.length > 0 ? assessments : propAllAssessments;
  const combinedLogs = dailyLogs.length > 0 ? dailyLogs : propRecentLogs;

  const patientAssessments = selectedPatient 
    ? combinedAssessments.filter(a => a.patientId === selectedPatient.id)
    : [];

  const latestAssessment = propLatestAssessment || patientAssessments[0];
  const currentRisk = latestAssessment?.riskLevel || 'Não avaliado';
  const lastEvalDate = latestAssessment?.date || 'Nunca';

  return (
    <div className="space-y-6">
      {/* Paciente Selecionado Card (Matching the video) */}
      <div className="bg-[#221d1a] border border-[#3a312c] rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold font-serif text-[#f4efe8]">
            Paciente Selecionado
          </h2>
          {selectedPatient && (
            <button
              onClick={onSelectPatientClick}
              className="text-xs px-3 py-1 rounded-md bg-[#2d2622] hover:bg-[#3d332d] text-[#c8a88a] border border-[#4a3e37] transition-colors"
            >
              Trocar
            </button>
          )}
        </div>

        {selectedPatient ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#342b26] border border-[#52443b] flex items-center justify-center text-[#c8a88a] font-bold text-lg">
                {selectedPatient.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#f4efe8]">
                  {selectedPatient.name}
                </h3>
                <p className="text-xs text-[#a69a8f]">
                  Diagnóstico: <span className="text-[#f4efe8]">{selectedPatient.diagnosis}</span>
                </p>
                <p className="text-[11px] text-[#85796f] mt-0.5">
                  Profissional: {selectedPatient.fonoaudiologistName || 'Adriane Gama'} • Cuidador: {selectedPatient.caregiverName || 'Zeca Souza'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                Ativo
              </span>
              <button
                onClick={() => onNavigate('prontuario')}
                className="text-xs px-3 py-1.5 rounded-lg bg-[#2e2621] hover:bg-[#3d332d] text-[#c8a88a] border border-[#483a31] flex items-center gap-1.5 transition-colors font-medium shadow-sm"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Abrir Prontuário (PEP)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="py-5 text-center">
            <p className="text-sm text-[#a69a8f] mb-4">
              Nenhum paciente selecionado no momento.
            </p>
            <button
              onClick={onSelectPatientClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c8a88a] hover:bg-[#d6bba0] text-[#181513] font-semibold text-sm transition-all shadow-md"
            >
              <User className="w-4 h-4" />
              Selecionar Paciente
            </button>
          </div>
        )}
      </div>

      {/* Metrics Row (Status Atual & Última Avaliação) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status Atual */}
        <div className="bg-[#221d1a] border border-[#3a312c] rounded-2xl p-5 flex items-start gap-4">
          <div className={`p-3 rounded-xl ${
            currentRisk === 'Alto Risco' 
              ? 'bg-rose-950/50 text-rose-400 border border-rose-800/40'
              : currentRisk === 'Risco Moderado'
              ? 'bg-amber-950/50 text-amber-400 border border-amber-800/40'
              : currentRisk === 'Baixo Risco'
              ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/40'
              : 'bg-[#2d2622] text-[#a69a8f] border border-[#4a3e37]'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-[#a69a8f] font-medium uppercase tracking-wider">
              Status Atual
            </span>
            <h4 className={`text-2xl font-bold mt-1 ${
              currentRisk === 'Alto Risco' ? 'text-rose-400' :
              currentRisk === 'Risco Moderado' ? 'text-amber-400' :
              currentRisk === 'Baixo Risco' ? 'text-emerald-400' : 'text-[#f4efe8]'
            }`}>
              {currentRisk}
            </h4>
            <p className="text-xs text-[#a69a8f] mt-1">
              {latestAssessment 
                ? `Escore RaDI: ${latestAssessment.score}/9 (${latestAssessment.riskLevel})`
                : 'Realize o questionário RaDI para determinar o risco de broncoaspiração'}
            </p>
          </div>
        </div>

        {/* Última Avaliação */}
        <div className="bg-[#221d1a] border border-[#3a312c] rounded-2xl p-5 flex items-start gap-4">
          <div className="p-3 rounded-xl bg-[#2d2622] text-[#c8a88a] border border-[#4a3e37]">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-[#a69a8f] font-medium uppercase tracking-wider">
              Última Avaliação
            </span>
            <h4 className="text-2xl font-bold text-[#f4efe8] mt-1">
              {lastEvalDate}
            </h4>
            <p className="text-xs text-[#a69a8f] mt-1">
              {latestAssessment 
                ? `Avaliador: ${latestAssessment.evaluatorName}`
                : 'Nenhum registro de avaliação até o momento'}
            </p>
          </div>
        </div>
      </div>

      {/* Evolução de Sintomas (Últimos RaDI) */}
      <div className="bg-[#221d1a] border border-[#3a312c] rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#c8a88a]" />
            <h3 className="text-lg font-bold font-serif text-[#f4efe8]">
              Evolução de Sintomas (Últimos RaDI)
            </h3>
          </div>
          <span className="text-xs text-[#a69a8f]">
            {patientAssessments.length} avaliação(ões) registrada(s)
          </span>
        </div>

        {patientAssessments.length > 0 ? (
          <div className="space-y-3">
            {patientAssessments.map((evalItem) => (
              <div 
                key={evalItem.id} 
                className="p-4 rounded-xl bg-[#27211d] border border-[#3a312c] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#f4efe8]">
                      {evalItem.date}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      evalItem.riskLevel === 'Alto Risco' ? 'bg-rose-950/60 text-rose-300 border border-rose-800/40' :
                      evalItem.riskLevel === 'Risco Moderado' ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40' :
                      'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                    }`}>
                      {evalItem.riskLevel} (Score: {evalItem.score}/9)
                    </span>
                  </div>
                  <p className="text-xs text-[#a69a8f] mt-1 line-clamp-1">
                    {evalItem.clinicalRecommendations}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('relatorios')}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[#342b26] hover:bg-[#423730] text-[#c8a88a] border border-[#4a3e37] transition-colors"
                  >
                    Gerar Laudo com Marca d'Água
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-[#a69a8f] border border-dashed border-[#3a312c] rounded-xl">
            <HeartPulse className="w-8 h-8 mx-auto text-[#52443b] mb-2" />
            <p className="text-sm">Nenhuma evolução de sintomas registrada para o paciente.</p>
            <button
              onClick={() => onNavigate('radi')}
              className="mt-3 text-xs text-[#c8a88a] hover:underline"
            >
              Iniciar primeira triagem RaDI →
            </button>
          </div>
        )}
      </div>

      {/* Ações Rápidas */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold font-serif text-[#f4efe8]">
          Ações Rápidas
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            onClick={() => onNavigate('prontuario')}
            className="p-4 rounded-xl bg-[#221d1a] hover:bg-[#2c2522] border border-[#3a312c] text-left transition-all group flex flex-col justify-between hover:border-[#c8a88a]/40"
          >
            <Stethoscope className="w-6 h-6 text-[#c8a88a] mb-3 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-sm text-[#f4efe8]">Prontuário (PEP)</span>
            <span className="text-[11px] text-[#a69a8f] mt-0.5">Evolução & Condutas</span>
          </button>

          <button
            onClick={() => onNavigate('radi')}
            className="p-4 rounded-xl bg-[#221d1a] hover:bg-[#2c2522] border border-[#3a312c] text-left transition-all group flex flex-col justify-between"
          >
            <Activity className="w-6 h-6 text-[#c8a88a] mb-3 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-sm text-[#f4efe8]">Novo RaDI</span>
            <span className="text-[11px] text-[#a69a8f] mt-0.5">Triagem de disfagia</span>
          </button>

          <button
            onClick={() => onNavigate('registro')}
            className="p-4 rounded-xl bg-[#221d1a] hover:bg-[#2c2522] border border-[#3a312c] text-left transition-all group flex flex-col justify-between"
          >
            <Utensils className="w-6 h-6 text-[#c8a88a] mb-3 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-sm text-[#f4efe8]">Registro Diário</span>
            <span className="text-[11px] text-[#a69a8f] mt-0.5">Consistências e fotos</span>
          </button>

          <button
            onClick={() => onNavigate('pacientes')}
            className="p-4 rounded-xl bg-[#221d1a] hover:bg-[#2c2522] border border-[#3a312c] text-left transition-all group flex flex-col justify-between"
          >
            <Users className="w-6 h-6 text-[#c8a88a] mb-3 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-sm text-[#f4efe8]">Pacientes</span>
            <span className="text-[11px] text-[#a69a8f] mt-0.5">Cadastro & Lista</span>
          </button>

          <button
            onClick={() => onNavigate('chat')}
            className="p-4 rounded-xl bg-[#221d1a] hover:bg-[#2c2522] border border-[#3a312c] text-left transition-all group flex flex-col justify-between"
          >
            <MessageSquare className="w-6 h-6 text-[#c8a88a] mb-3 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-sm text-[#f4efe8]">Comunicação</span>
            <span className="text-[11px] text-[#a69a8f] mt-0.5">Chat multiprofissional</span>
          </button>
        </div>
      </div>

      {/* Helper Box when no patient */}
      {!selectedPatient && (
        <div className="p-4 rounded-xl bg-[#221d1a] border border-[#3a312c] flex items-start gap-3 text-xs text-[#a69a8f]">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#f4efe8]">Selecione um paciente</p>
            <p className="mt-0.5">Escolha um paciente para visualizar seu histórico clínico, aplicar a escala RaDI e acompanhar as refeições registradas pelos cuidadores.</p>
          </div>
        </div>
      )}

      {/* Institutional Footer (Matching video) */}
      <footer className="pt-8 pb-4 border-t border-[#342b26] text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-serif font-bold text-base text-[#c8a88a]">Health Deglut</h4>
            <p className="text-xs text-[#a69a8f]">
              Excelência, Humanização e Inovação em Fonoaudiologia e cuidados com disfagia.
            </p>
          </div>
          <div className="flex gap-4 text-xs text-[#a69a8f]">
            <button onClick={() => onNavigate('resumo')} className="hover:text-[#f4efe8]">Dashboard</button>
            <button onClick={() => onNavigate('pacientes')} className="hover:text-[#f4efe8]">Pacientes</button>
            <button onClick={() => onNavigate('radi')} className="hover:text-[#f4efe8]">Avaliações</button>
            <button onClick={() => onNavigate('historico')} className="hover:text-[#f4efe8]">Histórico</button>
          </div>
        </div>
        <p className="text-[11px] text-[#6d635a] mt-4">
          © 2026 GamaEcosystem. Todos os direitos reservados. Conformidade LGPD (Lei 13.709/2018).
        </p>
      </footer>
    </div>
  );
};
