import type { OptimizationInput, OptimizationResult } from '../domain';
import { validateOptimizationInput } from '../core/inputGuards';
import { optimizeWithFallback } from './api';
import { assertSafeOptimizationResult } from '../core/resultGuard';
import { recordError } from '../platform/errorReporting';

export interface OptimizationServiceResult {
  result: OptimizationResult | null;
  error: string | null;
  validation: string[];
}

export async function executeOptimization(input: OptimizationInput): Promise<OptimizationServiceResult> {
  const validation = validateOptimizationInput(input).map(issue => issue.message);
  if (validation.length) return { result: null, error: validation.join(' '), validation };

  try {
    const raw = await optimizeWithFallback(input);
    const result = assertSafeOptimizationResult(raw);
    return { result, error: null, validation: [] };
  } catch (error) {
    recordError(error, { scope: 'optimization-service', operation: 'executeOptimization' });
    return {
      result: null,
      error: error instanceof Error ? error.message : 'Optimization failed safely.',
      validation: [],
    };
  }
}
