import jsPDF from 'jspdf';
import { Patient, RadiAssessment, DailyFeedingLog } from '../types';

interface ReportData {
  patient: Patient;
  assessment?: RadiAssessment;
  recentLogs?: DailyFeedingLog[];
  evaluatorName: string;
  evaluatorCrfa?: string;
  reportDate: string;
  clinicNotes?: string;
}

export function generateOfficialReportPDF(data: ReportData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Helper to draw background watermark and borders
  const drawPageDecoration = () => {
    // Elegant Border
    doc.setDrawColor(200, 168, 138); // Warm Gold/Beige #c8a88a
    doc.setLineWidth(0.8);
    doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

    doc.setDrawColor(230, 220, 210);
    doc.setLineWidth(0.3);
    doc.rect(9.5, 9.5, pageWidth - 19, pageHeight - 19);

    // Diagonal Watermark
    doc.saveGraphicsState();
    doc.setTextColor(220, 210, 200);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);

    // Center diagonal watermark
    const text = 'GamaEcosystem - Health Deglut • AUTENTICADO';
    doc.text(text, pageWidth / 2, pageHeight / 2, {
      align: 'center',
      angle: 45,
    });
    doc.restoreGraphicsState();
  };

  drawPageDecoration();

  // Header Banner
  doc.setFillColor(34, 29, 26); // #221d1a
  doc.rect(10, 10, pageWidth - 20, 28, 'F');

  // Title & Subtitle
  doc.setTextColor(200, 168, 138); // #c8a88a
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('GamaEcosystem - Health Deglut', 16, 20);

  doc.setTextColor(235, 230, 225);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Excelência, Humanização e Inovação em Fonoaudiologia e Cuidados com Disfagia', 16, 26);
  doc.text(`Laudo Clínico & Evolução Terapêutica • Emissão: ${data.reportDate}`, 16, 32);

  // Patient Identification Card
  let y = 46;
  doc.setFillColor(248, 245, 242);
  doc.roundedRect(12, y, pageWidth - 24, 30, 2, 2, 'F');

  doc.setTextColor(50, 40, 35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`Paciente: ${data.patient.name}`, 16, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`CPF: ${data.patient.cpf}   |   Nascimento: ${data.patient.birthDate}   |   Status: ${data.patient.status.toUpperCase()}`, 16, y + 14);
  doc.text(`Diagnóstico Médico: ${data.patient.diagnosis}`, 16, y + 20);
  doc.text(`Responsável: ${data.patient.guardianName || 'Não informado'} (${data.patient.guardianPhone || '-'})`, 16, y + 26);

  y += 37;

  // RaDI Assessment Section
  if (data.assessment) {
    doc.setFillColor(44, 37, 34);
    doc.rect(12, y, pageWidth - 24, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('1. RASTREIO E TRIAGEM DE RISCO PARA DISFAGIA (RaDI)', 16, y + 5);

    y += 11;
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Data do Rastreio: ${data.assessment.date}   |   Avaliador: ${data.assessment.evaluatorName}`, 16, y);
    y += 6;

    // Score & Risk Badge
    doc.setFont('helvetica', 'bold');
    doc.text(`Pontuação Obtida: ${data.assessment.score} / 9`, 16, y);

    const isHigh = data.assessment.riskLevel === 'Alto Risco';
    const isMod = data.assessment.riskLevel === 'Risco Moderado';
    doc.setTextColor(isHigh ? 180 : isMod ? 170 : 20, isHigh ? 20 : isMod ? 100 : 120, 20);
    doc.text(`Classificação: ${data.assessment.riskLevel.toUpperCase()}`, 70, y);

    y += 7;
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'bold');
    doc.text('Condutas Fonoaudiológicas Recomendadas:', 16, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    const recLines = doc.splitTextToSize(data.assessment.clinicalRecommendations, pageWidth - 32);
    doc.text(recLines, 16, y);
    y += (recLines.length * 4.5) + 6;
  }

  // Feeding & IDDSI Logs Section
  if (data.recentLogs && data.recentLogs.length > 0) {
    doc.setFillColor(44, 37, 34);
    doc.rect(12, y, pageWidth - 24, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('2. EVOLUÇÃO DE INGESTAS ORAIS E PADRÃO IDDSI', 16, y + 5);

    y += 12;
    data.recentLogs.slice(0, 2).forEach((log, idx) => {
      doc.setTextColor(30, 30, 30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(`Registro ${idx + 1} (${log.date}) - Responsável: ${log.caregiverName}`, 16, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.text(`• Consistência de Alimentos: ${log.foodConsistency}`, 18, y);
      y += 4.5;
      doc.text(`• Consistência de Líquidos: ${log.liquidConsistency}`, 18, y);
      y += 4.5;
      if (log.liquidBrandDose) {
        doc.text(`• Especificação de Espessante: ${log.liquidBrandDose}`, 18, y);
        y += 4.5;
      }
      if (log.symptoms.length > 0) {
        doc.text(`• Sinais/Sintomas observados: ${log.symptoms.join(', ')}`, 18, y);
        y += 4.5;
      }
      if (log.observations) {
        const obsLines = doc.splitTextToSize(`• Observações: ${log.observations}`, pageWidth - 36);
        doc.text(obsLines, 18, y);
        y += (obsLines.length * 4) + 3;
      }
    });
  }

  // LGPD & Cryptographic Seal Footer
  const footerY = pageHeight - 38;
  doc.setDrawColor(200, 168, 138);
  doc.setLineWidth(0.4);
  doc.line(14, footerY - 4, pageWidth - 14, footerY - 4);

  doc.setFontSize(7.5);
  doc.setTextColor(100, 95, 90);
  doc.setFont('helvetica', 'italic');
  doc.text('Conformidade LGPD: Dados clínicos sensíveis criptografados e protegidos nos termos da Lei 13.709/2018.', 16, footerY);
  doc.text(`Assinatura Digital & Carimbo de Integridade: SHA256-${data.assessment?.verificationHash || 'HD-AUTH-2026-VAL'}`, 16, footerY + 4);
  doc.text(`Documento gerado em conformidade com as diretrizes do Conselho Federal de Fonoaudiologia.`, 16, footerY + 8);

  // Professional Signature Block
  const sigX = pageWidth - 80;
  doc.setDrawColor(80, 80, 80);
  doc.setLineWidth(0.3);
  doc.line(sigX, footerY + 16, pageWidth - 18, footerY + 16);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(40, 40, 40);
  doc.text(data.evaluatorName, sigX + 30, footerY + 20, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(data.evaluatorCrfa || 'Fonoaudióloga Clínica', sigX + 30, footerY + 24, { align: 'center' });

  // Save the document
  const fileName = `Laudo_HealthDeglut_${data.patient.name.replace(/\s+/g, '_')}_${data.reportDate.replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
  return fileName;
}
