# LISTA DE DEMANDAS E PRIORIDADES - GAMA ECOSYSTEM

Documento de controle e rastreabilidade de tarefas do projeto GamaEcosystem.
Status possíveis: [PENDENTE], [EM PLANEJAMENTO], [EM EXECUÇÃO], [CONCLUÍDO].

---

## 📌 Topo da Fila (Prioridade Máxima Atual)

1. **[CONCLUÍDO] Proteção Irrevogável de Acesso MASTER para Adriane Gama**
   - **Regra de Acesso Supremo:** O usuário **Adriane Gama** (e/ou perfis de Administrador e e-mails vinculados `adrianepaesdagama@gmail.com`, `gamafono@gamafono.com.br`) é formalmente blindado como **Usuária MASTER**.
   - **Inviolabilidade de Acesso:** Mesmo que qualquer administrador desmarque por engano opções na tabela ou configure restrições, o motor de autorização do sistema (`Navigation.tsx` e `App.tsx`) força `isMasterUser = true` e garante 100% de acesso perpétuo a todas as 10 janelas e modais clínicos e de configurações.
   - **Trava de Segurança na Matriz de Janelas (`AdminUsersView.tsx`):** Na tela de Gestão de Usuários, o perfil da Adriane exibe o crachá dourado **"Usuária MASTER • Acesso Total Permanente"**, seu botão na tabela é travado em **"Irrevogável (Master)"** e qualquer tentativa acidental de ocultar telas dispara alerta de proteção institucional.

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

- **[CONCLUÍDO] 2026-09-28: Proteção Irrevogável de Acesso MASTER para Adriane Gama**
- **[CONCLUÍDO] 2026-09-28: Quebra Automática de Linha (Flex-Wrap) nos Submenus e Abas de Todos os Modais**
- **[CONCLUÍDO] 2026-09-28: Tela de Login Direto, Primeiro Acesso e Matriz de Permissões de Janelas por Usuário na Central de Configurações**
- **[CONCLUÍDO] 2026-09-28: Fluxo de Primeiro Acesso & Criação de Senha Forte com Firebase Auth**
- **[CONCLUÍDO] 2026-09-28: Substituição Integral da Evolução Fonoaudiológica (Modelo Oficial 4 Páginas) com Eficiência & Gráficos**
- **[CONCLUÍDO] 2026-09-28: Expansão da Logomarca e E-mail de Acesso de Terapeutas**
- **[CONCLUÍDO] 2026-09-28: Calibração de Proporção da Logo e Cadastro Robusto de Cuidadores**
- **[CONCLUÍDO] 2026-09-28: Configuração de Marca, Upload de Logomarca, Favicon e Herança por Terapeuta**
- **[CONCLUÍDO] 2026-09-28: Menu Lateral Retrátil sob Demanda com Submenus e Botão Sanduíche no Topo**
