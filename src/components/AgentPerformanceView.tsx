import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Award,
  CheckCircle2,
  XCircle,
  Zap,
  ShieldCheck,
  Percent,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  BarChart3,
  Calendar,
  Activity,
  Plus,
  Clock,
  ArrowRight,
  Info,
  DollarSign,
  Compass
} from 'lucide-react';
import {
  HISTORICAL_PERFORMANCE_30D,
  HISTORICAL_PERFORMANCE_7D,
  HISTORICAL_PERFORMANCE_24H,
  AGENT_PAST_TRADES,
  SKILL_PERFORMANCE_BREAKDOWN,
  CHAIN_PERFORMANCE_BREAKDOWN,
} from '../data/agentPerformanceData';
import { AgentTrade, PerformanceDataPoint } from '../types';

export const AgentPerformanceView: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'24H' | '7D' | '30D'>('30D');
  const [chartMetric, setChartMetric] = useState<'pnl' | 'winrate' | 'trades'>('pnl');
  const [tradeFilter, setTradeFilter] = useState<'all' | 'wins' | 'losses'>('all');
  const [trades, setTrades] = useState<AgentTrade[]>(AGENT_PAST_TRADES);
  const [selectedTradeModal, setSelectedTradeModal] = useState<AgentTrade | null>(null);

  const activeChartData =
    timeframe === '24H'
      ? HISTORICAL_PERFORMANCE_24H
      : timeframe === '7D'
      ? HISTORICAL_PERFORMANCE_7D
      : HISTORICAL_PERFORMANCE_30D;

  const totalTradesCount = trades.length;
  const winTradesCount = trades.filter(t => t.isWin).length;
  const lossTradesCount = trades.filter(t => !t.isWin).length;
  const currentWinRate = ((winTradesCount / totalTradesCount) * 100).toFixed(1);
  const totalPnlUsd = trades.reduce((acc, t) => acc + t.pnlUsd, 0);

  const filteredTrades = trades.filter(t => {
    if (tradeFilter === 'wins') return t.isWin;
    if (tradeFilter === 'losses') return !t.isWin;
    return true;
  });

  // Action to simulate a live AI trade completion for testing interactivity
  const handleSimulateTrade = () => {
    const isWin = Math.random() > 0.2;
    const tokens = ['SOL', 'BONK', 'JUP', 'TWT', 'ETH'];
    const selectedTok = tokens[Math.floor(Math.random() * tokens.length)];
    const pnlPct = isWin ? +(Math.random() * 15 + 5).toFixed(2) : -(Math.random() * 6 + 2).toFixed(2);
    const pnlVal = isWin ? +(Math.random() * 45 + 15).toFixed(2) : -(Math.random() * 18 + 5).toFixed(2);
    const entryPrice = selectedTok === 'BONK' ? 0.000021 : selectedTok === 'ETH' ? 2950 : selectedTok === 'TWT' ? 1.05 : 150;
    const exitPrice = +(entryPrice * (1 + pnlPct / 100)).toFixed(selectedTok === 'BONK' ? 7 : 2);

    const newTrade: AgentTrade = {
      id: 'tr-' + Date.now(),
      token: selectedTok,
      chain: selectedTok === 'TWT' ? 'bsc' : selectedTok === 'ETH' ? 'ethereum' : 'solana',
      type: isWin ? 'TP_HIT' : 'SL_TRIGGER',
      amount: selectedTok === 'BONK' ? 5000000 : 1.5,
      entryPrice,
      exitPrice,
      pnlUsd: pnlVal,
      pnlPercent: pnlPct,
      isWin,
      timestamp: 'Today • ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC',
      route: isWin ? 'Jupiter Ultra DEX Route' : 'Autonomous Stop-Loss Guardian',
    };

    setTrades([newTrade, ...trades]);
  };

  /**
   * 1. Granular Interactive Tooltip for the Main Performance Curve (Area & Line Charts)
   * Displays exact timestamp, entry price, exit price, profit/loss per trade, position size, and route.
   */
  const GranularPerformanceTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const dataPoint: PerformanceDataPoint = payload[0]?.payload;
    if (!dataPoint) return null;

    const topTrade = dataPoint.topTrade;
    const executedTrades = dataPoint.executedTrades || [];

    return (
      <div className="w-80 sm:w-96 rounded-2xl border border-slate-700/80 bg-[#0c101d]/98 p-3.5 shadow-2xl backdrop-blur-xl text-xs font-sans text-slate-200 z-50 ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-100">
        {/* Tooltip Header: Date & Timestamp */}
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-white text-xs">{dataPoint.timestamp || `${dataPoint.date}, 2026`}</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Agent Snapshot
          </span>
        </div>

        {/* Aggregate Metrics in this period */}
        <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-slate-900/90 border border-slate-800/80 text-center mb-2.5">
          <div>
            <div className="text-[9px] text-slate-400 uppercase font-semibold">Cumul. PnL</div>
            <div className={`font-mono text-xs font-bold ${dataPoint.cumulativePnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {dataPoint.cumulativePnl >= 0 ? '+' : ''}${dataPoint.cumulativePnl.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-[9px] text-slate-400 uppercase font-semibold">Period PnL</div>
            <div className={`font-mono text-xs font-bold ${dataPoint.dailyPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {dataPoint.dailyPnl >= 0 ? '+' : ''}${dataPoint.dailyPnl.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-[9px] text-slate-400 uppercase font-semibold">Win Rate</div>
            <div className="font-mono text-xs font-bold text-cyan-300">
              {dataPoint.winRate}%
            </div>
          </div>
        </div>

        {/* Granular Trade Details: Entry Price, Exit Price, Profit/Loss, Timestamp */}
        {topTrade ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-400" />
                Executed Trade Details
              </span>
              <span className="text-[10px] text-slate-400 font-mono font-normal">
                {topTrade.timestamp}
              </span>
            </div>

            <div className="p-2.5 rounded-xl border border-slate-700/80 bg-slate-950/90 space-y-2">
              {/* Token & Result pill */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white text-xs tracking-tight">${topTrade.token}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                    {topTrade.amount} units
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    topTrade.isWin
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {topTrade.isWin ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  <span>{topTrade.action}</span>
                </span>
              </div>

              {/* Granular Entry vs Exit Price strip */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1 border-t border-slate-800/80">
                <div>
                  <div className="text-[10px] text-slate-400 font-sans">Entry Price</div>
                  <div className="font-semibold text-slate-200">
                    ${topTrade.entryPrice < 0.01 ? topTrade.entryPrice.toFixed(7) : topTrade.entryPrice.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-sans">Exit Price</div>
                  <div className="font-semibold text-white">
                    ${topTrade.exitPrice < 0.01 ? topTrade.exitPrice.toFixed(7) : topTrade.exitPrice.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Profit / Loss per Trade */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-400">Trade Profit / Loss:</span>
                <span
                  className={`font-mono font-bold text-xs ${
                    topTrade.isWin ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {topTrade.pnlUsd >= 0 ? '+' : ''}${topTrade.pnlUsd.toFixed(2)} (
                  {topTrade.pnlPercent >= 0 ? '+' : ''}
                  {topTrade.pnlPercent}%)
                </span>
              </div>

              {/* Execution Route */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                <span className="truncate max-w-[200px]">{topTrade.route}</span>
                <span className="text-emerald-400 font-medium">Verified</span>
              </div>
            </div>

            {/* If there are more executed trades in this bucket */}
            {executedTrades.length > 1 && (
              <div className="pt-1 text-[10px] text-slate-400 flex items-center justify-between">
                <span>+{executedTrades.length - 1} other trade(s) in this session</span>
                <span className="text-blue-400 font-medium">
                  {dataPoint.wins}W / {dataPoint.losses}L
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-[11px] text-slate-400 italic text-center py-1">
            Automated Guardian monitoring active with {dataPoint.tradesCount} executed orders.
          </div>
        )}
      </div>
    );
  };

  /**
   * 2. Granular Interactive Tooltip for the Volume & Wins vs Losses BarChart
   */
  const GranularBarTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const dataPoint: PerformanceDataPoint = payload[0]?.payload;
    if (!dataPoint) return null;

    const topTrade = dataPoint.topTrade;

    return (
      <div className="w-80 rounded-2xl border border-slate-700 bg-[#0c101d]/98 p-3.5 shadow-2xl backdrop-blur-xl text-xs font-sans text-slate-200 z-50">
        <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-800">
          <div className="font-bold text-white flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
            <span>{dataPoint.timestamp || label}</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {dataPoint.tradesCount} Total Trades
          </span>
        </div>

        {/* Wins vs Losses summary bar */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
            <div className="text-[10px] text-emerald-400 font-semibold">Wins</div>
            <div className="font-mono text-base font-bold text-emerald-300">{dataPoint.wins}</div>
          </div>
          <div className="flex-1 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-center">
            <div className="text-[10px] text-rose-400 font-semibold">Losses</div>
            <div className="font-mono text-base font-bold text-rose-300">{dataPoint.losses}</div>
          </div>
          <div className="flex-1 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
            <div className="text-[10px] text-blue-400 font-semibold">Success %</div>
            <div className="font-mono text-base font-bold text-white">{dataPoint.winRate}%</div>
          </div>
        </div>

        {/* Granular Trade details on hover */}
        {topTrade && (
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
              <span>Representative Trade</span>
              <span className="font-mono text-slate-300">{topTrade.timestamp}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">${topTrade.token}</span>
              <span
                className={`font-mono font-bold ${
                  topTrade.pnlUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {topTrade.pnlUsd >= 0 ? '+' : ''}${topTrade.pnlUsd.toFixed(2)} ({topTrade.pnlPercent}%)
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 pt-1 border-t border-slate-800">
              <span>Entry: ${topTrade.entryPrice < 0.01 ? topTrade.entryPrice.toFixed(6) : topTrade.entryPrice.toFixed(2)}</span>
              <span>Exit: ${topTrade.exitPrice < 0.01 ? topTrade.exitPrice.toFixed(6) : topTrade.exitPrice.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  /**
   * 3. Granular Interactive Tooltip for Trade-by-Trade Execution Flow Chart
   */
  const GranularIndividualTradeTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const trade: AgentTrade = payload[0]?.payload;
    if (!trade) return null;

    return (
      <div className="w-80 rounded-2xl border border-slate-700 bg-[#0c101d]/98 p-3.5 shadow-2xl backdrop-blur-xl text-xs font-sans text-slate-200 z-50 ring-1 ring-white/10">
        <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white text-sm">${trade.token}</span>
            <span className="text-[10px] uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
              {trade.chain}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">{trade.timestamp}</span>
        </div>

        <div className="space-y-2">
          {/* Action & Result */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-300">{trade.type.replace('_', ' ')}</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                trade.isWin
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              {trade.isWin ? 'PROFIT TAKEN' : 'STOP LOSS HIT'}
            </span>
          </div>

          {/* Granular Entry Price & Exit Price */}
          <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
            <div>
              <div className="text-[10px] text-slate-400 font-sans">Entry Price</div>
              <div className="font-bold text-slate-200">
                ${trade.entryPrice < 0.01 ? trade.entryPrice.toFixed(7) : trade.entryPrice.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-sans">Exit Price</div>
              <div className="font-bold text-white">
                ${trade.exitPrice < 0.01 ? trade.exitPrice.toFixed(7) : trade.exitPrice.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Profit / Loss per Trade */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800">
            <span className="text-[11px] text-slate-400">Profit / Loss:</span>
            <span
              className={`font-mono font-bold text-sm ${
                trade.isWin ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {trade.pnlUsd >= 0 ? '+' : ''}${trade.pnlUsd.toFixed(2)} (
              {trade.pnlPercent >= 0 ? '+' : ''}
              {trade.pnlPercent}%)
            </span>
          </div>

          {/* Execution Route & Size */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
            <span>Size: {trade.amount} units</span>
            <span className="truncate max-w-[170px] text-slate-300">{trade.route}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0d14] rounded-2xl border border-slate-800/80 p-4 sm:p-5 shadow-2xl overflow-y-auto space-y-5">
      {/* View Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20">
              <Award className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              AI Agent Performance & Success Analytics
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
            <span>Hover over any chart point for granular entry price, exit price, profit/loss, and timestamp details.</span>
          </p>
        </div>

        {/* Header Controls: Timeframe & Simulation */}
        <div className="flex items-center gap-2">
          {/* Timeframe pills */}
          <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-1">
            {(['24H', '7D', '30D'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  timeframe === tf
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            onClick={handleSimulateTrade}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition active:scale-95"
            title="Simulate an autonomous trade execution"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Simulate Trade</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 sm:p-4">
          <div className="flex items-center justify-between text-xs text-emerald-400/80 mb-1">
            <span>Cumulative Profit</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
            +${totalPnlUsd.toFixed(2)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-300">
            <span className="font-semibold">+54.1%</span>
            <span className="text-slate-400">vs benchmark</span>
          </div>
        </div>

        <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-3 sm:p-4">
          <div className="flex items-center justify-between text-xs text-blue-400/80 mb-1">
            <span>Trade Success Rate</span>
            <Percent className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white">
            {currentWinRate}%
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-300">
            <span className="text-emerald-400 font-semibold">{winTradesCount} Wins</span>
            <span className="text-slate-500">•</span>
            <span className="text-rose-400 font-semibold">{lossTradesCount} Losses</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 sm:p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Profit Factor</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-300">
            2.85x
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Avg Win: <span className="text-emerald-400 font-semibold">+$38.40</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 sm:p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Autonomous Guardians</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-indigo-300">
            44 Orders
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            TP/SL trigger efficiency: <span className="text-emerald-400 font-semibold">84.1%</span>
          </div>
        </div>
      </div>

      {/* Main Primary Chart: AreaChart for Cumulative PnL, LineChart for Win Rate, or BarChart for Trade-by-Trade Flow */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>
                {chartMetric === 'pnl'
                  ? 'Cumulative Agent P&L Progression ($)'
                  : chartMetric === 'winrate'
                  ? 'Rolling Trade Success Rate (%) Over Time'
                  : 'Individual Trade Execution P&L Flow ($)'}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Interactive Recharts visualization • Hover over any data point for granular entry/exit details
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setChartMetric('pnl')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                chartMetric === 'pnl' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cumulative P&L
            </button>
            <button
              onClick={() => setChartMetric('winrate')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                chartMetric === 'winrate' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Success Rate %
            </button>
            <button
              onClick={() => setChartMetric('trades')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                chartMetric === 'trades' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Trade-by-Trade
            </button>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartMetric === 'pnl' ? (
              <AreaChart data={activeChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0500FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0500FF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
                <Tooltip content={<GranularPerformanceTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 10, fontSize: 12 }}
                  formatter={value => (
                    <span className="text-slate-300 font-medium capitalize">
                      {value === 'cumulativePnl' ? 'Cumulative Profit ($)' : 'Portfolio Valuation ($)'}
                    </span>
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="cumulativePnl"
                  name="cumulativePnl"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#pnlGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="portfolioVal"
                  name="portfolioVal"
                  stroke="#0052FF"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#portfolioGradient)"
                />
              </AreaChart>
            ) : chartMetric === 'winrate' ? (
              <LineChart data={activeChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" domain={[60, 100]} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                <Tooltip content={<GranularPerformanceTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 10, fontSize: 12 }}
                  formatter={value => (
                    <span className="text-slate-300 font-medium">
                      {value === 'winRate' ? 'Trade Success Rate (%)' : value}
                    </span>
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="winRate"
                  name="winRate"
                  stroke="#38bdf8"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#0284c7' }}
                  activeDot={{ r: 7, fill: '#38bdf8' }}
                />
              </LineChart>
            ) : (
              /* Trade-by-Trade Individual Execution PnL Flow */
              <BarChart data={trades.slice().reverse()} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="token" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
                <ReferenceLine y={0} stroke="#475569" strokeDasharray="2 2" />
                <Tooltip content={<GranularIndividualTradeTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 10, fontSize: 12 }}
                  formatter={() => (
                    <span className="text-slate-300 font-medium">Individual Trade PnL ($)</span>
                  )}
                />
                <Bar dataKey="pnlUsd" name="pnlUsd" radius={[4, 4, 0, 0]}>
                  {trades.slice().reverse().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.isWin ? '#10b981' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Analytics Grid: Trade Outcome Volume & Skill Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Trade Wins vs Losses Volume (BarChart with Granular Tooltip) */}
        <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                <span>Trade Volume: Wins vs. Losses per Period</span>
              </h4>
              <p className="text-[10px] text-slate-400">Hover bars to view win/loss counts and representative trade executions</p>
            </div>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip content={<GranularBarTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 8, fontSize: 11 }}
                  formatter={value => (
                    <span className="text-slate-300 capitalize font-medium">{value}</span>
                  )}
                />
                <Bar dataKey="wins" name="Wins" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="losses" name="Losses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Performance by Agent Skill & Chain */}
        <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-slate-900/40 p-4 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span>Skill & Engine Profit Breakdown</span>
            </h4>
            <p className="text-[10px] text-slate-400 mb-3">Granular return rate by execution infrastructure</p>

            <div className="space-y-2.5">
              {SKILL_PERFORMANCE_BREAKDOWN.map(skill => (
                <div key={skill.name} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs hover:border-slate-700 transition">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white">{skill.name}</span>
                    <span className="font-mono text-emerald-400 font-bold">+${skill.profit}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{skill.trades} trades</span>
                    <span className="text-cyan-300 font-medium">{skill.winRate}% Win Rate</span>
                  </div>

                  {skill.bestTrade && (
                    <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Best: ${skill.bestTrade.token}</span>
                      <span>Entry: ${skill.bestTrade.entryPrice} → Exit: ${skill.bestTrade.exitPrice}</span>
                      <span className="text-emerald-400 font-bold">+${skill.bestTrade.pnlUsd}</span>
                    </div>
                  )}

                  {/* Progress bar */}
                  <div className="mt-1.5 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${skill.winRate}%`, backgroundColor: skill.fill }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Historical Trades Log Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span>Agent Execution Audit & Trade History</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Granular trade parameters: Entry price, exit price, profit/loss, route, and execution timestamp
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setTradeFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                tradeFilter === 'all' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({trades.length})
            </button>
            <button
              onClick={() => setTradeFilter('wins')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                tradeFilter === 'wins' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Wins ({winTradesCount})
            </button>
            <button
              onClick={() => setTradeFilter('losses')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                tradeFilter === 'losses' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Losses ({lossTradesCount})
            </button>
          </div>
        </div>

        {/* Table / List */}
        <div className="space-y-2">
          {filteredTrades.map(trade => (
            <div
              key={trade.id}
              onClick={() => setSelectedTradeModal(trade)}
              className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-blue-500/50 hover:bg-slate-900/60 transition cursor-pointer text-xs"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    trade.isWin
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {trade.isWin ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">${trade.token}</span>
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      {trade.chain}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        trade.type === 'TP_HIT'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : trade.type === 'SL_TRIGGER'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {trade.type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                    <span className="font-mono">
                      Entry: ${trade.entryPrice < 0.01 ? trade.entryPrice.toFixed(6) : trade.entryPrice.toFixed(2)} → Exit: ${trade.exitPrice < 0.01 ? trade.exitPrice.toFixed(6) : trade.exitPrice.toFixed(2)}
                    </span>
                    <span>•</span>
                    <span className="truncate max-w-[200px]">{trade.route}</span>
                  </div>
                </div>
              </div>

              {/* Trade Price & PnL details */}
              <div className="text-right">
                <div
                  className={`font-mono font-bold text-sm ${
                    trade.isWin ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {trade.pnlUsd >= 0 ? '+' : ''}${trade.pnlUsd.toFixed(2)} (
                  {trade.pnlPercent >= 0 ? '+' : ''}
                  {trade.pnlPercent}%)
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{trade.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trade Detail Modal on Click */}
      {selectedTradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#0c101d] p-5 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    selectedTradeModal.isWin
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {selectedTradeModal.isWin ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Trade Execution Audit</h3>
                  <p className="text-[11px] text-slate-400">{selectedTradeModal.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTradeModal(null)}
                className="text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 font-sans">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Asset / Position</div>
                  <div className="text-base font-bold text-white">{selectedTradeModal.amount} {selectedTradeModal.token}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Execution P/L</div>
                  <div className={`font-mono text-base font-bold ${selectedTradeModal.isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {selectedTradeModal.pnlUsd >= 0 ? '+' : ''}${selectedTradeModal.pnlUsd.toFixed(2)} ({selectedTradeModal.pnlPercent}%)
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-sans">Entry Price</div>
                  <div className="text-sm font-bold text-slate-200">${selectedTradeModal.entryPrice}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-sans">Exit Price</div>
                  <div className="text-sm font-bold text-white">${selectedTradeModal.exitPrice}</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Blockchain Network:</span>
                  <span className="font-semibold text-white uppercase">{selectedTradeModal.chain}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Order Type:</span>
                  <span className="font-semibold text-white">{selectedTradeModal.type}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Routing Engine:</span>
                  <span className="font-semibold text-cyan-300">{selectedTradeModal.route}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Execution Timestamp:</span>
                  <span className="font-mono text-slate-300">{selectedTradeModal.timestamp}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedTradeModal(null)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
