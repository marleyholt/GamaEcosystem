# LISTA DE TAREFAS - GAMAECOSYSTEM

## 🚀 FASE ATUAL: Migração e Deploy no Servidor Ubuntu 20 (Oracle Cloud)

- [x] **1. Inspeção não destrutiva do servidor** (Nginx, portas, MariaDB, projetos existentes verificados).
- [x] **2. Criação do Banco de Dados dedicado** (`gamaecosystem_db` com 9 tabelas InnoDB e usuário `gama_user`).
- [x] **3. Criação e apontamento de DNS** (`gamaecosystem.duckdns.org` -> `152.67.60.236`).
- [x] **4. Configuração de Nginx e Certificado SSL Let's Encrypt** (HTTPS ativo com redirecionamento).
- [x] **5. Remoção da aba Segurança & LGPD** (Conforme solicitação, retirada da navegação).
- [x] **6. Registro de credenciais e infraestrutura no agents.md**.
- [ ] **7. Resolução do conflito de dependências npm e Build no Servidor** (Em andamento).
- [ ] **8. Ativação do processo no PM2** (Porta 3005).
- [ ] **9. Teste de ponta a ponta** no domínio `https://gamaecosystem.duckdns.org`.
