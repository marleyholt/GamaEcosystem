import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Server, 
  Calculator, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  TrendingUp, 
  Download, 
  Smartphone, 
  Activity, 
  Stethoscope, 
  Coins, 
  Award,
  ArrowLeft
} from 'lucide-react';
import { Logo } from './Logo';

interface CommercialPresentationPageProps {
  onBackToLogin: () => void;
}

export const CommercialPresentationPage: React.FC<CommercialPresentationPageProps> = ({
  onBackToLogin
}) => {
  // Simulador Interativo Comercial
  const [numClinics, setNumClinics] = useState<number>(3);
  const [patientsPerClinic, setPatientsPerClinic] = useState<number>(45);
  const [caregiversPerPatient, setCaregiversPerPatient] = useState<number>(2);
  const [therapistsPerClinic, setTherapistsPerClinic] = useState<number>(4);
  const [setupFeePerClinic, setSetupFeePerClinic] = useState<number>(3500);
  const [monthlyFeePerClinic, setMonthlyFeePerClinic] = useState<number>(1200);

  // Cálculos de Usuários e Volume de Dados
  const totalPatients = numClinics * patientsPerClinic;
  const totalCaregivers = totalPatients * caregiversPerPatient;
  const totalTherapists = numClinics * therapistsPerClinic;
  const totalActiveUsers = totalPatients + totalCaregivers + totalTherapists;

  // Armazenamento
  const estimatedStorageGbPerMonth = Math.max(5, Math.ceil((totalPatients * 0.006) + (numClinics * 0.5)));
  const estimatedStorageGbYear = Math.max(15, Math.ceil(estimatedStorageGbPerMonth * 12));

  // Tier de Servidor
  const getServerTier = () => {
    if (totalActiveUsers <= 150) {
      return {
        tierName: 'Servidor Inicial (Small Business)',
        specs: '2 vCPU, 4GB RAM, 80GB SSD NVMe, Tráfego 2TB/mês',
        providers: 'Contabo Cloud VPS / Hetzner Cloud (CX22) / Oracle Cloud Free/Ampere',
        monthlyCostBrl: 45,
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
        monthlyCostBrl: 95,
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
        monthlyCostBrl: 190,
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
  };

  const serverHardwareTier = getServerTier();

  // Finanças
  const totalSetupRevenue = numClinics * setupFeePerClinic;
  const totalMonthlyRevenue = numClinics * monthlyFeePerClinic;
  const totalAnnualGrossRevenue = (totalMonthlyRevenue * 12) + totalSetupRevenue;
  const totalAnnualInfraCost = (serverHardwareTier.monthlyCostBrl + serverHardwareTier.backupCostBrl) * 12;
  const annualNetProfit = totalAnnualGrossRevenue - totalAnnualInfraCost;
  const profitMarginPercent = totalAnnualGrossRevenue > 0 ? ((annualNetProfit / totalAnnualGrossRevenue) * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-[#141110] text-[#f4efe8] font-sans">
      {/* Barra Superior com Botão de Voltar */}
      <header className="sticky top-0 z-50 bg-[#1c1815]/95 backdrop-blur-md border-b border-[#342b26] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo size="md" />
          <div className="border-l border-[#3a312c] pl-3 hidden sm:block">
            <h1 className="text-sm font-bold font-serif text-[#f4efe8]">
              Apresentação Técnica & Comercial
            </h1>
            <p className="text-[11px] text-[#a69a8f]">
              Ecossistema Clínico Especializado em Deglutição & Disfagia
            </p>
          </div>
        </div>

        <button
          onClick={onBackToLogin}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#27211d] hover:bg-[#342b26] text-[#c8a88a] hover:text-[#f4efe8] border border-[#3f342d] text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Login</span>
        </button>
      </header>

      {/* Conteúdo Central */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        
        {/* Banner de Apresentação */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#1c1815] border border-[#342b26] relative overflow-hidden shadow-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-[#c8a88a] uppercase tracking-wider mb-2">
            <Award className="w-4 h-4" />
            <span>Dossiê Executivo de Solução Clínica</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#f4efe8] leading-tight">
            GamaEcosystem Health Deglut: Gestão Especializada, Segurança do Paciente e Comunicação Hospitalar/Home Care
          </h2>

          <p className="text-sm text-[#a69a8f] mt-3 leading-relaxed max-w-4xl">
            Projetado de acordo com as normas do <strong>Conselho Federal de Fonoaudiologia (CFFa)</strong> e padrões internacionais <strong>IDDSI</strong>. Conecta a fonoaudióloga responsável, a equipe multiprofissional e os cuidadores em uma única plataforma em tempo real.
          </p>

          {/* Cards de Módulos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="p-4 rounded-2xl bg-[#141110] border border-[#2e2621]">
              <Activity className="w-6 h-6 text-rose-400 mb-2" />
              <h3 className="text-xs font-bold text-[#f4efe8]">Rastreio RaDI</h3>
              <p className="text-[11px] text-[#a69a8f] mt-1">
                Estratificação imediata do risco de broncoaspiração e conduta alimentar segura.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#141110] border border-[#2e2621]">
              <Stethoscope className="w-6 h-6 text-emerald-400 mb-2" />
              <h3 className="text-xs font-bold text-[#f4efe8]">PEP & Evoluções</h3>
              <p className="text-[11px] text-[#a69a8f] mt-1">
                Escalas FOIS, PARD, via de alimentação e assinatura digital com QR Code.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#141110] border border-[#2e2621]">
              <Smartphone className="w-6 h-6 text-amber-400 mb-2" />
              <h3 className="text-xs font-bold text-[#f4efe8]">Diário Mobile PWA</h3>
              <p className="text-[11px] text-[#a69a8f] mt-1">
                Fotos de pratos pelo celular do cuidador e registro ágil de intercorrências.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#141110] border border-[#2e2621]">
              <Download className="w-6 h-6 text-blue-400 mb-2" />
              <h3 className="text-xs font-bold text-[#f4efe8]">Laudos Timbrados</h3>
              <p className="text-[11px] text-[#a69a8f] mt-1">
                Emissão individual e em lote em PDF oficial pronto para convênios e hospitais.
              </p>
            </div>
          </div>
        </section>

        {/* Simulador de Negócio e Dimensionamento de Infraestrutura */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#1c1815] border border-[#342b26] space-y-6 shadow-xl">
          <div className="border-b border-[#342b26] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold font-serif text-[#f4efe8] flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#c8a88a]" />
                Simulador Comercial & Dimensionamento de Servidores
              </h2>
              <p className="text-xs text-[#a69a8f] mt-0.5">
                Arraste os controles abaixo para calcular faturamento, volume de usuários e a máquina necessária na nuvem.
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-[#27211d] text-[#c8a88a] border border-[#3f342d] text-xs font-bold self-start sm:self-auto">
              Modelo SaaS B2B
            </span>
          </div>

          {/* Sliders Interativos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-[#141110] border border-[#2e2621]">
            
            {/* Slider 1: Clínicas */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[#f4efe8] flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#c8a88a]" />
                  Número de Clínicas / Polos:
                </span>
                <span className="font-bold text-base text-[#c8a88a] bg-[#221d1a] px-3 py-1 rounded-xl border border-[#342b26]">
                  {numClinics} {numClinics === 1 ? 'clínica' : 'clínicas'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={numClinics}
                onChange={(e) => setNumClinics(Number(e.target.value))}
                className="w-full accent-[#c8a88a] bg-[#2a221d] rounded-lg h-2.5 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#8a7b70]">
                <span>1 piloto</span>
                <span>10 clínicas</span>
                <span>30 redes</span>
              </div>
            </div>

            {/* Slider 2: Pacientes por Clínica */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[#f4efe8] flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-400" />
                  Média de Pacientes por Clínica:
                </span>
                <span className="font-bold text-base text-emerald-400 bg-[#221d1a] px-3 py-1 rounded-xl border border-[#342b26]">
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
                className="w-full accent-emerald-400 bg-[#2a221d] rounded-lg h-2.5 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#8a7b70]">
                <span>10 (consultório)</span>
                <span>50 (médio porte)</span>
                <span>200 (grande home care)</span>
              </div>
            </div>

            {/* Slider 3: Cuidadores por Paciente */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[#f4efe8]">
                  Cuidadores / Familiares por Paciente:
                </span>
                <span className="font-bold text-xs text-[#f4efe8] bg-[#221d1a] px-2.5 py-1 rounded border border-[#342b26]">
                  {caregiversPerPatient} {caregiversPerPatient === 1 ? 'cuidador' : 'cuidadores'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="4"
                value={caregiversPerPatient}
                onChange={(e) => setCaregiversPerPatient(Number(e.target.value))}
                className="w-full accent-[#c8a88a] bg-[#2a221d] rounded-lg h-2.5 cursor-pointer"
              />
            </div>

            {/* Slider 4: Mensalidade Proposta */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[#f4efe8] flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-400" />
                  Mensalidade Sugerida por Clínica:
                </span>
                <span className="font-bold text-base text-amber-400 bg-[#221d1a] px-3 py-1 rounded-xl border border-[#342b26]">
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
                className="w-full accent-amber-400 bg-[#2a221d] rounded-lg h-2.5 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#8a7b70]">
                <span>R$ 600</span>
                <span>R$ 1.500</span>
                <span>R$ 3.500</span>
              </div>
            </div>

          </div>

          {/* Cards de Métricas de Volume */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#141110] border border-[#2e2621] text-center">
              <span className="text-xs text-[#a69a8f] block">Pacientes Cadastrados</span>
              <span className="text-2xl font-bold font-serif text-[#f4efe8] mt-1 block">
                {totalPatients}
              </span>
              <span className="text-[10px] text-emerald-400 block mt-0.5">Prontuários e RaDI</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#141110] border border-[#2e2621] text-center">
              <span className="text-xs text-[#a69a8f] block">Cuidadores com Acesso</span>
              <span className="text-2xl font-bold font-serif text-[#c8a88a] mt-1 block">
                {totalCaregivers}
              </span>
              <span className="text-[10px] text-[#a69a8f] block mt-0.5">Alimentando diário</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#141110] border border-[#2e2621] text-center">
              <span className="text-xs text-[#a69a8f] block">Total de Usuários no App</span>
              <span className="text-2xl font-bold font-serif text-amber-300 mt-1 block">
                {totalActiveUsers}
              </span>
              <span className="text-[10px] text-amber-400/80 block mt-0.5">Fonoaudiólogos + Família</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#141110] border border-[#2e2621] text-center">
              <span className="text-xs text-[#a69a8f] block">Armazenamento em Disco</span>
              <span className="text-2xl font-bold font-serif text-blue-300 mt-1 block">
                ~{estimatedStorageGbYear} GB
              </span>
              <span className="text-[10px] text-blue-400 block mt-0.5">Projeção de 1 ano</span>
            </div>
          </div>

          {/* Dimensionamento do Servidor em Tempo Real */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#221d1a] to-[#141110] border border-[#3f342d] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold font-serif text-[#f4efe8]">
                  Servidor Recomendado no Mercado para Este Volume
                </h3>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold self-start sm:self-auto">
                {serverHardwareTier.tierName}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#181513] border border-[#2e2621]">
                <span className="text-[#a69a8f] text-[10px] uppercase font-bold block mb-1">
                  Configuração de Hardware
                </span>
                <p className="font-semibold text-[#f4efe8] text-sm">{serverHardwareTier.specs}</p>
                <p className="text-[11px] text-emerald-400 mt-1">{serverHardwareTier.targetCapacity}</p>
              </div>

              <div className="p-4 rounded-xl bg-[#181513] border border-[#2e2621]">
                <span className="text-[#a69a8f] text-[10px] uppercase font-bold block mb-1">
                  Provedores Cloud Homologados
                </span>
                <p className="font-semibold text-[#c8a88a] text-sm">{serverHardwareTier.providers}</p>
                <p className="text-[11px] text-[#a69a8f] mt-1">NVMe Redundante + Backup Diário</p>
              </div>

              <div className="p-4 rounded-xl bg-[#181513] border border-[#2e2621]">
                <span className="text-[#a69a8f] text-[10px] uppercase font-bold block mb-1">
                  Custo Mensal Estimado de Manutenção
                </span>
                <p className="font-bold text-lg text-rose-400">
                  R$ {(serverHardwareTier.monthlyCostBrl + serverHardwareTier.backupCostBrl).toFixed(2)} / mês
                </p>
                <p className="text-[10px] text-[#a69a8f] mt-0.5">
                  (Hospedagem VPS + Rotina de Backup)
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#2a221d]/50 border border-[#3f342d] text-xs text-[#a69a8f] flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                <strong>Eficiência de Arquitetura:</strong> Nosso backend em Express consome menos de 200MB de RAM e o banco MariaDB InnoDB consome ~350MB. Uma máquina de R$ 45 a R$ 95/mês sustenta centenas de usuários sem lentidão.
              </span>
            </div>
          </div>

          {/* Projeção Financeira e Lucro Líquido */}
          <div className="p-6 rounded-2xl bg-[#1c1815] border border-amber-900/40 space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <TrendingUp className="w-5 h-5" />
              <h3 className="text-base font-bold font-serif text-[#f4efe8]">
                Retorno Financeiro Projetado (Venda + Recorrência)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-[#141110] border border-[#2e2621]">
                <span className="text-xs text-[#a69a8f] block">Faturamento em Setup / Implantação</span>
                <span className="text-xl sm:text-2xl font-bold font-serif text-amber-400 mt-1 block">
                  R$ {totalSetupRevenue.toLocaleString('pt-BR')}
                </span>
                <span className="text-[10px] text-[#8a7b70] mt-0.5 block">
                  ({numClinics}x R$ {setupFeePerClinic.toLocaleString('pt-BR')} taxa única)
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#141110] border border-[#2e2621]">
                <span className="text-xs text-[#a69a8f] block">Faturamento Mensal Recorrente (MRR)</span>
                <span className="text-xl sm:text-2xl font-bold font-serif text-emerald-400 mt-1 block">
                  R$ {totalMonthlyRevenue.toLocaleString('pt-BR')}/mês
                </span>
                <span className="text-[10px] text-[#8a7b70] mt-0.5 block">
                  ({numClinics}x R$ {monthlyFeePerClinic.toLocaleString('pt-BR')} mensalidade)
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#141110] border border-[#2e2621]">
                <span className="text-xs text-[#a69a8f] block">Lucro Líquido Anual Projetado</span>
                <span className="text-xl sm:text-2xl font-bold font-serif text-[#c8a88a] mt-1 block">
                  R$ {Math.round(annualNetProfit).toLocaleString('pt-BR')}/ano
                </span>
                <span className="text-[10px] text-emerald-400 mt-0.5 block">
                  Margem de Lucro: {profitMarginPercent}%
                </span>
              </div>
            </div>
          </div>

          {/* Argumentos para Fechamento Comercial */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold font-serif text-[#f4efe8] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#c8a88a]" />
              Argumentos Decisivos para Vender a Clínicas e Home Cares
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-xl bg-[#141110] border border-[#2e2621] flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#f4efe8] block">Elimina 100% de Prontuários em Papel</strong>
                  <span className="text-[#a69a8f]">
                    Evoluções salvas com validação cronológica, escalas FOIS/PARD e assinatura digital.
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#141110] border border-[#2e2621] flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#f4efe8] block">Prevenção Real de Broncoaspiração</strong>
                  <span className="text-[#a69a8f]">
                    O algoritmo RaDI avisa a equipe antes de qualquer incidente grave com consistência alimentar.
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#141110] border border-[#2e2621] flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#f4efe8] block">Laudos Prontos para Convênios</strong>
                  <span className="text-[#a69a8f]">
                    Papel timbrado oficial da clínica gerado com 1 clique para autorização de sessões.
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#141110] border border-[#2e2621] flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#f4efe8] block">Fidelização Total da Família</strong>
                  <span className="text-[#a69a8f]">
                    O familiar participa ativamente enviando fotos das refeições e acompanhando a evolução.
                  </span>
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* Rodapé com Botão de Voltar */}
        <div className="text-center pt-4 pb-12">
          <button
            onClick={onBackToLogin}
            className="px-8 py-3 rounded-2xl bg-[#c8a88a] hover:bg-[#deb887] text-[#181513] font-bold text-sm shadow-xl transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retornar para a Tela de Login</span>
          </button>
        </div>

      </main>
    </div>
  );
};
