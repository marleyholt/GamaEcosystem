import React, { useState } from 'react';
import { Patient, ChatMessage, UserProfile } from '../types';
import { 
  MessageSquare, 
  Send, 
  Lock, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCheck, 
  Sparkles,
  PhoneCall,
  AlertTriangle,
  Flame,
  UserCheck,
  Hospital,
  HeartPulse,
  X,
  ShieldAlert,
  Info
} from 'lucide-react';

interface PatientChatViewProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
  currentUser: UserProfile;
  messages: ChatMessage[];
  onSendMessage: (msg: ChatMessage) => void;
}

export const PatientChatView: React.FC<PatientChatViewProps> = ({
  patients,
  selectedPatient,
  onSelectPatient,
  currentUser,
  messages,
  onSendMessage,
}) => {
  // Blindagem de Acesso:
  // Administradores e Fonoaudiólogas Master (ou Adriane) têm acesso a todos os pacientes.
  // Fonoaudiólogas veem os pacientes que estão atribuídos a elas (ou todos se forem admin/master).
  // Cuidadores/Familiares veem EXCLUSIVAMENTE o paciente atribuído (caregiverId === currentUser.id ou currentUser.patientId === patient.id).
  const isMasterOrAdmin = 
    currentUser.role === 'admin' || 
    currentUser.email === 'adrianegama@gmail.com' ||
    currentUser.email === 'leaog.8@gmail.com';

  const allowedPatients = patients.filter((patient) => {
    if (isMasterOrAdmin) return true;
    if (currentUser.role === 'fonoaudiologo') {
      return !patient.fonoaudiologistId || patient.fonoaudiologistId === currentUser.id || isMasterOrAdmin;
    }
    if (currentUser.role === 'cuidador') {
      return (
        patient.caregiverId === currentUser.id ||
        currentUser.patientId === patient.id ||
        patient.guardianEmail?.toLowerCase() === currentUser.email?.toLowerCase()
      );
    }
    return false;
  });

  // Validação: se o selectedPatient inicial não for autorizado para este usuário, redefine para null
  const initialPatient = selectedPatient && allowedPatients.some(p => p.id === selectedPatient.id) 
    ? selectedPatient 
    : null;

  const [activePatient, setActivePatient] = useState<Patient | null>(initialPatient);
  const [inputText, setInputText] = useState('');
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  if (!activePatient) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold font-serif text-[#f4efe8] flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-[#c8a88a]" />
              Canal de Comunicação Clínica por Paciente
            </h2>
            <p className="text-sm text-[#a69a8f] mt-1">
              Ambiente seguro em conformidade com LGPD e sigilo de saúde. Apenas profissionais e cuidadores autorizados têm acesso.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#221d1a] border border-[#3a312c] text-xs text-[#c8a88a] self-start sm:self-auto">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Blindagem Ativa</span>
          </div>
        </div>

        {allowedPatients.length > 0 ? (
          <div className="space-y-3">
            {allowedPatients.map((patient) => (
              <div
                key={patient.id}
                className="p-5 rounded-2xl bg-[#221d1a] border border-[#3a312c] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#4d3f37] transition-all shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[#342b26] border border-[#44362d] flex items-center justify-center text-[#c8a88a] font-bold text-base shadow-xs">
                    {patient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#f4efe8] text-base">{patient.name}</h3>
                    <p className="text-xs text-[#a69a8f]">
                      Diagnóstico: <span className="text-[#f4efe8] font-medium">{patient.diagnosis}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#85796f] mt-1">
                      <span>Responsável: <strong className="text-[#a69a8f]">{patient.guardianName || 'Não informado'}</strong></span>
                      <span>•</span>
                      <span>Fono: <strong className="text-[#c8a88a]">{patient.fonoaudiologistName || 'Adriane Gama'}</strong></span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActivePatient(patient);
                    onSelectPatient(patient);
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#c8a88a] hover:bg-[#d6bba0] text-[#181513] font-bold text-xs transition-colors text-center cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Abrir Chat Seguro</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-[#221d1a] border border-dashed border-[#3a312c] text-center space-y-3">
            <ShieldAlert className="w-10 h-10 text-amber-400 mx-auto opacity-80" />
            <h3 className="text-base font-bold text-[#f4efe8]">Nenhum Paciente Vinculado ao seu Usuário</h3>
            <p className="text-xs text-[#a69a8f] max-w-md mx-auto">
              Seu perfil ({currentUser.role}) não possui vínculo direto com os pacientes cadastrados. Solicite à Fonoaudióloga Responsável o vínculo na Central de Configurações para liberar o acesso ao chat clínico.
            </p>
          </div>
        )}
      </div>
    );
  }

  const patientMessages = messages.filter(m => m.patientId === activePatient.id);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      patientId: activePatient.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      text: inputText.trim(),
      timestamp: new Date().toISOString(),
      encrypted: true
    };

    onSendMessage(newMsg);
    setInputText('');
  };

  const quickPrompts = [
    "Refeição concluída sem sinais de engasgo ou tosse.",
    "Apresentou leve fadiga durante a ingestão do almoço.",
    "Favor confirmar a quantidade de espessante para o suco.",
    "Manter postura ereta a 90° durante todas as alimentações."
  ];

  return (
    <div className="space-y-3 max-w-4xl mx-auto flex flex-col h-[78vh]">
      {/* Top Header com Botões de Emergência */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#221d1a] border border-[#3a312c] p-3.5 sm:p-4 rounded-2xl shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActivePatient(null)}
            className="p-2 rounded-xl text-[#a69a8f] hover:text-[#f4efe8] hover:bg-[#342b26] transition-colors cursor-pointer"
            title="Voltar à lista de pacientes autorizados"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[#f4efe8] text-base leading-tight font-serif">
                Canal Clínico: {activePatient.name}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 font-bold border border-emerald-800/40">
                Auditado LGPD
              </span>
            </div>
            <p className="text-[11px] text-[#a69a8f] flex items-center gap-1.5 mt-0.5">
              <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>Acesso restrito à Fonoaudióloga ({activePatient.fonoaudiologistName || 'Adriane Gama'}) e Responsáveis Autorizados</span>
            </p>
          </div>
        </div>

        {/* Botão de Destaque para Emergências */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setShowEmergencyModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-950/70 hover:bg-rose-900 text-rose-200 border border-rose-700/60 text-xs font-bold transition-all shadow-sm cursor-pointer animate-pulse"
          >
            <PhoneCall className="w-4 h-4 text-rose-400" />
            <span>Contatos de Emergência (SAMU 192)</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 bg-[#1a1614] border border-[#342b26] rounded-2xl p-4 sm:p-6 overflow-y-auto space-y-4">
        {patientMessages.length > 0 ? (
          patientMessages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-xs font-semibold text-[#f4efe8]">
                    {msg.senderName}
                  </span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#2a221d] text-[#c8a88a] uppercase font-bold border border-[#3f342d]">
                    {msg.senderRole}
                  </span>
                </div>

                <div
                  className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-xs ${
                    isMe
                      ? 'bg-[#c8a88a] text-[#181513] rounded-tr-none font-medium'
                      : 'bg-[#251f1c] text-[#f4efe8] border border-[#3a312c] rounded-tl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                  <div className={`flex items-center justify-end gap-1 mt-1.5 text-[10px] ${
                    isMe ? 'text-[#382b21]' : 'text-[#85796f]'
                  }`}>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-[#85796f] space-y-2 text-center p-6">
            <MessageSquare className="w-8 h-8 text-[#52443b]" />
            <p className="text-sm font-medium">Inicie uma conversa clínica segura sobre as refeições e evolução do paciente.</p>
            <p className="text-xs text-[#6e6157]">Todas as trocas são protegidas e registradas no prontuário de monitoramento.</p>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-thin">
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => setInputText(p)}
            className="px-3 py-1.5 rounded-xl bg-[#221d1a] hover:bg-[#2c2420] text-[#a69a8f] hover:text-[#f4efe8] border border-[#3a312c] text-xs whitespace-nowrap transition-colors cursor-pointer"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <form onSubmit={handleSend} className="flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Digite sua mensagem clínica protegida por LGPD..."
          className="flex-1 bg-[#221d1a] border border-[#3a312c] rounded-xl px-4 py-3 text-sm text-[#f4efe8] placeholder-[#6d635a] focus:outline-none focus:border-[#c8a88a]"
        />
        <button
          type="submit"
          className="p-3 bg-[#c8a88a] hover:bg-[#d6bba0] text-[#181513] rounded-xl font-bold transition-all shadow-md cursor-pointer"
          title="Enviar mensagem"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>

      {/* MODAL DE CONTATOS DE EMERGÊNCIA & PROCEDIMENTOS RÁPIDOS */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1f1a17] border border-rose-900/60 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in duration-200">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-950 via-[#221815] to-[#1f1a17] border-b border-rose-900/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#f4efe8] font-serif">
                    Contatos de Emergência & Ação Rápida
                  </h3>
                  <p className="text-xs text-rose-300">
                    Paciente: <strong className="text-white">{activePatient.name}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEmergencyModal(false)}
                className="p-1.5 rounded-xl bg-[#2a201d] text-[#a69a8f] hover:text-[#f4efe8] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Corpo do Modal com Botões de Discagem Rápida */}
            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 text-rose-200 flex items-start gap-2.5">
                <HeartPulse className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Em caso de engasgo com asfixia aguda (cianose, incapacidade de tossir ou respirar):</strong> Inicie manobra de Heimlich e acione o SAMU 192 imediatamente.
                </p>
              </div>

              {/* Botões de Ação Imediata (Telefones Públicos) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href="tel:192"
                  className="p-3.5 rounded-xl bg-rose-900/80 hover:bg-rose-800 text-white font-bold flex items-center justify-between border border-rose-600 shadow-md transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <PhoneCall className="w-5 h-5 text-white" />
                    <div className="text-left">
                      <span className="block text-sm">SAMU</span>
                      <span className="text-[10px] text-rose-200 font-normal">Emergências Médicas</span>
                    </div>
                  </div>
                  <span className="text-base font-mono font-bold bg-white/20 px-2 py-0.5 rounded">192</span>
                </a>

                <a
                  href="tel:193"
                  className="p-3.5 rounded-xl bg-[#2d221d] hover:bg-[#382b25] text-amber-300 font-bold flex items-center justify-between border border-amber-800/50 shadow-md transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <Flame className="w-5 h-5 text-amber-400" />
                    <div className="text-left">
                      <span className="block text-sm">Bombeiros</span>
                      <span className="text-[10px] text-[#a69a8f] font-normal">Resgate & Trauma</span>
                    </div>
                  </div>
                  <span className="text-base font-mono font-bold bg-[#1a1412] px-2 py-0.5 rounded text-white border border-[#44362d]">193</span>
                </a>
              </div>

              {/* Contatos Vinculados ao Paciente */}
              <div className="space-y-2 pt-2">
                <h4 className="text-[11px] font-bold text-[#c8a88a] uppercase tracking-wider">
                  Equipe & Responsáveis Cadastrados
                </h4>

                {/* Fonoaudióloga Responsável */}
                <div className="p-3 rounded-xl bg-[#181513] border border-[#342b26] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <UserCheck className="w-4 h-4 text-[#c8a88a]" />
                    <div>
                      <span className="font-bold text-[#f4efe8] block">
                        Fonoaudióloga ({activePatient.fonoaudiologistName || 'Adriane Gama'})
                      </span>
                      <span className="text-[10px] text-[#a69a8f]">Responsável Técnica da Reabilitação</span>
                    </div>
                  </div>
                  <a
                    href="tel:41999998888"
                    className="px-3 py-1.5 rounded-lg bg-[#c8a88a] hover:bg-[#d6bca3] text-[#181513] font-bold text-xs flex items-center gap-1 shadow-xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Ligar</span>
                  </a>
                </div>

                {/* Familiar / Cuidador Responsável */}
                <div className="p-3 rounded-xl bg-[#181513] border border-[#342b26] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Hospital className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-bold text-[#f4efe8] block">
                        {activePatient.guardianName || 'Familiar Cadastrado'}
                      </span>
                      <span className="text-[10px] text-[#a69a8f]">
                        {activePatient.guardianPhone || activePatient.phone || 'Telefone do prontuário'}
                      </span>
                    </div>
                  </div>
                  {(activePatient.guardianPhone || activePatient.phone) ? (
                    <a
                      href={`tel:${(activePatient.guardianPhone || activePatient.phone).replace(/\D/g, '')}`}
                      className="px-3 py-1.5 rounded-lg bg-[#2b221d] hover:bg-[#382c26] text-[#c8a88a] font-bold text-xs border border-[#44362d] flex items-center gap-1"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Ligar</span>
                    </a>
                  ) : (
                    <span className="text-[10px] text-[#6e6157]">Sem fone</span>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-[#181513] border-t border-[#342b26] flex justify-end">
              <button
                type="button"
                onClick={() => setShowEmergencyModal(false)}
                className="px-5 py-2 rounded-xl bg-[#27211d] hover:bg-[#342b26] text-[#a69a8f] font-semibold text-xs border border-[#3a312c] cursor-pointer"
              >
                Fechar Painel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

