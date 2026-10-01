import React, { useState } from 'react';
import { UserProfile } from '../types';
import { 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  LogOut, 
  ShieldCheck, 
  User, 
  Mail, 
  Award,
  ChevronRight,
  Settings,
  Sun,
  Moon,
  Edit3,
  UserCheck
} from 'lucide-react';

interface UserProfileModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onUpdateUser?: (updated: UserProfile) => void;
  darkMode?: boolean;
  setDarkMode?: (val: boolean) => void;
  onOpenSettings?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onLogout,
  onUpdateUser,
  darkMode = true,
  setDarkMode,
  onOpenSettings
}) => {
    const [isEditingName, setIsEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(user.name);
  const [nameError, setNameError] = useState('');
  const [nameSuccess, setNameSuccess] = useState(false);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  if (!isOpen) return null;

    const handleSaveDisplayName = (e: React.FormEvent) => {
    e.preventDefault();
    setNameError('');
    setNameSuccess(false);

    if (!displayName || displayName.trim().length < 3) {
      setNameError('O nome deve conter ao menos 3 caracteres.');
      return;
    }

    try {
      const cleanName = displayName.trim();
      const savedUsers = localStorage.getItem('health_deglut_users_list');
      if (savedUsers) {
        const usersList: UserProfile[] = JSON.parse(savedUsers);
        const updatedList = usersList.map(u => 
          u.id === user.id ? { ...u, name: cleanName } : u
        );
        localStorage.setItem('health_deglut_users_list', JSON.stringify(updatedList));
      }

      const updatedUser = { ...user, name: cleanName };
      localStorage.setItem('health_deglut_user', JSON.stringify(updatedUser));
      if (onUpdateUser) {
        onUpdateUser(updatedUser);
      }

      setNameSuccess(true);
      setTimeout(() => {
        setIsEditingName(false);
        setNameSuccess(false);
      }, 1500);
    } catch {
      setNameError('Erro ao atualizar o nome de exibição.');
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    // Validação da Senha Atual
    if (!currentPassword || currentPassword.trim() === '') {
      setPasswordError('Por favor, informe a sua senha atual.');
      return;
    }

    // Se o usuário já tiver uma senha cadastrada no perfil ou no localStorage, confere
    if (user.password && user.password !== currentPassword) {
      setPasswordError('A senha atual informada está incorreta.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordError('A nova senha deve ser diferente da senha atual.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('A confirmação não coincide com a nova senha digitada.');
      return;
    }

    // Atualiza localmente e salva no storage
    try {
      const savedUsers = localStorage.getItem('health_deglut_users_list');
      if (savedUsers) {
        const usersList: UserProfile[] = JSON.parse(savedUsers);
        const updatedList = usersList.map(u => 
          u.id === user.id ? { ...u, password: newPassword } : u
        );
        localStorage.setItem('health_deglut_users_list', JSON.stringify(updatedList));
      }
      
      const updatedUser = { ...user, password: newPassword };
      localStorage.setItem('health_deglut_user', JSON.stringify(updatedUser));
      if (onUpdateUser) {
        onUpdateUser(updatedUser);
      }

      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setIsChangingPassword(false);
        setPasswordSuccess(false);
      }, 2000);
    } catch {
      setPasswordError('Erro ao atualizar a senha.');
    }
  };

  return (
    <>
      {/* Backdrop transparente/escuro */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200" 
      />

      {/* Pop-up Flutuante Estilo Google Profile */}
      <div className="fixed top-16 right-4 sm:right-8 z-50 w-84 sm:w-92 bg-[#1f1a17] border border-[#3e342e] rounded-2xl shadow-2xl p-5 text-[#f4efe8] animate-in zoom-in-95 duration-200 select-none">
        
        {/* Header do Card com Botão Fechar */}
        <div className="flex items-center justify-between border-b border-[#342b26] pb-3 mb-4">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#a69a8f] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Conta GamaEcosystem
          </span>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-[#a69a8f] hover:text-[#f4efe8] hover:bg-[#2b2420] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informações Centrais do Usuário */}
        <div className="flex flex-col items-center text-center space-y-2 pb-4 border-b border-[#342b26]">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#c8a88a] to-[#8d6948] text-[#181513] font-serif font-bold text-2xl flex items-center justify-center shadow-lg border-2 border-[#181513]">
              {user.name.charAt(0)}
            </div>
            <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#1f1a17]" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#f4efe8]">{user.name}</h3>
            <p className="text-xs text-[#a69a8f] font-sans flex items-center justify-center gap-1 mt-0.5">
              <Mail className="w-3 h-3 text-[#c8a88a]" />
              {user.email}
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#27211d] border border-[#382e27] text-[11px] text-[#c8a88a] font-medium">
            <Award className="w-3.5 h-3.5 text-[#c8a88a]" />
            <span>
              {user.role === 'admin' ? 'Administrador Geral' : user.role === 'fonoaudiologo' ? 'Fonoaudióloga RT' : user.role === 'cuidador' ? 'Cuidador Autorizado' : 'Profissional Clínico'}
            </span>
            {user.crfa && (
              <span className="text-[10px] text-[#8e8073]">• {user.crfa}</span>
            )}
          </div>
        </div>

        {/* Corpo: Alternância entre Visão Geral, Edição de Nome e Troca de Senha */}
        {isEditingName ? (
          <form onSubmit={handleSaveDisplayName} className="pt-4 space-y-3">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold text-[#c8a88a] flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" />
                Alterar Nome de Exibição
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsEditingName(false);
                  setDisplayName(user.name);
                  setNameError('');
                }}
                className="text-[10px] text-[#a69a8f] hover:text-[#f4efe8] underline cursor-pointer"
              >
                Voltar
              </button>
            </div>

            {nameError && (
              <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-900 text-rose-300 text-[11px]">
                {nameError}
              </div>
            )}

            {nameSuccess && (
              <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-900 text-emerald-300 text-[11px] flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Nome atualizado com sucesso!
              </div>
            )}

            <div>
              <label className="block text-[11px] text-[#a69a8f] mb-1 font-medium">Nome Completo / Exibição</label>
              <div className="relative">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3.5 py-2.5 pl-9 text-xs text-[#f4efe8] focus:border-[#c8a88a] outline-none"
                />
                <User className="w-4 h-4 text-[#8e8073] absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#c8a88a] hover:bg-[#d6bca3] text-[#181513] text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-2"
            >
              <Check className="w-3.5 h-3.5" />
              Salvar Novo Nome
            </button>
          </form>
        ) : !isChangingPassword ? (
          <div className="pt-4 space-y-2.5">
            {/* Botão de Alternar Modo Claro / Escuro */}
            {setDarkMode && (
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#27211d] hover:bg-[#342b26] border border-[#382e27] text-xs font-semibold text-[#f4efe8] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  {darkMode ? (
                    <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
                  ) : (
                    <Moon className="w-4 h-4 text-indigo-400 group-hover:-rotate-12 transition-transform" />
                  )}
                  <span>Tema da Interface</span>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${darkMode ? 'bg-[#382e27] text-amber-400' : 'bg-[#382e27] text-indigo-300'}`}>
                  {darkMode ? 'Modo Escuro' : 'Modo Claro'}
                </span>
              </button>
            )}

            {/* Botão de Acessar Configurações Gerais */}
            {onOpenSettings && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#27211d] hover:bg-[#342b26] border border-[#382e27] text-xs font-semibold text-[#f4efe8] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4 text-[#c8a88a] group-hover:rotate-45 transition-transform" />
                  <span>Configurações Gerais</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8e8073] group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}

            {/* Botão de Alterar Nome de Exibição */}
            <button
              onClick={() => {
                setDisplayName(user.name);
                setIsEditingName(true);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#27211d] hover:bg-[#342b26] border border-[#382e27] text-xs font-semibold text-[#f4efe8] transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <Edit3 className="w-4 h-4 text-[#c8a88a] group-hover:rotate-12 transition-transform" />
                <span>Alterar Nome de Exibição</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8e8073] group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Botão de Alterar Minha Senha */}
            <button
              onClick={() => setIsChangingPassword(true)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#27211d] hover:bg-[#342b26] border border-[#382e27] text-xs font-semibold text-[#f4efe8] transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-4 h-4 text-[#c8a88a] group-hover:rotate-12 transition-transform" />
                <span>Alterar Minha Senha</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8e8073] group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Botão de Logout */}
            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-950/70 border border-rose-900/50 text-xs font-bold text-rose-300 transition-all cursor-pointer shadow-sm mt-1"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair da Conta (Logout)</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleChangePassword} className="pt-4 space-y-3">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold text-[#c8a88a] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Segurança: Alterar Senha
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsChangingPassword(false);
                  setPasswordError('');
                }}
                className="text-[10px] text-[#a69a8f] hover:text-[#f4efe8] underline cursor-pointer"
              >
                Voltar
              </button>
            </div>

            {passwordError && (
              <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-900 text-rose-300 text-[11px]">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-900 text-emerald-300 text-[11px] flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Senha atualizada com sucesso!
              </div>
            )}

            {/* Campo 1: Senha Atual */}
            <div>
              <label className="block text-[11px] text-[#a69a8f] mb-1">Senha Atual *</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="Digite sua senha atual"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 pr-9 text-xs text-[#f4efe8] outline-none focus:border-[#c8a88a]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-2.5 top-2.5 text-[#8e8073] hover:text-[#f4efe8]"
                >
                  {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Campo 2: Nova Senha */}
            <div>
              <label className="block text-[11px] text-[#a69a8f] mb-1">Nova Senha *</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Mínimo de 6 caracteres"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 pr-9 text-xs text-[#f4efe8] outline-none focus:border-[#c8a88a]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2.5 top-2.5 text-[#8e8073] hover:text-[#f4efe8]"
                >
                  {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Campo 3: Confirmar Nova Senha */}
            <div>
              <label className="block text-[11px] text-[#a69a8f] mb-1">Confirmar Nova Senha *</label>
              <input
                type="password"
                placeholder="Repita exatamente a nova senha"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-[#181513] border border-[#3e342e] rounded-xl px-3 py-2 text-xs text-[#f4efe8] outline-none focus:border-[#c8a88a]"
                required
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsChangingPassword(false)}
                className="flex-1 py-2 rounded-xl bg-[#27211d] hover:bg-[#342b26] text-[#a69a8f] text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-[#c8a88a] hover:bg-[#d6bca3] text-[#181513] font-bold text-xs shadow-md"
              >
                Salvar Senha
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
};
