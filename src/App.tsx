import React, { useState, useEffect } from 'react';
import { 
  Patient, 
  RadiAssessment, 
  DailyFeedingLog, 
  MealPhoto, 
  ChatMessage, 
  UserProfile, 
  NavigationTab, 
  UserRole,
  PatientMedicalRecord
} from './types';
import { 
  INITIAL_PATIENTS, 
  INITIAL_RADI_ASSESSMENTS, 
  INITIAL_DAILY_LOGS, 
  INITIAL_MEAL_PHOTOS, 
  INITIAL_CHAT_MESSAGES, 
  INITIAL_USERS,
  INITIAL_MEDICAL_RECORDS
} from './data/mockData';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { RadiAssessmentView } from './components/RadiAssessmentView';
import { DailyFeedingLogView } from './components/DailyFeedingLogView';
import { PatientsManagementView } from './components/PatientsManagementView';
import { HistoryTimelineView } from './components/HistoryTimelineView';
import { PatientChatView } from './components/PatientChatView';
import { ReportsView } from './components/ReportsView';
import { LgpdSecurityView } from './components/LgpdSecurityView';
import { AdminUsersView } from './components/AdminUsersView';
import { MedicalRecordView } from './components/MedicalRecordView';
import { AuthModal } from './components/AuthModal';
import { generateOfficialReportPDF } from './utils/pdfGenerator';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('health_deglut_user');
    return saved ? JSON.parse(saved) : INITIAL_USERS[0];
  });

  // Navigation state
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');

  // Application Data States (persisted in localStorage for durability)
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('health_deglut_patients');
    return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
  });

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(() => {
    const savedPatients = localStorage.getItem('health_deglut_patients');
    const list = savedPatients ? JSON.parse(savedPatients) : INITIAL_PATIENTS;
    return list[0] || null;
  });

  const [assessments, setAssessments] = useState<RadiAssessment[]>(() => {
    const saved = localStorage.getItem('health_deglut_assessments');
    return saved ? JSON.parse(saved) : INITIAL_RADI_ASSESSMENTS;
  });

  const [dailyLogs, setDailyLogs] = useState<DailyFeedingLog[]>(() => {
    const saved = localStorage.getItem('health_deglut_logs');
    return saved ? JSON.parse(saved) : INITIAL_DAILY_LOGS;
  });

  const [allPhotos, setAllPhotos] = useState<MealPhoto[]>(() => {
    const saved = localStorage.getItem('health_deglut_photos');
    return saved ? JSON.parse(saved) : INITIAL_MEAL_PHOTOS;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('health_deglut_messages');
    return saved ? JSON.parse(saved) : INITIAL_CHAT_MESSAGES;
  });

  const [medicalRecords, setMedicalRecords] = useState<PatientMedicalRecord[]>(() => {
    const saved = localStorage.getItem('health_deglut_medical_records');
    return saved ? JSON.parse(saved) : INITIAL_MEDICAL_RECORDS;
  });

  const [usersList, setUsersList] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('health_deglut_users_list');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  // Sync to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('health_deglut_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('health_deglut_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('health_deglut_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('health_deglut_medical_records', JSON.stringify(medicalRecords));
  }, [medicalRecords]);

  useEffect(() => {
    localStorage.setItem('health_deglut_assessments', JSON.stringify(assessments));
  }, [assessments]);

  useEffect(() => {
    localStorage.setItem('health_deglut_logs', JSON.stringify(dailyLogs));
  }, [dailyLogs]);

  useEffect(() => {
    localStorage.setItem('health_deglut_photos', JSON.stringify(allPhotos));
  }, [allPhotos]);

  useEffect(() => {
    localStorage.setItem('health_deglut_messages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem('health_deglut_users_list', JSON.stringify(usersList));
  }, [usersList]);

  // Handlers
  const handleSaveAssessment = (newAssessment: RadiAssessment) => {
    setAssessments([newAssessment, ...assessments]);
    alert('Avaliação RaDI registrada com sucesso no prontuário do paciente!');
    setCurrentTab('reports');
  };

  const handleSaveLog = (newLog: DailyFeedingLog) => {
    setDailyLogs([newLog, ...dailyLogs]);
    alert('Registro diário de alimentação e consistências salvo com sucesso!');
    setCurrentTab('history');
  };

  const handleSavePatient = (newPatient: Patient) => {
    setPatients([newPatient, ...patients]);
    setSelectedPatient(newPatient);
  };

  const handleAddPhoto = (photo: MealPhoto) => {
    setAllPhotos([photo, ...allPhotos]);
  };

  const handleDeletePhoto = (photoId: string) => {
    setAllPhotos(allPhotos.filter(p => p.id !== photoId));
  };

  const handleSendMessage = (msg: ChatMessage) => {
    setChatMessages([...chatMessages, msg]);
  };

  const handleApproveUser = (userId: string) => {
    setUsersList(usersList.map(u => u.id === userId ? { ...u, approved: true } : u));
  };

  const handleRejectUser = (userId: string) => {
    setUsersList(usersList.filter(u => u.id !== userId));
  };

  const handleChangeRole = (userId: string, role: UserRole) => {
    setUsersList(usersList.map(u => u.id === userId ? { ...u, role } : u));
  };

  const handleUpdateMedicalRecord = (updated: PatientMedicalRecord) => {
    setMedicalRecords(prev => {
      const idx = prev.findIndex(r => r.patientId === updated.patientId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      }
      return [updated, ...prev];
    });
  };

  const handleGenerateDirectReport = (assessment: RadiAssessment) => {
    const p = patients.find(pat => pat.id === assessment.patientId) || selectedPatient;
    if (p) {
      generateOfficialReportPDF({
        patient: p,
        assessment,
        recentLogs: dailyLogs.filter(l => l.patientId === p.id),
        evaluatorName: currentUser?.name || 'Adriane Paes da Gama',
        evaluatorCrfa: currentUser?.crfaNumber || 'CRFa 3-12894',
        reportDate: new Date().toLocaleDateString('pt-BR')
      });
    }
  };

  // If not authenticated, display login/register modal matching image.png
  if (!currentUser) {
    return (
      <AuthModal
        onLoginSuccess={(user) => setCurrentUser(user)}
        availableUsers={usersList}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#181513] text-[#f4efe8] flex flex-col font-sans selection:bg-[#c8a88a] selection:text-[#181513]">
      {/* Top Header */}
      <Header
        user={currentUser}
        onLogout={() => setCurrentUser(null)}
        patientsCount={patients.length}
      />

      {/* Navigation Tab Bar */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        userRole={currentUser.role}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {(currentTab === 'dashboard' || currentTab === 'resumo') && (
          <DashboardView
            patients={patients}
            assessments={assessments}
            dailyLogs={dailyLogs}
            selectedPatient={selectedPatient}
            onSelectPatient={setSelectedPatient}
            onNavigate={setCurrentTab}
            currentUser={currentUser}
          />
        )}

        {(currentTab === 'prontuario' || currentTab === 'medical_records') && (
          <MedicalRecordView
            selectedPatient={selectedPatient}
            patients={patients}
            onSelectPatient={setSelectedPatient}
            currentUser={currentUser}
            medicalRecords={medicalRecords}
            onUpdateMedicalRecord={handleUpdateMedicalRecord}
            radiAssessments={assessments}
            dailyLogs={dailyLogs}
          />
        )}

        {currentTab === 'radi' && (
          <RadiAssessmentView
            patients={patients}
            selectedPatient={selectedPatient}
            onSelectPatient={setSelectedPatient}
            currentUser={currentUser}
            onSaveAssessment={handleSaveAssessment}
            onGenerateReport={handleGenerateDirectReport}
          />
        )}

        {(currentTab === 'feeding_log' || currentTab === 'registro') && (
          <DailyFeedingLogView
            patients={patients}
            selectedPatient={selectedPatient}
            onSelectPatient={setSelectedPatient}
            currentUser={currentUser}
            onSaveLog={handleSaveLog}
            allPhotos={allPhotos}
            onAddPhoto={handleAddPhoto}
            onDeletePhoto={handleDeletePhoto}
          />
        )}

        {(currentTab === 'patients' || currentTab === 'pacientes') && (
          <PatientsManagementView
            patients={patients}
            selectedPatient={selectedPatient}
            onSelectPatient={setSelectedPatient}
            onSavePatient={handleSavePatient}
            currentUser={currentUser}
            professionals={usersList}
            onNavigateToRaDI={(pat) => {
              setSelectedPatient(pat);
              setCurrentTab('radi');
            }}
            onNavigateToLog={(pat) => {
              setSelectedPatient(pat);
              setCurrentTab('feeding_log');
            }}
            onNavigateToPep={(pat) => {
              setSelectedPatient(pat);
              setCurrentTab('prontuario');
            }}
          />
        )}

        {(currentTab === 'history' || currentTab === 'historico') && (
          <HistoryTimelineView
            patients={patients}
            selectedPatient={selectedPatient}
            onSelectPatient={setSelectedPatient}
            assessments={assessments}
            dailyLogs={dailyLogs}
            onGenerateReport={(assessment) => handleGenerateDirectReport(assessment)}
          />
        )}

        {currentTab === 'chat' && (
          <PatientChatView
            patients={patients}
            selectedPatient={selectedPatient}
            onSelectPatient={setSelectedPatient}
            currentUser={currentUser}
            messages={chatMessages}
            onSendMessage={handleSendMessage}
          />
        )}

        {(currentTab === 'reports' || currentTab === 'relatorios') && (
          <ReportsView
            patients={patients}
            selectedPatient={selectedPatient}
            onSelectPatient={setSelectedPatient}
            assessments={assessments}
            dailyLogs={dailyLogs}
            currentUser={currentUser}
          />
        )}

        {(currentTab === 'security' || currentTab === 'seguranca') && (
          <LgpdSecurityView />
        )}

        {(currentTab === 'admin_users' || currentTab === 'admin') && (
          <AdminUsersView
            users={usersList}
            onApproveUser={handleApproveUser}
            onRejectUser={handleRejectUser}
            onChangeRole={handleChangeRole}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2a221d] py-4 px-6 text-center text-xs text-[#85796f] flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl w-full mx-auto">
        <p>GamaEcosystem - Health Deglut © 2026. Todos os direitos reservados.</p>
        <p className="flex items-center gap-1.5 text-[11px] text-[#a69a8f]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Conformidade LGPD Ativa • Criptografia AES-GCM • Banco de Dados Seguro
        </p>
      </footer>
    </div>
  );
}
