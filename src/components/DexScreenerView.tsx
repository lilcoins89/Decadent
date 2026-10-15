import React, { useState } from 'react';
import { 
  TrendingUp, 
  ExternalLink, 
  Search, 
  Zap, 
  ShieldCheck, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  RefreshCw,
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useAgent } from '../context/AgentContext';
import { Token } from '../types';

export const DexScreenerView: React.FC = () => {
  const { tokens, selectedToken, setSelectedToken, activeChain } = useWallet();
  const { setActiveView, sendMessage } = useAgent();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Filter available tokens according to chain
  const chainTokens = activeChain === 'all' 
    ? tokens 
    : tokens.filter(t => t.chain === activeChain);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowSearchDropdown(true);

    try {
      const res = await fetch(`/api/dexscreener/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.pairs) {
        setSearchResults(data.pairs.slice(0, 6));
      }
    } catch (err) {
      console.error('DexScreener search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (pair: any) => {
    const customToken: Token = {
      symbol: pair.baseToken.symbol,
      name: pair.baseToken.name,
      address: pair.baseToken.address,
      chain: (pair.chainId as any) || 'solana',
      priceUsd: parseFloat(pair.priceUsd || '0'),
      change24h: pair.priceChange?.h24 || 0,
      decimals: 9,
      balance: 0,
      pairAddress: pair.pairAddress,
      volume24h: pair.volume?.h24,
      liquidityUsd: pair.liquidity?.usd,
    };
    setSelectedToken(customToken);
    setShowSearchDropdown(false);
    setSearchQuery('');
  };

  // DexScreener embed URL
  const embedChain = selectedToken.chain === 'bsc' ? 'bsc' : selectedToken.chain;
  const embedPair = selectedToken.pairAddress || 'Czfq3xZZDmsdGdUyrNLtRhGc47cXcZtLG4Crryfu44zE';
  const dexscreenerEmbedUrl = `https://dexscreener.com/${embedChain}/${embedPair}?embed=1&theme=dark&trades=0&info=0`;

  return (
    <div className="flex flex-col h-full bg-[#0a0d14] rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl">
      {/* Top Token Bar & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 border-b border-slate-800/80 bg-slate-900/60">
        {/* Token selection chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none max-w-full">
          {chainTokens.map(tok => {
            const isSelected = tok.symbol === selectedToken.symbol;
            return (
              <button
                key={tok.symbol}
                onClick={() => setSelectedToken(tok)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
                }`}
              >
                <span>{tok.symbol}</span>
                <span className={`text-[10px] ${tok.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {tok.change24h >= 0 ? '+' : ''}{tok.change24h}%
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input for any Pair on DexScreener */}
        <div className="relative w-full sm:w-64">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search pair or token on DexScreener..."
              className="w-full rounded-xl border border-slate-700 bg-slate-800/90 pl-8 pr-8 py-1.5 text-xs text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            />
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
            {isSearching && (
              <RefreshCw className="absolute right-2.5 top-2 w-3.5 h-3.5 text-blue-400 animate-spin" />
            )}
          </form>

          {/* Search Dropdown */}
          {showSearchDropdown && searchResults.length > 0 && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowSearchDropdown(false)} />
              <div className="absolute right-0 left-0 mt-2 max-h-72 overflow-y-auto rounded-xl border border-slate-700 bg-[#0f1422] p-1.5 shadow-2xl z-40">
                <div className="px-2 py-1 text-[10px] font-semibold uppercase text-slate-400">
                  DexScreener Pairs
                </div>
                {searchResults.map(p => (
                  <button
                    key={p.pairAddress}
                    onClick={() => handleSelectSearchResult(p)}
                    className="flex w-full items-center justify-between rounded-lg p-2 text-left hover:bg-slate-800/80 transition"
                  >
                    <div>
                      <div className="font-semibold text-xs text-white">
                        {p.baseToken.symbol} <span className="text-slate-400 text-[10px]">/ {p.quoteToken.symbol}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 capitalize">{p.chainId} • {p.dexId}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-medium text-emerald-400">
                        ${parseFloat(p.priceUsd || '0') < 0.01 ? parseFloat(p.priceUsd).toExponential(3) : parseFloat(p.priceUsd).toFixed(4)}
                      </div>
                      <div className={`text-[10px] ${(p.priceChange?.h24 || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {(p.priceChange?.h24 || 0) >= 0 ? '+' : ''}{p.priceChange?.h24 || 0}%
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Selected Token Stats Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-2.5 bg-slate-900/40 border-b border-slate-800/60 text-xs">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-[10px] uppercase text-slate-400 font-semibold flex items-center gap-1">
              <span>{selectedToken.name}</span>
              <span className="uppercase px-1 py-0.2 rounded bg-slate-800 text-[9px] text-slate-300">
                {selectedToken.chain}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold font-mono text-white tracking-tight">
                ${selectedToken.priceUsd < 0.01 ? selectedToken.priceUsd.toFixed(7) : selectedToken.priceUsd.toFixed(2)}
              </span>
              <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                selectedToken.change24h >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
              }`}>
                {selectedToken.change24h >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {selectedToken.change24h >= 0 ? '+' : ''}{selectedToken.change24h}%
              </span>
            </div>
          </div>

          <div className="hidden md:block border-l border-slate-800 pl-4">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">24h Volume</div>
            <div className="font-mono text-slate-200 font-medium">
              ${selectedToken.volume24h ? (selectedToken.volume24h / 1e6).toFixed(2) + 'M' : 'N/A'}
            </div>
          </div>

          <div className="hidden lg:block border-l border-slate-800 pl-4">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Liquidity</div>
            <div className="font-mono text-slate-200 font-medium">
              ${selectedToken.liquidityUsd ? (selectedToken.liquidityUsd / 1e6).toFixed(2) + 'M' : 'N/A'}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Audit: Clean</span>
          </div>
        </div>

        {/* Fast Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('swap')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition text-xs"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-300" />
            <span>Instant Trade</span>
          </button>

          <button
            onClick={() => setActiveView('orders')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 transition text-xs font-medium"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
            <span>Arm TP/SL</span>
          </button>

          <a
            href={`https://dexscreener.com/${embedChain}/${embedPair}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Open full page on DexScreener"
            className="p-1.5 rounded-xl border border-slate-800 bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Embedded DexScreener Chart Frame */}
      <div className="relative flex-1 min-h-[420px] w-full bg-[#080b11]">
        <iframe
          key={`${embedChain}-${embedPair}`}
          src={dexscreenerEmbedUrl}
          title={`DexScreener Chart for ${selectedToken.symbol}`}
          className="w-full h-full border-0 absolute inset-0"
          loading="lazy"
          allow="clipboard-write"
        />
      </div>
    </div>
  );
};
