/**
 * Serviço completo de sincronização direta com a API REST do MariaDB / MySQL
 * Todos os dados da clínica, usuários, terapeutas, cuidadores, prontuários e logs
 * são centralizados no MariaDB.
 */

export interface MariaDBSyncData {
  clinicConfig: any | null;
  users: any[];
  therapists: any[];
  caregivers: any[];
  patients: any[];
  medicalRecords: any[];
  radi: any[];
  dailyLogs: any[];
  evolutions: any[];
}

export const checkServerHealth = async (): Promise<boolean> => {
  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      const data = await res.json();
      return data.status === 'ok';
    }
    return false;
  } catch {
    return false;
  }
};

export const fetchAllFromMariaDB = async (): Promise<MariaDBSyncData | null> => {
  try {
    const res = await fetch('/api/sync/all');
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch (err) {
    console.warn('API MariaDB em modo offline ou aguardando conexão:', err);
    return null;
  }
};

// ==========================================
// Configuração Institucional da Clínica & RT
// ==========================================
export const saveClinicConfigToMariaDB = async (config: any): Promise<boolean> => {
  try {
    const res = await fetch('/api/clinic-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return res.ok;
  } catch (err) {
    console.warn('Erro ao salvar configuração da clínica no MariaDB:', err);
    return false;
  }
};

// ==========================================
// Usuários e Acesso
// ==========================================
export const saveUserToMariaDB = async (user: any): Promise<boolean> => {
  try {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    return res.ok;
  } catch (err) {
    console.warn('Erro ao salvar usuário no MariaDB:', err);
    return false;
  }
};

export const deleteUserFromMariaDB = async (id: string): Promise<boolean> => {
  try {
    const res = await fetch(`/api/users/${id}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    console.warn('Erro ao excluir usuário no MariaDB:', err);
    return false;
  }
};

// ==========================================
// Terapeutas / Fonoaudiólogas & Equipe
// ==========================================
export const saveTherapistToMariaDB = async (therapist: any): Promise<boolean> => {
  try {
    const res = await fetch('/api/therapists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(therapist)
    });
    return res.ok;
  } catch (err) {
    console.warn('Erro ao salvar terapeuta no MariaDB:', err);
    return false;
  }
};

export const deleteTherapistFromMariaDB = async (id: string): Promise<boolean> => {
  try {
    const res = await fetch(`/api/therapists/${id}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    console.warn('Erro ao excluir terapeuta no MariaDB:', err);
    return false;
  }
};

// ==========================================
// Cuidadores
// ==========================================
export const saveCaregiverToMariaDB = async (caregiver: any): Promise<boolean> => {
  try {
    const res = await fetch('/api/caregivers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(caregiver)
    });
    return res.ok;
  } catch (err) {
    console.warn('Erro ao salvar cuidador no MariaDB:', err);
    return false;
  }
};

export const deleteCaregiverFromMariaDB = async (id: string): Promise<boolean> => {
  try {
    const res = await fetch(`/api/caregivers/${id}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    console.warn('Erro ao excluir cuidador no MariaDB:', err);
    return false;
  }
};

// ==========================================
// Pacientes, Prontuários, Avaliações e Logs
// ==========================================
export const savePatientToMariaDB = async (patient: any): Promise<boolean> => {
  try {
    const res = await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patient)
    });
    return res.ok;
  } catch (err) {
    console.warn('Erro ao salvar paciente no MariaDB:', err);
    return false;
  }
};

export const saveMedicalRecordToMariaDB = async (record: any): Promise<boolean> => {
  try {
    const res = await fetch('/api/medical-records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    return res.ok;
  } catch (err) {
    console.warn('Erro ao salvar prontuário no MariaDB:', err);
    return false;
  }
};

export const saveRadiToMariaDB = async (radi: any): Promise<boolean> => {
  try {
    const res = await fetch('/api/radi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(radi)
    });
    return res.ok;
  } catch (err) {
    console.warn('Erro ao salvar avaliação RaDI no MariaDB:', err);
    return false;
  }
};

export const saveFeedingLogToMariaDB = async (log: any): Promise<boolean> => {
  try {
    const res = await fetch('/api/feeding-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log)
    });
    return res.ok;
  } catch (err) {
    console.warn('Erro ao salvar diário de alimentação no MariaDB:', err);
    return false;
  }
};

export const saveEvolutionToMariaDB = async (evolution: any): Promise<boolean> => {
  try {
    const res = await fetch('/api/evolutions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evolution)
    });
    return res.ok;
  } catch (err) {
    console.warn('Erro ao salvar evolução no MariaDB:', err);
    return false;
  }
};

// ==========================================
// Backup & Dump do Banco MariaDB
// ==========================================
export const triggerDatabaseBackup = async (): Promise<{ success: boolean; message: string; filename?: string }> => {
  try {
    const res = await fetch('/api/admin/backup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, message: data.message || 'Backup gerado com sucesso!', filename: data.filename };
    }
    return { success: false, message: 'Falha ao acionar backup no servidor.' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Servidor indisponível para backup.' };
  }
};

export const fetchBackupList = async (): Promise<{ filename: string; size: string; createdAt: string }[]> => {
  try {
    const res = await fetch('/api/admin/backups');
    if (res.ok) {
      const data = await res.json();
      return data.backups || [];
    }
    return [];
  } catch {
    return [];
  }
};
