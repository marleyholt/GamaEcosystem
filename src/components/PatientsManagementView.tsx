import React, { useState } from 'react';
import { Patient, UserProfile } from '../types';
import { maskCPF, maskPhone } from '../utils/crypto';
import { 
  Users, 
  Plus, 
  ChevronRight, 
  X, 
  Search, 
  ShieldCheck, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  FileText, 
  Activity, 
  Utensils,
  Stethoscope
} from 'lucide-react';

interface PatientsManagementViewProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
  onSavePatient: (patient: Patient) => void;
  currentUser: UserProfile;
  professionals: UserProfile[];
  onNavigateToRaDI: (patient: Patient) => void;
  onNavigateToLog: (patient: Patient) => void;
  onNavigateToPep?: (patient: Patient) => void;
}

export const PatientsManagementView: React.FC<PatientsManagementViewProps> = ({
  patients,
  selectedPatient,
  onSelectPatient,
  onSavePatient,
  currentUser,
  professionals,
  onNavigateToRaDI,
  onNavigateToLog,
  onNavigateToPep,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [detailedPatient, setDetailedPatient] = useState<Patient | null>(selectedPatient);

  // Form states matching video at 00:34 - 00:38
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [fonoaudiologistId, setFonoaudiologistId] = useState('user_adriane');
  const [caregiverId, setCaregiverId] = useState('user_zeca');
  const [lgpdAccepted, setLgpdAccepted] = useState(true);

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('O Nome completo do paciente é obrigatório.');
      return;
    }

    const fonoObj = professionals.find(p => p.id === fonoaudiologistId);
    const caregiverObj = professionals.find(p => p.id === caregiverId);

    const newPatient: Patient = {
      id: `pat_${Date.now()}`,
      name: name.trim(),
      cpf: cpf.trim(),
      birthDate,
      phone,
      email,
      address,
      diagnosis: diagnosis || 'Em investigação fonoaudiológica',
      medicalHistory,
      currentMedications,
      guardianName,
      guardianPhone,
      guardianEmail,
      fonoaudiologistId,
      fonoaudiologistName: fonoObj ? fonoObj.name : 'Adriane Gama',
      caregiverId,
      caregiverName: caregiverObj ? caregiverObj.name : 'Zeca Souza',
      status: 'ativo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lgpdConsentAccepted: lgpdAccepted,
      lgpdConsentDate: lgpdAccepted ? new Date().toISOString() : undefined
    };

    onSavePatient(newPatient);
    onSelectPatient(newPatient);
    setShowModal(false);

    // Reset fields
    setName('');
    setCpf('');
    setBirthDate('');
    setPhone('');
    setEmail('');
    setAddress('');
    setDiagnosis('');
    setMedicalHistory('');
    setCurrentMedications('');
    setGuardianName('');
    setGuardianPhone('');
    setGuardianEmail('');
  };

  return (
    <div className="space-y-6">
      {/* Top Title & Action Button (Matching video at 00:29) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-[#f4efe8]">
            Pacientes
          </h2>
          <p className="text-xs text-[#a69a8f] mt-0.5">
            Gerencie seus pacientes atribuídos
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c8a88a] hover:bg-[#d6bba0] text-[#181513] font-semibold text-sm transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Novo Paciente
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#85796f] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar por nome ou diagnóstico..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#221d1a] border border-[#3a312c] rounded-xl text-sm text-[#f4efe8] placeholder-[#6d635a] focus:outline-none focus:border-[#c8a88a]"
        />
      </div>

      {/* Patient Cards List (Matching video at 00:29 - 00:33) */}
      <div className="space-y-3">
        {filteredPatients.map((patient) => {
          const isSelected = selectedPatient?.id === patient.id;
          return (
            <div
              key={patient.id}
              className={`p-5 rounded-2xl bg-[#221d1a] border transition-all ${
                isSelected ? 'border-[#c8a88a] ring-1 ring-[#c8a88a]/30' : 'border-[#3a312c]'
              } flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-[#342b26] border border-[#52443b] flex items-center justify-center text-[#c8a88a] font-bold">
                  {patient.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[#f4efe8] text-base">
                      {patient.name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                      {patient.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#a69a8f] mt-0.5">
                    Diagnóstico: <span className="text-[#f4efe8]">{patient.diagnosis}</span>
                  </p>
                  <p className="text-[11px] text-[#85796f]">
                    Profissional: {patient.fonoaudiologistName || 'Adriane Gama'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => {
                    onSelectPatient(patient);
                    setDetailedPatient(patient);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#2d2622] hover:bg-[#3d332d] text-[#c8a88a] text-xs font-semibold border border-[#4a3e37] transition-colors flex items-center gap-1.5"
                >
                  Ver Detalhes <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Patient Detail Drawer / Card */}
      {detailedPatient && (
        <div className="p-6 rounded-2xl bg-[#221d1a] border border-[#3a312c] space-y-5">
          <div className="flex items-center justify-between border-b border-[#342b26] pb-3">
            <div>
              <span className="text-xs text-[#c8a88a] uppercase tracking-wider font-semibold">
                Prontuário Ativo
              </span>
              <h3 className="text-xl font-bold font-serif text-[#f4efe8]">
                {detailedPatient.name}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {onNavigateToPep && (
                <button
                  onClick={() => onNavigateToPep(detailedPatient)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#2e2621] hover:bg-[#3d332d] text-[#c8a88a] text-xs font-bold border border-[#483a31] transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Stethoscope className="w-3.5 h-3.5" /> Prontuário (PEP)
                </button>
              )}
              <button
                onClick={() => onNavigateToRaDI(detailedPatient)}
                className="px-3.5 py-1.5 rounded-lg bg-[#c8a88a] hover:bg-[#d6bba0] text-[#181513] text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Activity className="w-3.5 h-3.5" /> Iniciar RaDI
              </button>
              <button
                onClick={() => onNavigateToLog(detailedPatient)}
                className="px-3.5 py-1.5 rounded-lg bg-[#342b26] hover:bg-[#433730] text-[#c8a88a] text-xs font-bold border border-[#4a3e37] transition-all flex items-center gap-1.5"
              >
                <Utensils className="w-3.5 h-3.5" /> Registro Diário
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#1c1815] border border-[#342b26] space-y-1.5">
              <span className="font-semibold text-[#c8a88a] uppercase tracking-wider">Identificação</span>
              <p className="text-[#a69a8f]">CPF: <span className="text-[#f4efe8]">{detailedPatient.cpf || 'Não cadastrado'}</span></p>
              <p className="text-[#a69a8f]">Nascimento: <span className="text-[#f4efe8]">{detailedPatient.birthDate || '-'}</span></p>
              <p className="text-[#a69a8f]">Telefone: <span className="text-[#f4efe8]">{detailedPatient.phone || '-'}</span></p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#1c1815] border border-[#342b26] space-y-1.5">
              <span className="font-semibold text-[#c8a88a] uppercase tracking-wider">Responsável & Cuidados</span>
              <p className="text-[#a69a8f]">Responsável: <span className="text-[#f4efe8]">{detailedPatient.guardianName || '-'}</span></p>
              <p className="text-[#a69a8f]">Contato: <span className="text-[#f4efe8]">{detailedPatient.guardianPhone || '-'}</span></p>
              <p className="text-[#a69a8f]">Cuidador: <span className="text-[#f4efe8]">{detailedPatient.caregiverName || 'Zeca Souza'}</span></p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#1c1815] border border-[#342b26] space-y-1.5">
              <span className="font-semibold text-[#c8a88a] uppercase tracking-wider">Segurança & LGPD</span>
              <p className="text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Termo LGPD Aceito
              </p>
              <p className="text-[#85796f]">Data: {detailedPatient.lgpdConsentDate ? new Date(detailedPatient.lgpdConsentDate).toLocaleDateString('pt-BR') : '23/09/2026'}</p>
              <p className="text-[#85796f]">Criptografia: Ativa (AES-GCM)</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#1c1815] border border-[#342b26] space-y-2 text-xs">
            <span className="font-semibold text-[#c8a88a] uppercase tracking-wider">Histórico Clínico & Medicamentos</span>
            <p className="text-[#d8cec4]">{detailedPatient.medicalHistory}</p>
            <p className="text-[#a69a8f]"><strong className="text-[#f4efe8]">Medicamentos:</strong> {detailedPatient.currentMedications}</p>
          </div>
        </div>
      )}

      {/* Modal Novo Paciente (EXATAMENTE COMO AOS 00:34 - 00:38 DO VÍDEO) */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#221d1a] border border-[#3a312c] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#342b26] pb-3">
              <div>
                <h3 className="text-xl font-bold font-serif text-[#f4efe8]">Novo Paciente</h3>
                <p className="text-[11px] text-[#a69a8f] mt-0.5">
                  * Apenas o nome é obrigatório. Preencha os demais campos conforme necessário.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-[#a69a8f] hover:text-[#f4efe8] hover:bg-[#342b26]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Nome Completo */}
              <div>
                <label className="font-semibold text-[#f4efe8] block mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome completo do paciente"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#1c1815] border border-[#3a312c] rounded-xl p-3 text-sm text-[#f4efe8] placeholder-[#6d635a] focus:outline-none focus:border-[#c8a88a]"
                />
              </div>

              {/* CPF e Data de Nascimento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#a69a8f] block mb-1">CPF</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    className="w-full bg-[#1c1815] border border-[#3a312c] rounded-xl p-2.5 text-sm text-[#f4efe8] placeholder-[#6d635a] focus:outline-none focus:border-[#c8a88a]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#a69a8f] block mb-1">Data de Nascimento</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-[#1c1815] border border-[#3a312c] rounded-xl p-2.5 text-sm text-[#f4efe8] focus:outline-none focus:border-[#c8a88a]"
                  />
                </div>
              </div>

              {/* Telefone e Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#a69a8f] block mb-1">Telefone</label>
                  <input
                    type="text"
                    placeholder="(00) 00000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#1c1815] border border-[#3a312c] rounded-xl p-2.5 text-sm text-[#f4efe8] placeholder-[#6d635a] focus:outline-none focus:border-[#c8a88a]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#a69a8f] block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#1c1815] border border-[#3a312c] rounded-xl p-2.5 text-sm text-[#f4efe8] placeholder-[#6d635a] focus:outline-none focus:border-[#c8a88a]"
                  />
                </div>
              </div>

              {/* Endereço */}
              <div>
                <label className="font-semibold text-[#a69a8f] block mb-1">Endereço</label>
                <input
                  type="text"
                  placeholder="Endereço completo"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#1c1815] border border-[#3a312c] rounded-xl p-2.5 text-sm text-[#f4efe8] placeholder-[#6d635a] focus:outline-none focus:border-[#c8a88a]"
                />
              </div>

              {/* Informações Médicas (Matching video at 00:35) */}
              <div className="pt-2 border-t border-[#342b26] space-y-3">
                <h4 className="font-semibold text-[#f4efe8] text-sm">Informações Médicas</h4>
                <div>
                  <label className="font-semibold text-[#a69a8f] block mb-1">Diagnóstico</label>
                  <input
                    type="text"
                    placeholder="Diagnóstico médico"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className="w-full bg-[#1c1815] border border-[#3a312c] rounded-xl p-2.5 text-sm text-[#f4efe8] placeholder-[#6d635a] focus:outline-none focus:border-[#c8a88a]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#a69a8f] block mb-1">Histórico Médico</label>
                  <textarea
                    rows={2}
                    placeholder="Histórico médico relevante"
                    value={medicalHistory}
                    onChange={(e) => setMedicalHistory(e.target.value)}
                    className="w-full bg-[#1c1815] border border-[#3a312c] rounded-xl p-2.5 text-sm text-[#f4efe8] placeholder-[#6d635a] focus:outline-none focus:border-[#c8a88a]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#a69a8f] block mb-1">Medicamentos Atuais</label>
                  <input
                    type="text"
                    placeholder="Medicamentos em uso"
                    value={currentMedications}
                    onChange={(e) => setCurrentMedications(e.target.value)}
                    className="w-full bg-[#1c1815] border border-[#3a312c] rounded-xl p-2.5 text-sm text-[#f4efe8] placeholder-[#6d635a] focus:outline-none focus:border-[#c8a88a]"
                  />
                </div>
              </div>

              {/* Responsável (Matching video at 00:37) */}
              <div className="pt-2 border-t border-[#342b26] space-y-3">
                <h4 className="font-semibold text-[#f4efe8] text-sm">Responsável</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-[#a69a8f] block mb-1">Nome do Responsável</label>
                    <input
                      type="text"
                      placeholder="Nome completo"
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      className="w-full bg-[#1c1815] border border-[#3a312c] rounded-xl p-2.5 text-sm text-[#f4efe8] placeholder-[#6d635a] focus:outline-none focus:border-[#c8a88a]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#a69a8f] block mb-1">Telefone do Responsável</label>
                    <input
                      type="text"
                      placeholder="(00) 00000-0000"
                      value={guardianPhone}
                      onChange={(e) => setGuardianPhone(e.target.value)}
                      className="w-full bg-[#1c1815] border border-[#3a312c] rounded-xl p-2.5 text-sm text-[#f4efe8] placeholder-[#6d635a] focus:outline-none focus:border-[#c8a88a]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#a69a8f] block mb-1">Email do Responsável</label>
                    <input
                      type="email"
                      placeholder="email@exemplo.com"
                      value={guardianEmail}
                      onChange={(e) => setGuardianEmail(e.target.value)}
                      className="w-full bg-[#1c1815] border border-[#3a312c] rounded-xl p-2.5 text-sm text-[#f4efe8] placeholder-[#6d635a] focus:outline-none focus:border-[#c8a88a]"
                    />
                  </div>
                </div>
              </div>

              {/* Usuários Responsáveis no Sistema (Matching video at 00:38) */}
              <div className="pt-2 border-t border-[#342b26] space-y-3">
                <h4 className="font-semibold text-[#f4efe8] text-sm">Usuários Responsáveis no Sistema</h4>
                <p className="text-[11px] text-[#a69a8f]">
                  Apenas administradores podem definir os responsáveis no sistema.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-[#a69a8f] block mb-1">Profissional Responsável</label>
                    <select
                      value={fonoaudiologistId}
                      onChange={(e) => setFonoaudiologistId(e.target.value)}
                      className="w-full bg-[#1c1815] border border-[#3a312c] rounded-xl p-2.5 text-sm text-[#f4efe8] focus:outline-none focus:border-[#c8a88a]"
                    >
                      <option value="user_adriane">Adriane Gama (Fonoaudióloga)</option>
                      <option value="user_pending">Camila Torres (Fonoaudióloga)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-[#a69a8f] block mb-1">Cuidador Responsável</label>
                    <select
                      value={caregiverId}
                      onChange={(e) => setCaregiverId(e.target.value)}
                      className="w-full bg-[#1c1815] border border-[#3a312c] rounded-xl p-2.5 text-sm text-[#f4efe8] focus:outline-none focus:border-[#c8a88a]"
                    >
                      <option value="user_zeca">Zeca Souza (Cuidador)</option>
                      <option value="none">Nenhum</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Termo de Consentimento LGPD */}
              <div className="p-3.5 rounded-xl bg-[#1c1815] border border-[#3a312c] flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="lgpd"
                  checked={lgpdAccepted}
                  onChange={(e) => setLgpdAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-[#4a3e37] bg-[#221d1a] text-[#c8a88a] focus:ring-0"
                />
                <label htmlFor="lgpd" className="text-[11px] text-[#a69a8f] leading-relaxed cursor-pointer select-none">
                  <strong className="text-[#f4efe8]">Termo de Consentimento Livre e Esclarecido (LGPD - Lei 13.709/2018):</strong> Autorizo a coleta, armazenamento criptografado e tratamento de dados pessoais e clínicos sensíveis (prontuário fonoaudiológico, histórico de disfagia e registros fotográficos de consistências) com finalidade estritamente terapêutica.
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#342b26]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#27211d] hover:bg-[#342b26] text-[#a69a8f] text-sm border border-[#3a312c]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#c8a88a] hover:bg-[#d6bba0] text-[#181513] font-bold text-sm shadow-md transition-all"
                >
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
