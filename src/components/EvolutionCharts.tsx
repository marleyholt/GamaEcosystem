import React from 'react';
import { OfficialEvolutionData, FOIS_LEVELS_INFO, PARD_LEVELS_INFO } from '../types/clinicalEvolution';
import { TrendingUp, Activity, Award, ShieldAlert, Calendar, CheckCircle2, ChevronRight } from 'lucide-react';

interface EvolutionChartsProps {
  evolutions: OfficialEvolutionData[];
}

export const EvolutionCharts: React.FC<EvolutionChartsProps> = ({ evolutions }) => {
  if (evolutions.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-[#1f1a17] border border-[#382e27] text-center text-xs text-[#a69a8f]">
        Nenhuma evolução registrada para este paciente ainda. Registre a primeira sessão para gerar os gráficos de curva clínica.
      </div>
    );
  }

  // Ordenar evoluções por data crescente
  const sorted = [...evolutions].sort(
    (a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime()
  );

  const latest = sorted[sorted.length - 1];
  const first = sorted[0];
  const foisDelta = latest.foisLevel - first.foisLevel;

  return (
    <div className="space-y-6">
      {/* Cards de Métricas e Destaques Rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#1f1a17] border border-[#382e27] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#c8a88a] tracking-wider block">
              Escala FOIS Atual
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-[#f4efe8]">
                Nível {latest.foisLevel}
              </span>
              <span className="text-xs text-[#a69a8f]">/ 7</span>
            </div>
            <p className="text-[11px] text-[#a69a8f] mt-1 line-clamp-1">
              {FOIS_LEVELS_INFO.find(f => f.level === latest.foisLevel)?.desc}
            </p>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            foisDelta > 0 ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40' : 'bg-[#27211d] text-[#c8a88a]'
          }`}>
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#1f1a17] border border-[#382e27] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#c8a88a] tracking-wider block">
              Classificação PARD
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-[#f4efe8]">
                Grau {latest.pardLevel}
              </span>
              <span className="text-xs text-[#a69a8f]">/ VII</span>
            </div>
            <p className="text-[11px] text-[#a69a8f] mt-1 line-clamp-1">
              {PARD_LEVELS_INFO.find(p => p.level === latest.pardLevel)?.desc}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#27211d] text-amber-400 border border-[#3e342e] flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#1f1a17] border border-[#382e27] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#c8a88a] tracking-wider block">
              Progresso Clínico
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-2xl font-bold font-mono ${foisDelta >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {foisDelta >= 0 ? `+${foisDelta}` : foisDelta} Níveis FOIS
              </span>
            </div>
            <p className="text-[11px] text-[#a69a8f] mt-1">
              Ao longo de {sorted.length} sessão(ões) registradas
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Gráfico Visual de Curva do FOIS (Functional Oral Intake Scale) */}
      <div className="p-6 rounded-2xl bg-[#1f1a17] border border-[#382e27] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#382e27] pb-3">
          <div>
            <h3 className="text-sm font-bold font-serif text-[#f4efe8] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#c8a88a]" />
              Curva Temporal de Evolução da Ingestão Oral (Escala FOIS)
            </h3>
            <p className="text-xs text-[#a69a8f]">
              Demonstração gráfica da progressão de segurança na via oral ao longo dos atendimentos.
            </p>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#27211d] text-[#c8a88a] border border-[#3e342e] font-mono">
            Meta: FOIS Nível 7 (VO Livre)
          </span>
        </div>

        {/* Gráfico de Barras com Indicador de Altura Proporcional */}
        <div className="pt-4 pb-2">
          <div className="flex items-end justify-between gap-3 h-48 border-b border-[#382e27] px-4 pb-2">
            {sorted.map((item, idx) => {
              const heightPercent = (item.foisLevel / 7) * 100;
              return (
                <div key={item.id} className="flex-1 flex flex-col items-center gap-2 max-w-[80px] group relative">
                  {/* Tooltip com Detalhes da Sessão */}
                  <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-[#14110f] border border-[#44362d] p-2 rounded-lg text-[10px] text-[#f4efe8] whitespace-nowrap shadow-xl z-20 pointer-events-none">
                    <p className="font-bold text-[#c8a88a]">{item.sessionDate}</p>
                    <p>FOIS: Nível {item.foisLevel} | PARD: {item.pardLevel}</p>
                    <p>Via: {item.oralFeedingModality}</p>
                  </div>

                  {/* Valor no Topo da Barra */}
                  <span className="text-xs font-bold font-mono text-[#c8a88a]">
                    N{item.foisLevel}
                  </span>

                  {/* Barra de Progresso */}
                  <div className="w-full bg-[#27211d] rounded-t-lg overflow-hidden flex flex-col justify-end h-32 border border-[#3e342e]">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-linear-to-t from-[#7a5937] to-[#c8a88a] rounded-t transition-all duration-500 group-hover:brightness-110"
                    />
                  </div>

                  {/* Data / Número da Sessão */}
                  <span className="text-[10px] font-mono text-[#a69a8f] truncate w-full text-center">
                    {item.sessionDate.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-[10px] text-[#88786d] pt-2 px-4">
            <span>Sessão Inicial: {first.sessionDate}</span>
            <span>Última Avaliação: {latest.sessionDate}</span>
          </div>
        </div>
      </div>

      {/* Histórico Consolidado com Linha do Tempo */}
      <div className="p-6 rounded-2xl bg-[#1f1a17] border border-[#382e27] space-y-4">
        <h3 className="text-sm font-bold font-serif text-[#f4efe8] flex items-center gap-2 border-b border-[#382e27] pb-3">
          <Calendar className="w-4 h-4 text-[#c8a88a]" />
          Linha do Tempo dos Atendimentos & Condutas Fonoaudiológicas
        </h3>

        <div className="space-y-3">
          {sorted.slice().reverse().map(evo => (
            <div key={evo.id} className="p-4 rounded-xl bg-[#181513] border border-[#2e2621] space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#f4efe8]">{evo.sessionDate}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#27211d] text-[#c8a88a] font-mono font-semibold">
                    FOIS Nível {evo.foisLevel}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 font-mono">
                    PARD {evo.pardLevel}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300">
                    {evo.oralFeedingModality.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-[11px] text-[#a69a8f]">
                  Por: <strong className="text-[#d8cec4]">{evo.therapistName}</strong> ({evo.therapistCrfa})
                </span>
              </div>

              <p className="text-xs text-[#a69a8f] line-clamp-2 leading-relaxed">
                {evo.sessionConductSummary}
              </p>

              {evo.therapies.some(t => t.applied) && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {evo.therapies.filter(t => t.applied).map(t => (
                    <span key={t.name} className="text-[9px] px-2 py-0.5 rounded bg-[#27211d] text-[#c8a88a] border border-[#3e342e]">
                      {t.name.toUpperCase()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
