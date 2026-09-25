import { Share } from 'react-native';
import type { OptimizationResult } from '../domain';
import type { AuditRecord } from '../core/audit';

export async function shareExperimentBrief(args: {
  title: string;
  domain: string;
  result: OptimizationResult;
  audit?: AuditRecord | null;
}) {
  const { title, domain, result, audit } = args;
  const denominator = Math.max(Math.abs(result.baselineObjective), Number.EPSILON);
  const improvementPct = result.objectiveDirection === 'minimize'
    ? ((result.baselineObjective - result.objective) / denominator) * 100
    : ((result.objective - result.baselineObjective) / denominator) * 100;
  const feasible = result.violations.length === 0;
  const message = [
    `Quantum ROI Business — ${title}`,
    '',
    `Problem: ${domain}`,
    `Solver: ${result.solver}`,
    `Best objective: ${result.objective.toFixed(2)}`,
    `Baseline objective: ${result.baselineObjective.toFixed(2)}`,
    `Improvement: ${improvementPct.toFixed(1)}%`,
    `Feasibility: ${feasible ? 'PASS' : 'REVIEW'}`,
    '',
    'Decision record:',
    'Use classical optimization as the benchmark, expose constraints and assumptions, and escalate to quantum hardware only when the experiment is justified.',
    ...(audit ? ['', `Model hash: ${audit.modelHash}`, `Input hash: ${audit.inputHash}`, `Result hash: ${audit.resultHash}`, `Seed: ${audit.seed}`] : []),
  ].join('\n');

  return Share.share({ title, message });
}
