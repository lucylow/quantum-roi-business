import type { OptimizationInput } from '../domain';
import { stableHash } from '../utils';

export function stableRunId(input: OptimizationInput, prefix = 'run'): string {
  const material = [
    input.problem.id,
    input.solver,
    input.seed,
    input.iterations,
    JSON.stringify(input.scenarioData),
  ].join('|');
  return `${prefix}_${stableHash(material)}`;
}
