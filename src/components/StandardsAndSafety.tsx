import React, { useState } from 'react';
import { 
  NBR5410_COLORS, 
  NR10_GOLDEN_RULES, 
  COPPER_PVC_B1_2COND, 
  COPPER_PVC_B1_3COND,
  COPPER_XLPE_B1_2COND,
  STANDARD_SECTIONS 
} from '../data/electricalStandards';
import { 
  ShieldCheck, 
  BookOpen, 
  CheckSquare, 
  Square, 
  AlertTriangle, 
  Lock, 
  ZapOff, 
  PowerOff, 
  Zap, 
  Activity,
  Info
} from 'lucide-react';

export const StandardsAndSafety: React.FC = () => {
  const [checkedRules, setCheckedRules] = useState<number[]>([]);

  const toggleRule = (step: number) => {
    setCheckedRules((prev) =>
      prev.includes(step) ? prev.filter((s) => s !== step) : [...prev, step]
    );
  };

  const allRulesChecked = checkedRules.length === 5;

  return (
    <div className="space-y-6">
      {/* Hero Header with Bold Typography style */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-[10px] uppercase font-bold text-white/40 tracking-[0.2em] block mb-1">
            Normas Técnicas & Diretrizes Regulamentadoras
          </span>
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85]">
            NBR 5410 &<br /><span className="text-yellow-400">Segurança</span>
          </h1>
        </div>
        <div className="text-left sm:text-right bg-[#0F0F12] p-4 border border-white/10 rounded-sm">
          <span className="block text-[10px] uppercase font-bold text-white/40 tracking-widest mb-1">
            Conformidade NR-10
          </span>
          <span className="text-2xl sm:text-3xl font-black text-yellow-400 tracking-tight">
            ITEM 10.5.1
          </span>
        </div>
      </div>

      {/* 5 Golden Rules Checklist */}
      <div className="bg-[#0F0F12] rounded-sm p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-yellow-400" />
            Checklist dos 5 Passos da Desenergização NR-10
          </h3>
          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-sm border ${
            allRulesChecked ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-black/40 text-white/40 border-white/10'
          }`}>
            {checkedRules.length} de 5 etapas concluídas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {NR10_GOLDEN_RULES.map((rule) => {
            const isChecked = checkedRules.includes(rule.step);
            return (
              <div
                key={rule.step}
                onClick={() => toggleRule(rule.step)}
                className={`p-4 rounded-sm border cursor-pointer transition-all ${
                  isChecked
                    ? 'bg-yellow-400 text-black border-yellow-400 shadow-md'
                    : 'bg-black/40 border-white/10 hover:border-white/30 text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-black uppercase tracking-wider ${isChecked ? 'text-black' : 'text-yellow-400'}`}>
                    Passo {rule.step}
                  </span>
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-black" />
                  ) : (
                    <Square className="w-4 h-4 text-white/30" />
                  )}
                </div>
                <h4 className={`text-xs font-black uppercase tracking-tight mb-1 ${isChecked ? 'text-black' : 'text-white'}`}>{rule.title}</h4>
                <p className={`text-[11px] leading-relaxed ${isChecked ? 'text-black/80 font-medium' : 'text-white/50'}`}>{rule.description}</p>
              </div>
            );
          })}
        </div>

        {allRulesChecked && (
          <div className="p-3 bg-yellow-400 border border-yellow-400 rounded-sm text-xs font-black uppercase tracking-wider text-black flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-black shrink-0" />
            <span>
              Circuito desenergizado com segurança máxima! Você está pronto para realizar intervenções físicas.
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Wire Colors Standard (Left 6 Cols) */}
        <div className="lg:col-span-6 bg-[#0F0F12] rounded-sm p-6 border border-white/10 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-2 border-b border-white/10 pb-3">
            <Zap className="w-4 h-4 text-yellow-400" />
            Padrão Oficial de Cores de Cabos (NBR 5410 item 6.1.5)
          </h3>

          <div className="space-y-3">
            {NBR5410_COLORS.map((c, idx) => (
              <div key={idx} className="bg-black/40 p-4 rounded-sm border border-white/10 space-y-1.5 font-mono">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-4 h-4 rounded-sm border border-white/20 shadow-sm"
                      style={{ backgroundColor: c.hex }}
                    ></div>
                    <span className="font-black text-xs uppercase tracking-wider text-white">{c.role}</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-yellow-400">{c.colorName}</span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed pl-6">{c.rule}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ampacity Quick Table (Right 6 Cols) */}
        <div className="lg:col-span-6 bg-[#0F0F12] rounded-sm p-6 border border-white/10 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-2 border-b border-white/10 pb-3">
            <BookOpen className="w-4 h-4 text-yellow-400" />
            Tabela Rápida de Capacidade de Corrente (Iz em Cobre)
          </h3>
          <p className="text-[11px] uppercase font-bold text-white/40 tracking-wider">
            Método B1 (Eletroduto embutido em alvenaria a 30°C - NBR 5410 Tabela 36).
          </p>

          <div className="overflow-x-auto rounded-sm border border-white/10">
            <table className="w-full text-left text-xs font-mono text-white/80">
              <thead className="bg-black/60 text-[10px] uppercase font-black tracking-wider text-white/40 border-b border-white/10">
                <tr>
                  <th className="p-3">Seção (mm²)</th>
                  <th className="p-3">PVC (2 Cond)</th>
                  <th className="p-3">PVC (3 Cond)</th>
                  <th className="p-3">XLPE (2 Cond)</th>
                  <th className="p-3 text-yellow-400">Disjuntor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {STANDARD_SECTIONS.slice(0, 8).map((s) => {
                  const pvc2 = COPPER_PVC_B1_2COND[s] || '-';
                  const pvc3 = COPPER_PVC_B1_3COND[s] || '-';
                  const xlpe2 = COPPER_XLPE_B1_2COND[s] || '-';

                  let typicalBreaker = '10A';
                  if (s === 2.5) typicalBreaker = '16A ou 20A';
                  if (s === 4) typicalBreaker = '25A ou 32A';
                  if (s === 6) typicalBreaker = '32A ou 40A';
                  if (s === 10) typicalBreaker = '50A';
                  if (s === 16) typicalBreaker = '63A ou 70A';
                  if (s === 25) typicalBreaker = '80A ou 100A';
                  if (s === 35) typicalBreaker = '125A';

                  return (
                    <tr key={s} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-bold text-white">{s} mm²</td>
                      <td className="p-3">{pvc2} A</td>
                      <td className="p-3">{pvc3} A</td>
                      <td className="p-3 text-yellow-400 font-bold">{xlpe2} A</td>
                      <td className="p-3 font-black text-white">{typicalBreaker}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Multimeter Quick Tips */}
          <div className="bg-black/40 p-4 rounded-sm border border-white/10 space-y-2 text-xs text-white/80 font-mono">
            <span className="font-black text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4" />
              Como Testar Tomada com Multímetro (Escala ACV ~750V):
            </span>
            <ul className="space-y-1.5 text-xs text-white/70 pl-4 list-disc">
              <li><strong>Fase x Neutro:</strong> Deve medir ~127V (em rede 127V) ou ~220V (em rede 220V F+N).</li>
              <li><strong>Fase x Terra:</strong> Deve medir praticamente o mesmo valor de Fase x Neutro (~127V / ~220V).</li>
              <li><strong>Neutro x Terra:</strong> Deve medir idealmente 0V (máx 2V a 5V em redes com queda de tensão). Se medir alta tensão, o neutro pode estar rompido!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
