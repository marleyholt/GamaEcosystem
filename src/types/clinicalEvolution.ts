export type ConsciousnessLevel = 
  | 'lucido' 
  | 'orientado' 
  | 'desorientado' 
  | 'sonolento' 
  | 'acordado' 
  | 'torporoso' 
  | 'coma';

export type OxygenSupport = 
  | 'ar_ambiente' 
  | 'cateter_nasal' 
  | 'mascara_venturi' 
  | 'concentrador' 
  | 'cilindro' 
  | 'macronebulizacao';

export type TqtType = 
  | 'nenhuma' 
  | 'plastica' 
  | 'metalica' 
  | 'fenestrada' 
  | 'com_cuff' 
  | 'desinsuflada' 
  | 'valvula_fala';

export type SuctionType = 'ausente' | 'vas' | 'traqueal' | 'ambas';
export type CervicalAuscultation = 'limpa' | 'ruidosa' | 'estertorosa' | 'estridor';

export type LanguageAspect = 'compreensao_preservada' | 'compreensao_alterada' | 'expressao_preservada' | 'expressao_alterada';
export type CommunicationDiagnosis = 'sem_alteracao' | 'afasia' | 'disartria' | 'disfonia' | 'apraxia';

export type OralFeedingModality = 
  | 'vo_plena' 
  | 'estimulo_gustativo' // < 30ml
  | 'dieta_prova' // 30 a 50ml
  | 'vo_conforto' // até 100ml
  | 'vo_parcial'; // com etapas e volume

export type AlternativeRoute = 'nenhuma' | 'CNE' | 'GTT' | 'COG' | 'JTT';

export type IddsiFoodLevel = 
  | 'nivel_7_regular'
  | 'nivel_6_macio_pequenos_pedacos'
  | 'nivel_5_moido_humido'
  | 'nivel_4_pure'
  | 'nivel_3_liquefeito';

export type IddsiDrinkLevel = 
  | 'nivel_4_extremamente_espesso'
  | 'nivel_3_moderadamente_espesso'
  | 'nivel_2_pouco_espesso'
  | 'nivel_1_ligeiramente_espesso'
  | 'nivel_0_fino';

export interface ComplementaryTherapy {
  name: 'eletroestimulacao' | 'laser' | 'neuromodulacao' | 'bandagem' | 'outra';
  applied: boolean;
  objective?: string;
  techniqueOrParams?: string; // ex: 100Hz, 4J/ponto, tDCS anódica, corte em I
}

export type EvolutionApprovalStatus = 
  | 'rascunho' 
  | 'aguardando_familiar' // Terapeuta assinou, aguarda paciente/responsável
  | 'finalizado_assinado'; // Ambos assinaram -> PDF Liberado

export interface DigitalSignatureInfo {
  signatureId: string; // ex: GAMA-SIG-9F8A2B1C-2026
  signerName: string;
  signerRole: 'fonoaudiologo' | 'cuidador' | 'familiar' | 'paciente' | 'admin';
  signerDocument?: string; // CRFa ou CPF
  signerEmail?: string;
  signedAt: string; // ISO 8601 string
  ipAddress?: string; // IP público capturado
  location?: string; // Local / Cidade / Geolocalização
  userAgent?: string; // Navegador / Dispositivo do signatário
  signatureDataUrl: string; // Imagem em Base64 do traço ou rubrica oficial
  verificationHash: string; // Hash SHA-256 de validação do documento
}

export interface OfficialEvolutionData {
  id: string;
  patientId: string;
  sessionDate: string; // YYYY-MM-DD
  therapistId: string;
  therapistName: string;
  therapistCrfa: string;

  // Fluxo de Assinatura & Rastreabilidade Clínica
  status: EvolutionApprovalStatus;
  therapistSignature?: DigitalSignatureInfo;
  responsibleSignature?: DigitalSignatureInfo;
  pdfGeneratedAt?: string;

  // --- PÁGINA 1: QUADRO CLÍNICO, CONSCIÊNCIA, RESPIRAÇÃO, COMUNICAÇÃO & ALIMENTAÇÃO ORAL ---
  clinicalSummary: string; // Síntese do quadro clínico
  consciousness: ConsciousnessLevel[];
  canMakeDecisions: boolean;
  decisionNotes?: string;

  // Padrão Ventilatório & Oxigênio
  respiratoryPattern: 'eupneico' | 'taquipneico' | 'dispneico' | 'outro';
  oxygenSupport: OxygenSupport;
  oxygenFlowLiters?: string; // ex: 2L/min
  tqtType: TqtType;
  tqtCaliber?: string; // ex: 7.5, 8.0
  suction: SuctionType;
  mechanicalVentilation: boolean;
  mechanicalVentilationMode?: string;
  cervicalAuscultation: CervicalAuscultation;

  // Linguagem & Comunicação
  languageAspects: LanguageAspect[];
  communicationDiagnosis: CommunicationDiagnosis[];
  communicationNotes?: string;

  // Alimentação Oral
  oralFeedingModality: OralFeedingModality;
  oralFeedingVolumeDetails?: string; // etapas/dia e volume (ex: 3 etapas de 80ml)

  // --- PÁGINA 2: VIAS ALTERNATIVAS & IDDSI (ALIMENTOS E BEBIDAS ESPESSAS) ---
  alternativeRoute: AlternativeRoute;
  alternativeRouteCaliber?: string;
  alternativeRouteNotes?: string;

  iddsiFoods: IddsiFoodLevel[];
  iddsiDrinksHigh: IddsiDrinkLevel[]; // Níveis 4, 3, 2

  // --- PÁGINA 3: IDDSI LÍQUIDOS FINOS, ESPESSANTE, FOIS & PARD ---
  iddsiDrinksLow: IddsiDrinkLevel[]; // Níveis 1, 0
  thickenerUsed: boolean;
  thickenerBrand?: string;
  thickenerDose?: string; // ex: 2 medidas para 100ml

  foisLevel: number; // 1 a 7
  foisJustification?: string;
  pardLevel: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'VII';
  pardDescription?: string;

  // --- PÁGINA 4: TERAPIAS COMPLEMENTARES, PLANO E CONDUTA DA SESSÃO ---
  therapies: ComplementaryTherapy[];
  treatmentFrequency: string; // ex: 2x por semana
  sessionConductSummary: string; // Síntese da conduta clínica da sessão (longa)
  nextSessionFocus?: string;

  createdAt: string;
}

export const FOIS_LEVELS_INFO = [
  { level: 1, label: 'Nível 1', desc: 'Nada por via oral (exclusivamente via alternativa).' },
  { level: 2, label: 'Nível 2', desc: 'Dependente de via alternativa com mínima ingestão oral de alimentos/líquidos.' },
  { level: 3, label: 'Nível 3', desc: 'Dependente de via alternativa com ingestão oral consistente de alimentos/líquidos.' },
  { level: 4, label: 'Nível 4', desc: 'Via oral total de uma única consistência.' },
  { level: 5, label: 'Nível 5', desc: 'Via oral total com múltiplas consistências, mas necessitando de preparo especial ou compensações.' },
  { level: 6, label: 'Nível 6', desc: 'Via oral total com múltiplas consistências, sem preparo especial, porém com restrições alimentares específicas.' },
  { level: 7, label: 'Nível 7', desc: 'Via oral total sem qualquer restrição alimentar.' },
];

export const PARD_LEVELS_INFO = [
  { level: 'I', desc: 'Deglutição Normal: Eficácia e segurança preservadas.' },
  { level: 'II', desc: 'Deglutição Funcional: Pequenas compensações espontâneas sem sinais de aspiração.' },
  { level: 'III', desc: 'Disfagia Leve: Estase leve ou atraso discreto, tosse protetora eficaz.' },
  { level: 'IV', desc: 'Disfagia Leve a Moderada: Estase moderada, penetração laríngea com limpeza parcial.' },
  { level: 'V', desc: 'Disfagia Moderada: Penetração ou aspiração com reflexo de tosse reduzido.' },
  { level: 'VI', desc: 'Disfagia Moderada a Grave: Aspiração evidente sem tosse eficaz em uma ou mais consistências.' },
  { level: 'VII', desc: 'Disfagia Grave: Aspiração maciça e silenciosa, via oral totalmente contraindicada.' },
];
