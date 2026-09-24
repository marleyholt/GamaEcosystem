import React from 'react';
import { Logo } from './Logo';
import { UserProfile } from '../types';
import { 
  Bell, 
  Moon, 
  Sun, 
  LogOut, 
  ShieldCheck, 
  Database, 
  UserCheck 
} from 'lucide-react';

export interface HeaderProps {
  user?: UserProfile;
  currentUser?: UserProfile;
  darkMode?: boolean;
  setDarkMode?: (val: boolean) => void;
  onLogout: () => void;
  onOpenUserModal?: () => void;
  patientsCount?: number;
  pendingUsersCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  currentUser: propCurrentUser,
  darkMode = true,
  setDarkMode,
  onLogout,
  onOpenUserModal,
  patientsCount,
  pendingUsersCount = 0
}) => {
  const activeUser = user || propCurrentUser || {
    id: 'user_fallback',
    name: 'Adriane Gama',
    email: 'adrianepaesdagama@gmail.com',
    role: 'fonoaudiologo' as const,
    approved: true,
    crfaNumber: 'CRFa 3-12894',
    createdAt: new Date().toISOString()
  };
  return (
    <header className="sticky top-0 z-40 bg-[#1c1815]/95 backdrop-blur-md border-b border-[#342b26] px-4 py-2.5 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Branding */}
        <Logo size="md" />

        {/* Right: User Status & Actions */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Security & LGPD Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#27211d] border border-[#3f342d] text-xs text-[#c8a88a]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-[11px]">LGPD & Criptografia Ativa</span>
          </div>

          {/* Cloud Database Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#27211d] border border-[#3f342d] text-xs text-[#a69a8f]">
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px]">Firebase / OCI MariaDB Ready</span>
          </div>

          {/* User Badge */}
          <button
            onClick={onOpenUserModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#27211d] hover:bg-[#342b26] border border-[#3f342d] transition-all text-left"
            title="Alterar perfil / Ver dados do usuário"
          >
            <div className="w-7 h-7 rounded-full bg-[#c8a88a] text-[#181513] font-bold flex items-center justify-center text-xs">
              {activeUser.name.charAt(0)}
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-xs font-semibold text-[#f4efe8] leading-tight">
                {activeUser.name}
              </span>
              <span className="text-[10px] text-[#c8a88a] uppercase tracking-wider">
                {activeUser.role === 'fonoaudiologo' ? 'Fonoaudióloga' : activeUser.role}
              </span>
            </div>
          </button>

          {/* Pending Users Notification */}
          {pendingUsersCount > 0 && (
            <div
              className="relative p-2 rounded-lg bg-[#27211d] text-amber-400 border border-amber-900/50 cursor-pointer"
              title={`${pendingUsersCount} usuário(s) aguardando aprovação`}
            >
              <UserCheck className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-black text-[10px] font-bold flex items-center justify-center">
                {pendingUsersCount}
              </span>
            </div>
          )}

          {/* Notification Bell */}
          <button 
            className="p-2 rounded-lg bg-[#27211d] hover:bg-[#342b26] text-[#a69a8f] hover:text-[#f4efe8] border border-[#3f342d] transition-colors"
            title="Notificações clínicas"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={() => setDarkMode && setDarkMode(!darkMode)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#27211d] hover:bg-[#342b26] text-[#a69a8f] hover:text-[#c8a88a] border border-[#3f342d] transition-all cursor-pointer shadow-sm group"
            title={darkMode ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            aria-label={darkMode ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
          >
            {darkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
                <span className="text-[11px] font-medium hidden sm:inline text-[#c8a88a]">Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600 group-hover:-rotate-12 transition-transform" />
                <span className="text-[11px] font-medium hidden sm:inline text-[#1c1714]">Escuro</span>
              </>
            )}
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="p-2 rounded-lg bg-[#27211d] hover:bg-rose-950/40 text-[#a69a8f] hover:text-rose-400 border border-[#3f342d] transition-colors"
            title="Sair do sistema"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
