import type { OptimizationInput, OptimizationResult } from '../domain';
import { runLocalOptimization } from '../core/optimizer';
import { runtimeConfig } from '../config';
import { requestJson } from './http';
import { assertSafeOptimizationResult } from '../core/resultGuard';

export interface HealthResponse {
  ok: boolean;
  service: string;
  version: string;
}

export async function optimizeViaServer(input: OptimizationInput): Promise<OptimizationResult> {
  const result = await requestJson<OptimizationResult>(runtimeConfig.apiBaseUrl, '/v1/optimize', {
    method: 'POST',
    body: JSON.stringify(input),
  }, { timeoutMs: 20_000, retries: 1 });
  return assertSafeOptimizationResult(result);
}

export async function getHealth(): Promise<HealthResponse> {
  return requestJson<HealthResponse>(runtimeConfig.apiBaseUrl, '/health', { method: 'GET' }, { timeoutMs: 5_000, retries: 0 });
}

export async function optimizeWithFallback(input: OptimizationInput): Promise<OptimizationResult> {
  if (!runtimeConfig.apiBaseUrl) {
    const local = runLocalOptimization(input);
    return { ...local, status: 'fallback', notes: [...local.notes, 'Local-first mode: no remote API endpoint configured.'] };
  }

  try {
    return await optimizeViaServer(input);
  } catch (error) {
    const local = runLocalOptimization(input);
    const reason = error instanceof Error ? error.message.slice(0, 180) : 'Remote service unavailable.';
    return { ...local, status: 'fallback', notes: [...local.notes, `Remote optimization unavailable; local deterministic fallback used. ${reason}`] };
  }
}
