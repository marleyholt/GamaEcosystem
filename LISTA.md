# LISTA DE DEMANDAS E PRIORIDADES - GAMA ECOSYSTEM

Documento de controle e rastreabilidade de tarefas do projeto GamaEcosystem.
Status possíveis: [PENDENTE], [EM PLANEJAMENTO], [EM EXECUÇÃO], [CONCLUÍDO].

---

## 📌 Topo da Fila (Prioridade Máxima Atual)

1. **[CONCLUÍDO] Tela de Login Direto, Primeiro Acesso e Matriz de Permissões de Janelas por Usuário na Central de Configurações**
   - **Reestruturação Completa da Tela de Autenticação (`AuthModal.tsx`):**
     - Remoção definitiva da aba de perfis de demonstração do topo.
     - Duas abas diretas: **"Login (Já tenho senha)"** (com e-mail, senha, visualizador de senha e botão funcional **"Esqueci minha senha"**) e **"Primeiro Acesso (Criar Senha)"** (com os 5 critérios em tempo real de senha forte e confirmação).
     - Integração com Firebase Authentication para verificação de credenciais.
   - **Gestão de Usuários na Central de Configurações (`ConfigurationView.tsx` & `AdminUsersView.tsx`):**
     - A gestão de usuários foi movida para dentro da **Central de Configurações** (como a 5ª sub-aba: *Gestão de Usuários & Telas*), limpando o menu principal.
     - **Tabela / Matriz de Janelas e Modais:** Catálogo completo de todas as 10 telas do sistema (*Visão Geral, Prontuário 4 Módulos, RaDI, Registro Diário, Linha do Tempo, Chat, Pacientes, Laudos, Segurança, Configurações*).
     - Seletor de usuário à esquerda e botões de ação imediata **"Permitir"** (Visível) ou **"Ocultar"** (Oculto) para cada tela individual, além de botões **"Marcar Todas"** e **"Desmarcar Todas"**.
     - O menu lateral drawer passa a respeitar rigorosamente a matriz: módulos desmarcados ficam 100% invisíveis para aquele usuário.

---

## 📋 Itens em Espera / Próximas Demandas

2. **[PENDENTE] Assinatura / Rubrica Digital do Familiar na Sessão**
   - Captura touch/mouse de assinatura na evolução de atendimento (comprovante de comparecimento estilo entrega).
   - Vinculação com data, hora e dados do responsável.

3. **[PENDENTE] Relatório de Acompanhamento Mensal Consolidado**
   - Agregação mensal de todas as evoluções do paciente ao longo do mês.
   - Compatibilização com o modelo oficial a ser enviado pela cliente Adri.

4. **[PENDENTE] Ajustes Finais e Refinamentos de Detalhe da Logomarca no Timbrado**
   - Ajustes milimétricos no espaçamento e alinhamento visual final da logomarca no cabeçalho.

---

## ✅ Histórico de Itens Concluídos

- **[CONCLUÍDO] 2026-09-28: Tela de Login Direto, Primeiro Acesso e Matriz de Permissões de Janelas por Usuário na Central de Configurações**
- **[CONCLUÍDO] 2026-09-28: Fluxo de Primeiro Acesso & Criação de Senha Forte com Firebase Auth**
- **[CONCLUÍDO] 2026-09-28: Substituição Integral da Evolução Fonoaudiológica (Modelo Oficial 4 Páginas) com Eficiência & Gráficos**
- **[CONCLUÍDO] 2026-09-28: Expansão da Logomarca e E-mail de Acesso de Terapeutas**
- **[CONCLUÍDO] 2026-09-28: Calibração de Proporção da Logo e Cadastro Robusto de Cuidadores**
- **[CONCLUÍDO] 2026-09-28: Configuração de Marca, Upload de Logomarca, Favicon e Herança por Terapeuta**
- **[CONCLUÍDO] 2026-09-28: Menu Lateral Retrátil sob Demanda com Submenus e Botão Sanduíche no Topo**
