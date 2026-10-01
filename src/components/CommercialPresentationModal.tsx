import React, { useState, useMemo } from 'react';
import { 
  X, 
  Building2, 
  Users, 
  Server, 
  HardDrive, 
  Calculator, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  TrendingUp, 
  Download, 
  Smartphone, 
  Activity, 
  Stethoscope, 
  Cpu, 
  Coins, 
  ArrowRight,
  Layers,
  Award,
  Zap,
  Clock,
  Database
} from 'lucide-react';
import { Logo } from './Logo';

interface CommercialPresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommercialPresentationModal: React.FC<CommercialPresentationModalProps> = ({
  isOpen,
  onClose
}) => {
  // Simulador Interativo Comercial
  const [numClinics, setNumClinics] = useState<number>(3);
  const [patientsPerClinic, setPatientsPerClinic] = useState<number>(45);
  const [caregiversPerPatient, setCaregiversPerPatient] = useState<number>(2); // 2 cuidadores/familiares por paciente
  const [therapistsPerClinic, setTherapistsPerClinic] = useState<number>(4);

  // Preço de Venda Proposto (SaaS B2B para Clínicas de Fonoaudiologia & Home Care)
  const [setupFeePerClinic, setSetupFeePerClinic] = useState<number>(3500); // Implantação, parametrização de timbrado e treinamento
  const [monthlyFeePerClinic, setMonthlyFeePerClinic] = useState<number>(1200); // Mensalidade base por clínica

  if (!isOpen) return null;

  // Cálculos de Usuários e Volume de Dados
  const totalPatients = numClinics * patientsPerClinic;
  const totalCaregivers = totalPatients * caregiversPerPatient;
  const totalTherapists = numClinics * therapistsPerClinic;
  const totalActiveUsers = totalPatients + totalCaregivers + totalTherapists;

  // Projeção de Armazenamento e Consumo:
  // - 1 paciente gera em média 4 fotos de refeição/semana comprimidas (~300KB cada = ~1.2MB/semana = ~5MB/mês).
  // - Prontuários, laudos e avaliações RaDI em banco de dados: ~1MB/mês por paciente.
  // - Total aproximado por paciente/mês: ~6MB.
  // - Total anual por paciente: ~72MB (~0.072 GB).
  const estimatedStorageGbPerMonth = Math.max(5, Math.ceil((totalPatients * 0.006) + (totalClinicsDbOverhead(numClinics))));
  const estimatedStorageGbYear = Math.max(15, Math.ceil(estimatedStorageGbPerMonth * 12));

  function totalClinicsDbOverhead(clinics: number) {
    return clinics * 0.5; // logs, backups e overhead relacional
  }

  // Dimensionamento de Infraestrutura de Servidor (Pesquisa de Mercado Cloud 2026: Hetzner / Contabo / Oracle Cloud / AWS Lightsail / DigitalOcean)
  const serverHardwareTier = useMemo(() => {
    if (totalActiveUsers <= 150) {
      return {
        tierName: 'Servidor Inicial (Small Business)',
        specs: '2 vCPU, 4GB RAM, 80GB SSD NVMe, Tráfego 2TB/mês',
        providers: 'Contabo Cloud VPS / Hetzner Cloud (CX22) / Oracle Cloud Free/Ampere',
        monthlyCostBrl: 45, // ~€5 a €8 / mês -> ~R$ 35 a R$ 50
        annualCostBrl: 540,
        bandwidthLimit: '20 Gbps',
        backupCostBrl: 15,
        targetCapacity: 'Até 150 usuários simultâneos / 5 clínicas'
      };
    } else if (totalActiveUsers <= 600) {
      return {
        tierName: 'Servidor Profissional (Scale Pro)',
        specs: '4 vCPU, 8GB RAM, 160GB SSD NVMe, Tráfego 4TB/mês',
        providers: 'Contabo Cloud VPS M / Hetzner (CPX31) / DigitalOcean Droplet',
        monthlyCostBrl: 95, // ~€14 a €18 / mês -> ~R$ 80 a R$ 110
        annualCostBrl: 1140,
        bandwidthLimit: '20 Gbps',
        backupCostBrl: 25,
        targetCapacity: 'Até 600 usuários simultâneos / 15 clínicas'
      };
    } else if (totalActiveUsers <= 2000) {
      return {
        tierName: 'Servidor Enterprise (High Availability)',
        specs: '8 vCPU, 16GB RAM, 300GB SSD NVMe + S3 Storage p/ Fotos',
        providers: 'Hetzner Dedicated Server / AWS Lightsail 16GB / Contabo VPS L',
        monthlyCostBrl: 190, // ~€30 a €35 / mês -> ~R$ 170 a R$ 220
        annualCostBrl: 2280,
        bandwidthLimit: 'GigaBit Full Duplex',
        backupCostBrl: 40,
        targetCapacity: 'Até 2.000 usuários / 50 clínicas'
      };
    } else {
      return {
        tierName: 'Cluster Corporativo (Multi-Node / Enterprise Cluster)',
        specs: 'Cluster Load Balancer + 16 vCPU, 32GB RAM, Banco MariaDB Dedicado + Bucket S3',
        providers: 'Oracle Cloud OCI / AWS ECS / Google Cloud Compute Engine',
        monthlyCostBrl: 420,
        annualCostBrl: 5040,
        bandwidthLimit: 'Cluster Dedicado',
        backupCostBrl: 80,
        targetCapacity: 'Mais de 2.000 usuários ativos em tempo real'
      };
    }
  }, [totalActiveUsers]);

  // Finanças Propostas
  const totalSetupRevenue = numClinics * setupFeePerClinic;
  const totalMonthlyRevenue = numClinics * monthlyFeePerClinic;
  const totalAnnualGrossRevenue = (totalMonthlyRevenue * 12) + totalSetupRevenue;
  
  const totalAnnualInfraCost = (serverHardwareTier.monthlyCostBrl + serverHardwareTier.backupCostBrl) * 12;
  const annualNetProfit = totalAnnualGrossRevenue - totalAnnualInfraCost;
  const profitMarginPercent = totalAnnualGrossRevenue > 0 ? ((annualNetProfit / totalAnnualGrossRevenue) * 100).toFixed(1) : '0';

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl rounded-3xl bg-[#1c1815] border border-[#3f342d] shadow-2xl text-[#f4efe8] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Cabeçalho do Modal com Logo e Selo Oficial */}
        <div className="p-4 sm:p-6 border-b border-[#342b26] bg-[#221d1a] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <div className="border-l border-[#3a312c] pl-3">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-serif font-bold text-[#f4efe8]">
                  Apresentação Técnica & Comercial
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                  Dossiê Executivo
                </span>
              </div>
              <p className="text-xs text-[#a69a8f]">
                Ecossistema Especializado em Fonoaudiologia, Disfagia & Deglutição Clínica
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#a69a8f] hover:text-[#f4efe8] hover:bg-[#2c241f] border border-transparent hover:border-[#3f342d] transition-colors cursor-pointer"
            title="Fechar apresentação"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo com Scrollbar Suave */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-8 scrollbar-thin scrollbar-thumb-[#3a312c]">
          
          {/* 1. SEÇÃO EXECUTIVA: O QUE É O GAMA ECOSYSTEM */}
          <div className="p-5 rounded-2xl bg-[#221d1a]/80 border border-[#342b26] relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#c8a88a]/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-2 text-xs font-bold text-[#c8a88a] uppercase tracking-wider mb-2">
              <Award className="w-4 h-4" />
              <span>Visão Geral do Produto (Value Proposition)</span>
            </div>
            
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#f4efe8] leading-tight">
              A Plataforma Clínica e Assistencial Definitiva para Fonoaudiologia Hospitalar e Domiciliar
            </h3>
            
            <p className="text-xs sm:text-sm text-[#a69a8f] mt-2 leading-relaxed">
              O <strong>GamaEcosystem Health Deglut</strong> é um sistema completo de gestão clínica, segurança do paciente e comunicação interdisciplinar. Criado sob as diretrizes do <strong>Conselho Federal de Fonoaudiologia (CFFa)</strong> e normas internacionais <strong>IDDSI</strong>, o sistema conecta em tempo real o <strong>Fonoaudiólogo Clínico</strong>, a <strong>Equipe Multidisciplinar</strong>, os <strong>Cuidadores e a Família</strong> do paciente disfágico.
            </p>

            {/* Pilares Clínicos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div className="p-3 rounded-xl bg-[#181513] border border-[#2e2621]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#f4efe8]">
                  <Activity className="w-4 h-4 text-rose-400" />
                  <span>Avaliação RaDI</span>
                </div>
                <p className="text-[11px] text-[#a69a8f] mt-1">
                  Cálculo automático de risco de broncoaspiração com condutas preventivas imediatas.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#181513] border border-[#2e2621]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#f4efe8]">
                  <Stethoscope className="w-4 h-4 text-emerald-400" />
                  <span>PEP & Evolução Oficial</span>
                </div>
                <p className="text-[11px] text-[#a69a8f] mt-1">
                  Evoluções com escalas FOIS, PARD, via alimentar e assinatura digital com QR Code.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#181513] border border-[#2e2621]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#f4efe8]">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span>Diário Alimentar Mobile</span>
                </div>
                <p className="text-[11px] text-[#a69a8f] mt-1">
                  O cuidador fotografa o prato no celular e registra tosse, engasgo ou intercorrências.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#181513] border border-[#2e2621]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#f4efe8]">
                  <Download className="w-4 h-4 text-blue-400" />
                  <span>Laudos & Timbrado PDF</span>
                </div>
                <p className="text-[11px] text-[#a69a8f] mt-1">
                  Geração instantânea e em lote de laudos oficiais prontos para convênios e hospitais.
                </p>
              </div>
            </div>
          </div>

          {/* 2. SIMULADOR INTERATIVO COMERCIAL & DE INFRAESTRUTURA */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#342b26]">
              <div>
                <h4 className="text-base font-bold font-serif text-[#f4efe8] flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-[#c8a88a]" />
                  Simulador de Negócio & Dimensionamento de Servidor
                </h4>
                <p className="text-xs text-[#a69a8f]">
                  Ajuste os controles deslizantes para projetar receitas, volumetria de dados e custos de hospedagem em tempo real.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-[#2a221d] text-[#c8a88a] border border-[#3f342d] self-start sm:self-auto">
                Modelo SaaS B2B
              </span>
            </div>

            {/* Controles Deslizantes (Sliders) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-[#181513] border border-[#2e2621]">
              
              {/* Slider 1: Número de Clínicas */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#f4efe8] flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-[#c8a88a]" />
                    Número de Clínicas / Polos Contratantes:
                  </span>
                  <span className="font-bold text-base text-[#c8a88a] bg-[#221d1a] px-2.5 py-0.5 rounded-lg border border-[#342b26]">
                    {numClinics} {numClinics === 1 ? 'clínica' : 'clínicas'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={numClinics}
                  onChange={(e) => setNumClinics(Number(e.target.value))}
                  className="w-full accent-[#c8a88a] bg-[#2a221d] rounded-lg h-2 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#8a7b70]">
                  <span>1 clínica piloto</span>
                  <span>10 clínicas</span>
                  <span>30 redes</span>
                </div>
              </div>

              {/* Slider 2: Pacientes por Clínica */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#f4efe8] flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-400" />
                    Média de Pacientes Ativos por Clínica:
                  </span>
                  <span className="font-bold text-base text-emerald-400 bg-[#221d1a] px-2.5 py-0.5 rounded-lg border border-[#342b26]">
                    {patientsPerClinic} pacientes
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="5"
                  value={patientsPerClinic}
                  onChange={(e) => setPatientsPerClinic(Number(e.target.value))}
                  className="w-full accent-emerald-400 bg-[#2a221d] rounded-lg h-2 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#8a7b70]">
                  <span>10 (consultório)</span>
                  <span>50 (médio porte)</span>
                  <span>200 (grande home care)</span>
                </div>
              </div>

              {/* Slider 3: Cuidadores / Familiares por Paciente */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#f4efe8]">
                    Cuidadores / Familiares por Paciente:
                  </span>
                  <span className="font-bold text-xs text-[#f4efe8] bg-[#221d1a] px-2 py-0.5 rounded border border-[#342b26]">
                    {caregiversPerPatient} {caregiversPerPatient === 1 ? 'cuidador' : 'cuidadores'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={caregiversPerPatient}
                  onChange={(e) => setCaregiversPerPatient(Number(e.target.value))}
                  className="w-full accent-[#c8a88a] bg-[#2a221d] rounded-lg h-2 cursor-pointer"
                />
              </div>

              {/* Slider 4: Mensalidade Proposta por Clínica */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#f4efe8] flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-400" />
                    Mensalidade de Licença por Clínica:
                  </span>
                  <span className="font-bold text-base text-amber-400 bg-[#221d1a] px-2.5 py-0.5 rounded-lg border border-[#342b26]">
                    R$ {monthlyFeePerClinic.toLocaleString('pt-BR')}/mês
                  </span>
                </div>
                <input
                  type="range"
                  min="600"
                  max="3500"
                  step="100"
                  value={monthlyFeePerClinic}
                  onChange={(e) => setMonthlyFeePerClinic(Number(e.target.value))}
                  className="w-full accent-amber-400 bg-[#2a221d] rounded-lg h-2 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#8a7b70]">
                  <span>R$ 600</span>
                  <span>R$ 1.500</span>
                  <span>R$ 3.500</span>
                </div>
              </div>
            </div>

            {/* Painéis de Resultados Proletários: Usuários & Armazenamento */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#221d1a] border border-[#342b26] text-center">
                <span className="text-[11px] text-[#a69a8f] block">Pacientes Cadastrados</span>
                <span className="text-xl sm:text-2xl font-bold font-serif text-[#f4efe8]">
                  {totalPatients}
                </span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">Prontuários e RaDI</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#221d1a] border border-[#342b26] text-center">
                <span className="text-[11px] text-[#a69a8f] block">Cuidadores com Acesso</span>
                <span className="text-xl sm:text-2xl font-bold font-serif text-[#c8a88a]">
                  {totalCaregivers}
                </span>
                <span className="text-[10px] text-[#a69a8f] block mt-0.5">Alimentando diário</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#221d1a] border border-[#342b26] text-center">
                <span className="text-[11px] text-[#a69a8f] block">Total de Usuários no App</span>
                <span className="text-xl sm:text-2xl font-bold font-serif text-amber-300">
                  {totalActiveUsers}
                </span>
                <span className="text-[10px] text-amber-400/80 block mt-0.5">Cuidadores + Pacientes + Fono</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#221d1a] border border-[#342b26] text-center">
                <span className="text-[11px] text-[#a69a8f] block">Espaço em Disco Estimado</span>
                <span className="text-xl sm:text-2xl font-bold font-serif text-blue-300">
                  ~{estimatedStorageGbYear} GB
                </span>
                <span className="text-[10px] text-blue-400 block mt-0.5">Projeção 1 ano (Fotos + BD)</span>
              </div>
            </div>

            {/* 3. DIMENSIONAMENTO DO SERVIDOR & PESQUISA DE MERCADO */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#221d1a] to-[#181513] border border-[#3f342d] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-sm font-bold font-serif text-[#f4efe8]">
                    Máquina Recomendada para o Volume Selecionado
                  </h4>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  {serverHardwareTier.tierName}
                </span>
              </div>

              {/* Detalhes de Hardware */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#141110] border border-[#2e2621]">
                  <span className="text-[#a69a8f] text-[10px] uppercase font-bold block mb-1">
                    Configuração de Hardware
                  </span>
                  <p className="font-semibold text-[#f4efe8]">{serverHardwareTier.specs}</p>
                  <p className="text-[11px] text-emerald-400 mt-1">{serverHardwareTier.targetCapacity}</p>
                </div>

                <div className="p-3 rounded-xl bg-[#141110] border border-[#2e2621]">
                  <span className="text-[#a69a8f] text-[10px] uppercase font-bold block mb-1">
                    Provedores Homologados (Mercado)
                  </span>
                  <p className="font-semibold text-[#c8a88a]">{serverHardwareTier.providers}</p>
                  <p className="text-[11px] text-[#a69a8f] mt-1">Redundância NVMe + Backup Diário</p>
                </div>

                <div className="p-3 rounded-xl bg-[#141110] border border-[#2e2621]">
                  <span className="text-[#a69a8f] text-[10px] uppercase font-bold block mb-1">
                    Custo de Manutenção / Mês
                  </span>
                  <p className="font-bold text-base text-rose-400">
                    R$ {(serverHardwareTier.monthlyCostBrl + serverHardwareTier.backupCostBrl).toFixed(2)} / mês
                  </p>
                  <p className="text-[10px] text-[#a69a8f] mt-0.5">
                    (VPS: R$ {serverHardwareTier.monthlyCostBrl} + Backup: R$ {serverHardwareTier.backupCostBrl})
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#2a221d]/50 border border-[#3f342d] text-xs text-[#a69a8f] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Arquitetura Otimizada:</strong> O Node.js/Express consome menos de 250MB de RAM e o MariaDB com índices consome ~350MB, garantindo que mesmo um servidor de entrada de R$ 45/mês sustente com folga centenas de usuários ativos.
                </span>
              </div>
            </div>

            {/* 4. PROPOSTA COMERCIAL & RETORNO FINANCEIRO (ROI) */}
            <div className="p-5 rounded-2xl bg-[#1d1916] border border-amber-900/40 space-y-4">
              <div className="flex items-center gap-2 text-amber-400">
                <TrendingUp className="w-5 h-5" />
                <h4 className="text-sm font-bold font-serif text-[#f4efe8]">
                  Projeção Financeira do Negócio (Venda + Recorrência)
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-xl bg-[#141110] border border-[#2e2621]">
                  <span className="text-xs text-[#a69a8f] block">Faturamento em Implantação (Setup)</span>
                  <span className="text-lg sm:text-2xl font-bold font-serif text-amber-400 mt-1 block">
                    R$ {totalSetupRevenue.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-[10px] text-[#8a7b70] mt-0.5 block">
                    ({numClinics}x R$ {setupFeePerClinic.toLocaleString('pt-BR')} taxa única)
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#141110] border border-[#2e2621]">
                  <span className="text-xs text-[#a69a8f] block">Faturamento Recorrente Mensal (MRR)</span>
                  <span className="text-lg sm:text-2xl font-bold font-serif text-emerald-400 mt-1 block">
                    R$ {totalMonthlyRevenue.toLocaleString('pt-BR')}/mês
                  </span>
                  <span className="text-[10px] text-[#8a7b70] mt-0.5 block">
                    ({numClinics}x R$ {monthlyFeePerClinic.toLocaleString('pt-BR')} mensalidade)
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#141110] border border-[#2e2621]">
                  <span className="text-xs text-[#a69a8f] block">Lucro Líquido Anual Projetado</span>
                  <span className="text-lg sm:text-2xl font-bold font-serif text-[#c8a88a] mt-1 block">
                    R$ {Math.round(annualNetProfit).toLocaleString('pt-BR')}/ano
                  </span>
                  <span className="text-[10px] text-emerald-400 mt-0.5 block">
                    Margem Operacional de {profitMarginPercent}%
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-[#a69a8f] p-3 rounded-xl bg-[#181513] border border-[#2e2621] space-y-1">
                <p>
                  <strong>• Modelo de Cobrança Sugerido para Clínicas:</strong>
                </p>
                <p>
                  1. <strong>Taxa de Setup & Implantação (R$ 2.500 a R$ 5.000):</strong> Customização da logomarca oficial nos laudos, importação dos primeiros pacientes, treinamento remoto da equipe e parametrização do banco.
                </p>
                <p>
                  2. <strong>Assinatura Mensal (R$ 800 a R$ 2.000/mês por clínica):</strong> Acesso ilimitado para fonoaudiólogos da equipe, emissão ilimitada de laudos em PDF e acesso mobile liberado aos cuidadores e familiares.
                </p>
              </div>
            </div>

            {/* 5. DIFERENCIAIS TÉCNICOS PARA APRESENTAÇÃO */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold font-serif text-[#f4efe8] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#c8a88a]" />
                Argumentos Chave para Fechamento Comercial com Clínicas
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#181513] border border-[#2e2621] flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#f4efe8] block">Elimina 100% de Prontuários em Papel</strong>
                    <span className="text-[#a69a8f]">
                      Evoluções preenchidas pelo fonoaudiólogo ficam salvas com validação cronológica e segurança jurídica.
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#181513] border border-[#2e2621] flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#f4efe8] block">Prevenção Real de Broncoaspiração</strong>
                    <span className="text-[#a69a8f]">
                      O algoritmo RaDI calcula o risco em tempo real e avisa a equipe antes de qualquer incidente com a dieta.
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#181513] border border-[#2e2621] flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#f4efe8] block">Laudos Prontos para Convênios</strong>
                    <span className="text-[#a69a8f]">
                      Papel timbrado oficial da clínica gerado com 1 clique para autorização de sessões e home care.
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#181513] border border-[#2e2621] flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#f4efe8] block">Fidelização da Família do Paciente</strong>
                    <span className="text-[#a69a8f]">
                      O cuidador se sente parte do tratamento ao enviar fotos diárias e assinar digitalmente a evolução.
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Rodapé do Modal */}
        <div className="p-4 sm:p-5 border-t border-[#342b26] bg-[#221d1a] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-[#a69a8f] text-center sm:text-left">
            <span>Dossiê Comercial Interativo • GamaEcosystem v1.2.0 • Modo Apresentação Técnica</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#c8a88a] hover:bg-[#deb887] text-[#181513] font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Entendido / Fechar Apresentação
          </button>
        </div>

      </div>
    </div>
  );
};
