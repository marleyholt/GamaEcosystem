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
import { AdminUsersView } from './components/AdminUsersView';
import { MedicalRecordView } from './components/MedicalRecordView';
import { ConfigurationView } from './components/ConfigurationView';
import { AuthModal } from './components/AuthModal';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { generateOfficialReportPDF } from './utils/pdfGenerator';
import { 
  ClinicConfig, 
  Caregiver, 
  Therapist, 
  DEFAULT_CLINIC_CONFIG, 
  INITIAL_CAREGIVERS, 
  INITIAL_THERAPISTS 
} from './types/clinicConfig';
import { OfficialEvolutionData } from './types/clinicalEvolution';
import { INITIAL_OFFICIAL_EVOLUTIONS } from './data/mockEvolutions';
import { 
  syncDocToFirestore, 
  removeDocFromFirestore, 
  fetchCollectionFromFirestore, 
  backupAllLocalToFirestore,
  FirestoreCollections 
} from './services/firestoreSync';
import { 
  fetchAllFromMariaDB, 
  savePatientToMariaDB, 
  saveMedicalRecordToMariaDB, 
  saveRadiToMariaDB, 
  saveFeedingLogToMariaDB, 
  saveEvolutionToMariaDB,
  saveClinicConfigToMariaDB 
} from './services/mariaDBSync';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('health_deglut_user');
    let user: UserProfile = saved ? JSON.parse(saved) : INITIAL_USERS[0];
    // Se for a Adriane Gama ou admin, assegura acesso MASTER irrestrito a todos os módulos
    const isAdriane = 
      user.name.toLowerCase().includes('adriane gama') ||
      user.email.toLowerCase().includes('adriane') ||
      user.email.toLowerCase().includes('gamafono') ||
      user.role === 'admin';
    if (isAdriane) {
      user = {
        ...user,
        role: 'admin',
        allowedTabs: ['resumo', 'prontuario', 'radi', 'registro', 'historico', 'chat', 'pacientes', 'relatorios', 'configuracao']
      };
    }
    return user;
  });

  // Navigation state
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');

  // Menu Lateral Drawer State (Apenas abre sob demanda ao clicar no botão Sanduíche)
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

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
    const rawList: UserProfile[] = saved ? JSON.parse(saved) : INITIAL_USERS;
    return rawList.map(u => {
      const isAdriane = 
        u.name.toLowerCase().includes('adriane gama') ||
        u.email.toLowerCase().includes('adriane') ||
        u.email.toLowerCase().includes('gamafono');
      if (isAdriane) {
        return {
          ...u,
          role: 'admin',
          allowedTabs: ['resumo', 'prontuario', 'radi', 'registro', 'historico', 'chat', 'pacientes', 'relatorios', 'configuracao']
        };
      }
      return u;
    });
  });

  // Clinic Configuration States (Persisted in localStorage)
  const [clinicConfig, setClinicConfig] = useState<ClinicConfig>(() => {
    const saved = localStorage.getItem('health_deglut_clinic_config');
    return saved ? JSON.parse(saved) : DEFAULT_CLINIC_CONFIG;
  });

  const [caregivers, setCaregivers] = useState<Caregiver[]>(() => {
    const saved = localStorage.getItem('health_deglut_caregivers');
    return saved ? JSON.parse(saved) : INITIAL_CAREGIVERS;
  });

  const [therapists, setTherapists] = useState<Therapist[]>(() => {
    const saved = localStorage.getItem('health_deglut_therapists');
    return saved ? JSON.parse(saved) : INITIAL_THERAPISTS;
  });

  const [officialEvolutions, setOfficialEvolutions] = useState<OfficialEvolutionData[]>(() => {
    const saved = localStorage.getItem('health_deglut_official_evolutions');
    const list: OfficialEvolutionData[] = saved ? JSON.parse(saved) : INITIAL_OFFICIAL_EVOLUTIONS;
    return list.map(item => ({
      ...item,
      status: item.status || (item.responsibleSignature ? 'finalizado_assinado' : item.therapistSignature ? 'aguardando_familiar' : 'rascunho')
    }));
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('health_deglut_official_evolutions', JSON.stringify(officialEvolutions));
  }, [officialEvolutions]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('health_deglut_clinic_config', JSON.stringify(clinicConfig));
  }, [clinicConfig]);

  useEffect(() => {
    localStorage.setItem('health_deglut_caregivers', JSON.stringify(caregivers));
  }, [caregivers]);

  useEffect(() => {
    localStorage.setItem('health_deglut_therapists', JSON.stringify(therapists));
  }, [therapists]);

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

  // Theme state (Dark mode by default, persisted)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('health_deglut_theme');
    return saved !== null ? saved === 'dark' : true;
  });

  useEffect(() => {
    localStorage.setItem('health_deglut_theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.remove('theme-light');
      document.documentElement.classList.add('theme-dark');
      document.body.classList.remove('theme-light');
    } else {
      document.documentElement.classList.remove('theme-dark');
      document.documentElement.classList.add('theme-light');
      document.body.classList.add('theme-light');
    }
  }, [darkMode]);

  // Auto-sincronização inicial com o MariaDB (Produção) e Firestore (Backup)
  useEffect(() => {
    // 1. Sincronização primária via API MariaDB em Produção
    fetchAllFromMariaDB().then(dbData => {
      if (dbData) {
        if (dbData.patients && Array.isArray(dbData.patients)) {
          // Formata campos snake_case para camelCase se vierem do MariaDB
          const mappedPatients: Patient[] = dbData.patients.map((p: any) => ({
            id: p.id,
            name: p.name,
            cpf: p.cpf || '',
            birthDate: p.birth_date || p.birthDate || '',
            gender: p.gender || 'Feminino',
            mainDiagnosis: p.main_diagnosis || p.mainDiagnosis || '',
            diagnosis: p.diagnosis || p.main_diagnosis || '',
            medicalHistory: p.medical_history || p.medicalHistory || '',
            currentMedications: p.current_medications || p.currentMedications || '',
            guardianName: p.guardian_name || p.guardianName || '',
            guardianPhone: p.guardian_phone || p.guardianPhone || '',
            guardianEmail: p.guardian_email || p.guardianEmail || '',
            receiptName: p.receipt_name || p.receiptName || '',
            fonoaudiologistId: p.fonoaudiologist_id || p.fonoaudiologistId || '',
            fonoaudiologistName: p.fonoaudiologist_name || p.fonoaudiologistName || '',
            caregiverId: p.caregiver_id || p.caregiverId || '',
            caregiverName: p.caregiver_name || p.caregiverName || '',
            address: p.address || '',
            cep: p.cep || '',
            phone: p.phone || '',
            secondaryPhone: p.secondary_phone || p.secondaryPhone || '',
            email: p.email || '',
            status: p.status || 'ativo',
            createdAt: p.created_at || new Date().toISOString(),
            updatedAt: p.updated_at || new Date().toISOString(),
            lgpdConsentAccepted: true
          }));
          setPatients(mappedPatients);
          if (mappedPatients.length > 0 && !selectedPatient) {
            setSelectedPatient(mappedPatients[0]);
          }
        }

        if (dbData.clinicConfig) {
          const cfg = dbData.clinicConfig;
          setClinicConfig(prev => {
            // Prioriza a imagem do banco, mas se o banco ainda estiver vazio, NÃO apaga a imagem já salva localmente
            const effectiveLogo = (cfg.logo_url && cfg.logo_url.trim() !== '') ? cfg.logo_url : prev.logoUrl;
            const effectiveFavicon = (cfg.favicon_url && cfg.favicon_url.trim() !== '') ? cfg.favicon_url : prev.faviconUrl;

            const updated: ClinicConfig = {
              ...prev,
              clinicName: cfg.clinic_name || prev.clinicName,
              technicalResponsible: cfg.technical_manager_name || prev.technicalResponsible,
              crfa: cfg.technical_manager_crfa || prev.crfa,
              addressLine: cfg.address || prev.addressLine,
              phoneWhatsapp: cfg.phone || prev.phoneWhatsapp,
              email: cfg.email || prev.email,
              instagram: cfg.instagram || prev.instagram,
              logoUrl: effectiveLogo,
              faviconUrl: effectiveFavicon
            };
            localStorage.setItem('health_deglut_clinic_config', JSON.stringify(updated));
            return updated;
          });
        }
      }
    });

    // 2. Carregar pacientes remotos se existirem no Firestore (Fallback / Nuvem)
    fetchCollectionFromFirestore<Patient>(FirestoreCollections.PATIENTS).then(remotePatients => {
      if (remotePatients && remotePatients.length > 0) {
        setPatients(remotePatients);
      }
    });

    // Carregar terapeutas
    fetchCollectionFromFirestore<Therapist>(FirestoreCollections.THERAPISTS).then(remoteTherapists => {
      if (remoteTherapists && remoteTherapists.length > 0) {
        setTherapists(remoteTherapists);
      } else {
        therapists.forEach(t => syncDocToFirestore(FirestoreCollections.THERAPISTS, t.id, t));
      }
    });

    // Carregar cuidadores
    fetchCollectionFromFirestore<Caregiver>(FirestoreCollections.CAREGIVERS).then(remoteCaregivers => {
      if (remoteCaregivers && remoteCaregivers.length > 0) {
        setCaregivers(remoteCaregivers);
      } else {
        caregivers.forEach(c => syncDocToFirestore(FirestoreCollections.CAREGIVERS, c.id, c));
      }
    });

    // Carregar evoluções
    fetchCollectionFromFirestore<OfficialEvolutionData>(FirestoreCollections.EVOLUTIONS).then(remoteEvolutions => {
      if (remoteEvolutions && remoteEvolutions.length > 0) {
        setOfficialEvolutions(remoteEvolutions);
      } else {
        officialEvolutions.forEach(e => syncDocToFirestore(FirestoreCollections.EVOLUTIONS, e.id, e));
      }
    });

    // Carregar configuração da clínica
    fetchCollectionFromFirestore<ClinicConfig>(FirestoreCollections.CLINIC_CONFIG).then(remoteConfig => {
      if (remoteConfig && remoteConfig.length > 0) {
        setClinicConfig(remoteConfig[0]);
      } else {
        syncDocToFirestore(FirestoreCollections.CLINIC_CONFIG, 'global_settings', clinicConfig);
      }
    });
  }, []);

  // Handlers
  const handleSaveAssessment = (newAssessment: RadiAssessment) => {
    setAssessments([newAssessment, ...assessments]);
    syncDocToFirestore(FirestoreCollections.ASSESSMENTS, newAssessment.id, newAssessment);
    saveRadiToMariaDB(newAssessment);
    alert('Avaliação RaDI registrada com sucesso no prontuário do paciente!');
    setCurrentTab('reports');
  };

  const handleSaveLog = (newLog: DailyFeedingLog) => {
    setDailyLogs([newLog, ...dailyLogs]);
    syncDocToFirestore(FirestoreCollections.DAILY_LOGS, newLog.id, newLog);
    saveFeedingLogToMariaDB(newLog);
    alert('Registro diário de alimentação e consistências salvo com sucesso!');
    setCurrentTab('history');
  };

  const handleSavePatient = (newPatient: Patient) => {
    setPatients(prev => {
      const idx = prev.findIndex(p => p.id === newPatient.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newPatient;
        return copy;
      }
      return [newPatient, ...prev];
    });
    setSelectedPatient(newPatient);
    syncDocToFirestore(FirestoreCollections.PATIENTS, newPatient.id, newPatient);
    savePatientToMariaDB(newPatient);
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
    saveMedicalRecordToMariaDB(updated);
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
        caregivers={caregivers}
        therapists={therapists}
      />
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-150 ${darkMode ? 'bg-[#181513] text-[#f4efe8]' : 'bg-[#f7f4ef] text-[#1c1714] theme-light'} selection:bg-[#c8a88a] selection:text-[#181513]`}>
      {/* Top Header com Botão Sanduíche */}
      <Header
        user={currentUser}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onLogout={() => setCurrentUser(null)}
        onUpdateUser={(updated) => {
          setCurrentUser(updated);
          setUsersList(prev => prev.map(u => u.id === updated.id ? updated : u));
        }}
        onOpenSettings={() => setCurrentTab('configuracao')}
        patientsCount={patients.length}
        onOpenMenu={() => setIsMenuOpen(true)}
      />

      {/* Menu Lateral Drawer (Abre apenas sob demanda ao clicar no botão Sanduíche) */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        userRole={currentUser.role}
        userEmail={currentUser.email}
        userName={currentUser.name}
        allowedTabs={currentUser.allowedTabs}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      {/* Main Content Area (100% da largura, sem barra lateral permanente ocupando espaço) */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
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
              officialEvolutions={officialEvolutions}
              onSaveOfficialEvolution={(newEvo) => {
                setOfficialEvolutions(prev => {
                  const exists = prev.some(e => e.id === newEvo.id);
                  if (exists) {
                    return prev.map(e => e.id === newEvo.id ? newEvo : e);
                  }
                  return [newEvo, ...prev];
                });
                // Também atualiza o FOIS atual no prontuário do paciente
                setMedicalRecords(prev => prev.map(rec => {
                  if (rec.patientId === newEvo.patientId) {
                    return { ...rec, currentFois: newEvo.foisLevel, updatedAt: new Date().toISOString() };
                  }
                  return rec;
                }));
                if (newEvo.status === 'finalizado_assinado') {
                  alert('Evolução 100% assinada por ambas as partes! O Laudo em PDF em papel timbrado está liberado.');
                } else if (newEvo.status === 'aguardando_familiar') {
                  alert('Evolução salva e assinada pela Fonoaudióloga! Agora está liberada para conferência e assinatura do Familiar.');
                } else {
                  alert('Evolução salva como rascunho com sucesso!');
                }
              }}
              clinicConfig={clinicConfig}
              therapists={therapists}
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
              officialEvolutions={officialEvolutions}
              clinicConfig={clinicConfig}
            />
          )}

          {(currentTab === 'admin_users' || currentTab === 'admin') && (
            <AdminUsersView
              users={usersList}
              onApproveUser={handleApproveUser}
              onRejectUser={handleRejectUser}
              onChangeRole={handleChangeRole}
              onUpdateUserPermissions={(userId, allowedTabs) => {
                setUsersList(prev => prev.map(u => u.id === userId ? { ...u, allowedTabs } : u));
                if (currentUser && currentUser.id === userId) {
                  setCurrentUser({ ...currentUser, allowedTabs });
                }
              }}
            />
          )}

          {(currentTab === 'configuracao' || currentTab === 'settings') && (
            <ConfigurationView
              clinicConfig={clinicConfig}
              onUpdateClinicConfig={(newCfg) => {
                setClinicConfig(newCfg);
                saveClinicConfigToMariaDB(newCfg);
              }}
              caregivers={caregivers}
              onUpdateCaregivers={setCaregivers}
              therapists={therapists}
              onUpdateTherapists={setTherapists}
              patients={patients}
              users={usersList}
              onApproveUser={handleApproveUser}
              onRejectUser={handleRejectUser}
              onChangeRole={handleChangeRole}
              onUpdateUserPermissions={(userId, allowedTabs) => {
                setUsersList(prev => prev.map(u => u.id === userId ? { ...u, allowedTabs } : u));
                if (currentUser && currentUser.id === userId) {
                  setCurrentUser({ ...currentUser, allowedTabs });
                }
              }}
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

        {/* Banner de Instalação PWA e Notificações */}
        <PWAInstallPrompt />
    </div>
  );
}
