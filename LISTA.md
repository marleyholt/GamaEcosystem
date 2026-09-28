# LISTA DE DEMANDAS E PRIORIDADES - GAMA ECOSYSTEM

Documento de controle e rastreabilidade de tarefas do projeto GamaEcosystem.
Status possíveis: [PENDENTE], [EM PLANEJAMENTO], [EM EXECUÇÃO], [CONCLUÍDO].

---

## 📌 Topo da Fila (Prioridade Máxima Atual)

1. **[CONCLUÍDO] Fluxo de Primeiro Acesso & Criação de Senha Forte com Firebase Auth (Cuidadores e Fonoaudiólogas)**
   - **Integração Real com Firebase Auth & Firestore:**
     - Provisionamento do banco `gamaecosystem` no projeto `finlhub`.
     - Implementação das regras de segurança (`firestore.rules`) e blueprint intermediário (`firebase-blueprint.json`).
     - Módulo de inicialização e teste de conexão do SDK Firebase (`src/lib/firebase.ts`).
   - **Mecânica do Primeiro Acesso:**
     - O e-mail cadastrado na ficha do cuidador e no cadastro da fonoaudióloga funciona como chave mestre de login.
     - Ao digitar o e-mail cadastrado, o sistema identifica se é o primeiro acesso e abre o formulário de **"Criar Senha de Primeiro Acesso"**.
     - Validador interativo em tempo real de **5 critérios de Senha Forte**: Mínimo de 8 caracteres, letra maiúscula, letra minúscula, número e caractere especial (!@#$), além de confirmação de senha.
     - Registro seguro da credencial no Firebase Auth com fallback local para operação offline ou sem rede.
     - Redirecionamento automático para a área correspondente do usuário conforme seu papel (Cuidador, Fonoaudióloga ou Administradora).
     - Nos acessos subsequentes, o sistema direciona direto para a digitação da senha já cadastrada, com opção de redefinição de senha.

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

- **[CONCLUÍDO] 2026-09-28: Fluxo de Primeiro Acesso & Criação de Senha Forte com Firebase Auth**
- **[CONCLUÍDO] 2026-09-28: Substituição Integral da Evolução Fonoaudiológica (Modelo Oficial 4 Páginas) com Eficiência & Gráficos**
- **[CONCLUÍDO] 2026-09-28: Expansão da Logomarca e E-mail de Acesso de Terapeutas**
- **[CONCLUÍDO] 2026-09-28: Calibração de Proporção da Logo e Cadastro Robusto de Cuidadores**
- **[CONCLUÍDO] 2026-09-28: Configuração de Marca, Upload de Logomarca, Favicon e Herança por Terapeuta**
- **[CONCLUÍDO] 2026-09-28: Menu Lateral Retrátil sob Demanda com Submenus e Botão Sanduíche no Topo**
