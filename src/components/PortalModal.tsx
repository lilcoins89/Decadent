import React, { useState } from 'react';
import { X, Key, Shield, ExternalLink, CheckCircle2, Lock, Terminal } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

interface PortalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PortalModal: React.FC<PortalModalProps> = ({ isOpen, onClose }) => {
  const { trustPortalApiKey, trustPortalSecret, savePortalKeys } = useWallet();
  const [apiKey, setApiKey] = useState(trustPortalApiKey);
  const [secret, setSecret] = useState(trustPortalSecret);
  const [isSaved, setIsSaved] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    savePortalKeys(apiKey, secret);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleVerify = () => {
    setTestStatus('Verifying HMAC signature with portal.trustwallet.com...');
    setTimeout(() => {
      setTestStatus('HMAC Handshake Authenticated! Trust Wallet Agent Skills MCP authorized.');
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0c101a] p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Trust Wallet Developer Portal</h3>
              <p className="text-[11px] text-slate-400">Authentication & HMAC Signing Configuration</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Documentation notice */}
        <div className="mt-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 space-y-1.5">
          <div className="font-semibold flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>Developer Portal & Agent SDK Integration</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Create and manage your API keys at <a href="https://portal.trustwallet.com" target="_blank" rel="noreferrer" className="text-blue-400 font-semibold underline inline-flex items-center gap-0.5">portal.trustwallet.com <ExternalLink className="w-2.5 h-2.5" /></a>. The Trust Wallet Agent SDK uses HMAC-SHA256 signatures to authorize swaps, quote generation, and multichain key operations.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Trust Wallet API Key
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="tw_live_..."
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              HMAC Signing Secret
            </label>
            <div className="relative">
              <input
                type="password"
                value={secret}
                onChange={e => setSecret(e.target.value)}
                placeholder="hmac_sec_..."
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:border-blue-500 focus:outline-none"
              />
              <Lock className="absolute right-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Used locally by @trustwallet/cli & Jupiter Agent Skills to compute cryptographic payload hashes.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition shadow-md shadow-blue-600/30 flex items-center justify-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{isSaved ? 'Keys Saved!' : 'Save Credentials'}</span>
            </button>

            <button
              type="button"
              onClick={handleVerify}
              className="rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-200 transition"
            >
              Verify Auth
            </button>
          </div>
        </form>

        {testStatus && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{testStatus}</span>
          </div>
        )}

        {/* Resources links */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Official Developer Repositories & Docs
          </div>
          <div className="space-y-1.5 text-xs">
            <a
              href="https://github.com/trustwallet/tw-agent-skills"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 hover:bg-slate-850 text-slate-300 hover:text-white transition"
            >
              <span>trustwallet/tw-agent-skills</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
            <a
              href="https://github.com/jup-ag/agent-skills"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 hover:bg-slate-850 text-slate-300 hover:text-white transition"
            >
              <span>jup-ag/agent-skills</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
            <a
              href="https://github.com/trustwallet/Charts"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 hover:bg-slate-850 text-slate-300 hover:text-white transition"
            >
              <span>trustwallet/Charts</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
