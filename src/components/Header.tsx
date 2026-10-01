import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, Patient, RadiAssessment, NavigationTab } from '../types';
import { OfficialEvolutionData } from '../types/clinicalEvolution';
import { Logo } from './Logo';
import { UserProfileModal } from './UserProfileModal';
import { UserManualModal } from './UserManualModal';
import { 
  Bell, 
  HelpCircle, 
  Menu,
  FileSignature,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  Trash2,
  CheckCheck
} from 'lucide-react';

export interface ClinicalNotification {
  id: string;
  type: 'signature_pending' | 'high_risk' | 'moderate_risk' | 'chat_message' | 'evolution_recent';
  title: string;
  description: string;
  patientId: string;
  patientName: string;
  timestamp: string;
  actionTab: NavigationTab;
  priority: 'alta' | 'media' | 'baixa';
}

export interface HeaderProps {
  user?: UserProfile;
  currentUser?: UserProfile;
  darkMode?: boolean;
  setDarkMode?: (val: boolean) => void;
  onLogout: () => void;
  onOpenUserModal?: () => void;
  onUpdateUser?: (updated: UserProfile) => void;
  onOpenSettings?: () => void;
  patientsCount?: number;
  onOpenMenu: () => void;
  // Integração com Pendências Clínicas
  patients?: Patient[];
  officialEvolutions?: OfficialEvolutionData[];
  radiAssessments?: RadiAssessment[];
  onNavigateToTab?: (tab: NavigationTab, patientId?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  currentUser: propCurrentUser,
  darkMode = true,
  setDarkMode,
  onLogout,
  onOpenUserModal,
  onUpdateUser,
  onOpenSettings,
  patientsCount,
  onOpenMenu,
  patients = [],
  officialEvolutions = [],
  radiAssessments = [],
  onNavigateToTab
}) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  // IDs marcadas como lidas
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gama_read_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // IDs dispensadas/limpadas pelo usuário
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gama_dismissed_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const notifDropdownRef = useRef<HTMLDivElement>(null);

  const activeUser = user || propCurrentUser || {
    id: 'user_fallback',
    name: 'Adriane Gama',
    email: 'adrianepaesdagama@gmail.com',
    role: 'fonoaudiologo' as const,
    approved: true,
    crfaNumber: 'CREFONO 9531-RJ',
    createdAt: new Date().toISOString()
  };

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationsOpen]);

  // Salvar notificações lidas
  useEffect(() => {
    localStorage.setItem('gama_read_notifications', JSON.stringify(readNotificationIds));
  }, [readNotificationIds]);

  // Salvar notificações dispensadas/limpas
  useEffect(() => {
    localStorage.setItem('gama_dismissed_notifications', JSON.stringify(dismissedNotificationIds));
  }, [dismissedNotificationIds]);

  // Gerar lista de Pendências Clínicas em Tempo Real
  const allNotifications: ClinicalNotification[] = React.useMemo(() => {
    const list: ClinicalNotification[] = [];

    // 1. Evoluções Clínicas aguardando assinatura do familiar/responsável
    officialEvolutions.forEach(evo => {
      if (evo.status === 'aguardando_familiar') {
        const patient = patients.find(p => p.id === evo.patientId);
        const patientName = patient?.name || 'Paciente Clínico';
        list.push({
          id: `evo_sig_${evo.id}`,
          type: 'signature_pending',
          title: 'Assinatura Pendente na Evolução',
          description: `Evolução de ${evo.sessionDate} assinada pela Fonoaudióloga aguarda validação do familiar.`,
          patientId: evo.patientId,
          patientName,
          timestamp: evo.sessionDate,
          actionTab: 'prontuario',
          priority: 'alta'
        });
      }
    });

    // 2. Avaliações RaDI com Risco Alto ou Moderado
    radiAssessments.forEach(ra => {
      const patient = patients.find(p => p.id === ra.patientId);
      const patientName = patient?.name || ra.patientName || 'Paciente Clínico';

      if (ra.riskLevel === 'Alto Risco') {
        list.push({
          id: `radi_high_${ra.id}`,
          type: 'high_risk',
          title: 'Alerta de Alto Risco de Broncoaspiração',
          description: `${patientName} classificado em Alto Risco (Score ${ra.score}/9). Requer manobras protetivas e via segura.`,
          patientId: ra.patientId,
          patientName,
          timestamp: ra.date || ra.createdAt?.slice(0, 10) || '',
          actionTab: 'radi',
          priority: 'alta'
        });
      } else if (ra.riskLevel === 'Risco Moderado') {
        list.push({
          id: `radi_mod_${ra.id}`,
          type: 'moderate_risk',
          title: 'Atenção: Risco Moderado de Deglutição',
          description: `${patientName} com Score ${ra.score}/9. Monitorar escape precoce e consistência alimentar.`,
          patientId: ra.patientId,
          patientName,
          timestamp: ra.date || ra.createdAt?.slice(0, 10) || '',
          actionTab: 'radi',
          priority: 'media'
        });
      }
    });

    // Se o usuário logado for Cuidador, focar nas pendências do paciente dele
    if (activeUser.role === 'cuidador' && activeUser.patientId) {
      return list.filter(n => n.patientId === activeUser.patientId);
    }

    return list;
  }, [officialEvolutions, radiAssessments, patients, activeUser]);

  // Filtra as que não foram limpas/dispensadas pelo usuário
  const activeNotifications = allNotifications.filter(
    n => !dismissedNotificationIds.includes(n.id)
  );

  // Contagem de notificações ativas não lidas
  const unreadCount = activeNotifications.filter(n => !readNotificationIds.includes(n.id)).length;

  const handleNotificationClick = (notif: ClinicalNotification) => {
    // Marca como lida
    if (!readNotificationIds.includes(notif.id)) {
      setReadNotificationIds(prev => [...prev, notif.id]);
    }
    setIsNotificationsOpen(false);
    if (onNavigateToTab) {
      onNavigateToTab(notif.actionTab, notif.patientId);
    }
  };

  const handleMarkAllAsRead = () => {
    const allIds = activeNotifications.map(n => n.id);
    setReadNotificationIds(prev => Array.from(new Set([...prev, ...allIds])));
  };

  // Função para LIMPAR NOTIFICAÇÕES (Remove todas as notificações da visualização)
  const handleClearAllNotifications = () => {
    const allCurrentIds = allNotifications.map(n => n.id);
    setDismissedNotificationIds(allCurrentIds);
  };

  // Remover uma notificação individual
  const handleDismissSingleNotification = (e: React.MouseEvent, notifId: string) => {
    e.stopPropagation();
    setDismissedNotificationIds(prev => [...prev, notifId]);
  };

  const handleUserBadgeClick = () => {
    if (onOpenUserModal) {
      onOpenUserModal();
    } else {
      setIsProfileModalOpen(true);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#1c1815]/95 backdrop-blur-md border-b border-[#342b26] px-4 sm:px-6 py-3 transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left: Botão Menu Sanduíche & Identidade Visual do Sistema */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={onOpenMenu}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#27211d] hover:bg-[#342b26] text-[#c8a88a] border border-[#3f342d] transition-all flex items-center gap-2 cursor-pointer group active:scale-95 shadow-sm"
              title="Abrir Menu de Navegação do Sistema"
              aria-label="Menu principal"
            >
              <Menu className="w-5 h-5 text-[#c8a88a] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-[#f4efe8] hidden sm:inline">Menu</span>
            </button>

            {/* Logomarca & Favicon com tamanho nítido e visível */}
            <Logo size="sm" />
          </div>

          {/* Right: Ações & Sino de Pendências */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Botão de Ajuda / Manual Operacional */}
            <button 
              onClick={() => setIsManualModalOpen(true)}
              className="p-2 rounded-xl bg-[#27211d] hover:bg-[#342b26] text-[#a69a8f] hover:text-[#f4efe8] border border-[#3f342d] transition-colors cursor-pointer group"
              title="Manual do Usuário & Guia Operacional"
              aria-label="Abrir manual do usuário"
            >
              <HelpCircle className="w-4 h-4 text-[#a69a8f] group-hover:text-[#c8a88a] transition-colors" />
            </button>

            {/* Container do Sino de Notificações com Dropdown Interativo de Pendências */}
            <div className="relative" ref={notifDropdownRef}>
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`relative p-2 rounded-xl border transition-all cursor-pointer group active:scale-95 ${
                  isNotificationsOpen || unreadCount > 0
                    ? 'bg-[#27211d] text-[#c8a88a] border-[#c8a88a]/40 shadow-sm'
                    : 'bg-[#27211d] hover:bg-[#342b26] text-[#a69a8f] hover:text-[#f4efe8] border-[#3f342d]'
                }`}
                title={unreadCount > 0 ? `${unreadCount} notificação(ões) clínica(s) pendente(s)` : "Notificações e pendências clínicas"}
                aria-label="Notificações e pendências clínicas"
              >
                <Bell className={`w-4 h-4 transition-transform ${unreadCount > 0 ? 'text-[#c8a88a] group-hover:scale-110' : 'text-[#a69a8f]'}`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Pop-up / Dropdown Flutuante de Pendências Clínicas */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#1c1815] border border-[#3f342d] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Cabeçalho do Dropdown */}
                  <div className="p-3.5 border-b border-[#342b26] bg-[#221d1a] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#c8a88a]" />
                      <h4 className="text-xs font-bold font-serif text-[#f4efe8]">
                        Pendências & Alertas
                      </h4>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                          {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {/* Ações do Cabeçalho: Marcar Lidas e Limpar Notificações */}
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="flex items-center gap-1 text-[11px] font-semibold text-[#c8a88a] hover:text-[#deb887] transition-colors cursor-pointer"
                          title="Marcar todas como lidas"
                        >
                          <CheckCheck className="w-3 h-3" />
                          <span className="hidden sm:inline">Lidas</span>
                        </button>
                      )}
                      {activeNotifications.length > 0 && (
                        <button
                          onClick={handleClearAllNotifications}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-white border border-rose-800/40 text-[11px] font-semibold transition-all cursor-pointer"
                          title="Limpar e remover todas as notificações da lista"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Limpar</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Lista de Notificações / Pendências */}
                  <div className="max-h-[380px] overflow-y-auto divide-y divide-[#2a221d] scrollbar-thin scrollbar-thumb-[#3a312c]">
                    {activeNotifications.length === 0 ? (
                      <div className="py-8 px-4 text-center">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                        <p className="text-xs font-semibold text-[#f4efe8]">
                          Tudo limpo e em dia!
                        </p>
                        <p className="text-[11px] text-[#a69a8f] mt-1">
                          Nenhuma pendência clínica ou alerta ativo no momento.
                        </p>
                      </div>
                    ) : (
                      activeNotifications.map(notif => {
                        const isRead = readNotificationIds.includes(notif.id);
                        return (
                          <div
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`p-3.5 transition-colors cursor-pointer text-left hover:bg-[#25201c] group flex items-start gap-3 relative ${
                              isRead ? 'opacity-70 bg-transparent' : 'bg-[#221d1a]/50'
                            }`}
                          >
                            {/* Ícone de Categoria */}
                            <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                              notif.type === 'signature_pending' 
                                ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40' 
                                : notif.type === 'high_risk'
                                ? 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                                : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                            }`}>
                              {notif.type === 'signature_pending' ? (
                                <FileSignature className="w-4 h-4" />
                              ) : (
                                <AlertTriangle className="w-4 h-4" />
                              )}
                            </div>

                            {/* Conteúdo da Notificação */}
                            <div className="flex-1 min-w-0 pr-6">
                              <div className="flex items-center justify-between gap-1">
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                  notif.priority === 'alta' ? 'text-rose-400' : 'text-amber-400'
                                }`}>
                                  {notif.patientName}
                                </span>
                                <span className="text-[10px] text-[#8a7b70]">
                                  {notif.timestamp}
                                </span>
                              </div>
                              <p className="text-xs font-bold text-[#f4efe8] mt-0.5 leading-snug group-hover:text-[#c8a88a] transition-colors">
                                {notif.title}
                              </p>
                              <p className="text-[11px] text-[#a69a8f] mt-0.5 line-clamp-2 leading-relaxed">
                                {notif.description}
                              </p>
                              <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-[#c8a88a] group-hover:underline">
                                <span>Acessar {notif.actionTab === 'prontuario' ? 'Prontuário & Assinatura' : 'Avaliação RaDI'}</span>
                                <ExternalLink className="w-3 h-3" />
                              </div>
                            </div>

                            {/* Botão Individual de Descartar / Limpar Notificação */}
                            <button
                              onClick={(e) => handleDismissSingleNotification(e, notif.id)}
                              className="absolute top-3 right-3 p-1 rounded-lg text-[#8a7b70] hover:text-rose-400 hover:bg-rose-950/30 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                              title="Limpar esta notificação"
                              aria-label="Limpar notificação"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Ponto indicador de não lida */}
                            {!isRead && (
                              <span className="w-2 h-2 rounded-full bg-[#c8a88a] shrink-0 mt-2" />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Rodapé com botão de Limpar Tudo para maior conveniência */}
                  {activeNotifications.length > 0 && (
                    <div className="p-2.5 bg-[#181513] border-t border-[#342b26] flex items-center justify-between">
                      <span className="text-[10px] text-[#8a7b70]">
                        {activeNotifications.length} notificação(ões) na lista
                      </span>
                      <button
                        onClick={handleClearAllNotifications}
                        className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Limpar todas
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Badge (Abre Pop-up Flutuante com Troca de Senha, Tema, Configurações Gerais e Logout) */}
            <button
              onClick={handleUserBadgeClick}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#27211d] hover:bg-[#342b26] border border-[#3f342d] transition-all text-left cursor-pointer active:scale-95"
              title="Conta & Configurações de Usuário"
            >
              <div className="w-7 h-7 rounded-full bg-[#c8a88a] text-[#181513] font-bold flex items-center justify-center text-xs">
                {activeUser.name.charAt(0)}
              </div>
              <div className="hidden md:flex flex-col">
                <span className="text-xs font-semibold text-[#f4efe8] leading-tight">
                  {activeUser.name}
                </span>
                <span className="text-[10px] text-[#c8a88a] uppercase tracking-wider">
                  {activeUser.role === 'fonoaudiologo' ? 'Fonoaudióloga' : activeUser.role}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Pop-up Flutuante de Perfil de Usuário */}
        <UserProfileModal
          user={activeUser}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onLogout={onLogout}
          onUpdateUser={onUpdateUser}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onOpenSettings={onOpenSettings}
        />

        {/* Modal de Manual do Usuário & Guia Operacional */}
        <UserManualModal
          isOpen={isManualModalOpen}
          onClose={() => setIsManualModalOpen(false)}
        />
      </header>
    </>
  );
};
