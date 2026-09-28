import { OfficialEvolutionData } from '../types/clinicalEvolution';

export const INITIAL_OFFICIAL_EVOLUTIONS: OfficialEvolutionData[] = [
  {
    id: 'evo_pat1_1',
    patientId: 'pat_1',
    sessionDate: '2026-09-15',
    therapistId: 'th_1',
    therapistName: 'Adriane Gama',
    therapistCrfa: 'CREFONO 9531-RJ',
    clinicalSummary: 'Paciente em reabilitação de disfagia orofaríngea neurogênica pós-AVC isquêmico. Apresenta melhora gradual do tônus labial e controle de saliva em repouso.',
    consciousness: ['lucido', 'orientado'],
    canMakeDecisions: true,
    decisionNotes: 'Compreende comandos complexos e expressa desejos alimentares verbalmente.',
    respiratoryPattern: 'eupneico',
    oxygenSupport: 'ar_ambiente',
    tqtType: 'nenhuma',
    suction: 'ausente',
    mechanicalVentilation: false,
    cervicalAuscultation: 'limpa',
    languageAspects: ['compreensao_preservada', 'expressao_preservada'],
    communicationDiagnosis: ['sem_alteracao'],
    oralFeedingModality: 'vo_conforto',
    oralFeedingVolumeDetails: '3 etapas diárias de 80ml supervisionadas',
    alternativeRoute: 'GTT',
    alternativeRouteCaliber: 'Mic-Key 18 Fr',
    alternativeRouteNotes: 'Via alternativa principal para aporte calórico e hídrico.',
    iddsiFoods: ['nivel_4_pure', 'nivel_5_moido_humido'],
    iddsiDrinksHigh: ['nivel_3_moderadamente_espesso'],
    iddsiDrinksLow: ['nivel_2_pouco_espesso'],
    thickenerUsed: true,
    thickenerBrand: 'Resource ThickenUp Clear',
    thickenerDose: '2 medidas para cada 100ml de água/chá',
    foisLevel: 4,
    foisJustification: 'Via oral total de consistência pastosa homogênea complementar à GTT.',
    pardLevel: 'IV',
    pardDescription: 'Disfagia Leve a Moderada com necessidade de supervisão contínua.',
    therapies: [
      {
        name: 'laser',
        applied: true,
        objective: 'Bioestimulação de masseter e supra-hióideos',
        techniqueOrParams: 'Laser infravermelho 808nm, 3J por ponto bilateral'
      },
      {
        name: 'bandagem',
        applied: true,
        objective: 'Facilitação de elevação hiolaríngea',
        techniqueOrParams: 'Corte em Y com tensão de 25% na região supra-hióidea'
      }
    ],
    treatmentFrequency: '2x por semana',
    sessionConductSummary: 'Realizado treino miofuncional orofacial com manobra de Mendelsohn e deglutições com esforço para propulsão faríngea. Testada oferta de purê espesso com boa aceitação, sem tosse ou estase evidente. Manutenção de GTT e estímulo oral progressivo.',
    nextSessionFocus: 'Evolução de consistência para sólidos macios e reavaliação de reflexo de tosse com líquidos pouco espessos.',
    createdAt: '2026-09-15T10:30:00Z'
  },
  {
    id: 'evo_pat1_2',
    patientId: 'pat_1',
    sessionDate: '2026-09-22',
    therapistId: 'th_1',
    therapistName: 'Adriane Gama',
    therapistCrfa: 'CREFONO 9531-RJ',
    clinicalSummary: 'Seguimento domiciliar. Paciente responsivo, comunicativo e colaborativo com o plano terapêutico alimentar.',
    consciousness: ['lucido', 'orientado'],
    canMakeDecisions: true,
    respiratoryPattern: 'eupneico',
    oxygenSupport: 'ar_ambiente',
    tqtType: 'nenhuma',
    suction: 'ausente',
    mechanicalVentilation: false,
    cervicalAuscultation: 'limpa',
    languageAspects: ['compreensao_preservada', 'expressao_preservada'],
    communicationDiagnosis: ['sem_alteracao'],
    oralFeedingModality: 'vo_parcial',
    oralFeedingVolumeDetails: 'Almoço e lanche via oral completa (200g); hidratação mista',
    alternativeRoute: 'GTT',
    alternativeRouteCaliber: 'Mic-Key 18 Fr',
    alternativeRouteNotes: 'Utilizada apenas para hidratação noturna e medicações.',
    iddsiFoods: ['nivel_5_moido_humido', 'nivel_6_macio_pequenos_pedacos'],
    iddsiDrinksHigh: ['nivel_2_pouco_espesso'],
    iddsiDrinksLow: ['nivel_1_ligeiramente_espesso'],
    thickenerUsed: true,
    thickenerBrand: 'Resource ThickenUp Clear',
    thickenerDose: '1 medida para 100ml',
    foisLevel: 5,
    foisJustification: 'Via oral com múltiplas consistências sob compensação postural.',
    pardLevel: 'III',
    pardDescription: 'Disfagia Leve em fase de transição para desmame de GTT.',
    therapies: [
      {
        name: 'laser',
        applied: true,
        objective: 'Tonificação de musculatura extrínseca da laringe',
        techniqueOrParams: '808nm 4J/ponto'
      },
      {
        name: 'eletroestimulacao',
        applied: true,
        objective: 'Fortalecimento de assoalho de boca',
        techniqueOrParams: 'FES simétrica bifásica 80Hz, 300us, ciclo 5s ON / 10s OFF'
      }
    ],
    treatmentFrequency: '2x por semana',
    sessionConductSummary: 'Oferta de consistência IDDSI 6 (legumes cozidos bem macios cortados em cubos de 1cm). Mastigação eficiente bilateral, sem escape anterior ou pigarro. Ausculta cervical limpa imediatamente após a ingestão de 150ml de água levemente espessada (IDDSI 1). Orientada família quanto à postura ereta por 30 minutos pós-prandial.',
    nextSessionFocus: 'Planejamento de desmame final da gastrostomia junto à equipe médica.',
    createdAt: '2026-09-22T11:00:00Z'
  }
];
