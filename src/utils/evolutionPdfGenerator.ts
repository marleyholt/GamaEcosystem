import jsPDF from 'jspdf';
import { OfficialEvolutionData, FOIS_LEVELS_INFO, PARD_LEVELS_INFO } from '../types/clinicalEvolution';
import { Patient } from '../types';
import { ClinicConfig, DEFAULT_CLINIC_CONFIG, getEffectiveTherapistProfile } from '../types/clinicConfig';
import { drawOfficialGamaLetterhead } from './pdfGenerator';

interface EvolutionReportPDFData {
  evolution: OfficialEvolutionData;
  patient: Patient;
  clinicConfig: ClinicConfig;
}

export function generateOfficialEvolutionPDF({
  evolution,
  patient,
  clinicConfig = DEFAULT_CLINIC_CONFIG
}: EvolutionReportPDFData): string {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ==========================================
  // PÁGINA 1: QUADRO CLÍNICO, CONSCIÊNCIA, RESPIRAÇÃO & VO
  // ==========================================
  drawOfficialGamaLetterhead(doc, clinicConfig, null, { pageNumber: 1, totalPages: 4 });

  // Título da Página
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(122, 89, 55); // #7a5937
  doc.text('EVOLUÇÃO CLÍNICA DE DEGLUTIÇÃO & COMUNICAÇÃO', 16, 48);

  doc.setFontSize(8.5);
  doc.setTextColor(100, 90, 80);
  doc.setFont('helvetica', 'normal');
  doc.text(`Data do Atendimento: ${new Date(evolution.sessionDate).toLocaleDateString('pt-BR')}`, 16, 53);

  // Box de Dados do Paciente
  doc.setFillColor(248, 245, 240);
  doc.roundedRect(14, 56, pageWidth - 26, 22, 2, 2, 'F');
  doc.setDrawColor(215, 205, 195);
  doc.setLineWidth(0.2);
  doc.roundedRect(14, 56, pageWidth - 26, 22, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(40, 35, 30);
  doc.text(`Paciente: ${patient.name}`, 17, 62);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Nascimento: ${patient.birthDate || 'Não informado'} | Sexo: ${patient.gender || 'Não informado'} | CPF: ${patient.cpf || 'Não informado'}`, 17, 67);
  doc.text(`Diagnóstico Principal: ${patient.mainDiagnosis || patient.diagnosis || 'Não informado'}`, 17, 72);

  let y = 85;

  // 1. Quadro Clínico Geral
  doc.setFillColor(242, 238, 232);
  doc.rect(14, y - 4, pageWidth - 26, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(122, 89, 55);
  doc.text('1. SÍNTESE DO QUADRO CLÍNICO & ESTADO GERAL', 17, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(40, 40, 40);
  const summaryLines = doc.splitTextToSize(evolution.clinicalSummary || 'Quadro clínico estável.', pageWidth - 32);
  doc.text(summaryLines, 17, y);
  y += (summaryLines.length * 4) + 4;

  // Nível de Consciência & Tomada de Decisão
  doc.setFont('helvetica', 'bold');
  doc.text('Nível de Consciência:', 17, y);
  doc.setFont('helvetica', 'normal');
  doc.text(evolution.consciousness.map(c => c.toUpperCase()).join(', ') || 'LÚCIDO', 55, y);
  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.text('Capacidade de Tomada de Decisão:', 17, y);
  doc.setFont('helvetica', 'normal');
  doc.text(evolution.canMakeDecisions ? 'SIM, PRESERVADA' : 'NÃO / COMPROMETIDA', 75, y);
  y += 8;

  // 2. Padrão Ventilatório e Via Aérea
  doc.setFillColor(242, 238, 232);
  doc.rect(14, y - 4, pageWidth - 26, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(122, 89, 55);
  doc.text('2. PADRÃO VENTILATÓRIO, VIA AÉREA & AUSCULTA CERVICAL', 17, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(40, 40, 40);
  doc.text(`• Padrão Respiratório: ${evolution.respiratoryPattern.toUpperCase()}`, 17, y);
  doc.text(`• Suporte de Oxigênio: ${evolution.oxygenSupport.toUpperCase()}`, 105, y);
  y += 4.5;
  doc.text(`• Traqueostomia: ${evolution.tqtType.toUpperCase()}`, 17, y);
  doc.text(`• Necessidade de Aspiração: ${evolution.suction.toUpperCase()}`, 105, y);
  y += 4.5;
  doc.text(`• Ausculta Cervical: ${evolution.cervicalAuscultation.toUpperCase()}`, 17, y);
  doc.text(`• Ventilação Mecânica: ${evolution.mechanicalVentilation ? 'SIM' : 'NÃO'}`, 105, y);
  y += 8;

  // 3. Alimentação Oral & Linguagem
  doc.setFillColor(242, 238, 232);
  doc.rect(14, y - 4, pageWidth - 26, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(122, 89, 55);
  doc.text('3. ALIMENTAÇÃO ORAL & ASPECTOS DE COMUNICAÇÃO', 17, y);
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(40, 40, 40);
  doc.text(`Modalidade de Via Oral: ${evolution.oralFeedingModality.replace(/_/g, ' ').toUpperCase()}`, 17, y);
  y += 4.5;
  if (evolution.oralFeedingVolumeDetails) {
    doc.setFont('helvetica', 'normal');
    doc.text(`Detalhes de Volume / Etapas: ${evolution.oralFeedingVolumeDetails}`, 17, y);
    y += 4.5;
  }
  doc.text(`Linguagem / Comunicação: ${evolution.languageAspects.join(', ') || 'Sem alteração'}`, 17, y);

  // ==========================================
  // PÁGINA 2: VIAS ALTERNATIVAS & IDDSI ALIMENTOS
  // ==========================================
  doc.addPage();
  drawOfficialGamaLetterhead(doc, clinicConfig, null, { pageNumber: 2, totalPages: 4 });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(122, 89, 55);
  doc.text('VIAS ALTERNATIVAS DE ALIMENTAÇÃO & DIETA IDDSI (ALIMENTOS)', 16, 48);

  y = 56;
  doc.setFillColor(242, 238, 232);
  doc.rect(14, y - 4, pageWidth - 26, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('1. VIA ALTERNATIVA DE ALIMENTAÇÃO (NUTRIÇÃO ENTERAL)', 17, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(40, 40, 40);
  doc.text(`Tipo de Via: ${evolution.alternativeRoute}`, 17, y);
  if (evolution.alternativeRouteCaliber) {
    doc.text(`Calibre / Modelo: ${evolution.alternativeRouteCaliber}`, 80, y);
  }
  y += 5;
  if (evolution.alternativeRouteNotes) {
    doc.text(`Observações: ${evolution.alternativeRouteNotes}`, 17, y);
    y += 5;
  }

  y += 6;
  doc.setFillColor(242, 238, 232);
  doc.rect(14, y - 4, pageWidth - 26, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(122, 89, 55);
  doc.text('2. CONSISTÊNCIAS DE ALIMENTOS LIBERADAS (PADRÃO IDDSI)', 17, y);
  y += 8;

  const allFoodLevels = [
    { id: 'nivel_7_regular', label: 'Nível 7: Regular (Normal)' },
    { id: 'nivel_6_macio_pequenos_pedacos', label: 'Nível 6: Macio e Pequenos Pedaços' },
    { id: 'nivel_5_moido_humido', label: 'Nível 5: Moído e Húmido' },
    { id: 'nivel_4_pure', label: 'Nível 4: Puré (Pastoso Homogéneo)' },
    { id: 'nivel_3_liquefeito', label: 'Nível 3: Liquefeito' }
  ];

  allFoodLevels.forEach(item => {
    const isSelected = evolution.iddsiFoods.includes(item.id as any);
    doc.setFillColor(isSelected ? 230 : 250, isSelected ? 240 : 250, isSelected ? 230 : 250);
    doc.roundedRect(17, y - 3, pageWidth - 32, 6, 1, 1, 'F');
    doc.setFont('helvetica', isSelected ? 'bold' : 'normal');
    doc.setTextColor(isSelected ? 30 : 100, isSelected ? 30 : 100, isSelected ? 30 : 100);
    doc.text(`${isSelected ? '[X]' : '[  ]'}  ${item.label}`, 20, y + 1);
    y += 7.5;
  });

  // ==========================================
  // PÁGINA 3: IDDSI LÍQUIDOS, ESPESSANTE, FOIS & PARD
  // ==========================================
  doc.addPage();
  drawOfficialGamaLetterhead(doc, clinicConfig, null, { pageNumber: 3, totalPages: 4 });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(122, 89, 55);
  doc.text('CONSISTÊNCIA DE LÍQUIDOS, CLASSIFICAÇÃO FOIS & PARD', 16, 48);

  y = 56;
  doc.setFillColor(242, 238, 232);
  doc.rect(14, y - 4, pageWidth - 26, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('1. CONSISTÊNCIA DE BEBIDAS E LÍQUIDOS (PADRÃO IDDSI)', 17, y);
  y += 7;

  const drinkLevels = [
    { id: 'nivel_4_extremamente_espesso', label: 'Nível 4: Extremamente Espesso (Pudim)' },
    { id: 'nivel_3_moderadamente_espesso', label: 'Nível 3: Moderadamente Espesso (Mel)' },
    { id: 'nivel_2_pouco_espesso', label: 'Nível 2: Pouco Espesso (Néctar)' },
    { id: 'nivel_1_ligeiramente_espesso', label: 'Nível 1: Ligeiramente Espesso' },
    { id: 'nivel_0_fino', label: 'Nível 0: Fino (Água Líquida Pura)' }
  ];

  const selectedDrinks = [...evolution.iddsiDrinksHigh, ...evolution.iddsiDrinksLow];
  drinkLevels.forEach(drink => {
    const isSelected = selectedDrinks.includes(drink.id as any);
    doc.setFillColor(isSelected ? 230 : 250, isSelected ? 240 : 250, isSelected ? 230 : 250);
    doc.roundedRect(17, y - 3, pageWidth - 32, 5.5, 1, 1, 'F');
    doc.setFont('helvetica', isSelected ? 'bold' : 'normal');
    doc.text(`${isSelected ? '[X]' : '[  ]'}  ${drink.label}`, 20, y + 1);
    y += 7;
  });

  if (evolution.thickenerUsed) {
    y += 2;
    doc.setFont('helvetica', 'bold');
    doc.text(`Espessante Prescrito: ${evolution.thickenerBrand || 'Sim'} | Diluição: ${evolution.thickenerDose || 'Padrão'}`, 17, y);
    y += 6;
  }

  y += 4;
  doc.setFillColor(242, 238, 232);
  doc.rect(14, y - 4, pageWidth - 26, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(122, 89, 55);
  doc.text('2. ESCALAS FUNCIONAIS FOIS & PARD', 17, y);
  y += 7;

  const currentFois = FOIS_LEVELS_INFO.find(f => f.level === evolution.foisLevel);
  const currentPard = PARD_LEVELS_INFO.find(p => p.level === evolution.pardLevel);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(40, 40, 40);
  doc.text(`Escala FOIS: Nível ${evolution.foisLevel} - ${currentFois?.label || ''}`, 17, y);
  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.text(currentFois?.desc || '', 17, y);
  y += 7;

  doc.setFont('helvetica', 'bold');
  doc.text(`Escala PARD: Nível ${evolution.pardLevel}`, 17, y);
  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.text(currentPard?.desc || '', 17, y);

  // ==========================================
  // PÁGINA 4: CONDUTA DA SESSÃO & AUDITORIA DE ASSINATURAS
  // ==========================================
  doc.addPage();
  drawOfficialGamaLetterhead(doc, clinicConfig, null, { pageNumber: 4, totalPages: 4 });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(122, 89, 55);
  doc.text('CONDUTA TERAPÊUTICA & REGISTRO DE ASSINATURA DIGITAL', 16, 48);

  y = 56;
  doc.setFillColor(242, 238, 232);
  doc.rect(14, y - 4, pageWidth - 26, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('1. CONDUTA CLÍNICA DETALHADA DA SESSÃO', 17, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(40, 40, 40);
  const conductLines = doc.splitTextToSize(evolution.sessionConductSummary || 'Atendimento realizado conforme plano.', pageWidth - 32);
  doc.text(conductLines, 17, y);
  y += (conductLines.length * 4) + 5;

  if (evolution.nextSessionFocus) {
    doc.setFont('helvetica', 'bold');
    doc.text('Planejamento para a Próxima Sessão:', 17, y);
    y += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.text(evolution.nextSessionFocus, 17, y);
    y += 7;
  }

  // Seção de Assinaturas Duplas Obrigatórias (Rodapé da Página 4)
  y = Math.max(y + 4, 185);

  doc.setFillColor(248, 245, 240);
  doc.rect(14, y - 4, pageWidth - 26, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(122, 89, 55);
  doc.text('2. AUDITORIA ELETRÔNICA DE ASSINATURAS QUALIFICADAS (LEI 14.063/20)', 17, y);

  // Box 1: Fonoaudióloga
  const boxWidth = (pageWidth - 32) / 2;
  const boxY = y + 5;

  doc.setDrawColor(210, 200, 190);
  doc.setLineWidth(0.2);
  doc.roundedRect(14, boxY, boxWidth - 2, 52, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(122, 89, 55);
  doc.text('FONOAUDIÓLOGA RESPONSÁVEL', 17, boxY + 5);

  if (evolution.therapistSignature) {
    try {
      doc.addImage(evolution.therapistSignature.signatureDataUrl, 'PNG', 17, boxY + 7, 45, 16);
    } catch {
      // Ignora erro de imagem
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 30, 30);
    doc.text(evolution.therapistSignature.signerName, 17, boxY + 28);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(evolution.therapistSignature.signerDocument || evolution.therapistCrfa, 17, boxY + 32);
    doc.text(`Data/Hora: ${new Date(evolution.therapistSignature.signedAt).toLocaleString('pt-BR')}`, 17, boxY + 36);
    doc.text(`IP: ${evolution.therapistSignature.ipAddress || 'Registrado'}`, 17, boxY + 40);
    doc.setFont('courier', 'normal');
    doc.setFontSize(6);
    doc.text(`Hash: ${evolution.therapistSignature.verificationHash.substring(0, 24)}...`, 17, boxY + 44);
    doc.text(`Doc ID: ${evolution.therapistSignature.signatureId}`, 17, boxY + 48);
  }

  // Box 2: Responsável / Paciente / Familiar
  const box2X = 14 + boxWidth + 2;
  doc.roundedRect(box2X, boxY, boxWidth - 2, 52, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(122, 89, 55);
  doc.text('PACIENTE / RESPONSÁVEL LEGAL', box2X + 3, boxY + 5);

  if (evolution.responsibleSignature) {
    try {
      doc.addImage(evolution.responsibleSignature.signatureDataUrl, 'PNG', box2X + 3, boxY + 7, 45, 16);
    } catch {
      // Ignora erro de imagem
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 30, 30);
    doc.text(evolution.responsibleSignature.signerName, box2X + 3, boxY + 28);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(`Doc: ${evolution.responsibleSignature.signerDocument || patient.cpf || 'Autenticado'}`, box2X + 3, boxY + 32);
    doc.text(`Data/Hora: ${new Date(evolution.responsibleSignature.signedAt).toLocaleString('pt-BR')}`, box2X + 3, boxY + 36);
    doc.text(`IP: ${evolution.responsibleSignature.ipAddress || 'Registrado'}`, box2X + 3, boxY + 40);
    doc.setFont('courier', 'normal');
    doc.setFontSize(6);
    doc.text(`Hash: ${evolution.responsibleSignature.verificationHash.substring(0, 24)}...`, box2X + 3, boxY + 44);
    doc.text(`Doc ID: ${evolution.responsibleSignature.signatureId}`, box2X + 3, boxY + 48);
  }

  const safeName = patient.name.replace(/\s+/g, '_');
  const fileName = `GAMA_Evolucao_Oficial_${safeName}_${evolution.sessionDate}.pdf`;
  doc.save(fileName);
  return fileName;
}
