import React, { useState } from 'react';
import { UserProfile, UserRole, NavigationTab } from '../types';
import { 
  Users, 
  Shield, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  Settings, 
  Activity, 
  Utensils, 
  Clock, 
  MessageSquare, 
  FileText, 
  LayoutDashboard,
  Stethoscope,
  ShieldCheck,
  UserCog,
  Save,
  CheckCircle2
} from 'lucide-react';

interface AdminUsersViewProps {
  users: UserProfile[];
  onApproveUser: (userId: string) => void;
  onRejectUser: (userId: string) => void;
  onChangeRole: (userId: string, role: UserRole) => void;
  onUpdateUserPermissions?: (userId: string, allowedTabs: NavigationTab[]) => void;
}

// Catálogo de todas as Janelas / Modais disponíveis no Sistema
export const ALL_SYSTEM_MODULES: { id: NavigationTab; label: string; group: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'resumo', label: 'Visão Geral & Dashboard', group: 'Geral', icon: LayoutDashboard },
  { id: 'prontuario', label: 'Prontuário & Evoluções (4 Módulos)', group: 'Clínico', icon: Stethoscope },
  { id: 'radi', label: 'Avaliação RaDI & Deglutição', group: 'Clínico', icon: Activity },
  { id: 'registro', label: 'Registro Diário Alimentar', group: 'Clínico', icon: Utensils },
  { id: 'historico', label: 'Histórico & Linha do Tempo', group: 'Clínico', icon: Clock },
  { id: 'chat', label: 'Chat & Orientações', group: 'Comunicação', icon: MessageSquare },
  { id: 'pacientes', label: 'Fichas Cadastrais de Pacientes', group: 'Gestão', icon: Users },
  { id: 'relatorios', label: 'Laudos e Relatórios Oficiais', group: 'Gestão', icon: FileText },
  { id: 'seguranca', label: 'Segurança & LGPD', group: 'Sistema', icon: ShieldCheck },
  { id: 'configuracao', label: 'Central de Configurações', group: 'Sistema', icon: Settings }
];

export const AdminUsersView: React.FC<AdminUsersViewProps> = ({
  users,
  onApproveUser,
  onRejectUser,
  onChangeRole,
  onUpdateUserPermissions
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || '');
  const [userPermissions, setUserPermissions] = useState<Record<string, NavigationTab[]>>(() => {
    const initial: Record<string, NavigationTab[]> = {};
    users.forEach(u => {
      if (u.allowedTabs && u.allowedTabs.length > 0) {
        initial[u.id] = u.allowedTabs;
      } else {
        // Permissões padrão por papel
        if (u.role === 'admin') {
          initial[u.id] = ALL_SYSTEM_MODULES.map(m => m.id);
        } else if (u.role === 'fonoaudiologo') {
          initial[u.id] = ['resumo', 'prontuario', 'radi', 'registro', 'historico', 'chat', 'pacientes', 'relatorios', 'seguranca'];
        } else {
          // Cuidador / Familiar
          initial[u.id] = ['registro', 'chat', 'historico'];
        }
      }
    });
    return initial;
  });

  const [savedFeedback, setSavedFeedback] = useState(false);

  const selectedUser = users.find(u => u.id === selectedUserId) || users[0];

  // Identificação do Usuário MASTER (Adriane Gama): Acesso perpétuo e irrevogável
  const isSelectedUserMaster = Boolean(
    selectedUser && (
      selectedUser.role === 'admin' ||
      selectedUser.email.toLowerCase().includes('adriane') ||
      selectedUser.email.toLowerCase().includes('gamafono') ||
      selectedUser.email.toLowerCase().includes('leaog') ||
      selectedUser.name.toLowerCase().includes('adriane gama')
    )
  );

  // Alternar permissão de um módulo para o usuário selecionado
  const togglePermission = (tabId: NavigationTab) => {
    if (!selectedUser) return;
    if (isSelectedUserMaster) {
      alert('Adriane Gama é a Responsável Técnica e Usuária MASTER do sistema. Seu acesso a todas as janelas e configurações é perpétuo e irrevogável.');
      return;
    }
    const currentList = userPermissions[selectedUser.id] || [];
    const exists = currentList.includes(tabId);
    const updated = exists 
      ? currentList.filter(t => t !== tabId)
      : [...currentList, tabId];

    const newMap = {
      ...userPermissions,
      [selectedUser.id]: updated
    };
    setUserPermissions(newMap);

    if (onUpdateUserPermissions) {
      onUpdateUserPermissions(selectedUser.id, updated);
    }
  };

  // Marcar / Desmarcar todos os módulos
  const toggleAll = (enableAll: boolean) => {
    if (!selectedUser) return;
    if (isSelectedUserMaster && !enableAll) {
      alert('O usuário MASTER sempre possui acesso a 100% dos módulos do sistema.');
      return;
    }
    const updated = enableAll ? ALL_SYSTEM_MODULES.map(m => m.id) : [];
    setUserPermissions(prev => ({
      ...prev,
      [selectedUser.id]: updated
    }));
    if (onUpdateUserPermissions) {
      onUpdateUserPermissions(selectedUser.id, updated);
    }
  };

  const handleSave = () => {
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
  };

  const pendingUsers = users.filter(u => !u.approved);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#342b26]">
        <div>
          <h3 className="text-lg font-bold font-serif text-[#f4efe8] flex items-center gap-2">
            <UserCog className="w-5 h-5 text-[#c8a88a]" />
            Gestão de Usuários & Matriz de Acessos
          </h3>
          <p className="text-xs text-[#a69a8f]">
            Defina para cada profissional, cuidador ou administrador exatamente quais janelas e modais estarão visíveis no sistema.
          </p>
        </div>

        {savedFeedback && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Permissões sincronizadas!</span>
          </div>
        )}
      </div>

      {/* Seção de Usuários Pendentes */}
      {pendingUsers.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Novos Cadastros Aguardando Aprovação ({pendingUsers.length})
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pendingUsers.map(u => (
              <div key={u.id} className="p-3 rounded-xl bg-[#1c1815] border border-amber-900/40 flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-[#f4efe8]">{u.name}</p>
                  <p className="text-[11px] text-[#a69a8f]">{u.email} • {u.role}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onApproveUser(u.id)}
                    className="p-1.5 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800 hover:bg-emerald-900 transition-colors"
                    title="Aprovar Usuário"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onRejectUser(u.id)}
                    className="p-1.5 rounded-lg bg-rose-950/80 text-rose-400 border border-rose-800 hover:bg-rose-900 transition-colors"
                    title="Recusar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estrutura Principal: Seletor de Usuários + Tabela Matriz de Janelas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1: Lista de Usuários */}
        <div className="lg:col-span-1 bg-[#221d1a] border border-[#3a312c] rounded-2xl p-4 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#c8a88a] block pb-2 border-b border-[#342b26]">
            1. Selecione o Usuário ({users.length})
          </span>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
            {users.map(u => {
              const isSelected = u.id === selectedUserId;
              const permissionsCount = (userPermissions[u.id] || []).length;
              return (
                <button
                  key={u.id}
                  onClick={() => setSelectedUserId(u.id)}
                  className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#2c2420] border-[#c8a88a] shadow-sm'
                      : 'bg-[#181513] border-[#342b26] hover:border-[#4f4239]'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className={`text-xs font-bold truncate ${isSelected ? 'text-[#c8a88a]' : 'text-[#f4efe8]'}`}>
                      {u.name}
                    </p>
                    <p className="text-[11px] text-[#a69a8f] truncate">{u.email}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#141110] text-[#c8a88a] border border-[#3e342e] uppercase font-bold mt-1 inline-block">
                      {u.role}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-1 rounded-md bg-[#1f1a17] text-[#88786d] font-mono shrink-0">
                    {permissionsCount}/{ALL_SYSTEM_MODULES.length} telas
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Coluna 2 e 3: Tabela Matriz de Janelas / Modais */}
        <div className="lg:col-span-2 bg-[#221d1a] border border-[#3a312c] rounded-2xl p-5 sm:p-6 space-y-5">
          {selectedUser ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#342b26] gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#f4efe8]">{selectedUser.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2c2420] text-[#c8a88a] border border-[#443831] uppercase font-bold">
                      {selectedUser.role}
                    </span>
                    {isSelectedUserMaster && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/70 text-amber-300 border border-amber-700/50 uppercase font-bold">
                        Usuária MASTER • Acesso Total Permanente
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#a69a8f] mt-0.5">{selectedUser.email}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleAll(true)}
                    className="px-2.5 py-1 rounded-lg bg-[#27211d] hover:bg-[#342b26] text-[11px] text-[#c8a88a] border border-[#3e342e] transition-colors cursor-pointer"
                  >
                    Marcar Todas
                  </button>
                  {!isSelectedUserMaster && (
                    <button
                      type="button"
                      onClick={() => toggleAll(false)}
                      className="px-2.5 py-1 rounded-lg bg-[#27211d] hover:bg-[#342b26] text-[11px] text-[#a69a8f] border border-[#3e342e] transition-colors cursor-pointer"
                    >
                      Desmarcar Todas
                    </button>
                  )}
                </div>
              </div>

              {/* Tabela de Janelas com Botão de Marcação Visível / Oculto */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#342b26] text-[11px] text-[#c8a88a] uppercase tracking-wider font-semibold">
                      <th className="pb-3 px-2">Janela / Modal do Sistema</th>
                      <th className="pb-3 px-2">Grupo</th>
                      <th className="pb-3 px-2 text-center">Status de Acesso</th>
                      <th className="pb-3 px-2 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2e2621]">
                    {ALL_SYSTEM_MODULES.map((mod) => {
                      const isAllowed = (userPermissions[selectedUser.id] || []).includes(mod.id);
                      const Icon = mod.icon;
                      return (
                        <tr key={mod.id} className="hover:bg-[#27211d] transition-colors">
                          <td className="py-3 px-2 font-medium text-[#f4efe8]">
                            <div className="flex items-center gap-2.5">
                              <div className={`p-1.5 rounded-lg ${isAllowed ? 'bg-[#c8a88a]/20 text-[#c8a88a]' : 'bg-[#181513] text-[#6d635a]'}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <span>{mod.label}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-[#a69a8f] text-[11px]">
                            {mod.group}
                          </td>
                          <td className="py-3 px-2 text-center">
                            {isAllowed ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/70 text-emerald-400 border border-emerald-800/40">
                                <Eye className="w-3 h-3" /> Visível
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/60 text-rose-400 border border-rose-800/40">
                                <EyeOff className="w-3 h-3" /> Oculto
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-right">
                            {isSelectedUserMaster ? (
                              <span className="text-[11px] font-semibold text-amber-400/90 italic">
                                Irrevogável (Master)
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => togglePermission(mod.id)}
                                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                  isAllowed
                                    ? 'bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40'
                                    : 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/40'
                                }`}
                              >
                                {isAllowed ? 'Ocultar' : 'Permitir'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Botão de Salvar Configurações */}
              <div className="pt-3 border-t border-[#342b26] flex items-center justify-between">
                <span className="text-[11px] text-[#88786d]">
                  O usuário verá apenas as opções marcadas como <strong>Visível</strong> em seu menu.
                </span>

                <button
                  type="button"
                  onClick={handleSave}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c8a88a] hover:bg-[#d6bca3] text-[#181513] font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Permissões</span>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-xs text-[#a69a8f]">
              Selecione um usuário ao lado para configurar as janelas visíveis.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
