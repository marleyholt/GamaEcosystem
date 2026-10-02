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
import { CommercialPresentationPage } from './components/CommercialPresentationPage';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { generateOfficialReportPDF } from './utils/pdfGenerator';
import { updateBrowserFavicon } from './utils/faviconManager';
import { 
  ClinicConfig, 
  Caregiver, 
  Therapist, 
  DEFAULT_CLINIC_CONFIG, 
  INITIAL_CAREGIVERS, 
  INITIAL_THERAPISTS, 
  syncTherapistsWithRT 
} from './types/clinicConfig';
import { OfficialEvolutionData } from './types/clinicalEvolution';
import { INITIAL_OFFICIAL_EVOLUTIONS } from './data/mockEvolutions';

import { 
  fetchAllFromMariaDB, 
  savePatientToMariaDB, 
  saveMedicalRecordToMariaDB, 
  saveRadiToMariaDB, 
  saveFeedingLogToMariaDB, 
  saveEvolutionToMariaDB,
  saveClinicConfigToMariaDB,
  saveUserToMariaDB,
  saveTherapistToMariaDB,
  saveCaregiverToMariaDB
} from './services/mariaDBSync';

export default function App() {
  // Authentication State:
  // Regras estritas de segurança de sessão:
  // 1. Se a janela foi fechada e reaberta:
  //    - Se logou com "Permanecer conectado" marcado e estiver dentro dos 15 minutos: continua logado.
  //    - Se logou SEM a caixa marcada: sessionStorage foi perdido com o fechamento da aba, logo exige novo login.
  // 2. Com a janela aberta:
  //    - Marcada ou não a caixa, o usuário permanece conectado por 15 minutos antes de expirar a sessão.
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('health_deglut_user');
    if (!saved) return null;

    const isKeepConnected = localStorage.getItem('health_deglut_keep_connected') === 'true';
    const isTabSessionActive = sessionStorage.getItem('health_deglut_session_active') === 'true';

    // Se NÃO marcou a caixa e fechou a janela/aba (não tem sessionStorage), exige login
    if (!isKeepConnected && !isTabSessionActive) {
      return null;
    }

    // Calcula tempo decorrido desde o login / início da sessão
    const sessionStart = localStorage.getItem('health_deglut_session_start') || sessionStorage.getItem('health_deglut_session_start');
    if (!sessionStart) return null;

    const elapsed = Date.now() - Number(sessionStart);
    const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

    if (elapsed >= FIFTEEN_MINUTES_MS) {
      // Expirou os 15 minutos
      localStorage.removeItem('health_deglut_keep_connected');
      localStorage.removeItem('health_deglut_session_start');
      sessionStorage.removeItem('health_deglut_session_active');
      sessionStorage.removeItem('health_deglut_session_start');
      return null;
    }

    // Marca a aba atual como ativa caso tenha entrado via "permanecer conectado"
    sessionStorage.setItem('health_deglut_session_active', 'true');
    sessionStorage.setItem('health_deglut_session_start', sessionStart);

    try {
      let user: UserProfile = JSON.parse(saved);

      // Regra estrita: O nome de exibição é o nome cadastrado no usuário.
      // Usuário filipe.gama@hotmail.com ou leaog.8@gmail.com deve sempre exibir 'Filipe (DEV)'
      const isFilipeDev = 
        user.email.toLowerCase().includes('filipe.gama@hotmail.com') ||
        user.email.toLowerCase().includes('leaog.8@gmail.com');

      if (isFilipeDev) {
        user = {
          ...user,
          name: 'Filipe (DEV)',
          role: 'admin',
          allowedTabs: ['resumo', 'prontuario', 'radi', 'registro', 'historico', 'chat', 'pacientes', 'relatorios', 'configuracao']
        };
      }

      const isAdriane = 
        user.name.toLowerCase().includes('adriane gama') ||
        user.email.toLowerCase().includes('adriane') ||
        user.email.toLowerCase().includes('gamafono');

      if (isAdriane) {
        user = {
          ...user,
          role: 'admin',
          allowedTabs: ['resumo', 'prontuario', 'radi', 'registro', 'historico', 'chat', 'pacientes', 'relatorios', 'configuracao']
        };
      }
      return user;
    } catch {
      return null;
    }
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
    // Garante que filipe.gama@hotmail.com esteja sempre cadastrado e com nome 'Filipe (DEV)'
    const hasFilipe = rawList.some(u => u.email.toLowerCase().includes('filipe.gama@hotmail.com'));
    let combinedList = [...rawList];
    if (!hasFilipe) {
      combinedList.push({
        id: 'user_filipe_dev',
        name: 'Filipe (DEV)',
        email: 'filipe.gama@hotmail.com',
        role: 'admin',
        approved: true,
        crfaNumber: 'ADMIN-DEV',
        allowedTabs: ['resumo', 'prontuario', 'radi', 'registro', 'historico', 'chat', 'pacientes', 'relatorios', 'configuracao'],
        createdAt: new Date().toISOString()
      });
    }

    return combinedList.map(u => {
      const isFilipe = 
        u.email.toLowerCase().includes('filipe.gama@hotmail.com') ||
        u.email.toLowerCase().includes('leaog.8@gmail.com');
      if (isFilipe) {
        return {
          ...u,
          name: 'Filipe (DEV)',
          role: 'admin',
          allowedTabs: ['resumo', 'prontuario', 'radi', 'registro', 'historico', 'chat', 'pacientes', 'relatorios', 'configuracao']
        };
      }

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
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const resolvedLogo = (parsed.logoUrl && parsed.logoUrl !== '/logo-gama.png' && parsed.logoUrl.trim() !== '') 
          ? parsed.logoUrl 
          : '/assets/logo.png';
        const resolvedFavicon = (parsed.faviconUrl && parsed.faviconUrl !== '/logo-gama.png' && parsed.faviconUrl.trim() !== '') 
          ? parsed.faviconUrl 
          : '/assets/logo.png';
        return {
          ...DEFAULT_CLINIC_CONFIG,
          ...parsed,
          logoUrl: resolvedLogo,
          faviconUrl: resolvedFavicon
        };
      } catch {
        return DEFAULT_CLINIC_CONFIG;
      }
    }
    return DEFAULT_CLINIC_CONFIG;
  });

  const [caregivers, setCaregivers] = useState<Caregiver[]>(() => {
    const saved = localStorage.getItem('health_deglut_caregivers');
    return saved ? JSON.parse(saved) : INITIAL_CAREGIVERS;
  });

  const [therapists, setTherapists] = useState<Therapist[]>(() => {
    const saved = localStorage.getItem('health_deglut_therapists');
    const parsed = saved ? JSON.parse(saved) : INITIAL_THERAPISTS;
    return syncTherapistsWithRT(parsed, clinicConfig);
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

  // Sincroniza dinamicamente o Favicon da aba do navegador e ícone de celular com o clinicConfig
  useEffect(() => {
    const iconSource = clinicConfig.faviconUrl || '/pwa-512x512.png';
    updateBrowserFavicon(iconSource);
  }, [clinicConfig.faviconUrl, clinicConfig.logoUrl]);

  // Auto-sincronização inicial com o MariaDB (Produção) e Firestore (Backup)
  useEffect(() => {
    // 1. Sincronização e carregamento primário via API MariaDB / MySQL
    fetchAllFromMariaDB().then(dbData => {
      if (dbData) {
        // Pacientes
        if (dbData.patients && Array.isArray(dbData.patients) && dbData.patients.length > 0) {
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

        // Terapeutas do MariaDB
        if (dbData.therapists && Array.isArray(dbData.therapists) && dbData.therapists.length > 0) {
          setTherapists(prev => {
            const synced = syncTherapistsWithRT(dbData.therapists, clinicConfig);
            localStorage.setItem('health_deglut_therapists', JSON.stringify(synced));
            return synced;
          });
        }

        // Cuidadores do MariaDB
        if (dbData.caregivers && Array.isArray(dbData.caregivers) && dbData.caregivers.length > 0) {
          setCaregivers(dbData.caregivers);
          localStorage.setItem('health_deglut_caregivers', JSON.stringify(dbData.caregivers));
        }

        // Prontuários do MariaDB
        if (dbData.medicalRecords && Array.isArray(dbData.medicalRecords) && dbData.medicalRecords.length > 0) {
          setMedicalRecords(dbData.medicalRecords);
        }

        // Usuários do MariaDB
        if (dbData.users && Array.isArray(dbData.users) && dbData.users.length > 0) {
          const mappedUsers: UserProfile[] = dbData.users.map((u: any) => ({
            id: u.id,
            email: u.email,
            name: u.name,
            role: u.role || 'fonoaudiologo',
            approved: Boolean(u.approved),
            crfaNumber: u.crfa_number || u.crfaNumber,
            patientId: u.patient_id || u.patientId,
            allowedTabs: u.allowed_tabs ? (typeof u.allowed_tabs === 'string' ? JSON.parse(u.allowed_tabs) : u.allowed_tabs) : (u.allowedTabs || undefined),
            createdAt: u.created_at || new Date().toISOString()
          }));
          setUsersList(mappedUsers);
          localStorage.setItem('health_deglut_users_list', JSON.stringify(mappedUsers));
        }

        // Configuração da Clínica & RT do MariaDB
        if (dbData.clinicConfig) {
          const cfg = dbData.clinicConfig;
          setClinicConfig(prev => {
            let rawLogo = cfg.logo_url || cfg.logoUrl;
            if (rawLogo === '/logo-gama.png' || !rawLogo || rawLogo.trim() === '') {
              rawLogo = prev.logoUrl || '/assets/logo.png';
            }
            let rawFavicon = cfg.favicon_url || cfg.faviconUrl;
            if (rawFavicon === '/logo-gama.png' || !rawFavicon || rawFavicon.trim() === '') {
              rawFavicon = prev.faviconUrl || '/assets/logo.png';
            }
            const updated: ClinicConfig = {
              ...prev,
              clinicName: cfg.clinic_name || cfg.clinicName || prev.clinicName,
              technicalResponsible: cfg.technical_manager_name || cfg.technicalResponsible || prev.technicalResponsible,
              crfa: cfg.technical_manager_crfa || cfg.crfa || prev.crfa,
              cpf: cfg.cpf || prev.cpf,
              addressLine: cfg.address || cfg.addressLine || prev.addressLine,
              phoneWhatsapp: cfg.phone || cfg.phoneWhatsapp || prev.phoneWhatsapp,
              email: cfg.email || prev.email,
              instagram: cfg.instagram || prev.instagram,
              logoUrl: rawLogo,
              faviconUrl: rawFavicon
            };
            localStorage.setItem('health_deglut_clinic_config', JSON.stringify(updated));
            return updated;
          });
        }
      }
    });
  }, []);

  // Handlers
  const handleSaveAssessment = (newAssessment: RadiAssessment) => {
    setAssessments([newAssessment, ...assessments]);
    saveRadiToMariaDB(newAssessment);
    alert('Avaliação RaDI registrada com sucesso no prontuário do paciente!');
    setCurrentTab('reports');
  };

  const handleSaveLog = (newLog: DailyFeedingLog) => {
    setDailyLogs([newLog, ...dailyLogs]);
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

  // Estado de rota para página dedicada de apresentação comercial
  const [currentHash, setCurrentHash] = useState<string>(() => window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Se a rota for #apresentacao, renderiza a Página Dedicada Comercial & Técnica
  if (currentHash === '#apresentacao') {
    return (
      <CommercialPresentationPage
        onBackToLogin={() => {
          window.location.hash = '';
          setCurrentHash('');
        }}
      />
    );
  }

  // If not authenticated, display login/register modal matching image.png
  if (!currentUser) {
    return (
      <AuthModal
        onLoginSuccess={(user) => {
          let updatedUser = { ...user };
          if (updatedUser.email.toLowerCase().includes('filipe.gama@hotmail.com') || updatedUser.email.toLowerCase().includes('leaog.8@gmail.com')) {
            updatedUser.name = 'Filipe (DEV)';
            updatedUser.role = 'admin';
            updatedUser.allowedTabs = ['resumo', 'prontuario', 'radi', 'registro', 'historico', 'chat', 'pacientes', 'relatorios', 'configuracao'];
          }
          localStorage.setItem('health_deglut_user', JSON.stringify(updatedUser));
          setCurrentUser(updatedUser);
        }}
        availableUsers={usersList}
        caregivers={caregivers}
        therapists={therapists}
        clinicConfig={clinicConfig}
      />
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-150 ${darkMode ? 'bg-[#181513] text-[#f4efe8]' : 'bg-[#f7f4ef] text-[#1c1714] theme-light'} selection:bg-[#c8a88a] selection:text-[#181513]`}>
      {/* Top Header com Botão Sanduíche e Sino de Pendências */}
      <Header
        user={currentUser}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onLogout={() => {
          localStorage.removeItem('health_deglut_user');
          localStorage.removeItem('health_deglut_keep_connected');
          localStorage.removeItem('health_deglut_session_start');
          sessionStorage.removeItem('health_deglut_session_active');
          sessionStorage.removeItem('health_deglut_session_start');
          setCurrentUser(null);
        }}
        onUpdateUser={(updated) => {
          setCurrentUser(updated);
          setUsersList(prev => prev.map(u => u.id === updated.id ? updated : u));
        }}
        onOpenSettings={() => setCurrentTab('configuracao')}
        patientsCount={patients.length}
        onOpenMenu={() => setIsMenuOpen(true)}
        patients={patients}
        officialEvolutions={officialEvolutions}
        radiAssessments={assessments}
        onNavigateToTab={(tab, patientId) => {
          if (patientId) {
            const targetPatient = patients.find(p => p.id === patientId);
            if (targetPatient) {
              setSelectedPatient(targetPatient);
            }
          }
          setCurrentTab(tab);
        }}
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
              onUpdateCaregivers={(newCgs) => {
                setCaregivers(newCgs);
                localStorage.setItem('health_deglut_caregivers', JSON.stringify(newCgs));
              }}
              therapists={therapists}
              onUpdateTherapists={(newThs) => {
                setTherapists(newThs);
                localStorage.setItem('health_deglut_therapists', JSON.stringify(newThs));
              }}
              patients={patients}
              users={usersList}
              onUpdateUsers={(newUsers) => {
                setUsersList(newUsers);
                localStorage.setItem('health_deglut_users_list', JSON.stringify(newUsers));
              }}
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
