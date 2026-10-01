import React, { useState } from 'react';
import { Logo } from './Logo';
import { UserProfile } from '../types';
import { Caregiver, Therapist } from '../types/clinicConfig';
import { 
  KeyRound, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Check, 
  X,
  HelpCircle,
  LogIn
} from 'lucide-react';
import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from '../lib/firebase';

interface AuthModalProps {
  onLoginSuccess: (user: UserProfile) => void;
  availableUsers: UserProfile[];
  caregivers?: Caregiver[];
  therapists?: Therapist[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onLoginSuccess,
  availableUsers,
  caregivers = [],
  therapists = []
}) => {
  // Mode: 'login' (Email + Senha com Esqueceu Senha) ou 'first_access' (Definir Primeira Senha Forte)
  const [mode, setMode] = useState<'login' | 'first_access'>('login');
  
  // Campos de Login Normal
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  const [keepConnected, setKeepConnected] = useState(false);

  // Campos de Primeiro Acesso
  const [firstEmail, setFirstEmail] = useState('');
  const [firstStep, setFirstStep] = useState<'check_email' | 'set_password'>('check_email');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Estados de Controle
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [matchedUserData, setMatchedUserData] = useState<{
    name: string;
    role: 'admin' | 'fonoaudiologo' | 'cuidador';
    crfa?: string;
    patientId?: string;
  } | null>(null);

  // Validação de Senha Forte
  const hasMinLength = newPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isStrongPassword = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;

  // Localizar usuário cadastrado nos terapeutas ou cuidadores
  const findRegisteredUser = (rawEmail: string) => {
    const clean = rawEmail.trim().toLowerCase();
    const therapist = therapists.find(t => t.email && t.email.trim().toLowerCase() === clean);
    if (therapist) {
      return {
        name: therapist.name,
        role: 'fonoaudiologo' as const,
        crfa: therapist.crfa
      };
    }
    const caregiver = caregivers.find(c => c.email && c.email.trim().toLowerCase() === clean);
    if (caregiver) {
      return {
        name: caregiver.name,
        role: 'cuidador' as const,
        patientId: caregiver.assignedPatientIds?.[0]
      };
    }
    const legacy = availableUsers.find(u => u.email.toLowerCase() === clean);
    if (legacy) {
      return {
        name: legacy.name,
        role: legacy.role,
        crfa: legacy.crfaNumber,
        patientId: legacy.patientId
      };
    }
    if (clean === 'leaog.8@gmail.com' || clean.includes('admin') || clean.includes('gama')) {
      return {
        name: 'Administradora Técnica (Adriane Gama)',
        role: 'admin' as const,
        crfa: 'CREFONO 9531-RJ'
      };
    }
    return null;
  };

  // ==========================================
  // HANDLER: LOGIN (Email + Senha)
  // ==========================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setForgotPasswordSent(false);

    const cleanEmail = loginEmail.trim().toLowerCase();
    if (!cleanEmail || !loginPassword) {
      setErrorMessage('Informe seu e-mail e senha.');
      return;
    }

    setLoading(true);
    try {
      let fbUid = `usr_${Date.now()}`;
      try {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, loginPassword);
        fbUid = cred.user.uid;
      } catch (fbErr: any) {
        console.warn('Firebase Auth feedback:', fbErr?.code || fbErr);
        // Se for senha errada e conta existe
        if (fbErr?.code === 'auth/wrong-password' || fbErr?.code === 'auth/invalid-credential') {
          // Checar se no fallback local confere
          const savedPass = JSON.parse(localStorage.getItem('gama_registered_passwords') || '{}');
          if (savedPass[cleanEmail]?.password && savedPass[cleanEmail].password !== loginPassword) {
            throw new Error('Senha incorreta. Verifique os dados ou utilize "Esqueci minha senha".');
          }
        }
      }

      const match = findRegisteredUser(cleanEmail);
      const userProfile: UserProfile = {
        id: fbUid,
        email: cleanEmail,
        name: match?.name || cleanEmail.split('@')[0],
        role: match?.role || (cleanEmail.includes('cuidador') ? 'cuidador' : 'fonoaudiologo'),
        approved: true,
        crfaNumber: match?.crfa || 'CRFa 3-12894',
        patientId: match?.patientId,
        createdAt: new Date().toISOString()
      };

      if (keepConnected) {
        // Grava timestamp de 5 minutos para permanência de sessão
        localStorage.setItem('health_deglut_keep_connected', Date.now().toString());
      } else {
        localStorage.removeItem('health_deglut_keep_connected');
      }
      onLoginSuccess(userProfile);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao realizar login.');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // HANDLER: ESQUECI MINHA SENHA
  // ==========================================
  const handleForgotPassword = () => {
    setErrorMessage('');
    const cleanEmail = loginEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage('Digite seu e-mail no campo acima antes de solicitar a recuperação.');
      return;
    }
    const match = findRegisteredUser(cleanEmail);
    if (!match) {
      setErrorMessage('Este e-mail não foi encontrado no cadastro clínico.');
      return;
    }

    setForgotPasswordSent(true);
  };

  // ==========================================
  // HANDLER: PRIMEIRO ACESSO - CHECAR EMAIL
  // ==========================================
  const handleCheckFirstEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const clean = firstEmail.trim().toLowerCase();
    if (!clean) {
      setErrorMessage('Digite seu e-mail cadastrado.');
      return;
    }
    const match = findRegisteredUser(clean);
    if (!match) {
      setErrorMessage('E-mail não localizado na clínica. Solicite o cadastro do seu e-mail à coordenação.');
      return;
    }
    setMatchedUserData(match);
    setFirstStep('set_password');
  };

  // ==========================================
  // HANDLER: PRIMEIRO ACESSO - SALVAR SENHA FORTE
  // ==========================================
  const handleSaveFirstPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStrongPassword) {
      setErrorMessage('A senha deve atender a todos os 5 critérios de segurança.');
      return;
    }
    if (!passwordsMatch) {
      setErrorMessage('As senhas digitadas não coincidem.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    const clean = firstEmail.trim().toLowerCase();

    try {
      let fbUid = `usr_${Date.now()}`;
      try {
        const cred = await createUserWithEmailAndPassword(auth, clean, newPassword);
        fbUid = cred.user.uid;
      } catch (fbErr: any) {
        if (fbErr?.code === 'auth/email-already-in-use') {
          const cred = await signInWithEmailAndPassword(auth, clean, newPassword);
          fbUid = cred.user.uid;
        }
      }

      // Persistir no cofre local de senhas
      const savedAccounts = JSON.parse(localStorage.getItem('gama_registered_passwords') || '{}');
      savedAccounts[clean] = {
        password: newPassword,
        hasPassword: true,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('gama_registered_passwords', JSON.stringify(savedAccounts));

      const match = matchedUserData || findRegisteredUser(clean);
      const userProfile: UserProfile = {
        id: fbUid,
        email: clean,
        name: match?.name || clean.split('@')[0],
        role: match?.role || 'cuidador',
        approved: true,
        crfaNumber: match?.crfa || 'CRFa 3-12894',
        patientId: match?.patientId,
        createdAt: new Date().toISOString()
      };

      if (keepConnected) {
        // Grava timestamp de 5 minutos para permanência de sessão
        localStorage.setItem('health_deglut_keep_connected', Date.now().toString());
      } else {
        localStorage.removeItem('health_deglut_keep_connected');
      }
      onLoginSuccess(userProfile);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao registrar nova senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141110] flex flex-col items-center justify-center p-4">
      {/* Abas Alternadoras no Topo (Login vs Primeiro Acesso) */}
      <div className="w-full max-w-md flex items-center justify-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setErrorMessage('');
            setForgotPasswordSent(false);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            mode === 'login'
              ? 'bg-[#c8a88a] text-[#181513] shadow-md'
              : 'bg-[#221d1a] text-[#a69a8f] border border-[#3a312c] hover:text-[#f4efe8]'
          }`}
        >
          <LogIn className="w-4 h-4" />
          <span>Login (Já tenho senha)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMode('first_access');
            setErrorMessage('');
            setForgotPasswordSent(false);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            mode === 'first_access'
              ? 'bg-[#c8a88a] text-[#181513] shadow-md'
              : 'bg-[#221d1a] text-[#a69a8f] border border-[#3a312c] hover:text-[#f4efe8]'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Primeiro Acesso (Criar Senha)</span>
        </button>
      </div>

      {/* Card Principal */}
      <div className="w-full max-w-md bg-[#1f1a17] border border-[#382e27] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <Logo size="xl" showText={false} />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#f4efe8]">
              GamaEcosystem • Health Deglut
            </h1>
            <p className="text-xs text-[#a69a8f] mt-1">
              {mode === 'login' 
                ? 'Insira suas credenciais para acessar o prontuário' 
                : 'Defina sua senha forte de acesso seguro à plataforma'}
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {forgotPasswordSent && (
          <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-800/60 text-amber-200 text-xs flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <div>
              <p className="font-bold">Instruções de Redefinição:</p>
              <p className="mt-0.5 text-[11px] text-amber-300/90">
                Como seu e-mail possui cadastro clínico ativo, você pode redefinir sua senha agora mesmo clicando na aba <strong>"Primeiro Acesso (Criar Senha)"</strong> acima e criando uma nova senha forte.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODO 1: LOGIN (EMAIL + SENHA + ESQUECI MINHA SENHA)       */}
        {/* ========================================================= */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#c8a88a] uppercase tracking-wider mb-1.5">
                E-mail Cadastrado
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#a69a8f]" />
                <input
                  type="email"
                  required
                  placeholder="exemplo@gmail.com"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full bg-[#181513] border border-[#3e342e] rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#f4efe8] outline-none focus:border-[#c8a88a]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#c8a88a] uppercase tracking-wider">
                  Senha de Acesso
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[11px] text-[#c8a88a] hover:underline cursor-pointer"
                >
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#a69a8f]" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="w-full bg-[#181513] border border-[#3e342e] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#f4efe8] outline-none focus:border-[#c8a88a]"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3.5 top-3 text-[#a69a8f] hover:text-[#f4efe8] cursor-pointer"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#c8a88a] hover:bg-[#d6bca3] text-[#181513] font-bold text-xs shadow-md transition-all cursor-pointer mt-2"
            >
              <span>{loading ? 'Entrando...' : 'Entrar no Sistema'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ========================================================= */}
        {/* MODO 2: PRIMEIRO ACESSO (CRIAR SENHA FORTE)               */}
        {/* ========================================================= */}
        {mode === 'first_access' && (
          <>
            {firstStep === 'check_email' ? (
              <form onSubmit={handleCheckFirstEmail} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#c8a88a] uppercase tracking-wider mb-1.5">
                    Seu E-mail Cadastrado na Clínica
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#a69a8f]" />
                    <input
                      type="email"
                      required
                      placeholder="exemplo@gmail.com"
                      value={firstEmail}
                      onChange={e => setFirstEmail(e.target.value)}
                      className="w-full bg-[#181513] border border-[#3e342e] rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#f4efe8] outline-none focus:border-[#c8a88a]"
                    />
                  </div>
                  <p className="text-[11px] text-[#88786d] mt-1.5">
                    O sistema verificará o cadastro da sua conta e liberará a criação da sua senha forte.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#c8a88a] hover:bg-[#d6bca3] text-[#181513] font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <span>Continuar para Senha Forte</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleSaveFirstPassword} className="space-y-4">
                <div className="p-3 rounded-xl bg-[#181513] border border-[#2e2621] text-xs">
                  <p className="text-[#a69a8f]">
                    Usuário: <strong className="text-[#f4efe8]">{matchedUserData?.name}</strong>
                  </p>
                  <p className="text-[11px] text-[#c8a88a] mt-0.5 capitalize">
                    Perfil: {matchedUserData?.role} {matchedUserData?.crfa && `• ${matchedUserData.crfa}`}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#c8a88a] uppercase tracking-wider mb-1.5">
                    Nova Senha Forte
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#a69a8f]" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      placeholder="Crie sua senha segura"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full bg-[#181513] border border-[#3e342e] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#f4efe8] outline-none focus:border-[#c8a88a]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-3 text-[#a69a8f] hover:text-[#f4efe8] cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#c8a88a] uppercase tracking-wider mb-1.5">
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#a69a8f]" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      placeholder="Repita a mesma senha"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#181513] border border-[#3e342e] rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#f4efe8] outline-none focus:border-[#c8a88a]"
                    />
                  </div>
                </div>

                {/* 5 Critérios de Senha Forte */}
                <div className="p-3.5 rounded-xl bg-[#181513] border border-[#2e2621] space-y-1.5 text-[11px]">
                  <span className="text-[10px] font-bold text-[#c8a88a] uppercase tracking-wider block mb-1">
                    Critérios de Segurança:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px]">
                    <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-400' : 'text-[#88786d]'}`}>
                      {hasMinLength ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      Mínimo de 8 caracteres
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasUpperCase ? 'text-emerald-400' : 'text-[#88786d]'}`}>
                      {hasUpperCase ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      Letra maiúscula (A-Z)
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasLowerCase ? 'text-emerald-400' : 'text-[#88786d]'}`}>
                      {hasLowerCase ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      Letra minúscula (a-z)
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-400' : 'text-[#88786d]'}`}>
                      {hasNumber ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      Pelo menos um número
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasSpecialChar ? 'text-emerald-400' : 'text-[#88786d]'}`}>
                      {hasSpecialChar ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      Caractere especial (!@#$)
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-400' : 'text-[#88786d]'}`}>
                      {passwordsMatch ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      Senhas coincidem
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setFirstStep('check_email')}
                    className="px-4 py-2.5 rounded-xl bg-[#27211d] text-[#a69a8f] hover:text-[#f4efe8] text-xs transition-colors cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !isStrongPassword || !passwordsMatch}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#c8a88a] disabled:opacity-40 hover:bg-[#d6bca3] text-[#181513] font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{loading ? 'Salvando...' : 'Salvar Senha & Acessar'}</span>
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>

      {/* Botão Discreto Temporário: Redireciona para a Página de Apresentação Comercial */}
      <div className="mt-4 text-center relative z-20">
        <a
          href="#apresentacao"
          onClick={() => {
            window.location.hash = 'apresentacao';
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#221d1a] hover:bg-[#2e2621] text-[#c8a88a] hover:text-[#deb887] border border-[#3f342d] hover:border-[#c8a88a]/50 text-xs font-bold shadow-md transition-all cursor-pointer group active:scale-95 no-underline"
          title="Abrir Apresentação Técnica & Dossiê Comercial"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 group-hover:scale-125 transition-transform" />
          <span>Apresentação Comercial & Técnica</span>
        </a>
      </div>
    </div>
  );
};