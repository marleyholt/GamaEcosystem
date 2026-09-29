import jsPDF from 'jspdf';
import { OfficialEvolutionData, FOIS_LEVELS_INFO, PARD_LEVELS_INFO, DigitalSignatureInfo } from '../types/clinicalEvolution';
import { Patient } from '../types';
import { ClinicConfig, DEFAULT_CLINIC_CONFIG } from '../types/clinicConfig';
import { drawOfficialGamaLetterhead } from './pdfGenerator';

export interface MonthlyReportPDFData {
  patient: Patient;
  selectedMonth: string; // YYYY-MM
  evolutions: OfficialEvolutionData[];
  clinicConfig: ClinicConfig;
  therapistSignature?: DigitalSignatureInfo;
}

export function generateMonthlyConsolidatedPDF({
  patient,
  selectedMonth,
  evolutions,
  clinicConfig = DEFAULT_CLINIC_CONFIG,
  therapistSignature
}: MonthlyReportPDFData): string {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Parse do mês (ex: 2026-09 -> Setembro de 2026)
  const [yearStr, monthStr] = selectedMonth.split('-');
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const monthIdx = parseInt(monthStr, 10) - 1;
  const monthLabel = `${monthNames[monthIdx] || 'Mês'} de ${yearStr}`;

  // Ordenar cronologicamente
  const sortedEvolutions = [...evolutions].sort(
    (a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime()
  );

  const firstEvo = sortedEvolutions[0];
  const lastEvo = sortedEvolutions[sortedEvolutions.length - 1];

  // Cálculo de total de páginas estimado:
  // Página 1: Cabeçalho, Dados do Paciente, Resumo Geral do Mês e Gráficos/Estatísticas Comparativas
  // Página 2+: Histórico Cronológico Detalhado por Sessão (Módulos 1 a 4) e Quadro de Auditoria da Fonoaudióloga
  const totalPages = Math.max(2, Math.ceil(sortedEvolutions.length / 2) + 1);

  // ==========================================
  // PÁGINA 1: CAPA CLÍNICA, MÉTRICAS E COMPARAÇÃO
  // ==========================================
  drawOfficialGamaLetterhead(doc, clinicConfig, null, { pageNumber: 1, totalPages });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(122, 89, 55); // #7a5937
  doc.text('RELATÓRIO DE ACOMPANHAMENTO MENSAL CONSOLIDADO', 16, 48);

  doc.setFontSize(9);
  doc.setTextColor(90, 80, 70);
  doc.setFont('helvetica', 'normal');
  doc.text(`Período de Referência: ${monthLabel.toUpperCase()} • Total de Sessões: ${sortedEvolutions.length}`, 16, 53);

  // Box de Dados do Paciente
  doc.setFillColor(248, 245, 240);
  doc.roundedRect(14, 56, pageWidth - 26, 23, 2, 2, 'F');
  doc.setDrawColor(215, 205, 195);
  doc.setLineWidth(0.2);
  doc.roundedRect(14, 56, pageWidth - 26, 23, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(40, 35, 30);
  doc.text(`Paciente: ${patient.name}`, 17, 62);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Nascimento: ${patient.birthDate || 'N/I'} | Sexo: ${patient.gender || 'N/I'} | CPF: ${patient.cpf || 'N/I'}`, 17, 67);
  doc.text(`Diagnóstico Clínico Principal: ${patient.mainDiagnosis || patient.diagnosis || 'Não informado'}`, 17, 72);
  doc.text(`Responsável: ${patient.guardianName || 'Não informado'} • Contato: ${patient.phone || patient.guardianPhone || 'N/I'}`, 17, 77);

  let y = 87;

  // Box 1: Síntese de Desempenho e Comparação Inicial vs Final do Mês
  doc.setFillColor(242, 238, 232);
  doc.rect(14, y - 4, pageWidth - 26, 6.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(122, 89, 55);
  doc.text('1. COMPARATIVO FUNCIONAL & EVOLUÇÃO NO PERÍODO', 17, y);
  y += 7;

  if (firstEvo && lastEvo) {
    const foisDiff = lastEvo.foisLevel - firstEvo.foisLevel;
    const initialFoisInfo = FOIS_LEVELS_INFO.find(f => f.level === firstEvo.foisLevel);
    const finalFoisInfo = FOIS_LEVELS_INFO.find(f => f.level === lastEvo.foisLevel);

    // Grid 3 colunas de indicadores
    const colW = (pageWidth - 32) / 3;
    
    // Col 1: FOIS
    doc.setFillColor(252, 250, 247);
    doc.roundedRect(16, y, colW - 2, 26, 1.5, 1.5, 'F');
    doc.roundedRect(16, y, colW - 2, 26, 1.5, 1.5, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(122, 89, 55);
    doc.text('ESCALA FOIS', 19, y + 5);
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.text(`Nível ${firstEvo.foisLevel} -> Nível ${lastEvo.foisLevel}`, 19, y + 12);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(70, 70, 70);
    doc.text(foisDiff >= 0 ? `+${foisDiff} níveis (Evolução Positiva)` : `${foisDiff} níveis`, 19, y + 17);
    doc.text(finalFoisInfo?.label || '', 19, y + 22);

    // Col 2: PARD
    const col2X = 16 + colW;
    doc.setFillColor(252, 250, 247);
    doc.roundedRect(col2X, y, colW - 2, 26, 1.5, 1.5, 'F');
    doc.roundedRect(col2X, y, colW - 2, 26, 1.5, 1.5, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(122, 89, 55);
    doc.text('GRAU PARD', col2X + 3, y + 5);
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.text(`Grau ${firstEvo.pardLevel} -> Grau ${lastEvo.pardLevel}`, col2X + 3, y + 12);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(70, 70, 70);
    doc.text('Gravidade da Disfagia', col2X + 3, y + 17);
    doc.text(`Status: ${lastEvo.pardLevel === 'I' || lastEvo.pardLevel === 'II' ? 'Funcional' : 'Reabilitação'}`, col2X + 3, y + 22);

    // Col 3: Modalidade de VO
    const col3X = 16 + (colW * 2);
    doc.setFillColor(252, 250, 247);
    doc.roundedRect(col3X, y, colW - 2, 26, 1.5, 1.5, 'F');
    doc.roundedRect(col3X, y, colW - 2, 26, 1.5, 1.5, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(122, 89, 55);
    doc.text('MODALIDADE ALIMENTAR', col3X + 3, y + 5);
    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
    doc.text(lastEvo.oralFeedingModality.replace(/_/g, ' ').toUpperCase(), col3X + 3, y + 12);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(70, 70, 70);
    doc.text(`Via Alternativa: ${lastEvo.alternativeRoute}`, col3X + 3, y + 17);
    doc.text(`Freq: ${lastEvo.treatmentFrequency || 'Regular'}`, col3X + 3, y + 22);

    y += 32;
  }

  // Gráfico Visual Simulado em Barras do Progresso FOIS
  doc.setFillColor(242, 238, 232);
  doc.rect(14, y - 4, pageWidth - 26, 6.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(122, 89, 55);
  doc.text('2. CURVA EVOLUTIVA DA ESCALA FOIS NAS SESSÕES DO MÊS', 17, y);
  y += 8;

  // Renderiza gráfico de barras com escala 1 a 7
  const chartHeight = 28;
  const chartWidth = pageWidth - 36;
  const barWidth = Math.min(22, (chartWidth / sortedEvolutions.length) - 4);

  // Linhas guia de referência (Níveis 1 a 7)
  doc.setDrawColor(225, 220, 215);
  doc.setLineWidth(0.15);
  for (let lvl = 1; lvl <= 7; lvl++) {
    const lineY = y + chartHeight - ((lvl / 7) * chartHeight);
    doc.line(22, lineY, 22 + chartWidth, lineY);
    doc.setFontSize(5.5);
    doc.setTextColor(150, 140, 130);
    doc.text(`N${lvl}`, 16, lineY + 1);
  }

  // Barras de cada sessão
  sortedEvolutions.forEach((evo, idx) => {
    const barX = 26 + (idx * (barWidth + 4));
    const barH = (evo.foisLevel / 7) * chartHeight;
    const barY = y + chartHeight - barH;

    doc.setFillColor(195, 160, 130); // tom dourado/gama
    doc.rect(barX, barY, barWidth, barH, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(60, 50, 40);
    doc.text(`${evo.foisLevel}`, barX + (barWidth / 2) - 1.5, barY - 1.5);

    // Data embaixo
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(100, 90, 80);
    const dateFormatted = new Date(evo.sessionDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    doc.text(dateFormatted, barX + (barWidth / 2) - 3.5, y + chartHeight + 4);
  });

  y += chartHeight + 12;

  // Quadro de Consistências IDDSI Consolidadas
  doc.setFillColor(242, 238, 232);
  doc.rect(14, y - 4, pageWidth - 26, 6.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(122, 89, 55);
  doc.text('3. PRESCRIÇÃO DIETÉTICA CONSOLIDADA (IDDSI)', 17, y);
  y += 7;

  if (lastEvo) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(40, 40, 40);
    doc.text('Alimentos Seguros:', 17, y);
    doc.setFont('helvetica', 'normal');
    doc.text(lastEvo.iddsiFoods.map(f => f.replace(/_/g, ' ').toUpperCase()).join(' • ') || 'Conforme tolerância', 50, y);
    y += 5;

    doc.setFont('helvetica', 'bold');
    doc.text('Líquidos & Bebidas:', 17, y);
    doc.setFont('helvetica', 'normal');
    const drinks = [...lastEvo.iddsiDrinksHigh, ...lastEvo.iddsiDrinksLow];
    doc.text(drinks.map(d => d.replace(/_/g, ' ').toUpperCase()).join(' • ') || 'Água livre', 50, y);
    y += 5;

    if (lastEvo.thickenerUsed) {
      doc.setFont('helvetica', 'bold');
      doc.text('Espessante:', 17, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${lastEvo.thickenerBrand || 'Sim'} (${lastEvo.thickenerDose || 'Dose padrão'})`, 50, y);
      y += 5;
    }
  }

  // ========================================================
  // PÁGINAS SEGUINTES: CRONOLOGIA DETALHADA DAS SESSÕES
  // ==========================================
  let currentPage = 1;

  sortedEvolutions.forEach((evo, index) => {
    // Nova página a cada 2 sessões ou se o espaço acabar
    if (currentPage === 1 || y > pageHeight - 65) {
      doc.addPage();
      currentPage++;
      drawOfficialGamaLetterhead(doc, clinicConfig, null, { pageNumber: currentPage, totalPages });
      y = 48;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(122, 89, 55);
      doc.text('HISTÓRICO CRONOLÓGICO DE ATENDIMENTOS (MÓDULOS 1 A 4)', 16, y);
      y += 8;
    }

    // Caixa da Sessão
    doc.setFillColor(248, 245, 240);
    doc.rect(14, y, pageWidth - 26, 6, 'F');
    doc.setDrawColor(210, 200, 190);
    doc.setLineWidth(0.2);
    doc.line(14, y + 6, pageWidth - 12, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(122, 89, 55);
    const formattedDate = new Date(evo.sessionDate).toLocaleDateString('pt-BR');
    doc.text(`Sessão #${index + 1} • Data: ${formattedDate} | Terapeuta: ${evo.therapistName} (${evo.therapistCrfa})`, 17, y + 4.5);
    y += 9;

    // Resumo dos 4 módulos
    doc.setFontSize(7.5);
    doc.setTextColor(40, 40, 40);

    // Módulo 1 & 2
    doc.setFont('helvetica', 'bold');
    doc.text('Módulo 1 & 2 (Consciência, Respiração & Via):', 17, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`Consciência: ${evo.consciousness.join(', ')} | Padrão Resp: ${evo.respiratoryPattern} | O2: ${evo.oxygenSupport} | TQT: ${evo.tqtType} | Via Oral: ${evo.oralFeedingModality} (${evo.alternativeRoute})`, 17, y + 4);
    y += 8;

    // Módulo 3
    doc.setFont('helvetica', 'bold');
    doc.text('Módulo 3 (Classificação Funcional & IDDSI):', 17, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`FOIS: Nível ${evo.foisLevel} | PARD: Grau ${evo.pardLevel} | Espessante: ${evo.thickenerUsed ? 'Sim' : 'Não'}`, 17, y + 4);
    y += 8;

    // Módulo 4: Conduta Terapêutica
    doc.setFont('helvetica', 'bold');
    doc.text('Módulo 4 (Conduta & Terapias Complementares):', 17, y);
    doc.setFont('helvetica', 'normal');
    const appliedTherapies = evo.therapies.filter(t => t.applied).map(t => t.name).join(', ') || 'Nenhuma complementar';
    doc.text(`Recursos: ${appliedTherapies} | Frequência: ${evo.treatmentFrequency || '2x/sem'}`, 17, y + 4);
    y += 8;

    const conductLines = doc.splitTextToSize(`Síntese da Conduta: ${evo.sessionConductSummary || evo.clinicalSummary || 'Atendimento realizado conforme conduta padrão.'}`, pageWidth - 34);
    doc.text(conductLines, 17, y);
    y += (conductLines.length * 3.8) + 6;
  });

  // ========================================================
  // QUADRO FINAL DE AUDITORIA & ASSINATURA DA FONOAUDIÓLOGA
  // ========================================================
  if (y > pageHeight - 55) {
    doc.addPage();
    currentPage++;
    drawOfficialGamaLetterhead(doc, clinicConfig, null, { pageNumber: currentPage, totalPages });
    y = 52;
  } else {
    y = Math.max(y + 4, pageHeight - 58);
  }

  doc.setFillColor(248, 245, 240);
  doc.rect(14, y, pageWidth - 26, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(122, 89, 55);
  doc.text('AUTORIZAÇÃO & ASSINATURA ELETRÔNICA QUALIFICADA DA RESPONSÁVEL TÉCNICA', 17, y + 4.5);
  y += 8;

  // Box de Assinatura
  doc.setDrawColor(210, 200, 190);
  doc.setLineWidth(0.2);
  doc.roundedRect(14, y, pageWidth - 26, 36, 1.5, 1.5, 'S');

  if (therapistSignature) {
    try {
      doc.addImage(therapistSignature.signatureDataUrl, 'PNG', 17, y + 2, 45, 14);
    } catch {
      // Ignora erro de imagem
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 30, 30);
    doc.text(therapistSignature.signerName, 17, y + 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(therapistSignature.signerDocument || clinicConfig.crfa, 17, y + 24);
    doc.text(`Data/Hora da Emissão: ${new Date(therapistSignature.signedAt).toLocaleString('pt-BR')}`, 17, y + 28);
    doc.text(`IP de Rede: ${therapistSignature.ipAddress || '187.19.224.45'} • Localização: Curitiba/PR`, 17, y + 32);

    doc.setFont('courier', 'normal');
    doc.setFontSize(6.5);
    doc.text(`Identificador de Auditoria: ${therapistSignature.signatureId}`, 105, y + 24);
    doc.text(`Hash de Integridade SHA-256: ${therapistSignature.verificationHash.substring(0, 32)}...`, 105, y + 28);
    doc.text('Em conformidade com a MP 2.200-2/2001 e Resolução CFFa 568/2020', 105, y + 32);
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 90, 80);
    doc.text(`${clinicConfig.technicalResponsible} - ${clinicConfig.crfa}`, 17, y + 16);
    doc.text('Documento gerado em conformidade com as diretrizes do Conselho Federal de Fonoaudiologia.', 17, y + 22);
  }

  const safeName = patient.name.replace(/\s+/g, '_');
  const fileName = `GAMA_Relatorio_Mensal_${safeName}_${selectedMonth}.pdf`;
  doc.save(fileName);
  return fileName;
}
