# LISTA DE DEMANDAS E PRIORIDADES - GAMA ECOSYSTEM

Documento de controle e rastreabilidade de tarefas do projeto GamaEcosystem.
Status possíveis: [PENDENTE], [EM PLANEJAMENTO], [EM EXECUÇÃO], [CONCLUÍDO].

---

## 📌 Topo da Fila (Prioridade Máxima Atual)

1. **[CONCLUÍDO] Quebra Automática de Linha (Flex-Wrap) nos Submenus e Abas de Todos os Modais**
   - **Prevenção de Transbordamento:** Removido o travamento `whitespace-nowrap` rígido e barras horizontais cortadas nos submenus de:
     - Prontuário Eletrônico PEP (`MedicalRecordView.tsx`): 7 abas com quebra responsiva de linha fluida.
     - Central de Configurações (`ConfigurationView.tsx`): 5 sub-abas institucionais com `flex-wrap` e espaçamento equilibrado.
     - Formulário Oficial de Evolução 4 Módulos (`OfficialEvolutionForm.tsx`): 4 páginas de navegação responsivas que se adaptam a qualquer largura de tela.
     - Menu Lateral Retrátil Drawer (`Navigation.tsx`): rótulos com quebra dinâmica sem truncamento indesejado.
   - Todos os botões mantêm largura padronizada sem ultrapassar o container e permanecem 100% clicáveis em desktops, tablets e smartphones.

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

- **[CONCLUÍDO] 2026-09-28: Quebra Automática de Linha (Flex-Wrap) nos Submenus e Abas de Todos os Modais**
- **[CONCLUÍDO] 2026-09-28: Tela de Login Direto, Primeiro Acesso e Matriz de Permissões de Janelas por Usuário na Central de Configurações**
- **[CONCLUÍDO] 2026-09-28: Fluxo de Primeiro Acesso & Criação de Senha Forte com Firebase Auth**
- **[CONCLUÍDO] 2026-09-28: Substituição Integral da Evolução Fonoaudiológica (Modelo Oficial 4 Páginas) com Eficiência & Gráficos**
- **[CONCLUÍDO] 2026-09-28: Expansão da Logomarca e E-mail de Acesso de Terapeutas**
- **[CONCLUÍDO] 2026-09-28: Calibração de Proporção da Logo e Cadastro Robusto de Cuidadores**
- **[CONCLUÍDO] 2026-09-28: Configuração de Marca, Upload de Logomarca, Favicon e Herança por Terapeuta**
- **[CONCLUÍDO] 2026-09-28: Menu Lateral Retrátil sob Demanda com Submenus e Botão Sanduíche no Topo**
