import React, { useState } from 'react';
import { INTERACTIVE_DIAGRAMS } from '../data/electricalStandards';
import { 
  Layers, 
  Lightbulb, 
  ToggleLeft, 
  ToggleRight, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  ShieldCheck, 
  Play, 
  Power,
  RotateCw,
  Sun,
  Moon
} from 'lucide-react';

export const InteractiveDiagrams: React.FC = () => {
  const [selectedDiagramId, setSelectedDiagramId] = useState<string>('three-way');

  // Three-Way simulation state (switch1 position: 'up' | 'down', switch2 position: 'up' | 'down')
  const [threeWaySwitch1, setThreeWaySwitch1] = useState<'up' | 'down'>('up');
  const [threeWaySwitch2, setThreeWaySwitch2] = useState<'up' | 'down'>('up');

  // Four-Way simulation state
  const [fourWayS1, setFourWayS1] = useState<'up' | 'down'>('up');
  const [fourWaySIntermediate, setFourWaySIntermediate] = useState<'straight' | 'cross'>('straight');
  const [fourWayS2, setFourWayS2] = useState<'up' | 'down'>('up');

  // Motor Direct Start simulation state
  const [motorRunning, setMotorRunning] = useState<boolean>(false);
  const [thermalRelayTripped, setThermalRelayTripped] = useState<boolean>(false);

  // Photocell simulation state
  const [ambientLightLevel, setAmbientLightLevel] = useState<number>(80); // 0 = dark night, 100 = full day

  // Computations for interactive states
  const isThreeWayLampOn = threeWaySwitch1 === threeWaySwitch2;

  const isFourWayLampOn = (() => {
    let wireA = fourWayS1 === 'up';
    let wireB = fourWayS1 === 'down';

    if (fourWaySIntermediate === 'cross') {
      const temp = wireA;
      wireA = wireB;
      wireB = temp;
    }

    if (fourWayS2 === 'up') {
      return wireA;
    } else {
      return wireB;
    }
  })();

  const isPhotocellLampOn = ambientLightLevel <= 25;

  const currentDiagram = INTERACTIVE_DIAGRAMS.find((d) => d.id === selectedDiagramId) || INTERACTIVE_DIAGRAMS[0];

  return (
    <div className="space-y-6">
      {/* Hero Header with Bold Typography style */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-[10px] uppercase font-bold text-white/40 tracking-[0.2em] block mb-1">
            Simulador de Circuitos & Comandos
          </span>
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85]">
            Esquemas &<br /><span className="text-yellow-400">Diagramas</span>
          </h1>
        </div>
        <div className="text-left sm:text-right bg-[#0F0F12] p-4 border border-white/10 rounded-sm">
          <span className="block text-[10px] uppercase font-bold text-white/40 tracking-widest mb-1">
            Status do Simulador
          </span>
          <span className="text-2xl sm:text-3xl font-black text-yellow-400 tracking-tight">
            TEMPO REAL
          </span>
        </div>
      </div>

      {/* Diagram selector buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {INTERACTIVE_DIAGRAMS.map((diag) => {
          const isSelected = diag.id === selectedDiagramId;
          return (
            <button
              key={diag.id}
              id={`diagram-tab-${diag.id}`}
              onClick={() => setSelectedDiagramId(diag.id)}
              className={`p-3 rounded-sm text-left border transition-all ${
                isSelected
                  ? 'bg-yellow-400 text-black border-yellow-400 font-black shadow-sm'
                  : 'bg-[#0F0F12] text-white/70 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="text-[9px] uppercase tracking-wider block opacity-75 font-bold">
                {diag.category}
              </span>
              <span className="text-xs font-black uppercase tracking-tight line-clamp-1 mt-0.5">
                {diag.title}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Simulator Stage (Left Column - 7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-[#0F0F12] rounded-sm p-6 border border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400">
                  Simulação Ativa
                </span>
                <h3 className="text-xl font-black uppercase tracking-tight text-white mt-0.5">
                  {currentDiagram.title}
                </h3>
              </div>

              <span className="text-[10px] uppercase font-black px-2.5 py-1 rounded-sm bg-black/40 text-yellow-400 border border-white/10">
                {currentDiagram.difficulty}
              </span>
            </div>

            {/* --- SIMULATOR 1: THREE-WAY --- */}
            {selectedDiagramId === 'three-way' && (
              <div className="bg-black/40 rounded-sm p-6 border border-white/10 space-y-6">
                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">
                    Clique nos interruptores para alterar as vias de contato:
                  </span>
                </div>

                {/* Circuit SVG / Interactive Visual */}
                <div className="flex flex-col items-center justify-center gap-6 py-4">
                  {/* Lamp Display */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-20 h-20 rounded-sm flex items-center justify-center transition-all duration-200 border ${
                        isThreeWayLampOn
                          ? 'bg-yellow-400 text-black border-yellow-400 shadow-xl shadow-yellow-400/20 scale-105'
                          : 'bg-black/60 text-white/30 border-white/10'
                      }`}
                    >
                      <Lightbulb className={`w-10 h-10 ${isThreeWayLampOn ? 'fill-black animate-pulse' : ''}`} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest mt-2 text-white">
                      {isThreeWayLampOn ? '💡 LÂMPADA ACESA' : '🌑 LÂMPADA APAGADA'}
                    </span>
                  </div>

                  {/* Switches Control Row */}
                  <div className="flex items-center justify-center gap-6 sm:gap-12 w-full pt-4 border-t border-white/10">
                    {/* Switch 1 */}
                    <div className="text-center space-y-2">
                      <span className="text-[10px] uppercase font-bold text-white/40 block">Interruptor 1 (Início)</span>
                      <button
                        type="button"
                        id="three-way-sw1-btn"
                        onClick={() => setThreeWaySwitch1(threeWaySwitch1 === 'up' ? 'down' : 'up')}
                        className={`px-4 py-2.5 rounded-sm font-black text-xs uppercase tracking-wider border transition-all flex items-center gap-2 ${
                          threeWaySwitch1 === 'up'
                            ? 'bg-yellow-400 text-black border-yellow-400'
                            : 'bg-white/5 text-white border-white/20 hover:bg-white/10'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        Posição {threeWaySwitch1 === 'up' ? 'A (Sup)' : 'B (Inf)'}
                      </button>
                      <span className="text-[9px] uppercase tracking-wider text-white/40 block">Entra Fase</span>
                    </div>

                    {/* Switch 2 */}
                    <div className="text-center space-y-2">
                      <span className="text-[10px] uppercase font-bold text-white/40 block">Interruptor 2 (Fim)</span>
                      <button
                        type="button"
                        id="three-way-sw2-btn"
                        onClick={() => setThreeWaySwitch2(threeWaySwitch2 === 'up' ? 'down' : 'up')}
                        className={`px-4 py-2.5 rounded-sm font-black text-xs uppercase tracking-wider border transition-all flex items-center gap-2 ${
                          threeWaySwitch2 === 'up'
                            ? 'bg-yellow-400 text-black border-yellow-400'
                            : 'bg-white/5 text-white border-white/20 hover:bg-white/10'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        Posição {threeWaySwitch2 === 'up' ? 'A (Sup)' : 'B (Inf)'}
                      </button>
                      <span className="text-[9px] uppercase tracking-wider text-white/40 block">Sai Retorno</span>
                    </div>
                  </div>

                  {/* Wire Flow Status */}
                  <div className="w-full bg-[#0F0F12] p-3 rounded-sm border border-white/10 text-xs text-center">
                    {isThreeWayLampOn ? (
                      <span className="text-yellow-400 font-bold uppercase tracking-wide flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Circuito Fechado! A corrente elétrica flui pelo balanço {threeWaySwitch1 === 'up' ? 'superior (A)' : 'inferior (B)'}.
                      </span>
                    ) : (
                      <span className="text-white/50 uppercase tracking-wide flex items-center justify-center gap-1.5 font-bold">
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        Circuito Aberto (Os interruptores estão em vias opostas).
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* --- SIMULATOR 2: FOUR-WAY --- */}
            {selectedDiagramId === 'four-way' && (
              <div className="bg-black/40 rounded-sm p-6 border border-white/10 space-y-6">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-20 h-20 rounded-sm flex items-center justify-center transition-all duration-200 border ${
                      isFourWayLampOn
                        ? 'bg-yellow-400 text-black border-yellow-400 shadow-xl shadow-yellow-400/20 scale-105'
                        : 'bg-black/60 text-white/30 border-white/10'
                    }`}
                  >
                    <Lightbulb className={`w-10 h-10 ${isFourWayLampOn ? 'fill-black animate-pulse' : ''}`} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest mt-2 text-white">
                    {isFourWayLampOn ? '💡 LÂMPADA ACESA (3+ PONTOS)' : '🌑 LÂMPADA APAGADA'}
                  </span>
                </div>

                {/* 3 Switches Controls */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 border-t border-white/10">
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-white/40 block mb-1">Three-Way 1</span>
                    <button
                      type="button"
                      id="fourway-sw1-btn"
                      onClick={() => setFourWayS1(fourWayS1 === 'up' ? 'down' : 'up')}
                      className="w-full py-2.5 bg-white/5 border border-white/20 rounded-sm text-xs font-black uppercase text-white hover:bg-white/10"
                    >
                      {fourWayS1 === 'up' ? 'Vez A' : 'Vez B'}
                    </button>
                  </div>

                  <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-yellow-400 block mb-1">Four-Way (Meio)</span>
                    <button
                      type="button"
                      id="fourway-inter-btn"
                      onClick={() => setFourWaySIntermediate(fourWaySIntermediate === 'straight' ? 'cross' : 'straight')}
                      className="w-full py-2.5 bg-yellow-400 text-black font-black uppercase rounded-sm text-xs hover:bg-yellow-300"
                    >
                      {fourWaySIntermediate === 'straight' ? 'Direto ⏸' : 'Cruzado 🔀'}
                    </button>
                  </div>

                  <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-white/40 block mb-1">Three-Way 2</span>
                    <button
                      type="button"
                      id="fourway-sw2-btn"
                      onClick={() => setFourWayS2(fourWayS2 === 'up' ? 'down' : 'up')}
                      className="w-full py-2.5 bg-white/5 border border-white/20 rounded-sm text-xs font-black uppercase text-white hover:bg-white/10"
                    >
                      {fourWayS2 === 'up' ? 'Vez A' : 'Vez B'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* --- SIMULATOR 3: MOTOR DIRECT START --- */}
            {selectedDiagramId === 'motor-partida-direta' && (
              <div className="bg-black/40 rounded-sm p-6 border border-white/10 space-y-6">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-20 h-20 rounded-sm flex items-center justify-center transition-all duration-200 border ${
                      motorRunning
                        ? 'bg-yellow-400 text-black border-yellow-400 scale-105'
                        : 'bg-black/60 text-white/30 border-white/10'
                    }`}
                  >
                    <RotateCw className={`w-10 h-10 ${motorRunning ? 'animate-spin' : ''}`} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest mt-2 text-white">
                    {motorRunning ? '⚡ MOTOR TRIFÁSICO EM OPERAÇÃO' : '🛑 MOTOR DESLIGADO'}
                  </span>
                </div>

                {/* Industrial Pushbuttons */}
                <div className="flex justify-center gap-4 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    id="motor-start-btn"
                    onClick={() => {
                      if (!thermalRelayTripped) setMotorRunning(true);
                    }}
                    className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-black px-6 py-3 rounded-sm text-xs uppercase tracking-wider transition-all"
                  >
                    <Play className="w-4 h-4 fill-black" />
                    S1 LIGA (NA)
                  </button>

                  <button
                    type="button"
                    id="motor-stop-btn"
                    onClick={() => setMotorRunning(false)}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-black px-6 py-3 rounded-sm text-xs uppercase tracking-wider transition-all"
                  >
                    <Power className="w-4 h-4" />
                    S0 DESLIGA (NF)
                  </button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setThermalRelayTripped(!thermalRelayTripped);
                      if (!thermalRelayTripped) setMotorRunning(false);
                    }}
                    className={`text-xs px-3 py-1.5 rounded-sm border uppercase font-black tracking-wider transition-all ${
                      thermalRelayTripped
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-white/5 text-white/50 border-white/10 hover:text-white'
                    }`}
                  >
                    {thermalRelayTripped ? '⚠️ Relé Térmico Desarmado - Clique p/ Resetar' : 'Simular Trip Sobrecarga (95-96)'}
                  </button>
                </div>
              </div>
            )}

            {/* --- SIMULATOR 4: PHOTOCELL --- */}
            {selectedDiagramId === 'fotocelula-rele-fotoeletrico' && (
              <div className="bg-black/40 rounded-sm p-6 border border-white/10 space-y-6">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-20 h-20 rounded-sm flex items-center justify-center transition-all duration-200 border ${
                      isPhotocellLampOn
                        ? 'bg-yellow-400 text-black border-yellow-400 scale-105'
                        : 'bg-black/60 text-white/30 border-white/10'
                    }`}
                  >
                    <Lightbulb className={`w-10 h-10 ${isPhotocellLampOn ? 'fill-black' : ''}`} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest mt-2 text-white">
                    {isPhotocellLampOn ? '💡 ILUMINAÇÃO EXTERNA ACIONADA' : '☀️ DESLIGADA PELO SENSOR SOLAR'}
                  </span>
                </div>

                {/* Day/Night Slider */}
                <div className="space-y-2 bg-[#0F0F12] p-4 rounded-sm border border-white/10">
                  <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider text-white">
                    <span className="flex items-center gap-1 text-white/40"><Moon className="w-4 h-4" /> Noite (0 lux)</span>
                    <span className="text-yellow-400">{ambientLightLevel}% Luz Natural</span>
                    <span className="flex items-center gap-1 text-white/40"><Sun className="w-4 h-4 text-yellow-400" /> Dia (10k lux)</span>
                  </div>
                  <input
                    type="range"
                    id="photocell-lux-slider"
                    min="0"
                    max="100"
                    value={ambientLightLevel}
                    onChange={(e) => setAmbientLightLevel(parseInt(e.target.value))}
                    className="w-full accent-yellow-400"
                  />
                  <span className="text-[10px] uppercase font-bold text-white/40 text-center block">
                    O relé fotoelétrico dispara com corte de luminosidade abaixo de ~25 lux.
                  </span>
                </div>
              </div>
            )}

            {/* --- SIMULATOR 5: QDC or TOMADA (Static Diagrams) --- */}
            {(selectedDiagramId === 'qdc-dps-dr' || selectedDiagramId === 'tomada-10a-20a') && (
              <div className="bg-black/40 rounded-sm p-5 border border-white/10 space-y-4">
                <div className="bg-[#0F0F12] p-4 rounded-sm border border-white/10 text-xs text-white/90 leading-relaxed font-mono">
                  <div className="font-black text-yellow-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" />
                    Topologia Obrigatória NBR 5410:
                  </div>
                  {selectedDiagramId === 'qdc-dps-dr' ? (
                    <div className="space-y-2 text-white/80">
                      <p>1. <strong>Entrada:</strong> Fases e Neutro da rua entram primeiro no <strong>Disjuntor Geral</strong>.</p>
                      <p>2. <strong>Derivação DPS:</strong> Em paralelo, as Fases derivam para os <strong>DPS Classe II</strong> (ligados direto ao Barramento Terra PE).</p>
                      <p>3. <strong>IDR (Interruptor Diferencial Residual):</strong> As Fases e Neutro entram na parte superior do IDR.</p>
                      <p>4. <strong>Barramento de Neutro Isolado:</strong> O Neutro que sai do IDR alimenta o Barramento de Neutro dedicado aos circuitos protegidos. <em>Nunca feche contato do Neutro após o DR com a carcaça/terra!</em></p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-white/80">
                      <p>• <strong>Pino da Esquerda (N):</strong> Condutor Neutro (Azul Claro) - marcado com a letra N.</p>
                      <p>• <strong>Pino Central:</strong> Condutor de Proteção / Terra (Verde ou Verde-Amarelo).</p>
                      <p>• <strong>Pino da Direita (F):</strong> Condutor Fase (Vermelho, Preto ou Marrom).</p>
                      <p>• <strong>Diferença 10A vs 20A:</strong> Plugues de 10A possuem pinos de 4.0mm (até 1270W em 127V / 2200W em 220V). Plugues de 20A possuem pinos de 4.8mm (até 2540W em 127V / 4400W em 220V) para micro-ondas, fritadeiras, lava-louças.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Steps and Wiring Instructions (Right Column - 5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-[#0F0F12] rounded-sm p-6 border border-white/10 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <Zap className="w-4 h-4 text-yellow-400" />
              Passo a Passo de Instalação & Conexão
            </h4>

            <div className="space-y-2.5">
              {currentDiagram.steps.map((step, idx) => (
                <div key={idx} className="bg-black/40 p-3 rounded-sm border border-white/10 text-xs text-white/80 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-sm bg-yellow-400 text-black font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </div>
              ))}
            </div>

            {/* Pro Tips Box */}
            <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-yellow-400 block">
                Dicas de Ouro do Eletricista:
              </span>
              <ul className="space-y-1.5 text-xs text-white/70">
                {currentDiagram.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-yellow-400 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Norm Reference */}
            <div className="pt-2 text-[10px] uppercase font-bold text-white/40 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-yellow-400" />
              <span>Conforme: <strong className="text-white">{currentDiagram.normReference}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
