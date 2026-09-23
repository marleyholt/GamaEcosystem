import React from 'react';
import { UserProfile, UserRole } from '../types';
import { UserCheck, Check, X, Shield, Clock, AlertCircle } from 'lucide-react';

interface AdminUsersViewProps {
  users: UserProfile[];
  onApproveUser: (userId: string) => void;
  onRejectUser: (userId: string) => void;
  onChangeRole: (userId: string, role: UserRole) => void;
}

export const AdminUsersView: React.FC<AdminUsersViewProps> = ({
  users,
  onApproveUser,
  onRejectUser,
  onChangeRole,
}) => {
  const pendingUsers = users.filter(u => !u.approved);
  const activeUsers = users.filter(u => u.approved);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h2 className="text-2xl font-bold font-serif text-[#f4efe8]">
          Gerenciar Usuários
        </h2>
        <p className="text-xs text-[#a69a8f] mt-1">
          Controle de acesso baseado em papéis (RBAC) e aprovação de novos cadastros
        </p>
      </div>

      {/* Pending Approval Section (Matching video at 00:41) */}
      <div className="bg-[#221d1a] border border-[#3a312c] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#342b26] pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold font-serif text-[#f4efe8]">
              Usuários Pendentes de Aprovação
            </h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-950/60 text-amber-400 border border-amber-800/40">
            {pendingUsers.length} pendente(s)
          </span>
        </div>

        {pendingUsers.length > 0 ? (
          <div className="space-y-3">
            {pendingUsers.map((user) => (
              <div
                key={user.id}
                className="p-4 rounded-xl bg-[#27211d] border border-amber-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[#f4efe8] text-sm">{user.name}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#342b26] text-[#c8a88a] uppercase font-bold">
                      {user.role}
                    </span>
                  </div>
                  <p className="text-xs text-[#a69a8f] mt-0.5">{user.email}</p>
                  {user.crfaNumber && (
                    <p className="text-[11px] text-[#85796f]">Registro: {user.crfaNumber}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onApproveUser(user.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-4 h-4" /> Aprovar Acesso
                  </button>
                  <button
                    onClick={() => onRejectUser(user.id)}
                    className="px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold border border-rose-800/40 transition-colors flex items-center gap-1"
                  >
                    <X className="w-4 h-4" /> Recusar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-[#85796f] text-sm">
            Nenhum usuário pendente para aprovação no momento.
          </div>
        )}
      </div>

      {/* Active Users Section */}
      <div className="bg-[#221d1a] border border-[#3a312c] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#342b26] pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold font-serif text-[#f4efe8]">
              Usuários Ativos no Sistema
            </h3>
          </div>
          <span className="text-xs text-[#a69a8f]">
            {activeUsers.length} usuário(s) ativos
          </span>
        </div>

        <div className="space-y-3">
          {activeUsers.map((user) => (
            <div
              key={user.id}
              className="p-4 rounded-xl bg-[#1e1917] border border-[#342b26] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-[#f4efe8] text-sm">{user.name}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2c2420] text-[#c8a88a] uppercase font-bold border border-[#4a3e37]">
                    {user.role}
                  </span>
                </div>
                <p className="text-xs text-[#a69a8f] mt-0.5">{user.email}</p>
                {user.crfaNumber && (
                  <p className="text-[11px] text-[#85796f]">{user.crfaNumber}</p>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#a69a8f]">Papel:</span>
                <select
                  value={user.role}
                  onChange={(e) => onChangeRole(user.id, e.target.value as UserRole)}
                  className="bg-[#27211d] border border-[#3a312c] rounded-lg px-3 py-1.5 text-xs text-[#f4efe8] focus:outline-none focus:border-[#c8a88a]"
                >
                  <option value="fonoaudiologo">Fonoaudiólogo</option>
                  <option value="cuidador">Cuidador</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
