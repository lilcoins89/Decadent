import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Play, 
  Copy, 
  Check, 
  ExternalLink, 
  Code, 
  Zap, 
  RefreshCw, 
  ShieldCheck, 
  ArrowRight,
  Layers,
  Sparkles,
  CheckCircle2,
  FileText
} from 'lucide-react';

export const RaydiumQuickstartView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'console' | 'code' | 'architecture'>('console');
  const [activeFileTab, setActiveFileTab] = useState<'swap' | 'package' | 'cli'>('swap');
  
  // Script Parameters
  const [rpcUrl, setRpcUrl] = useState('https://api.mainnet-beta.solana.com');
  const [poolId, setPoolId] = useState('7JuwScUQ8YMvsA9A3cv6W78d91gS17gV1xZJqB9vQpCP');
  const [inputMint, setInputMint] = useState('So11111111111111111111111111111111111111112');
  const [amountRaw, setAmountRaw] = useState('100000000'); // 0.1 SOL
  
  const [isRunning, setIsRunning] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string>(
    `# Raydium SDK V2 CPMM Swap Quickstart Ready
# Directory: /raydium-quickstart
# Dependencies: @raydium-io/raydium-sdk-v2, @solana/web3.js, @solana/spl-token, bn.js
# Click "Execute CPMM Swap" below to run swap.mjs directly.`
  );
  const [lastTxId, setLastTxId] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const [codeData, setCodeData] = useState<{ swapMjs: string; packageJson: string; readme: string }>({
    swapMjs: '',
    packageJson: '',
    readme: '',
  });

  useEffect(() => {
    fetch('/api/raydium/code')
      .then(r => r.json())
      .then(d => {
        if (d.swapMjs) setCodeData(d);
      })
      .catch(() => {});
  }, []);

  const handleRunScript = async () => {
    setIsRunning(true);
    setTerminalOutput(prev => prev + `\n\n$ POOL_ID=${poolId} \\\n  INPUT_MINT=${inputMint} \\\n  AMOUNT_RAW=${amountRaw} \\\n  node swap.mjs\nExecuting Raydium SDK V2 CPMM Swap...`);
    
    try {
      const res = await fetch('/api/raydium/run-quickstart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poolId,
          inputMint,
          amountRaw,
          rpcUrl,
        }),
      });
      const data = await res.json();
      
      if (data.success && data.stdout) {
        setTerminalOutput(prev => prev + '\n' + data.stdout);
        if (data.txId) {
          setLastTxId(data.txId);
        }
      } else {
        setTerminalOutput(prev => prev + '\n' + (data.error || 'Execution encountered an issue. Fallback simulation triggered.'));
      }
    } catch (err: any) {
      setTerminalOutput(prev => prev + `\nExecution error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const copyCode = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const poolPresets = [
    { label: 'SOL / BONK (CPMM)', pool: '7JuwScUQ8YMvsA9A3cv6W78d91gS17gV1xZJqB9vQpCP', mint: 'So11111111111111111111111111111111111111112' },
    { label: 'SOL / USDC (CPMM)', pool: '8sLbNZoA1wsvqWFhkHcacWLiMFiLMFF7YCrnvKDprYXP', mint: 'So11111111111111111111111111111111111111112' },
    { label: 'SOL / RAY (CPMM)', pool: 'AVs9TA4nWDzfPJE9gGVNJMVhcQy3V9PGazuz33BfG2RA', mint: 'So11111111111111111111111111111111111111112' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0a0d14] rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">Raydium SDK V2 — CPMM Quickstart</h2>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-mono px-2 py-0.5 rounded border border-cyan-500/30 font-bold">
                CurveCalculator • TxVersion.V0
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Direct Constant Product Market Maker (CPMM) swaps using @raydium-io/raydium-sdk-v2
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('console')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'console' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Interactive Runner</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'code' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Source Code</span>
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'architecture' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Math & Architecture</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'console' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Parameters Config (5 cols on lg) */}
            <div className="lg:col-span-5 space-y-3.5 bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Swap Configuration
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                  Solana Mainnet
                </span>
              </div>

              {/* Presets */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Preset CPMM Pools</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {poolPresets.map(p => (
                    <button
                      key={p.pool}
                      onClick={() => {
                        setPoolId(p.pool);
                        setInputMint(p.mint);
                      }}
                      className={`text-left px-2.5 py-1.5 rounded-lg text-xs font-medium border transition flex items-center justify-between ${
                        poolId === p.pool
                          ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{p.label}</span>
                      <span className="text-[10px] font-mono text-slate-400">{p.pool.slice(0, 6)}...</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pool ID */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  POOL_ID (Base58 CPMM Pool Address)
                </label>
                <input
                  type="text"
                  value={poolId}
                  onChange={e => setPoolId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Input Mint */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  INPUT_MINT (Base58 Token Mint)
                </label>
                <input
                  type="text"
                  value={inputMint}
                  onChange={e => setInputMint(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Amount Raw */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-300">
                    AMOUNT_RAW (Raw Lamports / Units)
                  </label>
                  <span className="text-[10px] font-mono text-cyan-400">
                    {(Number(amountRaw) / 1e9).toFixed(4)} SOL
                  </span>
                </div>
                <input
                  type="text"
                  value={amountRaw}
                  onChange={e => setAmountRaw(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
                <div className="flex items-center gap-1.5 mt-1.5">
                  {[
                    { label: '0.05 SOL', val: '50000000' },
                    { label: '0.10 SOL', val: '100000000' },
                    { label: '0.50 SOL', val: '500000000' },
                    { label: '1.00 SOL', val: '1000000000' },
                  ].map(b => (
                    <button
                      key={b.val}
                      onClick={() => setAmountRaw(b.val)}
                      className="px-2 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition"
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* RPC URL */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  RPC_URL
                </label>
                <input
                  type="text"
                  value={rpcUrl}
                  onChange={e => setRpcUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Action Button */}
              <button
                onClick={handleRunScript}
                disabled={isRunning}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 transition disabled:opacity-50 active:scale-98"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing swap.mjs...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Execute Raydium CPMM Swap</span>
                  </>
                )}
              </button>

              {lastTxId && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span className="font-semibold">Swap Confirmed on Solscan</span>
                  </div>
                  <a
                    href={`https://solscan.io/tx/${lastTxId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] text-cyan-400 hover:underline font-mono"
                  >
                    View TX <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Right Terminal Output (7 cols on lg) */}
            <div className="lg:col-span-7 flex flex-col bg-[#07090e] border border-slate-800 rounded-xl overflow-hidden min-h-[420px]">
              <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="text-xs font-mono text-slate-300 ml-1">Terminal: node swap.mjs</span>
                </div>
                <button
                  onClick={() => copyCode(terminalOutput, 'term')}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800"
                >
                  {copiedText === 'term' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedText === 'term' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <pre className="flex-1 p-3.5 text-xs font-mono text-emerald-400 overflow-y-auto whitespace-pre-wrap leading-relaxed select-text">
                {terminalOutput}
              </pre>

              {/* Execution Specs Footer */}
              <div className="grid grid-cols-3 gap-2 p-2 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-400 font-mono">
                <div>
                  <span className="text-slate-500">Compute Units:</span> <span className="text-slate-200">250,000</span>
                </div>
                <div>
                  <span className="text-slate-500">Micro Lamports:</span> <span className="text-slate-200">50,000</span>
                </div>
                <div>
                  <span className="text-slate-500">Tx Version:</span> <span className="text-cyan-400 font-bold">V0</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Source Code Tab */}
        {activeTab === 'code' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveFileTab('swap')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition ${
                    activeFileTab === 'swap' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white bg-slate-900'
                  }`}
                >
                  swap.mjs
                </button>
                <button
                  onClick={() => setActiveFileTab('package')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition ${
                    activeFileTab === 'package' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white bg-slate-900'
                  }`}
                >
                  package.json
                </button>
                <button
                  onClick={() => setActiveFileTab('cli')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition ${
                    activeFileTab === 'cli' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white bg-slate-900'
                  }`}
                >
                  CLI Setup Command
                </button>
              </div>

              <button
                onClick={() => {
                  const target = activeFileTab === 'swap' ? codeData.swapMjs : activeFileTab === 'package' ? codeData.packageJson : `mkdir raydium-quickstart && cd raydium-quickstart\nnpm init -y\nnpm install @raydium-io/raydium-sdk-v2 @solana/web3.js @solana/spl-token bn.js`;
                  copyCode(target, activeFileTab);
                }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white"
              >
                {copiedText === activeFileTab ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText === activeFileTab ? 'Copied to Clipboard' : 'Copy File'}</span>
              </button>
            </div>

            <div className="bg-[#07090e] border border-slate-800 rounded-xl p-4 font-mono text-xs overflow-x-auto text-slate-200">
              {activeFileTab === 'swap' && (
                <pre className="leading-relaxed">
                  {codeData.swapMjs || `// Loading /raydium-quickstart/swap.mjs...`}
                </pre>
              )}

              {activeFileTab === 'package' && (
                <pre className="leading-relaxed">
                  {codeData.packageJson || `// Loading /raydium-quickstart/package.json...`}
                </pre>
              )}

              {activeFileTab === 'cli' && (
                <pre className="leading-relaxed text-cyan-300">
{`# 1. Initialize Quickstart Directory
mkdir raydium-quickstart && cd raydium-quickstart
npm init -y

# 2. Install Required Dependencies
npm install @raydium-io/raydium-sdk-v2 @solana/web3.js @solana/spl-token bn.js

# 3. Run Swap with Environment Variables
POOL_ID="7JuwScUQ8YMvsA9A3cv6W78d91gS17gV1xZJqB9vQpCP" \\
INPUT_MINT="So11111111111111111111111111111111111111112" \\
AMOUNT_RAW="100000000" \\
node swap.mjs`}
                </pre>
              )}
            </div>
          </div>
        )}

        {/* Architecture & Formula Tab */}
        {activeTab === 'architecture' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Constant Product Market Maker (CPMM)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Raydium SDK V2 CPMM pools utilize an invariant constant product model:
              </p>
              <div className="p-3 rounded-lg bg-slate-950 font-mono text-center text-cyan-400 font-bold border border-slate-800">
                (x + Δx · (1 - fee)) · (y - Δy) = k
              </div>
              <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                <li><strong className="text-slate-200">CurveCalculator.swapBaseInput:</strong> Takes raw input amount and base/quote reserves.</li>
                <li><strong className="text-slate-200">tradeFeeRate:</strong> Base pool swap fee (standard 0.25%).</li>
                <li><strong className="text-slate-200">FeeOn.BothToken / OnlyTokenB:</strong> Configurable fee collection mode.</li>
              </ul>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Transaction Version V0 & Compute Budget
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Raydium CPMM swaps on Solana are built using Versioned Transactions (TxVersion.V0) with Address Lookup Tables:
              </p>
              <div className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-slate-300 border border-slate-800 space-y-1">
                <div>computeBudgetConfig: &#123;</div>
                <div className="ml-4 text-emerald-400">units: 250_000,</div>
                <div className="ml-4 text-emerald-400">microLamports: 50_000</div>
                <div>&#125;</div>
              </div>
              <p className="text-xs text-slate-400">
                This guarantees high landing rate and minimal slippage during high congestion periods on Solana mainnet.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
