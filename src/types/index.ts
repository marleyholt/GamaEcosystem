export type UserRole = 'fonoaudiologo' | 'cuidador' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  approved: boolean;
  crfaNumber?: string;
  createdAt: string;
}

export type PatientStatus = 'ativo' | 'inativo' | 'alta';

export interface Patient {
  id: string;
  name: string;
  cpf: string;
  birthDate: string;
  phone: string;
  email: string;
  address: string;
  diagnosis: string;
  medicalHistory: string;
  currentMedications: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  fonoaudiologistId: string;
  fonoaudiologistName?: string;
  caregiverId: string;
  caregiverName?: string;
  status: PatientStatus;
  createdAt: string;
  updatedAt: string;
  lgpdConsentAccepted: boolean;
  lgpdConsentDate?: string;
}

export type RiskLevel = 'Baixo Risco' | 'Risco Moderado' | 'Alto Risco';

export interface RadiAssessment {
  id: string;
  patientId: string;
  patientName: string;
  evaluatorId: string;
  evaluatorName: string;
  evaluatorRole: string;
  date: string;
  answers: Record<number, boolean>;
  score: number;
  riskLevel: RiskLevel;
  clinicalRecommendations: string;
  createdAt: string;
  verificationHash?: string;
}

export interface IddsiLevel {
  level: number;
  name: string;
  category: 'food' | 'liquid';
  color: string;
  description: string;
}

export interface DailyFeedingLog {
  id: string;
  patientId: string;
  patientName: string;
  caregiverId: string;
  caregiverName: string;
  date: string;
  foodConsistency: string;
  foodConsistencyLevel: number;
  liquidConsistency: string;
  liquidConsistencyLevel: number;
  liquidBrandDose: string;
  symptoms: string[];
  observations: string;
  photos: MealPhoto[];
  createdAt: string;
  isEncrypted?: boolean;
}

export type MealType = 'café' | 'lanche1' | 'almoço' | 'lanche2' | 'jantar' | 'ceia' | 'suco';

export interface MealPhoto {
  id: string;
  patientId: string;
  logId?: string;
  mealType: MealType;
  photoUrl: string;
  date: string;
  notes?: string;
  uploadedAt: string;
}

export interface ChatMessage {
  id: string;
  patientId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
  encrypted: boolean;
}

export type NavigationTab = 
  | 'resumo' 
  | 'radi' 
  | 'registro' 
  | 'prontuario'
  | 'historico' 
  | 'chat' 
  | 'pacientes' 
  | 'relatorios' 
  | 'seguranca' 
  | 'admin'
  | 'dashboard'
  | 'medical_records'
  | 'feeding_log'
  | 'history'
  | 'patients'
  | 'reports'
  | 'security'
  | 'admin_users';

export type FeedingRoute = 'VO_exclusiva' | 'SNE' | 'GTT' | 'VO_mista';

export interface OfaAssessment {
  lipSeal: 'adequado' | 'inadequado' | 'ausente';
  tongueMobility: 'preservada' | 'reduzida' | 'desvio';
  tongueStrength: 'adequado' | 'hipotonico' | 'espastico';
  laryngealElevation: 'adequada' | 'reduzida' | 'ausente';
  cervicalAuscultation: 'limpa' | 'estertorosa' | 'estridor';
  wetVoice: boolean;
  swallowingReflex: 'imediato' | 'atrasado' | 'ausente';
  coughReflex: 'eficaz' | 'fraco' | 'ausente';
  dentoFacialStatus: string;
}

export interface TherapeuticObjective {
  id: string;
  term: 'curto_prazo' | 'medio_prazo' | 'longo_prazo';
  description: string;
  status: 'em_andamento' | 'atingido' | 'ajustado';
  targetDate: string;
}

export interface TreatmentPlan {
  frequency: string;
  posturalManeuvers: string[];
  deglutitionManeuvers: string[];
  myofunctionalExercises: string[];
  sensoryStrategies: string[];
  dietaryPrescription: string;
  liquidThickening: string;
  caregiverGuidelines: string;
}

export interface ClinicalSessionNote {
  id: string;
  patientId: string;
  sessionNumber: number;
  date: string;
  therapistName: string;
  therapistCrfa: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  currentFois: number;
  symptomsObserved: string[];
  verificationSeal: string;
  createdAt: string;
}

export interface PatientMedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  feedingRoute: FeedingRoute;
  primaryComplaint: string;
  pastMedicalHistory: string;
  oralHygieneDentition: string;
  baselineFois: number;
  currentFois: number;
  ofaAssessment: OfaAssessment;
  treatmentPlan: TreatmentPlan;
  objectives: TherapeuticObjective[];
  sessions: ClinicalSessionNote[];
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  userRole: string;
  patientId?: string;
  patientName?: string;
  timestamp: string;
  ipAddress?: string;
  details: string;
}
