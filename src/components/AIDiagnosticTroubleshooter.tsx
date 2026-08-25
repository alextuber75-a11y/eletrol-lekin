import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Bot, 
  ShieldAlert, 
  CheckCircle, 
  Sparkles, 
  HelpCircle, 
  Flame, 
  Zap, 
  Search,
  Activity,
  AlertCircle
} from 'lucide-react';

export const AIDiagnosticTroubleshooter: React.FC = () => {
  const [problemDescription, setProblemDescription] = useState('');
  const [locationType, setLocationType] = useState('Residencial');
  const [voltage, setVoltage] = useState('127V / 220V');
  const [equipmentType, setEquipmentType] = useState('Chuveiro / Tomadas');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const commonFaults = [
    {
      title: 'Disjuntor desarmando ao ligar chuveiro',
      description: 'O disjuntor do quadro desarma após alguns minutos com o chuveiro ligado na posição inverno.',
      location: 'Residencial',
      voltage: '220V',
      equipment: 'Chuveiro Elétrico',
      symptoms: ['Disjuntor desarmando', 'Aquecimento no quadro', 'Sobrecarga térmica'],
    },
    {
      title: 'Choque na carcaça da geladeira / torneira',
      description: 'Ao tocar com os pés descalços na porta de metal da geladeira ou na torneira metálica da pia, sinto um formigamento/choque.',
      location: 'Residencial',
      voltage: '127V',
      equipment: 'Geladeira / Pia da Cozinha',
      symptoms: ['Choque elétrico', 'Fuga de corrente', 'Falta de aterramento PE'],
    },
    {
      title: 'Lâmpada LED piscando (mesmo desligada)',
      description: 'Instalei uma lâmpada LED nova e ela fica dando lampejos/flashes ou brilhando fraco mesmo com o interruptor na posição desligado.',
      location: 'Residencial',
      voltage: '127V / 220V',
      equipment: 'Iluminação LED / Interruptor',
      symptoms: ['Lâmpada piscando', 'Tensão induzida', 'Fase no interruptor/neutro trocado'],
    },
    {
      title: 'Tomada esquentando e cheiro de queimado',
      description: 'A tomada onde ligo a air fryer/micro-ondas está morna ao toque e com marcas amareladas de derretimento.',
      location: 'Residencial',
      voltage: '127V',
      equipment: 'Tomada 10A / Air Fryer',
      symptoms: ['Cheiro de queimado', 'Aquecimento excessivo', 'Mau contato / Tomada 10A sobrecarregada'],
    },
    {
      title: 'IDR desarmando aleatoriamente',
      description: 'O interruptor DR cai várias vezes ao dia sem nenhum aparelho novo ter sido ligado.',
      location: 'Residencial',
      voltage: '220V',
      equipment: 'Quadro Geral / DR',
      symptoms: ['IDR desarmando', 'Fuga de corrente oculta', 'Neutro tocando terra em tomada'],
    },
  ];

  const symptomOptions = [
    'Disjuntor desarmando',
    'IDR (Diferencial) desarmando',
    'Choque elétrico / Formigamento',
    'Cheiro de plástico queimado / Fumaça',
    'Lâmpada piscando ou oscilando',
    'Tomada ou cabo esquentando',
    'Ruído/Zumbido estranho no quadro',
    'Queda súbita de tensão',
    'Falta de energia em apenas algumas tomadas',
  ];

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const loadFaultPreset = (fault: typeof commonFaults[0]) => {
    setProblemDescription(fault.description);
    setLocationType(fault.location);
    setVoltage(fault.voltage);
    setEquipmentType(fault.equipment);
    setSelectedSymptoms(fault.symptoms);
  };

  const handleRunDiagnostic = async () => {
    if (!problemDescription.trim()) {
      setError('Por favor, descreva o problema elétrico que está ocorrendo.');
      return;
    }

    setLoading(true);
    setError(null);
    setDiagnosticResult(null);

    try {
      const res = await fetch('/api/electrical/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemDescription,
          locationType,
          voltage,
          equipmentType,
          symptoms: selectedSymptoms,
        }),
      });

      const data = await res.json();
      if (data.diagnostic) {
        setDiagnosticResult(data.diagnostic);
      } else {
        setError(data.error || 'Erro ao processar diagnóstico elétrico.');
      }
    } catch (err: any) {
      setError('Erro de conexão com o servidor de IA. Verifique se o servidor está ativo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header with Bold Typography style */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-[10px] uppercase font-bold text-white/40 tracking-[0.2em] block mb-1">
            Troubleshooting Elétrico & Normas NBR 5410 / NR-10
          </span>
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85]">
            Diagnóstico &<br /><span className="text-yellow-400">Falhas</span>
          </h1>
        </div>
        <div className="text-left sm:text-right bg-[#0F0F12] p-4 border border-white/10 rounded-sm">
          <span className="block text-[10px] uppercase font-bold text-white/40 tracking-widest mb-1">
            Módulo de IA
          </span>
          <span className="text-2xl sm:text-3xl font-black text-yellow-400 tracking-tight">
            MOTOR PRO
          </span>
        </div>
      </div>

      {/* Warning Notice Bar */}
      <div className="bg-[#0F0F12] rounded-sm p-4 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-xs uppercase font-black tracking-wider text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
          Análise Inteligente de Desarmamentos, Aquecimentos, Choques e Sobrecargas
        </span>
        <div className="flex items-center gap-2 bg-red-600/20 border border-red-500/40 px-3 py-1.5 rounded-sm text-[11px] uppercase tracking-wider text-red-300 font-black shrink-0">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <span>Desenergize antes de mexer na rede!</span>
        </div>
      </div>

      {/* Quick Fault Templates */}
      <div className="bg-[#0F0F12] rounded-sm p-4 border border-white/10 space-y-2">
        <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider block">
          Problemas Elétricos Frequentes (Clique para preenchimento rápido):
        </span>
        <div className="flex flex-wrap gap-2">
          {commonFaults.map((f, idx) => (
            <button
              key={idx}
              id={`fault-preset-${idx}`}
              onClick={() => loadFaultPreset(f)}
              className="text-xs uppercase font-bold tracking-tight bg-black/40 hover:bg-yellow-400 hover:text-black text-white/80 px-3 py-2 rounded-sm border border-white/10 transition-all"
            >
              {f.title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Diagnostic Input Form (Left 6 Cols) */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-[#0F0F12] rounded-sm p-6 border border-white/10 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <Search className="w-4 h-4 text-yellow-400" />
              Dados da Instalação & Sintomas
            </h3>

            {/* Context Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-white/40 tracking-wider mb-1">Tipo de Imóvel</label>
                <select
                  value={locationType}
                  onChange={(e) => setLocationType(e.target.value)}
                  className="w-full bg-black/40 border border-white/20 rounded-sm px-2.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-yellow-400"
                >
                  <option value="Residencial">Residencial</option>
                  <option value="Comercial">Comercial</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Rural">Rural</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-white/40 tracking-wider mb-1">Tensão Local</label>
                <select
                  value={voltage}
                  onChange={(e) => setVoltage(e.target.value)}
                  className="w-full bg-black/40 border border-white/20 rounded-sm px-2.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-yellow-400"
                >
                  <option value="127V">127V Monofásico</option>
                  <option value="220V">220V Monofásico/Bifásico</option>
                  <option value="127V / 220V">127V / 220V Misto</option>
                  <option value="380V Trifásico">380V Trifásico</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-white/40 tracking-wider mb-1">Equipamento</label>
                <input
                  type="text"
                  value={equipmentType}
                  onChange={(e) => setEquipmentType(e.target.value)}
                  placeholder="Ex: Chuveiro, QDC"
                  className="w-full bg-black/40 border border-white/20 rounded-sm px-2.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-yellow-400"
                />
              </div>
            </div>

            {/* Symptoms Chips */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-white/40 tracking-wider mb-2">
                Sintomas Observados (Selecione todos que se aplicam):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {symptomOptions.map((sym) => {
                  const isSelected = selectedSymptoms.includes(sym);
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => toggleSymptom(sym)}
                      className={`text-xs uppercase font-bold tracking-tight px-3 py-1.5 rounded-sm border transition-all ${
                        isSelected
                          ? 'bg-yellow-400 text-black border-yellow-400'
                          : 'bg-black/40 text-white/70 border-white/10 hover:border-white/30'
                      }`}
                    >
                      {sym}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detailed Description */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-white/40 tracking-wider mb-1">
                Descrição Detalhada do Problema
              </label>
              <textarea
                id="diagnostic-problem-desc"
                rows={4}
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                placeholder="Descreva quando acontece, se começou após ligar algo novo, se sai faísca, cheiro ou estalo..."
                className="w-full bg-black/40 border border-white/20 rounded-sm p-3 text-xs text-white focus:outline-none focus:border-yellow-400 leading-relaxed font-mono"
              ></textarea>
            </div>

            {error && (
              <div className="p-3 bg-red-600/20 border border-red-500/40 rounded-sm text-xs uppercase font-bold text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="button"
              id="run-ai-diagnostic-btn"
              onClick={handleRunDiagnostic}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-black uppercase tracking-wider py-4 rounded-sm text-xs transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 fill-black" />
              {loading ? 'Processando Diagnóstico Técnico com IA...' : 'Gerar Laudo Técnico com IA'}
            </button>
          </div>
        </div>

        {/* Diagnostic Results Report (Right 6 Cols) */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-[#0F0F12] rounded-sm p-6 border border-white/10 min-h-[420px] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
                <Bot className="w-4 h-4 text-yellow-400" />
                Laudo Técnico & Solução NBR 5410
              </h3>
              {diagnosticResult && (
                <span className="text-[9px] text-black font-black uppercase tracking-wider bg-yellow-400 px-2.5 py-0.5 rounded-sm">
                  Diagnóstico Concluído
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
                <div className="w-12 h-12 border-4 border-yellow-400/20 border-t-yellow-400 rounded-sm animate-spin"></div>
                <span className="text-xs uppercase font-black tracking-widest text-white">Analisando sintomas com IA...</span>
                <p className="text-[11px] uppercase font-bold text-white/40 max-w-xs">
                  Cruzando dados com tabelas da NBR 5410 e procedimentos de segurança NR-10.
                </p>
              </div>
            ) : diagnosticResult ? (
              <div className="flex-1 overflow-y-auto max-h-[550px] pr-2 scrollbar-thin scrollbar-thumb-white/20">
                <div className="text-xs text-white/90 whitespace-pre-line leading-relaxed space-y-3 font-mono">
                  {diagnosticResult}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-white/30 space-y-3">
                <Activity className="w-12 h-12 text-white/20" />
                <span className="text-xs uppercase font-black tracking-widest text-white/60">Nenhum diagnóstico solicitado ainda.</span>
                <p className="text-[11px] uppercase font-bold text-white/40 max-w-xs">
                  Preencha os sintomas e clique em "Gerar Laudo" para obter uma análise completa e segura.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
