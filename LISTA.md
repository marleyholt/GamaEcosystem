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
- [ ] **Script de Deploy Automatizado (One-Click Update via Git Hook / Script):**
  - Criar um script `update.sh` em `/var/www/gamaecosystem` para atualizar o código via `git pull`, rodar `npm run build` e recarregar o PM2 de forma rápida e segura.

### 🟡 Média Prioridade
- [x] **Módulo de Relatórios e Exportação em Lote:**
  - Implementado o componente `BatchReportsExportModal.tsx` com suporte a seleção granular de pacientes.
  - Exportação em lote de laudos clínicos em PDF com timbrado, marca d'água oficial e chave criptográfica SEAL.
  - Exportação consolidada de indicadores em planilha CSV formatada para prontuários e acompanhamento.
- [x] **Otimização de Code Splitting / Chunking no Vite:**
  - Configurado `manualChunks` no `vite.config.ts` para separar `vendor-pdf` (`jspdf`, `html2canvas`), `vendor-react` e `vendor-icons`, acelerando o carregamento inicial da aplicação.

### 🟢 Baixa Prioridade / Melhorias Futuras
- [ ] **Rotinas de Backup Automático do Banco de Dados:**
  - Criar cronjob diário no Ubuntu para `mysqldump` com retenção de 7 dias do banco `gamaecosystem_db`.
- [ ] **PWA / Notificações no Dispositivo:**
  - Suporte a instalação como App no celular do cuidador e fonoaudiólogo.

---

## 📜 3. CHANGELOG (Histórico Cronológico de Entregas)

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
