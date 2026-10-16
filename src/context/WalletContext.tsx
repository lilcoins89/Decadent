import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useConnector } from '@solana/connector/react';
import { Token, Order, ChainId, DexPair } from '../types';
import { INITIAL_TOKENS } from '../data/tokens';

interface WalletContextType {
  tokens: Token[];
  selectedToken: Token;
  activeChain: ChainId | 'all';
  orders: Order[];
  totalBalanceUsd: number;
  walletAddress: { [key in ChainId]: string };
  trustPortalApiKey: string;
  trustPortalSecret: string;
  recentActivity: Array<{
    id: string;
    type: 'SWAP' | 'TP_TRIGGERED' | 'SL_TRIGGERED' | 'LIMIT_FILLED';
    desc: string;
    timestamp: string;
    status: 'success' | 'pending';
  }>;
  setSelectedToken: (token: Token) => void;
  setActiveChain: (chain: ChainId | 'all') => void;
  executeSwap: (fromSymbol: string, toSymbol: string, amount: number) => Promise<{ success: boolean; message: string; txHash?: string }>;
  createOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status' | 'currentPrice'>) => Order;
  cancelOrder: (orderId: string) => void;
  faucetAirdrop: (symbol: string, amount: number) => void;
  savePortalKeys: (apiKey: string, secret: string) => void;
  selectTokenBySymbol: (symbol: string) => boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const WALLET_ADDRESSES: { [key in ChainId]: string } = {
  solana: '',
  ethereum: '0x71C8364437bE573542065369654988c42b083974',
  bsc: '0x71C8364437bE573542065369654988c42b083974',
  arbitrum: '0x71C8364437bE573542065369654988c42b083974',
  polygon: '0x71C8364437bE573542065369654988c42b083974',
  base: '0x71C8364437bE573542065369654988c42b083974',
};

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { account, isConnected } = useConnector();
  const [walletAddresses, setWalletAddresses] = useState<{ [key in ChainId]: string }>(WALLET_ADDRESSES);
  const [tokens, setTokens] = useState<Token[]>([]);

  const [selectedToken, setSelectedToken] = useState<Token>(INITIAL_TOKENS[0]);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [activeChain, setActiveChain] = useState<ChainId | 'all'>('solana');

  const [orders, setOrders] = useState<Order[]>([]);

  const [trustPortalApiKey, setTrustPortalApiKey] = useState<string>(() => localStorage.getItem('tw_portal_key') || '');
  const [trustPortalSecret, setTrustPortalSecret] = useState<string>(() => localStorage.getItem('tw_portal_secret') || '');

  const [recentActivity, setRecentActivity] = useState<Array<{
    id: string;
    type: 'SWAP' | 'TP_TRIGGERED' | 'SL_TRIGGERED' | 'LIMIT_FILLED';
    desc: string;
    timestamp: string;
    status: 'success' | 'pending';
  }>>([]);

  useEffect(() => {
    setWalletAddresses((previous) => ({
      ...previous,
      solana: isConnected && account ? String(account) : '',
    }));
  }, [account, isConnected]);

  useEffect(() => {
    if (!isConnected || !account) {
      setTokens([]);
      return;
    }

    let cancelled = false;
    setPortfolioLoading(true);
    fetch(`/api/helius/portfolio?address=${encodeURIComponent(String(account))}`)
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'Unable to load wallet portfolio');
        return payload;
      })
      .then((portfolio) => {
        if (cancelled) return;
        const native = INITIAL_TOKENS.find((token) => token.symbol === 'SOL');
        const liveTokens: Token[] = [
          ...(native && portfolio.nativeBalanceSol > 0 ? [{
            ...native,
            balance: portfolio.nativeBalanceSol,
            priceUsd: native.priceUsd,
          }] : []),
          ...(portfolio.assets ?? []).map((asset: any): Token => {
            const known = INITIAL_TOKENS.find((token) => token.address === asset.id || token.symbol === asset.symbol);
            return {
              ...(known ?? { change24h: 0, chain: 'solana' as const }),
              symbol: asset.symbol,
              name: asset.name,
              address: asset.id,
              decimals: asset.decimals,
              balance: asset.amount,
              priceUsd: asset.priceUsd ?? known?.priceUsd ?? 0,
              iconUrl: asset.logoUri ?? known?.iconUrl,
            };
          }),
        ].filter((token, index, all) => all.findIndex((candidate) => candidate.symbol === token.symbol) === index);
        setTokens(liveTokens);
        setSelectedToken((current) => liveTokens.find((token) => token.symbol === current.symbol) ?? liveTokens[0] ?? current);
      })
      .catch(() => {
        if (!cancelled) setTokens([]);
      })
      .finally(() => {
        if (!cancelled) setPortfolioLoading(false);
      });

    return () => { cancelled = true; };
  }, [account, isConnected]);

  // Calculate total USD balance
  const totalBalanceUsd = tokens.reduce((sum, t) => sum + t.balance * t.priceUsd, 0);

  // Check active orders whenever prices change
  useEffect(() => {
    setOrders(prevOrders => {
      let orderChanged = false;
      const updated = prevOrders.map(order => {
        if (order.status !== 'active') return order;

        const currentToken = tokens.find(t => t.symbol.toUpperCase() === order.tokenSymbol.toUpperCase());
        if (!currentToken) return order;

        const curPrice = currentToken.priceUsd;
        let triggered = false;
        let reason = '';
        let triggerType: 'TP' | 'SL' = 'TP';

        // Check Take Profit
        if (order.takeProfitPrice && curPrice >= order.takeProfitPrice) {
          triggered = true;
          triggerType = 'TP';
          reason = `Take Profit Triggered at $${curPrice} (Target: $${order.takeProfitPrice})`;
        }
        // Check Stop Loss
        else if (order.stopLossPrice && curPrice <= order.stopLossPrice) {
          triggered = true;
          triggerType = 'SL';
          reason = `Stop Loss Triggered at $${curPrice} (Floor: $${order.stopLossPrice})`;
        }

        if (triggered) {
          orderChanged = true;
          // Add to activity
          setRecentActivity(act => [
            {
              id: 'trig-' + Date.now(),
              type: triggerType === 'TP' ? 'TP_TRIGGERED' : 'SL_TRIGGERED',
              desc: `Automated ${triggerType} Executed: Sold ${order.amount} ${order.tokenSymbol} @ $${curPrice}`,
              timestamp: 'Just now',
              status: 'success',
            },
            ...act.slice(0, 15),
          ]);

          return {
            ...order,
            status: 'triggered' as const,
            currentPrice: curPrice,
            triggeredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            reason,
            triggerType,
          };
        }

        return {
          ...order,
          currentPrice: curPrice,
        };
      });

      return orderChanged ? updated : prevOrders;
    });
  }, [tokens]);

  const selectTokenBySymbol = (symbol: string): boolean => {
    const found = tokens.find(t => t.symbol.toUpperCase() === symbol.toUpperCase());
    if (found) {
      setSelectedToken(found);
      if (activeChain !== 'all' && found.chain !== activeChain) {
        setActiveChain(found.chain);
      }
      return true;
    }
    return false;
  };

  const executeSwap = async (
    fromSymbol: string,
    toSymbol: string,
    amount: number
  ): Promise<{ success: boolean; message: string; txHash?: string }> => {
    const from = tokens.find(t => t.symbol.toUpperCase() === fromSymbol.toUpperCase());
    const to = tokens.find(t => t.symbol.toUpperCase() === toSymbol.toUpperCase());

    if (!from || !to) {
      return { success: false, message: `Token ${!from ? fromSymbol : toSymbol} not found.` };
    }

    if (from.balance < amount) {
      return { success: false, message: `Insufficient ${from.symbol} balance (Available: ${from.balance.toFixed(4)}).` };
    }

    // Calculate conversion based on USD value
    const fromUsd = amount * from.priceUsd;
    const toAmount = fromUsd / to.priceUsd;
    const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    // Update balances
    setTokens(prev =>
      prev.map(t => {
        if (t.symbol === from.symbol) {
          return { ...t, balance: Math.max(0, t.balance - amount) };
        }
        if (t.symbol === to.symbol) {
          return { ...t, balance: t.balance + toAmount };
        }
        return t;
      })
    );

    const desc = `Swapped ${amount} ${from.symbol} → ${toAmount < 0.01 ? toAmount.toFixed(6) : toAmount.toFixed(4)} ${to.symbol}`;
    setRecentActivity(act => [
      {
        id: 'swap-' + Date.now(),
        type: 'SWAP',
        desc,
        timestamp: 'Just now',
        status: 'success',
      },
      ...act.slice(0, 15),
    ]);

    return {
      success: true,
      message: `Successfully swapped ${amount} ${from.symbol} for ${toAmount.toFixed(4)} ${to.symbol} via Trust Wallet & Jupiter Engine.`,
      txHash,
    };
  };

  const createOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'currentPrice'>): Order => {
    const currentToken = tokens.find(t => t.symbol === orderData.tokenSymbol);
    const curPrice = currentToken?.priceUsd || orderData.entryPrice;

    const newOrder: Order = {
      ...orderData,
      id: 'ord-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      currentPrice: curPrice,
      status: 'active',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const cancelOrder = (orderId: string) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: 'cancelled' as const } : o))
    );
  };

  const faucetAirdrop = (symbol: string, amount: number) => {
    setTokens(prev =>
      prev.map(t => (t.symbol.toUpperCase() === symbol.toUpperCase() ? { ...t, balance: t.balance + amount } : t))
    );
  };

  const savePortalKeys = (apiKey: string, secret: string) => {
    setTrustPortalApiKey(apiKey);
    setTrustPortalSecret(secret);
    localStorage.setItem('tw_portal_key', apiKey);
    localStorage.setItem('tw_portal_secret', secret);
  };

  return (
    <WalletContext.Provider
      value={{
        tokens,
        selectedToken,
        activeChain,
        orders,
        totalBalanceUsd,
        walletAddress: walletAddresses,
        trustPortalApiKey,
        trustPortalSecret,
        recentActivity,
        setSelectedToken,
        setActiveChain,
        executeSwap,
        createOrder,
        cancelOrder,
        faucetAirdrop,
        savePortalKeys,
        selectTokenBySymbol,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
