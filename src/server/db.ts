import pg from 'pg'

const { Pool } = pg

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

let initialized = false

export async function initializeDatabase() {
  if (initialized || !process.env.DATABASE_URL) return
  await pool.query(`
    CREATE TABLE IF NOT EXISTS agent_conversations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT 'Trading session',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS agent_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      conversation_id UUID NOT NULL REFERENCES agent_conversations(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
      content TEXT NOT NULL,
      tool_name TEXT,
      tool_payload JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS trading_orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id TEXT NOT NULL,
      token_symbol TEXT NOT NULL,
      chain TEXT NOT NULL,
      order_type TEXT NOT NULL,
      amount NUMERIC NOT NULL CHECK (amount > 0),
      entry_price NUMERIC,
      take_profit_price NUMERIC,
      stop_loss_price NUMERIC,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      triggered_at TIMESTAMPTZ
    )
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS trade_executions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id TEXT NOT NULL,
      action TEXT NOT NULL,
      chain TEXT NOT NULL,
      from_token TEXT,
      to_token TEXT,
      amount NUMERIC,
      entry_price NUMERIC,
      exit_price NUMERIC,
      pnl_usd NUMERIC,
      transaction_hash TEXT,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS agent_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      payload JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await pool.query('CREATE INDEX IF NOT EXISTS agent_messages_conversation_idx ON agent_messages(conversation_id, created_at)')
  await pool.query('CREATE INDEX IF NOT EXISTS trading_orders_session_idx ON trading_orders(session_id, status)')
  await pool.query('CREATE INDEX IF NOT EXISTS agent_events_session_idx ON agent_events(session_id, created_at)')
  initialized = true
}

export async function saveMessage(conversationId: string, role: string, content: string, toolName?: string, toolPayload?: unknown) {
  await pool.query(
    'INSERT INTO agent_messages (conversation_id, role, content, tool_name, tool_payload) VALUES ($1, $2, $3, $4, $5)',
    [conversationId, role, content, toolName ?? null, toolPayload ? JSON.stringify(toolPayload) : null],
  )
  await pool.query('UPDATE agent_conversations SET updated_at = NOW() WHERE id = $1', [conversationId])
}

export async function getOrCreateConversation(sessionId: string, title?: string) {
  const existing = await pool.query('SELECT id FROM agent_conversations WHERE session_id = $1 ORDER BY updated_at DESC LIMIT 1', [sessionId])
  if (existing.rows[0]) return existing.rows[0].id as string
  const created = await pool.query('INSERT INTO agent_conversations (session_id, title) VALUES ($1, $2) RETURNING id', [sessionId, title ?? 'Trading session'])
  return created.rows[0].id as string
}

export async function recordEvent(sessionId: string, eventType: string, payload: unknown) {
  await pool.query('INSERT INTO agent_events (session_id, event_type, payload) VALUES ($1, $2, $3)', [sessionId, eventType, JSON.stringify(payload ?? {})])
}

export async function createOrder(sessionId: string, order: { tokenSymbol: string; chain: string; orderType: string; amount: number; entryPrice?: number; takeProfitPrice?: number; stopLossPrice?: number }) {
  const result = await pool.query(
    `INSERT INTO trading_orders (session_id, token_symbol, chain, order_type, amount, entry_price, take_profit_price, stop_loss_price)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [sessionId, order.tokenSymbol, order.chain, order.orderType, order.amount, order.entryPrice ?? null, order.takeProfitPrice ?? null, order.stopLossPrice ?? null],
  )
  return result.rows[0]
}

export async function recordTrade(sessionId: string, trade: Record<string, unknown>) {
  await pool.query(
    `INSERT INTO trade_executions (session_id, action, chain, from_token, to_token, amount, entry_price, exit_price, pnl_usd, transaction_hash, metadata)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
    [sessionId, trade.action ?? 'unknown', trade.chain ?? 'solana', trade.fromToken ?? null, trade.toToken ?? null, trade.amount ?? null, trade.entryPrice ?? null, trade.exitPrice ?? null, trade.pnlUsd ?? null, trade.transactionHash ?? null, JSON.stringify(trade)],
  )
}

export async function closeDatabase() { await pool.end() }
