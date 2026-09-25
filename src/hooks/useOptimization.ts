import { useCallback, useEffect, useRef, useState } from 'react';
import type { OptimizationInput, OptimizationResult } from '../domain';
import { optimizeWithFallback } from '../services/api';
import { validateOptimizationInput } from '../core/inputGuards';

export function useOptimization() {
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => () => { mountedRef.current = false; }, []);

  const run = useCallback(async (input: OptimizationInput) => {
    const validation = validateOptimizationInput(input);
    if (validation.length) {
      const message = validation.map(item => item.message).join(' ');
      setError(message);
      throw new Error(message);
    }
    setBusy(true);
    setError(null);
    try {
      const next = await optimizeWithFallback(input);
      if (!mountedRef.current) return next;
      setResult(next);
      return next;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Optimization failed.';
      if (mountedRef.current) setError(message);
      throw err;
    } finally {
      if (mountedRef.current) setBusy(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, busy, error, run, clear };
}
