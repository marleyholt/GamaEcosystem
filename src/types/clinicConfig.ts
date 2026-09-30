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
  addressLine?: string; // Endereço físico ou polo de atendimento
  logoUrl?: string; // Base64 ou URL da logomarca oficial para Relatórios e Timbrados
  faviconUrl?: string; // Base64 ou URL do Favicon e Ícone de App PWA (Navegador e Celular)
  pwaIconUrl?: string; // Ícone PWA alternativo
  signatureUrl?: string; // Rubrica / Assinatura digitalizada
  useLetterheadByDefault: boolean; // Obrigatório em todo documento
  includeSignatureOnPrint: boolean; // Permitir modelo com ou sem rubrica
}

export interface Caregiver {
  id: string;
  name: string; // Nome Completo
  cpf: string; // CPF do Cuidador
  email: string; // E-mail (MANDATÓRIO: será usado para o acesso/login ao sistema)
  address: string; // Endereço completo
  phone: string; // Telefone principal / WhatsApp
  secondaryPhone?: string; // Segunda opção de número para contato (OPCIONAL)
  registrationNumber?: string; // Número de registro do conselho/órgão (OPCIONAL)
  kinshipOrRole: string; // Ex: Mãe, Pai, Cuidador Formal, Enfermeiro
  assignedPatientIds: string[];
  notes?: string;
}

export interface Therapist {
  id: string;
  name: string;
  crfa: string;
  cpf?: string;
  phone?: string;
  email?: string;
  roleTitle?: string;
  specialty?: string; // Ex: Disfagia, Motricidade Orofacial, Linguagem
  instagram?: string;
  addressLine?: string;
  signatureUrl?: string;
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

/**
 * Função utilitária de Herança / Fallback:
 * Retorna os dados combinados da Terapeuta com fallback automático para os dados da Clínica & Responsável Técnica.
 */
export function getEffectiveTherapistProfile(
  therapist?: Therapist | null,
  clinic: ClinicConfig = DEFAULT_CLINIC_CONFIG
): {
  name: string;
  roleTitle: string;
  crfa: string;
  cpf: string;
  phone: string;
  email: string;
  instagram: string;
  addressLine: string;
  signatureUrl?: string;
} {
  return {
    name: therapist?.name?.trim() || clinic.technicalResponsible,
    roleTitle: therapist?.roleTitle?.trim() || clinic.roleTitle || 'Fonoaudióloga',
    crfa: therapist?.crfa?.trim() || clinic.crfa,
    cpf: therapist?.cpf?.trim() || clinic.cpf,
    phone: therapist?.phone?.trim() || clinic.phoneWhatsapp,
    email: therapist?.email?.trim() || clinic.email,
    instagram: therapist?.instagram?.trim() || clinic.instagram,
    addressLine: therapist?.addressLine?.trim() || clinic.addressLine || '',
    signatureUrl: therapist?.signatureUrl?.trim() || clinic.signatureUrl
  };
}

export const INITIAL_CAREGIVERS: Caregiver[] = [
  {
    id: 'cg_1',
    name: 'Maria Helena Rocha',
    cpf: '234.567.890-12',
    email: 'mhelena.rocha@gmail.com',
    address: 'Rua das Laranjeiras, 450, Apto 302 - Laranjeiras, Rio de Janeiro - RJ',
    phone: '(21) 98765-4321',
    secondaryPhone: '(21) 2556-9900',
    registrationNumber: '',
    kinshipOrRole: 'Esposa / Cuidadora Principal',
    assignedPatientIds: ['pat_1'],
    notes: 'Acompanha todas as sessões e preparo de dietas IDDSI'
  },
  {
    id: 'cg_2',
    name: 'Carlos Alberto Mendes',
    cpf: '345.678.901-23',
    email: 'carlos.mendes@cuidado.com',
    address: 'Av. Nossa Senhora de Copacabana, 890 - Copacabana, Rio de Janeiro - RJ',
    phone: '(21) 99123-8877',
    secondaryPhone: '(21) 98844-3322',
    registrationNumber: 'COREN-RJ 145892-TE',
    kinshipOrRole: 'Cuidador Profissional (Diurno)',
    assignedPatientIds: ['pat_2'],
    notes: 'Responsável pela administração hídrica e postural'
  }
];

export const INITIAL_THERAPISTS: Therapist[] = [
  {
    id: 'th_1',
    name: 'Adriane Gama',
    roleTitle: 'Fonoaudióloga',
    crfa: 'CREFONO 9531-RJ',
    cpf: '071151437-22',
    phone: '(21) 98988-7981',
    email: 'gamafono@gamafono.com.br',
    instagram: '@gama_fonoaudiologia',
    specialty: 'Disfagia & Reabilitação Orofaríngea',
    active: true
  }
];
