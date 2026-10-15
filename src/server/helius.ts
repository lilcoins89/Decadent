const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY ?? ''}`;

export interface HeliusPortfolio {
  address: string;
  nativeBalanceLamports: number;
  nativeBalanceSol: number;
  assets: Array<{
    id: string;
    symbol: string;
    name: string;
    amount: number;
    decimals: number;
    priceUsd?: number;
    valueUsd?: number;
    logoUri?: string;
  }>;
  totalValueUsd?: number;
}

export async function getHeliusPortfolio(address: string): Promise<HeliusPortfolio> {
  if (!HELIUS_API_KEY) throw new Error('HELIUS_API_KEY is not configured');
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) throw new Error('Invalid Solana wallet address');

  const [balanceResponse, assetsResponse] = await Promise.all([
    fetch(HELIUS_RPC_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 'decadent-balance', method: 'getBalance', params: [address] }),
    }),
    fetch(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'decadent-assets',
        method: 'getAssetsByOwner',
        params: { ownerAddress: address, page: 1, limit: 100, displayOptions: { showFungible: true } },
      }),
    }),
  ]);

  if (!balanceResponse.ok || !assetsResponse.ok) throw new Error('Helius request failed');
  const balanceJson = await balanceResponse.json();
  const assetsJson = await assetsResponse.json();
  if (balanceJson.error) throw new Error(balanceJson.error.message ?? 'Helius balance request failed');
  if (assetsJson.error) throw new Error(assetsJson.error.message ?? 'Helius assets request failed');

  const assets = (assetsJson.result?.items ?? []).map((asset: any) => {
    const decimals = asset.token_info?.decimals ?? 0;
    const amount = Number(asset.token_info?.balance ?? 0) / 10 ** decimals;
    const priceUsd = asset.token_info?.price_info?.price_per_token;
    return {
      id: asset.id,
      symbol: asset.content?.metadata?.symbol ?? asset.token_info?.symbol ?? 'UNKNOWN',
      name: asset.content?.metadata?.name ?? 'Solana asset',
      amount,
      decimals,
      priceUsd,
      valueUsd: typeof priceUsd === 'number' ? amount * priceUsd : undefined,
      logoUri: asset.content?.links?.image,
    };
  });

  const nativeBalanceLamports = balanceJson.result?.value ?? 0;
  const nativeBalanceSol = nativeBalanceLamports / 1_000_000_000;
  return {
    address,
    nativeBalanceLamports,
    nativeBalanceSol,
    assets,
    totalValueUsd: assets.reduce((total: number, asset: { valueUsd?: number }) => total + (asset.valueUsd ?? 0), 0),
  };
}

export function isHeliusConfigured() {
  return Boolean(HELIUS_API_KEY);
}

export function getHeliusErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unable to reach Helius';
}

export const HELIUS_RPC_ENDPOINT = HELIUS_RPC_URL;
