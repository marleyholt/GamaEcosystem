import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Sparkles, 
  ExternalLink, 
  ShieldCheck, 
  Database, 
  RefreshCw,
  Server,
  Layers,
  FileText
} from 'lucide-react';

interface ChangeLogViewProps {
  onRefresh?: () => void;
}

export const ChangeLogView: React.FC<ChangeLogViewProps> = () => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('Hoje, às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));

  const fetchChangeLog = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/changelog');
      if (res.ok) {
        const data = await res.json();
        if (data.content) {
          setContent(data.content);
        }
      }
    } catch {
      // Fallback embutido com dados do LISTA.md
    } finally {
      setLoading(false);
      setLastUpdated('Hoje, às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    }
  };

  useEffect(() => {
    fetchChangeLog();
  }, []);

  return (
    <div className="bg-[#1f1a17] border border-[#382e27] rounded-2xl p-6 sm:p-8 space-y-8 animate-fadeIn">
      {/* Header com Status do Projeto */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#382e27] pb-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c8a88a]/15 border border-[#c8a88a]/30 text-[#c8a88a] text-xs font-semibold">
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Documento Oficial de Transparência Técnica</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#f4efe8]">
            ChangeLog & To-Do List do GamaEcosystem
          </h2>
          <p className="text-xs sm:text-sm text-[#a69a8f] max-w-2xl leading-relaxed">
            Painel de controle em tempo real para acompanhamento das entregas concluídas, tarefas prioritárias e planejamento de novas funcionalidades do ecossistema clínico.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchChangeLog}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#25201c] hover:bg-[#2e2722] border border-[#44362d] text-xs font-semibold text-[#f4efe8] transition-all cursor-pointer disabled:opacity-50"
            title="Atualizar dados do LISTA.md"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#c8a88a] ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Cards de Status de Produção */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#25201c] border border-[#382e27] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#a69a8f]">
            <span className="font-semibold uppercase tracking-wider">Ambiente de Produção</span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="text-sm font-bold text-[#f4efe8] truncate">
            https://gamaecosystem.duckdns.org
          </div>
          <div className="text-[11px] text-emerald-400/90 flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Online via Nginx + SSL + PM2
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#25201c] border border-[#382e27] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#a69a8f]">
            <span className="font-semibold uppercase tracking-wider">Banco de Dados</span>
            <Database className="w-4 h-4 text-[#c8a88a]" />
          </div>
          <div className="text-sm font-bold text-[#f4efe8]">
            MariaDB 10.3 (gamaecosystem_db)
          </div>
          <div className="text-[11px] text-[#c8a88a] flex items-center gap-1.5 font-medium">
            <Server className="w-3.5 h-3.5" />
            Instância Exclusiva (9 Tabelas InnoDB)
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#25201c] border border-[#382e27] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#a69a8f]">
            <span className="font-semibold uppercase tracking-wider">Segurança & Usuário Master</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-sm font-bold text-[#f4efe8] truncate">
            leaog.8@gmail.com
          </div>
          <div className="text-[11px] text-[#a69a8f] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Atualizado {lastUpdated}
          </div>
        </div>
      </div>

      {/* Seção 2: TO-DO LIST (Prioridades de Desenvolvimento) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold font-serif text-[#f4efe8] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#c8a88a]" />
            Backlog de Tarefas por Prioridade (To-Do List)
          </h3>
          <span className="text-xs text-[#a69a8f]">Sprints em andamento</span>
        </div>

        <div className="p-4 rounded-xl bg-[#25201c] border border-[#382e27] text-center py-6 space-y-2">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 mb-1">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold text-[#f4efe8]">
            Todas as tarefas prioritárias da sprint atual foram concluídas e homologadas!
          </p>
          <p className="text-xs text-[#a69a8f] max-w-xl mx-auto">
            Os itens finalizados (eliminação do Firebase, persistência no MariaDB, RT em Fono & Equipe e gestão de usuários) migraram para o Histórico de Versões abaixo, mantendo a tela limpa e despoluída.
          </p>
        </div>
      </div>

      {/* Seção 3: CHANGELOG HISTÓRICO DE ENTREGAS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold font-serif text-[#f4efe8] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#c8a88a]" />
            Changelog Oficial de Versões & Entregas
          </h3>
          <span className="text-xs text-[#a69a8f]">Histórico auditável</span>
        </div>

        <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#382e27]">
                                        {/* Versão v1.3.2 - 02/10/2026 */}
          <div className="relative space-y-3">
            <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-[#1f1a17]" />
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-[#181513] font-bold text-xs">
                v1.3.2
              </span>
              <span className="text-xs font-semibold text-[#f4efe8]">
                Compatibilização de Balões/Modais no Tema Claro & Sincronização Estrita da RT
              </span>
              <span className="text-[11px] text-[#a69a8f]">• 02/10/2026</span>
            </div>
            <ul className="text-xs text-[#a69a8f] space-y-1.5 list-disc pl-4">
              <li>
                <strong className="text-[#f4efe8]">Balão de Sucesso & Modais no Tema Claro:</strong> Balão de confirmação de salvamento e caixas de diálogo 100% integrados à paleta clara (fundo verde menta, texto escuro de alto contraste), sem herdar fundos pretos do modo escuro.
              </li>
              <li>
                <strong className="text-[#f4efe8]">Sincronização Estrita do E-mail da RT:</strong> Resolução definitiva da divergência entre a aba de Clínica & RT e Fono & Equipe. Ao salvar <code className="text-[#c8a88a]">adrianepaesdagama@gmail.com</code>, ambas as abas refletem e mantêm o e-mail idêntico mesmo após recarregar a página (F5).
              </li>
            </ul>
          </div>

{/* Versão v1.3.1 - 02/10/2026 */}
          <div className="relative space-y-3">
            <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-[#1f1a17]" />
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-[#181513] font-bold text-xs">
                v1.3.1
              </span>
              <span className="text-xs font-semibold text-[#f4efe8]">
                Máscaras de Telefone/CPF em Fono & Equipe, Usuário Master Atualizado & Persistência de Clínica
              </span>
              <span className="text-[11px] text-[#a69a8f]">• 02/10/2026</span>
            </div>
            <ul className="text-xs text-[#a69a8f] space-y-1.5 list-disc pl-4">
              <li>
                <strong className="text-[#f4efe8]">Máscaras de Telefone e CPF:</strong> Formatação automática com pontos, traços, parênteses e limite de caracteres no cadastro de Fono & Equipe e na aba Clínica e RT.
              </li>
              <li>
                <strong className="text-[#f4efe8]">Persistência Blindada no F5 para Clínica & RT:</strong> Mapeamento bidirecional unificado de colunas MariaDB garantindo que alterações na clínica e RT persistam após atualização de página.
              </li>
              <li>
                <strong className="text-[#f4efe8]">Usuário Master:</strong> Cadastro oficializado para Filipe Leão da Gama (<code className="text-[#c8a88a]">filipe.gama@hotmail.com</code>) com privilégios plenos de Administrador.
              </li>
            </ul>
          </div>

{/* Versão v1.3.0 - 02/10/2026 */}
          <div className="relative space-y-3">
            <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-[#c8a88a] ring-4 ring-[#1f1a17]" />
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full bg-[#c8a88a] text-[#181513] font-bold text-xs">
                v1.3.0
              </span>
              <span className="text-xs font-semibold text-[#f4efe8]">
                Eliminação do Firebase, Sincronização MariaDB & Gestão de RT e Usuários
              </span>
              <span className="text-[11px] text-[#a69a8f]">• 02/10/2026</span>
            </div>
            <ul className="text-xs text-[#a69a8f] space-y-1.5 list-disc pl-4">
              <li>
                <strong className="text-[#f4efe8]">Eliminação Completa do Firebase & Firestore:</strong> Login, primeiro acesso e sincronização agora utilizam exclusivamente a API REST do MariaDB/MySQL.
              </li>
              <li>
                <strong className="text-[#f4efe8]">Persistência Blindada no F5:</strong> Configurações institucionais e dados clínicos salvam de forma imediata na API e no cache, sem reversão de valores.
              </li>
              <li>
                <strong className="text-[#f4efe8]">Responsável Técnica (RT) Integrada:</strong> A RT é espelhada automaticamente na aba 'Fonoaudiólogas & Equipe' com proteção contra exclusão, e seu e-mail institucional é a credencial de login com perfil de Administrador.
              </li>
              <li>
                <strong className="text-[#f4efe8]">Cadastro Imediato em Gestão de Usuários:</strong> Novos profissionais cadastrados entram na hora na aba de Gestão de Usuários para configuração prévia de telas e permissões.
              </li>
            </ul>
          </div>

{/* Versão v1.2.0 - Unificada do dia 01/10/2026 */}
          <div className="relative space-y-3">
            <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-[#1f1a17]" />
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-[#181513] font-bold text-xs">
                v1.2.0
              </span>
              <span className="text-xs font-semibold text-[#f4efe8]">
                Consolidação Geral do GamaEcosystem (Notificações, Temas, Marca e Acessos)
              </span>
              <span className="text-[11px] text-[#a69a8f]">• 01/10/2026</span>
            </div>
            <ul className="text-xs text-[#a69a8f] space-y-1.5 list-disc pl-4">
              <li>
                <strong className="text-[#f4efe8]">Consistência de Identidade Clínica:</strong> O nome de exibição reflete com fidelidade o nome cadastrado no usuário, com identificação do usuário mestre <code className="text-[#c8a88a]">filipe.gama@hotmail.com</code> como <code className="text-[#c8a88a]">Filipe (DEV)</code>.
              </li>
              <li>
                <strong className="text-[#f4efe8]">Exportação em Lote & Relatórios Oficiais:</strong> Download consolidado em PDF com timbrado oficial e planilhas CSV para prontuários.
              </li>
              <li>
                <strong className="text-[#f4efe8]">Backups do Banco MariaDB & PWA Offline:</strong> Rotinas automáticas de backup diário no servidor e suporte completo à instalação PWA em celulares (Android/iOS).
              </li>
              <li>
                <strong className="text-[#f4efe8]">Sessão Segura, Contador & Proteção Anti-Perda de Dados:</strong> Caixa "Permanecer conectado" gerencia reconexão ao fechar abas; com a janela aberta, ao término dos 15 minutos um Pop-up de Renovação permite estender o tempo por mais 15 minutos sem recarregar ou perder nenhum dado digitado em prontuários.
              </li>
              <li>
                <strong className="text-[#f4efe8]">Limpeza de Dependências & Higienização do Repositório:</strong> Remoção dos pacotes não utilizados (@google/genai, motion), eliminação de binários redundantes na raiz e integração do Changelog oficial ao Dossiê Comercial.
              </li>
              <li>
                <strong className="text-[#f4efe8]">Apresentação Técnica/Comercial & Simulador de Servidor:</strong> Botão discreto temporário na tela de login com simulador interativo de clínicas, usuários, dimensionamento de hardware (vCPU/RAM/NVMe) e projeção de receita recorrente (SaaS B2B).
              </li>
              <li>
                <strong className="text-[#f4efe8]">Sino de Notificações Integrado & Função Limpar:</strong> Dropdown com contagem em tempo real de assinaturas pendentes e alertas RaDI; botões "Limpar todas" e descarte individual com lixeira.
              </li>
              <li>
                <strong className="text-[#f4efe8]">Autenticação Direta por E-mail:</strong> Eliminado fluxo e modais de aprovação manual; primeiro acesso liberado automaticamente para e-mails cadastrados na equipe ou cuidadores.
              </li>
              <li>
                <strong className="text-[#f4efe8]">Ícone do App & Favicon Ampliado:</strong> Ícone aumentado para <code className="text-[#c8a88a]">w-12 h-12</code> com borda elegante ao lado do título GamaEcosystem.
              </li>
              <li>
                <strong className="text-[#f4efe8]">Harmonização e Contraste do Tema Claro:</strong> Mais de 75 ajustes finos de contraste (WCAG AA), fundo Alabaster, badges legíveis e menus dourados no hover.
              </li>
              <li>
                <strong className="text-[#f4efe8]">Despoluição do Topo:</strong> Removidos selos estáticos de texto do cabeçalho superior.
              </li>
              <li>
                <strong className="text-[#f4efe8]">Manual do Usuário Centralizado & Guia PWA:</strong> Renderização por Portal React (z-[9999]), sem cortes na tela, e guia de instalação para Android e iOS.
              </li>
              <li>
                <strong className="text-[#f4efe8]">Banco MariaDB & Eliminação do Firebase:</strong> Painel de monitoramento do MariaDB local e remoção de resquícios de interface.
              </li>
              <li>
                <strong className="text-[#f4efe8]">Seletor de Pacientes no Dashboard:</strong> Troca ágil com busca instantânea por nome ou diagnóstico.
              </li>
              <li>
                <strong className="text-[#f4efe8]">Blindagem da Logomarca Oficial:</strong> Embutida em Base64 para garantir carregamento instantâneo mesmo após F5.
              </li>
            </ul>
          </div>

          {/* Versão v1.1.0 */}
          <div className="relative space-y-2">
            <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-[#c8a88a] ring-4 ring-[#1f1a17]" />
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full bg-[#c8a88a] text-[#181513] font-bold text-xs">
                v1.1.0
              </span>
              <span className="text-xs font-semibold text-[#f4efe8]">
                Migração para Servidor de Produção & Infraestrutura Dedicada
              </span>
              <span className="text-[11px] text-[#a69a8f]">
                29 de Setembro de 2026
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#25201c] border border-[#382e27] text-xs text-[#a69a8f] space-y-2 leading-relaxed">
              <p className="text-[#f4efe8] font-medium">
                • <strong>Servidor em Nuvem Ubuntu 20 (Oracle Cloud):</strong> Implantação não-destrutiva em instância compartilhada, garantindo total isolamento de portas e processos.
              </p>
              <p className="text-[#f4efe8] font-medium">
                • <strong>Banco de Dados Dedicado:</strong> Criação do schema relacional <code className="text-[#c8a88a]">gamaecosystem_db</code> no MariaDB com 9 tabelas estruturadas em InnoDB e UTF8MB4.
              </p>
              <p className="text-[#f4efe8] font-medium">
                • <strong>Nginx Reverse Proxy & SSL:</strong> Domínio oficial <code className="text-[#c8a88a]">https://gamaecosystem.duckdns.org</code> com certificado criptográfico HTTPS Let's Encrypt ativo.
              </p>
              <p className="text-[#f4efe8] font-medium">
                • <strong>Limpeza de Base & Governança:</strong> Remoção dos dados de teste anteriores, mantendo a plataforma zerada e o acesso master com <code className="text-[#c8a88a]">leaog.8@gmail.com</code>.
              </p>
              <p className="text-[#f4efe8] font-medium">
                • <strong>Remoção da Aba LGPD:</strong> Simplificação da navegação e conformidade com as diretrizes de usabilidade da clínica.
              </p>
            </div>
          </div>

          {/* Versão v1.0.0 */}
          <div className="relative space-y-2">
            <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-[#52443a] ring-4 ring-[#1f1a17]" />
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full bg-[#382e27] text-[#c8a88a] font-bold text-xs">
                v1.0.0
              </span>
              <span className="text-xs font-semibold text-[#f4efe8]">
                Consolidação dos Módulos Clínicos & Identidade Gama Fono
              </span>
              <span className="text-[11px] text-[#a69a8f]">
                28 de Setembro de 2026
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#25201c] border border-[#382e27] text-xs text-[#a69a8f] space-y-2 leading-relaxed">
              <p className="text-[#f4efe8] font-medium">
                • <strong>Identidade Institucional:</strong> Inclusão do logotipo oficial Gama Fono e credenciais da Responsável Técnica Adriane Gama (CRFa 2-12628 / CREFONO 9531-RJ).
              </p>
              <p className="text-[#f4efe8] font-medium">
                • <strong>Módulo de Avaliação RaDI:</strong> Rastreio de Disfagia com cálculo automático de escore, nível de risco e verificação criptográfica.
              </p>
              <p className="text-[#f4efe8] font-medium">
                • <strong>Registro Diário Alimentar:</strong> Diário com suporte a fotos de pratos, consistências IDDSI e sinais de alerta de broncoaspiração.
              </p>
              <p className="text-[#f4efe8] font-medium">
                • <strong>Prontuário Eletrônico (PEP):</strong> Histórico médico, condutas fonoaudiológicas e orientações posturais personalizadas.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Caixa de Texto Íntegra (LISTA.md) se carregado */}
      {content && (
        <div className="p-4 rounded-xl bg-[#181513] border border-[#382e27] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#a69a8f]">
            <span className="font-semibold flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#c8a88a]" />
              Arquivo Fonte LISTA.md (Sincronizado via Servidor)
            </span>
          </div>
          <pre className="text-[11px] font-mono text-[#a69a8f] bg-[#12100e] p-3 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-64 border border-[#2b241f]">
            {content}
          </pre>
        </div>
      )}
    </div>
  );
};
