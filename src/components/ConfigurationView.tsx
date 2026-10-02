import { DEFAULT_OFFICIAL_LOGO_BASE64 } from '../data/defaultLogo';
import React, { useState, useRef, useEffect } from 'react';
import { 
  ClinicConfig, 
  Caregiver, 
  Therapist, 
  DEFAULT_CLINIC_CONFIG,
  getEffectiveTherapistProfile
} from '../types/clinicConfig';
import { Patient, UserProfile, UserRole, NavigationTab } from '../types';
import { OfficialLetterhead } from './OfficialLetterhead';
import { AdminUsersView } from './AdminUsersView';
import { ChangeLogView } from './ChangeLogView';
import { triggerDatabaseBackup, fetchBackupList, saveClinicConfigToMariaDB, saveTherapistToMariaDB, deleteTherapistFromMariaDB, saveCaregiverToMariaDB, deleteCaregiverFromMariaDB, saveUserToMariaDB, deleteUserFromMariaDB } from '../services/mariaDBSync';
import { resizeImageToTarget } from '../utils/imageOptimizer';
import { updateBrowserFavicon } from '../utils/faviconManager';
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
  Info,
  MapPin,
  KeyRound,
  FileBadge,
  UserCog,
  Database,
  Flame,
  ExternalLink,
  Copy,
  AlertTriangle,
  RefreshCw,
  CloudUpload,
  ClipboardList,
  HardDrive,
  Download,
  AppWindow,
  Smartphone
} from 'lucide-react';

interface ConfigurationViewProps {
  clinicConfig: ClinicConfig;
  onUpdateClinicConfig: (config: ClinicConfig) => void;
  caregivers: Caregiver[];
  onUpdateCaregivers: (caregivers: Caregiver[]) => void;
  therapists: Therapist[];
  onUpdateTherapists: (therapists: Therapist[]) => void;
  patients: Patient[];
  users?: UserProfile[];
  onUpdateUsers?: (users: UserProfile[]) => void;
  onApproveUser?: (userId: string) => void;
  onRejectUser?: (userId: string) => void;
  onChangeRole?: (userId: string, role: UserRole) => void;
  onUpdateUserPermissions?: (userId: string, allowedTabs: NavigationTab[]) => void;
}


// Helper para gravar no localStorage de forma resiliente
const safeLocalStorageSetItem = (key: string, value: string) => {
  try {
    safeLocalStorageSetItem(key, value);
  } catch (e) {
    console.warn(`Aviso: Limite do LocalStorage atingido para ${key}. Dados salvos apenas no MariaDB.`);
  }
};

export const ConfigurationView: React.FC<ConfigurationViewProps> = ({
  clinicConfig,
  onUpdateClinicConfig,
  caregivers,
  onUpdateCaregivers,
  therapists,
  onUpdateTherapists,
  patients,
  users = [],
  onUpdateUsers,
  onApproveUser = () => {},
  onRejectUser = () => {},
  onChangeRole = () => {},
  onUpdateUserPermissions
}) => {
  const [activeTab, setActiveTab] = useState<'geral' | 'marca' | 'cuidadores' | 'terapeutas' | 'usuarios' | 'database' | 'changelog'>('geral');
  const [tempConfig, setTempConfig] = useState<ClinicConfig>(clinicConfig);

  // Mantém tempConfig sempre sincronizado quando clinicConfig for atualizado
  useEffect(() => {
    setTempConfig(clinicConfig);
  }, [clinicConfig]);
  const [savedSuccess, setSavedSuccess] = useState(false);
    const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [previewTherapistId, setPreviewTherapistId] = useState<string>(''); // Vazio = Usar dados da Clínica & RT

  const fileInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  // Estados para Backup do Banco MariaDB
  const [isBackingUp, setIsBackingUp] = useState<boolean>(false);
  const [backupMsg, setBackupMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [backupFiles, setBackupFiles] = useState<{ filename: string; size: string; createdAt: string }[]>([]);

  useEffect(() => {
    fetchBackupList().then(list => setBackupFiles(list));
  }, []);

  // Sincronizar Favicon e Ícones do Navegador/PWA
  useEffect(() => {
    const iconSource = tempConfig.faviconUrl || '/pwa-512x512.png';
    updateBrowserFavicon(iconSource);
  }, [tempConfig.faviconUrl, tempConfig.logoUrl]);

  // Estados para novo cadastro robusto de Cuidador
  const [newCaregiverName, setNewCaregiverName] = useState('');
  const [newCaregiverCpf, setNewCaregiverCpf] = useState('');
  const [newCaregiverEmail, setNewCaregiverEmail] = useState('');
  const [newCaregiverAddress, setNewCaregiverAddress] = useState('');
  const [newCaregiverPhone, setNewCaregiverPhone] = useState('');
  const [newCaregiverSecondaryPhone, setNewCaregiverSecondaryPhone] = useState('');
  const [newCaregiverRegNumber, setNewCaregiverRegNumber] = useState('');
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

  // Estado para Janela de Confirmação de Alterações
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  // Efetiva as alterações apenas após confirmação explícita
  const handleConfirmSave = () => {
    onUpdateClinicConfig(tempConfig);
    safeLocalStorageSetItem('health_deglut_clinic_config', JSON.stringify(tempConfig));
    
    // Grava de forma permanente no banco de dados MariaDB
    saveClinicConfigToMariaDB(tempConfig);

    // Sincroniza o Responsável Técnico na aba de Fonoaudiólogas & Equipe
    const rtEmail = (tempConfig.email || '').trim().toLowerCase();
    const rtTherapist: Therapist = {
      id: 'th_rt',
      name: tempConfig.technicalResponsible,
      roleTitle: tempConfig.roleTitle || 'Fonoaudióloga',
      crfa: tempConfig.crfa,
      cpf: tempConfig.cpf,
      phone: tempConfig.phoneWhatsapp,
      email: rtEmail,
      instagram: tempConfig.instagram,
      specialty: 'Responsável Técnica & Fonoaudiologia',
      active: true
    };
    const otherTherapists = therapists.filter(t => t.id !== 'th_rt' && t.name.toLowerCase() !== tempConfig.technicalResponsible.toLowerCase());
    const updatedTherapists = [rtTherapist, ...otherTherapists];
    onUpdateTherapists(updatedTherapists);
    saveTherapistToMariaDB(rtTherapist);

    // Sincroniza o RT na aba de Gestão de Usuários & Telas
    if (rtEmail && onUpdateUsers) {
      const existingUserIdx = users.findIndex(u => u.email.toLowerCase() === rtEmail);
      if (existingUserIdx === -1) {
        const newRtUser: UserProfile = {
          id: 'user_rt',
          email: rtEmail,
          name: tempConfig.technicalResponsible,
          role: 'admin',
          approved: true,
          crfaNumber: tempConfig.crfa,
          allowedTabs: ['resumo', 'prontuario', 'radi', 'registro', 'historico', 'chat', 'pacientes', 'relatorios', 'configuracao'],
          createdAt: new Date().toISOString()
        };
        const updatedUsers = [...users, newRtUser];
        onUpdateUsers(updatedUsers);
        saveUserToMariaDB(newRtUser);
      } else {
        const updatedUsers = users.map(u => u.email.toLowerCase() === rtEmail ? {
          ...u,
          name: tempConfig.technicalResponsible,
          crfaNumber: tempConfig.crfa,
          role: 'admin' as const
        } : u);
        onUpdateUsers(updatedUsers);
      }
    }

    setHasPendingChanges(false);
    setShowConfirmModal(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);

    // Sincroniza Favicon do navegador com a nova configuração confirmada
    const iconSource = tempConfig.faviconUrl || '/pwa-512x512.png';
    updateBrowserFavicon(iconSource);
  };

  const handleSaveConfig = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setShowConfirmModal(true);
  };

  // Upload da Logomarca (Exclusivo para Relatórios e Timbrados) com achatar/expandir para proporção ideal sem margens vazias
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Redimensiona proporcionalmente para resolução nítida de cabeçalho sem barras vazias laterais
      const optimizedBase64 = await resizeImageToTarget(file, 900, 360, 'contain-right');
      const updated = { ...tempConfig, logoUrl: optimizedBase64 };
      setTempConfig(updated);
      setHasPendingChanges(true);

      // Auto-gravação imediata no localStorage e estado global para impedir perda no F5
      onUpdateClinicConfig(updated);
      safeLocalStorageSetItem('health_deglut_clinic_config', JSON.stringify(updated));
      saveClinicConfigToMariaDB(updated);
      // Sincronizado com MariaDB
    } catch {
      alert('Erro ao processar imagem da logomarca.');
    }
  };

  const handleResetLogo = () => {
    const updated = { ...tempConfig, logoUrl: '/assets/logo.png' };
    setTempConfig(updated);
    setHasPendingChanges(true);
    onUpdateClinicConfig(updated);
    safeLocalStorageSetItem('health_deglut_clinic_config', JSON.stringify(updated));
    saveClinicConfigToMariaDB(updated);
    // Sincronizado com MariaDB
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Upload do Ícone de Aplicativo / Favicon (Navegador & PWA) com auto-trim de bordas brancas e expansão máxima de borda a borda (512x512)
  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Elimina margens em branco da imagem e expande o símbolo para ocupar o favicon inteiro (estilo Google AI Studio)
      const optimizedSquareBase64 = await resizeImageToTarget(file, 512, 512, 'favicon-square');
      const updated = { ...tempConfig, faviconUrl: optimizedSquareBase64 };
      setTempConfig(updated);
      setHasPendingChanges(true);

      // Auto-gravação imediata no localStorage e estado global para impedir perda no F5
      onUpdateClinicConfig(updated);
      safeLocalStorageSetItem('health_deglut_clinic_config', JSON.stringify(updated));
      saveClinicConfigToMariaDB(updated);
      // Sincronizado com MariaDB
      updateBrowserFavicon(optimizedSquareBase64);
    } catch {
      alert('Erro ao processar imagem do ícone.');
    }
  };

  const handleResetFavicon = () => {
    const updated = { ...tempConfig, faviconUrl: '/pwa-512x512.png' };
    setTempConfig(updated);
    setHasPendingChanges(true);
    onUpdateClinicConfig(updated);
    safeLocalStorageSetItem('health_deglut_clinic_config', JSON.stringify(updated));
    saveClinicConfigToMariaDB(updated);
    // Sincronizado com MariaDB
    updateBrowserFavicon('/pwa-512x512.png');
    if (faviconInputRef.current) {
      faviconInputRef.current.value = '';
    }
  };

  const handleAddCaregiver = () => {
    if (!newCaregiverName.trim() || !newCaregiverEmail.trim()) {
      alert('Nome e E-mail do cuidador são obrigatórios (o e-mail será usado para o login no sistema).');
      return;
    }
    const cleanEmail = newCaregiverEmail.trim().toLowerCase();
    const newId = `cg_${Date.now()}`;
    const newCg: Caregiver = {
      id: newId,
      name: newCaregiverName.trim(),
      cpf: newCaregiverCpf.trim(),
      email: cleanEmail,
      address: newCaregiverAddress.trim(),
      phone: newCaregiverPhone.trim() || '(21) 90000-0000',
      secondaryPhone: newCaregiverSecondaryPhone.trim() || undefined,
      registrationNumber: newCaregiverRegNumber.trim() || undefined,
      kinshipOrRole: newCaregiverRole,
      assignedPatientIds: newCaregiverPatientId ? [newCaregiverPatientId] : []
    };

    const updatedCaregivers = [...caregivers, newCg];
    onUpdateCaregivers(updatedCaregivers);
    saveCaregiverToMariaDB(newCg);

    // Sincroniza imediatamente na aba de Gestão de Usuários & Telas
    if (onUpdateUsers) {
      const existingUserIdx = users.findIndex(u => u.email.toLowerCase() === cleanEmail);
      if (existingUserIdx === -1) {
        const newUser: UserProfile = {
          id: `user_${newId}`,
          email: cleanEmail,
          name: newCaregiverName.trim(),
          role: 'cuidador',
          approved: true,
          patientId: newCaregiverPatientId || undefined,
          allowedTabs: ['registro', 'chat', 'historico'],
          createdAt: new Date().toISOString()
        };
        const updatedUsers = [...users, newUser];
        onUpdateUsers(updatedUsers);
        saveUserToMariaDB(newUser);
      }
    }

    // Limpeza de campos
    setNewCaregiverName('');
    setNewCaregiverCpf('');
    setNewCaregiverEmail('');
    setNewCaregiverAddress('');
    setNewCaregiverPhone('');
    setNewCaregiverSecondaryPhone('');
    setNewCaregiverRegNumber('');
    setNewCaregiverPatientId('');
  };

  const handleDeleteCaregiver = (id: string) => {
    const cgToDelete = caregivers.find(c => c.id === id);
    onUpdateCaregivers(caregivers.filter(c => c.id !== id));
    deleteCaregiverFromMariaDB(id);

    // Opcionalmente desativa / remove o usuário correspondente
    if (cgToDelete?.email && onUpdateUsers) {
      const remainingUsers = users.filter(u => u.email.toLowerCase() !== cgToDelete.email.toLowerCase());
      onUpdateUsers(remainingUsers);
      deleteUserFromMariaDB(`user_${id}`);
    }
  };

  const handleAddTherapist = () => {
    if (!newTherapistName.trim() || !newTherapistCrfa.trim()) return;
    const cleanEmail = (newTherapistEmail.trim() || '').toLowerCase();
    const newId = `th_${Date.now()}`;
    const newTh: Therapist = {
      id: newId,
      name: newTherapistName.trim(),
      crfa: newTherapistCrfa.trim(),
      cpf: newTherapistCpf.trim() || undefined,
      phone: newTherapistPhone.trim() || undefined,
      email: cleanEmail || undefined,
      instagram: newTherapistInstagram.trim() || undefined,
      specialty: newTherapistSpecialty,
      active: true
    };

    const updatedTherapists = [...therapists, newTh];
    onUpdateTherapists(updatedTherapists);
    saveTherapistToMariaDB(newTh);

    // Sincroniza imediatamente na aba de Gestão de Usuários & Telas
    if (cleanEmail && onUpdateUsers) {
      const existingUserIdx = users.findIndex(u => u.email.toLowerCase() === cleanEmail);
      if (existingUserIdx === -1) {
        const newUser: UserProfile = {
          id: `user_${newId}`,
          email: cleanEmail,
          name: newTherapistName.trim(),
          role: 'fonoaudiologo',
          approved: true,
          crfaNumber: newTherapistCrfa.trim(),
          allowedTabs: ['resumo', 'prontuario', 'radi', 'registro', 'historico', 'chat', 'pacientes', 'relatorios'],
          createdAt: new Date().toISOString()
        };
        const updatedUsers = [...users, newUser];
        onUpdateUsers(updatedUsers);
        saveUserToMariaDB(newUser);
      }
    }

    setNewTherapistName('');
    setNewTherapistCrfa('');
    setNewTherapistCpf('');
    setNewTherapistPhone('');
    setNewTherapistEmail('');
    setNewTherapistInstagram('');
  };

  const handleDeleteTherapist = (id: string) => {
    const thToDelete = therapists.find(t => t.id === id);
    onUpdateTherapists(therapists.filter(t => t.id !== id));
    deleteTherapistFromMariaDB(id);

    if (thToDelete && thToDelete.email && onUpdateUsers) {
      const targetEmail = thToDelete.email.toLowerCase();
      const remainingUsers = users.filter(u => u.email.toLowerCase() !== targetEmail);
      onUpdateUsers(remainingUsers);
      deleteUserFromMariaDB(`user_${id}`);
    }
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
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold shadow-md animate-in fade-in zoom-in-95 duration-200">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Configurações salvas com sucesso!</span>
          </div>
        )}
      </div>

      {/* Tabs de Navegação Interna da Configuração com quebra automática de linha (flex-wrap) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#382e27] pb-3">
        <button
          onClick={() => setActiveTab('geral')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'geral'
              ? 'bg-[#c8a88a] text-[#181513] shadow-md font-bold'
              : 'text-[#a69a8f] hover:text-[#181513] hover:bg-[#c8a88a] hover:shadow-xs group/tab'
          }`}
        >
          <Building2 className="w-4 h-4 shrink-0" />
          <span>Clínica & Responsável Técnica</span>
        </button>

        {/* SUB-ABA: Configuração de Marca */}
        <button
          onClick={() => setActiveTab('marca')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'marca'
              ? 'bg-[#c8a88a] text-[#181513] shadow-md font-bold'
              : 'text-[#a69a8f] hover:text-[#181513] hover:bg-[#c8a88a] hover:shadow-xs group/tab'
          }`}
        >
          <FileCheck2 className="w-4 h-4 shrink-0" />
          <span>Configuração de Marca</span>
        </button>

        <button
          onClick={() => setActiveTab('cuidadores')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'cuidadores'
              ? 'bg-[#c8a88a] text-[#181513] shadow-md font-bold'
              : 'text-[#a69a8f] hover:text-[#181513] hover:bg-[#c8a88a] hover:shadow-xs group/tab'
          }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          <span>Cuidadores Cadastrados ({caregivers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('terapeutas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'terapeutas'
              ? 'bg-[#c8a88a] text-[#181513] shadow-md font-bold'
              : 'text-[#a69a8f] hover:text-[#181513] hover:bg-[#c8a88a] hover:shadow-xs group/tab'
          }`}
        >
          <UserCheck className="w-4 h-4 shrink-0" />
          <span>Fonoaudiólogas & Equipe ({therapists.length})</span>
        </button>

        {/* SUB-ABA: Gestão de Usuários & Matriz de Janelas */}
        <button
          onClick={() => setActiveTab('usuarios')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'usuarios'
              ? 'bg-[#c8a88a] text-[#181513] shadow-md font-bold'
              : 'text-[#a69a8f] hover:text-[#181513] hover:bg-[#c8a88a] hover:shadow-xs group/tab'
          }`}
        >
          <UserCog className="w-4 h-4 shrink-0" />
          <span>Gestão de Usuários & Telas ({users.length})</span>
        </button>

        {/* SUB-ABA: Banco de Dados MariaDB & Infraestrutura */}
        <button
          onClick={() => setActiveTab('database')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'database'
              ? 'bg-[#c8a88a] text-[#181513] shadow-md font-bold'
              : 'text-[#a69a8f] hover:text-[#181513] hover:bg-[#c8a88a] hover:shadow-xs group/tab'
          }`}
        >
          <Database className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Banco de Dados & Servidor</span>
        </button>

        {/* SUB-ABA: ChangeLog & Transparência Técnica (LISTA.md) */}
        <button
          onClick={() => setActiveTab('changelog')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'changelog'
              ? 'bg-[#c8a88a] text-[#181513] shadow-md font-bold'
              : 'text-[#a69a8f] hover:text-[#181513] hover:bg-[#c8a88a] hover:shadow-xs group/tab'
          }`}
        >
          <ClipboardList className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>ChangeLog & Entregas</span>
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
                placeholder="Ex: GAMA FONOAUDIOLOGIA"
                value={tempConfig.clinicName || ""}
                onChange={e => setTempConfig({ ...tempConfig, clinicName: e.target.value })}
                className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] placeholder:text-[#a69a8f]/40 focus:border-[#c8a88a] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#c8a88a] mb-1">Responsável Técnica Padrão</label>
              <input
                type="text"
                placeholder="Ex: Adriane Paes da Gama"
                value={tempConfig.technicalResponsible || ""}
                onChange={e => setTempConfig({ ...tempConfig, technicalResponsible: e.target.value })}
                className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] placeholder:text-[#a69a8f]/40 focus:border-[#c8a88a] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#c8a88a] mb-1">Conselho Profissional (CRFa / CREFONO)</label>
              <input
                type="text"
                placeholder="Ex: CREFONO 9531-RJ"
                value={tempConfig.crfa || ""}
                onChange={e => setTempConfig({ ...tempConfig, crfa: e.target.value })}
                className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] placeholder:text-[#a69a8f]/40 focus:border-[#c8a88a] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#c8a88a] mb-1">CPF da Responsável Técnica</label>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={tempConfig.cpf}
                maxLength={14}
                onChange={e => {
                  const raw = e.target.value.replace(/\D/g, '').slice(0, 11);
                  const formatted = raw
                    .replace(/(\d{3})(\d)/, '$1.$2')
                    .replace(/(\d{3})(\d)/, '$1.$2')
                    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                  setTempConfig({ ...tempConfig, cpf: formatted });
                }}
                className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] focus:border-[#c8a88a] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#c8a88a] mb-1">Telefone & WhatsApp Comercial</label>
              <input
                type="text"
                placeholder="(21) 98988-7981"
                value={tempConfig.phoneWhatsapp}
                maxLength={15}
                onChange={e => {
                  const raw = e.target.value.replace(/\D/g, '').slice(0, 11);
                  const formatted = raw.length > 10
                    ? raw.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
                    : raw.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
                  setTempConfig({ ...tempConfig, phoneWhatsapp: formatted });
                }}
                className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] focus:border-[#c8a88a] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#c8a88a] mb-1">E-mail Institucional</label>
              <input
                type="email"
                placeholder="Ex: adrianepaesdagama@gmail.com"
                value={tempConfig.email || ""}
                onChange={e => setTempConfig({ ...tempConfig, email: e.target.value })}
                className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] placeholder:text-[#a69a8f]/40 focus:border-[#c8a88a] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#c8a88a] mb-1">Instagram Oficial</label>
              <input
                type="text"
                placeholder="Ex: @gama_fonoaudiologia"
                value={tempConfig.instagram || ""}
                onChange={e => setTempConfig({ ...tempConfig, instagram: e.target.value })}
                className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] placeholder:text-[#a69a8f]/40 focus:border-[#c8a88a] outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[#c8a88a] mb-1">Endereço / Polo de Atendimento</label>
              <input
                type="text"
                placeholder="Ex: Rio de Janeiro - RJ • Atendimento Clínico e Domiciliar Especializado"
                value={tempConfig.addressLine || ""}
                onChange={e => setTempConfig({ ...tempConfig, addressLine: e.target.value })}
                className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] placeholder:text-[#a69a8f]/40 focus:border-[#c8a88a] outline-none"
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

      {/* Conteúdo da Tab 2: CONFIGURAÇÃO DE MARCA (Dois Painéis Independentes: Relatórios e Favicon/PWA) */}
      {activeTab === 'marca' && (
        <div className="space-y-6">
          {/* PAINEL DUPLO: Lado a Lado no Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* CARD 1: Upload da Logomarca (EXCLUSIVO PARA RELATÓRIOS E LAUDOS) */}
            <div className="bg-[#1f1a17] border border-[#382e27] rounded-2xl p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="border-b border-[#382e27] pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-base font-bold font-serif text-[#f4efe8] flex items-center gap-2">
                      <FileCheck2 className="w-5 h-5 text-[#c8a88a]" />
                      1. Logomarca dos Relatórios & Laudos
                    </h2>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#c8a88a]/20 text-[#c8a88a] border border-[#c8a88a]/30">
                      PDF / Timbrado
                    </span>
                  </div>
                  <p className="text-xs text-[#a69a8f] mt-1 leading-relaxed">
                    Esta imagem é aplicada <strong>exclusivamente</strong> no cabeçalho dos laudos, atestados, relatórios clínicos e prévia do papel timbrado.
                  </p>
                </div>

                {/* Prévia da Logomarca dos Relatórios */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-[#181513] border border-[#2e2621]">
                  <div className="w-24 h-20 rounded-lg bg-white/5 border border-dashed border-[#44362d] flex items-center justify-center p-2 overflow-hidden shrink-0">
                    {(tempConfig.logoUrl && tempConfig.logoUrl !== '/logo-gama.png') ? (
                      <img 
                        src={tempConfig.logoUrl} 
                        alt="Logo Relatórios" 
                        onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_OFFICIAL_LOGO_BASE64; }} 
                        className="max-h-full max-w-full object-contain" 
                      />
                    ) : (
                      <img 
                        src={DEFAULT_OFFICIAL_LOGO_BASE64} 
                        alt="Logo Oficial GAMA" 
                        className="max-h-full max-w-full object-contain" 
                      />
                    )}
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="font-semibold text-[#f4efe8]">
                      {tempConfig.logoUrl ? 'Logomarca Customizada de Laudos' : 'Monograma Padrão Oficial GAMA'}
                    </p>
                    <p className="text-[#a69a8f] text-[11px] leading-relaxed">
                      Proporção retangular ou quadrada recomendada. PNG com fundo transparente para impressão nítida.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botões de Ação do Card 1 */}
              <div className="pt-3 border-t border-[#382e27] flex items-center gap-2">
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
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#c8a88a] hover:bg-[#d6bca3] text-[#181513] font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  Upload Logo dos Laudos
                </button>

                {tempConfig.logoUrl && (
                  <button
                    type="button"
                    onClick={handleResetLogo}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#27211d] hover:bg-[#342b26] text-[#a69a8f] hover:text-rose-400 border border-[#3e342e] text-xs transition-colors shrink-0"
                    title="Restaurar logotipo padrão"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Padrão
                  </button>
                )}
              </div>
            </div>

            {/* CARD 2: Upload do Favicon & Ícone do Aplicativo PWA (CELULAR & NAVEGADOR) */}
            <div className="bg-[#1f1a17] border border-[#382e27] rounded-2xl p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="border-b border-[#382e27] pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-base font-bold font-serif text-[#f4efe8] flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-emerald-400" />
                      2. Ícone do App & Favicon (Celular / Navegador)
                    </h2>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      PWA / Aba
                    </span>
                  </div>
                  <p className="text-xs text-[#a69a8f] mt-1 leading-relaxed">
                    Este ícone define a imagem que aparece na <strong>aba do navegador (Favicon)</strong> e o <strong>ícone na tela inicial do celular</strong> ao instalar o PWA.
                  </p>
                </div>

                {/* Prévia do Ícone de App / Favicon */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-[#181513] border border-[#2e2621]">
                  <div className="w-20 h-20 rounded-2xl bg-white/5 border border-dashed border-[#44362d] flex items-center justify-center p-2 overflow-hidden shadow-inner shrink-0 relative">
                    {tempConfig.faviconUrl ? (
                      <img src={tempConfig.faviconUrl} alt="Ícone PWA / Favicon" className="w-full h-full object-contain rounded-xl" />
                    ) : tempConfig.logoUrl ? (
                      <img src={tempConfig.logoUrl} alt="Ícone Herdado da Logo" className="w-full h-full object-contain rounded-xl opacity-80" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#c8a88a] to-[#8d6948] flex items-center justify-center font-serif text-[#181513] font-bold text-2xl shadow-md">
                        G
                      </div>
                    )}
                    <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#181513]" />
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="font-semibold text-[#f4efe8] flex items-center gap-1.5">
                      {tempConfig.faviconUrl ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          Ícone Dedicado Ativo
                        </>
                      ) : (
                        'Ícone Padrão GamaEco'
                      )}
                    </p>
                    <p className="text-[#a69a8f] text-[11px] leading-relaxed">
                      Recomendado formato quadrado (ex: 512×512 ou 192×192 em PNG). Ícone nítido para visualização como aplicativo no celular.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botões de Ação do Card 2 */}
              <div className="pt-3 border-t border-[#382e27] flex items-center gap-2">
                <input
                  type="file"
                  ref={faviconInputRef}
                  onChange={handleFaviconUpload}
                  accept="image/png, image/jpeg, image/x-icon, image/svg+xml, image/webp"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => faviconInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  Upload do Ícone PWA / Favicon
                </button>

                {tempConfig.faviconUrl && (
                  <button
                    type="button"
                    onClick={handleResetFavicon}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#27211d] hover:bg-[#342b26] text-[#a69a8f] hover:text-rose-400 border border-[#3e342e] text-xs transition-colors shrink-0"
                    title="Restaurar ícone padrão"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Padrão
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Barra Superior / Alerta de Alterações Pendentes na Marca com Botão de Salvar Alterações */}
          <div className="bg-[#1f1a17] border border-[#382e27] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${hasPendingChanges ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
              <div>
                <p className="text-xs font-bold text-[#f4efe8]">
                  {hasPendingChanges ? 'Você possui alterações de imagem não salvas!' : 'Identidade visual e logotipo em conformidade.'}
                </p>
                <p className="text-[11px] text-[#a69a8f]">
                  Clique no botão ao lado para salvar de forma permanente no banco de dados e aplicar ao sistema.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#c8a88a] to-[#b69474] hover:brightness-110 text-[#181513] font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <Save className="w-4 h-4" />
              Salvar Alterações de Marca
            </button>
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

          {/* Visualizador / Preview em Tempo Real do Papel Timbrado Oficial com Logo Proporcional */}
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
                    <li><strong>Logomarca:</strong> {tempConfig.logoUrl ? 'Logomarca Customizada Carregada' : 'Monograma Oficial GAMA g° em escala nobre proporcional'}</li>
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

      {/* Conteúdo da Tab 3: CUIDADORES CADASTRADOS (CADASTRO ROBUSTO COMPLETO) */}
      {activeTab === 'cuidadores' && (
        <div className="space-y-6">
          {/* Formulário de Adicionar Cuidador Robusto */}
          <div className="bg-[#1f1a17] border border-[#382e27] rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="border-b border-[#382e27] pb-3">
              <h2 className="text-base font-bold font-serif text-[#f4efe8] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#c8a88a]" />
                Ficha de Cadastro do Cuidador / Responsável
              </h2>
              <p className="text-xs text-[#a69a8f] mt-0.5">
                O e-mail cadastrado aqui será a chave de credencial de acesso do cuidador ao aplicativo.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#c8a88a] mb-1">Nome Completo *</label>
                <input
                  type="text"
                  placeholder="Ex: Maria Helena Rocha"
                  value={newCaregiverName}
                  onChange={e => setNewCaregiverName(e.target.value)}
                  className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] outline-none focus:border-[#c8a88a]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#c8a88a] mb-1">CPF *</label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={newCaregiverCpf}
                  onChange={e => {
                    const raw = e.target.value.replace(/\D/g, '').slice(0, 11);
                    const formatted = raw
                      .replace(/(\d{3})(\d)/, '$1.$2')
                      .replace(/(\d{3})(\d)/, '$1.$2')
                      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                    setNewCaregiverCpf(formatted);
                  }}
                  className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] outline-none focus:border-[#c8a88a]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#c8a88a] mb-1 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  E-mail (Usado para o Acesso) *
                </label>
                <input
                  type="email"
                  placeholder="cuidador@email.com"
                  value={newCaregiverEmail}
                  onChange={e => setNewCaregiverEmail(e.target.value)}
                  className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] outline-none focus:border-[#c8a88a]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#c8a88a] mb-1">Telefone Principal / WhatsApp *</label>
                <input
                  type="text"
                  placeholder="(21) 98888-7777"
                  value={newCaregiverPhone}
                  onChange={e => {
                    const raw = e.target.value.replace(/\D/g, '').slice(0, 11);
                    const formatted = raw.length > 10
                      ? raw.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
                      : raw.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
                    setNewCaregiverPhone(formatted);
                  }}
                  className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] outline-none focus:border-[#c8a88a]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#a69a8f] mb-1">Segunda opção de contato (Opcional)</label>
                <input
                  type="text"
                  placeholder="(21) 2555-0000"
                  value={newCaregiverSecondaryPhone}
                  onChange={e => setNewCaregiverSecondaryPhone(e.target.value)}
                  className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] outline-none focus:border-[#c8a88a]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#a69a8f] mb-1 flex items-center gap-1">
                  <FileBadge className="w-3.5 h-3.5 text-[#c8a88a]" />
                  Nº de Registro Profissional (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: COREN-RJ 12345-TE"
                  value={newCaregiverRegNumber}
                  onChange={e => setNewCaregiverRegNumber(e.target.value)}
                  className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] outline-none focus:border-[#c8a88a]"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-xs font-medium text-[#c8a88a] mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#c8a88a]" />
                  Endereço Completo
                </label>
                <input
                  type="text"
                  placeholder="Rua, Número, Bairro, Cidade - UF"
                  value={newCaregiverAddress}
                  onChange={e => setNewCaregiverAddress(e.target.value)}
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
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#c8a88a] hover:bg-[#d6bca3] text-[#181513] font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Cadastrar Cuidador
              </button>
            </div>
          </div>

          {/* Listagem de Cuidadores com Dados Robustos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {caregivers.map(cg => {
              const assignedPat = patients.find(p => cg.assignedPatientIds.includes(p.id));
              return (
                <div key={cg.id} className="bg-[#1f1a17] border border-[#382e27] p-5 rounded-xl flex items-start justify-between gap-3 shadow-xs">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-[#f4efe8]">{cg.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#27211d] text-[#c8a88a] border border-[#3e342e] font-semibold">
                        {cg.kinshipOrRole}
                      </span>
                      {cg.registrationNumber && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/70 text-amber-300 border border-amber-800/40 font-mono">
                          {cg.registrationNumber}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 text-xs text-[#a69a8f]">
                      <p className="flex items-center gap-1.5 truncate">
                        <KeyRound className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">Login: <strong className="text-[#f4efe8]">{cg.email}</strong></span>
                      </p>
                      {cg.cpf && (
                        <p className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-[#c8a88a]">CPF:</span>
                          <span className="font-mono text-[#d8cec4]">{cg.cpf}</span>
                        </p>
                      )}
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#c8a88a] shrink-0" />
                        <span>{cg.phone}</span>
                      </p>
                      {cg.secondaryPhone && (
                        <p className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-[#88786d] shrink-0" />
                          <span className="text-[#a69a8f]">{cg.secondaryPhone}</span>
                        </p>
                      )}
                    </div>

                    {cg.address && (
                      <p className="text-[11px] text-[#88786d] flex items-center gap-1.5 truncate pt-0.5">
                        <MapPin className="w-3 h-3 text-[#c8a88a] shrink-0" />
                        <span className="truncate">{cg.address}</span>
                      </p>
                    )}

                    {assignedPat && (
                      <p className="text-[11px] text-[#c8a88a] font-medium pt-1 border-t border-[#2e2621]">
                        Paciente vinculado: <span className="text-[#f4efe8] underline">{assignedPat.name}</span>
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteCaregiver(cg.id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors shrink-0"
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
                  maxLength={14}
                  onChange={e => {
                    const raw = e.target.value.replace(/\D/g, '').slice(0, 11);
                    const formatted = raw
                      .replace(/(\d{3})(\d)/, '$1.$2')
                      .replace(/(\d{3})(\d)/, '$1.$2')
                      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                    setNewTherapistCpf(formatted);
                  }}
                  className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] outline-none focus:border-[#c8a88a]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#c8a88a] mb-1">Telefone / WhatsApp (Em branco herda RT)</label>
                <input
                  type="text"
                  placeholder={tempConfig.phoneWhatsapp || "(21) 98988-7981"}
                  value={newTherapistPhone}
                  maxLength={15}
                  onChange={e => {
                    const raw = e.target.value.replace(/\D/g, '').slice(0, 11);
                    const formatted = raw.length > 10
                      ? raw.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
                      : raw.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
                    setNewTherapistPhone(formatted);
                  }}
                  className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] outline-none focus:border-[#c8a88a]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#c8a88a] mb-1 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  E-mail de Acesso (Login) *
                </label>
                <input
                  type="email"
                  placeholder={tempConfig.email}
                  value={newTherapistEmail}
                  onChange={e => setNewTherapistEmail(e.target.value)}
                  className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] outline-none focus:border-[#c8a88a]"
                />
                <span className="text-[10px] text-[#a69a8f] mt-0.5 block">Usado para primeiro acesso e criação de senha</span>
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

                  {th.id !== 'th_rt' && th.name.toLowerCase() !== tempConfig.technicalResponsible.toLowerCase() ? (
                    <button
                      type="button"
                      onClick={() => handleDeleteTherapist(th.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                      title="Excluir fonoaudióloga"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir Fono</span>
                    </button>
                  ) : (
                    <span className="text-[10px] px-2.5 py-1 rounded-lg bg-amber-950/60 text-amber-300 border border-amber-800/40 font-semibold shrink-0">
                      Responsável Técnica (RT)
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Conteúdo da Tab 5: Gestão de Usuários & Matriz de Janelas / Modais */}
      {activeTab === 'usuarios' && (
        <div className="bg-[#1f1a17] border border-[#382e27] rounded-2xl p-6 shadow-sm">
          <AdminUsersView
            users={users}
            onApproveUser={onApproveUser}
            onRejectUser={onRejectUser}
            onChangeRole={onChangeRole}
            onUpdateUserPermissions={onUpdateUserPermissions}
          />
        </div>
      )}

      {/* Conteúdo da Sub-Aba: Banco de Dados MariaDB & Infraestrutura Local */}
      {activeTab === 'database' && (
        <div className="bg-[#1f1a17] border border-[#382e27] rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#382e27] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold font-serif text-[#f4efe8]">
                  Banco de Dados MariaDB & Infraestrutura Local
                </h2>
                <p className="text-xs text-[#a69a8f]">
                  Servidor próprio dedicado com MariaDB/MySQL (`gamaecosystem_db`) e Express REST API
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#27211d] border border-[#3f342d] text-xs text-[#c8a88a] self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Instância: <strong>gamaecosystem_db</strong></span>
            </div>
          </div>

          {/* Cards de Status da Infraestrutura */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status do MariaDB */}
            <div className="p-4 rounded-xl bg-[#181513] border border-[#342b26] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#a69a8f] block">
                Motor de Banco Relacional
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-[#f4efe8] block">MariaDB 10.3+</span>
                  <span className="text-xs text-[#85796f]">Porta interna 3306 (Local)</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Conectado
                </span>
              </div>
            </div>

            {/* Status da API REST */}
            <div className="p-4 rounded-xl bg-[#181513] border border-[#342b26] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#a69a8f] block">
                API Backend REST Express
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-[#f4efe8] block">server_prod.cjs</span>
                  <span className="text-xs text-[#85796f]">Porta interna 3005 (PM2)</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Online
                </span>
              </div>
            </div>

            {/* Domínio & SSL */}
            <div className="p-4 rounded-xl bg-[#181513] border border-[#342b26] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#a69a8f] block">
                Domínio Seguro HTTPS
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-[#f4efe8] block">gamaecosystem.duckdns.org</span>
                  <span className="text-xs text-[#85796f]">Nginx SSL Let's Encrypt</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Ativo
                </span>
              </div>
            </div>
          </div>

          {/* CARD DE BACKUP AUTOMÁTICO & SOB DEMANDA DO MARIADB (PRODUÇÃO) */}
          <div className="p-5 rounded-xl bg-[#181513] border border-[#3d322a] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#f4efe8] flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-emerald-400" />
                  Backup Automático do Banco MariaDB (`gamaecosystem_db`)
                </h3>
                <p className="text-xs text-[#a69a8f]">
                  Rotina diária automática às 03:00 com retenção de 7 dias e compactação Gzip no servidor Ubuntu. Você também pode acionar um dump manual imediato.
                </p>
              </div>

              <button
                type="button"
                disabled={isBackingUp}
                onClick={async () => {
                  setIsBackingUp(true);
                  setBackupMsg(null);
                  const res = await triggerDatabaseBackup();
                  if (res.success) {
                    setBackupMsg({ success: true, text: res.message });
                    const list = await fetchBackupList();
                    setBackupFiles(list);
                  } else {
                    setBackupMsg({ success: false, text: res.message });
                  }
                  setIsBackingUp(false);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isBackingUp ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Gerando Dump...</span>
                  </>
                ) : (
                  <>
                    <HardDrive className="w-4 h-4" />
                    <span>Gerar Backup Agora</span>
                  </>
                )}
              </button>
            </div>

            {backupMsg && (
              <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                backupMsg.success 
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
              }`}>
                {backupMsg.success ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                <span>{backupMsg.text}</span>
              </div>
            )}

            {/* Lista de Backups Existentes no Servidor */}
            {backupFiles.length > 0 && (
              <div className="pt-2 border-t border-[#342a22] space-y-2">
                <span className="text-[11px] font-bold text-[#c8a88a] uppercase tracking-wider block">
                  Backups Recentes no Servidor ({backupFiles.length})
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {backupFiles.map((b, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-[#241e1a] border border-[#382e27] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-3.5 h-3.5 text-[#c8a88a]" />
                        <span className="font-mono text-[#f4efe8]">{b.filename}</span>
                        <span className="text-[10px] text-[#7d7168]">({b.size})</span>
                      </div>
                      <span className="text-[11px] text-[#a69a8f]">{b.createdAt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dados das Tabelas Relacionais Ativas */}
          <div className="p-4 rounded-xl bg-[#181513] border border-[#342b26] space-y-3">
            <span className="text-xs font-bold text-[#f4efe8] block">
              Tabelas Relacionais Ativas no MariaDB (`gamaecosystem_db`):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#221d1a] border border-[#382e27]">
                <span className="text-[#a69a8f] block text-[10px]">Pacientes:</span>
                <strong className="text-[#c8a88a] font-mono text-sm">{patients.length}</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-[#221d1a] border border-[#382e27]">
                <span className="text-[#a69a8f] block text-[10px]">Cuidadores:</span>
                <strong className="text-[#c8a88a] font-mono text-sm">{caregivers.length}</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-[#221d1a] border border-[#382e27]">
                <span className="text-[#a69a8f] block text-[10px]">Fonoaudiólogos:</span>
                <strong className="text-[#c8a88a] font-mono text-sm">{therapists.length}</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-[#221d1a] border border-[#382e27]">
                <span className="text-[#a69a8f] block text-[10px]">Usuários / Acessos:</span>
                <strong className="text-[#c8a88a] font-mono text-sm">{users.length}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo da Tab: ChangeLog & Transparência Técnica */}
      {activeTab === 'changelog' && (
        <ChangeLogView />
      )}

      {/* Modal de Confirmação Obrigatório para Salvar Alterações */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#1f1a17] border border-[#c8a88a]/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 dark:text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold font-serif text-[#f4efe8]">
                  Confirmar Alterações
                </h3>
                <p className="text-xs text-[#a69a8f] leading-relaxed">
                  As configurações e arquivos visuais serão salvos de forma permanente no banco de dados e aplicados em toda a plataforma. <strong>Tem certeza que deseja salvar?</strong>
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#181513] border border-[#342b26] text-xs text-[#c8a88a] space-y-1">
              <p className="font-semibold text-[#f4efe8]">Itens que serão efetivados:</p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-[#a69a8f]">
                <li>Logomarca de relatórios, atestados e papel timbrado</li>
                <li>Favicon do navegador e ícone de instalação do PWA</li>
                <li>Dados cadastrais da clínica e da Responsável Técnica</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-[#27211d] hover:bg-[#342b26] text-[#a69a8f] hover:text-[#f4efe8] text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#c8a88a] hover:bg-[#d6bca3] text-[#181513] font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
              >
                <Save className="w-4 h-4" />
                Sim, Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
