import type { OptimizationInput, OptimizationResult } from '../domain';
import { runLocalOptimization } from '../core/optimizer';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8787';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) }
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API ${response.status}: ${body.slice(0, 300)}`);
  }
  return response.json() as Promise<T>;
}

export async function optimizeViaServer(input: OptimizationInput): Promise<OptimizationResult> {
  return request<OptimizationResult>('/v1/optimize', { method: 'POST', body: JSON.stringify(input) });
}

export async function getHealth(): Promise<{ ok: boolean; service: string; version: string }> {
  return request('/health');
}

export async function optimizeWithFallback(input: OptimizationInput): Promise<OptimizationResult> {
  try {
    return await optimizeViaServer(input);
  } catch {
    const local = runLocalOptimization(input);
    return { ...local, status: 'fallback', notes: [...local.notes, 'Server unavailable; used local deterministic solver.'] };
  }
}
