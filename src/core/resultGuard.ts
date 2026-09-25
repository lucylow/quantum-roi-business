import type { OptimizationResult } from '../domain';
import { validateResult, validationSummary } from './modelValidation';
import { finiteNumber } from './safeNumber';

export function sanitizeOptimizationResult(result: OptimizationResult): OptimizationResult {
  const safe: OptimizationResult = {
    ...result,
    objective: finiteNumber(result.objective),
    baselineObjective: finiteNumber(result.baselineObjective),
    durationMs: Math.max(0, finiteNumber(result.durationMs)),
    metrics: Array.isArray(result.metrics) ? result.metrics : [],
    decisions: Array.isArray(result.decisions) ? result.decisions : [],
    trace: Array.isArray(result.trace) ? result.trace : [],
    violations: Array.isArray(result.violations) ? result.violations.filter(Boolean).slice(0, 250) : [],
    notes: Array.isArray(result.notes) ? result.notes.filter(Boolean).slice(0, 100) : [],
  };
  return safe;
}

export function assertSafeOptimizationResult(result: OptimizationResult): OptimizationResult {
  const safe = sanitizeOptimizationResult(result);
  const issues = validateResult(safe);
  const summary = validationSummary(issues);
  if (summary.errors > 0) throw new Error(`Optimization result failed validation (${summary.errors} error(s)).`);
  return safe;
}
