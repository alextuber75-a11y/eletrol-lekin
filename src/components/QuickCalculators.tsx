import React, { useState, useMemo } from 'react';
import { 
  calculateOhmsLaw, 
  calculatePowerTriangle, 
  calculateConduitSize, 
  STANDARD_CONDUITS 
} from '../utils/electricalCalculations';
import { APPLIANCE_PRESETS } from '../data/electricalStandards';
import { 
  Calculator, 
  Zap, 
  Layers, 
  DollarSign, 
  Plus, 
  Trash2, 
  PieChart, 
  TrendingUp, 
  Cpu,
  Info,
  CheckCircle2
} from 'lucide-react';

export const QuickCalculators: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'ohm' | 'powerFactor' | 'conduit' | 'cost'>('ohm');

  // --- Ohm's Law State ---
  const [ohmValues, setOhmValues] = useState<{
    voltage: string;
    current: string;
    resistance: string;
    power: string;
  }>({
    voltage: '220',
    current: '10',
    resistance: '',
    power: '',
  });

  const ohmResult = useMemo(() => {
    const v = ohmValues.voltage !== '' ? parseFloat(ohmValues.voltage) : undefined;
    const i = ohmValues.current !== '' ? parseFloat(ohmValues.current) : undefined;
    const r = ohmValues.resistance !== '' ? parseFloat(ohmValues.resistance) : undefined;
    const p = ohmValues.power !== '' ? parseFloat(ohmValues.power) : undefined;
    return calculateOhmsLaw({ voltage: v, current: i, resistance: r, power: p });
  }, [ohmValues]);

  // --- Power Factor State ---
  const [pfActivePowerKW, setPfActivePowerKW] = useState<number>(30); // kW
  const [pfCurrentCosPhi, setPfCurrentCosPhi] = useState<number>(0.78);
  const [pfTargetCosPhi, setPfTargetCosPhi] = useState<number>(0.95);
  const [pfVoltage, setPfVoltage] = useState<number>(220);

  const pfResult = useMemo(() => {
    const activePowerW = pfActivePowerKW * 1000;
    const apparentPowerS = activePowerW / Math.max(0.1, pfCurrentCosPhi);
    return calculatePowerTriangle(apparentPowerS, activePowerW, pfTargetCosPhi, 60, pfVoltage);
  }, [pfActivePowerKW, pfCurrentCosPhi, pfTargetCosPhi, pfVoltage]);

  // --- Conduit Sizing State ---
  const [conduitWires, setConduitWires] = useState<{ id: string; section: number; count: number }[]>([
    { id: '1', section: 2.5, count: 6 },
    { id: '2', section: 4.0, count: 3 },
  ]);

  const addConduitWire = () => {
    setConduitWires((prev) => [...prev, { id: Date.now().toString(), section: 2.5, count: 2 }]);
  };

  const removeConduitWire = (id: string) => {
    setConduitWires((prev) => prev.filter((w) => w.id !== id));
  };

  const updateConduitWire = (id: string, field: 'section' | 'count', value: number) => {
    setConduitWires((prev) =>
      prev.map((w) => (w.id === id ? { ...w, [field]: value } : w))
    );
  };

  const conduitResult = useMemo(() => {
    return calculateConduitSize(conduitWires);
  }, [conduitWires]);

  // --- Energy Cost State ---
  const [tariffRateKWh, setTariffRateKWh] = useState<number>(0.92); // R$/kWh
  const [tariffFlag, setTariffFlag] = useState<number>(0); // 0 = Verde, 0.01885 = Amarela, 0.04463 = Vermelha 1, 0.07877 = Vermelha 2
  const [appliances, setAppliances] = useState<
    { id: string; name: string; powerW: number; hoursDay: number; daysMonth: number }[]
  >([
    { id: '1', name: 'Chuveiro Elétrico', powerW: 6800, hoursDay: 0.8, daysMonth: 30 },
    { id: '2', name: 'Ar-Condicionado 12k BTU', powerW: 1100, hoursDay: 8, daysMonth: 30 },
    { id: '3', name: 'Geladeira Frost Free', powerW: 180, hoursDay: 10, daysMonth: 30 },
    { id: '4', name: 'Iluminação LED Total', powerW: 150, hoursDay: 6, daysMonth: 30 },
    { id: '5', name: 'Máquina de Lavar 12kg', powerW: 500, hoursDay: 1.5, daysMonth: 12 },
  ]);

  const addApplianceFromPreset = (preset: typeof APPLIANCE_PRESETS[0]) => {
    setAppliances((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: preset.name,
        powerW: preset.powerW,
        hoursDay: preset.defaultHoursDay,
        daysMonth: 30,
      },
    ]);
  };

  const removeAppliance = (id: string) => {
    setAppliances((prev) => prev.filter((a) => a.id !== id));
  };

  const energyCostSummary = useMemo(() => {
    const effectiveTariff = tariffRateKWh + tariffFlag;
    let totalKWhMonth = 0;

    const breakdown = appliances.map((a) => {
      const kWhMonth = (a.powerW * a.hoursDay * a.daysMonth) / 1000;
      const costMonth = kWhMonth * effectiveTariff;
      totalKWhMonth += kWhMonth;
      return {
        ...a,
        kWhMonth: Math.round(kWhMonth * 10) / 10,
        costMonth: Math.round(costMonth * 100) / 100,
      };
    });

    const totalCostMonth = totalKWhMonth * effectiveTariff;
    const totalCostYear = totalCostMonth * 12;

    return {
      effectiveTariff,
      totalKWhMonth: Math.round(totalKWhMonth * 10) / 10,
      totalCostMonth: Math.round(totalCostMonth * 100) / 100,
      totalCostYear: Math.round(totalCostYear * 100) / 100,
      breakdown,
    };
  }, [appliances, tariffRateKWh, tariffFlag]);

  return (
    <div className="space-y-6">
      {/* Sub-tabs Header */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-[#0F0F12] border border-white/10 rounded-sm">
        {[
          { id: 'ohm', label: 'Lei de Ohm & Potência', icon: Zap },
          { id: 'powerFactor', label: 'Fator de Potência & Capacitores', icon: TrendingUp },
          { id: 'conduit', label: 'Dimensionamento de Eletroduto', icon: Layers },
          { id: 'cost', label: 'Consumo de Energia & Conta R$', icon: DollarSign },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`quick-tab-${tab.id}`}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-sm transition-all border ${
                isActive
                  ? 'bg-yellow-400 text-black border-yellow-400 shadow-sm'
                  : 'bg-white/5 text-white/60 border-white/5 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-yellow-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 1. OHM'S LAW */}
      {activeSubTab === 'ohm' && (
        <div className="space-y-6">
          {/* Hero Header matching Bold Typography sample */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-white/10 pb-6">
            <div>
              <span className="text-[10px] uppercase font-bold text-white/40 tracking-[0.2em] block mb-1">
                Eletrodinâmica Fundamental
              </span>
              <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85]">
                Lei de<br /><span className="text-yellow-400">Ohm</span>
              </h1>
            </div>
            <div className="text-left sm:text-right bg-[#0F0F12] p-4 border border-white/10 rounded-sm">
              <span className="block text-[10px] uppercase font-bold text-white/40 tracking-widest mb-1">
                Resultado da Potência (P)
              </span>
              <span className="text-5xl sm:text-6xl font-black text-yellow-400 tracking-tighter">
                {ohmResult.power}<span className="text-2xl ml-1 text-white">W</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Columns */}
            <div className="lg:col-span-6 bg-[#0F0F12] border border-white/10 p-6 rounded-sm space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/50">
                  Variáveis de Entrada
                </span>
                <button
                  type="button"
                  onClick={() => setOhmValues({ voltage: '220', current: '10', resistance: '', power: '' })}
                  className="text-xs uppercase tracking-wider font-bold text-yellow-400 hover:underline"
                >
                  [ Resetar ]
                </button>
              </div>
              <p className="text-xs text-white/60">
                Preencha quaisquer <strong>2 valores</strong> para que o algoritmo calcule automaticamente os outros 2.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Voltage Input */}
                <div className="border border-white/10 p-3.5 rounded-sm bg-black/40">
                  <span className="text-[10px] uppercase font-bold text-white/50 block mb-1">
                    Tensão (V - Volts)
                  </span>
                  <input
                    type="number"
                    id="ohm-voltage-input"
                    value={ohmValues.voltage}
                    onChange={(e) => setOhmValues({ ...ohmValues, voltage: e.target.value })}
                    placeholder="Ex: 127, 220"
                    className="w-full bg-[#0A0A0B] border border-white/15 rounded-sm px-3 py-2 text-white font-black text-base focus:border-yellow-400 focus:outline-none"
                  />
                  <span className="text-[9px] uppercase tracking-wider text-white/30 mt-1 block">V = R × I ou P / I</span>
                </div>

                {/* Current Input */}
                <div className="border border-white/10 p-3.5 rounded-sm bg-black/40">
                  <span className="text-[10px] uppercase font-bold text-white/50 block mb-1">
                    Corrente (I - Amperes)
                  </span>
                  <input
                    type="number"
                    id="ohm-current-input"
                    value={ohmValues.current}
                    onChange={(e) => setOhmValues({ ...ohmValues, current: e.target.value })}
                    placeholder="Ex: 10, 25"
                    className="w-full bg-[#0A0A0B] border border-white/15 rounded-sm px-3 py-2 text-white font-black text-base focus:border-yellow-400 focus:outline-none"
                  />
                  <span className="text-[9px] uppercase tracking-wider text-white/30 mt-1 block">I = V / R ou P / V</span>
                </div>

                {/* Resistance Input */}
                <div className="border border-white/10 p-3.5 rounded-sm bg-black/40">
                  <span className="text-[10px] uppercase font-bold text-white/50 block mb-1">
                    Resistência (R - Ohms Ω)
                  </span>
                  <input
                    type="number"
                    id="ohm-resistance-input"
                    value={ohmValues.resistance}
                    onChange={(e) => setOhmValues({ ...ohmValues, resistance: e.target.value })}
                    placeholder="Ex: 22, 100"
                    className="w-full bg-[#0A0A0B] border border-white/15 rounded-sm px-3 py-2 text-white font-black text-base focus:border-yellow-400 focus:outline-none"
                  />
                  <span className="text-[9px] uppercase tracking-wider text-white/30 mt-1 block">R = V / I ou V² / P</span>
                </div>

                {/* Power Input */}
                <div className="border border-white/10 p-3.5 rounded-sm bg-black/40">
                  <span className="text-[10px] uppercase font-bold text-white/50 block mb-1">
                    Potência Ativa (P - Watts)
                  </span>
                  <input
                    type="number"
                    id="ohm-power-input"
                    value={ohmValues.power}
                    onChange={(e) => setOhmValues({ ...ohmValues, power: e.target.value })}
                    placeholder="Ex: 2200, 7500"
                    className="w-full bg-[#0A0A0B] border border-white/15 rounded-sm px-3 py-2 text-white font-black text-base focus:border-yellow-400 focus:outline-none"
                  />
                  <span className="text-[9px] uppercase tracking-wider text-white/30 mt-1 block">P = V × I ou R × I²</span>
                </div>
              </div>
            </div>

            {/* Results Grid Display with Monolithic Numbers */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                {/* Voltage Box */}
                <div className="border border-white/10 bg-[#0F0F12] p-5 rounded-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-3xl font-black text-white/80">V</span>
                    <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Tensão (Volts)</span>
                  </div>
                  <div className="text-5xl sm:text-6xl font-black tracking-tighter text-white py-2">
                    {ohmResult.voltage}
                  </div>
                  <div className="h-1 bg-white/10 w-full rounded-none overflow-hidden">
                    <div className="h-full bg-white w-3/4"></div>
                  </div>
                </div>

                {/* Current Box */}
                <div className="border border-white/10 bg-[#0F0F12] p-5 rounded-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-3xl font-black text-yellow-400">A</span>
                    <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Corrente (Amperes)</span>
                  </div>
                  <div className="text-5xl sm:text-6xl font-black tracking-tighter text-yellow-400 py-2">
                    {ohmResult.current}
                  </div>
                  <div className="h-1 bg-white/10 w-full rounded-none overflow-hidden">
                    <div className="h-full bg-yellow-400 w-1/2"></div>
                  </div>
                </div>

                {/* Resistance Box */}
                <div className="border border-white/10 bg-[#0F0F12] p-5 rounded-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-3xl font-black text-white/80">Ω</span>
                    <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Resistência (Ohms)</span>
                  </div>
                  <div className="text-5xl sm:text-6xl font-black tracking-tighter text-white py-2">
                    {ohmResult.resistance}
                  </div>
                  <div className="h-1 bg-white/10 w-full rounded-none overflow-hidden">
                    <div className="h-full bg-white/60 w-2/3"></div>
                  </div>
                </div>

                {/* Yellow Recommendation Highlight */}
                <div className="bg-yellow-400 p-5 rounded-sm flex flex-col justify-between text-black">
                  <div className="flex justify-between items-start">
                    <span className="text-3xl font-black italic">⚡</span>
                    <span className="text-[10px] uppercase font-black text-black/60 tracking-wider">Carga Calculada</span>
                  </div>
                  <p className="font-black text-base sm:text-lg leading-tight uppercase my-2">
                    {ohmResult.power} Watts Dissipados
                  </p>
                  <div className="text-[10px] font-black border-t border-black/20 pt-2 uppercase tracking-wider">
                    {ohmResult.voltage}V • {ohmResult.current}A • {ohmResult.resistance}Ω
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. POWER FACTOR CORRECTION */}
      {activeSubTab === 'powerFactor' && (
        <div className="space-y-6">
          <div className="border-b border-white/10 pb-5">
            <span className="text-[10px] uppercase font-bold text-white/40 tracking-[0.2em] block mb-1">
              Correção de Potência Reativa
            </span>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tighter uppercase leading-[0.9]">
              Fator de <span className="text-yellow-400">Potência</span>
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 bg-[#0F0F12] border border-white/10 p-6 rounded-sm space-y-4">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/50 block">
                Parâmetros da Carga Indutiva
              </span>

              <div className="space-y-4">
                <div className="border border-white/10 p-3.5 rounded-sm bg-black/40">
                  <label className="block text-[10px] uppercase font-bold text-white/50 mb-1">
                    Potência Ativa da Instalação / Motor (kW)
                  </label>
                  <input
                    type="number"
                    id="pf-active-power-input"
                    value={pfActivePowerKW}
                    onChange={(e) => setPfActivePowerKW(parseFloat(e.target.value) || 1)}
                    className="w-full bg-[#0A0A0B] border border-white/15 rounded-sm px-3 py-2 text-white font-black text-base focus:border-yellow-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-white/10 p-3.5 rounded-sm bg-black/40">
                    <label className="block text-[10px] uppercase font-bold text-white/50 mb-1">
                      FP Atual (cos φ)
                    </label>
                    <input
                      type="number"
                      id="pf-current-cos-input"
                      step="0.01"
                      min="0.5"
                      max="0.99"
                      value={pfCurrentCosPhi}
                      onChange={(e) => setPfCurrentCosPhi(parseFloat(e.target.value) || 0.8)}
                      className="w-full bg-[#0A0A0B] border border-white/15 rounded-sm px-3 py-2 text-white font-black text-base focus:border-yellow-400 focus:outline-none"
                    />
                  </div>

                  <div className="border border-white/10 p-3.5 rounded-sm bg-black/40">
                    <label className="block text-[10px] uppercase font-bold text-white/50 mb-1">
                      FP Desejado (cos φ)
                    </label>
                    <input
                      type="number"
                      id="pf-target-cos-input"
                      step="0.01"
                      min="0.92"
                      max="1.0"
                      value={pfTargetCosPhi}
                      onChange={(e) => setPfTargetCosPhi(parseFloat(e.target.value) || 0.95)}
                      className="w-full bg-[#0A0A0B] border border-white/15 rounded-sm px-3 py-2 text-white font-black text-base focus:border-yellow-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-white/50 mb-2">
                    Tensão da Rede (V)
                  </label>
                  <div className="flex gap-2">
                    {[220, 380, 440].map((v) => (
                      <button
                        key={v}
                        type="button"
                        id={`pf-voltage-btn-${v}`}
                        onClick={() => setPfVoltage(v)}
                        className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-sm border ${
                          pfVoltage === v
                            ? 'bg-yellow-400 text-black border-yellow-400'
                            : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {v}V
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-white/10 bg-[#0F0F12] p-5 rounded-sm">
                  <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider block mb-1">
                    Potência do Banco
                  </span>
                  <div className="text-5xl font-black text-yellow-400 tracking-tighter">
                    {Math.round(pfResult.capacitorPowerQcVAr / 100) / 10}
                    <span className="text-lg ml-1 text-white">kVAr</span>
                  </div>
                </div>

                <div className="border border-white/10 bg-[#0F0F12] p-5 rounded-sm">
                  <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider block mb-1">
                    Capacitância Total
                  </span>
                  <div className="text-5xl font-black text-white tracking-tighter">
                    {Math.round(pfResult.capacitanceMicroFarads)}
                    <span className="text-lg ml-1 text-yellow-400">μF</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-400 p-5 rounded-sm text-black">
                <span className="text-[10px] uppercase font-black tracking-widest block mb-1">
                  Alívio de Transformador & Condutores
                </span>
                <p className="text-base font-black uppercase">
                  ~{Math.round(((1 / pfCurrentCosPhi - 1 / pfTargetCosPhi) * 100))}% de redução de corrente aparente
                </p>
                <div className="text-[10px] font-bold border-t border-black/20 pt-2 uppercase mt-2">
                  Reativo atual: {Math.round(pfResult.reactivePowerQ / 100) / 10} kVAr indutivo
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CONDUIT SIZING */}
      {activeSubTab === 'conduit' && (
        <div className="space-y-6">
          <div className="border-b border-white/10 pb-5">
            <span className="text-[10px] uppercase font-bold text-white/40 tracking-[0.2em] block mb-1">
              Ocupação Normativa NBR 5410
            </span>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tighter uppercase leading-[0.9]">
              Cálculo de <span className="text-yellow-400">Eletroduto</span>
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-[#0F0F12] border border-white/10 p-6 rounded-sm space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/50">
                  Condutores no Mesmo Eletroduto
                </span>
                <button
                  type="button"
                  id="add-conduit-wire-btn"
                  onClick={addConduitWire}
                  className="bg-yellow-400 text-black font-black uppercase text-[11px] tracking-wider px-3 py-1.5 rounded-sm hover:bg-yellow-300 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Adicionar Cabo
                </button>
              </div>

              {/* Wires List */}
              <div className="space-y-3">
                {conduitWires.map((w, index) => (
                  <div key={w.id} className="flex items-center gap-3 bg-black/40 p-3 rounded-sm border border-white/10">
                    <div className="flex-1">
                      <label className="block text-[10px] uppercase font-bold text-white/40 mb-1">
                        Seção #{index + 1}
                      </label>
                      <select
                        value={w.section}
                        onChange={(e) => updateConduitWire(w.id, 'section', parseFloat(e.target.value))}
                        className="w-full bg-[#0A0A0B] border border-white/15 rounded-sm px-2.5 py-1.5 text-xs text-white font-black"
                      >
                        {[1.5, 2.5, 4.0, 6.0, 10.0, 16.0, 25.0, 35.0, 50.0, 70.0].map((s) => (
                          <option key={s} value={s}>{s} mm²</option>
                        ))}
                      </select>
                    </div>

                    <div className="w-28">
                      <label className="block text-[10px] uppercase font-bold text-white/40 mb-1">
                        Qtd. Cabos
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={w.count}
                        onChange={(e) => updateConduitWire(w.id, 'count', parseInt(e.target.value) || 1)}
                        className="w-full bg-[#0A0A0B] border border-white/15 rounded-sm px-2.5 py-1.5 text-xs text-white font-black text-center"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeConduitWire(w.id)}
                      className="text-white/40 hover:text-red-400 p-2 mt-4"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="border border-white/10 bg-[#0F0F12] p-6 rounded-sm text-center">
                <span className="text-[10px] uppercase font-bold text-white/40 tracking-[0.2em] block mb-2">
                  Bitola Comercial Recomendada
                </span>
                <div className="text-6xl font-black text-yellow-400 tracking-tighter">
                  {conduitResult.recommendedConduit.sizeInch}
                </div>
                <span className="text-sm font-black uppercase text-white tracking-widest mt-2 block">
                  DN {conduitResult.recommendedConduit.dnMm} mm
                </span>
              </div>

              <div className="border border-white/10 bg-[#0F0F12] p-5 rounded-sm space-y-3">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-white/60">Taxa de Ocupação:</span>
                  <span className={conduitResult.occupancyPercent <= conduitResult.maxAllowedOccupancyPercent ? 'text-yellow-400' : 'text-red-400'}>
                    {conduitResult.occupancyPercent}% (Máx {conduitResult.maxAllowedOccupancyPercent}%)
                  </span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-none overflow-hidden">
                  <div
                    className={`h-full ${
                      conduitResult.occupancyPercent <= conduitResult.maxAllowedOccupancyPercent ? 'bg-yellow-400' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, (conduitResult.occupancyPercent / conduitResult.maxAllowedOccupancyPercent) * 100)}%` }}
                  ></div>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-white/40 block">
                  Área dos cabos: {conduitResult.totalWireAreaMm2} mm² em {conduitResult.totalConductors} condutores
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. ENERGY CONSUMPTION & BILL SIMULATOR */}
      {activeSubTab === 'cost' && (
        <div className="space-y-6">
          <div className="border-b border-white/10 pb-5">
            <span className="text-[10px] uppercase font-bold text-white/40 tracking-[0.2em] block mb-1">
              Simulador Tarifário ANEEL
            </span>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tighter uppercase leading-[0.9]">
              Consumo & <span className="text-yellow-400">Conta R$</span>
            </h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border border-white/10 bg-[#0F0F12] p-4 rounded-sm">
              <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider block mb-1">Tarifa Base</span>
              <input
                type="number"
                id="tariff-rate-input"
                step="0.01"
                value={tariffRateKWh}
                onChange={(e) => setTariffRateKWh(parseFloat(e.target.value) || 0.9)}
                className="w-full bg-black/40 border border-white/15 rounded-sm px-3 py-1.5 text-base text-white font-black focus:border-yellow-400 focus:outline-none"
              />
            </div>

            <div className="border border-white/10 bg-[#0F0F12] p-4 rounded-sm">
              <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider block mb-1">Bandeira ANEEL</span>
              <select
                value={tariffFlag}
                onChange={(e) => setTariffFlag(parseFloat(e.target.value))}
                className="w-full bg-black/40 border border-white/15 rounded-sm px-2.5 py-1.5 text-xs text-white font-bold"
              >
                <option value={0}>🟢 Verde (R$ 0,00)</option>
                <option value={0.01885}>🟡 Amarela (+R$ 0,018)</option>
                <option value={0.04463}>🔴 Vermelha 1 (+R$ 0,044)</option>
                <option value={0.07877}>🔴 Vermelha 2 (+R$ 0,078)</option>
              </select>
            </div>

            <div className="border border-white/10 bg-[#0F0F12] p-4 rounded-sm">
              <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider block mb-1">Consumo Total</span>
              <div className="text-3xl font-black text-white tracking-tighter">
                {energyCostSummary.totalKWhMonth} <span className="text-xs text-white/40">kWh</span>
              </div>
            </div>

            <div className="bg-yellow-400 p-4 rounded-sm text-black">
              <span className="text-[10px] uppercase font-black tracking-wider block mb-1">Custo Mensal</span>
              <div className="text-3xl font-black tracking-tighter">
                R$ {energyCostSummary.totalCostMonth.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Quick presets */}
          <div className="border border-white/10 bg-[#0F0F12] p-4 rounded-sm">
            <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider block mb-2">
              Adicionar Eletrodomésticos Pré-Configurados:
            </span>
            <div className="flex flex-wrap gap-2">
              {APPLIANCE_PRESETS.slice(0, 8).map((app, idx) => (
                <button
                  key={idx}
                  onClick={() => addApplianceFromPreset(app)}
                  className="text-xs uppercase font-bold bg-white/5 hover:bg-yellow-400 hover:text-black text-white/80 px-3 py-1.5 rounded-sm border border-white/10 transition-colors"
                >
                  + {app.name} ({app.powerW}W)
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="border border-white/10 bg-[#0F0F12] rounded-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-white/80">
                <thead className="bg-black/50 text-[10px] uppercase font-black tracking-wider text-white/40 border-b border-white/10">
                  <tr>
                    <th className="p-3">Equipamento</th>
                    <th className="p-3">Potência</th>
                    <th className="p-3">Horas / Dia</th>
                    <th className="p-3">Dias / Mês</th>
                    <th className="p-3">Consumo</th>
                    <th className="p-3">Custo Estimado</th>
                    <th className="p-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {energyCostSummary.breakdown.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5">
                      <td className="p-3 font-bold text-white uppercase">{item.name}</td>
                      <td className="p-3">{item.powerW} W</td>
                      <td className="p-3">{item.hoursDay} h</td>
                      <td className="p-3">{item.daysMonth} d</td>
                      <td className="p-3 font-mono font-bold text-yellow-400">{item.kWhMonth} kWh</td>
                      <td className="p-3 font-mono font-bold text-white">R$ {item.costMonth.toFixed(2)}</td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeAppliance(item.id)}
                          className="text-white/40 hover:text-red-400 font-bold"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
