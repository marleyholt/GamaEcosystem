import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Patient, RadiAssessment, DailyFeedingLog, PatientMedicalRecord, UserProfile } from '../types';
import { Caregiver, Therapist, ClinicConfig } from '../types/clinicConfig';
import { OfficialEvolutionData } from '../types/clinicalEvolution';

export const FirestoreCollections = {
  PATIENTS: 'patients',
  CAREGIVERS: 'caregivers',
  THERAPISTS: 'therapists',
  EVOLUTIONS: 'evolutions',
  ASSESSMENTS: 'assessments',
  DAILY_LOGS: 'daily_logs',
  MEDICAL_RECORDS: 'medical_records',
  CLINIC_CONFIG: 'clinic_config',
  USERS: 'users'
};

// Sincronizar documento individual
export async function syncDocToFirestore(collectionName: string, id: string, data: any) {
  try {
    const docRef = doc(db, collectionName, id);
    await setDoc(docRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (error) {
    console.warn(`[Firestore] Falha ao persistir em ${collectionName}/${id}:`, error);
    return false;
  }
}

// Remover documento
export async function removeDocFromFirestore(collectionName: string, id: string) {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.warn(`[Firestore] Falha ao remover ${collectionName}/${id}:`, error);
    return false;
  }
}

// Carregar coleção completa do Firestore
export async function fetchCollectionFromFirestore<T>(collectionName: string): Promise<T[]> {
  try {
    const snap = await getDocs(collection(db, collectionName));
    const items: T[] = [];
    snap.forEach(d => {
      items.push(d.data() as T);
    });
    return items;
  } catch (error) {
    console.warn(`[Firestore] Não foi possível ler coleção ${collectionName}:`, error);
    return [];
  }
}

// Fazer Upload em Lote de todos os dados locais para o Firestore
export async function backupAllLocalToFirestore({
  patients,
  caregivers,
  therapists,
  evolutions,
  assessments,
  dailyLogs,
  medicalRecords,
  clinicConfig,
  users
}: {
  patients: Patient[];
  caregivers: Caregiver[];
  therapists: Therapist[];
  evolutions: OfficialEvolutionData[];
  assessments: RadiAssessment[];
  dailyLogs: DailyFeedingLog[];
  medicalRecords: PatientMedicalRecord[];
  clinicConfig: ClinicConfig;
  users: UserProfile[];
}) {
  let count = 0;

  // Pacientes
  for (const p of patients) {
    await syncDocToFirestore(FirestoreCollections.PATIENTS, p.id, p);
    count++;
  }

  // Cuidadores
  for (const c of caregivers) {
    await syncDocToFirestore(FirestoreCollections.CAREGIVERS, c.id, c);
    count++;
  }

  // Terapeutas
  for (const t of therapists) {
    await syncDocToFirestore(FirestoreCollections.THERAPISTS, t.id, t);
    count++;
  }

  // Evoluções
  for (const e of evolutions) {
    await syncDocToFirestore(FirestoreCollections.EVOLUTIONS, e.id, e);
    count++;
  }

  // Avaliações Radi
  for (const a of assessments) {
    await syncDocToFirestore(FirestoreCollections.ASSESSMENTS, a.id, a);
    count++;
  }

  // Logs Diários
  for (const l of dailyLogs) {
    await syncDocToFirestore(FirestoreCollections.DAILY_LOGS, l.id, l);
    count++;
  }

  // Prontuários
  for (const m of medicalRecords) {
    await syncDocToFirestore(FirestoreCollections.MEDICAL_RECORDS, m.id, m);
    count++;
  }

  // Configuração da Clínica
  await syncDocToFirestore(FirestoreCollections.CLINIC_CONFIG, 'global_settings', clinicConfig);
  count++;

  // Usuários
  for (const u of users) {
    await syncDocToFirestore(FirestoreCollections.USERS, u.id, u);
    count++;
  }

  return count;
}
