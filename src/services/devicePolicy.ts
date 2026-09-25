import type { QuboModel, QuantumReadiness } from '../domain';
import { quboDensity, validateQuboDeep } from '../core/quboValidation';

export interface DevicePolicy {
  allowed: boolean;
  reason: string;
  maxLogicalVariables: number;
  recommendedShots: number;
}

const DEFAULT_MAX = 28;

export function evaluateDevicePolicy(model: QuboModel, readiness: QuantumReadiness): DevicePolicy {
  const errors = validateQuboDeep(model).filter(issue => issue.severity === 'error');
  if (errors.length) return { allowed: false, reason: 'QUBO validation failed.', maxLogicalVariables: DEFAULT_MAX, recommendedShots: 0 };
  if (model.n > DEFAULT_MAX) return { allowed: false, reason: `Reduce the logical problem from ${model.n} to ${DEFAULT_MAX} variables or fewer before requesting hardware.`, maxLogicalVariables: DEFAULT_MAX, recommendedShots: 0 };
  if (quboDensity(model) > 0.85) return { allowed: false, reason: 'Dense coupling graph requires additional embedding review.', maxLogicalVariables: DEFAULT_MAX, recommendedShots: 0 };
  if (readiness.category === 'classical-first') return { allowed: false, reason: 'Current model is flagged classical-first; hardware testing should be justified with a reproducible benchmark.', maxLogicalVariables: DEFAULT_MAX, recommendedShots: 0 };
  return { allowed: true, reason: 'Model passed the local device policy.', maxLogicalVariables: DEFAULT_MAX, recommendedShots: 1_000 };
}
