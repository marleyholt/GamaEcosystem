# LISTA DE DEMANDAS E PRIORIDADES - GAMA ECOSYSTEM

Documento de controle e rastreabilidade de tarefas do projeto GamaEcosystem.
Status possíveis: [PENDENTE], [EM PLANEJAMENTO], [EM EXECUÇÃO], [CONCLUÍDO].

---

## 📌 Topo da Fila (Prioridade Máxima Atual)

1. **[CONCLUÍDO] Assinatura / Rubrica Digital do Familiar e Fonoaudióloga na Sessão de Atendimento**
   - **Fluxo Sequencial de Aprovação:**
     - 1. A Fonoaudióloga/Terapeuta preenche o relatório oficial da sessão (4 páginas). Ao salvar, pode assinar digitalmente via touch/mouse ou selecionar sua rubrica oficial cadastrada. O status passa para `"aguardando_familiar"`.
     - 2. O paciente/cuidador/familiar acessa o prontuário em modo de visualização segura para conferência do atendimento e apõe sua assinatura/rubrica digital na tela com dados rastreáveis.
     - 3. Com ambas as partes assinadas, o status passa para `"finalizado_assinado"`.
   - **Rastreabilidade e Evidências Legais (Lei 14.063/20 & CFM/CFFa):**
     - Código identificador exclusivo auditável por assinatura (ex: `GAMA-SIG-9F8A2B1C-2026`).
     - Carimbo de Data/Hora ISO exato.
     - Captura de IP público da rede e localização geográfica / GPS.
     - Hash de integridade criptográfica SHA-256 do documento.
   - **Emissão Condicional do PDF em Papel Timbrado:**
     - O botão de emissão/download do PDF de 4 páginas com papel timbrado da clínica só é liberado após a assinatura de ambas as partes.
     - A 4ª página do PDF impresso contém o quadro duplo oficial de auditoria eletrônica com os traços das duas rubricas, códigos de autenticidade, hashes SHA-256, IPs, datas e documentos de ambos os signatários.

---

## 📋 Itens em Espera / Próximas Demandas

2. **[PENDENTE] Relatório de Acompanhamento Mensal Consolidado**
   - Agregação mensal de todas as evoluções do paciente ao longo do mês.
   - Compatibilização com o modelo oficial a ser enviado pela cliente Adri.

3. **[PENDENTE] Ajustes Finais e Refinamentos de Detalhe da Logomarca no Timbrado**
   - Ajustes milimétricos no espaçamento e alinhamento visual final da logomarca no cabeçalho.

---

## ✅ Histórico de Itens Concluídos

- **[CONCLUÍDO] 2026-09-29: Assinatura / Rubrica Digital do Familiar e Fonoaudióloga na Sessão de Atendimento com Rastreabilidade (IP, Data, Hora, Local e Hash)**
- **[CONCLUÍDO] 2026-09-28: Proteção Irrevogável de Acesso MASTER para Adriane Gama**
- **[CONCLUÍDO] 2026-09-28: Quebra Automática de Linha (Flex-Wrap) nos Submenus e Abas de Todos os Modais**
- **[CONCLUÍDO] 2026-09-28: Tela de Login Direto, Primeiro Acesso e Matriz de Permissões de Janelas por Usuário na Central de Configurações**
- **[CONCLUÍDO] 2026-09-28: Fluxo de Primeiro Acesso & Criação de Senha Forte com Firebase Auth**
- **[CONCLUÍDO] 2026-09-28: Substituição Integral da Evolução Fonoaudiológica (Modelo Oficial 4 Páginas) com Eficiência & Gráficos**
- **[CONCLUÍDO] 2026-09-28: Expansão da Logomarca e E-mail de Acesso de Terapeutas**
- **[CONCLUÍDO] 2026-09-28: Calibração de Proporção da Logo e Cadastro Robusto de Cuidadores**
- **[CONCLUÍDO] 2026-09-28: Configuração de Marca, Upload de Logomarca, Favicon e Herança por Terapeuta**
- **[CONCLUÍDO] 2026-09-28: Menu Lateral Retrátil sob Demanda com Submenus e Botão Sanduíche no Topo**
