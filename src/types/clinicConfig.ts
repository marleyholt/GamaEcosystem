import { DEFAULT_OFFICIAL_LOGO_BASE64 } from '../data/defaultLogo';

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
  clinicName: '',
  subtitle: '',
  technicalResponsible: '',
  roleTitle: '',
  crfa: '',
  cpf: '',
  phoneWhatsapp: '',
  email: '',
  instagram: '',
  addressLine: '',
  logoUrl: DEFAULT_OFFICIAL_LOGO_BASE64,
  faviconUrl: '/pwa-512x512.png',
  useLetterheadByDefault: true,
  includeSignatureOnPrint: false
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

export const INITIAL_CAREGIVERS: Caregiver[] = [];

export const INITIAL_THERAPISTS: Therapist[] = [];


/**
 * Garante que a Responsável Técnica (RT) definida em ClinicConfig
 * esteja sempre presente e sincronizada na lista de Terapeutas / Fono & Equipe.
 */
export function syncTherapistsWithRT(currentTherapists: Therapist[], config: ClinicConfig): Therapist[] {
  const rtName = (config.technicalResponsible || '').trim();
  const rtEmail = (config.email || '').trim().toLowerCase();
  const rtCrfa = (config.crfa || '').trim();
  const rtCpf = (config.cpf || '').trim();
  const rtPhone = (config.phoneWhatsapp || '').trim();
  const rtInstagram = (config.instagram || '').trim();

  // Se a Responsável Técnica estiver em branco, remove registro automático residual 'th_rt' e retorna lista limpa
  if (!rtName && !rtEmail && !rtCrfa) {
    return currentTherapists.filter(t => t.id !== 'th_rt');
  }

  // Verifica se já existe um registro para a RT pelo email ou id especial ou nome
  const index = currentTherapists.findIndex(t => 
    t.id === 'th_rt' || 
    (rtEmail && t.email && t.email.trim().toLowerCase() === rtEmail) ||
    (rtName && t.name.trim().toLowerCase() === rtName.toLowerCase())
  );

  const rtTherapist: Therapist = {
    id: index >= 0 ? currentTherapists[index].id : 'th_rt',
    name: rtName || 'Responsável Técnica',
    roleTitle: config.roleTitle || 'Fonoaudióloga',
    crfa: rtCrfa || '',
    cpf: rtCpf || undefined,
    phone: rtPhone || undefined,
    email: config.email?.trim() || undefined,
    instagram: rtInstagram || undefined,
    specialty: index >= 0 ? currentTherapists[index].specialty : 'Responsável Técnica & Fonoaudiologia Clínica',
    active: true
  };

  if (index >= 0) {
    const updated = [...currentTherapists];
    updated[index] = { ...updated[index], ...rtTherapist };
    return updated;
  } else {
    return [rtTherapist, ...currentTherapists];
  }
}
