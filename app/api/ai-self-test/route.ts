import { NextResponse } from 'next/server';
import { runAI, MODEL_CHAIN } from '@/lib/aiClient';

export const runtime = 'nodejs';

export async function GET() {
  const started = Date.now();
  const hasKey = !!process.env.OPENAI_API_KEY;
  const modelEnv = process.env.OPENAI_MODEL || 'unset';
  const chain = MODEL_CHAIN;
  let aiResult: any = null;
  let error: string | null = null;

  try {
    if (!hasKey) throw new Error('OPENAI_API_KEY missing');
    aiResult = await runAI({
      prompt: 'Return a JSON object {"status":"ok","note":"self-test"}',
      reasoningEffort: 'minimal',
      verbosity: 'low',
      temperature: 0
    });
    // attempt to parse to ensure JSON returned
    let parsed: any = null;
    try { parsed = JSON.parse(aiResult.text); } catch { /* ignore */ }
    aiResult.parsed = parsed;
  } catch (e: any) {
    error = e?.message || String(e);
  }

  return NextResponse.json({
    ok: !error,
    error,
    env: {
      hasKey,
      modelEnv,
      reasoning: process.env.OPENAI_REASONING_EFFORT || 'default',
      verbosity: process.env.OPENAI_VERBOSITY || 'default'
    },
    chain,
    ai: aiResult && {
      model: aiResult.model,
      modelsTried: aiResult.modelsTried,
      ms: aiResult.ms,
      raw: aiResult.text,
      parsed: aiResult.parsed
    },
    totalMs: Date.now() - started,
    timestamp: new Date().toISOString()
  });
}
