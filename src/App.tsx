import React, { useState } from 'react';
import { Header } from './components/Header';
import { CableDimensioningCalculator } from './components/CableDimensioningCalculator';
import { QuickCalculators } from './components/QuickCalculators';
import { RoomLoadPlanner } from './components/RoomLoadPlanner';
import { InteractiveDiagrams } from './components/InteractiveDiagrams';
import { AIDiagnosticTroubleshooter } from './components/AIDiagnosticTroubleshooter';
import { AIAssistantChat } from './components/AIAssistantChat';
import { StandardsAndSafety } from './components/StandardsAndSafety';
import { 
  Zap, 
  ShieldCheck, 
  Cpu
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dimensioning');

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col font-sans selection:bg-yellow-400 selection:text-black">
      {/* App Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dimensioning' && <CableDimensioningCalculator />}
        {activeTab === 'calculators' && <QuickCalculators />}
        {activeTab === 'roomPlanner' && <RoomLoadPlanner />}
        {activeTab === 'diagrams' && <InteractiveDiagrams />}
        {activeTab === 'diagnostics' && <AIDiagnosticTroubleshooter />}
        {activeTab === 'aiChat' && <AIAssistantChat />}
        {activeTab === 'standards' && <StandardsAndSafety />}
      </main>

      {/* Footer with Technical Monolithic Metas */}
      <footer className="bg-[#0F0F12] border-t border-white/10 py-6 mt-12 text-white/40 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded-sm bg-yellow-400 text-black flex items-center justify-center font-black text-xs">
              ⚡
            </div>
            <span className="font-black text-white uppercase tracking-wider text-sm">SparkMaster Pro</span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 hidden md:inline">
              • NBR 5410 • NBR 14136 • NR-10
            </span>
          </div>

          <div className="flex items-center space-x-6 text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">
            <span className="flex items-center gap-1.5 text-yellow-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Segurança NR-10 em 1º Lugar
            </span>
            <span>Versão: 2.4.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

