import React, { useState } from 'react';
import { 
  ClinicConfig, 
  Caregiver, 
  Therapist, 
  DEFAULT_CLINIC_CONFIG,
  INITIAL_CAREGIVERS,
  INITIAL_THERAPISTS
} from '../types/clinicConfig';
import { Patient } from '../types';
import { OfficialLetterhead } from './OfficialLetterhead';
import { 
  Building2, 
  Users, 
  UserCheck, 
  FileCheck2, 
  Printer, 
  Save, 
  Plus, 
  Trash2, 
  Phone, 
  Mail, 
  Instagram, 
  Sparkles,
  CheckCircle,
  FileText,
  Sliders,
  AlertCircle
} from 'lucide-react';

interface ConfigurationViewProps {
  clinicConfig: ClinicConfig;
  onUpdateClinicConfig: (config: ClinicConfig) => void;
  caregivers: Caregiver[];
  onUpdateCaregivers: (caregivers: Caregiver[]) => void;
  therapists: Therapist[];
  onUpdateTherapists: (therapists: Therapist[]) => void;
  patients: Patient[];
}

export const ConfigurationView: React.FC<ConfigurationViewProps> = ({
  clinicConfig,
  onUpdateClinicConfig,
  caregivers,
  onUpdateCaregivers,
  therapists,
  onUpdateTherapists,
  patients
}) => {
  const [activeTab, setActiveTab] = useState<'geral' | 'timbrado' | 'cuidadores' | 'terapeutas'>('geral');
  const [tempConfig, setTempConfig] = useState<ClinicConfig>(clinicConfig);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Estados para novos cadastros
  const [newCaregiverName, setNewCaregiverName] = useState('');
  const [newCaregiverPhone, setNewCaregiverPhone] = useState('');
  const [newCaregiverRole, setNewCaregiverRole] = useState('Cuidador Principal');
  const [newCaregiverPatientId, setNewCaregiverPatientId] = useState('');

  const [newTherapistName, setNewTherapistName] = useState('');
  const [newTherapistCrfa, setNewTherapistCrfa] = useState('');
  const [newTherapistPhone, setNewTherapistPhone] = useState('');
  const [newTherapistEmail, setNewTherapistEmail] = useState('');
  const [newTherapistSpecialty, setNewTherapistSpecialty] = useState('Disfagia & Deglutição');

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateClinicConfig(tempConfig);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddCaregiver = () => {
    if (!newCaregiverName.trim()) return;
    const newCg: Caregiver = {
      id: `cg_${Date.now()}`,
      name: newCaregiverName.trim(),
      phone: newCaregiverPhone.trim() || '(21) 90000-0000',
      kinshipOrRole: newCaregiverRole,
      assignedPatientIds: newCaregiverPatientId ? [newCaregiverPatientId] : []
    };
    onUpdateCaregivers([...caregivers, newCg]);
    setNewCaregiverName('');
    setNewCaregiverPhone('');
    setNewCaregiverPatientId('');
  };

  const handleDeleteCaregiver = (id: string) => {
    onUpdateCaregivers(caregivers.filter(c => c.id !== id));
  };

  const handleAddTherapist = () => {
    if (!newTherapistName.trim() || !newTherapistCrfa.trim()) return;
    const newTh: Therapist = {
      id: `th_${Date.now()}`,
      name: newTherapistName.trim(),
      crfa: newTherapistCrfa.trim(),
      phone: newTherapistPhone.trim(),
      email: newTherapistEmail.trim(),
      specialty: newTherapistSpecialty,
      active: true
    };
    onUpdateTherapists([...therapists, newTh]);
    setNewTherapistName('');
    setNewTherapistCrfa('');
    setNewTherapistPhone('');
    setNewTherapistEmail('');
  };

  const handleDeleteTherapist = (id: string) => {
    onUpdateTherapists(therapists.filter(t => t.id !== id));
  };

  const handlePrintSampleLetterhead = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header da Aba de Configuração */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1f1a17] border border-[#382e27] p-5 sm:p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#c8a88a]/20 border border-[#c8a88a]/40 flex items-center justify-center text-[#c8a88a] shadow-inner">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#f4efe8]">
              Central de Configurações & Parâmetros
            </h1>
            <p className="text-xs text-[#a69a8f]">
              Gerencie a identidade corporativa, papel timbrado oficial, cuidadores e equipe clínica.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-semibold animate-pulse">
            <CheckCircle className="w-4 h-4" />
            Configurações salvas com sucesso!
          </div>
        )}
      </div>

      {/* Tabs de Navegação Interna da Configuração */}
      <div className="flex items-center gap-2 border-b border-[#382e27] pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('geral')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'geral'
              ? 'bg-[#c8a88a] text-[#181513] shadow-md font-bold'
              : 'text-[#a69a8f] hover:text-[#f4efe8] hover:bg-[#25201c]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Clínica & Responsável Técnica</span>
        </button>

        <button
          onClick={() => setActiveTab('timbrado')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'timbrado'
              ? 'bg-[#c8a88a] text-[#181513] shadow-md font-bold'
              : 'text-[#a69a8f] hover:text-[#f4efe8] hover:bg-[#25201c]'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Papel Timbrado Oficial GAMA</span>
        </button>

        <button
          onClick={() => setActiveTab('cuidadores')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'cuidadores'
              ? 'bg-[#c8a88a] text-[#181513] shadow-md font-bold'
              : 'text-[#a69a8f] hover:text-[#f4efe8] hover:bg-[#25201c]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Cuidadores Cadastrados ({caregivers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('terapeutas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'terapeutas'
              ? 'bg-[#c8a88a] text-[#181513] shadow-md font-bold'
              : 'text-[#a69a8f] hover:text-[#f4efe8] hover:bg-[#25201c]'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Fonoaudiólogas & Equipe ({therapists.length})</span>
        </button>
      </div>

      {/* Conteúdo da Tab 1: Dados Gerais da Clínica & RT */}
      {activeTab === 'geral' && (
        <form onSubmit={handleSaveConfig} className="bg-[#1f1a17] border border-[#382e27] rounded-2xl p-6 space-y-6">
          <div className="border-b border-[#382e27] pb-4">
            <h2 className="text-base font-bold font-serif text-[#f4efe8] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#c8a88a]" />
              Dados Institucionais e Contatos Oficiais
            </h2>
            <p className="text-xs text-[#a69a8f] mt-0.5">
              Estes dados são sincronizados no cabeçalho e rodapé do papel timbrado de todos os relatórios.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#c8a88a] mb-1">Nome da Clínica / Consultório</label>
              <input
                type="text"
                value={tempConfig.clinicName}
                onChange={e => setTempConfig({ ...tempConfig, clinicName: e.target.value })}
                className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] focus:border-[#c8a88a] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#c8a88a] mb-1">Responsável Técnica</label>
              <input
                type="text"
                value={tempConfig.technicalResponsible}
                onChange={e => setTempConfig({ ...tempConfig, technicalResponsible: e.target.value })}
                className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] focus:border-[#c8a88a] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#c8a88a] mb-1">Conselho Profissional (CRFa / CREFONO)</label>
              <input
                type="text"
                value={tempConfig.crfa}
                onChange={e => setTempConfig({ ...tempConfig, crfa: e.target.value })}
                className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] focus:border-[#c8a88a] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#c8a88a] mb-1">CPF da Responsável Técnica</label>
              <input
                type="text"
                value={tempConfig.cpf}
                onChange={e => setTempConfig({ ...tempConfig, cpf: e.target.value })}
                className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] focus:border-[#c8a88a] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#c8a88a] mb-1">Telefone & WhatsApp Comercial</label>
              <input
                type="text"
                value={tempConfig.phoneWhatsapp}
                onChange={e => setTempConfig({ ...tempConfig, phoneWhatsapp: e.target.value })}
                className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] focus:border-[#c8a88a] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#c8a88a] mb-1">E-mail Institucional</label>
              <input
                type="email"
                value={tempConfig.email}
                onChange={e => setTempConfig({ ...tempConfig, email: e.target.value })}
                className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] focus:border-[#c8a88a] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#c8a88a] mb-1">Instagram Oficial</label>
              <input
                type="text"
                value={tempConfig.instagram}
                onChange={e => setTempConfig({ ...tempConfig, instagram: e.target.value })}
                className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] focus:border-[#c8a88a] outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[#c8a88a] mb-1">Endereço / Polo de Atendimento</label>
              <input
                type="text"
                value={tempConfig.addressLine || ''}
                onChange={e => setTempConfig({ ...tempConfig, addressLine: e.target.value })}
                className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] focus:border-[#c8a88a] outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#382e27]">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c8a88a] hover:bg-[#d6bca3] text-[#181513] font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Salvar Parâmetros
            </button>
          </div>
        </form>
      )}

      {/* Conteúdo da Tab 2: Visualização e Regras do Papel Timbrado Oficial */}
      {activeTab === 'timbrado' && (
        <div className="space-y-6">
          <div className="bg-[#1f1a17] border border-[#382e27] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold font-serif text-[#f4efe8] flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-[#c8a88a]" />
                Papel Timbrado Oficial GAMA Fonoaudiologia
              </h2>
              <p className="text-xs text-[#a69a8f] mt-1 max-w-2xl leading-relaxed">
                Em estrito atendimento à sua diretriz, este modelo de papel timbrado com faixa lateral marrom, logotipo estilizado, contatos (WhatsApp, E-mail, Instagram) e assinatura é <strong>OBRIGATÓRIO</strong> em todos os documentos gerados pelo aplicativo.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePrintSampleLetterhead}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#27211d] hover:bg-[#342b26] text-[#c8a88a] border border-[#3e342e] text-xs font-semibold transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Imprimir Folha Timbrada
              </button>
            </div>
          </div>

          {/* Opções de Impressão do Timbrado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div 
              onClick={() => {
                const updated = { ...tempConfig, includeSignatureOnPrint: false };
                setTempConfig(updated);
                onUpdateClinicConfig(updated);
              }}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                !tempConfig.includeSignatureOnPrint 
                  ? 'bg-[#27211d] border-[#c8a88a] shadow-md ring-1 ring-[#c8a88a]/30' 
                  : 'bg-[#1a1614] border-[#382e27] hover:border-[#4a3d34]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-[#f4efe8]">1. Papel Timbrado SEM Rubrica (Padrão Solicitado)</span>
                {!tempConfig.includeSignatureOnPrint && <CheckCircle className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-[11px] text-[#a69a8f]">
                Imprime o documento limpo com cabeçalho, faixa marrom e rodapé institucional. Ideal para preenchimento ou assinatura manual com caneta.
              </p>
            </div>

            <div 
              onClick={() => {
                const updated = { ...tempConfig, includeSignatureOnPrint: true };
                setTempConfig(updated);
                onUpdateClinicConfig(updated);
              }}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                tempConfig.includeSignatureOnPrint 
                  ? 'bg-[#27211d] border-[#c8a88a] shadow-md ring-1 ring-[#c8a88a]/30' 
                  : 'bg-[#1a1614] border-[#382e27] hover:border-[#4a3d34]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-[#f4efe8]">2. Papel Timbrado COM Assinatura & Rubrica</span>
                {tempConfig.includeSignatureOnPrint && <CheckCircle className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-[11px] text-[#a69a8f]">
                Insere a rubrica técnica e identificação de {tempConfig.technicalResponsible} ({tempConfig.crfa}) pronta para laudos digitais e PDF.
              </p>
            </div>
          </div>

          {/* Visualizador / Preview em Tempo Real do Papel Timbrado Oficial */}
          <div className="bg-[#14110f] p-4 sm:p-8 rounded-2xl border border-[#342b26] flex justify-center overflow-x-auto">
            <OfficialLetterhead
              config={tempConfig}
              showSignature={tempConfig.includeSignatureOnPrint}
              documentType="Documento Clínico Oficial"
              title="Prévia do Papel Timbrado Obrigatório"
              pageNumber={1}
              totalPages={1}
              className="scale-90 sm:scale-100 origin-top shadow-2xl"
            >
              <div className="py-6 space-y-4 text-xs text-neutral-700 leading-relaxed font-sans">
                <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
                  <h3 className="font-bold text-neutral-900 mb-1">Padrão Mandatório de Identidade Visual</h3>
                  <p>
                    Este papel timbrado incorpora rigorosamente a matriz visual enviada pela cliente <strong>Adriane Gama</strong>:
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-neutral-600">
                    <li>Faixa lateral esquerda contínua no tom marrom terroso clássico (#7a5937).</li>
                    <li>Monograma tipográfico g° com identificação oficial "GAMA FONOAUDIOLOGIA".</li>
                    <li>Dados de contato oficiais no rodapé: (21) 98988-7981 | gamafono@gamafono.com.br | @gama_fonoaudiologia.</li>
                    <li>Substituição integral em todos os relatórios, laudos RaDI, registros e fichas cadastrais do sistema.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg border border-dashed border-neutral-300 text-center text-neutral-500">
                  Área destinada ao conteúdo do relatório, laudo de deglutição ou prontuário eletrônico do paciente.
                </div>
              </div>
            </OfficialLetterhead>
          </div>
        </div>
      )}

      {/* Conteúdo da Tab 3: Cuidadores Cadastrados */}
      {activeTab === 'cuidadores' && (
        <div className="space-y-6">
          {/* Formulário de Adicionar Cuidador */}
          <div className="bg-[#1f1a17] border border-[#382e27] rounded-2xl p-5 sm:p-6 space-y-4">
            <h2 className="text-base font-bold font-serif text-[#f4efe8] flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#c8a88a]" />
              Cadastrar Novo Cuidador / Responsável
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#c8a88a] mb-1">Nome Completo</label>
                <input
                  type="text"
                  placeholder="Ex: Maria das Graças"
                  value={newCaregiverName}
                  onChange={e => setNewCaregiverName(e.target.value)}
                  className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] outline-none focus:border-[#c8a88a]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#c8a88a] mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="(21) 98888-7777"
                  value={newCaregiverPhone}
                  onChange={e => setNewCaregiverPhone(e.target.value)}
                  className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] outline-none focus:border-[#c8a88a]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#c8a88a] mb-1">Parentesco / Função</label>
                <select
                  value={newCaregiverRole}
                  onChange={e => setNewCaregiverRole(e.target.value)}
                  className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] outline-none focus:border-[#c8a88a]"
                >
                  <option value="Cuidador Principal">Cuidador Principal</option>
                  <option value="Esposa / Esposo">Esposa / Esposo</option>
                  <option value="Filho(a)">Filho(a)</option>
                  <option value="Mãe / Pai">Mãe / Pai</option>
                  <option value="Cuidador Profissional Diurno">Cuidador Profissional Diurno</option>
                  <option value="Cuidador Profissional Noturno">Cuidador Profissional Noturno</option>
                  <option value="Técnico de Enfermagem">Técnico de Enfermagem</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#c8a88a] mb-1">Vincular a Paciente</label>
                <select
                  value={newCaregiverPatientId}
                  onChange={e => setNewCaregiverPatientId(e.target.value)}
                  className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] outline-none focus:border-[#c8a88a]"
                >
                  <option value="">Nenhum vínculo imediato</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleAddCaregiver}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#c8a88a] hover:bg-[#d6bca3] text-[#181513] font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Adicionar Cuidador
              </button>
            </div>
          </div>

          {/* Listagem de Cuidadores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {caregivers.map(cg => {
              const assignedPat = patients.find(p => cg.assignedPatientIds.includes(p.id));
              return (
                <div key={cg.id} className="bg-[#1f1a17] border border-[#382e27] p-4 rounded-xl flex items-start justify-between gap-3 shadow-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#f4efe8]">{cg.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#27211d] text-[#c8a88a] border border-[#3e342e] font-semibold">
                        {cg.kinshipOrRole}
                      </span>
                    </div>
                    <p className="text-xs text-[#a69a8f] flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#c8a88a]" />
                      {cg.phone}
                    </p>
                    {assignedPat && (
                      <p className="text-[11px] text-[#c8a88a] font-medium pt-1">
                        Paciente vinculado: <span className="text-[#f4efe8] underline">{assignedPat.name}</span>
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteCaregiver(cg.id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
                    title="Excluir cuidador"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Conteúdo da Tab 4: Fonoaudiólogas & Equipe */}
      {activeTab === 'terapeutas' && (
        <div className="space-y-6">
          {/* Adicionar Fonoaudióloga */}
          <div className="bg-[#1f1a17] border border-[#382e27] rounded-2xl p-5 sm:p-6 space-y-4">
            <h2 className="text-base font-bold font-serif text-[#f4efe8] flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#c8a88a]" />
              Cadastrar Fonoaudióloga / Terapeuta
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#c8a88a] mb-1">Nome Completo</label>
                <input
                  type="text"
                  placeholder="Ex: Dra. Mariana Costa"
                  value={newTherapistName}
                  onChange={e => setNewTherapistName(e.target.value)}
                  className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] outline-none focus:border-[#c8a88a]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#c8a88a] mb-1">Registro CRFa / CREFONO</label>
                <input
                  type="text"
                  placeholder="CRFa 3-00000"
                  value={newTherapistCrfa}
                  onChange={e => setNewTherapistCrfa(e.target.value)}
                  className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] outline-none focus:border-[#c8a88a]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#c8a88a] mb-1">Telefone</label>
                <input
                  type="text"
                  placeholder="(21) 99999-0000"
                  value={newTherapistPhone}
                  onChange={e => setNewTherapistPhone(e.target.value)}
                  className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] outline-none focus:border-[#c8a88a]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#c8a88a] mb-1">Especialidade Principal</label>
                <input
                  type="text"
                  placeholder="Disfagia / Motricidade"
                  value={newTherapistSpecialty}
                  onChange={e => setNewTherapistSpecialty(e.target.value)}
                  className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] outline-none focus:border-[#c8a88a]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleAddTherapist}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#c8a88a] hover:bg-[#d6bca3] text-[#181513] font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Cadastrar Fonoaudióloga
              </button>
            </div>
          </div>

          {/* Listagem de Fonoaudiólogas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {therapists.map(th => (
              <div key={th.id} className="bg-[#1f1a17] border border-[#382e27] p-5 rounded-xl flex items-start justify-between gap-3 shadow-xs">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#f4efe8]">{th.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/50 font-mono font-semibold">
                      {th.crfa}
                    </span>
                  </div>
                  <p className="text-xs text-[#c8a88a] font-medium">{th.specialty}</p>
                  <div className="flex items-center gap-3 text-[11px] text-[#a69a8f] pt-1">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#c8a88a]" />
                      {th.phone}
                    </span>
                    {th.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-[#c8a88a]" />
                        {th.email}
                      </span>
                    )}
                  </div>
                </div>

                {th.name !== 'Adriane Gama' && (
                  <button
                    onClick={() => handleDeleteTherapist(th.id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
                    title="Excluir fonoaudióloga"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
