import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Terminal, 
  CheckCircle2, 
  TrendingUp, 
  ArrowDownUp, 
  ShieldCheck, 
  Trash2, 
  ExternalLink,
  Loader2
} from 'lucide-react';
import { useAgent } from '../context/AgentContext';
import { useWallet } from '../context/WalletContext';

export const AgentChatBox: React.FC = () => {
  const { messages, isProcessing, sendMessage, clearChat, setActiveView } = useAgent();
  const { selectedToken } = useWallet();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    const msg = inputText;
    setInputText('');
    await sendMessage(msg);
  };

  const handleQuickAction = (actionText: string) => {
    sendMessage(actionText);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0d14] rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/70">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">Trust Agent Copilot</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[10px] text-slate-400">Autonomous Trading & Multichain Skills</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveView('terminal')}
            title="Switch to CLI Terminal"
            className="flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-700 bg-slate-800 text-[11px] text-slate-300 hover:text-white transition"
          >
            <Terminal className="w-3 h-3 text-blue-400" />
            <span>CLI</span>
          </button>

          <button
            onClick={clearChat}
            title="Clear Chat"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[88%] rounded-2xl p-3 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-200'
              }`}
            >
              {/* Message text with basic markdown formatting */}
              <div className="whitespace-pre-wrap space-y-1">
                {msg.content.split('\n').map((line, idx) => {
                  if (line.startsWith('• ') || line.startsWith('- ')) {
                    return (
                      <div key={idx} className="flex items-start gap-1.5 pl-1 text-slate-300">
                        <span className="text-blue-400 font-bold">•</span>
                        <span>{line.replace(/^[•-]\s*/, '')}</span>
                      </div>
                    );
                  }
                  return <p key={idx}>{line}</p>;
                })}
              </div>

              {/* Tool Execution Card if present */}
              {msg.action && (
                <div className="mt-2.5 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Skill Action Executed</span>
                  </div>
                  <div className="mt-1 rounded-lg bg-slate-950/80 p-2 font-mono text-[10px] text-slate-300 border border-slate-800/80">
                    <div className="text-blue-400">tw-agent: {msg.action.name}</div>
                    {msg.action.result?.message && (
                      <div className="mt-0.5 text-slate-200">{msg.action.result.message}</div>
                    )}
                  </div>
                </div>
              )}

              <div
                className={`mt-1.5 text-[9px] ${
                  msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>

            {/* Quick Action Suggestions from message */}
            {msg.quickActions && msg.quickActions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2 max-w-full">
                {msg.quickActions.map(action => (
                  <button
                    key={action}
                    onClick={() => handleQuickAction(action)}
                    className="rounded-lg border border-slate-800 bg-slate-900/90 px-2 py-1 text-[11px] font-medium text-slate-300 hover:border-blue-500/50 hover:bg-slate-800 hover:text-white transition"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 w-fit">
            <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
            <span className="font-mono text-[11px]">Reasoning with Trust Wallet & Jupiter SDK...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box & Submit */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/50">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Ask agent: 'Buy 1 SOL of BONK', 'Set TP 50% & SL 15%', 'Chart PEPE'..."
            className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isProcessing}
            className="rounded-xl bg-blue-600 p-2 text-white hover:bg-blue-500 disabled:opacity-40 transition shadow-md shadow-blue-600/30 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
