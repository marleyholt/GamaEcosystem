import React, { useState } from 'react';
import { Logo } from './Logo';
import { UserProfile } from '../types';
import { UserProfileModal } from './UserProfileModal';
import { UserManualModal } from './UserManualModal';
import { 
  Bell, 
  HelpCircle,
  Moon, 
  Sun, 
  ShieldCheck, 
  Database, 
  UserCheck,
  Menu
} from 'lucide-react';

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
  pendingUsersCount?: number;
  onOpenMenu: () => void;
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
  pendingUsersCount = 0,
  onOpenMenu
}) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  const activeUser = user || propCurrentUser || {
    id: 'user_fallback',
    name: 'Adriane Gama',
    email: 'adrianepaesdagama@gmail.com',
    role: 'fonoaudiologo' as const,
    approved: true,
    crfaNumber: 'CRFa 3-12894',
    createdAt: new Date().toISOString()
  };

  const handleUserBadgeClick = () => {
    setIsProfileModalOpen(prev => !prev);
    if (onOpenUserModal) {
      onOpenUserModal();
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#1c1815]/95 backdrop-blur-md border-b border-[#342b26] px-4 py-2.5 sm:px-6">
      <div className="w-full flex items-center justify-between">
        {/* Left: Botão Sanduíche lá no topo que abre o menu lateral */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMenu}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#27211d] hover:bg-[#342b26] text-[#c8a88a] border border-[#3e342e] transition-all shadow-sm active:scale-95 group cursor-pointer"
            title="Abrir menu de navegação lateral"
            aria-label="Abrir menu de navegação lateral"
          >
            <Menu className="w-5 h-5 text-[#c8a88a] group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-[#f4efe8] hidden sm:inline">Menu</span>
          </button>

          <Logo size="sm" />
        </div>

        {/* Right: User Status & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Security & LGPD Indicator */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#27211d] border border-[#3f342d] text-xs text-[#c8a88a]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-[11px]">LGPD & Criptografia Ativa</span>
          </div>

          {/* Database Indicator */}
          <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#27211d] border border-[#3f342d] text-xs text-[#a69a8f]">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] text-emerald-300/90 font-medium">MariaDB Dedicado Conectado</span>
          </div>

          {/* Pending Users Notification */}
          {pendingUsersCount > 0 && (
            <div
              className="relative p-2 rounded-xl bg-[#27211d] text-amber-400 border border-amber-900/50 cursor-pointer"
              title={`${pendingUsersCount} usuário(s) aguardando aprovação`}
            >
              <UserCheck className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-black text-[10px] font-bold flex items-center justify-center">
                {pendingUsersCount}
              </span>
            </div>
          )}

          {/* Botão Discreto de Manual do Usuário com Símbolo de Interrogação */}
          <button 
            onClick={() => setIsManualModalOpen(true)}
            className="p-2 rounded-xl bg-[#27211d] hover:bg-[#342b26] text-[#a69a8f] hover:text-[#f4efe8] border border-[#3f342d] transition-colors cursor-pointer group"
            title="Manual do Usuário & Guia Operacional"
            aria-label="Abrir manual do usuário"
          >
            <HelpCircle className="w-4 h-4 text-[#a69a8f] group-hover:text-[#c8a88a] transition-colors" />
          </button>

          {/* Sino de Notificações Posicionado no Lado ESQUERDO do Botão do Usuário */}
          <button 
            className="p-2 rounded-xl bg-[#27211d] hover:bg-[#342b26] text-[#a69a8f] hover:text-[#f4efe8] border border-[#3f342d] transition-colors cursor-pointer"
            title="Notificações e pendências clínicas"
          >
            <Bell className="w-4 h-4 text-[#c8a88a]" />
          </button>

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

      {/* Modal de Manual do Usuário com Janelas por Módulo e Regras de Permissão RBAC */}
      <UserManualModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        currentUser={activeUser}
      />
    </header>
  );
};
