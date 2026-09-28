import React, { useState } from 'react';
import { Logo } from './Logo';
import { UserProfile } from '../types';
import { FirstAccessAuth } from './FirstAccessAuth';
import { KeyRound, LogIn, Users } from 'lucide-react';
import { Caregiver, Therapist } from '../types/clinicConfig';

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
  const [activeMode, setActiveMode] = useState<'first_access' | 'quick_demo'>('first_access');

  // Mapeamento dos e-mails cadastrados de cuidadores e terapeutas
  const registeredCaregiverEmails = caregivers
    .filter(c => Boolean(c.email))
    .map(c => ({
      email: c.email.trim(),
      name: c.name,
      patientId: c.assignedPatientIds?.[0] || ''
    }));

  const registeredTherapistEmails = therapists
    .filter(t => Boolean(t.email))
    .map(t => ({
      email: (t.email || '').trim(),
      name: t.name,
      crfa: t.crfa
    }));

  return (
    <div className="min-h-screen bg-[#141110] flex flex-col items-center justify-center p-4">
      {/* Abas Superiores de Alternância de Acesso */}
      <div className="w-full max-w-md flex items-center justify-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => setActiveMode('first_access')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeMode === 'first_access'
              ? 'bg-[#c8a88a] text-[#181513] shadow-md'
              : 'bg-[#221d1a] text-[#a69a8f] border border-[#3a312c] hover:text-[#f4efe8]'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Primeiro Acesso & Login Seguro</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('quick_demo')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeMode === 'quick_demo'
              ? 'bg-[#c8a88a] text-[#181513] shadow-md'
              : 'bg-[#221d1a] text-[#a69a8f] border border-[#3a312c] hover:text-[#f4efe8]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Perfis de Demonstração</span>
        </button>
      </div>

      {activeMode === 'first_access' ? (
        <FirstAccessAuth
          onSuccessLogin={onLoginSuccess}
          registeredCaregiverEmails={registeredCaregiverEmails}
          registeredTherapistEmails={registeredTherapistEmails}
        />
      ) : (
        <div className="w-full max-w-md bg-[#221d1a] border border-[#3a312c] rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <Logo size="xl" showText={false} />
            <div>
              <h1 className="text-2xl font-bold font-serif text-[#f4efe8] tracking-tight">
                GamaEcosystem - Health Deglut
              </h1>
              <p className="text-xs text-[#a69a8f] mt-1">
                Acesse instantaneamente com um dos perfis pré-configurados do sistema:
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {availableUsers.map(user => (
              <button
                key={user.id}
                type="button"
                onClick={() => onLoginSuccess(user)}
                className="w-full p-3.5 rounded-2xl bg-[#181513] hover:bg-[#2c2420] border border-[#3a312c] hover:border-[#c8a88a] text-left transition-all flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <span className="text-xs font-bold text-[#f4efe8] group-hover:text-[#c8a88a] transition-colors block">
                    {user.name}
                  </span>
                  <span className="text-[11px] text-[#a69a8f] block mt-0.5">
                    {user.email} • <span className="capitalize font-semibold text-[#c8a88a]">{user.role}</span>
                  </span>
                </div>
                <LogIn className="w-4 h-4 text-[#88786d] group-hover:text-[#c8a88a] transition-colors" />
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-[#342b26] text-center">
            <button
              type="button"
              onClick={() => setActiveMode('first_access')}
              className="text-xs text-[#c8a88a] hover:underline cursor-pointer"
            >
              Ou use seu e-mail cadastrado para criar sua senha pessoal forte
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
