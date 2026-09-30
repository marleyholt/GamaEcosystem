Diretrizes:

REGRA DE OURO: SEMPRE SEGUIR AS DIRETRIZES DO agents.md

- Vai executar sempre uma coisa de cada vez, se eu pedir mais de uma, você vai ponderar, listar e executar por prioridades.
- Sequencia lógica: 1: Análise do escopo solicitado | 2: Planejamento e definição da solução | 3: Apresentação das propostas de execução numeradas | 4 (acontece somente depois de eu responder a fase 3: Execuçãão do planejamento | 5: Uma vez executada uma das opções e validadada você deve dizer o que fez, o que esperar, como testar e listar os itens restantes da lista para eu escolher ou adicionar novas solicitações. a lista deve ser mantida organizada através de um arquivo LISTA.md que vc vai criar aqui no ambiente do google ia studio para vc poder consultar.
- Seja cortez, técnico e objetivo. Sem Firulas, gambiarras e sem bajulação.
- TOKEN GitHUB para o push automatico de tudo que for alterado : [CONFIGURADO_VIA_SECRETS_GH_TOKEN] (Final: 4xtBO)
- Repositório Oficial: marleyholt/GamaEcosystem
- Todo o desenvolvimento será testado via google IA Studio e no Github Pages. Quando o projeto for validade será enviado para um servidor ubunto com mysql, portanto temos que comaptibilizar. Servidor por hora será um VM Always Free da Coracle
- Estamos desenvolvimento um sistema par aum cliente, volta e meia trarei alguns braisnstorms para analizarmos a melhor solução.
- Quando eu disser que vamos transferir o sistema pro servidor, você vai começar a elaborar os comandos tipo EOF, nos quais eu apenas vou copiar aqui e colar no meu terminar powershell

---

## 📌 Informações Técnicas de Infraestrutura e Produção (GamaEcosystem)

- **Servidor:** Ubuntu 20.04.6 LTS (Oracle Cloud Infrastructure - VM Always Free)
- **IP do Servidor (Oracle OCI):** `152.67.60.236`
- **Usuário SSH:** `ubuntu`
- **Chave SSH:** `ssh-key-2026-08-22.key` (OneDrive local)
- **Domínio / DNS Dedicado:** `https://gamaecosystem.duckdns.org` (Apontado para `152.67.60.236`)
- **Servidor Web / Proxy Reverso:** Nginx com Certbot SSL Let's Encrypt ativo
  - **Arquivo de Configuração Nginx:** `/etc/nginx/sites-available/gamaecosystem.conf`
  - **Sites Enabled:** `/etc/nginx/sites-enabled/gamaecosystem.conf`
  - **Porta Interna da Aplicação:** `3005` (exclusiva, escutando em `127.0.0.1:3005`)
- **Diretório da Aplicação no Servidor:** `/var/www/gamaecosystem`
- **Gerenciador de Processos:** PM2 (`name: gamaecosystem`)
  - **Comando de Restart:** `pm2 restart gamaecosystem`
  - **Comando de Logs:** `pm2 logs gamaecosystem`
- **Script Oficial de Atualização Contínua (One-Click Deploy):**
  - **Caminho:** `/var/www/gamaecosystem/update.sh`
  - **Execução:** `/var/www/gamaecosystem/update.sh`
  - **Operações Realizadas pelo Script:**
    1. Executa `git reset --hard` e `git pull origin main` para sincronizar o repositório.
    2. Roda `npm run build` para compilar o frontend com otimização de chunks.
    3. Reinicia e salva o processo gerenciado no PM2 (`sudo pm2 restart gamaecosystem`).
- **Rotina de Backup Automático do Banco MariaDB:**
  - **Script de Dump:** `/var/www/gamaecosystem/scripts/backup_db.sh`
  - **Diretório de Armazenamento:** `/var/backups/gamaecosystem`
  - **Periodicidade:** Cronjob diário às 03:00 (`0 3 * * *`)
  - **Formato:** `gamaecosystem_YYYYMMDD_HHMMSS.sql.gz` (compactado com gzip)
  - **Política de Retenção:** Expurgo automático de backups com mais de 7 dias
  - **Acionamento Manual:** Disponível via rota `/api/admin/backup` ou botão na tela de Configurações do App.
- **Suporte a PWA & Aplicativo Mobile:**
  - **Manifesto:** `/manifest.json` com `display: standalone` e tema `#c8a88a`
  - **Service Worker:** `/sw.js` com cache de casca (App Shell) e resiliência offline
  - **Ícones em Alta Resolução:** `pwa-192x192.png`, `pwa-512x512.png`, `pwa-maskable-512x512.png` e `apple-touch-icon.png`
  - **Instalabilidade Nativa:** Componente `PWAInstallPrompt.tsx` com banner responsivo e instruções personalizadas para iOS e Android.

### 🗄️ Banco de Dados Dedicado (MariaDB / MySQL)
- **Host:** `127.0.0.1` (Porta padrão: `3306`)
- **Database (Isolado e Exclusivo):** `gamaecosystem_db`
- **Usuário do Banco:** `gama_user`
- **Senha do Banco:** `GamaEco#2026!Secure`
- **Charset / Collate:** `utf8mb4` / `utf8mb4_unicode_ci`
- **Motor:** `InnoDB` (ACID com integridade referencial)
- **Tabelas do Sistema:**
  1. `clinic_config` (Dados da clínica, RT, CRFa)
  2. `users` (Acessos, perfis e aprovações)
  3. `caregivers` (Cuidadores e vínculos)
  4. `therapists` (Fonoaudiólogos e terapeutas)
  5. `patients` (Fichas cadastrais completas)
  6. `patient_medical_records` (Prontuário PEP e prescrições)
  7. `radi_assessments` (Avaliações clínicas RaDI)
  8. `daily_feeding_logs` (Registros de refeições e deglutição)
  9. `official_evolutions` (Evoluções oficiais com assinaturas)
- **Arquivo de Schema SQL:** `/schema.sql` (no repositório oficial)
