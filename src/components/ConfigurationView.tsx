import React, { useState, useRef, useEffect } from 'react';
import { 
  ClinicConfig, 
  Caregiver, 
  Therapist, 
  DEFAULT_CLINIC_CONFIG,
  getEffectiveTherapistProfile
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
  CheckCircle,
  Sliders,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Sparkles,
  Info
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
  const [activeTab, setActiveTab] = useState<'geral' | 'marca' | 'cuidadores' | 'terapeutas'>('geral');
  const [tempConfig, setTempConfig] = useState<ClinicConfig>(clinicConfig);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [previewTherapistId, setPreviewTherapistId] = useState<string>(''); // Vazio = Usar dados da Clínica & RT

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincronizar Favicon do navegador quando houver logomarca
  useEffect(() => {
    if (tempConfig.logoUrl) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'shortcut icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = tempConfig.logoUrl;
    }
  }, [tempConfig.logoUrl]);

  // Estados para novos cadastros
  const [newCaregiverName, setNewCaregiverName] = useState('');
  const [newCaregiverPhone, setNewCaregiverPhone] = useState('');
  const [newCaregiverRole, setNewCaregiverRole] = useState('Cuidador Principal');
  const [newCaregiverPatientId, setNewCaregiverPatientId] = useState('');

  // Cadastro detalhado de Terapeuta (com contatos e redes)
  const [newTherapistName, setNewTherapistName] = useState('');
  const [newTherapistCrfa, setNewTherapistCrfa] = useState('');
  const [newTherapistCpf, setNewTherapistCpf] = useState('');
  const [newTherapistPhone, setNewTherapistPhone] = useState('');
  const [newTherapistEmail, setNewTherapistEmail] = useState('');
  const [newTherapistInstagram, setNewTherapistInstagram] = useState('');
  const [newTherapistSpecialty, setNewTherapistSpecialty] = useState('Disfagia & Deglutição');

  const handleSaveConfig = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onUpdateClinicConfig(tempConfig);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Upload da Logomarca
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Converte a imagem para Base64 para persistência segura
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const updated = { ...tempConfig, logoUrl: base64 };
      setTempConfig(updated);
      onUpdateClinicConfig(updated);

      // Injeta diretamente na aba do navegador
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'shortcut icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = base64;
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = () => {
    const updated = { ...tempConfig, logoUrl: undefined };
    setTempConfig(updated);
    onUpdateClinicConfig(updated);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
      cpf: newTherapistCpf.trim() || undefined,
      phone: newTherapistPhone.trim() || undefined,
      email: newTherapistEmail.trim() || undefined,
      instagram: newTherapistInstagram.trim() || undefined,
      specialty: newTherapistSpecialty,
      active: true
    };
    onUpdateTherapists([...therapists, newTh]);
    setNewTherapistName('');
    setNewTherapistCrfa('');
    setNewTherapistCpf('');
    setNewTherapistPhone('');
    setNewTherapistEmail('');
    setNewTherapistInstagram('');
  };

  const handleDeleteTherapist = (id: string) => {
    onUpdateTherapists(therapists.filter(t => t.id !== id));
  };

  const handlePrintSampleLetterhead = () => {
    window.print();
  };

  // Localiza a terapeuta selecionada para prévia
  const selectedPreviewTherapist = therapists.find(t => t.id === previewTherapistId) || null;
  const effectiveProfile = getEffectiveTherapistProfile(selectedPreviewTherapist, tempConfig);

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
              Gerencie a identidade da clínica, configuração de marca, upload da logomarca, cuidadores e equipe clínica.
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

        {/* SUB-ABA RENOMEADA CONFORME SOLICITAÇÃO: Configuração de Marca */}
        <button
          onClick={() => setActiveTab('marca')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'marca'
              ? 'bg-[#c8a88a] text-[#181513] shadow-md font-bold'
              : 'text-[#a69a8f] hover:text-[#f4efe8] hover:bg-[#25201c]'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Configuração de Marca</span>
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
              Dados Institucionais Padrão (Clínica e Responsável Técnica)
            </h2>
            <p className="text-xs text-[#a69a8f] mt-0.5">
              Estes dados são o padrão corporativo. Caso a terapeuta atendente não preencha seus contatos individuais, estas informações serão herdadas automaticamente no papel timbrado.
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
              <label className="block text-xs font-medium text-[#c8a88a] mb-1">Responsável Técnica Padrão</label>
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
              Salvar Dados Padrão
            </button>
          </div>
        </form>
      )}

      {/* Conteúdo da Tab 2: CONFIGURAÇÃO DE MARCA (Com Upload de Logo e Visualização em Tempo Real) */}
      {activeTab === 'marca' && (
        <div className="space-y-6">
          {/* Card de Upload da Logomarca */}
          <div className="bg-[#1f1a17] border border-[#382e27] rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#382e27] pb-4">
              <div>
                <h2 className="text-base font-bold font-serif text-[#f4efe8] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#c8a88a]" />
                  Upload da Logomarca Oficial
                </h2>
                <p className="text-xs text-[#a69a8f] mt-0.5">
                  A logomarca enviada aqui será aplicada automaticamente em todos os relatórios/laudos e na <strong>barra do navegador (Favicon)</strong>.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/png, image/jpeg, image/svg+xml, image/webp"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#c8a88a] hover:bg-[#d6bca3] text-[#181513] font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  Fazer Upload da Logomarca
                </button>

                {tempConfig.logoUrl && (
                  <button
                    type="button"
                    onClick={handleResetLogo}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#27211d] hover:bg-[#342b26] text-[#a69a8f] hover:text-rose-400 border border-[#3e342e] text-xs transition-colors"
                    title="Restaurar logotipo padrão"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Restaurar Padrão
                  </button>
                )}
              </div>
            </div>

            {/* Prévia da Logomarca carregada */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#181513] border border-[#2e2621]">
              <div className="w-20 h-20 rounded-lg bg-white/5 border border-dashed border-[#44362d] flex items-center justify-center p-2 overflow-hidden">
                {tempConfig.logoUrl ? (
                  <img src={tempConfig.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                ) : (
                  <div className="relative w-10 h-10 rounded-full border-2 border-[#7a5937] flex items-center justify-center font-serif text-[#7a5937] font-bold text-xl leading-none">
                    g
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#7a5937]" />
                  </div>
                )}
              </div>

              <div className="space-y-1 text-xs">
                <p className="font-semibold text-[#f4efe8]">
                  {tempConfig.logoUrl ? 'Logomarca Customizada Ativa' : 'Logomarca Oficial Padrão (Monograma GAMA g°)'}
                </p>
                <p className="text-[#a69a8f] text-[11px]">
                  Formatos recomendados: PNG transparente ou SVG. Resolução ideal: 400x120px ou superior.
                </p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Sincronizado automaticamente com a aba do navegador
                </div>
              </div>
            </div>
          </div>

          {/* Seleção do Perfil de Terapeuta para Prévia em Tempo Real */}
          <div className="bg-[#1f1a17] border border-[#382e27] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#c8a88a] uppercase tracking-wider block mb-1">
                Visualização do Papel Timbrado em Tempo Real
              </span>
              <p className="text-xs text-[#a69a8f]">
                Reflete com precisão as configurações atuais. Selecione qual terapeuta deseja pré-visualizar ou visualize os dados gerais da clínica:
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={previewTherapistId}
                onChange={e => setPreviewTherapistId(e.target.value)}
                className="bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] outline-none focus:border-[#c8a88a]"
              >
                <option value="">Visualizar Dados da Clínica & RT (Padrão)</option>
                {therapists.map(th => (
                  <option key={th.id} value={th.id}>
                    Visualizar: {th.name} ({th.crfa})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handlePrintSampleLetterhead}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#27211d] hover:bg-[#342b26] text-[#c8a88a] border border-[#3e342e] text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
              >
                <Printer className="w-4 h-4" />
                Imprimir Folha
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
                Insere a rubrica técnica e identificação de {effectiveProfile.name} ({effectiveProfile.crfa}) pronta para laudos digitais e PDF.
              </p>
            </div>
          </div>

          {/* Visualizador / Preview em Tempo Real do Papel Timbrado Oficial */}
          <div className="bg-[#14110f] p-4 sm:p-8 rounded-2xl border border-[#342b26] flex justify-center overflow-x-auto">
            <OfficialLetterhead
              config={tempConfig}
              therapist={selectedPreviewTherapist}
              showSignature={tempConfig.includeSignatureOnPrint}
              documentType="Documento Clínico Oficial"
              title="Prévia do Papel Timbrado Obrigatório"
              pageNumber={1}
              totalPages={1}
              className="scale-90 sm:scale-100 origin-top shadow-2xl"
            >
              <div className="py-6 space-y-4 text-xs text-neutral-700 leading-relaxed font-sans">
                <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
                  <h3 className="font-bold text-neutral-900 mb-1 flex items-center justify-between">
                    <span>Parâmetros Atuais Refletidos em Tempo Real:</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-neutral-200 text-neutral-700">
                      {selectedPreviewTherapist ? `Terapeuta: ${selectedPreviewTherapist.name}` : 'Clínica & RT Padrão'}
                    </span>
                  </h3>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-neutral-600">
                    <li><strong>Responsável:</strong> {effectiveProfile.name} ({effectiveProfile.crfa})</li>
                    <li><strong>WhatsApp:</strong> {effectiveProfile.phone}</li>
                    <li><strong>E-mail:</strong> {effectiveProfile.email}</li>
                    <li><strong>Instagram:</strong> {effectiveProfile.instagram}</li>
                    <li><strong>Logomarca:</strong> {tempConfig.logoUrl ? 'Logomarca Customizada Carregada' : 'Monograma Oficial GAMA g°'}</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg border border-dashed border-neutral-300 text-center text-neutral-500">
                  Área destinada ao conteúdo do relatório, laudo de deglutição ou formulário oficial de evolução fonoaudiológica.
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

      {/* Conteúdo da Tab 4: Fonoaudiólogas & Equipe (Com Contatos e Redes Sociais Individuais) */}
      {activeTab === 'terapeutas' && (
        <div className="space-y-6">
          {/* Informação sobre Herança / Fallback */}
          <div className="p-4 rounded-xl bg-[#27211d] border border-[#3e342e] flex items-start gap-3 text-xs text-[#d8cec4]">
            <Info className="w-5 h-5 text-[#c8a88a] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Regra de Fallback Dinâmico:</strong> Cada fonoaudióloga pode ter seu próprio telefone, e-mail e Instagram para exibição no rodapé do papel timbrado. Caso qualquer um desses campos fique em branco, o sistema utilizará automaticamente a informação configurada na aba <strong>Clínica & Responsável Técnica</strong> ({tempConfig.technicalResponsible} - {tempConfig.phoneWhatsapp}).
            </p>
          </div>

          {/* Adicionar Fonoaudióloga */}
          <div className="bg-[#1f1a17] border border-[#382e27] rounded-2xl p-5 sm:p-6 space-y-4">
            <h2 className="text-base font-bold font-serif text-[#f4efe8] flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#c8a88a]" />
              Cadastrar Fonoaudióloga / Terapeuta
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#c8a88a] mb-1">Nome Completo *</label>
                <input
                  type="text"
                  placeholder="Ex: Dra. Juliana Silveira"
                  value={newTherapistName}
                  onChange={e => setNewTherapistName(e.target.value)}
                  className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] outline-none focus:border-[#c8a88a]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#c8a88a] mb-1">Registro CRFa / CREFONO *</label>
                <input
                  type="text"
                  placeholder="CRFa 3-12345"
                  value={newTherapistCrfa}
                  onChange={e => setNewTherapistCrfa(e.target.value)}
                  className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] outline-none focus:border-[#c8a88a]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#c8a88a] mb-1">CPF (Opcional)</label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={newTherapistCpf}
                  onChange={e => setNewTherapistCpf(e.target.value)}
                  className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] outline-none focus:border-[#c8a88a]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#c8a88a] mb-1">Telefone / WhatsApp (Em branco herda RT)</label>
                <input
                  type="text"
                  placeholder={tempConfig.phoneWhatsapp}
                  value={newTherapistPhone}
                  onChange={e => setNewTherapistPhone(e.target.value)}
                  className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] outline-none focus:border-[#c8a88a]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#c8a88a] mb-1">E-mail Profissional (Em branco herda RT)</label>
                <input
                  type="email"
                  placeholder={tempConfig.email}
                  value={newTherapistEmail}
                  onChange={e => setNewTherapistEmail(e.target.value)}
                  className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] outline-none focus:border-[#c8a88a]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#c8a88a] mb-1">Instagram Profissional (Em branco herda RT)</label>
                <input
                  type="text"
                  placeholder={tempConfig.instagram}
                  value={newTherapistInstagram}
                  onChange={e => setNewTherapistInstagram(e.target.value)}
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

          {/* Listagem de Fonoaudiólogas com indicação de fallback */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {therapists.map(th => {
              const prof = getEffectiveTherapistProfile(th, tempConfig);
              return (
                <div key={th.id} className="bg-[#1f1a17] border border-[#382e27] p-5 rounded-xl flex items-start justify-between gap-3 shadow-xs">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#f4efe8]">{th.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/50 font-mono font-semibold">
                        {th.crfa}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-[#a69a8f]">
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#c8a88a]" />
                        <span>{th.phone ? th.phone : `${tempConfig.phoneWhatsapp} (Herdado)`}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#c8a88a]" />
                        <span>{th.email ? th.email : `${tempConfig.email} (Herdado)`}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Instagram className="w-3.5 h-3.5 text-[#c8a88a]" />
                        <span>{th.instagram ? th.instagram : `${tempConfig.instagram} (Herdado)`}</span>
                      </p>
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
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
