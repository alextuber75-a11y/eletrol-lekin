import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  Zap, 
  Trash2, 
  ShieldCheck, 
  HelpCircle 
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const AIAssistantChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Olá! Sou o seu **Consultor Técnico de Elétrica & NBR 5410 com IA**. ⚡

Como posso te ajudar hoje?
- ❓ *"Qual a bitola de fio e disjuntor para um chuveiro 7500W em 220V?"*
- ❓ *"Como ligar um interruptor Three-Way (paralelo) passo a passo?"*
- ❓ *"Qual a diferença entre condutor Neutro e Terra (PE) segundo a norma?"*
- ❓ *"Como calcular a corrente de partida de um motor trifásico?"*
- ❓ *"Quando é obrigatório usar IDR e DPS no quadro de distribuição?"*

Sinta-se à vontade para perguntar qualquer dúvida de obra, projeto ou manutenção!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage.trim();
    setInputMessage('');

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch('/api/electrical/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();
      if (data.reply) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Desculpe, ocorreu um erro ao consultar o assistente. Tente novamente em instantes.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errMessage]);
      }
    } catch (error) {
      const errMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Erro de conexão com o servidor. Verifique sua rede e tente novamente.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputMessage(prompt);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Conversa reiniciada. Em que posso te ajudar agora sobre elétrica ou normas técnicas?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Hero Header with Bold Typography style */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-[10px] uppercase font-bold text-white/40 tracking-[0.2em] block mb-1">
            Consultoria Técnica Instantânea NBR 5410 / NR-10
          </span>
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85]">
            Assistente &<br /><span className="text-yellow-400">Consultor</span>
          </h1>
        </div>
        <div className="text-left sm:text-right bg-[#0F0F12] p-4 border border-white/10 rounded-sm">
          <span className="block text-[10px] uppercase font-bold text-white/40 tracking-widest mb-1">
            Status IA
          </span>
          <span className="text-2xl sm:text-3xl font-black text-yellow-400 tracking-tight">
            ONLINE
          </span>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-[#0F0F12] rounded-sm border border-white/10 flex flex-col h-[650px] overflow-hidden">
        {/* Chat Header */}
        <div className="bg-black/60 p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-yellow-400 text-black flex items-center justify-center font-black">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-xs uppercase tracking-wider">Consultor Elétrico IA Pro</h3>
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
              </div>
              <p className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Especialista em NBR 5410, NR-10 e Cálculos de Engenharia</p>
            </div>
          </div>

          <button
            type="button"
            onClick={clearChat}
            className="text-white/40 hover:text-red-400 p-2 rounded-sm hover:bg-white/5 text-xs uppercase font-bold tracking-wider flex items-center gap-1 transition-all"
            title="Limpar Conversa"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Limpar</span>
          </button>
        </div>

        {/* Messages Flow */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/20">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-sm bg-yellow-400 text-black flex items-center justify-center font-black shrink-0 mt-1">
                    <Zap className="w-4 h-4 fill-black" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-sm px-4 py-3 text-xs sm:text-sm leading-relaxed font-mono ${
                    isUser
                      ? 'bg-yellow-400 text-black font-bold'
                      : 'bg-black/40 text-white/90 border border-white/10 whitespace-pre-line'
                  }`}
                >
                  {msg.content}
                  <div
                    className={`text-[9px] mt-1.5 uppercase font-bold ${
                      isUser ? 'text-black/60' : 'text-white/40'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-sm bg-white/10 text-white flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-sm bg-yellow-400 text-black flex items-center justify-center font-black shrink-0">
                <Zap className="w-4 h-4 fill-black" />
              </div>
              <div className="bg-black/40 text-white/80 border border-white/10 rounded-sm px-4 py-3 text-xs flex items-center gap-2 font-mono">
                <div className="w-2 h-2 rounded-sm bg-yellow-400 animate-bounce"></div>
                <div className="w-2 h-2 rounded-sm bg-yellow-400 animate-bounce delay-100"></div>
                <div className="w-2 h-2 rounded-sm bg-yellow-400 animate-bounce delay-200"></div>
                <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider ml-1">Consultando normas e equações...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Questions */}
        <div className="bg-black/40 px-4 py-2 border-t border-white/10 overflow-x-auto flex gap-2 scrollbar-none">
          {[
            'Chuveiro 7500W: Cabo e Disjuntor?',
            'Como ligar Three-Way?',
            'Qual a cor padrão do condutor Neutro?',
            'Quando usar IDR de 30mA?',
          ].map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickPrompt(q)}
              className="text-[10px] uppercase font-bold tracking-wider bg-white/5 hover:bg-yellow-400 hover:text-black text-white/70 px-3 py-1.5 rounded-sm whitespace-nowrap border border-white/10 transition-all"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="bg-black/60 p-3 sm:p-4 border-t border-white/10 flex gap-2">
          <input
            type="text"
            id="ai-chat-input"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Digite sua dúvida de elétrica ou projeto..."
            className="flex-1 bg-black/40 border border-white/20 rounded-sm px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-yellow-400 font-mono transition-colors"
          />
          <button
            type="submit"
            id="ai-chat-send-btn"
            disabled={!inputMessage.trim() || loading}
            className="bg-yellow-400 hover:bg-yellow-300 text-black font-black uppercase tracking-wider px-6 py-3 rounded-sm transition-all disabled:opacity-40 flex items-center justify-center gap-1.5 text-xs"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </form>
      </div>
    </div>
  );
};
