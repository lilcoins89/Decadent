import React from 'react';
import { 
  SlidersHorizontal, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  AlertTriangle,
  Trash2,
  Zap
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { Order } from '../types';

export const ActiveOrdersView: React.FC = () => {
  const { orders, cancelOrder, tokens } = useWallet();

  const activeOrders = orders.filter(o => o.status === 'active');
  const pastOrders = orders.filter(o => o.status !== 'active');

  return (
    <div className="flex flex-col h-full bg-[#0a0d14] rounded-2xl border border-slate-800/80 p-4 sm:p-5 shadow-2xl overflow-y-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Autonomous Take Profit & Stop Loss Orders
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
              {activeOrders.length} Active Guardians
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Orders are continuously evaluated against live multichain price ticks. Triggers auto-execute simulated sells to preserve gains.
          </p>
        </div>
      </div>

      {/* Active Orders Grid */}
      {activeOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 text-center my-4">
          <SlidersHorizontal className="w-8 h-8 text-slate-600 mb-2" />
          <h3 className="text-sm font-semibold text-slate-300">No Active TP/SL Orders</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Protect your positions by arming Take Profit or Stop Loss triggers from the Swap panel or by instructing the AI Copilot.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {activeOrders.map(order => {
            const token = tokens.find(t => t.symbol === order.tokenSymbol);
            const curPrice = token?.priceUsd || order.currentPrice;

            // Distance calculation
            const tpDistance = order.takeProfitPrice
              ? (((order.takeProfitPrice - curPrice) / curPrice) * 100).toFixed(1)
              : null;
            const slDistance = order.stopLossPrice
              ? (((curPrice - order.stopLossPrice) / curPrice) * 100).toFixed(1)
              : null;

            return (
              <div
                key={order.id}
                className="rounded-xl border border-slate-700/80 bg-slate-900/70 p-4 space-y-3 shadow-md hover:border-slate-600 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{order.tokenSymbol}</span>
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {order.chain}
                    </span>
                    <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      {order.type.toUpperCase()}
                    </span>
                  </div>

                  <button
                    onClick={() => cancelOrder(order.id)}
                    title="Cancel Order"
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                    <div className="text-[10px] text-slate-400">Position Amount</div>
                    <div className="font-mono font-semibold text-white">
                      {order.amount} {order.tokenSymbol}
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                    <div className="text-[10px] text-slate-400">Current Price</div>
                    <div className="font-mono font-semibold text-emerald-400">
                      ${curPrice < 0.01 ? curPrice.toFixed(6) : curPrice.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* TP & SL targets */}
                <div className="space-y-1.5 text-xs">
                  {order.takeProfitPrice && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/20">
                      <div className="flex items-center gap-1.5 text-emerald-300">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span className="font-semibold">Take Profit Target</span>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-emerald-300">
                          ${order.takeProfitPrice < 0.01 ? order.takeProfitPrice.toFixed(6) : order.takeProfitPrice.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-emerald-400/80">
                          {tpDistance ? `+${tpDistance}% to trigger` : ''}
                        </div>
                      </div>
                    </div>
                  )}

                  {order.stopLossPrice && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-rose-950/30 border border-rose-500/20">
                      <div className="flex items-center gap-1.5 text-rose-300">
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span className="font-semibold">Stop Loss Floor</span>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-rose-300">
                          ${order.stopLossPrice < 0.01 ? order.stopLossPrice.toFixed(6) : order.stopLossPrice.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-rose-400/80">
                          {slDistance ? `-${slDistance}% from floor` : ''}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>Armed: {order.createdAt}</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <ShieldCheck className="w-3 h-3" />
                    Auto-Monitor Active
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Triggered & Past Orders History */}
      {pastOrders.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-800">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Triggered & Closed Order History
          </h3>
          <div className="space-y-2">
            {pastOrders.map(order => (
              <div
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs"
              >
                <div className="flex items-center gap-2">
                  {order.status === 'triggered' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                  <div>
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <span>{order.tokenSymbol} {order.amount} units</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        order.status === 'triggered' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    {order.reason && (
                      <div className="text-[11px] text-slate-400 mt-0.5">{order.reason}</div>
                    )}
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-400 font-mono">
                  <div>{order.triggeredAt || order.createdAt}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
