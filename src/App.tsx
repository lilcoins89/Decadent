import React, { useState } from 'react';
import { Header } from './components/Header';
import { DexScreenerView } from './components/DexScreenerView';
import { TradePanel } from './components/TradePanel';
import { AgentChatBox } from './components/AgentChatBox';
import { CLITerminal } from './components/CLITerminal';
import { ActiveOrdersView } from './components/ActiveOrdersView';
import { AgentPerformanceView } from './components/AgentPerformanceView';
import { WalletModal } from './components/WalletModal';
import { PortalModal } from './components/PortalModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { WalletProvider, useWallet } from './context/WalletContext';
import { AgentProvider, useAgent } from './context/AgentContext';
import { 
  TrendingUp, 
  ArrowLeftRight, 
  SlidersHorizontal, 
  Terminal, 
  MessageSquareCode,
  Shield,
  Zap,
  Bot,
  Award
} from 'lucide-react';

const TerminalLayout: React.FC = () => {
  const { activeView, setActiveView } = useAgent();
  const { orders } = useWallet();
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [portalModalOpen, setPortalModalOpen] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const activeOrdersCount = orders.filter(o => o.status === 'active').length;

  return (
    <div className="flex flex-col min-h-screen bg-[#07090e] text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header
        onOpenWalletModal={() => setWalletModalOpen(true)}
        onOpenPortalModal={() => setPortalModalOpen(true)}
      />

      {/* Main Terminal Workspace */}
      <main className="flex-1 p-2 sm:p-4 lg:p-5 max-w-[1720px] w-full mx-auto pb-20 lg:pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-6rem)] min-h-[720px]">
          {/* Main Left/Center Interactive Pane (8 cols on lg) */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col h-full gap-4">
            {activeView === 'chart' && (
              <div className="flex-1 h-full">
                <DexScreenerView />
              </div>
            )}

            {activeView === 'swap' && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 h-full">
                <div className="xl:col-span-5 h-full">
                  <TradePanel />
                </div>
                <div className="xl:col-span-7 h-full">
                  <DexScreenerView />
                </div>
              </div>
            )}

            {activeView === 'orders' && (
              <div className="flex-1 h-full">
                <ActiveOrdersView />
              </div>
            )}

            {activeView === 'performance' && (
              <div className="flex-1 h-full">
                <AgentPerformanceView />
              </div>
            )}

            {activeView === 'terminal' && (
              <div className="flex-1 h-full">
                <CLITerminal />
              </div>
            )}
          </div>

          {/* Right Pane: AI Trading Agent & Copilot (4 cols on lg) */}
          <div className="hidden lg:flex lg:col-span-5 xl:col-span-4 flex-col h-full gap-4">
            <div className="flex-1 h-full">
              <AgentChatBox />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Floating Action Button for AI Chat */}
      <div className="lg:hidden fixed bottom-16 right-4 z-40">
        <button
          onClick={() => setMobileChatOpen(!mobileChatOpen)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-xl shadow-blue-600/40 border border-blue-400/30 active:scale-95"
        >
          <Bot className="w-5 h-5" />
          <span className="text-xs">AI Agent</span>
        </button>
      </div>

      {/* Mobile Chat Drawer / Modal */}
      {mobileChatOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col bg-[#07090e]/95 backdrop-blur-md p-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-bold text-white">Trust Agent Copilot</span>
            </div>
            <button
              onClick={() => setMobileChatOpen(false)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
            >
              Close
            </button>
          </div>
          <div className="flex-1 mt-2 overflow-hidden">
            <AgentChatBox />
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080b11]/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around text-[10px]">
        <button
          onClick={() => {
            setActiveView('chart');
            setMobileChatOpen(false);
          }}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition ${
            activeView === 'chart' && !mobileChatOpen ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Chart</span>
        </button>

        <button
          onClick={() => {
            setActiveView('swap');
            setMobileChatOpen(false);
          }}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition ${
            activeView === 'swap' && !mobileChatOpen ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span>Swap</span>
        </button>

        <button
          onClick={() => {
            setActiveView('orders');
            setMobileChatOpen(false);
          }}
          className={`relative flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition ${
            activeView === 'orders' && !mobileChatOpen ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>TP / SL</span>
          {activeOrdersCount > 0 && (
            <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-emerald-500" />
          )}
        </button>

        <button
          onClick={() => {
            setActiveView('performance');
            setMobileChatOpen(false);
          }}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition ${
            activeView === 'performance' && !mobileChatOpen ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Award className="w-4 h-4 text-emerald-400" />
          <span>Analytics</span>
        </button>

        <button
          onClick={() => {
            setActiveView('terminal');
            setMobileChatOpen(false);
          }}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg transition ${
            activeView === 'terminal' && !mobileChatOpen ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>CLI</span>
        </button>
      </nav>

      {/* Modals & Offline Indicator */}
      <WalletModal isOpen={walletModalOpen} onClose={() => setWalletModalOpen(false)} />
      <PortalModal isOpen={portalModalOpen} onClose={() => setPortalModalOpen(false)} />
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <WalletProvider>
      <AgentProvider>
        <TerminalLayout />
      </AgentProvider>
    </WalletProvider>
  );
}
