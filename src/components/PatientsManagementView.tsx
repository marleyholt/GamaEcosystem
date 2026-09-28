import React, { useState } from 'react';
import { Patient, UserProfile, Gender } from '../types';
import { maskCPF, maskPhone, formatCPF, formatCEP, formatPhone } from '../utils/crypto';
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
  Stethoscope,
  Printer,
  CheckCircle2,
  DollarSign
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
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);
  const [detailedPatient, setDetailedPatient] = useState<Patient | null>(selectedPatient);
  const [showPrintableFicha, setShowPrintableFicha] = useState(false);

  // Form states matching client's exact required fields
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<Gender>('Feminino');
  const [mainDiagnosis, setMainDiagnosis] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [receiptName, setReceiptName] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [cep, setCep] = useState('');
  const [phone, setPhone] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');

  // Additional clinical fields
  const [medicalHistory, setMedicalHistory] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [fonoaudiologistId, setFonoaudiologistId] = useState('user_adriane');
  const [caregiverId, setCaregiverId] = useState('user_zeca');
  const [lgpdAccepted, setLgpdAccepted] = useState(true);

  const openNewPatientModal = () => {
    setEditingPatientId(null);
    setName('');
    setBirthDate('');
    setGender('Feminino');
    setMainDiagnosis('');
    setGuardianName('');
    setReceiptName('');
    setCpf('');
    setEmail('');
    setAddress('');
    setCep('');
    setPhone('');
    setSecondaryPhone('');
    setMedicalHistory('');
    setCurrentMedications('');
    setGuardianPhone('');
    setGuardianEmail('');
    setShowModal(true);
  };

  const openEditPatientModal = (patient: Patient) => {
    setEditingPatientId(patient.id);
    setName(patient.name || '');
    setBirthDate(patient.birthDate || '');
    setGender(patient.gender || 'Feminino');
    setMainDiagnosis(patient.mainDiagnosis || patient.diagnosis || '');
    setGuardianName(patient.guardianName || '');
    setReceiptName(patient.receiptName || patient.guardianName || patient.name || '');
    setCpf(patient.cpf || '');
    setEmail(patient.email || '');
    setAddress(patient.address || '');
    setCep(patient.cep || '');
    setPhone(patient.phone || '');
    setSecondaryPhone(patient.secondaryPhone || '');
    setMedicalHistory(patient.medicalHistory || '');
    setCurrentMedications(patient.currentMedications || '');
    setGuardianPhone(patient.guardianPhone || '');
    setGuardianEmail(patient.guardianEmail || '');
    setFonoaudiologistId(patient.fonoaudiologistId || 'user_adriane');
    setCaregiverId(patient.caregiverId || 'user_zeca');
    setLgpdAccepted(patient.lgpdConsentAccepted ?? true);
    setShowModal(true);
  };

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.mainDiagnosis && p.mainDiagnosis.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.diagnosis && p.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.guardianName && p.guardianName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCep(formatCEP(e.target.value));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleSecondaryPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSecondaryPhone(formatPhone(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('O Nome completo do paciente é obrigatório.');
      return;
    }

    const fonoObj = professionals.find(p => p.id === fonoaudiologistId);
    const caregiverObj = professionals.find(p => p.id === caregiverId);

    const existingPatient = editingPatientId ? patients.find(p => p.id === editingPatientId) : null;

    const patientData: Patient = {
      id: existingPatient ? existingPatient.id : `pat_${Date.now()}`,
      name: name.trim(),
      birthDate,
      gender,
      mainDiagnosis: mainDiagnosis.trim() || 'Em investigação fonoaudiológica',
      diagnosis: mainDiagnosis.trim() || 'Em investigação fonoaudiológica',
      guardianName: guardianName.trim(),
      receiptName: receiptName.trim() || guardianName.trim() || name.trim(),
      cpf: cpf.trim(),
      email: email.trim(),
      address: address.trim(),
      cep: cep.trim(),
      phone: phone.trim(),
      secondaryPhone: secondaryPhone.trim(),
      medicalHistory,
      currentMedications,
      guardianPhone: guardianPhone || phone,
      guardianEmail: guardianEmail || email,
      fonoaudiologistId,
      fonoaudiologistName: fonoObj ? fonoObj.name : 'Adriane Gama',
      caregiverId,
      caregiverName: caregiverObj ? caregiverObj.name : 'Zeca Souza',
      status: existingPatient ? existingPatient.status : 'ativo',
      createdAt: existingPatient ? existingPatient.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lgpdConsentAccepted: lgpdAccepted,
      lgpdConsentDate: lgpdAccepted ? (existingPatient?.lgpdConsentDate || new Date().toISOString()) : undefined
    };

    onSavePatient(patientData);
    onSelectPatient(patientData);
    setDetailedPatient(patientData);
    setShowModal(false);
    setEditingPatientId(null);

    // Reset fields
    setName('');
    setBirthDate('');
    setGender('Feminino');
    setMainDiagnosis('');
    setGuardianName('');
    setReceiptName('');
    setCpf('');
    setEmail('');
    setAddress('');
    setCep('');
    setPhone('');
    setSecondaryPhone('');
    setMedicalHistory('');
    setCurrentMedications('');
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
          onClick={openNewPatientModal}
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
                  onClick={() => openEditPatientModal(patient)}
                  className="px-3 py-2 rounded-xl bg-[#241f1c] hover:bg-[#342b26] text-[#a69a8f] hover:text-[#c8a88a] text-xs font-medium border border-[#3a312c] transition-colors"
                  title="Editar Ficha Cadastral"
                >
                  Editar
                </button>
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
              <button
                onClick={() => openEditPatientModal(detailedPatient)}
                className="px-3.5 py-1.5 rounded-lg bg-[#27211d] hover:bg-[#342b26] text-[#c8a88a] text-xs font-semibold border border-[#433730] transition-all flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" /> Editar Cadastro
              </button>
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#1c1815] border border-[#342b26] space-y-1.5">
              <span className="font-semibold text-[#c8a88a] uppercase tracking-wider flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> Identificação do Paciente
              </span>
              <p className="text-[#a69a8f]">Nascimento: <span className="text-[#f4efe8]">{detailedPatient.birthDate || '-'}</span></p>
              <p className="text-[#a69a8f]">Sexo: <span className="text-[#f4efe8]">{detailedPatient.gender || 'Feminino'}</span></p>
              <p className="text-[#a69a8f]">CPF: <span className="text-[#f4efe8]">{detailedPatient.cpf || 'Não cadastrado'}</span></p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#1c1815] border border-[#342b26] space-y-1.5">
              <span className="font-semibold text-[#c8a88a] uppercase tracking-wider flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" /> Responsável & Recibo
              </span>
              <p className="text-[#a69a8f]">Responsável: <span className="text-[#f4efe8]">{detailedPatient.guardianName || 'O Próprio'}</span></p>
              <p className="text-[#a69a8f]">Recibo em nome de: <span className="text-[#c8a88a] font-semibold">{detailedPatient.receiptName || detailedPatient.guardianName || detailedPatient.name}</span></p>
              <p className="text-[#a69a8f]">E-mail: <span className="text-[#f4efe8]">{detailedPatient.email || detailedPatient.guardianEmail || '-'}</span></p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#1c1815] border border-[#342b26] space-y-1.5">
              <span className="font-semibold text-[#c8a88a] uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Endereço & Contatos
              </span>
              <p className="text-[#a69a8f]">Endereço: <span className="text-[#f4efe8]">{detailedPatient.address || '-'}</span></p>
              <p className="text-[#a69a8f]">CEP: <span className="text-[#f4efe8]">{detailedPatient.cep || '-'}</span></p>
              <p className="text-[#a69a8f]">Telefones: <span className="text-[#f4efe8]">{[detailedPatient.phone, detailedPatient.secondaryPhone].filter(Boolean).join(' / ') || '-'}</span></p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#1c1815] border border-[#342b26] space-y-1.5">
              <span className="font-semibold text-[#c8a88a] uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Segurança & Acesso
              </span>
              <p className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Termo LGPD Aceito
              </p>
              <p className="text-[#85796f]">Fono: {detailedPatient.fonoaudiologistName || 'Adriane Gama'}</p>
              <button
                onClick={() => setShowPrintableFicha(true)}
                className="mt-1 w-full py-1 px-2 rounded-lg bg-[#27211d] hover:bg-[#342b26] text-[#c8a88a] text-[11px] font-medium border border-[#433730] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" /> Imprimir Ficha Cadastral
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#1c1815] border border-[#342b26] space-y-2 text-xs">
            <span className="font-semibold text-[#c8a88a] uppercase tracking-wider">Diagnóstico Principal & Histórico</span>
            <p className="text-[#f4efe8] font-medium text-sm">{detailedPatient.mainDiagnosis || detailedPatient.diagnosis}</p>
            {detailedPatient.medicalHistory && (
              <p className="text-[#a69a8f]">{detailedPatient.medicalHistory}</p>
            )}
            {detailedPatient.currentMedications && (
              <p className="text-[#a69a8f]"><strong className="text-[#f4efe8]">Medicamentos:</strong> {detailedPatient.currentMedications}</p>
            )}
          </div>
        </div>
      )}

      {/* Modal Ficha Cadastral Imprimível / Pré-visualização Padrão Clínica */}
      {showPrintableFicha && detailedPatient && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1c1815] border border-[#c8a88a]/40 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-[#3a312c] pb-3">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#c8a88a] font-semibold">Documento Oficial</span>
                <h3 className="text-lg font-bold font-serif text-[#f4efe8]">Ficha Cadastral Fonoaudiológica</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-[#c8a88a] hover:bg-[#d6bba0] text-[#181513] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
                >
                  <Printer className="w-3.5 h-3.5" /> Imprimir
                </button>
                <button
                  onClick={() => setShowPrintableFicha(false)}
                  className="p-1.5 rounded-lg text-[#a69a8f] hover:text-[#f4efe8] hover:bg-[#2d2622]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Ficha Content in Clinical Formal Layout */}
            <div className="bg-[#241f1c] border border-[#3a312c] rounded-xl p-5 space-y-3.5 text-xs text-[#d8cec4]">
              <div className="border-b border-[#3a312c] pb-2">
                <p className="text-sm font-bold text-[#f4efe8]">Paciente: <span className="font-normal text-[#c8a88a] underline underline-offset-4">{detailedPatient.name}</span></p>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <p>Data de Nascimento: <strong className="text-[#f4efe8]">{detailedPatient.birthDate || '___/___/______'}</strong></p>
                  <p>Sexo: <strong className="text-[#f4efe8]">{detailedPatient.gender || 'Feminino'}</strong></p>
                </div>
              </div>

              <div className="border-b border-[#3a312c] pb-2">
                <p className="font-semibold text-[#a69a8f]">Diagnóstico Principal:</p>
                <p className="text-sm font-medium text-[#f4efe8] mt-0.5">{detailedPatient.mainDiagnosis || detailedPatient.diagnosis}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-b border-[#3a312c] pb-2">
                <p>Responsável pelo paciente: <strong className="text-[#f4efe8]">{detailedPatient.guardianName || 'O Próprio'}</strong></p>
                <p>Recibo em nome de: <strong className="text-[#c8a88a]">{detailedPatient.receiptName || detailedPatient.guardianName || detailedPatient.name}</strong></p>
                <p>CPF: <strong className="text-[#f4efe8]">{detailedPatient.cpf || 'Não informado'}</strong></p>
                <p>E-mail: <strong className="text-[#f4efe8]">{detailedPatient.email || detailedPatient.guardianEmail || 'Não informado'}</strong></p>
              </div>

              <div className="space-y-1.5">
                <p>Endereço: <strong className="text-[#f4efe8]">{detailedPatient.address || 'Não informado'}</strong></p>
                <div className="grid grid-cols-2 gap-4">
                  <p>CEP: <strong className="text-[#f4efe8]">{detailedPatient.cep || '_____-___'}</strong></p>
                  <p>Telefones para contato: <strong className="text-[#f4efe8]">{[detailedPatient.phone, detailedPatient.secondaryPhone].filter(Boolean).join(' / ') || '-'}</strong></p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#3a312c] flex items-center justify-between text-[11px] text-[#85796f]">
                <span>GamaEcosystem - Health Deglut • Fonoaudiologia Clínica</span>
                <span>Conforme LGPD (Lei 13.709/2018)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Paciente - FORMULÁRIO COMPLETO ATUALIZADO */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#221d1a] border border-[#3a312c] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#342b26] pb-3">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#c8a88a] font-semibold">
                  {editingPatientId ? 'Edição Cadastral' : 'Cadastro Clínico'}
                </span>
                <h3 className="text-xl font-bold font-serif text-[#f4efe8]">
                  {editingPatientId ? 'Atualizar Ficha Cadastral' : 'Ficha Cadastral Fonoaudiológica'}
                </h3>
                <p className="text-[11px] text-[#a69a8f] mt-0.5">
                  Preencha os dados cadastrais do paciente e responsável financeiro/legal.
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
              {/* Paciente e Sexo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-semibold text-[#f4efe8] block mb-1">
                    Paciente *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nome completo do paciente"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#1c1815] border border-[#3a312c] rounded-xl p-2.5 text-sm text-[#f4efe8] placeholder-[#6d635a] focus:outline-none focus:border-[#c8a88a]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#a69a8f] block mb-1">
                    Sexo
                  </label>
                  <div className="flex items-center gap-3 pt-2">
                    <label className="flex items-center gap-1.5 cursor-pointer text-[#d8cec4]">
                      <input
                        type="radio"
                        name="gender"
                        value="Feminino"
                        checked={gender === 'Feminino'}
                        onChange={() => setGender('Feminino')}
                        className="text-[#c8a88a] focus:ring-0"
                      />
                      <span>Feminino</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-[#d8cec4]">
                      <input
                        type="radio"
                        name="gender"
                        value="Masculino"
                        checked={gender === 'Masculino'}
                        onChange={() => setGender('Masculino')}
                        className="text-[#c8a88a] focus:ring-0"
                      />
                      <span>Masculino</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Data de Nascimento e Diagnóstico Principal */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-[#a69a8f] block mb-1">Data de Nascimento</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-[#1c1815] border border-[#3a312c] rounded-xl p-2.5 text-sm text-[#f4efe8] focus:outline-none focus:border-[#c8a88a]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-semibold text-[#a69a8f] block mb-1">Diagnóstico Principal</label>
                  <input
                    type="text"
                    placeholder="Ex: Disfagia orofaríngea neurogênica, Alzheimer, AVC..."
                    value={mainDiagnosis}
                    onChange={(e) => setMainDiagnosis(e.target.value)}
                    className="w-full bg-[#1c1815] border border-[#3a312c] rounded-xl p-2.5 text-sm text-[#f4efe8] placeholder-[#6d635a] focus:outline-none focus:border-[#c8a88a]"
                  />
                </div>
              </div>

              {/* Responsável e Recibo Financeiro */}
              <div className="pt-2 border-t border-[#342b26] space-y-3">
                <h4 className="font-semibold text-[#f4efe8] text-sm flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-[#c8a88a]" /> Responsabilidade & Recibo
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-[#a69a8f] block mb-1">Responsável pelo paciente</label>
                    <input
                      type="text"
                      placeholder="Nome do familiar ou responsável legal"
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      className="w-full bg-[#1c1815] border border-[#3a312c] rounded-xl p-2.5 text-sm text-[#f4efe8] placeholder-[#6d635a] focus:outline-none focus:border-[#c8a88a]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#a69a8f] block mb-1">Recibo em nome de</label>
                    <input
                      type="text"
                      placeholder="Nome para emissão do recibo fonoaudiológico"
                      value={receiptName}
                      onChange={(e) => setReceiptName(e.target.value)}
                      className="w-full bg-[#1c1815] border border-[#3a312c] rounded-xl p-2.5 text-sm text-[#f4efe8] placeholder-[#6d635a] focus:outline-none focus:border-[#c8a88a]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-[#a69a8f] block mb-1">CPF (do Titular / Recibo)</label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={handleCpfChange}
                      className="w-full bg-[#1c1815] border border-[#3a312c] rounded-xl p-2.5 text-sm text-[#f4efe8] placeholder-[#6d635a] focus:outline-none focus:border-[#c8a88a]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#a69a8f] block mb-1">E-mail</label>
                    <input
                      type="email"
                      placeholder="email@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#1c1815] border border-[#3a312c] rounded-xl p-2.5 text-sm text-[#f4efe8] placeholder-[#6d635a] focus:outline-none focus:border-[#c8a88a]"
                    />
                  </div>
                </div>
              </div>

              {/* Endereço e Contatos */}
              <div className="pt-2 border-t border-[#342b26] space-y-3">
                <h4 className="font-semibold text-[#f4efe8] text-sm flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#c8a88a]" /> Localização & Telefones
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="font-semibold text-[#a69a8f] block mb-1">Endereço</label>
                    <input
                      type="text"
                      placeholder="Rua, número, complemento, bairro, cidade/UF"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-[#1c1815] border border-[#3a312c] rounded-xl p-2.5 text-sm text-[#f4efe8] placeholder-[#6d635a] focus:outline-none focus:border-[#c8a88a]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#a69a8f] block mb-1">CEP</label>
                    <input
                      type="text"
                      placeholder="00000-000"
                      value={cep}
                      onChange={handleCepChange}
                      className="w-full bg-[#1c1815] border border-[#3a312c] rounded-xl p-2.5 text-sm text-[#f4efe8] placeholder-[#6d635a] focus:outline-none focus:border-[#c8a88a]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-[#a69a8f] block mb-1">Telefone Principal</label>
                    <input
                      type="text"
                      placeholder="(00) 00000-0000"
                      value={phone}
                      onChange={handlePhoneChange}
                      className="w-full bg-[#1c1815] border border-[#3a312c] rounded-xl p-2.5 text-sm text-[#f4efe8] placeholder-[#6d635a] focus:outline-none focus:border-[#c8a88a]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#a69a8f] block mb-1">Telefone Secundário / Recado</label>
                    <input
                      type="text"
                      placeholder="(00) 0000-0000"
                      value={secondaryPhone}
                      onChange={handleSecondaryPhoneChange}
                      className="w-full bg-[#1c1815] border border-[#3a312c] rounded-xl p-2.5 text-sm text-[#f4efe8] placeholder-[#6d635a] focus:outline-none focus:border-[#c8a88a]"
                    />
                  </div>
                </div>
              </div>

              {/* Informações Clínicas Complementares */}
              <div className="pt-2 border-t border-[#342b26] space-y-3">
                <h4 className="font-semibold text-[#f4efe8] text-sm">Histórico Clínico Adicional</h4>
                <div>
                  <label className="font-semibold text-[#a69a8f] block mb-1">Histórico Médico Relevante</label>
                  <textarea
                    rows={2}
                    placeholder="Comorbidades, histórico de internações ou broncoaspirações"
                    value={medicalHistory}
                    onChange={(e) => setMedicalHistory(e.target.value)}
                    className="w-full bg-[#1c1815] border border-[#3a312c] rounded-xl p-2.5 text-sm text-[#f4efe8] placeholder-[#6d635a] focus:outline-none focus:border-[#c8a88a]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#a69a8f] block mb-1">Medicamentos Atuais</label>
                  <input
                    type="text"
                    placeholder="Medicamentos de uso contínuo"
                    value={currentMedications}
                    onChange={(e) => setCurrentMedications(e.target.value)}
                    className="w-full bg-[#1c1815] border border-[#3a312c] rounded-xl p-2.5 text-sm text-[#f4efe8] placeholder-[#6d635a] focus:outline-none focus:border-[#c8a88a]"
                  />
                </div>
              </div>

              {/* Profissional e Cuidador Responsáveis */}
              <div className="pt-2 border-t border-[#342b26] grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#a69a8f] block mb-1">Fonoaudióloga Responsável</label>
                  <select
                    value={fonoaudiologistId}
                    onChange={(e) => setFonoaudiologistId(e.target.value)}
                    className="w-full bg-[#1c1815] border border-[#3a312c] rounded-xl p-2.5 text-sm text-[#f4efe8] focus:outline-none focus:border-[#c8a88a]"
                  >
                    <option value="user_adriane">Adriane Gama (CRFa 3-12894)</option>
                    <option value="user_pending">Camila Torres (CRFa 3-18920)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[#a69a8f] block mb-1">Cuidador Atribuído</label>
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

              {/* Termo LGPD */}
              <div className="p-3.5 rounded-xl bg-[#1c1815] border border-[#3a312c] flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="lgpd"
                  checked={lgpdAccepted}
                  onChange={(e) => setLgpdAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-[#4a3e37] bg-[#221d1a] text-[#c8a88a] focus:ring-0"
                />
                <label htmlFor="lgpd" className="text-[11px] text-[#a69a8f] leading-relaxed cursor-pointer select-none">
                  <strong className="text-[#f4efe8]">Termo de Consentimento Livre e Esclarecido (LGPD - Lei 13.709/2018):</strong> Autorizo a coleta, armazenamento criptografado e tratamento de dados cadastrais, financeiros e de saúde estritamente para propósitos de acompanhamento terapêutico fonoaudiológico e emissão de recibos.
                </label>
              </div>

              {/* Botões do Formulário */}
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
                  className="px-6 py-2.5 rounded-xl bg-[#c8a88a] hover:bg-[#d6bba0] text-[#181513] font-bold text-sm shadow-md transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> {editingPatientId ? 'Salvar Alterações' : 'Salvar Ficha Cadastral'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
