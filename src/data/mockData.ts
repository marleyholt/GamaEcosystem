import { Patient, RadiAssessment, DailyFeedingLog, MealPhoto, ChatMessage, UserProfile, IddsiLevel } from '../types';

export const IDDSI_FOOD_LEVELS: IddsiLevel[] = [
  { level: 7, name: 'Normal', category: 'food', color: '#1c1917', description: 'Alimentos cotidianos de todas as texturas' },
  { level: 7, name: 'Fácil de Mastigar', category: 'food', color: '#27272a', description: 'Alimentos normais macios e tenros' },
  { level: 6, name: 'Macio e Picado', category: 'food', color: '#2563eb', description: 'Tamanho máximo de 1.5cm para adultos, requer mastigação suave' },
  { level: 5, name: 'Moído e Úmido', category: 'food', color: '#ea580c', description: 'Partículas de 4mm, coeso e úmido, requer mastigação mínima' },
  { level: 4, name: 'Pastoso', category: 'food', color: '#15803d', description: 'Homogêneo, liso, não requer mastigação, não escorre de garfo' },
  { level: 3, name: 'Liquidificado', category: 'food', color: '#ca8a04', description: 'Pode ser bebido em copo ou com colher, textura suave sem grumos' },
];

export const IDDSI_LIQUID_LEVELS: IddsiLevel[] = [
  { level: 4, name: 'Extremamente Espessado', category: 'liquid', color: '#15803d', description: 'Consistência de pudim, consumido com colher' },
  { level: 3, name: 'Moderadamente Espessado', category: 'liquid', color: '#ca8a04', description: 'Consistência de mel, escorre lentamente de colher' },
  { level: 2, name: 'Levemente Espessado', category: 'liquid', color: '#db2777', description: 'Consistência de néctar, escorre de colher' },
  { level: 1, name: 'Muito Levemente Espessado', category: 'liquid', color: '#64748b', description: 'Mais espesso que água, flui rapidamente' },
  { level: 0, name: 'Líquido Fino', category: 'liquid', color: '#f8fafc', description: 'Água, chá, café, sucos finos sem espessante' },
];

export const RADI_QUESTIONS = [
  {
    id: 1,
    question: 'Precisa engolir muitas vezes o alimento para fazê-lo descer?',
    impact: 'Múltiplas deglutições sugerem resíduo faríngeo e baixa propulsão da base de língua.',
    weight: 1
  },
  {
    id: 2,
    question: 'Engasga ou tosse durante ou após comer/beber?',
    impact: 'Sinal cardeal de penetração laríngea ou aspiração laringotraqueal.',
    weight: 2
  },
  {
    id: 3,
    question: 'Sente dor ou desconforto ao engolir (odinofagia)?',
    impact: 'Pode indicar lesões mucosas, espasmos ou inflamações em trato aerodigestivo.',
    weight: 1
  },
  {
    id: 4,
    question: 'Tem sensação de alimento parado na garganta (estase)?',
    impact: 'Resíduo em valéculas ou recessos piriformes após o disparo da deglutição.',
    weight: 1
  },
  {
    id: 5,
    question: 'A voz fica "molhada" ou rouca após se alimentar?',
    impact: 'Presença de secreção ou alimento sobre as pregas vocais com risco de aspiração silenciosa.',
    weight: 2
  },
  {
    id: 6,
    question: 'Demora muito tempo para terminar uma refeição (mais de 45 min)?',
    impact: 'Fadiga muscular, apraxia de deglutição ou incoordenação motora oral.',
    weight: 1
  },
  {
    id: 7,
    question: 'Teve febre ou episódios de pneumonia de repetição recentemente?',
    impact: 'Forte correlação com microaspirações silenciosas crônicas.',
    weight: 2
  },
  {
    id: 8,
    question: 'Houve perda de peso involuntária ou recusa alimentar?',
    impact: 'Risco de desnutrição e desidratação associada à dificuldade de ingesta oral.',
    weight: 1
  },
  {
    id: 9,
    question: 'Escapa alimento ou saliva pela boca (escape extraoral)?',
    impact: 'Incompetência de vedamento labial e controle motor oral diminuído.',
    weight: 1
  }
];

export const SYMPTOMS_LIST = [
  { id: 'tosse', label: 'Tosse durante alimentação', emoji: '🗣️' },
  { id: 'engasgo', label: 'Engasgo', emoji: '😮' },
  { id: 'voz_molhada', label: 'Voz molhada após comer', emoji: '🗣️' },
  { id: 'degluticao_lenta', label: 'Deglutição lenta', emoji: '⏳' },
  { id: 'residuo_boca', label: 'Resíduo na boca', emoji: '👄' },
  { id: 'recusa_alimentar', label: 'Recusa alimentar', emoji: '🚫' },
  { id: 'fadiga', label: 'Fadiga durante alimentação', emoji: '🥱' },
  { id: 'perda_peso', label: 'Perda de peso', emoji: '⚖️' },
  { id: 'coriza_nasal', label: 'Coriza nasal', emoji: '👃' },
  { id: 'espirros', label: 'Espirros', emoji: '🤧' },
];

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user_adriane',
    name: 'Adriane Gama',
    email: 'adrianepaesdagama@gmail.com',
    role: 'fonoaudiologo',
    approved: true,
    crfaNumber: 'CRFa 3-12894',
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'user_zeca',
    name: 'Zeca Souza',
    email: 'zeca.cuidador@gmail.com',
    role: 'cuidador',
    approved: true,
    createdAt: '2026-02-15T14:30:00Z'
  },
  {
    id: 'user_pending',
    name: 'Dra. Camila Torres',
    email: 'camila.fono@saude.com.br',
    role: 'fonoaudiologo',
    approved: false,
    crfaNumber: 'CRFa 3-18920',
    createdAt: '2026-09-22T08:15:00Z'
  }
];

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat_1',
    name: 'Salua Cozac',
    cpf: '341.892.408-11',
    birthDate: '1947-04-18',
    phone: '(41) 98822-1049',
    email: 'familia.cozac@gmail.com',
    address: 'Rua Trinta e Quatro, 195 - Curitiba, PR',
    diagnosis: 'Doença de Alzheimer (Estágio Moderado)',
    medicalHistory: 'Hipertensão arterial controlada. Histórico de broncoaspiração leve há 4 meses. Em acompanhamento fonoaudiológico para readequação de consistência e manobras protetivas.',
    currentMedications: 'Donepezila 10mg, Memantina 10mg, Losartana 50mg',
    guardianName: 'Marcelo Cozac',
    guardianPhone: '(41) 99123-4567',
    guardianEmail: 'marcelo.cozac@gmail.com',
    fonoaudiologistId: 'user_adriane',
    fonoaudiologistName: 'Adriane Gama',
    caregiverId: 'user_zeca',
    caregiverName: 'Zeca Souza',
    status: 'ativo',
    createdAt: '2026-03-01T09:00:00Z',
    updatedAt: '2026-09-23T14:00:00Z',
    lgpdConsentAccepted: true,
    lgpdConsentDate: '2026-03-01T09:30:00Z'
  },
  {
    id: 'pat_2',
    name: 'SML',
    cpf: '012.784.992-05',
    birthDate: '1921-08-12',
    phone: '(41) 99771-0021',
    email: 'contato.sml@gmail.com',
    address: 'Av. Sete de Setembro, 4200 - Curitiba, PR',
    diagnosis: 'Demência Vascular (105 anos)',
    medicalHistory: 'Idosa centenária em cuidados domiciliares. Fadiga precoce durante as refeições. Necessidade de espessamento em nível 3 para prevenir aspiração líquida.',
    currentMedications: 'Quetiapina 25mg, Enalapril 10mg, Suplementação vitamínica',
    guardianName: 'Beatriz Leão',
    guardianPhone: '(41) 98455-8910',
    guardianEmail: 'beatriz.leao@gmail.com',
    fonoaudiologistId: 'user_adriane',
    fonoaudiologistName: 'Adriane Gama',
    caregiverId: 'user_zeca',
    caregiverName: 'Zeca Souza',
    status: 'ativo',
    createdAt: '2026-04-12T11:00:00Z',
    updatedAt: '2026-09-20T16:00:00Z',
    lgpdConsentAccepted: true,
    lgpdConsentDate: '2026-04-12T11:20:00Z'
  },
  {
    id: 'pat_3',
    name: 'Maria do Roccio Bencke Gonçalves',
    cpf: '519.330.189-72',
    birthDate: '1962-11-04',
    phone: '(41) 99654-3210',
    email: 'm.roccio@gmail.com',
    address: 'Rua Brigadeiro Franco, 1102 - Curitiba, PR',
    diagnosis: 'Demência Precoce',
    medicalHistory: 'Quadro de declínio cognitivo com apraxia de deglutição em momentos de agitação. Orientada a consistência pastosa homogênea e postura de queixo para baixo durante a deglutição.',
    currentMedications: 'Galantamina 16mg, Sertralina 50mg',
    guardianName: 'Eduardo Gonçalves',
    guardianPhone: '(41) 99881-2233',
    guardianEmail: 'eduardo.goncalves@gmail.com',
    fonoaudiologistId: 'user_adriane',
    fonoaudiologistName: 'Adriane Gama',
    caregiverId: 'user_zeca',
    caregiverName: 'Zeca Souza',
    status: 'ativo',
    createdAt: '2026-05-18T15:00:00Z',
    updatedAt: '2026-09-22T10:00:00Z',
    lgpdConsentAccepted: true,
    lgpdConsentDate: '2026-05-18T15:15:00Z'
  },
  {
    id: 'pat_4',
    name: 'TESTE - Carlos Eduardo Ferreira',
    cpf: '887.432.190-34',
    birthDate: '1959-02-14',
    phone: '(41) 99222-1100',
    email: 'carlos.eduardo@teste.com',
    address: 'Rua Desembargador Motta, 880 - Curitiba, PR',
    diagnosis: 'Disfagia Neurogênica Pós-AVC Isquêmico',
    medicalHistory: 'AVC há 6 meses com hemiparesia à direita e disfagia moderada para líquidos finos. Apresenta boa resposta com manobra de esforço e espessamento em nível 2.',
    currentMedications: 'AAS 100mg, Atorvastatina 40mg',
    guardianName: 'Regina Ferreira',
    guardianPhone: '(41) 99777-6655',
    guardianEmail: 'regina.ferreira@teste.com',
    fonoaudiologistId: 'user_adriane',
    fonoaudiologistName: 'Adriane Gama',
    caregiverId: 'user_zeca',
    caregiverName: 'Zeca Souza',
    status: 'ativo',
    createdAt: '2026-08-01T14:00:00Z',
    updatedAt: '2026-09-15T09:00:00Z',
    lgpdConsentAccepted: true,
    lgpdConsentDate: '2026-08-01T14:10:00Z'
  }
];

export const INITIAL_RADI_ASSESSMENTS: RadiAssessment[] = [
  {
    id: 'radi_1',
    patientId: 'pat_1',
    patientName: 'Salua Cozac',
    evaluatorId: 'user_adriane',
    evaluatorName: 'Adriane Gama',
    evaluatorRole: 'Fonoaudióloga (CRFa 3-12894)',
    date: '2026-09-18',
    answers: { 1: true, 2: false, 3: false, 4: true, 5: false, 6: true, 7: false, 8: false, 9: false },
    score: 3,
    riskLevel: 'Risco Moderado',
    clinicalRecommendations: 'Manter consistência Macia e Picada (IDDSI 6). Introduzir pausas regulares durante a refeição. Fracionar refeições para reduzir tempo superior a 45 minutos. Cuidadores instruídos sobre postura ereta a 90 graus.',
    createdAt: '2026-09-18T11:00:00Z',
    verificationHash: 'HD-9C8E7F6A1B2C3D4E'
  },
  {
    id: 'radi_2',
    patientId: 'pat_2',
    patientName: 'SML',
    evaluatorId: 'user_adriane',
    evaluatorName: 'Adriane Gama',
    evaluatorRole: 'Fonoaudióloga (CRFa 3-12894)',
    date: '2026-09-15',
    answers: { 1: true, 2: true, 3: false, 4: true, 5: true, 6: true, 7: true, 8: true, 9: true },
    score: 8,
    riskLevel: 'Alto Risco',
    clinicalRecommendations: 'Alto risco de broncoaspiração identificado. Proibido uso de líquido fino sem espessamento. Dieta exclusivamente pastosa (IDDSI 4) e líquidos moderadamente espessados (IDDSI 3). Supervisão 100% assistida e higiene oral rigorosa após cada ingestão.',
    createdAt: '2026-09-15T15:30:00Z',
    verificationHash: 'HD-F1A2B3C4D5E67890'
  }
];

export const INITIAL_MEAL_PHOTOS: MealPhoto[] = [
  {
    id: 'photo_1',
    patientId: 'pat_1',
    mealType: 'almoço',
    photoUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    date: '2026-09-23',
    notes: 'Purê de abóbora com peito de frango desfiado úmido (IDDSI 5)',
    uploadedAt: '2026-09-23T12:30:00Z'
  },
  {
    id: 'photo_2',
    patientId: 'pat_1',
    mealType: 'café',
    photoUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=600&q=80',
    date: '2026-09-23',
    notes: 'Mingau de aveia morno com mamão amassado e chá espessado',
    uploadedAt: '2026-09-23T08:15:00Z'
  },
  {
    id: 'photo_3',
    patientId: 'pat_1',
    mealType: 'lanche1',
    photoUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
    date: '2026-09-22',
    notes: 'Frutas cozidas e amassadas em consistência pastosa',
    uploadedAt: '2026-09-22T10:45:00Z'
  },
  {
    id: 'photo_4',
    patientId: 'pat_1',
    mealType: 'jantar',
    photoUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
    date: '2026-09-22',
    notes: 'Sopa cremosa de legumes batida e coada com carne desfiada',
    uploadedAt: '2026-09-22T19:30:00Z'
  },
  {
    id: 'photo_5',
    patientId: 'pat_1',
    mealType: 'suco',
    photoUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    date: '2026-09-21',
    notes: 'Suco de maçã com espessante nível 2 (Resource ThickenUp Clear)',
    uploadedAt: '2026-09-21T15:00:00Z'
  },
  {
    id: 'photo_6',
    patientId: 'pat_1',
    mealType: 'ceia',
    photoUrl: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80',
    date: '2026-09-21',
    notes: 'Iogurte natural espessado com geleia de frutas sem sementes',
    uploadedAt: '2026-09-21T21:10:00Z'
  }
];

export const INITIAL_DAILY_LOGS: DailyFeedingLog[] = [
  {
    id: 'log_1',
    patientId: 'pat_1',
    patientName: 'Salua Cozac',
    caregiverId: 'user_zeca',
    caregiverName: 'Zeca Souza',
    date: '2026-09-23',
    foodConsistency: 'Macio e Picado (Nível 6)',
    foodConsistencyLevel: 6,
    liquidConsistency: 'Extremamente Espessado (Nível 4)',
    liquidConsistencyLevel: 4,
    liquidBrandDose: 'Resource ThickenUp Clear - 2 colheres-medida para 150ml de água/chá',
    symptoms: ['degluticao_lenta', 'residuo_boca'],
    observations: 'Paciente alimentou-se bem no almoço. Apresentou leve acúmulo de resíduo em vestíbulo oral direito, removido com manobra de limpeza fonoaudiológica. Sem episódios de tosse ou engasgo.',
    photos: INITIAL_MEAL_PHOTOS.filter(p => p.date === '2026-09-23'),
    createdAt: '2026-09-23T13:00:00Z',
    isEncrypted: true
  },
  {
    id: 'log_2',
    patientId: 'pat_1',
    patientName: 'Salua Cozac',
    caregiverId: 'user_zeca',
    caregiverName: 'Zeca Souza',
    date: '2026-09-22',
    foodConsistency: 'Macio e Picado (Nível 6)',
    foodConsistencyLevel: 6,
    liquidConsistency: 'Moderadamente Espessado (Nível 3)',
    liquidConsistencyLevel: 3,
    liquidBrandDose: 'ThickenUp Clear - 1 sachê para 100ml de suco',
    symptoms: ['degluticao_lenta'],
    observations: 'Alimentação calma com postura correta em cadeira a 90°. Aceitou bem a porção de legumes e proteína úmida.',
    photos: INITIAL_MEAL_PHOTOS.filter(p => p.date === '2026-09-22'),
    createdAt: '2026-09-22T19:40:00Z',
    isEncrypted: true
  }
];

export const FOIS_SCALE = [
  { level: 1, label: 'Nível 1 - Nada por via oral (SNE/GTT exclusiva)' },
  { level: 2, label: 'Nível 2 - Dependente de via alternativa com mínima tentativa oral' },
  { level: 3, label: 'Nível 3 - Dependente de via alternativa com ingestão oral consistente' },
  { level: 4, label: 'Nível 4 - Via oral total de uma única consistência adaptada' },
  { level: 5, label: 'Nível 5 - Via oral total com múltiplas consistências e preparo especial' },
  { level: 6, label: 'Nível 6 - Via oral total com restrições mínimas de consistência' },
  { level: 7, label: 'Nível 7 - Via oral total sem restrições' }
];

export const INITIAL_MEDICAL_RECORDS: import('../types').PatientMedicalRecord[] = [
  {
    id: 'pep_pat_1',
    patientId: 'pat_1',
    patientName: 'Salua Cozac',
    feedingRoute: 'VO_exclusiva',
    primaryComplaint: 'Episódios recorrentes de engasgo com líquidos finos (água e chá), tosse após deglutição e sensação de alimento parado na garganta após o almoço.',
    pastMedicalHistory: 'Paciente com diagnóstico de Doença de Alzheimer em estágio moderado. Hipertensão arterial sistêmica controlada com Losartana. Episódio de broncopneumonia aspirativa leve tratada há 4 meses.',
    oralHygieneDentition: 'Prótese total superior bem adaptada, ausência de dentes molares inferiores com prótese parcial removível. Higiene bucal assistida pelo cuidador com boa adesão.',
    baselineFois: 4,
    currentFois: 5,
    ofaAssessment: {
      lipSeal: 'adequado',
      tongueMobility: 'reduzida',
      tongueStrength: 'hipotonico',
      laryngealElevation: 'reduzida',
      cervicalAuscultation: 'estertorosa',
      wetVoice: false,
      swallowingReflex: 'atrasado',
      coughReflex: 'eficaz',
      dentoFacialStatus: 'Prótese total superior e parcial inferior higienizadas.'
    },
    treatmentPlan: {
      frequency: '2 vezes por semana (sessões de 45 minutos)',
      posturalManeuvers: [
        'Queixo para baixo (Chin tuck) durante todas as deglutições de líquidos espessados',
        'Postura sentada a 90 graus mantida durante a refeição e por 30 minutos após'
      ],
      deglutitionManeuvers: [
        'Deglutição com esforço (Effortful Swallow)',
        'Múltiplas deglutições para cada bolo alimentar ofertado'
      ],
      myofunctionalExercises: [
        'Fortalecimento de dorso e base de língua com espátula',
        'Exercício de elevação velar com emissão vocálica',
        'Manobra de Shaker / CTAR adaptada para estabilidade hiolaríngea'
      ],
      sensoryStrategies: [
        'Estimulação térmico-tátil gustativa com colher gelada em pilares palatinos anteriores',
        'Variação de temperatura morna/fria para agilização do reflexo faríngeo'
      ],
      dietaryPrescription: 'Dieta Macia e Picada (IDDSI 6) ou Moída e Úmida (IDDSI 5). Proibido alimentos secos ou com dupla consistência.',
      liquidThickening: 'Líquido moderadamente espessado (IDDSI 3) com espessante à base de goma xantana (2 medidas para 150ml).',
      caregiverGuidelines: 'Fracionar a refeição caso o tempo ultrapasse 40 minutos. Nunca ofertar alimentos em decúbito. Monitorar tosse e saturação de O2.'
    },
    objectives: [
      {
        id: 'obj_1',
        term: 'curto_prazo',
        description: 'Eliminar episódios de engasgo e tosse durante a ingestão hídrica através do espessamento em nível IDDSI 3 e manobra de queixo para baixo.',
        status: 'atingido',
        targetDate: '2026-09-15'
      },
      {
        id: 'obj_2',
        term: 'medio_prazo',
        description: 'Aumentar a excursão laríngea e a força de propulsão lingual para evolução do nível FOIS de 4 para 5 com segurança.',
        status: 'em_andamento',
        targetDate: '2026-10-30'
      },
      {
        id: 'obj_3',
        term: 'longo_prazo',
        description: 'Manter estabilidade respiratória sem novos episódios de broncoaspiração e preservar autonomia na alimentação assistida.',
        status: 'em_andamento',
        targetDate: '2026-12-20'
      }
    ],
    sessions: [
      {
        id: 'sess_3',
        patientId: 'pat_1',
        sessionNumber: 3,
        date: '2026-09-22',
        therapistName: 'Adriane Paes da Gama',
        therapistCrfa: 'CRFa 3-12894',
        subjective: 'Cuidador relata que paciente aceitou bem o purê de legumes e frango desfiado. Não houve engasgos no café da manhã nem no almoço nos últimos 3 dias.',
        objective: 'Realizada estimulação térmico-tátil gustativa em pilares anteriores. Treino de deglutição com esforço utilizando 5ml de água gelada espessada em nível IDDSI 3. Ausculta cervical pré e pós-deglutição sem ruídos adventícios. Ausência de voz molhada.',
        assessment: 'Paciente compreende e executa a manobra de queixo para baixo com auxílio verbal. Ganho na coordenação pneumofonoarticulatória e redução do tempo de trânsito orofaríngeo.',
        plan: 'Manter líquidos espessados IDDSI 3. Iniciar treino com textura macia e picada (IDDSI 6) no lanche da tarde sob supervisão contínua. Próxima sessão em 25/09.',
        currentFois: 5,
        symptomsObserved: ['degluticao_lenta'],
        verificationSeal: 'PEP-9C8E7F6A-SESS03',
        createdAt: '2026-09-22T15:00:00Z'
      },
      {
        id: 'sess_2',
        patientId: 'pat_1',
        sessionNumber: 2,
        date: '2026-09-15',
        therapistName: 'Adriane Paes da Gama',
        therapistCrfa: 'CRFa 3-12894',
        subjective: 'Família preocupada com a perda de 1,5kg no último mês e tosse frequente com líquidos.',
        objective: 'Aplicação da triagem RaDI (score 3 - Risco Moderado). Teste de deglutição clínica com líquido fino evidenciou escape prematuro para valéculas e tosse reflexa protetiva. Teste com líquido espessado IDDSI 3 transcorreu com proteção laringotraqueal eficaz.',
        assessment: 'Disfagia orofaríngea de grau moderado associada a escape posterior e atraso no disparo do reflexo de deglutição.',
        plan: 'Suspensão de líquidos finos livres. Prescrição de espessante alimentar nível 3. Orientação à equipe de cuidadores quanto à postura e manobras.',
        currentFois: 4,
        symptomsObserved: ['tosse_refeicao', 'engasgo'],
        verificationSeal: 'PEP-5B4A3C2D-SESS02',
        createdAt: '2026-09-15T11:30:00Z'
      },
      {
        id: 'sess_1',
        patientId: 'pat_1',
        sessionNumber: 1,
        date: '2026-09-08',
        therapistName: 'Adriane Paes da Gama',
        therapistCrfa: 'CRFa 3-12894',
        subjective: 'Primeira consulta de avaliação fonoaudiológica domiciliar pós-alta hospitalar.',
        objective: 'Avaliação da motricidade orofacial, vedamento labial, tônus de bochechas e mobilidade de língua. Inspeção da cavidade oral e próteses dentárias.',
        assessment: 'Presença de hipotonia lingual com apraxia oral em tentativas de comandos complexos. Risco moderado para aspiração.',
        plan: 'Abertura de prontuário fonoaudiológico, definição de metas terapêuticas e encaminhamento para readequação de dieta pastosa.',
        currentFois: 4,
        symptomsObserved: ['residuo_oral', 'degluticao_lenta'],
        verificationSeal: 'PEP-1F2E3D4C-SESS01',
        createdAt: '2026-09-08T10:00:00Z'
      }
    ],
    updatedAt: '2026-09-22T15:00:00Z'
  },
  {
    id: 'pep_pat_2',
    patientId: 'pat_2',
    patientName: 'SML',
    feedingRoute: 'VO_mista',
    primaryComplaint: 'Idosa centenária com sonolência e fadiga acentuada ao se alimentar, engasgos com líquidos e recusa alimentar progressiva.',
    pastMedicalHistory: 'Demência Vascular avançada (105 anos). Episódios múltiplos de desidratação e perda ponderal. Fragilidade clínica acentuada.',
    oralHygieneDentition: 'Edentada total sem prótese. Mucosa oral seca, necessidade de hidratação e higiene com gaze embebida em solução antisséptica.',
    baselineFois: 3,
    currentFois: 3,
    ofaAssessment: {
      lipSeal: 'inadequado',
      tongueMobility: 'reduzida',
      tongueStrength: 'hipotonico',
      laryngealElevation: 'reduzida',
      cervicalAuscultation: 'estertorosa',
      wetVoice: true,
      swallowingReflex: 'atrasado',
      coughReflex: 'fraco',
      dentoFacialStatus: 'Edentada total, mucosa ressecada.'
    },
    treatmentPlan: {
      frequency: '2 vezes por semana com monitoramento diário do cuidador',
      posturalManeuvers: [
        'Cabeça alinhada em linha média a 90 graus',
        'Manutenção da cabeceira elevada por 45 minutos após qualquer ingesta'
      ],
      deglutitionManeuvers: [
        'Múltiplas deglutições assistidas'
      ],
      myofunctionalExercises: [
        'Estimulação passiva de motricidade oral e reflexo labial',
        'Manobras de relaxamento cervical e estimulação laríngea'
      ],
      sensoryStrategies: [
        'Estimulação tátil perioral e intraoral suave',
        'Oferta em pequenos volumes (colher de café - 2,5ml)'
      ],
      dietaryPrescription: 'Dieta Pastosa Homogênea (IDDSI 4).',
      liquidThickening: 'Extremamente Espessado (IDDSI 4) ou suplementação via sonda quando em sonolência.',
      caregiverGuidelines: 'Nunca forçar a ingestão em momentos de sonolência ou rebaixamento sensorial. Respeitar pausas.'
    },
    objectives: [
      {
        id: 'obj_2_1',
        term: 'curto_prazo',
        description: 'Garantir hidratação segura e prevenir aspiração silente com líquidos extremamente espessados.',
        status: 'em_andamento',
        targetDate: '2026-10-01'
      }
    ],
    sessions: [
      {
        id: 'sess_sml_1',
        patientId: 'pat_2',
        sessionNumber: 1,
        date: '2026-09-19',
        therapistName: 'Adriane Paes da Gama',
        therapistCrfa: 'CRFa 3-12894',
        subjective: 'Cuidadora Zeca relata que a paciente dorme durante a oferta do almoço.',
        objective: 'Avaliação clínica à beira do leito. Ausculta cervical com estertores prévios. Presença de voz molhada. Tosse fraca.',
        assessment: 'Disfagia grave com alto risco de aspiração silente e fadiga muscular extrema.',
        plan: 'Alimentação em pequenas porções e horários de maior vigília. Espessamento nível 4.',
        currentFois: 3,
        symptomsObserved: ['fadiga_refeicao', 'voz_molhada', 'tosse_refeicao'],
        verificationSeal: 'PEP-SML-SESS01',
        createdAt: '2026-09-19T14:00:00Z'
      }
    ],
    updatedAt: '2026-09-19T14:30:00Z'
  }
];

export const INITIAL_CHAT_MESSAGES: import('../types').ChatMessage[] = [
  {
    id: 'msg_1',
    patientId: 'pat_1',
    senderId: 'user_zeca',
    senderName: 'Zeca Souza',
    senderRole: 'cuidador',
    text: 'Dra. Adriane, no almoço de hoje a D. Salua teve um leve cansaço nos últimos minutos. Mantive o purê e ela aceitou bem todo o volume.',
    timestamp: '2026-09-23T13:05:00Z',
    encrypted: true
  },
  {
    id: 'msg_2',
    patientId: 'pat_1',
    senderId: 'user_adriane',
    senderName: 'Adriane Gama',
    senderRole: 'fonoaudiologo',
    text: 'Excelente conduta, Zeca! Caso perceba cansaço, fracione a refeição em 2 etapas com intervalo de 20 minutos. Importante manter a cabeça levemente inclinada para a frente ao deglutir.',
    timestamp: '2026-09-23T13:20:00Z',
    encrypted: true
  },
  {
    id: 'msg_3',
    patientId: 'pat_1',
    senderId: 'user_zeca',
    senderName: 'Zeca Souza',
    senderRole: 'cuidador',
    text: 'Perfeito, já anexei as fotos do café e almoço no sistema para a senhora avaliar a consistência.',
    timestamp: '2026-09-23T13:25:00Z',
    encrypted: true
  }
];

