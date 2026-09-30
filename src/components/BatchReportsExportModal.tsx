import React, { useState } from 'react';
import { Patient, RadiAssessment, DailyFeedingLog, UserProfile } from '../types';
import { OfficialEvolutionData } from '../types/clinicalEvolution';
import { ClinicConfig } from '../types/clinicConfig';
import { generateOfficialReportPDF } from '../utils/pdfGenerator';
import { 
  Download, 
  CheckSquare, 
  Square, 
  X, 
  FileCheck2, 
  Sparkles, 
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';

interface BatchReportsExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  assessments: RadiAssessment[];
  dailyLogs: DailyFeedingLog[];
  officialEvolutions: OfficialEvolutionData[];
  currentUser: UserProfile;
  clinicConfig: ClinicConfig;
}

export const BatchReportsExportModal: React.FC<BatchReportsExportModalProps> = ({
  isOpen,
  onClose,
  patients,
  assessments,
  dailyLogs,
  currentUser,
  clinicConfig
}) => {
  const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>(
    patients.map(p => p.id)
  );
  const [exportType, setExportType] = useState<'pdf' | 'csv'>('pdf');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [completedMsg, setCompletedMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSelectAll = () => {
    if (selectedPatientIds.length === patients.length) {
      setSelectedPatientIds([]);
    } else {
      setSelectedPatientIds(patients.map(p => p.id));
    }
  };

  const toggleSelectPatient = (id: string) => {
    if (selectedPatientIds.includes(id)) {
      setSelectedPatientIds(selectedPatientIds.filter(pid => pid !== id));
    } else {
      setSelectedPatientIds([...selectedPatientIds, id]);
    }
  };

  // Exportação em Lote via PDF
  const handleExportPDFs = async () => {
    if (selectedPatientIds.length === 0) return;
    setIsExporting(true);
    setExportProgress(0);
    setCompletedMsg(null);

    const total = selectedPatientIds.length;
    let count = 0;

    for (const pid of selectedPatientIds) {
      const patient = patients.find(p => p.id === pid);
      if (patient) {
        const pAssessments = assessments.filter(a => a.patientId === pid);
        const pLogs = dailyLogs.filter(l => l.patientId === pid);
        
        generateOfficialReportPDF({
          patient,
          assessment: pAssessments[0],
          recentLogs: pLogs,
          evaluatorName: currentUser.name || clinicConfig.technicalResponsible || 'Adriane Gama',
          evaluatorCrfa: currentUser.crfaNumber || clinicConfig.crfa || 'CRFa 2-12628',
          reportDate: new Date().toLocaleDateString('pt-BR')
        });

        count++;
        setExportProgress(Math.round((count / total) * 100));
        // Pequena pausa para garantir processamento fluido no navegador
        await new Promise(r => setTimeout(r, 600));
      }
    }

    setIsExporting(false);
    setCompletedMsg(`Sucesso! ${total} laudo(s) gerado(s) e baixado(s) em PDF.`);
  };

  // Exportação em Lote via CSV (Consolidado de Prontuários e Avaliações)
  const handleExportCSV = () => {
    if (selectedPatientIds.length === 0) return;

    const headers = [
      'ID Paciente',
      'Nome Completo',
      'CPF',
      'Data de Nascimento',
      'Diagnóstico Principal',
      'Status',
      'Fonoaudiólogo Responsável',
      'Cuidador',
      'Total de Avaliações RaDI',
      'Total de Registros Alimentares',
      'Data de Exportação'
    ];

    const rows = selectedPatientIds.map(pid => {
      const p = patients.find(pat => pat.id === pid);
      if (!p) return [];
      const numAssessments = assessments.filter(a => a.patientId === pid).length;
      const numLogs = dailyLogs.filter(l => l.patientId === pid).length;

      return [
        `"${p.id}"`,
        `"${p.name}"`,
        `"${p.cpf || ''}"`,
        `"${p.birthDate || ''}"`,
        `"${p.mainDiagnosis || p.diagnosis || ''}"`,
        `"${p.status}"`,
        `"${p.fonoaudiologistName || currentUser.name}"`,
        `"${p.caregiverName || ''}"`,
        numAssessments,
        numLogs,
        `"${new Date().toLocaleDateString('pt-BR')}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + 
      [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GamaEcosystem_Relatorio_Lote_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setCompletedMsg(`Relatório consolidado CSV exportado com ${selectedPatientIds.length} pacientes.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#1f1a17] border border-[#382e27] rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#382e27] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c8a88a]/20 border border-[#c8a88a]/40 flex items-center justify-center text-[#c8a88a]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif text-[#f4efe8]">
                Exportação em Lote de Relatórios & Laudos
              </h3>
              <p className="text-xs text-[#a69a8f]">
                Gere laudos clínicos timbrados oficiais ou planilhas consolidadas em massa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#a69a8f] hover:text-[#f4efe8] rounded-xl hover:bg-[#2e2621] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formato de Exportação */}
        <div className="p-6 border-b border-[#382e27] space-y-3">
          <label className="text-xs font-bold text-[#c8a88a] uppercase tracking-wider block">
            Formato de Exportação
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setExportType('pdf')}
              className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                exportType === 'pdf'
                  ? 'bg-[#c8a88a]/15 border-[#c8a88a] text-[#f4efe8]'
                  : 'bg-[#25201c] border-[#382e27] text-[#a69a8f] hover:border-[#4d3e34]'
              }`}
            >
              <FileCheck2 className={`w-5 h-5 ${exportType === 'pdf' ? 'text-[#c8a88a]' : ''}`} />
              <div className="text-left">
                <div className="text-xs font-bold">Laudos Oficiais em PDF</div>
                <div className="text-[11px] text-[#a69a8f]">Timbrado + Marca d'Água + RaDI</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setExportType('csv')}
              className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                exportType === 'csv'
                  ? 'bg-[#c8a88a]/15 border-[#c8a88a] text-[#f4efe8]'
                  : 'bg-[#25201c] border-[#382e27] text-[#a69a8f] hover:border-[#4d3e34]'
              }`}
            >
              <FileSpreadsheet className={`w-5 h-5 ${exportType === 'csv' ? 'text-[#c8a88a]' : ''}`} />
              <div className="text-left">
                <div className="text-xs font-bold">Planilha Consolidada (CSV)</div>
                <div className="text-[11px] text-[#a69a8f]">Exportação tabular para Excel</div>
              </div>
            </button>
          </div>
        </div>

        {/* Lista de Seleção de Pacientes */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#f4efe8]">
              Selecionar Pacientes ({selectedPatientIds.length} de {patients.length})
            </span>
            <button
              onClick={toggleSelectAll}
              className="text-xs text-[#c8a88a] hover:underline font-semibold flex items-center gap-1.5"
            >
              {selectedPatientIds.length === patients.length ? (
                <>
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Desmarcar Todos</span>
                </>
              ) : (
                <>
                  <Square className="w-3.5 h-3.5" />
                  <span>Selecionar Todos</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-2">
            {patients.map(p => {
              const isSelected = selectedPatientIds.includes(p.id);
              const hasRadi = assessments.some(a => a.patientId === p.id);
              const hasLogs = dailyLogs.some(l => l.patientId === p.id);

              return (
                <div
                  key={p.id}
                  onClick={() => toggleSelectPatient(p.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#29221d] border-[#c8a88a]/60 text-[#f4efe8]'
                      : 'bg-[#241e1a] border-[#382e27] text-[#a69a8f] hover:border-[#4d3e34]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${
                      isSelected ? 'bg-[#c8a88a] border-[#c8a88a] text-[#181513]' : 'border-[#4d3e34]'
                    }`}>
                      {isSelected && <CheckSquare className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#f4efe8]">{p.name}</div>
                      <div className="text-[11px] text-[#a69a8f]">{p.diagnosis || p.mainDiagnosis || 'Sem diagnóstico'}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[10px]">
                    {hasRadi ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                        RaDI Ativo
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-[#181513] text-[#7d7168]">
                        Sem RaDI
                      </span>
                    )}
                    {hasLogs && (
                      <span className="px-2 py-0.5 rounded bg-[#382e27] text-[#c8a88a]">
                        Com Diário
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feedback de Progresso ou Conclusão */}
          {isExporting && (
            <div className="p-4 rounded-xl bg-[#25201c] border border-[#c8a88a]/40 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-[#f4efe8]">
                <span>Gerando laudos em lote...</span>
                <span>{exportProgress}%</span>
              </div>
              <div className="w-full bg-[#181513] rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-[#c8a88a] h-2 transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            </div>
          )}

          {completedMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 shrink-0" />
              <span>{completedMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#382e27] flex items-center justify-between gap-4 bg-[#181513]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#25201c] hover:bg-[#2d2520] border border-[#44362d] text-xs font-semibold text-[#a69a8f] hover:text-[#f4efe8] transition-colors"
          >
            Fechar
          </button>

          <button
            onClick={exportType === 'pdf' ? handleExportPDFs : handleExportCSV}
            disabled={selectedPatientIds.length === 0 || isExporting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#c8a88a] hover:bg-[#d6bba0] text-[#181513] font-bold text-xs shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>
              {isExporting ? 'Processando...' : `Exportar ${selectedPatientIds.length} Relatório(s)`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
