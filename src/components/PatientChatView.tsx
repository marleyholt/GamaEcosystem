import React, { useState } from 'react';
import { Patient, ChatMessage, UserProfile } from '../types';
import { 
  MessageSquare, 
  Send, 
  Lock, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCheck, 
  Sparkles 
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
  const [activePatient, setActivePatient] = useState<Patient | null>(selectedPatient);
  const [inputText, setInputText] = useState('');

  if (!activePatient) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold font-serif text-[#f4efe8]">
            Chat por Paciente
          </h2>
          <p className="text-sm text-[#a69a8f] mt-1">
            Escolha qual paciente deseja acessar o canal de comunicação clínica
          </p>
        </div>

        <div className="space-y-3">
          {patients.map((patient) => (
            <div
              key={patient.id}
              className="p-5 rounded-2xl bg-[#221d1a] border border-[#3a312c] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#342b26] flex items-center justify-center text-[#c8a88a] font-bold">
                  {patient.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-[#f4efe8] text-base">{patient.name}</h3>
                  <p className="text-xs text-[#a69a8f]">
                    Diagnóstico: <span className="text-[#f4efe8]">{patient.diagnosis}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setActivePatient(patient);
                  onSelectPatient(patient);
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#c8a88a] hover:bg-[#d6bba0] text-[#181513] font-semibold text-sm transition-colors text-center"
              >
                Abrir Chat
              </button>
            </div>
          ))}
        </div>
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
    <div className="space-y-4 max-w-4xl mx-auto flex flex-col h-[78vh]">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-[#221d1a] border border-[#3a312c] p-4 rounded-2xl shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActivePatient(null)}
            className="p-1.5 rounded-lg text-[#a69a8f] hover:text-[#f4efe8] hover:bg-[#342b26]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="font-bold text-[#f4efe8] text-base leading-tight">
              Canal Clínico: {activePatient.name}
            </h3>
            <p className="text-[11px] text-[#a69a8f] flex items-center gap-1 mt-0.5">
              <Lock className="w-3 h-3 text-emerald-400" /> Criptografia de ponta a ponta ativa • LGPD auditada
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1c1815] border border-[#3f342d] text-xs text-[#c8a88a]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Fonoaudiologia & Cuidadores</span>
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
                  className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl text-sm leading-relaxed ${
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
            <p className="text-sm">Inicie uma conversa clínica segura sobre as refeições e evolução do paciente.</p>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => setInputText(p)}
            className="px-3 py-1.5 rounded-xl bg-[#221d1a] hover:bg-[#2c2420] text-[#a69a8f] hover:text-[#f4efe8] border border-[#3a312c] text-xs whitespace-nowrap transition-colors"
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
          className="p-3 bg-[#c8a88a] hover:bg-[#d6bba0] text-[#181513] rounded-xl font-bold transition-all shadow-md"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
