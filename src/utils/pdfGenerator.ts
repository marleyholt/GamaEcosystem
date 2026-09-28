import jsPDF from 'jspdf';
import { Patient, RadiAssessment, DailyFeedingLog } from '../types';
import { ClinicConfig, DEFAULT_CLINIC_CONFIG } from '../types/clinicConfig';

interface ReportData {
  patient: Patient;
  assessment?: RadiAssessment;
  recentLogs?: DailyFeedingLog[];
  evaluatorName?: string;
  evaluatorCrfa?: string;
  reportDate: string;
  clinicNotes?: string;
  clinicConfig?: ClinicConfig;
  showSignature?: boolean;
}

/**
 * Desenha o Papel Timbrado Oficial GAMA Fonoaudiologia
 * Faixa marrom lateral esquerda, cabeçalho institucional e rodapé com WhatsApp, E-mail e Instagram
 */
export function drawOfficialGamaLetterhead(
  doc: jsPDF, 
  config: ClinicConfig = DEFAULT_CLINIC_CONFIG,
  options?: { pageNumber?: number; totalPages?: number; showSignature?: boolean }
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Faixa Lateral Marrom Esquerda Oficial (#7a5937)
  doc.setFillColor(122, 89, 55); // #7a5937
  doc.rect(0, 0, 7, pageHeight, 'F');

  // 2. Cabeçalho Oficial GAMA FONOAUDIOLOGIA
  // Monograma estilizado g°
  const logoX = pageWidth - 32;
  const logoY = 14;

  doc.setDrawColor(122, 89, 55);
  doc.setLineWidth(0.6);
  doc.circle(logoX + 4, logoY + 4, 4);
  doc.setFillColor(122, 89, 55);
  doc.circle(logoX + 7.5, logoY + 1, 1, 'F');

  doc.setTextColor(40, 35, 30);
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.text('GAMA', logoX + 4, logoY + 13, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(110, 100, 95);
  doc.text('FONOAUDIOLOGIA', logoX + 4, logoY + 16, { align: 'center' });

  // Linha separadora do cabeçalho
  doc.setDrawColor(220, 215, 210);
  doc.setLineWidth(0.3);
  doc.line(14, 25, pageWidth - 12, 25);

  // 3. Rodapé Oficial Mandatório com Contatos Oficiais
  const footerY = pageHeight - 14;
  doc.line(14, footerY - 4, pageWidth - 12, footerY - 4);

  doc.setFontSize(7.5);
  doc.setTextColor(80, 75, 70);
  doc.setFont('helvetica', 'normal');

  // Contatos exatos do PDF da cliente
  const contactText = `(21) 98988-7981   •   gamafono@gamafono.com.br   •   @gama_fonoaudiologia`;
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
    doc.text(config.technicalResponsible, pageWidth - 14, sigY, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(80, 80, 80);
    doc.text(`${config.roleTitle} • ${config.crfa}`, pageWidth - 14, sigY + 3.5, { align: 'right' });
    if (config.cpf) {
      doc.text(`CPF: ${config.cpf}`, pageWidth - 14, sigY + 7, { align: 'right' });
    }
  }
}

export function generateOfficialReportPDF(data: ReportData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const config = data.clinicConfig || DEFAULT_CLINIC_CONFIG;
  const pageWidth = doc.internal.pageSize.getWidth();

  // Aplica Papel Timbrado Oficial Obrigatório
  drawOfficialGamaLetterhead(doc, config, {
    pageNumber: 1,
    totalPages: 1,
    showSignature: data.showSignature ?? config.includeSignatureOnPrint
  });

  // Título do Laudo
  doc.setTextColor(122, 89, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('LAUDO CLÍNICO & EVOLUÇÃO FONOAUDIOLÓGICA', 14, 33);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 95, 90);
  doc.text(`Emissão: ${data.reportDate} • Responsável: ${config.technicalResponsible} (${config.crfa})`, 14, 38);

  // Bloco de Identificação do Paciente
  doc.setFillColor(248, 246, 242);
  doc.rect(14, 42, pageWidth - 26, 24, 'F');
  doc.setDrawColor(215, 205, 195);
  doc.rect(14, 42, pageWidth - 26, 24, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(40, 35, 30);
  doc.text(`Paciente: ${data.patient.name}`, 17, 48);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Data de Nascimento: ${data.patient.birthDate} | Sexo: ${data.patient.gender || 'Não informado'}`, 17, 53);
  doc.text(`Diagnóstico: ${data.patient.mainDiagnosis || data.patient.diagnosis}`, 17, 58);
  doc.text(`Responsável: ${data.patient.guardianName} • Contato: ${data.patient.phone || data.patient.guardianPhone}`, 17, 63);

  let y = 73;

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
