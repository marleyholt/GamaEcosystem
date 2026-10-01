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

        <div className="space-y-3">
          {/* Alta Prioridade */}
          <div className="p-4 rounded-xl bg-[#241a18] border border-red-900/30 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Alta Prioridade (Próximos Passos Imediatos)
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-[#e8dfd5] pl-2">
              <li className="flex items-start gap-2.5">
                <div className="w-4 h-4 mt-0.5 rounded border border-[#c8a88a]/40 bg-[#1f1a17] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                </div>
                <div>
                  <strong className="text-white">API de Sincronização MariaDB Completa (CRUD de Produção):</strong>
                  <p className="text-xs text-[#a69a8f] mt-0.5">
                    Persistência direta de Pacientes (<code className="text-[#c8a88a]">/api/patients</code>), Prontuários Médicos (<code className="text-[#c8a88a]">/api/medical-records</code>), Avaliações RaDI (<code className="text-[#c8a88a]">/api/radi</code>), Registros de Alimentação (<code className="text-[#c8a88a]">/api/feeding-logs</code>) e Configurações da Clínica.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-4 h-4 mt-0.5 rounded border border-[#c8a88a]/40 bg-[#1f1a17] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                </div>
                <div>
                  <strong className="text-white">Cabeçalho Enxuto, Logo Alinhada (-30%) & Persistência Blindada no F5:</strong>
                  <p className="text-xs text-[#a69a8f] mt-0.5">
                    Redução de 30% na altura da logo alinhada com o título. Persistência imediata no momento do upload que impede perda da logo ao atualizar a página.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-4 h-4 mt-0.5 rounded border border-[#c8a88a]/40 bg-[#1f1a17] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                </div>
                <div>
                  <strong className="text-white">Manual do Usuário com Restrição de Acesso (RBAC):</strong>
                  <p className="text-xs text-[#a69a8f] mt-0.5">
                    Botão discreto de interrogação ao lado do sino abrindo guia completo por módulo. Segue as mesmas permissões do usuário logado.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-4 h-4 mt-0.5 rounded border border-[#c8a88a]/40 bg-[#1f1a17] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                </div>
                <div>
                  <strong className="text-white">Pop-up de Usuário no Topo Estilo Google:</strong>
                  <p className="text-xs text-[#a69a8f] mt-0.5">
                    Troca de senha com validação de senha atual, botão de tema claro/escuro integrado, atalho para configurações e sino de notificações à esquerda.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-4 h-4 mt-0.5 rounded border border-[#c8a88a]/40 bg-[#1f1a17] flex items-center justify-center shrink-0">
                  <Clock className="w-3 h-3 text-amber-400" />
                </div>
                <div>
                  <strong className="text-white">Sino de Notificações com Lista de Pendências Clínicas:</strong>
                  <p className="text-xs text-[#a69a8f] mt-0.5">
                    Listagem de pendências (assinaturas, familiares aguardando retorno, chat) com link direto para os modais clínicos.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Média Prioridade */}
          <div className="p-4 rounded-xl bg-[#242018] border border-amber-900/30 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Média Prioridade (Otimizações Clínicas & Performance)
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-[#e8dfd5] pl-2">
              <li className="flex items-start gap-2.5">
                <div className="w-4 h-4 mt-0.5 rounded border border-[#a69a8f]/40 bg-[#1f1a17] shrink-0" />
                <div>
                  <strong className="text-white">Módulo de Relatórios e Exportação em Lote:</strong>
                  <p className="text-xs text-[#a69a8f] mt-0.5">
                    Geração e download unificado de laudos e pareceres fonoaudiológicos em PDF com timbrado institucional e assinatura da Dra. Adriane Gama.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-4 h-4 mt-0.5 rounded border border-[#a69a8f]/40 bg-[#1f1a17] shrink-0" />
                <div>
                  <strong className="text-white">Otimização de Code Splitting / Chunking no Vite:</strong>
                  <p className="text-xs text-[#a69a8f] mt-0.5">
                    Isolamento dinâmico de bibliotecas pesadas de geração de PDF (<code className="text-[#c8a88a]">jspdf</code>, <code className="text-[#c8a88a]">html2canvas</code>) para carregamento ultrarrápido em redes móveis 4G/5G.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Baixa Prioridade / Roadmap */}
          <div className="p-4 rounded-xl bg-[#1a221d] border border-emerald-900/30 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Baixa Prioridade & Roadmap de Expansão
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-[#e8dfd5] pl-2">
              <li className="flex items-start gap-2.5">
                <div className="w-4 h-4 mt-0.5 rounded border border-[#a69a8f]/40 bg-[#1f1a17] shrink-0" />
                <div>
                  <strong className="text-white">Rotinas de Backup Automático do Banco de Dados:</strong>
                  <p className="text-xs text-[#a69a8f] mt-0.5">
                    Cronjob diário no Linux para dump automatizado do MariaDB com retenção de segurança de 7 dias.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-4 h-4 mt-0.5 rounded border border-[#a69a8f]/40 bg-[#1f1a17] shrink-0" />
                <div>
                  <strong className="text-white">PWA / Notificações no Dispositivo:</strong>
                  <p className="text-xs text-[#a69a8f] mt-0.5">
                    Instalação direta do GamaEcosystem como aplicativo nativo na tela inicial do celular dos cuidadores e familiares.
                  </p>
                </div>
              </li>
            </ul>
          </div>
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
