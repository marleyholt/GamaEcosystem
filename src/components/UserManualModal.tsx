import React, { useState } from 'react';
import { 
  BookOpen, 
  X, 
  Search, 
  Stethoscope, 
  Activity, 
  Utensils, 
  Clock, 
  MessageSquare, 
  Users, 
  FileText, 
  Settings, 
  LayoutDashboard,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { UserProfile, NavigationTab } from '../types';

export interface UserManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile;
}

interface ManualSection {
  id: string;
  tabKey?: NavigationTab;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  overview: string;
  howToUse: string[];
  tips: string[];
  compliance: string;
}

const ALL_MANUAL_SECTIONS: ManualSection[] = [
  {
    id: 'resumo',
    tabKey: 'resumo',
    title: 'Visão Geral & Dashboard Clínico',
    subtitle: 'Painel executivo com métricas de alerta e status geral do paciente em foco.',
    icon: LayoutDashboard,
    overview: 'A Visão Geral centraliza os indicadores críticos da disfagia e fonoaudiologia do paciente em foco, alertando sobre sinais de aspiração laringotraqueal, recusa alimentar e datas da última avaliação.',
    howToUse: [
      'Alterne o paciente em foco pelo seletor suspendo para atualizar todos os gráficos e cartões instantaneamente.',
      'Acompanhe o nível da escala FOIS (Functional Oral Intake Scale) de 1 a 7 e o índice de risco RaDI.',
      'Analise os alertas em vermelho que requerem intervenção imediata da fonoaudióloga.'
    ],
    tips: [
      'Utilize o botão de impressão rápida ou exportação de laudo para visitas domiciliares.',
      'Verifique se há novos registros alimentares cadastrados pelos cuidadores nas últimas 24 horas.'
    ],
    compliance: 'Conforme premissas da SBFA e boas práticas hospitalares e domiciliares.'
  },
  {
    id: 'prontuario',
    tabKey: 'prontuario',
    title: 'Prontuário Eletrônico do Paciente (PEP)',
    subtitle: 'Registro estruturado de anamnese, deglutição, OFA, plano terapêutico e notas de sessão.',
    icon: Stethoscope,
    overview: 'O Prontuário Eletrônico (PEP) é o coração técnico da gestão fonoaudiológica. Permite o acompanhamento longitudinal, evolução clínica diária com selo de verificação de autenticidade e gerenciamento de vias de alimentação.',
    howToUse: [
      'Selecione a via atual de alimentação (VO exclusiva, SNE, GTT ou mista com espessante).',
      'Registre os dados da Avaliação Miofuncional Orofacial (OFA) e metas terapêuticas com prazos de reavaliação.',
      'Ao final de cada sessão, lance a Nota de Sessão estruturada (SOAP: Subjetivo, Objetivo, Avaliação e Plano).',
      'Gere o Termo de Consentimento Livre e Esclarecido (TCLE) e assine digitalmente a evolução.'
    ],
    tips: [
      'Cada nota de sessão recebe um hash de integridade e registro de timestamp inviolável.',
      'A assinatura digital da fonoaudióloga vincula seu número de registro profissional no CREFONO.'
    ],
    compliance: 'Em conformidade com a Resolução CFFa e padrão CFM para prontuários eletrônicos protegidos.'
  },
  {
    id: 'radi',
    tabKey: 'radi',
    title: 'Triagem RaDI (Rastreio de Disfagia)',
    subtitle: 'Protocolo de rastreio de risco de disfagia e aspiração com pontuação automática.',
    icon: Activity,
    overview: 'Instrumento padronizado para avaliação do risco de broncoaspiração em pacientes neurológicos, oncológicos e idosos, categorizando em Baixo Risco, Risco Moderado ou Alto Risco.',
    howToUse: [
      'Responda com precisão aos itens do questionário clínico (tosse com líquidos, engasgos frequentes, perda de peso, febre inexplicada).',
      'O sistema computa a pontuação em tempo real e define a conduta imediata recomendada.',
      'Gere o relatório RaDI em papel timbrado com um clique para apresentar ao médico assistente.'
    ],
    tips: [
      'Resultados de Alto Risco exigem suspensão preventiva de consistências líquidas finas até reavaliação com espessante.',
      'Reavalie o RaDI periodicamente a cada 15 ou 30 dias conforme a evolução do quadro.'
    ],
    compliance: 'Instrumento validado internacionalmente e referenciado pelo CFFa.'
  },
  {
    id: 'registro',
    tabKey: 'registro',
    title: 'Registro Diário Alimentar com Fotos',
    subtitle: 'Acompanhamento de refeições pelo cuidador/familiar com consistência e evidência fotográfica.',
    icon: Utensils,
    overview: 'Módulo idealizado para ser utilizado à beira-leito ou no domicílio por cuidadores e familiares. Permite fotografar o prato/refeição antes e depois do consumo, apontar o nível de espessamento e registrar intercorrências.',
    howToUse: [
      'Indique a refeição (Café da Manhã, Almoço, Lanche, Jantar ou Ceia).',
      'Selecione a consistência ofertada (Líquida, Pastosa Fina, Pastosa Grossa, Sólida Macia ou Regular).',
      'Capture ou anexe a foto do alimento e registre a aceitação (consumo total, parcial ou recusa).',
      'Assinale eventuais sinais clínicos de alerta: tosse, pigarro, voz molhada ou cianose.'
    ],
    tips: [
      'As fotos são comprimidas automaticamente para upload rápido mesmo em redes móveis 4G.',
      'A fonoaudióloga recebe as informações no painel clínico e pode ajustar a dieta remotamente.'
    ],
    compliance: 'Registro seguro em nuvem com conformidade à LGPD.'
  },
  {
    id: 'historico',
    tabKey: 'historico',
    title: 'Histórico & Linha do Tempo de Evolução',
    subtitle: 'Linha cronológica com todas as sessões, laudos, fotos de refeição e alterações do paciente.',
    icon: Clock,
    overview: 'Apresenta a trajetória completa do paciente desde o dia do acolhimento. Combina sessões fonoaudiológicas, evoluções assinadas, laudos e fotos em uma única linha do tempo contínua.',
    howToUse: [
      'Filtre os eventos por período ou por tipo (Sessão, Refeição, RaDI, Laudo).',
      'Clique em qualquer item para expandir detalhes clínicos e comparar fotos de antes e depois.',
      'Visualize o histórico de assinaturas de termos e rubricas digitais.'
    ],
    tips: [
      'Ótima ferramenta para reuniões familiares e prestação de contas a operadoras de saúde.',
      'Possui busca rápida textual para localizar sessões antigas.'
    ],
    compliance: 'Guarda documental segura e rastreabilidade cronológica obrigatória.'
  },
  {
    id: 'chat',
    tabKey: 'chat',
    title: 'Chat Clínico & Orientações Fonoaudiológicas',
    subtitle: 'Canal criptografado direto entre fonoaudióloga e familiares/cuidadores.',
    icon: MessageSquare,
    overview: 'Ambiente seguro para esclarecimento de dúvidas pontuais sobre consistência de alimentos, técnicas de postura corporal durante as refeições e agendamento de atendimentos.',
    howToUse: [
      'Envie mensagens de texto e orientações personalizadas para o responsável cadastrado.',
      'Receba dúvidas do cuidador sobre espessamento de líquidos ou medicamentos.',
      'Mantenha as conversas registradas no sistema, evitando a fragmentação de orientações em aplicativos externos.'
    ],
    tips: [
      'Todas as orientações transmitidas ficam anexadas ao histórico de acompanhamento do paciente.',
      'O aplicativo notifica novas mensagens através do sino no topo da tela.'
    ],
    compliance: 'Comunicação confidencial protegida por criptografia e LGPD.'
  },
  {
    id: 'pacientes',
    tabKey: 'pacientes',
    title: 'Gestão de Pacientes & Fichas Cadastrais',
    subtitle: 'Cadastro completo com dados do paciente, responsáveis legais, dados de recibo e contatos.',
    icon: Users,
    overview: 'Centraliza a base de dados de todos os pacientes atendidos pela clínica ou em atendimento domiciliar. Gerencia status cadastral (Ativo, Inativo ou Alta) e consentimento LGPD.',
    howToUse: [
      'Cadastre novos pacientes preenchendo dados pessoais, telefones, responsável legal e dados para recibo.',
      'Vincule a fonoaudióloga responsável e o cuidador designado para o paciente.',
      'Edite fichas cadastrais e alterne o status clínico (ex: concessão de Alta Fonoaudiológica).'
    ],
    tips: [
      'A busca inteligente permite filtrar pacientes por nome, CPF ou diagnóstico.',
      'A sincronização com o banco MariaDB garante que os dados estejam protegidos e atualizados.'
    ],
    compliance: 'Controle de acesso por papel (RBAC) e respeito integral à privacidade de dados.'
  },
  {
    id: 'relatorios',
    tabKey: 'relatorios',
    title: 'Laudos, Atestados & Papel Timbrado Oficial',
    subtitle: 'Geração de laudos clínicos em PDF e impressão oficial em papel timbrado institucional.',
    icon: FileText,
    overview: 'Emissão de documentos formais com layout institucional GAMA FONOAUDIOLOGIA: faixa marrom oficial (#7a5937), logotipo em alta definição, rubrica técnica, dados do CREFONO e rodapé completo.',
    howToUse: [
      'Escolha entre o modelo de impressão 1 (Papel Timbrado SEM Rubrica) ou 2 (COM Assinatura e Rubrica).',
      'Selecione se o laudo emitirá os dados da Responsável Técnica Adriane Gama ou de outra terapeuta da equipe.',
      'Gere o arquivo PDF vetorial com um clique ou utilize a pré-visualização em tempo real.'
    ],
    tips: [
      'O cabeçalho foi otimizado para alinhar perfeitamente com a altura do texto sem margens vazias.',
      'Para impressão manual com carimbo físico, selecione o modelo sem rubrica digital.'
    ],
    compliance: 'Layout homologado pela Responsável Técnica com certificação CREFONO.'
  },
  {
    id: 'configuracao',
    tabKey: 'configuracao',
    title: 'Central de Configurações, Marca & Sistema',
    subtitle: 'Gestão de identidade visual, upload de logotipo e favicon, equipe de terapeutas e backup.',
    icon: Settings,
    overview: 'Painel administrativo exclusivo para controle da marca GAMA, cadastro de terapeutas associadas, cuidadores, papéis de usuários e disparos de backup do banco de dados.',
    howToUse: [
      'Faça upload independente da Logomarca (para Laudos) e do Favicon/Ícone PWA (para a aba e celular).',
      'Utilize o botão "Salvar Alterações de Marca" e confirme na janela modal para gravar no banco.',
      'Cadastre novas fonoaudiólogas com seus respectivos números de CREFONO e rubricas digitalizadas.',
      'Acesse a aba de Backups do MariaDB para gerar cópias de segurança com um clique.'
    ],
    tips: [
      'O sistema aplica corte inteligente de margens brancas (Auto-Trim) para deixar a marca nítida.',
      'Consulte a aba de ChangeLog para verificar o histórico técnico de atualizações do ecossistema.'
    ],
    compliance: 'Acesso restrito a administradores e profissionais autorizados.'
  }
];

export const UserManualModal: React.FC<UserManualModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('resumo');

  if (!isOpen) return null;

  // Adriane Gama ou Administrador têm acesso irrestrito a todas as páginas do manual
  const isMasterUser = 
    currentUser?.role === 'admin' ||
    currentUser?.email?.toLowerCase().includes('adriane') ||
    currentUser?.email?.toLowerCase().includes('gamafono') ||
    currentUser?.email?.toLowerCase().includes('leaog') ||
    currentUser?.name?.toLowerCase().includes('adriane gama');

  // Regra de Permissão: o usuário só vê a seção do manual dos módulos que ele tem permissão de acessar
  const allowedSections = ALL_MANUAL_SECTIONS.filter(section => {
    if (isMasterUser) return true;
    if (!section.tabKey) return true;
    if (!currentUser?.allowedTabs || currentUser.allowedTabs.length === 0) return true;
    return currentUser.allowedTabs.includes(section.tabKey);
  });

  // Filtro de busca textual
  const filteredSections = allowedSections.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.overview.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeSection = allowedSections.find(s => s.id === selectedSectionId) || allowedSections[0];

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm overflow-hidden"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl h-[88vh] max-h-[800px] bg-[#1a1614] border border-[#3e342e] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[#f4efe8] mx-auto my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Cabeçalho do Manual */}
        <div className="px-6 py-4 bg-[#231d19] border-b border-[#3e342e] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c8a88a]/20 border border-[#c8a88a]/40 flex items-center justify-center text-[#c8a88a]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-serif text-[#f4efe8]">
                  Manual do Usuário • GamaEcosystem
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {currentUser?.role === 'admin' ? 'Acesso Completo' : 'Visão Personalizada'}
                </span>
              </div>
              <p className="text-xs text-[#a69a8f]">
                Guia operacional passo a passo das funcionalidades liberadas para seu perfil.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#1a1614] hover:bg-[#2e2621] text-[#a69a8f] hover:text-[#f4efe8] border border-[#382e27] transition-colors cursor-pointer"
            title="Fechar Manual"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo com Navegação Lateral e Conteúdo do Módulo */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Coluna Esquerda: Lista de Módulos Autorizados */}
          <div className="w-full md:w-80 bg-[#161210] border-r border-[#342b26] flex flex-col shrink-0">
            {/* Campo de Busca Rápida */}
            <div className="p-3 border-b border-[#2d241f]">
              <div className="relative">
                <Search className="w-4 h-4 text-[#a69a8f] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Pesquisar no manual..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#241e1a] border border-[#3c312a] rounded-xl text-[#f4efe8] placeholder-[#7d7065] focus:outline-none focus:border-[#c8a88a]"
                />
              </div>
            </div>

            {/* Menu com Seções Disponíveis */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredSections.map(section => {
                const IconComponent = section.icon;
                const isSelected = activeSection?.id === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setSelectedSectionId(section.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#27211d] text-[#c8a88a] border border-[#c8a88a]/40 shadow-sm font-semibold'
                        : 'text-[#a69a8f] hover:bg-[#201a17] hover:text-[#f4efe8] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <IconComponent className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#c8a88a]' : 'text-[#7d7065]'}`} />
                      <span className="text-xs truncate">{section.title}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#c8a88a]' : 'text-[#55473e]'}`} />
                  </button>
                );
              })}

              {filteredSections.length === 0 && (
                <div className="p-6 text-center text-xs text-[#7d7065]">
                  Nenhum módulo encontrado com "{searchTerm}".
                </div>
              )}
            </div>

            {/* Rodapé da Coluna Esquerda com Informações de Segurança */}
            <div className="p-3 bg-[#13100e] border-t border-[#2d241f] text-[11px] text-[#7d7065] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Módulos restritos ao seu perfil de usuário.</span>
            </div>
          </div>

          {/* Coluna Direita: Conteúdo Detalhado do Módulo Selecionado */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 bg-[#1a1614]">
            {activeSection ? (
              <div className="space-y-6 max-w-3xl">
                {/* Cabeçalho do Módulo */}
                <div className="border-b border-[#382e27] pb-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-[#c8a88a]/20 border border-[#c8a88a]/40 flex items-center justify-center text-[#c8a88a]">
                      <activeSection.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold font-serif text-[#f4efe8]">
                        {activeSection.title}
                      </h3>
                      <p className="text-xs text-[#c8a88a] font-medium">
                        {activeSection.subtitle}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-[#d4c8bd] leading-relaxed mt-3">
                    {activeSection.overview}
                  </p>
                </div>

                {/* Passo a Passo: Como Utilizar */}
                <div className="bg-[#211b17] border border-[#3a3029] rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#c8a88a] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Passo a Passo Operacional
                  </h4>
                  <ul className="space-y-2.5">
                    {activeSection.howToUse.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#e8dfd5] leading-relaxed">
                        <span className="w-5 h-5 rounded-full bg-[#2d241f] border border-[#4a3c33] text-[#c8a88a] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Dicas de Boas Práticas */}
                <div className="bg-[#1f1a17] border border-[#382e27] rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    Dicas Clínicas & Recomendações Técnicas
                  </h4>
                  <ul className="space-y-2">
                    {activeSection.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-[#c5b8ac]">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Conformidade e Validação Legal */}
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/30 text-xs text-emerald-300 flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-emerald-200">Enquadramento Regulatório & Segurança:</span>
                    <span>{activeSection.compliance}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-[#7d7065]">
                Selecione um módulo à esquerda para ler o manual correspondente.
              </div>
            )}
          </div>
        </div>

        {/* Rodapé Geral */}
        <div className="px-6 py-3 bg-[#161210] border-t border-[#342b26] flex items-center justify-between text-xs text-[#7d7065] shrink-0">
          <span>GamaEcosystem • Manual Oficial de Operação Clínica</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#27211d] hover:bg-[#342b26] text-[#f4efe8] border border-[#3e342e] transition-colors cursor-pointer"
          >
            Entendido, fechar manual
          </button>
        </div>
      </div>
    </div>
  );
};
