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
  X,
  Settings,
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
  allowedTabs?: NavigationTab[];
  isOpen: boolean;
  onClose: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  isAdmin,
  userRole = 'fonoaudiologo',
  allowedTabs,
  isOpen,
  onClose,
}) => {
  const showAdmin = isAdmin !== undefined ? isAdmin : (userRole === 'admin' || userRole === 'fonoaudiologo');

  // Estado que controla quais submenus estão abertos ou fechados
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    clinico: true,
    gestao: true,
    sistema: false
  });

  const toggleGroup = (groupId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Filtragem de tabs permitidas para o usuário conectado
  const isModuleAllowed = (tabId: NavigationTab) => {
    if (!allowedTabs || allowedTabs.length === 0) return true; // Se não configurado, exibe padrão
    return allowedTabs.includes(tabId);
  };

  const rawNavStructure: NavGroupItem[] = [
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
        { id: 'prontuario', label: 'Prontuário Eletrônico (PEP)', icon: Stethoscope },
        { id: 'radi', label: 'Avaliação RaDI', icon: Activity },
        { id: 'registro', label: 'Registro Diário Alimentar', icon: Utensils },
        { id: 'historico', label: 'Histórico & Evolução', icon: Clock },
        { id: 'chat', label: 'Chat & Orientações', icon: MessageSquare }
      ]
    },
    {
      id: 'gestao',
      label: 'Pacientes & Laudos',
      icon: Users,
      subItems: [
        { id: 'pacientes', label: 'Fichas Cadastrais', icon: Users },
        { id: 'relatorios', label: 'Laudos e Relatórios', icon: FileText }
      ]
    },
    {
      id: 'sistema',
      label: 'Sistema & Configurações',
      icon: Settings,
      subItems: [
        { id: 'configuracao' as NavigationTab, label: 'Central de Configurações', icon: Settings },
        { id: 'seguranca', label: 'Segurança & LGPD', icon: ShieldCheck }
      ]
    }
  ];

  // Aplica filtro de visibilidade configurado pelo administrador na matriz de telas
  const navStructure = rawNavStructure
    .map(group => {
      if (group.directTab) {
        return isModuleAllowed(group.directTab) ? group : null;
      }
      if (group.subItems) {
        const filteredSubs = group.subItems.filter(sub => isModuleAllowed(sub.id));
        if (filteredSubs.length === 0) return null;
        return {
          ...group,
          subItems: filteredSubs
        };
      }
      return group;
    })
    .filter((g): g is NavGroupItem => g !== null);

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

  const handleSelectTab = (tabId: NavigationTab) => {
    onSelectTab(tabId);
    onClose(); // Fecha o menu lateral após selecionar
  };

  return (
    <>
      {/* Backdrop transparente/escurecido que fecha o menu ao clicar fora */}
      <div 
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/75 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Drawer Lateral Retrátil (Totalmente oculto quando isOpen === false) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-80 max-w-[85vw] flex flex-col bg-[#1c1815] border-r border-[#342b26] shadow-2xl transition-transform duration-300 ease-out select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Cabeçalho do Menu Lateral */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#342b26] bg-[#221d1a]/80">
          <Logo size="sm" />

          {/* Botão de Fechar no topo do Drawer */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#a69a8f] hover:text-[#f4efe8] hover:bg-[#2b2420] border border-[#3e342e] transition-colors"
            title="Fechar menu lateral"
            aria-label="Fechar menu lateral"
          >
            <X className="w-5 h-5 text-[#c8a88a]" />
          </button>
        </div>

        {/* Lista de Itens e Submenus */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-2 scrollbar-thin scrollbar-thumb-[#3a312c]">
          {navStructure.map(group => {
            const Icon = group.icon;
            const groupActive = isGroupActive(group);
            const hasSubmenu = Boolean(group.subItems && group.subItems.length > 0);
            const isGroupOpen = !!openGroups[group.id];

            // Item Direto (Ex: Visão Geral)
            if (!hasSubmenu && group.directTab) {
              const active = isTabActive(group.directTab);
              return (
                <button
                  key={group.id}
                  onClick={() => handleSelectTab(group.directTab!)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                    active
                      ? 'bg-[#c8a88a] text-[#181513] shadow-md font-bold'
                      : 'text-[#d8cec4] hover:text-[#f4efe8] hover:bg-[#27211d]'
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-[#181513]' : 'text-[#c8a88a]'}`} />
                  <span className="truncate">{group.label}</span>
                </button>
              );
            }

            // Grupo com Submenu Sanfona
            return (
              <div key={group.id} className="rounded-xl border border-[#2e2621] bg-[#1e1916]/60 overflow-hidden">
                {/* Linha de Título do Grupo com Botão de Seta */}
                <div 
                  onClick={(e) => toggleGroup(group.id, e)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 text-xs font-semibold cursor-pointer transition-colors ${
                    groupActive 
                      ? 'text-[#f4efe8] bg-[#27211d]' 
                      : 'text-[#a69a8f] hover:text-[#f4efe8] hover:bg-[#25201c]'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${groupActive ? 'text-[#c8a88a]' : 'text-[#8a7b70]'}`} />
                    <span className="truncate tracking-wide uppercase font-bold text-[11px]">
                      {group.label}
                    </span>
                  </div>

                  {/* Botãozinho de Seta com clique garantido */}
                  <button
                    type="button"
                    onClick={(e) => toggleGroup(group.id, e)}
                    className="p-1 rounded-lg hover:bg-[#342b26] text-[#c8a88a] transition-transform duration-200"
                    title={isGroupOpen ? 'Recolher submenu' : 'Expandir submenu'}
                    aria-label={isGroupOpen ? 'Recolher submenu' : 'Expandir submenu'}
                  >
                    {isGroupOpen ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Subitens da Sanfona */}
                {isGroupOpen && group.subItems && (
                  <div className="px-2 py-1.5 space-y-1 bg-[#161311]/70 border-t border-[#2e2621]">
                    {group.subItems.map(sub => {
                      const SubIcon = sub.icon || ClipboardList;
                      const active = isTabActive(sub.id);
                      return (
                        <button
                          key={sub.id}
                          onClick={() => handleSelectTab(sub.id)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-all text-left ${
                            active
                              ? 'bg-[#c8a88a] text-[#181513] font-bold shadow-sm'
                              : 'text-[#c2b6ab] hover:text-[#f4efe8] hover:bg-[#25201c]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <SubIcon className={`w-4 h-4 shrink-0 ${active ? 'text-[#181513]' : 'text-[#c8a88a]'}`} />
                            <span className="truncate">{sub.label}</span>
                          </div>
                          {sub.badge && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-semibold uppercase tracking-wider ${
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
              </div>
            );
          })}
        </div>

        {/* Rodapé do Menu Lateral */}
        <div className="p-4 border-t border-[#342b26] bg-[#1a1614] text-xs text-[#8a7b70] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[#a69a8f] font-mono text-[11px]">GamaEcosystem • 7.72 / OCI</span>
          </div>
          <span className="text-[10px] text-[#c8a88a] font-semibold">LGPD Ativa</span>
        </div>
      </aside>
    </>
  );
};
