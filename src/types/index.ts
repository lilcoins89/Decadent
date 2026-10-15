export type ChainId = 'solana' | 'ethereum' | 'bsc' | 'arbitrum' | 'base' | 'polygon';

export interface Token {
  symbol: string;
  name: string;
  address: string;
  chain: ChainId;
  priceUsd: number;
  change24h: number;
  decimals: number;
  iconUrl?: string;
  balance: number;
  pairAddress?: string;
  volume24h?: number;
  liquidityUsd?: number;
}

export type OrderType = 'take-profit' | 'stop-loss' | 'bracket' | 'limit-buy' | 'limit-sell';

export interface Order {
  id: string;
  type: OrderType;
  tokenSymbol: string;
  chain: ChainId;
  amount: number;
  entryPrice: number;
  takeProfitPrice?: number;
  stopLossPrice?: number;
  currentPrice: number;
  status: 'active' | 'triggered' | 'cancelled';
  createdAt: string;
  triggeredAt?: string;
  reason?: string;
  triggerType?: 'TP' | 'SL';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  action?: {
    name: string;
    args: any;
    result?: any;
    status?: 'executed' | 'pending' | 'failed';
  };
  quickActions?: string[];
}

export interface DexPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  txns?: {
    h24: {
      buys: number;
      sells: number;
    };
  };
  volume?: {
    h24: number;
  };
  priceChange?: {
    h24: number;
    h6?: number;
    h1?: number;
    m5?: number;
  };
  liquidity?: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv?: number;
}

export interface WalletKeypair {
  chain: ChainId;
  address: string;
  publicKeyPreview: string;
  encryptedKeyHash: string;
  balanceNative: number;
  balanceUsd: number;
}

export interface JupiterRouteOption {
  ammName: string;
  inAmount: string;
  outAmount: string;
  priceImpactPct: string;
  minimumReceived: string;
  feeUsd: string;
}

export interface AgentTrade {
  id: string;
  token: string;
  chain: ChainId;
  type: 'TP_HIT' | 'SL_TRIGGER' | 'SWAP_BUY' | 'SWAP_SELL' | 'LIMIT_FILLED';
  amount: number;
  entryPrice: number;
  exitPrice: number;
  pnlUsd: number;
  pnlPercent: number;
  isWin: boolean;
  timestamp: string;
  route: string;
}

export interface PerformanceDataPoint {
  date: string;
  timestamp?: string;
  portfolioVal: number;
  cumulativePnl: number;
  dailyPnl: number;
  winRate: number;
  tradesCount: number;
  wins: number;
  losses: number;
  topTrade?: {
    token: string;
    action: string;
    amount: number;
    entryPrice: number;
    exitPrice: number;
    pnlUsd: number;
    pnlPercent: number;
    isWin: boolean;
    route: string;
    timestamp: string;
  };
  executedTrades?: Array<{
    id: string;
    token: string;
    action: string;
    amount: number;
    entryPrice: number;
    exitPrice: number;
    pnlUsd: number;
    pnlPercent: number;
    isWin: boolean;
    route: string;
    timestamp: string;
  }>;
}

