import { useCallback, useState } from 'react';
import type { OptimizationInput, OptimizationResult } from '../domain';
import { optimizeWithFallback } from '../services/api';

export function useOptimization() {
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (input: OptimizationInput) => {
    setBusy(true);
    setError(null);
    try {
      const next = await optimizeWithFallback(input);
      setResult(next);
      return next;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Optimization failed.';
      setError(message);
      throw err;
    } finally {
      setBusy(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, busy, error, run, clear };
}
