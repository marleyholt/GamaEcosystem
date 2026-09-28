import React, { useState } from 'react';
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
  Stethoscope,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Settings,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import { Logo } from './Logo';

export type NavTab = NavigationTab;

interface NavSubItem {
  id: NavigationTab;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavGroupItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: NavSubItem[];
  directTab?: NavigationTab;
  badge?: string;
}

interface NavigationProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isAdmin?: boolean;
  userRole?: UserRole;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  isAdmin,
  userRole = 'fonoaudiologo',
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const showAdmin = isAdmin !== undefined ? isAdmin : (userRole === 'admin' || userRole === 'fonoaudiologo');

  // Controle de submenus abertos/fechados via sanfona
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    clinico: true,
    gestao: true,
    sistema: false
  });

  const toggleGroup = (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const navStructure: NavGroupItem[] = [
    {
      id: 'resumo',
      label: 'Visão Geral',
      icon: LayoutDashboard,
      directTab: 'resumo'
    },
    {
      id: 'clinico',
      label: 'Atendimento Clínico',
      icon: Stethoscope,
      subItems: [
        { id: 'prontuario', label: 'Prontuário (PEP)', icon: Stethoscope },
        { id: 'radi', label: 'Avaliação RaDI', icon: Activity },
        { id: 'registro', label: 'Registro Diário', icon: Utensils },
        { id: 'historico', label: 'Histórico & Evolução', icon: Clock },
        { id: 'chat', label: 'Comunicação / Chat', icon: MessageSquare }
      ]
    },
    {
      id: 'gestao',
      label: 'Pacientes & Laudos',
      icon: Users,
      subItems: [
        { id: 'pacientes', label: 'Fichas Cadastrais', icon: Users },
        { id: 'relatorios', label: 'Relatórios & Laudos', icon: FileText }
      ]
    },
    {
      id: 'sistema',
      label: 'Sistema & Segurança',
      icon: Settings,
      subItems: [
        { id: 'seguranca', label: 'LGPD & Criptografia', icon: ShieldCheck },
        ...(showAdmin ? [{ id: 'admin' as NavigationTab, label: 'Aprovações / Equipe', icon: UserCog }] : []),
        { id: 'configuracao' as NavigationTab, label: 'Configurações', icon: Settings, badge: 'Em breve' }
      ]
    }
  ];

  const isTabActive = (tabId?: NavigationTab) => {
    if (!tabId) return false;
    return (
      currentTab === tabId ||
      (tabId === 'resumo' && currentTab === 'dashboard') ||
      (tabId === 'prontuario' && currentTab === 'medical_records') ||
      (tabId === 'registro' && currentTab === 'feeding_log') ||
      (tabId === 'historico' && currentTab === 'history') ||
      (tabId === 'pacientes' && currentTab === 'patients') ||
      (tabId === 'relatorios' && currentTab === 'reports') ||
      (tabId === 'seguranca' && currentTab === 'security') ||
      (tabId === 'admin' && currentTab === 'admin_users') ||
      (tabId === 'configuracao' && currentTab === 'settings')
    );
  };

  const isGroupActive = (group: NavGroupItem) => {
    if (group.directTab) return isTabActive(group.directTab);
    return group.subItems?.some(sub => isTabActive(sub.id)) ?? false;
  };

  const handleItemClick = (tabId: NavigationTab) => {
    onSelectTab(tabId);
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#1c1815] border-r border-[#342b26] transition-all duration-300 ease-in-out select-none shadow-xl ${
          isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Sidebar Header with Sandwich Toggle */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#342b26] bg-[#221d1a]/60">
          <div className={`flex items-center gap-2.5 overflow-hidden transition-all duration-200 ${isCollapsed ? 'lg:hidden' : 'block'}`}>
            <Logo size="sm" />
          </div>

          {/* Toggle Sandwich Button (Desktop Collapse & Mobile Close) */}
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex items-center justify-center p-2 rounded-xl text-[#a69a8f] hover:text-[#f4efe8] hover:bg-[#2b2420] border border-[#3e342e] transition-colors"
              title={isCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
              aria-label={isCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
            >
              <Menu className="w-5 h-5 text-[#c8a88a]" />
            </button>

            <button
              onClick={onCloseMobile}
              className="flex lg:hidden p-2 rounded-xl text-[#a69a8f] hover:text-[#f4efe8] hover:bg-[#2b2420] border border-[#3e342e] transition-colors"
              title="Fechar menu"
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin scrollbar-thumb-[#3a312c]">
          {navStructure.map(group => {
            const Icon = group.icon;
            const groupActive = isGroupActive(group);
            const hasSubmenu = Boolean(group.subItems && group.subItems.length > 0);
            const isExpanded = openGroups[group.id];

            // Item Direto (Sem subitens, ex: Resumo)
            if (!hasSubmenu && group.directTab) {
              const active = isTabActive(group.directTab);
              return (
                <button
                  key={group.id}
                  onClick={() => handleItemClick(group.directTab!)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                    active
                      ? 'bg-[#c8a88a] text-[#181513] shadow-md font-semibold'
                      : 'text-[#d8cec4] hover:text-[#f4efe8] hover:bg-[#27211d]'
                  } ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}`}
                  title={isCollapsed ? group.label : undefined}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-[#181513]' : 'text-[#c8a88a] group-hover:scale-105 transition-transform'}`} />
                  <span className={`truncate text-left ${isCollapsed ? 'lg:hidden' : 'block'}`}>
                    {group.label}
                  </span>
                </button>
              );
            }

            // Grupo com Subitens (Sanfona com Botãozinho de Seta)
            return (
              <div key={group.id} className="space-y-1">
                {/* Cabeçalho do Grupo */}
                <div
                  onClick={(e) => toggleGroup(group.id, e)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                    groupActive 
                      ? 'bg-[#27211d] text-[#f4efe8] border border-[#3e342e]' 
                      : 'text-[#a69a8f] hover:text-[#f4efe8] hover:bg-[#241f1c]'
                  } ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}`}
                  title={isCollapsed ? group.label : undefined}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className={`w-5 h-5 shrink-0 ${groupActive ? 'text-[#c8a88a]' : 'text-[#8a7b70]'}`} />
                    <span className={`truncate text-left ${isCollapsed ? 'lg:hidden' : 'block'}`}>
                      {group.label}
                    </span>
                  </div>

                  {/* Botãozinho de seta para abrir/fechar submenu */}
                  <div className={`${isCollapsed ? 'lg:hidden' : 'flex'} items-center text-[#a69a8f] pl-1`}>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-[#c8a88a] transition-transform duration-200" />
                    ) : (
                      <ChevronRight className="w-4 h-4 hover:text-[#f4efe8] transition-transform duration-200" />
                    )}
                  </div>
                </div>

                {/* Subitens renderizados (quando aberto e não-colapsado) */}
                {isExpanded && !isCollapsed && (
                  <div className="pl-5 pr-1 space-y-1 pt-0.5 pb-1 border-l-2 border-[#342b26] ml-4 transition-all">
                    {group.subItems?.map(sub => {
                      const SubIcon = sub.icon || ClipboardList;
                      const active = isTabActive(sub.id);
                      return (
                        <button
                          key={sub.id}
                          onClick={() => handleItemClick(sub.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
                            active
                              ? 'bg-[#c8a88a] text-[#181513] font-bold shadow-sm'
                              : 'text-[#a69a8f] hover:text-[#f4efe8] hover:bg-[#25201c]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <SubIcon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-[#181513]' : 'text-[#c8a88a]'}`} />
                            <span className="truncate">{sub.label}</span>
                          </div>
                          {sub.badge && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                              active ? 'bg-[#181513] text-[#c8a88a]' : 'bg-[#332a24] text-[#c8a88a]'
                            }`}>
                              {sub.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Popover flutuante para estado colapsado (Desktop) */}
                {isCollapsed && (
                  <div className="hidden lg:flex flex-col items-center py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3a312c]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer info */}
        <div className="p-3 border-t border-[#342b26] bg-[#1a1614] text-[11px] text-[#8a7b70]">
          {!isCollapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[#a69a8f] font-mono text-[10px]">v1.4 • OCI Ready</span>
              </div>
              <span className="text-[10px] text-[#c8a88a] font-semibold">TFS/Gama</span>
            </div>
          ) : (
            <div className="flex justify-center" title="v1.4 OCI Cloud Ready">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
