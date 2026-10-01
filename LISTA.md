# LISTA DE TAREFAS (TO-DO LIST & CHANGELOG) - GAMAECOSYSTEM

Este documento é a fonte de verdade para o acompanhamento contínuo de tarefas, prioridades, sprints e histórico de alterações (changelog).

---

## 📌 1. STATUS ATUAL DO PROJETO

- **Ambiente de Produção:** `https://gamaecosystem.duckdns.org` (Ativo e Online via Nginx + SSL + PM2)
- **Banco de Dados:** MariaDB `gamaecosystem_db` (Instância dedicada, 9 tabelas InnoDB ativas)
- **Status do Endpoint de Saúde:** `{"status":"ok","database":"connected","db_name":"gamaecosystem_db"}`

---

## 📋 2. TO-DO LIST (Backlog de Tarefas por Prioridade)

> **🎉 Todas as tarefas do backlog e auditoria foram concluídas e homologadas com sucesso!**  
> Os itens finalizados foram integrados ao histórico do [Changelog](#-3-changelog-histórico-cronológico-de-entregas) abaixo, mantendo esta lista limpa e pronta para novos requisitos.

---
## 📜 3. CHANGELOG (Histórico Cronológico de Entregas)

### [v1.2.0] - 2026-10-01: Consolidação Geral do GamaEcosystem (Notificações, Temas, Marca, Acessos e Apresentação Comercial)
- **Alteração de Nome de Exibição no Perfil do Usuário:**
  - Adicionada opção no pop-up flutuante do perfil (ao clicar no avatar/nome no topo) para alterar o nome de exibição do usuário ativo.
  - Atualização instantânea com persistência local e no cadastro de usuários, refletindo no cabeçalho e em assinaturas clínicas.
- **Segurança de Sessão, Contador Regressivo & Proteção Anti-Perda de Dados:**
  - Caixa de seleção "Permanecer conectado" (sem texto redundante de minutos), permitindo continuar conectado caso a aba/janela seja fechada e reaberta dentro de 15 minutos.
  - Sessão encerrada imediatamente se a aba for fechada sem a caixa marcada.
  - Com a janela aberta, contador regressivo em tempo real (`MM:SS`) exibido discretamente no topo ao lado do botão de Manual.
  - Ao zerar os 15 minutos com a janela aberta, exibe Pop-up Nobre de Renovação que preserva 100% dos dados digitados na tela (evoluções, prontuários, laudos), evitando qualquer perda de trabalho em andamento.
- **Relatórios & Exportação Consolidada em Lote:**
  - Componente de exportação em lote de laudos em PDF oficial e planilhas de acompanhamento em CSV.
- **Otimização de Code Splitting e Performance:**
  - Separação de chunks no Vite para bibliotecas pesadas (PDF, ícones, React).
- **Rotinas de Backup Automático do Banco MariaDB:**
  - Script de backup agendado diariamente e interface administrativa de download/acionamento.
- **Suporte Completo a PWA & Notificações:**
  - Service Worker com App Shell offline, manifesto W3C e instruções para Android e iOS.
- **Auditoria de Dependências & Segurança de Acesso:**
  - Desinstalação de dependências sem uso (`@google/genai`, `motion`).
  - Remoção de arquivos binários redundantes na raiz (`logo0.PNG`, `Logo.PNG`) e isolamento do Firebase legado.
  - Incorporação do ChangeLog oficial dentro da Apresentação Técnica & Comercial.
  - Bloqueio estrito de links diretos: obrigatoriedade da tela de login exceto para sessões marcadas como 'permanecer conectado' nos últimos 15 minutos.
- **Apresentação Técnica & Comercial com Simulador Interativo na Tela de Login:**
  - Botão discreto temporário abaixo do card de login para demonstração executiva a clientes e investidores.
  - Simulador com controles deslizantes para definir número de clínicas, pacientes e cuidadores, calculando automaticamente a volumetria de dados, consumo de disco e usuários.
  - Mapeamento de hardware de mercado (Hetzner, Contabo, Oracle, AWS) com especificações de vCPU/RAM e custo estimado de hospedagem (de R$ 45 a R$ 420/mês).
  - Projeção financeira completa: taxa de setup, mensalidade recorrente (MRR), margem de lucro operacional e argumentos de fechamento.
- **Sino de Notificações Integrado & Função Limpar:**
  - Dropdown com contagem e alertas em tempo real ao clicar no sino do cabeçalho.
  - Lista de pendências clínicas (evoluções aguardando assinatura do responsável e alertas de risco RaDI Alto/Moderado) com atalhos de 1 clique para o prontuário.
  - Adicionado botão **"Limpar"** e **"Limpar todas"** para esvaziar a lista de notificações em 1 clique, além de botão de descarte individual (lixeira) por notificação.
  - Persistência das notificações já limpas no navegador.
- **Autenticação Direta Vinculada a E-mails Cadastrados:**
  - Removido fluxo e modais de aprovação manual de usuários pendentes.
  - Acesso e primeiro cadastro validados automaticamente pela presença prévia do e-mail na aba de Cuidadores ou Equipe/Fonoaudiólogos.
- **Favicon & Ícone do App Ampliado e Nítido:**
  - Aumentado o tamanho do ícone ao lado do título GamaEcosystem (`Logo.tsx`) para `w-12 h-12`, com moldura elegante e renderização em alta definição no cabeçalho e menu.
- **Ajuste Fino e Harmonização do Tema Claro (Light Mode):**
  - Mapeamento abrangente de mais de 75 combinações de cores para padrão visual Alabaster (`#f6f3ee`) e cartões brancos com sombras sutis.
  - Badges de alerta e status (verde, âmbar, vermelho) convertidos para tons pastéis suaves com fontes escuras de alto contraste (WCAG AA).
  - Subitens do menu lateral (PEP, RaDI, Diário, Histórico, Chat) e linhas de tabelas com efeito dourado ao passar o mouse sem escurecer o fundo no tema claro.
  - Remoção de botões redundantes no topo: a alternância de tema permanece integrada ao modal do usuário.
- **Despoluição Visual do Cabeçalho Superior:**
  - Removidos selos estáticos de texto do cabeçalho; topo limpo, elegante e direto ao ponto com foco em ações essenciais.
- **Transição Completa MariaDB & Eliminação de Menções ao Firebase:**
  - Sub-aba definitiva "Banco de Dados & Servidor" na Central de Configurações, monitorando MariaDB (`gamaecosystem_db`), rotinas de backup e API REST Express.
  - Remoção definitiva de menções legadas ao Firebase nas telas operacionais.
- **Centralização do Manual do Usuário e Guia de Instalação Mobile PWA:**
  - Modal do Manual renderizado via Portal (`document.body`) com centralização no meio da tela (`max-h-[88vh]`), sem risco de corte em nenhum dispositivo.
  - Capítulo passo a passo explicando como instalar o aplicativo no Android (Chrome) e iPhone/iPad (Safari).
- **Seletor Suspenso de Pacientes na Visão Geral (Dashboard):**
  - Seletor inteligente com busca instantânea por nome/diagnóstico e troca em 1 clique do paciente em foco.
- **Blindagem Definitiva da Logomarca Oficial:**
  - Embutida a logomarca oficial em Base64 diretamente no bundle compilado, eliminando falhas ou links quebrados no recarregamento (F5).

### [v1.1.0] - 2026-09-29: Migração para Servidor de Produção & Infraestrutura Isolada
- **Infraestrutura Ubuntu 20 (Oracle Cloud):**
  - Realizada inspeção não-destrutiva sem afetar os dois outros projetos existentes (`telumak-server` e `pastelaria-argentino`).
  - Criado banco de dados relacional dedicado `gamaecosystem_db` com usuário `gama_user` e 9 tabelas InnoDB estruturadas (`schema.sql`).
  - Configurado VirtualHost dedicado no Nginx escutando o domínio `gamaecosystem.duckdns.org` e redirecionando para a porta interna isolada `3005`.
  - Emitido e instalado certificado SSL HTTPS gratuito via Let's Encrypt / Certbot.
  - Criado servidor de produção Express (`server_prod.cjs`) com pool de conexões MySQL e endpoint de verificação `/api/health`.
  - Configurado processo resiliente no PM2 (`gamaecosystem`) com inicialização automática no boot do sistema.
- **Ajustes de Sistema & Interface:**
  - Removida definitivamente a aba **"Segurança & LGPD"** da navegação e das permissões de usuário.
  - Resolvido conflito de versão peer do `esbuild`/`vite` no `package.json` para compilação estável no Node 20.
  - Criado e sincronizado no GitHub o documento mestre `agents.md` com todos os dados técnicos de infraestrutura e acessos.

### [v1.0.0] - 2026-09-28: Consolidação de Módulos Clínicos & Identidade Gama Fono
- **Identidade & Configuração:**
  - Inclusão do logotipo oficial Gama Fono, dados da Responsável Técnica (Adriane Gama - CRFa 2-12628).
  - Implementação da Central de Configurações com campos institucionais, endereço e upload de logo.
- **Módulos Clínicos:**
  - Criação da Avaliação RaDI com cálculo automático de risco de disfagia.
  - Registro Diário Alimentar com fotos, consistências e sinais de broncoaspiração.
  - Prontuário Eletrônico do Paciente (PEP) com histórico clínico e condutas.
  - Linha do Tempo e Evolução com gráficos e filtros por refeição.
