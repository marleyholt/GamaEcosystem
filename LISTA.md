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
- [x] **Sino de Notificações Integrado com Lista de Pendências Clínicas & Função Limpar:**
  - Dropdown interativo de pendências clínicas em tempo real com contador dinâmico pulsante de pendências não lidas.
  - Rastreamento de evoluções aguardando assinatura de familiares e alertas prioritários de risco de deglutição (RaDI Alto/Moderado).
  - Acesso direto em 1 clique que já seleciona o paciente em questão e abre a aba correspondente.
  - **Função de Limpar Notificações:** Botão "Limpar" no topo e rodapé para limpar todas as notificações de uma vez, além de ícone de lixeira individual para dispensar avisos pontuais.
- [x] **Aba Visão Geral (Dashboard) - Seletor Suspenso de Pacientes:**
  - Substituído o botão "Trocar" por um seletor suspenso inteligente (`dropdown`) com indicador de paciente ativo, busca instantânea e troca em 1 clique do paciente em foco na Visão Geral.
- [x] **Limpeza de Resquícios do Firebase na Interface:**
  - Substituída a antiga aba de Firebase pela sub-aba definitiva "Banco de Dados & Servidor" na Central de Configurações, monitorando a conexão local do MariaDB (`gamaecosystem_db`), rotinas de backup e API REST Express.
- [x] **Correção Cromática e Contraste do Modo Claro (Light Mode):**
  - Mapeamento abrangente de todas as cores hexadecimais em `index.css` para superfícies limpas Alabaster (`#f6f3ee`) e cartões brancos com sombras sutis.
  - Badges de alerta e status (verde, âmbar, vermelho, azul) convertidos para tons pastéis suaves com textos escuros de alto contraste (WCAG AA).
  - Botão de alternância rápida de Modo Claro/Escuro (Sol/Lua) posicionado diretamente no cabeçalho superior para fácil acesso com 1 clique.
- [x] **Auditoria Completa dos Módulos & Dossiê de Apresentação Técnica/Comercial:**
  - Adicionado botão discreto na tela de login: **"Apresentação Comercial & Técnica"**.
  - Criado o modal interativo `CommercialPresentationModal.tsx` com:
    - **Apresentação do Produto & Pilares Clínicos:** RaDI, PEP/Evoluções oficiais, Diário de Alimentação Mobile PWA e Emissão de Laudos com Timbrado Oficial.
    - **Simulador Interativo Comercial (Sliders):** Ajuste em tempo real de número de clínicas (1 a 30), pacientes por clínica (10 a 200), cuidadores por paciente e mensalidade proposta por clínica (R$ 600 a R$ 3.500/mês).
    - **Cálculo Dinâmico de Usuários & Armazenamento:** Projeção automática de total de usuários e consumo anual de disco (fotos de refeições comprimidas + banco relacional MariaDB).
    - **Dimensionamento Realista de Servidores (Pesquisa de Mercado Cloud):** Mapeamento de configuração necessária (vCPU, RAM, NVMe) e provedores homologados (Contabo, Hetzner, Oracle OCI, AWS Lightsail) com custos reais de hospedagem (R$ 45 a R$ 420/mês).
    - **Projeção de Faturamento & ROI:** Cálculo instantâneo de receita de setup/implantação, MRR (faturamento mensal recorrente), custo anual de infraestrutura e margem de lucro líquido operacional (~90%+).

- [x] **Remoção de Modal de Aprovação Manual de Usuários:**
  - O cadastro e primeiro acesso de novos profissionais e cuidadores é vinculado à presença prévia de seus e-mails na aba de Cuidadores ou Equipe/Fonoaudiólogos, dispensando modais manuais de aprovação pendente.
- [x] **Ícone do App & Favicon Ampliado ao Lado do Título GamaEcosystem:**
  - O ícone circular/quadrado do aplicativo no cabeçalho superior e no menu retrátil foi ampliado (`w-12 h-12`), com moldura nítida e renderização em alta definição para perfeita visualização ao lado do título.
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

### [v1.2.0] - 2026-10-01: Consolidação Geral do GamaEcosystem (Notificações, Temas, Marca, Acessos e Apresentação Comercial)
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
