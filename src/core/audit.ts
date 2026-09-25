import type { OptimizationInput, OptimizationResult } from '../domain';
import { stableHash } from '../utils';

export interface AuditRecord {
  modelHash: string;
  inputHash: string;
  resultHash: string;
  seed: number;
  iterations: number;
  solver: string;
  createdAt: string;
  warnings: string[];
}

export function buildAudit(input: OptimizationInput, result: OptimizationResult): AuditRecord {
  const inputJson = JSON.stringify(input, Object.keys(input).sort());
  const resultJson = JSON.stringify(result, Object.keys(result).sort());
  const modelHash = stableHash(JSON.stringify(input.problem));
  const warnings: string[] = [];
  if (result.status === 'fallback') warnings.push('Server execution failed and a local fallback was used.');
  if (result.solver === 'quantumMock') warnings.push('No quantum processor was used for this run.');
  if (result.violations.length) warnings.push('The returned decision set includes feasibility violations.');
  return { modelHash, inputHash: stableHash(inputJson), resultHash: stableHash(resultJson), seed: input.seed, iterations: input.iterations, solver: result.solver, createdAt: new Date().toISOString(), warnings };
}
