import React from 'react';
import { 
  Zap, 
  Calculator, 
  Home, 
  Layers, 
  AlertTriangle, 
  Bot, 
  BookOpen, 
  ShieldCheck
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dimensioning', label: 'Dimensionamento', icon: Zap },
    { id: 'calculators', label: 'Calculadoras', icon: Calculator },
    { id: 'roomPlanner', label: 'Quadro de Cargas', icon: Home },
    { id: 'diagrams', label: 'Esquemas & Ligações', icon: Layers },
    { id: 'diagnostics', label: 'Diagnóstico IA', icon: AlertTriangle },
    { id: 'aiChat', label: 'Consultor IA', icon: Bot },
    { id: 'standards', label: 'Normas & NR-10', icon: BookOpen },
  ];

  return (
    <header className="bg-[#0F0F12] border-b border-white/10 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 border-b border-white/5">
          {/* Logo & App Name */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => setActiveTab('dimensioning')}
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-yellow-400 flex items-center justify-center rounded-sm text-black font-black text-xl transition-transform group-hover:scale-105">
              <span className="leading-none">⚡</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-xl sm:text-2xl tracking-tighter uppercase text-white">
                  SparkMaster <span className="text-yellow-400">Pro</span>
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 rounded-sm">
                  NBR 5410
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 hidden sm:block">
                Cálculos Elétricos • Diagramas • Auditoria com IA
              </p>
            </div>
          </div>

          {/* Quick Technical Status */}
          <div className="flex items-center gap-4 sm:gap-6 text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">
            <span className="hidden md:inline">Regulamentação: NBR 5410 / NR-10</span>
            <div className="flex items-center gap-1.5 text-yellow-400 bg-yellow-400/10 px-2.5 py-1 border border-yellow-400/20 rounded-sm">
              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></span>
              <span className="font-black">Sistema Operacional</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 overflow-x-auto py-2.5 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-button-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 sm:px-4 py-2 text-xs font-black uppercase tracking-wider rounded-sm transition-all whitespace-nowrap border ${
                  isActive
                    ? 'bg-yellow-400 text-black border-yellow-400 shadow-sm'
                    : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-yellow-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

