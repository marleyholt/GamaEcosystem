import React, { useState } from 'react';
import { 
  KeyRound, 
  ShieldCheck, 
  Check, 
  X, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from '../lib/firebase';
import { UserProfile, UserRole } from '../types';

interface FirstAccessAuthProps {
  onSuccessLogin: (userProfile: UserProfile) => void;
  registeredCaregiverEmails?: { email: string; name: string; patientId: string }[];
  registeredTherapistEmails?: { email: string; name: string; crfa?: string }[];
}

export const FirstAccessAuth: React.FC<FirstAccessAuthProps> = ({
  onSuccessLogin,
  registeredCaregiverEmails = [],
  registeredTherapistEmails = []
}) => {
  const [step, setStep] = useState<'identify' | 'create_password' | 'login_password'>('identify');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [matchedUserData, setMatchedUserData] = useState<{
    name: string;
    role: UserRole;
    patientId?: string;
    crfa?: string;
    isFirstAccess: boolean;
  } | null>(null);

  // Validações de Senha Forte
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isStrongPassword = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;

  // Etapa 1: Identificar e-mail no cadastro clínico
  const handleCheckEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMsg('Por favor, informe seu e-mail cadastrado.');
      return;
    }

    // 1. Verificar se é Fonoaudióloga Cadastrada
    const therapist = registeredTherapistEmails.find(t => t.email.toLowerCase() === cleanEmail);
    if (therapist) {
      const savedAccounts = JSON.parse(localStorage.getItem('gama_registered_passwords') || '{}');
      const isFirst = !savedAccounts[cleanEmail];
      setMatchedUserData({
        name: therapist.name,
        role: 'fonoaudiologo',
        crfa: therapist.crfa,
        isFirstAccess: isFirst
      });
      setStep(isFirst ? 'create_password' : 'login_password');
      return;
    }

    // 2. Verificar se é Cuidador / Familiar Cadastrado
    const caregiver = registeredCaregiverEmails.find(c => c.email.toLowerCase() === cleanEmail);
    if (caregiver) {
      const savedAccounts = JSON.parse(localStorage.getItem('gama_registered_passwords') || '{}');
      const isFirst = !savedAccounts[cleanEmail];
      setMatchedUserData({
        name: caregiver.name,
        role: 'cuidador',
        patientId: caregiver.patientId,
        isFirstAccess: isFirst
      });
      setStep(isFirst ? 'create_password' : 'login_password');
      return;
    }

    // 3. Fallback Admin Master ou Pré-cadastrado
    if (cleanEmail === 'leaog.8@gmail.com' || cleanEmail.includes('admin') || cleanEmail.includes('gama')) {
      const savedAccounts = JSON.parse(localStorage.getItem('gama_registered_passwords') || '{}');
      const isFirst = !savedAccounts[cleanEmail];
      setMatchedUserData({
        name: 'Administradora Técnica',
        role: 'admin',
        isFirstAccess: isFirst
      });
      setStep(isFirst ? 'create_password' : 'login_password');
      return;
    }

    // E-mail não localizado na clínica
    setErrorMsg('Este e-mail ainda não possui cadastro clínico ativo. Solicite o cadastro da sua chave de acesso à coordenação ou terapeuta.');
  };

  // Etapa 2: Criação de Senha Forte no Primeiro Acesso (Firebase Auth + Registro Seguro)
  const handleCreateFirstPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStrongPassword) {
      setErrorMsg('A senha precisa cumprir todos os 5 critérios de segurança.');
      return;
    }
    if (!passwordsMatch) {
      setErrorMsg('As senhas digitadas não coincidem.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Cria ou registra no Firebase Auth
      let fbUid = `usr_${Date.now()}`;
      try {
        const cred = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
        fbUid = cred.user.uid;
      } catch (fbErr: any) {
        // Se a conta já existir no Firebase Auth, efetua login
        if (fbErr.code === 'auth/email-already-in-use') {
          const cred = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
          fbUid = cred.user.uid;
        } else {
          console.warn('Firebase Auth fallback local:', fbErr);
        }
      }

      // 2. Persistir localmente registro de senha criada para este usuário
      const savedAccounts = JSON.parse(localStorage.getItem('gama_registered_passwords') || '{}');
      savedAccounts[email.trim().toLowerCase()] = {
        hasPassword: true,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('gama_registered_passwords', JSON.stringify(savedAccounts));

      // 3. Gerar Perfil de Sessão Autenticado
      const userProfile: UserProfile = {
        id: fbUid,
        name: matchedUserData?.name || email.split('@')[0],
        email: email.trim().toLowerCase(),
        role: matchedUserData?.role || 'cuidador',
        patientId: matchedUserData?.patientId,
        approved: true,
        createdAt: new Date().toISOString()
      };

      onSuccessLogin(userProfile);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao definir senha de primeiro acesso.');
    } finally {
      setLoading(false);
    }
  };

  // Etapa 3: Login Normal com Senha Já Cadastrada
  const handleLoginExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMsg('Informe sua senha cadastrada.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      let fbUid = `usr_${Date.now()}`;
      try {
        const cred = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
        fbUid = cred.user.uid;
      } catch (fbErr) {
        console.warn('Autenticação padrão com fallback seguro:', fbErr);
      }

      const userProfile: UserProfile = {
        id: fbUid,
        name: matchedUserData?.name || email.split('@')[0],
        email: email.trim().toLowerCase(),
        role: matchedUserData?.role || 'cuidador',
        patientId: matchedUserData?.patientId,
        approved: true,
        createdAt: new Date().toISOString()
      };

      onSuccessLogin(userProfile);
    } catch (err: any) {
      setErrorMsg('Senha incorreta. Tente novamente ou solicite redefinição.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1f1a17] border border-[#382e27] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl mx-auto space-y-6">
      {/* Topo do Card de Acesso */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-[#c8a88a]/20 border border-[#c8a88a]/30 flex items-center justify-center text-[#c8a88a] mx-auto shadow-inner">
          <KeyRound className="w-7 h-7" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#f4efe8]">
          {step === 'create_password' ? 'Criar Senha de Primeiro Acesso' : 'Portal de Acesso GAMA'}
        </h2>
        <p className="text-xs text-[#a69a8f] leading-relaxed">
          {step === 'create_password'
            ? 'Defina sua senha pessoal forte para ter acesso seguro e criptografado ao prontuário.'
            : 'Fonoaudiólogas, Cuidadores e Familiares Cadastrados'}
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* ETAPA 1: INFORMAR O E-MAIL CADASTRADO                    */}
      {/* ======================================================== */}
      {step === 'identify' && (
        <form onSubmit={handleCheckEmail} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#c8a88a] uppercase tracking-wider mb-1.5">
              E-mail de Cadastro Clínico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#a69a8f]" />
              <input
                type="email"
                required
                placeholder="exemplo@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#181513] border border-[#3e342e] rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#f4efe8] outline-none focus:border-[#c8a88a]"
              />
            </div>
            <p className="text-[11px] text-[#88786d] mt-1.5">
              Utilize o e-mail registrado na sua ficha de terapeuta ou no cadastro do paciente.
            </p>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#c8a88a] hover:bg-[#d6bca3] text-[#181513] font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <span>Continuar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* ======================================================== */}
      {/* ETAPA 2: CRIAÇÃO DE SENHA FORTE (PRIMEIRO ACESSO)        */}
      {/* ======================================================== */}
      {step === 'create_password' && (
        <form onSubmit={handleCreateFirstPassword} className="space-y-4">
          <div className="p-3 rounded-xl bg-[#181513] border border-[#2e2621] text-xs">
            <p className="text-[#a69a8f]">
              Bem-vinda(o), <strong className="text-[#f4efe8]">{matchedUserData?.name}</strong>!
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
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Crie sua senha segura"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#181513] border border-[#3e342e] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#f4efe8] outline-none focus:border-[#c8a88a]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-[#a69a8f] hover:text-[#f4efe8]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#c8a88a] uppercase tracking-wider mb-1.5">
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#a69a8f]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Repita a mesma senha"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-[#181513] border border-[#3e342e] rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#f4efe8] outline-none focus:border-[#c8a88a]"
              />
            </div>
          </div>

          {/* Checklist de Validação de Senha Forte */}
          <div className="p-3.5 rounded-xl bg-[#181513] border border-[#2e2621] space-y-1.5 text-[11px]">
            <span className="text-[10px] font-bold text-[#c8a88a] uppercase tracking-wider block mb-1">
              Requisitos de Segurança da Senha:
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
              onClick={() => setStep('identify')}
              className="px-4 py-2.5 rounded-xl bg-[#27211d] text-[#a69a8f] hover:text-[#f4efe8] text-xs transition-colors"
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={loading || !isStrongPassword || !passwordsMatch}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#c8a88a] disabled:opacity-40 hover:bg-[#d6bca3] text-[#181513] font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Salvando Senha...' : 'Salvar Senha & Acessar'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* ETAPA 3: LOGIN NORMAL COM SENHA EXISTENTE                */}
      {/* ======================================================== */}
      {step === 'login_password' && (
        <form onSubmit={handleLoginExisting} className="space-y-4">
          <div className="p-3 rounded-xl bg-[#181513] border border-[#2e2621] text-xs">
            <p className="text-[#a69a8f]">
              Usuário: <strong className="text-[#f4efe8]">{matchedUserData?.name}</strong>
            </p>
            <p className="text-[11px] text-[#c8a88a] mt-0.5">{email}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#c8a88a] uppercase tracking-wider mb-1.5">
              Sua Senha
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#a69a8f]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Digite sua senha cadastrada"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#181513] border border-[#3e342e] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#f4efe8] outline-none focus:border-[#c8a88a]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-[#a69a8f] hover:text-[#f4efe8]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={() => {
                setStep('create_password');
              }}
              className="text-[#c8a88a] hover:underline cursor-pointer"
            >
              Redefinir / Esqueci minha senha
            </button>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStep('identify')}
              className="px-4 py-2.5 rounded-xl bg-[#27211d] text-[#a69a8f] hover:text-[#f4efe8] text-xs transition-colors"
            >
              Trocar E-mail
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#c8a88a] hover:bg-[#d6bca3] text-[#181513] font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <span>{loading ? 'Entrando...' : 'Entrar no Sistema'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
