# LISTA DE TAREFAS (TO-DO LIST & CHANGELOG) - GAMAECOSYSTEM

Este documento é a fonte de verdade para o acompanhamento contínuo de tarefas, prioridades, sprints e histórico de alterações (changelog).

---

## 📌 1. STATUS ATUAL DO PROJETO

- **Ambiente de Produção:** `https://gamaecosystem.duckdns.org` (Ativo e Online via Nginx + SSL + PM2)
- **Banco de Dados:** MariaDB `gamaecosystem_db` (Instância dedicada, 9 tabelas InnoDB ativas)
- **Status do Endpoint de Saúde:** `{"status":"ok","database":"connected","db_name":"gamaecosystem_db"}`

---

## 📋 2. TO-DO LIST (Backlog de Tarefas por Prioridade)

### 🔴 Alta Prioridade (Próximos Passos Imediatos)
- [x] **API de Sincronização MariaDB Completa (CRUD de Produção):**
  - Implementados endpoints no backend Express (`server_prod.cjs`) para persistir:
    - Pacientes (`/api/patients`)
    - Prontuários Médicos (`/api/medical-records`)
    - Avaliações RaDI (`/api/radi`)
    - Registros Diários de Alimentação (`/api/feeding-logs`)
    - Configurações da Clínica (`/api/clinic-config`)
    - Evoluções Oficiais (`/api/evolutions`)
  - Conectado o frontend React (`src/services/mariaDBSync.ts` e `App.tsx`) para ler e gravar em tempo real no MariaDB com sincronização automática e resiliência local.
- [x] **Script de Deploy Automatizado (One-Click Update via Shell Script):**
  - Criado e configurado o script `/var/www/gamaecosystem/update.sh` com permissões de execução.
  - Documentado oficialmente no `agents.md` para deploy automático em 1 clique.
- [x] **Separação de Upload de Marca: Logomarca de Laudos vs Favicon/Ícone PWA:**
  - Reformulada a aba **Configuração de Marca** em dois painéis independentes:
    - Card 1: Logomarca para Relatórios e Laudos (exclusivo para PDFs e papel timbrado).
    - Card 2: Favicon & Ícone do App PWA (para a aba do navegador e ícone de instalação no celular).
  - Redução das distâncias verticais (topo e rodapé do cabeçalho) no papel timbrado (`OfficialLetterhead.tsx`), otimizando o aproveitamento da folha A4 e eliminando vácuos.
  - Redução de ~30% no tamanho da imagem no relatório para **alinhar perfeitamente com a altura do texto do título** (`max-h-20 sm:max-h-24 md:max-h-28`), mantendo proporção ideal e estética profissional.
  - Implementado algoritmo de **Auto-Trim** (`autoTrimCanvas` em `imageOptimizer.ts`) que recorta automaticamente margens brancas/transparentes de imagens enviadas.
  - Favicon com preenchimento de borda a borda (**grande como o do Google AI Studio**), sem margens em branco na aba do navegador.
  - Implementado botão explícito "Salvar Alterações de Marca" com Janela Modal de Confirmação antes de efetivar e gravar permanentemente no banco.
  - **Correção de Persistência no F5:** Implementada gravação imediata no `localStorage`, MariaDB e Firestore no exato momento do upload do arquivo, além de trava de segurança no `App.tsx` que impede que requisições assíncronas vazias sobrescrevam a logo customizada ao recarregar a página.
- [x] **Manual do Usuário Integrado ao Topo com Restrições por Perfil (RBAC):**
  - Adicionado botão discreto ao lado esquerdo do sino de notificações com ícone de interrogação (`HelpCircle`).
  - Ao clicar, abre o **Manual do Usuário** (`UserManualModal.tsx`) contendo janelas e explicações operacionais detalhadas por módulo (O que faz, Como usar passo a passo, Dicas clínicas e Enquadramento regulatório).
  - Segue estritamente a mesma regra de permissão dos módulos: se o usuário não tem acesso ao módulo (ex: PEP, Laudos, Configurações), a respectiva janela do manual não é exibida para ele. Administradores e RT (Adriane Gama) têm acesso irrestrito ao manual completo.
- [x] **Pop-up de Usuário no Topo Estilo Google (Troca de Senha com Senha Atual, Tema e Configurações):**
  - Removido o botão de logout solto e botão de tema da barra superior.
  - Ao clicar no badge do usuário logado, abre um pop-up flutuante contendo:
    - Alternador de Tema Claro e Escuro.
    - Botão de atalho para "Configurações Gerais".
    - Formulário seguro de troca de senha exigindo: **Senha Atual**, Nova Senha e Confirmação.
    - Botão de logout seguro.
  - Reposicionado o **Sino de Notificações** para o **lado esquerdo** do botão do usuário.
- [ ] **Sino de Notificações Integrado com Lista de Pendências Clínicas:**
  - Exibir pop-up/dropdown ao clicar no sino listando todas as pendências do usuário autenticado (assinaturas de evoluções pendentes, familiares aguardando retorno, mensagens não lidas no chat).
  - Incluir links diretos de 1 clique para abrir os respectivos modais e prontuários.
- [x] **Aba Visão Geral (Dashboard) - Seletor Suspenso de Pacientes:**
  - Substituído o botão "Trocar" por um seletor suspenso inteligente (`dropdown`) com indicador de paciente ativo, busca instantânea e troca em 1 clique do paciente em foco na Visão Geral.
- [x] **Limpeza de Resquícios do Firebase na Interface:**
  - Substituída a antiga aba de Firebase pela sub-aba definitiva "Banco de Dados & Servidor" na Central de Configurações, monitorando a conexão local do MariaDB (`gamaecosystem_db`), rotinas de backup e API REST Express.
- [ ] **Correção Cromática e Contraste do Modo Claro (Light Mode):**
  - Revisar botões, badges e fundos pretos com texto escuro/verde que comprometem a legibilidade no tema claro, garantindo alto contraste e elegância visual.
- [ ] **Auditoria Completa dos Módulos para Apresentação Comercial:**
  - Revisão de ponta a ponta em todos os módulos (Pacientes, PEP, RaDI, Diário, Evoluções, Relatórios, Usuários), eliminando lixo e refinando mensagens para demonstração executiva a clientes.

### 🟡 Média Prioridade
- [x] **Módulo de Relatórios e Exportação em Lote:**
  - Implementado o componente `BatchReportsExportModal.tsx` com suporte a seleção granular de pacientes.
  - Exportação em lote de laudos clínicos em PDF com timbrado, marca d'água oficial e chave criptográfica SEAL.
  - Exportação consolidada de indicadores em planilha CSV formatada para prontuários e acompanhamento.
- [x] **Otimização de Code Splitting / Chunking no Vite:**
  - Configurado `manualChunks` no `vite.config.ts` para separar `vendor-pdf` (`jspdf`, `html2canvas`), `vendor-react` e `vendor-icons`, acelerando o carregamento inicial da aplicação.

### 🟢 Baixa Prioridade / Melhorias Futuras
- [x] **Rotinas de Backup Automático do Banco de Dados:**
  - Criado o script `scripts/backup_db.sh` com dump consistente (`--single-transaction`), compressão Gzip e política de retenção de 7 dias.
  - Agendado cronjob diário das 03:00 no Ubuntu.
  - Implementada rota administrativa no Express (`/api/admin/backup` e `/api/admin/backups`) e interface visual na Central de Configurações para acionamento sob demanda.
- [x] **PWA / Notificações no Dispositivo:**
  - [x] Instruções operacionais completas adicionadas ao Manual do Usuário integrado para instalação no Android (Chrome) e iPhone/iPad (Safari).
  - Criado o manifesto W3C (`manifest.json`) com ícones de alta resolução (192x192, 512x512, maskable e apple-touch-icon).
  - Implementado Service Worker (`sw.js`) para carregamento instantâneo e resiliência offline do App Shell.
  - Criado o componente inteligente `PWAInstallPrompt.tsx` com detecção de modo standalone, suporte nativo a prompt no Android/Desktop e instruções de instalação para iOS (Safari).
  - Suporte à API nativa de Notificações do Navegador para lembretes clínicos e de alimentação.

---

## 📜 3. CHANGELOG (Histórico Cronológico de Entregas)

### [v1.1.6] - 2026-10-01: Despoluição Visual do Cabeçalho Superior
- **Design & Usabilidade (Header.tsx):**
  - Removidos os selos estáticos de texto do cabeçalho ("LGPD & Criptografia Ativa" e "MariaDB Conectado").
  - O topo agora fica limpo, elegante e direto ao ponto, destacando a logo, os controles de ação essenciais (Modo Escuro/Claro, Sino de Notificações, Manual) e o perfil do usuário ativo.

### [v1.1.5] - 2026-10-01: Remoção de Resquícios Visuais do Firebase e Padronização MariaDB
- **Eliminação Completa de Menções ao Firebase no Topo e Segurança:**
  - O selo no cabeçalho superior (`Header.tsx`) que exibia *"Firebase / OCI MariaDB Ready"* foi atualizado para **"MariaDB Dedicado Conectado"** com indicador verde esmeralda.
  - Tela de LGPD & Segurança (`LgpdSecurityView.tsx`) atualizada: removida a menção à transição provisória de Firestore, fixando como padrão definitivo o MariaDB InnoDB em produção.
  - Limpeza de comentários internos e estados legados em `ConfigurationView.tsx`.

### [v1.1.4] - 2026-10-01: Portal Overlay para Manual e Guia de Instalação Mobile PWA
- **Renderização por Portal (React Portal):**
  - O Modal do Manual do Usuário (`UserManualModal.tsx`) agora é renderizado via `createPortal` diretamente no `document.body` com `z-[9999]`.
  - Isso garante que a janela sempre fique 100% sobreposta a qualquer componente, cabeçalho ou menu da página, sem risco de ser cortada ou ficar atrás de outros elementos.
  - Fechamento imediato com 1 clique ao clicar no fundo escuro (backdrop) ou no botão X.
- **Capítulo de Instalação PWA no Manual:**
  - Adicionado novo módulo passo a passo no Manual explicando como instalar o aplicativo no Android (Google Chrome) e iPhone/iPad (Safari).

### [v1.1.3] - 2026-10-01: Centralização do Manual do Usuário e Transição Completa MariaDB
- **Interface & Experiência de Usuário:**
  - Janela Modal do Manual do Usuário (`UserManualModal.tsx`) reestruturada para centralização perfeita no meio da tela (viewport), com `max-h-[88vh]` e bordas resguardadas para nunca mais cortar em nenhum dispositivo ou resolução.
  - Substituição da aba "Projeto Firebase & Banco" pela aba **"Banco de Dados MariaDB & Infraestrutura"**, exibindo status ao vivo do MariaDB, API Express, domínio HTTPS e contadores das tabelas relacionais ativas.
  - Sincronização automática dos usuários autenticados da tabela `users` do MariaDB na inicialização do aplicativo.

### [v1.1.2] - 2026-10-01: Seletor Suspenso de Pacientes na Visão Geral (Dashboard)
- **Navegação Clínica Ágil (DashboardView):**
  - Implementado seletor suspenso (`dropdown`) estilizado substituindo o antigo botão "Trocar".
  - Adicionada caixa de busca em tempo real por nome e diagnóstico do paciente com fechamento automático ao clicar fora.
  - Indicador visual do paciente atualmente ativo com contador dinâmico de pacientes cadastrados.

### [v1.1.1] - 2026-10-01: Blindagem Definitiva de Logomarca Oficial e Persistência no F5
- **Identidade Visual e Logomarca Oficial Gama Fonoaudiologia:**
  - Embutida a logomarca oficial (Logo.PNG) diretamente no bundle compilado (src/data/defaultLogo.ts), tornando impossivel a exibicao de icone quebrado.
  - Blindada a sincronizacao do frontend para ignorar o caminho legado /logo-gama.png herdado do banco de dados antigo no boot da aplicacao.
  - Aplicado tratamento com onError e fallback imediato no componente OfficialLetterhead.tsx e ConfigurationView.tsx.
  - Atualizado o endpoint de configuração no banco MariaDB com script direto de sanitização via comando shell.

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
