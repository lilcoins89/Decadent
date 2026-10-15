import { getHeliusErrorMessage, getHeliusPortfolio } from '../../src/server/helius';

type RequestLike = { query: Record<string, string | string[] | undefined> };
type ResponseLike = { status: (code: number) => ResponseLike; json: (body: unknown) => unknown };

export default async function handler(req: RequestLike, res: ResponseLike) {
  const address = typeof req.query.address === 'string' ? req.query.address : '';
  if (!address) return res.status(400).json({ error: 'A Solana wallet address is required' });

  try {
    return res.status(200).json(await getHeliusPortfolio(address));
  } catch (error) {
    return res.status(502).json({ error: getHeliusErrorMessage(error) });
  }
}
