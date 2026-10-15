import React, { useState } from 'react';
import { 
  Shield, 
  Terminal, 
  TrendingUp, 
  ArrowLeftRight, 
  SlidersHorizontal, 
  Key, 
  ExternalLink,
  ChevronDown,
  Layers,
  Sparkles,
  Award,
  BarChart3,
  Zap
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useAgent } from '../context/AgentContext';
import { PWAInstallButton } from './PWAInstallButton';
import { ChainId } from '../types';

interface HeaderProps {
  onOpenWalletModal: () => void;
  onOpenPortalModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenWalletModal, onOpenPortalModal }) => {
  const { activeChain, setActiveChain, totalBalanceUsd, walletAddress, orders } = useWallet();
  const { activeView, setActiveView } = useAgent();
  const [chainMenuOpen, setChainMenuOpen] = useState(false);

  const activeOrdersCount = orders.filter(o => o.status === 'active').length;

  const chainLabels: { [key in ChainId | 'all']: { name: string; color: string; badge: string } } = {
    all: { name: 'All Chains', color: 'from-blue-600 to-indigo-600', badge: 'Multi' },
    solana: { name: 'Solana', color: 'from-purple-500 to-emerald-400', badge: 'SOL' },
    bsc: { name: 'BNB Chain', color: 'from-yellow-400 to-amber-500', badge: 'BSC' },
    ethereum: { name: 'Ethereum', color: 'from-blue-400 to-indigo-500', badge: 'ETH' },
    arbitrum: { name: 'Arbitrum', color: 'from-sky-400 to-blue-600', badge: 'ARB' },
    polygon: { name: 'Polygon', color: 'from-purple-600 to-pink-500', badge: 'POL' },
    base: { name: 'Base', color: 'from-blue-500 to-cyan-400', badge: 'BASE' },
  };

  const currentChainInfo = chainLabels[activeChain];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#080b11]/90 backdrop-blur-md px-3 sm:px-6 py-2.5 transition-all">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0500FF] via-[#0052FF] to-[#00D2FF] shadow-lg shadow-blue-500/25 p-0.5">
            <div className="w-full h-full bg-[#080b11] rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#00D2FF]" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#080b11]" title="Agent Online" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm sm:text-base text-white tracking-tight">Trust Wallet</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30">
                AGENT SDK
              </span>
            </div>
            <p className="hidden sm:block text-[10px] text-slate-400">
              Multichain Autonomous Trading Terminal • Jupiter & DexScreener
            </p>
          </div>
        </div>

        {/* View Navigation Tabs (Desktop & Tablet) */}
        <div className="hidden md:flex items-center rounded-xl bg-slate-900/90 border border-slate-800 p-1">
          <button
            onClick={() => setActiveView('chart')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeView === 'chart'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>DexScreener</span>
          </button>

          <button
            onClick={() => setActiveView('swap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeView === 'swap'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Swap & Orders</span>
          </button>

          <button
            onClick={() => setActiveView('orders')}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeView === 'orders'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>TP / SL Bot</span>
            {activeOrdersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500 text-slate-950 font-bold">
                {activeOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView('performance')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeView === 'performance'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Performance</span>
            <span className="hidden xl:inline text-[9px] bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded font-mono font-bold">
              78.4%
            </span>
          </button>

          <button
            onClick={() => setActiveView('terminal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeView === 'terminal'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>CLI Console</span>
          </button>

          <button
            onClick={() => setActiveView('raydium')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeView === 'raydium'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Raydium SDK</span>
            <span className="hidden xl:inline text-[9px] bg-cyan-500/20 text-cyan-300 px-1 py-0.2 rounded font-mono font-bold">
              CPMM
            </span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Chain Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setChainMenuOpen(!chainMenuOpen)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-700 transition"
            >
              <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${currentChainInfo.color}`} />
              <span className="hidden sm:inline font-medium">{currentChainInfo.name}</span>
              <span className="sm:hidden font-medium">{currentChainInfo.badge}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {chainMenuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setChainMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-700 bg-[#0f1422] p-1.5 shadow-2xl z-40">
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Switch Infrastructure
                  </div>
                  {(['all', 'solana', 'bsc', 'ethereum', 'arbitrum'] as const).map(c => (
                    <button
                      key={c}
                      onClick={() => {
                        setActiveChain(c);
                        setChainMenuOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                        activeChain === c ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${chainLabels[c].color}`} />
                        <span>{chainLabels[c].name}</span>
                      </div>
                      {c === 'solana' && <span className="text-[9px] text-emerald-400 font-bold">Jupiter</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Developer Portal Keys Trigger */}
          <button
            onClick={onOpenPortalModal}
            title="Configure Trust Wallet Developer Portal API & HMAC Keys"
            className="flex items-center gap-1 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 px-2 sm:px-2.5 py-1.5 text-xs text-blue-300 transition"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs font-medium">Portal API</span>
          </button>

          {/* Wallet Address & Balance Pill */}
          <button
            onClick={onOpenWalletModal}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 px-2.5 sm:px-3 py-1.5 text-xs text-white transition active:scale-95"
          >
            <span className="font-semibold text-emerald-400">${totalBalanceUsd.toFixed(2)}</span>
            <span className="hidden sm:inline text-slate-400 border-l border-slate-700 pl-2 text-[11px] font-mono">
              {walletAddress.solana.slice(0, 4)}...{walletAddress.solana.slice(-4)}
            </span>
          </button>

          {/* In-App PWA Install Button */}
          <PWAInstallButton />
        </div>
      </div>
    </header>
  );
};
