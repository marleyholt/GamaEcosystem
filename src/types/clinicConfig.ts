export interface ClinicConfig {
  clinicName: string;
  subtitle: string;
  technicalResponsible: string; // Adriane Gama
  roleTitle: string; // Fonoaudióloga
  crfa: string; // CREFONO 9531-RJ
  cpf: string; // 071151437-22
  phoneWhatsapp: string; // (21) 98988-7981
  email: string; // gamafono@gamafono.com.br
  instagram: string; // @gama_fonoaudiologia
  addressLine?: string; // Endereço físico ou atendimento domiciliar
  logoUrl?: string; // Data URL ou caminho da logo
  signatureUrl?: string; // Rubrica / Assinatura digitalizada
  useLetterheadByDefault: boolean; // Obrigatório em todo documento
  includeSignatureOnPrint: boolean; // Permitir modelo com ou sem rubrica
}

export interface Caregiver {
  id: string;
  name: string;
  phone: string;
  email?: string;
  kinshipOrRole: string; // Ex: Mãe, Pai, Cuidador Formal, Enfermeiro
  assignedPatientIds: string[];
  notes?: string;
}

export interface Therapist {
  id: string;
  name: string;
  crfa: string;
  cpf?: string;
  phone: string;
  email: string;
  specialty: string; // Ex: Disfagia, Motricidade Orofacial, Linguagem
  active: boolean;
}

export const DEFAULT_CLINIC_CONFIG: ClinicConfig = {
  clinicName: 'GAMA FONOAUDIOLOGIA',
  subtitle: 'Excelência em Fonoaudiologia & Deglutição',
  technicalResponsible: 'Adriane Gama',
  roleTitle: 'Fonoaudióloga',
  crfa: 'CREFONO 9531-RJ',
  cpf: '071151437-22',
  phoneWhatsapp: '(21) 98988-7981',
  email: 'gamafono@gamafono.com.br',
  instagram: '@gama_fonoaudiologia',
  addressLine: 'Rio de Janeiro - RJ • Atendimento Clínico e Domiciliar',
  useLetterheadByDefault: true,
  includeSignatureOnPrint: false // Modelo padrão: papel timbrado sem rubrica conforme solicitação
};

export const INITIAL_CAREGIVERS: Caregiver[] = [
  {
    id: 'cg_1',
    name: 'Maria Helena Rocha',
    phone: '(21) 98765-4321',
    email: 'mhelena.rocha@gmail.com',
    kinshipOrRole: 'Esposa / Cuidadora Principal',
    assignedPatientIds: ['pat_1'],
    notes: 'Acompanha todas as sessões e preparo de dietas IDDSI'
  },
  {
    id: 'cg_2',
    name: 'Carlos Alberto Mendes',
    phone: '(21) 99123-8877',
    email: 'carlos.mendes@cuidado.com',
    kinshipOrRole: 'Cuidador Profissional (Diurno)',
    assignedPatientIds: ['pat_2'],
    notes: 'Responsável pela administração hídrica e postural'
  }
];

export const INITIAL_THERAPISTS: Therapist[] = [
  {
    id: 'th_1',
    name: 'Adriane Gama',
    crfa: 'CREFONO 9531-RJ',
    cpf: '071151437-22',
    phone: '(21) 98988-7981',
    email: 'gamafono@gamafono.com.br',
    specialty: 'Disfagia & Reabilitação Orofaríngea',
    active: true
  }
];
