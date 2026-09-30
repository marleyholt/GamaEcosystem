/**
 * Serviço de sincronização com a API REST do MariaDB em Produção
 * Endpoints servidos pelo Express (server_prod.cjs) em /api/*
 */

export interface MariaDBSyncData {
  patients: any[];
  medicalRecords: any[];
  radi: any[];
  dailyLogs: any[];
  evolutions: any[];
  clinicConfig: any | null;
  users: any[];
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
    console.warn('API MariaDB offline ou inacessível no momento, utilizando armazenamento local:', err);
    return null;
  }
};

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
