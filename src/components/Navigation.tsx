import React from 'react';
import { NavigationTab, UserRole } from '../types';
import { 
  LayoutDashboard, 
  Activity, 
  Utensils, 
  Clock, 
  MessageSquare, 
  Users, 
  FileText, 
  ShieldCheck, 
  UserCog,
  Stethoscope
} from 'lucide-react';

export type NavTab = NavigationTab;

interface NavigationProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isAdmin?: boolean;
  userRole?: UserRole;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  isAdmin,
  userRole = 'fonoaudiologo',
}) => {
  const showAdmin = isAdmin !== undefined ? isAdmin : (userRole === 'admin' || userRole === 'fonoaudiologo');

  const tabs: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'resumo', label: 'Resumo', icon: LayoutDashboard },
    { id: 'prontuario', label: 'Prontuário (PEP)', icon: Stethoscope },
    { id: 'radi', label: 'RaDI', icon: Activity },
    { id: 'registro', label: 'Registro', icon: Utensils },
    { id: 'historico', label: 'Histórico', icon: Clock },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'pacientes', label: 'Pacientes', icon: Users },
    { id: 'relatorios', label: 'Relatórios', icon: FileText },
    { id: 'seguranca', label: 'LGPD & BD', icon: ShieldCheck },
    ...(showAdmin ? [{ id: 'admin' as NavigationTab, label: 'Aprovações', icon: UserCog }] : []),
  ];

  return (
    <nav className="border-b border-[#342b26] bg-[#1a1614] overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto px-4 flex space-x-1 sm:space-x-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = 
            currentTab === tab.id ||
            (tab.id === 'resumo' && currentTab === 'dashboard') ||
            (tab.id === 'prontuario' && currentTab === 'medical_records') ||
            (tab.id === 'registro' && currentTab === 'feeding_log') ||
            (tab.id === 'historico' && currentTab === 'history') ||
            (tab.id === 'pacientes' && currentTab === 'patients') ||
            (tab.id === 'relatorios' && currentTab === 'reports') ||
            (tab.id === 'seguranca' && currentTab === 'security') ||
            (tab.id === 'admin' && currentTab === 'admin_users');

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#c8a88a] text-[#181513] shadow-sm font-semibold'
                  : 'text-[#a69a8f] hover:text-[#f4efe8] hover:bg-[#27211d]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#181513]' : 'text-[#c8a88a]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
