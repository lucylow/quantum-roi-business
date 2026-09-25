import type { OptimizationInput, OptimizationProblem, QuboModel } from '../domain';
import { buildDomainQubo } from '../core/quboDomain';
import { canonicalQubo, quboDensity, validateQuboDeep } from '../core/quboValidation';
import { stableHash } from '../utils';

export interface QuboSnapshot {
  model: QuboModel;
  warnings: string[];
  valid: boolean;
  fingerprint: string;
}

export function createQuboSnapshot(problem: OptimizationProblem, scenarioData: OptimizationInput['scenarioData']): QuboSnapshot {
  const model = canonicalQubo(buildDomainQubo(problem, scenarioData));
  const issues = validateQuboDeep(model);
  const warnings = issues.filter(issue => issue.severity === 'warning').map(issue => issue.message);
  return {
    model,
    warnings,
    valid: !issues.some(issue => issue.severity === 'error'),
    fingerprint: stableHash(JSON.stringify({ model, density: quboDensity(model) })),
  };
}
