import React, { useState, useEffect } from 'react';
import { 
  ArrowDownUp, 
  Settings2, 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useAgent } from '../context/AgentContext';
import { Token } from '../types';

export const TradePanel: React.FC = () => {
  const { tokens, selectedToken, setSelectedToken, executeSwap, createOrder } = useWallet();
  const { setActiveView } = useAgent();

  const [activeTab, setActiveTab] = useState<'swap' | 'tpsl'>('swap');
  const [fromTokenSymbol, setFromTokenSymbol] = useState<'SOL' | 'USDC' | 'BNB' | 'ETH' | string>('SOL');
  const [toTokenSymbol, setToTokenSymbol] = useState<string>(selectedToken.symbol === 'SOL' ? 'BONK' : selectedToken.symbol);
  const [inputAmount, setInputAmount] = useState<string>('1.0');
  const [slippage, setSlippage] = useState<number>(0.5);
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // TP/SL Tab States
  const [tpAmount, setTpAmount] = useState<string>('1.0');
  const [tpPercent, setTpPercent] = useState<number>(25); // +25%
  const [slPercent, setSlPercent] = useState<number>(15); // -15%
  const [customTpPrice, setCustomTpPrice] = useState<string>('');
  const [customSlPrice, setCustomSlPrice] = useState<string>('');

  const fromToken = tokens.find(t => t.symbol === fromTokenSymbol) || tokens[0];
  const toToken = tokens.find(t => t.symbol === toTokenSymbol) || tokens[1];

  // Sync toToken if selectedToken changed from DexScreener
  useEffect(() => {
    if (selectedToken.symbol !== fromTokenSymbol) {
      setToTokenSymbol(selectedToken.symbol);
    }
  }, [selectedToken]);

  // Derived output estimation
  const numInput = parseFloat(inputAmount) || 0;
  const fromValueUsd = numInput * fromToken.priceUsd;
  const estimatedOutput = toToken.priceUsd > 0 ? (fromValueUsd * 0.998) / toToken.priceUsd : 0;

  // Derived TP / SL calculated prices
  const basePrice = selectedToken.priceUsd;
  const calculatedTpPrice = customTpPrice ? parseFloat(customTpPrice) : basePrice * (1 + tpPercent / 100);
  const calculatedSlPrice = customSlPrice ? parseFloat(customSlPrice) : basePrice * (1 - slPercent / 100);

  const handleSwap = async () => {
    if (numInput <= 0) return;
    setIsSwapping(true);
    setStatusMessage(null);

    try {
      const res = await executeSwap(fromToken.symbol, toToken.symbol, numInput);
      if (res.success) {
        setStatusMessage({ text: res.message, type: 'success' });
      } else {
        setStatusMessage({ text: res.message, type: 'error' });
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Swap execution failed', type: 'error' });
    } finally {
      setIsSwapping(false);
    }
  };

  const handleArmTpSl = () => {
    const amt = parseFloat(tpAmount) || 1;
    if (amt <= 0) return;

    createOrder({
      type: 'bracket',
      tokenSymbol: selectedToken.symbol,
      chain: selectedToken.chain,
      amount: amt,
      entryPrice: selectedToken.priceUsd,
      takeProfitPrice: calculatedTpPrice,
      stopLossPrice: calculatedSlPrice,
    });

    setStatusMessage({
      text: `Bracket Order Armed! TP target: $${calculatedTpPrice < 0.01 ? calculatedTpPrice.toFixed(6) : calculatedTpPrice.toFixed(2)} (+${tpPercent}%), SL floor: $${calculatedSlPrice < 0.01 ? calculatedSlPrice.toFixed(6) : calculatedSlPrice.toFixed(2)} (-${slPercent}%).`,
      type: 'success',
    });
  };

  const switchTokens = () => {
    setFromTokenSymbol(toTokenSymbol);
    setToTokenSymbol(fromTokenSymbol);
  };

  return (
    <div className="flex flex-col bg-[#0a0d14] rounded-2xl border border-slate-800/80 p-4 sm:p-5 shadow-2xl">
      {/* Top Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-1 bg-slate-900/90 rounded-xl p-1 border border-slate-800">
          <button
            onClick={() => setActiveTab('swap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'swap'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowDownUp className="w-3.5 h-3.5" />
            <span>Instant Swap</span>
          </button>

          <button
            onClick={() => setActiveTab('tpsl')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'tpsl'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-yellow-300" />
            <span>Take Profit / Stop Loss</span>
          </button>
        </div>

        {/* Slippage Settings */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Slippage</span>
          {[0.1, 0.5, 1.0].map(s => (
            <button
              key={s}
              onClick={() => setSlippage(s)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium transition ${
                slippage === s ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {s}%
            </button>
          ))}
        </div>
      </div>

      {/* SWAP TAB CONTENT */}
      {activeTab === 'swap' ? (
        <div className="space-y-3">
          {/* Pay Input Box */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>You Pay</span>
              <div className="flex items-center gap-1.5">
                <span>Balance: {fromToken.balance.toFixed(4)} {fromToken.symbol}</span>
                <button
                  onClick={() => setInputAmount(fromToken.balance.toString())}
                  className="text-blue-400 font-semibold hover:underline text-[10px]"
                >
                  MAX
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <input
                type="number"
                min="0"
                step="any"
                value={inputAmount}
                onChange={e => setInputAmount(e.target.value)}
                placeholder="0.0"
                className="w-full bg-transparent font-mono text-xl sm:text-2xl font-bold text-white focus:outline-none placeholder-slate-600"
              />

              <div className="relative">
                <select
                  value={fromTokenSymbol}
                  onChange={e => setFromTokenSymbol(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-white focus:outline-none cursor-pointer"
                >
                  {tokens.map(t => (
                    <option key={t.symbol} value={t.symbol}>
                      {t.symbol} ({t.chain.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-1 text-[11px] text-slate-400 font-mono">
              ~${fromValueUsd.toFixed(2)} USD
            </div>
          </div>

          {/* Switch Button */}
          <div className="flex justify-center -my-1">
            <button
              onClick={switchTokens}
              className="p-1.5 rounded-full border border-slate-700 bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-white shadow-md transition active:scale-95"
            >
              <ArrowDownUp className="w-4 h-4" />
            </button>
          </div>

          {/* Receive Output Box */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>You Receive (Estimated)</span>
              <span>Balance: {toToken.balance.toFixed(4)} {toToken.symbol}</span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="w-full font-mono text-xl sm:text-2xl font-bold text-emerald-400 truncate">
                {estimatedOutput < 0.001 ? estimatedOutput.toFixed(6) : estimatedOutput.toFixed(4)}
              </div>

              <div className="relative">
                <select
                  value={toTokenSymbol}
                  onChange={e => setToTokenSymbol(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-white focus:outline-none cursor-pointer"
                >
                  {tokens.map(t => (
                    <option key={t.symbol} value={t.symbol}>
                      {t.symbol} ({t.chain.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-1 text-[11px] text-slate-400 font-mono">
              ~${(fromValueUsd * 0.998).toFixed(2)} USD
            </div>
          </div>

          {/* Jupiter / Trust Wallet Routing Breakdown */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/30 p-2.5 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1 text-[11px]">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Aggregated Route
              </span>
              <span className="text-[11px] font-medium text-emerald-300">
                {fromToken.chain === 'solana' ? 'Jupiter Ultra (Raydium + Meteora)' : 'Trust Wallet Smart Router'}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Price Impact</span>
              <span className="font-mono text-emerald-400">&lt; 0.05%</span>
            </div>

            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Network Gas / Priority</span>
              <span className="font-mono text-slate-300">~$0.0004 USD</span>
            </div>
          </div>

          {/* Swap Action Button */}
          <button
            onClick={handleSwap}
            disabled={isSwapping || numInput <= 0}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 transition disabled:opacity-50 active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {isSwapping ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Broadcasting to Chain...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-yellow-300" />
                <span>Swap via Trust Wallet & Jupiter</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* TAKE PROFIT / STOP LOSS TAB */
        <div className="space-y-3">
          <div className="flex items-center justify-between p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
            <span>Managing Token:</span>
            <span className="font-bold text-white font-mono">{selectedToken.symbol} @ ${selectedToken.priceUsd}</span>
          </div>

          {/* Amount to protect */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>Position Size ({selectedToken.symbol})</span>
              <span>Available: {selectedToken.balance.toFixed(4)}</span>
            </div>
            <input
              type="number"
              value={tpAmount}
              onChange={e => setTpAmount(e.target.value)}
              placeholder="1.0"
              className="w-full bg-transparent font-mono text-xl font-bold text-white focus:outline-none"
            />
          </div>

          {/* Take Profit Setting */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 font-semibold text-emerald-400">
                <TrendingUp className="w-3.5 h-3.5" />
                Take Profit Target
              </span>
              <span className="font-mono text-emerald-300 font-bold">
                ${calculatedTpPrice < 0.01 ? calculatedTpPrice.toFixed(6) : calculatedTpPrice.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {[15, 25, 50, 100, 200].map(pct => (
                <button
                  key={pct}
                  onClick={() => {
                    setTpPercent(pct);
                    setCustomTpPrice('');
                  }}
                  className={`flex-1 py-1 rounded-lg text-xs font-mono font-medium transition ${
                    tpPercent === pct && !customTpPrice
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  +{pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Stop Loss Setting */}
          <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 font-semibold text-rose-400">
                <TrendingDown className="w-3.5 h-3.5" />
                Stop Loss Threshold
              </span>
              <span className="font-mono text-rose-300 font-bold">
                ${calculatedSlPrice < 0.01 ? calculatedSlPrice.toFixed(6) : calculatedSlPrice.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {[5, 10, 15, 20, 30].map(pct => (
                <button
                  key={pct}
                  onClick={() => {
                    setSlPercent(pct);
                    setCustomSlPrice('');
                  }}
                  className={`flex-1 py-1 rounded-lg text-xs font-mono font-medium transition ${
                    slPercent === pct && !customSlPrice
                      ? 'bg-rose-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  -{pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Arm Order Button */}
          <button
            onClick={handleArmTpSl}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:opacity-95 transition flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Arm Autonomous TP/SL Guardian</span>
          </button>
        </div>
      )}

      {/* Status Feedback Toast */}
      {statusMessage && (
        <div
          className={`mt-3 p-2.5 rounded-xl text-xs flex items-start gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          )}
          <span className="leading-tight">{statusMessage.text}</span>
        </div>
      )}
    </div>
  );
};
