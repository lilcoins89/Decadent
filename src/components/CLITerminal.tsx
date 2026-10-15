import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Play, Copy, Check, CornerDownLeft, Sparkles } from 'lucide-react';
import { useAgent } from '../context/AgentContext';

export const CLITerminal: React.FC = () => {
  const { executeCli } = useAgent();
  const [command, setCommand] = useState('npx @trustwallet/cli balance');
  const [history, setHistory] = useState<Array<{ cmd: string; output: string; time: string }>>([
    {
      cmd: 'npx @trustwallet/cli --version',
      output: '@trustwallet/cli v1.4.2 (MCP Multichain Agent Server: ACTIVE)\nAgent Skills: [balance-query, token-price, multichain-swap, tx-history, hmac-signer, key-manager]',
      time: '10:00:15',
    },
    {
      cmd: 'npx @trustwallet/cli balance',
      output: `[Trust Wallet Agent SDK] Multichain Balances:
  • Solana (SOL): 5.5000 SOL (~$848.37)
  • Solana (BONK): 3,200,000 BONK (~$69.76)
  • Solana (JUP): 240.00 JUP (~$236.40)
  • Ethereum (ETH): 0.6500 ETH (~$1,911.32)
  • BSC (BNB): 1.2500 BNB (~$728.00)
  • BSC (TWT): 450.00 TWT (~$504.00)
Total Portfolio Value: $4,297.85 USD`,
      time: '10:02:40',
    },
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleRunCommand = async (cmdToRun?: string) => {
    const targetCmd = cmdToRun || command;
    if (!targetCmd.trim() || isRunning) return;

    setIsRunning(true);
    const output = await executeCli(targetCmd);
    setHistory(prev => [
      ...prev,
      {
        cmd: targetCmd,
        output,
        time: new Date().toLocaleTimeString(),
      },
    ]);
    setIsRunning(false);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const sampleCommands = [
    'npx @trustwallet/cli balance',
    'npx @trustwallet/cli raydium swap',
    'node raydium-quickstart/swap.mjs',
    'npx @trustwallet/cli swap SOL BONK 1.5',
    'npx @trustwallet/cli keys list',
    'npx @trustwallet/cli portal status',
    'npx @trustwallet/cli help',
    'npx @trustwallet/cli --version',
  ];

  return (
    <div className="flex flex-col h-full bg-[#07090e] rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl font-mono">
      {/* Terminal Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-xs text-slate-300 font-semibold ml-2">Trust Wallet CLI v1.4.2 — MCP Terminal</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            MCP Protocol: CONNECTED
          </span>
        </div>
      </div>

      {/* Quick Command Bar */}
      <div className="flex items-center gap-1.5 p-2 bg-slate-950 border-b border-slate-800/60 overflow-x-auto scrollbar-none text-[11px]">
        <span className="text-slate-400 px-1 text-[10px] uppercase font-bold shrink-0">Presets:</span>
        {sampleCommands.map(cmd => (
          <button
            key={cmd}
            onClick={() => {
              setCommand(cmd);
              handleRunCommand(cmd);
            }}
            className="shrink-0 px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition active:scale-95 text-[11px]"
          >
            {cmd.replace('npx @trustwallet/cli ', '')}
          </button>
        ))}
      </div>

      {/* Terminal Output Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        <div className="text-slate-400 text-[11px]">
          [Trust Wallet Agent SDK] Initialized multichain execution runtime.<br />
          Connected to portal.trustwallet.com & Jupiter quote engine.<br />
          Type <span className="text-blue-400 font-bold">help</span> or run presets to execute CLI commands.
        </div>

        {history.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400">tw-agent@trustwallet:~$</span>
                <span className="text-cyan-300 font-bold">{item.cmd}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{item.time}</span>
                <button
                  onClick={() => copyToClipboard(item.output, idx)}
                  className="p-0.5 text-slate-400 hover:text-white"
                >
                  {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            <div className="rounded-lg bg-slate-900/60 p-2.5 text-slate-200 border border-slate-800/80 whitespace-pre-wrap leading-relaxed text-[11px]">
              {item.output}
            </div>
          </div>
        ))}

        {isRunning && (
          <div className="flex items-center gap-2 text-blue-400 text-xs">
            <span className="w-3 h-3 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
            <span>Executing CLI instruction...</span>
          </div>
        )}

        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Input Prompt */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleRunCommand();
          }}
          className="flex items-center gap-2"
        >
          <span className="text-emerald-400 text-xs shrink-0">tw-agent:~$</span>
          <input
            type="text"
            value={command}
            onChange={e => setCommand(e.target.value)}
            placeholder="e.g. npx @trustwallet/cli balance"
            className="flex-1 bg-transparent text-xs text-white focus:outline-none placeholder-slate-600 font-mono"
          />
          <button
            type="submit"
            disabled={isRunning || !command.trim()}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 transition disabled:opacity-50"
          >
            <Play className="w-3 h-3" />
            <span>Run</span>
          </button>
        </form>
      </div>
    </div>
  );
};
