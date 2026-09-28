import jsPDF from 'jspdf';
import { Patient, RadiAssessment, DailyFeedingLog } from '../types';
import { ClinicConfig, DEFAULT_CLINIC_CONFIG, Therapist, getEffectiveTherapistProfile } from '../types/clinicConfig';

interface ReportData {
  patient: Patient;
  assessment?: RadiAssessment;
  recentLogs?: DailyFeedingLog[];
  evaluatorName?: string;
  evaluatorCrfa?: string;
  reportDate: string;
  clinicNotes?: string;
  clinicConfig?: ClinicConfig;
  therapist?: Therapist | null;
  showSignature?: boolean;
}

/**
 * Desenha o Papel Timbrado Oficial GAMA Fonoaudiologia
 * Faixa marrom lateral esquerda, cabeçalho institucional e rodapé com WhatsApp, E-mail e Instagram
 * Suporta logomarca personalizada via upload ou monograma oficial g° em escala nobre proporcional
 */
export function drawOfficialGamaLetterhead(
  doc: jsPDF, 
  config: ClinicConfig = DEFAULT_CLINIC_CONFIG,
  therapist?: Therapist | null,
  options?: { pageNumber?: number; totalPages?: number; showSignature?: boolean }
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const profile = getEffectiveTherapistProfile(therapist, config);

  // 1. Faixa Lateral Marrom Esquerda Oficial (#7a5937)
  doc.setFillColor(122, 89, 55); // #7a5937
  doc.rect(0, 0, 7, pageHeight, 'F');

  // 2. Cabeçalho Oficial GAMA FONOAUDIOLOGIA / Logomarca com o DOBRO do Tamanho
  const logoWidth = 72;
  const logoHeight = 32;
  const logoX = pageWidth - logoWidth - 12;
  const logoY = 6;

  if (config.logoUrl && config.logoUrl.startsWith('data:image')) {
    try {
      // Adiciona imagem customizada proporcional via base64 com dimensões dobradas
      doc.addImage(config.logoUrl, 'PNG', logoX, logoY, logoWidth, logoHeight);
    } catch {
      renderDefaultMonogram(doc, pageWidth - 55, 8);
    }
  } else {
    renderDefaultMonogram(doc, pageWidth - 55, 8);
  }

  // Linha separadora do cabeçalho rebaixada para acomodar o dobro da logo
  doc.setDrawColor(220, 215, 210);
  doc.setLineWidth(0.3);
  doc.line(14, 40, pageWidth - 12, 40);

  // 3. Rodapé Oficial Mandatório com Contatos Efetivos (Terapeuta ou Clínica RT)
  const footerY = pageHeight - 14;
  doc.line(14, footerY - 4, pageWidth - 12, footerY - 4);

  doc.setFontSize(7.5);
  doc.setTextColor(80, 75, 70);
  doc.setFont('helvetica', 'normal');

  const contactText = `${profile.phone}   •   ${profile.email}   •   ${profile.instagram}`;
  doc.text(contactText, 14, footerY);

  if (options?.pageNumber) {
    const pageStr = options.totalPages 
      ? `Pág. ${options.pageNumber} de ${options.totalPages}` 
      : `Pág. ${options.pageNumber}`;
    doc.text(pageStr, pageWidth - 14, footerY, { align: 'right' });
  }

  // 4. Bloco de Assinatura se solicitado
  if (options?.showSignature) {
    const sigY = footerY - 14;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 30, 30);
    doc.text(profile.name, pageWidth - 14, sigY, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(80, 80, 80);
    doc.text(`${profile.roleTitle} • ${profile.crfa}`, pageWidth - 14, sigY + 3.5, { align: 'right' });
    if (profile.cpf) {
      doc.text(`CPF: ${profile.cpf}`, pageWidth - 14, sigY + 7, { align: 'right' });
    }
  }
}

function renderDefaultMonogram(doc: jsPDF, logoX: number, logoY: number) {
  // Monograma nobre ampliado
  doc.setDrawColor(122, 89, 55);
  doc.setLineWidth(0.8);
  doc.circle(logoX + 7, logoY + 5, 5);
  doc.setFillColor(122, 89, 55);
  doc.circle(logoX + 11.2, logoY + 1.2, 1.3, 'F');

  doc.setTextColor(43, 36, 32);
  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  doc.text('GAMA', logoX + 7, logoY + 14, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(122, 89, 55);
  doc.text('FONOAUDIOLOGIA', logoX + 7, logoY + 17.5, { align: 'center' });
}

export function generateOfficialReportPDF(data: ReportData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const config = data.clinicConfig || DEFAULT_CLINIC_CONFIG;
  const pageWidth = doc.internal.pageSize.getWidth();
  const profile = getEffectiveTherapistProfile(data.therapist, config);

  // Aplica Papel Timbrado Oficial Obrigatório com Fallback de Terapeuta
  drawOfficialGamaLetterhead(doc, config, data.therapist, {
    pageNumber: 1,
    totalPages: 1,
    showSignature: data.showSignature ?? config.includeSignatureOnPrint
  });

  // Título do Laudo
  doc.setTextColor(122, 89, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('LAUDO CLÍNICO & EVOLUÇÃO FONOAUDIOLÓGICA', 14, 46);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 95, 90);
  doc.text(`Emissão: ${data.reportDate} • Fonoaudióloga: ${profile.name} (${profile.crfa})`, 14, 51);

  // Bloco de Identificação do Paciente
  doc.setFillColor(248, 246, 242);
  doc.rect(14, 55, pageWidth - 26, 24, 'F');
  doc.setDrawColor(215, 205, 195);
  doc.rect(14, 55, pageWidth - 26, 24, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(40, 35, 30);
  doc.text(`Paciente: ${data.patient.name}`, 17, 61);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Data de Nascimento: ${data.patient.birthDate} | Sexo: ${data.patient.gender || 'Não informado'}`, 17, 66);
  doc.text(`Diagnóstico: ${data.patient.mainDiagnosis || data.patient.diagnosis}`, 17, 71);
  doc.text(`Responsável: ${data.patient.guardianName} • Contato: ${data.patient.phone || data.patient.guardianPhone}`, 17, 76);

  let y = 86;

  // Avaliação de Deglutição (RaDI)
  if (data.assessment) {
    doc.setFillColor(242, 238, 232);
    doc.rect(14, y - 4, pageWidth - 26, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(122, 89, 55);
    doc.text('AVALIAÇÃO DE RISCO DE DISFAGIA (RaDI)', 17, y + 1);
    y += 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(40, 40, 40);
    doc.text(`Classificação de Risco: ${data.assessment.riskLevel} (Pontuação: ${data.assessment.score}/10)`, 17, y);
    y += 6;

    if (data.assessment.clinicalRecommendations) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const recLines = doc.splitTextToSize(`Condutas Recomendadas: ${data.assessment.clinicalRecommendations}`, pageWidth - 32);
      doc.text(recLines, 17, y);
      y += (recLines.length * 4.5) + 4;
    }
  }

  // Registros Diários e Consistências IDDSI
  if (data.recentLogs && data.recentLogs.length > 0) {
    doc.setFillColor(242, 238, 232);
    doc.rect(14, y - 4, pageWidth - 26, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(122, 89, 55);
    doc.text('ACOMPANHAMENTO DE DIETA & CONSISTÊNCIAS (IDDSI)', 17, y + 1);
    y += 9;

    data.recentLogs.slice(0, 3).forEach((log, idx) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(50, 45, 40);
      doc.text(`Sessão ${idx + 1} (${log.date}) - Responsável: ${log.caregiverName}`, 17, y);
      y += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.text(`• Alimentos: ${log.foodConsistency} | Líquidos: ${log.liquidConsistency}`, 19, y);
      y += 4;
      if (log.liquidBrandDose) {
        doc.text(`• Espessante: ${log.liquidBrandDose}`, 19, y);
        y += 4;
      }
      if (log.observations) {
        const obs = doc.splitTextToSize(`• Obs: ${log.observations}`, pageWidth - 36);
        doc.text(obs, 19, y);
        y += (obs.length * 4) + 2;
      }
    });
  }

  // Salva o documento no padrão oficial
  const safeName = data.patient.name.replace(/\s+/g, '_');
  const fileName = `GAMA_Laudo_${safeName}_${data.reportDate.replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
  return fileName;
}
