import { Agent } from '@mastra/core/agent'
import { createGroq } from '@ai-sdk/groq'
import { z } from 'zod'
import { createOrder, recordEvent, recordTrade } from './db'

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

export const tradingAgent = new Agent({
  id: 'trading-copilot',
  name: 'trading-copilot',
  instructions: `You are Decadent, a careful multichain trading copilot. Be concise and actionable. You can explain markets, prepare swaps, configure TP/SL orders, inspect charts, summarize portfolio and run safe CLI commands. Never claim a blockchain transaction succeeded unless the execution tool returned success. For irreversible actions, state the parameters clearly and prefer a quote/preview before execution.`,
  model: groq('llama-3.3-70b-versatile'),
  tools: {
    record_trade_intent: {
      description: 'Record a proposed or completed trade intent in the durable database.',
      inputSchema: z.object({
        sessionId: z.string(),
        action: z.string(),
        chain: z.string().default('solana'),
        fromToken: z.string().optional(),
        toToken: z.string().optional(),
        amount: z.number().positive().optional(),
        status: z.enum(['proposed', 'executed', 'failed']).default('proposed'),
      }),
      execute: async (input: { sessionId: string; action: string; chain: string; fromToken?: string; toToken?: string; amount?: number; status: 'proposed' | 'executed' | 'failed' }) => {
        await recordTrade(input.sessionId, input)
        await recordEvent(input.sessionId, 'trade_intent', input)
        return { recorded: true, status: input.status }
      },
    },
    create_protective_order: {
      description: 'Persist a take-profit, stop-loss, or bracket order for a session.',
      inputSchema: z.object({
        sessionId: z.string(),
        tokenSymbol: z.string(),
        chain: z.string().default('solana'),
        orderType: z.enum(['take-profit', 'stop-loss', 'bracket']),
        amount: z.number().positive(),
        entryPrice: z.number().positive().optional(),
        takeProfitPrice: z.number().positive().optional(),
        stopLossPrice: z.number().positive().optional(),
      }),
      execute: async (input: { sessionId: string; tokenSymbol: string; chain: string; orderType: 'take-profit' | 'stop-loss' | 'bracket'; amount: number; entryPrice?: number; takeProfitPrice?: number; stopLossPrice?: number }) => createOrder(input.sessionId, input),
    },
  },
})

export async function generateAgentReply(message: string, history: Array<{ role: string; content: string }>, context: Record<string, unknown>, sessionId: string) {
  const prompt = history.slice(-8).map((item) => `${item.role}: ${item.content}`).join('\n') + `\nuser: ${message}\n\nRuntime context: ${JSON.stringify({ ...context, sessionId })}`
  const result = await tradingAgent.generate(prompt)
  return { text: result.text, steps: result.steps?.length ?? 0 }
}
