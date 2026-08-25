import React, { useState, useMemo } from 'react';
import { RoomLoadItem } from '../types';
import { calculateRoomStandards } from '../utils/electricalCalculations';
import { 
  Home, 
  Plus, 
  Trash2, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Bot, 
  FileText, 
  CheckCircle,
  Lightbulb,
  Plug,
  Tv
} from 'lucide-react';

export const RoomLoadPlanner: React.FC = () => {
  const [rooms, setRooms] = useState<RoomLoadItem[]>([
    {
      id: '1',
      name: 'Sala de Estar',
      type: 'sala',
      width: 4,
      length: 5,
      area: 20,
      perimeter: 18,
      minLightingVA: 280,
      actualLightingVA: 300,
      minTugCount: 4,
      minTugPowerVA: 400,
      actualTugs: [{ count: 5, powerVA: 100 }],
      tues: [{ name: 'Ar-Condicionado 12k BTU', powerW: 1100, voltage: 220 }],
    },
    {
      id: '2',
      name: 'Cozinha',
      type: 'cozinha',
      width: 3.5,
      length: 4,
      area: 14,
      perimeter: 15,
      minLightingVA: 220,
      actualLightingVA: 240,
      minTugCount: 5,
      minTugPowerVA: 2000,
      actualTugs: [
        { count: 3, powerVA: 600 },
        { count: 2, powerVA: 100 },
      ],
      tues: [
        { name: 'Micro-ondas', powerW: 1400, voltage: 127 },
        { name: 'Forno Elétrico', powerW: 2400, voltage: 220 },
      ],
    },
    {
      id: '3',
      name: 'Banheiro Social',
      type: 'banheiro',
      width: 1.8,
      length: 2.5,
      area: 4.5,
      perimeter: 8.6,
      minLightingVA: 100,
      actualLightingVA: 100,
      minTugCount: 1,
      minTugPowerVA: 600,
      actualTugs: [{ count: 1, powerVA: 600 }],
      tues: [{ name: 'Chuveiro Elétrico', powerW: 7500, voltage: 220 }],
    },
    {
      id: '4',
      name: 'Quarto Casal',
      type: 'quarto',
      width: 3.5,
      length: 4,
      area: 14,
      perimeter: 15,
      minLightingVA: 220,
      actualLightingVA: 220,
      minTugCount: 3,
      minTugPowerVA: 300,
      actualTugs: [{ count: 4, powerVA: 100 }],
      tues: [{ name: 'Ar-Condicionado 9k BTU', powerW: 850, voltage: 220 }],
    },
  ]);

  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomType, setNewRoomType] = useState<RoomLoadItem['type']>('quarto');
  const [newRoomWidth, setNewRoomWidth] = useState<number>(3);
  const [newRoomLength, setNewRoomLength] = useState<number>(4);

  // AI Audit State
  const [aiAuditLoading, setAiAuditLoading] = useState(false);
  const [aiAuditReport, setAiAuditReport] = useState<string | null>(null);

  const addRoom = () => {
    const calc = calculateRoomStandards(newRoomType, newRoomWidth, newRoomLength);
    const newRoom: RoomLoadItem = {
      id: Date.now().toString(),
      name: newRoomName.trim() || `Novo Cômodo (${newRoomType})`,
      type: newRoomType,
      width: newRoomWidth,
      length: newRoomLength,
      area: calc.area,
      perimeter: calc.perimeter,
      minLightingVA: calc.minLightingVA,
      actualLightingVA: calc.minLightingVA,
      minTugCount: calc.minTugCount,
      minTugPowerVA: calc.minTugPowerVA,
      actualTugs: [{ count: calc.minTugCount, powerVA: newRoomType === 'banheiro' || newRoomType === 'cozinha' ? 600 : 100 }],
      tues: [],
    };
    setRooms((prev) => [...prev, newRoom]);
    setNewRoomName('');
  };

  const removeRoom = (id: string) => {
    setRooms((prev) => prev.filter((r) => r.id !== id));
  };

  const addTueToRoom = (roomId: string, name: string, powerW: number, voltage: number) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, tues: [...r.tues, { name, powerW, voltage }] } : r))
    );
  };

  const removeTueFromRoom = (roomId: string, index: number) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? { ...r, tues: r.tues.filter((_, idx) => idx !== index) }
          : r
      )
    );
  };

  // Calculations for entire project
  const projectSummary = useMemo(() => {
    let totalLightingVA = 0;
    let totalTugVA = 0;
    let totalTueW = 0;
    let totalArea = 0;

    rooms.forEach((r) => {
      totalArea += r.area;
      totalLightingVA += r.actualLightingVA;
      r.actualTugs.forEach((t) => {
        totalTugVA += t.count * t.powerVA;
      });
      r.tues.forEach((tue) => {
        totalTueW += tue.powerW;
      });
    });

    const totalGeneralVA = totalLightingVA + totalTugVA;
    // Demand Factor for lighting and TUGs (simplified NBR 5410 / concessionaire table)
    let demandFactorGeneral = 0.60;
    if (totalGeneralVA > 5000) demandFactorGeneral = 0.50;
    if (totalGeneralVA > 10000) demandFactorGeneral = 0.40;

    // Demand Factor for TUEs (usually 0.70 to 0.85 for residential)
    const demandFactorTue = 0.75;

    const demandedGeneralVA = totalGeneralVA * demandFactorGeneral;
    const demandedTueVA = (totalTueW / 0.95) * demandFactorTue; // Assuming cos phi 0.95

    const totalInstalledVA = totalGeneralVA + (totalTueW / 0.95);
    const totalProbableDemandVA = Math.round(demandedGeneralVA + demandedTueVA);

    // Recommended Supply & Main Breaker
    let supplyType = 'Monofásico 127V ou 220V';
    let mainBreaker = 40;

    if (totalProbableDemandVA <= 8000) {
      supplyType = 'Monofásico (F+N - até 8 kVA)';
      mainBreaker = 40;
    } else if (totalProbableDemandVA <= 15000) {
      supplyType = 'Bifásico (2F+N - 15 a 25 kVA)';
      mainBreaker = 63;
    } else {
      supplyType = 'Trifásico (3F+N - acima de 15 kVA)';
      mainBreaker = 70;
      if (totalProbableDemandVA > 25000) mainBreaker = 100;
      if (totalProbableDemandVA > 35000) mainBreaker = 125;
    }

    return {
      totalArea: Math.round(totalArea * 10) / 10,
      totalLightingVA,
      totalTugVA,
      totalTueW,
      totalInstalledVA: Math.round(totalInstalledVA),
      totalProbableDemandVA,
      supplyType,
      mainBreaker,
    };
  }, [rooms]);

  // Call AI Audit
  const handleAiAudit = async () => {
    setAiAuditLoading(true);
    setAiAuditReport(null);
    try {
      const res = await fetch('/api/electrical/audit-load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rooms,
          totalInstalledPowerVA: projectSummary.totalInstalledVA,
          totalProbableDemandVA: projectSummary.totalProbableDemandVA,
          mainBreakerSize: projectSummary.mainBreaker,
          supplyType: projectSummary.supplyType,
        }),
      });
      const data = await res.json();
      if (data.audit) {
        setAiAuditReport(data.audit);
      } else {
        setAiAuditReport('Não foi possível gerar a auditoria com IA no momento.');
      }
    } catch (e: any) {
      setAiAuditReport('Erro de conexão com o servidor ao auditar quadro de cargas.');
    } finally {
      setAiAuditLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-[10px] uppercase font-bold text-white/40 tracking-[0.2em] block mb-1">
            Planejamento Residencial ABNT
          </span>
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85]">
            Quadro de<br /><span className="text-yellow-400">Cargas</span>
          </h1>
        </div>

        <button
          type="button"
          id="ai-audit-btn"
          onClick={handleAiAudit}
          disabled={aiAuditLoading}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black px-5 py-3 rounded-sm font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          {aiAuditLoading ? 'Auditando com IA...' : 'Auditoria de Cargas com IA'}
        </button>
      </div>

      {/* Global Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#0F0F12] p-4 rounded-sm border border-white/10">
          <span className="text-[10px] uppercase font-bold text-white/40 block mb-1">Área Total</span>
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">{projectSummary.totalArea} <span className="text-sm text-white/50">m²</span></div>
          <span className="text-[10px] uppercase text-white/40 block mt-1">{rooms.length} cômodos cadastrados</span>
        </div>

        <div className="bg-[#0F0F12] p-4 rounded-sm border border-white/10">
          <span className="text-[10px] uppercase font-bold text-white/40 block mb-1">Potência Instalada</span>
          <div className="text-3xl sm:text-4xl font-black text-yellow-400 tracking-tight">
            {(projectSummary.totalInstalledVA / 1000).toFixed(1)} <span className="text-sm font-bold text-white/60">kVA</span>
          </div>
          <span className="text-[10px] uppercase text-white/40 block mt-1">Soma das cargas brutas</span>
        </div>

        <div className="bg-[#0F0F12] p-4 rounded-sm border border-yellow-400/40">
          <span className="text-[10px] uppercase font-bold text-yellow-400 block mb-1">Demanda Provável (D)</span>
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {(projectSummary.totalProbableDemandVA / 1000).toFixed(1)} <span className="text-sm font-bold text-yellow-400">kVA</span>
          </div>
          <span className="text-[10px] uppercase text-white/40 block mt-1">Fatores de Simultaneidade</span>
        </div>

        <div className="bg-[#0F0F12] p-4 rounded-sm border border-white/10">
          <span className="text-[10px] uppercase font-bold text-white/40 block mb-1">Padrão Geral</span>
          <div className="text-2xl sm:text-3xl font-black text-white truncate block">
            {projectSummary.mainBreaker}A
          </div>
          <span className="text-[10px] uppercase text-white/60 block truncate mt-1">{projectSummary.supplyType}</span>
        </div>
      </div>

      {/* AI Audit Report Modal / Card */}
      {aiAuditReport && (
        <div className="bg-[#0F0F12] rounded-sm p-6 border-2 border-yellow-400 shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-yellow-400 font-black text-xs uppercase tracking-wider">
              <Bot className="w-4 h-4" />
              Parecer Técnico & Auditoria NBR 5410 com IA
            </div>
            <button
              onClick={() => setAiAuditReport(null)}
              className="text-xs uppercase font-bold text-white/40 hover:text-white"
            >
              [ Fechar ]
            </button>
          </div>
          <div className="text-xs sm:text-sm text-white/90 whitespace-pre-line leading-relaxed font-mono">
            {aiAuditReport}
          </div>
        </div>
      )}

      {/* Add New Room Card */}
      <div className="bg-[#0F0F12] rounded-sm p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/50">
            Adicionar Novo Cômodo
          </span>
          <span className="text-[10px] uppercase font-bold text-yellow-400">
            NBR 5410 Item 9.5.2
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-[10px] uppercase font-bold text-white/40 mb-1">Nome do Cômodo</label>
            <input
              type="text"
              id="new-room-name-input"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Ex: Suíte Master, Lavanderia..."
              className="w-full bg-[#0A0A0B] border border-white/15 rounded-sm px-3 py-2 text-xs text-white font-bold focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-white/40 mb-1">Tipo de Ambiente</label>
            <select
              value={newRoomType}
              onChange={(e) => setNewRoomType(e.target.value as any)}
              className="w-full bg-[#0A0A0B] border border-white/15 rounded-sm px-2.5 py-2 text-xs text-white font-bold focus:border-yellow-400"
            >
              <option value="sala">Sala / Estar</option>
              <option value="quarto">Quarto / Dormitório</option>
              <option value="cozinha">Cozinha / Copa</option>
              <option value="banheiro">Banheiro</option>
              <option value="area_servico">Área de Serviço / Lavanderia</option>
              <option value="varanda">Varanda / Garagem</option>
              <option value="corredor">Corredor / Hall</option>
              <option value="outro">Outro Ambiente</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-white/40 mb-1">Largura (m)</label>
            <input
              type="number"
              step="0.1"
              value={newRoomWidth}
              onChange={(e) => setNewRoomWidth(parseFloat(e.target.value) || 1)}
              className="w-full bg-[#0A0A0B] border border-white/15 rounded-sm px-3 py-2 text-xs text-white text-center font-black focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-white/40 mb-1">Comprimento (m)</label>
            <input
              type="number"
              step="0.1"
              value={newRoomLength}
              onChange={(e) => setNewRoomLength(parseFloat(e.target.value) || 1)}
              className="w-full bg-[#0A0A0B] border border-white/15 rounded-sm px-3 py-2 text-xs text-white text-center font-black focus:border-yellow-400"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            id="confirm-add-room-btn"
            onClick={addRoom}
            className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-black px-4 py-2 rounded-sm text-xs uppercase tracking-wider transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Cadastrar Cômodo Conforme NBR 5410
          </button>
        </div>
      </div>

      {/* Rooms List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {rooms.map((room) => (
          <div key={room.id} className="bg-[#0F0F12] rounded-sm p-5 border border-white/10 space-y-4">
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <h4 className="font-black text-white text-lg uppercase tracking-tight flex items-center gap-2">
                  {room.name}
                </h4>
                <div className="flex items-center gap-3 text-[10px] uppercase font-bold text-white/40 mt-1">
                  <span>Área: <strong className="text-yellow-400">{room.area} m²</strong></span>
                  <span>•</span>
                  <span>Perímetro: <strong className="text-white">{room.perimeter} m</strong></span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeRoom(room.id)}
                className="text-white/30 hover:text-red-400 p-1 transition-colors"
                title="Remover cômodo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Lighting and TUG rules */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-black/40 p-3 rounded-sm border border-white/10">
                <div className="flex items-center gap-1.5 text-yellow-400 font-bold text-[10px] uppercase tracking-wider mb-1">
                  <Lightbulb className="w-3 h-3" />
                  Iluminação Mínima
                </div>
                <div className="text-2xl font-black text-white">{room.minLightingVA} <span className="text-xs text-white/50">VA</span></div>
                <span className="text-[9px] uppercase tracking-wider text-white/30 block mt-1">NBR 5410 : 9.5.2.1</span>
              </div>

              <div className="bg-black/40 p-3 rounded-sm border border-white/10">
                <div className="flex items-center gap-1.5 text-white/80 font-bold text-[10px] uppercase tracking-wider mb-1">
                  <Plug className="w-3 h-3 text-yellow-400" />
                  Tomadas Gerais (TUGs)
                </div>
                <div className="text-2xl font-black text-white">
                  {room.minTugCount} <span className="text-xs text-white/50">ptos ({room.minTugPowerVA} VA)</span>
                </div>
                <span className="text-[9px] uppercase tracking-wider text-white/30 block mt-1">NBR 14136</span>
              </div>
            </div>

            {/* TUEs list */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-[10px] uppercase font-bold text-white/40">Cargas Específicas (TUEs):</span>
                <button
                  type="button"
                  onClick={() => {
                    const name = prompt('Nome do aparelho TUE (Ex: Chuveiro, Forno, Ar):', 'Ar-Condicionado');
                    if (name) {
                      const power = parseFloat(prompt('Potência em Watts (W):', '1200') || '0');
                      if (power > 0) addTueToRoom(room.id, name, power, 220);
                    }
                  }}
                  className="text-yellow-400 hover:underline font-bold text-[10px] uppercase tracking-wider"
                >
                  + Adicionar TUE
                </button>
              </div>

              {room.tues.length === 0 ? (
                <div className="text-white/30 text-[10px] uppercase tracking-wider bg-black/30 p-2.5 rounded-sm text-center border border-white/5">
                  Nenhuma TUE específica cadastrada neste cômodo.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {room.tues.map((tue, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-black/40 px-3 py-1.5 rounded-sm border border-white/5 text-xs">
                      <span className="font-bold text-white/90 uppercase text-[11px]">{tue.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-yellow-400">{tue.powerW} W ({tue.voltage}V)</span>
                        <button
                          type="button"
                          onClick={() => removeTueFromRoom(room.id, idx)}
                          className="text-white/30 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
