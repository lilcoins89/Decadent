import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Shield, 
  Droplets, 
  Key, 
  ExternalLink,
  Coins,
  QrCode
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { ChainId } from '../types';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { tokens, walletAddress, totalBalanceUsd, faucetAirdrop } = useWallet();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedChain, setSelectedChain] = useState<ChainId>('solana');
  const [faucetSuccess, setFaucetSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleFaucet = (symbol: string, amount: number) => {
    faucetAirdrop(symbol, amount);
    setFaucetSuccess(`Airdropped +${amount} ${symbol} to your multichain wallet!`);
    setTimeout(() => setFaucetSuccess(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0c101a] p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Trust Wallet Multichain Manager</h3>
              <p className="text-[11px] text-slate-400">Deterministic keypairs & portfolio balances</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Total Value Banner */}
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-900/30 via-slate-900 to-indigo-900/30 border border-blue-500/30 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-blue-400">Total Portfolio Valuation</div>
            <div className="text-2xl font-bold font-mono text-white mt-0.5">
              ${totalBalanceUsd.toFixed(2)} USD
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              Autonomous Agent: ARMED
            </span>
          </div>
        </div>

        {/* Chain Addresses */}
        <div className="mt-4 space-y-2">
          <div className="text-xs font-semibold text-slate-300">Public Addresses</div>
          
          {(['solana', 'bsc', 'ethereum', 'arbitrum'] as const).map(chain => (
            <div
              key={chain}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs"
            >
              <div>
                <span className="font-semibold text-white capitalize">{chain}</span>
                <div className="font-mono text-[11px] text-slate-400 truncate max-w-[240px] sm:max-w-xs">
                  {walletAddress[chain]}
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(walletAddress[chain], chain)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              >
                {copiedKey === chain ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          ))}
        </div>

        {/* Faucet / Testnet Deposit Simulation */}
        <div className="mt-5 p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
            <Droplets className="w-4 h-4" />
            <span>Developer Test Faucet</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Instantly airdrop test tokens to simulate trades, swaps, and TP/SL automations:
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleFaucet('SOL', 2)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition"
            >
              +2 SOL
            </button>
            <button
              onClick={() => handleFaucet('BONK', 1000000)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition"
            >
              +1M BONK
            </button>
            <button
              onClick={() => handleFaucet('TWT', 100)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition"
            >
              +100 TWT
            </button>
            <button
              onClick={() => handleFaucet('USDC', 500)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition"
            >
              +500 USDC
            </button>
          </div>

          {faucetSuccess && (
            <div className="text-[11px] text-emerald-400 font-medium">
              ✓ {faucetSuccess}
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition"
        >
          Done
        </button>
      </div>
    </div>
  );
};
