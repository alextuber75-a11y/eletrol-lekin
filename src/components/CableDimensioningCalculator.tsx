import React, { useState, useMemo } from 'react';
import { 
  CableCalculationInput, 
  ConductorMaterial, 
  InstallationMethod, 
  InsulationType, 
  PhaseType 
} from '../types';
import { calculateCableAndBreaker } from '../utils/electricalCalculations';
import { 
  Zap, 
  ShieldCheck, 
  AlertCircle, 
  Sliders, 
  CheckCircle2, 
  Flame, 
  Info,
  Layers,
  ArrowDownCircle,
  Sparkles,
  Gauge
} from 'lucide-react';

export const CableDimensioningCalculator: React.FC = () => {
  const [input, setInput] = useState<CableCalculationInput>({
    voltage: 220,
    power: 7500,
    powerUnit: 'W',
    powerFactor: 1.0,
    phase: 'mono',
    length: 15,
    maxVoltageDrop: 4,
    installationMethod: 'B1',
    material: 'copper',
    insulation: 'PVC',
    groupingCount: 1,
    ambientTemp: 30,
  });

  const [circuitName, setCircuitName] = useState('Chuveiro Elétrico Principal');

  // Quick preset loader
  const loadPreset = (preset: {
    name: string;
    voltage: number;
    power: number;
    powerUnit: 'W' | 'kW' | 'VA' | 'kVA' | 'HP' | 'CV';
    powerFactor: number;
    phase: PhaseType;
    length: number;
    maxVoltageDrop: number;
    insulation: InsulationType;
    groupingCount: number;
  }) => {
    setCircuitName(preset.name);
    setInput((prev) => ({
      ...prev,
      ...preset,
    }));
  };

  const presets = [
    {
      name: 'Chuveiro 220V (7500W)',
      voltage: 220,
      power: 7500,
      powerUnit: 'W' as const,
      powerFactor: 1.0,
      phase: 'mono' as const,
      length: 15,
      maxVoltageDrop: 4,
      insulation: 'PVC' as const,
      groupingCount: 1,
    },
    {
      name: 'Chuveiro 127V (5500W)',
      voltage: 127,
      power: 5500,
      powerUnit: 'W' as const,
      powerFactor: 1.0,
      phase: 'mono' as const,
      length: 12,
      maxVoltageDrop: 4,
      insulation: 'PVC' as const,
      groupingCount: 1,
    },
    {
      name: 'Ar-Condicionado 12k BTU (220V)',
      voltage: 220,
      power: 1100,
      powerUnit: 'W' as const,
      powerFactor: 0.92,
      phase: 'mono' as const,
      length: 20,
      maxVoltageDrop: 3,
      insulation: 'PVC' as const,
      groupingCount: 2,
    },
    {
      name: 'Circuito Tomadas Cozinha (TUG 127V)',
      voltage: 127,
      power: 2200,
      powerUnit: 'W' as const,
      powerFactor: 0.95,
      phase: 'mono' as const,
      length: 18,
      maxVoltageDrop: 4,
      insulation: 'PVC' as const,
      groupingCount: 2,
    },
    {
      name: 'Motor Trifásico 5 CV (380V)',
      voltage: 380,
      power: 5,
      powerUnit: 'CV' as const,
      powerFactor: 0.85,
      phase: 'tri' as const,
      length: 35,
      maxVoltageDrop: 4,
      insulation: 'EPR_XLPE' as const,
      groupingCount: 1,
    },
    {
      name: 'Alimentador Geral Entrada (15 kW)',
      voltage: 220,
      power: 15,
      powerUnit: 'kW' as const,
      powerFactor: 0.95,
      phase: 'bi' as const,
      length: 25,
      maxVoltageDrop: 2,
      insulation: 'PVC' as const,
      groupingCount: 1,
    },
  ];

  const result = useMemo(() => {
    return calculateCableAndBreaker(input);
  }, [input]);

  return (
    <div className="space-y-6">
      {/* Hero Header matching Bold Typography style */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-[10px] uppercase font-bold text-white/40 tracking-[0.2em] block mb-1">
            Engenharia Elétrica Normativa ABNT
          </span>
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85]">
            Cabos &<br /><span className="text-yellow-400">Disjuntores</span>
          </h1>
        </div>
        <div className="text-left sm:text-right bg-[#0F0F12] p-4 border border-white/10 rounded-sm">
          <span className="block text-[10px] uppercase font-bold text-white/40 tracking-widest mb-1">
            Regra Fundamental
          </span>
          <span className="text-2xl sm:text-3xl font-black text-yellow-400 tracking-tight">
            IB ≤ In ≤ Iz
          </span>
        </div>
      </div>

      {/* Preset Chips */}
      <div className="border border-white/10 bg-[#0F0F12] p-4 rounded-sm">
        <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-2">
          Carregar Exemplo Pré-Configurado:
        </span>
        <div className="flex flex-wrap gap-2">
          {presets.map((p, idx) => (
            <button
              key={idx}
              id={`preset-btn-${idx}`}
              onClick={() => loadPreset(p)}
              className={`text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-sm transition-all border ${
                circuitName === p.name
                  ? 'bg-yellow-400 text-black border-yellow-400 shadow-sm'
                  : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters Form (Left Column - 7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-[#0F0F12] border border-white/10 p-6 rounded-sm space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/50">
                Parâmetros do Circuito
              </span>
              <span className="text-[10px] uppercase font-bold text-yellow-400">
                NBR 5410 : 2004
              </span>
            </div>

            {/* Circuit Name */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-white/40 mb-1">
                Identificação do Circuito
              </label>
              <input
                type="text"
                id="circuit-name-input"
                value={circuitName}
                onChange={(e) => setCircuitName(e.target.value)}
                className="w-full bg-[#0A0A0B] border border-white/15 rounded-sm px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-yellow-400"
                placeholder="Ex: Chuveiro Suíte, Tomadas Cozinha..."
              />
            </div>

            {/* Power & Unit */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[10px] uppercase font-bold text-white/40 mb-1">
                  Potência da Carga
                </label>
                <input
                  type="number"
                  id="power-value-input"
                  min="1"
                  step="10"
                  value={input.power}
                  onChange={(e) => setInput({ ...input, power: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#0A0A0B] border border-white/15 rounded-sm px-3 py-2 text-sm text-white font-black focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-white/40 mb-1">
                  Unidade
                </label>
                <select
                  id="power-unit-select"
                  value={input.powerUnit}
                  onChange={(e) => setInput({ ...input, powerUnit: e.target.value as any })}
                  className="w-full bg-[#0A0A0B] border border-white/15 rounded-sm px-3 py-2 text-xs text-white font-black focus:outline-none focus:border-yellow-400"
                >
                  <option value="W">Watts (W)</option>
                  <option value="kW">Quilowatts (kW)</option>
                  <option value="VA">Volt-Ampere (VA)</option>
                  <option value="kVA">kVA</option>
                  <option value="CV">CV (Cavalos Vapor)</option>
                  <option value="HP">HP (Horse Power)</option>
                </select>
              </div>
            </div>

            {/* Voltage & Phase */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-white/40 mb-1">
                  Tensão Nominal (V)
                </label>
                <div className="flex gap-2">
                  {[127, 220, 380].map((v) => (
                    <button
                      key={v}
                      type="button"
                      id={`voltage-btn-${v}`}
                      onClick={() => setInput({ ...input, voltage: v })}
                      className={`flex-1 py-1.5 text-xs font-black uppercase tracking-wider rounded-sm transition-all border ${
                        input.voltage === v
                          ? 'bg-yellow-400 text-black border-yellow-400'
                          : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {v}V
                    </button>
                  ))}
                  <input
                    type="number"
                    id="custom-voltage-input"
                    value={input.voltage}
                    onChange={(e) => setInput({ ...input, voltage: parseFloat(e.target.value) || 220 })}
                    className="w-20 bg-[#0A0A0B] border border-white/15 rounded-sm px-2 py-1.5 text-xs text-white text-center font-black focus:border-yellow-400"
                    placeholder="Outro"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-white/40 mb-1">
                  Sistema de Fases
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'mono', label: '1F+N (Mono)' },
                    { id: 'bi', label: '2F+N (Bi)' },
                    { id: 'tri', label: '3F+N (Tri)' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      id={`phase-btn-${p.id}`}
                      onClick={() => setInput({ ...input, phase: p.id as any })}
                      className={`py-1.5 text-[11px] font-black uppercase tracking-wider rounded-sm transition-all border ${
                        input.phase === p.id
                          ? 'bg-yellow-400 text-black border-yellow-400'
                          : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Distance & Max Voltage Drop */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-white/40 mb-1">
                  Comprimento (m)
                </label>
                <input
                  type="number"
                  id="circuit-length-input"
                  min="1"
                  max="1000"
                  value={input.length}
                  onChange={(e) => setInput({ ...input, length: parseFloat(e.target.value) || 1 })}
                  className="w-full bg-[#0A0A0B] border border-white/15 rounded-sm px-3 py-2 text-sm text-white font-black focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-white/40 mb-1">
                  Queda Máx. Admissível (%)
                </label>
                <select
                  id="max-voltage-drop-select"
                  value={input.maxVoltageDrop}
                  onChange={(e) => setInput({ ...input, maxVoltageDrop: parseFloat(e.target.value) || 4 })}
                  className="w-full bg-[#0A0A0B] border border-white/15 rounded-sm px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-yellow-400"
                >
                  <option value={1}>1% (Alimentador sensível)</option>
                  <option value={2}>2% (Alimentador geral)</option>
                  <option value={3}>3% (Circuito com motor/solar)</option>
                  <option value={4}>4% (Terminal NBR 5410)</option>
                  <option value={5}>5% (Máx global)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-white/40 mb-1">
                  Fator de Potência (cos φ)
                </label>
                <input
                  type="number"
                  id="power-factor-input"
                  min="0.5"
                  max="1.0"
                  step="0.01"
                  value={input.powerFactor}
                  onChange={(e) => setInput({ ...input, powerFactor: parseFloat(e.target.value) || 1 })}
                  className="w-full bg-[#0A0A0B] border border-white/15 rounded-sm px-3 py-2 text-sm text-white font-black focus:outline-none focus:border-yellow-400"
                />
              </div>
            </div>

            {/* Installation Method & Material */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
              <div>
                <label className="block text-[10px] uppercase font-bold text-white/40 mb-1">
                  Método de Instalação
                </label>
                <select
                  id="install-method-select"
                  value={input.installationMethod}
                  onChange={(e) => setInput({ ...input, installationMethod: e.target.value as any })}
                  className="w-full bg-[#0A0A0B] border border-white/15 rounded-sm px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-yellow-400"
                >
                  <option value="B1">B1 - Eletroduto em alvenaria (Padrão Residencial)</option>
                  <option value="B2">B2 - Cabo multipolar em eletroduto em alvenaria</option>
                  <option value="C">C - Cabos sobre parede de alvenaria / perfilado</option>
                  <option value="D">D - Cabo em eletroduto enterrado no solo</option>
                  <option value="A1">A1 - Condutores em eletroduto em drywall / isolante</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-white/40 mb-1">
                  Isolação & Material
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    id="insulation-type-select"
                    value={input.insulation}
                    onChange={(e) => setInput({ ...input, insulation: e.target.value as any })}
                    className="w-full bg-[#0A0A0B] border border-white/15 rounded-sm px-2 py-2 text-xs text-white font-bold focus:outline-none focus:border-yellow-400"
                  >
                    <option value="PVC">PVC (70°C)</option>
                    <option value="EPR_XLPE">EPR / XLPE (90°C)</option>
                  </select>

                  <select
                    id="conductor-material-select"
                    value={input.material}
                    onChange={(e) => setInput({ ...input, material: e.target.value as any })}
                    className="w-full bg-[#0A0A0B] border border-white/15 rounded-sm px-2 py-2 text-xs text-white font-bold focus:outline-none focus:border-yellow-400"
                  >
                    <option value="copper">Cobre (Cu)</option>
                    <option value="aluminum">Alumínio (Al)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Correction Factors: Grouping & Temp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
              <div>
                <label className="block text-[10px] uppercase font-bold text-white/40 mb-1">
                  Agrupamento (Nº Circuitos no Conduíte)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    id="grouping-slider"
                    min="1"
                    max="10"
                    value={input.groupingCount}
                    onChange={(e) => setInput({ ...input, groupingCount: parseInt(e.target.value) || 1 })}
                    className="w-full accent-yellow-400"
                  />
                  <span className="text-xs font-black text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-sm border border-yellow-400/20 w-16 text-center">
                    {input.groupingCount} {input.groupingCount === 1 ? 'circ' : 'circs'}
                  </span>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-white/40 mt-1 block">
                  Fator FCA: {result.fca.toFixed(2)} (Tab. 42 NBR 5410)
                </span>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-white/40 mb-1">
                  Temperatura Ambiente (°C)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    id="temp-slider"
                    min="15"
                    max="60"
                    step="5"
                    value={input.ambientTemp}
                    onChange={(e) => setInput({ ...input, ambientTemp: parseInt(e.target.value) || 30 })}
                    className="w-full accent-yellow-400"
                  />
                  <span className="text-xs font-black text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-sm border border-yellow-400/20 w-14 text-center">
                    {input.ambientTemp}°C
                  </span>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-white/40 mt-1 block">
                  Fator FCT: {result.fct.toFixed(2)} (Tab. 40 NBR 5410)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Results Card (Right Column - 5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Recommended Result Banner */}
          <div className="bg-[#0F0F12] border border-white/10 p-6 rounded-sm space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400">
                Resultado Oficial NBR 5410
              </span>
              <span className="text-[10px] uppercase font-bold text-white/40">
                {circuitName}
              </span>
            </div>

            {/* Wire Gauge & Breaker Main Badges */}
            <div className="grid grid-cols-2 gap-4">
              {/* Cable Gauge */}
              <div className="border border-white/10 bg-black/40 p-4 rounded-sm text-center">
                <span className="text-[10px] uppercase font-bold text-white/40 block mb-1">Seção do Condutor</span>
                <div className="text-5xl font-black text-yellow-400 tracking-tighter">
                  {result.recommendedSection}
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-white/80 mt-1 block">
                  mm² (Fase, N, PE)
                </span>
                <span className="text-[10px] text-white/40 mt-1 block">
                  Capacidade Iz: {result.ampacityTableValue}A
                </span>
              </div>

              {/* Circuit Breaker */}
              <div className="border border-white/10 bg-black/40 p-4 rounded-sm text-center">
                <span className="text-[10px] uppercase font-bold text-white/40 block mb-1">Disjuntor Termomagnético</span>
                <div className="text-5xl font-black text-white tracking-tighter">
                  {result.recommendedBreaker}
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-yellow-400 mt-1 block">
                  A (Curva {result.recommendedBreakerCurve})
                </span>
                <span className="text-[10px] text-white/40 mt-1 block">
                  Norma DIN IEC 60898
                </span>
              </div>
            </div>

            {/* Verification Rule Highlight Box */}
            <div className={`p-4 rounded-sm border ${
              result.safetyVerification.ruleRespected 
                ? 'bg-yellow-400 text-black border-yellow-400' 
                : 'bg-red-500 text-white border-red-500'
            }`}>
              <div className="flex items-start gap-2.5">
                <div className="text-2xl font-black leading-none">⚡</div>
                <div>
                  <div className="font-black text-xs uppercase tracking-wider mb-0.5">
                    {result.safetyVerification.ruleRespected ? 'Critério de Proteção Atendido!' : 'Alerta de Proteção!'}
                  </div>
                  <p className="text-xs font-bold leading-tight uppercase">
                    {result.safetyVerification.explanation}
                  </p>
                </div>
              </div>
            </div>

            {/* Technical Stats */}
            <div className="border-t border-white/10 pt-4 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-white/50 uppercase tracking-wider text-[10px] font-bold">
                  Corrente de Projeto (IB):
                </span>
                <span className="font-black text-white font-mono text-sm">{result.currentIB} A</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-white/50 uppercase tracking-wider text-[10px] font-bold">
                  Queda de Tensão Calculada:
                </span>
                <span className={`font-black font-mono text-sm ${
                  result.actualVoltageDropPercent <= input.maxVoltageDrop ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {result.actualVoltageDropPercent}% ({result.actualVoltageDropVolts} V)
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-white/50 uppercase tracking-wider text-[10px] font-bold">Por Critério de Ampacidade:</span>
                <span className="text-white font-mono font-bold">{result.minSectionByAmpacity} mm²</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-white/50 uppercase tracking-wider text-[10px] font-bold">Por Queda de Tensão:</span>
                <span className="text-white font-mono font-bold">{result.minSectionByVoltageDrop} mm²</span>
              </div>
            </div>

            {/* Wire Colors */}
            <div className="border-t border-white/10 pt-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-white/40 block mb-2">
                Padrão de Cores dos Cabos (NBR 5410):
              </span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-black/40 p-2 rounded-sm border border-white/10">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-600 mx-auto mb-1"></div>
                  <span className="text-[10px] text-white block font-black uppercase">Fase</span>
                  <span className="text-[9px] text-white/40 uppercase">Vermelho</span>
                </div>
                <div className="bg-black/40 p-2 rounded-sm border border-white/10">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mx-auto mb-1"></div>
                  <span className="text-[10px] text-white block font-black uppercase">Neutro</span>
                  <span className="text-[9px] text-white/40 uppercase">Azul Claro</span>
                </div>
                <div className="bg-black/40 p-2 rounded-sm border border-white/10">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 mx-auto mb-1"></div>
                  <span className="text-[10px] text-white block font-black uppercase">Terra</span>
                  <span className="text-[9px] text-white/40 uppercase">Verde</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
