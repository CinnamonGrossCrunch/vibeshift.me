import OpenAI from 'openai';

let client: OpenAI | null = null;

export function getOpenAI() {
  if (client) return client;
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY missing');
  client = new OpenAI({ apiKey: key });
  return client;
}

const primary = process.env.OPENAI_MODEL?.trim();
const fallbacks = (process.env.OPENAI_MODEL_FALLBACKS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

export const MODEL_CHAIN: string[] = Array.from(
  new Set([primary, ...fallbacks].filter((m): m is string => !!m))
);

export type ReasoningEffort = 'minimal' | 'low' | 'medium' | 'high';
export type Verbosity = 'low' | 'medium' | 'high';

const DEFAULT_REASONING: ReasoningEffort = (process.env.OPENAI_REASONING_EFFORT as ReasoningEffort) || 'low';
const DEFAULT_VERBOSITY: Verbosity = (process.env.OPENAI_VERBOSITY as Verbosity) || 'low';

export interface RunAIOptions {
  prompt: string;
  reasoningEffort?: ReasoningEffort;
  verbosity?: Verbosity;
  temperature?: number;
  maxOutputTokens?: number;
}

export interface RunAIResult {
  model: string;
  modelsTried: string[];
  ms: number;
  text: string;
}

// Try Responses API first; fall back to chat completions when model unsupported
export async function runAI(opts: RunAIOptions): Promise<RunAIResult> {
  const { prompt } = opts;
  const reasoning = opts.reasoningEffort || DEFAULT_REASONING;
  const verbosity = opts.verbosity || DEFAULT_VERBOSITY;
  const temp = opts.temperature ?? 0.2;
  // Use env chain if provided, else default to public stable sequence.
  const chain: string[] = (MODEL_CHAIN.length ? MODEL_CHAIN : ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini']).filter(Boolean);
  const tried: string[] = [];
  const startAll = Date.now();
  const c = getOpenAI();

  let lastErr: Error | unknown;
  for (const model of chain) {
    tried.push(model);
    let supportsReasoning = /gpt-4\.1|gpt-4o|o1|o3|reason/i.test(model);
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        if ((c as OpenAI).responses) {
          const body: Record<string, unknown> = { model, input: prompt, temperature: temp };
          if (supportsReasoning) {
            body.reasoning = { effort: reasoning };
            body.text = { verbosity };
          }
          const r = await (c as OpenAI & { responses: { create: (body: Record<string, unknown>) => Promise<{ output_text?: string; content?: Array<{ text?: { value: string } }> }> } }).responses.create(body);
          const text = r.output_text || r.content?.map((p) => p.text?.value).join('\n') || '';
          return { model, modelsTried: [...tried], ms: Date.now() - startAll, text: text.trim() };
        }
        // Chat completions fallback
        const completion = await c.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: 'You are a concise assistant. Return only the requested output.' },
            { role: 'user', content: prompt }
          ],
          temperature: temp,
          max_completion_tokens: opts.maxOutputTokens || 1200
        });
        const text = completion.choices[0]?.message?.content?.trim() || '';
        if (!text) throw new Error('Empty response');
        return { model, modelsTried: [...tried], ms: Date.now() - startAll, text };
      } catch (e: unknown) {
        lastErr = e;
        const msg = e instanceof Error ? e.message : String(e);
        // If unsupported parameter and we attempted reasoning, retry once without reasoning
        if (attempt === 0 && /Unsupported parameter: 'reasoning\.effort'/.test(msg)) {
          supportsReasoning = false; // disable and retry
          continue;
        }
        // If chat param name issue, allow fallback by trying without custom tokens
        if (attempt === 0 && /Unsupported parameter: 'max_tokens'/.test(msg)) {
          continue;
        }
        // On model-specific or unsupported parameter errors -> break inner loop and try next model
        if ((e as { status?: number }).status === 400 && /(model|Unsupported parameter)/i.test(msg)) {
          break; // go to next model in outer loop
        }
        // Other errors -> abort entirely
        return Promise.reject(e);
      }
    }
  }
  throw new Error(`All models failed (${tried.join(' -> ')}). Last error: ${lastErr instanceof Error ? lastErr.message : String(lastErr)}`);
}
