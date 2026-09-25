import type { OptimizationInput, OptimizationResult } from '../domain';
import { buildAudit, type AuditRecord } from './audit';
import { assertSafeOptimizationResult } from './resultGuard';
import { assertValidOptimizationInput } from './inputGuards';

export interface OptimizationEnvelope {
  input: OptimizationInput;
  result: OptimizationResult;
  audit: AuditRecord;
  createdAt: string;
}

export function createOptimizationEnvelope(input: OptimizationInput, result: OptimizationResult): OptimizationEnvelope {
  assertValidOptimizationInput(input);
  const safeResult = assertSafeOptimizationResult(result);
  return {
    input,
    result: safeResult,
    audit: buildAudit(input, safeResult),
    createdAt: new Date().toISOString(),
  };
}
