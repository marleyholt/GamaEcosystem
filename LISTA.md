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

### [v1.3.8] - 2026-10-02: Configuração de Rubrica Técnica e Assinatura Digital
- **Módulo de Rubrica RT:**
  - Adicionado painel em "Configuração de Marca" para upload da assinatura digitalizada da Responsável Técnica (RT).
  - Inclui auto-otimização e recorte de transparência para que a rubrica fique limpa e centralizada no papel timbrado.
- **Identificação Profissional Completa:**
  - O Papel Timbrado agora substitui o nome simples da RT pela rubrica digitalizada + Nome + CRFa + CPF quando o modelo com assinatura for selecionado.
- **Sincronização de Banco:**
  - Garantida a persistência da `signatureUrl` no MariaDB para que a rubrica não se perca no F5.

### [v1.3.7] - 2026-10-02: Otimização de Imagens (JPEG 60%) e Histórico Ampliado
- **Compactação Nativa de Fotos:**
  - Implementada compactação JPEG (60% qualidade) e redimensionamento HD (1280px) automático no upload de fotos de refeição.
  - Isso reduz drasticamente o consumo de banda e evita o erro `413 (Payload Too Large)` mesmo com várias fotos.
- **Persistência de Logs no MariaDB:**
  - Ativado o endpoint `/api/feeding-logs` que estava pendente no servidor.
  - Adicionada coluna `photos_json` no banco de dados para salvar as fotos permanentemente.
- **Melhoria Visual no Histórico:**
  - Fotos no histórico clínico agora são exibidas em tamanho ampliado (`w-40`).
  - Adicionado recurso de "Clique para Ampliar" (LightBox) para visualização detalhada em tela cheia.

### [v1.3.6] - 2026-10-02: Resiliência Máxima, Correção de Loops e Aumento de Payload
- **Correção de Loop Infinito (Recursividade):**
  - Corrigido o erro `Maximum call stack size exceeded` que travava o sistema ao tentar gravar no `localStorage`.
- **Estabilização de Grandes Payloads (Fotos):**
  - Aumentado o limite de recepção do servidor MariaDB/Express para **200MB** para suportar múltiplos registros com fotos em alta definição sem erro `413`.
- **Sincronização Visual de Marca:**
  - O Favicon e Logo agora são passados diretamente para o `Header`, garantindo que qualquer alteração de marca seja refletida instantaneamente sem necessidade de refresh.
  - Implementada gravação segura no `localStorage` que ignora falhas se o limite do navegador for atingido, priorizando o banco de dados.

### [v1.3.5] - 2026-10-02: Fix de Persistência de Logo e Favicon no MariaDB e Fim de Sobrescrita no F5
- **Persistência de Imagens Nativas no Banco:**
  - Adicionada coluna `favicon_url` na tabela `clinic_config` do MariaDB via auto-migração resiliente.
  - Ajustadas as rotas de backend (`server_prod.cjs`) para salvar e retornar tanto o `logo_url` quanto o `favicon_url` sem perdas.
- **Resiliência ao Refresh (F5):**
  - Removida a lógica agressiva no `App.tsx` que substituía imagens personalizadas por padrões fictícios durante o carregamento.
  - Sincronização bidirecional entre `localStorage` e MariaDB priorizando a "Fonte da Verdade" do banco de dados quando disponível.
- **Banco de Dados Flexível:**
  - Removidas restrições `NOT NULL` de campos cadastrais no banco para permitir que o sistema aceite estados em branco sem falhar no salvamento.

### [v1.3.4] - 2026-10-02: Formulário de Clínica & RT com Padrão em Branco e Limpeza de Fallbacks Fictícios
- **Padrão 100% em Branco (Zero Dados Fictícios):**
  - Todos os campos do formulário da aba *Clínica & Responsável Técnica* iniciam completamente vazios por padrão (`""`).
  - Adicionados placeholders contextuais e elegantes para guiar o preenchimento sem preencher o campo de verdade.
- **Persistência Estrita e Fiel:**
  - O sistema e o banco MariaDB não inserem mais valores legados como `GAMA FONOAUDIOLOGIA`, `Adriane Gama`, `gamafono@gamafono.com.br` ou `CREFONO 9531-RJ` automaticamente.
  - O que estiver salvo no banco MariaDB é exatamente o que foi digitado pelo usuário. Se nada foi cadastrado, os campos e os cards permanecem limpos e em branco.
- **Sincronização Condicional com Fono & Equipe:**
  - A RT só é criada/exibida na aba *Fonoaudiólogas & Equipe* se houver dados cadastrados na aba *Clínica & RT*, respeitando listas vazias por padrão.

### [v1.3.3] - 2026-10-02: Remoção Total do Firebase & Sincronização Atômica da RT
- **Remoção Completa do Firebase/Firestore:**
  - Removida dependência `"firebase"` do `package.json`, excluídos os arquivos residuais `src/lib/firebase.ts`, `src/services/firestoreSync.ts`, `firestore.rules` e `firebase-applet-config.json`.
  - Arquitetura 100% MariaDB/MySQL nativa.
- **Sincronização Atômica da Responsável Técnica (RT):**
  - No backend (`server_prod.cjs`), salvar a aba *Clínica & RT* atualiza atomicamente tanto `clinic_config` quanto a linha da RT (`th_rt`) na tabela `therapists`.
  - No frontend (`App.tsx`), a sequência de carga no F5 processa primeiro a configuração da clínica como fonte da verdade e sincroniza imediatamente a lista de fonoaudiólogas, garantindo que `adrianepaesdagama@gmail.com` e todos os dados permaneçam idênticos em ambas as abas.

### [v1.3.2] - 2026-10-02: Compatibilização do Balão de Sucesso no Tema Claro & Sincronização Estrita do E-mail da RT
- **Compatibilização Total do Balão de Sucesso (Toast) & Modais no Tema Claro:**
  - O balão "Configurações salvas com sucesso!" e o modal de confirmação foram 100% harmonizados para o tema claro, com fundo suave menta (`#d1fae5`), texto verde escuro de alto contraste (`#065f46`) e borda nítida, eliminando herança de fundo escuro.
- **Sincronização Estrita e Durabilidade do E-mail da RT (`adrianepaesdagama@gmail.com`):**
  - Corrigida a divergência entre a aba 'Clínica & Responsável Técnica' e 'Fonoaudiólogas & Equipe'.
  - Ao salvar o e-mail na aba Clínica & RT, tanto o banco MariaDB quanto a lista de Fono & Equipe são atualizados na hora.
  - Ao recarregar com F5, a função de sincronização restaura o e-mail cadastrado em ambas as abas sem reverter para o valor antigo.

### [v1.3.1] - 2026-10-02: Máscaras de Telefone/CPF em Fono & Equipe, Usuário Master Atualizado & Persistência Dupla de Configurações
- **Máscaras de Entrada e Limitação de Caracteres Padronizadas:**
  - Aplicada formatação dinâmica e limite de caracteres nos campos de CPF (`000.000.000-00` - 14 chars) e Telefone/WhatsApp (`(21) 98988-7981` - 15 chars) no cadastro de Fonoaudiólogas & Equipe e na aba Clínica e RT.
- **Persistência Dupla e Mapeamento Rigoroso de Configurações da Clínica:**
  - Corrigido mapeamento bidirecional (`snake_case` e `camelCase`) das colunas do MariaDB (`clinic_name`, `technical_manager_name`, `technical_manager_crfa`, `phone`, etc.) tanto no endpoint `/api/clinic-config` quanto em `/api/sync/all`.
  - Ao recarregar (F5), os dados salvos na aba Clínica e RT permanecem intactos.
- **Usuário Master Atualizado:**
  - Ajustado o cadastro master para **Filipe Leão da Gama** com e-mail **`filipe.gama@hotmail.com`** e acesso irrestrito de Administrador (`admin`).

### [v1.3.0] - 2026-10-02: Eliminação Definitiva do Firebase, Sincronização MariaDB & Gestão de RT e Usuários
- **Desconexão Total do Firebase & Firestore:**
  - Remoção de dependências e sincronizações do Firestore em login, primeiro acesso e configurações.
  - Toda a persistência agora é realizada via endpoints REST diretos conectados ao MariaDB/MySQL.
- **Persistência Imediata de Configurações da Clínica & Blindagem no F5:**
  - Correção do recarregamento que revertia alterações: dados agora salvam no banco MariaDB e no cache imediatamente, sem sobrescrita.
- **Sincronização Automática da Responsável Técnica (RT):**
  - Dados do RT (Nome, CRFa, E-mail, Contatos) espelhados automaticamente como primeiro membro protegido na aba 'Fonoaudiólogas & Equipe'.
  - O e-mail do RT passa a ser sua credencial oficial de login com perfil de Administrador (`admin`).
- **Inclusão Imediata em Gestão de Usuários & Telas:**
  - Novos profissionais cadastrados aparecem instantaneamente na aba de Gestão de Usuários para liberação prévia de telas, antes mesmo da criação de senha no primeiro acesso.
- **Servidor Express de Produção com Pool MariaDB:**
  - Rotas nativas `/api/clinic-config`, `/api/therapists`, `/api/caregivers`, `/api/users`, `/api/patients` e `/api/sync/all`.

### [v1.2.0] - 2026-10-01: Consolidação Geral do GamaEcosystem (Notificações, Temas, Marca, Acessos e Apresentação Comercial)
- **Consistência de Identidade & Nome de Exibição Fixo por Cadastro:**
  - Regra estrita de auditoria: o nome de exibição exibido no sistema é estritamente o nome cadastrado no usuário (evitando inconsistências de assinatura ou adulteração de perfis clínicos).
  - Configurado o usuário mestre/desenvolvedor `filipe.gama@hotmail.com` (e `leaog.8@gmail.com`) com nome de exibição fixado como `Filipe (DEV)` com privilégios administrativos.
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
